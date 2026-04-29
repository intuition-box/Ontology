import { useCallback, useState } from 'react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from 'wagmi';
import type { Hex } from 'viem';

import { env } from '../../config/env';
import { multivaultReadAbi, multivaultWriteAbi } from '../abi/multivault';
import {
  pinOrganization,
  pinPerson,
  pinThing,
} from '../services/ipfs.service';
import { resolveCanonicalPredicateByLabel } from '../services/graphql.service';
import {
  buildAtomPinSpec,
  encodeAtomData,
} from '../services/claim.service';
import {
  asAtomId,
  asTripleId,
  type AtomId,
  type TripleId,
} from '../types';
import { useIntuitionSession } from './use-intuition-session';

/**
 * Discriminated state for the on-chain claim submission flow.
 *
 * Phases follow the protocol order: pin all atoms (or encode CAIP-10),
 * resolve the canonical predicate atom, derive each atom ID, batch-create
 * any missing atoms, then create the triple. Each phase is observable so
 * the UI can surface progress per-button and gate the user gestures.
 */
export type SubmissionState =
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'creating-atoms'; atomCount: number }
  | { status: 'creating-triple' }
  | {
      status: 'confirmed';
      tripleId: TripleId;
      atomTxHash: Hex | undefined;
      tripleTxHash: Hex;
    }
  | { status: 'error'; error: Error };

export interface ClaimDraft {
  subject: string;
  subjectType: string;
  predicateLabel: string;
  object: string;
  objectType: string;
}

export interface UseSubmitClaimReturn {
  submit: (draft: ClaimDraft) => Promise<void>;
  reset: () => void;
  state: SubmissionState;
  isReady: boolean;
}

/**
 * Orchestrates the full on-chain submission of a single claim.
 *
 * Flow:
 *  1. Pin subject + object atoms in parallel (or encode CAIP-10).
 *  2. Resolve the canonical predicate atom by label; pin a Thing if no
 *     non-TextObject canonical exists yet.
 *  3. Compute atom IDs via `calculateAtomId` and check existence with
 *     `isTermCreated`. Skip already-created atoms.
 *  4. Batch-create missing atoms in a single `createAtoms` tx.
 *  5. Create the triple with `createTriples` (single-element arrays).
 *  6. Return `{ tripleId, atomTxHash, tripleTxHash }` on success.
 *
 * Errors are caught and surfaced via the `error` state — the caller
 * decides whether to show a toast, retry, or display inline diagnostics.
 *
 * `isReady` is `true` only when the wallet is connected, the wallet
 * client is available, and the session constants are loaded — consumer
 * UI should disable the submit button until then.
 */
