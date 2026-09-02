/**
 * Vendor SKU Identity Mapping Store (Product identity when there is no UPC)
 * Manages vendor_skus(vendor_id, vendor_item_no, upc, confirmed_at)
 */

export interface VendorSkuMapping {
  vendor_id: string;
  vendor_item_no: string;
  upc: string; // Preserved leading-zero string ID
  description: string;
  confirmed_at: string;
}

// Built-in initial confirmed vendor SKU mappings for BBG spirits
export const BUILTIN_VENDOR_SKUS: VendorSkuMapping[] = [
  {
    vendor_id: "bbg_breakthru",
    vendor_item_no: "1001",
    upc: "088004051010",
    description: "Veuve Clicquot Brut 750ml",
    confirmed_at: "2026-08-31T00:00:00Z",
  },
  {
    vendor_id: "bbg_breakthru",
    vendor_item_no: "1002",
    upc: "088004051012",
    description: "Caymus Cabernet Napa 750ml",
    confirmed_at: "2026-08-31T00:00:00Z",
  },
];

class VendorSkuStore {
  private mappings: Map<string, VendorSkuMapping> = new Map();

  constructor() {
    BUILTIN_VENDOR_SKUS.forEach((m) => {
      this.mappings.set(`${m.vendor_id}:${m.vendor_item_no}`, m);
    });
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem("qilbo_vendor_skus_v1");
      if (saved) {
        const parsed: VendorSkuMapping[] = JSON.parse(saved);
        parsed.forEach((m) => this.mappings.set(`${m.vendor_id}:${m.vendor_item_no}`, m));
      }
    } catch (e) {
      console.warn("Failed to load vendor SKU mappings from localStorage", e);
    }
  }

  public getMapping(vendor_id: string, vendor_item_no: string): VendorSkuMapping | null {
    return this.mappings.get(`${vendor_id}:${vendor_item_no}`) || null;
  }

  public saveMapping(vendor_id: string, vendor_item_no: string, upc: string, description: string): void {
    const mapping: VendorSkuMapping = {
      vendor_id,
      vendor_item_no,
      upc: String(upc).padStart(12, "0"), // PRESERVE STRING LEADING ZEROS
      description,
      confirmed_at: new Date().toISOString(),
    };
    this.mappings.set(`${vendor_id}:${vendor_item_no}`, mapping);
    try {
      const all = Array.from(this.mappings.values());
      localStorage.setItem("qilbo_vendor_skus_v1", JSON.stringify(all));
    } catch (e) {
      console.warn("Failed to persist vendor SKU mappings", e);
    }
  }
}

export const vendorSkuStore = new VendorSkuStore();
