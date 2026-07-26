import { supabase } from '../../../lib/supabaseClient.js'

/**
 * API del Informe Ejecutivo de Cierre de Semestre.
 *
 * Reemplaza a `obtenerAuditoriaCierrePeriodo`, que agrupaba por
 * `sesiones_clase.maestro_id` — un campo que guarda al AUTOR del registro, no al
 * docente de la clase — y leía columnas que nunca pidió en su `select`.
 *
 * Todo el cálculo vive en SQL (`fn_reporte_cierre_semestre`). Aquí solo se invoca
 * y se normaliza la respuesta. La regla que gobierna este módulo:
 *
 *     donde no hay evidencia se devuelve SIN_DATOS, nunca 0 % ni 100 %.
 *
 * Un indicador que rellena huecos con un número redondo se lee como un hecho.
 */

/** Estados que un bloque del informe puede declarar sobre sí mismo. */
export const ESTADO = {
  EVALUABLE: 'EVALUABLE',
  PARCIAL: 'PARCIAL',
  SIN_DATOS: 'SIN_DATOS',
  SIN_EVALUACION: 'SIN_EVALUACION',
  SIN_ASISTENCIA: 'SIN_ASISTENCIA',
  SIN_CLASES_ASIGNADAS: 'SIN_CLASES_ASIGNADAS',
  REQUIERE_VALIDACION: 'REQUIERE_VALIDACION',
  CORREGIDA_EN_LECTURA: 'CORREGIDA_EN_LECTURA',
}

/** Veredictos de promoción. */
export const VEREDICTO = {
  PROMUEVE: 'PROMUEVE',
  NO_PROMUEVE: 'NO_PROMUEVE',
  SIN_EVALUACION: 'SIN_EVALUACION',
  SIN_ASISTENCIA: 'SIN_ASISTENCIA',
  SIN_DATOS: 'SIN_DATOS',
}

/**
 * Formatea un porcentaje que puede ser null.
 * Devuelve el marcador textual en vez de un número inventado: el `|| 100` que
 * vivía en la vista anterior convertía un 0 % real en un 100 % ficticio.
 */
export function fmtPct(valor, marcador = 'Sin datos') {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return marcador
  return `${Number(valor).toFixed(1).replace(/\.0$/, '')}%`
}

/** Clasificación de eficiencia docente. Devuelve null si no hay base para clasificar. */
export function clasificarDocente(pct, estadoEvaluacion) {
  if (estadoEvaluacion && estadoEvaluacion !== ESTADO.EVALUABLE) {
    return { nivel: estadoEvaluacion, badge: 'Sin evaluar', color: '#94a3b8', tone: 'secondary' }
  }
  if (pct === null || pct === undefined) {
    return { nivel: ESTADO.SIN_DATOS, badge: 'Sin datos', color: '#94a3b8', tone: 'secondary' }
  }
  if (pct >= 90) return { nivel: 'EFICIENTE',  badge: 'Eficiente',  color: '#10b981', tone: 'success' }
  if (pct >= 75) return { nivel: 'ACEPTABLE',  badge: 'Aceptable',  color: '#3b82f6', tone: 'primary' }
  if (pct >= 50) return { nivel: 'REGULAR',    badge: 'Regular',    color: '#f59e0b', tone: 'warning' }
  return { nivel: 'INSOLVENTE', badge: 'Insolvente', color: '#ef4444', tone: 'danger' }
}

/**
 * Obtiene el informe completo del período.
 *
 * Lanza las dos RPC en paralelo: el informe núcleo describe lo ocurrido, los
 * indicadores adicionales describen la capacidad de medirlo. Están separados
 * para que un hueco de instrumentación no se lea como un resultado académico.
 *
 * @param {string} periodoId
 * @param {object} [opciones]
 * @param {number} [opciones.escalaCalificacion=5]  Escala de progresos.calificacion.
 * @param {number} [opciones.umbralNotaPct=70]      Aprobación en % de la escala.
 * @param {number} [opciones.umbralAsistenciaPct=75]
 * @param {number} [opciones.diasGraciaRegistro=2]
 */
