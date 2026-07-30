import { describe, it, expect } from 'vitest'
import { normalizarInstrumento, rendimientoBadgeHTML } from './clasesUtils.js'

describe('normalizarInstrumento', () => {
  it('treats accented and unaccented spellings of the same instrument as equal', () => {
    expect(normalizarInstrumento('Violín')).toBe(normalizarInstrumento('Violin'))
  })

  it('treats singular and irregular plural as equal (Violín / Violines)', () => {
    expect(normalizarInstrumento('Violín')).toBe(normalizarInstrumento('Violines'))
  })

  it('treats singular and regular plural as equal (Viola / Violas)', () => {
    expect(normalizarInstrumento('Viola')).toBe(normalizarInstrumento('Violas'))
  })

  it('maps known spelling synonyms to the same key (Violonchelo / Violoncello)', () => {
    expect(normalizarInstrumento('Violonchelo')).toBe(normalizarInstrumento('Violoncello'))
  })

  it('does not collapse genuinely different instruments', () => {
    expect(normalizarInstrumento('Violín')).not.toBe(normalizarInstrumento('Viola'))
    expect(normalizarInstrumento('Piano')).not.toBe(normalizarInstrumento('Flauta'))
  })

  it('returns an empty string for null/undefined/empty input', () => {
    expect(normalizarInstrumento(null)).toBe('')
    expect(normalizarInstrumento(undefined)).toBe('')
    expect(normalizarInstrumento('')).toBe('')
  })
})

describe('rendimientoBadgeHTML', () => {
  it('shows the accented nivel label and the average', () => {
    const html = rendimientoBadgeHTML({ nivel: 'basico', promedio_notas: 82 })
    expect(html).toContain('Básico')
    expect(html).toContain('Prom. 82')
  })

  it('shows only whichever of nivel/promedio is present', () => {
    expect(rendimientoBadgeHTML({ nivel: 'avanzado', promedio_notas: null })).toContain('Avanzado')
    expect(rendimientoBadgeHTML({ nivel: null, promedio_notas: 55 })).toContain('Prom. 55')
  })

  it('returns an empty string when there is neither nivel nor promedio', () => {
    expect(rendimientoBadgeHTML({ nivel: null, promedio_notas: null })).toBe('')
    expect(rendimientoBadgeHTML({})).toBe('')
  })

  it('escapes an unexpected nivel value instead of trusting it as HTML', () => {
    const html = rendimientoBadgeHTML({ nivel: '<img onerror=alert(1)>', promedio_notas: null })
    expect(html).not.toContain('<img')
  })
})

describe('minutesToTime and timeToMinutes', () => {
  it('converts minutes to HH:MM format', async () => {
    const { minutesToTime, timeToMinutes } = await import('./clasesUtils.js')
    expect(minutesToTime(900)).toBe('15:00')
    expect(minutesToTime(930)).toBe('15:30')
    expect(minutesToTime(1080)).toBe('18:00')
    expect(timeToMinutes('15:00')).toBe(900)
    expect(timeToMinutes('18:00')).toBe(1080)
  })

  it('correctly handles 11:30 vs 12:00 mediodía (12:00 24h is 720 mins, not 0 mins)', async () => {
    const { timeToMinutes } = await import('./clasesUtils.js')
    const t1130 = timeToMinutes('11:30')
    const t1200 = timeToMinutes('12:00')
    const t1230 = timeToMinutes('12:30')

    expect(t1130).toBe(690)
    expect(t1200).toBe(720) // Mediodía (720 min), NOT 0 min (midnight)
    expect(t1230).toBe(750)
    expect(t1130 < t1200).toBe(true)

    // Explicit AM/PM checks
    expect(timeToMinutes('12:00 am')).toBe(0)   // Midnight
    expect(timeToMinutes('12:00 pm')).toBe(720) // Mediodía
  })
})

