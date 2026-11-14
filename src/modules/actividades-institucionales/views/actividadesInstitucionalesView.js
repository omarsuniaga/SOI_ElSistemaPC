/**
 * Vista "Actividades Institucionales" — bandeja de feriados, suspensiones y
 * actividades especiales, con revisión de impacto y aprobación.
 * Ver docs/planning/SPEC_actividades_institucionales_SOI.md §6.
 */

import {
  listarActividades,
  obtenerActividad,
  resolverAlumnosConvocados,
  crearActividad,
  eliminarActividad,
  previsualizarImpacto,
  listarAlumnosDeClase,
  aprobarActividad,
  rechazarActividad,
  obtenerListaAsistenciaActividad,
  registrarAsistenciaActividad,
} from '../api/actividadesInstitucionalesApi.js'
import { fechasActividad } from '../../../shared/utils/institutionalDates.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerProgramas } from '../../programas/api/programasApi.js'
import { obtenerClases } from '../../clases/api/clasesApi.js'
import { obtenerMaestrosActivos } from '../../maestros/api/maestrosApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { router } from '../../../core/router/router.js'

const CATEGORIA_LABEL = {
  feriado: 'Feriado / Cierre',
  suspension: 'Suspensión',
  actividad_especial: 'Actividad Especial',
}
const ESTADO_LABEL = {
  programado: 'Programada',
  completado: 'Realizada',
  en_curso: 'En curso',
  borrador: 'Borrador',
  pendiente_revision: 'Pendiente de revisión',
  aprobado: 'Aprobada',
  rechazado: 'Rechazada',
  cancelado: 'Cancelada',
}
const ESTADO_BADGE = {
  borrador: 'bg-secondary-subtle text-secondary-emphasis',
  pendiente_revision: 'bg-warning-subtle text-warning-emphasis',
  aprobado: 'bg-success-subtle text-success-emphasis',
  rechazado: 'bg-danger-subtle text-danger-emphasis',
  cancelado: 'bg-secondary-subtle text-secondary-emphasis',
}
const TIPO_AFECTACION_LABEL = {
  suspendida: 'Suspendida (nadie asiste)',
  impartida_con_exencion: 'Impartida — con exenciones',
  impartida_sin_cambios: 'Impartida sin cambios',
  sustituida: 'Sustituida por la actividad',
}

function _createState() {
  return {
    actividades: [],
    filtroEstado: 'pendiente_revision',
    programas: [],
    clases: [],
    maestros: [],
    cargando: true,
  }
}

export async function renderActividadesInstitucionalesView(container, params = {}) {
  const state = _createState()
  if (params.estado !== undefined && ['', 'pendiente_revision', 'aprobado', 'rechazado', 'programado', 'completado', 'cancelado', 'borrador'].includes(params.estado)) state.filtroEstado=params.estado
  container.__aiState = state

  container.innerHTML = _renderLoading()

  try {
    const [actividades, programas, clases, maestros] = await Promise.all([
      listarActividades(),
      obtenerProgramas().catch(() => []),
      obtenerClases().catch(() => []),
      obtenerMaestrosActivos().catch(() => []),
    ])
    state.actividades = actividades
    state.programas = programas
    state.clases = clases
    state.maestros = maestros
  } catch (error) {
    container.innerHTML = _renderError(error.message)
    return
  }

  state.cargando = false
  _renderLayout(container)

  // Precarga desde "Actividad especial" en Clases de Hoy (fecha ya elegida).
  if (params?.crear) {
    _openCrearModal(container, { fechaInicial: params.fecha || null })
  }
}

function _renderLoading() {
  return `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `
}

function _renderError(mensaje) {
  return `
    <div class="alert alert-danger m-3">
      <i class="bi bi-exclamation-triangle me-2"></i>${_esc(mensaje)}
    </div>
  `
}

