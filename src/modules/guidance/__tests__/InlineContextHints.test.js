/**
 * Tests for InlineContextHints.js
 * @module guidance/ui/__tests__
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createInlineHints } from '../ui/InlineContextHints.js'

// Mock guidance service
const mockService = {
  getHints: vi.fn().mockReturnValue({ proactive: [], reactive: [], total: 0 }),
  subscribe: vi.fn().mockReturnValue(() => {}),
}

vi.mock('../guidanceService.js', () => ({
  getGuidanceService: () => mockService,
}))

describe('createInlineHints', () => {
  let container

  beforeEach(() => {
    document.body.innerHTML = '<div id="hints-slot"></div>'
    container = document.getElementById('hints-slot')
    mockService.getHints.mockReturnValue({ proactive: [], reactive: [], total: 0 })
    mockService.subscribe.mockReturnValue(() => {})
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should create an instance without errors', () => {
    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    expect(hints).toBeDefined()
    expect(typeof hints.start).toBe('function')
    expect(typeof hints.stop).toBe('function')
  })

  it('should render nothing when no proactive hints', () => {
    mockService.getHints.mockReturnValue({ proactive: [], reactive: [], total: 0 })
    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    hints.start()

    const wrapper = container.querySelector('.guidance-hints')
    expect(wrapper).toBeNull() // wrapper not appended when empty
  })

  it('should render hint cards when proactive hints exist', () => {
    mockService.getHints.mockReturnValue({
      proactive: [
        { id: 'h1', message: 'Test hint', action: 'Do something', priority: 'high', process: 'test' },
      ],
      reactive: [],
      total: 1,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    hints.start()

    const cards = container.querySelectorAll('.guidance-hint')
    expect(cards.length).toBe(1)
    expect(cards[0].querySelector('.guidance-hint__message')?.textContent).toBe('Test hint')
  })

  it('should apply priority class', () => {
    mockService.getHints.mockReturnValue({
      proactive: [
        { id: 'h1', message: 'Critical', action: '', priority: 'critical', process: 'test' },
      ],
      reactive: [],
      total: 1,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    hints.start()

    const card = container.querySelector('.guidance-hint')
    expect(card.classList.contains('guidance-hint--critical')).toBe(true)
  })

  it('should limit hints to maxHints', () => {
    mockService.getHints.mockReturnValue({
      proactive: [
        { id: 'h1', message: '1', action: '', priority: 'high', process: 't' },
        { id: 'h2', message: '2', action: '', priority: 'high', process: 't' },
        { id: 'h3', message: '3', action: '', priority: 'high', process: 't' },
        { id: 'h4', message: '4', action: '', priority: 'medium', process: 't' },
      ],
      reactive: [],
      total: 4,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot', maxHints: 2 })
    hints.start()

    const cards = container.querySelectorAll('.guidance-hint')
    expect(cards.length).toBe(2)
  })

  it('should dismiss hint on button click', () => {
    mockService.getHints.mockReturnValue({
      proactive: [
        { id: 'h1', message: 'Dismiss me', action: '', priority: 'high', process: 'test' },
      ],
      reactive: [],
      total: 1,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot', animate: false })
    hints.start()

    const btn = container.querySelector('[data-dismiss-hint="h1"]')
    btn.click()

    const cards = container.querySelectorAll('.guidance-hint')
    expect(cards.length).toBe(0)
  })

  it('should track dismissed hints', () => {
    mockService.getHints.mockReturnValue({
      proactive: [
        { id: 'h1', message: 'Gone', action: '', priority: 'high', process: 'test' },
      ],
      reactive: [],
      total: 1,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot', animate: false })
    hints.start()

    const btn = container.querySelector('[data-dismiss-hint="h1"]')
    btn.click()

    expect(hints.getDismissed()).toContain('h1')
  })

  it('should restore dismissed hints', () => {
    mockService.getHints.mockReturnValue({
      proactive: [
        { id: 'h1', message: 'Was dismissed', action: '', priority: 'high', process: 'test' },
      ],
      reactive: [],
      total: 1,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    hints.restoreDismissed(['h1'])
    hints.start()

    const cards = container.querySelectorAll('.guidance-hint')
    expect(cards.length).toBe(0) // dismissed, not shown
  })

  it('should subscribe to service changes', () => {
    createInlineHints({ containerSelector: '#hints-slot' }).start()
    expect(mockService.subscribe).toHaveBeenCalled()
  })

  it('should stop and clean up', () => {
    mockService.getHints.mockReturnValue({
      proactive: [{ id: 'h1', message: 'x', action: '', priority: 'high', process: 't' }],
      reactive: [],
      total: 1,
    })

    const unsub = vi.fn()
    mockService.subscribe.mockReturnValue(unsub)

    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    hints.start()
    hints.stop()

    expect(unsub).toHaveBeenCalled()
    expect(container.querySelector('.guidance-hints')).toBeNull()
  })

  it('should escape HTML in messages', () => {
    mockService.getHints.mockReturnValue({
      proactive: [
        { id: 'h1', message: '<script>alert("xss")</script>', action: '', priority: 'high', process: 't' },
      ],
      reactive: [],
      total: 1,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    hints.start()

    const msg = container.querySelector('.guidance-hint__message')
    expect(msg.innerHTML).not.toContain('<script>')
  })

  it('should set ARIA attributes', () => {
    mockService.getHints.mockReturnValue({
      proactive: [{ id: 'h1', message: 'Accessible', action: '', priority: 'high', process: 't' }],
      reactive: [],
      total: 1,
    })

    const hints = createInlineHints({ containerSelector: '#hints-slot' })
    hints.start()

    const wrapper = container.querySelector('.guidance-hints')
    expect(wrapper.getAttribute('role')).toBe('region')
    expect(wrapper.getAttribute('aria-label')).toBe('Sugerencias contextuales')

    const card = container.querySelector('.guidance-hint')
    expect(card.getAttribute('role')).toBe('alert')
    expect(card.getAttribute('aria-live')).toBe('polite')
  })
})
