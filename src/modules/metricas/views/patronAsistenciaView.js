import { getPatronAsistencia } from '../api/metricsApi.js'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export async function renderPatronAsistenciaView(container) {
  container.innerHTML = renderLoading()

  try {
    const datos = await getPatronAsistencia()
    if (!datos || datos.length === 0) {
      container.innerHTML = renderEmpty()
      return
    }

    const instrumentos = [...new Set(datos.map(d => d.instrumento_principal).filter(Boolean))].sort()
    const state = { filtroInstrumento: null, datos }

    renderContent(container, state, instrumentos)
    attachEvents(container, state, instrumentos)
  } catch (error) {
    container.innerHTML = renderError(error.message)
  }
}

function renderContent(container, state, instrumentos) {
  const datosFiltrados = state.filtroInstrumento
    ? state.datos.filter(d => d.instrumento_principal === state.filtroInstrumento)
    : state.datos

  const heatmapData = buildHeatmapData(datosFiltrados)
  const maxPct = Math.max(...Object.values(heatmapData).map(d => d.pct_ausencias || 0), 1)

  container.innerHTML = `
    <div class="p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1 fw-bold">📊 Patrón de Asistencia</h4>
          <p class="text-muted mb-0 small">Distribución de ausencias por día de la semana e instrumento</p>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <select id="filtroInstrumento" class="form-select form-select-sm" style="min-width:180px">
            <option value="">Todos los instrumentos</option>
            ${instrumentos.map(i => `<option value="${i}" ${state.filtroInstrumento === i ? 'selected' : ''}>${i}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Heatmap por día -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white border-bottom">
          <h6 class="mb-0 fw-semibold">Calor de ausencias por día</h6>
          <small class="text-muted">Más oscuro = mayor % de ausencias</small>
        </div>
        <div class="card-body">
          ${renderHeatmapDias(heatmapData, maxPct)}
        </div>
      </div>

      <!-- Tabla detallada por instrumento y día -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white border-bottom">
          <h6 class="mb-0 fw-semibold">Detalle por instrumento y día</h6>
        </div>
        <div class="card-body p-0">
          ${renderTablaDetalle(datosFiltrados, instrumentos)}
        </div>
      </div>

      <!-- Insight automático -->
      <div class="card border-0 shadow-sm bg-body-tertiary">
        <div class="card-body">
          <h6 class="fw-semibold mb-2">🔍 Análisis automático</h6>
          ${renderInsights(heatmapData)}
        </div>
      </div>
    </div>
  `
}

function buildHeatmapData(datos) {
  const mapa = {}
  for (let i = 0; i <= 6; i++) {
    mapa[i] = { dia: DIAS[i], total: 0, ausencias: 0, pct_ausencias: 0 }
  }
  datos.forEach(d => {
    const dia = d.dia_semana_num
    if (mapa[dia] !== undefined) {
      mapa[dia].total     += Number(d.total_registros || 0)
      mapa[dia].ausencias += Number(d.ausencias || 0)
    }
  })
  Object.values(mapa).forEach(d => {
    d.pct_ausencias = d.total > 0 ? Math.round(d.ausencias / d.total * 100) : 0
  })
  return mapa
}

function renderHeatmapDias(heatmapData, maxPct) {
  // Solo días con datos
  const diasConDatos = Object.values(heatmapData).filter(d => d.total > 0)
  if (diasConDatos.length === 0) {
    return '<p class="text-muted text-center py-3">Sin datos suficientes para el período.</p>'
  }

  const celdas = Object.entries(heatmapData).map(([num, d]) => {
    if (d.total === 0) return ''
    const intensidad = maxPct > 0 ? d.pct_ausencias / maxPct : 0
    const r = Math.round(255 * intensidad)
    const g = Math.round(255 * (1 - intensidad * 0.7))
    const b = Math.round(255 * (1 - intensidad))
    const textColor = intensidad > 0.6 ? '#fff' : '#212529'
    return `
      <div class="d-flex flex-column align-items-center justify-content-center rounded-3 p-3"
           style="background:rgb(${r},${g},${b});color:${textColor};min-width:90px;min-height:90px;transition:all .2s"
           title="${d.dia}: ${d.pct_ausencias}% ausencias (${d.ausencias}/${d.total})">
        <div class="fw-bold fs-5">${d.pct_ausencias}%</div>
        <div class="small">${d.dia}</div>
        <div class="text-opacity-75" style="font-size:11px">${d.ausencias} ausencias</div>
      </div>
    `
  }).filter(Boolean)

  return `<div class="d-flex gap-3 flex-wrap justify-content-center py-2">${celdas.join('')}</div>`
}

function renderTablaDetalle(datos, instrumentos) {
  if (!datos.length) return '<p class="text-muted text-center py-3 mb-0">Sin datos.</p>'

  // Pivotear: filas = instrumento, columnas = día
  const pivot = {}
  datos.forEach(d => {
    const inst = d.instrumento_principal || 'Sin instrumento'
    if (!pivot[inst]) pivot[inst] = {}
    pivot[inst][d.dia_semana_num] = d
  })

  const diasPresentes = [...new Set(datos.map(d => d.dia_semana_num))].sort()

  return `
    <div class="table-responsive">
      <table class="table table-hover table-sm mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-3">Instrumento</th>
            ${diasPresentes.map(d => `<th class="text-center">${DIAS[d]}</th>`).join('')}
            <th class="text-center">Total clases</th>
            <th class="text-center pe-3">% Ausencias</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(pivot).map(([inst, diasData]) => {
            let totalReg = 0, totalAus = 0
            const celdas = diasPresentes.map(d => {
              const cell = diasData[d]
              if (!cell) return '<td class="text-center text-muted">—</td>'
              totalReg += Number(cell.total_registros || 0)
              totalAus += Number(cell.ausencias || 0)
              const pct = Number(cell.pct_ausencias || 0)
              const cls = pct >= 30 ? 'text-danger fw-bold' : pct >= 15 ? 'text-warning' : 'text-success'
              return `<td class="text-center ${cls}">${pct}%</td>`
            }).join('')
            const pctTotal = totalReg > 0 ? Math.round(totalAus / totalReg * 100) : 0
            const clsTotal = pctTotal >= 30 ? 'text-danger fw-bold' : pctTotal >= 15 ? 'text-warning' : 'text-success'
            return `
              <tr>
                <td class="ps-3 fw-medium">${inst}</td>
                ${celdas}
                <td class="text-center text-muted small">${totalReg}</td>
                <td class="text-center pe-3 ${clsTotal}">${pctTotal}%</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderInsights(heatmapData) {
  const diasOrdenados = Object.values(heatmapData)
    .filter(d => d.total > 0)
    .sort((a, b) => b.pct_ausencias - a.pct_ausencias)

  if (!diasOrdenados.length) {
    return '<p class="text-muted mb-0">No hay suficientes datos para generar análisis.</p>'
  }

  const peor = diasOrdenados[0]
  const mejor = diasOrdenados[diasOrdenados.length - 1]
  const promedio = Math.round(diasOrdenados.reduce((s, d) => s + d.pct_ausencias, 0) / diasOrdenados.length)

  return `
    <div class="row g-3">
      <div class="col-md-4">
        <div class="d-flex align-items-start gap-2">
          <span class="fs-4">🔴</span>
          <div>
            <div class="fw-semibold">Día más crítico</div>
            <div class="text-danger">${peor.dia} — ${peor.pct_ausencias}% ausencias</div>
            <div class="text-muted small">Considerar refuerzo o reubicación de clases</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex align-items-start gap-2">
          <span class="fs-4">🟢</span>
          <div>
            <div class="fw-semibold">Mejor día</div>
            <div class="text-success">${mejor.dia} — ${mejor.pct_ausencias}% ausencias</div>
            <div class="text-muted small">Mayor compromiso e interés de los alumnos</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex align-items-start gap-2">
          <span class="fs-4">📊</span>
          <div>
            <div class="fw-semibold">Promedio general</div>
            <div class="${promedio >= 20 ? 'text-warning' : 'text-muted'}">${promedio}% de ausencias</div>
            <div class="text-muted small">${promedio >= 20 ? 'Por encima del umbral recomendado (< 20%)' : 'Dentro del rango aceptable'}</div>
          </div>
        </div>
      </div>
    </div>
  `
}

function attachEvents(container, state, instrumentos) {
  container.querySelector('#filtroInstrumento')?.addEventListener('change', async e => {
    state.filtroInstrumento = e.target.value || null
    renderContent(container, state, instrumentos)
    attachEvents(container, state, instrumentos)
  })
}

function renderLoading() {
  return `
    <div class="p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="placeholder-glow" style="width:300px">
          <span class="placeholder col-8 mb-1"></span>
          <span class="placeholder col-5"></span>
        </div>
      </div>
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex gap-3 justify-content-center py-2">
            ${[...Array(5)].map(() => `
              <div class="placeholder-glow">
                <span class="placeholder rounded-3" style="width:90px;height:90px;display:block"></span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `
}

function renderError(msg) {
  return `
    <div class="p-4">
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <span class="fs-4">⚠️</span>
        <div><strong>Error al cargar el patrón de asistencia</strong><br>
        <small>${msg}</small></div>
      </div>
    </div>
  `
}

function renderEmpty() {
  return `
    <div class="p-4 text-center py-5">
      <div class="fs-1 mb-3">📅</div>
      <h5 class="text-muted">Sin datos de asistencia</h5>
      <p class="text-muted">Registrá asistencias para comenzar a ver los patrones.</p>
    </div>
  `
}
