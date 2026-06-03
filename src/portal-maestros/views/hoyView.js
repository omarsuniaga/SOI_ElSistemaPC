import { supabase } from '../../lib/supabaseClient.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { academicService } from '../../modules/academic-routes/services/academicService.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, formatHora, capitalize, formatFechaPortal } from '../utils/portalUtils.js'
import {
  getMisClases,
  getHorariosClases,
  getSesiones,
  getInscripcionesClases,
  getSalones,
  getEmergentesHoy,
} from '../services/maestroDataService.js'

// ─── Detección de clase en curso ───────────────────────────────

/**
 * Convierte "HH:MM" o "HH:MM:SS" a minutos desde medianoche.
 * @param {string} t
 * @returns {number}
 */
function _toMin(t) {
  const [h, m] = (t || '00:00').split(':').map(Number)
  return h * 60 + m
}

/**
 * Determina el estado temporal de una clase respecto a la hora actual.
 * @param {string} horaInicio  - "HH:MM"
 * @param {string} horaFin     - "HH:MM"
 * @param {number} ahoraMin    - minutos actuales desde medianoche
 * @returns {'en-curso' | 'proxima' | 'pasada' | 'futura'}
 */
function _estadoTemporal(horaInicio, horaFin, ahoraMin) {
  const inicio = _toMin(horaInicio)
  const fin    = _toMin(horaFin)
  if (ahoraMin >= inicio && ahoraMin < fin)   return 'en-curso'
  if (ahoraMin >= fin)                         return 'pasada'
  if (inicio - ahoraMin <= 15)                 return 'proxima'  // próximos 15 min
  return 'futura'
}

/**
 * Muestra un countdown de 3 s y luego navega a la clase en curso.
 * El maestro puede cancelarlo tocando el banner.
 * @param {string} claseId
 * @param {string} fechaHoy
 * @param {Function} onClaseClick
 */
