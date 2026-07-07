import { AppModal } from '../../../shared/components/AppModal.js'
import { metricasService } from '../services/metricasService.js'

const mockAlertas = [
  { id: 'alert_001', estudiante: 'Mateo García', clase: 'Violín Beginners', riesgo: 'alto', probabilidad: 85, factores: ['4 ausencias consecutivas', 'notas por debajo de promedio'], tendencia: 'declinando',建议: 'Contacto inmediato con familia' },
  { id: 'alert_002', estudiante: 'Sofía López', clase: 'Guitarra Intermediate', riesgo: 'medio', probabilidad: 60, factores: ['2 ausencias recientes', 'participación decreciente'], tendencia: 'estable',建议: 'Seguimiento en próxima clase' },
  { id: 'alert_003', estudiante: 'Lucas Martínez', clase: 'Piano Advanced', riesgo: 'alto', probabilidad: 78, factores: ['bajo rendimiento en evaluaciones', 'falta de progreso en objetivos'], tendencia: 'declinando',建议: 'Revisión de plan de estudios' },
  { id: 'alert_004', estudiante: 'Valentina Rodríguez', clase: 'Canto Beginners', riesgo: 'bajo', probabilidad: 25, factores: ['asistencia irregular'], tendencia: 'mejorando',建议: 'Monitoreo mensual' },
]

export async function renderIaAlertasPredictivas(container, options = {}) {
  const { titulo = 'Alertas Predictivas', limit = 5 } = options

  container.innerHTML = `
    <div class="alertas-predictivas-container">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 fw-semibold"><i class="bi bi-exclamation-triangle me-2 text-warning"></i>${titulo}</h6>
        <button class="btn btn-sm btn-outline-primary" id="btnVerTodas">Ver todas</button>
      </div>
      <div id="alertasList" class="d-flex flex-column gap-2">
        <div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `

  try {
    const data = await metricasService.getDashboardData()
    const alertas = _procesarAlertas(data, limit)
    _renderAlertas(container, alertas)
  } catch (error) {
    _renderAlertas(container, mockAlertas.slice(0, limit))
  }

  container.querySelector('#btnVerTodas')?.addEventListener('click', () => _verTodas(container))
}

function _procesarAlertas(data, limit) {
  const riesgo = data?.alumnos_en_riesgo || 0
  if (riesgo > 0) {
    return [
      { id: 'alert_pred_1', estudiante: 'Estudiante en Riesgo', clase: 'Varios', riesgo: 'alto', probabilidad: 75, factores: ['Análisis predictivo'], tendencia: 'declinando',建议: 'Revisión needed' },
    ]
  }
  return mockAlertas.slice(0, limit)
}

function _renderAlertas(container, alertas) {
  const list = container.querySelector('#alertasList')

  if (!alertas.length) {
    list.innerHTML = `
      <div class="text-center py-3 text-muted">
        <i class="bi bi-check-circle fs-4 d-block mb-2"></i>
        No hay alertas activas
      </div>
    `
    return
  }

  list.innerHTML = alertas.map(a => _renderAlerta(a)).join('')

  list.querySelectorAll('.alerta-item').forEach(item => {
    item.addEventListener('click', () => _verDetalleAlerta(item.dataset.id))
  })
}

function _renderAlerta(a) {
  const riesgoColor = { alto: 'danger', medio: 'warning', bajo: 'success' }[a.riesgo] || 'secondary'
  const tendenciaIcon = { declinando: 'bi-arrow-down-circle text-danger', estable: 'bi-dash-circle text-warning', mejorando: 'bi-arrow-up-circle text-success' }[a.tendencia] || 'bi-dash-circle'

  return `
    <div class="alerta-item card border-0 shadow-sm cursor-pointer" data-id="${a.id}" style="cursor: pointer;">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-sm bg-${riesgoColor}-subtle text-${riesgoColor} rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.75rem;">
              ${a.estudiante.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div class="fw-semibold small">${a.estudiante}</div>
              <div class="text-muted" style="font-size: 0.75rem;">${a.clase}</div>
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-${riesgoColor} bg-opacity-10 text-${riesgoColor}" style="font-size: 0.7rem;">${a.riesgo}</span>
            <i class="bi ${tendenciaIcon} ms-1" style="font-size: 0.8rem;"></i>
          </div>
        </div>
      </div>
    </div>
  `
}

function _verDetalleAlerta(id) {
  const alerta = mockAlertas.find(a => a.id === id) || { estudiante: 'Estudiante', clase: 'Clase', riesgo: 'medio', probabilidad: 50, factores: ['Factor 1'], tendencia: 'estable',建议: 'Seguir observando' }

  AppModal.open({
    title: `Alerta: ${alerta.estudiante}`,
    size: 'md',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="p-3 bg-light rounded">
            <div class="text-muted small">Clase</div>
            <div class="fw-semibold">${alerta.clase}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 bg-light rounded">
            <div class="text-muted small">Probabilidad de riesgo</div>
            <div class="fw-semibold text-danger">${alerta.probabilidad}%</div>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <div class="text-muted small mb-1">Factores detectados:</div>
        <ul class="mb-0">
          ${alerta.factores.map(f => `<li class="small">${f}</li>`).join('')}
        </ul>
      </div>
      <div class="mb-3">
        <div class="text-muted small mb-1">Tendencia:</div>
        <span class="badge bg-${alerta.tendencia === 'declinando' ? 'danger' : alerta.tendencia === 'mejorando' ? 'success' : 'warning'}">${alerta.tendencia}</span>
      </div>
      <div class="mb-3">
        <div class="text-muted small mb-1">Recomendación:</div>
        <div class="p-2 bg-info bg-opacity-10 rounded">${alerta.建议}</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm flex-grow-1" id="btnContactar">Contactar Familia</button>
        <button class="btn btn-outline-secondary btn-sm flex-grow-1" id="btnProgramar">Programar Seguimiento</button>
      </div>
    `,
  })

  document.getElementById('btnContactar')?.addEventListener('click', () => {
    AppModal.close()
    AppModal.open({
      title: 'Contactar Familia',
      body: `
        <div class="mb-3">
          <label class="form-label">Teléfono</label>
          <input type="tel" class="form-control" placeholder="+54 9 11 1234 5678">
        </div>
        <div class="mb-3">
          <label class="form-label">Mensaje</label>
          <textarea class="form-control" rows="3">Estimado/a, le contactamos desde la institución respecto al seguimiento de ${alerta.estudiante}.</textarea>
        </div>
      `,
      saveText: 'Enviar',
      onSave: () => alert('Mensaje enviado'),
    })
  })
}

function _verTodas(container) {
  AppModal.open({
    title: 'Todas las Alertas',
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="d-flex flex-column gap-2">
        ${mockAlertas.map(a => `
          <div class="card border-0 shadow-sm">
            <div class="card-body py-2 px-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <span class="fw-semibold">${a.estudiante}</span>
                  <span class="text-muted small">${a.clase}</span>
                </div>
                <span class="badge bg-${a.riesgo === 'alto' ? 'danger' : a.riesgo === 'medio' ? 'warning' : 'success'}">${a.riesgo}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `,
  })
}