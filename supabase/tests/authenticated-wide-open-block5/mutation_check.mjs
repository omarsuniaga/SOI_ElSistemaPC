// Mutation check: the suite must FAIL when the migration is deliberately weakened.
// Each mutant is the real migration plus ONE regression; run_tests.mjs is executed against it through
// MIGRATION_OVERRIDE and must exit non-zero. A mutant that passes means the suite cannot see that hole.
//
// Usage: node supabase/tests/authenticated-wide-open-block5/mutation_check.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const migDir = path.resolve(here, '../../migrations');
const original = fs.readFileSync(path.join(migDir, fs.readdirSync(migDir).find((f) => f.startsWith('20261020131000_'))), 'utf8');

const replaceOnce = (s, a, b) => {
  if (!s.includes(a)) throw new Error(`mutation anchor not found: ${a.slice(0, 60)}`);
  return s.replace(a, () => b);
};
// appended after the self-check, i.e. a regression the migration itself cannot see
const beforeCommit = (sql) => original.replace(/COMMIT;\s*$/, `${sql}\nCOMMIT;\n`);

const MUTANTS = {
  'M1 residual permissive UPDATE policy on departamentos (added after the self-check)':
    beforeCommit(`CREATE POLICY mutant_any_update ON public.departamentos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`),
  'M2 direccion silently receives every configuration capability':
    replaceOnce(original, `SELECT soi_security.has_role(ARRAY['admin', 'superadmin'])\n     AND p_capacidad IN`,
      `SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion'])\n     AND p_capacidad IN`),
  'M3 table-level UPDATE on departamentos (column restriction lost: codigo/jefe_id editable)':
    beforeCommit(`GRANT UPDATE ON public.departamentos TO authenticated;`),
  'M4 anon keeps SELECT on niveles (grant restored after the self-check)':
    beforeCommit(`GRANT SELECT ON public.niveles TO anon;`),
  'M5 reminder preferences readable by everybody, written as "own OR true" so a literal-true check misses it':
    replaceOnce(original, `USING (profile_id = auth.uid() OR public.tiene_capacidad_configuracion('recordatorios:administrar'));`,
      `USING (profile_id = auth.uid() OR true);`),
  'M6 reminder preferences can be written onto another profile (WITH CHECK dropped on INSERT)':
    replaceOnce(original, `FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());`,
      `FOR INSERT TO authenticated WITH CHECK (profile_id IS NOT NULL);`),
  'M7 follow-up rules writable by anyone who may read them (direccion/coordinacion/finanzas)':
    replaceOnce(original, `FOR INSERT TO authenticated WITH CHECK (public.tiene_capacidad_configuracion('seguimiento_reglas:gestionar'));`,
      `FOR INSERT TO authenticated WITH CHECK (public.puede_leer_configuracion_institucional());`),
  'M8 teachers may read the Hermes process contracts (read helper widened)':
    replaceOnce(original, `SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion', 'coordinacion_academica', 'finanzas', 'operaciones'])\n$$;`,
      `SELECT soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion', 'coordinacion_academica', 'finanzas', 'operaciones']) OR public.maestro_actual() IS NOT NULL\n$$;`),
  'M9 process contracts become writable again for any signed-in account (grant + policy after the self-check)':
    beforeCommit(`GRANT UPDATE ON public.soi_process_contracts TO authenticated;\nCREATE POLICY mutant_contracts_upd ON public.soi_process_contracts FOR UPDATE TO authenticated USING (true);`),
  'M10 instrument inventory readable by every signed-in account (read helper bypassed)':
    replaceOnce(original, `FOR SELECT TO authenticated USING (public.puede_leer_catalogo_staff());\nCREATE POLICY instrumentos_gestor_insert`,
      `FOR SELECT TO authenticated USING (true);\nCREATE POLICY instrumentos_gestor_insert`),
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw5-mutants-'));
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
