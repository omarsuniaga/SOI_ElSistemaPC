/**
 * gen-migration-fase2.cjs — Fase 2 del saneamiento: UPDATE dirigidos sobre
 * inventario_activos (filas existentes). NO aplica nada.
 *
 *   A) estado_conservacion: las filas con 'mantenimiento' (valor basura del
 *      import de junio) que matchean el xlsx pasan al valor derivado de las
 *      observaciones.
 *   B) asignación: reasignaciones nombre->nombre + altas de asignación + bajas
 *      explícitas (el xlsx de agosto dice DISPONIBLE / EN RESTAURACIÓN).
 *      Los nombres se resuelven contra la tabla `alumnos` (match difuso).
 *
 * Uso: node scripts/inventario/gen-migration-fase2.cjs <db-json> <alumnos-json>
 */
const path = require('path');
const fs = require('fs');

const DB_JSON = process.argv[2];
const ALUMNOS_JSON = process.argv[3];
const OUT_SQL = process.argv[4] || path.join(__dirname, '../../supabase/migrations/20260907061000_inventario_saneamiento_fase2.sql');

const db = JSON.parse(fs.readFileSync(DB_JSON, 'utf8'));
const alumnos = JSON.parse(fs.readFileSync(ALUMNOS_JSON, 'utf8'));
const xl = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/instrumentos-normalizados.json'), 'utf8'));

const deburr = (s) => (s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/�/g, 'n').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const nk = (c) => (c == null ? '' : String(c).toUpperCase().replace(/[^A-Z0-9]/g, ''));
const sqlStr = (v) => (v == null || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

const xlByCode = new Map();
for (const x of xl) if (x.codigo_inventario) xlByCode.set(nk(x.codigo_inventario), x);

// ── match difuso nombre -> alumno ────────────────────────────────────────────
function lev(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 1) return 2;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const alTok = alumnos.map((a) => ({ ...a, toks: [...new Set(deburr(a.n).split(' ').filter((t) => t.length > 1))] }));
function matchAlumno(nombre) {
  const q = [...new Set(deburr(nombre).split(' ').filter((t) => t.length > 1))];
  if (!q.length) return null;
  let best = null, bestScore = 0;
  for (const a of alTok) {
    let inter = 0;
    for (const t of q) if (a.toks.includes(t) || a.toks.some((at) => at.length > 3 && lev(t, at) <= 1)) inter++;
    const score = inter / q.length + (inter === q.length ? 0.15 : 0);
    if (score > bestScore) { bestScore = score; best = a; }
  }
  return { alumno: best, score: Number(bestScore.toFixed(2)), low: bestScore < 0.75 };
}

const STATUS = /^(DISPONIBLE|EN\s+RESTAURACI|RESTAURACI|DA.?AD|NO$|COMPARTIDO|ASIGNADO$|DEVUELTO|EN\s+USO|DEP.?SITO|SAL.?N|PERDID|RETIRAD|POR ASIGNAR)/i;
const isName = (v) => v && !STATUS.test(String(v));

const updConservacion = [];
const updAsignacion = [];
const revisar = [];

for (const r of db) {
  const x = xlByCode.get(nk(r.c));
  if (!x) continue;
  if (r.eu === 'de_baja' || r.a === false) continue; // no tocar retirados

  // A) estado_conservacion basura
  if (r.ec === 'mantenimiento' && x.estado_conservacion && x.estado_conservacion !== 'mantenimiento') {
    updConservacion.push({ codigo: r.c, de: r.ec, a: x.estado_conservacion });
  }

  // B) asignación
  const dbn = isName(r.as) ? r.as : null;
  const xln = isName(x.asignado_texto) ? x.asignado_texto : null;
  const orig = (x.asignado_original || '').toUpperCase();

  if (xln && (!dbn || dbn.toUpperCase() !== xln.toUpperCase())) {
    // alta o reasignación
    const m = matchAlumno(xln);
    const entry = { codigo: r.c, tipo: dbn ? 'reasignar' : 'asignar', nombre_xlsx: xln, db_actual: dbn, alumno: m && m.alumno ? m.alumno.n : null, alumno_id: m && m.alumno ? m.alumno.id : null, score: m ? m.score : 0, estado_uso: 'prestado' };
    if (!m || m.low || !m.alumno) revisar.push(entry);
    else updAsignacion.push(entry);
  } else if (dbn && !xln && (/DISPONIBLE|DEVUELTO|RESTAURACI|^NO$/.test(orig))) {
    // baja explícita
    updAsignacion.push({ codigo: r.c, tipo: 'baja', nombre_xlsx: null, db_actual: dbn, alumno: null, alumno_id: null, score: 1, estado_uso: /RESTAURACI/.test(orig) ? 'en_reparacion' : 'disponible' });
  }
}

// ── SQL ─────────────────────────────────────────────────────────────────────
const L = [];
L.push('-- Saneamiento de inventario — Fase 2: UPDATE dirigidos');
L.push('-- Fuente: hoja AGOSTO 2026. Generado por scripts/inventario/gen-migration-fase2.cjs');
L.push('-- Solo toca filas existentes NO retiradas. Revisar antes de aplicar.');
L.push(`-- A) estado_conservacion 'mantenimiento' -> derivado: ${updConservacion.length}`);
L.push(`-- B) asignación (reasignar/asignar/baja): ${updAsignacion.length}   ·   a revisar a mano: ${revisar.length}`);
L.push('');
L.push('BEGIN;');
L.push('');
L.push('-- ── A) estado_conservacion ────────────────────────────────────────────');
for (const u of updConservacion) {
  L.push(`UPDATE public.inventario_activos SET estado_conservacion = ${sqlStr(u.a)}, updated_at = now() WHERE codigo_inventario = ${sqlStr(u.codigo)} AND estado_conservacion = 'mantenimiento';`);
}
L.push('');
L.push('-- ── B) asignación (asignado_a_texto + estado_uso) ─────────────────────');
for (const u of updAsignacion) {
  const asig = u.tipo === 'baja' ? 'NULL' : sqlStr(u.alumno || u.nombre_xlsx);
  L.push(`-- ${u.tipo}${u.tipo !== 'baja' ? `  (xlsx="${u.nombre_xlsx}" -> alumno "${u.alumno}" score ${u.score})` : `  (baja de "${u.db_actual}")`}`);
  L.push(`UPDATE public.inventario_activos SET asignado_a_texto = ${asig}, estado_uso = ${sqlStr(u.estado_uso)}, updated_at = now() WHERE codigo_inventario = ${sqlStr(u.codigo)} AND activo AND estado_uso <> 'de_baja';`);
}
L.push('');
L.push('COMMIT;');
L.push('');
L.push('-- ── A REVISAR A MANO — asignaciones sin match confiable en `alumnos` ──');
for (const r of revisar) {
  L.push(`-- ${r.codigo}: xlsx="${r.nombre_xlsx}"  mejor match="${r.alumno}" (score ${r.score})  db_actual="${r.db_actual}"`);
}

fs.writeFileSync(OUT_SQL, L.join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'out/fase2-revisar.json'), JSON.stringify(revisar, null, 2));
console.log('Migración Fase 2:', OUT_SQL);
console.log(`  conservacion: ${updConservacion.length}  |  asignación: ${updAsignacion.length}  |  revisar: ${revisar.length}`);
console.log('  revisar:', revisar.map((r) => `${r.codigo}:${r.nombre_xlsx}→${r.alumno}(${r.score})`).join('  '));
