import { useLayoutEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { workflow } from "../data/content";

/** Numbered workflow cards on a full-bleed amber section — reveal
 * left-to-right as the row scrolls into view (staggered fade + slide),
 * triggered once rather than scrubbed continuously. */
export default function Workflow() {
  const rowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const cards = Array.from(row.children) as HTMLElement[];

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        opacity: 0,
        x: -24,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: row,
          start: "top 80%",
        },
      });
    }, row);

    return () => ctx.revert();
  }, []);

  return (
    <section id="workflow" className="relative bg-amber-800 py-24 md:py-28">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-amber-100/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
            Every reorder. Handled the same way.
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-amber-50 mt-3">From flagged to received</h2>
        </div>

        <div ref={rowRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {workflow.map((w) => (
            <div key={w.n} className="bg-amber-900/40 border border-amber-100/10 rounded-xl p-5">
              <span className="font-display text-xs text-amber-200/60">{w.n}</span>
              <div className="font-display font-semibold text-amber-50 mt-2">{w.label}</div>
              <p className="text-xs text-amber-100/60 mt-1.5 leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
