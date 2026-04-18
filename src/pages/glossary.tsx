import { useMemo, useState } from 'react';

import {
  GLOSSARY_ATOMS,
  portalUrlFor,
  type GlossaryAtom,
} from '../data/glossary-atoms';
import type { PredicateForm } from '../data/predicates';

type KindFilter = 'all' | 'predicate' | 'entity';

/**
 * Glossary of currently-relevant on-chain Intuition atoms.
 *
 * Deliberately isolated from the rest of the app — the atoms here reflect
 * the live protocol and will be obsolete when the schema upgrades, whereas
 * the claim-builder/matrix/graph work against Ontology's preview of the
 * next schema. Browsing here does not modify builder state.
 */
export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [groupByConcept, setGroupByConcept] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_ATOMS.filter((a) => {
      if (kindFilter !== 'all' && a.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        a.label.toLowerCase().includes(q) ||
        (a.description?.toLowerCase().includes(q) ?? false) ||
        (a.conceptGroup?.toLowerCase().includes(q) ?? false) ||
        a.address.toLowerCase().includes(q)
      );
    });
  }, [query, kindFilter]);

  const grouped = useMemo(() => {
    if (!groupByConcept) return null;
    const groups = new Map<string, GlossaryAtom[]>();
    for (const atom of filtered) {
      const key = atom.conceptGroup ?? '—';
      const bucket = groups.get(key);
      if (bucket) bucket.push(atom);
      else groups.set(key, [atom]);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupByConcept]);

  const counts = useMemo(() => {
    const all = GLOSSARY_ATOMS.length;
    const predicate = GLOSSARY_ATOMS.filter((a) => a.kind === 'predicate').length;
    const entity = GLOSSARY_ATOMS.filter((a) => a.kind === 'entity').length;
    return { all, predicate, entity };
  }, []);

  return (
    <main className="px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Atom Glossary</h1>
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
            {filtered.length} / {GLOSSARY_ATOMS.length}
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
          On-chain atoms from the current Intuition protocol, with their addresses
          and grammatical forms. This list is a reference — it reflects the live
          protocol and may change. The rest of Ontology uses a separate canonical
          vocabulary designed to preview the next schema, so picking an atom here
          does not insert it into the claim builder.
        </p>
      </header>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by label, concept, description, or address…"
            className="focus-ring w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-8 pr-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-accent)]"
            aria-label="Search glossary atoms"
          />
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>

        <div className="flex items-center gap-1" role="tablist" aria-label="Filter by kind">
          <KindChip
            label="All"
            count={counts.all}
            active={kindFilter === 'all'}
            onClick={() => setKindFilter('all')}
          />
          <KindChip
            label="Predicates"
            count={counts.predicate}
            active={kindFilter === 'predicate'}
            onClick={() => setKindFilter('predicate')}
          />
          <KindChip
            label="Entities"
            count={counts.entity}
            active={kindFilter === 'entity'}
            onClick={() => setKindFilter('entity')}
          />
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={groupByConcept}
            onChange={(e) => setGroupByConcept(e.target.checked)}
            className="focus-ring rounded border-[var(--color-border)]"
          />
          Group by concept
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
          No atoms match those filters.
        </div>
      ) : grouped ? (
        <div className="space-y-4">
          {grouped.map(([concept, atoms]) => (
            <ConceptGroup key={concept} concept={concept} atoms={atoms} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <ul className="divide-y divide-[var(--color-border)]">
            {filtered.map((atom) => (
              <li key={atom.address} className="px-4 py-3">
                <AtomRow atom={atom} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

// ─── Pieces ──────────────────────────────────────────────────

function ConceptGroup({ concept, atoms }: { concept: string; atoms: GlossaryAtom[] }) {
  const hasVariants = atoms.length > 1;
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <header className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]/70">
          {concept}
        </span>
        {hasVariants && (
          <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
            {atoms.length} forms
          </span>
        )}
      </header>
      <ul className="divide-y divide-[var(--color-border)]">
        {atoms.map((atom) => (
          <li key={atom.address} className="px-4 py-3">
            <AtomRow atom={atom} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AtomRow({ atom }: { atom: GlossaryAtom }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-sm font-medium text-[var(--color-text)]">{atom.label}</h3>
        <KindBadge kind={atom.kind} />
        {atom.form && <FormBadge form={atom.form} />}
      </div>
      {atom.description && (
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {atom.description}
        </p>
      )}
      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
        <code className="font-mono truncate">{shortenAddress(atom.address)}</code>
        <CopyAddressButton address={atom.address} />
        <a
          href={portalUrlFor(atom.address)}
          target="_blank"
          rel="noreferrer noopener"
          className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          View on portal <ExternalIcon />
        </a>
      </div>
    </div>
  );
}

function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be blocked (non-secure context, iframe). Silent
      // fallback — the address is still visible for manual selection.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
      aria-label={copied ? 'Address copied' : 'Copy atom address'}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function KindChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium transition-colors ${
        active
          ? 'text-[var(--color-text)] bg-[var(--color-surface-raised)]'
          : 'text-[var(--color-text-muted)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
      }`}
    >
      {label}
      <span className="ml-1.5 text-[10px] text-[var(--color-text-muted)]">{count}</span>
    </button>
  );
}

function KindBadge({ kind }: { kind: GlossaryAtom['kind'] }) {
  const styles: Record<GlossaryAtom['kind'], { label: string; color: string }> = {
    predicate: { label: 'Predicate', color: 'var(--color-accent)' },
    entity: { label: 'Entity', color: '#fb7185' },
  };
  const { label, color } = styles[kind];
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

function FormBadge({ form }: { form: PredicateForm }) {
  const labels: Record<PredicateForm, string> = {
    bare: 'bare',
    'third-person-singular': '3rd-person',
    past: 'past',
    phrase: 'phrase',
    passive: 'passive',
  };
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
      {labels[form]}
    </span>
  );
}

// ─── Tiny helpers ────────────────────────────────────────────

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
