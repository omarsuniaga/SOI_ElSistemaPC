import { ESTADOS_PREPARACION, isPreparationDenominator } from './repertoireFoundation.js'
import { aggregateSectionalPreparation, aggregateOrchestraPreparation } from './sectionalAggregation.js'
import { evaluateEventReadiness } from './eventReadiness.js'

const EXCLUDED = new Set(['SILENCIO', 'TACET', 'NO_APLICA'])

function distribution(cells = []) {
  const counts = Object.fromEntries(ESTADOS_PREPARACION.map((state) => [state, 0]))
  const applicable = cells.filter((cell) => isPreparationDenominator(cell.aplicabilidad || cell.applicability))
  applicable.forEach((cell) => { if (counts[cell.estado_preparacion || cell.state] != null) counts[cell.estado_preparacion || cell.state] += 1 })
  return { counts, denominator: applicable.length, percentages: Object.fromEntries(ESTADOS_PREPARACION.map((state) => [state, applicable.length ? Math.round((counts[state] / applicable.length) * 10000) / 100 : 0])) }
}

function authorized(evidence, authorization = {}) {
  if (typeof authorization.canRead === 'function') return evidence.filter(authorization.canRead)
  if (authorization.filaIds) return evidence.filter((row) => authorization.filaIds.includes(row.filaId))
  return evidence
}

export function buildMontageReport({ montage, measures = [], filas = [], passages = [], trajectory = null, priorities = [], history = [], sessionEvidence = [], authorization = {} } = {}) {
  const visibleMeasures = authorized(measures, authorization)
  const visibleFilas = authorized(filas, authorization)
  return {
    type: 'MONTAGE', montage, distribution: distribution(visibleMeasures), applicability: { excluded: visibleMeasures.filter((m) => EXCLUDED.has(m.aplicabilidad || m.applicability)).length, unresolved: visibleMeasures.filter((m) => (m.aplicabilidad || m.applicability) === 'DESCONOCIDO').length },
    sectionProjections: aggregateSectionalPreparation({ evidence: visibleFilas }), criticalFilas: visibleFilas.filter((fila) => fila.critical === true || fila.collectiveState === 'SIN_ESTUDIAR'), criticalPassages: passages.filter((passage) => passage.critical === true), trajectory, priorities, recentRegressions: history.filter((event) => event.isRegression || event.regressing), lastRehearsalEvidence: sessionEvidence.at(-1) || null,
    dataCoverage: { measureCount: visibleMeasures.length, filaCount: visibleFilas.length, historyCount: history.length }, deepLinks: { montage: `/repertorio?montaje=${montage?.id || ''}` },
  }
}

export function buildFilaReport({ fila, evidence = [], trajectory = null, priorities = [], history = [], sessionEvidence = [], authorization = {} } = {}) {
  const visible = authorized(evidence, authorization)
  const collective = visible.filter((row) => row.collectiveState || row.state).map((row) => ({ aplicabilidad: row.applicability || row.aplicabilidad, estado_preparacion: row.collectiveState || row.state }))
  return { type: 'FILA', fila, collective: distribution(collective), students: visible.flatMap((row) => row.students || []), individualExceptions: visible.flatMap((row) => (row.students || []).filter((student) => student.overrideState && student.overrideState !== row.collectiveState)), criticalMeasures: visible.filter((row) => row.critical === true), trajectory, priorities, recentHistory: history, lastRehearsalEvidence: sessionEvidence.at(-1) || null, deepLinks: { fila: `/repertorio?fila=${fila?.id || ''}` } }
}

export function buildSectionReport({ section, filas = [], authorization = {} } = {}) {
  const visible = authorized(filas, authorization)
  return { type: 'SECTION', section, aggregation: aggregateSectionalPreparation({ evidence: visible }), filas: visible, deepLinks: { section: `/repertorio?seccion=${section?.id || ''}` } }
}

export function buildOrchestraReport({ evidence = [], authorization = {}, ...rest } = {}) {
  const visible = authorized(evidence, authorization)
  return { type: 'ORCHESTRA', ...rest, aggregation: aggregateOrchestraPreparation({ evidence: visible }), filaEquivalentRule: 'each applicable fila contributes weight 1', weakFilas: visible.filter((row) => row.critical === true || row.collectiveState === 'SIN_ESTUDIAR') }
}

export function buildPassageReport({ passage, measures = [], history = [], trajectory = null, priorities = [], authorization = {} } = {}) {
  const visible = authorized(measures, authorization)
  return { type: 'PASSAGE', passage, distribution: distribution(visible), measures: visible, history, trajectory, priorities, deepLinks: { passage: `/repertorio?pasaje=${passage?.id || ''}` } }
}

export function buildEventReport({ event, montages = [], authorization = {} } = {}) {
  const visible = authorized(montages, authorization)
  const readiness = evaluateEventReadiness({ event, montages: visible })
  return { type: 'EVENT', event, readiness, montages: visible, concerns: visible.filter((item) => ['CRITICAL', 'AT_RISK', 'REGRESSING'].includes(item.status)), deepLinks: { event: `/repertorio?evento=${event?.id || ''}` } }
}

export function renderReportHtml(report) {
  const title = report?.montage?.nombre || report?.fila?.nombre || report?.section?.nombre || report?.passage?.nombre || report?.event?.titulo || 'Reporte de repertorio'
  return `<article class="repertoire-report" data-report-type="${report?.type || 'UNKNOWN'}"><h2>${escapeHtml(title)}</h2><p class="repertoire-report-print-meta">Generado: ${new Date().toLocaleString('es-DO')}</p><pre>${escapeHtml(JSON.stringify(report, null, 2))}</pre></article>`
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]) }
