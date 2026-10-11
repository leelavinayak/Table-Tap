const nodemailer = require('nodemailer');

let transporter = null;

function cleanUser(v) {
  return String(v || '').trim().replace(/^["']|["']$/g, '').trim();
}

function cleanPass(v) {
  // Gmail shows App Password as "xxxx xxxx xxxx xxxx" — spaces are display-only.
  // Also strip surrounding quotes if pasted from .env editors, and all whitespace.
  return String(v || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
}

function getTransporter() {
  if (transporter) return transporter;
  const SMTP_HOST = cleanUser(process.env.SMTP_HOST);
  const SMTP_PORT = String(process.env.SMTP_PORT || '587').trim();
  const SMTP_USER = cleanUser(process.env.SMTP_USER);
  const SMTP_PASS = cleanPass(process.env.SMTP_PASS);
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] Missing SMTP config (need SMTP_HOST/SMTP_USER/SMTP_PASS in server/.env). Emails will be skipped.');
    return null;
  }
  if (SMTP_PASS.length !== 16) {
    console.warn(`[mailer] SMTP_PASS length is ${SMTP_PASS.length}, expected 16 chars for a Gmail App Password. You may be using your normal Gmail password (wrong) or a truncated/revoked key.`);
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for 587
    requireTLS: Number(SMTP_PORT) !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
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
      const user = cleanUser(process.env.SMTP_USER);
      const passLen = cleanPass(process.env.SMTP_PASS).length;
      fix = `Gmail rejected login for ${user || '(no SMTP_USER)'} (pass length ${passLen}, want 16). Fix: 1) myaccount.google.com → Security → 2-Step Verification ON. 2) Search "App passwords" → create Mail password. 3) Put the 16 chars in server/.env SMTP_PASS. 4) SMTP_USER must equal the account that created it. 5) Restart server. Note: changing your Google password revokes old App Passwords; normal login password NEVER works for SMTP. Run: npm run setup-mail`;
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
