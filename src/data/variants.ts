import type {
  ApiProduct,
  CartItem,
  ColorOption,
  Product,
  SizeOption,
  StockState,
} from '@/types';
import {
  BRAND_SETS,
  COLOR_POOL,
  DEFAULT_BRAND,
  DEFAULT_SIZE_SET,
  SALE_RATE,
  SIZE_SETS,
} from './constants';

// ---------------------------------------------------------------------------
// Deterministic variant synthesis
// ---------------------------------------------------------------------------
// The API has no merchandising data, so we generate it. The hard requirement
// is *determinism*: the same product id must always yield the same brand,
// sale price, colours, sizes and stock — otherwise a deep-linked variant URL
// (or a refresh) could point at a combination that no longer exists.
//
// We seed a tiny PRNG with the product id and pull every decision from it.

/** mulberry32 — a compact, well-distributed seeded PRNG. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Stable key for the per-variant stock map. */
export function stockKey(colorId: string, sizeId: string): string {
  return `${colorId}/${sizeId}`;
}

function buildColors(rng: () => number): ColorOption[] {
  // 3–5 distinct colours, order-stable.
  const count = 3 + Math.floor(rng() * 3);
  const pool = [...COLOR_POOL];
  const chosen: ColorOption[] = [];
  while (chosen.length < count && pool.length) {
    const idx = Math.floor(rng() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}

function buildStock(
  rng: () => number,
  colors: ColorOption[],
  sizes: SizeOption[],
): Record<string, StockState> {
  const stock: Record<string, StockState> = {};
  for (const color of colors) {
    for (const size of sizes) {
      const roll = rng();
      // Weighted: ~62% in stock, ~20% low, ~18% sold out.
      let state: StockState;
      if (roll < 0.62) state = 'in_stock';
      else if (roll < 0.82) state = 'low_stock';
      else state = 'sold_out';
      stock[stockKey(color.id, size.id)] = state;
    }
  }
  // Guarantee at least one buyable variant so the product is never a dead end.
  const hasBuyable = Object.values(stock).some((s) => s !== 'sold_out');
  if (!hasBuyable) {
    stock[stockKey(colors[0].id, sizes[0].id)] = 'in_stock';
  }
  return stock;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Enrich a raw API product with deterministic merchandising data. */
export function enrichProduct(api: ApiProduct): Product {
  const rng = makeRng(api.id * 2654435761);

  const brands = BRAND_SETS[api.category] ?? [DEFAULT_BRAND];
  const brand = pick(rng, brands).trim();

  const colors = buildColors(rng);
  const sizes = SIZE_SETS[api.category] ?? DEFAULT_SIZE_SET;
  const stock = buildStock(rng, colors, sizes);

  // Sale decision pulled before any pricing math so it stays stable.
  const onSale = rng() < SALE_RATE;
  const salePrice = onSale
    ? roundMoney(api.price * (1 - (0.1 + rng() * 0.3))) // 10–40% off
    : null;

  return {
    ...api,
    brand,
    listPrice: api.price,
    salePrice,
    colors,
    sizes,
    stock,
  };
}

export function enrichProducts(items: ApiProduct[]): Product[] {
  return items.map(enrichProduct);
}

// --- Lookups used across the UI -------------------------------------------

export function getStock(
  product: Product,
  colorId: string,
  sizeId: string,
): StockState {
  return product.stock[stockKey(colorId, sizeId)] ?? 'sold_out';
}

/** Effective (sale-aware) unit price. */
export function effectivePrice(product: Product): number {
  return product.salePrice ?? product.listPrice;
}

/** First colour+size combination that is buyable, or null if truly sold out. */
export function firstAvailableVariant(
  product: Product,
): { colorId: string; sizeId: string } | null {
  for (const color of product.colors) {
    for (const size of product.sizes) {
      if (getStock(product, color.id, size.id) !== 'sold_out') {
        return { colorId: color.id, sizeId: size.id };
      }
    }
  }
  return null;
}

/** Build a cart line (sans quantity) for a product + resolved variant. */
export function buildCartLine(
  product: Product,
  colorId: string,
  sizeId: string,
): Omit<CartItem, 'quantity'> {
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  return {
    key: `${product.id}/${color.id}/${size.id}`,
    productId: product.id,
    title: product.title,
    brand: product.brand,
    image: product.image,
    unitPrice: effectivePrice(product),
    colorId: color.id,
    colorName: color.name,
    sizeId: size.id,
    sizeLabel: size.label,
  };
}

/**
 * Resolve a requested variant against what actually exists, falling back to a
 * valid default. Used to sanitise variant ids coming from the URL.
 */
export function resolveVariant(
  product: Product,
  colorId?: string | null,
  sizeId?: string | null,
): { colorId: string; sizeId: string } {
  const color =
    product.colors.find((c) => c.id === colorId) ?? product.colors[0];
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  return { colorId: color.id, sizeId: size.id };
}
