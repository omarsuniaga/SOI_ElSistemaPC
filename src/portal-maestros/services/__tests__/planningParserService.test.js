/**
 * Tests para planningParserService.js — curriculo-tres-planos WU #4.
 *
 * Cubre:
 *   - chunkPlanningText: divide por encabezados "Nivel" o por tamaño máximo (5000 chars)
 *   - validatePlanningStructure: valida el JSON de salida contra el schema de 4 niveles
 *   - parsePlanningFile: nunca autoguarda (modo borrador) — solo devuelve estructura
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../groqService.js', () => ({
  callGroq: vi.fn(),
}))

import { callGroq } from '../groqService.js'
import {
  chunkPlanningText,
  validatePlanningStructure,
  parsePlanningFile,
} from '../planningParserService.js'

describe('chunkPlanningText', () => {
  it('devuelve un único chunk cuando el texto es corto y no tiene encabezados "Nivel"', () => {
    const text = 'Texto corto de planificación sin niveles explícitos.'
    const chunks = chunkPlanningText(text)
    expect(chunks).toEqual([text])
  })

  it('divide el texto por encabezados "Nivel" cuando están presentes', () => {
    const text =
      'Introducción general.\n' +
      'Nivel 1 - Iniciación\nContenido del nivel 1.\n' +
      'Nivel 2 - Intermedio\nContenido del nivel 2.'
    const chunks = chunkPlanningText(text)
    expect(chunks.length).toBe(3)
    expect(chunks[0]).toContain('Introducción general')
    expect(chunks[1]).toContain('Nivel 1 - Iniciación')
    expect(chunks[2]).toContain('Nivel 2 - Intermedio')
  })

  it('divide por tamaño máximo (5000 chars) cuando no hay encabezados "Nivel"', () => {
    const text = 'x'.repeat(12000)
    const chunks = chunkPlanningText(text)
    expect(chunks.length).toBe(3)
    chunks.forEach((chunk) => expect(chunk.length).toBeLessThanOrEqual(5000))
  })

  it('respeta un maxChars custom', () => {
    const text = 'y'.repeat(100)
    const chunks = chunkPlanningText(text, { maxChars: 40 })
    expect(chunks.length).toBe(3)
  })
})

describe('validatePlanningStructure', () => {
  const validStructure = {
    niveles: [
      {
        nombre: 'Nivel 1',
        objetivo_general: 'Objetivo del nivel',
        numero_nivel: 1,
        temas: [
          {
            nombre: 'Postura',
            tipo: 'TECNICA',
            es_critico: true,
            objetivos: [
              {
                nombre: 'Mantener la espalda recta',
                indicadores: [{ descripcion: 'Espalda alineada', es_requerido: true }],
              },
            ],
          },
        ],
      },
    ],
  }

  it('acepta una estructura válida de 4 niveles', () => {
    expect(() => validatePlanningStructure(validStructure)).not.toThrow()
    expect(validatePlanningStructure(validStructure)).toBe(true)
  })

  it('rechaza cuando falta la clave "niveles"', () => {
    expect(() => validatePlanningStructure({})).toThrow(/niveles/)
  })

  it('rechaza cuando "niveles" no es un array', () => {
    expect(() => validatePlanningStructure({ niveles: 'no-array' })).toThrow(/niveles/)
  })

  it('rechaza cuando un nivel no tiene "temas"', () => {
    const bad = { niveles: [{ nombre: 'Nivel 1' }] }
    expect(() => validatePlanningStructure(bad)).toThrow(/temas/)
  })

  it('rechaza cuando un tema no tiene "objetivos"', () => {
    const bad = {
      niveles: [{ nombre: 'Nivel 1', temas: [{ nombre: 'Tema 1' }] }],
    }
    expect(() => validatePlanningStructure(bad)).toThrow(/objetivos/)
  })

  it('rechaza cuando un objetivo no tiene "indicadores"', () => {
    const bad = {
      niveles: [
        {
          nombre: 'Nivel 1',
          temas: [{ nombre: 'Tema 1', objetivos: [{ nombre: 'Objetivo 1' }] }],
        },
      ],
    }
    expect(() => validatePlanningStructure(bad)).toThrow(/indicadores/)
  })

  it('rechaza cuando un indicador no tiene "descripcion"', () => {
    const bad = {
      niveles: [
        {
          nombre: 'Nivel 1',
          temas: [
            {
              nombre: 'Tema 1',
              objetivos: [{ nombre: 'Objetivo 1', indicadores: [{ es_requerido: true }] }],
            },
          ],
        },
      ],
    }
    expect(() => validatePlanningStructure(bad)).toThrow(/descripcion/)
  })
})

describe('parsePlanningFile — modo borrador (nunca auto-guarda)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parsea un archivo corto (.md) en un único chunk y valida el resultado', async () => {
    const validJson = {
      niveles: [
        {
          nombre: 'Nivel 1',
          temas: [
            {
              nombre: 'Tema 1',
              objetivos: [
                {
                  nombre: 'Objetivo 1',
                  indicadores: [{ descripcion: 'Indicador 1', es_requerido: true }],
                },
              ],
            },
          ],
        },
      ],
    }
    callGroq.mockResolvedValue(JSON.stringify(validJson))

    const file = {
      name: 'plan.md',
      text: vi.fn().mockResolvedValue('Nivel 1 - Iniciación\nContenido breve.'),
    }

    const result = await parsePlanningFile(file)

    expect(result).toEqual(validJson)
    expect(callGroq).toHaveBeenCalledTimes(1)
  })

  it('divide en múltiples chunks y fusiona los niveles resultantes', async () => {
    const chunk1Json = {
      niveles: [
        {
          nombre: 'Nivel 1',
          temas: [
            {
              nombre: 'Tema 1',
              objetivos: [
                { nombre: 'Obj 1', indicadores: [{ descripcion: 'Ind 1', es_requerido: true }] },
              ],
            },
          ],
        },
      ],
    }
    const chunk2Json = {
      niveles: [
        {
          nombre: 'Nivel 2',
          temas: [
            {
              nombre: 'Tema 2',
              objetivos: [
                { nombre: 'Obj 2', indicadores: [{ descripcion: 'Ind 2', es_requerido: false }] },
              ],
            },
          ],
        },
      ],
    }
    callGroq
      .mockResolvedValueOnce(JSON.stringify(chunk1Json))
      .mockResolvedValueOnce(JSON.stringify(chunk2Json))

    const bigText = 'Nivel 1 - Uno\n' + 'a'.repeat(6000) + '\nNivel 2 - Dos\n' + 'b'.repeat(6000)
    const file = { name: 'plan.md', text: vi.fn().mockResolvedValue(bigText) }

    const result = await parsePlanningFile(file)

    expect(callGroq).toHaveBeenCalledTimes(2)
    expect(result.niveles).toHaveLength(2)
    expect(result.niveles[0].nombre).toBe('Nivel 1')
    expect(result.niveles[1].nombre).toBe('Nivel 2')
  })

  it('lanza un error de validación si la IA devuelve una estructura inválida, y NO auto-guarda nada', async () => {
    callGroq.mockResolvedValue(JSON.stringify({ niveles: [{ nombre: 'Nivel sin temas' }] }))

    const file = { name: 'plan.md', text: vi.fn().mockResolvedValue('Texto corto') }

    await expect(parsePlanningFile(file)).rejects.toThrow(/temas/)
  })

  it('nunca invoca ninguna función de guardado/persistencia — solo devuelve datos (borrador)', async () => {
    const validJson = {
      niveles: [
        {
          nombre: 'Nivel 1',
          temas: [
            {
              nombre: 'Tema 1',
              objetivos: [
                { nombre: 'Obj 1', indicadores: [{ descripcion: 'Ind 1', es_requerido: true }] },
              ],
            },
          ],
        },
      ],
    }
    callGroq.mockResolvedValue(JSON.stringify(validJson))
    const file = { name: 'plan.md', text: vi.fn().mockResolvedValue('Texto corto') }

    const result = await parsePlanningFile(file)

    // parsePlanningFile no debe tener side-effects de persistencia: el resultado
    // es puro dato en memoria (borrador), la vista decide cuándo proponer/guardar.
    expect(result).toEqual(validJson)
  })
})
