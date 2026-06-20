/**
 * adminNotificacionesView — Centro de Actividad y Notificaciones Proactivas del Admin
 *
 * Feed unificado de eventos y alertas operativas/académicas en tiempo real:
 *  - Solicitudes de ausencia con Auto-Substitution Suggester integrado.
 *  - Compliance de asistencia (maestros fuera de compliance).
 *  - Alumnos registrados recientemente.
 *  - Alertas Tempranas de Riesgo Académico (Early Warning Engine).
 *
 * Características:
 *  - Dashboard de KPIs translúcidos de glassmorphism con filtrado reactivo.
 *  - Buscador dinámico inteligente con filtrado al escribir.
 *  - Conexión persistente Supabase Realtime WebSockets.
 *  - Notificaciones de escritorio Web Push del sistema en segundo plano.
 *  - Transiciones atómicas in-place con desvanecimiento (cero lag de recarga).
 */

import { fetchAdminFeed, fetchMaestrosParaNotificar, sendNotificacionToMaestros, fetchNotificacionesEnviadas } from '../api/adminNotifApi.js'
import { aprobarAusencia, rechazarAusencia } from '../../admin-aprobacion/api/ausenciaAprobacionApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { router } from '../../../core/router/router.js'
import { resetAdminNotifBadge } from '../realtimeService.js'

// ── Styles ────────────────────────────────────────────────────────────────────

