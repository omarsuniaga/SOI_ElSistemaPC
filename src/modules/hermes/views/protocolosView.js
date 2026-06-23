import { obtenerProtocolos, actualizarProtocolo, crearProtocolo } from '../api/hermesApi.js'

export async function renderProtocolosView(container) {
  const _ac = new AbortController()

  // Base state
  let protocols = []
  let selectedProtoId = null

  const renderFrame = () => {
    container.innerHTML = `
      <div class="container-fluid p-4" style="animation: fadeIn 0.4s ease;">
        <!-- Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 class="fw-bold mb-1" style="color: var(--apple-ink); letter-spacing: -0.5px;">
              ⚙️ Motor de Protocolos Hermes
            </h3>
            <p class="text-muted small mb-0">Configura la matriz de tareas automatizadas que el cerebro Hermes delegará para cada categoría de evento.</p>
          </div>
          <div class="d-flex gap-2">
            <button id="btn-add-protocol" class="btn btn-outline-primary rounded-3 d-flex align-items-center gap-2" style="font-weight: 500;">
              <i class="bi bi-plus-circle"></i> Nuevo Protocolo
            </button>
            <button id="btn-back-calendar" class="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2" style="font-weight: 500;">
              <i class="bi bi-calendar3"></i> Volver
            </button>
          </div>
        </div>

        <div class="row g-4">
          <!-- Left Column: Protocol List -->
          <div class="col-lg-4">
            <div class="card shadow-sm border-0 p-4 h-100" style="border-radius: 16px; background: var(--apple-canvas);">
              <h5 class="fw-bold mb-3" style="color: var(--apple-ink);">Protocolos Activos</h5>
              <div class="d-flex flex-column gap-2" id="protocol-list-container">
                <p class="text-muted small">Cargando...</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Protocol Editor -->
          <div class="col-lg-8">
            <div class="card shadow-sm border-0 p-4" style="border-radius: 16px; background: var(--apple-canvas);" id="editor-card">
              <div class="text-center py-5 text-muted small" id="no-proto-selected">
                <i class="bi bi-gear-wide-connected fs-1 mb-2 text-primary" style="opacity: 0.6;"></i>
                <div>Selecciona un protocolo de la izquierda o crea uno nuevo para configurar sus automatizaciones.</div>
              </div>

              <!-- Main Editor (Initially hidden) -->
              <div class="d-none" id="protocol-editor-workspace">
                <form id="protocol-editor-form">
                  <!-- Header details -->
                  <div class="row g-2 mb-3">
                    <div class="col-md-7">
                      <label class="form-label small fw-semibold text-muted">Nombre del Protocolo</label>
                      <input type="text" class="form-control rounded-3" id="proto-name" required>
                    </div>
                    <div class="col-md-5">
                      <label class="form-label small fw-semibold text-muted">Categoría del Evento</label>
                      <input type="text" class="form-control rounded-3 bg-light" id="proto-category" readonly>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Descripción Operativa</label>
                    <textarea class="form-control rounded-3" id="proto-desc" rows="2"></textarea>
                  </div>

                  <div class="form-check form-switch mb-4">
                    <input class="form-check-input" type="checkbox" id="proto-active">
                    <label class="form-check-label small fw-semibold text-dark" for="proto-active">Protocolo Activo (Ejecutar en eventos nuevos)</label>
                  </div>

                  <!-- Template tasks builder -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="fw-bold mb-0 text-dark">📋 Plantilla de Tareas Automatizadas</h6>
                      <button type="button" class="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1" id="btn-add-template-task">
                        <i class="bi bi-plus-lg"></i> Agregar Tarea
                      </button>
                    </div>

                    <div class="d-flex flex-column gap-3" id="template-tasks-container">
                      <!-- Dynamic task builder entries -->
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 border-top pt-3">
                    <button type="submit" class="btn btn-primary rounded-3 px-4">Guardar Cambios del Protocolo</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Styles Injection
  const injectStyles = () => {
    const styleId = 'hermes-protocols-styles'
    if (document.getElementById(styleId)) return
    const style = document.createElement('style')
    style.id = styleId
    style.innerHTML = `
      .protocol-item-btn {
        text-align: left;
        border: 1px solid var(--apple-hairline);
        border-radius: 12px;
        padding: 12px;
        background: var(--apple-canvas);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .protocol-item-btn:hover {
        border-color: var(--apple-primary);
        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
      }
      .protocol-item-btn.active {
        border-color: var(--apple-primary);
        background: var(--apple-accent-bg);
      }
      .template-task-builder-card {
        border: 1px solid var(--apple-hairline);
        border-radius: 12px;
        padding: 14px;
        background: var(--apple-parchment);
        position: relative;
      }
      .btn-delete-task-template {
        position: absolute;
        top: 14px;
        right: 14px;
        color: #ff2d55;
        background: transparent;
        border: none;
        cursor: pointer;
      }
    `
    document.head.appendChild(style)
  }

  // Load Protocols list
  const loadProtocolsList = async () => {
    const { data, error } = await obtenerProtocolos()
    if (!error) {
      protocols = data || []
      populateList()
    }
  }

  // Populate left side list
  const populateList = () => {
    const containerEl = container.querySelector('#protocol-list-container')
    if (!containerEl) return
    containerEl.innerHTML = ''

    if (protocols.length === 0) {
      containerEl.innerHTML = `<p class="text-muted small text-center my-3">No hay protocolos configurados.</p>`
      return
    }

    protocols.forEach(p => {
      const activeText = p.activo ? 'Activo' : 'Inactivo'
      const activeColor = p.activo ? 'bg-success' : 'bg-secondary'
      const btn = document.createElement('button')
      btn.className = `protocol-item-btn d-flex flex-column gap-1 ${p.id === selectedProtoId ? 'active' : ''}`
      btn.innerHTML = `
        <div class="d-flex justify-content-between w-100 align-items-center">
          <strong class="text-dark small">${p.nombre_protocolo}</strong>
          <span class="badge ${activeColor} small" style="font-size: 8px;">${activeText}</span>
        </div>
        <span class="text-muted small" style="font-size: 10px; font-weight: 500;">
          Categoría: <span class="badge bg-light text-dark text-uppercase border">${p.categoria_evento}</span>
        </span>
        <span class="text-muted small text-truncate w-100" style="font-size: 11px;">${p.descripcion || 'Sin descripción.'}</span>
      `
      btn.addEventListener('click', () => {
        selectedProtoId = p.id
        populateList()
        openProtocolEditor(p)
      })

      containerEl.appendChild(btn)
    })
  }

  // Show selected protocol details in builder form
  const openProtocolEditor = (proto) => {
    const workspace = container.querySelector('#protocol-editor-workspace')
    const placeholder = container.querySelector('#no-proto-selected')
    if (!workspace || !placeholder) return

    placeholder.classList.add('d-none')
    workspace.classList.remove('d-none')

    // Pop inputs
    workspace.querySelector('#proto-name').value = proto.nombre_protocolo
    workspace.querySelector('#proto-category').value = proto.categoria_evento.toUpperCase()
    workspace.querySelector('#proto-desc').value = proto.descripcion || ''
    workspace.querySelector('#proto-active').checked = proto.activo

    // Build task items
    const tasksContainer = workspace.querySelector('#template-tasks-container')
    tasksContainer.innerHTML = ''

    const tasksTemplate = proto.tareas_plantilla || []
    tasksTemplate.forEach((t, idx) => {
      addTaskTemplateCard(tasksContainer, t, idx)
    })
  }

  // Draw a card for one task in the protocol template
  const addTaskTemplateCard = (containerEl, task = {}, index) => {
    const card = document.createElement('div')
    card.className = 'template-task-builder-card'
    card.dataset.index = index

    const deptOptions = ['ACM', 'DIR', 'FIN', 'LOG', 'COM', 'TECNICO'].map(d => 
      `<option value="${d}" ${task.departamento === d ? 'selected' : ''}>${d}</option>`
    ).join('')

    const priorityOptions = ['baja', 'media', 'alta', 'critica'].map(p => 
      `<option value="${p}" ${task.prioridad === p ? 'selected' : ''}>${p === 'critica' ? 'Crítica' : p.charAt(0).toUpperCase() + p.slice(1)}</option>`
    ).join('')

    // Checklist text serialization
    const checklistText = task.checklist ? task.checklist.map(c => c.item).join('\n') : ''

    card.innerHTML = `
      <button type="button" class="btn-delete-task-template"><i class="bi bi-trash-fill"></i></button>
      
      <div class="row g-2 mb-3">
        <div class="col-md-8">
          <label class="form-label small fw-semibold text-muted">Título de la Tarea (Soporta variable {evento_titulo})</label>
          <input type="text" class="form-control form-control-sm rounded-3 task-title-input" value="${task.titulo || ''}" required placeholder="Ej: Definir repertorio para {evento_titulo}">
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-semibold text-muted">Diferencia Días (Vencimiento)</label>
          <input type="number" class="form-control form-control-sm rounded-3 task-offset-input" value="${task.diferencia_dias || 0}" required placeholder="Ej: -7 para antes, +1 para después">
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6">
          <label class="form-label small fw-semibold text-muted">Dpto. Asignado</label>
          <select class="form-select form-select-sm rounded-3 task-dept-input" required>
            ${deptOptions}
          </select>
        </div>
        <div class="col-6">
          <label class="form-label small fw-semibold text-muted">Prioridad</label>
          <select class="form-select form-select-sm rounded-3 task-priority-input" required>
            ${priorityOptions}
          </select>
        </div>
      </div>

      <div class="row g-2">
        <div class="col-md-6">
          <label class="form-label small fw-semibold text-muted">Instrucciones / Descripción</label>
          <textarea class="form-control form-control-sm rounded-3 task-desc-input" rows="3" placeholder="Pasos que debe seguir el departamento...">${task.descripcion || ''}</textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold text-muted">Checklist de Protocolo (Un ítem por renglón)</label>
          <textarea class="form-control form-control-sm rounded-3 task-checklist-input" rows="3" placeholder="Paso 1\nPaso 2\nPaso 3">${checklistText}</textarea>
        </div>
      </div>
    `

    // Remove task template listener
    card.querySelector('.btn-delete-task-template').addEventListener('click', () => {
      card.remove()
    })

    containerEl.appendChild(card)
  }

  // Draw frame
  injectStyles()
  renderFrame()

  // Init Data load
  await loadProtocolsList()

  // --- Attach Action Listeners ---
  // Return to calendar
  container.querySelector('#btn-back-calendar')?.addEventListener('click', () => {
    window.router?.navigate('hermes-calendario')
  }, { signal: _ac.signal })

  // Add template task to the editor
  container.querySelector('#btn-add-template-task')?.addEventListener('click', () => {
    const tasksContainer = container.querySelector('#template-tasks-container')
    if (tasksContainer) {
      addTaskTemplateCard(tasksContainer, { diferencia_dias: 0, departamento: 'ACM', prioridad: 'media' }, Date.now())
    }
  }, { signal: _ac.signal })

  // Submit protocol editor form
  container.querySelector('#protocol-editor-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const workspace = container.querySelector('#protocol-editor-workspace')
    const name = workspace.querySelector('#proto-name').value
    const desc = workspace.querySelector('#proto-desc').value
    const active = workspace.querySelector('#proto-active').checked

    // Extract template tasks
    const taskCards = workspace.querySelectorAll('.template-task-builder-card')
    const updatedTemplates = Array.from(taskCards).map(card => {
      const title = card.querySelector('.task-title-input').value
      const offset = parseInt(card.querySelector('.task-offset-input').value)
      const dept = card.querySelector('.task-dept-input').value
      const priority = card.querySelector('.task-priority-input').value
      const desc = card.querySelector('.task-desc-input').value
      const checklistRaw = card.querySelector('.task-checklist-input').value
      
      const checklist = checklistRaw.split('\n')
        .map(x => x.trim())
        .filter(x => x.length > 0)
        .map(x => ({ item: x, completado: false }))

      return {
        titulo: title,
        diferencia_dias: offset,
        departamento: dept,
        prioridad: priority,
        descripcion: desc,
        checklist
      }
    })

    const updatedProto = {
      nombre_protocolo: name,
      descripcion: desc,
      activo: active,
      tareas_plantilla: updatedTemplates
    }

    const { error } = await actualizarProtocolo(selectedProtoId, updatedProto)
    if (!error) {
      alert('¡Protocolo Hermes actualizado con éxito!')
      await loadProtocolsList()
    } else {
      alert('Error al actualizar protocolo: ' + error.message)
    }
  }, { signal: _ac.signal })

  // Trigger Add Protocol Dialog
  container.querySelector('#btn-add-protocol')?.addEventListener('click', async () => {
    const category = prompt('Ingresa la categoría para el nuevo protocolo (concierto, ensayo, reunion, patrocinio, pago, corte, inscripcion, auditoria):')
    if (!category) return
    
    const formattedCat = category.toLowerCase().trim()
    const validCats = ['concierto', 'ensayo', 'reunion', 'patrocinio', 'pago', 'corte', 'inscripcion', 'auditoria', 'otro']
    if (!validCats.includes(formattedCat)) {
      alert('Categoría inválida. Elige una de: ' + validCats.join(', '))
      return
    }

    // Check if protocol already exists for this category
    if (protocols.some(p => p.categoria_evento === formattedCat)) {
      alert('Ya existe un protocolo para esta categoría de evento. Modifica el protocolo existente.')
      return
    }

    const name = prompt('Nombre para el protocolo (Ej: Protocolo de ' + category.charAt(0).toUpperCase() + category.slice(1) + '):')
    if (!name) return

    const newProtoPayload = {
      categoria_evento: formattedCat,
      nombre_protocolo: name,
      descripcion: `Automatizaciones auto-delegadas para eventos de tipo ${formattedCat}.`,
      activo: true,
      tareas_plantilla: []
    }

    const { data, error } = await crearProtocolo(newProtoPayload)
    if (!error) {
      selectedProtoId = data.id
      await loadProtocolsList()
      openProtocolEditor(data)
    } else {
      alert('Error al crear protocolo: ' + error.message)
    }
  }, { signal: _ac.signal })

  return { teardown: () => _ac.abort() }
}
