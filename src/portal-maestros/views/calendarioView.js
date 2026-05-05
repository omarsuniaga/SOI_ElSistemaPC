import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'

const DIAS_HEADER    = ['Do','Lu','Ma','Mi','Ju','Vi','Sa']
const DIAS_ES        = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
const MESES_ES       = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
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
  let anio  = hoy.getFullYear()
  let mes   = hoy.getMonth()

  async function cargarYRenderizar() {
    try {
      const estado = await _calcularEstadoMes(maestro.id, anio, mes)
      _renderCalendario(container, anio, mes, hoy, estado, {
        onFechaClick,
        onPrev: () => {
          if (mes === 0) { anio--; mes = 11 } else { mes-- }
          cargarYRenderizar()
        },
        onNext: () => {
          if (mes === 11) { anio++; mes = 0 } else { mes++ }
          cargarYRenderizar()
        },
      })
    } catch (err) {
      container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${_escHTML(err.message)}</p>`
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
  const desde     = primerDia.toISOString().split('T')[0]
  const hasta     = ultimoDia.toISOString().split('T')[0]

  // 1. Horarios del maestro (qué días de la semana tiene clases)
  const { data: horarios } = await supabase
    .from('clase_horarios')
    .select('dia, clase:clases!inner(id, maestro_principal_id)')
    .eq('clase.maestro_principal_id', maestroId)

  const diasConClase = new Set((horarios || []).map(h => h.dia.toLowerCase()))

  // 2. Sesiones registradas en el mes
  const { data: sesiones } = await supabase
    .from('sesiones_clase')
    .select('fecha')
    .eq('maestro_id', maestroId)
    .eq('borrador', false)
    .gte('fecha', desde)
    .lte('fecha', hasta)

  const fechasRegistradas = new Set((sesiones || []).map(s => s.fecha))

  // 3. Calcular estado por día
  const estadoMap = new Map()
  const hoy       = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    const fecha   = d.toISOString().split('T')[0]
    const diaEs   = DIAS_ES[d.getDay()]
    const tieneCl = diasConClase.has(diaEs)

    if (!tieneCl) {
      estadoMap.set(fecha, 'sin-clase')
      continue
    }

    if (fechasRegistradas.has(fecha)) {
      estadoMap.set(fecha, 'registrada')
      continue
    }

    const fechaDate = new Date(d)
    const diffDias  = Math.floor((hoy - fechaDate) / 86400000)

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
  const primerDia    = new Date(anio, mes, 1)
  const ultimoDia    = new Date(anio, mes + 1, 0)
  const primerDiaSem = primerDia.getDay()
  const hoyStr       = hoy.toISOString().split('T')[0]

  let diasHTML = DIAS_HEADER.map(d => `<div class="pm-cal-day-header">${d}</div>`).join('')

  for (let i = 0; i < primerDiaSem; i++) {
    diasHTML += `<div class="pm-cal-day otro-mes"></div>`
  }

  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const fecha  = `${anio}-${String(mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const estado = estadoMap.get(fecha) || 'sin-clase'
    const esHoy  = fecha === hoyStr ? 'today' : ''

    diasHTML += `
      <div class="pm-cal-day estado-${estado} ${esHoy}" data-fecha="${fecha}" title="${fecha}">
        ${d}
      </div>
    `
  }

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
      <button id="pm-cal-prev" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--pm-primary);padding:.25rem .5rem;">‹</button>
      <h2 style="font-size:1.1rem;font-weight:700;">${MESES_ES[mes]} ${anio}</h2>
      <button id="pm-cal-next" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--pm-primary);padding:.25rem .5rem;">›</button>
    </div>

    <div class="pm-card" style="padding:.75rem;">
      <div class="pm-cal-grid">
        ${diasHTML}
      </div>

      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#16a34a"></div> Registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#ca8a04"></div> Pendiente
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#dc2626"></div> Vencida (+7 días)
        </div>
      </div>
    </div>
  `

  container.querySelector('#pm-cal-prev').addEventListener('click', onPrev)
  container.querySelector('#pm-cal-next').addEventListener('click', onNext)

  container.querySelectorAll('.pm-cal-day[data-fecha]').forEach(cell => {
    cell.addEventListener('click', () => {
      onFechaClick?.(cell.dataset.fecha)
    })
  })
}

function _escHTML(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}
