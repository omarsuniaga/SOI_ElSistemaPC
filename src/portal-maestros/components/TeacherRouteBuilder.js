/**
 * TeacherRouteBuilder - Constructor de mapa de rutas propio del maestro
 * Jerarquía: UNIDADES > OBJETIVOS > INDICADORES, con prerrequisitos opcionales.
 * Formulario simple (sin drag-and-drop) — ver openspec/changes/teacher-portal-ai-grading/design.md
 */

import { AppToast } from '../../shared/components/AppToast.js'
import { escHTML } from '../utils/portalUtils.js'
import {
  getTeacherRoutes,
  createRoute,
  updateRoute,
  cloneRoute,
} from '../services/maestroRouteService.js'

let _uidCounter = 0
function _uid(prefix = 'tmp') {
  _uidCounter += 1
  return `${prefix}-${Date.now()}-${_uidCounter}`
}

/**
 * Abre el constructor de rutas para una clase, en modo crear o editar.
 * @param {Object} opts
 * @param {string} opts.maestroId
 * @param {string} opts.claseId
 * @param {Object} [opts.route] - Ruta existente a editar (con jerarquía completa). Si se omite, crea una nueva.
 * @param {(route: Object) => void} [opts.onSaved]
 */
export function openTeacherRouteBuilder({ maestroId, claseId, route = null, onSaved } = {}) {
  if (!maestroId || !claseId) {
    AppToast.error('Falta identificar al maestro o la clase')
    return
  }

  // Estado local en memoria: se guarda todo junto al presionar "Guardar"
  const state = {
    routeId: route?.id || null,
    nombre: route?.nombre || '',
    unidades: _cloneUnidadesForEdit(route?.unidades || []),
  }

  const backdrop = document.createElement('div')
  backdrop.className = 'trb-backdrop'
  backdrop.innerHTML = `
    <div class="trb-modal" role="dialog" aria-modal="true" aria-label="Mapa de rutas">
      <div class="trb-header">
        <h3>${route ? 'Editar' : 'Nuevo'} mapa de rutas</h3>
        <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="trb-body">
        <label class="trb-field">
          <span>Nombre de la ruta</span>
          <input type="text" class="trb-input" id="trb-nombre" placeholder="Ej. Violín Nivel 1 — Grupo A" value="${escHTML(state.nombre)}" />
        </label>

        <div class="trb-actions-row">
          <button class="trb-btn trb-btn-secondary" id="trb-btn-clonar" ${route ? '' : 'disabled title="Guarda primero para poder clonar"'}>
            <i class="bi bi-copy"></i> Clonar esta ruta
          </button>
          <button class="trb-btn trb-btn-secondary" id="trb-btn-acm" disabled title="Próximamente: el catálogo institucional ACM aún no está disponible en esta versión">
            <i class="bi bi-diagram-3"></i> Importar desde ACM (próximamente)
          </button>
        </div>

        <div class="trb-unidades" id="trb-unidades"></div>

        <button class="trb-btn trb-btn-add-unidad" id="trb-add-unidad">
          <i class="bi bi-plus-circle"></i> Agregar Unidad
        </button>
      </div>
      <div class="trb-footer">
        <button class="trb-btn trb-btn-ghost" id="trb-cancelar">Cancelar</button>
        <button class="trb-btn trb-btn-primary" id="trb-guardar">
          <i class="bi bi-check2"></i> Guardar ruta
        </button>
      </div>
    </div>
  `
  document.body.appendChild(backdrop)

  const closeModal = () => backdrop.remove()
  backdrop.querySelector('.trb-close').addEventListener('click', closeModal)
  backdrop.querySelector('#trb-cancelar').addEventListener('click', closeModal)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal()
  })

  const unidadesContainer = backdrop.querySelector('#trb-unidades')

  function _render() {
    unidadesContainer.innerHTML = state.unidades.map((unidad, ui) => _renderUnidad(unidad, ui)).join('')
    _bindUnidadEvents()
  }

  function _allIndicadores() {
    const list = []
    state.unidades.forEach((u) => {
      u.objetivos.forEach((o) => {
        o.indicadores.forEach((ind) => {
          list.push({ id: ind._localId, nombre: ind.nombre || '(sin nombre)' })
        })
      })
    })
    return list
  }

  function _renderUnidad(unidad, ui) {
    return `
      <div class="trb-unidad" data-ui="${ui}">
        <div class="trb-unidad-header">
          <span class="trb-badge-orden">U${ui + 1}</span>
          <input type="text" class="trb-input trb-input-inline" data-role="unidad-nombre" data-ui="${ui}"
                 placeholder="Nombre de la unidad" value="${escHTML(unidad.nombre)}" />
          <button class="trb-icon-btn trb-remove-unidad" data-ui="${ui}" title="Quitar unidad">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        <div class="trb-objetivos">
          ${unidad.objetivos.map((obj, oi) => _renderObjetivo(unidad, obj, ui, oi)).join('')}
        </div>
        <button class="trb-btn trb-btn-add-sub" data-role="add-objetivo" data-ui="${ui}">
          <i class="bi bi-plus"></i> Agregar Objetivo
        </button>
      </div>
    `
  }

  function _renderObjetivo(unidad, objetivo, ui, oi) {
    return `
      <div class="trb-objetivo" data-ui="${ui}" data-oi="${oi}">
        <div class="trb-objetivo-header">
          <span class="trb-badge-orden trb-badge-orden-sm">O${oi + 1}</span>
          <input type="text" class="trb-input trb-input-inline" data-role="objetivo-nombre" data-ui="${ui}" data-oi="${oi}"
                 placeholder="Nombre del objetivo" value="${escHTML(objetivo.nombre)}" />
          <button class="trb-icon-btn trb-remove-objetivo" data-ui="${ui}" data-oi="${oi}" title="Quitar objetivo">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        <div class="trb-indicadores">
          ${objetivo.indicadores.map((ind, ii) => _renderIndicador(ind, ui, oi, ii)).join('')}
        </div>
        <button class="trb-btn trb-btn-add-sub trb-btn-add-indicador" data-role="add-indicador" data-ui="${ui}" data-oi="${oi}">
          <i class="bi bi-plus"></i> Agregar Indicador
        </button>
      </div>
    `
  }

  function _renderIndicador(indicador, ui, oi, ii) {
    const otrosIndicadores = _allIndicadores().filter((x) => x.id !== indicador._localId)
    const prereqOptions = otrosIndicadores
      .map(
        (x) =>
          `<option value="${x.id}" ${indicador.prerequisito_local_id === x.id ? 'selected' : ''}>${escHTML(x.nombre)}</option>`
      )
      .join('')

    return `
      <div class="trb-indicador" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}">
        <span class="trb-badge-orden trb-badge-orden-xs">I${ii + 1}</span>
        <input type="text" class="trb-input trb-input-inline" data-role="indicador-nombre" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}"
               placeholder="Nombre del indicador" value="${escHTML(indicador.nombre)}" />
        <select class="trb-select" data-role="indicador-prereq" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}">
          <option value="">Sin Prerrequisitos</option>
          ${prereqOptions}
        </select>
        <button class="trb-icon-btn trb-remove-indicador" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}" title="Quitar indicador">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    `
  }

  function _bindUnidadEvents() {
    // Nombres (inputs)
    unidadesContainer.querySelectorAll('[data-role="unidad-nombre"]').forEach((el) => {
      el.addEventListener('input', () => {
        state.unidades[+el.dataset.ui].nombre = el.value
      })
    })
    unidadesContainer.querySelectorAll('[data-role="objetivo-nombre"]').forEach((el) => {
      el.addEventListener('input', () => {
        state.unidades[+el.dataset.ui].objetivos[+el.dataset.oi].nombre = el.value
      })
    })
    unidadesContainer.querySelectorAll('[data-role="indicador-nombre"]').forEach((el) => {
      el.addEventListener('input', () => {
        const { ui, oi, ii } = el.dataset
        state.unidades[+ui].objetivos[+oi].indicadores[+ii].nombre = el.value
        // El nombre cambia las opciones de prerrequisito visibles en otros selects
        _render()
      })
    })
    unidadesContainer.querySelectorAll('[data-role="indicador-prereq"]').forEach((el) => {
      el.addEventListener('change', () => {
        const { ui, oi, ii } = el.dataset
        state.unidades[+ui].objetivos[+oi].indicadores[+ii].prerequisito_local_id = el.value || null
      })
    })

    // Agregar
    unidadesContainer.querySelectorAll('[data-role="add-objetivo"]').forEach((el) => {
      el.addEventListener('click', () => {
        state.unidades[+el.dataset.ui].objetivos.push(_nuevoObjetivo())
        _render()
      })
    })
    unidadesContainer.querySelectorAll('[data-role="add-indicador"]').forEach((el) => {
      el.addEventListener('click', () => {
        state.unidades[+el.dataset.ui].objetivos[+el.dataset.oi].indicadores.push(_nuevoIndicador())
        _render()
      })
    })

    // Quitar
    unidadesContainer.querySelectorAll('.trb-remove-unidad').forEach((el) => {
      el.addEventListener('click', () => {
        state.unidades.splice(+el.dataset.ui, 1)
        _render()
      })
    })
    unidadesContainer.querySelectorAll('.trb-remove-objetivo').forEach((el) => {
      el.addEventListener('click', () => {
        state.unidades[+el.dataset.ui].objetivos.splice(+el.dataset.oi, 1)
        _render()
      })
    })
    unidadesContainer.querySelectorAll('.trb-remove-indicador').forEach((el) => {
      el.addEventListener('click', () => {
        const { ui, oi, ii } = el.dataset
        state.unidades[+ui].objetivos[+oi].indicadores.splice(+ii, 1)
        _render()
      })
    })
  }

  function _nuevoObjetivo() {
    return { _localId: _uid('obj'), nombre: '', indicadores: [] }
  }
  function _nuevoIndicador() {
    return { _localId: _uid('ind'), nombre: '', prerequisito_local_id: null }
  }

  backdrop.querySelector('#trb-add-unidad').addEventListener('click', () => {
    state.unidades.push({ _localId: _uid('uni'), nombre: '', objetivos: [] })
    _render()
  })

  backdrop.querySelector('#trb-nombre').addEventListener('input', (e) => {
    state.nombre = e.target.value
  })

  // Clonar ruta existente (solo disponible al editar una ruta ya guardada)
  backdrop.querySelector('#trb-btn-clonar').addEventListener('click', async () => {
    if (!state.routeId) return
    const nuevoNombre = window.prompt('Nombre para la ruta clonada:', `Copia de ${state.nombre}`)
    if (!nuevoNombre) return
    try {
      const cloned = await cloneRoute(state.routeId, nuevoNombre, claseId)
      AppToast.success('Ruta clonada correctamente')
      closeModal()
      onSaved?.(cloned)
    } catch (err) {
      AppToast.error(`No se pudo clonar la ruta: ${err.message}`)
    }
  })

  backdrop.querySelector('#trb-guardar').addEventListener('click', async () => {
    if (!state.nombre.trim()) {
      AppToast.error('Ponle un nombre a la ruta antes de guardar')
      return
    }
    if (state.unidades.length === 0) {
      AppToast.error('Agrega al menos una unidad')
      return
    }
    const unidadesInvalidas = state.unidades.some((u) => !u.nombre.trim() || u.objetivos.length === 0)
    if (unidadesInvalidas) {
      AppToast.error('Cada unidad necesita nombre y al menos un objetivo')
      return
    }

    const payload = _buildPayloadForSave(state.unidades)

    const guardarBtn = backdrop.querySelector('#trb-guardar')
    guardarBtn.disabled = true
    guardarBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando…'

    try {
      const saved = state.routeId
        ? await updateRoute(state.routeId, payload)
        : await createRoute(maestroId, claseId, state.nombre.trim(), payload)
      AppToast.success('Ruta guardada')
      closeModal()
      onSaved?.(saved)
    } catch (err) {
      AppToast.error(`No se pudo guardar la ruta: ${err.message}`)
      guardarBtn.disabled = false
      guardarBtn.innerHTML = '<i class="bi bi-check2"></i> Guardar ruta'
    }
  })

  _render()
}

