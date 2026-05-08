import { getMaestroLocal } from '../auth/maestroAuth.js'
import CLASES_DATA from '../data/clases.json'
import SESIONES_DATA from '../data/sesiones.json'

let drawerInstance = null

export function openCalendarioDrawerPM(container, opciones = {}) {
  const {
    sesiones = [],
    clases = [],
    maestroId = null,
    onVerSesion = null,
    onNuevaSesion = null,
  } = opciones

  if (drawerInstance) {
    drawerInstance.remove()
  }

  const maestro = getMaestroLocal()
  const maestroActualId = maestroId || maestro?.id

  const drawer = document.createElement('div')
  drawer.className = 'pm-drawer-overlay'
  drawer.id = 'pm-calendario-drawer'
  drawerInstance = drawer

  drawer.innerHTML = _renderDrawer(maestroActualId, sesiones, clases)

  document.body.appendChild(drawer)

  setTimeout(() => drawer.classList.add('open'), 10)

  _attachDrawerEvents(drawer, maestroActualId, sesiones, clases, onVerSesion, onNuevaSesion)
}

function _renderDrawer(maestroId, sesiones, clases) {
  const sesionCount = sesiones.length

  return `
    <div class="pm-drawer">
      <div class="pm-drawer-header">
        <h4>Acciones del Día</h4>
        <button class="pm-drawer-close" id="pm-drawer-close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="pm-drawer-body">
        <button class="pm-btn pm-btn-primary w-100 mb-3" id="btn-nueva-sesion">
          <i class="bi bi-plus-circle"></i> Nueva Sesión
        </button>

        <div class="pm-sesiones-list">
          <h6 class="text-muted mb-2">Sesiones Programadas</h6>
          ${sesiones.length > 0 
            ? sesiones.map(s => _renderSesionItem(s, clases)).join('')
            : '<p class="text-muted text-center py-3">No hay sesiones</p>'
          }
        </div>
      </div>
    </div>
  `
}

function _renderSesionItem(sesion, clases) {
  const clase = clases.find(c => c.id === sesion.clase_id)
  const claseNombre = clase?.nombre || 'Clase'
  const esEmergente = sesion.tipo === 'emergente'
  const tieneAsistencia = sesion.asistencia && (sesion.asistencia.presentes > 0)

  return `
    <div class="pm-sesion-item" data-sesion-id="${sesion.id}">
      <div class="pm-sesion-header">
        <span class="badge ${esEmergente ? 'bg-warning text-dark' : 'bg-success'}">
          ${esEmergente ? '⚡' : '📅'}
        </span>
        <span class="pm-sesion-hora">${sesion.hora_inicio} - ${sesion.hora_fin}</span>
      </div>
      <div class="pm-sesion-body">
        <div class="fw-bold">${_escHTML(sesion.tema || 'Sin título')}</div>
        <small class="text-muted">${_escHTML(claseNombre)}</small>
      </div>
      <div class="pm-sesion-actions">
        <button class="btn btn-sm btn-outline-primary" data-action="ver" title="Ver">
          <i class="bi bi-eye"></i>
        </button>
        ${!tieneAsistencia ? `
        <button class="btn btn-sm btn-outline-success" data-action="asistencia" title="Pasar asistencia">
          <i class="bi bi-check2-square"></i>
        </button>
        ` : ''}
      </div>
    </div>
  `
}

function _attachDrawerEvents(drawer, maestroId, sesiones, clases, onVerSesion, onNuevaSesion) {
  drawer.querySelector('#pm-drawer-close')?.addEventListener('click', () => _closeDrawer(drawer))
  
  drawer.querySelector('.pm-drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('pm-drawer-overlay')) {
      _closeDrawer(drawer)
    }
  })

  drawer.querySelector('#btn-nueva-sesion')?.addEventListener('click', () => {
    _closeDrawer(drawer)
    if (onNuevaSesion) onNuevaSesion()
  })

  drawer.querySelectorAll('.pm-sesion-item').forEach(item => {
    const sesionId = item.dataset.sesionId
    const sesion = sesiones.find(s => s.id === sesionId)
    if (!sesion) return

    item.querySelector('[data-action="ver"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      if (onVerSesion) onVerSesion(sesion)
    })

    item.querySelector('[data-action="asistencia"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      if (onVerSesion) onVerSesion(sesion, 'asistencia')
    })
  })
}

