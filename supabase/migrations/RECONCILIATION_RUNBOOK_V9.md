# Supabase Migration Reconciliation Runbook V9

## Safety rule

`supabase db push` is forbidden while this runbook is active. Apply only a reviewed SQL file or a batch whose versions are unique and classified.

## Batch sequence

1. Run `audit_supabase_migrations.py` against a read-only remote ledger export.
2. Query `supabase_migrations.schema_migrations` for `version` and `name`.
3. Mark the local file matching that pair as `applied_remote`.
4. Mark same-timestamp siblings as `unregistered`; inspect dependencies before creating any replacement migration.
5. Create replacement migrations only with a new unique timestamp and idempotent SQL.
6. Apply one reviewed batch, verify its schema and behavior, then record it through the official migration ledger.

## Current state

- Historical backlog: frozen for classification.
- Selective migrations `20260818190000` and `20260818190100`: applied and recorded.
- Next batch: choose one domain only after dependency review, starting with the lowest-risk schema-only changes.

## Required evidence per batch

- Remote ledger query before and after.
- List of affected tables, functions, enums, policies and data changes.
- Idempotency review and rollback method.
- Functional verification query.
