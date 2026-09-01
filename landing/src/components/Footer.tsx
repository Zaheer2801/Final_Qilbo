import { TextAnimationCollection } from "../shaders/neuform-isolated/NeuformIsolatedEffects";
import "../shaders/threeui.css";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-amber-100/60 pt-16 pb-12 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-xs font-display">
            Q
          </div>
          <span className="font-display font-semibold text-amber-50">Qilbo</span>
        </div>
        <p className="text-xs text-amber-100/40">Prototype — not yet connected to a live POS.</p>
      </div>

      {/* Tight Right-Fit Particle Wordmark Card with Continuous Sequential Glowing Border */}
      <div className="max-w-[650px] w-full mx-auto px-4">
        <div className="glowing-border-container">
          <div className="glowing-border-inner h-[105px] sm:h-[120px] md:h-[135px] flex items-center justify-center">
            <TextAnimationCollection
              variant="particle-wordmark"
              mode="dark"
              hue={0}
              saturation={1.00}
              brightness={1.00}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}


