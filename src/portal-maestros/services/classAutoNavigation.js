/** Preferencia local por maestro; disponible sin red y en modo Demo. */
const preferenceKey = (maestroId) => `portal-maestros:auto-open-class:${maestroId}`
const attempted = new Set()
let cancelPending = () => {}

export function getClassAutoNavigation(maestroId) {
  if (!maestroId) return false
  try {
    return localStorage.getItem(preferenceKey(maestroId)) === 'true'
  } catch {
    return false
  }
}

export function setClassAutoNavigation(maestroId, enabled) {
  if (!maestroId) throw new Error('No hay maestro activo')
  localStorage.setItem(preferenceKey(maestroId), String(enabled === true))
  if (!enabled) cancelPending()
}

/**
 * Crear antes de cargar Hoy para invalidar también las respuestas tardías.
 * El router anuncia cada navegación antes de ejecutar el siguiente handler.
 */
export function createClassAutoNavigation({ maestroId, container, isCurrent, navigate }) {
  cancelPending()
  let cancelled = false
  let delay, interval, banner

  function cancel() {
    cancelled = true
    clearTimeout(delay)
    clearInterval(interval)
    banner?.remove()
    window.removeEventListener('portal:before-navigate', cancel)
    container.removeEventListener('click', cancel, true)
    if (cancelPending === cancel) cancelPending = () => {}
  }

  function canNavigate() {
    return !cancelled && getClassAutoNavigation(maestroId) && isCurrent()
  }

  function schedule(claseId, fecha) {
    if (!claseId || attempted.has(maestroId) || !canNavigate()) {
      cancel()
      return
    }
    attempted.add(maestroId)
    delay = setTimeout(() => {
      if (!canNavigate()) return cancel()
      banner = document.createElement('div')
      banner.id = 'pm-hoy-autonav-banner'
      banner.setAttribute('role', 'status')
      banner.innerHTML = `
        <div class="pm-autonav-content">
          <i class="bi bi-play-circle-fill pm-autonav-icon" aria-hidden="true"></i>
          <span class="pm-autonav-msg">Abriendo clase en curso…</span>
          <span class="pm-autonav-count" id="pm-autonav-count" aria-hidden="true">3</span>
          <button type="button" class="pm-autonav-cancel" id="pm-autonav-cancel">Cancelar</button>
        </div>`
      document.body.appendChild(banner)
      banner.querySelector('button').addEventListener('click', cancel)
      let seconds = 3
      interval = setInterval(() => {
        if (!canNavigate()) return cancel()
        banner.querySelector('.pm-autonav-count').textContent = String(--seconds)
        if (seconds === 0) {
          cancel()
          navigate(claseId, fecha)
        }
      }, 1000)
    }, 800)
  }

  cancelPending = cancel
  window.addEventListener('portal:before-navigate', cancel)
  container.addEventListener('click', cancel, true)
  return { schedule, cancel }
}
