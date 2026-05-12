/**
 * Global error boundary component
 * Catches unhandled errors and displays user-friendly messages
 */

let errorBoundaryElement = null
let errorCallback = null
let errorHandlerAttached = false

export function renderErrorBoundary(container, { onError = null, children = '' } = {}) {
  errorBoundaryElement = container
  errorCallback = onError

  container.innerHTML = children

  if (!errorHandlerAttached) {
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    errorHandlerAttached = true
  }

  return {
    dispose: () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
      errorHandlerAttached = false
    },
  }
}

function handleError(event) {
  const error = event.error || new Error(event.message)
  displayError(error)

  if (errorCallback) {
    errorCallback(error, { type: 'error', context: 'window.error' })
  }
}

function handleRejection(event) {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason))

  displayError(error)

  if (errorCallback) {
    errorCallback(error, { type: 'unhandledRejection', context: 'Promise' })
  }
}

function displayError(error) {
  if (!errorBoundaryElement) return

  const message = error.message || 'An unknown error occurred'
  const stack = error.stack || ''

  errorBoundaryElement.innerHTML = `
    <div class="error-boundary-container" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    ">
      <div class="error-boundary-modal" style="
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 500px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      ">
        <h1 class="error-boundary-title" style="
          color: #dc2626;
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 12px 0;
        ">Oops! Algo salió mal</h1>
        
        <p class="error-boundary-message" style="
          color: #374151;
          font-size: 14px;
          margin: 0 0 16px 0;
        ">${message}</p>
        
        <details style="
          margin: 12px 0;
          padding: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 12px;
        ">
          <summary style="cursor: pointer; color: #6b7280;">Detalles técnicos</summary>
          <pre style="
            margin: 8px 0 0 0;
            overflow-x: auto;
            color: #6b7280;
            font-family: monospace;
            font-size: 11px;
          ">${stack}</pre>
        </details>

        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button class="error-boundary-retry" style="
            padding: 8px 16px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Reintentar</button>
          
          <button class="error-boundary-home" style="
            padding: 8px 16px;
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Ir a Inicio</button>
        </div>
      </div>
    </div>
  `

  errorBoundaryElement.querySelector('.error-boundary-retry')?.addEventListener('click', () => {
    window.location.reload()
  })

  errorBoundaryElement.querySelector('.error-boundary-home')?.addEventListener('click', () => {
    window.location.hash = '#/'
  })
}

export const ErrorBoundary = {
  renderErrorBoundary,
}