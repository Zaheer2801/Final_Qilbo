import { useState } from "react";
import { Plus } from "lucide-react";
import type { AppState, Product } from "../../types";
import { card, inputCls, btnSmall } from "../ui";

type ProductForm = Omit<Product, "id" | "qty" | "reorderPoint" | "purchasePrice" | "sellingPrice"> & {
  qty: string;
  reorderPoint: string;
  purchasePrice: string;
  sellingPrice: string;
};

const emptyForm: ProductForm = { name: "", category: "", size: "", qty: "", reorderPoint: "", purchasePrice: "", sellingPrice: "", expiryDate: "" };

export default function InventoryTab({ state, updateState }: { state: AppState; updateState: (updater: (s: AppState) => AppState) => void }) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saleForm, setSaleForm] = useState({ productId: "", qty: "" });

  function addProduct() {
    if (!form.name || !form.qty) return;
    const p: Product = {
      id: "P" + Date.now(),
      name: form.name,
      category: form.category,
      size: form.size,
      expiryDate: form.expiryDate,
      qty: Number(form.qty),
      reorderPoint: Number(form.reorderPoint || 0),
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
    };
    updateState((s) => ({ ...s, products: [...s.products, p] }));
    setForm(emptyForm);
  }

  function logSale() {
    if (!saleForm.productId || !saleForm.qty) return;
    updateState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === saleForm.productId ? { ...p, qty: Math.max(0, p.qty - Number(saleForm.qty)) } : p)),
      sales: [...s.sales, { id: "s" + Date.now(), productId: saleForm.productId, qty: Number(saleForm.qty), date: new Date().toISOString().slice(0, 10) }],
    }));
    setSaleForm({ productId: "", qty: "" });
  }

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Products</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-500 border-b border-stone-100">
              <th className="pb-2">Product</th>
              <th>Category</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Reorder pt</th>
              <th>Cost</th>
              <th>Price</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {state.products.map((p) => (
              <tr key={p.id} className="border-b border-stone-50">
                <td className="py-1.5">{p.name}</td>
                <td>{p.category}</td>
                <td>{p.size}</td>
                <td className={p.qty <= p.reorderPoint ? "text-red-700 font-medium" : ""}>{p.qty}</td>
                <td>{p.reorderPoint}</td>
                <td>${p.purchasePrice}</td>
                <td>${p.sellingPrice}</td>
                <td>{p.expiryDate || "-"}</td>
              </tr>
            ))}
            {state.products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-stone-400 italic">
                  No products yet — add one below, or load sample data from Settings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={card}>
          <h3 className="text-sm font-semibold mb-3">Add product</h3>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className={inputCls} placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
            <input className={inputCls} placeholder="Qty" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            <input className={inputCls} placeholder="Reorder point" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} />
            <input className={inputCls} placeholder="Expiry (YYYY-MM-DD)" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            <input className={inputCls} placeholder="Purchase price" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
            <input className={inputCls} placeholder="Selling price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
          </div>
          <button onClick={addProduct} className={btnSmall + " mt-3"}>
            <Plus size={14} />
            Add product
          </button>
        </div>
        <div className={card}>
          <h3 className="text-sm font-semibold mb-3">Log a sale</h3>
          <select className={inputCls + " mb-2"} value={saleForm.productId} onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}>
            <option value="">Select product</option>
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.size})
              </option>
            ))}
          </select>
          <input className={inputCls} placeholder="Quantity sold" value={saleForm.qty} onChange={(e) => setSaleForm({ ...saleForm, qty: e.target.value })} />
          <button onClick={logSale} className={btnSmall + " mt-3"}>
            Log sale
          </button>
        </div>
      </div>
    </div>
  );
}
