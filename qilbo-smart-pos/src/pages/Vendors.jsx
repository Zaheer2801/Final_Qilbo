import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Truck, FileText, CheckCircle2 } from "lucide-react";

const emptyVendor = { name: "", contact_name: "", contact_phone: "", contact_email: "", account_number: "" };

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [pos, setPos] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [poVendor, setPoVendor] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [v, p, po, inv] = await Promise.all([
        base44.entities.Vendor.list("-name", 200),
        base44.entities.Product.list("-name", 300),
        base44.entities.PurchaseOrder.list("-created_date", 200),
        base44.entities.Invoice.list("-created_date", 200),
      ]);
      setVendors(v);
      setProducts(p);
      setPos(po);
      setInvoices(inv);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const lastOrderDate = (vendorId) => {
    const vpos = pos.filter((o) => o.vendor_id === vendorId);
    if (!vpos.length) return "—";
    return new Date(vpos[0].created_date).toLocaleDateString();
  };

  const vendorInvoices = (vendorId) => invoices.filter((i) => i.vendor_id === vendorId && i.status !== "received");
  const vendorOwed = (vendorId) => vendorInvoices(vendorId).reduce((s, i) => s + Number(i.total_amount || 0), 0);

  const saveVendor = async (data) => {
    if (editing?.id) await base44.entities.Vendor.update(editing.id, data);
    else await base44.entities.Vendor.create(data);
    setEditing(null);
    await load();
  };

  const removeVendor = async (v) => {
    if (!confirm(`Delete vendor "${v.name}"?`)) return;
    await base44.entities.Vendor.delete(v.id);
    await load();
  };

  const markReceived = async (po) => {
    const updates = (po.items || [])
      .filter((it) => it.product_id)
      .map((it) => ({
        id: it.product_id,
        quantity_on_hand: (products.find((p) => p.id === it.product_id)?.quantity_on_hand ?? 0) + (it.qty || 0),
      }));
    if (updates.length) await base44.entities.Product.bulkUpdate(updates);
    await base44.entities.PurchaseOrder.update(po.id, {
      status: "received",
      received_date: new Date().toISOString().slice(0, 10),
    });
    await load();
  };

  const createPO = async (vendor, items) => {
    const lineItems = items
      .filter((i) => i.qty > 0)
      .map((i) => ({
        product_id: i.product_id,
        name: i.name,
        qty: Number(i.qty),
        unit_cost: Number(i.unit_cost) || 0,
        total: Number((i.qty * (Number(i.unit_cost) || 0)).toFixed(2)),
      }));
    const total = Number(lineItems.reduce((s, i) => s + i.total, 0).toFixed(2));
    await base44.entities.PurchaseOrder.create({
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      status: "sent",
      items: lineItems,
      total_cost: total,
    });
    setPoVendor(null);
    await load();
  };

  const openPOs = pos.filter((o) => o.status !== "received");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Vendors</h1>
          <p className="text-sm text-slate-400">{vendors.length} suppliers · {openPOs.length} open orders · {invoices.filter((i) => i.status !== "received").length} open invoices</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyVendor })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4" /> Add vendor
        </button>
      </div>

      {openPOs.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> Open Purchase Orders
          </h3>
          <div className="space-y-2">
            {openPOs.map((po) => (
              <div key={po.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{po.vendor_name || "Vendor"}</div>
                  <div className="text-xs text-slate-400">
                    {(po.items || []).length} item{(po.items || []).length !== 1 ? "s" : ""} · {new Date(po.created_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">${Number(po.total_cost).toFixed(2)}</span>
                  <button
                    onClick={() => markReceived(po)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Received
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No vendors yet. Add your first supplier.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 font-medium">Account #</th>
                  <th className="text-left px-4 py-3 font-medium">Open invoices</th>
                  <th className="text-left px-4 py-3 font-medium">Owed</th>
                  <th className="text-left px-4 py-3 font-medium">Last order</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{v.contact_name || "—"}</div>
                      <div className="text-xs text-slate-400">{v.contact_phone || v.contact_email || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{v.account_number || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{vendorInvoices(v.id).length}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">${vendorOwed(v.id).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500">{lastOrderDate(v.id)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setPoVendor(v)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Create PO
                        </button>
                        <button onClick={() => setEditing(v)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => removeVendor(v)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <VendorForm initial={editing} onSave={saveVendor} onClose={() => setEditing(null)} />}
      {poVendor && (
        <CreatePOForm
          vendor={poVendor}
          products={products.filter((p) => p.vendor_id === poVendor.id).length ? products.filter((p) => p.vendor_id === poVendor.id) : products}
          onCreate={(items) => createPO(poVendor, items)}
          onClose={() => setPoVendor(null)}
        />
      )}
    </div>
  );
}

function VendorForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{initial.id ? "Edit vendor" : "New vendor"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Vendor name *"><input value={form.name} onChange={(e) => set("name", e.target.value)} className="form-input" /></Field>
          <Field label="Contact name"><input value={form.contact_name || ""} onChange={(e) => set("contact_name", e.target.value)} className="form-input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} className="form-input" /></Field>
            <Field label="Email"><input value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} className="form-input" /></Field>
          </div>
          <Field label="Account number"><input value={form.account_number || ""} onChange={(e) => set("account_number", e.target.value)} className="form-input" /></Field>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.name} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  );
}

function CreatePOForm({ vendor, products, onCreate, onClose }) {
  const [rows, setRows] = useState(products.map((p) => ({ product_id: p.id, name: p.name, unit_cost: p.cost || 0, qty: 0, selected: false })));

  const toggle = (id) => setRows((r) => r.map((row) => (row.product_id === id ? { ...row, selected: !row.selected, qty: !row.selected ? 1 : 0 } : row)));
  const setQty = (id, qty) => setRows((r) => r.map((row) => (row.product_id === id ? { ...row, qty: Number(qty) || 0 } : row)));

  const selectedRows = rows.filter((r) => r.selected && r.qty > 0);
  const total = selectedRows.reduce((s, r) => s + r.qty * (Number(r.unit_cost) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Create Purchase Order</h3>
            <p className="text-xs text-slate-400">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {rows.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">No products available. Add products first.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.product_id} className={`flex items-center gap-3 p-3 rounded-xl border ${r.selected ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200"}`}>
                  <input type="checkbox" checked={r.selected} onChange={() => toggle(r.product_id)} className="rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{r.name}</div>
                    <div className="text-xs text-slate-400">Cost ${Number(r.unit_cost).toFixed(2)}</div>
                  </div>
                  {r.selected && (
                    <>
                      <input
                        type="number"
                        min="0"
                        value={r.qty}
                        onChange={(e) => setQty(r.product_id, e.target.value)}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center"
                      />
                      <span className="w-16 text-right text-sm font-medium text-slate-700">${(r.qty * (Number(r.unit_cost) || 0)).toFixed(2)}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-slate-500">Total cost</span>
            <span className="text-xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Cancel</button>
            <button
              onClick={() => onCreate(rows)}
              disabled={selectedRows.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40"
            >
              Send to Vendor
            </button>
          </div>
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