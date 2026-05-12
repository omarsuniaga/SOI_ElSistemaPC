import { supabase } from '../../lib/supabaseClient.js'
import { academicService } from '../../modules/academic-routes/services/academicService.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, formatHora, capitalize, formatFechaPortal } from '../utils/portalUtils.js'
import { getMisClases, getHorariosClases, getSesiones, getInscripcionesClases, getSalones } from '../services/maestroDataService.js'

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
  const diaHoy  = hoy.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
  const yH = hoy.getFullYear()
  const mH = String(hoy.getMonth() + 1).padStart(2, '0')
  const dH = String(hoy.getDate()).padStart(2, '0')
  const fechaHoy = `${yH}-${mH}-${dH}`

  try {
    // 1. Obtener clases del maestro (con cache)
    const misClases = await getMisClases()
    if (!misClases || misClases.length === 0) {
      container.innerHTML = `<p class="pm-empty">No tenés clases asignadas.</p>`
      return
    }

    const claseIds = misClases.map(c => c.id)
    const clasesMap = Object.fromEntries(misClases.map(c => [c.id, c]))

    // 2. Obtener horarios de hoy para esas clases (con cache)
    const todosHorarios = await getHorariosClases(claseIds)
    const horarios = todosHorarios
      .filter(h => h.dia?.toLowerCase() === diaHoy)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))

    if (!horarios || horarios.length === 0) {
      container.innerHTML = `
        <h2 class="pm-date-header">${capitalize(diaHoy)} ${formatFechaPortal(hoy)}</h2>
        <p class="pm-empty">No tenés clases hoy.</p>
      `
      return
    }

    // 3. Obtener sesiones de hoy (con cache)
    const todasSesiones = await getSesiones(maestro.id, fechaHoy, fechaHoy)
    const sesionesHoy = todasSesiones.filter(s => claseIds.includes(s.clase_id))

    // Filtrar en JS: sesión registrada si borrador === false, O si tiene
    // asistencia y borrador NO es explícitamente true (legacy data sin campo borrador).
    const sesionesRegistradas = sesionesHoy.filter(s =>
      s.borrador === false || (s.borrador !== true && Array.isArray(s.asistencia) && s.asistencia.length > 0)
    )

    const registradasHoy = new Set(sesionesRegistradas.map(s => s.clase_id))

    // 4. Obtener cantidad de alumnos por clase (con cache)
    const inscripciones = await getInscripcionesClases(claseIds)
    const alumnosPorClase = {}
    for (const insc of (inscripciones || [])) {
      if (insc.clase_id) {
        alumnosPorClase[insc.clase_id] = (alumnosPorClase[insc.clase_id] || 0) + 1
      }
    }

    // 5. Obtener salones (con cache)
    const salonIds = [...new Set(horarios.map(h => h.salon_id).filter(Boolean))]
    const salonesData = salonIds.length > 0 ? await getSalones(salonIds) : []
    const salonMap = Object.fromEntries(salonesData.map(s => [s.id, s.nombre]))

    // 6. Renderizar
    const listHTML = horarios.map(h => {
      const clase        = clasesMap[h.clase_id]
      const registrada   = registradasHoy.has(clase.id)
      const totalAlumnos = alumnosPorClase[clase.id] || 0
      const estadoClass  = registrada ? 'registrada' : 'sin-registrar'
      const badgeHTML    = registrada
        ? `<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`
        : `<span class="pm-badge pm-badge-danger">Sin registrar</span>`

      return `
        <div class="pm-clase-card ${estadoClass}" data-clase-id="${clase.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="pm-clase-nombre">${escHTML(clase.nombre)}</div>
            ${badgeHTML}
          </div>
          <div class="pm-clase-meta">
            <div class="meta-item"><i class="bi bi-clock"></i> ${formatHora(h.hora_inicio)} – ${formatHora(h.hora_fin)}</div>
            <div class="meta-item"><i class="bi bi-music-note-beamed"></i> ${escHTML(clase.instrumento || '—')}</div>
            <div class="meta-item"><i class="bi bi-people"></i> ${totalAlumnos} alumnos</div>
            ${h.salon_id ? `<div class="meta-item"><i class="bi bi-geo-alt"></i> ${escHTML(salonMap[h.salon_id] || 'Salón')}</div>` : ''}
          </div>
        </div>
      `
    }).join('')

    container.innerHTML = `
      <div style="padding: 1rem 1rem 2rem;">
        <h2 class="pm-date-header">${capitalize(diaHoy)} ${formatFechaPortal(hoy)}</h2>
        <div class="pm-clases-container">
          ${listHTML}
        </div>
      </div>
    `

    // 6. Eventos de click en cada clase
    container.querySelectorAll('.pm-clase-card').forEach(card => {
      card.addEventListener('click', async () => {
        // Prevent double-click while loading
        if (card.classList.contains('pm-card-loading')) return
        card.classList.add('pm-card-loading')

        const claseId = card.dataset.claseId

        try {
          // Generar snapshot de planificación antes de entrar
          await academicService.createSnapshotFromPlan(claseId, fechaHoy, maestro.id)
        } catch (err) {
          console.error('Error generando snapshot:', err)
          // Continuamos aunque falle el snapshot para no bloquear el flujo
        }

        // Reset loading state before navigating so cached view shows normal cards
        card.classList.remove('pm-card-loading')
        onClaseClick?.(claseId)
      })
    })

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${escHTML(err.message)}</p>`
  }
}
