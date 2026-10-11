import { useEffect, useRef, useState } from 'react';
import { fetchTab, addToTab, notifyServer } from '../api';

const quick = [
  { name: 'Peroni Nastro Azzurro', label: 'Peroni Draft', price: 9 },
  { name: 'San Pellegrino Sparkling', label: 'Pellegrino 750ml', price: 6 }
];

export default function LiveSimulation() {
  const [tab, setTab] = useState({ tabId: '8492', table: 'TABLE 08 • GUSTO TRATTORIA', items: [], total: 74 });
  const [calling, setCalling] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchTab('8492').then(d => {
      // normalize: backend returns items with qty
      const items = (d.items || []).map(i => ({ name: i.name, price: i.price, meta: i.status || 'Fired' }));
      setTab({ tabId: d.tabId || '8492', table: d.table, items, total: d.total ?? 74 });
    }).catch(() => {
      setTab({
        tabId: '8492', table: 'TABLE 08 • GUSTO TRATTORIA', total: 74,
        items: [
          { name: 'Burrata Pugliese', price: 18, meta: 'Served • 19:24' },
          { name: 'Handmade Pappardelle', price: 56, meta: 'In Kitchen • 19:38' }
        ]
      });
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
  }, [tab.items.length]);

  const add = async (item) => {
    // optimistic
    setTab(t => ({ ...t, items: [...t.items, { name: item.label, price: item.price, meta: 'Fired Just Now • Seat 2' }], total: t.total + item.price }));
    try { const d = await addToTab('8492', { name: item.label, price: item.price }); if (d.total != null) setTab(s => ({ ...s, total: d.total })); }
    catch { /* keep optimistic */ }
  };

  const callServer = async () => {
    setCalling(true);
    try { await notifyServer(); } catch {}
    setTimeout(() => setCalling(false), 3000);
  };

  return (
    <section id="demo" className="w-full py-10 sm:py-16 bg-[#f3f4f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-white border text-sm font-semibold">
            <span className="material-symbols-outlined text-base">touch_app</span> Interactive Guest Interface
          </div>
          <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight">How Diners Experience Reordering in Real Time</h2>
          <div className="flex flex-col gap-3 pt-2">
            <div className="p-4 bg-white rounded-xl shadow-sm flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined">receipt_long</span></div>
              <div><div className="font-bold">Unified Table Tab</div><div className="text-sm text-mute">Multiple phones scan same stand. All parties see items in real time.</div></div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined">notifications_active</span></div>
              <div><div className="font-bold">Discreet Staff Summoning</div><div className="text-sm text-mute">One tap buzzes floor manager's smartwatch discreetly.</div></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          {/* Google Pixel-style phone — compact */}
          <div className="relative w-full max-w-[290px] bg-[#202124] rounded-[1.75rem] p-2.5 shadow-2xl">
            {/* Pixel side buttons */}
            <span className="absolute -right-[3px] top-24 w-[3px] h-12 rounded-full bg-[#3c4043]" />
            <span className="absolute -right-[3px] top-40 w-[3px] h-16 rounded-full bg-[#3c4043]" />
            <span className="absolute -left-[3px] top-28 w-[3px] h-10 rounded-full bg-[#3c4043]" />
            <div className="w-full bg-[#f8f9fa] rounded-[1.25rem] overflow-hidden flex flex-col h-[540px]">
              {/* Pixel punch-hole camera only */}
              <div className="bg-white pt-2.5 pb-1 flex justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-black ring-2 ring-gray-200" title="front camera" />
              </div>
              <div className="bg-white px-3 pb-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-black"></span><span className="text-[10px] font-bold tracking-wider">{tab.table}</span></div>
                <span className="text-[11px] text-mute">Tab #8492</span>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
                <div className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined">soup_kitchen</span>Course 2: Mains Cooking</div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">ETA 6 min</span>
                </div>
                <div className="text-[11px] uppercase tracking-widest text-mute font-bold">Current Table Tab</div>
                {tab.items.map((it, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold ${i >= 2 ? 'bg-ink text-white' : 'bg-gray-100'}`}>{it.qty || 1}</span>
                      <div><div className="text-sm font-bold">{it.name}</div><div className="text-xs text-mute">{it.meta}</div></div>
                    </div>
                    <span className="text-sm font-bold">${Number(it.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] uppercase tracking-widest text-mute font-bold">Quick Reorder Favorites</span>
                  <span className="text-xs font-bold">Instant Kitchen Fire</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quick.map(item => (
                    <div key={item.name} className="bg-white p-3 rounded-xl shadow-sm flex flex-col gap-2">
                      <div><div className="text-[13px] font-bold leading-tight">{item.name}</div><div className="text-xs text-mute">${item.price}.00</div></div>
                      <button onClick={() => add(item)} className="w-full py-1.5 bg-gray-100 hover:bg-ink hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                        <span className="material-symbols-outlined text-sm">add</span>Add +1
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-[#e7e8e9] rounded-xl flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-sm text-mute"><span className="material-symbols-outlined">hail</span>Need silverware or ice?</div>
                  <button onClick={callServer} className={`px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${calling ? 'bg-ink text-white' : 'bg-white'}`}>
                    {calling ? 'Server Notified ✓' : 'Call Server'}
                  </button>
                </div>
              </div>
              <div className="bg-white p-3 shadow flex items-center justify-between">
                <div><div className="text-[11px] text-mute">Current Total (Incl. Tax)</div><div className="font-display font-extrabold text-lg">${tab.total.toFixed(2)}</div></div>
                <button className="px-3.5 py-2 bg-ink text-white rounded-lg text-xs font-bold flex items-center gap-1">Pay Now <span className="material-symbols-outlined text-[13px]">lock</span></button>
              </div>
              {/* Android gesture nav bar */}
              <div className="bg-white pb-1.5 pt-0.5 flex justify-center">
                <div className="w-20 h-1 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
