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

function summarize(filas) {
  const applicable = filas.filter((fila) => !EXCLUDED.has(fila.applicability) && fila.applicability !== 'DESCONOCIDO')
  const excluded = filas.filter((fila) => EXCLUDED.has(fila.applicability))
  const unresolved = filas.filter((fila) => fila.applicability === 'DESCONOCIDO')
  const contributions = applicable.map(filaContribution)
  const distribution = weightedDistribution(contributions)
  const projectedFilas = filas.map((fila) => ({ filaId: fila.filaId, nombre: fila.filaName, sectionId: fila.sectionId, applicability: fila.applicability, ...filaContribution(fila), individualCount: fila.students?.length || 0 }))
  const criticalStudentExceptions = applicable.reduce((total, fila) => total + (fila.students || []).filter((student) => student.critical === true || (student.overrideState && effectivePreparationState({ collectiveState: null, individualState: student.overrideState, applicability: 'TOCA' }) === 'SIN_ESTUDIAR')).length, 0)
  return {
    filas: projectedFilas,
    totalFilaCount: filas.length,
    applicableFilaCount: applicable.length,
    excludedFilaCount: excluded.length,
    unresolvedFilaCount: unresolved.length,
    distribution,
    criticalFilaCount: applicable.filter((fila) => filaContribution(fila).states.some(({ state }) => state === 'SIN_ESTUDIAR')).length,
    criticalStudentExceptions,
    affectedSectionCount: new Set(filas.map((fila) => fila.sectionId).filter(Boolean)).size
  }
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
    const summary = summarize(filas)
    return {
      sectionId: filas[0]?.sectionId,
      measureId: filas[0]?.measureId,
      ...summary,
      key
    }
  })
}

/** Aggregates the same fila-equivalent evidence across the authorized orchestra. */
export function aggregateOrchestraPreparation({ evidence = [], authorizationScope = {} } = {}) {
  const visible = evidence.filter((row) => !authorizationScope.sectionIds || authorizationScope.sectionIds.includes(row.sectionId))
  const byMeasure = new Map()
  visible.forEach((row) => {
    const list = byMeasure.get(row.measureId) || []
    list.push(row)
    byMeasure.set(row.measureId, list)
  })
  return [...byMeasure.entries()].map(([measureId, filas]) => {
    const summary = summarize(filas)
    const sections = aggregateSectionalPreparation({ evidence: filas, authorizationScope: {} })
      .reduce((map, projection) => { map.set(projection.sectionId, projection); return map }, new Map())
    return { measureId, ...summary, sectionProjections: [...sections.values()] }
  })
}
