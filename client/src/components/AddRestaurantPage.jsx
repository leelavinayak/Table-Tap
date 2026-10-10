import { useState } from 'react';
import { submitLead } from '../api';

export default function AddRestaurantPage() {
  const [form, setForm] = useState({ restaurantName: '', email: '', phone: '', city: '', tables: '', gst: '' });
  const [state, setState] = useState({ loading: false, ok: false, err: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, ok: false, err: '' });
    try {
      await submitLead({
        restaurantName: form.restaurantName,
        email: form.email,
        phone: form.phone,
        city: form.city,
        tables: form.tables,
        gst: form.gst.toUpperCase().trim()
      });
      try {
        sessionStorage.setItem('tabletap_pending_restaurant', JSON.stringify({
          restaurantName: form.restaurantName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          tables: form.tables,
          gst: form.gst.toUpperCase().trim()
        }));
      } catch {}
      setState({ loading: false, ok: true, err: '' });
      setTimeout(() => { window.location.hash = '#/pricing'; }, 700);
    } catch (err) {
      setState({ loading: false, ok: false, err: err.response?.data?.error || 'Could not submit. Is API running on :5000?' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 min-h-[60vh]">
      <a href="#/" className="inline-flex items-center gap-1 text-xs font-bold text-mute hover:text-ink">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back to home
      </a>
      <div className="mt-2"><span className="inline-block px-3 py-1 rounded-full bg-ink text-white text-xs font-extrabold">Add Restaurant</span></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-3">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">Add your restaurant to Table Tap</h1>
        <p className="text-sm text-mute mt-2">
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
            <div className="font-bold">Want your logo on the Partners page?</div>
            <div className="text-mute text-[13px]">Join as a partner below on the home page — register + upload your logo and it will be showcased instantly.</div>
            <a href="#/" onClick={() => setTimeout(() => document.getElementById('pilot')?.scrollIntoView({ behavior: 'smooth' }), 100)} className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold underline">Go to Join as a Partner <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
          </div>
        </div>
        <p className="text-xs text-mute mt-4">
          See joining cost first? <a href="#/pricing" className="font-bold underline">View pricing</a>
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-3 h-fit">
        <div className="font-bold">Add Your Restaurant</div>
        <div className="text-sm text-mute -mt-2">Simple enquiry — no logo needed here.</div>
        <div>
          <label className="text-xs font-bold uppercase text-mute">Restaurant name *</label>
          <input required value={form.restaurantName} onChange={e => set('restaurantName', e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="e.g. Osteria Stella" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-mute">Work email *</label>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="gm@osteriastella.com" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-mute">Mobile Number *</label>
            <input required value={form.phone} onChange={e => set('phone', e.target.value)}
              inputMode="tel" pattern="[0-9+\-\s]{7,15}" title="Enter a valid mobile number"
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="+1 555 000 1234" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-mute">City</label>
            <input value={form.city} onChange={e => set('city', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="New York" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-mute">No. of tables</label>
            <input value={form.tables} onChange={e => set('tables', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="e.g. 40" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-mute">GST Number *</label>
          <input required value={form.gst} onChange={e => set('gst', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
            minLength={15} maxLength={15} pattern="[A-Z0-9]{15}" title="Enter 15-character GSTIN, e.g. 22AAAAA0000A1Z5"
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm uppercase focus:outline-none focus:ring-2 ring-black" placeholder="e.g. 22AAAAA0000A1Z5" />
          <div className="text-[11px] text-mute mt-1">15-character GSTIN of the restaurant.</div>
        </div>
        <button disabled={state.loading} className="w-full py-3 rounded-xl bg-ink text-white text-sm font-bold disabled:opacity-60">
          {state.loading ? 'Submitting…' : 'Submit Restaurant'}
        </button>
        {state.ok && <div className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">✓ Received! Redirecting to pricing & joining price…</div>}
        {state.err && <div className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">{state.err}</div>}
      </form>
      </div>
    </div>
  );
}
