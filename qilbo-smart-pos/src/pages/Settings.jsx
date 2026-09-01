import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { defaultSettings, getCategoryType } from "@/lib/categories";
import { Save, Check } from "lucide-react";

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const ALL_TAX_KEYS = ["spirits_tax","beer_wine_tax","mixers_tax","cigarettes_tax","cigars_tax","vaping_tax","other_tobacco_tax","produce_tax","meat_tax","bakery_tax","grocery_tax","retail_tax"];

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings());
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enabledCats, setEnabledCats] = useState(["liquor"]);

  const load = async () => {
    const [list, stores] = await Promise.all([
      base44.entities.Settings.list("-updated_date", 1),
      base44.entities.Store.list("-created_date", 1),
    ]);
    if (list.length) {
      setSettings({ ...defaultSettings(), ...list[0] });
      setRecordId(list[0].id);
    }
    if (stores.length && stores[0].enabled_categories?.length) setEnabledCats(stores[0].enabled_categories);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => { setSettings((s) => ({ ...s, [k]: v })); setSaved(false); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { state: settings.state || undefined, local_tax_rate: Number(settings.local_tax_rate) || 0 };
      ALL_TAX_KEYS.forEach((k) => { payload[k] = Number(settings[k]) || 0; });
      if (recordId) await base44.entities.Settings.update(recordId, payload);
      else { const rec = await base44.entities.Settings.create(payload); setRecordId(rec.id); }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const taxFields = enabledCats.flatMap((ct) => getCategoryType(ct).taxFields);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Settings</h1>
      <p className="text-sm text-slate-400 mb-6">Tax rates applied at checkout, per category.</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">State</label>
          <select value={settings.state || ""} onChange={(e) => set("state", e.target.value)} className="form-input mt-1">
            <option value="">— Select —</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Local / default tax rate (0.0825 = 8.25%)</label>
          <input type="number" step="0.0001" value={settings.local_tax_rate} onChange={(e) => set("local_tax_rate", e.target.value)} className="form-input mt-1" />
        </div>
        {taxFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {taxFields.map((f) => (
              <TaxField key={f.key} label={f.label} value={settings[f.key]} onChange={(v) => set(f.key, v)} />
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">Rates apply per product category at checkout. Categories not stocked are hidden.</p>
      </div>

      <button onClick={save} disabled={saving} className="mt-4 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-40">
        {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : saved ? "Saved" : "Save settings"}
      </button>
    </div>
  );
}

function TaxField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      <input type="number" step="0.0001" value={value} onChange={(e) => onChange(e.target.value)} className="form-input mt-1" />
    </div>
  );
}