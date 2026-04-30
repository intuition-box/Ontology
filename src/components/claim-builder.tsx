import { useState, useCallback, useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { useAccount } from 'wagmi';
import { SubjectInput } from './subject-input';
import { PredicateSelect } from './predicate-select';
import { ObjectInput } from './object-input';
import { ClaimPreview } from './claim-preview';
import { PREDICATES } from '../data/predicates';
import type { ExampleClaim } from '../intuition/hooks/use-live-examples';
import type { ClaimEntry } from '../types';
import { useSubmitClaim, type SubmissionState } from '../intuition/hooks/use-submit-claim';

export interface ClaimBuilderHandle {
  fillFromMatrix: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
  restoreClaim: (entry: ClaimEntry) => void;
  getSubjectValue: () => string;
  getSubjectType: () => string | null;
}

interface ClaimBuilderProps {
  onSubjectTypeChange?: (typeId: string | null) => void;
  onSubjectValueChange?: (value: string) => void;
  onPredicateChange?: (predicateId: string | null) => void;
  onSave?: (claim: Omit<ClaimEntry, 'id' | 'timestamp'>) => void;
  onAddToBatch?: (claim: Omit<ClaimEntry, 'id' | 'timestamp'>) => void;
}

export const ClaimBuilder = forwardRef<ClaimBuilderHandle, ClaimBuilderProps>(
  function ClaimBuilder({ onSubjectTypeChange, onSubjectValueChange, onPredicateChange, onSave, onAddToBatch }, ref) {
    const [subject, setSubject] = useState('');
    const [subjectType, setSubjectType] = useState<string | null>(null);
    const [predicateId, setPredicateId] = useState<string | null>(null);
    const [object, setObject] = useState('');
    const [objectType, setObjectType] = useState<string | null>(null);

    // Mirror the latest values behind refs so the imperative handle's getters
    // always read current state without rebuilding the handle object on every
    // keystroke (which would invalidate callers' cached `ref.current`). Mirror
    // inside an effect — the react-hooks lint rule forbids ref writes during
    // render, and post-commit sync is semantically identical here.
    const subjectRef = useRef(subject);
    const subjectTypeRef = useRef(subjectType);
    useEffect(() => {
      subjectRef.current = subject;
      subjectTypeRef.current = subjectType;
    });

    const hasSubject = subject.trim().length > 0 && subjectType !== null;
    const hasPredicate = predicateId !== null;

    const buildClaim = useCallback((): Omit<ClaimEntry, 'id' | 'timestamp'> | null => {
      if (!subject.trim() || !subjectType || !predicateId || !object.trim() || !objectType) return null;
      const pred = PREDICATES.find((p) => p.id === predicateId);
      return {
        subject,
        subjectType,
        predicateId,
        predicateLabel: pred?.label ?? predicateId,
        object,
        objectType,
      };
    }, [subject, subjectType, predicateId, object, objectType]);

    // Stable imperative handle — getters read via refs so `[]` deps are honest
    // and callers' cached ref.current values never go stale between renders.
    useImperativeHandle(
      ref,
      () => ({
        fillFromMatrix(subTypeId: string, predId: string, objTypeId: string) {
          setSubjectType(subTypeId);
          onSubjectTypeChange?.(subTypeId);
          setPredicateId(predId);
          onPredicateChange?.(predId);
          setObjectType(objTypeId);
          setObject('');
        },
        restoreClaim(entry: ClaimEntry) {
          setSubject(entry.subject);
          setSubjectType(entry.subjectType);
          onSubjectTypeChange?.(entry.subjectType);
          setPredicateId(entry.predicateId);
          onPredicateChange?.(entry.predicateId);
          setObject(entry.object);
          setObjectType(entry.objectType);
        },
        getSubjectValue: () => subjectRef.current,
        getSubjectType: () => subjectTypeRef.current,
      }),
      [onSubjectTypeChange, onPredicateChange]
    );

    const handleSubjectChange = useCallback((value: string) => {
      setSubject(value);
      onSubjectValueChange?.(value);
      if (!value.trim()) {
        setPredicateId(null);
        onPredicateChange?.(null);
        setObject('');
        setObjectType(null);
      }
    }, [onSubjectValueChange, onPredicateChange]);

    const handleSubjectTypeChange = useCallback((typeId: string | null) => {
      setSubjectType(typeId);
      setPredicateId(null);
      onPredicateChange?.(null);
      setObject('');
      setObjectType(null);
      onSubjectTypeChange?.(typeId);
    }, [onSubjectTypeChange, onPredicateChange]);

    const handlePredicateChange = useCallback((id: string | null) => {
      setPredicateId(id);
      setObject('');
      setObjectType(null);
      onPredicateChange?.(id);
    }, [onPredicateChange]);

    const handleSave = useCallback(() => {
      const claim = buildClaim();
      if (claim) onSave?.(claim);
    }, [buildClaim, onSave]);

    const handleAddToBatch = useCallback(() => {
      const claim = buildClaim();
      if (claim) onAddToBatch?.(claim);
    }, [buildClaim, onAddToBatch]);

    const { isConnected } = useAccount();
    const onchain = useSubmitClaim();
    const isPublishing =
      onchain.state.status === 'preparing' ||
      onchain.state.status === 'creating-atoms' ||
      onchain.state.status === 'creating-triple';

    const handlePublishOnchain = useCallback(() => {
      const claim = buildClaim();
      if (!claim) return;
      void onchain.submit({
        subject: claim.subject,
        subjectType: claim.subjectType,
        predicateLabel: claim.predicateLabel,
        object: claim.object,
        objectType: claim.objectType,
      });
    }, [buildClaim, onchain]);

    const publishHint = !isConnected
      ? 'Connect your wallet to publish onchain'
      : !onchain.isReady
        ? 'Loading Intuition session…'
        : undefined;

    const handleExampleClick = useCallback((example: ExampleClaim) => {
      setSubject(example.subject);
      setSubjectType(example.subjectType);
      onSubjectTypeChange?.(example.subjectType);
      setPredicateId(example.predicateId);
      onPredicateChange?.(example.predicateId);
      setObject(example.object);
      setObjectType(example.objectType);
    }, [onSubjectTypeChange, onPredicateChange]);

    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6" data-tutorial-step="claim-builder">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Claim Builder</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SubjectInput
            value={subject}
            onChange={handleSubjectChange}
            selectedType={subjectType}
            onTypeChange={handleSubjectTypeChange}
            onExampleClick={handleExampleClick}
          />
          <PredicateSelect
            subjectType={subjectType}
            value={predicateId}
            onChange={handlePredicateChange}
            disabled={!hasSubject}
          />
          <ObjectInput
            predicateId={predicateId}
            value={object}
            onChange={setObject}
            selectedType={objectType}
            onTypeChange={setObjectType}
            disabled={!hasPredicate}
          />
        </div>

        <div className="mt-6">
          <ClaimPreview
            subject={subject}
            subjectType={subjectType}
            predicateId={predicateId}
            object={object}
            objectType={objectType}
            onSave={onSave ? handleSave : undefined}
            onAddToBatch={onAddToBatch ? handleAddToBatch : undefined}
            onPublishOnchain={handlePublishOnchain}
            isPublishing={isPublishing}
            canPublish={onchain.isReady}
            publishHint={publishHint}
          />
          <SubmissionStatusPanel state={onchain.state} onReset={onchain.reset} />
        </div>
      </div>
    );
  }
);

