import { crearRuta } from '../api/rutasApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { supabase } from '../../../lib/supabaseClient.js'

const STYLE = `
<style id="ruta-crear-style">
.objetivo-row { border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin-bottom: 10px; display: grid; grid-template-columns: 80px 1fr auto; gap: 10px; align-items: start; }
.objetivo-row input, .objetivo-row textarea { font-size: 0.9rem; }
</style>`

export function openRutaCrearModal(onCreated) {
  const existing = document.getElementById('ruta-crear-modal')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'ruta-crear-modal'
  el.innerHTML = `${STYLE}
    <div class="modal fade" id="ruta-crear-dialog" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Nueva Ruta SOI</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label"><strong>Instrumento</strong></label>
              <select class="form-select" id="ruta-instrumento">
                <option value="">— Selecciona —</option>
                <option>Guitarra</option>
                <option>Piano</option>
                <option>Violín</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label"><strong>Nivel</strong></label>
              <select class="form-select" id="ruta-nivel">
                <option value="">— Selecciona —</option>
                <option>Nivel 1</option>
                <option>Nivel 2</option>
                <option>Intermedio</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label"><strong>Nombre de la Ruta</strong></label>
              <input type="text" class="form-control" id="ruta-nombre" placeholder="ej: Guitarra Nivel 1 - SOI Estándar">
            </div>

            <div class="mb-3">
              <label class="form-label"><strong>Duración (semanas)</strong></label>
              <input type="number" class="form-control" id="ruta-duracion" value="40" min="1" max="52">
            </div>

            <hr>

            <div class="mb-3">
              <label class="form-label"><strong>Objetivos</strong></label>
              <div id="objetivos-list"></div>
              <button type="button" class="btn btn-outline-primary btn-sm w-100" id="btn-agregar-objetivo">
                <i class="bi bi-plus me-1"></i>Agregar Objetivo
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-crear-ruta">
              <i class="bi bi-check me-1"></i>Crear Ruta
            </button>
          </div>
        </div>
      </div>
    </div>`

  document.body.appendChild(el)

  const modalEl = document.getElementById('ruta-crear-dialog')
  const modal = new bootstrap.Modal(modalEl)

  let objetivos = [{ descripcion: '', semana_inicio: 1, semana_fin: 2, orden: 1 }]

  function _renderObjetivos() {
    const list = document.getElementById('objetivos-list')
    list.innerHTML = objetivos.map((obj, i) => `
      <div class="objetivo-row" data-idx="${i}">
        <input type="text" class="form-control form-control-sm" placeholder="Semanas" value="${obj.semana_inicio}-${obj.semana_fin}" style="width: 80px;">
        <textarea class="form-control form-control-sm" rows="2" placeholder="Descripción del objetivo">${obj.descripcion}</textarea>
        <button type="button" class="btn btn-sm btn-link text-danger" onclick="this.closest('.objetivo-row').remove()">Eliminar</button>
      </div>
    `).join('')
  }

  document.getElementById('btn-agregar-objetivo').addEventListener('click', () => {
    const maxSemana = Math.max(...objetivos.map(o => o.semana_fin))
    objetivos.push({
      descripcion: '',
      semana_inicio: maxSemana + 1,
      semana_fin: maxSemana + 2,
      orden: objetivos.length + 1
    })
    _renderObjetivos()
  })

  document.getElementById('btn-crear-ruta').addEventListener('click', async () => {
    const instrumento = document.getElementById('ruta-instrumento').value
    const nivel = document.getElementById('ruta-nivel').value
    const nombre = document.getElementById('ruta-nombre').value
    const duracion = parseInt(document.getElementById('ruta-duracion').value)

    if (!instrumento || !nivel || !nombre) {
      AppToast.warning('Completa los campos requeridos')
      return
    }

    // Parse objetivos from UI
    const objetivosData = Array.from(document.querySelectorAll('.objetivo-row')).map((row, i) => {
      const input = row.querySelector('input').value.split('-')
      const descripcion = row.querySelector('textarea').value
      return {
        semana_inicio: parseInt(input[0]),
        semana_fin: parseInt(input[1]),
        descripcion,
        orden: i + 1
      }
    })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const ruta = await crearRuta({
        instrumento,
        nivel,
        nombre,
        tipo: 'soi-estandar',
        estado: 'activa',
        duracion_semanas: duracion,
        objetivos: objetivosData,
        creada_por: userData?.user?.id
      })

      AppToast.success(`Ruta "${nombre}" creada`)
      modal.hide()
      if (onCreated) onCreated(ruta)
    } catch (err) {
      AppToast.error(`Error: ${err.message}`)
    }
  })

  _renderObjetivos()
  modal.show()
}
