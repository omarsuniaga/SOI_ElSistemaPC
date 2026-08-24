/**
 * misClasesView.js
 * "Mis Clases Dadas" — historial del maestro: contenido registrado tal cual
 * lo escribió, asistencia detallada por alumno (con causa de justificación)
 * y metadatos (fecha, hora, clase, salón) de cada sesión confirmada.
 * Es la contraparte, del lado del maestro, del timeline de asistencias
 * que ve el admin.
 *
 * Cada sesión puede abrirse como reporte formateado (HTML o PDF) vía
 * generateDailyReport(), reutilizando el mismo generador de reportes que
 * ya usa la vista de asistencia diaria.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, formatHora, capitalize } from '../utils/portalUtils.js'
import { getMisClases, getSesiones, getSalones } from '../services/maestroDataService.js'
import { calcAttendanceStats, generateDailyReport } from '../services/reportService.js'
import { header, footer, metricChips, wrapDocument, openReport, esc as escR } from '../services/reportTemplates.js'

const RANGOS = [
  { dias: 7, label: 'Últimos 7 días' },
  { dias: 30, label: 'Últimos 30 días' },
  { dias: 90, label: 'Últimos 90 días' },
]

const ESTADO_ORDEN = ['P', 'A', 'J']
const ESTADO_LABEL_RPT = { P: 'Presente', A: 'Ausente', J: 'Justificado' }

const estadoActual = {
  maestroId: null,
  maestroNombre: null,
  dias: 30,
  claseId: 'todas',
}

// Última tanda de datos cargada — el botón de reporte de rango arma el PDF
// a partir de esto, sin volver a consultar Supabase.
let _ultimosDatos = { clases: [], sesiones: [] }

function _rangoFechas(dias) {
  const hasta = new Date()
  const desde = new Date(hasta)
  desde.setDate(desde.getDate() - dias)
  return {
    desde: desde.toISOString().split('T')[0],
    hasta: hasta.toISOString().split('T')[0],
  }
}

/**
 * Nombres de alumnos por id. El JSONB sesiones_clase.asistencia solo trae
 * alumno_id — se resuelven los nombres aparte, y por id directo (no por
 * inscripción activa) para que un alumno que ya no está en la clase siga
 * apareciendo con su nombre en el historial.
 */
async function _cargarNombresAlumnos(alumnoIds) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .in('id', alumnoIds)
  if (error) {
    console.warn('[MisClases] Error cargando nombres de alumnos:', error.message)
    return []
  }
  return data || []
}

/**
 * Causa de justificación por sesión+alumno. Es una tabla aparte del JSONB
 * de asistencia — el estado 'A'/'J' no trae el motivo, solo lo tiene
 * `justificaciones`.
 */
async function _cargarJustificaciones(sesionIds) {
  const { data, error } = await supabase
    .from('justificaciones')
    .select('sesion_id, alumno_id, motivo')
    .in('sesion_id', sesionIds)
  if (error) {
    console.warn('[MisClases] Error cargando justificaciones:', error.message)
    return []
  }
  return data || []
}

/**
 * Carga clases + sesiones confirmadas del maestro en el rango, resuelve
 * nombres de salón, roster de alumnos y causas de justificación.
 */
async function _cargarDatos(maestroId, dias, claseId) {
  const { desde, hasta } = _rangoFechas(dias)

  const [clases, sesiones] = await Promise.all([
    getMisClases(),
    getSesiones(maestroId, desde, hasta),
  ])

  const claseById = new Map(clases.map((c) => [c.id, c]))

  // Solo sesiones confirmadas: un borrador no es una clase "dada" todavía.
  // Mismo criterio que usa el timeline de asistencias del admin.
  let confirmadas = sesiones.filter((s) => s.borrador === false)
  if (claseId !== 'todas') {
    confirmadas = confirmadas.filter((s) => s.clase_id === claseId)
  }

  const salonIds = [...new Set(confirmadas.map((s) => s.salon_id).filter(Boolean))]
  const alumnoIds = [
    ...new Set(confirmadas.flatMap((s) => (s.asistencia || []).map((a) => a.alumno_id)).filter(Boolean)),
  ]
  const sesionIds = confirmadas.map((s) => s.id)

  const [salones, alumnos, justificaciones] = await Promise.all([
    salonIds.length > 0 ? getSalones(salonIds) : Promise.resolve([]),
    alumnoIds.length > 0 ? _cargarNombresAlumnos(alumnoIds) : Promise.resolve([]),
    sesionIds.length > 0 ? _cargarJustificaciones(sesionIds) : Promise.resolve([]),
  ])

  const salonById = new Map(salones.map((s) => [s.id, s.nombre]))
  const nombreByAlumno = new Map(alumnos.map((a) => [a.id, a.nombre_completo]))
  const motivoByKey = new Map(justificaciones.map((j) => [`${j.sesion_id}_${j.alumno_id}`, j.motivo]))

  const sesionesConDatos = confirmadas
    .map((s) => {
      const stats = calcAttendanceStats(s.asistencia)
      const roster = (s.asistencia || [])
        .filter((a) => a.alumno_id)
        .map((a) => ({
          alumnoId: a.alumno_id,
          nombre: nombreByAlumno.get(a.alumno_id) || 'Alumno sin nombre',
          estado: a.estado,
          motivo: motivoByKey.get(`${s.id}_${a.alumno_id}`) || null,
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre))

      return {
        id: s.id,
        fecha: s.fecha,
        horaInicio: s.hora_inicio,
        horaFin: s.hora_fin,
        claseNombre: claseById.get(s.clase_id)?.nombre || 'Clase sin nombre',
        salonNombre: s.salon_id ? salonById.get(s.salon_id) || null : null,
        contenido: (s.contenido || '').trim(),
        presentes: stats.P,
        ausentes: stats.A,
        justificados: stats.J,
        totalRegistros: stats.total,
        roster,
      }
    })
    .sort((a, b) => {
      if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha)
      return (b.horaInicio || '').localeCompare(a.horaInicio || '')
    })

  return { clases, sesiones: sesionesConDatos }
}

