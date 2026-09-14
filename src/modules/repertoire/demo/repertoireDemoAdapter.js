import { aggregatePreparation, ESTADOS_PREPARACION } from '../domain/repertoireFoundation.js'

const demoMontajes = [
  {
    id: 'demo-montaje-dvorak-9',
    obra: { titulo: 'Sinfonía n.º 9 «Del Nuevo Mundo»', compositor: 'Antonín Dvořák' },
    version: { nombre: 'Edición orquestal de estudio' },
    evento: { nombre: 'Concierto de cierre 2026', fecha: '2026-12-18' },
    filas: [{ id: 'demo-fila-trompetas', nombre: 'Trompetas', responsable: 'Maestro ACM' }],
    prioridad: 2,
    estado: 'EN_MONTAJE',
    alumnos: [
      { id: 'demo-alumno-juan', nombre: 'Juan', estado_preparacion: 'SIN_ESTUDIAR' },
      { id: 'demo-alumno-pedro', nombre: 'Pedro', estado_preparacion: 'CONSOLIDADO' }
    ],
    compases: Array.from({ length: 96 }, (_, index) => ({
      id: `demo-compas-${index + 1}`,
      numero_visible: String(index + 1),
      aplicabilidad: 'TOCA',
      estado_preparacion: ESTADOS_PREPARACION[index % ESTADOS_PREPARACION.length],
    }))
  }
]

export function createRepertoireDemoAdapter() {
  const state = structuredClone(demoMontajes)
  const passages = []
  const groups = []
  const sessionWorks = []
  const observationLinks = []
  const preparationHistory = []
  const recordTransition = (measureId, previousState, newState, scope = 'collective', studentId = null) => { if (previousState === newState) return; preparationHistory.push({ montageId: state[0].id, measureId, previousState, newState, scope, studentId, source: scope === 'student' ? 'INDIVIDUAL_OVERRIDE' : 'COLLECTIVE_FILA', createdAt: new Date().toISOString() }) }
  return {
    canEditApplicability: false,
    async listMontajes() { return structuredClone(state) },
    async updateMeasureState(_id, nextState) { const measure = state[0].compases.find((item) => item.id === _id); recordTransition(_id, measure?.estado_preparacion, nextState); if (measure) measure.estado_preparacion = nextState; return { estado_preparacion: nextState } },
    async updateMeasureApplicability(_id, applicability) { return { aplicabilidad: applicability } },
    async updateStudentState(studentId, measureId, nextState) {
      const student = state[0].alumnos.find((item) => item.id === studentId)
      const previousState = student?.overrides?.[measureId] || null
      student.overrides ||= {}
      if (nextState === null) delete student.overrides[measureId]
      else student.overrides[measureId] = nextState
      recordTransition(measureId, previousState, nextState, 'student', studentId)
      return { studentId, measureId, estado_preparacion: nextState }
    },
    async createPassage(payload) { const passage = { id: `demo-passage-${passages.length + 1}`, ...payload }; passages.push(passage); return structuredClone(passage) },
    async updatePassage(id, payload) { const passage = passages.find((item) => item.id === id); if (!passage) throw new Error('Pasaje no encontrado'); Object.assign(passage, payload); return structuredClone(passage) },
    async archivePassage(id) { return this.updatePassage(id, { archived_at: new Date().toISOString() }) },
    async createLinkedGroup(payload) { const group = { id: `demo-group-${groups.length + 1}`, measureIds: [], ...payload }; groups.push(group); return structuredClone(group) },
    async addLinkedMeasures(rows) { const group = groups.find((item) => item.id === rows[0]?.grupo_id); if (!group || rows.some((row) => row.grupo_id !== group.id)) throw new Error('Grupo inválido'); group.measureIds.push(...rows.map((row) => row.montaje_compas_id)); return structuredClone(rows) },
    async updateLinkedGroupState(groupId, nextState) { const group = groups.find((item) => item.id === groupId); if (!group) throw new Error('Grupo no encontrado'); group.measureIds.forEach((id) => { const measure = state[0].compases.find((item) => item.id === id); if (measure) { recordTransition(id, measure.estado_preparacion, nextState, 'collective'); measure.estado_preparacion = nextState } }); return { affected: group.measureIds.length } },
    async removeLinkedMeasure(groupId, measureId) { const group = groups.find((item) => item.id === groupId); if (!group || !group.measureIds.includes(measureId)) throw new Error('Compás no vinculado'); group.measureIds = group.measureIds.filter((id) => id !== measureId); return { groupId, measureId } },
    async removeLinkedMeasures(groupId, measureIds) { const group = groups.find((item) => item.id === groupId); if (!group) throw new Error('Grupo no encontrado'); const before = group.measureIds.length; group.measureIds = group.measureIds.filter((id) => !measureIds.includes(id)); return { affected: before - group.measureIds.length } },
    async renameLinkedGroup(id, nombre) { const group = groups.find((item) => item.id === id); if (!group) throw new Error('Grupo no encontrado'); group.nombre = nombre; return structuredClone(group) },
    async breakLinkedGroup(id) { const index = groups.findIndex((item) => item.id === id); if (index < 0) throw new Error('Grupo no encontrado'); return groups.splice(index, 1)[0] },
    async createSessionRepertoireWork(payload) { const work = { id: `demo-session-work-${sessionWorks.length + 1}`, sesion_id: payload.sessionId, montaje_id: payload.montajeId, montaje_fila_id: payload.filaId, pasaje_id: payload.passageId, focus_tags: payload.focusTags, notas: payload.notes, tempo_actual: payload.tempoActual, tempo_objetivo: payload.tempoObjetivo }; sessionWorks.push(work); return structuredClone(work) },
    async addSessionRepertoireWorkMeasures(workId, measureIds) { const work = sessionWorks.find((item) => item.id === workId); if (!work) throw new Error('Trabajo de sesión no encontrado'); work.measureIds = [...new Set(measureIds)]; return structuredClone(work.measureIds) },
    async listSessionRepertoireHistory() { return structuredClone(sessionWorks) },
    async historyBySession(sessionId) { return structuredClone(sessionWorks.filter((work) => work.sesion_id === sessionId)) },
    async historyByMontaje(montajeId) { return structuredClone(sessionWorks.filter((work) => work.montaje_id === montajeId)) },
    async historyByFila(montajeId, filaId) { return structuredClone(sessionWorks.filter((work) => work.montaje_id === montajeId && work.montaje_fila_id === filaId)) },
    async historyByPassage(passageId) { return structuredClone(sessionWorks.filter((work) => work.pasaje_id === passageId)) },
    async historyByMeasureRange(montajeId, filaId, measures) { const wanted = new Set(measures); return structuredClone(sessionWorks.filter((work) => work.montaje_id === montajeId && (!filaId || work.montaje_fila_id === filaId) && (work.measureIds || []).some((id) => wanted.has(id)))) },
    async historyByMeasure(_montageId, measureId) { return structuredClone(preparationHistory.filter((event) => event.measureId === measureId)) },
    async linkObservationToSessionRepertoire(observationId, workId) { observationLinks.push({ observationId, workId }); return { observationId, workId } },
    summarize(cells) { return aggregatePreparation(cells) }
  }
}
