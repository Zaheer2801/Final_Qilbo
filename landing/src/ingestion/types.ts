export type Flag = "AMBIGUOUS_PACK" | "NOT_DELIVERED" | "CREDIT_OWED"
                 | "ARITHMETIC_MISMATCH" | "NEEDS_UPC_MAPPING" | "PROVISIONAL_PRICE";

export interface VendorProfile {
  vendorId: string;
  displayName: string;
  fingerprint: string[];              // ALL must appear in the source text
  recordShape: "single_line" | "multi_line";
  lineStart: RegExp;                  // named groups
  noteLine?: RegExp;                  // multi_line only
  /** Which named group carries the line total used for reconciliation. */
  netField: string;                   // "net" | "ext" | ...
  quantity: {
    means: "cases" | "units" | "both";
    packSource: "description" | "units_column" | "lookup";
  };
  hasUpc: boolean;
  footer: {
    total: RegExp;                    // MANDATORY
    cases?: RegExp;
    units?: RegExp;
    invoiceNo?: RegExp;
    docType?: { pattern: RegExp; type: "picklist" | "invoice" };
  };
  quirks?: { gluedDescription?: boolean };
  ambiguousPackCodes?: string[];
  creditKeywords?: string[];
  notDeliveredKeywords?: string[];
}

export interface ParsedLine {
  itemNo: string;
  upc: string | null;
  description: string;
  cases: number;
  packsPerCase: number | null;
  unitsReceived: number | null;
  casePrice: string;
  discount: string;
  lineNet: string;
  unitCost: string | null;
  notes: string[];
  flags: Flag[];
}

export interface GateResult { name: string; passed: boolean; detail: string; }

export interface ParseResult {
  vendorId: string | null;
  displayName: string;
  documentType: "invoice" | "picklist";
  invoiceNo: string | null;
  lines: ParsedLine[];
  gates: GateResult[];
  passed: boolean;                    // commit allowed ONLY when true
  statedTotal: string | null;
  computedTotal: string;
  alerts: { type: string; amount: string; detail: string }[];
  needsDiscovery: boolean;            // true = unknown vendor
}
