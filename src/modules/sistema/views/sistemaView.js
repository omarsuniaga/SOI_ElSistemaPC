/**
 * sistemaView.js — Vista "Sistema" del panel admin
 *
 * Muestra:
 *   · Versión actual con badge tipo y fecha
 *   · Timeline vertical de versiones anteriores
 *   · Tech stack del proyecto
 *   · Instrucciones para publicar una nueva versión
 */

import {
  CHANGELOG,
  APP_VERSION,
  APP_BUILD_DATE,
  getVersionTypeMeta,
} from '../../../core/version/CHANGELOG.js'
import { runAIDiagnostic } from '../../../services/aiDiagnosticService.js'
import { clearAppCache } from '../../../services/swCaching.js'
import { applyIndex } from '../../../services/dbOptimizer.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { renderCentroActividadesPanel } from '../components/centroActividadesPanel.js'

const TECH_STACK = [
  { icon: 'bi-lightning-charge-fill', name: 'Vite 8',        color: '#646cff', desc: 'Build tool + Dev server' },
  { icon: 'bi-filetype-js',           name: 'Vanilla JS',    color: '#f7df1e', desc: 'ES Modules, sin framework' },
  { icon: 'bi-database-fill',         name: 'Supabase',      color: '#3ecf8e', desc: 'PostgreSQL + Realtime + Auth' },
  { icon: 'bi-bootstrap-fill',        name: 'Bootstrap 5',   color: '#7952b3', desc: 'CSS utility + componentes' },
  { icon: 'bi-phone-fill',            name: 'PWA',           color: '#0ea5e9', desc: 'Service Worker + offline' },
  { icon: 'bi-check2-circle',         name: 'Vitest',        color: '#10b981', desc: 'Unit tests + coverage' },
]

