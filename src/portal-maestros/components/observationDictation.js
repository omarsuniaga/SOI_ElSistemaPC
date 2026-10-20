/**
 * Dictado de texto plano. Nunca analiza, califica ni guarda por cuenta propia.
 * SpeechRecognition puede usar el servicio de reconocimiento del navegador.
 */
export function createObservationDictation(button, status, { onInsert, getEditorContent }) {
  let recognition = null
  let phase = 'idle'
  let disposed = false

  function show(message = '') {
    status.textContent = message
    status.hidden = !message
  }

  function render() {
    const active = phase !== 'idle'
    button.setAttribute('aria-pressed', String(active))
    button.setAttribute('aria-label', active ? 'Detener dictado' : 'Dictar observación')
    button.title = active ? 'Detener dictado' : 'Dictar observación'
    button.classList.toggle('is-listening', active)
    button.disabled = phase === 'stopping'
  }

  function release() {
    const current = recognition
    recognition = null
    if (current) {
      current.onstart = current.onresult = current.onerror = current.onend = null
      try { current.abort() } catch { /* Ya finalizado. */ }
    }
    phase = 'idle'
    render()
  }

  function toggle() {
    if (disposed) return
    if (recognition) {
      phase = 'stopping'
      render()
      show('Terminando dictado…')
      try { recognition.stop() } catch { release(); show('Dictado detenido.') }
      return
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      show('Este navegador no admite dictado. Puedes usar el micrófono del teclado del teléfono.')
      return
    }

    let current
    const inserted = new Set()
    let receivedText = false
    try {
      current = new Recognition()
      recognition = current
      current.lang = 'es-DO'
      current.continuous = true
      current.interimResults = false
      current.onstart = () => {
        if (disposed || recognition !== current || phase === 'stopping') return
        phase = 'listening'
        render()
        show('Escuchando… Pulsa el micrófono para terminar.')
      }
      current.onresult = (event) => {
        if (disposed || recognition !== current || !button.isConnected) return
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (!result.isFinal || inserted.has(i)) continue
          const text = result[0]?.transcript?.trim()
          if (!text) continue
          inserted.add(i)
          const prefix = getEditorContent?.() ? ' ' : ''
          onInsert(prefix + text + ' ')
          receivedText = true
        }
      }
      current.onerror = (event) => {
        if (recognition !== current) return
        const messages = {
          'not-allowed': 'Permite el acceso al micrófono en tu navegador para dictar.',
          'service-not-allowed': 'El navegador no permite el dictado. Puedes usar el micrófono del teclado.',
          'audio-capture': 'No se encontró un micrófono disponible.',
          'no-speech': 'No se detectó voz. Pulsa el micrófono para intentarlo otra vez.',
          network: 'No se pudo conectar el dictado. Revisa tu conexión e inténtalo otra vez.',
          aborted: 'Dictado detenido.',
        }
        release()
        show(messages[event.error] || 'No se pudo dictar. Puedes seguir escribiendo.')
      }
      current.onend = () => {
        if (recognition !== current) return
        recognition = null
        current.onstart = current.onresult = current.onerror = current.onend = null
        phase = 'idle'
        render()
        show(receivedText ? 'Dictado añadido. Puedes corregir el texto.' : 'Dictado terminado sin texto.')
      }
      phase = 'starting'
      render()
      show('Activando micrófono…')
      current.start()
    } catch {
      release()
      show('No se pudo activar el micrófono. Puedes seguir escribiendo.')
    }
  }

  function suspend() {
    if (recognition) {
      release()
      show('Dictado detenido.')
    }
  }

  function onVisibilityChange() {
    if (document.hidden) suspend()
  }

  button.addEventListener('click', toggle)
  window.addEventListener('pagehide', suspend)
  document.addEventListener('visibilitychange', onVisibilityChange)
  render()

  return {
    destroy() {
      if (disposed) return
      disposed = true
      release()
      button.removeEventListener('click', toggle)
      window.removeEventListener('pagehide', suspend)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    },
  }
}
