import { supabase } from '../../../lib/supabaseClient.js'
import { normalizeText } from '../../../core/utils/normalizeText.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerMaestros } from '../../maestros/api/maestrosApi.js'
import { obtenerProgresosPorAlumno } from '../../progresos/api/progresosApi.js'
import { descargarFichasLote } from '../domain/generarPdfLotes.js'
import { descargarExpedienteAlumno } from '../domain/generarPdfExpediente.js'
import {
  descargarListaAlumnos,
  descargarAlumnosInscritos,
  descargarListaMaestros,
} from '../domain/generarPdfReportes.js'
import { getStudentDocumentData, buildStudentDocumentContext } from '../services/studentDocumentDataService.js'
import { listTemplates } from '../services/documentTemplateService.js'
import { buildResolvedDocument } from '../services/documentGeneratorService.js'
import { openDocumentPreview } from '../components/DocumentPreviewModal.js'

// ─── Module state ─────────────────────────────────────────────────────────────
let _alumnosCache = []
let _alumnoSeleccionado = null
let _diagData    = []   // alumnos con status calculado
let _diagFiltro  = 'todos'

// ─── Diagnóstico — campos requeridos ──────────────────────────────────────────
const _DIAG_FIELDS = [
  { key: 'nombre_completo',      label: 'Nombre completo',            critical: true  },
  { key: 'centro_estudios',      label: 'Centro educativo',           critical: true  },
  { key: 'grado_nivel',          label: 'Grado o nivel escolar',      critical: false },
  { key: 'representante_nombre', label: 'Nombre del representante',   critical: true  },
  { key: 'representante_tlf',    label: 'Teléfono del representante', critical: true  },
  { key: 'correo_representante', label: 'Correo del representante',   critical: false },
  { key: 'instrumento_principal',label: 'Instrumento principal',      critical: false },
]

// ─── View ─────────────────────────────────────────────────────────────────────

