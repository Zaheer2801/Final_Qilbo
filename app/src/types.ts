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
  category: string;
  size: string;
  qty: number;
  reorderPoint: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
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
}

export interface ExpiryRisk {
  days: number;
  vel: number;
  remainPct: number;
  tier: "Low" | "Medium" | "High";
  reason: string;
}
