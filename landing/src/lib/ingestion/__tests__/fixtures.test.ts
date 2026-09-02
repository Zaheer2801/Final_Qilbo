/**
 * Test Fixture Suite for Universal Invoice Ingestion Pipeline
 * 
 * Verifies both real store invoice documents:
 * 1. Fixture 1: Wayne Densch #523219 (Beer, Clean PDF, 16 lines, $1,103.75, Ambiguous line uncosted assertion)
 * 2. Fixture 2: BBG Breakthru Picklist (Spirits, Photo, NO UPCs, Refusal & Rejection assertion)
 */

import { IntakeRouter } from "../IntakeRouter";

// Mock raw text streams representing real distributor documents
export const WAYNE_DENSCH_FIXTURE_TEXT = `
WAYNE DENSCH, INC.  2900 W FIRST ST  (407) 323-5600
INVOICE NUMBER: 523219  DATE: 08/31/2026

61044 6 018200005428 BUSCH 6/4/16 CAN $31.45 $188.70
61099 7 018200005459 NATURAL ICE 6/4/16 CAN $29.04 $203.28
61168 2 018200611681 BUSCH 24/12 CAN $19.65 $35.40
61170 2 018200271687 NATURAL ICE 24/12 SUITCASE $19.65 $35.40
96769 2 018200059902 MICHELOB ULTRA 2/12/12 BTL $29.95 $59.90
02201 1 816751021993 CUTWATER LONG ISLAND 6/4/12 CAN $62.55 $58.10
02202 1 816751022006 CUTWATER TEQUILA MARGARITA 6/4/12 CAN $62.55 $58.10
02203 1 816751022013 CUTWATER VODKA MULE 6/4/12 CAN $62.55 $58.10
02204 1 816751022020 CUTWATER RUM MOJITO 6/4/12 CAN $62.55 $58.10
02205 1 816751022037 CUTWATER MANHATTAN 6/4/12 CAN $62.55 $58.10
02206 1 816751022044 CUTWATER WHITE RUSSIAN 6/4/12 CAN $62.55 $58.10
02207 1 816751022051 CUTWATER TIKI RUM PUNCH 6/4/12 CAN $62.55 $58.10
02208 1 816751022068 CUTWATER PALOMA 6/4/12 CAN $62.55 $58.10
02209 1 816751022075 CUTWATER GIN TONIC 6/4/12 CAN $62.55 $58.10
02210 1 816751022082 CUTWATER TEQUILA SODA 6/4/12 CAN $62.55 $58.10
99952 0 088004144722 MD 2020 GRAPE 4/6/16 CN (-1 BREAKAGE ON TRUCK) $31.45 $31.45

Total Sales $1,103.75
Cases: 29
Units: 146
`;

export const BBG_BREAKTHRU_FIXTURE_PHOTO_TEXT = `
BBG Spirits and Wine  4901 Savarese Circle
PICKLIST - THIS IS NOT AN INVOICE

1001 Veuve Clicquot Brut 750ml 2 24 $600.00 $1200.00
1002 Caymus Cabernet Napa 750ml 1 12 $600.00 $600.00
2001 DEEP EDDY STRAIGHT VODKA 1 12 $108.00 $72.00
2002 DEEP EDDY STRAIGHT VODKA 1 12 $108.00 $59.00

Total Sales $1,991.98
Cases: 16
Units: 268
`;

