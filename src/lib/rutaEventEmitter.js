/**
 * Simple event emitter for Clase ↔ Ruta communication
 * Allows clase view to notify ruta view when observations are saved
 */

const listeners = new Map()

export const rutaEvents = {
  /**
   * Subscribe to an event
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, [])
    }
    listeners.get(eventName).push(callback)
  },

  /**
   * Unsubscribe from an event
   * @param {string} eventName
   * @param {Function} callback
   */
  off(eventName, callback) {
    if (!listeners.has(eventName)) return
    const callbacks = listeners.get(eventName)
    const idx = callbacks.indexOf(callback)
    if (idx > -1) callbacks.splice(idx, 1)
  },

  /**
   * Emit an event
   * @param {string} eventName
   * @param {*} data
   */
  emit(eventName, data) {
    if (!listeners.has(eventName)) return
    const callbacks = listeners.get(eventName)
    callbacks.forEach(cb => {
      try {
        cb(data)
      } catch (err) {
        console.error(`[rutaEventEmitter] Error in listener for ${eventName}:`, err)
      }
    })
  },

  /**
   * Clear all listeners (mainly for testing)
   */
  clearAllListeners() {
    listeners.clear()
  },
}
