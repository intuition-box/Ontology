# Architecture Decision Records

Append-only log of non-obvious technical decisions. Format per entry:

```markdown
## ADR-NNN: <title>

**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by ADR-MMM
**Context:** ...
**Decision:** ...
**Consequences:** ...
**References:** ...
```

---

## ADR-001: Strict layering (pages → components → hooks → services → lib)

**Date:** 2026-04-29
**Status:** Accepted
**Context:** The bounty integration adds wallet connection, contract calls, IPFS pinning, and GraphQL discovery to a previously static Vite/React app. Without layering, business logic risks landing inside React components, making it unreliable and untestable. The current `lib/` folder already mixes hooks, contexts, schemas, and pure utils.
**Decision:** Adopt one-direction imports across five layers. Components are pure, hooks orchestrate, services hold business logic with no React deps, lib contains pure utilities, config owns env access. Enforced by the `architecture-reviewer` agent at every phase gate.
**Consequences:**
- `services/*` files are unit-testable without a DOM.
- Hooks remain thin and readable as "call A then B".
- Adds friction when a quick component-level fetch would suffice — accepted trade-off, the bounty rewards maintainability.
**References:** `CLAUDE.md`, `docs/architecture.md`.

## ADR-002: Bun as exclusive package manager

**Date:** 2026-04-29
**Status:** Accepted
**Context:** Vite 7 requires Node 20.19+ / 22.12+. The project shipped with `package-lock.json` from npm but the local environment uses bun.
**Decision:** Use bun for all package management and script execution. `npm`/`npx`/`yarn`/`pnpm` denied at the settings level. `package-lock.json` will be replaced by `bun.lockb` after the first `bun install`.
**Consequences:**
- Faster installs, single tool.
- Contributors must have bun 1.x installed.
- Vite's dev-server crypto issue with Node 18 means we also pin Node ≥20.19 in the README.
**References:** `.claude/settings.json`, `CLAUDE.md`.
