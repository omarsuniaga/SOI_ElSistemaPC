import { supabase } from '../lib/supabaseClient.js';

let tareas = [];
let currentMaestroId = null;
let refreshInterval = null;

export async function renderTareasView(container, { maestroId, departamento = 'ACM', autoRefresh = true }) {
  currentMaestroId = maestroId;
  if (refreshInterval) clearInterval(refreshInterval);

  await cargarTareas(maestroId, departamento);
  renderUI(container, departamento);

  if (autoRefresh) {
    refreshInterval = setInterval(() => {
      cargarTareas(maestroId, departamento);
      actualizarUI(container);
    }, 5 * 60 * 1000);
  }
}

async function cargarTareas(maestroId, departamento) {
  try {
    const { data, error } = await supabase
      .from('tareas_institucionales')
      .select('*')
      .neq('estado', 'cancelada')
      .order('fecha_vencimiento', { ascending: true });

    if (error) throw error;

    tareas = (data || []).filter(t =>
      t.departamento === departamento || t.maestro_id === maestroId
    );

  } catch (err) {
    console.error('Error cargando tareas:', err);
    if (window.AppToast) window.AppToast.show('Error al cargar tareas', 'error');
  }
}

function renderUI(container, departamento) {
  container.innerHTML = `
    <div class="tareas-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0;">📋 Tareas Asignadas</h2>
        <button id="btnRefreshTareas" style="padding: 8px 16px; cursor: pointer; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px;">🔄 Actualizar</button>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <select id="filterEstado" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="">Todos los estados</option>
          <option value="pendiente">⏳ Pendiente</option>
          <option value="en_progreso">⚙️ En Progreso</option>
          <option value="completada">✅ Completada</option>
          <option value="bloqueada">🚫 Bloqueada</option>
        </select>

        <select id="filterPrioridad" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="">Todas las prioridades</option>
          <option value="critica">🔴 Crítica</option>
          <option value="alta">🟠 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">🟢 Baja</option>
        </select>
      </div>

      <div id="tareasList" style="display: flex; flex-direction: column; gap: 12px;"></div>
      <div id="tareasEmpty" style="display: none; text-align: center; padding: 32px; color: #999;">
        <p style="font-size: 48px;">✨</p>
        <p>No hay tareas asignadas</p>
      </div>
    </div>
  `;

  document.getElementById('btnRefreshTareas').addEventListener('click', () => {
    cargarTareas(currentMaestroId, departamento);
    actualizarUI(container);
    if (window.AppToast) window.AppToast.show('Tareas actualizadas', 'success');
  });

  document.getElementById('filterEstado').addEventListener('change', () => actualizarUI(container));
  document.getElementById('filterPrioridad').addEventListener('change', () => actualizarUI(container));

  actualizarUI(container);
}

function actualizarUI(container) {
  const filterEstado = document.getElementById('filterEstado')?.value || '';
  const filterPrioridad = document.getElementById('filterPrioridad')?.value || '';

  let tareasFiltered = tareas.filter(t => {
    if (filterEstado && t.estado !== filterEstado) return false;
    if (filterPrioridad && t.prioridad !== filterPrioridad) return false;
    return true;
  });

  const tareasList = document.getElementById('tareasList');
  const tareasEmpty = document.getElementById('tareasEmpty');

  if (tareasFiltered.length === 0) {
    tareasList.innerHTML = '';
    tareasEmpty.style.display = 'block';
    return;
  }

  tareasEmpty.style.display = 'none';
  tareasList.innerHTML = tareasFiltered.map(t => crearCardTarea(t)).join('');

  tareasFiltered.forEach(t => {
    const card = document.getElementById('tarea-' + t.id);
    if (card) card.addEventListener('click', () => abrirModalTarea(t));
  });
}

