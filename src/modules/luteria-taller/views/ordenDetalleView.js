/**
 * ordenDetalleView.js — Ficha completa de una orden de reparación.
 *
 * Timeline de estados, diagnóstico, evidencias, presupuesto, acciones.
 * Recibe params.id desde el router.
 *
 * Patrón: retorna { teardown() }.
 */

import '../styles/luteria.css'
import * as api from '../api/luteriaTallerApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const ESTADOS_FLUJO = [
  'reportado', 'recibido', 'pendiente_diagnostico', 'diagnosticado',
  'presupuesto_pendiente', 'esperando_aprobacion', 'esperando_insumos',
  'en_reparacion', 'en_prueba', 'listo_entrega', 'entregado', 'cerrado',
]

const ESTADO_LABEL = {
  reportado: 'Reportado', recibido: 'Recibido', pendiente_diagnostico: 'Pte. Diagnóstico',
  diagnosticado: 'Diagnosticado', presupuesto_pendiente: 'Presupuesto Pte.',
  esperando_aprobacion: 'Esperando Aprob.', esperando_insumos: 'Esperando Insumos',
  en_reparacion: 'En Reparación', en_prueba: 'En Prueba', listo_entrega: 'Listo Entrega',
  entregado: 'Entregado', cerrado: 'Cerrado', cancelado: 'Cancelado',
}
const ESTADO_COLOR = {
  reportado: '#dc3545', recibido: '#ffc107', pendiente_diagnostico: '#ffc107',
  diagnosticado: '#0dcaf0', presupuesto_pendiente: '#6c757d', esperando_aprobacion: '#6c757d',
  esperando_insumos: '#212529', en_reparacion: '#0d6efd', en_prueba: '#0dcaf0',
  listo_entrega: '#198754', entregado: '#198754', cerrado: '#6c757d', cancelado: '#212529',
}

const TRANSICIONES = {
  reportado: ['recibido', 'cancelado'],
  recibido: ['pendiente_diagnostico', 'cancelado'],
  pendiente_diagnostico: ['diagnosticado', 'cancelado'],
  diagnosticado: ['presupuesto_pendiente', 'en_reparacion', 'cancelado'],
  presupuesto_pendiente: ['esperando_aprobacion', 'cancelado'],
  esperando_aprobacion: ['esperando_insumos', 'en_reparacion', 'cancelado'],
  esperando_insumos: ['en_reparacion', 'cancelado'],
  en_reparacion: ['en_prueba', 'cancelado'],
  en_prueba: ['listo_entrega', 'cancelado'],
  listo_entrega: ['entregado', 'cancelado'],
  entregado: ['cerrado'],
}

const state = { orden: null, diagnosticos: [], presupuestos: [], evidencias: [] }
let _abort = null

function escapeHTML(str) {
  if (!str) return ''
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-DO', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatFechaCorta(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
}

export async function renderOrdenDetalleView(container, params) {
  _abort?.abort()
  _abort = new AbortController()
  const id = params?.id
  if (!id) {
    container.innerHTML = '<div class="alert alert-warning m-3">ID de orden no especificado.</div>'
    return { teardown: () => _abort?.abort() }
  }

  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`

  try {
    const [orden, diagnosticos, presupuestos, evidencias] = await Promise.all([
      api.getOrdenById(id),
      api.getDiagnosticos(id),
      api.getPresupuestos(id),
      api.getEvidencias(id),
    ])
    if (!orden) {
      container.innerHTML = `<div class="container mt-4"><div class="alert alert-warning">
        <h5><i class="bi bi-question-circle"></i> Orden no encontrada</h5>
        <p>La orden <code>${escapeHTML(id)}</code> no existe.</p></div></div>`
      return { teardown: () => _abort?.abort() }
    }
    state.orden = orden
    state.diagnosticos = diagnosticos
    state.presupuestos = presupuestos
    state.evidencias = evidencias
    renderContent(container)
  } catch (err) {
    console.error('[LutOrdenDetalle] Error:', err)
    container.innerHTML = `<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar la orden</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }

  return { teardown: () => _abort?.abort() }
}

