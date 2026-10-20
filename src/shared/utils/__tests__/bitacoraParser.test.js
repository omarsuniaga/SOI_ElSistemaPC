import { describe, it, expect } from 'vitest'
import { parseBitacora, findMentionGroups, fold } from '../bitacoraParser.js'

const roster = [
  { id: 'g', nombre_completo: 'Gerali Denisse Lugo Batista' },
  { id: 'le', nombre_completo: 'Lesly Ramírez Leonardo' },
  { id: 'sa', nombre_completo: 'Santa Isaura Castillo Diaz' },
  { id: 'ye', nombre_completo: 'Yereni Esther Germain Michel' },
]
const allPresent = { g: 'P', le: 'P', sa: 'P', ye: 'P' }
const INCIDENT = '#Gerali Denisse Lugo Batista ha perdido agilidad. #Lesly Ramírez Leonardo esta mejorando. ' +
  '#Santa Isaura Castillo Diaz y #Yereni Esther Germain Michel estan ganando afinacion. #todos tienen problemas en la proyeccion.'

function coveredIndexes(result) {
  const covered = new Set()
  const ranges = [...result.registros.map(r => r.evidencia), ...result.sinAsignar]
  for (const { inicio, fin } of ranges) for (let i = inicio; i < fin; i++) covered.add(i)
  return covered
}

describe('parseBitacora: mentions and sentence attribution', () => {
  it('gives each student only their own sentence for the 2026-10-20 incident note', () => {
    const result = parseBitacora(INCIDENT, { roster, attendance: allPresent })
    expect(result.registros.map(r => [r.tipo, r.alcance, r.alumnoIds])).toEqual([
      ['desempeno', 'alumno', ['g']],
      ['desempeno', 'alumno', ['le']],
      ['desempeno', 'alumno', ['sa', 'ye']],
      ['desempeno', 'grupo', ['g', 'le', 'sa', 'ye']],
    ])
    expect(result.registros[0].texto).toContain('agilidad')
    expect(result.registros[0].texto).not.toContain('mejorando')
    expect(result.registros[1].texto).toContain('mejorando')
    expect(result.registros[1].texto).not.toContain('agilidad')
    expect(result.registros[3].texto).toContain('proyeccion')
    expect(result.sinAsignar).toEqual([])
    expect(result.avisos).toEqual([])
  })

  it('splits tokens inside a segment into contenido, refuerzo, tarea and desempeno', () => {
    const result = parseBitacora('#Lesly Ramírez Leonardo [Escala de Sol] (arco) {practicar 10 min} bien', { roster, attendance: allPresent })
    expect(result.registros.map(r => [r.tipo, r.alumnoIds, r.alcance, r.texto])).toEqual([
      ['contenido', ['le'], 'alumno', 'Escala de Sol'],
      ['refuerzo', ['le'], 'alumno', 'arco'],
      ['tarea', ['le'], 'alumno', 'practicar 10 min'],
      ['desempeno', ['le'], 'alumno', 'bien'],
    ])
    expect(result.registros.every(r => r.origen === 'escrito')).toBe(true)
  })

  it('treats [..] without mention as group contenido for present students', () => {
    const result = parseBitacora('[Escala de Re]', { roster, attendance: allPresent })
    expect(result.registros).toHaveLength(1)
    expect(result.registros[0]).toMatchObject({ tipo: 'contenido', alcance: 'grupo', alumnoIds: ['g', 'le', 'sa', 'ye'] })
  })

  it('sends plain text without mention to sinAsignar', () => {
    const result = parseBitacora('Clase tranquila', { roster, attendance: allPresent })
    expect(result.registros).toEqual([])
    expect(result.sinAsignar).toEqual([{ texto: 'Clase tranquila', inicio: 0, fin: 15 }])
  })

  it('resolves names case and accent insensitively', () => {
    const result = parseBitacora('#lesly ramirez leonardo avanza', { roster, attendance: allPresent })
    expect(result.registros[0].alumnoIds).toEqual(['le'])
  })

  it('leaves unknown mentions as plain unassigned text', () => {
    const result = parseBitacora('#Desconocido hizo algo.', { roster, attendance: allPresent })
    expect(result.registros).toEqual([])
    expect(result.sinAsignar).toHaveLength(1)
  })
})

