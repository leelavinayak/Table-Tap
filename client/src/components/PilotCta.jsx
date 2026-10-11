import { useRef, useState } from 'react';
import { submitLead } from '../api';
import { fileToDataUrl } from '../utils/partners';

export default function PilotCta() {
  const [form, setForm] = useState({ restaurantName: '', email: '', phone: '' });
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [state, setState] = useState({ loading: false, ok: false, err: '' });
  const fileRef = useRef(null);

  const onLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setState({ loading: false, ok: false, err: 'Please upload an image file (PNG/JPG) for your logo.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setState({ loading: false, ok: false, err: 'Logo must be under 5MB.' });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoPreview(dataUrl);
      setLogoFileName(file.name);
      setState(s => ({ ...s, err: '' }));
    } catch {
      setState({ loading: false, ok: false, err: 'Could not read logo image.' });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!logoPreview) {
      setState({ loading: false, ok: false, err: 'Please upload your restaurant logo to join as a partner.' });
      return;
    }
    setState({ loading: true, ok: false, err: '' });
    try {
      // Register on backend — details + logo go to admin email + leads DB.
      // Logo is added on Partners page manually by admin (no auto-showcase).
      let leadResp = null;
      try {
        leadResp = await submitLead({
          restaurantName: form.restaurantName,
          email: form.email,
          phone: form.phone,
          logoImage: logoPreview
        });
      } catch (apiErr) {
        if (apiErr.code === 'ECONNABORTED') {
          throw new Error('Request timed out (30s). Server may be stuck on SMTP — check server terminal for Gmail 535 errors, fix SMTP_PASS, restart server. No email was sent.');
        }
        if (!apiErr.response) {
          const base = import.meta.env.VITE_API_URL || '/api (same-origin)';
          throw new Error(`Could not reach API at ${base}. ${window.location.hostname === 'localhost' ? '1) Run \`npm run dev\` from project root. 2) Open http://localhost:5000/api/health — must return ok:true. 3) Keep that terminal open, then submit again.' : 'Deployed frontend must set VITE_API_URL to your backend URL + /api (e.g. https://your-backend.onrender.com/api) and backend CLIENT_URL must include this frontend domain. Then redeploy frontend.'} No email was sent.`);
        }
        const status = apiErr.response?.status;
        const data = apiErr.response?.data;
        const raw = typeof data === 'string' ? data : JSON.stringify(data || {});
        // Vite proxy ECONNRESET → 500 with empty body when backend restarts mid-request
        if (status === 500 && (!raw || raw === '{}' || raw.length < 5)) {
          throw new Error('Connection reset (proxy ECONNRESET): backend restarted while sending (nodemon watches files). Fixed now — fully stop server (Ctrl+C), run `npm run dev` again with latest code (nodemon ignores outbox/), wait for “Server running on :5000”, then submit once more.');
        }
        const detail = typeof data === 'string' ? data.slice(0, 300) : (data?.error || JSON.stringify(data || {}).slice(0, 300));
        throw new Error(`Server error ${status}: ${detail || 'no details'}. Restart server with latest code (npm run dev:server) and retry.`);
      }

      const rMail = leadResp?.emails?.restaurant;
      const aMail = leadResp?.emails?.admin;
      if (rMail?.error || rMail?.skipped) {
        throw new Error(`Registered, but restaurant email failed: ${rMail.error || 'skipped'}. Check server/.env SMTP + ADMIN_EMAIL, then test GET /api/leads/test-email?to=${form.email}`);
      }
      if (aMail?.error || aMail?.skipped) {
        console.warn('Admin email issue:', aMail?.error);
      }

      setState({ loading: false, ok: true, err: '' });
      setForm({ restaurantName: '', email: '', phone: '' });
      setLogoPreview('');
      setLogoFileName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setState({ loading: false, ok: false, err: err.message || err.response?.data?.error || 'Could not submit. Is API running on :5000?' });
    }
  };

  return (
    <section id="pilot" className="w-full py-10 sm:py-16 bg-[#e7e8e9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
        <div className="bg-ink text-white rounded-[1.75rem] sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 lg:gap-10">
          <div className="max-w-xl flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-xs font-bold">
              <span className="material-symbols-outlined text-sm">handshake</span>
              Join as a Partner
            </div>
            <h2 className="font-display font-extrabold text-[22px] sm:text-2xl md:text-3xl tracking-tight leading-tight mt-3">Join as a Table Tap partner restaurant</h2>
            <p className="text-gray-300 mt-2 text-[15px] sm:text-sm leading-relaxed">
              Add your restaurant details and logo — our admin will add it on the partners page.
            </p>
            <ul className="mt-4 space-y-2 text-[13px] sm:text-sm text-gray-300 hidden sm:block">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-amber-300">check_circle</span>Free 14-day pilot · no credit card</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-amber-300">check_circle</span>Logo live on Partners page within 24 hrs</li>
            </ul>
          </div>
          <form onSubmit={submit} className="w-full lg:max-w-md bg-white text-black p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col gap-4">
            <div>
              <div className="font-bold text-[17px]">Register as a Partner</div>
              <div className="text-[13px] sm:text-sm text-gray-500 mt-0.5">Details + logo go to admin — logo added manually within 24 hours.</div>
            </div>
            <div>
              <label className="tt-label">Restaurant Name *</label>
              <input required value={form.restaurantName} onChange={e => setForm({ ...form, restaurantName: e.target.value })}
                className="tt-input" placeholder="table table" />
            </div>
            <div>
              <label className="tt-label">Work Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="tt-input" placeholder="tabletab@gmail.com" />
            </div>
            <div>
              <label className="tt-label">Mobile Number *</label>
              <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                inputMode="tel" autoComplete="tel" pattern="[0-9+\-\s]{7,15}" title="Enter a valid mobile number"
                className="tt-input" placeholder="+91 9999999999" />
            </div>
            <div>
              <label className="tt-label">Upload Restaurant Logo / Image *</label>
              <div className="mt-1.5 flex items-center gap-3 bg-soft border border-dashed border-line rounded-2xl p-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-line overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-400">restaurant</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input ref={fileRef} type="file" accept="image/*" onChange={onLogoChange}
                    className="w-full text-xs file:mr-2 file:px-4 file:py-2.5 file:rounded-xl file:border-0 file:bg-ink file:text-white file:text-xs file:font-bold file:cursor-pointer hover:file:bg-black" />
                  {logoFileName && <div className="text-[11px] text-gray-500 mt-1 truncate">{logoFileName}</div>}
                </div>
                {logoPreview && (
                  <button type="button" onClick={() => { setLogoPreview(''); setLogoFileName(''); if (fileRef.current) fileRef.current.value = ''; }}
                    className="text-xs font-bold text-red-600 hover:underline shrink-0 px-2 py-2">Remove</button>
                )}
              </div>
            </div>
            <button disabled={state.loading} className="tt-btn-primary">
              <span className="material-symbols-outlined text-base">storefront</span>
              {state.loading ? 'Registering…' : 'Join as a Partner'}
            </button>
            {state.ok && <div className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">✓ Details sent to admin! Confirmation email sent — admin will add your logo manually within 24 hours.</div>}
            {state.err && <div className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">{state.err}</div>}
            <div className="text-center text-xs text-gray-500">No credit card required. SOC-2 Type II Certified.</div>
          </form>
        </div>
      </div>
    </section>
  );
}
