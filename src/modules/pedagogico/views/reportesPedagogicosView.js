import { supabase } from '../../../lib/supabaseClient.js'
import { THRESHOLDS } from '../../progresos/services/riskRules.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'

export async function renderReportesPedagogicosView(container) {
  if (!container) return
  container.innerHTML = `<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`

  try {
    const [rendimientoClases, alumnosRiesgo] = await Promise.all([
      _fetchRendimientoPorClase(),
      _fetchAlumnosEnRiesgoCompleto(),
    ])
    container.innerHTML = _render(rendimientoClases, alumnosRiesgo)

    container.querySelector('#btn-help-reportes')?.addEventListener('click', () => {
      HelpPanel.open({
        title: 'Reportes Pedagógicos',
        intro: 'Vista agregada del rendimiento por clase y alumnos en riesgo. Útil para detectar patrones y tomar decisiones de intervención.',
        sections: [
          { icon: 'bi-table',                  title: 'Rendimiento por clase',  description: 'Cada clase activa con: alumnos inscriptos, % asistencia (4 semanas), promedio de calificaciones y nivel de ocupación.',                                  color: '#3b82f6' },
          { icon: 'bi-bar-chart-fill',         title: 'Barra de ocupación',    description: 'Verde < 70% ocupado. Amarillo 70-90%. Rojo > 90%. Detecta clases saturadas.',                                                                            color: '#10b981' },
          { icon: 'bi-percent',                title: 'Columna Asistencia',    description: 'Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%. Basado en registros de las últimas 4 semanas.',                                                                  color: '#f59e0b' },
          { icon: 'bi-star-half',              title: 'Columna Prom. Nota',    description: 'Promedio de calificaciones de la clase. Verde ≥ 7.0, amarillo ≥ 5.0, rojo < 5.0.',                                                                       color: '#6366f1' },
          { icon: 'bi-exclamation-triangle-fill', title: 'Alumnos en riesgo', description: 'Asistencia < 70% en 4 semanas (mínimo 4 clases evaluadas). Ordenados de menor a mayor tasa.',                                                            color: '#ef4444' },
        ],
      })
    })
  } catch (err) {
    console.error('[ReportesPedagogicos]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _fetchRendimientoPorClase() {
  const { data: clases } = await supabase
    .from('clases')
    .select('id, nombre, instrumento, capacidad_maxima')
    .eq('estado', 'activa')
    .order('nombre')

  if (!clases?.length) return []

  const claseIds = clases.map(c => c.id)

  const [inscritos, asistencias, progresos] = await Promise.all([
    supabase.from('alumnos_clases').select('clase_id, alumno_id').in('clase_id', claseIds),
    supabase.from('asistencias').select('clase_id, estado')
      .in('clase_id', claseIds)
      .gte('fecha', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabase.from('progresos').select('clase_id, calificacion')
      .in('clase_id', claseIds)
      .not('calificacion', 'is', null),
  ])

  return clases.map(c => {
    const inscritosClase = (inscritos.data || []).filter(i => i.clase_id === c.id)
    const asistClase     = (asistencias.data || []).filter(a => a.clase_id === c.id)
    const progClase      = (progresos.data || []).filter(p => p.clase_id === c.id)

    const tasaAsist = asistClase.length > 0
      ? Math.round((asistClase.filter(a => a.estado === 'P').length / asistClase.length) * 100) : null
    const promNotas = progClase.length > 0
      ? progClase.reduce((s, p) => s + p.calificacion, 0) / progClase.length : null
    const ocupacion = c.capacidad_maxima
      ? Math.round((inscritosClase.length / c.capacidad_maxima) * 100) : null

    return { ...c, totalAlumnos: inscritosClase.length, tasaAsist, promNotas, ocupacion }
  })
}

async function _fetchAlumnosEnRiesgoCompleto() {
  const desde = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: asistencias } = await supabase
    .from('asistencias').select('alumno_id, estado').gte('fecha', desde)

  if (!asistencias?.length) return []

  const porAlumno = {}
  asistencias.forEach(a => {
    if (!porAlumno[a.alumno_id]) porAlumno[a.alumno_id] = { total: 0, presentes: 0 }
    porAlumno[a.alumno_id].total++
    if (a.estado === 'P') porAlumno[a.alumno_id].presentes++
  })

  const enRiesgoIds = Object.entries(porAlumno)
    .filter(([, v]) => v.total >= 4 && (v.presentes / v.total) < THRESHOLDS.attendance_min_rate)
    .map(([id, v]) => ({ id, rate: v.presentes / v.total, total: v.total }))

  if (!enRiesgoIds.length) return []

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, instrumento_principal')
    .in('id', enRiesgoIds.map(e => e.id))

  return (alumnos || []).map(a => ({
    ...a,
    ...enRiesgoIds.find(e => e.id === a.id),
  })).sort((a, b) => a.rate - b.rate)
}

function _render(clases, alumnosRiesgo) {
  const colorAsist = (v) => v === null ? 'secondary' : v >= 80 ? 'success' : v >= 60 ? 'warning' : 'danger'
  const colorNota  = (v) => v === null ? 'secondary' : v >= 7 ? 'success' : v >= 5 ? 'warning' : 'danger'

  return `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-file-earmark-bar-graph fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Reportes Pedagógicos</h1>
          <p class="text-muted small mb-0">Rendimiento por clase · Alumnos en riesgo</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-reportes" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <h6 class="text-muted text-uppercase mb-2" style="font-size:0.72rem;letter-spacing:0.08em;">Rendimiento por clase (últimas 4 semanas)</h6>
      <div class="card border-0 shadow-sm mb-4">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle" style="font-size:0.83rem;">
            <thead class="table-light">
              <tr>
                <th>Clase</th>
                <th class="text-center">Alumnos</th>
                <th class="text-center">Asistencia</th>
                <th class="text-center">Prom. Nota</th>
                <th class="text-center">Ocupación</th>
              </tr>
            </thead>
            <tbody>
              ${clases.length ? clases.map(c => `
                <tr>
                  <td>
                    <div class="fw-semibold">${c.nombre}</div>
                    ${c.instrumento ? `<div class="text-muted" style="font-size:0.75rem;">${c.instrumento}</div>` : ''}
                  </td>
                  <td class="text-center">${c.totalAlumnos}</td>
                  <td class="text-center">
                    ${c.tasaAsist !== null
                      ? `<span class="badge bg-${colorAsist(c.tasaAsist)}-subtle text-${colorAsist(c.tasaAsist)} rounded-pill">${c.tasaAsist}%</span>`
                      : '<span class="text-muted">–</span>'}
                  </td>
                  <td class="text-center">
                    ${c.promNotas !== null
                      ? `<span class="fw-semibold text-${colorNota(c.promNotas)}">${c.promNotas.toFixed(1)}</span>`
                      : '<span class="text-muted">–</span>'}
                  </td>
                  <td class="text-center">
                    ${c.ocupacion !== null ? `
                      <div class="d-flex align-items-center gap-2">
                        <div style="flex:1;height:6px;background:var(--bs-tertiary-bg);border-radius:3px;overflow:hidden;">
                          <div style="width:${Math.min(c.ocupacion, 100)}%;height:100%;background:${c.ocupacion >= 90 ? '#ef4444' : c.ocupacion >= 70 ? '#f59e0b' : '#10b981'};border-radius:3px;"></div>
                        </div>
                        <span style="font-size:0.72rem;color:var(--bs-secondary-color);min-width:28px;">${c.ocupacion}%</span>
                      </div>` : '<span class="text-muted">–</span>'}
                  </td>
                </tr>`).join('') : `
                <tr><td colspan="5" class="text-center text-muted py-4">Sin clases activas</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <h6 class="text-muted text-uppercase mb-2" style="font-size:0.72rem;letter-spacing:0.08em;">
        Alumnos en riesgo — asistencia &lt; ${Math.round(THRESHOLDS.attendance_min_rate * 100)}% (4 semanas)
      </h6>
      ${alumnosRiesgo.length ? `
      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle" style="font-size:0.83rem;">
            <thead class="table-light">
              <tr>
                <th>Alumno</th>
                <th>Instrumento</th>
                <th class="text-center">Tasa asistencia</th>
                <th class="text-center">Clases evaluadas</th>
              </tr>
            </thead>
            <tbody>
              ${alumnosRiesgo.map(a => `
                <tr>
                  <td class="fw-semibold">${a.nombre_completo}</td>
                  <td class="text-muted">${a.instrumento_principal || '–'}</td>
                  <td class="text-center">
                    <span class="badge bg-danger-subtle text-danger rounded-pill">${Math.round(a.rate * 100)}%</span>
                  </td>
                  <td class="text-center text-muted">${a.total}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>` : `
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center text-muted py-4">
          <i class="bi bi-check-circle-fill text-success fs-3 d-block mb-2"></i>
          <span style="font-size:0.875rem;">Sin alumnos en riesgo detectados en las últimas 4 semanas.</span>
        </div>
      </div>`}
    </div>`
}
