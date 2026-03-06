import { PREDICATES } from '../data/predicates';
import { ATOM_TYPES } from '../data/atom-types';
import type { ClaimEntry } from '../types';

/**
 * Converts a list of claim entries to a JSON-LD representation.
 */
export function claimsToJsonLd(claims: ClaimEntry[]): Record<string, unknown> {
  return {
    '@context': {
      '@vocab': 'https://schema.org/',
      intuition: 'https://docs.intuition.systems/vocab/',
    },
    '@graph': claims.map((claim) => {
      const predicate = PREDICATES.find((p) => p.id === claim.predicateId);
      const subjectAtom = ATOM_TYPES.find((t) => t.id === claim.subjectType);
      const objectAtom = ATOM_TYPES.find((t) => t.id === claim.objectType);

      return {
        '@type': 'intuition:Claim',
        'intuition:subject': {
          '@type': subjectAtom?.schemaOrgType ?? claim.subjectType,
          name: claim.subject,
        },
        'intuition:predicate': {
          '@type': 'DefinedTerm',
          name: predicate?.label ?? claim.predicateId,
          description: predicate?.description ?? '',
        },
        'intuition:object': {
          '@type': objectAtom?.schemaOrgType ?? claim.objectType,
          name: claim.object,
        },
        'intuition:timestamp': new Date(claim.timestamp).toISOString(),
      };
    }),
  };
}

/**
 * Triggers a browser download of claims as a JSON file.
 */
export function downloadClaimsAsJson(
  claims: ClaimEntry[],
  filename = 'intuition-claims.json'
): void {
  const jsonLd = claimsToJsonLd(claims);
  const blob = new Blob([JSON.stringify(jsonLd, null, 2)], {
    type: 'application/ld+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Encodes claims into a shareable URL hash fragment.
 */
export function generateShareableUrl(claims: ClaimEntry[]): string {
  const compressed = claims.map((c) => ({
    s: c.subject,
    st: c.subjectType,
    p: c.predicateId,
    o: c.object,
    ot: c.objectType,
  }));
  const encoded = btoa(JSON.stringify(compressed));
  return `${window.location.origin}${window.location.pathname}#claims=${encoded}`;
}

/**
 * Parses claims from a URL hash fragment.
 * Returns null if no claims are found in the hash.
 */
export function parseClaimsFromHash(hash: string): ClaimEntry[] | null {
  if (!hash.includes('claims=')) return null;

  try {
    const encoded = hash.split('claims=')[1];
    if (!encoded) return null;

    const decoded = JSON.parse(atob(encoded)) as {
      s: string;
      st: string;
      p: string;
      o: string;
      ot: string;
    }[];

    return decoded.map((c, i) => {
      const predicate = PREDICATES.find((p) => p.id === c.p);
      return {
        id: `imported-${Date.now()}-${i}`,
        subject: c.s,
        subjectType: c.st,
        predicateId: c.p,
        predicateLabel: predicate?.label ?? c.p,
        object: c.o,
        objectType: c.ot,
        timestamp: Date.now(),
      };
    });
  } catch {
    return null;
  }
}

/**
 * Copies text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