function _agruparPorFecha(sesiones) {
  const grupos = new Map()
  for (const s of sesiones) {
    if (!grupos.has(s.fecha)) grupos.set(s.fecha, [])
    grupos.get(s.fecha).push(s)
  }
  return [...grupos.entries()]
}

function _formatFechaGrupo(fecha) {
  const d = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(d.getTime())) return fecha
  return capitalize(d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))
}

function _renderContenido(texto) {
  if (!texto) {
    return `<p class="pm-misclases-contenido pm-misclases-contenido--vacio">Sin contenido registrado.</p>`
  }
  return `<p class="pm-misclases-contenido">${escHTML(texto)}</p>`
}

const ROSTER_GRUPOS = {
  P: { titulo: 'Presentes', clase: 'success' },
  A: { titulo: 'Ausentes', clase: 'danger' },
  J: { titulo: 'Justificados', clase: 'warning' },
}

function _renderRoster(roster) {
  if (!roster || roster.length === 0) {
    return `<p class="pm-misclases-roster-vacio">Sin registro de asistencia individual para esta sesión.</p>`
  }

  return ESTADO_ORDEN.map((estado) => {
    const alumnosGrupo = roster.filter((r) => r.estado === estado)
    if (alumnosGrupo.length === 0) return ''
    const { titulo, clase } = ROSTER_GRUPOS[estado] || { titulo: estado, clase: 'muted' }
    return `
      <div class="pm-misclases-roster-grupo">
        <h4 class="pm-misclases-roster-titulo pm-misclases-roster-titulo--${clase}">${titulo} (${alumnosGrupo.length})</h4>
        <ul class="pm-misclases-roster-lista">
          ${alumnosGrupo
            .map(
              (a) => `
            <li>
              <span class="pm-misclases-roster-nombre">${escHTML(a.nombre)}</span>
              ${a.motivo ? `<span class="pm-misclases-roster-motivo">${escHTML(a.motivo)}</span>` : ''}
            </li>
          `,
            )
            .join('')}
        </ul>
      </div>
    `
  }).join('')
}

function _renderSesionCard(s) {
  return `
    <article class="pm-card pm-misclases-card">
      <div class="pm-misclases-card-top">
        <div class="pm-misclases-card-meta">
          <strong>${escHTML(s.claseNombre)}</strong>
          <span class="pm-misclases-card-hora">
            <i class="bi bi-clock"></i> ${escHTML(formatHora(s.horaInicio))}–${escHTML(formatHora(s.horaFin))}
          </span>
          ${s.salonNombre ? `<span class="pm-misclases-card-salon"><i class="bi bi-geo-alt"></i> ${escHTML(s.salonNombre)}</span>` : ''}
        </div>
        <div class="pm-misclases-card-badges">
          <span class="pm-badge pm-badge-success">${s.presentes} P</span>
          <span class="pm-badge pm-badge-danger">${s.ausentes} A</span>
          <span class="pm-badge pm-badge-warning">${s.justificados} J</span>
          <button
            type="button"
            class="btn-icon-pm pm-misclases-btn-reporte"
            data-sesion-id="${s.id}"
            title="Ver / descargar reporte de esta clase"
            aria-label="Ver o descargar reporte de esta clase"
          >
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
        </div>
      </div>

      ${_renderContenido(s.contenido)}

      <details class="pm-misclases-roster-details">
        <summary>Ver asistencia detallada</summary>
        ${_renderRoster(s.roster)}
      </details>
    </article>
  `
}

