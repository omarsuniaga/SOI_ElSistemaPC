/**
 * luteriaDiagnosticoWizard.js — Modal para crear/editar diagnóstico con
 * cotización de ítems.
 *
 * Loop 19 Sesión 1.
 * - Lista de ítems editable (nombre + costo en DOP).
 * - Cálculo automático de subtotal mano de obra.
 * - Suma con costo_materiales para total final.
 * - Asigna a lut_ordenes_reparacion.costo_estimado.
 *
 * Items pre-cargados comunes (luthier puede editar/agregar/borrar):
 *   - Reemplazar cuerdas ............ 700 DOP
 *   - Ajustar puente ................ 500 DOP
 *   - Ajuste del alma ................ 500 DOP
 *   - Cambio de clavijas ............ 350 DOP
 *   - Reparación de caja de resonancia  1200 DOP
 *   - Mantenimiento general .......... 400 DOP
 *   - Limpieza profesional .......... 250 DOP
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { AppModal } from '../../../shared/components/AppModal.js'

const ITEMS_PREDEFINIDOS = [
  { nombre: 'Reemplazar cuerdas',     costo_dop: 700 },
  { nombre: 'Ajustar puente',         costo_dop: 500 },
  { nombre: 'Ajuste del alma',        costo_dop: 500 },
  { nombre: 'Cambio de clavijas',     costo_dop: 350 },
  { nombre: 'Reparación de caja',     costo_dop: 1200 },
  { nombre: 'Mantenimiento general',  costo_dop: 400 },
  { nombre: 'Limpieza profesional',   costo_dop: 250 },
]

const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/**
 * Abre el modal de diagnóstico para una orden.
 * Si ya existe diagnóstico, lo carga para edición.
 *
 * @param {Object} params
 * @param {string} params.ordenId
 * @param {Object} params.orden — la fila de lut_ordenes_reparacion
 * @param {string} [params.instrumentoLabel] — descripción del instrumento para el header
 * @param {Function} [params.onSuccess] — callback(diagnosticoId)
 */
