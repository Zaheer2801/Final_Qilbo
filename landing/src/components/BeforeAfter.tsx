import { useLayoutEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { gsap } from "../lib/gsap";
import { afterList, beforeList } from "../data/content";

/** One card, two states — crossfades cleanly as the section scrolls
 * past, tied 1:1 to scroll progress (scrub), without overlapping text. */
export default function BeforeAfter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const [isAfter, setIsAfter] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!section || !before || !after) return;

    const ctx = gsap.context(() => {
      gsap.set(after, { opacity: 0 });
      gsap.set(before, { opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=100%",
          scrub: 0.3,
          pin: true,
          onUpdate: (self) => {
            setIsAfter(self.progress > 0.5);
          },
        },
      });

      // Sequence animations so before fades out completely BEFORE after fades in
      tl.to(before, { opacity: 0, duration: 0.45, ease: "power1.out" }, 0)
        .to(after, { opacity: 1, duration: 0.45, ease: "power1.in" }, 0.55);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center py-24 bg-canvas text-ink">
      <div className="max-w-[720px] w-full mx-auto px-6 md:px-10">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-ink/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
            The execution gap
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mt-3">
            Running inventory <span className="text-amber-800">{isAfter ? "after" : "before"}</span> Qilbo
          </h2>
        </div>

        <div className="relative bg-white rounded-2xl border border-black/[0.06] shadow-lg p-8 md:p-10 min-h-[280px]">
          <div ref={beforeRef} className="absolute inset-0 p-8 md:p-10 flex flex-col justify-center gap-4">
            {beforeList.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <X size={16} className="text-red-500 mt-0.5 shrink-0" />
                <span className="text-ink/60">{item}</span>
              </div>
            ))}
          </div>
          <div ref={afterRef} className="absolute inset-0 p-8 md:p-10 flex flex-col justify-center gap-4">
            {afterList.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check size={16} className="text-amber-700 mt-0.5 shrink-0" />
                <span className="text-ink/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


