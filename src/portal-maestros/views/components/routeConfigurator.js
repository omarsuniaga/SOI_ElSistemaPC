import { RouteConfigAdapter } from '../../services/routeConfigAdapter.js';
import { escHTML } from '../../utils/portalUtils.js';

let containerRef = null;
let state = {
  activeLevelId: null,
  activeNodeId: null
};

export async function renderRouteConfigurator(container) {
  containerRef = container;
  container.innerHTML = `
    <div class="pm-rc-container">
      <div class="pm-rc-col" id="pm-rc-levels-wrapper">
        <div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>
      </div>
      <div class="pm-rc-col" id="pm-rc-nodes-wrapper">
        <div class="pm-empty" style="margin-top:2rem;text-align:center;">
          <p>Seleccioná un nivel para ver sus temas.</p>
        </div>
      </div>
      <div class="pm-rc-col" id="pm-rc-inds-wrapper">
        <div class="pm-empty" style="margin-top:2rem;text-align:center;">
          <p>Seleccioná un tema para ver sus objetivos.</p>
        </div>
      </div>
    </div>
    <style>
      .pm-rc-container { display: flex; gap: 0; height: 600px; border: 1px solid var(--pm-border); border-radius: 12px; overflow: hidden; background: var(--pm-surface-2); }
      .pm-rc-col { flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--pm-border); background: var(--pm-surface); }
      .pm-rc-col:last-child { border-right: none; }
      .pm-rc-col-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--pm-border); background: var(--pm-surface-2); }
      .pm-rc-col-header h4 { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--pm-text); }
      .pm-rc-list { flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
      
      .pm-rc-level-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; background: var(--pm-surface); color: var(--pm-text); }
      .pm-rc-level-item:hover { background: var(--pm-surface-2); }
      .pm-rc-level-item.active { background: var(--pm-primary-light, #e6f0ff); border-color: var(--pm-primary); color: var(--pm-primary-dark, #004494); }
      .pm-rc-level-num { width: 32px; height: 32px; background: var(--pm-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: bold; flex-shrink: 0; }
      .pm-rc-level-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .pm-rc-level-info strong { font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: inherit; }
      .pm-rc-level-info span { font-size: 0.7rem; color: var(--pm-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      
      .pm-rc-node-item { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem; border-radius: 8px; cursor: pointer; border: 1px solid var(--pm-border); transition: all 0.2s; background: var(--pm-surface); color: var(--pm-text); }
      .pm-rc-node-item:hover { border-color: var(--pm-primary); }
      .pm-rc-node-item.active { background: var(--pm-primary-light, #e6f0ff); border-color: var(--pm-primary); color: var(--pm-primary-dark, #004494); }
      .pm-rc-node-title { font-size: 0.85rem; font-weight: 600; }
      .pm-rc-node-type { font-size: 0.65rem; color: var(--pm-text-muted); text-transform: uppercase; font-weight: 600; }
      
      .pm-rc-ind-item { padding: 0.75rem; border-radius: 8px; border: 1px solid var(--pm-border); font-size: 0.8rem; background: var(--pm-surface); color: var(--pm-text); display: flex; align-items: flex-start; gap: 0.5rem; }
      .pm-rc-ind-item i { color: var(--pm-primary); margin-top: 2px; }

      /* MODAL STYLES (Custom Portal UI) */
      .pm-modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(2px); }
      .pm-modal-content { background: var(--pm-surface); border-radius: 12px; width: 90%; max-width: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; animation: pmSlideUp 0.3s ease; }
      @keyframes pmSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .pm-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--pm-border); }
      .pm-modal-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-text); display: flex; align-items: center; gap: 0.5rem; }
      .pm-modal-close { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--pm-text-muted); }
      .pm-modal-body { padding: 1.5rem; }
      .pm-modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--pm-border); display: flex; justify-content: flex-end; gap: 0.75rem; background: var(--pm-surface-2); }
      .pm-toast { position: fixed; bottom: 20px; right: 20px; background: var(--pm-surface); border: 1px solid var(--pm-border); padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 3000; display: flex; align-items: center; font-weight: 500; transition: opacity 0.3s ease; }
      .pm-rc-form-group { margin-bottom: 1rem; }
      .pm-rc-form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.3rem; color: var(--pm-text); }
      .pm-rc-form-group input[type="text"], .pm-rc-form-group input[type="number"], .pm-rc-form-group select, .pm-rc-form-group textarea { width: 100%; padding: 0.6rem; border: 1px solid var(--pm-border); border-radius: 6px; background: var(--pm-surface); color: var(--pm-text); font-family: inherit; }
      .pm-rc-form-group input[type="checkbox"] { margin-right: 0.5rem; }
      .pm-rc-form-check { display: flex; align-items: center; font-size: 0.9rem; margin-top: 0.5rem; }
    </style>
  `;

  await loadLevels();
}

