/** Persisted claim entry for history and batch features */
export interface ClaimEntry {
  id: string;
  subject: string;
  subjectType: string;
  predicateId: string;
  predicateLabel: string;
  object: string;
  objectType: string;
  timestamp: number;
}

/** Theme preference */
export type Theme = 'dark' | 'light';
