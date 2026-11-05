const eventName = 'soi:student-roster-changed'
const storageKey = 'soi:student-roster-revision'

/** Notify this tab and other open SOI tabs after a successful roster mutation. */
export function publishStudentRosterChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(eventName))
  try { window.localStorage.setItem(storageKey, `${Date.now()}-${Math.random()}`) } catch { /* Storage may be unavailable. */ }
}

export function subscribeStudentRosterChanges(listener) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = event => { if (event.key === storageKey) listener() }
  window.addEventListener(eventName, listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(eventName, listener)
    window.removeEventListener('storage', onStorage)
  }
}
