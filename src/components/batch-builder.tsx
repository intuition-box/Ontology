import { useState, useCallback } from 'react';
import { getAtomColor } from '../lib/atom-colors';
import { conjugateForSelf, isSelfSubject } from '../lib/conjugate';
import { downloadClaimsAsJson, generateShareableUrl, copyToClipboard, claimsToJsonLd } from '../lib/claim-export';
import { useClaimWorkspace } from '../lib/use-claim-workspace';
import { COPY_FEEDBACK_MS } from '../lib/timings';
import type { ClaimEntry } from '../types';

interface BatchBuilderProps {
  searchQuery?: string;
}

export function BatchBuilder({ searchQuery }: BatchBuilderProps) {
  const { batch, setBatch } = useClaimWorkspace();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  const handleRemove = useCallback((id: string) => {
    setBatch((prev) => prev.filter((c) => c.id !== id));
  }, [setBatch]);

  const handleClear = useCallback(() => {
    setBatch([]);
  }, [setBatch]);

  const handleDownload = useCallback(() => {
    downloadClaimsAsJson(batch);
  }, [batch]);

  const handleCopyJsonLd = useCallback(async () => {
    const jsonLd = claimsToJsonLd(batch);
    const ok = await copyToClipboard(JSON.stringify(jsonLd, null, 2));
    if (ok) {
      setCopiedFeedback('json');
      setTimeout(() => setCopiedFeedback(null), COPY_FEEDBACK_MS);
    }
  }, [batch]);

  const handleCopyShareUrl = useCallback(async () => {
    const url = generateShareableUrl(batch);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedFeedback('url');
      setTimeout(() => setCopiedFeedback(null), COPY_FEEDBACK_MS);
    }
  }, [batch]);

  if (batch.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="focus-ring flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <BatchIcon />
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Batch
          </span>
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
            {batch.length}
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
          <div className="max-h-48 overflow-y-auto">
            {batch.map((entry, i) => {
              const sq = (searchQuery ?? '').trim().toLowerCase();
              const matches = !sq ||
                entry.subject.toLowerCase().includes(sq) ||
                entry.predicateLabel.toLowerCase().includes(sq) ||
                entry.object.toLowerCase().includes(sq);
              return (
                <BatchRow
                  key={entry.id}
                  index={i + 1}
                  entry={entry}
                  onRemove={() => handleRemove(entry.id)}
                  dimmed={sq ? !matches : false}
                />
              );
            })}
          </div>

          {/* Export actions */}
          <div className="border-t border-[var(--color-border)] px-4 py-2.5 flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="focus-ring rounded-md px-2.5 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Download JSON-LD
            </button>
            <button
              onClick={handleCopyJsonLd}
              className="focus-ring rounded-md px-2.5 py-1.5 text-xs font-medium bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {copiedFeedback === 'json' ? 'Copied!' : 'Copy JSON-LD'}
            </button>
            <button
              onClick={handleCopyShareUrl}
              className="focus-ring rounded-md px-2.5 py-1.5 text-xs font-medium bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {copiedFeedback === 'url' ? 'Copied!' : 'Share URL'}
            </button>
            <div className="flex-1" />
            <button
              onClick={handleClear}
              className="focus-ring rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Clear batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BatchRow({
  index,
  entry,
  onRemove,
  dimmed = false,
}: {
  index: number;
  entry: ClaimEntry;
  onRemove: () => void;
  dimmed?: boolean;
}) {
  const subjectColor = getAtomColor(entry.subjectType);
  const objectColor = getAtomColor(entry.objectType);

  return (
    <div className={`flex items-center gap-2 px-4 py-2 hover:bg-[var(--color-surface-hover)] transition-all group ${dimmed ? 'opacity-30' : ''}`}>
      <span className="text-[10px] text-[var(--color-text-muted)] font-mono w-5 shrink-0 text-right">
        {index}.
      </span>
      <div className="flex items-center gap-1.5 min-w-0 flex-1 font-mono text-xs">
        <span className="truncate" style={{ color: subjectColor }}>
          {isSelfSubject(entry.subjectType) ? 'I' : entry.subject}
        </span>
        <span className="text-[var(--color-text-muted)] shrink-0">—</span>
        <span className="text-[var(--color-accent)] shrink-0">
          {isSelfSubject(entry.subjectType)
            ? conjugateForSelf(entry.predicateId, entry.predicateLabel)
            : entry.predicateLabel}
        </span>
        <span className="text-[var(--color-text-muted)] shrink-0">—</span>
        <span className="truncate" style={{ color: objectColor }}>{entry.object}</span>
      </div>
      <button
        onClick={onRemove}
        className="focus-ring rounded p-0.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
        aria-label={`Remove claim ${index}`}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      </button>
    </div>
  );
}

function BatchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}
