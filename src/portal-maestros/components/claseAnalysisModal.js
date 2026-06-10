import { generateClaseAnalysis, getClaseDataForAnalysis, getContentTracking } from '../services/claseAnalysisService.js'

export async function openClaseAnalysisModal(claseId, fechaActual = new Date().toISOString().split('T')[0], semanas = 4) {
  // Crear backdrop + modal
  const backdrop = document.createElement('div')
  backdrop.className = 'clase-analysis-backdrop'
  backdrop.innerHTML = `
    <div class="clase-analysis-modal">
      <div class="clase-analysis-header">
        <h3>Análisis de la Clase</h3>
        <button class="clase-analysis-close" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="clase-analysis-body">
        <div class="clase-analysis-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <p>Analizando datos...</p>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(backdrop)

  // Event listeners
  const closeBtn = backdrop.querySelector('.clase-analysis-close')
  closeBtn.addEventListener('click', () => backdrop.remove())
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove()
  })

  // Generar análisis
  try {
    const [claseData, contentTracking] = await Promise.all([
      getClaseDataForAnalysis(claseId, fechaActual, semanas),
      getContentTracking(claseId, fechaActual, semanas),
    ])

    if (!claseData) throw new Error('No se pudo obtener datos de la clase')

    const analysis = await generateClaseAnalysis(claseData, contentTracking)

    const body = backdrop.querySelector('.clase-analysis-body')
    if (analysis) {
      body.innerHTML = `
        <div class="clase-analysis-content">
          <div class="clase-info">
            <strong>${claseData.nombre}</strong>
            <small>${claseData.instrumento}</small>
          </div>

          ${contentTracking && contentTracking.sesiones && contentTracking.sesiones.length > 0 ? `
            <div class="content-tracking-section">
              <h4>📚 Contenido de las últimas semanas</h4>
              ${contentTracking.sesiones.slice(0, 5).map((s) => `
                <div class="content-item">
                  <div class="content-date">${s.fecha}</div>
                  <div class="content-title">${s.contenido}</div>
                  <div class="content-attendance">
                    <span class="badge badge-success">${s.totalPresentes} presentes</span>
                    ${s.totalAusentes > 0 ? `<span class="badge badge-danger">${s.totalAusentes} ausentes</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="analysis-section">
            <h4>Resumen</h4>
            <p>${analysis.resumen || 'Sin resumen disponible'}</p>
          </div>

          ${analysis.alerta ? `
            <div class="analysis-alert">
              <i class="bi bi-exclamation-triangle-fill"></i>
              ${analysis.alerta}
            </div>
          ` : ''}

          ${analysis.fortalezas && analysis.fortalezas.length > 0 ? `
            <div class="analysis-section">
              <h4 class="text-success">✓ Fortalezas</h4>
              <ul class="analysis-list">
                ${analysis.fortalezas.map((f) => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${analysis.preocupaciones && analysis.preocupaciones.length > 0 ? `
            <div class="analysis-section">
              <h4 class="text-warning">⚠ Preocupaciones</h4>
              <ul class="analysis-list">
                ${analysis.preocupaciones.map((p) => `<li>${p}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${analysis.recomendaciones && analysis.recomendaciones.length > 0 ? `
            <div class="analysis-section">
              <h4 class="text-info">💡 Recomendaciones</h4>
              <ul class="analysis-list">
                ${analysis.recomendaciones.map((r) => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="analysis-metrics">
            <div class="metric">
              <span class="metric-label">Cumplimiento</span>
              <span class="metric-value">${claseData.cumplimiento}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Alumnos</span>
              <span class="metric-value">${claseData.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Presentes</span>
              <span class="metric-value">${claseData.alumnosPresentes}/${claseData.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">En riesgo</span>
              <span class="metric-value">${claseData.alumnosEnRiesgo}</span>
            </div>
          </div>
        </div>
      `
    } else {
      body.innerHTML = `
        <div class="clase-analysis-content">
          <div class="clase-info">
            <strong>${claseData.nombre}</strong>
            <small>${claseData.instrumento}</small>
          </div>
          <p class="text-muted">No fue posible generar el análisis. Verifícalo manualmente.</p>
          <div class="analysis-metrics">
            <div class="metric">
              <span class="metric-label">Cumplimiento</span>
              <span class="metric-value">${claseData.cumplimiento}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Alumnos</span>
              <span class="metric-value">${claseData.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Presentes</span>
              <span class="metric-value">${claseData.alumnosPresentes}/${claseData.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">En riesgo</span>
              <span class="metric-value">${claseData.alumnosEnRiesgo}</span>
            </div>
          </div>
        </div>
      `
    }
  } catch (err) {
    console.error('[ClaseAnalysisModal] Error:', err)
    const body = backdrop.querySelector('.clase-analysis-body')
    body.innerHTML = `
      <div class="clase-analysis-content">
        <p class="text-danger">Error al cargar el análisis: ${err.message}</p>
      </div>
    `
  }
}

// Inyectar estilos
function _injectStyles() {
  if (document.getElementById('clase-analysis-styles')) return

  const style = document.createElement('style')
  style.id = 'clase-analysis-styles'
  style.textContent = `
    .clase-analysis-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .clase-analysis-modal {
      background: var(--bs-body-bg);
      border-radius: 0.75rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .clase-analysis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-bottom: 1px solid var(--bs-border-color);
      background: var(--bs-secondary-bg);
    }

    .clase-analysis-header h3 {
      margin: 0;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .clase-analysis-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--bs-secondary);
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .clase-analysis-close:hover {
      background: var(--bs-border-color);
      color: var(--bs-body-color);
    }

    .clase-analysis-body {
      overflow-y: auto;
      flex: 1;
      padding: 1.25rem;
    }

    .clase-analysis-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      min-height: 150px;
      color: var(--bs-secondary);
    }

    .clase-analysis-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .clase-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem;
      background: var(--bs-secondary-bg);
      border-radius: 0.5rem;
    }

    .clase-info strong {
      font-size: 1rem;
      color: var(--bs-body-color);
    }

    .clase-info small {
      color: var(--bs-secondary);
      font-size: 0.8rem;
    }

    .analysis-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .analysis-section h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--bs-body-color);
    }

    .analysis-section p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--bs-body-color);
    }

    .analysis-list {
      margin: 0;
      padding-left: 1.25rem;
      list-style: disc;
    }

    .analysis-list li {
      font-size: 0.9rem;
      line-height: 1.4;
      color: var(--bs-body-color);
      margin-bottom: 0.4rem;
    }

    .analysis-alert {
      padding: 0.75rem 1rem;
      background: rgba(220, 38, 38, 0.1);
      border-left: 3px solid #dc2626;
      border-radius: 0.25rem;
      color: #991b1b;
      font-size: 0.9rem;
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .analysis-alert i {
      margin-top: 2px;
      flex-shrink: 0;
    }

    .analysis-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--bs-border-color);
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      background: var(--bs-secondary-bg);
      border-radius: 0.5rem;
      text-align: center;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--bs-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--bs-primary);
    }

    .content-tracking-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bs-secondary-bg);
      border-radius: 0.5rem;
      border-left: 3px solid var(--bs-info, #0dcaf0);
    }

    .content-tracking-section h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--bs-body-color);
    }

    .content-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 0.5rem;
      background: var(--bs-body-bg);
      border-radius: 0.35rem;
      border-left: 2px solid var(--bs-info, #0dcaf0);
    }

    .content-date {
      font-size: 0.75rem;
      color: var(--bs-secondary);
      font-weight: 600;
    }

    .content-title {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--bs-body-color);
      line-height: 1.3;
    }

    .content-attendance {
      display: flex;
      gap: 0.4rem;
      font-size: 0.75rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 500;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .badge-danger {
      background: rgba(220, 38, 38, 0.15);
      color: #dc2626;
    }

    .text-success { color: #10b981; }
    .text-warning { color: #f59e0b; }
    .text-info { color: #0dcaf0; }
    .text-danger { color: #dc2626; }
    .text-muted { color: var(--bs-secondary); }
  `
  document.head.appendChild(style)
}

_injectStyles()
