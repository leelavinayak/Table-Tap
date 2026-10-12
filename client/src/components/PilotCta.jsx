import { useState } from 'react';
import { submitLead } from '../api';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function PilotCta() {
  const [form, setForm] = useState({ restaurantName: '', email: '', phone: '', address: '', state: '', pincode: '' });
  const [state, setState] = useState({ loading: false, ok: false, err: '', restaurantId: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) {
      setState({ loading: false, ok: false, err: 'Please enter your restaurant address.', restaurantId: '' });
      return;
    }
    if (!form.state) {
      setState({ loading: false, ok: false, err: 'Please select your state.', restaurantId: '' });
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setState({ loading: false, ok: false, err: 'Please enter a valid 6-digit pincode.', restaurantId: '' });
      return;
    }
    setState({ loading: true, ok: false, err: '', restaurantId: '' });
    try {
      // Register on backend — details go to admin email + leads DB.
      // Backend generates a 12-digit Restaurant ID and emails it to the restaurant.
      let leadResp = null;
      try {
        leadResp = await submitLead({
          restaurantName: form.restaurantName,
          email: form.email,
          phone: form.phone,
          address: form.address.trim(),
          state: form.state,
          pincode: form.pincode.trim(),
          source: 'partner'
        });
      } catch (apiErr) {
        if (apiErr.code === 'ECONNABORTED') {
          throw new Error('Request timed out (30s). Server may be stuck on SMTP — check server terminal for Gmail 535 errors, fix SMTP_PASS, restart server. No email was sent.');
        }
        if (!apiErr.response) {
          const base = import.meta.env.VITE_API_URL || '/api (same-origin)';
          throw new Error(`Could not reach API at ${base}. ${window.location.hostname === 'localhost' ? '1) Run `npm run dev` from project root. 2) Open http://localhost:5000/api/health — must return ok:true. 3) Keep that terminal open, then submit again.' : 'Deployed frontend must set VITE_API_URL to your backend URL + /api (e.g. https://your-backend.onrender.com/api) and backend CLIENT_URL must include this frontend domain. Then redeploy frontend.'} No email was sent.`);
        }
        const status = apiErr.response?.status;
        const data = apiErr.response?.data;
        const raw = typeof data === 'string' ? data : JSON.stringify(data || {});
        // Vite proxy ECONNRESET → 500 with empty body when backend restarts mid-request
        if (status === 500 && (!raw || raw === '{}' || raw.length < 5)) {
          throw new Error('Connection reset (proxy ECONNRESET): backend restarted while sending (nodemon watches files). Fixed now — fully stop server (Ctrl+C), run `npm run dev` again with latest code (nodemon ignores outbox/), wait for “Server running on :5000”, then submit once more.');
        }
        // Deployed 404 "Cannot POST /leads" = VITE_API_URL missing /api suffix.
        if (status === 404 && /cannot post \/leads/i.test(raw)) {
          const base = import.meta.env.VITE_API_URL || '(not set)';
          throw new Error(`API path mismatch (404 Cannot POST /leads). Frontend is calling ${base}/leads but backend expects ${base}/api/leads. Fix: set VITE_API_URL to https://your-backend.onrender.com/api (must end with /api) in Vercel → Settings → Environment Variables, then Redeploy. Backend code now also accepts /leads, so redeploying the backend alone fixes old frontends.`);
        }
        const detail = typeof data === 'string' ? data.slice(0, 400) : (data?.error || JSON.stringify(data || {}).slice(0, 400));
        // Already registered — show the backend message as-is (it includes the existing Restaurant ID).
        if (status === 409 || data?.duplicate) {
          throw new Error(detail || 'This restaurant email is already registered.');
        }
        throw new Error(`Server error ${status}: ${detail || 'no details'}. Restart server with latest code (npm run dev:server) and retry.`);
      }

      const restaurantId = leadResp?.lead?.restaurantId || leadResp?.restaurantId || '';
      if (leadResp?.persisted === false || leadResp?.demoMode) {
        throw new Error(leadResp?.error || 'Database unavailable — details NOT saved. Start backend with a valid MONGO_URI (see server/.env) and retry. No email was sent.');
      }
      const rMail = leadResp?.emails?.restaurant;
      const aMail = leadResp?.emails?.admin;
      if (rMail?.error || rMail?.skipped) {
        throw new Error(`Registered, but restaurant email failed: ${rMail.error || 'skipped'}. Check server/.env SMTP + ADMIN_EMAIL, then test GET /api/leads/test-email?to=${form.email}`);
      }
      if (aMail?.error || aMail?.skipped) {
        console.warn('Admin email issue:', aMail?.error);
      }

      setState({ loading: false, ok: true, err: '', restaurantId });
      setForm({ restaurantName: '', email: '', phone: '', address: '', state: '', pincode: '' });
    } catch (err) {
      setState({ loading: false, ok: false, err: err.message || err.response?.data?.error || 'Could not submit. Is API running on :5000?', restaurantId: '' });
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
              Add your restaurant details with address — your 12-digit Restaurant ID will be sent to your registered email.
            </p>
            <ul className="mt-4 space-y-2 text-[13px] sm:text-sm text-gray-300 hidden sm:block">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-amber-300">check_circle</span>Adding you restaurant logo in Table Tap site</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base text-amber-300">check_circle</span>12-digit Restaurant ID sent to your email</li>
            </ul>
          </div>
          <form onSubmit={submit} className="w-full lg:max-w-md bg-white text-black p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col gap-4">
            <div>
              <div className="font-bold text-[17px]">Register as a Partner</div>
              <div className="text-[13px] sm:text-sm text-gray-500 mt-0.5">Details go to admin — Restaurant ID sent to your email.</div>
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
              <label className="tt-label">Restaurant Address *</label>
              <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                rows={3} maxLength={500}
                className="tt-input resize-none" placeholder="Shop no, street, area, city" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="tt-label">State *</label>
                <select required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                  className="tt-input bg-white">
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="tt-label">Pincode *</label>
                <input required value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} title="Enter 6-digit pincode"
                  className="tt-input" placeholder="e.g. 400001" />
              </div>
            </div>
            <button disabled={state.loading} className="tt-btn-primary">
              <span className="material-symbols-outlined text-base">storefront</span>
              {state.loading ? 'Registering…' : 'Join as a Partner'}
            </button>
            {state.ok && (
              <div className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">
                ✓ Registered! Your 12-digit Restaurant ID{state.restaurantId ? `: ${state.restaurantId}` : ''} has been sent to your email.
              </div>
            )}
            {state.err && <div className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">{state.err}</div>}
            <div className="text-center text-xs text-gray-500">No credit card required. SOC-2 Type II Certified.</div>
          </form>
        </div>
      </div>
    </section>
  );
}
