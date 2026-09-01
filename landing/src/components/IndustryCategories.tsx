import { useState } from "react";
import { Wine, ShoppingBag, Store, CheckCircle } from "lucide-react";

const CATEGORIES = [
  {
    id: "liquor",
    icon: Wine,
    title: "Liquor & Wine Stores",
    description: "Handle high-value spirits, batch tracking, state liquor tax math, and vintage expiry windows.",
    highlights: [
      "Automatic tax calculation per bottle size & proof",
      "Vintage & batch expiration tracking",
      "Distributor pricebook CSV import",
      "Margin floor protection on premium spirits",
    ],
    image: "/pos_hero_bg.jpg",
  },
  {
    id: "grocery",
    icon: ShoppingBag,
    title: "Convenience & Grocery",
    description: "Prevent fast-moving perishable inventory from spoiling while automating weekly vendor POs.",
    highlights: [
      "Perishable expiration alert lead times",
      "Sales velocity-based reorder thresholds",
      "Multi-category margin rules",
      "Quick barcode and photo scanning",
    ],
    image: "/smart_inventory_tech.jpg",
  },
  {
    id: "retail",
    icon: Store,
    title: "Boutique & Retail",
    description: "Maintain healthy gross margins on seasonal apparel, accessories, and specialty goods.",
    highlights: [
      "Seasonal stock-out prevention",
      "Audit trail of manual count adjustments",
      "Local offline data privacy guarantee",
      "Zero lock-in local browser storage",
    ],
    image: "/retail_pos_terminal.jpg",
  },
];

export default function IndustryCategories() {
  const [activeTab, setActiveTab] = useState(0);
  const activeCat = CATEGORIES[activeTab];

  return (
    <section className="relative py-24 bg-canvas text-ink border-t border-black/[0.06]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-ink/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
            Retail Adaptability
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mt-3">
            Tailored for your specific store category
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = idx === activeTab;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? "bg-amber-800 text-amber-50 border-amber-800 shadow-md"
                    : "bg-white text-ink/70 border-black/[0.08] hover:border-black/20 hover:text-ink"
                }`}
              >
                <Icon size={18} />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-xl overflow-hidden grid md:grid-cols-12">
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold text-ink">{activeCat.title}</h3>
              <p className="text-ink/65 text-base leading-relaxed">{activeCat.description}</p>
              
              <div className="pt-4 space-y-3">
                {activeCat.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-3 text-sm text-ink/80">
                    <CheckCircle size={18} className="text-amber-800 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-black/[0.04] mt-8 flex items-center justify-between text-xs text-ink/50">
              <span>Runs 100% offline & locally on your store device</span>
              <span className="font-mono font-semibold text-amber-800">Local-First Engine</span>
            </div>
          </div>

          <div className="md:col-span-5 relative min-h-[260px] bg-stone-100 border-l border-black/[0.06]">
            <img
              src={activeCat.image}
              alt={activeCat.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs font-semibold text-amber-100 bg-amber-900/80 px-3 py-1.5 rounded-md backdrop-blur-sm">
                {activeCat.title} POS View
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
