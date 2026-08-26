import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => {
  const rpcMock = vi.fn()
  const fromMock = vi.fn()
  return {
    supabase: {
      rpc: rpcMock,
      from: fromMock,
    },
  }
})

import { supabase } from '../../../lib/supabaseClient.js'
import {
  orquestarConcierto,
  confirmarTiempoTraslado,
  getEventoConcierto,
  getTareasConcierto,
  procesarFeedbackTarea,
  getAlertasConcierto,
  getHitosConcierto,
  enviarMensajeTelegram,
} from '../api/hermesOrchestrationApi.js'

describe('Hermes Orchestration API Suite (SOP-SOI-CON-001)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('orquestarConcierto should call fn_hermes_orquestar_concierto RPC correctly', async () => {
    const mockResponse = {
      success: true,
      evento_id: '123e4567-e89b-12d3-a456-426614174000',
      tareas_creadas: 7,
      hitos_inicializados: 11,
      alertas_detectadas: 1,
      estado_actual: 'G1',
    }

    supabase.rpc.mockResolvedValueOnce({ data: mockResponse, error: null })

    const result = await orquestarConcierto({
      nombre: 'Gala Sinfónica de Primavera',
      lugar: 'Anfiteatro Punta Cana',
      fecha: '2026-10-15',
      hora: '19:00:00',
      institucion: 'Fundación El Sistema',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('fn_hermes_orquestar_concierto', {
      p_nombre: 'Gala Sinfónica de Primavera',
      p_lugar: 'Anfiteatro Punta Cana',
      p_fecha: '2026-10-15',
      p_hora: '19:00:00',
      p_institucion: 'Fundación El Sistema',
      p_mensaje_original: null,
    })
    expect(result).toEqual(mockResponse)
  })

  it('confirmarTiempoTraslado should calculate timeline via RPC', async () => {
    const mockTiempos = {
      success: true,
      evento_id: 'ev-1',
      tiempo_traslado_minutos: 45,
      convocatoria_estimada: '2026-10-15T16:15:00Z',
      salida_estimada: '2026-10-15T17:00:00Z',
      llegada_estimada: '2026-10-15T17:45:00Z',
      fin_concierto_estimado: '2026-10-15T20:00:00Z',
      regreso_estimado: '2026-10-15T21:30:00Z',
      recogida_estimada: '2026-10-15T22:00:00Z',
      duracion_operativa_total_horas: 5.75,
    }

    supabase.rpc.mockResolvedValueOnce({ data: mockTiempos, error: null })

    const res = await confirmarTiempoTraslado('ev-1', 45)
    expect(supabase.rpc).toHaveBeenCalledWith('fn_hermes_calcular_tiempos_concierto', {
      p_evento_id: 'ev-1',
      p_tiempo_traslado_minutos: 45,
    })
    expect(res).toEqual(mockTiempos)
  })

  it('procesarFeedbackTarea should invoke DAG feedback resolution RPC', async () => {
    const mockFeedbackResult = {
      success: true,
      tarea_id: 't-1',
      evento_id: 'ev-1',
      estado_nuevo: 'completada',
      tareas_desbloqueadas: 1,
      acciones: ['Desbloqueada tarea: Checklist logístico y transporte'],
    }

    supabase.rpc.mockResolvedValueOnce({ data: mockFeedbackResult, error: null })

    const res = await procesarFeedbackTarea('t-1', 'completada', {
      respuesta: 'Sí',
      observaciones: 'Repertorio listo con 4 obras ensambladas',
      por_quien: 'Manuel (ACM)',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('fn_hermes_procesar_feedback_tarea', {
      p_tarea_id: 't-1',
      p_estado_nuevo: 'completada',
      p_feedback: {
        respuesta: 'Sí',
        observaciones: 'Repertorio listo con 4 obras ensambladas',
        por_quien: 'Manuel (ACM)',
      },
    })
    expect(res).toEqual(mockFeedbackResult)
  })

  it('getTareasConcierto should query tareas_concierto table ordered by priority', async () => {
    const mockTareas = [
      { id: 't-dir', departamento: 'DIR', titulo: 'Definición de beneficio', prioridad: 2 },
      { id: 't-acm', departamento: 'ACM', titulo: 'Validar repertorio', prioridad: 1 },
    ]

    const order2 = vi.fn().mockResolvedValueOnce({ data: mockTareas, error: null })
    const order1 = vi.fn().mockReturnValue({ order: order2 })
    const eqMock = vi.fn().mockReturnValue({ order: order1 })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    supabase.from.mockReturnValue({ select: selectMock })

    const res = await getTareasConcierto('ev-123')
    expect(supabase.from).toHaveBeenCalledWith('tareas_concierto')
    expect(selectMock).toHaveBeenCalledWith('*')
    expect(eqMock).toHaveBeenCalledWith('evento_id', 'ev-123')
    expect(res).toEqual(mockTareas)
  })

  it('enviarMensajeTelegram should insert raw message into hermes_inbox_telegram', async () => {
    const mockInserted = {
      id: 'msg-1',
      chat_id: 123456,
      mensaje: 'Hermes, tenemos concierto el 10 de octubre',
      procesado: false,
    }

    const singleMock = vi.fn().mockResolvedValueOnce({ data: mockInserted, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: singleMock })
    const insertMock = vi.fn().mockReturnValue({ select: selectMock })
    supabase.from.mockReturnValue({ insert: insertMock })

    const res = await enviarMensajeTelegram({
      chatId: 123456,
      userId: 987,
      userName: 'DirectorOmar',
      texto: 'Hermes, tenemos concierto el 10 de octubre',
    })

    expect(supabase.from).toHaveBeenCalledWith('hermes_inbox_telegram')
    expect(res).toEqual(mockInserted)
  })
})
