// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/** Raw product shape returned by the Fake Store API. */
export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

/** Per-variant availability. */
export type StockState = 'in_stock' | 'low_stock' | 'sold_out';

export interface ColorOption {
  /** url-safe slug, used in the URL and as a stock key. */
  id: string;
  name: string;
  /** swatch fill. */
  hex: string;
}

export interface SizeOption {
  /** url-safe slug, used in the URL and as a stock key. */
  id: string;
  label: string;
}

/**
 * A product enriched with the merchandising data the Fake Store API does not
 * provide (brand, sale price, colours, sizes, per-variant stock).
 *
 * Everything here is derived *deterministically* from the product id — see
 * `src/data/variants.ts` — so a given URL always resolves to the same variant
 * state across reloads and shared links.
 */
export interface Product extends ApiProduct {
  brand: string;
  /** Original list price (always === `price`, kept for clarity at call sites). */
  listPrice: number;
  /** Discounted price when on sale, otherwise null. */
  salePrice: number | null;
  colors: ColorOption[];
  sizes: SizeOption[];
  /** Stock keyed by `${colorId}/${sizeId}`. */
  stock: Record<string, StockState>;
}

/** A line in the cart. One per unique product + colour + size combination. */
export interface CartItem {
  /** Stable identity: `${productId}/${colorId}/${sizeId}`. */
  key: string;
  productId: number;
  title: string;
  brand: string;
  image: string;
  /** Price paid per unit at the moment of adding (sale-aware). */
  unitPrice: number;
  colorId: string;
  colorName: string;
  sizeId: string;
  sizeLabel: string;
  quantity: number;
}

/** The current variant selection for a product, mirrored in the URL. */
export interface VariantSelection {
  colorId: string;
  sizeId: string;
}
