import { type RefObject } from 'react';

import { ClaimBuilder, type ClaimBuilderHandle } from '../components/claim-builder';
import { SchemaPanel } from '../components/schema-panel';
import { AtomTree } from '../components/atom-tree';
import { RelationshipGraph } from '../components/relationship-graph';
import { PredicateExplorer } from '../components/predicate-explorer';
import { ClaimHistory } from '../components/claim-history';
import { BatchBuilder } from '../components/batch-builder';
import type { ClaimEntry } from '../types';

interface HomePageProps {
  selectedTypeId: string | null;
  onSelectedTypeIdChange: (typeId: string | null) => void;
  selectedPredicateId: string | null;
  onPredicateChange: (predicateId: string | null) => void;
  claimBuilderRef: RefObject<ClaimBuilderHandle | null>;
  searchQuery: string;
  history: ClaimEntry[];
  onHistoryChange: (history: ClaimEntry[]) => void;
  batch: ClaimEntry[];
  onBatchChange: (batch: ClaimEntry[]) => void;
  onSave: (claim: Omit<ClaimEntry, 'id' | 'timestamp'>) => void;
  onAddToBatch: (claim: Omit<ClaimEntry, 'id' | 'timestamp'>) => void;
  onRestore: (entry: ClaimEntry) => void;
  onMatrixSelect: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
}

export function HomePage({
  selectedTypeId,
  onSelectedTypeIdChange,
  selectedPredicateId,
  onPredicateChange,
  claimBuilderRef,
  searchQuery,
  history,
  onHistoryChange,
  batch,
  onBatchChange,
  onSave,
  onAddToBatch,
  onRestore,
  onMatrixSelect,
}: HomePageProps) {
  return (
    <main className="px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-3" data-tutorial-step="claim-builder">
        <ClaimBuilder
          ref={claimBuilderRef}
          onSubjectTypeChange={onSelectedTypeIdChange}
          onPredicateChange={onPredicateChange}
          onSave={onSave}
          onAddToBatch={onAddToBatch}
        />
        <ClaimHistory
          history={history}
          onHistoryChange={onHistoryChange}
          onRestore={onRestore}
          searchQuery={searchQuery}
        />
        <BatchBuilder
          batch={batch}
          onBatchChange={onBatchChange}
          searchQuery={searchQuery}
        />
      </div>

      <div
        className="grid grid-cols-1 gap-2 lg:grid-cols-3"
        data-tutorial-step="entity-schema"
      >
        <SchemaPanel selectedTypeId={selectedTypeId} searchQuery={searchQuery} />
        <AtomTree
          selectedTypeId={selectedTypeId}
          onSelectType={onSelectedTypeIdChange}
          globalSearchQuery={searchQuery}
        />
        <RelationshipGraph
          highlightTypeId={selectedTypeId}
          onSelectType={onSelectedTypeIdChange}
          searchQuery={searchQuery}
        />
      </div>

      <div data-tutorial-step="predicate-explorer">
        <PredicateExplorer
          selectedPredicateId={selectedPredicateId}
          onSelectClaim={onMatrixSelect}
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}
