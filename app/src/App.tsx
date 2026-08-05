import { useCallback, useState } from "react";
import { AlertTriangle, Bell, DollarSign, LayoutDashboard, Loader2, Package, Phone, Receipt } from "lucide-react";
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

type TabId = "overview" | "inventory" | "procurement" | "pricing" | "expiry" | "alerts" | "settings";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "procurement", label: "Procurement", icon: Receipt },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "expiry", label: "Expiry", icon: AlertTriangle },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Phone },
];

function initState(): AppState {
  return loadState<AppState>() ?? emptyState();
}

export default function App() {
  const [state, setState] = useState<AppState>(initState);
  const [tab, setTab] = useState<TabId>("overview");

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

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center font-bold" style={{ fontFamily: "Georgia, serif" }}>
            Q
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
            {state.config.dba || state.config.businessName || "Qilbo"}
          </h1>
          <span className="ml-auto text-xs text-stone-400">Prototype — local data only</span>
        </div>

        <div className="flex gap-1 mb-6 border-b border-stone-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px ${
                tab === t.id ? "border-amber-800 text-amber-900 font-medium" : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview state={state} />}
        {tab === "inventory" && <InventoryTab state={state} updateState={updateState} />}
        {tab === "procurement" && <ProcurementTab state={state} updateState={updateState} />}
        {tab === "pricing" && <PricingTab state={state} updateState={updateState} />}
        {tab === "expiry" && <ExpiryTab state={state} />}
        {tab === "alerts" && <AlertsTab state={state} updateState={updateState} />}
        {tab === "settings" && <SettingsTab state={state} updateState={updateState} onReset={resetAll} />}
      </div>
    </div>
  );
}
