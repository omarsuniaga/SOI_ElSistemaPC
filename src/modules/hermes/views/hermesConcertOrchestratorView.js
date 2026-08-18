/**
 * hermesConcertOrchestratorView.js — Panel de Orquestación Activa de Conciertos
 * Implementa el protocolo SOP-SOI-CON-001 para Hermes Virtual Operations Manager.
 */

import {
  orquestarConcierto,
  confirmarTiempoTraslado,
  getEventoConcierto,
  getTareasConcierto,
  procesarFeedbackTarea,
  getAlertasConcierto,
  getHitosConcierto,
} from '../api/hermesOrchestrationApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { AppToast } from '../../../shared/components/AppToast.js'

let _abortController = null
let _selectedEventoId = null

const DEPARTAMENTOS_MAP = {
  ACM: { nombre: 'Académica', badge: 'primary', icon: 'bi-music-note-beamed' },
  LUT: { nombre: 'Lutería', badge: 'warning', icon: 'bi-tools' },
  FIN: { nombre: 'Finanzas', badge: 'success', icon: 'bi-cash-coin' },
  LOG: { nombre: 'Logística', badge: 'info', icon: 'bi-truck' },
  COM: { nombre: 'Comunicaciones', badge: 'secondary', icon: 'bi-megaphone' },
  ADM: { nombre: 'Administración', badge: 'dark', icon: 'bi-building' },
  DIR: { nombre: 'Dirección', badge: 'danger', icon: 'bi-shield-check' },
}

const ESTADOS_TAREA = {
  pendiente: { label: 'Pendiente', badge: 'secondary', icon: 'bi-hourglass' },
  en_proceso: { label: 'En Proceso', badge: 'info', icon: 'bi-arrow-repeat' },
  bloqueada: { label: 'Bloqueada', badge: 'danger', icon: 'bi-exclamation-octagon-fill' },
  completada: { label: 'Completada', badge: 'success', icon: 'bi-check-circle-fill' },
  no_aplica: { label: 'No Aplica', badge: 'light', icon: 'bi-dash' },
}

const STYLES = `
<style id="hermes-concert-orchestrator-styles">
  .hermes-shell {
    --h-accent: #f0a500;
    --h-critico: #ef4444;
    --h-riesgo: #f97316;
    --h-orden: #10b981;
    --h-surface: rgba(255, 255, 255, 0.03);
    --h-surface-elevated: rgba(255, 255, 255, 0.06);
    --h-border: rgba(255, 255, 255, 0.08);
    --h-text: #e8e8f2;
    --h-muted: rgba(232, 232, 242, 0.55);
    color: var(--h-text);
    font-family: inherit;
  }

  .hermes-card {
    background: var(--h-surface);
    border: 1px solid var(--h-border);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s ease;
  }
  .hermes-card:hover {
    border-color: rgba(240, 165, 0, 0.3);
  }

  .hitos-stepper {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .hito-node {
    flex: 1;
    min-width: 90px;
    background: var(--h-surface);
    border: 1px solid var(--h-border);
    border-radius: 8px;
    padding: 0.5rem;
    text-align: center;
    font-size: 0.75rem;
  }
  .hito-node.completed {
    border-color: var(--h-orden);
    background: rgba(16, 185, 129, 0.1);
    color: var(--h-orden);
  }
  .hito-node.active {
    border-color: var(--h-accent);
    background: rgba(240, 165, 0, 0.15);
    font-weight: bold;
  }

  .timeline-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.75rem;
  }
  .timeline-tile {
    background: var(--h-surface-elevated);
    border-radius: 8px;
    padding: 0.75rem;
    text-align: center;
    border: 1px solid var(--h-border);
  }
  .timeline-tile .time {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--h-accent);
  }
  .timeline-tile .label {
    font-size: 0.68rem;
    text-transform: uppercase;
    color: var(--h-muted);
  }

  .task-card {
    background: var(--h-surface);
    border: 1px solid var(--h-border);
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 0.75rem;
  }
  .task-card.bloqueada {
    border-left: 4px solid var(--h-critico);
  }
  .task-card.completada {
    border-left: 4px solid var(--h-orden);
    opacity: 0.85;
  }
</style>
`

