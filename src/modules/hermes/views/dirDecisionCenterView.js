/**
 * dirDecisionCenterView.js — Centro de Decisiones DIR V9.
 *
 * Expone de forma explícita las obligaciones de Dirección Ejecutiva:
 * - reuniones recurrentes obligatorias
 * - decisiones con huella operativa
 * - doble firma / escalamiento financiero
 * - rendición ante Junta
 *
 * Base actual: crea tareas institucionales en Hermes con estructura clara.
 */

import '../styles/tareas.css'
import * as tareasApi from '../api/tareasApi.js'
import * as cajaApi from '../../caja/api/cajaApi.js'
import * as dirGovernanceApi from '../api/dirGovernanceApi.js'

const PLAYBOOKS = [
  {
    id: 'standup',
    title: 'Standup de Dirección',
    owner: 'DIR',
    icon: 'bi-calendar-week',
    cadence: 'Lunes 10:00 · 20 min',
    purpose: 'Alinear prioridades semanales entre capas.',
    tasks: [
      task('DIR', 'Convocar standup semanal', 'alta'),
      task('ADM', 'Preparar bloqueos y pendientes críticos', 'alta'),
      task('ACM', 'Preparar alertas académicas y conflictos', 'alta'),
    ],
  },
  {
    id: 'cierre',
    title: 'Comité de Cierre Semanal',
    owner: 'DIR',
    icon: 'bi-check2-square',
    cadence: 'Viernes 16:30 · 60 min',
    purpose: 'Cerrar decisiones pendientes y dejar acta operativa.',
    tasks: [
      task('DIR', 'Moderar comité y validar decisiones pendientes', 'critica'),
      task('ADM', 'Consolidar pendientes financieros y operativos', 'alta'),
      task('COM', 'Preparar minuta y acuerdos a comunicar', 'media'),
    ],
  },
  {
    id: 'fundraising',
    title: 'Coordinación Institucional',
    owner: 'DIR',
    icon: 'bi-diagram-3',
    cadence: 'Jueves 16:00 · 60 min',
    purpose: 'Revisar pipeline de alianzas, donaciones y seguimiento institucional.',
    tasks: [
      task('DIR', 'Revisar pipeline institucional y próximos compromisos', 'alta'),
      task('COM', 'Preparar materiales o narrativa de apoyo', 'media'),
      task('ADM', 'Validar impacto operativo y presupuestario', 'media'),
    ],
  },
  {
    id: 'board',
    title: 'Reporte para Junta Directiva',
    owner: 'DIR',
    icon: 'bi-building-check',
    cadence: 'Primer sábado del mes · 11:00',
    purpose: 'Preparar rendición ejecutiva para Junta.',
    tasks: [
      task('DIR', 'Preparar reporte ejecutivo trimestral/mensual', 'critica'),
      task('ADM', 'Adjuntar resumen financiero y presupuesto', 'alta'),
      task('ACM', 'Adjuntar KPIs académicos y alertas de impacto', 'alta'),
    ],
  },
]

const GOVERNANCE_ACTIONS = [
  {
    id: 'board-minutes',
    title: 'Registrar acta de Junta',
    icon: 'bi-file-earmark-text',
    description: 'Abre el flujo operativo de acta, firmas y seguimiento de acuerdos.',
    run: createBoardMinutesWorkflow,
  },
  {
    id: 'payment-approval',
    title: 'Registrar orden de pago',
    icon: 'bi-cash-stack',
    description: 'Abre el flujo seguro de pago, soporte y revisión de firmas.',
    run: createPaymentApprovalWorkflow,
  },
]

