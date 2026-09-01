import React, { useState } from "react";
import { Scale, X } from "lucide-react";
import { unitLabel } from "@/lib/categories";

export default function WeightModal({ product, onConfirm, onClose }) {
  const [weight, setWeight] = useState("");
  const [reading, setReading] = useState(false);
  const unit = unitLabel(product.weight_type);
  const perUnit = Number(product.price);
  const total = weight ? parseFloat(weight) * perUnit : 0;

  const readScale = () => {
    setReading(true);
    setTimeout(() => {
      setWeight((Math.random() * 4 + 0.5).toFixed(2));
      setReading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" /> Weigh item
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="font-medium text-slate-800">{product.name}</div>
            <div className="text-sm text-slate-400">${perUnit.toFixed(2)} / {unit}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Weight ({unit})</label>
            <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.00" className="form-input mt-1" autoFocus />
          </div>
          <button onClick={readScale} disabled={reading} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 disabled:opacity-50">
            {reading ? (
              <><div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" /> Reading scale…</>
            ) : (
              <><Scale className="w-4 h-4" /> Read from USB scale</>
            )}
          </button>
          {weight && parseFloat(weight) > 0 && (
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50">
              <span className="text-sm text-emerald-700 font-medium">{weight} {unit} × ${perUnit.toFixed(2)}</span>
              <span className="text-xl font-bold text-emerald-700">${total.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={() => onConfirm(parseFloat(weight))} disabled={!weight || parseFloat(weight) <= 0} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-40">Add to cart</button>
        </div>
      </div>
    </div>
  );
}