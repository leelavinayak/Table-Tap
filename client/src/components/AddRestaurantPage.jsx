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

export default function AddRestaurantPage() {
  const [form, setForm] = useState({ restaurantName: '', email: '', phone: '', address: '', state: '', pincode: '', partnerRestaurantId: '', city: '', gst: '' });
  const [pageState, setPageState] = useState({ loading: false, ok: false, err: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) {
      setPageState({ loading: false, ok: false, err: 'Please enter your restaurant address.' });
      return;
    }
    if (!form.state) {
      setPageState({ loading: false, ok: false, err: 'Please select your state.' });
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setPageState({ loading: false, ok: false, err: 'Please enter a valid 6-digit pincode.' });
      return;
    }
    const pid = form.partnerRestaurantId.trim();
    if (pid && !/^\d{12}$/.test(pid)) {
      setPageState({ loading: false, ok: false, err: 'Restaurant ID must be 12 digits, or leave it blank.' });
      return;
    }
    setPageState({ loading: true, ok: false, err: '' });
    try {
      const resp = await submitLead({
        restaurantName: form.restaurantName,
        email: form.email,
        phone: form.phone,
        address: form.address.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        partnerRestaurantId: pid,
        source: 'add-restaurant',
        city: form.city,
        gst: form.gst.toUpperCase().trim()
      });
      if (resp?.persisted === false || resp?.demoMode) {
        throw new Error(resp?.error || 'Database unavailable — details NOT saved. Start backend with a valid MONGO_URI and retry.');
      }
      try {
        sessionStorage.setItem('tabletap_pending_restaurant', JSON.stringify({
          restaurantName: form.restaurantName,
          email: form.email,
          phone: form.phone,
          address: form.address.trim(),
          state: form.state,
          pincode: form.pincode.trim(),
          partnerRestaurantId: pid,
          city: form.city,
          gst: form.gst.toUpperCase().trim()
        }));
      } catch {}
      setPageState({ loading: false, ok: true, err: '' });
      setTimeout(() => { window.location.hash = '#/pricing'; }, 700);
    } catch (err) {
      setPageState({ loading: false, ok: false, err: err.response?.data?.error || 'Could not submit. Is API running on :5000?' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-6 md:py-10 min-h-[60vh]">
      <a href="#/" className="inline-flex items-center gap-1 text-xs font-bold text-mute hover:text-ink">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back to home
      </a>
      <div className="mt-2"><span className="inline-block px-3 py-1 rounded-full bg-ink text-white text-xs font-extrabold">Add Restaurant</span></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-3">
      <div>
        <h1 className="font-display font-extrabold text-[24px] sm:text-2xl md:text-3xl tracking-tight leading-tight">Add your restaurant to Table Tap</h1>
        <p className="text-[15px] sm:text-sm text-mute mt-2 leading-relaxed">
          Tell us about your venue — we ship QR/NFC stands in 48 hours and connect your POS in under 20 minutes.
        </p>
        <ul className="mt-4 space-y-2.5 text-sm">
          {[
            'Free 14-day pilot with 20 demo stands',
            'Menu + table sync with Toast, Square, Clover, Aloha, Micros',
            '2-tap reorders, split pay, KDS routing',
          ].map(t => (
            <li key={t} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>{t}
            </li>
          ))}
        </ul>
        <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm flex gap-2.5">
          <span className="material-symbols-outlined text-amber-600">stars</span>
          <div>
            <div className="font-bold">Want to join as a Partner?</div>
            <div className="text-mute text-[13px]">Join as a partner below on the home page — register with your address + pincode and your 12-digit Restaurant ID will be emailed to you.</div>
            <a href="#/" onClick={() => setTimeout(() => document.getElementById('pilot')?.scrollIntoView({ behavior: 'smooth' }), 100)} className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold underline">Go to Join as a Partner <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
          </div>
        </div>
        <p className="text-xs text-mute mt-4">
          See joining cost first? <a href="#/pricing" className="font-bold underline">View pricing</a>
        </p>
      </div>

      <form onSubmit={submit} className="tt-card p-5 sm:p-6 flex flex-col gap-4 h-fit">
        <div className="font-bold text-[17px]">Add Your Restaurant</div>
        <div className="text-sm text-mute -mt-3">Simple enquiry — no logo needed here.</div>
        <div>
          <label className="tt-label">Restaurant name *</label>
          <input required value={form.restaurantName} onChange={e => set('restaurantName', e.target.value)}
            className="tt-input" placeholder="table table" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
          <div>
            <label className="tt-label">Work email *</label>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className="tt-input" placeholder="tabletab@gmail.com" />
          </div>
          <div>
            <label className="tt-label">Mobile Number *</label>
            <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              inputMode="tel" autoComplete="tel" pattern="[0-9+\-\s]{7,15}" title="Enter a valid mobile number"
              className="tt-input" placeholder="+91 9999999999" />
          </div>
        </div>
        <div>
          <label className="tt-label">Restaurant Address *</label>
          <textarea required value={form.address} onChange={e => set('address', e.target.value)}
            rows={3} maxLength={500}
            className="tt-input resize-none" placeholder="Shop no, street, area, city" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
          <div>
            <label className="tt-label">State *</label>
            <select required value={form.state} onChange={e => set('state', e.target.value)}
              className="tt-input bg-white">
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="tt-label">Pincode *</label>
            <input required value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} title="Enter 6-digit pincode"
              className="tt-input" placeholder="e.g. 400001" />
          </div>
        </div>
        <div>
          <label className="tt-label">City</label>
          <input value={form.city} onChange={e => set('city', e.target.value)}
            className="tt-input" placeholder="New York" />
        </div>
        <div>
          <label className="tt-label">GST Number *</label>
          <input required value={form.gst} onChange={e => set('gst', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
            minLength={15} maxLength={15} pattern="[A-Z0-9]{15}" title="Enter 15-character GSTIN, e.g. 22AAAAA0000A1Z5"
            className="tt-input uppercase" placeholder="e.g. 22AAAAA0000A1Z5" />
          <div className="text-[11px] text-mute mt-1">15-character GSTIN of the restaurant.</div>
        </div>
        <div>
          <label className="tt-label">12-digit Restaurant ID <span className="font-normal text-mute">(optional)</span></label>
          <input value={form.partnerRestaurantId} onChange={e => set('partnerRestaurantId', e.target.value.replace(/\D/g, '').slice(0, 12))}
            inputMode="numeric" pattern="[0-9]{12}" minLength={12} maxLength={12} title="Enter the 12-digit ID from your partner email, or leave blank"
            className="tt-input" placeholder="e.g. 123456789012 (if joined as partner)" />
          <div className="text-[11px] text-mute mt-1">Joined as a partner already? Enter the 12-digit ID emailed to you — else leave it blank.</div>
        </div>
        <button disabled={pageState.loading} className="tt-btn-primary">
          {pageState.loading ? 'Submitting…' : 'Submit Restaurant'}
        </button>
        {pageState.ok && <div className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">✓ Received! Redirecting to pricing & joining price…</div>}
        {pageState.err && <div className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">{pageState.err}</div>}
      </form>
      </div>
    </div>
  );
}
