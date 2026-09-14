import { ESTADOS_PREPARACION } from './repertoireFoundation.js'
import { effectivePreparationState } from './studentPreparation.js'

const EXCLUDED = new Set(['SILENCIO', 'TACET', 'NO_APLICA'])

function filaContribution(fila) {
  if (fila.collectiveState) return { source: 'EXPLICIT_COLLECTIVE', states: [{ state: fila.collectiveState, weight: 1 }] }
  const states = (fila.students || []).map((student) => effectivePreparationState({ collectiveState: null, individualState: student.overrideState || student.state, applicability: 'TOCA' })).filter(Boolean)
  return { source: states.length ? 'DERIVED_FROM_STUDENTS' : 'SIN_EVALUAR', states: (states.length ? states : ['SIN_EVALUAR']).map((state) => ({ state, weight: 1 / (states.length || 1) })) }
}

function weightedDistribution(contributions) {
  const counts = Object.fromEntries(ESTADOS_PREPARACION.map((state) => [state, 0]))
  contributions.forEach((contribution) => contribution.states.forEach(({ state, weight }) => { counts[state] += weight }))
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
  return { counts, total, percentages: Object.fromEntries(ESTADOS_PREPARACION.map((state) => [state, total ? Math.round((counts[state] / total) * 10000) / 100 : 0])) }
}

export function aggregateSectionalPreparation({ evidence = [], authorizationScope = {} } = {}) {
  const visible = evidence.filter((row) => !authorizationScope.sectionIds || authorizationScope.sectionIds.includes(row.sectionId))
  const byMeasure = new Map()
  visible.forEach((row) => {
    const key = `${row.sectionId || 'unknown'}:${row.measureId}`
    const list = byMeasure.get(key) || []
    list.push(row)
    byMeasure.set(key, list)
  })
  return [...byMeasure.entries()].map(([key, filas]) => {
    const applicable = filas.filter((fila) => !EXCLUDED.has(fila.applicability) && fila.applicability !== 'DESCONOCIDO')
    const excluded = filas.filter((fila) => EXCLUDED.has(fila.applicability))
    const unresolved = filas.filter((fila) => fila.applicability === 'DESCONOCIDO')
    const contributions = applicable.map(filaContribution)
    const result = weightedDistribution(contributions)
    const criticalStudentExceptions = applicable.reduce((total, fila) => total + (fila.collectiveState ? (fila.students || []).filter((student) => effectivePreparationState({ collectiveState: fila.collectiveState, individualState: student.overrideState, applicability: 'TOCA' }) === 'SIN_ESTUDIAR').length : 0), 0)
    return {
      sectionId: filas[0]?.sectionId,
      measureId: filas[0]?.measureId,
      filas: filas.map((fila) => ({ filaId: fila.filaId, nombre: fila.filaName, applicability: fila.applicability, ...filaContribution(fila), individualCount: fila.students?.length || 0 })),
      applicableFilaCount: applicable.length,
      excludedFilaCount: excluded.length,
      unresolvedFilaCount: unresolved.length,
      distribution: result,
      criticalFilaCount: applicable.filter((fila) => filaContribution(fila).states.some(({ state }) => state === 'SIN_ESTUDIAR')).length,
      criticalStudentExceptions,
      key
    }
  })
}
