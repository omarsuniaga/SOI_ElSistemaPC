import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { formatPhone } from '../../shared/utils/phoneUtils.js'
import { PlanEstudiosPanel } from '../components/PlanEstudiosPanel.js'
import { AppToast } from '../../shared/components/AppToast.js'


/**
 * Formatea un número de teléfono para usar en wa.me (formato internacional sin +)
 * Maneja números dominicanos (809/829/849) agregando el código de país 1.
 */
function formatPhoneForWA(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10 && /^(809|829|849)/.test(digits)) return '1' + digits
  if (digits.length === 11 && digits.startsWith('1')) return digits
  if (digits.length >= 10) return digits
  return null
}

// ─── Gestión de plantillas WhatsApp ────────────────────────────────────────
const WA_TEMPLATES_KEY = id => `soi_wa_templates_${id}`

const DEFAULT_TEMPLATES = [
  { id: 'tpl-1', label: '📋 Asistencia',   text: 'Hola Saludos, le escribo de "El Sistema Punta Cana" para informarle sobre las asistencias de clases de {alumno}. Por favor comuníquese con nosotros para más detalles.' },
  { id: 'tpl-2', label: '📝 Evaluación',   text: 'Hola Saludos, le informamos que {alumno} tiene evaluaciones recientes disponibles para revisión. Puede consultar su progreso con nosotros.' },
  { id: 'tpl-3', label: '📅 Recordatorio', text: 'Hola Saludos, le recordamos que {alumno} tiene clase próximamente. Cualquier ausencia debe ser justificada con anticipación.' },
  { id: 'tpl-4', label: '🤝 Reunión',      text: 'Hola Saludos, me gustaría coordinar una reunión para conversar sobre el progreso de {alumno}. ¿Cuándo le viene bien?' },
]

function waLoadTemplates(maestroId) {
  try {
    const raw = localStorage.getItem(WA_TEMPLATES_KEY(maestroId))
    return raw ? JSON.parse(raw) : DEFAULT_TEMPLATES.map(t => ({ ...t }))
  } catch { return DEFAULT_TEMPLATES.map(t => ({ ...t })) }
}

function waSaveTemplates(maestroId, templates) {
  localStorage.setItem(WA_TEMPLATES_KEY(maestroId), JSON.stringify(templates))
}

function waApplyVars(text, { alumno, contacto }) {
  return text.replace(/\{alumno\}/g, alumno).replace(/\{contacto\}/g, contacto)
}
// ───────────────────────────────────────────────────────────────────────────

/**
 * Converts contenido_dsl to readable plain text.
 * Strips DSL bracket markers like [tipo:valor] or [bloque] → readable label.
 */
