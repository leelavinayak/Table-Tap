const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Lead = require('../models/Lead');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
const { sendMail, logoAttachment, verifyMailer } = require('../utils/mailer');

const router = express.Router();

// Brand logo for emails (works locally + on Render where only server/ is deployed).
// Logo copied to server/assets/Table_Tap_Logo.png so it ships with the backend.
function getBrandLogoAttachment() {
  try {
    const candidates = [
      path.join(__dirname, '..', 'assets', 'Table_Tap_Logo.png'),
      path.join(__dirname, '..', '..', 'client', 'public', 'Table_Tap_Logo.png')
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return { filename: 'table-tap-logo.png', path: p, cid: 'tabletaplogo', contentType: 'image/png' };
      }
    }
  } catch {}
  return null;
}

function generateRestaurantId() {
  // 12-digit numeric ID, first digit 1-9 so it is always 12 digits
  let id = String(crypto.randomInt(1, 10));
  for (let i = 1; i < 12; i++) id += String(crypto.randomInt(0, 10));
  return id;
}

async function generateUniqueRestaurantId() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateRestaurantId();
    if (mongoose.connection.readyState !== 1) return id;
    try {
      const exists = await Lead.exists({ restaurantId: id });
      if (!exists) return id;
    } catch {
      return id;
    }
  }
  return generateRestaurantId();
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function saveOutbox(data) {
  try {
    const dir = path.join(__dirname, '..', 'outbox');
    fs.mkdirSync(dir, { recursive: true });
    const safe = String(data.restaurantName || 'restaurant').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40) || 'restaurant';
    const file = path.join(dir, `${Date.now()}-${safe}.json`);
    const { logoImage, ...rest } = data;
    // save logo separately to keep JSON small
    let logoFile = null;
    if (logoImage && logoImage.startsWith('data:image')) {
      const m = logoImage.match(/^data:(image\/\w+);base64,(.+)$/);
      if (m) {
        const ext = m[1].split('/')[1] || 'png';
        logoFile = `${Date.now()}-${safe}.${ext}`;
        fs.writeFileSync(path.join(dir, logoFile), Buffer.from(m[2], 'base64'));
      }
    }
    fs.writeFileSync(file, JSON.stringify({ ...rest, logoFile, savedAt: new Date().toISOString() }, null, 2));
    console.log(`[outbox] saved ${file}`);
    return file;
  } catch (e) {
    console.warn('[outbox] save failed:', e.message);
    return null;
  }
}

// GET /api/leads/test-email?to=someone@example.com — verify SMTP config
router.get('/test-email', async (req, res) => {
  const to = req.query.to || process.env.ADMIN_EMAIL;
  if (!to) return res.status(400).json({ ok: false, error: 'Provide ?to=email or set ADMIN_EMAIL in server/.env' });
  const v = await verifyMailer();
  if (!v.ok) return res.status(500).json({ ok: false, step: 'verify', error: v.error, fix: v.fix });
  try {
    const r = await sendMail({
      to,
      subject: 'Table Tap SMTP test',
      text: 'SMTP is working. You will now receive Join-as-Partner emails.',
      html: '<p>SMTP is working. You will now receive Join-as-Partner emails.</p>'
    });
    res.json({ ok: true, ...r });
  } catch (err) {
    res.status(500).json({ ok: false, step: 'send', error: err.message, fix: 'If 535/BadCredentials, regenerate Gmail App Password (see verify fix).' });
  }
});

