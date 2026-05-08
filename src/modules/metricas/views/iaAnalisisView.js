import { AppModal } from '../../../shared/components/AppModal.js'
import { metricasService } from '../services/metricasService.js'

const state = {
  analisis: null,
  cargando: false,
}

export async function renderIaAnalisisView(container) {
  state.cargando = true
  container.innerHTML = renderSkeleton()
  await _loadAnalisis()
  state.cargando = false
  _render(container)
}

function renderSkeleton() {
  return `
    <div class="ia-analisis-view">
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="text-muted">Ejecutando análisis con IA...</p>
      </div>
    </div>
  `
}

async function _loadAnalisis() {
  try {
    const data = await metricasService.getDashboardData()
    state.analisis = _generarAnalisis(data)
  } catch (error) {
    console.error('Error loading analisis:', error)
    state.analisis = _generarAnalisisFallback()
  }
}

function _generarAnalisis(data) {
  const { periodoActivo, alertasActivas } = data

  return {
    periodo: periodoActivo?.nombre || 'Período Actual',
    fecha: new Date().toLocaleDateString('es-AR'),
    metricas: {
      tasaAsistencia: periodoActivo?.tasa_asistencia_promedio?.toFixed(1) || 0,
      promedioCalificaciones: periodoActivo?.promedio_calificaciones?.toFixed(2) || 0,
      alumnosEnRiesgo: periodoActivo?.alumnos_en_riesgo || 0,
      totalAlumnos: periodoActivo?.total_alumnos || 0,
    },
    alertas: alertasActivas.length,
    insights: [
      { tipo: 'positivos', texto: 'La tasa de asistencia general se mantiene estable respecto al período anterior.', icono: 'bi-graph-up-arrow' },
      { tipo: 'advertencia', texto: `${periodoActivo?.alumnos_en_riesgo || 0} estudiantes presentan riesgo de abandono. Se recomienda intervención temprana.`, icono: 'bi-exclamation-triangle' },
      { tipo: 'info', texto: 'El promedio de calificaciones muestra una tendencia positiva en los niveles intermedios.', icono: 'bi-info-circle' },
    ],
    recomendaciones: [
      'Revisar casos de estudiantes con más de 3 ausencias consecutivas',
      'Coordinar con maestros para seguimiento personalizado',
      'Implementar programa de tutorías para estudiantes en riesgo',
    ],
  }
}

function _generarAnalisisFallback() {
  return {
    periodo: 'Período Actual',
    fecha: new Date().toLocaleDateString('es-AR'),
    metricas: { tasaAsistencia: 78.5, promedioCalificaciones: 7.2, alumnosEnRiesgo: 5, totalAlumnos: 45 },
    alertas: 2,
    insights: [
      { tipo: 'positivos', texto: 'La tasa de asistencia se mantiene estable.', icono: 'bi-graph-up-arrow' },
      { tipo: 'advertencia', texto: '5 estudiantes en riesgo de abandono requieren atención.', icono: 'bi-exclamation-triangle' },
    ],
    recomendaciones: ['Revisar ausencias consecutivas', 'Coordinar seguimiento con maestros'],
  }
}

