import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

vi.mock('../../api/planEstudiosApi.js', () => ({
  fetchPlanEntradas: vi.fn(),
  insertPlanEntrada: vi.fn(),
  updatePlanEntrada: vi.fn(),
  deletePlanEntrada: vi.fn(),
}))

// escHTML used internally — provide simple implementation
vi.mock('../../utils/portalUtils.js', () => ({
  escHTML: (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),
}))

import * as api from '../../api/planEstudiosApi.js'
import { PlanEstudiosPanel } from '../PlanEstudiosPanel.js'

function setupDOM() {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>')
  global.document = dom.window.document
  global.window   = dom.window
  return dom.window.document.getElementById('root')
}

describe('PlanEstudiosPanel', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = setupDOM()
  })

  it('renders empty state when no entries exist', async () => {
    api.fetchPlanEntradas.mockResolvedValue([])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    expect(container.querySelector('[data-testid="pe-empty"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="pe-btn-add"]')).not.toBeNull()
  })

  it('renders entries when data exists', async () => {
    api.fetchPlanEntradas.mockResolvedValue([
      { id: 'e1', tipo: 'diagnostico', titulo: 'Nivel inicial', descripcion: 'Conoce posición 1', created_at: '2026-05-01T00:00:00Z' },
      { id: 'e2', tipo: 'logro',       titulo: 'Do mayor',      descripcion: null,                  created_at: '2026-05-10T00:00:00Z' },
    ])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    const cards = container.querySelectorAll('[data-testid="pe-entry"]')
    expect(cards).toHaveLength(2)
    expect(cards[0].querySelector('[data-testid="pe-entry-titulo"]').textContent).toBe('Nivel inicial')
  })

  it('shows tipo badge for each entry', async () => {
    api.fetchPlanEntradas.mockResolvedValue([
      { id: 'e1', tipo: 'diagnostico', titulo: 'Diagnóstico', descripcion: null, created_at: '2026-05-01T00:00:00Z' },
    ])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    const badge = container.querySelector('[data-testid="pe-tipo-badge"]')
    expect(badge).not.toBeNull()
    expect(badge.textContent).toContain('Diagnóstico')
  })

  it('addEntry() calls insertPlanEntrada and updates list', async () => {
    api.fetchPlanEntradas.mockResolvedValue([])
    const newEntry = { id: 'e3', tipo: 'logro', titulo: 'Arco', descripcion: null, created_at: '2026-05-20T00:00:00Z' }
    api.insertPlanEntrada.mockResolvedValue(newEntry)

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    await panel.addEntry({ tipo: 'logro', titulo: 'Arco', descripcion: null })

    expect(api.insertPlanEntrada).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'logro', titulo: 'Arco', alumno_id: 'a1', maestro_id: 'm1' })
    )
    const cards = container.querySelectorAll('[data-testid="pe-entry"]')
    expect(cards).toHaveLength(1)
    expect(cards[0].querySelector('[data-testid="pe-entry-titulo"]').textContent).toBe('Arco')
  })

  it('deleteEntry() calls deletePlanEntrada and removes entry from list', async () => {
    const entries = [{ id: 'e1', tipo: 'logro', titulo: 'Do mayor', descripcion: null, created_at: '2026-05-10T00:00:00Z' }]
    api.fetchPlanEntradas.mockResolvedValue(entries)
    api.deletePlanEntrada.mockResolvedValue(undefined)

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    expect(container.querySelectorAll('[data-testid="pe-entry"]')).toHaveLength(1)

    await panel.deleteEntry('e1')

    expect(api.deletePlanEntrada).toHaveBeenCalledWith('e1')
    expect(container.querySelectorAll('[data-testid="pe-entry"]')).toHaveLength(0)
    expect(container.querySelector('[data-testid="pe-empty"]')).not.toBeNull()
  })

  it('toolbar shows "Registrar diagnóstico" when no diagnostico entry exists', async () => {
    api.fetchPlanEntradas.mockResolvedValue([])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    expect(container.querySelector('[data-testid="pe-btn-add"]').textContent).toContain('Registrar diagnóstico')
  })

  it('toolbar shows "Nueva entrada" when diagnostico already exists', async () => {
    api.fetchPlanEntradas.mockResolvedValue([
      { id: 'e1', tipo: 'diagnostico', titulo: 'Nivel base', descripcion: null, created_at: '2026-05-01T00:00:00Z' },
    ])

    const panel = new PlanEstudiosPanel({ container, alumnoId: 'a1', maestroId: 'm1' })
    await panel.init()

    expect(container.querySelector('[data-testid="pe-btn-add"]').textContent).toContain('Nueva entrada')
  })
})
