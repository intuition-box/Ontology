import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClaimMatrix } from '../components/claim-matrix';
import { EntityTypeTagCloud } from '../components/entity-type-tag-cloud';
import { useClaimWorkspace } from '../lib/use-claim-workspace';

export function EntityMatrixPage() {
  const navigate = useNavigate();
  const { fillFromMatrix } = useClaimWorkspace();
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set());

  const handleSelectClaim = useCallback(
    (subjectTypeId: string, predicateId: string, objectTypeId: string) => {
      fillFromMatrix(subjectTypeId, predicateId, objectTypeId);
      navigate('/');
    },
    [fillFromMatrix, navigate]
  );

  const handleToggleType = useCallback((typeId: string) => {
    setSelectedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(typeId)) {
        next.delete(typeId);
      } else {
        next.add(typeId);
      }
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedTypeIds(new Set());
  }, []);

  return (
    <main className="px-4 sm:px-6 py-8 space-y-6" data-tutorial-step="entity-matrix">
      {/* Tag cloud filter */}
      <EntityTypeTagCloud
        selectedTypeIds={selectedTypeIds}
        onToggleType={handleToggleType}
        onClearAll={handleClearAll}
      />

      {/* Matrix */}
      <ClaimMatrix
        filterTypeIds={selectedTypeIds}
        onSelectClaim={handleSelectClaim}
      />
    </main>
  );
}
