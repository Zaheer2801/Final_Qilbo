// The 7-screen condensation of onboarding-flow.md's 12-step spec:
//   Steps 1        -> screen 0 (Business & owner)
//   Steps 2, 3, 4  -> screen 1 (Vertical, compliance & operations)
//   Steps 5, 6     -> screen 2 (Tax & property)
//   Steps 7, 9     -> screen 3 (Invoices & procurement style)
//   Step 9 (margins)-> screen 4 (Category pricing floors)
//   Step 10, 11    -> screen 5 (Returns, expiry & alerts)
//   Step 12        -> screen 6 (Review & confirm)
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { AddressFields, BusinessConfig, DayHours, DayOfWeek, InvoiceMethod, MarginPolicyRow, ReorderUnit, UtilityLine } from "../types";
import { round2 } from "../lib/businessLogic";
import { timezoneForState, TIMEZONES } from "../lib/timezone";
import { COUNTRIES, formatHoursSummary, SAMPLE_ADDRESS_SUGGESTIONS, TIME_OPTIONS, US_STATES } from "../lib/formOptions";
import { btnGhost, btnPrimary, btnSmall, card, Field, inputCls, ReviewRow, ReviewSection } from "./ui";

const OB_STEPS = [
  "Business & owner",
  "Vertical, compliance & operations",
  "Tax & property",
  "Invoices & procurement style",
  "Category pricing floors",
  "Returns, expiry & alerts",
  "Review & confirm",
];

const VERTICALS = ["Liquor retail", "Restaurant", "Hospitality", "General retail", "E-commerce"];

const INVOICE_METHOD_OPTIONS: { v: InvoiceMethod; t: string }[] = [
  { v: "gmail", t: "Forward to a monitored Gmail address" },
  { v: "photo", t: "Photograph / upload manually" },
  { v: "other", t: "Other" },
];

const INVOICE_METHOD_LABEL: Record<InvoiceMethod, string> = {
  gmail: "Gmail",
  photo: "Photo upload",
  other: "Other",
};

