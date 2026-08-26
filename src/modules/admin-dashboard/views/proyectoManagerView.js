/**
 * proyectoManagerView.js — Dashboard WBS · Motor de Orquestación Institucional
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { analizarSaludEvento } from '../../calendario/domain/eventProjectManagerEngine.js'
import { abrirEventProjectManagerModal } from '../../calendario/views/eventProjectManagerModal.js'
import { persistirSaludEvento } from '../../calendario/api/wbsApi.js'

// ── Estilos del módulo ────────────────────────────────────────────────────────
const STYLES = `
<style id="pm-view-styles">
  .pm-shell {
    --pm-accent:     #F0A500;
    --pm-critico:    #EF4444;
    --pm-riesgo:     #F97316;
    --pm-orden:      #10B981;
    --pm-completado: #6B7280;
    --pm-text:       #E8E8F2;
    --pm-muted:      rgba(232,232,242,0.38);
    --pm-surface:    rgba(255,255,255,0.04);
    --pm-border:     rgba(255,255,255,0.07);
    color: var(--pm-text);
    font-family: inherit;
  }

  /* Header */
  .pm-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
  }
  .pm-eyebrow {
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--pm-accent);
    margin-bottom: 0.35rem;
  }
  .pm-title {
    font-size: 1.6rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    margin: 0 0 0.25rem;
    color: var(--pm-text);
  }
  .pm-subtitle {
    font-size: 0.78rem;
    color: var(--pm-muted);
    margin: 0;
  }
  .pm-filter {
    background: var(--pm-surface);
    border: 1px solid var(--pm-border);
    color: var(--pm-text);
    border-radius: 8px;
    padding: 0.45rem 0.85rem;
    font-size: 0.78rem;
    cursor: pointer;
    min-width: 170px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%236B6B80' d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.2rem;
  }
  .pm-filter:focus { outline: 2px solid var(--pm-accent); outline-offset: 2px; }
  .pm-filter option { background: #1a1a2e; color: var(--pm-text); }

  /* Secciones */
  .pm-section { margin-bottom: 2rem; }
  .pm-section-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--pm-muted);
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--pm-border);
    margin-bottom: 0.75rem;
  }
  .pm-section-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .pm-section-count {
    margin-left: auto;
    background: rgba(255,255,255,0.06);
    border-radius: 100px;
    padding: 0.1rem 0.5rem;
    font-size: 0.65rem;
  }

  /* Tarjeta de proyecto */
  .pm-card {
    display: grid;
    grid-template-columns: 96px 1fr auto;
    align-items: center;
    gap: 1.5rem;
    background: var(--pm-surface);
    border: 1px solid var(--pm-border);
    border-left: 3px solid transparent;
    border-radius: 10px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 0.55rem;
    cursor: pointer;
    position: relative;
    transition: background 0.15s, border-color 0.15s, transform 0.14s;
    text-decoration: none;
  }
  .pm-card:hover {
    background: rgba(255,255,255,0.065);
    border-color: rgba(255,255,255,0.15);
    transform: translateY(-1px);
  }
  .pm-card[data-estado="critico"]    { border-left-color: var(--pm-critico); }
  .pm-card[data-estado="en_riesgo"]  { border-left-color: var(--pm-riesgo); }
  .pm-card[data-estado="en_orden"]   { border-left-color: var(--pm-orden); }
  .pm-card[data-estado="completado"] { border-left-color: var(--pm-completado); }

  /* ── Contador T-Minus (elemento firma) ── */
  .pm-tminus {
    text-align: center;
    line-height: 1;
    user-select: none;
    flex-shrink: 0;
  }
  .pm-tminus-number {
    display: block;
    font-size: 2.2rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .pm-tminus-unit {
    display: block;
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--pm-muted);
    margin-top: 0.2rem;
  }
  .pm-card[data-estado="critico"]    .pm-tminus-number { color: var(--pm-critico); }
  .pm-card[data-estado="en_riesgo"]  .pm-tminus-number { color: var(--pm-riesgo); }
  .pm-card[data-estado="en_orden"]   .pm-tminus-number { color: var(--pm-orden); }
  .pm-card[data-estado="completado"] .pm-tminus-number { color: var(--pm-completado); }
  .pm-card[data-estado="desconocido"] .pm-tminus-number { color: var(--pm-muted); }

  /* Cuerpo */
  .pm-card-body { min-width: 0; }
  .pm-card-title {
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--pm-text);
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pm-card-date {
    font-size: 0.7rem;
    color: var(--pm-muted);
    margin-bottom: 0.65rem;
  }
  .pm-progress-track {
    height: 3px;
    background: rgba(255,255,255,0.07);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  .pm-progress-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.5s ease;
  }
  .pm-card[data-estado="critico"]    .pm-progress-fill { background: var(--pm-critico); }
  .pm-card[data-estado="en_riesgo"]  .pm-progress-fill { background: var(--pm-riesgo); }
  .pm-card[data-estado="en_orden"]   .pm-progress-fill { background: var(--pm-orden); }
  .pm-card[data-estado="completado"] .pm-progress-fill { background: var(--pm-completado); }
  .pm-card[data-estado="desconocido"] .pm-progress-fill { background: var(--pm-muted); }

  .pm-card-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    font-size: 0.67rem;
    color: var(--pm-muted);
  }
  .pm-dept {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 4px;
    padding: 0.08rem 0.35rem;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(232,232,242,0.55);
  }

  /* Acción */
  .pm-card-action {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.55rem;
    flex-shrink: 0;
  }
  .pm-chip {
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.18rem 0.55rem;
    border-radius: 100px;
    white-space: nowrap;
  }
  .pm-chip-critico    { background: rgba(239,68,68,0.14);   color: var(--pm-critico); }
  .pm-chip-en_riesgo  { background: rgba(249,115,22,0.14);  color: var(--pm-riesgo); }
  .pm-chip-en_orden   { background: rgba(16,185,129,0.12);  color: var(--pm-orden); }
  .pm-chip-completado { background: rgba(107,114,128,0.14); color: var(--pm-completado); }
  .pm-chip-desconocido{ background: rgba(107,114,128,0.10); color: var(--pm-muted); }

  .pm-btn-ver {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.13);
    color: var(--pm-text);
    border-radius: 7px;
    padding: 0.38rem 0.85rem;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    transition: background 0.13s, border-color 0.13s;
    white-space: nowrap;
  }
  .pm-btn-ver:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.28);
  }

  /* Estados vacíos y carga */
  .pm-empty {
    text-align: center;
    padding: 5rem 2rem;
    color: var(--pm-muted);
  }
  .pm-empty i { font-size: 2.8rem; display: block; margin-bottom: 1rem; opacity: 0.35; }
  .pm-empty-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.4rem; }
  .pm-empty-sub { font-size: 0.78rem; }
  .pm-loading {
    display: flex; align-items: center; justify-content: center;
    gap: 0.7rem; padding: 4rem; color: var(--pm-muted); font-size: 0.82rem;
  }

  /* Error */
  .pm-error {
    border: 1px solid rgba(239,68,68,0.3);
    background: rgba(239,68,68,0.08);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    font-size: 0.8rem;
    color: #FCA5A5;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .pm-card { grid-template-columns: 70px 1fr; grid-template-rows: auto auto; gap: 0.75rem; }
    .pm-card-action { grid-column: 1/-1; flex-direction: row; justify-content: space-between; align-items: center; }
    .pm-tminus-number { font-size: 1.5rem; }
  }
