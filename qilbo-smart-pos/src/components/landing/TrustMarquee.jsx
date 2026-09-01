import React from "react";
import { Wine, Flame, ShoppingCart, ShoppingBag, Store, Coffee, Utensils, Truck } from "lucide-react";

const items = [
  { icon: Wine, label: "Liquor stores" },
  { icon: Flame, label: "Smoke shops" },
  { icon: ShoppingCart, label: "Grocery & bodegas" },
  { icon: ShoppingBag, label: "Retail" },
  { icon: Coffee, label: "Cafés" },
  { icon: Utensils, label: "Carnicerías" },
  { icon: Truck, label: "Convenience" },
  { icon: Store, label: "Markets" },
];

export default function TrustMarquee() {
  const row = [...items, ...items];
  return (
    <section className="bg-slate-50 py-10 border-b border-slate-200">
      <p className="text-center text-xs uppercase tracking-widest text-slate-400 mb-6">Built for every kind of independent store</p>
      <div className="relative overflow-hidden">
        <div className="flex gap-10 animate-marquee w-max">
          {row.map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500 shrink-0">
              <it.icon className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium whitespace-nowrap">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}