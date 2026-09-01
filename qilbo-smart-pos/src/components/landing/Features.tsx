import { useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { features } from "../../data/content";

/** Sticky/pinned numbered feature list — left column stays fixed while the
 * right panel swaps per item as the user scrolls through the section's
 * total height (~90vh per item, so each gets real scroll room before
 * advancing). */
export default function Features() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: `+=${(features.length - 1) * 100}%`,
        scrub: 0.3,
        pin: true,
        onUpdate: (self) => {
          const idx = Math.min(features.length - 1, Math.round(self.progress * (features.length - 1)));
          setActive(idx);
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={wrapRef} className="relative h-screen overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-full grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-ink/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
            Built for how a store actually runs
          </span>
          <div className="mt-6 space-y-1">
            {features.map((f, i) => (
              <div
                key={f.n}
                className={`flex items-start gap-4 py-3 border-l-2 pl-4 transition-colors duration-300 ${
                  i === active ? "border-amber-800" : "border-black/[0.06]"
                }`}
              >
                <span className={`font-display text-sm mt-0.5 shrink-0 ${i === active ? "text-amber-800" : "text-ink/30"}`}>{f.n}</span>
                <div>
                  <div className={`font-medium transition-colors duration-300 ${i === active ? "text-ink" : "text-ink/35"}`}>{f.title}</div>
                  {i === active && <p className="text-sm text-ink/55 mt-1.5 max-w-[42ch] leading-relaxed">{f.body}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white rounded-2xl border border-black/[0.06] shadow-xl aspect-[4/3] flex items-center justify-center overflow-hidden">
          {features.map((f, i) => (
            <div
              key={f.n}
              className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center transition-opacity duration-500"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              <span className="font-display text-6xl text-amber-800/20 font-bold">{f.n}</span>
              <div className="font-display text-xl font-semibold text-ink mt-4">{f.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
