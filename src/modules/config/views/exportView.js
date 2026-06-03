import { supabase } from '../../../lib/supabaseClient.js'
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

// ─── Module state ─────────────────────────────────────────────────────────────
let _alumnosCache = []
let _alumnoSeleccionado = null

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
                      <input class="form-check-input" type="checkbox" id="sec-indicadores">
                      <label class="form-check-label small fw-semibold" for="sec-indicadores">
                        <i class="bi bi-award text-info me-1"></i>Indicadores dominados
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
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha', { ascending: false })
  if (error) throw new Error(`Asistencias: ${error.message}`)
  return data ?? []
}

async function _fetchObservaciones(alumnoId) {
  const { data, error } = await supabase
    .from('observaciones')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Observaciones: ${error.message}`)
  return data ?? []
}

async function _fetchIndicadores(alumnoId) {
  const { data, error } = await supabase
    .from('indicator_attempts')
    .select('*')
    .eq('alumno_id', alumnoId)
    .eq('passed', true)
    .order('fecha', { ascending: false })
  if (error) return []  // table may not exist in all envs
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
      indicadores:   document.getElementById('sec-indicadores').checked,
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
      if (secciones.indicadores)   fetches.push(_fetchIndicadores(alumnoId).then(d => { datos.indicadores = d }))
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
}
