import { academicService } from '../../modules/academic-routes/services/academicService';
import { supabase } from '../../lib/supabaseClient';
import { escHTML } from '../utils/portalUtils';

/**
 * Vista para gestionar la planificación semanal de un alumno.
 * @param {HTMLElement} container
 * @param {Object} options - { alumnoId }
 */
export async function renderWeeklyPlanView(container, { alumnoId }) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`;

  try {
    // 1. Obtener el plan académico activo del alumno
    const { data: plan, error: pError } = await supabase
      .from('academic_plans')
      .select('*, route_versions(route_id, version_number, routes(name, instrument_id))')
      .eq('student_id', alumnoId)
      .eq('status', 'in_process')
      .maybeSingle();

    if (pError) throw pError;

    if (!plan) {
      container.innerHTML = `
        <div class="pm-placeholder">
          <i class="bi bi-journal-x"></i>
          <p>El alumno no tiene un plan académico activo.</p>
          <button class="btn-apple-primary mt-3" onclick="window.location.hash='#/ruta-plan-builder?id=${alumnoId}'">
            Asignar Ruta
          </button>
        </div>
      `;
      return;
    }

    // 2. Obtener estructura de la ruta para selección
    const routeStructure = await academicService.getRouteDetail(plan.route_versions.route_id);

    // 3. Obtener planificación existente
    const { data: existingEntries, error: eError } = await supabase
      .from('weekly_plan_entries')
      .select('*')
      .eq('academic_plan_id', plan.id)
      .order('start_date', { ascending: false });

    if (eError) throw eError;

    // 4. Renderizar UI principal
    container.innerHTML = `
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Planificación Semanal</h2>
        <p class="apple-caption">${escHTML(plan.route_versions.routes.name)} - v${plan.route_versions.version_number}</p>
      </div>

      <div class="d-flex gap-2 mb-3">
        <button id="btn-new-week" class="btn-apple-primary flex-grow-1">
          <i class="bi bi-plus-lg"></i> Planificar Semana
        </button>
      </div>

      <div id="entries-list" class="mt-4">
        ${existingEntries.length === 0 ? `
          <div class="pm-placeholder">
            <p>No hay planificación registrada aún.</p>
          </div>
        ` : existingEntries.map(entry => `
          <div class="card-apple mb-3 pm-animate-slide-up" style="padding: 1rem;">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="apple-caption" style="font-weight: 600; color: var(--pm-primary);">
                  Semana ${entry.week_number}
                </span>
                <h4 style="margin: 0.25rem 0; font-size: 1rem;">${entry.focus || 'Sin enfoque definido'}</h4>
                <p class="apple-caption" style="margin: 0;">
                  ${new Date(entry.start_date).toLocaleDateString()} - ${new Date(entry.end_date).toLocaleDateString()}
                </p>
              </div>
              <button class="pm-icon-btn btn-edit-entry" data-id="${entry.id}">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
            <div class="mt-2" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${(entry.planned_nodes || []).map(n => `<span class="badge-apple" style="background: var(--pm-bg-alt); font-size: 0.7rem;">${escHTML(n.title)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Modal / Overlay para nueva entrada (Simplificado como un div que se muestra) -->
      <div id="planning-modal" class="pm-modal-overlay" style="display: none;">
        <div class="pm-modal-content">
          <h3 class="apple-display-sm mb-3">Planificar Semana</h3>
          
          <div class="mb-3">
            <label class="apple-label">Fechas (Inicio - Fin)</label>
            <div class="d-flex gap-2">
              <input type="date" id="start-date" class="input-apple">
              <input type="date" id="end-date" class="input-apple">
            </div>
          </div>

          <div class="mb-3">
            <label class="apple-label">Foco de trabajo</label>
            <input type="text" id="week-focus" class="input-apple" placeholder="Ej: Postura de mano izquierda">
          </div>

          <div class="mb-3">
            <label class="apple-label">Objetivos (Nodos)</label>
            <div id="nodes-checklist" style="max-height: 200px; overflow-y: auto; background: var(--pm-bg-alt); padding: 0.5rem; border-radius: 8px;">
              ${routeStructure.map(block => `
                <div class="mb-2">
                  <small style="font-weight: 700; color: var(--pm-text-muted); text-transform: uppercase; font-size: 0.65rem;">${escHTML(block.name)}</small>
                  ${block.levels.map(level => `
                    ${level.nodes.map(node => `
                      <div class="form-check" style="padding-left: 1.5rem; margin-top: 0.25rem;">
                        <input class="form-check-input node-checkbox" type="checkbox" value="${node.id}" data-title="${escHTML(node.title)}" id="node-${node.id}">
                        <label class="form-check-label" for="node-${node.id}" style="font-size: 0.85rem;">
                          ${escHTML(node.title)}
                        </label>
                      </div>
                    `).join('')}
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="d-flex gap-2">
            <button id="btn-cancel-modal" class="btn-apple-secondary flex-grow-1">Cancelar</button>
            <button id="btn-save-planning" class="btn-apple-primary flex-grow-1">Guardar</button>
          </div>
        </div>
      </div>
    `;

    // Lógica de eventos
    const modal = container.querySelector('#planning-modal');
    const btnNewWeek = container.querySelector('#btn-new-week');
    const btnCancelModal = container.querySelector('#btn-cancel-modal');
    const btnSavePlanning = container.querySelector('#btn-save-planning');

    btnNewWeek.addEventListener('click', () => {
      // Pre-configurar fechas (próxima semana por defecto)
      const now = new Date();
      const nextMon = new Date(now);
      nextMon.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
      const nextSun = new Date(nextMon);
      nextSun.setDate(nextMon.getDate() + 6);

      container.querySelector('#start-date').value = nextMon.toISOString().split('T')[0];
      container.querySelector('#end-date').value = nextSun.toISOString().split('T')[0];
      modal.style.display = 'flex';
    });

    btnCancelModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    btnSavePlanning.addEventListener('click', async () => {
      const startDate = container.querySelector('#start-date').value;
      const endDate = container.querySelector('#end-date').value;
      const focus = container.querySelector('#week-focus').value;
      
      const selectedNodes = Array.from(container.querySelectorAll('.node-checkbox:checked')).map(cb => ({
        node_id: cb.value,
        title: cb.dataset.title
      }));

      // Obtener indicadores automáticamente para esos nodos (simplificación)
      const selectedIndicators = [];
      routeStructure.forEach(b => b.levels.forEach(l => l.nodes.forEach(n => {
        if (selectedNodes.some(sn => sn.node_id === n.id)) {
          n.indicators.forEach(ind => {
            selectedIndicators.push({
              indicator_id: ind.id,
              description: ind.description,
              node_id: n.id,
              node_name: n.title,
              is_critical: n.is_critical
            });
          });
        }
      })));

      try {
        btnSavePlanning.disabled = true;
        btnSavePlanning.innerHTML = '<div class="pm-spinner pm-spinner-sm"></div> Guardando...';

        await academicService.createWeeklyEntry(plan.id, {
          week_number: existingEntries.length + 1,
          start_date: startDate,
          end_date: endDate,
          focus: focus,
          planned_nodes: selectedNodes,
          planned_indicators: selectedIndicators
        });

        alert('Planificación guardada');
        renderWeeklyPlanView(container, { alumnoId }); // Recargar

      } catch (err) {
        alert('Error: ' + err.message);
        btnSavePlanning.disabled = false;
        btnSavePlanning.textContent = 'Guardar';
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${escHTML(err.message)}</p></div>`;
  }
}
