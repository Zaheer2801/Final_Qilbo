import Nav from "./components/Nav";
import Hero from "./components/Hero";
import BeforeAfter from "./components/BeforeAfter";
import Features from "./components/Features";
import Statement from "./components/Statement";
import Positioning from "./components/Positioning";
import Workflow from "./components/Workflow";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="bg-canvas text-ink" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />
      <main>
        <Hero />
        <BeforeAfter />
        <Features />
        <Statement />
        <Positioning />
        <Workflow />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
