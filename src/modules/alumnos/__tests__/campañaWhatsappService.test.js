import { describe, it, expect, vi, beforeEach } from 'vitest'

function createQueryMock() {
  const q = {
    _data: null,
    _error: null,
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    gte: vi.fn(() => q),
    lte: vi.fn(() => q),
    order: vi.fn(() => q),
    limit: vi.fn(() => q),
    insert: vi.fn(() => q),
    upsert: vi.fn(() => q),
    single: vi.fn(() => Promise.resolve({ data: q._data, error: q._error })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: q._data, error: q._error })),
    then(resolve) { return Promise.resolve({ data: q._data, error: q._error }).then(resolve) },
  }
  return q
}

function setQueryResult(table, result) {
  const q = queries[table] || createQueryMock()
  queries[table] = q
  q._data = result.data
  q._error = result.error
  return q
}

const queries = {}
const mockSupabaseFrom = vi.fn((table) => {
  if (!queries[table]) queries[table] = createQueryMock()
  return queries[table]
})
const mockSupabaseRpc = vi.fn()

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockSupabaseFrom(...args),
    rpc: (...args) => mockSupabaseRpc(...args),
  },
}))

const mockAnalizarIntencion = vi.fn()
vi.mock('../domain/intencionParser.js', () => ({
  analizarIntencion: (...args) => mockAnalizarIntencion(...args),
}))

const mockDecidirAccion = vi.fn()
const mockConflictoToMensaje = vi.fn()
const mockHayConflictoCita = vi.fn()
const mockActualizarEstadoPostulante = vi.fn()
const mockObtenerPostulante = vi.fn()

vi.mock('../domain/flujoInscripcionWhatsApp.js', () => ({
  decidirAccion: (...args) => mockDecidirAccion(...args),
  conflictoToMensaje: (...args) => mockConflictoToMensaje(...args),
  CONV_ESTADOS: {
    ESPERANDO_RESPUESTA: 'esperando_respuesta_campania',
    OFRECIENDO_HORARIOS: 'ofreciendo_horarios',
    AGENDANDO_CITA: 'agendando_cita',
    CONFIRMADA: 'cita_confirmada',
    ESPERANDO_CONFIRMACION_D1: 'esperando_confirmacion_d1',
    CANCELADA: 'cancelada',
  },
}))

vi.mock('../api/postulantesApi.js', () => ({
  hayConflictoCita: (...args) => mockHayConflictoCita(...args),
  actualizarEstadoPostulante: (...args) => mockActualizarEstadoPostulante(...args),
  obtenerPostulante: (...args) => mockObtenerPostulante(...args),
}))

import {
  iniciarCampaña,
  procesarMensajeEntrante,
  verificarDisponibilidad,
  ejecutarRecordatorios,
} from '../services/campañaWhatsappService.js'

function mockPostulantesQuery(returns) {
  const q = setQueryResult('postulantes', returns)
  q.select = vi.fn(() => q)
  q.eq = vi.fn(() => q)
  q.gte = vi.fn(() => q)
  q.lte = vi.fn(() => q)
  q.order = vi.fn(() => q)
  return q
}

function mockConversacionesQuery(returns) {
  const q = setQueryResult('conversaciones_whatsapp', returns)
  q.upsert = vi.fn(() => ({
    select: vi.fn(() => ({
      maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'conv-' + Date.now() }, error: null })),
    })),
  }))
  return q
}

function mockWhatsappQueueQuery() {
  const q = queries['hermes_whatsapp_queue'] || createQueryMock()
  queries['hermes_whatsapp_queue'] = q
  q.insert = vi.fn(() => ({
    select: vi.fn(() => ({
      maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'q-' + Date.now() }, error: null })),
    })),
  }))
  return q
}

