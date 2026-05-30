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
      const estado = await _calcularEstadoMes(maestro.id, anio, mes)
      _renderCalendario(container, anio, mes, hoy, estado, {
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
 * Calcula el estado de cada fecha del mes para un maestro.
 * Retorna un Map<'YYYY-MM-DD', 'registrada'|'pendiente'|'vencida'|'sin-clase'>
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

  // 2. Horarios de esas clases (con cache)
  const horarios = await getHorariosClases(claseIds)
  const diasConClase = new Set(horarios.map((h) => h.dia?.toLowerCase()))
  const horaFinPorDia = new Map() // Map<"lunes"|"martes"|..., max_hora_fin>
  horarios.forEach((h) => {
    const dia = h.dia?.toLowerCase()
    const horaFin = h.hora_fin || '23:59'
    if ((dia && !horaFinPorDia.has(dia)) || horaFin > horaFinPorDia.get(dia)) {
      horaFinPorDia.set(dia, horaFin)
    }
  })

  // 3. Sesiones del mes (con cache)
  const todasSesiones = await getSesiones(maestroId, desde, hasta)

  // Filtrar en JS: sesión registrada si:
  // - tiene estado registrada/cerrada, O
  // - tiene asistencia marcada (independientemente de borrador), O
  // - fue guardada (borrador=false) con contenido en observaciones
  const sesiones = todasSesiones.filter((s) => {
    const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
    const tieneContenido = typeof s.contenido === 'string' && s.contenido.trim().length > 0
    return (
      s.estado === 'registrada' ||
      s.estado === 'cerrada' ||
      tieneAsistencia ||
      (s.borrador === false && tieneContenido)
    )
  })

  const fechasRegistradas = new Set(sesiones.map((s) => s.fecha))

  // Dates where a scheduled class was auto-justified due to an emergent session
  const fechasCubiertasEmergente = new Set(
    todasSesiones
      .filter((s) => s.clase_id && s.emergente_id)
      .map((s) => s.fecha),
  )

  // Fechas con sesiones emergentes (clase_id = null) — agrupadas por fecha
  const emergentePorFecha = new Map()
  todasSesiones
    .filter((s) => !s.clase_id)
    .forEach((s) => {
      if (!emergentePorFecha.has(s.fecha)) emergentePorFecha.set(s.fecha, [])
      emergentePorFecha.get(s.fecha).push(s)
    })

  // 4. Calcular estado por día
  const estadoMap = new Map()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    const fecha = `${y}-${m}-${dia}`
    const diaEs = DIAS_ES[d.getDay()]
    const tieneCl = diasConClase.has(diaEs)
    const emergentesFecha = emergentePorFecha.get(fecha) || []

    // Si no hay clase programada pero sí hay sesión emergente, evaluarla
    if (!tieneCl && emergentesFecha.length === 0) {
      estadoMap.set(fecha, 'sin-clase')
      continue
    }

    const fechaDate = new Date(d)
    const diffDias = Math.floor((hoy - fechaDate) / 86400000)

    // Caso especial: HOY (diffDias === 0)
    // Sin color hasta que la clase finalice
    if (diffDias === 0) {
      const sesionHoy = todasSesiones.find((s) => s.fecha === fecha)
      const tieneAsistencia =
        sesionHoy && Array.isArray(sesionHoy.asistencia) && sesionHoy.asistencia.length > 0

      // Si ya tiene asistencia → registrada (verde)
      if (tieneAsistencia) {
        estadoMap.set(fecha, 'registrada')
        continue
      }

      // If today has an auto-justified scheduled class → cubierta-emergente
      if (sesionHoy && sesionHoy.clase_id && sesionHoy.emergente_id) {
        estadoMap.set(fecha, 'cubierta-emergente')
        continue
      }

      // Verificar si la clase ya finalizó hoy
      const horaFinDia = horaFinPorDia.get(diaEs)
      if (horaFinDia) {
        const ahora = new Date()
        const [hFinStr, minFinStr] = horaFinDia.split(':')
        const horaFinMs = parseInt(hFinStr) * 60 * 60 * 1000 + parseInt(minFinStr || 0) * 60 * 1000
        const ahoraMs = ahora.getHours() * 60 * 60 * 1000 + ahora.getMinutes() * 60 * 1000

        // Si aún no finalizó → sin color
        if (ahoraMs < horaFinMs) {
          estadoMap.set(fecha, 'sin-clase')
          continue
        }
      }

      // Finalizó pero sin asistencia → pendiente (naranja)
      estadoMap.set(fecha, 'pendiente')
      continue
    }

    // Fechas pasadas: cubierta-emergente has priority over registrada
    if (diffDias > 0 && fechasCubiertasEmergente.has(fecha)) {
      estadoMap.set(fecha, 'cubierta-emergente')
      continue
    }
    if (diffDias > 0 && fechasRegistradas.has(fecha)) {
      estadoMap.set(fecha, 'registrada')
      continue
    }

    if (diffDias < 0) {
      estadoMap.set(fecha, 'sin-clase')
    } else if (diffDias <= UMBRAL_VENCIDA) {
      estadoMap.set(fecha, 'pendiente')
    } else {
      estadoMap.set(fecha, 'vencida')
    }
  }

  return estadoMap
}

function _renderCalendario(container, anio, mes, hoy, estadoMap, { onFechaClick, onPrev, onNext }) {
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
    const estado = estadoMap.get(fecha) || 'sin-clase'
    const esHoy = fecha === hoyStr ? 'today' : ''
    const isActive = fecha === activeDate

    const ariaLabel = `${d} de ${MESES_ES[mes]} ${anio}`
    const ariaCurrent = fecha === hoyStr ? ' aria-current="date"' : ''
    const tabIndex = isActive ? '0' : '-1'

    diasHTML += `
      <div class="pm-cal-day estado-${estado} ${esHoy}" data-fecha="${fecha}" title="${fecha}" role="gridcell" tabindex="${tabIndex}" aria-label="${ariaLabel}" aria-selected="false"${ariaCurrent}>
        ${d}
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
          <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div> Registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#0891b2"></div> Cubierta por actividad especial
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-warning)"></div> Pendiente
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-danger)"></div> Sin registro >7 días
        </div>
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

  try {
    const { data: s } = await supabase
      .from('sesiones_clase')
      .select('*')
      .eq('maestro_id', maestro.id)
      .eq('fecha', fecha)
    sesiones = s || []

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
