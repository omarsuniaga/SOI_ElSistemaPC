// src/shared/utils/asyncMutex.js

/**
 * Creates a simple async mutex for serializing async operations.
 * Prevents concurrent execution of critical sections.
 *
 * @returns {Object} Mutex with run(asyncFn) method
 *
 * @example
 * const mutex = createAsyncMutex()
 *
 * // Concurrent calls to run() will execute serially
 * Promise.all([
 *   mutex.run(save1),
 *   mutex.run(save2)  // Waits for save1 to complete
 * ])
 */
export function createAsyncMutex() {
  let lockPromise = Promise.resolve()

  return {
    /**
     * Acquire lock, run function, then release lock
     * @param {Function} asyncFn - Async function to execute
     * @returns {Promise} Resolves with the result of asyncFn, or rejects with any error it throws
     */
    run(asyncFn) {
      if (typeof asyncFn !== 'function') {
        throw new TypeError('asyncMutex.run expects a function')
      }

      // Chain onto current lock synchronously — this ensures ordering even
      // when multiple callers invoke run() before any awaits settle.
      const result = lockPromise.then(() => asyncFn())

      // Advance the lock chain, swallowing errors so the chain never breaks
      lockPromise = result.then(
        () => {},
        () => {}
      )

      return result
    }
  }
}
