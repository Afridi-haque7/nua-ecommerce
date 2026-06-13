import { describe, expect, it } from 'vitest';
import type { ApiProduct } from '@/types';
import {
  effectivePrice,
  enrichProduct,
  firstAvailableVariant,
  getStock,
  resolveVariant,
} from '@/data/variants';
import { makeProduct } from './fixtures';

const apiProduct: ApiProduct = {
  id: 7,
  title: 'Seed Product',
  price: 80,
  description: 'desc',
  category: "women's clothing",
  image: 'x.png',
  rating: { rate: 4, count: 10 },
};

describe('enrichProduct', () => {
  it('is deterministic for the same id', () => {
    expect(enrichProduct(apiProduct)).toEqual(enrichProduct(apiProduct));
  });

  it('always yields at least one buyable variant', () => {
    // Sweep a range of ids; none should be entirely sold out.
    for (let id = 1; id <= 40; id++) {
      const p = enrichProduct({ ...apiProduct, id });
      expect(firstAvailableVariant(p)).not.toBeNull();
    }
  });

  it('keeps a sale price below the list price when present', () => {
    for (let id = 1; id <= 40; id++) {
      const p = enrichProduct({ ...apiProduct, id });
      if (p.salePrice !== null) {
        expect(p.salePrice).toBeLessThan(p.listPrice);
        expect(effectivePrice(p)).toBe(p.salePrice);
      } else {
        expect(effectivePrice(p)).toBe(p.listPrice);
      }
    }
  });
});

describe('getStock', () => {
  const product = makeProduct();
  it('reads the stock matrix by colour + size', () => {
    expect(getStock(product, 'red', 's')).toBe('in_stock');
    expect(getStock(product, 'red', 'm')).toBe('sold_out');
    expect(getStock(product, 'blue', 's')).toBe('low_stock');
  });
  it('treats unknown variants as sold out', () => {
    expect(getStock(product, 'green', 'xl')).toBe('sold_out');
  });
});

describe('firstAvailableVariant', () => {
  it('skips sold-out combinations', () => {
    // red/s is in_stock, so it should be picked first.
    expect(firstAvailableVariant(makeProduct())).toEqual({
      colorId: 'red',
      sizeId: 's',
    });
  });

  it('returns null when everything is sold out', () => {
    const dead = makeProduct({
      stock: {
        'red/s': 'sold_out',
        'red/m': 'sold_out',
        'blue/s': 'sold_out',
        'blue/m': 'sold_out',
      },
    });
    expect(firstAvailableVariant(dead)).toBeNull();
  });
});

describe('resolveVariant', () => {
  const product = makeProduct();
  it('honours valid ids from the URL', () => {
    expect(resolveVariant(product, 'blue', 'm')).toEqual({
      colorId: 'blue',
      sizeId: 'm',
    });
  });
  it('falls back per-field for invalid ids', () => {
    expect(resolveVariant(product, 'pink', 'xxl')).toEqual({
      colorId: 'red',
      sizeId: 's',
    });
  });
});
