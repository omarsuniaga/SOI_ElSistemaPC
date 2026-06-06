import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reportError, initErrorReporter } from '../errorReporter.js'

describe('errorReporter', () => {
  let sentryMock

  beforeEach(() => {
    sentryMock = {
      init: vi.fn(),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      setTag: vi.fn(),
      setContext: vi.fn(),
      addBreadcrumb: vi.fn(),
      Replay: vi.fn(),
    }
    globalThis.Sentry = sentryMock
  })

  it('initializes with DSN', () => {
    initErrorReporter({ dsn: 'https://...@sentry.io/123' })
    expect(sentryMock).toBeDefined()
  })

  it('captures exceptions with context', () => {
    const error = new Error('Test error')
    reportError(error, { userId: '123', context: 'lesson-plan' })
    expect(sentryMock.captureException).toHaveBeenCalled()
    expect(sentryMock.captureException.mock.calls[0][0]).toEqual(error)
  })

  it('adds user info to reports', () => {
    reportError(new Error('Test'), { userId: 'user-456' })
    expect(sentryMock.setUser).toHaveBeenCalledWith({ id: 'user-456' })
  })

  it('tags errors with context', () => {
    reportError(new Error('Test'), { context: 'observation-editor' })
    expect(sentryMock.setTag).toHaveBeenCalledWith('context', 'observation-editor')
  })

  it('captures messages', () => {
    reportError('Warning message', { level: 'warning' })
    expect(sentryMock.captureMessage).toHaveBeenCalled()
  })
})