async function loadLevels() {
  const wrapper = containerRef.querySelector('#pm-rc-levels-wrapper');
  if(!wrapper) return;

  const levels = await RouteConfigAdapter.getLevels();
  
  wrapper.innerHTML = `
    <div class="pm-rc-col-header">
      <h4>Niveles</h4>
      <button class="pm-btn pm-btn-sm pm-btn-primary" id="btn-add-level" title="Agregar Nivel"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${levels.length === 0 ? '<p class="pm-empty" style="text-align:center;padding:1rem;">No hay niveles.</p>' : ''}
      ${levels.map(l => `
        <div class="pm-rc-level-item ${state.activeLevelId === l.id ? 'active' : ''}" data-id="${l.id}">
          <div class="pm-rc-level-num">${l.level_number}</div>
          <div class="pm-rc-level-info">
            <strong>${escHTML(l.name)}</strong>
            <span>${escHTML(l.main_objective || '')}</span>
          </div>
          <i class="bi bi-chevron-right"></i>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-level').onclick = () => openAddLevelModal();

  wrapper.querySelectorAll('.pm-rc-level-item').forEach(item => {
    item.onclick = () => {
      const id = parseInt(item.getAttribute('data-id'));
      state.activeLevelId = id;
      state.activeNodeId = null;
      loadLevels(); 
      loadNodes(id);
      
      const indsWrapper = containerRef.querySelector('#pm-rc-inds-wrapper');
      indsWrapper.innerHTML = `<div class="pm-empty" style="margin-top:2rem;text-align:center;"><p>Seleccioná un tema para ver sus objetivos.</p></div>`;
    };
  });
}

async function loadNodes(levelId) {
  const wrapper = containerRef.querySelector('#pm-rc-nodes-wrapper');
  if(!wrapper) return;

  wrapper.innerHTML = `<div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>`;
  const nodes = await RouteConfigAdapter.getNodesByLevel(levelId);

  wrapper.innerHTML = `
    <div class="pm-rc-col-header">
      <h4>Temas (Nodos)</h4>
      <button class="pm-btn pm-btn-sm pm-btn-primary" id="btn-add-node" title="Agregar Tema"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${nodes.length === 0 ? '<p class="pm-empty" style="text-align:center;padding:1rem;">No hay temas en este nivel.</p>' : ''}
      ${nodes.map(n => `
        <div class="pm-rc-node-item ${state.activeNodeId === n.id ? 'active' : ''}" data-id="${n.id}">
          <span class="pm-rc-node-title">${escHTML(n.name)}</span>
          <span class="pm-rc-node-type">${escHTML(n.type)} ${n.is_critical ? '<span style="color:var(--pm-danger);">• CRÍTICO</span>' : ''}</span>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-node').onclick = () => openAddNodeModal(levelId);

  wrapper.querySelectorAll('.pm-rc-node-item').forEach(item => {
    item.onclick = () => {
      const id = parseInt(item.getAttribute('data-id'));
      state.activeNodeId = id;
      loadNodes(levelId); 
      loadIndicators(id);
    };
  });
}

async function loadIndicators(nodeId) {
  const wrapper = containerRef.querySelector('#pm-rc-inds-wrapper');
  if(!wrapper) return;

  wrapper.innerHTML = `<div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>`;
  const inds = await RouteConfigAdapter.getIndicatorsByNode(nodeId);

  wrapper.innerHTML = `
    <div class="pm-rc-col-header">
      <h4>Objetivos (Indicadores)</h4>
      <button class="pm-btn pm-btn-sm pm-btn-primary" id="btn-add-ind" title="Agregar Objetivo"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${inds.length === 0 ? '<p class="pm-empty" style="text-align:center;padding:1rem;">No hay objetivos.</p>' : ''}
      ${inds.map(i => `
        <div class="pm-rc-ind-item">
          <i class="bi ${i.is_required ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
          <span>${escHTML(i.description)}</span>
        </div>
      `).join('')}
    </div>
  `;

  wrapper.querySelector('#btn-add-ind').onclick = () => openAddIndicatorModal(nodeId);
}

// === CUSTOM PORTAL UI MODAL & TOAST ===

