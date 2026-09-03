import '../styles/clasesHoy.css'
import { router } from '../../../core/router/router.js'
import { obtenerClasesDelDia, DIAS_SEMANA, obtenerDiaActual, COMPLIANCE_META } from '../api/clasesHoyApi.js'
import { formatHora, escapeHTML, getInstrumentoIcon, timeToMinutes } from '../utils/clasesUtils.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { crearAsistencia, ESTADOS } from '../../asistencias/api/asistenciasApi.js'
import { whatsappLink } from '../../../shared/utils/phoneUtils.js'

let _abortController = null

const ESTADO_LABEL = {
  'en-curso': { label: 'En curso', badge: 'success' },
  proxima: { label: 'Próxima', badge: 'warning' },
  pasada: { label: 'Finalizada', badge: 'secondary' },
  futura: { label: 'Programada', badge: 'primary' },
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
          <div class="alert alert-danger shadow-sm rounded-4" role="alert">
            <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
            <p>${escapeHTML(mensaje)}</p>
            <hr>
            <button class="btn btn-primary btn-sm" id="clasesHoyRetryBtn">
              <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
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
      <i class="bi bi-calendar-event"></i>
      ${d.label}
      ${d.value === diaActual ? '<span class="badge bg-danger badge-hoy ms-1">HOY</span>' : ''}
    </button>
  `).join('')
}



function alumnoRowHTML(alumno) {
  const yaJustificado = alumno.estadoAsistencia === 'justificado'
  const badge = yaJustificado
    ? `<span class="badge text-bg-info-subtle text-info-emphasis border border-info-subtle ms-2" title="${escapeHTML(alumno.justificacionTexto || 'Sin motivo especificado')}">
         <i class="bi bi-shield-check"></i> Justificado
       </span>`
    : ''
  return `
    <div class="clases-hoy__nomina-alumno">
      <span><i class="bi bi-person me-1 text-secondary"></i> ${escapeHTML(alumno.nombre_completo || 'Alumno')}</span>
      ${badge}
    </div>
  `
}

function cardHTML(sesion) {
  const estadoMeta = ESTADO_LABEL[sesion.estado] || ESTADO_LABEL.futura
  const capacidad = sesion.capacidadMaxima ?? 20
  const totalAlumnos = sesion.totalAlumnos || 0
  const pctOcupacion = Math.min(100, Math.round((totalAlumnos / capacidad) * 100))

  let fillClass = 'bg-success'
  if (pctOcupacion >= 85 && pctOcupacion < 100) fillClass = 'bg-warning'
  if (pctOcupacion >= 100) fillClass = 'bg-danger'

  const alumnosHTML = sesion.alumnos.length > 0
    ? sesion.alumnos.map(alumnoRowHTML).join('')
    : '<div class="clases-hoy__nomina-alumno text-muted">Sin alumnos matriculados</div>'

  const maestroNombre = sesion.maestroTitular?.nombre_completo || 'Sin asignar'
  const suplenteHTML = sesion.maestroSuplente
    ? ` <span class="text-muted small">(Suplente: ${escapeHTML(sesion.maestroSuplente.nombre_completo)})</span>`
    : ''

  const justificadosBadge = sesion.justificadosCount > 0
    ? `<span class="badge text-bg-info-subtle text-info-emphasis border border-info-subtle">
         <i class="bi bi-shield-check me-1"></i>${sesion.justificadosCount}
       </span>`
    : ''

  const pendiente = sesion.pendienteAsistencia
  const complianceMeta = pendiente ? (COMPLIANCE_META[pendiente.state] || COMPLIANCE_META.AMARILLO) : null
  const pendienteBadge = pendiente
    ? `<span class="badge ms-1" style="background:${complianceMeta.color};color:#fff;" title="Sin pasar asistencia hace ${pendiente.diasAtraso} día${pendiente.diasAtraso === 1 ? '' : 's'}">
         <i class="bi bi-exclamation-triangle-fill me-1"></i>${pendiente.diasAtraso}d mora
       </span>`
    : ''

  const telefonoMaestro = sesion.maestroTitular?.tlf
  const mensajeWhatsapp = `Hola ${sesion.maestroTitular?.nombre_completo || ''}, te recordamos pasar la asistencia de "${sesion.nombre}" (${formatHora(sesion.horaInicio)}-${formatHora(sesion.horaFin)}) — llevás ${pendiente?.diasAtraso ?? 0} día(s) pendiente.`
  const waLink = pendiente && telefonoMaestro ? whatsappLink(telefonoMaestro, mensajeWhatsapp) : null
  const recordatorioBtn = pendiente
    ? (waLink
        ? `<a href="${waLink}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-warning" title="Enviar recordatorio por WhatsApp">
             <i class="bi bi-whatsapp"></i>
           </a>`
        : '')
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
      <div>
        <!-- Encabezado de Ficha: Horario + Estado + Badges -->
        <div class="clases-hoy__card-header">
          <div class="d-flex align-items-center gap-1 flex-wrap">
            <span class="clases-hoy__card-hora-badge">
              <i class="bi bi-clock"></i> ${formatHora(sesion.horaInicio)} - ${formatHora(sesion.horaFin)}
            </span>
            <span class="badge text-bg-${estadoMeta.badge}">
              ${sesion.estado === 'en-curso' ? '<span class="pulse-dot me-1"></span>' : ''}${estadoMeta.label}
            </span>
          </div>
          <div class="d-flex align-items-center gap-1">
            ${justificadosBadge}
            ${pendienteBadge}
          </div>
        </div>

        <!-- Título de la Clase e Instrumento -->
        <div class="d-flex align-items-center gap-1 mb-1">
          <span class="badge bg-secondary-subtle text-secondary border" style="font-size:0.68rem;">
            <i class="bi ${getInstrumentoIcon(sesion.instrumento)} me-1"></i>${escapeHTML(sesion.instrumento || 'General')}
          </span>
          ${sesion.nivel ? `<span class="badge bg-body-tertiary text-muted border" style="font-size:0.68rem;">Nivel ${escapeHTML(String(sesion.nivel))}</span>` : ''}
        </div>
        <h5 class="clases-hoy__card-titulo" title="${escapeHTML(sesion.nombre)}">${escapeHTML(sesion.nombre)}</h5>

        <!-- Metadatos: Docente y Salón -->
        <div class="clases-hoy__card-meta">
          <div class="clases-hoy__meta-row" title="${escapeHTML(maestroNombre)}${suplenteHTML ? ` (Suplente: ${escapeHTML(sesion.maestroSuplente.nombre_completo)})` : ''}">
            <i class="bi bi-person-check"></i>
            <span><strong>Docente:</strong> ${escapeHTML(maestroNombre)}${suplenteHTML}</span>
          </div>
          <div class="clases-hoy__meta-row" title="${escapeHTML(sesion.salon?.nombre || 'Sin salón asignado')}">
            <i class="bi bi-door-open"></i>
            <span><strong>Salón:</strong> ${escapeHTML(sesion.salon?.nombre || 'Sin salón asignado')}</span>
          </div>
        </div>

        <!-- Barra de Ocupación Visual -->
        <div class="clases-hoy__occupancy">
          <div class="clases-hoy__occupancy-header">
            <span><i class="bi bi-people me-1"></i>Matrícula: <strong>${totalAlumnos} / ${capacidad}</strong></span>
            <span class="text-muted">${pctOcupacion}%</span>
          </div>
          <div class="clases-hoy__occupancy-bar">
            <div class="clases-hoy__occupancy-fill ${fillClass}" style="width: ${pctOcupacion}%;"></div>
          </div>
        </div>

        <!-- Nómina desplegable -->
        <button type="button" class="btn btn-sm btn-light border w-100 clases-hoy__toggle-nomina mb-2 text-start d-flex justify-content-between align-items-center" title="Desplegar lista de alumnos">
          <span><i class="bi bi-list-check me-1"></i> Ver Nómina (${totalAlumnos})</span>
          <i class="bi bi-chevron-down text-muted" style="font-size:0.75rem;"></i>
        </button>
        <div class="clases-hoy__nomina">${alumnosHTML}</div>
      </div>

      <!-- Footer de Acciones -->
      <div class="clases-hoy__card-footer">
        <div class="d-flex align-items-center gap-1 flex-grow-1 min-w-0">
          <button type="button" class="btn btn-sm btn-outline-info clases-hoy__justificar flex-grow-1 text-truncate py-1 px-1.5" data-clase-id="${sesion.claseId}" title="Justificar ausencia de alumno">
            <i class="bi bi-shield-check me-1"></i>Justificar
          </button>
          <button type="button" class="btn btn-sm btn-outline-primary clases-hoy__ver-ficha flex-grow-1 text-truncate py-1 px-1.5" data-clase-id="${sesion.claseId}" title="Ver ficha técnica de clase">
            <i class="bi bi-eye me-1"></i>Ficha
          </button>
          ${recordatorioBtn}
        </div>
      </div>
    </div>
  `
}