export async function renderExportView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-10 mx-auto">

          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-file-earmark-arrow-down fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Exportar Datos</h2>
              <small class="text-muted">Genera reportes y expedientes en PDF para impresión o archivo digital</small>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 1 — EXPEDIENTE INDIVIDUAL
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow border-primary mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-person-lines-fill me-2"></i>
                Expediente Individual por Alumno
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Buscá un alumno y seleccioná qué secciones incluir: ficha técnica, asistencias, progresos, observaciones e indicadores dominados.
              </p>

              <!-- Buscador -->
              <div class="mb-3">
                <label class="form-label fw-semibold small">Buscar alumno</label>
                <input type="text" class="form-control" id="exp-buscar"
                  placeholder="Nombre, instrumento o cédula del representante...">
                <div id="exp-resultados" class="list-group mt-1" style="max-height:220px;overflow-y:auto;display:none;"></div>
              </div>

              <!-- Alumno seleccionado -->
              <div id="exp-alumno-chip" class="mb-3" style="display:none;">
                <span class="badge bg-primary fs-6 py-2 px-3" id="exp-alumno-nombre"></span>
                <button class="btn btn-sm btn-link text-danger ms-2" id="exp-limpiar">
                  <i class="bi bi-x-circle"></i> Cambiar alumno
                </button>
              </div>

              <!-- Secciones a incluir -->
              <div id="exp-opciones" style="display:none;">
                <label class="form-label fw-semibold small">Secciones a incluir en el PDF</label>
                <div class="row g-2 mb-3">
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-ficha" checked>
                      <label class="form-check-label small fw-semibold" for="sec-ficha">
                        <i class="bi bi-person-vcard text-primary me-1"></i>Ficha técnica
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-asistencias" checked>
                      <label class="form-check-label small fw-semibold" for="sec-asistencias">
                        <i class="bi bi-calendar-check text-success me-1"></i>Asistencias
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-progresos" checked>
                      <label class="form-check-label small fw-semibold" for="sec-progresos">
                        <i class="bi bi-graph-up text-primary me-1"></i>Progresos y calificaciones
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-observaciones" checked>
                      <label class="form-check-label small fw-semibold" for="sec-observaciones">
                        <i class="bi bi-chat-left-text text-warning me-1"></i>Observaciones
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-dominio" checked>
                      <label class="form-check-label small fw-semibold" for="sec-dominio">
                        <i class="bi bi-award text-info me-1"></i>Escalas, obras y técnicas
                      </label>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-3">
                  <button class="btn btn-primary" id="btn-expediente">
                    <i class="bi bi-file-earmark-pdf me-2"></i>Descargar Expediente
                  </button>
                  <span id="exp-status" class="text-muted small"></span>
                </div>
              </div>

            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 2 — FICHAS TÉCNICAS EN LOTE
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-person-vcard me-2 text-primary"></i>
                Fichas Técnicas — Lote
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Un solo PDF con la ficha de inscripción de cada alumno (una ficha por página). Ideal para imprimir todos los expedientes o generar el respaldo digital.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Estado</label>
                  <select class="form-select" id="fichas-filtro">
                    <option value="activos">Solo activos</option>
                    <option value="todos">Todos</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="fichas-instrumento"
                    placeholder="Ej: Violín — vacío = todos">
                </div>
                <div class="col-auto">
                  <button class="btn btn-primary" id="btn-fichas-lote">
                    <i class="bi bi-download me-2"></i>Descargar Fichas
                  </button>
                </div>
                <div class="col-auto">
                  <span id="fichas-status" class="text-muted small"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 3 — LISTA DE ALUMNOS ACTIVOS
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-success bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-table me-2 text-success"></i>
                Lista de Alumnos Activos
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Tabla con todos los alumnos activos. Filtrá por instrumento o nivel.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="lista-instrumento"
                    placeholder="Ej: Violín — vacío = todos">
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Nivel (opcional)</label>
                  <input type="text" class="form-control" id="lista-nivel"
                    placeholder="Ej: Iniciación">
                </div>
                <div class="col-auto">
                  <button class="btn btn-success" id="btn-lista-alumnos">
                    <i class="bi bi-download me-2"></i>Descargar Lista
                  </button>
                </div>
                <div class="col-auto">
                  <span id="lista-status" class="text-muted small"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 4 — INSCRITOS POR RANGO DE FECHAS
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-warning bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-calendar-range me-2 text-warning"></i>
                Alumnos Inscritos — Rango de Fechas
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Lista de alumnos cuya inscripción cae dentro del período seleccionado.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Desde</label>
                  <input type="date" class="form-control" id="rango-desde">
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Hasta</label>
                  <input type="date" class="form-control" id="rango-hasta">
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="rango-instrumento"
                    placeholder="Todos">
                </div>
                <div class="col-auto">
                  <button class="btn btn-warning" id="btn-inscritos-rango">
                    <i class="bi bi-download me-2"></i>Descargar Reporte
                  </button>
                </div>
                <div class="col-auto">
                  <span id="rango-status" class="text-muted small"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 5 — DIRECTORIO DE MAESTROS
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-people me-2 text-info"></i>
                Directorio de Maestros
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Lista de todos los maestros con especialidad, contacto y reseña de clases.
              </p>
              <div class="d-flex align-items-center gap-3">
                <button class="btn btn-info text-white" id="btn-maestros">
                  <i class="bi bi-download me-2"></i>Descargar Directorio
                </button>
                <span id="maestros-status" class="text-muted small"></span>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 6 — DIAGNÓSTICO DE DATOS PARA DOCUMENTOS
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-secondary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-clipboard-check me-2 text-secondary"></i>
                Diagnóstico de datos para documentos
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Verificá qué alumnos tienen datos completos para generar permisos de ausencia, autorizaciones de viaje o cartas institucionales.
              </p>
              <div class="d-flex align-items-center gap-3 mb-3">
                <button class="btn btn-secondary" id="btn-ejecutar-diagnostico">
                  <i class="bi bi-search me-2"></i>Ejecutar diagnóstico
                </button>
                <span id="diag-status" class="text-muted small"></span>
              </div>
              <div id="diagnostico-resultado" style="display:none;">
                <!-- Resumen -->
                <div class="row g-2 mb-4" id="diag-resumen"></div>
                <!-- Filtros -->
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <input type="text" class="form-control form-control-sm" id="diag-buscar"
                         placeholder="Buscar alumno por nombre..." style="max-width:260px;">
                  <div class="btn-group btn-group-sm" id="diag-filtros">
                    <button class="btn btn-secondary active" data-diag="todos">Todos</button>
                    <button class="btn btn-outline-success"  data-diag="completo">Completos</button>
                    <button class="btn btn-outline-warning"  data-diag="incompleto">Incompletos</button>
                    <button class="btn btn-outline-danger"   data-diag="critico">Críticos</button>
                  </div>
                </div>
                <!-- Lista -->
                <div id="diag-lista"></div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 7 — DOCUMENTOS INSTITUCIONALES
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-file-text me-2 text-primary"></i>
                Documentos institucionales
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-4">
                Generá permisos de ausencia, autorizaciones de viaje y cartas institucionales con datos reales de los alumnos.
              </p>
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <div class="card h-100 border-0 shadow-sm text-center p-3" data-doc-nav="documentos-historial" style="cursor:pointer;">
                    <i class="bi bi-clock-history fs-2 text-info mb-2"></i>
                    <div class="small fw-semibold">Historial</div>
                    <div class="text-muted" style="font-size:0.72rem;">Documentos generados</div>
                  </div>
                </div>
              </div>
              <h6 class="fw-bold mb-3">Generar documento individual</h6>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold">1. Buscar alumno</label>
                  <input type="text" class="form-control form-control-sm" id="doc-buscar-alumno"
                         placeholder="Nombre del alumno...">
                  <div id="doc-alumno-resultados" class="list-group mt-1" style="max-height:180px;overflow-y:auto;display:none;"></div>
                  <div id="doc-alumno-chip" class="mt-2" style="display:none;">
                    <span class="badge bg-primary" id="doc-alumno-nombre"></span>
                    <button class="btn btn-link btn-sm text-danger p-0 ms-2" id="doc-limpiar-alumno">
                      <i class="bi bi-x-circle"></i> Cambiar
                    </button>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold">2. Seleccionar plantilla</label>
                  <select class="form-select form-select-sm" id="doc-template-select" disabled>
                    <option value="">— Primero seleccioná un alumno —</option>
                  </select>
                </div>
                <div class="col-12" id="doc-actividad-form" style="display:none;">
                  <hr class="my-2">
                  <h6 class="small fw-semibold mb-2">3. Datos de la actividad</h6>
                  <div class="row g-2">
                    <div class="col-12 col-md-6">
                      <label class="form-label small">Nombre de la actividad *</label>
                      <input type="text" class="form-control form-control-sm" id="doc-act-nombre" placeholder="Ej: Concierto Institucional">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Fecha de la actividad</label>
                      <input type="date" class="form-control form-control-sm" id="doc-act-fecha">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Lugar</label>
                      <input type="text" class="form-control form-control-sm" id="doc-act-lugar" placeholder="Ej: Centro León">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Hora de salida</label>
                      <input type="time" class="form-control form-control-sm" id="doc-act-hora-salida">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Hora de regreso</label>
                      <input type="time" class="form-control form-control-sm" id="doc-act-hora-regreso">
                    </div>
                    <div class="col-12">
                      <label class="form-label small">Responsable institucional</label>
                      <input type="text" class="form-control form-control-sm" id="doc-act-responsable" value="Coordinación Pedagógica">
                    </div>
                    <div class="col-12">
                      <label class="form-label small">Motivo / descripción del permiso</label>
                      <textarea class="form-control form-control-sm" id="doc-act-motivo" rows="2"
                                placeholder="Explicá brevemente el motivo del permiso..."></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label small">Observaciones internas</label>
                      <textarea class="form-control form-control-sm" id="doc-act-observaciones" rows="2"></textarea>
                    </div>
                    <div class="col-12">
                      <button class="btn btn-primary btn-sm" id="btn-doc-preview">
                        <i class="bi bi-eye me-1"></i>Vista previa y generar PDF
                      </button>
                      <span id="doc-gen-status" class="small text-muted ms-2"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `

  // Pre-load alumnos for search
  try {
    _alumnosCache = await obtenerAlumnos()
  } catch { _alumnosCache = [] }

  _alumnoSeleccionado = null
  _attachEvents(container)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _p(val, fb = '—') { const s = String(val ?? '').trim(); return s || fb }

function _setStatus(id, msg, isError = false) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = msg
  el.className = isError ? 'text-danger small' : 'text-muted small'
}

function _setBtnLoading(id, loading) {
  const btn = document.getElementById(id)
  if (!btn) return
  btn.disabled = loading
  if (loading) {
    btn.dataset.originalHtml = btn.innerHTML
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...'
  } else {
    btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML
  }
}

// ─── Alumno search ────────────────────────────────────────────────────────────

function _initSearch(container) {
  const input      = container.querySelector('#exp-buscar')
  const resultados = container.querySelector('#exp-resultados')
  const chip       = container.querySelector('#exp-alumno-chip')
  const opciones   = container.querySelector('#exp-opciones')
  const chipNombre = container.querySelector('#exp-alumno-nombre')
  const btnLimpiar = container.querySelector('#exp-limpiar')

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase()
    if (q.length < 1) { resultados.style.display = 'none'; return }

    const matches = _alumnosCache.filter(a => {
      // cover both raw DB fields and normalized aliases
      const nombre = (_p(a.nombre_completo) + ' ' + _p(a.nombre)).toLowerCase()
      const instr  = (_p(a.instrumento_principal) + ' ' + _p(a.instrumento)).toLowerCase()
      const cedula = (_p(a.representante_cedula) + ' ' + _p(a.cedula)).toLowerCase()
      return nombre.includes(q) || instr.includes(q) || cedula.includes(q)
    }).slice(0, 12)

    if (matches.length === 0) {
      resultados.innerHTML = '<div class="list-group-item text-muted small">Sin resultados</div>'
    } else {
      resultados.innerHTML = matches.map(a => {
        const nombre = _p(a.nombre_completo) !== '—' ? _p(a.nombre_completo) : _p(a.nombre)
        const instr  = _p(a.instrumento_principal) !== '—' ? _p(a.instrumento_principal) : _p(a.instrumento)
        return `
        <button type="button" class="list-group-item list-group-item-action py-2 px-3"
          data-id="${a.id}">
          <span class="fw-semibold">${nombre}</span>
          <span class="text-muted small ms-2">${instr}</span>
        </button>
        `
      }).join('')

      resultados.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const alumno = _alumnosCache.find(a => a.id === btn.dataset.id)
          if (!alumno) return
          _seleccionarAlumno(alumno, input, resultados, chip, chipNombre, opciones)
        })
      })
    }

    resultados.style.display = 'block'
  })

  document.addEventListener('click', (e) => {
    if (!resultados.contains(e.target) && e.target !== input) {
      resultados.style.display = 'none'
    }
  }, { capture: true })

  btnLimpiar.addEventListener('click', () => {
    _alumnoSeleccionado = null
    input.value = ''
    chip.style.display = 'none'
    opciones.style.display = 'none'
    input.focus()
  })
}

function _seleccionarAlumno(alumno, input, resultados, chip, chipNombre, opciones) {
  _alumnoSeleccionado = alumno
  input.value = ''
  resultados.style.display = 'none'
  const nombre = _p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre)
  chipNombre.textContent = nombre
  chip.style.display = 'block'
  opciones.style.display = 'block'
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function _fetchAsistencias(alumnoId) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*, sesion:sesiones_clase(fecha, contenido_dsl, contenido, tema_principal)')
    .eq('alumno_id', alumnoId)
    .order('fecha', { ascending: false })
  if (error) throw new Error(`Asistencias: ${error.message}`)
  return data ?? []
}

async function _fetchObservaciones(alumnoId) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Observaciones: ${error.message}`)
  return data ?? []
}

