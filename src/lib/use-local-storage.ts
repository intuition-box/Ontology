import { useState, useCallback } from 'react';

export interface UseLocalStorageOptions<T> {
  /**
   * Optional validator — when a stored value fails validation (stale shape,
   * hand-edited storage, different app version) the hook falls back to
   * `initialValue` and wipes the bad entry.
   */
  validate?: (value: unknown) => value is T;
}

/**
 * A generic hook for persisting state in localStorage.
 * Handles JSON serialization, parse errors, and quota limits.
 *
 * Provide `options.validate` for any value parsed from untrusted or
 * schema-versioned storage — without it, `JSON.parse` is assumed to match `T`.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const { validate } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;

      const parsed: unknown = JSON.parse(item);

      if (validate && !validate(parsed)) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed as T;
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
