import { useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import BeforeAfter from "./components/BeforeAfter";
import Features from "./components/Features";
import Statement from "./components/Statement";
import Positioning from "./components/Positioning";
import SavingsCalculator from "./components/SavingsCalculator";
import IndustryCategories from "./components/IndustryCategories";
import Workflow from "./components/Workflow";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import StoreSetupModal from "./components/StoreSetupModal";
import DashboardView from "./components/DashboardView";

export default function App() {
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [storeName, setStoreName] = useState("Cask & Cellar Spirits");

  const handleLaunchDashboard = (customName?: string) => {
    if (customName && typeof customName === "string") {
      setStoreName(customName);
    }
    setViewMode("dashboard");
  };

  if (viewMode === "dashboard") {
    return (
      <DashboardView
        storeName={storeName}
        onBackToLanding={() => setViewMode("landing")}
      />
    );
  }

  return (
    <div className="bg-canvas text-ink" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav
        onOpenSetup={() => setIsSetupOpen(true)}
        onLaunchDashboard={() => handleLaunchDashboard()}
      />
      <main>
        <Hero onOpenSetup={() => setIsSetupOpen(true)} />
        <BeforeAfter />
        <Features />
        <Statement />
        <Positioning />
        <SavingsCalculator />
        <IndustryCategories />
        <Workflow />
        <FAQ />
        <FinalCTA
          onOpenSetup={() => setIsSetupOpen(true)}
          onLaunchDashboard={() => handleLaunchDashboard()}
        />
      </main>
      <Footer />
      <StoreSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onLaunchDashboard={(name) => handleLaunchDashboard(name)}
      />
    </div>
  );
}