function _renderLayout(container) {
  const state = _getState(container)

  container.innerHTML = `
    <div class="ai-root page-container">
      <div class="card border-0 shadow-sm rounded-4 p-3 bg-body mb-3 border border-body-tertiary">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-3">
            <button type="button" class="btn btn-sm btn-outline-secondary" id="ai-btn-volver" title="Volver">
              <i class="bi bi-arrow-left"></i>
            </button>
            <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <i class="bi bi-calendar-event fs-4"></i>
            </div>
            <div>
              <h4 class="fw-bold mb-0 text-body">Actividades Institucionales</h4>
              <small class="text-muted">Feriados, suspensiones y actividades especiales con aprobación institucional.</small>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="ai-btn-crear">
            <i class="bi bi-plus-circle me-1"></i>Nueva actividad
          </button>
        </div>
      </div>

      <div class="d-flex gap-2 mb-3 flex-wrap" id="ai-tabs">
        ${_tabHTML('pendiente_revision', 'Pendientes')}
        ${_tabHTML('aprobado', 'Aprobadas')}
        ${_tabHTML('rechazado', 'Rechazadas')}
        ${_tabHTML('', 'Todas')}
      </div>

      <div id="ai-lista"></div>
    </div>
  `

  _renderLista(container)
  container.querySelector('#ai-btn-crear')?.addEventListener('click', () => _openCrearModal(container))
  container.querySelector('#ai-btn-volver')?.addEventListener('click', () => router.navigate('clases-hoy'))
  container.querySelectorAll('.ai-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filtroEstado = btn.dataset.estado
      _renderLayout(container)
    })
  })
}

function _tabHTML(estado, label) {
  return `<button type="button" class="btn btn-sm ai-tab" data-estado="${estado}">${label}</button>`
}

function _renderLista(container) {
  const state = _getState(container)
  const listEl = container.querySelector('#ai-lista')
  if (!listEl) return

  container.querySelectorAll('.ai-tab').forEach((btn) => {
    const activo = btn.dataset.estado === state.filtroEstado
    btn.className = `btn btn-sm ai-tab ${activo ? 'btn-primary' : 'btn-outline-secondary'}`
  })

  const items = state.filtroEstado
    ? state.actividades.filter((a) => a.estado === state.filtroEstado)
    : state.actividades

  if (!items.length) {
    listEl.innerHTML = `<div class="text-center text-muted py-5"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay actividades en esta vista.</div>`
    return
  }

  listEl.innerHTML = items.map((a) => _cardHTML(a)).join('')

  listEl.querySelectorAll('.ai-btn-cumpleanos').forEach(btn => btn.addEventListener('click', () => router.navigate('cumpleaneros', { period: btn.dataset.period })))
  listEl.querySelectorAll('.ai-btn-revisar').forEach((btn) => {
    btn.addEventListener('click', () => _openRevisarModal(container, btn.dataset.id))
  })
  listEl.querySelectorAll('.ai-btn-pasar-lista').forEach((btn) => {
    btn.addEventListener('click', () => _openPasarListaModal(container, btn.dataset.id))
  })
  listEl.querySelectorAll('.ai-btn-eliminar').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const actividad = state.actividades.find((a) => a.id === btn.dataset.id)
      if (!confirm(`¿Eliminar la propuesta "${actividad?.titulo}"? No se puede deshacer.`)) return
      try {
        await eliminarActividad(btn.dataset.id)
        state.actividades = await listarActividades()
        _renderLista(container)
        AppToast.success('Propuesta eliminada')
      } catch (err) {
        AppToast.error(err.message || 'No se pudo eliminar la propuesta')
      }
    })
  })
}

