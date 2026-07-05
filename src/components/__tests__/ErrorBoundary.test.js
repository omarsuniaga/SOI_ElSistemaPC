import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderErrorBoundary } from '../ErrorBoundary.js'

describe('ErrorBoundary', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    vi.stubGlobal('console', {
      ...console,
      error: vi.fn(),
    })
  })

  it('renders children when no error', () => {
    renderErrorBoundary(container, {
      onError: vi.fn(),
      children: '<div id="test">Safe content</div>',
    })
    expect(container.querySelector('#test')).toBeTruthy()
  })

  it('catches errors and calls onError handler', async () => {
    const onError = vi.fn()
    const errorFn = () => { throw new Error('Test error') }
    
    renderErrorBoundary(container, {
      onError,
      children: '<button id="error-btn">Crash</button>',
    })
    
    container.querySelector('#error-btn').addEventListener('click', errorFn)
    container.querySelector('#error-btn').click()
    
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(onError).toHaveBeenCalled()
  })

  it('displays error message to user', async () => {
    const onError = vi.fn()
    renderErrorBoundary(container, { onError })
    
    const event = new ErrorEvent('error', {
      error: new Error('Something went wrong'),
    })
    window.dispatchEvent(event)
    
    await new Promise(resolve => setTimeout(resolve, 10))
    const errorMsg = container.querySelector('.error-boundary-message')
    expect(errorMsg).toBeTruthy()
    expect(errorMsg.textContent).toContain('Something went wrong')
  })

  it('provides retry button', async () => {
    const onError = vi.fn()
    renderErrorBoundary(container, { onError })
    
    window.dispatchEvent(new ErrorEvent('error', {
      error: new Error('Retry test'),
    }))
    
    await new Promise(resolve => setTimeout(resolve, 10))
    const retryBtn = container.querySelector('.error-boundary-retry')
    expect(retryBtn).toBeTruthy()
    expect(retryBtn.textContent).toContain('Reintentar')
  })
})