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
import { getMisClases } from '../services/maestroDataService.js'

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
        <div class="trb-header-titles">
          <h3>${route ? 'Editar' : 'Nuevo'} mapa de rutas</h3>
          <span class="trb-header-subtitle" id="trb-header-subtitle"></span>
        </div>
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
  const subtitleEl = backdrop.querySelector('#trb-header-subtitle')

  // Acordeón: qué unidades/objetivos están desplegados ahora mismo. Arranca
  // todo colapsado (vista de tarjetas compacta) — un card por unidad, se
  // expande al tocarlo. Guarda por _localId, no por índice, para no perder
  // el estado abierto/cerrado cuando se reordena o borra un hermano.
  const expandedUnidades = new Set()
  const expandedObjetivos = new Set()
  // Solo un selector de prerrequisito puede estar abierto a la vez (por _localId
  // del indicador dueño) — es un componente atómico propio (chip + panel), no
  // un <select> nativo, para poder mostrar/quitar el valor sin abrir nada.
  let openPrereqId = null

  function _actualizarSubtitulo() {
    const nUnidades = state.unidades.length
    const nObjetivos = state.unidades.reduce((sum, u) => sum + u.objetivos.length, 0)
    const nIndicadores = _allIndicadores().length
    subtitleEl.textContent = nUnidades
      ? `${nUnidades} unidad${nUnidades === 1 ? '' : 'es'} · ${nObjetivos} objetivo${nObjetivos === 1 ? '' : 's'} · ${nIndicadores} indicador${nIndicadores === 1 ? '' : 'es'}`
      : 'Todavía no tiene unidades'
  }

  function _render() {
    unidadesContainer.innerHTML = state.unidades.map((unidad, ui) => _renderUnidad(unidad, ui)).join('')
    _bindUnidadEvents()
    _actualizarSubtitulo()
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
    const expanded = expandedUnidades.has(unidad._localId)
    const nObj = unidad.objetivos.length
    const nInd = unidad.objetivos.reduce((sum, o) => sum + o.indicadores.length, 0)

    return `
      <div class="trb-unidad ${expanded ? 'trb-expanded' : ''}" data-ui="${ui}">
        <div class="trb-card-header" data-role="toggle-unidad" data-ui="${ui}">
          <button class="trb-chevron" data-role="toggle-unidad" data-ui="${ui}" aria-expanded="${expanded}" aria-label="${expanded ? 'Colapsar' : 'Expandir'} unidad">
            <i class="bi bi-chevron-right"></i>
          </button>
          <span class="trb-badge-orden">U${ui + 1}</span>
          <input type="text" class="trb-input trb-input-ghost trb-input-inline" data-role="unidad-nombre" data-ui="${ui}"
                 placeholder="Nombre de la unidad" value="${escHTML(unidad.nombre)}" />
          <span class="trb-count-pill">${nObj} obj · ${nInd} ind</span>
          <button class="trb-icon-btn trb-remove-unidad" data-ui="${ui}" title="Quitar unidad">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        ${
          expanded
            ? `
        <div class="trb-card-body">
          <label class="trb-field trb-field-sm">
            <span>Descripción / síntesis <em>(qué aprende el alumno — se le muestra como resumen de la unidad)</em></span>
            <textarea class="trb-textarea" data-role="unidad-descripcion" data-ui="${ui}"
                      placeholder="Ej. El alumno domina el agarre correcto del arco y la postura corporal base.">${escHTML(unidad.descripcion || '')}</textarea>
          </label>
          <div class="trb-objetivos">
            ${unidad.objetivos.map((obj, oi) => _renderObjetivo(unidad, obj, ui, oi)).join('')}
          </div>
          <button class="trb-btn trb-btn-add-sub" data-role="add-objetivo" data-ui="${ui}">
            <i class="bi bi-plus"></i> Agregar Objetivo
          </button>
        </div>`
            : ''
        }
      </div>
    `
  }

  function _renderObjetivo(unidad, objetivo, ui, oi) {
    const expanded = expandedObjetivos.has(objetivo._localId)
    const nInd = objetivo.indicadores.length

    return `
      <div class="trb-objetivo ${expanded ? 'trb-expanded' : ''}" data-ui="${ui}" data-oi="${oi}">
        <div class="trb-card-header" data-role="toggle-objetivo" data-ui="${ui}" data-oi="${oi}">
          <button class="trb-chevron" data-role="toggle-objetivo" data-ui="${ui}" data-oi="${oi}" aria-expanded="${expanded}" aria-label="${expanded ? 'Colapsar' : 'Expandir'} objetivo">
            <i class="bi bi-chevron-right"></i>
          </button>
          <span class="trb-badge-orden trb-badge-orden-sm">O${oi + 1}</span>
          <input type="text" class="trb-input trb-input-ghost trb-input-inline" data-role="objetivo-nombre" data-ui="${ui}" data-oi="${oi}"
                 placeholder="Nombre del objetivo" value="${escHTML(objetivo.nombre)}" />
          <span class="trb-count-pill">${nInd} ind</span>
          <button class="trb-icon-btn trb-remove-objetivo" data-ui="${ui}" data-oi="${oi}" title="Quitar objetivo">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        ${
          expanded
            ? `
        <div class="trb-card-body">
          <div class="trb-indicadores">
            ${objetivo.indicadores.map((ind, ii) => _renderIndicador(ind, ui, oi, ii)).join('')}
          </div>
          <button class="trb-btn trb-btn-add-sub trb-btn-add-indicador" data-role="add-indicador" data-ui="${ui}" data-oi="${oi}">
            <i class="bi bi-plus"></i> Agregar Indicador
          </button>
        </div>`
            : ''
        }
      </div>
    `
  }

  function _renderIndicador(indicador, ui, oi, ii) {
    return `
      <div class="trb-indicador" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}">
        <div class="trb-indicador-row">
          <span class="trb-badge-orden trb-badge-orden-xs">I${ii + 1}</span>
          <input type="text" class="trb-input trb-input-inline" data-role="indicador-nombre" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}"
                 placeholder="Nombre del indicador" value="${escHTML(indicador.nombre)}" />
          <button class="trb-icon-btn trb-remove-indicador" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}" title="Quitar indicador">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        ${_renderPrereqPicker(indicador, ui, oi, ii)}
      </div>
    `
  }

  /**
   * Componente atómico del prerrequisito: chip con el valor actual (o botón
   * "Agregar prerrequisito" si no hay ninguno) + botón para quitarlo + panel
   * desplegable propio para elegirlo — reemplaza al <select> nativo, que
   * mezclaba las 3 acciones (ver/cambiar/quitar) en un único control.
   */
  function _renderPrereqPicker(indicador, ui, oi, ii) {
    const otrosIndicadores = _allIndicadores().filter((x) => x.id !== indicador._localId)
    const actual = otrosIndicadores.find((x) => x.id === indicador.prerequisito_local_id) || null
    const isOpen = openPrereqId === indicador._localId

    const panelHTML = isOpen
      ? `
      <div class="trb-prereq-panel">
        ${
          otrosIndicadores.length
            ? otrosIndicadores
                .map(
                  (x) => `
              <button class="trb-prereq-option ${x.id === indicador.prerequisito_local_id ? 'trb-prereq-option-active' : ''}"
                      data-role="prereq-pick" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}" data-value="${x.id}">
                ${escHTML(x.nombre)}
              </button>
            `
                )
                .join('')
            : '<p class="trb-prereq-empty">Todavía no hay otros indicadores en esta ruta.</p>'
        }
      </div>`
      : ''

    return `
      <div class="trb-prereq" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}">
        <span class="trb-prereq-label"><i class="bi bi-link-45deg"></i> Prerrequisito</span>
        <div class="trb-prereq-control">
          ${
            actual
              ? `
            <button class="trb-prereq-chip" data-role="prereq-toggle" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}" title="Cambiar prerrequisito">
              ${escHTML(actual.nombre)}
            </button>
            <button class="trb-icon-btn trb-prereq-clear" data-role="prereq-clear" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}" title="Quitar prerrequisito">
              <i class="bi bi-x-lg"></i>
            </button>
          `
              : `
            <button class="trb-prereq-add" data-role="prereq-toggle" data-ui="${ui}" data-oi="${oi}" data-ii="${ii}">
              <i class="bi bi-plus"></i> Agregar prerrequisito
            </button>
          `
          }
        </div>
        ${panelHTML}
      </div>
    `
  }

  function _bindUnidadEvents() {
    // Acordeón: togglear expand/collapse no debe re-renderizar todo el árbol
    // desde cero salvo por el propio cambio de estado — usa _render() igual
    // que el resto, es barato porque el formulario vive solo en memoria.
    unidadesContainer.querySelectorAll('[data-role="toggle-unidad"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const localId = state.unidades[+el.dataset.ui]._localId
        if (expandedUnidades.has(localId)) expandedUnidades.delete(localId)
        else expandedUnidades.add(localId)
        _render()
      })
    })
    unidadesContainer.querySelectorAll('[data-role="toggle-objetivo"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const { ui, oi } = el.dataset
        const localId = state.unidades[+ui].objetivos[+oi]._localId
        if (expandedObjetivos.has(localId)) expandedObjetivos.delete(localId)
        else expandedObjetivos.add(localId)
        _render()
      })
    })

    // Nombres (inputs)
    unidadesContainer.querySelectorAll('[data-role="unidad-nombre"]').forEach((el) => {
      el.addEventListener('input', () => {
        state.unidades[+el.dataset.ui].nombre = el.value
      })
      el.addEventListener('click', (e) => e.stopPropagation())
    })
    unidadesContainer.querySelectorAll('[data-role="unidad-descripcion"]').forEach((el) => {
      el.addEventListener('input', () => {
        state.unidades[+el.dataset.ui].descripcion = el.value
      })
    })
    unidadesContainer.querySelectorAll('[data-role="objetivo-nombre"]').forEach((el) => {
      el.addEventListener('input', () => {
        state.unidades[+el.dataset.ui].objetivos[+el.dataset.oi].nombre = el.value
      })
      el.addEventListener('click', (e) => e.stopPropagation())
    })
    unidadesContainer.querySelectorAll('[data-role="indicador-nombre"]').forEach((el) => {
      el.addEventListener('input', () => {
        const { ui, oi, ii } = el.dataset
        state.unidades[+ui].objetivos[+oi].indicadores[+ii].nombre = el.value
        // El nombre cambia las opciones de prerrequisito visibles en otros selects
        _render()
      })
    })
    // Prerrequisito (componente atómico: toggle abre/cierra el panel, pick
    // elige y cierra, clear quita sin abrir nada)
    unidadesContainer.querySelectorAll('[data-role="prereq-toggle"]').forEach((el) => {
      el.addEventListener('click', () => {
        const { ui, oi, ii } = el.dataset
        const localId = state.unidades[+ui].objetivos[+oi].indicadores[+ii]._localId
        openPrereqId = openPrereqId === localId ? null : localId
        _render()
      })
    })
    unidadesContainer.querySelectorAll('[data-role="prereq-pick"]').forEach((el) => {
      el.addEventListener('click', () => {
        const { ui, oi, ii, value } = el.dataset
        state.unidades[+ui].objetivos[+oi].indicadores[+ii].prerequisito_local_id = value || null
        openPrereqId = null
        _render()
      })
    })
    unidadesContainer.querySelectorAll('[data-role="prereq-clear"]').forEach((el) => {
      el.addEventListener('click', () => {
        const { ui, oi, ii } = el.dataset
        state.unidades[+ui].objetivos[+oi].indicadores[+ii].prerequisito_local_id = null
        openPrereqId = null
        _render()
      })
    })

    // Agregar — el nuevo hijo se auto-expande para poder escribirle el nombre
    // de inmediato, sin un toque extra para desplegarlo.
    unidadesContainer.querySelectorAll('[data-role="add-objetivo"]').forEach((el) => {
      el.addEventListener('click', () => {
        const nuevo = _nuevoObjetivo()
        state.unidades[+el.dataset.ui].objetivos.push(nuevo)
        expandedObjetivos.add(nuevo._localId)
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
    const nuevaUnidad = { _localId: _uid('uni'), nombre: '', descripcion: '', objetivos: [] }
    state.unidades.push(nuevaUnidad)
    expandedUnidades.add(nuevaUnidad._localId)
    _render()
  })

  backdrop.querySelector('#trb-nombre').addEventListener('input', (e) => {
    state.nombre = e.target.value
  })

  // Clonar ruta existente hacia OTRA clase (solo disponible al editar una ruta
  // ya guardada). maestro_routes tiene UNIQUE(maestro_id, clase_id): clonar
  // hacia la misma clase que ya tiene esta ruta siempre viola esa restricción,
  // así que se excluye de las opciones y se pide explícitamente la clase destino.
  backdrop.querySelector('#trb-btn-clonar').addEventListener('click', async () => {
    if (!state.routeId) return

    const misClases = await getMisClases()
    const opciones = (misClases || []).filter((c) => c.id !== claseId)

    if (opciones.length === 0) {
      AppToast.error('No tienes otra clase disponible para clonar esta ruta')
      return
    }

    const claseDestinoId = await _pickClaseDestino(opciones)
    if (!claseDestinoId) return

    const nuevoNombre = window.prompt('Nombre para la ruta clonada:', `Copia de ${state.nombre}`)
    if (!nuevoNombre) return

    try {
      const cloned = await cloneRoute(state.routeId, nuevoNombre, claseDestinoId)
      AppToast.success('Ruta clonada correctamente')
      closeModal()
      onSaved?.(cloned)
    } catch (err) {
      const yaExiste = err.message?.includes('duplicate key') || err.message?.includes('23505')
      AppToast.error(
        yaExiste
          ? 'Esa clase ya tiene una ruta propia — no se puede clonar encima'
          : `No se pudo clonar la ruta: ${err.message}`
      )
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
    descripcion: u.descripcion?.trim() || null,
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

/**
 * Modal simple para elegir la clase destino al clonar una ruta.
 * @param {Array<{id: string, nombre: string}>} clases
 * @returns {Promise<string|null>} claseId elegido, o null si canceló
 */
function _pickClaseDestino(clases) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div')
    backdrop.className = 'trb-backdrop'
    backdrop.innerHTML = `
      <div class="trb-modal trb-modal-sm" role="dialog" aria-modal="true">
        <div class="trb-header">
          <h3>Clonar hacia qué clase</h3>
          <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="trb-body">
          <div class="trb-route-list">
            ${clases
              .map(
                (c) => `
              <button class="trb-route-item" data-clase-id="${c.id}">
                <span class="trb-route-nombre">${escHTML(c.nombre)}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `
    document.body.appendChild(backdrop)

    const finish = (value) => {
      backdrop.remove()
      resolve(value)
    }

    backdrop.querySelector('.trb-close').addEventListener('click', () => finish(null))
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) finish(null)
    })
    backdrop.querySelectorAll('.trb-route-item').forEach((btn) => {
      btn.addEventListener('click', () => finish(btn.dataset.claseId))
    })
  })
}

// ─── Estilos ──────────────────────────────────────────────────
if (!document.getElementById('trb-styles')) {
  const s = document.createElement('style')
  s.id = 'trb-styles'
  s.textContent = `
    .trb-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.6);
      display: flex; align-items: center; justify-content: center;
      /* El footer móvil fuerza z-index 9999 — el modal debe quedar por
         encima para que "Guardar ruta" nunca quede tapado. */
      z-index: 10000; padding: 1rem;
    }
    .trb-modal {
      background: var(--pm-surface, #fff); color: var(--pm-text, #111827);
      border-radius: 18px;
      width: min(680px, 100%);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 64px rgba(0,0,0,0.35);
    }
    .trb-modal-sm { width: min(420px, 100%); }
    .trb-header {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      padding: 1.1rem 1.35rem; border-bottom: 1px solid var(--pm-border, #e5e7eb);
    }
    .trb-header-titles { display: flex; flex-direction: column; gap: 0.15rem; }
    .trb-header h3 { margin: 0; font-size: 1.08rem; font-weight: 700; color: var(--pm-text, #111827); }
    .trb-header-subtitle { font-size: 0.76rem; color: var(--pm-text-muted, #6b7280); }
    .trb-close {
      background: var(--pm-surface-2, #f3f4f6); border: none; font-size: 1rem; cursor: pointer;
      color: var(--pm-text-muted, #6b7280); width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .trb-close:hover { background: rgba(239,68,68,0.12); color: var(--pm-danger, #ef4444); }
    .trb-body { padding: 1.1rem 1.35rem; overflow-y: auto; overflow-x: hidden; flex: 1; }
    .trb-footer {
      display: flex; justify-content: flex-end; gap: 0.6rem;
      padding: 0.9rem 1.35rem; border-top: 1px solid var(--pm-border, #e5e7eb);
    }
    .trb-field { display: block; margin-bottom: 1rem; }
    .trb-field span { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.3rem; color: var(--pm-text-muted, #6b7280); }
    .trb-input, .trb-select {
      width: 100%; padding: 0.55rem 0.7rem; border-radius: 9px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.88rem;
      background: var(--pm-surface-2, #f9fafb); color: var(--pm-text, #111827);
      transition: border-color 0.15s ease;
    }
    .trb-input:focus, .trb-select:focus {
      outline: none; border-color: var(--pm-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }
    .trb-input::placeholder { color: var(--pm-text-muted, #9ca3af); }
    .trb-input-inline { flex: 1; }
    .trb-actions-row { display: flex; gap: 0.5rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
    .trb-btn {
      border-radius: 9px; padding: 0.48rem 0.85rem; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 0.35rem;
      transition: filter 0.15s ease, background 0.15s ease;
    }
    .trb-btn:hover:not(:disabled) { filter: brightness(1.08); }
    .trb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .trb-btn-primary { background: var(--pm-primary, #3b82f6); color: #fff; }
    .trb-btn-secondary { background: var(--pm-surface-2, #f3f4f6); color: var(--pm-text, #111827); border-color: var(--pm-border, #d1d5db); }
    .trb-btn-ghost { background: none; color: var(--pm-text-muted, #6b7280); }
    .trb-btn-ghost:hover:not(:disabled) { background: var(--pm-surface-2, #f3f4f6); }
    .trb-btn-add-unidad {
      background: rgba(59,130,246,0.1); color: var(--pm-primary, #3b82f6);
      width: 100%; justify-content: center; margin-top: 0.6rem; padding: 0.6rem;
    }
    .trb-btn-add-unidad:hover:not(:disabled) { background: rgba(59,130,246,0.16); }
    .trb-btn-add-sub {
      background: none; color: var(--pm-primary, #3b82f6); padding: 0.3rem 0.55rem;
      font-size: 0.78rem; margin-top: 0.35rem; border-radius: 7px;
    }
    .trb-btn-add-sub:hover:not(:disabled) { background: rgba(59,130,246,0.08); }

    /* ── Acordeón Unidad → Objetivo → Indicador ─────────────────────
       Cada nivel es una tarjeta encapsulada, colapsada por defecto: el
       header (chevron + badge + nombre + conteo + borrar) siempre visible,
       el cuerpo (descripción/hijos) solo se renderiza si está expandido. */
    .trb-unidades { display: flex; flex-direction: column; gap: 0.7rem; }
    .trb-unidad {
      border: 1.5px solid var(--pm-border, #e5e7eb); border-left: 4px solid var(--pm-primary, #3b82f6);
      border-radius: 12px; background: var(--pm-surface-2, #fafafa); overflow: hidden;
    }
    .trb-unidad.trb-expanded { box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    .trb-objetivo {
      border: 1px solid var(--pm-border, #e5e7eb); border-left: 3px solid #7c3aed; border-radius: 10px;
      background: var(--pm-surface, #fff); overflow: hidden;
    }

    .trb-card-header {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 0.85rem;
      cursor: pointer; min-width: 0; flex-wrap: wrap;
    }
    .trb-card-header .trb-input-ghost { flex: 1 1 110px; min-width: 90px; }
    .trb-card-header .trb-count-pill { margin-left: 32px; }
    .trb-chevron {
      background: none; border: none; color: var(--pm-text-muted, #6b7280); cursor: pointer;
      padding: 0.15rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      transition: transform 0.18s ease;
    }
    .trb-expanded > .trb-card-header .trb-chevron { transform: rotate(90deg); }
    .trb-card-body { padding: 0 0.85rem 0.85rem; display: flex; flex-direction: column; gap: 0.7rem; }

    .trb-input-ghost {
      background: transparent; border-color: transparent; padding: 0.3rem 0.4rem;
      min-width: 0;
    }
    .trb-input-ghost:hover { background: var(--pm-surface, rgba(0,0,0,0.03)); }
    .trb-input-ghost:focus { background: var(--pm-surface, #fff); border-color: var(--pm-primary, #3b82f6); }

    .trb-count-pill {
      font-size: 0.68rem; font-weight: 700; color: var(--pm-text-muted, #6b7280);
      background: var(--pm-surface, rgba(0,0,0,0.05)); border-radius: 999px;
      padding: 0.2rem 0.5rem; white-space: nowrap; flex-shrink: 0;
    }

    .trb-field-sm span { font-weight: 500; font-style: normal; }
    .trb-field-sm span em { font-style: normal; font-weight: 400; opacity: 0.8; }
    .trb-textarea {
      width: 100%; min-height: 56px; padding: 0.55rem 0.7rem; border-radius: 9px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.85rem; resize: vertical;
      background: var(--pm-surface, #fff); color: var(--pm-text, #111827); font-family: inherit;
    }
    .trb-textarea:focus {
      outline: none; border-color: var(--pm-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }
    .trb-textarea::placeholder { color: var(--pm-text-muted, #9ca3af); }

    .trb-objetivos { display: flex; flex-direction: column; gap: 0.55rem; }
    .trb-indicadores { display: flex; flex-direction: column; gap: 0.5rem; }
    .trb-indicador {
      border: 1px solid var(--pm-border, #e5e7eb); border-radius: 9px;
      padding: 0.5rem; background: var(--pm-surface-2, #f9fafb);
      display: flex; flex-direction: column; gap: 0.4rem; min-width: 0;
    }
    .trb-indicador-row { display: flex; align-items: center; gap: 0.4rem; min-width: 0; }
    .trb-indicador-row .trb-input { min-width: 0; }

    /* ── Prerrequisito: componente atómico (label + chip/agregar + quitar + panel) ── */
    .trb-prereq { position: relative; padding-left: calc(0.7rem + 24px); }
    .trb-prereq-label {
      display: flex; align-items: center; gap: 0.25rem; font-size: 0.68rem;
      color: var(--pm-text-muted, #6b7280); font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.03em; margin-bottom: 0.3rem;
    }
    .trb-prereq-control { display: flex; align-items: center; gap: 0.35rem; }
    .trb-prereq-chip, .trb-prereq-add {
      display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; font-weight: 600;
      border-radius: 999px; padding: 0.3rem 0.65rem; cursor: pointer; border: 1px solid transparent;
      max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .trb-prereq-chip {
      background: rgba(59,130,246,0.12); color: var(--pm-primary, #3b82f6);
      border-color: rgba(59,130,246,0.25);
    }
    .trb-prereq-chip:hover { background: rgba(59,130,246,0.2); }
    .trb-prereq-add {
      background: var(--pm-surface, #fff); color: var(--pm-text-muted, #6b7280);
      border-color: var(--pm-border, #d1d5db); border-style: dashed;
    }
    .trb-prereq-add:hover { border-color: var(--pm-primary, #3b82f6); color: var(--pm-primary, #3b82f6); }
    .trb-prereq-clear { font-size: 0.85rem; padding: 0.25rem; }
    .trb-prereq-panel {
      display: flex; flex-direction: column; gap: 0.2rem; margin-top: 0.4rem;
      border: 1px solid var(--pm-border, #e5e7eb); border-radius: 9px; padding: 0.35rem;
      background: var(--pm-surface, #fff); max-height: 160px; overflow-y: auto;
    }
    .trb-prereq-option {
      text-align: left; background: none; border: none; border-radius: 6px;
      padding: 0.4rem 0.55rem; font-size: 0.8rem; color: var(--pm-text, #111827); cursor: pointer;
    }
    .trb-prereq-option:hover { background: var(--pm-surface-2, #f3f4f6); }
    .trb-prereq-option-active { background: rgba(59,130,246,0.12); color: var(--pm-primary, #3b82f6); font-weight: 600; }
    .trb-prereq-empty { font-size: 0.76rem; color: var(--pm-text-muted, #6b7280); padding: 0.4rem 0.2rem; margin: 0; }

    .trb-badge-orden {
      background: var(--pm-primary, #3b82f6); color: #fff; font-size: 0.7rem; font-weight: 700;
      border-radius: 6px; padding: 0.18rem 0.45rem; flex-shrink: 0;
    }
    .trb-badge-orden-sm { background: #7c3aed; }
    .trb-badge-orden-xs { background: #059669; font-size: 0.65rem; }
    .trb-icon-btn {
      background: none; border: none; color: var(--pm-danger, #ef4444);
      cursor: pointer; font-size: 0.95rem; flex-shrink: 0; padding: 0.3rem;
      border-radius: 7px; transition: background 0.15s ease;
    }
    .trb-icon-btn:hover { background: rgba(239,68,68,0.12); }

    .trb-route-list { display: flex; flex-direction: column; gap: 0.55rem; margin-bottom: 0.85rem; }
    .trb-route-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.7rem 0.9rem; border: 1px solid var(--pm-border, #e5e7eb);
      border-radius: 11px; background: var(--pm-surface-2, #fff); color: var(--pm-text, #111827);
      cursor: pointer; text-align: left; transition: border-color 0.15s ease, background 0.15s ease;
    }
    .trb-route-item:hover { border-color: var(--pm-primary, #3b82f6); background: rgba(59,130,246,0.08); }
    .trb-route-nombre { font-weight: 600; font-size: 0.88rem; }
    .trb-route-meta { font-size: 0.75rem; color: var(--pm-text-muted, #6b7280); }
  `
  document.head.appendChild(s)
}
