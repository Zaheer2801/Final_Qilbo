import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Bell, DollarSign, LayoutDashboard, Loader2, Package, Phone, Receipt, Search } from "lucide-react";
import type { AppState, BusinessConfig, MarginPolicyRow } from "./types";
import { emptyState } from "./lib/state";
import { loadState, saveState, clearState } from "./lib/storage";
import Onboarding from "./components/Onboarding";
import Overview from "./components/dashboard/Overview";
import InventoryTab from "./components/dashboard/InventoryTab";
import ProcurementTab from "./components/dashboard/ProcurementTab";
import PricingTab from "./components/dashboard/PricingTab";
import ExpiryTab from "./components/dashboard/ExpiryTab";
import AlertsTab from "./components/dashboard/AlertsTab";
import SettingsTab from "./components/dashboard/SettingsTab";
import { ProductThumb } from "./components/dashboard/ProductThumb";
import { CategoryPill } from "./components/ui";
import { titleCase } from "./lib/format";

type TabId = "overview" | "inventory" | "procurement" | "pricing" | "expiry" | "alerts" | "settings";
type Section = "Overview" | "Manage" | "Settings";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard; section: Section }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, section: "Overview" },
  { id: "inventory", label: "Inventory", icon: Package, section: "Manage" },
  { id: "procurement", label: "Procurement", icon: Receipt, section: "Manage" },
  { id: "pricing", label: "Pricing", icon: DollarSign, section: "Manage" },
  { id: "expiry", label: "Expiry", icon: AlertTriangle, section: "Manage" },
  { id: "alerts", label: "Alerts", icon: Bell, section: "Manage" },
  { id: "settings", label: "Settings", icon: Phone, section: "Settings" },
];
const SECTIONS: Section[] = ["Overview", "Manage", "Settings"];

function initState(): AppState {
  const loaded = loadState<AppState>();
  // Merge over emptyState() so a browser with state saved before a new
  // AppState field existed (e.g. qtyLog) backfills that field instead of
  // crashing on the missing key.
  return loaded ? { ...emptyState(), ...loaded } : emptyState();
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function App() {
  const [state, setState] = useState<AppState>(initState);
  const [tab, setTab] = useState<TabId>("overview");
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const updateState = useCallback((updater: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  function completeOnboarding(cfg: BusinessConfig, policy: MarginPolicyRow[]) {
    updateState((s) => ({ ...s, config: cfg, marginPolicy: policy }));
  }

  function resetAll() {
    const fresh = emptyState();
    setState(fresh);
    clearState();
  }

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    return state.products.filter((p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [globalSearch, state.products]);

  function jumpToProduct(productId: string) {
    setTab("inventory");
    setPendingProductId(productId);
    setGlobalSearch("");
    setSearchOpen(false);
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="animate-spin text-amber-800" size={28} />
      </div>
    );
  }

  if (!state.config.onboardingComplete) {
    return (
      <div className="min-h-screen bg-stone-100" style={{ fontFamily: "Georgia, serif" }}>
        <Onboarding initialConfig={state.config} initialMarginPolicy={state.marginPolicy} onComplete={completeOnboarding} />
      </div>
    );
  }

  const currentTab = TABS.find((t) => t.id === tab)!;
  const businessLabel = state.config.dba || state.config.businessName || "Qilbo";

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex">
      {/* Sidebar */}
      <div className="w-60 shrink-0 border-r border-stone-200 bg-white flex flex-col">
        <div className="flex items-center gap-2 px-5 py-6">
          <div className="w-8 h-8 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>
            Q
          </div>
          <h1 className="text-base font-bold truncate" style={{ fontFamily: "Georgia, serif" }}>
            {businessLabel}
          </h1>
        </div>

        <nav className="flex flex-col px-3 gap-3 flex-1">
          {SECTIONS.map((section) => (
            <div key={section}>
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">{section}</div>
              <div className="flex flex-col gap-0.5">
                {TABS.filter((t) => t.section === section).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-left ${
                      tab === t.id ? "bg-amber-50 text-amber-900 font-medium" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                    }`}
                  >
                    <t.icon size={16} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-stone-100 px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center text-xs font-semibold shrink-0">
            {initials(state.config.ownerName || businessLabel)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-stone-800 truncate">{state.config.ownerName || "Owner"}</div>
            <div className="text-[11px] text-stone-400 truncate">{state.config.email || "Prototype — local data only"}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top toolbar: breadcrumb + global product search */}
        <div className="flex items-center gap-4 px-8 py-4 border-b border-stone-200 bg-white">
          <div className="text-sm text-stone-500 shrink-0">
            <span>{businessLabel}</span> <span className="text-stone-300">/</span> <span className="text-stone-800 font-medium">{currentTab.label}</span>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              className="w-full rounded-md border border-stone-300 bg-stone-50 pl-8 pr-3 py-1.5 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/40 focus:border-amber-700 focus:bg-white"
              placeholder="Search products…"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            />
            {searchOpen && globalSearch.trim() && (
              <div className="absolute z-50 top-full left-0 mt-1 w-80 max-h-80 overflow-y-auto rounded-md border border-stone-200 bg-white shadow-lg">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-stone-400 px-3 py-3">No products match "{globalSearch.trim()}".</p>
                ) : (
                  searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => jumpToProduct(p.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-stone-50 border-b border-stone-50 last:border-0"
                    >
                      <ProductThumb product={p} iconSize={12} className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm truncate">
                          {titleCase(p.name)} {p.size}
                        </div>
                        <div className="text-xs text-stone-400 truncate flex items-center gap-1.5">
                          {p.brand && <span>{titleCase(p.brand)}</span>}
                          <CategoryPill category={p.category} />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 px-8 py-8">
          {tab === "overview" && <Overview state={state} />}
          {tab === "inventory" && (
            <InventoryTab
              state={state}
              updateState={updateState}
              pendingProductId={pendingProductId}
              onPendingConsumed={() => setPendingProductId(null)}
            />
          )}
          {tab === "procurement" && <ProcurementTab state={state} updateState={updateState} />}
          {tab === "pricing" && <PricingTab state={state} updateState={updateState} />}
          {tab === "expiry" && <ExpiryTab state={state} />}
          {tab === "alerts" && <AlertsTab state={state} updateState={updateState} />}
          {tab === "settings" && <SettingsTab state={state} updateState={updateState} onReset={resetAll} />}
        </div>
      </div>
    </div>
  );
}
