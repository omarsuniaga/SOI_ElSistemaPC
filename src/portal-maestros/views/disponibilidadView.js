/**
 * disponibilidadView.js
 * Portal Maestros — Disponibilidad Horaria del Maestro
 *
 * Permite registrar bloques de tiempo disponibles por día (L–S)
 * para que el sistema genere un horario optimizado.
 *
 * Persiste en: maestros.disponibilidad (JSONB en Supabase)
 * API: src/portal-maestros/api/disponibilidadApi.js
 */

import { getDisponibilidad, updateDisponibilidad, validateDisponibilidad, timeToMinutes } from '../api/disponibilidadApi.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { announce } from '../utils/a11yUtils.js'

// ─── Constantes ────────────────────────────────────────────────────────────────

const DIAS = [
  { key: 'lunes',      label: 'Lunes',      short: 'L' },
  { key: 'martes',     label: 'Martes',     short: 'M' },
  { key: 'miércoles',  label: 'Miércoles',  short: 'X' },
  { key: 'jueves',     label: 'Jueves',     short: 'J' },
  { key: 'viernes',    label: 'Viernes',    short: 'V' },
  { key: 'sábado',     label: 'Sábado',     short: 'S' },
]

// Horario de referencia para la visualización (06:00–22:00 = 960 min)
const TIMELINE_START = 6 * 60   // 06:00
const TIMELINE_END   = 22 * 60  // 22:00
const TIMELINE_RANGE = TIMELINE_END - TIMELINE_START

