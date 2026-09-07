/**
 * sanitize-inventario-2026.cjs
 *
 * Saneamiento del inventario "arcaico" de El Sistema Punta Cana.
 * Fuente: "INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx", hoja AGOSTO 2026
 * (la más reciente = estado actual).
 *
 * Salidas (en scripts/inventario/out/):
 *   - instrumentos-normalizados.json  registros limpios
 *   - materiales.json                  filas de material/accesorios/insumos
 *   - reporte-saneamiento.md           resumen + ambigüedades para revisión humana
 *
 * NO escribe en la DB. Es dry-run.
 *
 * Uso: node scripts/inventario/sanitize-inventario-2026.cjs [ruta-xlsx] [hoja]
 */
const path = require('path');
const fs = require('fs');
const XLSX = require(path.join(__dirname, '../../node_modules/xlsx'));

const XLSX_PATH = process.argv[2] || path.join(__dirname, '../../INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx');
const SHEET = process.argv[3] || 'AGOSTO 2026';
const OUT_DIR = path.join(__dirname, 'out');
fs.mkdirSync(OUT_DIR, { recursive: true });

const COLS = ['n', 'instrumento', 'tamano', 'marca', 'modelo', 'serial', 'codigo', 'ubicacion', 'asignado', 'observaciones'];

// ─────────────────────────────────────────────────────────────────────────────
// Transformaciones
// ─────────────────────────────────────────────────────────────────────────────

const SIN = /^\s*(SIN\s+\w+|N\/?A|NINGUN[OA]?|---?|\.)\s*$/i;

/** Repara mojibake común (UTF-8 leído como latin1) y el reemplazo U+FFFD. */
const MOJIBAKE = [
  [/Ã±/g, 'ñ'], [/Ã‘/g, 'Ñ'], [/Ã¡/g, 'á'], [/Ã©/g, 'é'], [/Ã­/g, 'í'],
  [/Ã³/g, 'ó'], [/Ãº/g, 'ú'], [/Ã /g, 'à'], [/Ã¼/g, 'ü'], [/Â/g, ''],
  [/N�EZ/g, 'NUÑEZ'], [/DA�AD/g, 'DAÑAD'], [/PEQUE�A/gi, 'PEQUEÑA'],
  [/A�O/g, 'AÑO'], [/�/g, 'ñ'],
];
function fixMojibake(s) {
  let out = s;
  for (const [re, rep] of MOJIBAKE) out = out.replace(re, rep);
  return out;
}

const clean = (v) => {
  if (v == null) return null;
  let s = fixMojibake(String(v)).trim().replace(/\s+/g, ' ');
  if (s === '' || SIN.test(s)) return null;
  return s;
};

/** TAMAÑO: Excel guardó las fracciones "d/m" como fecha dd/mm. Revertir. */
function reverseTamano(v) {
  if (v == null) return null;
  if (v instanceof Date) {
    return `${v.getDate()}/${v.getMonth() + 1}`; // día/mes -> "3/4"
  }
  const s = String(v).trim();
  if (s === '') return null;
  // "4/4 (12)" -> "4/4"; deja literales como PEQUEÑA, 16"
  const m = s.match(/^(\d\/\d)\b/);
  return m ? m[1] : s;
}

/** CODIGO: trim, quita separadores Excel y basura. */
function normCodigo(v) {
  const c = clean(v);
  if (!c) return null;
  let s = c.replace(/[,\s]+$/, '').trim();
  // "22.122" / "23.250." (formato numérico Excel) -> "22122"
  if (/^\d{1,3}(\.\d{3})+\.?$/.test(s)) s = s.replace(/\./g, '');
  // descripciones de material que cayeron acá
  if (s.length > 20 || /\s(para|de|con)\s/i.test(s)) return null;
  // serials mal ubicados (patrón alfanum largo sin ESPC ni numérico puro)
  if (!/^ESPC/i.test(s) && !/^\d+$/.test(s) && s.length > 8) return null;
  return s.toUpperCase();
}

