import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  addLine,
  computeTotals,
  removeLine,
  setLineQty,
  totalItemCount,
  type CartTotals,
} from './cartMath';

const STORAGE_KEY = 'nua.cart.v1';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totals: CartTotals;
  isDrawerOpen: boolean;
  addItem: (line: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateQuantity: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>(STORAGE_KEY, []);
  // Drawer visibility is deliberately *not* persisted — reopening it on every
  // page load would be hostile. It is ephemeral session UI state.
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const addItem = useCallback(
    (line: Omit<CartItem, 'quantity'>, qty = 1) => {
      setItems((prev) => addLine(prev, line, qty));
    },
    [setItems],
  );

  const updateQuantity = useCallback(
    (key: string, qty: number) => {
      setItems((prev) =>
        qty <= 0 ? removeLine(prev, key) : setLineQty(prev, key, qty),
      );
    },
    [setItems],
  );

  const removeItem = useCallback(
    (key: string) => setItems((prev) => removeLine(prev, key)),
    [setItems],
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: totalItemCount(items),
      totals: computeTotals(items),
      isDrawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openDrawer,
      closeDrawer,
    }),
    [
      items,
      isDrawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openDrawer,
      closeDrawer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access the cart store. Throws if used outside <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a <CartProvider>.');
  }
  return ctx;
}
