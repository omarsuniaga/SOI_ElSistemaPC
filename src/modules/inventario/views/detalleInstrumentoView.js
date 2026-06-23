import {
  obtenerActivoPorId,
  obtenerHistorialActivo,
  obtenerAccesorios,
  obtenerReparaciones,
  obtenerComodatosActivos,
  cambiarEstadoActivo,
} from '../api/inventarioApi.js'
import {
  badgeEstadoConservacion,
  badgeEstadoUso,
  calcularAntiguedad,
  puedeDarseDeBaja,
  motivoNoBaja,
  calcularValorDepreciado,
} from '../domain/activo.js'
import { lineTime } from '../domain/historial.js'
import { estadoVencimiento } from '../domain/comodato.js'

export async function renderDetalleInstrumentoView(container, { activoId }) {
  const _ac = new AbortController()

  container.innerHTML = '<p class="p-4">Cargando detalle del instrumento...</p>'

  const [activoResult, historialResult, accesoriosResult, reparacionesResult, comodatosResult] =
    await Promise.all([
      obtenerActivoPorId(activoId),
      obtenerHistorialActivo(activoId),
      obtenerAccesorios(activoId),
      obtenerReparaciones({ activo_id: activoId }),
      obtenerComodatosActivos(),
    ])

  if (activoResult.error) {
    container.innerHTML = `<div class="alert alert-danger m-4">Error: ${activoResult.error.message}</div>`
    return { teardown: () => _ac.abort() }
  }

  const activo = activoResult.data
  const historial = historialResult.data || []
  const accesorios = accesoriosResult.data || []
  const reparaciones = reparacionesResult.data || []
  const comodatos = (comodatosResult.data || []).filter(c => c.activo_id === activoId)

  const antiguedad = calcularAntiguedad(activo)
  const valorDepreciado = calcularValorDepreciado(activo)
  const puedeBaja = puedeDarseDeBaja(activo)
  const motivoBaja = motivoNoBaja(activo)

  const timeline = lineTime(historial)

  const comodatoActivo = comodatos.find(c => c.estado === 'activo')

  // Tab content by section
  const generalHtml = () => `
    <div class="row g-3">
      <div class="col-md-6">
        <table class="table table-sm table-borderless">
          <tr><th class="text-muted ps-0">Código</th><td class="fw-semibold font-monospace">${activo.codigo_inventario}</td></tr>
          <tr><th class="text-muted ps-0">Tipo</th><td>${activo.tipo_instrumento}</td></tr>
          <tr><th class="text-muted ps-0">Marca</th><td>${activo.marca || '—'}</td></tr>
          <tr><th class="text-muted ps-0">Modelo</th><td>${activo.modelo || '—'}</td></tr>
          <tr><th class="text-muted ps-0">N° Serie</th><td class="font-monospace">${activo.numero_serie || '—'}</td></tr>
          <tr><th class="text-muted ps-0">Ubicación</th><td>${activo.ubicacion || '—'}</td></tr>
          <tr><th class="text-muted ps-0">Estado conservación</th><td><span class="${badgeEstadoConservacion(activo.estado_conservacion)}">${activo.estado_conservacion}</span></td></tr>
          <tr><th class="text-muted ps-0">Estado uso</th><td><span class="${badgeEstadoUso(activo.estado_uso)}">${activo.estado_uso}</span></td></tr>
        </table>
      </div>
      <div class="col-md-6">
        <table class="table table-sm table-borderless">
          <tr><th class="text-muted ps-0">Fecha adquisición</th><td>${activo.fecha_adquisicion ? new Date(activo.fecha_adquisicion).toLocaleDateString('es-DO') : '—'}</td></tr>
          <tr><th class="text-muted ps-0">Valor adquisición</th><td>${activo.valor_adquisicion ? `RD$ ${Number(activo.valor_adquisicion).toLocaleString('es-DO')}` : '—'}</td></tr>
          <tr><th class="text-muted ps-0">Valor depreciado</th><td>${valorDepreciado !== null ? `RD$ ${valorDepreciado.toLocaleString('es-DO')}` : '—'}</td></tr>
          <tr><th class="text-muted ps-0">Antigüedad</th><td>${antiguedad !== null ? `${antiguedad} años` : '—'}</td></tr>
          <tr><th class="text-muted ps-0">Proveedor</th><td>${activo.proveedor || '—'}</td></tr>
          <tr><th class="text-muted ps-0">Activo</th><td>${activo.activo !== false ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-danger">No</span>'}</td></tr>
          ${activo.fecha_baja ? `<tr><th class="text-muted ps-0">Fecha baja</th><td>${new Date(activo.fecha_baja).toLocaleDateString('es-DO')}</td></tr>` : ''}
          ${activo.motivo_baja ? `<tr><th class="text-muted ps-0">Motivo baja</th><td>${activo.motivo_baja}</td></tr>` : ''}
        </table>
      </div>
    </div>
    ${activo.notas ? `<div class="alert alert-secondary mt-2"><strong>Notas:</strong> ${activo.notas}</div>` : ''}
    ${activo.foto_url ? `<div class="mt-2"><img src="${activo.foto_url}" alt="Foto" class="img-fluid rounded" style="max-height:200px"></div>` : ''}
  `

  const comodatoHtml = () => {
    if (!comodatoActivo) {
      return '<p class="text-muted py-3">Sin comodato activo para este instrumento.</p>'
    }
    const venc = estadoVencimiento(comodatoActivo)
    return `
      <table class="table table-sm table-borderless">
        <tr><th class="text-muted ps-0">Alumno</th><td>${comodatoActivo.alumno_nombre || '—'}</td></tr>
        <tr><th class="text-muted ps-0">Fecha entrega</th><td>${new Date(comodatoActivo.fecha_entrega).toLocaleDateString('es-DO')}</td></tr>
        <tr><th class="text-muted ps-0">Tipo</th><td>${comodatoActivo.tipo_comodato || '—'}</td></tr>
        <tr><th class="text-muted ps-0">Estado</th><td><span class="${venc.clase}">${venc.label}</span></td></tr>
        ${comodatoActivo.observaciones ? `<tr><th class="text-muted ps-0">Observaciones</th><td>${comodatoActivo.observaciones}</td></tr>` : ''}
      </table>
    `
  }

  const historialHtml = () => {
    if (timeline.length === 0) {
      return '<p class="text-muted py-3">Sin eventos registrados.</p>'
    }
    return timeline.map(evt => `
      <div class="d-flex gap-3 mb-3">
        <div class="text-center" style="width:40px">
          <i class="bi ${evt.icono} fs-4 text-muted"></i>
        </div>
        <div class="flex-grow-1">
          <p class="mb-0 fw-semibold">${evt.tipo_label}</p>
          <small class="text-muted">${evt.descripcion}</small>
          <br><small class="text-muted">${evt.fecha_legible}</small>
        </div>
      </div>
    `).join('')
  }

  const accesoriosHtml = () => {
    if (accesorios.length === 0) {
      return '<p class="text-muted py-3">Sin accesorios asignados.</p>'
    }
    return `
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Tipo</th><th>Marca</th><th>Cantidad</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${accesorios.map(a => `
            <tr>
              <td>${a.tipo}</td>
              <td>${a.marca || '—'}</td>
              <td>${a.cantidad}</td>
              <td>${a.estado || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  const reparacionesHtml = () => {
    if (reparaciones.length === 0) {
      return '<p class="text-muted py-3">Sin reparaciones registradas.</p>'
    }
    const estadoBadge = (est) => ({
      recibido: 'badge bg-secondary',
      en_reparacion: 'badge bg-warning text-dark',
      finalizado: 'badge bg-info text-dark',
      entregado: 'badge bg-success',
    }[est] || 'badge bg-secondary')
    return `
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Descripción</th><th>Tallerista</th><th>Estado</th><th>Ingreso</th><th>Costo</th></tr>
        </thead>
        <tbody>
          ${reparaciones.map(r => `
            <tr>
              <td>${r.descripcion ? r.descripcion.substring(0, 50) : '—'}</td>
              <td>${r.tallerista_nombre || '—'}</td>
              <td><span class="${estadoBadge(r.estado)}">${r.estado}</span></td>
              <td>${new Date(r.fecha_ingreso).toLocaleDateString('es-DO')}</td>
              <td>${r.costo_real ? `RD$ ${Number(r.costo_real).toLocaleString('es-DO')}` : r.costo_estimado ? `RD$ ${Number(r.costo_estimado).toLocaleString('es-DO')} (est.)` : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  container.innerHTML = `
    <div class="container-fluid p-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#" id="breadcrumb-inventario">Inventario</a></li>
          <li class="breadcrumb-item active" aria-current="page">${activo.codigo_inventario}</li>
        </ol>
      </nav>

      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 class="mb-1">
            <i class="bi bi-music-note me-2"></i>${activo.tipo_instrumento}
            <span class="detail-badge ms-2">${badgeEstadoUso(activo.estado_uso)}</span>
            <span class="detail-badge ms-1">${badgeEstadoConservacion(activo.estado_conservacion)}</span>
          </h4>
          <p class="text-muted mb-0 font-monospace small">${activo.codigo_inventario}</p>
        </div>
        <div class="btn-group">
          <button id="btn-editar-activo" class="btn btn-outline-primary btn-sm" data-id="${activo.id}">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
          <button id="btn-comodato-activo" class="btn btn-outline-info btn-sm" data-id="${activo.id}">
            <i class="bi bi-clipboard-check me-1"></i>Comodato
          </button>
          <button id="btn-reparar-activo" class="btn btn-outline-warning btn-sm" data-id="${activo.id}">
            <i class="bi bi-tools me-1"></i>Reparar
          </button>
          <button id="btn-baja-activo" class="btn btn-outline-danger btn-sm" data-id="${activo.id}"
            ${!puedeBaja ? 'disabled' : ''}
            title="${motivoBaja || 'Dar de baja'}">
            <i class="bi bi-trash me-1"></i>Baja
          </button>
        </div>
      </div>

      <ul class="nav nav-tabs mb-3" id="detail-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="tab-general-tab" data-bs-toggle="tab" data-bs-target="#tab-general" type="button">General</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-comodato-tab" data-bs-toggle="tab" data-bs-target="#tab-comodato" type="button">Comodato</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-historial-tab" data-bs-toggle="tab" data-bs-target="#tab-historial" type="button">Historial</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-accesorios-tab" data-bs-toggle="tab" data-bs-target="#tab-accesorios" type="button">Accesorios</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-reparaciones-tab" data-bs-toggle="tab" data-bs-target="#tab-reparaciones" type="button">Reparaciones</button>
        </li>
      </ul>

      <div class="tab-content" id="detail-tab-content">
        <div class="tab-pane fade show active" id="tab-general">${generalHtml()}</div>
        <div class="tab-pane fade" id="tab-comodato">${comodatoHtml()}</div>
        <div class="tab-pane fade" id="tab-historial">${historialHtml()}</div>
        <div class="tab-pane fade" id="tab-accesorios">${accesoriosHtml()}</div>
        <div class="tab-pane fade" id="tab-reparaciones">${reparacionesHtml()}</div>
      </div>
    </div>
  `

  container.querySelector('#breadcrumb-inventario')?.addEventListener('click', (e) => {
    e.preventDefault()
    if (window.router) window.router.navigate('inventario-stock')
  }, { signal: _ac.signal })

  container.querySelector('#btn-editar-activo')?.addEventListener('click', () => {
    if (window.router) window.router.navigate('inventario-stock', { editId: activo.id })
  }, { signal: _ac.signal })

  container.querySelector('#btn-comodato-activo')?.addEventListener('click', () => {
    if (window.router) window.router.navigate('inventario-comodatos', { activoId: activo.id })
  }, { signal: _ac.signal })

  container.querySelector('#btn-reparar-activo')?.addEventListener('click', () => {
    if (window.router) window.router.navigate('inventario-stock')
  }, { signal: _ac.signal })

  container.querySelector('#btn-baja-activo')?.addEventListener('click', async () => {
    if (!puedeBaja) return
    if (!confirm(`¿Dar de baja el instrumento ${activo.codigo_inventario}?`)) return
    const { error } = await cambiarEstadoActivo(activo.id, 'de_baja')
    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      renderDetalleInstrumentoView(container, { activoId: activo.id })
    }
  }, { signal: _ac.signal })

  return { teardown: () => _ac.abort() }
}
