---
name: onboarding-flow
description: "Reference this when building or modifying Qilbo's account setup / onboarding wizard. Defines every step, what data it collects, what it writes to (business_info.md, about_me.md, offer_catalog.md, margin_policy.csv, vendors.csv, and the approval/alert settings referenced across the skill set), and the validation and confirmation rules each step must follow."
---

# Qilbo Onboarding — Specification

## Design principle
The onboarding wizard follows the same philosophy as everything else in this system:
**nothing gets saved without an explicit confirmation step**, and every step ends with a
plain-language summary of what's about to be recorded — mirroring the draft-then-approve
pattern in `orchestration.md`, `invoice-to-inventory.md`, and `pricing-intelligence.md`.
The wizard is resumable — a partially completed setup should be saveable and continuable,
not a lost session if the owner steps away.

## Known limitation to design around
**EIN alone cannot auto-populate business type, owner, or location.** There is no free,
reliable public API that does this. Do not build or promise an "auto-fill from EIN" feature.
Instead: collect these fields manually, with the EIN stored for records/compliance
purposes only. If a real business-verification (KYB) service (Middesk, Persona, etc.) is
later integrated, that's a deliberate paid-integration decision, not a default assumption.

## Step-by-step flow
*(Steps are grouped logically, not strictly sequential-numbered in the UI — a real wizard
can present Steps 4/5 as part of one "Operations" screen, and Step 10 as part of
"Customer policies," rather than 12 separate screens. The grouping below is for clarity of what data
belongs together, not a mandate on screen count.)*

### Step 1 — Account & business identity
Collects: legal business name, DBA/storefront name, address, owner's legal name, EIN,
business phone, business email.
Writes to: `business_info.md` (Identity section), `about_me.md` (Name).
Validation: EIN format check (XX-XXXXXXX) but no external verification — see limitation
above. Address should be a real, confirmable format but not auto-verified initially.

