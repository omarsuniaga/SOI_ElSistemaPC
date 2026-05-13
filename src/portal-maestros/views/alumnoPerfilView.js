import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'

async function _renderEvaluaciones(container, alumnoId) {
  const root = container.querySelector('#pm-alumno-progreso-root')
  if (!root) return

  try {
    // Traer intentos del alumno, sin join a nodes (evita duplicados del inner join)
    const { data: evaluaciones, error } = await supabase
      .from('indicator_attempts')
      .select('id, nota, observations, tarea, created_at, indicator_id')
      .eq('student_id', alumnoId)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!evaluaciones || evaluaciones.length === 0) {
      root.innerHTML = `<p class="pm-empty">Sin evaluaciones registradas.</p>`
      return
    }

    // Obtener info de indicadores una sola vez (sin join multiplicador)
    const indicatorIds = [...new Set(evaluaciones.map(e => e.indicator_id))]
    const { data: indicatorsMeta } = await supabase
      .from('indicators')
      .select('id, nombre, node_id')
      .in('id', indicatorIds)

    // Obtener nombres de nodos
    const nodeIds = [...new Set((indicatorsMeta || []).map(i => i.node_id).filter(Boolean))]
    const { data: nodesMeta } = await supabase
      .from('nodes')
      .select('id, name')
      .in('id', nodeIds)
    const nodeMap = new Map((nodesMeta || []).map(n => [n.id, n.name]))
    const indicatorMap = new Map((indicatorsMeta || []).map(i => [i.id, i]))

    // Agrupar por indicador ID (un solo registro por indicador, el más reciente)
    const byIndicator = new Map()
    for (const ev of evaluaciones) {
      if (byIndicator.has(ev.indicator_id)) continue // ya está el más reciente por orden desc
      const meta = indicatorMap.get(ev.indicator_id)
      byIndicator.set(ev.indicator_id, {
        id: ev.indicator_id,
        nombre: meta?.nombre || '',
        nodeName: nodeMap.get(meta?.node_id) || '',
        latest: ev,
        history: []
      })
    }

    // Agregar intentos restantes al history (sin duplicar el primero)
    for (const ev of evaluaciones) {
      if (byIndicator.has(ev.indicator_id)) {
        const entry = byIndicator.get(ev.indicator_id)
        if (entry.history.length === 0 || entry.history[0].id !== ev.id) {
          entry.history.push(ev)
        }
      }
    }

    const indicators = Array.from(byIndicator.values())
      // Solo mostrar indicadores que tengan nota o una observación
      .filter(i => (i.latest.nota != null && i.latest.nota !== 0) || (i.latest.observations && i.latest.observations.trim() !== ''))
    const aprobados = indicators.filter(i => i.latest.nota >= 4).length
    const totalInd = indicators.length
    const avance = totalInd > 0 ? Math.round((aprobados / totalInd) * 100) : 0

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
    const { data: alumno, error: alumnoError } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, instrumento_principal, tlf_alumno, fecha_nacimiento, created_at, nivel_actual')
      .eq('id', alumnoId)
      .single()

    if (alumnoError || !alumno) {
      console.error('[AlumnoPerfil] Error al obtener alumno:', alumnoError)
      container.innerHTML = `
        <div class="pm-empty" style="padding:3rem 1rem;">
          <i class="bi bi-person-x" style="font-size:3rem;opacity:0.3;"></i>
          <p>Alumno no encontrado o error de acceso.</p>
          <button class="pm-btn pm-btn-secondary" onclick="window.history.back()" style="margin-top:1rem;">Volver</button>
        </div>
      `
      return
    }

    // Obtener clases del alumno con más detalle
    const { data: inscripciones } = await supabase
      .from('alumnos_clases')
      .select('clase:clases(id, nombre, instrumento, nivel)')
      .eq('alumno_id', alumnoId)
      .eq('activo', true)

    // Obtener sesiones del alumno (últimas 50 para estadísticas)
    const { data: sesiones } = await supabase
      .from('sesiones_clase')
      .select('id, clase_id, fecha, contenido_dsl, asistencia')
      .contains('asistencia', [{ alumno_id: alumnoId }])
      .order('fecha', { ascending: false })
      .limit(50)

    // Obtener todas las evaluaciones del alumno
    const { data: evaluaciones } = await supabase
      .from('indicator_attempts')
      .select('id, nota, observations, tarea, created_at, indicator_id')
      .eq('student_id', alumnoId)
      .order('created_at', { ascending: false })
      .limit(30)

    // Obtener ausencias del alumno
    const { data: ausencias } = await supabase
      .from('ausencias')
      .select('id, fecha_inicio, fecha_fin, motivo, estado, clase_id')
      .eq('alumno_id', alumnoId)
      .order('fecha_inicio', { ascending: false })
      .limit(10)

    // Calcular estadísticas de asistencia
    const totalSesiones = sesiones?.length || 0
    const asistenciaData = sesiones?.map(s => {
      const reg = s.asistencia?.find(a => a.alumno_id === alumnoId)
      return reg?.estado || null
    }) || []
    const presentes = asistenciaData.filter(a => a === 'P').length
    const ausentes = asistenciaData.filter(a => a === 'A').length
    const justifica = asistenciaData.filter(a => a === 'J').length
    const tardanzas = asistenciaData.filter(a => a === 'T').length
    const pctAsistencia = totalSesiones > 0 ? Math.round((presentes / totalSesiones) * 100) : 0

    // Calcular estadísticas de rendimiento (notas)
    const notasValidas = evaluaciones?.filter(e => e.nota != null && e.nota !== 0) || []
    const promedioNotas = notasValidas.length > 0 
      ? Math.round(notasValidas.reduce((sum, e) => sum + e.nota, 0) / notasValidas.length * 10) / 10
      : 0
    const indicadoresAprobados = notasValidas.filter(e => e.nota >= 4).length
    const indicadoresTotales = notasValidas.length
    const pctAprobacion = indicadoresTotales > 0 ? Math.round((indicadoresAprobados / indicadoresTotales) * 100) : 0

    // Agrupar sesiones por clase para estadísticas por materia
    const sesionesPorClase = {}
    sesiones?.forEach(s => {
      if (!sesionesPorClase[s.clase_id]) sesionesPorClase[s.clase_id] = { P: 0, A: 0, J: 0, T: 0, total: 0 }
      const reg = s.asistencia?.find(a => a.alumno_id === alumnoId)
      if (reg?.estado) {
        sesionesPorClase[s.clase_id][reg.estado]++
        sesionesPorClase[s.clase_id].total++
      }
    })

    // Obtener nombres de las clases
    const claseIds = Object.keys(sesionesPorClase)
    const { data: clasesInfo } = await supabase
      .from('clases')
      .select('id, nombre, instrumento')
      .in('id', claseIds)
    const claseMap = new Map((clasesInfo || []).map(c => [c.id, c]))

    // Calcular edad
    let edad = '—'
    if (alumno.fecha_nacimiento) {
      const birth = new Date(alumno.fecha_nacimiento)
      const now = new Date()
      edad = now.getFullYear() - birth.getFullYear()
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        edad--
      }
    }

    // Formatear fecha ingreso
    const fechaIngreso = alumno.created_at 
      ? new Date(alumno.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      : 'Reciente'

    // Determinar color de acento según instrumento
    const inst = (alumno.instrumento_principal || '').toLowerCase()
    let accentColor = 'var(--pm-primary)'
    if (inst.includes('violin') || inst.includes('cuerda')) accentColor = '#FF3B30' // Rojo Apple
    if (inst.includes('piano') || inst.includes('teclado')) accentColor = '#FF9500' // Ámbar Apple
    if (inst.includes('guitarra')) accentColor = '#5856D6' // Indigo Apple
    if (inst.includes('canto') || inst.includes('voz')) accentColor = '#AF52DE' // Púrpura Apple

    container.innerHTML = `
      <div class="pm-alumno-zen pm-animate-fade-in">
        <!-- Hero Section -->
        <div class="pm-zen-hero" style="--accent-gradient: ${accentColor}">
          <div class="pm-zen-hero__overlay"></div>
          <header class="pm-zen-header">
            <button id="pm-alumno-back" class="pm-zen-back">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="pm-zen-header-tag">Perfil Académico</span>
          </header>
          
          <div class="pm-zen-hero__content">
            <div class="pm-zen-avatar" style="width:70px;height:70px;font-size:1.8rem;">
              ${(alumno.nombre_completo || 'A')[0].toUpperCase()}
            </div>
            <div class="pm-zen-info">
              <h1 class="pm-zen-name">${escHTML(alumno.nombre_completo)}</h1>
              <p class="pm-zen-instrument">${escHTML(alumno.instrumento_principal || 'Estudiante')}</p>
              <p style="font-size:0.8rem;opacity:0.8;margin-top:4px;">Nivel ${alumno.nivel_actual || 1} • ${edad} años</p>
            </div>
          </div>
        </div>

        <div class="pm-zen-body">
          <!-- 📊 Panel de Métricas Principales -->
          <div class="pm-zen-mosaic" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-zen-card pm-zen-card--large pm-glass" style="grid-column: span 2;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <span class="pm-zen-card__label" style="font-size:0.85rem;">📈 Rendimiento Académico</span>
                <span style="font-size:1.5rem;font-weight:700;color:${promedioNotas >= 4 ? 'var(--pm-success)' : promedioNotas >= 2 ? 'var(--pm-warning)' : 'var(--pm-danger)'}">${promedioNotas.toFixed(1)}</span>
              </div>
              <div class="pm-student-panel__progress-bar" style="height:8px;border-radius:4px;background:var(--pm-border);">
                <div class="pm-student-panel__progress-fill" style="width:${pctAprobacion}%;background:${promedioNotas >= 4 ? 'var(--pm-success)' : promedioNotas >= 2 ? 'var(--pm-warning)' : 'var(--pm-danger)'};height:100%;border-radius:4px;"></div>
              </div>
              <p style="font-size:0.75rem;color:var(--pm-text-muted);margin-top:0.5rem;display:flex;justify-content:space-between;">
                <span>${indicadoresAprobados}/${indicadoresTotales} indicadores aprobados (${pctAprobacion}%)</span>
              </p>
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">✅ Asistencia</span>
              <span class="pm-zen-card__value" style="font-size:1.8rem;">${pctAsistencia}%</span>
              <p class="pm-zen-card__sub" style="font-size:0.7rem;">
                <span style="color:var(--pm-success)">${presentes} P</span> • 
                <span style="color:var(--pm-danger)">${ausentes} A</span> • 
                <span style="color:var(--pm-warning)">${justifica} J</span>
              </p>
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">📅 Clases Activas</span>
              <span class="pm-zen-card__value" style="font-size:1.8rem;">${inscripciones?.length || 0}</span>
              <p class="pm-zen-card__sub" style="font-size:0.7rem;">Materias inscritas</p>
            </div>
          </div>

          <!-- 🎵 Clases Activas -->
          ${inscripciones && inscripciones.length > 0 ? `
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🎵 Clases Inscritas</h3>
            <div class="pm-zen-clases-grid">
              ${inscripciones.map(ins => {
                const stats = sesionesPorClase[ins.clase.id] || { P: 0, A: 0, J: 0, total: 0 }
                const pctClase = stats.total > 0 ? Math.round((stats.P / stats.total) * 100) : 100
                return `
                  <div class="pm-zen-clase-card pm-glass">
                    <div class="pm-zen-clase-header">
                      <strong>${escHTML(ins.clase.nombre)}</strong>
                      <span class="pm-zen-clase-nivel">Nivel ${ins.clase.nivel || 1}</span>
                    </div>
                    <p class="pm-zen-clase-inst">${escHTML(ins.clase.instrumento || '')}</p>
                    <div class="pm-zen-clase-stats">
                      <div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-success)">${stats.P}</span>
                        <span class="pm-zen-stat-label">Presente</span>
                      </div>
                      <div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-danger)">${stats.A}</span>
                        <span class="pm-zen-stat-label">Ausente</span>
                      </div>
                      <div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value">${pctClase}%</span>
                        <span class="pm-zen-stat-label">Asistencia</span>
                      </div>
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          </div>
          ` : ''}

          <!-- 📝 Últimas Evaluaciones -->
          ${notasValidas.length > 0 ? `
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📝 Últimas Evaluaciones</h3>
            <div class="pm-zen-evaluaciones">
              ${notasValidas.slice(0, 8).map(ev => {
                const fecha = new Date(ev.created_at)
                const color = ev.nota >= 4 ? 'var(--pm-success)' : ev.nota >= 2 ? 'var(--pm-warning)' : 'var(--pm-danger)'
                const icono = ev.nota >= 4 ? '✅' : ev.nota >= 2 ? '⚠️' : '❌'
                return `
                  <div class="pm-zen-eval-item">
                    <div class="pm-zen-eval-icon" style="background:${color}20;color:${color}">${icono}</div>
                    <div class="pm-zen-eval-content">
                      <div class="pm-zen-eval-header">
                        <strong>Nota: ${ev.nota}</strong>
                        <span>${fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      ${ev.tarea ? `<p class="pm-zen-eval-tarea">${escHTML(ev.tarea)}</p>` : ''}
                      ${ev.observations ? `<p class="pm-zen-eval-obs">${escHTML(ev.observations.substring(0, 80))}${ev.observations.length > 80 ? '...' : ''}</p>` : ''}
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          </div>
          ` : ''}

          <!-- 📅 Historial de Asistencia -->
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📅 Historial de Asistencia</h3>
            <div class="pm-zen-asistencia-timeline">
              ${sesiones?.slice(0, 15).map(s => {
                const reg = s.asistencia?.find(a => a.alumno_id === alumnoId)
                const estado = reg?.estado || null
                const labels = { 'P': 'Presente', 'A': 'Ausente', 'J': 'Justificado', 'T': 'Tardanza' }
                const colors = { 'P': 'var(--pm-success)', 'A': 'var(--pm-danger)', 'J': 'var(--pm-warning)', 'T': '#FF9500' }
                const clase = claseMap.get(s.clase_id)
                return estado ? `
                  <div class="pm-zen-asistencia-item">
                    <div class="pm-zen-asistencia-dot" style="background:${colors[estado] || 'var(--pm-border)'}"></div>
                    <div class="pm-zen-asistencia-content">
                      <div class="pm-zen-asistencia-header">
                        <strong>${labels[estado] || 'Sin registro'}</strong>
                        <span>${new Date(s.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                      </div>
                      <span class="pm-zen-asistencia-clase">${escHTML(clase?.nombre || 'Clase')}</span>
                    </div>
                  </div>
                ` : ''
              }).join('') || '<p class="pm-zen-empty">Sin registros de asistencia</p>'}
            </div>
          </div>

          <!-- 🚨 Ausencias Recientes -->
          ${ausencias && ausencias.length > 0 ? `
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🚨 Ausencias Registradas</h3>
            <div class="pm-zen-ausencias">
              ${ausencias.map(aus => {
                const fechaIni = new Date(aus.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                const fechaFin = aus.fecha_fin ? new Date(aus.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : fechaIni
                const estadoColors = { 'pendiente': 'var(--pm-warning)', 'aprobada': 'var(--pm-success)', 'rechazada': 'var(--pm-danger)' }
                return `
                  <div class="pm-zen-ausencia-item">
                    <div class="pm-zen-ausencia-icon" style="background:${estadoColors[aus.estado] || 'var(--pm-border)'}20">
                      <i class="bi bi-calendar-x" style="color:${estadoColors[aus.estado] || 'var(--pm-text-muted)'}"></i>
                    </div>
                    <div class="pm-zen-ausencia-content">
                      <div class="pm-zen-ausencia-header">
                        <strong>${fechaIni === fechaFin ? fechaIni : `${fechaIni} - ${fechaFin}`}</strong>
                        <span class="pm-zen-ausencia-estado" style="color:${estadoColors[aus.estado] || 'var(--pm-text-muted)'}">${aus.estado || 'pendiente'}</span>
                      </div>
                      ${aus.motivo ? `<p class="pm-zen-ausencia-motivo">${escHTML(aus.motivo.substring(0, 60))}${aus.motivo.length > 60 ? '...' : ''}</p>` : ''}
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          </div>
          ` : ''}

          <!-- 📞 Información de Contacto -->
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📞 Datos de Contacto</h3>
            <div class="pm-zen-details-grid">
              <div class="pm-zen-detail">
                <i class="bi bi-telephone-fill"></i>
                <div>
                  <span>Teléfono</span>
                  <strong>${escHTML(alumno.tlf_alumno || 'No registrado')}</strong>
                </div>
              </div>
              <div class="pm-zen-detail">
                <i class="bi bi-calendar-check"></i>
                <div>
                  <span>Fecha de ingreso</span>
                  <strong>${fechaIngreso}</strong>
                </div>
              </div>
              <div class="pm-zen-detail">
                <i class="bi bi-cake"></i>
                <div>
                  <span>Fecha de nacimiento</span>
                  <strong>${alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No registrada'}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Progreso Académico (Interactive) -->
          <div class="pm-zen-section">
            <div class="pm-zen-section-header">
              <h3 class="pm-zen-section-title">📚 Plan de Estudios</h3>
            </div>
            <div id="pm-alumno-progreso-root" class="pm-zen-progress-container">
              <div class="pm-loading-zen"><div class="pm-pulse"></div></div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .pm-zen-clases-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
        .pm-zen-clase-card {
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
          padding: 0.75rem;
        }
        .pm-zen-clase-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .pm-zen-clase-header strong {
          font-size: 0.85rem;
          line-height: 1.2;
        }
        .pm-zen-clase-nivel {
          font-size: 0.65rem;
          color: var(--pm-primary);
          background: var(--pm-primary);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .pm-zen-clase-inst {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0.5rem;
        }
        .pm-zen-clase-stats {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--pm-border);
          padding-top: 0.5rem;
        }
        .pm-zen-clase-stat {
          text-align: center;
        }
        .pm-zen-stat-value {
          display: block;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .pm-zen-stat-label {
          font-size: 0.6rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-evaluaciones {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pm-zen-eval-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
        }
        .pm-zen-eval-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .pm-zen-eval-content {
          flex: 1;
          min-width: 0;
        }
        .pm-zen-eval-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .pm-zen-eval-tarea {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
        .pm-zen-eval-obs {
          font-size: 0.75rem;
          color: var(--pm-text);
          margin: 0.25rem 0 0;
          font-style: italic;
        }
        .pm-zen-asistencia-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .pm-zen-asistencia-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.25rem 0;
        }
        .pm-zen-asistencia-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .pm-zen-asistencia-content {
          flex: 1;
        }
        .pm-zen-asistencia-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }
        .pm-zen-asistencia-clase {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-ausencias {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pm-zen-ausencia-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
        }
        .pm-zen-ausencia-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pm-zen-ausencia-content {
          flex: 1;
        }
        .pm-zen-ausencia-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .pm-zen-ausencia-estado {
          font-size: 0.7rem;
          text-transform: capitalize;
        }
        .pm-zen-ausencia-motivo {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
      </style>
    `

    // Eventos
    container.querySelector('#pm-alumno-back').onclick = () => window.history.back()
    _renderEvaluaciones(container, alumnoId)

  } catch (err) {
    console.error('[AlumnoPerfil] Error crítico:', err)
    container.innerHTML = `
      <div class="pm-zen-error">
        <i class="bi bi-exclamation-octagon"></i>
        <p>No pudimos cargar el perfil en este momento</p>
        <button class="pm-btn pm-btn-secondary" onclick="window.history.back()">Regresar</button>
      </div>
    `
  }
}