function _closeDrawer(drawer) {
  drawer.classList.remove('open')
  drawerInstance = null
  setTimeout(() => drawer.remove(), 300)
}

export function renderCalendarioMensual(container, opciones = {}) {
  const {
    sesiones = [],
    clases = [],
    maestroId = null,
    onFechaClick = null,
    esCoDocencia = false,
  } = opciones

  const today = new Date()
  let currentYear = today.getFullYear()
  let currentMonth = today.getMonth()

  function render() {
    container.innerHTML = _renderMonth(currentYear, currentMonth, sesiones, clases, onFechaClick)
    _attachMonthEvents(container, currentYear, currentMonth, render, renderPrev, onFechaClick)
  }

  function renderNext() {
    if (currentMonth === 11) {
      currentMonth = 0
      currentYear++
    } else {
      currentMonth++
    }
    render()
  }

  function renderPrev() {
    if (currentMonth === 0) {
      currentMonth = 11
      currentYear--
    } else {
      currentMonth--
    }
    render()
  }

  render()
}

function _renderMonth(year, month, sesiones, clases, onFechaClick) {
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

  const primerDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 0)
  const diasEnMes = ultimoDia.getDate()
  const primerDiaSemana = primerDia.getDay()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  let diasHTML = DIAS.map(d => `<div class="pm-cal-day-header">${d}</div>`).join('')

  for (let i = 0; i < primerDiaSemana; i++) {
    diasHTML += `<div class="pm-cal-day empty"></div>`
  }

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const sesionesEnFecha = sesiones.filter(s => s.fecha === fecha)
    const sesionCount = sesionesEnFecha.length
    const esHoy = fecha === todayStr
    const tieneEmergente = sesionesEnFecha.some(s => s.tipo === 'emergente')

    let dayClass = 'pm-cal-day'
    if (esHoy) dayClass += ' today'
    if (sesionCount > 0) dayClass += ' has-sessions'

    const dots = sesionCount > 0
      ? `<div class="pm-day-dots">
          ${sesionesEnFecha.map(s => `<span class="pm-dot ${s.tipo === 'emergente' ? 'emergente' : 'regular'}"></span>`).join('')}
        </div>`
      : ''

    diasHTML += `
      <div class="${dayClass}" data-fecha="${fecha}">
        <span class="pm-day-number">${d}</span>
        ${dots}
      </div>
    `
  }

  return `
    <div class="pm-calendar-full">
      <div class="pm-cal-nav">
        <button class="pm-nav-btn" id="pm-cal-prev">‹</button>
        <h3 class="pm-cal-title">${MESES[month]} ${year}</h3>
        <button class="pm-nav-btn" id="pm-cal-next">›</button>
      </div>

      <div class="pm-cal-grid">
        ${diasHTML}
      </div>

      <div class="pm-cal-legend">
        <span><span class="pm-dot regular"></span> Regular</span>
        <span><span class="pm-dot emergente"></span> Emergente</span>
      </div>
    </div>
  `
}

function _attachMonthEvents(container, year, month, onNext, onPrev, onFechaClick) {
  container.querySelector('#pm-cal-prev')?.addEventListener('click', onPrev)
  container.querySelector('#pm-cal-next')?.addEventListener('click', onNext)

  container.querySelectorAll('.pm-cal-day:not(.empty)').forEach(day => {
    day.addEventListener('click', () => {
      if (onFechaClick) {
        onFechaClick(day.dataset.fecha)
      }
    })
  })
}

function _escHTML(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}