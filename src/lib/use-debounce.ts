import { useEffect, useState } from 'react';

/**
 * Debounces a value by the given delay.
 * Returns the debounced value that only updates after `delayMs` of inactivity.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
