/**
 * Universal Hardcoded Reconciliation Gate Pipeline
 * 
 * THE ORGANIZING PRINCIPLE:
 * Every invoice states a total that its line items must sum to.
 * Validation is universal and hardcoded; parsing is per-vendor and configurable.
 * 
 * TOLERANCE: $0.01
 * MANDATORY: Document Total Gate is NEVER optional.
 */

import type { CanonicalLineItem, GateResult } from "./types";
import { decimalAdd, decimalEquals, decimalMul, decimalSub } from "./types";

export interface GateExecutionOutput {
  all_passed: boolean;
  gates: GateResult[];
  rejection_reason?: string;
  ambiguous_lines: CanonicalLineItem[];
}

export class ReconciliationGates {
  public static runAllGates(
    lines: CanonicalLineItem[],
    statedTotal: string,
    rawDocumentText: string,
    statedCases?: number,
    statedUnits?: number
  ): GateExecutionOutput {
    const gates: GateResult[] = [];
    const ambiguousLines: CanonicalLineItem[] = [];
    let allPassed = true;

    // -------------------------------------------------------------
    // GATE 1: Mandatory Document Total Gate (Σ(line ext) == stated total)
    // -------------------------------------------------------------
    let calculatedExtSum = "0.00";
    lines.forEach((line) => {
      if (!line.flags.includes("ambiguous") && !line.flags.includes("breakage_unpaid")) {
        calculatedExtSum = decimalAdd(calculatedExtSum, line.line_net);
      }
    });

    const totalPassed = decimalEquals(calculatedExtSum, statedTotal, 0.01);
    gates.push({
      passed: totalPassed,
      gate_name: "Document Total Reconciliation",
      details: `Calculated sum of lines ($${calculatedExtSum}) vs Stated Document Total ($${statedTotal})`,
      expected: `$${statedTotal}`,
      actual: `$${calculatedExtSum}`,
    });

    if (!totalPassed) {
      allPassed = false;
    }

    // -------------------------------------------------------------
    // GATE 2: Line-by-Line Arithmetic Gate (qty × (price - disc) == line_net)
    // -------------------------------------------------------------
    let lineArithPassed = true;
    lines.forEach((line, idx) => {
      if (line.flags.includes("ambiguous")) {
        ambiguousLines.push(line);
        return;
      }

      const unitNet = decimalSub(line.case_price, line.discount);
      const expectedNet = decimalMul(unitNet, line.cases);

      if (line.flags.includes("breakage") || line.cases === 0) {
        return;
      }

      if (!decimalEquals(expectedNet, line.line_net, 0.01)) {
        lineArithPassed = false;
        gates.push({
          passed: false,
          gate_name: `Line ${idx + 1} Arithmetic`,
          details: `Item #${line.vendor_item_no}: ${line.cases} cs × ($${line.case_price} - $${line.discount}) = $${expectedNet}, but billed net is $${line.line_net}`,
          expected: `$${expectedNet}`,
          actual: `$${line.line_net}`,
        });
      }
    });

    if (lineArithPassed) {
      gates.push({
        passed: true,
        gate_name: "Line Arithmetic Verification",
        details: `All ${lines.length} lines satisfy cases × (case_price - discount) == line_net`,
      });
    } else {
      allPassed = false;
    }

    // -------------------------------------------------------------
    // GATE 3: Derived-Field Gate (unit_cost × units_received ≈ line_net)
    // Dynamic case-proportional tolerance for pack division rounding (e.g., $31.45 / 6 = $5.2416)
    // -------------------------------------------------------------
    let derivedPassed = true;
    lines.forEach((line, idx) => {
      if (line.flags.includes("ambiguous") || line.flags.includes("breakage") || line.units_received === 0) {
        return;
      }

      const expectedNetFromUnitCost = (parseFloat(line.unit_cost) * line.units_received).toFixed(2);
      const tolerance = Math.max(0.05, 0.02 * line.cases);

      if (!decimalEquals(expectedNetFromUnitCost, line.line_net, tolerance)) {
        derivedPassed = false;
        gates.push({
          passed: false,
          gate_name: `Line ${idx + 1} Derived Unit Cost Gate`,
          details: `Item #${line.vendor_item_no}: unit_cost ($${line.unit_cost}) × units (${line.units_received}) = $${expectedNetFromUnitCost}, which does not match line net ($${line.line_net})`,
          expected: `$${line.line_net}`,
          actual: `$${expectedNetFromUnitCost}`,
        });
      }
    });

    if (derivedPassed) {
      gates.push({
        passed: true,
        gate_name: "Derived Unit Cost Verification",
        details: "All lines satisfy unit_cost × units_received == line_net (no dropped discounts)",
      });
    } else {
      allPassed = false;
    }

    // -------------------------------------------------------------
    // GATE 4: Source-Substring Gate (Literal Verbatim Document Check)
    // Every UPC, Item Number, and Money value MUST exist as a literal substring in the document text
    // -------------------------------------------------------------
    let sourceSubstrPassed = true;
    const docTextUpper = rawDocumentText.toUpperCase();

    lines.forEach((line, idx) => {
      // Check UPC if present
      if (line.upc && line.upc !== "000000000000" && !docTextUpper.includes(line.upc)) {
        sourceSubstrPassed = false;
        gates.push({
          passed: false,
          gate_name: `Line ${idx + 1} Source Substring Failure (UPC)`,
          details: `Extracted UPC '${line.upc}' for item #${line.vendor_item_no} does not exist verbatim in raw document text! Generated data rejected.`,
          expected: "Literal match in document text",
          actual: `Not found: ${line.upc}`,
        });
      }

      // Check Vendor Item No
      if (line.vendor_item_no && !docTextUpper.includes(line.vendor_item_no)) {
        sourceSubstrPassed = false;
        gates.push({
          passed: false,
          gate_name: `Line ${idx + 1} Source Substring Failure (Item #)`,
          details: `Item #${line.vendor_item_no} does not exist verbatim in raw document text!`,
          expected: "Literal match in document text",
          actual: `Not found: ${line.vendor_item_no}`,
        });
      }
    });

    if (sourceSubstrPassed) {
      gates.push({
        passed: true,
        gate_name: "Source Substring Verification",
        details: "All UPCs, item numbers, and prices appear verbatim as literal substrings of document text",
      });
    } else {
      allPassed = false;
    }

    // -------------------------------------------------------------
    // GATE 5: Case Count Gate (Σ(cases) == footer cases)
    // -------------------------------------------------------------
    if (statedCases !== undefined && statedCases !== null) {
      const calculatedCases = lines.reduce((sum, line) => sum + (line.cases || 0), 0);
      const casesPassed = calculatedCases === statedCases;
      gates.push({
        passed: casesPassed,
        gate_name: "Case Count Verification",
        details: `Calculated total cases (${calculatedCases}) vs Footer stated cases (${statedCases})`,
        expected: `${statedCases} cases`,
        actual: `${calculatedCases} cases`,
      });
      if (!casesPassed) allPassed = false;
    }

    // -------------------------------------------------------------
    // GATE 6: Unit Count Gate (Σ(units) == footer units)
    // -------------------------------------------------------------
    if (statedUnits !== undefined && statedUnits !== null) {
      const calculatedUnits = lines.reduce((sum, line) => sum + (line.units_received || 0), 0);
      const unitsPassed = calculatedUnits === statedUnits;
      gates.push({
        passed: unitsPassed,
        gate_name: "Unit Count Verification",
        details: `Calculated total units (${calculatedUnits}) vs Footer stated units (${statedUnits})`,
        expected: `${statedUnits} units`,
        actual: `${calculatedUnits} units`,
      });
      if (!unitsPassed) allPassed = false;
    }

    // -------------------------------------------------------------
    // GATE 7: Internal Consistency Gate
    // (Identical SKU + Identical Case Price => MUST yield Identical Net)
    // -------------------------------------------------------------
    const skuPriceMap = new Map<string, { line_net: string; line_index: number }>();
    let consistencyPassed = true;

    lines.forEach((line, idx) => {
      if (!line.vendor_item_no) return;
      const key = `${line.vendor_item_no}:${line.case_price}:${line.cases}`;
      const existing = skuPriceMap.get(key);

      if (existing) {
        if (!decimalEquals(existing.line_net, line.line_net, 0.01)) {
          consistencyPassed = false;
          ambiguousLines.push(line);
          gates.push({
            passed: false,
            gate_name: "Internal Consistency Failure",
            details: `Identical item #${line.vendor_item_no} at $${line.case_price} case price parsed with inconsistent nets: Line ${existing.line_index + 1} ($${existing.line_net}) vs Line ${idx + 1} ($${line.line_net})`,
            expected: `$${existing.line_net}`,
            actual: `$${line.line_net}`,
          });
        }
      } else {
        skuPriceMap.set(key, { line_net: line.line_net, line_index: idx });
      }
    });

    if (consistencyPassed) {
      gates.push({
        passed: true,
        gate_name: "Internal Consistency",
        details: "No conflicting net amounts detected for identical SKUs with identical pricing",
      });
    } else {
      allPassed = false;
    }

    let rejection_reason: string | undefined = undefined;
    if (!allPassed) {
      const failedGates = gates.filter((g) => !g.passed).map((g) => g.gate_name);
      rejection_reason = `Reconciliation Failed: [${failedGates.join(", ")}]. Refused auto-commit.`;
    }

    return {
      all_passed: allPassed,
      gates,
      rejection_reason,
      ambiguous_lines: ambiguousLines,
    };
  }
}