// POST /api/leads { restaurantName, email, phone, address, state, pincode, partnerRestaurantId?, source?, city, tables, gst }
// source 'add-restaurant' = Add Restaurant form (optional 12-digit partner ID, no new ID minted).
// anything else = Join-as-Partner flow (backend mints a 12-digit Restaurant ID).
router.post('/', async (req, res) => {
  const { restaurantName, email, phone = '', address = '', state = '', pincode = '', partnerRestaurantId = '', source = '', city = '', tables = '', gst = '', logoImage = '' } = req.body;
  if (!restaurantName || !email) return res.status(400).json({ error: 'Restaurant name and email required' });
  if (!address || !String(address).trim()) return res.status(400).json({ error: 'Restaurant address required' });
  if (!state || !String(state).trim()) return res.status(400).json({ error: 'State selection required' });
  if (!/^\d{6}$/.test(String(pincode || '').trim())) return res.status(400).json({ error: 'Enter a valid 6-digit pincode' });
  const cleanAddress = String(address).trim().slice(0, 500);
  const cleanState = String(state).trim().slice(0, 100);
  const cleanPincode = String(pincode).trim();
  const givenPartnerId = String(partnerRestaurantId || '').trim();
  if (givenPartnerId && !/^\d{12}$/.test(givenPartnerId)) return res.status(400).json({ error: 'Restaurant ID must be 12 digits, or leave it blank' });
  const isAddRestaurant = source === 'add-restaurant';
  // Duplicate guard: one registration per restaurant email. If this email
  // already registered, stop with 409 so the user sees "already registered"
  // instead of creating a second record / second Restaurant ID.
  const emailKey = String(email).trim();
  const escRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const existing = await Lead.findOne({
      email: { $regex: `^${escRegex(emailKey)}$`, $options: 'i' }
    }).lean();
    if (existing) {
      const existingId = existing.restaurantId ? ` Your 12-digit Restaurant ID is ${existing.restaurantId} — it was already sent to this email.` : ' Our team already has your details and will contact you shortly.';
      return res.status(409).json({
        error: `This restaurant email (${existing.email}) is already registered.${existingId}`,
        persisted: false,
        duplicate: true,
        restaurantId: existing.restaurantId || undefined,
        lead: existing
      });
    }
  } catch (dupErr) {
    // DB down here just means the duplicate check couldn't run — the real
    // Lead.create below will fail fast and return 503 (not saved).
    if (mongoose.connection.readyState !== 1) {
      console.warn('[leads] duplicate check skipped (DB not connected):', dupErr.message);
    } else {
      console.warn('[leads] duplicate check failed:', dupErr.message);
    }
  }
  try {
    let restaurantId = null;
    let partnerMatch = null;
    let lead;
    // Always attempt a real DB write first. With bufferCommands=false a
    // disconnected Mongo throws immediately instead of hanging — we turn
    // that into a 503 (NOT a fake 201) so the frontend never shows
    // "Registered!" when nothing was stored.
    const dbUp = () => mongoose.connection.readyState === 1;
    if (isAddRestaurant) {
      // Optional partner ID: verify it against existing partner records (when DB is up).
      if (givenPartnerId && dbUp()) {
        try {
          partnerMatch = await Lead.findOne({ restaurantId: givenPartnerId }).lean();
        } catch { partnerMatch = null; }
      }
      const doc = { restaurantName, email, phone, address: cleanAddress, state: cleanState, pincode: cleanPincode, partnerRestaurantId: givenPartnerId, source: 'add-restaurant', city, tables, gst };
      try {
        lead = await Lead.create(doc);
      } catch (dbErr) {
        console.error('[leads] DB write failed (add-restaurant):', dbErr.message);
        saveOutbox({ ...doc, type: 'db-unavailable' });
        return res.status(503).json({
          error: 'Database unavailable — details NOT saved. Check server terminal for MongoDB errors and ensure MONGO_URI is set, then retry.',
          detail: dbErr.message,
          persisted: false,
          demoMode: !dbUp()
        });
      }
      // Mirror into restaurants collection so the venue shows up in
      // GET /api/restaurants + Partner Network.
      try {
        await Restaurant.findOneAndUpdate(
          { email: String(email).toLowerCase(), name: restaurantName },
          {
            $set: {
              name: restaurantName, email, phone,
              address: cleanAddress, state: cleanState, pincode: cleanPincode,
              city, tables, gst,
              location: cleanAddress || city || '',
              partnerRestaurantId: givenPartnerId,
              source: 'add-restaurant',
              category: 'Partner'
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (syncErr) {
        console.warn('[leads] restaurant sync failed (add-restaurant):', syncErr.message);
      }
    } else {
      restaurantId = await generateUniqueRestaurantId();
      const doc = { restaurantName, email, phone, address: cleanAddress, state: cleanState, pincode: cleanPincode, restaurantId, source: 'partner', city, tables, gst, logoImage };
      try {
        lead = await Lead.create(doc);
      } catch (dbErr) {
        console.error('[leads] DB write failed (partner):', dbErr.message);
        saveOutbox({ ...doc, type: 'db-unavailable' });
        return res.status(503).json({
          error: 'Database unavailable — details NOT saved and no Restaurant ID was reserved. Check server terminal for MongoDB errors and ensure MONGO_URI is set, then retry.',
          detail: dbErr.message,
          persisted: false,
          demoMode: !dbUp()
        });
      }
      // Mirror partner into restaurants collection (upsert by 12-digit ID)
      // so GET /api/restaurants includes newly registered partners.
      try {
        await Restaurant.findOneAndUpdate(
          { restaurantId },
          {
            $set: {
              name: restaurantName, email, phone,
              address: cleanAddress, state: cleanState, pincode: cleanPincode,
              city, tables, gst, logoImage,
              image: logoImage || '',
              location: cleanAddress || city || '',
              restaurantId,
              source: 'partner',
              category: 'Partner'
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (syncErr) {
        console.warn('[leads] restaurant sync failed (partner):', syncErr.message);
      }
    }

    const emailStatus = { restaurant: null, admin: null };

    // 1) Email to the restaurant (awaited so failures are visible) — includes 12-digit Restaurant ID
    // Palette: https://coolors.co/palette/f8f9fa-e9ecef-dee2e6-ced4da-adb5bd-6c757d-495057-343a40-212529
    try {
      const brandLogo = getBrandLogoAttachment();
      const brandImg = brandLogo
        ? `<img src="cid:tabletaplogo" alt="Table Tap" width="120" style="display:block;margin:0 auto;height:auto;max-width:160px;background:#f8f9fa;border-radius:12px;padding:6px 10px;" />`
        : `<div style="font-size:26px;font-weight:800;letter-spacing:0.5px;color:#f8f9fa;margin:0;">Table Tap</div>`;
      emailStatus.restaurant = await sendMail({
        to: email,
        subject: isAddRestaurant ? 'Thank you – Table Tap received your restaurant details' : `Thank you for joining as a Partner – Your Restaurant ID ${restaurantId}`,
        text: isAddRestaurant
          ? `Dear ${restaurantName},\n\nThanks for adding your restaurant on Table Tap!\n\nWe have received your details and our team will contact you shortly.\n\nRestaurant: ${restaurantName}\nAddress: ${cleanAddress}\nState: ${cleanState}\nPincode: ${cleanPincode}\n${givenPartnerId ? `Partner Restaurant ID on record: ${givenPartnerId}\n` : ''}\nWe will inform you to register for the access — Coming Soon. Thank you.\n\n— Team Table Tap`
          : `Dear ${restaurantName},\n\nThanks for joining as a Partner on Table Tap!\n\nYour 12-digit Restaurant ID is: ${restaurantId}\n\nPlease keep this ID safe — you will need it for registration/access.\n\nRestaurant: ${restaurantName}\nAddress: ${cleanAddress}\nState: ${cleanState}\nPincode: ${cleanPincode}\n\nWe will inform you to register for the access — Coming Soon. Thank you.\n\n— Team Table Tap`,
        html: `
          <div style="background:#e9ecef;padding:24px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dee2e6;border-radius:14px;overflow:hidden;">
              <div style="background:#212529;padding:28px 24px 22px;text-align:center;">
                ${brandImg}
                <p style="margin:12px 0 0;color:#adb5bd;font-weight:bold;letter-spacing:3px;font-size:11px;">${isAddRestaurant ? 'ADD RESTAURANT' : 'JOIN AS A PARTNER'}</p>
              </div>
              <div style="background:#ffffff;padding:26px 24px;color:#212529;">
                <p style="margin:0 0 10px;font-size:14px;">Dear ${esc(restaurantName)},</p>
                ${isAddRestaurant
                  ? `<p style="margin:0 0 10px;font-size:14px;">Thanks for adding your restaurant on Table Tap! We have received your details and our team will contact you shortly.</p>
                ${givenPartnerId ? `<div style="margin:14px 0;padding:16px;background:#f8f9fa;border:1px dashed #adb5bd;border-radius:10px;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#6c757d;letter-spacing:1px;font-weight:bold;">PARTNER RESTAURANT ID ON RECORD</p>
                  <p style="margin:6px 0 0;font-size:28px;font-weight:800;letter-spacing:4px;color:#212529;">${esc(givenPartnerId)}</p>
                </div>` : ''}`
                  : `<p style="margin:0 0 10px;font-size:14px;">Thanks for joining as a Partner on Table Tap!</p>
                <div style="margin:14px 0;padding:16px;background:#f8f9fa;border:1px dashed #adb5bd;border-radius:10px;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#6c757d;letter-spacing:1px;font-weight:bold;">YOUR 12-DIGIT RESTAURANT ID</p>
                  <p style="margin:6px 0 0;font-size:28px;font-weight:800;letter-spacing:4px;color:#212529;">${esc(restaurantId)}</p>
                </div>
                <p style="margin:10px 0 6px;font-size:14px;">Please keep this ID safe — you will need it for registration/access.</p>`}
                <p style="margin:0 0 6px;font-size:14px;">We will inform you to register for the access — Coming Soon. Thank you.</p>
                <p style="margin:16px 0 0;font-size:14px;">— Team Table Tap</p>
              </div>
              <div style="background:#343a40;padding:14px 24px;text-align:center;">
                <p style="margin:0;font-size:11px;color:#e9ecef;">Table Tap - Empowering diners to scan the interactive QR stand</p>
              </div>
            </div>
            <p style="max-width:560px;margin:12px auto 0;text-align:center;font-size:11px;color:#6c757d;">You received this email because ${esc(email)} registered as a Table Tap partner.</p>
          </div>`,
        attachments: brandLogo ? [brandLogo] : undefined
      });
    } catch (mailErr) {
      console.warn('Restaurant email failed:', mailErr.message);
      emailStatus.restaurant = { error: mailErr.message, outbox: saveOutbox({ restaurantName, email, phone, address: cleanAddress, state: cleanState, pincode: cleanPincode, restaurantId, partnerRestaurantId: givenPartnerId, source: isAddRestaurant ? 'add-restaurant' : 'partner', city, tables, gst, logoImage, type: 'restaurant-email-failed' }) };
    }

    // 2) Message to admin
    const adminMail = process.env.ADMIN_EMAIL;
    if (adminMail) {
      try {
        const safe = String(restaurantName || 'restaurant').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40) || 'restaurant';
        const attach = logoAttachment(logoImage, safe);
        const hasLogo = Boolean(logoImage && String(logoImage).startsWith('data:image'));
        emailStatus.admin = await sendMail({
          to: adminMail,
          subject: isAddRestaurant ? `New Add-Restaurant submission – ${restaurantName}${givenPartnerId ? ` – Partner ID ${givenPartnerId}` : ''}` : `New Partner Registration – ${restaurantName} – ID ${restaurantId}`,
          text: isAddRestaurant
            ? `New Add-Restaurant submission:\n\nRestaurant: ${restaurantName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${cleanAddress}\nState: ${cleanState}\nPincode: ${cleanPincode}\nPartner Restaurant ID (given): ${givenPartnerId || '—'}\nPartner record found: ${givenPartnerId ? (partnerMatch ? `Yes (${partnerMatch.restaurantName || ''})` : 'No') : '—'}\nCity: ${city}\nTables: ${tables}\nGST: ${gst}\nTime: ${new Date().toISOString()}`
            : `New Join-as-Partner submission:\n\nRestaurant: ${restaurantName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${cleanAddress}\nState: ${cleanState}\nPincode: ${cleanPincode}\nRestaurant ID: ${restaurantId}\nCity: ${city}\nTables: ${tables}\nGST: ${gst}\nTime: ${new Date().toISOString()}`,
          html: `
            <div style="background:#e9ecef;padding:24px;font-family:Arial,Helvetica,sans-serif;">
              <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dee2e6;border-radius:14px;overflow:hidden;">
                <div style="background:#212529;padding:18px 24px;">
                  <p style="margin:0;color:#f8f9fa;font-size:15px;font-weight:800;">${isAddRestaurant ? 'New Add-Restaurant submission' : 'New Join-as-Partner submission'}</p>
                  <p style="margin:4px 0 0;color:#adb5bd;font-size:12px;">${esc(restaurantName)} · ${isAddRestaurant ? (givenPartnerId ? `Partner ID ${esc(givenPartnerId)}` : 'no partner ID given') : `ID ${esc(restaurantId)}`} · ${new Date().toISOString()}</p>
                </div>
                <div style="padding:20px 24px;">
                  <ul style="margin:0;padding:0;list-style:none;font-size:14px;color:#212529;line-height:1.9;">
                    <li><b>Restaurant:</b> ${esc(restaurantName)}</li>
                    <li><b>Email:</b> ${esc(email)}</li>
                    <li><b>Phone:</b> ${esc(phone)}</li>
                    <li><b>Address:</b> ${esc(cleanAddress)}</li>
                    <li><b>State:</b> ${esc(cleanState)}</li>
                    <li><b>Pincode:</b> ${esc(cleanPincode)}</li>
                    ${isAddRestaurant
                      ? `<li><b>Partner Restaurant ID (given):</b> ${esc(givenPartnerId) || '—'}</li>
                    <li><b>Partner record found:</b> ${givenPartnerId ? (partnerMatch ? `Yes (${esc(partnerMatch.restaurantName || '')})` : 'No') : '—'}</li>`
                      : `<li><b>Restaurant ID:</b> ${esc(restaurantId)}</li>`}
                    <li><b>City:</b> ${esc(city)}</li>
                    <li><b>Tables:</b> ${esc(tables)}</li>
                    <li><b>GST:</b> ${esc(gst)}</li>
                  </ul>
                </div>
              </div>
            </div>`,
          attachments: attach ? [attach] : undefined
        });
      } catch (mailErr) {
        console.warn('Admin email failed:', mailErr.message);
        emailStatus.admin = { error: mailErr.message, outbox: saveOutbox({ restaurantName, email, phone, address: cleanAddress, state: cleanState, pincode: cleanPincode, restaurantId, partnerRestaurantId: givenPartnerId, source: isAddRestaurant ? 'add-restaurant' : 'partner', city, tables, gst, logoImage, type: 'admin-email-failed' }) };
      }
    } else {
      console.log('[mailer] ADMIN_EMAIL not set — skipping admin notification');
      emailStatus.admin = { skipped: true, error: 'ADMIN_EMAIL not set in server/.env' };
    }

    return res.status(201).json({ ok: true, lead, restaurantId: lead?.restaurantId || restaurantId || undefined, persisted: true, emails: emailStatus });
  } catch (err) {
    console.error('[leads] POST failed:', err.message);
    res.status(500).json({ error: err.message, persisted: false });
  }
});

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const leads = await Lead.find().sort({ createdAt: -1 }).limit(50);
      return res.json(leads);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
