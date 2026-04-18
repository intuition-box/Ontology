import { PREDICATES } from '../data/predicates';
import { ATOM_TYPES } from '../data/atom-types';
import type { ClaimEntry } from '../types';
import { CompactClaimListSchema, type CompactClaim } from './schemas';

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
  const compressed: CompactClaim[] = claims.map((c) => ({
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
 *
 * The hash is attacker-controlled (a shared link can be crafted by anyone), so
 * the decoded payload is validated against CompactClaimListSchema before use:
 * unknown predicate/atom IDs, wrong shape, oversize strings, or malformed
 * base64/JSON all produce `null` rather than propagating into app state.
 */
export function parseClaimsFromHash(hash: string): ClaimEntry[] | null {
  if (!hash.includes('claims=')) return null;

  const encoded = hash.split('claims=')[1];
  if (!encoded) return null;

  let decoded: unknown;
  try {
    decoded = JSON.parse(atob(encoded));
  } catch {
    return null;
  }

  const result = CompactClaimListSchema.safeParse(decoded);
  if (!result.success) return null;

  const now = Date.now();
  return result.data.map((c, i) => {
    const predicate = PREDICATES.find((p) => p.id === c.p);
    return {
      id: `imported-${now}-${i}`,
      subject: c.s,
      subjectType: c.st,
      predicateId: c.p,
      predicateLabel: predicate?.label ?? c.p,
      object: c.o,
      objectType: c.ot,
      timestamp: now,
    };
  });
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
