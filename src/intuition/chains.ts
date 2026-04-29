import { defineChain, type Chain } from 'viem';

/**
 * Intuition L3 chain definitions.
 *
 * The Intuition L3 is not indexed by Etherscan and not present in viem's
 * built-in chains list, so each chain is declared explicitly via
 * `defineChain`. Canonical RPC and explorer URLs are baked in as defaults;
 * deployment-specific overrides are applied by the wagmi config using the
 * env-loaded RPC URL.
 */

export const INTUITION_MAINNET_CHAIN_ID = 1155;
export const INTUITION_TESTNET_CHAIN_ID = 13579;

export type IntuitionChainId =
  | typeof INTUITION_MAINNET_CHAIN_ID
  | typeof INTUITION_TESTNET_CHAIN_ID;

export const intuitionMainnet = defineChain({
  id: INTUITION_MAINNET_CHAIN_ID,
  name: 'Intuition',
  nativeCurrency: { decimals: 18, name: 'Trust', symbol: 'TRUST' },
  rpcUrls: {
    default: { http: ['https://rpc.intuition.systems/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Intuition Explorer',
      url: 'https://explorer.intuition.systems',
    },
  },
});

export const intuitionTestnet = defineChain({
  id: INTUITION_TESTNET_CHAIN_ID,
  name: 'Intuition Testnet',
  nativeCurrency: { decimals: 18, name: 'Test Trust', symbol: 'tTRUST' },
  rpcUrls: {
    default: { http: ['https://testnet.rpc.intuition.systems/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Intuition Testnet Explorer',
      url: 'https://testnet.explorer.intuition.systems',
    },
  },
  testnet: true,
});

export const intuitionChains = [intuitionMainnet, intuitionTestnet] as const;

export type IntuitionChain = typeof intuitionMainnet | typeof intuitionTestnet;

/**
 * Returns the Intuition chain matching the given chain ID.
 *
 * Used by the wagmi config and any service that needs the active chain
 * metadata (explorer URL for tx links, native symbol for amounts, etc.).
 */
export function getIntuitionChain(chainId: IntuitionChainId): Chain {
  return chainId === INTUITION_MAINNET_CHAIN_ID ? intuitionMainnet : intuitionTestnet;
}
