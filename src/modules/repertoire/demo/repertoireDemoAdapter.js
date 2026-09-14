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
    summarize(cells) { return aggregatePreparation(cells) }
  }
}
