import { wayneDensch as P } from "./profiles/wayneDensch";
import { toCents, fromCents, divideCents } from "./money";
import type { ParsedLine, ParseResult, GateResult } from "./types";

/** Throws if a parsed value is not literally present in the source text.
 *  This is what makes fabrication impossible. */
function assertVerbatim(source: string, value: string, field: string, item: string) {
  if (!source.includes(value)) {
    throw new Error(
      `FABRICATION DETECTED: ${field}="${value}" on item ${item} does not appear ` +
      `in the source document. Value was generated, not extracted.`
    );
  }
}

function packsPerCase(desc: string): number | null {
  for (const amb of P.ambiguousPackCodes) if (desc.includes(amb)) return null;
  const three = desc.match(/\b(\d+)\/(\d+)\/(\d+)\b/);
  if (three) return parseInt(three[1], 10);          // 6/4/16 -> 6
  const two = desc.match(/\b(\d+)\/(\d+)\b/);
  if (two) return 1;                                 // 24/12 -> case IS the unit
  return null;                                       // unknown -> flag, never guess
}

export function parseWayneDensch(rawText: string): ParseResult {
  // --- Stage 0: repair known quirks -------------------------------------
  let text = rawText;
  if (P.quirks.gluedDescription) {
    text = text.replace(/(?<=\d\.\d{2})(?=[A-Z])/g, "\n");   // net glued to desc
    text = text.replace(/(?<=[A-Z])(?=-{5,})/g, "\n");       // desc glued to rule
  }

  // --- Stage 2: multi-line record assembly ------------------------------
  const lines: ParsedLine[] = [];
  let cur: ParsedLine | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const l = raw.trim();
    if (!l || /^-+$/.test(l)) continue;

    const m = l.match(P.lineStart);
    if (m?.groups) {
      const g = m.groups;
      // every extracted value must exist verbatim in the source
      assertVerbatim(rawText, g.upc, "UPC", g.item);
      assertVerbatim(rawText, g.item, "itemNo", g.item);
      assertVerbatim(rawText, g.price, "casePrice", g.item);
      assertVerbatim(rawText, g.net, "lineNet", g.item);

      cur = {
        itemNo: g.item,
        upc: g.upc.padStart(12, "0"),
        description: "",
        qtyCases: parseInt(g.qty, 10),
        packsPerCase: null,
        unitsReceived: null,
        casePrice: g.price.replace(/,/g, ""),
        discount: g.disc.replace(/,/g, ""),
        lineNet: g.net.replace(/,/g, ""),
        unitCost: null,
        notes: [],
        flags: [],
      };
      lines.push(cur);
      continue;
    }

    if (!cur) continue;
    if (!cur.description) { cur.description = l; continue; }
    if (P.noteLine.test(l)) cur.notes.push(l);
  }

  // --- Stage 6: pack structure + derived fields -------------------------
  for (const ln of lines) {
    const ppc = packsPerCase(ln.description);
    if (ppc === null) {
      ln.flags.push("AMBIGUOUS_PACK");           // flagged, NOT costed
    } else {
      ln.packsPerCase = ppc;
      ln.unitsReceived = ln.qtyCases * ppc;
      const netPerCase = toCents(ln.casePrice) - toCents(ln.discount);
      ln.unitCost = divideCents(netPerCase, ppc);
    }
    const upper = (ln.description + " " + ln.notes.join(" ")).toUpperCase();
    if (P.notDeliveredKeywords.some(k => upper.includes(k))) ln.flags.push("NOT_DELIVERED");
    if (P.creditKeywords.some(k => upper.includes(k))) ln.flags.push("CREDIT_OWED");
  }

  // --- Stages 4 & 5: gates ---------------------------------------------
  const gates: GateResult[] = [];
  const TOL = 1n;

  // 4: per-line arithmetic
  for (const ln of lines) {
    const expect = BigInt(ln.qtyCases) * (toCents(ln.casePrice) - toCents(ln.discount));
    const actual = toCents(ln.lineNet);
    const ok = (expect > actual ? expect - actual : actual - expect) <= TOL;
    if (!ok) ln.flags.push("ARITHMETIC_MISMATCH");
    gates.push({
      name: `line_arithmetic:${ln.itemNo}`, passed: ok,
      detail: `${ln.qtyCases} x (${ln.casePrice} - ${ln.discount}) = ${fromCents(expect)}, stated ${ln.lineNet}`,
    });
  }

  // 4b: derived-field gate — catches a dropped DISC immediately
  for (const ln of lines) {
    if (ln.unitCost === null || ln.unitsReceived === null) continue;
    const recomputed = BigInt(Math.round(parseFloat(ln.unitCost) * 100)) * BigInt(ln.unitsReceived);
    const stated = toCents(ln.lineNet);
    const diff = recomputed > stated ? recomputed - stated : stated - recomputed;
    gates.push({
      name: `derived_unit_cost:${ln.itemNo}`, passed: diff <= 10n,
      detail: `unitCost ${ln.unitCost} x ${ln.unitsReceived} units = ${fromCents(recomputed)}, lineNet ${ln.lineNet}`,
    });
  }

  // 5: document total — MANDATORY
  const computed = lines.reduce((a, l) => a + toCents(l.lineNet), 0n);
  const statedTotal = text.match(P.footer.total)?.[1]?.replace(/,/g, "") ?? null;
  gates.push({
    name: "document_total",
    passed: statedTotal !== null && toCents(statedTotal) === computed,
    detail: `sum(lines) ${fromCents(computed)} vs stated ${statedTotal ?? "MISSING"}`,
  });

  // 5b: case count
  const statedCases = text.match(P.footer.cases)?.[1];
  const sumCases = lines.reduce((a, l) => a + l.qtyCases, 0);
  gates.push({
    name: "case_count",
    passed: statedCases !== undefined && parseInt(statedCases, 10) === sumCases,
    detail: `sum(cases) ${sumCases} vs stated ${statedCases ?? "MISSING"}`,
  });

  // 5c: internal consistency — same item+price must give same net
  const seen = new Map<string, string>();
  for (const ln of lines) {
    const key = `${ln.description}|${ln.casePrice}|${ln.qtyCases}`;
    const prev = seen.get(key);
    if (prev !== undefined && prev !== ln.lineNet) {
      gates.push({
        name: `internal_consistency:${ln.itemNo}`, passed: false,
        detail: `identical item/price/qty produced different nets: ${prev} vs ${ln.lineNet}`,
      });
    }
    seen.set(key, ln.lineNet);
  }

  const alerts = lines
    .filter(l => l.flags.includes("CREDIT_OWED"))
    .map(l => ({
      type: "CREDIT_OWED",
      amount: fromCents(toCents(l.casePrice) - toCents(l.discount)),
      detail: `${l.description} — ${l.notes.join("; ")} — billed in full`,
    }));

  return {
    vendor: P.displayName,
    invoiceNo: text.match(P.footer.invoiceNo)?.[1] ?? null,
    lines, gates,
    passed: gates.every(g => g.passed),
    statedTotal, computedTotal: fromCents(computed), alerts,
  };
}
