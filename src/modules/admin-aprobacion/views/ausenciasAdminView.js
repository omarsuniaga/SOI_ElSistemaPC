/**
 * ausenciasAdminView — Vista de aprobación de ausencias para el portal Admin
 * Header con stats, cards redesignadas, empty state amigable.
 */

import {
  aprobarAusencia,
  obtenerAusenciasPendientes,
  obtenerHistorialAusencias,
  rechazarAusencia,
} from '../api/ausenciaAprobacionApi.js'
import { createAusenciaAprobacionCard } from '../components/ausenciaAprobacionCard.js'

function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }))
}

function _injectStyles() {
  if (document.getElementById('ausencias-admin-view-styles')) return
  const style = document.createElement('style')
  style.id = 'ausencias-admin-view-styles'
  style.textContent = `
    .aav-root {
      padding: 1.25rem 1rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .aav-header {
      margin-bottom: 1.25rem;
    }

    .aav-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
    }

    .aav-icon-wrap {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: rgba(239,68,68,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .aav-icon-wrap i {
      font-size: 1.2rem;
      color: #ef4444;
    }

    .aav-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .aav-subtitle {
      font-size: 0.82rem;
      opacity: 0.65;
      margin: 0;
    }

    /* ── Interactive Stats Cards ── */
    .aav-stats {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .aav-stat {
      flex: 1;
      min-width: 120px;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.04));
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.08));
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .aav-stat:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border-color: #2563eb;
    }

    .aav-stat.active {
      border-color: #2563eb !important;
      background: rgba(37, 99, 235, 0.08) !important;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
    }

    [data-bs-theme="dark"] .aav-stat,
    [data-portal-theme="dark"] .aav-stat {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.08);
    }

    .aav-stat-num {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .aav-stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      opacity: 0.7;
      line-height: 1.3;
    }

    /* ── Filter Bar ── */
    .aav-filter-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding: 0.75rem 1rem;
      background: var(--surface-color, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    [data-bs-theme="dark"] .aav-filter-bar,
    [data-portal-theme="dark"] .aav-filter-bar {
      background: #1e293b !important;
      border-color: #334155 !important;
    }

    [data-bs-theme="dark"] .aav-filter-bar input,
    [data-bs-theme="dark"] .aav-filter-bar select,
    [data-portal-theme="dark"] .aav-filter-bar input,
    [data-portal-theme="dark"] .aav-filter-bar select {
      background-color: #0f172a !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }

    [data-bs-theme="dark"] .aav-filter-bar .input-group-text,
    [data-portal-theme="dark"] .aav-filter-bar .input-group-text {
      background-color: #0f172a !important;
      border-color: #334155 !important;
      color: #94a3b8 !important;
    }

    /* ── Refresh btn ── */
    .aav-refresh-btn {
      background: transparent;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      border-radius: 0.5rem;
      padding: 0.35rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
    }
    .aav-refresh-btn:hover {
      background: var(--bs-tertiary-bg);
      border-color: var(--bs-primary, #2563eb);
    }
    [data-bs-theme="dark"] .aav-refresh-btn,
    [data-portal-theme="dark"] .aav-refresh-btn {
      border-color: #334155;
      color: #cbd5e1;
    }
    [data-bs-theme="dark"] .aav-refresh-btn:hover,
    [data-portal-theme="dark"] .aav-refresh-btn:hover {
      background: #1e293b;
      border-color: #3b82f6;
      color: #ffffff;
    }
    .aav-refresh-btn.spinning i { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── List ── */
    .aav-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    @media (min-width: 1200px) {
      .aav-list {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    /* ── Tabs de Navegación (Pendientes vs Historial) ── */
    .aav-tabs-wrap {
      display: inline-flex;
      align-items: center;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.05));
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.1));
      border-radius: 999px;
      padding: 3px;
      gap: 3px;
    }

    .aav-tab-btn {
      border: none;
      background: transparent;
      color: var(--bs-secondary-color, #64748b);
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
    }

    .aav-tab-btn:hover {
      color: var(--bs-body-color, #0f172a);
    }

    .aav-tab-btn.active {
      background: var(--bs-body-bg, #ffffff);
      color: var(--bs-primary, #2563eb);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    [data-bs-theme="dark"] .aav-tab-btn.active,
    [data-portal-theme="dark"] .aav-tab-btn.active {
      background: #1e293b;
      color: #38bdf8;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    /* ── Log Table Styles (Historial) ── */
    .aav-log-wrap {
      background: var(--surface-color, #ffffff);
      border: 1px solid var(--border-color, rgba(0,0,0,0.08));
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    }

    [data-bs-theme="dark"] .aav-log-wrap,
    [data-portal-theme="dark"] .aav-log-wrap {
      background: #1e293b;
      border-color: #334155;
    }

    .aav-table-responsive {
      overflow-x: auto;
      width: 100%;
    }

    .aav-log-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }

    .aav-log-table th {
      padding: 0.85rem 1rem;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.02));
      color: var(--bs-secondary-color, #64748b);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid var(--bs-border-color, rgba(0,0,0,0.08));
      white-space: nowrap;
    }

    .aav-log-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--bs-border-color, rgba(0,0,0,0.05));
      vertical-align: middle;
    }

    .aav-log-table tr:last-child td {
      border-bottom: none;
    }

    .aav-log-table tr:hover td {
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.015));
    }

    /* ── Empty state ── */
    .aav-empty {
      text-align: center;
      padding: 3.5rem 1.5rem;
      grid-column: 1 / -1;
    }

    .aav-empty-icon {
      font-size: 3.5rem;
      opacity: 0.2;
      margin-bottom: 0.75rem;
    }

    .aav-empty-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.3rem;
    }

    .aav-empty-sub {
      font-size: 0.82rem;
      opacity: 0.55;
    }

    /* ── Error state ── */
    .aav-error {
      text-align: center;
      padding: 2rem;
      color: #ef4444;
      font-size: 0.85rem;
    }

    /* ── Loading ── */
    .aav-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      opacity: 0.6;
      font-size: 0.9rem;
    }

    .aav-spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `
  document.head.appendChild(style)
}

