import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getCategoryType } from "@/lib/categories";
import { ShoppingCart, Package, Users, BarChart3, Plus, Store as StoreIcon } from "lucide-react";

export default function StoreHome() {
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stores = await base44.entities.Store.list("-created_date", 50);
        if (stores.length === 0) {
          navigate("/setup");
          return;
        }
        setStore(stores[0]);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading…</div>;
  if (!store) return null;

  const cats = (store.enabled_categories || ["liquor"]).map(getCategoryType).filter(Boolean);

  const links = [
    { to: "/pos", label: "Go to POS Checkout", desc: "Ring up sales", icon: ShoppingCart, accent: "from-emerald-400 to-teal-500" },
    { to: "/products", label: "Manage Inventory", desc: "Products & stock", icon: Package, accent: "from-blue-400 to-indigo-500" },
    { to: "/customers", label: "View Customers", desc: "Loyalty & profiles", icon: Users, accent: "from-violet-400 to-purple-500" },
    { to: "/dashboard", label: "See Dashboard", desc: "Sales & reports", icon: BarChart3, accent: "from-amber-400 to-orange-500" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <StoreIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{store.name}</h1>
            <p className="text-sm text-slate-400">{store.address || "No address set"}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/setup")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Another Store
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {cats.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700">
            <c.icon className="w-4 h-4 text-emerald-600" /> {c.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <button
            key={l.to}
            onClick={() => navigate(l.to)}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm text-left transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${l.accent} flex items-center justify-center shrink-0`}>
              <l.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">{l.label}</div>
              <div className="text-sm text-slate-400">{l.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}