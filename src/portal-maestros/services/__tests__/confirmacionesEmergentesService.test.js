import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  confirmarActividad,
  obtenerConfirmacionesPendientes,
  obtenerActividadPorId,
  obtenerActividadesPorAlcance,
  obtenerMaestrosAfectadosPorAlcance
} from '../confirmacionesEmergentesService.js'

describe('confirmacionesEmergentesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('confirmarActividad', () => {
    const validParams = {
      actividad_id: 'act-111-uuid',
      maestro_id: 'maestro-222-uuid',
      fecha: '2026-09-15',
      respuesta: 'si',
      observaciones: 'Confirmado por maestro'
    }

    it('valida parámetros obligatorios', async () => {
      await expect(confirmarActividad()).rejects.toThrow('se requiere actividad_id')
      await expect(confirmarActividad({ actividad_id: 'a1' })).rejects.toThrow('se requiere maestro_id')
      await expect(confirmarActividad({ actividad_id: 'a1', maestro_id: 'm1' })).rejects.toThrow('se requiere fecha')
      await expect(confirmarActividad({ actividad_id: 'a1', maestro_id: 'm1', fecha: '2026-09-15' })).rejects.toThrow('se requiere respuesta')
    })

    it('rechaza respuestas no válidas según el check constraint', async () => {
      await expect(confirmarActividad({ ...validParams, respuesta: 'tal_vez' }))
        .rejects.toThrow('respuesta inválida')
    })

    it('ejecuta RPC fn_confirmar_actividad_emergente con los argumentos requeridos', async () => {
      const mockResult = {
        id: 'conf-333-uuid',
        actividad_id: validParams.actividad_id,
        maestro_id: validParams.maestro_id,
        fecha: validParams.fecha,
        respuesta: 'si',
        estado_validacion: 'validado',
        respondido_por: 'user-auth-uuid',
        observaciones: 'Confirmado por maestro'
      }

      supabase.rpc.mockResolvedValueOnce({ data: mockResult, error: null })

      const result = await confirmarActividad(validParams)

      expect(supabase.rpc).toHaveBeenCalledWith('fn_confirmar_actividad_emergente', {
        p_actividad_id: validParams.actividad_id,
        p_maestro_id: validParams.maestro_id,
        p_fecha: validParams.fecha,
        p_respuesta: validParams.respuesta,
        p_observaciones: validParams.observaciones
      })
      expect(result).toEqual(mockResult)
    })

    it('asigna p_observaciones = null cuando observaciones no es provisto', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: { id: 'conf-1' }, error: null })
      const { observaciones, ...sinObs } = validParams
      await confirmarActividad(sinObs)

      expect(supabase.rpc).toHaveBeenCalledWith('fn_confirmar_actividad_emergente', expect.objectContaining({
        p_observaciones: null
      }))
    })

    it('garantiza idempotencia en reintentos sucesivos', async () => {
      const mockRow = {
        id: 'conf-333-uuid',
        actividad_id: validParams.actividad_id,
        maestro_id: validParams.maestro_id,
        fecha: validParams.fecha,
        respuesta: 'si',
        estado_validacion: 'validado',
        updated_at: '2026-09-15T12:00:00Z'
      }

      // First confirmation
      supabase.rpc.mockResolvedValueOnce({ data: mockRow, error: null })
      const res1 = await confirmarActividad(validParams)

      // Re-confirmation with updated remarks
      const updatedRow = { ...mockRow, observaciones: 'Modificación idempotente' }
      supabase.rpc.mockResolvedValueOnce({ data: updatedRow, error: null })
      const res2 = await confirmarActividad({ ...validParams, observaciones: 'Modificación idempotente' })

      expect(res1.id).toBe(res2.id)
      expect(res2.observaciones).toBe('Modificación idempotente')
      expect(supabase.rpc).toHaveBeenCalledTimes(2)
    })

    it('propaga error si la RPC falla o RLS rechaza la operación', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: null,
        error: new Error('new row violates row-level security policy for table "confirmaciones_emergentes"')
      })

      await expect(confirmarActividad(validParams)).rejects.toThrow('violates row-level security policy')
    })
  })

  describe('obtenerConfirmacionesPendientes', () => {
    it('valida que maestroId esté presente', async () => {
      await expect(obtenerConfirmacionesPendientes()).rejects.toThrow('se requiere maestroId')
    })

    it('consulta registros_pendientes con filtros correctos y formatea el resultado', async () => {
      const mockPendientes = [
        {
          id: 'rp-1',
          maestro_id: 'm1',
          sesion_clase_id: 'act-1',
          tipo: 'confirmacion_emergente_pendiente',
          estado: 'pendiente',
          mensaje: 'Confirmación pendiente',
          deep_link: '/maestros/confirmaciones-emergentes?actividad_id=act-1',
          created_at: '2026-09-15T08:00:00Z',
          sesion_clase: {
            id: 'act-1',
            actividad: 'Concierto Sinfónico',
            fecha: '2026-09-15',
            lugar: 'Auditorio',
            alcance_tipo: 'institucion',
            alcance_config: {},
            hora_inicio: '09:00',
            hora_fin: '12:00',
            maestro_id: 'organizador-uuid'
          }
        }
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: mockPendientes, error: null })
      const eqEstadoMock = vi.fn().mockReturnValue({ order: orderMock })
      const inTipoMock = vi.fn().mockReturnValue({ eq: eqEstadoMock })
      const eqMaestroMock = vi.fn().mockReturnValue({ in: inTipoMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMaestroMock })

      supabase.from.mockReturnValue({ select: selectMock })

      const items = await obtenerConfirmacionesPendientes('m1')

      expect(supabase.from).toHaveBeenCalledWith('registros_pendientes')
      expect(eqMaestroMock).toHaveBeenCalledWith('maestro_id', 'm1')
      expect(inTipoMock).toHaveBeenCalledWith('tipo', ['confirmacion_emergente_pendiente', 'justificacion_pendiente'])
      expect(eqEstadoMock).toHaveBeenCalledWith('estado', 'pendiente')
      expect(items).toHaveLength(1)
      expect(items[0]).toEqual({
        id: 'rp-1',
        actividad_id: 'act-1',
        maestro_id: 'm1',
        fecha: '2026-09-15',
        estado: 'pendiente',
        mensaje: 'Confirmación pendiente',
        deep_link: '/maestros/confirmaciones-emergentes?actividad_id=act-1',
        created_at: '2026-09-15T08:00:00Z',
        actividad_info: mockPendientes[0].sesion_clase,
        sesion_clase: mockPendientes[0].sesion_clase
      })
    })

    it('propaga error si la consulta a registros_pendientes falla', async () => {
      const orderMock = vi.fn().mockResolvedValue({ data: null, error: new Error('Error de conexión BD') })
      const eqEstadoMock = vi.fn().mockReturnValue({ order: orderMock })
      const inTipoMock = vi.fn().mockReturnValue({ eq: eqEstadoMock })
      const eqMaestroMock = vi.fn().mockReturnValue({ in: inTipoMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMaestroMock })

      supabase.from.mockReturnValue({ select: selectMock })

      await expect(obtenerConfirmacionesPendientes('m1')).rejects.toThrow('Error de conexión BD')
    })
  })

  describe('obtenerActividadPorId', () => {
    it('valida que actividad_id sea provisto', async () => {
      await expect(obtenerActividadPorId()).rejects.toThrow('se requiere actividad_id')
    })

    it('consulta la sesión raíz con clase_id IS NULL', async () => {
      const mockActividad = {
        id: 'act-1',
        clase_id: null,
        actividad: 'Concierto',
        fecha: '2026-09-15'
      }

      const singleMock = vi.fn().mockResolvedValue({ data: mockActividad, error: null })
      const isMock = vi.fn().mockReturnValue({ single: singleMock })
      const eqMock = vi.fn().mockReturnValue({ is: isMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

      supabase.from.mockReturnValue({ select: selectMock })

      const res = await obtenerActividadPorId('act-1')

      expect(supabase.from).toHaveBeenCalledWith('sesiones_clase')
      expect(eqMock).toHaveBeenCalledWith('id', 'act-1')
      expect(isMock).toHaveBeenCalledWith('clase_id', null)
      expect(res).toEqual(mockActividad)
    })
  })

  describe('obtenerActividadesPorAlcance', () => {
    it('valida que maestroId sea provisto', async () => {
      await expect(obtenerActividadesPorAlcance()).rejects.toThrow('se requiere maestroId')
    })

    it('consulta confirmaciones_emergentes con filtro de maestro y fecha opcional', async () => {
      const mockList = [
        { id: 'c1', maestro_id: 'm1', fecha: '2026-09-15', respuesta: 'si' }
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: mockList, error: null })
      const eqFechaMock = vi.fn().mockReturnValue({ order: orderMock })
      const eqMaestroMock = vi.fn().mockReturnValue({ eq: eqFechaMock, order: orderMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMaestroMock })

      supabase.from.mockReturnValue({ select: selectMock })

      const res = await obtenerActividadesPorAlcance('m1', '2026-09-15')

      expect(supabase.from).toHaveBeenCalledWith('confirmaciones_emergentes')
      expect(eqMaestroMock).toHaveBeenCalledWith('maestro_id', 'm1')
      expect(eqFechaMock).toHaveBeenCalledWith('fecha', '2026-09-15')
      expect(res).toEqual(mockList)
    })

    it('consulta confirmaciones_emergentes sin filtro de fecha cuando fecha es omitida', async () => {
      const orderMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqMaestroMock = vi.fn().mockReturnValue({ order: orderMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMaestroMock })

      supabase.from.mockReturnValue({ select: selectMock })

      const res = await obtenerActividadesPorAlcance('m1')
      expect(eqMaestroMock).toHaveBeenCalledWith('maestro_id', 'm1')
      expect(res).toEqual([])
    })
  })

  describe('obtenerMaestrosAfectadosPorAlcance (RPC)', () => {
    it('alcance="institucion": retorna maestros filtrados por la RPC', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: ['m1', 'm2', 'm3'],
        error: null
      })

      const res = await obtenerMaestrosAfectadosPorAlcance({
        actividad_id: 'act-1',
        alcance_tipo: 'institucion',
        alcance_config: {},
        fecha: '2026-09-15'
      })

      expect(supabase.rpc).toHaveBeenCalledWith('fn_maestros_afectados_por_alcance', {
        p_actividad_id: 'act-1',
        p_alcance_tipo: 'institucion',
        p_alcance_config: {},
        p_fecha: '2026-09-15'
      })
      expect(res).toEqual(['m1', 'm2', 'm3'])
    })

    it('alcance="programa": pasa programa_id dentro de alcance_config', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: ['m-cuerdas-1', 'm-cuerdas-2'],
        error: null
      })

      const res = await obtenerMaestrosAfectadosPorAlcance({
        actividad_id: 'act-prog-1',
        alcance_tipo: 'programa',
        alcance_config: { programa_id: 'prog-uuid' },
        fecha: '2026-09-15'
      })

      expect(supabase.rpc).toHaveBeenCalledWith('fn_maestros_afectados_por_alcance', {
        p_actividad_id: 'act-prog-1',
        p_alcance_tipo: 'programa',
        p_alcance_config: { programa_id: 'prog-uuid' },
        p_fecha: '2026-09-15'
      })
      expect(res).toEqual(['m-cuerdas-1', 'm-cuerdas-2'])
    })

    it('alcance="grupo": pasa clase_ids en alcance_config', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: ['m-grupo-1'],
        error: null
      })

      const res = await obtenerMaestrosAfectadosPorAlcance({
        actividad_id: 'act-grp-1',
        alcance_tipo: 'grupo',
        alcance_config: { clase_ids: ['clase-101', 'clase-102'] },
        fecha: '2026-09-15'
      })

      expect(supabase.rpc).toHaveBeenCalledWith('fn_maestros_afectados_por_alcance', {
        p_actividad_id: 'act-grp-1',
        p_alcance_tipo: 'grupo',
        p_alcance_config: { clase_ids: ['clase-101', 'clase-102'] },
        p_fecha: '2026-09-15'
      })
      expect(res).toEqual(['m-grupo-1'])
    })

    it('alcance="maestros_especificos": retorna exactamente la lista de maestros seleccionados', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: ['m-esp-1', 'm-esp-2'],
        error: null
      })

      const res = await obtenerMaestrosAfectadosPorAlcance({
        actividad_id: 'act-esp-1',
        alcance_tipo: 'maestros_especificos',
        alcance_config: { maestro_ids: ['m-esp-1', 'm-esp-2'] },
        fecha: '2026-09-15'
      })

      expect(supabase.rpc).toHaveBeenCalledWith('fn_maestros_afectados_por_alcance', {
        p_actividad_id: 'act-esp-1',
        p_alcance_tipo: 'maestros_especificos',
        p_alcance_config: { maestro_ids: ['m-esp-1', 'm-esp-2'] },
        p_fecha: '2026-09-15'
      })
      expect(res).toEqual(['m-esp-1', 'm-esp-2'])
    })
  })
})