const POSTULANTE_MOCK = {
  id: 'p1',
  nombre_completo: 'Carlitos Pérez',
  estado: 'en_espera',
  madre_nombre: 'María Pérez',
  madre_tlf_whatsapp: '+18091234567',
  padre_tlf_whatsapp: null,
  telefono_alumno: null,
  representante_tlf: null,
  representante_nombre: 'María Pérez',
  fecha_cita: '2026-07-10T10:00:00.000Z',
  notas_seguimiento: '',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('iniciarCampaña', () => {
  it('obtiene postulantes en_espera y encola mensajes', async () => {
    mockPostulantesQuery({ data: [POSTULANTE_MOCK], error: null })
    mockConversacionesQuery({ data: null, error: null })
    mockWhatsappQueueQuery()

    const result = await iniciarCampaña()

    expect(result.enviados).toBe(1)
    expect(result.total).toBe(1)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('postulantes')
  })

  it('no falla si no hay postulantes en espera', async () => {
    mockPostulantesQuery({ data: [], error: null })
    const result = await iniciarCampaña()
    expect(result.enviados).toBe(0)
    expect(result.total).toBe(0)
  })

  it('reemplaza {nombre} y {alumno} en el mensaje', async () => {
    mockPostulantesQuery({ data: [POSTULANTE_MOCK], error: null })
    mockConversacionesQuery({ data: null, error: null })
    mockWhatsappQueueQuery()

    let mensajeEncolado = ''
    queries['hermes_whatsapp_queue'].insert = vi.fn((payload) => {
      mensajeEncolado = payload.mensaje
      return {
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'q1' }, error: null })),
        })),
      }
    })

    await iniciarCampaña()
    expect(mensajeEncolado).toContain('María Pérez')
    expect(mensajeEncolado).toContain('Carlitos Pérez')
    expect(mensajeEncolado).not.toContain('{nombre}')
    expect(mensajeEncolado).not.toContain('{alumno}')
  })

  it('permite sobreescribir plantilla', async () => {
    mockPostulantesQuery({ data: [POSTULANTE_MOCK], error: null })
    mockConversacionesQuery({ data: null, error: null })
    mockWhatsappQueueQuery()

    let mensajeEncolado = ''
    queries['hermes_whatsapp_queue'].insert = vi.fn((payload) => {
      mensajeEncolado = payload.mensaje
      return {
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'q1' }, error: null })),
        })),
      }
    })

    await iniciarCampaña('¡Hola {nombre}! Mensaje personalizado para {alumno}.')
    expect(mensajeEncolado).toContain('Mensaje personalizado')
    expect(mensajeEncolado).toContain('María Pérez')
    expect(mensajeEncolado).toContain('Carlitos Pérez')
  })
})

