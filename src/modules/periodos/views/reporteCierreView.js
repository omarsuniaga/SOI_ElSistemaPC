import { escapeHTML } from '../../../shared/utils/sanitize.js'
import {
  obtenerReporteCierre,
  listarPeriodosReportables,
  explicarListaVacia,
  clasificarDocente,
  fmtPct,
  ESTADO,
  VEREDICTO,
} from '../api/reporteCierreApi.js'
import { generarInformePdfCierreSemestre } from '../services/pdfCierreSemestre.js'

/**
 * Informe Ejecutivo de Cierre de Semestre — vista navegable.
 *
 * Principio rector de este render: cuando un dato no existe, la interfaz lo dice
 * con todas sus letras y explica por qué. No se rellena con ceros ni con cienes.
 * Un tablero que muestra "100 %" sobre cero evidencia no informa: desinforma con
 * autoridad, que es peor.
 */

const SIN_DATO = '<span class="text-muted fst-italic">Sin datos</span>'

/** Píldora de estado reutilizable para bloques que declaran su propia validez. */
function badgeEstado(estado) {
  const mapa = {
    [ESTADO.EVALUABLE]:            ['success',   'Evaluable'],
    [ESTADO.PARCIAL]:              ['warning',   'Datos parciales'],
    [ESTADO.SIN_DATOS]:            ['secondary', 'Sin datos'],
    [ESTADO.REQUIERE_VALIDACION]:  ['danger',    'Requiere validación'],
    [ESTADO.CORREGIDA_EN_LECTURA]: ['info',      'Corregido en lectura'],
    [ESTADO.SIN_CLASES_ASIGNADAS]: ['secondary', 'Sin clases asignadas'],
  }
  const [tone, texto] = mapa[estado] ?? ['secondary', estado ?? '—']
  return `<span class="badge bg-${tone}-subtle text-${tone} border border-${tone}-subtle rounded-pill">${escapeHTML(texto)}</span>`
}

function kpi(label, valor, sub, tone = 'primary') {
  const mostrado = valor === null || valor === undefined ? SIN_DATO : escapeHTML(String(valor))
  return `
    <div class="col-6 col-lg-3">
      <div class="p-3 rounded-3 border bg-body h-100">
        <div class="text-muted text-uppercase fw-semibold" style="font-size:.68rem;letter-spacing:.04em;">${escapeHTML(label)}</div>
        <div class="fs-4 fw-bold text-${tone} lh-1 my-1">${mostrado}</div>
        <div class="text-muted" style="font-size:.72rem;">${escapeHTML(sub ?? '')}</div>
      </div>
    </div>`
}