const STATUS_LABELS: Record<SubmissionState['status'], string> = {
  idle: '',
  preparing: 'Pinning atoms and resolving predicate…',
  'creating-atoms': 'Creating atoms onchain…',
  'creating-triple': 'Creating triple onchain…',
  confirmed: 'Claim published onchain',
  error: 'Submission failed',
};

function SubmissionStatusPanel({
  state,
  onReset,
}: {
  state: SubmissionState;
  onReset: () => void;
}) {
  if (state.status === 'idle') return null;

  const explorerBase = explorerForCurrentChain();

  return (
    <div
      role="status"
      className={`mt-3 rounded-lg border p-3 text-sm ${
        state.status === 'error'
          ? 'border-red-400/40 bg-red-400/5 text-red-300'
          : state.status === 'confirmed'
            ? 'border-emerald-400/40 bg-emerald-400/5 text-emerald-300'
            : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">
          {STATUS_LABELS[state.status]}
          {state.status === 'creating-atoms' && state.atomCount > 0 ? (
            <span className="ml-1 text-[var(--color-text-muted)]">
              ({state.atomCount} atom{state.atomCount > 1 ? 's' : ''})
            </span>
          ) : null}
        </span>
        {(state.status === 'confirmed' || state.status === 'error') && (
          <button
            onClick={onReset}
            className="focus-ring text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>

      {state.status === 'confirmed' && (
        <div className="mt-2 space-y-1 font-mono text-xs">
          {state.atomTxHash && explorerBase && (
            <a
              href={`${explorerBase}/tx/${state.atomTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              Atom tx ↗ {truncateHash(state.atomTxHash)}
            </a>
          )}
          {explorerBase && (
            <a
              href={`${explorerBase}/tx/${state.tripleTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              Triple tx ↗ {truncateHash(state.tripleTxHash)}
            </a>
          )}
        </div>
      )}

      {state.status === 'error' && (
        <p className="mt-2 break-words text-xs text-red-300/80">
          {state.error.message}
        </p>
      )}
    </div>
  );
}

const EXPLORER_BY_CHAIN: Record<number, string> = {
  1155: 'https://explorer.intuition.systems',
  13579: 'https://testnet.explorer.intuition.systems',
};

function explorerForCurrentChain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  // Read the chain ID from the URL hash if present, else default to env via
  // import. Intentionally permissive — the SubmissionStatusPanel only needs a
  // best-effort URL and will gracefully degrade when none is known.
  const chainId = Number(import.meta.env.VITE_CHAIN_ID);
  return Number.isFinite(chainId) ? EXPLORER_BY_CHAIN[chainId] : undefined;
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
