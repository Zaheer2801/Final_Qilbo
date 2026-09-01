import { useState } from "react";
import { LayoutDashboard, Package, Receipt, DollarSign, AlertTriangle, Bell, Settings, ArrowLeft, Plus, FileText, Upload, ShieldCheck, Edit, Trash2, History, Search, Grid, List, Calendar } from "lucide-react";
import InvoiceIntakeModal, { type InvoiceLineParsed } from "./InvoiceIntakeModal";

export type DashboardViewProps = {
  storeName?: string;
  onBackToLanding: () => void;
};

export type LogItem = {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: "add" | "edit" | "delete" | "invoice";
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "invoices", label: "Invoices & Intake", icon: FileText },
  { id: "activity", label: "Activity Log", icon: History },
  { id: "procurement", label: "Procurement", icon: Receipt },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "expiry", label: "Expiry", icon: AlertTriangle },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export type StoreProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  qty: number;
  minMargin: number;
  cost: number;
  price: number;
  expiry: string;
  status: string;
};

// CLEAN FRESH INVENTORY START (0 sample items!)
const INITIAL_PRODUCTS: StoreProduct[] = [];

export default function DashboardView({ storeName = "Discount Liquor #83954", onBackToLanding }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<StoreProduct[]>(INITIAL_PRODUCTS);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductQty, setNewProductQty] = useState("");
  const [newProductCategory] = useState("Spirits & Liquor");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Filters & View Mode State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewStyle, setViewStyle] = useState<"table" | "tiles">("table");

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  // Real-time Activity Audit Log
  const [activityLog, setActivityLog] = useState<LogItem[]>([
    {
      id: "LOG-100",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: "System Initialized",
      details: "Store inventory initialized clean (0 products). Ready for invoice extraction.",
      type: "invoice",
    },
  ]);

  const [invoicesHistory, setInvoicesHistory] = useState<any[]>([]);

  const addLog = (action: string, details: string, type: LogItem["type"]) => {
    const newEntry: LogItem = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      details,
      type,
    };
    setActivityLog((prev) => [newEntry, ...prev]);
  };

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

    // Push all extracted products to inventory with expiry dates & category tag
    const newProducts: StoreProduct[] = [];
    lines.forEach((line) => {
      if (line.unitsReceived > 0) {
        const cat = line.description.includes("CAN") || line.description.includes("BTL")
          ? (line.description.includes("CUTWATER") ? "Spirits & Liquor" : "Beer & Craft Brews")
          : "Spirits & Liquor";
        newProducts.push({
          id: `SKU-${line.upc.slice(-6)}`,
          name: line.description,
          brand: line.description.split(" ")[0],
          category: cat,
          size: "Case/Pack",
          qty: line.unitsReceived,
          minMargin: 28,
          cost: line.unitCost,
          price: Number((line.unitCost * 1.45).toFixed(2)),
          expiry: line.expiryDate || "2027-12-31",
          status: "Healthy",
        });
      }
    });

    setProducts((prev) => [...newProducts, ...prev]);
    addLog(
      "Invoice Ingested & Approved",
      `Extracted ALL ${newProducts.length} line items from ${vendor} (Inv #${invNo}). Net total: $${totalNet.toFixed(2)}.`,
      "invoice"
    );
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;
    const priceNum = Number(newProductPrice) || 29.99;
    const qtyNum = Number(newProductQty) || 12;
    const newProd: StoreProduct = {
      id: `P${101 + products.length}`,
      name: newProductName,
      brand: newProductName.split(" ")[0],
      category: newProductCategory,
      size: "750ml",
      qty: qtyNum,
      minMargin: 28,
      cost: Number((priceNum * 0.7).toFixed(2)),
      price: priceNum,
      expiry: "2028-12-31",
      status: qtyNum < 5 ? "Low Stock" : "Healthy",
    };
    setProducts([newProd, ...products]);
    addLog("Product Added Manually", `Added ${newProductName} (Qty: ${qtyNum}, Price: $${priceNum.toFixed(2)})`, "add");
    setNewProductName("");
    setNewProductPrice("");
    setNewProductQty("");
    setShowAddModal(false);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
    addLog(
      "Product Updated",
      `Updated ${editingProduct.name} - Price: $${editingProduct.price}, Stock: ${editingProduct.qty}`,
      "edit"
    );
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} from inventory?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addLog("Product Deleted", `Removed ${name} (ID: ${id}) from store inventory`, "delete");
    }
  };

  // Filtered Products Logic
  const categoriesList = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
          {/* Tab 1 & Tab 2: Overview & Inventory Views */}
          {(activeTab === "overview" || activeTab === "inventory") && (
            <div className="space-y-6">
              {/* Controls Bar: Search, Category Filter & View Switcher */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#171310]/10 shadow-2xs">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-2.5 text-ink/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by product name, SKU ID, or category..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-ink/10 rounded-xl text-xs text-ink focus:outline-none focus:border-amber-800"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink/60 shrink-0">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-[#FAF8F5] border border-ink/10 rounded-xl text-xs text-ink font-semibold focus:outline-none"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* View Switcher (Table vs. Tiles) */}
                <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewStyle("table")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      viewStyle === "table" ? "bg-white text-amber-900 shadow-xs" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <List size={14} /> List View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewStyle("tiles")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      viewStyle === "tiles" ? "bg-white text-amber-900 shadow-xs" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <Grid size={14} /> Tiles View
                  </button>
                </div>
              </div>

              {/* Inventory Content Display */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#171310]/10 p-12 text-center space-y-3">
                  <Package size={36} className="text-amber-800 mx-auto opacity-40" />
                  <h4 className="font-bold text-base text-ink">No Products Match Your Filter</h4>
                  <p className="text-xs text-ink/60 max-w-sm mx-auto">
                    {products.length === 0
                      ? "Your store inventory is empty. Upload a distributor receipt/invoice (PDF, Image, CSV) or click '+ Add Product'."
                      : "Try clearing your search query or selecting 'All' categories."}
                  </p>
                  {products.length === 0 && (
                    <button
                      onClick={() => setShowInvoiceModal(true)}
                      className="px-4 py-2 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={14} /> Upload First Invoice / Receipt
                    </button>
                  )}
                </div>
              ) : viewStyle === "table" ? (
                /* TABLE / LIST VIEW */
                <div className="bg-white rounded-2xl border border-[#171310]/10 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#171310]/10 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-ink">Active Store Inventory List</h3>
                    <span className="text-xs text-amber-900 font-semibold">{filteredProducts.length} Items Displayed</span>
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
                          <th className="px-6 py-3 font-semibold">Expiry Date</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#171310]/5">
                        {filteredProducts.map((item) => (
                          <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-mono text-ink/60 font-medium">{item.id}</td>
                            <td className="px-6 py-3.5 font-semibold text-ink">{item.name}</td>
                            <td className="px-6 py-3.5 text-ink/70 font-medium">{item.category}</td>
                            <td className="px-6 py-3.5 font-bold text-ink">{item.qty} units</td>
                            <td className="px-6 py-3.5 font-bold text-amber-950">${item.price.toFixed(2)}</td>
                            <td className="px-6 py-3.5 text-ink/70 font-mono flex items-center gap-1">
                              <Calendar size={12} className="text-amber-800" /> {item.expiry || "2027-12-31"}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.status === "Low Stock" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => setEditingProduct(item)}
                                className="p-1.5 rounded bg-black/5 hover:bg-amber-100 hover:text-amber-900 text-ink/70 transition-colors"
                                title="Edit Product"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(item.id, item.name)}
                                className="p-1.5 rounded bg-black/5 hover:bg-red-100 hover:text-red-700 text-ink/70 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* TILES / GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="p-5 rounded-2xl border border-ink/10 bg-white hover:shadow-md transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-ink/40 font-bold">{p.id}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingProduct(p)} className="p-1.5 rounded bg-black/5 text-ink/70 hover:text-amber-900"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-1.5 rounded bg-black/5 text-ink/70 hover:text-red-700"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-ink">{p.name}</div>
                        <span className="text-[11px] font-medium text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded mt-1 inline-block">{p.category}</span>
                      </div>
                      <div className="pt-2 border-t border-ink/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-ink/60 block text-[10px]">Stock Count</span>
                          <strong className="text-ink text-sm">{p.qty} units</strong>
                        </div>
                        <div>
                          <span className="text-ink/60 block text-[10px]">Selling Price</span>
                          <strong className="text-amber-950 text-sm">${p.price.toFixed(2)}</strong>
                        </div>
                      </div>
                      <div className="pt-1.5 text-[11px] text-ink/60 flex items-center gap-1 font-mono">
                        <Calendar size={12} className="text-amber-800" /> Expiry: {p.expiry || "2027-12-31"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Activity Log / Audit Trail */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Real-time Activity Log & Audit Trail</h2>
                  <p className="text-xs text-ink/60">Audit trail of all inventory modifications, invoice extractions, edits, and deletions.</p>
                </div>
                <span className="text-xs font-mono text-amber-900 font-semibold">{activityLog.length} Events Logged</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#171310]/10 overflow-hidden shadow-xs">
                <div className="divide-y divide-[#171310]/5">
                  {activityLog.map((log) => (
                    <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-[#FAF8F5] transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        log.type === "add" ? "bg-emerald-100 text-emerald-800" :
                        log.type === "edit" ? "bg-amber-100 text-amber-900" :
                        log.type === "delete" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {log.type === "add" ? "+" : log.type === "edit" ? "E" : log.type === "delete" ? "✕" : "i"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-ink">{log.action}</h4>
                          <span className="text-[11px] font-mono text-ink/40">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-ink/70 mt-0.5">{log.details}</p>
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
      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleUpdateProduct} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 border border-ink/10 shadow-2xl">
            <h3 className="font-bold text-base text-ink">Edit Inventory Product ({editingProduct.id})</h3>
            <div>
              <label className="block text-xs font-semibold text-ink/80 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-ink/15 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/80 mb-1">Category</label>
              <input
                type="text"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
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
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/15 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={editingProduct.qty}
                  onChange={(e) => setEditingProduct({ ...editingProduct, qty: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/15 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-ink/70 hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900"
              >
                Update Product
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
