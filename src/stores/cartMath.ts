import type { CartItem } from '@/types';
import { MAX_QTY_PER_ITEM } from '@/data/constants';

// ---------------------------------------------------------------------------
// Pure cart math — kept separate from the React context so it can be unit
// tested in isolation and reused by selectors.
// ---------------------------------------------------------------------------

/** Free shipping over this subtotal, otherwise a flat fee applies. */
export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING_FEE = 5;

export function buildCartKey(
  productId: number,
  colorId: string,
  sizeId: string,
): string {
  return `${productId}/${colorId}/${sizeId}`;
}

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.round(qty)));
}

export function totalItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function subtotal(items: CartItem[]): number {
  const cents = items.reduce(
    (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  );
  return cents / 100;
}

export function shippingFor(sub: number): number {
  if (sub === 0 || sub >= FREE_SHIPPING_THRESHOLD) return 0;
  return FLAT_SHIPPING_FEE;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  grandTotal: number;
}

export function computeTotals(items: CartItem[]): CartTotals {
  const sub = subtotal(items);
  const shipping = shippingFor(sub);
  return { subtotal: sub, shipping, grandTotal: sub + shipping };
}

/**
 * Add a line to the cart, merging quantities when the same variant already
 * exists. Quantity is clamped to the per-item cap. Returns a new array.
 */
export function addLine(
  items: CartItem[],
  line: Omit<CartItem, 'quantity'>,
  qty: number,
): CartItem[] {
  const existing = items.find((i) => i.key === line.key);
  if (existing) {
    return items.map((i) =>
      i.key === line.key ? { ...i, quantity: clampQty(i.quantity + qty) } : i,
    );
  }
  return [...items, { ...line, quantity: clampQty(qty) }];
}

export function setLineQty(
  items: CartItem[],
  key: string,
  qty: number,
): CartItem[] {
  return items.map((i) => (i.key === key ? { ...i, quantity: clampQty(qty) } : i));
}

export function removeLine(items: CartItem[], key: string): CartItem[] {
  return items.filter((i) => i.key !== key);
}
