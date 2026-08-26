/**
 * proyectoManagerView.js — Dashboard de macro-eventos WBS para el Portal Admin.
 * Lista todos los proyectos con is_macro_evento = true y su semáforo de salud.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { analizarSaludEvento } from '../../calendario/domain/eventProjectManagerEngine.js'
import { abrirEventProjectManagerModal } from '../../calendario/views/eventProjectManagerModal.js'

const SEMAFORO = {
  en_orden:   { clase: 'success', icono: 'bi-check-circle-fill',     label: 'En Orden' },
  en_riesgo:  { clase: 'warning', icono: 'bi-exclamation-triangle-fill', label: 'En Riesgo' },
  critico:    { clase: 'danger',  icono: 'bi-x-octagon-fill',         label: 'Crítico' },
  completado: { clase: 'secondary', icono: 'bi-archive-fill',         label: 'Completado' },
  desconocido:{ clase: 'secondary', icono: 'bi-question-circle',      label: '—' },
}

export function renderProyectoManagerView(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = `
    <div class="pm-header d-flex align-items-center justify-content-between mb-4">
      <div>
        <h4 class="fw-bold mb-1"><i class="bi bi-kanban-fill text-primary me-2"></i>Project Manager Institucional</h4>
        <p class="text-muted small mb-0">Macro-eventos con plan WBS activo en Hermes</p>
      </div>
      <div class="d-flex gap-2">
        <select id="pm-filtro-salud" class="form-select form-select-sm" style="width: auto;">
          <option value="todos">Todos los estados</option>
          <option value="en_orden">En Orden</option>
          <option value="en_riesgo">En Riesgo</option>
          <option value="critico">Crítico</option>
          <option value="completado">Completado</option>
        </select>
      </div>
    </div>
    <div id="pm-lista" class="row g-3">
      <div class="col-12 text-center py-5 text-muted">
        <div class="spinner-border spinner-border-sm me-2"></div>Cargando proyectos...
      </div>
    </div>
    <div id="pm-modal-zone"></div>
  `

  let todosMacroEventos = []

  async function cargarProyectos() {
    const { data: eventos, error: errEvt } = await supabase
      .from('calendario_institucional')
      .select('id, titulo, fecha_inicio, ubicacion, salud_proyecto, aforo_proyectado, metadata')
      .eq('es_macro_evento', true)
      .order('fecha_inicio', { ascending: true })

    if (errEvt) {
      document.getElementById('pm-lista').innerHTML =
        `<div class="col-12"><div class="alert alert-danger small">Error al cargar proyectos: ${errEvt.message}</div></div>`
      return
    }

    if (!eventos || eventos.length === 0) {
      document.getElementById('pm-lista').innerHTML =
        `<div class="col-12 text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>No hay macro-eventos activos.</div>`
      return
    }

    const { data: todasTareas } = await supabase
      .from('tareas_institucionales')
      .select('id, event_id, estado, prioridad, departamento, titulo, fecha_vencimiento')

    todosMacroEventos = eventos.map(evento => {
      const tareas = (todasTareas || []).filter(t => t.event_id === evento.id)
      const salud = analizarSaludEvento(
        { fecha_inicio: evento.fecha_inicio, start: evento.fecha_inicio, title: evento.titulo, ubicacion: evento.ubicacion },
        tareas
      )
      return { evento, tareas, salud }
    })

    renderLista(todosMacroEventos)
  }

  function renderLista(proyectos) {
    const filtro = document.getElementById('pm-filtro-salud')?.value || 'todos'
    const filtrados = filtro === 'todos'
      ? proyectos
      : proyectos.filter(p => p.salud.estado === filtro)

    const lista = document.getElementById('pm-lista')
    if (!lista) return

    if (filtrados.length === 0) {
      lista.innerHTML = `<div class="col-12 text-center py-4 text-muted">Sin proyectos en estado «${filtro}».</div>`
      return
    }

    lista.innerHTML = filtrados.map(({ evento, salud }) => {
      const sem = SEMAFORO[salud.estado] || SEMAFORO.desconocido
      const diasLabel = salud.diasRestantes >= 0
        ? `T - ${salud.diasRestantes} días`
        : `T + ${Math.abs(salud.diasRestantes)} días`
      const fechaFmt = new Date(evento.fecha_inicio).toLocaleDateString('es-DO', { dateStyle: 'medium' })

      return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-${sem.clase} border-opacity-50">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-${sem.clase} d-flex align-items-center gap-1">
                  <i class="bi ${sem.icono}"></i> ${sem.label}
                </span>
                <span class="badge bg-body-secondary text-body-secondary border small">${diasLabel}</span>
              </div>
              <h6 class="fw-bold mb-1">${evento.titulo}</h6>
              <p class="text-muted small mb-3"><i class="bi bi-calendar3 me-1"></i>${fechaFmt}</p>
              <div class="progress mb-2" style="height:6px;">
                <div class="progress-bar bg-${sem.clase}" style="width:${salud.porcentaje}%"></div>
              </div>
              <div class="d-flex justify-content-between small text-muted mb-3">
                <span>${salud.completadas}/${salud.totalTareas} tareas</span>
                <span>${salud.porcentaje}% completado</span>
              </div>
              <button class="btn btn-outline-primary btn-sm w-100 btn-ver-proyecto"
                data-event-id="${evento.id}">
                <i class="bi bi-kanban me-1"></i> Ver Proyecto
              </button>
            </div>
          </div>
        </div>
      `
    }).join('')

    lista.querySelectorAll('.btn-ver-proyecto').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventId = btn.dataset.eventId
        const proyectoData = todosMacroEventos.find(p => p.evento.id === eventId)
        if (!proyectoData) return

        const eventoFc = {
          id:    `inst-${proyectoData.evento.id}`,
          title: proyectoData.evento.titulo,
          start: proyectoData.evento.fecha_inicio,
          extendedProps: {
            rawId:     proyectoData.evento.id,
            ubicacion: proyectoData.evento.ubicacion,
          },
        }
        const modalZone = document.getElementById('pm-modal-zone')
        abrirEventProjectManagerModal(eventoFc, modalZone, {
          onUpdate: cargarProyectos,
        })
      })
    })
  }

  document.getElementById('pm-filtro-salud')?.addEventListener('change', () => {
    renderLista(todosMacroEventos)
  })

  cargarProyectos()
}