import { listarCitas } from '../../api/postulantesApi.js'
import { router } from '../../../../core/router/router.js'

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-12
  citas: [],
  cargando: false,
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export async function renderPostuladoCalendarioView(container) {
  await cargarCitas(container)
}

async function cargarCitas(container) {
  try {
    state.cargando = true
    renderSkeleton(container)

    // Definir el rango del mes seleccionado
    const primerDia = new Date(state.year, state.month - 1, 1, 0, 0, 0).toISOString()
    const ultimoDia = new Date(state.year, state.month, 0, 23, 59, 59).toISOString()

    state.citas = await listarCitas(primerDia, ultimoDia)
    state.cargando = false

    renderContent(container)
  } catch (error) {
    state.cargando = false
    renderError(container, error.message)
  }
}

function renderSkeleton(container) {
  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Calendario de Citas</h1>
          <p class="text-muted mb-0">Seguimiento mensual de entrevistas de admisión</p>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando calendario...</span>
          </div>
          <p class="text-muted mt-2">Cargando citas...</p>
        </div>
      </div>
    </div>
  `
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="container py-5 text-center">
      <div class="alert alert-danger shadow-sm border-0 d-flex flex-column align-items-center p-4 rounded-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-2"></i>
        <h4 class="alert-heading fw-bold">Error al cargar citas</h4>
        <p>${message}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-3" id="btn-error-retry">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>
  `
  document.getElementById('btn-error-retry')?.addEventListener('click', () => renderPostuladoCalendarioView(container))
}

