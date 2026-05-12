/**
 * Modal de Planificación Profesional
 * Diseño Apple-style con campos organizados en secciones.
 */

import { Planificacion } from '../models/planificacion.model.js';
import { createDslEditorWithToolbar } from './dslToolbar.js';
import { createAlumnoPickerModal } from './alumnoPickerModal.js';
import { getAlumnos } from '../../alumnos/api/alumnosApi.js';

export const PLANTILLAS_PLANIFICACION = [
  {
    id: 'tecnica',
    nombre: 'Técnica',
    objetivos: 'Desarrollar la técnica instrumental del alumno.\n- Postura correcta\n- Digitación\n- Control del tempo\n- Calidad del sonido',
    contenido: 'Ejercicios de técnica:\n1. Escalas mayores y menores\n2. Arpegios\n3. Ejercicios de digitación\n4. Estudios técnicos',
    recursos: 'Método del nivel, estudios técnicos, metrónomo',
    evaluacion_metodo: 'Observación directa, ejecución de escalas sin errores',
  },
  {
    id: 'teoria',
    nombre: 'Teoría Musical',
    objetivos: 'Comprender los fundamentos teóricos de la música.\n- Lectura rítmica\n- Reconocimiento de intervalos\n- Armonía básica\n- Análisis de obras',
    contenido: 'Contenidos:\n1. Teoría musical básica\n2. Lectura a primera vista\n3. Dictado melódico\n4. Análisis armónico',
    recursos: 'Libro de teoría, cuaderno de ejercicios, pizarra',
    evaluacion_metodo: 'Prueba escrita, lectura a primera vista, dictados',
  },
  {
    id: 'repertorio',
    nombre: 'Repertorio',
    objetivos: 'Desarrollar el repertorio musical del alumno.\n- Interpretación de obras\n- Expresión musical\n- Memorización\n- Presentación en público',
    contenido: 'Obras del programa:\n1. Pieza de repertorio\n2. Ejercicios de interpretación\n3. Trabajo de dinámica y fraseo\n4. Práctica con acompañamiento',
    recursos: 'Partituras, grabaciones de referencia, piano acompañante',
    evaluacion_metodo: 'Audición interna, evaluación de interpretación',
  },
  {
    id: 'improvisacion',
    nombre: 'Improvisación',
    objetivos: 'Fomentar la creatividad musical y la improvisación.\n- Exploración sonora\n- Improvisación libre\n- Improvisación estructurada\n- Composición guiada',
    contenido: 'Actividades:\n1. Ejercicios de exploración sonora\n2. Improvisación libre\n3. Improvisación sobre cambios armónicos\n4. Composición guiada',
    recursos: 'Instrumento, pistas de acompañamiento, grabadora',
    evaluacion_metodo: 'Observación de creatividad, coherencia musical',
  },
  {
    id: 'audicion',
    nombre: 'Audición',
    objetivos: 'Desarrollar la capacidad de escuchar y analizar música.\n- Escucha activa\n- Identificación de elementos\n- Análisis formal\n- Reseñas musicales',
    contenido: 'Actividades:\n1. Audición de obras del repertorio\n2. Identificación de instrumentos\n3. Análisis de forma y estructura\n4. Discusión y reseña',
    recursos: 'Audio, videos, partituras de referencia',
    evaluacion_metodo: 'Participación en discusión, trabajo escrito',
  },
  {
    id: 'blanco',
    nombre: 'En blanco',
    objetivos: '',
    contenido: '',
    recursos: '',
    evaluacion_metodo: '',
  },
];

/**
 * Abre el modal de planificación
 * @param {string} mode - 'create' o 'edit'
 * @param {object} data - Datos de la planificación a editar
 * @param {array} clases - Lista de clases disponibles
 * @param {array} maestros - Lista de maestros
 * @param {object} initialData - Datos iniciales para préllenar (para flujo "Copiar como planificación")
 * @param {function} onSave - Callback cuando se guarda
 */
