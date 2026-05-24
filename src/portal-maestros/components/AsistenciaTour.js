/**
 * AsistenciaTour — componente aislado del tour interactivo de asistencia.
 *
 * Correcciones respecto a la implementación inline original:
 *  1. El timeout del auto-start se guarda y se cancela en destroy() — evita
 *     que startTour() se ejecute sobre elementos ya desconectados del DOM.
 *  2. destroy() llama closeTour(true) que oculta el overlay sin animación —
 *     evita que el overlay position:fixed quede bloqueando la app al navegar.
 *  3. Las coordenadas del spotlight/tooltip ya NO suman scrollY.
 *     getBoundingClientRect() devuelve coords relativas al viewport; como el
 *     overlay es position:fixed, su sistema de coordenadas ES el viewport.
 *     Sumar scrollY desplazaba el spotlight hacia abajo por cada px de scroll.
 *
 * Uso:
 *   const tour = new AsistenciaTour(container, steps?)
 *   tour.mount()        // inyecta el DOM + CSS y arranca si es primera vez
 *   tour.start()        // inicia el tour manualmente (p.ej. botón de ayuda)
 *   tour.destroy()      // limpieza total — llamar desde el cleanup del router
 */

const STORAGE_KEY = 'pm_tour_completed'
const AUTO_START_DELAY = 1500

const DEFAULT_STEPS = [
  {
    target: '.pm-asist-header',
    title: '📍 Cabecera de Clase',
    body: 'Aquí puede ver los datos de la clase, el salón y la fecha. Es su panel de control principal.'
  },
  {
    target: '.pm-asist-bulk-circles',
    title: '👥 Asistencia Rápida',
    body: '¿Asistieron todos? Presione "P" para marcar a todos los alumnos como presentes en un solo clic.'
  },
  {
    target: '#pm-alumnos-list',
    title: '🙋‍♂️ Lista de Alumnos',
    body: 'Presione el círculo de cada alumno para cambiar entre Presente, Ausente o Retraso.'
  },
  {
    target: '#pm-planificacion-card',
    title: '🗺️ Planificación Académica',
    body: 'Seleccione una Ruta o busque en la Biblioteca. Los temas que ya impartió aparecerán con un check ✅ verde.'
  },
  {
    target: '#pm-dsl-toolbar-container',
    title: '🛠️ Caja de Herramientas',
    body: 'Use el micrófono 🎤 para dictar la clase, o el botón de IA ✨ para mejorar y profesionalizar su redacción automáticamente.'
  },
  {
    target: '#pm-dsl-editor-container',
    title: '✍️ Escritura Inteligente (DSL)',
    body: 'Use [Corchetes] para vincular temas de la planificación y asteriscos * para puntos clave. La IA le ayudará a darle formato profesional.'
  },
  {
    target: '#btn-guardar',
    title: '💾 Guardar Sesión',
    body: 'Al finalizar, no olvide guardar su sesión para que el progreso de los alumnos se registre en el sistema.'
  }
]

const CSS = `
  .pm-tour-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8); z-index: 10000;
    pointer-events: auto; display: none; opacity: 0;
    transition: opacity 0.3s;
  }
  .pm-tour-spotlight {
    position: fixed; border-radius: 12px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
    z-index: 10001; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none; border: 2px solid var(--pm-primary);
  }
  .pm-tour-tooltip {
    position: fixed; width: 280px; background: var(--pm-surface);
    border: 1px solid var(--pm-border); border-radius: 16px;
    padding: 1.5rem; z-index: 10002; color: #fff;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    transition: top 0.4s, left 0.4s; pointer-events: auto;
  }
  .pm-tour-tooltip h4 {
    margin: 0 0 0.5rem; color: var(--pm-primary);
    font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .pm-tour-tooltip p { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--pm-text-muted); }
  .pm-tour-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
  .pm-tour-progress { font-size: 0.75rem; color: var(--pm-text-muted); }
  .pm-tour-btn-skip { background: none; border: none; color: var(--pm-text-muted); font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0; }
  .pm-tour-btn-next {
    background: var(--pm-primary); color: #fff; border: none;
    padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; cursor: pointer;
    font-size: 0.85rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  .pm-help-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(var(--pm-primary-rgb), 0.15); color: var(--pm-primary);
    border: 1px solid rgba(var(--pm-primary-rgb), 0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; font-size: 1rem;
  }
  .pm-help-btn:hover { background: var(--pm-primary); color: #fff; transform: scale(1.1); }
  [data-theme="light"] .pm-tour-tooltip { background: #fff; color: #111; }
  @media (max-width: 480px) {
    .pm-tour-tooltip { width: calc(100% - 40px); left: 20px !important; font-size: 0.85rem; }
  }
`

