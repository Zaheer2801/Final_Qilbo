import { Wine, Flame, ShoppingCart, ShoppingBag } from "lucide-react";

export const WEIGHT_TYPES = [
  { id: "fixed", label: "Fixed (each)" },
  { id: "per_lb", label: "Per pound ($/lb)" },
  { id: "per_kg", label: "Per kilogram ($/kg)" },
  { id: "per_oz", label: "Per ounce ($/oz)" },
];

export function unitLabel(weightType) {
  return { per_lb: "lb", per_kg: "kg", per_oz: "oz" }[weightType] || "ea";
}

export const CATEGORY_TYPES = {
  liquor: {
    id: "liquor",
    label: "Liquor",
    icon: Wine,
    ageRestricted: true,
    idScan: false,
    ebt: false,
    margin: { green: 30, yellow: 20 },
    subcategories: ["Spirits", "Beer", "Wine", "Liqueur", "Cider", "Seltzer", "Coolers", "Mixers", "Other"],
    taxBuckets: [
      { key: "spirits", label: "Spirits" },
      { key: "beer_wine", label: "Beer/Wine" },
      { key: "mixers", label: "Mixers" },
    ],
    bucketMap: { spirits: "spirits", liqueur: "spirits", cider: "spirits", seltzer: "beer_wine", coolers: "beer_wine", beer: "beer_wine", wine: "beer_wine", mixers: "mixers", other: "mixers" },
    taxFields: [
      { key: "spirits_tax", label: "Spirits tax" },
      { key: "beer_wine_tax", label: "Beer/Wine tax" },
      { key: "mixers_tax", label: "Mixers tax" },
    ],
  },
  tobacco: {
    id: "tobacco",
    label: "Tobacco/Vaping",
    icon: Flame,
    ageRestricted: true,
    idScan: true,
    ebt: false,
    margin: { green: 40, yellow: 25 },
    subcategories: ["Cigars", "Cigarettes", "Chewing Tobacco", "Vaping", "Pipes", "Accessories", "CBD Products", "Rolling Supplies", "Other"],
    taxBuckets: [
      { key: "cigarettes", label: "Cigarettes" },
      { key: "cigars", label: "Cigars" },
      { key: "vaping", label: "Vaping" },
      { key: "other_tobacco", label: "Other Tobacco" },
    ],
    bucketMap: { cigarettes: "cigarettes", cigars: "cigars", "chewing tobacco": "other_tobacco", vaping: "vaping", pipes: "other_tobacco", accessories: "other_tobacco", "cbd products": "other_tobacco", "rolling supplies": "other_tobacco", other: "other_tobacco" },
    taxFields: [
      { key: "cigarettes_tax", label: "Cigarettes tax" },
      { key: "cigars_tax", label: "Cigars tax" },
      { key: "vaping_tax", label: "Vaping tax" },
      { key: "other_tobacco_tax", label: "Other tobacco tax" },
    ],
  },
  grocery: {
    id: "grocery",
    label: "Grocery",
    icon: ShoppingCart,
    ageRestricted: false,
    idScan: false,
    ebt: true,
    margin: { green: 30, yellow: 20 },
    subcategories: ["Produce", "Dairy", "Meat", "Bakery", "Dry Goods", "Frozen", "Beverages", "Snacks", "Other"],
    taxBuckets: [
      { key: "grocery_produce", label: "Produce" },
      { key: "grocery_meat", label: "Meat" },
      { key: "grocery_bakery", label: "Bakery" },
      { key: "grocery", label: "Other Grocery" },
    ],
    bucketMap: { produce: "grocery_produce", meat: "grocery_meat", bakery: "grocery_bakery", dairy: "grocery", "dry goods": "grocery", frozen: "grocery", beverages: "grocery", snacks: "grocery", other: "grocery" },
    taxFields: [
      { key: "produce_tax", label: "Produce tax" },
      { key: "meat_tax", label: "Meat tax" },
      { key: "bakery_tax", label: "Bakery tax" },
      { key: "grocery_tax", label: "Other grocery tax" },
    ],
  },
  retail: {
    id: "retail",
    label: "Other Retail",
    icon: ShoppingBag,
    ageRestricted: false,
    idScan: false,
    ebt: false,
    margin: { green: 40, yellow: 25 },
    subcategories: ["Clothing", "Accessories", "Home", "Electronics", "General", "Other"],
    taxBuckets: [{ key: "retail", label: "Retail" }],
    bucketMap: {},
    taxFields: [{ key: "retail_tax", label: "Retail sales tax" }],
  },
};

