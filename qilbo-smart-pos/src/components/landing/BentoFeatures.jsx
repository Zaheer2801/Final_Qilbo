import React from "react";
import { Zap, BrainCircuit, HeartHandshake, ScanLine, Wallet, Check } from "lucide-react";
import Reveal from "./Reveal";
import { Image } from "@/components/ui/image";
import { POS_IMG, INV_IMG, LOY_IMG } from "./media";

const big = {
  icon: Zap,
  title: "Sell more, faster",
  body: "Scanner-scale, EBT, WIC, and pin debit out of the box. Train cashiers in 30 minutes.",
  img: POS_IMG,
  points: ["Barcode scanner & scale", "EBT, WIC & pin debit", "One-touch payments", "30-minute cashier training"],
};

const small = [
  { icon: BrainCircuit, title: "Operate smarter", body: "Category-aware inventory & auto-reorder alerts.", img: INV_IMG, points: ["Category-aware inventory", "Auto-reorder alerts", "Expiry & batch tracking", "Low-stock dashboard"] },
  { icon: HeartHandshake, title: "Keep every customer", body: "Points, VIP tiers & churn alerts.", img: LOY_IMG, points: ["Points & VIP tiers", "Churn alerts", "Birthday rewards", "Lifetime spend tracking"] },
  { icon: ScanLine, title: "Barcode price check", body: "Scan any item to see cost & suggested margin.", points: ["Scan any item", "See cost instantly", "Suggested margin", "One-tap add to inventory"] },
  { icon: Wallet, title: "Split any tender", body: "EBT, WIC, cash & card in a single sale.", points: ["EBT + WIC + cash + card", "Non-eligible blocking", "Age-gate liquor/tobacco", "Per-category tax"] },
];

function Points({ items }) {
  return (
    <ul className="hidden group-hover:block mt-2 space-y-1">
      {items.map((p) => (
        <li key={p} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Check className="w-3 h-3 text-primary shrink-0" /> {p}
        </li>
      ))}
    </ul>
  );
}

export default function BentoFeatures() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><p className="text-primary text-sm font-semibold uppercase tracking-widest text-center">Everything your store needs</p></Reveal>
        <Reveal delay={0.05}><h2 className="text-3xl sm:text-5xl font-bold text-foreground text-center mt-2 max-w-2xl mx-auto font-heading">One system. Total control. <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Zero compromise.</span></h2></Reveal>
        <Reveal delay={0.08}><p className="text-center text-xs text-muted-foreground mt-3">Hover any feature to see everything it includes.</p></Reveal>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[170px]">
          {/* Big card */}
          <Reveal className="col-span-2 row-span-2">
            <div className="group relative h-full rounded-3xl overflow-hidden border border-border bg-muted hover:border-primary/40 transition-colors">
              <Image src={big.img} alt="" className="absolute inset-0 w-full h-full opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" fittingType="fill" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="relative h-full p-6 flex flex-col justify-end">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30"><big.icon className="w-5 h-5 text-white" /></div>
                <h3 className="text-xl font-semibold text-foreground font-heading">{big.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs group-hover:hidden">{big.body}</p>
                <Points items={big.points} />
              </div>
            </div>
          </Reveal>

          {small.map((c, i) => (
            <Reveal key={c.title} delay={0.06 * (i + 1)}>
              <div className="group relative h-full rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-colors">
                {c.img && (
                  <>
                    <Image src={c.img} alt="" className="absolute inset-0 w-full h-full opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500" fittingType="fill" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-card/40" />
                  </>
                )}
                <div className="relative h-full p-5 flex flex-col justify-end">
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center mb-3"><c.icon className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-base font-semibold text-foreground font-heading">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:hidden">{c.body}</p>
                  <Points items={c.points} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}