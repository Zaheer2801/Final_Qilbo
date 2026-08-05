# Offer Catalog

> **DEMO DATA framing:** the categories/shape below are for this demo dataset. The live
> product list, prices, and stock always come from `/data/inventory.csv` during this demo
> phase (standing in for the future live database) — never from this file.

## Categories carried (demo dataset)
- Cognac (Hennessy, Remy Martin)
- Tequila (Patron, Don Julio)
- Vodka (Tito's, Grey Goose)
- Cream Liqueur (Baileys)
- Beer (Corona, Modelo)

## Categories asked about but NOT carried (demo — see /data/customer_inquiries.csv)
- Casamigos Reposado — asked about repeatedly, good test case for the demand-alert workflow.
- 1800 Coconut Tequila — asked about twice, below typical alert threshold.

## Size formats tracked separately
50ml, 100ml, 200ml, 375ml, 750ml, 6-pack (beer) — each size/pack is its own inventory line;
see `/data/inventory.csv` for exact per-size stock and pricing.

## Pricing logic
- Selling price = purchase price + target margin (default 45%, overridden per item — see
  `target_margin_pct` column in `/data/inventory.csv`).
- Pricing guardrail: no item may be priced below purchase price + minimum margin. Buddie
  must block or flag this — see `/skills/lead-team.md` and the pricing guardrail rule in
  `CLAUDE.md`.

## Source of truth reminder
For any specific product's current price, stock count, or availability during this demo
phase: read `/data/inventory.csv`. This file is never the answer to "do we have X in stock."
