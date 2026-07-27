/**
 * Alta de alumno y su familia.
 *
 * `alumnos.familia_id` es NOT NULL con FK a `familias`: sin familia no hay alumno.
 * La versión anterior insertaba en `familias` con la columna `nombre`, que no
 * existe —es `nombre_familia`— y desestructuraba sólo `data`, nunca `error`. Como
 * el cliente de Supabase no lanza excepción sino que devuelve `{data:null,error}`,
 * el try/catch nunca se disparaba y el fallo reaparecía dos pasos más tarde como
 * "familia_id violates not-null constraint", un mensaje que no nombra la causa.
 *
 * Estas pruebas fijan el contrato para que ese modo de fallo no vuelva.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}))

import { crearAlumno } from '../alumnosSupabase.js'
import { supabase } from '../../../../lib/supabaseClient.js'

const FAMILIA_ID = '11111111-1111-1111-1111-111111111111'

/** Cadena mínima de PostgREST para `.insert().select()`. */
function mockInsert(resultado) {
  const chain = {}
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.select = vi.fn().mockResolvedValue(resultado)
  return chain
}

describe('crearAlumno — familia obligatoria', () => {
  beforeEach(() => vi.clearAllMocks())

  it('crea la familia por RPC y la adjunta al alumno', async () => {
    supabase.rpc.mockResolvedValue({ data: FAMILIA_ID, error: null })
    const chain = mockInsert({ data: [{ id: 'a-1', nombre_completo: 'Ana Pérez' }], error: null })
    supabase.from.mockReturnValue(chain)

    await crearAlumno({ nombre: 'Ana Pérez' })

    expect(supabase.rpc).toHaveBeenCalledWith('fn_crear_familia_para_alumno', {
      p_nombre: 'Familia Ana Pérez',
    })
    // La columna DEBE viajar en el insert; omitirla es lo que producía el error.
    expect(chain.insert).toHaveBeenCalledWith([
      expect.objectContaining({ familia_id: FAMILIA_ID }),
    ])
  })

  it('nunca escribe directo en familias: esa tabla es sólo de administración', async () => {
    supabase.rpc.mockResolvedValue({ data: FAMILIA_ID, error: null })
    supabase.from.mockReturnValue(mockInsert({ data: [{ id: 'a-1' }], error: null }))

    await crearAlumno({ nombre: 'Ana Pérez' })

    const tablas = supabase.from.mock.calls.map(([t]) => t)
    expect(tablas).not.toContain('familias')
    expect(tablas).toContain('alumnos')
  })

  it('falla con un mensaje que nombra la causa cuando la familia no se puede crear', async () => {
    supabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'No autorizado para registrar familias' },
    })

    await expect(crearAlumno({ nombre: 'Ana Pérez' }))
      .rejects.toThrow(/familia del alumno.*No autorizado/i)

    // Y no intenta insertar el alumno sabiendo que va a violar la FK.
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('reutiliza la familia recibida sin crear una nueva', async () => {
    const chain = mockInsert({ data: [{ id: 'a-2' }], error: null })
    supabase.from.mockReturnValue(chain)

    await crearAlumno({ nombre: 'Luis Gómez', familia_id: FAMILIA_ID })

    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(chain.insert).toHaveBeenCalledWith([
      expect.objectContaining({ familia_id: FAMILIA_ID }),
    ])
  })

  it('revierte la familia creada si el alta del alumno falla', async () => {
    supabase.rpc
      .mockResolvedValueOnce({ data: FAMILIA_ID, error: null })   // crear familia
      .mockResolvedValueOnce({ data: true, error: null })          // limpiar huérfana
    supabase.from.mockReturnValue(
      mockInsert({ data: null, error: { message: 'duplicate key' } }),
    )

    await expect(crearAlumno({ nombre: 'Ana Pérez' })).rejects.toThrow(/duplicate key/)

    expect(supabase.rpc).toHaveBeenLastCalledWith('fn_eliminar_familia_huerfana', {
      p_familia_id: FAMILIA_ID,
    })
  })

  it('no borra una familia preexistente cuando el alta falla', async () => {
    supabase.from.mockReturnValue(
      mockInsert({ data: null, error: { message: 'duplicate key' } }),
    )

    await expect(
      crearAlumno({ nombre: 'Luis Gómez', familia_id: FAMILIA_ID }),
    ).rejects.toThrow(/duplicate key/)

    // La familia no era nuestra: borrarla arrastraría a otros alumnos.
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('exige el nombre antes de tocar la base', async () => {
    await expect(crearAlumno({ nombre: '   ' })).rejects.toThrow(/nombre es obligatorio/i)
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
