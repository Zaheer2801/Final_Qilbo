import express from "express";
import cors from "cors";

// Scrapes DuckDuckGo's image search (which aggregates Bing results) for a
// product photo. This is genuinely different from the Wikimedia Commons
// lookup used elsewhere in the app: those images are explicitly licensed for
// reuse, these are not — DuckDuckGo's terms don't cover programmatic scraping
// of search results, and most returned images are the retailer's or brand's
// own copyrighted product photography. The user explicitly chose this path
// for internal inventory-display use (not redistribution/resale) after being
// told the alternative was a free/licensed-only source with weaker coverage.
// Runs server-side because DuckDuckGo doesn't allow cross-origin browser
// requests to these endpoints (no CORS headers on their side).

const PORT = process.env.PORT || 8787;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const OK_FORMATS = new Set(["jpeg", "jpg", "png", "webp"]);
const MIN_DIMENSION = 200; // skip icons/tiny thumbnails, not real product shots

// Simple in-memory cache — same query re-run (e.g. retrying a failed
// enrichment batch) shouldn't re-scrape. Not persisted; fine for a
// single-process dev/prototype server.
const cache = new Map(); // query -> { url, title, source } | null
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cacheTimestamps = new Map();

async function getVqd(query) {
  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
  const res = await fetch(searchUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`search page fetch failed: ${res.status}`);
  const html = await res.text();
  const m = html.match(/vqd=['"]([\d-]+)['"]/) || html.match(/vqd=([\d-]+)&/);
  if (!m) throw new Error("could not find vqd token");
  return { vqd: m[1], searchUrl };
}

async function searchImages(query) {
  const { vqd, searchUrl } = await getVqd(query);
  const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`;
  const res = await fetch(imgUrl, {
    headers: { "User-Agent": UA, Referer: searchUrl, "X-Requested-With": "XMLHttpRequest" },
  });
  if (!res.ok) throw new Error(`image results fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.results) ? data.results : [];
}

function pickBest(results) {
  for (const r of results) {
    const fmt = (r.encoding_format || "").toLowerCase();
    if (!OK_FORMATS.has(fmt)) continue;
    if ((r.width || 0) < MIN_DIMENSION || (r.height || 0) < MIN_DIMENSION) continue;
    if (!r.image) continue;
    return { url: r.image, title: r.title || "", source: r.url || "" };
  }
  return null;
}

const app = express();
app.use(cors());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/image-search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "missing q" });

  const cached = cache.get(q);
  const cachedAt = cacheTimestamps.get(q) || 0;
  if (cached !== undefined && Date.now() - cachedAt < CACHE_TTL_MS) {
    return res.json({ result: cached, cached: true });
  }

  try {
    const results = await searchImages(q);
    const best = pickBest(results);
    cache.set(q, best);
    cacheTimestamps.set(q, Date.now());
    res.json({ result: best, cached: false });
  } catch (err) {
    console.error(`image-search failed for "${q}":`, err.message);
    res.status(502).json({ error: "search failed", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Qilbo image-search server listening on http://localhost:${PORT}`);
});