async function _fetchIndicadores(alumnoId) {
  // indicator_attempts may use student_id or alumno_id depending on env
  const { data, error } = await supabase
    .from('indicator_attempts')
    .select('*, indicador:indicators(description, nodo:nodes(name, is_critical))')
    .or(`alumno_id.eq.${alumnoId},student_id.eq.${alumnoId}`)
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function _attachEvents(container) {
  _initSearch(container)

  // ── Expediente individual ──────────────────────────────────────────────────
  container.querySelector('#btn-expediente').addEventListener('click', async () => {
    if (!_alumnoSeleccionado) {
      _setStatus('exp-status', 'Seleccioná un alumno primero.', true)
      return
    }

    const secciones = {
      ficha:         document.getElementById('sec-ficha').checked,
      asistencias:   document.getElementById('sec-asistencias').checked,
      progresos:     document.getElementById('sec-progresos').checked,
      observaciones: document.getElementById('sec-observaciones').checked,
      dominio:       document.getElementById('sec-dominio').checked,
    }

    if (!Object.values(secciones).some(Boolean)) {
      _setStatus('exp-status', 'Seleccioná al menos una sección.', true)
      return
    }

    _setBtnLoading('btn-expediente', true)
    _setStatus('exp-status', 'Cargando datos...')

    try {
      const alumnoId = _alumnoSeleccionado.id
      const datos    = {}

      const fetches = []
      if (secciones.asistencias)   fetches.push(_fetchAsistencias(alumnoId).then(d => { datos.asistencias = d }))
      if (secciones.progresos)     fetches.push(obtenerProgresosPorAlumno(alumnoId).then(d => { datos.progresos = d }))
      if (secciones.observaciones) fetches.push(_fetchObservaciones(alumnoId).then(d => { datos.observaciones = d }))
      if (secciones.dominio)       fetches.push(_fetchIndicadores(alumnoId).then(d => { datos.indicadores = d }))
      await Promise.all(fetches)

      descargarExpedienteAlumno(_alumnoSeleccionado, secciones, datos)
      _setStatus('exp-status', '✓ Expediente descargado')
    } catch (e) {
      _setStatus('exp-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-expediente', false)
    }
  })

  // ── Fichas lote ────────────────────────────────────────────────────────────
  container.querySelector('#btn-fichas-lote').addEventListener('click', async () => {
    _setBtnLoading('btn-fichas-lote', true)
    _setStatus('fichas-status', 'Cargando alumnos...')
    try {
      const filtro  = document.getElementById('fichas-filtro').value
      const instrF  = document.getElementById('fichas-instrumento').value.trim().toLowerCase()
      let alumnos   = filtro === 'activos'
        ? _alumnosCache.filter(a => a.is_active !== false)
        : _alumnosCache
      if (instrF) alumnos = alumnos.filter(a => _p(a.instrumento_principal).toLowerCase().includes(instrF))
      if (alumnos.length === 0) { _setStatus('fichas-status', 'Sin alumnos con ese filtro.', true); return }
      _setStatus('fichas-status', `Generando ${alumnos.length} ficha(s)...`)
      const partes = ['Fichas Técnicas']
      if (filtro === 'activos') partes.push('Alumnos Activos')
      if (instrF) partes.push(instrF.charAt(0).toUpperCase() + instrF.slice(1))
      descargarFichasLote(alumnos, partes.join(' — '))
      _setStatus('fichas-status', `✓ ${alumnos.length} ficha(s) descargadas`)
    } catch (e) {
      _setStatus('fichas-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-fichas-lote', false)
    }
  })

  // ── Lista alumnos activos ──────────────────────────────────────────────────
  container.querySelector('#btn-lista-alumnos').addEventListener('click', async () => {
    _setBtnLoading('btn-lista-alumnos', true)
    _setStatus('lista-status', 'Filtrando...')
    try {
      const instrF = document.getElementById('lista-instrumento').value.trim().toLowerCase()
      const nivelF = document.getElementById('lista-nivel').value.trim().toLowerCase()
      let activos  = _alumnosCache.filter(a => a.is_active !== false)
      if (instrF) activos = activos.filter(a => _p(a.instrumento_principal).toLowerCase().includes(instrF))
      if (nivelF) activos = activos.filter(a => _p(a.nivel_actual).toLowerCase().includes(nivelF))
      if (activos.length === 0) { _setStatus('lista-status', 'Sin alumnos con ese filtro.', true); return }
      const partes = ['Todos los activos']
      if (instrF) partes[0] = `Instrumento: ${instrF}`
      if (nivelF) partes.push(`Nivel: ${nivelF}`)
      descargarListaAlumnos(activos, partes.join('  ·  '))
      _setStatus('lista-status', `✓ ${activos.length} alumno(s)`)
    } catch (e) {
      _setStatus('lista-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-lista-alumnos', false)
    }
  })

  // ── Inscritos por rango ────────────────────────────────────────────────────
  container.querySelector('#btn-inscritos-rango').addEventListener('click', async () => {
    const desde  = document.getElementById('rango-desde').value
    const hasta  = document.getElementById('rango-hasta').value
    const instrF = document.getElementById('rango-instrumento').value.trim().toLowerCase()
    if (!desde || !hasta) { _setStatus('rango-status', 'Seleccioná ambas fechas.', true); return }
    if (desde > hasta)    { _setStatus('rango-status', '"Desde" debe ser anterior a "Hasta".', true); return }
    _setBtnLoading('btn-inscritos-rango', true)
    _setStatus('rango-status', 'Filtrando...')
    try {
      let filtrados = _alumnosCache.filter(a => {
        const f = (a.created_at ?? '').slice(0, 10)
        return f >= desde && f <= hasta
      })
      if (instrF) filtrados = filtrados.filter(a => _p(a.instrumento_principal).toLowerCase().includes(instrF))
      if (filtrados.length === 0) { _setStatus('rango-status', 'Sin alumnos en ese rango.', true); return }
      descargarAlumnosInscritos(filtrados, desde, hasta)
      _setStatus('rango-status', `✓ ${filtrados.length} alumno(s)`)
    } catch (e) {
      _setStatus('rango-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-inscritos-rango', false)
    }
  })

  // ── Directorio maestros ────────────────────────────────────────────────────
  container.querySelector('#btn-maestros').addEventListener('click', async () => {
    _setBtnLoading('btn-maestros', true)
    _setStatus('maestros-status', 'Cargando...')
    try {
      const maestros = await obtenerMaestros()
      if (maestros.length === 0) { _setStatus('maestros-status', 'Sin maestros.', true); return }
      descargarListaMaestros(maestros)
      _setStatus('maestros-status', `✓ ${maestros.length} maestro(s)`)
    } catch (e) {
      _setStatus('maestros-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-maestros', false)
    }
  })

  // ── Diagnóstico de datos ───────────────────────────────────────────────────
  container.querySelector('#btn-ejecutar-diagnostico')?.addEventListener('click', async () => {
    _setBtnLoading('btn-ejecutar-diagnostico', true)
    _setStatus('diag-status', 'Cargando alumnos...')
    await _ejecutarDiagnostico(container)
    _setBtnLoading('btn-ejecutar-diagnostico', false)
    _setStatus('diag-status', '')
  })

  container.querySelector('#diag-buscar')?.addEventListener('input', () => _renderDiagLista(container))

  container.querySelector('#diag-filtros')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-diag]')
    if (!btn) return
    container.querySelectorAll('#diag-filtros [data-diag]').forEach(b => {
      b.className = b.dataset.diag === 'todos'      ? 'btn btn-secondary'
                  : b.dataset.diag === 'completo'   ? 'btn btn-outline-success'
                  : b.dataset.diag === 'incompleto' ? 'btn btn-outline-warning'
                  : 'btn btn-outline-danger'
    })
    btn.classList.remove('btn-outline-success', 'btn-outline-warning', 'btn-outline-danger', 'btn-secondary', 'btn-outline-secondary')
    btn.classList.add(btn.dataset.diag === 'todos' ? 'btn-secondary' : btn.dataset.diag === 'completo' ? 'btn-success' : btn.dataset.diag === 'incompleto' ? 'btn-warning' : 'btn-danger')
    _diagFiltro = btn.dataset.diag
    _renderDiagLista(container)
  })

  container.querySelector('#diag-lista')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-edit-alumno]')
    if (btn) window.router?.navigate('alumno', { id: btn.dataset.editAlumno })
  })

  // ── Documentos institucionales ─────────────────────────────────────────────
  let _docAlumnoId   = null
  let _docAlumnoData = null
  let _templates     = []

  listTemplates({ estado: 'activa' }).then(t => { _templates = t }).catch(() => {})

  container.querySelectorAll('[data-doc-nav]').forEach(card => {
    card.addEventListener('click', () => window.router?.navigate(card.dataset.docNav))
  })

  container.querySelector('#doc-buscar-alumno')?.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase()
    const resultados = container.querySelector('#doc-alumno-resultados')
    if (!resultados) return
    if (!term) { resultados.style.display = 'none'; return }
    const matches = _alumnosCache.filter(a =>
      (a.nombre_completo || '').toLowerCase().includes(term)
    ).slice(0, 8)
    if (matches.length === 0) { resultados.style.display = 'none'; return }
    resultados.innerHTML = matches.map(a =>
      `<button class="list-group-item list-group-item-action small py-1" data-alumno-id="${a.id}" data-alumno-nombre="${a.nombre_completo}">${a.nombre_completo}</button>`
    ).join('')
    resultados.style.display = 'block'
  })

  container.querySelector('#doc-alumno-resultados')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-alumno-id]')
    if (!btn) return
    _docAlumnoId = btn.dataset.alumnoId
    container.querySelector('#doc-buscar-alumno').value = ''
    container.querySelector('#doc-alumno-resultados').style.display = 'none'
    container.querySelector('#doc-alumno-chip').style.display = 'block'
    container.querySelector('#doc-alumno-nombre').textContent = btn.dataset.alumnoNombre
    try {
      _docAlumnoData = await getStudentDocumentData(_docAlumnoId)
      const sel = container.querySelector('#doc-template-select')
      sel.disabled = false
      sel.innerHTML = '<option value="">— Seleccioná una plantilla —</option>' +
        _templates.map(t => `<option value="${t.id}" data-tipo="${t.tipo}">${t.nombre}</option>`).join('')
    } catch (err) { console.error('[doc] error loading alumno:', err) }
  })

  container.querySelector('#doc-limpiar-alumno')?.addEventListener('click', () => {
    _docAlumnoId = null; _docAlumnoData = null
    container.querySelector('#doc-alumno-chip').style.display = 'none'
    container.querySelector('#doc-buscar-alumno').value = ''
    const sel = container.querySelector('#doc-template-select')
    sel.disabled = true
    sel.innerHTML = '<option value="">— Primero seleccioná un alumno —</option>'
    container.querySelector('#doc-actividad-form').style.display = 'none'
  })

  container.querySelector('#doc-template-select')?.addEventListener('change', (e) => {
    container.querySelector('#doc-actividad-form').style.display = e.target.value ? 'block' : 'none'
  })

  container.querySelector('#btn-doc-preview')?.addEventListener('click', async () => {
    if (!_docAlumnoData) return
    const templateId = container.querySelector('#doc-template-select')?.value
    if (!templateId) return
    const template = _templates.find(t => t.id === templateId)
    if (!template) return

    const actividad = {
      nombre:        container.querySelector('#doc-act-nombre')?.value?.trim()        || '',
      fecha:         container.querySelector('#doc-act-fecha')?.value                  || '',
      lugar:         container.querySelector('#doc-act-lugar')?.value?.trim()          || '',
      hora_salida:   container.querySelector('#doc-act-hora-salida')?.value            || '',
      hora_regreso:  container.querySelector('#doc-act-hora-regreso')?.value           || '',
      motivo:        container.querySelector('#doc-act-motivo')?.value?.trim()         || '',
      observaciones: container.querySelector('#doc-act-observaciones')?.value?.trim()  || '',
    }
    const responsable = container.querySelector('#doc-act-responsable')?.value?.trim() || 'Coordinación Pedagógica'

    if (!actividad.nombre) {
      container.querySelector('#doc-gen-status').textContent = 'Ingresá el nombre de la actividad.'
      return
    }

    const context = buildStudentDocumentContext({
      alumno:      _docAlumnoData.alumno,
      escolaridad: _docAlumnoData.escolaridad,
      actividad,
      extra:       { responsable },
    })
    const { contenidoFinal, variablesUsadas, variablesFaltantes, advertencias } = buildResolvedDocument({ template, context })

    openDocumentPreview({
      title:              template.nombre,
      tipo:               template.tipo,
      alumnoNombre:       _docAlumnoData.alumno?.nombre_completo || '',
      alumnoId:           _docAlumnoId,
      templateId,
      contenidoFinal,
      variablesUsadas,
      variablesFaltantes,
      advertencias,
    })
  })
}

