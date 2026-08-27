/**
 * luteriaView.js — Banco de Diagnósticos y Triaje Técnico del Taller de Lutería.
 * Formateado bajo la Plantilla V2:
 * - Header & Toolbar Unificada V2 con KPI badges en tiempo real.
 * - Buscador permanente exterior y panel colapsable de filtros ('Filtros' + 'Limpiar').
 * - Grid responsive multi-columna (col-12 col-md-6 col-xl-4).
 * - Soporte Dark / Light mode con tokens de Bootstrap 5.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { updateActivoEstado } from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { openLuteriaOrdenWizard } from '../components/luteriaOrdenWizard.js'
import { openDiagnosticoWizard } from '../components/luteriaDiagnosticoWizard.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import '../styles/luteria.css'

let _abortController = null

const state = {
  filtrosAbiertos: false,
  filtroEstado: 'en_taller',
  filtroFamilia: 'todas',
  filtroConservacion: 'todos',
  busqueda: '',
}

const ESTADO_USO_A_LABEL = {
  disponible:       { label: 'Disponible',       badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
  en_mantenimiento: { label: 'En mantenimiento', badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
  en_reparacion:   { label: 'En reparación',    badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle' },
  prestado:         { label: 'Asignado a Alumno', badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle' },
  de_baja:          { label: 'Fuera de uso',     badgeClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle' },
}

const FAMILIAS_INSTRUMENTOS = [
  { id: 'todas', label: 'Todas las Familias' },
  { id: 'cuerda', label: 'Cuerdas (Violín, Cello, Viola, Contrabajo)' },
  { id: 'madera', label: 'Viento Madera (Flauta, Clarinete, Oboe)' },
  { id: 'metal', label: 'Viento Metal (Trompeta, Trombón, Corno)' },
  { id: 'percusion', label: 'Percusión' },
]

export async function renderLuteriaView(container) {
  if (!container) return

  _abortController?.abort()
  _abortController = new AbortController()

  container.innerHTML = _renderSkeleton()

  try {
    const { data, error } = await supabase
      .from('inventario_activos')
      .select('id, codigo_inventario, tipo_instrumento, marca, modelo, numero_serie, estado_uso, estado_conservacion, notas, foto_url, activo')
      .in('estado_uso', ['en_mantenimiento', 'en_reparacion', 'disponible', 'de_baja'])
      .eq('activo', true)
      .order('estado_uso', { ascending: false })

    if (error) throw error
    const activos = data || []

    _renderUI(container, activos)
    _attachEvents(container, activos)
    attachViewInfoEvents(container)
  } catch (err) {
    console.error('[LuteriaView] Error:', err)
    container.innerHTML = `
      <div class="container-fluid p-4">
        <div class="alert alert-danger shadow-sm rounded-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar banco de diagnósticos: ${escapeHTML(err.message)}
        </div>
      </div>
    `
  }
}

function _renderSkeleton() {
  return `
    <div class="container-fluid p-3 p-md-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="spinner-border spinner-border-sm text-primary me-2"></div>
          <span class="text-muted fw-semibold">Cargando instrumentos en banco técnico...</span>
        </div>
      </div>
    </div>
  `
}

function _exportarCSV(activos) {
  if (!activos || activos.length === 0) {
    AppToast.show('No hay instrumentos para exportar', 'warning')
    return
  }
  const headers = ['Código', 'Instrumento', 'Marca', 'Modelo', 'Serie', 'Estado de Uso', 'Conservación', 'Notas']
  const rows = activos.map(a => [
    a.codigo_inventario || '',
    `"${(a.tipo_instrumento || '').replace(/"/g, '""')}"`,
    `"${(a.marca || '').replace(/"/g, '""')}"`,
    `"${(a.modelo || '').replace(/"/g, '""')}"`,
    a.numero_serie || '',
    a.estado_uso || '',
    a.estado_conservacion || '',
    `"${(a.notas || '').replace(/"/g, '""')}"`,
  ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inventario_triaje_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  AppToast.show('Exportación CSV completada', 'success')
}

function _renderUI(container, activos) {
  const total = activos.length
  const enMantenimiento = activos.filter(a => a.estado_uso === 'en_mantenimiento').length
  const enReparacion = activos.filter(a => a.estado_uso === 'en_reparacion').length
  const disponibles = activos.filter(a => a.estado_uso === 'disponible').length
  const fueraUso = activos.filter(a => a.estado_uso === 'de_baja').length
  const enTallerTotal = enMantenimiento + enReparacion

  const activosFiltrosCount = [
    state.filtroEstado !== 'todos',
    state.filtroFamilia !== 'todas',
    state.filtroConservacion !== 'todos',
  ].filter(Boolean).length

  container.innerHTML = `
    <div class="page-container" style="max-width: 1300px;">
      
      <!-- Header & Toolbar Unificada V2 -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center">
              <i class="bi bi-wrench-adjustable fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Banco de Diagnósticos & Triaje</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Evaluación de estado físico, calibración acústica y órdenes de reparación</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-tools me-1"></i><span>${enTallerTotal}</span> En Taller
              </span>
              <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-exclamation-triangle-fill me-1"></i><span>${enReparacion}</span> En Reparación
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-check-circle-fill me-1"></i><span>${disponibles}/${total}</span> Disponibles
              </span>
              ${fueraUso > 0 ? `
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                  <i class="bi bi-dash-circle me-1"></i><span>${fueraUso}</span> Fuera de Uso
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Toolbar de Botones -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            ${renderViewInfoButton('luteria-diagnosticos')}
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-exportar-csv" title="Exportar CSV" style="font-size:0.78rem;">
              <i class="bi bi-file-earmark-spreadsheet"></i>
              <span class="d-none d-sm-inline">CSV</span>
            </button>
            <button class="btn btn-sm btn-warning d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-bold shadow-xs text-dark" id="btn-nuevo-diagnostico" style="font-size:0.78rem;">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Nueva Orden de Taller</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Búsqueda Exterior Permanente y Botón Toggle Filtros -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
          <div class="flex-grow-1" style="min-width: 260px;">
            <div class="input-group input-group-sm rounded-3 overflow-hidden shadow-xs border border-body-tertiary">
              <span class="input-group-text bg-body-tertiary border-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control border-0 py-1.5 bg-body text-body" id="filtro-buscar-diagnostico" placeholder="Buscar por código, tipo de instrumento, marca o serie..." value="${escapeHTML(state.busqueda || '')}" autocomplete="off" style="font-size:0.8rem;">
              ${state.busqueda ? `<button class="btn btn-sm bg-body text-muted border-0" id="btnLimpiarBuscarDiagnostico"><i class="bi bi-x"></i></button>` : ''}
            </div>
          </div>

          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            <!-- Botón Desplegable de Filtros -->
            <button class="btn btn-sm ${state.filtrosAbiertos || activosFiltrosCount > 0 ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosDiagnostico" type="button" style="font-size:0.78rem;">
              <i class="bi bi-funnel"></i>
              <span>Filtros</span>
              ${activosFiltrosCount > 0 ? `<span class="badge bg-white text-primary rounded-pill px-1.5 ms-1" style="font-size:0.68rem;">${activosFiltrosCount}</span>` : ''}
            </button>

            <!-- Botón Limpiar Filtros -->
            <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosDiagnostico" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>Limpiar</span>
            </button>

            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-refresh-diagnosticos" title="Refrescar">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        <!-- Fila 3: Panel Colapsable de Filtros -->
        <div class="collapse ${state.filtrosAbiertos ? 'show' : ''} pt-2.5" id="panelFiltrosDiagnostico">
          <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
            <div class="row g-2 align-items-center">
              
              <div class="col-12 col-sm-6 col-lg-4">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado Operativo</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtro-estado-uso" style="font-size:0.8rem;">
                  <option value="todos" ${state.filtroEstado === 'todos' ? 'selected' : ''}>Todos los estados</option>
                  <option value="en_taller" ${state.filtroEstado === 'en_taller' ? 'selected' : ''}>🛠️ En Taller (Mantenimiento / Reparación)</option>
                  <option value="en_mantenimiento" ${state.filtroEstado === 'en_mantenimiento' ? 'selected' : ''}>⏳ Solo En Mantenimiento</option>
                  <option value="en_reparacion" ${state.filtroEstado === 'en_reparacion' ? 'selected' : ''}>🔧 Solo En Reparación</option>
                  <option value="disponible" ${state.filtroEstado === 'disponible' ? 'selected' : ''}>✅ Disponibles</option>
                  <option value="de_baja" ${state.filtroEstado === 'de_baja' ? 'selected' : ''}>🚫 Fuera de Uso</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-4">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Familia de Instrumento</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtro-familia-instrumento" style="font-size:0.8rem;">
                  ${FAMILIAS_INSTRUMENTOS.map(f => `
                    <option value="${f.id}" ${state.filtroFamilia === f.id ? 'selected' : ''}>${f.label}</option>
                  `).join('')}
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-4">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Estado de Conservación</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtro-conservacion" style="font-size:0.8rem;">
                  <option value="todos" ${state.filtroConservacion === 'todos' ? 'selected' : ''}>Cualquier condición</option>
                  <option value="excelente" ${state.filtroConservacion === 'excelente' ? 'selected' : ''}>Excelente</option>
                  <option value="bueno" ${state.filtroConservacion === 'bueno' ? 'selected' : ''}>Bueno</option>
                  <option value="regular" ${state.filtroConservacion === 'regular' ? 'selected' : ''}>Regular</option>
                  <option value="malo" ${state.filtroConservacion === 'malo' ? 'selected' : ''}>Malo</option>
                </select>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- GRID DE INSTRUMENTOS EN 2 O 3 COLUMNAS -->
      <div class="row g-3" id="grid-instrumentos-diagnostico">
        ${_renderInstrumentCards(activos)}
      </div>

    </div>
  `
}

function _renderInstrumentCards(activos) {
  if (activos.length === 0) {
    return `
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-body text-muted">
          <i class="bi bi-check2-circle text-success fs-1 d-block mb-2"></i>
          <h6 class="fw-bold mb-1 text-body">No hay instrumentos en taller</h6>
          <p class="small mb-0">Todos los instrumentos están calibrados y disponibles para la orquesta.</p>
        </div>
      </div>
    `
  }

  return activos.map(a => {
    const estadoMeta = ESTADO_USO_A_LABEL[a.estado_uso] || { label: a.estado_uso, badgeClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle' }
    const enTaller = ['en_mantenimiento', 'en_reparacion'].includes(a.estado_uso)

    return `
      <div class="col-12 col-md-6 col-xl-4 d-flex card-diagnostico-item" 
           data-search="${escapeHTML([a.codigo_inventario, a.tipo_instrumento, a.marca, a.modelo, a.numero_serie, a.notas].filter(Boolean).join(' ').toLowerCase())}"
           data-estado="${escapeHTML(a.estado_uso || '')}"
           data-conservacion="${escapeHTML(a.estado_conservacion || '')}"
           data-en-taller="${enTaller ? '1' : '0'}">
        <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-body d-flex flex-column w-100">
          
          <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
            <div>
              <h6 class="fw-bold text-body mb-0" style="font-size:0.92rem;">${escapeHTML(a.modelo || a.tipo_instrumento || 'Instrumento')}</h6>
              <div class="text-muted small" style="font-size:0.75rem;">
                <span><i class="bi bi-tag me-1"></i>${escapeHTML(a.codigo_inventario)}</span>
                ${a.marca ? ` · <span>${escapeHTML(a.marca)}</span>` : ''}
              </div>
            </div>
            <span class="badge rounded-pill px-2.5 py-1 fw-bold ${estadoMeta.badgeClass}" style="font-size:0.7rem;">
              ${estadoMeta.label}
            </span>
          </div>

          ${a.numero_serie ? `<div class="text-muted small mb-2" style="font-size:0.72rem;"><i class="bi bi-upc me-1"></i>Serie: <strong>${escapeHTML(a.numero_serie)}</strong></div>` : ''}
          ${a.notas ? `<div class="p-2 rounded-3 bg-body-tertiary small text-secondary mb-3" style="font-size:0.75rem;"><i class="bi bi-chat-left-text me-1"></i>${escapeHTML(a.notas)}</div>` : ''}

          <!-- ACCIONES DE CAMBIO DE ESTADO Y CREACIÓN DE ORDEN -->
          <div class="mt-auto pt-2.5 border-top border-body-tertiary d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div class="btn-group btn-group-sm rounded-3 overflow-hidden shadow-2xs">
              <button class="btn btn-outline-success btn-cambiar-estado-activo px-2.5 py-1" data-id="${a.id}" data-estado="disponible" title="Marcar como Disponible">
                <i class="bi bi-check-lg me-1"></i>Listo
              </button>
              <button class="btn btn-outline-warning text-dark btn-cambiar-estado-activo px-2.5 py-1" data-id="${a.id}" data-estado="en_mantenimiento" title="Poner en Mantenimiento">
                <i class="bi bi-wrench me-1"></i>Taller
              </button>
            </div>

            <button class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 rounded-3 px-3 py-1 fw-semibold btn-crear-orden-activo shadow-xs" data-id="${a.id}" data-serie="${escapeHTML(a.numero_serie || a.codigo_inventario)}" style="font-size:0.75rem;">
              <i class="bi bi-clipboard-plus"></i>
              <span>Crear Orden</span>
            </button>
          </div>

        </div>
      </div>
    `
  }).join('')
}

function _attachEvents(container, activos) {
  const signal = _abortController.signal

  container.querySelector('#btn-refresh-diagnosticos')?.addEventListener('click', () => {
    renderLuteriaView(container)
  }, { signal })

  container.querySelector('#btn-exportar-csv')?.addEventListener('click', () => {
    _exportarCSV(activos)
  }, { signal })

  container.querySelector('#btn-nuevo-diagnostico')?.addEventListener('click', async () => {
    await openLuteriaOrdenWizard({
      onSuccess: () => renderLuteriaView(container)
    })
  }, { signal })

  // Toggle Panel Filtros
  container.querySelector('#btnToggleFiltrosDiagnostico')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    const panel = container.querySelector('#panelFiltrosDiagnostico')
    panel?.classList.toggle('show', state.filtrosAbiertos)
    container.querySelector('#btnToggleFiltrosDiagnostico')?.classList.toggle('btn-primary', state.filtrosAbiertos)
    container.querySelector('#btnToggleFiltrosDiagnostico')?.classList.toggle('btn-outline-secondary', !state.filtrosAbiertos)
  }, { signal })

  // Limpiar filtros
  container.querySelector('#btnLimpiarFiltrosDiagnostico')?.addEventListener('click', () => {
    state.busqueda = ''
    state.filtroEstado = 'en_taller'
    state.filtroFamilia = 'todas'
    state.filtroConservacion = 'todos'
    renderLuteriaView(container)
  }, { signal })

  // Filtros dinámicos reactivos
  const searchInput = container.querySelector('#filtro-buscar-diagnostico')
  const estadoSelect = container.querySelector('#filtro-estado-uso')
  const conservacionSelect = container.querySelector('#filtro-conservacion')

  const aplicarFiltros = () => {
    const q = (searchInput?.value || '').trim().toLowerCase()
    const est = estadoSelect?.value || 'en_taller'
    const cons = conservacionSelect?.value || 'todos'

    state.busqueda = searchInput?.value || ''
    state.filtroEstado = est
    state.filtroConservacion = cons

    container.querySelectorAll('.card-diagnostico-item').forEach(card => {
      const matchSearch = !q || card.dataset.search.includes(q)
      let matchEstado = true
      let matchCons = true

      if (est === 'en_taller') {
        matchEstado = card.dataset.enTaller === '1'
      } else if (est && est !== 'todos') {
        matchEstado = card.dataset.estado === est
      }

      if (cons && cons !== 'todos') {
        matchCons = card.dataset.conservacion === cons
      }

      card.style.display = (matchSearch && matchEstado && matchCons) ? '' : 'none'
    })
  }

  aplicarFiltros()

  searchInput?.addEventListener('input', aplicarFiltros, { signal })
  container.querySelector('#btnLimpiarBuscarDiagnostico')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = ''
    aplicarFiltros()
  }, { signal })

  estadoSelect?.addEventListener('change', aplicarFiltros, { signal })
  conservacionSelect?.addEventListener('change', aplicarFiltros, { signal })

  // Cambiar estado rápido de activo
  container.querySelectorAll('.btn-cambiar-estado-activo').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      const nuevoEstado = btn.dataset.estado
      btn.disabled = true
      try {
        await updateActivoEstado(id, { estado_uso: nuevoEstado })
        AppToast.show('Estado del instrumento actualizado', 'success')
        renderLuteriaView(container)
      } catch (err) {
        btn.disabled = false
        AppToast.error(`Error al actualizar estado: ${err.message}`)
      }
    }, { signal })
  })

  // Crear orden para este activo
  container.querySelectorAll('.btn-crear-orden-activo').forEach(btn => {
    btn.addEventListener('click', async () => {
      await openLuteriaOrdenWizard({
        instrumentoId: btn.dataset.serie,
        onSuccess: () => renderLuteriaView(container),
      })
    }, { signal })
  })
}