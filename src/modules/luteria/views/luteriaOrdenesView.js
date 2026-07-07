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
import { openDiagnosticoWizard } from '../components/luteriaDiagnosticoWizard.js'
import '../styles/luteria.css'

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
  card.className = 'lut-card'

  const instrumentoNombre = orden.alumno_nombre
    ? `${orden.alumno_nombre} — instrumento`
    : 'Instrumento sin asignar'

  const sig = siguienteEstado(orden.estado)
  const sigLabel = sig ? ESTADOS_LABELS[sig] : null

  card.innerHTML = `
    <div class="lut-card-row" style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <div style="flex:1;min-width:0">
        <div class="lut-card-meta" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;flex-wrap:wrap">
          <span class="lut-card-title">${escapeHTML(instrumentoNombre)}</span>
          ${estadoBadge(orden.estado)}
          ${prioridadBadge(orden.prioridad)}
        </div>
        <div class="lut-card-meta">
          <span class="me-2"><i class="bi bi-person me-1"></i>Reportado por: ${escapeHTML(orden.reportado_por_nombre || 'N/D')}</span>
          <span><i class="bi bi-building me-1"></i>Origen: ${escapeHTML(orden.departamento_origen || 'N/D')}</span>
        </div>
        ${orden.descripcion_inicial ? `<div class="lut-text-damage">
          <strong>Daño:</strong> ${escapeHTML(orden.descripcion_inicial)}
        </div>` : ''}
        ${orden.diagnostico_resumen ? `<div class="lut-text-diagnostic">
          <strong>Diagnóstico:</strong> ${escapeHTML(orden.diagnostico_resumen)}
        </div>` : ''}
        <div class="lut-text-timestamp">
          <i class="bi bi-clock me-1"></i>Creado: ${new Date(orden.created_at).toLocaleString('es-DO')}
        </div>
      </div>
      ${sig ? `<div class="lut-card-actions">
        <button class="lut-btn lut-btn-primary btn-avanzar-orden" data-id="${orden.id}" data-sig-estado="${sig}">
          <i class="bi bi-arrow-right-circle me-1"></i>Avanzar a: ${escapeHTML(sigLabel)}
        </button>
        <button class="lut-btn btn-diagnosticar-orden" data-id="${orden.id}"
          style="background:#0ea5e9;color:#fff">
          <i class="bi bi-clipboard-data me-1"></i>Diagnosticar
        </button>
      </div>` : `<div class="lut-card-actions">
        <div class="lut-btn-finalizado">
          <i class="bi bi-check-circle me-1"></i>Finalizado
        </div>
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

  card.querySelector('.btn-diagnosticar-orden')?.addEventListener('click', async () => {
    await openDiagnosticoWizard({
      ordenId: orden.id,
      orden,
      instrumentoLabel: orden.alumno_nombre || 'Instrumento sin asignar',
      onSuccess: () => {
        if (onSuccess) onSuccess(orden.id)
      },
    })
  })

  return card
}

const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export async function renderLuteriaOrdenesView(container, filtrosIniciales = {}) {
  const ac = new AbortController()
  let filtroEstado = filtrosIniciales.estado || 'todos'

  container.innerHTML = `
    <div class="lut-container" style="max-width:1000px">
      <div class="lut-header">
        <div>
          <h5 class="lut-section-title">Taller de Lutería — Órdenes de Reparación</h5>
          <p class="lut-section-subtitle">
            Workflow completo: 13 estados desde reportado hasta cerrado
          </p>
        </div>
        <div class="lut-header-actions" style="display:flex;gap:0.5rem;align-items:center">
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
        <div class="lut-loader">
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
    listEl.innerHTML = `<div class="lut-loader">
      <div class="spinner-border text-warning" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`

    try {
      const filtros = filtroEstado === 'todos' ? {} : { estado: filtroEstado }
      const ordenes = await getOrdenes(filtros)

      if (ordenes.length === 0) {
        listEl.innerHTML = `
          <div class="lut-empty">
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