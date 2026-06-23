import { obtenerActivos, generarReporte, obtenerComodatosActivos, obtenerReparaciones } from '../api/inventarioApi.js'
import { filtrarReporte, exportarCSV, resumirInventario, activosPorTipo, reparacionesPorEstado } from '../domain/reportes.js'
import { badgeEstadoConservacion, badgeEstadoUso } from '../domain/activo.js'

const TIPOS_REPORTE = ['general', 'historial', 'reparaciones', 'comodatos', 'resumen']
const TIPO_LABELS = {
  general: 'General',
  historial: 'Historial',
  reparaciones: 'Reparaciones',
  comodatos: 'Comodatos',
  resumen: 'Resumen',
}

export async function renderReportesInventarioView(container) {
  const _ac = new AbortController()
  let currentTipo = 'general'
  let currentData = { activos: [], comodatos: [], reparaciones: [] }
  let currentReport = null

  container.innerHTML = '<p class="p-4">Cargando reportes...</p>'

  // Load all data upfront
  const [activosResult, comodatosResult, reparacionesResult] = await Promise.all([
    obtenerActivos({ pageSize: 500 }),
    obtenerComodatosActivos(),
    obtenerReparaciones({}),
  ])

  const activos = activosResult.data?.data || activosResult.data || []
  const comodatos = comodatosResult.data || []
  const reparaciones = reparacionesResult.data || []
  currentData = { activos, comodatos, reparaciones }

  const tiposDisponibles = [...new Set(activos.map(a => a.tipo_instrumento).filter(Boolean))].sort()
  const estadosUso = ['disponible', 'prestado', 'en_mantenimiento', 'en_reparacion', 'de_baja']
  const estadosConservacion = ['excelente', 'bueno', 'regular', 'mantenimiento', 'de_baja']

  renderLayout()

  function renderLayout() {
    container.innerHTML = `
      <div class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0"><i class="bi bi-file-earmark-bar-graph me-2"></i>Reportes de Inventario</h4>
        </div>

        <ul class="nav nav-tabs mb-3" id="report-tabs" role="tablist">
          ${TIPOS_REPORTE.map((tipo, i) => `
            <li class="nav-item" role="presentation">
              <button class="nav-link ${i === 0 ? 'active' : ''}" data-tipo="${tipo}" type="button">
                ${TIPO_LABELS[tipo]}
              </button>
            </li>
          `).join('')}
        </ul>

        <div class="row g-3 mb-3">
          <div class="col-md-12">
            <div class="card" id="filter-panel">
              <div class="card-body py-2">
                <form id="report-filter-form" class="row g-2 align-items-end">
                  <div class="col-md-2">
                    <label class="form-label small mb-0">Tipo instrumento</label>
                    <select class="form-select form-select-sm" name="tipo_instrumento">
                      <option value="">Todos</option>
                      ${tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label small mb-0">Estado uso</label>
                    <select class="form-select form-select-sm" name="estado_uso">
                      <option value="">Todos</option>
                      ${estadosUso.map(e => `<option value="${e}">${e.replace(/_/g, ' ')}</option>`).join('')}
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label small mb-0">Conservación</label>
                    <select class="form-select form-select-sm" name="estado_conservacion">
                      <option value="">Todos</option>
                      ${estadosConservacion.map(e => `<option value="${e}">${e.replace(/_/g, ' ')}</option>`).join('')}
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label small mb-0">Ubicación</label>
                    <input type="text" class="form-control form-control-sm" name="ubicacion" placeholder="Filtrar ubicación">
                  </div>
                  <div class="col-md-2">
                    <button id="btn-generar-reporte" type="submit" class="btn btn-sm btn-primary w-100">
                      <i class="bi bi-search me-1"></i> Generar
                    </button>
                  </div>
                  <div class="col-md-2">
                    <button id="btn-exportar-pdf" type="button" class="btn btn-sm btn-danger w-100">
                      <i class="bi bi-filetype-pdf me-1"></i> Exportar PDF
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body p-0" id="preview-table">
            ${renderPreview('general', currentData, {})}
          </div>
        </div>
      </div>
    `

    bindEvents()
  }

  function renderPreview(tipo, data, filtros) {
    const { activos: act, comodatos: coms, reparaciones: reps } = data
    const filtered = filtrarReporte(act, filtros)
    const { } = filtros

    switch (tipo) {
      case 'general': {
        if (filtered.length === 0) return '<p class="text-muted text-center py-4">Sin datos para los filtros seleccionados.</p>'
        const rows = filtered.map(a => `
          <tr>
            <td class="font-monospace small">${a.codigo_inventario}</td>
            <td>${a.tipo_instrumento}</td>
            <td>${[a.marca, a.modelo].filter(Boolean).join(' ')}</td>
            <td><span class="${badgeEstadoConservacion(a.estado_conservacion)}">${a.estado_conservacion}</span></td>
            <td><span class="${badgeEstadoUso(a.estado_uso)}">${a.estado_uso}</span></td>
            <td>${a.ubicacion || '—'}</td>
            <td>${a.valor_adquisicion ? `RD$ ${Number(a.valor_adquisicion).toLocaleString('es-DO')}` : '—'}</td>
          </tr>
        `).join('')
        return `
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Código</th><th>Tipo</th><th>Marca/Modelo</th><th>Conservación</th><th>Uso</th><th>Ubicación</th><th>Valor</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="card-footer text-muted small">Total: ${filtered.length} instrumentos | Valor total: RD$ ${filtered.reduce((s, a) => s + (Number(a.valor_adquisicion) || 0), 0).toLocaleString('es-DO')}</div>
        `
      }
      case 'historial': {
        return '<p class="text-muted text-center py-4">El historial se exporta como parte del reporte general. Seleccioná un instrumento individual para ver su historial.</p>'
      }
      case 'reparaciones': {
        const filteredReps = reps.filter(r => {
          for (const [k, v] of Object.entries(filtros)) {
            if (!v) continue
            if (k === 'tipo_instrumento' || k === 'estado_uso' || k === 'estado_conservacion' || k === 'ubicacion') continue
          }
          return true
        })
        if (filteredReps.length === 0) return '<p class="text-muted text-center py-4">Sin reparaciones registradas.</p>'
        const rows = filteredReps.map(r => `
          <tr>
            <td class="font-monospace small">${r.activo_id || '—'}</td>
            <td>${r.descripcion ? r.descripcion.substring(0, 50) : '—'}</td>
            <td>${r.tallerista_nombre || '—'}</td>
            <td><span class="badge ${r.estado === 'entregado' ? 'bg-success' : r.estado === 'en_reparacion' ? 'bg-warning' : r.estado === 'finalizado' ? 'bg-info' : 'bg-secondary'}">${r.estado}</span></td>
            <td>${new Date(r.fecha_ingreso).toLocaleDateString('es-DO')}</td>
            <td>${r.costo_real ? `RD$ ${Number(r.costo_real).toLocaleString()}` : r.costo_estimado ? `RD$ ${Number(r.costo_estimado).toLocaleString()} (est.)` : '—'}</td>
          </tr>
        `).join('')
        const porEstado = reparacionesPorEstado(filteredReps)
        const resumenRep = Object.entries(porEstado).map(([est, cnt]) => `${est}: ${cnt}`).join(' | ')
        return `
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Activo</th><th>Descripción</th><th>Tallerista</th><th>Estado</th><th>Ingreso</th><th>Costo</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="card-footer text-muted small">Total: ${filteredReps.length} reparaciones | Por estado: ${resumenRep}</div>
        `
      }
      case 'comodatos': {
        const filteredComs = coms.filter(c => c.estado === 'activo')
        if (filteredComs.length === 0) return '<p class="text-muted text-center py-4">Sin comodatos activos.</p>'
        const rows = filteredComs.map(c => `
          <tr>
            <td class="font-monospace small">${c.activo_id || '—'}</td>
            <td>${c.alumno_nombre || '—'}</td>
            <td>${new Date(c.fecha_entrega).toLocaleDateString('es-DO')}</td>
            <td>${c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-DO') : '—'}</td>
            <td>${c.tipo_comodato || '—'}</td>
          </tr>
        `).join('')
        return `
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Activo</th><th>Alumno</th><th>Entrega</th><th>Vencimiento</th><th>Tipo</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="card-footer text-muted small">Total: ${filteredComs.length} comodatos activos</div>
        `
      }
      case 'resumen': {
        const resumen = resumirInventario({ activos: filtered, comodatos: coms, reparaciones: reps })
        const porTipo = activosPorTipo(filtered)
        const tipoRows = Object.entries(porTipo).map(([tipo, cnt]) => `
          <tr><td>${tipo}</td><td>${cnt}</td></tr>
        `).join('')
        return `
          <div class="p-3">
            <div class="row g-3 mb-3">
              <div class="col-md-3"><div class="border rounded p-3 text-center"><h6>Total</h6><span class="fs-4 fw-bold">${resumen.total}</span></div></div>
              <div class="col-md-3"><div class="border rounded p-3 text-center"><h6>Disponibles</h6><span class="fs-4 fw-bold text-success">${resumen.disponibles}</span></div></div>
              <div class="col-md-3"><div class="border rounded p-3 text-center"><h6>En uso</h6><span class="fs-4 fw-bold text-info">${resumen.en_uso}</span></div></div>
              <div class="col-md-3"><div class="border rounded p-3 text-center"><h6>En reparación</h6><span class="fs-4 fw-bold text-danger">${resumen.en_reparacion}</span></div></div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-md-3"><div class="border rounded p-3 text-center"><h6>Ociosos</h6><span class="fs-4 fw-bold text-warning">${resumen.ociosos}</span></div></div>
              <div class="col-md-3"><div class="border rounded p-3 text-center"><h6>De baja</h6><span class="fs-4 fw-bold text-dark">${resumen.de_baja}</span></div></div>
              <div class="col-md-6"><div class="border rounded p-3 text-center"><h6>Valor total</h6><span class="fs-4 fw-bold text-primary">RD$ ${(resumen.valor_total || 0).toLocaleString('es-DO')}</span></div></div>
            </div>
            <h6 class="fw-semibold mt-3">Por tipo de instrumento</h6>
            <table class="table table-sm table-hover">
              <thead class="table-light"><tr><th>Tipo</th><th>Cantidad</th></tr></thead>
              <tbody>${tipoRows || '<tr><td colspan="2" class="text-muted text-center">Sin datos</td></tr>'}</tbody>
            </table>
          </div>
        `
      }
      default:
        return '<p class="text-muted text-center py-4">Seleccioná un tipo de reporte.</p>'
    }
  }

  function generatePDF(tipo, data, filtros) {
    const { activos: act, comodatos: coms, reparaciones: reps } = data
    const filtered = filtrarReporte(act, filtros)

    try {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()

      // Header
      doc.setFontSize(16)
      doc.text('Sistema de Inventario - SOI', pageW / 2, 15, { align: 'center' })
      doc.setFontSize(11)
      doc.text(`Reporte ${TIPO_LABELS[tipo]} - ${new Date().toLocaleDateString('es-DO')}`, pageW / 2, 22, { align: 'center' })
      doc.line(10, 26, pageW - 10, 26)

      let y = 32
      const colW = 8
      const rowH = 7

      if (tipo === 'general') {
        const headers = [['Código', 'Tipo', 'Marca/Modelo', 'Conservación', 'Uso', 'Ubicación', 'Valor']]
        const rows = filtered.map(a => [
          a.codigo_inventario || '',
          a.tipo_instrumento || '',
          [a.marca, a.modelo].filter(Boolean).join(' ') || '',
          a.estado_conservacion || '',
          a.estado_uso || '',
          a.ubicacion || '',
          a.valor_adquisicion ? `RD$ ${Number(a.valor_adquisicion).toFixed(2)}` : '—',
        ])
        doc.autoTable({ head: headers, body: rows, startY: y, theme: 'grid', headStyles: { fillColor: [13, 110, 253] } })
        y = doc.lastAutoTable.finalY + 5
        doc.text(`Total: ${filtered.length} instrumentos | Valor total: RD$ ${filtered.reduce((s, a) => s + (Number(a.valor_adquisicion) || 0), 0).toLocaleString('es-DO')}`, 14, y)
      } else if (tipo === 'reparaciones') {
        const filteredReps = reps.filter(r => true)
        const headers = [['Activo', 'Descripción', 'Tallerista', 'Estado', 'Ingreso', 'Costo']]
        const rows = filteredReps.map(r => [
          r.activo_id || '',
          r.descripcion ? r.descripcion.substring(0, 60) : '',
          r.tallerista_nombre || '',
          r.estado || '',
          new Date(r.fecha_ingreso).toLocaleDateString('es-DO'),
          r.costo_real ? `RD$ ${Number(r.costo_real).toFixed(2)}` : r.costo_estimado ? `RD$ ${Number(r.costo_estimado).toFixed(2)}` : '—',
        ])
        doc.autoTable({ head: headers, body: rows, startY: y, theme: 'grid', headStyles: { fillColor: [220, 53, 69] } })
      } else if (tipo === 'comodatos') {
        const filteredComs = coms.filter(c => c.estado === 'activo')
        const headers = [['Activo', 'Alumno', 'Entrega', 'Vencimiento', 'Tipo']]
        const rows = filteredComs.map(c => [
          c.activo_id || '',
          c.alumno_nombre || '',
          new Date(c.fecha_entrega).toLocaleDateString('es-DO'),
          c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-DO') : '',
          c.tipo_comodato || '',
        ])
        doc.autoTable({ head: headers, body: rows, startY: y, theme: 'grid', headStyles: { fillColor: [13, 110, 253] } })
      } else if (tipo === 'resumen') {
        const resumen = resumirInventario({ activos: filtered, comodatos: coms, reparaciones: reps })
        const resumenData = [
          ['Total', String(resumen.total)],
          ['Disponibles', String(resumen.disponibles)],
          ['En uso', String(resumen.en_uso)],
          ['En reparación', String(resumen.en_reparacion)],
          ['Ociosos', String(resumen.ociosos)],
          ['De baja', String(resumen.de_baja)],
          ['Valor total', `RD$ ${(resumen.valor_total || 0).toFixed(2)}`],
        ]
        doc.autoTable({ head: [['Métrica', 'Valor']], body: resumenData, startY: y, theme: 'grid', headStyles: { fillColor: [13, 110, 253] } })
        y = doc.lastAutoTable.finalY + 8
        const porTipo = activosPorTipo(filtered)
        const tipoData = Object.entries(porTipo).map(([t, c]) => [t, String(c)])
        doc.text('Distribución por tipo', 14, y)
        doc.autoTable({ head: [['Tipo', 'Cantidad']], body: tipoData, startY: y + 3, theme: 'grid', headStyles: { fillColor: [111, 66, 193] } })
      } else {
        doc.text('Reporte seleccionado no disponible para PDF directo.', 14, y)
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' })
        doc.text('SOI - Sistema de Orquesta Infantil', 14, doc.internal.pageSize.getHeight() - 10)
      }

      doc.save(`reporte_inventario_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (e) {
      alert('Error al generar PDF: ' + e.message)
    }
  }

  function bindEvents() {
    container.querySelector('#report-tabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tipo]')
      if (!btn) return
      container.querySelectorAll('#report-tabs .nav-link').forEach(el => el.classList.remove('active'))
      btn.classList.add('active')
      currentTipo = btn.dataset.tipo
      updatePreview()
    }, { signal: _ac.signal })

    container.querySelector('#report-filter-form')?.addEventListener('submit', (e) => {
      e.preventDefault()
      updatePreview()
    }, { signal: _ac.signal })

    container.querySelector('#btn-generar-reporte')?.addEventListener('click', () => {
      updatePreview()
    }, { signal: _ac.signal })

    container.querySelector('#btn-exportar-pdf')?.addEventListener('click', () => {
      const filtros = getFilters()
      generatePDF(currentTipo, currentData, filtros)
    }, { signal: _ac.signal })
  }

  function getFilters() {
    const form = container.querySelector('#report-filter-form')
    if (!form) return {}
    const fd = new FormData(form)
    const filtros = {}
    for (const [k, v] of fd.entries()) {
      if (v) filtros[k] = v
    }
    return filtros
  }

  function updatePreview() {
    const filtros = getFilters()
    const preview = container.querySelector('#preview-table')
    if (preview) {
      preview.innerHTML = renderPreview(currentTipo, currentData, filtros)
    }
  }

  return { teardown: () => _ac.abort() }
}
