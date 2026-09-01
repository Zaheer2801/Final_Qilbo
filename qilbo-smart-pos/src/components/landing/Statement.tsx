import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";

/** Full-bleed section: a solid circle scales from a small dot to full
 * viewport coverage, scrubbed 1:1 with scroll position, headline fading in
 * once the circle has mostly filled the frame. */
export default function Statement() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const circle = circleRef.current;
    const text = textRef.current;
    if (!section || !circle || !text) return;

    const ctx = gsap.context(() => {
      gsap.set(circle, { scale: 0 });
      gsap.set(text, { opacity: 0 });
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=120%",
        scrub: 0.3,
        pin: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(circle, { scale: Math.min(1, p * 1.6) });
          gsap.set(text, { opacity: Math.max(0, (p - 0.55) / 0.35) });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-charcoal flex items-center justify-center">
      <div ref={circleRef} className="absolute w-[140vmax] h-[140vmax] rounded-full bg-amber-800" />
      <div ref={textRef} className="relative max-w-[720px] px-6 text-center">
        <p className="font-display text-2xl md:text-4xl font-semibold text-amber-50 leading-snug">
          Every store keeps inventory in someone's head.
          <br />
          Qilbo puts it somewhere you can see.
        </p>
      </div>
    </section>
  );
}