</style>
`

// ── Constantes de diseño ──────────────────────────────────────────────────────
const ESTADO_LABEL = {
  en_orden:    'En Orden',
  en_riesgo:   'En Riesgo',
  critico:     'Crítico',
  completado:  'Completado',
  desconocido: '—',
}

const SECCIONES = [
  { key: 'critico',    color: '#EF4444', label: 'Crítico — Acción Inmediata',    estados: ['critico'] },
  { key: 'en_riesgo',  color: '#F97316', label: 'En Riesgo — Requiere Atención', estados: ['en_riesgo'] },
  { key: 'en_orden',   color: '#10B981', label: 'En Orden — Avanzando',          estados: ['en_orden', 'desconocido'] },
  { key: 'completado', color: '#6B7280', label: 'Completados',                   estados: ['completado'] },
]

// ── Vista principal ───────────────────────────────────────────────────────────
export function renderProyectoManagerView(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  if (!document.getElementById('pm-view-styles')) {
    document.head.insertAdjacentHTML('beforeend', STYLES)
  }

  container.innerHTML = `
    <div class="pm-shell">
      <div class="pm-header">
        <div>
          <div class="pm-eyebrow">Motor de Orquestación Institucional · SOI</div>
          <h2 class="pm-title">Project Manager</h2>
          <p class="pm-subtitle">Macro-eventos con plan WBS activo · El Sistema Punta Cana</p>
        </div>
        <select id="pm-filtro-salud" class="pm-filter">
          <option value="todos">Todos los estados</option>
          <option value="critico">Crítico</option>
          <option value="en_riesgo">En Riesgo</option>
          <option value="en_orden">En Orden</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      <div id="pm-lista">
        <div class="pm-loading">
          <div class="spinner-border spinner-border-sm" style="color:#F0A500"></div>
          Cargando proyectos…
        </div>
      </div>

      <div id="pm-modal-zone"></div>
    </div>
  `

  let todosMacroEventos = []

  async function cargarProyectos() {
    // Solo seleccionar columnas base — las columnas WBS (salud_proyecto, etc.)
    // son opcionales hasta que la migración esté aplicada en Supabase.
    const { data: eventos, error: errEvt } = await supabase
      .from('calendario_institucional')
      .select('id, titulo, fecha_inicio, ubicacion')
      .eq('es_macro_evento', true)
      .order('fecha_inicio', { ascending: true })

    const lista = document.getElementById('pm-lista')
    if (!lista) return

    if (errEvt) {
      lista.innerHTML = `<div class="pm-error"><i class="bi bi-exclamation-triangle me-2"></i>${errEvt.message}</div>`
      return
    }

    if (!eventos || eventos.length === 0) {
      lista.innerHTML = `
        <div class="pm-empty">
          <i class="bi bi-music-note-list"></i>
          <div class="pm-empty-title">Sin macro-eventos activos</div>
          <div class="pm-empty-sub">Activa el plan WBS desde el Calendario Institucional.</div>
        </div>`
      return
    }

    const { data: todasTareas } = await supabase
      .from('tareas_institucionales')
      .select('id, event_id, estado, prioridad, departamento, titulo, fecha_vencimiento')
      .in('event_id', eventos.map(e => e.id))

    todosMacroEventos = eventos.map(evento => {
      const tareas = (todasTareas || []).filter(t => t.event_id === evento.id)
      const salud  = analizarSaludEvento(
        { fecha_inicio: evento.fecha_inicio, start: evento.fecha_inicio,
          title: evento.titulo, ubicacion: evento.ubicacion },
        tareas
      )
      persistirSaludEvento(evento.id, salud.estado).catch(() => {})
      return { evento, tareas, salud }
    })

    renderLista(todosMacroEventos)
  }

  function renderLista(proyectos) {
    const filtro = document.getElementById('pm-filtro-salud')?.value || 'todos'
    const lista  = document.getElementById('pm-lista')
    if (!lista) return

    const filtrados = filtro === 'todos'
      ? proyectos
      : proyectos.filter(p => p.salud.estado === filtro)

    if (filtrados.length === 0) {
      lista.innerHTML = `
        <div class="pm-empty">
          <i class="bi bi-funnel"></i>
          <div class="pm-empty-title">Sin proyectos en «${ESTADO_LABEL[filtro] || filtro}»</div>
        </div>`
      return
    }

    // Agrupar por sección
    const grupos = {}
    SECCIONES.forEach(s => { grupos[s.key] = [] })
    filtrados.forEach(p => {
      const sec = SECCIONES.find(s => s.estados.includes(p.salud.estado))
      if (sec) grupos[sec.key].push(p)
    })

    lista.innerHTML = SECCIONES
      .filter(s => grupos[s.key].length > 0)
      .map(s => `
        <div class="pm-section">
          <div class="pm-section-header">
            <span class="pm-section-dot" style="background:${s.color}"></span>
            ${s.label}
            <span class="pm-section-count">${grupos[s.key].length}</span>
          </div>
          ${grupos[s.key].map(p => renderCard(p)).join('')}
        </div>
      `).join('')

    lista.querySelectorAll('.pm-card').forEach(card => {
      const openModal = () => {
        const eventId     = card.dataset.eventId
        const proyectoData = proyectos.find(p => p.evento.id === eventId)
        if (!proyectoData) return
        abrirEventProjectManagerModal(
          {
            id:    `inst-${proyectoData.evento.id}`,
            title: proyectoData.evento.titulo,
            start: proyectoData.evento.fecha_inicio,
            extendedProps: {
              rawId:     proyectoData.evento.id,
              ubicacion: proyectoData.evento.ubicacion,
            },
          },
          document.getElementById('pm-modal-zone'),
          { onUpdate: cargarProyectos }
        )
      }
      card.addEventListener('click', openModal)
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal() })
    })
  }

  function renderCard({ evento, salud }) {
    const estado = salud.estado || 'desconocido'
    const dias   = salud.diasRestantes ?? 0
    const tStr   = dias >= 0 ? `T−${dias}` : `T+${Math.abs(dias)}`
    const unit   = dias >= 0 ? 'días'       : 'días pasados'
    const fecha  = new Date(evento.fecha_inicio).toLocaleDateString('es-DO', { dateStyle: 'medium' })
    const deptos = salud.progresoPorDepartamento
      ? Object.entries(salud.progresoPorDepartamento)
          .filter(([, d]) => d.total > 0)
          .map(([k]) => k)
      : []

    return `
      <div class="pm-card" data-event-id="${evento.id}" data-estado="${estado}"
           role="button" tabindex="0" aria-label="Abrir proyecto ${evento.titulo}">
        <div class="pm-tminus">
          <span class="pm-tminus-number">${tStr}</span>
          <span class="pm-tminus-unit">${unit}</span>
        </div>

        <div class="pm-card-body">
          <div class="pm-card-title">${evento.titulo}</div>
          <div class="pm-card-date"><i class="bi bi-calendar3 me-1"></i>${fecha}</div>
          <div class="pm-progress-track">
            <div class="pm-progress-fill" style="width:${salud.porcentaje}%"></div>
          </div>
          <div class="pm-card-meta">
            <span>${salud.completadas}/${salud.totalTareas} tareas · ${salud.porcentaje}%</span>
            ${deptos.map(d => `<span class="pm-dept">${d}</span>`).join('')}
          </div>
        </div>

        <div class="pm-card-action">
          <span class="pm-chip pm-chip-${estado}">${ESTADO_LABEL[estado]}</span>
          <button class="pm-btn-ver" tabindex="-1">
            <i class="bi bi-kanban"></i> Ver
          </button>
        </div>
      </div>
    `
  }

  document.getElementById('pm-filtro-salud')
    ?.addEventListener('change', () => renderLista(todosMacroEventos))

  cargarProyectos()
}
