import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { LOGO } from "./media";

export default function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="relative py-28 overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-24 -right-10 w-96 h-96 bg-emerald-400/25 rounded-full blur-[120px]" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-24 -left-10 w-96 h-96 bg-teal-400/20 rounded-full blur-[120px]" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <img src={LOGO} alt="Qilbo" className="w-16 h-16 rounded-2xl mx-auto mb-6" />
          <h2 className="text-3xl sm:text-6xl font-bold text-white font-heading">Switching takes minutes, not months.</h2>
          <p className="mt-4 text-emerald-100/80 text-lg">Set up your store, pick your categories, and start ringing sales today.</p>
          <button onClick={() => navigate("/setup")} className="group mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-emerald-900 font-semibold hover:shadow-[0_0_50px_-5px] hover:shadow-emerald-400/50 transition-all">
            Start setting up your store <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs text-emerald-100/60">No credit card · Set up in minutes</p>
        </Reveal>
      </div>
    </section>
  );
}