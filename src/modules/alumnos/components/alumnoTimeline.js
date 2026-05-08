import { loadJsonMock } from '../../../core/utils/loadJsonMock.js'

const MOCK_DATA_PATH = '/assets/data/mocks/alumnos.json'

export class AlumnoTimeline {
  constructor(container) {
    this.container = container
    this.alumnoId = null
    this.eventos = []
    this.diasAMostrar = 30
  }

  async load(alumnoId) {
    this.alumnoId = alumnoId
    const data = await loadJsonMock(MOCK_DATA_PATH)
    const alumno = data.alumnos?.find(a => a.id === alumnoId)
    if (!alumno) {
      this.renderEmpty()
      return
    }
    this.eventos = this.parsearEventos(alumno)
    this.render()
  }

  parsearEventos(alumno) {
    const eventos = []
    const now = new Date()
    for (let i = 0; i < this.diasAMostrar; i++) {
      const fecha = new Date(now)
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      if (Math.random() > 0.6) {
        eventos.push({
          id: `evt-${i}`,
          fecha: fechaStr,
          tipo: this.getTipoAleatorio(),
          descripcion: this.getDescripcionAleatoria(),
          icon: this.getIconoAleatorio()
        })
      }
    }
    return eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }

  getTipoAleatorio() {
    const tipos = ['asistencia', 'clase', 'observacion', 'progreso', 'meta']
    return tipos[Math.floor(Math.random() * tipos.length)]
  }

  getDescripcionAleatoria() {
    const descs = [
      'Asistió a clase',
      'Completó练习',
      'Recibió observación positiva',
      'Advancó en su progreso',
      'Completó objetivo de gamificación'
    ]
    return descs[Math.floor(Math.random() * descs.length)]
  }

  getIconoAleatorio() {
    const icons = ['bi-calendar-check', 'bi-music-note', 'bi-chat-dots', 'bi-graph-up', 'bi-trophy']
    return icons[Math.floor(Math.random() * icons.length)]
  }

  render() {
    this.container.innerHTML = `
      <div class="alumno-timeline">
        <div class="timeline-header mb-3">
          <h6 class="fw-bold text-muted">Últimos ${this.diasAMostrar} días</h6>
        </div>
        <div class="timeline-list">
          ${this.eventos.length === 0
            ? '<p class="text-muted small">Sin eventos registrados</p>'
            : this.eventos.map(e => `
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
        ${this.eventos.length > 0 ? '<button class="btn btn-link btn-sm" id="timeline-load-more">Cargar más...</button>' : ''}
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
        <p class="text-muted small">Selecciona un alumno para ver su timeline</p>
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