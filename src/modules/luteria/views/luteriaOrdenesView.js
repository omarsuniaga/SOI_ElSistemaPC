/**
 * luteriaOrdenesView.js — Lista de órdenes de reparación del Taller de Lutería.
 * Lee de public.lut_ordenes_reparacion via luteriaTallerApi (Supabase).
 * Permite filtrar por estado y avanzar la orden al siguiente estado del workflow.
 *
 * Ruta: luteria-ordenes
 * Portal: Lutería (LUT)
 *
 * Loop 17 Sesión 1: vista básica de órdenes con botón "Avanzar estado".
 */

import { getOrdenes, updateOrdenEstado } from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { openLuteriaOrdenWizard } from '../components/luteriaOrdenWizard.js'

const ESTADOS_FLOW = [
  'reportado',
  'recibido',
  'pendiente_diagnostico',
  'diagnosticado',
  'presupuesto_pendiente',
  'esperando_aprobacion',
  'esperando_insumos',
  'en_reparacion',
  'en_prueba',
  'listo_entrega',
  'entregado',
  'cerrado',
]

const ESTADOS_LABELS = {
  reportado: 'Reportado',
  recibido: 'Recibido',
  pendiente_diagnostico: 'Pendiente diagnóstico',
  diagnosticado: 'Diagnosticado',
  presupuesto_pendiente: 'Presupuesto pendiente',
  esperando_aprobacion: 'Esperando aprobación',
  esperando_insumos: 'Esperando insumos',
  en_reparacion: 'En reparación',
  en_prueba: 'En prueba',
  listo_entrega: 'Listo para entrega',
  entregado: 'Entregado',
  cerrado: 'Cerrado',
  cancelado: 'Cancelado',
}

const PRIORIDAD_COLORS = {
  critica: { bg: '#fee2e2', color: '#dc2626' },
  alta: { bg: '#fef3c7', color: '#d97706' },
  media: { bg: '#dbeafe', color: '#2563eb' },
  baja: { bg: '#f3f4f6', color: '#6b7280' },
}

function estadoBadge(estado) {
  const label = ESTADOS_LABELS[estado] || estado
  const map = {
    reportado: { bg: '#fef3c7', color: '#d97706' },
    recibido: { bg: '#dbeafe', color: '#2563eb' },
    pendiente_diagnostico: { bg: '#fef3c7', color: '#d97706' },
    diagnosticado: { bg: '#dbeafe', color: '#2563eb' },
    presupuesto_pendiente: { bg: '#fef3c7', color: '#d97706' },
    esperando_aprobacion: { bg: '#fee2e2', color: '#dc2626' },
    esperando_insumos: { bg: '#fef3c7', color: '#d97706' },
    en_reparacion: { bg: '#dbeafe', color: '#2563eb' },
    en_prueba: { bg: '#dbeafe', color: '#2563eb' },
    listo_entrega: { bg: '#d1fae5', color: '#059669' },
    entregado: { bg: '#d1fae5', color: '#059669' },
    cerrado: { bg: '#f3f4f6', color: '#6b7280' },
    cancelado: { bg: '#f3f4f6', color: '#6b7280' },
  }
  const cfg = map[estado] || { bg: '#f9fafb', color: '#374151' }
  return `<span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:9999px;font-size:0.75rem;font-weight:600;background:${cfg.bg};color:${cfg.color}">${label}</span>`
}

function prioridadBadge(prioridad) {
  const cfg = PRIORIDAD_COLORS[prioridad] || PRIORIDAD_COLORS.baja
  return `<span style="display:inline-block;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.7rem;font-weight:600;background:${cfg.bg};color:${cfg.color}">${prioridad.toUpperCase()}</span>`
}

function siguienteEstado(estadoActual) {
  const idx = ESTADOS_FLOW.indexOf(estadoActual)
  if (idx === -1 || idx === ESTADOS_FLOW.length - 1) return null
  return ESTADOS_FLOW[idx + 1]
}

