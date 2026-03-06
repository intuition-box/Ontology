import { useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@waveso/ui/dialog';
import {
  getEntityMappingsForSubject,
  getEntityMappingsForTypes,
  getAllEntityMappings,
  type EntityMapping,
} from '../data/semantic-rankings';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomCategory } from '../data/atom-types';

interface ClaimMatrixProps {
  /** Single subject type filter (home page use case) */
  subjectTypeId?: string | null;
  /** Multi-type filter via tag cloud (matrix page use case) */
  filterTypeIds?: Set<string>;
  onSelectClaim?: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
  searchQuery?: string;
}

export function ClaimMatrix({ subjectTypeId, filterTypeIds, onSelectClaim, searchQuery }: ClaimMatrixProps) {
  const allMappings = useMemo(() => {
    let base: EntityMapping[];
    if (subjectTypeId) {
      base = getEntityMappingsForSubject(subjectTypeId);
    } else if (filterTypeIds && filterTypeIds.size > 0) {
      base = getEntityMappingsForTypes([...filterTypeIds]);
    } else {
      base = getAllEntityMappings();
    }

    const sq = (searchQuery ?? '').trim().toLowerCase();
    if (!sq) return base;

    return base.filter((m) => {
      const subjectAtom = ATOM_TYPES.find((t) => t.id === m.subjectType);
      const objectAtom = ATOM_TYPES.find((t) => t.id === m.objectType);
      const subjectMatch = subjectAtom?.label.toLowerCase().includes(sq) ?? false;
      const objectMatch = objectAtom?.label.toLowerCase().includes(sq) ?? false;
      const predicateMatch = m.predicates.some((p) => p.label.toLowerCase().includes(sq));
      return subjectMatch || objectMatch || predicateMatch;
    });
  }, [subjectTypeId, filterTypeIds, searchQuery]);

  const groupedMappings = useMemo(() => {
    const groups: { label: string; mappings: EntityMapping[] }[] = [];
    let currentGroup = '';

    for (const mapping of allMappings) {
      if (mapping.group !== currentGroup) {
        currentGroup = mapping.group;
        groups.push({ label: currentGroup, mappings: [] });
      }
      groups[groups.length - 1].mappings.push(mapping);
    }

    return groups;
  }, [allMappings]);

  const handleRowClick = useCallback(
    (mapping: EntityMapping) => {
      if (mapping.predicates.length === 1) {
        onSelectClaim?.(mapping.subjectType, mapping.predicates[0].id, mapping.objectType);
      }
    },
    [onSelectClaim]
  );

  const handlePredicateClick = useCallback(
    (mapping: EntityMapping, predicateId: string) => {
      onSelectClaim?.(mapping.subjectType, predicateId, mapping.objectType);
    },
    [onSelectClaim]
  );


  const definedTermColor = getDefinedTermColor();

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Entity Matrix</h2>
        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
          {allMappings.length} {allMappings.length === 1 ? 'combination' : 'combinations'}
        </span>
      </div>
      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-3 gap-2 mb-2" aria-hidden="true">
        {['Subject', 'Predicate', 'Object'].map((h, i) => (
          <div key={i} className="text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {h}
            </span>
          </div>
        ))}
      </div>
      {/* Screen reader column labels */}
      <div className="sr-only">Subject Entity, Predicate Entity (DefinedTerm), Object Entity</div>

      {/* Entity mappings grouped by semantic category */}
      <div className="space-y-1" role="list" aria-label="Entity type combinations">
        {groupedMappings.map((group) => (
          <div key={group.label} role="group" aria-label={group.label}>
            <div className="pt-3 pb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-accent)]/60">
                {group.label}
              </span>
            </div>
            <div className="space-y-1.5">
              {group.mappings.map((mapping) => {
                const rowKey = `${mapping.subjectType}:${mapping.objectType}`;
                const hasMultiple = mapping.predicates.length > 1;

                if (hasMultiple) {
                  return (
                    <Dialog key={rowKey}>
                      <DialogTrigger render={<div role="listitem" />}>
                        <EntityRow
                          mapping={mapping}
                          definedTermColor={definedTermColor}
                        />
                      </DialogTrigger>
                      <DialogContent showCloseButton>
                        <PredicateDialogBody
                          mapping={mapping}
                          definedTermColor={definedTermColor}
                          onSelect={(predId) => handlePredicateClick(mapping, predId)}
                        />
                      </DialogContent>
                    </Dialog>
                  );
                }

                return (
                  <div key={rowKey} role="listitem">
                    <EntityRow
                      mapping={mapping}
                      definedTermColor={definedTermColor}
                      onClick={() => handleRowClick(mapping)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── Row Components ──────────────────────────────────────────

function EntityRow({
  mapping,
  definedTermColor,
  onClick,
}: {
  mapping: EntityMapping;
  definedTermColor: string;
  onClick?: () => void;
}) {
  const subjectAtom = ATOM_TYPES.find((t) => t.id === mapping.subjectType);
  const objectAtom = ATOM_TYPES.find((t) => t.id === mapping.objectType);
  if (!subjectAtom || !objectAtom) return null;

  const subjectColor = ATOM_CATEGORIES[subjectAtom.category as AtomCategory].color;
  const objectColor = ATOM_CATEGORIES[objectAtom.category as AtomCategory].color;

  const predicateCount = mapping.predicates.length;
  const isSingle = predicateCount === 1;
  const predicateLabel = isSingle
    ? mapping.predicates[0].label
    : `${predicateCount} predicates`;

  return (
    <button
      onClick={onClick}
      className="focus-ring relative grid w-full grid-cols-1 sm:grid-cols-3 gap-2 group rounded-lg hover:z-10"
      aria-label={`${subjectAtom.label} — ${predicateLabel} — ${objectAtom.label}`}
    >
      <EntityPill
        label={subjectAtom.label}
        color={subjectColor}
        entityType={subjectAtom.category}
      />

      {isSingle ? (
        <EntityPill
          label={mapping.predicates[0].label}
          color={definedTermColor}
          entityType="DefinedTerm"
        />
      ) : (
        <PredicateCountPill
          count={predicateCount}
          color={definedTermColor}
        />
      )}

      <EntityPill
        label={objectAtom.label}
        color={objectColor}
        entityType={objectAtom.category}
      />
    </button>
  );
}

function PredicateDialogBody({
  mapping,
  definedTermColor,
  onSelect,
}: {
  mapping: EntityMapping;
  definedTermColor: string;
  onSelect: (predicateId: string) => void;
}) {
  const subjectAtom = ATOM_TYPES.find((t) => t.id === mapping.subjectType);
  const objectAtom = ATOM_TYPES.find((t) => t.id === mapping.objectType);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-semibold text-[var(--color-text)]">
          {subjectAtom?.label ?? mapping.subjectType} → {objectAtom?.label ?? mapping.objectType}
        </DialogTitle>
        <p className="text-xs text-[var(--color-text-muted)]">
          {mapping.predicates.length} available predicates
        </p>
      </DialogHeader>
      <div className="space-y-1 py-2">
        {mapping.predicates.map((p) => (
          <DialogClose
            key={p.id}
            render={
              <button
                onClick={() => onSelect(p.id)}
                className="focus-ring flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
              />
            }
          >
            <span className="text-sm font-medium" style={{ color: definedTermColor }}>
              {p.label}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] ml-2 truncate max-w-[60%] text-right">
              {p.description}
            </span>
          </DialogClose>
        ))}
      </div>
    </>
  );
}

// ─── Pills ───────────────────────────────────────────────────

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
      className="flex flex-col items-center justify-center rounded-lg px-3 py-2.5 transition-[transform,box-shadow] group-hover:scale-[1.02] group-hover:shadow-md"
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

function PredicateCountPill({
  count,
  color,
}: {
  count: number;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg px-3 py-2.5 transition-[transform,box-shadow] group-hover:scale-[1.02] group-hover:shadow-md"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      <span
        className="text-sm font-medium leading-tight"
        style={{ color }}
      >
        ?
      </span>
      <span className="text-[10px] mt-0.5 text-[var(--color-text-muted)]">
        {count} {count === 1 ? 'combination' : 'combinations'}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function getDefinedTermColor(): string {
  const dt = ATOM_TYPES.find((t) => t.id === 'DefinedTerm');
  if (!dt) return '#6b7280';
  return ATOM_CATEGORIES[dt.category as AtomCategory]?.color ?? '#6b7280';
}
