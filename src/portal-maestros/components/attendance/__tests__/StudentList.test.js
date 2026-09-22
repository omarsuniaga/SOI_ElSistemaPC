import { describe, it, expect, beforeEach } from 'vitest'
import { createStudentList } from '../StudentList.js'

function montar({ estado, justificaciones }) {
  const container = document.createElement('div')
  container.innerHTML = '<div id="pm-alumnos-list"></div>'
  document.body.appendChild(container)
  const alumnos = [
    { id: 'a1', nombre_completo: 'Ana Pérez', instrumento_principal: 'Violín' },
    { id: 'a2', nombre_completo: 'Beto Gil', instrumento_principal: 'Violín' },
  ]
  const lista = createStudentList(container, { alumnos, estado, justificaciones, snapshots: [] })
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
