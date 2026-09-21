# Repertoire Engine R1-A — Dark Migration Deployment Runbook

Status: **applied to production** (project `zmhmdvmyeyswunurcyow`), feature still dark. Structural and security verification passed on 2026-09-16. This runbook is kept as the procedure of record and as the reference for verification and rollback; it is not authorization to deploy anywhere else.

## Post-deployment record (2026-09-16)

| Check | Result |
| --- | --- |
| Migration history | 10/10 present in `supabase_migrations.schema_migrations` |
| `repertoire_r1a_deployment_verify.sql` | Passed, run read-only, no exception raised |
| Migration manifest | 10/10 hashes match after the correction recorded below |
| Row counts | All Repertoire business tables empty; `catalogo_estados_preparacion` seeded with 5 rows |
| `montajes` / `montaje_eventos` | Zero foreign keys to `eventos_conciertos` or `soi_eventos`; `montaje_eventos` references `calendario_institucional` |
| RLS | Enabled on all 24 tables; 43 policies, including the reviewed assignment, signal-recipient and target-scope policies |
| Feature flag | `VITE_REPERTOIRE_ENABLED` unset — the module is unreachable for every user |

Not verified against production: `supabase/tests/repertoire_r1a_security.sql`, the six-identity authorization matrix. That script inserts rows into `auth.users`, `profiles` and `maestros` before rolling back, and its own header restricts it to a disposable local database. Run it there before Stage 1; the grants and policies it exercises were verified by catalog inspection instead.

### Manifest correction

The manifest hash for migration 1 (`20260914160601_repertoire_engine_foundation.sql`) did not match the file, and did not match **any** committed version of it. The file changed in `f5fc0816`, which removed the `montajes.evento_id -> eventos_conciertos` foreign key because that table does not exist in production; the manifest was written afterwards in `c84856bb` carrying the hash of an intermediate state that was never committed. What is deployed corresponds to the current file — verification confirms zero concert foreign keys. The manifest now records the real hash (`f0688be0…`) and keeps the superseded value under `manifest_corrections`.

This mismatch should have stopped the deployment: the pre-flight gate below calls any manifest mismatch an abort condition, and the release proceeded anyway. The schema landed correctly, but the integrity gate did not function as a gate. Before R1-B, verify the manifest as a blocking step rather than a displayed one.

## Frozen migration stack

Execute serially in this exact order. Migration 10 is `20260914220000_repertoire_fila_assignments_rls.sql`.

1. `20260914160601_repertoire_engine_foundation.sql`
2. `20260914173531_repertoire_student_overrides.sql`
3. `20260914174948_repertoire_passages_linked_measures.sql`
4. `20260914192916_repertoire_session_work.sql`
5. `20260914205937_repertoire_preparation_history.sql`
6. `20260914210804_repertoire_targets_milestones.sql`
7. `20260914213711_repertoire_atomic_preparation_mutation.sql`
8. `20260914213713_repertoire_calendar_relationship.sql`
9. `20260914214811_repertoire_deterministic_signals.sql`
10. `20260914220000_repertoire_fila_assignments_rls.sql`

The reviewed SHA-256 manifest is `supabase/migrations/REPERTOIRE_R1A_MIGRATION_MANIFEST.json`. Verify it before deployment; any mismatch is an abort condition.

## Pre-flight and backup gate

1. Confirm the target project and branch of the deployment operator.
2. Run `supabase migration list --linked` and save the output as the migration-history snapshot.
3. Run `supabase/tests/repertoire_r1a_deployment_preflight.sql` read-only against the production database. It checks PostgreSQL, prerequisites, identifier types, and unexpected Repertoire objects.
4. Capture a schema-only snapshot using the approved Supabase/Postgres backup capability.
5. Capture grants, RLS enablement, policies, and relevant function privileges for the prerequisite schema and save the output with the release evidence.
6. Confirm a recoverable database backup/checkpoint exists. Do not proceed on verbal confirmation alone.

The backup is a prerequisite, not a promise that arbitrary object drops are safe. These migrations are additive and have no automatic down migration.

## Execution order

`PRE-FLIGHT` → `BACKUP VERIFIED` → migrations 1–10 serially through the approved Supabase migration runner → structural verification → security verification → existing SOI smoke checks → dark-feature verification.

