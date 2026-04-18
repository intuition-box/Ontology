import {
  PREDICATES,
  PREDICATE_GROUPS,
  type PredicateRule,
  type PredicateSemanticGroup,
} from './predicates';
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
  group: PredicateSemanticGroup;
  /** Sort priority within group (lower = first) */
  priority: number;
}

/** Re-export under the legacy name for consumers that haven't migrated yet. */
export const SEMANTIC_GROUPS = PREDICATE_GROUPS;

const groupOrder = new Map<PredicateSemanticGroup, number>(
  PREDICATE_GROUPS.map((g, i) => [g, i])
);

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
 * Uses each predicate's own `group`/`priority` fields — no duplicate metadata.
 */
function buildMappings(
  predicates: PredicateRule[],
  filterSubjectTypes?: string[]
): EntityMapping[] {
  const pairMap = new Map<
    string,
    { predicates: PredicateRule[]; bestGroup: PredicateSemanticGroup; bestPriority: number }
  >();

  for (const predicate of predicates) {
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
          const existingGroupIdx = groupOrder.get(existing.bestGroup) ?? 99;
          const newGroupIdx = groupOrder.get(predicate.group) ?? 99;
          if (
            newGroupIdx < existingGroupIdx ||
            (newGroupIdx === existingGroupIdx && predicate.priority < existing.bestPriority)
          ) {
            existing.bestGroup = predicate.group;
            existing.bestPriority = predicate.priority;
          }
        } else {
          pairMap.set(key, {
            predicates: [predicate],
            bestGroup: predicate.group,
            bestPriority: predicate.priority,
          });
        }
      }
    }
  }

  // Convert to EntityMapping[]
  const mappings: EntityMapping[] = [];
  for (const [key, value] of pairMap) {
    const [subjectType, objectType] = key.split(':');
    if (!subjectType || !objectType) continue;
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
    const gA = groupOrder.get(a.group) ?? 99;
    const gB = groupOrder.get(b.group) ?? 99;
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
