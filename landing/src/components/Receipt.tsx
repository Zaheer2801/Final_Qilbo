import { useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const LINES = [
  { label: "Grey Goose 750ml", value: "" },
  { label: "  On hand", value: "8  (reorder pt 10)" },
  { label: "  Suggested", value: "12 cases" },
  { label: "  Vendor", value: "Republic National" },
  { label: "  Est. cost", value: "$312.00" },
];

/** The hero moment: a printed decision that only completes when the visitor
 * approves it — the approval-gate philosophy made literal, not described.
 * Numbers are illustrative sample data (same shape as this project's own
 * Sample Data/inventory.csv), not a real customer's transaction. */
export default function Receipt() {
  const reducedMotion = usePrefersReducedMotion();
  const [approved, setApproved] = useState(false);
  const [approvedAt, setApprovedAt] = useState("");

  function approve() {
    if (approved) return;
    const now = new Date();
    setApprovedAt(now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    setApproved(true);
  }

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* torn/perforated top edge */}
      <div
        aria-hidden
        className="h-3 bg-receipt"
        style={{
          maskImage: "radial-gradient(circle at 6px 0, transparent 5px, black 5.5px)",
          maskSize: "12px 12px",
          maskRepeat: "repeat-x",
          maskPosition: "bottom",
          WebkitMaskImage: "radial-gradient(circle at 6px 0, transparent 5px, black 5.5px)",
          WebkitMaskSize: "12px 12px",
          WebkitMaskRepeat: "repeat-x",
          WebkitMaskPosition: "bottom",
        }}
      />
      <div className="bg-receipt text-ink px-6 py-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <p className="font-mono text-[11px] tracking-widest text-muted mb-4">SAMPLE DECISION · LIQUOR RETAIL</p>

        <div className="font-mono text-sm space-y-1.5">
          {LINES.map((line, i) => (
            <div
              key={line.label}
              className={`flex justify-between gap-4 ${reducedMotion ? "" : "opacity-0 animate-print-line"}`}
              style={reducedMotion ? undefined : { animationDelay: `${i * 130}ms` }}
            >
              <span className={line.value ? "text-muted" : "font-semibold"}>{line.label}</span>
              <span>{line.value}</span>
            </div>
          ))}
        </div>

        <div
          className={`mt-4 pt-4 border-t border-dashed border-ink/20 font-mono text-sm ${reducedMotion ? "" : "opacity-0 animate-print-line"}`}
          style={reducedMotion ? undefined : { animationDelay: `${LINES.length * 130}ms` }}
        >
          {!approved ? (
            <button
              onClick={approve}
              className={`w-full flex items-center justify-between text-accent font-semibold tracking-wide ${reducedMotion ? "" : "animate-pulse-soft"}`}
            >
              <span>AWAITING YOUR APPROVAL</span>
              <span className="text-xs underline underline-offset-2">approve →</span>
            </button>
          ) : (
            <div className={`flex items-center justify-between text-confirmed font-semibold ${reducedMotion ? "" : "animate-stamp-in"}`}>
              <span>✓ APPROVED</span>
              <span className="text-xs text-muted">{approvedAt}</span>
            </div>
          )}
        </div>
      </div>
      {/* torn/perforated bottom edge */}
      <div
        aria-hidden
        className="h-3 bg-receipt"
        style={{
          maskImage: "radial-gradient(circle at 6px 12px, transparent 5px, black 5.5px)",
          maskSize: "12px 12px",
          maskRepeat: "repeat-x",
          maskPosition: "top",
          WebkitMaskImage: "radial-gradient(circle at 6px 12px, transparent 5px, black 5.5px)",
          WebkitMaskSize: "12px 12px",
          WebkitMaskRepeat: "repeat-x",
          WebkitMaskPosition: "top",
        }}
      />
    </div>
  );
}
