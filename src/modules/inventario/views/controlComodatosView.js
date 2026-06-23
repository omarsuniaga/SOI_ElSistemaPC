import { Modal } from 'bootstrap'
import { supabase } from '../../../lib/supabaseClient.js'
import { obtenerActivos, obtenerComodatosActivos, crearComodato, devolverComodato, subirContratoComodato, obtenerComodatosAlumno, renovarComodato } from '../api/inventarioApi.js'
import { puedeAsignarse, estadoVencimiento, puedeRenovarse, TIPOS_COMODATO } from '../domain/comodato.js'

export async function renderControlComodatosView(container) {
  const _ac = new AbortController()
  container.innerHTML = '<p class="p-4">Cargando comodatos...</p>'
  const [{ data: comodatos, error: errComodatos }, { data: activos, error: errActivos }] = await Promise.all([
    obtenerComodatosActivos(), obtenerActivos({ estado_uso: 'disponible' }),
  ])
  if (errComodatos || errActivos) {
    const msg = (errComodatos || errActivos).message
    container.innerHTML = '<div class="alert alert-danger m-4">Error: ' + msg + '</div>'
    return { teardown: () => _ac.abort() }
  }
  const comodatoRows = (comodatos || []).map(c => {
    const ven = c.fecha_vencimiento ? estadoVencimiento(c) : { label: 'Sin vencimiento', clase: 'badge bg-secondary' }
    const renovable = puedeRenovarse(c)
    return '<tr>' +
      '<td class="font-monospace small">' + ((c.inventario_activos && c.inventario_activos.codigo_inventario) ?? '\u2014') + '</td>' +
      '<td>' + ((c.inventario_activos && c.inventario_activos.tipo_instrumento) ?? '\u2014') + '</td>' +
      '<td><a href="#" class="btn-historial-alumno" data-alumno-id="' + (c.alumno_id || '') + '" data-alumno-nombre="' + (c.alumno_nombre || '') + '">' + (c.alumnos?.nombre_completo || c.alumno_nombre || '\u2014') + '</a></td>' +
      '<td>' + (c.fecha_entrega ? new Date(c.fecha_entrega).toLocaleDateString('es-DO') : '\u2014') + '</td>' +
      '<td>' + (c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-DO') : '\u2014') + '</td>' +
      '<td><span class="' + ven.clase + '">' + ven.label + '</span></td>' +
      '<td><span class="badge bg-' + (c.estado === 'activo' ? 'success' : 'secondary') + '">' + (c.estado || 'activo') + '</span></td>' +
      '<td class="d-flex gap-1">' +
        (renovable ? '<button class="btn btn-sm btn-outline-warning btn-renovar" data-id="' + c.id + '" title="Renovar"><i class="bi bi-arrow-clockwise"></i></button>' : '') +
        '<button class="btn btn-sm btn-outline-info btn-intercambiar" data-id="' + c.id + '" title="Intercambiar"><i class="bi bi-arrow-left-right"></i></button>' +
        '<button class="btn btn-sm btn-outline-danger btn-devolver" data-id="' + c.id + '" data-alumno="' + (c.alumnos?.nombre_completo || c.alumno_nombre || '') + '" data-instrumento="' + ((c.inventario_activos && c.inventario_activos.codigo_inventario) || '') + '"><i class="bi bi-box-arrow-in-left"></i></button>' +
      '</td></tr>'
  }).join('')

  const activoOptions = (activos || []).map(a => '<option value="' + a.id + '">' + a.codigo_inventario + ' \u2014 ' + a.tipo_instrumento + '</option>').join('')
  const tipoComodatoOptions = TIPOS_COMODATO.map(t => '<option value="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>').join('')

  container.innerHTML = [
    '<div class="container-fluid p-4">',
    '<div class="d-flex justify-content-between align-items-center mb-4">',
    '<h4 class="mb-0"><i class="bi bi-clipboard-check me-2"></i>Control de Comodatos</h4>',
    '<div class="d-flex gap-2">',
    '<button id="btn-alertas" class="btn btn-warning btn-sm"><i class="bi bi-exclamation-triangle me-1"></i> Alertas</button>',
    '<button id="btn-nuevo-comodato" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i> Asignar instrumento</button>',
    '</div></div>',
    '<div class="card shadow-sm mb-3"><div class="card-body py-2">',
    '<form id="filter-form" class="row g-2 align-items-end">',
    '<div class="col-md-3"><label class="form-label small mb-0">Tipo comodato</label>',
    '<select id="filter-tipo" class="form-select form-select-sm"><option value="">Todos</option>' + TIPOS_COMODATO.map(t => '<option value="' + t + '">' + t + '</option>').join('') + '</select></div>',
    '<div class="col-md-3"><label class="form-label small mb-0">Estado</label>',
    '<select id="filter-estado" class="form-select form-select-sm"><option value="">Todos</option><option value="activo">Activo</option><option value="vencido">Vencido</option><option value="proximo">Pr\u00f3ximo a vencer</option></select></div>',
    '<div class="col-md-3"><label class="form-label small mb-0">Buscar instrumento</label>',
    '<input id="search-input" type="text" class="form-control form-control-sm" placeholder="C\u00f3digo o tipo..."></div>',
    '<div class="col-md-3 d-flex gap-1">',
    '<button id="btn-filtrar" class="btn btn-sm btn-outline-primary"><i class="bi bi-funnel"></i> Filtrar</button>',
    '<button id="btn-limpiar" class="btn btn-sm btn-outline-secondary"><i class="bi bi-x-circle"></i></button>',
    '</div></form></div></div>',
    '<div class="card shadow-sm"><div class="card-body p-0">',
    '<table class="table table-hover mb-0"><thead class="table-light">',
    '<tr><th>C\u00f3digo</th><th>Instrumento</th><th>Alumno</th><th>Entrega</th><th>Vencimiento</th><th>Estado ven.</th><th>Estado</th><th></th></tr>',
    '</thead><tbody id="tbody-comodatos">' + (comodatoRows || '<tr><td colspan="8" class="text-center text-muted py-4">Sin comodatos activos</td></tr>') + '</tbody></table>',
    '</div></div></div>',
    '<div class="modal fade" id="modal-comodato" tabindex="-1"><div class="modal-dialog"><div class="modal-content">',
    '<div class="modal-header"><h5 class="modal-title">Asignar instrumento en comodato</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>',
    '<div class="modal-body"><form id="form-comodato" novalidate>',
    '<div class="mb-3"><label class="form-label fw-semibold">Instrumento disponible</label><select class="form-select" name="activo_id" required><option value="">\u2014 Seleccionar \u2014</option>' + activoOptions + '</select></div>',
    '<div class="mb-3"><label class="form-label fw-semibold">Alumno</label><select class="form-select" name="alumno_id" id="select-alumno" required><option value="">Cargando...</option></select></div>',
    '<div class="row g-3 mb-3"><div class="col-6"><label class="form-label fw-semibold">Tipo comodato</label><select class="form-select" name="tipo_comodato">' + tipoComodatoOptions + '</select></div>',
    '<div class="col-6"><label class="form-label fw-semibold">Fecha vencimiento</label><input type="date" class="form-control" name="fecha_vencimiento"></div></div>',
    '<div class="mb-3"><label class="form-label fw-semibold">Instrumento propio ID</label><input type="text" class="form-control" name="instrumento_propio_id" placeholder="Opcional"></div>',
    '<div class="mb-3"><label class="form-label fw-semibold">Observaciones</label><textarea class="form-control" name="observaciones" rows="2"></textarea></div><div class="mb-3"><label class="form-label fw-semibold">Contrato firmado (PDF)</label><input type="file" class="form-control" id="contrato-file" accept=".pdf,image/*"></div>',
    '<div id="modal-comodato-error" class="alert alert-danger d-none"></div>',
    '</form></div>',
    '<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>',
    '<button id="btn-guardar-comodato" class="btn btn-primary"><i class="bi bi-save me-1"></i> Asignar</button></div>',
    '</div></div></div>',
    '<div class="modal fade" id="modal-historial-alumno" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">',
    '<div class="modal-header"><h5 class="modal-title" id="modal-historial-titulo">Historial del alumno</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>',
    '<div class="modal-body" id="modal-historial-body"><p>Cargando...</p></div>',
    '<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button></div>',
    '</div></div></div>',
    '<div class="modal fade" id="modal-devolucion" tabindex="-1"><div class="modal-dialog"><div class="modal-content">',
    '<div class="modal-header"><h5 class="modal-title">Confirmar devoluci\u00f3n</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>',
    '<div class="modal-body"><p id="devolucion-info"></p><label class="form-label fw-semibold">Fecha de devoluci\u00f3n</label><input type="date" class="form-control" id="input-fecha-devolucion" value="' + new Date().toISOString().split('T')[0] + '"></div>',
    '<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>',
    '<button id="btn-confirmar-devolucion" class="btn btn-danger">Confirmar devoluci\u00f3n</button></div>',
    '</div></div></div>',
  ].join('\n')

  supabase.from('alumnos').select('id, nombre_completo').eq('activo', true).order('nombre_completo').then(({ data: alumnos }) => {
    const sel = container.querySelector('#select-alumno'); if (!sel || !alumnos) return
    sel.innerHTML = '<option value="">\u2014 Seleccionar alumno \u2014</option>' + alumnos.map(a => '<option value="' + a.id + '">' + a.nombre_completo + '</option>').join('')
  })

  container.querySelector('#btn-alertas')?.addEventListener('click', () => { window.router?.navigate('inventario-alertas') }, { signal: _ac.signal })
  container.querySelector('#btn-nuevo-comodato')?.addEventListener('click', () => {
    container.querySelector('#form-comodato')?.reset(); container.querySelector('#modal-comodato-error')?.classList.add('d-none')
    getModal('modal-comodato')?.show()
  }, { signal: _ac.signal })

  container.querySelector('#tbody-comodatos')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button'); if (!btn) return
    const id = btn.dataset.id
    if (btn.classList.contains('btn-devolver')) {
      const { alumno, instrumento } = btn.dataset
      container.querySelector('#devolucion-info').textContent = 'Devolver ' + (instrumento || 'el instrumento') + ' de ' + (alumno || 'alumno') + '?'
      container.querySelector('#input-fecha-devolucion').value = new Date().toISOString().split('T')[0]
      container.querySelector('#btn-confirmar-devolucion').dataset.id = id
      getModal('modal-devolucion')?.show()
    } else if (btn.classList.contains('btn-renovar')) {
      if (!confirm('\u00bfRenovar este comodato?')) return
      btn.disabled = true; const { error } = await renovarComodato(id)
      if (error) { alert('Error: ' + error.message); btn.disabled = false } else { getModal('modal-comodato')?.hide(); renderControlComodatosView(container) }
    } else if (btn.classList.contains('btn-intercambiar')) {
      window.router?.navigate('inventario-intercambio')
    }
  }, { signal: _ac.signal })

  container.querySelector('#btn-confirmar-devolucion')?.addEventListener('click', async () => {
    const id = container.querySelector('#btn-confirmar-devolucion').dataset.id; if (!id) return
    const btn = container.querySelector('#btn-confirmar-devolucion'); btn.disabled = true
    const { error } = await devolverComodato(id)
    if (error) { alert('Error: ' + error.message); btn.disabled = false } else { getModal('modal-devolucion')?.hide(); renderControlComodatosView(container) }
  }, { signal: _ac.signal })

  container.querySelector('#tbody-comodatos')?.addEventListener('click', async (e) => {
    const link = e.target.closest('.btn-historial-alumno'); if (!link) return
    const alumnoId = link.dataset.alumnoId; const nombre = link.dataset.alumnoNombre
    container.querySelector('#modal-historial-titulo').textContent = 'Historial de ' + (nombre || 'Alumno')
    const body = container.querySelector('#modal-historial-body'); body.innerHTML = '<p>Cargando...</p>'
    getModal('modal-historial-alumno')?.show()
    const { data: historial } = await obtenerComodatosAlumno(alumnoId)
    body.innerHTML = historial && historial.length > 0
      ? '<table class="table table-sm"><thead><tr><th>Instrumento</th><th>Entrega</th><th>Devoluci\u00f3n</th><th>Estado</th></tr></thead><tbody>' +
        historial.map(h => '<tr><td>' + ((h.inventario_activos && h.inventario_activos.codigo_inventario) || h.activo_id || '---') + '</td><td>' + (h.fecha_entrega ? new Date(h.fecha_entrega).toLocaleDateString('es-DO') : '---') + '</td><td>' + (h.fecha_devolucion ? new Date(h.fecha_devolucion).toLocaleDateString('es-DO') : '---') + '</td><td>' + (h.estado || '---') + '</td></tr>').join('') +
        '</tbody></table>'
      : '<p class="text-muted">Sin historial de comodatos.</p>'
  }, { signal: _ac.signal })

  container.querySelector('#btn-guardar-comodato')?.addEventListener('click', async () => {
    const form = container.querySelector('#form-comodato'); const errEl = container.querySelector('#modal-comodato-error')
    const fd = new FormData(form); const activo_id = fd.get('activo_id'); const alumno_id = fd.get('alumno_id'); const observaciones = fd.get('observaciones') || null
    const tipo_comodato = fd.get('tipo_comodato') || 'escolar'; const fecha_vencimiento = fd.get('fecha_vencimiento') || null; const instrumento_propio_id = fd.get('instrumento_propio_id') || null
    if (!activo_id || !alumno_id) { errEl.textContent = 'Seleccion\u00e1 el instrumento y el alumno.'; errEl.classList.remove('d-none'); return }
    const btn = container.querySelector('#btn-guardar-comodato'); btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
    const { data: session } = await supabase.auth.getSession()
    const { data: newComodato, error } = await crearComodato({ activo_id, alumno_id, observaciones, registrado_por: session?.session?.user?.id ?? null, fecha_entrega: new Date().toISOString().split('T')[0], estado: 'activo', tipo_comodato, fecha_vencimiento, instrumento_propio_id })
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-save me-1"></i> Asignar'
    if (error) { errEl.textContent = error.message.includes('uix_comodato_activo') ? 'Este instrumento ya tiene un comodato activo.' : error.message; errEl.classList.remove('d-none') } else {
      const contratoFile = container.querySelector('#contrato-file')?.files?.[0]
      if (contratoFile && newComodato?.id) { subirContratoComodato(newComodato.id, contratoFile) }
      getModal('modal-comodato')?.hide(); renderControlComodatosView(container)
    }
  }, { signal: _ac.signal })

  function getModal(id) { const el = container.querySelector('#' + id); if (!el) return null; return new Modal(el) }
  return { teardown: () => _ac.abort() }
}
