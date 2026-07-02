/**
 * planificacionView.js
 * Portal Maestros — PLAN alineado con ACM como fuente de verdad.
 *
 * ACM define la guía base.
 * El maestro puede registrar AJUSTES CONTROLADOS por clase/semana.
 * Estos ajustes NO modifican la planificación canónica de ACM.
 */

import { getMisClases, getInscripcionesClases } from '../services/maestroDataService.js'
import * as weeklyPlanAdapter from '../../modules/planificacion/api/weeklyPlanAdapter.js'
import { announce } from '../utils/a11yUtils.js'
import { AppToast } from '../../shared/components/AppToast.js'
import * as bootstrap from 'bootstrap'

// ─── Constantes ────────────────────────────────────────────────────────────────

const STATUS_META = {
  achieved:             { label: 'Dominado',          icon: '🟢', cardClass: 'estado-completado' },
  exceeded:             { label: 'Sobresaliente',      icon: '🔵', cardClass: 'estado-completado' },
  in_process:           { label: 'En proceso',         icon: '🟡', cardClass: 'estado-parcial' },
  needs_reinforcement:  { label: 'Requiere refuerzo',  icon: '🟠', cardClass: 'estado-parcial' },
  failed:               { label: 'No logrado',         icon: '🔴', cardClass: 'estado-no_iniciado' },
  not_started:          { label: 'Sin iniciar',        icon: '⚪', cardClass: 'estado-no_iniciado' },
}

const INSTRUMENT_ICONS = {
  violin: '🎻', viola: '🎻', cello: '🎻', contrabajo: '🎻', chelo: '🎻',
  piano: '🎹', teclado: '🎹',
  guitarra: '🎸', bajo: '🎸', ukulele: '🎸',
  flauta: '🪈', clarinete: '🎵', oboe: '🎵', fagot: '🎵', saxofon: '🎵',
  trompeta: '🎺', trombon: '🎺', tuba: '🎺', corno: '🎺', corneta: '🎺',
  percusion: '🥁', bateria: '🥁', marimba: '🥁', xilofono: '🥁', timbal: '🥁',
  canto: '🎤', voz: '🎤', vocal: '🎤',
  arpa: '🪗', acordeon: '🪗',
  teoria: '📖', solfeo: '📖', armonia: '📖', historia: '📖',
}

// ─── Funciones utilitarias puras ───────────────────────────────────────────────

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.not_started
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
}

/**
 * Devuelve un emoji representativo según el instrumento de la clase.
 * Normaliza tildes y mayúsculas para maximizar coincidencias.
 */
function getInstrumentIcon(instrumento) {
  if (!instrumento) return '🎼'
  const key = instrumento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return Object.entries(INSTRUMENT_ICONS).find(([k]) => key.includes(k))?.[1] || '🎼'
}

/**
 * Retorna el color CSS según el porcentaje de avance (semáforo).
 * ≥70% verde, ≥30% ámbar, <30% rojo.
 */
function getProgressColor(pct) {
  if (pct >= 70) return '#10b981'
  if (pct >= 30) return '#f59e0b'
  return '#ef4444'
}

