# /data/ — DEMO DATA ONLY

Everything in this folder is **fictional sample data**, built to test Buddie's grounding,
retrieval, and approval-gate behavior before any real business or vendor information is
connected. Nothing here is real — no real business, no real vendor account numbers, no real
customer phone numbers.

## How Buddie should treat this folder during the demo phase
- Treat `/data/*.csv` as the stand-in for the "live system of record" referenced in
  `/skills/grounding-and-retrieval.md`. When that skill says "query the live database,"
  during this demo phase it means: read the relevant CSV in `/data/`.
- Still apply every grounding rule exactly as if this were real — retrieve before
  answering, cite the source file/row, say "I don't know" if it's not in the data, never
  round or invent a number.
- Still apply every approval gate exactly as if this were real — this is as much a test of
  the approval-gate discipline as of the data plumbing. Nothing should execute (place an
  order, "call" a vendor, change a price) without a simulated Owner approval logged.

## Files in this folder
| File | Stands in for |
|---|---|
| `vendors.csv` | Vendor master list |
| `inventory.csv` | Current stock, by product + size |
| `sales.csv` | Sales transaction history (line items) |
| `invoices.csv` | Vendor invoices received |
| `invoice_line_items.csv` | Line-item detail for invoices (product, qty, cost, expiry, batch/lot) |
| `purchase_orders.csv` | POs drafted/sent/confirmed |
| `purchase_order_line_items.csv` | Line-item detail for purchase orders (product, qty requested, cost) |
| `customer_inquiries.csv` | Customer call log (availability/preorder asks) |
| `margin_policy.csv` | Owner-set minimum margin per category (the pricing floor) |
| `margin_overrides.csv` | Logged per-item exceptions to a category's minimum margin |

## Switching from demo to real later
When you're ready to go live: replace these CSVs with a real database connection (or import
real data into the same shape), update `/context/business_info.md` and `/context/about_me.md`
with real values, and remove this README's "demo" framing so Buddie stops treating the data
as fictional.
