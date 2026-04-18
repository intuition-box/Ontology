import type { ReactNode } from 'react';

/**
 * Small muted note with a padlock icon, used wherever a schema constraint
 * narrows a picker to a single option. The lock is silent in the model
 * (the field is just auto-selected), so surfacing the "why" here keeps the
 * UI honest — the user sees that they can't change this value *and* why.
 */
export function LockNote({ children }: { children: ReactNode }) {
  return (
    <p
      className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] leading-snug"
      role="note"
    >
      <LockIcon />
      <span>{children}</span>
    </p>
  );
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
