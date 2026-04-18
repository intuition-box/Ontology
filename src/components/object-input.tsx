import { useState } from 'react';
import { getObjectTypesForPredicate, PREDICATES } from '../data/predicates';
import { ATOM_TYPES, type AtomType } from '../data/atom-types';
import { TypeBadge } from './type-badge';
import { LockNote } from './lock-note';

interface ObjectInputProps {
  predicateId: string | null;
  value: string;
  onChange: (value: string) => void;
  selectedType: string | null;
  onTypeChange: (typeId: string | null) => void;
  disabled: boolean;
}

export function ObjectInput({
  predicateId,
  value,
  onChange,
  selectedType,
  onTypeChange,
  disabled,
}: ObjectInputProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);

  const expectedTypes = predicateId ? getObjectTypesForPredicate(predicateId) : [];
  const expectedAtomTypes = expectedTypes
    .map((id) => ATOM_TYPES.find((t) => t.id === id))
    .filter((t): t is AtomType => t !== undefined);

  const selectedAtomType = ATOM_TYPES.find((t) => t.id === selectedType);
  const predicate = predicateId ? PREDICATES.find((p) => p.id === predicateId) : undefined;

  // Auto-select type if only one option
  const onlyExpected = expectedTypes.length === 1 ? expectedTypes[0] : null;
  const onlyExpectedAtom = onlyExpected
    ? ATOM_TYPES.find((t) => t.id === onlyExpected)
    : undefined;
  if (onlyExpected && selectedType !== onlyExpected && !disabled) {
    onTypeChange(onlyExpected);
  }

  const handleTypeSelect = (typeId: string) => {
    onTypeChange(typeId);
    setShowTypePicker(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">Object</label>
      <div className={`relative ${disabled ? 'opacity-60' : ''}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={
            disabled
              ? 'Select a predicate first'
              : expectedTypes.length > 0
                ? `Enter ${expectedTypes.join(' or ')}...`
                : 'Enter object...'
          }
          className={`focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-accent)] ${
            disabled ? 'cursor-not-allowed' : ''
          } ${selectedAtomType && !disabled ? 'pr-24' : ''}`}
        />
        {selectedAtomType && !disabled && (
          <button
            type="button"
            onClick={() => setShowTypePicker((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
            aria-label={`Change type (currently ${selectedAtomType.label})`}
          >
            <TypeBadge typeId={selectedAtomType.id} category={selectedAtomType.category} />
          </button>
        )}
      </div>

      {!disabled && onlyExpectedAtom && predicate && (
        <LockNote>
          Only <code className="text-[var(--color-text-secondary)]">{onlyExpectedAtom.label}</code>{' '}
          is valid here — per the{' '}
          <code className="text-[var(--color-text-secondary)]">{predicate.label}</code> definition.
        </LockNote>
      )}

      {!disabled && (showTypePicker || (!selectedType && expectedAtomTypes.length > 1)) && expectedAtomTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)] self-center mr-1">Type:</span>
          {expectedAtomTypes.map((atomType) => (
            <button
              key={atomType.id}
              onClick={() => handleTypeSelect(atomType.id)}
              className={`focus-ring rounded-md px-2 py-1 text-xs transition-colors ${
                selectedType === atomType.id
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {atomType.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