export class AsistenciaTour {
  /**
   * @param {HTMLElement} container  — el contenedor de la vista asistencia
   * @param {Array}       steps      — pasos del tour (opcional, usa DEFAULT_STEPS)
   */
  constructor(container, steps = DEFAULT_STEPS) {
    this._container  = container
    this._steps      = steps
    this._step       = 0
    this._autoTimer  = null
    this._overlay    = null
    this._spotlight  = null
    this._tooltip    = null
    this._mounted    = false
    this._styleEl    = null
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Inyecta el DOM y el CSS; arranca automáticamente si es la primera vez. */
  mount() {
    if (this._mounted) return
    this._injectStyles()
    this._injectDOM()
    this._bindEvents()
    this._mounted = true

    if (!localStorage.getItem(STORAGE_KEY)) {
      this._autoTimer = setTimeout(() => this.start(), AUTO_START_DELAY)
    }
  }

  /** Inicia el tour desde el paso 0. Seguro llamar en cualquier momento. */
  start() {
    if (!this._overlay) return
    this._step = 0
    this._overlay.style.display = 'block'
    // Forzar reflow antes de transición
    // eslint-disable-next-line no-unused-expressions
    this._overlay.offsetHeight
    this._overlay.style.opacity = '1'
    this._showStep(0)
    // Marcar como visto en cuanto arranca — así aunque el usuario cierre
    // el browser o navegue antes de finalizar, no vuelve a aparecer solo.
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  /**
   * Limpieza total. Llamar desde el cleanup del router.
   * Cancela el timeout pendiente, cierra el overlay al instante y elimina
   * el DOM y CSS inyectados.
   */
  destroy() {
    // 1. Cancelar auto-start si aún no disparó
    if (this._autoTimer !== null) {
      clearTimeout(this._autoTimer)
      this._autoTimer = null
    }

    // 2. Ocultar overlay inmediatamente (sin animación) para no bloquear la app
    if (this._overlay) {
      this._overlay.style.transition = 'none'
      this._overlay.style.opacity    = '0'
      this._overlay.style.display    = 'none'
      this._overlay.remove()
      this._overlay = null
    }

    // 3. Spotlight y tooltip son hijos del body — removerlos también
    if (this._spotlight) { this._spotlight.remove(); this._spotlight = null }
    if (this._tooltip)   { this._tooltip.remove();   this._tooltip   = null }

    // 4. Remover estilos inyectados
    if (this._styleEl) { this._styleEl.remove(); this._styleEl = null }

    this._mounted = false
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _injectStyles() {
    // Evitar duplicados si el componente se monta dos veces (HMR, etc.)
    if (document.getElementById('pm-tour-styles')) return
    const style = document.createElement('style')
    style.id = 'pm-tour-styles'
    style.textContent = CSS
    document.head.appendChild(style)
    this._styleEl = style
  }

  _injectDOM() {
    // El overlay es un div simple que cubre el viewport.
    // Spotlight y tooltip se agregan al body directamente para evitar
    // el problema de stacking context dentro del container de la vista.
    const overlay = document.createElement('div')
    overlay.id        = 'pm-tour-overlay'
    overlay.className = 'pm-tour-overlay'
    // Accessibility
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute('aria-label', 'Guía interactiva')
    document.body.appendChild(overlay)
    this._overlay = overlay

    const spotlight = document.createElement('div')
    spotlight.id        = 'pm-tour-spotlight'
    spotlight.className = 'pm-tour-spotlight'
    document.body.appendChild(spotlight)
    this._spotlight = spotlight

    const tooltip = document.createElement('div')
    tooltip.id        = 'pm-tour-tooltip'
    tooltip.className = 'pm-tour-tooltip'
    tooltip.innerHTML = `
      <h4 id="pm-tour-title"></h4>
      <p  id="pm-tour-body"></p>
      <div class="pm-tour-footer">
        <span class="pm-tour-progress" id="pm-tour-progress"></span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button id="pm-tour-skip" class="pm-tour-btn-skip">Saltar guía</button>
          <button id="pm-tour-next" class="pm-tour-btn-next">Siguiente</button>
        </div>
      </div>
    `
    document.body.appendChild(tooltip)
    this._tooltip = tooltip
  }

  _bindEvents() {
    this._tooltip.querySelector('#pm-tour-next').addEventListener('click', () => this._nextStep())
    this._tooltip.querySelector('#pm-tour-skip').addEventListener('click', () => this._close())

    // Cerrar con Escape
    this._onKeydown = (e) => { if (e.key === 'Escape') this._close() }
    document.addEventListener('keydown', this._onKeydown)

    // Re-posicionar en resize
    this._onResize = () => { if (this._overlay?.style.display !== 'none') this._showStep(this._step) }
    window.addEventListener('resize', this._onResize, { passive: true })
  }

  _showStep(index) {
    const step     = this._steps[index]
    const targetEl = this._container.querySelector(step.target)

    // Si el elemento no existe en este paso, saltar al siguiente
    if (!targetEl) { this._nextStep(); return }

    // Scroll suave al elemento
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Esperar a que el scroll termine antes de calcular posición
    setTimeout(() => this._positionOnElement(targetEl, step, index), 400)
  }

  _positionOnElement(targetEl, step, index) {
    // BUG FIX #3: usar solo getBoundingClientRect() — ya son coords del viewport.
    // El overlay, spotlight y tooltip son position:fixed → viven en el mismo
    // sistema de coordenadas. NO sumar scrollY.
    const rect = targetEl.getBoundingClientRect()
    const PAD  = 10

    // Spotlight
    this._spotlight.style.width  = `${rect.width  + PAD * 2}px`
    this._spotlight.style.height = `${rect.height + PAD * 2}px`
    this._spotlight.style.top    = `${rect.top    - PAD}px`
    this._spotlight.style.left   = `${rect.left   - PAD}px`

    // Tooltip: intentar abajo del elemento; si no cabe, arriba
    const TIP_H  = 200
    const TIP_W  = 280
    const margin = 16

    let tipTop  = rect.bottom + margin
    if (tipTop + TIP_H > window.innerHeight) {
      tipTop = rect.top - TIP_H - margin
    }
    // Clamp horizontal para que no salga de pantalla
    const tipLeft = Math.max(margin, Math.min(window.innerWidth - TIP_W - margin, rect.left))

    this._tooltip.style.top  = `${tipTop}px`
    this._tooltip.style.left = `${tipLeft}px`

    // Contenido
    this._tooltip.querySelector('#pm-tour-title').innerHTML    = `<span>${step.title}</span>`
    this._tooltip.querySelector('#pm-tour-body').textContent   = step.body
    this._tooltip.querySelector('#pm-tour-progress').textContent = `${index + 1} / ${this._steps.length}`
    this._tooltip.querySelector('#pm-tour-next').textContent   =
      index === this._steps.length - 1 ? 'Finalizar ✓' : 'Siguiente →'
  }

  _nextStep() {
    this._step++
    if (this._step < this._steps.length) {
      this._showStep(this._step)
    } else {
      this._close()
    }
  }

  _close() {
    if (!this._overlay) return

    // Marcar como completado antes de cualquier animación
    localStorage.setItem(STORAGE_KEY, 'true')

    // Remover listeners
    if (this._onKeydown) document.removeEventListener('keydown', this._onKeydown)
    if (this._onResize)  window.removeEventListener('resize',   this._onResize)

    // Ocultar tooltip y spotlight inmediatamente — son position:fixed en body
    // y tienen pointer-events:auto, así que deben desaparecer al instante
    if (this._tooltip)   { this._tooltip.style.display   = 'none' }
    if (this._spotlight) { this._spotlight.style.display = 'none' }

    // Fade-out del overlay y luego ocultarlo
    this._overlay.style.opacity = '0'
    setTimeout(() => {
      if (this._overlay) this._overlay.style.display = 'none'
    }, 300)
  }
}
