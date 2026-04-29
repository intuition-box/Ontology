import { GraphQLClient, gql } from 'graphql-request';
import { env } from '../../config/env';
import type { Bytes32 } from '../types';

/**
 * GraphQL service skeleton for the Intuition indexer.
 *
 * Exposes typed read functions over the public GraphQL endpoint configured
 * via `env.graphqlUrl`. Stateless: the client is built lazily on first call
 * and kept as a module-level singleton for connection reuse.
 *
 * Caching, retries, and React state are NOT this layer's concern — the
 * consumer hooks (TanStack Query) own that. Network errors bubble.
 *
 * Per `reference/graphql-queries.md` of the Intuition skill: address
 * filters use `_in:` with both checksummed and lowercase variants, never
 * LIKE patterns. Predicate resolution prefers non-TextObject results.
 */

let cachedClient: GraphQLClient | null = null;

function getClient(): GraphQLClient {
  if (cachedClient === null) {
    cachedClient = new GraphQLClient(env.graphqlUrl);
  }
  return cachedClient;
}

/** An atom row returned by the Intuition indexer. */
export interface AtomRecord {
  term_id: Bytes32;
  label: string;
  type: string;
}

/** A triple row returned by the Intuition indexer. */
export interface TripleRecord {
  term_id: Bytes32;
  subject_id: Bytes32;
  predicate_id: Bytes32;
  object_id: Bytes32;
}

/** Atom row enriched with the count of triples in which it acts as predicate. */
export interface PredicateAtomCandidate extends AtomRecord {
  as_predicate_triples_aggregate: {
    aggregate: { count: number } | null;
  };
}

const FIND_PREDICATE_ATOMS_BY_LABEL = gql`
  query FindPredicateAtomsByLabel($label: String!) {
    atoms(
      where: { label: { _eq: $label } }
      order_by: { as_predicate_triples_aggregate: { count: desc } }
    ) {
      term_id
      label
      type
      as_predicate_triples_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

interface FindPredicateAtomsByLabelResponse {
  atoms: PredicateAtomCandidate[];
}

/**
 * Returns predicate-atom candidates matching the given label, ordered by
 * usage count (most-used first).
 *
 * Raw access — callers should normally route through `pickCanonicalPredicate`
 * to enforce the no-TextObject rule. This is exposed for cases that need
 * the full candidate list (debug views, predicate analytics).
 */
export async function findPredicateAtomsByLabel(
  label: string
): Promise<PredicateAtomCandidate[]> {
  const data = await getClient().request<FindPredicateAtomsByLabelResponse>(
    FIND_PREDICATE_ATOMS_BY_LABEL,
    { label }
  );
  return data.atoms;
}

/**
 * Picks the canonical (non-legacy) predicate atom from a candidate list.
 *
 * `TextObject` atoms are legacy plain-string predicates and must not be
 * reused — per the Intuition skill, when only TextObject candidates exist
 * the caller should pin a structured replacement (Thing / Person /
 * Organization) and use the new atom going forward.
 *
 * Returns the first non-TextObject candidate, or `null` when no canonical
 * predicate exists yet for the given label.
 */
export function pickCanonicalPredicate(
  candidates: PredicateAtomCandidate[]
): PredicateAtomCandidate | null {
  return candidates.find((candidate) => candidate.type !== 'TextObject') ?? null;
}

/**
 * Resolves the canonical predicate atom for a label in one call.
 * Combines `findPredicateAtomsByLabel` with the `pickCanonicalPredicate`
 * filter so consumer hooks cannot accidentally reuse a TextObject atom.
 */
export async function resolveCanonicalPredicateByLabel(
  label: string
): Promise<PredicateAtomCandidate | null> {
  const candidates = await findPredicateAtomsByLabel(label);
  return pickCanonicalPredicate(candidates);
}

const GET_ATOM_BY_TERM_ID = gql`
  query GetAtomByTermId($termId: String!) {
    atoms(where: { term_id: { _eq: $termId } }, limit: 1) {
      term_id
      label
      type
    }
  }
`;

interface GetAtomByTermIdResponse {
  atoms: AtomRecord[];
}

/**
 * Returns the atom matching the given term_id, or null if not found.
 */
export async function getAtomByTermId(termId: Bytes32): Promise<AtomRecord | null> {
  const data = await getClient().request<GetAtomByTermIdResponse>(
    GET_ATOM_BY_TERM_ID,
    { termId }
  );
  return data.atoms[0] ?? null;
}

const LIST_TRIPLES_BY_PREDICATE = gql`
  query ListTriplesByPredicate($predicateId: String!, $limit: Int!) {
    triples(
      where: { predicate_id: { _eq: $predicateId } }
      limit: $limit
    ) {
      term_id
      subject_id
      predicate_id
      object_id
    }
  }
`;

interface ListTriplesByPredicateResponse {
  triples: TripleRecord[];
}

/**
 * Lists triples having the given predicate atom, capped at `limit` rows.
 *
 * The hook layer should pass a sensible default (e.g. 50) and stream in
 * additional pages if the view warrants pagination.
 */
export async function listTriplesByPredicate(
  predicateId: Bytes32,
  limit: number
): Promise<TripleRecord[]> {
  const data = await getClient().request<ListTriplesByPredicateResponse>(
    LIST_TRIPLES_BY_PREDICATE,
    { predicateId, limit }
  );
  return data.triples;
}