function parseDslToText(dsl) {
  if (!dsl) return ''
  return dsl
    // Remove bracket-wrapped labels like [Objetivo:], [Actividad:], etc. and keep the value
    .replace(/\[([^\]]+)\]/g, (_, inner) => {
      // If it contains a colon, treat as label:value → "Label: value"
      const colonIdx = inner.indexOf(':')
      if (colonIdx > 0) {
        const label = inner.slice(0, colonIdx).trim()
        const value = inner.slice(colonIdx + 1).trim()
        return value ? `${label}: ${value}` : label
      }
      return inner.trim()
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── Estado config ────────────────────────────────────────────────────────────
const ESTADO_CFG = {
  LOGRADO:     { label: 'Logrado',     color: '#198754', bg: '#19875418', icon: '✅' },
  EN_PROGRESO: { label: 'En progreso', color: '#0d6efd', bg: '#0d6efd18', icon: '📈' },
  INICIADO:    { label: 'Iniciado',    color: '#6c757d', bg: '#6c757d18', icon: '🔰' },
  DIFICULTAD:  { label: 'Dificultad',  color: '#dc3545', bg: '#dc354518', icon: '⚠️' },
}

/**
 * Renders the AI-generated progress history from the `progresos` table.
 * Groups records by contenido_dsl and shows a chronological timeline per content.
 */
async function _renderProgresos(container, alumnoId, offset = 0) {
  const root = container.querySelector('#pm-alumno-progresos-root')
  if (!root) return

  const isFirstPage = offset === 0
  if (isFirstPage) {
    root.innerHTML = '<div class="pm-loading-zen"><div class="pm-pulse"></div></div>'
  }

  try {
    const { data: rows, error } = await supabase
      .from('progresos')
      .select('id, contenido_dsl, estado_cualitativo, calificacion, observaciones, fecha_evaluacion, clase_id, indicadores')
      .eq('alumno_id', alumnoId)
      .not('contenido_dsl', 'is', null)
      .neq('contenido_dsl', '')
      .order('fecha_evaluacion', { ascending: false })
      .range(offset, offset + 19)

    if (error) throw error

    if (!rows || rows.length === 0) {
      if (isFirstPage) {
        root.innerHTML = `<p style="font-size:0.82rem;color:var(--pm-text-muted);text-align:center;padding:1rem 0;">Sin registros de progreso generados por IA aún.</p>`
      }
      return
    }

    // Fetch class names in one query
    const claseIds = [...new Set(rows.map(r => r.clase_id).filter(Boolean))]
    const { data: clasesData } = claseIds.length
      ? await supabase.from('clases').select('id, nombre').in('id', claseIds)
      : { data: [] }
    const claseMap = new Map((clasesData || []).map(c => [c.id, c.nombre]))

    // Group by contenido_dsl — one card per unique content, timeline inside
    const byContent = new Map()
    for (const row of rows) {
      const key = row.contenido_dsl
      if (!byContent.has(key)) {
        byContent.set(key, { contenido: key, entries: [] })
      }
      byContent.get(key).entries.push(row)
    }

    const contents = Array.from(byContent.values())

    const cardsHTML = contents.map(({ contenido, entries }) => {
      const latest     = entries[0]
      const cfg        = ESTADO_CFG[latest.estado_cualitativo] ?? ESTADO_CFG.EN_PROGRESO
      const lastFecha  = new Date(latest.fecha_evaluacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })
      return `
        <details class="pm-prog-card">
          <summary class="pm-prog-card__summary">
            <span class="pm-prog-card__icon" style="color:${cfg.color}">${cfg.icon}</span>
            <div class="pm-prog-card__info">
              <span class="pm-prog-card__name">${escHTML(contenido)}</span>
              <span class="pm-prog-card__meta">${entries.length} registro${entries.length !== 1 ? 's' : ''} · último: ${lastFecha}</span>
            </div>
            <span class="pm-prog-card__badge" style="color:${cfg.color};background:${cfg.bg}">${cfg.label}</span>
            <i class="bi bi-chevron-down pm-prog-card__chevron"></i>
          </summary>
          <div class="pm-prog-card__timeline">
            ${entries.map(e => {
              const eCfg    = ESTADO_CFG[e.estado_cualitativo] ?? ESTADO_CFG.EN_PROGRESO
              const fecha   = new Date(e.fecha_evaluacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
              const clase   = claseMap.get(e.clase_id) || 'Clase'
              const tarea   = e.indicadores?.tarea
              const nota    = e.calificacion != null ? `${e.calificacion}/5` : null
              return `
                <div class="pm-prog-entry">
                  <div class="pm-prog-entry__dot" style="background:${eCfg.color}"></div>
                  <div class="pm-prog-entry__body">
                    <div class="pm-prog-entry__header">
                      <span class="pm-prog-entry__fecha">${fecha}</span>
                      <span class="pm-prog-entry__clase">${escHTML(clase)}</span>
                      ${nota ? `<span class="pm-prog-entry__nota" style="color:${eCfg.color}">${nota}</span>` : ''}
                    </div>
                    <span class="pm-prog-entry__estado" style="color:${eCfg.color}">${eCfg.icon} ${eCfg.label}</span>
                    ${e.observaciones ? `<p class="pm-prog-entry__obs">${escHTML(e.observaciones)}</p>` : ''}
                    ${tarea ? `<p class="pm-prog-entry__tarea">📋 ${escHTML(tarea)}</p>` : ''}
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </details>
      `
    }).join('')

    if (isFirstPage) {
      root.innerHTML = `
        <div class="pm-prog-list">
          ${cardsHTML}
        </div>
        <style>
          .pm-prog-list { display: flex; flex-direction: column; gap: 0.5rem; }
          .pm-prog-card {
            border: 1px solid var(--pm-border);
            border-radius: 10px;
            overflow: hidden;
            background: var(--pm-surface-2);
          }
          .pm-prog-card__summary {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.65rem 0.75rem;
            cursor: pointer;
            list-style: none;
            user-select: none;
          }
          .pm-prog-card__summary::-webkit-details-marker { display: none; }
          .pm-prog-card__icon { font-size: 1.1rem; flex-shrink: 0; }
          .pm-prog-card__info { flex: 1; min-width: 0; }
          .pm-prog-card__name {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--pm-text);
          }
          .pm-prog-card__meta {
            display: block;
            font-size: 0.68rem;
            color: var(--pm-text-muted);
            margin-top: 1px;
          }
          .pm-prog-card__badge {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 99px;
            flex-shrink: 0;
          }
          .pm-prog-card__chevron {
            font-size: 0.75rem;
            color: var(--pm-text-muted);
            transition: transform 0.2s;
            flex-shrink: 0;
          }
          details[open] .pm-prog-card__chevron { transform: rotate(180deg); }
          .pm-prog-card__timeline {
            border-top: 1px solid var(--pm-border);
            padding: 0.5rem 0.75rem 0.5rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0;
            position: relative;
          }
          .pm-prog-card__timeline::before {
            content: '';
            position: absolute;
            left: 1.15rem;
            top: 0.75rem;
            bottom: 0.75rem;
            width: 2px;
            background: var(--pm-border);
            border-radius: 1px;
          }
          .pm-prog-entry {
            display: flex;
            gap: 0.75rem;
            padding: 0.4rem 0;
            position: relative;
          }
          .pm-prog-entry__dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 4px;
            border: 2px solid var(--pm-surface-2);
            position: relative;
            z-index: 1;
          }
          .pm-prog-entry__body { flex: 1; }
          .pm-prog-entry__header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 0.1rem;
          }
          .pm-prog-entry__fecha { font-size: 0.72rem; color: var(--pm-text-muted); font-weight: 600; }
          .pm-prog-entry__clase {
            font-size: 0.68rem;
            color: var(--pm-text-muted);
            background: var(--pm-surface);
            padding: 1px 6px;
            border-radius: 4px;
          }
          .pm-prog-entry__nota { font-size: 0.72rem; font-weight: 700; margin-left: auto; }
          .pm-prog-entry__estado { font-size: 0.72rem; font-weight: 600; }
          .pm-prog-entry__obs {
            font-size: 0.78rem;
            color: var(--pm-text);
            margin: 0.15rem 0 0;
            line-height: 1.45;
            font-style: italic;
          }
          .pm-prog-entry__tarea {
            font-size: 0.72rem;
            color: var(--pm-text-muted);
            margin: 0.1rem 0 0;
          }
        </style>
      `
    } else {
      const listDiv = root.querySelector('.pm-prog-list')
      if (listDiv) {
        const tmp = document.createElement('div')
        tmp.innerHTML = cardsHTML
        listDiv.append(...tmp.children)
      }
    }

    if (rows && rows.length === 20) {
      const loadMoreBtn = document.createElement('button')
      loadMoreBtn.className = 'pm-btn pm-btn-outline'
      loadMoreBtn.style.cssText = 'display:block;margin:0.75rem auto 0;font-size:0.82rem;'
      loadMoreBtn.textContent = 'Cargar más'
      loadMoreBtn.onclick = () => {
        loadMoreBtn.remove()
        _renderProgresos(container, alumnoId, offset + 20)
      }
      root.appendChild(loadMoreBtn)
    }

  } catch (err) {
    if (isFirstPage) {
      root.innerHTML = `<p style="color:var(--pm-danger);font-size:0.82rem;">Error al cargar historial: ${escHTML(err.message)}</p>`
    } else {
      console.error('[_renderProgresos] Error loading page:', err)
      if (typeof AppToast !== 'undefined' && AppToast) {
        AppToast.error('Error al cargar más registros: ' + err.message)
      }
    }
  }
}

async function _renderEvaluaciones(container, alumnoId) {
  const root = container.querySelector('#pm-alumno-progreso-root')
  if (!root) return

  try {
    // Traer intentos del alumno, sin join a nodes (evita duplicados del inner join)
    const { data: evaluaciones, error } = await supabase
      .from('indicator_attempts')
      .select('id, nota, observations, tarea, created_at, indicator_id, covered_by_clase_id')
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

    // Obtener nombres de clases correspondientes
    const claseIds = [...new Set(evaluaciones.map(e => e.covered_by_clase_id).filter(Boolean))]
    const { data: clasesMeta } = claseIds.length > 0
      ? await supabase.from('clases').select('id, nombre').in('id', claseIds)
      : { data: [] }
    const claseMapName = new Map((clasesMeta || []).map(c => [c.id, c.nombre]))

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
        claseNombre: claseMapName.get(ev.covered_by_clase_id) || '',
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
      <style>
        .pm-eval-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .pm-eval-progress-label {
          font-size: 0.78rem;
          color: var(--pm-text-muted);
          font-weight: 500;
        }
        .pm-eval-progress-pct {
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1;
        }
        .pm-eval-progress-sub {
          font-size: 0.72rem;
          color: var(--pm-text-muted);
          margin: 0.35rem 0 1rem;
        }
        .pm-eval-indicadores {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .pm-eval-indicador {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--pm-border);
          cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .pm-eval-indicador:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .pm-eval-indicador--green { border-left: 4px solid var(--pm-success); }
        .pm-eval-indicador--yellow { border-left: 4px solid var(--pm-warning); }
        .pm-eval-indicador--red { border-left: 4px solid var(--pm-danger); }
        .pm-eval-indicador--gray { border-left: 4px solid var(--pm-border); }
        .pm-eval-indicador-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.75rem;
          background: var(--pm-surface-2);
        }
        .pm-eval-semaforo { font-size: 1rem; flex-shrink: 0; }
        .pm-eval-info { flex: 1; min-width: 0; }
        .pm-eval-nombre {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--pm-text);
        }
        .pm-eval-node {
          display: block;
          font-size: 0.68rem;
          color: var(--pm-text-muted);
          margin-top: 1px;
        }
        .pm-eval-nota {
          font-size: 1.05rem;
          font-weight: 700;
          flex-shrink: 0;
          min-width: 1.5rem;
          text-align: right;
        }
        .pm-eval-toggle { font-size: 0.75rem; color: var(--pm-text-muted); flex-shrink: 0; }
        .pm-eval-timeline {
          background: var(--pm-surface);
          border-top: 1px solid var(--pm-border);
        }
        .pm-eval-entry {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid var(--pm-border);
        }
        .pm-eval-entry:last-child { border-bottom: none; }
        .pm-eval-entry-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--pm-text-muted);
          margin-bottom: 0.2rem;
        }
        .pm-eval-entry-obs {
          font-size: 0.8rem;
          margin: 0.2rem 0 0;
          color: var(--pm-text);
          line-height: 1.45;
        }
        .pm-eval-entry-tarea {
          font-size: 0.73rem;
          color: var(--pm-text-muted);
          margin: 0.15rem 0 0;
        }
      </style>

      <div class="pm-eval-progress-header">
        <span class="pm-eval-progress-label">🎯 Progreso académico</span>
        <span class="pm-eval-progress-pct" style="color:${avance >= 70 ? 'var(--pm-success)' : avance >= 40 ? 'var(--pm-warning)' : 'var(--pm-danger)'}">${avance}%</span>
      </div>
      <div class="pm-student-panel__progress-bar" style="height:6px;border-radius:3px;background:var(--pm-border);">
        <div class="pm-student-panel__progress-fill" style="width:${avance}%;height:100%;border-radius:3px;background:${avance >= 70 ? 'var(--pm-success)' : avance >= 40 ? 'var(--pm-warning)' : 'var(--pm-danger)'};"></div>
      </div>
      <p class="pm-eval-progress-sub">${aprobados} de ${indicators.length} indicadores aprobados</p>

      <div class="pm-eval-indicadores">
        ${indicators.length === 0
          ? `<p style="font-size:0.82rem;color:var(--pm-text-muted);text-align:center;padding:1rem 0;">Sin indicadores evaluados aún</p>`
          : indicators.map(ind => {
            const notaColor = ind.latest.nota >= 4 ? 'var(--pm-success)' : ind.latest.nota >= 2 ? 'var(--pm-warning)' : 'var(--pm-danger)'
            return `
              <div class="pm-eval-indicador ${semaforoClass(ind.latest.nota)}" data-ind-id="${ind.id}">
                <div class="pm-eval-indicador-header">
                  <span class="pm-eval-semaforo">${semaforo(ind.latest.nota)}</span>
                  <div class="pm-eval-info">
                    <span class="pm-eval-nombre">${escHTML(ind.nombre || 'Indicador')}</span>
                    <span class="pm-eval-node">
                      ${escHTML(ind.nodeName || 'Tema')}
                      ${ind.claseNombre ? ` • <span style="background:var(--pm-surface-3);color:var(--pm-text-muted);font-size:0.6rem;padding:2px 6px;border-radius:10px;font-weight:600;border:1px solid var(--pm-border);">${escHTML(ind.claseNombre)}</span>` : ''}
                    </span>
                  </div>
                  <span class="pm-eval-nota" style="color:${ind.latest.nota != null ? notaColor : 'var(--pm-text-muted)'}">${ind.latest.nota ?? '—'}</span>
                  <i class="bi bi-chevron-down pm-eval-toggle"></i>
                </div>
                <div class="pm-eval-timeline" style="display:none;">
                  ${ind.history.map(ev => `
                    <div class="pm-eval-entry">
                      <div class="pm-eval-entry-meta">
                        <span>${new Date(ev.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <strong style="color:${ev.nota != null ? notaColor : 'inherit'}">${semaforo(ev.nota)} ${ev.nota ?? '—'}</strong>
                      </div>
                      ${ev.observations ? `<p class="pm-eval-entry-obs">${escHTML(ev.observations)}</p>` : ''}
                      ${ev.tarea ? `<p class="pm-eval-entry-tarea">📋 ${escHTML(ev.tarea)}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          }).join('')
        }
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
      .select('id, nombre_completo, instrumento_principal, tlf_alumno, fecha_nacimiento, created_at, nivel_actual, representante_nombre, representante_tlf, correo_representante, direccion')
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

    // Obtener IDs de clases inscritas (sin join — evita bloqueo RLS en clases)
    const { data: inscripcionesRaw } = await supabase
      .from('alumnos_clases')
      .select('clase_id')
      .eq('alumno_id', alumnoId)
      .eq('activo', true)
    const inscritaIds = (inscripcionesRaw || []).map(r => r.clase_id).filter(Boolean)

    // Los datos de asistencia viven en el JSONB asistencia[] de sesiones_clase
    // estados: 'P' | 'A' | 'J' | 'T'
    const { data: sesiones } = await supabase
      .from('sesiones_clase')
      .select('id, clase_id, fecha, contenido_dsl, asistencia')
      .filter('asistencia', 'cs', JSON.stringify([{ alumno_id: alumnoId }]))
      .order('fecha', { ascending: false })
      .limit(60)

    // Aplanar a filas simples y extraer el registro del alumno de cada sesión
    const asistenciaRows = (sesiones || []).map(s => {
      const reg = s.asistencia?.find(a => a.alumno_id === alumnoId)
      return reg ? {
        fecha:         s.fecha,
        estado:        reg.estado,          // 'P' | 'A' | 'J' | 'T'
        clase_id:      s.clase_id,
        sesion_id:     s.id,
        contenido_dsl: s.contenido_dsl,
        observaciones: reg.observaciones || null
      } : null
    }).filter(Boolean)

    // Mapa de contenido DSL por sesión (ya está en asistenciaRows)
    const sesionDslMap = new Map(asistenciaRows.map(r => [r.sesion_id, r.contenido_dsl]))

    // Obtener todas las evaluaciones del alumno
    const { data: evaluaciones } = await supabase
      .from('indicator_attempts')
      .select('id, nota, observations, tarea, created_at, indicator_id, covered_by_clase_id')
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

    // Obtener justificaciones del alumno (para mostrar motivo en historial)
    const { data: justificaciones } = await supabase
      .from('justificaciones')
      .select('sesion_id, motivo, evidencia_url, estado, fecha')
      .eq('alumno_id', alumnoId)
      .order('fecha', { ascending: false })
    const justifMap = new Map((justificaciones || []).map(j => [j.sesion_id, j]))

    // Estados directos del JSONB: 'P' | 'A' | 'J' | 'T'
    const totalSesiones = asistenciaRows.length
    const presentes  = asistenciaRows.filter(r => r.estado === 'P').length
    const ausentes   = asistenciaRows.filter(r => r.estado === 'A').length
    const justifica  = asistenciaRows.filter(r => r.estado === 'J').length
    const tardanzas  = asistenciaRows.filter(r => r.estado === 'T').length
    const pctAsistencia = totalSesiones > 0 ? Math.round((presentes / totalSesiones) * 100) : 0

    // Calcular estadísticas de rendimiento (notas)
    const notasValidas = evaluaciones?.filter(e => e.nota != null && e.nota !== 0) || []
    
    // Agrupar notas por clase
    const notasPorClase = {}
    notasValidas.forEach(e => {
      const claseId = e.covered_by_clase_id || 'sin_clase'
      if (!notasPorClase[claseId]) notasPorClase[claseId] = []
      notasPorClase[claseId].push(e.nota)
    })

    // Calcular el promedio de cada clase
    const promediosClases = Object.values(notasPorClase).map(notas => {
      const sum = notas.reduce((acc, n) => acc + n, 0)
      return sum / notas.length
    })

    // El promedio general es el promedio de los promedios de las clases (weighted class average)
    const promedioNotas = promediosClases.length > 0
      ? Math.round((promediosClases.reduce((acc, p) => acc + p, 0) / promediosClases.length) * 10) / 10
      : 0

    const indicadoresAprobados = notasValidas.filter(e => e.nota >= 4).length
    const indicadoresTotales   = notasValidas.length
    const pctAprobacion = indicadoresTotales > 0 ? Math.round((indicadoresAprobados / indicadoresTotales) * 100) : 0

    // Agrupar por clase
    const sesionesPorClase = {}
    asistenciaRows.forEach(r => {
      if (!sesionesPorClase[r.clase_id]) sesionesPorClase[r.clase_id] = { P: 0, A: 0, J: 0, T: 0, total: 0 }
      if (r.estado) {
        sesionesPorClase[r.clase_id][r.estado] = (sesionesPorClase[r.clase_id][r.estado] || 0) + 1
        sesionesPorClase[r.clase_id].total++
      }
    })

    // Construir mapa de clases (unión de inscritas + con registro de asistencia)
    const claseIdSet = new Set([
      ...inscritaIds,
      ...Object.keys(sesionesPorClase)
    ])
    const { data: clasesInfo } = claseIdSet.size > 0
      ? await supabase.from('clases').select('id, nombre, instrumento, nivel').in('id', [...claseIdSet])
      : { data: [] }
    const claseMap = new Map((clasesInfo || []).map(c => [c.id, c]))

    // Sesiones donde estuvo presente y hay contenido DSL
    const sesionesPresentes = asistenciaRows.filter(r =>
      r.estado === 'P' && r.contenido_dsl?.trim()
    )

    // Evaluaciones que tienen observaciones del maestro
    const conObservaciones = evaluaciones?.filter(e => e.observations?.trim()) || []

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
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <span class="pm-zen-card__label" style="font-size:0.78rem;font-weight:500;">📈 Rendimiento Académico</span>
                ${indicadoresTotales > 0
                  ? `<span style="font-size:1.4rem;font-weight:700;line-height:1;color:${promedioNotas >= 4 ? 'var(--pm-success)' : promedioNotas >= 2 ? 'var(--pm-warning)' : 'var(--pm-danger)'}">${promedioNotas.toFixed(1)}</span>`
                  : `<span style="font-size:0.8rem;color:var(--pm-text-muted);">Sin datos</span>`
                }
              </div>
              ${indicadoresTotales > 0 ? `
              <div class="pm-student-panel__progress-bar" style="height:6px;border-radius:3px;background:var(--pm-border);">
                <div style="width:${pctAprobacion}%;background:${promedioNotas >= 4 ? 'var(--pm-success)' : promedioNotas >= 2 ? 'var(--pm-warning)' : 'var(--pm-danger)'};height:100%;border-radius:3px;"></div>
              </div>
              <p style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.4rem;">
                ${indicadoresAprobados} de ${indicadoresTotales} indicadores aprobados · ${pctAprobacion}%
              </p>` : `<p style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.25rem;">Aún no hay evaluaciones registradas</p>`}
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">✅ Asistencia</span>
              ${totalSesiones > 0
                ? `<div style="display:flex;align-items:baseline;gap:0.25rem;">
                     <span class="pm-zen-card__value" style="font-size:1.8rem;color:${pctAsistencia >= 75 ? 'var(--pm-success)' : pctAsistencia >= 50 ? 'var(--pm-warning)' : 'var(--pm-danger)'};line-height:1;">${presentes}</span>
                     <span style="font-size:1rem;color:var(--pm-text-muted);font-weight:500;">/ ${totalSesiones}</span>
                   </div>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;margin-top:2px;">
                     ${pctAsistencia}% asistencia
                     ${ausentes > 0 ? `· <span style="color:var(--pm-danger)">${ausentes} ausente${ausentes > 1 ? 's' : ''}</span>` : ''}
                     ${justifica > 0 ? `· <span style="color:var(--pm-warning)">${justifica} justif.</span>` : ''}
                     ${tardanzas > 0 ? `· <span style="color:#FF9500">${tardanzas} tarde${tardanzas > 1 ? 's' : ''}</span>` : ''}
                   </p>`
                : `<span class="pm-zen-card__value" style="font-size:1.1rem;color:var(--pm-text-muted);">Sin clases</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">No hay sesiones registradas</p>`
              }
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">📅 Clases Activas</span>
              ${inscritaIds.length > 0
                ? `<span class="pm-zen-card__value" style="font-size:1.8rem;">${inscritaIds.length}</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">Materias inscritas</p>`
                : `<span class="pm-zen-card__value" style="font-size:1.1rem;color:var(--pm-text-muted);">Sin inscripción</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">No está en ninguna clase activa</p>`
              }
            </div>
          </div>

          <!-- 🎵 Clases Inscritas -->
          ${inscritaIds.length > 0 ? `
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🎵 Clases Inscritas</h3>
            <div class="pm-zen-clases-grid">
              ${inscritaIds.map(claseId => {
                const clase = claseMap.get(claseId)
                if (!clase) return ''
                const stats = sesionesPorClase[claseId] || { P: 0, A: 0, J: 0, T: 0, total: 0 }
                const pctClase = stats.total > 0 ? Math.round((stats.P / stats.total) * 100) : null
                
                // Calcular promedio específico para esta clase
                const claseEvaluaciones = evaluaciones?.filter(ev => ev.covered_by_clase_id === claseId && ev.nota != null && ev.nota !== 0) || []
                const classPromedio = claseEvaluaciones.length > 0
                  ? Math.round(claseEvaluaciones.reduce((sum, ev) => sum + ev.nota, 0) / claseEvaluaciones.length * 10) / 10
                  : null

                return `
                  <div class="pm-zen-clase-card pm-glass">
                    <div class="pm-zen-clase-header">
                      <strong>${escHTML(clase.nombre)}</strong>
                      ${clase.nivel ? `<span class="pm-zen-clase-nivel">Nivel ${clase.nivel}</span>` : ''}
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <p class="pm-zen-clase-inst" style="margin:0;">${escHTML(clase.instrumento || '')}</p>
                      ${classPromedio !== null ? `
                        <span class="badge-apple" style="background:${classPromedio >= 4.0 ? 'rgba(52, 199, 89, 0.12)' : classPromedio >= 3.0 ? 'rgba(255, 149, 0, 0.12)' : 'rgba(255, 59, 48, 0.12)'}; color:${classPromedio >= 4.0 ? 'rgb(36, 172, 69)' : classPromedio >= 3.0 ? 'rgb(229, 134, 0)' : 'rgb(221, 35, 29)'}; font-size:0.7rem; font-weight:700; padding:2px 6px; border-radius:10px; display:inline-flex; align-items:center; gap:2px;">
                          ⭐ ${classPromedio.toFixed(1)}
                        </span>
                      ` : `
                        <span class="badge-apple" style="background:var(--pm-surface-3); color:var(--pm-text-muted); font-size:0.65rem; padding:2px 6px; border-radius:10px;">Sin notas</span>
                      `}
                    </div>
                    <div class="pm-zen-clase-stats">
                      <div class="pm-zen-clase-stat" style="flex:1.2;">
                        <div style="display:flex;align-items:baseline;gap:3px;">
                          <span class="pm-zen-stat-value" style="color:${pctClase === null ? 'var(--pm-text-muted)' : pctClase >= 75 ? 'var(--pm-success)' : pctClase >= 50 ? 'var(--pm-warning)' : 'var(--pm-danger)'};">${stats.P}</span>
                          <span style="font-size:0.7rem;color:var(--pm-text-muted);">/ ${stats.total || '—'}</span>
                        </div>
                        <span class="pm-zen-stat-label">${pctClase !== null ? pctClase + '%' : 'Sin datos'}</span>
                      </div>
                      ${stats.A > 0 ? `<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-danger);">${stats.A}</span>
                        <span class="pm-zen-stat-label">Ausente${stats.A > 1 ? 's' : ''}</span>
                      </div>` : ''}
                      ${stats.J > 0 ? `<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-warning);">${stats.J}</span>
                        <span class="pm-zen-stat-label">Justif.</span>
                      </div>` : ''}
                      ${stats.T > 0 ? `<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:#FF9500;">${stats.T}</span>
                        <span class="pm-zen-stat-label">Tarde${stats.T > 1 ? 's' : ''}</span>
                      </div>` : ''}
                      ${stats.total === 0 ? `<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-text-muted);">—</span>
                        <span class="pm-zen-stat-label">Sin registros</span>
                      </div>` : ''}
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          </div>
          ` : ''}

          <!-- 📖 Bitácora de Clases -->
          ${sesionesPresentes.length > 0 ? `
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📖 Bitácora de Clases</h3>
            <div class="pm-zen-bitacora">
              ${sesionesPresentes.map(r => {
                const clase = claseMap.get(r.clase_id)
                const contenido = parseDslToText(r.contenido_dsl)
                return `
                  <div class="pm-zen-bitacora-item pm-glass">
                    <div class="pm-zen-bitacora-header">
                      <span class="pm-zen-bitacora-clase">${escHTML(clase?.nombre || 'Clase')}</span>
                      <span class="pm-zen-bitacora-fecha">${new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </div>
                    <p class="pm-zen-bitacora-contenido">${escHTML(contenido)}</p>
                  </div>
                `
              }).join('')}
            </div>
          </div>
          ` : ''}

          <!-- 📝 Últimas Evaluaciones -->
          ${notasValidas.length > 0 ? `
          <details class="pm-zen-section pm-zen-accordion">
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">📝 Últimas Evaluaciones</span>
              <span class="pm-zen-accordion-meta">${notasValidas.length} registro${notasValidas.length !== 1 ? 's' : ''}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-evaluaciones" style="margin-top:0.75rem;">
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
          </details>
          ` : ''}

          <!-- 💬 Desenvolvimiento del Alumno -->
          ${conObservaciones.length > 0 ? `
          <details class="pm-zen-section pm-zen-accordion">
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">💬 Desenvolvimiento</span>
              <span class="pm-zen-accordion-meta">${conObservaciones.length} observación${conObservaciones.length !== 1 ? 'es' : ''}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-desenvolvimiento" style="margin-top:0.75rem;">
              ${conObservaciones.map(ev => {
                const notaColor = ev.nota >= 4 ? 'var(--pm-success)' : ev.nota >= 2 ? 'var(--pm-warning)' : 'var(--pm-danger)'
                return `
                  <div class="pm-zen-desenv-item">
                    <div class="pm-zen-desenv-dot" style="background:${ev.nota != null ? notaColor : 'var(--pm-primary)'}"></div>
                    <div class="pm-zen-desenv-content">
                      <div class="pm-zen-desenv-header">
                        <span class="pm-zen-desenv-fecha">${new Date(ev.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        ${ev.nota != null ? `<span class="pm-zen-desenv-nota" style="color:${notaColor};">Nota: ${ev.nota}</span>` : ''}
                      </div>
                      <p class="pm-zen-desenv-obs">${escHTML(ev.observations)}</p>
                      ${ev.tarea ? `<p class="pm-zen-desenv-tarea">📋 ${escHTML(ev.tarea)}</p>` : ''}
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          </details>
          ` : ''}

          <!-- 📅 Historial de Asistencia -->
          <details class="pm-zen-section pm-zen-accordion" ${asistenciaRows.length > 0 ? 'open' : ''}>
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">📅 Historial de Asistencia</span>
              <span class="pm-zen-accordion-meta">${totalSesiones} sesión${totalSesiones !== 1 ? 'es' : ''}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-asistencia-timeline" style="margin-top:0.75rem;">
              ${asistenciaRows.length === 0
                ? `<p class="pm-zen-empty">Sin registros de asistencia</p>`
                : asistenciaRows.slice(0, 30).map(r => {
                    const labels = { P: 'Presente', A: 'Ausente', J: 'Justificado', T: 'Tardanza' }
                    const colors = { P: 'var(--pm-success)', A: 'var(--pm-danger)', J: 'var(--pm-warning)', T: '#FF9500' }
                    const clase = claseMap.get(r.clase_id)
                    const justif = r.estado === 'J' ? justifMap.get(r.sesion_id) : null
                    const justifEstadoColor = { pendiente: 'var(--pm-warning)', aprobado: 'var(--pm-success)', rechazado: 'var(--pm-danger)' }
                    return `
                      <div class="pm-zen-asistencia-item">
                        <div class="pm-zen-asistencia-dot" style="background:${colors[r.estado] || 'var(--pm-border)'}"></div>
                        <div class="pm-zen-asistencia-content">
                          <div class="pm-zen-asistencia-header">
                            <strong style="color:${colors[r.estado] || 'inherit'}">${labels[r.estado] || r.estado}</strong>
                            <span>${new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                          </div>
                          <span class="pm-zen-asistencia-clase">${escHTML(clase?.nombre || 'Clase')}</span>
                          ${justif ? `
                            <div class="pm-zen-justif-box">
                              <div class="pm-zen-justif-header">
                                <i class="bi bi-file-earmark-text" style="font-size:0.75rem;"></i>
                                <span>Justificación</span>
                                <span class="pm-zen-justif-estado" style="color:${justifEstadoColor[justif.estado] || 'var(--pm-text-muted)'};">${justif.estado}</span>
                              </div>
                              <p class="pm-zen-justif-motivo">${escHTML(justif.motivo)}</p>
                              ${justif.evidencia_url ? `<a class="pm-zen-justif-evidencia" href="${justif.evidencia_url}" target="_blank" rel="noopener"><i class="bi bi-paperclip"></i> Ver evidencia</a>` : ''}
                            </div>
                          ` : r.estado === 'J' ? `<span class="pm-zen-asistencia-obs" style="color:var(--pm-warning);">Justificado — sin detalle registrado</span>` : ''}
                          ${r.observaciones ? `<span class="pm-zen-asistencia-obs">${escHTML(r.observaciones)}</span>` : ''}
                        </div>
                      </div>
                    `
                  }).join('')
              }
            </div>
          </details>

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
                <div style="flex:1;min-width:0;">
                  <span>${alumno.tlf_alumno ? 'Teléfono alumno' : alumno.representante_tlf ? 'Teléfono representante' : 'Teléfono'}</span>
                  <strong>${formatPhone(alumno.tlf_alumno || alumno.representante_tlf) || '—'}</strong>
                </div>
                ${(alumno.tlf_alumno || alumno.representante_tlf) ? `
                <button
                  id="btn-whatsapp-alumno"
                  class="pm-btn-whatsapp"
                  data-phone="${alumno.tlf_alumno || alumno.representante_tlf}"
                  title="Enviar mensaje por WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>` : ''}
              </div>
              ${alumno.representante_nombre ? `
              <div class="pm-zen-detail">
                <i class="bi bi-person-vcard"></i>
                <div>
                  <span>Representante</span>
                  <strong>${escHTML(alumno.representante_nombre)}</strong>
                </div>
              </div>` : ''}
              ${alumno.correo_representante ? `
              <div class="pm-zen-detail">
                <i class="bi bi-envelope"></i>
                <div>
                  <span>Correo representante</span>
                  <strong>${escHTML(alumno.correo_representante)}</strong>
                </div>
              </div>` : ''}
              ${alumno.direccion ? `
              <div class="pm-zen-detail">
                <i class="bi bi-geo-alt"></i>
                <div>
                  <span>Dirección</span>
                  <strong>${escHTML(alumno.direccion)}</strong>
                </div>
              </div>` : ''}
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

          <!-- 🎯 Historial de Progreso (IA) -->
          <div class="pm-zen-section">
            <div class="pm-zen-section-header">
              <h3 class="pm-zen-section-title">🎯 Historial de Progreso (IA)</h3>
            </div>
            <div id="pm-alumno-progresos-root" class="pm-zen-progress-container">
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
        .pm-zen-asistencia-obs {
          display: block;
          font-size: 0.68rem;
          color: var(--pm-text-muted);
          font-style: italic;
          margin-top: 1px;
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
        /* Botón WhatsApp */
        .pm-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          border: none;
          background: #25D366;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .pm-btn-whatsapp:hover { background: #1ebe5a; transform: scale(1.03); }
        .pm-btn-whatsapp:active { transform: scale(0.97); }
        /* Modal WhatsApp */
        #pm-wa-modal { display: none; }
        #pm-wa-modal.open { display: block; }
        .pm-wa-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1050;
        }
        .pm-wa-dialog {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1051;
          background: var(--pm-surface, #fff);
          border-radius: 20px 20px 0 0;
          max-width: 520px;
          margin: 0 auto;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.15);
          animation: waSlideUp 0.25s ease;
        }
        @keyframes waSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .pm-wa-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 1rem 1rem 0.75rem;
          border-bottom: 1px solid var(--pm-border);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .pm-wa-header span { flex: 1; }
        .pm-wa-close {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: var(--pm-text-muted);
          padding: 0 0.25rem;
        }
        .pm-wa-body { padding: 0.85rem 1rem; }
        .pm-wa-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 0.5rem;
        }
        .pm-wa-templates {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .pm-wa-tpl {
          padding: 0.3rem 0.75rem;
          border-radius: 16px;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--pm-text);
        }
        .pm-wa-tpl:hover { border-color: #25D366; color: #25D366; }
        .pm-wa-tpl.active { background: #25D36615; border-color: #25D366; color: #1a9e4d; font-weight: 600; }
        .pm-wa-textarea {
          width: 100%;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          padding: 0.65rem 0.75rem;
          font-size: 0.85rem;
          line-height: 1.5;
          resize: vertical;
          background: var(--pm-surface-2);
          color: var(--pm-text);
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s;
        }
        .pm-wa-textarea:focus { border-color: #25D366; }
        .pm-wa-footer {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1rem 1.25rem;
          border-top: 1px solid var(--pm-border);
        }
        .pm-wa-cancel {
          flex: 1;
          padding: 0.6rem;
          border-radius: 10px;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          color: var(--pm-text-muted);
          font-size: 0.85rem;
          cursor: pointer;
        }
        .pm-wa-send {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem;
          border-radius: 10px;
          background: #25D366;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }
        .pm-wa-send:hover { background: #1ebe5a; }
        .pm-wa-tpl-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; }
        .pm-wa-tpl-row .pm-wa-label { margin:0; }
        .pm-wa-manage-btn {
          font-size: 0.72rem; background: none; border: 1px solid var(--pm-border);
          border-radius: 8px; padding: 2px 10px; cursor: pointer; color: var(--pm-text-muted);
        }
        .pm-wa-manage-btn:hover { border-color: var(--pm-primary); color: var(--pm-primary); }
        .pm-wa-hint { font-size: 0.68rem; color: var(--pm-text-muted); margin: 0.3rem 0 0; }
        .pm-wa-hint code { background: var(--pm-surface-2); padding: 1px 4px; border-radius: 4px; }
        .pm-wa-back {
          background: none; border: none; font-size: 0.9rem; cursor: pointer;
          color: var(--pm-primary); font-weight: 600; padding: 0 0.5rem 0 0;
        }
        .pm-wa-add-tpl {
          display: block; width: 100%; margin-top: 0.75rem; padding: 0.55rem;
          border: 1px dashed var(--pm-border); border-radius: 10px; background: none;
          color: var(--pm-primary); font-size: 0.82rem; cursor: pointer; text-align: center;
        }
        .pm-wa-add-tpl:hover { background: var(--pm-surface-2); }
        .pm-wa-mgr-item {
          background: var(--pm-surface-2); border-radius: 10px;
          padding: 0.65rem 0.75rem; margin-bottom: 0.6rem;
        }
        .pm-wa-mgr-item-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
        .pm-wa-mgr-label {
          flex: 1; border: 1px solid var(--pm-border); border-radius: 7px;
          padding: 0.3rem 0.5rem; font-size: 0.82rem; font-weight: 600;
          background: var(--pm-surface); color: var(--pm-text);
        }
        .pm-wa-mgr-del {
          background: none; border: none; cursor: pointer; font-size: 1rem;
          opacity: 0.5; flex-shrink: 0;
        }
        .pm-wa-mgr-del:hover { opacity: 1; }
        .pm-wa-mgr-text {
          width: 100%; border: 1px solid var(--pm-border); border-radius: 7px;
          padding: 0.4rem 0.5rem; font-size: 0.8rem; resize: vertical;
          background: var(--pm-surface); color: var(--pm-text);
          font-family: inherit; box-sizing: border-box; line-height: 1.45;
        }
        .pm-wa-mgr-save {
          margin-top: 0.4rem; padding: 0.3rem 0.85rem; border-radius: 7px;
          border: none; background: var(--pm-primary); color: white;
          font-size: 0.78rem; cursor: pointer; font-weight: 600;
        }
        .pm-wa-mgr-save:hover { opacity: 0.85; }
        /* Acordeón */
        .pm-zen-accordion { list-style: none; }
        .pm-zen-accordion summary { list-style: none; }
        .pm-zen-accordion summary::-webkit-details-marker { display: none; }
        .pm-zen-accordion-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.1rem 0;
          user-select: none;
        }
        .pm-zen-accordion-header:hover .pm-zen-section-title { opacity: 0.8; }
        .pm-zen-accordion-meta {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          background: var(--pm-surface-2);
          padding: 2px 7px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .pm-accordion-chevron {
          margin-left: auto;
          font-size: 0.8rem;
          color: var(--pm-text-muted);
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        details[open] .pm-accordion-chevron { transform: rotate(180deg); }
        /* Justificaciones */
        .pm-zen-justif-box {
          margin-top: 0.35rem;
          background: var(--pm-warning)15;
          border: 1px solid var(--pm-warning)40;
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
        }
        .pm-zen-justif-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          margin-bottom: 0.25rem;
        }
        .pm-zen-justif-estado {
          margin-left: auto;
          font-size: 0.68rem;
          text-transform: capitalize;
          font-weight: 700;
        }
        .pm-zen-justif-motivo {
          font-size: 0.8rem;
          line-height: 1.45;
          margin: 0;
          color: var(--pm-text);
        }
        .pm-zen-justif-evidencia {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          color: var(--pm-primary);
          margin-top: 0.3rem;
          text-decoration: none;
        }
        .pm-zen-justif-evidencia:hover { text-decoration: underline; }
        /* Bitácora de Clases */
        .pm-zen-bitacora {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pm-zen-bitacora-item {
          padding: 0.75rem;
          border-radius: var(--pm-radius-sm);
          background: var(--pm-surface-2);
          border-left: 3px solid var(--pm-primary);
        }
        .pm-zen-bitacora-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .pm-zen-bitacora-clase {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--pm-primary);
        }
        .pm-zen-bitacora-fecha {
          font-size: 0.72rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-bitacora-contenido {
          font-size: 0.8rem;
          line-height: 1.5;
          margin: 0;
          color: var(--pm-text);
          white-space: pre-wrap;
        }
        /* Desenvolvimiento */
        .pm-zen-desenvolvimiento {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          padding-left: 1.25rem;
        }
        .pm-zen-desenvolvimiento::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--pm-border);
          border-radius: 1px;
        }
        .pm-zen-desenv-item {
          display: flex;
          gap: 0.75rem;
          padding-bottom: 1rem;
          position: relative;
        }
        .pm-zen-desenv-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 3px;
          position: absolute;
          left: -1.35rem;
          border: 2px solid var(--pm-surface);
        }
        .pm-zen-desenv-content {
          flex: 1;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
          padding: 0.6rem 0.75rem;
        }
        .pm-zen-desenv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        .pm-zen-desenv-fecha {
          font-size: 0.72rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-desenv-nota {
          font-size: 0.72rem;
          font-weight: 700;
        }
        .pm-zen-desenv-obs {
          font-size: 0.82rem;
          line-height: 1.55;
          margin: 0;
          color: var(--pm-text);
        }
        .pm-zen-desenv-tarea {
          font-size: 0.73rem;
          color: var(--pm-text-muted);
          margin: 0.3rem 0 0;
        }
      </style>
    `

    // Eventos
    container.querySelector('#pm-alumno-back').onclick = () => window.history.back()

    // ── Modal WhatsApp con gestión de plantillas ──────────────────────────
    const waPhone = formatPhoneForWA(alumno.tlf_alumno || alumno.representante_tlf)
    if (waPhone) {
      const nombreAlumno  = alumno.nombre_completo || 'el alumno'
      const nombreContacto = alumno.representante_nombre || nombreAlumno
      const vars = { alumno: nombreAlumno, contacto: nombreContacto }

      const waModal = document.createElement('div')
      waModal.id = 'pm-wa-modal'
      waModal.innerHTML = `
        <div class="pm-wa-backdrop"></div>
        <div class="pm-wa-dialog">
          <!-- Vista: Enviar mensaje -->
          <div id="pm-wa-view-send">
            <div class="pm-wa-header">
              <svg viewBox="0 0 24 24" fill="#25D366" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>Mensaje para <strong>${escHTML(nombreContacto)}</strong></span>
              <button class="pm-wa-close" id="pm-wa-close">✕</button>
            </div>
            <div class="pm-wa-body">
              <div class="pm-wa-tpl-row">
                <p class="pm-wa-label">Plantillas</p>
                <button class="pm-wa-manage-btn" id="pm-wa-manage">✏️ Gestionar</button>
              </div>
              <div class="pm-wa-templates" id="pm-wa-tpl-list"></div>
              <p class="pm-wa-label" style="margin-top:0.85rem;">Mensaje</p>
              <textarea id="pm-wa-text" class="pm-wa-textarea" rows="5" placeholder="Escribí tu mensaje aquí..."></textarea>
              <p class="pm-wa-hint">Usá <code>{alumno}</code> y <code>{contacto}</code> como variables dinámicas.</p>
            </div>
            <div class="pm-wa-footer">
              <button class="pm-wa-cancel" id="pm-wa-cancel">Cancelar</button>
              <a id="pm-wa-send" class="pm-wa-send" href="#" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Abrir en WhatsApp
              </a>
            </div>
          </div>

          <!-- Vista: Gestionar plantillas -->
          <div id="pm-wa-view-mgr" style="display:none;">
            <div class="pm-wa-header">
              <button class="pm-wa-back" id="pm-wa-back">‹ Volver</button>
              <span style="flex:1;font-weight:600;">Gestionar plantillas</span>
              <button class="pm-wa-close" id="pm-wa-close2">✕</button>
            </div>
            <div class="pm-wa-body" style="max-height:55vh;overflow-y:auto;">
              <div id="pm-wa-tpl-mgr-list"></div>
              <button class="pm-wa-add-tpl" id="pm-wa-add-tpl">+ Nueva plantilla</button>
            </div>
          </div>
        </div>
      `
      container.appendChild(waModal)

      // Referencias
      const viewSend    = waModal.querySelector('#pm-wa-view-send')
      const viewMgr     = waModal.querySelector('#pm-wa-view-mgr')
      const tplList     = waModal.querySelector('#pm-wa-tpl-list')
      const tplMgrList  = waModal.querySelector('#pm-wa-tpl-mgr-list')
      const textarea    = waModal.querySelector('#pm-wa-text')
      const sendLink    = waModal.querySelector('#pm-wa-send')

      // ── Helpers ──────────────────────────────────────────────────────────
      function getTemplates() { return waLoadTemplates(maestro.id) }
      function saveTemplates(tpls) { waSaveTemplates(maestro.id, tpls) }

      function updateSendLink() {
        const msg = textarea.value.trim()
        sendLink.href = msg
          ? `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`
          : `https://wa.me/${waPhone}`
      }

      function selectTemplate(tpl) {
        tplList.querySelectorAll('.pm-wa-tpl').forEach(b => b.classList.remove('active'))
        tplList.querySelector(`[data-id="${tpl.id}"]`)?.classList.add('active')
        textarea.value = waApplyVars(tpl.text, vars)
        updateSendLink()
      }

      // ── Render chips de plantillas (vista enviar) ─────────────────────
      function renderTplChips() {
        const tpls = getTemplates()
        tplList.innerHTML = tpls.length
          ? tpls.map(t => `<button class="pm-wa-tpl" data-id="${t.id}">${escHTML(t.label)}</button>`).join('')
          : `<span style="font-size:0.78rem;color:var(--pm-text-muted);">Sin plantillas — creá una en Gestionar.</span>`
        tplList.querySelectorAll('.pm-wa-tpl').forEach(btn => {
          btn.addEventListener('click', () => {
            const tpl = getTemplates().find(t => t.id === btn.dataset.id)
            if (tpl) selectTemplate(tpl)
          })
        })
        // Seleccionar primera por defecto
        const first = getTemplates()[0]
        if (first) selectTemplate(first)
      }

      // ── Render lista de gestión ───────────────────────────────────────
      function renderMgrList() {
        const tpls = getTemplates()
        tplMgrList.innerHTML = tpls.length === 0
          ? `<p style="font-size:0.82rem;color:var(--pm-text-muted);text-align:center;padding:1rem 0;">Sin plantillas todavía.</p>`
          : tpls.map(t => `
            <div class="pm-wa-mgr-item" data-id="${t.id}">
              <div class="pm-wa-mgr-item-header">
                <input class="pm-wa-mgr-label" value="${escHTML(t.label)}" placeholder="Nombre de la plantilla" />
                <button class="pm-wa-mgr-del" data-id="${t.id}" title="Eliminar">🗑</button>
              </div>
              <textarea class="pm-wa-mgr-text" rows="3">${escHTML(t.text)}</textarea>
              <button class="pm-wa-mgr-save" data-id="${t.id}">Guardar</button>
            </div>
          `).join('')

        // Guardar cambios de una plantilla
        tplMgrList.querySelectorAll('.pm-wa-mgr-save').forEach(btn => {
          btn.addEventListener('click', () => {
            const item = btn.closest('.pm-wa-mgr-item')
            const id   = btn.dataset.id
            const tpls = getTemplates()
            const idx  = tpls.findIndex(t => t.id === id)
            if (idx === -1) return
            tpls[idx].label = item.querySelector('.pm-wa-mgr-label').value.trim() || tpls[idx].label
            tpls[idx].text  = item.querySelector('.pm-wa-mgr-text').value.trim()
            saveTemplates(tpls)
            btn.textContent = '✓ Guardado'
            setTimeout(() => { btn.textContent = 'Guardar' }, 1500)
          })
        })

        // Eliminar plantilla
        tplMgrList.querySelectorAll('.pm-wa-mgr-del').forEach(btn => {
          btn.addEventListener('click', () => {
            const tpls = getTemplates().filter(t => t.id !== btn.dataset.id)
            saveTemplates(tpls)
            renderMgrList()
          })
        })
      }

      // ── Nueva plantilla ───────────────────────────────────────────────
      waModal.querySelector('#pm-wa-add-tpl').addEventListener('click', () => {
        const tpls = getTemplates()
        tpls.push({ id: `tpl-${Date.now()}`, label: '✏️ Nueva plantilla', text: 'Hola {contacto}, le escribo sobre {alumno}.' })
        saveTemplates(tpls)
        renderMgrList()
      })

      // ── Navegación entre vistas ───────────────────────────────────────
      waModal.querySelector('#pm-wa-manage').addEventListener('click', () => {
        viewSend.style.display = 'none'
        viewMgr.style.display  = 'block'
        renderMgrList()
      })
      waModal.querySelector('#pm-wa-back').addEventListener('click', () => {
        viewMgr.style.display  = 'none'
        viewSend.style.display = 'block'
        renderTplChips()
      })

      // ── Abrir / cerrar modal ──────────────────────────────────────────
      const openModal  = () => { waModal.classList.add('open'); renderTplChips() }
      const closeModal = () => {
        waModal.classList.remove('open')
        viewMgr.style.display  = 'none'
        viewSend.style.display = 'block'
      }

      container.querySelector('#btn-whatsapp-alumno')?.addEventListener('click', openModal)
      waModal.querySelector('#pm-wa-close').addEventListener('click', closeModal)
      waModal.querySelector('#pm-wa-close2').addEventListener('click', closeModal)
      waModal.querySelector('#pm-wa-cancel').addEventListener('click', closeModal)
      waModal.querySelector('.pm-wa-backdrop').addEventListener('click', closeModal)

      textarea.addEventListener('input', updateSendLink)
      sendLink.addEventListener('click', () => setTimeout(closeModal, 300))
    }

    // Plan de Estudios — bitácora de dominio individual
    const planRoot = container.querySelector('#pm-alumno-progreso-root')
    if (planRoot) {
      const panel = new PlanEstudiosPanel({
        container: planRoot,
        alumnoId,
        maestroId: maestro.id,
      })
      panel.init().catch(err => {
        console.error('[AlumnoPerfil] PlanEstudiosPanel error:', err)
        planRoot.innerHTML = `<p style="color:var(--pm-danger);font-size:0.82rem;">Error al cargar plan de estudios: ${escHTML(err.message)}</p>`
      })
    }

    _renderProgresos(container, alumnoId)

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