function _injectStyles() {
  if (document.getElementById('anv-styles')) return
  const style = document.createElement('style')
  style.id = 'anv-styles'
  style.textContent = `
    .anv-root {
      padding: 1.25rem 1rem 5rem;
      max-width: 680px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .anv-header {
      margin-bottom: 1.5rem;
    }

    .anv-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .anv-title-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .anv-icon-wrap {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: rgba(99,102,241,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .anv-icon-wrap i {
      font-size: 1.2rem;
      color: #6366f1;
    }

    .anv-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .anv-subtitle {
      font-size: 0.8rem;
      opacity: 0.5;
      margin: 0;
      padding-left: calc(2.5rem + 0.75rem);
    }

    /* ── KPI Widgets (Glassmorphism) ── */
    .anv-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      margin-top: 1.25rem;
    }

    .anv-kpi-card {
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
    }

    .anv-kpi-card:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.08);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .anv-kpi-card.active {
      background: rgba(99, 102, 241, 0.08);
      border-color: #6366f1;
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
    }

    .anv-kpi-num {
      font-size: 1.6rem;
      font-weight: 800;
      line-height: 1;
      color: var(--bs-body-color);
    }

    .anv-kpi-card.criticas .anv-kpi-num { color: #ef4444; }
    .anv-kpi-card.compliance .anv-kpi-num { color: #f59e0b; }
    .anv-kpi-card.novedades .anv-kpi-num { color: #3b82f6; }

    .anv-kpi-label {
      font-size: 0.72rem;
      font-weight: 600;
      opacity: 0.6;
    }

    /* ── Search Bar ── */
    .anv-search-container {
      margin-bottom: 1.25rem;
      position: relative;
    }

    .anv-search-input {
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--bs-body-color);
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    .anv-search-input:focus {
      outline: none;
      background: #fff;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .anv-search-icon {
      position: absolute;
      left: 0.95rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
      opacity: 0.4;
      pointer-events: none;
    }

    /* ── Filters ── */
    .anv-filters {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .anv-filter-btn {
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      background: transparent;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--bs-body-color);
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .anv-filter-btn.active {
      background: #6366f1;
      border-color: #6366f1;
      color: #fff;
    }

    .anv-filter-btn:not(.active):hover {
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.05));
    }

    .anv-filter-count {
      background: rgba(255,255,255,0.25);
      border-radius: 999px;
      font-size: 0.65rem;
      padding: 0.05rem 0.4rem;
      min-width: 1.2rem;
      text-align: center;
    }

    .anv-filter-btn:not(.active) .anv-filter-count {
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.08));
      color: var(--bs-body-color);
    }

    /* ── Action bar ── */
    .anv-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .anv-showing {
      font-size: 0.75rem;
      opacity: 0.5;
    }

    .anv-refresh-btn {
      background: transparent;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.12));
      border-radius: 0.5rem;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      cursor: pointer;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: background 0.15s;
    }
    .anv-refresh-btn:hover { background: var(--bs-tertiary-bg); }
    .anv-refresh-btn.spinning i { animation: anv-spin 0.7s linear infinite; }
    
    .animate-pulse {
      animation: pulse-ring 1.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
    }

    @keyframes pulse-ring {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }

    @keyframes anv-spin { to { transform: rotate(360deg); } }

    /* ── Timeline ── */
    .anv-timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
    }

    /* Vertical line */
    .anv-timeline::before {
      content: '';
      position: absolute;
      left: 1.125rem;
      top: 0.5rem;
      bottom: 0.5rem;
      width: 2px;
      background: var(--bs-border-color, rgba(0,0,0,0.08));
      border-radius: 1px;
    }

    /* ── Event card ── */
    .anv-event {
      display: flex;
      gap: 0.85rem;
      padding: 0.75rem 0;
      position: relative;
      animation: anv-fadein 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes anv-fadein {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .anv-event-dot {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.95rem;
      position: relative;
      z-index: 1;
      border: 2px solid var(--bs-body-bg, #fff);
    }

    .anv-event-body {
      flex: 1;
      min-width: 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--bs-border-color, rgba(0,0,0,0.06));
    }

    .anv-event:last-child .anv-event-body {
      border-bottom: none;
    }

    .anv-event-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.15rem;
    }

    .anv-event-titulo {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.4;
      flex: 1;
      min-width: 0;
    }

    .anv-event-time {
      font-size: 0.7rem;
      opacity: 0.45;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .anv-event-sub {
      font-size: 0.77rem;
      opacity: 0.6;
      margin-bottom: 0.35rem;
    }

    .anv-event-motivo {
      font-size: 0.76rem;
      opacity: 0.55;
      font-style: italic;
      margin-bottom: 0.4rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* ── Category chip ── */
    .anv-cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      margin-bottom: 0.3rem;
    }

    /* ── Priority indicator ── */
    .anv-event[data-priority="alta"]   .anv-event-titulo { color: #ef4444; }
    .anv-event[data-priority="media"]  .anv-event-titulo { color: #f59e0b; }

    /* ── Suplentes recomendados ── */
    .anv-suplentes-box {
      margin-top: 0.65rem;
      padding: 0.65rem 0.8rem;
      background: rgba(99, 102, 241, 0.04);
      border: 1px dashed rgba(99, 102, 241, 0.2);
      border-radius: 0.75rem;
    }

    .anv-suplentes-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .anv-suplentes-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .anv-suplente-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0.04);
      padding: 0.3rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.74rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.01);
    }

    .anv-suplente-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .anv-suplente-name {
      font-weight: 600;
      color: var(--bs-body-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .anv-suplente-email {
      font-size: 0.65rem;
      opacity: 0.5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .anv-suplente-btn {
      padding: 0.2rem 0.5rem;
      border-radius: 0.35rem;
      border: none;
      background: rgba(99,102,241,0.08);
      color: #6366f1;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .anv-suplente-btn:hover {
      background: #6366f1;
      color: #fff;
    }

    .anv-suplente-btn.notified {
      background: rgba(34,197,94,0.12);
      color: #16a34a;
      pointer-events: none;
    }

    /* ── Inline actions ── */
    .anv-inline-actions {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .anv-action-btn {
      padding: 0.28rem 0.75rem;
      border-radius: 0.5rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: opacity 0.15s, transform 0.1s;
    }
    .anv-action-btn:active  { transform: scale(0.96); }
    .anv-action-btn:disabled { opacity: 0.4; pointer-events: none; }

    .anv-btn-approve {
      background: rgba(34,197,94,0.12);
      color: #16a34a;
    }
    .anv-btn-approve:hover { background: rgba(34,197,94,0.22); }

    .anv-btn-reject {
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }
    .anv-btn-reject:hover { background: rgba(239,68,68,0.2); }

    .anv-btn-goto {
      background: rgba(99,102,241,0.1);
      color: #6366f1;
    }
    .anv-btn-goto:hover { background: rgba(99,102,241,0.2); }

    /* ── Estado chip (post-decision) ── */
    .anv-estado-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      margin-top: 0.4rem;
    }

    /* ── Empty / Error / Loading ── */
    .anv-center {
      text-align: center;
      padding: 3.5rem 1.5rem;
    }
    .anv-center-icon {
      font-size: 3rem;
      opacity: 0.2;
      margin-bottom: 0.75rem;
    }
    .anv-center-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .anv-center-sub {
      font-size: 0.8rem;
      opacity: 0.5;
    }

    .anv-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      opacity: 0.6;
      font-size: 0.88rem;
    }
    .anv-spinner {
      width: 1.4rem;
      height: 1.4rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: anv-spin 0.7s linear infinite;
    }

    /* ── Dark mode ── */
    [data-bs-theme="dark"] .anv-event-dot,
    [data-portal-theme="dark"] .anv-event-dot {
      border-color: var(--bs-body-bg, #1e1e2e);
    }

    [data-bs-theme="dark"] .anv-kpi-card,
    [data-portal-theme="dark"] .anv-kpi-card {
      background: rgba(30, 30, 46, 0.45);
      border-color: rgba(255, 255, 255, 0.05);
    }

    [data-bs-theme="dark"] .anv-suplente-item,
    [data-portal-theme="dark"] .anv-suplente-item {
      background: rgba(30, 30, 46, 0.6);
      border-color: rgba(255, 255, 255, 0.05);
    }

    [data-bs-theme="dark"] .anv-search-input,
    [data-portal-theme="dark"] .anv-search-input {
      background: rgba(30, 30, 46, 0.6);
      border-color: rgba(255, 255, 255, 0.05);
    }
  `
  document.head.appendChild(style)
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all',        label: 'Todo',        icon: 'bi-grid-fill' },
  { key: 'ausencia',   label: 'Ausencias',   icon: 'bi-calendar-x-fill' },
  { key: 'compliance', label: 'Alertas',     icon: 'bi-exclamation-triangle-fill' },
  { key: 'alumno',     label: 'Novedades',   icon: 'bi-person-plus-fill' },
]

