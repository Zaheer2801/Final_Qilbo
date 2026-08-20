// Every claim here reflects what's actually built in the Qilbo prototype
// (app/) this session — reorder math, margin floors, expiry risk tiers,
// audit-logged quantity changes, CSV import against a real POS pricebook.
// No usage stats, client logos, or testimonials: there are no live
// customers yet, so none of that exists to show honestly.

export const toasts = [
  "Low stock flagged — Grey Goose 750ml",
  "Reorder drafted — 12 cases",
  "Margin below floor — reviewed",
  "Expiry risk — Baileys, 21 days",
  "Quantity count logged — stock take",
];

export const beforeList = [
  "Reorders by memory, or not at all",
  "Manual counts on a clipboard",
  "No idea what's about to expire",
  "Margins drift without anyone noticing",
];

export const afterList = [
  "Reorder points calculated from real sales pace",
  "Draft POs ready for one-click approval",
  "Expiry risk flagged before it's a write-off",
  "Every price checked against a margin floor",
];

export const features = [
  {
    n: "01",
    title: "Inventory that knows itself",
    body: "Import from a CSV or snap a photo. Every quantity change is logged — who changed it, when, and why — so a count is never a guess.",
  },
  {
    n: "02",
    title: "Reorder before you run out",
    body: "Reorder points are calculated from actual sell-through pace, not a fixed number someone picked once and forgot about.",
  },
  {
    n: "03",
    title: "Margins that don't drift",
    body: "Category-level minimum margins catch a price before it slips below the floor. Overrides need a reason, not just a click.",
  },
  {
    n: "04",
    title: "Expiry, caught early",
    body: "Risk tiers weigh real sell-through pace against the date on the label — a slow mover gets flagged even if it isn't close to expiring yet.",
  },
  {
    n: "05",
    title: "Demand you're not carrying",
    body: "When customers keep asking for something you don't stock, that pattern gets surfaced instead of forgotten at the register.",
  },
  {
    n: "06",
    title: "Works with the POS you have",
    body: "Built and tested against a real distributor pricebook export — not a rip-and-replace system you have to migrate onto.",
  },
];

export const workflow = [
  { n: "01", label: "Flagged", body: "A product hits its reorder point." },
  { n: "02", label: "Suggested", body: "Quantity calculated from real sales pace." },
  { n: "03", label: "Drafted", body: "A purchase order is ready for review." },
  { n: "04", label: "Approved", body: "You decide — one click, or a reject." },
  { n: "05", label: "Confirmed", body: "The vendor's response gets logged." },
  { n: "06", label: "Received", body: "Stock updates, audit trail kept." },
];

export const faqs = [
  {
    q: "Is Qilbo live yet?",
    a: "Right now Qilbo is a working prototype. The reorder math, margin guardrails, and expiry logic all run for real against data you enter — it just isn't wired up to a live POS yet.",
  },
  {
    q: "What kind of business is this for?",
    a: "Anywhere that tracks physical inventory and wants reorder and pricing discipline — liquor stores, convenience stores, small retail generally. Nothing about it is specific to one category.",
  },
  {
    q: "Does it replace my POS?",
    a: "No. Qilbo is meant to sit alongside the POS you already run, not replace it.",
  },
  {
    q: "What about WhatsApp, Gmail, and tax filing?",
    a: "Those are planned, not built yet. What's working today is the inventory, reorder, and pricing core.",
  },
];
