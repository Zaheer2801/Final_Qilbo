import { AlertTriangle, DollarSign, Package, Receipt } from "lucide-react";
import type { AppState } from "../../types";
import { currentMargin, expiryUrgency, marginFloorFor } from "../../lib/businessLogic";
import { card } from "../ui";

export default function Overview({ state }: { state: AppState }) {
  const lowStock = state.products.filter((p) => p.qty <= p.reorderPoint).length;
  const expiring = state.products.filter((p) => p.expiryDate && expiryUrgency(p, state.sales)?.tier !== "Low").length;
  const pendingPOs = state.purchaseOrders.filter((po) => po.status === "draft").length;
  const marginIssues = state.products.filter((p) => currentMargin(p) < marginFloorFor(p, state.marginPolicy, state.marginOverrides).floor).length;

  const cards = [
    { label: "Low stock items", value: lowStock, icon: Package, tone: lowStock ? "amber" : "gray" },
    { label: "Expiry risk (Med/High)", value: expiring, icon: AlertTriangle, tone: expiring ? "red" : "gray" },
    { label: "POs awaiting approval", value: pendingPOs, icon: Receipt, tone: pendingPOs ? "amber" : "gray" },
    { label: "Below margin floor", value: marginIssues, icon: DollarSign, tone: marginIssues ? "red" : "gray" },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={card}>
          <c.icon size={18} className="text-stone-400 mb-2" />
          <div className="text-2xl font-semibold text-stone-900">{c.value}</div>
          <div className="text-xs text-stone-500 mt-1">{c.label}</div>
        </div>
      ))}
      <div className="col-span-4 text-xs text-stone-400 mt-2">
        This is a prototype: it runs the real guardrail/expiry/reorder logic against whatever data you enter, but doesn't call vendors, read
        Gmail, or place real orders.
      </div>
    </div>
  );
}
