/**
 * Universal Ingestion Pipeline Types
 * Strict String IDs & Fixed Decimal Money Math
 */

export type DocumentType = "INVOICE" | "PICKLIST" | "CREDIT_MEMO";

export type QualityTier = "TIER_A_NATIVE_PDF" | "TIER_B_CLEAN_SCAN" | "TIER_C_PHOTO";

export type FileClass = "NATIVE_PDF" | "SCANNED_PDF" | "PHOTO" | "XLSX" | "CSV" | "EMAIL_HTML" | "EDI_810";

export type PackSource = "description" | "units_column" | "lookup";
export type QtySemantics = "cases" | "units" | "both";

export interface VendorProfileData {
  vendor_id: string;
  vendor_name: string;
  version: number;
  fingerprint: string[]; // Header search keywords: company name, address, phone, license
  record_shape: "single_line" | "multi_line";
  line_start_regex?: string;
  continuation_fields?: string[];
  columns: {
    qty_means: QtySemantics;
    has_upc: boolean;
    pack_source: PackSource;
  };
  footer: {
    total_regex: string;
    cases_regex?: string;
    units_regex?: string;
    picklist_indicator?: string;
  };
  quirks?: string[];
}

export interface CanonicalLineItem {
  vendor_item_no: string;
  upc: string | null; // Nullable: spirits (BBG) do not print UPC
  description: string;
  cases: number;
  packs_per_case: number;
  units_received: number;
  case_price: string; // Fixed Decimal String e.g. "31.45"
  discount: string;   // Fixed Decimal String e.g. "0.00"
  unit_cost: string;  // Fixed Decimal String e.g. "5.24"
  line_net: string;   // Fixed Decimal String e.g. "188.70"
  flags: string[];    // e.g. ["breakage", "ambiguous", "provisional_cost"]
  confidence: number; // 0.0 to 1.0
  ambiguous_reason?: string;
}

export interface GateResult {
  passed: boolean;
  gate_name: string;
  details: string;
  expected?: string;
  actual?: string;
}

export interface ExtractionResult {
  invoice_id: string;
  vendor_id: string;
  vendor_name: string;
  document_type: DocumentType;
  quality_tier: QualityTier;
  stated_total: string;
  stated_cases?: number;
  stated_units?: number;
  lines: CanonicalLineItem[];
  gates: GateResult[];
  all_gates_passed: boolean;
  requires_mapping_queue: boolean;
  unmapped_vendor_skus: string[];
  rejection_reason?: string;
}

// Fixed-precision Decimal arithmetic helpers (Prevents 29.04999999 float bugs)
export function decimalAdd(a: string, b: string): string {
  const numA = Math.round(parseFloat(a || "0") * 100);
  const numB = Math.round(parseFloat(b || "0") * 100);
  return ((numA + numB) / 100).toFixed(2);
}

export function decimalSub(a: string, b: string): string {
  const numA = Math.round(parseFloat(a || "0") * 100);
  const numB = Math.round(parseFloat(b || "0") * 100);
  return ((numA - numB) / 100).toFixed(2);
}

export function decimalMul(a: string, qty: number): string {
  const numA = Math.round(parseFloat(a || "0") * 100);
  return ((numA * qty) / 100).toFixed(2);
}

export function decimalDiv(a: string, div: number): string {
  if (div <= 0) return "0.00";
  const numA = Math.round(parseFloat(a || "0") * 100);
  return ((numA / div) / 100).toFixed(2);
}

export function decimalEquals(a: string, b: string, tolerance: number = 0.01): boolean {
  const numA = parseFloat(a || "0");
  const numB = parseFloat(b || "0");
  return Math.abs(numA - numB) <= tolerance;
}
