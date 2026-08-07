export interface UtilityLine {
  name: string;
  amount: string;
}

export type InvoiceMethod = "gmail" | "photo" | "other";
export type ApprovalStyle = "always" | "threshold";
export type ExpiryDefault = "always_ask" | "suggest_discount";
export type ReorderUnit = "cases" | "units" | "boxes";

/** US-only for now — nothing else in this schema (EIN format, liquor license,
 * the timezone list) supports another country yet. Split fields instead of a
 * free-text blob so the state can drive timezone lookup directly and reorder
 * summaries/reporting can group by state reliably later. */
export interface AddressFields {
  street: string;
  city: string;
  state: string; // two-letter USPS code, e.g. "FL"
  zip: string;
  country: string; // "US" — only option for now, see note above
}

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface DayHours {
  day: DayOfWeek;
  closed: boolean;
  open: string; // "HH:MM", 24h
  close: string; // "HH:MM", 24h
}

export type HolidaySchedule = "same" | "closed";

export interface BusinessConfig {
  businessName: string;
  dba: string;
  address: AddressFields;
  ownerName: string;
  ein: string;
  phone: string;
  email: string;

  vertical: string;
  licenseNumber: string;
  licenseExpiry: string;
  hours: DayHours[];
  holidaySchedule: HolidaySchedule;
  timezone: string;
  paymentMethods: string;

  taxRate: string;
  rent: string;
  utilities: UtilityLine[];

  invoiceMethods: InvoiceMethod[];
  approvalStyle: ApprovalStyle;
  approvalThreshold: string;
  reorderMultiple: string;
  reorderUnit: ReorderUnit;
  backupApprover: string;

  returnWindowDays: string;
  requireReceipt: boolean;
  requireInspection: boolean;
  expiryDefault: ExpiryDefault;

  whatsapp: string;
  gmailAddress: string;
  alertThreshold: string;

  onboardingComplete: boolean;
}

export interface MarginPolicyRow {
  category: string;
  minMarginPct: number;
}

export interface Product {
  id: string;
  name: string;
  brand?: string; // optional — distinct from `name` for CSV imports that carry both (e.g. name "VS", brand "Hennessy")
  category: string;
  size: string; // free-form — "50ml", "750ml", "6-pack", "12oz", etc.
  qty: number;
  reorderPoint: number;
  purchasePrice: number; // owner-only in principle — see InventoryTab's note on why that's just a label, not real access control, in this single-user prototype
  sellingPrice: number;
  expiryDate: string;
  vendor?: string; // who this is procured from — optional, older/manually-added products may not have one on record
  receivedDate?: string; // when the current stock actually arrived — drives "days on shelf"; optional for the same reason
  imageUrl?: string; // optional — falls back to a placeholder icon when absent, never fabricated
}

export interface Sale {
  id: string;
  productId: string;
  qty: number;
  date: string;
}

export interface Inquiry {
  id: string;
  product: string;
  date: string;
  carried: boolean;
}

export type POStatus = "draft" | "approved" | "rejected";

export interface PurchaseOrder {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unit: ReorderUnit | "units";
  unitCost: number;
  status: POStatus;
  createdDate: string;
}

export type OverrideStatus = "pending" | "approved" | "rejected";

export interface MarginOverride {
  id: string;
  productId: string;
  requestedMargin: string;
  approvedMargin: string;
  reason: string;
  status: OverrideStatus;
}

export interface AlertItem {
  id: string;
  type: "demand";
  message: string;
  date: string;
}

// Predefined reasons for a manual quantity change — multi-select, so a
// single count can be tagged e.g. "Stock take" + "Correction" at once.
export const QTY_CHANGE_REASONS = [
  "Stock take / physical count",
  "Received shipment",
  "Damaged / spoiled",
  "Theft / shrinkage",
  "Return to vendor",
  "Correction (data entry error)",
  "Other",
] as const;
export type QtyChangeReason = (typeof QTY_CHANGE_REASONS)[number];

export interface QtyLogEntry {
  id: string;
  productId: string;
  productName: string;
  previousQty: number;
  newQty: number;
  changedBy: string; // free-text — no auth/staff accounts exist in this prototype, see about_me.md
  reasons: QtyChangeReason[];
  note?: string;
  date: string;
}

export interface AppState {
  config: BusinessConfig;
  marginPolicy: MarginPolicyRow[];
  products: Product[];
  sales: Sale[];
  inquiries: Inquiry[];
  purchaseOrders: PurchaseOrder[];
  marginOverrides: MarginOverride[];
  alerts: AlertItem[];
  alertState: Record<string, number>;
  qtyLog: QtyLogEntry[];
}

export interface ExpiryRisk {
  days: number;
  vel: number;
  remainPct: number;
  tier: "Low" | "Medium" | "High";
  reason: string;
}
