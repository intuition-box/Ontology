import { useEffect } from 'react';

/**
 * Ref-counted body scroll lock. Multiple components can request a lock
 * simultaneously (e.g. a fullscreen graph opened behind a dialog); the body
 * stays locked until all requesters have released.
 *
 * The pre-lock value of `overflow` is captured once and restored on the final
 * release, so we never clobber styles set by other code.
 */
let lockCount = 0;
let previousOverflow: string | null = null;

function acquire(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

function release(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return; // paranoia — unmatched release
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? '';
    previousOverflow = null;
  }
}

/**
 * Locks `<body>` scroll while `active` is true. Safe to use in parallel
 * across components — locks are ref-counted.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    acquire();
    return release;
  }, [active]);
}
