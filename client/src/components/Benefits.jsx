const customerPoints = [
  { icon: 'qr_code_scanner', title: 'No waiting, no waving', desc: 'Scan the table stand and order in seconds. No flagging servers, no bar queues.' },
  { icon: 'repeat', title: '2-tap reorders', desc: 'Repeat drinks, desserts or sides instantly. Tab stays synced across all phones.' },
  { icon: 'splitscreen', title: 'Easy split & pay', desc: 'Split by item or evenly, pay with Apple Pay / Google Pay / card and leave when ready.' },
];

const restaurantPoints = [
  { icon: 'trending_up', title: '+24% beverage revenue', desc: 'Spontaneous reorders lift drink & dessert sales without extra staff.' },
  { icon: 'timer', title: '18 min faster turns', desc: '42s table-to-kitchen routing and zero-wait checkout free up tables.' },
  { icon: 'point_of_sale', title: 'Works with your POS', desc: 'Toast, Square, Clover, Aloha, Micros sync — menu, 86 items and checks stay in sync.' },
];

export default function Benefits() {
  return (
    <section id="benefits" className="w-full py-10 bg-[#f3f4f5]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] uppercase tracking-widest text-mute font-bold">Why Table Tap</div>
          <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight mt-1">
            How Table Tap helps customers & restaurants
          </h2>
          <p className="text-sm text-mute mt-1.5">
            Guests get instant ordering and faster checkout. Restaurants get higher sales, faster table turns and happier staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center">
                <span className="material-symbols-outlined">group</span>
              </span>
              <h3 className="font-extrabold text-base">For Customers</h3>
            </div>
            <ul className="mt-3 space-y-3">
              {customerPoints.map(c => (
                <li key={c.title} className="flex gap-3">
                  <span className="material-symbols-outlined text-mute">{c.icon}</span>
                  <span>
                    <span className="block text-sm font-bold">{c.title}</span>
                    <span className="block text-xs text-mute">{c.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-line p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center">
                <span className="material-symbols-outlined">storefront</span>
              </span>
              <h3 className="font-extrabold text-base">For Restaurants</h3>
            </div>
            <ul className="mt-3 space-y-3">
              {restaurantPoints.map(c => (
                <li key={c.title} className="flex gap-3">
                  <span className="material-symbols-outlined text-mute">{c.icon}</span>
                  <span>
                    <span className="block text-sm font-bold">{c.title}</span>
                    <span className="block text-xs text-mute">{c.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
