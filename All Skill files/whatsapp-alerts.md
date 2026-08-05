---
name: whatsapp-alerts
description: "Use this skill whenever Buddie needs to notify the Owner outside of an active conversation — a demand-listening alert, a low-stock flag, a vendor call outcome, an escalated complaint. Defines message format, batching, and deduplication so the Owner gets signal, not noise. This is Buddie's channel alone — no department agent sends to it directly (see security-and-access.md)."
---

# WhatsApp Alerts — SOP

## Scope
Defines how and when Buddie pushes a message to the Owner outside of an active chat session.
This is the mechanism behind things already defined elsewhere — the demand-listening alert
threshold (`lead-team.md`), an escalated complaint (`customer-voice-agent.md`), a vendor
call outcome that needs attention (`vendor-voice-agent.md`) — this file is what actually
turns "alert the Owner" into a real, well-formed message instead of a vague instruction.

## What warrants a WhatsApp push (vs. waiting for the Owner to check in)
Push immediately for:
- A demand-listening alert that's crossed its threshold (`lead-team.md`: 4+ new asks).
- A complaint or escalation logged by Customer Voice Agent.
- A vendor call outcome that changes the picture materially — a decline, an unexpected
  backorder that leaves an item with zero cushion, anything flagged as needing a decision.
- Anything a department agent's SOP explicitly says should alert the Owner.

Do NOT push for:
- Routine confirmations that don't need action (a vendor call that went exactly as
  expected, a routine sale).
- Anything already covered by an existing unresolved alert (see deduplication below).
- Internal task chatter between departments — see `orchestration.md`'s reporting cadence;
  WhatsApp is for things that need the Owner specifically, not a log of Buddie's day.

## Message format
Keep every message short, plain, and scannable on a phone screen — bullets over prose,
consistent with the Owner's stated preference (see `brand_voice.md`):

```
[Qilbo] <one-line what happened>
- <key detail 1>
- <key detail 2>
<what, if anything, needs your decision>
```

Example (demand alert):
```
[Qilbo] Casamigos Reposado asked about 4 more times since your last alert.
- Not currently carried
- 4 distinct callers since 07/29
Worth stocking? Reply to discuss, or I'll keep tracking.
```

Example (vendor call outcome):
```
[Qilbo] Patron Silver 750ml order — backordered
- Republic National confirmed, 5-day delay (expected 08/10)
- Stock stays below reorder point until then, no cushion
No action needed unless you want to source elsewhere.
```

## Deduplication and batching
- **Demand-listening alerts:** governed by `lead-team.md`'s threshold rule — a repeat alert
  only fires once the new-ask count since the last alert crosses the threshold again (4+),
  not on every subsequent ask. Don't re-alert on ask #5 if the threshold was already reset
  at ask #4.
- **Twice-daily batching for non-urgent signals:** demand-listening runs twice a day per
  `lead-team.md` — batch what it finds into one message per run rather than one message per
  inquiry. Urgent items (a declined vendor order, a complaint) push immediately, don't wait
  for the batch.
- **Never send two messages for the same underlying event.** If a situation updates (e.g.,
  a "pending" vendor call becomes "confirmed"), that's an update to the same thread, not a
  new separate alert.

## What this SOP must never do
- Never invent urgency to justify a push that doesn't meet the criteria above.
- Never let a department agent bypass Buddie and push directly (see `security-and-access.md`
  — this channel belongs to Buddie alone).
- Never batch something time-sensitive (a declined order, a complaint) just to keep to a
  batching schedule — those go out immediately.
- Never send a message implying an action was taken (an order placed, a call made) unless
  it actually was — mirrors the grounding rule against overclaiming completed actions.
