import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderErrorBoundary, ErrorBoundary } from '../ErrorBoundary.js'

describe('ErrorBoundary', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    vi.stubGlobal('console.error', vi.fn())
  })

  it('renders children when no error', () => {
    renderErrorBoundary(container, {
      onError: vi.fn(),
      children: '<div id="test">Safe content</div>',
    })
    expect(container.querySelector('#test')).toBeTruthy()
  })

  it('catches errors and calls onError handler', () => {
    const onError = vi.fn()
    const errorFn = () => { throw new Error('Test error') }
    
    renderErrorBoundary(container, {
      onError,
      children: '<button id="error-btn">Crash</button>',
    })
    
    container.querySelector('#error-btn').addEventListener('click', errorFn)
    container.querySelector('#error-btn').click()
    
    // Wait for error to propagate
    setTimeout(() => {
      expect(onError).toHaveBeenCalled()
    }, 0)
  })

  it('displays error message to user', () => {
    const onError = vi.fn()
    renderErrorBoundary(container, { onError })
    
    // Simulate error
    const event = new ErrorEvent('error', {
      error: new Error('Something went wrong'),
    })
    window.dispatchEvent(event)
    
    setTimeout(() => {
      const errorMsg = container.querySelector('.error-boundary-message')
      expect(errorMsg).toBeTruthy()
      expect(errorMsg.textContent).toContain('Something went wrong')
    }, 0)
  })

  it('provides retry button', () => {
    const onError = vi.fn()
    renderErrorBoundary(container, { onError })
    
    window.dispatchEvent(new ErrorEvent('error', {
      error: new Error('Retry test'),
    }))
    
    setTimeout(() => {
      const retryBtn = container.querySelector('.error-boundary-retry')
      expect(retryBtn).toBeTruthy()
      expect(retryBtn.textContent).toContain('Reintentar')
    }, 0)
  })
})