const INSTRUMENTO_MAP = [
  [/^VIOLONCELLO|^CELLO/i, 'violoncello', 'cuerdas'],
  [/^VIOLIN/i, 'violin', 'cuerdas'],
  [/^VIOLA/i, 'viola', 'cuerdas'],
  [/^CONTRABAJO/i, 'contrabajo', 'cuerdas'],
  [/^GUITARRA/i, 'guitarra', 'cuerdas'],
  [/^ARPA/i, 'arpa', 'cuerdas'],
  [/^FLAUTA\s+TRA[SV]VERSA\s+PICCOLO|^PICCOLO/i, 'flauta_trasversa_piccolo', 'maderas'],
  [/^FLAUTA\s+TRA[SV]VERSA/i, 'flauta_trasversa', 'maderas'], // ortografía usada en la DB
  [/^FLAUTA\s+DULCE\s+ALTO/i, 'flauta_dulce_alto', 'maderas'],
  [/^FLAUTA\s+DULCE/i, 'flauta_dulce', 'maderas'],
  [/^FLAUTA/i, 'flauta_trasversa', 'maderas'],
  [/^CLARINETE/i, 'clarinete', 'maderas'],
  [/^OBOE/i, 'oboe', 'maderas'],
  [/^FAGOT/i, 'fagot', 'maderas'],
  [/^SAXOF[OÓ]N\s+ALTO/i, 'saxofon_alto', 'maderas'],
  [/^SAXOF[OÓ]N\s+SOPRANO/i, 'saxofon_soprano', 'maderas'],
  [/^SAXOF[OÓ]N\s+TENOR/i, 'saxofon_tenor', 'maderas'],
  [/^SAXOF[OÓ]N/i, 'saxofon_alto', 'maderas'],
  [/^TROMPETA/i, 'trompeta', 'metales'],
  [/^CORNETA/i, 'corneta', 'metales'],
  [/^CORNO\s+FRANC[EÉ]S|^CORNO/i, 'corno_frances', 'metales'],
  [/^TROMB[OÓ]N/i, 'trombon', 'metales'],
  [/^FLISCORNO/i, 'fliscorno', 'metales'],
  [/^BOMBARDINO|^EUFONIO/i, 'bombardino', 'metales'],
  [/^TUBA\s+MI\s*BEMOL/i, 'tuba_mi_bemol', 'metales'],
  [/^TUBA\s+SI\s*BEMOL/i, 'tuba_si_bemol', 'metales'],
  [/^TUBA/i, 'tuba_si_bemol', 'metales'],
  [/^TIMPANI|^TIMBAL/i, 'timpani', 'percusion'],
  [/^XILOFONO|^XIL[OÓ]FONO/i, 'xilofono', 'percusion'],
  [/^BATERIA/i, 'bateria', 'percusion'],
  [/^BOMBO/i, 'bombo', 'percusion'],
  [/^BONGO/i, 'bongo', 'percusion'],
  [/^CAMPANAS?\s+TUBULARES/i, 'campanas_tubulares', 'percusion'],
  [/^CAMPANA/i, 'campana', 'percusion'],
  [/^PLATILLOS/i, 'platillos', 'percusion'],
  [/^PANDERETA/i, 'pandereta', 'percusion'],
  [/^TRIANGULO/i, 'triangulo', 'percusion'],
  [/^GUIRA/i, 'guira', 'percusion'],
  [/^CLAVE/i, 'clave', 'percusion'],
  [/^PIANO\s+DIGITAL|^PIANO\s+EL[EÉ]CTRICO/i, 'piano_digital', 'pianos'],
  [/^PIANO/i, 'piano', 'pianos'],
  [/^TECLADO\s+DIGITAL/i, 'teclado_digital', 'pianos'],
  [/^TECLADO/i, 'teclado', 'pianos'],
];

function normInstrumento(v) {
  const c = clean(v);
  if (!c) return { tipo: null, familia: null, marcaExtra: null, raw: v };
  let marcaExtra = null;
  let s = c;
  if (/\bNUVO\b/i.test(s)) { marcaExtra = 'NUVO'; s = s.replace(/\s*NUVO\s*/i, ' ').trim(); }
  for (const [re, tipo, familia] of INSTRUMENTO_MAP) {
    if (re.test(s)) return { tipo, familia, marcaExtra, raw: c };
  }
  return { tipo: null, familia: null, marcaExtra, raw: c }; // material / no reconocido
}

