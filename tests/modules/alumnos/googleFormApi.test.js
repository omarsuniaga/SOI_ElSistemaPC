import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mapRowToDraft,
  buscarPostulante,
  invalidarCachePostulantes,
} from '../../../src/modules/alumnos/api/googleFormApi.js'

// ---------------------------------------------------------------------------
// CSV fixture — two rows matching the real Google Sheet column structure
// ---------------------------------------------------------------------------
const CSV_HEADERS = [
  'Marca temporal',
  'Nombre del Alumno',
  'Nombre de Padres',
  '¿Cuál es el nombre completo de la madre?',
  '¿Cuál es el nombre completo del padre?',
  'Número de teléfono del alumno',
  '¿Numero telefónico de ambos padres?',
  'Telefono opcional',
  'Dirección de correo electrónico',
  'Fecha de Nacimiento del Alumno',
  'Dirección completa del alumno',
  '¿Quién sera su representante legal?',
  '¿Dirección de los padres?',
  '¿Podría pegar aquí el link de su ubicación, usando google map?',
  'Edad Actual',
  '¿Cuál es su religión o creencia ?',
  '¿La religión del alumno limita participar en actividades (ensayos, conciertos, viajes)?',
  '¿Cuál es la disponibilidad de tiempo del alumno para asistir a clases?',
  '¿El alumno tiene medios de transporte para asistir a las clases?',
  '¿Los representantes están dispuestos a apoyar al alumno en cuanto a promover el estudio en casa, llevarlo o apoyarlo a asistir a las actividades (ensayos, masterclass, conciertos)?',
  '¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?',
  '¿Está dispuesto a proporcionar copia de la cédula del alumno y representante?',
  '¿Puede adjuntar una copia del horario de clases del alumno o horario de trabajo del alumno en caso de no ser estudiante?',
  '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?',
  'Nacionalidad',
].join(',')

function makeRow(overrides = {}) {
  const defaults = {
    'Marca temporal': '05/01/2024 16:41:23',
    'Nombre del Alumno': 'Marcos Merone Cocco',
    'Nombre de Padres': 'Elisabetta Cocco Y Esnor Merone',
    '¿Cuál es el nombre completo de la madre?': 'Elisabetta Cocco',
    '¿Cuál es el nombre completo del padre?': 'Esnor Merone',
    'Número de teléfono del alumno': '8295577722',
    '¿Numero telefónico de ambos padres?': '8295577722',
    'Telefono opcional': '',
    'Dirección de correo electrónico': 'elisabetta.cocco@hotmail.com',
    'Fecha de Nacimiento del Alumno': '30/08/2015',
    'Dirección completa del alumno': 'Avenida real norte MC1-10-b',
    '¿Quién sera su representante legal?': 'Ambos (Padre y Madre)',
    '¿Dirección de los padres?': 'Avenida real norte MC1-10-V',
    '¿Podría pegar aquí el link de su ubicación, usando google map?': '',
    'Edad Actual': '10',
    '¿Cuál es su religión o creencia ?': 'Cristiano Evangelico',
    '¿La religión del alumno limita participar en actividades (ensayos, conciertos, viajes)?': 'No',
    '¿Cuál es la disponibilidad de tiempo del alumno para asistir a clases?': 'Flexibilidad según la programación',
    '¿El alumno tiene medios de transporte para asistir a las clases?': 'No, el alumno depende de familiares o amigos para el transporte.',
    '¿Los representantes están dispuestos a apoyar al alumno en cuanto a promover el estudio en casa, llevarlo o apoyarlo a asistir a las actividades (ensayos, masterclass, conciertos)?': 'Sí, haré lo posible',
    '¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?': 'Haré lo posible',
    '¿Está dispuesto a proporcionar copia de la cédula del alumno y representante?': 'Sí',
    '¿Puede adjuntar una copia del horario de clases del alumno o horario de trabajo del alumno en caso de no ser estudiante?': 'Sí',
    '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?': 'Sí',
    'Nacionalidad': 'Dominicana',
    ...overrides,
  }
  return defaults
}

function rowToCSVLine(row) {
  return Object.values(row)
    .map((v) => (String(v).includes(',') ? `"${v}"` : v))
    .join(',')
}

