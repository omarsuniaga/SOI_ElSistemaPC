import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, MESES_ES, DIAS_ES } from '../utils/portalUtils.js'
import { openClaseEmergenteModal } from '../../modules/planificacion/components/claseEmergenteModal.js'
import { AppToast } from '../../shared/components/AppToast.js'
import {
  getMisClases,
  getHorariosClases,
  getSesiones,
  getInscripcionesClases,
} from '../services/maestroDataService.js'
import { autoJustificarClasesProgramadas } from '../services/emergenteJustificacionService.js'

const DIAS_HEADER = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const UMBRAL_VENCIDA = 7

/**
 * Renderiza el calendario mensual con colores de estado de sesiones.
 * @param {HTMLElement} container
 * @param {{ onFechaClick?: (fecha: string) => void }} options
 */
export async function renderCalendarioView(container, { onFechaClick } = {}) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  const hoy = new Date()
  let anio = hoy.getFullYear()
  let mes = hoy.getMonth()

  async function cargarYRenderizar() {
    try {
      const dotsMap = await _calcularEstadoMes(maestro.id, anio, mes)
      _renderCalendario(container, anio, mes, hoy, dotsMap, {
        onFechaClick: (fecha) => {
          _openActionDrawer(fecha)
          onFechaClick?.(fecha)
        },
        onPrev: () => {
          if (mes === 0) {
            anio--
            mes = 11
          } else {
            mes--
          }
          cargarYRenderizar()
        },
        onNext: () => {
          if (mes === 11) {
            anio++
            mes = 0
          } else {
            mes++
          }
          cargarYRenderizar()
        },
      })
    } catch (err) {
      container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${escHTML(err.message)}</p>`
    }
  }

  await cargarYRenderizar()
}

/**
 * Determina el color de punto para una sesión individual.
 * Para HOY el criterio es más estricto (solo asistencia real marcada, o
 * cubierta por actividad especial): una sesión con contenido guardado pero
 * sin asistencia sigue siendo "naranja" mientras la clase es del día actual,
 * para no marcarla verde antes de que el maestro realmente pase lista.
 * Para fechas pasadas también cuenta como registrada si se guardó en firme
 * (borrador=false) con contenido, aunque no haya asistencia explícita.
 * @returns {'verde'|'naranja'}
 */
function _colorSesion(sesion, esHoy) {
  if (!sesion) return 'naranja'
  const tieneAsistencia = Array.isArray(sesion.asistencia) && sesion.asistencia.length > 0
  const tieneContenido = typeof sesion.contenido === 'string' && sesion.contenido.trim().length > 0
  const cubiertaEmergente = !!sesion.emergente_id // cubierta por actividad especial → ya resuelta

  const registrada = esHoy
    ? tieneAsistencia || cubiertaEmergente
    : sesion.estado === 'registrada' ||
      sesion.estado === 'cerrada' ||
      tieneAsistencia ||
      (sesion.borrador === false && tieneContenido) ||
      cubiertaEmergente

  return registrada ? 'verde' : 'naranja' // sino, sigue en borrador/pendiente
}

/**
 * Calcula, por cada fecha del mes, un punto de color por cada instancia de
 * clase (regular o emergente) programada ese día:
 * - 'verde': sesión registrada (asistencia tomada, o cubierta por actividad especial)
 * - 'naranja': sesión guardada como borrador, sin finalizar
 * - 'rojo': la clase ya debió darse y no tiene ninguna sesión
 * Fechas futuras o sin ninguna clase programada devuelven un array vacío.
 * Retorna un Map<'YYYY-MM-DD', Array<'verde'|'naranja'|'rojo'>>
 */
async function _calcularEstadoMes(maestroId, anio, mes) {
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const desde = primerDia.toISOString().split('T')[0]
  const hasta = ultimoDia.toISOString().split('T')[0]

  // 1. Obtener clases del maestro (con cache)
  const clases = await getMisClases()
  const claseIds = clases.map((c) => c.id)

  if (claseIds.length === 0) {
    return new Map()
  }

  // 2. Horarios de esas clases (con cache), agrupados por día de la semana
  const horarios = await getHorariosClases(claseIds)
  const horariosPorDia = new Map() // Map<"lunes"|"martes"|..., [{clase_id, hora_fin}, ...]>
  horarios.forEach((h) => {
    const dia = h.dia?.toLowerCase()
    if (!dia) return
    if (!horariosPorDia.has(dia)) horariosPorDia.set(dia, [])
    horariosPorDia.get(dia).push(h)
  })

  // 3. Sesiones del mes (con cache), indexadas por fecha+clase (regulares)
  // y por fecha (emergentes, clase_id = null)
  const todasSesiones = await getSesiones(maestroId, desde, hasta)
  const sesionPorFechaClase = new Map() // Map<"fecha|clase_id", sesion>
  const emergentesPorFecha = new Map() // Map<fecha, [sesion, ...]>
  todasSesiones.forEach((s) => {
    if (s.clase_id) {
      sesionPorFechaClase.set(`${s.fecha}|${s.clase_id}`, s)
    } else {
      if (!emergentesPorFecha.has(s.fecha)) emergentesPorFecha.set(s.fecha, [])
      emergentesPorFecha.get(s.fecha).push(s)
    }
  })

  // 4. Calcular puntos por día
  const dotsMap = new Map()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const ahora = new Date()

  for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    const fecha = `${y}-${m}-${dia}`
    const diaEs = DIAS_ES[d.getDay()]
    const horariosHoy = horariosPorDia.get(diaEs) || []
    const emergentesHoy = emergentesPorFecha.get(fecha) || []

    if (horariosHoy.length === 0 && emergentesHoy.length === 0) {
      dotsMap.set(fecha, [])
      continue
    }

    const diffDias = Math.floor((hoy - new Date(d)) / 86400000)

    // Fechas futuras: la clase todavía no ocurrió, nada que mostrar
    if (diffDias < 0) {
      dotsMap.set(fecha, [])
      continue
    }

    const esHoy = diffDias === 0
    const dots = []

    horariosHoy.forEach((h) => {
      const sesion = sesionPorFechaClase.get(`${fecha}|${h.clase_id}`)
      if (sesion) {
        dots.push(_colorSesion(sesion, esHoy))
        return
      }
      // Sin sesión: si es hoy, sólo cuenta como "sin registrar" si la clase ya finalizó
      if (esHoy) {
        const horaFin = h.hora_fin || '23:59'
        const [hFinStr, minFinStr] = horaFin.split(':')
        const finMs = parseInt(hFinStr) * 3600000 + parseInt(minFinStr || 0) * 60000
        const ahoraMs = ahora.getHours() * 3600000 + ahora.getMinutes() * 60000
        if (ahoraMs < finMs) return // aún no termina, no mostrar punto todavía
      }
      dots.push('rojo')
    })

    emergentesHoy.forEach((s) => {
      dots.push(_colorSesion(s, esHoy))
    })

    dotsMap.set(fecha, dots)
  }

  return dotsMap
}

const MAX_DOTS_VISIBLES = 4

function _renderCalendario(container, anio, mes, hoy, dotsMap, { onFechaClick, onPrev, onNext }) {
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const primerDiaSem = primerDia.getDay()
  const yH = hoy.getFullYear()
  const mH = String(hoy.getMonth() + 1).padStart(2, '0')
  const dH = String(hoy.getDate()).padStart(2, '0')
  const hoyStr = `${yH}-${mH}-${dH}`

  // Determine active date for roving tabindex: today if visible, else first day of month
  const diasEnMes = ultimoDia.getDate()
  const firstDate = `${anio}-${String(mes + 1).padStart(2, '0')}-01`
  const lastDate = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`
  const activeDate = hoyStr >= firstDate && hoyStr <= lastDate ? hoyStr : firstDate

  let diasHTML = DIAS_HEADER.map((d) => `<div class="pm-cal-day-header">${d}</div>`).join('')

  for (let i = 0; i < primerDiaSem; i++) {
    diasHTML += `<div class="pm-cal-day otro-mes"></div>`
  }

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dots = dotsMap.get(fecha) || []
    const esHoy = fecha === hoyStr ? 'today' : ''
    const conClases = dots.length > 0 ? 'has-sessions' : ''
    const isActive = fecha === activeDate

    const ariaLabel = `${d} de ${MESES_ES[mes]} ${anio}`
    const ariaCurrent = fecha === hoyStr ? ' aria-current="date"' : ''
    const tabIndex = isActive ? '0' : '-1'

    const dotsVisibles = dots.slice(0, MAX_DOTS_VISIBLES)
    const restantes = dots.length - dotsVisibles.length
    const dotsHTML = dots.length
      ? `<div class="pm-cal-day-dots">
          ${dotsVisibles.map((c) => `<span class="pm-cal-dot pm-cal-dot--${c}"></span>`).join('')}
          ${restantes > 0 ? `<span class="pm-cal-dot-mas">+${restantes}</span>` : ''}
        </div>`
      : ''

    diasHTML += `
      <div class="pm-cal-day ${conClases} ${esHoy}" data-fecha="${fecha}" title="${fecha}" role="gridcell" tabindex="${tabIndex}" aria-label="${ariaLabel}" aria-selected="false"${ariaCurrent}>
        ${d}
        ${dotsHTML}
      </div>
    `
  }

  container.innerHTML = `
    <div class="pm-calendar-wrapper">
      <div class="pm-calendar-container">
        <div class="pm-cal-header">
        <button id="pm-cal-prev" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h2 class="pm-month-title">
          ${MESES_ES[mes]} ${anio}
        </h2>
        <button id="pm-cal-next" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="pm-cal-grid-container">
        <div class="pm-cal-grid" role="grid" aria-label="Calendario ${MESES_ES[mes]} ${anio}">
          ${diasHTML}
        </div>
      </div>

      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div> Clase registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-warning)"></div> Borrador sin finalizar
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-danger)"></div> Sin registrar
        </div>
        <div class="pm-cal-legend-item" style="font-size:0.65rem;opacity:0.8;">
          Un punto por cada clase programada ese día
        </div>
      </div>
    </div>
  `

  container.querySelector('#pm-cal-prev').addEventListener('click', onPrev)
  container.querySelector('#pm-cal-next').addEventListener('click', onNext)

  container.querySelectorAll('.pm-cal-day[data-fecha]').forEach((cell) => {
    cell.addEventListener('click', () => {
      // Update aria-selected on click
      container
        .querySelectorAll('.pm-cal-day[data-fecha]')
        .forEach((c) => c.setAttribute('aria-selected', 'false'))
      cell.setAttribute('aria-selected', 'true')
      onFechaClick?.(cell.dataset.fecha)
    })
  })

  // Keyboard navigation: WAI-ARIA grid pattern with roving tabindex
  const grid = container.querySelector('.pm-cal-grid')
  if (!grid) return

  grid.addEventListener('keydown', function onGridKeydown(e) {
    const days = [...grid.querySelectorAll('.pm-cal-day[data-fecha]')]
    if (days.length === 0) return

    const currentFocused = grid.querySelector('[tabindex="0"]')
    const currentIndex = currentFocused ? days.indexOf(currentFocused) : -1

    const moveFocus = (idx) => {
      if (idx < 0 || idx >= days.length) return
      days.forEach((d) => d.setAttribute('tabindex', '-1'))
      days[idx].setAttribute('tabindex', '0')
      days[idx].focus()
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        if (currentIndex > 0) moveFocus(currentIndex - 1)
        break
      case 'ArrowRight':
        e.preventDefault()
        if (currentIndex < days.length - 1) moveFocus(currentIndex + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        moveFocus(Math.max(0, currentIndex - 7))
        break
      case 'ArrowDown':
        e.preventDefault()
        moveFocus(Math.min(days.length - 1, currentIndex + 7))
        break
      case 'Home':
        e.preventDefault()
        moveFocus(Math.floor(Math.max(currentIndex, 0) / 7) * 7)
        break
      case 'End':
        e.preventDefault()
        moveFocus(Math.min(days.length - 1, Math.floor(Math.max(currentIndex, 0) / 7) * 7 + 6))
        break
      case 'PageUp':
        e.preventDefault()
        if (typeof onPrev === 'function') onPrev()
        break
      case 'PageDown':
        e.preventDefault()
        if (typeof onNext === 'function') onNext()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (currentFocused) currentFocused.click()
        break
    }
  })
}

/**
 * Muestra el drawer con acciones contextuales para la fecha seleccionada.
 */
async function _openActionDrawer(fecha) {
  const maestro = getMaestroLocal()
  if (!maestro) return

  const now = new Date()
  const yH = now.getFullYear()
  const mH = String(now.getMonth() + 1).padStart(2, '0')
  const dH = String(now.getDate()).padStart(2, '0')
  const hoyStr = `${yH}-${mH}-${dH}`
  let drawer = document.getElementById('pm-action-drawer')

  if (!drawer) {
    drawer = document.createElement('div')
    drawer.id = 'pm-action-drawer'
    drawer.className = 'pm-drawer-overlay'
    document.body.appendChild(drawer)
  }

  const isToday = fecha === hoyStr
  const isPast = fecha < hoyStr

  // 1. Obtener datos necesarios
  let sesiones = []
  let clasesDelMaestro = []
  let horarios = []
  let emergentes = []
  let sesionesAutoJustificadas = []

  try {
    // Clases emergentes tienen prioridad — se consultan primero
    const { data: eme } = await supabase
      .from('clases_emergentes')
      .select('*')
      .eq('maestro_id', maestro.id)
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true, nullsFirst: false })
    emergentes = eme || []

    const { data: s } = await supabase
      .from('sesiones_clase')
      .select('*')
      .eq('maestro_id', maestro.id)
      .eq('fecha', fecha)
    sesiones = s || []
    sesionesAutoJustificadas = sesiones.filter((s) => s.clase_id && s.emergente_id)

    const { data: c } = await supabase
      .from('clases')
      .select('id, nombre, instrumento')
      .or(
        `maestro_principal_id.eq.${maestro.id},maestro_suplente_id.eq.${maestro.id},maestro_id.eq.${maestro.id}`,
      )
    clasesDelMaestro = c || []

    const claseIds = clasesDelMaestro.map((x) => x.id)
    if (claseIds.length > 0) {
      const { data: h } = await supabase
        .from('clase_horarios')
        .select('clase_id, hora_inicio, hora_fin, dia')
        .in('clase_id', claseIds)
      horarios = h || []
    }
  } catch (e) {
    console.error('Error fetching drawer data:', e)
  }

  // 2. Filtrar clases programadas para este día de la semana
  const [y, m, d] = fecha.split('-').map(Number)
  const fechaLocal = new Date(y, m - 1, d)
  const diaSemana = fechaLocal.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
  const clasesProgramadas = clasesDelMaestro
    .filter((c) => horarios.some((h) => h.clase_id === c.id && h.dia?.toLowerCase() === diaSemana))
    .map((c) => {
      const h = horarios.find((h) => h.clase_id === c.id && h.dia?.toLowerCase() === diaSemana)
      const s = sesiones.find((s) => s.clase_id === c.id)
      return { ...c, hora_inicio: h?.hora_inicio, hora_fin: h?.hora_fin, sesion: s }
    })
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))

  // Sesiones emergentes del día (clase_id = null) — tienen prioridad sobre las programadas
  const emergentesSesiones = sesiones
    .filter((s) => !s.clase_id)
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))

  // 3. Renderizar contenido
  // Si hay emergentes → mostrar solo esas (reemplazan las programadas ese día)
  // Si no → mostrar clases programadas del horario
  let clasesHTML = ''
  if (emergentesSesiones.length > 0) {
    clasesHTML = emergentesSesiones
      .map((s) => {
        const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
        const estaRegistrada =
          s.estado === 'registrada' || s.estado === 'cerrada' || tieneAsistencia

        return `
        <div class="pm-drawer-clase-item" style="border-left: 3px solid var(--pm-warning);">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(s.hora_inicio || '--:--').slice(0, 5)} - ${(s.hora_fin || '--:--').slice(0, 5)}</span>
            <span class="pm-drawer-clase-nombre">${escHTML(s.actividad || 'Clase Emergente')}</span>
            <span class="pm-drawer-clase-instrumento" style="color:var(--pm-warning);">
              <i class="bi bi-lightning-charge-fill"></i> Actividad especial
            </span>
          </div>
          <div class="pm-drawer-clase-actions">
            <button class="pm-btn btn-ver-sesion-emergente"
              data-sesion="${s.id}"
              style="background:var(--pm-${estaRegistrada ? 'success' : 'primary'}); border-color:var(--pm-${estaRegistrada ? 'success' : 'primary'});">
              <i class="bi bi-${estaRegistrada ? 'eye' : 'person-check'}"></i>
              ${estaRegistrada ? 'Ver asistencia' : 'Pasar asistencia'}
            </button>
          </div>
          <div class="pm-clase-status ${estaRegistrada ? 'completed' : ''}" style="margin-left: auto;">
            ${estaRegistrada ? '<i class="bi bi-check-circle-fill" style="color:var(--pm-success)"></i>' : ''}
          </div>
        </div>
      `
      })
      .join('')
  } else if (clasesProgramadas.length > 0) {
    clasesHTML = clasesProgramadas
      .map((c) => {
        const tieneSesion =
          c.sesion &&
          (() => {
            const tieneAsistencia =
              Array.isArray(c.sesion.asistencia) && c.sesion.asistencia.length > 0
            const tieneContenido =
              typeof c.sesion.contenido === 'string' && c.sesion.contenido.trim().length > 0
            return (
              c.sesion.estado === 'registrada' ||
              c.sesion.estado === 'cerrada' ||
              tieneAsistencia ||
              (c.sesion.borrador === false && tieneContenido)
            )
          })()
        const esPendiente =
          c.sesion &&
          !tieneSesion &&
          (c.sesion.estado === 'pendiente' || c.sesion.borrador === true)

        return `
        <div class="pm-drawer-clase-item">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(c.hora_inicio || '--:--').slice(0, 5)} - ${(c.hora_fin || '--:--').slice(0, 5)}</span>
            <span class="pm-drawer-clase-nombre">${escHTML(c.nombre)}</span>
            <span class="pm-drawer-clase-instrumento">${escHTML(c.instrumento || '')}</span>
          </div>

          <div class="pm-drawer-clase-actions">
            ${
              !tieneSesion
                ? `
              <button class="pm-btn pm-btn-primary btn-pasar-asistencia" data-clase="${c.id}">
                <i class="bi bi-person-check"></i> Pasar asistencia
              </button>
            `
                : ''
            }
            ${
              tieneSesion
                ? `
              <button class="pm-btn btn-ver-sesion" data-clase="${c.id}" style="background:var(--pm-success); border-color:var(--pm-success);">
                <i class="bi bi-eye"></i> Ver
              </button>
            `
                : ''
            }
            ${
              esPendiente
                ? `
              <button class="pm-btn btn-continuar-sesion" data-clase="${c.id}">
                <i class="bi bi-pencil"></i> Continuar
              </button>
            `
                : ''
            }
          </div>

          <div class="pm-clase-status ${tieneSesion ? 'completed' : esPendiente ? 'pending' : ''}" style="margin-left: auto;">
             ${tieneSesion ? '<i class="bi bi-check-circle-fill" style="color:var(--pm-success)"></i>' : esPendiente ? '<i class="bi bi-pencil-fill" style="color:var(--pm-warning)"></i>' : ''}
          </div>
        </div>
      `
      })
      .join('')
  }

  // Build suspended-classes section (shown below emergent when both exist)
  let suspendidaSeccionHTML = ''
  if (sesionesAutoJustificadas.length > 0) {
    suspendidaSeccionHTML = `
      <div style="margin-top:0.75rem;">
        <p style="font-size:0.7rem; font-weight:600; color:#0891b2; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.5rem;">
          <i class="bi bi-slash-circle"></i> Clases suspendidas
        </p>
        ${sesionesAutoJustificadas
          .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
          .map((s) => {
            const clase = clasesDelMaestro.find((c) => c.id === s.clase_id)
            return `
            <div class="pm-drawer-clase-item" style="border-left:3px solid #0891b2; opacity:0.85;">
              <div class="pm-drawer-clase-info">
                <span class="pm-drawer-clase-hora">${(s.hora_inicio || '--:--').slice(0, 5)} - ${(s.hora_fin || '--:--').slice(0, 5)}</span>
                <span class="pm-drawer-clase-nombre">${escHTML(clase?.nombre || 'Clase')}</span>
                <span class="pm-drawer-clase-instrumento" style="color:#0891b2;">
                  <i class="bi bi-check-circle-fill"></i> Justificada · Auto-registrada
                </span>
              </div>
              <div class="pm-drawer-clase-actions">
                <button class="pm-btn btn-ver-clase-suspendida" data-clase="${s.clase_id}"
                  style="background:#0891b2; border-color:#0891b2; color:white;">
                  <i class="bi bi-eye"></i> Ver
                </button>
              </div>
            </div>
          `
          })
          .join('')}
      </div>
    `
  }

  drawer.innerHTML = `
    <div class="pm-drawer-content">
      <div class="pm-drawer-header">
        <div style="flex:1">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700;">${fechaLocal.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <p style="margin:0.25rem 0 0; font-size:0.85rem; color:var(--pm-text-muted);">
            ${
              emergentesSesiones.length > 0
                ? `<span style="color:var(--pm-warning);"><i class="bi bi-lightning-charge-fill"></i> ${emergentesSesiones.length} actividad(es) especial(es)</span>`
                : clasesProgramadas.length > 0
                  ? `${clasesProgramadas.length} clase(s) programada(s)`
                  : 'Sin clases programadas'
            }
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="pm-btn-sm" id="pm-drawer-emergente" style="background:var(--pm-primary); color:white; border:none; font-size:0.7rem; padding: 6px 10px; border-radius: 20px;">
            <i class="bi bi-lightning-charge"></i> Crear Clase Emergente
          </button>
          <button class="pm-drawer-close" id="pm-drawer-close-btn">&times;</button>
        </div>
      </div>
      <div class="pm-drawer-body">
        ${clasesHTML || '<p style="text-align:center;color:var(--pm-text-muted);padding:2rem 1rem;">No hay clases programadas para esta fecha</p>'}
        ${suspendidaSeccionHTML}
        ${
          !isPast && !isToday
            ? `
          <button class="pm-btn pm-btn-secondary" style="margin-top:0.5rem; width:100%;">
            <i class="bi bi-plus-circle"></i> Agregar Clase a Horario
          </button>
        `
            : ''
        }
      </div>
    </div>
  `

  // Estilos (solo una vez)
  if (!document.getElementById('pm-drawer-styles')) {
    const style = document.createElement('style')
    style.id = 'pm-drawer-styles'
    style.textContent = `
      .pm-drawer-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); display: none; z-index: 1001; align-items: flex-end;
      }
      .pm-drawer-overlay.open { display: flex; }
      .pm-drawer-content {
        background: var(--pm-surface); width: 100%; border-radius: 1.5rem 1.5rem 0 0;
        padding-bottom: 2rem; transform: translateY(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-height: 80vh; overflow-y: auto;
      }
      .pm-drawer-overlay.open .pm-drawer-content { transform: translateY(0); }
      .pm-drawer-header { padding: 1.25rem 1.25rem 0.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
      .pm-drawer-close { background: none; border: none; font-size: 1.8rem; color: var(--pm-text-muted); cursor: pointer; }
      .pm-drawer-clase-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.75rem; background: var(--pm-surface-2); border-radius: var(--pm-radius-sm); margin-bottom: 0.5rem;
      }
      .pm-drawer-clase-info { display: flex; flex-direction: column; }
      .pm-drawer-clase-hora { font-size: 0.75rem; color: var(--pm-primary); font-weight: 600; }
      .pm-drawer-clase-nombre { font-size: 0.95rem; font-weight: 600; }
      .pm-drawer-clase-instrumento { font-size: 0.75rem; color: var(--pm-text-muted); }
      .pm-drawer-clase-actions { display: flex; gap: 0.5rem; }
    `
    document.head.appendChild(style)
  }

  // Eventos
  const close = () => drawer.classList.remove('open')
  const closeBtn = drawer.querySelector('#pm-drawer-close-btn')
  if (closeBtn) closeBtn.onclick = close
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) close()
  })

  drawer
    .querySelectorAll('.btn-pasar-asistencia, .btn-ver-sesion, .btn-continuar-sesion')
    .forEach((btn) => {
      if (btn)
        btn.addEventListener('click', () => {
          const claseId = btn.dataset.clase
          close()
          window.location.hash = `#/asistencia?clase=${claseId}&fecha=${fecha}`
        })
    })

  drawer.querySelectorAll('.btn-ver-sesion-emergente').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sesionId = btn.dataset.sesion
      close()
      window.location.hash = `#/asistencia?sesion=${sesionId}&fecha=${fecha}`
    })
  })

  drawer.querySelectorAll('.btn-ver-clase-suspendida').forEach((btn) => {
    btn.addEventListener('click', () => {
      const claseId = btn.dataset.clase
      close()
      window.location.hash = `#/asistencia?clase=${claseId}&fecha=${fecha}`
    })
  })

  const btnEmergente = drawer.querySelector('#pm-drawer-emergente')
  if (btnEmergente) {
    btnEmergente.addEventListener('click', () => {
      _abrirModalClaseEmergente(fecha, clasesDelMaestro)
    })
  }

  setTimeout(() => drawer.classList.add('open'), 10)
}