// ─── Diagnóstico de datos ─────────────────────────────────────────────────────

async function _ejecutarDiagnostico(container) {
  try {
    const { data: alumnos, error } = await supabase
      .from('alumnos')
      .select('id, nombre_completo, centro_estudios, grado_nivel, representante_nombre, representante_tlf, correo_representante, instrumento_principal')
      .eq('es_activo', true)

    if (error) throw error

    _diagData = (alumnos || []).map(a => {
      const missing = _DIAG_FIELDS.filter(f => { const v = a[f.key]; return v === undefined || v === null || v === '' })
      const status  = missing.length === 0 ? 'completo' : missing.some(f => f.critical) ? 'critico' : 'incompleto'
      return { ...a, missing, status }
    })
    _diagFiltro = 'todos'

    // Resumen
    const completos   = _diagData.filter(a => a.status === 'completo').length
    const incompletos = _diagData.filter(a => a.status === 'incompleto').length
    const criticos    = _diagData.filter(a => a.status === 'critico').length

    const resumen = container.querySelector('#diag-resumen')
    if (resumen) resumen.innerHTML = `
      <div class="col-6 col-md-3"><div class="card border-0 bg-body-secondary text-center py-2"><div class="fs-4 fw-bold">${_diagData.length}</div><small class="text-muted">Total alumnos</small></div></div>
      <div class="col-6 col-md-3"><div class="card border-0 bg-success-subtle text-center py-2"><div class="fs-4 fw-bold text-success">${completos}</div><small class="text-muted">Completos</small></div></div>
      <div class="col-6 col-md-3"><div class="card border-0 bg-warning-subtle text-center py-2"><div class="fs-4 fw-bold text-warning">${incompletos}</div><small class="text-muted">Incompletos</small></div></div>
      <div class="col-6 col-md-3"><div class="card border-0 bg-danger-subtle text-center py-2"><div class="fs-4 fw-bold text-danger">${criticos}</div><small class="text-muted">Críticos</small></div></div>
    `

    const resultado = container.querySelector('#diagnostico-resultado')
    if (resultado) resultado.style.display = ''

    // Reset filtro buttons
    container.querySelectorAll('#diag-filtros [data-diag]').forEach(b => {
      b.className = b.dataset.diag === 'todos' ? 'btn btn-secondary active' : b.dataset.diag === 'completo' ? 'btn btn-outline-success' : b.dataset.diag === 'incompleto' ? 'btn btn-outline-warning' : 'btn btn-outline-danger'
    })

    _renderDiagLista(container)
  } catch (err) {
    console.error('[diagnosis]', err)
    _setStatus('diag-status', `Error: ${err.message}`, true)
  }
}

