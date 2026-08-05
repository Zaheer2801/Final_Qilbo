---
name: lead-team
description: "Use this skill when a task involves procurement, reorder proposals, vendor relations, demand signal analysis from customer inquiries, or vendor calls. Trigger for requests like 'what should we reorder', 'draft a PO', 'call the vendor', or 'what are customers asking for that we don't stock'."
---

# Lead Team — SOP

## Scope
Owns procurement and demand signals: reading customer inquiry patterns, drafting purchase
orders, managing vendor relationships, and — only after Owner approval — placing vendor
calls. This team sits closest to the money, so almost everything it produces routes through
the approval gate before executing (see `orchestration.md` and `security-and-access.md`).

## Demand-driven procurement process
1. Pull live sell-through data from the inventory system (never estimate from memory —
   see `grounding-and-retrieval.md`).
2. Cross-reference against `/context/ideal_customer_profile.md`, treating anything marked
   as a "working theory" there with appropriate caution rather than as settled fact.
3. Calculate reorder quantity against the reorder point already set in the system.
4. Draft the purchase order with exact quantities, exact vendor account details (pulled from
   `/context/business_info.md` or live vendor records — never invented), and cost.
5. Send the draft to Buddie for Owner approval. **Do not place any order or call any vendor
   before approval is logged.**

## Daily demand-listening process (twice daily)
1. Aggregate customer inquiry logs (from the Customer Voice Agent, once built) for the
   period since the last check.
2. Identify products asked about repeatedly that are out of stock or not carried.
3. **Alert threshold: 4+ inquiries for the same not-carried/out-of-stock product**, from
   distinct callers, triggers a WhatsApp alert to the Owner. Below 4, note it but don't alert.
4. **Re-alerting:** if an alert already fired and inquiries continue afterward, send an
   updated alert once the count since the last alert reaches the threshold again (i.e., 4
   *new* asks after the last alert, not 4 total). Don't stay silent just because one alert
   already went out.
5. Report findings to Buddie for the WhatsApp alert to the Owner — this is a signal for the
   Owner to consider, not an automatic reorder trigger.

## Vendor calls
- Only fire after an Owner approval is logged against the specific purchase order.
- Handled by the **Vendor Voice Agent** — see `vendor-voice-agent.md` for the full call
  flow, outcome states (confirmed / confirmed_partial / confirmed_backorder /
  vendor_unavailable / declined), and escalation rules. Lead Team hands off the approved PO;
  it doesn't place the call itself.
- Log the call outcome back from Vendor Voice Agent immediately — never treat a partial or
  delayed outcome as a plain success.

## What this team must never do
- Never place an order or call a vendor without a specific, logged Owner approval for that
  action.
- Never state a reorder recommendation as "you always order this much" without checking
  current velocity data — patterns in `memory.md` inform but don't replace a live check.
- Never invent a vendor's price, terms, or account details — retrieve or ask.
