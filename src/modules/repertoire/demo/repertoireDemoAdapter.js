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
  return {
    async listMontajes() { return structuredClone(demoMontajes) },
    async updateMeasureState(_id, state) { return { estado_preparacion: state } },
    async updateMeasureApplicability(_id, applicability) { return { aplicabilidad: applicability } },
    async updateStudentState(id, state) { return { id, estado_preparacion: state } },
    summarize(cells) { return aggregatePreparation(cells) }
  }
}
