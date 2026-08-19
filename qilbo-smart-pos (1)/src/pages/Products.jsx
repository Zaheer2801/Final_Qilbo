import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, AlertTriangle, Package, CalendarClock } from "lucide-react";
import { CATEGORY_LIST, getCategoryType, WEIGHT_TYPES } from "@/lib/categories";
import ProductThumb from "@/components/ProductThumb";

const empty = { name: "", barcode: "", sku: "", category_type: "liquor", category: "", price: "", cost: "", min_margin_policy: "", quantity_on_hand: "", reorder_point: "5", taxable: true, age_restricted: false, ebt_eligible: false, wic_eligible: false, id_scan_required: false, weight_type: "fixed", deal: { type: "none", n: "", price: "" }, expiry_date: "", batch_number: "", vendor_id: "", active: true };

export default function Products() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const [ps, vs] = await Promise.all([
        base44.entities.Product.list("-updated_date", 300),
        base44.entities.Vendor.list("-name", 100),
      ]);
      setProducts(ps);
      setVendors(vs);
      const editId = location.state?.editId;
      if (editId) {
        const target = ps.find((p) => p.id === editId);
        if (target) setEditing(target);
      }
      const ns = location.state;
      if (ns?.newBarcode) {
        setEditing({ ...empty, barcode: ns.newBarcode, category_type: ns.newCategory || "retail", cost: ns.newCost || "", price: ns.newPrice || "" });
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const lowStock = products.filter((p) => (p.quantity_on_hand ?? 0) <= (p.reorder_point ?? 0));
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const in7 = new Date(now); in7.setDate(in7.getDate() + 7);
  const expiring = products.filter((p) => {
    if (!p.expiry_date) return false;
    const d = new Date(p.expiry_date); d.setHours(0, 0, 0, 0);
    return d >= now && d <= in7;
  });
  const expired = products.filter((p) => {
    if (!p.expiry_date) return false;
    const d = new Date(p.expiry_date); d.setHours(0, 0, 0, 0);
    return d < now;
  });

  const shown = filter === "low" ? lowStock : filter === "expiring" ? [...expiring, ...expired] : filter === "all" ? products : products.filter((p) => p.category_type === filter);

  const save = async (data) => {
    const payload = {
      ...data,
      price: Number(data.price) || 0,
      cost: data.cost ? Number(data.cost) : undefined,
      margin_percent: Number(data.price) > 0 ? Number((((Number(data.price) - Number(data.cost || 0)) / Number(data.price)) * 100).toFixed(2)) : 0,
      min_margin_policy: data.min_margin_policy ? Number(data.min_margin_policy) : undefined,
      quantity_on_hand: Number(data.quantity_on_hand) || 0,
      reorder_point: Number(data.reorder_point) || 0,
      expiry_date: data.expiry_date || undefined,
      vendor_id: data.vendor_id || undefined,
      deal: data.deal && data.deal.type && data.deal.type !== "none" ? { type: data.deal.type, n: data.deal.n ? Number(data.deal.n) : undefined, price: data.deal.price ? Number(data.deal.price) : undefined } : undefined,
    };
    if (editing?.id) {
      await base44.entities.Product.update(editing.id, payload);
    } else {
      await base44.entities.Product.create(payload);
    }
    setEditing(null);
    await load();
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await base44.entities.Product.delete(p.id);
    await load();
  };

  const vendorName = (id) => vendors.find((v) => v.id === id)?.name;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-400">{products.length} products · {lowStock.length} low stock</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} at or below reorder point.
        </div>
      )}

      {(expiring.length > 0 || expired.length > 0) && (
        <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 mb-3">
            <CalendarClock className="w-4 h-4 text-amber-500" /> Expiry alerts
          </h3>
          <div className="space-y-2">
            {expired.map((p) => (
              <button key={p.id} onClick={() => setEditing(p)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-200 text-red-800">EXPIRED</span>
                  <span className="text-sm font-medium text-slate-800">{p.name}</span>
                </div>
                <span className="text-xs text-red-700">{p.expiry_date}</span>
              </button>
            ))}
            {expiring.map((p) => (
              <button key={p.id} onClick={() => setEditing(p)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">EXPIRING</span>
                  <span className="text-sm font-medium text-slate-800">{p.name}</span>
                </div>
                <span className="text-xs text-amber-700">{p.expiry_date}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: "all", label: "All" },
          ...CATEGORY_LIST.map((c) => ({ id: c.id, label: c.label })),
          { id: "low", label: `Low stock (${lowStock.length})` },
          { id: "expiring", label: `Expiring (${expiring.length + expired.length})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === f.id ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : shown.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No products here yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Cost</th>
                  <th className="text-right px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Expiry</th>
                  <th className="text-right px-4 py-3 font-medium">Margin</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((p) => {
                  const margin = p.cost ? ((p.price - p.cost) / p.price) * 100 : null;
                  const low = (p.quantity_on_hand ?? 0) <= (p.reorder_point ?? 0);
                  let expiryColor = "text-slate-400";
                  if (p.expiry_date) {
                    const d = new Date(p.expiry_date); d.setHours(0, 0, 0, 0);
                    if (d < now) expiryColor = "text-red-600 font-medium";
                    else if (d <= in7) expiryColor = "text-amber-600 font-medium";
                  }
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductThumb product={p} />
                          <div>
                            <div className="font-medium text-slate-800 flex items-center gap-1.5">
                              {p.name}
                              {p.age_restricted && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-600">21+</span>}
                            </div>
                            <div className="text-xs text-slate-400">{p.barcode || p.sku || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">${Number(p.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{p.cost ? `$${Number(p.cost).toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={low ? "text-amber-600 font-medium" : "text-slate-600"}>{p.quantity_on_hand ?? 0}</span>
                      </td>
                      <td className={`px-4 py-3 ${expiryColor}`}>{p.expiry_date || "—"}</td>
                      <td className={`px-4 py-3 text-right font-medium ${marginColor(p, margin)}`}>{margin !== null ? `${margin.toFixed(0)}%` : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => remove(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <ProductForm initial={editing} vendors={vendors} vendorName={vendorName} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function marginColor(p, margin) {
  if (margin === null) return "text-slate-400";
  const m = getCategoryType(p.category_type).margin;
  if (margin >= m.green) return "text-emerald-600";
  if (margin >= m.yellow) return "text-amber-600";
  return "text-red-600";
}

function ProductForm({ initial, vendors, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const marginPct = Number(form.price) > 0 ? ((Number(form.price) - Number(form.cost || 0)) / Number(form.price)) * 100 : 0;
  const marginCfg = getCategoryType(form.category_type).margin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-slate-800">{initial.id ? "Edit product" : "New product"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Name *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="form-input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Barcode"><input value={form.barcode || ""} onChange={(e) => set("barcode", e.target.value)} className="form-input" /></Field>
            <Field label="SKU"><input value={form.sku || ""} onChange={(e) => set("sku", e.target.value)} className="form-input" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category type">
              <select
                value={form.category_type || "liquor"}
                onChange={(e) => {
                  const t = getCategoryType(e.target.value);
                  setForm((f) => ({ ...f, category_type: e.target.value, category: "", age_restricted: t.ageRestricted, id_scan_required: t.idScan, ebt_eligible: t.ebt ? f.ebt_eligible : false }));
                }}
                className="form-input"
              >
                {CATEGORY_LIST.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Subcategory">
              <input list="subcategories" value={form.category || ""} onChange={(e) => set("category", e.target.value)} className="form-input" placeholder="Select or type" />
              <datalist id="subcategories">
                {getCategoryType(form.category_type).subcategories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ($) *"><input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} className="form-input" /></Field>
            <Field label="Cost ($)"><input type="number" step="0.01" value={form.cost || ""} onChange={(e) => set("cost", e.target.value)} className="form-input" /></Field>
          </div>
          {form.category_type === "grocery" && (
            <Field label="Weight / unit pricing">
              <select value={form.weight_type || "fixed"} onChange={(e) => set("weight_type", e.target.value)} className="form-input">
                {WEIGHT_TYPES.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </Field>
          )}
          {Number(form.price) > 0 && (
            <div className={`p-3 rounded-xl text-sm ${marginPct >= marginCfg.green ? "bg-emerald-50 text-emerald-700" : marginPct >= marginCfg.yellow ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
              <div className="flex justify-between">
                <span>Margin</span>
                <span className="font-semibold">{marginPct.toFixed(1)}%</span>
              </div>
              {Number(form.min_margin_policy) > 0 && marginPct < Number(form.min_margin_policy) && (
                <div className="text-xs mt-1">⚠ Below minimum policy ({Number(form.min_margin_policy)}%)</div>
              )}
            </div>
          )}
          <Field label="Min margin policy (%)"><input type="number" step="0.01" value={form.min_margin_policy || ""} onChange={(e) => set("min_margin_policy", e.target.value)} className="form-input" placeholder="e.g. 25" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qty on hand"><input type="number" value={form.quantity_on_hand} onChange={(e) => set("quantity_on_hand", e.target.value)} className="form-input" /></Field>
            <Field label="Reorder point"><input type="number" value={form.reorder_point} onChange={(e) => set("reorder_point", e.target.value)} className="form-input" /></Field>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 space-y-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pricing deal</div>
            <Field label="Deal type">
              <select value={form.deal?.type || "none"} onChange={(e) => set("deal", { type: e.target.value, n: e.target.value === "x_for_y" ? (form.deal?.n || "3") : "", price: e.target.value === "x_for_y" ? (form.deal?.price || "") : "" })} className="form-input">
                <option value="none">No deal</option>
                <option value="x_for_y">N for $X (e.g. 3 for $5)</option>
                <option value="bogo">Buy one, get one free</option>
              </select>
            </Field>
            {form.deal?.type === "x_for_y" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity (N)"><input type="number" value={form.deal?.n || ""} onChange={(e) => set("deal", { ...(form.deal || {}), n: e.target.value })} className="form-input" placeholder="3" /></Field>
                <Field label="Bundle price ($)"><input type="number" step="0.01" value={form.deal?.price || ""} onChange={(e) => set("deal", { ...(form.deal || {}), price: e.target.value })} className="form-input" placeholder="5.00" /></Field>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry date"><input type="date" value={form.expiry_date || ""} onChange={(e) => set("expiry_date", e.target.value)} className="form-input" /></Field>
            <Field label="Batch number"><input value={form.batch_number || ""} onChange={(e) => set("batch_number", e.target.value)} className="form-input" /></Field>
          </div>
          <Field label="Supplied by">
            <select value={form.vendor_id || ""} onChange={(e) => set("vendor_id", e.target.value)} className="form-input">
              <option value="">— None —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.taxable} onChange={(e) => set("taxable", e.target.checked)} className="rounded" /> Taxable
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.age_restricted} onChange={(e) => set("age_restricted", e.target.checked)} className="rounded" /> Age restricted (21+)
            </label>
            {getCategoryType(form.category_type).ebt && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.ebt_eligible} onChange={(e) => set("ebt_eligible", e.target.checked)} className="rounded" /> EBT eligible
              </label>
            )}
            {form.category_type === "grocery" && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.wic_eligible} onChange={(e) => set("wic_eligible", e.target.checked)} className="rounded" /> WIC eligible
              </label>
            )}
            {getCategoryType(form.category_type).idScan && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.id_scan_required} onChange={(e) => set("id_scan_required", e.target.checked)} className="rounded" /> ID scan required
              </label>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded" /> Active
            </label>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.price}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}