import { useLayoutEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { toasts } from "../data/content";

/** Toast notification loop — autoplay, independent of scroll (per spec:
 * only the hero loop and a logo strip run outside scroll-scrubbing; we
 * don't have a logo strip since there are no real clients to show). One
 * card spawns at the bottom of the stack, drifts up, fades, and is
 * recycled to the back of the queue — runs forever. */
function ActivityStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.set(card, { opacity: 0, y: 24 });
        gsap
          .timeline({ repeat: -1, delay: i * 2.4 })
          .to(card, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
          .to(card, { opacity: 1, y: -4, duration: cards.length * 2.4 - 1.4 })
          .to(card, { opacity: 0, y: -20, duration: 0.6, ease: "power2.in" });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-14">
      {toasts.map((t) => (
        <div
          key={t}
          className="absolute inset-x-0 flex items-center gap-2.5 bg-white rounded-lg border border-black/[0.06] shadow-md px-4 py-3"
        >
          <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
          <span className="text-sm text-ink/80">{t}</span>
        </div>
      ))}
    </div>
  );
}

function ArcBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M -100 650 Q 400 400 1300 500" stroke="#92400E" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M -100 720 Q 500 500 1300 600" stroke="#92400E" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
    </svg>
  );
}

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
      <ArcBackground />
      <div className="relative max-w-[1240px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block text-xs font-medium tracking-wide uppercase text-amber-800 bg-amber-100 rounded-full px-3 py-1 mb-6">
            Inventory intelligence for your POS
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.08] font-bold tracking-tight text-ink">
            Stock it right. <span className="text-amber-800">Qilbo does the counting.</span>
          </h1>
          <p className="mt-6 text-lg text-ink/60 leading-relaxed max-w-[46ch]">
            Qilbo plugs into the POS you already use and turns your sales data into reorder timing, margin
            guardrails, and expiry warnings — before a shelf goes empty or a bottle goes to waste.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center rounded-md bg-amber-800 text-amber-50 text-sm font-medium px-5 py-3 hover:bg-amber-900 transition-colors"
            >
              Get started
            </button>
            <a href="#workflow" className="inline-flex items-center text-sm font-medium text-ink/70 hover:text-ink transition-colors">
              See how it works →
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-xl p-6">
            <div className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-4">What Qilbo tracks</div>
            <ActivityStack />
          </div>
        </div>
      </div>
    </section>
  );
}