describe('procesarMensajeEntrante', () => {
  it('analiza, decide y ejecuta pipeline completo', async () => {
    mockObtenerPostulante.mockResolvedValue(POSTULANTE_MOCK)
    mockConversacionesQuery({ data: null, error: null })
    mockWhatsappQueueQuery()

    mockAnalizarIntencion.mockResolvedValue({
      intencion: 'agendar_cita', confianza: 0.95, argumento: null, fecha_sugerida: null,
    })

    mockDecidirAccion.mockReturnValue({
      mensaje: '¡Excelente! ¿Qué día le queda bien?',
      siguienteEstado: 'ofreciendo_horarios',
      pipelineAction: {
        tipo: 'transicionar',
        nuevoEstado: 'contactado',
        meta: { notas_seguimiento: 'Contacto vía WhatsApp.' },
      },
    })

    const result = await procesarMensajeEntrante('p1', 'sí quiero', '+18091234567')

    expect(result.intencion).toBe('agendar_cita')
    expect(result.mensajeRespuesta).toContain('Excelente')
    expect(mockAnalizarIntencion).toHaveBeenCalled()
    expect(mockDecidirAccion).toHaveBeenCalled()
    expect(mockActualizarEstadoPostulante).toHaveBeenCalledWith('p1', 'contactado', expect.any(Object))
  })

  it('encola respuesta si hay mensaje', async () => {
    mockObtenerPostulante.mockResolvedValue(POSTULANTE_MOCK)
    mockConversacionesQuery({ data: null, error: null })
    mockWhatsappQueueQuery()

    mockAnalizarIntencion.mockResolvedValue({
      intencion: 'cancelar', confianza: 0.9, argumento: null, fecha_sugerida: null,
    })

    mockDecidirAccion.mockReturnValue({
      mensaje: 'Entendemos, gracias.',
      siguienteEstado: 'cancelada',
      pipelineAction: { tipo: 'transicionar', nuevoEstado: 'descartado', meta: {} },
    })

    let mensajeEnviado = ''
    queries['hermes_whatsapp_queue'].insert = vi.fn((payload) => {
      mensajeEnviado = payload.mensaje
      return {
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'q1' }, error: null })),
        })),
      }
    })

    const result = await procesarMensajeEntrante('p1', 'no gracias', '+18091234567')

    expect(result.mensajeRespuesta).toBe('Entendemos, gracias.')
    expect(mensajeEnviado).toBe('Entendemos, gracias.')
  })

  it('no encola mensaje si la decisión devuelve null', async () => {
    mockObtenerPostulante.mockResolvedValue(POSTULANTE_MOCK)
    mockConversacionesQuery({
      data: { id: 'conv-existente', estado_conversacion: 'esperando_respuesta_campania', reintentos: 2 },
      error: null,
    })
    mockWhatsappQueueQuery()

    mockAnalizarIntencion.mockResolvedValue({
      intencion: 'no_respuesta', confianza: 0, argumento: null, fecha_sugerida: null,
    })

    mockDecidirAccion.mockReturnValue({
      mensaje: null,
      siguienteEstado: 'cancelada',
      pipelineAction: null,
    })

    let insertedCount = 0
    queries['hermes_whatsapp_queue'].insert = vi.fn(() => {
      insertedCount++
      return {
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      }
    })

    await procesarMensajeEntrante('p1', '...', '+18091234567')
    expect(insertedCount).toBe(0)
  })

  it('falla si postulante no existe', async () => {
    mockObtenerPostulante.mockResolvedValue(null)
    await expect(procesarMensajeEntrante('fake', 'hola', '123'))
      .rejects.toThrow('no encontrado')
  })

  it('usa conversación existente si hay', async () => {
    mockObtenerPostulante.mockResolvedValue(POSTULANTE_MOCK)
    mockConversacionesQuery({
      data: { id: 'conv-existente', estado_conversacion: 'ofreciendo_horarios', reintentos: 0, ultimo_mensaje_enviado: '¿Qué día le queda bien?' },
      error: null,
    })
    mockWhatsappQueueQuery()

    mockAnalizarIntencion.mockResolvedValue({
      intencion: 'agendar_cita', confianza: 0.9, argumento: null, fecha_sugerida: '2026-07-15T09:00:00.000Z',
    })

    mockDecidirAccion.mockReturnValue({
      mensaje: 'Verificando disponibilidad...',
      siguienteEstado: 'agendando_cita',
      pipelineAction: null,
    })

    await procesarMensajeEntrante('p1', 'el jueves', '+18091234567')

    expect(mockAnalizarIntencion).toHaveBeenCalledWith(
      'el jueves',
      expect.objectContaining({ ultimoMensajeEnviado: '¿Qué día le queda bien?' }),
    )
  })
})

describe('verificarDisponibilidad', () => {
  it('retorna disponible si no hay conflicto', async () => {
    mockHayConflictoCita.mockResolvedValue(false)
    const result = await verificarDisponibilidad('2026-07-15T09:00:00.000Z')
    expect(result.disponible).toBe(true)
  })

  it('retorna no disponible y sugiere alternativas si hay conflicto', async () => {
    mockHayConflictoCita.mockResolvedValue(true)
    const result = await verificarDisponibilidad('2026-07-15T09:00:00.000Z')
    expect(result.disponible).toBe(false)
  })

  it('retorna no disponible si no se proporciona fecha', async () => {
    const result = await verificarDisponibilidad(null)
    expect(result.disponible).toBe(false)
    expect(result.mensaje).toContain('No se proporcionó')
  })
})

describe('ejecutarRecordatorios', () => {
  it('encola recordatorios para citas de mañana', async () => {
    mockPostulantesQuery({
      data: [POSTULANTE_MOCK],
      error: null,
    })
    mockConversacionesQuery({ data: null, error: null })
    mockWhatsappQueueQuery()

    let mensajeEncolado = ''
    queries['hermes_whatsapp_queue'].insert = vi.fn((payload) => {
      mensajeEncolado = payload.mensaje
      return {
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 'q1' }, error: null })),
        })),
      }
    })

    const result = await ejecutarRecordatorios()

    expect(result.enviados).toBe(1)
    expect(mensajeEncolado).toContain('recordamos')
    expect(mensajeEncolado).toContain('mañana')
    expect(mensajeEncolado).toContain('Cédula del representante')
  })

  it('no falla si no hay citas mañana', async () => {
    mockPostulantesQuery({ data: [], error: null })
    const result = await ejecutarRecordatorios()
    expect(result.enviados).toBe(0)
    expect(result.total).toBe(0)
  })
})
