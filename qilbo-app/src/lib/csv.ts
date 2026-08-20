import type { Product } from "../types";

// Minimal RFC-4180-ish parser: handles quoted fields, escaped quotes ("")
// and commas inside quotes. Good enough for spreadsheet exports; not a
// full CSV spec implementation.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// Excel "force text" pattern — some POS exports wrap every cell (UPCs,
// sizes, stock counts…) as ="12345" so Excel won't mangle leading zeros or
// treat a barcode as a number. After CSV-unescaping this survives as the
// literal characters ="12345" in the field; strip it back to 12345.
function stripExcelForceText(value: string): string {
  const m = value.match(/^="(.*)"$/);
  return m ? m[1] : value;
}

export interface CsvImportResult {
  products: Product[];
  missingImageCount: number;
  skippedRows: number;
}

const HEADER_ALIASES: Record<string, string> = {
  product_id: "id",
  id: "id",
  sku: "id",
  upc: "id",
  product_name: "name",
  name: "name",
  brand: "brand",
  category: "category",
  department: "category",
  size: "size",
  volume: "size",
  bottle_size: "size",
  container_size: "size",
  size_ml: "size",
  ml: "size",
  qty: "qty",
  qty_on_hand: "qty",
  quantity: "qty",
  reorder_point: "reorderPoint",
  reorderpoint: "reorderPoint",
  purchase_price: "purchasePrice",
  cost: "purchasePrice",
  selling_price: "sellingPrice",
  price: "sellingPrice",
  // POS registers commonly store prices as integer cents (599 = $5.99)
  // rather than a decimal dollar string — kept as separate keys so the
  // /100 conversion only applies to genuinely cents-denominated columns.
  cents: "sellingPriceCents",
  cost_cents: "purchasePriceCents",
  expiry: "expiryDate",
  expiry_date: "expiryDate",
  expirydate: "expiryDate",
  vendor: "vendor",
  supplier: "vendor",
  received_date: "receivedDate",
  receiveddate: "receivedDate",
  image_url: "imageUrl",
  imageurl: "imageUrl",
  image: "imageUrl",
  // Deliberately NOT mapped: uom / unit. Liquor distributor CSVs almost
  // always use those for packaging type ("Bottle", "Case", "Each"), not the
  // actual volume — mapping them to `size` overwrote real bottle sizes
  // (750ml, 50ml…) with the literal word "Bottle" on import.
};

function normalizeHeader(h: string): string | null {
  const key = h.trim().toLowerCase().replace(/\s+/g, "_");
  return HEADER_ALIASES[key] ?? null;
}

export function csvToProducts(text: string): CsvImportResult {
  const rows = parseCsv(text);
  if (rows.length === 0) return { products: [], missingImageCount: 0, skippedRows: 0 };

  const headerRow = rows[0];
  const fields = headerRow.map(normalizeHeader);

  const products: Product[] = [];
  const usedIds = new Set<string>();
  let missingImageCount = 0;
  let skippedRows = 0;

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const rec: Record<string, string> = {};
    fields.forEach((f, i) => {
      if (f && cells[i] !== undefined) rec[f] = stripExcelForceText(cells[i].trim());
    });

    if (!rec.name) {
      skippedRows++;
      continue;
    }

    // Some POS exports (pack/case variants under one UPC) repeat the same
    // id across rows with different size/price — keep every row as its own
    // product rather than silently dropping the pack variants, since a
    // suffixed id is more honest than either overwriting or discarding data.
    let id = rec.id || "PC" + Date.now() + Math.floor(Math.random() * 1000);
    if (usedIds.has(id)) {
      let n = 2;
      while (usedIds.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    usedIds.add(id);

    // "Brand:Variant" naming convention (seen in several POS exports that
    // don't have a separate brand column) — only applied when no explicit
    // brand column was already mapped, so it never overwrites real data.
    let name = rec.name;
    let brand = rec.brand;
    if (!brand && name.includes(":")) {
      const idx = name.indexOf(":");
      brand = name.slice(0, idx).trim();
      name = name.slice(idx + 1).trim() || rec.name;
    }

    const sellingPrice = rec.sellingPrice ? Number(rec.sellingPrice) : rec.sellingPriceCents ? Number(rec.sellingPriceCents) / 100 : 0;
    const purchasePrice = rec.purchasePrice ? Number(rec.purchasePrice) : rec.purchasePriceCents ? Number(rec.purchasePriceCents) / 100 : 0;

    const p: Product = {
      id,
      name,
      brand: brand || undefined,
      category: rec.category || "",
      size: rec.size || "",
      // Deliberately always 0, regardless of any qty-like column in the
      // source — bulk imports don't carry a trustworthy on-hand count (a
      // real POS pricebook export used "qty" for a per-scan sale unit,
      // always 1, with the actual stock field unset for every row). Real
      // counts get established one product at a time via Edit quantity,
      // which requires a name and reason and logs the change.
      qty: 0,
      reorderPoint: Number(rec.reorderPoint || 0),
      purchasePrice,
      sellingPrice,
      expiryDate: rec.expiryDate || "",
      vendor: rec.vendor || undefined,
      receivedDate: rec.receivedDate || undefined,
      imageUrl: rec.imageUrl || undefined,
    };
    if (!p.imageUrl) missingImageCount++;
    products.push(p);
  }

  return { products, missingImageCount, skippedRows };
}
