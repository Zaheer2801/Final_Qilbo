import { useEffect, useState } from "react";

/** The receipt's line-by-line "printing" reveal is Qilbo's one signature
 * motion (per frontend-design.md) — but it's still just motion, and some
 * visitors have it turned off system-wide. Branch on this at the component
 * level (not just the global CSS transition-killer in index.css) so the
 * reduced-motion path is a real fallback — the full receipt renders at once,
 * not a 1ms flash of the same animation. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