function _renderDiagLista(container) {
  const lista = container.querySelector('#diag-lista')
  if (!lista) return

  const term   = normalizeText(container.querySelector('#diag-buscar')?.value || '')
  const filtered = _diagData.filter(a => {
    if (_diagFiltro !== 'todos' && a.status !== _diagFiltro) return false
    if (term && !normalizeText(a.nombre_completo || '').includes(term)) return false
    return true
  })

  if (filtered.length === 0) {
    lista.innerHTML = '<p class="text-muted small fst-italic">No hay alumnos en esta categoría.</p>'
    return
  }

  const statusBadge = { completo: 'bg-success-subtle text-success-emphasis', incompleto: 'bg-warning-subtle text-warning-emphasis', critico: 'bg-danger-subtle text-danger-emphasis' }
  const statusLabel = { completo: 'Completo', incompleto: 'Incompleto', critico: 'Crítico' }

  lista.innerHTML = filtered.map(a => `
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="fw-semibold small">${_p(a.nombre_completo, 'Sin nombre')}</div>
            ${a.missing.length === 0
              ? '<div class="text-success small"><i class="bi bi-check-circle me-1"></i>Datos completos</div>'
              : `<div class="small text-muted mt-1">
                   <span class="fw-semibold">Faltan:</span>
                   ${a.missing.map(f => `<span class="badge ${f.critical ? 'bg-danger-subtle text-danger-emphasis' : 'bg-warning-subtle text-warning-emphasis'} me-1">${f.label}</span>`).join('')}
                 </div>`}
          </div>
          <div class="d-flex flex-column align-items-end gap-1">
            <span class="badge ${statusBadge[a.status]}">${statusLabel[a.status]}</span>
            <button class="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                    data-edit-alumno="${a.id}" style="font-size:0.75rem;">
              <i class="bi bi-pencil me-1"></i>Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('')
}

