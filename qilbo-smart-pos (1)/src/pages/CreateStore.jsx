import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCategoryType } from "@/lib/categories";

export default function CreateStore() {
  const navigate = useNavigate();
  const location = useLocation();
  const categories = location.state?.categories || ["liquor"];

  const [form, setForm] = useState({ name: "", address: "", phone: "", owner_name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      await base44.entities.Store.create({ ...form, enabled_categories: categories });
      navigate("/home");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate("/setup")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Create your store</h1>
        <p className="text-slate-500 mb-3">Selling: {categories.map((c) => getCategoryType(c).label).join(", ")}</p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {categories.map((c) => {
            const ct = getCategoryType(c);
            return (
              <span key={c} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ct.icon className="w-3 h-3" />{ct.label}
              </span>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <Field label="Store name *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="form-input" placeholder="Main Street Market" />
          </Field>
          <Field label="Store address">
            <input value={form.address} onChange={(e) => set("address", e.target.value)} className="form-input" placeholder="123 Main St" />
          </Field>
          <Field label="Store phone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="form-input" placeholder="555-0100" />
          </Field>
          <Field label="Owner name">
            <input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} className="form-input" />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => set("email", e.target.value)} className="form-input" placeholder="you@store.com" />
          </Field>
        </div>

        <button
          onClick={submit}
          disabled={!form.name || saving}
          className="mt-4 w-full py-3.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>Create Store & Open <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
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