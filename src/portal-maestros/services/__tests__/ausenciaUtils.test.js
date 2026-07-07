import { describe, it, expect } from 'vitest'
import {
  filterBusinessDays,
  truncateWhatsAppText,
  prepareWhatsAppLink,
} from '../ausenciaUtils.js'

// ---------------------------------------------------------------------------
// filterBusinessDays
// ---------------------------------------------------------------------------

describe('filterBusinessDays', () => {
  it('removes Saturday and Sunday from the list', () => {
    // 2026-05-18 Monday, 2026-05-22 Friday, 2026-05-23 Saturday, 2026-05-24 Sunday
    const dates = ['2026-05-18', '2026-05-22', '2026-05-23', '2026-05-24']
    const result = filterBusinessDays(dates)
    expect(result).toEqual(['2026-05-18', '2026-05-22'])
  })

  it('keeps Monday through Friday', () => {
    // Full week Mon–Fri: 2026-05-18 to 2026-05-22
    const weekdays = ['2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22']
    const result = filterBusinessDays(weekdays)
    expect(result).toHaveLength(5)
    expect(result).toEqual(weekdays)
  })

  it('returns empty array when input is empty', () => {
    expect(filterBusinessDays([])).toEqual([])
  })

  it('returns empty array when all dates fall on weekend', () => {
    expect(filterBusinessDays(['2026-05-23', '2026-05-24'])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// truncateWhatsAppText
// ---------------------------------------------------------------------------

describe('truncateWhatsAppText', () => {
  it('returns short text unchanged', () => {
    const short = 'Hola, soy el profesor.'
    expect(truncateWhatsAppText(short)).toBe(short)
  })

  it('truncates text longer than 1800 chars with suffix', () => {
    const long = 'x'.repeat(2000)
    const result = truncateWhatsAppText(long)
    expect(result.length).toBeLessThanOrEqual(1800)
    expect(result).toContain('… (ver documento adjunto)')
  })

  it('returns exactly the text when it is 1800 chars', () => {
    const exact = 'y'.repeat(1800)
    expect(truncateWhatsAppText(exact)).toBe(exact)
  })

  it('respects a custom maxChars parameter', () => {
    const text = 'a'.repeat(200)
    const result = truncateWhatsAppText(text, 100)
    expect(result.length).toBeLessThanOrEqual(100)
    expect(result).toContain('… (ver documento adjunto)')
  })
})

// ---------------------------------------------------------------------------
// prepareWhatsAppLink
// ---------------------------------------------------------------------------

describe('prepareWhatsAppLink', () => {
  it('generates a wa.me deep link with encoded text', () => {
    const link = prepareWhatsAppLink('+5491112345678', 'Solicitud de ausencia')
    expect(link).toMatch(/^https:\/\/wa\.me\//)
    expect(link).toContain(encodeURIComponent('Solicitud de ausencia'))
  })

  it('returns null when phone is falsy', () => {
    expect(prepareWhatsAppLink(null, 'text')).toBeNull()
    expect(prepareWhatsAppLink('', 'text')).toBeNull()
    expect(prepareWhatsAppLink(undefined, 'text')).toBeNull()
  })

  it('strips non-digit chars from phone before building URL', () => {
    const link = prepareWhatsAppLink('+54 9 11 1234-5678', 'msg')
    expect(link).not.toContain(' ')
    expect(link).not.toContain('-')
  })
})
