// Mutation check: the suite must FAIL when the migration is deliberately weakened.
// Each mutant removes the in-migration self-check (so it cannot save us) and re-introduces a hole.
//   M1  residual policy: a teacher may UPDATE their own row
//   M2  residual policy: every signed-in account may read every row
//   M3  privileges untouched (anon / authenticated keep TRUNCATE and friends)
// Usage: node supabase/tests/permisos-maestros-fix/run_mutation.mjs   (exit 0 = every mutant was caught)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const migDir = path.resolve(here, '../../migrations');
const original = fs.readFileSync(path.join(migDir, fs.readdirSync(migDir).find((f) => f.startsWith('20261017190000_'))), 'utf8');
const noCheck = original.replace(/-- ── 3\. Self-check[\s\S]*?END \$\$;\n/, '');
if (noCheck === original) throw new Error('could not strip the self-check block');

const mutants = {
  M1_residual_own_row_update: noCheck.replace('COMMIT;', `DROP POLICY IF EXISTS mutant_own_update ON public.permisos_maestros;
CREATE POLICY mutant_own_update ON public.permisos_maestros FOR UPDATE TO authenticated
  USING (maestro_id = maestro_actual()) WITH CHECK (maestro_id = maestro_actual());\nCOMMIT;`),
  M2_residual_read_all: noCheck.replace('COMMIT;', `DROP POLICY IF EXISTS mutant_read_all ON public.permisos_maestros;
CREATE POLICY mutant_read_all ON public.permisos_maestros FOR SELECT TO authenticated USING (true);\nCOMMIT;`),
  M3_privileges_untouched: noCheck.replace(/REVOKE ALL ON public\.permisos_maestros FROM anon, authenticated;\nGRANT SELECT, INSERT, UPDATE ON public\.permisos_maestros TO authenticated;\n/, ''),
};
let missed = 0;
for (const [name, sql] of Object.entries(mutants)) {
  if (sql === noCheck) throw new Error(`mutant ${name} did not change the migration`);
  const file = path.join(os.tmpdir(), `pmf_${name}.sql`);
  fs.writeFileSync(file, sql);
  const out = path.join(os.tmpdir(), `pmf_${name}.json`);
  const r = spawnSync(process.execPath, [path.join(here, 'run_tests.mjs'), '--json', out], { env: { ...process.env, MIGRATION_OVERRIDE: file }, encoding: 'utf8' });
  const failed = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')).failed : -1;
  const caught = r.status !== 0 && failed > 0;
  if (!caught) missed++;
  console.log(`${caught ? 'CAUGHT' : 'MISSED'}  ${name}: ${failed} failing cases`);
}
console.log(missed ? `\n${missed} mutant(s) SURVIVED` : '\nALL MUTANTS CAUGHT');
process.exit(missed ? 1 : 0);
