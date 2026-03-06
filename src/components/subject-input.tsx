import { useState, useEffect, useCallback } from 'react';
import { classifySubject, type ClassificationResult } from '../lib/subject-classifier';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomType, type AtomCategory } from '../data/atom-types';
import { EXAMPLE_CLAIMS, type ExampleClaim } from '../data/example-claims';
import { TypeBadge } from './type-badge';

/** Quick picks shown in the compact type selector */
const QUICK_PICK_IDS = [
  'Person', 'Organization', 'SoftwareSourceCode', 'DefinedTerm',
  'Place', 'Product', 'Event', 'Thing',
];

interface SubjectInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedType: string | null;
  onTypeChange: (typeId: string | null) => void;
  onExampleClick?: (example: ExampleClaim) => void;
}

export function SubjectInput({ value, onChange, selectedType, onTypeChange, onExampleClick }: SubjectInputProps) {
  const [classification, setClassification] = useState<ClassificationResult>({
    detectedType: null,
    confidence: 'low',
  });
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);

  const classify = useCallback((input: string) => {
    const result = classifySubject(input);
    setClassification(result);

    if (result.detectedType && result.confidence === 'high') {
      onTypeChange(result.detectedType);
      setShowTypePicker(false);
      setShowAllTypes(false);
    } else if (result.detectedType && result.confidence === 'medium') {
      onTypeChange(result.detectedType);
      setShowTypePicker(true);
    } else if (input.trim()) {
      setShowTypePicker(true);
    } else {
      onTypeChange(null);
      setShowTypePicker(false);
      setShowAllTypes(false);
    }
  }, [onTypeChange]);

  useEffect(() => {
    const timeout = setTimeout(() => classify(value), 200);
    return () => clearTimeout(timeout);
  }, [value, classify]);

  const handleTypeSelect = (typeId: string) => {
    onTypeChange(typeId);
    setShowTypePicker(false);
    setShowAllTypes(false);
  };

  const selectedAtomType = ATOM_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">Subject</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='e.g., "Bob", "0x1234...", "Uniswap"'
          className={`focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-accent)] ${selectedAtomType ? 'pr-24' : ''}`}
          aria-describedby={classification.warning ? 'subject-warning' : undefined}
        />
        {selectedAtomType && (
          <button
            type="button"
            onClick={() => {
              setShowTypePicker(true);
              setShowAllTypes(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
            aria-label={`Change type (currently ${selectedAtomType.label})`}
          >
            <TypeBadge typeId={selectedAtomType.id} category={selectedAtomType.category} />
          </button>
        )}
      </div>

      {classification.warning && (
        <p id="subject-warning" className="text-xs text-amber-400" role="alert">{classification.warning}</p>
      )}

      {showTypePicker && value.trim() && !showAllTypes && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)] self-center mr-1">Type:</span>
          {ATOM_TYPES.filter((t) =>
            QUICK_PICK_IDS.includes(t.id) || t.id === classification.detectedType
          ).map((atomType: AtomType) => (
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
          <button
            onClick={() => setShowAllTypes(true)}
            className="focus-ring rounded-md px-2 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] underline underline-offset-2"
          >
            all types...
          </button>
        </div>
      )}

      {showAllTypes && value.trim() && (
        <AllTypePicker selectedType={selectedType} onSelect={handleTypeSelect} />
      )}

      {/* Example claims for selected type, using the user's input as subject */}
      {selectedType && EXAMPLE_CLAIMS[selectedType] && onExampleClick && value.trim() && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Examples
          </span>
          {EXAMPLE_CLAIMS[selectedType].map((example, i) => {
            const personalized: ExampleClaim = {
              ...example,
              subject: value.trim(),
            };
            return (
              <button
                key={i}
                onClick={() => onExampleClick(personalized)}
                className="focus-ring flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs text-left text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <span className="text-[var(--color-text)] truncate">{personalized.subject}</span>
                <span className="text-[var(--color-text-muted)]">—</span>
                <span className="text-[var(--color-accent)]">{example.predicateLabel}</span>
                <span className="text-[var(--color-text-muted)]">—</span>
                <span className="text-[var(--color-text)]">{example.object}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AllTypePicker({ selectedType, onSelect }: { selectedType: string | null; onSelect: (id: string) => void }) {
  // Group by category
  const grouped = new Map<AtomCategory, AtomType[]>();
  for (const atomType of ATOM_TYPES) {
    const list = grouped.get(atomType.category) ?? [];
    list.push(atomType);
    grouped.set(atomType.category, list);
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-2 max-h-64 overflow-y-auto">
      {Array.from(grouped.entries()).map(([category, types]) => {
        const { label, color } = ATOM_CATEGORIES[category];
        return (
          <div key={category}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color }}>
              {label}
            </p>
            <div className="flex flex-wrap gap-1">
              {types.map((atomType) => (
                <button
                  key={atomType.id}
                  onClick={() => onSelect(atomType.id)}
                  className={`focus-ring rounded px-2 py-1 text-xs transition-colors ${
                    selectedType === atomType.id
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
                  }`}
                  title={atomType.description}
                >
                  {atomType.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
