import { TreeView } from '../components/TreeView.js'
import { NodeResourceEditor } from '../components/NodeResourceEditor.js'
import { getRoutes, getRouteVersions, getAcademicTree } from '../api/academicAdminApi.js'

/**
 * academicAdminView: Vista principal de Gestión Curricular.
 * Integra TreeView y NodeResourceEditor en un layout de dos columnas.
 */
export async function renderAcademicAdminView(container) {
  // Inyectar Estilos de Layout
  _injectLayoutStyles()
  
  container.innerHTML = `
    <div class="admin-view-container">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h1>Mapa Curricular</h1>
          <div class="version-selector-container">
            <select id="route-selector" class="apple-select mb-2">
              <option value="">Seleccionar Ruta...</option>
            </select>
            <select id="version-selector" class="apple-select" disabled>
              <option value="">Versión...</option>
            </select>
          </div>
        </div>
        <div id="tree-container" class="tree-viewport">
          <div class="tree-placeholder">
            <i class="bi bi-arrow-up-circle"></i>
            <p>Selecciona una ruta y versión para comenzar.</p>
          </div>
        </div>
      </div>
      <div class="admin-detail-panel" id="detail-container">
        <!-- NodeResourceEditor se renderiza aquí -->
      </div>
    </div>
  `

  const treeContainer = container.querySelector('#tree-container')
  const detailContainer = container.querySelector('#detail-container')
  const routeSelector = container.querySelector('#route-selector')
  const versionSelector = container.querySelector('#version-selector')

  // Inicializar Componentes
  const resourceEditor = new NodeResourceEditor(detailContainer, {
    onUpdate: (updatedNode) => {
      // Opcional: Refrescar nombre en el árbol si es necesario
      console.log('Node updated:', updatedNode)
    }
  })

  const treeView = new TreeView(treeContainer, {
    onSelect: (node) => {
      resourceEditor.setNode(node)
    }
  })

  // Cargar Rutas
  try {
    const routes = await getRoutes()
    routes.forEach(r => {
      const opt = document.createElement('option')
      opt.value = r.id
      opt.textContent = r.name
      routeSelector.appendChild(opt)
    })
  } catch (err) {
    console.error('Error loading routes:', err)
  }

  // Evento: Cambio de Ruta
  routeSelector.addEventListener('change', async () => {
    const routeId = routeSelector.value
    versionSelector.innerHTML = '<option value="">Versión...</option>'
    versionSelector.disabled = true
    treeContainer.innerHTML = '<div class="tree-placeholder"><p>Cargando versiones...</p></div>'

    if (!routeId) {
      treeContainer.innerHTML = '<div class="tree-placeholder"><p>Selecciona una ruta para comenzar.</p></div>'
      return
    }

    try {
      const versions = await getRouteVersions(routeId)
      versions.forEach(v => {
        const opt = document.createElement('option')
        opt.value = v.id
        opt.textContent = `V${v.version_number} - ${new Date(v.created_at).toLocaleDateString()}`
        versionSelector.appendChild(opt)
      })
      versionSelector.disabled = false
      treeContainer.innerHTML = '<div class="tree-placeholder"><p>Selecciona una versión.</p></div>'
    } catch (err) {
      treeContainer.innerHTML = '<div class="tree-placeholder text-danger"><p>Error al cargar versiones.</p></div>'
    }
  })

  // Evento: Cambio de Versión (Cargar Árbol)
  versionSelector.addEventListener('change', async () => {
    const versionId = versionSelector.value
    if (!versionId) return

    treeContainer.innerHTML = `
      <div class="tree-loading">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Construyendo mapa curricular...</span>
      </div>
    `

    try {
      const treeData = await getAcademicTree(versionId)
      treeView.setData(treeData)
    } catch (err) {
      treeContainer.innerHTML = '<div class="tree-placeholder text-danger"><p>Error al cargar el árbol curricular.</p></div>'
    }
  })
}

function _injectLayoutStyles() {
  if (document.getElementById('academic-admin-layout-styles')) return

  const styleEl = document.createElement('style')
  styleEl.id = 'academic-admin-layout-styles'
  styleEl.textContent = `
    .admin-view-container {
      display: flex;
      height: 100vh;
      width: 100%;
      background: var(--apple-parchment-light, #fbfbfd);
      overflow: hidden;
    }

    .admin-sidebar {
      width: 350px;
      min-width: 350px;
      background: #fff;
      border-right: 1px solid rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      z-index: 10;
    }
    [data-bs-theme="dark"] .admin-sidebar {
      background: #1c1c1e;
      border-right: 1px solid rgba(255,255,255,0.08);
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .sidebar-header h1 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }

    .apple-select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--apple-parchment-dark, #d2d2d7);
      background: var(--apple-parchment, #f5f5f7);
      font-size: 14px;
      font-weight: 500;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2386868b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      cursor: pointer;
    }
    [data-bs-theme="dark"] .apple-select {
      background-color: #2c2c2e;
      border-color: #3a3a3c;
      color: #fff;
    }

    .tree-viewport {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 40px;
    }

    .admin-detail-panel {
      flex: 1;
      overflow-y: auto;
      background: var(--apple-parchment-light, #fbfbfd);
    }
    [data-bs-theme="dark"] .admin-detail-panel {
      background: #000;
    }

    .tree-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      text-align: center;
      padding: 20px;
      color: #86868b;
    }
    .tree-placeholder i { font-size: 32px; margin-bottom: 12px; opacity: 0.3; }
    .tree-placeholder p { font-size: 13px; margin: 0; }

    .tree-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 40px;
      font-size: 13px;
      color: #0066cc;
    }

    /* Ocultar scrollbar pero mantener scroll */
    .tree-viewport::-webkit-scrollbar { width: 6px; }
    .tree-viewport::-webkit-scrollbar-track { background: transparent; }
    .tree-viewport::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
    [data-bs-theme="dark"] .tree-viewport::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
  `
  document.head.appendChild(styleEl)
}