Do not use parallel sessions. Do not apply unrelated migrations. Do not seed data. Do not enable `VITE_REPERTOIRE_ENABLED`.

## Post-migration structural verification

Run `supabase/tests/repertoire_r1a_deployment_verify.sql` read-only. It verifies all expected tables, RLS on every Repertoire table, required RPCs, event relation to `calendario_institucional`, absence of `eventos_conciertos`/`soi_eventos` concert FKs, and reviewed grants/policy contracts.

Also verify:

- `montaje_fila_maestros`, `montaje_preparacion_historial`, `repertoire_signals`, and `repertoire_signal_deliveries` exist.
- Expected migration history shows 10/10 files present with the manifest hashes.
- New Repertoire tables contain zero rows, except any rows explicitly documented by the deployment evidence. Zero rows is expected and is not a failure.

## Security verification

The verification must prove, not merely display, that:

- authenticated clients cannot directly update preparation state;
- authenticated clients cannot directly write, update, or delete preparation history;
- `PUBLIC` cannot execute either preparation RPC;
- `authenticated` can execute only the reviewed RPC signatures;
- assignment helper functions and assignment RLS policies exist;
- signal recipient and target scope policies exist with the reviewed names;
- teacher access is assignment/fila scoped and Finanzas has no Repertoire access.

For a controlled write test, stop here and request explicit post-migration approval. No production write test is part of the dark deployment.

## Dark feature verification

Immediately after verification:

- Confirm production configuration has `VITE_REPERTOIRE_ENABLED=false` or is unset/false.
- Confirm no Repertoire navigation entry is exposed to users.
- Confirm no client or background job has created Repertoire rows.
- Confirm Hermes is not consuming or generating Repertoire signals automatically.
- Confirm Portal Maestros has no new Repertoire runtime errors, unexpected 401/403/500 responses, or console exceptions.

Schema present; feature dark.

## Existing SOI smoke checks

Run non-destructive checks for Portal Maestros login, existing session reads, observations reads, calendar reads, legacy notifications reads, institutional task reads, and attendance reads. Compare status/error counts with the pre-flight baseline.

## Observability

During and immediately after deployment inspect migration errors, auth/RLS errors, Portal Maestros console/runtime errors, unexpected API 401/403/500 responses, slow queries, and background jobs touching the new tables. Use existing Supabase and application logging only; do not introduce paid monitoring.

## Abort conditions

Stop immediately if backup is not confirmed, a prerequisite is missing, any object collision is found, a checksum differs, any migration fails, RLS is absent, RPC grants differ, direct preparation/history DML is available, the feature gate is enabled, existing SOI smoke checks regress, or any unintended Repertoire data appears.

## Success conditions

The deployment is successful only when migration history is 10/10, all structural and security checks pass, existing SOI smoke checks pass, the feature remains disabled, and no unintended Repertoire data exists.

## Rollback decision tree

### A. Failure before migration commit

Stop the runner and preserve logs. Use the migration runner's transactional rollback behavior where supported. Do not continue with later files until the failed statement is diagnosed and the reviewed migration is corrected or the deployment is rescheduled.

### B. Emergency after successful migration

1. Disable/keep disabled the feature and stop any newly introduced workers.
2. Preserve logs, migration history, schema, grants/RLS evidence, and current row counts.
3. If any Repertoire production data exists, do **not** drop objects; remediate forward or restore through the approved database recovery process.
4. If the feature stayed dark and all Repertoire tables are confirmed empty, obtain explicit owner/database approval before considering structural rollback.
5. Any rollback SQL must name objects explicitly, run in dependency order, check zero-row preconditions, and avoid `CASCADE` unless a database owner approves a justified dependency. No one-click drop script is provided.

## R1-B entry and later activation plan

R1-B starts only after structural verification, security verification, existing SOI smoke checks, feature-disabled confirmation, and explicit human approval.

- Stage 0: remain dark.
- Stage 1: enable only for Admin/ACM or selected internal accounts.
- Stage 2: one montage and a small number of filas with controlled real data.
- Stage 3: selected teachers.
- Stage 4: broader Portal Maestros activation.

No R1-B work is included in this release. Stage 0 (dark) is the current state.
