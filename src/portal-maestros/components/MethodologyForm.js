import { saveMethodology } from '../services/classEventService.js';

const FIELDS = [
  { key: 'warmup', label: 'Calentamiento', type: 'text', placeholder: 'Ej: ejercicios preparatorios, técnica básica' },
  { key: 'sound_focus', label: 'Enfoque de Sonido', type: 'text', placeholder: 'Ej: calidad sonora, proyección' },
  { key: 'intonation_focus', label: 'Enfoque de Afinación', type: 'text', placeholder: 'Ej: intervalos, escalas' },
  { key: 'technical_focus', label: 'Enfoque Técnico', type: 'text', placeholder: 'Ej: técnica específica del área' },
  { key: 'study_used', label: 'Estudio/Método', type: 'text', placeholder: 'Ej: nombre del método o estudio' },
  { key: 'repertoire_used', label: 'Repertorio / Material', type: 'text', placeholder: 'Ej: obra o material trabajado' },
  { key: 'sight_reading_work', label: 'Lectura a Primera Vista', type: 'text', placeholder: '' },
  { key: 'ear_training_work', label: 'Entrenamiento Auditivo', type: 'text', placeholder: '' },
  { key: 'closing_observation', label: 'Observación de Cierre', type: 'textarea', placeholder: 'Notas finales...' },
];

const AUTOSAVE_DELAY = 30_000;

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Creates a collapsible methodology form card with 30s debounce auto-save.
 *
 * @param {{ classEventId: string, onSave?: Function, initialData?: object }} opts
 * @returns {{ el: HTMLElement, getData: () => object, destroy: () => void }}
 */
export function createMethodologyForm({ classEventId, onSave, initialData = {} }) {
  let collapsed = true;
  let timer = null;

  const el = document.createElement('div');
  el.className = 'pm-methodology-form-card';

  function render() {
    el.innerHTML = /* html */ `
      <div class="pm-methodology-form-header">
        <span class="pm-methodology-form-title">Metodología</span>
        <span class="pm-methodology-form-status"></span>
        <button type="button" class="pm-methodology-form-toggle" aria-label="Expandir/Colapsar">
          <i class="bi bi-chevron-${collapsed ? 'down' : 'up'}"></i>
        </button>
      </div>
      <div class="pm-methodology-form-body" style="display:${collapsed ? 'none' : 'block'}">
        ${FIELDS.map(f => {
          const val = initialData[f.key] || '';
          if (f.type === 'textarea') {
            return `
              <label class="pm-methodology-form-label">${f.label}</label>
              <textarea class="pm-input pm-methodology-form-field" data-key="${f.key}" rows="3" placeholder="${f.placeholder}">${val}</textarea>`;
          }
          return `
            <label class="pm-methodology-form-label">${f.label}</label>
            <input class="pm-input pm-methodology-form-field" data-key="${f.key}" type="text" value="${val}" placeholder="${f.placeholder}" />`;
        }).join('')}
      </div>
    `;
  }

  render();

  function getData() {
    const data = {};
    el.querySelectorAll('.pm-methodology-form-field').forEach(field => {
      data[field.dataset.key] = field.value;
    });
    return data;
  }

  function setStatus(text) {
    const s = el.querySelector('.pm-methodology-form-status');
    if (s) s.textContent = text;
  }

  async function doSave() {
    const data = getData();
    setStatus('Guardando...');
    try {
      await saveMethodology(classEventId, data);
      setStatus(`Guardado ${formatTime(new Date())}`);
      if (onSave) onSave(data);
    } catch {
      setStatus('Error al guardar');
    }
  }

  function scheduleAutosave() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(doSave, AUTOSAVE_DELAY);
  }

  el.addEventListener('click', (e) => {
    if (e.target.closest('.pm-methodology-form-toggle') || e.target.closest('.pm-methodology-form-header')) {
      collapsed = !collapsed;
      const body = el.querySelector('.pm-methodology-form-body');
      if (body) body.style.display = collapsed ? 'none' : 'block';
      const icon = el.querySelector('.pm-methodology-form-toggle i');
      if (icon) icon.className = `bi bi-chevron-${collapsed ? 'down' : 'up'}`;
    }
  });

  el.addEventListener('input', (e) => {
    if (e.target.classList.contains('pm-methodology-form-field')) {
      scheduleAutosave();
    }
  });

  function destroy() {
    if (timer) clearTimeout(timer);
  }

  return { el, getData, destroy };
}
