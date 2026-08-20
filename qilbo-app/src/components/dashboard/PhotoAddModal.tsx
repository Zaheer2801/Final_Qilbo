import { useState } from "react";
import { Camera, X } from "lucide-react";
import type { Product } from "../../types";
import { btnGhost, btnPrimary, inputCls } from "../ui";

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  size: "",
  qty: "",
  reorderPoint: "",
  purchasePrice: "",
  sellingPrice: "",
};

export default function PhotoAddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (product: Product) => void }) {
  const [form, setForm] = useState(emptyForm);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handlePhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function submit() {
    if (!form.name || !form.qty) return;
    const p: Product = {
      id: "PP" + Date.now(),
      name: form.name,
      brand: form.brand || undefined,
      category: form.category,
      size: form.size,
      qty: Number(form.qty),
      reorderPoint: Number(form.reorderPoint || 0),
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      expiryDate: "",
      imageUrl: imageDataUrl || undefined,
    };
    onAdd(p);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className="bg-white rounded-lg border border-stone-200 p-5 w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold">Add product from a photo</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</p>}

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-lg py-6 cursor-pointer hover:border-amber-700/40 hover:bg-amber-50/30 mb-4 overflow-hidden">
          {imageDataUrl ? (
            <img src={imageDataUrl} alt="Selected product" className="h-28 object-contain" />
          ) : (
            <>
              <Camera size={22} className="text-stone-400" />
              <span className="text-sm text-stone-600">Click to choose a photo</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePhoto(f);
            }}
          />
        </label>
        <p className="text-[11px] text-stone-400 -mt-3 mb-4">
          Stored as-is with this product's record — this prototype has no image server, so the photo is kept locally in this browser only.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className={inputCls} placeholder="Size (e.g. 750ml)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
          <input className={inputCls} placeholder="Qty" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <input className={inputCls} placeholder="Reorder point" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} />
          <input className={inputCls} placeholder="Purchase price" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
          <input className={inputCls} placeholder="Selling price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={submit} className={btnPrimary} disabled={!form.name || !form.qty}>
            Add product
          </button>
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
