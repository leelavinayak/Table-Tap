// Usage: node scripts/setup-mail.js
// Prompts for Gmail + App Password, writes server/.env correctly, verifies SMTP.
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const nodemailer = require('nodemailer');

const envPath = path.join(__dirname, '..', '.env');

function ask(q, hide) {
  const rl = readline.createInterface({ input: process.stdin, output: hide ? undefined : process.stdout, terminal: true });
  return new Promise((resolve) => {
    if (!hide) return rl.question(q, (a) => { rl.close(); resolve(a.trim()); });
    process.stdout.write(q);
    let buf = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = (c) => {
      c = String(c);
      if (c === '\n' || c === '\r' || c === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.stdout.write('\n');
        rl.close();
        resolve(buf.trim());
      } else if (c === '\u0003') {
        process.exit(1);
      } else if (c === '\u007f') {
        buf = buf.slice(0, -1);
      } else {
        buf += c;
      }
    };
    process.stdin.on('data', onData);
  });
}

function loadEnv() {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

(async () => {
  console.log('\n=== Table Tap mail setup ===\n');
  console.log('You need a Gmail APP PASSWORD (not your normal password):');
  console.log('  1) Google Account → Security → 2-Step Verification → ON');
  console.log('  2) Security → App passwords → Mail / Other (TableTap) → Generate');
  console.log('  3) Copy the 16-letter code\n');

  const cur = loadEnv();
  const user = await ask(`Gmail address [${cur.SMTP_USER || 'you@gmail.com'}]: `) || cur.SMTP_USER || '';
  const pass = await ask('16-letter App Password (spaces ok): ', true);
  if (!user || !pass) { console.log('Both required. Aborted.'); process.exit(1); }
  const admin = await ask(`Admin notification email [${cur.ADMIN_EMAIL || user}]: `) || cur.ADMIN_EMAIL || user;

  console.log('\nVerifying with Gmail...');
  const tx = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 587, secure: false, requireTLS: true,
    auth: { user, pass: pass.replace(/\s+/g, '') },
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000
  });
  try {
    await tx.verify();
    console.log('✓ Login OK — Gmail accepted the App Password.');
  } catch (e) {
    console.log('\n✗ Gmail rejected it: ' + e.message);
    console.log('\nFix checklist:');
    console.log('  - 2-Step Verification must be ON (else App passwords menu is hidden)');
    console.log('  - Use the 16-letter APP password, NOT your normal Gmail password');
    console.log('  - If you changed your Google password, old App Passwords are revoked — generate a new one');
    console.log('  - SMTP_USER must be the same account that generated the password');
    console.log('  - Workspace accounts: admin must allow App Passwords');
    process.exit(1);
  }

  const next = { ...cur, SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '587', SMTP_USER: user, SMTP_PASS: pass.replace(/\s+/g, ''), MAIL_FROM: `Table Tap <${user}>`, ADMIN_EMAIL: admin };
  const order = ['PORT', 'MONGO_URI', 'CLIENT_URL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'ADMIN_EMAIL'];
  const lines = order.filter(k => next[k] !== undefined).map(k => `${k}=${next[k]}`);
  for (const k of Object.keys(next)) if (!order.includes(k)) lines.push(`${k}=${next[k]}`);
  fs.writeFileSync(envPath, lines.join('\n') + '\n');
  console.log(`\n✓ Wrote ${envPath}`);
  console.log('Restart server: stop (Ctrl+C) then `npm run dev:server`');
  console.log(`Then test: http://localhost:5000/api/leads/test-email?to=${admin}\n`);
  process.exit(0);
})();
