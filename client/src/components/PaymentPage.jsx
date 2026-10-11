import { useEffect, useState } from 'react';

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    per: '/month per venue',
    desc: 'For single cafes & small bistros.',
    features: ['Up to 20 tables', 'QR + NFC stands included', 'Basic menu sync']
  },
  {
    id: 'current',
    name: 'Current Plan',
    price: '1299',
    per: '/month per venue',
    desc: 'For busy dine-in & bars. Most popular joining plan.',
    features: ['Up to 60 tables', '20 free acrylic stands', 'All POS integrations', '2-tap reorders + split pay', 'One admin portal included', 'Live order tracking', 'History exploring + download history', 'Calendar-based dashboard',],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Chain / Enterprise',
    price: 'Custom',
    per: 'annual billing',
    desc: 'For groups with 5+ venues.',
    features: ['Unlimited tables', 'Multi-venue dashboard', 'Dedicated manager']
  }
];

export default function PaymentPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [selected, setSelected] = useState('current');
  const [step, setStep] = useState('select'); // select | pay | success
  const [payMethod, setPayMethod] = useState('upi');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('tabletap_pending_restaurant');
      if (raw) setRestaurant(JSON.parse(raw));
    } catch { }
  }, []);

  const pkg = packages.find(p => p.id === selected);

  const pay = (e) => {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStep('success');
      try { sessionStorage.removeItem('tabletap_pending_restaurant'); } catch { }
    }, 1500);
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-14 min-h-[60vh] text-center flex flex-col items-center gap-3">
        <span className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-green-700">check_circle</span>
        </span>
        <h1 className="font-display font-extrabold text-2xl tracking-tight">Payment Successful!</h1>
        <p className="text-sm text-mute max-w-md">
          Thank you! Your <b>{pkg?.name}</b> package has been activated.
          Our team will contact you with hardware kit tracking shortly.
        </p>
        <div className="flex gap-2 mt-2">
          <a href="#/" className="px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-bold">Back to Home</a>
          <a href="#/pricing" className="px-5 py-2.5 rounded-xl bg-white border border-line text-sm font-bold">View Pricing</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-6 md:py-10 min-h-[60vh]">
      <a href="#/add-restaurant" className="inline-flex items-center gap-1 text-xs font-bold text-mute hover:text-ink">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back to restaurant details
      </a>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-block px-3 py-1 rounded-full bg-ink text-white text-xs font-extrabold">Payment</span>
        <span className="text-xs text-mute">Step {step === 'select' ? '1 of 2 — Select package' : '2 of 2 — Continue payment'}</span>
      </div>
      <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mt-2">Select your package & continue payment</h1>
      {restaurant && (
        <p className="text-sm text-mute mt-1">
          Restaurant: <b className="text-ink">{restaurant.restaurantName}</b>
          {restaurant.gst && <> • GST: <b className="text-ink">{restaurant.gst}</b></>}
          {restaurant.email && <> • {restaurant.email}</>}
        </p>
      )}
      {!restaurant && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          No restaurant details found. Please <a href="#/add-restaurant" className="font-bold underline">submit the Add Restaurant form</a> first — your details + GST will appear here.
        </div>
      )}

      {step === 'select' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 items-stretch">
            {packages.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`text-left rounded-2xl border p-5 flex flex-col gap-2 transition ${selected === p.id
                  ? 'bg-ink text-white border-ink shadow-lg ring-2 ring-amber-300'
                  : 'bg-white border-line hover:border-ink'
                  }`}
              >
                <span className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${selected === p.id ? 'bg-white text-ink' : 'bg-gray-100 text-mute'}`}>
                    {p.popular ? 'MOST POPULAR' : p.name.toUpperCase()}
                  </span>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === p.id ? 'border-amber-300 bg-amber-300' : 'border-line bg-white'}`}>
                    {selected === p.id && <span className="material-symbols-outlined text-[14px] text-black font-bold">check</span>}
                  </span>
                </span>
                <h2 className="font-extrabold text-lg">{p.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-3xl">{p.price}</span>
                  <span className={`text-xs ${selected === p.id ? 'text-gray-300' : 'text-mute'}`}>{p.per}</span>
                </div>
                <p className={`text-sm ${selected === p.id ? 'text-gray-300' : 'text-mute'}`}>{p.desc}</p>
                <ul className="space-y-1.5 mt-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[13px]">
                      <span className="material-symbols-outlined text-base">check_circle</span>{f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="mt-6 bg-white border border-line rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              <div className="text-mute">Selected package</div>
              <div className="font-extrabold text-lg">{pkg.name} — {pkg.price} <span className="text-xs font-normal text-mute">{pkg.per}</span></div>
            </div>
            <button
              onClick={() => setStep('pay')}
              className="px-8 py-3 rounded-xl bg-ink text-white text-sm font-bold shadow hover:bg-char flex items-center gap-2"
            >
              Continue to Payment <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </>
      )}

      {step === 'pay' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <form onSubmit={pay} className="tt-card p-5 sm:p-6 flex flex-col gap-4">
            <div className="font-bold text-[17px]">Payment details</div>
            <div className="text-sm text-mute -mt-3">Paying for <b className="text-ink">{pkg.name} ({pkg.price})</b></div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'upi', label: 'UPI', icon: 'qr_code_2' },
                { id: 'card', label: 'Card', icon: 'credit_card' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] ${payMethod === m.id ? 'bg-ink text-white border-ink' : 'bg-soft border-line'}`}
                >
                  <span className="material-symbols-outlined text-base">{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
            {payMethod === 'upi' ? (
              <div>
                <label className="tt-label">UPI ID</label>
                <input required placeholder="yourname@upi" autoComplete="off" className="tt-input" />
              </div>
            ) : (
              <>
                <div>
                  <label className="tt-label">Card number</label>
                  <input required inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" className="tt-input" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-3">
                  <div>
                    <label className="tt-label">Expiry</label>
                    <input required placeholder="MM/YY" autoComplete="cc-exp" className="tt-input" />
                  </div>
                  <div>
                    <label className="tt-label">CVV</label>
                    <input required inputMode="numeric" type="password" autoComplete="cc-csc" placeholder="•••" className="tt-input" />
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep('select')} className="px-5 py-3.5 rounded-xl bg-soft text-sm font-bold active:scale-[0.99] transition">Back</button>
              <button disabled={paying} className="flex-1 py-3.5 rounded-xl bg-ink text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_12px_28px_-12px_rgba(12,16,20,0.6)] active:scale-[0.99] transition">
                <span className="material-symbols-outlined text-base">lock</span>
                {paying ? 'Processing…' : `Pay ${pkg.price}`}
              </button>
            </div>
            <div className="text-center text-[11px] text-mute">Demo checkout — no real money is charged.</div>
          </form>

          <div className="bg-ink text-white rounded-3xl p-5 sm:p-6 h-fit flex flex-col gap-2 shadow-xl">
            <div className="font-bold">Order summary</div>
            <div className="text-sm text-gray-300">Restaurant: <b className="text-white">{restaurant?.restaurantName || '—'}</b></div>
            <div className="text-sm text-gray-300">GST: <b className="text-white">{restaurant?.gst || '—'}</b></div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between text-sm"><span className="text-gray-300">{pkg.name} plan</span><b>{pkg.price}</b></div>
            <div className="flex justify-between text-sm"><span className="text-gray-300">Setup + hardware kit</span><b>Included</b></div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between font-extrabold"><span>Total due</span><span>{pkg.price}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