export async function renderReporteCierreView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h2 class="fw-bold mb-1">Informe Ejecutivo de Cierre</h2>
          <p class="text-muted mb-0">Consolidado académico, docente y patrimonial del período.</p>
        </div>
        <div class="d-flex align-items-end gap-2">
          <div>
            <label class="form-label small fw-semibold mb-1" for="rc-periodo">Período</label>
            <select id="rc-periodo" class="form-select form-select-sm" style="min-width:230px;">
              <option>Cargando…</option>
            </select>
          </div>
          <button id="rc-generar" class="btn btn-primary btn-sm d-flex align-items-center gap-2">
            <i class="bi bi-arrow-clockwise"></i> Generar
          </button>
          <button id="rc-pdf" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-2" disabled>
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
        </div>
      </div>
      <div id="rc-contenido">
        <div class="text-center py-5 text-muted">
          Seleccione un período y presione <strong>Generar</strong>.
        </div>
      </div>
    </div>`

  const selPeriodo = container.querySelector('#rc-periodo')
  const btnGenerar = container.querySelector('#rc-generar')
  const btnPdf = container.querySelector('#rc-pdf')
  const contenido = container.querySelector('#rc-contenido')

  let reporteActual = null

  try {
    const periodos = await listarPeriodosReportables()

    if (periodos.length === 0) {
      // Cero filas no significa "no existen": RLS filtra sin devolver error.
      const motivo = await explicarListaVacia()
      selPeriodo.innerHTML = '<option value="">Sin períodos disponibles</option>'
      btnGenerar.disabled = true
      contenido.innerHTML = alerta('warning', 'No hay períodos disponibles para consultar', motivo)
    } else {
      selPeriodo.innerHTML = periodos.map(p => {
        const marca = p.activo ? ' — activo' : p.cerrado ? ' — cerrado' : ''
        return `<option value="${escapeHTML(p.id)}">${escapeHTML(p.nombre)}${escapeHTML(marca)}</option>`
      }).join('')
    }
  } catch (err) {
    selPeriodo.innerHTML = '<option value="">Error al cargar</option>'
    btnGenerar.disabled = true
    contenido.innerHTML = alerta('danger', 'No se pudieron cargar los períodos', err.message)
  }

  btnGenerar.addEventListener('click', async () => {
    const periodoId = selPeriodo.value
    if (!periodoId) return

    btnGenerar.disabled = true
    btnPdf.disabled = true
    contenido.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-3 mb-0">Consolidando datos del período…</p>
      </div>`

    try {
      reporteActual = await obtenerReporteCierre(periodoId)
      contenido.innerHTML = renderInforme(reporteActual)
      btnPdf.disabled = false
    } catch (err) {
      reporteActual = null
      contenido.innerHTML = alerta('danger', 'No se pudo generar el informe', err.message)
    } finally {
      btnGenerar.disabled = false
    }
  })

  btnPdf.addEventListener('click', async () => {
    if (!reporteActual) return
    const original = btnPdf.innerHTML
    btnPdf.disabled = true
    btnPdf.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generando…'
    try {
      const doc = await generarInformePdfCierreSemestre(reporteActual)
      const nombre = String(reporteActual.periodo?.nombre ?? 'periodo').replace(/[^\w-]+/g, '_')
      doc.save(`Informe_Cierre_${nombre}.pdf`)
    } catch (err) {
      contenido.insertAdjacentHTML('afterbegin',
        alerta('danger', 'No se pudo generar el PDF', err.message))
    } finally {
      btnPdf.disabled = false
      btnPdf.innerHTML = original
    }
  })
}

function alerta(tone, titulo, detalle) {
  return `<div class="alert alert-${tone} d-flex gap-2 align-items-start">
    <i class="bi bi-exclamation-triangle-fill"></i>
    <div><strong>${escapeHTML(titulo)}</strong><div class="small">${escapeHTML(detalle ?? '')}</div></div>
  </div>`
}

function seccion(titulo, cuerpo, sufijo = '') {
  return `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-body-tertiary border-0 d-flex justify-content-between align-items-center py-3">
        <h5 class="mb-0 fw-bold">${escapeHTML(titulo)}</h5>
        <div>${sufijo}</div>
      </div>
      <div class="card-body">${cuerpo}</div>
    </div>`
}

function renderInforme(r) {
  return [
    renderCabecera(r),
    renderResumen(r),
    renderDocentes(r),
    renderClases(r),
    renderPromocion(r),
    renderInstrumentos(r),
    renderIndicadores(r),
    renderBrechas(r),
  ].join('')
}

function renderCabecera(r) {
  const p = r.periodo ?? {}
  const inconsistente = p.activo && p.cerrado
  return `
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <h4 class="fw-bold mb-0">${escapeHTML(p.nombre ?? 'Período')}</h4>
      <span class="text-muted">${escapeHTML(p.fecha_inicio ?? '?')} → ${escapeHTML(p.fecha_fin ?? '?')}</span>
      ${p.activo ? '<span class="badge bg-success rounded-pill">Activo</span>' : ''}
      ${p.cerrado ? '<span class="badge bg-secondary rounded-pill">Cerrado</span>' : ''}
    </div>
    ${inconsistente ? alerta('warning', 'Estado inconsistente del período',
        'Este período figura simultáneamente como activo y cerrado. Un período activo no debería estar cerrado: revise el estado antes de usar este informe como acta.') : ''}`
}

