import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';

let state = {
  maestros: [],
  loading: false
};

export function renderAusenciaForm(onSubmit) {
  const maestro = getMaestroLocal();
  
  return `
    <form id="ausenciaForm" class="row g-3">
      <div class="col-md-6">
        <label class="form-label label-apple">Fecha de inicio</label>
        <input type="date" class="input-apple" id="ausenciaFechaInicio" required>
      </div>
      <div class="col-md-6">
        <label class="form-label label-apple">Fecha de fin</label>
        <input type="date" class="input-apple" id="ausenciaFechaFin" required>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Motivo de ausencia</label>
        <select class="input-apple" id="ausenciaMotivo" required>
          <option value="">Selecciona un motivo</option>
          <option value="enfermedad">Enfermedad</option>
          <option value="personal">Asunto personal</option>
          <option value="familiar">Emergencia familiar</option>
          <option value="capacitacion">Capacitación</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Maestro sustituto</label>
        <select class="input-apple" id="ausenciaSustituto" required>
          <option value="">Cargando maestros...</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label label-apple">Observaciones</label>
        <textarea class="input-apple" id="ausenciaObservaciones" rows="3"
          placeholder="Información adicional relevante"></textarea>
      </div>
      <div class="col-12">
        <div id="ausenciaError" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn-apple-primary" id="btnEnviarAusencia">
          <i class="bi bi-send"></i>Enviar solicitud
        </button>
      </div>
    </form>
  `;
}

export async function initAusenciaForm() {
  await cargarMaestros();
  configurarEventos();
}

async function cargarMaestros() {
  const select = document.getElementById('ausenciaSustituto');
  if (!select) return;

  try {
    const { data, error } = await supabase
      .from('maestros')
      .select('id, nombre, email')
      .eq('estado', 'activo')
      .order('nombre');

    if (error) throw error;

    const maestroActual = getMaestroLocal();
    state.maestros = (data || []).filter(m => m.id !== maestroActual?.id);
    select.innerHTML = '<option value="">Selecciona un sustituto</option>' +
      state.maestros.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
  } catch (error) {
    select.innerHTML = '<option value="">Error al cargar maestros</option>';
  }
}

function configurarEventos() {
  const form = document.getElementById('ausenciaForm');
  if (!form) return;

  const inicio = document.getElementById('ausenciaFechaInicio');
  const fin = document.getElementById('ausenciaFechaFin');
  
  if (inicio) {
    const hoy = new Date().toISOString().split('T')[0];
    inicio.min = hoy;
    if (fin) fin.min = hoy;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await enviarSolicitud();
  });
}

async function enviarSolicitud() {
  const inicio = document.getElementById('ausenciaFechaInicio').value;
  const fin = document.getElementById('ausenciaFechaFin').value;
  const motivo = document.getElementById('ausenciaMotivo').value;
  const sustitutoId = document.getElementById('ausenciaSustituto').value;
  const observaciones = document.getElementById('ausenciaObservaciones').value;

  if (new Date(fin) < new Date(inicio)) {
    mostrarError('La fecha de fin debe ser posterior a la de inicio');
    return;
  }

  state.loading = true;
  const btn = document.getElementById('btnEnviarAusencia');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Enviando...`;

  try {
    const maestro = getMaestroLocal();
    if (!maestro) throw new Error('No hay sesión activa');

    const { data, error } = await supabase
      .from('ausencias')
      .insert({
        maestro_id: maestro.id,
        fecha_inicio: inicio,
        fecha_fin: fin,
        motivo,
        sustituto_id: sustitutoId,
        observaciones,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) throw error;

    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { message: 'Solicitud enviada correctamente', type: 'success' }
    }));

    const modal = bootstrap.Modal.getInstance(document.getElementById('ausenciaModal'));
    modal?.hide();

    window.dispatchEvent(new CustomEvent('ausenciaSolicitada'));
    
    document.getElementById('ausenciaForm').reset();
  } catch (error) {
    mostrarError(error.message);
  } finally {
    state.loading = false;
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-send"></i>Enviar solicitud`;
  }
}

function mostrarError(mensaje) {
  const errorDiv = document.getElementById('ausenciaError');
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove('d-none');
  }
}

