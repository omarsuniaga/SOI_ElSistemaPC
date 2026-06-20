import { AppModal } from '../../../shared/components/AppModal.js'

const mockResumen = {
  periodo: 'Semana del 28 Abr - 4 May',
  generado: '2026-05-05 08:00',
  metricas: {
    asistenciaPromedio: 82,
    clasesDictadas: 24,
    totalEstudiantes: 45,
    nuevasPlanificaciones: 12,
  },
  destacados: [
    { tipo: 'mejora', texto: 'Los estudiantes de Guitarra Intermediate mejoraron su asistencia un 15%', icono: 'bi-arrow-up-circle text-success' },
    { tipo: 'nota', texto: '3 estudiantes alcanzaron promedio superior a 8.0', icono: 'bi-star text-warning' },
    { tipo: 'alerta', texto: '2 casos de riesgo identificados requieren atención', icono: 'bi-exclamation-triangle text-danger' },
  ],
  proximaSemana: [
    'Examen de Violin Beginners - Lunes 9:00',
    'Concierto de Guitarra - Jueves 17:00',
    'Reunión de padres - Viernes 18:00',
  ],
}

export async function renderIaResumenSemanal(container, options = {}) {
  const { titulo = 'Resumen Semanal Automático' } = options

  container.innerHTML = `
    <div class="resumen-semanal-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-newspaper me-2 text-primary"></i>${titulo}</h6>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" id="btnVerResumen" title="Ver completo">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-primary" id="btnRegenerar" title="Regenerar">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-3">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="badge bg-primary bg-opacity-10 text-primary">Semana Actual</span>
            <span class="text-muted small">${mockResumen.periodo}</span>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6 col-md-3">
              <div class="text-center p-2 bg-light rounded">
                <div class="fs-5 fw-bold text-${mockResumen.metricas.asistenciaPromedio >= 80 ? 'success' : 'warning'}">${mockResumen.metricas.asistenciaPromedio}%</div>
                <div class="small text-muted">Asistencia</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-center p-2 bg-light rounded">
                <div class="fs-5 fw-bold">${mockResumen.metricas.clasesDictadas}</div>
                <div class="small text-muted">Clases</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-center p-2 bg-light rounded">
                <div class="fs-5 fw-bold">${mockResumen.metricas.totalEstudiantes}</div>
                <div class="small text-muted">Estudiantes</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-center p-2 bg-light rounded">
                <div class="fs-5 fw-bold text-info">${mockResumen.metricas.nuevasPlanificaciones}</div>
                <div class="small text-muted">Planificaciones</div>
              </div>
            </div>
          </div>

          <div class="mb-2">
            <div class="small text-muted fw-semibold mb-1">Highlights</div>
            ${mockResumen.destacados.slice(0, 2).map(d => `
              <div class="d-flex align-items-start gap-2 mb-1">
                <i class="bi ${d.icono} mt-1"></i>
                <span class="small">${d.texto}</span>
              </div>
            `).join('')}
          </div>

          <div class="text-end">
            <span class="text-muted small">Última actualización: ${mockResumen.generado}</span>
          </div>
        </div>
      </div>
    </div>
  `

  container.querySelector('#btnVerResumen')?.addEventListener('click', () => _verResumenCompleto())
  container.querySelector('#btnRegenerar')?.addEventListener('click', () => _regenerar(container))
}

function _verResumenCompleto() {
  AppModal.open({
    title: 'Resumen Semanal Completo',
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="resumen-completo">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 class="mb-0">Resumen Institucional</h5>
            <p class="text-muted mb-0 small">${mockResumen.periodo}</p>
          </div>
          <span class="badge bg-success bg-opacity-10 text-success"><i class="bi bi-check-circle me-1"></i>Generado automáticamente</span>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card border-0 bg-light">
              <div class="card-body text-center">
                <div class="fs-4 fw-bold">${mockResumen.metricas.asistenciaPromedio}%</div>
                <small class="text-muted">Asistencia Promedio</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 bg-light">
              <div class="card-body text-center">
                <div class="fs-4 fw-bold">${mockResumen.metricas.clasesDictadas}</div>
                <small class="text-muted">Clases Dictadas</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 bg-light">
              <div class="card-body text-center">
                <div class="fs-4 fw-bold">${mockResumen.metricas.totalEstudiantes}</div>
                <small class="text-muted">Estudiantes Activos</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 bg-light">
              <div class="card-body text-center">
                <div class="fs-4 fw-bold">${mockResumen.metricas.nuevasPlanificaciones}</div>
                <small class="text-muted">Planificaciones</small>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h6 class="fw-semibold mb-2"><i class="bi bi-lightbulb me-2"></i>Highlights de la Semana</h6>
          <div class="d-flex flex-column gap-2">
            ${mockResumen.destacados.map(d => `
              <div class="d-flex align-items-start gap-2 p-2 bg-light rounded">
                <i class="bi ${d.icono} mt-1"></i>
                <span>${d.texto}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-4">
          <h6 class="fw-semibold mb-2"><i class="bi bi-calendar-event me-2"></i>Próxima Semana</h6>
          <ul class="list-group">
            ${mockResumen.proximaSemana.map(e => `
              <li class="list-group-item py-2"><i class="bi bi-chevron-right me-2 text-muted"></i>${e}</li>
            `).join('')}
          </ul>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary flex-grow-1" id="exportResumenPDF">
            <i class="bi bi-file-earmark-pdf me-1"></i>Exportar PDF
          </button>
          <button class="btn btn-outline-success flex-grow-1" id="exportResumenXlsx">
            <i class="bi bi-file-earmark-spreadsheet me-1"></i>Exportar Excel
          </button>
        </div>
      </div>
    `,
  })

  document.getElementById('exportResumenPDF')?.addEventListener('click', () => _exportarResumen('pdf'))
  document.getElementById('exportResumenXlsx')?.addEventListener('click', () => _exportarResumen('xlsx'))
}

function _regenerar(container) {
  const btn = container.querySelector('#btnRegenerar')
  btn.disabled = true
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'

  setTimeout(() => {
    btn.disabled = false
    btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>'

    AppModal.open({
      title: 'Resumen Regenerado',
      body: '<div class="alert alert-success mb-0"><i class="bi bi-check-circle me-2"></i>El resumen semanal ha sido regenerado con los datos más recientes.</div>',
      hideSave: true,
      cancelText: 'Cerrar',
    })
  }, 2000)
}

function _exportarResumen(fmt) {
  const content = `Resumen Semanal - ${mockResumen.periodo}\n\n` +
    `Asistencia: ${mockResumen.metricas.asistenciaPromedio}%\n` +
    `Clases: ${mockResumen.metricas.clasesDictadas}\n` +
    `Estudiantes: ${mockResumen.metricas.totalEstudiantes}\n\n` +
    `Highlights:\n${mockResumen.destacados.map(d => `- ${d.texto}`).join('\n')}`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `resumen-semanal.${fmt === 'pdf' ? 'txt' : fmt}`
  a.click()
  URL.revokeObjectURL(url)

  AppModal.close()
}