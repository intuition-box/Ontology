import { useState, useCallback } from 'react';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomCategory } from '../data/atom-types';
import type { ClaimEntry } from '../types';

const MAX_HISTORY = 50;

interface ClaimHistoryProps {
  history: ClaimEntry[];
  onHistoryChange: (history: ClaimEntry[]) => void;
  onRestore: (entry: ClaimEntry) => void;
  searchQuery?: string;
}

export function ClaimHistory({ history, onHistoryChange, onRestore, searchQuery }: ClaimHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClear = useCallback(() => {
    onHistoryChange([]);
  }, [onHistoryChange]);

  const sq = (searchQuery ?? '').trim().toLowerCase();
  const filteredHistory = sq
    ? history.filter((e) =>
        e.subject.toLowerCase().includes(sq) ||
        e.predicateLabel.toLowerCase().includes(sq) ||
        e.object.toLowerCase().includes(sq) ||
        e.subjectType.toLowerCase().includes(sq) ||
        e.objectType.toLowerCase().includes(sq)
      )
    : history;

  if (history.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="focus-ring flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <HistoryIcon />
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            History
          </span>
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
            {filteredHistory.length !== history.length ? `${filteredHistory.length}/${history.length}` : history.length}
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[var(--color-text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="2 4 6 7 10 4" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-[var(--color-border)]">
          <div className="max-h-64 overflow-y-auto">
            {filteredHistory.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} onRestore={onRestore} />
            ))}
          </div>
          <div className="border-t border-[var(--color-border)] px-4 py-2 flex justify-center">
            <button
              onClick={handleClear}
              className="focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryRow({ entry, onRestore }: { entry: ClaimEntry; onRestore: (entry: ClaimEntry) => void }) {
  const subjectAtom = ATOM_TYPES.find((t) => t.id === entry.subjectType);
  const objectAtom = ATOM_TYPES.find((t) => t.id === entry.objectType);

  const subjectColor = subjectAtom
    ? ATOM_CATEGORIES[subjectAtom.category as AtomCategory].color
    : 'var(--color-text)';
  const objectColor = objectAtom
    ? ATOM_CATEGORIES[objectAtom.category as AtomCategory].color
    : 'var(--color-text)';

  return (
    <button
      onClick={() => onRestore(entry)}
      className="focus-ring flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[var(--color-surface-hover)] transition-colors"
      title="Click to restore this claim"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1 font-mono text-xs">
        <span className="truncate" style={{ color: subjectColor }}>{entry.subject}</span>
        <span className="text-[var(--color-text-muted)] shrink-0">—</span>
        <span className="text-[var(--color-accent)] shrink-0">{entry.predicateLabel}</span>
        <span className="text-[var(--color-text-muted)] shrink-0">—</span>
        <span className="truncate" style={{ color: objectColor }}>{entry.object}</span>
      </div>
      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
        {formatRelativeTime(entry.timestamp)}
      </span>
    </button>
  );
}

/** Adds a claim to history (FIFO, max 50) */
export function addToHistory(
  history: ClaimEntry[],
  entry: Omit<ClaimEntry, 'id' | 'timestamp'>
): ClaimEntry[] {
  const newEntry: ClaimEntry = {
    ...entry,
    id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
  };
  return [newEntry, ...history].slice(0, MAX_HISTORY);
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