function renderResumen(r) {
  const s = r.resumen ?? {}
  const a = r.asistencia ?? {}
  return seccion('Resumen ejecutivo', `
    <div class="row g-3 mb-3">
      ${kpi('Cumplimiento de registro', fmtPct(s.pct_cumplimiento_registro), `${s.sesiones_registradas ?? 0}/${s.sesiones_periodo ?? 0} sesiones`, 'primary')}
      ${kpi('Asistencia estudiantil', fmtPct(a.tasa_global), `${a.presentes ?? 0} presentes de ${a.total_marcas ?? 0}`, 'success')}
      ${kpi('Registro puntual', fmtPct(a.pct_registro_puntual), `${a.marcas_tardias ?? 0} marcas fuera de plazo`, 'warning')}
      ${kpi('Matrícula activa', s.alumnos_activos ?? null, `${s.clases_activas ?? 0} clases · ${s.maestros_activos ?? 0} docentes`, 'info')}
    </div>
    <div class="row g-2 small">
      <div class="col-md-4"><span class="text-muted">Sesiones en borrador:</span> <strong>${s.sesiones_borrador ?? 0}</strong></div>
      <div class="col-md-4"><span class="text-muted">Sesiones pendientes:</span> <strong>${s.sesiones_pendientes ?? 0}</strong></div>
      <div class="col-md-4"><span class="text-muted">Sesiones sin clase vinculada:</span> <strong>${s.sesiones_sin_clase ?? 0}</strong></div>
    </div>`)
}

function renderDocentes(r) {
  const evaluables = r.docentesEvaluables ?? []
  const resto = (r.docentes ?? []).filter(d => d.estado_evaluacion !== ESTADO.EVALUABLE)

  const filas = evaluables.map(d => {
    const cls = clasificarDocente(d.pct_puntualidad, d.estado_evaluacion)
    return `<tr>
      <td class="fw-semibold">${escapeHTML(d.nombre ?? '—')}</td>
      <td class="text-center">${d.clases_a_cargo ?? 0}</td>
      <td class="text-center">${d.sesiones ?? 0}</td>
      <td class="text-center">${d.registradas ?? 0}</td>
      <td class="text-center text-warning">${d.borradores ?? 0}</td>
      <td class="text-center">${d.marcas_registradas ?? 0}</td>
      <td class="text-center">${fmtPct(d.pct_cumplimiento)}</td>
      <td class="text-center fw-bold">${fmtPct(d.pct_puntualidad)}</td>
      <td class="text-center"><span class="badge bg-${cls.tone}-subtle text-${cls.tone} border border-${cls.tone}-subtle">${escapeHTML(cls.badge)}</span></td>
    </tr>`
  }).join('')

  const tabla = evaluables.length === 0
    ? '<p class="text-muted mb-0">Ningún docente registró sesiones en este período.</p>'
    : `<div class="table-responsive"><table class="table table-sm table-hover align-middle mb-0">
        <thead class="table-light"><tr>
          <th>Docente</th><th class="text-center">Clases</th><th class="text-center">Sesiones</th>
          <th class="text-center">Registradas</th><th class="text-center">Borrador</th>
          <th class="text-center">Marcas</th><th class="text-center">Cumplim.</th>
          <th class="text-center">Puntualidad</th><th class="text-center">Clasificación</th>
        </tr></thead><tbody>${filas}</tbody></table></div>`

  const noEvaluados = resto.length === 0 ? '' : `
    <div class="mt-3 pt-3 border-top">
      <p class="small text-muted mb-2">
        <i class="bi bi-info-circle"></i>
        Los siguientes docentes <strong>no se clasifican</strong>: sin actividad registrada no hay base para
        evaluarlos, y ausencia de datos no es lo mismo que incumplimiento.
      </p>
      <div class="d-flex flex-wrap gap-2">
        ${resto.map(d => `<span class="badge bg-body-tertiary text-body border">
          ${escapeHTML(d.nombre ?? '—')} · ${escapeHTML(d.estado_evaluacion ?? 'Sin datos')}</span>`).join('')}
      </div>
    </div>`

  return seccion('Desempeño docente', tabla + noEvaluados,
    `<span class="small text-muted">Atribuido por clase titular</span>`)
}

