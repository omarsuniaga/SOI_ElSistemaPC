/**
 * luteriaInsumosView.js — Gestión de Stock de Repuestos & Insumos del Taller de Lutería.
 * Formateado bajo la Plantilla V2:
 * - Header & Toolbar Unificada V2 con KPI badges en tiempo real.
 * - Buscador permanente exterior y panel colapsable de filtros ('Filtros' + 'Limpiar').
 * - Modal de ajuste rápido de stock y registro de consumibles.
 * - Exportación CSV y soporte Dark / Light mode con tokens de Bootstrap 5.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { getInsumos, ajustarStock } from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import '../styles/luteria.css'

let _abortController = null

const state = {
  filtrosAbiertos: false,
  filtroCategoria: '',
  filtroSoloStockBajo: false,
  criterioOrden: 'nombre',
  busqueda: '',
}

export async function renderLuteriaInsumosView(container) {
  if (!container) return

  _abortController?.abort()
  _abortController = new AbortController()

  container.innerHTML = _renderSkeleton()

  try {
    const insumos = await getInsumos()
    _renderUI(container, insumos)
    _attachEvents(container, insumos)
    attachViewInfoEvents(container)
  } catch (err) {
    console.error('[LuteriaInsumos] Error:', err)
    container.innerHTML = `
      <div class="container-fluid p-4">
        <div class="alert alert-danger shadow-sm rounded-4">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar insumos de lutería: ${escapeHTML(err.message)}
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
          <span class="text-muted fw-semibold">Cargando inventario de repuestos y consumibles...</span>
        </div>
      </div>
    </div>
  `
}

function _exportarCSV(insumos) {
  if (!insumos || insumos.length === 0) {
    AppToast.show('No hay insumos para exportar', 'warning')
    return
  }
  const headers = ['Código', 'Nombre', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Costo Unitario', 'Unidad Medida']
  const rows = insumos.map(i => [
    i.codigo || '',
    `"${(i.nombre || '').replace(/"/g, '""')}"`,
    `"${(i.categoria || '').replace(/"/g, '""')}"`,
    i.stock_actual || 0,
    i.stock_minimo || 0,
    i.costo_unitario || 0,
    i.unidad_medida || 'unidad',
  ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `almacen_insumos_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  AppToast.show('Exportación CSV completada', 'success')
}

function _renderUI(container, insumos) {
  const totalInsumos = insumos.length
  const stockBajoCount = insumos.filter(i => Number(i.stock_actual) <= Number(i.stock_minimo)).length
  const valorTotal = insumos.reduce((sum, i) => sum + ((Number(i.stock_actual) || 0) * (Number(i.costo_unitario) || 0)), 0)
  const categorias = [...new Set(insumos.map(i => i.categoria).filter(Boolean))]

  const activosFiltrosCount = [
    state.filtroCategoria !== '',
    state.filtroSoloStockBajo,
    state.criterioOrden !== 'nombre',
  ].filter(Boolean).length

  container.innerHTML = `
    <div class="page-container" style="max-width: 1300px;">
      
      <!-- Header & Toolbar Unificada V2 -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Badges Informativos y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-box-seam fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Almacén de Insumos & Repuestos</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Control de inventario técnico, cuerdas, puentes, zapatillas y consumibles</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-boxes me-1"></i><span>${totalInsumos}</span> Artículos
              </span>
              ${stockBajoCount > 0 ? `
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i><span>${stockBajoCount}</span> Stock Crítico
                </span>
              ` : `
                <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                  <i class="bi bi-check2-circle me-1"></i>Stock Óptimo
                </span>
              `}
              <span class="badge bg-body-secondary text-body border py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;">
                <i class="bi bi-currency-dollar me-0.5"></i>Valoración: <strong>$${valorTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
            </div>
          </div>

          <!-- Toolbar de Botones -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            ${renderViewInfoButton('luteria-insumos')}
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-exportar-csv" title="Exportar CSV" style="font-size:0.78rem;">
              <i class="bi bi-file-earmark-spreadsheet"></i>
              <span class="d-none d-sm-inline">CSV</span>
            </button>
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-refresh-insumos" title="Refrescar">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btn-nuevo-insumo" style="font-size:0.78rem;">
              <i class="bi bi-plus-lg"></i>
              <span>Nuevo Insumo</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Búsqueda Exterior Permanente y Botón Toggle Filtros -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.85rem;">
          <div class="flex-grow-1" style="min-width: 260px;">
            <div class="input-group input-group-sm rounded-3 overflow-hidden shadow-xs border border-body-tertiary">
              <span class="input-group-text bg-body-tertiary border-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control border-0 py-1.5 bg-body text-body" id="filtro-buscar-insumo" placeholder="Buscar por nombre, código o especificación técnica..." value="${escapeHTML(state.busqueda || '')}" autocomplete="off" style="font-size:0.8rem;">
              ${state.busqueda ? `<button class="btn btn-sm bg-body text-muted border-0" id="btnLimpiarBuscarInsumo"><i class="bi bi-x"></i></button>` : ''}
            </div>
          </div>

          <div class="d-flex align-items-center flex-wrap" style="gap: 0.85rem;">
            <!-- Botón Desplegable de Filtros -->
            <button class="btn btn-sm ${state.filtrosAbiertos || activosFiltrosCount > 0 ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosInsumos" type="button" style="font-size:0.78rem;">
              <i class="bi bi-funnel"></i>
              <span>Filtros</span>
              ${activosFiltrosCount > 0 ? `<span class="badge bg-white text-primary rounded-pill px-1.5 ms-1" style="font-size:0.68rem;">${activosFiltrosCount}</span>` : ''}
            </button>

            <!-- Botón Limpiar Filtros -->
            <button class="btn btn-sm btn-outline-secondary rounded-3 shadow-xs px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1" id="btnLimpiarFiltrosInsumos" title="Restablecer filtros y búsqueda" style="font-size:0.78rem;">
              <i class="bi bi-arrow-counterclockwise"></i>
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        <!-- Fila 3: Panel Colapsable de Filtros -->
        <div class="collapse ${state.filtrosAbiertos ? 'show' : ''} pt-2.5" id="panelFiltrosInsumos">
          <div class="p-3 rounded-4 bg-body-tertiary border border-body-tertiary shadow-xs">
            <div class="row g-2 align-items-center">
              
              <div class="col-12 col-sm-6 col-lg-4">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Categoría de Repuesto</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="filtro-categoria-insumo" style="font-size:0.8rem;">
                  <option value="" ${state.filtroCategoria === '' ? 'selected' : ''}>Todas las categorías</option>
                  ${categorias.map(c => `<option value="${escapeHTML(c)}" ${state.filtroCategoria === c ? 'selected' : ''}>${escapeHTML(c)}</option>`).join('')}
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-4">
                <label class="form-label text-muted small fw-semibold mb-1" style="font-size:0.72rem;">Criterio de Orden</label>
                <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="criterio-orden-insumo" style="font-size:0.8rem;">
                  <option value="nombre" ${state.criterioOrden === 'nombre' ? 'selected' : ''}>Nombre Alfabético (A-Z)</option>
                  <option value="stock_asc" ${state.criterioOrden === 'stock_asc' ? 'selected' : ''}>Menor Stock primero (Críticos)</option>
                  <option value="stock_desc" ${state.criterioOrden === 'stock_desc' ? 'selected' : ''}>Mayor Stock primero</option>
                  <option value="valor_desc" ${state.criterioOrden === 'valor_desc' ? 'selected' : ''}>Mayor Costo Unitario</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-lg-4 pt-sm-3">
                <div class="form-check form-switch pt-1">
                  <input class="form-check-input" type="checkbox" id="filtro-solo-stock-bajo" ${state.filtroSoloStockBajo ? 'checked' : ''}>
                  <label class="form-check-label small fw-semibold text-body" for="filtro-solo-stock-bajo">
                    <span class="text-danger fw-bold me-1">●</span>Solo Stock Crítico / Bajo
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- TABLA DE INSUMOS -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="tabla-insumos" style="font-size:0.85rem;">
            <thead class="table-light">
              <tr>
                <th>Código / Nombre</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Costo Unitario</th>
                <th>Estado</th>
                <th class="text-end">Ajustar</th>
              </tr>
            </thead>
            <tbody id="tbody-insumos">
              ${_renderRows(insumos)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
}

function _renderRows(insumos) {
  if (insumos.length === 0) {
    return `
      <tr>
        <td colspan="7" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
          No se encontraron insumos en el almacén
        </td>
      </tr>
    `
  }

  return insumos.map(i => {
    const stockActual = Number(i.stock_actual) || 0
    const stockMinimo = Number(i.stock_minimo) || 0
    const esCritico = stockActual <= stockMinimo
    const costo = Number(i.costo_unitario) || 0

    return `
      <tr class="fila-insumo" 
          data-search="${escapeHTML([i.codigo, i.nombre, i.descripcion, i.categoria].filter(Boolean).join(' ').toLowerCase())}"
          data-categoria="${escapeHTML(i.categoria || '')}"
          data-critico="${esCritico ? '1' : '0'}">
        <td>
          <div class="fw-bold text-body">${escapeHTML(i.nombre)}</div>
          <div class="text-muted small" style="font-size:0.72rem;">
            <i class="bi bi-tag me-0.5"></i>${escapeHTML(i.codigo || '—')}
            ${i.descripcion ? ` · <span>${escapeHTML(i.descripcion)}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="badge bg-body-secondary text-body border" style="font-size:0.72rem;">
            ${escapeHTML(i.categoria || 'General')}
          </span>
        </td>
        <td>
          <span class="fw-bold ${esCritico ? 'text-danger' : 'text-body'}" style="font-size:0.9rem;">
            ${stockActual}
          </span>
          <span class="text-muted small" style="font-size:0.72rem;">${escapeHTML(i.unidad_medida || 'unid')}</span>
        </td>
        <td class="text-muted small">${stockMinimo} ${escapeHTML(i.unidad_medida || 'unid')}</td>
        <td><strong>$${costo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</strong></td>
        <td>
          ${esCritico ? `
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-0.5 fw-bold" style="font-size:0.68rem;">
              <span class="lut-prio-dot dot-critica"></span>Stock Bajo
            </span>
          ` : `
            <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5 fw-bold" style="font-size:0.68rem;">
              <i class="bi bi-check-circle me-1"></i>Normal
            </span>
          `}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-3 px-2.5 py-1 btn-ajustar-stock shadow-2xs" data-id="${i.id}" data-nombre="${escapeHTML(i.nombre)}" data-stock="${stockActual}" style="font-size:0.75rem;">
            <i class="bi bi-sliders"></i>
            <span>Ajustar</span>
          </button>
        </td>
      </tr>
    `
  }).join('')
}

function _attachEvents(container, insumos) {
  const signal = _abortController.signal

  container.querySelector('#btn-refresh-insumos')?.addEventListener('click', () => {
    renderLuteriaInsumosView(container)
  }, { signal })

  container.querySelector('#btn-exportar-csv')?.addEventListener('click', () => {
    _exportarCSV(insumos)
  }, { signal })

  container.querySelector('#btn-nuevo-insumo')?.addEventListener('click', () => {
    _modalNuevoInsumo(container)
  }, { signal })

  // Toggle Panel Filtros
  container.querySelector('#btnToggleFiltrosInsumos')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    const panel = container.querySelector('#panelFiltrosInsumos')
    panel?.classList.toggle('show', state.filtrosAbiertos)
    container.querySelector('#btnToggleFiltrosInsumos')?.classList.toggle('btn-primary', state.filtrosAbiertos)
    container.querySelector('#btnToggleFiltrosInsumos')?.classList.toggle('btn-outline-secondary', !state.filtrosAbiertos)
  }, { signal })

  // Limpiar Filtros
  container.querySelector('#btnLimpiarFiltrosInsumos')?.addEventListener('click', () => {
    state.busqueda = ''
    state.filtroCategoria = ''
    state.filtroSoloStockBajo = false
    state.criterioOrden = 'nombre'
    renderLuteriaInsumosView(container)
  }, { signal })

  // Filtros dinámicos reactivos
  const searchInput = container.querySelector('#filtro-buscar-insumo')
  const catSelect = container.querySelector('#filtro-categoria-insumo')
  const soloStockBajoCheck = container.querySelector('#filtro-solo-stock-bajo')

  const aplicarFiltros = () => {
    const q = (searchInput?.value || '').trim().toLowerCase()
    const cat = catSelect?.value || ''
    const soloCriticos = Boolean(soloStockBajoCheck?.checked)

    state.busqueda = searchInput?.value || ''
    state.filtroCategoria = cat
    state.filtroSoloStockBajo = soloCriticos

    container.querySelectorAll('.fila-insumo').forEach(row => {
      const matchSearch = !q || row.dataset.search.includes(q)
      const matchCat = !cat || row.dataset.categoria === cat
      const matchCritico = !soloCriticos || row.dataset.critico === '1'

      row.style.display = (matchSearch && matchCat && matchCritico) ? '' : 'none'
    })
  }

  aplicarFiltros()

  searchInput?.addEventListener('input', aplicarFiltros, { signal })
  container.querySelector('#btnLimpiarBuscarInsumo')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = ''
    aplicarFiltros()
  }, { signal })

  catSelect?.addEventListener('change', aplicarFiltros, { signal })
  soloStockBajoCheck?.addEventListener('change', aplicarFiltros, { signal })

  // Modal de Ajuste de Stock
  container.querySelectorAll('.btn-ajustar-stock').forEach(btn => {
    btn.addEventListener('click', () => {
      _modalAjusteStock(container, {
        id: btn.dataset.id,
        nombre: btn.dataset.nombre,
        stockActual: Number(btn.dataset.stock) || 0,
      })
    }, { signal })
  })
}

function _modalAjusteStock(container, item) {
  AppModal.open({
    title: `Ajuste de Stock: ${escapeHTML(item.nombre)}`,
    size: 'md',
    body: `
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Stock Actual en Almacén</label>
        <div class="fs-4 fw-bold text-body">${item.stockActual} unidades</div>
      </div>
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Tipo de Movimiento</label>
        <select class="form-select form-select-sm" id="modal-tipo-movimiento">
          <option value="entrada">📥 Entrada (Compra / Reposición)</option>
          <option value="consumo">🔧 Consumo (Utilizado en Reparación)</option>
          <option value="ajuste">⚙️ Ajuste de Inventario (Conteo físico)</option>
          <option value="perdida">⚠️ Pérdida / Merma</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Cantidad</label>
        <input type="number" class="form-control" id="modal-cantidad-mov" min="1" step="1" value="1">
      </div>
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Motivo / Orden de Reparación Asignada</label>
        <textarea class="form-control form-control-sm" id="modal-motivo-mov" rows="2" placeholder="Ej: Utilizado en reparación de violín #4, o Factura de compra #1024"></textarea>
      </div>
    `,
    saveText: 'Registrar Movimiento',
    onSave: async (mb) => {
      const tipo = mb.querySelector('#modal-tipo-movimiento').value
      const cantidad = parseInt(mb.querySelector('#modal-cantidad-mov').value, 10)
      const motivo = mb.querySelector('#modal-motivo-mov').value.trim()

      if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
        AppToast.show('La cantidad debe ser mayor a cero', 'error')
        return false
      }

      try {
        await ajustarStock({
          insumo_id: item.id,
          tipo,
          cantidad,
          motivo: motivo || 'Ajuste manual desde panel de insumos',
        })
        AppToast.show('Stock actualizado correctamente', 'success')
        await renderLuteriaInsumosView(container)
      } catch (err) {
        AppToast.show(`Error al registrar movimiento: ${err.message}`, 'error')
        return false
      }
    }
  })
}

function _modalNuevoInsumo(container) {
  AppModal.open({
    title: 'Nuevo Insumo / Repuesto de Lutería',
    size: 'md',
    body: `
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Nombre del Repuesto / Consumible</label>
        <input type="text" class="form-control" id="modal-nuevo-nombre" placeholder="Ej: Juego de Cuerdas Violín 4/4 Pirastro">
      </div>
      <div class="row g-2 mb-3">
        <div class="col-6">
          <label class="form-label text-muted small fw-semibold">Código SKU / Referencia</label>
          <input type="text" class="form-control form-control-sm" id="modal-nuevo-codigo" placeholder="Ej: CUER-VL-44">
        </div>
        <div class="col-6">
          <label class="form-label text-muted small fw-semibold">Categoría</label>
          <input type="text" class="form-control form-control-sm" id="modal-nuevo-categoria" placeholder="Ej: Cuerdas, Puentes, Clavijas">
        </div>
      </div>
      <div class="row g-2 mb-3">
        <div class="col-6">
          <label class="form-label text-muted small fw-semibold">Stock Inicial</label>
          <input type="number" class="form-control form-control-sm" id="modal-nuevo-stock" min="0" value="10">
        </div>
        <div class="col-6">
          <label class="form-label text-muted small fw-semibold">Stock Mínimo (Alerta)</label>
          <input type="number" class="form-control form-control-sm" id="modal-nuevo-minimo" min="0" value="3">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label text-muted small fw-semibold">Costo Unitario Estimado (DOP)</label>
        <input type="number" class="form-control form-control-sm" id="modal-nuevo-costo" min="0" step="50" value="500">
      </div>
    `,
    saveText: 'Guardar Insumo',
    onSave: async (mb) => {
      const nombre = mb.querySelector('#modal-nuevo-nombre').value.trim()
      const codigo = mb.querySelector('#modal-nuevo-codigo').value.trim()
      const categoria = mb.querySelector('#modal-nuevo-categoria').value.trim()
      const stock_actual = parseInt(mb.querySelector('#modal-nuevo-stock').value, 10) || 0
      const stock_minimo = parseInt(mb.querySelector('#modal-nuevo-minimo').value, 10) || 0
      const costo_unitario = parseFloat(mb.querySelector('#modal-nuevo-costo').value) || 0

      if (!nombre) {
        AppToast.show('El nombre del insumo es obligatorio', 'error')
        return false
      }

      try {
        const { error } = await supabase.from('lut_insumos').insert({
          nombre,
          codigo: codigo || null,
          categoria: categoria || 'General',
          stock_actual,
          stock_minimo,
          costo_unitario,
          unidad_medida: 'unidad',
        })

        if (error) throw error
        AppToast.show('Insumo registrado en almacén', 'success')
        await renderLuteriaInsumosView(container)
      } catch (err) {
        AppToast.show(`Error al guardar insumo: ${err.message}`, 'error')
        return false
      }
    }
  })
}
