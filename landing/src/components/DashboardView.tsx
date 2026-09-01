import { useState } from "react";
import { LayoutDashboard, Package, Receipt, DollarSign, AlertTriangle, Bell, Settings, ArrowLeft, Plus, CheckCircle, TrendingUp, AlertCircle, FileText, Upload, ShieldCheck } from "lucide-react";
import InvoiceIntakeModal, { type InvoiceLineParsed } from "./InvoiceIntakeModal";

export type DashboardViewProps = {
  storeName?: string;
  onBackToLanding: () => void;
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "invoices", label: "Invoices & Intake", icon: FileText },
  { id: "procurement", label: "Procurement", icon: Receipt },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "expiry", label: "Expiry", icon: AlertTriangle },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const INITIAL_PRODUCTS = [
  { id: "P101", name: "Hennessy VS Cognac", brand: "Hennessy", category: "Spirits & Liquor", size: "750ml", qty: 24, minMargin: 28, cost: 34.50, price: 49.99, expiry: "2028-12-31", status: "Healthy" },
  { id: "P102", name: "Casamigos Reposado Tequila", brand: "Casamigos", category: "Spirits & Liquor", size: "750ml", qty: 8, minMargin: 30, cost: 42.00, price: 62.99, expiry: "2027-06-30", status: "Low Stock" },
  { id: "P103", name: "Veuve Clicquot Brut Champagne", brand: "Veuve Clicquot", category: "Wine & Champagne", size: "750ml", qty: 15, minMargin: 35, cost: 48.00, price: 74.99, expiry: "2026-11-15", status: "Healthy" },
  { id: "P104", name: "Caymus Napa Valley Cabernet", brand: "Caymus", category: "Wine & Champagne", size: "750ml", qty: 4, minMargin: 35, cost: 65.00, price: 99.99, expiry: "2026-09-30", status: "Low Stock" },
  { id: "P105", name: "Macallan 12 Year Single Malt", brand: "Macallan", category: "Spirits & Liquor", size: "750ml", qty: 12, minMargin: 28, cost: 58.00, price: 84.99, expiry: "2029-01-01", status: "Healthy" },
];

