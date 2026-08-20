import { RotateCcw } from "lucide-react";
import type { AppState } from "../../types";
import { SAMPLE_INQUIRIES, SAMPLE_PRODUCTS, SAMPLE_SALES } from "../../lib/sampleData";
import { btnSmall, card } from "../ui";

export default function SettingsTab({
  state,
  updateState,
  onReset,
}: {
  state: AppState;
  updateState: (updater: (s: AppState) => AppState) => void;
  onReset: () => void;
}) {
  function loadSample() {
    updateState((s) => ({ ...s, products: SAMPLE_PRODUCTS, sales: SAMPLE_SALES, inquiries: SAMPLE_INQUIRIES }));
  }

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Configuration</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1 text-stone-500 pr-4">Business</td>
              <td>{state.config.businessName || "-"}</td>
            </tr>
            <tr>
              <td className="py-1 text-stone-500 pr-4">Vertical</td>
              <td>{state.config.vertical}</td>
            </tr>
            <tr>
              <td className="py-1 text-stone-500 pr-4">Approval style</td>
              <td>{state.config.approvalStyle === "always" ? "Every reorder" : `Auto-draft under $${state.config.approvalThreshold}`}</td>
            </tr>
            <tr>
              <td className="py-1 text-stone-500 pr-4">Return policy</td>
              <td>
                {state.config.returnWindowDays}-day window, receipt {state.config.requireReceipt ? "required" : "not required"}, inspection{" "}
                {state.config.requireInspection ? "required" : "not required"}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-stone-500 pr-4">Alert threshold</td>
              <td>{state.config.alertThreshold}+ asks</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Prototype data</h3>
        <p className="text-xs text-stone-500 mb-3">
          Load the same sample scenarios used to test the real skill set (Hennessy/Patron/Grey Goose margins, Corona/Modelo/Baileys expiry,
          Casamigos demand pattern) to explore the logic quickly.
        </p>
        <div className="flex gap-2">
          <button onClick={loadSample} className={btnSmall}>
            Load sample data
          </button>
          <button onClick={onReset} className={btnSmall + " text-red-700 border-red-200"}>
            <RotateCcw size={13} />
            Reset everything
          </button>
        </div>
      </div>
    </div>
  );
}
