/**
 * calendarioGlobalView.js — Vista Principal del Calendario Institucional SOI
 * Basado en FullCalendar v6 (Vanilla JS) + Design Tokens + Modales Reactivos
 */

import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'

import {
  obtenerEventosCalendario,
  crearEventoInstitucional,
  actualizarEventoInstitucional,
  eliminarEventoInstitucional,
  generarArchivoICS,
  generarGoogleCalendarUrl,
  generarUrlSuscripcionGoogle,
  EVENT_CATEGORIAS,
  DEPARTAMENTOS_SOI,
} from '../api/calendarioUnificadoApi.js'

import { abrirEventProjectManagerModal } from './eventProjectManagerModal.js'
import { router } from '../../../core/router/router.js'
import '../styles/calendarioGlobal.css'

export async function renderCalendarioGlobalView(container) {
  if (!container) return

  const state = {
    categoria: 'todas',
    departamento: 'TODOS',
    search: '',
    incluirClases: true,
    calendar: null,
    cachedEvents: [],
  }

  // 1. Renderizar el Scaffold de la Vista
  container.innerHTML = `
    <div class="cal-global-wrapper">
      
      <!-- ── CARD DE CONTROL Y FILTROS ────────────────────────────────────── -->
      <div class="cal-control-card">
        <div class="cal-control-header">
          <div class="cal-title-section">
            <h2><i class="bi bi-calendar3 text-primary"></i> Calendario Institucional</h2>
            <p>Agenda unificada: eventos institucionales, conciertos, auditorías y clases de cátedra</p>
          </div>
          <div class="cal-action-btns">
            <button id="btn-sync-google" class="btn btn-outline-primary btn-sm fw-semibold" title="Sincronizar con Gmail / Google Calendar">
              <i class="bi bi-google me-1"></i> Sincronizar Google
            </button>
            <button id="btn-export-ics" class="btn btn-outline-secondary btn-sm fw-semibold" title="Exportar a Google / Apple Calendar (.ICS)">
              <i class="bi bi-cloud-arrow-down me-1"></i> Exportar .ICS
            </button>
            <button id="btn-nuevo-evento" class="btn btn-primary btn-sm fw-semibold shadow-sm">
              <i class="bi bi-plus-circle me-1"></i> Nuevo Evento
            </button>
            <button id="btn-ir-proyecto-manager" class="btn btn-outline-success btn-sm fw-semibold" title="Ver Project Manager Institucional">
              <i class="bi bi-kanban me-1"></i> Project Manager
            </button>
          </div>
        </div>

        <!-- FILTROS MULTIDIMENSIONALES -->
        <div class="cal-filters-row">
          <!-- Búsqueda libre -->
          <div class="cal-search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="cal-search-input" class="form-control cal-search-input" placeholder="Buscar por título, docente, lugar..." />
          </div>

          <!-- Filtro por Categoría -->
          <div>
            <select id="cal-select-categoria" class="form-select cal-filter-select" aria-label="Filtrar por categoría">
              <option value="todas">🏷️ Todas las Categorías</option>
              ${Object.entries(EVENT_CATEGORIAS)
                .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
                .join('')}
            </select>
          </div>

          <!-- Filtro por Departamento -->
          <div>
            <select id="cal-select-depto" class="form-select cal-filter-select" aria-label="Filtrar por departamento">
              ${DEPARTAMENTOS_SOI.map(d => `<option value="${d.id}">🏛️ ${d.label}</option>`).join('')}
            </select>
          </div>

          <!-- Toggle Clases Regulares -->
          <div>
            <label class="cal-toggle-label" title="Mostrar u ocultar horarios de clases regulares">
              <input type="checkbox" id="cal-toggle-clases" class="form-check-input mt-0" ${state.incluirClases ? 'checked' : ''} />
              <span>Ver Clases Cátedra</span>
            </label>
          </div>

          <!-- Botón Refrescar -->
          <div>
            <button id="btn-cal-refresh" class="btn btn-light btn-sm" title="Recargar eventos">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ── CARD DEL CALENDARIO (FULLCALENDAR) ────────────────────────────── -->
      <div class="cal-grid-card">
        <div id="fullcalendar-mount"></div>
      </div>

      <!-- CONTENEDOR DE MODALES -->
      <div id="cal-modals-mount"></div>

    </div>
  `

  const calendarEl = container.querySelector('#fullcalendar-mount')
  const modalsMount = container.querySelector('#cal-modals-mount')

  // 2. Configurar e Instanciar FullCalendar
  const isMobile = window.innerWidth < 768

  state.calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: isMobile ? 'listMonth' : 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Agenda',
    },
    locale: 'es',
    firstDay: 1, // Lunes como primer día de semana
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 4,
    navLinks: true,
    height: 'auto',
    
    // Carga asíncrona de eventos
    events: async (fetchInfo, successCallback, failureCallback) => {
      try {
        const events = await obtenerEventosCalendario({
          start: fetchInfo.startStr,
          end: fetchInfo.endStr,
          categoria: state.categoria,
          departamento: state.departamento,
          search: state.search,
          incluirClases: state.incluirClases,
        })
        state.cachedEvents = events
        successCallback(events)
      } catch (err) {
        console.error('[calendarioGlobalView] Error obteniendo eventos:', err)
        failureCallback(err)
      }
    },

    // Click en un evento
    eventClick: (info) => {
      abrirModalDetalle(info.event)
    },

    // Selección de un rango de fecha para crear evento
    select: (info) => {
      abrirModalCrear(info.startStr, info.endStr)
    },

    // Arrastrar y soltar para reprogramar evento
    eventDrop: async (info) => {
      if (info.event.extendedProps?.tipoOrigen === 'clase_regular') {
        info.revert()
        alert('Las clases regulares se administran desde el Constructor de Horarios.')
        return
      }

      try {
        await actualizarEventoInstitucional(info.event.extendedProps.rawId || info.event.id.replace('inst-', ''), {
          fecha_inicio: info.event.startStr,
          fecha_fin: info.event.endStr || info.event.startStr,
        })
      } catch (err) {
        info.revert()
        alert('Error actualizando la fecha del evento: ' + err.message)
      }
    },

    // Redimensionar duración de evento
    eventResize: async (info) => {
      if (info.event.extendedProps?.tipoOrigen === 'clase_regular') {
        info.revert()
        return
      }

      try {
        await actualizarEventoInstitucional(info.event.extendedProps.rawId || info.event.id.replace('inst-', ''), {
          fecha_inicio: info.event.startStr,
          fecha_fin: info.event.endStr || info.event.startStr,
        })
      } catch (err) {
        info.revert()
        alert('Error actualizando la duración del evento: ' + err.message)
      }
    },
  })

  state.calendar.render()

  // 3. Funciones de Modales

  // A) Modal de Detalle de Evento
  function abrirModalDetalle(event) {
    const props = event.extendedProps || {}
    const isInst = props.tipoOrigen === 'institucional'
    const rawId = props.rawId || event.id.replace('inst-', '')

    const startFmt = event.start ? new Date(event.start).toLocaleString('es-DO', { dateStyle: 'full', timeStyle: event.allDay ? undefined : 'short' }) : 'N/A'
    const endFmt = event.end ? new Date(event.end).toLocaleString('es-DO', { dateStyle: 'full', timeStyle: event.allDay ? undefined : 'short' }) : startFmt

    modalsMount.innerHTML = `
      <div class="cal-modal-backdrop" id="modal-detalle-backdrop">
        <div class="cal-modal-card">
          <div class="cal-modal-header">
            <div class="d-flex align-items-center gap-2">
              <span class="cal-badge-dept">
                <i class="bi ${props.categoriaIcon || 'bi-calendar-event'}"></i>
                ${props.departamento || 'DIR'}
              </span>
              <span class="badge bg-light text-dark border">${props.categoriaLabel || 'Evento'}</span>
            </div>
            <button type="button" class="btn-close" id="btn-close-modal"></button>
          </div>

          <div class="cal-modal-body">
            <h4 class="fw-bold mb-1">${event.title}</h4>
            
            <div class="d-flex flex-column gap-2 text-muted small mt-2">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-clock text-primary"></i>
                <span><strong>Horario:</strong> ${startFmt} ${event.end ? ` · ${endFmt}` : ''}</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-geo-alt text-danger"></i>
                <span><strong>Ubicación:</strong> ${props.ubicacion || 'Sede Principal'}</span>
              </div>
              ${props.maestro ? `
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-person-badge text-success"></i>
                  <span><strong>Docente:</strong> ${props.maestro}</span>
                </div>
              ` : ''}
            </div>

            ${props.descripcion ? `
              <div class="p-3 bg-body-tertiary rounded-3 mt-2">
                <label class="small fw-semibold text-muted mb-1 d-block">Descripción / Notas:</label>
                <p class="mb-0 small" style="white-space: pre-wrap;">${props.descripcion}</p>
              </div>
            ` : ''}
          </div>

          <div class="cal-modal-footer">
            ${isInst ? `
              <button id="btn-abrir-pm" class="btn btn-warning btn-sm fw-bold text-dark" title="Abrir Panel de Orquestación y Project Manager">
                <i class="bi bi-bullseye me-1"></i> Project Manager WBS
              </button>
            ` : ''}
            <a href="${generarGoogleCalendarUrl({ title: event.title, start: event.start, end: event.end || event.start, allDay: event.allDay, extendedProps: props })}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm fw-semibold" title="Abrir y guardar en Google Calendar / Gmail">
              <i class="bi bi-google me-1"></i> Añadir a Google
            </a>
            ${isInst ? `
              <button id="btn-eliminar-evento" class="btn btn-outline-danger btn-sm">
                <i class="bi bi-trash me-1"></i> Eliminar
              </button>
            ` : ''}
            <button id="btn-cerrar-modal" class="btn btn-secondary btn-sm">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `

    // Listeners del modal
    const cerrar = () => { modalsMount.innerHTML = '' }
    modalsMount.querySelector('#btn-close-modal')?.addEventListener('click', cerrar)
    modalsMount.querySelector('#btn-cerrar-modal')?.addEventListener('click', cerrar)
    modalsMount.querySelector('#modal-detalle-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-detalle-backdrop') cerrar()
    })

    // Abrir Panel de Project Manager Institucional
    modalsMount.querySelector('#btn-abrir-pm')?.addEventListener('click', () => {
      abrirEventProjectManagerModal(event, modalsMount, {
        onUpdate: () => state.calendar.refetchEvents(),
      })
    })

    // Eliminar Evento
    modalsMount.querySelector('#btn-eliminar-evento')?.addEventListener('click', async () => {
      if (!confirm(`¿Estás seguro de eliminar el evento "${event.title}"?`)) return
      try {
        await eliminarEventoInstitucional(rawId)
        cerrar()
        state.calendar.refetchEvents()
      } catch (err) {
        alert('Error al eliminar el evento: ' + err.message)
      }
    })
  }

  // B) Modal de Creación de Evento
  function abrirModalCrear(startStr = '', endStr = '') {
    // Normalizar fechas para los inputs datetime-local o date
    const startVal = startStr.includes('T') ? startStr.slice(0, 16) : `${startStr}T09:00`
    const endVal = endStr.includes('T') ? endStr.slice(0, 16) : `${startStr}T11:00`

    modalsMount.innerHTML = `
      <div class="cal-modal-backdrop" id="modal-crear-backdrop">
        <div class="cal-modal-card">
          <div class="cal-modal-header">
            <h5 class="fw-bold mb-0"><i class="bi bi-plus-circle text-primary me-2"></i>Nuevo Evento Institucional</h5>
            <button type="button" class="btn-close" id="btn-close-crear-modal"></button>
          </div>

          <form id="form-crear-evento">
            <div class="cal-modal-body">
              <div class="mb-2">
                <label class="form-label small fw-semibold">Título del Evento *</label>
                <input type="text" id="ev-titulo" class="form-control" placeholder="Ej: Concierto de Primavera / Gala Benéfica" required autofocus />
              </div>

              <div class="row g-2 mb-2">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold">Categoría *</label>
                  <select id="ev-categoria" class="form-select" required>
                    ${Object.entries(EVENT_CATEGORIAS)
                      .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
                      .join('')}
                  </select>
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold">Departamento Responsable *</label>
                  <select id="ev-depto" class="form-select" required>
                    ${DEPARTAMENTOS_SOI.filter(d => d.id !== 'TODOS')
                      .map(d => `<option value="${d.id}">${d.label}</option>`)
                      .join('')}
                  </select>
                </div>
              </div>

              <div class="row g-2 mb-2">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold">Fecha y Hora Inicio *</label>
                  <input type="datetime-local" id="ev-inicio" class="form-control" value="${startVal}" required />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold">Fecha y Hora Fin *</label>
                  <input type="datetime-local" id="ev-fin" class="form-control" value="${endVal}" required />
                </div>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-semibold">Ubicación / Sala</label>
                <input type="text" id="ev-ubicacion" class="form-control" placeholder="Ej: Auditorio Principal, Sala 2, Teatro Nacional" />
              </div>

              <div class="mb-2">
                <label class="form-label small fw-semibold">Descripción o Protocolo</label>
                <textarea id="ev-descripcion" class="form-control" rows="3" placeholder="Detalles, repertorio, instrucciones o requisitos institucionales..."></textarea>
              </div>

              <div class="alert alert-info py-2 small mb-0">
                <i class="bi bi-info-circle me-1"></i> Al crear este evento, <strong>Hermes</strong> generará automáticamente las tareas departamentales requeridas.
              </div>
            </div>

            <div class="cal-modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-cancelar-crear">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm fw-semibold" id="btn-guardar-evento">
                <i class="bi bi-check-lg me-1"></i> Guardar Evento
              </button>
            </div>
          </form>
        </div>
      </div>
    `

    const cerrarCrear = () => { modalsMount.innerHTML = '' }
    modalsMount.querySelector('#btn-close-crear-modal')?.addEventListener('click', cerrarCrear)
    modalsMount.querySelector('#btn-cancelar-crear')?.addEventListener('click', cerrarCrear)
    modalsMount.querySelector('#modal-crear-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-crear-backdrop') cerrarCrear()
    })

    // Sincronizar depto por defecto según categoría seleccionada
    const catSelect = modalsMount.querySelector('#ev-categoria')
    const deptoSelect = modalsMount.querySelector('#ev-depto')
    catSelect?.addEventListener('change', () => {
      const selected = EVENT_CATEGORIAS[catSelect.value]
      if (selected && selected.deptDefault) {
        deptoSelect.value = selected.deptDefault
      }
    })

    // Guardar Evento
    modalsMount.querySelector('#form-crear-evento')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const btn = modalsMount.querySelector('#btn-guardar-evento')
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'

      try {
        await crearEventoInstitucional({
          titulo: modalsMount.querySelector('#ev-titulo').value,
          categoria: catSelect.value,
          departamento_responsable: deptoSelect.value,
          fecha_inicio: new Date(modalsMount.querySelector('#ev-inicio').value).toISOString(),
          fecha_fin: new Date(modalsMount.querySelector('#ev-fin').value).toISOString(),
          ubicacion: modalsMount.querySelector('#ev-ubicacion').value,
          descripcion: modalsMount.querySelector('#ev-descripcion').value,
        })

        cerrarCrear()
        state.calendar.refetchEvents()
      } catch (err) {
        alert('Error al guardar el evento: ' + err.message)
        btn.disabled = false
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Guardar Evento'
      }
    })
  }

  // 4. Event Listeners de Filtros y Acciones
  const searchInput = container.querySelector('#cal-search-input')
  const selectCategoria = container.querySelector('#cal-select-categoria')
  const selectDepto = container.querySelector('#cal-select-depto')
  const toggleClases = container.querySelector('#cal-toggle-clases')

  let searchTimeout = null
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      state.search = searchInput.value
      state.calendar.refetchEvents()
    }, 250)
  })

  selectCategoria?.addEventListener('change', () => {
    state.categoria = selectCategoria.value
    state.calendar.refetchEvents()
  })

  selectDepto?.addEventListener('change', () => {
    state.departamento = selectDepto.value
    state.calendar.refetchEvents()
  })

  toggleClases?.addEventListener('change', () => {
    state.incluirClases = toggleClases.checked
    state.calendar.refetchEvents()
  })

  container.querySelector('#btn-cal-refresh')?.addEventListener('click', () => {
    state.calendar.refetchEvents()
  })

  // C) Modal de Sincronización con Google Calendar
  function abrirModalSyncGoogle() {
    const feedUrl = `${window.location.origin}/api/calendario/feed.ics`
    const googleWebcalUrl = generarUrlSuscripcionGoogle(feedUrl)

    modalsMount.innerHTML = `
      <div class="cal-modal-backdrop" id="modal-sync-backdrop">
        <div class="cal-modal-card">
          <div class="cal-modal-header">
            <h5 class="fw-bold mb-0"><i class="bi bi-google text-primary me-2"></i>Sincronización con Google Calendar / Gmail</h5>
            <button type="button" class="btn-close" id="btn-close-sync-modal"></button>
          </div>

          <div class="cal-modal-body">
            <p class="small text-muted mb-3">
              Puedes amarrar y sincronizar los eventos y clases del SOI con tu cuenta de <strong>Google / Gmail</strong>:
            </p>

            <div class="card border-primary mb-3 bg-primary-subtle">
              <div class="card-body py-3">
                <h6 class="fw-bold text-primary mb-1"><i class="bi bi-broadcast me-1"></i> 1. Suscripción en Vivo (Recomendada)</h6>
                <p class="small mb-2 text-dark">Google Calendar se sincronizará automáticamente cada vez que se agregue o modifique un evento en el SOI.</p>
                <div class="d-flex flex-wrap gap-2">
                  <a href="${googleWebcalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm fw-semibold">
                    <i class="bi bi-google me-1"></i> Suscribirse en Google Calendar
                  </a>
                </div>
              </div>
            </div>

            <div class="card mb-2">
              <div class="card-body py-3">
                <h6 class="fw-bold mb-1"><i class="bi bi-download me-1"></i> 2. Exportación de Archivo (.ICS)</h6>
                <p class="small text-muted mb-2">Descarga el archivo <code>.ics</code> para importarlo manualmente en Google Calendar desde <em>Configuración &gt; Importar y exportar</em>.</p>
                <button id="btn-modal-export-ics" class="btn btn-outline-secondary btn-sm">
                  <i class="bi bi-cloud-arrow-down me-1"></i> Descargar Archivo .ICS Ahora
                </button>
              </div>
            </div>

            <div class="card mb-0">
              <div class="card-body py-3">
                <h6 class="fw-bold mb-1"><i class="bi bi-cursor me-1"></i> 3. Botón 1-Click por Evento</h6>
                <p class="small text-muted mb-0">Al hacer clic en cualquier evento de la cuadrícula, puedes usar el botón <strong>"Añadir a Google"</strong> para agendarlo inmediatamente.</p>
              </div>
            </div>
          </div>

          <div class="cal-modal-footer">
            <button type="button" class="btn btn-primary btn-sm" id="btn-cerrar-sync">Listo</button>
          </div>
        </div>
      </div>
    `

    const cerrarSync = () => { modalsMount.innerHTML = '' }
    modalsMount.querySelector('#btn-close-sync-modal')?.addEventListener('click', cerrarSync)
    modalsMount.querySelector('#btn-cerrar-sync')?.addEventListener('click', cerrarSync)
    modalsMount.querySelector('#modal-sync-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-sync-backdrop') cerrarSync()
    })

    modalsMount.querySelector('#btn-modal-export-ics')?.addEventListener('click', () => {
      cerrarSync()
      container.querySelector('#btn-export-ics')?.click()
    })
  }

  container.querySelector('#btn-sync-google')?.addEventListener('click', abrirModalSyncGoogle)

  // Exportar a .ICS
  container.querySelector('#btn-export-ics')?.addEventListener('click', () => {
    if (!state.cachedEvents || state.cachedEvents.length === 0) {
      alert('No hay eventos para exportar en este período.')
      return
    }

    const icsString = generarArchivoICS(state.cachedEvents)
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `calendario-institucional-soi-${new Date().toISOString().split('T')[0]}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })

  container.querySelector('#btn-ir-proyecto-manager')?.addEventListener('click', () => {
    router.navigate('proyecto-manager')
  })

  // 5. Retornar Controlador de Ciclo de Vida
  return {
    element: container,
    destroy() {
      state.calendar?.destroy()
      container.innerHTML = ''
    },
    refetch() {
      state.calendar?.refetchEvents()
    },
  }
}
