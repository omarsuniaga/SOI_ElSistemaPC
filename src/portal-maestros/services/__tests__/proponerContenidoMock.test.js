/**
 * Tests para proponerContenidoMock.js — curriculo-tres-planos WU #8 (demo parity).
 *
 * Réplica en memoria de enviarPropuesta (proponerContenidoService.js, WU #7)
 * para que proponerContenidoView.js funcione en modo demo sin Supabase.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { enviarPropuesta } from '../proponerContenidoMock.js'

const estructuraValida = {
  niveles: [
    {
      nombre: 'Nivel 1',
      numero_nivel: 1,
      temas: [
        {
          nombre: 'Postura',
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

describe('proponerContenidoMock.enviarPropuesta', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('crea una nueva route_version con origen=maestro y status=propuesta en memoria', async () => {
    const result = await enviarPropuesta(estructuraValida, {
      maestroId: 'demo-maestro-1',
      claseId: 'demo-clase-1',
    })

    expect(result.origen).toBe('maestro')
    expect(result.status).toBe('propuesta')
    expect(result.propuesta_por).toBe('demo-maestro-1')
    expect(result.clase_id).toBe('demo-clase-1')
    expect(result.id).toBeTruthy()
  })

  it('requiere maestroId y claseId', async () => {
    await expect(enviarPropuesta(estructuraValida, { claseId: 'demo-clase-1' })).rejects.toThrow(/maestroId/)
    await expect(enviarPropuesta(estructuraValida, { maestroId: 'demo-maestro-1' })).rejects.toThrow(/claseId/)
  })
})
