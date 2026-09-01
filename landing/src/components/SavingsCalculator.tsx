import { useState } from "react";
import { ShieldCheck, Calculator } from "lucide-react";

export default function SavingsCalculator() {
  const [revenue, setRevenue] = useState(45000); // $45k/mo revenue
  const [skuCount, setSkuCount] = useState(650); // 650 SKUs

  // Logic: Avg store loses 3.2% to expiry waste & stockout miscalculations
  const annualRevenue = revenue * 12;
  const estimatedWasteSavings = Math.round(annualRevenue * 0.024);
  const marginLift = Math.round(annualRevenue * 0.015);
  const totalAnnualValue = estimatedWasteSavings + marginLift;

  return (
    <section id="calculator" className="relative py-24 bg-canvas text-ink border-t border-black/[0.06]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-ink/40">
            <Calculator size={14} className="text-amber-800" />
            ROI & Waste Calculator
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mt-3">
            Estimate your annual inventory savings
          </h2>
          <p className="mt-3 text-ink/60 text-sm max-w-[48ch] mx-auto">
            See how much profit Qilbo protects by eliminating shelf expiry waste and preventing low-margin price drift.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-10 items-center bg-white rounded-2xl border border-black/[0.06] shadow-xl p-8 md:p-12">
          {/* Controls Column */}
          <div className="md:col-span-7 space-y-8">
            {/* Control 1: Monthly Revenue */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-ink/70">Estimated Monthly Sales:</span>
                <span className="font-display font-bold text-amber-800 text-lg">
                  ${revenue.toLocaleString()} / mo
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
              />
              <div className="flex justify-between text-[11px] text-ink/40">
                <span>$10,000</span>
                <span>$100,000</span>
                <span>$250,000+</span>
              </div>
            </div>

            {/* Control 2: Active SKU Count */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-ink/70">Active Product SKUs:</span>
                <span className="font-display font-bold text-amber-800 text-lg">
                  {skuCount.toLocaleString()} SKUs
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={skuCount}
                onChange={(e) => setSkuCount(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
              />
              <div className="flex justify-between text-[11px] text-ink/40">
                <span>100 SKUs</span>
                <span>1,500 SKUs</span>
                <span>3,000+ SKUs</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-ink/50 space-y-1.5 border-t border-black/[0.04]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-800 shrink-0" />
                <span>Based on retail benchmarks: 2.4% reduction in dead-stock & expiry write-offs.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-800 shrink-0" />
                <span>Includes 1.5% margin recovery via automated category price guardrails.</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="md:col-span-5 bg-amber-50/60 rounded-xl border border-amber-800/15 p-6 md:p-8 text-center space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900/60">
                Estimated Annual Retained Profit
              </span>
              <div className="font-display text-4xl md:text-5xl font-extrabold text-amber-900 mt-2">
                +${totalAnnualValue.toLocaleString()}
              </div>
              <span className="inline-block mt-2 text-xs font-medium text-amber-800 bg-amber-200/60 px-3 py-1 rounded-full border border-amber-300">
                ~${Math.round(totalAnnualValue / 12).toLocaleString()} / month added
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-amber-800/10 text-left">
              <div className="bg-white p-3.5 rounded-lg border border-amber-900/10">
                <div className="text-[11px] text-ink/50 uppercase font-semibold">Expiry Waste</div>
                <div className="font-display font-bold text-amber-900 text-base mt-1">
                  ${estimatedWasteSavings.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-amber-900/10">
                <div className="text-[11px] text-ink/50 uppercase font-semibold">Margin Lift</div>
                <div className="font-display font-bold text-amber-900 text-base mt-1">
                  ${marginLift.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
