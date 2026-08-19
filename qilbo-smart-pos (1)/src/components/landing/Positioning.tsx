import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";

/** Two circles start apart and merge into a literal Venn diagram as the
 * section scrolls — separation is tied directly to scroll progress. */
export default function Positioning() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const overlapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const overlap = overlapRef.current;
    if (!section || !left || !right || !overlap) return;

    const ctx = gsap.context(() => {
      gsap.set(overlap, { opacity: 0 });
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=100%",
        scrub: 0.3,
        pin: true,
        onUpdate: (self) => {
          const p = self.progress;
          const offset = (1 - p) * 160; // px each circle starts away from center
          gsap.set(left, { x: -offset });
          gsap.set(right, { x: offset });
          gsap.set(overlap, { opacity: Math.max(0, (p - 0.7) / 0.3) });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden flex items-center justify-center bg-canvas">
      <div className="max-w-[1000px] w-full px-6 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-ink/40 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
          Who's actually in charge
        </span>
        <div className="relative h-[340px] flex items-center justify-center">
          <div ref={leftRef} className="absolute w-64 h-64 rounded-full bg-amber-100 border border-amber-800/20 flex items-center justify-center p-8">
            <div>
              <div className="font-display text-lg font-semibold text-ink">You decide</div>
              <p className="text-sm text-ink/60 mt-2">Pricing calls, vendor relationships, what's worth carrying.</p>
            </div>
          </div>
          <div ref={rightRef} className="absolute w-64 h-64 rounded-full bg-stone-100 border border-ink/10 flex items-center justify-center p-8">
            <div>
              <div className="font-display text-lg font-semibold text-ink">Qilbo tracks</div>
              <p className="text-sm text-ink/60 mt-2">Stock levels, sell-through pace, margin math, expiry risk.</p>
            </div>
          </div>
          <div ref={overlapRef} className="relative z-10 max-w-[220px] pointer-events-none">
            <p className="font-display text-sm font-semibold text-amber-900 bg-canvas/90 rounded-md px-3 py-2">
              Nothing moves without your approval
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