function _autoNavigateClaseEnCurso(claseId, fechaHoy, onClaseClick) {
  // Crear banner de countdown
  const banner = document.createElement('div')
  banner.id = 'pm-hoy-autonav-banner'
  banner.innerHTML = `
    <div class="pm-autonav-content">
      <i class="bi bi-play-circle-fill pm-autonav-icon"></i>
      <span class="pm-autonav-msg">Abriendo clase en curso…</span>
      <span class="pm-autonav-count" id="pm-autonav-count">3</span>
      <button class="pm-autonav-cancel" id="pm-autonav-cancel">Cancelar</button>
    </div>
  `
  document.body.appendChild(banner)

  let segundos = 3
  let cancelado = false

  const countEl = document.getElementById('pm-autonav-count')

  const tick = setInterval(() => {
    if (cancelado) return
    segundos--
    if (countEl) countEl.textContent = segundos
    if (segundos <= 0) {
      clearInterval(tick)
      banner.remove()
      if (!cancelado) {
        // Generar snapshot y navegar (mismo flujo que el click manual)
        if (window.router) window.router.navigate(`asistencia?clase=${claseId}&fecha=${fechaHoy}`)
        else onClaseClick?.(claseId)
      }
    }
  }, 1000)

  document.getElementById('pm-autonav-cancel')?.addEventListener('click', () => {
    cancelado = true
    clearInterval(tick)
    banner.remove()
    AppToast.show('Auto-navegación cancelada', 'info')
  })
}

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

  const hoy = new Date()
  const diaHoy = hoy.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
  const yH = hoy.getFullYear()
  const mH = String(hoy.getMonth() + 1).padStart(2, '0')
  const dH = String(hoy.getDate()).padStart(2, '0')
  const fechaHoy = `${yH}-${mH}-${dH}`

  try {
    // 0. Verificar si hay clases emergentes hoy — reemplazan lo programado
    const emergentesHoy = await getEmergentesHoy(maestro.id, fechaHoy)
    if (emergentesHoy && emergentesHoy.length > 0) {
      container.innerHTML = _renderEmergentes(emergentesHoy, diaHoy, hoy)
      _bindEmergenteClicks(container, fechaHoy, maestro.id)
      return
    }

    // 1. Obtener clases del maestro (con cache)
    const misClases = await getMisClases()
    if (!misClases || misClases.length === 0) {
      container.innerHTML = `<p class="pm-empty">No tienes clases asignadas.</p>`
      return
    }

    const claseIds = misClases.map((c) => c.id)
    const clasesMap = Object.fromEntries(misClases.map((c) => [c.id, c]))

    // 2. Obtener horarios de hoy para esas clases (con cache)
    const todosHorarios = await getHorariosClases(claseIds)
    const horarios = todosHorarios
      .filter((h) => h.dia?.toLowerCase() === diaHoy)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))

    if (!horarios || horarios.length === 0) {
      container.innerHTML = `
        <h2 class="pm-date-header">${capitalize(diaHoy)} ${formatFechaPortal(hoy)}</h2>
        <p class="pm-empty">No tienes clases hoy.</p>
      `
      return
    }

    // 3a. Obtener sesiones pendientes de los últimos 3 días (excluye hoy)
    const hace3Dias = new Date(hoy)
    hace3Dias.setDate(hace3Dias.getDate() - 3)
    const desde3d = `${hace3Dias.getFullYear()}-${String(hace3Dias.getMonth() + 1).padStart(2, '0')}-${String(hace3Dias.getDate()).padStart(2, '0')}`
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)
    const ayerStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`

    const sesionesRecientes = await getSesiones(maestro.id, desde3d, ayerStr)
    const pendientesRecientes = (sesionesRecientes || []).filter((s) => {
      if (!claseIds.includes(s.clase_id)) return false
      const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
      const tieneContenido = typeof s.contenido === 'string' && s.contenido.trim().length > 0
      return !tieneAsistencia && !(s.borrador === false && tieneContenido)
    })

    // 3. Obtener sesiones de hoy (con cache)
    const todasSesiones = await getSesiones(maestro.id, fechaHoy, fechaHoy)
    const sesionesHoy = todasSesiones.filter((s) => claseIds.includes(s.clase_id))

    // Sesión se considera registrada si tiene datos reales, no solo el flag borrador.
    // Esto cubre el race condition que dejaba borrador=true en sesiones correctamente guardadas.
    const sesionesRegistradas = sesionesHoy.filter((s) => {
      const tieneAsistencia = Array.isArray(s.asistencia) && s.asistencia.length > 0
      const tieneContenido = typeof s.contenido === 'string' && s.contenido.trim().length > 0
      // Registrada: tiene asistencia marcada, O fue guardada (borrador=false) con contenido
      return tieneAsistencia || (s.borrador === false && tieneContenido)
    })

    const registradasHoy = new Set(sesionesRegistradas.map((s) => s.clase_id))

    // 4. Obtener cantidad de alumnos por clase (con cache)
    const inscripciones = await getInscripcionesClases(claseIds)
    const alumnosPorClase = {}
    for (const insc of inscripciones || []) {
      if (insc.clase_id) {
        alumnosPorClase[insc.clase_id] = (alumnosPorClase[insc.clase_id] || 0) + 1
      }
    }

    // 5. Obtener salones (con cache)
    const salonIds = [...new Set(horarios.map((h) => h.salon_id).filter(Boolean))]
    const salonesData = salonIds.length > 0 ? await getSalones(salonIds) : []
    const salonMap = Object.fromEntries(salonesData.map((s) => [s.id, s.nombre]))

    // 6. Calcular hora actual en minutos para detectar clases en curso
    const ahoraMin = hoy.getHours() * 60 + hoy.getMinutes()
    let claseEnCursoId = null   // primera clase en curso no registrada → auto-nav
    let claseEnCursoRegistradaId = null  // en curso pero ya registrada → solo badge

    // 6. Renderizar
    const listHTML = horarios
      .map((h) => {
        const clase = clasesMap[h.clase_id]
        const registrada = registradasHoy.has(clase.id)
        const totalAlumnos = alumnosPorClase[clase.id] || 0
        const temporal = _estadoTemporal(h.hora_inicio, h.hora_fin, ahoraMin)

        // Rastrear clase en curso
        if (temporal === 'en-curso') {
          if (!registrada && !claseEnCursoId)          claseEnCursoId = clase.id
          if (registrada && !claseEnCursoRegistradaId) claseEnCursoRegistradaId = clase.id
        }

        // Badge de registro
        const registradaBadge = registrada
          ? `<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`
          : `<span class="pm-badge pm-badge-danger">Sin registrar</span>`

        // Badge de estado temporal
        const temporalBadge = temporal === 'en-curso'
          ? `<span class="pm-badge pm-badge-en-curso"><i class="bi bi-circle-fill pm-pulse-dot me-1"></i>En curso</span>`
          : temporal === 'proxima'
            ? `<span class="pm-badge pm-badge-proxima"><i class="bi bi-clock me-1"></i>Próximamente</span>`
            : ''

        const estadoClass = [
          registrada ? 'registrada' : 'sin-registrar',
          temporal === 'en-curso' ? 'pm-clase-en-curso' : '',
          temporal === 'proxima'  ? 'pm-clase-proxima'  : '',
          temporal === 'pasada'   ? 'pm-clase-pasada'   : '',
        ].filter(Boolean).join(' ')

        return `
        <div class="pm-clase-card ${estadoClass}" data-clase-id="${clase.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="pm-clase-nombre">${escHTML(clase.nombre)}</div>
            <div class="d-flex flex-wrap gap-1 justify-content-end">
              ${temporalBadge}
              ${registradaBadge}
            </div>
          </div>
          <div class="pm-clase-meta">
            <div class="meta-item"><i class="bi bi-clock"></i> ${formatHora(h.hora_inicio)} – ${formatHora(h.hora_fin)}</div>
            <div class="meta-item"><i class="bi bi-music-note-beamed"></i> ${escHTML(clase.instrumento || '—')}</div>
            <div class="meta-item"><i class="bi bi-people"></i> ${totalAlumnos} alumnos</div>
            ${h.salon_id ? `<div class="meta-item"><i class="bi bi-geo-alt"></i> ${escHTML(salonMap[h.salon_id] || 'Salón')}</div>` : ''}
          </div>
        </div>
      `
      })
      .join('')

    // Banner de pendientes recientes
    const pendientesHTML =
      pendientesRecientes.length > 0
        ? `
      <div class="pm-pendientes-banner">
        <div class="pm-pendientes-header">
          <i class="bi bi-clipboard-x-fill"></i>
          <span>${
            pendientesRecientes.length === 1
              ? '1 clase sin registrar de los últimos días'
              : `${pendientesRecientes.length} clases sin registrar de los últimos días`
          }</span>
        </div>
        <div class="pm-pendientes-list">
          ${pendientesRecientes
            .map((s) => {
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
            })
            .join('')}
        </div>
      </div>`
        : ''

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
    container.querySelectorAll('.pm-pendiente-item').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const claseId = btn.dataset.claseId
        const fecha = btn.dataset.fecha
        try {
          await academicService.createSnapshotFromPlan(claseId, fecha, maestro.id)
        } catch (_) {
          /* no bloqueamos */
        }
        if (window.router) window.router.navigate(`asistencia?clase=${claseId}&fecha=${fecha}`)
      })
    })

    // 6. Eventos de click en cada clase
    container.querySelectorAll('.pm-clase-card').forEach((card) => {
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
    // 7. Scroll a clase en curso + auto-navegación si no está registrada
    const enCursoId = claseEnCursoId || claseEnCursoRegistradaId
    if (enCursoId) {
      // Scroll suave a la tarjeta activa
      requestAnimationFrame(() => {
        const card = container.querySelector(`[data-clase-id="${enCursoId}"]`)
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })

      // Auto-navegar solo si la clase está en curso Y no registrada
      if (claseEnCursoId) {
        // Pequeño delay para que el maestro vea la vista antes del countdown
        setTimeout(() => {
          _autoNavigateClaseEnCurso(claseEnCursoId, fechaHoy, onClaseClick)
        }, 800)
      }
    }

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${escHTML(err.message)}</p>`
  }
}

