import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STORE_VIDEOS } from "./media";

export default function HeroVideoCarousel() {
  const [i, setI] = useState(0);
  const timer = useRef(null);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setI((p) => (p + 1) % STORE_VIDEOS.length), 5000);
  };
  useEffect(() => { reset(); return () => clearInterval(timer.current); }, []);

  const go = (idx) => { setI(idx); reset(); };

  return (
    <div className="relative aspect-[4/5] sm:aspect-[4/3]">
      {/* soft glow halo that ties video to the hero background */}
      <div className="absolute -inset-8 bg-gradient-to-tr from-emerald-400/25 to-teal-400/10 rounded-[3rem] blur-3xl" />

      <div
        className="relative w-full h-full overflow-hidden rounded-[2rem]"
        style={{
          WebkitMaskImage: "radial-gradient(120% 120% at 50% 45%, #000 62%, transparent 100%)",
          maskImage: "radial-gradient(120% 120% at 50% 45%, #000 62%, transparent 100%)",
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <video src={STORE_VIDEOS[i].url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            {/* blend edges into the emerald hero */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-transparent to-emerald-900/30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,#064e3b_115%)]" />
          </motion.div>
        </AnimatePresence>

        {/* floating store label */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 backdrop-blur-md border border-white/10">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-white font-medium">{STORE_VIDEOS[i].label}</span>
        </div>
      </div>

      {/* dots outside the mask so they stay crisp */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5">
        {STORE_VIDEOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => go(idx)}
            aria-label={`Show ${STORE_VIDEOS[idx].label}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </div>
  );
}