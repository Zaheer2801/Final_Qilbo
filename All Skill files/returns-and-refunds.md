---
name: returns-and-refunds
description: "Use this skill for any defective/damaged product complaint or refund/exchange request. Trigger when Customer Voice Agent logs a type=complaint inquiry, or when directly asked about a return/refund. This is the standing policy referenced by customer-voice-agent.md's escalation step — it replaces case-by-case handling now that a policy exists."
---

# Returns & Refunds — SOP

## Scope
Defines the store's standing policy for defective or damaged product complaints, and the
process for resolving them. Since there's no separate Customer Support Team or staff (sole
operator — see `about_me.md`), physical inspection is done by the Owner in person; this
skill governs what Buddie/Customer Voice Agent should tell the customer and how the outcome
gets logged once the Owner has actually looked at the item.

## Standing policy
A refund or exchange is approved only if **all three** conditions are met:
1. **Within 7 days of the original purchase date.** Verify against a receipt or the sale
   record — don't take the customer's stated timeframe ("last week," "a few days ago") as
   confirmed; if it's ambiguous or borderline, flag it rather than assuming it's in-window.
2. **Proof of purchase presented** — a receipt or a matching sale record. No receipt, no
   automatic refund under this policy (a case without one can still be escalated to the
   Owner as a judgment call, but it's not a policy-covered approval).
3. **Item physically returned and inspected**, confirming the defect is genuine (e.g., a
   broken seal consistent with a manufacturing/shipping issue) — not consistent with the
   product having been opened, consumed, or tampered with by the customer.

If all three are met: refund or exchange, Owner's choice which. If any one fails: decline
under this policy, though the Owner can still make a one-off exception at their discretion
— that's a judgment call, not something this skill decides on its own.

## Process
1. **At the point of complaint** (via Customer Voice Agent or however it's raised): do not
   promise a refund. Tell the customer plainly: bring the item and the receipt back to the
   store within 7 days of purchase for inspection, and a decision will be made then.
2. **Log the complaint** as `type=complaint` per `customer-voice-agent.md`, including the
   product, the stated issue, and the purchase timeframe as the customer described it
   (flagged as unverified until the receipt is checked).
3. **Escalate to the Owner** via `memory.md`'s "Escalations to Owner" section — this is
   pending inspection, not resolved, until the Owner has actually seen the item.
4. **Once the Owner inspects and decides:** log the outcome plainly — approved (refund or
   exchange) or declined, and why (e.g., "seal was intact, no defect found" or "no receipt
   presented" or "outside the 7-day window"). Update the complaint's status accordingly.
5. **Never treat a decision on one complaint as setting a new blanket policy** — an
   Owner exception on a specific case doesn't change the standing policy above unless the
   Owner explicitly says so.

## What this skill must never do
- Never promise a refund or exchange before the item has actually been inspected.
- Never approve a refund based solely on the customer's account of the issue — the physical
  check is a required condition, not optional confirmation.
- Never assume a stated purchase timeframe is within the 7-day window without verification.
- Never let a one-off Owner exception silently become the new standing policy without the
  Owner confirming that change explicitly (same principle as `pricing-intelligence.md`'s
  category minimum changes).
