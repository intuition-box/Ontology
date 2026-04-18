/**
 * First-person conjugations for predicates whose `label` reads awkwardly
 * next to `I` (e.g. "I follows" → "I follow"). Purely a display concern —
 * the stored claim still uses the canonical predicate ID.
 *
 * Only predicates that accept `Person` as a subject need entries here;
 * anything else will never be rendered with `I` and can fall back to the
 * raw label safely. Missing entries also fall back, so the preview never
 * crashes on a newly-added predicate — it just reads less fluently until
 * an entry is added.
 */
const FIRST_PERSON_LABELS: Record<string, string> = {
  // Simple 3rd-person-singular "s" drop
  trusts: 'trust',
  follows: 'follow',
  knows: 'know',
  endorses: 'endorse',
  recommends: 'recommend',
  likes: 'like',
  advocates: 'advocate',
  uses: 'use',
  sponsors: 'sponsor',

  // "am/are" auxiliaries for -Of / adjectival predicates
  memberOf: 'am member of',
  founderOf: 'am founder of',
  interestedIn: 'am interested in',
  expertIn: 'am expert in',
  locatedIn: 'am located in',
  partOf: 'am part of',
  isA: 'am a',

  // -s present-tense verbs
  worksAt: 'work at',
  contributorTo: 'contribute to',
  created: 'created',
  reviewed: 'reviewed',
  attendedEvent: 'attended',
  organizedEvent: 'organized',
  about: 'am about',
};

/**
 * Render a predicate label from the first-person point of view. Falls back
 * to the raw label when no override is defined.
 */
export function conjugateForSelf(predicateId: string, fallbackLabel: string): string {
  return FIRST_PERSON_LABELS[predicateId] ?? fallbackLabel;
}

/**
 * Returns true if the claim should render with first-person grammar —
 * i.e. the subject is the `Self` atom.
 */
export function isSelfSubject(subjectTypeId: string | null | undefined): boolean {
  return subjectTypeId === 'Self';
}
