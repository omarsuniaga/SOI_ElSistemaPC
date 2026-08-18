import { supabase } from '../../../lib/supabaseClient.js'
import { timeToMinutes } from '../utils/clasesUtils.js'
import { obtenerAsistenciasPorClasesFecha } from '../../asistencias/api/asistenciasApi.js'

// Valores reales de clase_horarios.dia (text con CHECK, acentuados) —
// ver supabase/migrations 20260622_hermes_core / schema_reference.sql:215-227.
export const DIAS_SEMANA = [
  { value: 'lunes', label: 'Lun', labelLargo: 'Lunes' },
  { value: 'martes', label: 'Mar', labelLargo: 'Martes' },
  { value: 'miércoles', label: 'Mié', labelLargo: 'Miércoles' },
  { value: 'jueves', label: 'Jue', labelLargo: 'Jueves' },
  { value: 'viernes', label: 'Vie', labelLargo: 'Viernes' },
  { value: 'sábado', label: 'Sáb', labelLargo: 'Sábado' },
  { value: 'domingo', label: 'Dom', labelLargo: 'Domingo' },
]

/**
 * Día actual normalizado contra los valores acentuados reales de
 * clase_horarios.dia — Intl no basta solo, hay que mapear el índice
 * de JS Date (0=domingo) al value de la tabla.
 */
export function obtenerDiaActual() {
  const idx = new Date().getDay() // 0=domingo ... 6=sábado
  const orden = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  return orden[idx]
}

/**
 * Fecha real (YYYY-MM-DD) de la próxima ocurrencia de un día de la semana
 * (incluye hoy si coincide). clase_horarios solo guarda el día de la semana,
 * pero asistencias.fecha necesita una fecha concreta — esto resuelve cuál.
 */
export function fechaParaDia(diaValue) {
  const orden = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const idxObjetivo = orden.indexOf(diaValue)
  if (idxObjetivo === -1) return new Date().toISOString().slice(0, 10)

  const hoy = new Date()
  const idxHoy = hoy.getDay()
  const delta = (idxObjetivo - idxHoy + 7) % 7
  const objetivo = new Date(hoy)
  objetivo.setDate(hoy.getDate() + delta)
  return objetivo.toISOString().slice(0, 10)
}

// Umbral real de escalamiento — ver supabase/functions/escalate-asistencias-notifications/index.ts:34-48
// (AMARILLO 1-2 días, NARANJA 3-6 días "durante una semana", ROJO 7+ días).
export const COMPLIANCE_META = {
  VERDE: { color: '#10b981', label: 'Al día' },
  AMARILLO: { color: '#f59e0b', label: 'Recordatorio' },
  NARANJA: { color: '#f97316', label: 'Pendiente' },
  ROJO: { color: '#dc2626', label: 'Urgente' },
}

/**
 * Justifica una ausencia asegurando que el registro de asistencia quede
 * vinculado a una sesión real. La RPC mantiene ambas escrituras atómicas.
 */
export async function justificarAusencia({ claseId, alumnoId, fecha, motivo = '' }) {
  const { data, error } = await supabase.rpc('registrar_justificacion_asistencia', {
    p_clase_id: claseId,
    p_alumno_id: alumnoId,
    p_fecha: fecha,
    p_motivo: motivo,
  })

  if (error) {
    throw new Error(`No se pudo justificar la ausencia: ${error.message}`)
  }

  return data
}

/**
 * Registros de asistencia pendiente (tabla registros_pendientes, ya
 * calculada/escalada por supabase/functions/escalate-asistencias-notifications)
 * para las clases del día, indexados por clase_id. Solo existen registros
 * para sesiones que efectivamente se abrieron y quedaron sin cerrar — una
 * clase sin registro pendiente no implica necesariamente que ya se pasó
 * asistencia, solo que no hay alerta de mora activa.
 */
async function obtenerPendientesAsistencia(claseIds, fecha) {
  if (!claseIds || claseIds.length === 0) return {}

  const { data, error } = await supabase
    .from('registros_pendientes')
    .select('id, maestro_id, notification_state, created_at, sesiones_clase!inner ( clase_id, fecha )')
    .eq('tipo', 'asistencia_pendiente')
    .eq('estado', 'pendiente')
    .in('sesiones_clase.clase_id', claseIds)
    .eq('sesiones_clase.fecha', fecha)

  if (error) {
    console.error('Error cargando pendientes de asistencia:', error.message)
    return {}
  }

  return (data || []).reduce((acc, r) => {
    const claseId = r.sesiones_clase?.clase_id
    if (!claseId) return acc
    // dias_atraso no existe como columna real en la BD (la migración que la
    // definía como GENERATED ALWAYS AS (NOW()...) STORED no es válida en
    // Postgres — NOW() no es inmutable — así que nunca se aplicó). Se
    // calcula igual que supabase/functions/escalate-asistencias-notifications.
    const diasAtraso = Math.max(0, Math.ceil((Date.now() - new Date(r.created_at).getTime()) / 86400000))
    acc[claseId] = {
      registroId: r.id,
      maestroId: r.maestro_id,
      state: r.notification_state || 'VERDE',
      diasAtraso,
    }
    return acc
  }, {})
}

