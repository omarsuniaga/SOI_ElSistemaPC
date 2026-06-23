import { Modal } from 'bootstrap'
import {
  obtenerFacturasReparacion,
  crearFacturaReparacion,
  registrarPagoFactura,
  anularFactura,
  obtenerFactura,
  obtenerReparaciones,
} from '../api/inventarioApi.js'
import {
  METODOS_PAGO, ESTADOS_FACTURA, TIPOS_FACTURA,
  calcularTotal, calcularIVA, formatearMoneda, puedeAnularse,
} from '../domain/facturacion.js'

export async function renderFacturasReparacionView(container) {
  const _ac = new AbortController()
  container.innerHTML = '<p class="p-4">Cargando facturación...</p>'
  await render()

  async function render() {
    const { data: facturas, error } = await obtenerFacturasReparacion()
    if (error) {
      container.innerHTML = '<div class="alert alert-danger m-4">Error: ' + error.message + '</div>'
      return
    }
    const estadoBadge = { pendiente: 'badge bg-warning text-dark', pagado: 'badge bg-success', anulada: 'badge bg-secondary' }
    const rows = (facturas || []).map(f => {
      const badge = estadoBadge[f.estado_pago] || 'badge bg-secondary'
      return '<tr class="factura-row" data-id="' + f.id + '">' +
        '<td class="font-monospace small">' + (f.id ? f.id.substring(0, 8) : '---') + '</td>' +
        '<td class="font-monospace small">' + (f.reparacion_id ? f.reparacion_id.substring(0, 8) : '---') + '</td>' +
        '<td>' + (f.responsable_id || '---') + '</td>' +
        '<td class="text-end">' + formatearMoneda(f.monto_total || 0) + '</td>' +
        '<td>' + (f.metodo_pago || '---') + '</td>' +
        '<td>' + (f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-DO') : '---') + '</td>' +
        '<td><span class="' + badge + '">' + f.estado_pago + '</span></td>' +
        '<td class="d-flex gap-1">' +
          (f.estado_pago === 'pendiente'
            ? '<button class="btn btn-sm btn-success btn-pagar" data-id="' + f.id + '"><i class="bi bi-check-lg"></i></button>' +
              '<button class="btn btn-sm btn-outline-secondary btn-anular" data-id="' + f.id + '"><i class="bi bi-x-lg"></i></button>'
            : '') +
          '<button class="btn btn-sm btn-outline-info btn-ver" data-id="' + f.id + '"><i class="bi bi-eye"></i></button>' +
        '</td></tr>'
    }).join('')

    const totalPendiente = (facturas || []).filter(f => f.estado_pago === 'pendiente').reduce((s, f) => s + (f.monto_total || 0), 0)
    const totalCobrado = (facturas || []).filter(f => f.estado_pago === 'pagado').reduce((s, f) => s + (f.monto_total || 0), 0)

    container.innerHTML = [
      '<div class="container-fluid p-4">',
      '<div class="d-flex justify-content-between align-items-center mb-4">',
      '<h4 class="mb-0"><i class="bi bi-receipt me-2"></i>Facturación de Reparaciones</h4>',
      '<button id="btn-nueva-factura" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i> Nueva factura</button>',
      '</div>',
      '<div class="card shadow-sm mb-3"><div class="card-body py-2">',
      '<form id="filter-form" class="row g-2 align-items-end">',
      '<div class="col-md-3"><label class="form-label small mb-0">Estado pago</label>',
      '<select id="filter-estado-pago" class="form-select form-select-sm">',
      '<option value="">Todos</option><option value="pendiente">Pendiente</option><option value="pagado">Pagado</option><option value="anulada">Anulada</option>',
      '</select></div>',
      '<div class="col-md-3"><label class="form-label small mb-0">Tipo factura</label>',
      '<select id="filter-tipo-factura" class="form-select form-select-sm">',
      '<option value="">Todos</option><option value="alumno">Alumno</option><option value="institucion">Institución</option>',
      '</select></div>',
      '<div class="col-md-2"><label class="form-label small mb-0">Desde</label>',
      '<input id="filter-desde" type="date" class="form-control form-control-sm">',
      '<div class="col-md-2"><label class="form-label small mb-0">Hasta</label>',
      '<input id="filter-hasta" type="date" class="form-control form-control-sm">',
      '<div class="col-md-2 d-flex gap-1">',
      '<button id="btn-buscar" type="submit" class="btn btn-sm btn-outline-primary"><i class="bi bi-search"></i></button>',
      '<button id="btn-limpiar" type="button" class="btn btn-sm btn-outline-secondary"><i class="bi bi-x-circle"></i></button>',
      '</div></form></div></div>',
      '<div class="card shadow-sm"><div class="card-body p-0"><table class="table table-hover mb-0">',
      '<thead class="table-light"><tr><th>ID Factura</th><th>Reparación</th><th>Responsable</th><th>Total</th><th>Método pago</th><th>Emisión</th><th>Estado</th><th>Acciones</th></tr></thead>',
      '<tbody id="tbody-facturas">',
      (rows || '<tr><td colspan="8" class="text-center text-muted py-4">Sin facturas registradas</td></tr>'),
      '</tbody></table></div>',
      '<div id="facturas-footer" class="card-footer d-flex justify-content-between">',
      '<span class="text-warning fw-semibold">Total pendiente: ' + formatearMoneda(totalPendiente) + '</span>',
      '<span class="text-success fw-semibold">Total cobrado: ' + formatearMoneda(totalCobrado) + '</span>',
      '</div></div></div>',
    ].join('\n')
    bindEvents()
  }

  function bindEvents() {
    container.querySelector('#filter-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      await applyFilters()
    }, { signal: _ac.signal })
    container.querySelector('#btn-buscar')?.addEventListener('click', applyFilters, { signal: _ac.signal })
    container.querySelector('#btn-limpiar')?.addEventListener('click', clearFilters, { signal: _ac.signal })
    container.querySelector('#btn-nueva-factura')?.addEventListener('click', async () => {
      await loadRepairsForSelect()
      container.querySelector('#form-factura')?.reset()
      container.querySelector('#modal-factura-error')?.classList.add('d-none')
      container.querySelector('#modal-factura-titulo').textContent = 'Nueva factura'
      getModal('modal-factura')?.show()
    }, { signal: _ac.signal })

    container.querySelector('#input-subtotal')?.addEventListener('input', () => {
      const subtotal = parseFloat(container.querySelector('#input-subtotal').value) || 0
      const impuestos = calcularIVA(subtotal)
      const total = calcularTotal(subtotal, impuestos)
      container.querySelector('#input-impuestos').value = formatearMoneda(impuestos)
      container.querySelector('#input-total').value = formatearMoneda(total)
      container.querySelector('#input-monto-total').value = total.toFixed(2)
      container.querySelector('#input-impuestos-val').value = impuestos.toFixed(2)
    }, { signal: _ac.signal })

    container.querySelector('#tbody-facturas')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button')
      if (!btn) return; const id = btn.dataset.id; if (!id) return
      if (btn.classList.contains('btn-pagar')) {
        if (confirm('\u00bfMarcar esta factura como pagada?')) {
          btn.disabled = true; const { error } = await registrarPagoFactura(id)
          if (error) { alert('Error: ' + error.message); btn.disabled = false } else { render() }
        }
      } else if (btn.classList.contains('btn-anular')) {
        if (confirm('\u00bfAnular esta factura pendiente?')) {
          btn.disabled = true; const { error } = await anularFactura(id)
          if (error) { alert('Error: ' + error.message); btn.disabled = false } else { render() }
        }
      } else if (btn.classList.contains('btn-ver')) { await showDetail(id) }
    }, { signal: _ac.signal })

    container.querySelector('#btn-guardar-factura')?.addEventListener('click', async () => {
      const form = container.querySelector('#form-factura'); const errEl = container.querySelector('#modal-factura-error')
      const fd = new FormData(form); const reparacion_id = fd.get('reparacion_id')
      const monto_total = parseFloat(fd.get('monto_total') || 0); const impuestos = parseFloat(fd.get('impuestos') || 0)
      const metodo_pago = fd.get('metodo_pago'); const tipo_factura = fd.get('tipo_factura')
      if (!reparacion_id || !monto_total || !metodo_pago) {
        errEl.textContent = 'Complet\u00e1 todos los campos requeridos.'; errEl.classList.remove('d-none'); return
      }
      const btn = container.querySelector('#btn-guardar-factura'); btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
      const { error } = await crearFacturaReparacion({ reparacion_id, monto_total, impuestos, metodo_pago, tipo_factura, fecha_emision: new Date().toISOString().split('T')[0] })
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-save me-1"></i> Crear factura'
      if (error) { errEl.textContent = error.message; errEl.classList.remove('d-none') } else { getModal('modal-factura')?.hide(); render() }
    }, { signal: _ac.signal })
  }

  async function applyFilters() {
    container.querySelector('#btn-buscar').disabled = true
    const estado_pago = container.querySelector('#filter-estado-pago')?.value || ''
    const tipo_factura = container.querySelector('#filter-tipo-factura')?.value || ''
    const desde = container.querySelector('#filter-desde')?.value || ''; const hasta = container.querySelector('#filter-hasta')?.value || ''
    const { data: facturas, error } = await obtenerFacturasReparacion({ estado_pago, tipo_factura, desde, hasta })
    container.querySelector('#btn-buscar').disabled = false; if (error) { alert('Error: ' + error.message); return }
    const tbody = container.querySelector('#tbody-facturas'); if (!tbody) return
    const estadoBadge = { pendiente: 'badge bg-warning text-dark', pagado: 'badge bg-success', anulada: 'badge bg-secondary' }
    tbody.innerHTML = (facturas || []).map(f => {
      const badge = estadoBadge[f.estado_pago] || 'badge bg-secondary'
      return '<tr class="factura-row" data-id="' + f.id + '">' +
        '<td class="font-monospace small">' + (f.id ? f.id.substring(0, 8) : '---') + '</td>' +
        '<td class="font-monospace small">' + (f.reparacion_id ? f.reparacion_id.substring(0, 8) : '---') + '</td>' +
        '<td>' + (f.responsable_id || '---') + '</td>' +
        '<td class="text-end">' + formatearMoneda(f.monto_total || 0) + '</td>' +
        '<td>' + (f.metodo_pago || '---') + '</td>' +
        '<td>' + (f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-DO') : '---') + '</td>' +
        '<td><span class="' + badge + '">' + f.estado_pago + '</span></td>' +
        '<td class="d-flex gap-1">' + (f.estado_pago === 'pendiente'
          ? '<button class="btn btn-sm btn-success btn-pagar" data-id="' + f.id + '"><i class="bi bi-check-lg"></i></button>' +
            '<button class="btn btn-sm btn-outline-secondary btn-anular" data-id="' + f.id + '"><i class="bi bi-x-lg"></i></button>'
          : '') +
        '<button class="btn btn-sm btn-outline-info btn-ver" data-id="' + f.id + '"><i class="bi bi-eye"></i></button></td></tr>'
    }).join('') || '<tr><td colspan="8" class="text-center text-muted py-4">Sin facturas</td></tr>'
    const totalPendiente = (facturas || []).filter(f => f.estado_pago === 'pendiente').reduce((s, f) => s + (f.monto_total || 0), 0)
    const totalCobrado = (facturas || []).filter(f => f.estado_pago === 'pagado').reduce((s, f) => s + (f.monto_total || 0), 0)
    const footer = container.querySelector('#facturas-footer')
    if (footer) { footer.innerHTML = '<span class="text-warning fw-semibold">Total pendiente: ' + formatearMoneda(totalPendiente) + '</span><span class="text-success fw-semibold">Total cobrado: ' + formatearMoneda(totalCobrado) + '</span>' }
  }

  function clearFilters() {
    ['#filter-estado-pago', '#filter-tipo-factura', '#filter-desde', '#filter-hasta'].forEach(id => { const el = container.querySelector(id); if (el) el.value = '' })
    render()
  }

  async function loadRepairsForSelect() {
    const { data: reparaciones } = await obtenerReparaciones({ estado: 'entregado' })
    const sel = container.querySelector('#select-reparacion'); if (!sel) return
    sel.innerHTML = '<option value="">\u2014 Seleccionar reparaci\u00f3n \u2014</option>' +
      (reparaciones || []).map(r => '<option value="' + r.id + '">' + (r.id ? r.id.substring(0, 8) : '---') + '</option>').join('')
  }

  async function showDetail(id) {
    const { data: factura, error } = await obtenerFactura(id)
    const body = container.querySelector('#detalle-factura-body')
    if (error || !factura) { body.innerHTML = '<div class="alert alert-danger">Error al cargar detalle</div>' }
    else {
      body.innerHTML = '<p><strong>ID:</strong> ' + factura.id + '</p><p><strong>Monto:</strong> ' + formatearMoneda(factura.monto_total || 0) +
        '</p><p><strong>Estado:</strong> <span class="badge bg-' + (factura.estado_pago === 'pagado' ? 'success' : factura.estado_pago === 'pendiente' ? 'warning text-dark' : 'secondary') + '">' + factura.estado_pago + '</span></p>' +
        (factura.fecha_pago ? '<p><strong>Pago:</strong> ' + new Date(factura.fecha_pago).toLocaleDateString('es-DO') + '</p>' : '')
    }
    getModal('modal-detalle-factura')?.show()
  }

  function getModal(id) {
    const el = container.querySelector('#' + id); if (!el) return null
    return new Modal(el)
  }
  return { teardown: () => _ac.abort() }
}
