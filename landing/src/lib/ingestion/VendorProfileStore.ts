/**
 * Vendor Profile Data Store
 * Profiles stored as runtime JSON data objects (supports runtime discovery & self-service onboarding)
 */

import type { VendorProfileData } from "./types";

export const BUILTIN_VENDOR_PROFILES: VendorProfileData[] = [
  {
    vendor_id: "wayne_densch",
    vendor_name: "Wayne Densch, Inc.",
    version: 1,
    fingerprint: ["WAYNE DENSCH", "2900 W FIRST ST", "(407) 323-5600", "523219"],
    record_shape: "multi_line",
    line_start_regex: "^(?<item>\\d{4,6})\\s+(?<qty>-?\\d+)\\s+(?<upc>\\d{11,14})",
    columns: {
      qty_means: "cases",
      has_upc: true,
      pack_source: "description",
    },
    footer: {
      total_regex: "Total Sales\\s+([\\d,]+\\.\\d{2})",
      cases_regex: "Cases:\\s+(\\d+)",
      units_regex: "Units:\\s+(\\d+)",
    },
    quirks: ["glued_description"],
  },
  {
    vendor_id: "bbg_breakthru",
    vendor_name: "BBG Spirits and Wine (Breakthru Beverage)",
    version: 1,
    fingerprint: ["BBG Spirits and Wine", "4901 Savarese Circle", "PICKLIST"],
    record_shape: "single_line",
    columns: {
      qty_means: "both",
      has_upc: false, // Match by vendor item # instead
      pack_source: "units_column",
    },
    footer: {
      total_regex: "Total Sales\\s+([\\d,]+\\.\\d{2})",
      cases_regex: "Cases:\\s+(\\d+)",
      units_regex: "Units:\\s+(\\d+)",
      picklist_indicator: "PICKLIST - THIS IS NOT AN INVOICE",
    },
  },
];

class VendorProfileStore {
  private profiles: Map<string, VendorProfileData> = new Map();

  constructor() {
    // Load built-in profiles and any localStorage persisted profiles
    BUILTIN_VENDOR_PROFILES.forEach((p) => this.profiles.set(p.vendor_id, p));
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem("qilbo_vendor_profiles_v1");
      if (saved) {
        const parsed: VendorProfileData[] = JSON.parse(saved);
        parsed.forEach((p) => this.profiles.set(p.vendor_id, p));
      }
    } catch (e) {
      console.warn("Failed to load vendor profiles from localStorage", e);
    }
  }

  public saveProfile(profile: VendorProfileData): void {
    this.profiles.set(profile.vendor_id, profile);
    try {
      const allProfiles = Array.from(this.profiles.values());
      localStorage.setItem("qilbo_vendor_profiles_v1", JSON.stringify(allProfiles));
    } catch (e) {
      console.warn("Failed to persist vendor profile to localStorage", e);
    }
  }

  public findByFingerprint(headerText: string): VendorProfileData | null {
    const textUpper = headerText.toUpperCase();
    for (const profile of this.profiles.values()) {
      const matchCount = profile.fingerprint.filter((fp) =>
        textUpper.includes(fp.toUpperCase())
      ).length;
      if (matchCount >= 2 || (profile.fingerprint.length === 1 && matchCount === 1)) {
        return profile;
      }
    }
    return null;
  }

  public getAllProfiles(): VendorProfileData[] {
    return Array.from(this.profiles.values());
  }
}

export const vendorProfileStore = new VendorProfileStore();
