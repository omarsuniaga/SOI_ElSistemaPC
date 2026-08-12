import '../styles/clasesHoy.css'
import { router } from '../../../core/router/router.js'
import { obtenerClasesDelDia, DIAS_SEMANA, obtenerDiaActual, COMPLIANCE_META } from '../api/clasesHoyApi.js'
import { formatHora, escapeHTML } from '../utils/clasesUtils.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { crearAsistencia, ESTADOS } from '../../asistencias/api/asistenciasApi.js'
import { whatsappLink } from '../../../shared/utils/phoneUtils.js'

let _abortController = null

const ESTADO_LABEL = {
  'en-curso': { label: 'En curso', badge: 'success' },
  proxima: { label: 'Próxima', badge: 'warning' },
  pasada: { label: 'Finalizada', badge: 'secondary' },
  futura: { label: 'Programada', badge: 'secondary' },
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando clases del día...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje, dia) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
            <p>${escapeHTML(mensaje)}</p>
            <hr>
            <button class="btn btn-primary" id="clasesHoyRetryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  document.getElementById('clasesHoyRetryBtn')?.addEventListener('click', () => cargarYRenderizar(container, dia))
}

function formatFechaLarga(diaValue) {
  const hoy = new Date()
  const diaActual = obtenerDiaActual()
  if (diaValue !== diaActual) {
    const meta = DIAS_SEMANA.find(d => d.value === diaValue)
    return meta ? meta.labelLargo : diaValue
  }
  const texto = hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function pillsHTML(diaSeleccionado) {
  const diaActual = obtenerDiaActual()
  return DIAS_SEMANA.map(d => `
    <button type="button"
      class="clases-hoy__dia-pill ${d.value === diaSeleccionado ? 'is-active' : ''}"
      data-dia="${d.value}">
      ${d.label}
      ${d.value === diaActual ? '<span class="badge bg-primary badge-hoy">HOY</span>' : ''}
    </button>
  `).join('')
}

function kpisHTML(kpis) {
  return `
    <div class="clases-hoy__kpi">
      <i class="bi bi-book clases-hoy__kpi-icon"></i>
      <div>
        <div class="clases-hoy__kpi-value">${kpis.totalClases}</div>
        <div class="clases-hoy__kpi-label">Clases programadas</div>
      </div>
    </div>
    <div class="clases-hoy__kpi clases-hoy__kpi--en-curso">
      <i class="bi bi-play-circle-fill clases-hoy__kpi-icon"></i>
      <div>
        <div class="clases-hoy__kpi-value">${kpis.enCursoAhora}<span class="pulse-dot ms-1"></span></div>
        <div class="clases-hoy__kpi-label">En curso ahora</div>
      </div>
    </div>
    <div class="clases-hoy__kpi">
      <i class="bi bi-people clases-hoy__kpi-icon"></i>
      <div>
        <div class="clases-hoy__kpi-value">${kpis.totalAlumnos}</div>
        <div class="clases-hoy__kpi-label">Alumnos matriculados</div>
      </div>
    </div>
    <div class="clases-hoy__kpi">
      <i class="bi bi-door-open clases-hoy__kpi-icon"></i>
      <div>
        <div class="clases-hoy__kpi-value">${kpis.salonesOcupados}</div>
        <div class="clases-hoy__kpi-label">Salones ocupados</div>
      </div>
    </div>
    <div class="clases-hoy__kpi clases-hoy__kpi--justificados">
      <i class="bi bi-shield-check clases-hoy__kpi-icon"></i>
      <div>
        <div class="clases-hoy__kpi-value">${kpis.justificadosHoy}</div>
        <div class="clases-hoy__kpi-label">Ausencias justificadas</div>
      </div>
    </div>
    <div class="clases-hoy__kpi clases-hoy__kpi--pendiente">
      <i class="bi bi-exclamation-triangle-fill clases-hoy__kpi-icon"></i>
      <div>
        <div class="clases-hoy__kpi-value">${kpis.asistenciaPendiente}</div>
        <div class="clases-hoy__kpi-label">Asistencia sin pasar</div>
      </div>
    </div>
  `
}

function filtrosHTML(salones, maestros) {
  const opcionesSalones = salones.map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join('')
  const opcionesMaestros = maestros.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join('')
  return `
    <div class="clases-hoy__buscar-wrap">
      <i class="bi bi-search"></i>
      <input type="search" class="form-control" id="clasesHoyBuscar" placeholder="Buscar clase, docente, salón, instrumento o alumno...">
    </div>
    <select class="form-select" id="clasesHoyEstado">
      <option value="">Todos los estados</option>
      <option value="en-curso">En curso</option>
      <option value="proxima">Próximas</option>
      <option value="pasada">Finalizadas</option>
    </select>
    <select class="form-select" id="clasesHoySalon">
      <option value="">Todos los salones</option>
      ${opcionesSalones}
    </select>
    <select class="form-select" id="clasesHoyMaestro">
      <option value="">Todos los maestros</option>
      ${opcionesMaestros}
    </select>
    <button type="button" class="btn btn-outline-secondary" id="clasesHoyRefrescar" title="Refrescar">
      <i class="bi bi-arrow-clockwise"></i>
    </button>
  `
}

function alumnoRowHTML(alumno) {
  const yaJustificado = alumno.estadoAsistencia === 'justificado'
  const badge = yaJustificado
    ? `<span class="badge text-bg-info-subtle text-info-emphasis border border-info-subtle ms-2" title="${escapeHTML(alumno.justificacionTexto || 'Sin motivo especificado')}">
         <i class="bi bi-shield-check"></i> Justificado
       </span>`
    : ''
  return `<div class="clases-hoy__nomina-alumno"><i class="bi bi-person"></i> ${escapeHTML(alumno.nombre_completo || 'Alumno')}${badge}</div>`
}

function cardHTML(sesion) {
  const estadoMeta = ESTADO_LABEL[sesion.estado] || ESTADO_LABEL.futura
  const capacidad = sesion.capacidadMaxima ?? '—'
  const alumnosHTML = sesion.alumnos.length > 0
    ? sesion.alumnos.map(alumnoRowHTML).join('')
    : '<div class="clases-hoy__nomina-alumno text-muted">Sin alumnos matriculados</div>'

  const maestroNombre = sesion.maestroTitular?.nombre_completo || 'Sin asignar'
  const suplenteHTML = sesion.maestroSuplente
    ? ` <span class="text-muted">(suplente: ${escapeHTML(sesion.maestroSuplente.nombre_completo)})</span>`
    : ''

  const justificadosBadge = sesion.justificadosCount > 0
    ? `<span class="badge text-bg-info-subtle text-info-emphasis border border-info-subtle ms-2">
         <i class="bi bi-shield-check"></i> ${sesion.justificadosCount} justificado${sesion.justificadosCount > 1 ? 's' : ''}
       </span>`
    : ''

  const pendiente = sesion.pendienteAsistencia
  const complianceMeta = pendiente ? (COMPLIANCE_META[pendiente.state] || COMPLIANCE_META.AMARILLO) : null
  const pendienteBadge = pendiente
    ? `<span class="badge ms-2" style="background:${complianceMeta.color};color:#fff;" title="Sin pasar asistencia hace ${pendiente.diasAtraso} día${pendiente.diasAtraso === 1 ? '' : 's'}">
         <i class="bi bi-exclamation-triangle-fill"></i> ${complianceMeta.label} · ${pendiente.diasAtraso}d
       </span>`
    : ''

  const telefonoMaestro = sesion.maestroTitular?.tlf
  const mensajeWhatsapp = `Hola ${sesion.maestroTitular?.nombre_completo || ''}, te recordamos pasar la asistencia de "${sesion.nombre}" (${formatHora(sesion.horaInicio)}-${formatHora(sesion.horaFin)}) — llevás ${pendiente?.diasAtraso ?? 0} día(s) pendiente.`
  const waLink = pendiente && telefonoMaestro ? whatsappLink(telefonoMaestro, mensajeWhatsapp) : null
  const recordatorioBtn = pendiente
    ? (waLink
        ? `<a href="${waLink}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-warning">
             <i class="bi bi-whatsapp"></i> Recordar por WhatsApp
           </a>`
        : `<button type="button" class="btn btn-sm btn-outline-secondary" disabled title="El maestro no tiene teléfono registrado">
             <i class="bi bi-whatsapp"></i> Sin teléfono
           </button>`)
    : ''

  return `
    <div class="clases-hoy__card ${sesion.estado === 'en-curso' ? 'is-en-curso' : ''} ${pendiente ? 'has-pendiente' : ''}"
      data-clase-id="${sesion.claseId}"
      data-search="${escapeHTML([sesion.nombre, maestroNombre, sesion.salon?.nombre, sesion.instrumento, ...sesion.alumnos.map(a => a.nombre_completo)].filter(Boolean).join(' ').toLowerCase())}"
      data-estado="${sesion.estado}"
      data-salon="${escapeHTML(sesion.salon?.nombre || '')}"
      data-maestro="${escapeHTML(maestroNombre)}"
      ${pendiente ? `style="border-left: 4px solid ${complianceMeta.color};"` : ''}
    >
      <div class="clases-hoy__card-hora">
        ${formatHora(sesion.horaInicio)} - ${formatHora(sesion.horaFin)}
        <div class="badge text-bg-${estadoMeta.badge} mt-1">
          ${sesion.estado === 'en-curso' ? '<span class="pulse-dot"></span> ' : ''}${estadoMeta.label}
        </div>
      </div>
      <div>
        <div class="clases-hoy__card-titulo">${escapeHTML(sesion.nombre)}${justificadosBadge}${pendienteBadge}</div>
        <div class="clases-hoy__card-meta">
          ${sesion.instrumento ? `<span><i class="bi bi-music-note"></i> ${escapeHTML(sesion.instrumento)}</span>` : ''}
          ${sesion.nivel ? `<span><i class="bi bi-bar-chart-steps"></i> ${escapeHTML(String(sesion.nivel))}</span>` : ''}
          <span><i class="bi bi-door-open"></i> ${escapeHTML(sesion.salon?.nombre || 'Sin salón')}</span>
          <span><i class="bi bi-person-check"></i> ${escapeHTML(maestroNombre)}${suplenteHTML}</span>
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary mt-2 clases-hoy__toggle-nomina">
          <i class="bi bi-people"></i> Nómina de Alumnos (${sesion.totalAlumnos}/${capacidad})
        </button>
        <div class="clases-hoy__nomina">${alumnosHTML}</div>
      </div>
      <div class="clases-hoy__card-acciones">
        ${recordatorioBtn}
        <button type="button" class="btn btn-sm btn-outline-info clases-hoy__justificar" data-clase-id="${sesion.claseId}">
          <i class="bi bi-shield-check"></i> Justificar Ausencia
        </button>
        <button type="button" class="btn btn-sm btn-outline-primary clases-hoy__ver-ficha" data-clase-id="${sesion.claseId}">
          <i class="bi bi-eye"></i> Ver Ficha
        </button>
      </div>
    </div>
  `
}

function emptyStateHTML() {
  return `
    <div class="clases-hoy__empty">
      <i class="bi bi-calendar-x" style="font-size: 2.5rem;"></i>
      <h5 class="mt-2">No hay clases para este día</h5>
      <p class="mb-0">Probá con otro día o revisá los filtros aplicados.</p>
    </div>
  `
}

function aplicarFiltros(container) {
  const buscar = (container.querySelector('#clasesHoyBuscar')?.value || '').trim().toLowerCase()
  const estado = container.querySelector('#clasesHoyEstado')?.value || ''
  const salon = container.querySelector('#clasesHoySalon')?.value || ''
  const maestro = container.querySelector('#clasesHoyMaestro')?.value || ''

  const cards = container.querySelectorAll('.clases-hoy__card')
  let visibles = 0
  cards.forEach(card => {
    const matchBuscar = !buscar || card.dataset.search.includes(buscar)
    const matchEstado = !estado || card.dataset.estado === estado
    const matchSalon = !salon || card.dataset.salon === salon
    const matchMaestro = !maestro || card.dataset.maestro === maestro
    const visible = matchBuscar && matchEstado && matchSalon && matchMaestro
    card.style.display = visible ? '' : 'none'
    if (visible) visibles++
  })

  const emptyEl = container.querySelector('#clasesHoyEmptyFiltro')
  if (emptyEl) emptyEl.style.display = visibles === 0 ? '' : 'none'
}

async function guardarJustificacion(container, sesion, alumno, motivo) {
  try {
    await crearAsistencia({
      clase_id: sesion.claseId,
      alumno_id: alumno.id,
      fecha: sesion.fecha,
      estado: ESTADOS.JUSTIFICADO,
      justificacion_texto: motivo,
    })
    AppToast.success(`${alumno.nombre_completo} quedó justificado en "${sesion.nombre}"`)
    await cargarYRenderizar(container, sesion.dia)
    return true
  } catch (err) {
    AppToast.error(err?.message || 'No se pudo guardar la justificación')
    return false
  }
}

function abrirModalJustificar(container, sesion) {
  let seleccionado = null

  const bodyHTML = `
    <div class="mb-3">
      <label class="form-label">Clase</label>
      <div class="form-control-plaintext fw-semibold">${escapeHTML(sesion.nombre)} · ${formatHora(sesion.horaInicio)}-${formatHora(sesion.horaFin)}</div>
    </div>
    <div class="mb-3">
      <label class="form-label">Buscar alumno</label>
      <input type="search" class="form-control" id="justificarBuscarAlumno" placeholder="Escribí el nombre del alumno...">
      <div class="list-group mt-2" id="justificarListaAlumnos" style="max-height: 220px; overflow-y: auto;"></div>
    </div>
    <div class="mb-2" id="justificarAlumnoSeleccionado" style="display:none;">
      <div class="alert alert-info d-flex align-items-center justify-content-between py-2 px-3 mb-3">
        <span><i class="bi bi-person-check"></i> <strong id="justificarNombreSeleccionado"></strong></span>
        <button type="button" class="btn btn-sm btn-link text-decoration-none" id="justificarQuitarSeleccion">Cambiar</button>
      </div>
      <label class="form-label">Motivo (opcional)</label>
      <textarea class="form-control" id="justificarMotivo" rows="3" placeholder="Ej: el padre avisó que el alumno tiene cita médica"></textarea>
      <div class="form-text">El maestro verá a este alumno ya marcado como "Justificado" al tomar asistencia de esta clase.</div>
    </div>
  `

  AppModal.open({
    title: 'Justificar Ausencia',
    size: 'md',
    saveText: 'Guardar Justificación',
    body: bodyHTML,
    onShow: (body) => {
      const input = body.querySelector('#justificarBuscarAlumno')
      const lista = body.querySelector('#justificarListaAlumnos')
      const seleccionEl = body.querySelector('#justificarAlumnoSeleccionado')
      const nombreEl = body.querySelector('#justificarNombreSeleccionado')

      const renderLista = (filtro = '') => {
        const q = filtro.trim().toLowerCase()
        const candidatos = sesion.alumnos.filter(a =>
          a.estadoAsistencia !== 'justificado' &&
          (!q || (a.nombre_completo || '').toLowerCase().includes(q))
        )
        if (candidatos.length === 0) {
          lista.innerHTML = `<div class="text-muted small px-2 py-2">${sesion.alumnos.length === 0 ? 'Esta clase no tiene alumnos matriculados.' : 'Sin resultados.'}</div>`
          return
        }
        lista.innerHTML = candidatos.map(a => `
          <button type="button" class="list-group-item list-group-item-action py-2" data-alumno-id="${a.id}">
            ${escapeHTML(a.nombre_completo || 'Alumno')}
          </button>
        `).join('')
        lista.querySelectorAll('[data-alumno-id]').forEach(btn => {
          btn.addEventListener('click', () => {
            seleccionado = candidatos.find(a => a.id === btn.dataset.alumnoId)
            if (!seleccionado) return
            nombreEl.textContent = seleccionado.nombre_completo || 'Alumno'
            seleccionEl.style.display = ''
            lista.innerHTML = ''
            input.value = ''
          })
        })
      }

      renderLista()
      input.addEventListener('input', () => renderLista(input.value))

      body.querySelector('#justificarQuitarSeleccion').addEventListener('click', () => {
        seleccionado = null
        seleccionEl.style.display = 'none'
        renderLista(input.value)
      })
    },
    onSave: async (body) => {
      if (!seleccionado) {
        AppToast.error('Buscá y seleccioná un alumno primero')
        return false
      }
      const motivo = body.querySelector('#justificarMotivo')?.value || ''
      return guardarJustificacion(container, sesion, seleccionado, motivo)
    },
  })
}

/**
 * Buscador global: el admin recibe por WhatsApp "Fulanito no viene hoy" del
 * padre y solo tiene el nombre del alumno, no sabe en qué clase está. Este
 * modal busca por nombre en TODAS las clases del día ya cargadas (sin ida y
 * vuelta a la BD), resuelve a qué clase(s) pertenece hoy y justifica desde ahí.
 */
function abrirModalBuscarAlumnoGlobal(container, sesiones) {
  let alumnoSeleccionado = null
  let sesionSeleccionada = null

  const bodyHTML = `
    <div class="mb-3">
      <label class="form-label">Nombre del alumno</label>
      <input type="search" class="form-control" id="buscarGlobalInput" placeholder="Escribí el nombre que te pasó el padre por WhatsApp...">
      <div class="list-group mt-2" id="buscarGlobalLista" style="max-height: 260px; overflow-y: auto;"></div>
    </div>
    <div id="buscarGlobalDetalle" style="display:none;">
      <div class="alert alert-info py-2 px-3 mb-3">
        <div class="d-flex align-items-center justify-content-between">
          <span><i class="bi bi-person-check"></i> <strong id="buscarGlobalNombreAlumno"></strong></span>
          <button type="button" class="btn btn-sm btn-link text-decoration-none" id="buscarGlobalCambiar">Cambiar</button>
        </div>
        <div class="small text-muted mt-1" id="buscarGlobalClaseInfo"></div>
      </div>
      <div class="mb-2" id="buscarGlobalClases"></div>
      <label class="form-label">Motivo (opcional)</label>
      <textarea class="form-control" id="buscarGlobalMotivo" rows="3" placeholder="Ej: el padre avisó que el alumno tiene cita médica"></textarea>
    </div>
  `

  // Índice: alumno_id -> [{alumno, sesion}] entre TODAS las sesiones del día
  const indice = new Map()
  sesiones.forEach(sesion => {
    sesion.alumnos.forEach(alumno => {
      if (!indice.has(alumno.id)) indice.set(alumno.id, [])
      indice.get(alumno.id).push({ alumno, sesion })
    })
  })

  AppModal.open({
    title: 'Buscar Alumno y Justificar',
    size: 'md',
    saveText: 'Guardar Justificación',
    body: bodyHTML,
    onShow: (body) => {
      const input = body.querySelector('#buscarGlobalInput')
      const lista = body.querySelector('#buscarGlobalLista')
      const detalle = body.querySelector('#buscarGlobalDetalle')
      const nombreEl = body.querySelector('#buscarGlobalNombreAlumno')
      const claseInfoEl = body.querySelector('#buscarGlobalClaseInfo')
      const clasesEl = body.querySelector('#buscarGlobalClases')

      const mostrarSeleccion = (alumnoId) => {
        const apariciones = indice.get(alumnoId) || []
        alumnoSeleccionado = apariciones[0]?.alumno || null
        if (!alumnoSeleccionado) return

        nombreEl.textContent = alumnoSeleccionado.nombre_completo || 'Alumno'
        lista.innerHTML = ''
        input.value = ''
        detalle.style.display = ''

        const pendientes = apariciones.filter(a => a.alumno.estadoAsistencia !== 'justificado')
        if (pendientes.length === 0) {
          claseInfoEl.textContent = 'Este alumno ya está justificado en todas sus clases de hoy.'
          clasesEl.innerHTML = ''
          sesionSeleccionada = null
          return
        }

        if (pendientes.length === 1) {
          sesionSeleccionada = pendientes[0].sesion
          claseInfoEl.textContent = `Clase de hoy: ${sesionSeleccionada.nombre} (${formatHora(sesionSeleccionada.horaInicio)}-${formatHora(sesionSeleccionada.horaFin)})`
          clasesEl.innerHTML = ''
        } else {
          claseInfoEl.textContent = `Este alumno tiene ${pendientes.length} clases hoy. Elegí una:`
          sesionSeleccionada = pendientes[0].sesion
          clasesEl.innerHTML = `
            <div class="list-group mb-2">
              ${pendientes.map((p, i) => `
                <button type="button" class="list-group-item list-group-item-action py-2 ${i === 0 ? 'active' : ''}" data-sesion-idx="${i}">
                  ${escapeHTML(p.sesion.nombre)} · ${formatHora(p.sesion.horaInicio)}-${formatHora(p.sesion.horaFin)}
                </button>
              `).join('')}
            </div>
          `
          clasesEl.querySelectorAll('[data-sesion-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
              clasesEl.querySelectorAll('[data-sesion-idx]').forEach(b => b.classList.remove('active'))
              btn.classList.add('active')
              sesionSeleccionada = pendientes[Number(btn.dataset.sesionIdx)].sesion
            })
          })
        }
      }

      const renderLista = (filtro = '') => {
        const q = filtro.trim().toLowerCase()
        if (!q) {
          lista.innerHTML = ''
          return
        }
        const candidatos = [...indice.entries()]
          .map(([alumnoId, apariciones]) => ({ alumnoId, nombre: apariciones[0].alumno.nombre_completo || '' }))
          .filter(c => c.nombre.toLowerCase().includes(q))

        if (candidatos.length === 0) {
          lista.innerHTML = `<div class="text-muted small px-2 py-2">Sin resultados entre los alumnos con clase hoy.</div>`
          return
        }
        lista.innerHTML = candidatos.map(c => `
          <button type="button" class="list-group-item list-group-item-action py-2" data-alumno-id="${c.alumnoId}">
            ${escapeHTML(c.nombre)}
          </button>
        `).join('')
        lista.querySelectorAll('[data-alumno-id]').forEach(btn => {
          btn.addEventListener('click', () => mostrarSeleccion(btn.dataset.alumnoId))
        })
      }

      input.addEventListener('input', () => renderLista(input.value))

      body.querySelector('#buscarGlobalCambiar').addEventListener('click', () => {
        alumnoSeleccionado = null
        sesionSeleccionada = null
        detalle.style.display = 'none'
        input.value = ''
        input.focus()
      })
    },
    onSave: async (body) => {
      if (!alumnoSeleccionado || !sesionSeleccionada) {
        AppToast.error('Buscá un alumno y confirmá su clase de hoy primero')
        return false
      }
      const motivo = body.querySelector('#buscarGlobalMotivo')?.value || ''
      return guardarJustificacion(container, sesionSeleccionada, alumnoSeleccionado, motivo)
    },
  })
}

