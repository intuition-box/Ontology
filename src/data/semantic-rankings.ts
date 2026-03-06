import { PREDICATES, type PredicateRule } from './predicates';
import { ATOM_TYPES } from './atom-types';

/**
 * An entity-to-entity mapping: which entity types can connect
 * through DefinedTerm predicates in the Intuition protocol.
 *
 * All three positions in a triple are entities:
 *   SubjectEntity → DefinedTerm → ObjectEntity
 */
export interface EntityMapping {
  subjectType: string;
  objectType: string;
  /** All valid predicate entities (DefinedTerms) for this pair */
  predicates: PredicateRule[];
  /** Semantic group for display clustering */
  group: string;
  /** Sort priority within group (lower = first) */
  priority: number;
}

/**
 * Semantic groups in display order.
 */
const SEMANTIC_GROUPS = [
  'Identity & Trust',
  'Membership & Work',
  'Creation & Contribution',
  'Interests & Expertise',
  'Social & Endorsement',
  'Location & Events',
  'Commerce & Products',
  'Software & Tools',
  'Blockchain & Onchain',
  'Content & Media',
  'Taxonomy & Classification',
] as const;

type SemanticGroup = (typeof SEMANTIC_GROUPS)[number];

/**
 * Maps each predicate to its semantic group and priority.
 */
const PREDICATE_SEMANTICS: Record<string, { group: SemanticGroup; priority: number }> = {
  trusts:          { group: 'Identity & Trust', priority: 1 },
  knows:           { group: 'Identity & Trust', priority: 2 },
  follows:         { group: 'Identity & Trust', priority: 3 },

  founderOf:       { group: 'Membership & Work', priority: 1 },
  memberOf:        { group: 'Membership & Work', priority: 2 },
  worksAt:         { group: 'Membership & Work', priority: 3 },
  employs:         { group: 'Membership & Work', priority: 4 },
  advisedBy:       { group: 'Membership & Work', priority: 5 },
  partnersWith:    { group: 'Membership & Work', priority: 6 },
  acquiredBy:      { group: 'Membership & Work', priority: 7 },

  created:         { group: 'Creation & Contribution', priority: 1 },
  contributorTo:   { group: 'Creation & Contribution', priority: 2 },
  develops:        { group: 'Creation & Contribution', priority: 3 },
  maintains:       { group: 'Creation & Contribution', priority: 4 },
  createdBy:       { group: 'Creation & Contribution', priority: 5 },
  developedBy:     { group: 'Creation & Contribution', priority: 6 },
  maintainedBy:    { group: 'Creation & Contribution', priority: 7 },
  authoredBy:      { group: 'Creation & Contribution', priority: 8 },
  publishedBy:     { group: 'Creation & Contribution', priority: 9 },

  expertIn:        { group: 'Interests & Expertise', priority: 1 },
  interestedIn:    { group: 'Interests & Expertise', priority: 2 },
  advocates:       { group: 'Interests & Expertise', priority: 3 },

  endorses:        { group: 'Social & Endorsement', priority: 1 },
  recommends:      { group: 'Social & Endorsement', priority: 2 },
  likes:           { group: 'Social & Endorsement', priority: 3 },
  reviewed:        { group: 'Social & Endorsement', priority: 4 },
  sponsors:        { group: 'Social & Endorsement', priority: 5 },
  supports:        { group: 'Social & Endorsement', priority: 6 },
  about:           { group: 'Social & Endorsement', priority: 7 },
  replyTo:         { group: 'Social & Endorsement', priority: 8 },
  reviewOf:        { group: 'Social & Endorsement', priority: 9 },

  locatedIn:       { group: 'Location & Events', priority: 1 },
  headquarteredIn: { group: 'Location & Events', priority: 2 },
  attendedEvent:   { group: 'Location & Events', priority: 3 },
  organizedEvent:  { group: 'Location & Events', priority: 4 },

  offers:          { group: 'Commerce & Products', priority: 1 },
  manufactures:    { group: 'Commerce & Products', priority: 2 },
  uses:            { group: 'Commerce & Products', priority: 3 },
  brandOf:         { group: 'Commerce & Products', priority: 4 },
  soldBy:          { group: 'Commerce & Products', priority: 5 },
  competitorOf:    { group: 'Commerce & Products', priority: 6 },

  dependsOn:       { group: 'Software & Tools', priority: 1 },
  alternativeTo:   { group: 'Software & Tools', priority: 2 },
  forkOf:          { group: 'Software & Tools', priority: 3 },
  implements:      { group: 'Software & Tools', priority: 4 },
  hostedBy:        { group: 'Software & Tools', priority: 5 },

  ownedBy:         { group: 'Blockchain & Onchain', priority: 1 },
  controlledBy:    { group: 'Blockchain & Onchain', priority: 2 },
  deployedOn:      { group: 'Blockchain & Onchain', priority: 3 },
  tokenOf:         { group: 'Blockchain & Onchain', priority: 4 },

  taggedWith:      { group: 'Content & Media', priority: 1 },
  partOf:          { group: 'Content & Media', priority: 2 },

  isA:             { group: 'Taxonomy & Classification', priority: 1 },
  relatedTo:       { group: 'Taxonomy & Classification', priority: 2 },
  subConceptOf:    { group: 'Taxonomy & Classification', priority: 3 },
  oppositeOf:      { group: 'Taxonomy & Classification', priority: 4 },
};

