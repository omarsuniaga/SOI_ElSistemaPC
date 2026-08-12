/**
 * hermesQueryEngine.js — Semantic & Deterministic Query Resolution Engine
 *
 * Provides executive-level operational answers. Leverages Groq LLM when available
 * with strict grounded context (anti-hallucination) and falls back to rich,
 * interactive deterministic cards with deep links when offline or unconfigured.
 */

import { callGroq } from '../../../portal-maestros/services/groqService.js'

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function norm(s) {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/**
 * Builds deterministic rich HTML responses for common director inquiries.
 * @param {string} query
 * @param {object} context
 * @returns {string}
 */
export function buildDeterministicResponse(query, context) {
  const q = norm(query)
  const ctx = context || {}
  const { tareas = {}, atencionInmediata = [], porDepartamento = [], procedimientos = [] } = ctx

  // 1) Atención Inmediata / Bloqueos / Riesgos
  if (/(atencion|inmediat|urgent|bloque|critic|riesgo|priorid|trabad|estancad)/.test(q)) {
    if (atencionInmediata.length === 0) {
      return `
        <div class="hermes-card hermes-card-success">
          <div class="hermes-card-header">
            <i class="bi bi-shield-check text-success fs-5"></i>
            <span class="fw-bold">Operación Despejada</span>
          </div>
          <p class="mb-0">No se registran tareas bloqueadas ni incidencias críticas abiertas en ningún departamento.</p>
        </div>
      `
    }

    return `
      <div class="hermes-card hermes-card-warning">
        <div class="hermes-card-header">
          <i class="bi bi-exclamation-octagon-fill text-danger fs-5"></i>
          <span class="fw-bold">${atencionInmediata.length} Tarea(s) Requieren Atención Inmediata</span>
        </div>
        <p class="small text-muted mb-2">Cuellos de botella detectados en la operación institucional:</p>
        <div class="hermes-items-list">
          ${atencionInmediata.map((t) => `
            <div class="hermes-item-row">
              <div class="d-flex align-items-center gap-2">
                <span class="badge ${t.estado === 'bloqueada' ? 'bg-danger' : 'bg-warning text-dark'}">${esc(t.estado.toUpperCase())}</span>
                <strong>${esc(t.deptoNombre)}</strong>: ${esc(t.titulo)}
              </div>
              <div class="mt-2 d-flex gap-2">
                ${t.caso_id ? `<button type="button" class="btn btn-xs btn-outline-primary hermes-deep-link" data-route="hermes-caso" data-param-id="${esc(t.caso_id)}"><i class="bi bi-folder2-open"></i> Ver Caso</button>` : ''}
                <button type="button" class="btn btn-xs btn-outline-secondary hermes-deep-link" data-route="hermes-tareas" data-param-depto="${esc(t.departamento)}"><i class="bi bi-list-task"></i> Bandeja Depto</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  // 2) Consultas por Departamento Específico
  const deptMatch = porDepartamento.find((d) => q.includes(norm(d.codigo)) || q.includes(norm(d.nombre)))
  if (deptMatch) {
    return `
      <div class="hermes-card">
        <div class="hermes-card-header">
          <i class="bi bi-building text-primary fs-5"></i>
          <span class="fw-bold">Estado del Departamento: ${esc(deptMatch.nombre)} (${esc(deptMatch.codigo)})</span>
        </div>
        <div class="hermes-mini-stats mb-3">
          <div class="hermes-mini-stat">
            <span class="val text-primary">${deptMatch.total}</span>
            <span class="lbl">Total Tareas</span>
          </div>
          <div class="hermes-mini-stat">
            <span class="val ${deptMatch.bloqueadas > 0 ? 'text-danger' : 'text-success'}">${deptMatch.bloqueadas}</span>
            <span class="lbl">Bloqueadas</span>
          </div>
          <div class="hermes-mini-stat">
            <span class="val text-warning">${deptMatch.pendientes}</span>
            <span class="lbl">Pendientes</span>
          </div>
          <div class="hermes-mini-stat">
            <span class="val text-success">${deptMatch.completadas}</span>
            <span class="lbl">Completadas</span>
          </div>
        </div>
        <div class="progress mb-3" style="height: 8px;">
          <div class="progress-bar bg-success" role="progressbar" style="width: ${deptMatch.pctAvance}%" aria-valuenow="${deptMatch.pctAvance}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="small text-muted">Avance de ejecución: <strong>${deptMatch.pctAvance}%</strong></span>
          <button type="button" class="btn btn-sm btn-primary hermes-deep-link" data-route="hermes-tareas" data-param-depto="${esc(deptMatch.codigo)}">
            <i class="bi bi-arrow-right-circle"></i> Abrir Tareas de ${esc(deptMatch.codigo)}
          </button>
        </div>
      </div>
    `
  }

  // 3) Procedimiento específico o Avance de Procesos
  const palabras = q.split(/\s+/).filter((w) => w.length >= 4 &&
    !['como', 'va', 'van', 'esta', 'estan', 'sobre', 'para', 'proceso', 'procedimiento', 'caso', 'avance'].includes(w))

  if (/(como va|como van|proceso|procedimiento|caso|estado de|avance|etapa)/.test(q) && palabras.length > 0) {
    const matches = procedimientos.filter((p) => {
      const t = norm(p.titulo_muestra || p.nombre || '')
      return palabras.some((w) => t.includes(w))
    })

    if (matches.length > 0) {
      return `
        <div class="hermes-card">
          <div class="hermes-card-header">
            <i class="bi bi-diagram-3-fill text-primary fs-5"></i>
            <span class="fw-bold">Procedimientos Encontrados (${matches.length})</span>
          </div>
          <div class="hermes-items-list">
            ${matches.slice(0, 6).map((p) => `
              <div class="hermes-item-row">
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <strong>${esc(p.titulo_muestra || p.nombre)}</strong>
                  <span class="badge bg-primary">${p.pct_avance || 0}%</span>
                </div>
                <div class="progress mb-2" style="height: 6px;">
                  <div class="progress-bar bg-primary" role="progressbar" style="width: ${p.pct_avance || 0}%"></div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small text-muted">${p.completadas || 0} de ${p.total || 0} tareas completadas</span>
                  ${p.id || p.caso_id ? `<button type="button" class="btn btn-xs btn-outline-primary hermes-deep-link" data-route="hermes-caso" data-param-id="${esc(p.id || p.caso_id)}"><i class="bi bi-eye"></i> Ver Detalle</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `
    }
  }

  // 4) Cumplimiento de Maestros y Asistencias
  if (/(maestro|docent|profesor|asistencia|cumplimiento|clases)/.test(q)) {
    return `
      <div class="hermes-card">
        <div class="hermes-card-header">
          <i class="bi bi-person-check-fill text-primary fs-5"></i>
          <span class="fw-bold">Cumplimiento Docente y Control de Asistencia</span>
        </div>
        <p class="small text-muted mb-2">El módulo de cumplimiento analiza en tiempo real el registro oportuno de asistencias por parte de los maestros.</p>
        <div class="d-flex gap-2 flex-wrap mt-3">
          <button type="button" class="btn btn-sm btn-primary hermes-deep-link" data-route="admin-dashboard">
            <i class="bi bi-clipboard-check"></i> Ver Dashboard de Cumplimiento
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary hermes-deep-link" data-route="asistencias">
            <i class="bi bi-calendar-check"></i> Resumen de Asistencias
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary hermes-deep-link" data-route="maestros">
            <i class="bi bi-people"></i> Directorio de Maestros
          </button>
        </div>
      </div>
    `
  }

  // 5) Resumen General Ejecutivo (Default)
  const totalAbiertas = tareas.pendiente + tareas.en_progreso + tareas.bloqueada + tareas.observada
  const tasaExito = tareas.total > 0 ? Math.round((tareas.completada / tareas.total) * 100) : 100

  return `
    <div class="hermes-card">
      <div class="hermes-card-header">
        <i class="bi bi-speedometer2 text-primary fs-5"></i>
        <span class="fw-bold">Resumen Ejecutivo de Operaciones Institucionales</span>
      </div>
      <p class="small text-muted mb-3">Snapshot consolidado en tiempo real de todos los departamentos:</p>
      
      <div class="hermes-mini-stats mb-3">
        <div class="hermes-mini-stat">
          <span class="val text-primary">${context.totalProcedimientos || procedimientos.length}</span>
          <span class="lbl">Procedimientos</span>
        </div>
        <div class="hermes-mini-stat">
          <span class="val ${tareas.bloqueada > 0 ? 'text-danger fw-bold' : 'text-success'}">${tareas.bloqueada || 0}</span>
          <span class="lbl">Bloqueadas</span>
        </div>
        <div class="hermes-mini-stat">
          <span class="val text-warning">${totalAbiertas}</span>
          <span class="lbl">Abiertas</span>
        </div>
        <div class="hermes-mini-stat">
          <span class="val text-success">${tasaExito}%</span>
          <span class="lbl">Avance Global</span>
        </div>
      </div>

      <div class="hermes-actions-panel mt-3 pt-2 border-top">
        <span class="small fw-semibold text-muted d-block mb-2">Accesos directos recomendados:</span>
        <div class="d-flex gap-2 flex-wrap">
          <button type="button" class="btn btn-xs btn-outline-primary hermes-deep-link" data-route="hermes-procedimientos"><i class="bi bi-diagram-3"></i> Procedimientos</button>
          <button type="button" class="btn btn-xs btn-outline-primary hermes-deep-link" data-route="hermes-tareas"><i class="bi bi-check2-square"></i> Tareas Institucionales</button>
          <button type="button" class="btn btn-xs btn-outline-primary hermes-deep-link" data-route="dir-score"><i class="bi bi-bullseye"></i> Score Director</button>
        </div>
      </div>
    </div>
  `
}

/**
 * Executes a natural language query against Hermes.
 * Uses Groq when available, with deterministic fallback.
 * @param {string} query
 * @param {object} context
 * @returns {Promise<string>} HTML formatted response
 */
export async function queryHermes(query, context) {
  const q = String(query || '').trim()
  if (!q) return '<p class="text-muted">Por favor escribe una consulta.</p>'

  try {
    const systemPrompt = `Eres Hermes, el Asistente Ejecutivo y Director de Operaciones (COO) del Sistema Operativo Institucional (SOI).
Tu rol es responder a la Directiva de forma FACTUAL, CONCISA, ESTRATÉGICA y ALTAMENTE ACCIONABLE.
ESTÁ ESTRICTAMENTE PROHIBIDO inventar datos. Basa tus respuestas exclusivamente en el siguiente estado real:

ESTADO INSTITUCIONAL ACTUAL:
- Procedimientos activos: ${context.totalProcedimientos}
- Tareas totales: ${context.tareas?.total || 0} (Abiertas: ${(context.tareas?.pendiente || 0) + (context.tareas?.en_progreso || 0) + (context.tareas?.bloqueada || 0)}, Completadas: ${context.tareas?.completada || 0}, Bloqueadas: ${context.tareas?.bloqueada || 0})
- Tareas críticas que requieren atención: ${JSON.stringify(context.atencionInmediata || [])}
- Desglose por Departamento: ${JSON.stringify(context.porDepartamento || [])}

INSTRUCCIONES DE FORMATO:
1. Responde en español directo y ejecutivo.
2. Si hay tareas bloqueadas o riesgos, indícalas claramente con el departamento responsable.
3. Si el usuario pregunta cómo resolver algo, sugiere acciones ejecutivas concretas.
4. Mantén la respuesta en 2 a 4 párrafos o listas limpias. No uses introducciones vacías como "Hola, como asistente...".`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: q },
    ]

    const aiText = await callGroq(messages, { temperature: 0.1, max_tokens: 700 })
    if (aiText && aiText.trim().length > 10) {
      // Format simple markdown into HTML
      const formatted = aiText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- (.*?)/g, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul class="mb-2 mt-1">$1</ul>')

      return `<div class="hermes-ai-response"><p>${formatted}</p></div>`
    }
  } catch (err) {
    // Silent fallback to deterministic engine
    console.debug('[HermesQueryEngine] Usando motor determinístico de respaldo:', err?.message || err)
  }

  return buildDeterministicResponse(q, context)
}
