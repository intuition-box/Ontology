# Environment Variables

Single source of truth: `src/config/env.ts` (zod-validated at boot).
Any new env var must be added to `.env.example` and to this table in the same commit.

| Name | Required | Default | Description | Used in |
|------|----------|---------|-------------|---------|
| _none yet_ | | | | |

## Adding a new env var

1. Add a row to the table above.
2. Add the var to `.env.example` with a comment.
3. Add validation in `src/config/env.ts` (zod schema).
4. Reference via `import { env } from '@/config/env'` — never via `import.meta.env.*` directly.
