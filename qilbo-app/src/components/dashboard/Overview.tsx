import { useState } from "react";
import { AlertTriangle, DollarSign, Package, Receipt } from "lucide-react";
import type { AppState } from "../../types";
import { currentMargin, expiryUrgency, marginFloorFor, round2 } from "../../lib/businessLogic";
import { card, Tag } from "../ui";
import { HoverableProductName } from "./ProductThumb";
import { ListControls, useListControls } from "./ListControls";
import { titleCase } from "../../lib/format";

type CardKey = "lowStock" | "expiry" | "pos" | "margin";

export default function Overview({ state }: { state: AppState }) {
  const [expanded, setExpanded] = useState<CardKey | null>(null);

  const lowStockItems = state.products.filter((p) => p.qty <= p.reorderPoint);
  const expiryItems = state.products
    .filter((p) => p.expiryDate)
    .map((p) => ({ p, risk: expiryUrgency(p, state.sales)! }))
    .filter(({ risk }) => risk.tier !== "Low");
  const pendingPOs = state.purchaseOrders.filter((po) => po.status === "draft");
  const marginItems = state.products
    .map((p) => ({ p, margin: round2(currentMargin(p)), ...marginFloorFor(p, state.marginPolicy, state.marginOverrides) }))
    .filter(({ margin, floor }) => margin < floor);

  const lowStockCtl = useListControls(lowStockItems, (p) => p);
  const expiryCtl = useListControls(expiryItems, (i) => i.p);
  const marginCtl = useListControls(marginItems, (i) => i.p);

  const cards: { key: CardKey; label: string; value: number; icon: typeof Package; tone: "amber" | "red" | "gray" }[] = [
    { key: "lowStock", label: "Low stock items", value: lowStockItems.length, icon: Package, tone: lowStockItems.length ? "amber" : "gray" },
    { key: "expiry", label: "Expiry risk (Med/High)", value: expiryItems.length, icon: AlertTriangle, tone: expiryItems.length ? "red" : "gray" },
    { key: "pos", label: "POs awaiting approval", value: pendingPOs.length, icon: Receipt, tone: pendingPOs.length ? "amber" : "gray" },
    { key: "margin", label: "Below margin floor", value: marginItems.length, icon: DollarSign, tone: marginItems.length ? "red" : "gray" },
  ];

  function toggle(key: CardKey) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  const rowPad = (c: boolean) => (c ? "py-1" : "py-2");
  const rowText = (c: boolean) => (c ? "text-xs" : "text-sm");

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => toggle(c.key)}
            className={
              card +
              " text-left transition-shadow hover:shadow-sm " +
              (expanded === c.key ? "ring-2 ring-amber-700/40 border-amber-700/40" : "")
            }
          >
            <c.icon size={18} className="text-stone-400 mb-2" />
            <div className="text-2xl font-semibold text-stone-900">{c.value}</div>
            <div className="text-xs text-stone-500 mt-1">{c.label}</div>
          </button>
        ))}
        <div className="col-span-4 text-xs text-stone-400 mt-2">
          This is a prototype: it runs the real guardrail/expiry/reorder logic against whatever data you enter, but doesn't call vendors, read
          Gmail, or place real orders.
        </div>
      </div>

      {expanded && (
        <div className={card + " mt-4"}>
          <h3 className="text-sm font-semibold mb-3">{cards.find((c) => c.key === expanded)!.label}</h3>

          {expanded === "lowStock" &&
            (lowStockItems.length === 0 ? (
              <p className="text-stone-400 italic text-sm">Nothing below reorder point right now.</p>
            ) : (
              <>
                <ListControls {...lowStockCtl} totalCount={lowStockItems.length} />
                <div className="max-h-[520px] overflow-y-auto divide-y divide-stone-50">
                  {lowStockCtl.shown.map((p) => (
                    <div key={p.id} className={`flex items-center justify-between ${rowPad(lowStockCtl.compact)} ${rowText(lowStockCtl.compact)}`}>
                      <HoverableProductName product={p} className="font-medium">
                        {titleCase(p.name)} {p.size}
                      </HoverableProductName>
                      <span className="text-red-700 font-medium">
                        {p.qty} on hand / reorder pt {p.reorderPoint}
                      </span>
                    </div>
                  ))}
                  {lowStockCtl.shown.length === 0 && <p className="text-stone-400 italic text-sm py-3">No matches for this search/filter.</p>}
                </div>
              </>
            ))}

          {expanded === "expiry" &&
            (expiryItems.length === 0 ? (
              <p className="text-stone-400 italic text-sm">No products at Medium/High expiry risk.</p>
            ) : (
              <>
                <ListControls {...expiryCtl} totalCount={expiryItems.length} />
                <div className="max-h-[520px] overflow-y-auto divide-y divide-stone-50">
                  {expiryCtl.shown.map(({ p, risk }) => (
                    <div key={p.id} className={rowPad(expiryCtl.compact) + " " + rowText(expiryCtl.compact)}>
                      <div className="flex items-center justify-between">
                        <HoverableProductName product={p} className="font-medium">
                          {titleCase(p.name)} {p.size}
                        </HoverableProductName>
                        <Tag tone={risk.tier === "High" ? "red" : "amber"}>{risk.tier}</Tag>
                      </div>
                      {!expiryCtl.compact && (
                        <div className="text-xs text-stone-500 mt-0.5">
                          expires {p.expiryDate} ({risk.days}d) · {risk.reason}
                        </div>
                      )}
                    </div>
                  ))}
                  {expiryCtl.shown.length === 0 && <p className="text-stone-400 italic text-sm py-3">No matches for this search/filter.</p>}
                </div>
              </>
            ))}

          {expanded === "pos" &&
            (pendingPOs.length === 0 ? (
              <p className="text-stone-400 italic text-sm">No purchase orders awaiting approval.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {pendingPOs.map((po) => {
                  const product = state.products.find((p) => p.id === po.productId);
                  return (
                    <div key={po.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        {po.id} —{" "}
                        {product ? (
                          <HoverableProductName product={product}>
                            {titleCase(product.name)} {product.size}
                          </HoverableProductName>
                        ) : (
                          po.productName
                        )}
                      </div>
                      <span className="text-stone-500">
                        {po.qty} {po.unit || "units"} @ ${po.unitCost}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

          {expanded === "margin" &&
            (marginItems.length === 0 ? (
              <p className="text-stone-400 italic text-sm">Every product is at or above its margin floor.</p>
            ) : (
              <>
                <ListControls {...marginCtl} totalCount={marginItems.length} />
                <div className="max-h-[520px] overflow-y-auto divide-y divide-stone-50">
                  {marginCtl.shown.map(({ p, margin, floor, source }) => (
                    <div key={p.id} className={rowPad(marginCtl.compact) + " " + rowText(marginCtl.compact)}>
                      <div className="flex items-center justify-between">
                        <HoverableProductName product={p} className="font-medium">
                          {titleCase(p.name)} {p.size}
                        </HoverableProductName>
                        <span className="text-red-700 font-medium">
                          {margin}% (floor {floor}%)
                        </span>
                      </div>
                      {!marginCtl.compact && <div className="text-xs text-stone-500 mt-0.5">{source}</div>}
                    </div>
                  ))}
                  {marginCtl.shown.length === 0 && <p className="text-stone-400 italic text-sm py-3">No matches for this search/filter.</p>}
                </div>
              </>
            ))}
        </div>
      )}
    </div>
  );
}
