import React, { useState } from "react";
import { Printer, CheckCircle2, X, Ban } from "lucide-react";
import { isManagerUp } from "@/lib/permissions";
import VoidConfirmModal from "./VoidConfirmModal";

export default function Receipt({ transaction, storeName, onClose, user, onVoid }) {
  const [voidOpen, setVoidOpen] = useState(false);
  const date = transaction?.created_date ? new Date(transaction.created_date) : new Date();
  const ageItems = (transaction.items || []).filter((it) => it.age_restricted);
  const canVoid = isManagerUp(user?.role) && (transaction?.payment_status || "completed") === "completed";

  const handleVoidConfirm = async (reason) => {
    await onVoid(transaction, reason);
    setVoidOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">Sale completed</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 font-mono text-xs text-slate-700">
          <div className="text-center mb-4">
            <div className="font-bold text-sm">{storeName || "Qilbo Store"}</div>
            <div>123 Main Street</div>
            <div>{date.toLocaleString()}</div>
          </div>
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1">
            {(transaction.items || []).map((it, i) => (
              <div key={i} className="flex justify-between">
                <span className="truncate pr-2">{it.qty}× {it.name}</span>
                <span>${(it.price * it.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-slate-300 mt-3 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(transaction.subtotal).toFixed(2)}</span>
            </div>
            {(transaction.tax_breakdown && Object.values(transaction.tax_breakdown).some((v) => v > 0.001)) ? (
              Object.entries(transaction.tax_breakdown).filter(([, v]) => v > 0.001).map(([bucket, v]) => (
                <div key={bucket} className="flex justify-between">
                  <span>Tax — {bucket === "beer_wine" ? "Beer/Wine" : bucket.charAt(0).toUpperCase() + bucket.slice(1)}</span>
                  <span>${Number(v).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${Number(transaction.tax).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1">
              <span>TOTAL</span>
              <span>${Number(transaction.total).toFixed(2)}</span>
            </div>
          </div>
          {Number(transaction.deal_savings) > 0 && (
            <div className="border-t border-dashed border-slate-300 mt-3 pt-3 flex justify-between text-emerald-700">
              <span>You saved</span>
              <span>-${Number(transaction.deal_savings).toFixed(2)}</span>
            </div>
          )}
          {transaction.ebt_subtotal !== undefined && (
            <div className="border-t border-dashed border-slate-300 mt-3 pt-3 space-y-1">
              <div className="flex justify-between"><span>EBT-eligible</span><span>${Number(transaction.ebt_subtotal).toFixed(2)}</span></div>
              {Number(transaction.non_ebt_subtotal) > 0 && (
                <div className="flex justify-between"><span>Non-eligible</span><span>${Number(transaction.non_ebt_subtotal).toFixed(2)}</span></div>
              )}
            </div>
          )}
          <div className="border-t border-dashed border-slate-300 mt-3 pt-3 space-y-1">
            <div className="flex justify-between font-medium">
              <span>PAID BY {transaction.payment_method.toUpperCase()}</span>
              <span>${Number(transaction.total).toFixed(2)}</span>
            </div>
            {transaction.payment_method === "card" && (
              <>
                {transaction.last_four_digits && (
                  <div className="flex justify-between">
                    <span>Last 4</span>
                    <span>**** {transaction.last_four_digits}</span>
                  </div>
                )}
                {transaction.stripe_transaction_id && (
                  <div className="flex justify-between">
                    <span>Auth</span>
                    <span>{transaction.stripe_transaction_id.slice(-10).toUpperCase()}</span>
                  </div>
                )}
              </>
            )}
            {transaction.payment_method === "cash" && (
              <>
                <div className="flex justify-between">
                  <span>Tendered</span>
                  <span>${Number(transaction.cash_tendered).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change</span>
                  <span>${Number(transaction.change_given || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          {ageItems.length > 0 && (
            <div className="border-t border-dashed border-slate-300 mt-3 pt-3 font-bold">
              *** AGE-RESTRICTED ITEMS SOLD ***
              <div className="font-normal text-slate-500">Cashier: {(transaction.created_by_id || "").slice(-6).toUpperCase() || "—"}</div>
            </div>
          )}
          {transaction.id_scanned !== undefined && (
            <div className="border-t border-dashed border-slate-300 mt-3 pt-3">
              ID SCANNED: {transaction.id_scanned ? "YES" : "NO"}
            </div>
          )}
          {transaction.customer_name && (
            <div className="border-t border-dashed border-slate-300 mt-3 pt-3">
              Customer: {transaction.customer_name}
            </div>
          )}
          <div className="text-center mt-4 text-slate-500">
            <div>Thank you!</div>
            <div className="mt-1">Receipt #{transaction.id?.slice(-8).toUpperCase()}</div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            New Sale
          </button>
        </div>

        {canVoid && (
          <div className="px-4 pb-4">
            <button
              onClick={() => setVoidOpen(true)}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2"
            >
              <Ban className="w-4 h-4" /> Void this sale
            </button>
          </div>
        )}
      </div>

      {voidOpen && (
        <VoidConfirmModal
          action="void"
          user={user}
          onConfirm={handleVoidConfirm}
          onClose={() => setVoidOpen(false)}
        />
      )}
    </div>
  );
}