function _cardHTML(a) {
  const fechas = a.fechaInicio === a.fechaFin
    ? _formatFecha(a.fechaInicio)
    : `${_formatFecha(a.fechaInicio)} – ${_formatFecha(a.fechaFin)}`

  return `
    <div class="card border-0 shadow-sm rounded-4 p-3 mb-2 bg-body border border-body-tertiary">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span class="fw-bold text-body">${_esc(a.titulo)}</span>
            <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">${_esc(a.esCompartirCumpleanos ? 'Compartir de cumpleaños' : (CATEGORIA_LABEL[a.categoria] || a.categoria))}</span>
            <span class="badge ${ESTADO_BADGE[a.estado] || 'bg-secondary-subtle'} border">${_esc(ESTADO_LABEL[a.estado] || a.estado)}</span>
          </div>
          <div class="small text-muted">
            <i class="bi bi-calendar3 me-1"></i>${fechas}
            <span class="ms-2"><i class="bi bi-diagram-3 me-1"></i>Alcance: ${_esc(a.alcance)}</span>
            ${a.ubicacion ? `<span class="ms-2"><i class="bi bi-geo-alt me-1"></i>${_esc(a.ubicacion)}</span>` : ''}
          </div>
          ${a.motivoRechazo ? `<div class="small text-danger mt-1"><i class="bi bi-x-circle me-1"></i>${_esc(a.motivoRechazo)}</div>` : ''}
        </div>
        <div class="d-flex gap-1">
          ${a.esCompartirCumpleanos ? `<button type="button" class="btn btn-sm btn-outline-primary ai-btn-cumpleanos" data-period="${_esc(a.periodoCumpleanos)}">Gestionar compartir</button>` : a.estado === 'pendiente_revision' || a.estado === 'borrador'
            ? `
              <button type="button" class="btn btn-sm btn-outline-primary ai-btn-revisar" data-id="${_esc(a.id)}"><i class="bi bi-clipboard-check me-1"></i>Revisar</button>
              <button type="button" class="btn btn-sm btn-outline-danger ai-btn-eliminar" data-id="${_esc(a.id)}" title="Eliminar propuesta"><i class="bi bi-trash"></i></button>
            `
            : a.estado === 'aprobado'
              ? `
                <button type="button" class="btn btn-sm btn-outline-secondary ai-btn-revisar" data-id="${_esc(a.id)}"><i class="bi bi-pencil me-1"></i>Corregir</button>
                <button type="button" class="btn btn-sm btn-outline-success ai-btn-pasar-lista" data-id="${_esc(a.id)}"><i class="bi bi-people me-1"></i>Pasar Lista</button>
              `
              : ''}
        </div>
      </div>
    </div>
  `
}

// ── Crear actividad ─────────────────────────────────────────────────────

