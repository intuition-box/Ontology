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

  // First-person detection
  if (FIRST_PERSON_PATTERNS.test(trimmed)) {
    return {
      detectedType: 'Person',
      confidence: 'high',
      warning:
        'First-person subjects ("I", "me") create grammatically awkward claims. ' +
        'Use your name or identifier instead. e.g., "alice trusts bob" not "I trusts bob".',
    };
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
