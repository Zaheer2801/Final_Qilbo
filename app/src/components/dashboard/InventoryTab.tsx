import { useEffect, useState } from "react";
import { FileSpreadsheet, Camera, Loader2, PenLine, Plus, Sparkles } from "lucide-react";
import type { AppState, Product, QtyChangeReason } from "../../types";
import { expiryUrgency } from "../../lib/businessLogic";
import { enrichProductImages, type EnrichmentProgress } from "../../lib/imageEnrichment";
import { card, inputCls, btnSmall, CategoryPill, Pagination, SortableHeader, Tag } from "../ui";
import { titleCase } from "../../lib/format";
import ProductDetailPanel from "./ProductDetailPanel";
import { ProductThumb, ProductHoverPreview } from "./ProductThumb";
import CsvImportModal from "./CsvImportModal";
import PhotoAddModal from "./PhotoAddModal";
import { ListControls, useListControls } from "./ListControls";

type ProductForm = Omit<Product, "id" | "qty" | "reorderPoint" | "purchasePrice" | "sellingPrice"> & {
  qty: string;
  reorderPoint: string;
  purchasePrice: string;
  sellingPrice: string;
};

const emptyForm: ProductForm = {
  name: "",
  brand: "",
  category: "",
  size: "",
  qty: "",
  reorderPoint: "",
  purchasePrice: "",
  sellingPrice: "",
  expiryDate: "",
  vendor: "",
  receivedDate: "",
};

type AddMode = null | "manual" | "csv" | "photo";