export default function DashboardView({ storeName = "Discount Liquor #83954", onBackToLanding }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductQty, setNewProductQty] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [invoicesHistory, setInvoicesHistory] = useState([
    {
      id: "INV-523219",
      vendor: "Wayne Densch, Inc.",
      invoiceNo: "523219",
      date: "2026-08-31",
      totalNet: 1103.75,
      linesCount: 6,
      creditAlert: 31.45,
      status: "Reconciled",
    },
  ]);

  const handleCommitInvoice = (invNo: string, vendor: string, lines: InvoiceLineParsed[], credit: number) => {
    const totalNet = lines.reduce((sum, l) => sum + l.lineNet, 0);
    const newInv = {
      id: `INV-${invNo}`,
      vendor,
      invoiceNo: invNo,
      date: new Date().toISOString().split("T")[0],
      totalNet: Number(totalNet.toFixed(2)),
      linesCount: lines.length,
      creditAlert: credit,
      status: "Reconciled",
    };
    setInvoicesHistory([newInv, ...invoicesHistory]);

    // Update stock levels from units received
    lines.forEach((line) => {
      if (line.unitsReceived > 0) {
        setProducts((prev) => {
          const match = prev.find((p) => p.name.toLowerCase().includes(line.description.split(" ")[0].toLowerCase()));
          if (match) {
            return prev.map((p) => (p.id === match.id ? { ...p, qty: p.qty + line.unitsReceived } : p));
          }
          return prev;
        });
      }
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;
    const newProd = {
      id: `P${106 + products.length}`,
      name: newProductName,
      brand: "Custom",
      category: "Spirits & Liquor",
      size: "750ml",
      qty: Number(newProductQty) || 12,
      minMargin: 28,
      cost: Number(newProductPrice) * 0.7 || 20,
      price: Number(newProductPrice) || 29.99,
      expiry: "2027-12-31",
      status: "Healthy",
    };
    setProducts([newProd, ...products]);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductQty("");
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#171310] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-[#171310]/10 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#171310]/15 text-xs font-semibold text-ink/80 hover:bg-black/5 transition-all"
          >
            <ArrowLeft size={14} /> Back to Landing Page
          </button>
          <div className="h-5 w-px bg-ink/15 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-xs font-display">
              Q
            </div>
            <span className="font-display font-bold text-base tracking-tight text-ink">{storeName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-300/60 text-xs font-semibold hover:bg-amber-200 shadow-2xs transition-all cursor-pointer"
          >
            <Upload size={14} /> Upload Receipt / Invoice
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#171310]/10 p-4 space-y-1 shrink-0 hidden md:block">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink/40">Inventory Dashboard</div>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-100/90 text-amber-900 shadow-xs"
                    : "text-ink/70 hover:bg-black/5 hover:text-ink"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Mobile Tab Select */}
        <div className="md:hidden bg-white border-b border-[#171310]/10 p-3 flex overflow-x-auto gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === tab.id ? "bg-amber-800 text-white" : "bg-black/5 text-ink/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#171310]/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-ink/60 text-xs font-medium">
                    <span>Total SKU Count</span>
                    <Package size={16} className="text-amber-800" />
                  </div>
                  <div className="text-2xl font-bold text-ink">{products.length} Items</div>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                    <TrendingUp size={12} /> 100% Margin Guardrails Active
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#171310]/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-ink/60 text-xs font-medium">
                    <span>Inventory Value</span>
                    <DollarSign size={16} className="text-amber-800" />
                  </div>
                  <div className="text-2xl font-bold text-ink">$4,120.50</div>
                  <div className="text-[11px] text-ink/50">Calculated from wholesale costs</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#171310]/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-ink/60 text-xs font-medium">
                    <span>Low Stock Flags</span>
                    <AlertCircle size={16} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-700">2 Items</div>
                  <div className="text-[11px] text-amber-800/80 font-medium">Reorder recommended</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#171310]/10 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-ink/60 text-xs font-medium">
                    <span>Expiry Risk Prevention</span>
                    <CheckCircle size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-800">$1,850 Protected</div>
                  <div className="text-[11px] text-emerald-700 font-medium">0 expired items</div>
                </div>
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-2xl border border-[#171310]/10 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#171310]/10 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-ink">Active Store Inventory</h3>
                  <span className="text-xs text-ink/50">{products.length} Products Loaded</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-ink/60 border-b border-[#171310]/10">
                      <tr>
                        <th className="px-6 py-3 font-semibold">SKU ID</th>
                        <th className="px-6 py-3 font-semibold">Product Name</th>
                        <th className="px-6 py-3 font-semibold">Category</th>
                        <th className="px-6 py-3 font-semibold">Stock Qty</th>
                        <th className="px-6 py-3 font-semibold">Price</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171310]/5">
                      {products.map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="px-6 py-3.5 font-mono text-ink/60 font-medium">{item.id}</td>
                          <td className="px-6 py-3.5 font-semibold text-ink">{item.name}</td>
                          <td className="px-6 py-3.5 text-ink/70">{item.category}</td>
                          <td className="px-6 py-3.5 font-bold text-ink">{item.qty} units</td>
                          <td className="px-6 py-3.5 font-semibold text-amber-900">${item.price.toFixed(2)}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.status === "Low Stock" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Inventory */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Inventory Management</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900"
                >
                  + Add New Product
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-[#171310]/10 p-6 space-y-4">
                <p className="text-xs text-ink/60">Manage product quantities, cost prices, selling prices, and floor margins.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-ink/10 bg-[#FAF8F5] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-ink/40">{p.id}</span>
                        <span className="text-xs font-bold text-amber-900">${p.price.toFixed(2)}</span>
                      </div>
                      <div className="font-bold text-sm text-ink">{p.name}</div>
                      <div className="text-xs text-ink/60">Category: {p.category}</div>
                      <div className="flex items-center justify-between pt-2 border-t border-ink/5 text-xs">
                        <span>Stock: <strong>{p.qty}</strong></span>
                        <span className="text-emerald-700 font-semibold">Min Margin: {p.minMargin}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Invoices & Intake */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-ink">Distributor Invoices & Receipt Intake</h2>
                  <p className="text-xs text-ink/60 mt-0.5">Automated pack-structure parsing (e.g. Wayne Densch 6/4/16 CAN → 36 units at $5.24 unit cost)</p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-amber-800 text-amber-50 text-xs font-bold hover:bg-amber-900 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={14} /> Upload New Invoice / Receipt
                </button>
              </div>

              {/* Invoices Table & Credit Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#171310]/10 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#171310]/10 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-ink">Recent Distributor Invoices</h3>
                    <span className="text-xs text-amber-900 font-semibold">{invoicesHistory.length} Invoices Logged</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] text-ink/60 border-b border-[#171310]/10">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Invoice #</th>
                          <th className="px-6 py-3 font-semibold">Vendor</th>
                          <th className="px-6 py-3 font-semibold">Date</th>
                          <th className="px-6 py-3 font-semibold">Lines</th>
                          <th className="px-6 py-3 font-semibold">Reconciliation Net</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#171310]/5">
                        {invoicesHistory.map((inv) => (
                          <tr key={inv.id} className="hover:bg-amber-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-mono font-bold text-amber-900">{inv.invoiceNo}</td>
                            <td className="px-6 py-3.5 font-semibold text-ink">{inv.vendor}</td>
                            <td className="px-6 py-3.5 text-ink/60">{inv.date}</td>
                            <td className="px-6 py-3.5 text-ink/70 font-medium">{inv.linesCount} items</td>
                            <td className="px-6 py-3.5 font-bold text-ink">${inv.totalNet.toFixed(2)}</td>
                            <td className="px-6 py-3.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sidebar Cards for Credit Alerts & UPC Alias Mapping */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <AlertTriangle size={18} className="text-amber-700" /> Credit-Owed Alerts
                    </div>
                    <p className="text-xs text-ink/70">
                      Breakage on truck or non-delivered line items automatically generate credit-owed claims against distributors.
                    </p>
                    <div className="p-3 rounded-xl bg-white border border-amber-300 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-ink">Wayne Densch #523219</div>
                        <div className="text-[10px] text-amber-800 font-medium">-1 Breakage on Truck (MD 2020)</div>
                      </div>
                      <span className="font-bold text-amber-900 text-sm">$31.45</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#171310]/10 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-ink">
                      <ShieldCheck size={18} className="text-emerald-700" /> UPC String & Alias Resolver
                    </div>
                    <p className="text-xs text-ink/70">
                      Resolves duplicate POS items without altering transaction history.
                    </p>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-ink/10 text-[11px] font-mono text-ink/80 space-y-1">
                      <div><strong className="text-ink">088004009373</strong> Fireball 100ml</div>
                      <div><strong className="text-ink">088004040901</strong> Fireball 100ml (Mapped)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleAddProduct} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 border border-ink/10 shadow-2xl">
            <h3 className="font-bold text-base text-ink">Add New Product to Inventory</h3>
            <div>
              <label className="block text-xs font-semibold text-ink/80 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="e.g. Maker's Mark Bourbon"
                className="w-full px-3.5 py-2 rounded-lg border border-ink/15 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="39.99"
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  required
                  value={newProductQty}
                  onChange={(e) => setNewProductQty(e.target.value)}
                  placeholder="12"
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/15 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-ink/70 hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Invoice & Receipt Intake Modal */}
      <InvoiceIntakeModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onCommitInvoice={handleCommitInvoice}
      />
    </div>
  );
}
