import { GraphQLClient, gql } from 'graphql-request';
import type { Bytes32 } from '../types';

/**
 * Read layer over the Intuition indexer GraphQL endpoint.
 *
 * Stateless beyond its injected client. Caching, retries, and React
 * state belong to the consumer hooks (TanStack Query). Network errors
 * bubble unchanged so the orchestrator can decide on user-facing
 * recovery.
 *
 * Per `reference/graphql-queries.md` of the Intuition skill: address
 * filters use `_in:` with both checksummed and lowercase variants,
 * never LIKE patterns. Predicate resolution prefers non-TextObject
 * results — `TextObject` atoms are legacy plain-string predicates and
 * must not be reused.
 */

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

/**
 * A triple row with the three atoms joined inline. Used by the live
 * data views (graph, matrix) so a single GraphQL round-trip yields
 * everything needed to render an edge with labeled endpoints.
 */
export interface JoinedTripleRecord extends TripleRecord {
  created_at: string;
  creator_id: string;
  subject: AtomRecord;
  predicate: AtomRecord;
  object: AtomRecord;
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

const GET_ATOM_BY_TERM_ID = gql`
  query GetAtomByTermId($termId: String!) {
    atoms(where: { term_id: { _eq: $termId } }, limit: 1) {
      term_id
      label
      type
    }
  }
`;

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

const LIST_ATOMS = gql`
  query ListAtoms($limit: Int!, $offset: Int!) {
    atoms(limit: $limit, offset: $offset, order_by: { created_at: desc }) {
      term_id
      label
      type
    }
  }
`;

const LIST_RECENT_TRIPLES = gql`
  query ListRecentTriples($limit: Int!, $offset: Int!) {
    triples(
      limit: $limit
      offset: $offset
      order_by: { block_number: desc }
    ) {
      term_id
      subject_id
      predicate_id
      object_id
      created_at
      creator_id
      subject {
        term_id
        label
        type
      }
      predicate {
        term_id
        label
        type
      }
      object {
        term_id
        label
        type
      }
    }
  }
`;

interface FindPredicateAtomsByLabelResponse {
  atoms: PredicateAtomCandidate[];
}
interface GetAtomByTermIdResponse {
  atoms: AtomRecord[];
}
interface ListTriplesByPredicateResponse {
  triples: TripleRecord[];
}
interface ListAtomsResponse {
  atoms: AtomRecord[];
}
interface ListRecentTriplesResponse {
  triples: JoinedTripleRecord[];
}

export class IndexerService {
  private readonly client: GraphQLClient;

  constructor(client: GraphQLClient) {
    this.client = client;
  }

  /**
   * Returns predicate-atom candidates matching the given label, ordered
   * by usage count (most-used first). Raw access — callers should
   * normally route through `resolveCanonicalPredicateByLabel` to enforce
   * the no-TextObject rule.
   */
  async findPredicateAtomsByLabel(label: string): Promise<PredicateAtomCandidate[]> {
    const data = await this.client.request<FindPredicateAtomsByLabelResponse>(
      FIND_PREDICATE_ATOMS_BY_LABEL,
      { label }
    );
    return data.atoms;
  }

  /**
   * Resolves the canonical predicate atom for a label. Skips legacy
   * `TextObject` candidates — when only those exist the orchestrator
   * pins a structured replacement and uses the new atom going forward.
   */
  async resolveCanonicalPredicateByLabel(
    label: string
  ): Promise<PredicateAtomCandidate | null> {
    const candidates = await this.findPredicateAtomsByLabel(label);
    return candidates.find((c) => c.type !== 'TextObject') ?? null;
  }

  async getAtomByTermId(termId: Bytes32): Promise<AtomRecord | null> {
    const data = await this.client.request<GetAtomByTermIdResponse>(
      GET_ATOM_BY_TERM_ID,
      { termId }
    );
    return data.atoms[0] ?? null;
  }

  /**
   * Lists triples having the given predicate atom, capped at `limit`.
   * Pagination is the caller's responsibility.
   */
  async listTriplesByPredicate(
    predicateId: Bytes32,
    limit: number
  ): Promise<TripleRecord[]> {
    const data = await this.client.request<ListTriplesByPredicateResponse>(
      LIST_TRIPLES_BY_PREDICATE,
      { predicateId, limit }
    );
    return data.triples;
  }

  /**
   * Lists atoms most recently created on the indexer, paginated.
   * Used by the tree and graph views to enrich the static seed data
   * with live entities.
   */
  async listAtoms(
    args: { limit: number; offset?: number } = { limit: 100 }
  ): Promise<AtomRecord[]> {
    const data = await this.client.request<ListAtomsResponse>(LIST_ATOMS, {
      limit: args.limit,
      offset: args.offset ?? 0,
    });
    return data.atoms;
  }

  /**
   * Lists triples most recently created on the indexer with subject,
   * predicate, and object atoms joined inline. One round-trip yields
   * everything the graph and matrix views need to render labeled edges.
   */
  async listRecentTriples(
    args: { limit: number; offset?: number } = { limit: 100 }
  ): Promise<JoinedTripleRecord[]> {
    const data = await this.client.request<ListRecentTriplesResponse>(
      LIST_RECENT_TRIPLES,
      { limit: args.limit, offset: args.offset ?? 0 }
    );
    return data.triples;
  }
}
