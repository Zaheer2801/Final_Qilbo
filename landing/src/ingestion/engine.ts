import { PROFILES } from "./profiles";
import { toCents, fromCents, divideCents } from "./money";
import type { VendorProfile, ParsedLine, ParseResult, GateResult } from "./types";

/** Any extracted value must exist literally in the source. Blocks fabrication. */
function assertVerbatim(src: string, val: string, field: string, item: string) {
  if (val && !src.includes(val))
    throw new Error(
      `FABRICATION DETECTED: ${field}="${val}" on item ${item} is not present in the ` +
      `source document. It was generated, not extracted.`);
}

function detectProfile(text: string): VendorProfile | null {
  return PROFILES.find(p => p.fingerprint.every(f => text.includes(f))) ?? null;
}

function packsFromDescription(desc: string, p: VendorProfile): number | null {
  for (const a of p.ambiguousPackCodes ?? []) if (desc.includes(a)) return null;
  const three = desc.match(/\b(\d+)\/(\d+)\/(\d+)\b/);
  if (three) return parseInt(three[1], 10);       // 6/4/16 -> 6 packs per case
  if (/\b\d+\/\d+\b/.test(desc)) return 1;        // 24/12  -> the case IS the unit
  return null;                                    // unknown -> flag, never guess
}

