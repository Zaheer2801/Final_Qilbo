import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Search, Phone, Mail, Award } from "lucide-react";

const empty = { first_name: "", last_name: "", phone: "", email: "", loyalty_points: 0, loyalty_tier: "bronze" };

const tierColors = {
  bronze: "bg-amber-100 text-amber-700",
  silver: "bg-slate-200 text-slate-600",
  gold: "bg-yellow-100 text-yellow-700",
  platinum: "bg-indigo-100 text-indigo-700",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setCustomers(await base44.entities.Customer.list("-updated_date", 200)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = customers.filter((c) => {
    if (!q.trim()) return true;
    const ql = q.toLowerCase();
    return `${c.first_name} ${c.last_name}`.toLowerCase().includes(ql) ||
      c.phone?.includes(q) || c.email?.toLowerCase().includes(ql);
  });

  const save = async (data) => {
    const payload = { ...data, loyalty_points: Number(data.loyalty_points) || 0 };
    if (editing?.id) await base44.entities.Customer.update(editing.id, payload);
    else await base44.entities.Customer.create(payload);
    setEditing(null);
    await load();
  };

  const remove = async (c) => {
    if (!confirm(`Remove ${c.first_name} ${c.last_name}?`)) return;
    await base44.entities.Customer.delete(c.id);
    await load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-400">{customers.length} loyalty members</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          <Plus className="w-4 h-4" /> Add customer
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-12">No customers found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {(c.first_name?.[0] || "") + (c.last_name?.[0] || "")}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{c.first_name} {c.last_name}</div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tierColors[c.loyalty_tier] || tierColors.bronze}`}>
                      {c.loyalty_tier}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.phone}</div>}
                {c.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</div>}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
                <div>
                  <div className="text-slate-400 text-xs">Points</div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-500" /> {c.loyalty_points || 0}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs">Lifetime spend</div>
                  <div className="font-semibold text-slate-800">${Number(c.total_lifetime_spend || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <CustomerForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CustomerForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{initial.id ? "Edit customer" : "New customer"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500">First name</label><input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className="form-input mt-1" /></div>
            <div><label className="text-xs font-medium text-slate-500">Last name</label><input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className="form-input mt-1" /></div>
          </div>
          <div><label className="text-xs font-medium text-slate-500">Phone</label><input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} className="form-input mt-1" /></div>
          <div><label className="text-xs font-medium text-slate-500">Email</label><input value={form.email || ""} onChange={(e) => set("email", e.target.value)} className="form-input mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500">Loyalty points</label><input type="number" value={form.loyalty_points} onChange={(e) => set("loyalty_points", e.target.value)} className="form-input mt-1" /></div>
            <div>
              <label className="text-xs font-medium text-slate-500">Tier</label>
              <select value={form.loyalty_tier} onChange={(e) => set("loyalty_tier", e.target.value)} className="form-input mt-1">
                {["bronze", "silver", "gold", "platinum"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Save</button>
        </div>
      </div>
    </div>
  );
}