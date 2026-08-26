import { getAnalisisAsistenciasPeriodoActivo } from '../api/metricasApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

function esc(str) {
  if (!str) return ''
  return escapeHTML(String(str))
}

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    const [y, m, d] = isoStr.split('-')
    if (!y || !m || !d) return isoStr
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const mIdx = parseInt(m, 10) - 1
    return `${parseInt(d, 10)} ${months[mIdx] || m} ${y}`
  } catch (e) {
    return isoStr
  }
}

export function analisisAsistenciasWidget(containerId, options = {}) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId
  if (!container) return null

  const state = {
    data: null,
    cargando: false,
    error: null,
    filtroSeveridad: 'todos', // 'todos' | 'con_faltas' | 'critico' | 'alerta' | 'perfecta'
    filtroMaestro: 'todos',
    busqueda: '',
  }

  function getFilteredAlumnos() {
    if (!state.data || !state.data.alumnos) return []
    let list = [...state.data.alumnos]

    // Filtro de severidad / estado de faltas
    if (state.filtroSeveridad === 'con_faltas') {
      list = list.filter((a) => a.totalAusentes > 0)
    } else if (state.filtroSeveridad === 'critico') {
      list = list.filter((a) => a.nivelRiesgo === 'critico')
    } else if (state.filtroSeveridad === 'alerta') {
      list = list.filter((a) => a.nivelRiesgo === 'alerta')
    } else if (state.filtroSeveridad === 'perfecta') {
      list = list.filter((a) => a.totalAusentes === 0)
    }

    // Filtro por maestro
    if (state.filtroMaestro !== 'todos') {
      list = list.filter((a) =>
        a.maestrosReportaron && a.maestrosReportaron.some((m) => m === state.filtroMaestro || m.includes(state.filtroMaestro)),
      )
    }

    // Filtro por búsqueda de texto
    if (state.busqueda.trim()) {
      const q = state.busqueda.trim().toLowerCase()
      list = list.filter(
        (a) =>
          a.alumnoNombre.toLowerCase().includes(q) ||
          (a.instrumento && a.instrumento.toLowerCase().includes(q)) ||
          (a.programa && a.programa.toLowerCase().includes(q)) ||
          (a.clasesAfectadas && a.clasesAfectadas.some((c) => c.toLowerCase().includes(q))),
      )
    }

    return list
  }

  function renderKPICards(resumen, periodo) {
    const pctConFaltas = resumen.porcentajeAlumnosConFaltas || 0
    const pctSinFaltas = resumen.totalAlumnosEvaluados > 0
      ? Number(((resumen.alumnosSinFaltas / resumen.totalAlumnosEvaluados) * 100).toFixed(1))
      : 0

    return `
      <div class="row g-3 mb-4">
        <!-- KPI 1: Alumnos que han faltado -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="obs-attendance-kpi-card obs-kpi-danger h-100">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="obs-kpi-icon-badge obs-kpi-icon-danger">
                  <i class="bi bi-person-x-fill"></i>
                </div>
                <span class="small fw-bold text-danger">Alumnos con Faltas</span>
              </div>
              <span class="obs-badge-pill obs-badge-critico">${pctConFaltas}% cohorte</span>
            </div>
            <div class="obs-kpi-value text-danger my-1">
              ${resumen.alumnosConFaltas} <span class="fs-6 text-muted fw-normal">/ ${resumen.totalAlumnosEvaluados}</span>
            </div>
            <div class="extra-small text-muted mt-auto pt-1">
              Estudiantes que han faltado al menos 1 vez en el período
            </div>
          </div>
        </div>

        <!-- KPI 2: Asistencia perfecta -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="obs-attendance-kpi-card obs-kpi-success h-100">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="obs-kpi-icon-badge obs-kpi-icon-success">
                  <i class="bi bi-person-check-fill"></i>
                </div>
                <span class="small fw-bold text-success">Asistencia Perfecta</span>
              </div>
              <span class="obs-badge-pill obs-badge-normal">${pctSinFaltas}%</span>
            </div>
            <div class="obs-kpi-value text-success my-1">
              ${resumen.alumnosSinFaltas} <span class="fs-6 text-muted fw-normal">alumnos</span>
            </div>
            <div class="extra-small text-muted mt-auto pt-1">
              0 inasistencias registradas hasta la fecha
            </div>
          </div>
        </div>

        <!-- KPI 3: Total de inasistencias registradas -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="obs-attendance-kpi-card obs-kpi-warning h-100">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="obs-kpi-icon-badge obs-kpi-icon-warning">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <span class="small fw-bold text-warning-emphasis">Total Inasistencias</span>
              </div>
              <span class="obs-badge-pill obs-badge-alerta">${resumen.tasaAusentismo}% ausentismo</span>
            </div>
            <div class="obs-kpi-value text-warning my-1">
              ${resumen.totalAusentes} <span class="fs-6 text-muted fw-normal">faltas</span>
            </div>
            <div class="extra-small text-muted mt-auto pt-1">
              + ${resumen.totalJustificados} faltas justificadas por docentes
            </div>
          </div>
        </div>

        <!-- KPI 4: Sesiones y maestros evaluadores -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="obs-attendance-kpi-card obs-kpi-primary h-100">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="obs-kpi-icon-badge obs-kpi-icon-primary">
                  <i class="bi bi-journal-bookmark-fill"></i>
                </div>
                <span class="small fw-bold text-primary">Sesiones Evaluadas</span>
              </div>
              <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle rounded-pill extra-small px-2 py-0.5">
                ${resumen.totalMaestrosConRegistros} docentes
              </span>
            </div>
            <div class="obs-kpi-value text-primary my-1">
              ${resumen.totalSesionesRegistradas} <span class="fs-6 text-muted fw-normal">clases</span>
            </div>
            <div class="extra-small text-muted mt-auto pt-1">
              ${resumen.totalRegistros} asistencias individuales evaluadas
            </div>
          </div>
        </div>
      </div>
    `
  }

  function renderFilterBar(maestros) {
    const counts = {
      todos: state.data?.alumnos?.length || 0,
      con_faltas: state.data?.alumnos?.filter((a) => a.totalAusentes > 0).length || 0,
      critico: state.data?.alumnos?.filter((a) => a.nivelRiesgo === 'critico').length || 0,
      alerta: state.data?.alumnos?.filter((a) => a.nivelRiesgo === 'alerta').length || 0,
      perfecta: state.data?.alumnos?.filter((a) => a.totalAusentes === 0).length || 0,
    }

    return `
      <div class="obs-attendance-filter-bar mb-4">
        <div class="row g-3 align-items-center">
          <!-- Buscador en tiempo real -->
          <div class="col-12 col-md-5">
            <div class="obs-search-input-wrapper">
              <i class="bi bi-search obs-search-icon"></i>
              <input 
                type="text" 
                id="obs-input-busqueda-asistencia" 
                class="form-control form-control-sm w-100" 
                placeholder="Buscar alumno, instrumento o clase..." 
                value="${esc(state.busqueda)}"
                aria-label="Buscar alumno por nombre, instrumento o clase"
              />
              ${state.busqueda ? `<button class="obs-clear-search-btn" id="obs-btn-clear-search" type="button" title="Limpiar búsqueda"><i class="bi bi-x-circle-fill"></i></button>` : ''}
            </div>
          </div>

          <!-- Selector de Docente / Maestro -->
          <div class="col-12 col-md-4">
            <div class="d-flex align-items-center gap-2">
              <label for="obs-select-maestro" class="small fw-semibold text-secondary text-nowrap mb-0">
                <i class="bi bi-person-badge text-primary me-1"></i>Docente:
              </label>
              <select id="obs-select-maestro" class="form-select form-select-sm obs-filter-select">
                <option value="todos" ${state.filtroMaestro === 'todos' ? 'selected' : ''}>Todos los docentes</option>
                ${(maestros || []).map((m) => `<option value="${esc(m.maestroNombre)}" ${state.filtroMaestro === m.maestroNombre ? 'selected' : ''}>${esc(m.maestroNombre)} (${m.totalSesiones} clases)</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Botón de reseteo rápido -->
          <div class="col-12 col-md-3 text-md-end">
            <button id="obs-btn-reset-filters" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 extra-small fw-semibold" type="button">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Restablecer filtros
            </button>
          </div>

          <!-- Segmented Filter Chips -->
          <div class="col-12 pt-1">
            <div class="d-flex gap-2 flex-wrap align-items-center">
              <span class="extra-small text-muted fw-bold text-uppercase" style="letter-spacing: 0.05em;">Severidad:</span>
              
              <button class="obs-filter-chip ${state.filtroSeveridad === 'todos' ? 'active-chip' : ''}" data-sev="todos" type="button">
                <span>Todos</span>
                <span class="obs-chip-count">${counts.todos}</span>
              </button>

              <button class="obs-filter-chip ${state.filtroSeveridad === 'con_faltas' ? 'active-chip-danger' : ''}" data-sev="con_faltas" type="button">
                <i class="bi bi-exclamation-circle-fill text-danger"></i>
                <span>Con Faltas</span>
                <span class="obs-chip-count">${counts.con_faltas}</span>
              </button>

              <button class="obs-filter-chip ${state.filtroSeveridad === 'critico' ? 'active-chip-danger' : ''}" data-sev="critico" type="button">
                <i class="bi bi-exclamation-octagon-fill text-danger"></i>
                <span>Riesgo Crítico (≥3)</span>
                <span class="obs-chip-count">${counts.critico}</span>
              </button>

              <button class="obs-filter-chip ${state.filtroSeveridad === 'alerta' ? 'active-chip-warning' : ''}" data-sev="alerta" type="button">
                <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                <span>En Alerta (1-2)</span>
                <span class="obs-chip-count">${counts.alerta}</span>
              </button>

              <button class="obs-filter-chip ${state.filtroSeveridad === 'perfecta' ? 'active-chip-success' : ''}" data-sev="perfecta" type="button">
                <i class="bi bi-check-circle-fill text-success"></i>
                <span>Asistencia Perfecta (0)</span>
                <span class="obs-chip-count">${counts.perfecta}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  function renderAlumnosTable(alumnos) {
    if (alumnos.length === 0) {
      return `
        <div class="text-center py-5 text-muted">
          <div class="obs-avatar-circle mx-auto mb-3" style="width: 54px; height: 54px; font-size: 1.5rem; opacity: 0.6;">
            <i class="bi bi-search"></i>
          </div>
          <h6 class="fw-bold mb-1">No se encontraron alumnos con los filtros seleccionados</h6>
          <p class="small text-muted mb-3">Prueba ajustando el término de búsqueda o seleccionando otro chip de severidad.</p>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="document.getElementById('obs-btn-reset-filters')?.click()">
            <i class="bi bi-arrow-repeat me-1"></i>Ver todos los alumnos
          </button>
        </div>
      `
    }

    return `
      <div class="table-responsive">
        <table class="obs-attendance-table obs-alumnos-table">
          <thead>
            <tr>
              <th scope="col" style="min-width: 220px;">Alumno / Cátedra</th>
              <th scope="col" class="text-center" style="min-width: 140px;">P / A / J</th>
              <th scope="col" style="min-width: 160px;">Tasa de Asistencia</th>
              <th scope="col" style="min-width: 200px;">Clases Afectadas & Docentes</th>
              <th scope="col" class="text-center" style="min-width: 120px;">Estado</th>
              <th scope="col" class="text-end" style="min-width: 100px;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${alumnos.map((a) => {
              const tasa = a.tasaAsistencia ?? 100
              const barColor = tasa >= 85 ? '#10b981' : tasa >= 70 ? '#f59e0b' : '#ef4444'
              
              const badgeClass = a.nivelRiesgo === 'critico'
                ? 'obs-badge-pill obs-badge-critico'
                : a.nivelRiesgo === 'alerta'
                  ? 'obs-badge-pill obs-badge-alerta'
                  : 'obs-badge-pill obs-badge-normal'

              const badgeLabel = a.nivelRiesgo === 'critico'
                ? '<i class="bi bi-exclamation-octagon-fill"></i> Crítico (≥3)'
                : a.nivelRiesgo === 'alerta'
                  ? '<i class="bi bi-exclamation-triangle-fill"></i> Alerta (1-2)'
                  : '<i class="bi bi-shield-check"></i> Normal (0)'

              const avatarInitial = a.alumnoNombre ? a.alumnoNombre.charAt(0).toUpperCase() : 'A'
              const isDangerRow = a.nivelRiesgo === 'critico'

              return `
                <tr class="${isDangerRow ? 'obs-row-danger-tint' : ''}">
                  <td>
                    <div class="d-flex align-items-center gap-2.5">
                      <div class="obs-avatar-circle ${isDangerRow ? 'risk-critico' : ''}">
                        ${avatarInitial}
                      </div>
                      <div>
                        <strong class="d-block text-body fw-bold">${esc(a.alumnoNombre)}</strong>
                        <span class="extra-small text-muted">${esc(a.instrumento || 'General')} · ${esc(a.programa || 'Académico')}</span>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1 flex-wrap">
                      <span class="badge bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-0.5 extra-small" title="Presentes: ${a.totalPresentes}">
                        <i class="bi bi-check me-0.5"></i>${a.totalPresentes}
                      </span>
                      <span class="badge ${a.totalAusentes > 0 ? 'bg-danger text-white' : 'bg-secondary bg-opacity-10 text-muted'} px-2 py-0.5 extra-small" title="Ausencias: ${a.totalAusentes}">
                        <i class="bi bi-x me-0.5"></i>${a.totalAusentes}
                      </span>
                      ${a.totalJustificados > 0 ? `<span class="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning-subtle px-1.5 py-0.5 extra-small" title="Justificados: ${a.totalJustificados}"><i class="bi bi-file-earmark-medical me-0.5"></i>${a.totalJustificados}</span>` : ''}
                    </div>
                    <div class="extra-small text-muted mt-1">${a.totalRegistros} clases tomadas</div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <div class="obs-progress-track flex-grow-1">
                        <div class="obs-progress-fill" style="width: ${Math.min(tasa, 100)}%; background-color: ${barColor};"></div>
                      </div>
                      <span class="fw-bold extra-small" style="color: ${barColor}; min-width: 38px;">${tasa}%</span>
                    </div>
                    ${a.ultimaFalta ? `<div class="extra-small text-danger"><i class="bi bi-clock-history me-1"></i>Última: ${formatDate(a.ultimaFalta)}</div>` : '<div class="extra-small text-success"><i class="bi bi-check2-circle me-1"></i>Sin inasistencias</div>'}
                  </td>
                  <td>
                    ${a.clasesAfectadas && a.clasesAfectadas.length > 0 ? `
                      <div class="extra-small fw-semibold text-body text-truncate" style="max-width: 220px;" title="${esc(a.clasesAfectadas.join(', '))}">
                        <i class="bi bi-easel me-1 text-primary"></i>${esc(a.clasesAfectadas.join(', '))}
                      </div>
                      <div class="extra-small text-muted text-truncate" style="max-width: 220px;" title="${esc((a.maestrosReportaron || []).join(', '))}">
                        <i class="bi bi-person-badge me-1"></i>Docente: ${esc((a.maestrosReportaron || []).join(', '))}
                      </div>
                    ` : '<span class="extra-small text-muted"><i class="bi bi-check-all text-success me-1"></i>Asistencia regular en todas sus materias</span>'}
                  </td>
                  <td class="text-center">
                    <span class="${badgeClass}">${badgeLabel}</span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-xs btn-outline-primary rounded-pill px-2.5 py-1 btn-ver-detalle-asistencia" data-alumno-id="${esc(a.alumnoId)}" type="button">
                      <i class="bi bi-eye me-1"></i>Detalle
                    </button>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  function renderMaestrosTable(maestros) {
    if (!maestros || maestros.length === 0) {
      return '<div class="text-center py-4 text-muted small">No hay registros de docentes en el período activo.</div>'
    }

    return `
      <div class="table-responsive">
        <table class="obs-attendance-table obs-maestros-table">
          <thead>
            <tr>
              <th scope="col">Docente / Clases</th>
              <th scope="col" class="text-center">Sesiones</th>
              <th scope="col" class="text-center">P / A / J</th>
              <th scope="col" class="text-end">Tasa Ausentismo</th>
            </tr>
          </thead>
          <tbody>
            ${maestros.map((m) => {
              const ausRate = m.tasaAusentismo ?? 0
              const rateColor = ausRate > 10 ? 'text-danger' : ausRate > 5 ? 'text-warning' : 'text-success'

              return `
                <tr>
                  <td>
                    <strong class="d-block text-body">${esc(m.maestroNombre)}</strong>
                    <span class="extra-small text-muted text-truncate d-block" style="max-width: 190px;" title="${esc((m.clases || []).join(', '))}">
                      ${esc((m.clases || []).join(', ') || 'Clases activas')}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-secondary bg-opacity-10 text-body px-2 py-1 extra-small fw-bold">${m.totalSesiones}</span>
                  </td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1 flex-wrap">
                      <span class="badge bg-success bg-opacity-10 text-success extra-small px-1.5 py-0.5" title="Presentes">${m.totalPresentes}</span>
                      <span class="badge ${m.totalAusentes > 0 ? 'bg-danger text-white' : 'bg-secondary bg-opacity-10 text-muted'} extra-small px-1.5 py-0.5" title="Ausentes">${m.totalAusentes}</span>
                      <span class="badge bg-warning bg-opacity-10 text-warning-emphasis extra-small px-1.5 py-0.5" title="Justificados">${m.totalJustificados}</span>
                    </div>
                  </td>
                  <td class="text-end">
                    <span class="fw-bold ${rateColor}">${ausRate}%</span>
                    <div class="extra-small text-muted">${m.totalRegistros} evaluados</div>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  function render() {
    if (!state.data) return

    const { periodo, resumen, maestros } = state.data
    const filteredAlumnos = getFilteredAlumnos()

    const html = `
      <div class="obs-asistencias-analisis-widget">
        <!-- Banner del Período Activo -->
        <div class="obs-periodo-banner d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="obs-periodo-icon-box">
              <i class="bi bi-calendar2-check-fill"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h5 class="fw-bold mb-0 text-body">${esc(periodo.nombre || 'Período Activo')}</h5>
                <span class="badge bg-success bg-opacity-10 text-success border border-success-subtle rounded-pill px-2.5 py-1 extra-small">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Período Activo
                </span>
              </div>
              <p class="extra-small text-muted mb-0 mt-1">
                <i class="bi bi-calendar-range me-1 text-primary"></i>Inicio: <strong class="text-body">${formatDate(periodo.fecha_inicio)}</strong>
                ${periodo.fecha_fin ? ` · Fin: <strong class="text-body">${formatDate(periodo.fecha_fin)}</strong>` : ''}
                · <span class="text-primary fw-bold"><i class="bi bi-hourglass-split me-0.5"></i>${periodo.dias_transcurridos || 0} días lectivos</span>
              </p>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1.5 rounded-pill small fw-semibold">
              <i class="bi bi-shield-check me-1"></i>Auditoría Docente & Cohorte
            </span>
          </div>
        </div>

        <!-- Tarjetas KPIs Principales -->
        ${renderKPICards(resumen, periodo)}

        <!-- Barra de Filtros e Interacción -->
        ${renderFilterBar(maestros)}

        <!-- Grid Principal: Alumnos e Inasistencias vs Monitoreo de Maestros -->
        <div class="row g-4">
          <!-- Columna 1: Ranking y Lista de Alumnos con Faltas -->
          <div class="col-12 col-xxl-8">
            <div class="obs-section-card h-100">
              <div class="obs-section-header">
                <div>
                  <h6 class="fw-bold mb-0 text-body">
                    <i class="bi bi-person-lines-fill text-primary me-2"></i>Análisis Individual de Inasistencias
                    <span class="badge bg-secondary bg-opacity-10 text-muted px-2 py-0.5 ms-1 extra-small">${filteredAlumnos.length} mostrados</span>
                  </h6>
                  <small class="text-muted extra-small">Monitoreo de estudiantes con inasistencias y riesgos acumulados en el período activo</small>
                </div>
                <span class="extra-small text-muted fw-semibold">
                  <i class="bi bi-sort-numeric-down-alt me-1 text-primary"></i>Mayor ausencia
                </span>
              </div>
              <div class="p-0">
                ${renderAlumnosTable(filteredAlumnos)}
              </div>
            </div>
          </div>

          <!-- Columna 2: Registro y Monitoreo por Docente -->
          <div class="col-12 col-xxl-4">
            <div class="obs-section-card h-100">
              <div class="obs-section-header">
                <div>
                  <h6 class="fw-bold mb-0 text-body">
                    <i class="bi bi-mortarboard-fill text-primary me-2"></i>Registros por Docente
                  </h6>
                  <small class="text-muted extra-small">Sesiones y control de asistencia por maestro</small>
                </div>
                <span class="badge bg-primary bg-opacity-10 text-primary extra-small">${maestros?.length || 0} docentes</span>
              </div>
              <div class="p-0">
                ${renderMaestrosTable(maestros)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    container.innerHTML = html
    attachEvents()
  }

  function attachEvents() {
    // Buscador
    const searchInput = container.querySelector('#obs-input-busqueda-asistencia')
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.busqueda = e.target.value
        render()
      })
    }

    const clearSearchBtn = container.querySelector('#obs-btn-clear-search')
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        state.busqueda = ''
        render()
      })
    }

    // Selector de Maestro
    const selectMaestro = container.querySelector('#obs-select-maestro')
    if (selectMaestro) {
      selectMaestro.addEventListener('change', (e) => {
        state.filtroMaestro = e.target.value
        render()
      })
    }

    // Chips de severidad
    container.querySelectorAll('[data-sev]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filtroSeveridad = btn.dataset.sev
        render()
      })
    })

    // Botón restablecer filtros
    container.querySelector('#obs-btn-reset-filters')?.addEventListener('click', () => {
      state.filtroSeveridad = 'todos'
      state.filtroMaestro = 'todos'
      state.busqueda = ''
      render()
    })

    // Botones de detalle por alumno
    container.querySelectorAll('.btn-ver-detalle-asistencia').forEach((btn) => {
      btn.addEventListener('click', () => {
        const alumnoId = btn.dataset.alumnoId
        abrirModalDetalleAlumno(alumnoId)
      })
    })
  }

  function abrirModalDetalleAlumno(alumnoId) {
    const alumno = state.data?.alumnos?.find((a) => String(a.alumnoId) === String(alumnoId))
    if (!alumno) return

    const totalFaltas = alumno.totalAusentes || 0
    const totalJust = alumno.totalJustificados || 0
    const totalPres = alumno.totalPresentes || 0
    const tasa = alumno.tasaAsistencia ?? 100

    const modalBody = `
      <div class="container-fluid p-0">
        <!-- Resumen del alumno adaptado a Dark Mode -->
        <div class="obs-modal-header-card mb-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 class="fw-bold mb-1 text-body"><i class="bi bi-person-badge text-primary me-2"></i>${esc(alumno.alumnoNombre)}</h5>
              <div class="small text-muted">${esc(alumno.instrumento)} · ${esc(alumno.programa)}</div>
            </div>
            <div class="text-end">
              <div class="fs-4 fw-bold ${tasa >= 85 ? 'text-success' : tasa >= 70 ? 'text-warning' : 'text-danger'}">${tasa}%</div>
              <div class="extra-small text-muted">Tasa de Asistencia en el Período</div>
            </div>
          </div>

          <hr class="my-3 opacity-25">

          <div class="row g-2 text-center small">
            <div class="col-4">
              <div class="obs-modal-stat-box">
                <div class="fw-bold text-success fs-5">${totalPres}</div>
                <div class="extra-small text-muted">Asistencias</div>
              </div>
            </div>
            <div class="col-4">
              <div class="obs-modal-stat-box">
                <div class="fw-bold text-danger fs-5">${totalFaltas}</div>
                <div class="extra-small text-muted">Inasistencias</div>
              </div>
            </div>
            <div class="col-4">
              <div class="obs-modal-stat-box">
                <div class="fw-bold text-warning-emphasis fs-5">${totalJust}</div>
                <div class="extra-small text-muted">Justificadas</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial de faltas y justificaciones registradas -->
        <h6 class="fw-bold mb-3 text-body"><i class="bi bi-journal-x text-danger me-2"></i>Registro Cronológico de Inasistencias</h6>
        
        ${alumno.detalleFaltas && alumno.detalleFaltas.length > 0 ? `
          <div class="d-flex flex-column gap-2">
            ${alumno.detalleFaltas.map((df) => `
              <div class="obs-timeline-item ${df.estado === 'ausente' ? 'border-start border-3 border-danger' : 'border-start border-3 border-warning'}">
                <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                  <div class="d-flex align-items-center gap-2">
                    <span class="obs-badge-pill ${df.estado === 'ausente' ? 'obs-badge-critico' : 'obs-badge-alerta'}">
                      ${df.estado === 'ausente' ? '<i class="bi bi-x-circle-fill"></i> Inasistencia' : '<i class="bi bi-file-earmark-medical-fill"></i> Justificado'}
                    </span>
                    <strong class="small text-body">${esc(df.claseNombre)}</strong>
                  </div>
                  <span class="extra-small text-muted fw-semibold"><i class="bi bi-calendar-event me-1"></i>${formatDate(df.fecha)}</span>
                </div>
                <div class="extra-small text-muted mt-1">
                  <i class="bi bi-person-video3 me-1 text-primary"></i>Registrado por: <strong class="text-body">${esc(df.maestroNombre || 'Docente')}</strong>
                </div>
                ${df.justificacion ? `
                  <div class="alert alert-warning py-1.5 px-2.5 mt-2 mb-0 extra-small">
                    <i class="bi bi-info-circle me-1"></i><strong>Motivo / Justificativo:</strong> ${esc(df.justificacion)}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="alert alert-success d-flex align-items-center gap-2 mb-0">
            <i class="bi bi-check-circle-fill fs-5"></i>
            <div>
              <strong>¡Excelente historial!</strong>
              <div class="extra-small">Este alumno no presenta inasistencias registradas en el período activo.</div>
            </div>
          </div>
        `}
      </div>
    `

    AppModal.open({
      title: `Detalle de Asistencia — ${alumno.alumnoNombre}`,
      body: modalBody,
      size: 'lg',
      hideSave: true,
      cancelText: 'Cerrar',
    })
  }

  return {
    async init() {
      state.cargando = true
      container.innerHTML = `
        <div class="obs-section-card p-5 text-center my-3">
          <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
          <div class="small text-muted">Compilando análisis de asistencias del período activo...</div>
        </div>
      `

      try {
        state.data = await getAnalisisAsistenciasPeriodoActivo()
        state.cargando = false
        render()
      } catch (err) {
        console.error('[analisisAsistenciasWidget] Error:', err)
        state.cargando = false
        state.error = err.message
        container.innerHTML = `
          <div class="alert alert-danger m-3">
            <h6><i class="bi bi-exclamation-triangle-fill me-2"></i>Error al cargar análisis de asistencias</h6>
            <p class="small mb-0">${esc(err.message)}</p>
          </div>
        `
      }
    },

    getData() {
      return state.data
    },

    destroy() {
      // Limpiar listeners si aplica
    },
  }
}