export function renderSistemaView(container) {
  const latest = CHANGELOG[0]
  const latestMeta = getVersionTypeMeta(latest.type)

  container.innerHTML = `
    <div class="sv-root">

      <!-- ── Header ─────────────────────────────────────── -->
      <div class="sv-header">
        <div class="sv-header__left">
          <div class="sv-header__icon">
            <i class="bi bi-cpu-fill"></i>
          </div>
          <div>
            <h2 class="sv-header__title">Sistema SOI</h2>
            <p class="sv-header__sub">Portal Académico · Orquesta Sinfónica de Punta Cana</p>
          </div>
        </div>
        <div class="sv-version-badge">
          <span class="sv-version-num">v${APP_VERSION}</span>
          <span class="sv-version-date">${_formatDate(APP_BUILD_DATE)}</span>
        </div>
      </div>

      <!-- ── Versión actual destacada ───────────────────── -->
      <div class="sv-latest" style="border-left:4px solid ${latestMeta.color};">
        <div class="sv-latest__top">
          <span class="sv-type-badge" style="background:${latestMeta.bg};color:${latestMeta.color};">
            ${latestMeta.label}
          </span>
          <span class="sv-latest__version">v${latest.version}</span>
          <span class="sv-latest__date">${_formatDate(latest.date)}</span>
        </div>
        <h3 class="sv-latest__title">${latest.title}</h3>
        <ul class="sv-changes-list">
          ${latest.changes.map(c => `<li>${c}</li>`).join('')}
        </ul>
        ${latest.author ? `<p class="sv-latest__author"><i class="bi bi-person-fill me-1"></i>${latest.author}</p>` : ''}
      </div>

      <!-- ── Panel de Auditoría y Diagnóstico IA ───────── -->
      <div class="sv-ai-panel">
        <div class="sv-ai-header">
          <div class="sv-ai-title-wrap">
            <div class="sv-ai-icon-pulse">
              <i class="bi bi-robot"></i>
            </div>
            <div>
              <h3 class="sv-ai-title">Auditoría y Diagnóstico IA</h3>
              <p class="sv-ai-desc">Monitoreo inteligente auto-mantenible en tiempo real</p>
            </div>
          </div>
          <button id="btn-diagnose" class="btn-diagnose-pulse">
            <span class="spinner-border spinner-border-sm me-2 d-none" id="diagnose-spinner" role="status"></span>
            <i class="bi bi-shield-shaded me-1" id="diagnose-icon"></i>
            <span id="diagnose-btn-text">Diagnosticar Sistema con IA</span>
          </button>
        </div>

        <!-- Contenedor del diagnóstico -->
        <div id="ai-output-container" class="sv-ai-output d-none">
          <div class="row g-4 align-items-center">
            
            <!-- Izquierda: Health score meter -->
            <div class="col-md-4 text-center d-flex flex-column align-items-center justify-content-center">
              <div class="svg-meter-container">
                <svg class="svg-meter" viewBox="0 0 100 100">
                  <circle class="svg-meter-bg" cx="50" cy="50" r="40" />
                  <circle class="svg-meter-value" id="svg-meter-progress" cx="50" cy="50" r="40" />
                </svg>
                <div class="svg-meter-text">
                  <span id="health-score-val">0</span>
                  <span class="health-score-label">Salud</span>
                </div>
              </div>
              <div id="health-score-status" class="health-status-badge mt-2"></div>
            </div>

            <!-- Derecha: Hallazgos y Acciones -->
            <div class="col-md-8">
              <div class="findings-container mb-3">
                <h5 class="findings-title"><i class="bi bi-list-stars me-1 text-primary"></i> Hallazgos de Auditoría</h5>
                <div id="findings-list" class="findings-list"></div>
              </div>

              <!-- Workspace de optimización -->
              <div class="recommendations-workspace p-3 rounded">
                <h6 class="work-title mb-2"><i class="bi bi-magic me-1 text-warning"></i> Recomendaciones de Optimización</h6>
                
                <!-- SQL indexes -->
                <div id="sql-recommendation-box" class="rec-sub-box d-none mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="rec-label text-success"><i class="bi bi-database-check me-1"></i> Índices de Base de Datos</span>
                    <button id="btn-apply-indexes" class="btn btn-sm btn-outline-success">
                      <i class="bi bi-arrow-repeat me-1"></i> Aplicar Índices
                    </button>
                  </div>
                  <pre class="sql-code-preview m-0" id="sql-preview-text"></pre>
                </div>

                <!-- Cache strategy -->
                <div id="cache-recommendation-box" class="rec-sub-box d-none mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="rec-label text-info"><i class="bi bi-phone-vibrate me-1"></i> Optimización de Caché PWA</span>
                      <p class="rec-desc-text m-0 text-muted" id="cache-desc-text"></p>
                    </div>
                    <button id="btn-optimize-cache" class="btn btn-sm btn-outline-info">
                      <i class="bi bi-trash3 me-1"></i> Optimizar Caché
                    </button>
                  </div>
                </div>

                <!-- AI advice message -->
                <div class="ai-advice-box">
                  <i class="bi bi-chat-quote-fill text-muted me-2"></i>
                  <span id="ai-advice-text" class="fst-italic text-muted"></span>
                </div>
              </div>

            </div>

          </div>
        </div>

        <div id="ai-placeholder-container" class="sv-ai-placeholder p-4 text-center text-muted">
          <i class="bi bi-activity mb-2 d-block fs-3 opacity-50"></i>
          <p class="m-0 fs-7">Presiona el botón superior para realizar un diagnóstico completo de rendimiento y base de datos con IA.</p>
        </div>
      </div>

      <!-- ── Centro de Actividades ─────────────────────── -->
      <div id="centro-actividades-mount"></div>

      <!-- ── Grid: timeline + tech stack ───────────────── -->
      <div class="sv-grid">

        <!-- Timeline de versiones anteriores -->
        <div class="sv-section">
          <h4 class="sv-section__title">
            <i class="bi bi-clock-history"></i> Historial de versiones
          </h4>
          <div class="sv-timeline">
            ${CHANGELOG.slice(1).map(v => _renderTimelineEntry(v)).join('')}
          </div>
        </div>

        <!-- Panel derecho: tech stack + cómo versionar -->
        <div class="sv-sidebar">

          <!-- Tech stack -->
          <div class="sv-section">
            <h4 class="sv-section__title">
              <i class="bi bi-stack"></i> Tech stack
            </h4>
            <div class="sv-stack-list">
              ${TECH_STACK.map(t => `
                <div class="sv-stack-item">
                  <i class="bi ${t.icon}" style="color:${t.color};font-size:1.1rem;flex-shrink:0;"></i>
                  <div>
                    <span class="sv-stack-name">${t.name}</span>
                    <span class="sv-stack-desc">${t.desc}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Cómo publicar una nueva versión -->
          <div class="sv-section sv-section--how">
            <h4 class="sv-section__title">
              <i class="bi bi-plus-circle"></i> Publicar nueva versión
            </h4>
            <ol class="sv-how-list">
              <li>Abre <code>src/core/version/CHANGELOG.js</code></li>
              <li>Agrega un objeto al inicio del array <code>CHANGELOG</code></li>
              <li>Actualiza <code>APP_VERSION</code> y <code>APP_BUILD_DATE</code></li>
              <li>Haz deploy → la vista Sistema mostrará la nueva versión automáticamente</li>
            </ol>
            <div class="sv-how-types">
              <span class="sv-type-badge" style="background:rgba(59,130,246,0.12);color:#3b82f6;">feature</span>
              <span class="sv-type-badge" style="background:rgba(239,68,68,0.12);color:#ef4444;">fix</span>
              <span class="sv-type-badge" style="background:rgba(239,68,68,0.18);color:#dc2626;">security</span>
              <span class="sv-type-badge" style="background:rgba(139,92,246,0.12);color:#8b5cf6;">refactor</span>
              <span class="sv-type-badge" style="background:rgba(16,185,129,0.12);color:#10b981;">perf</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `

  _injectStyles()
  _bindAIDiagnostics(container)

  const centroMount = container.querySelector('#centro-actividades-mount')
  if (centroMount) renderCentroActividadesPanel(centroMount)
}

// ── Helpers ──────────────────────────────────────────────────────

function _renderTimelineEntry(v) {
  const meta = getVersionTypeMeta(v.type)
  return `
    <div class="sv-tl-entry">
      <div class="sv-tl-dot" style="background:${meta.color};"></div>
      <div class="sv-tl-body">
        <div class="sv-tl-meta">
          <span class="sv-type-badge" style="background:${meta.bg};color:${meta.color};font-size:0.65rem;">
            ${meta.label}
          </span>
          <span class="sv-tl-version">v${v.version}</span>
          <span class="sv-tl-date">${_formatDate(v.date)}</span>
        </div>
        <p class="sv-tl-title">${v.title}</p>
        <details class="sv-tl-details">
          <summary>${v.changes.length} cambio${v.changes.length !== 1 ? 's' : ''}</summary>
          <ul class="sv-changes-list sv-changes-list--sm">
            ${v.changes.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </details>
      </div>
    </div>
  `
}

function _formatDate(isoDate) {
  try {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch {
    return isoDate
  }
}

function _injectStyles() {
  if (document.getElementById('sv-styles')) return
  const s = document.createElement('style')
  s.id = 'sv-styles'
  s.textContent = `
  .sv-root {
    padding: 1.25rem 1rem 2rem;
    max-width: 1100px;
    font-family: 'Outfit', 'Inter', system-ui, sans-serif;
    color: var(--pm-text);
  }

  /* ── Centro de Actividades ─────────────────── */
  .sv-ca-section { margin: 1.5rem 0; }
  .sv-ca-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;
  }
  .sv-ca-subtitle { opacity: 0.7; margin: 0.25rem 0 0; font-size: 0.85rem; }
  .sv-ca-refresh {
    display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem;
  }
  .sv-ca-grid {
    display: grid; gap: 0.85rem;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
  .sv-ca-card {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 1rem 1.1rem; border-radius: 0.85rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: inherit; text-align: left; cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
  }
  .sv-ca-card:hover {
    background: rgba(255,255,255,0.07);
    border-color: var(--ca-color, rgba(255,255,255,0.2));
    transform: translateY(-2px);
  }
  .sv-ca-card__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: color-mix(in srgb, var(--ca-color, #888) 18%, transparent);
    color: var(--ca-color, #fff); font-size: 1.3rem;
  }
  .sv-ca-card__body { flex: 1; min-width: 0; }
  .sv-ca-card__title { font-weight: 600; font-size: 0.95rem; }
  .sv-ca-card__desc { font-size: 0.78rem; opacity: 0.65; margin-top: 0.15rem; }
  .sv-ca-card__count { flex-shrink: 0; min-width: 36px; text-align: center; }
  .sv-ca-count-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 34px; height: 34px; padding: 0 0.6rem; border-radius: 999px;
    background: rgba(255,255,255,0.1); font-weight: 700; font-size: 0.9rem;
    color: rgba(255,255,255,0.85);
  }
  .sv-ca-count-badge.is-active {
    background: var(--ca-color, #ef4444);
    color: #fff; box-shadow: 0 0 0 4px color-mix(in srgb, var(--ca-color, #ef4444) 20%, transparent);
  }
  .sv-ca-count-badge.is-error {
    background: rgba(239,68,68,0.2); color: #fecaca;
  }

  /* ── Header ─────────────────────────────────── */
  .sv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--pm-border);
  }
  .sv-header__left { display: flex; align-items: center; gap: 0.875rem; }
  .sv-header__icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--pm-primary-light, rgba(59,130,246,0.12));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; color: var(--pm-primary, #3b82f6); flex-shrink: 0;
  }
  .sv-header__title { font-size: 1.25rem; font-weight: 700; margin: 0; }
  .sv-header__sub   { font-size: 0.8rem; color: var(--pm-text-muted); margin: 0; }
  .sv-version-badge {
    display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem;
  }
  .sv-version-num {
    font-size: 1.5rem; font-weight: 800;
    background: linear-gradient(135deg, var(--pm-primary, #3b82f6), #8b5cf6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    line-height: 1;
  }
  .sv-version-date { font-size: 0.72rem; color: var(--pm-text-muted); }

  /* ── Versión actual ──────────────────────────── */
  .sv-latest {
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border);
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .sv-latest__top {
    display: flex; align-items: center; gap: 0.625rem;
    flex-wrap: wrap; margin-bottom: 0.5rem;
  }
  .sv-latest__version { font-weight: 700; font-size: 0.95rem; }
  .sv-latest__date    { font-size: 0.78rem; color: var(--pm-text-muted); margin-left: auto; }
  .sv-latest__title   { font-size: 1.05rem; font-weight: 600; margin: 0 0 0.875rem; }
  .sv-latest__author  { font-size: 0.75rem; color: var(--pm-text-muted); margin: 0.75rem 0 0; }

  /* ── Type badge ──────────────────────────────── */
  .sv-type-badge {
    padding: 0.2rem 0.55rem; border-radius: 20px;
    font-size: 0.72rem; font-weight: 600; display: inline-block;
  }

  /* ── Changes list ────────────────────────────── */
  .sv-changes-list {
    margin: 0; padding-left: 1.25rem;
    display: flex; flex-direction: column; gap: 0.3rem;
  }
  .sv-changes-list li  { font-size: 0.85rem; color: var(--pm-text); line-height: 1.5; }
  .sv-changes-list--sm li { font-size: 0.78rem; color: var(--pm-text-muted); }

  /* ── Grid layout ─────────────────────────────── */
  .sv-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.25rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .sv-grid { grid-template-columns: 1fr; }
  }

  /* ── Section ─────────────────────────────────── */
  .sv-section {
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border);
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1rem;
  }
  .sv-section--how { background: var(--pm-surface-2, rgba(255,255,255,0.04)); }
  .sv-section__title {
    font-size: 0.85rem; font-weight: 700; color: var(--pm-text-muted);
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;
  }

  /* ── Timeline ────────────────────────────────── */
  .sv-timeline { display: flex; flex-direction: column; gap: 0; }
  .sv-tl-entry {
    display: flex; gap: 0.875rem; position: relative;
    padding-bottom: 1.25rem;
  }
  .sv-tl-entry:last-child { padding-bottom: 0; }
  .sv-tl-entry:not(:last-child)::before {
    content: ''; position: absolute; left: 7px; top: 18px;
    bottom: 0; width: 2px;
    background: var(--pm-border);
  }
  .sv-tl-dot {
    width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
    margin-top: 2px; z-index: 1; position: relative;
    box-shadow: 0 0 0 3px var(--pm-surface, #fff);
  }
  .sv-tl-body   { flex: 1; min-width: 0; }
  .sv-tl-meta   { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.2rem; }
  .sv-tl-version{ font-weight: 700; font-size: 0.85rem; }
  .sv-tl-date   { font-size: 0.72rem; color: var(--pm-text-muted); margin-left: auto; }
  .sv-tl-title  { font-size: 0.85rem; font-weight: 600; margin: 0 0 0.35rem; }
  .sv-tl-details summary {
    font-size: 0.75rem; color: var(--pm-primary, #3b82f6);
    cursor: pointer; user-select: none; margin-bottom: 0.35rem;
  }

  /* ── Tech stack ──────────────────────────────── */
  .sv-stack-list { display: flex; flex-direction: column; gap: 0.625rem; }
  .sv-stack-item {
    display: flex; align-items: center; gap: 0.625rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--pm-border);
  }
  .sv-stack-item:last-child { border-bottom: none; }
  .sv-stack-name { font-size: 0.85rem; font-weight: 600; display: block; }
  .sv-stack-desc { font-size: 0.72rem; color: var(--pm-text-muted); display: block; }

  /* ── How to release ──────────────────────────── */
  .sv-how-list {
    padding-left: 1.25rem; margin: 0 0 0.875rem;
    display: flex; flex-direction: column; gap: 0.35rem;
  }
  .sv-how-list li  { font-size: 0.82rem; color: var(--pm-text); line-height: 1.55; }
  .sv-how-list code{
    background: var(--pm-surface-2, rgba(0,0,0,0.06));
    padding: 0.1rem 0.35rem; border-radius: 4px;
    font-size: 0.78rem; font-family: monospace;
  }
  .sv-how-types { display: flex; flex-wrap: wrap; gap: 0.35rem; }

  /* ── AI Panel Glassmorphism ─────────────────── */
  .sv-ai-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  [data-bs-theme="dark"] .sv-ai-panel,
  .sv-ai-panel.dark-mode {
    background: rgba(17, 25, 40, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.125);
  }

  .sv-ai-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 1rem;
  }

  .sv-ai-title-wrap {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .sv-ai-icon-pulse {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    animation: iconPulse 2s infinite alternate;
  }

  @keyframes iconPulse {
    0% { transform: scale(1); box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
    100% { transform: scale(1.08); box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); }
  }

  .sv-ai-title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sv-ai-desc {
    font-size: 0.78rem;
    color: var(--pm-text-muted, #6c757d);
    margin: 0;
  }

  .btn-diagnose-pulse {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-diagnose-pulse:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    background: linear-gradient(135deg, #4f46e5, #4338ca);
  }

  .btn-diagnose-pulse:active {
    transform: translateY(1px);
  }

  .btn-diagnose-pulse:disabled {
    background: #6c757d;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  /* ── SVG Health Meter ───────────────────────── */
  .svg-meter-container {
    position: relative;
    width: 130px;
    height: 130px;
  }

  .svg-meter {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .svg-meter-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.05);
    stroke-width: 8;
  }

  .svg-meter-value {
    fill: none;
    stroke: #10b981;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 251.2;
    stroke-dashoffset: 251.2;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease;
  }

  .svg-meter-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #health-score-val {
    font-size: 1.8rem;
    font-weight: 800;
    line-height: 1;
    color: var(--pm-text, #fff);
  }

  .health-score-label {
    font-size: 0.65rem;
    color: var(--pm-text-muted, #6c757d);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .health-status-badge {
    padding: 0.25rem 0.65rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .health-status-critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  .health-status-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
  .health-status-healthy { background: rgba(16, 185, 129, 0.15); color: #10b981; }

  /* ── Audit Findings ─────────────────────────── */
  .findings-container {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 0.85rem 1rem;
  }

  .findings-title {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.65rem;
  }

  .findings-list {
    max-height: 140px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-right: 0.25rem;
  }

  /* Custom scrollbar */
  .findings-list::-webkit-scrollbar {
    width: 4px;
  }
  .findings-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .finding-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.78rem;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.01);
  }

  .finding-badge {
    font-size: 0.6rem;
    font-weight: 800;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    text-transform: uppercase;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .finding-badge-critical { background: #ef4444; color: #fff; }
  .finding-badge-warning  { background: #f59e0b; color: #fff; }
  .finding-badge-info     { background: #3b82f6; color: #fff; }

  .finding-msg {
    color: var(--pm-text, #fff);
  }

  /* ── Recommendations Workspace ──────────────── */
  .recommendations-workspace {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .work-title {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rec-sub-box {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 0.75rem 1rem;
  }

  .rec-label {
    font-size: 0.75rem;
    font-weight: 700;
  }

  .sql-code-preview {
    font-family: 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 0.72rem;
    background: #0d0e12;
    padding: 0.6rem;
    border-radius: 6px;
    color: #38bdf8;
    overflow-x: auto;
    border: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 0.45rem !important;
  }

  .rec-desc-text {
    font-size: 0.72rem;
    opacity: 0.8;
  }

  .ai-advice-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    border-left: 2px solid #8b5cf6;
  }
  `
  document.head.appendChild(s)
}

function _bindAIDiagnostics(container) {
  const btnDiagnose = container.querySelector('#btn-diagnose')
  const diagnoseSpinner = container.querySelector('#diagnose-spinner')
  const diagnoseIcon = container.querySelector('#diagnose-icon')
  const diagnoseBtnText = container.querySelector('#diagnose-btn-text')
  
  const aiOutputContainer = container.querySelector('#ai-output-container')
  const aiPlaceholderContainer = container.querySelector('#ai-placeholder-container')
  
  const healthScoreVal = container.querySelector('#health-score-val')
  const healthScoreStatus = container.querySelector('#health-score-status')
  const svgMeterProgress = container.querySelector('#svg-meter-progress')
  const findingsList = container.querySelector('#findings-list')
  
  const sqlRecBox = container.querySelector('#sql-recommendation-box')
  const sqlPreviewText = container.querySelector('#sql-preview-text')
  const btnApplyIndexes = container.querySelector('#btn-apply-indexes')
  
  const cacheRecBox = container.querySelector('#cache-recommendation-box')
  const cacheDescText = container.querySelector('#cache-desc-text')
  const btnOptimizeCache = container.querySelector('#btn-optimize-cache')
  
  const aiAdviceText = container.querySelector('#ai-advice-text')

  let activeSQL = null

  if (!btnDiagnose) return

  btnDiagnose.addEventListener('click', async () => {
    btnDiagnose.disabled = true
    diagnoseSpinner.classList.remove('d-none')
    diagnoseIcon.classList.add('d-none')
    diagnoseBtnText.textContent = 'Analizando sistema...'

    try {
      const result = await runAIDiagnostic()
      
      aiPlaceholderContainer.classList.add('d-none')
      aiOutputContainer.classList.remove('d-none')

      const score = result.healthScore
      healthScoreVal.textContent = score

      const strokeOffset = 251.2 - (251.2 * score) / 100
      svgMeterProgress.style.strokeDashoffset = strokeOffset

      healthScoreStatus.className = 'health-status-badge mt-2'
      if (score >= 90) {
        svgMeterProgress.style.stroke = '#10b981'
        healthScoreStatus.textContent = 'Saludable'
        healthScoreStatus.classList.add('health-status-healthy')
      } else if (score >= 80) {
        svgMeterProgress.style.stroke = '#f59e0b'
        healthScoreStatus.textContent = 'Advertencia'
        healthScoreStatus.classList.add('health-status-warning')
      } else {
        svgMeterProgress.style.stroke = '#ef4444'
        healthScoreStatus.textContent = 'Crítico'
        healthScoreStatus.classList.add('health-status-critical')
      }

      findingsList.innerHTML = result.findings.length > 0 
        ? result.findings.map(f => {
            const badgeClass = f.severity === 'critical' 
              ? 'finding-badge-critical' 
              : (f.severity === 'warning' ? 'finding-badge-warning' : 'finding-badge-info')
            return `
              <div class="finding-item">
                <span class="finding-badge ${badgeClass}">${f.severity}</span>
                <span class="finding-msg">${f.msg}</span>
              </div>
            `
          }).join('')
        : `<div class="text-muted fs-7 p-2">No se detectaron anomalías ni advertencias en el sistema.</div>`

      if (result.recommendations?.sql) {
        activeSQL = result.recommendations.sql
        sqlPreviewText.textContent = activeSQL
        sqlRecBox.classList.remove('d-none')
        btnApplyIndexes.disabled = false
        btnApplyIndexes.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Aplicar Índices'
      } else {
        sqlRecBox.classList.add('d-none')
        activeSQL = null
      }

      if (result.recommendations?.cache === 'clear') {
        cacheDescText.textContent = 'Se detectaron errores recientes en el reportero. Se recomienda purgar la caché PWA para limpiar posibles inconsistencias de carga.'
        cacheRecBox.classList.remove('d-none')
        btnOptimizeCache.disabled = false
        btnOptimizeCache.innerHTML = '<i class="bi bi-trash3 me-1"></i> Optimizar Caché'
      } else {
        cacheRecBox.classList.add('d-none')
      }

      aiAdviceText.textContent = result.recommendations?.advice || 'El sistema funciona de forma óptima.'

      AppToast.success('Diagnóstico de IA completado con éxito.')
    } catch (err) {
      console.error(err)
      AppToast.error('Error al ejecutar diagnóstico: ' + err.message)
    } finally {
      btnDiagnose.disabled = false
      diagnoseSpinner.classList.add('d-none')
      diagnoseIcon.classList.remove('d-none')
      diagnoseBtnText.textContent = 'Diagnosticar Sistema con IA'
    }
  })

  btnApplyIndexes?.addEventListener('click', async () => {
    if (!activeSQL) return
    btnApplyIndexes.disabled = true
    btnApplyIndexes.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Aplicando...'
    
    try {
      const res = applyIndex(activeSQL)
      if (res.success) {
        AppToast.success(res.message || 'Índices aplicados con éxito en memoria.')
        btnApplyIndexes.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Aplicado'
      } else {
        AppToast.error('Error al aplicar índices: ' + res.error)
        btnApplyIndexes.disabled = false
        btnApplyIndexes.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Reintentar'
      }
    } catch (err) {
      AppToast.error('Fallo inesperado al optimizar base de datos: ' + err.message)
      btnApplyIndexes.disabled = false
      btnApplyIndexes.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Reintentar'
    }
  })

  btnOptimizeCache?.addEventListener('click', async () => {
    btnOptimizeCache.disabled = true
    btnOptimizeCache.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Limpiando...'
    
    try {
      const res = await clearAppCache()
      if (res.success) {
        AppToast.success('Caché PWA depurada correctamente.')
        btnOptimizeCache.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Caché Limpia'
      } else {
        AppToast.error('Error al limpiar caché: ' + res.error)
        btnOptimizeCache.disabled = false
        btnOptimizeCache.innerHTML = '<i class="bi bi-trash3 me-1"></i> Optimizar Caché'
      }
    } catch (err) {
      AppToast.error('Fallo inesperado al limpiar caché: ' + err.message)
      btnOptimizeCache.disabled = false
      btnOptimizeCache.innerHTML = '<i class="bi bi-trash3 me-1"></i> Optimizar Caché'
    }
  })
}
