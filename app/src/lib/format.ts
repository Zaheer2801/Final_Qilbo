// Display-only text formatting — never mutates stored data, only how it's
// rendered. Real-world CSV/POS imports carry inconsistent casing (ALL CAPS
// department names, lowercase product names, mixed formats) which reads as
// noisy/unpolished next to itself in a table; normalize it for display so
// the UI looks uniform regardless of how the source data was formatted.
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/(\s+)/)
    .map((word) => (word.trim() ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join("");
}
