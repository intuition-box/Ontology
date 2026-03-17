export interface PredicateRule {
  id: string;
  label: string;
  description: string;
  subjectTypes: string[];
  objectTypes: string[];
}

/** All subject type IDs that represent "software" broadly */
const SOFTWARE_TYPES = ['SoftwareSourceCode', 'SoftwareApplication', 'MobileApplication', 'Agent'];
/** All creative work type IDs */
const CREATIVE_WORK_TYPES = ['Article', 'NewsArticle', 'Book', 'Movie', 'TVSeries', 'MusicRecording', 'MusicAlbum', 'PodcastSeries', 'PodcastEpisode'];
/** All organization-like type IDs */
const ORG_TYPES = ['Organization', 'LocalBusiness', 'Brand'];
/** All skill type IDs */
/** All human skill type IDs */
const HUMAN_SKILL_TYPES = ['HumanSkill', 'SoftSkill', 'HardSkill'];
/** All skill type IDs (human + agent) */
const SKILL_TYPES = [...HUMAN_SKILL_TYPES, 'AgentSkill'];

/**
 * Predicate compatibility matrix.
 * Each predicate defines which subject types can use it and what object types are expected.
 * Types use atom type IDs from atom-types.ts.
 * @see https://github.com/0xIntuition/intuition-data-structures
 */
