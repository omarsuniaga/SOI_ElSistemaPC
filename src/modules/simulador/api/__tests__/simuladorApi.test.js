import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as simuladorApi from '../simuladorApi.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}))

function createChain(resolvedValue, methods = []) {
  const chain = {}
  const base = ['select', 'insert', 'update', 'delete', 'eq', 'gte', 'lte', 'order', 'limit']
  ;[...new Set([...base, ...methods])].forEach((m) => {
    chain[m] = vi.fn().mockReturnThis()
  })
  chain.single = vi.fn().mockResolvedValue(resolvedValue)
  chain.maybeSingle = vi.fn().mockResolvedValue(resolvedValue)
  chain.then = vi.fn((onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled))
  return chain
}

describe('simuladorApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRuns / getRunById', () => {
    it('lista las corridas ordenadas por created_at descendente', async () => {
      const rows = [{ id: 'r1', nombre: 'Año Escolar Demo', estado: 'creado' }]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getRuns()

      expect(supabase.from).toHaveBeenCalledWith('sim_runs')
      expect(result).toEqual(rows)
    })

    it('lanza si la query de getRuns falla', async () => {
      const chain = createChain({ data: null, error: { message: 'boom' } })
      supabase.from.mockReturnValue(chain)
      await expect(simuladorApi.getRuns()).rejects.toThrow('boom')
    })

    it('obtiene una corrida por id', async () => {
      const row = { id: 'r1', nombre: 'Año Escolar Demo' }
      const chain = createChain({ data: row, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getRunById('r1')

      expect(supabase.from).toHaveBeenCalledWith('sim_runs')
      expect(chain.eq).toHaveBeenCalledWith('id', 'r1')
      expect(result).toEqual(row)
    })
  })

  describe('crearRun', () => {
    it('crea una corrida con velocidad y fecha_inicio_virtual', async () => {
      const nuevo = { id: 'r2', nombre: 'Mi corrida', velocidad: 5 }
      const chain = createChain({ data: nuevo, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.crearRun({
        nombre: 'Mi corrida',
        velocidad: 5,
        fecha_inicio_virtual: '2026-01-15T08:00:00-04:00',
      })

      expect(supabase.from).toHaveBeenCalledWith('sim_runs')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Mi corrida', velocidad: 5 }),
      )
      expect(result).toEqual(nuevo)
    })

    it('lanza si falta fecha_inicio_virtual', async () => {
      await expect(simuladorApi.crearRun({ nombre: 'x', velocidad: 5 })).rejects.toThrow()
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('actualizarEstadoRun', () => {
    it('actualiza el estado de una corrida', async () => {
      const actualizado = { id: 'r1', estado: 'corriendo' }
      const chain = createChain({ data: actualizado, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.actualizarEstadoRun('r1', 'corriendo')

      expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ estado: 'corriendo' }))
      expect(chain.eq).toHaveBeenCalledWith('id', 'r1')
      expect(result).toEqual(actualizado)
    })

    it('lanza si el estado no es válido', async () => {
      await expect(simuladorApi.actualizarEstadoRun('r1', 'volando')).rejects.toThrow()
    })
  })

  describe('actualizarVelocidadRun', () => {
    it('actualiza la velocidad de una corrida', async () => {
      const actualizado = { id: 'r1', velocidad: 20 }
      const chain = createChain({ data: actualizado, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.actualizarVelocidadRun('r1', 20)

      expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ velocidad: 20 }))
      expect(result).toEqual(actualizado)
    })

    it('lanza si la velocidad es <= 0', async () => {
      await expect(simuladorApi.actualizarVelocidadRun('r1', 0)).rejects.toThrow()
    })
  })

  describe('actualizarFechaActualRun', () => {
    it('actualiza fecha_actual_virtual', async () => {
      const actualizado = { id: 'r1', fecha_actual_virtual: '2026-02-01T00:00:00-04:00' }
      const chain = createChain({ data: actualizado, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.actualizarFechaActualRun('r1', '2026-02-01T00:00:00-04:00')

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ fecha_actual_virtual: '2026-02-01T00:00:00-04:00' }),
      )
      expect(result).toEqual(actualizado)
    })
  })

  describe('getCalendarioPorRun', () => {
    it('lista el calendario simulado de una corrida ordenado por fecha_inicio', async () => {
      const rows = [{ id: 'c1', titulo: 'Apertura de Inscripciones' }]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getCalendarioPorRun('r1')

      expect(supabase.from).toHaveBeenCalledWith('sim_calendario')
      expect(chain.eq).toHaveBeenCalledWith('run_id', 'r1')
      expect(result).toEqual(rows)
    })
  })

  describe('getEventosDelDia', () => {
    it('filtra sim_calendario por run_id y fecha_inicio (batch de eventos concurrentes)', async () => {
      const rows = [
        { id: 'c1', titulo: 'Reunión' },
        { id: 'c2', titulo: 'Audición' },
      ]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getEventosDelDia('r1', '2026-03-05')

      expect(supabase.from).toHaveBeenCalledWith('sim_calendario')
      expect(result).toEqual(rows)
    })
  })

  describe('getTareasPorRun', () => {
    it('lista sim_tareas de una corrida', async () => {
      const rows = [{ id: 't1', titulo: 'Revisar mora' }]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getTareasPorRun('r1')

      expect(supabase.from).toHaveBeenCalledWith('sim_tareas')
      expect(chain.eq).toHaveBeenCalledWith('run_id', 'r1')
      expect(result).toEqual(rows)
    })
  })

  describe('getLogPorRun', () => {
    it('lista sim_log de una corrida ordenado por created_at', async () => {
      const rows = [{ id: 'l1', agente: 'FIN', accion: 'tarea_creada' }]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getLogPorRun('r1')

      expect(supabase.from).toHaveBeenCalledWith('sim_log')
      expect(result).toEqual(rows)
    })

    it('filtra por departamento cuando se pasa la opción', async () => {
      const chain = createChain({ data: [], error: null })
      supabase.from.mockReturnValue(chain)

      await simuladorApi.getLogPorRun('r1', { departamento: 'FIN' })

      expect(chain.eq).toHaveBeenCalledWith('departamento', 'FIN')
    })
  })

  describe('getOutboxPorRun', () => {
    it('lista sim_outbox de una corrida', async () => {
      const rows = [{ id: 'o1', canal: 'whatsapp', estado: 'enviado' }]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getOutboxPorRun('r1')

      expect(supabase.from).toHaveBeenCalledWith('sim_outbox')
      expect(result).toEqual(rows)
    })
  })

  describe('getConfig', () => {
    it('lista la configuración de whitelist (sim_config)', async () => {
      const rows = [{ canal: 'whatsapp', destino: '+18097176627' }]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getConfig()

      expect(supabase.from).toHaveBeenCalledWith('sim_config')
      expect(result).toEqual(rows)
    })
  })

  describe('getActoresPorRun', () => {
    it('lista sim_actores de una corrida', async () => {
      const rows = [{ id: 'a1', tipo: 'representante', estado_pago: 'moroso' }]
      const chain = createChain({ data: rows, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await simuladorApi.getActoresPorRun('r1')

      expect(supabase.from).toHaveBeenCalledWith('sim_actores')
      expect(result).toEqual(rows)
    })
  })

  describe('invocarTick', () => {
    it('invoca la edge function simulador-tick con run_id, fecha_simulada y eventos', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { ok: true, tareas_generadas: 2 },
        error: null,
      })

      const eventos = [{ sim_calendario_id: 'c1', titulo: 'Reunión' }]
      const result = await simuladorApi.invocarTick({
        run_id: 'r1',
        fecha_simulada: '2026-03-05',
        eventos,
      })

      expect(supabase.functions.invoke).toHaveBeenCalledWith('simulador-tick', {
        body: { run_id: 'r1', fecha_simulada: '2026-03-05', eventos },
      })
      expect(result).toEqual({ ok: true, tareas_generadas: 2 })
    })

    it('lanza si la edge function devuelve error de transporte', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      })

      await expect(
        simuladorApi.invocarTick({ run_id: 'r1', fecha_simulada: '2026-03-05', eventos: [] }),
      ).rejects.toThrow('Network error')
    })

    it('lanza si falta run_id', async () => {
      await expect(
        simuladorApi.invocarTick({ fecha_simulada: '2026-03-05', eventos: [] }),
      ).rejects.toThrow()
      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })
  })
})
