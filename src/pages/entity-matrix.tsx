import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClaimMatrix } from '../components/claim-matrix';
import { EntityTypeTagCloud } from '../components/entity-type-tag-cloud';

interface EntityMatrixPageProps {
  onSelectClaim: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
}

export function EntityMatrixPage({ onSelectClaim }: EntityMatrixPageProps) {
  const navigate = useNavigate();
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set());

  const handleSelectClaim = useCallback(
    (subjectTypeId: string, predicateId: string, objectTypeId: string) => {
      onSelectClaim(subjectTypeId, predicateId, objectTypeId);
      navigate('/');
    },
    [onSelectClaim, navigate]
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

  // Stable reference for the set passed to ClaimMatrix
  const filterTypeIds = useMemo(() => selectedTypeIds, [selectedTypeIds]);

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
        filterTypeIds={filterTypeIds}
        onSelectClaim={handleSelectClaim}
      />
    </main>
  );
}