export async function renderHermesConcertOrchestratorView(containerOrId) {
  const container = typeof containerOrId === 'string'
    ? document.getElementById(containerOrId)
    : containerOrId
  if (!container) return


  if (_abortController) _abortController.abort()
  _abortController = new AbortController()

  container.innerHTML = `
    ${STYLES}
    <div class="hermes-shell container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div class="text-uppercase fw-bold text-warning small tracking-wide">Hermes Operations Manager (SOP-SOI-CON-001)</div>
          <h2 class="fw-black m-0"><i class="bi bi-cpu-fill text-warning me-2"></i>Orquestación Activa de Conciertos</h2>
          <p class="text-muted small m-0">Motor reactivo de eventos, cálculo de tiempos operativos y control de hitos G0-G10</p>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-nuevo-concierto" class="btn btn-warning fw-bold px-3">
            <i class="bi bi-plus-circle-fill me-1"></i> Disparar Nuevo Concierto
          </button>
        </div>
      </div>

      <!-- Selector de Evento -->
      <div class="hermes-card mb-4">
        <div class="row align-items-center g-3">
          <div class="col-md-6">
            <label class="small text-muted mb-1 text-uppercase fw-bold">Seleccionar Concierto Activo</label>
            <select id="select-concierto-activo" class="form-select bg-dark text-light border-secondary">
              <option value="">Cargando eventos...</option>
            </select>
          </div>
          <div class="col-md-6" id="evento-summary-header">
            <!-- Render dinámico de estado actual -->
          </div>
        </div>
      </div>

      <div id="hermes-orchestration-body">
        <div class="text-center text-muted py-5">
          <div class="spinner-border text-warning mb-2" role="status"></div>
          <p>Cargando información del concierto...</p>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Concierto -->
    <div class="modal fade" id="modalNuevoConcierto" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark text-light border-secondary">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-warning"><i class="bi bi-lightning-charge-fill me-2"></i>Disparar Orquestación de Concierto</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="form-orquestar-concierto">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label small text-muted">Nombre del Concierto *</label>
                  <input type="text" id="orch-nombre" class="form-control bg-black text-light border-secondary" required placeholder="Ej: Concierto de Gala de Primavera" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small text-muted">Institución / Convocante</label>
                  <input type="text" id="orch-institucion" class="form-control bg-black text-light border-secondary" placeholder="Ej: Fundación Puntacana" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small text-muted">Lugar / Locación *</label>
                  <input type="text" id="orch-lugar" class="form-control bg-black text-light border-secondary" required placeholder="Ej: Auditorio BlueMall Punta Cana" />
                </div>
                <div class="col-md-3">
                  <label class="form-label small text-muted">Fecha *</label>
                  <input type="date" id="orch-fecha" class="form-control bg-black text-light border-secondary" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label small text-muted">Hora de Inicio</label>
                  <input type="time" id="orch-hora" class="form-control bg-black text-light border-secondary" value="19:00" />
                </div>
              </div>
              <div class="mt-4 text-end">
                <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-warning fw-bold"><i class="bi bi-cpu-fill me-1"></i> Orquestar Tareas Automáticas</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `

  await initEventosSelector()
  attachGlobalListeners()
}

async function initEventosSelector() {
  const select = document.getElementById('select-concierto-activo')
  if (!select) return

  try {
    const { data: eventos, error } = await supabase
      .from('eventos_conciertos')
      .select('id, nombre, fecha, lugar, estado')
      .order('fecha', { ascending: false })

    if (error) throw error

    if (!eventos || eventos.length === 0) {
      select.innerHTML = '<option value="">No hay conciertos registrados. ¡Dispara uno nuevo!</option>'
      document.getElementById('hermes-orchestration-body').innerHTML = `
        <div class="hermes-card text-center py-5">
          <i class="bi bi-calendar2-x fs-1 text-muted d-block mb-3"></i>
          <h4>No hay conciertos en proceso de orquestación</h4>
          <p class="text-muted small">Haz clic en "Disparar Nuevo Concierto" para inicializar el protocolo SOP-SOI-CON-001.</p>
        </div>
      `
      return
    }

    select.innerHTML = eventos
      .map(
        (e) => `
      <option value="${e.id}" ${_selectedEventoId === e.id ? 'selected' : ''}>
        ${e.fecha} — ${e.nombre} (${e.lugar || 'Sin locación'}) [${e.estado}]
      </option>
    `
      )
      .join('')

    _selectedEventoId = select.value
    await loadEventoDetalle(_selectedEventoId)

    select.addEventListener('change', async (e) => {
      _selectedEventoId = e.target.value
      if (_selectedEventoId) {
        await loadEventoDetalle(_selectedEventoId)
      }
    })
  } catch (err) {
    console.error('Error fetching eventos:', err)
    select.innerHTML = `<option value="">Error al cargar conciertos: ${err.message}</option>`
  }
}

