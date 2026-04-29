import type { Account, Address, Chain, Hex } from 'viem';

import { asAtomId, type AtomId, type TripleId } from '../types';
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

  /**
   * Submits a whole batch of claims in just two transactions, regardless
   * of how many claims it contains:
   *
   *  1. ONE `createAtoms` for every previously-uncreated atom across the
   *     batch (subjects + objects + new predicates), deduplicated so the
   *     same `max` referenced by three drafts mints exactly one atom.
   *  2. ONE `createTriples` covering every triple via parallel arrays.
   *
   * This is the design `createAtoms` and `createTriples` were built for —
   * batch-native, single-confirmation gas amortization, one wallet popup
   * per phase even for N claims.
   *
   * Returns the per-draft results (each carrying the same `atomTxHash`
   * and `tripleTxHash`) so consumers can render success in their own
   * order. Throws on any pinning, simulation, or send failure.
   */
  async submitBatch(args: {
    drafts: ClaimSubmissionDraft[];
    context: ClaimSubmissionContext;
    onPhase?: (phase: ClaimSubmissionPhase) => void;
  }): Promise<ClaimSubmissionResult[]> {
    const { drafts, context, onPhase } = args;
    if (drafts.length === 0) return [];
    if (drafts.length === 1) {
      const single = await this.submit({ draft: drafts[0]!, context, onPhase });
      return [single];
    }

    onPhase?.({ status: 'preparing' });

    // 1. Dedupe atom specs across drafts so a label that appears twice
    //    only gets pinned and registered once.
    const atomKey = (value: string, typeId: string): string =>
      `${typeId}::${value}`;
    const uniqueAtoms = new Map<
      string,
      { value: string; typeId: string }
    >();
    for (const d of drafts) {
      uniqueAtoms.set(atomKey(d.subject, d.subjectType), {
        value: d.subject,
        typeId: d.subjectType,
      });
      uniqueAtoms.set(atomKey(d.object, d.objectType), {
        value: d.object,
        typeId: d.objectType,
      });
    }

    // 2. Materialize URIs (pin or CAIP-10) for every unique atom in
    //    parallel.
    const atomUris = new Map<string, string>();
    await Promise.all(
      Array.from(uniqueAtoms.entries()).map(async ([key, { value, typeId }]) => {
        const uri = await this.materializeAtomUri(value, typeId, context.chainId);
        atomUris.set(key, uri);
      })
    );

    // 3. Resolve unique predicates. Canonical predicates from the indexer
    //    are by definition created on-chain; missing predicates get
    //    pinned as a Thing and queued for createAtoms below.
    const uniquePredicateLabels = new Set<string>();
    for (const d of drafts) uniquePredicateLabels.add(d.predicateLabel);

    const predicateAtomIds = new Map<string, AtomId>();
    const newPredicateUris = new Map<string, string>();
    await Promise.all(
      Array.from(uniquePredicateLabels).map(async (label) => {
        const canonical = await this.indexer.resolveCanonicalPredicateByLabel(label);
        if (canonical !== null) {
          predicateAtomIds.set(label, asAtomId(canonical.term_id));
        } else {
          const uri = await this.pinning.pinThing({ name: label });
          newPredicateUris.set(label, uri);
        }
      })
    );

    // 4. Compute atom IDs for every URI we built locally (atoms + new
    //    predicates) — canonical predicates already have their term_id.
    const atomDataAndIds = new Map<string, { data: Hex; atomId: AtomId }>();
    await Promise.all(
      Array.from(atomUris.entries()).map(async ([key, uri]) => {
        const data = encodeAtomData(uri);
        const atomId = await this.multivaultRead.calculateAtomId(data);
        atomDataAndIds.set(key, { data, atomId });
      })
    );
    const newPredicateDataAndIds = new Map<
      string,
      { data: Hex; atomId: AtomId }
    >();
    await Promise.all(
      Array.from(newPredicateUris.entries()).map(async ([label, uri]) => {
        const data = encodeAtomData(uri);
        const atomId = await this.multivaultRead.calculateAtomId(data);
        newPredicateDataAndIds.set(label, { data, atomId });
        predicateAtomIds.set(label, atomId);
      })
    );

    // 5. Existence checks for every locally-built atom + new predicate.
    //    Run in parallel — we need the result before we can decide what
    //    goes into the batched createAtoms call.
    const existsByKey = new Map<string, boolean>();
    const existenceProbes: Array<{ key: string; atomId: AtomId; data: Hex }> = [];
    for (const [key, { data, atomId }] of atomDataAndIds) {
      existenceProbes.push({ key, atomId, data });
    }
    for (const [label, { data, atomId }] of newPredicateDataAndIds) {
      existenceProbes.push({ key: `predicate::${label}`, atomId, data });
    }
    await Promise.all(
      existenceProbes.map(async (probe) => {
        const exists = await this.multivaultRead.isTermCreated(probe.atomId);
        existsByKey.set(probe.key, exists);
      })
    );

    // 6. Collect atoms missing on-chain. Dedupe is implicit because the
    //    keys are unique by construction.
    const missingDatas: Hex[] = [];
    for (const probe of existenceProbes) {
      if (existsByKey.get(probe.key) === false) {
        missingDatas.push(probe.data);
      }
    }

    // 7. ONE createAtoms tx for the whole batch (if anything missing).
    let atomTxHash: Hex | undefined;
    if (missingDatas.length > 0) {
      onPhase?.({ status: 'creating-atoms', atomCount: missingDatas.length });
      const assets = missingDatas.map(() => context.session.atomCost);
      const value = context.session.atomCost * BigInt(missingDatas.length);
      atomTxHash = await this.multivaultWrite.createAtoms({
        datas: missingDatas,
        assets,
        value,
        account: context.account,
        chain: context.chain,
      });
    }

    // 8. Build the parallel arrays for createTriples in draft order.
    const subjectIds: AtomId[] = [];
    const predicateIds: AtomId[] = [];
    const objectIds: AtomId[] = [];
    for (const d of drafts) {
      const subj = atomDataAndIds.get(atomKey(d.subject, d.subjectType));
      const obj = atomDataAndIds.get(atomKey(d.object, d.objectType));
      const pred = predicateAtomIds.get(d.predicateLabel);
      if (subj === undefined || obj === undefined || pred === undefined) {
        throw new Error(
          `Atom resolution failed for draft (subject=${d.subject}, predicate=${d.predicateLabel}, object=${d.object})`
        );
      }
      subjectIds.push(subj.atomId);
      predicateIds.push(pred);
      objectIds.push(obj.atomId);
    }

    // 9. ONE createTriples tx for the whole batch.
    onPhase?.({ status: 'creating-triple' });
    const tripleAssets = drafts.map(() => context.session.tripleCost);
    const tripleValue = context.session.tripleCost * BigInt(drafts.length);
    const tripleTxHash = await this.multivaultWrite.createTriples({
      subjectIds,
      predicateIds,
      objectIds,
      assets: tripleAssets,
      value: tripleValue,
      account: context.account,
      chain: context.chain,
    });

    // 10. Compute triple IDs in parallel for the per-draft result list.
    const tripleIds = await Promise.all(
      drafts.map((_, i) =>
        this.multivaultRead.calculateTripleId(
          subjectIds[i]!,
          predicateIds[i]!,
          objectIds[i]!
        )
      )
    );

    return drafts.map((_, i) => ({
      tripleId: tripleIds[i]!,
      atomTxHash,
      tripleTxHash,
    }));
  }
}
