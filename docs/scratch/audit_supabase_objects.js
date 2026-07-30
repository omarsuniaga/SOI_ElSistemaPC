import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function runAudit() {
  console.log('=== INICIANDO AUDITORÍA DE OBJETOS EN SUPABASE ===\n')

  const tablesToCheck = [
    // Tablas a eliminar (_limpieza)
    'plan_indicator_links',
    'plan_indicadores',
    'plan_objetivos',
    'plan_temas',
    'plan_niveles',
    'plan_clases',
    'planificacion_nodos',
    // Tablas del rediseño (_tablas)
    'class_curriculum_plan',
    'clase_objetivos',
    'evaluacion_indicador'
  ]

  console.log('--- 1. VERIFICACIÓN DE TABLAS ---')
  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log(`❌ Tabla [${table}]: NO EXISTE en Supabase`)
        } else {
          console.log(`⚠️ Tabla [${table}]: Error (${error.code}) - ${error.message}`)
        }
      } else {
        console.log(`✅ Tabla [${table}]: EXISTE (Filas: ${count ?? 0})`)
      }
    } catch (err) {
      console.log(`⚠️ Tabla [${table}]: Excepción - ${err.message}`)
    }
  }

  console.log('\n--- 2. VERIFICACIÓN DE COLUMNAS EN planificaciones ---')
  try {
    const { data, error } = await supabase
      .from('planificaciones')
      .select('id, route_version_id, class_curriculum_plan_id')
      .limit(1)

    if (error) {
      console.log(`⚠️ Error consultando columnas de planificaciones: ${error.message}`)
    } else {
      console.log(`✅ Columnas route_version_id y class_curriculum_plan_id EXISTEN en planificaciones`)
    }
  } catch (err) {
    console.log(`❌ Columnas de planificaciones NO EXISTEN o falló consulta: ${err.message}`)
  }

  console.log('\n--- 3. VERIFICACIÓN DE FUNCIONES RPC ---')
  const rpcsToCheck = [
    { name: 'fn_obtener_ruta_por_clase', args: { p_clase_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'fn_evaluacion_indicadores_por_clase', args: { p_clase_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'fn_registrar_evaluacion_indicador', args: {} }
  ]

  for (const rpc of rpcsToCheck) {
    try {
      const { data, error } = await supabase.rpc(rpc.name, rpc.args)
      if (error && (error.code === '42883' || error.message.includes('function') || error.message.includes('does not exist'))) {
        console.log(`❌ RPC [${rpc.name}]: NO EXISTE`)
      } else {
        console.log(`✅ RPC [${rpc.name}]: EXISTE (Respuesta / Error de ejecución esperado)`)
      }
    } catch (err) {
      console.log(`⚠️ RPC [${rpc.name}]: Excepción - ${err.message}`)
    }
  }

  console.log('\n=== AUDITORÍA COMPLETADA ===')
}

runAudit().catch(console.error)
