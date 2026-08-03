import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerCatalogoNiveles,
  crearNivelCatalogo,
  obtenerObjetivosGeneralesCatalogo,
  crearObjetivoGeneralCatalogo,
  obtenerObjetivosEspecificosCatalogo,
  crearObjetivoEspecificoCatalogo,
} from '../services/mapaClaseService.js'

/**
 * Curación del catálogo institucional propio (Nivel -> Objetivo General ->
 * Objetivo Específico) que el Diseñador Curricular clona hacia cada clase.
 * Solo ACM/admin puede escribir acá (RLS: catalogo_*_admin).
 */
export async function renderCatalogoAcmView(container) {
  if (!container) return

  const state = { instrumento: '', niveles: [], nivelId: '', generales: [], objetivoGeneralId: '', especificos: [] }

  await _cargarNiveles(state)
  _render(container, state)
}

async function _cargarNiveles(state) {
  state.niveles = await obtenerCatalogoNiveles(state.instrumento || null)
  if (!state.niveles.find((n) => n.id === state.nivelId)) state.nivelId = ''
  await _cargarGenerales(state)
}

async function _cargarGenerales(state) {
  state.generales = state.nivelId ? await obtenerObjetivosGeneralesCatalogo(state.nivelId) : []
  if (!state.generales.find((g) => g.id === state.objetivoGeneralId)) state.objetivoGeneralId = ''
  await _cargarEspecificos(state)
}

async function _cargarEspecificos(state) {
  state.especificos = state.objetivoGeneralId
    ? await obtenerObjetivosEspecificosCatalogo(state.objetivoGeneralId)
    : []
}