// ─── Render de clases emergentes ────────────────────────────────

/**
 * Renderiza las tarjetas de clases emergentes en lugar de las programadas.
 * @param {Array} emergentes  - Lista de registros de clases_emergentes
 * @param {string} diaHoy     - Día de la semana en lowercase
 * @param {Date} hoy          - Fecha actual
 * @returns {string} HTML
 */
function _renderEmergentes(emergentes, diaHoy, hoy) {
  const listHTML = emergentes
    .map((eme) => {
      const horaInicio = eme.hora_inicio ? eme.hora_inicio.slice(0, 5) : '—'
      const horaFin = eme.hora_fin ? eme.hora_fin.slice(0, 5) : '—'
      const horario = `${horaInicio} – ${horaFin}`
      const motivoText = eme.motivo || ''
      const contenido = eme.contenido || eme.observaciones || ''
      const motivoClass = _motivoClass(eme.motivo)

      return `
      <div class="pm-clase-card pm-emergente-card" data-eme-id="${eme.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="pm-clase-nombre">${escHTML(eme.nombre_clase)}</div>
          <span class="pm-badge pm-badge-warning">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>Emergente
          </span>
        </div>
        ${motivoText ? `<div class="pm-eme-motivo ${motivoClass}">${escHTML(motivoText)}</div>` : ''}
        <div class="pm-clase-meta">
          <div class="meta-item"><i class="bi bi-clock"></i> ${horario}</div>
          ${contenido ? `<div class="meta-item"><i class="bi bi-chat-text"></i> ${escHTML(contenido)}</div>` : ''}
        </div>
      </div>
    `
    })
    .join('')

  return `
    <div style="padding: 1rem 1rem 2rem;">
      <h2 class="pm-date-header">${capitalize(diaHoy)} ${formatFechaPortal(hoy)}</h2>
      <p class="pm-eme-subtitle">
        <i class="bi bi-exclamation-triangle-fill"></i>
        Clase emergente registrada — reemplaza tus clases programadas de hoy
      </p>
      <div class="pm-clases-container">
        ${listHTML}
      </div>
    </div>
  `
}

