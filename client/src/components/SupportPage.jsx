import { useState } from 'react';

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General help', message: '' });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 min-h-[60vh]">
      <a href="#/" className="inline-flex items-center gap-1 text-xs font-bold text-mute hover:text-ink">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back to home
      </a>
      <div className="mt-2"><span className="inline-block px-3 py-1 rounded-full bg-ink text-white text-xs font-extrabold">Support</span></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-3">
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">Support & Contact</h1>
        <p className="text-sm text-mute mt-2">
          Questions about joining, pricing, hardware kits or your live venue? Reach us — we reply within one business day.
        </p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 bg-white border border-line rounded-xl p-3">
            <span className="material-symbols-outlined">mail</span>
            <span><span className="font-bold">Email:</span> leelavinayakkothakota155@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-line rounded-xl p-3">
            <span className="material-symbols-outlined">call</span>
            <span><span className="font-bold">Phone:</span> +91 8523086151 · Mon–Fri, 9am–9pm</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-line rounded-xl p-3">
            <span className="material-symbols-outlined">chat</span>
            <span><span className="font-bold">Live chat:</span> from the ordering app → Call Server → Help</span>
          </div>
        </div>
        <p className="text-xs text-mute mt-4">
          Want to join instead? <a href="#/add-restaurant" className="font-bold underline">Add your restaurant</a> · <a href="#/pricing" className="font-bold underline">View pricing</a>
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-mute">Your name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-mute">Email *</label>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="you@venue.com" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-mute">Topic</label>
          <select value={form.topic} onChange={e => set('topic', e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black">
            <option>General help</option>
            <option>Joining / Pricing</option>
            <option>Hardware kits</option>
            <option>POS integration</option>
            <option>Existing venue issue</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-mute">Message *</label>
          <textarea required rows={5} value={form.message} onChange={e => set('message', e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 ring-black" placeholder="How can we help?" />
        </div>
        <button className="w-full py-3 rounded-xl bg-ink text-white text-sm font-bold">Send message</button>
        {sent && <div className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">✓ Message received! Our team will reply to {form.email || 'your email'} soon.</div>}
      </form>
      </div>
    </div>
  );
}
