import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { CartItem } from '@/types';
import { CartProvider, useCart } from '@/stores/CartContext';
import { ToastProvider } from '@/stores/ToastContext';
import { CartDrawer } from '@/components/CartDrawer/CartDrawer';
import { ToastViewport } from '@/components/Toast/ToastViewport';

const SEED: CartItem = {
  key: '5/red/s',
  productId: 5,
  title: 'Test Jacket',
  brand: 'Testwear',
  image: 'https://example.com/jacket.png',
  unitPrice: 60,
  colorId: 'red',
  colorName: 'Red',
  sizeId: 's',
  sizeLabel: 'S',
  quantity: 1,
};

/** Exposes a button that opens the drawer, so the test can drive it. */
function OpenButton() {
  const { openDrawer } = useCart();
  return (
    <button type="button" onClick={openDrawer}>
      open-drawer
    </button>
  );
}

function renderDrawer() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <CartProvider>
          <OpenButton />
          <CartDrawer />
          <ToastViewport />
        </CartProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('CartDrawer checkout', () => {
  beforeEach(() => {
    localStorage.setItem('nua.cart.v1', JSON.stringify([SEED]));
  });

  it('shows a "payment not integrated" toast and closes the drawer', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole('button', { name: /open-drawer/i }));
    const drawer = screen.getByRole('dialog', { name: /shopping cart/i });
    expect(drawer).toHaveAttribute('aria-hidden', 'false');

    await user.click(screen.getByRole('button', { name: /checkout/i }));

    // The notice is surfaced...
    expect(await screen.findByText(/payment isn.t integrated/i)).toBeInTheDocument();
    // ...and the drawer is dismissed.
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });
});
