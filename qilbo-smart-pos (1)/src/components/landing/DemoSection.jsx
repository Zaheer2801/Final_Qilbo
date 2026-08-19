import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, PackageCheck, FileText, TrendingUp, HeartHandshake, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { Image } from "@/components/ui/image";
import { BRAIN_IMG } from "./media";

const capabilities = [
  { icon: PackageCheck, title: "Auto-reorder", body: "Watches stock levels and drafts purchase orders before a shelf ever goes empty.", color: "from-emerald-400 to-emerald-600" },
  { icon: FileText, title: "Invoice matching", body: "Reads vendor invoices, checks every line, and flags price hikes the moment they happen.", color: "from-teal-400 to-emerald-600" },
  { icon: TrendingUp, title: "Margin tracking", body: "Knows your COGS and alerts you when a product slips below your margin policy.", color: "from-emerald-500 to-teal-600" },
  { icon: HeartHandshake, title: "Win-backs", body: "Spots quiet regulars and sends the right coupon by text or email before you lose them.", color: "from-emerald-400 to-teal-500" },
];

export default function DemoSection() {
  return (
    <section id="demo" className="relative bg-background py-24 overflow-hidden">
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-[120px]" />
      <motion.div animate={{ x: [0, -40, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-400/10 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-primary text-xs font-medium mb-5 mx-auto">
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Sparkles className="w-3.5 h-3.5" /></motion.span>
            The agentic brain
          </div>
        </Reveal>
        <Reveal delay={0.05}><h2 className="text-3xl sm:text-6xl font-bold text-foreground text-center max-w-3xl mx-auto leading-[1.05] font-heading">Meet the brain that runs your store <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">while you run your store.</span></h2></Reveal>
        <Reveal delay={0.1}><p className="mt-4 text-muted-foreground text-lg text-center max-w-2xl mx-auto">Qilbo's AI handles the tedious work — reorders, invoice matching, margin tracking, and win-backs — so you can spend your day on the floor, not the back office.</p></Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-14 max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-400/20 via-teal-400/10 to-emerald-500/20 rounded-[2rem] blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
              <Image src={BRAIN_IMG} alt="Qilbo agentic brain" className="w-full" fittingType="fit" />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur border border-border">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-foreground font-medium">Agentic brain</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="group h-full rounded-3xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20`}><c.icon className="w-5 h-5 text-white" /></div>
                <h3 className="text-base font-semibold text-foreground font-heading">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.body}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Automated
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex items-center justify-center gap-3 text-muted-foreground text-sm">
            <BrainCircuit className="w-5 h-5 text-primary" />
            One brain. Inventory, invoices, margins, and loyalty — working together automatically.
          </div>
        </Reveal>
      </div>
    </section>
  );
}