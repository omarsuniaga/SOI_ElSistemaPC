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

    // 3a. Obtener sesiones pendientes de los últimos 3 días (excluye hoy)
    const hace3Dias = new Date(hoy)
    hace3Dias.setDate(hace3Dias.getDate() - 3)
    const desde3d = `${hace3Dias.getFullYear()}-${String(hace3Dias.getMonth()+1).padStart(2,'0')}-${String(hace3Dias.getDate()).padStart(2,'0')}`
    const ayer    = new Date(hoy); ayer.setDate(ayer.getDate() - 1)
    const ayerStr = `${ayer.getFullYear()}-${String(ayer.getMonth()+1).padStart(2,'0')}-${String(ayer.getDate()).padStart(2,'0')}`

    const sesionesRecientes = await getSesiones(maestro.id, desde3d, ayerStr)
    const pendientesRecientes = (sesionesRecientes || []).filter(s => {
      if (!claseIds.includes(s.clase_id)) return false
      const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
      const tieneContenido  = typeof s.contenido === 'string' && s.contenido.trim().length > 0
      return !tieneAsistencia && !(s.borrador === false && tieneContenido)
    })

    // 3. Obtener sesiones de hoy (con cache)
    const todasSesiones = await getSesiones(maestro.id, fechaHoy, fechaHoy)
    const sesionesHoy = todasSesiones.filter(s => claseIds.includes(s.clase_id))

    // Sesión se considera registrada si tiene datos reales, no solo el flag borrador.
    // Esto cubre el race condition que dejaba borrador=true en sesiones correctamente guardadas.
    const sesionesRegistradas = sesionesHoy.filter(s => {
      const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
      const tieneContenido  = typeof s.contenido === 'string' && s.contenido.trim().length > 0
      // Registrada: tiene asistencia marcada, O fue guardada (borrador=false) con contenido
      return tieneAsistencia || (s.borrador === false && tieneContenido)
    })

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

    // Banner de pendientes recientes
    const pendientesHTML = pendientesRecientes.length > 0 ? `
      <div class="pm-pendientes-banner">
        <div class="pm-pendientes-header">
          <i class="bi bi-clipboard-x-fill"></i>
          <span>${pendientesRecientes.length === 1
            ? '1 clase sin registrar de los últimos días'
            : `${pendientesRecientes.length} clases sin registrar de los últimos días`
          }</span>
        </div>
        <div class="pm-pendientes-list">
          ${pendientesRecientes.map(s => {
            const clase = clasesMap[s.clase_id]
            if (!clase) return ''
            const fechaCorta = s.fecha ? s.fecha.split('-').reverse().slice(0, 2).join('/') : '—'
            return `
              <button class="pm-pendiente-item" data-clase-id="${clase.id}" data-fecha="${s.fecha}">
                <div class="pm-pendiente-info">
                  <span class="pm-pendiente-nombre">${escHTML(clase.nombre)}</span>
                  <span class="pm-pendiente-fecha">${fechaCorta}</span>
                </div>
                <span class="pm-pendiente-cta">Registrar <i class="bi bi-arrow-right"></i></span>
              </button>`
          }).join('')}
        </div>
      </div>` : ''

    container.innerHTML = `
      <div style="padding: 1rem 1rem 2rem;">
        <h2 class="pm-date-header">${capitalize(diaHoy)} ${formatFechaPortal(hoy)}</h2>
        ${pendientesHTML}
        <div class="pm-clases-container">
          ${listHTML}
        </div>
      </div>
    `

    // Clicks en pendientes recientes
    container.querySelectorAll('.pm-pendiente-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        const claseId = btn.dataset.claseId
        const fecha   = btn.dataset.fecha
        try {
          await academicService.createSnapshotFromPlan(claseId, fecha, maestro.id)
        } catch (_) { /* no bloqueamos */ }
        if (window.router) window.router.navigate(`asistencia?clase=${claseId}&fecha=${fecha}`)
      })
    })

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

// ─── Estilos pendientes recientes ─────────────────────────────
if (!document.getElementById('pm-hoy-pendientes-styles')) {
  const s = document.createElement('style')
  s.id = 'pm-hoy-pendientes-styles'
  s.textContent = `
    .pm-pendientes-banner {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }
    .pm-pendientes-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--pm-danger, #ef4444);
      margin-bottom: 0.6rem;
    }
    .pm-pendientes-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .pm-pendiente-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface);
      border: 1px solid rgba(239,68,68,0.15);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: background 0.15s, border-color 0.15s;
      gap: 0.5rem;
    }
    .pm-pendiente-item:hover {
      background: rgba(239,68,68,0.06);
      border-color: rgba(239,68,68,0.35);
    }
    .pm-pendiente-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .pm-pendiente-nombre {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text);
    }
    .pm-pendiente-fecha {
      font-size: 0.72rem;
      color: var(--pm-text-muted);
    }
    .pm-pendiente-cta {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pm-danger, #ef4444);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  `
  document.head.appendChild(s)
}
