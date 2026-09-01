import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, ScanLine, Wallet, ShieldCheck } from "lucide-react";
import HeroVideoCarousel from "./HeroVideoCarousel";
import { LOGO } from "./media";

export default function Hero() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
      <motion.div animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-32 -left-24 w-[36rem] h-[36rem] bg-emerald-400/25 rounded-full blur-[120px]" />
      <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/3 -right-24 w-[34rem] h-[34rem] bg-teal-400/20 rounded-full blur-[120px]" />
      <motion.div animate={{ x: [0, 40, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] bg-emerald-500/20 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,#064e3b_80%)]" />

      <motion.div style={{ y, opacity, scale }} className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-100 text-xs font-medium mb-6">
              <img src={LOGO} alt="" className="w-5 h-5 rounded" /> Built by store owners, for store owners
            </motion.div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.02] font-heading">
              The brain behind{" "}
              <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-300 bg-clip-text text-transparent">your store</span>
            </h1>
            <p className="mt-6 text-lg text-emerald-100/80 max-w-xl">
              Qilbo runs alongside your existing POS — or replaces it. Inventory, margins, loyalty, and category-aware tax for liquor, tobacco, grocery, and retail, all in one colorful dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => navigate("/setup")} className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-emerald-900 font-semibold hover:shadow-[0_0_40px_-5px] hover:shadow-emerald-400/50 transition-all">
                Start free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#demo" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-medium border border-white/15 hover:bg-white/15 transition-colors">
                <Play className="w-4 h-4" /> See it in action
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-emerald-100/70">
              <span className="flex items-center gap-1.5"><ScanLine className="w-4 h-4 text-emerald-300" /> Scanner & scale</span>
              <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-300" /> EBT / WIC</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-300" /> Age-gated</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} style={{ y: mockupY }} className="relative hidden lg:block">
            <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-400/30 to-teal-400/10 rounded-[2rem] blur-2xl" />
            <HeroVideoCarousel />
          </motion.div>
        </div>
      </motion.div>

      <motion.div animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-emerald-200/70 text-[10px] tracking-[0.3em]">SCROLL</motion.div>
    </section>
  );
}