function _motivoClass(motivo) {
  const map = {
    suplencia: 'pm-eme-motivo-suplencia',
    eventual: 'pm-eme-motivo-eventual',
    reforzamiento: 'pm-eme-motivo-reforzamiento',
    otro: 'pm-eme-motivo-otro',
  }
  return map[motivo] || 'pm-eme-motivo-otro'
}

function _bindEmergenteClicks(container, fechaHoy, maestroId) {
  container.querySelectorAll('.pm-emergente-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('pm-card-loading')) return
      card.classList.add('pm-card-loading')
      if (window.router) {
        window.router.navigate(`clase-emergente?fecha=${fechaHoy}`)
      }
      card.classList.remove('pm-card-loading')
    })
  })
}

// ─── Estilos pendientes recientes ─────────────────────────────
if (!document.getElementById('pm-hoy-pendientes-styles')) {
  const s = document.createElement('style')
  s.id = 'pm-hoy-pendientes-styles'

  // Emergente badge reutiliza badge existente, solo agregamos warning si no existe
  if (!document.getElementById('pm-badge-warning-style')) {
    const bw = document.createElement('style')
    bw.id = 'pm-badge-warning-style'
    bw.textContent = `
        .pm-badge-warning {
          background: rgba(245,158,11,0.15);
          color: #d97706;
          border: 1px solid rgba(245,158,11,0.3);
        }
      `
    document.head.appendChild(bw)
  }
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

    /* ── Emergente card ──────────────────────────── */
    .pm-emergente-card {
      border: 2px solid rgba(245,158,11,0.4) !important;
      background: linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%) !important;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .pm-emergente-card:hover {
      border-color: rgba(245,158,11,0.7) !important;
      box-shadow: 0 2px 12px rgba(245,158,11,0.15);
    }
    .pm-eme-subtitle {
      font-size: 0.82rem;
      color: #d97706;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .pm-eme-motivo {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      display: inline-block;
    }
    .pm-eme-motivo-suplencia     { background: rgba(59,130,246,0.1); color: #2563eb; }
    .pm-eme-motivo-eventual      { background: rgba(139,92,246,0.1); color: #7c3aed; }
    .pm-eme-motivo-reforzamiento { background: rgba(16,185,129,0.1); color: #059669; }
    .pm-eme-motivo-otro          { background: rgba(245,158,11,0.1); color: #d97706; }

    /* ── Estado temporal de clases ──────────────────── */
    .pm-clase-en-curso {
      border: 2px solid var(--pm-primary, #3b82f6) !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
      position: relative;
    }
    .pm-clase-proxima {
      border-left: 3px solid var(--pm-warning, #f59e0b) !important;
    }
    .pm-clase-pasada {
      opacity: 0.55;
    }

    /* Badge en curso */
    .pm-badge-en-curso {
      background: rgba(59,130,246,0.15);
      color: var(--pm-primary, #3b82f6);
      border: 1px solid rgba(59,130,246,0.35);
    }
    .pm-badge-proxima {
      background: rgba(245,158,11,0.12);
      color: #d97706;
      border: 1px solid rgba(245,158,11,0.3);
    }

    /* Punto pulsante dentro del badge "En curso" */
    .pm-pulse-dot {
      font-size: 0.5rem;
      animation: pm-pulse 1.2s ease-in-out infinite;
    }
    @keyframes pm-pulse {
      0%, 100% { opacity: 1; transform: scale(1);   }
      50%       { opacity: 0.4; transform: scale(0.75); }
    }

    /* ── Banner de auto-navegación ──────────────────── */
    #pm-hoy-autonav-banner {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-primary, #3b82f6);
      border-radius: 16px;
      padding: 0.75rem 1.25rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      z-index: 9000;
      animation: pm-slide-up 0.3s ease;
      min-width: 280px;
      max-width: 90vw;
    }
    @keyframes pm-slide-up {
      from { opacity: 0; transform: translateX(-50%) translateY(16px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .pm-autonav-content {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .pm-autonav-icon {
      font-size: 1.2rem;
      color: var(--pm-primary, #3b82f6);
      flex-shrink: 0;
    }
    .pm-autonav-msg {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text);
    }
    .pm-autonav-count {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--pm-primary, #3b82f6);
      min-width: 1.2rem;
      text-align: center;
    }
    .pm-autonav-cancel {
      background: none;
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pm-text-muted);
      cursor: pointer;
      flex-shrink: 0;
    }
    .pm-autonav-cancel:hover {
      background: var(--pm-surface-2);
      color: var(--pm-text);
    }
  `
  document.head.appendChild(s)
}
