import type { AppState, POStatus } from "../../types";
import { reorderSuggestion, round2, velocityPerDay } from "../../lib/businessLogic";
import { btnSmall, card, Tag } from "../ui";

export default function ProcurementTab({ state, updateState }: { state: AppState; updateState: (updater: (s: AppState) => AppState) => void }) {
  const flagged = state.products.filter((p) => p.qty <= p.reorderPoint);

  // Approval-gated: this only ever creates a `draft` PO. Nothing here places an
  // order or contacts a vendor — that's a separate, explicit click on an
  // already-approved PO, matching orchestration.md / vendor-voice-agent.md.
  function draftPO(productId: string) {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;
    const { qty, unit } = reorderSuggestion(product, state.config);
    updateState((s) => ({
      ...s,
      purchaseOrders: [
        ...s.purchaseOrders,
        {
          id: "PO-" + Date.now(),
          productId: product.id,
          productName: `${product.name} ${product.size}`,
          qty,
          unit,
          unitCost: product.purchasePrice,
          status: "draft",
          createdDate: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
  }

  function setStatus(id: string, status: POStatus) {
    updateState((s) => ({ ...s, purchaseOrders: s.purchaseOrders.map((po) => (po.id === id ? { ...po, status } : po)) }));
  }

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">At or below reorder point</h3>
        {flagged.length === 0 && <p className="text-stone-400 italic text-sm">Nothing flagged right now.</p>}
        {flagged.map((p) => {
          const vel = round2(velocityPerDay(p.id, state.sales));
          const already = state.purchaseOrders.some((po) => po.productId === p.id && po.status !== "rejected");
          const suggestion = reorderSuggestion(p, state.config);
          return (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-stone-50 text-sm">
              <div>
                <span className="font-medium">
                  {p.name} {p.size}
                </span>
                <span className="text-stone-500 ml-2">
                  {p.qty} on hand / reorder pt {p.reorderPoint} · {vel}/day recent pace
                </span>
                {vel === 0 && <Tag tone="amber">zero recent sales — review before reordering</Tag>}
              </div>
              {already ? (
                <Tag tone="gray">already drafted</Tag>
              ) : (
                <button onClick={() => draftPO(p.id)} className={btnSmall}>
                  Draft PO ({suggestion.qty} {suggestion.unit})
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Purchase orders</h3>
        {state.purchaseOrders.length === 0 && <p className="text-stone-400 italic text-sm">None yet.</p>}
        {state.purchaseOrders.map((po) => (
          <div key={po.id} className="flex items-center justify-between py-2 border-b border-stone-50 text-sm">
            <div>
              {po.id} — {po.productName}, {po.qty} {po.unit || "units"} @ ${po.unitCost}
            </div>
            <div className="flex items-center gap-2">
              <Tag tone={po.status === "approved" ? "green" : po.status === "rejected" ? "red" : "amber"}>{po.status}</Tag>
              {po.status === "draft" && (
                <>
                  <button onClick={() => setStatus(po.id, "approved")} className={btnSmall}>
                    Approve
                  </button>
                  <button onClick={() => setStatus(po.id, "rejected")} className={btnSmall}>
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