/**
 * Muestra el selector de rutas del maestro para una clase (crear nueva o editar existente).
 * @param {string} maestroId
 * @param {string} claseId
 * @param {(route: Object) => void} [onSaved]
 */
export async function openTeacherRoutePicker(maestroId, claseId, onSaved) {
  const routes = await getTeacherRoutes(maestroId, claseId)

  if (!routes || routes.length === 0) {
    openTeacherRouteBuilder({ maestroId, claseId, onSaved })
    return
  }

  const backdrop = document.createElement('div')
  backdrop.className = 'trb-backdrop'
  backdrop.innerHTML = `
    <div class="trb-modal trb-modal-sm" role="dialog" aria-modal="true">
      <div class="trb-header">
        <h3>Tus rutas para esta clase</h3>
        <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="trb-body">
        <div class="trb-route-list">
          ${routes
            .map(
              (r) => `
            <button class="trb-route-item" data-route-id="${r.id}">
              <span class="trb-route-nombre">${escHTML(r.nombre)}</span>
              <span class="trb-route-meta">${r.unidades.length} unidades</span>
            </button>
          `
            )
            .join('')}
        </div>
        <button class="trb-btn trb-btn-add-unidad" id="trb-nueva-ruta">
          <i class="bi bi-plus-circle"></i> Crear ruta nueva
        </button>
      </div>
    </div>
  `
  document.body.appendChild(backdrop)

  const closeModal = () => backdrop.remove()
  backdrop.querySelector('.trb-close').addEventListener('click', closeModal)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal()
  })

  backdrop.querySelector('#trb-nueva-ruta').addEventListener('click', () => {
    closeModal()
    openTeacherRouteBuilder({ maestroId, claseId, onSaved })
  })

  backdrop.querySelectorAll('.trb-route-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = routes.find((r) => r.id === btn.dataset.routeId)
      closeModal()
      openTeacherRouteBuilder({ maestroId, claseId, route, onSaved })
    })
  })
}

