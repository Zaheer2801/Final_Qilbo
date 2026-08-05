import type { ReactNode } from "react";

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
