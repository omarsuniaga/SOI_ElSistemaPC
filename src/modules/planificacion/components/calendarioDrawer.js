import { openClaseEmergenteModal, openEditarSesionModal, openVerSesionModal } from './claseEmergenteModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const DRAWER_ID = 'calendario-drawer'
let drawerCallbacks = {
  onVerSesion: null,
  onEditarSesion: null,
  onPasarAsistencia: null,
  onCrearEmergente: null,
  onEliminarSesion: null,
}

export function initCalendarioDrawer(callbacks = {}) {
  drawerCallbacks = { ...drawerCallbacks, ...callbacks }
}

export function openCalendarioDrawer(fecha, sesiones = [], opciones = {}) {
  const {
    clases = [],
    maestros = [],
    maestroActualId = null,
    puedeEditar = true,
  } = opciones

  const sesionesEnFecha = sesiones.filter(s => s.fecha === fecha)
  
  const drawer = _crearDrawer(fecha, sesionesEnFecha, clases, maestros, maestroActualId, puedeEditar)
  document.body.appendChild(drawer)
  
  _attachDrawerEvents(drawer, fecha, sesionesEnFecha, clases, maestros, maestroActualId, puedeEditar)
  
  setTimeout(() => {
    drawer.classList.add('open')
  }, 10)
}

function _crearDrawer(fecha, sesiones, clases, maestros, maestroId, puedeEditar) {
  const drawer = document.createElement('div')
  drawer.id = DRAWER_ID
  drawer.className = 'calendario-drawer-overlay'
  
  const fechaFormateada = _formatFecha(fecha)
  const sesionCount = sesiones.length
  
  const sesionesHTML = sesiones.length > 0 
    ? sesiones.map(s => _renderSesionCard(s, clases, puedeEditar)).join('')
    : '<p class="text-muted text-center py-3">No hay sesiones programadas</p>'

  drawer.innerHTML = `
    <div class="calendario-drawer">
      <div class="drawer-header">
        <div>
          <h5 class="mb-0">${fechaFormateada}</h5>
          <small class="text-muted">${sesionCount} sesión${sesionCount !== 1 ? 'es' : ''}</small>
        </div>
        <button class="btn-close-drawer" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      
      <div class="drawer-body">
        <div class="drawer-actions mb-3">
          <button class="btn btn-primary btn-sm w-100" id="btn-nueva-clase">
            <i class="bi bi-plus-circle me-1"></i> Nueva Clase Emergente
          </button>
        </div>
        
        <div class="sesiones-list">
          <h6 class="fw-bold mb-2 text-muted">Sesiones del día</h6>
          ${sesionesHTML}
        </div>
      </div>
      
      <div class="drawer-footer">
        <div class="drawer-legend">
          <span class="badge bg-success me-1">●</span> Regular
          <span class="badge bg-warning text-dark ms-2 me-1">●</span> Emergente
        </div>
      </div>
    </div>
  `
  
  return drawer
}

function _renderSesionCard(sesion, clases, puedeEditar) {
  const clase = clases.find(c => c.id === sesion.clase_id)
  const claseNombre = clase?.nombre || sesion.clase_id || 'Clase'
  const esEmergente = sesion.tipo === 'emergente'
  
  const badgeClass = esEmergente ? 'bg-warning text-dark' : 'bg-success'
  const badgeLabel = esEmergente ? '⚡' : '📅'
  
  const tieneAsistencia = sesion.asistencia && (sesion.asistencia.presentes > 0 || sesion.asistencia.ausentes > 0)
  const asistenciaLabel = tieneAsistencia 
    ? `P:${sesion.asistencia.presentes} A:${sesion.asistencia.ausentes}`
    : 'Sin asistencia'

  return `
    <div class="sesion-card mb-2" data-sesion-id="${sesion.id}">
      <div class="sesion-card-header">
        <span class="badge ${badgeClass}">${badgeLabel}</span>
        <span class="sesion-hora">${sesion.hora_inicio || ''} - ${sesion.hora_fin || ''}</span>
      </div>
      <div class="sesion-card-body">
        <h6 class="mb-1">${escapeHTML(sesion.tema || 'Sin título')}</h6>
        <small class="text-muted">${escapeHTML(claseNombre)}</small>
        <div class="sesion-meta mt-1">
          <small class="text-muted">${asistenciaLabel}</small>
        </div>
      </div>
      <div class="sesion-card-actions">
        <button class="btn btn-sm btn-outline-primary" data-action="ver" title="Ver detalles">
          <i class="bi bi-eye"></i>
        </button>
        ${puedeEditar ? `
        <button class="btn btn-sm btn-outline-secondary" data-action="editar" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        ` : ''}
        ${puedeEditar && !sesion.asistencia ? `
        <button class="btn btn-sm btn-outline-success" data-action="asistencia" title="Pasar asistencia">
          <i class="bi bi-check2-square"></i>
        </button>
        ` : ''}
      </div>
    </div>
  `
}

