const plans = [
  {
    name: 'Starter',
    price: '$49',
    per: '/month per venue',
    desc: 'For single cafes & small bistros getting started with QR ordering.',
    features: ['Up to 20 tables', 'QR + NFC stands included', 'Basic menu sync'],
    comingSoon: true
  },
  {
    name: /*'Growth'*/ 'Current Plan',
    price: '1499',
    per: '/month per venue',
    desc: 'For busy dine-in & bars. Most popular joining plan.',
    features: ['10 QR Stickers providing', 'All POS integrations', '2-tap reorders + split pay', 'One admin portal included', 'Live order tracking', 'History exploring + download history', 'Calendar-based dashboard'],
    popular: true,
    comingSoon: true
  },
  {
    name: 'Chain / Enterprise',
    price: 'Custom',
    per: 'annual billing',
    desc: 'For groups with 5+ venues, custom hardware & onboarding.',
    features: ['Unlimited tables', 'Multi-venue dashboard', 'Dedicated manager'],
    comingSoon: true
  }
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-6 md:py-10 min-h-[60vh]">
      <a href="#/" className="inline-flex items-center gap-1 text-xs font-bold text-mute hover:text-ink">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back to home
      </a>
      <div className="text-center max-w-2xl mx-auto mt-2">
        <span className="inline-block px-3 py-1 rounded-full bg-ink text-white text-xs font-extrabold">Pricing</span>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mt-2">Joining price for Table Tap</h1>
        <p className="text-sm text-mute mt-2">
          Simple per-venue pricing. Hardware kits ship in 48 hours. Pilot free for 14 days — no credit card required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 items-stretch">
        {plans.map(p => (
          <div
            key={p.name}
            className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-3 ${p.popular ? 'bg-ink text-white border-ink shadow-sm' : 'bg-white border-line opacity-90'}`}
          >
            {!p.popular && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-white/30 z-[5]" />
                <div className="pointer-events-none absolute left-[-30%] right-[-30%] top-1/2 -translate-y-1/2 -rotate-45 bg-black text-white text-sm font-extrabold uppercase tracking-[0.3em] text-center py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] z-10">
                  Coming Soon
                </div>
              </>
            )}
            {p.popular ? (
              <span className="flex flex-wrap gap-2">
                <span className="self-start px-2.5 py-1 rounded-full bg-white text-ink text-[11px] font-extrabold">MOST POPULAR</span>
              </span>
            ) : null}
            <h2 className="font-extrabold text-lg">{p.name}</h2>
            {p.popular && (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-3xl">{p.price}</span>
                  <span className="text-xs text-gray-300">{p.per}</span>
                </div>
                <p className="text-sm text-gray-300">{p.desc}</p>
                <ul className="space-y-2 mt-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
                {p.comingSoon && (
                  <p className="text-xs italic mt-1 text-amber-300">Coming soon we are going to launch this plan first.</p>
                )}
              </>
            )}
            {p.popular && !p.comingSoon ? (
              <a
                href="#/add-restaurant"
                className="mt-auto text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-ink hover:bg-gray-100"
              >
                Add Your Restaurant
              </a>
            ) : (
              <button disabled className="mt-auto px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-mute cursor-not-allowed">
                Coming soon
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-mute mt-6">
        All plans include free PWA for guests (no app download), live tab sync and zero-wait checkout.
      </p>
    </div>
  );
}
