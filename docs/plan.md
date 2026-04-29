# Plan — Intuition Onchain Integration

Branch: `feat/intuition-onchain-integration`
Bounty: `intuition-box/Ontology#8`
Status legend: ✅ done · 🟡 in-progress · ⬜ pending

## Phase 0 — Foundation ⬜

Prepare the project for onchain work. Reorganize `lib/` according to `docs/architecture.md` and add the foundation layers.

| Commit | Description |
|--------|-------------|
| C1 | `chore(deps): add wagmi viem rainbowkit tanstack-query graphql-request zod-validated env` |
| C2 | `feat(config): typed env loader (src/config/env.ts)` |
| C3 | `refactor(layers): create services/, hooks/, lib/abi/, lib/chains.ts, lib/types/; move existing react hooks from lib/ to hooks/` |
| C4 | `feat(chain): defineChain Intuition L3 mainnet + testnet` |
| C5 | `feat(wallet): wagmi + RainbowKit provider, ConnectButton in header` |

**Gate**: build green · lint clean · `architecture-reviewer` PASS · `typing-reviewer` PASS · `intuition-reviewer` PASS · ConnectButton works in browser

## Phase 1 — On-chain primitives ⬜

| Commit | Description |
|--------|-------------|
| C6 | `feat(lib/abi): MultiVault read+write ABI fragments via parseAbi` |
| C7 | `feat(lib/types): branded AtomId/TripleId/CurveId + assertNever` |
| C8 | `feat(services/intuition): GraphQL client + atom/triple/predicate queries` |
| C9 | `feat(hooks): useIntuitionSession (atomCost, tripleCost, defaultCurveId cached)` |
| C10 | `feat(services/ipfs): structured atom pinning (Thing/Person/Org schemas)` |

**Gate**: build · lint · `architecture-reviewer` · `typing-reviewer` · `intuition-reviewer` · session hook returns real testnet values

## Phase 2 — Write flow (bounty core) ⬜

| Commit | Description |
|--------|-------------|
| C11 | `feat(services/claim): claim → triple translation, predicate resolution` |
| C12 | `feat(hooks): useSubmitClaim orchestrating pin → createAtoms → createTriples` |
| C13 | `feat(components/claim-builder): wire onchain submission with state feedback` |

**Gate**: all reviewers PASS · **real testnet tx** documented in PR description (chain 13579)

## Phase 3 — Read migration ⬜

| Commit | Description |
|--------|-------------|
| C14 | `feat(hooks): useLiveTriples / useLiveAtoms with static fallback` |
| C15 | `feat(components/relationship-graph): consume live triples` |
| C16 | `feat(components/atom-tree): consume live atoms` |
| C17 | `feat(components/claim-matrix): consume live triples` |

**Gate**: 3 views render testnet data · fallback verified offline · all reviewers PASS

## Phase 4 — UX polish ⬜

| Commit | Description |
|--------|-------------|
| C18 | `feat(hooks): useUserPositions (wallet's onchain positions via GraphQL)` |
| C19 | `feat(components/claim-history): show onchain positions` |
| C20 | `feat(components/claim-preview): agree/disagree deposit buttons` |

**Gate**: real testnet deposits on triple + counter-triple, 2 tx hashes documented

## Phase 5 — Ship ⬜

| Commit | Description |
|--------|-------------|
| C21 | `docs: complete README mission section, .env.example, deploy notes` |

**Gate**: production build · zero lint warnings · PR description complete with tx hashes, screenshots, criteria mapping

## Testnet tx log

| Phase | Description | Tx hash | Block explorer |
|-------|-------------|---------|----------------|
| _to be filled at each gate_ | | | |
