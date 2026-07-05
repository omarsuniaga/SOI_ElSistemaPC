/**
 * luteriaOrdenWizard.js — Modal para crear una nueva orden de reparación.
 * Se abre desde el portal Lutería cuando un instrumento se marca como dañado
 * o cuando el usuario quiere crear una orden manualmente.
 *
 * Loop 17 Sesión 2: wizard básico con los campos mínimos.
 * Campos del wizard:
 *   - Instrumento (autoselect si se pasa instrumentoId)
 *   - Alumno (texto libre, opcional)
 *   - Descripción del daño (textarea obligatorio)
 *   - Tipo de daño (select: grieta | rotura | desafinacion | desgaste | otro)
 *   - Gravedad (select: leve | moderada | grave | critica)
 *   - Prioridad (select: baja | media | alta | critica)
 *   - Requiere reemplazo (checkbox)
 *   - Requiere cobro (checkbox)
 *
 * Después de crear, llama onSuccess(orden) para que la vista padre recargue.
 */

import { createOrden, getOrdenes } from '../../luteria-taller/api/luteriaTallerSupabase.js'
import { listarInstrumentos } from '../../instrumentos/api/instrumentosApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'

const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const TIPOS_DANO = [
  { value: 'grieta', label: 'Grieta' },
  { value: 'rotura', label: 'Rotura' },
  { value: 'desafinacion', label: 'Desafinación' },
  { value: 'desgaste', label: 'Desgaste' },
  { value: 'otro', label: 'Otro' },
]

export async function openLuteriaOrdenWizard({ instrumentoId = null, onSuccess } = {}) {
  let instrumentosCache = []
  try {
    instrumentosCache = await listarInstrumentos({ activo: true })
  } catch (err) {
    console.warn('[luteriaOrdenWizard] No pude cargar instrumentos:', err.message)
  }

  const instrumentosOptions = instrumentosCache
    .map((i) => `<option value="${escapeHTML(i.id)}" ${i.id === instrumentoId ? 'selected' : ''}>${escapeHTML(i.codigo)} — ${escapeHTML(i.nombre)} (${escapeHTML(i.estado)})</option>`)
    .join('')

  const body = `
    <form id="lut-wizard-form" autocomplete="off">
      <div class="mb-3">
        <label class="form-label">Instrumento <span class="text-danger">*</span></label>
        <select id="lut-instrumento" class="form-select" required>
          <option value="">— Seleccionar instrumento —</option>
          ${instrumentosOptions}
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Alumno (opcional)</label>
        <input type="text" id="lut-alumno" class="form-control" placeholder="Nombre del alumno que reporta el daño">
        <small class="text-muted">Si el daño fue reportado por un alumno, dejar su nombre acá.</small>
      </div>

      <div class="mb-3">
        <label class="form-label">Descripción del daño <span class="text-danger">*</span></label>
        <textarea id="lut-descripcion" class="form-control" rows="3" required
          placeholder="Describí el daño observado (qué se rompió, cuándo se detectó, contexto)"></textarea>
      </div>

      <div class="row">
        <div class="col-md-4 mb-3">
          <label class="form-label">Tipo de daño</label>
          <select id="lut-tipo" class="form-select">
            ${TIPOS_DANO.map((t) => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Gravedad</label>
          <select id="lut-gravedad" class="form-select">
            <option value="leve">Leve</option>
            <option value="moderada" selected>Moderada</option>
            <option value="grave">Grave</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        <div class="col-md-4 mb-3">
          <label class="form-label">Prioridad</label>
          <select id="lut-prioridad" class="form-select">
            <option value="baja">Baja</option>
            <option value="media" selected>Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="form-check">
            <input type="checkbox" id="lut-reemplazo" class="form-check-input">
            <label for="lut-reemplazo" class="form-check-label">Requiere reemplazo de pieza</label>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="form-check">
            <input type="checkbox" id="lut-cobro" class="form-check-input">
            <label for="lut-cobro" class="form-check-label">Requiere cobro al alumno</label>
          </div>
        </div>
      </div>

      <div id="lut-wizard-error" class="alert alert-danger d-none" role="alert"></div>
    </form>
  `

  const modal = AppModal.open({
    title: 'Nueva Orden de Reparación',
    size: 'lg',
    body,
    saveText: 'Crear orden',
    cancelText: 'Cancelar',
    onSave: async (closeModal) => {
      const errorEl = document.getElementById('lut-wizard-error')
      errorEl.classList.add('d-none')

      const instrumentoIdVal = document.getElementById('lut-instrumento').value
      const descripcion = document.getElementById('lut-descripcion').value.trim()
      const alumno = document.getElementById('lut-alumno').value.trim()
      const tipo = document.getElementById('lut-tipo').value
      const gravedad = document.getElementById('lut-gravedad').value
      const prioridad = document.getElementById('lut-prioridad').value
      const reemplazo = document.getElementById('lut-reemplazo').checked
      const cobro = document.getElementById('lut-cobro').checked

      // Validación
      if (!instrumentoIdVal) {
        errorEl.textContent = 'Tenés que seleccionar un instrumento.'
        errorEl.classList.remove('d-none')
        return
      }
      if (!descripcion) {
        errorEl.textContent = 'La descripción del daño es obligatoria.'
        errorEl.classList.remove('d-none')
        return
      }

      try {
        const orden = await createOrden({
          instrumento_id: instrumentoIdVal,
          alumno_nombre: alumno || null,
          reportado_por_nombre: 'Admin SOI',  // TODO: usar perfil real cuando tengamos auth en portal LUT
          departamento_origen: 'LUT',
          prioridad,
          descripcion_inicial: descripcion,
          tipo_dano: tipo,
          gravedad,
          requiere_reemplazo: reemplazo,
          requiere_cobro: cobro,
        })

        // Setear gravedad via update (no está en createOrden)
        // Para mantener simpleza, lo hacemos via createOrden + update
        // Pero createOrden no acepta gravedad. Lo dejamos en updateOrdenEstado
        // que sí acepta campos adicionales. Sin embargo, eso requiere otro
        // endpoint. Por simplicidad del V1, dejamos gravedad en la tabla
        // pero no la seteamos en el create — se puede setear después.
        // TODO Sesión 3: agregar gravedad al create.

        closeModal()
        if (onSuccess) onSuccess(orden)
      } catch (err) {
        console.error('[luteriaOrdenWizard] error:', err)
        errorEl.textContent = 'Error al crear la orden: ' + err.message
        errorEl.classList.remove('d-none')
      }
    },
  })
}