import type { AppState } from "../../types";
import { expiryUrgency } from "../../lib/businessLogic";
import { card, Tag } from "../ui";

export default function ExpiryTab({ state }: { state: AppState }) {
  const withExpiry = state.products.filter((p) => p.expiryDate).map((p) => ({ p, risk: expiryUrgency(p, state.sales)! }));
  return (
    <div className={card}>
      <h3 className="text-sm font-semibold mb-3">Expiry risk</h3>
      {withExpiry.length === 0 && <p className="text-stone-400 italic text-sm">No products with an expiry date on file.</p>}
      {withExpiry.map(({ p, risk }) => (
        <div key={p.id} className="py-2 border-b border-stone-50 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {p.name} {p.size}
            </span>
            <Tag tone={risk.tier === "High" ? "red" : risk.tier === "Medium" ? "amber" : "green"}>{risk.tier}</Tag>
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {p.qty} on hand · expires {p.expiryDate} ({risk.days}d) · {risk.vel}/day recent pace — {risk.reason}
          </div>
        </div>
      ))}
    </div>
  );
}
