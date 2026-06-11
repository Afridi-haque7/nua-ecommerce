import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types';
import { fetchProducts } from '@/api/products';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  /** Manual retry after a failure. */
  reload: () => void;
}

/** Loads the full product catalogue with loading/error/retry handling. */
export function useProducts(): ProductsState {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchProducts(controller.signal)
      .then((data) => {
        // The early-fetch path can't be aborted — guard against stale sets.
        if (!controller.signal.aborted) setProducts(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [nonce]);

  return { products, loading, error, reload };
}