### Step 2 — Vertical selection
Collects: which vertical the business operates in (liquor retail, restaurant, hospitality,
general retail, e-commerce — per Qilbo's vertical-adapter design).
Effect: **determines every subsequent question set.** A liquor retail selection shows
liquor-specific questions (license number, categories carried, size-tracking); it must
never show restaurant/hospitality-specific questions (recipe costing, PMS integration) and
vice versa. This branching is the core reason vertical selection comes early — don't ask
irrelevant questions to a business that didn't select that vertical.
Writes to: `business_info.md` (Vertical field).

### Step 3 — Vertical-specific compliance & licensing
*(Liquor retail branch, since that's Qilbo's first vertical)*
Collects: liquor license number, license expiry date, any additional required permits.
Writes to: `business_info.md` (Identity section).
Validation: flag if expiry date is in the past or within 30 days — this matters enough to
surface immediately, not wait for a later compliance check.

### Step 4 — Operations basics
Collects:
- **Store hours**, including a **holiday schedule** (or "same as regular hours" / "closed").
  This directly prevents the gap found in testing: the Customer Voice Agent had no answer
  for "are you open on Labor Day" because this was never captured anywhere.
- **Timezone.** Needed so the twice-daily demand-listening check
  (`lead-team.md`) and expiry countdowns (`expiry-monitoring.md`) use a consistent day
  boundary — otherwise "today" can mean different things depending on where the check runs.
- **Payment methods accepted** (cash, card, other) — feeds both reporting and the returns
  process (Step 10: how a refund actually gets issued back).
Writes to: `business_info.md` (new "Operations" subsection).

### Step 5 — Tax configuration
Collects: applicable sales tax rate(s) for the jurisdiction.
Effect: needed anywhere a selling price is shown "with tax" — currently nothing in the
system has this number from anywhere. Don't guess a jurisdiction default; ask directly.
Writes to: `business_info.md` (Operations subsection).

### Step 6 — Property & overhead
Collects: monthly rent, utilities (or a combined estimate), any other recurring fixed costs
the owner wants tracked.
Effect: establishes a monthly overhead baseline — used later for expense reporting, not
tied to any per-item pricing decision (don't conflate fixed overhead with per-item margin
guardrails in `pricing-intelligence.md` — those are separate concerns).
Writes to: `business_info.md` (new "Overhead" subsection — add if not present).

### Step 7 — Invoice input method
Collects: how the owner wants to submit invoices — options: (a) forward to a monitored
Gmail address, (b) photograph/upload manually, (c) other (specify).
Effect: determines which intake path `invoice-to-inventory.md` actually uses day-to-day.
Writes to: `business_info.md` (Communication channels section).
Note: if (b) is chosen, the wizard should explain this still goes through the same
reconciliation checks in `invoice-to-inventory.md` — manual upload isn't a shortcut around
grounding/reconciliation.

### Step 8 — First invoice / initial inventory & vendor setup
Collects: the owner's first invoice (via whichever method chosen in Step 5), which seeds:
- Vendor record (name, account number, contact) → `vendors.csv`
- Initial inventory line items (product, quantity, cost) → `inventory.csv`
Effect: this is `invoice-to-inventory.md`'s process, run for the first time, with the owner
present to confirm each field rather than it happening silently.
Confirmation required: show the parsed invoice back to the owner before anything is saved
— exactly the Step 4 "present the draft, wait for approval" rule already defined in
`invoice-to-inventory.md`.

### Step 9 — Procurement automation preferences
Collects:
- **Reorder points** — either accept a suggested default per item/category or set manually.
- **Reorder quantity/rounding rule** — e.g., "round up to the nearest full case," "order
  exactly enough to hit the reorder point," or a custom multiplier. This directly replaces
  a gap found in testing: a reorder quantity ("12 units") was *inferred* from a prior PO
  rather than stated anywhere as an actual rule — that inference should never have been
  necessary if this had been captured at setup.
- **Approval style** — does the owner want to approve every reorder individually, or set a
  dollar-amount threshold under which Buddie can draft (still not place — see
  `orchestration.md`) without asking each time? **Default should be "approve everything" —
  a lower-friction option is opt-in, never the default**, consistent with the approval-gate
  principle already established.
- **Backup approver (optional)** — if the Owner is unreachable for a period, is there a
  second person authorized to approve reorders/price changes, or should everything simply
  wait? If a backup is named, capture how they're contacted and confirm this doesn't weaken
  the approval-gate principle — it names who the approval comes from, not whether one is
  required.
- **Category minimum margins** — see `pricing-intelligence.md`; this is where
  `margin_policy.csv` gets its initial values (e.g., Liquor at 30%, Tobacco at 20%, or
  whatever the owner sets).
Writes to: `margin_policy.csv`, and new "Approval preferences" / "Reorder rules" /
"Backup approver" fields in `business_info.md` or `memory.md` (Owner preferences section).
Explanation required before the approval-style toggle: plainly explain what auto-drafting
does and doesn't mean (still never places an order or calls a vendor without approval)
before the owner opts into anything beyond the default.

### Step 10 — Returns, refunds & expiry response defaults
Collects:
- **Return/refund policy** — return window (days), whether proof of purchase is required,
  whether physical inspection is required before approval. This directly replaces a gap
  found in testing: this exact policy (7 days, receipt required, inspection required) was
  decided ad hoc mid-conversation rather than captured at setup — every business using
  Qilbo should set this once, here, not reinvent it the first time a complaint comes in.
  See `returns-and-refunds.md` for how this policy gets enforced once set.
- **Expiry response default** — when `expiry-monitoring.md` flags an item as Medium/High
  risk, does the owner want to always be asked case-by-case (default), or set a standing
  preference (e.g., "auto-suggest a discount," "always hold for my review")? Default to
  "always ask" — same opt-in-only principle as the approval style above.
Writes to: `memory.md` (new "Returns/refund policy" and "Expiry response preference"
entries — same location these ended up in during testing, just captured proactively now).

### Step 11 — Alerting preferences
Collects:
- WhatsApp number for Owner updates.
- **Demand-listening alert threshold** — replace the hardcoded "4+ asks" default from
  `lead-team.md` with an owner-chosen number, defaulting to 4 if they have no preference.
- Which categories of alert should push immediately vs. batch (see `whatsapp-alerts.md`'s
  push-vs-batch criteria) — most of this is fixed logic (complaints/declines always push
  immediately), but the demand-alert threshold itself should be owner-configurable here.
Writes to: `memory.md` (Alert thresholds section, replacing the hardcoded default),
`business_info.md` (Communication channels).

### Step 12 — Review & confirm
Shows a full summary of everything collected across Steps 1–11, grouped plainly (not as raw
field dumps), with an explicit "confirm and finish setup" action. Nothing from any step is
considered final/live until this confirmation — a step completed but not yet reached at
Step 12 should still be editable if the owner goes back.

## Cross-cutting rules for the whole flow
- **Resumable.** If the owner exits mid-flow, progress should be saved and resumed at the
  same step, not restarted.
- **Editable.** Any earlier step should be revisitable and changeable before final
  confirmation, and ideally after (as a "settings" area later, though that's a v2 concern).
- **No silent defaults presented as the owner's choice.** If a field is pre-filled with a
  suggested value (a reorder point, a margin), it must be visually distinguished from an
  owner-entered value and require explicit confirmation, not just inherited silently.
- **Ties into existing skills, doesn't duplicate them.** This wizard is what *populates*
  `business_info.md`, `margin_policy.csv`, `vendors.csv`, etc. for the first time — it
  doesn't redefine the rules those files/skills already establish (e.g., it doesn't
  reinvent the margin guardrail logic, it just sets the initial category values that
  `pricing-intelligence.md` already knows how to enforce).

## What this spec deliberately leaves open (v2+ concerns)
- Multi-location setup (Qilbo's multi-location support is a later feature — this spec
  assumes single-location onboarding).
- Staff/RBAC setup during onboarding (sole-operator assumption per current `about_me.md` —
  add if/when staff accounts become relevant).
- Automatic business verification via a paid KYB service (see limitation above).
