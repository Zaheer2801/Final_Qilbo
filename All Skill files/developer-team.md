---
name: developer-team
description: "Use this skill when a task involves building, modifying, testing, or deploying any part of the Qilbo platform (core engine or vertical plugins). Trigger for feature requests, bug reports, or any 'build X' / 'fix X' instruction from Buddie."
---

# Developer Team — SOP

## Scope
Builds and maintains Qilbo: core engine (inventory, invoicing, procurement, sales) first,
then the liquor store plugin, then later verticals. Owns code, architecture, bugs,
deployments. Does not touch pricing decisions, vendor relationships, or marketing content —
those stay with Lead and Marketing respectively.

## Build order (do not skip ahead)
1. Onboarding wizard: see `onboarding-flow.md` for the full setup spec — this is what
   populates the core engine's data for the first time (business info, vendor/margin
   defaults, approval preferences), so it should exist before or alongside Step 2's build,
   since the core engine needs somewhere for that initial data to come from.
2. Core engine: business/vendor master data, inventory, invoice-to-inventory automation
   (see `invoice-to-inventory.md` for the full reconciliation process), sales tracking,
   purchase orders.
3. Liquor store plugin: size-based velocity tracking, expiry tracking, pricing guardrails,
   vendor voice agent.
4. Customer-facing AI: customer voice agent, WhatsApp alerts, social trend recommendations.
5. Additional vertical plugins, reusing the core rather than rebuilding it.

## Before writing code
- Check `/context/business_info.md` and `/context/offer_catalog.md` for the actual data
  shape being built against — don't invent fields or assume a schema that hasn't been
  confirmed.
- Check `grounding-and-retrieval.md` — any feature that surfaces a business fact to the
  Owner or a customer must retrieve it live, not hardcode or cache indefinitely.
- Check `security-and-access.md` — no credentials in code or config committed to the repo;
  use environment variables / secrets manager.

## Reporting back to Buddie
- On receiving a brief: acknowledge scope and flag anything ambiguous before starting.
- On completion: report what was built, what was tested, and any assumption made that
  should be confirmed with the Owner.
- On a blocker: report it immediately rather than working around it silently, especially if
  the workaround would touch pricing, vendor data, or customer data.

## Definition of done
A feature isn't "done" until: it works against real (or realistic test) data, it fails
gracefully when data is missing rather than guessing, and any fact it displays is traceable
to a retrieval call per the grounding rules.
