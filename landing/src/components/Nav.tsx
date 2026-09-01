import { useState } from "react";

const NAV_LINKS = [
  { id: "features", label: "Features", href: "#features" },
  { id: "calculator", label: "Savings ROI", href: "#calculator" },
  { id: "workflow", label: "How It Works", href: "#workflow" },
  { id: "faq", label: "FAQ", href: "#faq" },
];

export default function Nav({ onOpenSetup }: { onOpenSetup?: () => void }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-canvas/90 backdrop-blur border-b border-black/[0.06]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm font-display shadow-sm group-hover:scale-105 transition-transform duration-200">
            Q
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-ink">Qilbo</span>
        </a>

        {/* Clean Nav Bar with Hover Pill Effect (No Resizing or Layout Shift) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-black/[0.03] border border-black/[0.04]">
          {NAV_LINKS.map((link, idx) => (
            <a
              key={link.id}
              href={link.href}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-out text-ink/75 hover:text-amber-950 ${
                hoveredIdx === idx
                  ? "bg-white text-amber-900 shadow-sm -translate-y-[2px]"
                  : ""
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-block text-xs font-semibold text-amber-900 bg-amber-100/90 hover:bg-amber-100 px-3.5 py-2 rounded-md border border-amber-300/60 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-sm"
          >
            Launch POS Demo
          </a>
          <button
            type="button"
            onClick={onOpenSetup}
            className="inline-flex items-center rounded-md bg-amber-800 text-amber-50 text-sm font-medium px-4 py-2 hover:bg-amber-900 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md cursor-pointer"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
