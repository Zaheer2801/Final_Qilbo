export function toCents(s: string): bigint {
  const cleaned = s.replace(/[,$\s]/g, "");
  const neg = cleaned.startsWith("-");
  const [whole, frac = "00"] = cleaned.replace("-", "").split(".");
  const cents = BigInt(whole) * 100n + BigInt(frac.padEnd(2, "0").slice(0, 2));
  return neg ? -cents : cents;
}

export function fromCents(c: bigint): string {
  const neg = c < 0n;
  const a = neg ? -c : c;
  return `${neg ? "-" : ""}${a / 100n}.${String(a % 100n).padStart(2, "0")}`;
}

/** Divide cents into n parts, returning a 4-dp string. Used for unit cost. */
export function divideCents(c: bigint, n: number): string {
  const scaled = (c * 10000n) / BigInt(n);   // 4 extra dp
  const s = String(scaled).padStart(7, "0");
  return `${s.slice(0, -6)}.${s.slice(-6, -2)}`;
}
