// ============================================================================
// COMPACT UI SYSTEM - Sistema de Diseño Compacto para Bootstrap
// ============================================================================
// Uso: Aplica классы these utilities para crear interfaces densas y profesionales
// ============================================================================

export const CompactUI = {
  // Configuración global
  config: {
    fontSizeBase: '0.8rem',
    fontSizeSmall: '0.7rem',
    paddingX: '0.5rem',
    paddingY: '0.35rem',
    gap: '0.35rem',
  },

  // Clases CSS compiladas como template literals
  styles: `
    /* Compact Tables */
    .table-compact {
      font-size: 0.8rem;
      --bs-table-hover-bg: var(--bs-primary-bg-subtle);
    }
    .table-compact th {
      font-size: 0.7rem;
      padding: 0.4rem 0.5rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table-compact td {
      padding: 0.4rem 0.5rem;
      vertical-align: middle;
    }
    .table-compact .form-control,
    .table-compact .form-select {
      font-size: 0.8rem;
      padding: 0.3rem 0.5rem;
    }

    /* Compact Cards Grid */
    .compact-grid {
      display: grid;
      gap: 0.5rem;
    }
    .compact-card {
      font-size: 0.8rem;
      padding: 0.5rem;
      transition: all 0.15s ease;
    }
    .compact-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* Compact Buttons */
    .btn-compact {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      line-height: 1.3;
    }
    .btn-compact i {
      font-size: 0.85rem;
    }
    .btn-icon-sm {
      width: 28px;
      height: 28px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Compact Badges */
    .badge-compact {
      font-size: 0.65rem;
      padding: 0.2rem 0.4rem;
      font-weight: 500;
    }

    /* Dense Inputs */
    .input-dense {
      font-size: 0.8rem;
      padding: 0.35rem 0.5rem;
    }
    .input-dense-sm {
      font-size: 0.75rem;
      padding: 0.25rem 0.4rem;
    }

    /* Toolbar Compact */
    .toolbar-dense {
      gap: 0.5rem;
      padding: 0.5rem;
      background: var(--bs-body-bg);
      border-radius: 0.375rem;
      border: 1px solid var(--bs-border-color);
    }

    /* Status Dots */
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-dot.active { background: #198754; }
    .status-dot.inactive { background: #6c757d; }
    .status-dot.pending { background: #ffc107; }
    .status-dot.error { background: #dc3545; }

    /* Avatar Compact */
    .avatar-compact {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
    }

    /* Info Row Compact */
    .info-row {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
    }
    .info-row-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .info-row-item i {
      font-size: 0.85rem;
      opacity: 0.7;
    }

    /* Quick Actions Bar */
    .quick-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.15s;
    }
    tr:hover .quick-actions {
      opacity: 1;
    }

    /* Search Bar */
    .search-bar {
      position: relative;
    }
    .search-bar i {
      position: absolute;
      left: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
      opacity: 0.5;
    }
    .search-bar input {
      padding-left: 2rem;
    }

    /* Stats Card */
    .stat-mini {
      text-align: center;
      padding: 0.5rem;
      border-radius: 0.375rem;
      background: var(--bs-body-bg);
      border: 1px solid var(--bs-border-color);
    }
    .stat-mini .value {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
    }
    .stat-mini .label {
      font-size: 0.65rem;
      opacity: 0.7;
      text-transform: uppercase;
    }

    /* Scrollable Table Container */
    .table-scroll-container {
      max-height: calc(100vh - 250px);
      overflow-y: auto;
    }

    /* Modal Compact */
    .modal-compact .modal-body {
      padding: 1rem;
    }
    .modal-compact .modal-header,
    .modal-compact .modal-footer {
      padding: 0.75rem 1rem;
    }

    /* Form Labels */
    .form-label-compact {
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    /* Truncate Text */
    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,

  // Injectar estilos en el documento
  injectStyles() {
    if (document.getElementById('compact-ui-styles')) return
    const style = document.createElement('style')
    style.id = 'compact-ui-styles'
    style.textContent = this.styles
    document.head.appendChild(style)
  },

  // Templates reutilizables
  templates: {
    // Fila de stats para dashboard
    statCard(label, value, icon, color = 'primary') {
      return `
        <div class="stat-mini">
          <div class="value text-${color}">${value}</div>
          <div class="label">${label}</div>
        </div>
      `
    },

    // Toolbar de búsqueda
    searchToolbar(placeholder = 'Buscar...') {
      return `
        <div class="toolbar-dense d-flex flex-wrap align-items-center">
          <div class="search-bar flex-grow-1" style="min-width: 200px; max-width: 400px;">
            <i class="bi bi-search"></i>
            <input type="text" class="form-control input-dense" placeholder="${placeholder}" id="searchInput">
          </div>
          <div id="filtersContainer"></div>
          <button class="btn btn-primary btn-compact" id="btnNew">
            <i class="bi bi-plus-lg"></i> Nuevo
          </button>
        </div>
      `
    },

    // Encabezado de página
    pageHeader(title, icon = 'bi-collection') {
      return `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 class="mb-0 fw-bold"><i class="${icon} me-2"></i>${title}</h5>
          </div>
          <div class="d-flex gap-2" id="headerActions"></div>
        </div>
      `
    },

    // Badges de estado
    statusBadge(status, label) {
      const colors = {
        activo: 'success',
        active: 'success',
        inactivo: 'secondary',
        inactive: 'secondary',
        pendiente: 'warning',
        pending: 'warning',
        resuelto: 'info',
        resolved: 'info',
        cancelado: 'danger',
        canceled: 'danger',
      }
      const color = colors[status] || 'secondary'
      return `<span class="badge badge-compact bg-${color}">${label}</span>`
    },

    // Avatar con iniciales
    avatar(text, size = 'md') {
      const sizes = { sm: 24, md: 32, lg: 40 }
      const s = sizes[size] || 32
      return `
        <div class="avatar-compact bg-primary text-white" style="width: ${s}px; height: ${s}px;">
          ${text}
        </div>
      `
    },

    // Botones de acción rápida
    quickActions(editId, viewId, deleteId) {
      return `
        <div class="quick-actions">
          <button class="btn btn-sm btn-outline-primary btn-icon-sm" data-id="${editId}" data-action="edit" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-info btn-icon-sm" data-id="${viewId}" data-action="view" title="Ver">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-sm" data-id="${deleteId}" data-action="delete" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `
    },
  },

  // Utilidades
  utils: {
    // Obtener iniciales de nombre
    getInitials(name) {
      if (!name) return '?'
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    },

    // Formatear teléfono
    formatPhone(phone) {
      if (!phone) return '-'
      return phone
    },

    // Truncar texto
    truncate(text, maxLength = 30) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength - 3) + '...'
    },

    // Formatear fecha corta
    formatDateShort(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
      })
    },
  },
}

export default CompactUI