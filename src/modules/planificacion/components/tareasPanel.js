import { config } from '../../../core/config/config.js'

let tareasCache = []

async function loadTareasDemo() {
  try {
    const response = await fetch('/src/assets/data/mocks/maestro_tareas.json')
    const data = await response.json()
    return data.tareas || []
  } catch (error) {
    console.error('Error loading tareas mock:', error)
    return []
  }
}

async function getTareas() {
  if (config.isDemoMode) {
    return loadTareasDemo()
  }

  const stored = localStorage.getItem(config.tareas.localStorageKey)
  return stored ? JSON.parse(stored) : []
}

async function saveTareas(tareas) {
  localStorage.setItem(config.tareas.localStorageKey, JSON.stringify(tareas))
  tareasCache = tareas
}

function filterByAlumno(tareas, nombreAlumno) {
  return tareas.filter(t => t.alumno_nombre.toLowerCase() === nombreAlumno.toLowerCase())
}

function getPendientesCount(tareas) {
  return tareas.filter(t => t.estado === 'pendiente').length
}

function getVencidasCount(tareas) {
  const now = new Date()
  return tareas.filter(t => {
    if (t.estado !== 'pendiente') return false
    if (!t.fecha_entrega) return false
    return new Date(t.fecha_entrega) < now
  }).length
}

export function renderTareasBadge(tareas) {
  const pendientes = getPendientesCount(tareas)
  const vencidas = getVencidasCount(tareas)

  if (pendientes === 0 && vencidas === 0) {
    return `<span class="badge bg-success">✓</span>`
  }

  if (vencidas > 0) {
    return `<span class="badge bg-danger" title="${vencidas} vencida(s)">${pendientes}</span>`
  }

  return `<span class="badge bg-warning text-dark">${pendientes}</span>`
}

export async function renderTareasPanel(container, opciones = {}) {
  const { onTareaClick, onTareaToggle } = opciones
  const tareas = await getTareas()

  const grouped = {}
  for (const tarea of tareas) {
    const nombre = tarea.alumno_nombre
    if (!grouped[nombre]) {
      grouped[nombre] = []
    }
    grouped[nombre].push(tarea)
  }

  const now = new Date()

  const html = `
    <div class="tareas-panel" id="tareasPanel">
      <div class="accordion" id="tareasAccordion">
        ${Object.entries(grouped).map(([nombre, tareasAlumno], idx) => {
          const pendientes = tareasAlumno.filter(t => t.estado === 'pendiente').length
          const vencidas = tareasAlumno.filter(t => {
            if (t.estado !== 'pendiente') return false
            if (!t.fecha_entrega) return false
            return new Date(t.fecha_entrega) < now
          }).length

          const headerClass = vencidas > 0 ? 'border-danger' : pendientes > 0 ? 'border-warning' : 'border-success'

          return `
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button ${pendientes === 0 ? '' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${idx}">
                  <span class="me-auto fw-semibold">#${nombre}</span>
                  ${vencidas > 0 ? `<span class="badge bg-danger me-2">${vencidas}☠</span>` : ''}
                  ${pendientes > 0 ? `<span class="badge bg-warning text-dark">${pendientes}</span>` : ''}
                </button>
              </h2>
              <div id="collapse-${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" data-bs-parent="#tareasAccordion">
                <div class="accordion-body p-0">
                  <ul class="list-group list-group-flush">
                    ${tareasAlumno.map(tarea => {
                      const isVencida = tarea.estado === 'pendiente' && tarea.fecha_entrega && new Date(tarea.fecha_entrega) < now
                      const isCompleted = tarea.estado === 'completada'
                      
                      return `
                        <li class="list-group-item d-flex align-items-center gap-2 py-2 ${isCompleted ? 'opacity-50' : ''} ${isVencida ? 'list-group-item-danger' : ''}">
                          <input 
                            class="form-check-input tareas-checkbox" 
                            type="checkbox" 
                            data-id="${tarea.id}"
                            ${isCompleted ? 'checked' : ''}
                          >
                          <div class="flex-grow-1 ${isCompleted ? 'text-decoration-line-through text-muted' : ''} ${isVencida ? 'text-danger' : ''}">
                            <small>${escapeHTML(tarea.descripcion)}</small>
                            ${tarea.fecha_entrega ? `
                              <br><small class="${isVencida ? 'text-danger fw-bold' : 'text-muted'}">
                                📅 ${formatDateSimple(tarea.fecha_entrega)}
                              </small>
                            ` : ''}
                          </div>
                          ${tarea.prioridad === 'alta' ? '<span class="badge bg-danger">!</span>' : ''}
                        </li>
                      `
                    }).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
      
      ${Object.keys(grouped).length === 0 ? `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-check-circle" style="font-size: 2rem;"></i>
          <p class="mt-2 mb-0">Sin tareas pendientes</p>
        </div>
      ` : ''}
    </div>
  `

  container.innerHTML = html

  container.querySelectorAll('.tareas-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const tareaId = e.target.dataset.id
      const tarea = tareas.find(t => t.id === tareaId)
      if (tarea) {
        tarea.estado = e.target.checked ? 'completada' : 'pendiente'
        await saveTareas(tareas)
        if (onTareaToggle) onTareaToggle(tarea)
      }
    })
  })
}

function formatDateSimple(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
}

function escapeHTML(text) {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}