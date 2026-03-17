import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ClaimMatrix } from '../components/claim-matrix';
import { EntityTypeTagCloud } from '../components/entity-type-tag-cloud';
import { ATOM_TYPES } from '../data/atom-types';

interface EntityMatrixPageProps {
  onSelectClaim: (subjectTypeId: string, predicateId: string, objectTypeId: string) => void;
}

/** Valid atom type IDs for URL validation */
const VALID_TYPE_IDS = new Set(ATOM_TYPES.map((t) => t.id));

function parseTypesFromParam(param: string | undefined): Set<string> {
  if (!param) return new Set();
  const ids = param.split(',').filter((id) => VALID_TYPE_IDS.has(id));
  return new Set(ids);
}

function typesToParam(types: Set<string>): string {
  return [...types].sort().join(',');
}

export function EntityMatrixPage({ onSelectClaim }: EntityMatrixPageProps) {
  const navigate = useNavigate();
  const { types: typesParam } = useParams<{ types: string }>();

  const selectedTypeIds = useMemo(() => parseTypesFromParam(typesParam), [typesParam]);

  const updateUrl = useCallback(
    (next: Set<string>) => {
      if (next.size === 0) {
        navigate('/matrix', { replace: true });
      } else {
        navigate(`/matrix/${typesToParam(next)}`, { replace: true });
      }
    },
    [navigate]
  );

  const handleSelectClaim = useCallback(
    (subjectTypeId: string, predicateId: string, objectTypeId: string) => {
      onSelectClaim(subjectTypeId, predicateId, objectTypeId);
      navigate('/');
    },
    [onSelectClaim, navigate]
  );

  const handleToggleType = useCallback(
    (typeId: string) => {
      const next = new Set(selectedTypeIds);
      if (next.has(typeId)) {
        next.delete(typeId);
      } else {
        next.add(typeId);
      }
      updateUrl(next);
    },
    [selectedTypeIds, updateUrl]
  );

  const handleClearAll = useCallback(() => {
    updateUrl(new Set());
  }, [updateUrl]);

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
