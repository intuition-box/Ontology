import { getPredicatesForSubject, type PredicateRule } from '../data/predicates';

interface PredicateSelectProps {
  subjectType: string | null;
  value: string | null;
  onChange: (predicateId: string | null) => void;
  disabled: boolean;
}

export function PredicateSelect({ subjectType, value, onChange, disabled }: PredicateSelectProps) {
  const predicates = subjectType ? getPredicatesForSubject(subjectType) : [];
  const selected = predicates.find((p) => p.id === value);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">Predicate</label>
      <div className={`relative ${disabled ? 'opacity-60' : ''}`}>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className={`focus-ring w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-accent)] ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer text-[var(--color-text)]'
          }`}
        >
          <option value="">
            {disabled ? 'Enter a subject first' : `Select predicate (${predicates.length} options)`}
          </option>
          {predicates.map((p: PredicateRule) => (
            <option key={p.id} value={p.id} title={p.description}>
              {p.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {selected && (
        <p className="text-xs text-[var(--color-text-muted)]">
          {selected.description}
        </p>
      )}

      {!disabled && predicates.length === 0 && subjectType && (
        <p className="text-xs text-amber-400">
          No predicates defined for {subjectType} subjects yet.
        </p>
      )}
    </div>
  );
}
