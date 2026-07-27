import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Calendario lectivo: qué días hay actividad académica y cuáles no.
 *
 * Antes de este módulo, "¿hay clases hoy?" se respondía de tres formas distintas
 * y desconectadas entre sí: el rango del período, un evento del calendario
 * institucional cuyo título contuviera la palabra RECESO, y un flag de ingesta de
 * WhatsApp reutilizado como interruptor de vacaciones. Ahora la única fuente es
 * `periodos` + `periodo_excepciones`, expuesta por fn_es_dia_lectivo.
 */

export const TIPO_EXCEPCION = {
  feriado: 'Feriado',
  receso: 'Receso',
  suspension: 'Suspensión',
  institucional: 'Actividad institucional',
  otra: 'Otra',
}

export const SEMAFORO = {
  VERDE: { tone: 'success', label: 'Listo para cerrar' },
  AMARILLO: { tone: 'warning', label: 'Casi completo' },
  ROJO: { tone: 'danger', label: 'Registros incompletos' },
  SIN_SESIONES: { tone: 'secondary', label: 'Sin sesiones registradas' },
}

/** ¿Es día lectivo? Devuelve el estado con el motivo legible. */
export async function estadoCalendario(fecha = null) {
  const { data, error } = await supabase.rpc('fn_estado_calendario',
    fecha ? { p_fecha: fecha } : {})

  if (error) throw new Error(`No se pudo consultar el calendario: ${error.message}`)
  return data
}

/**
 * Excepciones al calendario, opcionalmente filtradas por período.
 * Incluye siempre las globales (periodo_id null), que son los feriados
 * nacionales cargados una vez y no semestre a semestre.
 */
export async function listarExcepciones(periodoId = null) {
  let q = supabase
    .from('periodo_excepciones')
    .select('id, periodo_id, fecha_inicio, fecha_fin, motivo, tipo, created_at')
    .order('fecha_inicio', { ascending: true })

  if (periodoId) q = q.or(`periodo_id.eq.${periodoId},periodo_id.is.null`)

  const { data, error } = await q
  if (error) throw new Error(`No se pudieron cargar las excepciones: ${error.message}`)
  return data ?? []
}

export async function crearExcepcion({ periodoId = null, fechaInicio, fechaFin, motivo, tipo = 'feriado' }) {
  if (!fechaInicio) throw new Error('La fecha de inicio es obligatoria')
  if (!motivo?.trim()) throw new Error('El motivo es obligatorio')

  const fin = fechaFin || fechaInicio
  if (new Date(fin) < new Date(fechaInicio)) {
    throw new Error('La fecha de fin no puede ser anterior a la de inicio')
  }

  const { data: sesion } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('periodo_excepciones')
    .insert([{
      periodo_id: periodoId,
      fecha_inicio: fechaInicio,
      fecha_fin: fin,
      motivo: motivo.trim(),
      tipo,
      creado_por: sesion?.user?.id ?? null,
    }])
    .select()

  if (error) throw new Error(`No se pudo crear la excepción: ${error.message}`)
  return data?.[0]
}

export async function eliminarExcepcion(id) {
  const { error } = await supabase.from('periodo_excepciones').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar la excepción: ${error.message}`)
  return true
}

/** Semáforo de completitud previo al cierre formal. */
export async function validarCierre(periodoId) {
  const { data, error } = await supabase.rpc('fn_validar_cierre_periodo', {
    p_periodo_id: periodoId,
  })

  if (error) throw new Error(`No se pudo validar el período: ${error.message}`)
  return data
}

/**
 * Cierre formal del período.
 *
 * `forzar` sólo debe usarse cuando el semáforo no está en verde y existe una
 * razón institucional para cerrar igual. La justificación es obligatoria en ese
 * caso y queda archivada junto al detalle de lo que faltaba: quien lea el cierre
 * dentro de dos años debe poder saber qué se dio por bueno y por qué.
 */
export async function cerrarPeriodo(periodoId, { observaciones = null, forzar = false } = {}) {
  if (forzar && !observaciones?.trim()) {
    throw new Error('El cierre forzado requiere una justificación escrita')
  }

  const { data: sesion } = await supabase.auth.getUser()

  const { data, error } = await supabase.rpc('fn_cerrar_periodo_academico', {
    p_periodo_id: periodoId,
    p_cerrado_por: sesion?.user?.id ?? null,
    p_observaciones: observaciones,
    p_forzar: forzar,
  })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Anula sesiones generadas en días no lectivos.
 * Corre en simulación por defecto: nada se modifica hasta pasar dryRun = false.
 */
export async function anularSesionesNoLectivas({ dryRun = true, desde = null, hasta = null } = {}) {
  const { data, error } = await supabase.rpc('fn_anular_sesiones_no_lectivas', {
    p_dry_run: dryRun,
    p_desde: desde,
    p_hasta: hasta,
  })

  if (error) throw new Error(`No se pudo procesar la anulación: ${error.message}`)
  return data
}
