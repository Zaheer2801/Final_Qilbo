import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import type { Product } from "../../types";
import { csvToProducts } from "../../lib/csv";
import { enrichProductImages, type EnrichmentProgress } from "../../lib/imageEnrichment";
import { btnGhost, btnPrimary, btnSmall, card, CategoryPill } from "../ui";
import { titleCase } from "../../lib/format";

type Stage = "pick" | "preview" | "enriching" | "done";

export default function CsvImportModal({ onClose, onImport }: { onClose: () => void; onImport: (products: Product[]) => void }) {
  const [stage, setStage] = useState<Stage>("pick");
  const [products, setProducts] = useState<Product[]>([]);
  const [skippedRows, setSkippedRows] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<EnrichmentProgress | null>(null);

  const missingImageCount = products.filter((p) => !p.imageUrl).length;

  function handleFile(file: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const result = csvToProducts(text);
      if (result.products.length === 0) {
        setError("No usable rows found — make sure the CSV has a header row with at least a name/product_name column.");
        return;
      }
      setProducts(result.products);
      setSkippedRows(result.skippedRows);
      setStage("preview");
    };
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsText(file);
  }

  async function startEnrichment() {
    setStage("enriching");
    const targets = products.filter((p) => !p.imageUrl);
    const found = await enrichProductImages(targets, setProgress);
    setProducts((prev) => prev.map((p) => (found.has(p.id) ? { ...p, imageUrl: found.get(p.id) } : p)));
    setStage("done");
  }

  function finishImport() {
    onImport(products);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className={card + " w-full max-w-xl max-h-[85vh] overflow-y-auto"} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Upload inventory CSV</h3>
            <span className="text-xs text-stone-500">Columns recognized: product_id, product_name, brand, category, size, qty, reorder_point, purchase_price, selling_price, expiry_date, vendor</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 shrink-0">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</p>}

        {stage === "pick" && (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-lg py-10 cursor-pointer hover:border-amber-700/40 hover:bg-amber-50/30">
            <Upload size={22} className="text-stone-400" />
            <span className="text-sm text-stone-600">Click to choose a .csv file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        )}

        {stage === "preview" && (
          <div>
            <p className="text-sm text-stone-700 mb-1">
              Parsed <span className="font-semibold">{products.length}</span> product{products.length === 1 ? "" : "s"}
              {skippedRows > 0 && <span className="text-stone-500"> ({skippedRows} row{skippedRows === 1 ? "" : "s"} skipped — missing a name)</span>}.
            </p>
            <p className="text-xs text-stone-500 mb-3">
              Quantity on hand always imports as 0 — bulk price-list exports don't carry a trustworthy stock count. Set real counts
              afterward with Edit quantity on each product, which logs who counted it, when, and why.
            </p>

            <div className="rounded-md border border-stone-200 overflow-hidden mb-4">
              <table className="w-full text-xs">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-medium">Name</th>
                    <th className="text-left px-2 py-1.5 font-medium">Brand</th>
                    <th className="text-left px-2 py-1.5 font-medium">Category</th>
                    <th className="text-left px-2 py-1.5 font-medium">Size</th>
                    <th className="text-right px-2 py-1.5 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 6).map((p) => (
                    <tr key={p.id} className="border-t border-stone-100">
                      <td className="px-2 py-1.5">{titleCase(p.name)}</td>
                      <td className="px-2 py-1.5 text-stone-500">{p.brand ? titleCase(p.brand) : "—"}</td>
                      <td className="px-2 py-1.5 text-stone-500">{p.category ? <CategoryPill category={p.category} /> : "—"}</td>
                      <td className="px-2 py-1.5 text-stone-500">{p.size || "—"}</td>
                      <td className="px-2 py-1.5 text-right">${p.sellingPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length > 6 && <div className="text-center text-[11px] text-stone-400 py-1.5 border-t border-stone-100">+{products.length - 6} more</div>}
            </div>

            {missingImageCount > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 mb-4">
                <p className="text-sm text-amber-900 mb-2">
                  {missingImageCount} of {products.length} products don't have an image URL. Auto-fetch product images?
                </p>
                <p className="text-[11px] text-amber-800/80 mb-3">
                  Looks up a matching bottle photo per product — tries the local image-search server first (real retailer/brand photos;
                  needs `npm run dev` running in server/), falling back to Wikimedia Commons (freely-licensed) if that's not running or
                  finds nothing. Not every product will find a match — those keep the placeholder icon rather than showing something wrong.
                </p>
                <div className="flex gap-2">
                  <button onClick={startEnrichment} className={btnPrimary}>
                    Yes, auto-fetch images
                  </button>
                  <button onClick={finishImport} className={btnSmall}>
                    No, import as-is
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={finishImport} className={btnPrimary}>
                Import {products.length} product{products.length === 1 ? "" : "s"}
              </button>
            )}
          </div>
        )}

        {stage === "enriching" && (
          <div className="py-6">
            <div className="flex items-center gap-2 text-sm text-stone-700 mb-3">
              <Loader2 size={16} className="animate-spin text-amber-800" />
              Enriching {progress?.total ?? missingImageCount} products
              {progress ? ` — ${Math.round((progress.done / progress.total) * 100)}% complete` : "…"}
            </div>
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-amber-700 transition-all duration-200"
                style={{ width: `${progress ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-2">Looked up one at a time to stay within Wikimedia's rate limits — this can take a minute for larger imports.</p>
          </div>
        )}

        {stage === "done" && (
          <div>
            <p className="text-sm text-stone-700 mb-4">
              Done — found images for {products.filter((p) => p.imageUrl).length} of {products.length} products.
            </p>
            <button onClick={finishImport} className={btnPrimary}>
              Import {products.length} product{products.length === 1 ? "" : "s"}
            </button>
          </div>
        )}

        {stage !== "pick" && stage !== "enriching" && (
          <button onClick={onClose} className={btnGhost + " mt-3"}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