function _renderShell(container) {
  _injectStyles()
  container.innerHTML = `
    <div class="aav-root">
      <div class="aav-header">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div class="aav-title-row">
            <div class="aav-icon-wrap"><i class="bi bi-calendar-x-fill"></i></div>
            <div>
              <h2 class="aav-title">Solicitudes de Ausencia Docente</h2>
              <p class="aav-subtitle">Revisa comprobantes, toma decisiones y consulta el historial institucional.</p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <!-- Pestañas de Vista: Pendientes vs Historial -->
            <div class="aav-tabs-wrap" role="tablist">
              <button type="button" class="aav-tab-btn active" id="aav-tab-pendientes" data-tab="pendientes">
                <i class="bi bi-hourglass-split"></i> Pendientes
                <span class="badge bg-danger text-white rounded-pill ms-1" id="aav-tab-badge" style="font-size:0.68rem; padding:0.15rem 0.45rem;">0</span>
              </button>
              <button type="button" class="aav-tab-btn" id="aav-tab-historial" data-tab="historial">
                <i class="bi bi-journal-text"></i> Historial / Log
              </button>
            </div>
            <button class="aav-refresh-btn" id="aav-refresh-btn" title="Recargar solicitudes">
              <i class="bi bi-arrow-clockwise"></i> Actualizar
            </button>
          </div>
        </div>

        <!-- Tarjetas de Estadísticas Interactivas (Filtros rápidos) -->
        <div class="aav-stats" id="aav-stats-row">
          <!-- se llena después de cargar -->
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda en Vivo -->
      <div class="aav-filter-bar" id="aav-filter-bar">
        <div class="d-flex align-items-center gap-2 flex-grow-1" style="max-width: 420px;">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
            <input type="text" class="form-control border-start-0" id="aav-search-input" placeholder="Buscar por maestro o motivo...">
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap" id="aav-filter-controls">
          <select class="form-select form-select-sm" id="aav-filter-tipo" style="min-width: 140px;">
            <option value="todos">Todos los tipos</option>
            <option value="enfermedad">Médica</option>
            <option value="personal">Personal</option>
            <option value="capacitacion">Capacitación</option>
            <option value="vacaciones">Vacaciones</option>
            <option value="otro">Otro</option>
          </select>
          <select class="form-select form-select-sm" id="aav-filter-urgencia" style="min-width: 130px;">
            <option value="todas">Toda urgencia</option>
            <option value="alta">Urgencia alta</option>
            <option value="media">Urgencia media</option>
            <option value="baja">Urgencia baja</option>
          </select>
          <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1.5 px-2" id="aav-count-label" style="font-size:0.75rem;">
            Cargando...
          </span>
        </div>
      </div>

      <div id="aav-content">
        <div class="aav-loading">
          <div class="aav-spinner"></div>
          <span>Cargando solicitudes...</span>
        </div>
      </div>
    </div>
  `
}

