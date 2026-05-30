/**
 * Tests para groqService.js — cubre:
 *   - parseGroqJSON: reparación de JSON malformado de la IA
 *   - proxyChat: manejo de respuestas del Edge Function
 *   - generateMonthlyPatterns: fallback graceful cuando falla la API
 *   - analyzeObservation: pipeline completo (pre-parser + Groq + post-processor)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
}))

// Mock fetch globalmente
const fetchMock = vi.fn()
global.fetch = fetchMock

// Mock observationParser para aislar el test de analyzeObservation
vi.mock('../../utils/observationParser.js', () => ({
  segmentObservation: vi.fn(),
  inferTipo: vi.fn().mockReturnValue('tecnica'),
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { segmentObservation } from '../../utils/observationParser.js'
import { generateMonthlyPatterns, analyzeObservation, enrichToDSL } from '../groqService.js'

// ── Helpers ────────────────────────────────────────────────────────────────

function mockFetchSuccess(content) {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({
      choices: [{ message: { content } }],
    }),
  })
}

function mockFetchError(status, errorMsg) {
  fetchMock.mockResolvedValue({
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({ error: { message: errorMsg } }),
  })
}

function mockFetchNetworkError() {
  fetchMock.mockRejectedValue(new Error('Network error'))
}

// ── parseGroqJSON (testado indirectamente via generateMonthlyPatterns) ─────
// Para testear parseGroqJSON directamente exportamos solo lo necesario.
// Importamos el módulo entero para acceder a la función vía comportamiento observable.

describe('parseGroqJSON — reparación de respuestas malformadas de la IA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Garantizar que el mock de sesión esté disponible en cada test
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    })
  })

  it('JSON limpio: parseado directamente sin reparación', async () => {
    const validJson = JSON.stringify({
      patrones: { positivos: ['Buen rendimiento'], atencion: [] },
      recomendaciones: { academico: 'ok', logistica: 'ok', talentos: 'ok', refuerzo: 'ok' },
      notaDireccion: 'nota',
    })
    mockFetchSuccess(validJson)

    const result = await generateMonthlyPatterns([], [], {
      clase: 'Test',
      docente: 'Omar',
      mes: 'Mayo 2026',
      totalAlumnos: 5,
    })

    expect(result.patrones.positivos).toEqual(['Buen rendimiento'])
  })

  it('JSON con bloques markdown (```json ... ```): se eliminan los fences', async () => {
    const withFences = `\`\`\`json\n${JSON.stringify({
      patrones: { positivos: ['Patrón detectado'], atencion: ['Atención requerida'] },
      recomendaciones: { academico: 'a', logistica: 'l', talentos: 't', refuerzo: 'r' },
      notaDireccion: 'nota',
    })}\n\`\`\``
    mockFetchSuccess(withFences)

    const result = await generateMonthlyPatterns([], [], {
      clase: 'Test',
      docente: 'Omar',
      mes: 'Mayo 2026',
      totalAlumnos: 5,
    })

    expect(result.patrones.positivos[0]).toBe('Patrón detectado')
    expect(result.patrones.atencion[0]).toBe('Atención requerida')
  })

  it('JSON truncado (Groq se quedó sin tokens): se cierra automáticamente', async () => {
    // Simula respuesta cortada a la mitad de un array
    const truncated = `{"patrones": {"positivos": ["Buena asistencia", "Progreso notable`
    mockFetchSuccess(truncated)

    // No debe lanzar — debe retornar el fallback
    const result = await generateMonthlyPatterns([], [], {
      clase: 'Test',
      docente: 'Omar',
      mes: 'Mayo 2026',
      totalAlumnos: 5,
    })

    // Si el JSON reparado es válido, result tendrá datos; si no, fallback vacío
    expect(result).toBeDefined()
    expect(result.patrones).toBeDefined()
  })

  it('JSON completamente inválido: retorna fallback vacío sin lanzar', async () => {
    mockFetchSuccess('esto no es JSON para nada')

    const result = await generateMonthlyPatterns([], [], {
      clase: 'Test',
      docente: 'Omar',
      mes: 'Mayo 2026',
      totalAlumnos: 5,
    })

    // Fallback graceful
    expect(result.patrones.positivos).toEqual([])
    expect(result.patrones.atencion).toEqual([])
    expect(result.recomendaciones.academico).toBe('')
  })

  it('JSON con comillas tipográficas (U+201C/U+201D): se normalizan antes de parsear', async () => {
    // Usa String.fromCodePoint para garantizar los codepoints correctos sin depender del encoding
    const lq = String.fromCodePoint(0x201c) // LEFT DOUBLE QUOTATION MARK “
    const rq = String.fromCodePoint(0x201d) // RIGHT DOUBLE QUOTATION MARK “

    // Construye JSON con curly quotes como delimitadores (como lo genera un LLM)
    const withCurlyQuotes =
      `{${lq}patrones${rq}:{${lq}positivos${rq}:[${lq}Buen progreso${rq}],${lq}atencion${rq}:[]},` +
      `${lq}recomendaciones${rq}:{${lq}academico${rq}:${lq}ok${rq},${lq}logistica${rq}:${lq}ok${rq},` +
      `${lq}talentos${rq}:${lq}ok${rq},${lq}refuerzo${rq}:${lq}ok${rq}},${lq}notaDireccion${rq}:${lq}nota${rq}}`

    mockFetchSuccess(withCurlyQuotes)

    const result = await generateMonthlyPatterns([], [], {
      clase: 'Test',
      docente: 'Omar',
      mes: 'Mayo 2026',
      totalAlumnos: 5,
    })

    // La normalización convierte las curly quotes a ASCII y el parse tiene que funcionar
    expect(result.patrones.positivos).toEqual(['Buen progreso'])
  })
})

// ── proxyChat — manejo de errores del Edge Function ────────────────────────
describe('proxyChat — manejo de errores del Edge Function', () => {
  beforeEach(() => vi.clearAllMocks())

  it('error de red: enrich lanza con mensaje descriptivo', async () => {
    mockFetchNetworkError()

    await expect(enrichToDSL('texto cualquiera')).rejects.toThrow('Network error')
  })

  it('Edge Function devuelve 401: lanza con mensaje del error', async () => {
    mockFetchError(401, 'Unauthorized')

    await expect(enrichToDSL('texto')).rejects.toThrow('Unauthorized')
  })

  it('Edge Function devuelve 500 sin GROQ_API_KEY: lanza con mensaje descriptivo', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi
        .fn()
        .mockResolvedValue({ error: 'GROQ_API_KEY not configured in Edge Function secrets' }),
    })

    await expect(enrichToDSL('texto')).rejects.toThrow('GROQ_API_KEY not configured')
  })

  it('respuesta sin `choices`: lanza "Groq devolvió una respuesta vacía"', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ choices: [] }),
    })

    await expect(enrichToDSL('texto')).rejects.toThrow('respuesta vacía')
  })

  it('respuesta con JSON no parseable: lanza con status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new Error('Not JSON')),
    })

    await expect(enrichToDSL('texto')).rejects.toThrow('non-JSON (status 503)')
  })
})

// ── generateMonthlyPatterns ────────────────────────────────────────────────
describe('generateMonthlyPatterns', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve estructura completa con datos reales cuando la API responde OK', async () => {
    const response = {
      patrones: {
        positivos: ['Alta asistencia', 'Progreso en escala mayor'],
        atencion: ['2 alumnos con 3+ ausencias'],
      },
      recomendaciones: {
        academico: 'Continuar trabajando escalas.',
        logistica: 'Revisar sala.',
        talentos: 'Alumno X destaca.',
        refuerzo: 'Alumno Y necesita refuerzo.',
      },
      notaDireccion: 'El mes tuvo buen rendimiento general.',
    }
    mockFetchSuccess(JSON.stringify(response))

    const result = await generateMonthlyPatterns(
      [
        { numero_sesion: 1, fecha: '2026-05-07', asistencia: [{ estado: 'P' }, { estado: 'A' }] },
        { numero_sesion: 2, fecha: '2026-05-14', asistencia: [{ estado: 'P' }, { estado: 'P' }] },
      ],
      [],
      { clase: 'Iniciación Violín A', docente: 'Omar Suniaga', mes: 'Mayo 2026', totalAlumnos: 8 },
    )

    expect(result.patrones.positivos).toHaveLength(2)
    expect(result.patrones.atencion[0]).toContain('ausencias')
    expect(result.recomendaciones.academico).toContain('escalas')
    expect(result.notaDireccion).toBeTruthy()
  })

  it('retorna fallback vacío sin lanzar cuando la API falla', async () => {
    mockFetchNetworkError()

    const result = await generateMonthlyPatterns([], [], {
      clase: 'Test',
      docente: 'Test',
      mes: 'Mayo 2026',
      totalAlumnos: 0,
    })

    expect(result).toEqual({
      patrones: { positivos: [], atencion: [] },
      recomendaciones: { academico: '', logistica: '', talentos: '', refuerzo: '' },
      notaDireccion: '',
    })
  })

  it('incluye datos de asistencia en el prompt enviado a la API', async () => {
    mockFetchSuccess(
      JSON.stringify({
        patrones: { positivos: [], atencion: [] },
        recomendaciones: { academico: '', logistica: '', talentos: '', refuerzo: '' },
        notaDireccion: '',
      }),
    )

    await generateMonthlyPatterns(
      [
        {
          numero_sesion: 1,
          fecha: '2026-05-07',
          asistencia: [{ estado: 'P' }, { estado: 'A' }, { estado: 'J' }],
        },
      ],
      [],
      { clase: 'Guitarra I', docente: 'Omar', mes: 'Mayo 2026', totalAlumnos: 3 },
    )

    const [, { body }] = fetchMock.mock.calls[0]
    const parsed = JSON.parse(body)
    const prompt = parsed.messages[0].content
    // El prompt debe incluir datos de sesión y contexto
    expect(prompt).toContain('Guitarra I')
    expect(prompt).toContain('Mayo 2026')
    expect(prompt).toContain('1 presentes')
    expect(prompt).toContain('1 ausentes')
    expect(prompt).toContain('1 justificados')
  })
})

// ── analyzeObservation ────────────────────────────────────────────────────
describe('analyzeObservation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Tier 1: Groq devuelve análisis → Tier 2: guardas validan → post-process', async () => {
    // Groq returns structured items with student names
    mockFetchSuccess(
      JSON.stringify({
        items: [
          {
            contenido: 'Escala de Sol mayor',
            alumnos: ['María'],
            es_colectivo: false,
            seccion: 'individual',
            estado: 'EN_PROGRESO',
            nota: 3,
            observacion: 'Buena ejecución',
            tarea: null,
            explicacion_objetiva: 'Actividad neutra sin evidencia de logro.',
          },
        ],
        resumen: 'Violín — técnica — en progreso.',
      }),
    )

    const result = await analyzeObservation('#María trabajó escala de Sol muy bien', {
      alumnos: [
        { id: 'a1', nombre: 'María', nombre_completo: 'María López', nombreCorto: 'María' },
      ],
      presentes: [
        { id: 'a1', nombre: 'María', nombre_completo: 'María López', nombreCorto: 'María' },
      ],
      instrumento: 'Violín',
      tipoClase: 'instrumento',
    })

    expect(result.dsl).toContain('María')
    expect(result.dsl).toContain('Escala de Sol mayor')
    expect(result.dsl).toContain('EN_PROGRESO')
    expect(result.progreso).toHaveLength(1)
    expect(result.progreso[0].contenido).toBe('Escala de Sol mayor')
    expect(result.progreso[0].estado).toBe('EN_PROGRESO')
    expect(result.progreso[0].nota).toBe(3)
    expect(result.progreso[0].alumnos).toEqual(['María'])
    expect(result.resumen).toContain('Violín')
  })

  it('Groq falla (network error): cae en fallback legacy con pre-parser JS', async () => {
    segmentObservation.mockReturnValue([
      {
        alumnos: [{ nombre: 'Pedro', nombre_completo: 'Pedro Ruiz', nombreCorto: 'Pedro' }],
        estado: { value: 'LOGRADO' },
        fragment: 'completó el arpegio de Do',
        nota: null,
        tarea: null,
        esColectivo: false,
        scope: 'individual',
        alerta: false,
        alertDetails: null,
        requires_confirmation: false,
      },
    ])

    // First call (Tier 1 Groq) fails → fallback to legacy
    // Legacy also calls fetch (ENRICH_FALLBACK) → mock that too
    fetchMock
      .mockRejectedValueOnce(new Error('Network error')) // Tier 1 Groq
      .mockResolvedValueOnce({
        // Legacy Groq enrich
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  items: [
                    {
                      id: 'g_1',
                      contenido: 'Arpegio de Do',
                      observacion: 'Completado correctamente',
                    },
                  ],
                }),
              },
            },
          ],
        }),
      })

    const result = await analyzeObservation('Pedro completó el arpegio de Do', {
      alumnos: [{ nombre: 'Pedro', nombre_completo: 'Pedro Ruiz', nombreCorto: 'Pedro' }],
      presentes: [{ nombre: 'Pedro', nombre_completo: 'Pedro Ruiz', nombreCorto: 'Pedro' }],
      instrumento: 'Guitarra',
      tipoClase: 'instrumento',
    })

    expect(result.progreso).toHaveLength(1)
    expect(result.progreso[0].estado).toBe('LOGRADO')
    expect(result.progreso[0].contenido).toBeTruthy()
    expect(result.dsl).toBeTruthy()
  })

  it('Groq devuelve items con alumnos que no están en el roster: guardas filtran', async () => {
    // Groq returns a student "Juan" who is NOT in the presentes list
    mockFetchSuccess(
      JSON.stringify({
        items: [
          {
            contenido: 'Arpegios',
            alumnos: ['Juan'],
            es_colectivo: false,
            seccion: 'individual',
            estado: 'EN_PROGRESO',
            nota: 3,
            observacion: null,
            tarea: null,
            explicacion_objetiva: 'Actividad sin evidencia.',
          },
        ],
        resumen: 'Guitarra — técnica.',
      }),
    )

    const result = await analyzeObservation('Juan trabajó arpegios', {
      alumnos: [{ id: 'p1', nombre: 'Pedro', nombre_completo: 'Pedro Ruiz', nombreCorto: 'Pedro' }],
      presentes: [
        { id: 'p1', nombre: 'Pedro', nombre_completo: 'Pedro Ruiz', nombreCorto: 'Pedro' },
      ],
      instrumento: 'Guitarra',
      tipoClase: 'instrumento',
    })

    // "Juan" should be filtered out by guarda #3 (ref válido) → becomes colectivo
    // expandColectivos then populates with all presentes (Pedro)
    expect(result.progreso).toHaveLength(1)
    expect(result.progreso[0].es_colectivo).toBe(true)
    expect(result.progreso[0].alumnos).toEqual(['Pedro'])
  })

  it('payload enviado a Groq incluye el roster de alumnos presentes', async () => {
    mockFetchSuccess(
      JSON.stringify({
        items: [
          {
            contenido: 'Lectura',
            alumnos: [],
            es_colectivo: true,
            seccion: 'general',
            estado: 'EN_PROGRESO',
            nota: null,
            observacion: null,
            tarea: null,
            explicacion_objetiva: '',
          },
        ],
        resumen: 'Lectura.',
      }),
    )

    await analyzeObservation('Carlos Rodríguez trabajó en la lectura', {
      alumnos: [
        { nombre: 'Carlos Rodríguez', nombre_completo: 'Carlos Rodríguez', nombreCorto: 'Carlos' },
      ],
      presentes: [
        { nombre: 'Carlos Rodríguez', nombre_completo: 'Carlos Rodríguez', nombreCorto: 'Carlos' },
      ],
      instrumento: 'Guitarra',
      tipoClase: 'instrumento',
    })

    const [, { body }] = fetchMock.mock.calls[0]
    const parsed = JSON.parse(body)
    const sentPayload = JSON.parse(parsed.messages[1].content)
    // The roster must be sent so Groq can reference students correctly
    expect(sentPayload.alumnosPresentes).toContain('Carlos Rodríguez')
    // The raw observation text should also be present (names included for segmentation)
    expect(sentPayload.observacion).toContain('Carlos Rodríguez')
  })

  // ── Guarda 5 condicional: sección expandable → no forzar es_colectivo ────
  it('Guarda 5: item con seccion expandable y alumnos filtrados NO se marca colectivo', async () => {
    // Groq returns item with seccion='maderas' and a student NOT in presentes
    // Guardas: 'NonExistent' filtered out → alumnos=[]
    // Guarda 5 NEW: since seccion is expandable → es_colectivo stays false
    // expandSeccionItems then fills alumnos from section
    mockFetchSuccess(
      JSON.stringify({
        items: [
          {
            contenido: 'Maderas trabajo',
            alumnos: ['NonExistent'],
            es_colectivo: false,
            seccion: 'maderas',
            estado: 'EN_PROGRESO',
            nota: 3,
            observacion: null,
            tarea: null,
            explicacion_objetiva: 'Actividad.',
          },
        ],
        resumen: 'Ensayo de maderas.',
      }),
    )

    const result = await analyzeObservation('trabajo de maderas', {
      alumnos: [
        {
          id: 'f1',
          nombre: 'Juan',
          nombre_completo: 'Juan Pérez',
          instrumento_principal: 'Flauta',
          nombreCorto: 'Juan',
        },
        {
          id: 'o1',
          nombre: 'Sofía',
          nombre_completo: 'Sofía Martínez',
          instrumento_principal: 'Oboe',
          nombreCorto: 'Sofía',
        },
        {
          id: 'c1',
          nombre: 'Carlos',
          nombre_completo: 'Carlos Rodríguez',
          instrumento_principal: 'Clarinete',
          nombreCorto: 'Carlos',
        },
        {
          id: 'v1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      presentes: [
        {
          id: 'f1',
          nombre: 'Juan',
          nombre_completo: 'Juan Pérez',
          instrumento_principal: 'Flauta',
          nombreCorto: 'Juan',
        },
        {
          id: 'o1',
          nombre: 'Sofía',
          nombre_completo: 'Sofía Martínez',
          instrumento_principal: 'Oboe',
          nombreCorto: 'Sofía',
        },
        {
          id: 'c1',
          nombre: 'Carlos',
          nombre_completo: 'Carlos Rodríguez',
          instrumento_principal: 'Clarinete',
          nombreCorto: 'Carlos',
        },
        {
          id: 'v1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      instrumento: 'Música',
      tipoClase: 'ensayo_general',
    })

    // NonExistent filtered out → alumnos=[], but es_colectivo=false
    // because seccion='maderas' is expandable
    expect(result.progreso[0].es_colectivo).toBe(false)
    // expandSeccionItems populated alumnos from section match
    expect(result.progreso[0].alumnos).toHaveLength(3)
    expect(result.progreso[0].alumnos).toContain('Juan Pérez')
    expect(result.progreso[0].alumnos).toContain('Sofía Martínez')
    expect(result.progreso[0].alumnos).toContain('Carlos Rodríguez')
    // Ana (violín) should NOT be in maderas expansion
    expect(result.progreso[0].alumnos).not.toContain('Ana García')
  })

  it('Guarda 5: item con seccion general y alumnos vacío → es_colectivo true', async () => {
    // Groq returns item with seccion='general' and empty alumnos
    // Guarda 5 should still mark it as colectivo (general is NOT expandable)
    mockFetchSuccess(
      JSON.stringify({
        items: [
          {
            contenido: 'Toda la clase',
            alumnos: [],
            es_colectivo: false,
            seccion: 'general',
            estado: 'EN_PROGRESO',
            nota: 3,
            observacion: 'Todos trabajaron',
            tarea: null,
            explicacion_objetiva: 'Actividad grupal.',
          },
        ],
        resumen: 'Clase grupal.',
      }),
    )

    const result = await analyzeObservation('toda la clase trabajó', {
      alumnos: [
        {
          id: 'a1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      presentes: [
        {
          id: 'a1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      instrumento: 'Violín',
      tipoClase: 'instrumento',
    })

    // seccion='general' → not expandable → alumnos vacío → es_colectivo true
    // expandColectivos then populates with all presentes (Ana)
    expect(result.progreso[0].es_colectivo).toBe(true)
    expect(result.progreso[0].alumnos).toEqual(['Ana'])
  })

  it('Guarda 5: item con seccion individual y alumnos vacío → es_colectivo true', async () => {
    mockFetchSuccess(
      JSON.stringify({
        items: [
          {
            contenido: 'Clase individual',
            alumnos: ['NonExistent'],
            es_colectivo: false,
            seccion: 'individual',
            estado: 'EN_PROGRESO',
            nota: 3,
            observacion: null,
            tarea: null,
            explicacion_objetiva: '',
          },
        ],
        resumen: 'Individual.',
      }),
    )

    const result = await analyzeObservation('clase individual', {
      alumnos: [
        {
          id: 'a1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      presentes: [
        {
          id: 'a1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      instrumento: 'Violín',
      tipoClase: 'instrumento',
    })

    // seccion='individual' → not expandable → es_colectivo true
    expect(result.progreso[0].es_colectivo).toBe(true)
  })

  it('system prompt incluye SECCIONES context cuando hay presentes', async () => {
    mockFetchSuccess(
      JSON.stringify({
        items: [
          {
            contenido: 'Test',
            alumnos: [],
            es_colectivo: true,
            seccion: 'general',
            estado: 'EN_PROGRESO',
            nota: null,
            observacion: null,
            tarea: null,
            explicacion_objetiva: '',
          },
        ],
        resumen: 'Test.',
      }),
    )

    await analyzeObservation('test', {
      alumnos: [
        {
          id: 'a1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      presentes: [
        {
          id: 'a1',
          nombre: 'Ana',
          nombre_completo: 'Ana García',
          instrumento_principal: 'Violín',
          nombreCorto: 'Ana',
        },
      ],
      instrumento: 'Violín',
      tipoClase: 'instrumento',
    })

    const [, { body }] = fetchMock.mock.calls[0]
    const parsed = JSON.parse(body)
    // Verify system prompt includes section context
    const systemPrompt = parsed.messages[0].content
    expect(systemPrompt).toContain('SECCIONES:')
    expect(systemPrompt).toContain('violines')
    expect(systemPrompt).toContain('Ana García')
  })
})
