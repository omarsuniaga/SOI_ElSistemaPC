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
    }
    global.window = global.window || {}
    global.window.Sentry = sentryMock
  })

  it('initializes with DSN', () => {
    initErrorReporter({ dsn: 'https://...@sentry.io/123' })
    expect(sentryMock.init).toHaveBeenCalled()
  })

  it('captures exceptions with context', () => {
    const error = new Error('Test error')
    initErrorReporter({ dsn: 'test-dsn' })
    reportError(error, { userId: '123', context: 'lesson-plan' })
    expect(sentryMock.captureException).toHaveBeenCalledWith(error, expect.any(Object))
  })

  it('adds user info to reports', () => {
    initErrorReporter({ dsn: 'test-dsn' })
    reportError(new Error('Test'), { userId: 'user-456' })
    expect(sentryMock.setUser).toHaveBeenCalledWith({ id: 'user-456' })
  })

  it('tags errors with context', () => {
    initErrorReporter({ dsn: 'test-dsn' })
    reportError(new Error('Test'), { context: 'observation-editor' })
    expect(sentryMock.setTag).toHaveBeenCalledWith('context', 'observation-editor')
  })

  it('captures messages', () => {
    initErrorReporter({ dsn: 'test-dsn' })
    reportError('Warning message', { level: 'warning' })
    expect(sentryMock.captureMessage).toHaveBeenCalled()
  })
})
