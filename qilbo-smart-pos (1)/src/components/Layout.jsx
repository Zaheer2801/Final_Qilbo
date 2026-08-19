import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Store, ShoppingCart, Package, BarChart3, LogOut, Home, Plus, Truck, FileText, Settings as SettingsIcon, Users as UsersIcon, Receipt as ReceiptIcon, ScanLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canAccess, roleLabel, roleBadgeColor, isOwner } from "@/lib/permissions";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/pos", label: "POS", icon: ShoppingCart },
  { to: "/price-check", label: "Scan", icon: ScanLine },
  { to: "/products", label: "Inventory", icon: Package },
  { to: "/vendors", label: "Vendors", icon: Truck },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/transactions", label: "Sales", icon: ReceiptIcon },
  { to: "/customers", label: "Customers", icon: UsersIcon },
  { to: "/users", label: "Users", icon: UsersIcon },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const stores = await base44.entities.Store.list("-created_date", 1);
        if (stores.length) setStore(stores[0]);
      } catch {}
    })();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = "/login";
  };

  const visibleNav = navItems.filter((n) => canAccess(n.to, user?.role));
  const firstName = (user?.full_name || user?.email || "").split(" ")[0];

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <aside className="hidden md:flex w-20 lg:w-60 flex-col bg-slate-900 text-slate-100 shrink-0">
        <div className="h-16 flex items-center gap-2 px-4 lg:px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-slate-900" />
          </div>
          <div className="hidden lg:block min-w-0">
            <div className="font-semibold text-lg tracking-tight leading-none">Qilbo</div>
            {store && <div className="text-[11px] text-slate-400 truncate mt-0.5">{store.name}</div>}
          </div>
        </div>

        {user && (
          <div className="px-3 lg:px-4 py-3 border-b border-slate-800 hidden lg:block">
            <div className="text-xs text-slate-400">Hi {firstName}</div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeColor(user.role)}`}>{roleLabel(user.role)}</span>
          </div>
        )}

        <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </NavLink>
          ))}
        </nav>
        {isOwner(user?.role) && (
          <button onClick={() => navigate("/setup")} className="mx-2 lg:mx-3 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
            <Plus className="w-5 h-5 shrink-0" /><span className="hidden lg:block">Add store</span>
          </button>
        )}
        <button onClick={handleLogout} className="mx-2 lg:mx-3 mb-2 lg:mb-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <LogOut className="w-5 h-5 shrink-0" /><span className="hidden lg:block">Logout {firstName}</span>
        </button>
      </aside>

      <main className="flex-1 overflow-hidden">
        <div className="md:hidden h-14 flex items-center justify-between px-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-slate-900" />
            </div>
            <span className="font-semibold">Qilbo</span>
          </div>
          <div className="flex gap-1">
            {visibleNav.map(({ to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `p-2 rounded-lg ${isActive ? "text-emerald-300 bg-slate-800" : "text-slate-400"}`}
              >
                <Icon className="w-5 h-5" />
              </NavLink>
            ))}
          </div>
        </div>
        <div className="h-full md:h-full overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}