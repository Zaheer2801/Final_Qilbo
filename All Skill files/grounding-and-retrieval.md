---
name: grounding-and-retrieval
description: "Use this skill whenever Buddie or any department agent is about to state a business fact — inventory levels, prices, vendor details, order history, customer data, dates, or any figure that has a definitive answer somewhere in the system. Defines how retrieval works (the RAG layer) and the hard rule that no fact-based statement goes out ungrounded. Trigger this before answering any question phrased like 'do we have...', 'how much is...', 'when did...', 'what's our...', or before drafting any document that includes numbers or identifiers."
---

# Grounding & Retrieval (RAG Layer)

## Why this exists
An agent that sounds confident but is wrong is more dangerous than one that says "I don't
know." This skill exists so Buddie never fills a gap with a plausible-sounding guess when a
real answer is retrievable — or, if genuinely not retrievable, says so instead of guessing.

## The retrieval hierarchy
When a task needs a fact, check sources in this order and stop at the first one that has it:

1. **Live system of record** — the Qilbo database (inventory, sales, purchase orders,
   invoices). This is the source of truth for anything that changes (stock levels, prices,
   order status). Always preferred over any static file.
2. **Connected integrations** — Gmail (invoices, vendor correspondence), WhatsApp (Owner
   communication history), POS (if connected). Used for anything that lives in a message or
   document rather than a structured table.
3. **`/context/` files** — for background/reference facts that don't change often (business
   identity, vendor master list, customer profile). Never used for anything that could be
   stale (current stock, current price) — those always go to the live system.
4. **`/context/memory.md`** — for learned patterns and preferences, always treated as a
   *pattern*, not a current fact, and re-verified against live data if the pattern feeds a
   decision involving money.

If none of these sources has the answer: **Buddie says so explicitly** and either asks the
Owner or flags the gap in its response. It does not proceed as if the fact were known.

## Practical implementation notes (for whoever wires this up in code)
- Structured business data (inventory, sales, orders, invoices) should live in a proper
  database, not markdown — markdown context files are for background knowledge, not
  transactional data. Querying the database is not optional for these facts.
- For semantic search over unstructured sources (past emails, call transcripts, vendor
  correspondence), a vector index (embeddings + similarity search) is appropriate — but the
  retrieved chunks must be surfaced with enough source metadata (date, sender, doc) that
  Buddie can cite where the answer came from.
- Retrieval results should be re-fetched at answer time, not cached indefinitely — especially
  for anything price- or stock-related. Cache invalidation matters more than cache hit rate
  here.
- Every generated answer that includes a specific number, name, date, or identifier should
  be traceable back to a retrieval call in that same turn. If it isn't, treat that as a bug,
  not a stylistic choice.

## Self-check before responding
Before sending any answer that includes a specific fact, Buddie should silently verify:
- Did I retrieve this, or am I recalling it from general knowledge / a earlier guess?
- Is this the kind of fact that could have changed since I last saw it?
- If I'm not sure, have I said so instead of stating it as fact?
- Am I citing the source clearly enough that the Owner (or a department agent reading this)
  could verify it themselves?

## What "good" looks like
> Owner: "Do we have Hennessy 200ml in stock?"
> Buddie: *[queries live inventory]* "Yes — 14 units in stock as of the last sync, 3 minutes
> ago."

> Owner: "What's Southern Glazer's account number?"
> Buddie: *[checks business_info.md]* "It's not filled in yet in the vendor master — want me
> to pull it from a past invoice in Gmail, or do you have it handy?"

Never: *"I believe it's around 12–15 units"* or *"I think the account number starts with..."*
