import { useState } from "react";
import { X } from "lucide-react";
import type { Product, QtyChangeReason } from "../../types";
import { QTY_CHANGE_REASONS } from "../../types";
import { btnGhost, btnPrimary, inputCls } from "../ui";
import { titleCase } from "../../lib/format";

export default function EditQuantityModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (newQty: number, changedBy: string, reasons: QtyChangeReason[], note: string) => void;
}) {
  const [newQty, setNewQty] = useState(String(product.qty));
  const [changedBy, setChangedBy] = useState("");
  const [reasons, setReasons] = useState<QtyChangeReason[]>([]);
  const [note, setNote] = useState("");

  function toggleReason(r: QtyChangeReason) {
    setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  const qtyValid = newQty !== "" && !Number.isNaN(Number(newQty)) && Number(newQty) >= 0;
  const canSave = qtyValid && changedBy.trim() !== "" && reasons.length > 0;

  function submit() {
    if (!canSave) return;
    onSave(Number(newQty), changedBy.trim(), reasons, note.trim());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="bg-white rounded-lg border border-stone-200 p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-semibold">Edit quantity — {titleCase(product.name)}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-stone-500 mb-4">Currently {product.qty} on hand. Every change here is logged with who, when, and why.</p>

        <label className="block mb-3">
          <span className="block text-xs font-medium text-stone-700 mb-1">New quantity on hand</span>
          <input className={inputCls} value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="0" />
        </label>

        <label className="block mb-3">
          <span className="block text-xs font-medium text-stone-700 mb-1">Your name</span>
          <input
            className={inputCls}
            value={changedBy}
            onChange={(e) => setChangedBy(e.target.value)}
            placeholder="Who's making this count?"
          />
          <span className="block text-[11px] text-stone-400 mt-1">
            Free-text — this prototype has no staff accounts/login (single-user, see about_me.md), so it isn't verified.
          </span>
        </label>

        <div className="mb-3">
          <span className="block text-xs font-medium text-stone-700 mb-1.5">Reason (select all that apply)</span>
          <div className="flex flex-col gap-1.5">
            {QTY_CHANGE_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={reasons.includes(r)} onChange={() => toggleReason(r)} className="accent-amber-800" />
                {r}
              </label>
            ))}
          </div>
        </div>

        <label className="block mb-4">
          <span className="block text-xs font-medium text-stone-700 mb-1">Note (optional)</span>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any additional detail" />
        </label>

        <div className="flex gap-2">
          <button onClick={submit} disabled={!canSave} className={btnPrimary}>
            Save & log change
          </button>
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
