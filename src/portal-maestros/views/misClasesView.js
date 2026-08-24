/**
 * misClasesView.js
 * "Mis Clases Dadas" — historial del maestro: contenido registrado tal cual
 * lo escribió, asistencia y metadatos (fecha, hora, clase, salón) de cada
 * sesión confirmada. Es la contraparte, del lado del maestro, del timeline
 * de asistencias que ve el admin.
 */

import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, formatHora, capitalize } from '../utils/portalUtils.js'
import { getMisClases, getSesiones, getSalones } from '../services/maestroDataService.js'
import { calcAttendanceStats } from '../services/reportService.js'

const RANGOS = [
  { dias: 7, label: 'Últimos 7 días' },
  { dias: 30, label: 'Últimos 30 días' },
  { dias: 90, label: 'Últimos 90 días' },
]

const estadoActual = {
  maestroId: null,
  dias: 30,
  claseId: 'todas',
}

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
 * Carga clases + sesiones confirmadas del maestro en el rango, resuelve
 * nombres de salón y arma el modelo que consume el render.
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
  const salones = salonIds.length > 0 ? await getSalones(salonIds) : []
  const salonById = new Map(salones.map((s) => [s.id, s.nombre]))

  const sesionesConDatos = confirmadas
    .map((s) => {
      const stats = calcAttendanceStats(s.asistencia)
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
        </div>
      </div>
      ${_renderContenido(s.contenido)}
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
        </div>
      </header>

      <div class="pm-misclases-lista">
        ${cuerpo}
      </div>
    </div>
  `
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
}

async function _recargar(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`
  try {
    const datos = await _cargarDatos(estadoActual.maestroId, estadoActual.dias, estadoActual.claseId)
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
  await _recargar(container)
}
