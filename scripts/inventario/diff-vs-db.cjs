/**
 * diff-vs-db.cjs — compara instrumentos-normalizados.json (saneado del xlsx)
 * contra un dump de inventario_activos.json y reporta INSERT / UPDATE / solo-DB.
 *
 * Uso: node scripts/inventario/diff-vs-db.cjs <db-json> [xlsx-json]
 */
const path = require('path');
const fs = require('fs');

const DB_JSON = process.argv[2];
const XLSX_JSON = process.argv[3] || path.join(__dirname, 'out/instrumentos-normalizados.json');
const OUT = path.join(__dirname, 'out');

const db = JSON.parse(fs.readFileSync(DB_JSON, 'utf8'));       // [{c,t,m,mo,s,ta,ec,eu,u,a,as}]
const xl = JSON.parse(fs.readFileSync(XLSX_JSON, 'utf8'));     // registros saneados

const nkey = (c) => (c == null ? '' : String(c).toUpperCase().replace(/[^A-Z0-9]/g, ''));

const dbByKey = new Map();
for (const r of db) { const k = nkey(r.c); if (k) dbByKey.set(k, r); }

const inserts = [];
const updates = [];
const noChange = [];
const noKey = [];
const seen = new Set();

const FIELDS = [
  ['tipo_instrumento', 't'],
  ['marca', 'm'],
  ['modelo', 'mo'],
  ['numero_serie', 's'],
  ['tamano', 'ta'],
  ['estado_conservacion', 'ec'],
  ['estado_uso', 'eu'],
  ['asignado_texto', 'as'],
];

for (const x of xl) {
  const k = nkey(x.codigo_inventario);
  if (!k) { noKey.push(x); continue; }
  seen.add(k);
  const d = dbByKey.get(k);
  if (!d) { inserts.push(x); continue; }
  const changes = [];
  for (const [xf, df] of FIELDS) {
    const xv = x[xf] == null ? null : String(x[xf]);
    const dv = d[df] == null ? null : String(d[df]);
    if ((xv || '') !== (dv || '') && !(xv == null && dv == null)) {
      changes.push({ campo: xf, db: dv, xlsx: xv });
    }
  }
  if (changes.length) updates.push({ codigo: x.codigo_inventario, changes });
  else noChange.push(x.codigo_inventario);
}

const dbOnly = db.filter((r) => { const k = nkey(r.c); return k && !seen.has(k); });

// ── reporte ──
const L = [];
L.push('# Diff saneamiento xlsx AGOSTO 2026  vs  inventario_activos (DB)\n');
L.push(`- xlsx saneado: ${xl.length} instrumentos (${noKey.length} sin código)`);
L.push(`- DB: ${db.length} instrumentos`);
L.push(`- **Match exacto sin cambios**: ${noChange.length}`);
L.push(`- **Match con cambios (UPDATE)**: ${updates.length}`);
L.push(`- **Solo en xlsx (INSERT candidato)**: ${inserts.length}`);
L.push(`- **Solo en DB (retirado/no en agosto)**: ${dbOnly.length}`);

L.push(`\n## INSERT candidatos (${inserts.length})`);
inserts.forEach((x) => L.push(`- \`${x.codigo_inventario}\` ${x.tipo_instrumento || x.instrumento_raw} ${x.tamano || ''} ${x.marca || ''} — ${x.asignado_texto || x.estado_uso}`));

L.push(`\n## Solo en DB — ¿retirados? (${dbOnly.length})`);
dbOnly.forEach((r) => L.push(`- \`${r.c}\` ${r.t} ${r.ta || ''} ${r.m || ''} — activo=${r.a} ${r.as || ''}`));

L.push(`\n## UPDATE — cambios por campo (top 60)`);
const byField = {};
updates.forEach((u) => u.changes.forEach((c) => (byField[c.campo] = (byField[c.campo] || 0) + 1)));
L.push(`\nResumen: ${JSON.stringify(byField)}\n`);
updates.slice(0, 60).forEach((u) => {
  L.push(`### \`${u.codigo}\``);
  u.changes.forEach((c) => L.push(`- ${c.campo}: DB=\`${c.db}\` → xlsx=\`${c.xlsx}\``));
});
if (updates.length > 60) L.push(`\n… y ${updates.length - 60} más (ver diff-updates.json)`);

fs.writeFileSync(path.join(OUT, 'diff-vs-db.md'), L.join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'diff-updates.json'), JSON.stringify(updates, null, 2));
fs.writeFileSync(path.join(OUT, 'diff-inserts.json'), JSON.stringify(inserts, null, 2));

console.log('OK. Diff en', OUT + '/diff-vs-db.md');
console.log(`  sin cambios: ${noChange.length} | update: ${updates.length} | insert: ${inserts.length} | solo-DB: ${dbOnly.length} | sin-codigo: ${noKey.length}`);
console.log('  campos que más cambian:', JSON.stringify(byField));
