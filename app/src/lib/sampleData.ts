// Mirrors the same scenarios already used to test the skill set against
// Sample Data/*.csv in this repo (Hennessy/Patron/Grey Goose margins,
// Corona/Modelo/Baileys expiry, Casamigos demand pattern) — loading this in
// Settings lets you explore the ported logic against familiar numbers.
import type { Inquiry, Product, Sale } from "../types";
import { daysAgoIso } from "./businessLogic";

export const SAMPLE_PRODUCTS: Product[] = [
  { id: "P001", name: "Hennessy VS", category: "Cognac", size: "50ml", qty: 86, reorderPoint: 40, purchasePrice: 4.1, sellingPrice: 7.99, expiryDate: "" },
  { id: "P004", name: "Hennessy VS", category: "Cognac", size: "750ml", qty: 9, reorderPoint: 10, purchasePrice: 38.5, sellingPrice: 64.99, expiryDate: "" },
  { id: "P008", name: "Patron Silver", category: "Tequila", size: "50ml", qty: 64, reorderPoint: 35, purchasePrice: 4.9, sellingPrice: 9.49, expiryDate: "" },
  { id: "P010", name: "Patron Silver", category: "Tequila", size: "750ml", qty: 11, reorderPoint: 12, purchasePrice: 39.0, sellingPrice: 64.99, expiryDate: "" },
  { id: "P015", name: "Grey Goose", category: "Vodka", size: "750ml", qty: 8, reorderPoint: 10, purchasePrice: 26.0, sellingPrice: 44.99, expiryDate: "" },
  { id: "P016", name: "Baileys Irish Cream", category: "Cream Liqueur", size: "750ml", qty: 10, reorderPoint: 8, purchasePrice: 14.0, sellingPrice: 24.99, expiryDate: "2026-11-15" },
  { id: "P017", name: "Corona Extra 6-pack", category: "Beer", size: "6-pack", qty: 40, reorderPoint: 20, purchasePrice: 7.5, sellingPrice: 12.99, expiryDate: "2026-09-01" },
  { id: "P018", name: "Modelo Especial 6-pack", category: "Beer", size: "6-pack", qty: 36, reorderPoint: 20, purchasePrice: 7.8, sellingPrice: 12.99, expiryDate: "2026-09-10" },
];

export const SAMPLE_SALES: Sale[] = [
  { id: "s1", productId: "P001", qty: 14, date: daysAgoIso(3) },
  { id: "s2", productId: "P004", qty: 1, date: daysAgoIso(6) },
  { id: "s3", productId: "P008", qty: 10, date: daysAgoIso(2) },
  { id: "s4", productId: "P010", qty: 1, date: daysAgoIso(5) },
  { id: "s5", productId: "P015", qty: 1, date: daysAgoIso(9) },
  { id: "s6", productId: "P017", qty: 4, date: daysAgoIso(4) },
  { id: "s7", productId: "P018", qty: 3, date: daysAgoIso(4) },
];

export const SAMPLE_INQUIRIES: Inquiry[] = [
  { id: "i1", product: "Casamigos Reposado", date: daysAgoIso(11), carried: false },
  { id: "i2", product: "Casamigos Reposado", date: daysAgoIso(9), carried: false },
  { id: "i3", product: "Casamigos Reposado", date: daysAgoIso(7), carried: false },
  { id: "i4", product: "1800 Coconut Tequila", date: daysAgoIso(6), carried: false },
  { id: "i5", product: "1800 Coconut Tequila", date: daysAgoIso(5), carried: false },
];