const filterState = {
  currentTab: 'pendientes', // 'pendientes' | 'historial'
  ausencias: [],
  historial: [],
  filtroUrgencia: 'todas',
  filtroTipo: 'todos',
  filtroEstadoHistorial: 'todos',
  searchQuery: '',
}

function _renderStats(statsRow, ausencias) {
  const total = ausencias.length
  const altas = ausencias.filter(a => a.urgencia === 'alta').length
  const medias = ausencias.filter(a => a.urgencia === 'media').length
  const bajas = ausencias.filter(a => a.urgencia === 'baja').length

  statsRow.innerHTML = `
    <div class="aav-stat ${filterState.filtroUrgencia === 'todas' ? 'active' : ''}" data-filter-urgencia="todas" title="Ver todas las solicitudes pendientes">
      <div>
        <div class="aav-stat-num" style="color:var(--bs-primary, #2563eb)">${total}</div>
        <div class="aav-stat-label">Pendiente${total !== 1 ? 's' : ''} (Total)</div>
      </div>
      <i class="bi bi-hourglass-split" style="font-size:1.35rem;opacity:.4"></i>
    </div>
    <div class="aav-stat ${filterState.filtroUrgencia === 'alta' ? 'active' : ''}" data-filter-urgencia="alta" title="Filtrar por urgencia alta">
      <div>
        <div class="aav-stat-num" style="color:#ef4444">${altas}</div>
        <div class="aav-stat-label">Urgencia alta</div>
      </div>
      <i class="bi bi-exclamation-triangle-fill" style="font-size:1.35rem;color:#ef4444;opacity:.6"></i>
    </div>
    <div class="aav-stat ${filterState.filtroUrgencia === 'media' ? 'active' : ''}" data-filter-urgencia="media" title="Filtrar por urgencia media">
      <div>
        <div class="aav-stat-num" style="color:#f59e0b">${medias}</div>
        <div class="aav-stat-label">Urgencia media</div>
      </div>
      <i class="bi bi-dash-circle-fill" style="font-size:1.35rem;color:#f59e0b;opacity:.6"></i>
    </div>
    <div class="aav-stat ${filterState.filtroUrgencia === 'baja' ? 'active' : ''}" data-filter-urgencia="baja" title="Filtrar por urgencia baja">
      <div>
        <div class="aav-stat-num" style="color:#16a34a">${bajas}</div>
        <div class="aav-stat-label">Urgencia baja</div>
      </div>
      <i class="bi bi-check-circle-fill" style="font-size:1.35rem;color:#16a34a;opacity:.6"></i>
    </div>
  `
}

function _renderEmpty(contentEl) {
  contentEl.innerHTML = `
    <div class="aav-empty">
      <div class="aav-empty-icon"><i class="bi bi-inbox"></i></div>
      <h3 class="aav-empty-title">Todo al día</h3>
      <p class="aav-empty-sub">No hay solicitudes de ausencia pendientes en este momento.</p>
    </div>
  `
}