function _generarHTML({ clases, sesiones }) {
  const grupos = _agruparPorFecha(sesiones)

  const opcionesClase = clases
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map(
      (c) =>
        `<option value="${c.id}" ${estadoActual.claseId === c.id ? 'selected' : ''}>${escHTML(c.nombre)}</option>`,
    )
    .join('')

  const cuerpo =
    grupos.length === 0
      ? `
      <div class="pm-empty">
        <i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.5;"></i>
        No hay clases registradas en este rango.
      </div>
    `
      : grupos
          .map(
            ([fecha, sesionesDia]) => `
        <section class="pm-misclases-dia">
          <h3 class="pm-misclases-dia-titulo">${escHTML(_formatFechaGrupo(fecha))}</h3>
          ${sesionesDia.map(_renderSesionCard).join('')}
        </section>
      `,
          )
          .join('')

  return `
    <div class="pm-misclases" role="main" aria-label="Mis clases dadas">
      <header class="pm-misclases-header">
        <div>
          <h1 class="pm-misclases-title">Mis Clases Dadas</h1>
          <p class="pm-misclases-subtitle">${sesiones.length} sesión${sesiones.length === 1 ? '' : 'es'} registrada${sesiones.length === 1 ? '' : 's'}</p>
        </div>
        <div class="pm-misclases-filtros">
          <select id="pm-misclases-rango" class="pm-apple-select" aria-label="Rango de fechas">
            ${RANGOS.map(
              (r) =>
                `<option value="${r.dias}" ${estadoActual.dias === r.dias ? 'selected' : ''}>${r.label}</option>`,
            ).join('')}
          </select>
          <select id="pm-misclases-clase" class="pm-apple-select" aria-label="Filtrar por clase">
            <option value="todas" ${estadoActual.claseId === 'todas' ? 'selected' : ''}>Todas mis clases</option>
            ${opcionesClase}
          </select>
          <button
            type="button"
            id="pm-misclases-btn-reporte-rango"
            class="pm-btn pm-btn-primary pm-btn-sm"
            style="width:auto;"
            ${sesiones.length === 0 ? 'disabled' : ''}
          >
            <i class="bi bi-file-earmark-pdf"></i> Descargar reporte
          </button>
        </div>
      </header>

      <div class="pm-misclases-lista">
        ${cuerpo}
      </div>
    </div>
  `
}

