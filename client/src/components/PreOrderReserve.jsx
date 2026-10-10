const steps = [
  { icon: 'calendar_add_on', title: 'Book before you reach', desc: 'Pick restaurant, date, time and guests. Pre-order starters, mains and drinks from the live menu.' },
  { icon: 'table_restaurant', title: 'Get a reserved table', desc: 'Table is auto-assigned (e.g. T-12) and held for you. Kitchen fires your pre-order so food lands fast.' },
  { icon: 'qr_code_scanner', title: 'Walk in & tap to start', desc: 'Scan the table stand on arrival — your reservation, table and pre-ordered items load instantly.' },
];

export default function PreOrderReserve() {
  return (
    <section id="preorder" className="w-full py-10 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] uppercase tracking-widest text-mute font-bold">Pre-order + Reserved Tables</div>
          <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight mt-1">
            Book items before you reach — table stays reserved
          </h2>
          {/* <p className="text-sm text-mute mt-1.5">
            Order from home or cab. Restaurant keeps your table ready and kitchen starts on time, so starters arrive minutes after you sit.
          </p> */}
        </div>

        {/* About this feature — simple explanation */}
        <div className="bg-cream border border-line rounded-2xl p-5 mt-6 text-sm leading-relaxed">
          <div className="font-extrabold text-base">About pre-order with reserved table</div>
          <p className="mt-2 text-mute">
            With Table Tap you do not have to wait at the restaurant to order. You can book your food and drinks
            <span className="font-bold text-ink"> before you reach the restaurant </span>
            — from home, office or cab. Just select the restaurant, date, time and your items.
          </p>
          <p className="mt-2 text-mute">
            Based on your booking, the restaurant
            <span className="font-bold text-ink"> reserves a table for you (for example T-12) </span>
            and keeps it ready for your arrival. Your pre-ordered items go directly to the kitchen display, so the chef
            starts preparing at the right time and your food reaches the table fast.
          </p>
          <p className="mt-2 text-mute">
            When you reach, just walk in and scan the QR stand on your reserved table — your booking, table number and
            all pre-ordered items open automatically. You can still add more items, call the server or pay from the same tab.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {steps.map(s => (
            <div key={s.title} className="bg-cream border border-line rounded-2xl p-5">
              <span className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center">
                <span className="material-symbols-outlined">{s.icon}</span>
              </span>
              <div className="font-bold text-sm mt-2">{s.title}</div>
              <div className="text-xs text-mute mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
