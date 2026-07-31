/**
 * EstrellasObjetivo.js — Espejo puro (sin base de datos) del algoritmo SQL de
 * `vw_clase_objetivo_estrellas`
 * (supabase/migrations/20260731000004_mapa_estrellas_view.sql).
 *
 * La vista jamás escribe una estrella: se deriva en SQL. Esta función espejo
 * existe para poder testear las reglas de negocio (REQ-06/07/08) sin una base
 * de datos real; cualquier cambio al algoritmo SQL debe reflejarse acá
 * también (mismo patrón que domain/IdJerarquico.js para la migración #2).
 *
 * Reglas (spec.md REQ-07/08, design.md Decisión 5):
 * - "Superador" = alumno con TODOS los indicadores REQUERIDOS y NO
 *   archivados del objetivo evaluados con nota >= 3.
 * - Un indicador sin evaluar para un alumno lo EXCLUYE del promedio — nunca
 *   cuenta como 0 (REQ-07, escenario "Indicador incompleto no penaliza").
 * - Bandas de estrellas sobre el promedio de los alumnos superadores:
 *     3.0–3.4 -> 1★, 3.5–4.2 -> 2★, 4.3–5.0 -> 3★.
 * - `estadoVisual` es 'en_progreso' (nunca "0★") mientras nadie haya
 *   superado el objetivo (REQ-08).
 */

/**
 * @param {Object} params
 * @param {number} params.totalIndicadores
 * @param {number} params.indicadoresEvaluados
 * @returns {number} porcentaje de avance, 0-100, redondeado a 1 decimal
 */
export function calcularPctAvance({ totalIndicadores, indicadoresEvaluados }) {
  if (!Number.isInteger(totalIndicadores) || totalIndicadores <= 0) return 0
  const pct = (indicadoresEvaluados / totalIndicadores) * 100
  return Math.round(pct * 10) / 10
}

/**
 * @param {Object} params
 * @param {Array<string>} params.indicadoresRequeridos - ids de indicadores
 *   requeridos y no archivados del objetivo
 * @param {Array<{indicadorId: string, nota: number}>} params.evaluaciones -
 *   evaluaciones del alumno (puede incluir indicadores fuera del objetivo;
 *   se filtran acá)
 * @returns {boolean}
 */
export function esAlumnoSuperador({ indicadoresRequeridos, evaluaciones }) {
  if (!Array.isArray(indicadoresRequeridos) || indicadoresRequeridos.length === 0) return false
  const notaPorIndicador = new Map((evaluaciones || []).map((e) => [e.indicadorId, e.nota]))
  return indicadoresRequeridos.every((id) => {
    const nota = notaPorIndicador.get(id)
    return nota != null && nota >= 3
  })
}

/**
 * @param {number|null} promedio
 * @returns {0|1|2|3}
 */
export function bandaEstrellas(promedio) {
  if (promedio == null) return 0
  if (promedio >= 4.3) return 3
  if (promedio >= 3.5) return 2
  if (promedio >= 3.0) return 1
  return 0
}

/**
 * Espejo completo de una fila de vw_clase_objetivo_estrellas.
 *
 * @param {Object} params
 * @param {Array<string>} params.indicadoresRequeridos - ids de indicadores
 *   requeridos y no archivados del objetivo (define totalIndicadores)
 * @param {Record<string, Array<{indicadorId: string, nota: number}>>} params.evaluacionesPorAlumno -
 *   { [alumnoId]: [{indicadorId, nota}] }
 * @returns {{
 *   totalIndicadores: number,
 *   indicadoresEvaluados: number,
 *   pctAvance: number,
 *   alumnosSuperadores: number,
 *   promedioSuperadores: number|null,
 *   estrellas: 0|1|2|3,
 *   estadoVisual: 'en_progreso'|'con_estrellas'
 * }}
 */
export function calcularEstrellasObjetivo({ indicadoresRequeridos = [], evaluacionesPorAlumno = {} }) {
  const totalIndicadores = indicadoresRequeridos.length
  const idsConAlgunaEvaluacion = new Set()
  const superadores = []

  for (const evaluaciones of Object.values(evaluacionesPorAlumno)) {
    ;(evaluaciones || []).forEach((e) => {
      if (indicadoresRequeridos.includes(e.indicadorId)) idsConAlgunaEvaluacion.add(e.indicadorId)
    })

    if (esAlumnoSuperador({ indicadoresRequeridos, evaluaciones })) {
      const notas = evaluaciones
        .filter((e) => indicadoresRequeridos.includes(e.indicadorId))
        .map((e) => e.nota)
      const promedioAlumno = notas.reduce((acc, n) => acc + n, 0) / notas.length
      superadores.push(promedioAlumno)
    }
  }

  const indicadoresEvaluados = idsConAlgunaEvaluacion.size
  const alumnosSuperadores = superadores.length
  const promedioSuperadores =
    alumnosSuperadores > 0 ? superadores.reduce((acc, p) => acc + p, 0) / alumnosSuperadores : null

  return {
    totalIndicadores,
    indicadoresEvaluados,
    pctAvance: calcularPctAvance({ totalIndicadores, indicadoresEvaluados }),
    alumnosSuperadores,
    promedioSuperadores,
    estrellas: alumnosSuperadores > 0 ? bandaEstrellas(promedioSuperadores) : 0,
    estadoVisual: alumnosSuperadores === 0 ? 'en_progreso' : 'con_estrellas',
  }
}
