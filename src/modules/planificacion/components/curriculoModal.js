/**
 * curriculoModal.js — Admin UI for creating/editing curricula with pillars + objectives.
 * Opens as a large standalone modal appended to document.body.
 * Pattern: same as planificacionModal.js (self-contained with injected <style>)
 */
import {
  listarCurriculos,
  crearCurriculo,
  actualizarCurriculo,
  toggleActivoCurriculo,
  crearPilar,
  actualizarPilar,
  eliminarPilar,
  crearObjetivo,
  actualizarObjetivo,
  eliminarObjetivo,
} from '../api/curriculoApi.js'
import { supabase } from '../../../core/supabase/supabaseClient.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const STYLE = `
<style id="curriculo-modal-style">
.cm-pilar { border: 1px solid var(--bs-border-color); border-radius: 8px; margin-bottom: .75rem; }
.cm-pilar-header { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; background:var(--bs-tertiary-bg); border-radius:7px 7px 0 0; }
.cm-pilar-body { padding:.5rem .75rem; }
.cm-obj-row { display:flex; align-items:center; gap:.5rem; padding:.25rem 0; border-bottom: 1px solid var(--bs-border-color-translucent); }
.cm-obj-row:last-child { border-bottom: none; }
.cm-obj-input { flex:1; }
</style>`

// ── List modal (admin entry point) ───────────────────────────────────────────

export function openCurriculoListModal(onClose) {
  const existing = document.getElementById('curriculo-list-modal')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'curriculo-list-modal'
  el.innerHTML = `${STYLE}
    <div class="modal fade" id="curriculo-list-modal-dialog" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-journal-bookmark me-2"></i>Gestión de Currículos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="cl-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm text-muted"></div></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-sm" id="cl-btn-nuevo">
              <i class="bi bi-plus me-1"></i>Nuevo Currículo
            </button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)

  const modalEl = el.querySelector('#curriculo-list-modal-dialog')
  const modal = new bootstrap.Modal(modalEl)

  async function _render() {
    const body = document.getElementById('cl-body')
    try {
      const lista = await listarCurriculos()
      if (lista.length === 0) {
        body.innerHTML = `<p class="text-muted text-center py-4">No hay currículos creados aún.</p>`
        return
      }
      body.innerHTML = `
        <table class="table table-sm table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Instrumento</th><th>Nivel</th><th>Objetivos</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(c => `
              <tr>
                <td class="fw-semibold">${c.instrumento}</td>
                <td>${c.nivel}</td>
                <td><span class="badge bg-secondary bg-opacity-15 text-secondary">${c.total_objetivos}</span></td>
                <td>
                  <div class="form-check form-switch mb-0">
                    <input class="form-check-input cl-toggle" type="checkbox" data-id="${c.id}" ${c.activo ? 'checked' : ''}>
                  </div>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-secondary btn-icon-compact cl-btn-edit" data-id="${c.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`

      body.querySelectorAll('.cl-toggle').forEach(tog => {
        tog.addEventListener('change', async () => {
          await toggleActivoCurriculo(tog.dataset.id, tog.checked)
          AppToast.success(tog.checked ? 'Currículo activado' : 'Currículo desactivado')
        })
      })
      body.querySelectorAll('.cl-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openCurriculoEditModal(btn.dataset.id, _render))
      })
    } catch (err) {
      body.innerHTML = `<p class="text-danger">${err.message}</p>`
    }
  }

  el.querySelector('#cl-btn-nuevo').addEventListener('click', () => {
    _openCurriculoCreateModal(_render)
  })

  modalEl.addEventListener('hidden.bs.modal', () => {
    el.remove()
    onClose?.()
  })

  modal.show()
  _render()
}

// ── Create modal ─────────────────────────────────────────────────────────────

function _openCurriculoCreateModal(onSaved) {
  const el = document.createElement('div')
  el.innerHTML = `
    <div class="modal fade" id="cc-modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Currículo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Instrumento *</label>
              <input type="text" class="form-control" id="cc-instrumento" placeholder="ej. Guitarra">
            </div>
            <div class="mb-3">
              <label class="form-label">Nivel *</label>
              <input type="text" class="form-control" id="cc-nivel" placeholder="ej. inicial, intermedio, 1, 2...">
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" id="cc-desc" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary btn-sm" id="cc-btn-save">Crear</button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)
  const modalEl = el.querySelector('#cc-modal')
  const modal = new bootstrap.Modal(modalEl)

  el.querySelector('#cc-btn-save').addEventListener('click', async () => {
    const instrumento = el.querySelector('#cc-instrumento').value.trim()
    const nivel = el.querySelector('#cc-nivel').value.trim()
    if (!instrumento || !nivel) { AppToast.error('Instrumento y nivel son obligatorios'); return }
    try {
      await crearCurriculo({ instrumento, nivel, descripcion: el.querySelector('#cc-desc').value.trim() })
      AppToast.success('Currículo creado')
      modal.hide()
      onSaved?.()
    } catch (err) {
      AppToast.error(err.message)
    }
  })
  modalEl.addEventListener('hidden.bs.modal', () => el.remove())
  modal.show()
}

// ── Edit modal (pillars + objectives) ────────────────────────────────────────

export async function openCurriculoEditModal(curriculoId, onSaved) {
  const { data: cur, error } = await supabase
    .from('curriculos')
    .select(`id, instrumento, nivel, descripcion, curriculo_pilares(id, nombre, orden, curriculo_objetivos(id, descripcion, orden))`)
    .eq('id', curriculoId)
    .single()

  if (error) { AppToast.error(error.message); return }

  const el = document.createElement('div')
  el.innerHTML = `
    <div class="modal fade" id="ce-modal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Editar: ${cur.instrumento} — ${cur.nivel}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ce-body"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)
  const modalEl = el.querySelector('#ce-modal')
  const modal = new bootstrap.Modal(modalEl)

  function _renderBody() {
    const body = document.getElementById('ce-body')
    const pilares = cur.curriculo_pilares || []
    body.innerHTML = `
      <div class="mb-3">
        <label class="form-label fw-semibold">Pilares</label>
        <div id="ce-pilares">
          ${pilares.map(p => `
            <div class="cm-pilar" data-pilar-id="${p.id}">
              <div class="cm-pilar-header">
                <input class="form-control form-control-sm flex-grow-1 pilar-nombre" value="${p.nombre}">
                <button class="btn btn-sm btn-outline-danger btn-icon-compact pilar-del" title="Eliminar pilar"><i class="bi bi-trash"></i></button>
              </div>
              <div class="cm-pilar-body">
                ${(p.curriculo_objetivos || []).map(o => `
                  <div class="cm-obj-row" data-obj-id="${o.id}">
                    <input class="form-control form-control-sm cm-obj-input obj-desc" value="${o.descripcion}">
                    <button class="btn btn-sm btn-outline-danger btn-icon-compact obj-del" title="Eliminar"><i class="bi bi-x"></i></button>
                  </div>`).join('')}
                <div class="mt-2 d-flex gap-2">
                  <input class="form-control form-control-sm new-obj-input" placeholder="Nuevo objetivo...">
                  <button class="btn btn-sm btn-outline-primary btn-icon-compact new-obj-btn" title="Agregar"><i class="bi bi-plus"></i></button>
                </div>
              </div>
            </div>`).join('')}
        </div>
        <button class="btn btn-outline-secondary btn-sm mt-2" id="ce-add-pilar">
          <i class="bi bi-plus me-1"></i>Agregar pilar
        </button>
      </div>`

    body.querySelectorAll('.pilar-nombre').forEach(inp => {
      inp.addEventListener('blur', async () => {
        const pilarEl = inp.closest('[data-pilar-id]')
        await actualizarPilar(pilarEl.dataset.pilarId, { nombre: inp.value.trim() })
      })
    })

    body.querySelectorAll('.pilar-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pilarEl = btn.closest('[data-pilar-id]')
        const id = pilarEl.dataset.pilarId
        if (!confirm('¿Eliminar este pilar y todos sus objetivos?')) return
        await eliminarPilar(id)
        cur.curriculo_pilares = cur.curriculo_pilares.filter(p => p.id !== id)
        _renderBody()
      })
    })

    body.querySelectorAll('.obj-desc').forEach(inp => {
      inp.addEventListener('blur', async () => {
        const objEl = inp.closest('[data-obj-id]')
        await actualizarObjetivo(objEl.dataset.objId, { descripcion: inp.value.trim() })
      })
    })

    body.querySelectorAll('.obj-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const objEl = btn.closest('[data-obj-id]')
        const id = objEl.dataset.objId
        await eliminarObjetivo(id)
        const pilarId = objEl.closest('[data-pilar-id]').dataset.pilarId
        const pilar = cur.curriculo_pilares.find(p => p.id === pilarId)
        if (pilar) pilar.curriculo_objetivos = pilar.curriculo_objetivos.filter(o => o.id !== id)
        _renderBody()
      })
    })

    body.querySelectorAll('.new-obj-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pilarEl = btn.closest('[data-pilar-id]')
        const pilarId = pilarEl.dataset.pilarId
        const inp = pilarEl.querySelector('.new-obj-input')
        const desc = inp.value.trim()
        if (!desc) return
        const pilar = cur.curriculo_pilares.find(p => p.id === pilarId)
        const orden = (pilar?.curriculo_objetivos || []).length
        const obj = await crearObjetivo(pilarId, desc, orden)
        if (pilar) pilar.curriculo_objetivos = [...(pilar.curriculo_objetivos || []), obj]
        inp.value = ''
        _renderBody()
      })
    })

    document.getElementById('ce-add-pilar')?.addEventListener('click', async () => {
      const nombre = prompt('Nombre del nuevo pilar:')
      if (!nombre?.trim()) return
      const orden = cur.curriculo_pilares.length
      const pilar = await crearPilar(cur.id, nombre.trim(), orden)
      cur.curriculo_pilares.push({ ...pilar, curriculo_objetivos: [] })
      _renderBody()
    })
  }

  modalEl.addEventListener('hidden.bs.modal', () => {
    el.remove()
    onSaved?.()
  })
  modal.show()
  _renderBody()
}
