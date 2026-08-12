/**
 * Script de Verificación y Reseteo para Inicio de Período (10 de Agosto 2026)
 * 
 * Uso:
 *   node scripts/reset_produccion_periodo_20260810.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Cargar .env o .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envPath = path.resolve(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetPeriodoProduccion() {
  console.log('🚀 Iniciando reseteo a 0 para el período que arranca el 10 de Agosto de 2026...\n')

  const FECHA_CORTE = '2026-08-10'

  try {
    // 1. Limpieza de asistencias anteriores
    console.log('1️⃣ Limpiando asistencias y sesiones anteriores al', FECHA_CORTE)
    const { error: errAsist } = await supabase
      .from('asistencias')
      .delete()
      .lt('fecha', FECHA_CORTE)
    if (errAsist) console.warn('   ⚠️ Asistencias:', errAsist.message)
    else console.log('   ✅ Asistencias previas eliminadas.')

    const { error: errSesiones } = await supabase
      .from('sesiones_clase')
      .delete()
      .lt('fecha', FECHA_CORTE)
    if (errSesiones) console.warn('   ⚠️ Sesiones:', errSesiones.message)
    else console.log('   ✅ Sesiones previas eliminadas.')

    // 2. Limpieza de progresos y evaluaciones
    console.log('\n2️⃣ Reseteando evaluaciones y progresos de alumnos...')
    const { error: errProgresos } = await supabase
      .from('progresos')
      .delete()
      .lt('fecha_evaluacion', FECHA_CORTE)
    if (errProgresos) console.warn('   ⚠️ Progresos:', errProgresos.message)
    else console.log('   ✅ Progresos previos eliminados.')

    const { error: errEI } = await supabase
      .from('evaluacion_indicador')
      .delete()
      .lt('created_at', `${FECHA_CORTE}T00:00:00Z`)
    if (errEI) console.warn('   ⚠️ Evaluacion_indicador:', errEI.message)
    else console.log('   ✅ Evaluaciones por indicador previas eliminadas.')

    const { error: errAttempts } = await supabase
      .from('indicator_attempts')
      .delete()
      .lt('created_at', `${FECHA_CORTE}T00:00:00Z`)
    if (errAttempts) console.warn('   ⚠️ Indicator_attempts:', errAttempts.message)
    else console.log('   ✅ Intentos de indicadores eliminados.')

    // 3. Reset de rachas y promedios en alumnos
    console.log('\n3️⃣ Reiniciando rachas y promedios de notas a cero...')
    const { error: errRachas } = await supabase
      .from('rachas')
      .update({ racha_actual: 0, racha_maxima: 0, ultima_fecha_activa: null })
      .gte('racha_actual', 0)
    if (errRachas) console.warn('   ⚠️ Rachas:', errRachas.message)
    else console.log('   ✅ Rachas reiniciadas a 0.')

    const { error: errAlumnos } = await supabase
      .from('alumnos')
      .update({ promedio_notas: null })
      .not('id', 'is', null)
    if (errAlumnos) console.warn('   ⚠️ Promedios alumnos:', errAlumnos.message)
    else console.log('   ✅ Promedios acumulados de alumnos reiniciados.')

    // 4. Reset Cumplimiento de Maestros
    console.log('\n4️⃣ Reseteando Cumplimiento de Maestros y registros pendientes...')
    const { error: errRP } = await supabase
      .from('registros_pendientes')
      .delete()
      .lt('created_at', `${FECHA_CORTE}T00:00:00Z`)
    if (errRP) console.warn('   ⚠️ Registros pendientes:', errRP.message)
    else console.log('   ✅ Registros pendientes previos eliminados.')

    const { error: errNotif } = await supabase
      .from('notificaciones')
      .delete()
      .lt('created_at', `${FECHA_CORTE}T00:00:00Z`)
    if (errNotif) console.warn('   ⚠️ Notificaciones:', errNotif.message)
    else console.log('   ✅ Notificaciones previas eliminadas.')

    const { error: errMD } = await supabase
      .from('maestro_desempeno')
      .delete()
      .not('id', 'is', null)
    if (errMD) console.warn('   ⚠️ Maestro desempeño:', errMD.message)
    else console.log('   ✅ Historial de desempeño de maestros reiniciado.')

    // 5. Configurar Período Académico Activo
    console.log('\n5️⃣ Configurando Período Académico Activo desde', FECHA_CORTE)
    await supabase.from('periodos').update({ activo: false }).eq('activo', true)
    
    const { data: periodoExistente } = await supabase
      .from('periodos')
      .select('id')
      .eq('fecha_inicio', FECHA_CORTE)
      .maybeSingle()

    if (periodoExistente) {
      await supabase.from('periodos').update({ activo: true }).eq('id', periodoExistente.id)
      console.log('   ✅ Período existente activado:', periodoExistente.id)
    } else {
      const { data: nuevoPeriodo, error: errPer } = await supabase
        .from('periodos')
        .insert([{
          nombre: 'Período Académico 2026-2',
          fecha_inicio: FECHA_CORTE,
          fecha_fin: '2026-12-18',
          activo: true
        }])
        .select()
        .single()
      if (errPer) console.warn('   ⚠️ Período:', errPer.message)
      else console.log('   ✅ Nuevo período activo creado:', nuevoPeriodo.nombre)
    }

    console.log('\n🎉 ¡Reset de inicio de producción completado con éxito!')
  } catch (err) {
    console.error('❌ Error general durante el reseteo:', err)
  }
}

resetPeriodoProduccion()
