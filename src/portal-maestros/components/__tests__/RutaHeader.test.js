import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderRutaHeader } from '../RutaHeader.js'

describe('RutaHeader', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders header with ruta title', () => {
    const props = {
      rutaName: 'Matemáticas Básicas',
      clases: [
        { id: 'c1', nombre: 'Grupo A' },
        { id: 'c2', nombre: 'Grupo B' },
      ],
      activeClaseId: 'c1',
      nodesCovered: 5,
      totalNodes: 12,
      onClaseChange: vi.fn(),
    }

    renderRutaHeader(container, props)

    expect(container.textContent).toContain('Matemáticas Básicas')
    expect(container.querySelector('.ruta-header')).toBeTruthy()
  })

  it('renders class dropdown with all classes', () => {
    const props = {
      rutaName: 'Test Ruta',
      clases: [
        { id: 'c1', nombre: 'Grupo A' },
        { id: 'c2', nombre: 'Grupo B' },
        { id: 'c3', nombre: 'Grupo C' },
      ],
      activeClaseId: 'c1',
      nodesCovered: 2,
      totalNodes: 10,
      onClaseChange: vi.fn(),
    }

    renderRutaHeader(container, props)

    const select = container.querySelector('#ruta-clase-select')
    expect(select).toBeTruthy()
    expect(select.querySelectorAll('option').length).toBe(3)
  })

  it('calls onClaseChange when dropdown changes', async () => {
    const onClaseChange = vi.fn()
    const props = {
      rutaName: 'Test Ruta',
      clases: [
        { id: 'c1', nombre: 'Grupo A' },
        { id: 'c2', nombre: 'Grupo B' },
      ],
      activeClaseId: 'c1',
      nodesCovered: 1,
      totalNodes: 5,
      onClaseChange,
    }

    renderRutaHeader(container, props)

    const select = container.querySelector('#ruta-clase-select')
    select.value = 'c2'
    select.dispatchEvent(new Event('change', { bubbles: true }))

    expect(onClaseChange).toHaveBeenCalledWith('c2')
  })

  it('displays progress stats (covered / total)', () => {
    const props = {
      rutaName: 'Test Ruta',
      clases: [{ id: 'c1', nombre: 'Grupo A' }],
      activeClaseId: 'c1',
      nodesCovered: 7,
      totalNodes: 20,
      onClaseChange: vi.fn(),
    }

    renderRutaHeader(container, props)

    expect(container.textContent).toContain('7')
    expect(container.textContent).toContain('20')
  })
})
