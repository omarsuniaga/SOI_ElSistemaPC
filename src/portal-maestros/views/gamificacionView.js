import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'

/** Node type → emoji mapping */
const NODE_ICONS = {
  scales: '🎼', arpeggios: '🎹', left_hand: '✋', bow: '🎻',
  sound: '🔊', intonation: '🎵', studies: '⚙️', repertoire: '📖',
}

/** Status → color mapping */
const STATUS_COLORS = {
  approved: '#34C759', achieved: '#34C759', exceeded: '#007AFF',
  in_process: '#007AFF', needs_reinforcement: '#FF9500',
  pending: '#ccc', not_started: '#ccc', failed: '#FF3B30',
}

const STATUS_LABELS = {
  approved: 'Aprobado', achieved: 'Dominado', exceeded: 'Sobresaliente',
  in_process: 'En proceso', needs_reinforcement: 'Requiere refuerzo',
  pending: 'Pendiente', not_started: 'Sin iniciar', failed: 'Fallido',
}

function getNodeIcon(name) {
  const lower = (name || '').toLowerCase()
  for (const [key, icon] of Object.entries(NODE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  if (lower.includes('escala')) return '🎼'
  if (lower.includes('arpegio')) return '🎹'
  if (lower.includes('mano') || lower.includes('izquierda')) return '✋'
  if (lower.includes('arco')) return '🎻'
  if (lower.includes('sonido')) return '🔊'
  if (lower.includes('afinación') || lower.includes('entonación')) return '🎵'
  if (lower.includes('estudio')) return '⚙️'
  if (lower.includes('repertorio') || lower.includes('obra')) return '📖'
  return '📋'
}

function statusIcon(status) {
  return { approved: '✅', in_process: '🔄', pending: '⏳', failed: '❌' }[status] || '❓'
}

export async function renderGamificacionView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  try {
    // 1. Get teacher's classes and students
    const { data: clases } = await supabase
      .from('clases')
      .select('id, nombre')
      .eq('maestro_id', maestro.id)
      .order('nombre')

    if (!clases || clases.length === 0) {
      container.innerHTML = `<p class="pm-empty">No tienes clases asignadas.</p>`
      return
    }

    // Get all students from teacher's classes
    const { data: enrollments } = await supabase
      .from('inscripciones')
      .select('alumno_id, clase_id, alumnos(id, nombre, apellido), clases(id, nombre)')
      .in('clase_id', clases.map(c => c.id))

    const students = [...new Map(
      enrollments?.map(e => [e.alumnos.id, e.alumnos]) || []
    ).values()]

    // 2. Render UI
    container.innerHTML = `
      <div class="pm-progress-root">
        <div class="pm-progress-header">
          <h2><i class="bi bi-trophy"></i> Progresos y Logros</h2>
          <select id="pm-student-select" class="pm-input">
            <option value="">Seleccionar alumno...</option>
            ${students.map(s => `<option value="${s.id}">${escHTML(s.nombre)} ${escHTML(s.apellido)}</option>`).join('')}
          </select>
        </div>
        <div id="pm-progress-content"></div>
      </div>

      <style>
        .pm-progress-root { padding: 1rem; }
        .pm-progress-header { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .pm-progress-header h2 { margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .pm-progress-header select { max-width: 100%; }

        .pm-student-summary { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; background: var(--pm-surface); padding: 1rem; border-radius: 12px; }
        .pm-summary-row { display: flex; justify-content: space-between; align-items: center; }
        .pm-summary-label { font-size: 0.9rem; color: var(--pm-text-muted); }
        .pm-summary-value { font-weight: 700; font-size: 1rem; }
        .pm-progress-bar { width: 100%; height: 8px; background: var(--pm-border); border-radius: 4px; overflow: hidden; }
        .pm-progress-fill { height: 100%; background: var(--apple-success); transition: width 0.3s; }

        .pm-duolingo-path { display: flex; flex-direction: column; gap: 1rem; position: relative; padding: 1rem 0; }
        .pm-duolingo-path::before { content: ''; position: absolute; left: 23px; top: 0; bottom: 0; width: 2px; background: var(--pm-border); }

        .pm-level-circle { display: flex; align-items: flex-start; gap: 1rem; position: relative; z-index: 1; }
        .pm-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; flex-shrink: 0; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .pm-circle:hover { transform: scale(1.1); }
        .pm-circle.approved { background: var(--apple-success); }
        .pm-circle.in_process { background: var(--apple-primary); animation: pulse 2s infinite; }
        .pm-circle.pending { background: var(--pm-border); }
        .pm-circle.failed { background: var(--pm-danger); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .pm-level-content { flex: 1; }
        .pm-level-title { font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 0.5rem; }
        .pm-level-obj { font-size: 0.8rem; color: var(--pm-text-muted); margin-bottom: 0.5rem; }
        .pm-level-nodes { display: none; gap: 0.5rem; flex-wrap: wrap; }
        .pm-level-circle.expanded .pm-level-nodes { display: flex; }

        .pm-node-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--pm-surface-2); border-radius: 8px; border: 1px solid var(--pm-border); min-width: 150px; cursor: pointer; transition: border-color 0.2s; }
        .pm-node-card:hover { border-color: var(--apple-primary); }
        .pm-node-icon { font-size: 1.2rem; flex-shrink: 0; }
        .pm-node-info { flex: 1; min-width: 0; }
        .pm-node-name { display: block; font-size: 0.75rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pm-node-status { display: block; font-size: 0.65rem; color: var(--pm-text-muted); }

        .pm-indicators { display: none; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--pm-border); }
        .pm-node-card.expanded .pm-indicators { display: block; }
        .pm-indicator { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; font-size: 0.75rem; }
        .pm-indicator-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .pm-indicator-desc { flex: 1; }
        .pm-indicator-date { font-size: 0.65rem; color: var(--pm-text-muted); }

        .pm-empty-state { padding: 2rem 1rem; text-align: center; color: var(--pm-text-muted); }
      </style>
    `

    // Wire student selector
    const selectEl = container.querySelector('#pm-student-select')
    selectEl.addEventListener('change', async (e) => {
      const studentId = e.target.value
      if (!studentId) {
        container.querySelector('#pm-progress-content').innerHTML = ''
        return
      }
      await loadStudentProgress(container, studentId)
    })

  } catch (err) {
    container.innerHTML = `<p class="pm-empty">Error: ${escHTML(err.message)}</p>`
  }
}

async function loadStudentProgress(container, studentId) {
  const contentEl = container.querySelector('#pm-progress-content')
  contentEl.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  try {
    // Get student info
    const { data: student } = await supabase
      .from('alumnos')
      .select('nombre, apellido')
      .eq('id', studentId)
      .single()

    // Get active academic plan
    const { data: plan } = await supabase
      .from('academic_plans')
      .select('id, route_version_id, status')
      .eq('student_id', studentId)
      .in('status', ['in_process', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: studentEnrollments } = await supabase
      .from('inscripciones')
      .select('clase_id, clases(id, nombre)')
      .eq('alumno_id', studentId)

    const enrolledClassIds = (studentEnrollments || []).map((row) => row.clase_id).filter(Boolean)
    let acmRoutes = []
    if (enrolledClassIds.length > 0) {
      const { data } = await supabase
        .from('acm_active_routes')
        .select('id, group_id, weekly_plan_id, current_week, status')
        .in('group_id', enrolledClassIds)
        .eq('status', 'active')
      acmRoutes = data || []
    }

    let acmPlanItems = []
    const weeklyPlanIds = [...new Set(acmRoutes.map((route) => route.weekly_plan_id).filter(Boolean))]
    if (weeklyPlanIds.length > 0) {
      const { data } = await supabase
        .from('acm_weekly_plan_items')
        .select('weekly_plan_id, week_number, topic, objective')
        .in('weekly_plan_id', weeklyPlanIds)
      acmPlanItems = data || []
    }

    let acmProgressRows = []
    const acmIndicatorIds = [...new Set(acmPlanItems.map((item) => item.indicator_id).filter(Boolean))]
    if (acmIndicatorIds.length > 0) {
      const { data } = await supabase
        .from('student_indicator_progress')
        .select('indicator_id, status, updated_at')
        .eq('student_id', studentId)
        .in('indicator_id', acmIndicatorIds)
      acmProgressRows = data || []
    }

    const acmContextCards = (studentEnrollments || []).map((enrollment) => {
      const activeRoute = acmRoutes.find((route) => route.group_id === enrollment.clase_id)
      if (!activeRoute) return null
      const currentItem = acmPlanItems.find((item) =>
        item.weekly_plan_id === activeRoute.weekly_plan_id &&
        Number(item.week_number) === Number(activeRoute.current_week || 1))

      return {
        className: enrollment.clases?.nombre || 'Clase',
        currentWeek: activeRoute.current_week || 1,
        topic: currentItem?.topic || 'Semana sin tema cargado',
        objective: currentItem?.objective || '',
      }
    }).filter(Boolean)

    const acmProgressCards = acmContextCards.map((card) => {
      const matchingRoute = acmRoutes.find((route) => route.current_week === card.currentWeek)
      const item = acmPlanItems.find((planItem) =>
        planItem.weekly_plan_id === matchingRoute?.weekly_plan_id &&
        Number(planItem.week_number) === Number(card.currentWeek))
      const progress = item?.indicator_id
        ? acmProgressRows.find((row) => row.indicator_id === item.indicator_id)
        : null

      return {
        ...card,
        progressLabel: progress ? (STATUS_LABELS[progress.status] || progress.status) : 'Sin progreso registrado',
        progressColor: progress ? (STATUS_COLORS[progress.status] || '#ccc') : '#ccc',
        progressDate: progress?.updated_at || null,
      }
    })

    if (!plan) {
      contentEl.innerHTML = `
        <div class="pm-empty-state">
          <p>Este alumno no tiene un plan académico activo.</p>
          ${acmContextCards.length > 0 ? `
            <div class="pm-student-summary" style="margin-top:1rem;text-align:left;">
              <div class="pm-summary-row">
                <span class="pm-summary-label">Contexto curricular ACM disponible</span>
                <span class="pm-summary-value">${acmContextCards.length} clase(s)</span>
              </div>
              ${acmProgressCards.map(card => `
                <div style="padding:0.75rem;border-radius:10px;background:var(--pm-surface-2);border:1px solid var(--pm-border);">
                  <div style="font-weight:700;">${escHTML(card.className)} · Semana ${escHTML(String(card.currentWeek))}</div>
                  <div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.25rem;"><strong>Tema:</strong> ${escHTML(card.topic)}</div>
                  ${card.objective ? `<div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.2rem;"><strong>Objetivo:</strong> ${escHTML(card.objective)}</div>` : ''}
                  <div style="font-size:0.82rem;margin-top:0.35rem;color:${card.progressColor};"><strong>Progreso:</strong> ${escHTML(card.progressLabel)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <a href="#/ruta-plan-builder?id=${studentId}" class="pm-btn pm-btn-primary" style="display:inline-block;margin-top:0.5rem;">
            Crear Plan
          </a>
        </div>
      `
      return
    }

    // Get levels for route
    const { data: levels } = await supabase
      .from('levels')
      .select('*')
      .eq('route_version_id', plan.route_version_id)
      .order('level_number', { ascending: true })

    // Get student level progress
    const { data: levelProgress } = await supabase
      .from('student_level_progress')
      .select('*')
      .eq('student_id', studentId)

    // Get nodes for levels
    const { data: nodes } = await supabase
      .from('nodes')
      .select('*, indicators(*)')
      .in('level_id', (levels || []).map(l => l.id))
      .order('order_index', { ascending: true })

    // Get node progress
    const { data: nodeProgress } = await supabase
      .from('student_node_progress')
      .select('*, indicator_attempts(*)')
      .eq('student_id', studentId)

    // Build summary
    const approvedLevels = (levelProgress || []).filter(lp => lp.status === 'approved').length
    const totalLevels = levels?.length || 0
    const progressPct = totalLevels > 0 ? Math.round((approvedLevels / totalLevels) * 100) : 0

    // Render
    contentEl.innerHTML = `
      <div class="pm-student-summary">
        <div class="pm-summary-row">
          <span class="pm-summary-label">Alumno</span>
          <span class="pm-summary-value">${escHTML(student.nombre)} ${escHTML(student.apellido)}</span>
        </div>
        <div class="pm-summary-row">
          <span class="pm-summary-label">Progreso</span>
          <span class="pm-summary-value">${approvedLevels}/${totalLevels} niveles</span>
        </div>
        <div class="pm-progress-bar">
          <div class="pm-progress-fill" style="width:${progressPct}%"></div>
        </div>
        ${acmContextCards.length > 0 ? `
          <div style="display:grid;gap:0.5rem;margin-top:0.5rem;">
            ${acmProgressCards.map(card => `
              <div style="padding:0.75rem;border-radius:10px;background:var(--pm-surface-2);border:1px solid var(--pm-border);">
                <div style="font-weight:700;">${escHTML(card.className)} · Guía ACM · Semana ${escHTML(String(card.currentWeek))}</div>
                <div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.25rem;"><strong>Tema:</strong> ${escHTML(card.topic)}</div>
                ${card.objective ? `<div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.2rem;"><strong>Objetivo:</strong> ${escHTML(card.objective)}</div>` : ''}
                <div style="font-size:0.82rem;margin-top:0.35rem;color:${card.progressColor};"><strong>Estado ACM:</strong> ${escHTML(card.progressLabel)}</div>
                ${card.progressDate ? `<div style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.15rem;">Actualizado: ${new Date(card.progressDate).toLocaleDateString('es')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="pm-duolingo-path">
        ${(levels || []).map(level => {
          const lp = levelProgress?.find(p => p.level_id === level.id)
          const status = lp?.status || 'pending'
          const levelNodes = nodes?.filter(n => n.level_id === level.id) || []

          return `
            <div class="pm-level-circle" data-level-id="${level.id}">
              <div class="pm-circle ${status}">
                ${status === 'approved' ? '✓' : status === 'in_process' ? level.level_number : status === 'failed' ? '✕' : '🔒'}
              </div>
              <div class="pm-level-content">
                <div class="pm-level-title" style="cursor:pointer;" onclick="this.closest('.pm-level-circle').classList.toggle('expanded')">
                  <i class="bi bi-chevron-down" style="display:inline-block;transition:transform 0.2s;"></i>
                  Nivel ${level.level_number}: ${escHTML(level.name)}
                </div>
                <div class="pm-level-obj">${escHTML(level.main_objective || '')}</div>
                <div class="pm-level-nodes">
                  ${levelNodes.map(node => {
                    const np = nodeProgress?.find(p => p.node_id === node.id)
                    const nStatus = np?.status || 'pending'
                    const indicators = node.indicators || []
                    const attempts = np?.indicator_attempts || []

                    return `
                      <div class="pm-node-card" onclick="this.classList.toggle('expanded')">
                        <div class="pm-node-icon">${getNodeIcon(node.name)}</div>
                        <div class="pm-node-info">
                          <span class="pm-node-name">${escHTML(node.name)}</span>
                          <span class="pm-node-status">${STATUS_LABELS[nStatus]}</span>
                        </div>
                        ${node.is_critical ? '<span style="color:var(--pm-danger);font-size:0.6rem;font-weight:700;">CRÍTICO</span>' : ''}
                        <div class="pm-indicators">
                          ${indicators.length === 0
                            ? '<p style="font-size:0.7rem;color:var(--pm-text-muted);">Sin indicadores</p>'
                            : indicators.map(ind => {
                              const attempt = attempts.find(a => a.indicator_id === ind.id)
                              const iStatus = attempt?.status || 'pending'
                              return `
                                <div class="pm-indicator">
                                  <span class="pm-indicator-dot" style="background:${STATUS_COLORS[iStatus]};"></span>
                                  <span class="pm-indicator-desc">${escHTML(ind.description)}</span>
                                  ${attempt?.created_at ? `<span class="pm-indicator-date">${new Date(attempt.created_at).toLocaleDateString('es')}</span>` : ''}
                                </div>
                              `
                            }).join('')}
                        </div>
                      </div>
                    `
                  }).join('')}
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    `

  } catch (err) {
    contentEl.innerHTML = `<p class="pm-empty">Error: ${escHTML(err.message)}</p>`
  }
}
