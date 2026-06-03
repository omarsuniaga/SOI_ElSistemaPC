import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerMaestros } from '../../maestros/api/maestrosApi.js'
import { descargarFichasLote } from '../domain/generarPdfLotes.js'
import {
  descargarListaAlumnos,
  descargarAlumnosInscritos,
  descargarListaMaestros,
} from '../domain/generarPdfReportes.js'

export async function renderExportView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-10 mx-auto">

          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-file-earmark-arrow-down fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Exportar Datos</h2>
              <small class="text-muted">Genera reportes y fichas en PDF para impresión o archivo digital</small>
            </div>
          </div>

          <!-- Fichas técnicas lote -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-person-vcard me-2 text-primary"></i>
                Fichas Técnicas — Lote
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Un solo PDF con la ficha completa de cada alumno (una ficha por página).
                Ideal para imprimir todos los expedientes o generar el respaldo digital.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Filtro</label>
                  <select class="form-select" id="fichas-filtro">
                    <option value="activos">Solo activos</option>
                    <option value="todos">Todos (activos e inactivos)</option>
                  </select>
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

          <!-- Lista de alumnos activos -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-success bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-table me-2 text-success"></i>
                Lista de Alumnos Activos
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Tabla con todos los alumnos activos. Filtrado opcional por instrumento.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="lista-instrumento"
                    placeholder="Ej: Violín — vacío = todos">
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

          <!-- Alumnos inscritos por rango -->
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

          <!-- Directorio de maestros -->
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

  _attachEvents(container)
}

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

function _attachEvents(container) {
  // Fichas lote
  container.querySelector('#btn-fichas-lote').addEventListener('click', async () => {
    _setBtnLoading('btn-fichas-lote', true)
    _setStatus('fichas-status', 'Cargando alumnos...')
    try {
      const todos   = await obtenerAlumnos()
      const filtro  = document.getElementById('fichas-filtro').value
      const alumnos = filtro === 'activos'
        ? todos.filter(a => a.is_active !== false)
        : todos
      if (alumnos.length === 0) {
        _setStatus('fichas-status', 'No se encontraron alumnos.', true)
        return
      }
      _setStatus('fichas-status', `Generando ${alumnos.length} ficha(s)...`)
      const titulo = filtro === 'activos'
        ? 'Fichas Técnicas — Alumnos Activos'
        : 'Fichas Técnicas — Todos los Alumnos'
      descargarFichasLote(alumnos, titulo)
      _setStatus('fichas-status', `✓ ${alumnos.length} ficha(s) descargadas`)
    } catch (e) {
      _setStatus('fichas-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-fichas-lote', false)
    }
  })

  // Lista alumnos activos
  container.querySelector('#btn-lista-alumnos').addEventListener('click', async () => {
    _setBtnLoading('btn-lista-alumnos', true)
    _setStatus('lista-status', 'Cargando...')
    try {
      const todos       = await obtenerAlumnos()
      const instrFiltro = document.getElementById('lista-instrumento').value.trim().toLowerCase()
      let activos = todos.filter(a => a.is_active !== false)
      if (instrFiltro) {
        activos = activos.filter(a =>
          (_p(a.instrumento_principal)).toLowerCase().includes(instrFiltro)
        )
      }
      if (activos.length === 0) {
        _setStatus('lista-status', 'No se encontraron alumnos.', true)
        return
      }
      const sub = instrFiltro ? `Instrumento: ${instrFiltro}` : 'Todos los activos'
      descargarListaAlumnos(activos, sub)
      _setStatus('lista-status', `✓ ${activos.length} alumno(s)`)
    } catch (e) {
      _setStatus('lista-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-lista-alumnos', false)
    }
  })

  // Inscritos por rango
  container.querySelector('#btn-inscritos-rango').addEventListener('click', async () => {
    const desde = document.getElementById('rango-desde').value
    const hasta = document.getElementById('rango-hasta').value
    if (!desde || !hasta) {
      _setStatus('rango-status', 'Selecciona ambas fechas.', true)
      return
    }
    if (desde > hasta) {
      _setStatus('rango-status', '"Desde" debe ser anterior a "Hasta".', true)
      return
    }
    _setBtnLoading('btn-inscritos-rango', true)
    _setStatus('rango-status', 'Cargando...')
    try {
      const todos     = await obtenerAlumnos()
      const filtrados = todos.filter(a => {
        const f = (a.created_at ?? '').slice(0, 10)
        return f >= desde && f <= hasta
      })
      if (filtrados.length === 0) {
        _setStatus('rango-status', 'No hay alumnos en ese rango.', true)
        return
      }
      descargarAlumnosInscritos(filtrados, desde, hasta)
      _setStatus('rango-status', `✓ ${filtrados.length} alumno(s)`)
    } catch (e) {
      _setStatus('rango-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-inscritos-rango', false)
    }
  })

  // Directorio maestros
  container.querySelector('#btn-maestros').addEventListener('click', async () => {
    _setBtnLoading('btn-maestros', true)
    _setStatus('maestros-status', 'Cargando...')
    try {
      const maestros = await obtenerMaestros()
      if (maestros.length === 0) {
        _setStatus('maestros-status', 'No se encontraron maestros.', true)
        return
      }
      descargarListaMaestros(maestros)
      _setStatus('maestros-status', `✓ ${maestros.length} maestro(s)`)
    } catch (e) {
      _setStatus('maestros-status', `Error: ${e.message}`, true)
    } finally {
      _setBtnLoading('btn-maestros', false)
    }
  })
}

function _p(val, fb = '—') { const s = String(val ?? '').trim(); return s || fb }
