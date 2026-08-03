# Phase 8 repository cleanup report

## Decision inventory

Every tracked path at the Phase 8 base checkpoint was inventoried and classified by path group. These grouped decisions cover the complete tracked tree without duplicating one row per generated asset.

| Classification | Tracked path groups | Decision |
|---|---|---|
| A. REQUIRED_NOW | `apps/web`, `apps/admin`, `apps/api`, `packages/api`, `packages/types`, `packages/ui`, `packages/validation`, root build/config files, `scripts/admin/bootstrap-owner.mjs`, `supabase-ca.crt` | Retain and production-harden. |
| B. REQUIRED_DATABASE_HISTORY | `packages/db/prisma/schema.prisma`, all eleven timestamped migration directories, `migration_lock.toml` | Retain byte-for-byte. The intentionally empty Phase 3B migration remains valid history. |
| C. REQUIRED_CATALOGUE_PROVENANCE | `data/final`, `data/source`, `data/archive`, `docs/stabilization`, `docs/reviews/artifacts`, authoritative import documents in `docs/db` | Retain unchanged. |
| D. REQUIRED_AUTOMATED_TEST | `tests/phase7`, importer tests, isolated integration tests, the disposable runner, `tools/certify_catalogue.py` | Retain and fail closed against non-local mutation targets. |
| E. FUTURE_ONLY | `docs/mobile/customer-app-design-prompt.md`, `docs/mobile/admin-app-design-prompt.md` | Retain design intent; do not keep an empty mobile workspace. |
| F. GENERATED | `packages/db/dist`, `packages/graphify-out`, vendored GSAP builds/maps | Remove; reproducible from source/dependencies and excluded by ignore/build-context rules. |
| G. DUPLICATED | `.claude/skills`, `.windsurf/skills`, `packages/.agents`; unused root Prisma/Supabase reference packs | Remove. Root `.agents/AGENTS.md` plus the minimal root skill set is canonical. |
| H. OBSOLETE_STAGING | staging Compose, Phase 5 staging reports, staging scripts/tests, later superseded progress reports | Remove from the active production branch. |
| I. UNSAFE | scripts that mutate/seed arbitrary remote databases, disable TLS validation, embed old staging credentials, or expose records | Remove rather than retain as executable utilities. |
| J. UNKNOWN_REQUIRES_REVIEW | raw `Design/` export tree | No runtime references were found. Removal is required by the Phase 8 brief but remains untouched pending Ahmed's explicit filesystem-deletion approval. |

## Removal record

| Path or group | Why removed | Proof of non-use or risk | Recovery | Verification |
|---|---|---|---|---|
| `packages/db/dist`, `packages/graphify-out` | Generated output/cache | No runtime imports; builds regenerate required output | Base commit and Git history | Typecheck/build gates |
| `packages/db/prisma/migrations/phase3b_diff.sql` | Untimestamped empty diff artifact | Not a migration directory; Prisma history uses timestamped directories | Git history | Migration list/hash comparison |
| Accidental root database-verification filename | Accidental zero-value artifact | No references; not executable input | Git history | Repository path scan |
| `.claude/skills`, `.windsurf/skills`, `packages/.agents` | Duplicated agent configuration | Content duplicated the root canonical configuration | Git history | Root `AGENTS.md` and required root skills remain |
| Empty `apps/mobile/package.json` | Future-only empty workspace | No mobile source or runtime dependency | Git history; mobile prompts retained | npm workspace install/build |
| `apps/web/src/lib/gsap` | Vendored multi-build/plugin bundle | Runtime search found only core GSAP use in `HeroSection`; no local plugin consumer | Git history; installed `gsap` remains | Web typecheck/build and Phase 7 static test |
| Next starter SVGs | Unused starter assets | Reference search found no application use | Git history | Web build |
| Staging/dangerous database and development scripts | Obsolete credentials or unsafe remote writes; superseded by one aggregate read-only reconciliation command | Static review and reference search | Git history | Security scan and static Phase 8 test |
| One-off diagnostics and duplicate record-count/build utilities | Superseded, unsafe TLS, PII-capable, or not part of a supported workflow | Package-script and import searches showed no callers | Git history | Supported scripts and builds |
| Live staging/security test launchers | Targeted retired staging and embedded obsolete credentials | Direct static inspection | Git history | Disposable local integration suite |
| Obsolete Phase 4-7 progress/staging reports and stale root summaries | Superseded or staging-specific | Valid operational requirements consolidated into current docs | Git history | Documentation scan |
| `docker-compose.staging.yml` | Staging-specific and secret-bearing shape | Replaced by environment-driven `compose.yaml` | Git history | `docker compose config` |

No timestamped migration or catalogue source/final/archive artifact was removed, renamed, or regenerated. Git history at the Phase 8 base SHA preserves every removed tracked path.

## Retained operational surface

The retained database utilities are the package-level XLSX importer, owner bootstrap command, catalogue certification tool, disposable integration runner, and `scripts/database/reconcile-production-readonly.mjs`. The reconciliation command asserts the production project reference, opens a read-only transaction, and emits aggregates only.
