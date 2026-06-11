import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State that mirrors itself into localStorage and rehydrates on load.
 *
 * - Reads synchronously on first render so there is no empty-then-filled flash.
 * - Tolerates malformed/blocked storage (private mode, quota) by falling back
 *   to the initial value rather than throwing.
 * - Stays in sync across tabs via the `storage` event.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [stored, setStored] = useState<T>(readValue);

  // Keep a ref of the latest value so the functional updater works without
  // re-creating `setValue` on every change.
  const storedRef = useRef(stored);
  storedRef.current = stored;

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next =
          value instanceof Function ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage unavailable — keep working in-memory for this session.
        }
        return next;
      });
    },
    [key],
  );

  // Cross-tab synchronisation.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStored(e.newValue ? (JSON.parse(e.newValue) as T) : initialValue);
      } catch {
        /* ignore malformed external writes */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  return [stored, setValue];
}