const groupOrder = new Map(SEMANTIC_GROUPS.map((g, i) => [g, i]));

/**
 * Builds entity-to-entity mappings for a given subject type.
 * Groups by unique (subjectType, objectType) pairs, collecting
 * all valid predicates for each pair.
 */
export function getEntityMappingsForSubject(subjectTypeId: string): EntityMapping[] {
  const subjectAtom = ATOM_TYPES.find((t) => t.id === subjectTypeId);
  if (!subjectAtom) return [];

  return buildMappings(
    PREDICATES.filter((p) => p.subjectTypes.includes(subjectTypeId)),
    [subjectTypeId]
  );
}

/**
 * Builds the full entity-to-entity mapping across all entity types.
 */
export function getAllEntityMappings(): EntityMapping[] {
  return buildMappings(PREDICATES);
}

/**
 * Core: builds grouped (subjectType, objectType) → predicates[] mappings.
 */
function buildMappings(
  predicates: PredicateRule[],
  filterSubjectTypes?: string[]
): EntityMapping[] {
  // Accumulate predicates per (subject, object) pair
  const pairMap = new Map<string, { predicates: PredicateRule[]; bestGroup: string; bestPriority: number }>();

  for (const predicate of predicates) {
    const semantics = PREDICATE_SEMANTICS[predicate.id];
    if (!semantics) continue;

    const subjectTypes = filterSubjectTypes ?? predicate.subjectTypes;

    for (const subjectTypeId of subjectTypes) {
      if (!ATOM_TYPES.find((t) => t.id === subjectTypeId)) continue;

      for (const objectTypeId of predicate.objectTypes) {
        if (!ATOM_TYPES.find((t) => t.id === objectTypeId)) continue;

        const key = `${subjectTypeId}:${objectTypeId}`;
        const existing = pairMap.get(key);

        if (existing) {
          existing.predicates.push(predicate);
          // Keep the highest-priority (lowest number) group
          const existingGroupIdx = groupOrder.get(existing.bestGroup as SemanticGroup) ?? 99;
          const newGroupIdx = groupOrder.get(semantics.group) ?? 99;
          if (newGroupIdx < existingGroupIdx || (newGroupIdx === existingGroupIdx && semantics.priority < existing.bestPriority)) {
            existing.bestGroup = semantics.group;
            existing.bestPriority = semantics.priority;
          }
        } else {
          pairMap.set(key, {
            predicates: [predicate],
            bestGroup: semantics.group,
            bestPriority: semantics.priority,
          });
        }
      }
    }
  }

  // Convert to EntityMapping[]
  const mappings: EntityMapping[] = [];
  for (const [key, value] of pairMap) {
    const [subjectType, objectType] = key.split(':');
    mappings.push({
      subjectType,
      objectType,
      predicates: value.predicates,
      group: value.bestGroup,
      priority: value.bestPriority,
    });
  }

  // Sort: group order → priority → subject type → object type
  mappings.sort((a, b) => {
    const gA = groupOrder.get(a.group as SemanticGroup) ?? 99;
    const gB = groupOrder.get(b.group as SemanticGroup) ?? 99;
    if (gA !== gB) return gA - gB;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.subjectType.localeCompare(b.subjectType) || a.objectType.localeCompare(b.objectType);
  });

  return mappings;
}

/**
 * Builds entity-to-entity mappings filtered to combinations
 * involving any of the given type IDs (as subject OR object).
 */
export function getEntityMappingsForTypes(typeIds: string[]): EntityMapping[] {
  const typeSet = new Set(typeIds);
  const all = getAllEntityMappings();
  return all.filter((m) => typeSet.has(m.subjectType) || typeSet.has(m.objectType));
}

export { SEMANTIC_GROUPS };