function task(departamento, titulo, prioridad) {
  return { departamento, titulo, prioridad }
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export async function renderDirDecisionCenterView(container) {
  const ac = new AbortController()
  const state = { snapshot: null, creating: false }

  async function load() {
    try {
      container.innerHTML = loadingHtml()
      state.snapshot = await tareasApi.getConsultaEstado()
      render()
    } catch (error) {
      container.innerHTML = errorHtml(error.message)
      container.querySelector('#dir-retry')?.addEventListener('click', load, { signal: ac.signal })
    }
  }

  function render() {
    const immediate = state.snapshot?.atencion_inmediata?.length || 0
    const blocked = state.snapshot?.tareas?.bloqueada || 0
    const open = (state.snapshot?.tareas?.pendiente || 0) + (state.snapshot?.tareas?.en_progreso || 0)

    container.innerHTML = `
      <div class="page-container">
        <div class="tareas-header mb-4">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
            <div class="d-flex align-items-center gap-3">
              <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                <i class="bi bi-bank fs-4"></i>
              </div>
              <div>
                <h1 class="tareas-title mb-0">Centro de Decisiones DIR V9</h1>
                <p class="text-muted small mb-0">Gobernanza operativa, reuniones críticas y decisiones con huella Hermes</p>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary" id="dir-refresh">
                <i class="bi bi-arrow-clockwise me-1"></i> Actualizar
              </button>
            </div>
          </div>

          <div class="tareas-kpis d-flex gap-2 flex-wrap">
            ${kpi('Abiertas', open, 'primary')}
            ${kpi('Bloqueadas', blocked, 'danger')}
            ${kpi('Atención inmediata', immediate, 'warning')}
            ${kpi('Playbooks DIR', PLAYBOOKS.length, 'success')}
          </div>
        </div>

        <div class="alert alert-info small">
          <i class="bi bi-info-circle me-1"></i>
          Esta capa traduce responsabilidades V9 de Dirección en disparadores operativos claros para Hermes.
        </div>

        <div class="alert alert-warning small">
          <i class="bi bi-exclamation-triangle me-1"></i>
          <strong>Conflicto documental verificado:</strong> <code>DIR_EJEC_V9</code> establece doble firma para pagos &gt; RD$50,000,
          mientras <code>FIN-P15_V9</code> exige firma dual desde RD$5,000. Por seguridad, el portal NO automatiza ese umbral:
          registra la solicitud y la escala a revisión formal.
        </div>

        <div class="row g-3">
          ${PLAYBOOKS.map(renderPlaybookCard).join('')}
        </div>

        <h5 class="mt-4 mb-3">Gobernanza documental y financiera</h5>
        <div class="row g-3">
          ${GOVERNANCE_ACTIONS.map(renderGovernanceActionCard).join('')}
        </div>
      </div>
    `

    container.querySelector('#dir-refresh')?.addEventListener('click', load, { signal: ac.signal })
    container.querySelectorAll('[data-playbook-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const playbook = PLAYBOOKS.find((item) => item.id === btn.dataset.playbookId)
        if (!playbook || state.creating) return
        await createPlaybook(playbook, btn)
      }, { signal: ac.signal })
    })

    container.querySelectorAll('[data-governance-action]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const action = GOVERNANCE_ACTIONS.find((item) => item.id === btn.dataset.governanceAction)
        if (!action || state.creating) return
        await action.run({ load, state, button: btn })
      }, { signal: ac.signal })
    })
  }

  async function createPlaybook(playbook, button) {
    state.creating = true
    const original = button.innerHTML
    button.disabled = true
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Creando'

    try {
      const correlationId = `dir-${playbook.id}-${Date.now()}`
      const dueDate = nextDueDate(playbook.id)

      for (const item of playbook.tasks) {
        await tareasApi.crearTareaInstitucional({
          titulo: item.titulo,
          descripcion: `[DIR_V9] ${playbook.title} · ${playbook.purpose}`,
          departamento: item.departamento,
          prioridad: item.prioridad,
          estado: 'pendiente',
          fecha_vencimiento: dueDate,
          checklist: [],
          correlation_id: correlationId,
          entidad_tipo: 'dir_playbook',
          entidad_id: playbook.id,
          entidad_label: playbook.title,
        })
      }

      toast(`Playbook "${playbook.title}" creado en Hermes.`)
      state.creating = false
      await load()
    } catch (error) {
      toast(`No pude crear el playbook: ${error.message}`, 'danger')
      button.disabled = false
      button.innerHTML = original
      state.creating = false
    }
  }

  await load()
  return { teardown: () => ac.abort() }
}

function renderGovernanceActionCard(action) {
  return `
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-3">
          <h5 class="mb-2"><i class="bi ${action.icon} text-primary me-2"></i>${esc(action.title)}</h5>
          <p class="small text-muted mb-3">${esc(action.description)}</p>
          <button class="btn btn-outline-primary btn-sm" data-governance-action="${esc(action.id)}">
            <i class="bi bi-arrow-right-circle me-1"></i> Ejecutar flujo
          </button>
        </div>
      </div>
    </div>
  `
}

