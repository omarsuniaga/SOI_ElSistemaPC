import { loadJsonMock } from '../../../core/utils/loadJsonMock.js'

const MOCK_DATA_PATH = '/assets/data/mocks/alumnos.json'

export class AlumnoTimeline {
  constructor(container) {
    this.container = container
    this.alumnoId = null
    this.eventos = []
    this.diasAMostrar = 30
  }

  async load(alumnoId, { isDemoMode = false } = {}) {
    this.alumnoId = alumnoId

    if (isDemoMode) {
      // Only load mock data in demo mode — never in production
      const data = await loadJsonMock(MOCK_DATA_PATH)
      const alumno = data.alumnos?.find(a => a.id === alumnoId)
      if (!alumno) {
        this.renderEmpty()
        return
      }
      // In demo mode use static sample events (no Math.random)
      this.eventos = this.parsearEventosDemo(alumno)
    } else {
      // Production mode: no mock data, no random events
      const alumno = { id: alumnoId }
      const found = await loadJsonMock(MOCK_DATA_PATH).then(d => d.alumnos?.find(a => a.id === alumnoId)).catch(() => null)
      if (!found) {
        this.renderEmpty()
        return
      }
      this.eventos = []
    }

    this.render(this.eventos)
  }

  /**
   * Parse demo events from alumno data — deterministic, no Math.random
   */
  parsearEventosDemo(alumno) {
    // Return static demo events based on alumno id — no random generation
    const eventos = [
      {
        id: `${alumno.id}-demo-1`,
        fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        tipo: 'asistencia',
        descripcion: 'Asistió a clase',
        icon: 'bi-calendar-check',
      },
      {
        id: `${alumno.id}-demo-2`,
        fecha: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        tipo: 'progreso',
        descripcion: 'Avanzó en su progreso',
        icon: 'bi-graph-up',
      },
    ]
    return eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }

  /**
   * Render the timeline with the given eventos array.
   * Accepts eventos as a parameter so it can be called directly in tests
   * and by callers that already have the events list.
   */
  render(eventos = this.eventos) {
    this.container.innerHTML = `
      <div class="alumno-timeline">
        <div class="timeline-header mb-3">
          <h6 class="fw-bold text-muted">Últimos ${this.diasAMostrar} días</h6>
        </div>
        <div class="timeline-list">
          ${eventos.length === 0
            ? '<p class="text-muted small">Sin actividad registrada</p>'
            : eventos.map(e => `
              <div class="timeline-item d-flex align-items-start mb-3">
                <div class="timeline-icon me-3">
                  <i class="bi ${e.icon}"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-medium">${e.descripcion}</div>
                  <small class="text-muted">${this.formatFecha(e.fecha)}</small>
                </div>
              </div>
            `).join('')
          }
        </div>
        ${eventos.length > 0 ? '<button class="btn btn-link btn-sm" id="timeline-load-more">Cargar más...</button>' : ''}
      </div>
    `

    const loadMoreBtn = document.getElementById('timeline-load-more')
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.cargarMas())
    }
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="alumno-timeline">
        <p class="text-muted small">Sin actividad registrada</p>
      </div>
    `
  }

  formatFecha(fechaStr) {
    const fecha = new Date(fechaStr)
    const hoy = new Date()
    const diff = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return fecha.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
  }

  async cargarMas() {
    this.diasAMostrar += 30
    await this.load(this.alumnoId)
  }
}

export function createAlumnoTimeline(container) {
  return new AlumnoTimeline(container)
}

export function renderAlumnoTimeline(container, alumnoId) {
  const timeline = createAlumnoTimeline(container)
  timeline.load(alumnoId)
}
