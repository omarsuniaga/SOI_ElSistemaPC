import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * IndicadorSelectorPanel.test.js — atajo embebido en asistenciaView.js para
 * seleccionar Unidad → Objetivo → Indicador y calificar con estrellas sin
 * salir de la toma de asistencia (plan gamificado maestros).
 *
 * No duplica ninguna lógica de guardado: al elegir un indicador, delega en
 * `calificacionIndicadorPanel.js` (ya probado por su propio test) — acá solo
 * se verifica el flujo de selección/agrupación y la delegación correcta.
 */

const obtenerNivelesAsignadosClase = vi.fn()
const obtenerObjetivosPorClase = vi.fn()
const obtenerIndicadoresPorObjetivo = vi.fn()
const renderCalificacionIndicadorPanel = vi.fn()

vi.mock('../../../../modules/planificacion/services/mapaClaseService.js', () => ({
  obtenerNivelesAsignadosClase: (...args) => obtenerNivelesAsignadosClase(...args),
  obtenerObjetivosPorClase: (...args) => obtenerObjetivosPorClase(...args),
  obtenerIndicadoresPorObjetivo: (...args) => obtenerIndicadoresPorObjetivo(...args),
}))

vi.mock('../../../../modules/planificacion/components/calificacionIndicadorPanel.js', () => ({
  renderCalificacionIndicadorPanel: (...args) => renderCalificacionIndicadorPanel(...args),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

import { renderIndicadorSelectorPanel } from '../IndicadorSelectorPanel.js'
import { AppToast } from '../../../../shared/components/AppToast.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

const niveles = [
  { id: 'nivel-1', nombre: 'Nivel 1' },
  { id: 'nivel-2', nombre: 'Nivel 2' },
]

const objetivos = [
  { id: 'obj-1', nombre: 'Postura', level_id: 'nivel-1' },
  { id: 'obj-2', nombre: 'Escalas', level_id: 'nivel-2' },
]

const presentes = [{ id: 'al-1', nombre: 'Ana Pérez' }]

describe('IndicadorSelectorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.querySelectorAll('.indicador-selector-overlay').forEach((el) => el.remove())
    obtenerNivelesAsignadosClase.mockResolvedValue(niveles)
    obtenerObjetivosPorClase.mockResolvedValue(objetivos)
  })

  afterEach(() => {
    document.querySelectorAll('.indicador-selector-overlay').forEach((el) => el.remove())
  })

  it('agrupa los objetivos por Unidad (optgroup) usando el nombre del nivel', async () => {
    renderIndicadorSelectorPanel({ claseId: 'clase-1', fecha: '2026-08-16', evaluadoPor: 'maestro-1', getPresentes: () => presentes })
    await flush()

    const optgroups = document.querySelectorAll('#indicador-selector-objetivo optgroup')
    expect(optgroups.length).toBe(2)
    expect(optgroups[0].getAttribute('label')).toBe('Nivel 1')
    expect(optgroups[1].getAttribute('label')).toBe('Nivel 2')
  })

  it('al elegir un objetivo carga y muestra sus indicadores', async () => {
    obtenerIndicadoresPorObjetivo.mockResolvedValue([{ id: 'ind-1', descripcion: 'Afinación limpia' }])

    renderIndicadorSelectorPanel({ claseId: 'clase-1', fecha: '2026-08-16', evaluadoPor: 'maestro-1', getPresentes: () => presentes })
    await flush()

    const select = document.querySelector('#indicador-selector-objetivo')
    select.value = 'obj-1'
    select.dispatchEvent(new Event('change'))
    await flush()
    await flush()

    expect(obtenerIndicadoresPorObjetivo).toHaveBeenCalledWith('obj-1')
    expect(document.body.textContent).toContain('Afinación limpia')
  })

  it('al hacer click en "Calificar" cierra el selector y delega en calificacionIndicadorPanel con los presentes resueltos en el momento del click', async () => {
    obtenerIndicadoresPorObjetivo.mockResolvedValue([{ id: 'ind-1', descripcion: 'Afinación limpia' }])

    renderIndicadorSelectorPanel({
      claseId: 'clase-1',
      fecha: '2026-08-16',
      evaluadoPor: 'maestro-1',
      getPresentes: () => presentes,
    })
    await flush()

    document.querySelector('#indicador-selector-objetivo').value = 'obj-1'
    document.querySelector('#indicador-selector-objetivo').dispatchEvent(new Event('change'))
    await flush()
    await flush()

    document.querySelector('.btn-indicador-calificar').click()

    expect(document.querySelector('.indicador-selector-overlay')).toBeFalsy()
    expect(renderCalificacionIndicadorPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        claseId: 'clase-1',
        claseIndicadorId: 'ind-1',
        indicadorDescripcion: 'Afinación limpia',
        presentes,
        fecha: '2026-08-16',
        evaluadoPor: 'maestro-1',
      }),
    )
  })

  it('si no hay presentes al momento de calificar, avisa y NO abre calificacionIndicadorPanel', async () => {
    obtenerIndicadoresPorObjetivo.mockResolvedValue([{ id: 'ind-1', descripcion: 'Afinación limpia' }])

    renderIndicadorSelectorPanel({
      claseId: 'clase-1',
      fecha: '2026-08-16',
      evaluadoPor: 'maestro-1',
      getPresentes: () => [],
    })
    await flush()

    document.querySelector('#indicador-selector-objetivo').value = 'obj-1'
    document.querySelector('#indicador-selector-objetivo').dispatchEvent(new Event('change'))
    await flush()
    await flush()

    document.querySelector('.btn-indicador-calificar').click()

    expect(AppToast.warning).toHaveBeenCalled()
    expect(renderCalificacionIndicadorPanel).not.toHaveBeenCalled()
  })

  it('muestra un mensaje cuando la clase todavía no tiene objetivos en su ruta', async () => {
    obtenerObjetivosPorClase.mockResolvedValue([])

    renderIndicadorSelectorPanel({ claseId: 'clase-1', fecha: '2026-08-16', evaluadoPor: 'maestro-1', getPresentes: () => presentes })
    await flush()

    expect(document.body.textContent).toContain('todavía no tiene objetivos')
    expect(document.querySelector('#indicador-selector-objetivo')).toBeFalsy()
  })

  it('cierra al hacer click en el backdrop', async () => {
    renderIndicadorSelectorPanel({ claseId: 'clase-1', fecha: '2026-08-16', evaluadoPor: 'maestro-1', getPresentes: () => presentes })
    await flush()

    document.querySelector('.indicador-selector-backdrop').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(document.querySelector('.indicador-selector-overlay')).toBeFalsy()
  })
})
