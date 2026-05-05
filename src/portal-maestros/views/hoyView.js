import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'

const DIAS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

/**
 * Renderiza la vista Hoy: lista de clases del día actual ordenadas por hora.
 * @param {HTMLElement} container
 * @param {{ onClaseClick?: (claseId: string) => void }} options
 */
export async function renderHoyView(container, { onClaseClick } = {}) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  const hoy     = new Date()
  const diaHoy  = DIAS_ES[hoy.getDay()]
  const fechaStr = hoy.toISOString().split('T')[0]

  try {
    // 1. Obtener clases del maestro que tienen horario hoy
    const { data: horarios, error: errH } = await supabase
      .from('clase_horarios')
      .select(`
        hora_inicio,
        hora_fin,
        salon_id,
        clase:clases!inner(
          id,
          nombre,
          instrumento,
          capacidad_maxima,
          maestro_principal_id
        )
      `)
      .eq('dia', diaHoy)
      .eq('clase.maestro_principal_id', maestro.id)
      .order('hora_inicio', { ascending: true })

    if (errH) throw errH

    if (!horarios || horarios.length === 0) {
      container.innerHTML = `<p class="pm-empty">No tenés clases hoy.<br><small>Día: ${_capitalize(diaHoy)}</small></p>`
      return
    }

    // 2. Obtener qué sesiones ya fueron registradas hoy
    const claseIds = horarios.map(h => h.clase.id)
    const { data: sesionesHoy } = await supabase
      .from('sesiones_clase')
      .select('clase_id, borrador')
      .in('clase_id', claseIds)
      .eq('fecha', fechaStr)
      .eq('borrador', false)

    const registradasHoy = new Set((sesionesHoy || []).map(s => s.clase_id))

    // 3. Obtener cantidad de alumnos por clase
    const { data: inscripciones } = await supabase
      .from('alumnos_clases')
      .select('clase_id')
      .in('clase_id', claseIds)
      .eq('activo', true)

    const alumnosPorClase = {}
    for (const insc of (inscripciones || [])) {
      alumnosPorClase[insc.clase_id] = (alumnosPorClase[insc.clase_id] || 0) + 1
    }

    // 4. Renderizar
    const listHTML = horarios.map(h => {
      const clase        = h.clase
      const registrada   = registradasHoy.has(clase.id)
      const totalAlumnos = alumnosPorClase[clase.id] || 0
      const estadoClass  = registrada ? 'registrada' : 'sin-registrar'
      const badgeHTML    = registrada
        ? `<span class="pm-badge pm-badge-success">✓ Registrada</span>`
        : `<span class="pm-badge pm-badge-danger">Sin registrar</span>`

      return `
        <div class="pm-clase-card ${estadoClass}" data-clase-id="${clase.id}" data-horario-inicio="${h.hora_inicio}">
          <div class="pm-clase-nombre">${_escHTML(clase.nombre)}</div>
          <div class="pm-clase-meta">
            <span>🕐 ${_formatHora(h.hora_inicio)} – ${_formatHora(h.hora_fin)}</span>
            <span>🎸 ${_escHTML(clase.instrumento || '—')}</span>
            <span>👥 ${totalAlumnos} alumnos</span>
            ${h.salon_id ? `<span>📍 Salón ${h.salon_id}</span>` : ''}
          </div>
          ${badgeHTML}
        </div>
      `
    }).join('')

    container.innerHTML = `
      <h2 style="font-size:.9rem;font-weight:700;color:var(--pm-text-muted);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">
        ${_capitalize(diaHoy)} ${_formatFecha(hoy)}
      </h2>
      ${listHTML}
    `

    // 5. Eventos de click en cada clase
    container.querySelectorAll('.pm-clase-card').forEach(card => {
      card.addEventListener('click', () => {
        onClaseClick?.(card.dataset.claseId)
      })
    })

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${_escHTML(err.message)}</p>`
  }
}

// -- Helpers privados ---------------------------------------

function _escHTML(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function _formatHora(hora) {
  if (!hora) return '—'
  return hora.substring(0, 5)
}

function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function _formatFecha(date) {
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}
