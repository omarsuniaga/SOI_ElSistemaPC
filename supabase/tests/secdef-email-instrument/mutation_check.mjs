// Mutation check for 20261020132000: the suite must FAIL for each deliberate regression.
// Usage: node supabase/tests/secdef-email-instrument/mutation_check.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const migDir = path.resolve(here, '../../migrations');
const original = fs.readFileSync(path.join(migDir, fs.readdirSync(migDir).find((f) => f.startsWith('20261020132000_'))), 'utf8');
const replaceOnce = (s, a, b) => { if (!s.includes(a)) throw new Error(`anchor not found: ${a.slice(0, 60)}`); return s.replace(a, () => b); };
const beforeCommit = (sql) => original.replace(/COMMIT;\s*$/, `${sql}\nCOMMIT;\n`);
const SIG = 'public.fn_reportar_instrumento_danado(uuid, text, uuid, text)';

const MUTANTS = {
  'M1 guard neutralised but still mentioned in the body (the self-check text match is fooled)':
    replaceOnce(original, `IF NOT public.tiene_capacidad_academica('catalogo:escribir') THEN`, `IF false AND NOT public.tiene_capacidad_academica('catalogo:escribir') THEN`),
  'M2 guard narrowed to admin only (coordinacion loses a legitimate use)':
    replaceOnce(original, `IF NOT public.tiene_capacidad_academica('catalogo:escribir') THEN`, `IF NOT (public.es_admin() AND public.tiene_capacidad_academica('catalogo:escribir')) THEN`),
  'M3 anon regains EXECUTE on the mailbox lookup (after the self-check)':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.fn_email_departamento(text) TO anon;`),
  'M4 authenticated keeps EXECUTE on the mailbox lookup':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.fn_email_departamento(text) TO authenticated;`),
  'M5 the unguarded _impl becomes executable by authenticated (guard bypass)':
    beforeCommit(`GRANT EXECUTE ON FUNCTION public.fn_reportar_instrumento_danado_impl(uuid, text, uuid, text) TO authenticated;`),
  'M6 service_role bypasses the guard (wrapper replaced by a pass-through)':
    beforeCommit(`DROP FUNCTION ${SIG};
CREATE FUNCTION public.fn_reportar_instrumento_danado(p_instrumento_id uuid, p_descripcion text, p_actor_id uuid, p_actor_nombre text) RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public AS $m$ SELECT public.fn_reportar_instrumento_danado_impl($1, $2, $3, $4) $m$;
GRANT EXECUTE ON FUNCTION ${SIG} TO authenticated, service_role;`),
  'M7 wrapper loses SECURITY DEFINER (authorised callers cannot reach _impl)':
    replaceOnce(original, `VOLATILE\nSECURITY DEFINER\nSET search_path = public, pg_temp\nAS $$\nBEGIN\n  IF NOT`, `VOLATILE\nSET search_path = public, pg_temp\nAS $$\nBEGIN\n  IF NOT`),
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sd-mutants-'));
let escaped = 0;
for (const [name, sql] of Object.entries(MUTANTS)) {
  const file = path.join(dir, `${name.split(' ')[0]}.sql`);
  fs.writeFileSync(file, sql);
  const r = spawnSync(process.execPath, [path.join(here, 'run_tests.mjs')], { env: { ...process.env, MIGRATION_OVERRIDE: file }, encoding: 'utf8' });
  const caught = r.status !== 0;
  const info = (r.stdout.match(/(\d+) FAILURES/) || [])[0] || (r.stderr.split('\n').find((l) => /error/i.test(l)) ?? '').trim().slice(0, 90);
  console.log(`${caught ? 'CAUGHT ' : 'ESCAPED'}  ${name}${caught ? `  [${info}]` : ''}`);
  if (!caught) escaped++;
}
console.log(escaped ? `\n${escaped} mutant(s) ESCAPED: the suite has a blind spot` : '\nAll mutants were caught');
process.exit(escaped ? 1 : 0);
