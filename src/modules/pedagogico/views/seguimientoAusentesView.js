import { AppModal } from '../../../shared/components/AppModal.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
import {
  getPeriodoActivo,
  fetchSeguimientoAusentes,
  fetchHistorialSeguimiento,
  resolverContactoAlumno,
  enviarSeguimientoAusentismo,
  reiniciarContadorAusencias,
  suspenderAlumno,
} from '../services/seguimientoAusentesService.js'

const state = {
  alumnos: [],
  busqueda: '',
  container: null,
  totalCount: 0,
  nivel3Count: 0,
  periodo: null,
  limit: 50,
  offset: 0,
  loading: false,
  filtroNivel: null,
  filtroMaestro: null,
  soloSinContacto: false,
  maestros: [],
}

export async function renderSeguimientoAusentesView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = _renderLoading()

  try {
    await _loadData()
    _render()
    _attachEvents()
  } catch (err) {
    console.error('[SeguimientoAusentes]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _loadData() {
  state.loading = true
  state.periodo = await getPeriodoActivo()

  const result = await fetchSeguimientoAusentes({
    nivel: state.filtroNivel,
    maestroId: state.filtroMaestro,
    soloSinContacto: state.soloSinContacto,
    busqueda: state.busqueda,
    limit: state.limit,
    offset: state.offset,
  })

  state.alumnos = result.alumnos || []
  state.totalCount = result.totalCount || 0

  // Count nivel 3 for banner
  state.nivel3Count = state.alumnos.filter((a) => a.nivel === 3).length

  // Extract unique maestros for filter dropdown
  const maestroSet = new Set()
  state.alumnos.forEach((a) => {
    if (a.maestro_id && a.maestro_nombre) {
      maestroSet.add(JSON.stringify({ id: a.maestro_id, nombre: a.maestro_nombre }))
    }
  })
  state.maestros = Array.from(maestroSet).map((s) => JSON.parse(s))

  state.loading = false
}

function _renderLoading() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-center" style="height:300px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    </div>
  `
}

function _render() {
  const currentPage = Math.floor(state.offset / state.limit) + 1
  const totalPages = Math.max(1, Math.ceil(state.totalCount / state.limit))

  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-exclamation-circle fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Seguimiento de Ausentes</h1>
          <p class="text-muted small mb-0">
            ${state.alumnos[0]?.periodo_nombre ? `${state.alumnos[0].periodo_nombre} · ` : ''}${state.totalCount} alumno${state.totalCount !== 1 ? 's' : ''}
            · N1: ${state.alumnos.filter((a) => a.nivel === 1).length}
            · N2: ${state.alumnos.filter((a) => a.nivel === 2).length}
            · N3: ${state.alumnos.filter((a) => a.nivel === 3).length}
            <span class="ms-1">(acumulado del período académico)</span>
          </p>
        </div>
        <button class="btn-help-trigger" id="btn-help-ausentes" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <!-- Nivel 3 Banner -->
      ${state.nivel3Count > 0 ? `
        <div class="alert alert-danger border-0 d-flex align-items-center gap-2 mb-3 py-2" data-nivel3-alert>
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span style="font-size:0.85rem;"><strong>${state.nivel3Count}</strong> alumno${state.nivel3Count !== 1 ? 's' : ''} en nivel 3 (retención de instrumento)</span>
        </div>
      ` : ''}

      <!-- Filtros -->
      <div class="mb-3 p-2 bg-body-tertiary border rounded">
        <div class="row g-2">
          <div class="col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0" id="busqueda-ausente"
                     placeholder="Buscar alumno..." value="${state.busqueda}">
            </div>
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" id="filtro-nivel" data-filter="nivel">
              <option value="">Todos los niveles</option>
              <option value="1" ${state.filtroNivel === 1 ? 'selected' : ''}>Nivel 1</option>
              <option value="2" ${state.filtroNivel === 2 ? 'selected' : ''}>Nivel 2</option>
              <option value="3" ${state.filtroNivel === 3 ? 'selected' : ''}>Nivel 3</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" id="filtro-maestro" data-filter="maestro">
              <option value="">Todos los maestros</option>
              ${state.maestros.map((m) => `<option value="${m.id}" ${state.filtroMaestro === m.id ? 'selected' : ''}>${m.nombre}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="solo-sin-contacto" data-filter="solo-sin-contacto" ${state.soloSinContacto ? 'checked' : ''}>
              <label class="form-check-label small" for="solo-sin-contacto">Sólo sin contactar</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista -->
      <div class="d-flex flex-column gap-2" id="lista-ausentes">
        ${state.alumnos.length > 0
          ? state.alumnos.map((a) => _renderAlumnoRow(a)).join('')
          : '<div class="text-center text-muted py-5" data-empty-state>Sin alumnos con ausencias acumuladas en el período.</div>'}
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <button class="btn btn-sm btn-outline-secondary" id="btn-prev-page" ${state.offset <= 0 ? 'disabled' : ''}>
          <i class="bi bi-chevron-left me-1"></i>Anterior
        </button>
        <span class="text-muted small" data-pagination-info>Mostrando ${state.offset + 1}-${Math.min(state.offset + state.alumnos.length, state.totalCount)} de ${state.totalCount}</span>
        <button class="btn btn-sm btn-outline-secondary" id="btn-next-page" ${state.offset + state.limit >= state.totalCount ? 'disabled' : ''}>
          Siguiente<i class="bi bi-chevron-right ms-1"></i>
        </button>
      </div>
    </div>
  `

}

function _abrirAyuda() {
  HelpPanel.open({
    title: 'Seguimiento de Ausentes',
    intro: 'El número es "faltas / días con clase" acumulado desde el inicio del período académico: días con inasistencia sin justificar sobre los días que el alumno tuvo clase. Si falta a varias clases el mismo día, cuenta una sola vez. Para poner el contador en cero usá "Reiniciar contador" en el detalle del alumno.',
    sections: [
      { icon: 'bi-1-circle-fill', title: 'Nivel 1 — Aviso preventivo', description: 'Se contacta al representante para entender la situación.', color: '#d99a2b' },
      { icon: 'bi-2-circle-fill', title: 'Nivel 2 — Comunicación institucional', description: 'Mensaje formal con fecha límite. Requiere respuesta de la familia.', color: '#c2560f' },
      { icon: 'bi-3-circle-fill', title: 'Nivel 3 — Retención de instrumento', description: 'El instrumento queda retenido. El alumno se reincorpora firmando un acta de compromiso.', color: '#9a1f3a' },
      { icon: 'bi-sliders', title: 'Umbrales configurables', description: 'La cantidad de días de cada nivel la define el Departamento Académico en seguimiento_reglas.', color: '#6b7280' },
    ],
  })
}

// Colores de nivel: saturados, legibles sobre fondo claro y oscuro (no dependen del tema).
const NIVEL_STYLE = {
  1: { bg: '#b7791f', fg: '#fff' },
  2: { bg: '#c2410c', fg: '#fff' },
  3: { bg: '#9f1239', fg: '#fff' },
}

function _nivelStyle(nivel) {
  return NIVEL_STYLE[nivel] || { bg: 'var(--bs-secondary)', fg: '#fff' }
}

function badgeStyleFromNivel(nivel) {
  const s = _nivelStyle(nivel)
  return `background:${s.bg};color:${s.fg};`
}

function _renderAlumnoRow(alumno) {
  const ns = _nivelStyle(alumno.nivel)
  const badgeStyle = `background:${ns.bg};color:${ns.fg};`

  const waBtn = alumno.contacto_telefono
    ? `<button class="btn btn-sm w-100" data-wa data-nivel="${alumno.nivel}"
         style="background:#25d366;color:#fff;border:0;"
         title="Enviar el mensaje de nivel ${alumno.nivel} al representante por WhatsApp">
         <i class="bi bi-whatsapp me-1"></i>Nivel ${alumno.nivel}
       </button>`
    : `<button class="btn btn-sm btn-outline-secondary w-100" disabled title="Sin teléfono de contacto registrado">
         <i class="bi bi-whatsapp me-1"></i>Sin contacto
       </button>`

  const faltas = `${alumno.dias_ausente}/${alumno.dias_clase ?? alumno.dias_ausente}`

  return `
    <div class="card mb-2" data-alumno-id="${alumno.alumno_id}" style="border-left: 4px solid ${ns.bg}; cursor: pointer;">
      <div class="card-body p-3">
        <div class="row align-items-center g-3">
          <div class="col-md-4">
            <p class="mb-0"><strong>${alumno.alumno_nombre}</strong></p>
            <small class="text-muted">${alumno.instrumento_principal}</small>
            <p class="small text-muted mb-0">${alumno.clase_nombres}</p>
          </div>
          <div class="col-md-2">
            <div class="text-center">
              <div class="badge p-2 d-inline-block" data-nivel="${alumno.nivel}" style="font-size:1rem;${badgeStyle}">
                ${faltas}
              </div>
              <p class="small text-muted mb-0">faltas / días con clase</p>
            </div>
          </div>
          <div class="col-md-2">
            ${alumno.contacto_telefono
              ? `<p class="small mb-0"><strong>${alumno.contacto_nombre || 'Contacto'}</strong></p><p class="small text-muted mb-0">${alumno.contacto_telefono}</p>`
              : '<span class="badge bg-danger" data-sin-contacto>Sin contacto</span>'}
          </div>
          <div class="col-md-2">
            ${alumno.ultimo_seguimiento_fecha
              ? `<small class="text-muted" data-ult-seg>N${alumno.ultimo_seguimiento_nivel} • ${String(alumno.ultimo_seguimiento_fecha).slice(0, 10)} • ${alumno.ultimo_seguimiento_resultado || ''}</small>`
              : '<small class="text-muted" data-ult-seg>Sin contactar</small>'}
          </div>
          <div class="col-md-2">
            ${waBtn}
          </div>
        </div>
      </div>
    </div>
  `
}

function _toast(message, type = 'info') {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }))
}

async function _enviarWhatsApp(alumnoId, nivel) {
  const alumno = state.alumnos.find((a) => a.alumno_id === alumnoId)
  if (!alumno) return

  try {
    const { waUrl } = await enviarSeguimientoAusentismo({ alumno, nivel: Number(nivel) })
    window.open(waUrl, '_blank', 'noopener')
    _toast(`Mensaje de nivel ${nivel} abierto en WhatsApp y registrado como contacto.`, 'success')
    // refrescar para que el "último seguimiento" de la fila se actualice
    await _loadData()
    _render()
    _attachEvents()
  } catch (err) {
    if (err.message === 'CONTACTO_DUPLICADO') {
      _toast('Ya se registró un contacto de este nivel en los últimos 120 minutos.', 'warning')
    } else if (err.message === 'SIN_CONTACTO') {
      _toast('Este alumno no tiene un teléfono de contacto válido.', 'error')
    } else {
      console.error('[enviarWhatsApp]', err)
      _toast('No se pudo registrar el contacto. Intentá de nuevo.', 'error')
    }
  }
}

function _attachEvents() {
  // Ayuda
  state.container.querySelector('#btn-help-ausentes')?.addEventListener('click', _abrirAyuda)

  // Debounced search
  const busquedaInput = state.container.querySelector('#busqueda-ausente')
  if (busquedaInput) {
    let debounceTimer
    busquedaInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        state.busqueda = e.target.value
        state.offset = 0
        await _loadData()
        _render()
        _attachEvents()
      }, 300)
    })
  }

  // Filtro nivel
  const nivelSelect = state.container.querySelector('#filtro-nivel')
  if (nivelSelect) {
    nivelSelect.addEventListener('change', async (e) => {
      state.filtroNivel = e.target.value ? parseInt(e.target.value) : null
      state.offset = 0
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Filtro maestro
  const maestroSelect = state.container.querySelector('#filtro-maestro')
  if (maestroSelect) {
    maestroSelect.addEventListener('change', async (e) => {
      state.filtroMaestro = e.target.value || null
      state.offset = 0
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Filtro sin contacto
  const soloSinContactoCheck = state.container.querySelector('#solo-sin-contacto')
  if (soloSinContactoCheck) {
    soloSinContactoCheck.addEventListener('change', async (e) => {
      state.soloSinContacto = e.target.checked
      state.offset = 0
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Pagination
  const prevBtn = state.container.querySelector('#btn-prev-page')
  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      state.offset = Math.max(0, state.offset - state.limit)
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  const nextBtn = state.container.querySelector('#btn-next-page')
  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      state.offset += state.limit
      await _loadData()
      _render()
      _attachEvents()
    })
  }

  // Botón de WhatsApp por fila (delegado; frena la apertura del panel)
  state.container.querySelectorAll('[data-alumno-id]').forEach((row) => {
    const alumnoId = row.getAttribute('data-alumno-id')

    row.querySelector('[data-wa]')?.addEventListener('click', async (e) => {
      e.stopPropagation()
      const btn = e.currentTarget
      const nivel = btn.getAttribute('data-nivel')
      btn.disabled = true
      await _enviarWhatsApp(alumnoId, nivel)
    })

    // Click en el resto de la fila → panel de detalle
    row.addEventListener('click', async () => {
      const alumno = state.alumnos.find((a) => a.alumno_id === alumnoId)
      if (alumno) await _openDetailPanel(alumno)
    })
  })
}

async function _openDetailPanel(alumno) {
  // Resolve cascade contact
  const contactCascade = await resolverContactoAlumno(alumno.alumno_id)

  // Histórico de contactos (vía data service)
  const historicoRows = await fetchHistorialSeguimiento(alumno.alumno_id)

  const modalContent = `
    <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
      <div class="row mb-4">
        <div class="col-md-6">
          <h5>Información del Alumno</h5>
          <p><strong>${alumno.alumno_nombre}</strong></p>
          <p class="text-muted small">${alumno.instrumento_principal} • ${alumno.clase_nombres}</p>
          <p class="text-muted small">Maestro: ${alumno.maestro_nombre}</p>
        </div>
        <div class="col-md-6">
          <h5>Contacto Resuelto</h5>
          ${contactCascade.origen
            ? `
              <p><strong>${contactCascade.nombre || 'N/A'}</strong></p>
              <p class="small text-muted">${contactCascade.telefono || 'N/A'}</p>
              <p class="small text-muted">Origen: ${contactCascade.origen}</p>
            `
            : '<p class="text-muted">Sin contacto disponible</p>'}
        </div>
      </div>

      <div class="row mb-4">
        <div class="col">
          <h5>Ausencias del período${alumno.periodo_nombre ? ` (${alumno.periodo_nombre})` : ''}</h5>
          <p>Faltó a <strong>${alumno.dias_ausente}</strong> de <strong>${alumno.dias_clase ?? alumno.dias_ausente}</strong> días de clase &nbsp;
            <span class="badge" style="${badgeStyleFromNivel(alumno.nivel)}">Nivel ${alumno.nivel}</span></p>
          <p class="small text-muted">Última ausencia: ${alumno.ultima_ausencia_fecha ? String(alumno.ultima_ausencia_fecha).slice(0, 10) : '—'} · acumulado desde el inicio del período</p>
        </div>
      </div>

      <div class="mb-4">
        <h5>Histórico de Seguimiento</h5>
        ${historicoRows.length > 0
          ? `
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nivel</th>
                  <th>Resultado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                ${historicoRows
                  .map(
                    (h) => `
                  <tr>
                    <td class="small">${h.fecha || '—'}</td>
                    <td class="small">N${h.nivel || '—'}</td>
                    <td class="small">${h.resultado || '—'}</td>
                    <td class="small">${h.notas || '—'}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          `
          : '<p class="text-muted small">Sin seguimiento registrado.</p>'}
      </div>

      <div class="mb-4">
        <h5>Enviar mensaje por WhatsApp</h5>
        <div class="gap-2 d-flex flex-wrap">
          ${[1, 2, 3].map((n) => `
            <button class="btn btn-sm" data-wa-modal data-nivel="${n}"
              style="background:#25d366;color:#fff;border:0;${!alumno.contacto_telefono ? 'opacity:.5;pointer-events:none;' : ''}"
              ${!alumno.contacto_telefono ? 'disabled' : ''}
              title="${alumno.contacto_telefono ? `Mensaje de nivel ${n} al representante` : 'Sin teléfono de contacto'}">
              <i class="bi bi-whatsapp me-1"></i>Nivel ${n}${n === alumno.nivel ? ' (actual)' : ''}
            </button>
          `).join('')}
          <button class="btn btn-sm btn-outline-danger" disabled title="Disponible en Fase 3" data-action="retencion-nivel-3">
            Retener instrumento
          </button>
        </div>
        <p class="small text-muted mt-2 mb-0">Abre WhatsApp con el mensaje precargado. Revisalo antes de enviar; el contacto queda registrado.</p>
      </div>

      <div class="border-top pt-3">
        <h5>Gestión del alumno</h5>
        <div class="gap-2 d-flex flex-wrap">
          <button class="btn btn-sm btn-outline-secondary" data-accion-reiniciar>
            <i class="bi bi-arrow-counterclockwise me-1"></i>Reiniciar contador a 0
          </button>
          <button class="btn btn-sm btn-outline-warning" data-accion-suspender>
            <i class="bi bi-pause-circle me-1"></i>Suspender temporalmente
          </button>
        </div>

        <div class="mt-3 p-3 bg-body-tertiary border rounded d-none" data-form-suspender>
          <label class="form-label small mb-1">Motivo de la suspensión</label>
          <textarea class="form-control form-control-sm mb-2" rows="2" data-susp-motivo
            placeholder="Ej.: viaje familiar, tratamiento médico, pausa acordada…"></textarea>
          <label class="form-label small mb-1">Reactivar el (opcional)</label>
          <input type="date" class="form-control form-control-sm mb-2" data-susp-hasta>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-warning" data-susp-confirmar>Confirmar suspensión</button>
            <button class="btn btn-sm btn-outline-secondary" data-susp-cancelar>Cancelar</button>
          </div>
        </div>

        <p class="small text-muted mt-2 mb-0">
          <strong>Reiniciar contador:</strong> las ausencias previas dejan de contar para el escalamiento (queda registro de quién lo hizo).
          <strong>Suspender:</strong> el alumno sale del panel mientras dure la pausa; no lo da de baja.
        </p>
      </div>
    </div>
  `

  AppModal.open({
    title: `Detalle: ${alumno.alumno_nombre}`,
    body: modalContent,
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    onOpen: (modalEl) => {
      if (!modalEl) return

      modalEl.querySelectorAll('[data-wa-modal]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const nivel = btn.getAttribute('data-nivel')
          btn.disabled = true
          AppModal.close?.()
          await _enviarWhatsApp(alumno.alumno_id, nivel)
        })
      })

      // Reiniciar contador
      modalEl.querySelector('[data-accion-reiniciar]')?.addEventListener('click', async (e) => {
        if (!window.confirm(`¿Reiniciar el contador de ausencias de ${alumno.alumno_nombre} a 0?\n\nLas ausencias registradas hasta hoy dejan de contar para el escalamiento.`)) return
        e.currentTarget.disabled = true
        try {
          await reiniciarContadorAusencias({ alumnoId: alumno.alumno_id, motivo: 'Reinicio manual desde el panel de seguimiento' })
          AppModal.close?.()
          _toast(`Contador de ${alumno.alumno_nombre} reiniciado a 0.`, 'success')
          await _loadData(); _render(); _attachEvents()
        } catch (err) {
          console.error(err)
          _toast('No se pudo reiniciar el contador.', 'error')
          e.currentTarget.disabled = false
        }
      })

      // Suspender — mostrar el mini-formulario
      const form = modalEl.querySelector('[data-form-suspender]')
      modalEl.querySelector('[data-accion-suspender]')?.addEventListener('click', () => form?.classList.remove('d-none'))
      modalEl.querySelector('[data-susp-cancelar]')?.addEventListener('click', () => form?.classList.add('d-none'))
      modalEl.querySelector('[data-susp-confirmar]')?.addEventListener('click', async (e) => {
        const motivo = modalEl.querySelector('[data-susp-motivo]')?.value.trim() || ''
        const hasta = modalEl.querySelector('[data-susp-hasta]')?.value || null
        if (!motivo) { _toast('Indicá el motivo de la suspensión.', 'warning'); return }
        e.currentTarget.disabled = true
        try {
          await suspenderAlumno({ alumnoId: alumno.alumno_id, motivo, hasta })
          AppModal.close?.()
          _toast(`${alumno.alumno_nombre} quedó suspendido temporalmente${hasta ? ` hasta ${hasta}` : ''}.`, 'success')
          await _loadData(); _render(); _attachEvents()
        } catch (err) {
          console.error(err)
          _toast('No se pudo suspender al alumno.', 'error')
          e.currentTarget.disabled = false
        }
      })
    },
  })
}
