import { useMemo } from 'react';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomCategory } from '../data/atom-types';

interface EntityTypeTagCloudProps {
  selectedTypeIds: Set<string>;
  onToggleType: (typeId: string) => void;
  onClearAll: () => void;
}

export function EntityTypeTagCloud({ selectedTypeIds, onToggleType, onClearAll }: EntityTypeTagCloudProps) {
  const hasSelection = selectedTypeIds.size > 0;

  const grouped = useMemo(() => {
    const groups: { category: AtomCategory; label: string; color: string; types: { id: string; label: string }[] }[] = [];

    for (const [cat, meta] of Object.entries(ATOM_CATEGORIES)) {
      const types = ATOM_TYPES
        .filter((t) => t.category === cat)
        .map((t) => ({ id: t.id, label: t.label }));

      if (types.length > 0) {
        groups.push({ category: cat as AtomCategory, label: meta.label, color: meta.color, types });
      }
    }

    return groups;
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {hasSelection && (
        <button
          onClick={onClearAll}
          className="focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Clear all
        </button>
      )}
      <div className="flex flex-wrap gap-1.5">
        {grouped.map((group) =>
          group.types.map((type) => {
            const isActive = selectedTypeIds.has(type.id);
            const isDimmed = hasSelection && !isActive;

            return (
              <button
                key={type.id}
                onClick={() => onToggleType(type.id)}
                className={`focus-ring inline-flex items-center rounded-md text-xs font-medium px-2 py-1 transition-all cursor-pointer ${
                  isDimmed ? 'opacity-30 hover:opacity-60' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: isActive ? `${group.color}30` : `${group.color}10`,
                  color: group.color,
                  border: `1px solid ${isActive ? `${group.color}60` : `${group.color}25`}`,
                }}
              >
                {type.label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

