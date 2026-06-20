import { 
  getNodeResources, 
  saveNodeResource, 
  deleteNodeResource,
  updateNode 
} from '../api/academicAdminApi.js'

/**
 * NodeResourceEditor: Editor dinámico para recursos de nodos educativos.
 * Sigue los principios de diseño de Apple: limpio, espaciado y funcional.
 */
export class NodeResourceEditor {
  constructor(container, options = {}) {
    this.container = container
    this.node = null
    this.resources = []
    this.onUpdate = options.onUpdate || (() => {})
    
    this._injectStyles()
    this.renderEmpty()
  }

  async setNode(node) {
    if (!node) {
      this.node = null
      this.resources = []
      this.renderEmpty()
      return
    }

    this.node = node
    this.renderLoading()
    
    try {
      this.resources = await getNodeResources(node.id)
      this.render()
    } catch (error) {
      console.error('Error loading resources:', error)
      this.renderError('No se pudieron cargar los recursos del nodo.')
    }
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="resource-editor-empty">
        <i class="bi bi-diagram-3"></i>
        <h3>Selecciona un nodo</h3>
        <p>Elige un elemento del árbol curricular para editar sus recursos y metadatos.</p>
      </div>
    `
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="resource-editor-loading">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Cargando recursos...</p>
      </div>
    `
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div class="resource-editor-error">
        <i class="bi bi-exclamation-triangle"></i>
        <p>${msg}</p>
        <button class="apple-btn apple-btn-secondary" id="retry-node-btn">Reintentar</button>
      </div>
    `
    this.container.querySelector('#retry-node-btn')?.addEventListener('click', () => this.setNode(this.node))
  }

  render() {
    const isNode = this.node.type === 'node'
    const isIndicator = this.node.type === 'indicator'
    
    this.container.innerHTML = `
      <div class="resource-editor">
        <header class="resource-header">
          <div class="header-main">
            <span class="node-badge">${this.node.type.toUpperCase()}</span>
            <h1>${this.node.name || this.node.description || 'Sin título'}</h1>
          </div>
          <p class="node-id">ID: ${this.node.id}</p>
        </header>

        <section class="editor-section">
          <div class="section-header">
            <h2>Metadatos</h2>
          </div>
          <div class="apple-card">
            <div class="form-group mb-3">
              <label class="apple-label">Nombre / Descripción</label>
              <input type="text" class="apple-input" id="node-name" value="${this.node.name || this.node.description || ''}">
            </div>
            ${isNode ? `
              <div class="form-check form-switch apple-switch">
                <input class="form-check-input" type="checkbox" id="node-critical" ${this.node.is_critical ? 'checked' : ''}>
                <label class="form-check-label" for="node-critical">Marcar como Punto Crítico (FUEGO)</label>
              </div>
            ` : ''}
            <div class="mt-3 text-end">
              <button class="apple-btn apple-btn-primary" id="save-node-metadata">Guardar Cambios</button>
            </div>
          </div>
        </section>

        ${isNode || isIndicator ? `
          <section class="editor-section">
            <div class="section-header">
              <h2>Recursos Educativos</h2>
              <button class="apple-btn apple-btn-secondary btn-sm" id="add-resource-btn">
                <i class="bi bi-plus-lg"></i> Añadir Recurso
              </button>
            </div>
            <div class="resources-list" id="resources-list">
              ${this.resources.length === 0 ? `
                <div class="empty-list-placeholder">No hay recursos asociados a este nodo.</div>
              ` : this.resources.map(res => this._renderResourceCard(res)).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `

    this._bindEvents()
  }

  _renderResourceCard(res) {
    const icons = {
      video: 'bi-play-circle-fill',
      pdf: 'bi-file-earmark-pdf-fill',
      exercise_text: 'bi-pencil-square',
      link: 'bi-link-45deg'
    }

    return `
      <div class="apple-card resource-card" data-id="${res.id}">
        <div class="resource-card-icon ${res.resource_type}">
          <i class="bi ${icons[res.resource_type] || 'bi-file-earmark'}"></i>
        </div>
        <div class="resource-card-content">
          <div class="resource-card-info">
            <h3>${res.title}</h3>
            <span class="resource-type-tag">${res.resource_type}</span>
          </div>
          <p class="resource-card-url">${res.url || 'Sin URL'}</p>
        </div>
        <div class="resource-card-actions">
          <button class="icon-btn edit-res" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="icon-btn delete-res" title="Eliminar"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `
  }

  _bindEvents() {
    // Guardar Metadatos
    this.container.querySelector('#save-node-metadata')?.addEventListener('click', async () => {
      const name = this.container.querySelector('#node-name').value
      const isCritical = this.container.querySelector('#node-critical')?.checked
      
      const btn = this.container.querySelector('#save-node-metadata')
      btn.disabled = true
      btn.textContent = 'Guardando...'

      try {
        const updates = { name: name }
        if (this.node.type === 'node') updates.is_critical = isCritical
        if (this.node.type === 'indicator') updates.description = name
        
        await updateNode(this.node.id, updates)
        Object.assign(this.node, updates)
        this.onUpdate(this.node)
        this.render()
      } catch (err) {
        alert('Error al guardar: ' + err.message)
      } finally {
        btn.disabled = false
        btn.textContent = 'Guardar Cambios'
      }
    })

    // Añadir Recurso
    this.container.querySelector('#add-resource-btn')?.addEventListener('click', () => {
      this._showResourceModal()
    })

    // Acciones de Recursos
    this.container.querySelectorAll('.edit-res').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.resource-card').dataset.id
        const res = this.resources.find(r => r.id === id)
        this._showResourceModal(res)
      })
    })

    this.container.querySelectorAll('.delete-res').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('.resource-card').dataset.id
        if (confirm('¿Estás seguro de que deseas eliminar este recurso?')) {
          try {
            await deleteNodeResource(id)
            this.resources = this.resources.filter(r => r.id !== id)
            this.render()
          } catch (err) {
            alert('Error al eliminar: ' + err.message)
          }
        }
      })
    })
  }

  _showResourceModal(resource = null) {
    const isEdit = !!resource
    const modalId = 'resourceModal'
    let modalEl = document.getElementById(modalId)
    
    if (modalEl) modalEl.remove()
    
    const types = [
      { id: 'video', label: 'Video (YouTube/Vimeo)', icon: 'bi-play-circle' },
      { id: 'pdf', label: 'Documento PDF', icon: 'bi-file-earmark-pdf' },
      { id: 'exercise_text', label: 'Ejercicio (Markdown)', icon: 'bi-pencil-square' },
      { id: 'link', label: 'Enlace Externo', icon: 'bi-link-45deg' }
    ]

    modalEl = document.createElement('div')
    modalEl.id = modalId
    modalEl.className = 'modal fade apple-modal'
    modalEl.tabIndex = -1
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${isEdit ? 'Editar Recurso' : 'Nuevo Recurso'}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="resource-form">
              <div class="form-group mb-3">
                <label class="apple-label">Tipo de Recurso</label>
                <div class="resource-type-selector">
                  ${types.map(t => `
                    <label class="type-option ${resource?.resource_type === t.id ? 'active' : (!resource && t.id === 'video' ? 'active' : '')}">
                      <input type="radio" name="resource_type" value="${t.id}" ${resource?.resource_type === t.id ? 'checked' : (!resource && t.id === 'video' ? 'checked' : '')}>
                      <i class="bi ${t.icon}"></i>
                      <span>${t.id.split('_')[0]}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">Título</label>
                <input type="text" class="apple-input" name="title" value="${resource?.title || ''}" required placeholder="Ej: Video Introductorio">
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">URL / Link</label>
                <input type="url" class="apple-input" name="url" value="${resource?.url || ''}" placeholder="https://...">
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">Contenido / Instrucciones</label>
                <textarea class="apple-input" name="content" rows="4" placeholder="Contenido o instrucciones para ejercicios...">${resource?.content || ''}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="apple-btn apple-btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="apple-btn apple-btn-primary" id="save-resource-confirm-btn">${isEdit ? 'Actualizar' : 'Crear Recurso'}</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modalEl)
    
    const bootstrapModal = new bootstrap.Modal(modalEl)
    bootstrapModal.show()

    // Radio button behavior
    modalEl.querySelectorAll('.type-option').forEach(opt => {
      opt.addEventListener('click', () => {
        modalEl.querySelectorAll('.type-option').forEach(o => o.classList.remove('active'))
        opt.classList.add('active')
      })
    })

    modalEl.querySelector('#save-resource-confirm-btn').addEventListener('click', async () => {
      const form = modalEl.querySelector('#resource-form')
      const formData = new FormData(form)
      
      const resData = {
        node_id: this.node.id,
        resource_type: formData.get('resource_type'),
        title: formData.get('title'),
        url: formData.get('url'),
        content: formData.get('content'),
        order_index: resource?.order_index || this.resources.length
      }

      if (isEdit) resData.id = resource.id

      if (!resData.title) {
        alert('El título es obligatorio')
        return
      }

      try {
        const saved = await saveNodeResource(resData)
        if (isEdit) {
          const idx = this.resources.findIndex(r => r.id === saved.id)
          this.resources[idx] = saved
        } else {
          this.resources.push(saved)
        }
        this.render()
        bootstrapModal.hide()
      } catch (err) {
        alert('Error al guardar recurso: ' + err.message)
      }
    })
  }

  _injectStyles() {
    if (document.getElementById('resource-editor-styles')) return

    const styleEl = document.createElement('style')
    styleEl.id = 'resource-editor-styles'
    styleEl.textContent = `
      .resource-editor {
        padding: 32px;
        max-width: 900px;
        margin: 0 auto;
        animation: fadeIn 0.3s ease;
      }
      .resource-header {
        margin-bottom: 40px;
      }
      .header-main {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      .node-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 4px 8px;
        background: var(--apple-primary, #0066cc);
        color: #fff;
        border-radius: 6px;
        letter-spacing: 0.05em;
      }
      .resource-header h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .node-id {
        font-size: 12px;
        color: var(--apple-ink-muted-48, #86868b);
      }
      
      .editor-section {
        margin-bottom: 48px;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .section-header h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }

      /* Apple Cards */
      .apple-card {
        background: var(--apple-background, #fff);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      [data-bs-theme="dark"] .apple-card {
        background: #1c1c1e;
        border: 1px solid rgba(255,255,255,0.05);
      }

      /* Form Elements */
      .apple-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--apple-ink-muted-64, #515154);
        margin-bottom: 8px;
        display: block;
      }
      .apple-input {
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid var(--apple-parchment-dark, #d2d2d7);
        background: var(--apple-parchment-light, #fbfbfd);
        font-size: 15px;
        transition: all 0.2s ease;
      }
      .apple-input:focus {
        outline: none;
        border-color: var(--apple-primary, #0066cc);
        box-shadow: 0 0 0 4px rgba(0,102,204,0.1);
      }
      [data-bs-theme="dark"] .apple-input {
        background: #2c2c2e;
        border-color: #3a3a3c;
        color: #fff;
      }

      .apple-btn {
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
      }
      .apple-btn-primary {
        background: var(--apple-primary, #0066cc);
        color: #fff;
      }
      .apple-btn-primary:hover {
        background: #0077ed;
      }
      .apple-btn-secondary {
        background: var(--apple-parchment, #f5f5f7);
        color: var(--apple-primary, #0066cc);
      }
      .apple-btn-secondary:hover {
        background: #e8e8ed;
      }
      
      /* Resources List */
      .resources-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .resource-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
      }
      .resource-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      }
      .resource-card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      .resource-card-icon.video { background: #e3f2fd; color: #1976d2; }
      .resource-card-icon.pdf { background: #fbe9e7; color: #d84315; }
      .resource-card-icon.exercise_text { background: #f3e5f5; color: #7b1fa2; }
      .resource-card-icon.link { background: #e8f5e9; color: #2e7d32; }

      .resource-card-content {
        flex: 1;
        min-width: 0;
      }
      .resource-card-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
      }
      .resource-card-info h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .resource-type-tag {
        font-size: 10px;
        text-transform: uppercase;
        padding: 2px 6px;
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
        color: #666;
      }
      .resource-card-url {
        font-size: 13px;
        color: var(--apple-ink-muted-48, #86868b);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .resource-card-actions {
        display: flex;
        gap: 8px;
      }
      .icon-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--apple-ink-muted-48, #86868b);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-btn:hover {
        background: rgba(0,0,0,0.05);
        color: var(--apple-ink, #1d1d1f);
      }
      .icon-btn.danger:hover {
        color: #ff3b30;
        background: #fff5f5;
      }

      /* Modal Specifics */
      .resource-type-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .type-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border-radius: 12px;
        border: 2px solid transparent;
        background: var(--apple-parchment, #f5f5f7);
        cursor: pointer;
        transition: all 0.2s;
      }
      .type-option input { display: none; }
      .type-option i { font-size: 20px; margin-bottom: 4px; }
      .type-option span { font-size: 12px; font-weight: 500; }
      .type-option.active {
        border-color: var(--apple-primary, #0066cc);
        background: #fff;
      }

      /* Placeholders */
      .resource-editor-empty, .resource-editor-loading, .resource-editor-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        padding: 40px;
        color: var(--apple-ink-muted-48, #86868b);
      }
      .resource-editor-empty i { font-size: 64px; margin-bottom: 16px; opacity: 0.2; }
      .empty-list-placeholder {
        padding: 40px;
        text-align: center;
        border: 2px dashed var(--apple-parchment-dark, #d2d2d7);
        border-radius: 18px;
        color: var(--apple-ink-muted-48, #86868b);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(styleEl)
  }
}
