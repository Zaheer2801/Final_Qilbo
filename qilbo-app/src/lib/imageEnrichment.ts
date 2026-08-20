import type { Product } from "../types";

// Two image sources, tried in order:
//
// 1. The local image-search server (server/) — scrapes DuckDuckGo/Bing image
//    results for real product/brand photos. Much better hit rate and quality
//    than Commons, but these images are NOT freely licensed (they're the
//    retailer's or brand's own copyrighted photography) and DuckDuckGo's
//    terms don't cover scraping their results. This was an explicit choice —
//    see server/index.js's header comment — for internal inventory display,
//    not redistribution. Needs `npm run dev` running in server/ separately;
//    if it's not reachable, this silently falls through to source 2 rather
//    than blocking the whole enrichment run.
// 2. Wikimedia Commons — freely-licensed, CORS-enabled via `origin=*`, no
//    backend or API key needed, but weaker coverage/relevance.
//
// Background removal (rembg) needs a server-side Python runtime and isn't
// built here — images are used as-is from whichever source matched.

const IMAGE_SERVER_URL = "http://localhost:8787";

const OK_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const BAD_WORDS = ["press", "skins", "document", "manuscript", "archief", "map", "diagram"];

// Wikimedia rate-limits bursts of anonymous requests (learned the hard way
// pulling the initial sample catalog's photos) — 900ms between requests
// keeps a full inventory import well under that. The local image-search
// server has its own cache and isn't rate-limited the same way, but the same
// pacing is kept here so a batch doesn't hammer either source in a tight loop.
const REQUEST_DELAY_MS = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchLocalServer(query: string): Promise<string | null> {
  try {
    const resp = await fetch(`${IMAGE_SERVER_URL}/api/image-search?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.result?.url ?? null;
  } catch {
    // Server not running / unreachable — fall through to Commons rather than failing the batch.
    return null;
  }
}

async function searchCommonsImage(query: string): Promise<string | null> {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: query,
      gsrlimit: "6",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "400",
      format: "json",
      origin: "*",
    }).toString();

  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const pages = Object.values(data?.query?.pages ?? {}) as any[];
    pages.sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
    for (const page of pages) {
      const title: string = page.title ?? "";
      const lower = title.toLowerCase();
      if (!OK_EXT.some((ext) => lower.endsWith(ext))) continue;
      if (BAD_WORDS.some((w) => lower.includes(w))) continue;
      const info = page.imageinfo?.[0];
      const thumb = info?.thumburl || info?.url;
      if (thumb) return thumb.split("?")[0];
    }
    return null;
  } catch {
    return null;
  }
}

export function buildImageQuery(p: Pick<Product, "brand" | "name" | "size">): string {
  return [p.brand, p.name, "bottle"].filter(Boolean).join(" ");
}

export interface EnrichmentProgress {
  done: number;
  total: number;
}

/**
 * Fetches an image for each given product sequentially and reports progress.
 * Returns a Map of productId -> imageUrl for the ones a match was found for;
 * products with no acceptable match are simply absent from the result (the
 * UI falls back to the placeholder icon, same as any other product without
 * a photo — never fabricated).
 */
export async function enrichProductImages(
  products: Product[],
  onProgress: (progress: EnrichmentProgress) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const total = products.length;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const query = buildImageQuery(p);
    const url = (await searchLocalServer(query)) ?? (await searchCommonsImage(query));
    if (url) results.set(p.id, url);
    onProgress({ done: i + 1, total });
    if (i < products.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  return results;
}