// ─── Helpers de transformación de datos ─────────────────────────

/** Clona la jerarquía cargada del backend agregando IDs locales estables para el formulario */
function _cloneUnidadesForEdit(unidades) {
  const idMap = new Map() // id real (backend) -> _localId

  const withLocalIds = unidades.map((u) => ({
    ...u,
    _localId: _uid('uni'),
    objetivos: (u.objetivos || []).map((o) => ({
      ...o,
      _localId: _uid('obj'),
      indicadores: (o.indicadores || []).map((ind) => {
        const localId = _uid('ind')
        idMap.set(ind.id, localId)
        return { ...ind, _localId: localId }
      }),
    })),
  }))

  // Resolver prerequisito_indicador_id (real) -> prerequisito_local_id
  withLocalIds.forEach((u) =>
    u.objetivos.forEach((o) =>
      o.indicadores.forEach((ind) => {
        ind.prerequisito_local_id = ind.prerequisito_indicador_id
          ? idMap.get(ind.prerequisito_indicador_id) || null
          : null
      })
    )
  )

  return withLocalIds
}

/** Convierte el estado del formulario (con _localId) al payload que espera maestroRouteService */
function _buildPayloadForSave(unidades) {
  // Los prerrequisitos se resuelven por _localId dentro del mismo payload;
  // como maestroRouteService inserta secuencialmente y aún no conoce los IDs reales
  // al momento de la validación de DAG, propagamos el _localId como id temporal
  // y dejamos prerequisito_indicador_id apuntando al _localId del indicador prerrequisito.
  // El backend solo usa ese campo para validar el DAG y crear la fila en indicador_prerequisito
  // en la MISMA pasada de creación (ver maestroRouteService.createRoute).
  return unidades.map((u, ui) => ({
    id: u._localId,
    orden: ui,
    nombre: u.nombre.trim(),
    objetivos: u.objetivos.map((o, oi) => ({
      id: o._localId,
      orden: oi,
      nombre: o.nombre.trim(),
      indicadores: o.indicadores.map((ind, ii) => ({
        id: ind._localId,
        orden: ii,
        nombre: ind.nombre.trim(),
        prerequisito_indicador_id: ind.prerequisito_local_id || null,
      })),
    })),
  }))
}

