import React from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { bucketLabel, getCategoryType, dealLineTotal } from "@/lib/categories";

export default function Cart({ items, onInc, onDec, onRemove, onClear, subtotal, tax, total, taxByBucket, totalSavings = 0, ebtSubtotal = 0, nonEbtSubtotal = 0 }) {
  const categorySubtotals = {};
  items.forEach((i) => {
    const dl = dealLineTotal(i);
    const ct = i.category_type || "retail";
    categorySubtotals[ct] = (categorySubtotals[ct] || 0) + dl.lineTotal;
  });
  const categoryKeys = Object.keys(categorySubtotals);
  const hasEbt = items.some((i) => i.ebt_eligible);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div>
          <h2 className="font-semibold text-slate-800">Current Sale</h2>
          <p className="text-xs text-slate-400">
            {items.length} item{items.length !== 1 ? "s" : ""}
            {items.some((i) => i.age_restricted) && (
              <span className="text-red-500 font-medium"> · {items.filter((i) => i.age_restricted).length} age-restricted</span>
            )}
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto px-3 py-2">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-slate-400 text-sm px-6">
            Scan or tap products to start a sale.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const dl = dealLineTotal(it);
              const weighted = it.unit && it.unit !== "ea";
              return (
                <div key={it.uid || it.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate flex items-center gap-1.5">
                      {it.name}
                      {it.age_restricted && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-600 shrink-0">21+</span>}
                      {it.ebt_eligible && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 shrink-0">EBT</span>}
                    </div>
                    <div className="text-xs text-slate-400">
                      {weighted ? `${it.qty} ${it.unit} @ $${Number(it.price).toFixed(2)}/${it.unit}` : `$${Number(it.price).toFixed(2)} each`}
                      {dl.savings > 0 && <span className="text-emerald-600"> · save ${dl.savings.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onDec(it)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{weighted ? it.qty : it.qty}</span>
                    {!weighted && (
                      <button onClick={() => onInc(it)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="w-16 text-right text-sm font-semibold text-slate-900">${dl.lineTotal.toFixed(2)}</div>
                  <button onClick={() => onRemove(it)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 px-5 py-4 space-y-2 bg-white">
        {categoryKeys.length > 1 && categoryKeys.map((ct) => (
          <div key={ct} className="flex justify-between text-xs text-slate-400">
            <span>{getCategoryType(ct).label}</span>
            <span>${categorySubtotals[ct].toFixed(2)}</span>
          </div>
        ))}
        {hasEbt && (
          <div className="flex justify-between text-xs">
            <span className="text-blue-600">EBT-eligible</span>
            <span className="text-blue-600">${ebtSubtotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {totalSavings > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>You saved</span>
            <span>-${totalSavings.toFixed(2)}</span>
          </div>
        )}
        {taxByBucket && Object.values(taxByBucket).some((v) => v > 0.001) ? (
          Object.entries(taxByBucket).filter(([, v]) => v > 0.001).map(([bucket, v]) => (
            <div key={bucket} className="flex justify-between text-sm text-slate-500">
              <span>Tax — {bucketLabel(bucket)}</span>
              <span>${v.toFixed(2)}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between text-sm text-slate-500">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
          <span className="text-sm font-medium text-slate-600">Total</span>
          <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}