import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../portal-maestros/services/groqService.js', () => ({
  callGroq: vi.fn(),
  parseGroqJSON: vi.fn((raw) => JSON.parse(raw)),
}))

import { callGroq } from '../../../portal-maestros/services/groqService.js'
import { analizarIntencion, INTENCIONES, INTENCION_DEFAULT } from '../domain/intencionParser.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('analizarIntencion', () => {
  describe('intención: agendar_cita', () => {
    it('detecta "sí quiero" como agendar_cita', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'agendar_cita', confianza: 0.95, argumento: 'quiere agendar', fecha_sugerida: null,
      }))
      const r = await analizarIntencion('sí quiero')
      expect(r.intencion).toBe('agendar_cita')
      expect(r.confianza).toBeGreaterThanOrEqual(0.9)
    })

    it('detecta "puedo el jueves" y extrae fecha_sugerida', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'agendar_cita', confianza: 0.9, argumento: 'propone jueves', fecha_sugerida: '2026-07-02',
      }))
      const r = await analizarIntencion('puedo el jueves')
      expect(r.intencion).toBe('agendar_cita')
      expect(r.fecha_sugerida).toBe('2026-07-02')
    })

    it('detecta "ok" con contexto de oferta de horario como agendar_cita', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'agendar_cita', confianza: 0.85, argumento: 'acepta horario ofrecido', fecha_sugerida: null,
      }))
      const r = await analizarIntencion('ok', { estadoPostulante: 'contactado', ultimoMensajeEnviado: '¿Puede el jueves a las 10am?' })
      expect(r.intencion).toBe('agendar_cita')
    })
  })

  describe('intención: reprogramar', () => {
    it('detecta "no puedo ese día" como reprogramar', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'reprogramar', confianza: 0.9, argumento: 'no puede en la fecha ofrecida', fecha_sugerida: null,
      }))
      const r = await analizarIntencion('no puedo ese día')
      expect(r.intencion).toBe('reprogramar')
    })
  })

  describe('intención: cancelar', () => {
    it('detecta "ya no me interesa" como cancelar', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'cancelar', confianza: 0.95, argumento: 'rechaza inscripción', fecha_sugerida: null,
      }))
      const r = await analizarIntencion('ya no me interesa, gracias')
      expect(r.intencion).toBe('cancelar')
    })
  })

  describe('intención: confirmar_asistencia', () => {
    it('detecta "sí voy, confirmado" como confirmar_asistencia', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'confirmar_asistencia', confianza: 0.95, argumento: 'confirma asistencia', fecha_sugerida: null,
      }))
      const r = await analizarIntencion('sí voy, confirmado')
      expect(r.intencion).toBe('confirmar_asistencia')
    })
  })

  describe('intención: preguntar_requisitos', () => {
    it('detecta "qué documentos necesito" como preguntar_requisitos', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'preguntar_requisitos', confianza: 0.95, argumento: 'pregunta por documentos', fecha_sugerida: null,
      }))
      const r = await analizarIntencion('qué documentos necesito llevar')
      expect(r.intencion).toBe('preguntar_requisitos')
    })
  })

  describe('intención: consulta_general', () => {
    it('detecta "cuánto cuesta" como consulta_general', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'consulta_general', confianza: 0.9, argumento: 'pregunta sobre costos', fecha_sugerida: null,
      }))
      const r = await analizarIntencion('cuánto cuesta la inscripción')
      expect(r.intencion).toBe('consulta_general')
    })
  })

  describe('intención: no_respuesta', () => {
    it('clasifica mensaje vacío como no_respuesta sin llamar a GROQ', async () => {
      const r = await analizarIntencion('')
      expect(r.intencion).toBe('no_respuesta')
      expect(callGroq).not.toHaveBeenCalled()
    })

    it('clasifica solo emojis como no_respuesta sin llamar a GROQ', async () => {
      const r = await analizarIntencion('😊👍')
      expect(r.intencion).toBe('no_respuesta')
      expect(callGroq).not.toHaveBeenCalled()
    })

    it('clasifica whitespace como no_respuesta sin llamar a GROQ', async () => {
      const r = await analizarIntencion('   \n  \n  ')
      expect(r.intencion).toBe('no_respuesta')
      expect(callGroq).not.toHaveBeenCalled()
    })
  })

  describe('manejo de errores', () => {
    it('retorna valor por defecto cuando callGroq falla', async () => {
      callGroq.mockRejectedValue(new Error('Rate limit'))
      const r = await analizarIntencion('quiero inscribirlo')
      expect(r.intencion).toBe('no_respuesta')
      expect(r.argumento).toContain('GROQ')
    })

    it('retorna valor por defecto cuando groq devuelve JSON inválido', async () => {
      callGroq.mockResolvedValue('esto no es json')
      const r = await analizarIntencion('hola')
      expect(r.intencion).toBe('no_respuesta')
    })

    it('retorna valor por defecto cuando el mensaje es null', async () => {
      const r = await analizarIntencion(null)
      expect(r.intencion).toBe('no_respuesta')
      expect(callGroq).not.toHaveBeenCalled()
    })

    it('retorna valor por defecto cuando el mensaje no es string', async () => {
      const r = await analizarIntencion(undefined)
      expect(r.intencion).toBe('no_respuesta')
      expect(callGroq).not.toHaveBeenCalled()
    })
  })

  describe('validación de confianza', () => {
    it('clampa confianza entre 0 y 1', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'agendar_cita', confianza: 5.0, argumento: null, fecha_sugerida: null,
      }))
      const r = await analizarIntencion('sí')
      expect(r.confianza).toBe(1.0)
    })

    it('usa 0 si confianza no es número', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'agendar_cita', confianza: 'alta', argumento: null, fecha_sugerida: null,
      }))
      const r = await analizarIntencion('sí')
      expect(r.confianza).toBe(0)
    })

    it('usa confianza 0 si el campo falta', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'no_respuesta',
      }))
      const r = await analizarIntencion('zzz')
      expect(r.confianza).toBe(0)
    })
  })

  describe('contexto', () => {
    it('incluye estado del postulante en el prompt a GROQ', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'confirmar_asistencia', confianza: 0.9, argumento: null, fecha_sugerida: null,
      }))
      await analizarIntencion('sí voy', { estadoPostulante: 'cita_agendada' })
      const prompt = callGroq.mock.calls[0][0]
      const userMsg = prompt.find(m => m.role === 'user').content
      expect(userMsg).toContain('cita_agendada')
    })

    it('incluye último mensaje enviado en el prompt', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'no_respuesta', confianza: 0.5, argumento: null, fecha_sugerida: null,
      }))
      await analizarIntencion('gracias', { ultimoMensajeEnviado: '¿puede el jueves a las 10am?' })
      const prompt = callGroq.mock.calls[0][0]
      const userMsg = prompt.find(m => m.role === 'user').content
      expect(userMsg).toContain('puede el jueves')
    })

    it('no incluye contexto si no se provee', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'no_respuesta', confianza: 0.5, argumento: null, fecha_sugerida: null,
      }))
      await analizarIntencion('hola')
      const prompt = callGroq.mock.calls[0][0]
      const userMsg = prompt.find(m => m.role === 'user').content
      expect(userMsg).not.toContain('CONTEXTO:')
    })
  })

  describe('intenciones inválidas del modelo', () => {
    it('fallback a no_respuesta si GROQ devuelve intención desconocida', async () => {
      callGroq.mockResolvedValue(JSON.stringify({
        intencion: 'intencion_inexistente', confianza: 0.9, argumento: null, fecha_sugerida: null,
      }))
      const r = await analizarIntencion('hola')
      expect(r.intencion).toBe('no_respuesta')
    })
  })
})