function _attachDrawerEvents(drawer, fecha, sesiones, clases, maestros, maestroId, puedeEditar) {
  drawer.querySelector('.btn-close-drawer')?.addEventListener('click', () => _cerrarDrawer(drawer))
  
  drawer.querySelector('.calendario-drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('calendario-drawer-overlay')) {
      _cerrarDrawer(drawer)
    }
  })

  drawer.querySelector('#btn-nueva-clase')?.addEventListener('click', () => {
    _cerrarDrawer(drawer)
    openClaseEmergenteModal({
      fecha,
      clases,
      maestroId,
      onSave: async (datos) => {
        if (drawerCallbacks.onCrearEmergente) {
          await drawerCallbacks.onCrearEmergente(datos)
        }
        AppToast.success('Clase emergente creada')
      }
    })
  })

  drawer.querySelectorAll('.sesion-card').forEach(card => {
    const sesionId = card.dataset.sesionId
    const sesion = sesiones.find(s => s.id === sesionId)
    if (!sesion) return

    card.querySelector('[data-action="ver"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      openVerSesionModal(sesion, {
        clases,
        onEditar: puedeEditar ? () => {
          if (drawerCallbacks.onEditarSesion) {
            drawerCallbacks.onEditarSesion(sesion)
          }
        } : null,
        onPasarAsistencia: !sesion.asistencia ? () => {
          if (drawerCallbacks.onPasarAsistencia) {
            drawerCallbacks.onPasarAsistencia(sesion)
          }
        } : null
      })
    })

    card.querySelector('[data-action="editar"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      _cerrarDrawer(drawer)
      openEditarSesionModal(sesion, {
        clases,
        onSave: async (id, datos) => {
          if (drawerCallbacks.onEditarSesion) {
            await drawerCallbacks.onEditarSesion(id, datos)
          }
          AppToast.success('Sesión actualizada')
        }
      })
    })

    card.querySelector('[data-action="asistencia"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      if (drawerCallbacks.onPasarAsistencia) {
        drawerCallbacks.onPasarAsistencia(sesion)
      }
    })
  })
}

function _cerrarDrawer(drawer) {
  drawer.classList.remove('open')
  setTimeout(() => drawer.remove(), 300)
}

function _formatFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00')
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return fecha.toLocaleDateString('es-ES', opciones)
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderCalendarioCompleto(container, opciones = {}) {
  const {
    sesiones = [],
    clases = [],
    maestroId = null,
    esCoDocencia = false,
    onFechaClick = null,
    onSessionClick = null,
  } = opciones

  const today = new Date()
  let currentYear = today.getFullYear()
  let currentMonth = today.getMonth()

  _renderCalendarioMes(container, currentYear, currentMonth, sesiones, clases, onFechaClick, () => {
    if (currentMonth === 11) {
      currentMonth = 0
      currentYear++
    } else {
      currentMonth++
    }
    _renderCalendarioMes(container, currentYear, currentMonth, sesiones, clases, onFechaClick)
  }, () => {
    if (currentMonth === 0) {
      currentMonth = 11
      currentYear--
    } else {
      currentMonth--
    }
    _renderCalendarioMes(container, currentYear, currentMonth, sesiones, clases, onFechaClick)
  })
}

