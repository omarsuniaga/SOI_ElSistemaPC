import { describe, it, expect, vi } from 'vitest'
import { sugerirSiguienteUnidadIA } from '../services/aiEvaluacionService.js'
import * as groqModule from '../api/groqService.js'

describe('sugerirSiguienteUnidadIA - Prueba Analítica e Incremental', () => {
  it('debe enviar el historial pedagógico a GROQ y retornar 1 unidad con múltiples indicadores y prerrequisitos válidos', async () => {
    const mockGroqResponse = JSON.stringify({
      titulo: 'Unidad 2: Digitación y Articulación Melódica',
      complejidad: 'alta',
      clasesEstimadas: 4,
      justificacionPedagogica: 'Requiere 4 clases para afianzar el cambio de posición y afinación exacta.',
      indicadores: [
        { titulo: 'Digitación de 1er y 2do dedo en cuerda La', esPrerrequisitoDeSiguiente: true },
        { titulo: 'Digitación de 3er dedo y afinación de 5ta justa', esPrerrequisitoDeSiguiente: true },
        { titulo: 'Arpegiado a velocidad continua 72 BPM', esPrerrequisitoDeSiguiente: false },
      ],
    })

    vi.spyOn(groqModule, 'callGroq').mockResolvedValueOnce(mockGroqResponse)

    const resultado = await sugerirSiguienteUnidadIA({
      instrumento: 'Violín',
      nivelNombre: 'Nivel 1: Básico',
      numeroUnidad: 2,
      unidadesExistentes: [
        {
          titulo: 'Unidad 1: Postura y Emisión Sonora',
          indicadores: [{ titulo: 'Postura corporal equilibrada' }],
        },
      ],
    })

    expect(resultado).toBeDefined()
    expect(resultado.titulo).toContain('Unidad 2')
    expect(resultado.complejidad).toBe('alta')
    expect(resultado.clasesEstimadas).toBe(4)
    expect(resultado.indicadores.length).toBe(3)

    // Verificar encadenamiento de prerrequisitos de indicadores
    expect(resultado.indicadores[0].prerrequisitoId).toBeNull()
    expect(resultado.indicadores[1].prerrequisitoId).toBe(resultado.indicadores[0].id)
    expect(resultado.indicadores[2].prerrequisitoId).toBe(resultado.indicadores[1].id)
  })

  it('debe ejecutar el fallback pedagógico seguro en caso de fallas de red', async () => {
    vi.spyOn(groqModule, 'callGroq').mockRejectedValueOnce(new Error('Network error'))

    const resultado = await sugerirSiguienteUnidadIA({
      instrumento: 'Piano',
      nivelNombre: 'Nivel 2: Intermedio',
      numeroUnidad: 3,
      unidadesExistentes: [],
    })

    expect(resultado).toBeDefined()
    expect(resultado.titulo).toContain('Unidad 3')
    expect(resultado.indicadores.length).toBe(3)
    expect(resultado.indicadores[1].prerrequisitoId).toBe(resultado.indicadores[0].id)
  })
})
