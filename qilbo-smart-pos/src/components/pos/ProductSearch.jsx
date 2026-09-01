import React, { useMemo, useState } from "react";
import { Search, Plus, AlertTriangle } from "lucide-react";

export default function ProductSearch({ products, onAdd, loading }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    const list = q
      ? products.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.barcode?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q)
        )
      : products;
    return list.slice(0, 24);
  }, [products, query]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Scan barcode or search products…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-12">No products found</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((p) => {
              const lowStock = (p.quantity_on_hand ?? 0) <= (p.reorder_point ?? 0);
              return (
                <button
                  key={p.id}
                  onClick={() => onAdd(p)}
                  disabled={(p.quantity_on_hand ?? 0) <= 0}
                  className="group relative flex flex-col justify-between text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{p.name}</div>
                    {p.category && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.category}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-semibold text-slate-900">
                      ${Number(p.price).toFixed(2)}
                    </span>
                    <span className={`text-[11px] flex items-center gap-1 ${lowStock ? "text-amber-600" : "text-slate-400"}`}>
                      {lowStock && <AlertTriangle className="w-3 h-3" />}
                      {p.quantity_on_hand ?? 0} left
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}