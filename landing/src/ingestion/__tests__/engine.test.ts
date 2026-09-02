import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { parseInvoice } from "../engine";

const wayneText = readFileSync(resolve(__dirname, "../../../fixtures/wayne_densch_523219.txt"), "utf8");
const bbgText = readFileSync(resolve(__dirname, "../../../fixtures/bbg_picklist.txt"), "utf8");

describe("Wayne Densch #523219 — multi-line, UPCs, cases-only", () => {
  const r = parseInvoice(wayneText);
  const by = (i: string) => r.lines.find(l => l.itemNo === i)!;

  it("routes to the right profile", () => expect(r.vendorId).toBe("wayne_densch"));
  it("parses 16 records", () => expect(r.lines).toHaveLength(16));
  it("passes every gate", () => {
    expect(r.gates.filter(g => !g.passed), JSON.stringify(r.gates.filter(g => !g.passed))).toHaveLength(0);
    expect(r.passed).toBe(true);
  });
  it("reconciles", () => expect(r.computedTotal).toBe("1103.75"));
  it("reads REAL UPCs, not derived", () => {
    expect(by("02122").upc).toBe("816751021238");   // not ...021221
    expect(by("02077").upc).toBe("816751020606");   // not ...020774
    expect(by("02167").upc).toBe("816751021689");   // not ...021672
    expect(by("02072").upc).toBe("816751020477");   // not ...020729
    expect(by("02119").upc).toBe("816751021207");   // not ...021194
  });
  it("costs net of discount", () => {
    expect(by("61044").unitCost).toBe("5.2416");
    expect(by("61168").unitCost).toBe("17.7000");
    expect(by("02201").unitCost).toBe("9.6833");
  });
  it("totals 146 units", () =>
    expect(r.lines.reduce((a, l) => a + (l.unitsReceived ?? 0), 0)).toBe(146));
  it("flags 4/6/16 and refuses to cost it", () => {
    expect(by("99952").flags).toContain("AMBIGUOUS_PACK");
    expect(by("99952").unitCost).toBeNull();
  });
  it("fires one $31.45 credit alert", () => {
    expect(r.alerts).toHaveLength(1);
    expect(r.alerts[0].amount).toBe("31.45");
  });
});

describe("BBG picklist — single-line, NO UPCs, cases+units", () => {
  const r = parseInvoice(bbgText);

  it("routes to the right profile", () => expect(r.vendorId).toBe("bbg_breakthru"));
  it("detects a picklist, not an invoice", () => expect(r.documentType).toBe("picklist"));
  it("marks prices provisional", () =>
    expect(r.lines.every(l => l.flags.includes("PROVISIONAL_PRICE"))).toBe(true));
  it("queues every line for UPC mapping", () =>
    expect(r.lines.every(l => l.flags.includes("NEEDS_UPC_MAPPING"))).toBe(true));
  it("derives packsPerCase from the units column", () => {
    const l = r.lines[0];                       // 1 case / 12 units
    expect(l.packsPerCase).toBe(12);
  });
  // THIS IS THE POINT: the OCR read is bad, so it MUST refuse.
  it("REFUSES to commit — gates fail on a bad OCR read", () => {
    expect(r.passed).toBe(false);
    expect(r.gates.find(g => g.name === "document_total")!.passed).toBe(false);
  });
});

describe("unknown vendor", () => {
  it("requests discovery instead of guessing", () => {
    const r = parseInvoice("SOME OTHER DISTRIBUTOR\n1 2 3\nTotal Sales 10.00");
    expect(r.needsDiscovery).toBe(true);
    expect(r.passed).toBe(false);
    expect(r.lines).toHaveLength(0);
  });
});