function crearCardTarea(tarea) {
  const iconos = { pendiente: '⏳', en_progreso: '⚙️', completada: '✅', bloqueada: '🚫' };
  const colores = { critica: '#dc2626', alta: '#f97316', media: '#eab308', baja: '#22c55e' };

  const checklist = tarea.checklist || [];
  const progreso = checklist.filter(c => c.completado).length;

  const diasRestantes = tarea.fecha_vencimiento ?
    Math.ceil((new Date(tarea.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return `
    <div id="tarea-${tarea.id}" style="padding: 16px; border: 1px solid #ddd; border-left: 4px solid ${colores[tarea.prioridad]}; border-radius: 4px; cursor: pointer;">
      <div style="display: flex; justify-content: space-between;">
        <h3 style="margin: 0 0 8px 0;">${iconos[tarea.estado]} ${tarea.titulo}</h3>
        <span style="background: ${colores[tarea.prioridad]}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;">${tarea.prioridad.toUpperCase()}</span>
      </div>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">${tarea.descripcion ? tarea.descripcion.substring(0, 100) : ''}...</p>
      ${checklist.length > 0 ? '<div style="font-size: 12px; color: #999;">✓ ' + progreso + '/' + checklist.length + '</div>' : ''}
      <div style="font-size: 12px; color: #999; margin-top: 8px;">
        ${tarea.estado.replace('_', ' ').toUpperCase()} • ${diasRestantes !== null ? diasRestantes + ' días' : 'Sin fecha'}
      </div>
    </div>
  `;
}

function abrirModalTarea(tarea) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';

  const content = document.createElement('div');
  content.style.cssText = 'background: white; border-radius: 8px; padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;';
  content.innerHTML = `
    <button style="float: right; border: none; background: none; font-size: 24px; cursor: pointer; padding: 0;">✕</button>
    <h2>${tarea.titulo}</h2>
    <p style="color: #666;">${tarea.descripcion || ''}</p>

    <div style="margin: 16px 0; padding: 12px; background: #f5f5f5; border-radius: 4px;">
      <div style="margin: 8px 0;">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Estado:</label>
        <select id="selectEstado" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completada">Completada</option>
          <option value="bloqueada">Bloqueada</option>
        </select>
      </div>
    </div>

    <div style="margin: 16px 0;">
      <label style="font-weight: bold; display: block; margin-bottom: 4px;">Feedback:</label>
      <textarea id="textareaFeedback" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;" rows="4"></textarea>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 24px;">
      <button id="btnGuardar" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">💾 Guardar</button>
      <button id="btnCancelar" style="flex: 1; padding: 12px; background: #999; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  document.getElementById('selectEstado').value = tarea.estado;
  document.getElementById('textareaFeedback').value = tarea.feedback || '';

  content.querySelector('button').addEventListener('click', () => modal.remove());
  document.getElementById('btnCancelar').addEventListener('click', () => modal.remove());
  document.getElementById('btnGuardar').addEventListener('click', async () => {
    await guardarCambiosTarea(tarea);
    modal.remove();
  });

  modal.addEventListener('click', () => modal.remove());
  content.addEventListener('click', (e) => e.stopPropagation());
}

async function guardarCambiosTarea(tarea) {
  try {
    const nuevoEstado = document.getElementById('selectEstado').value;
    const nuevoFeedback = document.getElementById('textareaFeedback').value;

    const { error } = await supabase
      .from('tareas_institucionales')
      .update({
        estado: nuevoEstado,
        feedback: nuevoFeedback || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', tarea.id);

    if (error) throw error;

    const tareaLocal = tareas.find(t => t.id === tarea.id);
    if (tareaLocal) {
      tareaLocal.estado = nuevoEstado;
      tareaLocal.feedback = nuevoFeedback;
    }

    if (window.AppToast) window.AppToast.show('Tarea actualizada', 'success');
  } catch (err) {
    console.error('Error:', err);
    if (window.AppToast) window.AppToast.show('Error al guardar', 'error');
  }
}

export function limpiarTareasView() {
  if (refreshInterval) clearInterval(refreshInterval);
  tareas = [];
  currentMaestroId = null;
}
