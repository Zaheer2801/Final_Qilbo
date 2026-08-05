---
name: expiry-monitoring
description: "Use this skill for periodic or on-demand checks of inventory approaching its expiry/best-by date. Trigger for requests like 'what's expiring soon', 'run the expiry check', or as a scheduled daily/weekly process once wired up. Distinct from invoice-to-inventory.md's Step 3 (which handles a missing expiry date at intake) — this skill handles items that already have a known date and are approaching it."
---

# Expiry & Spoilage Monitoring — SOP

## Scope
Scans inventory for items approaching their recorded expiry/best-by date and flags them with
urgency proportional to both how soon and how much stock is at risk. Feeds
`whatsapp-alerts.md` for anything that needs the Owner's attention. Does not itself decide to
discount, pull, or discard stock — that's always an Owner call.

## Why urgency isn't just "days until expiry"
Two items 30 days from expiry aren't the same risk if one has 2 units left and the other has
40. Urgency should weigh **days remaining together with quantity on hand and recent sell-through** — a slow-moving item with lots of stock close to expiry is a bigger problem than a
fast-mover with a handful of units that'll sell well before the date arrives.

## Process
1. Pull every item with a non-blank, non-`not_applicable` `expiry_date` from
   `/data/inventory.csv` (or the live system).
2. For each, calculate days until expiry from the current date.
3. Cross-reference recent sell-through (`sales.csv`) for that product to estimate whether
   current stock will clear before the expiry date at the recent pace — don't just report a
   date, report whether it's actually likely to become a problem.
4. Bucket into urgency tiers:
   - **Low** — will very likely sell through before expiry at current pace, or expiry is far
     out relative to typical restock cycles for that category.
   - **Medium** — expiry is approaching and current pace makes full sell-through uncertain.
   - **High** — expiry is close and stock on hand clearly won't clear at current pace, or
     the item has shown zero recent sales (same "don't force a conclusion from thin data"
     caution as `pricing-intelligence.md` — flag as high urgency due to lack of movement,
     but don't invent a specific reason for the stall).
5. Only **Medium and High** should generate a WhatsApp alert (see `whatsapp-alerts.md`) —
   Low-urgency items get reported if asked, but don't need to interrupt the Owner.

## What to actually report
For each Medium/High item: product, quantity on hand, expiry date, days remaining, recent
sell-through rate, and why it's flagged (approaching date + slow movement, not just the
date alone). Do not recommend a specific action (discount, pull from shelf, return to
vendor) unless asked — flag the risk, let the Owner decide the response. This mirrors
`pricing-intelligence.md`'s separation between "here's a recommendation with reasoning" and
"here's a decision" — this skill only ever does the former.

## Interaction with other skills
- **`invoice-to-inventory.md`** handles getting the expiry date recorded correctly at
  intake (including the missing-date/vendor-follow-up workflow). This skill only runs once
  a real date already exists in the system — it doesn't chase down missing dates itself.
- **`whatsapp-alerts.md`** — Medium/High findings route through the same batching rules as
  other non-urgent signals; a genuinely High-urgency item close to expiry with heavy stock
  at risk should push promptly rather than wait for a routine batch, similar to how a
  vendor decline or complaint doesn't wait either.
- **If Owner later decides on an action** (discount an item, return it to a vendor), that
  decision and its reasoning should be logged (in `memory.md` if no dedicated action-tracking
  exists yet) so the same item isn't re-flagged identically next cycle without acknowledging
  a decision was already made.

## What this skill must never do
- Never state an item is "expiring soon" using only the date, without checking whether
  current stock will actually clear in time — a near-date item with fast turnover isn't a
  real risk.
- Never recommend discounting, pulling, or discarding stock unprompted — flag the risk,
  leave the response to the Owner.
- Never treat a past expiry-check result as still valid without re-running it — stock levels
  and sell-through change, so this isn't a one-time flag.
