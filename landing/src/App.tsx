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

export default function App() {
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  return (
    <div className="bg-canvas text-ink" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav onOpenSetup={() => setIsSetupOpen(true)} />
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
        <FinalCTA onOpenSetup={() => setIsSetupOpen(true)} />
      </main>
      <Footer />
      <StoreSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
    </div>
  );
}


