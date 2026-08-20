import { useCallback, useState } from "react";
import { AlertTriangle, Bell, DollarSign, LayoutDashboard, Loader2, Package, Phone, Receipt } from "lucide-react";
import type { AppState, BusinessConfig, MarginPolicyRow } from "./types";
import { emptyState } from "./lib/state";
import { loadState, saveState, clearState } from "./lib/storage";

// Landing components
import LandingNav from "./components/Nav";
import Hero from "./components/Hero";
import BeforeAfter from "./components/BeforeAfter";
import Features from "./components/Features";
import Statement from "./components/Statement";
import Positioning from "./components/Positioning";
import Workflow from "./components/Workflow";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

// Dashboard components
import Onboarding from "./components/Onboarding";
import Overview from "./components/dashboard/Overview";
import InventoryTab from "./components/dashboard/InventoryTab";
import ProcurementTab from "./components/dashboard/ProcurementTab";
import PricingTab from "./components/dashboard/PricingTab";
import ExpiryTab from "./components/dashboard/ExpiryTab";
import AlertsTab from "./components/dashboard/AlertsTab";
import SettingsTab from "./components/dashboard/SettingsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "procurement", label: "Procurement", icon: Receipt },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "expiry", label: "Expiry", icon: AlertTriangle },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Phone },
];

function initState() {
  const loaded = loadState();
  return loaded ? { ...emptyState(), ...loaded } : emptyState();
}

export default function App() {
  const [state, setState] = useState(initState);
  const [tab, setTab] = useState("overview");
  const [showLanding, setShowLanding] = useState(true);

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  function completeOnboarding(cfg, policy) {
    updateState((s) => ({ ...s, config: cfg, marginPolicy: policy }));
  }

  function resetAll() {
    const fresh = emptyState();
    setState(fresh);
    clearState();
    setShowLanding(true);
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="animate-spin text-amber-800" size={28} />
      </div>
    );
  }

  // Show landing page first
  if (showLanding) {
    return (
      <div className="bg-canvas text-ink" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <LandingNav onGetStarted={() => setShowLanding(false)} />
        <main>
          <Hero onGetStarted={() => setShowLanding(false)} />
          <BeforeAfter />
          <Features />
          <Statement />
          <Positioning />
          <Workflow />
          <FAQ />
          <FinalCTA onGetStarted={() => setShowLanding(false)} />
        </main>
        <Footer />
      </div>
    );
  }

  // Show onboarding if not complete
  if (!state.config.onboardingComplete) {
    return (
      <div className="min-h-screen bg-stone-100" style={{ fontFamily: "Georgia, serif" }}>
        <Onboarding initialConfig={state.config} initialMarginPolicy={state.marginPolicy} onComplete={completeOnboarding} />
      </div>
    );
  }

  // Show dashboard
  const currentTab = TABS.find((t) => t.id === tab);
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
          {["Overview", "Manage", "Settings"].map((section) => (
            <div key={section}>
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">{section}</div>
              <div className="flex flex-col gap-0.5">
                {TABS.filter((t) =>
                  (section === "Overview" && t.id === "overview") ||
                  (section === "Manage" && ["inventory", "procurement", "pricing", "expiry", "alerts"].includes(t.id)) ||
                  (section === "Settings" && t.id === "settings")
                ).map((t) => (
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
            Z
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-stone-800 truncate">{state.config.ownerName || "Owner"}</div>
            <div className="text-[11px] text-stone-400 truncate">Local prototype</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top toolbar */}
        <div className="flex items-center gap-4 px-8 py-4 border-b border-stone-200 bg-white">
          <div className="text-sm text-stone-500 shrink-0">
            <span>{businessLabel}</span> <span className="text-stone-300">/</span> <span className="text-stone-800 font-medium">{currentTab?.label}</span>
          </div>
        </div>

        <div className="flex-1 px-8 py-8">
          {tab === "overview" && <Overview state={state} />}
          {tab === "inventory" && <InventoryTab state={state} updateState={updateState} />}
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