export function openPlanificacionModal(mode, data = null, clases = [], maestros = [], initialData = {}, onSave) {
  const isEdit = mode === 'edit' && !!data;
  
  // Crear plan con datos iniciales o de edición
  const planData = isEdit ? data : { ...initialData };
  
  // Si hay contenido DSL pero no notas_dsl, mapear contenido -> notas_dsl
  if (!isEdit && initialData.contenido && !planData.notas_dsl) {
    planData.notas_dsl = initialData.contenido;
  }
  
  // Si hay nombre del maestro pero no está en la lista de maestros, agregarlo
  if (!isEdit && initialData.maestro_nombre && !maestros.find(m => m.nombre === initialData.maestro_nombre)) {
    maestros = [{
      id: initialData.maestro_id,
      nombre: initialData.maestro_nombre
    }, ...maestros];
  }
  
  const plan = isEdit ? new Planificacion(planData) : new Planificacion(planData);

  // Crear modal standalone con estilos propios
  let modalEl = document.getElementById('pm-planificacion-modal');
  if (modalEl) modalEl.remove();

  modalEl = document.createElement('div');
  modalEl.id = 'pm-planificacion-modal';
  modalEl.className = 'pm-plan-modal-overlay';
  modalEl.innerHTML = _buildModalHTML(isEdit, plan, clases, maestros);
  document.body.appendChild(modalEl);

  // Injectar estilos si no existen
  if (!document.getElementById('pm-plan-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'pm-plan-modal-styles';
    style.textContent = _getModalStyles();
    document.head.appendChild(style);
  }

  const closeModal = () => {
    modalEl.classList.remove('open');
    setTimeout(() => modalEl.remove(), 200);
  };

  // Wire eventos
  modalEl.querySelector('.pm-plan-close-x').onclick = closeModal;
  modalEl.querySelector('.pm-plan-cancel-btn').onclick = closeModal;
  modalEl.querySelector('.pm-plan-backdrop').onclick = closeModal;

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Template selector
  const templateSelect = modalEl.querySelector('#pl-plantilla');
  if (templateSelect) {
    templateSelect.addEventListener('change', (e) => {
      const template = PLANTILLAS_PLANIFICACION.find(t => t.id === e.target.value);
      if (template && template.id !== 'blanco') {
        modalEl.querySelector('#pl-objetivos').value = template.objetivos;
        modalEl.querySelector('#pl-contenido').value = template.contenido;
        modalEl.querySelector('#pl-recursos').value = template.recursos;
        modalEl.querySelector('#pl-evaluacion').value = template.evaluacion_metodo;
        _updateAllCounters(modalEl);
      }
    });
  }

  // Clase change → actualizar instrumentos
  const claseSelect = modalEl.querySelector('#pl-clase_id');
  if (claseSelect) {
    claseSelect.addEventListener('change', () => {
      const instrSelect = modalEl.querySelector('#pl-instrumento');
      if (instrSelect) {
        const selected = instrSelect.value;
        instrSelect.innerHTML = `<option value="">Todos los instrumentos</option>${
          _buildInstrumentoOptions(clases, claseSelect.value, null)
        }`;
        if (instrSelect.querySelector(`option[value="${selected}"]`)) {
          instrSelect.value = selected;
        }
      }
    });
  }

  // Char counters
  _initCounters(modalEl);

  // DSL Editor setup
  const dslContainer = modalEl.querySelector('#dsl-editor-container');
  if (dslContainer) {
    const pickerModal = createAlumnoPickerModal({
      onSelect: async (alumnoIds) => {
        const allAlumnos = await getAlumnos();
        const selected = allAlumnos.filter(a => alumnoIds.includes(a.id));
        const mentions = selected.map(a => `#${a.nombre_completo}`).join(', ');
        if (dslEditor.component) {
          dslEditor.component.insertText(mentions + ' ');
        }
      },
    });
    document.body.appendChild(pickerModal);

    const dslEditor = createDslEditorWithToolbar({
      initialContent: plan.notas_dsl || '',
      onChange: (content, parsed) => {
        const summaryEl = modalEl.querySelector('#dsl-summary');
        if (summaryEl) {
          summaryEl.textContent = _getDslSummary(parsed);
        }
      },
      onAlumnoClick: () => pickerModal.openModal(),
    });

    dslContainer.appendChild(dslEditor);
    modalEl._dslEditor = dslEditor;
  }

  // Save button
  const saveBtn = modalEl.querySelector('.pm-plan-save-btn');
  saveBtn.onclick = async () => {
    const tema = modalEl.querySelector('#pl-tema')?.value.trim();
    const claseId = modalEl.querySelector('#pl-clase_id')?.value;

    if (!tema) {
      modalEl.querySelector('#pl-tema').focus();
      return;
    }
    if (!claseId) {
      modalEl.querySelector('#pl-clase_id').focus();
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="pm-plan-spinner"></span> Guardando...';

    try {
      const recursosRaw = modalEl.querySelector('#pl-recursos')?.value || '';
      const dslEditor = modalEl._dslEditor;

      const datos = {
        clase_id: claseId,
        maestro_id: modalEl.querySelector('#pl-maestro_id')?.value || null,
        instrumento: modalEl.querySelector('#pl-instrumento')?.value || null,
        tema,
        fecha_inicio: modalEl.querySelector('#pl-fecha_inicio')?.value || null,
        objetivos: modalEl.querySelector('#pl-objetivos')?.value.trim(),
        contenido: modalEl.querySelector('#pl-contenido')?.value.trim(),
        recursos: recursosRaw.split(',').map(r => r.trim()).filter(Boolean),
        evaluacion_metodo: modalEl.querySelector('#pl-evaluacion')?.value.trim(),
        observaciones: modalEl.querySelector('#pl-observaciones')?.value.trim(),
        notas_dsl: dslEditor ? dslEditor.getContent() : '',
        estado: isEdit
          ? (modalEl.querySelector('#pl-estado')?.value || 'planificado')
          : 'planificado',
      };

      if (onSave) await onSave(datos);
      closeModal();
    } catch (err) {
      console.error('[planificacionModal] Error:', err);
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? 'Guardar cambios' : 'Guardar';
    }
  };

  // Mostrar modal
  requestAnimationFrame(() => {
    modalEl.classList.add('open');
    modalEl.querySelector('#pl-tema')?.focus();
  });
}

function _buildModalHTML(isEdit, plan, clases, maestros) {
  const clasesOptions = clases.length
    ? clases.map(c => `<option value="${c.id}" ${plan.clase_id === c.id ? 'selected' : ''}>${esc(c.nombre || c.id)}</option>`).join('')
    : '<option value="">Sin clases disponibles</option>';

  const maestrosOptions = maestros.length
    ? `<option value="">Sin asignar</option>` + maestros.map(m => `<option value="${m.id}" ${plan.maestro_id === m.id ? 'selected' : ''}>${esc(m.nombre || m.id)}</option>`).join('')
    : '<option value="">Sin maestros disponibles</option>';

  const recursosValue = Array.isArray(plan.recursos) ? plan.recursos.join(', ') : '';

  const templateOptions = PLANTILLAS_PLANIFICACION.map(t =>
    `<option value="${t.id}">${t.nombre}</option>`
  ).join('');

  return `
    <div class="pm-plan-backdrop"></div>
    <div class="pm-plan-modal">
      <!-- Header -->
      <div class="pm-plan-header">
        <div class="pm-plan-header-left">
          <div class="pm-plan-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 class="pm-plan-title">${isEdit ? 'Editar Planificación' : 'Nueva Planificación'}</h2>
            <p class="pm-plan-subtitle">Completa los datos para crear tu planificación</p>
          </div>
        </div>
        <button class="pm-plan-close-x" aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="pm-plan-body">
        ${!isEdit ? `
        <div class="pm-plan-section">
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-plantilla">Plantilla</label>
            <select class="pm-plan-select" id="pl-plantilla">
              ${templateOptions}
            </select>
            <span class="pm-plan-hint">Selecciona una plantilla para préllenar el formulario</span>
          </div>
        </div>
        ` : ''}

        <!-- Datos básicos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Datos Básicos</h3>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-clase_id">Clase *</label>
              <select class="pm-plan-select" id="pl-clase_id" required>
                <option value="">Seleccionar clase</option>
                ${clasesOptions}
              </select>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-maestro_id">Maestro</label>
              <select class="pm-plan-select" id="pl-maestro_id">
                ${maestrosOptions}
              </select>
            </div>
          </div>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-instrumento">Instrumento / Grupo</label>
              <select class="pm-plan-select" id="pl-instrumento">
                <option value="">Todos los instrumentos</option>
                ${_buildInstrumentoOptions(clases, plan.clase_id, plan.instrumento)}
              </select>
              <span class="pm-plan-hint">Dejar vacío si aplica a todos</span>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-fecha_inicio">Fecha de Inicio</label>
              <input type="date" class="pm-plan-input" id="pl-fecha_inicio" value="${plan.fecha_inicio || ''}">
            </div>
          </div>
          ${isEdit ? `
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-estado">Estado</label>
            <select class="pm-plan-select" id="pl-estado">
              <option value="planificado" ${plan.estado === 'planificado' ? 'selected' : ''}>Planificado</option>
              <option value="ejecutado" ${plan.estado === 'ejecutado' ? 'selected' : ''}>Ejecutado</option>
              <option value="revisado" ${plan.estado === 'revisado' ? 'selected' : ''}>Revisado</option>
            </select>
          </div>
          ` : ''}
        </div>

        <!-- Tema y objetivos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Contenido</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-tema">Tema *</label>
            <input type="text" class="pm-plan-input" id="pl-tema" maxlength="200"
              placeholder="Ej: Introducción a la escala mayor" autocomplete="off"
              value="${esc(plan.tema || '')}">
            <span class="pm-plan-char-count"><span id="pl-tema-count">${(plan.tema || '').length}</span>/200</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-objetivos">Objetivos</label>
            <textarea class="pm-plan-textarea" id="pl-objetivos" rows="2" maxlength="1000"
              placeholder="¿Qué quieres lograr en esta clase?">${esc(plan.objetivos || '')}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obj-count">${(plan.objetivos || '').length}</span>/1000</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-contenido">Contenido</label>
            <textarea class="pm-plan-textarea" id="pl-contenido" rows="3" maxlength="2000"
              placeholder="Desarrollo del tema, actividades...">${esc(plan.contenido || '')}</textarea>
            <span class="pm-plan-char-count"><span id="pl-cont-count">${(plan.contenido || '').length}</span>/2000</span>
          </div>
        </div>

        <!-- Recursos y evaluación -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Recursos y Evaluación</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-recursos">Recursos</label>
            <input type="text" class="pm-plan-input" id="pl-recursos"
              placeholder="Partitura, audio, pizarra (separados por coma)" autocomplete="off"
              value="${esc(recursosValue)}">
            <span class="pm-plan-hint">Separa múltiples recursos con coma</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-evaluacion">Método de Evaluación</label>
            <textarea class="pm-plan-textarea" id="pl-evaluacion" rows="2" maxlength="500"
              placeholder="¿Cómo evaluarás el aprendizaje?">${esc(plan.evaluacion_metodo || '')}</textarea>
            <span class="pm-plan-char-count"><span id="pl-eval-count">${(plan.evaluacion_metodo || '').length}</span>/500</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-observaciones">Observaciones</label>
            <textarea class="pm-plan-textarea" id="pl-observaciones" rows="2" maxlength="1000"
              placeholder="Notas adicionales...">${esc(plan.observaciones || '')}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obs-count">${(plan.observaciones || '').length}</span>/1000</span>
          </div>
        </div>

        <!-- DSL Notes -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Notas DSL</h3>
          <p class="pm-plan-section-desc">Usa notación simplificada: <code>#Alumno</code> <code>[Contenido]</code> <code>(Sugerencia)</code> <code>{Tarea}</code> <code>$Medida</code> <code>&gt;Objetivo</code></p>
          <div id="dsl-editor-container"></div>
          <span class="pm-plan-dsl-summary"><span id="dsl-summary">Sin tokens</span></span>
        </div>
      </div>

      <!-- Footer -->
      <div class="pm-plan-footer">
        <button class="pm-plan-cancel-btn">Cancelar</button>
        <button class="pm-plan-save-btn">${isEdit ? 'Guardar cambios' : 'Guardar'}</button>
      </div>
    </div>
  `;
}

function _getModalStyles() {
  return `
    .pm-plan-modal-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    .pm-plan-modal-overlay.open {
      display: flex;
      opacity: 1;
    }
    
    .pm-plan-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .pm-plan-modal {
      position: relative;
      background: var(--pm-surface);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                  0 0 0 1px var(--pm-border);
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    .pm-plan-modal-overlay.open .pm-plan-modal {
      transform: scale(1) translateY(0);
    }
    
    .pm-plan-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: var(--pm-surface-2);
      border-bottom: 1px solid var(--pm-border);
      flex-shrink: 0;
    }
    
    .pm-plan-header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    
    .pm-plan-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--pm-primary) 0%, #6366f1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .pm-plan-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--pm-text);
      margin: 0;
    }
    
    .pm-plan-subtitle {
      font-size: 0.8rem;
      color: var(--pm-text-muted);
      margin: 0.2rem 0 0;
    }
    
    .pm-plan-close-x {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--pm-surface-2);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pm-text-muted);
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    
    .pm-plan-close-x:hover {
      background: var(--pm-border);
      color: var(--pm-text);
    }
    
    .pm-plan-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    
    .pm-plan-body::-webkit-scrollbar {
      width: 6px;
    }
    
    .pm-plan-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .pm-plan-body::-webkit-scrollbar-thumb {
      background: var(--pm-border);
      border-radius: 3px;
    }
    
    .pm-plan-section {
      margin-bottom: 1.5rem;
    }
    
    .pm-plan-section:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-section-title {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
    }
    
    .pm-plan-section-desc {
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
      line-height: 1.4;
    }
    
    .pm-plan-section-desc code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.7rem;
      background: var(--pm-surface-2);
      border: 1px solid var(--pm-border);
      border-radius: 4px;
      padding: 0.1rem 0.3rem;
    }
    
    .pm-plan-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    
    .pm-plan-field {
      margin-bottom: 0.75rem;
      position: relative;
    }
    
    .pm-plan-field:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--pm-text);
      margin-bottom: 0.35rem;
    }
    
    .pm-plan-label small {
      font-weight: 400;
      color: var(--pm-text-muted);
    }
    
    .pm-plan-input,
    .pm-plan-select,
    .pm-plan-textarea {
      width: 100%;
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--pm-text);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    .pm-plan-input:focus,
    .pm-plan-select:focus,
    .pm-plan-textarea:focus {
      outline: none;
      border-color: var(--pm-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    
    .pm-plan-textarea {
      resize: vertical;
      min-height: 60px;
      line-height: 1.5;
    }
    
    .pm-plan-hint {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      margin-top: 0.25rem;
    }
    
    .pm-plan-char-count {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      text-align: right;
      margin-top: 0.2rem;
    }
    
    .pm-plan-dsl-summary {
      display: block;
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: var(--pm-surface-2);
      border-radius: 6px;
      text-align: center;
    }
    
    .pm-plan-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--pm-border);
      background: var(--pm-surface-2);
      flex-shrink: 0;
    }
    
    .pm-plan-cancel-btn {
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--pm-text);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .pm-plan-cancel-btn:hover {
      background: var(--pm-border);
    }
    
    .pm-plan-save-btn {
      background: linear-gradient(135deg, var(--pm-primary) 0%, #2563eb 100%);
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .pm-plan-save-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .pm-plan-save-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .pm-plan-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: pm-plan-spin 0.6s linear infinite;
    }
    
    @keyframes pm-plan-spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 640px) {
      .pm-plan-modal {
        max-height: 95vh;
      }
      
      .pm-plan-header {
        padding: 1rem;
      }
      
      .pm-plan-body {
        padding: 1rem;
      }
      
      .pm-plan-grid-2 {
        grid-template-columns: 1fr;
      }
      
      .pm-plan-footer {
        padding: 0.875rem 1rem;
      }
    }
  `;
}

function _initCounters(modalEl) {
  const counters = [
    { input: 'pl-tema', count: 'pl-tema-count' },
    { input: 'pl-objetivos', count: 'pl-obj-count' },
    { input: 'pl-contenido', count: 'pl-cont-count' },
    { input: 'pl-evaluacion', count: 'pl-eval-count' },
    { input: 'pl-observaciones', count: 'pl-obs-count' },
  ];

  counters.forEach(({ input, count }) => {
    const inputEl = modalEl.querySelector('#' + input);
    const countEl = modalEl.querySelector('#' + count);
    if (inputEl && countEl) {
      inputEl.addEventListener('input', () => {
        countEl.textContent = inputEl.value.length;
      });
    }
  });
}

function _updateAllCounters(modalEl) {
  const counters = [
    { input: 'pl-objetivos', count: 'pl-obj-count' },
    { input: 'pl-contenido', count: 'pl-cont-count' },
    { input: 'pl-evaluacion', count: 'pl-eval-count' },
    { input: 'pl-observaciones', count: 'pl-obs-count' },
  ];

  counters.forEach(({ input, count }) => {
    const inputEl = modalEl.querySelector('#' + input);
    const countEl = modalEl.querySelector('#' + count);
    if (inputEl && countEl) {
      countEl.textContent = inputEl.value.length;
    }
  });
}

function _buildInstrumentoOptions(clases, claseId, selectedInstrumento) {
  const clase = clases.find(c => c.id === claseId);
  if (!clase?.instrumento) return '';
  const instrumentos = clase.instrumento.split(',').map(i => i.trim()).filter(Boolean);
  return instrumentos.map(i =>
    `<option value="${esc(i)}" ${selectedInstrumento === i ? 'selected' : ''}>${esc(i)}</option>`
  ).join('');
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _getDslSummary(parsed) {
  const parts = [];
  if (parsed.alumnos.length) parts.push(`${parsed.alumnos.length} alum.`);
  if (parsed.contenido.length) parts.push(`${parsed.contenido.length} cont.`);
  if (parsed.tareas.length) parts.push(`${parsed.tareas.length} tar.`);
  if (parsed.calificacion) parts.push(`${parsed.calificacion.valor}/${parsed.calificacion.sobre}`);
  return parts.length ? parts.join(', ') : 'Sin tokens';
}