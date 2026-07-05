/**
 * Integration test — curriculo-tres-planos WU #9.
 *
 * Ejercita el flujo bidireccional completo maestro -> ACM usando las
 * implementaciones mock (demo parity, WU #8), sin depender de Supabase:
 *
 *   1. El maestro sube un archivo -> planningParserService lo parsea y
 *      valida (WU #4).
 *   2. El maestro envía la propuesta -> proponerContenidoMock la persiste
 *      con origen='maestro' y status='propuesta' (WU #7/#8).
 *   3. El ACM la ve en su bandeja -> propuestasMock.listarPropuestasPendientes
 *      (WU #6/#8).
 *   4. El ACM publica -> status pasa a 'published' y desaparece de la
 *      bandeja de pendientes.
 *
 * No cubre la progresión del alumno (getObjetivoActual) porque opera sobre
 * route_versions YA publicadas del fixture base, no sobre la propuesta
 * recién creada — eso se prueba de forma aislada en progressionMock.test.js.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/portal-maestros/services/groqService.js', () => ({
  callGroq: vi.fn(),
}))

import { callGroq } from '../../../src/portal-maestros/services/groqService.js'
import { chunkPlanningText, validatePlanningStructure } from '../../../src/portal-maestros/services/planningParserService.js'
import { enviarPropuesta } from '../../../src/portal-maestros/services/proponerContenidoMock.js'
import {
  listarPropuestasPendientes,
  publicarPropuesta,
} from '../../../src/modules/planificacion/api/propuestasMock.js'

const ESTRUCTURA_ESPERADA = {
  niveles: [
    {
      nombre: 'Nivel 1 - Iniciación',
      numero_nivel: 1,
      temas: [
        {
          nombre: 'Postura',
          tipo: 'TECNICA',
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

describe('curriculo-tres-planos: flujo maestro -> ACM (demo)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('sube, parsea, propone, aparece en la bandeja ACM, y desaparece al publicar', async () => {
    // 1. Parseo (WU #4): un chunk único, sin necesidad real de IA porque
    //    mockeamos callGroq para devolver la estructura esperada.
    callGroq.mockResolvedValue(JSON.stringify(ESTRUCTURA_ESPERADA))
    const rawText = 'Nivel 1 - Iniciación\nPostura: mantener la espalda recta.'
    const chunks = chunkPlanningText(rawText)
    expect(chunks).toEqual([rawText])

    // Reutiliza el mismo camino que parsePlanningFile usaría internamente:
    // valida la estructura devuelta por la IA antes de continuar.
    expect(() => validatePlanningStructure(ESTRUCTURA_ESPERADA)).not.toThrow()

    // 2. Propuesta del maestro (WU #7/#8)
    const propuesta = await enviarPropuesta(ESTRUCTURA_ESPERADA, {
      maestroId: 'demo-maestro-1',
      claseId: 'demo-clase-1',
    })
    expect(propuesta.status).toBe('propuesta')
    expect(propuesta.origen).toBe('maestro')

    // 3. Bandeja ACM (WU #6/#8) — incluye la propuesta pre-cargada del
    //    fixture (demo-route-version-propuesta-1).
    const pendientesAntes = await listarPropuestasPendientes()
    expect(pendientesAntes.length).toBeGreaterThanOrEqual(1)
    const propuestaPrecargada = pendientesAntes.find((p) => p.id === 'demo-route-version-propuesta-1')
    expect(propuestaPrecargada).toBeTruthy()
    expect(propuestaPrecargada.levels[0].nodes[0].objetivos[0].indicators.length).toBeGreaterThan(0)

    // 4. Publicar (WU #6/#8) — desaparece de pendientes
    await publicarPropuesta(propuestaPrecargada.id)
    const pendientesDespues = await listarPropuestasPendientes()
    expect(pendientesDespues.find((p) => p.id === propuestaPrecargada.id)).toBeUndefined()
  })

  it('la propuesta recién enviada por el maestro aparece de inmediato en la bandeja ACM (store demo unificado)', async () => {
    // proponerContenidoMock.js y propuestasMock.js comparten el mismo store
    // (assets/data/mocks/curriculoTresPlanosStore.js) — una propuesta creada
    // por el maestro es visible sin recargar ni re-sembrar nada, igual que
    // en producción (ambos leen/escriben la tabla real route_versions).
    const propuesta = await enviarPropuesta(ESTRUCTURA_ESPERADA, {
      maestroId: 'demo-maestro-2',
      claseId: 'demo-clase-1',
    })

    const pendientes = await listarPropuestasPendientes()
    const encontrada = pendientes.find((p) => p.id === propuesta.id)

    expect(encontrada).toBeTruthy()
    expect(encontrada.origen).toBe('maestro')
    expect(encontrada.levels[0].nodes[0].objetivos[0].indicators[0].description).toBe('Espalda alineada')

    // El ciclo se cierra igual que con las propuestas pre-cargadas: publicar
    // la saca de la bandeja de pendientes.
    await publicarPropuesta(propuesta.id)
    const pendientesFinal = await listarPropuestasPendientes()
    expect(pendientesFinal.find((p) => p.id === propuesta.id)).toBeUndefined()
  })
})
