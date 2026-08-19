import React, { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

function Counter({ to, suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let raf; let started = false;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !started) {
          started = true;
          const start = performance.now(); const dur = 1400;
          const tick = (t) => { const p = Math.min(1, (t - start) / dur); setN(Math.round(to * (0.5 - Math.cos(Math.PI * p) / 2))); if (p < 1) raf = requestAnimationFrame(tick); };
          raf = requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

const stats = [
  { to: 6, suffix: "%", label: "Average margin improvement", sub: "in the first 90 days" },
  { to: 22, suffix: "%", label: "Lift in repeat revenue", sub: "from loyalty" },
  { to: 70, suffix: "%", label: "Less time on inventory", sub: "with auto-reorder" },
  { to: 500, suffix: "+", label: "Independent stores", sub: "running on Qilbo" },
];

export default function StatsSection() {
  return (
    <section className="relative bg-background py-24 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-emerald-400/10 rounded-full blur-[140px]" />
      <div className="relative max-w-6xl mx-auto px-6">
        <Reveal><p className="text-primary text-sm font-semibold uppercase tracking-widest text-center">Real numbers from real stores</p></Reveal>
        <Reveal delay={0.05}><h2 className="text-3xl sm:text-5xl font-bold text-foreground text-center font-heading">Outcomes that show up on the register.</h2></Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="text-center">
                <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-heading"><Counter to={s.to} suffix={s.suffix} /></div>
                <div className="text-sm text-foreground mt-2">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}