function renderClases(r) {
  const filas = (r.clases ?? []).map(c => `
    <tr>
      <td class="fw-semibold">${escapeHTML(c.nombre ?? '—')}</td>
      <td>${escapeHTML(c.maestro ?? '—')}</td>
      <td class="text-center">${c.inscritos ?? 0}</td>
      <td class="text-center">${c.sesiones ?? 0}</td>
      <td class="text-center">${c.marcas ?? 0}</td>
      <td class="text-center">${c.tasa_asistencia === null ? SIN_DATO : fmtPct(c.tasa_asistencia)}</td>
      <td>${c.alerta_reconciliacion
            ? `<span class="badge bg-danger-subtle text-danger border border-danger-subtle">${escapeHTML(c.alerta_reconciliacion)}</span>`
            : '<span class="text-muted">—</span>'}</td>
    </tr>`).join('')

  const alertas = (r.clasesConAlerta ?? []).length
  const aviso = alertas === 0 ? '' : alerta('warning',
    `${alertas} clase(s) con inconsistencias de reconciliación`,
    'Las marcas de asistencia no cuadran con la matrícula registrada. Las tasas de asistencia de esas clases no son confiables hasta corregir el vínculo alumno–clase.')

  return seccion('Clases', aviso + `
    <div class="table-responsive"><table class="table table-sm table-hover align-middle mb-0">
      <thead class="table-light"><tr>
        <th>Clase</th><th>Docente</th><th class="text-center">Inscritos</th>
        <th class="text-center">Sesiones</th><th class="text-center">Marcas</th>
        <th class="text-center">Asistencia</th><th>Alerta</th>
      </tr></thead><tbody>${filas}</tbody></table></div>`)
}

function renderPromocion(r) {
  const t = r.promocionTotales ?? {}
  const evaluados = (r.promocionEvaluada ?? []).length
  const params = r.meta?.parametros ?? {}

  const noPromueven = (r.promocion ?? []).filter(p => p.veredicto === VEREDICTO.NO_PROMUEVE)

  const advertencia = alerta('danger', 'La escala de calificación requiere validación institucional',
    `El informe normalizó sobre una escala de ${params.escala_calificacion ?? '?'} con umbral de ${params.umbral_nota_pct ?? '?'} %. ` +
    `Los criterios almacenados en niveles.criterios_promocion asumen escala 0-10. ` +
    `Estos veredictos NO deben usarse como decisión final hasta confirmar la escala.`)

  const filas = noPromueven.slice(0, 50).map(p => `
    <tr>
      <td>${escapeHTML(p.nombre ?? '—')}</td>
      <td>${escapeHTML(p.instrumento ?? '—')}</td>
      <td class="text-center">${p.promedio ?? SIN_DATO}</td>
      <td class="text-center">${fmtPct(p.pct_nota)}</td>
      <td class="text-center">${fmtPct(p.pct_asistencia)}</td>
      <td class="small text-muted">${escapeHTML(p.motivo ?? '')}</td>
    </tr>`).join('')

  return seccion('Promoción y repitencia', advertencia + `
    <div class="row g-3 mb-3">
      ${kpi('Promueven', t.PROMUEVE ?? 0, 'cumplen ambos criterios', 'success')}
      ${kpi('No promueven', t.NO_PROMUEVE ?? 0, 'requieren revisión', 'danger')}
      ${kpi('Sin evaluación', (t.SIN_EVALUACION ?? 0) + (t.SIN_ASISTENCIA ?? 0), 'evidencia incompleta', 'warning')}
      ${kpi('Sin datos', t.SIN_DATOS ?? 0, 'sin evidencia alguna', 'secondary')}
    </div>
    <p class="small text-muted">
      Solo <strong>${evaluados}</strong> alumnos tienen evidencia suficiente para emitir un veredicto.
      El resto aparece como sin datos: no se les asigna aprobación por omisión.
    </p>
    ${noPromueven.length === 0 ? '' : `
      <h6 class="fw-bold small mt-3">Alumnos que no alcanzan los umbrales</h6>
      <div class="table-responsive" style="max-height:340px;overflow-y:auto;">
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light position-sticky top-0"><tr>
            <th>Alumno</th><th>Instrumento</th><th class="text-center">Promedio</th>
            <th class="text-center">% Nota</th><th class="text-center">% Asist.</th><th>Motivo</th>
          </tr></thead><tbody>${filas}</tbody></table>
      </div>`}`)
}

