import { obtenerTareas, actualizarTarea, eliminarTarea, crearTarea } from '../api/hermesApi.js'

export async function renderTareasView(container, options = {}) {
  const restrictDept = options.departamento || null
  const hideTabs = options.hideTabs || (restrictDept ? true : false)
  const hideForm = options.hideForm || false
  const hideCalendarBtn = options.hideCalendarBtn || (restrictDept ? true : false)

  const _ac = new AbortController()

  // Base state
  let tasks = []
  let activeDept = restrictDept || 'ACM' // Default view
  let selectedTask = null

  const DEPTS = {
    ACM: { label: 'Académico-Musical', icon: 'bi-music-note-beamed', color: '#5856d6' },
    LOG: { label: 'Logística y Eventos', icon: 'bi-box-seam', color: '#34c759' },
    FIN: { label: 'Finanzas', icon: 'bi-cash-coin', color: '#007aff' },
    DIR: { label: 'Dirección Ejecutiva', icon: 'bi-briefcase', color: '#ff2d55' },
    COM: { label: 'Comunicaciones', icon: 'bi-megaphone', color: '#ff9500' },
    TECNICO: { label: 'Sistemas (Hermes)', icon: 'bi-cpu', color: '#af52de' }
  }

  const renderFrame = () => {
    container.innerHTML = `
      <div class="container-fluid p-4" style="animation: fadeIn 0.4s ease;">
        <!-- Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 class="fw-bold mb-1 d-flex align-items-center gap-2" style="color: var(--apple-ink); letter-spacing: -0.5px;">
              📋 Hub de Tareas y Gestión Departamental
              <button id="btn-info-hub" class="btn btn-link text-muted p-0 border-0 shadow-none d-flex align-items-center" style="font-size: 20px; transition: color 0.2s;" title="Guía de operaciones">
                <i class="bi bi-question-circle"></i>
              </button>
            </h3>
            <p class="text-muted small mb-0">Tablero interactivo tipo Notion para la evaluación, seguimiento y decisión de tareas operativas.</p>
          </div>
          <div class="d-flex gap-2">
            ${hideForm ? '' : `
              <button id="btn-toggle-form" class="btn btn-primary d-flex align-items-center gap-2" style="border-radius: 12px; font-weight: 500;">
                <i class="bi bi-plus-circle-fill"></i> Asignar Tarea / Minuta
              </button>
            `}
            ${hideCalendarBtn ? '' : `
              <button id="btn-view-calendar" class="btn btn-outline-secondary d-flex align-items-center gap-2" style="border-radius: 12px; font-weight: 500;">
                <i class="bi bi-calendar3"></i> Volver al Calendario
              </button>
            `}
          </div>
        </div>

        <!-- Task Assignment Form (Collapsible) -->
        <div class="card shadow-sm border-0 mb-4 d-none" id="assignment-form-card" style="border-radius: 16px; background: var(--apple-canvas); transition: all 0.3s ease;">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3 d-flex justify-content-between align-items-center">
              <span>📥 Asignar Nueva Tarea (Superior o Minuta)</span>
              <button type="button" class="btn-close" id="btn-close-form"></button>
            </h5>
            <form id="task-delegate-form">
              <div class="row g-2 mb-3">
                <div class="col-md-5">
                  <label class="form-label small fw-semibold text-muted">Título de la Tarea</label>
                  <input type="text" class="form-control rounded-3" id="task-title" required placeholder="Ej: Llamar responsable de evento">
                </div>
                <div class="col-md-3">
                  <label class="form-label small fw-semibold text-muted">Dpto. Asignado</label>
                  <select class="form-select rounded-3" id="task-dept" required>
                    ${Object.entries(DEPTS).map(([key, dpt]) => `<option value="${key}" ${key === activeDept ? 'selected' : ''}>${dpt.label} (${key})</option>`).join('')}
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold text-muted">Prioridad</label>
                  <select class="form-select rounded-3" id="task-priority" required>
                    <option value="baja">Baja</option>
                    <option value="media" selected>Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label small fw-semibold text-muted">Vencimiento</label>
                  <input type="date" class="form-control rounded-3" id="task-due" required>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label small fw-semibold text-muted">Descripción detallada</label>
                <textarea class="form-control rounded-3" id="task-desc" rows="2" placeholder="Instrucciones específicas para el área..."></textarea>
              </div>

              <!-- Checklist Builder -->
              <div class="mb-3 p-3 bg-light rounded-3" style="border: 1px solid var(--apple-hairline);">
                <label class="form-label small fw-bold text-dark d-flex justify-content-between align-items-center">
                  <span>🛠️ Checklist de Protocolo</span>
                  <button type="button" class="btn btn-outline-primary btn-sm rounded-3 px-2 py-0" id="btn-add-form-step" style="font-size: 11px;">
                    + Añadir Paso
                  </button>
                </label>
                <div class="d-flex flex-column gap-2" id="form-steps-list">
                  <div class="d-flex gap-2 form-step-row">
                    <input type="text" class="form-control form-control-sm rounded-3" placeholder="Paso #1" required>
                    <button type="button" class="btn btn-outline-danger btn-sm rounded-3 py-0 px-2 btn-remove-step"><i class="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-light rounded-3" id="btn-cancel-form">Cancelar</button>
                <button type="submit" class="btn btn-primary rounded-3 px-4">Asignar Tarea</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Department Tabs -->
        <div class="card border-0 shadow-sm mb-4 ${hideTabs ? 'd-none' : ''}" style="border-radius: 16px; background: var(--apple-canvas);">
          <div class="card-body p-2 overflow-x-auto">
            <div class="d-flex gap-1" id="dept-tabs">
              ${Object.entries(DEPTS).map(([key, dpt]) => `
                <button class="dept-tab-btn ${key === activeDept ? 'active' : ''}" data-dept="${key}" style="--dept-color: ${dpt.color}">
                  <i class="bi ${dpt.icon} me-2"></i>
                  <span>${dpt.label}</span>
                  <span class="badge bg-secondary ms-2 task-count-badge" id="badge-count-${key}">0</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Saturation Alert -->
        <div id="saturation-alert-container"></div>

        <!-- Notion-Like Board Grid -->
        <div class="row g-4">
          <!-- Active Board Area (9 columns) -->
          <div class="col-md-9">
            <div class="row g-3">
              <!-- Column 1: Pendientes -->
              <div class="col-md-4">
                <div class="card shadow-sm border-0 p-3 h-100 notion-col" style="border-radius: 16px; background: var(--apple-canvas-subtle); min-height: 500px;">
                  <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-muted" style="font-size: 13px; letter-spacing: -0.2px;">
                    <span class="d-flex align-items-center gap-2">
                      <i class="bi bi-inbox text-muted"></i> Inbox / Pendientes
                    </span>
                    <span class="badge bg-secondary text-white rounded-pill" style="font-size: 10px;" id="count-pending">0</span>
                  </h6>
                  <div class="d-flex flex-column gap-2" id="list-pending" style="flex-grow: 1;"></div>
                </div>
              </div>

              <!-- Column 2: Programadas -->
              <div class="col-md-4">
                <div class="card shadow-sm border-0 p-3 h-100 notion-col" style="border-radius: 16px; background: var(--apple-canvas-subtle); min-height: 500px;">
                  <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-primary" style="font-size: 13px; letter-spacing: -0.2px;">
                    <span class="d-flex align-items-center gap-2">
                      <i class="bi bi-calendar-event text-primary"></i> Programadas
                    </span>
                    <span class="badge bg-primary text-white rounded-pill" style="font-size: 10px;" id="count-scheduled">0</span>
                  </h6>
                  <div class="d-flex flex-column gap-2" id="list-scheduled" style="flex-grow: 1;"></div>
                </div>
              </div>

              <!-- Column 3: Asignadas / En Progreso -->
              <div class="col-md-4">
                <div class="card shadow-sm border-0 p-3 h-100 notion-col" style="border-radius: 16px; background: var(--apple-canvas-subtle); min-height: 500px;">
                  <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-success" style="font-size: 13px; letter-spacing: -0.2px;">
                    <span class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-workspace text-success"></i> Asignadas / En Progreso
                    </span>
                    <span class="badge bg-success text-white rounded-pill" style="font-size: 10px;" id="count-assigned">0</span>
                  </h6>
                  <div class="d-flex flex-column gap-2" id="list-assigned" style="flex-grow: 1;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Archived/Completed Area (3 columns) -->
          <div class="col-md-3">
            <div class="card shadow-sm border-0 p-3 h-100" style="border-radius: 16px; background: var(--apple-canvas); min-height: 500px;">
              <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-dark" style="font-size: 13px; letter-spacing: -0.2px;">
                <span class="d-flex align-items-center gap-2">
                  <i class="bi bi-check-circle-fill text-success"></i> Historial Completadas
                </span>
                <span class="badge bg-success text-white rounded-pill" style="font-size: 10px;" id="count-completed">0</span>
              </h6>
              <div class="d-flex flex-column gap-2 overflow-y-auto" id="completed-tasks-list" style="max-height: 550px;"></div>
            </div>
          </div>
        </div>

        <!-- Task Drawer Backdrop -->
        <div class="task-drawer-backdrop" id="task-drawer-backdrop"></div>

        <!-- Task Detail Drawer (Notion Slide Panel) -->
        <div class="task-drawer" id="task-detail-drawer">
          <!-- Contenido dinámico del Drawer -->
        </div>

        <!-- Help Modal -->
        <div class="modal fade" id="hub-help-modal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow" style="border-radius: 16px; background: var(--apple-canvas);">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold">📖 Guía de Operación (HERMES)</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body pt-3" style="font-size: 14px;">
                <p class="text-muted mb-4">Este tablero organiza el flujo de trabajo de cada departamento. Las tareas son asignadas automáticamente por HERMES basándose en eventos de calendario, o manualmente por Dirección.</p>
                
                <div class="d-flex flex-column gap-3">
                  <div class="d-flex gap-3 align-items-start">
                    <div class="p-2 rounded bg-light border text-muted"><i class="bi bi-inbox fs-5"></i></div>
                    <div>
                      <h6 class="fw-bold mb-1 text-dark">Inbox / Pendientes</h6>
                      <p class="text-muted small mb-0">Tareas urgentes o que requieren asignación. Tienen fecha límite de hoy o están vencidas.</p>
                    </div>
                  </div>
                  
                  <div class="d-flex gap-3 align-items-start">
                    <div class="p-2 rounded bg-light border text-primary"><i class="bi bi-calendar-event fs-5"></i></div>
                    <div>
                      <h6 class="fw-bold mb-1 text-dark">Programadas</h6>
                      <p class="text-muted small mb-0">Tareas planificadas a futuro. Se activan automáticamente conforme se acerca la fecha límite.</p>
                    </div>
                  </div>

                  <div class="d-flex gap-3 align-items-start">
                    <div class="p-2 rounded bg-light border text-success"><i class="bi bi-person-workspace fs-5"></i></div>
                    <div>
                      <h6 class="fw-bold mb-1 text-dark">Asignadas / En Progreso</h6>
                      <p class="text-muted small mb-0">Tareas en ejecución. Si surge un impedimento, pueden marcarse como <strong>Bloqueadas</strong> (color rojo) en el drawer.</p>
                    </div>
                  </div>

                  <div class="d-flex gap-3 align-items-start">
                    <div class="p-2 rounded bg-light border text-dark"><i class="bi bi-layout-sidebar-reverse fs-5"></i></div>
                    <div>
                      <h6 class="fw-bold mb-1 text-dark">Evaluar y Decidir (Drawer Lateral)</h6>
                      <p class="text-muted small mb-0">Hacé clic en cualquier tarjeta para abrir la ficha de control. Allí podés completar el checklist de protocolo, subir adjuntos, reprogramar fechas o completar la tarea.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-0">
                <button type="button" class="btn btn-secondary rounded-3 px-4" data-bs-dismiss="modal">Entendido</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Styles Injection
  const injectStyles = () => {
    const styleId = 'hermes-tasks-notion-v10-styles'
    if (document.getElementById(styleId)) return
    const style = document.createElement('style')
    style.id = styleId
    style.innerHTML = `
      .dept-tab-btn {
        border: none;
        background: transparent;
        color: var(--apple-ink-muted-80);
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.25s ease;
        white-space: nowrap;
      }
      .dept-tab-btn:hover {
        background: var(--apple-parchment);
        color: var(--apple-ink);
      }
      .dept-tab-btn.active {
        background: rgba(0,0,0,0.05);
        color: var(--dept-color) !important;
        font-weight: 600;
      }
      [data-bs-theme="dark"] .dept-tab-btn.active {
        background: rgba(255,255,255,0.08);
      }

      /* Compact Notion Card */
      .notion-task-card {
        border: 1px solid var(--apple-hairline);
        border-radius: 12px;
        padding: 14px;
        background: var(--apple-canvas);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .notion-task-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        border-color: var(--apple-primary-light, #007aff);
      }
      .notion-task-card.task-priority-critica { border-left: 4px solid #ff2d55 !important; }
      .notion-task-card.task-priority-alta { border-left: 4px solid #ff9500 !important; }
      .notion-task-card.task-priority-media { border-left: 4px solid #007aff !important; }
      .notion-task-card.task-priority-baja { border-left: 4px solid #8e8e93 !important; }

      /* Task Columns empty state styling */
      .notion-col {
        border: 1px dashed var(--apple-hairline) !important;
      }

      /* Drawer (Slide-out Panel) */
      .task-drawer {
        position: fixed;
        top: 0;
        right: -520px;
        width: 500px;
        height: 100vh;
        background: var(--apple-canvas, #ffffff);
        box-shadow: -5px 0 25px rgba(0, 0, 0, 0.12);
        z-index: 1050;
        transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--apple-hairline);
      }
      .task-drawer.open {
        right: 0;
      }
      .task-drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(2px);
        z-index: 1040;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      .task-drawer-backdrop.show {
        opacity: 1;
        visibility: visible;
      }

      /* Checklist Drawer row styles */
      .step-cycle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--apple-canvas-subtle, #f5f5f7);
        border-radius: 8px;
        border: 1px solid var(--apple-hairline);
        margin-bottom: 6px;
        transition: all 0.2s ease;
      }
      .step-cycle-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 20px;
        padding: 4px 10px;
        transition: all 0.15s ease;
      }
      .step-cycle-btn.state-pendiente {
        color: #8e8e93;
        background: rgba(142, 142, 147, 0.1);
      }
      .step-cycle-btn.state-en_progreso {
        color: #ff9500;
        background: rgba(255, 149, 0, 0.1);
      }
      .step-cycle-btn.state-completada {
        color: #34c759;
        background: rgba(52, 199, 89, 0.1);
      }

      /* Progress path wizard */
      .progress-bar-wrapper {
        height: 6px;
        background: var(--apple-hairline);
        border-radius: 3px;
        overflow: hidden;
      }

      /* Attached documents block */
      .doc-attach-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 20px;
        background: var(--apple-parchment, #fbfbfd);
        font-size: 11px;
        color: var(--apple-ink-muted-80);
        border: 1px solid var(--apple-hairline);
        margin-right: 6px;
        margin-bottom: 6px;
      }
      .doc-attach-pill a {
        text-decoration: none;
        color: var(--apple-primary);
        font-weight: 500;
      }
    `
    document.head.appendChild(style)
  }

  // Load database tasks
  const refreshTasksList = async () => {
    const { data, error } = await obtenerTareas()
    if (!error) {
      tasks = data || []
      populateCounts()
      populateWorkspace()
      
      // If a task was opened in the drawer, reload its fresh state from the list
      if (selectedTask) {
        const freshTask = tasks.find(t => t.id === selectedTask.id)
        if (freshTask) {
          selectedTask = freshTask
          renderDrawerContent(freshTask)
        } else {
          closeDrawer()
        }
      }
    }
  }

  const populateCounts = () => {
    Object.keys(DEPTS).forEach(deptKey => {
      const activeCount = tasks.filter(t => t.departamento === deptKey && t.estado !== 'completada' && t.estado !== 'cancelada').length
      const badge = container.querySelector(`#badge-count-${deptKey}`)
      if (badge) badge.textContent = activeCount
    })
  }

  // Render lists of tasks into their respective columns
  const populateWorkspace = () => {
    const listPending = container.querySelector('#list-pending')
    const listScheduled = container.querySelector('#list-scheduled')
    const listAssigned = container.querySelector('#list-assigned')
    const completedList = container.querySelector('#completed-tasks-list')
    const alertContainer = container.querySelector('#saturation-alert-container')

    if (!listPending || !listScheduled || !listAssigned || !completedList || !alertContainer) return

    listPending.innerHTML = ''
    listScheduled.innerHTML = ''
    listAssigned.innerHTML = ''
    completedList.innerHTML = ''
    alertContainer.innerHTML = ''

    const todayStr = new Date().toISOString().split('T')[0]

    // Filter tasks by active department
    const deptTasks = tasks.filter(t => t.departamento === activeDept)

    // Classify tasks logically
    const pendingTasks = deptTasks.filter(t => t.estado === 'pendiente' && (!t.fecha_vencimiento || t.fecha_vencimiento <= todayStr))
    const scheduledTasks = deptTasks.filter(t => t.estado === 'pendiente' && t.fecha_vencimiento > todayStr)
    const assignedTasks = deptTasks.filter(t => t.estado === 'en_progreso' || t.estado === 'bloqueada')
    const completedTasks = deptTasks.filter(t => t.estado === 'completada')

    // Set Column Counts
    container.querySelector('#count-pending').textContent = pendingTasks.length
    container.querySelector('#count-scheduled').textContent = scheduledTasks.length
    container.querySelector('#count-assigned').textContent = assignedTasks.length
    container.querySelector('#count-completed').textContent = completedTasks.length

    // Saturation Veto Check (Rule AGT-P09 - total active tasks on department)
    const totalActiveCount = pendingTasks.length + scheduledTasks.length + assignedTasks.length
    if (totalActiveCount >= 6) {
      alertContainer.innerHTML = `
        <div class="alert alert-danger border-0 p-3 mb-4 d-flex align-items-center gap-3 animate-pulse" style="border-radius: 12px; background: rgba(255,45,85,0.1); color: #ff2d55;">
          <i class="bi bi-exclamation-octagon-fill fs-3"></i>
          <div>
            <h6 class="fw-bold mb-1">🔴 ALERTA DE SATURACIÓN (Regla AGT-P09)</h6>
            <div class="small">El dpto. <strong>${DEPTS[activeDept].label}</strong> supera el límite tolerado de 6 tareas críticas activas. Se recomienda redistribuir o congelar asignaciones automáticas de Hermes.</div>
          </div>
        </div>
      `
    }

    // Helper to render compact cards
    const renderCompactCard = (t, targetColumn) => {
      const priorityLabel = t.prioridad === 'critica' ? 'Crítica' : t.prioridad === 'alta' ? 'Alta' : t.prioridad === 'media' ? 'Media' : 'Baja'
      const eventTitle = t.calendario_institucional ? t.calendario_institucional.titulo : 'Asignación Directa'
      
      const card = document.createElement('div')
      card.className = `notion-task-card task-priority-${t.prioridad} mb-2`
      card.dataset.id = t.id

      // Calculate progress percentage
      const checklist = t.checklist || []
      const totalSteps = checklist.length
      let completedSteps = 0
      let inProgressSteps = 0
      
      checklist.forEach(c => {
        const state = c.estado || (c.completado ? 'completada' : 'pendiente')
        if (state === 'completada') completedSteps++
        else if (state === 'en_progreso') inProgressSteps++
      })
      const score = (completedSteps * 1) + (inProgressSteps * 0.5)
      const progressPercent = totalSteps > 0 ? Math.round((score / totalSteps) * 100) : 0

      // Countdown math
      let countdownHTML = ''
      if (t.fecha_vencimiento) {
        const daysLeft = Math.ceil((new Date(t.fecha_vencimiento) - new Date()) / (1000*60*60*24))
        const countdownStr = daysLeft < 0 ? `Hace ${Math.abs(daysLeft)}d (Vencida)` : daysLeft === 0 ? 'Vence hoy' : `En ${daysLeft} días`
        const countdownClass = daysLeft < 0 ? 'text-danger fw-bold' : daysLeft <= 2 ? 'text-warning fw-semibold' : 'text-muted'
        countdownHTML = `<span class="${countdownClass}" style="font-size: 10px;"><i class="bi bi-clock"></i> ${countdownStr}</span>`
      } else {
        countdownHTML = `<span class="text-muted" style="font-size: 10px;"><i class="bi bi-clock"></i> Sin fecha</span>`
      }

      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
          <div class="fw-bold text-dark mb-0 text-truncate" style="font-size: 13px; max-width: 80%;">${t.titulo}</div>
          <span class="badge" style="font-size: 8px; padding: 2px 6px; background: ${t.estado === 'bloqueada' ? '#ff3b30' : t.prioridad === 'critica' ? 'rgba(255,45,85,0.1)' : t.prioridad === 'alta' ? 'rgba(255,149,0,0.1)' : 'rgba(0,122,255,0.1)'}; color: ${t.estado === 'bloqueada' ? '#fff' : t.prioridad === 'critica' ? '#ff2d55' : t.prioridad === 'alta' ? '#ff9500' : '#007aff'}; border-radius: 8px;">
            ${t.estado === 'bloqueada' ? 'Bloqueada' : priorityLabel}
          </span>
        </div>
        
        <div class="text-muted mb-2 text-truncate" style="font-size: 10px;">
          <i class="bi bi-link-45deg"></i> ${eventTitle}
        </div>

        <div class="d-flex justify-content-between align-items-center">
          ${countdownHTML}
          ${totalSteps > 0 ? `
            <div class="d-flex align-items-center gap-1">
              <span class="text-muted" style="font-size: 9px; font-weight: 500;">${progressPercent}%</span>
              <div class="progress-bar-wrapper" style="width: 30px;">
                <div class="progress-bar bg-success h-100" style="width: ${progressPercent}%"></div>
              </div>
            </div>
          ` : ''}
        </div>
      `

      // Click to open Drawer
      card.addEventListener('click', () => {
        openDrawer(t)
      })

      targetColumn.appendChild(card)
    }

    // Populate Pendientes
    if (pendingTasks.length === 0) {
      listPending.innerHTML = `<div class="text-muted small text-center my-4 py-3 border border-dashed rounded-3">Bandeja vacía</div>`
    } else {
      pendingTasks.forEach(t => renderCompactCard(t, listPending))
    }

    // Populate Programadas
    if (scheduledTasks.length === 0) {
      listScheduled.innerHTML = `<div class="text-muted small text-center my-4 py-3 border border-dashed rounded-3">Sin tareas programadas</div>`
    } else {
      scheduledTasks.forEach(t => renderCompactCard(t, listScheduled))
    }

    // Populate Asignadas
    if (assignedTasks.length === 0) {
      listAssigned.innerHTML = `<div class="text-muted small text-center my-4 py-3 border border-dashed rounded-3">Sin tareas activas</div>`
    } else {
      assignedTasks.forEach(t => renderCompactCard(t, listAssigned))
    }

    // Populate Completed list
    if (completedTasks.length === 0) {
      completedList.innerHTML = `<p class="text-muted small text-center my-4">No hay tareas completadas.</p>`
    } else {
      completedTasks.forEach(t => {
        const item = document.createElement('div')
        item.className = 'p-3 bg-light rounded-3 d-flex justify-content-between align-items-center border mb-2'
        item.style.opacity = '0.85'
        item.innerHTML = `
          <div style="max-width: 80%;">
            <div class="fw-bold text-dark text-decoration-line-through small text-truncate" style="font-size: 12px;">${t.titulo}</div>
            <div class="text-muted" style="font-size: 9px;">
              <span>Venció: ${t.fecha_vencimiento || 'S/F'}</span>
              ${t.feedback ? `<span class="d-block text-truncate text-muted"><i class="bi bi-chat-left-text"></i> ${t.feedback}</span>` : ''}
            </div>
          </div>
          <button class="btn btn-link btn-sm text-danger btn-delete-task shadow-none" style="padding: 0;"><i class="bi bi-trash"></i></button>
        `

        item.querySelector('.btn-delete-task').addEventListener('click', async (e) => {
          e.stopPropagation()
          if (confirm('¿Deseas borrar esta tarea completada del historial?')) {
            const { error } = await eliminarTarea(t.id)
            if (!error) {
              if (selectedTask && selectedTask.id === t.id) closeDrawer()
              refreshTasksList()
            }
          }
        })

        completedList.appendChild(item)
      })
    }
  }

  // Notion Drawer Controller
  const openDrawer = (task) => {
    selectedTask = task
    const drawer = container.querySelector('#task-detail-drawer')
    const backdrop = container.querySelector('#task-drawer-backdrop')
    
    renderDrawerContent(task)
    
    drawer.classList.add('open')
    backdrop.classList.add('show')
  }

  const closeDrawer = () => {
    selectedTask = null
    const drawer = container.querySelector('#task-detail-drawer')
    const backdrop = container.querySelector('#task-drawer-backdrop')
    
    drawer.classList.remove('open')
    backdrop.classList.remove('show')
  }

  // Render static/dynamic content inside drawer
  const renderDrawerContent = (t) => {
    const drawer = container.querySelector('#task-detail-drawer')
    if (!drawer) return

    const priorityLabel = t.prioridad === 'critica' ? 'Crítica' : t.prioridad === 'alta' ? 'Alta' : t.prioridad === 'media' ? 'Media' : 'Baja'
    const eventTitle = t.calendario_institucional ? t.calendario_institucional.titulo : 'Asignación Directa'
    const checklist = t.checklist || []
    const totalSteps = checklist.length
    
    let completedSteps = 0
    let inProgressSteps = 0
    checklist.forEach(c => {
      const state = c.estado || (c.completado ? 'completada' : 'pendiente')
      if (state === 'completada') completedSteps++
      else if (state === 'en_progreso') inProgressSteps++
    })
    const score = (completedSteps * 1) + (inProgressSteps * 0.5)
    const progressPercent = totalSteps > 0 ? Math.round((score / totalSteps) * 100) : 0

    // Checklist step items HTML
    const stepsHTML = checklist.map((c, idx) => {
      const state = c.estado || (c.completado ? 'completada' : 'pendiente')
      let cycleBtn = ''
      if (state === 'pendiente') {
        cycleBtn = `<button type="button" class="step-cycle-btn state-pendiente" data-idx="${idx}"><i class="bi bi-circle"></i> Pendiente</button>`
      } else if (state === 'en_progreso') {
        cycleBtn = `<button type="button" class="step-cycle-btn state-en_progreso" data-idx="${idx}"><i class="bi bi-dash-circle-dotted animate-spin"></i> En Proceso</button>`
      } else {
        cycleBtn = `<button type="button" class="step-cycle-btn state-completada" data-idx="${idx}"><i class="bi bi-check-circle-fill"></i> Completada</button>`
      }

      return `
        <div class="step-cycle-row">
          <span class="small fw-medium ${state === 'completada' ? 'text-decoration-line-through text-muted' : ''}">${c.item}</span>
          ${cycleBtn}
        </div>
      `
    }).join('')

    // Documents HTML
    const docs = t.documentos_adjuntos || []
    const docsHTML = docs.map((d, dIdx) => `
      <div class="doc-attach-pill">
        <i class="bi bi-file-earmark-pdf-fill text-danger"></i>
        <a href="${d.url}" target="_blank" title="${d.nombre}">${d.nombre.substring(0, 16)}...</a>
        <button type="button" class="btn-close ms-1 btn-remove-doc" style="font-size: 8px;" data-didx="${dIdx}"></button>
      </div>
    `).join('')

    drawer.innerHTML = `
      <!-- Header -->
      <div class="task-drawer-header d-flex justify-content-between align-items-center">
        <div>
          <span class="badge mb-2" style="background: ${t.estado === 'bloqueada' ? '#ff3b30' : t.prioridad === 'critica' ? 'rgba(255,45,85,0.1)' : t.prioridad === 'alta' ? 'rgba(255,149,0,0.1)' : 'rgba(0,122,255,0.1)'}; color: ${t.estado === 'bloqueada' ? '#fff' : t.prioridad === 'critica' ? '#ff2d55' : t.prioridad === 'alta' ? '#ff9500' : '#007aff'}; font-size: 10px; border-radius: 12px; padding: 4px 10px;">
            ${t.estado === 'bloqueada' ? 'Bloqueada' : `Prioridad: ${priorityLabel}`}
          </span>
          <h4 class="fw-bold mb-0 text-dark" style="letter-spacing: -0.5px;">${t.titulo}</h4>
        </div>
        <button type="button" class="btn-close" id="btn-close-drawer" style="font-size: 16px;"></button>
      </div>

      <!-- Body -->
      <div class="task-drawer-body">
        <!-- Metadata Info -->
        <div class="mb-4 p-3 bg-light rounded-3" style="border: 1px solid var(--apple-hairline); font-size: 13px;">
          <div class="mb-2"><strong>Origen del Evento:</strong> <span class="text-muted">${eventTitle}</span></div>
          <div class="mb-2"><strong>Dpto. Encargado:</strong> <span class="text-muted">${DEPTS[t.departamento].label} (${t.departamento})</span></div>
          <div class="d-flex align-items-center gap-2">
            <strong>Fecha Límite:</strong> 
            <input type="date" class="form-control form-control-sm w-auto rounded-3 d-inline-block p-1" id="drawer-task-due" value="${t.fecha_vencimiento || ''}">
            <button class="btn btn-outline-secondary btn-sm p-1 rounded-3" id="btn-save-due" style="font-size: 11px;">Guardar</button>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label class="fw-bold text-muted small mb-2" style="letter-spacing: 0.5px;">DESCRIPCIÓN</label>
          <p class="text-muted small">${t.descripcion || 'Sin descripción detallada.'}</p>
        </div>

        <!-- Progress bar -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-1 text-muted small" style="font-size: 11px;">
            <span>Progreso del Protocolo</span>
            <span class="fw-bold text-dark">${progressPercent}%</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar bg-success h-100" style="width: ${progressPercent}%; transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Checklist -->
        ${totalSteps > 0 ? `
          <div class="mb-4">
            <label class="fw-bold text-muted small mb-2" style="letter-spacing: 0.5px;">PASOS OPERATIVOS</label>
            <div>${stepsHTML}</div>
          </div>
        ` : ''}

        <!-- Documents -->
        <div class="mb-4">
          <label class="fw-bold text-muted small mb-2" style="letter-spacing: 0.5px;">DOCUMENTOS DE RESPALDO</label>
          <div class="d-flex flex-wrap mb-2" id="drawer-docs-container">
            ${docsHTML || '<p class="text-muted small mb-2" style="font-size: 11px;">Ningún documento cargado.</p>'}
          </div>
          <div class="d-flex gap-2 align-items-center mt-2">
            <input type="file" class="form-control form-control-sm rounded-3" id="drawer-file-input" style="font-size: 11px;">
            <button class="btn btn-outline-primary btn-sm rounded-3 btn-upload-doc-drawer" style="font-size: 11px; white-space: nowrap;">
              <i class="bi bi-cloud-upload"></i> Subir Archivo
            </button>
          </div>
        </div>

        <!-- Notes & Feedback -->
        <div class="mb-4">
          <label class="fw-bold text-muted small mb-2" style="letter-spacing: 0.5px;">NOTAS / FEEDBACK DE EJECUCIÓN</label>
          <textarea class="form-control w-100 rounded-3" id="drawer-feedback" rows="3" placeholder="Informes de avance, actas de acuerdos o comentarios...">${t.feedback || ''}</textarea>
        </div>
      </div>

      <!-- Action Box Footer (Decisiones Ejecutivas) -->
      <div class="task-drawer-footer d-flex flex-column gap-2">
        <div class="d-flex gap-2">
          ${t.estado === 'pendiente' ? `
            <button class="btn btn-primary rounded-3 w-100 d-flex align-items-center justify-content-center gap-2 py-2" id="btn-start-task" style="font-weight: 500;">
              <i class="bi bi-play-circle-fill"></i> Iniciar Trabajo
            </button>
          ` : ''}
          
          ${t.estado === 'en_progreso' ? `
            <button class="btn btn-outline-danger rounded-3 w-50 d-flex align-items-center justify-content-center gap-2 py-2" id="btn-block-task" style="font-weight: 500;">
              <i class="bi bi-slash-circle-fill"></i> Bloquear Tarea
            </button>
          ` : ''}
          
          ${t.estado === 'bloqueada' ? `
            <button class="btn btn-outline-success rounded-3 w-50 d-flex align-items-center justify-content-center gap-2 py-2" id="btn-unblock-task" style="font-weight: 500;">
              <i class="bi bi-check-circle-fill"></i> Reanudar
            </button>
          ` : ''}

          <button class="btn btn-success rounded-3 w-100 d-flex align-items-center justify-content-center gap-2 py-2" id="btn-drawer-complete" style="font-weight: 500;">
            <i class="bi bi-check-circle-fill"></i> Completar Tarea
          </button>
        </div>
        
        <button class="btn btn-outline-secondary btn-sm rounded-3 py-1" id="btn-drawer-save-feedback" style="font-size: 11px;">
          Guardar Comentarios y Notas
        </button>
      </div>
    `

    // --- Drawer Event Listeners ---

    // Close Drawer
    drawer.querySelector('#btn-close-drawer').addEventListener('click', closeDrawer)

    // Save Date Vencimiento
    drawer.querySelector('#btn-save-due').addEventListener('click', async () => {
      const dueVal = drawer.querySelector('#drawer-task-due').value
      const { error } = await actualizarTarea(t.id, { fecha_vencimiento: dueVal })
      if (!error) {
        alert('Fecha de vencimiento actualizada.')
        refreshTasksList()
      }
    })

    // Cycle Checklist inside drawer
    drawer.querySelectorAll('.step-cycle-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.idx)
        const currentItem = checklist[idx]
        const currentState = currentItem.estado || (currentItem.completado ? 'completada' : 'pendiente')
        
        let nextState = 'pendiente'
        if (currentState === 'pendiente') nextState = 'en_progreso'
        else if (currentState === 'en_progreso') nextState = 'completada'

        const updatedChecklist = [...checklist]
        updatedChecklist[idx].estado = nextState
        updatedChecklist[idx].completado = nextState === 'completada'

        const { error } = await actualizarTarea(t.id, { checklist: updatedChecklist })
        if (!error) {
          refreshTasksList()
        }
      })
    })

    // File upload inside drawer
    drawer.querySelector('.btn-upload-doc-drawer').addEventListener('click', async () => {
      const fileInput = drawer.querySelector('#drawer-file-input')
      if (!fileInput.files || fileInput.files.length === 0) {
        alert('Por favor, selecciona un archivo primero.')
        return
      }

      const file = fileInput.files[0]
      const mockUrl = `https://supabase-storage-url/documentos-soi/${Date.now()}_${file.name}`
      const newDoc = {
        nombre: file.name,
        url: mockUrl,
        fecha: new Date().toISOString()
      }

      const updatedDocs = [...docs, newDoc]
      const { error } = await actualizarTarea(t.id, { documentos_adjuntos: updatedDocs })
      if (!error) {
        alert('Documento cargado con éxito en la tarea.')
        refreshTasksList()
      }
    })

    // Remove document inside drawer
    drawer.querySelectorAll('.btn-remove-doc').forEach(btn => {
      btn.addEventListener('click', async () => {
        const dIdx = parseInt(btn.dataset.didx)
        const updatedDocs = docs.filter((_, idx) => idx !== dIdx)
        
        if (confirm(`¿Deseas desvincular el documento "${docs[dIdx].nombre}"?`)) {
          const { error } = await actualizarTarea(t.id, { documentos_adjuntos: updatedDocs })
          if (!error) {
            refreshTasksList()
          }
        }
      })
    })

    // Save notes/comments inside drawer
    drawer.querySelector('#btn-drawer-save-feedback').addEventListener('click', async () => {
      const feedback = drawer.querySelector('#drawer-feedback').value
      const { error } = await actualizarTarea(t.id, { feedback })
      if (!error) {
        alert('Comentarios y notas guardados.')
        refreshTasksList()
      }
    })

    // Iniciar Trabajo (Move to en_progreso)
    const btnStart = drawer.querySelector('#btn-start-task')
    if (btnStart) {
      btnStart.addEventListener('click', async () => {
        const { error } = await actualizarTarea(t.id, { estado: 'en_progreso' })
        if (!error) {
          refreshTasksList()
        }
      })
    }

    // Bloquear Tarea
    const btnBlock = drawer.querySelector('#btn-block-task')
    if (btnBlock) {
      btnBlock.addEventListener('click', async () => {
        const motivo = prompt('Por favor, ingresa el motivo del bloqueo:')
        if (motivo === null) return // Canceled
        if (!motivo.trim()) {
          alert('Debes ingresar un motivo para bloquear la tarea.')
          return
        }
        
        const currentFeedback = drawer.querySelector('#drawer-feedback').value
        const newFeedback = `BLOQUEADO: ${motivo}\n\n${currentFeedback}`
        
        const { error } = await actualizarTarea(t.id, { 
          estado: 'bloqueada', 
          feedback: newFeedback 
        })
        if (!error) {
          refreshTasksList()
        }
      })
    }

    // Reanudar Tarea (unblock back to en_progreso)
    const btnUnblock = drawer.querySelector('#btn-unblock-task')
    if (btnUnblock) {
      btnUnblock.addEventListener('click', async () => {
        const { error } = await actualizarTarea(t.id, { estado: 'en_progreso' })
        if (!error) {
          refreshTasksList()
        }
      })
    }

    // Completar Tarea
    drawer.querySelector('#btn-drawer-complete').addEventListener('click', async () => {
      const feedback = drawer.querySelector('#drawer-feedback').value
      const { error } = await actualizarTarea(t.id, { estado: 'completada', feedback })
      if (!error) {
        closeDrawer()
        refreshTasksList()
      }
    })
  }

  // Draw basic layout and render elements
  injectStyles()
  renderFrame()

  // Init fetch
  await refreshTasksList()

  // --- Attach Action Event Listeners ---

  // Department navigation tabs
  container.querySelector('#dept-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.dept-tab-btn')
    if (!tab) return
    container.querySelectorAll('.dept-tab-btn').forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    activeDept = tab.dataset.dept
    closeDrawer()
    populateWorkspace()
  }, { signal: _ac.signal })

  // Toggle Form Visibility
  const formCard = container.querySelector('#assignment-form-card')
  container.querySelector('#btn-toggle-form')?.addEventListener('click', () => {
    formCard.classList.toggle('d-none')
  }, { signal: _ac.signal })

  container.querySelector('#btn-close-form')?.addEventListener('click', () => formCard.classList.add('d-none'), { signal: _ac.signal })
  container.querySelector('#btn-cancel-form')?.addEventListener('click', () => formCard.classList.add('d-none'), { signal: _ac.signal })

  // Navigate back to calendar
  container.querySelector('#btn-view-calendar')?.addEventListener('click', () => {
    window.router?.navigate('hermes-calendario')
  }, { signal: _ac.signal })

  // Open Help Modal
  container.querySelector('#btn-info-hub')?.addEventListener('click', () => {
    const modalEl = container.querySelector('#hub-help-modal')
    if (modalEl && window.bootstrap) {
      const modal = new window.bootstrap.Modal(modalEl)
      modal.show()
    }
  }, { signal: _ac.signal })

  // Backdrop click closes Drawer
  container.querySelector('#task-drawer-backdrop')?.addEventListener('click', closeDrawer, { signal: _ac.signal })

  // Add step row to checklist builder inside form
  const stepsList = container.querySelector('#form-steps-list')
  container.querySelector('#btn-add-form-step')?.addEventListener('click', () => {
    const stepCount = stepsList.querySelectorAll('.form-step-row').length + 1
    const row = document.createElement('div')
    row.className = 'd-flex gap-2 form-step-row'
    row.innerHTML = `
      <input type="text" class="form-control form-control-sm rounded-3" placeholder="Paso #${stepCount}" required>
      <button type="button" class="btn btn-outline-danger btn-sm rounded-3 py-0 px-2 btn-remove-step"><i class="bi bi-trash"></i></button>
    `
    row.querySelector('.btn-remove-step').addEventListener('click', () => row.remove())
    stepsList.appendChild(row)
  }, { signal: _ac.signal })

  // Handle first row delete button
  stepsList.querySelector('.btn-remove-step').addEventListener('click', (e) => {
    e.currentTarget.closest('.form-step-row').remove()
  })

  // Submit task delegation form
  container.querySelector('#task-delegate-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const title = container.querySelector('#task-title').value
    const dept = container.querySelector('#task-dept').value
    const priority = container.querySelector('#task-priority').value
    const due = container.querySelector('#task-due').value
    const desc = container.querySelector('#task-desc').value

    // Read steps list
    const stepRows = stepsList.querySelectorAll('.form-step-row input')
    const checklist = Array.from(stepRows).map(inp => ({
      item: inp.value,
      estado: 'pendiente'
    }))

    const newTask = {
      titulo: title,
      departamento: dept,
      prioridad: priority,
      fecha_vencimiento: due,
      descripcion: desc,
      checklist,
      estado: 'pendiente',
      documentos_adjuntos: [],
      feedback: ''
    }

    const { error } = await crearTarea(newTask)
    if (!error) {
      alert('¡Tarea asignada con éxito!')
      formCard.classList.add('d-none')
      container.querySelector('#task-delegate-form').reset()
      
      // Reset steps builder list to single row
      stepsList.innerHTML = `
        <div class="d-flex gap-2 form-step-row">
          <input type="text" class="form-control form-control-sm rounded-3" placeholder="Paso #1" required>
          <button type="button" class="btn btn-outline-danger btn-sm rounded-3 py-0 px-2 btn-remove-step"><i class="bi bi-trash"></i></button>
        </div>
      `
      stepsList.querySelector('.btn-remove-step').addEventListener('click', (el) => el.currentTarget.closest('.form-step-row').remove())
      
      await refreshTasksList()
    } else {
      alert('Error delegando tarea: ' + error.message)
    }
  }, { signal: _ac.signal })

  return { teardown: () => _ac.abort() }
}
