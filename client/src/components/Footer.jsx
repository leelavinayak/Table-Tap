function goSection(id) {
  const h = window.location.hash || '';
  if (h.startsWith('#/')) {
    // coming from a sub page: go home first, then scroll
    window.location.hash = '#/';
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 350);
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}

const sections = [
  { id: 'benefits', label: 'Why Table Tap' },
  { id: 'partners', label: '10+ Partner Venues' },
  { id: 'demo', label: 'Guest Ordering App' },
  { id: 'preorder', label: 'Pre-order + Reserve Table' },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#f3f4f5] border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src="/Table_Tap_Logo.png" alt="Table Tap Logo" className="w-9 h-9 rounded-full object-cover bg-white shadow-sm" />
            <span className="font-display font-extrabold text-base">Table Tap</span>
          </div>
          <p className="text-xs text-mute mt-2 max-w-sm">High-performance guest ordering, dynamic tab orchestration, and hardware-agnostic POS sync for 540+ venues globally.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <a href="#/add-restaurant" className="px-3.5 py-2 rounded-lg bg-ink text-white text-xs font-bold">Add Your Restaurant</a>
            <a href="#/pricing" className="px-3.5 py-2 rounded-lg bg-white border border-line text-xs font-bold">View Joining Price</a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-2">Platform</h4>
          <ul className="text-xs text-mute space-y-1.5">
            {sections.map(s => (
              <li key={s.id}>
                <button onClick={() => goSection(s.id)} className="hover:underline">
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-2">Partner Onboarding</h4>
          <ul className="text-xs text-mute space-y-1.5">
            <li><a href="#/add-restaurant" className="hover:underline font-semibold text-ink">Add Your Restaurant</a></li>
            <li><a href="#/pricing" className="hover:underline font-semibold text-ink">Pricing & Joining Price</a></li>
            <li><a href="#/support" className="hover:underline">Support / Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-mute">© 2026 Table Tap — Order & Reorder from Your. Zero Waiter Delays.</div>
    </footer>
  );
}
