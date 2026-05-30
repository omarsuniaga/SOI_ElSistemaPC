/**
 * Tests para seccionesOrquestales.js — Section Registry
 *
 * Cobertura:
 *   - normalizarInstrumento: NFD, lowercase, plural, edge cases
 *   - getAlumnosBySeccion: filtering, tutti, individual, unknown section
 *   - expandSeccionItems: items mixtos, section expansion, es_colectivo skip
 *   - buildSeccionContext: formato correcto, secciones vacías ignoradas
 */

import { describe, it, expect } from 'vitest'

// ── Mock data ────────────────────────────────────────────────────────────────

const mockPresentes = [
  { id: '1', nombre_completo: 'Ana García', instrumento_principal: 'Violín' },
  { id: '2', nombre_completo: 'Pedro Ruiz', instrumento_principal: 'Viola' },
  { id: '3', nombre_completo: 'Luis Torres', instrumento_principal: 'Violonchelo' },
  { id: '4', nombre_completo: 'María López', instrumento_principal: 'Contrabajo' },
  { id: '5', nombre_completo: 'Juan Pérez', instrumento_principal: 'Flauta' },
  { id: '6', nombre_completo: 'Sofía Martínez', instrumento_principal: 'Oboe' },
  { id: '7', nombre_completo: 'Carlos Rodríguez', instrumento_principal: 'Clarinete' },
  { id: '8', nombre_completo: 'Elena Sánchez', instrumento_principal: 'Fagot' },
]

describe('normalizarInstrumento', () => {
  it('lowercase + sin acentos NFD: "Violín" → "violin"', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento('Violín')).toBe('violin')
  })

  it('sin plural: "violines" → "violin"', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento('violines')).toBe('violin')
  })

  it('uppercase: "VIOLIN" → "violin"', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento('VIOLIN')).toBe('violin')
  })

  it('compound name: "Flauta Travesera" → "flauta travesera"', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento('Flauta Travesera')).toBe('flauta travesera')
  })

  it('plural "es": "violonchelos" → "violonchelo"', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento('violonchelos')).toBe('violonchelo')
  })

  it('plural "s": "flautas" → "flauta"', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento('flautas')).toBe('flauta')
  })

  it('null/undefined input returns empty string', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento(null)).toBe('')
    expect(normalizarInstrumento(undefined)).toBe('')
    expect(normalizarInstrumento('')).toBe('')
  })

  it('trims whitespace: "  Violín  " → "violin"', async () => {
    const { normalizarInstrumento } = await import('../seccionesOrquestales.js')
    expect(normalizarInstrumento('  Violín  ')).toBe('violin')
  })
})

describe('getAlumnosBySeccion', () => {
  it('"maderas" con alumnos mixtos → solo flauta/oboe/clarinete', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const result = getAlumnosBySeccion('maderas', mockPresentes)
    expect(result).toHaveLength(3)
    const nombres = result.map((a) => a.nombre_completo)
    expect(nombres).toContain('Juan Pérez')
    expect(nombres).toContain('Sofía Martínez')
    expect(nombres).toContain('Carlos Rodríguez')
    expect(nombres).not.toContain('Elena Sánchez') // fagot no está en maderas
    expect(nombres).not.toContain('Ana García') // violín no está en maderas
  })

  it('"cuerdas" → violín, viola, cello, contrabajo', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const result = getAlumnosBySeccion('cuerdas', mockPresentes)
    expect(result).toHaveLength(4)
    const nombres = result.map((a) => a.nombre_completo)
    expect(nombres).toContain('Ana García')
    expect(nombres).toContain('Pedro Ruiz')
    expect(nombres).toContain('Luis Torres')
    expect(nombres).toContain('María López')
  })

  it('"tutti" → todos los presentes', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const result = getAlumnosBySeccion('tutti', mockPresentes)
    expect(result).toHaveLength(8)
  })

  it('"general" → todos los presentes', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const result = getAlumnosBySeccion('general', mockPresentes)
    expect(result).toHaveLength(8)
  })

  it('"individual" → []', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const result = getAlumnosBySeccion('individual', mockPresentes)
    expect(result).toEqual([])
  })

  it('sección inexistente → console.warn + []', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const warns = []
    const origWarn = console.warn
    console.warn = (...args) => warns.push(args.join(' '))

    const result = getAlumnosBySeccion('percusiones', mockPresentes)

    console.warn = origWarn
    expect(result).toEqual([])
    expect(warns.length).toBeGreaterThan(0)
    expect(warns[0]).toContain('percusiones')
  })

  it('instrumento no presente (fagot) → ignorado sin error', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    // fagot está en mockPresentes pero no en SECCION_MAP → nadie matchea
    const result = getAlumnosBySeccion('maderas', mockPresentes)
    const fagotStudent = result.find((a) => a.instrumento_principal === 'Fagot')
    expect(fagotStudent).toBeUndefined()
  })

  it('alumno con instrumento normalizado "violin" matchea sección "violines"', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const result = getAlumnosBySeccion('violines', mockPresentes)
    expect(result).toHaveLength(1)
    expect(result[0].nombre_completo).toBe('Ana García')
  })

  it('presentes vacío → array vacío para cualquier sección', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    expect(getAlumnosBySeccion('cuerdas', [])).toEqual([])
    expect(getAlumnosBySeccion('tutti', [])).toEqual([])
  })

  it('presentes sin instrumento_principal → no matchea secciones con instrumentos', async () => {
    const { getAlumnosBySeccion } = await import('../seccionesOrquestales.js')
    const sinInstrumento = [{ id: '99', nombre_completo: 'Test', instrumento_principal: '' }]
    expect(getAlumnosBySeccion('violines', sinInstrumento)).toEqual([])
    expect(getAlumnosBySeccion('tutti', sinInstrumento)).toHaveLength(1)
  })
})

