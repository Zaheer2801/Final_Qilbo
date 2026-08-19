import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, Camera, X, Search, TrendingUp, Package, AlertCircle, Plus, ArrowLeft } from "lucide-react";
import { CATEGORY_LIST, getCategoryType, categoryColor } from "@/lib/categories";
import ProductThumb from "@/components/ProductThumb";

export default function PriceCheck() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cost, setCost] = useState("");
  const [cat, setCat] = useState("retail");
  const [targetMargin, setTargetMargin] = useState(30);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);

  const startScan = async () => {
    setError("");
    setScanning(true);
    setTimeout(async () => {
      try {
        const html5 = new Html5Qrcode("reader");
        scannerRef.current = html5;
        await html5.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decoded) => {
            html5.stop().catch(() => {});
            setScanning(false);
            lookup(decoded);
          },
          () => {}
        );
      } catch (e) {
        setError("Camera not available. Enter the barcode manually below.");
        setScanning(false);
      }
    }, 100);
  };

  const stopScan = async () => {
    if (scannerRef.current) { try { await scannerRef.current.stop(); } catch {} scannerRef.current = null; }
    setScanning(false);
  };

  useEffect(() => () => { if (scannerRef.current) { try { scannerRef.current.stop(); } catch {} } }, []);

  const lookup = async (c) => {
    setCode(c); setLoading(true); setError(""); setResult(null);
    try {
      const list = await base44.entities.Product.filter({ barcode: c }, "-updated_date", 5);
      if (list.length) {
        const p = list[0];
        let vendor = null;
        if (p.vendor_id) { try { vendor = await base44.entities.Vendor.get(p.vendor_id); } catch {} }
        setResult({ product: p, vendor });
        setCost(p.cost || "");
        setCat(p.category_type || "retail");
        const cur = p.price > 0 ? ((p.price - (p.cost || 0)) / p.price) * 100 : 0;
        setTargetMargin(Math.round(cur) || getCategoryType(p.category_type).margin.green);
      } else {
        setResult({ notFound: true, code: c });
        setCost(""); setCat("retail"); setTargetMargin(30);
      }
    } catch (e) {
      setError("Lookup failed. Try again.");
    } finally { setLoading(false); }
  };

  const suggestedPrice = Number(cost) > 0 && Number(targetMargin) < 100
    ? Number(cost) / (1 - Number(targetMargin) / 100)
    : 0;
  const cc = categoryColor(cat);
  const found = result && !result.notFound;

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${cc.gradient} px-5 py-6 text-white transition-all duration-300`}>
        <div className="relative flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/15 hover:bg-white/25"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><ScanLine className="w-5 h-5" /> Price Check</h1>
            <p className="text-white/80 text-sm">Scan an item to check cost & suggest a price</p>
          </div>
        </div>
      </div>

      <div className="p-5 max-w-xl mx-auto">
        {/* Scanner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          {!scanning ? (
            <button onClick={startScan} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800">
              <Camera className="w-5 h-5" /> Start scanning
            </button>
          ) : (
            <div>
              <div id="reader" className="w-full rounded-xl overflow-hidden bg-slate-900" />
              <button onClick={stopScan} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                <X className="w-4 h-4" /> Stop
              </button>
            </div>
          )}

          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && code.trim()) lookup(code.trim()); }}
                placeholder="Or enter barcode manually…"
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <button onClick={() => code.trim() && lookup(code.trim())} className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600">Check</button>
            </div>
            {error && <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}
          </div>
        </div>

        {loading && <div className="text-center text-sm text-slate-400 py-6">Looking up item…</div>}

        {/* Found */}
        {found && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className={`px-5 py-4 bg-gradient-to-br ${cc.gradient} text-white flex items-center gap-4`}>
              <ProductThumb product={result.product} size="w-16 h-16" rounded="rounded-xl" className="ring-2 ring-white/40" />
              <div className="min-w-0">
                <div className="text-lg font-bold truncate">{result.product.name}</div>
                <div className="text-white/80 text-sm">{result.product.category || getCategoryType(result.product.category_type).label}</div>
                <div className="text-white/70 text-xs mt-0.5">Barcode: {result.product.barcode || "—"}</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Vendor cost" value={result.product.cost ? `$${Number(result.product.cost).toFixed(2)}` : "—"} />
                <Stat label="Current price" value={`$${Number(result.product.price).toFixed(2)}`} />
                <Stat label="Current margin" value={`${result.product.price > 0 ? (((result.product.price - (result.product.cost || 0)) / result.product.price) * 100).toFixed(0) : 0}%`} />
              </div>
              {result.vendor && (
                <div className="text-xs text-slate-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Supplied by <span className="font-medium text-slate-700">{result.vendor.name}</span></div>
              )}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-emerald-600" /><span className="text-sm font-semibold text-slate-800">Suggested price</span></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Target margin</span>
                  <span className="text-sm font-semibold text-slate-900">{targetMargin}%</span>
                </div>
                <input type="range" min="5" max="80" value={targetMargin} onChange={(e) => setTargetMargin(Number(e.target.value))} className="w-full accent-emerald-500" />
                <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-sm text-emerald-700">Suggested sell price</span>
                  <span className="text-2xl font-bold text-emerald-700">${suggestedPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigate("/products", { state: { newBarcode: result.product.barcode, newCategory: result.product.category_type, editId: result.product.id } })}
                  className="mt-3 w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Edit product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not found */}
        {result && result.notFound && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-semibold">Not in your inventory</div>
                <div className="text-white/60 text-xs">Barcode: {result.code}</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm text-slate-500">Enter the cost you're paying and pick a category. We'll suggest a retail price based on your target margin.</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vendor cost ($)</label>
                  <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className="form-input mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Category</label>
                  <select value={cat} onChange={(e) => { setCat(e.target.value); setTargetMargin(getCategoryType(e.target.value).margin.green); }} className="form-input mt-1">
                    {CATEGORY_LIST.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Target margin</span>
                  <span className="text-sm font-semibold text-slate-900">{targetMargin}%</span>
                </div>
                <input type="range" min="5" max="80" value={targetMargin} onChange={(e) => setTargetMargin(Number(e.target.value))} className="w-full accent-emerald-500" />
                <div className={`mt-3 flex items-center justify-between p-3 rounded-xl ${cc.soft} border ${cc.border}`}>
                  <span className={`text-sm ${cc.text}`}>Suggested sell price</span>
                  <span className={`text-2xl font-bold ${cc.text}`}>${suggestedPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                disabled={!Number(cost) > 0}
                onClick={() => navigate("/products", { state: { newBarcode: result.code, newCategory: cat, newCost: cost, newPrice: suggestedPrice.toFixed(2) } })}
                className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add to inventory at ${suggestedPrice.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
      <div className="text-lg font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}