function _renderCalendarioMes(container, year, month, sesiones, clases, onFechaClick, onNext, onPrev) {
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
  
  const primerDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 0)
  const diasEnMes = ultimoDia.getDate()
  const primerDiaSemana = primerDia.getDay()
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Determine active date for roving tabindex: today if visible, else first day of month
  const firstDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDate  = `${year}-${String(month + 1).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`
  const activeDate = (todayStr >= firstDate && todayStr <= lastDate) ? todayStr : firstDate

  let diasHTML = DIAS.map(d => `<div class="cal-day-header">${d}</div>`).join('')

  for (let i = 0; i < primerDiaSemana; i++) {
    diasHTML += `<div class="cal-day empty"></div>`
  }

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const sesionsEnFecha = sesiones.filter(s => s.fecha === fecha)
    const sesionCount = sesionsEnFecha.length
    const esHoy = fecha === todayStr
    const tieneEmergente = sesionsEnFecha.some(s => s.tipo === 'emergente')
    const isActive = fecha === activeDate
    
    let dayClass = 'cal-day'
    if (esHoy) dayClass += ' today'
    if (sesionCount > 0) dayClass += ' has-sessions'
    if (tieneEmergente) dayClass += ' has-emergente'
    
    const dotIndicators = sesionCount > 0 
      ? `<div class="day-dots">
          ${sesionsEnFecha.map(s => `<span class="dot ${s.tipo === 'emergente' ? 'emergente' : 'regular'}"></span>`).join('')}
        </div>` 
      : ''

    const ariaLabel = `${d} de ${MESES[month]} ${year}`
    const ariaCurrent = esHoy ? ' aria-current="date"' : ''
    const tabIndex = isActive ? '0' : '-1'

    diasHTML += `
      <div class="${dayClass}" data-fecha="${fecha}" role="gridcell" tabindex="${tabIndex}" aria-label="${ariaLabel}" aria-selected="false"${ariaCurrent}>
        <span class="day-number">${d}</span>
        ${dotIndicators}
      </div>
    `
  }

  container.innerHTML = `
    <div class="calendario-completo">
      <div class="cal-header">
        <button class="btn-nav" id="cal-prev">‹</button>
        <h3>${MESES[month]} ${year}</h3>
        <button class="btn-nav" id="cal-next">›</button>
      </div>
      
      <div class="cal-grid" role="grid" aria-label="Calendario ${MESES[month]} ${year}">
        ${diasHTML}
      </div>
      
      <div class="cal-legend">
        <span class="legend-item"><span class="dot regular"></span> Regular</span>
        <span class="legend-item"><span class="dot emergente"></span> Emergente</span>
      </div>
    </div>
  `

  container.querySelector('#cal-prev')?.addEventListener('click', onPrev)
  container.querySelector('#cal-next')?.addEventListener('click', onNext)

  container.querySelectorAll('.cal-day:not(.empty)').forEach(day => {
    day.addEventListener('click', () => {
      // Update aria-selected on click
      container.querySelectorAll('.cal-day[data-fecha]').forEach(c => c.setAttribute('aria-selected', 'false'))
      day.setAttribute('aria-selected', 'true')
      if (onFechaClick) {
        onFechaClick(day.dataset.fecha)
      }
    })
  })

  // Keyboard navigation: WAI-ARIA grid pattern with roving tabindex
  const grid = container.querySelector('.cal-grid')
  if (!grid) return

  grid.addEventListener('keydown', function onGridKeydown(e) {
    const days = [...grid.querySelectorAll('.cal-day[data-fecha]')]
    if (days.length === 0) return

    const currentFocused = grid.querySelector('[tabindex="0"]')
    const currentIndex = currentFocused ? days.indexOf(currentFocused) : -1

    const moveFocus = (idx) => {
      if (idx < 0 || idx >= days.length) return
      days.forEach(d => d.setAttribute('tabindex', '-1'))
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
        if (typeof onPrev === 'function') {
          onPrev()
          requestAnimationFrame(() => {
            const newGrid = container.querySelector('.cal-grid')
            if (newGrid) {
              const firstDay = newGrid.querySelector('.cal-day[data-fecha]')
              if (firstDay) {
                newGrid.querySelectorAll('.cal-day[data-fecha]').forEach(d => d.setAttribute('tabindex', '-1'))
                firstDay.setAttribute('tabindex', '0')
                firstDay.focus()
              }
            }
          })
        }
        break
      case 'PageDown':
        e.preventDefault()
        if (typeof onNext === 'function') {
          onNext()
          requestAnimationFrame(() => {
            const newGrid = container.querySelector('.cal-grid')
            if (newGrid) {
              const firstDay = newGrid.querySelector('.cal-day[data-fecha]')
              if (firstDay) {
                newGrid.querySelectorAll('.cal-day[data-fecha]').forEach(d => d.setAttribute('tabindex', '-1'))
                firstDay.setAttribute('tabindex', '0')
                firstDay.focus()
              }
            }
          })
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (currentFocused) currentFocused.click()
        break
    }
  })
}