function renderContent(container) {
  const o = state.orden
  const idxActual = ESTADOS_FLUJO.indexOf(o.estado)
  const transiciones = TRANSICIONES[o.estado] || []

  container.innerHTML = `
    <div class="page-container luteria-portal">
      <!-- Header -->
      <div class="d-flex flex-wrap align-items-start gap-2 mb-3">
        <button class="btn btn-sm btn-outline-secondary" id="lut-volver">
          <i class="bi bi-arrow-left me-1"></i>Volver
        </button>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h1 class="mb-0 h4">Orden ${escapeHTML(o.id)}</h1>
            <span class="badge fs-6" style="background:${ESTADO_COLOR[o.estado] || '#6c757d'};color:#fff">
              ${ESTADO_LABEL[o.estado] || o.estado}
            </span>
            ${prioridadBadge(o.prioridad)}
          </div>
          <p class="text-muted small mb-0 mt-1">
            <i class="bi bi-calendar3 me-1"></i>Recibido: ${formatFecha(o.fecha_recepcion)}
            ${o.correlation_id ? `· <i class="bi bi-link-45deg me-1"></i>Hermes: <code style="font-size:0.65rem">${o.correlation_id}</code>` : ''}
          </p>
        </div>
        <!-- Acciones -->
        <div class="d-flex gap-1 flex-wrap">
          ${transiciones.map((t) =>
            `<button class="btn btn-sm btn-outline-primary" data-avanzar="${t}">
              <i class="bi bi-arrow-right-circle me-1"></i>${ESTADO_LABEL[t] || t}
            </button>`
          ).join('')}
        </div>
      </div>

      <div class="row g-3">
        <!-- Columna izquierda: info + timeline -->
        <div class="col-lg-7">
          <!-- Info card -->
          <div class="lut-detail-section">
            <h6>Información de la orden</h6>
            <div class="row g-2 small">
              <div class="col-sm-6"><span class="text-muted">Instrumento:</span><br><span class="fw-semibold">${escapeHTML(o.instrumento_id)}</span></div>
              <div class="col-sm-6"><span class="text-muted">Alumno:</span><br><span class="fw-semibold">${escapeHTML(o.alumno_nombre || '—')}</span></div>
              <div class="col-sm-6"><span class="text-muted">Reportado por:</span><br>${escapeHTML(o.reportado_por_nombre || '—')}</div>
              <div class="col-sm-6"><span class="text-muted">Departamento:</span><br>${escapeHTML(o.departamento_origen || '—')}</div>
              <div class="col-sm-6"><span class="text-muted">Técnico responsable:</span><br>${escapeHTML(o.tecnico_responsable_nombre || '—')}</div>
              <div class="col-sm-6"><span class="text-muted">Recibido por:</span><br>${escapeHTML(o.recibido_por_nombre || '—')}</div>
            </div>
            <hr class="my-2">
            <div class="row g-2 small">
              <div class="col-sm-4"><span class="text-muted">Tipo daño:</span><br><span class="fw-semibold">${escapeHTML(o.tipo_dano || '—')}</span></div>
              <div class="col-sm-4"><span class="text-muted">Gravedad:</span><br>${gravedadBadge(o.gravedad)}</div>
              <div class="col-sm-4"><span class="text-muted">Requiere cobro:</span><br>${o.requiere_cobro ? '<span class="text-danger fw-semibold">Sí</span>' : 'No'}</div>
              <div class="col-sm-4"><span class="text-muted">Requiere reemplazo:</span><br>${o.requiere_reemplazo ? 'Sí' : 'No'}</div>
              <div class="col-sm-4"><span class="text-muted">Aprueba Dirección:</span><br>${o.requiere_aprobacion_direccion ? '<span class="text-warning fw-semibold">Requerida</span>' : 'No requerida'}</div>
            </div>
            ${o.descripcion_inicial ? `
              <hr class="my-2">
              <div class="small"><span class="text-muted">Descripción inicial:</span><br>${escapeHTML(o.descripcion_inicial)}</div>
            ` : ''}
          </div>

          <!-- Costos -->
          <div class="lut-detail-section">
            <h6>Costos</h6>
            <div class="row g-2 small">
              <div class="col-4"><span class="text-muted">Costo estimado:</span><br><span class="fw-semibold">${o.costo_estimado ? 'RD$' + Number(o.costo_estimado).toFixed(2) : '—'}</span></div>
              <div class="col-4"><span class="text-muted">Costo final:</span><br><span class="fw-semibold">${o.costo_final ? 'RD$' + Number(o.costo_final).toFixed(2) : '—'}</span></div>
              <div class="col-4"><span class="text-muted">Estado financiero:</span><br>${o.costo_final ? (o.requiere_cobro ? '<span class="text-warning">Pendiente pago</span>' : '<span class="text-success">Cubierto</span>') : '—'}</div>
            </div>
          </div>

          <!-- Diagnóstico -->
          <div class="lut-detail-section">
            <h6>Diagnóstico técnico</h6>
            ${state.diagnosticos.length === 0
              ? '<div class="text-muted small">Sin diagnóstico registrado.</div>'
              : state.diagnosticos.map((d) => `
                <div class="mb-2 pb-2 ${state.diagnosticos.length > 1 ? 'border-bottom' : ''}">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-info-subtle text-info">${escapeHTML(d.tipo_dano || '—')}</span>
                    <small class="text-muted">${formatFecha(d.created_at)}</small>
                  </div>
                  <p class="small mb-1">${escapeHTML(d.diagnostico_tecnico)}</p>
                  ${d.causa_probable ? `<p class="small text-muted mb-1"><em>Causa: ${escapeHTML(d.causa_probable)}</em></p>` : ''}
                  ${d.reparacion_recomendada ? `<p class="small mb-0"><strong>Recomendación:</strong> ${escapeHTML(d.reparacion_recomendada)}</p>` : ''}
                  <div class="small text-muted mt-1 d-flex gap-3 flex-wrap">
                    ${d.tiempo_estimado_horas ? `<span><i class="bi bi-clock me-1"></i>${d.tiempo_estimado_horas}h</span>` : ''}
                    ${d.costo_mano_obra ? `<span><i class="bi bi-person-gear me-1"></i>MO: RD$${Number(d.costo_mano_obra).toFixed(2)}</span>` : ''}
                    ${d.costo_materiales ? `<span><i class="bi bi-box me-1"></i>Mat: RD$${Number(d.costo_materiales).toFixed(2)}</span>` : ''}
                    <span><i class="bi bi-person me-1"></i>${escapeHTML(d.diagnosticado_por_nombre || '—')}</span>
                  </div>
                </div>`).join('')
            }
          </div>

          <!-- Evidencias -->
          <div class="lut-detail-section">
            <h6>Evidencias (${state.evidencias.length})</h6>
            ${state.evidencias.length === 0
              ? '<div class="text-muted small">Sin evidencias adjuntas.</div>'
              : `<div class="lut-evidence-grid">
                   ${state.evidencias.map((e) => `
                     <div class="lut-evidence-item" title="${escapeHTML(e.descripcion || '')}">
                       <div class="lut-evidence-placeholder">
                         <i class="bi ${tipoIcono(e.tipo)}"></i>
                       </div>
                       <div class="lut-evidence-caption text-muted">
                         <span class="d-block fw-semibold" style="font-size:0.65rem">${escapeHTML(e.tipo)}</span>
                         <span>${escapeHTML(e.nombre || '')}</span>
                       </div>
                     </div>`).join('')}
                 </div>`
            }
          </div>
        </div>

        <!-- Columna derecha: timeline + presupuesto -->
        <div class="col-lg-5">
          <!-- Timeline -->
          <div class="lut-detail-section">
            <h6>Progreso de la orden</h6>
            <div class="lut-timeline small">
              ${ESTADOS_FLUJO.map((est, i) => {
                const isPast = i < idxActual
                const isCurrent = i === idxActual
                const estado = isCurrent ? 'current' : isPast ? 'past' : ''
                const info = o.estado === est
                return `
                  <div class="lut-timeline-item">
                    <div class="lut-timeline-dot ${estado}"></div>
                    <div class="${isCurrent ? 'fw-bold' : isPast ? 'text-muted' : 'text-muted opacity-50'}">
                      ${ESTADO_LABEL[est]}
                      ${info && o.fecha_diagnostico && est === 'diagnosticado' ? `<br><small>${formatFechaCorta(o.fecha_diagnostico)}</small>` : ''}
                      ${info && o.fecha_inicio_reparacion && est === 'en_reparacion' ? `<br><small>${formatFechaCorta(o.fecha_inicio_reparacion)}</small>` : ''}
                      ${info && o.fecha_entrega && est === 'entregado' ? `<br><small>${formatFechaCorta(o.fecha_entrega)}</small>` : ''}
                    </div>
                  </div>`
              }).join('')}
              ${o.estado === 'cancelado' ? `
                <div class="lut-timeline-item">
                  <div class="lut-timeline-dot" style="background:#dc3545;border-color:#dc3545"></div>
                  <div class="fw-bold text-danger">Cancelado</div>
                </div>` : ''}
            </div>
          </div>

          <!-- Presupuesto -->
          <div class="lut-detail-section">
            <h6>Presupuesto</h6>
            ${state.presupuestos.length === 0
              ? '<div class="text-muted small">Sin presupuesto generado.</div>'
              : state.presupuestos.map((p) => `
                <div class="small">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Estado:</span>
                    <span class="fw-semibold">${presupuestoEstadoBadge(p.estado)}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Mano de obra:</span>
                    <span>RD$${Number(p.subtotal_mano_obra).toFixed(2)}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Materiales:</span>
                    <span>RD$${Number(p.subtotal_materiales).toFixed(2)}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Servicios externos:</span>
                    <span>RD$${Number(p.subtotal_servicios_externos).toFixed(2)}</span>
                  </div>
                  ${Number(p.descuento) > 0 ? `
                    <div class="d-flex justify-content-between mb-1">
                      <span class="text-muted">Descuento:</span>
                      <span class="text-success">-RD$${Number(p.descuento).toFixed(2)}</span>
                    </div>` : ''}
                  <hr class="my-1">
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>RD$${Number(p.total).toFixed(2)}</span>
                  </div>
                  ${Number(p.monto_institucion) > 0 ? `
                    <div class="d-flex justify-content-between mt-1 small">
                      <span class="text-muted">Cubre institución:</span>
                      <span class="text-info">RD$${Number(p.monto_institucion).toFixed(2)}</span>
                    </div>` : ''}
                  ${Number(p.monto_representante) > 0 ? `
                    <div class="d-flex justify-content-between small">
                      <span class="text-muted">Cubre representante:</span>
                      <span class="text-warning">RD$${Number(p.monto_representante).toFixed(2)}</span>
                    </div>` : ''}
                  ${p.observaciones ? `<p class="text-muted mt-1 mb-0">${escapeHTML(p.observaciones)}</p>` : ''}
                </div>`).join('')
            }
          </div>

          <!-- Fechas clave -->
          <div class="lut-detail-section">
            <h6>Fechas clave</h6>
            <div class="small">
              <div class="d-flex justify-content-between py-1 border-bottom border-opacity-10">
                <span class="text-muted">Recepción</span>
                <span>${formatFecha(o.fecha_recepcion)}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom border-opacity-10">
                <span class="text-muted">Diagnóstico</span>
                <span>${formatFecha(o.fecha_diagnostico)}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom border-opacity-10">
                <span class="text-muted">Inicio reparación</span>
                <span>${formatFecha(o.fecha_inicio_reparacion)}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom border-opacity-10">
                <span class="text-muted">Estimada entrega</span>
                <span>${formatFecha(o.fecha_estimada_entrega)}</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">Entrega real</span>
                <span class="fw-semibold">${formatFecha(o.fecha_entrega)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  // Wire back
  container.querySelector('#lut-volver')?.addEventListener('click', () => {
    window.router.navigate('lut-ordenes')
  })

  // Wire avanzar estado
  container.querySelectorAll('[data-avanzar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const nuevoEstado = btn.dataset.avanzar
      try {
        await api.updateOrdenEstado(state.orden.id, nuevoEstado)
        AppToast.success(`Orden avanzada a: ${ESTADO_LABEL[nuevoEstado] || nuevoEstado}`)
        // Reload
        const [orden, diagnosticos, presupuestos, evidencias] = await Promise.all([
          api.getOrdenById(state.orden.id),
          api.getDiagnosticos(state.orden.id),
          api.getPresupuestos(state.orden.id),
          api.getEvidencias(state.orden.id),
        ])
        state.orden = orden
        state.diagnosticos = diagnosticos
        state.presupuestos = presupuestos
        state.evidencias = evidencias
        renderContent(container)
      } catch (err) {
        AppToast.error(`Error: ${err.message}`)
      }
    })
  })
}

function prioridadBadge(p) {
  const map = { baja: 'success', media: 'primary', alta: 'warning', critica: 'danger' }
  return `<span class="badge bg-${map[p] || 'secondary'}" style="font-size:0.7rem">${p}</span>`
}

function gravedadBadge(g) {
  const map = { leve: 'success', moderada: 'warning', grave: 'danger', critica: 'dark' }
  if (!g) return '<span class="text-muted">—</span>'
  return `<span class="badge bg-${map[g] || 'secondary'}-subtle text-${map[g] || 'secondary'}">${g}</span>`
}

function presupuestoEstadoBadge(e) {
  const map = {
    borrador: ['secondary', 'Borrador'],
    enviado: ['primary', 'Enviado'],
    aprobado: ['success', 'Aprobado'],
    rechazado: ['danger', 'Rechazado'],
    cubierto_institucion: ['info', 'Cubierto por Inst.'],
  }
  const [c, l] = map[e] || ['secondary', e]
  return `<span class="badge bg-${c}-subtle text-${c}">${l}</span>`
}

function tipoIcono(tipo) {
  const map = {
    foto_antes: 'bi-camera', foto_durante: 'bi-camera-video', foto_despues: 'bi-camera',
    documento: 'bi-file-earmark-text', video: 'bi-film', factura: 'bi-receipt', informe: 'bi-file-earmark-pdf',
  }
  return map[tipo] || 'bi-paperclip'
}
