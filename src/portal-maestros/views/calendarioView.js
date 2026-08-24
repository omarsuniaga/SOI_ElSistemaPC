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
  invalidateClasesCache,
} from '../services/maestroDataService.js'
import { autoJustificarClasesProgramadas } from '../services/emergenteJustificacionService.js'
import {
  getPeriodoActivo,
  obtenerEstadoCumplimientoMaestro,
  obtenerEstadosAsistenciaMaestro,
} from '../../modules/asistencias/api/asistenciasSupabase.js'
import { eliminarSesion } from '../../modules/planificacion/api/sesionesSupabase.js'
import { invalidateView as navInvalidateView } from '../services/navigationHooks.js'

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
    container.innerHTML = `<p class="pm-empty">No hay sesion activa.</p>`
    return
  }

  const hoy = new Date()
  let anio = hoy.getFullYear()
  let mes = hoy.getMonth()

  async function cargarYRenderizar() {
    try {
      const {
        estadoMap,
        dotsMap,
        classCount,
        hasAssignedClasses,
      } = await _calcularEstadoMes(maestro.id, anio, mes)

      if (!hasAssignedClasses) {
        container.innerHTML = `
          <section class="pm-calendar-shell">
            <div class="pm-calendar-hero pm-calendar-hero--empty">
              <div class="pm-calendar-hero__content">
                <span class="pm-calendar-badge">Vista Clases</span>
                <h1 class="pm-calendar-title">Aun no tienes clases asignadas</h1>
                <p class="pm-calendar-subtitle">
                  Cuando el area academica te asigne grupos, aqui veras tu agenda mensual,
                  accesos rapidos a asistencia y el estado de cada fecha.
                </p>
              </div>
            </div>
            <div class="pm-calendar-empty-card">
              <div class="pm-calendar-empty-card__icon">
                <i class="bi bi-journal-bookmark"></i>
              </div>
              <div>
                <h2 class="pm-calendar-empty-card__title">Sin clases cargadas</h2>
                <p class="pm-calendar-empty-card__text">
                  Esta vista fue optimizada para mostrar tus clases programadas por mes.
                  En cuanto existan asignaciones, el calendario aparecera aqui.
                </p>
              </div>
            </div>
          </section>
        `
        return
      }

      _renderCalendario(container, anio, mes, hoy, estadoMap, dotsMap, {
        classCount,
        onFechaClick: (fecha) => {
          _openActionDrawer(fecha, container)
          onFechaClick?.(fecha)
        },
        onToday: () => {
          const now = new Date()
          anio = now.getFullYear()
          mes = now.getMonth()
          cargarYRenderizar()
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
 * Retorna:
 * - estadoMap: Map<'YYYY-MM-DD', 'registrada'|'pendiente'|'vencida'|'sin-clase'|'cubierta-emergente'>
 * - dotsMap: Map<'YYYY-MM-DD', Array<'verde'|'amarillo'|'rojo'|'gris'>> — un punto por clase del día
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
    return {
      estadoMap: new Map(),
      dotsMap: new Map(),
      classCount: 0,
      hasAssignedClasses: false,
    }
  }

  // La RPC es la fuente compartida con Admin/ACM y Hermes. El cálculo local
  // se conserva temporalmente como respaldo mientras se despliega la migración
  // en todos los entornos.
  try {
    const estados = await obtenerEstadosAsistenciaMaestro(maestroId, desde, hasta)
    const estadoMap = new Map()
    const dotsMap = new Map()
    const prioridad = { futura: 0, registrada: 1, 'cubierta_emergente': 1, pendiente: 2, vencida: 3 }

    for (const item of estados) {
      const estadoCalendario = item.estado === 'cubierta_emergente'
        ? 'cubierta-emergente'
        : item.estado
      const actual = estadoMap.get(item.fecha)
      const actualNormalizado = actual === 'cubierta-emergente' ? 'cubierta_emergente' : actual
      if (!actual || prioridad[item.estado] > prioridad[actualNormalizado]) {
        estadoMap.set(item.fecha, estadoCalendario)
      }

      if (!dotsMap.has(item.fecha)) dotsMap.set(item.fecha, [])
      const dot = item.estado === 'registrada' || item.estado === 'cubierta_emergente'
        ? 'verde'
        : item.estado === 'futura'
          ? 'gris'
          : item.estado === 'pendiente' && item.sesion_id
            ? 'amarillo'
            : 'rojo'
      dotsMap.get(item.fecha).push(dot)
    }

    for (const [fecha, estado] of estadoMap) {
      if (estado === 'futura') estadoMap.set(fecha, 'sin-clase')
    }

    return { estadoMap, dotsMap, classCount: clases.length, hasAssignedClasses: true }
  } catch (error) {
    console.warn('[Calendario] RPC de cumplimiento no disponible; usando respaldo local.', error.message)
  }

  // 2 & 3. Horarios y sesiones del mes en paralelo (con cache)
  const [horarios, todasSesiones] = await Promise.all([
    getHorariosClases(claseIds).catch(() => []),
    getSesiones(maestroId, desde, hasta).catch(() => []),
  ])

  const diasConClase = new Set((horarios || []).map((h) => h.dia?.toLowerCase()))
  const horaFinPorDia = new Map() // Map<"lunes"|"martes"|..., max_hora_fin>
  ;(horarios || []).forEach((h) => {
    const dia = h.dia?.toLowerCase()
    const horaFin = h.hora_fin || '23:59'
    if ((dia && !horaFinPorDia.has(dia)) || horaFin > horaFinPorDia.get(dia)) {
      horaFinPorDia.set(dia, horaFin)
    }
  })

  // Sesión registrada/completada solo si NO es un borrador pendiente
  const esSesionRegistrada = (s) => {
    if (!s) return false
    if (s.borrador === true || s.estado === 'pendiente') return false
    const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
    const tieneContenido = typeof s.contenido === 'string' && s.contenido.trim().length > 0
    return (
      s.estado === 'registrada' ||
      s.estado === 'cerrada' ||
      (s.borrador === false && (tieneAsistencia || tieneContenido))
    )
  }
  const sesiones = todasSesiones.filter(esSesionRegistrada)

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

  // Estructuras por clase, para los puntos por día
  const clasesPorDiaSem = new Map() // 'lunes' -> Set<claseId>
  const horaFinPorClaseDia = new Map() // 'lunes|claseId' -> hora_fin máxima
  horarios.forEach((h) => {
    const dia = h.dia?.toLowerCase()
    if (!dia || !h.clase_id) return
    if (!clasesPorDiaSem.has(dia)) clasesPorDiaSem.set(dia, new Set())
    clasesPorDiaSem.get(dia).add(h.clase_id)
    const key = `${dia}|${h.clase_id}`
    const horaFin = h.hora_fin || '23:59'
    if (!horaFinPorClaseDia.has(key) || horaFin > horaFinPorClaseDia.get(key)) {
      horaFinPorClaseDia.set(key, horaFin)
    }
  })

  // Sesión por clase+fecha (si hay varias, prima la registrada)
  const sesionPorClaseFecha = new Map()
  todasSesiones
    .filter((s) => s.clase_id)
    .forEach((s) => {
      const key = `${s.fecha}|${s.clase_id}`
      const prev = sesionPorClaseFecha.get(key)
      if (!prev || (!esSesionRegistrada(prev) && esSesionRegistrada(s))) {
        sesionPorClaseFecha.set(key, s)
      }
    })

  // 4. Calcular estado por día
  const estadoMap = new Map()
  const dotsMap = new Map()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const periodoActivo = await getPeriodoActivo().catch(() => null)
  const cumplimiento = await obtenerEstadoCumplimientoMaestro(maestroId, periodoActivo?.id).catch(() => ({ esCompleto: true, pendientesCount: 0 }))

  for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    const fecha = `${y}-${m}-${dia}`
    const diaEs = DIAS_ES[d.getDay()]
    const tieneCl = diasConClase.has(diaEs)
    const emergentesFecha = emergentePorFecha.get(fecha) || []
    const fechaDate = new Date(d)
    const diffDias = Math.floor((hoy - fechaDate) / 86400000)

    // Fuera del período activo → el calendario operativo se muestra vacío
    // (Receso Académico), SIN importar si esa fecha tiene sesiones
    // registradas de un período ya cerrado. Antes esta condición se
    // saltaba cuando la fecha SÍ tenía una sesión real (`tieneSesionRealEnFecha`)
    // — pero prácticamente todas las fechas de un semestre anterior tienen
    // sesiones reales, así que esa excepción anulaba el blanqueo justo para
    // el caso que importa: un semestre cerrado seguía mostrando sus puntos
    // pendiente/vencida (naranja/rojo) en el calendario. El historial de
    // esas sesiones sigue disponible en el perfil del alumno y en los
    // informes de cierre — este calendario es la vista operativa del
    // período activo, no un archivo histórico.
    const esFueraDePeriodo = periodoActivo && (fecha < periodoActivo.fecha_inicio || fecha > periodoActivo.fecha_fin)

    if (esFueraDePeriodo) {
      estadoMap.set(fecha, 'receso-academico')
      dotsMap.set(fecha, [])
      continue
    }

    // Puntos por clase: verde registrada, amarillo borrador, rojo sin registrar, gris futura/en curso
    const dots = []
    const clasesDelDia = clasesPorDiaSem.get(diaEs) || new Set()
    clasesDelDia.forEach((claseId) => {
      const s = sesionPorClaseFecha.get(`${fecha}|${claseId}`)
      if (diffDias === 0) {
        // HOY: verde solo si la sesión está guardada como finalizada/registrada (no borrador)
        const esRegistradaHoy = s && s.borrador === false && (s.emergente_id || esSesionRegistrada(s))
        if (esRegistradaHoy) dots.push('verde')
        else if (s) dots.push('amarillo')
        else if (!_claseFinalizoHoy(horaFinPorClaseDia.get(`${diaEs}|${claseId}`))) dots.push('gris')
        else dots.push('rojo')
        return
      }
      if (s && (s.emergente_id || esSesionRegistrada(s))) dots.push('verde')
      else if (s) dots.push('amarillo')
      else if (diffDias < 0) dots.push('gris')
      else dots.push('rojo')
    })
    emergentesFecha.forEach((s) => {
      dots.push(esSesionRegistrada(s) ? 'verde' : 'amarillo')
    })
    dotsMap.set(fecha, dots)

    // Si no hay clase programada pero sí hay sesión emergente, evaluarla
    if (!tieneCl && emergentesFecha.length === 0) {
      estadoMap.set(fecha, 'sin-clase')
      continue
    }

    // Caso especial: HOY (diffDias === 0)
    if (diffDias === 0) {
      const sesionHoy = todasSesiones.find((s) => s.fecha === fecha)
      const esRegistradaHoy = sesionHoy && sesionHoy.borrador === false && esSesionRegistrada(sesionHoy)

      // Si ya está finalizada/registrada → registrada (verde)
      if (esRegistradaHoy) {
        estadoMap.set(fecha, 'registrada')
        continue
      }

      // Si hay sesión en borrador → pendiente (naranja/amarillo)
      if (sesionHoy && (sesionHoy.borrador === true || sesionHoy.estado === 'pendiente')) {
        estadoMap.set(fecha, 'pendiente')
        continue
      }

      // If today has any auto-justified scheduled class → cubierta-emergente
      // (use the Set to handle multi-class days correctly)
      if (fechasCubiertasEmergente.has(fecha)) {
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

  return {
    estadoMap,
    dotsMap,
    classCount: clases.length,
    hasAssignedClasses: true,
  }
}

function _buildMonthSummary({ anio, mes, hoy, estadoMap, dotsMap, classCount }) {
  const todayStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  let daysWithAgenda = 0
  let completedDays = 0
  let pendingDays = 0
  let futureProgrammedDays = 0

  for (let day = 1; day <= new Date(anio, mes + 1, 0).getDate(); day++) {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const estado = estadoMap.get(fecha) || 'sin-clase'
    const dots = dotsMap.get(fecha) || []

    if (dots.length > 0) {
      daysWithAgenda++
      if (fecha > todayStr) futureProgrammedDays++
    }

    if (estado === 'registrada' || estado === 'cubierta-emergente') completedDays++
    if (estado === 'pendiente' || estado === 'vencida') pendingDays++
  }

  return [
    { key: 'clases', label: 'Clases asignadas', value: classCount, icon: 'bi-collection-play', tone: 'primary' },
    { key: 'agenda', label: 'Días con agenda', value: daysWithAgenda, icon: 'bi-calendar-week', tone: 'info' },
    { key: 'pendientes', label: 'Días pendientes', value: pendingDays, icon: 'bi-exclamation-circle', tone: pendingDays > 0 ? 'warning' : 'neutral' },
    { key: 'proximos', label: 'Días por venir', value: futureProgrammedDays, icon: 'bi-arrow-right-circle', tone: 'success' },
  ]
}

/** ¿La clase de hoy ya finalizó según su hora_fin? */
function _claseFinalizoHoy(horaFin) {
  const fin = (horaFin || '23:59').slice(0, 5)
  const ahora = new Date()
  const ahoraStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`
  return ahoraStr >= fin
}

function _renderCalendario(container, anio, mes, hoy, estadoMap, dotsMap, {
  classCount = 0,
  onFechaClick,
  onPrev,
  onNext,
  onToday,
}) {
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const primerDiaSem = primerDia.getDay()
  const yH = hoy.getFullYear()
  const mH = String(hoy.getMonth() + 1).padStart(2, '0')
  const dH = String(hoy.getDate()).padStart(2, '0')
  const hoyStr = `${yH}-${mH}-${dH}`

  const diasEnMes = ultimoDia.getDate()
  const firstDate = `${anio}-${String(mes + 1).padStart(2, '0')}-01`
  const lastDate = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`
  const activeDate = hoyStr >= firstDate && hoyStr <= lastDate ? hoyStr : firstDate
  const isCurrentMonth = hoy.getFullYear() === anio && hoy.getMonth() === mes

  let diasHTML = DIAS_HEADER.map((d) => `<div class="pm-cal-day-header">${d}</div>`).join('')

  for (let i = 0; i < primerDiaSem; i++) {
    diasHTML += `<div class="pm-cal-day otro-mes"></div>`
  }

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const estado = estadoMap.get(fecha) || 'sin-clase'
    const dots = dotsMap?.get(fecha) || []
    const hayAlerta = dots.includes('rojo') || dots.includes('amarillo')
    const dotsHTML = dots.length
      ? `<div class="pm-day-dots">${dots.map((c) => `<span class="pm-day-dot pm-dot-${c}"></span>`).join('')}</div>`
      : ''
    const esHoy = fecha === hoyStr ? 'today' : ''
    const isActive = fecha === activeDate

    const ariaLabel = `${d} de ${MESES_ES[mes]} ${anio}${dots.length ? `, ${dots.length} clase(s)` : ''}`
    const ariaCurrent = fecha === hoyStr ? ' aria-current="date"' : ''
    const tabIndex = isActive ? '0' : '-1'

    diasHTML += `
      <div class="pm-cal-day estado-${estado}${hayAlerta ? ' dia-alerta' : ''} ${esHoy}" data-fecha="${fecha}" title="${fecha}" role="gridcell" tabindex="${tabIndex}" aria-label="${ariaLabel}" aria-selected="false"${ariaCurrent}>
        <span class="pm-cal-day-num">${d}</span>
        ${dotsHTML}
      </div>
    `
  }

  container.innerHTML = `
    <section class="pm-calendar-shell">
      <div class="pm-calendar-wrapper">
        <div class="pm-calendar-container">
          <div class="pm-cal-header">
            <div class="pm-cal-header-copy">
              <span class="pm-cal-header-copy__eyebrow">Calendario operativo</span>
              <h2 class="pm-month-title">${MESES_ES[mes]} ${anio}</h2>
            </div>
            <div class="pm-cal-header-actions">
              <button id="pm-cal-prev" class="pm-cal-nav-btn" aria-label="Mes anterior">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button id="pm-cal-today" class="pm-cal-nav-btn" ${isCurrentMonth ? 'disabled' : ''} aria-label="Mes actual" title="Ir al mes actual">
                <i class="bi bi-bullseye"></i>
              </button>
              <button id="pm-cal-next" class="pm-cal-nav-btn" aria-label="Mes siguiente">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="pm-cal-helper">
            <i class="bi bi-hand-index-thumb"></i>
            <span>Toca un dia para ver clases del dia, borradores o crear una clase emergente.</span>
          </div>

          <div class="pm-cal-grid-container">
            <div class="pm-cal-grid" role="grid" aria-label="Calendario ${MESES_ES[mes]} ${anio}">
              ${diasHTML}
            </div>
          </div>

          <div class="pm-cal-legend" aria-label="Leyenda del calendario">
            <div class="pm-cal-legend-item">
              <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div>
              <span>Clase registrada</span>
            </div>
            <div class="pm-cal-legend-item">
              <div class="pm-cal-legend-dot" style="background:var(--pm-warning)"></div>
              <span>Borrador</span>
            </div>
            <div class="pm-cal-legend-item">
              <div class="pm-cal-legend-dot" style="background:var(--pm-danger)"></div>
              <span>Sin registrar</span>
            </div>
            <div class="pm-cal-legend-item">
              <div class="pm-cal-legend-dot" style="background:var(--pm-text-muted);opacity:.5"></div>
              <span>Programada</span>
            </div>
            <div class="pm-cal-legend-item">
              <div class="pm-cal-legend-dot" style="background:var(--pm-warning-bg);border:1px solid var(--pm-warning);border-radius:3px"></div>
              <span>Dia con registro pendiente</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `

  container.querySelector('#pm-cal-prev').addEventListener('click', onPrev)
  container.querySelector('#pm-cal-next').addEventListener('click', onNext)
  container.querySelector('#pm-cal-today')?.addEventListener('click', onToday)

  container.querySelectorAll('.pm-cal-day[data-fecha]').forEach((cell) => {
    cell.addEventListener('click', () => {
      container
        .querySelectorAll('.pm-cal-day[data-fecha]')
        .forEach((c) => c.setAttribute('aria-selected', 'false'))
      cell.setAttribute('aria-selected', 'true')
      onFechaClick?.(cell.dataset.fecha)
    })
  })

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
function _ensureDrawerStyles() {
  if (document.getElementById('pm-drawer-styles')) return
  const style = document.createElement('style')
  style.id = 'pm-drawer-styles'
  style.textContent = `
    .pm-drawer-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: none; align-items: flex-end;
      /* Por encima del footer móvil (z-index 9999): el drawer es un bottom
         sheet y sus acciones no deben quedar tapadas por el menú. */
      z-index: 10000;
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
    .pm-drawer-skeleton-item {
      height: 52px; border-radius: var(--pm-radius-sm); margin-bottom: 0.5rem;
      background: linear-gradient(90deg, var(--pm-surface-2) 25%, rgba(255,255,255,0.06) 50%, var(--pm-surface-2) 75%);
      background-size: 200% 100%; animation: pm-drawer-shimmer 1.3s infinite;
    }
    @keyframes pm-drawer-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `
  document.head.appendChild(style)
}

async function _openActionDrawer(fecha, container) {
  const maestro = getMaestroLocal()
  if (!maestro) return

  let drawer = document.getElementById('pm-action-drawer')
  if (!drawer) {
    drawer = document.createElement('div')
    drawer.id = 'pm-action-drawer'
    drawer.className = 'pm-drawer-overlay'
    document.body.appendChild(drawer)
  }

  const [y, m, d] = fecha.split('-').map(Number)
  const fechaLocal = new Date(y, m - 1, d)
  const diaSemana = fechaLocal.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()

  // Mostrar el drawer YA, con un esqueleto — antes se esperaba a que
  // terminaran 6 consultas a Supabase EN CADENA (una tras otra, no en
  // paralelo) antes de siquiera agregar la clase "open" (la que dispara la
  // animación de aparición), así que el drawer tardaba exactamente lo que
  // tardaran esas 6 consultas sumadas en aparecer en pantalla. Ahora se
  // abre al toque y el contenido real reemplaza el esqueleto cuando llega.
  _ensureDrawerStyles()
  drawer.innerHTML = `
    <div class="pm-drawer-content">
      <div class="pm-drawer-header">
        <div style="flex:1">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700;">${fechaLocal.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <p style="margin:0.25rem 0 0; font-size:0.85rem; color:var(--pm-text-muted);">Cargando...</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="pm-drawer-close" id="pm-drawer-close-btn">&times;</button>
        </div>
      </div>
      <div class="pm-drawer-body">
        <div class="pm-drawer-skeleton-item"></div>
        <div class="pm-drawer-skeleton-item"></div>
        <div class="pm-drawer-skeleton-item"></div>
      </div>
    </div>
  `
  const closeEarly = () => drawer.classList.remove('open')
  drawer.querySelector('#pm-drawer-close-btn').onclick = closeEarly
  drawer.onclick = (e) => { if (e.target === drawer) closeEarly() }
  requestAnimationFrame(() => drawer.classList.add('open'))

  // 1. Obtener datos necesarios — en paralelo, no en cadena. `horarios`
  // depende de los ids de `clasesDelMaestro` y `cumplimiento` depende del
  // id de `periodoActivo`, así que van en una segunda tanda paralela una
  // vez resuelta la primera — 2 idas y vueltas en total en vez de 6.
  const [emeRes, sesRes, clasesRes, periodoActivoRes] = await Promise.allSettled([
    supabase
      .from('clases_emergentes')
      .select('*')
      .eq('maestro_id', maestro.id)
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true, nullsFirst: false }),
    supabase.from('sesiones_clase').select('*').eq('maestro_id', maestro.id).eq('fecha', fecha),
    supabase
      .from('clases')
      .select('id, nombre, instrumento')
      .or(
        `maestro_principal_id.eq.${maestro.id},maestro_suplente_id.eq.${maestro.id},maestro_id.eq.${maestro.id}`,
      ),
    getPeriodoActivo().catch(() => null),
  ])

  const emergentes = (emeRes.status === 'fulfilled' ? emeRes.value.data : null) || []
  const sesiones = (sesRes.status === 'fulfilled' ? sesRes.value.data : null) || []
  const clasesDelMaestro = (clasesRes.status === 'fulfilled' ? clasesRes.value.data : null) || []
  const periodoActivo = periodoActivoRes.status === 'fulfilled' ? periodoActivoRes.value : null
  const sesionesAutoJustificadas = sesiones.filter((s) => s.clase_id && s.emergente_id)

  const claseIds = clasesDelMaestro.map((x) => x.id)
  const [horariosRes, cumplimiento] = await Promise.all([
    claseIds.length > 0
      ? supabase
          .from('clase_horarios')
          .select('clase_id, hora_inicio, hora_fin, dia')
          .in('clase_id', claseIds)
          .then((r) => r.data || [])
          .catch(() => [])
      : Promise.resolve([]),
    obtenerEstadoCumplimientoMaestro(maestro.id, periodoActivo?.id).catch(() => ({ esCompleto: true, pendientesCount: 0 })),
  ])
  const horarios = horariosRes

  // 2. Filtrar clases programadas para este día de la semana
  const esFueraDePeriodo = periodoActivo && (fecha < periodoActivo.fecha_inicio || fecha > periodoActivo.fecha_fin)

  let recesoBannerHTML = ''
  if (esFueraDePeriodo) {
    if (cumplimiento.esCompleto) {
      recesoBannerHTML = `
        <div style="background:rgba(59,130,246,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.25); border-radius:12px; padding:12px; margin-bottom:12px; display:flex; align-items:center; gap:10px;">
          <i class="bi bi-sun-fill" style="font-size:1.4rem;"></i>
          <div>
            <div style="font-weight:700; font-size:0.9rem;">RECESO ACADÉMICO</div>
            <div style="font-size:0.78rem; opacity:0.9;">Has completado el 100% de tus asistencias del período (${escHTML(periodoActivo.nombre)}). Disfruta tu receso.</div>
          </div>
        </div>
      `
    } else {
      recesoBannerHTML = `
        <div style="background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.25); border-radius:12px; padding:12px; margin-bottom:12px; display:flex; align-items:center; gap:10px;">
          <i class="bi bi-exclamation-triangle-fill" style="font-size:1.4rem;"></i>
          <div>
            <div style="font-weight:700; font-size:0.9rem;">PENDIENTE DE CIERRE DE SEMESTRE</div>
            <div style="font-size:0.78rem; opacity:0.9;">Tienes ${cumplimiento.pendientesCount} clase(s) sin finalizar en el período (${escHTML(periodoActivo.nombre)}). Completa tus asistencias para entrar en Receso Académico.</div>
          </div>
        </div>
      `
    }
  }

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
        <div class="pm-drawer-clase-item btn-ver-sesion-emergente" data-sesion="${s.id}" style="border-left: 3px solid var(--pm-warning); cursor: pointer;">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(s.hora_inicio || '--:--').slice(0, 5)} - ${(s.hora_fin || '--:--').slice(0, 5)}</span>
            <span class="pm-drawer-clase-nombre">${escHTML(s.actividad || 'Clase Emergente')}</span>
            <span class="pm-drawer-clase-instrumento" style="color:var(--pm-warning);">
              <i class="bi bi-lightning-charge-fill"></i> Actividad especial
            </span>
          </div>
          <div class="pm-clase-status ${estaRegistrada ? 'completed' : ''}" style="margin-left: auto; display:flex; align-items:center;">
            ${estaRegistrada ? '<i class="bi bi-check-circle-fill" style="color:var(--pm-success); font-size:1.2rem;"></i>' : '<i class="bi bi-chevron-right" style="color:var(--pm-text-muted); font-size:1.2rem;"></i>'}
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
        <div class="pm-drawer-clase-item btn-ver-sesion" data-clase="${c.id}" style="cursor: pointer;">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(c.hora_inicio || '--:--').slice(0, 5)} - ${(c.hora_fin || '--:--').slice(0, 5)}</span>
            <span class="pm-drawer-clase-nombre">${escHTML(c.nombre)}</span>
            <span class="pm-drawer-clase-instrumento">${escHTML(c.instrumento || '')}</span>
          </div>

          <div class="pm-clase-status ${tieneSesion ? 'completed' : esPendiente ? 'pending' : ''}" style="margin-left: auto; display:flex; align-items:center;">
             ${tieneSesion ? '<i class="bi bi-check-circle-fill" style="color:var(--pm-success); font-size:1.2rem;"></i>' : esPendiente ? '<i class="bi bi-pencil-fill" style="color:var(--pm-warning); font-size:1.2rem;"></i>' : '<i class="bi bi-chevron-right" style="color:var(--pm-text-muted); font-size:1.2rem;"></i>'}
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
        ${recesoBannerHTML}
        ${
          clasesHTML || `
          <div style="text-align:center; padding:1.5rem 1rem; background:rgba(255,255,255,0.03); border-radius:12px; margin:0.5rem 0; border:1px dashed var(--pm-border-color, #334155);">
            <i class="bi bi-calendar-x" style="font-size:2rem; color:var(--pm-text-muted); display:block; margin-bottom:0.5rem;"></i>
            <p style="margin:0 0 1rem; color:var(--pm-text-muted); font-size:0.9rem;">No hay clases programadas para esta fecha</p>
            <button class="pm-btn pm-btn-primary" id="pm-drawer-emergente-body" style="background:var(--pm-primary); border:none; padding:0.6rem 1.2rem; border-radius:10px; font-weight:600;">
              <i class="bi bi-lightning-charge-fill"></i> Crear Clase Emergente
            </button>
          </div>
        `
        }
        ${suspendidaSeccionHTML}
      </div>
    </div>
  `

  // Eventos — se re-vinculan porque el innerHTML de arriba reemplazó el
  // esqueleto (y sus listeners tempranos) por el contenido real.
  const close = () => drawer.classList.remove('open')
  const closeBtn = drawer.querySelector('#pm-drawer-close-btn')
  if (closeBtn) closeBtn.onclick = close
  drawer.onclick = (e) => {
    if (e.target === drawer) close()
  }

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

  drawer.querySelectorAll('.btn-descartar-borrador').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const sesionId = btn.dataset.sesion
      if (!sesionId) return
      if (confirm('¿Deseas descartar este borrador? La fecha se desmarcará por completo.')) {
        try {
          await eliminarSesion(sesionId)
          invalidateClasesCache()
          navInvalidateView('calendario')
          AppToast.show('Borrador descartado. Fecha desmarcada.', 'success')
          close()
          await renderCalendarioView(container)
        } catch (err) {
          AppToast.show('Error al descartar: ' + err.message, 'danger')
        }
      }
    })
  })

  const btnsEmergentes = drawer.querySelectorAll('#pm-drawer-emergente, #pm-drawer-emergente-body')
  btnsEmergentes.forEach((btn) => {
    btn.addEventListener('click', () => {
      _abrirModalClaseEmergente(fecha, clasesDelMaestro)
    })
  })
  // El drawer ya se abrió al toque, junto con el esqueleto (más arriba) —
  // acá no hace falta volver a agregar "open".
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
