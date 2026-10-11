import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const [angle, setAngle] = useState(0);
  const dragging = useRef(false);
  const animating = useRef(false);
  const lastX = useRef(0);
  const angleRef = useRef(0);

  // Flip to the other side every 10s: logo <-> scanner — no continuous rotation
  const flipSide = () => {
    if (dragging.current || animating.current) return;
    animating.current = true;
    const start = angleRef.current;
    const dur = 1500;
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      angleRef.current = (start + 180 * ease(t)) % 360;
      setAngle(angleRef.current);
      if (t < 1) requestAnimationFrame(frame);
      else animating.current = false;
    };
    requestAnimationFrame(frame);
  };

  // Alternate sides every 10 seconds
  useEffect(() => {
    const id = setInterval(flipSide, 10000);
    return () => clearInterval(id);
  }, []);

  const onDown = (e) => {
    dragging.current = true;
    lastX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  };
  const onMove = (e) => {
    if (!dragging.current || animating.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? lastX.current;
    const dx = x - lastX.current;
    lastX.current = x;
    angleRef.current = (angleRef.current + dx * 0.6) % 360;
    setAngle(angleRef.current);
  };
  const stop = () => { dragging.current = false; };

  const openApp = () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="w-full bg-cream py-8 sm:py-10 lg:py-0 lg:min-h-[calc(100vh-5rem)] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center w-full">
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
          {/* <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white border border-line text-[12px] font-semibold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-ink animate-pulse"></span>
            No App Download Required • Instant PWA
          </div> */}
          <div>
            <h1 className="font-display font-extrabold tracking-tight text-[26px] leading-[1.12] sm:text-3xl md:text-4xl sm:leading-[1.1]">
              Order & Reorder from Your Table. <span className="text-mute font-bold">Zero Waiter Delays.</span>
            </h1>
            <p className="mt-3 text-[15px] sm:text-sm text-mute max-w-2xl leading-relaxed">
              Empowering diners to scan the interactive QR stand, explore real-time digital menus, fire kitchen tickets instantly, and request another round in 2 taps—without flagging down busy servers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
            <button onClick={openApp}
              className="w-full sm:w-auto justify-center px-5 py-3 rounded-xl bg-ink text-white text-sm font-bold shadow-[0_12px_28px_-12px_rgba(12,16,20,0.6)] hover:bg-char active:scale-[0.99] transition flex items-center gap-2">
              Try Interactive Demo <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <button onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto justify-center px-5 py-3 rounded-xl bg-white border border-line text-sm font-bold shadow-sm active:scale-[0.99] transition flex items-center gap-2">
              <span className="material-symbols-outlined text-base">storefront</span> View 540+ Partner Restaurants
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 px-1 sm:px-0">
            <div><div className="font-display font-extrabold text-lg sm:text-xl">42s</div><div className="text-[11px] sm:text-xs text-mute leading-snug">Table-to-Kitchen routing</div></div>
            <div><div className="font-display font-extrabold text-lg sm:text-xl">+32%</div><div className="text-[11px] sm:text-xs text-mute leading-snug">Drink & dessert reorders</div></div>
            <div><div className="font-display font-extrabold text-lg sm:text-xl">100%</div><div className="text-[11px] sm:text-xs text-mute leading-snug">Server focus on guest care</div></div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center gap-3">
          {/* 3D rotating circle — drag with mouse */}
          <div
            className="select-none touch-none"
            style={{ perspective: '1200px', cursor: dragging.current ? 'grabbing' : 'grab' }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={stop}
            onPointerLeave={stop}
          >
            <div
              className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 xl:w-80 xl:h-80"
              style={{ transform: `rotateY(${angle}deg)`, transformStyle: 'preserve-3d' }}
            >
              {/* Front — logo */}
              <div
                className="absolute inset-0 rounded-full overflow-hidden bg-white shadow-2xl border border-line"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <img alt="Table Tap Logo" className="w-full h-full object-contain p-8 pointer-events-none"
                  src="/Table_Tap_Logo.png" draggable={false} />
              </div>
              {/* Back — scanner that opens Table Tap */}
              <div
                className="absolute inset-0 rounded-full overflow-hidden bg-ink text-white shadow-2xl flex flex-col items-center justify-center gap-2 p-6 text-center"
                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
              >
                <span className="material-symbols-outlined text-5xl">qr_code_scanner</span>
                <div className="font-extrabold text-sm">Scan to open Table Tap</div>
                <div className="text-xs text-gray-300">Point your phone camera at this circle on the table stand</div>
                <button
                  onClick={openApp}
                  onPointerDown={e => e.stopPropagation()}
                  className="mt-1 px-4 py-2 rounded-lg bg-white text-black text-sm font-bold"
                >
                  Open Table Tap
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-mute">Shows scanner every 10s • drag to rotate</div>
        </div>
      </div>
    </section>
  );
}
