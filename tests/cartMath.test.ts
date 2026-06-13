import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/types';
import { MAX_QTY_PER_ITEM } from '@/data/constants';
import {
  addLine,
  clampQty,
  computeTotals,
  removeLine,
  setLineQty,
  totalItemCount,
} from '@/stores/cartMath';

const line = (over: Partial<CartItem> = {}): Omit<CartItem, 'quantity'> => ({
  key: '5/red/s',
  productId: 5,
  title: 'Jacket',
  brand: 'Testwear',
  image: 'x.png',
  unitPrice: 20,
  colorId: 'red',
  colorName: 'Red',
  sizeId: 's',
  sizeLabel: 'S',
  ...over,
});

describe('clampQty', () => {
  it('caps at the per-item maximum', () => {
    expect(clampQty(MAX_QTY_PER_ITEM + 5)).toBe(MAX_QTY_PER_ITEM);
  });
  it('floors at 1', () => {
    expect(clampQty(0)).toBe(1);
    expect(clampQty(-3)).toBe(1);
  });
  it('rounds and tolerates junk', () => {
    expect(clampQty(2.7)).toBe(3);
    expect(clampQty(NaN)).toBe(1);
  });
});

describe('addLine', () => {
  it('appends a new variant', () => {
    const next = addLine([], line(), 2);
    expect(next).toHaveLength(1);
    expect(next[0].quantity).toBe(2);
  });

  it('merges quantity for an existing variant, capped', () => {
    const start = addLine([], line(), 8);
    const merged = addLine(start, line(), 8);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(MAX_QTY_PER_ITEM); // 16 clamped to 10
  });

  it('treats different variants as separate lines', () => {
    const start = addLine([], line(), 1);
    const next = addLine(start, line({ key: '5/blue/m', sizeId: 'm' }), 1);
    expect(next).toHaveLength(2);
  });
});

describe('setLineQty / removeLine', () => {
  it('updates a single line', () => {
    const start = addLine([], line(), 1);
    expect(setLineQty(start, '5/red/s', 4)[0].quantity).toBe(4);
  });
  it('removes by key', () => {
    const start = addLine([], line(), 1);
    expect(removeLine(start, '5/red/s')).toHaveLength(0);
  });
});

describe('totals', () => {
  it('counts items and computes a free-shipping subtotal', () => {
    const items = addLine([], line({ unitPrice: 30 }), 2); // 60 >= 50
    expect(totalItemCount(items)).toBe(2);
    const totals = computeTotals(items);
    expect(totals.subtotal).toBe(60);
    expect(totals.shipping).toBe(0);
    expect(totals.grandTotal).toBe(60);
  });

  it('adds flat shipping under the threshold', () => {
    const items = addLine([], line({ unitPrice: 20 }), 1); // 20 < 50
    const totals = computeTotals(items);
    expect(totals.subtotal).toBe(20);
    expect(totals.shipping).toBe(5);
    expect(totals.grandTotal).toBe(25);
  });

  it('avoids floating-point drift', () => {
    const items = addLine([], line({ unitPrice: 19.99 }), 3);
    expect(computeTotals(items).subtotal).toBe(59.97);
  });
});
