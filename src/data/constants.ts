import type { ColorOption, SizeOption } from '@/types';

// ---------------------------------------------------------------------------
// Merchandising config
// ---------------------------------------------------------------------------
// The Fake Store API gives us no brand, sale, colour, size or stock data. We
// synthesise those (see `variants.ts`). This file holds the static pools the
// generator draws from, plus a couple of app-wide limits.

/** Hard cap on quantity per cart line (used by the quantity picker + cart). */
export const MAX_QTY_PER_ITEM = 10;

/** Probability (0–1) that any given product is on sale. */
export const SALE_RATE = 0.4;

/** Colour pool. The generator picks a stable subset per product. */
export const COLOR_POOL: ColorOption[] = [
  { id: 'midnight', name: 'Midnight', hex: '#1c2230' },
  { id: 'slate', name: 'Slate', hex: '#5b6470' },
  { id: 'fog', name: 'Fog', hex: '#d6dae0' },
  { id: 'sand', name: 'Sand', hex: '#d8c3a5' },
  { id: 'clay', name: 'Clay', hex: '#b5673f' },
  { id: 'forest', name: 'Forest', hex: '#1f6f5c' },
  { id: 'berry', name: 'Berry', hex: '#7d2150' },
  { id: 'gold', name: 'Gold', hex: '#c79a3b' },
];

/** Size pools by API category. Keys match the Fake Store category strings. */
export const SIZE_SETS: Record<string, SizeOption[]> = {
  "men's clothing": [
    { id: 'xs', label: 'XS' },
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' },
  ],
  "women's clothing": [
    { id: 'xs', label: 'XS' },
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' },
  ],
  jewelery: [
    { id: '16in', label: '16"' },
    { id: '18in', label: '18"' },
    { id: '20in', label: '20"' },
    { id: '22in', label: '22"' },
  ],
  electronics: [
    { id: '128gb', label: '128GB' },
    { id: '256gb', label: '256GB' },
    { id: '512gb', label: '512GB' },
    { id: '1tb', label: '1TB' },
  ],
};

/** Fallback size set for any unexpected category. */
export const DEFAULT_SIZE_SET: SizeOption[] = [
  { id: 'one-size', label: 'One Size' },
];

/** Brand pools by category, so synthesised brands read plausibly. */
export const BRAND_SETS: Record<string, string[]> = {
  "men's clothing": ['Northbound', 'Atlas & Co.', 'Rugged Theory', 'Vantage'],
  "women's clothing": ['Maison Lure', 'Soliel', ' Favor', 'Wren & Ivy'],
  jewelery: ['Aurelle', 'Lumen', 'Goldsmith Row', 'Halcyon'],
  electronics: ['Nodex', 'Voltline', 'Circuit Lab', 'Hertz'],
};

export const DEFAULT_BRAND = 'Nua';
