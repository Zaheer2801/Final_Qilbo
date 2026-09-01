import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LOGO } from "./media";

export default function SiteHeader() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
          <div className="relative">
            <motion.span
              className="absolute inset-0 rounded-xl bg-emerald-400/40 blur-xl"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0.4, 1.4, 1.8] }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            />
            <motion.img
              src={LOGO}
              alt="Qilbo"
              className="relative w-14 h-14 rounded-xl shadow-lg shadow-emerald-500/30"
              initial={{ scale: 0.5, opacity: 0, rotate: -14, y: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            />
          </div>
          <span className={`font-semibold text-lg tracking-tight font-heading ${scrolled ? "text-foreground" : "text-white"}`}>Qilbo</span>
        </button>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {["features", "workflow", "demo", "faq"].map((h) => (
            <a key={h} href={`#${h}`} className={`capitalize transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}>{h}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")} className={`hidden sm:block text-sm ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}>Sign in</button>
          <button onClick={() => navigate("/setup")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Book a demo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}