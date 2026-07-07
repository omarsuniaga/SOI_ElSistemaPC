/**
 * asistentePedagogicoPanel.js — Three-block AI assistant panel for teachers.
 *
 * Block 1: Gap analysis per student (which curriculum objectives are pending)
 * Block 2: Draft for next class (AI generates plan based on pending objectives)
 * Block 3: Qualitative feedback on teacher's pedagogical approach
 *
 * Usage: renderAsistentePedagogicoPanel(container)
 */
import { supabase } from '../../../lib/supabaseClient.js'
import { obtenerCurriculo } from '../api/curriculoApi.js'
import { obtenerCoberturaPorAlumno } from '../api/coberturaApi.js'
import { sugerirPlan, analizarEnfoque } from '../api/groqService.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const escapeHTML = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))

export async function renderAsistentePedagogicoPanel(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-robot fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Asistente IA</h1>
          <p class="text-muted small mb-0">Análisis curricular personalizado para tus alumnos</p>
        </div>
      </div>

      <!-- Block 1: Gap analysis -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-bar-chart-line text-primary"></i>
          <span class="fw-semibold">Análisis de brechas por alumno</span>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label-compact">Seleccionar alumno</label>
            <select class="form-select form-select-sm" id="ap-alumno-sel" style="max-width:300px">
              <option value="">Cargando alumnos...</option>
            </select>
          </div>
          <div id="ap-brechas-content">
            <p class="text-muted small">Seleccioná un alumno para ver su cobertura curricular.</p>
          </div>
        </div>
      </div>

      <!-- Block 2: Draft next class -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-magic text-success"></i>
          <span class="fw-semibold">Borrador para próxima clase</span>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-3">Generá un borrador de plan basado en los objetivos pendientes del alumno seleccionado.</p>
          <button class="btn btn-outline-success btn-sm" id="ap-btn-draft" disabled>
            <i class="bi bi-stars me-1"></i>Generar borrador
          </button>
          <div id="ap-draft-content" class="mt-3"></div>
        </div>
      </div>

      <!-- Block 3: Qualitative feedback -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-lightbulb text-warning"></i>
          <span class="fw-semibold">Retroalimentación pedagógica</span>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-3">Análisis de tu enfoque pedagógico basado en los últimos 2 meses de clases.</p>
          <button class="btn btn-outline-warning btn-sm" id="ap-btn-feedback">
            <i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque
          </button>
          <div id="ap-feedback-content" class="mt-3"></div>
        </div>
      </div>
    </div>`

  const state = {
    alumnos: [],
    selectedAlumnoId: null,
    selectedAlumno: null,
    cobertura: [],
    curriculo: null,
    maestroId: null,
    instrumento: null,
  }

  // Get maestro context
  const { data: { user } } = await supabase.auth.getUser()
  const { data: maestro } = await supabase
    .from('maestros')
    .select('id, instrumento')
    .eq('user_id', user.id)
    .single()
  state.maestroId = maestro?.id
  state.instrumento = maestro?.instrumento

  // Load alumnos del maestro via their classes
  const { data: inscripciones } = await supabase
    .from('alumnos_clases')
    .select('alumnos(id, nombre_completo), clases(instrumento, plan_estudio, maestro_principal_id)')
    .eq('clases.maestro_principal_id', state.maestroId)

  const alumnosMap = {}
  ;(inscripciones || []).forEach(i => {
    if (i.alumnos && i.clases) {
      alumnosMap[i.alumnos.id] = {
        ...i.alumnos,
        instrumento: i.clases.instrumento,
        nivel: i.clases.plan_estudio
      }
    }
  })
  state.alumnos = Object.values(alumnosMap)

  const sel = container.querySelector('#ap-alumno-sel')
  sel.innerHTML = `<option value="">Seleccionar alumno...</option>` +
    state.alumnos.map(a => `<option value="${a.id}">${escapeHTML(a.nombre_completo)}</option>`).join('')

  sel.addEventListener('change', async () => {
    const id = sel.value
    if (!id) {
      container.querySelector('#ap-brechas-content').innerHTML = '<p class="text-muted small">Seleccioná un alumno.</p>'
      container.querySelector('#ap-btn-draft').disabled = true
      state.selectedAlumnoId = null
      state.selectedAlumno = null
      return
    }
    state.selectedAlumnoId = id
    state.selectedAlumno = state.alumnos.find(a => a.id === id)
    container.querySelector('#ap-btn-draft').disabled = false
    await _renderBrechas()
  })

  async function _renderBrechas() {
    const content = container.querySelector('#ap-brechas-content')
    content.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-muted"></div></div>`

    try {
      const alumno = state.selectedAlumno
      state.curriculo = (alumno.instrumento && alumno.nivel)
        ? await obtenerCurriculo(alumno.instrumento, alumno.nivel)
        : null

      if (!state.curriculo) {
        content.innerHTML = `<div class="alert alert-secondary py-2 small">Sin guía curricular definida para <strong>${escapeHTML(alumno.instrumento || 'este instrumento')}</strong> — <strong>${escapeHTML(alumno.nivel || 'este nivel')}</strong>.</div>`
        return
      }

      state.cobertura = await obtenerCoberturaPorAlumno(state.selectedAlumnoId)
      const cobMap = {}
      state.cobertura.forEach(c => {
        const objId = c.curriculo_objetivos?.id || c.objetivo_id
        if (objId) cobMap[objId] = c
      })

      const todosObjs = state.curriculo.curriculo_pilares.flatMap(p =>
        p.curriculo_objetivos.map(o => ({ ...o, pilar_nombre: p.nombre }))
      )
      const logrados  = todosObjs.filter(o => cobMap[o.id]?.nivel === 'logrado').length
      const enProceso = todosObjs.filter(o => cobMap[o.id] && cobMap[o.id].nivel !== 'logrado').length
      const noIniciados = todosObjs.length - logrados - enProceso

      content.innerHTML = `
        <div class="mb-3">
          <span class="badge bg-success me-1">${logrados} logrados</span>
          <span class="badge bg-warning text-dark me-1">${enProceso} en proceso</span>
          <span class="badge bg-secondary me-1">${noIniciados} no iniciados</span>
          <span class="text-muted small">de ${todosObjs.length} objetivos totales</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle small">
            <thead class="table-light">
              <tr><th>Pilar</th><th>Objetivo</th><th>Estado</th><th>Fuente</th></tr>
            </thead>
            <tbody>
              ${todosObjs.map(o => {
                const cob = cobMap[o.id]
                const nivel = cob?.nivel || 'no_iniciado'
                const badge = nivel === 'logrado'
                  ? '<span class="badge bg-success">✓ Logrado</span>'
                  : nivel === 'en_proceso'
                    ? '<span class="badge bg-warning text-dark">⟳ En proceso</span>'
                    : nivel === 'iniciando'
                      ? '<span class="badge bg-info text-dark">Iniciando</span>'
                      : '<span class="badge bg-secondary">○ No iniciado</span>'
                const fuenteBadge = cob
                  ? (cob.confirmado
                    ? '<i class="bi bi-check-circle text-success" title="Confirmado por maestro"></i>'
                    : '<i class="bi bi-stars text-warning" title="Sugerido por IA"></i>')
                  : '—'
                return `<tr>
                  <td class="text-muted">${escapeHTML(o.pilar_nombre)}</td>
                  <td>${escapeHTML(o.descripcion)}</td>
                  <td>${badge}</td>
                  <td class="text-center">${fuenteBadge}</td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
        </div>`
    } catch (err) {
      content.innerHTML = `<div class="alert alert-danger small">${err.message}</div>`
    }
  }

  // Block 2: Draft
  container.querySelector('#ap-btn-draft').addEventListener('click', async () => {
    if (!state.selectedAlumno) return
    const btn = container.querySelector('#ap-btn-draft')
    const draftContent = container.querySelector('#ap-draft-content')

    btn.disabled = true
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Generando...`
    draftContent.innerHTML = ''

    try {
      const alumno = state.selectedAlumno
      const todosObjs = state.curriculo?.curriculo_pilares?.flatMap(p =>
        p.curriculo_objetivos.map(o => o)
      ) || []
      const cobMap = {}
      state.cobertura.forEach(c => {
        const objId = c.curriculo_objetivos?.id || c.objetivo_id
        if (objId) cobMap[objId] = c
      })
      const pendientes = todosObjs.filter(o => !cobMap[o.id] || cobMap[o.id].nivel !== 'logrado')

      const { data: planesRecientes } = await supabase
        .from('planificaciones')
        .select('tema')
        .eq('maestro_id', state.maestroId)
        .eq('estado', 'ejecutado')
        .order('created_at', { ascending: false })
        .limit(3)
      const ultimosTemas = (planesRecientes || []).map(p => p.tema)

      const result = await sugerirPlan(
        {
          nombre: alumno.nombre_completo,
          instrumento: alumno.instrumento || '(sin instrumento)',
          nivel: alumno.nivel || '(sin nivel)'
        },
        pendientes,
        ultimosTemas
      )

      if (!result.success || !result.plan) throw new Error(result.error || 'Sin respuesta de la IA')

      const plan = result.plan
      draftContent.innerHTML = `
        <div class="card border-success border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-success bg-opacity-15 text-success">Borrador generado por IA</span>
              <button class="btn btn-sm btn-success" id="ap-btn-save-draft">
                <i class="bi bi-floppy me-1"></i>Guardar como plan
              </button>
            </div>
            <div class="mb-2"><span class="fw-semibold">Tema:</span> ${escapeHTML(plan.tema || '')}</div>
            <div class="mb-2"><span class="fw-semibold">Objetivos:</span> ${escapeHTML(plan.objetivos || '')}</div>
            <div class="mb-2"><span class="fw-semibold">Contenido:</span> ${escapeHTML(plan.contenido || '')}</div>
            ${plan.recursos?.length ? `<div><span class="fw-semibold">Recursos:</span> ${plan.recursos.map(r => `<span class="badge bg-light text-dark border me-1">${escapeHTML(r)}</span>`).join('')}</div>` : ''}
          </div>
        </div>`

      container.querySelector('#ap-btn-save-draft')?.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('planificacion:nuevoPlan', {
          detail: { tema: plan.tema, objetivos: plan.objetivos, contenido: plan.contenido }
        }))
        AppToast.success('Borrador listo — abrí "Nuevo plan" para completar los detalles')
      })
    } catch (err) {
      draftContent.innerHTML = `<div class="alert alert-danger small">${err.message}</div>`
    } finally {
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-stars me-1"></i>Generar borrador`
    }
  })

  // Block 3: Feedback
  container.querySelector('#ap-btn-feedback').addEventListener('click', async () => {
    const btn = container.querySelector('#ap-btn-feedback')
    const feedbackContent = container.querySelector('#ap-feedback-content')

    btn.disabled = true
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Analizando...`
    feedbackContent.innerHTML = ''

    try {
      const since = new Date()
      since.setDate(since.getDate() - 56)
      const { data: planes } = await supabase
        .from('planificaciones')
        .select('tema, contenido, objetivos, instrumento')
        .eq('maestro_id', state.maestroId)
        .eq('estado', 'ejecutado')
        .gte('created_at', since.toISOString())

      const instrumento = state.instrumento || planes?.[0]?.instrumento || 'Instrumento'

      let curriculo = null
      try {
        curriculo = instrumento ? await obtenerCurriculo(instrumento, null) : null
      } catch (_) { /* no curriculum is ok */ }

      const cobResumen = state.selectedAlumnoId && state.selectedAlumno
        ? `Alumno seleccionado: ${state.selectedAlumno.nombre_completo}. ${state.cobertura.length} objetivos trabajados.`
        : 'No hay alumno seleccionado.'

      const result = await analizarEnfoque(instrumento, planes || [], curriculo, cobResumen)
      if (!result.success) throw new Error(result.error || 'Sin respuesta de la IA')

      feedbackContent.innerHTML = `
        <div class="card border-warning border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge bg-warning bg-opacity-15 text-warning-emphasis">Análisis pedagógico</span>
              <button class="btn btn-sm btn-outline-secondary" id="ap-btn-regenerate">
                <i class="bi bi-arrow-clockwise me-1"></i>Regenerar
              </button>
            </div>
            <div class="text-body" style="line-height:1.7; white-space:pre-line">${escapeHTML(result.feedback)}</div>
          </div>
        </div>`

      container.querySelector('#ap-btn-regenerate')?.addEventListener('click', () => {
        container.querySelector('#ap-btn-feedback').click()
      })
    } catch (err) {
      feedbackContent.innerHTML = `<div class="alert alert-danger small">${err.message}</div>`
    } finally {
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque`
    }
  })
}
