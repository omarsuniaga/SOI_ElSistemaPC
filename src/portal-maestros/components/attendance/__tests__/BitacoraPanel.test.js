// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createBitacoraPanel } from '../BitacoraPanel.js'

const alumnos = [
  { id: 'le', nombre_completo: 'Lesly Ramírez Leonardo' },
  { id: 'sa', nombre_completo: 'Santa Isaura Castillo Diaz' },
  { id: 'ye', nombre_completo: 'Yereni Esther Germain Michel' },
]

let container
let estado
let panel

function create(overrides = {}) {
  panel = createBitacoraPanel(container, {
    getAlumnos: () => alumnos,
    getEstado: () => estado,
    ...overrides,
  })
  return panel
}

const el = () => container.querySelector('.pm-bitacora-panel')

beforeEach(() => {
  document.body.innerHTML = ''
  container = document.createElement('div')
  document.body.appendChild(container)
  estado = { le: 'P', sa: 'P', ye: 'P' }
})

afterEach(() => {
  panel?.destroy()
  panel = null
})

describe('BitacoraPanel rendering', () => {
  it('groups registros by recipient with their type labels', () => {
    create().update('#Lesly Ramírez Leonardo [Escala de Sol] (arco) {practicar} bien. #todos tienen problemas.')
    const text = el().textContent
    expect(text).toContain('Lo que se registrará')
    expect(text).toContain('Lesly Ramírez Leonardo')
    expect(text).toContain('Todos los presentes')
    expect(text).toContain('Contenido')
    expect(text).toContain('A reforzar')
    expect(text).toContain('Tarea')
    expect(text).toContain('Desempeño')
    expect(text).toContain('Escala de Sol')
    expect(text).toContain('tienen problemas')
  })

  it('shows coverage as X/Y presentes con registro in a live region', () => {
    create().update('#Lesly Ramírez Leonardo avanza.')
    const status = el().querySelector('[role="status"]')
    expect(status.getAttribute('aria-live')).toBe('polite')
    expect(status.textContent).toBe('1/3 presentes con registro')
    panel.update('#Lesly Ramírez Leonardo avanza. #todos tienen problemas.')
    expect(el().querySelector('[role="status"]').textContent).toBe('3/3 presentes con registro')
  })

  it('lists sentences without a recipient under Sin asignar', () => {
    create().update('Clase tranquila. #Lesly Ramírez Leonardo avanza.')
    const text = el().textContent
    expect(text).toContain('Sin asignar')
    expect(text).toContain('Clase tranquila.')
  })

  it('warns about absent students and ambiguous names', () => {
    estado = { le: 'A', sa: 'P', ye: 'P' }
    create().update('#Lesly Ramírez Leonardo llegó tarde.')
    expect(el().textContent).toContain('Lesly Ramírez Leonardo no está presente')

    const twins = [{ id: 'a1', nombre: 'Ana Pérez' }, { id: 'a2', nombre: 'Ana Pérez' }]
    estado = { a1: 'P', a2: 'P' }
    panel.destroy()
    create({ getAlumnos: () => twins }).update('#Ana Pérez toca')
    expect(el().textContent).toContain('Nombre repetido en la lista: Ana Pérez; usa el chip para elegir')
  })

  it('stays hidden while the text is empty', () => {
    create().update('')
    expect(el().hidden).toBe(true)
    panel.update('   \n ')
    expect(el().hidden).toBe(true)
    panel.update('#Lesly Ramírez Leonardo avanza.')
    expect(el().hidden).toBe(false)
  })

  it('escapes student names and note text', () => {
    const risky = [{ id: 'x', nombre_completo: 'Ana <b>Bold</b>' }]
    estado = { x: 'P' }
    create({ getAlumnos: () => risky }).update('#Ana <b>Bold</b> <img src=x onerror=alert(1)> avanza. Clase <i>libre</i>')
    expect(el().querySelector('b')).toBeNull()
    expect(el().querySelector('img')).toBeNull()
    expect(el().querySelector('i')).toBeNull()
    expect(el().innerHTML).toContain('&lt;b&gt;')
  })

  it('reads state without writing it', () => {
    const before = JSON.stringify(estado)
    create().update('#Lesly Ramírez Leonardo avanza. #todos tienen problemas.')
    expect(JSON.stringify(estado)).toBe(before)
  })

  it('injects its stylesheet only once', () => {
    create()
    const second = createBitacoraPanel(document.createElement('div'), { getAlumnos: () => alumnos, getEstado: () => estado })
    second.destroy()
    expect(document.querySelectorAll('#pm-bitacora-panel-style')).toHaveLength(1)
  })
})

describe('BitacoraPanel lifecycle', () => {
  it('removes its element on destroy and ignores later updates', () => {
    create().update('#Lesly Ramírez Leonardo avanza.')
    expect(el()).not.toBeNull()
    panel.destroy()
    expect(el()).toBeNull()
    expect(() => panel.update('#Lesly Ramírez Leonardo avanza.')).not.toThrow()
    expect(el()).toBeNull()
    panel = null
  })
})
