import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../../types";
import { ToolbarPill } from "../ui";

export type SortKey = "name" | "qtyLow" | "qtyHigh" | "priceLow" | "priceHigh";

const SORT_LABELS: Record<SortKey, string> = {
  name: "Name (A–Z)",
  qtyLow: "Quantity (low first)",
  qtyHigh: "Quantity (high first)",
  priceLow: "Price (low first)",
  priceHigh: "Price (high first)",
};

function matchesSearch(p: Product, q: string) {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return p.name.toLowerCase().includes(needle) || (p.brand ?? "").toLowerCase().includes(needle);
}

function matchesCategory(p: Product, cat: string) {
  return !cat || (p.category || "Uncategorized") === cat;
}

function sortItems<T>(items: T[], getP: (t: T) => Product, key: SortKey): T[] {
  const arr = [...items];
  arr.sort((a, b) => {
    const pa = getP(a);
    const pb = getP(b);
    switch (key) {
      case "name":
        return pa.name.localeCompare(pb.name);
      case "qtyLow":
        return pa.qty - pb.qty;
      case "qtyHigh":
        return pb.qty - pa.qty;
      case "priceLow":
        return pa.sellingPrice - pb.sellingPrice;
      case "priceHigh":
        return pb.sellingPrice - pa.sellingPrice;
    }
  });
  return arr;
}

/** Search + category filter + sort + density, shared by every long
 * product-backed list in the app (Inventory table, Overview's expanded
 * panels) so behavior and styling stay identical wherever a list gets long
 * enough to need it. */
export function useListControls<T>(rawItems: T[], getP: (t: T) => Product) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [compact, setCompact] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(rawItems.map((i) => getP(i).category || "Uncategorized"))).sort(),
    [rawItems]
  );

  const shown = useMemo(() => {
    const filtered = rawItems.filter((i) => matchesSearch(getP(i), search) && matchesCategory(getP(i), category));
    return sortItems(filtered, getP, sortBy);
  }, [rawItems, search, category, sortBy]);

  return { search, setSearch, category, setCategory, categories, sortBy, setSortBy, compact, setCompact, shown };
}

export type ListControlsState<T> = ReturnType<typeof useListControls<T>>;

const pillSelect =
  "shrink-0 rounded-full border border-stone-300 bg-white pl-3 pr-7 py-1.5 text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-700/40 focus:border-amber-700";
// Deliberately not reusing inputCls here — it hardcodes w-full, which
// doesn't reliably lose to an appended w-40 in Tailwind's generated CSS
// (utility order in the stylesheet, not className string order, wins).
const pillSearch =
  "shrink-0 w-40 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/40 focus:border-amber-700";

/** Single-row toolbar — search, filter, sort, density, and (via rightSlot)
 * page-specific actions all share one non-wrapping row; on a viewport too
 * narrow to fit everything it scrolls horizontally rather than stacking. */
export function ListControls<T>({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  sortBy,
  setSortBy,
  compact,
  setCompact,
  shown,
  totalCount,
  rightSlot,
}: ListControlsState<T> & { totalCount: number; rightSlot?: ReactNode }) {
  return (
    <div className="flex flex-nowrap items-center gap-2 mb-3 pb-3 border-b border-stone-100 overflow-x-auto">
      <input className={pillSearch} placeholder="Search name / brand" value={search} onChange={(e) => setSearch(e.target.value)} />
      <select className={pillSelect + " w-36"} value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select className={pillSelect + " w-44"} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
        {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            Sort: {SORT_LABELS[k]}
          </option>
        ))}
      </select>
      <ToolbarPill onClick={() => setCompact((v) => !v)} active={compact}>
        {compact ? "Comfortable" : "Compact"}
      </ToolbarPill>
      <span className="text-xs text-stone-400 shrink-0 whitespace-nowrap">
        {shown.length} of {totalCount} Result{totalCount === 1 ? "" : "s"}
      </span>
      <div className="ml-auto shrink-0 flex items-center gap-1.5">{rightSlot}</div>
    </div>
  );
}