// ─── Estilos ───────────────────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById('pm-disponibilidad-styles')) return
  const style = document.createElement('style')
  style.id = 'pm-disponibilidad-styles'
  style.textContent = `
    /* ── Layout ── */
    .pm-disp-container { padding: 1.5rem; max-width: 860px; margin: 0 auto; }

    /* ── Header ── */
    .pm-disp-header {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white; padding: 1.75rem 2rem; border-radius: 20px;
      margin-bottom: 1.5rem; position: relative; overflow: hidden;
    }
    .pm-disp-header::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.09) 0%, transparent 55%);
      pointer-events: none;
    }
    .pm-disp-header-row {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
    }
    .pm-disp-title { font-size: 1.6rem; font-weight: 800; margin: 0 0 0.3rem; letter-spacing: -0.02em; }
    .pm-disp-subtitle { font-size: 0.88rem; opacity: 0.88; margin: 0; line-height: 1.5; }
    .pm-disp-save-btn {
      background: rgba(255,255,255,0.18); color: white; border: 1px solid rgba(255,255,255,0.35);
      border-radius: 10px; padding: 0.55rem 1.15rem; font-size: 0.85rem; font-weight: 700;
      cursor: pointer; white-space: nowrap; transition: background 0.15s, transform 0.15s;
      display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
    }
    .pm-disp-save-btn:hover:not(:disabled) { background: rgba(255,255,255,0.28); transform: translateY(-1px); }
    .pm-disp-save-btn:disabled { opacity: 0.5; cursor: default; }
    .pm-disp-dirty-badge {
      font-size: 0.68rem; background: #f59e0b; color: #000; border-radius: 999px;
      padding: 0.1rem 0.45rem; font-weight: 700; display: none;
    }
    .pm-disp-dirty-badge.visible { display: inline; }

    /* ── Weekly summary ── */
    .pm-disp-summary {
      background: var(--pm-surface); border: 1px solid var(--pm-border);
      border-radius: 16px; padding: 1.1rem 1.25rem; margin-bottom: 1.25rem;
    }
    .pm-disp-summary-title {
      font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px;
      font-weight: 700; color: var(--pm-text-muted); margin-bottom: 0.85rem;
    }
    .pm-disp-week-grid {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem;
    }
    .pm-disp-day-col { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
    .pm-disp-day-label {
      font-size: 0.72rem; font-weight: 700; color: var(--pm-text-muted);
    }
    .pm-disp-day-track {
      width: 100%; height: 56px; border-radius: 8px; position: relative;
      background: var(--pm-border); overflow: hidden;
    }
    .pm-disp-day-bar {
      position: absolute; left: 0; right: 0; border-radius: 4px;
      background: linear-gradient(180deg, #7c3aed, #4f46e5);
      opacity: 0.85; transition: height 0.3s, top 0.3s;
    }
    .pm-disp-day-hours {
      font-size: 0.68rem; color: var(--pm-text-muted); font-weight: 600;
    }

    /* ── Días acordeón ── */
    .pm-disp-days { display: flex; flex-direction: column; gap: 0.65rem; }
    .pm-disp-day-panel {
      background: var(--pm-surface); border: 1px solid var(--pm-border);
      border-radius: 14px; overflow: hidden; transition: box-shadow 0.2s;
    }
    .pm-disp-day-panel.has-slots { border-color: rgba(124,58,237,0.35); }
    .pm-disp-day-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.8rem 1rem; cursor: pointer; user-select: none; gap: 0.75rem;
      background: transparent; border: none; width: 100%; text-align: left; outline: none;
    }
    .pm-disp-day-panel-header:hover { background: var(--pm-surface-2, rgba(0,0,0,0.015)); }
    .pm-disp-day-name {
      font-size: 0.92rem; font-weight: 700; color: var(--pm-text);
    }
    .pm-disp-day-info {
      font-size: 0.75rem; color: var(--pm-text-muted); flex: 1;
    }
    .pm-disp-day-chevron {
      font-size: 0.8rem; color: var(--pm-text-muted);
      transition: transform 0.2s ease;
    }
    .pm-disp-day-chevron.open { transform: rotate(180deg); }
    .pm-disp-day-body {
      display: none; border-top: 1px solid var(--pm-border);
      padding: 0.85rem 1rem; animation: pm-disp-slide-in 0.18s ease;
    }
    .pm-disp-day-body.open { display: block; }
    @keyframes pm-disp-slide-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Franjas ── */
    .pm-disp-slots { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.75rem; }
    .pm-disp-slot {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.5rem 0.75rem; border-radius: 10px;
      background: rgba(124,58,237,0.05); border: 1px solid rgba(124,58,237,0.15);
      animation: pm-disp-slot-in 0.18s ease;
    }
    @keyframes pm-disp-slot-in {
      from { opacity: 0; transform: scale(0.97); }
      to   { opacity: 1; transform: scale(1); }
    }
    .pm-disp-slot-icon { font-size: 0.9rem; flex-shrink: 0; color: #7c3aed; }
    .pm-disp-slot-time {
      font-size: 0.88rem; font-weight: 700; color: var(--pm-text); flex: 1;
      font-variant-numeric: tabular-nums;
    }
    .pm-disp-slot-duration {
      font-size: 0.72rem; color: var(--pm-text-muted);
    }
    .pm-disp-slot-del {
      background: transparent; border: none; cursor: pointer; padding: 0.2rem 0.35rem;
      border-radius: 6px; color: var(--pm-text-muted); font-size: 0.95rem; line-height: 1;
      transition: background 0.15s, color 0.15s;
    }
    .pm-disp-slot-del:hover { background: rgba(239,68,68,0.08); color: #ef4444; }
    .pm-disp-empty-slots {
      font-size: 0.8rem; color: var(--pm-text-muted); padding: 0.35rem 0;
      font-style: italic;
    }

    /* ── Formulario de nueva franja ── */
    .pm-disp-add-form {
      display: none; gap: 0.6rem; align-items: flex-end; flex-wrap: wrap;
      padding: 0.75rem; background: var(--pm-surface-2, rgba(0,0,0,0.02));
      border-radius: 10px; border: 1px dashed var(--pm-border);
      margin-top: 0.5rem;
    }
    .pm-disp-add-form.open { display: flex; }
    .pm-disp-add-form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .pm-disp-add-form label { font-size: 0.72rem; font-weight: 600; color: var(--pm-text-muted); }
    .pm-disp-add-form input[type="time"] {
      padding: 0.4rem 0.6rem; border: 1px solid var(--pm-border);
      border-radius: 8px; font-size: 0.85rem; font-weight: 600;
      background: var(--pm-surface); color: var(--pm-text);
      font-variant-numeric: tabular-nums; outline: none;
      transition: border-color 0.15s;
    }
    .pm-disp-add-form input[type="time"]:focus { border-color: #7c3aed; }
    .pm-disp-add-confirm {
      background: #7c3aed; color: white; border: none; border-radius: 8px;
      padding: 0.42rem 0.85rem; font-size: 0.82rem; font-weight: 700;
      cursor: pointer; transition: background 0.15s, transform 0.15s;
    }
    .pm-disp-add-confirm:hover { background: #6d28d9; transform: translateY(-1px); }
    .pm-disp-add-cancel {
      background: transparent; color: var(--pm-text-muted); border: none;
      padding: 0.42rem 0.65rem; font-size: 0.82rem; cursor: pointer;
      border-radius: 8px; transition: background 0.15s;
    }
    .pm-disp-add-cancel:hover { background: var(--pm-border); }
    .pm-disp-add-error {
      font-size: 0.75rem; color: #ef4444; width: 100%;
      display: none; align-items: center; gap: 0.3rem;
    }
    .pm-disp-add-error.visible { display: flex; }
    .pm-disp-add-toggle {
      background: transparent; border: 1px dashed var(--pm-border);
      border-radius: 8px; padding: 0.38rem 0.75rem; font-size: 0.78rem;
      font-weight: 600; color: var(--pm-text-muted); cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      display: flex; align-items: center; gap: 0.3rem;
    }
    .pm-disp-add-toggle:hover { border-color: #7c3aed; color: #7c3aed; }

    /* ── Responsivo ── */
    @media (max-width: 640px) {
      .pm-disp-container { padding: 0.75rem; }
      .pm-disp-header { padding: 1.1rem 1.1rem; border-radius: 14px; }
      .pm-disp-title { font-size: 1.25rem; }
      .pm-disp-week-grid { grid-template-columns: repeat(6, 1fr); }
    }
  `
  document.head.appendChild(style)
}

