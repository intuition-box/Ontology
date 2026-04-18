/**
 * Semantic groups for predicate clustering, in display order. Single source
 * of truth — UI layers sort against this tuple's index.
 */
export const PREDICATE_GROUPS = [
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

export type PredicateSemanticGroup = (typeof PREDICATE_GROUPS)[number];

/**
 * Grammatical form of the predicate label. Documentary for now — lets the
 * glossary surface form variants and leaves the door open for form-aware
 * ranking in the predicate picker once multiple forms per concept exist in
 * the main PREDICATES list.
 *
 * - `bare`: imperative / bare infinitive — "trust", "follow", "like"
 * - `third-person-singular`: "trusts", "follows", "likes"
 * - `past`: "created", "authored", "attended"
 * - `phrase`: multi-word or be-verb forms — "is part of", "member of"
 * - `passive`: "backed by", "authored by", "acquired by"
 */
export type PredicateForm =
  | 'bare'
  | 'third-person-singular'
  | 'past'
  | 'phrase'
  | 'passive';

export interface PredicateRule {
  id: string;
  label: string;
  description: string;
  subjectTypes: string[];
  objectTypes: string[];
  /** Semantic group this predicate belongs to. */
  group: PredicateSemanticGroup;
  /** Sort priority within the group (lower = first). */
  priority: number;
  /** Grammatical form of the label. */
  form: PredicateForm;
}

/** Raw predicate definition minus the group/priority/form metadata. */
type PredicateDefinition = Omit<PredicateRule, 'group' | 'priority' | 'form'>;

/**
 * Per-predicate grammatical form. Keyed by predicate ID; defaults to
 * `third-person-singular` for predicates without an explicit entry (the most
 * common form in the current list).
 */
const PREDICATE_FORMS: Record<string, PredicateForm> = {
  // past tense
  created: 'past',
  reviewed: 'past',
  attendedEvent: 'past',
  organizedEvent: 'past',
  authoredBy: 'passive',
  publishedBy: 'passive',
  createdBy: 'passive',
  developedBy: 'passive',
  maintainedBy: 'passive',
  acquiredBy: 'passive',
  advisedBy: 'passive',
  forkOf: 'phrase',

  // phrase / multi-word
  memberOf: 'phrase',
  founderOf: 'phrase',
  worksAt: 'phrase',
  contributorTo: 'phrase',
  interestedIn: 'phrase',
  expertIn: 'phrase',
  locatedIn: 'phrase',
  headquarteredIn: 'phrase',
  partOf: 'phrase',
  isA: 'phrase',
  taggedWith: 'phrase',
  alternativeTo: 'phrase',
  reviewOf: 'phrase',
  replyTo: 'phrase',
  brandOf: 'phrase',
  soldBy: 'passive',
  hostedBy: 'passive',
  tokenOf: 'phrase',
  ownedBy: 'passive',
  controlledBy: 'passive',
  deployedOn: 'phrase',
  subConceptOf: 'phrase',
  oppositeOf: 'phrase',
  about: 'phrase',
  // Everything else defaults to 'third-person-singular'.
};

/** All subject type IDs that represent "software" broadly */
const SOFTWARE_TYPES = ['SoftwareSourceCode', 'SoftwareApplication', 'MobileApplication'];
/** All creative work type IDs */
const CREATIVE_WORK_TYPES = ['Article', 'NewsArticle', 'Book', 'Movie', 'TVSeries', 'MusicRecording', 'MusicAlbum', 'PodcastSeries', 'PodcastEpisode'];
/** All organization-like type IDs */
const ORG_TYPES = ['Organization', 'LocalBusiness', 'Brand'];

/**
 * Per-predicate semantic group and within-group priority.
 * Keyed by predicate ID; consumed once at module init to build PREDICATES.
 */
const PREDICATE_SEMANTICS: Record<string, { group: PredicateSemanticGroup; priority: number }> = {
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

/**
 * Predicate compatibility matrix — raw definitions.
 * Each predicate defines which subject types can use it and what object types are expected.
 * Types use atom type IDs from atom-types.ts.
 * @see https://github.com/0xIntuition/intuition-data-structures
 */
const PREDICATE_DEFINITIONS: PredicateDefinition[] = [
  // ─── Person → Person ──────────────────────────────────────
  { id: 'trusts', label: 'trusts', description: 'Subject places trust in object', subjectTypes: ['Person'], objectTypes: ['Person'] },
  { id: 'follows', label: 'follows', description: 'Subject follows or subscribes to object', subjectTypes: ['Person'], objectTypes: ['Person', ...ORG_TYPES, 'MusicGroup'] },
  { id: 'knows', label: 'knows', description: 'Subject has a personal connection with object', subjectTypes: ['Person'], objectTypes: ['Person'] },
  { id: 'endorses', label: 'endorses', description: 'Subject endorses or vouches for object', subjectTypes: ['Person'], objectTypes: ['Person', ...ORG_TYPES, ...SOFTWARE_TYPES, 'Product', 'Service'] },
  { id: 'recommends', label: 'recommends', description: 'Subject recommends object to others', subjectTypes: ['Person'], objectTypes: ['Person', ...ORG_TYPES, ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'Product', 'Service', 'Event', 'WebSite', 'Thing'] },

  // ─── Person → Organization ────────────────────────────────
  { id: 'memberOf', label: 'memberOf', description: 'Subject is a member of organization', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES, 'MusicGroup'] },
  { id: 'founderOf', label: 'founderOf', description: 'Subject founded the organization', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES] },
  { id: 'worksAt', label: 'worksAt', description: 'Subject is employed by organization', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES] },
  { id: 'contributorTo', label: 'contributorTo', description: 'Subject contributes to project or org', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES, ...SOFTWARE_TYPES, 'Dataset'] },

  // ─── Person → Abstract ────────────────────────────────────
  { id: 'interestedIn', label: 'interestedIn', description: 'Subject has interest in concept', subjectTypes: ['Person'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'expertIn', label: 'expertIn', description: 'Subject has deep expertise in area', subjectTypes: ['Person'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'advocates', label: 'advocates', description: 'Subject publicly supports concept', subjectTypes: ['Person', ...ORG_TYPES], objectTypes: ['DefinedTerm', 'Thing'] },

  // ─── Person → Software/Thing ──────────────────────────────
  { id: 'uses', label: 'uses', description: 'Subject uses the software or tool', subjectTypes: ['Person', ...ORG_TYPES], objectTypes: [...SOFTWARE_TYPES, 'Product', 'Service', 'Thing'] },
  { id: 'created', label: 'created', description: 'Subject created the object', subjectTypes: ['Person'], objectTypes: [...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'ImageObject', 'VideoObject', 'Dataset', 'WebSite', 'Product', 'Thing'] },
  { id: 'likes', label: 'likes', description: 'Subject likes or favors object', subjectTypes: ['Person'], objectTypes: ['Thing', ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'MusicGroup', 'ImageObject', 'VideoObject', 'Product', 'Place', 'Event', 'WebSite', 'DefinedTerm'] },
  { id: 'reviewed', label: 'reviewed', description: 'Subject has reviewed object', subjectTypes: ['Person'], objectTypes: ['Thing', ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'Product', 'Service', 'Event'] },

  // ─── Person → Location ────────────────────────────────────
  { id: 'locatedIn', label: 'locatedIn', description: 'Entity is located in place', subjectTypes: ['Person', ...ORG_TYPES, 'Event'], objectTypes: ['Place'] },

  // ─── Person → Event ───────────────────────────────────────
  { id: 'attendedEvent', label: 'attendedEvent', description: 'Subject attended an event', subjectTypes: ['Person'], objectTypes: ['Event'] },
  { id: 'organizedEvent', label: 'organizedEvent', description: 'Subject organized an event', subjectTypes: ['Person', ...ORG_TYPES], objectTypes: ['Event'] },

  // ─── Organization → Person ────────────────────────────────
  { id: 'employs', label: 'employs', description: 'Organization employs person', subjectTypes: [...ORG_TYPES], objectTypes: ['Person'] },
  { id: 'advisedBy', label: 'advisedBy', description: 'Organization is advised by person', subjectTypes: [...ORG_TYPES], objectTypes: ['Person'] },

  // ─── Organization → Organization ──────────────────────────
  { id: 'partnersWith', label: 'partnersWith', description: 'Organization partners with another', subjectTypes: [...ORG_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'acquiredBy', label: 'acquiredBy', description: 'Organization was acquired by another', subjectTypes: [...ORG_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'sponsors', label: 'sponsors', description: 'Organization sponsors the object', subjectTypes: [...ORG_TYPES, 'Person'], objectTypes: [...ORG_TYPES, ...SOFTWARE_TYPES, 'Person', 'Event'] },
  { id: 'competitorOf', label: 'competitorOf', description: 'Organization competes with another', subjectTypes: [...ORG_TYPES], objectTypes: [...ORG_TYPES] },

  // ─── Organization → Software/Place ────────────────────────
  { id: 'develops', label: 'develops', description: 'Organization develops software', subjectTypes: [...ORG_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'maintains', label: 'maintains', description: 'Organization maintains software', subjectTypes: [...ORG_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'headquarteredIn', label: 'headquarteredIn', description: 'Organization HQ is in place', subjectTypes: [...ORG_TYPES], objectTypes: ['Place'] },

  // ─── Organization → Abstract ──────────────────────────────
  { id: 'supports', label: 'supports', description: 'Organization supports concept or initiative', subjectTypes: [...ORG_TYPES], objectTypes: ['DefinedTerm', ...ORG_TYPES, 'Person', 'Thing'] },

  // ─── Organization → Commerce ──────────────────────────────
  { id: 'offers', label: 'offers', description: 'Organization offers product or service', subjectTypes: [...ORG_TYPES], objectTypes: ['Product', 'Service'] },
  { id: 'manufactures', label: 'manufactures', description: 'Organization manufactures product', subjectTypes: [...ORG_TYPES], objectTypes: ['Product'] },

  // ─── Software → * ─────────────────────────────────────────
  { id: 'createdBy', label: 'createdBy', description: 'Software was created by person or org', subjectTypes: [...SOFTWARE_TYPES], objectTypes: ['Person', ...ORG_TYPES] },
  { id: 'developedBy', label: 'developedBy', description: 'Software is developed by org', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...ORG_TYPES] },
  { id: 'maintainedBy', label: 'maintainedBy', description: 'Software is maintained by org or person', subjectTypes: [...SOFTWARE_TYPES], objectTypes: ['Person', ...ORG_TYPES] },
  { id: 'taggedWith', label: 'taggedWith', description: 'Entity is tagged with concept or label', subjectTypes: [...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'ImageObject', 'VideoObject', 'Dataset', 'Product', 'Event', 'Thing'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'implements', label: 'implements', description: 'Software implements concept or standard', subjectTypes: [...SOFTWARE_TYPES], objectTypes: ['DefinedTerm'] },
  { id: 'dependsOn', label: 'dependsOn', description: 'Software depends on another', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'alternativeTo', label: 'alternativeTo', description: 'Software is alternative to another', subjectTypes: [...SOFTWARE_TYPES], objectTypes: [...SOFTWARE_TYPES] },
  { id: 'forkOf', label: 'forkOf', description: 'Software is a fork of another', subjectTypes: ['SoftwareSourceCode'], objectTypes: ['SoftwareSourceCode'] },

  // ─── Blockchain → * ───────────────────────────────────────
  { id: 'ownedBy', label: 'ownedBy', description: 'Account or contract is owned by entity', subjectTypes: ['EthereumAccount', 'EthereumSmartContract', 'EthereumERC20'], objectTypes: ['Person', ...ORG_TYPES] },
  { id: 'controlledBy', label: 'controlledBy', description: 'Account is controlled by person', subjectTypes: ['EthereumAccount'], objectTypes: ['Person'] },
  { id: 'deployedOn', label: 'deployedOn', description: 'Contract deployed on chain', subjectTypes: ['EthereumSmartContract', 'EthereumERC20'], objectTypes: ['Thing'] },
  { id: 'tokenOf', label: 'tokenOf', description: 'Token belongs to a project or protocol', subjectTypes: ['EthereumERC20'], objectTypes: [...ORG_TYPES, ...SOFTWARE_TYPES, 'Thing'] },

  // ─── Creative Work → * ────────────────────────────────────
  { id: 'authoredBy', label: 'authoredBy', description: 'Work was authored/created by', subjectTypes: [...CREATIVE_WORK_TYPES], objectTypes: ['Person'] },
  { id: 'publishedBy', label: 'publishedBy', description: 'Work was published by', subjectTypes: [...CREATIVE_WORK_TYPES, 'WebSite'], objectTypes: [...ORG_TYPES, 'Person'] },
  { id: 'about', label: 'about', description: 'Work is about this topic', subjectTypes: [...CREATIVE_WORK_TYPES, 'SocialMediaPosting', 'Comment', 'Review', 'PodcastEpisode'], objectTypes: ['Person', ...ORG_TYPES, ...SOFTWARE_TYPES, 'DefinedTerm', 'Event', 'Product', 'Thing'] },

  // ─── Social → * ───────────────────────────────────────────
  { id: 'replyTo', label: 'replyTo', description: 'Post or comment is a reply to another', subjectTypes: ['Comment', 'SocialMediaPosting'], objectTypes: ['SocialMediaPosting', 'Comment', 'Article', 'Thing'] },
  { id: 'reviewOf', label: 'reviewOf', description: 'Review targets this entity', subjectTypes: ['Review'], objectTypes: ['Product', 'Service', ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, 'Event', ...ORG_TYPES, 'Thing'] },

  // ─── Commerce → * ─────────────────────────────────────────
  { id: 'brandOf', label: 'brandOf', description: 'Brand belongs to product or org', subjectTypes: ['Brand'], objectTypes: ['Product', ...ORG_TYPES] },
  { id: 'soldBy', label: 'soldBy', description: 'Product or service is sold by', subjectTypes: ['Product', 'Service'], objectTypes: [...ORG_TYPES] },

  // ─── Web → * ──────────────────────────────────────────────
  { id: 'hostedBy', label: 'hostedBy', description: 'Website or page hosted by org', subjectTypes: ['WebSite', 'WebPage'], objectTypes: [...ORG_TYPES, 'Person'] },

  // ─── DefinedTerm → * ──────────────────────────────────────
  { id: 'relatedTo', label: 'relatedTo', description: 'Entity is related to another', subjectTypes: ['DefinedTerm', 'Thing'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'subConceptOf', label: 'subConceptOf', description: 'Term is a sub-concept of another', subjectTypes: ['DefinedTerm'], objectTypes: ['DefinedTerm'] },
  { id: 'oppositeOf', label: 'oppositeOf', description: 'Term is opposite to another', subjectTypes: ['DefinedTerm'], objectTypes: ['DefinedTerm'] },

  // ─── Generic ──────────────────────────────────────────────
  { id: 'isA', label: 'isA', description: 'Entity is an instance of type/concept', subjectTypes: ['Thing', 'Person', ...ORG_TYPES, ...SOFTWARE_TYPES, 'Product', 'Service'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'partOf', label: 'partOf', description: 'Entity is part of larger entity', subjectTypes: ['Thing', 'Person', 'WebPage', 'MusicRecording', 'PodcastEpisode', 'Article'], objectTypes: ['Thing', ...ORG_TYPES, 'MusicAlbum', 'PodcastSeries', 'Book', 'WebSite'] },
];

/** Fallback for any future definitions missing from PREDICATE_SEMANTICS. */
const DEFAULT_SEMANTICS = { group: PREDICATE_GROUPS[0], priority: 999 } as const;

/**
 * Final predicate list consumed by the app.
 *
 * Built in two passes:
 *   1. Attach semantic group + priority from PREDICATE_SEMANTICS (or fallback).
 *   2. Anywhere a predicate accepts `Person` as a subject, also accept `Self`
 *      — the first-person deictic atom. Derived rather than hand-maintained
 *      so any new Person-compatible predicate added later automatically
 *      works with `I`.
 */
export const PREDICATES: PredicateRule[] = PREDICATE_DEFINITIONS.map((def) => {
  const semantics = PREDICATE_SEMANTICS[def.id] ?? DEFAULT_SEMANTICS;
  const form = PREDICATE_FORMS[def.id] ?? 'third-person-singular';
  const subjectTypes =
    def.subjectTypes.includes('Person') && !def.subjectTypes.includes('Self')
      ? [...def.subjectTypes, 'Self']
      : def.subjectTypes;
  return {
    ...def,
    subjectTypes,
    group: semantics.group,
    priority: semantics.priority,
    form,
  };
});

/**
 * Returns predicates compatible with the given subject type.
 */
export function getPredicatesForSubject(subjectTypeId: string): PredicateRule[] {
  return PREDICATES.filter((p) => p.subjectTypes.includes(subjectTypeId));
}

/**
 * Returns expected object types for a given predicate.
 */
export function getObjectTypesForPredicate(predicateId: string): string[] {
  const predicate = PREDICATES.find((p) => p.id === predicateId);
  return predicate?.objectTypes ?? [];
}

/**
 * Validates a claim's type compatibility.
 */
export function validateClaim(
  subjectTypeId: string,
  predicateId: string,
  objectTypeId: string
): { valid: boolean; reason?: string } {
  const predicate = PREDICATES.find((p) => p.id === predicateId);
  if (!predicate) return { valid: false, reason: `Unknown predicate: ${predicateId}` };
  if (!predicate.subjectTypes.includes(subjectTypeId)) {
    return { valid: false, reason: `"${predicate.label}" cannot be used with ${subjectTypeId} subjects` };
  }
  if (!predicate.objectTypes.includes(objectTypeId)) {
    return { valid: false, reason: `"${predicate.label}" expects object of type: ${predicate.objectTypes.join(', ')}` };
  }
  return { valid: true };
}
