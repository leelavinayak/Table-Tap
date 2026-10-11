const pos = ['Toast POS', 'Square for Restaurants', 'Clover Hospitality', 'NCR Aloha', 'Oracle Micros Simphony'];

export default function PosIntegration() {
  return (
    <section id="pos" className="w-full py-10 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight mt-1.5">Plugs into Your Existing POS in Under 20 Minutes</h2>
            <p className="text-sm text-mute mt-1.5">No new merchant processors or duplicate printers. Table Tap operates via direct certified API hooks to sync floor plans, live 86-ing, and checks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pos.map(p => (
              <div key={p} className="px-4 py-2 bg-white border border-line rounded-xl shadow-sm text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>{p}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><div className="font-bold">Automated Seat Routing</div><p className="text-sm text-mute">Orders retain seat positions so runners deliver without auctioning food.</p></div>
            <div><div className="font-bold">Dynamic Menu Sync</div><p className="text-sm text-mute">86 Wagyu on POS; diner screens update in 400ms.</p></div>
          </div>
        </div>
        <div className="lg:col-span-5 bg-white border border-line p-8 rounded-2xl shadow-md flex flex-col gap-4">
          <div className="flex gap-1"> {Array(5).fill(0).map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)} </div>
          <blockquote className="text-sm italic">“Table Tap transformed our evening service. Guests order another bottle without waiting on busy Fridays. 24% revenue lift from beverage reorders in 60 days.”</blockquote>
          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-extrabold">MA</div>
            <div><div className="font-bold">Marcus Aurelius Vance</div><div className="text-sm text-mute">Hospitality Group Director • 14 Venues</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
