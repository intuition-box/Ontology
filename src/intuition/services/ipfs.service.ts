import { GraphQLClient, gql } from 'graphql-request';
import { env } from '../../config/env';

/**
 * IPFS pinning service for structured atom data.
 *
 * The Intuition indexer exposes pinning as GraphQL mutations on the same
 * endpoint as the read queries (`env.graphqlUrl`). There is no separate
 * REST/IPFS endpoint to configure: the indexer wraps Pinata/Helia behind
 * `pinThing`, `pinPerson`, and `pinOrganization` mutations that return an
 * `ipfs://...` URI.
 *
 * Per the Intuition skill: every atom except CAIP-10 blockchain addresses
 * is pinned first; the resulting `ipfs://...` URI is what gets encoded as
 * `bytes` and submitted to `createAtoms`. Plain-string fallbacks produce
 * legacy TextObject atoms and are not supported here — a pinning failure
 * is fatal and aborts the on-chain write path.
 */

let cachedClient: GraphQLClient | null = null;

function getClient(): GraphQLClient {
  if (cachedClient === null) {
    cachedClient = new GraphQLClient(env.graphqlUrl);
  }
  return cachedClient;
}

export type IpfsUri = `ipfs://${string}`;

/** Inputs for a generic Thing atom (schema.org Thing). */
export interface ThingInput {
  name: string;
  description?: string;
  image?: string;
  url?: string;
}

/** Inputs for a Person atom (schema.org Person). */
export interface PersonInput extends ThingInput {
  email?: string;
  identifier?: string;
}

/** Inputs for an Organization atom (schema.org Organization). */
export interface OrganizationInput extends ThingInput {
  email?: string;
}

const PIN_THING_MUTATION = gql`
  mutation PinThing(
    $name: String!
    $description: String
    $image: String
    $url: String
  ) {
    pinThing(
      thing: { name: $name, description: $description, image: $image, url: $url }
    ) {
      uri
    }
  }
`;

const PIN_PERSON_MUTATION = gql`
  mutation PinPerson(
    $name: String!
    $description: String
    $image: String
    $url: String
    $email: String
    $identifier: String
  ) {
    pinPerson(
      person: {
        name: $name
        description: $description
        image: $image
        url: $url
        email: $email
        identifier: $identifier
      }
    ) {
      uri
    }
  }
`;

const PIN_ORGANIZATION_MUTATION = gql`
  mutation PinOrganization(
    $name: String!
    $description: String
    $image: String
    $url: String
    $email: String
  ) {
    pinOrganization(
      organization: {
        name: $name
        description: $description
        image: $image
        url: $url
        email: $email
      }
    ) {
      uri
    }
  }
`;

interface PinThingResponse {
  pinThing?: { uri?: string | null } | null;
}

interface PinPersonResponse {
  pinPerson?: { uri?: string | null } | null;
}

interface PinOrganizationResponse {
  pinOrganization?: { uri?: string | null } | null;
}

function assertIpfsUri(uri: string | null | undefined): IpfsUri {
  if (typeof uri !== 'string' || !uri.startsWith('ipfs://')) {
    throw new Error(
      `Pinning service returned an invalid URI: ${String(uri)}`
    );
  }
  // boundary: validated above, narrowing to the branded template type
  return uri as IpfsUri;
}

/** Pin a Thing schema (generic concept atom). */
export async function pinThing(input: ThingInput): Promise<IpfsUri> {
  const data = await getClient().request<PinThingResponse>(
    PIN_THING_MUTATION,
    input
  );
  return assertIpfsUri(data.pinThing?.uri);
}

/** Pin a Person schema. */
export async function pinPerson(input: PersonInput): Promise<IpfsUri> {
  const data = await getClient().request<PinPersonResponse>(
    PIN_PERSON_MUTATION,
    input
  );
  return assertIpfsUri(data.pinPerson?.uri);
}

/** Pin an Organization schema. */
export async function pinOrganization(
  input: OrganizationInput
): Promise<IpfsUri> {
  const data = await getClient().request<PinOrganizationResponse>(
    PIN_ORGANIZATION_MUTATION,
    input
  );
  return assertIpfsUri(data.pinOrganization?.uri);
}
