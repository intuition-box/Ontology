import { useContext } from 'react';

import { ClaimWorkspaceContext, type ClaimWorkspace } from './claim-workspace-context';

/**
 * Access the surrounding ClaimWorkspace. Throws if invoked outside the
 * provider so missing wiring fails loudly instead of silently returning
 * nulls that cascade into harder-to-diagnose UI bugs.
 */
export function useClaimWorkspace(): ClaimWorkspace {
  const ctx = useContext(ClaimWorkspaceContext);
  if (!ctx) {
    throw new Error('useClaimWorkspace must be used within <ClaimWorkspaceProvider>');
  }
  return ctx;
}
