/**
 * gen-migration-fase3-materiales.cjs — Fase 3: tabla inventario_materiales +
 * carga de los materiales/accesorios/insumos de la hoja AGOSTO 2026.
 *
 * Estos son consumibles a granel (cañas, aceites, cepillos, baquetas) que no
 * son un instrumento asignable (inventario_activos) ni un accesorio de un
 * instrumento específico (inventario_accesorios).
 *
 * NO aplica nada. Escribe un archivo de migración para revisión.
 */
const path = require('path');
const fs = require('fs');

const OUT_SQL = process.argv[2] || path.join(__dirname, '../../supabase/migrations/20260907062000_inventario_materiales.sql');
const materiales = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/materiales.json'), 'utf8'));

const sqlStr = (v) => (v == null || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const sqlNum = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? 'NULL' : Number(v));

function parseCantidad(raw) {
  if (raw == null) return { cantidad: null, unidad: null };
  const s = String(raw).trim();
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(?:\(([^)]+)\))?/);
  if (!m) return { cantidad: null, unidad: s || null };
  const n = Number(m[1]);
  let u = 'unidad';
  if (m[2]) {
    const p = m[2].toLowerCase();
    if (/par/.test(p)) u = 'par';
    else if (/juego/.test(p)) u = 'juego';
    else u = p;
  }
  return { cantidad: n, unidad: u };
}

function categoria(item) {
  const s = item.toLowerCase();
  if (/ca[ñn]a/.test(s)) return 'cana';
  if (/aceite|grasa|lubric/.test(s)) return 'lubricante';
  if (/baqueta|mazo|palillo/.test(s)) return 'baqueta';
  if (/cepillo|limpiador|kit de limpieza|snake/.test(s)) return 'limpieza';
  if (/afinador/.test(s)) return 'electronico';
  if (/sordina|clavija|bolso|correa/.test(s)) return 'accesorio';
  if (/spray|ensave/.test(s)) return 'limpieza';
  return 'otro';
}

function familia(item, descripcion) {
  const s = (item + ' ' + (descripcion || '')).toLowerCase();
  if (/clarinete|oboe|fagot|saxof|corcho/.test(s)) return 'maderas';
  if (/tromb|trompeta|corneta|corno|tuba|vara|valvula|rotor|\bbomba/.test(s)) return 'metales';
  if (/xilofono|timpani|redoblante|redoble|percusion|marimba/.test(s)) return 'percusion';
  if (/cello|violin|viola|contrabajo|clavija/.test(s)) return 'cuerdas';
  return null;
}

const rows = materiales.map((m) => {
  const { cantidad, unidad } = parseCantidad(m.cantidad);
  const nombre = [m.marca, m.modelo].filter(Boolean).join(' ') || null;
  return {
    item: m.item,
    categoria: categoria(m.item),
    familia_instrumento: familia(m.item, m.descripcion),
    marca: m.marca || null,
    modelo: m.modelo || null,
    cantidad,
    unidad,
    descripcion: m.descripcion || null,
  };
});

const L = [];
L.push('-- Saneamiento de inventario — Fase 3: materiales / consumibles / insumos');
L.push('-- Fuente: INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx, hoja AGOSTO 2026');
L.push('-- Consumibles a granel que no son instrumentos (inventario_activos) ni');
L.push('-- accesorios de un instrumento puntual (inventario_accesorios).');
L.push('');
L.push('BEGIN;');
L.push('');
L.push('CREATE TABLE IF NOT EXISTS public.inventario_materiales (');
L.push('  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),');
L.push('  item text NOT NULL,');
L.push('  categoria text,');
L.push('  familia_instrumento text,');
L.push('  marca text,');
L.push('  modelo text,');
L.push('  cantidad numeric,');
L.push("  unidad text NOT NULL DEFAULT 'unidad',");
L.push('  descripcion text,');
L.push('  ubicacion text,');
L.push('  activo boolean NOT NULL DEFAULT true,');
L.push('  fuente_importacion text,');
L.push('  created_at timestamptz NOT NULL DEFAULT now(),');
L.push('  updated_at timestamptz NOT NULL DEFAULT now()');
L.push(');');
L.push('');
L.push('ALTER TABLE public.inventario_materiales ENABLE ROW LEVEL SECURITY;');
L.push('');
L.push('DROP POLICY IF EXISTS materiales_authenticated_select ON public.inventario_materiales;');
L.push("CREATE POLICY materiales_authenticated_select ON public.inventario_materiales FOR SELECT TO authenticated USING (true);");
L.push('DROP POLICY IF EXISTS materiales_admin_insert ON public.inventario_materiales;');
L.push("CREATE POLICY materiales_admin_insert ON public.inventario_materiales FOR INSERT TO authenticated WITH CHECK (es_admin());");
L.push('DROP POLICY IF EXISTS materiales_admin_update ON public.inventario_materiales;');
L.push("CREATE POLICY materiales_admin_update ON public.inventario_materiales FOR UPDATE TO authenticated USING (es_admin());");
L.push('DROP POLICY IF EXISTS materiales_admin_delete ON public.inventario_materiales;');
L.push("CREATE POLICY materiales_admin_delete ON public.inventario_materiales FOR DELETE TO authenticated USING (es_admin());");
L.push('');
L.push('GRANT SELECT ON public.inventario_materiales TO authenticated;');
L.push('GRANT INSERT, UPDATE, DELETE ON public.inventario_materiales TO authenticated;');
L.push('');
L.push('-- Carga inicial (idempotente por item+marca+modelo mientras no haya código propio)');
L.push('INSERT INTO public.inventario_materiales (item, categoria, familia_instrumento, marca, modelo, cantidad, unidad, descripcion, fuente_importacion)');
L.push('SELECT * FROM (VALUES');
L.push(rows.map((r) =>
  `  (${sqlStr(r.item)}, ${sqlStr(r.categoria)}, ${sqlStr(r.familia_instrumento)}, ${sqlStr(r.marca)}, ${sqlStr(r.modelo)}, ${sqlNum(r.cantidad)}::numeric, ${sqlStr(r.unidad || 'unidad')}, ${sqlStr(r.descripcion)}, 'xlsx-agosto-2026')`
).join(',\n'));
L.push(') AS v(item, categoria, familia_instrumento, marca, modelo, cantidad, unidad, descripcion, fuente_importacion)');
L.push('WHERE NOT EXISTS (');
L.push('  SELECT 1 FROM public.inventario_materiales m');
L.push('  WHERE m.item = v.item AND m.marca IS NOT DISTINCT FROM v.marca AND m.modelo IS NOT DISTINCT FROM v.modelo');
L.push(');');
L.push('');
L.push('COMMIT;');

fs.writeFileSync(OUT_SQL, L.join('\n') + '\n');
console.log('Migración Fase 3:', OUT_SQL);
console.log('  materiales:', rows.length);
const cats = {}; rows.forEach((r) => (cats[r.categoria] = (cats[r.categoria] || 0) + 1));
console.log('  por categoría:', JSON.stringify(cats));
