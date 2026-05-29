import { describe, it, expect, vi } from 'vitest'
import { openClaseEmergenteModal } from '../../../src/modules/planificacion/components/claseEmergenteModal.js'

vi.mock('../../../src/shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    close: vi.fn(),
    resetSaveBtn: vi.fn(),
  },
}))

vi.mock('../../../src/shared/components/AppToast.js', () => ({
  AppToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const { AppModal } = await import('../../../src/shared/components/AppModal.js')

function makeAlumnos() {
  return [
    {
      id: '1',
      nombre_completo: 'Ana López',
      instrumento_principal: 'Violín',
      clase_nombres: ['Violín Principiantes', 'Orquesta Infantil'],
    },
    {
      id: '2',
      nombre_completo: 'Carlos Ruiz',
      instrumento_principal: 'Piano',
      clase_nombres: ['Piano Avanzado'],
    },
    {
      id: '3',
      nombre_completo: 'Beatriz Mora',
      instrumento_principal: 'Violín',
      clase_nombres: ['Violín Principiantes'],
    },
    {
      id: '4',
      nombre_completo: 'Diego Vega',
      instrumento_principal: 'Guitarra',
      clase_nombres: ['Guitarra Intermedios'],
    },
    { id: '5', nombre_completo: 'Elena Paz', instrumento_principal: 'Cello', clase_nombres: [] },
  ]
}

function setupModal(alumnos = makeAlumnos(), onSave = null) {
  openClaseEmergenteModal({
    fecha: '2026-06-01',
    alumnos,
    maestroId: 'maestro-1',
    onSave,
  })

  const callArgs = AppModal.open.mock.calls[0]
  const { body, onShow } = callArgs[0]

  document.body.innerHTML = body
  const container = document.createElement('div')
  container.innerHTML = body
  const modalBody = container

  if (onShow) onShow(modalBody)

  return { modalBody, onShow, callArgs }
}

describe('openClaseEmergenteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders the form with basic fields', () => {
    const { callArgs } = setupModal()

    expect(callArgs[0].title).toBe('Nueva Clase Emergente')
    expect(callArgs[0].saveText).toBe('Crear Clase')
    expect(callArgs[0].size).toBe('lg')
    expect(callArgs[0].body).toContain('id="modal-fecha"')
    expect(callArgs[0].body).toContain('id="modal-clase_id"')
    expect(callArgs[0].body).toContain('id="modal-hora_inicio"')
    expect(callArgs[0].body).toContain('id="modal-hora_fin"')
    expect(callArgs[0].body).toContain('id="modal-tema"')
    expect(callArgs[0].body).toContain('id="modal-motivo"')
  })

  it('renders the student filter and list', () => {
    const { modalBody } = setupModal()

    expect(modalBody.querySelector('#modal-alumnos-buscar')).toBeTruthy()
    expect(modalBody.querySelector('#modal-seleccionar-todos')).toBeTruthy()
    expect(modalBody.querySelector('#modal-alumnos-lista')).toBeTruthy()
  })

  it('renders all students when filter is empty', () => {
    const { modalBody } = setupModal()
    const checks = modalBody.querySelectorAll('.modal-alumno-check')
    expect(checks.length).toBe(5)
  })

  it('shows instrument and class tags for each student', () => {
    const { modalBody } = setupModal()
    const tags = modalBody.querySelectorAll('.pm-emergente-tag')
    const instrumentTags = modalBody.querySelectorAll('.pm-emergente-tag-instrument')

    expect(instrumentTags.length).toBe(5)
    expect(tags.length).toBe(10)
  })

  describe('filter', () => {
    it('filters students by name', () => {
      const { modalBody } = setupModal()
      const search = modalBody.querySelector('#modal-alumnos-buscar')
      search.value = 'Ana'
      search.dispatchEvent(new Event('input'))

      const checks = modalBody.querySelectorAll('.modal-alumno-check')
      expect(checks.length).toBe(1)
    })

    it('filters students by instrument', () => {
      const { modalBody } = setupModal()
      const search = modalBody.querySelector('#modal-alumnos-buscar')
      search.value = 'Piano'
      search.dispatchEvent(new Event('input'))

      const checks = modalBody.querySelectorAll('.modal-alumno-check')
      expect(checks.length).toBe(1)
    })

    it('filters students by class name', () => {
      const { modalBody } = setupModal()
      const search = modalBody.querySelector('#modal-alumnos-buscar')
      search.value = 'Orquesta'
      search.dispatchEvent(new Event('input'))

      const checks = modalBody.querySelectorAll('.modal-alumno-check')
      expect(checks.length).toBe(1)
    })

    it('filters students by partial class name', () => {
      const { modalBody } = setupModal()
      const search = modalBody.querySelector('#modal-alumnos-buscar')
      search.value = 'Principiantes'
      search.dispatchEvent(new Event('input'))

      const checks = modalBody.querySelectorAll('.modal-alumno-check')
      expect(checks.length).toBe(2)
    })

    it('shows all students when filter is cleared', () => {
      const { modalBody } = setupModal()
      const search = modalBody.querySelector('#modal-alumnos-buscar')
      search.value = 'Piano'
      search.dispatchEvent(new Event('input'))

      expect(modalBody.querySelectorAll('.modal-alumno-check').length).toBe(1)

      search.value = ''
      search.dispatchEvent(new Event('input'))

      expect(modalBody.querySelectorAll('.modal-alumno-check').length).toBe(5)
    })

    it('shows empty message when no students match', () => {
      const { modalBody } = setupModal()
      const search = modalBody.querySelector('#modal-alumnos-buscar')
      search.value = 'zzznonexistent'
      search.dispatchEvent(new Event('input'))

      expect(modalBody.querySelectorAll('.modal-alumno-check').length).toBe(0)
      expect(modalBody.querySelector('#modal-alumnos-lista').textContent).toContain(
        'No hay alumnos',
      )
    })
  })

  describe('select all', () => {
    it('selects all visible students when toggled on', () => {
      const { modalBody } = setupModal()
      const selectAll = modalBody.querySelector('#modal-seleccionar-todos')

      selectAll.checked = true
      selectAll.dispatchEvent(new Event('change'))

      const checks = modalBody.querySelectorAll('.modal-alumno-check')
      const checked = modalBody.querySelectorAll('.modal-alumno-check:checked')
      expect(checked.length).toBe(5)
    })

    it('deselects all visible students when toggled off after selecting', () => {
      const { modalBody } = setupModal()
      const selectAll = modalBody.querySelector('#modal-seleccionar-todos')

      selectAll.checked = true
      selectAll.dispatchEvent(new Event('change'))

      expect(modalBody.querySelectorAll('.modal-alumno-check:checked').length).toBe(5)

      selectAll.checked = false
      selectAll.dispatchEvent(new Event('change'))

      expect(modalBody.querySelectorAll('.modal-alumno-check:checked').length).toBe(0)
    })

    it('select-all only affects currently visible students', () => {
      const { modalBody } = setupModal()
      const search = modalBody.querySelector('#modal-alumnos-buscar')
      const selectAll = modalBody.querySelector('#modal-seleccionar-todos')

      search.value = 'Violín'
      search.dispatchEvent(new Event('input'))
      expect(modalBody.querySelectorAll('.modal-alumno-check').length).toBe(2)

      selectAll.checked = true
      selectAll.dispatchEvent(new Event('change'))

      expect(modalBody.querySelectorAll('.modal-alumno-check:checked').length).toBe(2)

      search.value = ''
      search.dispatchEvent(new Event('input'))

      expect(modalBody.querySelectorAll('.modal-alumno-check').length).toBe(5)
      expect(modalBody.querySelectorAll('.modal-alumno-check:checked').length).toBe(2)

      selectAll.checked = true
      selectAll.dispatchEvent(new Event('change'))

      expect(modalBody.querySelectorAll('.modal-alumno-check:checked').length).toBe(5)
    })

    it('shows indeterminate state when some but not all visible are selected', () => {
      const { modalBody } = setupModal()
      const selectAll = modalBody.querySelector('#modal-seleccionar-todos')
      const firstCheck = modalBody.querySelector('.modal-alumno-check')

      firstCheck.checked = true
      firstCheck.dispatchEvent(new Event('change'))

      expect(selectAll.indeterminate).toBe(true)
    })

    it('updates summary text when selecting students', () => {
      const { modalBody } = setupModal()
      const summary = modalBody.querySelector('#modal-alumnos-resumen')
      const firstCheck = modalBody.querySelector('.modal-alumno-check')

      expect(summary.textContent).toContain('Selecciona al menos')

      firstCheck.checked = true
      firstCheck.dispatchEvent(new Event('change'))

      expect(summary.textContent).toBe('1 alumno(s) seleccionado(s).')
    })
  })

  describe('onSave', () => {
    it('includes actividad, clase_id null, and asistencia when saving', async () => {
      const onSave = vi.fn()
      const { modalBody, callArgs } = setupModal(makeAlumnos(), onSave)
      const onSaveFn = callArgs[0].onSave

      modalBody.querySelector('#modal-fecha').value = '2026-06-01'
      modalBody.querySelector('#modal-clase_id').value = 'Clase de violín grupal'
      modalBody.querySelector('#modal-hora_inicio').value = '10:00'
      modalBody.querySelector('#modal-hora_fin').value = '11:00'
      modalBody.querySelector('#modal-tema').value = 'Concierto de fin de año'
      modalBody.querySelector('#modal-contenido').value = 'Repaso general del repertorio'
      modalBody.querySelector('#modal-motivo').value = 'Ensayo general'

      const check1 = modalBody.querySelector('.modal-alumno-check[value="1"]')
      check1.checked = true
      check1.dispatchEvent(new Event('change'))
      const check2 = modalBody.querySelector('.modal-alumno-check[value="3"]')
      check2.checked = true
      check2.dispatchEvent(new Event('change'))

      const result = await onSaveFn(modalBody)

      expect(result).toBe(true)
      expect(onSave).toHaveBeenCalledTimes(1)

      const datos = onSave.mock.calls[0][0]
      expect(datos.actividad).toBe('Clase de violín grupal')
      expect(datos.clase_id).toBeNull()
      expect(datos.tema_principal).toBe('Concierto de fin de año')
      expect(datos.maestro_id).toBe('maestro-1')
      expect(datos.estado).toBe('pendiente')
      expect(datos.asistencia).toEqual([
        { alumno_id: '1', estado: null },
        { alumno_id: '3', estado: null },
      ])
    })

    it('rejects when required fields are missing', async () => {
      const onSave = vi.fn()
      const { modalBody, callArgs } = setupModal(makeAlumnos(), onSave)
      const onSaveFn = callArgs[0].onSave

      modalBody.querySelector('#modal-fecha').value = ''
      modalBody.querySelector('#modal-clase_id').value = ''
      modalBody.querySelector('#modal-hora_inicio').value = ''
      modalBody.querySelector('#modal-hora_fin').value = ''
      modalBody.querySelector('#modal-tema').value = ''
      modalBody.querySelector('#modal-motivo').value = ''

      const result = await onSaveFn(modalBody)

      expect(result).toBe(false)
      expect(onSave).not.toHaveBeenCalled()
    })

    it('rejects when no students are selected', async () => {
      const onSave = vi.fn()
      const { modalBody, callArgs } = setupModal(makeAlumnos(), onSave)
      const onSaveFn = callArgs[0].onSave

      modalBody.querySelector('#modal-fecha').value = '2026-06-01'
      modalBody.querySelector('#modal-clase_id').value = 'Clase grupal'
      modalBody.querySelector('#modal-hora_inicio').value = '10:00'
      modalBody.querySelector('#modal-hora_fin').value = '11:00'
      modalBody.querySelector('#modal-tema').value = 'Tema'
      modalBody.querySelector('#modal-motivo').value = 'Motivo'

      const result = await onSaveFn(modalBody)

      expect(result).toBe(false)
      expect(onSave).not.toHaveBeenCalled()
    })

    it('rejects when hora_inicio >= hora_fin', async () => {
      const onSave = vi.fn()
      const { modalBody, callArgs } = setupModal(makeAlumnos(), onSave)
      const onSaveFn = callArgs[0].onSave

      modalBody.querySelector('#modal-fecha').value = '2026-06-01'
      modalBody.querySelector('#modal-clase_id').value = 'Clase grupal'
      modalBody.querySelector('#modal-hora_inicio').value = '11:00'
      modalBody.querySelector('#modal-hora_fin').value = '10:00'
      modalBody.querySelector('#modal-tema').value = 'Tema'
      modalBody.querySelector('#modal-motivo').value = 'Motivo'

      const check1 = modalBody.querySelector('.modal-alumno-check[value="1"]')
      check1.checked = true
      check1.dispatchEvent(new Event('change'))

      const result = await onSaveFn(modalBody)

      expect(result).toBe(false)
      expect(onSave).not.toHaveBeenCalled()
    })
  })
})
