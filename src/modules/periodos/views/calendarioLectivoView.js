import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import * as PeriodosApi from '../api/periodosApi.js'
import { explicarListaVacia } from '../api/reporteCierreApi.js'
import {
  estadoCalendario,
  listarExcepciones,
  crearExcepcion,
  eliminarExcepcion,
  validarCierre,
  cerrarPeriodo,
  anularSesionesNoLectivas,
  TIPO_EXCEPCION,
  SEMAFORO,
} from '../api/calendarioLectivoApi.js'

/**
 * Gestión del Período Lectivo — portal ACM.
 *
 * Reúne en una pantalla las tres decisiones que antes vivían dispersas:
 * cuándo empieza y termina el semestre, qué días dentro de él no son lectivos,
 * y si los registros están completos para cerrarlo formalmente.
 */

const fmt = (f) => {
  if (!f) return '—'
  const d = new Date(`${f}T00:00:00`)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function renderCalendarioLectivoView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h2 class="fw-bold mb-1">Período Lectivo</h2>
          <p class="text-muted mb-0">Define cuándo hay clases, qué días no, y cierra el semestre.</p>
        </div>
        <div>
          <label class="form-label small fw-semibold mb-1" for="cl-periodo">Período</label>
          <select id="cl-periodo" class="form-select form-select-sm" style="min-width:240px;">
            <option>Cargando…</option>
          </select>
        </div>
      </div>

      <div id="cl-hoy" class="mb-4"></div>

      <div class="row g-4">
        <div class="col-lg-6"><div id="cl-rango"></div></div>
        <div class="col-lg-6"><div id="cl-cierre"></div></div>
      </div>

      <div id="cl-excepciones" class="mt-4"></div>
      <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>
    </div>`

  const sel = container.querySelector('#cl-periodo')
  let periodos = []
  let periodoActual = null

  function toast(msg, tone = 'success') {
    const c = container.querySelector('.toast-container')
    if (!c) return
    const id = 'ct-' + Date.now()
    c.insertAdjacentHTML('beforeend', `
      <div id="${id}" class="toast show align-items-center text-white bg-${tone} border-0">
        <div class="d-flex">
          <div class="toast-body">${escapeHTML(msg)}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>`)
    setTimeout(() => document.getElementById(id)?.remove(), 5000)
  }

  // ── Estado de hoy ─────────────────────────────────────────────────────────
  async function pintarHoy() {
    const box = container.querySelector('#cl-hoy')
    try {
      const e = await estadoCalendario()
      const lectivo = e?.es_lectivo
      box.innerHTML = `
        <div class="alert alert-${lectivo ? 'success' : 'secondary'} d-flex align-items-center gap-3 mb-0">
          <i class="bi bi-${lectivo ? 'calendar-check-fill' : 'calendar-x-fill'} fs-3"></i>
          <div>
            <strong class="d-block">${lectivo ? 'Hoy es día lectivo' : 'Hoy no es día lectivo'}</strong>
            <span class="small">${escapeHTML(e?.detalle ?? '')}</span>
            ${!lectivo ? '<div class="small text-muted mt-1">No se solicita registro de asistencia y las sesiones de hoy no cuentan como pendientes del docente.</div>' : ''}
          </div>
        </div>`
    } catch (err) {
      box.innerHTML = `<div class="alert alert-danger mb-0">${escapeHTML(err.message)}</div>`
    }
  }

  // ── Rango del período ─────────────────────────────────────────────────────
  function pintarRango() {
    const box = container.querySelector('#cl-rango')
    if (!periodoActual) { box.innerHTML = ''; return }
    const p = periodoActual

    box.innerHTML = `
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-body-tertiary border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Vigencia</h5>
          ${p.cerrado ? '<span class="badge bg-secondary rounded-pill">Cerrado</span>'
                      : '<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Abierto</span>'}
        </div>
        <div class="card-body">
          <div class="row g-3 mb-3">
            <div class="col-6">
              <div class="text-muted small text-uppercase fw-semibold" style="font-size:.68rem;">Inicio</div>
              <div class="fs-6 fw-bold">${escapeHTML(fmt(p.fecha_inicio))}</div>
            </div>
            <div class="col-6">
              <div class="text-muted small text-uppercase fw-semibold" style="font-size:.68rem;">Fin</div>
              <div class="fs-6 fw-bold">${escapeHTML(fmt(p.fecha_fin))}</div>
            </div>
          </div>
          <p class="small text-muted mb-3">
            Dentro de este rango el sistema exige registro de asistencia. Fuera de él, no.
          </p>
          <button id="cl-editar-rango" class="btn btn-outline-primary btn-sm w-100" ${p.cerrado ? 'disabled' : ''}>
            <i class="bi bi-pencil"></i> Editar vigencia
          </button>
        </div>
      </div>`

    box.querySelector('#cl-editar-rango')?.addEventListener('click', abrirEdicionRango)
  }

  function abrirEdicionRango() {
    const p = periodoActual
    AppModal.open({
      title: `Vigencia de ${p.nombre}`,
      saveText: 'Guardar',
      body: `<form class="row g-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Fecha de inicio *</label>
          <input type="date" class="form-control" id="cl-fi" value="${escapeHTML(p.fecha_inicio ?? '')}" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Fecha de fin *</label>
          <input type="date" class="form-control" id="cl-ff" value="${escapeHTML(p.fecha_fin ?? '')}" required>
        </div>
        <div class="col-12">
          <div class="alert alert-info small mb-0">
            Los semestres suelen ir de mediados de enero a principios de julio, y de
            mediados de agosto a mediados de diciembre. Ajuste las fechas al calendario real:
            de este rango depende qué días se exige registro.
          </div>
        </div>
      </form>`,
      onSave: async (body) => {
        const fi = body.querySelector('#cl-fi').value
        const ff = body.querySelector('#cl-ff').value
        if (!fi || !ff) { toast('Complete ambas fechas', 'warning'); return false }
        if (new Date(ff) <= new Date(fi)) { toast('La fecha de fin debe ser posterior al inicio', 'warning'); return false }
        try {
          await PeriodosApi.actualizarPeriodo(p.id, { fecha_inicio: fi, fecha_fin: ff })
          toast('Vigencia actualizada')
          await recargar(p.id)
        } catch (err) { toast(err.message, 'danger'); return false }
      },
    })
  }

  // ── Semáforo de cierre ────────────────────────────────────────────────────
  async function pintarCierre() {
    const box = container.querySelector('#cl-cierre')
    if (!periodoActual) { box.innerHTML = ''; return }

    box.innerHTML = `<div class="card border-0 shadow-sm h-100"><div class="card-body text-center py-5">
      <div class="spinner-border text-primary"></div></div></div>`

    let v
    try {
      v = await validarCierre(periodoActual.id)
    } catch (err) {
      box.innerHTML = `<div class="alert alert-danger">${escapeHTML(err.message)}</div>`
      return
    }

    const sem = SEMAFORO[v.semaforo] ?? SEMAFORO.SIN_SESIONES
    const puede = v.puede_cerrar === true
    const cerrado = periodoActual.cerrado

    box.innerHTML = `
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-body-tertiary border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Cierre del período</h5>
          <span class="badge bg-${sem.tone} rounded-pill">${escapeHTML(sem.label)}</span>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-baseline mb-1">
            <span class="small text-muted">Sesiones con registro completo</span>
            <strong>${v.completas ?? 0} / ${v.total_sesiones ?? 0}</strong>
          </div>
          <div class="progress mb-3" style="height:10px;">
            <div class="progress-bar bg-${sem.tone}" style="width:${v.pct_completitud ?? 0}%"></div>
          </div>
          <p class="small text-muted">${escapeHTML(v.criterio ?? '')}</p>

          ${(v.por_maestro ?? []).filter(m => Number(m.incompletas) > 0).length === 0 ? '' : `
            <h6 class="fw-bold small mt-3 mb-2">Pendientes por docente</h6>
            <div class="list-group list-group-flush" style="max-height:200px;overflow-y:auto;">
              ${(v.por_maestro ?? []).filter(m => Number(m.incompletas) > 0).map(m => `
                <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <span class="small">${escapeHTML(m.maestro ?? '—')}</span>
                  <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
                    ${escapeHTML(String(m.incompletas))} sin registrar
                  </span>
                </div>`).join('')}
            </div>`}

          ${cerrado
            ? '<div class="alert alert-secondary small mt-3 mb-0">Este período ya fue cerrado formalmente.</div>'
            : `<button id="cl-cerrar" class="btn btn-${puede ? 'success' : 'warning'} w-100 mt-3">
                 <i class="bi bi-archive"></i> ${puede ? 'Cerrar período' : 'Cerrar con justificación'}
               </button>
               ${puede ? '' : '<div class="form-text mt-1">El semáforo no está en verde: se exigirá una justificación escrita.</div>'}`}
        </div>
      </div>`

    box.querySelector('#cl-cerrar')?.addEventListener('click', () => abrirCierre(v, puede))
  }

  function abrirCierre(v, puede) {
    AppModal.open({
      title: `Cierre formal: ${periodoActual.nombre}`,
      saveText: puede ? 'Confirmar cierre' : 'Cerrar con justificación',
      body: `
        <div class="p-1">
          ${puede
            ? `<div class="alert alert-success small">
                 Los ${v.total_sesiones} registros del período están completos. El cierre archiva
                 un snapshot inmutable de los datos.
               </div>`
            : `<div class="alert alert-warning small">
                 <strong>Faltan ${escapeHTML(String(v.incompletas))} de ${escapeHTML(String(v.total_sesiones))} registros.</strong>
                 Cerrar ahora deja constancia de que se aprobó con datos incompletos.
                 La justificación se archiva junto al detalle de lo que faltaba.
               </div>`}
          <label class="form-label small fw-semibold">
            ${puede ? 'Observaciones (opcional)' : 'Justificación *'}
          </label>
          <textarea id="cl-just" class="form-control" rows="3"
            placeholder="${puede ? 'Notas sobre el cierre…' : 'Explique por qué se cierra con registros incompletos…'}"></textarea>
        </div>`,
      onSave: async (body) => {
        const just = body.querySelector('#cl-just').value.trim()
        if (!puede && !just) { toast('La justificación es obligatoria', 'warning'); return false }
        try {
          await cerrarPeriodo(periodoActual.id, { observaciones: just || null, forzar: !puede })
          toast('Período cerrado y snapshot archivado')
          await recargar(periodoActual.id)
        } catch (err) { toast(err.message, 'danger'); return false }
      },
    })
  }

  // ── Excepciones ───────────────────────────────────────────────────────────
  async function pintarExcepciones() {
    const box = container.querySelector('#cl-excepciones')
    if (!periodoActual) { box.innerHTML = ''; return }

    let lista = []
    try { lista = await listarExcepciones(periodoActual.id) }
    catch (err) { box.innerHTML = `<div class="alert alert-danger">${escapeHTML(err.message)}</div>`; return }

    box.innerHTML = `
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-body-tertiary border-0 py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0 fw-bold">Días no lectivos</h5>
            <span class="small text-muted">Feriados, recesos y suspensiones dentro del período</span>
          </div>
          <button id="cl-nueva-exc" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Agregar</button>
        </div>
        <div class="card-body p-0">
          ${lista.length === 0
            ? `<p class="text-muted text-center py-4 mb-0">
                 Sin días no lectivos registrados. Todo día del rango se considera lectivo
                 y se exigirá registro de asistencia.
               </p>`
            : `<div class="table-responsive"><table class="table table-hover align-middle mb-0">
                <thead class="table-light"><tr>
                  <th class="ps-4">Desde</th><th>Hasta</th><th>Tipo</th><th>Motivo</th>
                  <th>Alcance</th><th class="text-end pe-4">Acción</th>
                </tr></thead>
                <tbody>${lista.map(e => `
                  <tr>
                    <td class="ps-4">${escapeHTML(fmt(e.fecha_inicio))}</td>
                    <td>${escapeHTML(fmt(e.fecha_fin))}</td>
                    <td><span class="badge bg-body-tertiary text-body border">${escapeHTML(TIPO_EXCEPCION[e.tipo] ?? e.tipo)}</span></td>
                    <td>${escapeHTML(e.motivo)}</td>
                    <td>${e.periodo_id
                          ? '<span class="small text-muted">Este período</span>'
                          : '<span class="small text-primary">Global</span>'}</td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-danger" data-del="${escapeHTML(e.id)}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>`).join('')}</tbody></table></div>`}
        </div>
      </div>`

    box.querySelector('#cl-nueva-exc')?.addEventListener('click', abrirNuevaExcepcion)
    box.querySelectorAll('[data-del]').forEach(b => {
      b.addEventListener('click', async () => {
        try {
          await eliminarExcepcion(b.dataset.del)
          toast('Día no lectivo eliminado')
          await pintarExcepciones(); await pintarHoy(); await pintarCierre()
        } catch (err) { toast(err.message, 'danger') }
      })
    })
  }

  function abrirNuevaExcepcion() {
    AppModal.open({
      title: 'Agregar día no lectivo',
      saveText: 'Agregar',
      body: `<form class="row g-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Desde *</label>
          <input type="date" class="form-control" id="ex-fi" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Hasta</label>
          <input type="date" class="form-control" id="ex-ff">
          <div class="form-text">Si se deja vacío, aplica a un solo día.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Tipo</label>
          <select class="form-select" id="ex-tipo">
            ${Object.entries(TIPO_EXCEPCION).map(([k, v]) =>
              `<option value="${escapeHTML(k)}">${escapeHTML(v)}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Alcance</label>
          <select class="form-select" id="ex-alcance">
            <option value="periodo">Solo este período</option>
            <option value="global">Global (todos los períodos)</option>
          </select>
          <div class="form-text">Global sirve para feriados nacionales recurrentes.</div>
        </div>
        <div class="col-12">
          <label class="form-label small fw-semibold">Motivo *</label>
          <input type="text" class="form-control" id="ex-motivo" placeholder="Ej: Semana Santa, Día de la Independencia…" required>
        </div>
      </form>`,
      onSave: async (body) => {
        const fi = body.querySelector('#ex-fi').value
        const ff = body.querySelector('#ex-ff').value
        const motivo = body.querySelector('#ex-motivo').value.trim()
        const tipo = body.querySelector('#ex-tipo').value
        const global = body.querySelector('#ex-alcance').value === 'global'

        if (!fi || !motivo) { toast('Complete la fecha y el motivo', 'warning'); return false }
        try {
          await crearExcepcion({
            periodoId: global ? null : periodoActual.id,
            fechaInicio: fi, fechaFin: ff || fi, motivo, tipo,
          })
          toast('Día no lectivo agregado')
          await pintarExcepciones(); await pintarHoy(); await pintarCierre()
        } catch (err) { toast(err.message, 'danger'); return false }
      },
    })
  }

  // ── Carga ─────────────────────────────────────────────────────────────────
  async function recargar(seleccionar = null) {
    periodos = await PeriodosApi.getPeriodos()

    if (periodos.length === 0) {
      // Cero filas no equivale a "no existen": RLS filtra sin devolver error.
      const motivo = await explicarListaVacia()
      sel.innerHTML = '<option value="">Sin períodos</option>'
      container.querySelector('#cl-hoy').innerHTML =
        `<div class="alert alert-warning mb-0"><strong>No hay períodos disponibles.</strong>
         <div class="small">${escapeHTML(motivo)}</div></div>`
      container.querySelector('#cl-rango').innerHTML = ''
      container.querySelector('#cl-cierre').innerHTML = ''
      container.querySelector('#cl-excepciones').innerHTML = ''
      return
    }

    const elegido = seleccionar ?? sel.value ?? periodos.find(p => p.activo)?.id ?? periodos[0].id
    sel.innerHTML = periodos.map(p => {
      const marca = p.activo ? ' — activo' : p.cerrado ? ' — cerrado' : ''
      return `<option value="${escapeHTML(p.id)}" ${p.id === elegido ? 'selected' : ''}>${escapeHTML(p.nombre)}${escapeHTML(marca)}</option>`
    }).join('')

    periodoActual = periodos.find(p => p.id === sel.value) ?? periodos[0]
    pintarRango()
    await Promise.all([pintarHoy(), pintarCierre(), pintarExcepciones()])
  }

  sel.addEventListener('change', () => recargar(sel.value))

  try {
    await recargar()
  } catch (err) {
    container.querySelector('#cl-hoy').innerHTML =
      `<div class="alert alert-danger mb-0">${escapeHTML(err.message)}</div>`
  }
}

export { anularSesionesNoLectivas }