/** MARCA: "STEG: BUCHWALDER" -> {marca:"STEG", modelo:"BUCHWALDER"} */
function normMarca(vMarca, vModelo, marcaExtra) {
  let marca = clean(vMarca);
  let modelo = clean(vModelo);
  if (marca && /:/.test(marca) && !modelo) {
    const [a, b] = marca.split(':').map((x) => x.trim());
    marca = a || null;
    modelo = b || null;
  }
  if (marcaExtra && !marca) marca = marcaExtra;
  return { marca, modelo };
}

const ESTADOS_UBIC_STATUS = /^(ASIGNADO|DISPONIBLE|PRESTAMO|PRESTADO|POR ASIGNAR|COMPRADO|DONADO)$/i;
const TALLER_UBIC = /TALLER|LUTHIER|LUTHERIA|LUTER[ÍI]A|ARIZONA/i;
const ASIGNADO_STATUS = /^(DISPONIBLE|EN\s+RESTAURACI[OÓ]N|RESTAURACI[OÓ]N|DA[ÑN]AD[OA]|NO|COMPARTIDO|ASIGNADO|DEVUELTO|EN\s+USO|PERDID[OA]|RETIRAD[OA]|DEP[OÓ]SITO|SALON|SAL[OÓ]N)/i;
const ASIGNADO_ES_LUGAR = /^(DEP[OÓ]SITO|SAL[OÓ]N|TALLER|ESCALERAS|LUTHIER)/i;
const ASIGNADO_ES_REPARACION = /RESTAURACI[OÓ]N|REPARACI[OÓ]N/i;