describe('parseBitacora: attendance and warnings', () => {
  it('warns about an absent mentioned student and keeps the text out of their registros', () => {
    const result = parseBitacora('#Lesly Ramírez Leonardo llegó tarde', { roster, attendance: { le: 'A' } })
    expect(result.avisos).toEqual([{ tipo: 'ausente', alumnoId: 'le', nombre: 'Lesly Ramírez Leonardo' }])
    expect(result.registros).toEqual([])
    expect(result.sinAsignar).toHaveLength(1)
    expect(result.sinAsignar[0].texto).toContain('llegó tarde')
  })

  it('does not warn when attendance is not marked yet', () => {
    const result = parseBitacora('#Lesly Ramírez Leonardo llegó tarde', { roster, attendance: {} })
    expect(result.avisos).toEqual([])
    expect(result.registros[0].alumnoIds).toEqual(['le'])
  })

  it('does not resolve a name shared by two students and warns instead', () => {
    const twins = [{ id: 'a1', nombre: 'Ana Pérez' }, { id: 'a2', nombre: 'Ana Pérez' }]
    const result = parseBitacora('#Ana Pérez toca', { roster: twins, attendance: { a1: 'P', a2: 'P' } })
    expect(result.avisos).toEqual([{ tipo: 'ambiguo', nombre: 'Ana Pérez' }])
    expect(result.registros.every(r => r.alumnoIds.length === 0)).toBe(true)
    expect(result.sinAsignar).toHaveLength(1)
  })

  it('excludes absent students from group registros', () => {
    const result = parseBitacora('[Escala de Re]', { roster, attendance: { ...allPresent, ye: 'J' } })
    expect(result.registros[0].alumnoIds).toEqual(['g', 'le', 'sa'])
  })
})

describe('parseBitacora: coverage and stability', () => {
  it('keeps every letter or number of the note inside an evidencia or sinAsignar range', () => {
    const notes = [INCIDENT, '#Lesly Ramírez Leonardo [Escala de Sol] (arco) {practicar 10 min} bien', 'Clase tranquila. #Lesly Ramírez Leonardo avanza.']
    for (const note of notes) {
      const result = parseBitacora(note, { roster, attendance: allPresent })
      const covered = coveredIndexes(result)
      for (let i = 0; i < note.length; i++) {
        if (/[\p{L}\p{N}]/u.test(note[i])) expect(covered.has(i), `char ${i} of ${note}`).toBe(true)
      }
    }
  })

  it('reports present students and how many have a registro', () => {
    const all = parseBitacora(INCIDENT, { roster, attendance: allPresent })
    expect(all.cobertura).toEqual({ presentes: 4, conRegistro: 4, frasesSinAsignar: 0 })
    const partial = parseBitacora('[Escala de Re]', { roster, attendance: { ...allPresent, ye: 'A' } })
    expect(partial.cobertura).toEqual({ presentes: 3, conRegistro: 3, frasesSinAsignar: 0 })
    const unassigned = parseBitacora('Clase tranquila', { roster, attendance: allPresent })
    expect(unassigned.cobertura.frasesSinAsignar).toBe(1)
  })

  it('derives the same ids for the same input', () => {
    const first = parseBitacora(INCIDENT, { roster, attendance: allPresent })
    const second = parseBitacora(INCIDENT, { roster, attendance: allPresent })
    expect(first.registros.map(r => r.id)).toEqual(second.registros.map(r => r.id))
    expect(new Set(first.registros.map(r => r.id)).size).toBe(first.registros.length)
  })

  it('returns an empty result for empty or whitespace text', () => {
    for (const text of ['', '   \n\t ']) {
      expect(parseBitacora(text, { roster, attendance: allPresent })).toEqual({
        registros: [], sinAsignar: [], avisos: [], cobertura: { presentes: 4, conRegistro: 0, frasesSinAsignar: 0 },
      })
    }
  })
})

describe('shared mention helpers', () => {
  it('finds resolved groups and ambiguous mentions separately', () => {
    const { groups, ambiguous } = findMentionGroups('#Santa Isaura Castillo Diaz y #Yereni Esther Germain Michel ok #todos', roster)
    expect(groups.map(g => g.ids)).toEqual([['sa', 'ye'], ['todos']])
    expect(ambiguous).toEqual([])
  })

  it('folds accents and case one character at a time, keeping offsets', () => {
    expect(fold('Ñandú Á')).toHaveLength('Ñandú Á'.length)
    expect(fold('Ñandú Á')).toBe('nandu a')
  })
})
