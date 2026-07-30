/**
 * Tests for SmartAlerts.js
 * @module guidance/ui/__tests__
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSmartAlerts } from '../ui/SmartAlerts.js'

const mockService = {
  getHints: vi.fn().mockReturnValue({ proactive: [], reactive: [], alerts: [], total: 0 }),
  subscribe: vi.fn().mockReturnValue(() => {}),
}

vi.mock('../guidanceService.js', () => ({
  getGuidanceService: () => mockService,
}))

describe('createSmartAlerts', () => {
  let alerts

  beforeEach(() => {
    document.body.innerHTML = '<div id="alert-slot"></div>'
    vi.clearAllMocks()
    localStorage.clear()
    mockService.getHints.mockReturnValue({ proactive: [], reactive: [], alerts: [], total: 0 })
    mockService.subscribe.mockReturnValue(() => {})
  })

  afterEach(() => {
    alerts?.stop()
    alerts = null
    document.body.innerHTML = ''
  })

  it('should create an instance', () => {
    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    expect(alerts).toBeDefined()
    expect(typeof alerts.start).toBe('function')
    expect(typeof alerts.stop).toBe('function')
  })

  it('should render nothing when no alerts', () => {
    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()

    const wrapper = document.querySelector('.guidance-alerts')
    expect(wrapper).toBeNull()
  })

  it('should render alert cards', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: 'Critical alert!', action: 'Fix now', priority: 'critical', process: 'test' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()

    const cards = document.querySelectorAll('.guidance-alert')
    expect(cards.length).toBe(1)
    expect(cards[0].querySelector('.guidance-alert__message')?.textContent).toBe('Critical alert!')
  })

  it('should apply priority class', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: 'High alert', action: '', priority: 'high', process: 'test' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()

    const card = document.querySelector('.guidance-alert')
    expect(card.classList.contains('guidance-alert--high')).toBe(true)
  })

  it('should limit alerts to maxAlerts', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: '1', action: '', priority: 'critical', process: 't' },
        { id: 'a2', message: '2', action: '', priority: 'critical', process: 't' },
        { id: 'a3', message: '3', action: '', priority: 'high', process: 't' },
      ],
      total: 3,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot', maxAlerts: 1 })
    alerts.start()

    const cards = document.querySelectorAll('.guidance-alert')
    expect(cards.length).toBe(1)
  })

  it('should dismiss alert on button click', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: 'Dismiss me', action: '', priority: 'critical', process: 'test' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()

    document.querySelector('[data-dismiss-alert="a1"]')?.click()

    const cards = document.querySelectorAll('.guidance-alert')
    expect(cards.length).toBe(0)
  })

  it('should persist dismissed alerts to localStorage', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: 'Persisted', action: '', priority: 'critical', process: 'test' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()
    document.querySelector('[data-dismiss-alert="a1"]')?.click()

    const stored = JSON.parse(localStorage.getItem('guidance-dismissed-alerts') || '[]')
    expect(stored).toContain('a1')
  })

  it('should not re-show previously dismissed alerts', () => {
    localStorage.setItem('guidance-dismissed-alerts', JSON.stringify(['a1']))

    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: 'Was dismissed', action: '', priority: 'critical', process: 'test' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()

    const cards = document.querySelectorAll('.guidance-alert')
    expect(cards.length).toBe(0)
  })

  it('should call onAlertAction when alert body is clicked', () => {
    const onAction = vi.fn()
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: 'Clickable', action: 'Go', priority: 'critical', process: 'test' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot', onAlertAction: onAction })
    alerts.start()

    document.querySelector('.guidance-alert__body')?.click()
    expect(onAction).toHaveBeenCalledWith('a1', expect.objectContaining({ id: 'a1' }))
  })

  it('should subscribe to service changes', () => {
    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()
    expect(mockService.subscribe).toHaveBeenCalled()
  })

  it('should clean up on stop()', () => {
    const unsub = vi.fn()
    mockService.subscribe.mockReturnValue(unsub)

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()
    alerts.stop()

    expect(unsub).toHaveBeenCalled()
    expect(document.querySelector('.guidance-alerts')).toBeNull()
  })

  it('should set ARIA attributes', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: 'Accessible alert', action: '', priority: 'critical', process: 't' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()

    const wrapper = document.querySelector('.guidance-alerts')
    expect(wrapper.getAttribute('role')).toBe('alert')
    expect(wrapper.getAttribute('aria-live')).toBe('assertive')
  })

  it('should escape HTML in messages', () => {
    mockService.getHints.mockReturnValue({
      proactive: [],
      reactive: [],
      alerts: [
        { id: 'a1', message: '<img src=x onerror=alert(1)>', action: '', priority: 'critical', process: 't' },
      ],
      total: 1,
    })

    alerts = createSmartAlerts({ containerSelector: '#alert-slot' })
    alerts.start()

    const msg = document.querySelector('.guidance-alert__message')
    expect(msg.innerHTML).not.toContain('<img')
  })
})