function showPortalToast(message) {
  const toastId = 'pm-toast-' + Date.now();
  const toastHTML = `
    <div id="${toastId}" class="pm-toast">
      <i class="bi bi-check-circle-fill" style="color:var(--pm-primary); margin-right:8px;"></i>
      ${escHTML(message)}
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', toastHTML);
  const toastEl = document.getElementById(toastId);
  setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => toastEl.remove(), 300);
  }, 3000);
}

function showPortalModal({ title, bodyHtml, onSave, saveText = 'Guardar' }) {
  const modalId = 'pm-rc-modal-' + Date.now();
  const modalHTML = `
    <div id="${modalId}" class="pm-modal-backdrop">
      <div class="pm-modal-content">
        <div class="pm-modal-header">
          <h5 class="pm-modal-title">${title}</h5>
          <button type="button" class="pm-modal-close" aria-label="Close"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="pm-modal-body">
          ${bodyHtml}
        </div>
        <div class="pm-modal-footer">
          <button type="button" class="pm-btn pm-btn-secondary pm-modal-btn-cancel" style="background:transparent;color:var(--pm-text);border:1px solid var(--pm-border);">Cancelar</button>
          <button type="button" class="pm-btn pm-btn-primary pm-modal-btn-save">${saveText}</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalEl = document.getElementById(modalId);

  const closeModal = () => modalEl.remove();

  modalEl.querySelector('.pm-modal-close').onclick = closeModal;
  modalEl.querySelector('.pm-modal-btn-cancel').onclick = closeModal;
  modalEl.querySelector('.pm-modal-btn-save').onclick = async () => {
    await onSave(closeModal);
  };
}

// === FORMS ===

function openAddLevelModal() {
  const body = `
    <div class="pm-rc-form-group">
      <label>Número de Nivel</label>
      <input type="number" id="inp-level-num" required>
    </div>
    <div class="pm-rc-form-group">
      <label>Nombre del Nivel</label>
      <input type="text" id="inp-level-name" placeholder="Ej: Inicio corporal y sonoro" required>
    </div>
    <div class="pm-rc-form-group">
      <label>Objetivo Principal</label>
      <textarea id="inp-level-obj" rows="2" placeholder="Opcional"></textarea>
    </div>
  `;

  showPortalModal({
    title: '<i class="bi bi-layer-forward text-primary"></i> Agregar Nivel',
    bodyHtml: body,
    saveText: 'Guardar Nivel',
    onSave: async (closeFn) => {
      const num = document.getElementById('inp-level-num').value;
      const name = document.getElementById('inp-level-name').value;
      const obj = document.getElementById('inp-level-obj').value;

      if(!num || !name) {
        alert('El número y nombre son obligatorios');
        return;
      }

      await RouteConfigAdapter.addLevel({ level_number: parseInt(num), name, main_objective: obj });
      showPortalToast('Nivel agregado al Mock');
      closeFn();
      loadLevels();
    }
  });
}

function openAddNodeModal(levelId) {
  const body = `
    <div class="pm-rc-form-group">
      <label>Nombre del Tema</label>
      <input type="text" id="inp-node-name" placeholder="Ej: Postura corporal" required>
    </div>
    <div class="pm-rc-form-group">
      <label>Categoría / Tipo</label>
      <select id="inp-node-type">
        <option value="TECNICA">Técnica</option>
        <option value="SONIDO">Sonido</option>
        <option value="AFINACION">Afinación</option>
        <option value="ARCO">Arco</option>
        <option value="MANO_IZQ">Mano Izquierda</option>
        <option value="REPERTORIO">Repertorio</option>
      </select>
    </div>
    <div class="pm-rc-form-check">
      <input type="checkbox" id="inp-node-crit">
      <label for="inp-node-crit" style="color:var(--pm-danger); margin:0;">¿Es un tema CRÍTICO?</label>
    </div>
  `;

  showPortalModal({
    title: '<i class="bi bi-journal-plus text-primary"></i> Agregar Tema',
    bodyHtml: body,
    saveText: 'Guardar Tema',
    onSave: async (closeFn) => {
      const name = document.getElementById('inp-node-name').value;
      const type = document.getElementById('inp-node-type').value;
      const crit = document.getElementById('inp-node-crit').checked;

      if(!name) {
        alert('El nombre es obligatorio');
        return;
      }

      await RouteConfigAdapter.addNode({ level_id: levelId, name, type, is_critical: crit });
      showPortalToast('Tema agregado al Mock');
      closeFn();
      loadNodes(levelId);
    }
  });
}

function openAddIndicatorModal(nodeId) {
  const body = `
    <div class="pm-rc-form-group">
      <label>Descripción del Objetivo</label>
      <textarea id="inp-ind-desc" rows="3" placeholder="Ej: Sostiene el arco correctamente" required></textarea>
    </div>
    <div class="pm-rc-form-check">
      <input type="checkbox" id="inp-ind-req" checked>
      <label for="inp-ind-req" style="margin:0;">¿Es obligatorio para aprobar el tema?</label>
    </div>
  `;

  showPortalModal({
    title: '<i class="bi bi-bullseye text-primary"></i> Agregar Objetivo',
    bodyHtml: body,
    saveText: 'Guardar Objetivo',
    onSave: async (closeFn) => {
      const desc = document.getElementById('inp-ind-desc').value;
      const req = document.getElementById('inp-ind-req').checked;

      if(!desc) {
        alert('La descripción es obligatoria');
        return;
      }

      await RouteConfigAdapter.addIndicator({ node_id: nodeId, description: desc, is_required: req });
      showPortalToast('Objetivo agregado al Mock');
      closeFn();
      loadIndicators(nodeId);
    }
  });
}
