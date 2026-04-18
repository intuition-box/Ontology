import { z } from 'zod';

import { ATOM_TYPES } from '../data/atom-types';
import { PREDICATES } from '../data/predicates';

/**
 * Authoritative sets of known IDs, derived from the data layer.
 * Kept as Sets for O(1) validation and typed as branded strings in schemas.
 */
const ATOM_TYPE_IDS = new Set(ATOM_TYPES.map((t) => t.id));
const PREDICATE_IDS = new Set(PREDICATES.map((p) => p.id));

/** Max length for user-supplied subject/object strings parsed from untrusted input. */
const MAX_ENTITY_STRING_LENGTH = 500;

const AtomTypeIdSchema = z
  .string()
  .refine((id) => ATOM_TYPE_IDS.has(id), { message: 'Unknown atom type' });

const PredicateIdSchema = z
  .string()
  .refine((id) => PREDICATE_IDS.has(id), { message: 'Unknown predicate' });

const EntityStringSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_ENTITY_STRING_LENGTH);

/**
 * Schema for a claim entry persisted in localStorage history or batch.
 * Rejects any entry referencing types or predicates the app doesn't know about.
 */
export const ClaimEntrySchema = z.object({
  id: z.string().min(1),
  subject: EntityStringSchema,
  subjectType: AtomTypeIdSchema,
  predicateId: PredicateIdSchema,
  predicateLabel: z.string(),
  object: EntityStringSchema,
  objectType: AtomTypeIdSchema,
  timestamp: z.number().int().nonnegative(),
});

export const ClaimEntryListSchema = z.array(ClaimEntrySchema);

/**
 * Compact wire format used in shareable URL hashes. Five short keys to keep
 * encoded URLs small. Validated strictly against known atom types/predicates.
 */
export const CompactClaimSchema = z.object({
  s: EntityStringSchema,
  st: AtomTypeIdSchema,
  p: PredicateIdSchema,
  o: EntityStringSchema,
  ot: AtomTypeIdSchema,
});

export const CompactClaimListSchema = z.array(CompactClaimSchema);

export const ThemeSchema = z.union([z.literal('dark'), z.literal('light')]);

export type CompactClaim = z.infer<typeof CompactClaimSchema>;
