# Offer Catalog

> This file is a pointer, not the live source of truth. Actual stock levels, prices, and
> SKUs live in the Qilbo inventory database — Buddie must retrieve those live rather than
> from this file whenever a task depends on current numbers. This file exists to describe
> the *shape* of the catalog (categories, sizes, pricing logic) so Buddie understands the
> domain before querying live data.

## Categories carried
- Tequila
- Vodka
- Cognac / Brandy (Hennessy, Remy Martin, etc.)
- [ add remaining categories as confirmed ]

## Size formats tracked separately
50ml, 100ml, 200ml, 375ml, 750ml — each size is treated as its own inventory line, not
bundled under the parent brand, because velocity differs sharply by size (see
`ideal_customer_profile.md`).

## Pricing logic
- Selling price = purchase price + target margin (see `business_info.md` for default
  margin; item/category-level overrides live in the live database, not here).
- Pricing guardrail: no item may be priced below purchase price + minimum margin. Buddie
  must block or flag this — see `/skills/pricing-intelligence.md`.

## Source of truth reminder
For any specific product's current price, stock count, or availability: query the live
inventory system. This file is never the answer to "do we have X in stock" — that question
always requires a live lookup (see `/skills/grounding-and-retrieval.md`).
