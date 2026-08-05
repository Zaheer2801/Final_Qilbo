# Memory

This file is Buddie's own growing knowledge base. Unlike a hidden platform memory, this file
is fully owned and readable by the Owner. Buddie updates it; the Owner can edit or delete
anything in it at any time.

## How Buddie should use this file
- **Read** the relevant section before starting a task that touches a recurring pattern
  (e.g., before drafting a PO, check "Vendor quirks" and "Reorder preferences" below).
- **Write** a new bullet whenever the Owner corrects Buddie, states a preference, or a
  pattern repeats for the third time. Bullet summaries only — not paragraphs.
- **Never treat memory entries as facts to state confidently to the Owner without
  re-verification if the underlying data could have changed** (e.g., "you usually reorder
  tequila every 2 weeks" is a pattern note, not a guarantee the same applies this month —
  check live velocity data before acting on it).
- **Superseded assumptions** get moved here (not deleted) when a `/context/` file is
  rewritten from better data, so the reasoning trail stays intact.

## Owner preferences (learned)
- *(empty — populate as real corrections happen, e.g., "Owner prefers WhatsApp updates
  batched once in the morning, not per-event" once observed)*

## Vendor quirks (learned)
- *(empty — e.g., "Southern Glazer's invoices sometimes omit expiry date on wine line
  items — always draft a follow-up request for those")*

## Reorder preferences (learned)
- *(empty — e.g., "Owner prefers rounding case orders up to full cases even if a few units
  over the reorder point")*

## Open discrepancies
> Data inconsistencies found that don't have a resolution path yet — kept here so they
> aren't lost, until a real fix (e.g., a breakage/spoilage log feature) exists.
- `2026-08-05` — Baileys Irish Cream 750ml, batch BY-2406-A: INV-3001 invoiced 12 units,
  `inventory.csv` shows 10 on hand, zero sales recorded. 2-unit gap unexplained — no
  breakage/spoilage log exists yet to check against. Vendor follow-up drafted for expiry
  only, not yet sent — awaiting Owner approval. This quantity gap is being tracked
  internally, not raised with the vendor.
  **Resolution path decided 2026-08-05: Owner will physically recount the shelf and
  `inventory.csv` will be adjusted to match the actual count.** `inventory.csv` still shows
  10 (unchanged) until the real count comes back — do not assume 10, 12, or any other
  number is correct in the meantime. Once the Owner reports the actual count, update
  `inventory.csv` accordingly and close this entry (move it below once resolved, noting
  what the real count was and the date).
- `2026-08-05` — INV-3003 (Coastal Beverage, $398.20, Corona/Modelo restock) and INV-3004
  (Southern Glazer's, $215.60, Hennessy 50ml top-up): both `pending_review`, neither has
  line-item detail anywhere in the data. Full reconciliation per `invoice-to-inventory.md`
  is not possible until the itemized invoice is pulled from Gmail. Two specific flags:
  (1) `inventory.csv`'s Corona/Modelo expiry dates cite "invoice" as the source, but with no
  INV-3003 line items to check against, that citation is unverifiable — same pattern as the
  Baileys expiry contradiction. (2) INV-3004's total ($215.60) doesn't divide evenly by
  Hennessy 50ml's known unit cost ($4.10) — 52.58 units, not a whole number — suggesting
  either a different cost, additional items, or tax/shipping not reflected in the notes.
  Neither invoice has been posted to inventory. Not resolved until real line items exist.

## Alert thresholds (learned)
- Demand-listening alert threshold locked in: **4+ inquiries** for a not-carried/out-of-stock
  product from distinct callers triggers a WhatsApp alert. Re-alerting requires 4 *new*
  asks since the last alert, not 4 total. See `/skills/lead-team.md` for the full rule.

## Escalations to Owner
> Complaints and other items requiring the Owner's direct judgment, per
> `returns-and-refunds.md` and `customer-voice-agent.md`'s escalation rules. Stay open until
> the Owner logs a resolution.
- `2026-08-05` — INQ-9014, Grey Goose 750ml, broken seal / refund request, caller
  555-822-9945. Customer stated purchase was "last week" — **not verified**, borderline
  against the 7-day return window; must be confirmed against a receipt when the customer
  returns. **Status: pending inspection.** Customer instructed to bring the item and receipt
  back to the store within 7 days of the original purchase date for inspection, per the
  standing policy in `returns-and-refunds.md`. No refund promised or given yet. Update this
  entry once the Owner has actually inspected the item and decided.

## Returns/refund policy (learned)
- Standing policy set 2026-08-05: refund/exchange for defective or damaged product approved
  only if (1) within 7 days of purchase, verified against a receipt, (2) proof of purchase
  presented, (3) item physically inspected and confirmed as a genuine defect, not
  consumer-caused damage. See `/skills/returns-and-refunds.md` for the full process. Owner
  performs inspection personally (no separate Support Team/staff).

## Superseded assumptions
- *(empty — old working theories get moved here when replaced by confirmed data, with the
  date and what replaced them)*

## Corrections log
> When the Owner corrects Buddie on a fact or a process, log it here with a date so the
> same mistake doesn't repeat.
- *(empty)*
