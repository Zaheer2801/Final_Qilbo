import { base44 } from "@/api/base44Client";

export async function voidOrRefundTransaction({ txn, action, user, storeId, reason, products }) {
  const items = txn.items || [];
  if (items.length > 0) {
    await base44.entities.Product.bulkUpdate(
      items.map((it) => {
        const p = products.find((x) => x.id === it.product_id);
        return { id: it.product_id, quantity_on_hand: (p?.quantity_on_hand ?? 0) + (it.qty || 0) };
      })
    );
  }
  await base44.entities.Transaction.update(txn.id, {
    payment_status: action === "void" ? "voided" : "refunded",
    void_reason: reason || undefined,
    voided_by: user?.id,
    voided_at: new Date().toISOString(),
  });
  await base44.entities.VoidLog.create({
    transaction_id: txn.id,
    transaction_total: txn.total,
    action,
    voided_by: user?.id,
    voided_by_name: user?.full_name,
    reason: reason || undefined,
    store_id: storeId,
  });
}