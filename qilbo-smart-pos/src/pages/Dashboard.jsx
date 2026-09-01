import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, Percent, Receipt, FileText, AlertTriangle, ArrowUpRight, TrendingDown, ShieldAlert, ShieldCheck, CalendarClock, Sparkles } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { effectiveRole, isManagerUp } from "@/lib/permissions";
import { getCategoryType, CATEGORY_LIST, categoryColor } from "@/lib/categories";
import ProductThumb from "@/components/ProductThumb";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [voids, setVoids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [t, p, inv] = await Promise.all([
          base44.entities.Transaction.list("-created_date", 200),
          base44.entities.Product.list("-updated_date", 200),
          base44.entities.Invoice.list("-created_date", 200),
        ]);
        const role = effectiveRole(user?.role);
        setTxns(role === "cashier" ? t.filter((x) => x.employee_id === user?.id) : t);
        setProducts(p); setInvoices(inv);
        try { setEmployees(await base44.entities.User.list("-created_date", 100)); } catch {}
        try { setVoids(await base44.entities.VoidLog.list("-created_date", 100)); } catch {}
      } finally { setLoading(false); }
    })();
  }, []);

  const productByName = useMemo(() => {
    const m = {};
    products.forEach((p) => { if (p.name && !m[p.name]) m[p.name] = p; });
    return m;
  }, [products]);

  const costOf = (item) => (productByName[item.name]?.cost || 0) * (item.qty || 0);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayTxns = txns.filter((t) => new Date(t.created_date) >= today);
    const todaySales = todayTxns.reduce((s, t) => s + Number(t.total || 0), 0);
    const todaySubtotal = todayTxns.reduce((s, t) => s + Number(t.subtotal || 0), 0);
    const todayTax = todayTxns.reduce((s, t) => s + Number(t.tax || 0), 0);
    const todayCost = todayTxns.reduce((s, t) => s + (t.items || []).reduce((c, it) => c + costOf(it), 0), 0);
    const todayProfit = todaySubtotal - todayCost;
    const todayMargin = todaySubtotal > 0 ? (todayProfit / todaySubtotal) * 100 : 0;
    const pendingInvoices = invoices.filter((i) => i.status !== "received").length;
    return { todaySales, todayCount: todayTxns.length, todayTax, todayProfit, todayMargin, todayCost, pendingInvoices };
  }, [txns, products, invoices]);

  const alerts = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
    const expiring = [], expired = [], expiringToday = [], lowStock = [];
    products.forEach((p) => {
      if (p.expiry_date) {
        const d = new Date(p.expiry_date); d.setHours(0, 0, 0, 0);
        if (d < today) expired.push(p);
        else if (d.getTime() === today.getTime()) expiringToday.push(p);
        else if (d <= in7) expiring.push(p);
      }
      if ((p.quantity_on_hand ?? 0) <= (p.reorder_point ?? 0)) lowStock.push(p);
    });
    return { expiring, expired, expiringToday, lowStock };
  }, [products]);

  const lowMarginItems = useMemo(
    () => products.filter((p) => p.price > 0 && (((p.price - (p.cost || 0)) / p.price) * 100) < (p.min_margin_policy || 20)).slice(0, 6),
    [products]
  );

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const total = txns.filter((t) => { const c = new Date(t.created_date); return c >= d && c < next; }).reduce((s, t) => s + Number(t.total || 0), 0);
      days.push({ day: d.toLocaleDateString("en", { weekday: "short" }), sales: Number(total.toFixed(2)) });
    }
    return days;
  }, [txns]);

  const topProducts = useMemo(() => {
    const counts = {};
    txns.forEach((t) => (t.items || []).forEach((it) => { counts[it.name] = (counts[it.name] || 0) + (it.qty || 0); }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty, product: productByName[name] }));
  }, [txns, productByName]);

  const salesByEmployee = useMemo(() => {
    const map = {};
    txns.forEach((t) => { if (!t.employee_id) return; map[t.employee_id] = (map[t.employee_id] || 0) + Number(t.total || 0); });
    return Object.entries(map).map(([id, total]) => ({ name: employees.find((e) => e.id === id)?.full_name || "Unknown", total })).sort((a, b) => b.total - a.total);
  }, [txns, employees]);

  const todayVoids = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return voids.filter((v) => new Date(v.created_date) >= today);
  }, [voids]);

  const salesByCategory = useMemo(() => {
    const map = {};
    txns.forEach((t) => (t.items || []).forEach((it) => {
      const ct = it.category_type || (it.age_restricted ? "liquor" : "retail");
      map[ct] = (map[ct] || 0) + (it.price || 0) * (it.qty || 0);
    }));
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return CATEGORY_LIST.map((c) => ({ ...c, total: map[c.id] || 0, pct: total > 0 ? ((map[c.id] || 0) / total) * 100 : 0 })).filter((c) => c.total > 0);
  }, [txns]);

  const ageVerifiedCount = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return txns.filter((t) => new Date(t.created_date) >= today && (t.items || []).some((it) => it.age_restricted || ["liquor", "tobacco"].includes(it.category_type))).length;
  }, [txns]);

  const grocerySubcats = useMemo(() => {
    const map = {};
    txns.forEach((t) => (t.items || []).forEach((it) => {
      if (it.category_type !== "grocery") return;
      const sub = it.category || "Other";
      map[sub] = (map[sub] || 0) + (it.price || 0) * (it.qty || 0);
    }));
    return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [txns]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading dashboard…</div>;

  const cards = [
    { label: "Today's Sales", value: `$${stats.todaySales.toFixed(2)}`, sub: `${stats.todayCount} transactions`, icon: DollarSign, accent: "from-emerald-400 to-teal-500" },
    { label: "Today's Margin", value: `${stats.todayMargin.toFixed(1)}%`, sub: `$${stats.todayProfit.toFixed(2)} profit`, icon: Percent, accent: "from-violet-400 to-purple-500" },
    { label: "Tax Collected Today", value: `$${stats.todayTax.toFixed(2)}`, icon: Receipt, accent: "from-blue-400 to-indigo-500" },
    { label: "Pending Invoices", value: stats.pendingInvoices, icon: FileText, accent: "from-amber-400 to-orange-500", onClick: () => navigate("/invoices") },
    { label: "Age-Verified Sales", value: ageVerifiedCount, sub: "today", icon: ShieldCheck, accent: "from-rose-400 to-pink-500" },
    { label: "Expiring Today", value: alerts.expiringToday.length, sub: "items", icon: CalendarClock, accent: "from-red-400 to-rose-500" },
  ];

  const firstName = (user?.full_name || user?.email || "").split(" ")[0];
  const totalCategorySales = salesByCategory.reduce((s, c) => s + c.total, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Premium header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 mb-6 text-white">
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName} 👋</h1>
            <p className="text-white/60 text-sm mt-1">Here's how your store is performing today.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_LIST.map((c) => {
              const cc = categoryColor(c.id);
              const amt = salesByCategory.find((s) => s.id === c.id)?.total || 0;
              return (
                <div key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10`}>
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${cc.gradient}`} />
                  <span className="text-xs text-white/70">{c.label}</span>
                  <span className="text-xs font-semibold text-white">${amt.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((c) => (
          <button key={c.label} onClick={c.onClick} className={`text-left bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow ${c.onClick ? "cursor-pointer" : "cursor-default"}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center mb-3 shadow-sm`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{c.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
            {c.sub && <div className="text-xs text-slate-400">{c.sub}</div>}
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales — last 7 days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={last7}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v) => [`$${v}`, "Sales"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="sales" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-2">Sales by category</h3>
          {salesByCategory.length === 0 ? (
            <div className="text-sm text-slate-400 py-16 text-center">No sales yet</div>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={salesByCategory} dataKey="total" nameKey="label" cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="none">
                      {salesByCategory.map((c) => <Cell key={c.id} fill={categoryColor(c.id).hex} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Sales"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[11px] text-slate-400">Total</div>
                  <div className="text-lg font-bold text-slate-900">${totalCategorySales.toFixed(0)}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {salesByCategory.map((c) => {
                  const cc = categoryColor(c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-600"><span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${cc.gradient}`} />{c.label}</span>
                      <span className="text-slate-400">{c.pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alerts with images */}
      {(alerts.expiring.length > 0 || alerts.expired.length > 0 || alerts.lowStock.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Inventory Alerts
          </h3>
          <div className="space-y-2">
            {alerts.expired.map((p) => (
              <button key={`ex-${p.id}`} onClick={() => navigate("/products", { state: { editId: p.id } })} className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-left">
                <ProductThumb product={p} />
                <div className="flex-1 min-w-0"><span className="text-sm font-medium text-slate-800">{p.name}</span><div className="text-xs text-red-700">Expired {p.expiry_date}</div></div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-200 text-red-800">EXPIRED</span>
              </button>
            ))}
            {alerts.expiring.map((p) => (
              <button key={`so-${p.id}`} onClick={() => navigate("/products", { state: { editId: p.id } })} className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-left">
                <ProductThumb product={p} />
                <div className="flex-1 min-w-0"><span className="text-sm font-medium text-slate-800">{p.name}</span><div className="text-xs text-amber-700">Expires {p.expiry_date}</div></div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">EXPIRING</span>
              </button>
            ))}
            {alerts.lowStock.map((p) => {
              const cc = categoryColor(p.category_type);
              return (
                <button key={`lo-${p.id}`} onClick={() => navigate("/products", { state: { editId: p.id } })} className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-left">
                  <ProductThumb product={p} />
                  <div className="flex-1 min-w-0"><span className="text-sm font-medium text-slate-800">{p.name}</span><div className="text-xs text-slate-400">{p.category || getCategoryType(p.category_type).label}</div></div>
                  <span className={`text-xs font-semibold ${cc.text}`}>{p.quantity_on_hand ?? 0} left</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">LOW</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top products with images */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Top products</h3>
          {topProducts.length === 0 ? (
            <div className="text-sm text-slate-400 py-8 text-center">No sales yet</div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((tp, i) => {
                const cc = categoryColor(tp.product?.category_type);
                return (
                  <div key={tp.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium flex items-center justify-center">{i + 1}</span>
                    <ProductThumb product={tp.product} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{tp.name}</div>
                      {tp.product && <div className="text-xs text-slate-400">{tp.product.category || getCategoryType(tp.product.category_type).label}</div>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cc.soft} ${cc.text}`}>{tp.qty} sold</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            <Mini label="Revenue" value={`$${stats.todaySales.toFixed(0)}`} accent="from-emerald-400 to-teal-500" />
            <Mini label="Cost of goods" value={`$${stats.todayCost.toFixed(0)}`} accent="from-rose-400 to-pink-500" />
            <Mini label="Profit" value={`$${stats.todayProfit.toFixed(0)}`} accent="from-blue-400 to-indigo-500" />
            <Mini label="Margin" value={`${stats.todayMargin.toFixed(1)}%`} accent="from-violet-400 to-purple-500" />
          </div>
        </div>
      </div>

      {isManagerUp(user?.role) && salesByEmployee.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
          <h3 className="font-semibold text-slate-800 mb-4">Sales by Employee</h3>
          <div className="space-y-2">
            {salesByEmployee.map((e) => (
              <div key={e.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-800">{e.name}</span>
                <span className="text-sm font-semibold text-slate-900">${e.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isManagerUp(user?.role) && todayVoids.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Voids & Refunds Today
            </h3>
            <button onClick={() => navigate("/transactions")} className="text-xs text-slate-400 hover:text-slate-600">View all →</button>
          </div>
          <div className="text-sm text-slate-500 mb-3">
            {todayVoids.length} action{todayVoids.length !== 1 ? "s" : ""} · ${todayVoids.reduce((s, v) => s + Number(v.transaction_total || 0), 0).toFixed(2)}
          </div>
          <div className="space-y-2">
            {todayVoids.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-sm">
                  <span className="font-medium text-slate-800">{v.voided_by_name || "—"}</span>{" "}
                  <span className="text-slate-400 capitalize">{v.action}ed</span> ${Number(v.transaction_total || 0).toFixed(2)}
                  {v.reason ? ` · ${v.reason}` : ""}
                </div>
                <div className="text-xs text-slate-400">{new Date(v.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {salesByCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
          <h3 className="font-semibold text-slate-800 mb-4">Category mix</h3>
          <div className="space-y-3">
            {salesByCategory.map((c) => {
              const cc = categoryColor(c.id);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{c.label}</span>
                    <span className="text-slate-500">${c.total.toFixed(2)} · {c.pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${cc.gradient}`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {grocerySubcats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
          <h3 className="font-semibold text-slate-800 mb-4">Grocery Sales by Subcategory</h3>
          <div className="space-y-2">
            {grocerySubcats.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-800">{s.name}</span>
                <span className="text-sm font-semibold text-slate-900">${s.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lowMarginItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" /> Low-margin items
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lowMarginItems.map((p) => {
              const m = p.price > 0 ? ((p.price - (p.cost || 0)) / p.price) * 100 : 0;
              return (
                <button key={p.id} onClick={() => navigate("/products", { state: { editId: p.id } })} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-left">
                  <ProductThumb product={p} size="w-9 h-9" />
                  <span className="flex-1 text-sm font-medium text-slate-800 truncate">{p.name}</span>
                  <span className="text-xs text-red-700 font-medium">{m.toFixed(0)}% margin</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${accent} mb-2`} />
      <div className="text-lg font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}