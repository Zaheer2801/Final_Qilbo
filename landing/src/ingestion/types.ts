export type Flag =
  | "AMBIGUOUS_PACK"
  | "NOT_DELIVERED"
  | "CREDIT_OWED"
  | "ARITHMETIC_MISMATCH";

export interface ParsedLine {
  itemNo: string;
  upc: string;            // ALWAYS string, zero-padded to 12
  description: string;
  qtyCases: number;
  packsPerCase: number | null;   // null = could not determine, must not cost
  unitsReceived: number | null;
  casePrice: string;      // decimal strings, never JS number
  discount: string;
  lineNet: string;
  unitCost: string | null;
  notes: string[];
  flags: Flag[];
}

export interface GateResult {
  name: string;
  passed: boolean;
  detail: string;
}

export interface ParseResult {
  vendor: string;
  invoiceNo: string | null;
  lines: ParsedLine[];
  gates: GateResult[];
  passed: boolean;        // commit is allowed ONLY when true
  statedTotal: string | null;
  computedTotal: string;
  alerts: { type: string; amount: string; detail: string }[];
}