describe('expandSeccionItems', () => {
  it('items mixtos: expande sección, mantiene individual, skips colectivo', async () => {
    const { expandSeccionItems } = await import('../seccionesOrquestales.js')
    const items = [
      { contenido: 'Danzón', alumnos: ['Ana García'], es_colectivo: false, seccion: 'individual' },
      { contenido: 'Maderas', alumnos: [], es_colectivo: false, seccion: 'maderas' },
      { contenido: 'Tutti', alumnos: [], es_colectivo: true, seccion: 'tutti' },
      { contenido: 'General', alumnos: [], es_colectivo: false, seccion: 'general' },
      { contenido: 'Cuerdas', alumnos: [], es_colectivo: false, seccion: 'cuerdas' },
    ]

    const result = expandSeccionItems(items, mockPresentes)

    // Individual: unchanged
    expect(result[0].alumnos).toEqual(['Ana García'])

    // Maderas: expanded to student names
    expect(result[1].alumnos).toHaveLength(3)
    expect(result[1].alumnos).toContain('Juan Pérez')
    expect(result[1].alumnos).toContain('Sofía Martínez')
    expect(result[1].alumnos).toContain('Carlos Rodríguez')

    // Tutti: unchanged (es_colectivo=true)
    expect(result[2].alumnos).toEqual([])

    // General: expanded to all
    expect(result[3].alumnos).toHaveLength(8)

    // Cuerdas: expanded
    expect(result[4].alumnos).toHaveLength(4)
  })

  it('item con sección ya tiene alumnos → no se expande', async () => {
    const { expandSeccionItems } = await import('../seccionesOrquestales.js')
    const items = [
      { contenido: 'Test', alumnos: ['Pedro Ruiz'], es_colectivo: false, seccion: 'cuerdas' },
    ]
    const result = expandSeccionItems(items, mockPresentes)
    expect(result[0].alumnos).toEqual(['Pedro Ruiz'])
  })

  it('sección no reconocida → item sin expandir', async () => {
    const { expandSeccionItems } = await import('../seccionesOrquestales.js')
    const items = [
      { contenido: 'Percusión', alumnos: [], es_colectivo: false, seccion: 'percusiones' },
    ]
    const result = expandSeccionItems(items, mockPresentes)
    expect(result[0].alumnos).toEqual([])
    expect(result[0].seccion).toBe('percusiones')
  })

  it('item sin seccion explícita → defaults a "general" y expande', async () => {
    const { expandSeccionItems } = await import('../seccionesOrquestales.js')
    const items = [{ contenido: 'Clase', alumnos: [], es_colectivo: false }]
    const result = expandSeccionItems(items, mockPresentes)
    expect(result[0].alumnos).toHaveLength(8)
  })

  it('presentes vacío → alumnos vacío para items expandidos', async () => {
    const { expandSeccionItems } = await import('../seccionesOrquestales.js')
    const items = [{ contenido: 'Maderas', alumnos: [], es_colectivo: false, seccion: 'maderas' }]
    const result = expandSeccionItems(items, [])
    expect(result[0].alumnos).toEqual([])
  })
})

describe('buildSeccionContext', () => {
  it('formato correcto con alumnos presentes en varias secciones', async () => {
    const { buildSeccionContext } = await import('../seccionesOrquestales.js')
    const result = buildSeccionContext(mockPresentes)

    // Debe empezar con SECCIONES:
    expect(result).toMatch(/^SECCIONES:/)

    // Debe incluir violines con Ana
    expect(result).toContain('violines')
    expect(result).toContain('Ana García')

    // Debe incluir maderas con Juan, Sofía, Carlos
    expect(result).toContain('maderas')
    expect(result).toContain('Juan Pérez')
    expect(result).toContain('Sofía Martínez')
    expect(result).toContain('Carlos Rodríguez')

    // Debe incluir cuerdas
    expect(result).toContain('cuerdas')

    // Debe incluir tutti
    expect(result).toContain('tutti')
  })

  it('ignora secciones sin alumnos presentes', async () => {
    const { buildSeccionContext } = await import('../seccionesOrquestales.js')
    // Solo alumno de flauta
    const parcial = [{ id: '5', nombre_completo: 'Juan Pérez', instrumento_principal: 'Flauta' }]
    const result = buildSeccionContext(parcial)

    // Debe incluir flautas y maderas
    expect(result).toContain('flautas')
    expect(result).toContain('maderas')

    // NO debe incluir violines, cuerdas, cellos, etc.
    expect(result).not.toContain('violines')
    expect(result).not.toContain('violas')
  })

  it('presentes vacío → solo "SECCIONES:" sin líneas', async () => {
    const { buildSeccionContext } = await import('../seccionesOrquestales.js')
    const result = buildSeccionContext([])
    expect(result).toBe('SECCIONES:')
  })

  it('cada línea tiene formato "- seccion (instrumentos): nombres"', async () => {
    const { buildSeccionContext } = await import('../seccionesOrquestales.js')
    const result = buildSeccionContext(mockPresentes)
    const lines = result.split('\n').slice(1) // skip header

    for (const line of lines) {
      expect(line).toMatch(/^- .+ \(.+\): .+/)
    }
  })

  it('alumno puede matchear múltiples secciones (ej. violín → violines y cuerdas)', async () => {
    const { buildSeccionContext } = await import('../seccionesOrquestales.js')
    const result = buildSeccionContext(mockPresentes)

    // Ana García (violín) debe aparecer en violines Y cuerdas
    const anaCount = (result.match(/Ana García/g) || []).length
    expect(anaCount).toBeGreaterThan(1)
  })
})
