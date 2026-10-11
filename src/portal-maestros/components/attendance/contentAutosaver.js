/**
 * Autoguardado del contenido escrito durante la clase.
 *
 * Regla central: un texto solo cuenta como «guardado» cuando la escritura se
 * confirmó. Mientras tanto vive como `dirty`/`saving`; si quedó en la cola
 * offline es `pending`; si el guardado lanzó, es `failed` y el siguiente flush
 * lo reintenta. Así salir del editor (o de la vista) siempre persiste lo que
 * falte, y nunca se muestra un «Guardado» que no es cierto.
 */

import { shouldQueueDraftSave } from './draftPolicy.js'

export const CONTENT_STATUS = Object.freeze({
  SAVED: 'saved',
  DIRTY: 'dirty',
  SAVING: 'saving',
  PENDING: 'pending',
  FAILED: 'failed',
})

const LABELS = {
  saved: 'Guardado',
  pending: 'Pendiente de sincronizar',
  failed: 'No se pudo guardar',
  dirty: 'Guardando…',
  saving: 'Guardando…',
}

/** @param {string} status */
export function contentStatusLabel(status) {
  return LABELS[status] || LABELS.saved
}

/**
 * Payload del autosave. En modo solo-contenido (sesión ya registrada) se
 * omiten `borrador`, `estado` y `asistencia`: el autosave normal escribe
 * `borrador: true` y devolvería la sesión a borrador sin que el maestro lo pida.
 *
 * @param {{ contentOnly: boolean, payload: object }} params
 */
export function selectAutosavePayload({ contentOnly, payload }) {
  if (!contentOnly) return payload
  const { maestro_id, fecha, contenido } = payload
  return { maestro_id, fecha, contenido }
}

/**
 * @param {Object} options
 * @param {string} [options.initialContent] - Contenido que tiene el servidor al abrir.
 * @param {string|null} [options.pendingContent] - Texto más reciente que quedó en la cola
 *   local (escrito sin red). El editor lo muestra; el estado arranca en `pending`.
 * @param {() => boolean} [options.hasSesion] - Si ya existe la fila de `sesiones_clase`.
 * @param {(arg: { content: string }) => Promise<'saved'|'queued'>} options.save
 *   Persiste y devuelve `'saved'` (confirmado en el servidor) o `'queued'`
 *   (quedó en la cola offline). Debe lanzar si no pudo hacer ninguna de las dos.
 * @param {(status: string) => void} [options.onStatus]
 * @param {number} [options.delayMs] - Debounce del autosave por tecleo.
 */
export function createContentAutosaver({
  initialContent = '',
  pendingContent = null,
  hasSesion = () => false,
  save,
  onStatus = () => {},
  delayMs = 2000,
} = {}) {
  let current = pendingContent ?? initialContent
  let persisted = initialContent
  let queued = pendingContent
  let failedFlag = false
  let inflight = null
  let timer = null
  let lastStatus = null

  const needsSave = () =>
    current !== queued &&
    shouldQueueDraftSave({ value: current, lastPersisted: persisted, hasSesion: hasSesion() })

  function computeStatus() {
    if (current === persisted) return CONTENT_STATUS.SAVED
    if (current === queued) return CONTENT_STATUS.PENDING
    if (inflight) return CONTENT_STATUS.SAVING
    if (failedFlag) return CONTENT_STATUS.FAILED
    // Un cambio que no amerita guardado (p. ej. editor vacío sin sesión) no es deuda.
    return needsSave() ? CONTENT_STATUS.DIRTY : CONTENT_STATUS.SAVED
  }

  function emit() {
    const status = computeStatus()
    if (status !== lastStatus) {
      lastStatus = status
      onStatus(status)
    }
  }

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  async function run() {
    const content = current
    failedFlag = false
    inflight = true
    emit()
    try {
      const outcome = await save({ content })
      inflight = null
      record(content, outcome)
    } catch (err) {
      inflight = null
      failedFlag = true
      console.warn('[contentAutosaver] No se pudo guardar el contenido:', err?.message || err)
      emit()
    }
  }

  /** Registra el resultado de una escritura (propia o de otro autosave). */
  function record(content, outcome) {
    if (outcome === 'saved') {
      persisted = content
      queued = null
    } else if (outcome === 'queued') {
      queued = content
    }
    failedFlag = false
    emit()
  }

  /** Registra que una escritura ajena falló (no pudo guardar ni encolar). */
  function recordFailure() {
    failedFlag = true
    emit()
  }

  /** Persiste lo pendiente ya, sin esperar el debounce. Seguro de llamar al salir. */
  async function flush() {
    clearTimer()
    if (inflight) await inflight
    if (!needsSave()) {
      emit()
      return
    }
    inflight = run()
    try {
      await inflight
    } finally {
      inflight = null
    }
  }

  /** Cambio emitido por el editor. */
  function change(value) {
    current = value
    failedFlag = false
    clearTimer()
    emit()
    if (!needsSave()) return
    timer = setTimeout(() => {
      timer = null
      flush().catch((err) => console.warn('[contentAutosaver] flush falló:', err))
    }, delayMs)
  }

  /** La cola local ya no tiene este contenido: el servidor lo tiene. */
  function markSynced() {
    if (queued !== null) {
      persisted = queued
      queued = null
    }
    failedFlag = false
    emit()
  }

  return {
    change,
    flush,
    record,
    recordFailure,
    markSynced,
    needsSave,
    getStatus: computeStatus,
    destroy: clearTimer,
  }
}
