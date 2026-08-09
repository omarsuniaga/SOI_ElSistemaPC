/**
 * Contrato entre periodosView y AppModal.
 *
 * ORIGEN DE ESTE ARCHIVO
 * ----------------------
 * El botón "Activar" del módulo de Períodos no hacía absolutamente nada. La vista
 * pasaba `confirmText` / `confirmClass` / `onConfirm` a `AppModal.open()`, pero
 * AppModal solo entiende `saveText` / `onSave` / `onCancel` / `onDelete`. Las tres
 * opciones se descartaban en silencio, `onSave` quedaba en null y el handler del
 * botón caía en la rama `else { this.close() }`: el diálogo se cerraba y el período
 * jamás se activaba. Sin error, sin aviso.
 *
 * Los 11 tests que existían pasaban igual, porque mockeaban Supabase — es decir,
 * la capa que NO tenía el problema. El defecto vivía en el pegamento entre la
 * vista y el componente de modal, y ahí no había una sola aserción.
 *
 * Estas pruebas cubren ese pegamento.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn(), showLoading: vi.fn(), hideLoading: vi.fn() },
}))
vi.mock('bootstrap', () => ({ Toast: class { show() {} } }))
vi.mock('../../../../core/router/router.js', () => ({ router: { navigate: vi.fn(), register: vi.fn() } }))
vi.mock('../../api/periodosApi.js', () => ({
  getPeriodos: vi.fn(),
  getPeriodoActivo: vi.fn(),
  crearPeriodo: vi.fn(),
  actualizarPeriodo: vi.fn(),
  activarPeriodo: vi.fn(),
  eliminarPeriodo: vi.fn(),
  obtenerAuditoriaCierrePeriodo: vi.fn(),
}))
vi.mock('../../api/reporteCierreApi.js', async (importOriginal) => {
  const real = await importOriginal()
  return { ...real, obtenerReporteCierre: vi.fn(), activarPeriodoAtomico: vi.fn() }
})
vi.mock('../../services/pdfCierreSemestre.js', () => ({
  generarInformePdfCierreSemestre: vi.fn(),
}))

import { renderPeriodosView } from '../periodosView.js'
import { AppModal } from '../../../../shared/components/AppModal.js'
import * as PeriodosApi from '../../api/periodosApi.js'
import { activarPeriodoAtomico, obtenerReporteCierre } from '../../api/reporteCierreApi.js'

/** Opciones que AppModal.open realmente interpreta. */
const OPCIONES_SOPORTADAS = new Set([
  'title', 'body', 'saveText', 'cancelText', 'deleteText',
  'onSave', 'onCancel', 'onDelete', 'onShow', 'onOpen', 'size', 'hideSave',
])

const PERIODOS = [
  { id: 'p-1', nombre: 'Semestre 2026-I', fecha_inicio: '2026-01-01', fecha_fin: '2026-06-30', activo: true, cerrado: false },
  { id: 'p-2', nombre: 'Semestre 2026-II', fecha_inicio: '2026-07-01', fecha_fin: '2026-12-31', activo: false, cerrado: false },
]

async function montar() {
  PeriodosApi.getPeriodos.mockResolvedValue(PERIODOS)
  const container = document.createElement('div')
  document.body.appendChild(container)
  await renderPeriodosView(container)
  await vi.waitFor(() => {
    expect(container.querySelector('[data-action="activar"]')).toBeTruthy()
  })
  return container
}

