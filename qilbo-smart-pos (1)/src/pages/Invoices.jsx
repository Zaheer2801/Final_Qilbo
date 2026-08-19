import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const emptyInvoice = { invoice_number: "", invoice_date: "", vendor_id: "", po_id: "", total_amount: "" };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pos, setPos] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, v, po, p] = await Promise.all([
        base44.entities.Invoice.list("-created_date", 200),
        base44.entities.Vendor.list("-name", 200),
        base44.entities.PurchaseOrder.list("-created_date", 200),
        base44.entities.Product.list("-name", 300),
      ]);
      setInvoices(inv); setVendors(v); setPos(po); setProducts(p);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openPOsForVendor = (vendorId) => pos.filter((o) => o.vendor_id === vendorId && o.status !== "received");

  const saveInvoice = async (data, fileUrl) => {
    const po = pos.find((o) => o.id === data.po_id);
    const items = po ? po.items.map((it) => ({ ...it })) : [];
    await base44.entities.Invoice.create({
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date || undefined,
      vendor_id: data.vendor_id || undefined,
      vendor_name: vendors.find((v) => v.id === data.vendor_id)?.name,
      po_id: data.po_id || undefined,
      total_amount: Number(data.total_amount) || 0,
      status: po ? "matched" : "pending",
      file_url: fileUrl,
      items,
    });
    setCreating(null);
    await load();
  };

  const confirmReceive = async (invoice) => {
    const updates = (invoice.items || [])
      .filter((it) => it.product_id)
      .map((it) => ({
        id: it.product_id,
        quantity_on_hand: (products.find((p) => p.id === it.product_id)?.quantity_on_hand ?? 0) + (it.qty || 0),
      }));
    if (updates.length) await base44.entities.Product.bulkUpdate(updates);
    if (invoice.po_id) {
      await base44.entities.PurchaseOrder.update(invoice.po_id, { status: "received", received_date: new Date().toISOString().slice(0, 10) });
    }
    await base44.entities.Invoice.update(invoice.id, { status: "received" });
    setDetail(null);
    await load();
    alert(`${updates.length} product(s) added to inventory`);
  };

  const statusColor = { pending: "bg-amber-100 text-amber-700", matched: "bg-blue-100 text-blue-700", received: "bg-emerald-100 text-emerald-700" };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Invoices</h1>
          <p className="text-sm text-slate-400">{invoices.length} invoices · {invoices.filter((i) => i.status !== "received").length} open</p>
        </div>
        <button onClick={() => setCreating({ ...emptyInvoice })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          <Plus className="w-4 h-4" /> Upload invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No invoices yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Vendor</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">PO</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setDetail(inv)}>
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.invoice_date || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.vendor_name || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">${Number(inv.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.po_id ? inv.po_id.slice(-6).toUpperCase() : "—"}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor[inv.status]}`}>{inv.status}</span></td>
                    <td className="px-4 py-3 text-right"><ArrowRight className="w-4 h-4 text-slate-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <UploadForm initial={creating} vendors={vendors} openPOs={openPOsForVendor} onSave={saveInvoice} onClose={() => setCreating(null)} />}
      {detail && <InvoiceDetail invoice={detail} po={pos.find((o) => o.id === detail.po_id)} onClose={() => setDetail(null)} onConfirm={confirmReceive} />}
    </div>
  );
}

