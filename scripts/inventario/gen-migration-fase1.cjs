/**
 * gen-migration-fase1.cjs — genera el SQL de la Fase 1 del saneamiento:
 * SOLO INSERT de instrumentos nuevos (los que no existen en inventario_activos).
 * No toca filas existentes. No aplica nada — escribe un archivo de migración
 * para revisión + aplicación manual.
 */
const path = require('path');
const fs = require('fs');

const DB_JSON = process.argv[2];
const OUT_SQL = process.argv[3] || path.join(__dirname, '../../supabase/migrations/20260907060000_inventario_saneamiento_fase1_altas.sql');

const inserts = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/diff-inserts.json'), 'utf8'));
const db = JSON.parse(fs.readFileSync(DB_JSON, 'utf8'));
const nk = (c) => (c == null ? '' : String(c).toUpperCase().replace(/[^A-Z0-9]/g, ''));
const dbKeys = new Set(db.map((r) => nk(r.c)));

const sqlStr = (v) => (v == null || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const sqlBool = (v) => (v == null ? 'NULL' : v ? 'true' : 'false');

// Un INSERT es "seguro" si: código reconocible, tipo reconocido, sin asignatario
// (los con asignatario o código dudoso van comentados para revisión).
function safe(x) {
  if (!x.codigo_inventario || !x.tipo_instrumento) return false;
  const k = nk(x.codigo_inventario);
  // código sospechosamente cercano a uno existente (truncado)
  for (const dk of dbKeys) {
    if (dk !== k && (dk.startsWith(k) || k.startsWith(dk)) && Math.abs(dk.length - k.length) <= 1) return false;
  }
  if (x.asignado_texto) return false; // altas con asignación: revisar aparte
  return true;
}

const seguros = inserts.filter(safe);
const revisar = inserts.filter((x) => !safe(x));

const L = [];
L.push('-- Saneamiento de inventario — Fase 1: SOLO ALTAS');
L.push('-- Fuente: INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx, hoja AGOSTO 2026');
L.push('-- Generado por scripts/inventario/gen-migration-fase1.cjs (dry-run, revisar antes de aplicar)');
L.push('-- NO modifica filas existentes. Solo inserta instrumentos ausentes en inventario_activos.');
L.push('--');
L.push(`-- Altas seguras: ${seguros.length}  ·  Altas a revisar a mano (comentadas): ${revisar.length}`);
L.push('');
L.push('BEGIN;');
L.push('');

const cols = 'codigo_inventario, tipo_instrumento, familia, tamano, marca, modelo, numero_serie, estado_conservacion, estado_uso, ubicacion, activo, fuente_importacion';
function row(x) {
  return `  (${sqlStr(x.codigo_inventario)}, ${sqlStr(x.tipo_instrumento)}, ${sqlStr(x.familia)}, ${sqlStr(x.tamano)}, ${sqlStr(x.marca)}, ${sqlStr(x.modelo)}, ${sqlStr(x.numero_serie)}, ${sqlStr(x.estado_conservacion)}, ${sqlStr(x.estado_uso)}, ${sqlStr(x.ubicacion)}, true, 'xlsx-agosto-2026')`;
}

L.push(`INSERT INTO public.inventario_activos (${cols})`);
L.push('VALUES');
L.push(seguros.map(row).join(',\n'));
L.push('ON CONFLICT (codigo_inventario) DO NOTHING;');
L.push('');
L.push('COMMIT;');
L.push('');
L.push('-- ─────────────────────────────────────────────────────────────────────');
L.push('-- ALTAS A REVISAR A MANO (código dudoso o con asignación) — NO se insertan:');
revisar.forEach((x) => {
  L.push(`-- ${x.codigo_inventario} | ${x.tipo_instrumento || x.instrumento_raw} ${x.tamano || ''} | ${x.marca || ''} | ${x.estado_uso} | asignado="${x.asignado_texto || ''}" ubic="${x.ubicacion || ''}" | fila ${x.fila_origen}`);
});
L.push('/*');
L.push(`INSERT INTO public.inventario_activos (${cols}) VALUES`);
L.push(revisar.map(row).join(',\n') + ';');
L.push('*/');

fs.writeFileSync(OUT_SQL, L.join('\n') + '\n');
console.log('Migración escrita:', OUT_SQL);
console.log(`  altas seguras: ${seguros.length}`);
console.log(`  a revisar:     ${revisar.length} -> ${revisar.map((x) => x.codigo_inventario).join(', ')}`);
