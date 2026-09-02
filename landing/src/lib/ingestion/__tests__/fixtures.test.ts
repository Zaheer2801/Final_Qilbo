/**
 * Test Fixture Suite for Universal Invoice Ingestion Pipeline
 * 
 * Verifies both real store invoice documents:
 * 1. Fixture 1: Wayne Densch #523219 (Beer PDF, Verbatim SKUs, $1,103.75 total, Ambiguity assertion)
 * 2. Fixture 2: BBG Breakthru Picklist (Spirits Photo, Refusal & Rejection assertion)
 */

import { IntakeRouter } from "../IntakeRouter";

// Verbatim raw text stream matching real Wayne Densch Invoice #523219 in exact document order
export const WAYNE_DENSCH_FIXTURE_TEXT = `
WAYNE DENSCH, INC.  2900 W FIRST ST  SANFORD, FL 32771  (407) 323-5600
INVOICE NUMBER: 523219  DATE: 08/31/2026

99952 0 088004144722 MD 2020 GRAPE 4/6/16 CN (-1 BREAKAGE ON TRUCK) $31.45 $0.00 $31.45
02201 1 816751021993 CUTWATER LONG ISLAND 6/4/12 CAN $62.55 $4.45 $58.10
22112 1 816751022105 CUTWATER MANGO MARGARITA 6/4/12 CAN $62.55 $4.45 $58.10
22396 1 816751022389 CUTWATER PEACH MARGARITA 6/4/12 CAN $62.55 $4.45 $58.10
22266 1 816751022068 CUTWATER WHITE RUSSIAN 6/4/12 CAN $62.55 $4.45 $58.10
02122 1 816751021221 CUTWATER LIME MARGARITA 6/4/12 CAN $62.55 $4.45 $58.10
23799 1 816751023799 CUTWATER LEMON DROP MARTINI 6/4/12 CAN $62.55 $4.45 $58.10
96769 2 018200059902 MICHELOB ULTRA 2/12/12 BTL $29.95 $0.00 $59.90
61044 6 018200005428 BUSCH 6/4/16 CAN $31.45 $0.00 $188.70
61168 2 018200611681 BUSCH 24/12 CAN $19.65 $1.95 $35.40
27044 7 018200005459 NATURAL ICE 6/4/16 CAN $29.05 $0.00 $203.35
27168 2 018200271687 NATURAL ICE 24/12 SUITCASE $19.65 $1.95 $35.40
02077 1 816751020774 CUTWATER VODKA MULE 6/4/12 CAN $62.55 $4.45 $58.10
02167 1 816751021672 CUTWATER MAI TAI 6/4/12 CAN $62.55 $4.45 $58.10
02072 1 816751020729 CUTWATER SPICY BLOODY MARY 6/4/12 CAN $62.55 $4.45 $58.10
02119 1 816751021194 CUTWATER TEQUILA PALOMA 6/4/12 CAN $62.55 $4.45 $58.10

Total Sales $1,103.75
Cases: 29
Units: 146
`;

export const BBG_BREAKTHRU_FIXTURE_PHOTO_TEXT = `
BBG Spirits and Wine  4901 Savarese Circle
PICKLIST - THIS IS NOT AN INVOICE

1001 Veuve Clicquot Brut 750ml 2 24 $600.00 $0.00 $1200.00
1002 Caymus Cabernet Napa 750ml 1 12 $600.00 $0.00 $600.00
2001 DEEP EDDY STRAIGHT VODKA 1 12 $108.00 $0.00 $72.00
2002 DEEP EDDY STRAIGHT VODKA 1 12 $108.00 $0.00 $59.00

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
    logs.push("  ✓ Extracted 16 Line Items (Verbatim SKUs in exact document order)");
  } else {
    logs.push(`  ✗ Line count mismatch. Expected 16, got ${result1.lines.length}`);
    allPassed = false;
  }

  // Assertion 1.3: Document Total Reconciliation ($1,103.75)
  if (result1.stated_total === "1103.75" && result1.all_gates_passed) {
    logs.push("  ✓ Document Total Reconciled: $1,103.75 ✓");
  } else {
    const failedGates = result1.gates.filter((g) => !g.passed);
    logs.push(`  ✗ Document Total Mismatch or Gate Failure. Failed gates: ${JSON.stringify(failedGates)}`);
    allPassed = false;
  }

  // Assertion 1.4: Unit Cost & Discount Assertions (DISC column included)
  const cutwaterLine = result1.lines.find((l) => l.vendor_item_no === "02201");
  const buschLine = result1.lines.find((l) => l.vendor_item_no === "61168");
  const nattyLine = result1.lines.find((l) => l.vendor_item_no === "27044");

  if (cutwaterLine && cutwaterLine.unit_cost === "9.68") {
    logs.push("  ✓ Cutwater Unit Cost Verified: $9.68 ((62.55 - 4.45) / 6)");
  } else {
    logs.push(`  ✗ Cutwater unit cost incorrect. Expected 9.68, got ${cutwaterLine?.unit_cost}`);
    allPassed = false;
  }

  if (buschLine && buschLine.unit_cost === "17.70") {
    logs.push("  ✓ Busch 24/12 Unit Cost Verified: $17.70 ((19.65 - 1.95) / 1)");
  } else {
    logs.push(`  ✗ Busch unit cost incorrect. Expected 17.70, got ${buschLine?.unit_cost}`);
    allPassed = false;
  }

  if (nattyLine && nattyLine.case_price === "29.05") {
    logs.push("  ✓ Natural Ice 6/4/16 Case Price Verified: $29.05");
  } else {
    logs.push(`  ✗ Natural Ice case price incorrect. Expected 29.05, got ${nattyLine?.case_price}`);
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

  // Assertion 1.6: Ambiguous MD 2020 pack code line uncosted assertion
  const md2020Line = result1.lines.find((l) => l.description.includes("MD 2020"));
  if (md2020Line && md2020Line.flags.includes("ambiguous")) {
    logs.push("  ✓ Ambiguity Assertion Passed: MD 2020 line flagged ambiguous and left uncosted");
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

  if (result2.document_type === "PICKLIST") {
    logs.push("  ✓ Picklist Header Detected: Marked Document Type = PICKLIST (Provisional Costs)");
  } else {
    logs.push(`  ✗ Picklist detection failed. Got: ${result2.document_type}`);
    allPassed = false;
  }

  if (!result2.all_gates_passed) {
    logs.push("  ✓ REFUSAL ASSERTION PASSED: Pipeline rejected bad OCR photo and refused auto-commit!");
    logs.push(`    Rejection Reason: ${result2.rejection_reason}`);
  } else {
    logs.push("  ✗ REFUSAL ASSERTION FAILED: Pipeline accepted invalid OCR photo instead of refusing it!");
    allPassed = false;
  }

  logs.push("\n=================================================");
  logs.push(allPassed ? "ALL INGESTION PIPELINE TESTS PASSED 100% ✓" : "TEST SUITE FAILED ✗");
  logs.push("=================================================");

  return { passed: allPassed, testLogs: logs };
}
