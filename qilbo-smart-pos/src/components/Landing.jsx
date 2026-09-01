import Nav from "./landing/Nav.tsx";
import Hero from "./landing/Hero.tsx";
import BeforeAfter from "./landing/BeforeAfter.tsx";
import Features from "./landing/Features.tsx";
import Statement from "./landing/Statement.tsx";
import Positioning from "./landing/Positioning.tsx";
import Workflow from "./landing/Workflow.tsx";
import FAQ from "./landing/FAQ.tsx";
import FinalCTA from "./landing/FinalCTA.tsx";
import Footer from "./landing/Footer.tsx";

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
