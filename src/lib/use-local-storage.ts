import { useState, useCallback } from 'react';

/**
 * A generic hook for persisting state in localStorage.
 * Handles JSON serialization, parse errors, and quota limits.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // Quota exceeded — silently fail, state still updates in memory
        }
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