export async function openDiagnosticoWizard({ ordenId, orden = {}, instrumentoLabel = '', onSuccess } = {}) {
  // Cargar diagnóstico existente si lo hay.
  let items = []
  let datosPrevios = null
  try {
    const { data } = await supabase
      .from('lut_diagnosticos')
      .select('*')
      .eq('orden_id', ordenId)
      .maybeSingle()
    if (data) {
      datosPrevios = data
      items = Array.isArray(data.items) ? data.items : []
    }
  } catch (err) {
    console.warn('[luteriaDiagnosticoWizard] No pude cargar diagnóstico previo:', err.message)
  }

  if (items.length === 0) {
    // Sugerir los 3 más comunes como punto de partida.
    items = ITEMS_PREDEFINIDOS.slice(0, 3).map((it, i) => ({
      id: `pre_${i}`,
      nombre: it.nombre,
      costo_dop: it.costo_dop,
    }))
  } else {
    items = items.map((it, i) => ({
      id: it.id || `db_${i}`,
      nombre: it.nombre,
      costo_dop: Number(it.costo_dop) || 0,
    }))
  }

  const body = `
    <form id="lut-diag-form" autocomplete="off">
      <p class="text-muted small mb-3">
        Instrumento: <strong>${escapeHTML(instrumentoLabel || 'N/D')}</strong>
        · Orden: <code>${escapeHTML(ordenId)}</code>
      </p>

      <div class="mb-3">
        <label class="form-label">Diagnóstico técnico <span class="text-danger">*</span></label>
        <textarea id="lut-diag-tecnico" class="form-control" rows="2" required
          placeholder="Resumen del diagnóstico: qué se rompió, causa probable, etc.">${escapeHTML(datosPrevios?.diagnostico_tecnico || '')}</textarea>
      </div>

      <div class="row">
        <div class="col-md-4 mb-3">
          <label class="form-label">Causa probable</label>
          <input type="text" id="lut-diag-causa" class="form-control"
            value="${escapeHTML(datosPrevios?.causa_probable || '')}"
            placeholder="Uso intensivo, golpe, antigüedad...">
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Zona afectada</label>
          <input type="text" id="lut-diag-zona" class="form-control"
            value="${escapeHTML(datosPrevios?.zona_afectada || '')}"
            placeholder="Puente, clavijas, fondo...">
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Tiempo estimado (hs)</label>
          <input type="number" id="lut-diag-tiempo" class="form-control" min="0" step="0.5"
            value="${datosPrevios?.tiempo_estimado_horas || ''}">
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Reparación recomendada</label>
          <input type="text" id="lut-diag-reparacion" class="form-control"
            value="${escapeHTML(datosPrevios?.reparacion_recomendada || '')}"
            placeholder="Cambio de cuerdas + ajuste...">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Materiales requeridos</label>
          <input type="text" id="lut-diag-materiales" class="form-control"
            value="${escapeHTML(datosPrevios?.materiales_requeridos || '')}"
            placeholder="Cuerdas D'Addario, pegamento...">
        </div>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label mb-0">Ítems de cotización <span class="text-danger">*</span></label>
          <button type="button" id="lut-diag-add-item" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-plus-circle me-1"></i>Agregar ítem
          </button>
        </div>
        <div id="lut-diag-items" class="mb-2"></div>
        <small class="text-muted">Cada ítem representa un trabajo o material con su costo en DOP.</small>
      </div>

      <div class="row mt-3">
        <div class="col-md-6 mb-3">
          <label class="form-label">Costo materiales (DOP)</label>
          <input type="number" id="lut-diag-costo-materiales" class="form-control" min="0" step="0.01"
            value="${datosPrevios?.costo_materiales || 0}">
          <small class="text-muted">Costo de cuerdas, pegamento, partes, etc.</small>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Total estimado</label>
          <div class="input-group">
            <span class="input-group-text">DOP</span>
            <input type="text" id="lut-diag-total" class="form-control" readonly
              style="background:#f8fafc;font-weight:700" value="0.00">
          </div>
          <small class="text-muted">Se asigna automáticamente a la orden.</small>
        </div>
      </div>

      <div class="form-check mb-3">
        <input type="checkbox" id="lut-diag-externo" class="form-check-input"
          ${datosPrevios?.requiere_servicio_externo ? 'checked' : ''}>
        <label for="lut-diag-externo" class="form-check-label">
          Requiere servicio externo (luthier externo, taller especializado)
        </label>
      </div>

      <div class="mb-3">
        <label class="form-label">Observaciones</label>
        <textarea id="lut-diag-observaciones" class="form-control" rows="2"
          placeholder="Notas adicionales del diagnóstico">${escapeHTML(datosPrevios?.observaciones || '')}</textarea>
      </div>

      <div id="lut-diag-error" class="alert alert-danger d-none" role="alert"></div>
    </form>
  `

  const modal = AppModal.open({
    title: 'Diagnóstico y Cotización',
    size: 'lg',
    body,
    saveText: 'Guardar diagnóstico',
    cancelText: 'Cancelar',
    onSave: async (closeModal) => {
      const errorEl = document.getElementById('lut-diag-error')
      errorEl.classList.add('d-none')

      const tecnico = document.getElementById('lut-diag-tecnico').value.trim()
      if (!tecnico) {
        errorEl.textContent = 'El diagnóstico técnico es obligatorio.'
        errorEl.classList.remove('d-none')
        return
      }

      const itemsActuales = collectItems()
      if (itemsActuales.length === 0) {
        errorEl.textContent = 'Agregá al menos un ítem a la cotización.'
        errorEl.classList.remove('d-none')
        return
      }

      const payload = {
        p_orden_id: ordenId,
        p_diagnostico_tecnico: tecnico,
        p_items: itemsActuales.map((it) => ({ nombre: it.nombre, costo_dop: Number(it.costo_dop) || 0 })),
        p_causa_probable: document.getElementById('lut-diag-causa').value.trim() || null,
        p_zona_afectada: document.getElementById('lut-diag-zona').value.trim() || null,
        p_tiempo_estimado_horas: Number(document.getElementById('lut-diag-tiempo').value) || null,
        p_reparacion_recomendada: document.getElementById('lut-diag-reparacion').value.trim() || null,
        p_materiales_requeridos: document.getElementById('lut-diag-materiales').value.trim() || null,
        p_costo_materiales: Number(document.getElementById('lut-diag-costo-materiales').value) || 0,
        p_requiere_servicio_externo: document.getElementById('lut-diag-externo').checked,
        p_observaciones: document.getElementById('lut-diag-observaciones').value.trim() || null,
        p_tipo_dano: orden.tipo_dano || datosPrevios?.tipo_dano || null,
        p_gravedad: orden.gravedad || datosPrevios?.gravedad || null,
        p_diagnosticado_por_nombre: 'Sistema',
      }

      const saveBtn = document.querySelector('#lut-diag-form').closest('.modal').querySelector('.btn-primary')
      if (saveBtn) {
        saveBtn.disabled = true
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
      }

      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('fn_lut_upsert_diagnostico', payload)
        if (rpcErr) throw rpcErr

        closeModal()
        if (onSuccess) onSuccess(rpcData)
      } catch (err) {
        console.error('[luteriaDiagnosticoWizard] error:', err)
        errorEl.textContent = 'Error al guardar diagnóstico: ' + err.message
        errorEl.classList.remove('d-none')
        if (saveBtn) {
          saveBtn.disabled = false
          saveBtn.textContent = 'Guardar diagnóstico'
        }
      }
    },
  })

  // ─── Post-render: setup de la lista de ítems ───
  setTimeout(() => setupItemsEditor(items, ITEMS_PREDEFINIDOS), 100)
}

