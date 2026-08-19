import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { CATEGORY_LIST } from "@/lib/categories";

export default function StoreTypeSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["liquor"]);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Which products do you sell?</h1>
        <p className="text-slate-500 mt-2">Pick every category you stock — one store, fully adapted.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORY_LIST.map((c) => {
            const on = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`relative text-left p-5 rounded-2xl border-2 bg-white transition-all hover:shadow-sm ${on ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${on ? "bg-emerald-100" : "bg-slate-100"}`}>
                    <c.icon className={`w-6 h-6 ${on ? "text-emerald-700" : "text-slate-700"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{c.label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{c.subcategories.slice(0, 4).join(", ")}…</div>
                  </div>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${on ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white"}`}>
                    {on && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8">
          <span className="text-sm text-slate-400">{selected.length} categor{selected.length !== 1 ? "ies" : "y"} selected</span>
          <button
            onClick={() => navigate("/setup/create", { state: { categories: selected } })}
            disabled={selected.length === 0}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 flex items-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}