import { useState } from "react";
import { LayoutDashboard, Package, DollarSign, AlertTriangle, Settings, ArrowLeft, Plus, FileText, Upload, ShieldCheck, Edit, Trash2, History, Search, Grid, List, Calendar, Cpu, MapPin, Users, Printer, FileSpreadsheet, BarChart3, PieChart, TrendingUp, Layers } from "lucide-react";
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
  type: "add" | "edit" | "delete" | "invoice" | "override" | "outage";
};

const STORES = [
  { id: "S83954", name: "Discount Liquor #83954 (Eustis, FL)" },
  { id: "S83955", name: "Discount Liquor #83955 (Orlando, FL)" },
  { id: "S000", name: "Central Warehouse HQ" },
];

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "daily_sales", label: "NRS Daily Sales Feed", icon: FileSpreadsheet },
  { id: "trendview", label: "TrendView Analytics", icon: BarChart3 },
  { id: "forecasting", label: "AI Demand & Reorders", icon: Cpu },
  { id: "invoices", label: "Invoices & Intake", icon: FileText },
  { id: "overrides", label: "Margin Guardrails", icon: DollarSign },
  { id: "shifts", label: "Shift & Register Audit", icon: Users },
  { id: "activity", label: "Activity Log", icon: History },
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
  const [selectedStore, setSelectedStore] = useState(storeName);
  const [products, setProducts] = useState<StoreProduct[]>(INITIAL_PRODUCTS);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductQty, setNewProductQty] = useState("");
  const [newProductCategory] = useState("Spirits & Liquor");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [viewingInvoiceDoc, setViewingInvoiceDoc] = useState<any | null>(null);

  // Filters & View Mode State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewStyle, setViewStyle] = useState<"table" | "tiles">("table");

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  // NRS Daily Reports Sync Status & Suspect Outages
  const [nrsSyncReports] = useState([
    { date: "2026-08-31", itemsCount: 42, rev: 1420.50, status: "healthy", note: "Synced cleanly" },
    { date: "2026-08-30", itemsCount: 38, rev: 1210.10, status: "healthy", note: "Synced cleanly" },
    { date: "2026-08-25", itemsCount: 0, rev: 0.00, status: "suspect", note: "POS Sync Outage - Flagged Suspect (Excluded from Trend)" },
    { date: "2026-08-24", itemsCount: 0, rev: 0.00, status: "suspect", note: "POS Sync Outage - Flagged Suspect (Excluded from Trend)" },
    { date: "2026-08-10", itemsCount: 0, rev: 0.00, status: "suspect", note: "POS Sync Outage - Flagged Suspect (Excluded from Trend)" },
  ]);

  // Price & Margin Override Log
  const [marginOverrides] = useState([
    {
      id: "OVR-891",
      cashier: "Marcus Vance (Register 1)",
      item: "Busch 6/4/16 CAN",
      floorMargin: "24%",
      requestedPrice: "$4.50",
      standardPrice: "$5.24",
      status: "Approved",
      reason: "Bulk Case Discount (4+ Cases)",
      time: "2026-08-31 14:22",
    },
    {
      id: "OVR-892",
      cashier: "Sarah Jenkins (Register 2)",
      item: "Cutwater Margarita 4pk",
      floorMargin: "28%",
      requestedPrice: "$8.00",
      standardPrice: "$9.68",
      status: "Pending Owner Review",
      reason: "Damaged Outer Packaging",
      time: "2026-08-31 16:05",
    },
  ]);

  // Real-time Activity Audit Log
  const [activityLog, setActivityLog] = useState<LogItem[]>([
    {
      id: "LOG-100",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: "System Initialized",
      details: "Store inventory initialized clean (0 products). Ready for invoice extraction.",
      type: "invoice",
    },
    {
      id: "LOG-101",
      timestamp: "10:14 AM",
      action: "NRS POS Sync Evaluated",
      details: "Aug 24 & Aug 25 POS outage emails automatically flagged as status = 'suspect' to protect sales trend lines.",
      type: "outage",
    },
  ]);

  // Uploaded Invoices Vault History
  const [invoicesHistory, setInvoicesHistory] = useState<any[]>([
    {
      id: "INV-523219",
      vendor: "Wayne Densch, Inc.",
      invoiceNo: "523219",
      date: "2026-08-31",
      totalNet: 1103.75,
      linesCount: 15,
      creditAlert: 31.45,
      status: "Reconciled & Archived",
    },
  ]);

  const handlePrintShelfTags = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Retail Shelf Label Tags - ${selectedStore}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 1rem; background: #fff; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .tag { border: 2px solid #171310; border-radius: 8px; padding: 12px; height: 160px; display: flex; flex-col; justify-content: space-between; page-break-inside: avoid; }
            .store { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #92400e; letter-spacing: 0.5px; }
            .title { font-size: 14px; font-weight: bold; margin-top: 4px; color: #171310; line-height: 1.2; }
            .price { font-size: 26px; font-weight: 900; color: #171310; text-align: right; }
            .meta { font-size: 10px; color: #555; display: flex; justify-content: space-between; border-t: 1px solid #eee; pt: 4px; }
            .barcode { font-family: monospace; font-size: 14px; font-weight: bold; text-align: center; letter-spacing: 3px; background: #f5f5f5; padding: 4px; border-radius: 4px; margin-top: 6px; }
          </style>
        </head>
        <body>
          <h3 style="margin-bottom: 1rem;">Retail Shelf Tags (${products.length} Products) - ${selectedStore}</h3>
          <div class="grid">
            ${(products.length > 0 ? products : [
              { id: "SKU-005428", name: "BUSCH 6/4/16 CAN", category: "Beer & Craft Brews", price: 5.24, size: "16 oz", expiry: "2027-08-31" },
              { id: "SKU-021993", name: "CUTWATER LONG ISLAND 4PK", category: "Spirits & Liquor", price: 9.68, size: "12 oz", expiry: "2028-06-30" },
            ]).map(p => `
              <div class="tag">
                <div>
                  <div class="store">${selectedStore}</div>
                  <div class="title">${p.name}</div>
                  <div style="font-size: 10px; color: #777; margin-top: 2px;">${p.category} | ${p.size || "750ml"}</div>
                </div>
                <div class="price">$${p.price.toFixed(2)}</div>
                <div class="meta">
                  <span>SKU: ${p.id}</span>
                  <span>Margin: 28% Floor</span>
                </div>
                <div class="barcode">║▌║ ${p.id} ║▌║</div>
              </div>
            `).join('')}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintAuditDoc = (inv: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Distributor Invoice Audit Report - ${inv.invoiceNo}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; color: #171310; }
            .header { border-b: 2px solid #171310; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
            .total { text-align: right; margin-top: 1.5rem; font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>DISTRIBUTOR INVOICE AUDIT REPORT</h2>
              <p>Store: ${selectedStore} | Vendor: ${inv.vendor}</p>
            </div>
            <div style="text-align: right;">
              <h3>Invoice #${inv.invoiceNo}</h3>
              <p>Audit Timestamp: ${inv.date}</p>
            </div>
          </div>
          <p><strong>Reconciliation Net Total:</strong> $${inv.totalNet.toFixed(2)} | <strong>Line Items:</strong> ${inv.linesCount} items</p>
          ${inv.creditAlert > 0 ? `<p style="color: #92400e;"><strong>Credit Owed Claim:</strong> $${inv.creditAlert.toFixed(2)} (Driver Truck Breakage)</p>` : ""}
          <p style="margin-top: 2rem; font-size: 10px; color: #666;">Certified Official Audit Record - Exported from Qilbo Smart POS Vault.</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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

  // Selected Category for TrendView Drilldown
  const [selectedTrendCategory, setSelectedTrendCategory] = useState<string>("Spirits & Liquor");

  // Day-wise NRS Sales Feed Ingested from no-reply@nrsplus.com
  const [nrsDailySalesFeed] = useState([
    {
      date: "2026-08-31",
      emailSubject: "Daily Sales Report Mon Aug 31, 2026 for Discount Liquor (83954)",
      fileName: "Sales_History_Aug_31,_2026.csv",
      itemRowsTotal: 1240.50,
      itemRowsCount: 42,
      deptRollupTotal: 99.42,
      deptRollupCount: 3,
      status: "Synced",
    },
    {
      date: "2026-08-30",
      emailSubject: "Daily Sales Report Sun Aug 30, 2026 for Discount Liquor (83954)",
      fileName: "Sales_History_Aug_30,_2026.csv",
      itemRowsTotal: 1110.20,
      itemRowsCount: 38,
      deptRollupTotal: 84.10,
      deptRollupCount: 2,
      status: "Synced",
    },
    {
      date: "2026-08-25",
      emailSubject: "Daily Sales Report Tue Aug 25, 2026 for Discount Liquor (83954)",
      fileName: "Sales_History_Aug_25,_2026.csv",
      itemRowsTotal: 0.00,
      itemRowsCount: 0,
      deptRollupTotal: 0.00,
      deptRollupCount: 0,
      status: "Suspect Outage",
      note: "POS Sync Failure - Flagged as status = 'suspect' (Excluded from averages)",
    },
    {
      date: "2026-08-24",
      emailSubject: "Daily Sales Report Mon Aug 24, 2026 for Discount Liquor (83954)",
      fileName: "Sales_History_Aug_24,_2026.csv",
      itemRowsTotal: 0.00,
      itemRowsCount: 0,
      deptRollupTotal: 0.00,
      deptRollupCount: 0,
      status: "Suspect Outage",
      note: "POS Sync Failure - Flagged as status = 'suspect' (Excluded from averages)",
    },
  ]);

  // Category Sales Data for TrendView Stacked & Pie Charts
  const categorySalesTrends = [
    { category: "Spirits & Liquor", revenue: 4850.00, percentage: 44, unitsSold: 184, color: "bg-amber-800", textColor: "text-amber-900" },
    { category: "Beer & Craft Brews", revenue: 3210.50, percentage: 29, unitsSold: 412, color: "bg-amber-600", textColor: "text-amber-700" },
    { category: "Wine & Champagne", revenue: 1940.00, percentage: 18, unitsSold: 96, color: "bg-amber-500", textColor: "text-amber-600" },
    { category: "Tobacco & Cigars", revenue: 640.00, percentage: 6, unitsSold: 140, color: "bg-stone-500", textColor: "text-stone-700" },
    { category: "Grocery & Soda", revenue: 340.00, percentage: 3, unitsSold: 110, color: "bg-emerald-600", textColor: "text-emerald-700" },
  ];

  // Item-wise Breakdown Data for Category Drilldown
  const categoryItemBreakdown: Record<string, any[]> = {
    "Spirits & Liquor": [
      { upc: "088004144722", name: "Fireball Cinnamon Whisky 375ml", unitsSold: 64, revenue: 706.56, margin: "32%", velocity: "Fast Mover" },
      { upc: "816751021993", name: "Cutwater Long Island 6/4/12 Can", unitsSold: 42, revenue: 406.56, margin: "30%", velocity: "Fast Mover" },
      { upc: "816751022006", name: "Cutwater Tequila Margarita 4pk", unitsSold: 38, revenue: 367.84, margin: "30%", velocity: "Fast Mover" },
      { upc: "088004009373", name: "Fireball Cinnamon Whisky 100ml", unitsSold: 28, revenue: 139.72, margin: "35%", velocity: "Steady" },
    ],
    "Beer & Craft Brews": [
      { upc: "018200005428", name: "Busch Can 16 FL OZ 6/4/16", unitsSold: 186, revenue: 974.64, margin: "24%", velocity: "Fast Mover #1" },
      { upc: "018200005459", name: "Natural Ice 6/4/16 CAN", unitsSold: 142, revenue: 687.28, margin: "24%", velocity: "Fast Mover" },
      { upc: "018200611681", name: "Busch 24/12 CAN Suitcase", unitsSold: 48, revenue: 849.60, margin: "22%", velocity: "Steady" },
      { upc: "018200059902", name: "Michelob Ultra 2/12/12 BTL", unitsSold: 36, revenue: 538.92, margin: "26%", velocity: "Steady" },
    ],
    "Wine & Champagne": [
      { upc: "088004051010", name: "Veuve Clicquot Brut 750ml", unitsSold: 24, revenue: 1799.76, margin: "36%", velocity: "High Margin" },
      { upc: "088004051012", name: "Caymus Cabernet Napa 750ml", unitsSold: 12, revenue: 1199.88, margin: "35%", velocity: "High Margin" },
    ],
    "Tobacco & Cigars": [
      { upc: "000000001001", name: "Marlboro Gold 100s Pack", unitsSold: 88, revenue: 440.00, margin: "14%", velocity: "Non-Alcohol Item" },
      { upc: "000000001002", name: "Bic Lighter Standard", unitsSold: 52, revenue: 200.00, margin: "45%", velocity: "Impulse Add-on" },
    ],
    "Grocery & Soda": [
      { upc: "000000002001", name: "Coca Cola 2-Liter Bottle", unitsSold: 60, revenue: 180.00, margin: "20%", velocity: "Non-Alcohol Item" },
      { upc: "000000002002", name: "Red Bull Energy 12oz", unitsSold: 50, revenue: 160.00, margin: "25%", velocity: "Non-Alcohol Item" },
    ],
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
      <header className="bg-white border-b border-[#171310]/10 px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#171310]/15 text-xs font-semibold text-ink/80 hover:bg-black/5 transition-all"
          >
            <ArrowLeft size={14} /> Back to Landing Page
          </button>
          <div className="h-5 w-px bg-ink/15 hidden sm:block" />

          {/* Multi-Store Location Switcher */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-ink/10">
            <MapPin size={15} className="text-amber-800 shrink-0" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent text-xs font-bold text-ink focus:outline-none cursor-pointer"
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto md:ml-0">
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

                {/* View Switcher & Shelf Tags Print Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrintShelfTags}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} /> Print Shelf Tags & Barcodes
                  </button>

                  <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
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

          {/* Tab 3: NRS Daily Sales Feed */}
          {activeTab === "daily_sales" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-ink">NRS Daily Sales Feed (Gmail Automation)</h2>
                  <p className="text-xs text-ink/60">Polls no-reply@nrsplus.com daily. Ingests Sales_History_*.csv day-by-day while preserving leading zero UPCs.</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Gmail Poller Active (06:00 AM)
                </span>
              </div>

              {/* Day-Wise Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-xs space-y-1">
                  <div className="text-xs text-ink/60 font-semibold">Total Ingested Sales</div>
                  <div className="text-2xl font-bold text-ink">$11,040.50</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Last 30 Days (Item UPCs)</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-xs space-y-1">
                  <div className="text-xs text-ink/60 font-semibold">Department Rollups</div>
                  <div className="text-2xl font-bold text-amber-900">$183.52</div>
                  <div className="text-[11px] text-amber-800">Stored separate — Never double counted</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-xs space-y-1">
                  <div className="text-xs text-ink/60 font-semibold">UPC String Integrity</div>
                  <div className="text-2xl font-bold text-emerald-800">100% Valid</div>
                  <div className="text-[11px] text-emerald-700">Leading zeros preserved (01820...)</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-xs space-y-1">
                  <div className="text-xs text-amber-900 font-semibold flex items-center gap-1">
                    <AlertTriangle size={14} /> Suspect Outages
                  </div>
                  <div className="text-2xl font-bold text-amber-900">4 Outages Flagged</div>
                  <div className="text-[11px] text-amber-800">Flagged status = 'suspect'</div>
                </div>
              </div>

              {/* Day-by-Day NRS Email Report History */}
              <div className="bg-white rounded-2xl border border-[#171310]/10 overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-[#171310]/10 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-ink">Day-Wise Ingested Sales Reports</h3>
                  <span className="text-xs text-amber-900 font-mono font-bold">Email Sender: no-reply@nrsplus.com</span>
                </div>
                <div className="divide-y divide-ink/5">
                  {nrsDailySalesFeed.map((feed, idx) => (
                    <div key={idx} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${feed.status === "Suspect Outage" ? "bg-amber-500 animate-pulse" : "bg-emerald-600"}`} />
                        <div>
                          <div className="font-bold text-sm text-ink flex items-center gap-2">
                            <span>{feed.emailSubject}</span>
                            <span className="text-xs font-mono text-ink/40">({feed.fileName})</span>
                          </div>
                          <p className="text-xs text-ink/60 mt-0.5">
                            {feed.status === "Suspect Outage"
                              ? feed.note
                              : `Item Scan Revenue: $${feed.itemRowsTotal.toFixed(2)} (${feed.itemRowsCount} items) | Dept Rollup: $${feed.deptRollupTotal.toFixed(2)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          feed.status === "Suspect Outage" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {feed.status}
                        </span>
                        <button className="px-3 py-1.5 rounded-lg border border-ink/15 text-xs font-semibold text-ink/70 hover:bg-black/5">
                          View CSV
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: TrendView Analytics (Category Stacked Chart & Item Breakdown) */}
          {activeTab === "trendview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">TrendView Sales Analytics & Category Drilldown</h2>
                  <p className="text-xs text-ink/60">Click any category stack or pie card below to break down item-level sales and find your top-selling SKUs.</p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                  <BarChart3 size={14} /> Interactive Visual Charts Engaged
                </span>
              </div>

              {/* Stacked Category Revenue Bar */}
              <div className="bg-white p-6 rounded-2xl border border-ink/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-amber-800" />
                    <h3 className="font-bold text-sm text-ink">Category Revenue Breakdown (Stacked Distribution)</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-900 font-mono">Total Sales: $10,951.00</span>
                </div>

                {/* Multi-Color Stacked Bar */}
                <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-2xs border border-black/10 cursor-pointer">
                  {categorySalesTrends.map((cat) => (
                    <div
                      key={cat.category}
                      onClick={() => setSelectedTrendCategory(cat.category)}
                      style={{ width: `${cat.percentage}%` }}
                      className={`${cat.color} hover:brightness-110 transition-all relative group flex items-center justify-center`}
                      title={`${cat.category}: $${cat.revenue.toFixed(2)} (${cat.percentage}%)`}
                    >
                      {cat.percentage > 8 && (
                        <span className="text-[10px] font-bold text-white font-mono">{cat.percentage}%</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Category Legend & Selector Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                  {categorySalesTrends.map((cat) => {
                    const isSelected = selectedTrendCategory === cat.category;
                    return (
                      <div
                        key={cat.category}
                        onClick={() => setSelectedTrendCategory(cat.category)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-amber-800 bg-amber-50 shadow-xs ring-1 ring-amber-800"
                            : "border-ink/10 bg-[#FAF8F5] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                          <span className="font-bold text-xs text-ink truncate">{cat.category}</span>
                        </div>
                        <div className="mt-2 text-sm font-bold text-ink">${cat.revenue.toFixed(2)}</div>
                        <div className="text-[10px] text-ink/60 font-medium mt-0.5">{cat.unitsSold} Units Sold ({cat.percentage}%)</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Item-Wise Breakdown Table for Selected Category */}
              <div className="bg-white rounded-2xl border border-[#171310]/10 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#171310]/10 flex items-center justify-between bg-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <PieChart size={16} className="text-amber-800" />
                    <h3 className="font-bold text-sm text-ink">
                      Item-Level Performance: <span className="text-amber-900">{selectedTrendCategory}</span>
                    </h3>
                  </div>
                  <span className="text-xs text-ink/60">
                    Showing top-selling items driving <strong>{selectedTrendCategory}</strong> revenue
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-ink/60 border-b border-ink/10">
                      <tr>
                        <th className="px-6 py-3 font-semibold">UPC String</th>
                        <th className="px-6 py-3 font-semibold">Product Description</th>
                        <th className="px-6 py-3 font-semibold">Units Sold</th>
                        <th className="px-6 py-3 font-semibold">Total Revenue</th>
                        <th className="px-6 py-3 font-semibold">Profit Margin</th>
                        <th className="px-6 py-3 font-semibold text-right">Sales Velocity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {(categoryItemBreakdown[selectedTrendCategory] || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                          <td className="px-6 py-3.5 font-mono text-amber-900 font-bold">{item.upc}</td>
                          <td className="px-6 py-3.5 font-semibold text-ink">{item.name}</td>
                          <td className="px-6 py-3.5 font-bold text-ink">{item.unitsSold} units</td>
                          <td className="px-6 py-3.5 font-bold text-amber-950">${item.revenue.toFixed(2)}</td>
                          <td className="px-6 py-3.5 font-semibold text-emerald-800">{item.margin}</td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 inline-flex items-center gap-1">
                              <TrendingUp size={10} /> {item.velocity}
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
          {activeTab === "forecasting" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">AI Demand Forecasting & Days of Cover Engine</h2>
                  <p className="text-xs text-ink/60">Predicts stockout dates based on NRS sales velocity and flags suspect sync outages.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <Cpu size={14} /> AI Engine Active
                </span>
              </div>

              {/* Demand Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-ink/10 space-y-2">
                  <div className="text-xs text-ink/60 font-semibold">Average Stock Cover</div>
                  <div className="text-2xl font-bold text-ink">18.4 Days</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Optimal coverage threshold: 14-21 days</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-ink/10 space-y-2">
                  <div className="text-xs text-ink/60 font-semibold">Auto Purchase Orders Drafted</div>
                  <div className="text-2xl font-bold text-amber-900">3 Orders Drafted</div>
                  <div className="text-[11px] text-ink/50">Wayne Densch & DSI Distributors</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="text-xs text-amber-900 font-semibold flex items-center gap-1">
                    <AlertTriangle size={14} /> POS Outage Emails Flagged
                  </div>
                  <div className="text-2xl font-bold text-amber-900">5 Outages Excluded</div>
                  <div className="text-[11px] text-amber-800">Empty NRS reports marked status = 'suspect'</div>
                </div>
              </div>

              {/* Suspect NRS POS Sync Reports Section */}
              <div className="bg-white rounded-2xl border border-[#171310]/10 overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-[#171310]/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-ink">Daily NRS Sales Feed Log (Auto Ingested)</h3>
                    <p className="text-[11px] text-ink/60">Polls no-reply@nrsplus.com for daily sales CSVs.</p>
                  </div>
                  <span className="text-xs text-amber-900 font-bold font-mono">Rule: Preserves Leading Zero UPCs</span>
                </div>
                <div className="divide-y divide-ink/5">
                  {nrsSyncReports.map((report, idx) => (
                    <div key={idx} className="px-6 py-3.5 flex items-center justify-between hover:bg-[#FAF8F5]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${report.status === "suspect" ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                        <div>
                          <div className="font-bold text-xs text-ink">Daily Sales Report &lt;{report.date}&gt;</div>
                          <div className="text-[11px] text-ink/60">{report.note}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          report.status === "suspect" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {report.status === "suspect" ? "SUSPECT OUTAGE" : "SYNCED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Margin Guardrails & Price Overrides */}
          {activeTab === "overrides" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Margin Guardrails & Cashier Override Approval Log</h2>
                  <p className="text-xs text-ink/60">Enforces category floor margins and requires owner approval for register discount overrides.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> Margin Locks Engaged
                </span>
              </div>

              {/* Floor Margins Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-1">
                  <div className="text-xs text-ink/60 font-semibold">Spirits & Liquor Floor</div>
                  <div className="text-xl font-bold text-amber-900">28.0% Minimum Margin</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-1">
                  <div className="text-xs text-ink/60 font-semibold">Wine & Champagne Floor</div>
                  <div className="text-xl font-bold text-amber-900">35.0% Minimum Margin</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-1">
                  <div className="text-xs text-ink/60 font-semibold">Beer & Craft Brews Floor</div>
                  <div className="text-xl font-bold text-amber-900">24.0% Minimum Margin</div>
                </div>
              </div>

              {/* Overrides Table */}
              <div className="bg-white rounded-2xl border border-[#171310]/10 overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-[#171310]/10">
                  <h3 className="font-bold text-sm text-ink">Register Price Override Audit Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-ink/60 border-b border-ink/10">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Override ID</th>
                        <th className="px-6 py-3 font-semibold">Cashier / Register</th>
                        <th className="px-6 py-3 font-semibold">Item</th>
                        <th className="px-6 py-3 font-semibold">Req Price</th>
                        <th className="px-6 py-3 font-semibold">Std Price</th>
                        <th className="px-6 py-3 font-semibold">Reason</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {marginOverrides.map((ovr) => (
                        <tr key={ovr.id} className="hover:bg-[#FAF8F5]">
                          <td className="px-6 py-3.5 font-mono text-amber-900 font-bold">{ovr.id}</td>
                          <td className="px-6 py-3.5 font-semibold text-ink">{ovr.cashier}</td>
                          <td className="px-6 py-3.5 text-ink">{ovr.item}</td>
                          <td className="px-6 py-3.5 font-bold text-amber-900">{ovr.requestedPrice}</td>
                          <td className="px-6 py-3.5 text-ink/50 line-through">{ovr.standardPrice}</td>
                          <td className="px-6 py-3.5 text-ink/70">{ovr.reason}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ovr.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800 animate-pulse"
                            }`}>
                              {ovr.status}
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

          {/* Tab 6: Shift & Cash Register Audit */}
          {activeTab === "shifts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Staff, Shift & Register Drawer Audit</h2>
                  <p className="text-xs text-ink/60">Live shift telemetry, cash floats, drawer balance reconciliation, and shrinkage audit.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1">
                  <Users size={14} /> 2 Registers Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-ink/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-ink">Register 01 (Front Counter)</h3>
                      <p className="text-xs text-ink/60">Active Shift: Marcus Vance</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">OPEN</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-ink/60 block">Opening Float</span><strong>$250.00</strong></div>
                    <div><span className="text-ink/60 block">Cash Collected</span><strong className="text-emerald-800">$1,420.50</strong></div>
                    <div><span className="text-ink/60 block">Card Sales</span><strong>$2,890.00</strong></div>
                    <div><span className="text-ink/60 block">Drawer Balance</span><strong className="text-amber-900">$1,670.50</strong></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-ink/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-ink">Register 02 (Drive-Thru / Express)</h3>
                      <p className="text-xs text-ink/60">Active Shift: Sarah Jenkins</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">OPEN</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-ink/60 block">Opening Float</span><strong>$250.00</strong></div>
                    <div><span className="text-ink/60 block">Cash Collected</span><strong className="text-emerald-800">$890.00</strong></div>
                    <div><span className="text-ink/60 block">Card Sales</span><strong>$1,640.25</strong></div>
                    <div><span className="text-ink/60 block">Drawer Balance</span><strong className="text-amber-900">$1,140.00</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Invoices & Intake */}
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
                          <th className="px-6 py-3 font-semibold text-right">Audit Vault</th>
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
                            <td className="px-6 py-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => setViewingInvoiceDoc(inv)}
                                className="px-2.5 py-1 rounded bg-black/5 hover:bg-amber-100 text-amber-900 font-semibold text-[11px] transition-colors"
                              >
                                View Doc
                              </button>
                              <button
                                onClick={() => handlePrintAuditDoc(inv)}
                                className="px-2.5 py-1 rounded bg-amber-800 text-amber-50 font-semibold text-[11px] hover:bg-amber-900 transition-colors"
                              >
                                Print / Download
                              </button>
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

          {/* Settings Tab Fallback */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-[#171310]/10 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-bold">
                Q
              </div>
              <h3 className="font-bold text-base text-ink">Store Settings & Automation Rules</h3>
              <p className="text-xs text-ink/60 max-w-md mx-auto">
                Configured store: <strong>{selectedStore}</strong>. Automated NRS sales polling active every morning at 06:00 AM.
              </p>
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

      {/* Invoice Document Audit Viewer Modal */}
      {viewingInvoiceDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl space-y-4 border border-ink/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="font-bold text-base text-ink">Distributor Document Vault ({viewingInvoiceDoc.invoiceNo})</h3>
                <p className="text-xs text-ink/60">Vendor: {viewingInvoiceDoc.vendor} | Audit Timestamp: {viewingInvoiceDoc.date}</p>
              </div>
              <button
                onClick={() => setViewingInvoiceDoc(null)}
                className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-ink/70"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-ink/10 space-y-2 text-xs">
              <div className="flex justify-between"><span>Distributor House:</span><strong>{viewingInvoiceDoc.vendor}</strong></div>
              <div className="flex justify-between"><span>Invoice Number:</span><strong className="font-mono text-amber-900">#{viewingInvoiceDoc.invoiceNo}</strong></div>
              <div className="flex justify-between"><span>Extracted Line Items:</span><strong>{viewingInvoiceDoc.linesCount} items</strong></div>
              <div className="flex justify-between"><span>Reconciliation Net:</span><strong className="text-amber-950 font-bold">${viewingInvoiceDoc.totalNet.toFixed(2)}</strong></div>
              {viewingInvoiceDoc.creditAlert > 0 && (
                <div className="flex justify-between text-amber-900 font-bold border-t border-amber-200 pt-2">
                  <span>Driver Breakage Credit Owed:</span>
                  <span>${viewingInvoiceDoc.creditAlert.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> Audit Vault Compliance Secured
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewingInvoiceDoc(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-ink/70 hover:bg-black/5"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintAuditDoc(viewingInvoiceDoc)}
                  className="px-4 py-2 rounded-lg bg-amber-800 text-amber-50 text-xs font-bold hover:bg-amber-900 shadow-sm"
                >
                  Print / Download PDF Report
                </button>
              </div>
            </div>
          </div>
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
