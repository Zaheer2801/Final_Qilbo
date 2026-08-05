---
name: invoice-to-inventory
description: "Use this skill whenever a vendor invoice needs to be processed — reviewing a new invoice, drafting the inventory update it implies, or reconciling an invoice against current stock. Trigger for requests like 'process this invoice', 'what's in our pending invoices', or any task touching invoice line items, batch/lot numbers, or expiry dates. This is Developer Team's/Lead Team's shared process for turning a vendor invoice into a trustworthy inventory change — nothing here posts automatically."
---

# Invoice-to-Inventory Automation — SOP

## Scope
Defines how an incoming vendor invoice becomes a reviewed, reconciled, approved inventory
update. Covers reading the invoice, matching it against existing inventory records, catching
inconsistencies before they become silent errors, and handling the specific case of missing
expiry dates. Nothing in this process posts to live inventory without Owner approval.

## Step 1 — Retrieve, don't assume
Pull the invoice and its line items from the actual source (Gmail, or `/data/invoices.csv` +
`/data/invoice_line_items.csv` in demo phase). If an invoice has a total but no line-item
detail available, say so explicitly rather than inferring what the line items probably were
— see the INV-3003/INV-3004 case, where the total couldn't be vetted without line items and
that gap was reported plainly instead of papering over it.

## Step 2 — Reconcile before presenting a draft
Before treating an invoice as ready to post, check it against related records, not just
itself in isolation:
- **Quantity reconciliation:** does invoiced quantity + prior stock - recorded sales match
  current on-hand? If not, the gap gets reported, not silently absorbed into a bigger or
  smaller stock number. (See the Baileys case: 12 invoiced, 10 on hand, 0 sold — a 2-unit
  gap that had no source explaining it, correctly left open rather than "corrected" to make
  the numbers match.)
- **Cross-reference expiry data.** If `inventory.csv` (or the live system) already shows an
  expiry date for a batch, check it against what the invoice actually says. If the two
  don't agree — or if inventory cites the invoice as the source for a date the invoice
  doesn't contain — that's a contradiction, not a resolved field. Flag it and do not treat
  the existing date as confirmed until verified.
- **Arithmetic check.** If unit cost × quantity doesn't match the invoice total, flag the
  mismatch rather than assuming tax, shipping, or a typo without saying which you suspect.
- **Margin recheck.** If a new invoice shows a different purchase price than before, recheck
  the current selling price against the new cost immediately — see `pricing-intelligence.md`
  for the full guardrail logic. Don't let a cost change silently erode margin unnoticed.

## Step 3 — Handle missing expiry dates
1. Check if the invoice itself states an expiry/best-by date for the relevant line item.
2. If not: draft a follow-up request to the vendor (see `vendor-voice-agent.md` for how
   it's sent) — reference the specific invoice, product, batch/lot number, and quantity
   exactly. Do not bundle unrelated issues (like a quantity discrepancy) into the same
   follow-up unless the Owner explicitly approves combining them — keep the vendor's ask
   single-purpose.
3. If neither the invoice nor a vendor follow-up resolves it: fall back to manual entry by
   the Owner/employee, per Qilbo's original expiry-tracking design.
4. Never display or act on an unconfirmed expiry date as if it were settled.
5. Once a real expiry date is recorded (from any of the above sources), ongoing monitoring
   of that date as it approaches is `expiry-monitoring.md`'s job, not this one's — this step
   only covers getting the date captured correctly at intake.

## Step 4 — Present the draft, wait for approval
- Summarize what the invoice implies for inventory: products, quantities, costs, and any
  flags raised in Steps 2–3.
- Nothing posts to live inventory until the Owner approves the draft — this mirrors the
  approval gate for money-touching actions generally (`orchestration.md`), even though
  posting an already-paid invoice isn't itself a new spend — the review step exists to catch
  data errors before they become the system's source of truth.

## Step 5 — Track discrepancies that can't be resolved yet
If a reconciliation gap has no resolution path (no breakage/spoilage log exists yet, no one
has manually checked the shelf), log it in `/context/memory.md` under "Open discrepancies"
— dated, with the specific numbers and what's missing — rather than losing it or forcing a
fake resolution. See the Baileys 2-unit gap as the template case.

## What this process must never do
- Never post an invoice's implied inventory change without Owner approval.
- Never resolve a quantity or expiry contradiction by picking whichever number "looks more
  complete" — flag the contradiction instead.
- Never bundle multiple vendor asks into one follow-up without explicit Owner approval to
  do so.
- Never fabricate a vendor's expected response to a follow-up that hasn't been answered yet.