export function useSubmitClaim(): UseSubmitClaimReturn {
  const [state, setState] = useState<SubmissionState>({ status: 'idle' });
  const { address, chain } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const session = useIntuitionSession();

  const isReady =
    address !== undefined &&
    chain !== undefined &&
    publicClient !== undefined &&
    walletClient !== undefined &&
    session.status === 'success';

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  const submit = useCallback(
    async (draft: ClaimDraft) => {
      if (!isReady) {
        setState({
          status: 'error',
          error: new Error(
            'Wallet not connected or Intuition session not loaded'
          ),
        });
        return;
      }
      if (
        address === undefined ||
        chain === undefined ||
        publicClient === undefined ||
        walletClient === undefined ||
        session.status !== 'success'
      ) {
        return;
      }

      setState({ status: 'preparing' });

      try {
        // 1. Pin (or encode) subject and object atoms in parallel.
        const [subjectUri, objectUri] = await Promise.all([
          materializeAtomUri(draft.subject, draft.subjectType, chainId),
          materializeAtomUri(draft.object, draft.objectType, chainId),
        ]);

        // 2. Resolve the canonical predicate atom by label.
        const canonicalPredicate = await resolveCanonicalPredicateByLabel(
          draft.predicateLabel
        );
        const predicateUri =
          canonicalPredicate !== null
            ? null
            : await pinThing({ name: draft.predicateLabel });

        // 3. Encode atom data and compute atom IDs.
        const subjectData = encodeAtomData(subjectUri);
        const objectData = encodeAtomData(objectUri);
        const predicateData =
          predicateUri !== null ? encodeAtomData(predicateUri) : null;

        const [subjectAtomId, objectAtomId, predicateAtomId] = await Promise.all([
          calculateAtomId(publicClient, subjectData),
          calculateAtomId(publicClient, objectData),
          canonicalPredicate !== null
            ? Promise.resolve(asAtomId(canonicalPredicate.term_id))
            : calculateAtomId(publicClient, predicateData!),
        ]);

        // 4. Existence checks for the atoms whose URIs we built locally.
        //    The canonical predicate (if found) is by definition created.
        const [subjectExists, objectExists, predicateLocallyExists] = await Promise.all([
          isTermCreated(publicClient, subjectAtomId),
          isTermCreated(publicClient, objectAtomId),
          predicateData !== null
            ? isTermCreated(publicClient, predicateAtomId)
            : Promise.resolve(true),
        ]);

        const missingAtomDatas: Hex[] = [];
        if (!subjectExists) missingAtomDatas.push(subjectData);
        if (!objectExists) missingAtomDatas.push(objectData);
        if (!predicateLocallyExists && predicateData !== null) {
          missingAtomDatas.push(predicateData);
        }

        // 5. Create missing atoms in a single batch tx.
        let atomTxHash: Hex | undefined;
        if (missingAtomDatas.length > 0) {
          setState({
            status: 'creating-atoms',
            atomCount: missingAtomDatas.length,
          });
          const assets = missingAtomDatas.map(() => session.data.atomCost);
          const value = session.data.atomCost * BigInt(missingAtomDatas.length);

          atomTxHash = await walletClient.writeContract({
            address: env.multivaultAddress,
            abi: multivaultWriteAbi,
            functionName: 'createAtoms',
            args: [missingAtomDatas, assets],
            value,
            account: address,
            chain,
          });
          await publicClient.waitForTransactionReceipt({ hash: atomTxHash });
        }

        // 6. Create the triple.
        setState({ status: 'creating-triple' });
        const tripleTxHash = await walletClient.writeContract({
          address: env.multivaultAddress,
          abi: multivaultWriteAbi,
          functionName: 'createTriples',
          args: [
            [subjectAtomId],
            [predicateAtomId],
            [objectAtomId],
            [session.data.tripleCost],
          ],
          value: session.data.tripleCost,
          account: address,
          chain,
        });
        await publicClient.waitForTransactionReceipt({ hash: tripleTxHash });

        // 7. Compute the triple ID for downstream display / history.
        const tripleIdRaw = await publicClient.readContract({
          address: env.multivaultAddress,
          abi: multivaultReadAbi,
          functionName: 'calculateTripleId',
          args: [subjectAtomId, predicateAtomId, objectAtomId],
        });

        setState({
          status: 'confirmed',
          tripleId: asTripleId(tripleIdRaw),
          atomTxHash,
          tripleTxHash,
        });
      } catch (error) {
        setState({
          status: 'error',
          error:
            error instanceof Error ? error : new Error(String(error)),
        });
      }
    },
    [isReady, address, chain, chainId, publicClient, walletClient, session]
  );

  return { submit, reset, state, isReady };
}

/**
 * Pins the structured atom (or returns the CAIP-10 URI) for a given
 * (value, atomType) pair, using the chain ID for CAIP-10 encoding.
 */
async function materializeAtomUri(
  value: string,
  atomTypeId: string,
  chainId: number
): Promise<string> {
  const spec = buildAtomPinSpec(value, atomTypeId, chainId);
  if (spec.kind === 'caip10') return spec.uri;
  if (spec.kind === 'person') return pinPerson(spec.input);
  if (spec.kind === 'organization') return pinOrganization(spec.input);
  return pinThing(spec.input);
}

async function calculateAtomId(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  data: Hex
): Promise<AtomId> {
  const id = await publicClient.readContract({
    address: env.multivaultAddress,
    abi: multivaultReadAbi,
    functionName: 'calculateAtomId',
    args: [data],
  });
  return asAtomId(id);
}

async function isTermCreated(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  atomId: AtomId
): Promise<boolean> {
  return publicClient.readContract({
    address: env.multivaultAddress,
    abi: multivaultReadAbi,
    functionName: 'isTermCreated',
    args: [atomId],
  });
}
