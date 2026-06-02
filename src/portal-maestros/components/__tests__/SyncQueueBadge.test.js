import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// ── Mock idb (for getQueueCount) ─────────────────────────
let mockCount = 0

const mockDb = {
  add: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  put: vi.fn(),
  count: vi.fn(async () => mockCount),
  clear: vi.fn(),
  createObjectStore: vi.fn(() => ({ createIndex: vi.fn() })),
  objectStoreNames: { contains: vi.fn(() => false) },
  close: vi.fn(),
}

vi.mock('idb', () => ({
  openDB: vi.fn(async () => mockDb),
}))

// ── Module under test ────────────────────────────────────
import { createSyncQueueBadge } from '../SyncQueueBadge.js'

describe('SyncQueueBadge', () => {
  /** @type {HTMLElement} */
  let container

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    mockCount = 0
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('should render hidden when queue is empty', async () => {
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)

    // Allow microtask to resolve getQueueCount
    await vi.runAllTimersAsync()
    expect(badge.el.style.display).toBe('none')
  })

  it('should show pending count when queue has items', async () => {
    mockCount = 3
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)

    await vi.runAllTimersAsync()

    expect(badge.el.style.display).toBe('inline-flex')
    expect(badge.el.textContent).toContain('3 pendientes')
  })

  it('should show singular text for 1 pending item', async () => {
    mockCount = 1
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)

    await vi.runAllTimersAsync()

    expect(badge.el.textContent).toContain('1 pendiente')
  })

  it('should update when refresh is called', async () => {
    mockCount = 2
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)
    await vi.runAllTimersAsync()
    expect(badge.el.textContent).toContain('2 pendientes')

    mockCount = 0
    await badge.refresh()
    expect(badge.el.style.display).toBe('none')
  })

  it('should include sync button by default', async () => {
    mockCount = 1
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)
    await vi.runAllTimersAsync()

    const btn = badge.el.querySelector('button')
    expect(btn).toBeTruthy()
    expect(btn.textContent).toContain('Sincronizar')
  })

  it('should show sync button only when online', async () => {
    mockCount = 1
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    try {
      const badge = createSyncQueueBadge()
      container.appendChild(badge.el)
      await vi.runAllTimersAsync()

      const btn = badge.el.querySelector('button')
      expect(btn.style.display).toBe('none')
    } finally {
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    }
  })

  it('should hide sync button when showSyncButton is false', async () => {
    mockCount = 1
    const badge = createSyncQueueBadge({ showSyncButton: false })
    container.appendChild(badge.el)
    await vi.runAllTimersAsync()

    const btn = badge.el.querySelector('button')
    expect(btn).toBeNull()
  })

  it('should respond to online event', async () => {
    mockCount = 2
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)
    await vi.runAllTimersAsync()
    expect(badge.el.style.display).toBe('inline-flex')

    // After online event, badge refreshes after 2s delay
    mockCount = 0
    window.dispatchEvent(new Event('online'))
    vi.advanceTimersByTime(2000)
    await vi.runAllTimersAsync()

    expect(badge.el.style.display).toBe('none')
  })

  it('should respond to offline event', async () => {
    mockCount = 1
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)
    await vi.runAllTimersAsync()
    expect(badge.el.style.display).toBe('inline-flex')

    // Go offline: should hide sync button
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    window.dispatchEvent(new Event('offline'))
    await vi.runAllTimersAsync()

    const btn = badge.el.querySelector('button')
    expect(btn.style.display).toBe('none')

    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
  })

  it('should clean up on destroy', async () => {
    mockCount = 1
    const badge = createSyncQueueBadge()
    container.appendChild(badge.el)
    await vi.runAllTimersAsync()

    badge.destroy()
    expect(badge.el.parentNode).toBeNull()
  })
})