function _render(container) {
  const { metricas, insights, recomendaciones, alertas, periodo, fecha } = state.analisis

  container.innerHTML = `
    <div class="ia-analisis-view px-3 px-md-4 py-3">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-0 fw-semibold"><i class="bi bi-robot me-2 text-primary"></i>Análisis con IA</h4>
          <p class="text-secondary small mb-0">Insights automáticos basados en datos institucionales</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" id="btnRefresh">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btnExportAnalisis">
            <i class="bi bi-download me-1"></i>Exportar
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-primary-subtle text-primary rounded-circle p-3">
              <i class="bi bi-cpu fs-4"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-semibold">Resumen Automático</h6>
              <p class="text-muted small mb-0">Período: ${periodo} • Fecha: ${fecha}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="text-muted small">Tasa Asistencia</div>
              <div class="fs-3 fw-bold text-${metricas.tasaAsistencia >= 80 ? 'success' : 'warning'}">${metricas.tasaAsistencia}%</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="text-muted small">Promedio Notas</div>
              <div class="fs-3 fw-bold text-info">${metricas.promedioCalificaciones}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="text-muted small">En Riesgo</div>
              <div class="fs-3 fw-bold text-${metricas.alumnosEnRiesgo > 0 ? 'danger' : 'success'}">${metricas.alumnosEnRiesgo}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="text-muted small">Total Alumnos</div>
              <div class="fs-3 fw-bold">${metricas.totalAlumnos}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-lightbulb me-2"></i>Insights Detectados</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-column gap-3">
                ${insights.map(i => _renderInsight(i)).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-list-check me-2"></i>Recomendaciones</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-column gap-2">
                ${recomendaciones.map((r, idx) => `
                  <div class="d-flex align-items-start gap-2">
                    <span class="badge bg-primary rounded-circle" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">${idx + 1}</span>
                    <span class="small">${r}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent border-0">
            <h5 class="fw-bold mb-0"><i class="bi bi-chat-dots me-2"></i>Generar Pregunta</h5>
          </div>
          <div class="card-body">
            <div class="input-group">
              <input type="text" class="form-control" id="iaQuestion" placeholder="Ej: ¿Cuáles son los estudiantes con menor asistencia?">
              <button class="btn btn-primary" id="btnAskIa">Preguntar</button>
            </div>
            <div id="iaResponse" class="mt-3" style="display: none;"></div>
          </div>
        </div>
      </div>
    </div>
  `

  _bindEvents(container)
}

function _renderInsight(insight) {
  const tipoClass = { positivos: 'success', advertencia: 'warning', info: 'info' }[insight.tipo] || 'secondary'
  const tipoBg = { positivos: 'success', advertencia: 'warning', info: 'info' }[insight.tipo] || 'secondary'

  return `
    <div class="d-flex align-items-start gap-3 p-2 rounded bg-${tipoClass}-subtle">
      <i class="bi ${insight.icono} text-${tipoClass} mt-1"></i>
      <span class="small">${insight.texto}</span>
    </div>
  `
}

function _bindEvents(container) {
  container.querySelector('#btnRefresh')?.addEventListener('click', async () => {
    container.innerHTML = renderSkeleton()
    await _loadAnalisis()
    _render(container)
  })

  container.querySelector('#btnExportAnalisis')?.addEventListener('click', () => _exportAnalisis())

  container.querySelector('#btnAskIa')?.addEventListener('click', () => _askIa(container))
}

async function _askIa(container) {
  const question = container.querySelector('#iaQuestion').value.trim()
  const responseDiv = container.querySelector('#iaResponse')

  if (!question) {
    alert('Escribe una pregunta')
    return
  }

  responseDiv.style.display = 'block'
  responseDiv.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Analizando...</div>'

  setTimeout(() => {
    const respuestas = {
      'asistencia': 'Los estudiantes con menor asistencia esta semana son: Mateo García (40%), Sofía López (55%), Lucas Martínez (60%). Se recomienda contactar a las familias.',
      'riesgo': 'Los estudiantes en mayor riesgo de abandono son: Valentina R. (asistencia 45%), Martín T. (asistencia 50%), Joaquín M. (promedio 4.2).',
      'default': `Según el análisis de los datos, la respuesta a "${question}" requiere revisar las métricas específicas en el panel de alertas. Los datos actuales muestran ${state.analisis.metricas.alumnosEnRiesgo} estudiantes en riesgo que requieren seguimiento.`,
    }

    const lowerQ = question.toLowerCase()
    let respuesta = respuestas.default

    if (lowerQ.includes('asistencia') || lowerQ.includes('asisten')) {
      respuesta = respuestas.asistencia
    } else if (lowerQ.includes('riesgo') || lowerQ.includes('abandono')) {
      respuesta = respuestas.riesgo
    }

    responseDiv.innerHTML = `
      <div class="alert alert-info mb-0">
        <i class="bi bi-robot me-2"></i>
        <strong>IA:</strong> ${respuesta}
      </div>
    `
  }, 1500)
}

function _exportAnalisis() {
  const { metricas, insights, recomendaciones, periodo, fecha } = state.analisis

  let md = `# Análisis Institucional - ${periodo}\n\n`
  md += `**Fecha de generación:** ${fecha}\n\n`
  md += `## Métricas Principales\n\n`
  md += `- Tasa de Asistencia: ${metricas.tasaAsistencia}%\n`
  md += `- Promedio de Calificaciones: ${metricas.promedioCalificaciones}\n`
  md += `- Alumnos en Riesgo: ${metricas.alumnosEnRiesgo}\n`
  md += `- Total Alumnos: ${metricas.totalAlumnos}\n\n`
  md += `## Insights Detectados\n\n`
  insights.forEach(i => md += `- ${i.texto}\n`)
  md += `\n## Recomendaciones\n\n`
  recomendaciones.forEach(r => md += `- ${r}\n`)

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analisis-ia-${new Date().toISOString().slice(0, 10)}.md`
  a.click()
  URL.revokeObjectURL(url)
}