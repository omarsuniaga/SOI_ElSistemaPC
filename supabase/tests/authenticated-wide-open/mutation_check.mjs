// Mutation check: the suite must FAIL when the migration is deliberately weakened.
// Each mutant is the real migration plus ONE regression; run_tests.mjs is executed against it through
// MIGRATION_OVERRIDE and must exit non-zero. A mutant that passes means the suite cannot see that hole.
//
// Usage: node supabase/tests/authenticated-wide-open/mutation_check.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const migDir = path.resolve(here, '../../migrations');
const original = fs.readFileSync(path.join(migDir, fs.readdirSync(migDir).find((f) => f.startsWith('20261020120000_'))), 'utf8');

const replaceOnce = (s, a, b) => {
  if (!s.includes(a)) throw new Error(`mutation anchor not found: ${a.slice(0, 60)}`);
  return s.replace(a, b);
};
const beforeCommit = (sql) => original.replace(/COMMIT;\s*$/, `${sql}\nCOMMIT;\n`);

const MUTANTS = {
  'M1 residual permissive UPDATE policy on postulantes (added after the self-check)':
    beforeCommit(`CREATE POLICY mutant_any_update ON public.postulantes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`),
  'M2 direccion silently receives every capability':
    replaceOnce(original, `soi_security.has_role(ARRAY['admin', 'superadmin'])\n    OR (soi_security.has_role(ARRAY['coordinacion_academica'])`,
      `soi_security.has_role(ARRAY['admin', 'superadmin', 'direccion'])\n    OR (soi_security.has_role(ARRAY['coordinacion_academica'])`),
  'M3 table-level UPDATE on notificaciones (columns no longer restricted)':
    beforeCommit(`GRANT UPDATE ON public.notificaciones TO authenticated;`),
  'M4 anon keeps SELECT on alumnos_programas (grant restored after the self-check)':
    beforeCommit(`GRANT SELECT ON public.alumnos_programas TO anon;`),
  'M5 notificaciones readable by everybody, written as "own OR true" so the literal-true check misses it':
    replaceOnce(original, `USING (profile_id = auth.uid() OR public.tiene_capacidad_estudiantil('notificaciones:administrar'));\nCREATE POLICY notificaciones_insert`,
      `USING (profile_id = auth.uid() OR true);\nCREATE POLICY notificaciones_insert`),
  'M6 teachers may notify anyone (director restriction dropped)':
    replaceOnce(original, `AND (profile_id IS NULL OR public.es_perfil_directivo(profile_id))`, `AND true`),
  'M7 tarea_comentarios authorship check dropped':
    replaceOnce(original, `AND (autor_id IS NULL OR autor_id = auth.uid())`, ``),
  'M8 student_case_events becomes updatable (append-only lost)':
    beforeCommit(`GRANT UPDATE ON public.student_case_events TO authenticated;\nCREATE POLICY mutant_ev_upd ON public.student_case_events FOR UPDATE TO authenticated USING (public.puede_leer_seguimiento_estudiantil());`),
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-mutants-'));
let escaped = 0;
for (const [name, sql] of Object.entries(MUTANTS)) {
  const file = path.join(dir, `${name.slice(0, 2)}.sql`);
  fs.writeFileSync(file, sql);
  const r = spawnSync(process.execPath, [path.join(here, 'run_tests.mjs')], { env: { ...process.env, MIGRATION_OVERRIDE: file }, encoding: 'utf8' });
  const caught = r.status !== 0;
  const failedLine = (r.stdout.match(/(\d+) FAILURES/) || [])[0] || (r.stderr.split('\n').find((l) => /error/i.test(l)) ?? '').trim().slice(0, 90);
  console.log(`${caught ? 'CAUGHT ' : 'ESCAPED'}  ${name}${caught ? `  [${failedLine}]` : ''}`);
  if (!caught) escaped++;
}
console.log(escaped ? `\n${escaped} mutant(s) ESCAPED: the suite has a blind spot` : '\nAll mutants were caught');
process.exit(escaped ? 1 : 0);
