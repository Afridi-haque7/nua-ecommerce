import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Product } from '@/types';
import { CartProvider } from '@/stores/CartContext';
import { ProductDetail } from '@/pages/ProductDetail/ProductDetail';

// A product with a known stock matrix, referenced from the hoisted mock below.
const { fixture } = vi.hoisted(() => {
  const fixture: Product = {
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
  };
  return { fixture };
});

vi.mock('@/hooks/useProduct', () => ({
  useProduct: () => ({
    product: fixture,
    loading: false,
    error: null,
    reload: () => {},
  }),
}));

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('ProductDetail add-to-cart CTA', () => {
  it('disables the CTA for a deep-linked sold-out variant', () => {
    renderAt('/product/5?color=red&size=m'); // red/m is sold_out
    const cta = screen.getByRole('button', { name: /sold out/i });
    expect(cta).toBeDisabled();
  });

  it('enables the CTA for an in-stock variant', () => {
    renderAt('/product/5?color=blue&size=m'); // blue/m is in_stock
    const cta = screen.getByRole('button', { name: /add to cart/i });
    expect(cta).toBeEnabled();
  });
});
