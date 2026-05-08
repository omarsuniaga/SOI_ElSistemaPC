import { getRiesgoAbandono } from '../api/metricsApi.js';
import { createRiesgoBar, createRiesgoChip, createScoreCircle } from '../components/riesgoIndicador.js';

let currentData = [];
let currentFilter = 'todos';
let currentSort = { column: 'score_riesgo', direction: 'desc' };

export async function renderRiesgoAbandonoView(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;

  try {
    currentData = await getRiesgoAbandono();
    renderContent(container);
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger mt-3" role="alert">
        Error al cargar los datos de riesgo: ${error.message}
      </div>
    `;
  }
}

function renderContent(container) {
  const altoCount = currentData.filter(d => d.nivel_riesgo === 'alto').length;

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4 mt-3">
      <h2>Análisis de Riesgo de Abandono</h2>
      <button id="btnExportCsvRiesgo" class="btn btn-outline-secondary">
        <i class="bi bi-download"></i> Exportar CSV
      </button>
    </div>

    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card text-white bg-danger mb-3">
          <div class="card-body">
            <h5 class="card-title">Alumnos en Riesgo Alto</h5>
            <p class="card-text display-4 fw-bold">${altoCount}</p>
          </div>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3" id="riesgoTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" data-filter="todos">Todos</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-filter="alto">Riesgo Alto</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-filter="medio">Riesgo Medio</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-filter="bajo">Riesgo Bajo</button>
      </li>
    </ul>

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Alumno / Instrumento</th>
            <th>Nivel</th>
            <th class="cursor-pointer sortable" data-sort="score_riesgo" title="Puntuación de riesgo (0-100)">Score ↕</th>
            <th class="cursor-pointer sortable" data-sort="tasa_asistencia" title="% Asistencia en el período">Asistencia 28d ↕</th>
            <th title="Ausencias en los últimos 14 días">Ausencias 14d</th>
            <th class="cursor-pointer sortable" data-sort="promedio_calificacion" title="Promedio de calificaciones">Promedio ↕</th>
            <th title="Variación de calificación vs período anterior">Δ Calif.</th>
            <th title="Alertas de sistema nivel alto">Alertas Altas</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody id="riesgoTableBody">
        </tbody>
      </table>
    </div>
  `;

  attachEventListeners(container);
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('riesgoTableBody');
  if (!tbody) return;

  let data = [...currentData];

  // Filtrar
  if (currentFilter !== 'todos') {
    data = data.filter(d => d.nivel_riesgo === currentFilter);
  }

  // Ordenar
  data.sort((a, b) => {
    let valA = a[currentSort.column];
    let valB = b[currentSort.column];
    
    // Convert to numbers if possible for correct sorting
    valA = valA === null ? 0 : Number(valA) || valA;
    valB = valB === null ? 0 : Number(valB) || valB;

    if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
    if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No hay alumnos en esta categoría</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(d => `
    <tr>
      <td>
        <div class="fw-bold">${d.nombre_completo || 'Desconocido'}</div>
        <div class="text-muted small">${d.instrumento_principal || 'N/A'}</div>
      </td>
      <td>${createRiesgoChip(d.nivel_riesgo)}</td>
      <td style="min-width: 120px;">
        <div class="d-flex align-items-center gap-2">
          ${createScoreCircle(d.score_riesgo)}
          <div class="flex-grow-1">${createRiesgoBar(d.score_riesgo)}</div>
        </div>
      </td>
      <td>
        <span class="${d.tasa_asistencia < 70 ? 'text-danger fw-bold' : ''}">
          ${Number(d.tasa_asistencia || 0).toFixed(1)}%
        </span>
      </td>
      <td>${d.ausencias_14d || 0}</td>
      <td>${Number(d.promedio_calificacion || 0).toFixed(1)}</td>
      <td>
        <span class="${d.delta_calificacion < 0 ? 'text-danger' : (d.delta_calificacion > 0 ? 'text-success' : 'text-muted')}">
          ${d.delta_calificacion > 0 ? '+' : ''}${Number(d.delta_calificacion || 0).toFixed(1)}
        </span>
      </td>
      <td>
        ${d.alertas_alta > 0 ? `<span class="badge bg-danger rounded-pill">${d.alertas_alta}</span>` : '<span class="text-muted">0</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-ver-detalle" data-id="${d.alumno_id}">Ver detalle</button>
      </td>
    </tr>
  `).join('');
}

function attachEventListeners(container) {
  // Tabs
  const tabs = container.querySelectorAll('.nav-link');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderTable();
    });
  });

  // Sorting
  const sortHeaders = container.querySelectorAll('.sortable');
  sortHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (currentSort.column === col) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.column = col;
        currentSort.direction = 'desc';
      }
      renderTable();
    });
  });

  // Botones de detalle
  container.addEventListener('click', (e) => {
    if (e.target.closest('.btn-ver-detalle')) {
      const id = e.target.closest('.btn-ver-detalle').getAttribute('data-id');
      const event = new CustomEvent('navigate:alumno', { detail: { id } });
      window.dispatchEvent(event);
    }
  });

  // CSV
  const btnExport = container.querySelector('#btnExportCsvRiesgo');
  if (btnExport) {
    btnExport.addEventListener('click', exportToCsv);
  }
}

function exportToCsv() {
  if (!currentData || currentData.length === 0) return;
  
  const headers = ['Alumno_ID', 'Nombre', 'Instrumento', 'Nivel_Riesgo', 'Score', 'Asistencia_28d', 'Ausencias_14d', 'Promedio', 'Delta_Calif', 'Alertas_Alta'];
  const rows = currentData.map(d => [
    d.alumno_id,
    `"${d.nombre_completo || ''}"`,
    `"${d.instrumento_principal || ''}"`,
    d.nivel_riesgo,
    d.score_riesgo,
    d.tasa_asistencia,
    d.ausencias_14d,
    d.promedio_calificacion,
    d.delta_calificacion,
    d.alertas_alta
  ].join(','));

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "riesgo_abandono.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