async function loadEventoDetalle(eventoId) {
  const body = document.getElementById('hermes-orchestration-body')
  const summaryHeader = document.getElementById('evento-summary-header')
  if (!body) return

  body.innerHTML = `
    <div class="text-center text-muted py-5">
      <div class="spinner-border text-warning mb-2" role="status"></div>
      <p>Consultando base de conocimiento y tareas reactivas...</p>
    </div>
  `

  try {
    const [evento, tareas, hitos, alertas] = await Promise.all([
      getEventoConcierto(eventoId),
      getTareasConcierto(eventoId),
      getHitosConcierto(eventoId),
      getAlertasConcierto(eventoId),
    ])

    if (summaryHeader) {
      summaryHeader.innerHTML = `
        <div class="d-flex justify-content-md-end align-items-center gap-3">
          <div class="text-end">
            <span class="badge bg-warning text-dark px-2 py-1 fw-bold">${evento.estado}</span>
            <div class="small text-muted mt-1">${tareas.filter((t) => t.estado === 'completada').length} / ${tareas.length} Tareas Completadas</div>
          </div>
        </div>
      `
    }

    renderOrchestratorDashboard(evento, tareas, hitos, alertas)
  } catch (err) {
    console.error('Error loading evento detail:', err)
    body.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> Error al cargar datos: ${err.message}
      </div>
    `
  }
}

function renderOrchestratorDashboard(evento, tareas, hitos, alertas) {
  const body = document.getElementById('hermes-orchestration-body')
  if (!body) return

  const formatTime = (ts) => {
    if (!ts) return '--:--'
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  body.innerHTML = `
    <!-- Radar de Hitos G0 a G10 -->
    <div class="hermes-card mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="text-uppercase small fw-bold text-muted m-0"><i class="bi bi-bezier2 text-warning me-1"></i> Línea de Vida de Hitos Institucionales (G0 - G10)</h6>
        <span class="badge bg-dark border border-secondary text-muted">Hito Activo: ${evento.estado}</span>
      </div>
      <div class="hitos-stepper">
        ${hitos
          .map(
            (h) => `
          <div class="hito-node ${h.completado ? 'completed' : ''} ${evento.estado === 'G' + h.numero ? 'active' : ''}">
            <div class="fw-bold">G${h.numero}</div>
            <div class="text-truncate" title="${h.nombre}">${h.nombre.replace(/^G\d+\s*-\s*/, '')}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- Tiempos Calculados & Traslado (Dato Crítico) -->
    <div class="row g-4 mb-4">
      <div class="col-lg-8">
        <div class="hermes-card h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-uppercase small fw-bold text-muted m-0"><i class="bi bi-clock-history text-warning me-1"></i> Cronograma Operativo Calculado (Tiempos T-Minus)</h6>
            <span class="badge bg-dark text-warning border border-warning">${evento.tiempo_traslado_minutos ? `${evento.tiempo_traslado_minutos} min traslado` : 'Traslado no confirmado'}</span>
          </div>

          <div class="timeline-grid">
            <div class="timeline-tile">
              <div class="label">Convocatoria</div>
              <div class="time">${formatTime(evento.convocatoria_estimada)}</div>
            </div>
            <div class="timeline-tile">
              <div class="label">Salida Sede</div>
              <div class="time">${formatTime(evento.salida_estimada)}</div>
            </div>
            <div class="timeline-tile">
              <div class="label">Llegada Sitio</div>
              <div class="time">${formatTime(evento.llegada_estimada)}</div>
            </div>
            <div class="timeline-tile">
              <div class="label">Fin Concierto</div>
              <div class="time">${formatTime(evento.fin_concierto_estimado)}</div>
            </div>
            <div class="timeline-tile">
              <div class="label">Retorno Sede</div>
              <div class="time">${formatTime(evento.regreso_estimado)}</div>
            </div>
            <div class="timeline-tile">
              <div class="label">Recogida Alumnos</div>
              <div class="time">${formatTime(evento.recogida_estimada)}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ajustar Tiempo Traslado D -->
      <div class="col-lg-4">
        <div class="hermes-card h-100">
          <h6 class="text-uppercase small fw-bold text-muted mb-2"><i class="bi bi-geo-alt-fill text-warning me-1"></i> Dato Crítico: Traslado (D)</h6>
          <p class="small text-muted mb-3">Ingresa los minutos estimados de viaje para recalcular automáticamente toda la cadena operativa.</p>
          
          <form id="form-recalcular-traslado" class="d-flex gap-2">
            <input type="number" id="input-traslado-minutos" class="form-control bg-black text-light border-secondary" placeholder="Minutos (ej: 45)" value="${evento.tiempo_traslado_minutos || ''}" min="5" max="360" required />
            <button type="submit" class="btn btn-warning fw-bold text-nowrap"><i class="bi bi-arrow-repeat"></i> Calcular</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Alertas Operativas Detectadas -->
    ${
      alertas.length > 0
        ? `
      <div class="hermes-card mb-4 border-danger">
        <h6 class="text-uppercase small fw-bold text-danger mb-3"><i class="bi bi-shield-exclamation me-1"></i> Alertas Operativas e Inconsistencias (${alertas.length})</h6>
        <div class="row g-3">
          ${alertas
            .map(
              (a) => `
            <div class="col-md-6">
              <div class="p-3 bg-black rounded border border-danger border-opacity-50">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="badge bg-danger text-uppercase">${a.severidad}</span>
                  <span class="small text-muted text-uppercase">${a.tipo}</span>
                </div>
                <div class="fw-bold small text-light mb-1">${a.descripcion}</div>
                <div class="small text-warning"><i class="bi bi-arrow-right-short"></i> ${a.recomendacion || 'Sin recomendación'}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }

    <!-- 7 Tareas Departamentales con Feedback Loop -->
    <div class="hermes-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="text-uppercase small fw-bold text-muted m-0"><i class="bi bi-list-task text-warning me-1"></i> Matriz de Tareas Departamentales Delegadas (${tareas.length})</h6>
        <span class="small text-muted">Protocolo SOP-SOI-CON-001</span>
      </div>

      <div class="row g-3">
        ${tareas
          .map((t) => {
            const depto = DEPARTAMENTOS_MAP[t.departamento] || {
              nombre: t.departamento,
              badge: 'secondary',
              icon: 'bi-app',
            }
            const estado = ESTADOS_TAREA[t.estado] || {
              label: t.estado,
              badge: 'secondary',
              icon: 'bi-app',
            }

            return `
            <div class="col-md-6">
              <div class="task-card ${t.estado}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge bg-${depto.badge}"><i class="${depto.icon} me-1"></i> ${t.departamento} — ${depto.nombre}</span>
                  <span class="badge bg-${estado.badge}"><i class="${estado.icon} me-1"></i> ${estado.label}</span>
                </div>
                
                <h6 class="fw-bold text-light mb-1">${t.titulo}</h6>
                <p class="small text-muted mb-2">${t.descripcion || ''}</p>
                
                ${
                  t.pregunta_operativa
                    ? `
                  <div class="p-2 mb-3 bg-black rounded small border border-secondary border-opacity-25 text-warning">
                    <i class="bi bi-chat-left-dots-fill me-1"></i> <strong>Pregunta Operativa:</strong> ${t.pregunta_operativa}
                  </div>
                `
                    : ''
                }

                ${
                  t.feedback && t.feedback.observaciones
                    ? `
                  <div class="small text-muted mb-2">
                    <strong>Respuesta:</strong> ${t.feedback.respuesta || 'Registrada'} — <em>"${t.feedback.observaciones}"</em>
                  </div>
                `
                    : ''
                }

                <!-- Acciones directas de Feedback Loop -->
                <div class="d-flex gap-2 justify-content-end pt-2 border-top border-secondary border-opacity-25">
                  ${
                    t.estado !== 'completada'
                      ? `
                    <button class="btn btn-sm btn-outline-danger btn-bloquear-tarea" data-tarea-id="${t.id}">
                      <i class="bi bi-x-octagon"></i> Bloquear
                    </button>
                    <button class="btn btn-sm btn-success fw-bold btn-completar-tarea" data-tarea-id="${t.id}">
                      <i class="bi bi-check-lg"></i> Completar
                    </button>
                  `
                      : `
                    <span class="text-success small fw-bold"><i class="bi bi-check2-all me-1"></i> Verificada en DAG</span>
                  `
                  }
                </div>
              </div>
            </div>
          `
          })
          .join('')}
      </div>
    </div>
  `

  attachDashboardListeners(evento.id)
}

function attachGlobalListeners() {
  const btnNuevo = document.getElementById('btn-nuevo-concierto')
  if (btnNuevo) {
    btnNuevo.addEventListener('click', () => {
      const modalEl = document.getElementById('modalNuevoConcierto')
      if (modalEl && window.bootstrap) {
        const modal = new window.bootstrap.Modal(modalEl)
        modal.show()
      }
    })
  }

  const formOrch = document.getElementById('form-orquestar-concierto')
  if (formOrch) {
    formOrch.addEventListener('submit', async (e) => {
      e.preventDefault()
      const nombre = document.getElementById('orch-nombre').value
      const institucion = document.getElementById('orch-institucion').value
      const lugar = document.getElementById('orch-lugar').value
      const fecha = document.getElementById('orch-fecha').value
      const hora = document.getElementById('orch-hora').value

      try {
        const res = await orquestarConcierto({
          nombre,
          institucion,
          lugar,
          fecha,
          hora: hora ? `${hora}:00` : '19:00:00',
        })

        AppToast.success('Concierto orquestado exitosamente con 7 tareas.')
        const modalEl = document.getElementById('modalNuevoConcierto')
        if (modalEl && window.bootstrap) {
          const modalInstance = window.bootstrap.Modal.getInstance(modalEl)
          if (modalInstance) modalInstance.hide()
        }

        _selectedEventoId = res.evento_id
        await initEventosSelector()
      } catch (err) {
        console.error('Error al orquestar concierto:', err)
        AppToast.error('Error al orquestar: ' + err.message)
      }
    })
  }
}

function attachDashboardListeners(eventoId) {
  // Recalcular traslado
  const formTraslado = document.getElementById('form-recalcular-traslado')
  if (formTraslado) {
    formTraslado.addEventListener('submit', async (e) => {
      e.preventDefault()
      const min = document.getElementById('input-traslado-minutos').value
      try {
        await confirmarTiempoTraslado(eventoId, min)
        AppToast.success('Cronograma operativo recalculado con éxito.')
        await loadEventoDetalle(eventoId)
      } catch (err) {
        AppToast.error('Error al calcular: ' + err.message)
      }
    })
  }

  // Completar tarea
  document.querySelectorAll('.btn-completar-tarea').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const tareaId = btn.dataset.tareaId
      const obs = prompt('Ingrese observaciones o confirmación:', 'Listo y verificado')
      if (obs === null) return

      try {
        await procesarFeedbackTarea(tareaId, 'completada', {
          respuesta: 'Sí',
          observaciones: obs,
          timestamp: new Date().toISOString(),
        })
        AppToast.success('Tarea completada y dependientes desbloqueadas.')
        await loadEventoDetalle(eventoId)
      } catch (err) {
        AppToast.error('Error al actualizar tarea: ' + err.message)
      }
    })
  })

  // Bloquear tarea
  document.querySelectorAll('.btn-bloquear-tarea').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const tareaId = btn.dataset.tareaId
      const motivo = prompt('Motivo del bloqueo operativo para alertar a Dirección:', 'Faltan recursos')
      if (motivo === null) return

      try {
        await procesarFeedbackTarea(tareaId, 'bloqueada', {
          respuesta: 'No',
          observaciones: motivo,
          timestamp: new Date().toISOString(),
        })
        AppToast.error('Tarea marcada como bloqueada. Alerta enviada a Dirección.')
        await loadEventoDetalle(eventoId)
      } catch (err) {
        AppToast.error('Error al bloquear tarea: ' + err.message)
      }
    })
  })
}
