import type { ApiProduct, Product } from '@/types';
import { enrichProduct, enrichProducts } from '@/data/variants';

const BASE_URL = 'https://fakestoreapi.com';

/** Thrown for any non-2xx response or network failure, with a friendly message. */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Claim the early request started by the inline script in index.html, if it
 * matches this URL. Single-use: SPA navigations after load fetch normally.
 */
function takeEarlyFetch(url: string): Promise<unknown> | null {
  if (typeof window === 'undefined') return null;
  const early = window.__nuaEarlyFetch;
  if (!early || early.url !== url) return null;
  delete window.__nuaEarlyFetch;
  return early.promise;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const early = takeEarlyFetch(url);
  if (early) {
    try {
      return (await early) as T;
    } catch {
      // The early request failed (offline at load, server hiccup) — fall
      // through to a regular fetch so the user still gets a retry path.
    }
  }

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the store. Check your connection.');
  }
  if (!res.ok) {
    throw new ApiError(`The store responded with an error (${res.status}).`);
  }
  return res.json() as Promise<T>;
}

/** Fetch every product and enrich it with merchandising data. */
export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const data = await getJson<ApiProduct[]>('/products', signal);
  return enrichProducts(data);
}

/**
 * Fetch a single product by id. The Fake Store API returns `null` (HTTP 200)
 * for unknown ids, so we treat that as a not-found error.
 */
export async function fetchProduct(
  id: number,
  signal?: AbortSignal,
): Promise<Product> {
  const data = await getJson<ApiProduct | null>(`/products/${id}`, signal);
  if (!data) {
    throw new ApiError('That product could not be found.');
  }
  return enrichProduct(data);
}
