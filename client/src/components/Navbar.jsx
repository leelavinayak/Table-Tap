import { useEffect, useState } from 'react';

export default function Navbar() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (!showComingSoon) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowComingSoon(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showComingSoon]);
  return (
    <>
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="#/" className="flex items-center gap-2.5">
            <img src="/Table_Tap_Logo.png" alt="Table Tap Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-white shadow-sm ring-1 ring-line" />
            <div className="leading-tight">
              <div className="font-display font-extrabold text-xl md:text-2xl tracking-tight">Table Tap</div>
            </div>
          </a>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowComingSoon(true)}
            className="px-4 md:px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-bold shadow-[0_10px_24px_-10px_rgba(12,16,20,0.6)] hover:bg-char active:scale-[0.98] transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">smartphone</span>
            Get the App
          </button>
        </div>
      </div>
    </header>
      {showComingSoon && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setShowComingSoon(false)}
          style={{ animation: 'tt-fade-in 0.25s ease-out' }}
        >
          <style>{`@keyframes tt-fade-in { from { opacity: 0; } to { opacity: 1; } } @keyframes tt-pop-in { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
          <div
            className="relative w-full max-w-[420px] m-auto bg-white rounded-[1.75rem] shadow-[0_25px_80px_-12px_rgba(0,0,0,0.5)] overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'tt-pop-in 0.32s cubic-bezier(0.22,1,0.36,1)' }}
          >
            <button
              onClick={() => setShowComingSoon(false)}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition text-lg font-bold"
            >
              ×
            </button>

            {/* Body */}
            <div className="px-6 md:px-8 pt-8 pb-6 flex flex-col items-center gap-3 bg-white">
              <p className="font-display font-bold text-[17px] leading-snug text-ink">
                We are adding restaurants<br />on Table Tap
              </p>

              <p className="text-[13.5px] leading-relaxed text-mute max-w-[300px]">
                Thank you for showcasing your interest on Table Tap.
              </p>

              <p className="font-display font-extrabold text-[15px] text-ink">
                Thank You!
              </p>

              <div className="w-full h-px bg-line my-1" />

              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-3 rounded-xl bg-ink text-white text-sm font-bold shadow-[0_10px_25px_-8px_rgba(12,16,20,0.6)] hover:bg-char hover:shadow-lg active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                Got it
              </button>
              <div className="text-[11px] text-mute">Stay tuned — something delicious is cooking.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
