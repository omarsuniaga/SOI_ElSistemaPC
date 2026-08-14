/**
 * eventProjectManagerModal.js — Panel de Orquestación y Project Manager del Evento
 * Convierte cualquier fecha/evento en un Proyecto Operativo Integral en Hermes.
 */

import {
  PUNTA_CANA_VENUES,
  PROTOCOLOS_ORQUESTACION,
  analizarSaludEvento,
} from '../domain/eventProjectManagerEngine.js'

import { supabase } from '../../../lib/supabaseClient.js'
import { actualizarEventoInstitucional } from '../api/calendarioUnificadoApi.js'
import { resolverEstadosIniciales, validarSinCiclos } from '../domain/dagResolutionEngine.js'
import { activarPlanWBS } from '../api/wbsApi.js'

export async function abrirEventProjectManagerModal(evento, mountEl, { onUpdate } = {}) {
  if (!mountEl || !evento) return

  // 1. Obtener las tareas asociadas en Hermes
  const eventRawId = evento.extendedProps?.rawId || evento.id.replace('inst-', '')
  
  let tareasAsociadas = []
  try {
    const { data } = await supabase
      .from('tareas_institucionales')
      .select('*')
      .or(`event_id.eq.${eventRawId},correlation_id.eq.${eventRawId}`)
    tareasAsociadas = data || []
  } catch (err) {
    console.warn('[eventProjectManagerModal] No se pudieron cargar tareas de Hermes:', err)
  }

  const salud = analizarSaludEvento(evento, tareasAsociadas)
  const fechaFmt = evento.start ? new Date(evento.start).toLocaleDateString('es-DO', { dateStyle: 'full' }) : 'Fecha no definida'

  mountEl.innerHTML = `
    <div class="cal-modal-backdrop" id="modal-pm-backdrop">
      <div class="cal-modal-card" style="max-width: 780px;">
        
        <!-- HEADER -->
        <div class="cal-modal-header bg-primary text-white" style="border-radius: 20px 20px 0 0;">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-white text-primary fw-bold">🎯 Project Manager Institucional</span>
              <span class="badge bg-white bg-opacity-25 text-white">${salud.diasRestantes >= 0 ? `T - ${salud.diasRestantes} Días` : `T + ${Math.abs(salud.diasRestantes)} Días`}</span>
            </div>
            <h4 class="fw-bold mb-0 text-white">${evento.title}</h4>
            <span class="small opacity-75"><i class="bi bi-calendar-event me-1"></i>${fechaFmt}</span>
          </div>
          <button type="button" class="btn-close btn-close-white" id="btn-close-pm-modal"></button>
        </div>

        <!-- BODY -->
        <div class="cal-modal-body" style="max-height: 75vh; overflow-y: auto;">
          
          <!-- RESUMEN DE SALUD Y AVANCE -->
          <div class="card border-0 shadow-sm bg-body-tertiary mb-3">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="fw-bold small">Avance Operativo Multidepartamental</span>
                <span class="badge ${salud.estado === 'critico' ? 'bg-danger' : salud.estado === 'en_riesgo' ? 'bg-warning text-dark' : 'bg-success'} fs-6">
                  ${salud.porcentaje}% Completado (${salud.completadas}/${salud.totalTareas} tareas)
                </span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar ${salud.estado === 'critico' ? 'bg-danger' : salud.estado === 'en_riesgo' ? 'bg-warning' : 'bg-success'}" style="width: ${salud.porcentaje}%"></div>
              </div>

              <!-- RADAR POR DEPARTAMENTO -->
              <div class="row g-2 mt-3 text-center">
                ${Object.entries(salud.progresoPorDepartamento).map(([dep, data]) => `
                  <div class="col-4 col-sm-2">
                    <div class="p-2 border rounded-3 bg-body">
                      <div class="fw-bold small text-primary">${dep}</div>
                      <div class="fs-6 fw-bold">${data.porcentaje}%</div>
                      <div class="text-muted" style="font-size: 0.65rem;">${data.completadas}/${data.total} tareas</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- BOTÓN DISPARAR PROTOCOLO SI NO HAY TAREAS -->
          ${salud.totalTareas === 0 ? `
            <div class="alert alert-warning d-flex align-items-center justify-content-between p-3 mb-3">
              <div>
                <h6 class="fw-bold mb-1"><i class="bi bi-lightning-charge-fill me-1"></i> Protocolo Inactivo</h6>
                <p class="small mb-0 text-muted">Este evento aún no tiene un plan de orquestación multidepartamental activo en Hermes.</p>
              </div>
              <button id="btn-activar-orquestacion" class="btn btn-warning btn-sm fw-bold shadow-sm">
                <i class="bi bi-play-circle-fill me-1"></i> Activar Plan WBS
              </button>
            </div>
          ` : ''}

          <!-- CUELLOS DE BOTELLA Y ALERTAS PROACTIVAS -->
          ${salud.cuellosDeBotella.length > 0 ? `
            <div class="card border-danger mb-3">
              <div class="card-header bg-danger text-white py-2 fw-semibold small">
                <i class="bi bi-exclamation-octagon-fill me-1"></i> Cuellos de Botella Detectados (${salud.cuellosDeBotella.length})
              </div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  ${salud.cuellosDeBotella.map(cb => `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-2">
                      <div>
                        <span class="badge bg-secondary me-1">${cb.departamento}</span>
                        <span class="small fw-semibold">${cb.titulo}</span>
                      </div>
                      <span class="badge bg-danger-subtle text-danger border border-danger">
                        ${cb.diasAtraso} días de atraso
                      </span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          ` : ''}

          <!-- ASISTENTE PROACTIVO DE ESPACIOS Y RECINTOS EN PUNTA CANA -->
          <div class="card mb-3">
            <div class="card-header bg-body-tertiary fw-semibold small d-flex align-items-center justify-content-between">
              <span><i class="bi bi-geo-alt-fill text-danger me-1"></i> Scouting y Recintos Recomendados en Punta Cana</span>
              <span class="badge bg-primary-subtle text-primary">Inteligencia Espacial</span>
            </div>
            <div class="card-body">
              <div class="row g-2">
                ${PUNTA_CANA_VENUES.map(venue => {
                  const isSelected = (evento.extendedProps?.ubicacion || '').toLowerCase().includes(venue.nombre.toLowerCase())
                  return `
                    <div class="col-md-6">
                      <div class="p-3 border rounded-3 h-100 ${isSelected ? 'border-primary bg-primary-subtle' : 'bg-body'}">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                          <h6 class="fw-bold mb-0 ${isSelected ? 'text-primary' : ''}">${venue.nombre}</h6>
                          <span class="badge bg-dark">${venue.capacidad} pers.</span>
                        </div>
                        <p class="small text-muted mb-2">${venue.acustica}</p>
                        <div class="small text-secondary mb-2">
                          <i class="bi bi-geo me-1"></i>${venue.ubicacion} · <i class="bi bi-person-badge me-1"></i>${venue.departamentoContacto}
                        </div>
                        <button class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'} w-100 btn-asignar-recinto" data-venue="${venue.nombre}">
                          ${isSelected ? '<i class="bi bi-check-circle-fill me-1"></i> Recinto Seleccionado' : '<i class="bi bi-pin-map me-1"></i> Asignar este Recinto'}
                        </button>
                      </div>
                    </div>
                  `
                }).join('')}
              </div>
            </div>
          </div>

          <!-- LISTADO DE TAREAS HERMES PROGRAMADAS -->
          ${salud.totalTareas > 0 ? `
            <div class="card">
              <div class="card-header bg-body-tertiary fw-semibold small">
                <i class="bi bi-list-check me-1 text-primary"></i> Hitos y Tareas Interdepartamentales (${tareasAsociadas.length})
              </div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush" style="max-height: 250px; overflow-y: auto;">
                  ${tareasAsociadas.map(t => `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-2">
                      <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-primary-subtle text-primary border">${t.departamento}</span>
                        <div>
                          <div class="small fw-semibold ${t.estado === 'completada' ? 'text-decoration-line-through text-muted' : ''}">${t.titulo}</div>
                          <div class="text-muted" style="font-size: 0.72rem;">Vence: ${t.fecha_vencimiento || 'Sin fecha'}</div>
                        </div>
                      </div>
                      <span class="badge ${t.estado === 'completada' ? 'bg-success' : 'bg-secondary'}">${t.estado}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          ` : ''}

          <div id="pm-alert-zone" class="mt-3"></div>

        </div>

        <!-- FOOTER -->
        <div class="cal-modal-footer">
          <button type="button" class="btn btn-primary btn-sm" id="btn-cerrar-pm">Listo</button>
        </div>

      </div>
    </div>
  `

  const cerrarModal = () => { mountEl.innerHTML = '' }
  mountEl.querySelector('#btn-close-pm-modal')?.addEventListener('click', cerrarModal)
  mountEl.querySelector('#btn-cerrar-pm')?.addEventListener('click', cerrarModal)
  mountEl.querySelector('#modal-pm-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-pm-backdrop') cerrarModal()
  })

  // Asignar Recinto al Evento
  mountEl.querySelectorAll('.btn-asignar-recinto').forEach(btn => {
    btn.addEventListener('click', async () => {
      const venueNombre = btn.dataset.venue
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
      
      try {
        await actualizarEventoInstitucional(eventRawId, { ubicacion: venueNombre })
        const az = mountEl.querySelector('#pm-alert-zone')
        if (az) az.innerHTML = `<div class="alert alert-success py-2 small mb-0"><i class="bi bi-check-circle-fill me-1"></i>Recinto <strong>${venueNombre}</strong> asignado al evento.</div>`
        setTimeout(() => { cerrarModal(); onUpdate?.() }, 1500)
      } catch (err) {
        const az = mountEl.querySelector('#pm-alert-zone')
        if (az) az.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Error al asignar recinto: ${err.message}</div>`
        btn.disabled = false
      }
    })
  })

  // Activar Plan WBS Multidepartamental en Hermes
  mountEl.querySelector('#btn-activar-orquestacion')?.addEventListener('click', async () => {
    const btn = mountEl.querySelector('#btn-activar-orquestacion')
    const az  = mountEl.querySelector('#pm-alert-zone')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Desplegando Plan...'

    try {
      const protocolo = PROTOCOLOS_ORQUESTACION.aniversario
      validarSinCiclos(protocolo.hitos)
      const hitosConEstado = resolverEstadosIniciales(protocolo.hitos)
      const { count } = await activarPlanWBS(
        eventRawId,
        evento.title,
        new Date(evento.start),
        hitosConEstado
      )

      if (az) az.innerHTML = `<div class="alert alert-success py-2 small mb-0">
        <i class="bi bi-check-circle-fill me-1"></i>
        Plan Maestro activado — <strong>${count} tareas</strong> desplegadas en ACM, ADM, COM, FIN, DIR y LUT.
      </div>`

      setTimeout(() => { cerrarModal(); onUpdate?.() }, 1800)
    } catch (err) {
      console.error('[eventProjectManagerModal] Error al activar WBS:', err)
      if (az) az.innerHTML = `<div class="alert alert-danger py-2 small mb-0">
        <i class="bi bi-exclamation-triangle-fill me-1"></i>${err.message}
      </div>`
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-play-circle-fill me-1"></i> Activar Plan WBS'
    }
  })
}
