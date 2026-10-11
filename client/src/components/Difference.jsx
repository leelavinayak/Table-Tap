const steps = [
  { n: '01', title: 'Scan Table Stand', desc: 'Guests tap with NFC or scan the architectural QR stand. Instant, ultra-light PWA fires up in under 0.8 seconds without app stores.', icon: 'bolt', foot: 'Zero install barrier' },
  { n: '02', title: 'Route Direct to KDS', desc: 'Orders bypass order pads and route straight to the kitchen display screen and bar printers with seat-specific allocations.', icon: 'sync_alt', foot: 'Bi-directional POS Sync' },
  { n: '03', title: 'Spontaneous Reordering', desc: 'Craving another glass of Pinot Noir or extra focaccia? Fire reorder items instantly while keeping tab synchronized.', icon: 'repeat', foot: '2-Tap Round Repeats' },
  { n: '04', title: 'Instant Bill Split & Pay', desc: 'Diners split evenly, by items, or cover their own round via Apple Pay, Google Pay, or card in seconds.', icon: 'credit_card', foot: 'Zero-wait checkout' }
];

export default function Difference() {
  return (
    <section id="difference" className="w-full py-10 sm:py-16 bg-[#f3f4f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="text-[11px] uppercase tracking-widest text-mute font-bold">Operational Anatomy</div>
          <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight mt-1.5">The Frictionless Dine-In Difference</h2>
          <p className="text-sm text-mute mt-1.5">From arrival to last sip, remove awkward hand-waves and receipt delays while keeping dining hospitable.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(s => (
            <div key={s.n} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-display font-extrabold text-sm">{s.n}</div>
              <div><h3 className="font-bold text-base">{s.title}</h3><p className="text-xs text-mute mt-1">{s.desc}</p></div>
              <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-mute font-medium">
                <span className="material-symbols-outlined"> {s.icon}</span> {s.foot}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
