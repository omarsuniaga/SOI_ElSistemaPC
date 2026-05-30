import { RouteConfigAdapter } from '../../services/routeConfigAdapter.js';
import { escHTML } from '../../utils/portalUtils.js';
import { AppModal } from '../../../shared/components/AppModal.js';
import { getMaestroLocal } from '../../auth/maestroAuth.js';

let containerRef = null;
let state = {
  activeClassId: null,
  activeLevelId: null,
  activeNodeId: null,
  activeObjectiveId: null
};

export async function renderRouteConfigurator(container, initialClassId = null) {
  containerRef = container;
  
  if (initialClassId) {
    state.activeClassId = initialClassId;
  }

  container.innerHTML = `
    <div class="pm-rc-container">
      <div class="pm-rc-col" id="pm-rc-classes-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-levels-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-nodes-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-objs-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-inds-wrapper"></div>
    </div>
    <style>
      .pm-rc-container { display: flex; gap: 0; height: 600px; border: 1px solid var(--pm-border); border-radius: 12px; overflow-x: auto; background: var(--pm-surface-2); box-shadow: var(--pm-shadow-sm); }
      .pm-rc-col { flex: 1; min-width: 160px; display: flex; flex-direction: column; border-right: 1px solid var(--pm-border); background: var(--pm-surface); }
      .pm-rc-col:last-child { border-right: none; }
      
      .pm-rc-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid var(--pm-border); background: rgba(255,255,255,0.05); }
      .pm-rc-header h4 { margin: 0; font-size: 0.7rem; font-weight: 800; color: var(--pm-primary); text-transform: uppercase; letter-spacing: 0.8px; }
      
      .pm-rc-btn-add { background: var(--pm-primary); border: none; color: white; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .pm-rc-btn-add:hover { transform: scale(1.1); background: var(--pm-primary-dark); }
      .pm-rc-btn-add i { font-size: 0.9rem; }

      .pm-rc-list { flex: 1; overflow-y: auto; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem; }
      
      .pm-rc-item { padding: 0.7rem 0.9rem; border-radius: 10px; cursor: pointer; border: 1px solid var(--pm-border); transition: all 0.2s; position: relative; display: flex; flex-direction: column; background: var(--pm-surface-3); }
      .pm-rc-item:hover { background: var(--pm-surface-2); border-color: var(--pm-primary); transform: translateX(2px); }
      .pm-rc-item.active { background: var(--pm-primary); border-color: var(--pm-primary); color: white; box-shadow: 0 4px 12px rgba(var(--pm-primary-rgb), 0.3); }
      .pm-rc-item.active .pm-rc-item-sub { color: rgba(255,255,255,0.8); }
      
      .pm-rc-actions { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: none; gap: 4px; }
      .pm-rc-item:hover .pm-rc-actions { display: flex; }
      .pm-rc-btn-action { background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 6px; padding: 4px; font-size: 0.7rem; cursor: pointer; color: var(--pm-text); display: flex; align-items: center; justify-content: center; }
      .pm-rc-btn-action:hover { color: var(--pm-primary); border-color: var(--pm-primary); background: white; }

      .pm-rc-item-text { font-size: 0.85rem; font-weight: 600; line-height: 1.3; word-break: break-word; padding-right: 35px; color: inherit; }
      .pm-rc-item-sub { font-size: 0.65rem; color: var(--pm-text-muted); margin-top: 4px; }
      
      .pm-rc-empty { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; color: var(--pm-text-muted); text-align: center; font-size: 0.8rem; font-style: italic; opacity: 0.6; }
      .pm-rc-ind-card { padding: 0.8rem; border-radius: 10px; border: 1px solid var(--pm-border); font-size: 0.8rem; background: var(--pm-surface-3); display: flex; gap: 0.6rem; color: var(--pm-text); }
      .pm-rc-ind-card i { color: var(--pm-primary); font-size: 1rem; }
    </style>
  `;

  await loadClasses();
}

