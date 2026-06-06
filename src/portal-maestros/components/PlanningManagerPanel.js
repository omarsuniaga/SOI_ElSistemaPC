/**
 * PlanningManagerPanel.js
 * Gestor CRUD del currículo sobre la VERSIÓN BORRADOR propia del maestro.
 *
 * Al abrir, obtiene/crea el borrador (clon de la versión publicada) y muestra
 * un árbol editable: bloques → niveles → nodos → indicadores, con acciones
 * +/✏️/🗑️ en cada nivel. La versión publicada nunca se modifica.
 */

import {
  getOrCreateDraftVersion,
  addLevel,
  updateLevel,
  deleteLevel,
  addNode,
  updateNode,
  deleteNode,
  addIndicator,
  updateIndicator,
  deleteIndicator,
} from '../../modules/planning/services/curriculumAdminService.js'
import { getRouteVersionHierarchy } from '../../modules/planning/services/planningService.js'
import { escHTML } from '../utils/portalUtils.js'
import { AppModal } from '../../shared/components/AppModal.js'
import { AppToast } from '../../shared/components/AppToast.js'

/**
 * @param {HTMLElement} container
 * @param {{ publishedRouteVersionId: string, maestroId: string, onChanged?: Function }} opts
 */
export async function renderPlanningManager(container, { publishedRouteVersionId, onChanged }) {
  container.innerHTML =
    '<div class="pm-planning-empty"><p>Preparando tu borrador editable…<br><small>La primera vez puede tardar unos segundos.</small></p></div>'

  let draftVersionId
  try {
    draftVersionId = await getOrCreateDraftVersion(publishedRouteVersionId)
  } catch (err) {
    console.error('[manager] Error creando borrador:', err)
    container.innerHTML =
      '<div class="pm-planning-empty"><p>No se pudo crear tu borrador editable. Intenta de nuevo.</p></div>'
    return
  }

  async function _reload() {
    let blocks
    try {
      blocks = await getRouteVersionHierarchy(draftVersionId)
    } catch (err) {
      console.error('[manager] Error cargando borrador:', err)
      container.innerHTML =
        '<div class="pm-planning-empty"><p>Error al cargar el borrador.</p></div>'
      return
    }
    _render(blocks)
    onChanged?.()
  }

  function _render(blocks) {
    const html = `
      <style>
        .pm-mg-banner { background: var(--pm-warning-light, #fef3c7); color: var(--pm-warning-dark, #92400e); border-radius: 10px; padding: 0.6rem 0.9rem; font-size: 0.8rem; margin-bottom: 1rem; }
        .pm-mg-block { border: 1px solid var(--pm-border); border-radius: 12px; margin-bottom: 0.75rem; overflow: hidden; }
        .pm-mg-block-head { padding: 0.8rem 1rem; background: var(--pm-surface-2); display: flex; align-items: center; gap: 0.5rem; }
        .pm-mg-block-name { font-weight: 700; flex: 1; }
        .pm-mg-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-top: 1px solid var(--pm-border); }
        .pm-mg-level { padding-left: 1.25rem; }
        .pm-mg-node { padding-left: 2.25rem; background: var(--pm-surface); }
        .pm-mg-indicator { padding-left: 3.25rem; font-size: 0.82rem; color: var(--pm-text-muted); }
        .pm-mg-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pm-mg-num { width: 22px; height: 22px; border-radius: 50%; background: var(--pm-primary); color: #fff; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pm-mg-act { background: none; border: 1px solid var(--pm-border); border-radius: 6px; padding: 0.2rem 0.45rem; cursor: pointer; font-size: 0.8rem; line-height: 1; color: var(--pm-text); }
        .pm-mg-act:hover { background: var(--pm-surface-2); }
        .pm-mg-act-add { border-color: var(--pm-primary); color: var(--pm-primary); font-weight: 600; }
        @media (max-width: 640px) {
          .pm-mg-row { flex-wrap: wrap; padding: 0.5rem 0.6rem; }
          .pm-mg-node { padding-left: 1.25rem; }
          .pm-mg-indicator { padding-left: 1.75rem; }
          .pm-mg-act { min-height: 36px; }
        }
      </style>
      <div class="pm-mg-banner">
        ✏️ Estás editando <strong>tu borrador propio</strong>. La ruta publicada que ven los demás maestros no se modifica.
      </div>
      ${
        blocks.length === 0
          ? '<div class="pm-planning-empty"><p>El borrador no tiene bloques.</p></div>'
          : blocks.map((b) => _blockHtml(b)).join('')
      }
    `
    container.innerHTML = html
    _wire()
  }

  function _blockHtml(block) {
    return `
      <div class="pm-mg-block">
        <div class="pm-mg-block-head">
          <span class="pm-mg-block-name">${escHTML(block.name || 'Bloque')}</span>
          <button class="pm-mg-act pm-mg-act-add" data-action="add-level" data-block="${block.id}">+ Nivel</button>
        </div>
        ${(block.levels || []).map((l) => _levelHtml(l)).join('')}
      </div>
    `
  }

  function _levelHtml(level) {
    return `
      <div class="pm-mg-row pm-mg-level">
        <span class="pm-mg-num">${level.level_number ?? '·'}</span>
        <span class="pm-mg-label"><strong>${escHTML(level.name || 'Nivel')}</strong></span>
        <button class="pm-mg-act pm-mg-act-add" data-action="add-node" data-level="${level.id}">+ Nodo</button>
        <button class="pm-mg-act" data-action="edit-level" data-id="${level.id}" data-name="${escHTML(level.name || '')}">✏️</button>
        <button class="pm-mg-act" data-action="del-level" data-id="${level.id}">🗑️</button>
      </div>
      ${(level.nodes || []).map((n) => _nodeHtml(n)).join('')}
    `
  }

  function _nodeHtml(node) {
    return `
      <div class="pm-mg-row pm-mg-node">
        <span class="pm-mg-label">${escHTML(node.name || 'Nodo')}</span>
        <button class="pm-mg-act pm-mg-act-add" data-action="add-indicator" data-node="${node.id}">+ Indicador</button>
        <button class="pm-mg-act" data-action="edit-node" data-id="${node.id}" data-name="${escHTML(node.name || '')}">✏️</button>
        <button class="pm-mg-act" data-action="del-node" data-id="${node.id}">🗑️</button>
      </div>
      ${(node.indicators || []).map((i) => _indicatorHtml(i)).join('')}
    `
  }

  function _indicatorHtml(ind) {
    const label = ind.nombre || ind.description || 'Indicador'
    return `
      <div class="pm-mg-row pm-mg-indicator">
        <span class="pm-mg-label">${escHTML(label)}</span>
        <button class="pm-mg-act" data-action="edit-indicator" data-id="${ind.id}" data-name="${escHTML(label)}">✏️</button>
        <button class="pm-mg-act" data-action="del-indicator" data-id="${ind.id}">🗑️</button>
      </div>
    `
  }

  function _promptText({ title, label, value = '', onSubmit }) {
    AppModal.open({
      title,
      size: 'sm',
      body: `
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem;">${escHTML(label)}</label>
        <input id="pm-mg-input" type="text" value="${escHTML(value)}"
          style="width:100%; padding:0.6rem; border:1px solid var(--pm-border); border-radius:8px; font-size:0.95rem;" />
      `,
      saveText: 'Guardar',
      onSave: async () => {
        const val = document.getElementById('pm-mg-input')?.value?.trim()
        if (!val) {
          AppToast.error('El nombre no puede estar vacío')
          return false // mantener el modal abierto
        }
        await onSubmit(val) // AppModal cierra solo al resolver
      },
    })
  }

  function _confirmDelete({ title, message, onConfirm }) {
    // Usamos onSave (no onDelete) porque onDelete dispara un confirm() nativo extra.
    AppModal.open({
      title,
      size: 'sm',
      body: `<p style="font-size:0.9rem;">${escHTML(message)}</p>`,
      saveText: 'Eliminar',
      onSave: async () => {
        await onConfirm()
      },
    })
  }

  async function _run(fn, successMsg) {
    try {
      await fn()
      AppToast.success(successMsg)
      await _reload()
    } catch (err) {
      console.error('[manager] Error:', err)
      AppToast.error('No se pudo guardar el cambio')
    }
  }

  function _wire() {
    container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action
        const id = btn.dataset.id

        if (a === 'add-level') {
          return _promptText({
            title: 'Nuevo nivel',
            label: 'Nombre del nivel',
            onSubmit: (name) =>
              _run(
                () => addLevel({ blockId: btn.dataset.block, routeVersionId: draftVersionId, name }),
                'Nivel creado',
              ),
          })
        }
        if (a === 'edit-level') {
          return _promptText({
            title: 'Editar nivel',
            label: 'Nombre del nivel',
            value: btn.dataset.name,
            onSubmit: (name) => _run(() => updateLevel(id, { name }), 'Nivel actualizado'),
          })
        }
        if (a === 'del-level') {
          return _confirmDelete({
            title: 'Eliminar nivel',
            message: 'Se eliminará el nivel y todo su contenido del borrador. ¿Continuar?',
            onConfirm: () => _run(() => deleteLevel(id), 'Nivel eliminado'),
          })
        }
        if (a === 'add-node') {
          return _promptText({
            title: 'Nuevo nodo/tema',
            label: 'Nombre del nodo',
            onSubmit: (name) =>
              _run(
                () => addNode({ levelId: btn.dataset.level, routeVersionId: draftVersionId, name }),
                'Nodo creado',
              ),
          })
        }
        if (a === 'edit-node') {
          return _promptText({
            title: 'Editar nodo',
            label: 'Nombre del nodo',
            value: btn.dataset.name,
            onSubmit: (name) => _run(() => updateNode(id, { name }), 'Nodo actualizado'),
          })
        }
        if (a === 'del-node') {
          return _confirmDelete({
            title: 'Eliminar nodo',
            message: 'Se eliminará el nodo y sus indicadores del borrador. ¿Continuar?',
            onConfirm: () => _run(() => deleteNode(id), 'Nodo eliminado'),
          })
        }
        if (a === 'add-indicator') {
          return _promptText({
            title: 'Nuevo indicador',
            label: 'Texto del indicador',
            onSubmit: (nombre) =>
              _run(() => addIndicator({ nodeId: btn.dataset.node, nombre }), 'Indicador creado'),
          })
        }
        if (a === 'edit-indicator') {
          return _promptText({
            title: 'Editar indicador',
            label: 'Texto del indicador',
            value: btn.dataset.name,
            onSubmit: (nombre) =>
              _run(() => updateIndicator(id, { nombre, description: nombre }), 'Indicador actualizado'),
          })
        }
        if (a === 'del-indicator') {
          return _confirmDelete({
            title: 'Eliminar indicador',
            message: 'El indicador se marcará como inactivo en tu borrador. ¿Continuar?',
            onConfirm: () => _run(() => deleteIndicator(id), 'Indicador eliminado'),
          })
        }
      })
    })
  }

  await _reload()
}