function renderContent(container) {
  // Cantidad de días en el mes
  const diasEnMes = new Date(state.year, state.month, 0).getDate()
  // Día de la semana en que inicia el mes (0 = Domingo, 1 = Lunes...)
  const primerDiaSemana = new Date(state.year, state.month - 1, 1).getDay()

  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4">
      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Calendario de Citas</h1>
          <p class="text-muted mb-0">Seguimiento mensual de entrevistas de admisión</p>
        </div>
        
        <!-- SELECTOR MES -->
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-today">Hoy</button>
          <div class="input-group input-group-sm shadow-sm" style="max-width: 250px;">
            <button class="btn btn-outline-secondary" id="btn-month-prev" type="button">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="form-control text-center fw-semibold bg-light d-flex align-items-center justify-content-center" style="min-width: 140px;">
              ${MESES[state.month - 1]} ${state.year}
            </span>
            <button class="btn btn-outline-secondary" id="btn-month-next" type="button">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- CALENDAR CARD -->
      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div class="card-body p-0">
          
          <!-- DIAS SEMANA HEADER -->
          <div class="row g-0 bg-light text-center border-bottom py-2 fw-bold text-muted small">
            ${DIAS_SEMANA.map(dia => `<div class="col" style="width: 14.28%;">${dia}</div>`).join('')}
          </div>

          <!-- GRID CALENDARIO -->
          <div class="row g-0 flex-wrap" id="calendar-grid">
            ${renderGrid(primerDiaSemana, diasEnMes)}
          </div>

        </div>
      </div>
    </div>
  `

  attachEvents(container)
}

function renderGrid(offset, totalDays) {
  let html = ''
  
  // 1. Celdas vacías al principio del mes
  for (let i = 0; i < offset; i++) {
    html += `
      <div class="col p-2 bg-light bg-opacity-25 border-end border-bottom d-none d-md-block" style="width: 14.28%; min-height: 120px;">
        <span class="text-muted opacity-25 small"></span>
      </div>
    `
  }

  const hoy = new Date()
  const esMesActual = hoy.getFullYear() === state.year && (hoy.getMonth() + 1) === state.month

  // 2. Pintar los días del mes
  for (let dia = 1; dia <= totalDays; dia++) {
    const esHoy = esMesActual && hoy.getDate() === dia
    const citasDelDia = getCitasDelDia(dia)
    
    html += `
      <div class="col border-end border-bottom position-relative p-2" style="width: 14.28%; min-width: 14%; min-height: 120px; background-color: ${esHoy ? 'rgba(13, 110, 253, 0.04)' : '#fff'};">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="badge ${esHoy ? 'bg-primary text-white' : 'text-secondary'} fw-bold rounded-circle small p-1 d-inline-flex align-items-center justify-content-center" style="width: 24px; height: 24px;">
            ${dia}
          </span>
          ${citasDelDia.length > 0 ? `<span class="badge bg-light-primary text-primary d-md-none rounded-pill border border-primary border-opacity-25" style="font-size: 0.7rem;">${citasDelDia.length}</span>` : ''}
        </div>
        
        <!-- CITAS CONTAINER -->
        <div class="d-flex flex-column gap-1 overflow-y-auto scrollbar-hidden mt-1" style="max-height: 90px;">
          ${citasDelDia.map(c => {
            const timeStr = new Date(c.fecha_cita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
            return `
              <div class="calendar-event-badge bg-light-primary text-primary border border-primary border-opacity-10 rounded px-2 py-1 small cursor-pointer hover-shadow transition-all d-none d-md-block btn-goto-perfil" data-id="${c.id}" title="${c.nombre_completo} - ${timeStr}">
                <div class="fw-semibold text-truncate" style="font-size: 0.75rem;">${c.nombre_completo}</div>
                <div class="text-secondary" style="font-size: 0.65rem;"><i class="bi bi-clock me-0.5"></i>${timeStr}</div>
              </div>
            `
          }).join('')}
          
          <!-- VISTA MOBILE FLUIDA -->
          ${citasDelDia.length > 0 ? `
            <div class="d-md-none text-center mt-1">
              <button class="btn btn-link text-decoration-none p-0 text-primary fw-semibold btn-view-mobile-day" style="font-size: 0.7rem;" data-day="${dia}">
                Ver ${citasDelDia.length} citas
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `
    
    // Si llegamos al final de la semana, cerramos la fila en CSS Grid virtualmente (Bootstrap se encarga al tener anchos fijos de 14.28% y flexbox wrapping, lo cual es excelente).
  }

  // 3. Rellenar con celdas vacías al final si no termina en sábado (para que el grid quede cuadrado)
  const celdasTotales = offset + totalDays
  const sobrante = celdasTotales % 7
  if (sobrante > 0) {
    const faltantes = 7 - sobrante
    for (let i = 0; i < faltantes; i++) {
      html += `
        <div class="col p-2 bg-light bg-opacity-25 border-end border-bottom d-none d-md-block" style="width: 14.28%; min-height: 120px;">
          <span class="text-muted opacity-25 small"></span>
        </div>
      `
    }
  }

  return html
}

function getCitasDelDia(dia) {
  return state.citas.filter((c) => {
    if (!c.fecha_cita) return false
    const date = new Date(c.fecha_cita)
    return date.getDate() === dia && date.getMonth() + 1 === state.month && date.getFullYear() === state.year
  })
}

function attachEvents(container) {
  // Selector de mes ←
  document.getElementById('btn-month-prev')?.addEventListener('click', () => {
    state.month--
    if (state.month < 1) {
      state.month = 12
      state.year--
    }
    cargarCitas(container)
  })

  // Selector de mes →
  document.getElementById('btn-month-next')?.addEventListener('click', () => {
    state.month++
    if (state.month > 12) {
      state.month = 1
      state.year++
    }
    cargarCitas(container)
  })

  // Botón "Hoy"
  document.getElementById('btn-today')?.addEventListener('click', () => {
    state.year = new Date().getFullYear()
    state.month = new Date().getMonth() + 1
    cargarCitas(container)
  })

  // Clicks en eventos de escritorio
  container.querySelectorAll('.btn-goto-perfil').forEach((badge) => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = e.currentTarget.getAttribute('data-id')
      router.navigate('postulado', { id })
    })
  })

  // Clicks en vista mobile (ver citas del día)
  container.querySelectorAll('.btn-view-mobile-day').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const dia = parseInt(e.currentTarget.getAttribute('data-day'))
      const citas = getCitasDelDia(dia)
      
      const listStr = citas.map(c => {
        const timeStr = new Date(c.fecha_cita).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
        return `• ${c.nombre_completo} (${timeStr})`
      }).join('\n')

      alert(`Citas para el día ${dia} de ${MESES[state.month - 1]}:\n\n${listStr}\n\nSelecciona el perfil para ver detalles.`)
      
      if (citas.length === 1) {
        router.navigate('postulado', { id: citas[0].id })
      }
    })
  })
}
