import { getSesionesPorRango, getPeriodoActivo } from '../api/asistenciasApi.js'

export async function renderAsistenciaHeatmap(container, options = {}) {
  const { titulo = 'Mapa de Calor de Ausencias', height = 300 } = options

  container.innerHTML = `
    <div class="heatmap-container" style="height: ${height}px;">
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    </div>
  `

  try {
    const activo = await getPeriodoActivo()
    if (!activo) {
      container.innerHTML = `<div class="text-center py-4 text-muted">No hay período activo</div>`
      return
    }

    const sesiones = await getSesionesPorRango({ periodoId: activo.id })
    const heatmapData = _procesarHeatmap(sesiones)

    _renderHeatmap(container, heatmapData, titulo)
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`
  }
}

function _procesarHeatmap(sesiones) {
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

  const matrix = Array(7).fill(null).map(() => Array(13).fill(0))
  const maxAusencias = { value: 0, cells: [] }

  for (const grupo of sesiones) {
    const fecha = new Date(grupo.fecha)
    const diaIndex = (fecha.getDay() + 6) % 7

    for (const sesion of grupo.sesiones) {
      const hora = parseInt(sesion.horaInicio?.split(':')[0]) - 8
      if (hora >= 0 && hora < 13) {
        const ausencias = sesion.totalAusentes || 0
        matrix[diaIndex][hora] += ausencias

        if (ausencias > maxAusencias.value) {
          maxAusencias.value = ausencias
          maxAusencias.cells = [{ dia: diaIndex, hora }]
        } else if (ausencias === maxAusencias.value && ausencias > 0) {
          maxAusencias.cells.push({ dia: diaIndex, hora })
        }
      }
    }
  }

  return { matrix, diasSemana, horas, max: maxAusencias.value }
}

function _renderHeatmap(container, data, titulo) {
  const { matrix, diasSemana, horas, max } = data
  const colorScale = max > 0 ? _getColorScale(max) : null

  container.innerHTML = `
    <div class="heatmap-container p-3">
      <h6 class="fw-bold mb-3"><i class="bi bi-calendar-week me-2"></i>${titulo}</h6>
      <div class="heatmap-grid" style="display: grid; grid-template-columns: 50px repeat(13, 1fr); gap: 2px;">
        <div></div>
        ${horas.map(h => `<div class="text-center small text-muted" style="font-size: 0.65rem;">${h}</div>`).join('')}
        ${matrix.map((row, diaIdx) => `
          <div class="small fw-semibold text-muted align-self-center" style="font-size: 0.7rem;">${diasSemana[diaIdx]}</div>
          ${row.map((value, horaIdx) => {
            const color = colorScale ? colorScale(value) : 'var(--bs-secondary-bg)'
            return `<div class="heatmap-cell" style="background: ${color}; border-radius: 2px; aspect-ratio: 1; min-height: 20px;" title="${diasSemana[diaIdx]} ${horas[horaIdx]}: ${value} ausencias"></div>`
          }).join('')}
        `).join('')}
      </div>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="d-flex align-items-center gap-2">
          <span class="small text-muted">Leyenda:</span>
          <div style="display: flex; gap: 2px;">
            <div style="width: 20px; height: 20px; background: #d4edda; border-radius: 2px;"></div>
            <div style="width: 20px; height: 20px; background: #fff3cd; border-radius: 2px;"></div>
            <div style="width: 20px; height: 20px; background: #f8d7da; border-radius: 2px;"></div>
            <div style="width: 20px; height: 20px; background: #dc3545; border-radius: 2px;"></div>
          </div>
        </div>
        <span class="small text-muted">0 - ${max} ausencias</span>
      </div>
    </div>
  `
}

function _getColorScale(max) {
  return function(value) {
    if (value === 0) return 'var(--bs-secondary-bg)'
    const ratio = value / max
    if (ratio < 0.25) return '#d4edda'
    if (ratio < 0.5) return '#fff3cd'
    if (ratio < 0.75) return '#f8d7da'
    return '#dc3545'
  }
}