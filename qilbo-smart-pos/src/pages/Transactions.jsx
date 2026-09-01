import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { voidOrRefundTransaction } from "@/lib/voidAction";
import { isManagerUp } from "@/lib/permissions";
import VoidConfirmModal from "@/components/pos/VoidConfirmModal";
import { Receipt as ReceiptIcon, X, RotateCcw } from "lucide-react";

const STATUS_COLOR = {
  completed: "bg-emerald-100 text-emerald-700",
  voided: "bg-red-100 text-red-700",
  refunded: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-600",
};

export default function Transactions() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        base44.entities.Transaction.list("-created_date", 50),
        base44.entities.Product.list("-updated_date", 200),
      ]);
      setTxns(t);
      setProducts(p);
      try { setEmployees(await base44.entities.User.list("-created_date", 100)); } catch {}
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const empName = (id) => employees.find((e) => e.id === id)?.full_name || "—";
  const shown = filter === "all" ? txns : txns.filter((t) => (t.payment_status || "completed") === filter);

  const handleRefund = async (reason) => {
    await voidOrRefundTransaction({ txn: selected, action: "refund", user, reason, products });
    const id = selected.id;
    setRefundOpen(false);
    setSelected(null);
    await load();
    alert(`Sale #${id.slice(-6).toUpperCase()} refunded. Inventory restored.`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Recent Sales</h1>
        <p className="text-sm text-slate-400">{txns.length} transactions · refunds need a manager PIN</p>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "completed", "voided", "refunded"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : shown.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ReceiptIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No transactions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date / Time</th>
                  <th className="text-left px-4 py-3 font-medium">Receipt</th>
                  <th className="text-left px-4 py-3 font-medium">Employee</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shown.map((t) => {
                  const status = t.payment_status || "completed";
                  return (
                    <tr key={t.id} onClick={() => setSelected(t)} className="hover:bg-slate-50/50 cursor-pointer">
                      <td className="px-4 py-3 text-slate-600">{new Date(t.created_date).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">#{t.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-slate-600">{empName(t.employee_id)}</td>
                      <td className="px-4 py-3 text-right font-medium">${Number(t.total).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[status]}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <TransactionDetail
          txn={selected}
          empName={empName}
          onClose={() => setSelected(null)}
          onRefund={() => setRefundOpen(true)}
          user={user}
        />
      )}
      {refundOpen && (
        <VoidConfirmModal action="refund" user={user} onConfirm={handleRefund} onClose={() => setRefundOpen(false)} />
      )}
    </div>
  );
}

function TransactionDetail({ txn, empName, onClose, onRefund, user }) {
  const status = txn.payment_status || "completed";
  const canRefund = isManagerUp(user?.role) && status === "completed";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Receipt #{txn.id.slice(-8).toUpperCase()}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Date</span><span>{new Date(txn.created_date).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Employee</span><span>{empName(txn.employee_id)}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Payment</span><span className="capitalize">{txn.payment_method}</span></div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[status]}`}>{status}</span>
          </div>
          {txn.void_reason && <div className="flex justify-between"><span className="text-slate-400">Reason</span><span>{txn.void_reason}</span></div>}
          <div className="border-t border-slate-100 pt-3 space-y-1">
            {(txn.items || []).map((it, i) => (
              <div key={i} className="flex justify-between"><span>{it.qty}× {it.name}</span><span>${(it.price * it.qty).toFixed(2)}</span></div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-2 flex justify-between font-semibold"><span>Total</span><span>${Number(txn.total).toFixed(2)}</span></div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Close</button>
          {canRefund && (
            <button onClick={onRefund} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Refund this sale
            </button>
          )}
        </div>
      </div>
    </div>
  );
}