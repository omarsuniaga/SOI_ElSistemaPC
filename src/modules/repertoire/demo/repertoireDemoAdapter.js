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
  return {
    canEditApplicability: false,
    async listMontajes() { return structuredClone(state) },
    async updateMeasureState(_id, nextState) { return { estado_preparacion: nextState } },
    async updateMeasureApplicability(_id, applicability) { return { aplicabilidad: applicability } },
    async updateStudentState(studentId, measureId, nextState) {
      const student = state[0].alumnos.find((item) => item.id === studentId)
      student.overrides ||= {}
      if (nextState === null) delete student.overrides[measureId]
      else student.overrides[measureId] = nextState
      return { studentId, measureId, estado_preparacion: nextState }
    },
    async createPassage(payload) { const passage = { id: `demo-passage-${passages.length + 1}`, ...payload }; passages.push(passage); return structuredClone(passage) },
    async updatePassage(id, payload) { const passage = passages.find((item) => item.id === id); if (!passage) throw new Error('Pasaje no encontrado'); Object.assign(passage, payload); return structuredClone(passage) },
    async archivePassage(id) { return this.updatePassage(id, { archived_at: new Date().toISOString() }) },
    async createLinkedGroup(payload) { const group = { id: `demo-group-${groups.length + 1}`, measureIds: [], ...payload }; groups.push(group); return structuredClone(group) },
    async addLinkedMeasures(rows) { const group = groups.find((item) => item.id === rows[0]?.grupo_id); if (!group || rows.some((row) => row.grupo_id !== group.id)) throw new Error('Grupo inválido'); group.measureIds.push(...rows.map((row) => row.montaje_compas_id)); return structuredClone(rows) },
    async removeLinkedMeasure(groupId, measureId) { const group = groups.find((item) => item.id === groupId); if (!group || !group.measureIds.includes(measureId)) throw new Error('Compás no vinculado'); group.measureIds = group.measureIds.filter((id) => id !== measureId); return { groupId, measureId } },
    async renameLinkedGroup(id, nombre) { const group = groups.find((item) => item.id === id); if (!group) throw new Error('Grupo no encontrado'); group.nombre = nombre; return structuredClone(group) },
    async breakLinkedGroup(id) { const index = groups.findIndex((item) => item.id === id); if (index < 0) throw new Error('Grupo no encontrado'); return groups.splice(index, 1)[0] },
    summarize(cells) { return aggregatePreparation(cells) }
  }
}