function collectItems() {
  const items = []
  document.querySelectorAll('.lut-diag-item').forEach((row) => {
    const nombre = row.querySelector('.lut-diag-item-nombre').value.trim()
    const costo = Number(row.querySelector('.lut-diag-item-costo').value) || 0
    if (nombre) items.push({ nombre, costo_dop: costo })
  })
  return items
}

function setupItemsEditor(initialItems, predefinidos) {
  const container = document.getElementById('lut-diag-items')
  const addBtn = document.getElementById('lut-diag-add-item')
  const totalEl = document.getElementById('lut-diag-total')
  const costoMatEl = document.getElementById('lut-diag-costo-materiales')

  function render() {
    container.innerHTML = ''
    initialItems.forEach((it, idx) => container.appendChild(createItemRow(it, idx)))
    addBtn?.addEventListener('click', () => {
      initialItems.push({ id: `new_${Date.now()}`, nombre: '', costo_dop: 0 })
      container.appendChild(createItemRow(initialItems[initialItems.length - 1], initialItems.length - 1))
      bindRowEvents()
      recalc()
    })
    bindRowEvents()
    recalc()
  }

  function createItemRow(item, idx) {
    const row = document.createElement('div')
    row.className = 'lut-diag-item input-group mb-2'
    row.innerHTML = `
      <input type="text" class="form-control lut-diag-item-nombre"
        placeholder="Nombre del ítem (ej: Reemplazar cuerdas)"
        value="${escapeHTML(item.nombre || '')}" list="lut-items-predefinidos-${idx}">
      <datalist id="lut-items-predefinidos-${idx}">
        ${predefinidos.map((p) => `<option value="${escapeHTML(p.nombre)}">`).join('')}
      </datalist>
      <span class="input-group-text">DOP</span>
      <input type="number" class="form-control lut-diag-item-costo"
        placeholder="0" min="0" step="0.01" value="${item.costo_dop || 0}" style="max-width:140px">
      <button type="button" class="btn btn-outline-danger lut-diag-item-del" title="Quitar ítem">
        <i class="bi bi-x-lg"></i>
      </button>
    `
    return row
  }

  function bindRowEvents() {
    container.querySelectorAll('.lut-diag-item-costo, .lut-diag-item-nombre').forEach((inp) => {
      inp.addEventListener('input', recalc)
    })
    container.querySelectorAll('.lut-diag-item-del').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        initialItems.splice(idx, 1)
        render()
      })
    })
  }

  function recalc() {
    const items = collectItems()
    const subMO = items.reduce((s, it) => s + (Number(it.costo_dop) || 0), 0)
    const costoMat = Number(costoMatEl.value) || 0
    const total = subMO + costoMat
    totalEl.value = total.toFixed(2)
  }

  costoMatEl?.addEventListener('input', recalc)

  render()
}