function renderInstrumentos(r) {
  const i = r.instrumentos ?? {}
  const hist = i.historial_reparaciones ?? {}
  return seccion('Instrumentos', `
    <div class="row g-3 mb-3">
      ${kpi('Inventario activo', i.total_activos ?? null, 'instrumentos registrados', 'info')}
      ${kpi('Requieren mantenimiento', i.requieren_mantenimiento ?? null, `${i.en_reparacion ?? 0} en reparación`, 'warning')}
      ${kpi('Asignados en comodato', i.comodatos_activos ?? null, `${i.alumnos_con_instrumento ?? 0} alumnos`, 'primary')}
      ${kpi('Dados de baja', i.dados_de_baja ?? null, 'fuera de servicio', 'danger')}
    </div>
    <div class="row g-2 small mb-3">
      <div class="col-md-6"><span class="text-muted">Comodatos vencidos:</span> <strong class="text-danger">${i.comodatos_vencidos ?? 0}</strong></div>
      <div class="col-md-6"><span class="text-muted">Comodatos sin contrato firmado:</span> <strong class="text-warning">${i.comodatos_sin_contrato ?? 0}</strong></div>
    </div>
    ${hist.estado === ESTADO.SIN_DATOS
      ? `<div class="alert alert-secondary mb-0 small"><strong>Historial de reparaciones: sin datos.</strong> ${escapeHTML(hist.motivo ?? '')}</div>`
      : ''}`)
}

function renderIndicadores(r) {
  const ind = r.indicadores ?? {}
  if (ind._error) {
    return seccion('Indicadores complementarios',
      alerta('warning', 'No se pudieron cargar los indicadores complementarios', ind._error))
  }

  const bloques = [
    ['Retención estudiantil', ind.retencion],
    ['Avance pedagógico', ind.avance_pedagogico],
    ['Contingencias y suplencias', ind.contingencias],
    ['Justificaciones por causal', ind.justificaciones],
    ['Asistencia del personal docente', ind.asistencia_docente],
  ]

  const cuerpo = bloques.map(([titulo, b]) => {
    if (!b) return ''
    const detalle = b.estado === ESTADO.EVALUABLE
      ? `<div class="small text-body mt-1">${escapeHTML(JSON.stringify(
            Object.fromEntries(Object.entries(b).filter(([k]) => k !== 'estado'))))}</div>`
      : `<div class="small text-muted mt-1">${escapeHTML(b.motivo ?? '')}</div>
         ${b.accion ? `<div class="small mt-1"><i class="bi bi-arrow-right-short"></i><em>${escapeHTML(b.accion)}</em></div>` : ''}`
    return `
      <div class="list-group-item px-0 py-3">
        <div class="d-flex justify-content-between align-items-center gap-2">
          <span class="fw-semibold">${escapeHTML(titulo)}</span>
          ${badgeEstado(b.estado)}
        </div>
        ${detalle}
      </div>`
  }).join('')

  return seccion('Indicadores complementarios',
    `<p class="small text-muted">
       Estos indicadores describen la <strong>capacidad de medir</strong>, no un resultado académico.
       Comienzan a reportar automáticamente cuando la institución registra el dato de origen.
     </p>
     <div class="list-group list-group-flush">${cuerpo}</div>`)
}

function renderBrechas(r) {
  const filas = (r.brechas ?? []).map(b => `
    <div class="list-group-item px-0 py-3">
      <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
        <span class="fw-semibold">${escapeHTML(b.dimension ?? '—')}</span>
        ${badgeEstado(b.estado)}
      </div>
      <div class="small text-muted">${escapeHTML(b.motivo ?? '')}</div>
      ${b.accion ? `<div class="small mt-1"><i class="bi bi-arrow-right-short"></i><em>${escapeHTML(b.accion)}</em></div>` : ''}
    </div>`).join('')

  const cd = r.calidadDatos ?? {}
  const divergencia = (cd.marcas_tabla_asistencias !== cd.marcas_jsonb_sesiones)
    ? alerta('warning', 'Dos fuentes de asistencia con cifras distintas',
        `Tabla asistencias: ${cd.marcas_tabla_asistencias ?? '?'} marcas · JSONB en sesiones_clase: ${cd.marcas_jsonb_sesiones ?? '?'}. ${cd.nota ?? ''}`)
    : ''

  return seccion('Brechas de datos y advertencias', `
    <p class="small text-muted">
      Lo que este informe <strong>no puede afirmar</strong>, y por qué. Declararlo es parte del informe:
      un hueco silenciado se lee como un cero.
    </p>
    ${divergencia}
    <div class="list-group list-group-flush">${filas}</div>`)
}