async function openEditItemModal(type, id, currentValue, onComplete) {
  AppModal.open({
    title: `Editar ${type}`,
    body: `
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del ${type}</label>
        <textarea id="edit-item-content" class="pm-input" style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none; transition:border-color 0.2s;">${escHTML(currentValue)}</textarea>
        <p class="pm-help-text" style="font-size:0.65rem; margin-top:8px; color:var(--pm-text-muted); line-height:1.4;">
          <i class="bi bi-info-circle me-1"></i> Esta modificación afectará a todas las instancias donde se utilice este ${type.toLowerCase()}.
        </p>
      </div>
    `,
    onSave: async (modalBody) => {
      const newValue = modalBody.querySelector('#edit-item-content').value.trim();
      if (!newValue) return false;

      try {
        switch(type) {
          case 'Clase': await RouteConfigAdapter.updateClass(id, newValue); break;
          case 'Nivel': await RouteConfigAdapter.updateLevel(id, { nombre: newValue }); break;
          case 'Tema': await RouteConfigAdapter.updateNode(id, { nombre: newValue }); break;
          case 'Objetivo': await RouteConfigAdapter.updateObjective(id, newValue); break;
          case 'Indicador': await RouteConfigAdapter.updateIndicator(id, { descripcion: newValue }); break;
        }
        onComplete();
        return true;
      } catch (err) {
        console.error('Error saving change:', err);
        alert('Error al guardar: ' + (err.message || 'Error desconocido'));
        return false;
      }
    },
    onDelete: async () => {
      try {
        switch(type) {
          case 'Clase': await RouteConfigAdapter.deleteClass(id); break;
          case 'Nivel': await RouteConfigAdapter.deleteLevel(id); break;
          case 'Tema': await RouteConfigAdapter.deleteNode(id); break;
          case 'Objetivo': await RouteConfigAdapter.deleteObjective(id); break;
          case 'Indicador': await RouteConfigAdapter.deleteIndicator(id); break;
        }
        onComplete();
        return true;
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('No se pudo eliminar: ' + (err.message || 'Error de base de datos'));
        return false;
      }
    }
  });
}

async function openAddItemModal(type, parentId, onComplete) {
  if (!parentId && type !== 'Clase') {
    alert(`Primero seleccioná el elemento superior para agregar un ${type}`);
    return;
  }

  AppModal.open({
    title: `Agregar Nuevo ${type}`,
    body: `
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del Nuevo ${type}</label>
        <textarea id="new-item-content" class="pm-input" placeholder="Escribí aquí..." style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none;"></textarea>
      </div>
    `,
    onSave: async (modalBody) => {
      const value = modalBody.querySelector('#new-item-content').value.trim();
      if (!value) return false;

      try {
        switch(type) {
          case 'Clase': 
            const activeMaestro = getMaestroLocal();
            await RouteConfigAdapter.addClass(value, activeMaestro ? activeMaestro.id : null); 
            break;
          case 'Nivel': await RouteConfigAdapter.addLevel({ clase_id: parentId, nombre: value, numero_nivel: 1 }); break;
          case 'Tema': await RouteConfigAdapter.addNode({ nivel_id: parentId, nombre: value, tipo: 'TECNICA' }); break;
          case 'Objetivo': await RouteConfigAdapter.addObjective({ tema_id: parentId, nombre: value }); break;
          case 'Indicador': await RouteConfigAdapter.addIndicator({ objetivo_id: parentId, descripcion: value, es_requerido: true }); break;
        }
        onComplete();
        return true;
      } catch (err) {
        console.error('Error adding item:', err);
        alert('No se pudo crear: ' + (err.message || 'Error de base de datos'));
        return false;
      }
    }
  });
}

