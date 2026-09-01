import React from "react";
import { AlertTriangle, Lightbulb, Store } from "lucide-react";
import Reveal from "./Reveal";

const cards = [
  { tag: "THE PROBLEM", icon: AlertTriangle, title: "High-tender, margin-tight — and underserved.", body: "Slow lines during the rush, shelves running empty on top sellers, vendor price hikes you don't catch until the margin's gone. Software built for everyone else wasn't built for a cash-heavy, age-restricted, multi-tender store." },
  { tag: "THE INSIGHT", icon: Lightbulb, title: "Big platforms were built for someone else's store.", body: "Square ran a glass-art studio. Clover is a bank product. They don't understand EBT, age verification, or corner-store margin math — because nobody who built them ever stood behind your counter." },
  { tag: "THE SOLUTION", icon: Store, title: "Qilbo was built behind the counter.", body: "One system for POS, inventory, loyalty, and back office — with category-aware rules for liquor, tobacco, grocery, and retail, and per-category tax out of the box." },
];

export default function WhySection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest text-center">Why Qilbo</p></Reveal>
        <Reveal delay={0.05}><h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mt-2 max-w-2xl mx-auto">Built for the corner-store operator everyone else walked away from.</h2></Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {cards.map((c, i) => (
            <Reveal key={c.tag} delay={i * 0.08}>
              <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4"><c.icon className="w-5 h-5 text-emerald-600" /></div>
                <div className="text-[11px] font-semibold tracking-widest text-emerald-600 mb-2">{c.tag}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}