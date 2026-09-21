/**
 * Nómina de la fila tal como la consume la vista.
 *
 * Con el primer montaje real los 7 alumnos salieron como "undefined: undefined":
 * el adaptador devolvía las filas crudas de `montaje_alumnos`, que solo tienen
 * `alumno_id`, y la vista pedía `nombre` y `estado_preparacion`. Los estados
 * individuales (`montaje_alumno_compases`) directamente no se consultaban, así
 * que en modo real la preparación por alumno no existía.
 */
import { describe, expect, it } from 'vitest'
import { buildStudentRoster } from '../domain/studentRoster.js'

const ASIGNACIONES = [
  { id: 'asig-2', alumno_id: 'al-yereni', alumnos: { nombre_completo: 'Yereni Michel' } },
  { id: 'asig-1', alumno_id: 'al-lia', alumnos: { nombre_completo: 'Lia Lopez' } },
]

describe('buildStudentRoster', () => {
  it('trae el nombre del alumno y conserva el id de la asignación', () => {
    const [primero] = buildStudentRoster(ASIGNACIONES, [])

    // El id debe ser el de `montaje_alumnos`: es con el que se escriben los
    // estados individuales, no con el id del alumno.
    expect(primero).toMatchObject({ id: 'asig-1', alumno_id: 'al-lia', nombre: 'Lia Lopez' })
  })

  it('ordena por nombre, que es como los busca el maestro', () => {
    expect(buildStudentRoster(ASIGNACIONES, []).map((s) => s.nombre)).toEqual(['Lia Lopez', 'Yereni Michel'])
  })

  it('agrupa los estados individuales por compás', () => {
    const roster = buildStudentRoster(ASIGNACIONES, [
      { montaje_alumno_id: 'asig-1', montaje_compas_id: 'c-4', estado_preparacion: 'CON_DIFICULTAD' },
      { montaje_alumno_id: 'asig-1', montaje_compas_id: 'c-9', estado_preparacion: 'DOMINADO' },
      { montaje_alumno_id: 'asig-2', montaje_compas_id: 'c-4', estado_preparacion: 'CONSOLIDADO' },
    ])

    expect(roster.find((s) => s.id === 'asig-1').overrides).toEqual({ 'c-4': 'CON_DIFICULTAD', 'c-9': 'DOMINADO' })
    expect(roster.find((s) => s.id === 'asig-2').overrides).toEqual({ 'c-4': 'CONSOLIDADO' })
  })

  it('no inventa un estado global cuando el alumno no tiene ninguno', () => {
    const [alumno] = buildStudentRoster([ASIGNACIONES[1]], [])
    expect(alumno.estado_preparacion).toBeNull()
    expect(alumno.overrides).toEqual({})
  })

  it('resume el estado del alumno con el más atrasado de sus compases', () => {
    // Si un alumno tiene un compás con dificultad y otro dominado, lo que el
    // maestro necesita ver de un vistazo es el que está peor.
    const [alumno] = buildStudentRoster([ASIGNACIONES[1]], [
      { montaje_alumno_id: 'asig-1', montaje_compas_id: 'c-1', estado_preparacion: 'DOMINADO' },
      { montaje_alumno_id: 'asig-1', montaje_compas_id: 'c-2', estado_preparacion: 'CON_DIFICULTAD' },
      { montaje_alumno_id: 'asig-1', montaje_compas_id: 'c-3', estado_preparacion: 'CONSOLIDADO' },
    ])
    expect(alumno.estado_preparacion).toBe('CON_DIFICULTAD')
  })

  it('aguanta una asignación sin alumno cargado sin romper la vista', () => {
    const [alumno] = buildStudentRoster([{ id: 'asig-x', alumno_id: 'al-x', alumnos: null }], [])
    expect(alumno.nombre).toBe('Alumno sin nombre')
  })

  it('devuelve lista vacía sin asignaciones', () => {
    expect(buildStudentRoster(null, null)).toEqual([])
  })
})
