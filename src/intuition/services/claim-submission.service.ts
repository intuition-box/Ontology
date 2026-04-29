import type { Account, Address, Chain, Hex } from 'viem';

import { asAtomId, type TripleId } from '../types';
import { buildAtomPinSpec, encodeAtomData } from './claim.service';
import type { IndexerService } from './graphql.service';
import type {
  MultiVaultReadService,
  MultiVaultWriteService,
} from './multivault.service';
import type { PinningService } from './ipfs.service';

/** Per-session protocol constants required for any write. */
export interface ClaimSubmissionSession {
  atomCost: bigint;
  tripleCost: bigint;
}

export interface ClaimSubmissionDraft {
  subject: string;
  subjectType: string;
  predicateLabel: string;
  object: string;
  objectType: string;
}

export interface ClaimSubmissionContext {
  account: Address | Account;
  chain: Chain;
  chainId: number;
  session: ClaimSubmissionSession;
}

/**
 * Phases reported to the caller while the submission is in flight.
 * The terminal `confirmed` / `error` states are returned (or thrown)
 * from `submit` rather than emitted here, so the consumer can map
 * them to its own state machine.
 */
export type ClaimSubmissionPhase =
  | { status: 'preparing' }
  | { status: 'creating-atoms'; atomCount: number }
  | { status: 'creating-triple' };

export interface ClaimSubmissionResult {
  tripleId: TripleId;
  atomTxHash: Hex | undefined;
  tripleTxHash: Hex;
}

/**
 * Orchestrates the full on-chain submission of a single claim.
 *
 * Responsibilities owned here (and ONLY here):
 *  - Choose pinning strategy per atom (CAIP-10 vs structured pin).
 *  - Resolve the canonical predicate atom; pin a Thing if no
 *    non-TextObject canonical exists yet.
 *  - Compute atom IDs and check existence; skip already-created atoms.
 *  - Batch-create missing atoms in a single tx.
 *  - Create the triple in a follow-up tx.
 *  - Compute the resulting triple ID for downstream display / history.
 *
 * Stateless: all dependencies are injected via the constructor, so the
 * service is trivially mockable in tests and the same instance can
 * service multiple submissions concurrently as long as the underlying
 * clients support it.
 */
export class ClaimSubmissionService {
  private readonly indexer: IndexerService;
  private readonly pinning: PinningService;
  private readonly multivaultRead: MultiVaultReadService;
  private readonly multivaultWrite: MultiVaultWriteService;

  constructor(deps: {
    indexer: IndexerService;
    pinning: PinningService;
    multivaultRead: MultiVaultReadService;
    multivaultWrite: MultiVaultWriteService;
  }) {
    this.indexer = deps.indexer;
    this.pinning = deps.pinning;
    this.multivaultRead = deps.multivaultRead;
    this.multivaultWrite = deps.multivaultWrite;
  }

  async submit(args: {
    draft: ClaimSubmissionDraft;
    context: ClaimSubmissionContext;
    onPhase?: (phase: ClaimSubmissionPhase) => void;
  }): Promise<ClaimSubmissionResult> {
    const { draft, context, onPhase } = args;
    onPhase?.({ status: 'preparing' });

    // 1. Pin (or encode) subject and object atoms in parallel.
    const [subjectUri, objectUri] = await Promise.all([
      this.materializeAtomUri(draft.subject, draft.subjectType, context.chainId),
      this.materializeAtomUri(draft.object, draft.objectType, context.chainId),
    ]);

    // 2. Resolve the canonical predicate atom by label.
    const canonicalPredicate = await this.indexer.resolveCanonicalPredicateByLabel(
      draft.predicateLabel
    );
    const predicateUri =
      canonicalPredicate !== null
        ? null
        : await this.pinning.pinThing({ name: draft.predicateLabel });

    // 3. Encode atom data and compute atom IDs.
    const subjectData = encodeAtomData(subjectUri);
    const objectData = encodeAtomData(objectUri);
    const predicateData = predicateUri !== null ? encodeAtomData(predicateUri) : null;

    const [subjectAtomId, objectAtomId, predicateAtomId] = await Promise.all([
      this.multivaultRead.calculateAtomId(subjectData),
      this.multivaultRead.calculateAtomId(objectData),
      canonicalPredicate !== null
        ? Promise.resolve(asAtomId(canonicalPredicate.term_id))
        : this.multivaultRead.calculateAtomId(predicateData as Hex),
    ]);

    // 4. Existence checks for the atoms we built locally.
    //    A canonical predicate (if found) is by definition created.
    const [subjectExists, objectExists, predicateLocallyExists] = await Promise.all([
      this.multivaultRead.isTermCreated(subjectAtomId),
      this.multivaultRead.isTermCreated(objectAtomId),
      predicateData !== null
        ? this.multivaultRead.isTermCreated(predicateAtomId)
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
      onPhase?.({ status: 'creating-atoms', atomCount: missingAtomDatas.length });
      const assets = missingAtomDatas.map(() => context.session.atomCost);
      const value = context.session.atomCost * BigInt(missingAtomDatas.length);
      atomTxHash = await this.multivaultWrite.createAtoms({
        datas: missingAtomDatas,
        assets,
        value,
        account: context.account,
        chain: context.chain,
      });
    }

    // 6. Create the triple.
    onPhase?.({ status: 'creating-triple' });
    const tripleTxHash = await this.multivaultWrite.createTriples({
      subjectIds: [subjectAtomId],
      predicateIds: [predicateAtomId],
      objectIds: [objectAtomId],
      assets: [context.session.tripleCost],
      value: context.session.tripleCost,
      account: context.account,
      chain: context.chain,
    });

    // 7. Compute the triple ID for downstream display / history.
    const tripleId = await this.multivaultRead.calculateTripleId(
      subjectAtomId,
      predicateAtomId,
      objectAtomId
    );

    return { tripleId, atomTxHash, tripleTxHash };
  }

  private async materializeAtomUri(
    value: string,
    atomTypeId: string,
    chainId: number
  ): Promise<string> {
    const spec = buildAtomPinSpec(value, atomTypeId, chainId);
    if (spec.kind === 'caip10') return spec.uri;
    if (spec.kind === 'person') return this.pinning.pinPerson(spec.input);
    if (spec.kind === 'organization') return this.pinning.pinOrganization(spec.input);
    return this.pinning.pinThing(spec.input);
  }
}