function _openCrearModal(container, { fechaInicial } = {}) {
  const state = _getState(container)

  const bodyHTML = `
    <div class="mb-3">
      <label class="form-label small fw-semibold">Título</label>
      <input type="text" class="form-control form-control-sm" id="ai-c-titulo" placeholder="Ej. Feriado — Día de la Independencia">
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold">Descripción</label>
      <textarea class="form-control form-control-sm" id="ai-c-descripcion" rows="2"></textarea>
    </div>
    <div class="row g-2 mb-3">
      <div class="col-6">
        <label class="form-label small fw-semibold">Categoría</label>
        <select class="form-select form-select-sm" id="ai-c-categoria">
          <option value="feriado">Feriado / Cierre</option>
          <option value="suspension">Suspensión</option>
          <option value="actividad_especial" selected>Actividad Especial</option>
        </select>
      </div>
      <div class="col-6">
        <label class="form-label small fw-semibold">Alcance</label>
        <select class="form-select form-select-sm" id="ai-c-alcance">
          <option value="institucional">Institucional (todo el centro)</option>
          <option value="programa">Un programa</option>
          <option value="clase">Clases específicas</option>
        </select>
        <div class="form-text" style="font-size:0.7rem;">Institucional = cierra todo (ej. feriado nacional). Programa = solo un programa, como la Orquesta. Clase = elegís vos cuáles.</div>
      </div>
    </div>
    <div class="row g-2 mb-1">
      <div class="col-6">
        <label class="form-label small fw-semibold">Fecha inicio</label>
        <input type="date" class="form-control form-control-sm" id="ai-c-fecha-inicio" value="${_esc(fechaInicial || '')}">
      </div>
      <div class="col-6">
        <label class="form-label small fw-semibold">Fecha fin</label>
        <input type="date" class="form-control form-control-sm" id="ai-c-fecha-fin" value="${_esc(fechaInicial || '')}" disabled>
      </div>
    </div>
    <div class="form-check mb-3">
      <input class="form-check-input" type="checkbox" id="ai-c-un-solo-dia" checked>
      <label class="form-check-label small" for="ai-c-un-solo-dia">Es de un solo día (la mayoría de los casos)</label>
    </div>
    <div class="mb-3" id="ai-c-programa-wrap" style="display:none;">
      <label class="form-label small fw-semibold">Programa convocado</label>
      <select class="form-select form-select-sm" id="ai-c-programa">
        <option value="">Selecciona un programa...</option>
        ${state.programas.map((p) => `<option value="${_esc(p.id)}">${_esc(p.nombre)}</option>`).join('')}
      </select>
    </div>
    <div class="mb-3" id="ai-c-clases-wrap" style="display:none;">
      <label class="form-label small fw-semibold">Clases convocadas</label>
      <div class="border rounded-3 p-2" style="max-height: 160px; overflow-y: auto;">
        ${state.clases.map((c) => `
          <div class="form-check">
            <input class="form-check-input ai-c-clase-chk" type="checkbox" value="${_esc(c.id)}" id="ai-c-clase-${_esc(c.id)}">
            <label class="form-check-label small" for="ai-c-clase-${_esc(c.id)}">${_esc(c.nombre)}</label>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="row g-2">
      <div class="col-6">
        <label class="form-label small fw-semibold">Ubicación</label>
        <input type="text" class="form-control form-control-sm" id="ai-c-ubicacion" placeholder="Ej. Auditorio Principal, Salón 4">
        <div class="form-text" style="font-size:0.7rem;">Dónde ocurre la actividad. Opcional — dejalo vacío si es un cierre general sin lugar puntual.</div>
      </div>
      <div class="col-6">
        <label class="form-label small fw-semibold">
          Responsable de asistencia
          <i class="bi bi-info-circle text-muted" title="La persona que va a pasar lista de presentes/ausentes de esta actividad (distinto de la asistencia a clase normal). Por ejemplo, quien dirige el ensayo."></i>
        </label>
        <select class="form-select form-select-sm" id="ai-c-responsable">
          <option value="">Sin asignar</option>
          ${state.maestros.map((m) => `<option value="${_esc(m.user_id || m.id)}">${_esc(m.nombre_completo || m.nombre)}</option>`).join('')}
        </select>
      </div>
    </div>
  `

  AppModal.open({
    title: 'Nueva Actividad Institucional',
    size: 'md',
    saveText: 'Crear propuesta',
    body: bodyHTML,
    onShow: (body) => {
      const alcanceSelect = body.querySelector('#ai-c-alcance')
      const toggleAlcance = () => {
        body.querySelector('#ai-c-programa-wrap').style.display = alcanceSelect.value === 'programa' ? 'block' : 'none'
        body.querySelector('#ai-c-clases-wrap').style.display = alcanceSelect.value === 'clase' ? 'block' : 'none'
      }
      alcanceSelect.addEventListener('change', toggleAlcance)
      toggleAlcance()

      const inicioInput = body.querySelector('#ai-c-fecha-inicio')
      const finInput = body.querySelector('#ai-c-fecha-fin')
      const unSoloDiaChk = body.querySelector('#ai-c-un-solo-dia')
      const sincronizarFin = () => { finInput.value = inicioInput.value }
      unSoloDiaChk.addEventListener('change', () => {
        finInput.disabled = unSoloDiaChk.checked
        if (unSoloDiaChk.checked) sincronizarFin()
      })
      inicioInput.addEventListener('change', () => {
        if (unSoloDiaChk.checked) sincronizarFin()
      })
    },
    onSave: async (body) => {
      const titulo = body.querySelector('#ai-c-titulo').value.trim()
      const descripcion = body.querySelector('#ai-c-descripcion').value.trim()
      const categoria = body.querySelector('#ai-c-categoria').value
      const alcance = body.querySelector('#ai-c-alcance').value
      const fechaInicio = body.querySelector('#ai-c-fecha-inicio').value
      const fechaFin = body.querySelector('#ai-c-fecha-fin').value
      const ubicacion = body.querySelector('#ai-c-ubicacion').value.trim()
      const responsableAsistenciaId = body.querySelector('#ai-c-responsable').value || null
      const programaId = body.querySelector('#ai-c-programa')?.value || null
      const clasesSeleccionadas = Array.from(body.querySelectorAll('.ai-c-clase-chk:checked')).map((el) => el.value)

      if (!titulo || !fechaInicio || !fechaFin) {
        AppToast.error('Completa título y fechas')
        return false
      }
      if (fechaFin < fechaInicio) {
        AppToast.error('La fecha de fin no puede ser anterior a la de inicio')
        return false
      }
      if (alcance === 'programa' && !programaId) {
        AppToast.error('Selecciona el programa convocado')
        return false
      }
      if (alcance === 'clase' && !clasesSeleccionadas.length) {
        AppToast.error('Selecciona al menos una clase convocada')
        return false
      }

      try {
        await crearActividad({
          titulo,
          descripcion,
          categoria,
          alcance,
          fechaInicio,
          fechaFin,
          ubicacion,
          responsableAsistenciaId,
          programasConvocados: alcance === 'programa' ? [programaId] : [],
          clasesConvocadas: alcance === 'clase' ? clasesSeleccionadas : [],
        })
        state.actividades = await listarActividades()
        state.filtroEstado = 'pendiente_revision'
        _renderLayout(container)
        AppToast.success('Propuesta creada. Queda pendiente de revisión.')
        return true
      } catch (err) {
        AppToast.error(err.message || 'No se pudo crear la actividad')
        return false
      }
    },
  })
}

// ── Revisar / aprobar / rechazar ────────────────────────────────────────

async function _openRevisarModal(container, actividadId) {
  const state = _getState(container)
  const actividad = state.actividades.find((a) => a.id === actividadId)
  if (!actividad) return

  const yaAprobada = actividad.estado === 'aprobado'
  const especial = actividad.categoria === 'actividad_especial'
  let alumnosConvocados
  let maestrosConvocados = []
  let version = actividad.version
  const nombresMaestros = new Map(state.maestros.map((m) => [m.id, m.nombre_completo || m.nombre]))
  const decisiones = new Map()
  let impactoListo = false

  AppModal.open({
    title: yaAprobada ? `Corregir: ${actividad.titulo}` : `Revisar: ${actividad.titulo}`,
    size: 'lg',
    saveText: yaAprobada ? 'Guardar corrección' : 'Aprobar y publicar',
    cancelText: 'Cerrar',
    body: `
      <div class="mb-3">
        <span class="badge ${ESTADO_BADGE[actividad.estado]} border">${_esc(ESTADO_LABEL[actividad.estado])}</span>
        <span class="small text-muted ms-2">${_formatFecha(actividad.fechaInicio)}${actividad.fechaInicio !== actividad.fechaFin ? ` – ${_formatFecha(actividad.fechaFin)}` : ''} · Alcance: ${_esc(actividad.alcance)}</span>
      </div>
      ${actividad.categoria === 'actividad_especial' ? `
        <label class="form-label small fw-semibold" for="ai-maestros-convocados">Maestros convocados</label>
        <select multiple class="form-select form-select-sm mb-2" id="ai-maestros-convocados">
          ${state.maestros.map((m) => `<option value="${_esc(m.id)}">${_esc(m.nombre_completo || m.nombre)}</option>`).join('')}
        </select>
        <p class="small text-muted">Selecciona los maestros que dejarán de impartir sus clases durante la actividad. Cambiar la selección recalcula las sugerencias.</p>
        <details id="ai-convocatoria-alumnos" class="mb-3">
          <summary class="small fw-semibold">Revisar convocatoria completa o agregar un alumno</summary>
          <input class="form-control form-control-sm my-2" id="ai-buscar-convocado" type="search"
            aria-label="Buscar alumno por nombre" placeholder="Buscar alumno por nombre">
          <div id="ai-lista-convocados" class="border rounded p-2" style="max-height: 220px; overflow-y: auto;"></div>
        </details>
      ` : ''}
      <div id="ai-impacto-loading" class="text-center text-muted py-3">
        <div class="spinner-border spinner-border-sm me-2"></div>Calculando clases afectadas...
      </div>
      <div id="ai-impacto-lista" class="d-none"></div>
      ${yaAprobada ? '' : `
        <div class="mt-3 pt-2 border-top d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-outline-danger" id="ai-btn-rechazar">
            <i class="bi bi-x-circle me-1"></i>Rechazar propuesta
          </button>
        </div>
      `}
    `,
    onShow: async (body) => {
      const maestros = body.querySelector('#ai-maestros-convocados')
      const loading = body.querySelector('#ai-impacto-loading')
      const listaEl = body.querySelector('#ai-impacto-lista')
      const roster = body.querySelector('#ai-convocatoria-alumnos')
      const buscador = body.querySelector('#ai-buscar-convocado')
      const listaConvocados = body.querySelector('#ai-lista-convocados')
      let catalogo
      const renderConvocatoria = () => {
        if (!catalogo || !alumnosConvocados) return
        const termino = buscador.value.trim().toLocaleLowerCase('es')
        const coincidencias = catalogo.filter((a) => a.activo !== false || alumnosConvocados.has(a.id)).filter((a) => termino
          ? a.nombre.toLocaleLowerCase('es').includes(termino)
          : alumnosConvocados.has(a.id))
        listaConvocados.innerHTML = coincidencias.map((a) => `
          <label class="d-block small">
            <input type="checkbox" value="${_esc(a.id)}" ${alumnosConvocados.has(a.id) ? 'checked' : ''}>
            ${_esc(a.nombre)}
          </label>`).join('') || '<span class="small text-muted">Sin coincidencias. Escribe un nombre para buscar.</span>'
      }
      roster?.addEventListener('toggle', async () => {
        if (!roster.open || catalogo) return
        listaConvocados.textContent = 'Cargando alumnos...'
        try {
          catalogo = []
          const pageSize = 250
          for (let page = 0; ; page++) {
            const { alumnos, total } = await obtenerAlumnos({ page, pageSize, soloActivos: false })
            catalogo.push(...alumnos.map((a) => ({ id: a.id, nombre: a.nombre_completo || a.nombre || a.id, activo: a.activo })))
            if (!alumnos.length || catalogo.length >= total) break
          }
          renderConvocatoria()
        } catch (err) {
          catalogo = null
          listaConvocados.textContent = err.message || 'No se pudieron cargar los alumnos'
        }
      })
      buscador?.addEventListener('input', renderConvocatoria)
      let revision = 0
      const cargarImpacto = async () => {
        const actual = ++revision
        impactoListo = false
        decisiones.clear()
        listaEl.classList.add('d-none')
        loading.classList.remove('d-none')
        loading.textContent = 'Calculando clases afectadas...'
        let impacto
        try {
          if (especial && !alumnosConvocados) {
            const detalle = yaAprobada ? await obtenerActividad(actividad.id) : null
            if (detalle) {
              version = detalle.version
              const guardados = detalle.convocatoria
              alumnosConvocados = new Set(guardados.map((c) => c.alumnoId).filter(Boolean))
              const heredados = await resolverAlumnosConvocados(
                guardados.map((c) => c.claseId).filter(Boolean),
                guardados.map((c) => c.programaId).filter(Boolean))
              for (const id of heredados) alumnosConvocados.add(id)
              const ids = new Set(guardados.map((c) => c.maestroId))
              for (const option of maestros.options) option.selected = ids.has(option.value)
            } else {
              alumnosConvocados = await resolverAlumnosConvocados(actividad.clasesConvocadas, actividad.programasConvocados)
            }
          }
          maestrosConvocados = Array.from(maestros?.selectedOptions || [], (option) => option.value)
          const seleccion = maestrosConvocados
          impacto = (await Promise.all(fechasActividad(actividad.fechaInicio, actividad.fechaFin).map(async (fecha) => {
            const clases = await previsualizarImpacto({
              fecha,
              alcance: actividad.alcance,
              clasesConvocadas: actividad.clasesConvocadas,
              programasConvocados: actividad.programasConvocados,
              ...(especial ? { maestrosConvocados: seleccion, alumnosConvocados: [...alumnosConvocados] } : {}),
            })
            return clases.map((clase) => ({ ...clase, fecha }))
          }))).flat()
          if (especial) {
            const listas = new Map()
            for (const item of impacto) {
              if (!listas.has(item.claseId)) listas.set(item.claseId, listarAlumnosDeClase(item.claseId))
            }
            await Promise.all(impacto.map(async (item) => {
              item.alumnos = await listas.get(item.claseId)
            }))
          }
        } catch (err) {
          if (actual === revision) loading.textContent = err.message || 'No se pudo calcular el impacto'
          return
        }
        if (actual !== revision) return
        impactoListo = true
        renderConvocatoria()
        loading.classList.add('d-none')
        listaEl.classList.remove('d-none')

        if (!impacto.length) {
          listaEl.innerHTML = `<div class="text-muted small py-3">Ninguna clase coincide con la fecha y el alcance seleccionados.</div>`
        } else {
          listaEl.innerHTML = `
            <div class="small text-muted mb-2">${especial ? 'Marca a los alumnos que participarán. La selección se comparte entre sus clases. Las clases de maestros convocados quedan suspendidas y justificadas.' : 'Elige qué sucede con cada clase antes de publicar.'}</div>
            ${impacto.map((i) => {
              const key = `${i.claseId}-${i.fecha}`
              const tipoSugerido = i.maestroConvocado || actividad.categoria !== 'actividad_especial'
                ? 'suspendida'
                : i.exentosSugeridos?.length ? 'impartida_con_exencion' : 'impartida_sin_cambios'
              decisiones.set(key, {
                claseId: i.claseId, fecha: i.fecha,
                tipoAfectacion: especial ? tipoSugerido : i.decisionVigente?.tipoAfectacion || tipoSugerido,
                exentos: new Set((especial ? i.exentosSugeridos : i.decisionVigente?.exentos || i.exentosSugeridos) || []),
              })
              return `
                <div class="border rounded-3 p-2 mb-2 ai-impacto-row" data-clase-id="${_esc(i.claseId)}" data-decision-key="${_esc(key)}">
                  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <span class="fw-semibold small">${_esc(i.claseNombre)}</span>
                      ${nombresMaestros.has(i.maestroId) ? `<span class="small text-muted"> · ${_esc(nombresMaestros.get(i.maestroId))}</span>` : ''}
                      <span class="small text-muted ms-2">${i.totalAlumnos} alumno(s) · ${_formatFecha(i.fecha)}</span>
                      ${i.decisionVigente ? `<span class="badge bg-secondary-subtle text-secondary-emphasis ms-2" style="font-size:0.65rem;">Ya tenía: ${_esc(TIPO_AFECTACION_LABEL[i.decisionVigente.tipoAfectacion] || i.decisionVigente.tipoAfectacion)}</span>` : ''}
                    </div>
                    ${especial ? `<span class="badge text-bg-secondary">${_esc(TIPO_AFECTACION_LABEL[tipoSugerido])}</span>` : `<select class="form-select form-select-sm ai-select-tipo" style="width:auto; min-width:230px;">
                      ${Object.entries(TIPO_AFECTACION_LABEL).map(([v, l]) => `<option value="${v}" ${decisiones.get(key).tipoAfectacion === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>`}
                  </div>
                  <div class="ai-exentos-wrap mt-2 ${especial || decisiones.get(key).tipoAfectacion === 'impartida_con_exencion' ? '' : 'd-none'}">
                    <div class="small text-muted mb-1">Cargando alumnos...</div>
                  </div>
                </div>
              `
            }).join('')}
          `

          listaEl.querySelectorAll('.ai-impacto-row').forEach((row) => {
            const claseId = row.dataset.claseId
            const decision = decisiones.get(row.dataset.decisionKey)
            const select = row.querySelector('.ai-select-tipo')
            const exentosWrap = row.querySelector('.ai-exentos-wrap')

            const cargarExentos = async () => {
              const alumnos = especial ? impacto.find((item) => `${item.claseId}-${item.fecha}` === row.dataset.decisionKey).alumnos : await listarAlumnosDeClase(claseId).catch(() => [])
              exentosWrap.innerHTML = alumnos.length
                ? alumnos.map((al) => `
                    <div class="form-check">
                      <input class="form-check-input ai-chk-exento" type="checkbox" value="${_esc(al.id)}" id="ai-ex-${_esc(row.dataset.decisionKey)}-${_esc(al.id)}" ${(especial ? alumnosConvocados : decision.exentos).has(al.id) ? 'checked' : ''}>
                      <label class="form-check-label small" for="ai-ex-${_esc(row.dataset.decisionKey)}-${_esc(al.id)}">${_esc(al.nombreCompleto)}</label>
                    </div>
                  `).join('')
                : `<div class="small text-muted">Sin alumnos inscritos.</div>`

              exentosWrap.querySelectorAll('.ai-chk-exento').forEach((chk) => {
                chk.addEventListener('change', () => {
                  const set = especial ? alumnosConvocados : decision.exentos
                  if (chk.checked) set.add(chk.value)
                  else set.delete(chk.value)
                    if (especial) cargarImpacto()
                })
              })
            }

            select?.addEventListener('change', () => {
              decision.tipoAfectacion = select.value
              if (select.value === 'impartida_con_exencion') {
                exentosWrap.classList.remove('d-none')
                cargarExentos()
              } else {
                exentosWrap.classList.add('d-none')
                decision.exentos.clear()
              }
            })

            if (especial || select?.value === 'impartida_con_exencion') cargarExentos()
          })
        }

      }
      maestros?.addEventListener('change', cargarImpacto)
      listaConvocados?.addEventListener('change', (event) => {
        if (!alumnosConvocados || !event.target.matches('input[type="checkbox"]')) return
        if (event.target.checked) alumnosConvocados.add(event.target.value)
        else alumnosConvocados.delete(event.target.value)
        cargarImpacto()
      })

      body.querySelector('#ai-btn-rechazar')?.addEventListener('click', async () => {
        const motivo = prompt('Motivo del rechazo:')
        if (motivo === null) return
        try {
          await rechazarActividad(actividad.id, motivo)
          state.actividades = await listarActividades()
          _renderLayout(container)
          AppToast.success('Propuesta rechazada')
          AppModal.close()
        } catch (err) {
          AppToast.error(err.message || 'No se pudo rechazar')
        }
      })
      await cargarImpacto()
    },
    onSave: async () => {
      if (!impactoListo) {
        AppToast.error('Espera a que se complete la revisión de impacto')
        return false
      }
      const afectaciones = Array.from(decisiones.values()).map((decision) => ({
        ...decision,
        motivo: '',
        exentos: decision.tipoAfectacion === 'impartida_con_exencion' ? Array.from(decision.exentos) : [],
      }))

      const convocatoria = especial ? { maestros: maestrosConvocados, alumnos: [...alumnosConvocados], version } : actividad.alcance === 'programa'
        ? actividad.programasConvocados.map((programaId) => ({ programaId }))
        : actividad.alcance === 'clase'
          ? actividad.clasesConvocadas.map((claseId) => ({ claseId }))
          : []

      try {
        await aprobarActividad(actividad.id, afectaciones, convocatoria, actividad.responsableAsistenciaId)
        state.actividades = await listarActividades()
        _renderLayout(container)
        AppToast.success(yaAprobada ? 'Corrección guardada' : 'Actividad aprobada y publicada')
        return true
      } catch (err) {
        AppToast.error(err.message || 'No se pudo aprobar la actividad')
        return false
      }
    },
  })
}

