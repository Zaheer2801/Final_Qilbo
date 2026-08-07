import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import type { Product, QtyChangeReason, QtyLogEntry, Sale } from "../../types";
import { currentMargin, expiryUrgency, round2, velocityPerDay } from "../../lib/businessLogic";
import { CategoryPill, Tag, card } from "../ui";
import { ProductThumb } from "./ProductThumb";
import EditQuantityModal from "./EditQuantityModal";
import { titleCase } from "../../lib/format";

function daysOnShelf(receivedDate?: string): number | null {
  if (!receivedDate) return null;
  const ms = new Date().getTime() - new Date(receivedDate).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export default function ProductDetailPanel({
  product,
  sales,
  qtyLog,
  onClose,
  onDelete,
  onQtyChange,
}: {
  product: Product;
  sales: Sale[];
  qtyLog: QtyLogEntry[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onQtyChange: (newQty: number, changedBy: string, reasons: QtyChangeReason[], note: string) => void;
}) {
  const [editingQty, setEditingQty] = useState(false);
  const risk = expiryUrgency(product, sales);
  const shelfDays = daysOnShelf(product.receivedDate);
  const vel = round2(velocityPerDay(product.id, sales));
  const margin = round2(currentMargin(product));
  const lowStock = product.qty <= product.reorderPoint;
  const history = qtyLog.filter((l) => l.productId === product.id).slice(0, 5);

  function handleDelete() {
    if (window.confirm(`Remove ${product.name}${product.size ? ` (${product.size})` : ""} from inventory? This can't be undone.`)) {
      onDelete(product.id);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className={card + " w-full max-w-2xl max-h-[90vh] overflow-y-auto"} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <ProductThumb
              product={product}
              iconSize={24}
              zoomOnHover
              className="w-16 h-16 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden"
            />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                {titleCase(product.name)}
                {product.size && <span className="text-stone-400 font-normal"> ({product.size})</span>}
              </h3>
              {product.brand && <span className="text-xs text-stone-500">{titleCase(product.brand)}</span>}
              <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                <CategoryPill category={product.category} />
                {lowStock ? <Tag tone="red">Below reorder point</Tag> : <Tag tone="green">In stock</Tag>}
                {risk && <Tag tone={risk.tier === "High" ? "red" : risk.tier === "Medium" ? "amber" : "green"}>Expiry: {risk.tier}</Tag>}
                {!product.size && <Tag tone="amber">Size not on file</Tag>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleDelete} className="text-stone-400 hover:text-red-700" title="Remove product">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-md bg-stone-50 border border-stone-200 p-3">
            <span className="block text-xs text-stone-500 mb-0.5">Vendor</span>
            <span className="text-sm font-medium">{product.vendor || "Not on file"}</span>
          </div>
          <div className="rounded-md bg-stone-50 border border-stone-200 p-3">
            <span className="block text-xs text-stone-500 mb-0.5">On shelf</span>
            <span className="text-sm font-medium">{shelfDays === null ? "Received date not on file" : `${shelfDays} days`}</span>
          </div>
          <div className="rounded-md bg-stone-50 border border-stone-200 p-3">
            <span className="block text-xs text-stone-500 mb-0.5">Expiry date</span>
            <span className="text-sm font-medium">{product.expiryDate || "Not tracked for this item"}</span>
            {risk && <span className="block text-xs text-stone-500 mt-1">{risk.reason}</span>}
          </div>
          <div className="rounded-md bg-stone-50 border border-stone-200 p-3">
            <span className="block text-xs text-stone-500 mb-0.5">Sales trend (14-day avg)</span>
            <span className="text-sm font-medium">{vel} units/day</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-1">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <span className="block text-xs text-amber-800 mb-0.5">Purchase price · owner only</span>
            <span className="text-sm font-semibold">${product.purchasePrice.toFixed(2)}</span>
          </div>
          <div className="rounded-md border border-stone-200 bg-white p-3">
            <span className="block text-xs text-stone-500 mb-0.5">Selling price · internal</span>
            <span className="text-sm font-semibold">${product.sellingPrice.toFixed(2)}</span>
          </div>
          <div className="rounded-md border border-stone-200 bg-white p-3">
            <span className="block text-xs text-stone-500 mb-0.5">Current margin</span>
            <span className="text-sm font-semibold">{margin}%</span>
          </div>
          <div className="rounded-md border border-stone-200 bg-white p-3">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-stone-500">On hand / reorder pt</span>
              <button onClick={() => setEditingQty(true)} className="text-stone-400 hover:text-amber-800" title="Edit quantity">
                <Pencil size={12} />
              </button>
            </div>
            <span className="text-sm font-semibold">
              {product.qty} / {product.reorderPoint}
            </span>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-4 rounded-md border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-3 py-1.5 border-b border-stone-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-600">Recent quantity changes</span>
            </div>
            <div className="divide-y divide-stone-100">
              {history.map((h) => (
                <div key={h.id} className="px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-800">
                      {h.previousQty} → {h.newQty}
                    </span>
                    <span className="text-stone-400">{new Date(h.date).toLocaleString()}</span>
                  </div>
                  <span className="text-stone-500">
                    {h.changedBy} · {h.reasons.join(", ")}
                    {h.note && ` · ${h.note}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-stone-400 mt-4 leading-relaxed">
          "Owner only" / "internal" are labels, not enforced access control — this prototype has a single user role (see{" "}
          <code>about_me.md</code>: sole operator, no staff yet). Real role-based visibility would need an actual auth/permissions
          system, which isn't built here.
        </p>
      </div>
      {editingQty && (
        <EditQuantityModal
          product={product}
          onClose={() => setEditingQty(false)}
          onSave={(newQty, changedBy, reasons, note) => onQtyChange(newQty, changedBy, reasons, note)}
        />
      )}
    </div>
  );
}