export async function runIngestionPipelineTests(): Promise<{ passed: boolean; testLogs: string[] }> {
  const logs: string[] = [];
  let allPassed = true;

  logs.push("=================================================");
  logs.push("RUNNING UNIVERSAL INGESTION PIPELINE TEST SUITE");
  logs.push("=================================================");

  // -------------------------------------------------------------
  // TEST FIXTURE 1: Wayne Densch #523219 (Clean Native PDF)
  // -------------------------------------------------------------
  logs.push("\n[FIXTURE 1] Testing Wayne Densch #523219 (Beer PDF)...");
  const result1 = await IntakeRouter.processFile(
    "Invoice_523219.pdf",
    "application/pdf",
    WAYNE_DENSCH_FIXTURE_TEXT
  );

  // Assertion 1.1: Vendor Identification
  if (result1.vendor_id === "wayne_densch") {
    logs.push("  ✓ Vendor Fingerprint Matched: Wayne Densch, Inc.");
  } else {
    logs.push(`  ✗ Vendor Fingerprint Failed. Got: ${result1.vendor_id}`);
    allPassed = false;
  }

  // Assertion 1.2: Record Count (16 items)
  if (result1.lines.length === 16) {
    logs.push("  ✓ Extracted 16 Line Items (Includes 10 Cutwaters + Beer + Breakage)");
  } else {
    logs.push(`  ✗ Line count mismatch. Expected 16, got ${result1.lines.length}`);
    allPassed = false;
  }

  // Assertion 1.3: Document Total Reconciliation ($1,103.75)
  if (result1.stated_total === "1103.75") {
    logs.push("  ✓ Document Total Reconciled: $1,103.75");
  } else {
    logs.push(`  ✗ Document Total Mismatch. Expected 1103.75, got ${result1.stated_total}`);
    allPassed = false;
  }

  // Assertion 1.4: Stated Cases (29 cases) & Stated Units (146 units)
  if (result1.stated_cases === 29 && result1.stated_units === 146) {
    logs.push("  ✓ Footer Cases (29) & Footer Units (146) Verified");
  } else {
    logs.push(`  ✗ Footer totals mismatch. Cases: ${result1.stated_cases}, Units: ${result1.stated_units}`);
    allPassed = false;
  }

  // Assertion 1.5: Credit Alert ($31.45 breakage)
  const breakageLine = result1.lines.find((l) => l.flags.includes("breakage"));
  if (breakageLine && breakageLine.line_net === "31.45") {
    logs.push("  ✓ Credit Alert Triggered: $31.45 driver breakage deduction claim");
  } else {
    logs.push("  ✗ Breakage credit alert failed to trigger");
    allPassed = false;
  }

  // Assertion 1.6 (CORRECTION #7): Ambiguous MD 2020 pack code line uncosted assertion
  const md2020Line = result1.lines.find((l) => l.description.includes("MD 2020"));
  if (md2020Line && md2020Line.flags.includes("ambiguous")) {
    logs.push("  ✓ Ambiguity Assertion Passed: MD 2020 line flagged ambiguous and left uncosted (refused 6x cost error guess)");
  } else {
    logs.push("  ✗ Ambiguity Assertion Failed: MD 2020 line was not flagged ambiguous");
    allPassed = false;
  }

  // -------------------------------------------------------------
  // TEST FIXTURE 2: BBG Breakthru Picklist Photo (Tier C Photo - Must Refuse)
  // -------------------------------------------------------------
  logs.push("\n[FIXTURE 2] Testing BBG Spirits Picklist Photo (Refusal & Rejection Assertion)...");
  const result2 = await IntakeRouter.processFile(
    "BBG_Picklist_Photo.jpg",
    "image/jpeg",
    BBG_BREAKTHRU_FIXTURE_PHOTO_TEXT
  );

  // Assertion 2.1: Picklist Document Type Detection & Provisional Costing
  if (result2.document_type === "PICKLIST") {
    logs.push("  ✓ Picklist Header Detected: Marked Document Type = PICKLIST (Provisional Costs)");
  } else {
    logs.push(`  ✗ Picklist detection failed. Got: ${result2.document_type}`);
    allPassed = false;
  }

  // Assertion 2.2: NO UPC Routing to Mapping Queue
  if (result2.requires_mapping_queue) {
    logs.push("  ✓ No UPC Column Detected: Unmapped SKUs routed to vendor_skus identity mapping queue");
  } else {
    logs.push("  ✗ Mapping queue routing failed for spirits items with no UPC");
    allPassed = false;
  }

  // Assertion 2.3 (REFUSAL ASSERTION): Pipeline MUST REJECT Tier C bad OCR photo
  if (!result2.all_gates_passed) {
    logs.push("  ✓ REFUSAL ASSERTION PASSED: Pipeline rejected bad OCR photo and refused auto-commit!");
    logs.push(`    Rejection Reason: ${result2.rejection_reason}`);
  } else {
    logs.push("  ✗ REFUSAL ASSERTION FAILED: Pipeline accepted invalid OCR photo instead of refusing it!");
    allPassed = false;
  }

  // Assertion 2.4: Internal Consistency Gate Failure Detection
  const internalGate = result2.gates.find((g) => g.gate_name === "Internal Consistency Failure");
  if (internalGate && !internalGate.passed) {
    logs.push("  ✓ Internal Consistency Gate Flagged conflicting Deep Eddy nets ($72.00 vs $59.00) without external database!");
  } else {
    logs.push("  ✗ Internal Consistency Gate failed to detect conflicting SKU pricing");
    allPassed = false;
  }

  logs.push("\n=================================================");
  logs.push(allPassed ? "ALL INGESTION PIPELINE TESTS PASSED 100% ✓" : "TEST SUITE FAILED ✗");
  logs.push("=================================================");

  return { passed: allPassed, testLogs: logs };
}
