/**
 * misClasesView.js
 * "Mis Clases Dadas" — historial del maestro: contenido registrado tal cual
 * lo escribió, asistencia detallada por alumno (con causa de justificación)
 * y metadatos (fecha, hora, clase, salón) de cada sesión confirmada.
 * Es la contraparte, del lado del maestro, del timeline de asistencias
 * que ve el admin (y de la vista equivalente que ve admin/coordinación
 * académica sobre cualquier maestro).
 *
 * La carga de datos vive en historialClasesService.js (compartida con esa
 * vista de admin). Cada sesión puede abrirse como reporte formateado (HTML
 * o PDF) vía generateDailyReport(), reutilizando el mismo generador de
 * reportes que ya usa la vista de asistencia diaria.
 */

import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, formatHora, capitalize } from '../utils/portalUtils.js'
import { cargarHistorialClases, RANGOS } from '../services/historialClasesService.js'
import { generateDailyReport, generateRangeReportHTML } from '../services/reportService.js'
import { openReport } from '../services/reportTemplates.js'

const ESTADO_ORDEN = ['P', 'A', 'J']

const estadoActual = {
  maestroId: null,
  maestroNombre: null,
  dias: 30,
  claseId: 'todas',
}

// Última tanda de datos cargada — el botón de reporte de rango arma el PDF
// a partir de esto, sin volver a consultar Supabase.
let _ultimosDatos = { clases: [], sesiones: [] }

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

function _rangoLabel() {
  const r = RANGOS.find((x) => x.dias === estadoActual.dias)
  return r ? r.label : `Últimos ${estadoActual.dias} días`
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
      const html = generateRangeReportHTML(_ultimosDatos.sesiones, {
        maestroNombre: estadoActual.maestroNombre || 'Docente',
        claseLabel,
        rangoLabel: _rangoLabel(),
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
    const datos = await cargarHistorialClases({
      maestroId: estadoActual.maestroId,
      dias: estadoActual.dias,
      claseId: estadoActual.claseId,
    })
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
