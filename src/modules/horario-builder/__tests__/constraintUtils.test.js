import { describe, it, expect } from 'vitest'
import { buildJornada } from '../utils/constraintUtils.js'

describe('buildJornada', () => {
  it('sets correct times for selected days', () => {
    const j = buildJornada('15:30', '18:30', ['lunes', 'miércoles'])
    expect(j.lunes).toEqual({ inicio: '15:30', fin: '18:30' })
    expect(j.miércoles).toEqual({ inicio: '15:30', fin: '18:30' })
  })

  it('sets 00:00–00:00 for unselected days', () => {
    const j = buildJornada('15:30', '18:30', ['lunes'])
    expect(j.martes).toEqual({ inicio: '00:00', fin: '00:00' })
    expect(j.domingo).toEqual({ inicio: '00:00', fin: '00:00' })
  })

  it('includes all 7 days in output', () => {
    const j = buildJornada('09:00', '17:00', ['lunes'])
    expect(Object.keys(j)).toHaveLength(7)
  })

  it('handles empty selectedDays — all days disabled', () => {
    const j = buildJornada('09:00', '17:00', [])
    Object.values(j).forEach(v => expect(v).toEqual({ inicio: '00:00', fin: '00:00' }))
  })

  it('handles all days selected', () => {
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    const j = buildJornada('08:00', '20:00', days)
    Object.values(j).forEach(v => expect(v).toEqual({ inicio: '08:00', fin: '20:00' }))
  })
})
