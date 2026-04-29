import { createConfig, http } from 'wagmi';
import { env } from '../config/env';
import {
  INTUITION_MAINNET_CHAIN_ID,
  INTUITION_TESTNET_CHAIN_ID,
  intuitionMainnet,
  intuitionTestnet,
} from './chains';

/**
 * Wagmi configuration for the Intuition L3.
 *
 * Both mainnet and testnet are registered so the user can switch chains
 * via the wallet UI. The http transport for the active chain (per env)
 * uses the env-configured RPC URL; the inactive chain falls back to its
 * built-in default RPC.
 *
 * No connectors are declared here. The RainbowKit provider added by the
 * bounty PR wraps this config and supplies its own connector list — keeping
 * the foundation module agnostic to wallet-UI choices.
 */
export const wagmiConfig = createConfig({
  chains: [intuitionMainnet, intuitionTestnet],
  transports: {
    [INTUITION_MAINNET_CHAIN_ID]:
      env.chainId === INTUITION_MAINNET_CHAIN_ID ? http(env.rpcUrl) : http(),
    [INTUITION_TESTNET_CHAIN_ID]:
      env.chainId === INTUITION_TESTNET_CHAIN_ID ? http(env.rpcUrl) : http(),
  },
});
