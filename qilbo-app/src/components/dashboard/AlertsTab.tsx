import { useState } from "react";
import { Bell } from "lucide-react";
import type { AppState } from "../../types";
import { evaluateDemandAlert } from "../../lib/businessLogic";
import { btnSmall, card, inputCls } from "../ui";

export default function AlertsTab({ state, updateState }: { state: AppState; updateState: (updater: (s: AppState) => AppState) => void }) {
  const [form, setForm] = useState({ product: "", carried: false });

  function logInquiry() {
    if (!form.product) return;
    const inquiries = [...state.inquiries, { id: "i" + Date.now(), product: form.product, date: new Date().toISOString().slice(0, 10), carried: form.carried }];
    const productInquiries = inquiries.filter((i) => i.product === form.product && !i.carried);
    const already = state.alertState[form.product] || 0;
    const { shouldAlert, newAlertStateCount } = form.carried
      ? { shouldAlert: false, newAlertStateCount: already }
      : evaluateDemandAlert(productInquiries.length, already, Number(state.config.alertThreshold));
    const newAlerts = shouldAlert
      ? [
          ...state.alerts,
          {
            id: "a" + Date.now(),
            type: "demand" as const,
            message: `${form.product} asked about ${productInquiries.length} times, not carried — worth stocking?`,
            date: new Date().toISOString().slice(0, 10),
          },
        ]
      : state.alerts;
    updateState((s) => ({
      ...s,
      inquiries,
      alerts: newAlerts,
      alertState: { ...s.alertState, [form.product]: newAlertStateCount },
    }));
    setForm({ product: "", carried: false });
  }

  const grouped: Record<string, { count: number; carried: boolean }> = {};
  state.inquiries.forEach((i) => {
    grouped[i.product] = grouped[i.product] || { count: 0, carried: i.carried };
    grouped[i.product].count += 1;
  });

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Log a customer inquiry</h3>
        <div className="flex gap-2 items-center">
          <input className={inputCls} placeholder="Product asked about" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
          <label className="flex items-center gap-1 text-xs whitespace-nowrap">
            <input type="checkbox" checked={form.carried} onChange={(e) => setForm({ ...form, carried: e.target.checked })} /> we carry this
          </label>
          <button onClick={logInquiry} className={btnSmall}>
            Log
          </button>
        </div>
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Inquiry patterns</h3>
        {Object.keys(grouped).length === 0 && <p className="text-stone-400 italic text-sm">None logged yet.</p>}
        {Object.entries(grouped).map(([product, g]) => (
          <div key={product} className="flex items-center justify-between text-sm py-1.5 border-b border-stone-50">
            <span>
              {product}
              {g.carried ? "" : " (not carried)"}
            </span>
            <span className="text-stone-500">{g.count} asks</span>
          </div>
        ))}
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Bell size={15} />
          WhatsApp-style alert feed
        </h3>
        {state.alerts.length === 0 && <p className="text-stone-400 italic text-sm">No alerts fired yet — threshold is {state.config.alertThreshold}+ asks.</p>}
        {state.alerts
          .slice()
          .reverse()
          .map((a) => (
            <div key={a.id} className="text-sm py-2 border-b border-stone-50">
              <span className="text-xs text-stone-400 font-mono block">{a.date}</span>
              {a.message}
            </div>
          ))}
      </div>
    </div>
  );
}
