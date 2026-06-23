import { obtenerEventos, crearEvento, eliminarEvento, obtenerTareas } from '../api/hermesApi.js'

export async function renderCalendarioView(container) {
  const _ac = new AbortController()

  // Base state
  let currentDate = new Date()
  let events = []
  let filteredCategory = 'todos'

  // Categories helper
  const CATEGORIES = {
    concierto: { label: 'Concierto', color: '#ff2d55', bg: 'rgba(255, 45, 85, 0.1)', border: '#ff2d55' },
    ensayo: { label: 'Ensayo', color: '#5856d6', bg: 'rgba(88, 86, 214, 0.1)', border: '#5856d6' },
    reunion: { label: 'Reunión', color: '#ff9500', bg: 'rgba(255, 149, 0, 0.1)', border: '#ff9500' },
    patrocinio: { label: 'Patrocinio', color: '#34c759', bg: 'rgba(52, 199, 89, 0.1)', border: '#34c759' },
    pago: { label: 'Pago', color: '#007aff', bg: 'rgba(0, 122, 255, 0.1)', border: '#007aff' },
    corte: { label: 'Corte', color: '#af52de', bg: 'rgba(175, 82, 222, 0.1)', border: '#af52de' },
    inscripcion: { label: 'Inscripción', color: '#5ac8fa', bg: 'rgba(90, 200, 250, 0.1)', border: '#5ac8fa' },
    auditoria: { label: 'Auditoría', color: '#ffcc00', bg: 'rgba(255, 204, 0, 0.1)', border: '#ffcc00' },
    otro: { label: 'Otro', color: '#8e8e93', bg: 'rgba(142, 142, 147, 0.1)', border: '#8e8e93' }
  }

  const renderFrame = () => {
    container.innerHTML = `
      <div class="container-fluid p-4" style="animation: fadeIn 0.4s ease;">
        <!-- Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 class="fw-bold mb-1" style="color: var(--apple-ink); letter-spacing: -0.5px;">
              🧠 Calendario Maestro <span style="font-size: 14px; font-weight: normal; color: var(--apple-ink-muted-80);">SSoT Temporal por Hermes</span>
            </h3>
            <p class="text-muted small mb-0">Cerebro General: Planifica tus eventos y Hermes delegará las tareas estratégicas.</p>
          </div>
          <div class="d-flex gap-2">
            <button id="btn-add-event" class="btn btn-primary d-flex align-items-center gap-2" style="border-radius: 12px; font-weight: 500;">
              <i class="bi bi-calendar-plus-fill"></i> Programar Evento
            </button>
            <button id="btn-view-tasks" class="btn btn-outline-secondary d-flex align-items-center gap-2" style="border-radius: 12px; font-weight: 500;">
              <i class="bi bi-kanban"></i> Ver Tareas
            </button>
          </div>
        </div>

        <!-- Alerts / Summary Row -->
        <div class="row g-3 mb-4">
          <div class="col-md-9">
            <!-- Filter chips -->
            <div class="d-flex flex-wrap gap-2 align-items-center" id="category-filters">
              <span class="text-muted small me-2">Filtrar por:</span>
              <button class="filter-chip active" data-cat="todos">Todos</button>
              ${Object.entries(CATEGORIES).map(([key, cat]) => `
                <button class="filter-chip" data-cat="${key}" style="--chip-color: ${cat.color}; --chip-bg: ${cat.bg}; --chip-border: ${cat.border}">
                  ${cat.label}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="col-md-3 text-md-end">
            <div class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-body-tertiary border text-muted small">
              <span class="spinner-grow spinner-grow-sm text-success" role="status"></span>
              <span>Hermes Activo (Auto-Delegación)</span>
            </div>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="row g-4">
          <!-- Calendar Body -->
          <div class="col-lg-9">
            <div class="card shadow-sm border-0 p-4" style="border-radius: 16px; background: var(--apple-canvas);">
              <!-- Month selection header -->
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="fw-bold mb-0" id="month-title" style="color: var(--apple-ink);"></h4>
                <div class="btn-group rounded-3 overflow-hidden" style="border: 1px solid var(--apple-hairline);">
                  <button id="btn-prev-month" class="btn btn-light"><i class="bi bi-chevron-left"></i></button>
                  <button id="btn-today" class="btn btn-light small">Hoy</button>
                  <button id="btn-next-month" class="btn btn-light"><i class="bi bi-chevron-right"></i></button>
                </div>
              </div>

              <!-- Weekday Headers -->
              <div class="grid-calendar-header mb-2 text-center text-muted fw-semibold small">
                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mie</div><div>Jue</div><div>Vie</div><div>Sab</div>
              </div>

              <!-- Days Grid -->
              <div class="grid-calendar-days" id="calendar-grid"></div>
            </div>
          </div>

          <!-- Sidemenu / Upcoming Events -->
          <div class="col-lg-3">
            <div class="card shadow-sm border-0 p-4 h-100" style="border-radius: 16px; background: var(--apple-canvas);">
              <h5 class="fw-bold mb-3 d-flex justify-content-between align-items-center" style="color: var(--apple-ink);">
                <span>Próximos Eventos</span>
                <i class="bi bi-clock-history text-muted"></i>
              </h5>
              <div class="d-flex flex-column gap-3" id="upcoming-events-list">
                <p class="text-muted small">Cargando...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Event Custom Modal Overlay -->
      <div class="hermes-modal-overlay d-none" id="add-event-modal">
        <div class="hermes-modal-container card shadow-lg border-0 p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">🎯 Programar Actividad</h5>
            <button class="btn-close" id="btn-close-add-modal"></button>
          </div>
          <form id="add-event-form">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Título del Evento</label>
              <input type="text" class="form-control rounded-3" id="evt-title" required placeholder="Ej: Concierto de Verano">
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label small fw-semibold text-muted">Categoría</label>
                <select class="form-select rounded-3" id="evt-category" required>
                  ${Object.entries(CATEGORIES).map(([key, cat]) => `<option value="${key}">${cat.label}</option>`).join('')}
                </select>
              </div>
              <div class="col-6">
                <label class="form-label small fw-semibold text-muted">Dpto. Responsable</label>
                <select class="form-select rounded-3" id="evt-dept" required>
                  <option value="DIR">Dirección (DIR)</option>
                  <option value="ACM">Académico-Musical (ACM)</option>
                  <option value="ADM">Administrativo (ADM)</option>
                  <option value="FIN">Finanzas (FIN)</option>
                  <option value="LOG">Logística (LOG)</option>
                  <option value="COM">Comunicaciones (COM)</option>
                  <option value="TECNICO">Sistemas/Tecnología</option>
                </select>
              </div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label small fw-semibold text-muted">Fecha/Hora Inicio</label>
                <input type="datetime-local" class="form-control rounded-3" id="evt-start" required>
              </div>
              <div class="col-6">
                <label class="form-label small fw-semibold text-muted">Fecha/Hora Fin</label>
                <input type="datetime-local" class="form-control rounded-3" id="evt-end" required>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Ubicación / Plataforma</label>
              <input type="text" class="form-control rounded-3" id="evt-location" placeholder="Ej: Auditorio Principal o Zoom">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-muted">Descripción y Objetivos</label>
              <textarea class="form-control rounded-3" id="evt-desc" rows="3" placeholder="Detalles de la meta o fin del evento..."></textarea>
            </div>
            <div class="alert alert-info py-2 small mb-3 border-0 d-flex gap-2 align-items-center">
              <i class="bi bi-info-circle-fill text-info fs-5"></i>
              <span>Al guardar, el motor <strong>Hermes</strong> auto-generará y delegará la matriz de tareas para cada departamento según el protocolo configurado.</span>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-light rounded-3" id="btn-cancel-add-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary rounded-3 px-4">Guardar y Disparar Protocolo</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Event Details Overlay (Aesthetic Event Detail & Octopus Task Matrix) -->
      <div class="hermes-modal-overlay d-none" id="event-detail-modal">
        <div class="hermes-modal-container card shadow-lg border-0 p-4" style="max-width: 700px;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="badge" id="detail-category-badge" style="font-size: 11px; padding: 6px 12px; border-radius: 20px;">Category</span>
            <button class="btn-close" id="btn-close-detail-modal"></button>
          </div>
          <h4 class="fw-bold mb-1" id="detail-title" style="color: var(--apple-ink);">Event Title</h4>
          <p class="text-muted small mb-3 d-flex gap-3 align-items-center">
            <span><i class="bi bi-geo-alt"></i> <span id="detail-location">Location</span></span>
            <span><i class="bi bi-calendar-event"></i> <span id="detail-time">Time</span></span>
          </p>

          <div class="mb-4">
            <h6 class="fw-bold text-muted small uppercase">Descripción del Evento</h6>
            <div class="p-3 bg-light rounded-3 text-muted small" id="detail-desc" style="white-space: pre-line;">Description...</div>
          </div>

          <!-- Hermes Delegated Octopus Tasks -->
          <div>
            <h5 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color: var(--apple-ink);">
              🐙 Tareas Delegadas por Hermes <span class="badge bg-success small" style="font-size: 10px;">Octopus Mode</span>
            </h5>
            <div class="d-flex flex-column gap-2" id="detail-tasks-list" style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
              <!-- Dynamic Tasks here -->
            </div>
          </div>

          <hr class="my-4">

          <div class="d-flex justify-content-between">
            <button class="btn btn-danger btn-sm rounded-3 px-3 d-flex align-items-center gap-2" id="btn-delete-event">
              <i class="bi bi-trash"></i> Eliminar Evento
            </button>
            <button class="btn btn-primary btn-sm rounded-3 px-4" id="btn-close-detail-modal-ok">Entendido</button>
          </div>
        </div>
      </div>
    `
  }

  // Styles Injection
  const injectStyles = () => {
    const styleId = 'hermes-calendar-styles'
    if (document.getElementById(styleId)) return
    const style = document.createElement('style')
    style.id = styleId
    style.innerHTML = `
      .grid-calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
      }
      .grid-calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: minmax(100px, auto);
        gap: 8px;
      }
      .calendar-day-cell {
        border: 1px solid var(--apple-hairline);
        border-radius: 12px;
        padding: 8px;
        position: relative;
        background: var(--apple-canvas);
        transition: all 0.2s ease;
      }
      .calendar-day-cell:hover {
        border-color: var(--apple-primary);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .calendar-day-cell.other-month {
        background: var(--apple-parchment);
        opacity: 0.5;
      }
      .calendar-day-cell.is-today {
        border: 2px solid var(--apple-primary) !important;
      }
      .day-num {
        font-weight: 600;
        font-size: 13px;
        color: var(--apple-ink-muted-80);
      }
      .is-today .day-num {
        color: var(--apple-primary);
        background: var(--apple-accent-bg);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
      }
      .day-events {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-top: 6px;
      }
      .event-dot-item {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        border-left: 3px solid transparent;
        transition: transform 0.15s ease;
      }
      .event-dot-item:hover {
        transform: translateX(2px);
      }
      .filter-chip {
        border: 1px solid var(--apple-hairline);
        border-radius: 20px;
        background: var(--apple-canvas);
        color: var(--apple-ink-muted-80);
        padding: 6px 14px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .filter-chip:hover {
        border-color: var(--apple-primary);
      }
      .filter-chip.active {
        background: var(--chip-bg, var(--apple-primary));
        color: var(--chip-color, white) !important;
        border-color: var(--chip-border, var(--apple-primary)) !important;
        font-weight: 600;
      }
      .filter-chip[data-cat="todos"].active {
        background: var(--apple-primary);
        color: white;
        border-color: var(--apple-primary);
      }
      .hermes-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      }
      .hermes-modal-container {
        width: 90%;
        max-width: 500px;
        border-radius: 20px !important;
        background: var(--apple-canvas) !important;
        animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes scaleUp {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .task-mini-row {
        background: var(--apple-parchment);
        border-radius: 10px;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        border-left: 4px solid var(--border-color, #ccc);
      }
      .task-mini-row .task-dept-badge {
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 6px;
        background: #fff;
        border: 1px solid #ddd;
        font-size: 10px;
      }
      .upcoming-card {
        border-left: 4px solid var(--cat-color);
        padding: 10px;
        border-radius: 10px;
        background: var(--apple-parchment);
        transition: transform 0.2s ease;
        cursor: pointer;
      }
      .upcoming-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      }
    `
    document.head.appendChild(style)
  }

  // Load database events
  const loadEventsData = async () => {
    const { data, error } = await obtenerEventos()
    if (!error) {
      events = data || []
    }
  }

  // Render Calendar Grid
  const populateCalendar = () => {
    const grid = container.querySelector('#calendar-grid')
    const monthTitle = container.querySelector('#month-title')
    if (!grid || !monthTitle) return

    grid.innerHTML = ''
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Title
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    monthTitle.textContent = `${monthNames[month]} ${year}`

    // First day of current month
    const firstDayIndex = new Date(year, month, 1).getDay()
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const todayStr = new Date().toDateString()

    // Render Prev Month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const cell = document.createElement('div')
      cell.className = 'calendar-day-cell other-month'
      cell.innerHTML = `<span class="day-num">${daysInPrevMonth - i}</span>`
      grid.appendChild(cell)
    }

    // Render Current Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      const cell = document.createElement('div')
      cell.className = 'calendar-day-cell'
      if (dayDate.toDateString() === todayStr) {
        cell.classList.add('is-today')
      }

      cell.innerHTML = `
        <span class="day-num">${day}</span>
        <div class="day-events"></div>
      `

      // Filter events matching this date
      const dateString = dayDate.toISOString().split('T')[0]
      const dayEvents = events.filter(e => {
        const evDate = new Date(e.fecha_inicio).toISOString().split('T')[0]
        if (filteredCategory !== 'todos' && e.categoria !== filteredCategory) return false
        return evDate === dateString
      })

      const eventsDiv = cell.querySelector('.day-events')
      dayEvents.forEach(e => {
        const catInfo = CATEGORIES[e.categoria] || CATEGORIES.otro
        const item = document.createElement('div')
        item.className = 'event-dot-item'
        item.style.backgroundColor = catInfo.bg
        item.style.color = catInfo.color
        item.style.borderLeftColor = catInfo.color
        item.textContent = e.titulo
        item.title = `${e.titulo} (${catInfo.label})`
        
        item.addEventListener('click', (evt) => {
          evt.stopPropagation()
          showEventDetails(e)
        })

        eventsDiv.appendChild(item)
      })

      // Double click or long touch to add event directly on date
      cell.addEventListener('click', () => {
        // Prepare add modal with pre-selected date
        openAddEventModal(dayDate)
      })

      grid.appendChild(cell)
    }

    // Render Next Month leading days
    const totalCells = firstDayIndex + daysInMonth
    const nextDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    for (let i = 1; i <= nextDays; i++) {
      const cell = document.createElement('div')
      cell.className = 'calendar-day-cell other-month'
      cell.innerHTML = `<span class="day-num">${i}</span>`
      grid.appendChild(cell)
    }

    // Refresh Upcoming list
    populateUpcoming()
  }

  // Populate Upcoming Events panel
  const populateUpcoming = () => {
    const list = container.querySelector('#upcoming-events-list')
    if (!list) return
    list.innerHTML = ''

    const today = new Date()
    const sortedFuture = events
      .filter(e => new Date(e.fecha_inicio) >= today)
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
      .slice(0, 5)

    if (sortedFuture.length === 0) {
      list.innerHTML = `<p class="text-muted small text-center my-3">No hay actividades programadas próximamente.</p>`
      return
    }

    sortedFuture.forEach(e => {
      const catInfo = CATEGORIES[e.categoria] || CATEGORIES.otro
      const dateStr = new Date(e.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      const card = document.createElement('div')
      card.className = 'upcoming-card'
      card.style.setProperty('--cat-color', catInfo.color)
      card.innerHTML = `
        <div class="d-flex justify-content-between mb-1">
          <span class="fw-semibold text-dark small text-truncate" style="max-width: 150px;">${e.titulo}</span>
          <span class="badge small" style="background: ${catInfo.bg}; color: ${catInfo.color}; font-size: 9px; align-self: start;">${catInfo.label}</span>
        </div>
        <div class="text-muted" style="font-size: 10px;">
          <div><i class="bi bi-clock me-1"></i> ${dateStr}</div>
          <div><i class="bi bi-geo-alt me-1"></i> ${e.ubicacion || 'Sin ubicación'}</div>
        </div>
      `
      card.addEventListener('click', () => showEventDetails(e))
      list.appendChild(card)
    })
  }

  // Show Details modal
  const showEventDetails = async (event) => {
    const modal = container.querySelector('#event-detail-modal')
    if (!modal) return

    // Set Text Details
    modal.querySelector('#detail-title').textContent = event.titulo
    modal.querySelector('#detail-desc').textContent = event.descripcion || 'Sin descripción.'
    modal.querySelector('#detail-location').textContent = event.ubicacion || 'No especificado'
    
    const startStr = new Date(event.fecha_inicio).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
    modal.querySelector('#detail-time').textContent = startStr

    const catInfo = CATEGORIES[event.categoria] || CATEGORIES.otro
    const badge = modal.querySelector('#detail-category-badge')
    badge.textContent = catInfo.label.toUpperCase()
    badge.style.backgroundColor = catInfo.bg
    badge.style.color = catInfo.color
    badge.style.border = `1px solid ${catInfo.color}`

    // Fetch related tasks auto-delegated by Hermes
    const tasksDiv = modal.querySelector('#detail-tasks-list')
    tasksDiv.innerHTML = '<p class="text-muted small text-center my-3">Consultando cerebro de Hermes...</p>'

    const { data: tasks } = await obtenerTareas({ event_id: event.id })
    tasksDiv.innerHTML = ''
    if (!tasks || tasks.length === 0) {
      tasksDiv.innerHTML = `
        <div class="text-center p-3 text-muted small">
          <i class="bi bi-shield-slash-fill fs-4 text-warning"></i>
          <div>Este evento no disparó tareas. Revisa si el protocolo está activo.</div>
        </div>
      `
    } else {
      tasks.forEach(t => {
        const item = document.createElement('div')
        item.className = 'task-mini-row'
        item.style.setProperty('--border-color', 
          t.departamento === 'ACM' ? '#5856d6' : 
          t.departamento === 'DIR' ? '#ff2d55' : 
          t.departamento === 'FIN' ? '#007aff' : 
          t.departamento === 'LOG' ? '#34c759' : '#8e8e93'
        )
        const checkDone = t.checklist ? t.checklist.filter(c => c.completado).length : 0
        const checkTotal = t.checklist ? t.checklist.length : 0

        item.innerHTML = `
          <div>
            <div class="fw-semibold text-dark text-truncate" style="max-width: 320px;">${t.titulo}</div>
            <div class="text-muted" style="font-size: 10px;">
              <span>Vence: ${t.fecha_vencimiento}</span>
              ${checkTotal > 0 ? `<span class="ms-2"><i class="bi bi-check-all text-success"></i> ${checkDone}/${checkTotal} ítems</span>` : ''}
            </div>
          </div>
          <span class="task-dept-badge">${t.departamento}</span>
        `
        tasksDiv.appendChild(item)
      })
    }

    // Set delete event
    const btnDelete = modal.querySelector('#btn-delete-event')
    // Reset click listener cleanly
    const clone = btnDelete.cloneNode(true)
    btnDelete.parentNode.replaceChild(clone, btnDelete)

    clone.addEventListener('click', async () => {
      if (confirm(`¿Estás seguro de que deseas eliminar "${event.titulo}"? Esto borrará también sus tareas delegadas en cascada.`)) {
        const { error } = await eliminarEvento(event.id)
        if (!error) {
          modal.classList.add('d-none')
          await loadEventsData()
          populateCalendar()
        } else {
          alert('Error al borrar evento: ' + error.message)
        }
      }
    })

    // Show modal
    modal.classList.remove('d-none')
  }

  // Open Add Event Modal
  const openAddEventModal = (selectedDate) => {
    const modal = container.querySelector('#add-event-modal')
    if (!modal) return

    // Prepopulate date input
    const startInput = modal.querySelector('#evt-start')
    const endInput = modal.querySelector('#evt-end')

    // Local ISO representation helper
    const offset = selectedDate.getTimezoneOffset()
    const localDate = new Date(selectedDate.getTime() - (offset*60*1000))
    const formatted = localDate.toISOString().slice(0, 16)
    
    // Duration 1 hour default
    const endDate = new Date(selectedDate.getTime() + (60 * 60 * 1000) - (offset*60*1000))
    const formattedEnd = endDate.toISOString().slice(0, 16)

    startInput.value = formatted
    endInput.value = formattedEnd

    modal.classList.remove('d-none')
  }

  // Bootstrap layout
  injectStyles()
  renderFrame()

  // Init Data and populate
  await loadEventsData()
  populateCalendar()

  // --- Attach listeners ---
  // Category filters Click
  container.querySelector('#category-filters')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip')
    if (!chip) return
    container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'))
    chip.classList.add('active')
    filteredCategory = chip.dataset.cat
    populateCalendar()
  }, { signal: _ac.signal })

  // Month navigation
  container.querySelector('#btn-prev-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1)
    populateCalendar()
  }, { signal: _ac.signal })

  container.querySelector('#btn-next-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1)
    populateCalendar()
  }, { signal: _ac.signal })

  container.querySelector('#btn-today')?.addEventListener('click', () => {
    currentDate = new Date()
    populateCalendar()
  }, { signal: _ac.signal })

  // Navigate to delegated tasks
  container.querySelector('#btn-view-tasks')?.addEventListener('click', () => {
    window.router?.navigate('hermes-tareas')
  }, { signal: _ac.signal })

  // Add event trigger button
  container.querySelector('#btn-add-event')?.addEventListener('click', () => {
    openAddEventModal(new Date())
  }, { signal: _ac.signal })

  // Modal actions
  const addModal = container.querySelector('#add-event-modal')
  addModal?.querySelector('#btn-close-add-modal')?.addEventListener('click', () => addModal.classList.add('d-none'), { signal: _ac.signal })
  addModal?.querySelector('#btn-cancel-add-modal')?.addEventListener('click', () => addModal.classList.add('d-none'), { signal: _ac.signal })

  const detailModal = container.querySelector('#event-detail-modal')
  detailModal?.querySelectorAll('#btn-close-detail-modal, #btn-close-detail-modal-ok').forEach(btn => {
    btn.addEventListener('click', () => detailModal.classList.add('d-none'), { signal: _ac.signal })
  })

  // Submit Event Form
  addModal?.querySelector('#add-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const eventPayload = {
      titulo: addModal.querySelector('#evt-title').value,
      categoria: addModal.querySelector('#evt-category').value,
      departamento_responsable: addModal.querySelector('#evt-dept').value,
      fecha_inicio: new Date(addModal.querySelector('#evt-start').value).toISOString(),
      fecha_fin: new Date(addModal.querySelector('#evt-end').value).toISOString(),
      ubicacion: addModal.querySelector('#evt-location').value,
      descripcion: addModal.querySelector('#evt-desc').value,
      estado: 'programado'
    }

    const { error } = await crearEvento(eventPayload)
    if (!error) {
      addModal.classList.add('d-none')
      // Clear fields
      addModal.querySelector('#add-event-form').reset()
      // Reload calendar
      await loadEventsData()
      populateCalendar()
    } else {
      alert('Error al crear evento: ' + error.message)
    }
  }, { signal: _ac.signal })

  return { teardown: () => _ac.abort() }
}