function estadoTemporal(horaInicio, horaFin, ahoraMin) {
  const inicioMin = timeToMinutes(horaInicio)
  const finMin = timeToMinutes(horaFin)
  if (ahoraMin >= inicioMin && ahoraMin < finMin) return 'en-curso'
  if (ahoraMin < inicioMin) return 'proxima'
  return 'pasada'
}

/**
 * Trae el feed operativo del día: horarios de clase_horarios ⋈ clases ⋈
 * salones ⋈ maestros, con nómina de alumnos matriculados por clase y KPIs
 * agregados. `diaFiltro` debe ser uno de los values de DIAS_SEMANA
 * (acentuado); si se omite usa el día real de hoy.
 */
export async function obtenerClasesDelDia(diaFiltro = null) {
  const dia = diaFiltro || obtenerDiaActual()

  const { data: horarios, error } = await supabase
    .from('clase_horarios')
    .select(`
      id,
      clase_id,
      dia,
      hora_inicio,
      hora_fin,
      salon_id,
      clases:clase_id (
        id,
        nombre,
        instrumento,
        nivel_id,
        programa_id,
        capacidad_maxima,
        activo,
        maestro_principal_id,
        maestro_suplente_id,
        niveles:nivel_id ( id, nombre ),
        maestro_principal:maestro_principal_id ( id, nombre_completo, especialidad, tlf ),
        maestro_suplente:maestro_suplente_id ( id, nombre_completo, especialidad, tlf )
      ),
      salones:salon_id ( id, nombre, capacidad, ubicacion )
    `)
    .eq('dia', dia)
    .order('hora_inicio', { ascending: true })

  if (error) {
    console.error('Error cargando clases del día:', error.message)
    throw new Error('No se pudieron cargar las clases del día')
  }

  const filas = (horarios || []).filter(h => h.clases?.activo !== false)
  const claseIds = [...new Set(filas.map(h => h.clase_id).filter(Boolean))]

  let alumnosPorClase = {}
  if (claseIds.length > 0) {
    const { data: inscripciones, error: errInsc } = await supabase
      .from('alumnos_clases')
      .select('clase_id, alumno_id, alumnos:alumno_id ( id, nombre_completo )')
      .in('clase_id', claseIds)
      .eq('activo', true)

    if (errInsc) {
      console.error('Error cargando alumnos inscritos:', errInsc.message)
    } else {
      alumnosPorClase = (inscripciones || []).reduce((acc, row) => {
        if (!acc[row.clase_id]) acc[row.clase_id] = []
        if (row.alumnos) acc[row.clase_id].push(row.alumnos)
        return acc
      }, {})
    }
  }

  const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes()
  const esHoy = dia === obtenerDiaActual()
  const fecha = fechaParaDia(dia)

  let asistenciasPorClase = {}
  let pendientesPorClase = {}
  if (claseIds.length > 0) {
    try {
      asistenciasPorClase = await obtenerAsistenciasPorClasesFecha(claseIds, fecha)
    } catch (err) {
      console.error('Error cargando asistencias precargadas:', err.message)
    }
    pendientesPorClase = await obtenerPendientesAsistencia(claseIds, fecha)
  }

  const sesiones = filas.map(h => {
    const asistenciasClase = asistenciasPorClase[h.clase_id] || {}
    const alumnos = (alumnosPorClase[h.clase_id] || []).map(a => ({
      ...a,
      estadoAsistencia: asistenciasClase[a.id]?.estado || null,
      justificacionTexto: asistenciasClase[a.id]?.justificacion_texto || null,
    }))
    return {
      horarioId: h.id,
      claseId: h.clase_id,
      dia: h.dia,
      fecha,
      horaInicio: h.hora_inicio,
      horaFin: h.hora_fin,
      nombre: h.clases?.nombre || 'Clase sin nombre',
      instrumento: h.clases?.instrumento || null,
      nivel: h.clases?.niveles?.nombre || null,
      capacidadMaxima: h.clases?.capacidad_maxima ?? null,
      salon: h.salones ? { id: h.salones.id, nombre: h.salones.nombre, ubicacion: h.salones.ubicacion } : null,
      maestroTitular: h.clases?.maestro_principal || null,
      maestroSuplente: h.clases?.maestro_suplente || null,
      alumnos,
      totalAlumnos: alumnos.length,
      justificadosCount: alumnos.filter(a => a.estadoAsistencia === 'justificado').length,
      estado: esHoy ? estadoTemporal(h.hora_inicio, h.hora_fin, ahoraMin) : 'futura',
      pendienteAsistencia: pendientesPorClase[h.clase_id] || null,
    }
  }).sort((a, b) => timeToMinutes(a.horaInicio) - timeToMinutes(b.horaInicio))

  const salonesOcupados = new Set(sesiones.filter(s => s.salon?.id).map(s => s.salon.id))

  const kpis = {
    totalClases: sesiones.length,
    enCursoAhora: sesiones.filter(s => s.estado === 'en-curso').length,
    totalAlumnos: sesiones.reduce((acc, s) => acc + s.totalAlumnos, 0),
    salonesOcupados: salonesOcupados.size,
    justificadosHoy: sesiones.reduce((acc, s) => acc + s.justificadosCount, 0),
    asistenciaPendiente: sesiones.filter(s => s.pendienteAsistencia).length,
  }

  return { dia, fecha, esHoy, sesiones, kpis }
}