export async function obtenerReporteCierre(periodoId, opciones = {}) {
  if (!periodoId) throw new Error('Se requiere el identificador del período')

  const {
    escalaCalificacion = 5,
    umbralNotaPct = 70,
    umbralAsistenciaPct = 75,
    diasGraciaRegistro = 2,
  } = opciones

  const [nucleo, adicionales] = await Promise.all([
    supabase.rpc('fn_reporte_cierre_semestre', {
      p_periodo_id: periodoId,
      p_escala_calificacion: escalaCalificacion,
      p_umbral_nota_pct: umbralNotaPct,
      p_umbral_asistencia_pct: umbralAsistenciaPct,
      p_dias_gracia_registro: diasGraciaRegistro,
    }),
    supabase.rpc('fn_reporte_indicadores_adicionales', { p_periodo_id: periodoId }),
  ])

  if (nucleo.error) {
    throw new Error(`No se pudo generar el informe de cierre: ${nucleo.error.message}`)
  }
  if (!nucleo.data) {
    throw new Error('El informe de cierre regresó vacío')
  }

  // Los indicadores adicionales son complementarios: si fallan, el informe núcleo
  // sigue siendo válido. Se degrada el bloque, no el documento entero.
  const indicadores = adicionales.error
    ? { _error: adicionales.error.message }
    : adicionales.data

  return normalizarReporte(nucleo.data, indicadores)
}

/**
 * Normaliza el payload de las RPC a la forma que consumen la vista y el PDF.
 * Garantiza que los arreglos existan aunque vengan nulos, para que el consumidor
 * nunca tenga que defenderse con `|| []` disperso por todo el render.
 */
export function normalizarReporte(nucleo, indicadores = null) {
  const promocion = Array.isArray(nucleo.promocion) ? nucleo.promocion : []

  return {
    meta: nucleo.meta ?? {},
    periodo: nucleo.resumen?.periodo ?? {},
    resumen: nucleo.resumen ?? {},
    docentes: Array.isArray(nucleo.docentes) ? nucleo.docentes : [],
    clases: Array.isArray(nucleo.clases) ? nucleo.clases : [],
    asistencia: nucleo.asistencia ?? {},
    alumnosRiesgo: Array.isArray(nucleo.alumnos_riesgo) ? nucleo.alumnos_riesgo : [],
    promocion,
    promocionTotales: nucleo.promocion_totales ?? {},
    instrumentos: nucleo.instrumentos ?? {},
    brechas: Array.isArray(nucleo.brechas) ? nucleo.brechas : [],
    calidadDatos: nucleo.calidad_datos ?? {},
    indicadores: indicadores ?? {},

    // Derivados de conveniencia. Se calculan aquí y no en el render para que la
    // vista y el PDF no puedan divergir en la definición de lo mismo.
    docentesEvaluables: (nucleo.docentes ?? []).filter(d => d.estado_evaluacion === ESTADO.EVALUABLE),
    clasesConAlerta: (nucleo.clases ?? []).filter(c => c.alerta_reconciliacion),
    promocionEvaluada: promocion.filter(
      p => p.veredicto === VEREDICTO.PROMUEVE || p.veredicto === VEREDICTO.NO_PROMUEVE
    ),
  }
}

/**
 * Lista los períodos disponibles para reportar, más recientes primero.
 */
export async function listarPeriodosReportables() {
  const { data, error } = await supabase
    .from('periodos')
    .select('id, nombre, fecha_inicio, fecha_fin, activo, cerrado')
    .order('fecha_inicio', { ascending: false })

  if (error) throw new Error('No se pudieron cargar los períodos')
  return data ?? []
}

/**
 * Persiste el informe como snapshot inmutable en `periodos_cierre_auditoria`.
 *
 * Se apoya en `fn_cerrar_periodo_academico`, que ya existía en la base y que el
 * módulo nunca invocaba. Un informe de directiva debe seguir diciendo lo mismo
 * dentro de dos años aunque los datos de origen cambien: por eso se archiva el
 * resultado, no se recalcula al abrirlo.
 */
export async function cerrarPeriodoConSnapshot(periodoId, { observaciones = null } = {}) {
  const { data: sesion } = await supabase.auth.getUser()

  const { data, error } = await supabase.rpc('fn_cerrar_periodo_academico', {
    p_periodo_id: periodoId,
    p_cerrado_por: sesion?.user?.id ?? null,
    p_observaciones: observaciones,
  })

  if (error) throw new Error(`No se pudo cerrar el período: ${error.message}`)
  return data
}

/**
 * Activa un período de forma atómica.
 *
 * La implementación anterior hacía dos requests separados y descartaba el error
 * del primero: si el segundo fallaba, el sistema quedaba SIN ningún período
 * activo. `fn_activar_periodo` resuelve el corte en una sola transacción.
 */
export async function activarPeriodoAtomico(periodoId) {
  const { data, error } = await supabase.rpc('fn_activar_periodo', {
    p_periodo_id: periodoId,
  })

  if (error) throw new Error(`No se pudo activar el período: ${error.message}`)
  return data
}
