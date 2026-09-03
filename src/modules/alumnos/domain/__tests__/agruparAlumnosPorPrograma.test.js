import { describe, expect, it } from 'vitest'
import { agruparAlumnosPorPrograma } from '../agruparAlumnosPorPrograma.js'

describe('agruparAlumnosPorPrograma', () => {
  it('groups an alumno with one programa by the programa name', () => {
    const alumno = {
      id: 'alumno-1',
      nombre: 'Ana',
      programas: [{ id: 'programa-piano', nombre: 'Piano' }],
    }

    expect(agruparAlumnosPorPrograma([alumno])).toEqual([
      {
        key: 'programa:programa-piano',
        nombre: 'Piano',
        alumnos: [alumno],
      },
    ])
  })

  it('keeps alumnos with multiple programas in one dedicated group', () => {
    const alumno = {
      id: 'alumno-2',
      nombre: 'Luis',
      programas: [
        { id: 'programa-piano', nombre: 'Piano' },
        { id: 'programa-coro', nombre: 'Coro' },
      ],
    }

    const groups = agruparAlumnosPorPrograma([alumno])

    expect(groups).toHaveLength(1)
    expect(groups[0].key).toBe('multiple-programas')
    expect(groups[0].nombre).toBe('Más de un programa')
    expect(groups[0].alumnos).toEqual([alumno])
  })

  it('assigns alumnos without programas to the unassigned group', () => {
    const alumno = { id: 'alumno-3', nombre: 'Marta', programas: [] }

    expect(agruparAlumnosPorPrograma([alumno])).toEqual([
      {
        key: 'sin-programa-asignado',
        nombre: 'Sin programa asignado',
        alumnos: [alumno],
      },
    ])
  })

  it('deduplicates programs and ignores inactive memberships before grouping', () => {
    const alumno = {
      id: 'alumno-4',
      nombre: 'Sofía',
      programas: [
        { id: 'programa-piano', nombre: 'Piano' },
        { id: 'programa-piano', nombre: 'Piano' },
        { id: 'programa-coro', nombre: 'Coro', activo: false },
      ],
    }

    expect(agruparAlumnosPorPrograma([alumno])).toEqual([
      {
        key: 'programa:programa-piano',
        nombre: 'Piano',
        alumnos: [{
          ...alumno,
          programas: [{ id: 'programa-piano', nombre: 'Piano' }],
        }],
      },
    ])
  })

  it('does not duplicate an alumno across groups', () => {
    const alumnos = [
      { id: 'alumno-1', programas: [{ id: 'programa-piano', nombre: 'Piano' }] },
      { id: 'alumno-2', programas: [{ id: 'programa-piano', nombre: 'Piano' }, { id: 'programa-coro', nombre: 'Coro' }] },
      { id: 'alumno-3', programas: [] },
    ]

    const groups = agruparAlumnosPorPrograma(alumnos)

    expect(groups.flatMap(group => group.alumnos)).toHaveLength(alumnos.length)
    expect(groups.flatMap(group => group.alumnos.map(alumno => alumno.id))).toEqual([
      'alumno-1',
      'alumno-2',
      'alumno-3',
    ])
  })
})

