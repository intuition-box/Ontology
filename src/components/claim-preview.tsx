import { PREDICATES } from '../data/predicates';
import { ATOM_TYPES, ATOM_CATEGORIES } from '../data/atom-types';

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

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
        <span>Claim Preview</span>
        {isComplete && (
          <span className={`text-xs font-medium ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-base">
        <span style={{ color: subjectColor }}>{hasSubject ? subject : '___'}</span>
        <span className="text-[var(--color-text-muted)]">—</span>
        <span className="text-[var(--color-accent)]">
          {hasPredicate ? predicate?.label : '___'}
        </span>
        <span className="text-[var(--color-text-muted)]">—</span>
        <span style={{ color: objectColor }}>{hasObject ? object : '___'}</span>
      </div>

      {validationMessage && (
        <p className="mt-2 text-xs text-red-400">{validationMessage}</p>
      )}

      {isComplete && isValid && (
        <>
          <p className="mt-2 text-xs text-emerald-400/70">
            {subject} ({subjectType}) {predicate?.label} {object} ({objectType})
          </p>
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
