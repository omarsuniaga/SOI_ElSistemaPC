import { getClassAutoNavigation, setClassAutoNavigation } from '../services/classAutoNavigation.js'

export function renderNavigationSettings(container, maestroId) {
  const section = document.createElement('section')
  section.className = 'card-apple pm-settings-section'
  section.setAttribute('aria-labelledby', 'navigation-title')
  section.innerHTML = `
    <div class="pm-settings-section__header">
      <i class="bi bi-signpost pm-icon-blue" aria-hidden="true"></i>
      <div>
        <h3 id="navigation-title" class="pm-settings-section__title">Navegación</h3>
        <label for="pm-auto-open-class" class="pm-settings-section__desc">Abrir automáticamente la clase en curso</label>
      </div>
      <label class="pm-apple-switch">
        <input id="pm-auto-open-class" type="checkbox" role="switch"
          aria-describedby="pm-auto-open-class-help" ${getClassAutoNavigation(maestroId) ? 'checked' : ''}>
        <span class="pm-apple-switch-slider" aria-hidden="true"></span>
      </label>
    </div>
    <p id="pm-auto-open-class-help" class="apple-caption">Al entrar en Hoy, abre la clase en curso sin registrar después de un aviso. Tu selección manual siempre tiene prioridad. Se recuerda en este dispositivo.</p>
    <p class="apple-caption" role="status" id="pm-auto-open-class-status"></p>`
  container.appendChild(section)
  const toggle = section.querySelector('input')
  toggle.addEventListener('change', () => {
    const status = section.querySelector('[role="status"]')
    try {
      setClassAutoNavigation(maestroId, toggle.checked)
      status.textContent = toggle.checked ? 'Apertura automática activada.' : 'Apertura automática desactivada.'
    } catch {
      toggle.checked = getClassAutoNavigation(maestroId)
      status.textContent = 'No se pudo guardar la preferencia. Intenta nuevamente.'
    }
  })
}
