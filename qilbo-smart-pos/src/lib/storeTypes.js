import { Wine, ShoppingCart, Store, Flame, Shirt, ShoppingBag } from "lucide-react";

const coreFeatures = [
  "Fast POS checkout",
  "Barcode scanning",
  "Inventory tracking",
  "Loyalty points (1 pt per $1)",
  "Customer profiles",
  "Sales dashboard",
  "Low-stock alerts",
];

export const storeTypes = [
  {
    id: "liquor",
    label: "Liquor Store",
    icon: Wine,
    description: "Bottles, six-packs, and age-restricted sales handled right.",
    primary: true,
    baseFeatures: coreFeatures,
    extras: ["Age verification flag", "Inventory tracking with expiry dates", "Vendor/supplier management"],
  },
  {
    id: "grocery",
    label: "Grocery Store",
    icon: ShoppingCart,
    description: "Produce, dairy, pantry, and EBT-ready checkout.",
    baseFeatures: coreFeatures,
    extras: ["Scale/weight integration", "Price by weight", "EBT/WIC eligible items", "Bulk item bundling", "Perishable alerts", "Food categories"],
  },
  {
    id: "convenience",
    label: "Convenience Store",
    icon: Store,
    description: "High-turnover, multi-brand, quick reorder.",
    baseFeatures: coreFeatures,
    extras: ["Multi-brand tracking", "Small package management", "Quick reorder templates"],
  },
  {
    id: "smoke",
    label: "Smoke Shop",
    icon: Flame,
    description: "Age-gated, high-margin, ID-ready sales.",
    baseFeatures: coreFeatures,
    extras: ["Age verification (prominent)", "ID scanning option", "High-margin tracking"],
  },
  {
    id: "clothing",
    label: "Clothing Boutique",
    icon: Shirt,
    description: "Sizes, colors, returns, and gift cards.",
    baseFeatures: coreFeatures,
    extras: ["Size/color variants", "Image preview in cart", "Returns/exchanges", "Gift cards", "Custom attributes", "Try-on tracking"],
  },
  {
    id: "other",
    label: "Other Retail",
    icon: ShoppingBag,
    description: "A flexible POS for any independent shop.",
    baseFeatures: coreFeatures,
    extras: ["Vendor/supplier management"],
  },
];

export const getStoreType = (id) => storeTypes.find((t) => t.id === id) || storeTypes[0];