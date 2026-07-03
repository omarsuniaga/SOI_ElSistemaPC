import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clasesApi from './clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

const BASE_CLASE = {
  nombre: 'Violín Intermedio',
  maestro_principal_id: 'maestro-1',
  programa_id: 'prog-1',
  instrumento: 'violin',
}

/**
 * Helper para construir un mock encadenable de supabase-from() que resuelve
 * distintas queries según la tabla invocada. `handlers` es un mapa
 * { tabla: () => queryResultObject } donde queryResultObject debe soportar
 * los métodos encadenados usados por clasesApi (select/eq/in/single/etc.)
 */
function buildSupabaseMock(handlers) {
  return vi.fn((table) => {
    const handler = handlers[table]
    if (!handler) throw new Error(`No mock handler registered for table "${table}"`)
    return handler()
  })
}

describe('clasesApi - conflict resolution flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crearClase - verificarSolapamiento attaches horario_local/clase_horario_id', () => {
    it('throws isConflict error with conflictData.horario_local and clase_horario_id on salon clash', async () => {
      const claseData = {
        ...BASE_CLASE,
        horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', salon_id: 'salon-1' }],
      }

      supabase.from.mockImplementation((table) => {
        if (table === 'clase_horarios') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: undefined,
            // Resolve when awaited as a thenable via mockResolvedValue on the last eq call chain
          }
        }
        return {}
      })

      // Because the real query chain is .from().select().eq().eq(), give the
      // final eq() a resolved value.
      const finalEq = vi.fn().mockResolvedValue({
        data: [{
          id: 'horario-otro-1',
          clase_id: 'clase-otra',
          dia: 'lunes',
          hora_inicio: '08:30',
          hora_fin: '09:30',
          salon_id: 'salon-1',
          clases: { nombre: 'Clase Existente' },
        }],
        error: null,
      })
      const firstEq = vi.fn().mockReturnValue({ eq: finalEq })
      const select = vi.fn().mockReturnValue({ eq: firstEq })
      supabase.from.mockReturnValue({ select })

      const err = await clasesApi.crearClase(claseData).catch(e => e)

      expect(err.isConflict).toBe(true)
      expect(err.conflictData.tipo).toBe('salón')
      expect(err.conflictData.clase_id).toBe('clase-otra')
      expect(err.conflictData.clase_horario_id).toBe('horario-otro-1')
      expect(err.conflictData.horario_local).toEqual({
        dia: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '09:00',
        salon_id: 'salon-1',
      })
    })
  })

  describe('crearClase - resolvedConflicts path', () => {
    it('deletes the conflicting horario and marks the other class for revision instead of throwing', async () => {
      const claseData = {
        ...BASE_CLASE,
        horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', salon_id: 'salon-1' }],
      }

      const deleteEq = vi.fn().mockResolvedValue({ error: null })
      const deleteMock = vi.fn().mockReturnValue({ eq: deleteEq })

      const updateEq = vi.fn().mockResolvedValue({ error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: updateEq })

      const insertSelect = vi.fn().mockResolvedValue({
        data: [{ id: 'clase-nueva', maestro_principal_id: 'maestro-1' }],
        error: null,
      })
      const insertMock = vi.fn().mockReturnValue({ select: insertSelect })

      const finalEq = vi.fn().mockResolvedValue({
        data: [{
          id: 'horario-otro-1',
          clase_id: 'clase-otra',
          dia: 'lunes',
          hora_inicio: '08:30',
          hora_fin: '09:30',
          salon_id: 'salon-1',
          clases: { nombre: 'Clase Existente' },
        }],
        error: null,
      })
      const firstEq = vi.fn().mockReturnValue({ eq: finalEq })
      const select = vi.fn().mockReturnValue({ eq: firstEq })

      let callCount = 0
      supabase.from.mockImplementation((table) => {
        callCount++
        if (table === 'clase_horarios' && callCount === 1) {
          // verificarSolapamiento's SELECT query
          return { select }
        }
        if (table === 'clase_horarios') {
          // Could be the delete() call for resolution OR the insert() for new horarios
          return { delete: deleteMock, insert: vi.fn().mockResolvedValue({ error: null }) }
        }
        if (table === 'clases') {
          return { update: updateMock, insert: insertMock }
        }
        return {}
      })

      const result = await clasesApi.crearClase(claseData, {
        force: false,
        resolvedConflicts: [{
          clase_horario_id: 'horario-otro-1',
          clase_id: 'clase-otra',
          motivo: 'Reasignado a otra clase',
        }],
      })

      expect(deleteMock).toHaveBeenCalled()
      expect(deleteEq).toHaveBeenCalledWith('id', 'horario-otro-1')
      expect(updateMock).toHaveBeenCalledWith({ necesita_revision: true, revision_motivo: 'Reasignado a otra clase' })
      expect(updateEq).toHaveBeenCalledWith('id', 'clase-otra')
      expect(result.id).toBe('clase-nueva')
    })
  })

  describe('actualizarClase - legacy boolean force still works', () => {
    it('accepts a plain boolean as 3rd arg and skips conflict checks entirely', async () => {
      const original = {
        id: 'clase-1',
        nombre: 'Violín',
        maestro_principal_id: 'maestro-1',
        programa_id: 'prog-1',
        instrumento: 'violin',
        horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', salon_id: 'salon-1' }],
      }

      // obtenerClase() call
      const singleMock = vi.fn().mockResolvedValue({ data: original, error: null })
      const eqObtener = vi.fn().mockReturnValue({ single: singleMock })
      const selectObtener = vi.fn().mockReturnValue({ eq: eqObtener })

      const updateEq = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [{ ...original }], error: null }),
      })
      const updateMock = vi.fn().mockReturnValue({ eq: updateEq })

      let fromCallCount = 0
      supabase.from.mockImplementation((table) => {
        fromCallCount++
        if (table === 'clases' && fromCallCount === 1) {
          return { select: selectObtener }
        }
        if (table === 'clases') {
          return {
            update: updateMock,
            select: selectObtener, // used by the final obtenerClase(id) re-fetch
          }
        }
        if (table === 'clase_horarios') {
          // obtenerClase() overwrites claseObj.horarios with the result of this
          // query, so it must return the same horario the class actually has
          // (otherwise fusionada.horarios ends up empty and validate() fails).
          return {
            select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: original.horarios, error: null }) }),
          }
        }
        return {}
      })

      await expect(
        clasesApi.actualizarClase('clase-1', { [`estado`]: null }, true)
      ).resolves.toBeTruthy()
    })
  })

  describe('verificarConflictoInscripcion', () => {
    it('returns null when destination class has no horarios', async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: { id: 'clase-2', nombre: 'Clase B' }, error: null })
      const eqObtener = vi.fn().mockReturnValue({ single: singleMock })
      const selectObtener = vi.fn().mockReturnValue({ eq: eqObtener })

      supabase.from.mockImplementation((table) => {
        if (table === 'clases') return { select: selectObtener }
        if (table === 'clase_horarios') {
          return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
        }
        return {}
      })

      const result = await clasesApi.verificarConflictoInscripcion('alumno-1', 'clase-2')
      expect(result).toBeNull()
    })

    it('returns the conflicting class info when schedules overlap regardless of salon', async () => {
      const claseDestino = { id: 'clase-2', nombre: 'Clase B' }
      const singleMock = vi.fn().mockResolvedValue({ data: claseDestino, error: null })
      const eqObtenerClase = vi.fn().mockReturnValue({ single: singleMock })
      const selectObtenerClase = vi.fn().mockReturnValue({ eq: eqObtenerClase })

      const horariosDestino = [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', clase_id: 'clase-2' }]

      const inscripciones = [{ clase_id: 'clase-1', clases: { id: 'clase-1', nombre: 'Clase A' } }]

      let clasesCall = 0
      let horariosCall = 0
      supabase.from.mockImplementation((table) => {
        if (table === 'clases') {
          clasesCall++
          return { select: selectObtenerClase }
        }
        if (table === 'alumnos_clases') {
          const eqActivo = vi.fn().mockResolvedValue({ data: inscripciones, error: null })
          const eqAlumno = vi.fn().mockReturnValue({ eq: eqActivo })
          const select = vi.fn().mockReturnValue({ eq: eqAlumno })
          return { select }
        }
        if (table === 'clase_horarios') {
          horariosCall++
          if (horariosCall === 1) {
            // obtenerClase's horarios fetch for clase-2
            return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: horariosDestino, error: null }) }) }
          }
          // horarios de otras clases (clase-1)
          const inMock = vi.fn().mockResolvedValue({
            data: [{
              clase_id: 'clase-1',
              dia: 'lunes',
              hora_inicio: '08:30',
              hora_fin: '09:30',
              clases: { id: 'clase-1', nombre: 'Clase A' },
            }],
            error: null,
          })
          return { select: vi.fn().mockReturnValue({ in: inMock }) }
        }
        return {}
      })

      const result = await clasesApi.verificarConflictoInscripcion('alumno-1', 'clase-2')

      expect(result).not.toBeNull()
      expect(result.clase_id).toBe('clase-1')
      expect(result.clase_nombre).toBe('Clase A')
      expect(result.horario).toContain('lunes')
    })
  })

  describe('resolverConflictoInscripcion', () => {
    it('unenrolls the student and marks the class for revision', async () => {
      const deleteEq2 = vi.fn().mockResolvedValue({ error: null })
      const deleteEq1 = vi.fn().mockReturnValue({ eq: deleteEq2 })
      const deleteMock = vi.fn().mockReturnValue({ eq: deleteEq1 })

      const updateEq = vi.fn().mockResolvedValue({ error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: updateEq })

      supabase.from.mockImplementation((table) => {
        if (table === 'alumnos_clases') return { delete: deleteMock }
        if (table === 'clases') return { update: updateMock }
        return {}
      })

      await clasesApi.resolverConflictoInscripcion('clase-1', 'alumno-1', 'Motivo de prueba')

      expect(deleteMock).toHaveBeenCalled()
      expect(updateMock).toHaveBeenCalledWith({ necesita_revision: true, revision_motivo: 'Motivo de prueba' })
      expect(updateEq).toHaveBeenCalledWith('id', 'clase-1')
    })
  })

  describe('marcarComoRevisado', () => {
    it('clears the revision flag and motivo', async () => {
      const updateEq = vi.fn().mockResolvedValue({ error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: updateEq })

      supabase.from.mockImplementation((table) => {
        if (table === 'clases') return { update: updateMock }
        return {}
      })

      await clasesApi.marcarComoRevisado('clase-1')

      expect(updateMock).toHaveBeenCalledWith({ necesita_revision: false, revision_motivo: null })
      expect(updateEq).toHaveBeenCalledWith('id', 'clase-1')
    })
  })
})