describe('periodosView ↔ AppModal (contrato)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('el botón Activar abre un modal con onSave ejecutable, no con onConfirm', async () => {
    const container = await montar()
    container.querySelector('[data-action="activar"]').click()

    await vi.waitFor(() => expect(AppModal.open).toHaveBeenCalled())

    const opts = AppModal.open.mock.calls.at(-1)[0]

    // El defecto original, escrito como aserción.
    expect(opts.onConfirm).toBeUndefined()
    expect(opts.confirmText).toBeUndefined()
    expect(typeof opts.onSave).toBe('function')
  })

  it('confirmar el modal de activación llama efectivamente a la RPC atómica', async () => {
    activarPeriodoAtomico.mockResolvedValue({ ok: true })

    const container = await montar()
    container.querySelector('[data-action="activar"]').click()
    await vi.waitFor(() => expect(AppModal.open).toHaveBeenCalled())

    const { onSave } = AppModal.open.mock.calls.at(-1)[0]
    await onSave()

    // Antes de la corrección esta llamada NUNCA ocurría: el modal solo se cerraba.
    expect(activarPeriodoAtomico).toHaveBeenCalledWith('p-2')
  })

  it('devuelve false cuando la activación falla, para que el modal no se cierre', async () => {
    activarPeriodoAtomico.mockRejectedValue(new Error('No se puede activar un período cerrado'))

    const container = await montar()
    container.querySelector('[data-action="activar"]').click()
    await vi.waitFor(() => expect(AppModal.open).toHaveBeenCalled())

    const { onSave } = AppModal.open.mock.calls.at(-1)[0]
    // AppModal interpreta `false` como "no cierres el diálogo". Si devolviéramos
    // undefined, el modal se cerraría y el usuario creería que el corte ocurrió.
    await expect(onSave()).resolves.toBe(false)
  })

  it('ningún modal de la vista usa opciones que AppModal ignora', async () => {
    obtenerReporteCierre.mockResolvedValue({
      resumen: { pct_cumplimiento_registro: 57.4, sesiones_registradas: 27, sesiones_periodo: 47 },
      periodo: { nombre: 'Semestre 2026-I' },
      asistencia: { tasa_global: 81.4, total_marcas: 280, pct_registro_puntual: 66.4, marcas_tardias: 94 },
      docentes: [], docentesEvaluables: [],
    })

    const container = await montar()

    for (const accion of ['activar', 'auditar', 'edit', 'delete']) {
      const btn = container.querySelector(`[data-action="${accion}"]`)
      if (!btn) continue
      btn.click()
      await vi.waitFor(() => expect(AppModal.open).toHaveBeenCalled())
    }
    container.querySelector('#btn-nuevo-periodo').click()

    const desconocidas = AppModal.open.mock.calls
      .flatMap(([opts]) => Object.keys(opts ?? {}))
      .filter(k => !OPCIONES_SOPORTADAS.has(k))

    expect([...new Set(desconocidas)]).toEqual([])
  })

  it('crear un período marcado como "activo" activa por la RPC atómica, nunca por un INSERT directo con activo:true', async () => {
    // Bugfix: `openCreateModal` llamaba a `PeriodosApi.crearPeriodo({..., activo:
    // true})` directo — un INSERT plano sin desactivar el período que ya
    // estuviera activo. Sin un índice único que lo impida, la base terminaba con
    // DOS filas `activo = true` a la vez, y `getPeriodoActivo()` (que usa
    // `.single()`) empezaba a fallar en silencio. Ahora el período SIEMPRE se
    // crea inactivo, y si se marcó el checkbox, la activación pasa por
    // `activarPeriodoAtomico` — la misma RPC transaccional que usa el botón
    // "Activar" de un período existente.
    PeriodosApi.crearPeriodo.mockResolvedValue({ id: 'p-nuevo' })
    activarPeriodoAtomico.mockResolvedValue({ ok: true })

    const container = await montar()
    container.querySelector('#btn-nuevo-periodo').click()
    await vi.waitFor(() => expect(AppModal.open).toHaveBeenCalled())

    const { onSave } = AppModal.open.mock.calls.at(-1)[0]

    const modalBody = document.createElement('div')
    modalBody.innerHTML = `
      <input id="modal-nombre" value="Semestre 2027-I">
      <input id="modal-fecha_inicio" type="date" value="2027-01-01">
      <input id="modal-fecha_fin" type="date" value="2027-06-30">
      <input id="modal-activo" type="checkbox" checked>
    `

    await onSave(modalBody)

    expect(PeriodosApi.crearPeriodo).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Semestre 2027-I', activo: false }),
    )
    expect(activarPeriodoAtomico).toHaveBeenCalledWith('p-nuevo')
  })

  it('crear un período SIN marcar "activo" no llama a la RPC de activación', async () => {
    PeriodosApi.crearPeriodo.mockResolvedValue({ id: 'p-nuevo-2' })

    const container = await montar()
    container.querySelector('#btn-nuevo-periodo').click()
    await vi.waitFor(() => expect(AppModal.open).toHaveBeenCalled())

    const { onSave } = AppModal.open.mock.calls.at(-1)[0]

    const modalBody = document.createElement('div')
    modalBody.innerHTML = `
      <input id="modal-nombre" value="Semestre 2027-II">
      <input id="modal-fecha_inicio" type="date" value="2027-07-01">
      <input id="modal-fecha_fin" type="date" value="2027-12-31">
      <input id="modal-activo" type="checkbox">
    `

    await onSave(modalBody)

    expect(PeriodosApi.crearPeriodo).toHaveBeenCalledWith(
      expect.objectContaining({ activo: false }),
    )
    expect(activarPeriodoAtomico).not.toHaveBeenCalled()
  })

  it('escapa el nombre del período al renderlo en la tabla', async () => {
    PeriodosApi.getPeriodos.mockResolvedValue([
      { ...PERIODOS[0], nombre: '<img src=x onerror=alert(1)>' },
    ])
    const container = document.createElement('div')
    document.body.appendChild(container)
    await renderPeriodosView(container)

    await vi.waitFor(() => {
      expect(container.querySelector('#periodos-table-body').innerHTML).toContain('&lt;img')
    })
    expect(container.querySelector('#periodos-table-body img')).toBeNull()
  })
})