// ─── Utilidades de UI ──────────────────────────────────────────────────────────

function formatDuration(inicioStr, finStr) {
  const mins = timeToMinutes(finStr) - timeToMinutes(inicioStr)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`
}

function totalHoursForDay(franjas) {
  return franjas.reduce((acc, f) => acc + (timeToMinutes(f.fin) - timeToMinutes(f.inicio)), 0) / 60
}

// ─── Vista Principal ───────────────────────────────────────────────────────────

export async function renderDisponibilidadView(container, { maestroId }) {
  injectStyles()

  // Estado local mutable
  let disponibilidad = {}  // { lunes: [{inicio, fin}], ... }
  let isDirty = false

  container.innerHTML = `
    <div class="pm-disp-container">

      <!-- Header -->
      <div class="pm-disp-header">
        <div class="pm-disp-header-row">
          <div>
            <h1 class="pm-disp-title">🗓️ Disponibilidad Horaria</h1>
            <p class="pm-disp-subtitle">
              Registra tus bloques de tiempo disponibles. El sistema usará esta información
              para generar un horario optimizado según tus clases.
            </p>
          </div>
          <button class="pm-disp-save-btn" id="pm-disp-save" type="button" disabled>
            <span id="pm-disp-save-text">Guardar</span>
            <span class="spinner-border spinner-border-sm d-none" id="pm-disp-save-spinner" role="status" aria-hidden="true"></span>
            <span class="pm-disp-dirty-badge" id="pm-disp-dirty-badge">●</span>
          </button>
        </div>
      </div>

      <!-- Resumen visual semanal -->
      <div class="pm-disp-summary" id="pm-disp-summary" aria-label="Resumen visual de disponibilidad semanal">
        <div class="pm-disp-summary-title">Resumen de la semana</div>
        <div class="pm-disp-week-grid" id="pm-disp-week-grid">
          ${DIAS.map(d => `
            <div class="pm-disp-day-col" id="pm-summary-col-${d.key}">
              <div class="pm-disp-day-label">${d.short}</div>
              <div class="pm-disp-day-track" title="${d.label}">
                <!-- barras renderizadas por JS -->
              </div>
              <div class="pm-disp-day-hours" id="pm-summary-hrs-${d.key}">0h</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Paneles por día -->
      <div class="pm-disp-days" id="pm-disp-days">
        ${DIAS.map(d => `
          <div class="pm-disp-day-panel" id="pm-day-panel-${d.key}">
            <button class="pm-disp-day-panel-header" data-day="${d.key}" type="button"
              aria-expanded="false" aria-controls="pm-day-body-${d.key}">
              <span class="pm-disp-day-name">${d.label}</span>
              <span class="pm-disp-day-info" id="pm-day-info-${d.key}">Sin franjas registradas</span>
              <span class="pm-disp-day-chevron" id="pm-day-chevron-${d.key}">▾</span>
            </button>
            <div class="pm-disp-day-body" id="pm-day-body-${d.key}" role="region" aria-label="Franjas de ${d.label}">
              <div class="pm-disp-slots" id="pm-slots-${d.key}">
                <div class="pm-disp-empty-slots">Sin franjas registradas para este día.</div>
              </div>
              <button class="pm-disp-add-toggle" id="pm-add-toggle-${d.key}" data-day="${d.key}" type="button">
                + Agregar franja
              </button>
              <div class="pm-disp-add-form" id="pm-add-form-${d.key}" data-day="${d.key}">
                <div class="pm-disp-add-form-group">
                  <label for="pm-input-inicio-${d.key}">Inicio</label>
                  <input type="time" id="pm-input-inicio-${d.key}" value="08:00" min="06:00" max="21:00">
                </div>
                <div class="pm-disp-add-form-group">
                  <label for="pm-input-fin-${d.key}">Fin</label>
                  <input type="time" id="pm-input-fin-${d.key}" value="10:00" min="07:00" max="22:00">
                </div>
                <button class="pm-disp-add-confirm" data-day="${d.key}" type="button">Añadir</button>
                <button class="pm-disp-add-cancel" data-day="${d.key}" type="button">Cancelar</button>
                <div class="pm-disp-add-error" id="pm-add-error-${d.key}" role="alert">
                  <span>⚠</span><span id="pm-add-error-msg-${d.key}"></span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `

  // ── Referencias DOM ────────────────────────────────────────────────────────
  const saveBtn     = container.querySelector('#pm-disp-save')
  const saveText    = container.querySelector('#pm-disp-save-text')
  const saveSpinner = container.querySelector('#pm-disp-save-spinner')
  const dirtyBadge  = container.querySelector('#pm-disp-dirty-badge')

  // ── Estado dirty ───────────────────────────────────────────────────────────
  function markDirty(flag = true) {
    isDirty = flag
    saveBtn.disabled = !flag
    dirtyBadge.classList.toggle('visible', flag)
  }

  // ── Resumen visual semanal ─────────────────────────────────────────────────
  function updateSummary() {
    DIAS.forEach(({ key }) => {
      const franjas  = disponibilidad[key] || []
      const track    = container.querySelector(`#pm-summary-col-${key} .pm-disp-day-track`)
      const hrsLabel = container.querySelector(`#pm-summary-hrs-${key}`)
      if (!track) return

      // Limpiar barras anteriores
      track.innerHTML = ''

      const totalH = totalHoursForDay(franjas)
      hrsLabel.textContent = totalH > 0 ? `${totalH % 1 === 0 ? totalH : totalH.toFixed(1)}h` : '0h'

      // Dibujar una barra por franja en el timeline
      franjas.forEach(f => {
        const start  = Math.max(timeToMinutes(f.inicio), TIMELINE_START)
        const end    = Math.min(timeToMinutes(f.fin), TIMELINE_END)
        if (end <= start) return
        const top    = ((start - TIMELINE_START) / TIMELINE_RANGE) * 100
        const height = ((end - start)            / TIMELINE_RANGE) * 100
        const bar    = document.createElement('div')
        bar.className = 'pm-disp-day-bar'
        bar.style.top    = `${top}%`
        bar.style.height = `${height}%`
        track.appendChild(bar)
      })
    })
  }

  // ── Render de franjas de un día ────────────────────────────────────────────
  function renderSlots(diaKey) {
    const franjas   = disponibilidad[diaKey] || []
    const container_ = container.querySelector(`#pm-slots-${diaKey}`)
    const panel     = container.querySelector(`#pm-day-panel-${diaKey}`)
    const infoEl    = container.querySelector(`#pm-day-info-${diaKey}`)

    if (!container_) return

    panel.classList.toggle('has-slots', franjas.length > 0)

    // Ordenar por hora de inicio
    const sorted = [...franjas].sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio))

    infoEl.textContent = franjas.length > 0
      ? `${franjas.length} franja${franjas.length > 1 ? 's' : ''} · ${totalHoursForDay(franjas).toFixed(1)}h disponible`
      : 'Sin franjas registradas'

    if (sorted.length === 0) {
      container_.innerHTML = `<div class="pm-disp-empty-slots">Sin franjas registradas para este día.</div>`
      return
    }

    container_.innerHTML = sorted.map((f, idx) => `
      <div class="pm-disp-slot" data-day="${diaKey}" data-idx="${idx}">
        <span class="pm-disp-slot-icon">⏱</span>
        <span class="pm-disp-slot-time">${f.inicio} — ${f.fin}</span>
        <span class="pm-disp-slot-duration">${formatDuration(f.inicio, f.fin)}</span>
        <button class="pm-disp-slot-del" data-day="${diaKey}" data-inicio="${f.inicio}" data-fin="${f.fin}"
          type="button" title="Eliminar franja" aria-label="Eliminar franja ${f.inicio}–${f.fin}">×</button>
      </div>
    `).join('')

    // Listeners para eliminar franjas
    container_.querySelectorAll('.pm-disp-slot-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const { day, inicio, fin } = btn.dataset
        disponibilidad[day] = (disponibilidad[day] || []).filter(
          f => !(f.inicio === inicio && f.fin === fin)
        )
        if (disponibilidad[day].length === 0) delete disponibilidad[day]
        renderSlots(day)
        updateSummary()
        markDirty()
        announce(`Franja ${inicio}–${fin} eliminada.`)
      })
    })

    updateSummary()
  }

  // ── Accordeón: toggle día ──────────────────────────────────────────────────
  container.querySelectorAll('.pm-disp-day-panel-header').forEach(header => {
    header.addEventListener('click', () => {
      const diaKey  = header.dataset.day
      const body    = container.querySelector(`#pm-day-body-${diaKey}`)
      const chevron = container.querySelector(`#pm-day-chevron-${diaKey}`)
      const isOpen  = body.classList.contains('open')
      body.classList.toggle('open', !isOpen)
      chevron.classList.toggle('open', !isOpen)
      header.setAttribute('aria-expanded', String(!isOpen))
    })
  })

  // ── Formulario: toggle open/close ─────────────────────────────────────────
  container.querySelectorAll('.pm-disp-add-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaKey = btn.dataset.day
      const form   = container.querySelector(`#pm-add-form-${diaKey}`)
      const isOpen = form.classList.contains('open')
      form.classList.toggle('open', !isOpen)
      btn.textContent = isOpen ? '+ Agregar franja' : '− Cancelar'
      if (!isOpen) {
        container.querySelector(`#pm-input-inicio-${diaKey}`)?.focus()
        clearFormError(diaKey)
      }
    })
  })

  // ── Formulario: cancel ────────────────────────────────────────────────────
  container.querySelectorAll('.pm-disp-add-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaKey  = btn.dataset.day
      const form    = container.querySelector(`#pm-add-form-${diaKey}`)
      const toggle  = container.querySelector(`#pm-add-toggle-${diaKey}`)
      form.classList.remove('open')
      toggle.textContent = '+ Agregar franja'
      clearFormError(diaKey)
    })
  })

  function showFormError(diaKey, msg) {
    const el    = container.querySelector(`#pm-add-error-${diaKey}`)
    const msgEl = container.querySelector(`#pm-add-error-msg-${diaKey}`)
    if (el && msgEl) { msgEl.textContent = msg; el.classList.add('visible') }
  }

  function clearFormError(diaKey) {
    container.querySelector(`#pm-add-error-${diaKey}`)?.classList.remove('visible')
  }

  // ── Formulario: añadir franja ─────────────────────────────────────────────
  container.querySelectorAll('.pm-disp-add-confirm').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaKey  = btn.dataset.day
      const inicio  = container.querySelector(`#pm-input-inicio-${diaKey}`)?.value
      const fin     = container.querySelector(`#pm-input-fin-${diaKey}`)?.value

      clearFormError(diaKey)

      // Validación rápida en cliente
      if (!inicio || !fin) {
        showFormError(diaKey, 'Ingresa hora de inicio y fin.')
        return
      }

      if (timeToMinutes(inicio) >= timeToMinutes(fin)) {
        showFormError(diaKey, `La hora de inicio (${inicio}) debe ser anterior al fin (${fin}).`)
        return
      }

      const nuevaFranja = { inicio, fin }
      const franjasActuales = disponibilidad[diaKey] || []

      // Verificar solapamiento contra franjas existentes
      const overlap = franjasActuales.find(f => {
        const aStart = timeToMinutes(f.inicio), aEnd = timeToMinutes(f.fin)
        const bStart = timeToMinutes(inicio),   bEnd = timeToMinutes(fin)
        return aStart < bEnd && bStart < aEnd
      })

      if (overlap) {
        showFormError(diaKey, `Se solapa con la franja existente ${overlap.inicio}–${overlap.fin}.`)
        return
      }

      // Agregar franja
      disponibilidad[diaKey] = [...franjasActuales, nuevaFranja]
      renderSlots(diaKey)
      markDirty()
      announce(`Franja ${inicio}–${fin} agregada a ${diaKey}.`)

      // Cerrar formulario y resetear
      const form   = container.querySelector(`#pm-add-form-${diaKey}`)
      const toggle = container.querySelector(`#pm-add-toggle-${diaKey}`)
      form.classList.remove('open')
      toggle.textContent = '+ Agregar franja'
    })
  })

  // ── Enter en inputs → confirmar ────────────────────────────────────────────
  DIAS.forEach(({ key }) => {
    const inicioInput = container.querySelector(`#pm-input-inicio-${key}`)
    const finInput    = container.querySelector(`#pm-input-fin-${key}`)
    const confirmBtn  = container.querySelector(`.pm-disp-add-confirm[data-day="${key}"]`)
    ;[inicioInput, finInput].forEach(input => {
      input?.addEventListener('keydown', e => { if (e.key === 'Enter') confirmBtn?.click() })
    })
  })

  // ── Guardar disponibilidad ─────────────────────────────────────────────────
  saveBtn.addEventListener('click', async () => {
    // Validación completa antes de persistir
    const validation = validateDisponibilidad(disponibilidad)
    if (!validation.valid) {
      AppToast.error(`Errores de validación:\n${validation.errors.join('\n')}`)
      return
    }

    saveBtn.disabled   = true
    saveSpinner.classList.remove('d-none')
    saveText.textContent = 'Guardando...'

    try {
      const result = await updateDisponibilidad(maestroId, disponibilidad)
      if (!result.success) {
        AppToast.error(result.errors?.join(', ') || 'No se pudo guardar.')
        return
      }
      AppToast.success('Disponibilidad guardada correctamente.')
      announce('Disponibilidad guardada.')
      markDirty(false)
    } catch (err) {
      console.error('[disponibilidad] Error guardando:', err)
      AppToast.error('Error al conectar con el servidor.')
    } finally {
      if (saveBtn.isConnected) {
        saveBtn.disabled = !isDirty
        saveSpinner.classList.add('d-none')
        saveText.textContent = 'Guardar'
      }
    }
  })

  // ── Carga inicial ─────────────────────────────────────────────────────────
  try {
    container.querySelector('#pm-disp-days').style.opacity = '0.5'
    disponibilidad = await getDisponibilidad(maestroId)

    DIAS.forEach(({ key }) => renderSlots(key))
    updateSummary()

    // Expandir el día actual automáticamente
    const today = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][new Date().getDay()]
    const todayInDias = DIAS.find(d => d.key === today)
    if (todayInDias) {
      const body    = container.querySelector(`#pm-day-body-${today}`)
      const chevron = container.querySelector(`#pm-day-chevron-${today}`)
      const header  = container.querySelector(`[data-day="${today}"].pm-disp-day-panel-header`)
      body?.classList.add('open')
      chevron?.classList.add('open')
      header?.setAttribute('aria-expanded', 'true')
    }

    announce('Disponibilidad horaria cargada.')
  } catch (err) {
    console.error('[disponibilidad] Error cargando:', err)
    AppToast.error('No se pudo cargar la disponibilidad. Intenta recargar.')
  } finally {
    const daysEl = container.querySelector('#pm-disp-days')
    if (daysEl) daysEl.style.opacity = '1'
  }
}
