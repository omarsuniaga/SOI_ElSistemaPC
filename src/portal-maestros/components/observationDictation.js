/**
 * Dictado de texto plano. Nunca analiza, califica ni guarda por cuenta propia.
 * SpeechRecognition puede usar el servicio de reconocimiento del navegador.
 */
export function createObservationDictation(button, status, { onInsert, getEditorContent }) {
  let recognition = null
  let phase = 'idle'
  let disposed = false
  let stopRequested = false
  let fastFailures = 0
  let receivedText = false
  // Sin límite de tiempo: solo se frena si el motor falla en bucle (sesiones que mueren al instante).
  const MAX_FAST_FAILURES = 5
  const FAST_FAILURE_MS = 1500
  let sessionStartedAt = 0
  let permission = 'unknown'
  let requesting = false
  let permissionStatus = null

  // En una PWA instalada el teléfono a veces nunca responde al permiso: sin límite el botón quedaba
  // muerto para siempre (requesting seguía en true y cada toque salía sin avisar).
  const PERMISSION_TIMEOUT_MS = 12000

  // Pide el permiso del micrófono al sistema (en una PWA instalada lo recuerda el teléfono).
  // Solo abre y cierra el stream: el reconocimiento de voz usa su propia captura.
  // Devuelve 'granted', 'denied' o 'timeout'.
  async function requestMic() {
    if (!navigator.mediaDevices?.getUserMedia) return 'granted'
    requesting = true
    let timer
    const probe = navigator.mediaDevices.getUserMedia({ audio: true }).then(
      (stream) => {
        stream.getTracks().forEach(track => track.stop())
        return 'granted'
      },
      () => 'denied',
    )
    const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve('timeout'), PERMISSION_TIMEOUT_MS) })
    try {
      const outcome = await Promise.race([probe, timeout])
      if (outcome !== 'timeout') permission = outcome
      return outcome
    } finally {
      clearTimeout(timer)
      requesting = false
    }
  }

  function watchPermission() {
    if (!navigator.permissions?.query) return
    navigator.permissions.query({ name: 'microphone' }).then((status) => {
      if (disposed) return
      permissionStatus = status
      permission = status.state
      status.onchange = () => { permission = status.state }
    }).catch(() => { /* Navegador sin Permissions API para micrófono. */ })
  }

  // Primer toque en la vista: si aún no se decidió, pedir el permiso por adelantado.
  // Un toque sobre el propio micrófono se ignora: su `click` ya pide el permiso, y adelantarse
  // aquí hacía que ese `click` encontrara la petición en curso y no hiciera nada.
  function preRequestOnFirstGesture(event) {
    if (button.contains(event.target)) return
    document.removeEventListener('pointerdown', preRequestOnFirstGesture)
    if (permission !== 'prompt' || requesting) return
    requestMic()
  }

  const LISTENING_SHORT = 'Escuchando…'
  const LISTENING = 'Escuchando… Pulsa el micrófono para terminar.'

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
      stopRequested = true
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

    if (requesting) {
      show('Esperando tu respuesta al permiso del micrófono…')
      return
    }
    stopRequested = false
    fastFailures = 0
    receivedText = false
    phase = 'starting'
    render()

    if (permission === 'granted' || !navigator.mediaDevices?.getUserMedia) {
      show('Activando micrófono…')
      startSession()
      return
    }
    show('Permite el micrófono cuando el teléfono te lo pregunte…')
    requestMic().then((outcome) => {
      if (disposed || phase !== 'starting' || recognition) return
      if (outcome === 'timeout') {
        phase = 'idle'
        render()
        show('No se recibió respuesta del permiso del micrófono. Revisa en Chrome: Ajustes del sitio → Micrófono → Permitir, y vuelve a intentarlo.')
        return
      }
      if (outcome !== 'granted') {
        phase = 'idle'
        render()
        show('Permite el acceso al micrófono en tu navegador para dictar.')
        return
      }
      show('Activando micrófono…')
      startSession()
    })
  }

  function startSession() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    let current
    const inserted = new Set()
    try {
      current = new Recognition()
      recognition = current
      current.lang = 'es-DO'
      current.continuous = true
      current.interimResults = true
      current.onstart = () => {
        if (disposed || recognition !== current || phase === 'stopping') return
        phase = 'listening'
        render()
        show(LISTENING)
      }
      current.onresult = (event) => {
        if (disposed || recognition !== current || !button.isConnected) return
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0]?.transcript?.trim()
          if (!text) continue
          if (!result.isFinal) {
            interim += (interim ? ' ' : '') + text
            continue
          }
          if (inserted.has(i)) continue
          inserted.add(i)
          const prefix = getEditorContent?.() ? ' ' : ''
          onInsert(prefix + text + ' ')
          receivedText = true
        }
        if (phase === 'listening') show(interim ? `${LISTENING_SHORT} «${interim}»` : LISTENING)
      }
      current.onerror = (event) => {
        if (recognition !== current) return
        // Silencio prolongado: el navegador cierra la sesión; onend la reinicia.
        if (event.error === 'no-speech' && !stopRequested) return
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
        // El navegador corta la escucha continua tras unos segundos de silencio:
        // seguimos escuchando hasta que el usuario pulse el micrófono.
        fastFailures = Date.now() - sessionStartedAt < FAST_FAILURE_MS ? fastFailures + 1 : 0
        if (!stopRequested && !disposed && !document.hidden && fastFailures < MAX_FAST_FAILURES) {
          startSession()
          return
        }
        phase = 'idle'
        render()
        show(receivedText ? 'Dictado añadido. Puedes corregir el texto.' : 'Dictado terminado sin texto.')
      }
      sessionStartedAt = Date.now()
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
  watchPermission()
  document.addEventListener('pointerdown', preRequestOnFirstGesture)
  window.addEventListener('pagehide', suspend)
  document.addEventListener('visibilitychange', onVisibilityChange)
  render()

  return {
    destroy() {
      if (disposed) return
      disposed = true
      release()
      button.removeEventListener('click', toggle)
      document.removeEventListener('pointerdown', preRequestOnFirstGesture)
      if (permissionStatus) permissionStatus.onchange = null
      window.removeEventListener('pagehide', suspend)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    },
  }
}
