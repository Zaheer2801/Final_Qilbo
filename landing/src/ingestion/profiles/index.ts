import type { VendorProfile } from "../types";

export const wayneDensch: VendorProfile = {
  vendorId: "wayne_densch",
  displayName: "Wayne Densch, Inc.",
  fingerprint: ["WAYNE DENSCH", "2900 W FIRST ST"],
  recordShape: "multi_line",
  lineStart: /^(?<item>\d{4,6})\s+(?<cases>-?\d+)\s+(?<upc>\d{11,14})\s+(?<price>[\d,]+\.\d{2})\s+(?<disc>[\d,]+\.\d{2})\s+(?<dep>[\d,]+\.\d{2})\s+(?<net>[\d,]+\.\d{2})\s*$/,
  noteLine: /^-?\d+\s+\S.*$/,
  netField: "net",
  quantity: { means: "cases", packSource: "description" },
  hasUpc: true,
  footer: {
    total: /Total Sales\s+([\d,]+\.\d{2})/,
    cases: /Cases:\s*(\d+)/,
    invoiceNo: /Invoice#:\s*(\d+)/,
  },
  quirks: { gluedDescription: true },
  ambiguousPackCodes: ["4/6/16"],
  creditKeywords: ["BREAKAGE", "SHORT", "DAMAGE"],
  notDeliveredKeywords: ["OUT OF STOCK"],
};

export const bbgBreakthru: VendorProfile = {
  vendorId: "bbg_breakthru",
  displayName: "BBG Spirits and Wine of Florida",
  fingerprint: ["BBG Spirits", "4901 Savarese"],
  recordShape: "single_line",
  lineStart: /^(?<cases>\d+)\s+(?<units>\d+)\s+(?<item>\d{6})\s+(?<description>.+?)\s+(?<price>[\d,]+\.\d{2})\s+(?<dep>[\d,]+\.\d{2})\s+(?<net>[\d,]+\.\d{2})\s+(?<ext>[\d,]+\.\d{2})\s*$/,
  netField: "ext",
  quantity: { means: "both", packSource: "units_column" },
  hasUpc: false,                       // match on vendor item # instead
  footer: {
    total: /Total Sales\s+([\d,]+\.\d{2})/,
    cases: /Cases:\s*(\d+)/,
    units: /Units:\s*(\d+)/,
    invoiceNo: /Invoice#:\s*(\d+)/,
    docType: { pattern: /THIS IS NOT AN INVOICE/i, type: "picklist" },
  },
};

export const PROFILES: VendorProfile[] = [wayneDensch, bbgBreakthru];