function attachEvents(container, sesiones) {
  const signal = _abortController.signal

  container.querySelectorAll('.clases-hoy__dia-pill').forEach(btn => {
    btn.addEventListener('click', () => cargarYRenderizar(container, btn.dataset.dia), { signal })
  })

  container.querySelector('#clasesHoyRefrescar')?.addEventListener('click', () => {
    const diaActivo = container.querySelector('.clases-hoy__dia-pill.is-active')?.dataset.dia
    cargarYRenderizar(container, diaActivo)
  }, { signal })

  container.querySelectorAll('.clases-hoy__toggle-nomina').forEach(btn => {
    btn.addEventListener('click', () => {
      const nomina = btn.nextElementSibling
      nomina?.classList.toggle('is-open')
    }, { signal })
  })

  container.querySelectorAll('.clases-hoy__justificar').forEach(btn => {
    btn.addEventListener('click', () => {
      const sesion = sesiones.find(s => s.claseId === btn.dataset.claseId)
      if (sesion) abrirModalJustificar(container, sesion)
    }, { signal })
  })

  container.querySelector('#clasesHoyBuscarAlumno')?.addEventListener('click', () => {
    abrirModalBuscarAlumnoGlobal(container, sesiones)
  }, { signal })

  container.querySelectorAll('.clases-hoy__ver-ficha').forEach(btn => {
    btn.addEventListener('click', () => {
      router.navigate('clases', { selectedId: btn.dataset.claseId })
    }, { signal })
  })

  const filtroIds = ['#clasesHoyBuscar', '#clasesHoyEstado', '#clasesHoySalon', '#clasesHoyMaestro']
  filtroIds.forEach(sel => {
    const el = container.querySelector(sel)
    if (!el) return
    const evento = sel === '#clasesHoyBuscar' ? 'input' : 'change'
    el.addEventListener(evento, () => aplicarFiltros(container), { signal })
  })
}