export default function InventoryTab({
  state,
  updateState,
  pendingProductId,
  onPendingConsumed,
}: {
  state: AppState;
  updateState: (updater: (s: AppState) => AppState) => void;
  /** Set by the top toolbar's global product search — jumping here from a
   * search result should open that product's detail panel immediately. */
  pendingProductId?: string | null;
  onPendingConsumed?: () => void;
}) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saleForm, setSaleForm] = useState({ productId: "", qty: "" });
  const [selected, setSelected] = useState<Product | null>(null);
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [catalogEnrich, setCatalogEnrich] = useState<EnrichmentProgress | null>(null);

  const missingImages = state.products.filter((p) => !p.imageUrl);
  const ctl = useListControls(state.products, (p) => p);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (!pendingProductId) return;
    const product = state.products.find((p) => p.id === pendingProductId);
    if (product) setSelected(product);
    onPendingConsumed?.();
  }, [pendingProductId]);

  // Any filter/sort change can shrink the result set below the current
  // page — reset to page 1 rather than showing an empty page.
  useEffect(() => {
    setPage(1);
  }, [ctl.search, ctl.category, ctl.sortBy, pageSize]);

  const totalPages = Math.max(1, Math.ceil(ctl.shown.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = ctl.shown.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function enrichExistingCatalog() {
    setCatalogEnrich({ done: 0, total: missingImages.length });
    const found = await enrichProductImages(missingImages, setCatalogEnrich);
    updateState((s) => ({ ...s, products: s.products.map((p) => (found.has(p.id) ? { ...p, imageUrl: found.get(p.id) } : p)) }));
    setCatalogEnrich(null);
  }

  function importCsvProducts(products: Product[]) {
    updateState((s) => ({ ...s, products: [...s.products, ...products] }));
    setAddMode(null);
  }

  function addPhotoProduct(p: Product) {
    updateState((s) => ({ ...s, products: [...s.products, p] }));
    setAddMode(null);
  }

  function removeProduct(id: string) {
    updateState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
    setSelected(null);
  }

  function changeQty(productId: string, newQty: number, changedBy: string, reasons: QtyChangeReason[], note: string) {
    updateState((s) => {
      const product = s.products.find((p) => p.id === productId);
      if (!product) return s;
      const entry = {
        id: "ql" + Date.now(),
        productId,
        productName: product.name,
        previousQty: product.qty,
        newQty,
        changedBy,
        reasons,
        note: note || undefined,
        date: new Date().toISOString(),
      };
      return {
        ...s,
        products: s.products.map((p) => (p.id === productId ? { ...p, qty: newQty } : p)),
        qtyLog: [entry, ...s.qtyLog],
      };
    });
    setSelected((prev) => (prev && prev.id === productId ? { ...prev, qty: newQty } : prev));
  }

  function addProduct() {
    if (!form.name || !form.qty) return;
    const p: Product = {
      id: "P" + Date.now(),
      name: form.name,
      brand: form.brand || undefined,
      category: form.category,
      size: form.size,
      expiryDate: form.expiryDate,
      vendor: form.vendor || undefined,
      receivedDate: form.receivedDate || undefined,
      qty: Number(form.qty),
      reorderPoint: Number(form.reorderPoint || 0),
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
    };
    updateState((s) => ({ ...s, products: [...s.products, p] }));
    setForm(emptyForm);
    setAddMode(null);
  }

  function logSale() {
    if (!saleForm.productId || !saleForm.qty) return;
    updateState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === saleForm.productId ? { ...p, qty: Math.max(0, p.qty - Number(saleForm.qty)) } : p)),
      sales: [...s.sales, { id: "s" + Date.now(), productId: saleForm.productId, qty: Number(saleForm.qty), date: new Date().toISOString().slice(0, 10) }],
    }));
    setSaleForm({ productId: "", qty: "" });
  }

  function toggleQtySort() {
    ctl.setSortBy(ctl.sortBy === "qtyLow" ? "qtyHigh" : "qtyLow");
  }
  function togglePriceSort() {
    ctl.setSortBy(ctl.sortBy === "priceLow" ? "priceHigh" : "priceLow");
  }

  const addButtons = (
    <>
      <button onClick={() => setAddMode(addMode === "manual" ? null : "manual")} className={btnSmall}>
        <PenLine size={13} />
        Add manually
      </button>
      <button onClick={() => setAddMode("csv")} className={btnSmall}>
        <FileSpreadsheet size={13} />
        Upload CSV
      </button>
      <button onClick={() => setAddMode("photo")} className={btnSmall}>
        <Camera size={13} />
        Upload photo
      </button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className={card}>
        {state.products.length === 0 && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Products</h3>
            <div className="flex items-center gap-1.5">{addButtons}</div>
          </div>
        )}

        {catalogEnrich ? (
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-amber-900 mb-1.5">
              <Loader2 size={13} className="animate-spin" />
              Enriching {catalogEnrich.total} product{catalogEnrich.total === 1 ? "" : "s"} — {Math.round((catalogEnrich.done / catalogEnrich.total) * 100)}% complete
            </div>
            <div className="w-full h-1.5 rounded-full bg-amber-100 overflow-hidden">
              <div className="h-full bg-amber-700 transition-all duration-200" style={{ width: `${(catalogEnrich.done / catalogEnrich.total) * 100}%` }} />
            </div>
          </div>
        ) : (
          missingImages.length > 0 &&
          state.products.length > 0 && (
            <div className="flex items-center justify-between text-xs text-stone-500 mb-3 rounded-md bg-stone-50 border border-stone-200 px-3 py-2">
              <span>
                {missingImages.length} product{missingImages.length === 1 ? "" : "s"} missing a photo.
              </span>
              <button onClick={enrichExistingCatalog} className={btnSmall}>
                <Sparkles size={13} />
                Auto-fetch missing images
              </button>
            </div>
          )
        )}

        {state.products.length === 0 ? (
          <p className="text-stone-400 italic text-sm py-6 text-center">No products yet — add one above, or load sample data from Settings.</p>
        ) : (
          <>
            <ListControls {...ctl} totalCount={state.products.length} rightSlot={addButtons} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-stone-100">
                    <th className="pb-2 pr-3 w-14"></th>
                    <th className="pb-2 pr-3">
                      <SortableHeader label="Name" active={ctl.sortBy === "name"} direction="asc" onClick={() => ctl.setSortBy("name")} />
                    </th>
                    <th className="pb-2 pr-3 text-xs font-medium text-stone-400">Category</th>
                    <th className="pb-2 pr-3 text-xs font-medium text-stone-400">Size</th>
                    <th className="pb-2 pr-3">
                      <SortableHeader
                        label="Qty"
                        active={ctl.sortBy === "qtyLow" || ctl.sortBy === "qtyHigh"}
                        direction={ctl.sortBy === "qtyLow" ? "asc" : "desc"}
                        onClick={toggleQtySort}
                      />
                    </th>
                    <th className="pb-2 pr-3">
                      <SortableHeader
                        label="Price"
                        active={ctl.sortBy === "priceLow" || ctl.sortBy === "priceHigh"}
                        direction={ctl.sortBy === "priceLow" ? "asc" : "desc"}
                        onClick={togglePriceSort}
                      />
                    </th>
                    <th className="pb-2 text-xs font-medium text-stone-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => {
                    const lowStock = p.qty <= p.reorderPoint;
                    const risk = expiryUrgency(p, state.sales);
                    return (
                      <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50/60 cursor-pointer" onClick={() => setSelected(p)}>
                        <td className={ctl.compact ? "py-1 pr-3" : "py-2 pr-3"}>
                          <ProductThumb product={p} iconSize={14} className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden" />
                        </td>
                        <td className={(ctl.compact ? "py-1 pr-3 " : "py-2 pr-3 ") + "relative group"}>
                          <span className="font-medium">{titleCase(p.name)}</span>
                          {p.brand && <span className="text-stone-400"> · {titleCase(p.brand)}</span>}
                          <ProductHoverPreview product={p} align="left" />
                        </td>
                        <td className={(ctl.compact ? "py-1 pr-3 " : "py-2 pr-3 ") + "text-stone-500"}>
                          <CategoryPill category={p.category} />
                        </td>
                        <td className={(ctl.compact ? "py-1 pr-3 " : "py-2 pr-3 ") + "text-stone-500"}>{p.size || "—"}</td>
                        <td className={(ctl.compact ? "py-1 pr-3 " : "py-2 pr-3 ") + (lowStock ? "text-red-700 font-medium" : "")}>{p.qty}</td>
                        <td className={ctl.compact ? "py-1 pr-3" : "py-2 pr-3"}>${p.sellingPrice.toFixed(2)}</td>
                        <td className={ctl.compact ? "py-1" : "py-2"}>
                          {lowStock && <Tag tone="red">Low</Tag>}
                          {!lowStock && risk?.tier && risk.tier !== "Low" && <Tag tone={risk.tier === "High" ? "red" : "amber"}>Expiry</Tag>}
                          {!lowStock && (!risk || risk.tier === "Low") && <Tag tone="green">OK</Tag>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {ctl.shown.length === 0 && <p className="text-stone-400 italic text-sm py-6 text-center">No matches for this search/filter.</p>}
            </div>
            {ctl.shown.length > 0 && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalCount={ctl.shown.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </>
        )}
      </div>

      {addMode === "manual" && (
        <div className={card}>
          <h3 className="text-sm font-semibold mb-3">Add product manually</h3>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputCls} placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className={inputCls} placeholder="Size (e.g. 750ml, 12oz)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
            <input className={inputCls} placeholder="Qty" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            <input className={inputCls} placeholder="Reorder point" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} />
            <input className={inputCls} placeholder="Expiry (YYYY-MM-DD)" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            <input className={inputCls} placeholder="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
            <input
              type="date"
              className={inputCls}
              value={form.receivedDate}
              onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
              title="Date received"
            />
            <input className={inputCls} placeholder="Purchase price" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
            <input className={inputCls} placeholder="Selling price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
          </div>
          <button onClick={addProduct} className={btnSmall + " mt-3"}>
            <Plus size={14} />
            Add product
          </button>
        </div>
      )}

      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Log a sale</h3>
        <select className={inputCls + " mb-2"} value={saleForm.productId} onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}>
          <option value="">Select product</option>
          {state.products.map((p) => (
            <option key={p.id} value={p.id}>
              {titleCase(p.name)} ({p.size})
            </option>
          ))}
        </select>
        <input className={inputCls} placeholder="Quantity sold" value={saleForm.qty} onChange={(e) => setSaleForm({ ...saleForm, qty: e.target.value })} />
        <button onClick={logSale} className={btnSmall + " mt-3"}>
          Log sale
        </button>
      </div>

      {selected && (
        <ProductDetailPanel
          product={selected}
          sales={state.sales}
          qtyLog={state.qtyLog}
          onClose={() => setSelected(null)}
          onDelete={removeProduct}
          onQtyChange={(newQty, changedBy, reasons, note) => changeQty(selected.id, newQty, changedBy, reasons, note)}
        />
      )}
      {addMode === "csv" && <CsvImportModal onClose={() => setAddMode(null)} onImport={importCsvProducts} />}
      {addMode === "photo" && <PhotoAddModal onClose={() => setAddMode(null)} onAdd={addPhotoProduct} />}
    </div>
  );
}
