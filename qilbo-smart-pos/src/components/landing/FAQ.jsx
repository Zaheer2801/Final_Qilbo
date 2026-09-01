import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";

const faqs = [
  { q: "What kinds of stores can use Qilbo?", a: "Qilbo is built for independent retailers — liquor stores, smoke shops, grocery and bodegas, convenience stores, and general retail — with category-aware rules for each." },
  { q: "Can Qilbo work with my current POS?", a: "Yes. Qilbo runs as the brain alongside your existing register — pull in sales and inventory from Square, Clover, or Shopify, or use Qilbo's own built-in POS when you're ready." },
  { q: "Does Qilbo support barcode scanning and weighed items?", a: "Yes. Scanner-scale integration, per-lb/kg/oz pricing, and fast checkout are built in — plus a mobile barcode price-check tool." },
  { q: "Can it handle EBT, WIC, and age-restricted sales?", a: "Yes. EBT and WIC eligibility are tracked per item, non-eligible items are blocked from EBT tenders, and liquor/tobacco sales are age-gated with optional ID scanning." },
  { q: "How does tax work across categories?", a: "Qilbo calculates tax per category — separate buckets for liquor, tobacco, grocery (produce, meat, bakery), and retail — configurable in Settings." },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-background py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal><p className="text-primary text-sm font-semibold uppercase tracking-widest text-center">FAQ</p></Reveal>
        <Reveal delay={0.05}><h2 className="text-3xl sm:text-5xl font-bold text-foreground text-center font-heading">Frequently asked questions</h2></Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-foreground">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open === i ? "rotate-180 text-primary" : ""}`} />
                </button>
                {open === i && <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}