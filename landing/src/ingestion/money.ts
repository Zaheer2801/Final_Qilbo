export function toCents(s: string | undefined | null): bigint {
  if (!s) return 0n;
  const c = String(s).replace(/[,$\s]/g, "");
  const neg = c.startsWith("-");
  const [w, f = "00"] = c.replace("-", "").split(".");
  const v = BigInt(w || "0") * 100n + BigInt(f.padEnd(2, "0").slice(0, 2));
  return neg ? -v : v;
}

export function fromCents(c: bigint): string {
  const n = c < 0n, a = n ? -c : c;
  return `${n ? "-" : ""}${a / 100n}.${String(a % 100n).padStart(2, "0")}`;
}

export function divideCents(c: bigint, by: number): string {
  const s = String((c * 10000n) / BigInt(by)).padStart(7, "0");
  return `${s.slice(0, -6)}.${s.slice(-6, -2)}`;
}
