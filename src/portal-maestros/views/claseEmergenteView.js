import { supabase } from '../../lib/supabaseClient.js';
import { enqueue } from '../services/offlineQueue.js';
import { createAlumnoPickerModal } from '../components/AlumnoPickerModal.js';

/**
 * Vista: ClaseEmergente
 * Permite crear una sesión de clase no planificada (emergente).
 * 
 * @param {HTMLElement} container 
 * @param {{ maestroId: string }} options
 */
export async function renderClaseEmergenteView(container, { maestroId }) {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const fechaDefault = urlParams.get('fecha') || new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div style="padding-bottom: 2rem;">
      <h2 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;">Crear Clase Emergente</h2>
      
      <div class="pm-card" style="padding: 1rem;">
        <div class="mb-3">
          <label class="pm-label">Fecha</label>
          <input type="date" id="eme-fecha" class="pm-input" value="${fechaDefault}">
        </div>

        <div class="mb-3">
          <label class="pm-label">Motivo de la Clase</label>
          <select id="eme-motivo" class="pm-input">
            <option value="suplencia">Suplencia de maestro</option>
            <option value="eventual">Actividad eventual</option>
            <option value="reforzamiento">Reforzamiento académico</option>
            <option value="otro">Otro motivo</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="pm-label">Nombre de la Clase / Instrumento</label>
          <input type="text" id="eme-nombre" class="pm-input" placeholder="Ej: Refuerzo de Violín I">
        </div>

        <div class="mb-3">
          <label class="pm-label">Alumnos Participantes</label>
          <div id="eme-alumnos-chips" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="color:var(--pm-text-muted); font-size:0.8rem;">Ningún alumno seleccionado</span>
          </div>
          <button class="pm-btn" id="btn-eme-pick-alumnos" style="width:auto; padding:0.5rem 1rem; font-size:0.8rem; border:1px solid var(--pm-primary); color:var(--pm-primary);">
            + Seleccionar Alumnos
          </button>
        </div>

        <div class="mb-4">
          <label class="pm-label">Contenido / Observaciones</label>
          <textarea id="eme-contenido" class="pm-input" rows="3" placeholder="¿Qué se dio en esta clase?"></textarea>
        </div>

        <button class="pm-btn pm-btn-primary" id="btn-eme-guardar">Guardar y Continuar a Asistencia</button>
      </div>
    </div>
  `;

  let selectedAlumnos = [];
  const chipsContainer = container.querySelector('#eme-alumnos-chips');

  // 1. Obtener todos los alumnos del maestro para el picker
  let todosMisAlumnos = [];
  try {
    const { data } = await supabase
      .from('alumnos_clases')
      .select('alumno:alumnos(id, nombre_completo)')
      .eq('activo', true); // En real filtraríamos por maestro si hay tabla de relación
    
    todosMisAlumnos = (data || []).map(d => d.alumno).filter(Boolean);
  } catch (err) { console.error(err); }

  const picker = createAlumnoPickerModal(container, {
    alumnos: todosMisAlumnos,
    onSelect: (menciones) => {
      // Extraer IDs de los alumnos seleccionados (simplificado para el demo)
      // En un picker real usaríamos el evento de cambio
      alert('Alumnos seleccionados correctamente');
    }
  });

  container.querySelector('#btn-eme-pick-alumnos').onclick = () => picker.open();

  container.querySelector('#btn-eme-guardar').onclick = async () => {
    const payload = {
      maestro_id: maestroId,
      fecha: container.querySelector('#eme-fecha').value,
      motivo: container.querySelector('#eme-motivo').value,
      nombre_clase: container.querySelector('#eme-nombre').value,
      contenido: container.querySelector('#eme-contenido').value,
      created_at: new Date().toISOString()
    };

    if (!payload.nombre_clase) {
      alert('Por favor ingresa un nombre para la clase.');
      return;
    }

    await enqueue({
      tabla: 'clases_emergentes',
      operacion: 'insert',
      payload
    });

    alert('Clase emergente registrada. Redirigiendo...');
    window.location.hash = '#/hoy';
  };
}
