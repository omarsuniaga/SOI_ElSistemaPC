import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';

let state = {
  ausencias: [],
  loading: true
};

export function renderAusenciaHistorial() {
  cargarAusencias();
  
  return `
    <div class="ausencia-historial">
      <div id="historialLoading" class="text-center py-3 ${state.loading ? '' : 'd-none'}">
        <div class="spinner-border spinner-border-sm text-primary"></div>
      </div>
      <div id="historialVacio" class="text-center py-3 text-muted ${state.loading || state.ausencias.length ? 'd-none' : ''}">
        <i class="bi bi-calendar-check" style="font-size: 2rem;"></i>
        <p class="mt-2">No tienes solicitudes de ausencia</p>
      </div>
      <div class="table-responsive ${state.loading || !state.ausencias.length ? 'd-none' : ''}" id="historialTable">
        <table class="table table-compact">
          <thead class="table-light">
            <tr>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Motivo</th>
              <th>Sustituto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="historialTBody">
            ${renderRows()}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderRows() {
  if (!state.ausencias.length) return '';
  
  return state.ausencias.map(a => {
    const badgeClass = {
      pendiente: 'bg-warning text-dark',
      aprobada: 'bg-success',
      rechazada: 'bg-danger'
    }[a.estado] || 'bg-secondary';

    return `
      <tr>
        <td>${formatDate(a.fecha_inicio)}</td>
        <td>${formatDate(a.fecha_fin)}</td>
        <td>${formatMotivo(a.motivo)}</td>
        <td>${a.sustituto_nombre || '-'}</td>
        <td><span class="badge ${badgeClass}">${a.estado}</span></td>
      </tr>
    `;
  }).join('');
}

function formatDate(fecha) {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatMotivo(motivo) {
  const motivos = {
    enfermedad: 'Enfermedad',
    personal: 'Asunto personal',
    familiar: 'Emergencia familiar',
    capacitacion: 'Capacitación',
    otro: 'Otro'
  };
  return motivos[motivo] || motivo;
}

export async function cargarAusencias() {
  state.loading = true;
  actualizarVista();

  try {
    const maestro = getMaestroLocal();
    if (!maestro) throw new Error('No hay sesión activa');

    const { data, error } = await supabase
      .from('ausencias')
      .select('*, sustituto:maestros!sustituto_id(nombre)')
      .eq('maestro_id', maestro.id)
      .order('fecha_inicio', { ascending: false });

    if (error) throw error;

    state.ausencias = data?.map(a => ({
      ...a,
      sustituto_nombre: a.sustituto?.nombre
    })) || [];
  } catch (error) {
    console.error('Error cargando ausencias:', error);
    state.ausencias = [];
  } finally {
    state.loading = false;
    actualizarVista();
  }
}

function actualizarVista() {
  const container = document.getElementById('ausenciaHistorialContainer');
  if (!container) return;

  container.innerHTML = renderAusenciaHistorial();
}

window.addEventListener('ausenciaSolicitada', cargarAusencias);
window.addEventListener('ausenciaActualizada', cargarAusencias);

export { cargarAusencias };