/**
 * scoreDirectorView.js — "Score del Director" (DIR).
 * Vista global de TODAS las tareas institucionales agrupadas por departamento,
 * con indicadores de saturación y detección de cuellos de botella. Permite al
 * Director crear un evento de calendario que dispara la cascada Hermes
 * (fn_hermes_auto_delegar_tareas), generando tareas en los departamentos.
 *
 * Patrón: retorna { teardown() } para limpieza de listeners (AbortController).
 *
 * @param {HTMLElement} container
 */

import '../styles/tareas.css'
import * as tareasApi from '../api/tareasApi.js'
import { clasificarDepartamento } from '../api/clasificadorApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'

const DEPARTAMENTOS = {
  DIR: 'Dirección',
  ACM: 'Académica',
  ADM: 'Administración',
  FIN: 'Financiero',
  LOG: 'Logística',
  COM: 'Comunicaciones',
  TECNICO: 'Técnico',
}

const DEPT_ICON = {
  DIR: 'bi-bullseye',
  ACM: 'bi-easel',
  ADM: 'bi-clipboard-data',
  FIN: 'bi-cash-coin',
  LOG: 'bi-box-seam',
  COM: 'bi-megaphone',
  TECNICO: 'bi-tools',
}

// event_categoria verificado en DB
const CATEGORIAS = {
  concierto: 'Concierto',
  ensayo: 'Ensayo',
  reunion: 'Reunión',
  patrocinio: 'Patrocinio',
  pago: 'Pago',
  corte: 'Corte',
  inscripcion: 'Inscripción',
  auditoria: 'Auditoría',
  otro: 'Otro',
}

let _abortController = null

export async function renderScoreDirectorView(container) {
  _abortController?.abort()
  _abortController = new AbortController()

  try {
    renderLoading(container)
    const tareas = await tareasApi.getTareas()
    renderContent(container, tareas)
    attachEvents(container, tareas)
  } catch (error) {
    console.error('[ScoreDirector] Error:', error.message)
    renderError(container, error.message)
  }

  return { teardown: () => _abortController?.abort() }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando Score del Director...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${escapeHTML(mensaje)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn"><i class="bi bi-arrow-clockwise"></i> Reintentar</button>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener(
    'click',
    () => renderScoreDirectorView(container),
    { signal: _abortController.signal },
  )
}

