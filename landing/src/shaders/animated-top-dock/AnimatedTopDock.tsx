import { useEffect, useRef, useState, type ReactNode } from "react";
import { createTopDockController, type TopDockOptions } from "./topDockController";

export const ANIMATED_TOP_DOCK_VARIANTS = ["sable", "modern", "retro", "glass"] as const;
export type AnimatedTopDockVariant = (typeof ANIMATED_TOP_DOCK_VARIANTS)[number];

export type AnimatedTopDockProps = {
  variant?: AnimatedTopDockVariant;
  proximity?: number;
  spring?: number;
  damping?: number;
  widthGrowth?: number;
  heightGrowth?: number;
  drop?: number;
  className?: string;
};

export const ANIMATED_TOP_DOCK_DEFAULTS = {
  variant: "sable" as AnimatedTopDockVariant,
  proximity: 122,
  spring: 0.19,
  damping: 0.7,
  widthGrowth: 17,
  heightGrowth: 16,
  drop: 3.5,
} as const;

type DockItem = { id: string; label: string; icon?: ReactNode };

const ITEMS: readonly DockItem[] = [
  { id: "features", label: "Features" },
  { id: "calculator", label: "Savings ROI" },
  { id: "workflow", label: "How It Works" },
  { id: "faq", label: "FAQ" },
];

const BRAND_MARK = (
  <div className="w-4 h-4 rounded bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-[10px] font-display leading-none">
    Q
  </div>
);

function useDockController(getOptions: () => TopDockOptions) {
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return createTopDockController(root, getOptions);
  }, []);
  return rootRef;
}

export function AnimatedTopDock({ className = "", ...props }: AnimatedTopDockProps) {
  const optionsRef = useRef({ ...ANIMATED_TOP_DOCK_DEFAULTS, ...props });
  optionsRef.current = { ...ANIMATED_TOP_DOCK_DEFAULTS, ...props };
  const [active, setActive] = useState(ITEMS[0].id);

  const rootRef = useDockController(() => ({
    ...optionsRef.current,
    axis: "x" as const,
  }));

  const handleNavClick = (id: string) => {
    setActive(id);
    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`animated-top-dock-component ${className}`}>
      <nav ref={rootRef} className="animated-top-dock__nav" aria-label="Animated top dock" data-dock-state="idle" data-dock-max="0.00">
        <button
          className="animated-top-dock__item animated-top-dock__logo"
          data-dock-item
          type="button"
          aria-label="Home"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {BRAND_MARK}
        </button>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            className="animated-top-dock__item animated-top-dock__link"
            data-dock-item
            type="button"
            aria-pressed={active === item.id}
            onClick={() => handleNavClick(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
