import { PREDICATES } from '../data/predicates';
import { ATOM_TYPES, ATOM_CATEGORIES } from '../data/atom-types';
import { conjugateForSelf, isSelfSubject } from '../lib/conjugate';

interface ClaimPreviewProps {
  subject: string;
  subjectType: string | null;
  predicateId: string | null;
  object: string;
  objectType: string | null;
  onSave?: () => void;
  onAddToBatch?: () => void;
}

export function ClaimPreview({
  subject,
  subjectType,
  predicateId,
  object,
  objectType,
  onSave,
  onAddToBatch,
}: ClaimPreviewProps) {
  const hasSubject = subject.trim().length > 0;
  const hasPredicate = predicateId !== null;
  const hasObject = object.trim().length > 0;

  if (!hasSubject) return null;

  const predicate = PREDICATES.find((p) => p.id === predicateId);
  const subjectAtom = ATOM_TYPES.find((t) => t.id === subjectType);
  const objectAtom = ATOM_TYPES.find((t) => t.id === objectType);

  const isComplete = hasSubject && hasPredicate && hasObject && subjectType && objectType;
  const isSelf = isSelfSubject(subjectType);

  // Check validity
  let isValid = false;
  let validationMessage = '';
  if (isComplete && predicate) {
    const subjectOk = predicate.subjectTypes.includes(subjectType);
    const objectOk = predicate.objectTypes.includes(objectType);
    isValid = subjectOk && objectOk;

    if (!subjectOk) {
      validationMessage = `"${predicate.label}" doesn't work with ${subjectType} subjects`;
    } else if (!objectOk) {
      validationMessage = `"${predicate.label}" expects: ${predicate.objectTypes.join(', ')}`;
    }
  }

  const subjectColor = subjectAtom
    ? ATOM_CATEGORIES[subjectAtom.category].color
    : 'var(--color-text)';
  const objectColor = objectAtom
    ? ATOM_CATEGORIES[objectAtom.category].color
    : 'var(--color-text)';

  // Displayed predicate label — first-person conjugation when subject is Self,
  // raw predicate label otherwise. Stored claim still carries the canonical ID.
  const displayedPredicate = hasPredicate && predicate
    ? isSelf
      ? conjugateForSelf(predicate.id, predicate.label)
      : predicate.label
    : '___';

  // The visible "I" rendering when Self is selected — keep the user's typed
  // casing when they wrote "me" or "we", but default to capital I.
  const displayedSubject = isSelf ? normalizeSelfDisplay(subject) : subject;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
        <span>Claim Preview</span>
        {isComplete && (
          <span className={`text-xs font-medium ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        )}
        {isSelf && (
          <span
            className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `color-mix(in srgb, ${ATOM_CATEGORIES.self.color} 12%, transparent)`,
              color: ATOM_CATEGORIES.self.color,
              border: `1px solid color-mix(in srgb, ${ATOM_CATEGORIES.self.color} 30%, transparent)`,
            }}
          >
            Shared claim
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-base">
        <span style={{ color: subjectColor }}>{hasSubject ? displayedSubject : '___'}</span>
        <span className="text-[var(--color-text-muted)]">—</span>
        <span className="text-[var(--color-accent)]">{displayedPredicate}</span>
        <span className="text-[var(--color-text-muted)]">—</span>
        <span style={{ color: objectColor }}>{hasObject ? object : '___'}</span>
      </div>

      {validationMessage && (
        <p className="mt-2 text-xs text-red-400">{validationMessage}</p>
      )}

      {isComplete && isValid && (
        <>
          <p className="mt-2 text-xs text-emerald-400/70">
            {displayedSubject} ({subjectType}) {displayedPredicate} {object} ({objectType})
          </p>

          {isSelf && predicate && hasObject && (
            <SharedClaimStakersPreview
              predicateLabel={predicate.label}
              object={object}
              objectColor={objectColor}
            />
          )}

          <div className="mt-3 flex items-center gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Save to History
              </button>
            )}
            {onAddToBatch && (
              <button
                onClick={onAddToBatch}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                Add to Batch
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Shows how a `Self`-subject claim renders from different stakers' points of
 * view so the aggregation benefit is tangible — one claim, N signals.
 */
function SharedClaimStakersPreview({
  predicateLabel,
  object,
  objectColor,
}: {
  predicateLabel: string;
  object: string;
  objectColor: string;
}) {
  const sampleStakers = [
    { label: 'you stake', identity: 'you' },
    { label: 'Alice stakes', identity: 'Alice' },
    { label: 'a wallet stakes', identity: '0xabc…' },
  ];

  return (
    <div className="mt-3 rounded-md border border-[var(--color-border)]/60 bg-[var(--color-surface)]/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
        How stakers read this claim
      </p>
      <ul className="space-y-1 font-mono text-xs">
        {sampleStakers.map(({ label, identity }) => (
          <li key={label} className="flex items-center gap-2">
            <span className="text-[var(--color-text-muted)] w-28 shrink-0">When {label}:</span>
            <span className="text-[var(--color-text-secondary)]">→</span>
            <span className="text-[var(--color-text)]">{identity}</span>
            <span className="text-[var(--color-text-muted)]">—</span>
            <span className="text-[var(--color-accent)]">{predicateLabel}</span>
            <span className="text-[var(--color-text-muted)]">—</span>
            <span style={{ color: objectColor }}>{object}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Normalize the rendered Self subject — "i" → "I", keep "we"/"us"/"me" as typed. */
function normalizeSelfDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (/^i$/i.test(trimmed)) return 'I';
  return trimmed.toLowerCase();
}
