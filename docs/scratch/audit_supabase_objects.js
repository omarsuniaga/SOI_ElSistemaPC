// Auditoría CLIENT-SIDE de objetos en Supabase.
// Sirve para comprobar qué ve la APP real (PostgREST + cache de esquema),
// NO el estado físico de la base de datos.
// Fuente de verdad para el estado físico: Management API (pg_tables / pg_proc).
//
// Códigos de "no existe" que puede devolver PostgREST:
//   - 42P01    : la relación no existe en PostgreSQL (llegó a ejecutarse SQL)
//   - PGRST205 : la tabla no está en el cache de esquema de PostgREST
//   - PGRST202 : la función RPC no está en el cache de esquema de PostgREST
//   - 42883    : la función no existe en PostgreSQL
// NOTA: con supabase-js, `select('*', { head: true })` sobre una tabla ausente
// puede devolver falsos "EXISTE (0 filas)"; por eso aquí se usa GET real.
import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

function tableMissing(error) {
  if (!error) return false
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /does not exist|relation/i.test(error.message || '')
  )
}

function rpcMissing(error) {
  if (!error) return false
  return (
    error.code === '42883' ||
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    /does not exist|function/i.test(error.message || '')
  )
}

async function runAudit() {
  console.log('=== AUDITORÍA CLIENT-SIDE (lo que ve la app vía PostgREST) ===\n')

  const tablesToCheck = [
    // Tablas a eliminar (_limpieza)
    'plan_indicator_links',
    'plan_indicadores',
    'plan_objetivos',
    'plan_temas',
    'plan_niveles',
    'plan_clases',
    'planificacion_nodos',
    // Tablas del rediseño (_tablas) — NO deben existir
    'class_curriculum_plan',
    'clase_objetivos',
    'evaluacion_indicador'
  ]

  console.log('--- 1. VERIFICACIÓN DE TABLAS (GET real, sin head) ---')
  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('id').limit(1)
    if (tableMissing(error)) {
      console.log(`❌ Tabla [${table}]: NO EXISTE para la app (${error.code})`)
    } else if (error) {
      console.log(`⚠️ Tabla [${table}]: existe o falló con permiso (${error.code}) - ${error.message}`)
    } else {
      console.log(`✅ Tabla [${table}]: EXISTE (filas visibles: ${data.length})`)
    }
  }

  console.log('\n--- 2. VERIFICACIÓN DE COLUMNAS EN planificaciones ---')
  try {
    const { error } = await supabase
      .from('planificaciones')
      .select('id, route_version_id, class_curriculum_plan_id')
      .limit(1)
    if (!error) {
      console.log('⚠️ Columnas route_version_id/class_curriculum_plan_id EXISTEN (rediseño aplicado)')
    } else if (/route_version_id|class_curriculum_plan_id/.test(error.message || '')) {
      console.log('✅ CONFIRMADO: columnas rediseño NO existen → el fix del modelo (omitirlas si null) es correcto')
    } else {
      console.log(`⚠️ Error consultando planificaciones: ${error.message}`)
    }
  } catch (err) {
    console.log(`❌ Falló consulta a planificaciones: ${err.message}`)
  }

  console.log('\n--- 3. VERIFICACIÓN DE FUNCIONES RPC ---')
  const rpcsToCheck = [
    { name: 'fn_obtener_ruta_por_clase', args: { p_clase_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'fn_evaluacion_indicadores_por_clase', args: { p_clase_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'fn_registrar_evaluacion_indicador', args: {} },
    { name: 'fn_sincronizar_arbol_curricular', args: { p_clase_id: '00000000-0000-0000-0000-000000000000', p_nombre: 'audit', p_objetivos: [] } }
  ]

  for (const rpc of rpcsToCheck) {
    const { data, error } = await supabase.rpc(rpc.name, rpc.args)
    if (rpcMissing(error)) {
      console.log(`❌ RPC [${rpc.name}]: NO EXISTE para la app (${error.code})`)
    } else if (error) {
      console.log(`✅ RPC [${rpc.name}]: EXISTE — gate de autorización respondió (${error.code}: ${error.message})`)
    } else {
      console.log(`✅ RPC [${rpc.name}]: EXISTE y ejecutó (respuesta: ${JSON.stringify(data)})`)
    }
  }

  console.log('\n=== AUDITORÍA COMPLETADA ===')
}

runAudit().catch(console.error)
