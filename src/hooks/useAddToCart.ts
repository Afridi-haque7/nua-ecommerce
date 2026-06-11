import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';
import { addToCartRequest } from '@/api/cart';
import { buildCartLine, getStock } from '@/data/variants';
import { useCart } from '@/stores/CartContext';

export type AddStatus = 'idle' | 'loading' | 'success' | 'error';

interface AddOptions {
  openDrawerOnSuccess?: boolean;
}

interface UseAddToCart {
  status: AddStatus;
  error: string | null;
  /** Add a resolved variant to the cart via the (mock) async endpoint. */
  add: (
    product: Product,
    colorId: string,
    sizeId: string,
    qty: number,
    opts?: AddOptions,
  ) => Promise<void>;
}

/**
 * Wraps the mock async add-to-cart endpoint with loading/error/success state
 * and commits to the cart store only on success. Shared by the product card
 * (quick add) and the detail page. The success state auto-resets so the button
 * can return to its idle label.
 */
export function useAddToCart(): UseAddToCart {
  const { addItem, openDrawer } = useCart();
  const [status, setStatus] = useState<AddStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Guard against setting state after unmount (the request is async).
  const mounted = useRef(true);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(resetTimer.current);
    };
  }, []);

  const add = useCallback(
    async (
      product: Product,
      colorId: string,
      sizeId: string,
      qty: number,
      opts: AddOptions = {},
    ) => {
      // Never allow a sold-out variant through, even if a caller slips.
      if (getStock(product, colorId, sizeId) === 'sold_out') return;

      setStatus('loading');
      setError(null);
      try {
        await addToCartRequest({
          productId: product.id,
          colorId,
          sizeId,
          quantity: qty,
        });
        if (!mounted.current) return;
        addItem(buildCartLine(product, colorId, sizeId), qty);
        setStatus('success');
        if (opts.openDrawerOnSuccess) openDrawer();
        resetTimer.current = setTimeout(() => {
          if (mounted.current) setStatus('idle');
        }, 1600);
      } catch (err) {
        if (!mounted.current) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Please try again.');
        resetTimer.current = setTimeout(() => {
          if (mounted.current) setStatus('idle');
        }, 2400);
      }
    },
    [addItem, openDrawer],
  );

  return { status, error, add };
}
