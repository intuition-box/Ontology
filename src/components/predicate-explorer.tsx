import { useState, useMemo, useCallback, useEffect } from 'react';
import { PREDICATES, PREDICATE_GROUPS, type PredicateRule } from '../data/predicates';
import { ATOM_TYPES } from '../data/atom-types';
import { getAtomColor } from '../lib/atom-colors';

interface PredicateExplorerProps {
  selectedPredicateId?: string | null;
  onSelectClaim?: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
  searchQuery?: string;
}

export function PredicateExplorer({ selectedPredicateId: externalPredicateId, onSelectClaim, searchQuery }: PredicateExplorerProps) {
  const [internalPredicateId, setInternalPredicateId] = useState<string | null>(null);

  // Sync with external predicate (from Claim Builder) when it changes
  useEffect(() => {
    if (externalPredicateId !== undefined) {
      setInternalPredicateId(externalPredicateId);
    }
  }, [externalPredicateId]);

  // Auto-select a predicate when global search matches one
  useEffect(() => {
    const sq = (searchQuery ?? '').trim().toLowerCase();
    if (!sq) return;

    const matches = PREDICATES.filter(
      (p) => p.label.toLowerCase().includes(sq) || p.id.toLowerCase().includes(sq)
    );

    const only = matches.length === 1 ? matches[0] : null;
    if (only) setInternalPredicateId(only.id);
  }, [searchQuery]);

  const selectedPredicateId = internalPredicateId;

  const groupedPredicates = useMemo(() => {
    const groupMap = new Map<string, PredicateRule[]>();
    for (const p of PREDICATES) {
      const bucket = groupMap.get(p.group);
      if (bucket) bucket.push(p);
      else groupMap.set(p.group, [p]);
    }

    // Preserve canonical group display order from PREDICATE_GROUPS.
    const groups: { label: string; predicates: PredicateRule[] }[] = [];
    for (const groupLabel of PREDICATE_GROUPS) {
      const preds = groupMap.get(groupLabel);
      if (preds) {
        preds.sort((a, b) => a.priority - b.priority);
        groups.push({ label: groupLabel, predicates: preds });
      }
    }
    return groups;
  }, []);

  const selectedPredicate = PREDICATES.find((p) => p.id === selectedPredicateId);

  // Build all valid (subject, object) pairs for selected predicate
  const pairs = useMemo(() => {
    if (!selectedPredicate) return [];
    const result: { subjectType: string; objectType: string; subjectLabel: string; objectLabel: string; subjectColor: string; objectColor: string; subjectCategory: string; objectCategory: string }[] = [];

    for (const subjectId of selectedPredicate.subjectTypes) {
      const subjAtom = ATOM_TYPES.find((t) => t.id === subjectId);
      if (!subjAtom) continue;

      for (const objectId of selectedPredicate.objectTypes) {
        const objAtom = ATOM_TYPES.find((t) => t.id === objectId);
        if (!objAtom) continue;

        result.push({
          subjectType: subjectId,
          objectType: objectId,
          subjectLabel: subjAtom.label,
          objectLabel: objAtom.label,
          subjectColor: getAtomColor(subjectId),
          objectColor: getAtomColor(objectId),
          subjectCategory: subjAtom.category,
          objectCategory: objAtom.category,
        });
      }
    }

    return result;
  }, [selectedPredicate]);

  const handlePairClick = useCallback(
    (subjectType: string, objectType: string) => {
      if (!selectedPredicateId) return;
      onSelectClaim?.(subjectType, selectedPredicateId, objectType);
    },
    [selectedPredicateId, onSelectClaim]
  );

  const definedTermColor = getAtomColor('DefinedTerm');

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6" data-tutorial-step="predicate-explorer">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Predicate Explorer</h2>
        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
          {PREDICATES.length} {PREDICATES.length === 1 ? 'predicate' : 'predicates'}
        </span>
      </div>

      {/* Predicate selector */}
      <div className="relative mb-5">
        <select
          value={selectedPredicateId ?? ''}
          onChange={(e) => setInternalPredicateId(e.target.value || null)}
          className="focus-ring w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2.5 text-[var(--color-text)] transition-colors focus:border-[var(--color-accent)] cursor-pointer"
        >
          <option value="">Select a predicate...</option>
          {groupedPredicates.map((group) => {
            const sq = (searchQuery ?? '').trim().toLowerCase();
            const filteredPreds = sq
              ? group.predicates.filter((p) => p.label.toLowerCase().includes(sq) || p.description.toLowerCase().includes(sq))
              : group.predicates;
            if (filteredPreds.length === 0) return null;
            return (
              <optgroup key={group.label} label={group.label}>
                {filteredPreds.map((p) => (
                  <option key={p.id} value={p.id} title={p.description}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Predicate detail + pairs */}
      {selectedPredicate && (
        <>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-base font-semibold"
                style={{ color: definedTermColor }}
              >
                {selectedPredicate.label}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${definedTermColor}20`,
                  color: definedTermColor,
                  border: `1px solid ${definedTermColor}40`,
                }}
              >
                DefinedTerm
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{selectedPredicate.description}</p>
          </div>

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-3 gap-2 mb-2" aria-hidden="true">
            <div className="text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Subject
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Predicate
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Object
              </span>
            </div>
          </div>

          <div className="space-y-1.5" role="list" aria-label="Valid entity pairs">
            {pairs.filter((pair) => {
              const sq = (searchQuery ?? '').trim().toLowerCase();
              if (!sq) return true;
              return pair.subjectLabel.toLowerCase().includes(sq) || pair.objectLabel.toLowerCase().includes(sq) || (selectedPredicate?.label ?? '').toLowerCase().includes(sq);
            }).map((pair) => (
              <button
                key={`${pair.subjectType}:${pair.objectType}`}
                onClick={() => handlePairClick(pair.subjectType, pair.objectType)}
                className="focus-ring grid w-full grid-cols-1 sm:grid-cols-3 gap-2 group rounded-lg"
                role="listitem"
                aria-label={`${pair.subjectLabel} ${selectedPredicate.label} ${pair.objectLabel}`}
              >
                <EntityPill
                  label={pair.subjectLabel}
                  color={pair.subjectColor}
                  entityType={pair.subjectCategory}
                />
                <EntityPill
                  label="DefinedTerm"
                  color={definedTermColor}
                  entityType={selectedPredicate.label}
                />
                <EntityPill
                  label={pair.objectLabel}
                  color={pair.objectColor}
                  entityType={pair.objectCategory}
                />
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--color-text-muted)] pt-4">
            {pairs.length} valid combination{pairs.length !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}

// ─── Reusable Pill ────────────────────────────────────────────

function EntityPill({
  label,
  color,
  entityType,
}: {
  label: string;
  color: string;
  entityType: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg px-3 py-2.5 transition-all group-hover:scale-[1.02] group-hover:shadow-md"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      <span
        className="text-sm font-medium truncate max-w-full text-center leading-tight"
        style={{ color }}
        title={label}
      >
        {label}
      </span>
      <span className="text-[10px] mt-0.5 text-[var(--color-text-muted)] truncate max-w-full">
        {entityType}
      </span>
    </div>
  );
}