function _formatFechaCorta(fecha) {
  const d = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function _rangoLabel() {
  const r = RANGOS.find((x) => x.dias === estadoActual.dias)
  return r ? r.label : `Últimos ${estadoActual.dias} días`
}

/**
 * Reporte de todas las clases del rango/clase actualmente filtrado: una
 * página de índice + una página por sesión con asistencia detallada
 * (nombre, estado, causa de justificación) y el contenido tal cual lo
 * escribió el maestro. Se arma en el cliente a partir de lo ya cargado en
 * pantalla — no vuelve a consultar Supabase.
 */
function _generarReporteRangoHTML(sesiones, { maestroNombre, claseLabel }) {
  const totalP = sesiones.reduce((sum, s) => sum + s.presentes, 0)
  const totalA = sesiones.reduce((sum, s) => sum + s.ausentes, 0)
  const totalJ = sesiones.reduce((sum, s) => sum + s.justificados, 0)
  const totalPaginas = sesiones.length + 1

  const indiceRows = sesiones
    .map(
      (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escR(_formatFechaCorta(s.fecha))}</td>
        <td>${escR(formatHora(s.horaInicio))}</td>
        <td>${escR(s.claseNombre)}</td>
        <td style="text-align:center">${s.presentes}</td>
        <td style="text-align:center">${s.ausentes}</td>
        <td style="text-align:center">${s.justificados}</td>
      </tr>
    `,
    )
    .join('')

  const portada = `
    <div class="page">
      ${header({
        docTag: 'REPORTE DE CLASES',
        clase: claseLabel,
        docente: maestroNombre,
        periodo: _rangoLabel(),
      })}
      ${metricChips([
        { label: 'Sesiones', value: sesiones.length, type: 'navy' },
        { label: 'Presentes', value: totalP, type: 'ok' },
        { label: 'Ausentes', value: totalA, type: 'bad' },
        { label: 'Justificados', value: totalJ, type: 'warn' },
      ])}
      <p class="rpt-section-title">Índice de sesiones</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Fecha</th><th>Hora</th><th>Clase</th><th>P</th><th>A</th><th>J</th></tr></thead>
        <tbody>${indiceRows}</tbody>
      </table>
      ${footer(1, totalPaginas, _rangoLabel())}
    </div>
  `

  const paginasSesion = sesiones
    .map((s, i) => {
      const rosterRows = (s.roster || [])
        .map(
          (a, j) => `
        <tr>
          <td>${j + 1}</td>
          <td>${escR(a.nombre)}</td>
          <td style="text-align:center">${escR(ESTADO_LABEL_RPT[a.estado] || a.estado)}</td>
          <td style="font-size:6.5pt;color:#6b7085">${escR(a.motivo || '')}</td>
        </tr>
      `,
        )
        .join('')

      return `
        <div class="page">
          ${header({
            docTag: `SESIÓN · ${_formatFechaCorta(s.fecha)}`,
            clase: s.claseNombre,
            docente: maestroNombre,
            periodo: `${formatHora(s.horaInicio)}–${formatHora(s.horaFin)}${s.salonNombre ? ' · ' + s.salonNombre : ''}`,
          })}
          ${metricChips([
            { label: 'Presentes', value: s.presentes, type: 'ok' },
            { label: 'Ausentes', value: s.ausentes, type: 'bad' },
            { label: 'Justificados', value: s.justificados, type: 'warn' },
            { label: 'Total', value: s.totalRegistros, type: 'navy' },
          ])}
          <p class="rpt-section-title">Asistencia detallada</p>
          <table class="rpt-table">
            <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación / Justificación</th></tr></thead>
            <tbody>${rosterRows || '<tr><td colspan="4">Sin registro de asistencia individual.</td></tr>'}</tbody>
          </table>
          <p class="rpt-section-title">Contenido de la sesión</p>
          <p style="font-size:8pt;line-height:1.4;white-space:pre-wrap;">${escR(s.contenido) || 'Sin contenido registrado.'}</p>
          ${footer(i + 2, totalPaginas, _formatFechaCorta(s.fecha))}
        </div>
      `
    })
    .join('')

  return wrapDocument(portada + paginasSesion)
}

function _bindEvents(container) {
  const selectRango = container.querySelector('#pm-misclases-rango')
  selectRango?.addEventListener('change', async (e) => {
    estadoActual.dias = Number(e.target.value)
    await _recargar(container)
  })

  const selectClase = container.querySelector('#pm-misclases-clase')
  selectClase?.addEventListener('change', async (e) => {
    estadoActual.claseId = e.target.value
    await _recargar(container)
  })

  container.querySelector('.pm-misclases-lista')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('.pm-misclases-btn-reporte')
    if (!btn) return
    const sesionId = btn.dataset.sesionId
    if (!sesionId) return

    const textoOriginal = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>'
    try {
      await generateDailyReport(sesionId)
    } finally {
      btn.disabled = false
      btn.innerHTML = textoOriginal
    }
  })

  const btnReporteRango = container.querySelector('#pm-misclases-btn-reporte-rango')
  btnReporteRango?.addEventListener('click', () => {
    if (_ultimosDatos.sesiones.length === 0) return

    const claseLabel =
      estadoActual.claseId === 'todas'
        ? 'Todas mis clases'
        : _ultimosDatos.clases.find((c) => c.id === estadoActual.claseId)?.nombre || 'Clase'

    const textoOriginal = btnReporteRango.innerHTML
    btnReporteRango.disabled = true
    btnReporteRango.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando…'
    try {
      const html = _generarReporteRangoHTML(_ultimosDatos.sesiones, {
        maestroNombre: estadoActual.maestroNombre || 'Docente',
        claseLabel,
      })
      const fechaArchivo = new Date().toISOString().split('T')[0]
      openReport(html, `reporte-clases-${fechaArchivo}`, {
        title: `Reporte de Clases · ${_rangoLabel()} · ${claseLabel}`,
      })
    } finally {
      btnReporteRango.disabled = false
      btnReporteRango.innerHTML = textoOriginal
    }
  })
}

async function _recargar(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`
  try {
    const datos = await _cargarDatos(estadoActual.maestroId, estadoActual.dias, estadoActual.claseId)
    _ultimosDatos = datos
    container.innerHTML = _generarHTML(datos)
    _bindEvents(container)
  } catch (err) {
    container.innerHTML = `
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;" role="alert">
        <p style="color:var(--pm-danger);">Error al cargar tus clases</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${escHTML(err.message)}</p>
      </div>`
  }
}

export async function renderMisClasesView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  estadoActual.maestroId = maestro.id
  estadoActual.maestroNombre = maestro.nombre_completo || null
  await _recargar(container)
}
