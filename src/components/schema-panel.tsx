import { useState } from 'react';
import { ATOM_TYPES, ATOM_CATEGORIES, buildClassificationEnvelope, type SchemaField, type AtomType } from '../data/atom-types';
import { TypeBadge } from './type-badge';

interface SchemaPanelProps {
  selectedTypeId: string | null;
  searchQuery?: string;
}

export function SchemaPanel({ selectedTypeId, searchQuery }: SchemaPanelProps) {
  const [showEnvelope, setShowEnvelope] = useState(false);
  const atomType = ATOM_TYPES.find((t) => t.id === selectedTypeId);

  const color = atomType ? ATOM_CATEGORIES[atomType.category].color : undefined;

  // Deictic atoms (no onchain fields, but a resolution target) serialize more
  // usefully as their resolution's envelope than as an empty envelope of
  // their own — the user wants to see what the claim actually looks like
  // on-chain, which is the resolved identity's payload.
  const resolvedFor =
    atomType && atomType.onchainFields.length === 0 && atomType.resolvesToTypeIds?.length
      ? ATOM_TYPES.find((t) => t.id === atomType.resolvesToTypeIds?.[0])
      : undefined;

  const envelope = atomType
    ? buildClassificationEnvelope(resolvedFor ?? atomType)
    : null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 h-full overflow-auto flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Entity Schema</h2>
        {atomType && (
          <div className="flex items-center gap-1 shrink-0" role="tablist" aria-label="Schema view">
            <button
              onClick={() => setShowEnvelope(false)}
              role="tab"
              aria-selected={!showEnvelope}
              aria-controls="schema-fields-panel"
              className={`focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium bg-[var(--color-surface-raised)] transition-colors ${
                !showEnvelope
                  ? 'text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setShowEnvelope(true)}
              role="tab"
              aria-selected={showEnvelope}
              aria-controls="schema-jsonld-panel"
              className={`focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium bg-[var(--color-surface-raised)] transition-colors ${
                showEnvelope
                  ? 'text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              JSON-LD
            </button>
          </div>
        )}
      </div>

      {atomType ? (
        <>
          <div className="flex-1 flex flex-col min-h-0 mt-4 gap-4">
            {showEnvelope ? (
              <div id="schema-jsonld-panel" role="tabpanel" className="flex flex-col gap-3">
                {resolvedFor && (
                  <div className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 p-4 space-y-2">
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {atomType.description}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                      This atom has no onchain data fields — it's a deictic
                      reference that resolves at stake time rather than carrying
                      its own identity payload. The envelope below shows the
                      typical resolution target (<code>{resolvedFor.id}</code>).
                    </p>
                  </div>
                )}
                <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-[var(--color-text-secondary)] leading-relaxed whitespace-pre">
                    {JSON.stringify(envelope, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <FieldsTab
                atomType={atomType}
                resolvedFor={resolvedFor}
                color={color}
                searchQuery={searchQuery}
              />
            )}
          </div>

          <div className="shrink-0 mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-muted)]">
              {(resolvedFor ?? atomType).schemaOrgType ? (
                <>@type: <span className="font-mono text-[var(--color-text-secondary)]">{(resolvedFor ?? atomType).schemaOrgType}</span></>
              ) : (
                <span className="font-mono text-[var(--color-text-secondary)]">Custom (no Schema.org)</span>
              )}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              plugin: <span className="font-mono text-[var(--color-text-secondary)]">{(resolvedFor ?? atomType).pluginId}</span>
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--color-text-muted)]">Select a type to see its schema</p>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the Fields tab. For deictic atoms with a resolution target
 * (e.g. `Self` → `Person`), shows the target's full schema — onchain fields,
 * enrichment fields, and footer metadata — with a short note on top
 * attributing the rendered schema to the current atom. For regular atoms,
 * renders their own schema directly. In both cases the layout and field
 * rows are identical, so clicking `Self` and clicking `Person` produces
 * visually parallel pages.
 */
function FieldsTab({
  atomType,
  resolvedFor,
  color,
  searchQuery,
}: {
  atomType: AtomType;
  resolvedFor: AtomType | undefined;
  color: string | undefined;
  searchQuery?: string;
}) {
  const sourceAtom = resolvedFor ?? atomType;
  const sourceColor = resolvedFor ? ATOM_CATEGORIES[resolvedFor.category].color : color;
  const sq = (searchQuery ?? '').trim().toLowerCase();
  const fieldMatches = (field: SchemaField): boolean | undefined => {
    if (!sq) return undefined;
    return (
      field.name.toLowerCase().includes(sq) ||
      field.type.toLowerCase().includes(sq) ||
      (field.description ?? '').toLowerCase().includes(sq)
    );
  };

  return (
    <div id="schema-fields-panel" role="tabpanel" className="flex flex-col gap-4">
      {/* Attribution header — the badge reflects the currently-selected atom
          so the user always sees "what did I click on?" even when the fields
          below belong to the resolution target. */}
      <div className="flex items-center gap-2">
        <TypeBadge typeId={atomType.id} category={atomType.category} size="md" />
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          Onchain Fields (Atom Data)
        </h3>
      </div>

      {resolvedFor && (
        <div className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 p-4 space-y-2">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {atomType.description}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            This atom has no onchain data fields of its own — it's a deictic
            reference that resolves at stake time. The schema shown below
            belongs to <code>{resolvedFor.id}</code>, the typical resolution
            target.
          </p>
        </div>
      )}

      <div>
        {sourceAtom.onchainFields.map((field) => (
          <FieldRow
            key={field.name}
            field={field}
            accentColor={sourceColor}
            isMatch={fieldMatches(field)}
          />
        ))}
      </div>

      {sourceAtom.enrichmentFields.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Enrichment Artifacts (Offchain)
          </h3>
          <div className="space-y-1">
            {sourceAtom.enrichmentFields.map((field) => (
              <FieldRow
                key={field.name}
                field={field}
                isMatch={fieldMatches(field)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({ field, accentColor, isMatch }: { field: SchemaField; accentColor?: string; isMatch?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--color-surface-hover)] group transition-opacity"
      style={{ opacity: isMatch === false ? 0.3 : 1 }}
    >
      <span
        className="font-mono text-sm min-w-[80px] sm:min-w-[120px]"
        style={{ color: accentColor ?? 'var(--color-text-secondary)' }}
      >
        {field.name}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <span className="text-xs text-[var(--color-text-muted)] font-mono">{field.type}</span>
      <span className="text-xs text-[var(--color-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        {field.description}
      </span>
    </div>
  );
}