const CAT_COLORS = {
  ausencia:   { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  compliance: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  alumno:     { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  maestro:    { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
}

const CAT_LABELS = {
  ausencia:   'Ausencia',
  compliance: 'Alerta',
  alumno:     'Novedad',
  maestro:    'Seguridad',
}

const ESTADO_CONFIG = {
  aprobada:  { label: 'Aprobada',  bg: 'rgba(34,197,94,0.12)',   color: '#16a34a', icon: 'bi-check-circle-fill' },
  rechazada: { label: 'Rechazada', bg: 'rgba(239,68,68,0.12)',   color: '#dc2626', icon: 'bi-x-circle-fill' },
  pendiente: { label: 'Pendiente', bg: 'rgba(245,158,11,0.12)',  color: '#d97706', icon: 'bi-hourglass-split' },
}

// ── Main render ───────────────────────────────────────────────────────────────

export async function renderAdminNotificacionesView(container) {
  _injectStyles()

  // Solicitar permiso de notificaciones push
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }

  let _allEvents  = []
  let _activeFilter = 'all'
  let _searchText = ''
  let _realtimeChannel = null

  function _shell() {
    container.innerHTML = `
      <div class="anv-root">
        <div class="anv-header">
          <div class="anv-title-row d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="anv-title-left">
              <div class="anv-icon-wrap"><i class="bi bi-bell-fill"></i></div>
              <h2 class="anv-title">Centro de Actividad</h2>
            </div>
            <div class="d-flex gap-2">
              <button id="anv-btn-historial" class="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: white;">
                <i class="bi bi-clock-history"></i>
                <span>Historial</span>
              </button>
              <button id="anv-btn-send-notif" class="btn btn-sm btn-warning rounded-pill px-3 fw-semibold d-flex align-items-center gap-2">
                <i class="bi bi-send-fill"></i>
                <span>Enviar notificación</span>
              </button>
              <button id="anv-btn-help" class="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: white;">
                <i class="bi bi-question-circle-fill"></i>
                <span>Guía</span>
              </button>
            </div>
          </div>
          <p class="anv-subtitle">Gobernanza escolar proactiva y control operativo en tiempo real.</p>
          
          <!-- Mini-Dashboard KPIs Translúcidos -->
          <div class="anv-kpis" id="anv-kpi-container">
            <div class="anv-kpi-card active" data-kpi="all">
              <span class="anv-kpi-num" id="kpi-todo">-</span>
              <span class="anv-kpi-label">Total Eventos</span>
            </div>
            <div class="anv-kpi-card criticas" data-kpi="critica">
              <span class="anv-kpi-num" id="kpi-criticas">-</span>
              <span class="anv-kpi-label">Pendientes Críticas</span>
            </div>
            <div class="anv-kpi-card compliance" data-kpi="compliance">
              <span class="anv-kpi-num" id="kpi-compliance">-</span>
              <span class="anv-kpi-label">Alertas Académicas</span>
            </div>
            <div class="anv-kpi-card novedades" data-kpi="alumno">
              <span class="anv-kpi-num" id="kpi-novedades">-</span>
              <span class="anv-kpi-label">Registros Nuevos</span>
            </div>
          </div>

          <!-- Buscador Inteligente en Caliente -->
          <div class="anv-search-container">
            <i class="bi bi-search anv-search-icon"></i>
            <input type="text" id="anv-search-bar" class="anv-search-input" placeholder="Buscar por docente, alumno, instrumento o motivo..." autocomplete="off">
          </div>

          <div class="anv-filters" id="anv-filters"></div>
        </div>

        <div class="anv-action-bar">
          <span class="anv-showing" id="anv-showing"></span>
          <button class="anv-refresh-btn" id="anv-refresh-btn">
            <i class="bi bi-broadcast"></i> Conectando...
          </button>
        </div>

        <div id="anv-body">
          <div class="anv-loading">
            <div class="anv-spinner"></div>
            <span>Cargando actividad operativa...</span>
          </div>
        </div>
      </div>
    `

    // Wire buscador input
    const searchInput = container.querySelector('#anv-search-bar')
    searchInput?.addEventListener('input', (e) => {
      _searchText = e.target.value
      _renderTimeline()
    })

    // Wire KPI click events
    container.querySelectorAll('[data-kpi]').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('[data-kpi]').forEach(c => c.classList.remove('active'))
        card.classList.add('active')
        _activeFilter = card.dataset.kpi
        _renderFilters()
        _renderTimeline()
      })
    })

    // Wire help guide button
    const btnHelp = container.querySelector('#anv-btn-help')
    btnHelp?.addEventListener('click', () => {
      _openHelpGuideModal()
    })
  }

  function _renderFilters() {
    const filtersEl = container.querySelector('#anv-filters')
    if (!filtersEl) return
    filtersEl.innerHTML = ''

    const counts = {}
    for (const e of _allEvents) {
      counts[e.category] = (counts[e.category] || 0) + 1
    }

    CATEGORIES.forEach(cat => {
      const count = cat.key === 'all' ? _allEvents.length : (counts[cat.key] || 0)
      const isActive = _activeFilter === cat.key
      const btn = document.createElement('button')
      btn.className = 'anv-filter-btn' + (isActive ? ' active' : '')
      btn.dataset.filter = cat.key
      btn.innerHTML = `<i class="bi ${cat.icon}"></i> ${cat.label} <span class="anv-filter-count">${count}</span>`
      
      btn.addEventListener('click', () => {
        // Actualizar active kpi class
        container.querySelectorAll('[data-kpi]').forEach(c => c.classList.remove('active'))
        const matchingKpi = container.querySelector(`[data-kpi="${cat.key}"]`)
        if (matchingKpi) matchingKpi.classList.add('active')

        _activeFilter = cat.key
        _renderTimeline()
        _renderFilters()
      })
      filtersEl.appendChild(btn)
    })
  }

  function _renderKPIs() {
    const todo = _allEvents.length
    const criticas = _allEvents.filter(e => e.actionable || e.priority === 'alta').length
    const compliance = _allEvents.filter(e => e.category === 'compliance').length
    const novedades = _allEvents.filter(e => e.category === 'alumno' || e.category === 'maestro').length

    const elTodo = container.querySelector('#kpi-todo')
    const elCriticas = container.querySelector('#kpi-criticas')
    const elCompliance = container.querySelector('#kpi-compliance')
    const elNovedades = container.querySelector('#kpi-novedades')

    if (elTodo) elTodo.textContent = todo
    if (elCriticas) elCriticas.textContent = criticas
    if (elCompliance) elCompliance.textContent = compliance
    if (elNovedades) elNovedades.textContent = novedades
  }

  function _showPushNotification(title, body) {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/img/icons/icon-192x192.png',
          vibrate: [200, 100, 200],
          tag: 'soi-admin-notif'
        })
      } catch (err) {
        console.warn('[Web Push] Fallback via SW required:', err)
      }
    }
  }

  function _setupRealtimeSubscription() {
    if (_realtimeChannel) return

    // Remover canal previo con el mismo nombre si existe (sobrevive navegación SPA)
    const stale = supabase.getChannels().find(ch => ch.topic === 'realtime:admin-feed-channel')
    if (stale) supabase.removeChannel(stale)

    _realtimeChannel = supabase
      .channel('admin-feed-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ausencias_maestros' }, async (payload) => {
        console.log('[Realtime WebSocket] Nueva ausencia detectada:', payload)
        _showPushNotification('Nueva Ausencia Solicitada', 'Un maestro ha enviado una solicitud de ausencia urgente.')
        await _load(true) // recarga silenciosa en segundo plano
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ausencias_maestros' }, async () => {
        await _load(true)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, async (payload) => {
        if (payload.new && payload.new.rol === 'maestro') {
          console.log('[Realtime WebSocket] Nuevo maestro registrado:', payload)
          _showPushNotification('Nuevo Registro de Seguridad', `${payload.new.nombre_completo} se ha registrado esperando aprobación.`)
          await _load(true)
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'asistencias' }, async () => {
        await _load(true)
      })
      .subscribe((status) => {
        const refreshBtn = container.querySelector('#anv-refresh-btn')
        if (!refreshBtn) return
        if (status === 'SUBSCRIBED') {
          refreshBtn.innerHTML = '<i class="bi bi-broadcast text-success animate-pulse"></i> Feed en Vivo'
          refreshBtn.style.borderColor = 'rgba(34,197,94,0.3)'
          refreshBtn.title = 'Conectado mediante WebSockets en tiempo real.'
        } else {
          refreshBtn.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning"></i> Re-conectar'
          refreshBtn.style.borderColor = 'rgba(245,158,11,0.3)'
          refreshBtn.title = 'WebSockets inactivos. Haz clic para actualizar manualmente.'
        }
      })
  }

  function _buildEventEl(event, onRefresh) {
    const el = document.createElement('div')
    el.className = 'anv-event'
    el.dataset.priority = event.priority
    el.dataset.category = event.category

    const cat = CAT_COLORS[event.category] || { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' }
    const catLabel = CAT_LABELS[event.category] || event.category

    // Post-decision state chip for resolved events (ausencias and maestros)
    let estadoChipHTML = ''
    if ((event.source === 'ausencia' || event.source === 'maestro') && !event.actionable) {
      const estadoKey = event.estado === 'activo' ? 'aprobada' : (event.estado === 'rechazado' ? 'rechazada' : event.estado)
      const ec = ESTADO_CONFIG[estadoKey]
      if (ec) {
        estadoChipHTML = `
          <span class="anv-estado-chip" style="background:${ec.bg};color:${ec.color}">
            <i class="bi ${ec.icon}"></i> ${ec.label === 'Aprobada' && event.source === 'maestro' ? 'Aprobado' : (ec.label === 'Rechazada' && event.source === 'maestro' ? 'Rechazado' : ec.label)}
          </span>
        `
      }
    }

    // Auto-Substitution Suggester HTML
    let suplentesHTML = ''
    if (event.suplentesSugeridos && event.suplentesSugeridos.length > 0 && event.actionable) {
      suplentesHTML = `
        <div class="anv-suplentes-box">
          <div class="anv-suplentes-title">
            <i class="bi bi-magic"></i> Suplentes Recomendados (${event.maestroInstrumento || 'Instrumento'})
          </div>
          <div class="anv-suplentes-list">
            ${event.suplentesSugeridos.map(s => `
              <div class="anv-suplente-item">
                <div class="anv-suplente-info">
                  <span class="anv-suplente-name">${s.nombre_completo}</span>
                  <span class="anv-suplente-email">${s.email}</span>
                </div>
                <button class="anv-suplente-btn" data-action="notify-sub" data-sub-name="${s.nombre_completo}" data-sub-email="${s.email}">
                  <i class="bi bi-send-fill"></i> Proponer
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `
    }

    // Inline actions for pending ausencias and maestros
    let actionsHTML = ''
    if (event.actionable && event.source === 'ausencia') {
      actionsHTML = `
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-approve" data-action="approve" data-id="${event.sourceId}">
            <i class="bi bi-check-circle"></i> Aprobar
          </button>
          <button class="anv-action-btn anv-btn-reject" data-action="reject" data-id="${event.sourceId}">
            <i class="bi bi-x-circle"></i> Rechazar
          </button>
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="admin-ausencias">
            <i class="bi bi-arrow-right-circle"></i> Ver detalle
          </button>
        </div>
      `
    } else if (event.actionable && event.source === 'maestro') {
      actionsHTML = `
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-approve" data-action="approve-maestro" data-id="${event.sourceId}">
            <i class="bi bi-check-circle"></i> Aprobar
          </button>
          <button class="anv-action-btn anv-btn-reject" data-action="reject-maestro" data-id="${event.sourceId}">
            <i class="bi bi-x-circle"></i> Rechazar
          </button>
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${event.actionRoute}">
            <i class="bi bi-arrow-right-circle"></i> Ver Aprobaciones
          </button>
        </div>
      `
    } else if (event.actionRoute) {
      const paramsAttr = event.actionParams
        ? ` data-params='${JSON.stringify(event.actionParams)}'`
        : ''
      actionsHTML = `
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${event.actionRoute}"${paramsAttr}>
            <i class="bi bi-arrow-right-circle"></i> ${event.actionLabel || 'Ver'}
          </button>
        </div>
      `
    }

    el.innerHTML = `
      <div class="anv-event-dot" style="background:${cat.bg}">
        <i class="bi ${event.icon}" style="color:${event.iconColor}"></i>
      </div>
      <div class="anv-event-body">
        <span class="anv-cat-chip" style="background:${cat.bg};color:${cat.color}">
          ${catLabel}
        </span>
        <div class="anv-event-top">
          <span class="anv-event-titulo">${event.titulo}</span>
          <span class="anv-event-time">${event.timeAgo}</span>
        </div>
        <div class="anv-event-sub">${event.subtitulo}</div>
        ${event.motivo ? `<div class="anv-event-motivo">"${event.motivo}"</div>` : ''}
        ${suplentesHTML}
        ${estadoChipHTML}
        ${actionsHTML}
      </div>
    `

    // Wire actions
    el.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const action = btn.dataset.action
        if (action === 'goto') {
          const r = window.router || router
          if (r) {
            // Support routes with inline query params: "alumno?id=UUID"
            const rawRoute = btn.dataset.route || ''
            const [routePath, queryStr] = rawRoute.split('?')
            let params = btn.dataset.params ? JSON.parse(btn.dataset.params) : {}
            if (queryStr) {
              new URLSearchParams(queryStr).forEach((v, k) => { params[k] = v })
            }
            r.navigate(routePath, params)
          }
          return
        }

        if (action === 'notify-sub') {
          const subName = btn.dataset.subName
          btn.disabled = true
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Propuesto'
          btn.className = 'anv-suplente-btn notified'
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: { message: `Propuesta de suplencia enviada a ${subName}`, type: 'success' }
          }))
          return
        }

        // Approve / Reject inline con transición atómica in-place
        el.querySelectorAll('[data-action="approve"],[data-action="reject"],[data-action="approve-maestro"],[data-action="reject-maestro"]').forEach(b => b.disabled = true)
        
        if (action === 'approve') {
          btn.innerHTML = '<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>'
          try {
            await aprobarAusencia(event.sourceId, '')
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Ausencia aprobada con éxito', type: 'success' } }))
            
            // Reemplazo atómico in-place
            event.actionable = false
            event.estado = 'aprobada'
            event.priority = 'info'
            event.icon = 'bi-calendar-check-fill'
            event.iconColor = '#22c55e'

            const freshEl = _buildEventEl(event, onRefresh)
            freshEl.style.animation = 'anv-fadein 0.3s ease'
            el.replaceWith(freshEl)

            _renderKPIs()
            
            if (window.adminAusenciasInsights) window.adminAusenciasInsights.evaluate()
          } catch (err) {
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Error: ' + err.message, type: 'error' } }))
            el.querySelectorAll('[data-action="approve"],[data-action="reject"]').forEach(b => b.disabled = false)
            btn.innerHTML = '<i class="bi bi-check-circle"></i> Aprobar'
          }
        } else if (action === 'reject') {
          btn.innerHTML = '<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>'
          try {
            await rechazarAusencia(event.sourceId, '')
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Ausencia rechazada con éxito', type: 'success' } }))
            
            // Reemplazo atómico in-place
            event.actionable = false
            event.estado = 'rechazada'
            event.priority = 'info'
            event.icon = 'bi-calendar-minus-fill'
            event.iconColor = '#ef4444'

            const freshEl = _buildEventEl(event, onRefresh)
            freshEl.style.animation = 'anv-fadein 0.3s ease'
            el.replaceWith(freshEl)

            _renderKPIs()

            if (window.adminAusenciasInsights) window.adminAusenciasInsights.evaluate()
          } catch (err) {
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Error: ' + err.message, type: 'error' } }))
            el.querySelectorAll('[data-action="approve"],[data-action="reject"]').forEach(b => b.disabled = false)
            btn.innerHTML = '<i class="bi bi-x-circle"></i> Rechazar'
          }
        } else if (action === 'approve-maestro') {
          btn.innerHTML = '<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>'
          try {
            const { error } = await supabase
              .from('profiles')
              .update({ estado: 'activo' })
              .eq('id', event.sourceId)
            
            if (error) throw error

            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Maestro aprobado con éxito', type: 'success' } }))
            
            // Reemplazo atómico in-place
            event.actionable = false
            event.estado = 'activo'
            event.priority = 'info'
            event.icon = 'bi-person-check-fill'
            event.iconColor = '#22c55e'
            event.titulo = `Maestro registrado aprobado: ${event.titulo.replace('Nuevo maestro registrado esperando aprobación: ', '')}`

            const freshEl = _buildEventEl(event, onRefresh)
            freshEl.style.animation = 'anv-fadein 0.3s ease'
            el.replaceWith(freshEl)

            _renderKPIs()
          } catch (err) {
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Error: ' + err.message, type: 'error' } }))
            el.querySelectorAll('[data-action="approve-maestro"],[data-action="reject-maestro"]').forEach(b => b.disabled = false)
            btn.innerHTML = '<i class="bi bi-check-circle"></i> Aprobar'
          }
        } else if (action === 'reject-maestro') {
          btn.innerHTML = '<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>'
          try {
            const { error } = await supabase
              .from('profiles')
              .update({ estado: 'rechazado' })
              .eq('id', event.sourceId)
            
            if (error) throw error

            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Maestro rechazado con éxito', type: 'success' } }))
            
            // Reemplazo atómico in-place
            event.actionable = false
            event.estado = 'rechazado'
            event.priority = 'info'
            event.icon = 'bi-person-dash-fill'
            event.iconColor = '#ef4444'
            event.titulo = `Maestro registrado rechazado: ${event.titulo.replace('Nuevo maestro registrado esperando aprobación: ', '')}`

            const freshEl = _buildEventEl(event, onRefresh)
            freshEl.style.animation = 'anv-fadein 0.3s ease'
            el.replaceWith(freshEl)

            _renderKPIs()
          } catch (err) {
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Error: ' + err.message, type: 'error' } }))
            el.querySelectorAll('[data-action="approve-maestro"],[data-action="reject-maestro"]').forEach(b => b.disabled = false)
            btn.innerHTML = '<i class="bi bi-x-circle"></i> Rechazar'
          }
        }
      })
    })

    return el
  }

  function _renderTimeline() {
    const body      = container.querySelector('#anv-body')
    const showingEl = container.querySelector('#anv-showing')
    if (!body) return

    let filtered = _allEvents

    // 1. Filtrado por chip o KPI activo
    if (_activeFilter === 'critica') {
      filtered = _allEvents.filter(e => e.actionable || e.priority === 'alta')
    } else if (_activeFilter !== 'all') {
      filtered = _allEvents.filter(e => e.category === _activeFilter)
    }

    // 2. Filtrado dinámico por texto (Buscador en Caliente)
    if (_searchText.trim().length > 0) {
      const term = _searchText.toLowerCase().trim()
      filtered = filtered.filter(e => 
        (e.titulo || '').toLowerCase().includes(term) ||
        (e.subtitulo || '').toLowerCase().includes(term) ||
        (e.motivo || '').toLowerCase().includes(term) ||
        (e.maestroInstrumento || '').toLowerCase().includes(term)
      )
    }

    if (showingEl) {
      showingEl.textContent = filtered.length === 0
        ? 'Sin eventos encontrados'
        : `${filtered.length} evento${filtered.length > 1 ? 's' : ''}`
    }

    if (filtered.length === 0) {
      body.innerHTML = `
        <div class="anv-center">
          <div class="anv-center-icon"><i class="bi bi-check-circle"></i></div>
          <p class="anv-center-title">Sin novedades</p>
          <p class="anv-center-sub">No hay eventos que coincidan con la búsqueda o el filtro activo.</p>
        </div>
      `
      return
    }

    body.innerHTML = ''
    const timeline = document.createElement('div')
    timeline.className = 'anv-timeline'
    filtered.forEach(event => {
      timeline.appendChild(_buildEventEl(event, () => _load(true)))
    })
    body.appendChild(timeline)
  }

  async function _load(silent = false) {
    const refreshBtn = container.querySelector('#anv-refresh-btn')
    const body       = container.querySelector('#anv-body')

    if (refreshBtn && !silent) refreshBtn.classList.add('spinning')
    if (body && _allEvents.length === 0) {
      body.innerHTML = `
        <div class="anv-loading">
          <div class="anv-spinner"></div>
          <span>Cargando actividad operativa...</span>
        </div>
      `
    }

    try {
      _allEvents = await fetchAdminFeed()

      _renderKPIs()
      _renderFilters()
      _renderTimeline()
      
      _setupRealtimeSubscription()
    } catch (err) {
      console.error('[adminNotificacionesView] load error:', err)
      const bodyEl = container.querySelector('#anv-body')
      if (bodyEl && _allEvents.length === 0) {
        bodyEl.innerHTML = `
          <div class="anv-center">
            <div class="anv-center-icon"><i class="bi bi-exclamation-triangle"></i></div>
            <p class="anv-center-title">Error al cargar</p>
            <p class="anv-center-sub">${err.message}</p>
          </div>
        `
      }
    } finally {
      if (refreshBtn) refreshBtn.classList.remove('spinning')
    }
  }

  function _openHelpGuideModal() {
    const helpContent = `
      <style>
        .anv-help-body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--bs-body-color, #212529);
        }
        .anv-help-section {
          background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.03);
          border: 1px solid rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.15);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: transform 0.2s;
        }
        .anv-help-section:hover {
          transform: translateY(-2px);
          border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.25);
        }
        .anv-help-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 1.1rem;
          margin-right: 0.75rem;
        }
      </style>
      <div class="anv-help-body container-fluid">
        <p class="small text-muted mb-4">Esta guía te orientará en el uso del <strong>Centro de Actividad</strong>, el motor inteligente y predictivo de gobernanza y control operativo escolar.</p>
        
        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-danger bg-opacity-10 text-danger"><i class="bi bi-calendar-x-fill"></i></div>
            <h6 class="fw-bold mb-0">Gestión de Ausencias & Suplentes</h6>
          </div>
          <p class="extra-small text-secondary mb-2 lh-base">
            Cuando un maestro solicita una ausencia, el sistema activa automáticamente el **Auto-Substitution Suggester** (Motor de Reemplazo).
          </p>
          <ul class="extra-small text-secondary mb-0 ps-3 lh-base">
            <li><strong>Recomendación Inteligente:</strong> El sistema identifica en tiempo real a otros maestros activos que enseñen la misma especialidad (instrumento) y te los presenta como candidatos aptos para cubrir la vacante.</li>
            <li><strong>Acción Inline:</strong> Hacé clic en <strong>"Proponer"</strong> al lado de un candidato sugerido para asignarlo provisionalmente. También podés <strong>Aprobar</strong> o <strong>Rechazar</strong> la solicitud de ausencia directo desde la tarjeta con actualización atómica (in-place).</li>
          </ul>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <h6 class="fw-bold mb-0">Early Warning Risk Engine (Alertas de Riesgo)</h6>
          </div>
          <p class="extra-small text-secondary mb-2 lh-base">
            El sistema audita continuamente la asistencia estudiantil en busca de anomalías para prevenir la deserción:
          </p>
          <ul class="extra-small text-secondary mb-0 ps-3 lh-base">
            <li><strong>Riesgo de Deserción (Prioridad Alta - Rojo):</strong> Se dispara cuando un alumno acumula <strong>3 o más inasistencias consecutivas</strong> en los últimos 30 días. <em>Recomendación: Contactar de urgencia al tutor.</em></li>
            <li><strong>Bajo Compliance (Prioridad Media - Naranja):</strong> Se dispara si el porcentaje general de asistencia de un estudiante cae por debajo del <strong>70%</strong>. <em>Recomendación: Agendar reunión de seguimiento.</em></li>
          </ul>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-success bg-opacity-10 text-success"><i class="bi bi-broadcast"></i></div>
            <h6 class="fw-bold mb-0">Control en Vivo (Realtime WebSockets)</h6>
          </div>
          <p class="extra-small text-secondary mb-0 lh-base">
            El Centro de Actividad está conectado permanentemente a Supabase mediante WebSockets. El badge superior de **"Feed en Vivo"** te indica la salud de la conexión. Si ocurren eventos en la escuela mientras estás en otra pestaña, recibirás **notificaciones de escritorio del sistema (Web Push)** para que no te pierdas nada.
          </p>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-info bg-opacity-10 text-info"><i class="bi bi-funnel-fill"></i></div>
            <h6 class="fw-bold mb-0">Buscador & KPIs en Caliente</h6>
          </div>
          <p class="extra-small text-secondary mb-0 lh-base">
            Filtrá todo el feed interactivo al instante escribiendo en el buscador (docente, alumno, instrumento o motivo) o haciendo clic en cualquiera de las 4 tarjetas de KPIs del mini-dashboard superior.
          </p>
        </div>
      </div>
    `;

    AppModal.open({
      title: 'Guía del Usuario — Centro de Actividad',
      body: helpContent,
      size: 'lg',
      hideSave: true,
      cancelText: 'Entendido'
    });
  }

  // ── Modal: enviar notificación a maestros ──────────────────────────────
  async function _openSendModal() {
    let maestros = []
    try { maestros = await fetchMaestrosParaNotificar() } catch { /* continúa con lista vacía */ }

    const opcionesMaestros = maestros.map(m =>
      `<option value="${m.profile_id}">${m.nombre}</option>`
    ).join('')

    AppModal.open({
      title: '<i class="bi bi-send-fill me-2 text-warning"></i>Enviar notificación a maestros',
      body: `
        <div class="mb-3">
          <label class="form-label fw-semibold">Destinatarios</label>
          <select class="form-select" id="sn-destinatarios" multiple size="5">
            <option value="__all__" style="font-weight:700">📢 Todos los maestros activos</option>
            ${opcionesMaestros}
          </select>
          <div class="form-text">Ctrl+click para seleccionar varios. "Todos" hace envío masivo.</div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Título</label>
          <input type="text" class="form-control" id="sn-titulo" placeholder="Ej: Recordatorio de asistencia" maxlength="80">
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Mensaje</label>
          <textarea class="form-control" id="sn-mensaje" rows="3" placeholder="Escribe el mensaje aquí..." maxlength="300"></textarea>
          <div class="form-text" id="sn-char-count">0 / 300</div>
        </div>
        <div id="sn-status"></div>
      `,
      hideSave: true,
      onShow: () => {
        const msgEl = document.getElementById('sn-mensaje')
        const countEl = document.getElementById('sn-char-count')
        msgEl?.addEventListener('input', () => {
          if (countEl) countEl.textContent = `${msgEl.value.length} / 300`
        })
      },
    })

    // Inject send button into modal footer after open
    setTimeout(() => {
      const footer = document.querySelector('.modal-footer')
      if (!footer) return
      const sendBtn = document.createElement('button')
      sendBtn.type = 'button'
      sendBtn.className = 'btn btn-warning fw-semibold'
      sendBtn.id = 'sn-btn-send'
      sendBtn.innerHTML = '<i class="bi bi-send me-1"></i>Enviar'
      footer.appendChild(sendBtn)

      sendBtn.addEventListener('click', async () => {
        const tituloEl = document.getElementById('sn-titulo')
        const mensajeEl = document.getElementById('sn-mensaje')
        const destEl = document.getElementById('sn-destinatarios')
        const statusEl = document.getElementById('sn-status')

        const titulo = tituloEl?.value.trim()
        const mensaje = mensajeEl?.value.trim()
        const selected = Array.from(destEl?.selectedOptions || []).map(o => o.value)

        if (!titulo) { tituloEl?.classList.add('is-invalid'); return }
        if (!mensaje) { mensajeEl?.classList.add('is-invalid'); return }
        if (!selected.length) {
          if (statusEl) statusEl.innerHTML = '<div class="alert alert-warning py-2 mb-0">Seleccioná al menos un destinatario.</div>'
          return
        }

        sendBtn.disabled = true
        sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Enviando...'

        try {
          let profileIds = selected
          if (selected.includes('__all__')) {
            profileIds = maestros.map(m => m.profile_id)
          }

          const { sent } = await sendNotificacionToMaestros(profileIds, { titulo, mensaje })
          if (statusEl) statusEl.innerHTML = `
            <div class="alert alert-success py-2 mb-0">
              <i class="bi bi-check-circle me-1"></i>
              Notificación enviada a <strong>${sent}</strong> maestro${sent !== 1 ? 's' : ''}.
            </div>`
          sendBtn.innerHTML = '<i class="bi bi-check2 me-1"></i>Enviado'
          setTimeout(() => AppModal.open({ body: '' }), 1800) // close by reopening blank
        } catch (err) {
          if (statusEl) statusEl.innerHTML = `<div class="alert alert-danger py-2 mb-0">Error: ${err.message}</div>`
          sendBtn.disabled = false
          sendBtn.innerHTML = '<i class="bi bi-send me-1"></i>Enviar'
        }
      })
    }, 50)
  }

  // ── Modal: historial de notificaciones enviadas ───────────────────────────
  async function _openHistorialModal() {
    const loadingBody = `<div class="d-flex align-items-center gap-2 py-3 text-muted">
      <div class="spinner-border spinner-border-sm"></div><span>Cargando historial…</span>
    </div>`

    AppModal.open({
      title: '<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas',
      body: loadingBody,
      hideSave: true,
      cancelText: 'Cerrar',
    })

    let entries = []
    try {
      entries = await fetchNotificacionesEnviadas({ limit: 30 })
    } catch (err) {
      AppModal.open({
        title: 'Error',
        body: `<div class="alert alert-danger">No se pudo cargar el historial: ${err.message}</div>`,
        hideSave: true,
        cancelText: 'Cerrar',
      })
      return
    }

    if (!entries.length) {
      AppModal.open({
        title: '<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas',
        body: `<div class="text-center py-4 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2" style="opacity:0.3"></i>
          <p class="mb-0">Todavía no se enviaron notificaciones.</p>
        </div>`,
        hideSave: true,
        cancelText: 'Cerrar',
      })
      return
    }

    const fmtDate = iso => {
      if (!iso) return ''
      const d = new Date(iso)
      return d.toLocaleString('es-DO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const rows = entries.map(e => `
      <div class="border rounded p-3 mb-2" style="font-size:0.875rem;">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
          <strong class="text-truncate" style="max-width:70%;">${e.titulo || '(sin título)'}</strong>
          <span class="badge bg-secondary flex-shrink-0">${e.recipientCount} destinatario${e.recipientCount !== 1 ? 's' : ''}</span>
        </div>
        <p class="text-muted mb-1" style="white-space:pre-wrap;word-break:break-word;">${e.mensaje || ''}</p>
        <small class="text-muted"><i class="bi bi-clock me-1"></i>${fmtDate(e.created_at)}</small>
      </div>`).join('')

    AppModal.open({
      title: `<i class="bi bi-clock-history me-2"></i>Historial <span class="badge bg-secondary ms-1">${entries.length}</span>`,
      body: `<div style="max-height:420px;overflow-y:auto;">${rows}</div>`,
      hideSave: true,
      cancelText: 'Cerrar',
    })
  }

  // Inicialización
  _shell()
  await _load()

  // Reset badge al entrar a esta vista
  resetAdminNotifBadge()

  // Conectar botón refresh
  container.querySelector('#anv-refresh-btn')?.addEventListener('click', () => _load(false))

  // Botón enviar notificación
  container.querySelector('#anv-btn-send-notif')?.addEventListener('click', () => _openSendModal())

  // Botón historial
  container.querySelector('#anv-btn-historial')?.addEventListener('click', () => _openHistorialModal())

  // Retornar cleanup para que el router remueva el canal cuando navegue a otra vista
  return function cleanup() {
    if (_realtimeChannel) {
      supabase.removeChannel(_realtimeChannel)
      _realtimeChannel = null
    }
  }
}
