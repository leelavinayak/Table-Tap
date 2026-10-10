const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] Missing SMTP config (need SMTP_HOST/SMTP_USER/SMTP_PASS in server/.env). Emails will be skipped.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for 587
    requireTLS: Number(SMTP_PORT) !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, '') },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 10000
  });
  return transporter;
}

async function verifyMailer() {
  const tx = getTransporter();
  if (!tx) return { ok: false, error: 'SMTP not configured (server/.env missing SMTP_HOST/SMTP_USER/SMTP_PASS)', fix: 'Create server/.env with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL and restart server.' };
  try {
    await tx.verify();
    return { ok: true };
  } catch (err) {
    transporter = null; // allow retry after .env fix without stale auth
    const msg = err.message || String(err);
    let fix = '';
    if (/535|Username and Password not accepted|BadCredentials/i.test(msg)) {
      fix = 'Gmail rejected login. This is ALWAYS an App-Password issue: 1) Google Account → Security → 2-Step Verification ON. 2) Security → App passwords → create new Mail password. 3) Copy 16 chars into server/.env SMTP_PASS (no spaces needed). 4) Ensure SMTP_USER is the same Gmail account. 5) Restart server. Old/revoked passwords give exactly this 535 error.';
    }
    return { ok: false, error: msg, fix };
  }
}

async function sendMail({ to, subject, text, html, attachments }) {
  const tx = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@tabletap.local';
  if (!tx) {
    const msg = `No SMTP configured. Would send to=${to} subject=${subject}`;
    console.log(`[mailer:skipped] ${msg}`);
    return { skipped: true, error: msg };
  }
  if (!to) throw new Error('sendMail: missing "to" address');
  const info = await tx.sendMail({ from, to, subject, text, html, attachments });
  console.log(`[mailer:sent] to=${to} messageId=${info.messageId}`);
  return { sent: true, messageId: info.messageId };
}

function logoAttachment(logoImage, filename = 'restaurant-logo') {
  try {
    if (!logoImage || typeof logoImage !== 'string' || !logoImage.startsWith('data:image')) return null;
    const match = logoImage.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) return null;
    const ext = match[1].split('/')[1] || 'png';
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) return null; // skip huge files
    return { filename: `${filename}.${ext}`, content: buffer, contentType: match[1] };
  } catch {
    return null;
  }
}

module.exports = { sendMail, logoAttachment, verifyMailer, getTransporter };
