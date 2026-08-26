import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../../lib/supabaseClient.js'
import { justificarAusencia } from './clasesHoyApi.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { rpc: vi.fn() },
}))

vi.mock('../../asistencias/api/asistenciasApi.js', () => ({
  obtenerAsistenciasPorClasesFecha: vi.fn(),
}))

describe('justificarAusencia', () => {
  beforeEach(() => vi.clearAllMocks())

  it('delegates session resolution and attendance persistence to one RPC', async () => {
    supabase.rpc.mockResolvedValue({ data: 'attendance-id', error: null })

    await expect(justificarAusencia({
      claseId: 'class-id',
      alumnoId: 'student-id',
      fecha: '2026-08-18',
      motivo: 'Cita médica',
    })).resolves.toBe('attendance-id')

    expect(supabase.rpc).toHaveBeenCalledWith('registrar_justificacion_asistencia', {
      p_clase_id: 'class-id',
      p_alumno_id: 'student-id',
      p_fecha: '2026-08-18',
      p_motivo: 'Cita médica',
    })
  })

  it('surfaces a failed atomic operation', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'permission denied' } })

    await expect(justificarAusencia({
      claseId: 'class-id',
      alumnoId: 'student-id',
      fecha: '2026-08-18',
    })).rejects.toThrow('No se pudo justificar la ausencia: permission denied')
  })
})