async function createBoardMinutesWorkflow({ load, state, button }) {
  const meetingType = window.prompt('Tipo de reunión (Junta / Comité de Cierre / Standup):', 'Junta Directiva')
  if (!meetingType?.trim()) return
  const meetingDate = window.prompt('Fecha del acta (YYYY-MM-DD):', new Date().toISOString().slice(0, 10))
  if (!meetingDate?.trim()) return

  const original = button.innerHTML
  state.creating = true
  button.disabled = true
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Creando'

  try {
    const corr = `dir-acta-${Date.now()}`
    const templatePath = '01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/junta_directiva/actas/2026/TEMPLATE_acta_YYYY-MM-DD.md'
    const description = `[DIR_V9_ACTA] ${meetingType} · Fecha ${meetingDate} · Template ${templatePath}`
    const minutaResult = await cajaApi.createMinuta({
      titulo: `${meetingType} · ${meetingDate}`,
      fecha_reunion: meetingDate,
      visibilidad: 'admin',
      participantes: [],
      puntos_tratados: [],
      acuerdos: [],
      responsables: [],
      creado_por: 'DIR_HERMES',
    })

    if (minutaResult?.error) throw minutaResult.error

    const minutaId = minutaResult?.data?.id || null

    await dirGovernanceApi.createDecision({
      decision_type: 'acta',
      title: `Acta ${meetingType} ${meetingDate}`,
      summary: `Registro institucional de acta para ${meetingType}.`,
      status: 'pending_review',
      related_minuta_id: minutaId,
      correlation_id: corr,
      requires_board_review: meetingType.toLowerCase().includes('junta'),
      source_doc_refs: [
        '01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR_EJEC_V9.md',
        templatePath,
      ],
      metadata: { meeting_type: meetingType, meeting_date: meetingDate },
      created_by: 'DIR_HERMES',
    })

    await tareasApi.crearTareaInstitucional({
      titulo: `DIR: Redactar acta de ${meetingType}`,
      descripcion,
      departamento: 'DIR',
      prioridad: 'alta',
      fecha_vencimiento: meetingDate,
      correlation_id: corr,
      entidad_tipo: 'dir_acta',
      entidad_id: String(minutaId || meetingDate),
      entidad_label: meetingType,
    })
    await tareasApi.crearTareaInstitucional({
      titulo: `COM: Preparar minuta y acuerdos de ${meetingType}`,
      descripcion,
      departamento: 'COM',
      prioridad: 'media',
      fecha_vencimiento: meetingDate,
      correlation_id: corr,
      entidad_tipo: 'dir_acta',
      entidad_id: String(minutaId || meetingDate),
      entidad_label: meetingType,
    })
    await tareasApi.crearTareaInstitucional({
      titulo: `ADM: Dar seguimiento a acuerdos del acta ${meetingType}`,
      descripcion,
      departamento: 'ADM',
      prioridad: 'alta',
      fecha_vencimiento: meetingDate,
      correlation_id: corr,
      entidad_tipo: 'dir_acta',
      entidad_id: String(minutaId || meetingDate),
      entidad_label: meetingType,
    })

    toast(`Flujo de acta creado para ${meetingType}.`)
    state.creating = false
    await load()
  } catch (error) {
    state.creating = false
    button.disabled = false
    button.innerHTML = original
    toast(`No pude crear el flujo de acta: ${error.message}`, 'danger')
  }
}

