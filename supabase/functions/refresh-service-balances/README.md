# Service balance refresh deployment

This function is intentionally not scheduled by a SQL migration. A provider refresh needs server-side credentials and a scheduler must never place them in `pg_cron`, a migration, the browser, or repository files.

Deploy the function with the normal Supabase Edge Function workflow and configure only server-side secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTERNAL_FN_KEY` for the scheduler invocation

Schedule a POST to `refresh-service-balances` from Supabase Cron, Cloud Scheduler, or another protected scheduler. Pass `x-internal-key` from its secret manager. Manual FIN requests use an authenticated `admin`, `superadmin`, or `finanzas` JWT instead.

The CEPM connector is deliberately unsupported. Before enabling a CEPM service account, supply its official API contract, authentication method, account authorization, rate limit, and webhook/polling terms. Do not enable it using portal scraping or fixture data.