export const CATEGORY_LIST = Object.values(CATEGORY_TYPES);

export function getCategoryType(id) {
  return CATEGORY_TYPES[id] || CATEGORY_TYPES.retail;
}

export function bucketForProduct(product) {
  const ct = getCategoryType(product?.category_type);
  if (ct.taxBuckets.length === 1) return ct.taxBuckets[0].key;
  const sub = (product?.category || "").toLowerCase();
  return ct.bucketMap[sub] || ct.taxBuckets[0].key;
}

const RATE_FIELD = {
  spirits: "spirits_tax", beer_wine: "beer_wine_tax", mixers: "mixers_tax",
  cigarettes: "cigarettes_tax", cigars: "cigars_tax", vaping: "vaping_tax", other_tobacco: "other_tobacco_tax",
  grocery_produce: "produce_tax", grocery_meat: "meat_tax", grocery_bakery: "bakery_tax", grocery: "grocery_tax",
  retail: "retail_tax",
};

export function rateForProduct(product, settings) {
  const bucket = bucketForProduct(product);
  const s = settings || {};
  return Number(s[RATE_FIELD[bucket]] ?? s.local_tax_rate ?? 0.08);
}

export function bucketLabel(bucket) {
  for (const ct of Object.values(CATEGORY_TYPES)) {
    const b = ct.taxBuckets.find((x) => x.key === bucket);
    if (b) return b.label;
  }
  return bucket ? bucket.charAt(0).toUpperCase() + bucket.slice(1) : "";
}

export function defaultSettings() {
  return {
    state: "",
    local_tax_rate: 0.08,
    spirits_tax: 0.08, beer_wine_tax: 0.08, mixers_tax: 0.08,
    cigarettes_tax: 0.08, cigars_tax: 0.08, vaping_tax: 0.08, other_tobacco_tax: 0.08,
    produce_tax: 0.08, meat_tax: 0.08, bakery_tax: 0.08, grocery_tax: 0.08, retail_tax: 0.08,
  };
}

export function dealLineTotal(item) {
  const deal = item.deal;
  const base = (item.price || 0) * (item.qty || 0);
  if (!deal || !deal.type || deal.type === "none") return { lineTotal: base, savings: 0 };
  if (deal.type === "x_for_y" && deal.n && deal.price) {
    const sets = Math.floor((item.qty || 0) / Number(deal.n));
    const remainder = (item.qty || 0) % Number(deal.n);
    const lineTotal = sets * Number(deal.price) + remainder * (item.price || 0);
    return { lineTotal, savings: Math.max(0, base - lineTotal) };
  }
  if (deal.type === "bogo") {
    const charged = Math.ceil((item.qty || 0) / 2);
    const lineTotal = charged * (item.price || 0);
    return { lineTotal, savings: Math.max(0, base - lineTotal) };
  }
  return { lineTotal: base, savings: 0 };
}

export const CATEGORY_COLORS = {
  liquor: { gradient: "from-amber-400 to-orange-500", soft: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", ring: "ring-amber-200", hex: "#f59e0b" },
  tobacco: { gradient: "from-rose-400 to-pink-500", soft: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", ring: "ring-rose-200", hex: "#f43f5e" },
  grocery: { gradient: "from-emerald-400 to-teal-500", soft: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", ring: "ring-emerald-200", hex: "#10b981" },
  retail: { gradient: "from-blue-400 to-indigo-500", soft: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", ring: "ring-blue-200", hex: "#3b82f6" },
};

export function categoryColor(id) {
  return CATEGORY_COLORS[id] || CATEGORY_COLORS.retail;
}