// ── Pasar lista de la actividad ─────────────────────────────────────────

const ASISTENCIA_LABEL = { presente: 'Presente', ausente: 'Ausente', pendiente: 'Pendiente' }

async function _openPasarListaModal(container, actividadId) {
  const state = _getState(container)
  const actividad = state.actividades.find((a) => a.id === actividadId)
  if (!actividad) return

  AppModal.open({
    title: `Pasar Lista: ${actividad.titulo}`,
    size: 'md',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `<div id="ai-lista-asistencia" class="text-center text-muted py-3"><div class="spinner-border spinner-border-sm me-2"></div>Cargando convocados...</div>`,
    onShow: async (body) => {
      let roster = []
      try {
        roster = await obtenerListaAsistenciaActividad(actividadId)
      } catch (err) {
        body.querySelector('#ai-lista-asistencia').innerHTML = `<div class="text-danger small">${_esc(err.message || 'No se pudo cargar la lista')}</div>`
        return
      }

      const wrap = body.querySelector('#ai-lista-asistencia')
      if (!roster.length) {
        wrap.innerHTML = `<div class="text-muted small py-3">No hay alumnos convocados explícitamente para esta actividad.</div>`
        return
      }

      wrap.innerHTML = `
        <div class="small text-muted mb-2">Convocar no demuestra asistencia — marcá quién estuvo presente.</div>
        ${roster.map((r) => `
          <div class="d-flex justify-content-between align-items-center py-1 border-bottom ai-asistencia-row" data-alumno-id="${_esc(r.alumnoId)}">
            <span class="small">${_esc(r.nombreCompleto)}</span>
            <select class="form-select form-select-sm ai-select-asistencia" style="width:auto;">
              ${Object.entries(ASISTENCIA_LABEL).map(([v, l]) => `<option value="${v}" ${r.estado === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
        `).join('')}
      `

      wrap.querySelectorAll('.ai-asistencia-row').forEach((row) => {
        const alumnoId = row.dataset.alumnoId
        row.querySelector('.ai-select-asistencia').addEventListener('change', async (e) => {
          try {
            await registrarAsistenciaActividad(actividadId, alumnoId, e.target.value)
          } catch (err) {
            AppToast.error(err.message || 'No se pudo guardar la asistencia')
          }
        })
      })
    },
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────

function _formatFecha(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function _getState(container) {
  return container.__aiState || _createState()
}

function _esc(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
