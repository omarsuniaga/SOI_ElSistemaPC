import './postuladoCalendario.css'
import { listarCitas } from '../../api/postulantesApi.js'
import { router } from '../../../../core/router/router.js'

const state = {
  vista: 'mes', // mes | semana | dia
  ref: new Date(), // fecha de referencia (ancla de la vista)
  citas: [],
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ── Helpers de fecha ──────────────────────────────────────────────────────────
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }
function startOfWeek(d) { const x = startOfDay(d); x.setDate(x.getDate() - x.getDay()); return x }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function fromIso(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
function horaStr(iso) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export async function renderPostuladoCalendarioView(container) {
  await cargarCitas(container)
}

async function cargarCitas(container) {
  try {
    renderSkeleton(container)
    let desde, hasta
    if (state.vista === 'mes') {
      desde = new Date(state.ref.getFullYear(), state.ref.getMonth(), 1, 0, 0, 0)
      hasta = new Date(state.ref.getFullYear(), state.ref.getMonth() + 1, 0, 23, 59, 59)
    } else if (state.vista === 'semana') {
      desde = startOfWeek(state.ref)
      hasta = endOfDay(addDays(desde, 6))
    } else {
      desde = startOfDay(state.ref)
      hasta = endOfDay(state.ref)
    }
    state.citas = await listarCitas(desde.toISOString(), hasta.toISOString())
    renderContent(container)
  } catch (error) {
    renderError(container, error.message)
  }
}

function renderSkeleton(container) {
  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4 pcal-wrap">
      <h1 class="h3 fw-bold mb-4">Calendario de Citas</h1>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 360px;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    </div>`
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="container py-5 text-center pcal-wrap">
      <div class="alert alert-danger border-0 shadow-sm p-4 rounded-3">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-2 d-block"></i>
        <h4 class="fw-bold">Error al cargar citas</h4>
        <p>${message}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-error-retry">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>`
  document.getElementById('btn-error-retry')?.addEventListener('click', () => renderPostuladoCalendarioView(container))
}

function tituloRango() {
  if (state.vista === 'mes') return `${MESES[state.ref.getMonth()]} ${state.ref.getFullYear()}`
  if (state.vista === 'semana') {
    const ini = startOfWeek(state.ref)
    const fin = addDays(ini, 6)
    return `${ini.getDate()} ${MESES[ini.getMonth()].slice(0, 3)} – ${fin.getDate()} ${MESES[fin.getMonth()].slice(0, 3)} ${fin.getFullYear()}`
  }
  return `${DIAS_SEMANA[state.ref.getDay()]} ${state.ref.getDate()} de ${MESES[state.ref.getMonth()]} ${state.ref.getFullYear()}`
}

function renderContent(container) {
  const btn = (v, label) =>
    `<button class="btn btn-sm ${state.vista === v ? 'btn-primary' : 'btn-outline-secondary'} cal-vista" data-vista="${v}">${label}</button>`

  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4 pcal-wrap">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 class="h3 fw-bold mb-1">Calendario de Citas</h1>
          <p class="text-body-secondary mb-0 small">Entrevistas de admisión · ${state.citas.length} cita${state.citas.length === 1 ? '' : 's'} en vista</p>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <div class="btn-group btn-group-sm shadow-sm" role="group">
            ${btn('mes', 'Mes')}${btn('semana', 'Semana')}${btn('dia', 'Día')}
          </div>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-today">Hoy</button>
          <div class="input-group input-group-sm shadow-sm" style="max-width: 280px;">
            <button class="btn btn-outline-secondary" id="btn-prev"><i class="bi bi-chevron-left"></i></button>
            <span class="input-group-text flex-grow-1 justify-content-center fw-semibold">${tituloRango()}</span>
            <button class="btn btn-outline-secondary" id="btn-next"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>

      <div id="cal-body">
        ${state.vista === 'mes' ? renderMes() : state.vista === 'semana' ? renderSemana() : renderDia()}
      </div>
    </div>`

  attachEvents(container)
}

function citasDeDia(date) {
  return state.citas
    .filter((c) => c.fecha_cita && sameDay(new Date(c.fecha_cita), date))
    .sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita))
}

// ── Vista MES ─────────────────────────────────────────────────────────────────
function renderMes() {
  const year = state.ref.getFullYear()
  const month = state.ref.getMonth()
  const diasEnMes = new Date(year, month + 1, 0).getDate()
  const offset = new Date(year, month, 1).getDay()
  const hoy = new Date()

  let celdas = ''
  for (let i = 0; i < offset; i++) {
    celdas += `<div class="col pcal-cell is-empty" style="width:14.28%"></div>`
  }
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(year, month, dia)
    const esHoy = sameDay(fecha, hoy)
    const citas = citasDeDia(fecha)
    celdas += `
      <div class="col pcal-cell ${esHoy ? 'is-today' : ''} p-2" style="width:14.28%;min-width:14%" data-date="${isoDate(fecha)}" role="button">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="pcal-daynum ${esHoy ? 'is-today' : ''} fw-bold rounded-circle">${dia}</span>
          ${citas.length ? `<span class="badge rounded-pill text-bg-secondary" style="font-size:.62rem">${citas.length}</span>` : ''}
        </div>
        <div class="d-flex flex-column gap-1 overflow-auto" style="max-height:74px">
          ${citas.map((c) => `
            <span class="pcal-cita text-truncate">
              <i class="bi bi-clock me-1"></i>${horaStr(c.fecha_cita)} · ${esc(c.nombre_completo)}
            </span>`).join('')}
        </div>
      </div>`
  }

  return `
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden pcal-card">
      <div class="row g-0 text-center py-2 fw-bold small pcal-weekhead">
        ${DIAS_SEMANA.map((d) => `<div class="col" style="width:14.28%">${d}</div>`).join('')}
      </div>
      <div class="row g-0 flex-wrap">${celdas}</div>
    </div>`
}

// ── Vista SEMANA ──────────────────────────────────────────────────────────────
function renderSemana() {
  const ini = startOfWeek(state.ref)
  const hoy = new Date()
  let cols = ''
  for (let i = 0; i < 7; i++) {
    const fecha = addDays(ini, i)
    const esHoy = sameDay(fecha, hoy)
    const citas = citasDeDia(fecha)
    cols += `
      <div class="col pcal-weekcol" data-date="${isoDate(fecha)}" role="button" style="min-width:0">
        <div class="text-center py-2 pcal-weekhead-day ${esHoy ? 'is-today' : ''}">
          <div class="small text-body-secondary">${DIAS_SEMANA[fecha.getDay()]}</div>
          <div class="fw-bold ${esHoy ? 'text-primary' : ''}">${fecha.getDate()}</div>
        </div>
        <div class="p-2 d-flex flex-column gap-1">
          ${citas.length === 0 ? '<div class="text-body-secondary text-center small mt-3">—</div>' : citas.map((c) => `
            <span class="pcal-cita">
              <span class="fw-semibold"><i class="bi bi-clock me-1"></i>${horaStr(c.fecha_cita)}</span><br>
              <span class="text-truncate d-block">${esc(c.nombre_completo)}</span>
            </span>`).join('')}
        </div>
      </div>`
  }
  return `
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden pcal-card pcal-week-scroll">
      <div class="row g-0">${cols}</div>
    </div>`
}

// ── Vista DÍA (detalle) ───────────────────────────────────────────────────────
function renderDia() {
  const citas = citasDeDia(state.ref)
  if (citas.length === 0) {
    return `
      <div class="card border-0 shadow-sm rounded-3 pcal-card">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
          No hay citas agendadas para este día.
        </div>
      </div>`
  }
  return `
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden pcal-card">
      ${citas.map((c) => {
        const repre = c.madre_nombre || c.padre_nombre || c.representante_parentesco || null
        const tel = c.madre_tlf_whatsapp || c.padre_tlf_whatsapp || c.telefono_alumno || null
        return `
        <div class="pcal-day-item d-flex align-items-center gap-3 py-3 px-3">
          <div class="text-center flex-shrink-0" style="width:78px">
            <div class="fw-bold text-primary fs-6">${horaStr(c.fecha_cita)}</div>
          </div>
          <div class="flex-grow-1 min-w-0">
            <div class="fw-semibold">${esc(c.nombre_completo)}</div>
            <div class="small text-body-secondary d-flex flex-wrap gap-3">
              ${repre ? `<span><i class="bi bi-person me-1"></i>Rep.: ${esc(repre)}</span>` : ''}
              ${tel ? `<span><i class="bi bi-whatsapp me-1 text-success"></i>${esc(tel)}</span>` : ''}
              ${c.instrumento ? `<span><i class="bi bi-music-note me-1"></i>${esc(c.instrumento)}</span>` : ''}
            </div>
          </div>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-shrink-0 cal-cita-form" data-id="${c.id}">
            <i class="bi bi-file-earmark-person me-1"></i><span class="d-none d-sm-inline">Ver formulario</span>
          </button>
        </div>`
      }).join('')}
    </div>`
}

function attachEvents(container) {
  container.querySelectorAll('.cal-vista').forEach((b) =>
    b.addEventListener('click', () => { state.vista = b.dataset.vista; cargarCitas(container) }))

  container.querySelector('#btn-today')?.addEventListener('click', () => { state.ref = new Date(); cargarCitas(container) })
  container.querySelector('#btn-prev')?.addEventListener('click', () => { navegar(-1); cargarCitas(container) })
  container.querySelector('#btn-next')?.addEventListener('click', () => { navegar(1); cargarCitas(container) })

  // Clic en una fecha (mes/semana) → ver las citas de ese día (vista Día)
  container.querySelectorAll('[data-date]').forEach((cell) =>
    cell.addEventListener('click', () => {
      state.vista = 'dia'
      state.ref = fromIso(cell.dataset.date)
      cargarCitas(container)
    }))

  // Botón "Ver formulario" en vista Día → perfil del postulado
  container.querySelectorAll('.cal-cita-form').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation()
      router.navigate('postulado', { id: b.dataset.id })
    }))
}

function navegar(dir) {
  if (state.vista === 'mes') state.ref = new Date(state.ref.getFullYear(), state.ref.getMonth() + dir, 1)
  else if (state.vista === 'semana') state.ref = addDays(state.ref, 7 * dir)
  else state.ref = addDays(state.ref, dir)
}

function esc(s) {
  if (s == null) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
