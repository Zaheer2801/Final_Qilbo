# Business Info

> **DEMO DATA — fictional business, used to test Buddie's grounding, retrieval, and
> approval-gate behavior before real business information is connected.** See
> `/data/README.md` for how the demo dataset relates to the "live system" referenced in
> `grounding-and-retrieval.md`.

## Identity
- **Legal business name:** Tropic Spirits LLC (DEMO)
- **DBA / storefront name:** Tropic Spirits Liquor (DEMO)
- **Address:** 4210 Palmetto Ave, [Demo City], FL 33000 (DEMO)
- **Owner:** Marcus Bell (DEMO)
- **Liquor license number:** FL-LIQ-DEMO-88231
- **License expiry date:** 2027-03-31
- **EIN:** 00-0000000 (DEMO — not a real EIN)
- **Business phone (customer/vendor line):** 555-822-0000 (DEMO)
- **Business email:** orders@tropicspirits-demo.com (DEMO)

## Operating basics
- **Vertical:** Liquor retail (Phase 1). Platform: Qilbo.
- **Store hours:** Mon–Sat 10am–11pm, Sun 12pm–9pm (DEMO)
- **Number of locations:** 1 (multi-location planned, not yet active)
- **POS system in use:** NRS POS (DEMO — integration status: not yet connected; demo data
  in `/data/` stands in for POS/inventory feed for now)

## Vendor master list
> See `/data/vendors.csv` for the full structured list — this table is a quick-reference
> summary only. `/data/vendors.csv` is the source of truth even in demo mode.

| Vendor name | Account number | Contact | Category |
|---|---|---|---|
| Southern Glazer's Wine & Spirits | SGWS-44521 (DEMO) | Angela Ruiz | Primary distributor |
| Republic National Distributing | RNDC-88732 (DEMO) | Tom Hale | Secondary distributor |
| Coastal Beverage Supply | CBS-11209 (DEMO) | Priya Nair | Beer/mixers/non-alc |
| Local Ice & Party Supply | LIP-00456 (DEMO) | Danny Osei | Ice, cups, party supplies |

## Financial basics
- **Default target margin (fallback only — see `/data/margin_policy.csv` for category
  minimums, which take priority over this):** 45% (DEMO default)
- **Category minimum margins:** set per category in `/data/margin_policy.csv` (e.g., Liquor
  categories at 30%, Tobacco at 20% in this demo) — the Owner sets and changes these, not
  Buddie (see `pricing-intelligence.md`).
- **Accounting software:** QuickBooks Online (DEMO — integration status: not yet connected)

## Communication channels
- **Owner update channel:** WhatsApp (planned), Gmail (active)
- **Customer-facing phone line:** 555-822-0000 (DEMO — voice agent status: not yet built)
