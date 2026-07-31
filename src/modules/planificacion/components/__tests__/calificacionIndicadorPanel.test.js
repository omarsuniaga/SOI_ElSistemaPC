import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * calificacionIndicadorPanel.test.js — Tarea 3.4 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Modo Sesión: lista los alumnos PRESENTES de la sesión actual (no todos los
 * de la clase — solo los que asistencia marcó presentes hoy, resueltos por
 * el container vía `obtenerAsistenciaDelDia`, Tarea 3.2) y permite calificar
 * 1-5 por indicador usando `evaluacionClaseService.js` (ya existe, Tarea
 * 2.4). REQ-05: nota >= 3 = superado.
 */

const registrarEvaluacion = vi.fn()

vi.mock('../../services/evaluacionClaseService.js', () => ({
  registrarEvaluacion: (...args) => registrarEvaluacion(...args),
  esNotaSuperada: (nota) => nota != null && nota >= 3,
}))

import { renderCalificacionIndicadorPanel } from '../calificacionIndicadorPanel.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

const presentes = [
  { id: 'al-1', nombre: 'Ana Pérez' },
  { id: 'al-2', nombre: 'Luis Gómez' },
]

describe('calificacionIndicadorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.querySelectorAll('.calificacion-indicador-overlay').forEach((el) => el.remove())
  })

  afterEach(() => {
    document.querySelectorAll('.calificacion-indicador-overlay').forEach((el) => el.remove())
  })

  it('renders exactly one row per alumno PRESENTE — not the full class roster (REQ-05)', () => {
    renderCalificacionIndicadorPanel({
      claseId: 'clase-1',
      claseIndicadorId: 'ind-1',
      indicadorDescripcion: 'Afinación limpia',
      presentes,
      fecha: '2026-07-30',
    })

    const rows = document.querySelectorAll('.calificacion-alumno-row')
    expect(rows.length).toBe(2)
    expect(document.body.textContent).toContain('Ana Pérez')
    expect(document.body.textContent).toContain('Luis Gómez')
  })

  it('shows an empty-state message and no rows when there are no presentes', () => {
    renderCalificacionIndicadorPanel({
      claseId: 'clase-1',
      claseIndicadorId: 'ind-1',
      indicadorDescripcion: 'Afinación limpia',
      presentes: [],
      fecha: '2026-07-30',
    })

    expect(document.querySelectorAll('.calificacion-alumno-row').length).toBe(0)
    expect(document.body.textContent).toMatch(/no hay alumnos presentes/i)
  })

  it('clicking a nota (1-5) button for a student selects it visually', () => {
    renderCalificacionIndicadorPanel({ claseId: 'clase-1', claseIndicadorId: 'ind-1', indicadorDescripcion: 'X', presentes, fecha: '2026-07-30' })

    const row = document.querySelector('.calificacion-alumno-row[data-alumno-id="al-1"]')
    const btnNota4 = row.querySelector('.btn-nota[data-nota="4"]')
    btnNota4.click()

    expect(btnNota4.classList.contains('selected')).toBe(true)
  })

  it('REQ-05: marks "Superado" when the selected nota is >= 3, and not when it is below 3', () => {
    renderCalificacionIndicadorPanel({ claseId: 'clase-1', claseIndicadorId: 'ind-1', indicadorDescripcion: 'X', presentes, fecha: '2026-07-30' })

    const row1 = document.querySelector('.calificacion-alumno-row[data-alumno-id="al-1"]')
    row1.querySelector('.btn-nota[data-nota="3"]').click()
    expect(row1.querySelector('.calificacion-superado-badge')).toBeTruthy()

    const row2 = document.querySelector('.calificacion-alumno-row[data-alumno-id="al-2"]')
    row2.querySelector('.btn-nota[data-nota="2"]').click()
    expect(row2.querySelector('.calificacion-superado-badge')).toBeFalsy()
  })

  it('Guardar registers an evaluation per rated student, scoped to clase_indicador_id (REQ-14)', async () => {
    registrarEvaluacion.mockResolvedValue({ id: 'ev-1' })

    renderCalificacionIndicadorPanel({
      claseId: 'clase-1',
      claseIndicadorId: 'ind-1',
      indicadorDescripcion: 'Afinación limpia',
      presentes,
      fecha: '2026-07-30',
      evaluadoPor: 'maestro-1',
    })

    document.querySelector('.calificacion-alumno-row[data-alumno-id="al-1"] .btn-nota[data-nota="5"]').click()
    document.querySelector('.calificacion-panel-guardar-btn').click()
    await flush()

    expect(registrarEvaluacion).toHaveBeenCalledTimes(1)
    expect(registrarEvaluacion).toHaveBeenCalledWith({
      alumno_id: 'al-1',
      clase_indicador_id: 'ind-1',
      clase_id: 'clase-1',
      nota: 5,
      evaluado_por: 'maestro-1',
    })
  })

  it('Guardar skips students without a selected nota', async () => {
    registrarEvaluacion.mockResolvedValue({ id: 'ev-1' })

    renderCalificacionIndicadorPanel({ claseId: 'clase-1', claseIndicadorId: 'ind-1', indicadorDescripcion: 'X', presentes, fecha: '2026-07-30' })

    document.querySelector('.calificacion-alumno-row[data-alumno-id="al-1"] .btn-nota[data-nota="4"]').click()
    // al-2 no recibe nota
    document.querySelector('.calificacion-panel-guardar-btn').click()
    await flush()

    expect(registrarEvaluacion).toHaveBeenCalledTimes(1)
    expect(registrarEvaluacion).toHaveBeenCalledWith(expect.objectContaining({ alumno_id: 'al-1' }))
  })

  it('fires onGuardado with the saved count after a successful save', async () => {
    registrarEvaluacion.mockResolvedValue({ id: 'ev-1' })
    const onGuardado = vi.fn()

    renderCalificacionIndicadorPanel({
      claseId: 'clase-1',
      claseIndicadorId: 'ind-1',
      indicadorDescripcion: 'X',
      presentes,
      fecha: '2026-07-30',
      onGuardado,
    })

    document.querySelector('.calificacion-alumno-row[data-alumno-id="al-1"] .btn-nota[data-nota="5"]').click()
    document.querySelector('.calificacion-alumno-row[data-alumno-id="al-2"] .btn-nota[data-nota="1"]').click()
    document.querySelector('.calificacion-panel-guardar-btn').click()
    await flush()

    expect(onGuardado).toHaveBeenCalledWith(expect.objectContaining({ guardados: 2 }))
  })

  it('closes on close button click', () => {
    renderCalificacionIndicadorPanel({ claseId: 'clase-1', claseIndicadorId: 'ind-1', indicadorDescripcion: 'X', presentes, fecha: '2026-07-30' })
    expect(document.querySelector('.calificacion-indicador-overlay')).toBeTruthy()

    document.querySelector('.calificacion-panel-close-x').click()

    expect(document.querySelector('.calificacion-indicador-overlay')).toBeFalsy()
  })
})