/** Deriva estado_uso, estado_conservacion, asignado_texto, ubicacion_fisica */
function deriveEstado({ ubicacion, asignado, observaciones }) {
  const u = clean(ubicacion);
  const a = clean(asignado);
  const obs = (clean(observaciones) || '').toLowerCase();

  let estado_uso = 'disponible';
  let estado_conservacion = 'bueno';
  let asignado_texto = null;
  let ubicacion_fisica = null;
  const flags = [];

  // ubicación física real (si no es un status ni un código)
  if (u && !ESTADOS_UBIC_STATUS.test(u) && !/^ESPC/i.test(u) && !/^\d[\d.]*$/.test(u)) {
    ubicacion_fisica = u;
  }

  // asignatario (un nombre real, no un status ni un lugar)
  if (a && !ASIGNADO_STATUS.test(a)) {
    asignado_texto = a;
    estado_uso = 'prestado';
  } else if (a && ASIGNADO_ES_LUGAR.test(a) && !ubicacion_fisica) {
    ubicacion_fisica = a; // "SALÓN BUSTAMANTE" en la col ASIGNADO = ubicación
  }

  // taller / reparación
  if ((u && TALLER_UBIC.test(u)) || ASIGNADO_ES_REPARACION.test(a || '') || /\b(taller|luthier|restaurar|a restaurar|reparar)\b/i.test(obs)) {
    estado_uso = 'en_reparacion';
    asignado_texto = null;
  }

  // condición. Valores válidos del CHECK: excelente|bueno|regular|mantenimiento|de_baja
  const danado = /DA[ÑN]AD[OA]/i.test(a || '') ||
    /\b(da[ñn]ad[oa]|inhabilitad|no funciona|mal estado|roto|grieta|despegad|abollad)\b/i.test(obs);
  if (danado) {
    estado_conservacion = estado_uso === 'en_reparacion' ? 'mantenimiento' : 'regular';
  } else if (/\bexcelente\b/i.test(obs)) {
    estado_conservacion = 'excelente';
  } else if (/\b(regular|aceptable|deteriorad)\b/i.test(obs)) {
    estado_conservacion = 'regular';
  }

  // accesorios desde observaciones
  const has = (re) => re.test(obs);
  const tiene_arco = /\barco\b/.test(obs) ? !/(no tiene arco|sin arco)/i.test(obs) : null;
  const tiene_estuche = has(/estuche/) ? !/(no tiene estuche|sin estuche)/i.test(obs) : null;
  const tiene_funda = has(/\bfunda\b/) ? !/(no tiene funda|sin funda)/i.test(obs) : null;
  const tiene_hombrera = has(/hombrera|almohadilla|perrubia|barbada|mentonera/) ? true : null;

  if (/no tiene cuerda|le falta cuerda|falta.*cuerda/i.test(obs)) flags.push('falta_cuerda');
  if (/no tiene ca[ñn]a|sin ca[ñn]a/i.test(obs)) flags.push('falta_cana');
  if (/no tiene limpiador|sin limpiador/i.test(obs)) flags.push('falta_limpiador');

  return {
    estado_uso, estado_conservacion, asignado_texto, ubicacion_fisica,
    tiene_arco, tiene_estuche, tiene_funda, tiene_hombrera,
    faltantes: flags.length ? flags.join(',') : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse
// ─────────────────────────────────────────────────────────────────────────────

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
if (!wb.Sheets[SHEET]) { console.error(`Hoja "${SHEET}" no existe. Hojas: ${wb.SheetNames.join(', ')}`); process.exit(1); }
const raw = XLSX.utils.sheet_to_json(wb.Sheets[SHEET], { header: 1, raw: true, defval: null });

const instrumentos = [];
const materiales = [];
const rechazos = [];
let familiaHeader = null;
let modoMaterial = false;

for (let i = 0; i < raw.length; i++) {
  const r = raw[i] || [];
  const rec = {};
  COLS.forEach((k, j) => (rec[k] = r[j]));
  const a0 = r[0] == null ? '' : String(r[0]).trim();
  const b1 = r[1] == null ? '' : String(r[1]).trim();

  // sub-header de familia
  const headerText = (a0 + ' ' + b1).toUpperCase();
  if (/INVENTARIO\s+(DE\s+)?(INSTRUMENTOS?|MATERIAL|ACCESORIOS?|INSUMOS)/.test(headerText)) {
    familiaHeader = headerText.replace(/\s+/g, ' ').trim();
    modoMaterial = /MATERIAL|ACCESORIOS?|INSUMOS/.test(headerText);
    continue;
  }
  // fila header de columnas
  if (/^#$/.test(a0) && /INTRUMENTO|INSTRUMENTO/i.test(b1)) continue;
  // fila sin # numérico o sin instrumento
  const nNum = /^\d+$/.test(a0) || typeof r[0] === 'number';
  if (!nNum || !clean(rec.instrumento)) continue;

  if (modoMaterial) {
    materiales.push({
      familia: 'materiales', item: clean(rec.instrumento),
      marca: clean(rec.marca), modelo: clean(rec.modelo),
      cantidad: rec.serial ?? rec.tamano, // en material el layout cambia
      descripcion: clean(rec.codigo) || clean(rec.observaciones),
      fila_origen: i + 1,
      fila_json: r,
    });
    continue;
  }

  const inst = normInstrumento(rec.instrumento);
  const codigo = normCodigo(rec.codigo);
  const { marca, modelo } = normMarca(rec.marca, rec.modelo, inst.marcaExtra);
  const est = deriveEstado(rec);

  const out = {
    codigo_inventario: codigo,
    codigo_original: clean(rec.codigo),
    tipo_instrumento: inst.tipo,
    familia: inst.familia,
    instrumento_raw: inst.raw,
    tamano: reverseTamano(rec.tamano),
    tamano_original: rec.tamano instanceof Date ? rec.tamano.toISOString().slice(0, 10) : clean(rec.tamano),
    marca,
    modelo,
    numero_serie: clean(rec.serial),
    ubicacion: est.ubicacion_fisica,
    ubicacion_original: clean(rec.ubicacion),
    asignado_texto: est.asignado_texto,
    asignado_original: clean(rec.asignado),
    estado_uso: est.estado_uso,
    estado_conservacion: est.estado_conservacion,
    tiene_arco: est.tiene_arco,
    tiene_estuche: est.tiene_estuche,
    tiene_funda: est.tiene_funda,
    tiene_hombrera_almohadilla: est.tiene_hombrera,
    faltantes_detectados: est.faltantes,
    observaciones: clean(rec.observaciones),
    fila_origen: i + 1,
    _warnings: [],
  };
  if (!out.codigo_inventario) out._warnings.push('sin_codigo_valido');
  if (!out.tipo_instrumento) out._warnings.push('tipo_no_reconocido');
  if (out.asignado_texto && out.asignado_original && ASIGNADO_STATUS.test(out.asignado_original)) out._warnings.push('asignado_ambiguo');
  instrumentos.push(out);
}

// duplicados por código
const byCode = {};
instrumentos.forEach((x) => { if (x.codigo_inventario) (byCode[x.codigo_inventario] ||= []).push(x); });
const dups = Object.entries(byCode).filter(([, v]) => v.length > 1);

// ─────────────────────────────────────────────────────────────────────────────
// Salidas
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(OUT_DIR, 'instrumentos-normalizados.json'), JSON.stringify(instrumentos, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'materiales.json'), JSON.stringify(materiales, null, 2));

const count = (arr, fn) => arr.filter(fn).length;
const dist = (arr, fn) => { const d = {}; arr.forEach((x) => { const k = fn(x) ?? 'null'; d[k] = (d[k] || 0) + 1; }); return d; };

const md = [];
md.push(`# Reporte de saneamiento — inventario ${SHEET}`);
md.push(`\nFuente: \`${path.basename(XLSX_PATH)}\` · hoja \`${SHEET}\` · generado dry-run (no toca la DB)\n`);
md.push(`## Totales`);
md.push(`- Instrumentos parseados: **${instrumentos.length}**`);
md.push(`- Materiales/accesorios: **${materiales.length}**`);
md.push(`- Con código válido: ${count(instrumentos, (x) => x.codigo_inventario)} · sin código: ${count(instrumentos, (x) => !x.codigo_inventario)}`);
md.push(`- Tipo reconocido: ${count(instrumentos, (x) => x.tipo_instrumento)} · no reconocido: ${count(instrumentos, (x) => !x.tipo_instrumento)}`);
md.push(`- Con tamaño: ${count(instrumentos, (x) => x.tamano)} · con serial: ${count(instrumentos, (x) => x.numero_serie)}`);
md.push(`- Asignados a un alumno: ${count(instrumentos, (x) => x.asignado_texto)}`);
md.push(`\n## Distribuciones`);
md.push(`\n**familia**: ${JSON.stringify(dist(instrumentos, (x) => x.familia))}`);
md.push(`\n**tipo_instrumento**: ${JSON.stringify(dist(instrumentos, (x) => x.tipo_instrumento))}`);
md.push(`\n**tamano**: ${JSON.stringify(dist(instrumentos, (x) => x.tamano))}`);
md.push(`\n**estado_uso**: ${JSON.stringify(dist(instrumentos, (x) => x.estado_uso))}`);
md.push(`\n**estado_conservacion**: ${JSON.stringify(dist(instrumentos, (x) => x.estado_conservacion))}`);
md.push(`\n## Ambigüedades / revisar a mano`);
md.push(`\n### Códigos duplicados (${dups.length})`);
dups.forEach(([c, v]) => md.push(`- \`${c}\` ×${v.length}: ${v.map((x) => x.instrumento_raw + ' (fila ' + x.fila_origen + ')').join(' | ')}`));
md.push(`\n### Sin código válido (${count(instrumentos, (x) => !x.codigo_inventario)})`);
instrumentos.filter((x) => !x.codigo_inventario).forEach((x) => md.push(`- fila ${x.fila_origen}: ${x.instrumento_raw} / cod_original="${x.codigo_original}" / asignado="${x.asignado_original}"`));
md.push(`\n### Tipo no reconocido (${count(instrumentos, (x) => !x.tipo_instrumento)})`);
instrumentos.filter((x) => !x.tipo_instrumento).forEach((x) => md.push(`- fila ${x.fila_origen}: "${x.instrumento_raw}" cod=${x.codigo_inventario}`));
md.push(`\n### Materiales detectados`);
materiales.forEach((m) => md.push(`- ${m.item} · ${m.marca || ''} ${m.modelo || ''} · cant=${m.cantidad ?? '?'} · ${m.descripcion || ''}`));
fs.writeFileSync(path.join(OUT_DIR, 'reporte-saneamiento.md'), md.join('\n') + '\n');

console.log('OK. Salidas en', OUT_DIR);
console.log('  instrumentos:', instrumentos.length, '| materiales:', materiales.length, '| duplicados:', dups.length);
console.log('  sin codigo:', count(instrumentos, (x) => !x.codigo_inventario), '| tipo no reconocido:', count(instrumentos, (x) => !x.tipo_instrumento));
