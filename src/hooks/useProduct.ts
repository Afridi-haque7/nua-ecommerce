import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types';
import { fetchProduct } from '@/api/products';

interface ProductState {
  product: Product | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Loads a single product by id with loading/error/retry handling. */
export function useProduct(id: number): ProductState {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError('That product could not be found.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchProduct(id, controller.signal)
      .then((data) => {
        // The early-fetch path can't be aborted — guard against stale sets.
        if (!controller.signal.aborted) setProduct(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id, nonce]);

  return { product, loading, error, reload };
}
