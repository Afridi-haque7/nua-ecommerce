import type { Product } from '@/types';

/**
 * A hand-built product with a *known* stock matrix so tests can assert exact
 * sold-out / low-stock / in-stock behaviour without relying on the generator.
 *
 *            size: s            size: m
 *  red       in_stock          sold_out
 *  blue      low_stock         in_stock
 */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 5,
    title: 'Test Jacket',
    price: 100,
    description: 'A jacket for testing.',
    category: "men's clothing",
    image: 'https://example.com/jacket.png',
    rating: { rate: 4.2, count: 88 },
    brand: 'Testwear',
    listPrice: 100,
    salePrice: null,
    colors: [
      { id: 'red', name: 'Red', hex: '#ff0000' },
      { id: 'blue', name: 'Blue', hex: '#0000ff' },
    ],
    sizes: [
      { id: 's', label: 'S' },
      { id: 'm', label: 'M' },
    ],
    stock: {
      'red/s': 'in_stock',
      'red/m': 'sold_out',
      'blue/s': 'low_stock',
      'blue/m': 'in_stock',
    },
    ...overrides,
  };
}
