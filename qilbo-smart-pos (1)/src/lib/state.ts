import type { AppState, BusinessConfig, MarginPolicyRow } from "../types";
import { defaultHours } from "./formOptions";

export const defaultConfig: BusinessConfig = {
  businessName: "",
  dba: "",
  address: { street: "", city: "", state: "", zip: "", country: "US" },
  ownerName: "",
  ein: "",
  phone: "",
  email: "",

  vertical: "Liquor retail",
  licenseNumber: "",
  licenseExpiry: "",
  hours: defaultHours(),
  holidaySchedule: "same",
  timezone: "America/New_York",
  paymentMethods: "Cash, Card",

  taxRate: "7",
  rent: "",
  utilities: [
    { name: "Electric", amount: "" },
    { name: "Water", amount: "" },
  ],

  invoiceMethods: ["gmail"],
  approvalStyle: "always",
  approvalThreshold: "200",
  reorderMultiple: "12",
  reorderUnit: "cases",
  backupApprover: "",

  returnWindowDays: "7",
  requireReceipt: true,
  requireInspection: true,
  expiryDefault: "always_ask",

  whatsapp: "",
  gmailAddress: "",
  alertThreshold: "4",

  onboardingComplete: false,
};

export const defaultMarginPolicy: MarginPolicyRow[] = [
  { category: "Cognac", minMarginPct: 30 },
  { category: "Tequila", minMarginPct: 30 },
  { category: "Vodka", minMarginPct: 30 },
  { category: "Beer", minMarginPct: 30 },
  { category: "Tobacco", minMarginPct: 20 },
];

export function emptyState(): AppState {
  return {
    config: {
      ...defaultConfig,
      address: { ...defaultConfig.address },
      hours: defaultConfig.hours.map((h) => ({ ...h })),
      utilities: defaultConfig.utilities.map((u) => ({ ...u })),
    },
    marginPolicy: defaultMarginPolicy.map((m) => ({ ...m })),
    products: [],
    sales: [],
    inquiries: [],
    purchaseOrders: [],
    marginOverrides: [],
    alerts: [],
    alertState: {},
    qtyLog: [],
  };
}
