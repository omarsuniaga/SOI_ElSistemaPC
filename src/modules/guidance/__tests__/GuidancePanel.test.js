/**
 * Tests for GuidancePanel.js
 * @module guidance/ui/__tests__
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createGuidancePanel } from '../ui/GuidancePanel.js'

const mockService = {
  getHints: vi.fn().mockReturnValue({ proactive: [], reactive: [], total: 0 }),
  getActions: vi.fn().mockReturnValue([]),
  subscribe: vi.fn().mockReturnValue(() => {}),
}

vi.mock('../guidanceService.js', () => ({
  getGuidanceService: () => mockService,
}))

describe('createGuidancePanel', () => {
  let panel

  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
    mockService.getHints.mockReturnValue({ proactive: [], reactive: [], total: 0 })
    mockService.getActions.mockReturnValue([])
    mockService.subscribe.mockReturnValue(() => {})
  })

  afterEach(() => {
    panel?.stop()
    panel = null
    document.body.innerHTML = ''
  })

  it('should create an instance', () => {
    panel = createGuidancePanel()
    expect(panel).toBeDefined()
    expect(typeof panel.open).toBe('function')
    expect(typeof panel.close).toBe('function')
  })

  it('should start and create trigger button', () => {
    panel = createGuidancePanel()
    panel.start()

    const trigger = document.querySelector('.guidance-trigger')
    expect(trigger).toBeTruthy()
    expect(trigger.getAttribute('aria-label')).toBe('Abrir panel de orientación')
  })

  it('should open panel on open()', () => {
    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const aside = document.getElementById('guidance-panel')
    expect(aside).toBeTruthy()
    expect(aside.classList.contains('guidance-panel--open')).toBe(true)
    expect(aside.getAttribute('aria-hidden')).toBe('false')
    expect(panel.isOpen).toBe(true)
  })

  it('should close panel on close()', () => {
    panel = createGuidancePanel()
    panel.start()
    panel.open()
    panel.close()

    const aside = document.getElementById('guidance-panel')
    expect(aside.classList.contains('guidance-panel--open')).toBe(false)
    expect(aside.getAttribute('aria-hidden')).toBe('true')
    expect(panel.isOpen).toBe(false)
  })

  it('should toggle', () => {
    panel = createGuidancePanel()
    panel.start()

    panel.toggle()
    expect(panel.isOpen).toBe(true)

    panel.toggle()
    expect(panel.isOpen).toBe(false)
  })

  it('should render actions in panel', () => {
    mockService.getActions.mockReturnValue([
      { action: 'mark_present', label: 'Marcar presente', icon: 'bi-check-circle', priority: 'primary' },
      { action: 'view_reports', label: 'Ver reportes', icon: 'bi-file-bar-graph', priority: 'secondary' },
    ])

    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const actions = document.querySelectorAll('.guidance-action')
    expect(actions.length).toBe(2)
    expect(actions[0].querySelector('span:last-child')?.textContent).toBe('Marcar presente')
  })

  it('should render reactive hints in panel', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [
        { id: 'r1', message: 'Hay ausencias', action: 'Registrá justificación', priority: 'medium', process: 'test' },
      ],
      total: 1,
    })

    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const hints = document.querySelectorAll('[data-guidance-reactive-hints] .guidance-hint')
    expect(hints.length).toBe(1)
  })

  it('should show empty state when no actions', () => {
    mockService.getActions.mockReturnValue([])

    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const text = document.querySelector('[data-guidance-actions]')?.textContent
    expect(text).toContain('No hay acciones disponibles')
  })

  it('should show empty state when no reactive hints', () => {
    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const text = document.querySelector('[data-guidance-reactive-hints]')?.textContent
    expect(text).toContain('No hay sugerencias pendientes')
  })

  it('should call onNavigate when action is clicked', () => {
    const onNavigate = vi.fn()
    mockService.getActions.mockReturnValue([
      { action: 'mark_present', label: 'Presente', icon: 'bi-check', priority: 'primary' },
    ])

    panel = createGuidancePanel({ onNavigate })
    panel.start()
    panel.open()

    const btn = document.querySelector('.guidance-action')
    btn.click()

    expect(onNavigate).toHaveBeenCalledWith('mark_present')
  })

  it('should close when clicking overlay', () => {
    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const overlay = document.querySelector('.guidance-overlay')
    overlay.click()

    expect(panel.isOpen).toBe(false)
  })

  it('should close on Escape key', () => {
    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const aside = document.getElementById('guidance-panel')
    aside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(panel.isOpen).toBe(false)
  })

  it('should clean up on stop()', () => {
    const unsub = vi.fn()
    mockService.subscribe.mockReturnValue(unsub)

    panel = createGuidancePanel()
    panel.start()
    panel.stop()

    expect(unsub).toHaveBeenCalled()
    expect(document.querySelector('.guidance-trigger')).toBeNull()
    expect(document.getElementById('guidance-panel')).toBeNull()
  })

  it('should refresh when open', () => {
    panel = createGuidancePanel()
    panel.start()
    panel.open()

    mockService.getActions.mockReturnValue([
      { action: 'new_action', label: 'New', icon: 'bi-star', priority: 'primary' },
    ])

    panel.refresh()

    const actions = document.querySelectorAll('.guidance-action')
    expect(actions.length).toBe(1)
  })

  it('should set ARIA dialog attributes', () => {
    panel = createGuidancePanel()
    panel.start()
    panel.open()

    const aside = document.getElementById('guidance-panel')
    expect(aside.getAttribute('role')).toBe('dialog')
    expect(aside.getAttribute('aria-label')).toBe('Panel de orientación')
  })
})