async function loadClasses() {
  const wrapper = document.getElementById('pm-rc-classes-wrapper');
  const activeMaestro = getMaestroLocal();
  const classes = await RouteConfigAdapter.getClasses(activeMaestro ? activeMaestro.id : null);
  
  const currentExists = classes.some(c => c.id === state.activeClassId);
  if (!currentExists && classes.length > 0) {
    state.activeClassId = classes[0].id;
  } else if (classes.length === 0) {
    state.activeClassId = null;
  }

  wrapper.innerHTML = `
    <div class="pm-rc-header">
      <h4>1. Clase</h4> 
      <button class="pm-rc-btn-add" id="btn-add-class" title="Agregar Clase"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${classes.map(c => `
        <div class="pm-rc-item ${state.activeClassId === c.id ? 'active' : ''}" data-id="${c.id}">
          <span class="pm-rc-item-text">${escHTML(c.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-class').onclick = () => openAddItemModal('Clase', null, () => loadClasses());

  if (state.activeClassId) loadLevels(state.activeClassId);
  else renderEmpty('#pm-rc-levels-wrapper', 'Elegí Clase');

  wrapper.querySelectorAll('.pm-rc-item').forEach(el => {
    const id = el.dataset.id;
    
    el.querySelector('.btn-edit').onclick = (e) => {
      e.stopPropagation();
      openEditItemModal('Clase', id, el.querySelector('.pm-rc-item-text').innerText, () => loadClasses());
    };

    el.onclick = () => {
      state.activeClassId = id;
      state.activeLevelId = state.activeNodeId = state.activeObjectiveId = null;
      loadClasses(); loadLevels(id);
      renderEmpty('#pm-rc-nodes-wrapper', 'Elegí Nivel');
      renderEmpty('#pm-rc-objs-wrapper', 'Elegí Tema');
      renderEmpty('#pm-rc-inds-wrapper', 'Elegí Objetivo');
    };
  });
}

async function loadLevels(classId) {
  const wrapper = document.getElementById('pm-rc-levels-wrapper');
  const levels = await RouteConfigAdapter.getLevelsByClass(classId);

  const currentExists = levels.some(l => l.id === state.activeLevelId);
  if (!currentExists && levels.length > 0) {
    state.activeLevelId = levels[0].id;
  } else if (levels.length === 0) {
    state.activeLevelId = null;
  }
  
  wrapper.innerHTML = `
    <div class="pm-rc-header">
      <h4>2. Nivel</h4> 
      <button class="pm-rc-btn-add" id="btn-add-level" title="Agregar Nivel"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${levels.map(l => `
        <div class="pm-rc-item ${state.activeLevelId === l.id ? 'active' : ''}" data-id="${l.id}">
          <span class="pm-rc-item-text">${escHTML(l.nombre)}</span>
          <span class="pm-rc-item-sub">Nivel ${l.numero_nivel}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-level').onclick = () => openAddItemModal('Nivel', classId, () => loadLevels(classId));

  if (state.activeLevelId) loadNodes(state.activeLevelId);
  else renderEmpty('#pm-rc-nodes-wrapper', 'Elegí Nivel');

  wrapper.querySelectorAll('.pm-rc-item').forEach(el => {
    const id = el.dataset.id;

    el.querySelector('.btn-edit').onclick = (e) => {
      e.stopPropagation();
      openEditItemModal('Nivel', id, el.querySelector('.pm-rc-item-text').innerText, () => loadLevels(classId));
    };

    el.onclick = () => {
      state.activeLevelId = id;
      state.activeNodeId = state.activeObjectiveId = null;
      loadLevels(classId); loadNodes(id);
      renderEmpty('#pm-rc-objs-wrapper', 'Elegí Tema');
      renderEmpty('#pm-rc-inds-wrapper', 'Elegí Objetivo');
    };
  });
}

async function loadNodes(levelId) {
  const wrapper = document.getElementById('pm-rc-nodes-wrapper');
  const nodes = await RouteConfigAdapter.getNodesByLevel(levelId);

  const currentExists = nodes.some(n => n.id === state.activeNodeId);
  if (!currentExists && nodes.length > 0) {
    state.activeNodeId = nodes[0].id;
  } else if (nodes.length === 0) {
    state.activeNodeId = null;
  }
  
  wrapper.innerHTML = `
    <div class="pm-rc-header">
      <h4>3. Tema</h4> 
      <button class="pm-rc-btn-add" id="btn-add-node" title="Agregar Tema"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${nodes.map(n => `
        <div class="pm-rc-item ${state.activeNodeId === n.id ? 'active' : ''}" data-id="${n.id}">
          <span class="pm-rc-item-text">${escHTML(n.nombre)}</span>
          <span class="pm-rc-item-badge" style="font-size:0.5rem;background:var(--pm-surface-3);padding:1px 4px;border-radius:3px;margin-top:2px;align-self:flex-start;">${n.tipo}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-node').onclick = () => openAddItemModal('Tema', levelId, () => loadNodes(levelId));

  if (state.activeNodeId) loadObjectives(state.activeNodeId);
  else renderEmpty('#pm-rc-objs-wrapper', 'Elegí Tema');

  wrapper.querySelectorAll('.pm-rc-item').forEach(el => {
    const id = el.dataset.id;

    el.querySelector('.btn-edit').onclick = (e) => {
      e.stopPropagation();
      openEditItemModal('Tema', id, el.querySelector('.pm-rc-item-text').innerText, () => loadNodes(levelId));
    };

    el.onclick = () => {
      state.activeNodeId = id;
      state.activeObjectiveId = null;
      loadNodes(levelId); loadObjectives(id);
      renderEmpty('#pm-rc-inds-wrapper', 'Elegí Objetivo');
    };
  });
}

async function loadObjectives(nodeId) {
  const wrapper = document.getElementById('pm-rc-objs-wrapper');
  const objs = await RouteConfigAdapter.getObjectivesByNode(nodeId);

  const currentExists = objs.some(o => o.id === state.activeObjectiveId);
  if (!currentExists && objs.length > 0) {
    state.activeObjectiveId = objs[0].id;
  } else if (objs.length === 0) {
    state.activeObjectiveId = null;
  }
  
  wrapper.innerHTML = `
    <div class="pm-rc-header">
      <h4>4. Objetivo</h4> 
      <button class="pm-rc-btn-add" id="btn-add-obj" title="Agregar Objetivo"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${objs.map(o => `
        <div class="pm-rc-item ${state.activeObjectiveId === o.id ? 'active' : ''}" data-id="${o.id}">
          <span class="pm-rc-item-text">${escHTML(o.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-obj').onclick = () => openAddItemModal('Objetivo', nodeId, () => loadObjectives(nodeId));

  if (state.activeObjectiveId) loadIndicators(state.activeObjectiveId);
  else renderEmpty('#pm-rc-inds-wrapper', 'Elegí Objetivo');

  wrapper.querySelectorAll('.pm-rc-item').forEach(el => {
    const id = el.dataset.id;

    el.querySelector('.btn-edit').onclick = (e) => {
      e.stopPropagation();
      openEditItemModal('Objetivo', id, el.querySelector('.pm-rc-item-text').innerText, () => loadObjectives(nodeId));
    };

    el.onclick = () => {
      state.activeObjectiveId = id;
      loadObjectives(nodeId); loadIndicators(id);
    };
  });
}

async function loadIndicators(objectiveId) {
  const wrapper = document.getElementById('pm-rc-inds-wrapper');
  const inds = await RouteConfigAdapter.getIndicatorsByObjective(objectiveId);
  
  wrapper.innerHTML = `
    <div class="pm-rc-header">
      <h4>5. Indicador</h4> 
      <button class="pm-rc-btn-add" id="btn-add-ind" title="Agregar Indicador"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${inds.map(i => `
        <div class="pm-rc-ind-card" style="position:relative;">
          <i class="bi ${i.es_requerido ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
          <span class="ind-text">${escHTML(i.descripcion)}</span>
          <div class="pm-rc-actions" style="display:flex;opacity:0.6;">
             <button class="pm-rc-btn-action btn-edit-ind" data-id="${i.id}"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-ind').onclick = () => openAddItemModal('Indicador', objectiveId, () => loadIndicators(objectiveId));

  wrapper.querySelectorAll('.btn-edit-ind').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const current = btn.closest('.pm-rc-ind-card').querySelector('.ind-text').innerText;
      openEditItemModal('Indicador', id, current, () => loadIndicators(objectiveId));
    };
  });
}

function renderEmpty(selector, msg) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = `<div class="pm-rc-empty">${msg}</div>`;
}
