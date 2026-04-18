import { ATOM_CATEGORIES, ATOM_TYPES, type AtomCategory } from '../data/atom-types';

/**
 * Fallback CSS token used when an atom type ID can't be resolved (e.g. a
 * persisted claim referencing a type that was removed). Consumers render it
 * as a CSS `color:` value — `var()` lookups resolve per theme.
 */
const UNKNOWN_COLOR = 'var(--color-text)';

/**
 * Returns a concrete hex color for the given atom type's category, or the
 * themed fallback token when the ID is unknown. One lookup path so callers
 * don't each reimplement the `find → category → color` dance with slightly
 * different fallbacks.
 */
export function getAtomColor(atomTypeId: string | null | undefined): string {
  if (!atomTypeId) return UNKNOWN_COLOR;
  const atom = ATOM_TYPES.find((t) => t.id === atomTypeId);
  if (!atom) return UNKNOWN_COLOR;
  return ATOM_CATEGORIES[atom.category as AtomCategory].color;
}