function UploadForm({ initial, vendors, openPOs, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    let fileUrl;
    if (file) {
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrl = file_url;
      } finally { setUploading(false); }
    }
    onSave(form, fileUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Upload invoice</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Invoice number *"><input value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} className="form-input" /></Field>
          <Field label="Invoice date"><input type="date" value={form.invoice_date} onChange={(e) => set("invoice_date", e.target.value)} className="form-input" /></Field>
          <Field label="Vendor">
            <select value={form.vendor_id} onChange={(e) => set("vendor_id", e.target.value)} className="form-input">
              <option value="">— Select —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <Field label="Match to PO">
            <select value={form.po_id} onChange={(e) => set("po_id", e.target.value)} className="form-input" disabled={!form.vendor_id}>
              <option value="">— None —</option>
              {openPOs(form.vendor_id).map((o) => <option key={o.id} value={o.id}>{o.vendor_name} · ${Number(o.total_cost).toFixed(2)}</option>)}
            </select>
          </Field>
          <Field label="Total amount ($) *"><input type="number" step="0.01" value={form.total_amount} onChange={(e) => set("total_amount", e.target.value)} className="form-input" /></Field>
          <Field label="Invoice file (image/PDF)">
            <input type="file" onChange={(e) => setFile(e.target.files?.[0])} className="text-sm text-slate-500" />
          </Field>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={!form.invoice_number || !form.total_amount || uploading} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-40">
            {uploading ? "Uploading…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDetail({ invoice, po, onClose, onConfirm }) {
  const [items, setItems] = useState(invoice.items || []);
  const [saving, setSaving] = useState(false);

  const poItems = po?.items || [];
  const findPo = (it) => poItems.find((p) => p.product_id && p.product_id === it.product_id);
  const newItems = items.filter((it) => it.product_id && !findPo(it));
  let priceIncreases = 0, qtyMismatches = 0;
  items.forEach((it) => {
    const poIt = findPo(it);
    if (!poIt) return;
    if (Number(it.unit_cost) > Number(poIt.unit_cost)) priceIncreases++;
    if (Number(it.qty) !== Number(poIt.qty)) qtyMismatches++;
  });

  const setItem = (i, key, val) => setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Invoice.update(invoice.id, { items });
    } finally { setSaving(false); }
    alert("Invoice items updated");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Invoice {invoice.invoice_number}</h3>
            <p className="text-xs text-slate-400">{invoice.vendor_name} · ${Number(invoice.total_amount).toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {(priceIncreases > 0 || qtyMismatches > 0 || newItems.length > 0) ? (
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {priceIncreases > 0 && <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {priceIncreases} price increase</span>}
              {qtyMismatches > 0 && <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {qtyMismatches} qty mismatch</span>}
              {newItems.length > 0 && <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">{newItems.length} new item(s)</span>}
            </div>
          ) : po ? (
            <p className="mb-4 text-xs text-emerald-600">Invoice matches PO — no discrepancies.</p>
          ) : null}

          {po ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Purchase Order</h4>
                <div className="space-y-1.5">
                  {poItems.map((it, i) => <Line key={i} it={it} />)}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Invoice (edit to match actual)</h4>
                <div className="space-y-1.5">
                  {items.map((it, i) => {
                    const poIt = findPo(it);
                    const priceUp = poIt && Number(it.unit_cost) > Number(poIt.unit_cost);
                    const qtyDiff = poIt && Number(it.qty) !== Number(poIt.qty);
                    const isNew = it.product_id && !poIt;
                    const border = priceUp ? "border-red-300 bg-red-50" : qtyDiff ? "border-amber-300 bg-amber-50" : isNew ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50";
                    return (
                      <div key={i} className={`p-2.5 rounded-lg border ${border} text-sm`}>
                        <div className="font-medium text-slate-800 truncate">{it.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <input type="number" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} className="w-14 px-2 py-1 rounded border border-slate-200 text-xs text-center" />
                          <span className="text-slate-400">×</span>
                          <span className="text-slate-400 text-xs">$</span>
                          <input type="number" step="0.01" value={it.unit_cost || 0} onChange={(e) => setItem(i, "unit_cost", e.target.value)} className="w-16 px-2 py-1 rounded border border-slate-200 text-xs" />
                          <span className="ml-auto text-xs font-medium text-slate-700">${(Number(it.qty || 0) * Number(it.unit_cost || 0)).toFixed(2)}</span>
                        </div>
                        {priceUp && poIt && <div className="text-[11px] text-red-600 mt-1">Was ${Number(poIt.unit_cost).toFixed(2)} → ${Number(it.unit_cost).toFixed(2)}</div>}
                      </div>
                    );
                  })}
                </div>
                <button onClick={save} disabled={saving} className="mt-3 text-xs font-medium text-slate-600 hover:text-slate-900">{saving ? "Saving…" : "Save changes"}</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No matched PO. Add a PO to compare line items.</div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Close</button>
          {invoice.status !== "received" && (
            <button onClick={() => onConfirm({ ...invoice, items })} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Confirm & Receive Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Line({ it }) {
  return (
    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm">
      <div className="font-medium text-slate-800 truncate">{it.name}</div>
      <div className="text-xs text-slate-500 flex justify-between">
        <span>{it.qty} × ${Number(it.unit_cost || 0).toFixed(2)}</span>
        <span>${(Number(it.qty || 0) * Number(it.unit_cost || 0)).toFixed(2)}</span>
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