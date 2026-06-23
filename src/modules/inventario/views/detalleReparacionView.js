import { obtenerReparacion, obtenerHistorialActivo, cambiarEstadoReparacion, actualizarReparacion } from '../api/inventarioApi.js'
import { diasEnReparacion } from '../domain/reparacion.js'
import { formatearMoneda } from '../domain/facturacion.js'

export async function renderDetalleReparacionView(container, { reparacionId }) {
  const _ac = new AbortController()
  container.innerHTML = '<p class="p-4">Cargando detalle de reparaci\u00f3n...</p>'
  const { data: reparacion, error } = await obtenerReparacion(reparacionId)
  if (error) { container.innerHTML = '<div class="alert alert-danger m-4">Error: ' + error.message + '</div>'; return { teardown: () => _ac.abort() } }
  if (!reparacion) { container.innerHTML = '<div class="alert alert-warning m-4">Reparaci\u00f3n no encontrada</div>'; return { teardown: () => _ac.abort() } }
  const estadoBadge = { recibido: 'badge bg-secondary', en_reparacion: 'badge bg-warning text-dark', finalizado: 'badge bg-success', entregado: 'badge bg-info' }
  const dias = diasEnReparacion(reparacion)
  const { data: historial } = await obtenerHistorialActivo(reparacion.activo_id)
  const { data: facturaData } = await import('../api/inventarioApi.js').then(m => m.obtenerFacturasReparacion ? { data: null } : { data: null })

  const transiciones = { recibido: [{ estado: 'en_reparacion', label: 'Iniciar reparaci\u00f3n', desc: 'Cambia estado_uso del activo' }], en_reparacion: [{ estado: 'finalizado', label: 'Finalizar', desc: 'Registra costo_real y fecha_egreso' }], finalizado: [{ estado: 'entregado', label: 'Entregar', desc: 'Repercute en activo: estado_uso \u2192 disponible' }], entregado: [] }[reparacion.estado] || []

  const timelineRows = (historial || []).filter(h => h.tipo_evento === 'reparacion' || h.tipo_evento === 'cambio_estado').map(h => '<tr><td>' + new Date(h.fecha).toLocaleString('es-DO') + '</td><td>' + h.tipo_evento + '</td><td>' + h.descripcion + '</td></tr>').join('')

  container.innerHTML = [
    '<div class="container-fluid p-4">',
    '<div class="d-flex justify-content-between align-items-center mb-4">',
    '<div><h4 class="mb-0"><i class="bi bi-tools me-2"></i>Detalle de reparaci\u00f3n</h4><small class="text-muted">ID: ' + reparacion.id + '</small></div>',
    '<div class="d-flex gap-2">',
    (reparacion.estado === 'recibido' ? '<button id="btn-editar-reparacion" class="btn btn-outline-secondary btn-sm"><i class="bi bi-pencil"></i> Editar</button>' : ''),
    '<button onclick="window.router?.navigate(\'inventario-reparaciones\');return false" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left"></i> Volver</button>',
    '</div></div>',
    '<div class="row g-3"><div class="col-md-6"><div class="card shadow-sm h-100"><div class="card-header fw-semibold">Datos del activo</div><div class="card-body">',
    '<p><strong>C\u00f3digo:</strong> <span class="font-monospace">' + ((reparacion.inventario_activos && reparacion.inventario_activos.codigo_inventario) || reparacion.activo_id || '---') + '</span></p>',
    '<p><strong>Tipo:</strong> ' + ((reparacion.inventario_activos && reparacion.inventario_activos.tipo_instrumento) || '---') + '</p>',
    '<p><strong>Marca / Modelo:</strong> ' + ((reparacion.inventario_activos && reparacion.inventario_activos.marca) || '') + ' ' + ((reparacion.inventario_activos && reparacion.inventario_activos.modelo) || '').trim() + '</p>',
    '</div></div></div>',
    '<div class="col-md-6"><div class="card shadow-sm h-100"><div class="card-header fw-semibold">Datos de reparaci\u00f3n</div><div class="card-body">',
    '<p><strong>Tallerista:</strong> ' + (reparacion.tallerista_nombre || '---') + ' (' + (reparacion.tipo_tallerista || '---') + ')</p>',
    '<p><strong>Descripci\u00f3n:</strong> ' + (reparacion.descripcion || '---') + '</p>',
    '<p><strong>Costo estimado:</strong> ' + (reparacion.costo_estimado ? formatearMoneda(reparacion.costo_estimado) : '---') + '</p>',
    '<p><strong>Costo real:</strong> ' + (reparacion.costo_real ? formatearMoneda(reparacion.costo_real) : '<em>Pendiente</em>') + '</p>',
    '<p><strong>Ingreso:</strong> ' + (reparacion.fecha_ingreso ? new Date(reparacion.fecha_ingreso).toLocaleDateString('es-DO') : '---') + '</p>',
    '<p><strong>Egreso:</strong> ' + (reparacion.fecha_egreso ? new Date(reparacion.fecha_egreso).toLocaleDateString('es-DO') : '<em>Pendiente</em>') + '</p>',
    '<p><strong>D\u00edas en reparaci\u00f3n:</strong> ' + dias + '</p>',
    '<p><strong>Estado actual:</strong> <span id="reparacion-estado" class="' + (estadoBadge[reparacion.estado] || 'badge bg-secondary') + '">' + reparacion.estado + '</span></p>',
    '</div></div></div></div>',
    '<div class="row g-3 mt-1"><div class="col-md-6"><div class="card shadow-sm"><div class="card-header fw-semibold">Acciones</div><div class="card-body" id="acciones-container">',
    transiciones.length === 0 ? '<p class="text-muted mb-0">No hay acciones disponibles.</p>' : transiciones.map(t => '<button class="btn btn-primary btn-avanzar mb-2 w-100" data-estado="' + t.estado + '" data-desc="' + t.desc + '"><i class="bi bi-arrow-right-circle me-1"></i>' + t.label + '<br><small class="text-muted">' + t.desc + '</small></button>').join(''),
    '</div></div></div>',
    '<div class="col-md-6"><div class="card shadow-sm"><div class="card-header fw-semibold">L\u00ednea de tiempo</div><div class="card-body p-0"><table class="table table-hover mb-0 small"><thead class="table-light"><tr><th>Fecha</th><th>Tipo</th><th>Descripci\u00f3n</th></tr></thead><tbody>' + (timelineRows || '<tr><td colspan="3" class="text-center text-muted py-3">Sin eventos</td></tr>') + '</tbody></table></div></div></div></div>',
  ].join('\n')

  container.querySelector('#acciones-container')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-avanzar'); if (!btn) return
    if (!confirm('\u00bfConfirmar avance a "' + btn.dataset.estado + '"? ' + btn.dataset.desc)) return
    btn.disabled = true; const { error } = await cambiarEstadoReparacion(reparacionId, btn.dataset.estado)
    if (error) { alert('Error: ' + error.message); btn.disabled = false } else { renderDetalleReparacionView(container, { reparacionId }) }
  }, { signal: _ac.signal })

  container.querySelector('#btn-editar-reparacion')?.addEventListener('click', () => {
    const desc = prompt('Descripci\u00f3n:', reparacion.descripcion || '')
    if (desc === null) return
    actualizarReparacion(reparacionId, { descripcion: desc }).then(({ error }) => {
      if (error) alert('Error: ' + error.message); else renderDetalleReparacionView(container, { reparacionId })
    })
  }, { signal: _ac.signal })

  return { teardown: () => _ac.abort() }
}
