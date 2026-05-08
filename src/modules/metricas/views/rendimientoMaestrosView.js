import { getRendimientoMaestros } from '../api/metricsApi.js';

let currentData = [];
let currentFilter = 'todos';
let instTasaResolucionPromedio = 0;

export async function renderRendimientoMaestrosView(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;

  try {
    currentData = await getRendimientoMaestros();
    // Calculate institution average resolution rate
    if (currentData.length > 0) {
      const totalGen = currentData.reduce((sum, m) => sum + (Number(m.obs_generadas) || 0), 0);
      const totalRes = currentData.reduce((sum, m) => sum + (Number(m.obs_resueltas) || 0), 0);
      instTasaResolucionPromedio = totalGen > 0 ? (totalRes / totalGen) * 100 : 0;
    }
    renderContent(container);
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger mt-3" role="alert">
        Error al cargar los datos de rendimiento de maestros: ${error.message}
      </div>
    `;
  }
}

function renderContent(container) {
  // Obtener especialidades únicas para el filtro
  const especialidades = [...new Set(currentData.map(m => m.especialidad).filter(Boolean))].sort();

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4 mt-3">
      <h2>Rendimiento de Maestros</h2>
    </div>

    <div class="row mb-4">
      <div class="col-md-4">
        <select id="filtroEspecialidad" class="form-select">
          <option value="todos">Todas las especialidades</option>
          ${especialidades.map(esp => `<option value="${esp}">${esp}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="row g-4" id="maestrosGrid">
    </div>
  `;

  container.querySelector('#filtroEspecialidad').addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderGrid(container.querySelector('#maestrosGrid'));
  });

  renderGrid(container.querySelector('#maestrosGrid'));
}

function renderGrid(gridContainer) {
  let data = [...currentData];

  if (currentFilter !== 'todos') {
    data = data.filter(m => m.especialidad === currentFilter);
  }

  if (data.length === 0) {
    gridContainer.innerHTML = `<div class="col-12"><div class="alert alert-info">No se encontraron maestros para esta especialidad.</div></div>`;
    return;
  }

  gridContainer.innerHTML = data.map(m => {
    const promCalif = Number(m.promedio_calificacion_alumnos) || 0;
    let semaforoClass = 'text-success';
    if (promCalif < 60) semaforoClass = 'text-danger';
    else if (promCalif < 80) semaforoClass = 'text-warning';

    const tasaAsistencia = Number(m.tasa_asistencia_clases) || 0;
    const obsGen = Number(m.obs_generadas) || 0;
    const obsRes = Number(m.obs_resueltas) || 0;
    const tasaRes = Number(m.tasa_resolucion_obs) || 0;
    const diasProm = Number(m.dias_promedio_resolucion) || 0;
    
    let resProgressClass = 'bg-success';
    if (tasaRes < 50) resProgressClass = 'bg-danger';
    else if (tasaRes < 80) resProgressClass = 'bg-warning';

    const diffInst = (tasaRes - instTasaResolucionPromedio).toFixed(1);
    const diffClass = diffInst >= 0 ? 'text-success' : 'text-danger';

    return `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm border-0 maestro-card" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#collapseMaestro${m.maestro_id}">
          <div class="card-body">
            <h5 class="card-title mb-1">${m.nombre_completo}</h5>
            <h6 class="card-subtitle mb-3 text-muted">${m.especialidad || 'Sin especialidad'}</h6>
            
            <div class="d-flex justify-content-between mb-2">
              <span class="text-secondary small">Promedio Alumnos</span>
              <span class="fw-bold ${semaforoClass}">${promCalif.toFixed(1)}</span>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-secondary small">Asistencia Clases</span>
              <span class="fw-bold">${tasaAsistencia.toFixed(1)}%</span>
            </div>

            <div class="mb-2 mt-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-secondary small">Observaciones (${obsRes}/${obsGen})</span>
                <span class="small fw-bold">${tasaRes.toFixed(1)}%</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar ${resProgressClass}" role="progressbar" style="width: ${tasaRes}%"></div>
              </div>
            </div>

            <div class="d-flex justify-content-between">
              <span class="text-secondary small">Tiempo resolución</span>
              <span class="small fw-bold">${diasProm.toFixed(1)} días</span>
            </div>
            
            <!-- Collapse Detail -->
            <div class="collapse mt-3 pt-3 border-top" id="collapseMaestro${m.maestro_id}">
              <div class="row text-center g-2 mb-2">
                <div class="col-6">
                  <div class="p-2 bg-light rounded">
                    <div class="small text-muted">Total Alumnos</div>
                    <div class="fw-bold fs-5">${m.total_alumnos_evaluados || 0}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 bg-light rounded">
                    <div class="small text-muted">Evaluaciones</div>
                    <div class="fw-bold fs-5">${m.total_evaluaciones || 0}</div>
                  </div>
                </div>
              </div>
              <div class="p-2 bg-light rounded text-center">
                <div class="small text-muted">Vs Media Institucional (Tasa Res.)</div>
                <div class="fw-bold ${diffClass}">${diffInst > 0 ? '+' : ''}${diffInst}%</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }).join('');
}
