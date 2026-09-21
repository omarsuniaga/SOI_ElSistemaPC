import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/clases.css', () => ({}))
vi.mock('../../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: {
    progress: vi.fn(() => ({ success: vi.fn(), error: vi.fn(), dismiss: vi.fn() })),
    success: vi.fn(), error: vi.fn(), warning: vi.fn(),
  },
}))

// Cadena tipo Supabase: cualquier combinación de select/eq/order termina en una promesa con `data`.
const inscritos = [
  { id: 'ins-1', alumno_id: 'al-1', activo: true, alumnos: { id: 'al-1', nombre_completo: 'Ana Pérez', instrumento_principal: 'Violín' } },
]
function chain(data) {
  const result = Promise.resolve({ data, error: null })
  const c = { eq: () => c, order: () => result, in: () => c, then: (...a) => result.then(...a) }
  return c
}
vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (tabla) => ({ select: () => chain(tabla === 'alumnos_clases' ? inscritos : []) }),
  },
}))

vi.mock('../../api/clasesApi.js', () => ({
  obtenerClases: vi.fn(),
  eliminarClase: vi.fn(),
  inscribirAlumno: vi.fn(),
  desinscribirAlumno: vi.fn(() => Promise.resolve()),
  construirDatosClonados: vi.fn(),
}))
vi.mock('../../components/claseModal.js', () => ({ openClaseModal: vi.fn() }))
vi.mock('../../domain/generarPdfClase.js', () => ({
  descargarPdfClase: vi.fn(),
  descargarPdfListadoAlumnosPorClases: vi.fn(),
}))
vi.mock('../../utils/claseConflictDetector.js', () => ({
  detectarConflictosDeClases: vi.fn(() => new Map()),
  consolidarBadgesFichaClase: vi.fn(() => []),
}))
vi.mock('../../api/acuerdosApi.js', () => ({
  obtenerAcuerdosMaestros: vi.fn(() => []),
  guardarAcuerdoMaestro: vi.fn(),
  eliminarAcuerdoMaestro: vi.fn(),
}))

import { renderClasesView } from '../clasesView.js'
import { obtenerClases, desinscribirAlumno } from '../../api/clasesApi.js'
import { AppModal } from '../../../../shared/components/AppModal.js'

describe('clasesView — dar de baja a un alumno de la clase', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.stubGlobal('confirm', vi.fn(() => true))
    obtenerClases.mockResolvedValue([
      { id: 'c1', nombre: 'Violín Inicial', instrumento: 'Violín', maestro_principal_id: 'm1', activo: true },
    ])
  })

  it('desde la nómina, llama a desinscribirAlumno(claseId, alumnoId) — no con el id de la inscripción', async () => {
    await renderClasesView(container, { resetFilters: true })

    container.querySelector('[data-action="ver-nomina"]').click()
    await vi.waitFor(() => expect(AppModal.open).toHaveBeenCalled())

    // El modal real inserta su cuerpo en el documento; los eventos se enlazan en un setTimeout.
    const host = document.createElement('div')
    host.innerHTML = AppModal.open.mock.calls[0][0].body
    document.body.appendChild(host)
    await new Promise((r) => setTimeout(r, 10))

    host.querySelector('[data-action="desinscribir-alumno"]').click()
    await vi.waitFor(() => expect(desinscribirAlumno).toHaveBeenCalled())

    expect(desinscribirAlumno).toHaveBeenCalledWith('c1', 'al-1')
  })
})
