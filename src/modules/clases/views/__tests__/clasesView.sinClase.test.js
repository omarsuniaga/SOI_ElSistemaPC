import { describe, it, expect, vi } from 'vitest'

// Aislar el módulo de vista de sus efectos colaterales (CSS, componentes, APIs).
vi.mock('../../styles/clases.css', () => ({}))
vi.mock('../../../../shared/components/AppModal.js', () => ({ AppModal: { open: vi.fn(), close: vi.fn() } }))
vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { progress: vi.fn(), success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))
vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))
vi.mock('../../api/clasesApi.js', () => ({
  obtenerClases: vi.fn(), eliminarClase: vi.fn(), inscribirAlumno: vi.fn(),
  desinscribirAlumno: vi.fn(), construirDatosClonados: vi.fn(),
}))
vi.mock('../../components/claseModal.js', () => ({ openClaseModal: vi.fn() }))
vi.mock('../../domain/generarPdfClase.js', () => ({
  descargarPdfClase: vi.fn(), descargarPdfListadoAlumnosPorClases: vi.fn(),
}))
vi.mock('../../utils/claseConflictDetector.js', () => ({
  detectarConflictosDeClases: vi.fn(() => new Map()), consolidarBadgesFichaClase: vi.fn(() => []),
}))
vi.mock('../../api/acuerdosApi.js', () => ({
  obtenerAcuerdosMaestros: vi.fn(() => []), guardarAcuerdoMaestro: vi.fn(), eliminarAcuerdoMaestro: vi.fn(),
}))

import { filtrarPadronActivo, construirSetInscritos, calcularAlumnosSinClase } from '../clasesView.js'

const alumnos = [
  { id: 'a1', nombre_completo: 'Ana Activa', activo: true },
  { id: 'a2', nombre_completo: 'Beto Sin Flag' },                 // activo undefined -> se considera activo
  { id: 'a3', nombre_completo: 'Alfred Martinez', activo: false }, // inactivo -> nunca "sin clase"
  { id: 'a4', nombre_completo: 'Cami Inscrita', activo: true },
]
const clases = [
  { id: 'c1', alumnos_ids: ['a4'] },
  { id: 'c2', alumnos_ids: [] },
]

describe('clasesView · padrón "sin clase"', () => {
  it('filtrarPadronActivo excluye a los alumnos con activo === false', () => {
    const res = filtrarPadronActivo(alumnos)
    expect(res.map(a => a.id)).toEqual(['a1', 'a2', 'a4'])
    expect(res.some(a => a.id === 'a3')).toBe(false)
  })

  it('filtrarPadronActivo tolera null / undefined', () => {
    expect(filtrarPadronActivo(null)).toEqual([])
    expect(filtrarPadronActivo(undefined)).toEqual([])
  })

  it('construirSetInscritos junta los alumnos_ids de todas las clases', () => {
    const set = construirSetInscritos(clases)
    expect(set.has('a4')).toBe(true)
    expect(set.size).toBe(1)
  })

  it('calcularAlumnosSinClase devuelve solo alumnos ACTIVOS no inscritos en ninguna clase', () => {
    const res = calcularAlumnosSinClase(alumnos, clases)
    const ids = res.map(a => a.id)
    expect(ids).toContain('a1')          // activa, sin clase
    expect(ids).toContain('a2')          // sin flag, sin clase
    expect(ids).not.toContain('a3')      // inactiva -> excluida aunque no tenga clase
    expect(ids).not.toContain('a4')      // activa pero inscrita
  })

  it('un alumno inactivo NUNCA aparece como "sin clase", aunque no esté en ninguna clase', () => {
    const soloInactivo = [{ id: 'x', nombre_completo: 'Inactivo', activo: false }]
    expect(calcularAlumnosSinClase(soloInactivo, [])).toEqual([])
  })
})
