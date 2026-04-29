import { env } from '../../config/env';

/**
 * IPFS pinning service for structured atom data.
 *
 * Per the Intuition skill convention: every atom except CAIP-10 blockchain
 * addresses is pinned to IPFS first; the resulting `ipfs://...` URI is
 * what gets encoded as `bytes` and submitted to `createAtoms`. Using plain
 * strings as atom data produces legacy TextObject atoms that should not
 * be reused.
 *
 * The pinning endpoint is configured via `VITE_IPFS_PIN_ENDPOINT`. It is
 * expected to accept a JSON-LD POST and return `{ uri: "ipfs://..." }`.
 * The exact API contract is provider-specific (Pinata, Web3.Storage,
 * a self-hosted Helia node, the Intuition team's service); the wrapper
 * is generic so the deployment platform sets the endpoint without code
 * changes.
 */

/** Schema.org Thing — the default schema for generic concept atoms. */
export interface ThingSchema {
  '@type': 'Thing';
  name: string;
  description?: string;
  url?: string;
}

/** Schema.org Person — for people atoms. */
export interface PersonSchema {
  '@type': 'Person';
  name: string;
  description?: string;
  url?: string;
}

/** Schema.org Organization — for company / DAO / project atoms. */
export interface OrganizationSchema {
  '@type': 'Organization';
  name: string;
  description?: string;
  url?: string;
}

export type AtomSchema = ThingSchema | PersonSchema | OrganizationSchema;

export type IpfsUri = `ipfs://${string}`;

interface PinResponse {
  uri: IpfsUri;
}

/**
 * Pins structured JSON-LD atom data to IPFS via the configured endpoint.
 *
 * Throws on misconfigured endpoint, network failure, non-2xx response, or
 * unexpected response shape. The on-chain write path treats a thrown
 * pinning error as fatal — emit a `pin_failed` status to the user and
 * abort before issuing any contract call.
 */
export async function pinAtomData(schema: AtomSchema): Promise<IpfsUri> {
  if (env.ipfsPinEndpoint === undefined) {
    throw new Error(
      'IPFS pinning endpoint not configured (VITE_IPFS_PIN_ENDPOINT)'
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    ...schema,
  };

  let response: Response;
  try {
    response = await fetch(env.ipfsPinEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonLd),
    });
  } catch (cause) {
    throw new Error('Network error pinning atom data', { cause });
  }

  if (!response.ok) {
    throw new Error(
      `Pinning service responded ${response.status} ${response.statusText}`
    );
  }

  // boundary: response shape is contract-defined; guarded below
  const data = (await response.json()) as PinResponse;
  if (typeof data.uri !== 'string' || !data.uri.startsWith('ipfs://')) {
    throw new Error(
      `Unexpected pinning response shape: ${JSON.stringify(data)}`
    );
  }
  return data.uri;
}

/** Pin a Thing schema (generic concept atom). */
export function pinThing(args: Omit<ThingSchema, '@type'>): Promise<IpfsUri> {
  return pinAtomData({ '@type': 'Thing', ...args });
}

/** Pin a Person schema. */
export function pinPerson(args: Omit<PersonSchema, '@type'>): Promise<IpfsUri> {
  return pinAtomData({ '@type': 'Person', ...args });
}

/** Pin an Organization schema. */
export function pinOrganization(
  args: Omit<OrganizationSchema, '@type'>
): Promise<IpfsUri> {
  return pinAtomData({ '@type': 'Organization', ...args });
}
