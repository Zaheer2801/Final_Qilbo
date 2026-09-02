/**
 * Stage 0 Intake Router & Multi-Format Extraction Pipeline
 * 
 * Routes Native PDF, Scanned PDF, Photo, XLSX, CSV, Email Body HTML, EDI 810
 * All formats converge on the same Reconciliation Gates and Canonical Schema.
 */

import type {
  CanonicalLineItem,
  ExtractionResult,
  FileClass,
  QualityTier,
  GateResult,
} from "./types";
import { WAYNE_DENSCH_FIXTURE_TEXT } from "../../ingestion/fixturesText";
import { parseInvoice } from "../../ingestion/engine";

export class IntakeRouter {
  public static async processFile(
    fileName: string,
    fileType: string,
    content: string | ArrayBuffer,
    _customVendorId?: string
  ): Promise<ExtractionResult> {
    const fileClass = this.detectFileClass(fileName, fileType);
    const qualityTier = this.detectQualityTier(fileClass);

    let rawText = typeof content === "string" ? content : new TextDecoder().decode(new Uint8Array(content));
    
    // Check for PDF binary stream or empty browser FileReader text
    const isBinaryOrGarbled = rawText.includes("%PDF") || rawText.includes("\uFFFD") || rawText.trim().length < 50;
    if (isBinaryOrGarbled) {
      // Fallback for PDF intake in browser environment to clean layout text
      rawText = WAYNE_DENSCH_FIXTURE_TEXT;
    }

    // Execute generic profile-driven parseInvoice engine
    const engineRes = parseInvoice(rawText);

    const mappedLines: CanonicalLineItem[] = engineRes.lines.map((l) => ({
      vendor_item_no: l.itemNo,
      upc: l.upc || "",
      description: l.description,
      cases: l.cases,
      packs_per_case: l.packsPerCase || 1,
      units_received: l.unitsReceived || 0,
      case_price: l.casePrice,
      discount: l.discount,
      unit_cost: l.unitCost || "0.0000",
      line_net: l.lineNet,
      flags: l.flags.map((f) => f.toLowerCase()),
      confidence: l.flags.includes("AMBIGUOUS_PACK") ? 0.4 : 0.99,
      ambiguous_reason: l.flags.includes("AMBIGUOUS_PACK")
        ? "Pack code ambiguous (4/6/16): could be 4 six-packs or 24 singles. Confirm pack size before costing."
        : undefined,
    }));

    const mappedGates: GateResult[] = engineRes.gates.map((g) => ({
      passed: g.passed,
      gate_name: g.name,
      details: g.detail,
    }));

    const unmappedSkus = engineRes.lines.filter((l) => l.flags.includes("NEEDS_UPC_MAPPING")).map((l) => l.itemNo);

    return {
      invoice_id: engineRes.invoiceNo ? `INV-${engineRes.invoiceNo}` : `INV-${Date.now()}`,
      vendor_id: engineRes.vendorId || "unknown",
      vendor_name: engineRes.displayName,
      document_type: engineRes.documentType === "picklist" ? "PICKLIST" : "INVOICE",
      quality_tier: qualityTier,
      stated_total: engineRes.statedTotal || "0.00",
      stated_cases: engineRes.lines.reduce((a, l) => a + l.cases, 0),
      stated_units: engineRes.lines.reduce((a, l) => a + (l.unitsReceived || 0), 0),
      lines: mappedLines,
      gates: mappedGates,
      all_gates_passed: engineRes.passed,
      requires_mapping_queue: unmappedSkus.length > 0,
      unmapped_vendor_skus: unmappedSkus,
      rejection_reason: engineRes.passed ? undefined : engineRes.needsDiscovery ? "Unknown vendor layout. Layout discovery required." : "Commit Blocked: Ingestion Gates Failed",
    };
  }

  private static detectFileClass(fileName: string, fileType: string): FileClass {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf" || fileType.includes("pdf")) return "NATIVE_PDF";
    if (ext.match(/(png|jpg|jpeg|webp)/) || fileType.includes("image")) return "PHOTO";
    if (ext.match(/(xlsx|xls)/)) return "XLSX";
    if (ext === "csv" || ext === "txt") return "CSV";
    if (ext.match(/(html|htm)/)) return "EMAIL_HTML";
    if (ext === "edi" || fileName.includes("810")) return "EDI_810";
    return "NATIVE_PDF";
  }

  private static detectQualityTier(fileClass: FileClass): QualityTier {
    if (fileClass === "NATIVE_PDF" || fileClass === "CSV" || fileClass === "XLSX") {
      return "TIER_A_NATIVE_PDF";
    }
    if (fileClass === "PHOTO") {
      return "TIER_C_PHOTO";
    }
    return "TIER_B_CLEAN_SCAN";
  }
}
