import { useState, useEffect } from 'react';
import { classifySubject, type ClassificationResult } from '../lib/subject-classifier';
import { conjugateForSelf, isSelfSubject } from '../lib/conjugate';
import { SUBJECT_CLASSIFY_DEBOUNCE_MS } from '../lib/timings';
import { useDebounce } from '../lib/use-debounce';
import { useLocalStorage } from '../lib/use-local-storage';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomType, type AtomCategory } from '../data/atom-types';
import { EXAMPLE_CLAIMS, type ExampleClaim } from '../data/example-claims';
import { TypeBadge } from './type-badge';

/** Quick picks shown in the compact type selector */
const QUICK_PICK_IDS = [
  'Self', 'Person', 'Organization', 'SoftwareSourceCode', 'DefinedTerm',
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
  // First-run explainer for the Self atom — shown the first time a user selects
  // it, suppressed afterwards so it doesn't become noise.
  const [selfIntroSeen, setSelfIntroSeen] = useLocalStorage('ontology-self-intro-seen', false);
  const isSelf = isSelfSubject(selectedType);

  // Debounce typing before classifying so we don't thrash the picker state
  // on every keystroke. Uses the shared debounce hook for consistency with
  // the global search field.
  const debouncedValue = useDebounce(value, SUBJECT_CLASSIFY_DEBOUNCE_MS);

  useEffect(() => {
    const result = classifySubject(debouncedValue);
    setClassification(result);

    if (result.detectedType && result.confidence === 'high') {
      onTypeChange(result.detectedType);
      setShowTypePicker(false);
      setShowAllTypes(false);
    } else if (result.detectedType && result.confidence === 'medium') {
      onTypeChange(result.detectedType);
      setShowTypePicker(true);
    } else if (debouncedValue.trim()) {
      setShowTypePicker(true);
    } else {
      onTypeChange(null);
      setShowTypePicker(false);
      setShowAllTypes(false);
    }
  }, [debouncedValue, onTypeChange]);

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

      {isSelf && (
        <SelfAtomNote
          expanded={!selfIntroSeen}
          onDismiss={() => setSelfIntroSeen(true)}
        />
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
              subject: isSelf ? 'I' : value.trim(),
            };
            const shownPredicate = isSelf
              ? conjugateForSelf(example.predicateId, example.predicateLabel)
              : example.predicateLabel;
            return (
              <button
                key={i}
                onClick={() => onExampleClick(personalized)}
                className="focus-ring flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs text-left text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <span className="text-[var(--color-text)] truncate">{personalized.subject}</span>
                <span className="text-[var(--color-text-muted)]">—</span>
                <span className="text-[var(--color-accent)]">{shownPredicate}</span>
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

/**
 * Informational badge shown when the `Self` atom is selected. Expanded on
 * first encounter so the user understands why `I` is a deliberate choice
 * (shared, aggregatable claims) rather than a grammatical mistake.
 * Collapses to a compact chip on subsequent visits after dismiss.
 */
function SelfAtomNote({ expanded, onDismiss }: { expanded: boolean; onDismiss: () => void }) {
  const accent = ATOM_CATEGORIES.self.color;

  if (!expanded) {
    return (
      <p
        className="text-xs text-[var(--color-text-muted)]"
        style={{ color: `color-mix(in srgb, ${accent} 70%, var(--color-text-muted))` }}
      >
        Using <strong>Self</strong> — this claim aggregates across every staker.
      </p>
    );
  }

  return (
    <div
      className="rounded-md p-3 text-xs"
      role="note"
      aria-label="About the Self atom"
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
        color: 'var(--color-text-secondary)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: accent }}>
        Shared claim with <code>Self</code>
      </p>
      <p className="leading-relaxed">
        Anyone who stakes will resolve <code>I</code> to themselves, so multiple people
        staking <em>“I follow Intuition</em> is one claim with multiple signals — not
        various claims. Prefer <code>Self</code> for statements about
        yourself.
      </p>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring rounded px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Got it
        </button>
      </div>
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
