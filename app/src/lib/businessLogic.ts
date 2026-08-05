// Business logic ported from this repo's skill files:
//   lead-team.md            — reorder point / demand-driven procurement
//   pricing-intelligence.md — margin floor hierarchy + guardrail
//   expiry-monitoring.md    — expiry urgency tiers (date + sell-through, not date alone)
//   whatsapp-alerts.md      — demand-alert threshold / re-alerting (see AlertsTab)
//
// Every number here is computed from whatever's in AppState at call time — nothing
// is hardcoded or cached, matching grounding-and-retrieval.md's "recompute from
// source, don't reuse an earlier calculation" rule.

import type {
  BusinessConfig,
  ExpiryRisk,
  MarginOverride,
  MarginPolicyRow,
  Product,
  ReorderUnit,
  Sale,
} from "../types";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(ms / 86_400_000);
}

/** Units sold per day over the trailing window — the velocity figure lead-team.md
 * requires before any reorder recommendation ("never estimate from memory"). */
export function velocityPerDay(productId: string, sales: Sale[], windowDays = 14): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const total = sales
    .filter((s) => s.productId === productId && new Date(s.date) >= cutoff)
    .reduce((sum, s) => sum + Number(s.qty), 0);
  return total / windowDays;
}

/** lead-team.md Step 3: "Calculate reorder quantity against the reorder point
 * already set in the system", using the store-wide multiple/unit rule from
 * onboarding-flow.md Step 9. Per-item overrides (cigars vs. liquor cases) are
 * explicitly deferred to later, once inventory is loaded — not modeled here. */
export function reorderSuggestion(
  product: Product,
  config: Pick<BusinessConfig, "reorderMultiple" | "reorderUnit">
): { qty: number; unit: ReorderUnit } {
  const short = Math.max(product.reorderPoint - product.qty, 1);
  const mult = Math.max(1, Number(config.reorderMultiple) || 1);
  const qty = Math.max(mult, Math.ceil(short / mult) * mult);
  return { qty, unit: config.reorderUnit };
}

/** pricing-intelligence.md's margin floor hierarchy, strongest wins:
 *   1. Item-level approved override, but ONLY if it actually lowers the floor
 *      (an approved counter-proposal at/above the category minimum is "no
 *      longer actually an override" per that SOP's rule 5 — it doesn't apply
 *      here, the plain category minimum still governs).
 *   2. Category minimum from marginPolicy.
 *   3. Store-wide default (25%) if the category has no policy row.
 */
export function marginFloorFor(
  product: Product,
  marginPolicy: MarginPolicyRow[],
  marginOverrides: MarginOverride[]
): { floor: number; source: string } {
  const cat = marginPolicy.find((m) => m.category === product.category);
  const catFloor = cat?.minMarginPct ?? 25;

  const approved = marginOverrides.find(
    (o) =>
      o.productId === product.id &&
      o.status === "approved" &&
      o.approvedMargin !== "" &&
      Number(o.approvedMargin) < catFloor
  );
  if (approved) {
    return { floor: Number(approved.approvedMargin), source: `approved override (${approved.reason || "no reason given"})` };
  }
  if (cat) {
    return { floor: Number(cat.minMarginPct), source: `${product.category} category minimum` };
  }
  return { floor: 25, source: "store default (no category policy set)" };
}

/** Recomputed at call time from purchase/selling price — never reused from an
 * earlier render, per grounding-and-retrieval.md. */
export function currentMargin(product: Product): number {
  if (!product.sellingPrice) return 0;
  return ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100;
}

/** expiry-monitoring.md: urgency is days-until-expiry weighed together with
 * quantity on hand and recent sell-through — not the date alone. Zero recent
 * sales is its own High-urgency trigger regardless of how far out the date is
 * (the SOP's explicit "don't force a conclusion from thin data, but flag the
 * lack of movement" rule). Tier cutoffs below are this prototype's concrete
 * reading of the SOP's qualitative Low/Medium/High description — there's no
 * single numeric threshold specified there, so treat these as a starting
 * point to tune, not a fixed rule. */
export function expiryUrgency(product: Product, sales: Sale[]): ExpiryRisk | null {
  if (!product.expiryDate) return null;
  const days = daysUntil(product.expiryDate) ?? 0;
  const vel = velocityPerDay(product.id, sales);
  const projectedSold = vel * Math.max(days, 0);
  const remainPct = product.qty > 0 ? Math.max(0, product.qty - projectedSold) / product.qty : 0;

  let tier: ExpiryRisk["tier"] = "Low";
  let reason = "";
  if (vel === 0) {
    tier = "High";
    reason = "zero recent sales — flagged for lack of movement, not just the date";
  } else if (days <= 45 && remainPct > 0.5) {
    tier = "High";
    reason = `at current pace, ~${Math.round(remainPct * 100)}% of stock will still be on hand at expiry`;
  } else if (remainPct > 0.2) {
    tier = "Medium";
    reason = `at current pace, ~${Math.round(remainPct * 100)}% of stock may still be on hand at expiry`;
  } else {
    reason = "current pace should clear stock before expiry";
  }
  return { days, vel: round2(vel), remainPct: Math.round(remainPct * 100), tier, reason };
}

export interface AlertDecision {
  shouldAlert: boolean;
  /** New value to store in AppState.alertState[product] regardless of outcome. */
  newAlertStateCount: number;
}

/** whatsapp-alerts.md + lead-team.md's demand-listening threshold: fires once
 * total not-carried asks for a product reaches the threshold, and re-fires only
 * once that many *new* asks have come in since the last fire — not on every
 * ask past the threshold. `currentInquiryCount` is the running total of
 * not-carried inquiries for the product; `lastAlertCount` is what that total
 * was the last time an alert fired (0 if never). */
export function evaluateDemandAlert(currentInquiryCount: number, lastAlertCount: number, threshold: number): AlertDecision {
  const shouldAlert = currentInquiryCount - lastAlertCount >= threshold;
  return { shouldAlert, newAlertStateCount: shouldAlert ? currentInquiryCount : lastAlertCount };
}
