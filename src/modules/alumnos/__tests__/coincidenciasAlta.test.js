import { afterEach, expect, it, vi } from 'vitest'
import { obtenerAlumnos } from '../api/alumnosApi.js'
import { confirmarAltaIndividual } from '../api/coincidenciasAlta.js'

vi.mock('../api/alumnosApi.js', () => ({ obtenerAlumnos: vi.fn() }))
afterEach(() => vi.restoreAllMocks())

it('permite cancelar un alta coincidente con un expediente inactivo', async () => {
  const draft = { nombre_completo: 'Prueba Doble Apellido', fecha_nacimiento: '2014-02-01', representante_cedula: '00112345678' }
  obtenerAlumnos.mockResolvedValue({ alumnos: [{ ...draft, id: 'existing', activo: false }], total: 1 })
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  expect(await confirmarAltaIndividual(draft)).toBe(false)
  expect(confirm.mock.calls[0][0]).toContain('inactivo')
  expect(obtenerAlumnos).toHaveBeenCalledWith(expect.objectContaining({ soloActivos: false }))
})