export default function Onboarding({
  initialConfig,
  initialMarginPolicy,
  onComplete,
}: {
  initialConfig: BusinessConfig;
  initialMarginPolicy: MarginPolicyRow[];
  onComplete: (cfg: BusinessConfig, policy: MarginPolicyRow[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState<BusinessConfig>(initialConfig);
  const [policy, setPolicy] = useState<MarginPolicyRow[]>(initialMarginPolicy);
  const [tzAutoApplied, setTzAutoApplied] = useState(false);
  const [addressSuggestOpen, setAddressSuggestOpen] = useState(false);

  const set =
    (k: keyof BusinessConfig) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setCfg((c) => ({ ...c, [k]: e.target.value }));
  const setBool = (k: keyof BusinessConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCfg((c) => ({ ...c, [k]: e.target.checked }));

  function setAddressField(field: keyof AddressFields, value: string) {
    setCfg((c) => ({ ...c, address: { ...c.address, [field]: value } }));
  }

  function applyAddressSuggestion(s: (typeof SAMPLE_ADDRESS_SUGGESTIONS)[number]) {
    setCfg((c) => ({ ...c, address: { ...c.address, street: s.street, city: s.city, state: s.state, zip: s.zip } }));
    setAddressSuggestOpen(false);
  }

  // onboarding-flow.md Step 4: auto-suggest timezone from the address instead of
  // making the owner pick it manually — still just a dropdown they can override.
  // Driven directly off the state field now that address is structured, rather
  // than regexing a free-text blob.
  useEffect(() => {
    if (!tzAutoApplied && cfg.address.state) {
      const guess = timezoneForState(cfg.address.state);
      if (guess) {
        setCfg((c) => ({ ...c, timezone: guess }));
        setTzAutoApplied(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.address.state]);

  function updateDayHours(day: DayOfWeek, key: keyof DayHours, value: string | boolean) {
    setCfg((c) => ({ ...c, hours: c.hours.map((h) => (h.day === day ? { ...h, [key]: value } : h)) }));
  }

  function updateUtility(i: number, key: keyof UtilityLine, val: string) {
    setCfg((c) => ({ ...c, utilities: c.utilities.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)) }));
  }
  function removeUtility(i: number) {
    setCfg((c) => ({ ...c, utilities: c.utilities.filter((_, idx) => idx !== i) }));
  }
  function addUtility() {
    setCfg((c) => ({ ...c, utilities: [...c.utilities, { name: "", amount: "" }] }));
  }

  function toggleInvoiceMethod(v: InvoiceMethod, checked: boolean) {
    setCfg((c) => ({
      ...c,
      invoiceMethods: checked ? [...c.invoiceMethods, v] : c.invoiceMethods.filter((m) => m !== v),
    }));
  }

  function updatePolicyRow(i: number, key: keyof MarginPolicyRow, val: string) {
    setPolicy((p) => p.map((row, idx) => (idx === i ? { ...row, [key]: key === "minMarginPct" ? Number(val) : val } : row)));
  }
  function addPolicyRow() {
    setPolicy((p) => [...p, { category: "", minMarginPct: 25 }]);
  }

  const totalOverhead = round2(Number(cfg.rent || 0) + cfg.utilities.reduce((sum, u) => sum + Number(u.amount || 0), 0));
  const isLast = step === OB_STEPS.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center font-bold" style={{ fontFamily: "Georgia, serif" }}>
          Q
        </div>
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "Georgia, serif" }}>
          Qilbo setup
        </h1>
        <span className="ml-auto text-xs text-stone-500 font-mono">
          step {step + 1} of {OB_STEPS.length}
        </span>
      </div>

      <div className={card}>
        <h2 className="text-lg font-semibold mb-4">{OB_STEPS[step]}</h2>

        {step === 0 && (
          <>
            <p className="text-sm text-stone-500 mb-4">
              We can't auto-fill business details from your EIN alone — no reliable free service does that (see
              onboarding-flow.md's "Known limitation"). Everything here is entered directly.
            </p>
            <Field label="Legal business name">
              <input className={inputCls} value={cfg.businessName} onChange={set("businessName")} placeholder="Tropic Spirits LLC" />
            </Field>
            <Field label="Storefront / DBA name">
              <input className={inputCls} value={cfg.dba} onChange={set("dba")} placeholder="Tropic Spirits Liquor" />
            </Field>
            <div className="mb-1 relative">
              <span className="block text-sm font-medium text-stone-800 mb-1">Street address</span>
              <input
                className={inputCls}
                value={cfg.address.street}
                onChange={(e) => {
                  setAddressField("street", e.target.value);
                  setAddressSuggestOpen(e.target.value.length >= 2);
                }}
                onFocus={() => setAddressSuggestOpen(cfg.address.street.length >= 2)}
                onBlur={() => setTimeout(() => setAddressSuggestOpen(false), 150)}
                placeholder="4210 Palmetto Ave"
                autoComplete="off"
              />
              {addressSuggestOpen &&
                (() => {
                  const q = cfg.address.street.toLowerCase();
                  const matches = SAMPLE_ADDRESS_SUGGESTIONS.filter((s) => s.street.toLowerCase().includes(q) || s.city.toLowerCase().includes(q));
                  if (matches.length === 0) return null;
                  return (
                    <div className="absolute z-10 left-0 right-0 mt-1 rounded-md border border-stone-300 bg-white shadow-md max-h-48 overflow-auto">
                      {matches.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={() => applyAddressSuggestion(s)}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-amber-50"
                        >
                          {s.street}, {s.city}, {s.state} {s.zip}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              <span className="block text-xs text-stone-500 mt-1">
                Suggestions here are a local stand-in for a real address lookup (no live geocoding API wired up in this prototype) — pick one
                to fill in city/state/zip, or type your own and fill those fields directly below.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="City">
                <input className={inputCls} value={cfg.address.city} onChange={(e) => setAddressField("city", e.target.value)} />
              </Field>
              <Field label="State">
                <select className={inputCls} value={cfg.address.state} onChange={(e) => setAddressField("state", e.target.value)}>
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s.v} value={s.v}>
                      {s.l}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="ZIP code">
                <input className={inputCls} value={cfg.address.zip} onChange={(e) => setAddressField("zip", e.target.value)} placeholder="33127" />
              </Field>
              <Field label="Country">
                <select className={inputCls} value={cfg.address.country} onChange={(e) => setAddressField("country", e.target.value)}>
                  {COUNTRIES.map((c) => (
                    <option key={c.v} value={c.v}>
                      {c.l}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Owner's legal name">
                <input className={inputCls} value={cfg.ownerName} onChange={set("ownerName")} />
              </Field>
              <Field label="EIN" hint="Records only, not verified">
                <input className={inputCls} value={cfg.ein} onChange={set("ein")} placeholder="00-0000000" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input className={inputCls} value={cfg.phone} onChange={set("phone")} />
              </Field>
              <Field label="Email">
                <input className={inputCls} value={cfg.email} onChange={set("email")} />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Vertical">
              <select className={inputCls} value={cfg.vertical} onChange={set("vertical")}>
                {VERTICALS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            {cfg.vertical === "Liquor retail" && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Liquor license #">
                    <input className={inputCls} value={cfg.licenseNumber} onChange={set("licenseNumber")} />
                  </Field>
                  <Field label="License expiry">
                    <input type="date" className={inputCls} value={cfg.licenseExpiry} onChange={set("licenseExpiry")} />
                  </Field>
                </div>
              </div>
            )}
            <div className="mb-4">
              <span className="block text-sm font-medium text-stone-800 mb-2">Store hours</span>
              <div className="rounded-md border border-stone-200 divide-y divide-stone-100">
                {cfg.hours.map((h) => (
                  <div key={h.day} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="w-10 font-medium text-stone-700">{h.day}</span>
                    <label className="flex items-center gap-1.5 text-xs text-stone-500 w-20 shrink-0">
                      <input type="checkbox" checked={h.closed} onChange={(e) => updateDayHours(h.day, "closed", e.target.checked)} />
                      Closed
                    </label>
                    {!h.closed && (
                      <>
                        <select className={inputCls + " py-1.5"} value={h.open} onChange={(e) => updateDayHours(h.day, "open", e.target.value)}>
                          {TIME_OPTIONS.map((t) => (
                            <option key={t.v} value={t.v}>
                              {t.l}
                            </option>
                          ))}
                        </select>
                        <span className="text-stone-400">to</span>
                        <select className={inputCls + " py-1.5"} value={h.close} onChange={(e) => updateDayHours(h.day, "close", e.target.value)}>
                          {TIME_OPTIONS.map((t) => (
                            <option key={t.v} value={t.v}>
                              {t.l}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    {h.closed && <span className="text-stone-400 italic">Closed all day</span>}
                  </div>
                ))}
              </div>
            </div>
            <Field label="Holiday hours" hint="Prevents the voice agent having no answer for holiday-hours questions">
              <select className={inputCls} value={cfg.holidaySchedule} onChange={set("holidaySchedule")}>
                <option value="same">Same as regular hours</option>
                <option value="closed">Closed on holidays</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Timezone"
                hint={tzAutoApplied ? "Auto-suggested from your address — change if wrong" : "Used for daily checks and alert timing"}
              >
                <select className={inputCls} value={cfg.timezone} onChange={set("timezone")}>
                  {TIMEZONES.map((t) => (
                    <option key={t.v} value={t.v}>
                      {t.l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Payment methods accepted">
                <input className={inputCls} value={cfg.paymentMethods} onChange={set("paymentMethods")} />
              </Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Sales tax rate (%)">
              <input className={inputCls} value={cfg.taxRate} onChange={set("taxRate")} />
            </Field>
            <Field label="Monthly rent ($)">
              <input className={inputCls} value={cfg.rent} onChange={set("rent")} />
            </Field>
            <div className="mb-2">
              <span className="block text-sm font-medium text-stone-800 mb-2">Monthly utilities</span>
              {cfg.utilities.map((u, i) => (
                <div key={i} className="grid grid-cols-[1fr,140px,32px] gap-2 mb-2 items-center">
                  <input className={inputCls} placeholder="e.g. Electric" value={u.name} onChange={(e) => updateUtility(i, "name", e.target.value)} />
                  <input className={inputCls} placeholder="$" value={u.amount} onChange={(e) => updateUtility(i, "amount", e.target.value)} />
                  <button onClick={() => removeUtility(i)} className="text-stone-400 hover:text-red-600 text-sm" aria-label="Remove utility">
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={addUtility} className={btnSmall + " mt-1"}>
                <Plus size={14} />
                Add utility
              </button>
            </div>
            <div className="flex items-center justify-between rounded-md bg-stone-50 border border-stone-200 px-3 py-2 mt-3">
              <span className="text-sm text-stone-600">Total monthly overhead (rent + utilities)</span>
              <span className="text-sm font-semibold text-stone-900">${totalOverhead}</span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="How will you submit invoices?" hint="Select all that apply">
              <div className="space-y-2">
                {INVOICE_METHOD_OPTIONS.map((o) => (
                  <label key={o.v} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={cfg.invoiceMethods.includes(o.v)}
                      onChange={(e) => toggleInvoiceMethod(o.v, e.target.checked)}
                    />
                    {o.t}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Reorder approval style" hint="Default is approve-everything; auto-draft is opt-in">
              <select className={inputCls} value={cfg.approvalStyle} onChange={set("approvalStyle")}>
                <option value="always">Approve every reorder myself</option>
                <option value="threshold">Auto-draft under a dollar threshold</option>
              </select>
            </Field>
            {cfg.approvalStyle === "threshold" && (
              <Field label="Auto-draft threshold ($)" hint="Still drafted only, never placed without approval">
                <input className={inputCls} value={cfg.approvalThreshold} onChange={set("approvalThreshold")} />
              </Field>
            )}
            <div className="rounded-md bg-stone-50 border border-stone-200 p-4">
              <span className="block text-sm font-medium text-stone-800 mb-2">Default reorder quantity rule</span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Round up to nearest multiple of">
                  <input className={inputCls} value={cfg.reorderMultiple} onChange={set("reorderMultiple")} />
                </Field>
                <Field label="Unit type">
                  <select className={inputCls} value={cfg.reorderUnit} onChange={(e) => setCfg((c) => ({ ...c, reorderUnit: e.target.value as ReorderUnit }))}>
                    <option value="cases">Cases</option>
                    <option value="units">Individual units/pieces</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </Field>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                This is a store-wide default. Products that don't fit it — cigars sold individually, items with unusual packaging — can get
                their own rule per item once setup is complete; that level of detail isn't collected here to keep setup quick.
              </p>
            </div>
            <Field label="Backup approver (optional)">
              <input className={inputCls} value={cfg.backupApprover} onChange={set("backupApprover")} />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-sm text-stone-500 mb-4">
              Set a minimum margin per category — this is a hard floor. Pricing below it always needs an explicit, logged override.
            </p>
            {policy.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 mb-2">
                <input className={inputCls} value={row.category} onChange={(e) => updatePolicyRow(i, "category", e.target.value)} placeholder="Category" />
                <div className="relative">
                  <input className={inputCls} value={row.minMarginPct} onChange={(e) => updatePolicyRow(i, "minMarginPct", e.target.value)} />
                  <span className="absolute right-3 top-2 text-sm text-stone-400">%</span>
                </div>
              </div>
            ))}
            <button onClick={addPolicyRow} className={btnSmall + " mt-2"}>
              <Plus size={14} />
              Add category
            </button>
            <p className="text-xs text-stone-500 mt-3">
              This sets floors by category for now. Setting a different floor per individual item is a later step, once your inventory is
              loaded — not part of initial setup.
            </p>
          </>
        )}

        {step === 5 && (
          <>
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">Returns & refunds</p>
            <div className="grid grid-cols-1 gap-3 mb-4">
              <Field label="Return window (days)">
                <input className={inputCls} value={cfg.returnWindowDays} onChange={set("returnWindowDays")} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cfg.requireReceipt} onChange={setBool("requireReceipt")} /> Require proof of purchase
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cfg.requireInspection} onChange={setBool("requireInspection")} /> Require physical inspection
                before approving
              </label>
            </div>
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">Expiry response default</p>
            <Field label="When something's flagged as expiring at risk">
              <select className={inputCls} value={cfg.expiryDefault} onChange={set("expiryDefault")}>
                <option value="always_ask">Always ask me case-by-case</option>
                <option value="suggest_discount">Auto-suggest a discount for me to approve</option>
              </select>
            </Field>
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-2 mt-4">Alerts</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="WhatsApp number">
                <input className={inputCls} value={cfg.whatsapp} onChange={set("whatsapp")} />
              </Field>
              <Field label="Gmail address" hint="For invoice reading and notifications">
                <input className={inputCls} value={cfg.gmailAddress} onChange={set("gmailAddress")} />
              </Field>
            </div>
            <Field label={`Demand alert threshold: ${cfg.alertThreshold}+ asks`}>
              <input type="range" min={2} max={8} value={cfg.alertThreshold} onChange={set("alertThreshold")} className="w-full accent-amber-800" />
            </Field>
          </>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <p className="text-sm text-stone-500">Nothing below is live until you confirm at the bottom. Go back to any step to change something first.</p>

            <ReviewSection title="Business & owner">
              <ReviewRow label="Business" value={cfg.businessName || "—"} />
              <ReviewRow label="Storefront" value={cfg.dba || "(same as legal name)"} />
              <ReviewRow
                label="Address"
                value={
                  cfg.address.street
                    ? `${cfg.address.street}, ${cfg.address.city}, ${cfg.address.state} ${cfg.address.zip}, ${COUNTRIES.find((c) => c.v === cfg.address.country)?.l ?? cfg.address.country}`
                    : "—"
                }
              />
              <ReviewRow label="Owner" value={cfg.ownerName || "—"} />
              <ReviewRow label="EIN" value={cfg.ein || "—"} />
              <ReviewRow label="Contact" value={[cfg.phone, cfg.email].filter(Boolean).join(" · ") || "—"} />
            </ReviewSection>

            <ReviewSection title="Vertical, compliance & operations">
              <ReviewRow label="Vertical" value={cfg.vertical} />
              {cfg.vertical === "Liquor retail" && <ReviewRow label="License" value={`#${cfg.licenseNumber || "—"}, expires ${cfg.licenseExpiry || "—"}`} />}
              <ReviewRow label="Hours" value={formatHoursSummary(cfg.hours)} />
              <ReviewRow label="Holidays" value={cfg.holidaySchedule === "same" ? "Same as regular hours" : "Closed"} />
              <ReviewRow label="Timezone" value={TIMEZONES.find((t) => t.v === cfg.timezone)?.l || cfg.timezone} />
              <ReviewRow label="Payments accepted" value={cfg.paymentMethods} />
            </ReviewSection>

            <ReviewSection title="Financials">
              <ReviewRow label="Sales tax" value={`${cfg.taxRate}%`} />
              <ReviewRow label="Rent" value={`$${cfg.rent || 0}/mo`} />
              <ReviewRow label="Utilities" value={cfg.utilities.filter((u) => u.name).map((u) => `${u.name} $${u.amount || 0}`).join(", ") || "none listed"} />
              <ReviewRow label="Total monthly overhead" value={`$${totalOverhead}`} emphasize />
            </ReviewSection>

            <ReviewSection title="Invoices & procurement">
              <ReviewRow
                label="Invoice intake"
                value={cfg.invoiceMethods.length ? cfg.invoiceMethods.map((m) => INVOICE_METHOD_LABEL[m]).join(", ") : "none selected"}
              />
              <ReviewRow label="Reorder approval" value={cfg.approvalStyle === "always" ? "Every reorder needs my approval" : `Auto-draft under $${cfg.approvalThreshold}`} />
              <ReviewRow label="Reorder quantity rule" value={`Round up to nearest ${cfg.reorderMultiple} ${cfg.reorderUnit}`} />
              <ReviewRow label="Backup approver" value={cfg.backupApprover || "none set"} />
            </ReviewSection>

            <ReviewSection title="Category pricing floors">
              {policy.map((p, i) => (
                <ReviewRow key={i} label={p.category || "(unnamed)"} value={`${p.minMarginPct}% minimum`} />
              ))}
            </ReviewSection>

            <ReviewSection title="Returns, expiry & alerts">
              <ReviewRow label="Return window" value={`${cfg.returnWindowDays} days`} />
              <ReviewRow
                label="Requires"
                value={[cfg.requireReceipt && "proof of purchase", cfg.requireInspection && "physical inspection"].filter(Boolean).join(", ") || "no requirements set"}
              />
              <ReviewRow label="Expiry response" value={cfg.expiryDefault === "always_ask" ? "Always ask me" : "Auto-suggest a discount"} />
              <ReviewRow label="WhatsApp" value={cfg.whatsapp || "—"} />
              <ReviewRow label="Gmail" value={cfg.gmailAddress || "—"} />
              <ReviewRow label="Demand alert threshold" value={`${cfg.alertThreshold}+ asks`} />
            </ReviewSection>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-100">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={btnGhost + " disabled:opacity-30"}>
            <ChevronLeft size={16} /> Back
          </button>
          <button onClick={() => (isLast ? onComplete({ ...cfg, onboardingComplete: true }, policy) : setStep((s) => s + 1))} className={btnPrimary}>
            {isLast ? "Complete setup" : "Confirm & continue"} {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