// ─── Estilos ──────────────────────────────────────────────────
if (!document.getElementById('trb-styles')) {
  const s = document.createElement('style')
  s.id = 'trb-styles'
  s.textContent = `
    .trb-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9500; padding: 1rem;
    }
    .trb-modal {
      background: var(--pm-surface, #fff);
      border-radius: 16px;
      width: min(680px, 100%);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    }
    .trb-modal-sm { width: min(420px, 100%); }
    .trb-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--pm-border, #e5e7eb);
    }
    .trb-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; }
    .trb-close {
      background: none; border: none; font-size: 1.1rem; cursor: pointer;
      color: var(--pm-text-muted, #6b7280);
    }
    .trb-body { padding: 1rem 1.25rem; overflow-y: auto; flex: 1; }
    .trb-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.85rem 1.25rem; border-top: 1px solid var(--pm-border, #e5e7eb);
    }
    .trb-field { display: block; margin-bottom: 0.75rem; }
    .trb-field span { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--pm-text-muted); }
    .trb-input, .trb-select {
      width: 100%; padding: 0.5rem 0.65rem; border-radius: 8px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.88rem;
      background: var(--pm-bg, #fff); color: var(--pm-text, #111827);
    }
    .trb-input-inline { flex: 1; }
    .trb-actions-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .trb-btn {
      border-radius: 8px; padding: 0.45rem 0.8rem; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 0.35rem;
    }
    .trb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .trb-btn-primary { background: var(--pm-primary, #3b82f6); color: #fff; }
    .trb-btn-secondary { background: var(--pm-surface-2, #f3f4f6); color: var(--pm-text, #111827); border-color: var(--pm-border, #d1d5db); }
    .trb-btn-ghost { background: none; color: var(--pm-text-muted); }
    .trb-btn-add-unidad { background: rgba(59,130,246,0.08); color: var(--pm-primary, #3b82f6); width: 100%; justify-content: center; margin-top: 0.5rem; }
    .trb-btn-add-sub { background: none; color: var(--pm-primary, #3b82f6); padding: 0.25rem 0.5rem; font-size: 0.78rem; margin-top: 0.25rem; }

    .trb-unidad {
      border: 1.5px solid var(--pm-border, #e5e7eb); border-radius: 12px;
      padding: 0.75rem; margin-bottom: 0.75rem; background: var(--pm-surface-2, #fafafa);
    }
    .trb-unidad-header, .trb-objetivo-header {
      display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;
    }
    .trb-objetivo {
      border: 1px solid var(--pm-border, #e5e7eb); border-radius: 10px;
      padding: 0.6rem; margin: 0.5rem 0 0.5rem 1rem; background: var(--pm-surface, #fff);
    }
    .trb-indicador {
      display: flex; align-items: center; gap: 0.4rem;
      margin: 0.4rem 0 0.4rem 1rem;
    }
    .trb-indicador .trb-select { max-width: 220px; }
    .trb-badge-orden {
      background: var(--pm-primary, #3b82f6); color: #fff; font-size: 0.7rem; font-weight: 700;
      border-radius: 6px; padding: 0.15rem 0.4rem; flex-shrink: 0;
    }
    .trb-badge-orden-sm { background: #7c3aed; }
    .trb-badge-orden-xs { background: #059669; font-size: 0.65rem; }
    .trb-icon-btn {
      background: none; border: none; color: var(--pm-danger, #ef4444);
      cursor: pointer; font-size: 0.95rem; flex-shrink: 0; padding: 0.2rem;
    }

    .trb-route-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
    .trb-route-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.6rem 0.8rem; border: 1px solid var(--pm-border, #e5e7eb);
      border-radius: 10px; background: var(--pm-surface, #fff); cursor: pointer; text-align: left;
    }
    .trb-route-item:hover { border-color: var(--pm-primary, #3b82f6); background: rgba(59,130,246,0.04); }
    .trb-route-nombre { font-weight: 600; font-size: 0.88rem; }
    .trb-route-meta { font-size: 0.75rem; color: var(--pm-text-muted); }
  `
  document.head.appendChild(s)
}
