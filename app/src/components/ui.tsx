import type { ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown } from "lucide-react";
import { titleCase } from "../lib/format";

export const card = "bg-white rounded-lg border border-stone-200 p-5";
export const inputCls =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/40 focus:border-amber-700";
export const btnPrimary =
  "inline-flex items-center gap-1 rounded-md bg-amber-800 text-amber-50 text-sm font-medium px-4 py-2 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed";
export const btnGhost = "inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700";
export const btnSmall =
  "inline-flex items-center gap-1 rounded-md border border-stone-300 text-xs font-medium px-2.5 py-1.5 hover:bg-stone-50";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-stone-800 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-500 mt-1">{hint}</span>}
    </label>
  );
}

type Tone = "gray" | "green" | "amber" | "red";

const TONES: Record<Tone, string> = {
  gray: "bg-stone-100 text-stone-600",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-900",
  red: "bg-red-100 text-red-800",
};

export function Tag({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${TONES[tone]}`}>{children}</span>;
}

// Deliberately separate from Tag/TONES above — those tones are semantic
// (red = actually low/at-risk, green = actually OK) and must stay reserved
// for real status, never diluted by being reused for arbitrary category
// labels. Category color is just for visual variety/scanability, so it's
// hashed from the string — same category always gets the same color, but
// there's no meaning attached to which one.
const CATEGORY_PALETTE = [
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
  "bg-teal-100 text-teal-800",
  "bg-orange-100 text-orange-800",
  "bg-indigo-100 text-indigo-800",
  "bg-lime-100 text-lime-800",
  "bg-fuchsia-100 text-fuchsia-800",
];

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

export function CategoryPill({ category }: { category: string }) {
  const label = titleCase(category || "Uncategorized");
  return <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${hashColor(label)}`}>{label}</span>;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/** Page-number + prev/next control for long tables — windowed around the
 * current page (with leading/trailing ellipsis) rather than listing every
 * page, so it stays usable at hundreds of pages. */
export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
}) {
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  const pages: (number | "…")[] = [];
  const windowSize = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= windowSize) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-3 mt-2 border-t border-stone-100">
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <span>
          Result {rangeStart}-{rangeEnd} of {totalCount}
        </span>
        <select
          className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-md border border-stone-300 text-xs font-medium px-2 py-1.5 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={13} />
          Previous
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1.5 text-xs text-stone-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] rounded-md border text-xs font-medium px-2 py-1.5 ${
                p === page ? "border-amber-700/50 bg-amber-50 text-amber-900" : "border-stone-300 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-md border border-stone-300 text-xs font-medium px-2 py-1.5 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

export function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-stone-200 overflow-hidden">
      <div className="bg-stone-50 px-4 py-2 border-b border-stone-200">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-600">{title}</span>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

export function ReviewRow({ label, value, emphasize }: { label: string; value: ReactNode; emphasize?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-1.5 text-sm ${emphasize ? "border-t border-stone-100 mt-1 pt-2" : ""}`}>
      <span className="text-stone-500 shrink-0">{label}</span>
      <span className={`text-right ${emphasize ? "font-semibold text-stone-900" : "text-stone-800"}`}>{value}</span>
    </div>
  );
}

/** Clickable table column header with a sort-direction indicator — active
 * column shows an up/down chevron, inactive columns show a neutral
 * up-down glyph so it's clear they're clickable too. */
export function SortableHeader({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction?: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs font-medium hover:text-stone-800 ${
        active ? "text-stone-800" : "text-stone-400"
      } ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      {label}
      {active ? direction === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} /> : <ChevronsUpDown size={12} />}
    </button>
  );
}

/** Rounded "pill" toolbar button matching the reference table-toolbar look
 * (Filter/Sort-style buttons with an optional count badge). */
export function ToolbarPill({ children, onClick, active }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border text-xs font-medium px-3 py-1.5 ${
        active ? "border-amber-700/50 bg-amber-50 text-amber-900" : "border-stone-300 text-stone-600 hover:bg-stone-50"
      }`}
    >
      {children}
    </button>
  );
}