function esVencida(t) {
  if (!t.fecha_vencimiento) return false
  if (t.estado === 'completada' || t.estado === 'cancelada') return false
  return new Date(t.fecha_vencimiento) < startOfToday()
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function computarStats(tareas) {
  const stats = {}
  for (const dept of Object.keys(DEPARTAMENTOS)) {
    stats[dept] = {
      total: 0, pendiente: 0, en_progreso: 0, bloqueada: 0,
      completada: 0, cancelada: 0, vencidas: 0, criticas: 0,
    }
  }
  for (const t of tareas) {
    const s = stats[t.departamento]
    if (!s) continue
    s.total++
    if (s[t.estado] !== undefined) s[t.estado]++
    if (esVencida(t)) s.vencidas++
    if (t.prioridad === 'critica' && t.estado !== 'completada' && t.estado !== 'cancelada') s.criticas++
  }
  return stats
}

function renderContent(container, tareas) {
  const stats = computarStats(tareas)
  const total = tareas.length
  const sum = (estado) => tareas.filter((t) => t.estado === estado).length
  const vencidasGlobal = tareas.filter(esVencida).length
  const criticasGlobal = tareas.filter(
    (t) => t.prioridad === 'critica' && t.estado !== 'completada' && t.estado !== 'cancelada',
  ).length

  // Departamentos activos (con al menos una tarea), ordenados por carga abierta desc.
  const deptList = Object.keys(DEPARTAMENTOS)
    .map((dept) => ({ dept, s: stats[dept] }))
    .filter((x) => x.s.total > 0)
    .sort((a, b) => cargaAbierta(b.s) - cargaAbierta(a.s))

  container.innerHTML = `
    <div class="page-container">
      <div class="tareas-header mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="bi bi-bullseye fs-4"></i>
            </div>
            <div>
              <h1 class="tareas-title mb-0">Score del Director</h1>
              <p class="text-muted small mb-0">Vista global · Hermes · ${total} tareas en ${deptList.length} departamentos</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" id="btnAsignarTarea">
              <i class="bi bi-stars me-1"></i> Asignar tarea (IA)
            </button>
            <button class="btn btn-primary" id="btnCrearEvento">
              <i class="bi bi-calendar-plus me-1"></i> Crear evento
            </button>
          </div>
        </div>

        <div class="tareas-kpis d-flex gap-2 flex-wrap">
          ${kpi('Total', total, 'primary')}
          ${kpi('Pendientes', sum('pendiente'), 'secondary')}
          ${kpi('En Progreso', sum('en_progreso'), 'info')}
          ${kpi('Bloqueadas', sum('bloqueada'), 'danger')}
          ${kpi('Vencidas', vencidasGlobal, 'warning')}
          ${kpi('Críticas', criticasGlobal, 'danger')}
          ${kpi('Completadas', sum('completada'), 'success')}
        </div>
      </div>

      <h6 class="text-muted text-uppercase small fw-bold mb-3">
        <i class="bi bi-diagram-3 me-1"></i> Saturación por departamento
      </h6>
      <div class="row g-3 mb-2">
        ${
          deptList.length === 0
            ? `<div class="col-12"><div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Aún no hay tareas. Creá un evento para disparar la cascada Hermes.</div></div>`
            : deptList.map(({ dept, s }) => renderDeptCard(dept, s)).join('')
        }
      </div>
    </div>
  `
}

function cargaAbierta(s) {
  return s.pendiente + s.en_progreso + s.bloqueada
}

function kpi(label, valor, color) {
  return `
    <div class="kpi-card bg-${color} bg-opacity-10 p-2 rounded">
      <small class="text-muted">${label}</small>
      <div class="fs-5 fw-bold text-${color}">${valor}</div>
    </div>
  `
}

function renderDeptCard(dept, s) {
  const abierta = cargaAbierta(s)
  const saturacion = s.total > 0 ? Math.round((abierta / s.total) * 100) : 0
  const cuelloBotella = s.bloqueada > 0 || s.vencidas > 0
  const satColor = saturacion >= 75 ? 'danger' : saturacion >= 40 ? 'warning' : 'success'

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card border-0 shadow-sm h-100 score-dept-card" data-dept="${dept}" style="cursor:pointer">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi ${DEPT_ICON[dept] || 'bi-building'} fs-5 text-primary"></i>
              <span class="fw-bold">${DEPARTAMENTOS[dept]}</span>
              <span class="badge bg-light text-dark border">${dept}</span>
            </div>
            ${cuelloBotella ? `<span class="badge bg-danger" title="Cuello de botella"><i class="bi bi-exclamation-octagon-fill me-1"></i>Cuello</span>` : ''}
          </div>

          <div class="d-flex justify-content-between align-items-center mb-1">
            <small class="text-muted">Saturación (${abierta}/${s.total} abiertas)</small>
            <small class="fw-bold text-${satColor}">${saturacion}%</small>
          </div>
          <div class="progress mb-3" style="height: 8px;">
            <div class="progress-bar bg-${satColor}" style="width: ${saturacion}%"></div>
          </div>

          <div class="d-flex flex-wrap gap-1">
            ${chip('Pend.', s.pendiente, 'secondary')}
            ${chip('Progr.', s.en_progreso, 'info')}
            ${s.bloqueada > 0 ? chip('Bloq.', s.bloqueada, 'danger') : ''}
            ${s.vencidas > 0 ? chip('Venc.', s.vencidas, 'warning') : ''}
            ${s.criticas > 0 ? chip('Crít.', s.criticas, 'danger') : ''}
            ${chip('Compl.', s.completada, 'success')}
          </div>
        </div>
      </div>
    </div>
  `
}

function chip(label, valor, color) {
  return `<span class="badge bg-${color} bg-opacity-75">${label} ${valor}</span>`
}

function attachEvents(container, tareas) {
  const signal = _abortController.signal

  container.querySelector('#btnCrearEvento')?.addEventListener('click', () => openCrearEventoModal(container), { signal })
  container.querySelector('#btnAsignarTarea')?.addEventListener('click', () => openAsignarTareaModal(container), { signal })

  // Click en card → navegar a la lista filtrada por departamento (router admin)
  container.querySelectorAll('.score-dept-card').forEach((card) => {
    card.addEventListener(
      'click',
      () => {
        const dept = card.dataset.dept
        if (window.router?.navigate) {
          // Ruta de tareas del departamento (registrada como 'hermes-tareas' en portales,
          // o 'dir-score' aquí). En admin mostramos un detalle inline rápido.
          mostrarDetalleDepartamento(container, tareas, dept)
        }
      },
      { signal },
    )
  })
}

function mostrarDetalleDepartamento(container, tareas, dept) {
  const lista = tareas
    .filter((t) => t.departamento === dept)
    .sort((a, b) => ordenPrioridad(a.prioridad) - ordenPrioridad(b.prioridad))

  AppModal.open({
    title: `Tareas — ${DEPARTAMENTOS[dept]} (${dept})`,
    size: 'lg',
    body: lista.length === 0
      ? `<div class="alert alert-info">Sin tareas en este departamento.</div>`
      : `<div class="list-group list-group-flush">
          ${lista.map((t) => {
            const venc = esVencida(t)
            return `
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div class="fw-semibold">${escapeHTML(t.titulo)}</div>
                  <small class="text-muted">${t.fecha_vencimiento || 'sin fecha'}${venc ? ' · <span class="text-danger">vencida</span>' : ''}</small>
                </div>
                <div class="text-end">
                  <span class="badge bg-${badgePrioridad(t.prioridad)}">${t.prioridad}</span>
                  <span class="badge bg-${badgeEstado(t.estado)}">${t.estado}</span>
                </div>
              </div>
            </div>`
          }).join('')}
        </div>`,
    hideSave: true,
    cancelText: 'Cerrar',
  })
}

function ordenPrioridad(p) {
  return { critica: 0, alta: 1, media: 2, baja: 3 }[p] ?? 9
}
function badgePrioridad(p) {
  return { critica: 'danger', alta: 'warning', media: 'info', baja: 'secondary' }[p] || 'secondary'
}
function badgeEstado(e) {
  return { pendiente: 'secondary', en_progreso: 'info', completada: 'success', bloqueada: 'danger', cancelada: 'dark' }[e] || 'secondary'
}

function openCrearEventoModal(container) {
  const hoy = new Date().toISOString().slice(0, 10)

  AppModal.open({
    title: 'Crear evento institucional',
    size: 'lg',
    body: `
      <div class="alert alert-info small py-2">
        <i class="bi bi-robot me-1"></i> Al crear el evento, Hermes generará automáticamente las
        tareas departamentales según el protocolo de la categoría.
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Título <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="evTitulo" placeholder="Ej. Concierto de Gala de Fin de Año" required>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Categoría <span class="text-danger">*</span></label>
          <select class="form-select" id="evCategoria">
            ${Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}" ${k === 'concierto' ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Departamento responsable</label>
          <select class="form-select" id="evDepto">
            ${Object.entries(DEPARTAMENTOS).map(([k, v]) => `<option value="${k}" ${k === 'DIR' ? 'selected' : ''}>${v} (${k})</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Fecha inicio <span class="text-danger">*</span></label>
          <input type="date" class="form-control" id="evInicio" value="${hoy}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Fecha fin</label>
          <input type="date" class="form-control" id="evFin" value="${hoy}">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Ubicación</label>
        <input type="text" class="form-control" id="evUbicacion" placeholder="Ej. Teatro Nacional, Salón principal">
      </div>
      <div class="mb-2">
        <label class="form-label small fw-semibold">Descripción</label>
        <textarea class="form-control" id="evDescripcion" rows="2" placeholder="Detalles del evento..."></textarea>
      </div>
    `,
    saveText: 'Crear y disparar cascada',
    onSave: async (modalBody) => {
      const titulo = modalBody.querySelector('#evTitulo').value.trim()
      const fechaInicio = modalBody.querySelector('#evInicio').value
      if (!titulo) {
        AppToast.show('El título es obligatorio', 'error')
        return false
      }
      if (!fechaInicio) {
        AppToast.show('La fecha de inicio es obligatoria', 'error')
        return false
      }
      const evento = {
        titulo,
        categoria: modalBody.querySelector('#evCategoria').value,
        departamento_responsable: modalBody.querySelector('#evDepto').value,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: new Date(modalBody.querySelector('#evFin').value || fechaInicio).toISOString(),
        ubicacion: modalBody.querySelector('#evUbicacion').value.trim() || null,
        descripcion: modalBody.querySelector('#evDescripcion').value.trim() || null,
      }
      try {
        const { tareasGeneradas } = await tareasApi.crearEventoInstitucional(evento)
        const n = tareasGeneradas?.length || 0
        AppToast.show(
          n > 0
            ? `Evento creado · Hermes generó ${n} tarea${n === 1 ? '' : 's'}`
            : 'Evento creado (sin tareas para esta categoría)',
          'success',
        )
        await renderScoreDirectorView(container)
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
        return false
      }
    },
  })
}

// ── Enrutamiento inteligente: texto libre → departamento → tarea ────────────────
const PRIORIDADES_TAREA = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

function openAsignarTareaModal(container) {
  AppModal.open({
    title: 'Asignar tarea desde texto',
    size: 'lg',
    body: `
      <div class="alert alert-info small py-2">
        <i class="bi bi-stars me-1"></i> Pegá la solicitud en texto libre. La IA detecta el
        departamento que debe atenderla y arma la tarea. Vos confirmás antes de crearla.
      </div>
      <textarea class="form-control" id="atTexto" rows="4"
        placeholder="Ej. Necesito que me manden la relación de pago del mes de febrero"></textarea>
    `,
    saveText: '<i class="bi bi-stars me-1"></i>Analizar con IA',
    onSave: async (mb) => {
      const texto = mb.querySelector('#atTexto').value.trim()
      if (!texto) {
        AppToast.show('Escribí la solicitud primero', 'error')
        return false
      }
      try {
        const c = await clasificarDepartamento(texto)
        // Cerramos este modal y abrimos el de confirmación con lo sugerido.
        setTimeout(() => openConfirmarTareaModal(container, c), 50)
      } catch (err) {
        AppToast.show(`IA no disponible: ${err.message}`, 'error')
        return false
      }
    },
  })
}

function openConfirmarTareaModal(container, c) {
  const conf = Math.round((c.confianza ?? 0.5) * 100)
  AppModal.open({
    title: 'Confirmar y asignar tarea',
    size: 'lg',
    body: `
      <div class="d-flex align-items-center gap-2 mb-3">
        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">
          <i class="bi bi-robot me-1"></i>IA sugiere: ${DEPARTAMENTOS[c.departamento] || c.departamento}
        </span>
        <span class="text-muted small">confianza ${conf}%</span>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Departamento <span class="text-danger">*</span></label>
          <select class="form-select" id="atDepto">
            ${Object.entries(DEPARTAMENTOS)
              .map(([k, v]) => `<option value="${k}" ${k === c.departamento ? 'selected' : ''}>${v} (${k})</option>`)
              .join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Prioridad</label>
          <select class="form-select" id="atPrioridad">
            ${Object.entries(PRIORIDADES_TAREA)
              .map(([k, v]) => `<option value="${k}" ${k === c.prioridad ? 'selected' : ''}>${v}</option>`)
              .join('')}
          </select>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Título <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="atTitulo" value="${escapeHTML(c.titulo)}">
      </div>
      <div class="mb-2">
        <label class="form-label small fw-semibold">Descripción</label>
        <textarea class="form-control" id="atDescripcion" rows="3">${escapeHTML(c.descripcion)}</textarea>
      </div>
      <p class="text-muted extra-small mb-0">
        <i class="bi bi-info-circle me-1"></i> Al crearla, aparece en el portal del departamento.
        Si es <strong>alta</strong> o <strong>crítica</strong>, Hermes encola un aviso de WhatsApp al encargado.
      </p>
    `,
    saveText: 'Crear y asignar',
    onSave: async (mb) => {
      const titulo = mb.querySelector('#atTitulo').value.trim()
      if (!titulo) {
        AppToast.show('El título es obligatorio', 'error')
        return false
      }
      const departamento = mb.querySelector('#atDepto').value
      try {
        await tareasApi.crearTareaInstitucional({
          titulo,
          descripcion: mb.querySelector('#atDescripcion').value.trim() || null,
          departamento,
          prioridad: mb.querySelector('#atPrioridad').value,
          estado: 'pendiente',
        })
        AppToast.show(`Tarea creada y asignada a ${DEPARTAMENTOS[departamento] || departamento}`, 'success')
        await renderScoreDirectorView(container)
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
        return false
      }
    },
  })
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
