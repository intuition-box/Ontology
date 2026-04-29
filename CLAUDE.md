# Ontology — Intuition Onchain Integration

This file is loaded into context at every session. Read it first before any coding work.

## Mission

Bounty: integrate Intuition Protocol into the Ontology app (live, permissionless, onchain claims). Bounty issue: `intuition-box/Ontology#8`. Network: Intuition L3 mainnet (chain 1155, MultiVault `0x6E35cF57A41fA15eA0EaE9C33e751b01A784Fe7e`). Native token: $TRUST. Test network: chain 13579.

When working on Intuition transactions, the `intuition` skill is authoritative. Read its files (`reference/`, `operations/`) before writing any contract interaction code. Do not write ABIs, addresses, or flow patterns from memory.

## Language

**All code, comments, identifiers, commit messages, file names, log strings, and project documentation are written in English.** No exceptions, including in-line `// ...` comments and JSDoc.

User-facing UI strings displayed in the running app may be localized later if a translation layer is introduced — but at the source-code level, English is the canonical and only language.

## Package manager

**Bun only.** Never run `npm install` / `npx`. Use `bun install`, `bun add`, `bun run <script>`, `bunx`. Node 20.19+ or 22.12+ required for Vite 7.

## Architecture (strict layering)

Imports flow in **one direction only**:

```
pages → components → hooks → services → lib
                              ↘ config ↙
```

| Layer | Path | Responsibility | Forbidden |
|-------|------|----------------|-----------|
| `pages/` | `src/pages/` | Route assembly, composition of components | Business logic, direct service calls |
| `components/` | `src/components/` | Pure presentation. Props in, callbacks out. | Service imports, env access, fetch, contract calls |
| `hooks/` | `src/hooks/` | **Orchestrators**. Compose services into React state. | Business rules (delegate to services), inline contract ABIs |
| `services/` | `src/services/` | **Business logic**. Pure TS classes/modules, no React. | `react`, `react-dom`, JSX, `useXxx`, DOM access |
| `lib/` | `src/lib/` | Pure utilities, helpers, ABIs, chain definitions, schemas | React, services, business rules, env access (use config/) |
| `config/` | `src/config/` | Typed env-var loader, constants | Side effects, network calls |
| `types/` | `src/types/` | Cross-cutting types | Implementations |
| `data/` | `src/data/` | Static seeds (atom-types, predicates) — fallback only | Mutations |

**Hard rules** (CI / reviewer-enforced):

1. `services/**` MUST NOT import from `react`, `components/`, `hooks/`, `pages/`.
2. `components/**` MUST NOT import from `services/` directly — go through a hook.
3. `lib/**` MUST NOT import from `services/`, `hooks/`, `components/`, `pages/`.
4. No `import.meta.env.XXX` outside `src/config/env.ts`. All env access goes through the typed loader.
5. No magic strings for env vars, contract addresses, chain IDs, predicates IDs — all centralized in `config/` or `lib/abi/`.
6. No direct `fetch` / `viem.readContract` outside `services/` (or `lib/` for stateless helpers).

## Business logic vs orchestration

- **Business logic = service**: rules that exist independently of UI. "How to build a triple from a claim", "how to compute fee-adjusted assets", "how to decide if pinning is needed". Lives in `services/`. Pure functions or classes. Easily unit-testable.
- **Orchestration = hook**: combines services into React state. "Submit a claim" hook calls `IpfsService.pin → IntuitionService.createAtoms → IntuitionService.createTriple`, manages loading/error states. Lives in `hooks/`. No business rules — only sequencing and state.

If a hook has more than one `if` statement that encodes a domain rule, it's leaking business logic. Move it to the service.

## Typing rules

1. **No `any`.** Use `unknown` and narrow with type guards or zod.
2. **All new variables typed**: explicit return types on exported functions. Inferred types are OK only for purely local consts.
3. **Discriminated unions** for state machines (e.g., `SubmissionState`).
4. **Exhaustive switches**: use `assertNever(x: never)` in default branch.
5. **Branded types** for IDs that are easy to confuse: `type AtomId = Bytes32 & { readonly __brand: 'AtomId' }`. Apply to `AtomId`, `TripleId`, `CurveId` at minimum.
6. **No type assertions** (`as Foo`) outside parsing/boundary code. If you need one, document why with a comment.
7. Strict `tsconfig` already on — keep it.

## Environment variables

- Single source of truth: `src/config/env.ts`. Loaded once at boot, validated with zod.
- All env vars prefixed `VITE_`. Listed exhaustively in `.env.example` with descriptions.
- Required vars at boot: `VITE_CHAIN_ID`, `VITE_RPC_URL`, `VITE_GRAPHQL_URL`, `VITE_MULTIVAULT_ADDRESS`, `VITE_IPFS_PIN_ENDPOINT`.
- Optional with defaults: `VITE_NETWORK_NAME` (derived from chain ID).
- Document every env var in `docs/env.md` when added.

## Commit rules

1. **Conventional commits**: `feat(scope): …`, `fix(scope): …`, `chore(deps): …`, `docs(scope): …`, `refactor(scope): …`. Scope = lowest folder (e.g., `feat(services/intuition): add createAtoms wrapper`).
2. **Atomic**: one logical change per commit. If you say "and" in the message, split.
3. **Build green**: `bun run build` MUST pass at every commit. No "WIP".
4. **Lint clean**: `bun run lint` zero warnings.
5. Commit body explains *why*, not *what*. Diff already shows the *what*.

## Phase gate procedure

At the end of each phase (see `docs/plan.md`), run in parallel:

1. `bun run build` (must succeed)
2. `bun run lint` (must succeed)
3. Spawn the 4 reviewer agents in parallel (`architecture-reviewer`, `typing-reviewer`, `intuition-reviewer`, `docs-writer`)
4. Fix every issue raised before the phase commit
5. Run testnet smoke test where the phase produces user-visible behavior

Phase 2 and 4 additionally require **real testnet transactions** documented in the PR description with tx hashes from `testnet.explorer.intuition.systems`.

## Documentation discipline

- `docs/architecture.md` — layering, import rules. Updated when a layer is added/changed.
- `docs/decisions.md` — ADRs for non-obvious choices. Append-only, dated.
- `docs/env.md` — env var inventory.
- `docs/plan.md` — bounty phase plan (kept in sync with todo list).
- After every phase, the `docs-writer` agent updates these docs.

## Forbidden practices

- Hardcoded contract addresses or chain IDs in service/hook code (use `config/`).
- Hardcoded `atomCost`, `tripleCost`, `curveId` (always read on-chain via `useIntuitionSession`).
- Hardcoded `predicateAtomId` (always resolve via GraphQL using label).
- `// TODO` without a tracking commit/PR reference.
- Comments explaining *what*. Only *why*.
- Mocking the chain in tests for the integration path. Hit testnet.

## Skill references

- **Intuition** skill — required reading before any contract code. Files: `reference/reading-state.md` (session setup), `reference/graphql-queries.md` (discovery), `reference/schemas.md` (IPFS pinning), `reference/workflows.md` (multi-step), `operations/*.md` (per-action).
- See `.claude/agents/intuition-reviewer.md` for what the reviewer checks against the skill.