async function createPaymentApprovalWorkflow({ load, state, button }) {
  const amount = window.prompt('Monto solicitado en RD$:', '0')
  if (!amount?.trim()) return
  const concept = window.prompt('Concepto del pago:', 'Pago institucional')
  if (!concept?.trim()) return

  const original = button.innerHTML
  state.creating = true
  button.disabled = true
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Creando'

  try {
    const corr = `dir-pago-${Date.now()}`
    const finDoc = '01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P15_Emision_Cheques_V9.md'
    const orderTemplate = '01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/pagos/2026/TEMPLATE_orden_pago_YYYY-MM-DD.md'
    const description = `[DIR_V9_PAGO] Concepto: ${concept} · Monto RD$${amount} · Soporte ${finDoc} · Template ${orderTemplate} · REQUIERE REVISION DE FIRMAS`
    const numericAmount = Number(amount)
    const requiresBoardReview = numericAmount >= 5000
    const requiresDualSignature = numericAmount > 50000 || numericAmount >= 5000

    await dirGovernanceApi.createDecision({
      decision_type: 'pago',
      title: `Orden de pago · ${concept}`,
      summary: `Solicitud de pago por RD$${amount} pendiente de validación documental y firmas.`,
      status: 'pending_review',
      amount_rd: Number.isFinite(numericAmount) ? numericAmount : null,
      requires_dual_signature: requiresDualSignature,
      requires_board_review: requiresBoardReview,
      correlation_id: corr,
      source_doc_refs: [
        '01_DEPARTAMENTOS/01_DIR_DIRECCION_EJECUTIVA/DIR_EJEC_V9.md',
        finDoc,
        orderTemplate,
      ],
      metadata: {
        concept,
        documented_conflict: true,
        threshold_conflict: {
          dir_ejec_v9: '> 50000',
          fin_p15_v9: '>= 5000',
        },
      },
      created_by: 'DIR_HERMES',
    })

    await tareasApi.crearTareaInstitucional({
      titulo: `FIN: Preparar orden de pago para ${concept}`,
      descripcion,
      departamento: 'FIN',
      prioridad: 'alta',
      correlation_id: corr,
      entidad_tipo: 'dir_pago',
      entidad_id: String(Date.now()),
      entidad_label: concept,
    })
    await tareasApi.crearTareaInstitucional({
      titulo: `DIR: Validar soporte y ruta de aprobación de pago`,
      descripcion,
      departamento: 'DIR',
      prioridad: 'critica',
      correlation_id: corr,
      entidad_tipo: 'dir_pago',
      entidad_id: String(Date.now()),
      entidad_label: concept,
    })
    await tareasApi.crearTareaInstitucional({
      titulo: 'ADM: Confirmar contrapeso administrativo y evidencia',
      descripcion,
      departamento: 'ADM',
      prioridad: 'alta',
      correlation_id: corr,
      entidad_tipo: 'dir_pago',
      entidad_id: String(Date.now()),
      entidad_label: concept,
    })

    toast('Flujo seguro de orden de pago creado.')
    state.creating = false
    await load()
  } catch (error) {
    state.creating = false
    button.disabled = false
    button.innerHTML = original
    toast(`No pude crear la orden de pago: ${error.message}`, 'danger')
  }
}

function renderPlaybookCard(playbook) {
  return `
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-start justify-content-between gap-3 mb-2">
            <div>
              <h5 class="mb-1"><i class="bi ${playbook.icon} text-primary me-2"></i>${esc(playbook.title)}</h5>
              <div class="small text-muted">${esc(playbook.cadence)}</div>
            </div>
            <span class="badge bg-light text-dark border">${esc(playbook.owner)}</span>
          </div>

          <p class="small mb-3">${esc(playbook.purpose)}</p>

          <div class="small text-muted mb-2 text-uppercase fw-bold">Tareas que dispara</div>
          <div class="d-flex flex-column gap-2 mb-3">
            ${playbook.tasks.map((item) => `
              <div class="d-flex align-items-center justify-content-between small border rounded px-2 py-2">
                <span>${esc(item.titulo)}</span>
                <span class="badge bg-secondary">${esc(item.departamento)}</span>
              </div>
            `).join('')}
          </div>

          <button class="btn btn-primary btn-sm" data-playbook-id="${esc(playbook.id)}">
            <i class="bi bi-play-circle me-1"></i> Ejecutar playbook
          </button>
        </div>
      </div>
    </div>
  `
}

function nextDueDate(playbookId) {
  const base = new Date()
  const daysByPlaybook = { standup: 1, cierre: 3, fundraising: 2, board: 7 }
  base.setDate(base.getDate() + (daysByPlaybook[playbookId] || 2))
  return base.toISOString().slice(0, 10)
}

function kpi(label, value, color) {
  return `
    <div class="kpi-card bg-${color} bg-opacity-10 p-2 rounded">
      <small class="text-muted">${esc(label)}</small>
      <div class="fs-5 fw-bold text-${color}">${esc(value)}</div>
    </div>
  `
}

function loadingHtml() {
  return `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando Centro de Decisiones DIR…</p>
      </div>
    </div>
  `
}

function errorHtml(message) {
  return `
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${esc(message)}</p>
        <button class="btn btn-primary btn-sm" id="dir-retry">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>
  `
}

function toast(message, type = 'success') {
  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: { message, type },
    }),
  )
}
