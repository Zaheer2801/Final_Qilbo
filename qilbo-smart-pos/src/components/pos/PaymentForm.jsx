import React, { useState } from "react";
import { Banknote, CreditCard, Wallet, Check, ShieldAlert } from "lucide-react";

const methods = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "ebt", label: "EBT", icon: Wallet },
];

const quickCash = [20, 50, 100];

export default function PaymentForm({ total, onConfirm, processing, ageRequired, idScanRequired, nonEbtSubtotal = 0 }) {
  const [method, setMethod] = useState("cash");
  const [tendered, setTendered] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [idScanned, setIdScanned] = useState(false);
  const [cardState, setCardState] = useState("idle");
  const [lastFour, setLastFour] = useState("");

  const startCard = () => {
    setCardState("processing");
    setTimeout(() => {
      setLastFour(String(Math.floor(1000 + Math.random() * 9000)));
      setCardState("approved");
    }, 1500);
  };

  const change = method === "cash" && tendered ? Math.max(0, parseFloat(tendered) - total) : 0;
  const ebtBlocked = method === "ebt" && nonEbtSubtotal > 0;
  const canConfirm =
    !processing &&
    total > 0 &&
    (!ageRequired || ageVerified) &&
    !ebtBlocked &&
    (method !== "cash" || parseFloat(tendered) >= total) &&
    (method !== "card" || cardState === "approved");

  const handleConfirm = () => {
    onConfirm({
      method,
      cash_tendered: method === "cash" ? parseFloat(tendered) : undefined,
      change_given: method === "cash" ? change : undefined,
      age_verified: ageVerified,
      id_scanned: idScanned,
      last_four_digits: method === "card" ? lastFour : undefined,
      stripe_transaction_id: method === "card" ? "card_" + Math.random().toString(36).slice(2, 10) : undefined,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800">Payment</h2>
        <p className="text-xs text-slate-400">Amount due</p>
        <p className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</p>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {ageRequired && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-2">
              <ShieldAlert className="w-4 h-4" /> Age-restricted items in cart
            </div>
            <label className="flex items-center gap-2 text-sm text-red-700">
              <input
                type="checkbox"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                className="rounded"
              />
              I have verified the customer is 21+
            </label>
            {idScanRequired && (
              <label className="flex items-center gap-2 text-sm text-red-700 mt-2">
                <input
                  type="checkbox"
                  checked={idScanned}
                  onChange={(e) => setIdScanned(e.target.checked)}
                  className="rounded"
                />
                ID scanned / on file
              </label>
            )}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Method</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {methods.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMethod(id); setCardState("idle"); }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                  method === id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {method === "cash" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cash received</label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={tendered}
                  onChange={(e) => setTendered(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {quickCash.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTendered(String(amt))}
                  className="flex-1 py-2 rounded-lg bg-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-200"
                >
                  ${amt}
                </button>
              ))}
              <button
                onClick={() => setTendered(total.toFixed(2))}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                Exact
              </button>
            </div>
            {tendered && parseFloat(tendered) >= total && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50">
                <span className="text-sm text-emerald-700 font-medium">Change due</span>
                <span className="text-xl font-bold text-emerald-700">${change.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {method === "card" && (
          <div className="p-4 rounded-xl bg-slate-50 text-center text-sm text-slate-500 space-y-3">
            {cardState === "idle" && (
              <>
                <CreditCard className="w-6 h-6 mx-auto text-slate-400" />
                <p>Insert, tap, or swipe card on the terminal.</p>
                <button onClick={startCard} className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800">
                  Process ${total.toFixed(2)} payment
                </button>
              </>
            )}
            {cardState === "processing" && (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                <p>Processing card…</p>
              </div>
            )}
            {cardState === "approved" && (
              <div className="flex flex-col items-center gap-1 py-2 text-emerald-600">
                <Check className="w-6 h-6" />
                <p className="font-medium">Payment accepted</p>
                <p className="text-xs text-slate-400">Card ending {lastFour}</p>
              </div>
            )}
          </div>
        )}
        {method === "ebt" && (
          <div className="p-4 rounded-xl bg-slate-50 text-center text-sm text-slate-500 space-y-3">
            <Wallet className="w-6 h-6 mx-auto text-slate-400" />
            {ebtBlocked ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-left">
                <div className="font-medium flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> EBT can't cover ${nonEbtSubtotal.toFixed(2)}</div>
                <div className="text-xs mt-1">Remove non-eligible items or split the payment.</div>
              </div>
            ) : (
              <p>Process EBT on the terminal, then confirm.</p>
            )}
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-200">
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="w-full py-4 rounded-xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              Complete Sale
            </>
          )}
        </button>
      </div>
    </div>
  );
}