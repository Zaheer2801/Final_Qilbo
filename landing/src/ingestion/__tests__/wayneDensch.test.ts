import { describe, it, expect } from "vitest";
import { parseWayneDensch } from "../parseWayneDensch";
import { readFileSync } from "fs";
import { resolve } from "path";

const fixturePath = resolve(__dirname, "../../../fixtures/wayne_densch_523219.txt");
const text = readFileSync(fixturePath, "utf8");

describe("Wayne Densch #523219", () => {
  const r = parseWayneDensch(text);

  it("parses 16 records", () => expect(r.lines).toHaveLength(16));
  it("all gates pass", () => {
    const failed = r.gates.filter(g => !g.passed);
    expect(failed, JSON.stringify(failed, null, 2)).toHaveLength(0);
    expect(r.passed).toBe(true);
  });
  it("reconciles to 1103.75", () => expect(r.computedTotal).toBe("1103.75"));

  const by = (i: string) => r.lines.find(l => l.itemNo === i)!;

  it("reads REAL UPCs, not derived ones", () => {
    expect(by("02122").upc).toBe("816751021238");  // NOT 816751021221
    expect(by("02077").upc).toBe("816751020606");  // NOT 816751020774
    expect(by("02167").upc).toBe("816751021689");  // NOT 816751021672
    expect(by("02072").upc).toBe("816751020477");  // NOT 816751020729
    expect(by("02119").upc).toBe("816751021207");  // NOT 816751021194
  });

  it("computes unit cost net of discount", () => {
    expect(by("61044").unitCost).toBe("5.2416");   // Busch 4pk
    expect(by("27044").unitCost).toBe("4.8416");   // Natural Ice 4pk
    expect(by("61168").unitCost).toBe("17.7000");  // (19.65-1.95)/1
    expect(by("96769").unitCost).toBe("14.9750");
    expect(by("02201").unitCost).toBe("9.6833");   // (62.55-4.45)/6
  });

  it("converts cases to units", () => {
    expect(by("61044").unitsReceived).toBe(36);
    expect(by("27044").unitsReceived).toBe(42);
    expect(r.lines.reduce((a, l) => a + (l.unitsReceived ?? 0), 0)).toBe(146);
  });

  it("flags the ambiguous 4/6/16 line and does not cost it", () => {
    expect(by("99952").flags).toContain("AMBIGUOUS_PACK");
    expect(by("99952").unitCost).toBeNull();
  });

  it("fires one credit alert for 31.45", () => {
    expect(r.alerts).toHaveLength(1);
    expect(r.alerts[0].amount).toBe("31.45");
  });

  it("rejects fabricated values", () => {
    const tampered = text.replace("816751021238", "816751021221");
    const res = () => parseWayneDensch(tampered);
    expect(res).not.toThrow();
    expect(() => parseWayneDensch(text.replace(/816751021238/, "999999999999")))
      .not.toThrow();
  });
});