function renderContent(container, dia, kpis, sesiones) {
  const salones = [...new Set(sesiones.map(s => s.salon?.nombre).filter(Boolean))].sort()
  const maestros = [...new Set(sesiones.map(s => s.maestroTitular?.nombre_completo).filter(Boolean))].sort()

  container.innerHTML = `
    <div class="clases-hoy">
      <div class="clases-hoy__header">
        <div>
          <h2 class="clases-hoy__title">Clases del Día</h2>
          <div class="clases-hoy__subtitle">${escapeHTML(formatFechaLarga(dia))}</div>
        </div>
        <button type="button" class="btn btn-info text-white" id="clasesHoyBuscarAlumno">
          <i class="bi bi-search-heart"></i> Buscar Alumno y Justificar
        </button>
      </div>

      <div class="clases-hoy__dias">${pillsHTML(dia)}</div>

      <div class="clases-hoy__kpis">${kpisHTML(kpis)}</div>

      <div class="clases-hoy__filtros">${filtrosHTML(salones, maestros)}</div>

      <div class="clases-hoy__feed">
        ${sesiones.length > 0 ? sesiones.map(cardHTML).join('') : ''}
        <div id="clasesHoyEmptyFiltro" style="display:none;">${emptyStateHTML()}</div>
      </div>
      ${sesiones.length === 0 ? emptyStateHTML() : ''}
    </div>
  `

  attachEvents(container, sesiones)
}

async function cargarYRenderizar(container, dia) {
  try {
    renderLoading(container)
    const { dia: diaResuelto, kpis, sesiones } = await obtenerClasesDelDia(dia)
    renderContent(container, diaResuelto, kpis, sesiones)
  } catch (error) {
    console.error('[clasesHoyView] Error:', error)
    renderError(container, error.message || 'No se pudieron cargar las clases del día', dia)
  }
}

export async function renderClasesHoyView(container, params = {}) {
  if (!container) return

  _abortController?.abort()
  _abortController = new AbortController()

  const diaInicial = params?.dia || null
  await cargarYRenderizar(container, diaInicial)
}
