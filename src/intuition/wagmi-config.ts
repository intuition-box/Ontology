import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
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
 * Built via RainbowKit's `getDefaultConfig` so the wallet-selection modal
 * comes with a curated list of injected, browser-extension, and mobile
 * wallets out of the box. The Intuition L3 is registered for both mainnet
 * and testnet so the user can switch chains via the wallet UI.
 *
 * The http transport for the active chain (per `env.chainId`) uses the
 * env-configured RPC URL; the inactive chain falls back to its built-in
 * default declared in `chains.ts`.
 *
 * `ssr: false` because Ontology is a Vite/React SPA — there is no server
 * rendering pass to hydrate.
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'Intuition Ontology',
  projectId: env.walletConnectProjectId,
  chains: [intuitionMainnet, intuitionTestnet],
  transports: {
    [INTUITION_MAINNET_CHAIN_ID]:
      env.chainId === INTUITION_MAINNET_CHAIN_ID ? http(env.rpcUrl) : http(),
    [INTUITION_TESTNET_CHAIN_ID]:
      env.chainId === INTUITION_TESTNET_CHAIN_ID ? http(env.rpcUrl) : http(),
  },
  ssr: false,
});
