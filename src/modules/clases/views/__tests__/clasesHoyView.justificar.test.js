import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/clasesHoy.css', () => ({}))
vi.mock('../../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../../../../core/router/router.js', () => ({
  router: { navigate: vi.fn() },
}))

vi.mock('../../api/clasesHoyApi.js', () => ({
  obtenerClasesDelDia: vi.fn(),
  justificarAusencia: vi.fn(),
  obtenerDiaActual: () => 'lunes',
  DIAS_SEMANA: [{ value: 'lunes', label: 'Lun', labelLargo: 'Lunes' }],
  COMPLIANCE_META: {
    VERDE: { color: '#198754' },
    AMARILLO: { color: '#ffc107' },
    ROJO: { color: '#dc3545' },
  },
}))

// crearAsistencia inserta sin sesion_clase_id (NOT NULL): la vista NO debe usarla.
vi.mock('../../../asistencias/api/asistenciasApi.js', () => ({
  crearAsistencia: vi.fn(),
  ESTADOS: { JUSTIFICADO: 'justificado' },
}))

import { renderClasesHoyView } from '../clasesHoyView.js'
import { obtenerClasesDelDia, justificarAusencia } from '../../api/clasesHoyApi.js'
import { crearAsistencia } from '../../../asistencias/api/asistenciasApi.js'
import { AppModal } from '../../../../shared/components/AppModal.js'

const sesionBase = {
  claseId: 'c1',
  dia: 'lunes',
  fecha: '2026-09-21',
  nombre: 'Piano Inicial',
  horaInicio: '08:00',
  horaFin: '09:00',
  estado: 'proxima',
  maestroTitular: { nombre_completo: 'Laura Méndez' },
  salon: { nombre: 'Salón 1' },
  alumnos: [{ id: 'a1', nombre_completo: 'Alicia Martinez', estadoAsistencia: null }],
  totalAlumnos: 1,
  justificadosCount: 0,
  pendienteAsistencia: null,
}

describe('clasesHoyView — "Buscar Alumno y Justificar"', () => {
  let container

  beforeEach(async () => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)

    obtenerClasesDelDia.mockResolvedValue({
      dia: 'lunes',
      fecha: '2026-09-21',
      esHoy: true,
      kpis: { totalClases: 1, enCursoAhora: 0, totalAlumnos: 1, salonesOcupados: 1, justificadosHoy: 0, asistenciaPendiente: 0 },
      sesiones: [sesionBase],
    })
    justificarAusencia.mockResolvedValue('asistencia-id')

    await renderClasesHoyView(container)
  })

  it('justifica por la RPC canónica (que crea/resuelve la sesión) y no inserta en asistencias sin sesion_clase_id', async () => {
    container.querySelector('#clasesHoyBuscarAlumno').click()
    const opts = AppModal.open.mock.calls[0][0]

    const body = document.createElement('div')
    body.innerHTML = opts.body
    document.body.appendChild(body)
    opts.onShow(body)

    const input = body.querySelector('#buscarGlobalInput')
    input.value = 'ali'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    body.querySelector('[data-alumno-id="a1"]').click()
    body.querySelector('#buscarGlobalMotivo').value = 'Cita médica'

    const resultado = await opts.onSave(body)

    expect(resultado).toBe(true)
    expect(justificarAusencia).toHaveBeenCalledWith({
      claseId: 'c1',
      alumnoId: 'a1',
      fecha: '2026-09-21',
      motivo: 'Cita médica',
    })
    expect(crearAsistencia).not.toHaveBeenCalled()
  })
})