export const PREDICATES: PredicateRule[] = [
  // ─── Person → Person / Agent ─────────────────────────────
  { id: 'trusts', label: 'trusts', description: 'Subject places trust in object', subjectTypes: ['Person', 'Agent'], objectTypes: ['Person', 'Agent', ...SKILL_TYPES] },
  { id: 'follows', label: 'follows', description: 'Subject follows or subscribes to object', subjectTypes: ['Person'], objectTypes: ['Person', ...ORG_TYPES, 'MusicGroup'] },
  { id: 'knows', label: 'knows', description: 'Subject has a personal connection with object', subjectTypes: ['Person'], objectTypes: ['Person'] },
  { id: 'endorses', label: 'endorses', description: 'Subject endorses or vouches for object', subjectTypes: ['Person'], objectTypes: ['Person', ...ORG_TYPES, ...SOFTWARE_TYPES, 'Product', 'Service'] },
  { id: 'recommends', label: 'recommends', description: 'Subject recommends object to others', subjectTypes: ['Person', 'Agent'], objectTypes: ['Person', ...ORG_TYPES, ...SOFTWARE_TYPES, ...CREATIVE_WORK_TYPES, ...SKILL_TYPES, 'Product', 'Service', 'Event', 'WebSite', 'Thing'] },

  // ─── Person → Organization ────────────────────────────────
  { id: 'memberOf', label: 'memberOf', description: 'Subject is a member of organization', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES, 'MusicGroup'] },
  { id: 'founderOf', label: 'founderOf', description: 'Subject founded the organization', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES] },
  { id: 'worksAt', label: 'worksAt', description: 'Subject is employed by organization', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES] },
  { id: 'contributorTo', label: 'contributorTo', description: 'Subject contributes to project or org', subjectTypes: ['Person'], objectTypes: [...ORG_TYPES, ...SOFTWARE_TYPES, 'Dataset'] },

  // ─── Person → Abstract / Skill ──────────────────────────────
  { id: 'interestedIn', label: 'interestedIn', description: 'Subject has interest in concept', subjectTypes: ['Person'], objectTypes: ['DefinedTerm', 'Thing', ...SKILL_TYPES] },
  { id: 'expertIn', label: 'expertIn', description: 'Subject has deep expertise in area', subjectTypes: ['Person'], objectTypes: ['DefinedTerm', 'Thing', ...SKILL_TYPES] },
  { id: 'hasSkill', label: 'hasSkill', description: 'Person possesses this skill', subjectTypes: ['Person'], objectTypes: [...SKILL_TYPES] },
  { id: 'learningSkill', label: 'learningSkill', description: 'Person is currently learning this skill', subjectTypes: ['Person'], objectTypes: [...SKILL_TYPES] },
  { id: 'advocates', label: 'advocates', description: 'Subject publicly supports concept', subjectTypes: ['Person', ...ORG_TYPES], objectTypes: ['DefinedTerm', 'Thing'] },

  // ─── Person → Skill ─────────────────────────────────────
  { id: 'audited', label: 'audited', description: 'Person has audited or reviewed the skill', subjectTypes: ['Person'], objectTypes: [...SKILL_TYPES] },

  // ─── Person → Software/Thing ──────────────────────────────
  { id: 'uses', label: 'uses', description: 'Subject uses the software, tool, or skill', subjectTypes: ['Person', ...ORG_TYPES, 'Agent'], objectTypes: [...SOFTWARE_TYPES, ...SKILL_TYPES, 'Product', 'Service', 'Thing'] },
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

  // ─── Organization / Person → Abstract ────────────────────
  { id: 'supports', label: 'supports', description: 'Subject supports concept, initiative, or agent', subjectTypes: ['Person', ...ORG_TYPES], objectTypes: ['DefinedTerm', ...ORG_TYPES, 'Person', 'Agent', 'Thing'] },

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
  { id: 'forkOf', label: 'forkOf', description: 'Software or skill is a fork of another', subjectTypes: ['SoftwareSourceCode', ...SKILL_TYPES], objectTypes: ['SoftwareSourceCode', ...SKILL_TYPES] },

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

  // ─── Skill → * ───────────────────────────────────────────
  { id: 'requiresSkill', label: 'requiresSkill', description: 'Skill requires another skill as prerequisite', subjectTypes: [...SKILL_TYPES], objectTypes: [...SKILL_TYPES] },
  { id: 'complementsSkill', label: 'complementsSkill', description: 'Skill complements or pairs well with another', subjectTypes: [...SKILL_TYPES], objectTypes: [...SKILL_TYPES] },
  { id: 'supersedes', label: 'supersedes', description: 'Skill supersedes or replaces another', subjectTypes: [...SKILL_TYPES], objectTypes: [...SKILL_TYPES] },
  { id: 'inspiredBy', label: 'inspiredBy', description: 'Skill is inspired by another skill', subjectTypes: [...SKILL_TYPES], objectTypes: [...SKILL_TYPES] },
  { id: 'leverages', label: 'leverages', description: 'Skill leverages or builds on another skill', subjectTypes: [...SKILL_TYPES], objectTypes: [...SKILL_TYPES] },
  { id: 'enabledBy', label: 'enabledBy', description: 'Skill is enabled by a tool or software', subjectTypes: ['AgentSkill'], objectTypes: [...SOFTWARE_TYPES, 'Thing'] },
  { id: 'performedBy', label: 'performedBy', description: 'Skill is performed by an agent or person', subjectTypes: [...SKILL_TYPES], objectTypes: ['Person', ...ORG_TYPES, 'Agent', 'Thing'] },

  // ─── Agent → Skill ──────────────────────────────────────
  { id: 'hasAgentSkill', label: 'hasSkill', description: 'Agent possesses or provides this skill', subjectTypes: ['Agent'], objectTypes: [...SKILL_TYPES] },
  { id: 'capableOf', label: 'capableOf', description: 'Agent is capable of performing this skill', subjectTypes: ['Agent'], objectTypes: [...SKILL_TYPES] },

  // ─── Generic ──────────────────────────────────────────────
  { id: 'isA', label: 'isA', description: 'Entity is an instance of type/concept', subjectTypes: ['Thing', 'Person', ...ORG_TYPES, ...SOFTWARE_TYPES, 'Product', 'Service'], objectTypes: ['DefinedTerm', 'Thing'] },
  { id: 'partOf', label: 'partOf', description: 'Entity is part of larger entity', subjectTypes: ['Thing', 'Person', 'WebPage', 'MusicRecording', 'PodcastEpisode', 'Article'], objectTypes: ['Thing', ...ORG_TYPES, 'MusicAlbum', 'PodcastSeries', 'Book', 'WebSite'] },
];

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
