import Nav from "./landing/Nav";
import Hero from "./landing/Hero";
import BeforeAfter from "./landing/BeforeAfter";
import Features from "./landing/Features";
import Statement from "./landing/Statement";
import Positioning from "./landing/Positioning";
import Workflow from "./landing/Workflow";
import FAQ from "./landing/FAQ";
import FinalCTA from "./landing/FinalCTA";
import Footer from "./landing/Footer";

export default function Landing({ onGetStarted }) {
  return (
    <div className="bg-stone-50 text-stone-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav onGetStarted={onGetStarted} />
      <main>
        <Hero onGetStarted={onGetStarted} />
        <BeforeAfter />
        <Features />
        <Statement />
        <Positioning />
        <Workflow />
        <FAQ />
        <FinalCTA onGetStarted={onGetStarted} />
      </main>
      <Footer />
    </div>
  );
}
