import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createStudentList } from '../StudentList.js'

function montar({ estado, justificaciones, ...overrides }) {
  const container = document.createElement('div')
  container.innerHTML = '<div id="pm-alumnos-list"></div>'
  document.body.appendChild(container)
  const alumnos = [
    { id: 'a1', nombre_completo: 'Ana Pérez', instrumento_principal: 'Violín' },
    { id: 'a2', nombre_completo: 'Beto Gil', instrumento_principal: 'Violín' },
  ]
  const lista = createStudentList(container, { alumnos, estado, justificaciones, snapshots: [], ...overrides })
  lista.render()
  return container
}

describe('StudentList — razón de la justificación', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  it('muestra la razón y su descripción bajo el nombre del alumno justificado', () => {
    const c = montar({
      estado: { a1: 'J', a2: 'P' },
      justificaciones: { a1: { motivo: 'Actividad especial: Visita Guiada', descripcion: 'Ensayo abierto' } },
    })
    const fila = c.querySelector('.pm-asist-item[data-id="a1"]')
    expect(fila.textContent).toContain('Actividad especial: Visita Guiada')
    expect(fila.textContent).toContain('Ensayo abierto')
  })

  it('no muestra razón a quien no está justificado', () => {
    const c = montar({
      estado: { a1: 'J', a2: 'P' },
      justificaciones: { a2: { motivo: 'no debería verse' } },
    })
    expect(c.querySelector('.pm-asist-item[data-id="a2"]').textContent).not.toContain('no debería verse')
  })
})

describe('StudentList — botón J siempre abre el modal', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  it('con J inactivo: abre el modal sin justificación previa', () => {
    const onOpenJustifModal = vi.fn()
    const c = montar({
      estado: { a1: null, a2: 'P' },
      justificaciones: {},
      onOpenJustifModal,
    })

    c.querySelector('.pm-asist-item[data-id="a1"] [data-action="J"]').click()

    expect(onOpenJustifModal).toHaveBeenCalledTimes(1)
    const [alumno, justifExistente, prevEstado] = onOpenJustifModal.mock.calls[0]
    expect(alumno.id).toBe('a1')
    expect(justifExistente).toBeNull()
    expect(prevEstado).toBeNull()
  })

  it('con J activo: abre el modal precargado con la justificación existente, sin borrar nada directamente', () => {
    const onOpenJustifModal = vi.fn()
    const eliminarJustificacion = vi.fn()
    const existente = { id: 'j-1', motivo: 'Cita médica', evidencia_url: 'https://test.co/foto.jpg' }
    const c = montar({
      estado: { a1: 'J', a2: 'P' },
      justificaciones: { a1: existente },
      onOpenJustifModal,
      eliminarJustificacion,
    })

    c.querySelector('.pm-asist-item[data-id="a1"] [data-action="J"]').click()

    expect(onOpenJustifModal).toHaveBeenCalledTimes(1)
    const [alumno, justifExistente, prevEstado] = onOpenJustifModal.mock.calls[0]
    expect(alumno.id).toBe('a1')
    expect(justifExistente).toBe(existente)
    expect(prevEstado).toBe('J')
    // El click en J ya no borra por sí solo: limpiar es una acción explícita dentro del modal.
    expect(eliminarJustificacion).not.toHaveBeenCalled()
  })
})

describe('StudentList — botón de comprobante adjunto', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('muestra botón "Ver comprobante" cuando el alumno justificado tiene evidencia_url', () => {
    const c = montar({
      estado: { a1: 'J', a2: 'P' },
      justificaciones: {
        a1: { motivo: 'Reposo médico', evidencia_url: 'https://test.co/comprobante.jpg' },
      },
    })
    const btn = c.querySelector('.pm-asist-item[data-id="a1"] [data-action="ver-evidencia"]')
    expect(btn).not.toBeNull()
    expect(btn.dataset.url).toBe('https://test.co/comprobante.jpg')
    expect(btn.textContent).toContain('Ver comprobante')
  })

  it('no muestra botón "Ver comprobante" si el alumno no tiene evidencia', () => {
    const c = montar({
      estado: { a1: 'J', a2: 'P' },
      justificaciones: {
        a1: { motivo: 'Reposo médico' },
      },
    })
    const btn = c.querySelector('.pm-asist-item[data-id="a1"] [data-action="ver-evidencia"]')
    expect(btn).toBeNull()
  })

  it('hacer click en "Ver comprobante" abre el modal de visualización de evidencia', () => {
    const c = montar({
      estado: { a1: 'J', a2: 'P' },
      justificaciones: {
        a1: { motivo: 'Reposo médico', evidencia_url: 'https://test.co/comprobante.jpg' },
      },
    })
    const btn = c.querySelector('.pm-asist-item[data-id="a1"] [data-action="ver-evidencia"]')
    btn.click()

    const modal = document.getElementById('pm-evidencia-preview-modal')
    expect(modal).not.toBeNull()
    expect(modal.querySelector('img').src).toBe('https://test.co/comprobante.jpg')
    expect(modal.textContent).toContain('Ana Pérez')
    expect(modal.textContent).toContain('Reposo médico')

    // Cerrar el modal
    modal.querySelector('#pm-evidencia-close').click()
    expect(document.getElementById('pm-evidencia-preview-modal')).toBeNull()
  })
})

