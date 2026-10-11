import { useEffect, useState } from 'react';
import { fetchRestaurants } from '../api';
import { fallbackRestaurants } from '../data/restaurants';

// Extra partners to fill the two scrolling rows
// (Admin-added partner restaurants from the API appear first.
//  User-submitted logos are NOT auto-shown — admin adds them manually.)
const extraPartners = [
  { name: 'Osteria Stella', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=60' },
  { name: 'Bluefin Raw Bar', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&q=60' },
  { name: 'Ember & Oak', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=60' },
  { name: 'Casa Verde', image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=200&q=60' },
  { name: 'The Copper Fork', image: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=200&q=60' },
  { name: 'Juniper Room', image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=200&q=60' },
  { name: 'Saffron House', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&q=60' },
  { name: 'Moonlight Izakaya', image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=200&q=60' },
  { name: 'Harvest & Hops', image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=200&q=60' },
];

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// Logo only — no text (admin-curated only)
function LogoOnly({ name, image }) {
  return (
    <div
      title={name}
      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-line shadow-sm overflow-hidden shrink-0 flex items-center justify-center"
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span className="w-full h-full bg-ink text-white flex items-center justify-center text-lg font-extrabold">
          {initials(name)}
        </span>
      )}
    </div>
  );
}

export default function PartnerNetwork() {
  const [list, setList] = useState(() => [
    ...fallbackRestaurants.map(r => ({ name: r.name, image: r.image })),
    ...extraPartners
  ]);

  useEffect(() => {
    fetchRestaurants().then(data => {
      if (Array.isArray(data) && data.length) {
        const apiLogos = data.map(r => ({ name: r.name, image: r.image }));
        setList([...apiLogos, ...extraPartners]);
      }
    }).catch(() => {});
  }, []);

  const mid = Math.ceil(list.length / 2);
  const rowA = list.slice(0, mid);
  const rowB = list.slice(mid);

  return (
    <section id="partners" className="w-full py-10 sm:py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 text-center flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-widest text-mute font-bold">Global Footprint</div>
        <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight">Trusted by Premier Dining Destinations</h2>
        <div className="inline-flex items-center justify-center gap-2 mt-1">
          <span className="px-3 py-1 rounded-full bg-ink text-white text-sm font-extrabold">540+ Partner Restaurants</span>
        </div>
      </div>

      {/* Row 1 — scrolls left, logos only (admin-added) */}
      <div className="mt-6 overflow-hidden marquee-paused">
        <div className="flex gap-5 w-max animate-scroll-left px-3">
          {[...rowA, ...rowA].map((r, i) => (
            <LogoOnly key={`a-${i}-${r.name}`} name={r.name} image={r.image} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right, logos only (admin-added) */}
      <div className="mt-5 overflow-hidden marquee-paused">
        <div className="flex gap-5 w-max animate-scroll-right px-3">
          {[...rowB, ...rowB].map((r, i) => (
            <LogoOnly key={`b-${i}-${r.name}`} name={r.name} image={r.image} />
          ))}
        </div>
      </div>
    </section>
  );
}