function uniqueWeeklyIndicators(plan) {
  const seen = new Set()
  return (plan?.items || []).filter((item) => {
    const key = item.indicator_id || `${item.node_id}:${item.topic}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildIndicatorCards(plan, progressMap, studentIds) {
  const totalStudents = studentIds.length

  return uniqueWeeklyIndicators(plan).map((item) => {
    const statuses = studentIds
      .map((sid) => progressMap[`${sid}_${item.indicator_id}`]?.status || 'not_started')

    const achievedCount  = statuses.filter((s) => ['achieved', 'exceeded'].includes(s)).length
    const inProcessCount = statuses.filter((s) => ['in_process', 'needs_reinforcement'].includes(s)).length

    let overallStatus = 'not_started'
    if (achievedCount > 0 && achievedCount === totalStudents && totalStudents > 0) overallStatus = 'achieved'
    else if (achievedCount > 0 || inProcessCount > 0) overallStatus = 'in_process'

    const meta = getStatusMeta(overallStatus)

    return {
      id: item.indicator_id || item.node_id || item.id,
      weekNumber: item.week_number,
      topic: item.topic,
      objective: item.objective,
      evidence: item.evidence,
      assessmentMethod: item.assessment_method,
      teacherStrategy: item.teacher_strategy,
      progressPercentage: totalStudents > 0 ? Math.round((achievedCount / totalStudents) * 100) : 0,
      achievedCount,
      totalStudents,
      overallStatus,
      meta,
    }
  })
}

function calcProgressForClase(guide, progressMap, ins) {
  const studentIds = ins.map((i) => i.alumno_id).filter(Boolean)
  const uniqueIndicatorsList = uniqueWeeklyIndicators(guide?.plan)
  const totalIndicators = uniqueIndicatorsList.length
  let progressPercentage = 0

  if (totalIndicators > 0 && studentIds.length > 0) {
    let achievedCount = 0
    uniqueIndicatorsList.forEach((item) => {
      studentIds.forEach((sid) => {
        const status = progressMap[`${sid}_${item.indicator_id}`]?.status || 'not_started'
        if (['achieved', 'exceeded'].includes(status)) achievedCount++
      })
    })
    progressPercentage = Math.round((achievedCount / (totalIndicators * studentIds.length)) * 100)
  }

  return { progressPercentage, totalStudents: studentIds.length }
}

// ─── Render helpers ────────────────────────────────────────────────────────────

function renderSkeletonGrid(count = 3) {
  return `
    <h3 class="pm-section-heading">Mis Clases</h3>
    <div class="pm-planning-classes-grid">
      ${Array(count).fill(0).map(() => `
        <div class="pm-class-card-skeleton">
          <div class="pm-sk pm-sk-icon"></div>
          <div class="pm-sk-body">
            <div class="pm-sk pm-sk-title"></div>
            <div class="pm-sk pm-sk-badge"></div>
            <div class="pm-sk pm-sk-bar"></div>
            <div class="pm-sk pm-sk-stats"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function renderEmptyState(container, message) {
  container.innerHTML = `<div class="pm-planning-empty"><p>${escapeHtml(message)}</p></div>`
}

// ─── Vista principal ───────────────────────────────────────────────────────────

export async function renderPlanificacionView(container, { maestroId }) {
  let currentClaseId    = null
  let currentGuide      = null
  let currentIndicators = []
  let currentAdjustmentsMap   = {}
  let currentGuideProgressMap = {}
  let inscripciones           = []

  // Inyectar estilos solo si aún no existen en el documento
  if (!document.getElementById('pm-planning-styles')) {
    const styleEl = document.createElement('style')
    styleEl.id = 'pm-planning-styles'
    styleEl.textContent = `
      /* ── Layout ── */
      .pm-planning-container { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }

      /* ── Header ── */
      .pm-planning-header {
        background: linear-gradient(135deg, var(--pm-primary, #3b82f6), #1d4ed8);
        color: white; padding: 2rem; border-radius: 20px; margin-bottom: 1.5rem;
        position: relative; overflow: hidden;
      }
      .pm-planning-header::before {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%);
        pointer-events: none;
      }
      .pm-planning-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.5rem 0; letter-spacing: -0.02em; }

      /* ── Stepper slider ── */
      .pm-stepper {
        display: flex; align-items: center; gap: 0.75rem;
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--pm-border); border-radius: 16px;
        padding: 0.85rem 1rem; margin-bottom: 1.5rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.04);
        min-height: 72px;
      }
      .pm-stepper-nav {
        background: transparent; border: 1px solid var(--pm-border); border-radius: 8px;
        width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--pm-text-muted); font-size: 0.85rem; flex-shrink: 0;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
        outline: none;
      }
      .pm-stepper-nav:hover { border-color: var(--pm-primary); color: var(--pm-primary); background: rgba(59,130,246,0.06); }
      .pm-stepper-nav:disabled { opacity: 0.3; cursor: default; }
      .pm-stepper-track { flex: 1; overflow: hidden; position: relative; }
      .pm-stepper-slide {
        display: flex; gap: 0; width: 100%;
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .pm-stepper-item {
        min-width: 100%; display: flex; align-items: center; gap: 0.75rem;
        padding: 0 0.25rem;
      }
      .pm-step-num {
        width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white; display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 0.82rem;
        box-shadow: 0 2px 8px rgba(59,130,246,0.35);
      }
      .pm-stepper-content h4 { margin: 0 0 0.1rem 0; font-size: 0.88rem; font-weight: 700; color: var(--pm-text); }
      .pm-stepper-content p  { margin: 0; font-size: 0.76rem; color: var(--pm-text-muted); line-height: 1.3; }
      .pm-stepper-dots {
        display: flex; gap: 5px; flex-shrink: 0; align-items: center;
      }
      .pm-stepper-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--pm-border); transition: background 0.2s, transform 0.2s;
        cursor: pointer; border: none; padding: 0;
      }
      .pm-stepper-dot.active {
        background: var(--pm-primary); transform: scale(1.3);
      }

      /* ── Sección heading ── */
      .pm-section-heading {
        font-size: 1.1rem; font-weight: 700; color: var(--pm-text);
        margin: 0 0 1rem 0; letter-spacing: -0.01em;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .pm-section-heading::after {
        content: ''; flex: 1; height: 1px; background: var(--pm-border);
      }

      /* ── Grid de clases ── */
      .pm-planning-classes-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 0.75rem; margin-bottom: 1.5rem;
      }
      .pm-class-card-interactive {
        background: var(--pm-surface); border: 1px solid var(--pm-border);
        border-radius: 14px; padding: 0.85rem 0.9rem; cursor: pointer;
        transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, border-color 0.18s ease;
        display: flex; align-items: center; gap: 0.85rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        animation: pm-card-in 0.35s ease both;
      }
      .pm-class-card-interactive:hover {
        transform: translateY(-3px) scale(1.01);
        box-shadow: 0 8px 20px rgba(0,0,0,0.09);
        border-color: var(--pm-primary);
      }
      .pm-class-card-interactive:focus-visible {
        outline: 2px solid var(--pm-primary); outline-offset: 2px;
      }
      @keyframes pm-card-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .pm-class-card-avatar {
        width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.35rem; line-height: 1;
        background: rgba(59,130,246,0.08);
      }
      .pm-class-card-body { flex: 1; min-width: 0; }
      .pm-class-card-top {
        display: flex; align-items: center; justify-content: space-between;
        gap: 0.4rem; margin-bottom: 0.2rem;
      }
      .pm-class-card-title {
        font-size: 0.9rem; font-weight: 700; margin: 0;
        color: var(--pm-text); line-height: 1.2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pm-class-card-badge {
        font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.45rem;
        border-radius: 5px; flex-shrink: 0; white-space: nowrap;
      }
      .pm-class-card-plan {
        font-size: 0.7rem; color: var(--pm-text-muted); margin-bottom: 0.4rem;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pm-class-card-meta {
        display: flex; align-items: center; gap: 0.6rem;
        font-size: 0.7rem; color: var(--pm-text-muted);
      }
      .pm-class-card-meta-item { display: flex; align-items: center; gap: 0.2rem; }
      .pm-class-card-progress { flex: 1; }
      .pm-class-card-progress-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 0.2rem;
      }
      .pm-progress-pct { font-size: 0.7rem; font-weight: 700; }

      /* ── Skeleton loading ── */
      .pm-class-card-skeleton {
        background: var(--pm-surface); border: 1px solid var(--pm-border);
        border-radius: 14px; padding: 0.85rem 0.9rem;
        display: flex; align-items: center; gap: 0.85rem;
      }
      .pm-sk {
        border-radius: 8px;
        background: linear-gradient(90deg, var(--pm-border) 25%, rgba(255,255,255,0.06) 50%, var(--pm-border) 75%);
        background-size: 200% 100%;
        animation: pm-shimmer 1.4s infinite;
      }
      @keyframes pm-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .pm-sk-icon  { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }
      .pm-sk-body  { flex: 1; display: flex; flex-direction: column; gap: 0.45rem; }
      .pm-sk-title { height: 14px; width: 65%; border-radius: 6px; }
      .pm-sk-badge { height: 11px; width: 40%; border-radius: 5px; }
      .pm-sk-bar   { height: 5px; width: 100%; border-radius: 999px; }
      .pm-sk-stats { height: 10px; width: 55%; border-radius: 5px; }

      /* ── Estado vacío ── */
      .pm-planning-empty { text-align: center; padding: 3rem 1rem; color: var(--pm-text-muted); }

      /* ── Modal — pestañas ── */
      .pm-tab-btn {
        background: transparent; border: none; border-bottom: 2px solid transparent;
        padding: 0.7rem 1.1rem; font-weight: 600; font-size: 0.88rem;
        color: var(--pm-text-muted); cursor: pointer; transition: color 0.15s, border-color 0.15s;
        display: flex; align-items: center; gap: 0.4rem; white-space: nowrap;
        outline: none;
      }
      .pm-tab-btn:hover { color: var(--pm-text); }
      .pm-tab-btn.active { color: var(--pm-primary); border-bottom-color: var(--pm-primary); }
      .pm-tab-count {
        background: rgba(59,130,246,0.12); color: var(--pm-primary);
        font-size: 0.68rem; font-weight: 700; border-radius: 999px;
        padding: 0.1rem 0.45rem; line-height: 1.4;
      }
      .pm-tab-btn.active .pm-tab-count { background: var(--pm-primary); color: #fff; }

      /* ── Acordeón de semanas ── */
      .pm-week-item {
        border: 1px solid var(--pm-border); border-radius: 14px;
        overflow: hidden; margin-bottom: 0.75rem; background: var(--pm-surface);
        transition: box-shadow 0.2s;
      }
      .pm-week-item.is-current { border-color: var(--pm-primary); box-shadow: 0 0 0 1px var(--pm-primary); }
      .pm-week-header {
        display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
        cursor: pointer; user-select: none;
        background: transparent; border: none; width: 100%; text-align: left;
        color: var(--pm-text); font-size: 0.92rem; outline: none;
      }
      .pm-week-status-dot {
        width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      }
      .pm-week-status-dot.past    { background: var(--pm-text-muted); }
      .pm-week-status-dot.current { background: var(--pm-primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
      .pm-week-status-dot.upcoming{ background: var(--pm-border); border: 1px solid var(--pm-text-muted); }
      .pm-week-chevron {
        margin-left: auto; font-size: 0.8rem; transition: transform 0.2s ease; color: var(--pm-text-muted);
      }
      .pm-week-chevron.open { transform: rotate(180deg); }
      .pm-week-body { display: none; border-top: 1px solid var(--pm-border); }
      .pm-week-body.open { display: block; }

      /* ── Indicadores ── */
      .pm-indicator-card {
        background: var(--pm-surface); border: 1px solid var(--pm-border);
        border-radius: 14px; padding: 1rem 1.1rem; margin-bottom: 0.75rem;
        transition: box-shadow 0.2s;
      }
      .pm-indicator-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

      /* ── Responsivo ── */
      @media (max-width: 768px) {
        .pm-planning-container { padding: 0.75rem; }
        .pm-planning-header { padding: 1.25rem; border-radius: 14px; }
        .pm-planning-instructions-steps { grid-template-columns: 1fr; }
        .pm-planning-classes-grid { grid-template-columns: 1fr; }
        .pm-tab-btn { padding: 0.6rem 0.7rem; font-size: 0.82rem; }
      }
    `
    document.head.appendChild(styleEl)
  }

  container.innerHTML = `
    <div class="pm-planning-container">
      <div class="pm-planning-header">
        <h1 class="pm-planning-title">📚 Planificación Académica</h1>
        <p style="margin:0; opacity:0.88; font-size:0.95rem; line-height:1.5;">
          ACM define la guía institucional. Adapta pedagógicamente la ejecución de tu grupo
          y evalúa el progreso en tiempo real.
        </p>
      </div>

      <div class="pm-stepper" id="pm-guide-stepper" aria-label="Guía de uso paso a paso" role="region">
        <button class="pm-stepper-nav" id="pm-step-prev" aria-label="Paso anterior" type="button">‹</button>
        <div class="pm-stepper-track">
          <div class="pm-stepper-slide" id="pm-step-slide">
            <div class="pm-stepper-item">
              <div class="pm-step-num">1</div>
              <div class="pm-stepper-content">
                <h4>Selecciona tu clase</h4>
                <p>Haz clic en cualquier tarjeta del grid para cargar el cronograma y alumnos.</p>
              </div>
            </div>
            <div class="pm-stepper-item">
              <div class="pm-step-num">2</div>
              <div class="pm-stepper-content">
                <h4>Revisa el Perfil ACM</h4>
                <p>Visualiza el plan curricular y la cobertura real de tu grupo en el ciclo.</p>
              </div>
            </div>
            <div class="pm-stepper-item">
              <div class="pm-step-num">3</div>
              <div class="pm-stepper-content">
                <h4>Ajusta tu ejecución</h4>
                <p>Personaliza estrategias, tareas y evidencias sin alterar el plan base de ACM.</p>
              </div>
            </div>
            <div class="pm-stepper-item">
              <div class="pm-step-num">4</div>
              <div class="pm-stepper-content">
                <h4>Evalúa indicadores</h4>
                <p>Marca logros de forma grupal o califica individualmente a cada estudiante.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="pm-stepper-dots" id="pm-step-dots" role="tablist" aria-label="Pasos">
          <button class="pm-stepper-dot active" data-step="0" aria-label="Paso 1" aria-selected="true" role="tab" type="button"></button>
          <button class="pm-stepper-dot" data-step="1" aria-label="Paso 2" aria-selected="false" role="tab" type="button"></button>
          <button class="pm-stepper-dot" data-step="2" aria-label="Paso 3" aria-selected="false" role="tab" type="button"></button>
          <button class="pm-stepper-dot" data-step="3" aria-label="Paso 4" aria-selected="false" role="tab" type="button"></button>
        </div>
        <button class="pm-stepper-nav" id="pm-step-next" aria-label="Paso siguiente" type="button">›</button>
      </div>

      <div id="pm-planning-content" aria-live="polite">
        ${renderSkeletonGrid(3)}
      </div>
    </div>
  `

  const contentDiv   = container.querySelector('#pm-planning-content')
  let classDetailModal = null

  // ─── Stepper de instrucciones ────────────────────────────────────────────────
  ;(function initStepper() {
    const slide   = container.querySelector('#pm-step-slide')
    const dots    = container.querySelectorAll('#pm-step-dots .pm-stepper-dot')
    const btnPrev = container.querySelector('#pm-step-prev')
    const btnNext = container.querySelector('#pm-step-next')
    if (!slide) return

    const total = dots.length
    let current = 0

    function goTo(idx) {
      current = Math.max(0, Math.min(total - 1, idx))
      slide.style.transform = `translateX(-${current * 100}%)`
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current)
        d.setAttribute('aria-selected', String(i === current))
      })
      if (btnPrev) btnPrev.disabled = current === 0
      if (btnNext) btnNext.disabled = current === total - 1
    }

    btnPrev?.addEventListener('click', () => goTo(current - 1))
    btnNext?.addEventListener('click', () => goTo(current + 1))
    dots.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.step))))

    // Auto-avance cada 5s — se detiene en la última slide
    let autoTimer = setInterval(() => {
      if (current < total - 1) goTo(current + 1)
      else clearInterval(autoTimer)
    }, 5000)

    // Detener auto-avance si el usuario interactúa
    container.querySelector('#pm-guide-stepper')?.addEventListener('pointerdown', () => clearInterval(autoTimer))

    goTo(0)
  })()

  // ─── Actualización parcial de una tarjeta (evita recargar todo el grid) ───
  async function updateClassCard(claseId) {
    const card = contentDiv.querySelector(`[data-clase-id="${claseId}"]`)
    if (!card) return
    try {
      const [guide, progressMap, ins] = await Promise.all([
        weeklyPlanAdapter.obtenerGuiaHeredadaPorClase(claseId, maestroId).catch(() => null),
        weeklyPlanAdapter.obtenerProgresoGrupo(claseId).catch(() => ({})),
        getInscripcionesClases([claseId]).catch(() => []),
      ])
      const { progressPercentage } = calcProgressForClase(guide, progressMap, ins)
      const color = getProgressColor(progressPercentage)
      const progressBar = card.querySelector('.pm-card-progress-bar')
      const pctLabel    = card.querySelector('.pm-progress-pct')
      if (progressBar) { progressBar.style.width = `${progressPercentage}%`; progressBar.style.backgroundColor = color }
      if (pctLabel)    pctLabel.textContent = `${progressPercentage}%`
    } catch (e) {
      console.warn('[planning] No se pudo actualizar la tarjeta:', e)
    }
  }

  // ─── Carga y renderizado del grid de clases ────────────────────────────────
  async function loadClassesGrid() {
    contentDiv.innerHTML = renderSkeletonGrid(3)

    try {
      const clases = await getMisClases()
      if (clases.length === 0) {
        contentDiv.innerHTML = `
          <div class="pm-planning-empty">
            <div style="font-size:3rem; margin-bottom:1rem;">📋</div>
            <p style="font-size:1.05rem; font-weight:600; margin-bottom:0.25rem;">Sin clases asignadas</p>
            <p style="font-size:0.85rem;">Cuando ACM te asigne clases aparecerán aquí.</p>
          </div>`
        announce('No tienes clases asignadas actualmente.')
        return
      }

      // FIX C-4: Promise.allSettled — tolerante a fallos individuales
      const results = await Promise.allSettled(clases.map(async (clase) => {
        const [guide, progressMap, ins] = await Promise.all([
          weeklyPlanAdapter.obtenerGuiaHeredadaPorClase(clase.id, maestroId).catch(() => null),
          weeklyPlanAdapter.obtenerProgresoGrupo(clase.id).catch(() => ({})),
          getInscripcionesClases([clase.id]).catch(() => []),
        ])
        const { progressPercentage, totalStudents } = calcProgressForClase(guide, progressMap, ins)
        return { ...clase, currentWeek: guide?.route?.current_week || 1, hasGuide: !!guide, progressPercentage, totalStudents }
      }))

      const clasesConMetricas = results.map((r, i) =>
        r.status === 'fulfilled' ? r.value : { ...clases[i], currentWeek: 1, hasGuide: false, progressPercentage: 0, totalStudents: 0 }
      )

      contentDiv.innerHTML = `
        <h3 class="pm-section-heading">Mis Clases <span style="font-size:0.82rem; font-weight:500; color:var(--pm-text-muted);">(${clasesConMetricas.length})</span></h3>
        <div class="pm-planning-classes-grid">
          ${clasesConMetricas.map((clase, idx) => {
            const icon  = getInstrumentIcon(clase.instrumento)
            const color = getProgressColor(clase.progressPercentage)
            const hasProgress = clase.hasGuide && clase.totalStudents > 0
            return `
              <div class="pm-class-card-interactive" data-clase-id="${clase.id}"
                   role="button" tabindex="0" aria-label="Abrir clase ${escapeHtml(clase.nombre)}"
                   style="animation-delay:${idx * 60}ms;">

                <!-- Avatar circular con ícono de instrumento -->
                <div class="pm-class-card-avatar">${icon}</div>

                <!-- Cuerpo compacto -->
                <div class="pm-class-card-body">
                  <div class="pm-class-card-top">
                    <h4 class="pm-class-card-title">${escapeHtml(clase.nombre)}</h4>
                    <span class="pm-class-card-badge" style="${clase.hasGuide
                      ? 'background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.25);'
                      : 'background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2);'}">
                      ${clase.hasGuide ? '● ACM' : '○ Sin guía'}
                    </span>
                  </div>

                  <div class="pm-class-card-plan">${escapeHtml(clase.plan_estudio || 'Sin plan curricular')}</div>

                  ${hasProgress ? `
                    <div class="pm-class-card-progress">
                      <div class="pm-class-card-progress-row">
                        <div class="pm-class-card-meta">
                          <span class="pm-class-card-meta-item">👥 ${clase.totalStudents}</span>
                          <span class="pm-class-card-meta-item">· Sem. ${clase.currentWeek}</span>
                        </div>
                        <span class="pm-progress-pct" style="color:${color};">${clase.progressPercentage}%</span>
                      </div>
                      <div style="height:4px; border-radius:999px; background:var(--pm-border); overflow:hidden;">
                        <div class="pm-card-progress-bar" style="height:100%; width:${clase.progressPercentage}%; background:${color}; border-radius:999px; transition:width 0.5s ease;"></div>
                      </div>
                    </div>
                  ` : `
                    <div class="pm-class-card-meta" style="margin-top:0.1rem;">
                      <span class="pm-class-card-meta-item">👥 ${clase.totalStudents}</span>
                      <span class="pm-class-card-meta-item" style="color:var(--pm-text-muted); font-style:italic;">
                        · ${clase.hasGuide ? 'Sin inscritos' : 'Sin guía ACM'}
                      </span>
                    </div>
                  `}
                </div>
              </div>
            `
          }).join('')}
        </div>
      `

      announce(`${clasesConMetricas.length} clases cargadas.`)

      // Listeners en tarjetas — soporta clic y Enter/Space
      contentDiv.querySelectorAll('.pm-class-card-interactive').forEach((card) => {
        const handler = async () => {
          const claseId  = card.dataset.claseId
          const selected = clasesConMetricas.find((c) => String(c.id) === String(claseId))
          if (!selected) return
          currentClaseId = selected.id
          await refreshData()
          openClassDetail(selected)
        }
        card.addEventListener('click', handler)
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler() } })
      })

    } catch (error) {
      console.error('[planning] Error renderizando clases:', error)
      AppToast.error('No se pudieron cargar las clases asignadas.')
      renderEmptyState(contentDiv, 'No se pudieron cargar tus clases.')
    }
  }

  // ─── Refresco de estado de la clase activa ──────────────────────────────────
  async function refreshData() {
    if (!currentClaseId) return
    try {
      const [guide, ins, progressMap] = await Promise.all([
        weeklyPlanAdapter.obtenerGuiaHeredadaPorClase(currentClaseId, maestroId).catch(() => null),
        getInscripcionesClases([currentClaseId]).catch(() => []),
        weeklyPlanAdapter.obtenerProgresoGrupo(currentClaseId).catch(() => ({})),
      ])
      currentGuide            = guide
      inscripciones           = ins
      currentGuideProgressMap = progressMap
      currentAdjustmentsMap   = await loadTeacherAdjustmentsMap(guide?.route?.weekly_plan_id)
      const studentIds        = ins.map((i) => i.alumno_id).filter(Boolean)
      currentIndicators       = buildIndicatorCards(guide?.plan, progressMap, studentIds)
    } catch (e) {
      console.error('[planning] Error al refrescar datos:', e)
    }
  }

  async function loadTeacherAdjustmentsMap(weeklyPlanId) {
    if (!currentClaseId || !maestroId || !weeklyPlanId) return {}
    const adjustments = await weeklyPlanAdapter
      .obtenerAjustesPlanDocente(currentClaseId, maestroId, weeklyPlanId)
      .catch(() => [])
    return adjustments.reduce((acc, item) => { acc[String(item.week_number)] = item; return acc }, {})
  }

  function resolveWeekItem(item) {
    const adjustment = currentAdjustmentsMap[String(item.week_number)] || null
    return {
      ...item,
      teacher_strategy: adjustment?.teacher_strategy ?? item.teacher_strategy,
      student_activity: adjustment?.student_activity ?? item.student_activity,
      homework:         adjustment?.homework ?? item.homework,
      evidence:         adjustment?.evidence ?? item.evidence,
      teacher_notes:    adjustment?.teacher_notes ?? '',
      hasTeacherAdjustment: Boolean(adjustment),
    }
  }

  // ─── Modal detallado ────────────────────────────────────────────────────────
  function openClassDetail(clase, initialTab = 'general') {
    // FIX C-3: Dispose de la instancia Bootstrap antes de remover el modal
    if (classDetailModal) {
      bootstrap.Modal.getInstance(classDetailModal)?.dispose()
      classDetailModal.remove()
      classDetailModal = null
    }

    const route     = currentGuide?.route
    const plan      = currentGuide?.plan
    const weekItems = plan?.items || []
    const currentWeekNum = route?.current_week || 1

    const tabCounts = {
      general:     '',
      temas:       weekItems.length > 0 ? weekItems.length : '',
      indicadores: currentIndicators.length > 0 ? currentIndicators.length : '',
    }

    function tabBtn(key, icon, label) {
      const count = tabCounts[key]
      return `
        <button class="pm-tab-btn ${initialTab === key ? 'active' : ''}" data-tab="${key}" type="button">
          ${icon} ${label}
          ${count ? `<span class="pm-tab-count">${count}</span>` : ''}
        </button>
      `
    }

    classDetailModal = document.createElement('div')
    classDetailModal.className = 'modal fade'
    classDetailModal.setAttribute('tabindex', '-1')
    classDetailModal.setAttribute('aria-hidden', 'true')
    classDetailModal.setAttribute('aria-label', `Detalle de clase: ${clase.nombre}`)

    classDetailModal.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="background:var(--pm-surface); color:var(--pm-text); border:1px solid var(--pm-border); border-radius:20px; box-shadow:0 24px 64px rgba(0,0,0,0.15);">

          <!-- Header del modal -->
          <div class="modal-header border-0 pb-0" style="padding:1.5rem 1.5rem 0.75rem;">
            <div style="display:flex; align-items:center; gap:0.9rem; flex:1; min-width:0;">
              <div style="width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; background:rgba(59,130,246,0.1); flex-shrink:0;">
                ${getInstrumentIcon(clase.instrumento)}
              </div>
              <div style="min-width:0;">
                <h4 style="margin:0; font-weight:800; font-size:1.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--pm-text);">
                  ${escapeHtml(clase.nombre)}
                </h4>
                <div style="font-size:0.8rem; color:var(--pm-text-muted); margin-top:0.15rem;">
                  ${escapeHtml(clase.plan_estudio || 'Sin plan')}
                  ${route?.current_week ? ` · <strong style="color:var(--pm-primary);">Semana ${route.current_week} activa</strong>` : ''}
                </div>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>

          <!-- Pestañas -->
          <div style="display:flex; gap:0; padding:0 1.5rem; border-bottom:1px solid var(--pm-border); overflow-x:auto;">
            ${tabBtn('general',     '📋', 'Perfil')}
            ${tabBtn('temas',       '📅', 'Temas y Ajustes')}
            ${tabBtn('indicadores', '🎯', 'Indicadores')}
          </div>

          <!-- Cuerpo -->
          <div class="modal-body" style="padding:1.5rem; min-height:360px;">

            <!-- ── Pestaña: Perfil y Cobertura ── -->
            <div class="pm-tab-pane ${initialTab === 'general' ? '' : 'd-none'}" data-pane="general">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div style="padding:1.1rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.015)); height:100%;">
                    <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.6px; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.5rem;">Perfil Curricular</div>
                    <div style="font-weight:700; font-size:1.05rem; margin-bottom:0.5rem; color:var(--pm-text);">${escapeHtml(clase.plan_estudio || 'Sin plan asignado')}</div>
                    <p style="font-size:0.82rem; color:var(--pm-text-muted); margin:0; line-height:1.5;">${escapeHtml(clase.descripcion || 'Clase de formación activa dentro del plan institucional.')}</p>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div style="padding:1.1rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.015)); height:100%;">
                    <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.6px; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.75rem;">Resumen Académico</div>
                    ${[
                      ['Instrumento', escapeHtml(clase.instrumento || 'General')],
                      ['Alumnos inscritos', `${clase.totalStudents || 0}`],
                      ['Semanas en plan', `${weekItems.length}`],
                      ['Semana activa', `${currentWeekNum}`],
                    ].map(([label, val]) => `
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
                        <span style="font-size:0.82rem; color:var(--pm-text-muted);">${label}</span>
                        <span style="font-size:0.82rem; font-weight:700; color:var(--pm-text);">${val}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="col-12">
                  <div style="padding:1.25rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.01));">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                      <div>
                        <div style="font-weight:700; font-size:0.95rem; color:var(--pm-text);">Cobertura Curricular del Grupo</div>
                        <div style="font-size:0.78rem; color:var(--pm-text-muted);">Indicadores dominados sobre el total esperado en este ciclo.</div>
                      </div>
                      <span style="font-size:1.6rem; font-weight:800; color:${getProgressColor(clase.progressPercentage)}; min-width:56px; text-align:right;">${clase.progressPercentage}%</span>
                    </div>
                    <div style="height:12px; border-radius:999px; background:var(--pm-border); overflow:hidden;">
                      <div style="height:100%; width:${clase.progressPercentage}%; background:${getProgressColor(clase.progressPercentage)}; border-radius:999px; transition:width 0.6s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--pm-text-muted); margin-top:0.5rem;">
                      <span>0%</span>
                      <span style="color:${getProgressColor(clase.progressPercentage)}; font-weight:700;">
                        ${clase.progressPercentage < 30 ? 'Inicial' : clase.progressPercentage < 70 ? 'En progreso' : 'Avanzado'}
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Pestaña: Temas y Ajustes ── -->
            <div class="pm-tab-pane ${initialTab === 'temas' ? '' : 'd-none'}" data-pane="temas">
              ${weekItems.length === 0 ? `
                <div class="pm-planning-empty">
                  <div style="font-size:2.5rem; margin-bottom:0.75rem;">📭</div>
                  <p>Esta clase no tiene semanas en el plan ACM.</p>
                </div>
              ` : weekItems.map((item) => {
                const resolved = resolveWeekItem(item)
                const isPast    = item.week_number < currentWeekNum
                const isCurrent = item.week_number === currentWeekNum
                const dotClass  = isPast ? 'past' : isCurrent ? 'current' : 'upcoming'
                const weekLabel = isPast ? 'Pasada' : isCurrent ? 'Esta semana' : `Semana ${item.week_number}`
                return `
                  <div class="pm-week-item ${isCurrent ? 'is-current' : ''}" id="pm-week-${item.week_number}">
                    <button class="pm-week-header" data-week="${item.week_number}" type="button" aria-expanded="${isCurrent}">
                      <span class="pm-week-status-dot ${dotClass}"></span>
                      <span style="font-size:0.72rem; font-weight:600; color:var(--pm-text-muted); min-width:80px;">${weekLabel}</span>
                      <span style="font-weight:700; font-size:0.92rem; flex:1; color:var(--pm-text);">${escapeHtml(item.topic)}</span>
                      ${resolved.hasTeacherAdjustment ? `<span style="font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:6px; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2); font-weight:600;">✍ Ajustado</span>` : ''}
                      <span class="pm-week-chevron ${isCurrent ? 'open' : ''}">▾</span>
                    </button>
                    <div class="pm-week-body ${isCurrent ? 'open' : ''}" id="pm-week-body-${item.week_number}">
                      <div style="padding:1rem;">
                        <!-- Info ACM base -->
                        <div style="padding:0.85rem; background:var(--pm-surface-2,rgba(0,0,0,0.02)); border-radius:10px; margin-bottom:1rem; border:1px dashed var(--pm-border);">
                          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:var(--pm-text-muted); letter-spacing:0.5px; margin-bottom:0.4rem;">Base ACM (solo lectura)</div>
                          <div style="font-size:0.83rem; color:var(--pm-text); margin-bottom:0.5rem;">${escapeHtml(item.objective || 'Sin objetivo registrado')}</div>
                          <div class="row g-2">
                            <div class="col-12 col-sm-6">
                              <div style="font-size:0.72rem; font-weight:700; color:var(--pm-text-muted);">Estrategia base:</div>
                              <div style="font-size:0.8rem; color:var(--pm-text-muted);">${escapeHtml(item.teacher_strategy || '—')}</div>
                            </div>
                            <div class="col-12 col-sm-6">
                              <div style="font-size:0.72rem; font-weight:700; color:var(--pm-text-muted);">Evidencia base:</div>
                              <div style="font-size:0.8rem; color:var(--pm-text-muted);">${escapeHtml(item.evidence || '—')}</div>
                            </div>
                          </div>
                        </div>

                        <!-- Formulario de ajuste docente -->
                        <form class="pm-week-adjustment-form" data-week="${item.week_number}">
                          <div style="font-size:0.8rem; font-weight:700; color:var(--pm-primary); margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
                            ✏️ Ajuste Docente — Semana ${item.week_number}
                          </div>
                          <div class="row g-3">
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Estrategia ajustada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="teacher_strategy" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${escapeHtml(resolved.teacher_strategy || '')}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Actividad del estudiante</label>
                              <textarea class="form-control form-control-sm rounded-3" name="student_activity" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${escapeHtml(resolved.student_activity || '')}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Tarea asignada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="homework" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${escapeHtml(resolved.homework || '')}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Evidencia ajustada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="evidence" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${escapeHtml(resolved.evidence || '')}</textarea>
                            </div>
                            <div class="col-12">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Notas pedagógicas</label>
                              <textarea class="form-control form-control-sm rounded-3" name="teacher_notes" rows="2"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${escapeHtml(resolved.teacher_notes || '')}</textarea>
                            </div>
                            <div class="col-12" style="display:flex; justify-content:flex-end;">
                              <button type="submit" class="btn btn-sm btn-primary px-4 rounded-3" style="font-weight:600; display:flex; align-items:center; gap:0.4rem;">
                                <span class="btn-text">Guardar ajuste</span>
                                <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                `
              }).join('')}
            </div>

            <!-- ── Pestaña: Indicadores ── -->
            <div class="pm-tab-pane ${initialTab === 'indicadores' ? '' : 'd-none'}" data-pane="indicadores">
              ${currentIndicators.length === 0 ? `
                <div class="pm-planning-empty">
                  <div style="font-size:2.5rem; margin-bottom:0.75rem;">🎯</div>
                  <p>No hay indicadores curriculares cargados para esta clase.</p>
                  <p style="font-size:0.82rem;">ACM debe asignar una guía activa antes de evaluar indicadores.</p>
                </div>
              ` : `
                <div style="font-size:0.8rem; color:var(--pm-text-muted); margin-bottom:1rem; padding:0.65rem 0.85rem; background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.15); border-radius:10px;">
                  💡 Marca indicadores de forma grupal o evalúa individualmente por alumno. Los cambios se guardan de inmediato.
                </div>
                ${currentIndicators.map((ind) => {
                  const color = getProgressColor(ind.progressPercentage)
                  return `
                    <div class="pm-indicator-card">
                      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:0.65rem;">
                        <div style="flex:1; min-width:220px;">
                          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
                            <span style="font-size:0.7rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:6px; background:var(--pm-surface-2,rgba(0,0,0,0.05)); color:var(--pm-text-muted);">Sem. ${ind.weekNumber}</span>
                            <span style="font-size:0.68rem; font-weight:600; padding:0.15rem 0.5rem; border-radius:6px; background:rgba(59,130,246,0.08); color:var(--pm-primary);">${ind.meta.icon} ${ind.meta.label}</span>
                          </div>
                          <h5 style="font-weight:700; font-size:0.92rem; margin:0 0 0.25rem; color:var(--pm-text);">${escapeHtml(ind.topic)}</h5>
                          <p style="font-size:0.78rem; color:var(--pm-text-muted); margin:0;">${escapeHtml(ind.objective || 'Sin objetivo registrado')}</p>
                        </div>
                        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                          <button class="btn btn-outline-success btn-sm rounded-3 btn-mark-seen-group" data-indicator-id="${ind.id}"
                            style="font-size:0.78rem; font-weight:600; display:flex; align-items:center; gap:0.35rem;">
                            <span class="btn-text">🟢 Marcar Grupo</span>
                            <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                          </button>
                          <button class="btn btn-sm rounded-3 btn-toggle-individual btn-outline-secondary" data-indicator-id="${ind.id}"
                            style="font-size:0.78rem; font-weight:600;">
                            👥 ${ind.achievedCount}/${ind.totalStudents}
                          </button>
                        </div>
                      </div>
                      <!-- Barra de progreso coloreada -->
                      <div style="margin:0.25rem 0 0.1rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.72rem; margin-bottom:0.3rem;">
                          <span style="color:var(--pm-text-muted);">Dominado por el grupo</span>
                          <span style="font-weight:700; color:${color};">${ind.progressPercentage}%</span>
                        </div>
                        <div style="height:6px; border-radius:999px; background:var(--pm-border); overflow:hidden;">
                          <div class="ind-progress-bar" style="height:100%; width:${ind.progressPercentage}%; background:${color}; border-radius:999px; transition:width 0.4s;"></div>
                        </div>
                      </div>
                      <!-- Panel individual colapsable -->
                      <div class="d-none mt-3 pt-3" id="individual-eval-${ind.id}"
                        style="border-top:1px dashed var(--pm-border);">
                        <div style="font-size:0.78rem; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.6rem; text-transform:uppercase; letter-spacing:0.4px;">
                          Calificación por alumno
                        </div>
                        <div class="row g-2" id="alumnos-list-ind-${ind.id}"></div>
                      </div>
                    </div>
                  `
                }).join('')}
              `}
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer border-0" style="padding:1rem 1.5rem;">
            <button type="button" class="btn btn-sm px-4 rounded-3" data-bs-dismiss="modal"
              style="font-weight:600; background:var(--pm-surface-2,rgba(0,0,0,0.05)); color:var(--pm-text); border:1px solid var(--pm-border);">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(classDetailModal)
    const bs = new bootstrap.Modal(classDetailModal)

    // ── Tabs: switch manual ──────────────────────────────────────────────────
    const allTabBtns  = classDetailModal.querySelectorAll('.pm-tab-btn')
    const allTabPanes = classDetailModal.querySelectorAll('.pm-tab-pane')

    allTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab
        allTabBtns.forEach((b) => b.classList.toggle('active', b.dataset.tab === target))
        allTabPanes.forEach((p) => p.classList.toggle('d-none', p.dataset.pane !== target))
      })
    })

    // ── Acordeón de semanas (implementación manual) ──────────────────────────
    classDetailModal.querySelectorAll('.pm-week-header').forEach((header) => {
      header.addEventListener('click', () => {
        const weekNum = header.dataset.week
        const body    = classDetailModal.querySelector(`#pm-week-body-${weekNum}`)
        const chevron = header.querySelector('.pm-week-chevron')
        const isOpen  = body?.classList.contains('open')
        body?.classList.toggle('open', !isOpen)
        chevron?.classList.toggle('open', !isOpen)
        header.setAttribute('aria-expanded', String(!isOpen))
      })
    })

    // ── Submit: ajuste docente semanal ───────────────────────────────────────
    classDetailModal.querySelectorAll('.pm-week-adjustment-form').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const weekNum = Number(form.dataset.week)
        const fd      = new FormData(form)
        const btn     = form.querySelector('button[type="submit"]')
        const btnText = btn?.querySelector('.btn-text')
        const spinner = btn?.querySelector('.spinner-border')

        if (btn) btn.disabled = true
        spinner?.classList.remove('d-none')
        if (btnText) btnText.textContent = 'Guardando...'

        try {
          await weeklyPlanAdapter.guardarAjustePlanDocente({
            group_id:         clase.id,
            teacher_id:       maestroId,
            weekly_plan_id:   route?.weekly_plan_id,
            week_number:      weekNum,
            teacher_strategy: String(fd.get('teacher_strategy') || '').trim(),
            student_activity: String(fd.get('student_activity') || '').trim(),
            homework:         String(fd.get('homework') || '').trim(),
            evidence:         String(fd.get('evidence') || '').trim(),
            teacher_notes:    String(fd.get('teacher_notes') || '').trim(),
          })
          AppToast.success(`Ajustes guardados — Semana ${weekNum}.`)
          announce(`Ajuste de la semana ${weekNum} guardado correctamente.`)
          await refreshData()
          openClassDetail(clase, 'temas')
        } catch (err) {
          console.error('[planning] Error guardando ajuste:', err)
          AppToast.error(err.message || 'No se pudieron guardar los ajustes.')
        } finally {
          // FIX C-2: solo mutar el botón si sigue en el DOM
          if (btn?.isConnected) {
            btn.disabled = false
            spinner?.classList.add('d-none')
            if (btnText) btnText.textContent = 'Guardar ajuste'
          }
        }
      })
    })

    // ── Marcar visto: todo el grupo ──────────────────────────────────────────
    classDetailModal.querySelectorAll('.btn-mark-seen-group').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const indicatorId = btn.dataset.indicatorId
        const btnText = btn.querySelector('.btn-text')
        const spinner = btn.querySelector('.spinner-border')

        btn.disabled = true
        spinner?.classList.remove('d-none')
        if (btnText) btnText.textContent = 'Procesando...'

        try {
          const studentIds = inscripciones
            .filter((ins) => String(ins.clase_id) === String(clase.id))
            .map((ins) => ins.alumno_id).filter(Boolean)

          if (studentIds.length === 0) {
            AppToast.warning('Esta clase no tiene alumnos inscritos para calificar.')
            return
          }

          await Promise.all(studentIds.map((sid) =>
            weeklyPlanAdapter.registrarProgresoIndicador(sid, indicatorId, 'achieved', 'Aprobado masivamente', '', null)
          ))

          AppToast.success('Indicador marcado como Dominado para todo el grupo.')
          announce('Indicador marcado como dominado para todos los alumnos.')
          await refreshData()
          openClassDetail(clase, 'indicadores')
        } catch (err) {
          console.error('[planning] Error al calificar indicador grupal:', err)
          AppToast.error('Error al actualizar el progreso del indicador.')
        } finally {
          // FIX C-1: solo mutar si el elemento sigue en el DOM
          if (btn?.isConnected) {
            btn.disabled = false
            spinner?.classList.add('d-none')
            if (btnText) btnText.textContent = '🟢 Marcar Grupo'
          }
        }
      })
    })

    // ── Toggle panel individual de alumnos ───────────────────────────────────
    classDetailModal.querySelectorAll('.btn-toggle-individual').forEach((btn) => {
      btn.addEventListener('click', () => {
        const indicatorId  = btn.dataset.indicatorId
        const panel        = classDetailModal.querySelector(`#individual-eval-${indicatorId}`)
        const listContainer = classDetailModal.querySelector(`#alumnos-list-ind-${indicatorId}`)
        if (!panel) return

        const isOpen = !panel.classList.contains('d-none')

        if (isOpen) {
          panel.classList.add('d-none')
          btn.classList.replace('btn-secondary', 'btn-outline-secondary')
          return
        }

        panel.classList.remove('d-none')
        btn.classList.replace('btn-outline-secondary', 'btn-secondary')

        // FIX I-4: no reconstruir si ya hay contenido renderizado
        if (listContainer.children.length > 0) return

        const studentList = inscripciones
          .filter((ins) => String(ins.clase_id) === String(clase.id))
          .map((ins) => ins.alumnos).filter(Boolean)

        if (studentList.length === 0) {
          listContainer.innerHTML = `<div class="col-12 text-muted" style="font-size:0.82rem;">Sin alumnos inscritos en esta clase.</div>`
          return
        }

        listContainer.innerHTML = studentList.map((alumno) => {
          const currentStatus = (currentGuideProgressMap || {})[`${alumno.id}_${indicatorId}`]?.status || 'not_started'
          return `
            <div class="col-12 col-sm-6" style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.65rem; border-radius:10px; border:1px dashed var(--pm-border); gap:0.5rem;">
              <span style="font-size:0.82rem; font-weight:600; color:var(--pm-text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(alumno.nombre_completo)}</span>
              <select class="form-select form-select-sm select-student-indicator"
                data-student-id="${alumno.id}" data-indicator-id="${indicatorId}"
                style="width:148px; font-size:0.75rem; border-radius:8px; background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); flex-shrink:0;">
                <option value="not_started"          ${currentStatus === 'not_started'          ? 'selected' : ''}>⚪ Sin iniciar</option>
                <option value="in_process"            ${currentStatus === 'in_process'            ? 'selected' : ''}>🟡 En proceso</option>
                <option value="needs_reinforcement"   ${currentStatus === 'needs_reinforcement'   ? 'selected' : ''}>🟠 Req. refuerzo</option>
                <option value="achieved"              ${currentStatus === 'achieved'              ? 'selected' : ''}>🟢 Dominado</option>
                <option value="exceeded"              ${currentStatus === 'exceeded'              ? 'selected' : ''}>🔵 Sobresaliente</option>
                <option value="failed"                ${currentStatus === 'failed'                ? 'selected' : ''}>🔴 No logrado</option>
              </select>
            </div>
          `
        }).join('')

        // Listeners para calificación individual
        listContainer.querySelectorAll('.select-student-indicator').forEach((select) => {
          select.addEventListener('change', async () => {
            const studentId = select.dataset.studentId
            const status    = select.value
            select.disabled = true
            try {
              await weeklyPlanAdapter.registrarProgresoIndicador(studentId, indicatorId, status, 'Calificación individual', '', null)
              AppToast.success('Calificación guardada.')
              announce('Calificación del alumno guardada.')
              await refreshData()

              // Actualizar la barra del indicador en el modal sin reconstruirlo
              const updatedMap       = currentGuideProgressMap || {}
              const studentIdsForInd = inscripciones
                .filter((ins) => String(ins.clase_id) === String(clase.id))
                .map((ins) => ins.alumno_id).filter(Boolean)
              const achievedCount = studentIdsForInd.filter((sid) =>
                ['achieved', 'exceeded'].includes(updatedMap[`${sid}_${indicatorId}`]?.status || 'not_started')
              ).length
              const total      = studentIdsForInd.length
              const newPct     = total > 0 ? Math.round((achievedCount / total) * 100) : 0
              const newColor   = getProgressColor(newPct)

              const card   = btn.closest('.pm-indicator-card')
              const indBar = card?.querySelector('.ind-progress-bar')
              const pctEl  = card?.querySelector('.ind-progress-bar')?.parentElement?.previousElementSibling?.querySelector('span:last-child')

              if (indBar) { indBar.style.width = `${newPct}%`; indBar.style.background = newColor }
              if (pctEl)  pctEl.textContent = `${newPct}%`
              btn.textContent = `👥 ${achievedCount}/${total}`
            } catch (err) {
              console.error('[planning] Error actualizando indicador:', err)
              AppToast.error('No se pudo guardar la calificación.')
            } finally {
              select.disabled = false
            }
          })
        })
      })
    })

    // ── Al cerrar: actualizar solo la tarjeta afectada (no recargar grid) ────
    classDetailModal.addEventListener('hidden.bs.modal', () => {
      // FIX C-3: Dispose antes de remove
      bootstrap.Modal.getInstance(classDetailModal)?.dispose()
      classDetailModal.remove()
      classDetailModal = null
      // FIX I-3: actualizar solo la tarjeta de la clase que se editó
      if (currentClaseId) updateClassCard(currentClaseId)
    }, { once: true })

    bs.show()
    announce(`Panel de clase ${clase.nombre} abierto.`)
  }

  // ── Iniciar la carga ────────────────────────────────────────────────────────
  await loadClassesGrid()
}
