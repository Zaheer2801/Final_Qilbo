---
name: pricing-intelligence
description: "Use this skill whenever a price is being set, changed, or evaluated — including checking a new invoice cost against existing selling price, proposing a price increase based on sales velocity, or validating any price before it's displayed or saved. Trigger for requests like 'is this priced correctly', 'should we raise the price on X', or any invoice-to-inventory step that touches purchase_price/selling_price (see invoice-to-inventory.md)."
---

# Pricing Intelligence & Margin Guardrails — SOP

## Scope
Two distinct jobs that must not be conflated:
1. **Margin guardrail** — a protective, always-on check: no item is ever priced below its
   purchase price plus minimum margin.
2. **Overselling-based recommendation** — a proactive, optional suggestion: an item selling
   unusually fast might be a candidate for a price increase.
The first is a hard block. The second is a recommendation the Owner can ignore. Don't let
the second imply the authority of the first.

## Margin floor hierarchy (strongest wins)
The floor for any given item is determined in this order — stop at the first tier that
applies:

1. **Item-level approved override** — check `/data/margin_overrides.csv` (or its live
   equivalent) for a row matching this exact `product_id` with `status=approved`. If found,
   use `requested_margin_pct` as this item's floor. An override applies only to the specific
   product it names — it never lowers the category's general floor for other items.
2. **Category minimum** — check `/data/margin_policy.csv` for a row matching this item's
   `category`. This is the default floor for everything in that category (e.g., Liquor
   categories at 30%, Tobacco at 20% — set by the Owner, not inferred or assumed).
3. **Store-wide default** — only if the category has no entry in `margin_policy.csv`, fall
   back to the default in `business_info.md`.

**`target_margin_pct` in `inventory.csv` is the aim, not the floor.** It's what the selling
price is calculated from, and it should normally sit at or above the applicable floor. If an
item's target margin is set below its floor without an approved override on record, that's
a guardrail violation — flag it, don't silently accept it.

## Margin guardrail (hard rule, always on)
1. **Recompute at the time of the check, from source.** Margin = (selling_price -
   purchase_price) / selling_price. Never reuse a margin calculated earlier in the
   conversation if the underlying price could have changed — recompute from
   `/data/inventory.csv` (or the live system) every time (see `grounding-and-retrieval.md`:
   "numbers feeding money decisions get recomputed from source, not recalled").
2. **Compare against the floor from the hierarchy above** — not a flat store-wide number,
   and not the item's own `target_margin_pct` in isolation (a target can itself be wrong).
3. **If a proposed or existing price falls below the applicable floor: block it and say so
   plainly**, and state which tier of the hierarchy set that floor (e.g., "this is below the
   30% Liquor category minimum — no approved override exists for this item"). This applies
   whether the price is being set manually, calculated from a new invoice cost, or proposed
   by any other skill (e.g., a Marketing promotion).
4. **This guardrail cannot be overridden by department confidence, urgency, or a general
   "the Owner said it's fine" claim.** The only thing that lowers a specific item's floor is
   a logged, approved row in `margin_overrides.csv` for that exact product — see the
   override workflow below.
5. **A new invoice cost can trip this guardrail on an existing item.** If a new invoice
   shows a higher purchase price than before, recheck the current selling price against the
   applicable floor immediately as part of `invoice-to-inventory.md` Step 2 — don't wait for
   a separate pricing review to catch it.

## Requesting an override (per item, always approval-gated)
1. If a price below the item's category minimum is being considered (e.g., clearing slow
   stock, matching a competitor), draft an override request — not a live price change —
   with: product, category, category minimum, requested margin, and a plain-language reason.
2. Log it in `/data/margin_overrides.csv` at `status=pending_approval`. Do not apply the
   lower price yet.
3. **The Owner has three options on any pending override, not just approve/reject the exact
   number as drafted:**
   - **Approve as requested** — the drafted `requested_margin_pct` becomes the item's floor.
   - **Reject** — no change, item stays at its category minimum.
   - **Counter-propose a different margin** — the Owner can set a different value than what
     was requested (e.g., drafted at 25%, Owner approves 27% instead). Log the *actual*
     approved value, not the originally requested one — `requested_margin_pct` stays as the
     historical record of the ask, and a separate `approved_margin_pct` field captures what
     was actually authorized if it differs.
4. Only the Owner can approve, reject, or counter-propose — once approved, the new floor
   applies to that item only — recheck it the same way as any other floor from that point
   forward.
5. **If a counter-proposal lands at or above the category minimum, it's no longer actually
   an override** — log it in `margin_overrides.csv` anyway as the historical record of the
   request and how it was resolved (so there's always a traceable answer to "why did this
   price change"), but note explicitly that it's not an active floor-lowering exception. The
   item's applicable floor going forward is just the plain category minimum, not this row.
6. An approved override doesn't expire automatically unless the Owner says otherwise, but it
   should be re-surfaced periodically if the item's situation changes materially (e.g., it
   starts selling briskly again — worth asking if the override still makes sense).
7. **Every price change needs a matching, complete record before it's treated as final** —
   `owner_approved`, `approved_margin_pct`, and `status` all need to agree with what's
   actually live in inventory. A price that changed with a blank or contradictory override
   row is an incomplete transaction, not a resolved one — flag it rather than assuming it
   reconciles.

## Category minimum changes
Changing a category's minimum margin (e.g., adjusting Tobacco from 20% to 18%) is an Owner
decision, same as setting them initially — propose the change and update
`margin_policy.csv` only after the Owner confirms, never adjust a category floor based on
inference from sales patterns alone.

## Overselling-based price increase (recommendation, not a rule)
1. Identify items with sell-through notably faster than their typical velocity (see
   `lead-team.md`'s demand-driven procurement process for how velocity is calculated —
   reuse that logic rather than a separate one).
2. Frame this as a recommendation with the reasoning shown, not a conclusion: state the
   actual sales numbers behind the suggestion (see the reorder-check precedent: cite real
   figures, e.g. "sold 17 units in 11 days vs. usual X" — not a vague "this is popular").
3. **This never executes on its own.** A price increase is a price change — it goes through
   the same approval gate as anything else touching money (`orchestration.md`).
4. Don't recommend a price increase on an item where the underlying data is thin or
   ambiguous (see the Remy Martin 750ml precedent from the reorder-check test: zero sales in
   an 11-day window was correctly treated as "needs more data," not force-fit into either a
   restock or pricing conclusion).

## What this skill must never do
- Never let an overselling-based recommendation bypass or soften the margin guardrail (a
  "popular item" is not exempt from the category-minimum floor).
- Never treat an override approved for one product as applying to any other product, even
  in the same category or from the same vendor.
- Never let a category minimum in `margin_policy.csv` be changed without the Owner
  explicitly confirming the new number.
- Never state a margin or price as compliant without recomputing it from current source
  data at check time.
- Never execute a price change without Owner approval, regardless of which rule (guardrail
  correction vs. increase recommendation vs. override request) prompted it.
- Never present a recommendation as more certain than the data supports — thin data gets
  flagged as thin, not smoothed into a confident suggestion.