function emptyStateHTML() {
  return `
    <div class="clases-hoy__empty">
      <i class="bi bi-calendar-x fs-1 d-block mb-2 text-secondary"></i>
      <h5 class="fw-bold">No hay clases para este día</h5>
      <p class="text-muted small mb-0">Probá seleccionando otro día o ajustando los filtros aplicados.</p>
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
      const icon = btn.querySelector('.bi-chevron-down, .bi-chevron-up')
      if (icon) {
        icon.classList.toggle('bi-chevron-down')
        icon.classList.toggle('bi-chevron-up')
      }
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

  // Orden cronológico estricto por hora_inicio ascendente
  const sesionesOrdenadas = [...sesiones].sort((a, b) => timeToMinutes(a.horaInicio) - timeToMinutes(b.horaInicio))

  container.innerHTML = `
    <div class="clases-hoy page-container">
      
      <!-- Header & Toolbar Unificada V2 (Estilo Alumnos) -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Subtítulo, Badges de Resumen y Acciones -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-body-tertiary" style="gap: 0.85rem;">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-calendar-day-fill fs-5"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0 text-body d-flex align-items-center">Clases del Día</h5>
              <small class="text-muted d-block" style="font-size:0.75rem;">Feed operativo · ${escapeHTML(formatFechaLarga(dia))}</small>
            </div>
            
            <!-- Badges de Resumen en Tiempo Real -->
            <div class="d-flex align-items-center gap-1.5 ms-md-2 flex-wrap">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Clases programadas y en curso">
                <i class="bi bi-book-fill me-1"></i>${kpis.totalClases} Clases ${kpis.enCursoAhora > 0 ? `(${kpis.enCursoAhora} en curso)` : ''}
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Total de alumnos convocados">
                <i class="bi bi-people-fill me-1"></i>${kpis.totalAlumnos} Alumnos
              </span>
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Salones ocupados hoy">
                <i class="bi bi-door-open-fill me-1"></i>${kpis.salonesOcupados} Salones
              </span>
              <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Ausencias justificadas registradas">
                <i class="bi bi-shield-check me-1"></i>${kpis.justificadosHoy} Justificados
              </span>
              ${kpis.asistenciaPendiente > 0 ? `
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1.5 px-2.5 rounded-3 fw-medium" style="font-size:0.75rem;" title="Sesiones con asistencia pendiente">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>${kpis.asistenciaPendiente} Sin pasar
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Toolbar de Botones de Acción -->
          <div class="d-flex align-items-center flex-wrap" style="gap: 0.65rem;">
            ${renderViewInfoButton('clases-hoy')}
            <button class="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="clasesHoyBuscarAlumno" title="Buscar alumno y registrar justificación" style="font-size:0.78rem;">
              <i class="bi bi-search-heart"></i>
              <span>Buscar Alumno y Justificar</span>
            </button>
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs" id="clasesHoyRefrescar" title="Refrescar clases del día" style="font-size:0.78rem;">
              <i class="bi bi-arrow-clockwise"></i>
              <span class="d-none d-sm-inline">Refrescar</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Selector de Día de la Semana (Pills) -->
        <div class="d-flex align-items-center gap-1 overflow-x-auto pb-1 mb-2 pt-1">
          ${pillsHTML(dia)}
        </div>

        <!-- Fila 3: Filtros de Búsqueda, Estado, Salón y Docente -->
        <div class="d-flex align-items-center justify-content-between flex-wrap pt-1" style="gap: 0.65rem;">
          <div class="flex-grow-1" style="min-width: 240px;">
            <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
              <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="clasesHoyBuscar" placeholder="Buscar por clase, docente, salón, instrumento o alumno..." autocomplete="off" style="font-size:0.8rem;">
            </div>
          </div>

          <div class="d-flex align-items-center flex-wrap" style="gap: 0.5rem;">
            <select class="form-select form-select-sm rounded-3 shadow-xs" id="clasesHoyEstado" style="font-size:0.78rem; width: auto; min-width: 135px;">
              <option value="">Todos los estados</option>
              <option value="en-curso">En curso</option>
              <option value="proxima">Próximas</option>
              <option value="pasada">Finalizadas</option>
            </select>
            <select class="form-select form-select-sm rounded-3 shadow-xs" id="clasesHoySalon" style="font-size:0.78rem; width: auto; min-width: 140px;">
              <option value="">Todos los salones</option>
              ${salones.map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join('')}
            </select>
            <select class="form-select form-select-sm rounded-3 shadow-xs" id="clasesHoyMaestro" style="font-size:0.78rem; width: auto; min-width: 150px;">
              <option value="">Todos los maestros</option>
              ${maestros.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join('')}
            </select>
          </div>
        </div>

      </div>

      <!-- GRID DE TARJETAS DE CLASE DEL DÍA -->
      <div class="clases-hoy__grid">
        ${sesionesOrdenadas.length > 0 ? sesionesOrdenadas.map(cardHTML).join('') : ''}
        <div id="clasesHoyEmptyFiltro" style="display:none;">${emptyStateHTML()}</div>
      </div>
      ${sesionesOrdenadas.length === 0 ? emptyStateHTML() : ''}
    </div>
  `

  attachEvents(container, sesionesOrdenadas)
  attachViewInfoEvents(container)
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
