export const wayneDensch = {
  vendorId: "wayne_densch",
  displayName: "Wayne Densch, Inc.",
  fingerprint: ["WAYNE DENSCH", "2900 W FIRST ST", "(407) 323-5600"],
  recordShape: "multi_line" as const,
  lineStart:
    /^(?<item>\d{4,6})\s+(?<qty>-?\d+)\s+(?<upc>\d{11,14})\s+(?<price>[\d,]+\.\d{2})\s+(?<disc>[\d,]+\.\d{2})\s+(?<dep>[\d,]+\.\d{2})\s+(?<net>[\d,]+\.\d{2})\s*$/,
  noteLine: /^(-?\d+)\s+(\S.*)$/,
  footer: {
    total: /Total Sales\s+([\d,]+\.\d{2})/,
    cases: /Cases:\s*(\d+)/,
    units: null as RegExp | null,     // this vendor does not state units
    invoiceNo: /Invoice#:\s*(\d+)/,
  },
  quirks: {
    gluedDescription: true,   // "58.10CUTWATER LIME MARGARITA"
  },
  /** Pack codes this vendor uses ambiguously — never auto-cost these. */
  ambiguousPackCodes: ["4/6/16"],
  creditKeywords: ["BREAKAGE", "SHORT", "DAMAGE"],
  notDeliveredKeywords: ["OUT OF STOCK"],
};
