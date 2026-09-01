import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

export default function VoidConfirmModal({ action, user, onConfirm, onClose }) {
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!user?.manager_pin) {
      setError("No manager PIN set — ask an owner to set one in Users.");
      return;
    }
    if (pin !== user.manager_pin) {
      setError("Invalid PIN");
      return;
    }
    setBusy(true);
    try {
      await onConfirm(reason);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> {action === "void" ? "Void Sale" : "Refund Sale"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-500">
            Enter your manager PIN to confirm. Inventory will be restored and the sale kept on record.
          </p>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Manager PIN</label>
            <input
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="form-input mt-1"
              placeholder="••••"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reason (optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input mt-1"
              placeholder="e.g. customer returned item"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Cancel</button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-40"
          >
            {busy ? "Processing…" : `Confirm ${action === "void" ? "Void" : "Refund"}`}
          </button>
        </div>
      </div>
    </div>
  );
}