function _formatDateShort(dateStr) {
  if (!dateStr) return '—'
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length < 3) return dateStr
  const [y, m, d] = parts
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || ''} ${y}`
}

function _updateCountsAndBadges(container) {
  const pendingCount = filterState.ausencias.length
  
  // Actualizar stats de tarjetas superiores
  const statsRow = container.querySelector('#aav-stats-row')
  if (statsRow && filterState.currentTab === 'pendientes') {
    _renderStats(statsRow, filterState.ausencias)
  }

  // Actualizar count label
  const countLabel = container.querySelector('#aav-count-label')
  if (countLabel && filterState.currentTab === 'pendientes') {
    countLabel.textContent = pendingCount === 0
      ? 'Sin solicitudes pendientes'
      : `${pendingCount} solicitud${pendingCount !== 1 ? 'es' : ''}`
  }

  // Actualizar badge de pestaña pendientes
  const tabBadge = container.querySelector('#aav-tab-badge')
  if (tabBadge) {
    tabBadge.textContent = String(pendingCount)
    tabBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none'
  }

  // Actualizar nav badge en el menú lateral
  window.dispatchEvent(new CustomEvent('set-nav-badge', {
    detail: { route: 'admin-ausencias', count: pendingCount }
  }))
}

function _applyFiltersAndRender(container) {
  if (filterState.currentTab === 'historial') {
    _renderHistorialView(container)
    return
  }

  const contentEl = container.querySelector('#aav-content')
  const countLabel = container.querySelector('#aav-count-label')
  const statsRow = container.querySelector('#aav-stats-row')
  const filterControls = container.querySelector('#aav-filter-controls')

  if (statsRow) {
    statsRow.style.display = 'flex'
    _renderStats(statsRow, filterState.ausencias)
  }

  if (filterControls) {
    filterControls.innerHTML = `
      <select class="form-select form-select-sm" id="aav-filter-tipo" style="min-width: 140px;">
        <option value="todos" ${filterState.filtroTipo === 'todos' ? 'selected' : ''}>Todos los tipos</option>
        <option value="enfermedad" ${filterState.filtroTipo === 'enfermedad' ? 'selected' : ''}>Médica</option>
        <option value="personal" ${filterState.filtroTipo === 'personal' ? 'selected' : ''}>Personal</option>
        <option value="capacitacion" ${filterState.filtroTipo === 'capacitacion' ? 'selected' : ''}>Capacitación</option>
        <option value="vacaciones" ${filterState.filtroTipo === 'vacaciones' ? 'selected' : ''}>Vacaciones</option>
        <option value="otro" ${filterState.filtroTipo === 'otro' ? 'selected' : ''}>Otro</option>
      </select>
      <select class="form-select form-select-sm" id="aav-filter-urgencia" style="min-width: 130px;">
        <option value="todas" ${filterState.filtroUrgencia === 'todas' ? 'selected' : ''}>Toda urgencia</option>
        <option value="alta" ${filterState.filtroUrgencia === 'alta' ? 'selected' : ''}>Urgencia alta</option>
        <option value="media" ${filterState.filtroUrgencia === 'media' ? 'selected' : ''}>Urgencia media</option>
        <option value="baja" ${filterState.filtroUrgencia === 'baja' ? 'selected' : ''}>Urgencia baja</option>
      </select>
      <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1.5 px-2" id="aav-count-label" style="font-size:0.75rem;">
        Cargando...
      </span>
    `
    // Reatar listeners a los selects dinámicos
    container.querySelector('#aav-filter-tipo')?.addEventListener('change', (e) => {
      filterState.filtroTipo = e.target.value
      _applyFiltersAndRender(container)
    })
    container.querySelector('#aav-filter-urgencia')?.addEventListener('change', (e) => {
      filterState.filtroUrgencia = e.target.value
      _applyFiltersAndRender(container)
    })
  }

  let filtered = [...filterState.ausencias]

  if (filterState.filtroUrgencia !== 'todas') {
    filtered = filtered.filter(a => a.urgencia === filterState.filtroUrgencia)
  }

  if (filterState.filtroTipo !== 'todos') {
    filtered = filtered.filter(a => a.tipo_ausencia === filterState.filtroTipo)
  }

  const q = filterState.searchQuery.trim().toLowerCase()
  if (q) {
    filtered = filtered.filter(a => {
      const teacherName = (a.maestros?.nombre_completo || a.maestro_nombre || '').toLowerCase()
      const motivo = (a.motivo || '').toLowerCase()
      return teacherName.includes(q) || motivo.includes(q)
    })
  }

  // Update count label
  const newCountLabel = container.querySelector('#aav-count-label')
  if (newCountLabel) {
    if (filterState.ausencias.length === 0) {
      newCountLabel.textContent = 'Sin solicitudes pendientes'
    } else if (filtered.length === filterState.ausencias.length) {
      newCountLabel.textContent = `${filtered.length} solicitud${filtered.length !== 1 ? 'es' : ''}`
    } else {
      newCountLabel.textContent = `${filtered.length} de ${filterState.ausencias.length} (filtrado)`
    }
  }

  if (!filtered.length) {
    if (filterState.ausencias.length > 0) {
      contentEl.innerHTML = `
        <div class="aav-empty">
          <div class="aav-empty-icon"><i class="bi bi-funnel"></i></div>
          <h4 class="aav-empty-title">Sin resultados para los filtros aplicados</h4>
          <p class="aav-empty-sub">Prueba cambiando el término de búsqueda o ajustando la urgencia y tipo.</p>
          <button class="btn btn-outline-primary btn-sm mt-2" id="btn-limpiar-filtros-ausencias">
            <i class="bi bi-arrow-counterclockwise me-1"></i>Limpiar filtros
          </button>
        </div>
      `
      contentEl.querySelector('#btn-limpiar-filtros-ausencias')?.addEventListener('click', () => {
        filterState.filtroUrgencia = 'todas'
        filterState.filtroTipo = 'todos'
        filterState.searchQuery = ''
        const searchInput = container.querySelector('#aav-search-input')
        if (searchInput) searchInput.value = ''
        _applyFiltersAndRender(container)
      })
      return
    }

    _renderEmpty(contentEl)
    return
  }

  contentEl.innerHTML = ''
  const list = document.createElement('div')
  list.className = 'aav-list'
  contentEl.appendChild(list)

  // Sort: alta urgency first, then date
  const sorted = [...filtered].sort((a, b) => {
    const urgOrder = { alta: 0, media: 1, baja: 2 }
    const ua = urgOrder[a.urgencia] ?? 3
    const ub = urgOrder[b.urgencia] ?? 3
    if (ua !== ub) return ua - ub
    return (a.created_at || '').localeCompare(b.created_at || '')
  })

  for (const ausencia of sorted) {
    const card = createAusenciaAprobacionCard(ausencia, {
      onApprove: async (id, notes) => {
        try {
          await aprobarAusencia(id, notes)
          showToast('Ausencia aprobada exitosamente', 'success')
          // Actualización optimista + recarga para reconciliar con el servidor
          filterState.ausencias = filterState.ausencias.filter(a => a.id !== id)
          _updateCountsAndBadges(container)
          await _loadData(container)
        } catch (err) {
          const detail = err?.message || err?.details || JSON.stringify(err)
          showToast(`Error al aprobar: ${detail}`, 'error')
          console.error('[onApprove error]:', err)
          throw err
        }
      },
      onReject: async (id, notes) => {
        try {
          await rechazarAusencia(id, notes)
          showToast('Ausencia rechazada', 'success')
          // Actualización optimista + recarga para reconciliar con el servidor
          filterState.ausencias = filterState.ausencias.filter(a => a.id !== id)
          _updateCountsAndBadges(container)
          await _loadData(container)
        } catch (err) {
          const detail = err?.message || err?.details || JSON.stringify(err)
          showToast(`Error al rechazar: ${detail}`, 'error')
          console.error('[onReject error]:', err)
          throw err
        }
      },
    })
    list.appendChild(card)
  }
}

function _renderHistorialView(container) {
  const contentEl = container.querySelector('#aav-content')
  const statsRow = container.querySelector('#aav-stats-row')
  const filterControls = container.querySelector('#aav-filter-controls')

  // En Historial ocultamos las tarjetas de urgencia de pendientes
  if (statsRow) statsRow.style.display = 'none'

  if (filterControls) {
    filterControls.innerHTML = `
      <select class="form-select form-select-sm" id="aav-filter-historial-estado" style="min-width: 150px;">
        <option value="todos" ${filterState.filtroEstadoHistorial === 'todos' ? 'selected' : ''}>Todos los estados</option>
        <option value="aprobada" ${filterState.filtroEstadoHistorial === 'aprobada' ? 'selected' : ''}>Aprobadas</option>
        <option value="rechazada" ${filterState.filtroEstadoHistorial === 'rechazada' ? 'selected' : ''}>Rechazadas</option>
        <option value="pendiente" ${filterState.filtroEstadoHistorial === 'pendiente' ? 'selected' : ''}>Pendientes</option>
        <option value="cancelada" ${filterState.filtroEstadoHistorial === 'cancelada' ? 'selected' : ''}>Canceladas</option>
      </select>
      <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1.5 px-2" id="aav-historial-count" style="font-size:0.75rem;">
        Log de Auditoría
      </span>
    `
    container.querySelector('#aav-filter-historial-estado')?.addEventListener('change', (e) => {
      filterState.filtroEstadoHistorial = e.target.value
      _renderHistorialView(container)
    })
  }

  let items = [...filterState.historial]

  if (filterState.filtroEstadoHistorial !== 'todos') {
    items = items.filter(a => a.estado === filterState.filtroEstadoHistorial)
  }

  const q = filterState.searchQuery.trim().toLowerCase()
  if (q) {
    items = items.filter(a => {
      const name = (a.maestros?.nombre_completo || a.maestro_nombre || '').toLowerCase()
      const mot = (a.motivo || '').toLowerCase()
      return name.includes(q) || mot.includes(q)
    })
  }

  const countBadge = container.querySelector('#aav-historial-count')
  if (countBadge) {
    countBadge.textContent = `${items.length} registro${items.length !== 1 ? 's' : ''}`
  }

  if (!items.length) {
    contentEl.innerHTML = `
      <div class="aav-empty">
        <div class="aav-empty-icon"><i class="bi bi-journal-x"></i></div>
        <h3 class="aav-empty-title">Sin registros en el historial</h3>
        <p class="aav-empty-sub">No se encontraron solicitudes con los criterios seleccionados.</p>
      </div>
    `
    return
  }

  contentEl.innerHTML = `
    <div class="aav-log-wrap shadow-sm">
      <div class="aav-table-responsive">
        <table class="aav-log-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Docente</th>
              <th>Tipo & Urgencia</th>
              <th>Período Ausencia</th>
              <th>Motivo</th>
              <th>Fecha Solicitud</th>
              <th style="text-align:right">Comprobante</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(a => {
              const est = (a.estado || 'pendiente').toLowerCase()
              let estadoBadge = ''
              if (est === 'aprobada') {
                estadoBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill"><i class="bi bi-check-circle-fill me-1"></i>Aprobada</span>'
              } else if (est === 'rechazada') {
                estadoBadge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill"><i class="bi bi-x-circle-fill me-1"></i>Rechazada</span>'
              } else if (est === 'cancelada') {
                estadoBadge = '<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill"><i class="bi bi-slash-circle me-1"></i>Cancelada</span>'
              } else {
                estadoBadge = '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill"><i class="bi bi-hourglass-split me-1"></i>Pendiente</span>'
              }

              const teacherName = a.maestros?.nombre_completo || a.maestro_nombre || 'Docente'
              const teacherEmail = a.maestros?.correo || a.maestro_email || 'Sin correo'
              const initial = teacherName.charAt(0).toUpperCase()

              const fechaIni = _formatDateShort(a.fecha_inicio)
              const fechaFin = a.fecha_fin && a.fecha_fin !== a.fecha_inicio ? ` → ${_formatDateShort(a.fecha_fin)}` : ''
              const fechaRegistro = _formatDateShort(a.created_at)

              let urgBadge = ''
              if (a.urgencia === 'alta') {
                urgBadge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle ms-1" style="font-size:0.65rem">Alta</span>'
              } else if (a.urgencia === 'media') {
                urgBadge = '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle ms-1" style="font-size:0.65rem">Media</span>'
              } else {
                urgBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle ms-1" style="font-size:0.65rem">Baja</span>'
              }

              const comprobanteBtn = a.archivo_url ? `
                <a href="${a.archivo_url}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-outline-primary rounded-pill py-1 px-2" style="font-size:0.75rem" title="Ver archivo adjunto">
                  <i class="bi bi-paperclip me-1"></i>Ver
                </a>
              ` : '<span class="text-muted small">—</span>'

              return `
                <tr>
                  <td>${estadoBadge}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style="width:32px;height:32px;font-size:0.85rem">
                        ${initial}
                      </div>
                      <div>
                        <div class="fw-bold text-body">${teacherName}</div>
                        <div class="text-muted small" style="font-size:0.72rem">${teacherEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-capitalize fw-semibold text-body">${a.tipo_ausencia || 'General'}</span>
                    ${urgBadge}
                  </td>
                  <td>
                    <div class="fw-semibold text-body">${fechaIni}${fechaFin}</div>
                  </td>
                  <td style="max-width:240px">
                    <div class="text-truncate text-body-secondary small" title="${a.motivo || ''}">${a.motivo || 'Sin motivo registrado'}</div>
                  </td>
                  <td>
                    <span class="text-muted small">${fechaRegistro}</span>
                  </td>
                  <td style="text-align:right">
                    ${comprobanteBtn}
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

async function _loadData(container) {
  const contentEl = container.querySelector('#aav-content')
  const refreshBtn = container.querySelector('#aav-refresh-btn')

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="aav-loading">
        <div class="aav-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    `
  }

  try {
    const [ausencias, historial] = await Promise.all([
      obtenerAusenciasPendientes(),
      obtenerHistorialAusencias()
    ])

    filterState.ausencias = ausencias || []
    filterState.historial = historial || []

    _updateCountsAndBadges(container)

    // Update nav badge via insights component
    if (window.adminAusenciasInsights) {
      window.adminAusenciasInsights.evaluate()
    }

    _applyFiltersAndRender(container)
  } catch (error) {
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="aav-error">
          <i class="bi bi-exclamation-triangle"></i>
          Error al cargar solicitudes: ${error.message}
        </div>
      `
    }
    showToast(`Error al cargar ausencias: ${error.message}`, 'error')
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('spinning')
  }
}

function _attachEventListeners(container) {
  const root = container.querySelector('.aav-root')

  // 1. Buscador en tiempo real
  const searchInput = container.querySelector('#aav-search-input')
  searchInput?.addEventListener('input', (e) => {
    filterState.searchQuery = e.target.value
    _applyFiltersAndRender(root)
  })

  // 2. Clic en tarjetas de Stats superiores (filtrado rápido)
  const statsRow = container.querySelector('#aav-stats-row')
  statsRow?.addEventListener('click', (e) => {
    const statCard = e.target.closest('[data-filter-urgencia]')
    if (statCard) {
      const urg = statCard.dataset.filterUrgencia
      filterState.filtroUrgencia = urg
      const selectUrg = container.querySelector('#aav-filter-urgencia')
      if (selectUrg) selectUrg.value = urg
      _applyFiltersAndRender(root)
    }
  })

  // 3. Switch de Pestañas: Pendientes vs Historial
  const tabPendientes = container.querySelector('#aav-tab-pendientes')
  const tabHistorial = container.querySelector('#aav-tab-historial')

  tabPendientes?.addEventListener('click', () => {
    if (filterState.currentTab === 'pendientes') return
    filterState.currentTab = 'pendientes'
    tabPendientes.classList.add('active')
    tabHistorial.classList.remove('active')
    _applyFiltersAndRender(root)
  })

  tabHistorial?.addEventListener('click', () => {
    if (filterState.currentTab === 'historial') return
    filterState.currentTab = 'historial'
    tabHistorial.classList.add('active')
    tabPendientes.classList.remove('active')
    _applyFiltersAndRender(root)
  })

  // 4. Botón de Actualizar
  const refreshBtn = container.querySelector('#aav-refresh-btn')
  refreshBtn?.addEventListener('click', async () => {
    refreshBtn.classList.add('spinning')
    await _loadData(root)
  })
}

export async function renderAusenciasAdminView(container) {
  _renderShell(container)
  _attachEventListeners(container)

  const root = container.querySelector('.aav-root')
  await _loadData(root)
}

