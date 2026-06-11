/**
 * The Fake Store API serves full-size PNGs (300–700 KB) — the single biggest
 * LCP cost in the app (flagged by the unlighthouse scan). We route renders
 * through the wsrv.nl image proxy (Cloudflare-backed) to get resized, webp
 * versions at ~10% of the bytes. `ProductImage` falls back to the original
 * URL if the proxy ever fails.
 */
export function optimizedImageUrl(src: string, width: number): string {
  const bare = src.replace(/^https?:\/\//, '');
  return `https://wsrv.nl/?url=${encodeURIComponent(bare)}&w=${width}&output=webp&q=80`;
}