function _render(container, state) {
  const nivelActual = state.niveles.find((n) => n.id === state.nivelId)
  const generalActual = state.generales.find((g) => g.id === state.objetivoGeneralId)

  container.innerHTML = `
    <div class="container-fluid px-4 py-4">
      <div class="d-flex align-items-center gap-3 mb-4">
        <button class="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" id="btn-volver-catalogo" style="width:42px; height:42px;">
          <i class="bi bi-arrow-left fs-5"></i>
        </button>
        <div>
          <h2 class="fw-bold mb-0">Catálogo de Planificación</h2>
          <p class="text-body-secondary small mb-0">Niveles → Objetivos Generales → Objetivos Específicos. El maestro clona un nivel completo a su clase desde el Diseñador Curricular.</p>
        </div>
      </div>

      <div class="mb-3" style="max-width: 320px;">
        <label class="form-label fw-semibold small">Filtrar por instrumento</label>
        <input type="text" class="form-control" id="input-filtro-instrumento" placeholder="Ej. Violín, Cello..." value="${escapeHTML(state.instrumento)}">
      </div>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
              <strong>Niveles</strong>
              <button class="btn btn-sm btn-primary" id="btn-add-nivel"><i class="bi bi-plus-lg"></i></button>
            </div>
            <div class="list-group list-group-flush" id="lista-niveles">
              ${
                state.niveles.length === 0
                  ? '<div class="list-group-item text-muted small">Sin niveles todavía</div>'
                  : state.niveles
                      .map(
                        (n) => `
                <button class="list-group-item list-group-item-action ${n.id === state.nivelId ? 'active' : ''}" data-nivel-id="${n.id}">
                  ${escapeHTML(n.nombre)} <span class="badge bg-secondary-subtle text-secondary ms-1">${escapeHTML(n.instrumento)}</span>
                </button>`,
                      )
                      .join('')
              }
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
              <strong>Objetivos Generales${nivelActual ? ` — ${escapeHTML(nivelActual.nombre)}` : ''}</strong>
              <button class="btn btn-sm btn-primary" id="btn-add-general" ${state.nivelId ? '' : 'disabled'}><i class="bi bi-plus-lg"></i></button>
            </div>
            <div class="list-group list-group-flush" id="lista-generales">
              ${
                !state.nivelId
                  ? '<div class="list-group-item text-muted small">Elegí un nivel</div>'
                  : state.generales.length === 0
                    ? '<div class="list-group-item text-muted small">Sin objetivos generales todavía</div>'
                    : state.generales
                        .map(
                          (g) => `
                <button class="list-group-item list-group-item-action ${g.id === state.objetivoGeneralId ? 'active' : ''}" data-general-id="${g.id}">
                  ${escapeHTML(g.nombre)}
                </button>`,
                        )
                        .join('')
              }
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
              <strong>Objetivos Específicos${generalActual ? ` — ${escapeHTML(generalActual.nombre)}` : ''}</strong>
              <button class="btn btn-sm btn-primary" id="btn-add-especifico" ${state.objetivoGeneralId ? '' : 'disabled'}><i class="bi bi-plus-lg"></i></button>
            </div>
            <div class="list-group list-group-flush" id="lista-especificos">
              ${
                !state.objetivoGeneralId
                  ? '<div class="list-group-item text-muted small">Elegí un objetivo general</div>'
                  : state.especificos.length === 0
                    ? '<div class="list-group-item text-muted small">Sin objetivos específicos todavía</div>'
                    : state.especificos
                        .map((e) => `<div class="list-group-item small">${escapeHTML(e.nombre)}</div>`)
                        .join('')
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  _attachEvents(container, state)
}

function _attachEvents(container, state) {
  container.querySelector('#btn-volver-catalogo')?.addEventListener('click', () => {
    window.router?.navigate('planificacion-acm')
  })

  container.querySelector('#input-filtro-instrumento')?.addEventListener('change', async (e) => {
    state.instrumento = e.target.value.trim()
    await _cargarNiveles(state)
    _render(container, state)
  })

  container.querySelector('#lista-niveles')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-nivel-id]')
    if (!btn) return
    state.nivelId = btn.dataset.nivelId
    await _cargarGenerales(state)
    _render(container, state)
  })

  container.querySelector('#lista-generales')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-general-id]')
    if (!btn) return
    state.objetivoGeneralId = btn.dataset.generalId
    await _cargarEspecificos(state)
    _render(container, state)
  })

  container.querySelector('#btn-add-nivel')?.addEventListener('click', () => {
    AppModal.open({
      title: 'Nuevo nivel del catálogo',
      body: `
        <div class="mb-3">
          <label class="form-label fw-semibold">Nombre *</label>
          <input type="text" class="form-control" id="modal-nivel-nombre" placeholder="Ej. Nivel 1">
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Instrumento *</label>
          <input type="text" class="form-control" id="modal-nivel-instrumento" placeholder="Ej. Cello" value="${escapeHTML(state.instrumento)}">
        </div>
      `,
      saveText: 'Crear nivel',
      onSave: async (mb) => {
        const nombre = mb.querySelector('#modal-nivel-nombre').value.trim()
        const instrumento = mb.querySelector('#modal-nivel-instrumento').value.trim()
        if (!nombre || !instrumento) {
          AppToast.error('Nombre e instrumento son obligatorios')
          return false
        }
        const orden = state.niveles.filter((n) => n.instrumento === instrumento).length + 1
        await crearNivelCatalogo({ nombre, instrumento, orden })
        state.instrumento = instrumento
        await _cargarNiveles(state)
        _render(container, state)
        AppToast.success('Nivel creado')
      },
    })
  })

  container.querySelector('#btn-add-general')?.addEventListener('click', () => {
    if (!state.nivelId) return
    AppModal.open({
      title: 'Nuevo objetivo general',
      body: `
        <div class="mb-3">
          <label class="form-label fw-semibold">Nombre *</label>
          <input type="text" class="form-control" id="modal-general-nombre" placeholder="Ej. Postura y agarre del arco">
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Descripción</label>
          <textarea class="form-control" id="modal-general-descripcion" rows="2"></textarea>
        </div>
      `,
      saveText: 'Crear objetivo general',
      onSave: async (mb) => {
        const nombre = mb.querySelector('#modal-general-nombre').value.trim()
        const descripcion = mb.querySelector('#modal-general-descripcion').value.trim()
        if (!nombre) {
          AppToast.error('El nombre es obligatorio')
          return false
        }
        const orden = state.generales.length + 1
        await crearObjetivoGeneralCatalogo({ nivelId: state.nivelId, nombre, descripcion, orden })
        await _cargarGenerales(state)
        _render(container, state)
        AppToast.success('Objetivo general creado')
      },
    })
  })

  container.querySelector('#btn-add-especifico')?.addEventListener('click', () => {
    if (!state.objetivoGeneralId) return
    AppModal.open({
      title: 'Nuevo objetivo específico (indicador)',
      body: `
        <div class="mb-3">
          <label class="form-label fw-semibold">Nombre *</label>
          <input type="text" class="form-control" id="modal-especifico-nombre" placeholder="Ej. Agarra correctamente el arco">
        </div>
      `,
      saveText: 'Crear objetivo específico',
      onSave: async (mb) => {
        const nombre = mb.querySelector('#modal-especifico-nombre').value.trim()
        if (!nombre) {
          AppToast.error('El nombre es obligatorio')
          return false
        }
        const orden = state.especificos.length + 1
        await crearObjetivoEspecificoCatalogo({ objetivoGeneralId: state.objetivoGeneralId, nombre, orden })
        await _cargarEspecificos(state)
        _render(container, state)
        AppToast.success('Objetivo específico creado')
      },
    })
  })
}