function renderCard(orden, onAvanzar) {
  const card = document.createElement('div')
  card.className = 'luteria-orden-card'
  card.style.cssText = `background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1rem 1.25rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.06)`

  const instrumentoNombre = orden.alumno_nombre
    ? `${orden.alumno_nombre} — instrumento`
    : 'Instrumento sin asignar'

  const sig = siguienteEstado(orden.estado)
  const sigLabel = sig ? ESTADOS_LABELS[sig] : null

  card.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;flex-wrap:wrap">
          <span style="font-weight:700;font-size:0.9rem;color:#111">${escapeHTML(instrumentoNombre)}</span>
          ${estadoBadge(orden.estado)}
          ${prioridadBadge(orden.prioridad)}
        </div>
        <div style="font-size:0.8125rem;color:#6b7280;margin-bottom:0.25rem">
          <span class="me-2"><i class="bi bi-person me-1"></i>Reportado por: ${escapeHTML(orden.reportado_por_nombre || 'N/D')}</span>
          <span><i class="bi bi-building me-1"></i>Origen: ${escapeHTML(orden.departamento_origen || 'N/D')}</span>
        </div>
        ${orden.descripcion_inicial ? `<div style="font-size:0.8125rem;color:#374151;margin-top:0.5rem;padding:0.5rem 0.75rem;background:#f8fafc;border-radius:6px;border-left:3px solid #cbd5e1">
          <strong>Daño:</strong> ${escapeHTML(orden.descripcion_inicial)}
        </div>` : ''}
        ${orden.diagnostico_resumen ? `<div style="font-size:0.8125rem;color:#374151;margin-top:0.25rem;padding:0.5rem 0.75rem;background:#f0f9ff;border-radius:6px;border-left:3px solid #0ea5e9">
          <strong>Diagnóstico:</strong> ${escapeHTML(orden.diagnostico_resumen)}
        </div>` : ''}
        <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.5rem">
          <i class="bi bi-clock me-1"></i>Creado: ${new Date(orden.created_at).toLocaleString('es-DO')}
        </div>
      </div>
      ${sig ? `<div style="flex-shrink:0">
        <button class="btn-avanzar-orden" data-id="${orden.id}" data-sig-estado="${sig}"
          style="border:none;border-radius:8px;padding:0.4rem 0.9rem;font-size:0.8rem;font-weight:600;cursor:pointer;background:#2563eb;color:#fff">
          <i class="bi bi-arrow-right-circle me-1"></i>Avanzar a: ${escapeHTML(sigLabel)}
        </button>
      </div>` : `<div style="flex-shrink:0;color:#059669;font-size:0.875rem;font-weight:600">
        <i class="bi bi-check-circle me-1"></i>Finalizado
      </div>`}
    </div>
  `

  card.querySelector('.btn-avanzar-orden')?.addEventListener('click', async () => {
    const btn = card.querySelector('.btn-avanzar-orden')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
    try {
      await onAvanzar(orden.id, sig)
    } catch (err) {
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-arrow-right-circle me-1"></i>Avanzar a: ${escapeHTML(sigLabel)}`
      console.error('[luteriaOrdenesView] avanzar error:', err)
      alert('Error al avanzar: ' + err.message)
    }
  })

  return card
}

const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export async function renderLuteriaOrdenesView(container, filtrosIniciales = {}) {
  const ac = new AbortController()
  let filtroEstado = filtrosIniciales.estado || 'todos'

  container.innerHTML = `
    <div style="padding:1.5rem;max-width:1000px;margin:0 auto">
      <div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <h5 style="margin:0;font-weight:700;color:#111">Taller de Lutería — Órdenes de Reparación</h5>
          <p style="margin:0.25rem 0 0;font-size:0.875rem;color:#6b7280">
            Workflow completo: 13 estados desde reportado hasta cerrado
          </p>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button id="btn-nueva-orden-2" class="btn btn-warning btn-sm" style="font-weight:600">
            <i class="bi bi-plus-circle me-1"></i>Nueva orden
          </button>
          <select id="filtro-estado" class="form-select form-select-sm" style="width:auto">
            <option value="todos">Todos los estados</option>
            <option value="reportado">Reportado</option>
            <option value="recibido">Recibido</option>
            <option value="pendiente_diagnostico">Pendiente diagnóstico</option>
            <option value="diagnosticado">Diagnosticado</option>
            <option value="presupuesto_pendiente">Presupuesto pendiente</option>
            <option value="esperando_aprobacion">Esperando aprobación</option>
            <option value="esperando_insumos">Esperando insumos</option>
            <option value="en_reparacion">En reparación</option>
            <option value="en_prueba">En prueba</option>
            <option value="listo_entrega">Listo para entrega</option>
            <option value="entregado">Entregado</option>
            <option value="cerrado">Cerrado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button id="btn-refresh-ordenes" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>
        </div>
      </div>
      <div id="ordenes-list">
        <div class="d-flex justify-content-center align-items-center" style="min-height:200px">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  `

  // Set initial filter value
  container.querySelector('#filtro-estado').value = filtroEstado

  const listEl = container.querySelector('#ordenes-list')

  async function load() {
    listEl.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height:200px">
      <div class="spinner-border text-warning" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`

    try {
      const filtros = filtroEstado === 'todos' ? {} : { estado: filtroEstado }
      const ordenes = await getOrdenes(filtros)

      if (ordenes.length === 0) {
        listEl.innerHTML = `
          <div style="text-align:center;padding:3rem 1rem;color:#6b7280">
            <i class="bi bi-inbox" style="font-size:2.5rem;display:block;margin-bottom:0.75rem"></i>
            <p style="font-weight:600;margin:0">Sin órdenes ${filtroEstado !== 'todos' ? `en estado "${ESTADOS_LABELS[filtroEstado] || filtroEstado}"` : ''}</p>
            <p style="margin:0.25rem 0 0;font-size:0.875rem">No hay trabajo pendiente en el taller.</p>
          </div>`
        return
      }

      listEl.innerHTML = ''
      const frag = document.createDocumentFragment()

      ordenes.forEach((orden) => {
        const card = renderCard(orden, async (id, nuevoEstado) => {
          await updateOrdenEstado(id, nuevoEstado)
          await load()
        })
        frag.appendChild(card)
      })

      listEl.appendChild(frag)
    } catch (err) {
      listEl.innerHTML = `<div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar órdenes: ${escapeHTML(err.message)}
      </div>`
    }
  }

  container.querySelector('#filtro-estado')?.addEventListener('change', (e) => {
    filtroEstado = e.target.value
    load()
  }, { signal: ac.signal })

  container.querySelector('#btn-nueva-orden-2')?.addEventListener('click', async () => {
    await openLuteriaOrdenWizard({ onSuccess: () => load() })
  }, { signal: ac.signal })

  container.querySelector('#btn-refresh-ordenes')?.addEventListener('click', load, { signal: ac.signal })

  await load()

  return {
    teardown() {
      ac.abort()
    },
  }
}