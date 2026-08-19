import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ProductSearch from "@/components/pos/ProductSearch";
import Cart from "@/components/pos/Cart";
import PaymentForm from "@/components/pos/PaymentForm";
import Receipt from "@/components/pos/Receipt";
import WeightModal from "@/components/pos/WeightModal";
import { User, Search as SearchIcon } from "lucide-react";
import { bucketForProduct, rateForProduct, defaultSettings, getCategoryType, unitLabel, dealLineTotal } from "@/lib/categories";
import { voidOrRefundTransaction } from "@/lib/voidAction";

const TAX_RATE = 0.08;

export default function POS() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("cart"); // cart | pay
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [weightProduct, setWeightProduct] = useState(null);
  const [settings, setSettings] = useState(defaultSettings());
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Product.filter({ active: true }, "-name", 200);
      setProducts(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    (async () => {
      try {
        const s = await base44.entities.Settings.list("-updated_date", 1);
        if (s.length) setSettings({ ...defaultSettings(), ...s[0] });
      } catch {}
      try { setUser(await base44.auth.me()); } catch {}
      try {
        const stores = await base44.entities.Store.list("-created_date", 1);
        if (stores.length) setStore(stores[0]);
      } catch {}
    })();
  }, [loadProducts]);

  const addToCart = (product, weight) => {
    const weighted = product.weight_type && product.weight_type !== "fixed";
    const qty = weighted ? Number(weight) : 1;
    setCart((prev) => {
      if (!weighted) {
        const existing = prev.find((i) => i.uid === product.id);
        if (existing) {
          return prev.map((i) => (i.uid === product.id ? { ...i, qty: Math.min(i.qty + 1, product.quantity_on_hand) } : i));
        }
      }
      return [...prev, { uid: weighted ? `${product.id}-${Date.now()}` : product.id, id: product.id, name: product.name, price: Number(product.price), cost: Number(product.cost) || 0, category: product.category, category_type: product.category_type || "retail", qty, unit: weighted ? unitLabel(product.weight_type) : "ea", weight_type: product.weight_type, taxable: product.taxable, age_restricted: !!product.age_restricted, ebt_eligible: !!product.ebt_eligible, deal: product.deal }];
    });
  };

  const handleAdd = (product) => {
    if (product.weight_type && product.weight_type !== "fixed") { setWeightProduct(product); return; }
    addToCart(product);
  };

  const incItem = (it) => {
    if (it.unit && it.unit !== "ea") return;
    setCart((prev) => prev.map((i) => (i.uid === it.uid ? { ...i, qty: i.qty + 1 } : i)));
  };
  const decItem = (it) =>
    setCart((prev) =>
      (it.unit && it.unit !== "ea")
        ? prev.filter((i) => i.uid !== it.uid)
        : prev.map((i) => (i.uid === it.uid ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    );
  const removeItem = (it) => setCart((prev) => prev.filter((i) => i.uid !== it.uid));
  const clearCart = () => { setCart([]); setCustomer(null); };

  const lineTotals = cart.map(dealLineTotal);
  const subtotal = lineTotals.reduce((s, l) => s + l.lineTotal, 0);
  const totalSavings = lineTotals.reduce((s, l) => s + l.savings, 0);
  const categorySubtotals = {};
  cart.forEach((i, idx) => { const ct = i.category_type || "retail"; categorySubtotals[ct] = (categorySubtotals[ct] || 0) + lineTotals[idx].lineTotal; });
  const taxByBucket = {};
  cart.forEach((i, idx) => {
    if (i.taxable === false) return;
    const b = bucketForProduct(i);
    taxByBucket[b] = (taxByBucket[b] || 0) + lineTotals[idx].lineTotal * rateForProduct(i, settings);
  });
  const tax = Object.values(taxByBucket).reduce((s, v) => s + v, 0);
  const total = subtotal + tax;
  const ebtSubtotal = cart.reduce((s, i, idx) => s + (i.ebt_eligible ? lineTotals[idx].lineTotal : 0), 0);
  const nonEbtSubtotal = subtotal - ebtSubtotal;
  const ageRequired = cart.some((i) => i.age_restricted || getCategoryType(i.category_type)?.ageRestricted);
  const idScanRequired = cart.some((i) => getCategoryType(i.category_type)?.idScan);

  const handleConfirmPayment = async ({ method, cash_tendered, change_given, last_four_digits, stripe_transaction_id, id_scanned }) => {
    setProcessing(true);
    try {
      const txn = await base44.entities.Transaction.create({
        total: Number(total.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        tax_breakdown: Object.fromEntries(Object.entries(taxByBucket).map(([k, v]) => [k, Number(v.toFixed(2))])),
        discount: 0,
        payment_method: method,
        payment_status: "completed",
        last_four_digits: last_four_digits || undefined,
        stripe_transaction_id: stripe_transaction_id || undefined,
        employee_id: user?.id,
        customer_id: customer?.id || undefined,
        customer_name: customer ? `${customer.first_name} ${customer.last_name}`.trim() : undefined,
        items: cart.map((i) => ({ product_id: i.id, name: i.name, qty: i.qty, price: i.price, unit: i.unit, category_type: i.category_type, age_restricted: !!i.age_restricted, ebt_eligible: !!i.ebt_eligible, deal: i.deal })),
        id_scanned: idScanRequired ? !!id_scanned : undefined,
        category_subtotals: Object.fromEntries(Object.entries(categorySubtotals).map(([k, v]) => [k, Number(v.toFixed(2))])),
        ebt_subtotal: Number(ebtSubtotal.toFixed(2)),
        non_ebt_subtotal: Number(nonEbtSubtotal.toFixed(2)),
        deal_savings: Number(totalSavings.toFixed(2)),
        cash_tendered: cash_tendered ? Number(cash_tendered.toFixed(2)) : undefined,
        change_given: change_given ? Number(change_given.toFixed(2)) : undefined,
      });

      // Deduct inventory
      await base44.entities.Product.bulkUpdate(
        cart.map((i) => ({ id: i.id, quantity_on_hand: Math.max(0, (products.find((p) => p.id === i.id)?.quantity_on_hand ?? 0) - i.qty) }))
      );

      // Loyalty points: 1 point per $1 spent
      if (customer) {
        const points = Math.floor(total);
        await base44.entities.Customer.update(customer.id, {
          loyalty_points: (customer.loyalty_points || 0) + points,
          total_lifetime_spend: (customer.total_lifetime_spend || 0) + Number(total.toFixed(2)),
          total_transactions: (customer.total_transactions || 0) + 1,
        });
      }

      setReceipt(txn);
      setCart([]);
      setCustomer(null);
      setView("cart");
      await loadProducts();
    } finally {
      setProcessing(false);
    }
  };

  const handleVoid = async (txn, reason) => {
    await voidOrRefundTransaction({ txn, action: "void", user, storeId: store?.id, reason, products });
    await loadProducts();
    setReceipt(null);
    alert(`Sale #${txn.id.slice(-6).toUpperCase()} voided. Inventory restored.`);
  };

  return (
    <div className="flex h-full">
      {/* Left: product search */}
      <div className="flex-1 flex flex-col bg-white border-r border-slate-200 min-w-0">
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Point of Sale</h1>
            <p className="text-xs text-slate-400">{products.length} products loaded</p>
          </div>
          <button
            onClick={() => setCustomerSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            <User className="w-4 h-4" />
            {customer ? `${customer.first_name} ${customer.last_name}`.trim() : "Add customer"}
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ProductSearch products={products} onAdd={handleAdd} loading={loading} />
        </div>
      </div>

      {/* Right: cart / payment */}
      <div className="w-full max-w-sm flex flex-col bg-slate-50 shrink-0">
        {view === "cart" ? (
          <>
            <Cart
              items={cart}
              onInc={incItem}
              onDec={decItem}
              onRemove={removeItem}
              onClear={clearCart}
              subtotal={subtotal}
              tax={tax}
              total={total}
              taxByBucket={taxByBucket}
              taxRate={TAX_RATE}
              totalSavings={totalSavings}
              ebtSubtotal={ebtSubtotal}
              nonEbtSubtotal={nonEbtSubtotal}
            />
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => setView("pay")}
                disabled={cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
              >
                Charge ${total.toFixed(2)}
              </button>
            </div>
          </>
        ) : (
          <>
            <PaymentForm total={total} onConfirm={handleConfirmPayment} processing={processing} ageRequired={ageRequired} idScanRequired={idScanRequired} nonEbtSubtotal={nonEbtSubtotal} />
            <div className="px-5 pb-4">
              <button
                onClick={() => setView("cart")}
                className="w-full py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-700"
              >
                Back to cart
              </button>
            </div>
          </>
        )}
      </div>

      {receipt && <Receipt transaction={receipt} onClose={() => setReceipt(null)} user={user} onVoid={handleVoid} />}

      {weightProduct && (
        <WeightModal
          product={weightProduct}
          onConfirm={(w) => { addToCart(weightProduct, w); setWeightProduct(null); }}
          onClose={() => setWeightProduct(null)}
        />
      )}

      {customerSearchOpen && (
        <CustomerLookup
          onClose={() => setCustomerSearchOpen(false)}
          onSelect={(c) => { setCustomer(c); setCustomerSearchOpen(false); }}
          onClear={() => { setCustomer(null); setCustomerSearchOpen(false); }}
          current={customer}
        />
      )}
    </div>
  );
}

function CustomerLookup({ onClose, onSelect, onClear, current }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (query) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const all = await base44.entities.Customer.list(50);
      const ql = query.toLowerCase();
      setResults(all.filter((c) =>
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(ql) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(ql)
      ));
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Link customer</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => { setQ(e.target.value); search(e.target.value); }}
              placeholder="Search by name, phone, or email…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
          {current && (
            <button
              onClick={onClear}
              className="w-full text-left p-3 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500 hover:bg-slate-50"
            >
              No customer (walk-in)
            </button>
          )}
          {loading && <div className="text-center text-sm text-slate-400 py-4">Searching…</div>}
          {!loading && results.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
            >
              <div className="font-medium text-slate-800 text-sm">{c.first_name} {c.last_name}</div>
              <div className="text-xs text-slate-400 flex justify-between">
                <span>{c.phone || c.email}</span>
                <span className="text-emerald-600">{c.loyalty_points || 0} pts</span>
              </div>
            </button>
          ))}
          {!loading && q && results.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-4">No customers found</div>
          )}
        </div>
      </div>
    </div>
  );
}