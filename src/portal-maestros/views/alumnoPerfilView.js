import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'

async function _renderEvaluaciones(container, alumnoId) {
  const root = container.querySelector('#pm-alumno-progreso-root')
  if (!root) return

  try {
    const { data: evaluaciones, error } = await supabase
      .from('indicator_attempts')
      .select('id, nota, observations, tarea, created_at, indicators!inner(id, nombre, description, nodes!inner(id, name))')
      .eq('student_id', alumnoId)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!evaluaciones || evaluaciones.length === 0) {
      root.innerHTML = `<p class="pm-empty">Sin evaluaciones registradas.</p>`
      return
    }

    // Agrupar por indicador
    const byIndicator = new Map()
    for (const ev of evaluaciones) {
      const ind = ev.indicators
      if (!byIndicator.has(ind.id)) {
        byIndicator.set(ind.id, {
          id: ind.id,
          nombre: ind.nombre,
          nodeName: ind.nodes?.name || '',
          latest: ev,
          history: []
        })
      }
      byIndicator.get(ind.id).history.push(ev)
    }

    const indicators = Array.from(byIndicator.values())
    const aprobados = indicators.filter(i => i.latest.nota >= 4).length
    const avance = Math.round((aprobados / indicators.length) * 100)

    function semaforo(nota) {
      if (nota === null || nota === undefined) return '⚫'
      if (nota >= 4) return '🟢'
      if (nota >= 2) return '🟡'
      return '🔴'
    }

    function semaforoClass(nota) {
      if (nota === null || nota === undefined) return 'pm-route-indicador--gray'
      if (nota >= 4) return 'pm-route-indicador--green'
      if (nota >= 2) return 'pm-route-indicador--yellow'
      return 'pm-route-indicador--red'
    }

    root.innerHTML = `
      <div class="pm-student-panel__progress-bar" style="margin-bottom:0.75rem;">
        <div class="pm-student-panel__progress-fill" style="width:${avance}%"></div>
      </div>
      <p style="font-size:0.85rem;color:var(--pm-text-muted);margin-bottom:1rem;">
        🎯 Progreso Académico — <strong>${avance}% avance</strong>
        (${aprobados}/${indicators.length} indicadores aprobados)
      </p>
      <div class="pm-eval-indicadores">
        ${indicators.map(ind => `
          <div class="pm-eval-indicador ${semaforoClass(ind.latest.nota)}" data-ind-id="${ind.id}">
            <div class="pm-eval-indicador-header">
              <span class="pm-eval-semaforo">${semaforo(ind.latest.nota)}</span>
              <span class="pm-eval-nombre">${escHTML(ind.nombre)}</span>
              <span class="pm-eval-node" style="font-size:0.75rem;color:var(--pm-text-muted);margin-left:auto;">${escHTML(ind.nodeName)}</span>
              <span class="pm-eval-nota" style="font-weight:700;margin-left:0.5rem;">${ind.latest.nota ?? '—'}</span>
              <i class="bi bi-chevron-down pm-eval-toggle" style="margin-left:0.5rem;font-size:0.8rem;"></i>
            </div>
            <div class="pm-eval-timeline" style="display:none;">
              ${ind.history.map(ev => `
                <div class="pm-eval-entry" style="padding:0.5rem 0;border-bottom:1px solid var(--pm-border,#eee);">
                  <span style="font-size:0.8rem;color:var(--pm-text-muted);">
                    ${new Date(ev.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <strong style="margin-left:0.5rem;">${semaforo(ev.nota)} ${ev.nota ?? '—'}</strong>
                  ${ev.observations ? `<p style="margin:0.25rem 0 0;font-size:0.8rem;">${escHTML(ev.observations)}</p>` : ''}
                  ${ev.tarea ? `<p style="margin:0.2rem 0 0;font-size:0.75rem;color:var(--pm-text-muted);">Tarea: ${escHTML(ev.tarea)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `

    // Toggle de timeline por indicador
    root.querySelectorAll('.pm-eval-indicador').forEach(el => {
      el.addEventListener('click', () => {
        const timeline = el.querySelector('.pm-eval-timeline')
        const icon = el.querySelector('.pm-eval-toggle')
        const open = timeline.style.display !== 'none'
        timeline.style.display = open ? 'none' : 'block'
        icon.classList.toggle('bi-chevron-down', open)
        icon.classList.toggle('bi-chevron-up', !open)
      })
    })
  } catch (err) {
    const root2 = container.querySelector('#pm-alumno-progreso-root')
    if (root2) root2.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger);">Error al cargar evaluaciones: ${escHTML(err.message)}</p>`
  }
}

export async function renderAlumnoPerfilView(container, { alumnoId }) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  if (!alumnoId) {
    container.innerHTML = `<p class="pm-empty">No se especificó el alumno.</p>`
    return
  }

  try {
    // Obtener datos del alumno
    const { data: alumno } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, instrumento_principal, email, telefono, fecha_nacimiento')
      .eq('id', alumnoId)
      .single()

    if (!alumno) {
      container.innerHTML = `<p class="pm-empty">Alumno no encontrado.</p>`
      return
    }

    // Obtener clases del alumno
    const { data: inscripciones } = await supabase
      .from('alumnos_clases')
      .select('clase:clases(id, nombre, instrumento)')
      .eq('alumno_id', alumnoId)
      .eq('activo', true)

    // Obtener sesiones del alumno (últimas 20)
    const { data: sesiones } = await supabase
      .from('sesiones_clase')
      .select('id, clase_id, fecha, contenido_dsl, asistencia')
      .contains('asistencia', [{ alumno_id: alumnoId }])
      .order('fecha', { ascending: false })
      .limit(20)

    // Calcular estadísticas
    const totalSesiones = sesiones?.length || 0
    const asistenciaData = sesiones?.map(s => {
      const reg = s.asistencia?.find(a => a.alumno_id === alumnoId)
      return reg?.estado || null
    }) || []
    const presentes = asistenciaData.filter(a => a === 'P').length
    const ausentes = asistenciaData.filter(a => a === 'A').length
    const justifica = asistenciaData.filter(a => a === 'J').length
    const pctAsistencia = totalSesiones > 0 ? Math.round((presentes / totalSesiones) * 100) : 0

    // Parsear menciones DSL del aluno
    const menciones = []
    ;(sesiones || []).forEach(s => {
      if (s.contenido_dsl?.includes(`#${alumno.nombre_completo.split(' ')[0].toLowerCase()}`)) {
        menciones.push({
          fecha: s.fecha,
          contenido: s.contenido_dsl
        })
      }
    })

    container.innerHTML = `
      <div class="pm-alumno-root">
        <button id="pm-alumno-back" class="pm-icon-btn" title="Volver" style="margin-bottom:1rem;">
          <i class="bi bi-arrow-left"></i>
        </button>

        <!-- Header del alumno -->
        <div class="pm-alumno-header">
          <div class="pm-alumno-avatar">
            ${(alumno.nombre_completo || 'A')[0].toUpperCase()}
          </div>
          <div class="pm-alumno-info">
            <h2 class="pm-alumno-nombre">${escHTML(alumno.nombre_completo)}</h2>
            <p class="pm-alumno-instrumento">${escHTML(alumno.instrumento_principal || 'Sin instrumento')}</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="pm-alumno-stats">
          <div class="pm-alumno-stat">
            <span class="pm-stat-value">${pctAsistencia}%</span>
            <span class="pm-stat-label">Asistencia</span>
          </div>
          <div class="pm-alumno-stat">
            <span class="pm-stat-value">${presentes}</span>
            <span class="pm-stat-label">Presente</span>
          </div>
          <div class="pm-alumno-stat">
            <span class="pm-stat-value">${ausentes}</span>
            <span class="pm-stat-label">Ausente</span>
          </div>
          <div class="pm-alumno-stat">
            <span class="pm-stat-value">${justifica}</span>
            <span class="pm-stat-label">Justif.</span>
          </div>
        </div>

        <!-- Clases -->
        <h3 class="pm-alumno-section-title">Clases inscritas</h3>
        <div class="pm-alumno-clases">
          ${inscripciones?.length ? inscripciones.map(i => `
            <div class="pm-alumno-clase-card">
              <span class="pm-clase-nombre">${escHTML(i.clase?.nombre || 'Clase')}</span>
              <span class="pm-clase-instrumento">${escHTML(i.clase?.instrumento || '')}</span>
            </div>
          `).join('') : '<p class="pm-empty">Sin clases asignadas.</p>'}
        </div>

        <!-- Timeline de sesiones -->
        <h3 class="pm-alumno-section-title">Historial de sesiones</h3>
        <div class="pm-alumno-timeline">
          ${sesiones?.length ? sesiones.map(s => {
            const reg = s.asistencia?.find(a => a.alumno_id === alumnoId)
            const estado = reg?.estado || '—'
            const estadoClass = estado === 'P' ? 'estado-p' : estado === 'A' ? 'estado-a' : estado === 'J' ? 'estado-j' : ''

            // Extraer menciones del aluno en el contenido
            const contenidoLines = (s.contenido_dsl || '').split('\n')
              .filter(l => l.toLowerCase().includes('#' + (alumno.nombre_completo || '').split(' ')[0].toLowerCase()))
              .slice(0, 2)

            return `
              <div class="pm-timeline-item">
                <div class="pm-timeline-date">
                  <span class="pm-date-day">${new Date(s.fecha).getDate()}</span>
                  <span class="pm-date-month">${new Date(s.fecha).toLocaleDateString('es-ES', { month: 'short' })}</span>
                </div>
                <div class="pm-timeline-content">
                  <div class="pm-timeline-header">
                    <span class="pm-timeline-estado ${estadoClass}">${estado}</span>
                  </div>
                  ${contenidoLines.length ? `
                    <div class="pm-timeline-menciones">
                      ${contenidoLines.map(l => `<p>${escHTML(l)}</p>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `
          }).join('') : '<p class="pm-empty">Sin sesiones registradas.</p>'}
        </div>

        <!-- Progreso académico -->
        <h3 class="pm-alumno-section-title">Progreso Académico</h3>
        <div id="pm-alumno-progreso-root">
          <div class="pm-loading"><div class="pm-spinner"></div></div>
        </div>
      </div>
    `

    // Back button
    container.querySelector('#pm-alumno-back').onclick = () => {
      window.history.back()
    }

    // Cargar historial de evaluaciones
    _renderEvaluaciones(container, alumnoId)

  } catch (err) {
    container.innerHTML = `
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;">
        <p style="color:var(--pm-danger);">Error al cargar perfil</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${escHTML(err.message)}</p>
      </div>
    `
  }
}