const express = require('express');
const fs = require('fs');
const path = require('path');
const Lead = require('../models/Lead');
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

// POST /api/leads { restaurantName, email, phone, city, tables, gst, logoImage }
router.post('/', async (req, res) => {
  const { restaurantName, email, phone = '', city = '', tables = '', gst = '', logoImage = '' } = req.body;
  if (!restaurantName || !email) return res.status(400).json({ error: 'Restaurant name and email required' });
  try {
    let lead;
    if (mongoose.connection.readyState === 1) {
      lead = await Lead.create({ restaurantName, email, phone, city, tables, gst, logoImage });
    } else {
      lead = { restaurantName, email, phone, city, tables, gst, _id: 'demo-' + Date.now() };
    }

    const emailStatus = { restaurant: null, admin: null };
    const hasLogo = Boolean(logoImage && logoImage.startsWith('data:image'));

    // 1) Email to the restaurant (awaited so failures are visible)
    // Palette: https://coolors.co/palette/f8f9fa-e9ecef-dee2e6-ced4da-adb5bd-6c757d-495057-343a40-212529
    try {
      const brandLogo = getBrandLogoAttachment();
      const brandImg = brandLogo
        ? `<img src="cid:tabletaplogo" alt="Table Tap" width="120" style="display:block;margin:0 auto;height:auto;max-width:160px;background:#f8f9fa;border-radius:12px;padding:6px 10px;" />`
        : `<div style="font-size:26px;font-weight:800;letter-spacing:0.5px;color:#f8f9fa;margin:0;">Table Tap</div>`;
      emailStatus.restaurant = await sendMail({
        to: email,
        subject: 'Thank you for joining as a Partner – Table Tap',
        text: `Dear ${restaurantName},\n\nThanks for joining as a Partner on Table Tap!\n\nYour logo is going to be added within 24 hours on our site. Thank you.\n\nWe will inform you to register for the access — Coming Soon. Thank you.\n\n— Team Table Tap`,
        html: `
          <div style="background:#e9ecef;padding:24px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dee2e6;border-radius:14px;overflow:hidden;">
              <div style="background:#212529;padding:28px 24px 22px;text-align:center;">
                ${brandImg}
                <p style="margin:12px 0 0;color:#adb5bd;font-weight:bold;letter-spacing:3px;font-size:11px;">JOIN AS A PARTNER</p>
              </div>
              <div style="background:#ffffff;padding:26px 24px;color:#212529;">
                <p style="margin:0 0 10px;font-size:14px;">Dear ${esc(restaurantName)},</p>
                <p style="margin:0 0 10px;font-size:14px;">Thanks for joining as a Partner on Table Tap!</p>
                <p style="margin:0 0 10px;font-size:14px;">Your logo is going to be added within the coming 24 hours on our site. Thank you.</p>
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
      emailStatus.restaurant = { error: mailErr.message, outbox: saveOutbox({ restaurantName, email, phone, city, tables, gst, logoImage, type: 'restaurant-email-failed' }) };
    }

    // 2) Message to admin
    const adminMail = process.env.ADMIN_EMAIL;
    if (adminMail) {
      try {
        const safe = String(restaurantName || 'restaurant').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40) || 'restaurant';
        const attach = logoAttachment(logoImage, safe);
        emailStatus.admin = await sendMail({
          to: adminMail,
          subject: `New Partner Registration – ${restaurantName}`,
          text: `New Join-as-Partner submission:\n\nRestaurant: ${restaurantName}\nEmail: ${email}\nPhone: ${phone}\nCity: ${city}\nTables: ${tables}\nGST: ${gst}\nLogo received: ${hasLogo ? 'Yes' : 'No'}\nTime: ${new Date().toISOString()}`,
          html: `
            <div style="background:#e9ecef;padding:24px;font-family:Arial,Helvetica,sans-serif;">
              <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dee2e6;border-radius:14px;overflow:hidden;">
                <div style="background:#212529;padding:18px 24px;">
                  <p style="margin:0;color:#f8f9fa;font-size:15px;font-weight:800;">New Join-as-Partner submission</p>
                  <p style="margin:4px 0 0;color:#adb5bd;font-size:12px;">${esc(restaurantName)} · ${new Date().toISOString()}</p>
                </div>
                <div style="padding:20px 24px;">
                  <ul style="margin:0;padding:0;list-style:none;font-size:14px;color:#212529;line-height:1.9;">
                    <li><b>Restaurant:</b> ${esc(restaurantName)}</li>
                    <li><b>Email:</b> ${esc(email)}</li>
                    <li><b>Phone:</b> ${esc(phone)}</li>
                    <li><b>City:</b> ${esc(city)}</li>
                    <li><b>Tables:</b> ${esc(tables)}</li>
                    <li><b>GST:</b> ${esc(gst)}</li>
                    <li><b>Logo received:</b> ${hasLogo ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
                <div style="background:#343a40;padding:12px 24px;">
                  <p style="margin:0;font-size:11px;color:#e9ecef;">Logo file is attached${hasLogo ? '' : ' (none received)'} — add it on the Partners page manually.</p>
                </div>
              </div>
            </div>`,
          attachments: attach ? [attach] : undefined
        });
      } catch (mailErr) {
        console.warn('Admin email failed:', mailErr.message);
        emailStatus.admin = { error: mailErr.message, outbox: saveOutbox({ restaurantName, email, phone, city, tables, gst, logoImage, type: 'admin-email-failed' }) };
      }
    } else {
      console.log('[mailer] ADMIN_EMAIL not set — skipping admin notification');
      emailStatus.admin = { skipped: true, error: 'ADMIN_EMAIL not set in server/.env' };
    }

    return res.status(201).json({ ok: true, lead, emails: emailStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