export function parseInvoice(rawText: string): ParseResult {
  const P = detectProfile(rawText);
  if (!P) {
    return { vendorId: null, displayName: "Unknown vendor", documentType: "invoice",
      invoiceNo: null, lines: [], gates: [], passed: false, statedTotal: null,
      computedTotal: "0.00", alerts: [], needsDiscovery: true };
  }

  // Stage 0 — quirk repair
  let text = rawText;
  if (P.quirks?.gluedDescription) {
    text = text.replace(/(?<=\d\.\d{2})(?=[A-Z])/g, "\n")
               .replace(/(?<=[A-Z])(?=-{5,})/g, "\n");
  }

  // Stage 2 — record assembly (shape-driven, not vendor-driven)
  const lines: ParsedLine[] = [];
  let cur: ParsedLine | null = null;
  const rawGroups: Record<string, string>[] = [];

  for (const line of text.split(/\r?\n/)) {
    const l = line.trim();
    if (!l || /^[-\s]+$/.test(l)) continue;

    const m = l.match(P.lineStart);
    if (m?.groups) {
      const g = m.groups as Record<string, string>;
      assertVerbatim(rawText, g.item, "itemNo", g.item);
      if (g.upc) assertVerbatim(rawText, g.upc, "UPC", g.item);
      assertVerbatim(rawText, g.price, "casePrice", g.item);
      assertVerbatim(rawText, g[P.netField], "lineNet", g.item);

      cur = {
        itemNo: g.item,
        upc: g.upc ? g.upc.padStart(12, "0") : null,
        description: g.description?.trim() ?? "",
        cases: parseInt(g.cases, 10),
        packsPerCase: null, unitsReceived: null,
        casePrice: g.price.replace(/,/g, ""),
        discount: (g.disc ?? "0.00").replace(/,/g, ""),
        lineNet: g[P.netField].replace(/,/g, ""),
        unitCost: null, notes: [], flags: [],
      };
      lines.push(cur); rawGroups.push(g);
      continue;
    }

    if (P.recordShape !== "multi_line" || !cur) continue;
    if (!cur.description) { cur.description = l; continue; }
    if (P.noteLine?.test(l)) cur.notes.push(l);
  }

  // Stage 6 — derive pack structure + unit cost
  lines.forEach((ln, i) => {
    const g = rawGroups[i];
    if (P.quantity.packSource === "units_column") {
      const u = parseInt(g.units ?? "0", 10);
      ln.unitsReceived = u;
      ln.packsPerCase = ln.cases > 0 && u % ln.cases === 0 ? u / ln.cases : null;
    } else {
      const ppc = packsFromDescription(ln.description, P);
      ln.packsPerCase = ppc;
      ln.unitsReceived = ppc !== null ? ln.cases * ppc : null;
    }
    if (ln.packsPerCase === null) ln.flags.push("AMBIGUOUS_PACK");
    else ln.unitCost = divideCents(toCents(ln.casePrice) - toCents(ln.discount), ln.packsPerCase);

    if (!P.hasUpc) ln.flags.push("NEEDS_UPC_MAPPING");

    const hay = `${ln.description} ${ln.notes.join(" ")}`.toUpperCase();
    if ((P.notDeliveredKeywords ?? []).some(k => hay.includes(k))) ln.flags.push("NOT_DELIVERED");
    if ((P.creditKeywords ?? []).some(k => hay.includes(k))) ln.flags.push("CREDIT_OWED");
  });

  // Stages 4 & 5 — adaptive gates
  const gates: GateResult[] = [];
  const TOL = 1n;

  for (const ln of lines) {
    const expect = BigInt(ln.cases) * (toCents(ln.casePrice) - toCents(ln.discount));
    const actual = toCents(ln.lineNet);
    const d = expect > actual ? expect - actual : actual - expect;
    // only meaningful when price is stated per case
    if (P.quantity.means !== "units") {
      const ok = d <= TOL;
      if (!ok) ln.flags.push("ARITHMETIC_MISMATCH");
      gates.push({ name: `line_arithmetic:${ln.itemNo}`, passed: ok,
        detail: `${ln.cases} x (${ln.casePrice} - ${ln.discount}) = ${fromCents(expect)}, stated ${ln.lineNet}` });
    }
  }

  // derived-field gate: catches a dropped discount instantly
  for (const ln of lines) {
    if (!ln.unitCost || ln.unitsReceived == null) continue;
    const recomputed = BigInt(Math.round(parseFloat(ln.unitCost) * 100)) * BigInt(ln.unitsReceived);
    const stated = toCents(ln.lineNet);
    const d = recomputed > stated ? recomputed - stated : stated - recomputed;
    gates.push({ name: `derived_unit_cost:${ln.itemNo}`, passed: d <= 10n,
      detail: `${ln.unitCost} x ${ln.unitsReceived} = ${fromCents(recomputed)}, lineNet ${ln.lineNet}` });
  }

  const computed = lines.reduce((a, l) => a + toCents(l.lineNet), 0n);
  const statedTotal = text.match(P.footer.total)?.[1]?.replace(/,/g, "") ?? null;
  gates.push({ name: "document_total",                       // MANDATORY, never skipped
    passed: statedTotal !== null && toCents(statedTotal) === computed,
    detail: `sum(lines) ${fromCents(computed)} vs stated ${statedTotal ?? "MISSING"}` });

  if (P.footer.cases) {
    const s = text.match(P.footer.cases)?.[1];
    const sum = lines.reduce((a, l) => a + l.cases, 0);
    gates.push({ name: "case_count", passed: s !== undefined && parseInt(s, 10) === sum,
      detail: `sum ${sum} vs stated ${s ?? "MISSING"}` });
  }
  if (P.footer.units) {
    const s = text.match(P.footer.units)?.[1];
    const sum = lines.reduce((a, l) => a + (l.unitsReceived ?? 0), 0);
    gates.push({ name: "unit_count", passed: s !== undefined && parseInt(s, 10) === sum,
      detail: `sum ${sum} vs stated ${s ?? "MISSING"}` });
  }

  // internal consistency — same item+price+qty must give the same net
  const seen = new Map<string, string>();
  for (const ln of lines) {
    const k = `${ln.description}|${ln.casePrice}|${ln.cases}`;
    const prev = seen.get(k);
    if (prev !== undefined && prev !== ln.lineNet)
      gates.push({ name: `internal_consistency:${ln.itemNo}`, passed: false,
        detail: `identical item/price/qty gave different nets: ${prev} vs ${ln.lineNet}` });
    seen.set(k, ln.lineNet);
  }

  const dt = P.footer.docType && P.footer.docType.pattern.test(text)
    ? P.footer.docType.type : "invoice";
  if (dt === "picklist") lines.forEach(l => l.flags.push("PROVISIONAL_PRICE"));

  return {
    vendorId: P.vendorId, displayName: P.displayName, documentType: dt,
    invoiceNo: P.footer.invoiceNo ? text.match(P.footer.invoiceNo)?.[1] ?? null : null,
    lines, gates, passed: gates.every(g => g.passed),
    statedTotal, computedTotal: fromCents(computed),
    alerts: lines.filter(l => l.flags.includes("CREDIT_OWED")).map(l => ({
      type: "CREDIT_OWED",
      amount: fromCents(toCents(l.casePrice) - toCents(l.discount)),
      detail: `${l.description} — ${l.notes.join("; ")} — billed in full`,
    })),
    needsDiscovery: false,
  };
}
