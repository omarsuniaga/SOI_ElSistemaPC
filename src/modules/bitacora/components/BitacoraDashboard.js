import * as bitacoraAdapter from '../api/bitacoraAdapter.js'

const SEMAFORO_CONFIG = {
  verde: { class: 'bg-success', label: 'Bien', icon: 'bi-check-circle-fill' },
  naranja: { class: 'bg-warning', label: 'Regular', icon: 'bi-exclamation-circle-fill' },
  rojo: { class: 'bg-danger', label: 'Mal', icon: 'bi-x-circle-fill' },
  gris: { class: 'bg-secondary', label: 'Sin datos', icon: 'bi-dash-circle' },
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  )
}

function getAlumnoName(alumnos, alumnoId) {
  const a = alumnos?.find((x) => x.id === alumnoId)
  return a ? (a.nombre_completo || a.nombre || a.name || alumnoId) : alumnoId
}

function createSemaforoDot(semaforoKey, counts) {
  const cfg = SEMAFORO_CONFIG[semaforoKey] || SEMAFORO_CONFIG.gris
  const tooltipParts = []
  if (counts) {
    if (counts.bien_count > 0) tooltipParts.push(`Bien: ${counts.bien_count}`)
    if (counts.regular_count > 0) tooltipParts.push(`Regular: ${counts.regular_count}`)
    if (counts.mal_count > 0) tooltipParts.push(`Mal: ${counts.mal_count}`)
  }
  const tooltip = tooltipParts.length ? tooltipParts.join(' | ') : cfg.label

  return `<span class="d-inline-block rounded-circle ${cfg.class}" 
    style="width:14px;height:14px;cursor:pointer" 
    title="${escapeHTML(tooltip)}"
    data-bs-toggle="tooltip"></span>`
}

function buildSemaforoMap(semaforoData) {
  const map = {}
  for (const s of semaforoData) {
    const key = `${s.objetivo_id}::${s.alumno_id}`
    map[key] = s
  }
  return map
}

export async function createBitacoraDashboard(claseId, alumnos = []) {
  const root = document.createElement('div')
  root.className = 'bitacora-dashboard'

  root.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando bitácora...</span>
      </div>
    </div>`

  try {
    const [objetivos, semaforoData] = await Promise.all([
      bitacoraAdapter.getObjetivosClase(claseId),
      bitacoraAdapter.getSemaforoClase(claseId),
    ])

    const sortedObjetivos = [...(objetivos || [])].sort((a, b) => (a.orden || 0) - (b.orden || 0))

    const alumnoIds = [...new Set((semaforoData || []).map((s) => s.alumno_id))]
    const columnAlumnos = alumnoIds.length
      ? alumnoIds.map((id) => alumnos.find((a) => a.id === id)).filter(Boolean)
      : (alumnos || [])

    const semaforoMap = buildSemaforoMap(semaforoData || [])

    if (!sortedObjetivos.length) {
      root.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-journal-x d-block mb-3" style="font-size:2.5rem;opacity:.3"></i>
          <p class="text-muted mb-0">No hay objetivos de contenido registrados para esta clase.</p>
        </div>`
      return root
    }

    const hasData = semaforoData && semaforoData.length > 0

    root.innerHTML = `
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-sm mb-0 bitacora-grid">
          <thead class="table-light">
            <tr>
              <th style="min-width:200px">Objetivo</th>
              ${columnAlumnos.map((a) =>
                `<th class="text-center" style="min-width:90px">
                  <span class="small fw-normal">${escapeHTML(getAlumnoName([a], a.id))}</span>
                </th>`
              ).join('')}
              <th class="text-center" style="width:80px">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${sortedObjetivos.map((obj) => {
              const titulo = obj.titulo || obj.descripcion || 'Sin título'
              return `
                <tr>
                  <td class="align-middle">
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-secondary rounded-pill" style="font-size:.7rem">${obj.orden || '-'}</span>
                      <span class="small">${escapeHTML(titulo)}</span>
                    </div>
                  </td>
                  ${columnAlumnos.map((a) => {
                    const key = `${obj.id}::${a.id}`
                    const s = semaforoMap[key]
                    const semaforoKey = s ? s.semaforo : 'gris'
                    const counts = s || {}
                    return `
                      <td class="text-center align-middle">
                        ${createSemaforoDot(semaforoKey, counts)}
                      </td>`
                  }).join('')}
                  <td class="text-center align-middle">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary btn-registrar" 
                        data-objetivo-id="${obj.id}" title="Registrar sesión">
                        <i class="bi bi-plus-circle"></i>
                      </button>
                      ${hasData ? `
                        <button class="btn btn-outline-secondary btn-historial" 
                          data-objetivo-id="${obj.id}" title="Ver historial">
                          <i class="bi bi-clock-history"></i>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>`

    root.querySelectorAll('.btn-registrar').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.dispatchEvent(new CustomEvent('registrar-contenido', {
          bubbles: true,
          detail: { objetivoId: btn.dataset.objetivoId },
        }))
      })
    })

    root.querySelectorAll('.btn-historial').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.dispatchEvent(new CustomEvent('ver-historial', {
          bubbles: true,
          detail: { objetivoId: btn.dataset.objetivoId },
        }))
      })
    })

    if (window.bootstrap?.Tooltip) {
      const tooltipTriggerList = root.querySelectorAll('[data-bs-toggle="tooltip"]')
      ;[...tooltipTriggerList].map((el) => new window.bootstrap.Tooltip(el))
    }
  } catch (error) {
    console.error('[BitacoraDashboard]', error)
    root.innerHTML = `
      <div class="alert alert-danger d-flex align-items-start gap-2 mb-0" role="alert">
        <i class="bi bi-exclamation-triangle fs-4 mt-1"></i>
        <div>
          <h6 class="alert-heading mb-1">Error al cargar la bitácora</h6>
          <p class="mb-0 small">${escapeHTML(error.message)}</p>
        </div>
      </div>`
  }

  return root
}
