import { supabase } from '../../../lib/supabaseClient.js'

// ─── RESUMEN POR ALUMNO ──────────────────────────────────────────────────────

export async function getResumenAlumnos() {
  const { data, error } = await supabase
    .from('vw_resumen_alumno')
    .select('*')
    .order('nombre_completo')

  if (error) throw new Error('No se pudo cargar el resumen de alumnos')
  return data
}

export async function getResumenAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('vw_resumen_alumno')
    .select('*')
    .eq('id', alumnoId)
    .single()

  if (error) throw new Error('No se pudo cargar el resumen del alumno')
  return data
}

// ─── RIESGO DE ABANDONO ──────────────────────────────────────────────────────

export async function getRiesgoAbandono({ nivel = null } = {}) {
  let query = supabase
    .from('vw_riesgo_abandono')
    .select('*')
    .order('score_riesgo', { ascending: false })

  if (nivel) query = query.eq('nivel_riesgo', nivel)

  const { data, error } = await query
  if (error) throw new Error('No se pudo cargar el análisis de riesgo')
  return data
}

export async function getAlumnosEnRiesgoAlto() {
  return getRiesgoAbandono({ nivel: 'alto' })
}

// ─── ALERTAS ACTIVAS ─────────────────────────────────────────────────────────

export async function getAlertasActivas({ color = null, alumnoId = null } = {}) {
  let query = supabase
    .from('vw_alertas_activas')
    .select('*')
    .order('fecha_referencia', { ascending: true })

  if (color)    query = query.eq('color', color)
  if (alumnoId) query = query.eq('alumno_id', alumnoId)

  const { data, error } = await query
  if (error) throw new Error('No se pudieron cargar las alertas')
  return data
}

export async function getAlertasRojas() {
  return getAlertasActivas({ color: 'rojo' })
}

export async function getResumenAlertas() {
  const { data, error } = await supabase
    .from('vw_alertas_activas')
    .select('color, tipo_alerta')

  if (error) throw new Error('No se pudo obtener el resumen de alertas')

  return {
    total: data.length,
    rojas:    data.filter(a => a.color === 'rojo').length,
    naranjas: data.filter(a => a.color === 'naranja').length,
    amarillas: data.filter(a => a.color === 'amarillo').length,
    porTipo:  data.reduce((acc, a) => {
      acc[a.tipo_alerta] = (acc[a.tipo_alerta] || 0) + 1
      return acc
    }, {}),
  }
}

// ─── RENDIMIENTO DE MAESTROS ─────────────────────────────────────────────────

export async function getRendimientoMaestros() {
  const { data, error } = await supabase
    .from('vw_rendimiento_maestro')
    .select('*')

  if (error) throw new Error('No se pudo cargar el rendimiento de maestros')
  return data
}

export async function getRendimientoMaestro(maestroId) {
  const { data, error } = await supabase
    .from('vw_rendimiento_maestro')
    .select('*')
    .eq('maestro_id', maestroId)
    .single()

  if (error) throw new Error('No se pudo cargar el rendimiento del maestro')
  return data
}

// ─── PATRÓN DE ASISTENCIA ────────────────────────────────────────────────────

export async function getPatronAsistencia({ instrumento = null } = {}) {
  let query = supabase
    .from('vw_patron_asistencia')
    .select('*')
    .order('dia_semana_num')

  if (instrumento) query = query.eq('instrumento_principal', instrumento)

  const { data, error } = await query
  if (error) throw new Error('No se pudo cargar el patrón de asistencia')
  return data
}

// ─── ESTADÍSTICAS POR PERÍODO ────────────────────────────────────────────────

export async function getEstadisticasPeriodos() {
  const { data, error } = await supabase
    .from('vw_estadisticas_periodo')
    .select('*')

  if (error) throw new Error('No se pudieron cargar las estadísticas por período')
  return data
}

export async function getEstadisticasPeriodoActivo() {
  const { data, error } = await supabase
    .from('vw_estadisticas_periodo')
    .select('*')
    .eq('activo', true)
    .order('fecha_inicio', { ascending: false })
    .limit(1)

  if (error) throw new Error('No se pudieron cargar las estadísticas del período activo: ' + error.message)
  return (data && data.length > 0) ? data[0] : null
}

// ─── DESTACADOS Y RIESGO ACADÉMICO ──────────────────────────────────────────

export async function getDestacadosYRiesgoAcademico({ categoria = null } = {}) {
  let query = supabase
    .from('vw_destacados_y_riesgo_academico')
    .select('*')

  if (categoria) query = query.eq('categoria', categoria)

  const { data, error } = await query
  if (error) throw new Error('No se pudo cargar el análisis académico')
  return data
}

export async function getAlumnosDestacados() {
  return getDestacadosYRiesgoAcademico({ categoria: 'destacado' })
}

export async function getAlumnosEnRiesgoAcademico() {
  return getDestacadosYRiesgoAcademico({ categoria: 'riesgo_academico' })
}

// ─── FUNCIONES CALCULADAS ────────────────────────────────────────────────────

export async function getRachaAusencias(alumnoId) {
  const { data, error } = await supabase
    .rpc('fn_racha_ausencias', { p_alumno_id: alumnoId })

  if (error) throw new Error('No se pudo calcular la racha de ausencias')
  return data
}

export async function getTasaAsistenciaPeriodo(alumnoId, desde, hasta = null) {
  const params = { p_alumno_id: alumnoId, p_desde: desde }
  if (hasta) params.p_hasta = hasta

  const { data, error } = await supabase
    .rpc('fn_tasa_asistencia_periodo', params)

  if (error) throw new Error('No se pudo calcular la tasa de asistencia')
  return data
}

export async function getCorrelacionAsistenciaRendimiento() {
  const { data, error } = await supabase
    .rpc('fn_correlacion_asistencia_rendimiento')

  if (error) throw new Error('No se pudo calcular la correlación')
  return data
}

// ─── HISTORIAL DE ESTADO ─────────────────────────────────────────────────────

export async function getHistorialEstadoAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('historial_estado_alumno')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha', { ascending: false })

  if (error) throw new Error('No se pudo cargar el historial')
  return data
}

export async function registrarCambioEstadoAlumno(alumnoId, estado, motivo, registradoPor = null) {
  const estadosValidos = ['activo', 'baja_voluntaria', 'baja_academica', 'suspendido', 'egresado']
  if (!estadosValidos.includes(estado)) throw new Error('Estado no válido')

  const { data, error } = await supabase
    .from('historial_estado_alumno')
    .insert([{
      alumno_id:     alumnoId,
      estado,
      motivo:        motivo?.trim() || null,
      registrado_por: registradoPor || null,
      fecha:         new Date().toISOString().split('T')[0],
    }])
    .select()

  if (error) throw new Error('No se pudo registrar el cambio de estado')
  return data[0]
}
