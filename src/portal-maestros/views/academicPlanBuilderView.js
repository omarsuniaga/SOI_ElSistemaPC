import { academicService } from '../../modules/academic-routes/services/academicService';
import { supabase } from '../../lib/supabaseClient';
import { escHTML } from '../utils/portalUtils';

/**
 * Vista para asignar una ruta académica y nivel inicial a un alumno.
 * @param {HTMLElement} container
 * @param {Object} options - { alumnoId }
 */
export async function renderAcademicPlanBuilderView(container, { alumnoId }) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`;

  try {
    // 1. Obtener datos del alumno usando el servicio (DataAdapter Pattern)
    const alumno = await academicService.getStudent(alumnoId);

    // 2. Obtener rutas disponibles
    const routes = await academicService.fetchRoutes();

    // 3. Renderizar formulario inicial
    container.innerHTML = `
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Asignar Ruta</h2>
        <p class="apple-caption">Configura el plan académico para <strong>${escHTML(alumno.name)} ${escHTML(alumno.last_name || '')}</strong></p>
      </div>

      <div class="card-apple pm-animate-slide-up" style="margin-top: 1.5rem; padding: 1.5rem;">
        <div class="mb-4">
          <label class="apple-label" style="display: block; margin-bottom: 0.5rem;">Seleccionar Ruta</label>
          <select id="route-selector" class="input-apple">
            <option value="" disabled selected>Elegí una ruta...</option>
            ${routes.map(r => `<option value="${r.id}">${escHTML(r.name)} (${r.instrument_id || 'General'})</option>`).join('')}
          </select>
        </div>

        <div id="level-selection-container" style="display: none;" class="pm-animate-fade-in">
          <div class="mb-4">
            <label class="apple-label" style="display: block; margin-bottom: 0.5rem;">Nivel Inicial</label>
            <select id="level-selector" class="input-apple">
              <option value="" disabled selected>Cargando niveles...</option>
            </select>
          </div>

          <div id="plan-summary" class="pm-placeholder" style="padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; background: var(--pm-bg-alt);">
            <p class="apple-caption" style="margin: 0;">Seleccioná una ruta y nivel para ver el resumen del plan.</p>
          </div>

          <button id="btn-create-plan" class="btn-apple-primary w-100" disabled>
            Comenzar Plan Académico
          </button>
        </div>
      </div>

      <button class="btn-apple-secondary w-100 mt-3" onclick="window.history.back()">
        Cancelar
      </button>
    `;

    const routeSelector = container.querySelector('#route-selector');
    const levelSelectionContainer = container.querySelector('#level-selection-container');
    const levelSelector = container.querySelector('#level-selector');
    const btnCreatePlan = container.querySelector('#btn-create-plan');
    const planSummary = container.querySelector('#plan-summary');

    let selectedRouteId = null;
    let selectedVersionId = null;
    let routeStructure = null;

    // Evento: Cambio de Ruta
    routeSelector.addEventListener('change', async (e) => {
      selectedRouteId = e.target.value;
      levelSelectionContainer.style.display = 'block';
      levelSelector.innerHTML = '<option value="" disabled selected>Cargando niveles...</option>';
      btnCreatePlan.disabled = true;

      try {
        // Obtener versión actual y estructura
        const { data: vData } = await supabase
          .from('route_versions')
          .select('id')
          .eq('route_id', selectedRouteId)
          .eq('is_current', true)
          .single();
        
        selectedVersionId = vData.id;
        routeStructure = await academicService.getRouteDetail(selectedRouteId);

        // Poblar niveles
        const levels = [];
        routeStructure.forEach(block => {
          block.levels.forEach(level => {
            levels.push({ id: level.id, name: level.name, blockName: block.name });
          });
        });

        levelSelector.innerHTML = `
          <option value="" disabled selected>Seleccioná nivel inicial...</option>
          ${levels.map(l => `<option value="${l.id}">${escHTML(l.blockName)} - ${escHTML(l.name)}</option>`).join('')}
        `;

      } catch (err) {
        console.error('Error loading route detail:', err);
        levelSelector.innerHTML = '<option value="" disabled>Error al cargar niveles</option>';
      }
    });

    // Evento: Cambio de Nivel
    levelSelector.addEventListener('change', () => {
      btnCreatePlan.disabled = false;
      const selectedLevelId = levelSelector.value;
      
      // Buscar nivel en estructura para el resumen
      let levelFound = null;
      routeStructure.forEach(b => {
        const l = b.levels.find(lvl => lvl.id === selectedLevelId);
        if (l) levelFound = { ...l, blockName: b.name };
      });

      if (levelFound) {
        planSummary.innerHTML = `
          <div style="text-align: left;">
            <p class="apple-caption" style="margin-bottom: 0.25rem; font-weight: 600; color: var(--pm-primary);">Resumen del Nivel:</p>
            <h4 style="margin: 0; font-size: 1rem;">${escHTML(levelFound.blockName)} - ${escHTML(levelFound.name)}</h4>
            <p class="apple-caption" style="margin-top: 0.25rem;">
              Contiene ${levelFound.nodes?.length || 0} competencias y 
              ${levelFound.nodes?.reduce((acc, n) => acc + (n.indicators?.length || 0), 0)} indicadores medibles.
            </p>
          </div>
        `;
      }
    });

    // Evento: Crear Plan
    btnCreatePlan.addEventListener('click', async () => {
      btnCreatePlan.disabled = true;
      btnCreatePlan.innerHTML = '<div class="pm-spinner pm-spinner-sm"></div> Creando...';

      try {
        // 1. Crear el plan académico
        const plan = await academicService.createAcademicPlan(alumnoId, selectedVersionId);
        
        // 2. Inicializar progreso del nivel seleccionado (opcional, el trigger lo hará al evaluar)
        // Pero aquí marcamos que ya está en este nivel
        await supabase.from('student_level_progress').upsert({
          student_id: alumnoId,
          level_id: levelSelector.value,
          status: 'in_process'
        });

        // 3. Notificar y redirigir
        alert('Plan académico creado con éxito');
        window.location.hash = `#/alumno?id=${alumnoId}`;

      } catch (err) {
        console.error('Error creating plan:', err);
        alert('Error al crear el plan: ' + err.message);
        btnCreatePlan.disabled = false;
        btnCreatePlan.textContent = 'Comenzar Plan Académico';
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${escHTML(err.message)}</p></div>`;
  }
}
