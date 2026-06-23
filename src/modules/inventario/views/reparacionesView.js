import { Modal } from 'bootstrap'
import { obtenerReparaciones, crearReparacion, cambiarEstadoReparacion, obtenerActivos } from '../api/inventarioApi.js'
import { ESTADOS_REPARACION, TRANSICIONES_REPARACION, validarReparacion, diasEnReparacion } from '../domain/reparacion.js'

export async function renderReparacionesView(container) {
  const _ac = new AbortController()
  container.innerHTML = '<p class="p-4">Cargando reparaciones...</p>'
  await render()

  async function render() {
    const { data: reparaciones, error } = await obtenerReparaciones()
    if (error) { container.innerHTML = '<div class="alert alert-danger m-4">Error: ' + error.message + '</div>'; return }
    const estadoBadge = { recibido: 'badge bg-secondary', en_reparacion: 'badge bg-warning text-dark', finalizado: 'badge bg-success', entregado: 'badge bg-info' }
    const enReparacion = (reparaciones || []).filter(r => r.estado === 'en_reparacion' || r.estado === 'recibido').length
    const pendientesEntregar = (reparaciones || []).filter(r => r.estado === 'finalizado').length

    container.innerHTML = [
      '<div class="container-fluid p-4">',
      '<div class="d-flex justify-content-between align-items-center mb-4">',
      '<h4 class="mb-0"><i class="bi bi-tools me-2"></i>Reparaciones</h4>',
      '<button id="btn-nueva-reparacion" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i> Nueva reparación</button>',
      '</div>',
      '<div id="reparaciones-counter" class="alert alert-info py-2 mb-3">',
      '<i class="bi bi-info-circle me-1"></i> ' + enReparacion + ' en reparación, ' + pendientesEntregar + ' pendientes de entregar',
      '</div>',
      '<div class="card shadow-sm mb-3"><div class="card-body py-2">',
      '<form id="filter-form" class="row g-2 align-items-end">',
      '<div class="col-md-2"><label class="form-label small mb-0">Estado</label>',
      '<select id="filter-estado" class="form-select form-select-sm"><option value="">Todos</option>' + ESTADOS_REPARACION.map(e => '<option value="' + e + '">' + e + '</option>').join('') + '</select></div>',
      '<div class="col-md-2"><label class="form-label small mb-0">Tipo tallerista</label>',
      '<select id="filter-tipo-tallerista" class="form-select form-select-sm"><option value="">Todos</option><option value="externo">Externo</option><option value="luthier_interno">Luthier interno</option></select></div>',
      '<div class="col-md-2"><label class="form-label small mb-0">Desde</label><input id="filter-desde" type="date" class="form-control form-control-sm"></div>',
      '<div class="col-md-2"><label class="form-label small mb-0">Hasta</label><input id="filter-hasta" type="date" class="form-control form-control-sm"></div>',
      '<div class="col-md-2"><label class="form-label small mb-0">Buscar</label><input id="search-input" type="text" class="form-control form-control-sm" placeholder="Código o tallerista..."></div>',
      '<div class="col-md-2 d-flex gap-1"><button id="btn-buscar" type="submit" class="btn btn-sm btn-outline-primary"><i class="bi bi-search"></i></button><button id="btn-limpiar" type="button" class="btn btn-sm btn-outline-secondary"><i class="bi bi-x-circle"></i></button></div>',
      '</form></div></div>',
      '<div class="card shadow-sm"><div class="card-body p-0"><table class="table table-hover mb-0">',
      '<thead class="table-light"><tr><th>Activo</th><th>Tipo</th><th>Tallerista</th><th>C. Estimado</th><th>C. Real</th><th>Estado</th><th>Días</th><th>Acciones</th></tr></thead>',
      '<tbody id="tbody-reparaciones">' +
      ((reparaciones || []).map(r => {
        const badge = estadoBadge[r.estado] || 'badge bg-secondary'
        const dias = diasEnReparacion(r)
        const transiciones = TRANSICIONES_REPARACION[r.estado] || []
        const acciones = transiciones.length > 0
          ? '<select class="form-select form-select-sm estado-transition" data-id="' + r.id + '" data-actual="' + r.estado + '"><option value="">Avanzar...</option>' +
            transiciones.map(t => '<option value="' + t + '">' + t + '</option>').join('') + '</select>'
          : '<span class="text-muted small">Completado</span>'
        return '<tr><td class="font-monospace small">' + (r.activo_id || '---') + '</td><td>' + ((r.inventario_activos && r.inventario_activos.tipo_instrumento) || '---') + '</td><td>' + (r.tallerista_nombre || '---') +
          '</td><td class="text-end">' + (r.costo_estimado ? 'RD$ ' + Number(r.costo_estimado).toFixed(2) : '---') + '</td><td class="text-end">' + (r.costo_real ? 'RD$ ' + Number(r.costo_real).toFixed(2) : '---') +
          '</td><td><span class="' + badge + '">' + r.estado + '</span></td><td class="text-center">' + dias + ' días</td><td>' + acciones + '</td></tr>'
      }).join('') || '<tr><td colspan="8" class="text-center text-muted py-4">Sin reparaciones registradas</td></tr>') +
      '</tbody></table></div></div></div>',
    ].join('\n')
    bindEvents()
  }

  function bindEvents() {
    container.querySelector('#filter-form')?.addEventListener('submit', async (e) => { e.preventDefault(); await applyFilters() }, { signal: _ac.signal })
    container.querySelector('#btn-buscar')?.addEventListener('click', applyFilters, { signal: _ac.signal })
    container.querySelector('#btn-limpiar')?.addEventListener('click', clearFilters, { signal: _ac.signal })
    container.querySelector('#btn-nueva-reparacion')?.addEventListener('click', async () => {
      await loadActivosForSelect()
      container.querySelector('#form-reparacion')?.reset()
      container.querySelector('#modal-reparacion-error')?.classList.add('d-none')
      getModal('modal-reparacion')?.show()
    }, { signal: _ac.signal })
    container.querySelector('#tbody-reparaciones')?.addEventListener('change', async (e) => {
      const sel = e.target.closest('.estado-transition'); if (!sel) return
      const id = sel.dataset.id; const nuevoEstado = sel.value; if (!nuevoEstado) return
      if (!confirm('\u00bfAvanzar estado a "' + nuevoEstado + '"?')) { sel.value = ''; return }
      sel.disabled = true; const { error } = await cambiarEstadoReparacion(id, nuevoEstado)
      if (error) { alert('Error: ' + error.message); sel.disabled = false; sel.value = '' } else { render() }
    }, { signal: _ac.signal })
    container.querySelector('#btn-guardar-reparacion')?.addEventListener('click', async () => {
      const form = container.querySelector('#form-reparacion'); const errEl = container.querySelector('#modal-reparacion-error')
      const fd = new FormData(form); const payload = { activo_id: fd.get('activo_id'), tipo_tallerista: fd.get('tipo_tallerista'), tallerista_nombre: fd.get('tallerista_nombre'), descripcion: fd.get('descripcion'), costo_estimado: fd.get('costo_estimado') ? parseFloat(fd.get('costo_estimado')) : null, proveedor_factura_url: fd.get('proveedor_factura_url') || null }
      const errores = validarReparacion(payload)
      if (errores.length) { errEl.textContent = errores.join('; '); errEl.classList.remove('d-none'); return }
      const btn = container.querySelector('#btn-guardar-reparacion'); btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
      const { error } = await crearReparacion(payload)
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-save me-1"></i> Crear reparación'
      if (error) { errEl.textContent = error.message; errEl.classList.remove('d-none') } else { getModal('modal-reparacion')?.hide(); render() }
    }, { signal: _ac.signal })
  }

  async function loadActivosForSelect() {
    const { data: result } = await obtenerActivos({ estado_uso: 'en_reparacion', pageSize: 200 })
    const activos = result?.data || result || []
    const sel = container.querySelector('#select-activo'); if (!sel) return
    sel.innerHTML = '<option value="">\u2014 Seleccionar instrumento \u2014</option>' +
      activos.map(a => '<option value="' + a.id + '">' + (a.codigo_inventario || a.id) + ' \u2014 ' + (a.tipo_instrumento || '') + '</option>').join('')
  }

  async function applyFilters() {
    const estado = container.querySelector('#filter-estado')?.value || ''
    const tipo_tallerista = container.querySelector('#filter-tipo-tallerista')?.value || ''
    const desde = container.querySelector('#filter-desde')?.value || ''; const hasta = container.querySelector('#filter-hasta')?.value || ''
    const q = container.querySelector('#search-input')?.value || ''
    const { data: reparaciones, error } = await obtenerReparaciones({ estado, tipo_tallerista, desde, hasta })
    if (error) { alert('Error: ' + error.message); return }
    const estadoBadge = { recibido: 'badge bg-secondary', en_reparacion: 'badge bg-warning text-dark', finalizado: 'badge bg-success', entregado: 'badge bg-info' }
    const filtered = q ? (reparaciones || []).filter(r => (r.activo_id && r.activo_id.includes(q)) || (r.tallerista_nombre && r.tallerista_nombre.includes(q))) : (reparaciones || [])
    const tbody = container.querySelector('#tbody-reparaciones'); if (!tbody) return
    tbody.innerHTML = filtered.map(r => {
      const badge = estadoBadge[r.estado] || 'badge bg-secondary'; const dias = diasEnReparacion(r)
      const transiciones = TRANSICIONES_REPARACION[r.estado] || []
      const acciones = transiciones.length > 0 ? '<select class="form-select form-select-sm estado-transition" data-id="' + r.id + '" data-actual="' + r.estado + '"><option value="">Avanzar...</option>' + transiciones.map(t => '<option value="' + t + '">' + t + '</option>').join('') + '</select>' : '<span class="text-muted small">Completado</span>'
      return '<tr><td class="font-monospace small">' + (r.activo_id || '---') + '</td><td>' + ((r.inventario_activos && r.inventario_activos.tipo_instrumento) || '---') + '</td><td>' + (r.tallerista_nombre || '---') + '</td><td class="text-end">' + (r.costo_estimado ? 'RD$ ' + Number(r.costo_estimado).toFixed(2) : '---') + '</td><td class="text-end">' + (r.costo_real ? 'RD$ ' + Number(r.costo_real).toFixed(2) : '---') + '</td><td><span class="' + badge + '">' + r.estado + '</span></td><td class="text-center">' + dias + ' días</td><td>' + acciones + '</td></tr>'
    }).join('') || '<tr><td colspan="8" class="text-center text-muted py-4">Sin resultados</td></tr>'
  }

  function clearFilters() { ['#filter-estado', '#filter-tipo-tallerista', '#filter-desde', '#filter-hasta', '#search-input'].forEach(id => { const el = container.querySelector(id); if (el) el.value = '' }); render() }
  function getModal(id) { const el = container.querySelector('#' + id); if (!el) return null; return new Modal(el) }
  return { teardown: () => _ac.abort() }
}