function buildCSV(rows) {
  return [CSV_HEADERS, ...rows.map(rowToCSVLine)].join('\n')
}

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------
function mockFetch(csv) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: async () => csv,
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('mapRowToDraft', () => {
  it('maps nombre_completo', () => {
    const draft = mapRowToDraft(makeRow())
    expect(draft.nombre_completo).toBe('Marcos Merone Cocco')
  })

  it('converts DD/MM/YYYY date to YYYY-MM-DD', () => {
    const draft = mapRowToDraft(makeRow({ 'Fecha de Nacimiento del Alumno': '30/08/2015' }))
    expect(draft.fecha_nacimiento).toBe('2015-08-30')
  })

  it('returns empty string for unparseable date', () => {
    const draft = mapRowToDraft(makeRow({ 'Fecha de Nacimiento del Alumno': 'no-date' }))
    expect(draft.fecha_nacimiento).toBe('')
  })

  it('maps madre_nombre and padre_nombre', () => {
    const draft = mapRowToDraft(makeRow())
    expect(draft.madre_nombre).toBe('Elisabetta Cocco')
    expect(draft.padre_nombre).toBe('Esnor Merone')
  })

  it('maps madre_tlf_whatsapp from "Numero telefónico de ambos padres"', () => {
    const draft = mapRowToDraft(makeRow({ '¿Numero telefónico de ambos padres?': '8091234567' }))
    expect(draft.madre_tlf_whatsapp).toBe('8091234567')
  })

  it('maps padre_tlf_whatsapp from "Telefono opcional"', () => {
    const draft = mapRowToDraft(makeRow({ 'Telefono opcional': '8297654321' }))
    expect(draft.padre_tlf_whatsapp).toBe('8297654321')
  })

  it('maps nationalidad', () => {
    const draft = mapRowToDraft(makeRow({ 'Nacionalidad': 'Venezolana' }))
    expect(draft.nacionalidad).toBe('Venezolana')
  })

  it('maps sector_calle_numero', () => {
    const draft = mapRowToDraft(makeRow())
    expect(draft.sector_calle_numero).toBe('Avenida real norte MC1-10-b')
  })

  describe('representante_parentesco', () => {
    it.each([
      ['Madre', 'madre'],
      ['Padre', 'padre'],
      ['Ambos (Padre y Madre)', 'ambos'],
      ['madre soltera', 'madre'],
    ])('maps "%s" → "%s"', (input, expected) => {
      const draft = mapRowToDraft(makeRow({ '¿Quién sera su representante legal?': input }))
      expect(draft.representante_parentesco).toBe(expected)
    })
  })

  describe('acepta_pago_600', () => {
    it.each([
      ['Si', true],
      ['Sí', true],
      ['Haré lo posible', true],
      ['No', false],
    ])('maps "%s" → %s', (input, expected) => {
      const draft = mapRowToDraft(makeRow({ '¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?': input }))
      expect(draft.acepta_pago_600).toBe(expected)
    })
  })

  describe('autoriza_fotos_redes', () => {
    it('maps "Sí" → true', () => {
      const draft = mapRowToDraft(makeRow({
        '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?': 'Sí',
      }))
      expect(draft.autoriza_fotos_redes).toBe(true)
    })

    it('maps "No" → false', () => {
      const draft = mapRowToDraft(makeRow({
        '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?': 'No',
      }))
      expect(draft.autoriza_fotos_redes).toBe(false)
    })
  })
})

describe('buscarPostulante', () => {
  beforeEach(() => {
    invalidarCachePostulantes()
    vi.clearAllMocks()
  })

  it('finds a postulante by partial name (case-insensitive, accent-insensitive)', async () => {
    const csv = buildCSV([makeRow({ 'Nombre del Alumno': 'Marcos Merone Cocco' })])
    mockFetch(csv)

    const results = await buscarPostulante('marcos')
    expect(results).toHaveLength(1)
    expect(results[0].draft.nombre_completo).toBe('Marcos Merone Cocco')
  })

  it('finds a postulante by partial name ignoring accents', async () => {
    const csv = buildCSV([makeRow({ 'Nombre del Alumno': 'María José López' })])
    mockFetch(csv)

    const results = await buscarPostulante('maria jose')
    expect(results).toHaveLength(1)
  })

  it('finds a postulante by phone number', async () => {
    const csv = buildCSV([makeRow({ 'Número de teléfono del alumno': '8295577722' })])
    mockFetch(csv)

    const results = await buscarPostulante('8295577722')
    expect(results).toHaveLength(1)
  })

  it('finds by partial phone match', async () => {
    const csv = buildCSV([
      makeRow({ 'Nombre del Alumno': 'Ana Pérez', '¿Numero telefónico de ambos padres?': '8091112233' }),
      makeRow({ 'Nombre del Alumno': 'Luis Gómez', '¿Numero telefónico de ambos padres?': '8097778899' }),
    ])
    mockFetch(csv)

    const results = await buscarPostulante('809111')
    expect(results).toHaveLength(1)
    expect(results[0].draft.nombre_completo).toBe('Ana Pérez')
  })

  it('returns empty array when no match', async () => {
    const csv = buildCSV([makeRow()])
    mockFetch(csv)

    const results = await buscarPostulante('XYZ no existe')
    expect(results).toHaveLength(0)
  })

  it('returns empty array for queries shorter than 2 chars', async () => {
    mockFetch(buildCSV([makeRow()]))
    const results = await buscarPostulante('M')
    expect(results).toHaveLength(0)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns multiple matches when several rows qualify', async () => {
    const csv = buildCSV([
      makeRow({ 'Nombre del Alumno': 'Juan García' }),
      makeRow({ 'Nombre del Alumno': 'Juan Pérez' }),
      makeRow({ 'Nombre del Alumno': 'María López' }),
    ])
    mockFetch(csv)

    const results = await buscarPostulante('juan')
    expect(results).toHaveLength(2)
  })

  it('uses cache on second call (fetch called only once)', async () => {
    const csv = buildCSV([makeRow()])
    mockFetch(csv)

    await buscarPostulante('marcos')
    await buscarPostulante('marcos')

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('refetches after invalidarCachePostulantes()', async () => {
    const csv = buildCSV([makeRow()])
    mockFetch(csv)

    await buscarPostulante('marcos')
    invalidarCachePostulantes()
    await buscarPostulante('marcos')

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 })

    await expect(buscarPostulante('marcos')).rejects.toThrow('403')
  })

  it('each result contains both raw and draft keys', async () => {
    const csv = buildCSV([makeRow()])
    mockFetch(csv)

    const results = await buscarPostulante('marcos')
    expect(results[0]).toHaveProperty('raw')
    expect(results[0]).toHaveProperty('draft')
  })
})
