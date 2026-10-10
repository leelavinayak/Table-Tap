const express = require('express');
const fs = require('fs');
const path = require('path');
const Lead = require('../models/Lead');
const mongoose = require('mongoose');
const { sendMail, logoAttachment, verifyMailer } = require('../utils/mailer');

const router = express.Router();

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
    try {
      emailStatus.restaurant = await sendMail({
        to: email,
        subject: 'Thank you for joining as a Partner – Table Tap',
        text: `Dear ${restaurantName},\n\nThanks for joining as a Partner on Table Tap!\n\nYour logo is going to be added within the coming 24 hours on our site. Thank you.\n\nWe will inform you to register for the access — Coming Soon. Thank you.\n\n— Team Table Tap`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
            <div style="background:#0c1014;color:#fff;padding:24px;text-align:center">
              <h2 style="margin:0">Table Tap</h2>
              <p style="margin:6px 0 0;color:#fbbf24;font-weight:bold;letter-spacing:2px;font-size:12px">JOIN AS A PARTNER</p>
            </div>
            <div style="padding:24px;color:#222">
              <p>Dear <b>${restaurantName}</b>,</p>
              <p>Thanks for joining as a Partner on Table Tap!</p>
              <p>Your logo is going to be added <b>within the coming 24 hours</b> on our site. Thank you.</p>
              <p>We will inform you to register for the access — <b>Coming Soon</b>. Thank you.</p>
              <p style="margin-top:20px">— Team Table Tap</p>
            </div>
          </div>`
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
            <h3>New Join-as-Partner submission</h3>
            <ul>
              <li><b>Restaurant:</b> ${restaurantName}</li>
              <li><b>Email:</b> ${email}</li>
              <li><b>Phone:</b> ${phone}</li>
              <li><b>City:</b> ${city}</li>
              <li><b>Tables:</b> ${tables}</li>
              <li><b>GST:</b> ${gst}</li>
              <li><b>Logo received:</b> ${hasLogo ? 'Yes' : 'No'}</li>
            </ul>`,
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
