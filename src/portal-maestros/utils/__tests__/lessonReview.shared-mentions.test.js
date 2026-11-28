import { describe, it, expect } from 'vitest'
import { splitByMentions } from '../lessonReview.js'
import { findMentionGroups, isPresentState, studentName } from '../../../shared/utils/bitacoraParser.js'

const roster = [
  { id: 'g', nombre_completo: 'Gerali Denisse Lugo Batista' },
  { id: 'le', nombre_completo: 'Lesly Ramírez Leonardo' },
  { id: 'sa', nombre_completo: 'Santa Isaura Castillo Diaz' },
  { id: 'ye', nombre_completo: 'Yereni Esther Germain Michel' },
]
const INCIDENT = '#Gerali Denisse Lugo Batista ha perdido agilidad. #Lesly Ramírez Leonardo esta mejorando. ' +
  '#Santa Isaura Castillo Diaz y #Yereni Esther Germain Michel estan ganando afinacion. #todos tienen problemas en la proyeccion.'

describe('lessonReview mention segmentation uses the shared interpreter', () => {
  it('keeps the same recipients per sentence as before the refactor', () => {
    expect(splitByMentions(INCIDENT, roster).map(b => [b.studentIds, b.scope])).toEqual([
      [['g'], 'seleccionar'],
      [['le'], 'seleccionar'],
      [['sa', 'ye'], 'seleccionar'],
      [[], 'presentes'],
    ])
  })

  it('returns null when no mention resolves, including ambiguous names', () => {
    const twins = [{ id: 'a1', nombre: 'Ana Pérez' }, { id: 'a2', nombre: 'Ana Pérez' }]
    expect(splitByMentions('#Ana Pérez toca', twins)).toBeNull()
    expect(splitByMentions('Clase tranquila', roster)).toBeNull()
  })

  it('shares the presence and name helpers with the portal', () => {
    expect(isPresentState('tardanza')).toBe(true)
    expect(isPresentState('A')).toBe(false)
    expect(studentName({ nombre: 'Ana' })).toBe('Ana')
    expect(findMentionGroups('#Lesly Ramírez Leonardo ok', roster).groups[0].ids).toEqual(['le'])
  })
})
