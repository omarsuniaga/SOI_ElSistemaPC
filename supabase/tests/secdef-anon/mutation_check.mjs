// Mutation check: the suite must FAIL when the migration is deliberately weakened.
// Each mutant is the real migration plus ONE regression; run_tests.mjs runs against it through
// MIGRATION_OVERRIDE and must exit non-zero. A mutant that passes means the suite has a blind spot.
//
// Usage: node supabase/tests/secdef-anon/mutation_check.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const migDir = path.resolve(here, '../../migrations');
const original = fs.readFileSync(path.join(migDir, fs.readdirSync(migDir).find((f) => f.startsWith('20261020130000_'))), 'utf8');

const replaceOnce = (s, a, b) => {
  if (!s.includes(a)) throw new Error(`mutation anchor not found: ${a.slice(0, 60)}`);
  return s.replace(a, b);
};
const beforeCommit = (sql) => original.replace(/COMMIT;\s*$/, `${sql}\nCOMMIT;\n`);

const MUTANTS = {
  'M1 anon keeps a notifier (grant restored after the self-check)':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.fn_check_and_notify_pending_asistencias() TO anon;`),
  'M2 authenticated keeps an internal function (group A)':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.fn_escalar_mora() TO authenticated;`),
  'M3 backfill guard accepts any signed-in user':
    replaceOnce(original, `OR soi_security.has_role(ARRAY['admin', 'superadmin'])`, `OR auth.role() = 'authenticated'`),
  'M4 backfill guard also accepts teachers':
    replaceOnce(original, `ARRAY['admin', 'superadmin']))`, `ARRAY['admin', 'superadmin', 'maestro']))`),
  'M5 backfill implementation executable by authenticated':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.backfill_alumnos_desde_postulantes_impl(boolean) TO authenticated;`),
  'M6 anon keeps a screen function (group B)':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.fn_crear_evento_calendario(uuid, text, text, text, date, date, integer, text, uuid, jsonb, text) TO anon;`),
  'M7 service_role loses an edge-function RPC (would break refresh-service-balances)':
    beforeCommit(`REVOKE EXECUTE ON FUNCTION public.fn_fin_acquire_service_refresh_lock(uuid, uuid, integer) FROM service_role;`),
  'M8 PUBLIC grant left on a function (anon inherits it)':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.fn_hermes_update_notif(uuid, text, text) TO PUBLIC;`),
  'M9 one function forgotten in group A':
    replaceOnce(original, `    'public.fn_escalar_mora()',\n`, ``),
  'M10 wrapper is no longer SECURITY DEFINER-guarded (guard removed)':
    replaceOnce(original, `  IF NOT (COALESCE(auth.role(), '') = 'service_role'\n          OR soi_security.has_role(ARRAY['admin', 'superadmin'])) THEN`, `  IF false THEN`),
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sd-mutants-'));
let escaped = 0;
for (const [name, sql] of Object.entries(MUTANTS)) {
  const file = path.join(dir, `${name.split(' ')[0]}.sql`);
  fs.writeFileSync(file, sql);
  const r = spawnSync(process.execPath, [path.join(here, 'run_tests.mjs')], { env: { ...process.env, MIGRATION_OVERRIDE: file }, encoding: 'utf8' });
  const caught = r.status !== 0;
  const failedLine = (r.stdout.match(/(\d+) FAILURES/) || [])[0] || (r.stderr.split('\n').find((l) => /error/i.test(l)) ?? '').trim().slice(0, 90);
  console.log(`${caught ? 'CAUGHT ' : 'ESCAPED'}  ${name}${caught ? `  [${failedLine}]` : ''}`);
  if (!caught) escaped++;
}
console.log(escaped ? `\n${escaped} mutant(s) ESCAPED: the suite has a blind spot` : '\nAll mutants were caught');
process.exit(escaped ? 1 : 0);
