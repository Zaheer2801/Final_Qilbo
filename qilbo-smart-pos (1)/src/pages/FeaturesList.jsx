import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { storeTypes } from "@/lib/storeTypes";

export default function FeaturesList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const typeId = params.get("type") || "liquor";
  const type = storeTypes.find((t) => t.id === typeId) || storeTypes[0];

  const allFeatures = useMemo(() => [...type.baseFeatures, ...type.extras], [type]);
  const [selected, setSelected] = useState(allFeatures);
  const allSelected = selected.length === allFeatures.length;

  const toggle = (f) =>
    setSelected((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  const cont = () => navigate("/setup/create", { state: { type: type.id, features: selected } });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/setup")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <type.icon className="w-5 h-5 text-slate-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{type.label}</h1>
        </div>
        <p className="text-slate-500 mb-6">Here's what's included. Customize or take it all.</p>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Core POS features</h2>
          <div className="space-y-1">
            {type.baseFeatures.map((f) => (
              <FeatureRow key={f} feature={f} checked={selected.includes(f)} onToggle={() => toggle(f)} />
            ))}
          </div>
        </div>

        {type.extras.length > 0 && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-5 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-3">
              Included for {type.label}
            </h2>
            <div className="space-y-1">
              {type.extras.map((f) => (
                <FeatureRow key={f} feature={f} checked={selected.includes(f)} onToggle={() => toggle(f)} />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSelected(allSelected ? [] : allFeatures)} className="text-sm text-slate-500 hover:text-slate-800">
            {allSelected ? "Deselect all" : "Select all"}
          </button>
          <span className="text-sm text-slate-400">{selected.length} selected</span>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setSelected(allFeatures)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100">
            I want all these
          </button>
          <button
            onClick={cont}
            disabled={selected.length === 0}
            className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ feature, checked, onToggle }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 text-left">
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white"}`}>
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className="text-sm text-slate-700">{feature}</span>
    </button>
  );
}