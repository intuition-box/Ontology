export interface ClassificationResult {
  detectedType: string | null;
  confidence: 'high' | 'medium' | 'low';
  warning?: string;
}

const FIRST_PERSON_PATTERNS = /^(i|me|my|myself|we|us|our|ourselves)$/i;
const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const URL_PATTERN = /^https?:\/\//i;
const GITHUB_PATTERN = /github\.com\//i;

/**
 * Classifies a subject string into an atom type.
 * Returns the detected type, confidence level, and any warnings.
 */
export function classifySubject(input: string): ClassificationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { detectedType: null, confidence: 'low' };
  }

  // First-person detection — resolves to the Self atom, a deictic singleton.
  // No warning: `Self` is a first-class protocol feature (shared/aggregatable
  // claims), not a grammatical mistake. The claim-preview layer handles
  // first-person verb conjugation so the displayed text reads naturally.
  if (FIRST_PERSON_PATTERNS.test(trimmed)) {
    return { detectedType: 'Self', confidence: 'high' };
  }

  // Ethereum address
  if (ETH_ADDRESS_PATTERN.test(trimmed)) {
    return { detectedType: 'EthereumAccount', confidence: 'high' };
  }

  // GitHub URL → likely software
  if (GITHUB_PATTERN.test(trimmed)) {
    return { detectedType: 'SoftwareSourceCode', confidence: 'medium' };
  }

  // Generic URL
  if (URL_PATTERN.test(trimmed)) {
    return { detectedType: 'Thing', confidence: 'medium' };
  }

  // ENS name
  if (trimmed.endsWith('.eth')) {
    return { detectedType: 'EthereumAccount', confidence: 'medium' };
  }

  // Default — likely a person or entity name, let user pick
  return { detectedType: null, confidence: 'low' };
}