describe('StudentList — cambiar de Justificado a P o A pide confirmación y elimina la justificación', () => {
  let confirmSpy

  beforeEach(() => {
    document.body.innerHTML = ''
    confirmSpy = vi.spyOn(window, 'confirm')
  })

  afterEach(() => {
    confirmSpy?.mockRestore()
  })

  it('si el usuario cancela la confirmación, no cambia el estado J ni elimina la justificación', () => {
    confirmSpy.mockReturnValue(false)
    const eliminarJustificacionFn = vi.fn()
    const deleteEvidenciaFn = vi.fn()
    const onEstadoChange = vi.fn()
    const justificaciones = {
      a1: { id: 'j-1', motivo: 'Cita con pediatra', evidencia_url: 'https://test.co/foto.png' },
    }
    const estado = { a1: 'J', a2: 'P' }

    const c = montar({
      estado,
      justificaciones,
      eliminarJustificacionFn,
      deleteEvidenciaFn,
      onEstadoChange,
    })

    c.querySelector('.pm-asist-item[data-id="a1"] [data-action="P"]').click()

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(confirmSpy.mock.calls[0][0]).toContain('Cita con pediatra')
    expect(estado.a1).toBe('J')
    expect(eliminarJustificacionFn).not.toHaveBeenCalled()
    expect(deleteEvidenciaFn).not.toHaveBeenCalled()
    expect(justificaciones.a1).toBeDefined()
    expect(onEstadoChange).not.toHaveBeenCalled()
  })

  it('si el usuario acepta la confirmación, cambia a P, borra la justificación en BD/Storage y limpia justificaciones', () => {
    confirmSpy.mockReturnValue(true)
    const eliminarJustificacionFn = vi.fn().mockResolvedValue({ error: null })
    const deleteEvidenciaFn = vi.fn().mockResolvedValue()
    const onEstadoChange = vi.fn()
    const onAutoSave = vi.fn()
    const justificaciones = {
      a1: { id: 'j-1', motivo: 'Cita con pediatra', evidencia_url: 'https://test.co/foto.png' },
    }
    const estado = { a1: 'J', a2: 'P' }

    const c = montar({
      estado,
      justificaciones,
      eliminarJustificacionFn,
      deleteEvidenciaFn,
      onEstadoChange,
      onAutoSave,
    })

    c.querySelector('.pm-asist-item[data-id="a1"] [data-action="P"]').click()

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(estado.a1).toBe('P')
    expect(eliminarJustificacionFn).toHaveBeenCalledWith(expect.objectContaining({ justificacionId: 'j-1' }))
    expect(deleteEvidenciaFn).toHaveBeenCalledWith('https://test.co/foto.png')
    expect(justificaciones.a1).toBeUndefined()
    expect(onEstadoChange).toHaveBeenCalledWith('a1', 'P')
    expect(onAutoSave).toHaveBeenCalledWith(true)
  })

  it('cambiar de P a A en un alumno normal no pide confirmación', () => {
    confirmSpy.mockReturnValue(true)
    const onEstadoChange = vi.fn()
    const estado = { a1: 'P', a2: 'P' }

    const c = montar({
      estado,
      justificaciones: {},
      onEstadoChange,
    })

    c.querySelector('.pm-asist-item[data-id="a1"] [data-action="A"]').click()

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(estado.a1).toBe('A')
    expect(onEstadoChange).toHaveBeenCalledWith('a1', 'A')
  })
})