/**
 * Abre el modal para crear una sesión emergente
 */
async function _abrirModalClaseEmergente(fecha, clases) {
  let alumnos = []
  try {
    const inscripciones = await getInscripcionesClases(clases.map((c) => c.id))
    const alumnoClasesMap = {}
    inscripciones.forEach((i) => {
      if (!i.alumnos) return
      if (!alumnoClasesMap[i.alumno_id]) alumnoClasesMap[i.alumno_id] = []
      const clase = clases.find((c) => c.id === i.clase_id)
      if (clase) alumnoClasesMap[i.alumno_id].push(clase.nombre)
    })
    const seen = new Set()
    alumnos = inscripciones
      .map((i) => i.alumnos)
      .filter(Boolean)
      .filter((a) => {
        if (seen.has(a.id)) return false
        seen.add(a.id)
        return true
      })
      .map((a) => ({
        ...a,
        clase_nombres: alumnoClasesMap[a.id] || [],
      }))
  } catch (err) {
    console.warn('[calendario] No se pudieron cargar alumnos para clase emergente:', err)
  }

  openClaseEmergenteModal({
    fecha,
    clases,
    alumnos,
    maestroId: getMaestroLocal().id,
    onSave: async (datos) => {
      try {
        const { data, error } = await supabase
          .from('sesiones_clase')
          .insert([datos])
          .select()
          .single()

        if (error) throw error

        // Auto-justify scheduled classes for the same date
        const resultado = await autoJustificarClasesProgramadas(data, getMaestroLocal().id)
        if (resultado.errores.length > 0) {
          console.warn('[calendario] Auto-justificación parcial:', resultado.errores)
          AppToast.warning(
            `Clase emergente creada. ${resultado.justificadas} clase(s) justificada(s) automáticamente (${resultado.errores.length} con error).`,
          )
        } else if (resultado.justificadas > 0) {
          AppToast.success(
            `Clase emergente creada. ${resultado.justificadas} clase(s) programada(s) marcada(s) como justificadas.`,
          )
        } else {
          AppToast.success('Clase emergente creada. Procedé a pasar asistencia.')
        }

        // Navigate to attendance
        const drawer = document.getElementById('pm-action-drawer')
        if (drawer) drawer.classList.remove('open')

        window.location.hash = `#/asistencia?sesion=${data.id}&fecha=${datos.fecha}`
      } catch (err) {
        console.error('Error creando clase emergente:', err)
        AppToast.error('No se pudo crear la clase emergente')
      }
    },
  })
}
