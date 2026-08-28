/**
 * duplicadosWorkbenchView.js — Taller de Unificación de Duplicados
 * Vista a pantalla completa (Workbench Split View de 2 paneles) para el portal administrativo.
 */
import { router } from '../../../core/router/router.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import {
  detectarPosiblesDuplicados,
  construirFusion,
  quienEsMasCompleto,
} from '../domain/duplicadosAlumnos.js'
import {
  fusionarAlumnos,
  obtenerTodosLosAlumnosParaAnalisis,
  obtenerInscripcionesDetalladasAlumno,
} from '../api/alumnosApi.js'

export async function renderDuplicadosWorkbenchView(container) {
  const abortController = new AbortController()

  // State
  let alumnosTodos = []
  let colaDuplicados = []
  let indiceActual = 0
  let principalSide = 'a' // 'a' or 'b'
  let clasesA = []
  let clasesB = []
  let fusionActual = null
  let cargandoDetalle = false

  renderLoading(container, 'Analizando base de alumnos en busca de duplicados...')

  try {
    alumnosTodos = await obtenerTodosLosAlumnosParaAnalisis()
    colaDuplicados = detectarPosiblesDuplicados(alumnosTodos)
    renderLayout(container)
    if (colaDuplicados.length > 0) {
      await cargarPareja(0)
    } else {
      renderVacio(container)
    }
  } catch (err) {
    console.error('[duplicadosWorkbenchView] Error inicializando:', err)
    renderError(container, err.message)
  }

  return {
    teardown: () => abortController.abort(),
  }

  function renderLoading(target, msg) {
    target.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center py-5" style="min-height: 450px;">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-body-secondary fw-semibold">${escapeHTML(msg)}</p>
      </div>
    `
  }

  function renderError(target, errorMsg) {
    target.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger shadow-sm border-danger-subtle p-4 rounded-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill fs-2 text-danger"></i>
            <div>
              <h5 class="mb-0 fw-bold">Error al analizar alumnos duplicados</h5>
              <p class="mb-0 text-muted small">${escapeHTML(errorMsg || 'No se pudo conectar con el servidor.')}</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm" id="btnReintentar">
              <i class="bi bi-arrow-clockwise me-1"></i> Reintentar análisis
            </button>
            <button class="btn btn-secondary btn-sm" id="btnVolverError">
              <i class="bi bi-arrow-left me-1"></i> Volver a Alumnos
            </button>
          </div>
        </div>
      </div>
    `
    target.querySelector('#btnReintentar')?.addEventListener('click', () => renderDuplicadosWorkbenchView(container))
    target.querySelector('#btnVolverError')?.addEventListener('click', () => router.navigate('alumnos'))
  }

  function renderVacio(target) {
    target.innerHTML = `
      <div class="container py-5 text-center" style="max-width: 600px;">
        <div class="p-5 border rounded-4 bg-body shadow-sm">
          <div class="w-16 h-16 rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3" style="width:64px;height:64px;font-size:2rem;">
            <i class="bi bi-check2-circle"></i>
          </div>
          <h4 class="fw-bold text-body-emphasis">¡Base de Alumnos Impecable!</h4>
          <p class="text-muted small mb-4">No se detectaron registros duplicados ni colisiones en el padrón de alumnos.</p>
          <button class="btn btn-primary btn-sm px-4 py-2" id="btnVolverVacio">
            <i class="bi bi-arrow-left me-1"></i> Volver al Directorio de Alumnos
          </button>
        </div>
      </div>
    `
    target.querySelector('#btnVolverVacio')?.addEventListener('click', () => router.navigate('alumnos'))
  }

  function renderLayout(target) {
    target.innerHTML = `
      <div class="container-fluid px-3 px-lg-4 py-3" id="workbench-root">
        <!-- TOP BAR -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 mb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5" id="btnVolverAlumnos">
              <i class="bi bi-arrow-left"></i> <span>Volver a Alumnos</span>
            </button>
            <div class="vr text-secondary"></div>
            <div>
              <h4 class="mb-0 fw-bold text-body-emphasis d-flex align-items-center gap-2">
                <i class="bi bi-diagram-3-fill text-primary"></i>
                <span>Taller de Unificación de Duplicados</span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" id="badge-total-cola" style="font-size:0.75rem;">
                  ${colaDuplicados.length} parejas detectadas
                </span>
              </h4>
              <p class="text-muted small mb-0">Reconciliación y fusión transaccional atómica de alumnos, clases e historial</p>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-info d-flex align-items-center gap-1" id="btnComoFunciona">
              <i class="bi bi-question-circle"></i> <span>¿Cómo funciona?</span>
            </button>
            <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" id="btnReanalizar">
              <i class="bi bi-arrow-repeat"></i> <span>Re-analizar</span>
            </button>
          </div>
        </div>

        <!-- WORKBENCH 2-PANEL GRID -->
        <div class="row g-4 items-start">
          
          <!-- LEFT SIDEBAR: BANDEJA / COLA (Col 4) -->
          <div class="col-12 col-lg-4 col-xl-3">
            <div class="card border shadow-sm rounded-4 h-100" style="min-height: calc(100vh - 180px);">
              <div class="card-header bg-body border-bottom p-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-bold text-uppercase small text-body-secondary">
                    <i class="bi bi-inbox-fill text-primary me-1"></i> Cola de Revisión
                  </span>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis font-monospace" id="label-pendientes-count">
                    ${colaDuplicados.length} pendientes
                  </span>
                </div>
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-body-tertiary border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control border-start-0" id="input-buscar-cola" placeholder="Buscar por nombre o tutor...">
                </div>
              </div>

              <div class="card-body p-2 overflow-y-auto" id="container-cola-list" style="max-height: calc(100vh - 270px);">
                <!-- Lista de tarjetas renderizada via JS -->
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL: WORKSPACE DE FUSIÓN (Col 8) -->
          <div class="col-12 col-lg-8 col-xl-9">
            <div class="card border shadow-sm rounded-4 p-3 p-lg-4 bg-body" id="workspace-fusion-container">
              <div class="text-center py-5 text-muted">
                <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                Cargando datos de la pareja seleccionada...
              </div>
            </div>
          </div>

        </div>
      </div>
    `

    // Bind Top Bar Events
    target.querySelector('#btnVolverAlumnos')?.addEventListener('click', () => router.navigate('alumnos'))
    target.querySelector('#btnComoFunciona')?.addEventListener('click', () => mostrarModalAyuda())
    target.querySelector('#btnReanalizar')?.addEventListener('click', async () => {
      renderLoading(target.querySelector('#workspace-fusion-container'), 'Re-analizando base completa...')
      try {
        alumnosTodos = await obtenerTodosLosAlumnosParaAnalisis()
        colaDuplicados = detectarPosiblesDuplicados(alumnosTodos)
        indiceActual = 0
        renderLayout(container)
        if (colaDuplicados.length > 0) {
          await cargarPareja(0)
        } else {
          renderVacio(container)
        }
        AppToast.success('Análisis actualizado con la base de datos')
      } catch (e) {
        AppToast.error('Error al re-analizar: ' + e.message)
      }
    })

    // Search input listener
    target.querySelector('#input-buscar-cola')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim()
      const cards = target.querySelectorAll('.item-cola-duplicado')
      cards.forEach((c) => {
        const text = c.textContent.toLowerCase()
        c.style.display = text.includes(q) ? 'flex' : 'none'
      })
    })

    renderListaCola()
  }

  function renderListaCola() {
    const listContainer = container.querySelector('#container-cola-list')
    if (!listContainer) return

    if (colaDuplicados.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-emoji-smile text-success fs-3 d-block mb-1"></i>
          ¡No quedan parejas pendientes!
        </div>
      `
      return
    }

    listContainer.innerHTML = colaDuplicados.map((item, idx) => {
      const isSelected = idx === indiceActual
      const pct = Math.round(item.puntaje * 100)

      const motivos = []
      if (item.coincidencias?.padre_nombre) motivos.push('Mismo Padre')
      if (item.coincidencias?.madre_nombre) motivos.push('Misma Madre')
      if (item.coincidencias?.telefono) motivos.push('Mismo Teléfono')
      if (item.esSubsetNombre) motivos.push('Nombre similar')

      return `
        <div class="p-2 mb-2 rounded-3 border cursor-pointer item-cola-duplicado d-flex flex-column gap-1 transition ${
          isSelected ? 'bg-primary-subtle border-primary shadow-sm' : 'bg-body border-secondary-subtle'
        }" data-dupe-index="${idx}" role="button" style="cursor:pointer; padding: 0.5rem;">
          <div class="d-flex align-items-center justify-content-between gap-1">
            <span class="fw-bold text-truncate text-body-emphasis small">${escapeHTML(item.a.nombre_completo || item.a.nombre || 'Alumno A')}</span>
            <span class="badge ${pct >= 80 ? 'bg-success text-white' : 'bg-warning text-dark'} flex-shrink-0" style="font-size:0.68rem;">${pct}%</span>
          </div>
          <div class="text-muted text-truncate" style="font-size:0.75rem;">
            <i class="bi bi-arrow-return-right me-1 text-secondary"></i>${escapeHTML(item.b.nombre_completo || item.b.nombre || 'Alumno B')}
          </div>
          ${motivos.length ? `<div class="text-muted mt-0.5 text-truncate" style="font-size:0.7rem;"><i class="bi bi-tags me-1"></i>${escapeHTML(motivos.join(' · '))}</div>` : ''}
        </div>
      `
    }).join('')

    listContainer.querySelectorAll('[data-dupe-index]').forEach((el) => {
      el.addEventListener('click', async () => {
        const idx = Number(el.dataset.dupeIndex)
        if (idx !== indiceActual) {
          await cargarPareja(idx)
        }
      })
    })
  }

  async function cargarPareja(idx) {
    indiceActual = idx
    renderListaCola()
    const pair = colaDuplicados[idx]
    if (!pair) return

    const wsContainer = container.querySelector('#workspace-fusion-container')
    if (!wsContainer) return

    wsContainer.innerHTML = `
      <div class="text-center py-5 text-muted">
        <div class="spinner-border text-primary spinner-border-sm me-2"></div>
        Cargando asignaturas y estado académico de ambos alumnos...
      </div>
    `

    try {
      const [resA, resB] = await Promise.all([
        obtenerInscripcionesDetalladasAlumno(pair.a.id),
        obtenerInscripcionesDetalladasAlumno(pair.b.id),
      ])
      clasesA = resA || []
      clasesB = resB || []
    } catch (e) {
      console.warn('[duplicadosWorkbenchView] Error cargando clases:', e)
      clasesA = []
      clasesB = []
    }

    // Default suggested principal
    const sugerido = quienEsMasCompleto(pair.a, pair.b)
    principalSide = sugerido.id === pair.a.id ? 'a' : 'b'
    renderWorkbenchContent()
  }

  function renderWorkbenchContent() {
    const wsContainer = container.querySelector('#workspace-fusion-container')
    if (!wsContainer) return

    const pair = colaDuplicados[indiceActual]
    if (!pair) return

    const principal = principalSide === 'a' ? pair.a : pair.b
    const obsoleto = principalSide === 'a' ? pair.b : pair.a
    const clasesPrincipal = principalSide === 'a' ? clasesA : clasesB
    const clasesObsoleto = principalSide === 'a' ? clasesB : clasesA

    fusionActual = construirFusion(principal, obsoleto)

    // Unify classes without duplicates
    const mapClases = new Map()
    ;[...clasesPrincipal, ...clasesObsoleto].forEach((c) => {
      if (c?.id) mapClases.set(c.id, c)
      else if (c?.nombre) mapClases.set(c.nombre, c)
    })
    const clasesUnificadas = Array.from(mapClases.values())

    // Render Rows for Diff Matrix
    const renderFila = (campo) => {
      const badge = formatearBadgeTipo(campo.tipo)
      const valA = formatearValor(principalSide === 'a' ? campo.valorPrincipal : campo.valorObsoleto)
      const valB = formatearValor(principalSide === 'a' ? campo.valorObsoleto : campo.valorPrincipal)
      const resultante = formatearValor(campo.valorFusionado)

      const celdaResultante = campo.puedeElegir
        ? `<select class="form-select form-select-sm" data-fusion-key="${campo.key}">
            <option value="__principal__" ${campo.valorFusionado === campo.valorPrincipal ? 'selected' : ''}>
              ${escapeHTML(campo.valorPrincipal || '')} (de ${escapeHTML(principal.nombre_completo || 'Principal')})
            </option>
            <option value="__obsoleto__" ${campo.valorFusionado === campo.valorObsoleto ? 'selected' : ''}>
              ${escapeHTML(campo.valorObsoleto || '')} (de ${escapeHTML(obsoleto.nombre_completo || 'Secundario')})
            </option>
          </select>`
        : `<span class="fw-bold text-success">${resultante}</span>`

      return `
        <tr data-fusion-row="${campo.key}">
          <td class="py-2.5 px-3 align-middle" style="width:24%;">
            <div class="fw-semibold text-body-emphasis" style="font-size:0.85rem;">${escapeHTML(campo.label)}</div>
            <div class="mt-0.5">${badge}</div>
          </td>
          <td class="py-2.5 px-3 align-middle small text-body" style="width:26%;">${valA}</td>
          <td class="py-2.5 px-3 align-middle small text-body" style="width:26%;">${valB}</td>
          <td class="py-2.5 px-3 align-middle bg-body-tertiary bg-opacity-50" style="width:24%;">${celdaResultante}</td>
        </tr>
      `
    }

    const grupos = {}
    for (const campo of fusionActual.campos) {
      if (campo.tipo === 'vacia') continue
      if (!grupos[campo.grupo]) grupos[campo.grupo] = []
      grupos[campo.grupo].push(campo)
    }

    const filasPorGrupo = Object.entries(grupos)
      .map(([grupo, campos]) => `
        <tr class="table-light">
          <td colspan="4" class="py-1.5 px-3 fw-bold text-uppercase text-secondary" style="font-size:0.72rem; letter-spacing:0.04em;">${escapeHTML(grupo)}</td>
        </tr>
        ${campos.map(renderFila).join('')}
      `)
      .join('')

    wsContainer.innerHTML = `
      <!-- 1. HEADER: Tarjetas Comparativas A vs B -->
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="fw-bold text-uppercase text-body-secondary mb-0">
            <i class="bi bi-people-fill text-primary me-1"></i> 1. Selección del Registro Canónico (Principal)
          </h6>
          <span class="text-muted small">Haz clic en una tarjeta para conservarla como Principal.</span>
        </div>

        <div class="row g-3">
          <!-- Tarjeta Alumno A -->
          <div class="col-md-6">
            <div class="p-3 border rounded-4 cursor-pointer transition ${principalSide === 'a' ? 'border-primary shadow-sm bg-primary-subtle bg-opacity-10' : 'bg-body border-secondary-subtle'}" 
                 id="card-select-a" role="button" style="cursor:pointer;">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <div class="min-w-0">
                  <div class="fw-bold text-body-emphasis fs-6 text-truncate">${escapeHTML(pair.a.nombre_completo || pair.a.nombre || 'Alumno A')}</div>
                  <span class="text-muted font-monospace" style="font-size:0.72rem;">ID: ...${escapeHTML(String(pair.a.id || '').slice(-6))}</span>
                </div>
                <span class="badge ${principalSide === 'a' ? 'bg-primary text-white shadow-xs' : 'bg-secondary-subtle text-secondary border'} py-1.5 px-2.5 rounded-pill d-inline-flex align-items-center flex-shrink-0" style="font-size:0.72rem;">
                  ${principalSide === 'a' ? '<i class="bi bi-check-circle-fill me-1"></i> Conservado (Principal)' : '<i class="bi bi-arrow-down-circle me-1"></i> A absorber'}
                </span>
              </div>

              <div class="small text-muted pt-2 border-top">
                <div class="row g-1">
                  <div class="col-6"><strong>Cátedra:</strong> ${escapeHTML(pair.a.catedra || pair.a.instrumento || '—')}</div>
                  <div class="col-6"><strong>Nacimiento:</strong> ${escapeHTML(pair.a.fecha_nacimiento || '—')}</div>
                  <div class="col-6"><strong>Teléfono:</strong> ${escapeHTML(pair.a.telefono || '—')}</div>
                  <div class="col-6"><strong>Representante:</strong> ${escapeHTML(pair.a.representante_nombre || pair.a.padre_nombre || pair.a.madre_nombre || '—')}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjeta Alumno B -->
          <div class="col-md-6">
            <div class="p-3 border rounded-4 cursor-pointer transition ${principalSide === 'b' ? 'border-primary shadow-sm bg-primary-subtle bg-opacity-10' : 'bg-body border-secondary-subtle'}" 
                 id="card-select-b" role="button" style="cursor:pointer;">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <div class="min-w-0">
                  <div class="fw-bold text-body-emphasis fs-6 text-truncate">${escapeHTML(pair.b.nombre_completo || pair.b.nombre || 'Alumno B')}</div>
                  <span class="text-muted font-monospace" style="font-size:0.72rem;">ID: ...${escapeHTML(String(pair.b.id || '').slice(-6))}</span>
                </div>
                <span class="badge ${principalSide === 'b' ? 'bg-primary text-white shadow-xs' : 'bg-secondary-subtle text-secondary border'} py-1.5 px-2.5 rounded-pill d-inline-flex align-items-center flex-shrink-0" style="font-size:0.72rem;">
                  ${principalSide === 'b' ? '<i class="bi bi-check-circle-fill me-1"></i> Conservado (Principal)' : '<i class="bi bi-arrow-down-circle me-1"></i> A absorber'}
                </span>
              </div>

              <div class="small text-muted pt-2 border-top">
                <div class="row g-1">
                  <div class="col-6"><strong>Cátedra:</strong> ${escapeHTML(pair.b.catedra || pair.b.instrumento || '—')}</div>
                  <div class="col-6"><strong>Nacimiento:</strong> ${escapeHTML(pair.b.fecha_nacimiento || '—')}</div>
                  <div class="col-6"><strong>Teléfono:</strong> ${escapeHTML(pair.b.telefono || '—')}</div>
                  <div class="col-6"><strong>Representante:</strong> ${escapeHTML(pair.b.representante_nombre || pair.b.padre_nombre || pair.b.madre_nombre || '—')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. BANNER: Consolidación de Clases e Historial -->
      <div class="alert alert-success py-3 px-3.5 mb-4 border-success-subtle bg-success-subtle text-success-emphasis rounded-3">
        <div class="d-flex align-items-start gap-2.5">
          <i class="bi bi-music-note-list fs-4 flex-shrink-0 mt-0.5"></i>
          <div class="flex-grow-1">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <strong class="fs-6">Consolidación automática de clases e historial</strong>
              <span class="badge bg-success text-white px-2.5 py-1">${clasesUnificadas.length} clase(s) unificadas</span>
            </div>
            <p class="mb-2 mt-1 small">
              Al confirmar la fusión, <strong>${escapeHTML(principal.nombre_completo || principal.nombre || 'Principal')}</strong> quedará inscrito en todas las asignaturas sin perder asistencias ni notas:
            </p>
            <div class="d-flex flex-wrap gap-1.5">
              ${renderBadgesClases(clasesUnificadas, 'success')}
            </div>
          </div>
        </div>
      </div>

      <!-- 3. TABLA: Resolución de Campos (Diff Matrix) -->
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="fw-bold text-uppercase text-body-secondary mb-0">
            <i class="bi bi-sliders text-primary me-1"></i> 2. Resolución Campo a Campo
          </h6>
          <div class="d-flex gap-3 small">
            <span class="text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>Conflicto</span>
            <span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Idéntico</span>
            <span class="text-primary"><i class="bi bi-lightning-charge me-1"></i>Auto-completa</span>
          </div>
        </div>

        <div class="table-responsive border rounded-3 overflow-hidden bg-body" style="max-height: 48vh;">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light sticky-top" style="z-index:5;">
              <tr class="small text-uppercase text-secondary">
                <th class="py-2.5 px-3">Campo</th>
                <th class="py-2.5 px-3">Valor Alumno A</th>
                <th class="py-2.5 px-3">Valor Alumno B</th>
                <th class="py-2.5 px-3 text-success">Valor Definitivo</th>
              </tr>
            </thead>
            <tbody>${filasPorGrupo}</tbody>
          </table>
        </div>
      </div>

      <!-- 4. FOOTER ACTIONS -->
      <div class="pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div class="text-muted small d-flex align-items-center gap-1.5">
          <i class="bi bi-shield-check text-success flex-shrink-0"></i>
          <span>La fusión es transaccional y atómica: el registro secundario se eliminará tras migrar todos sus datos.</span>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm px-3" id="btnFusionRapida">
            <i class="bi bi-lightning-charge-fill text-warning me-1"></i> Fusión Rápida (Sugeridos)
          </button>
          <button class="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm" id="btnConfirmarFusion">
            <i class="bi bi-check2-circle fs-6"></i> <span>Confirmar y Fusionar Alumnos</span>
          </button>
        </div>
      </div>
    `

    // Card Selection events
    wsContainer.querySelector('#card-select-a')?.addEventListener('click', () => {
      if (principalSide !== 'a') {
        principalSide = 'a'
        renderWorkbenchContent()
      }
    })

    wsContainer.querySelector('#card-select-b')?.addEventListener('click', () => {
      if (principalSide !== 'b') {
        principalSide = 'b'
        renderWorkbenchContent()
      }
    })

    // Conflict selects change
    wsContainer.querySelectorAll('[data-fusion-key]').forEach((select) => {
      select.addEventListener('change', () => {
        const key = select.dataset.fusionKey
        const valor = select.value === '__obsoleto__' ? obsoleto[key] : principal[key]
        const campo = fusionActual.campos.find((c) => c.key === key)
        if (campo) {
          campo.valorFusionado = valor ?? null
          fusionActual.resultante[key] = valor ?? null
        }
      })
    })

    // Actions
    wsContainer.querySelector('#btnConfirmarFusion')?.addEventListener('click', () => ejecutarFusion())
    wsContainer.querySelector('#btnFusionRapida')?.addEventListener('click', () => ejecutarFusion())
  }

  async function ejecutarFusion() {
    const pair = colaDuplicados[indiceActual]
    if (!pair) return

    const principal = principalSide === 'a' ? pair.a : pair.b
    const obsoleto = principalSide === 'a' ? pair.b : pair.a

    const btn = container.querySelector('#btnConfirmarFusion')
    const originalText = btn?.innerHTML
    if (btn) {
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Fusionando registros...'
    }

    try {
      const datosFusion = { ...fusionActual.resultante }
      delete datosFusion.id

      await fusionarAlumnos({
        principalId: principal.id,
        obsoletoId: obsoleto.id,
        datosFusion,
      })

      AppToast.success(`Fusión exitosa: se conservó a "${principal.nombre_completo || principal.nombre}" y se migraron todas sus clases.`)

      const obsoletoId = obsoleto.id
      colaDuplicados = colaDuplicados.filter(
        (d) => d !== pair && d.a.id !== obsoletoId && d.b.id !== obsoletoId,
      )

      if (indiceActual >= colaDuplicados.length) {
        indiceActual = Math.max(0, colaDuplicados.length - 1)
      }

      container.querySelector('#badge-total-cola').textContent = `${colaDuplicados.length} parejas detectadas`
      container.querySelector('#label-pendientes-count').textContent = `${colaDuplicados.length} pendientes`

      if (colaDuplicados.length > 0) {
        await cargarPareja(indiceActual)
      } else {
        renderVacio(container)
      }
    } catch (err) {
      console.error('[duplicadosWorkbenchView] Error fusionando:', err)
      AppToast.error('Error al fusionar alumnos: ' + (err.message || 'Falla transaccional'))
      if (btn) {
        btn.disabled = false
        btn.innerHTML = originalText
      }
    }
  }

  function formatearBadgeTipo(tipo) {
    const badges = {
      completa: '<span class="badge rounded-pill border border-primary-subtle bg-primary-subtle text-primary" style="font-size:0.7rem;"><i class="bi bi-lightning-charge me-1"></i>auto-completa</span>',
      coincide: '<span class="badge rounded-pill border border-success-subtle bg-success-subtle text-success" style="font-size:0.7rem;"><i class="bi bi-check-circle-fill me-1"></i>idéntico</span>',
      conflicto: '<span class="badge rounded-pill border border-danger-subtle bg-danger-subtle text-danger" style="font-size:0.7rem;"><i class="bi bi-exclamation-triangle-fill me-1"></i>conflicto</span>',
      vacia: '<span class="badge rounded-pill border border-secondary-subtle bg-body-secondary text-muted" style="font-size:0.7rem;">vacío</span>',
    }
    return badges[tipo] || badges.vacia
  }

  function formatearValor(v) {
    if (v === null || v === undefined || v === '') return '<span class="text-muted fst-italic opacity-75">— vacío —</span>'
    return escapeHTML(String(v))
  }

  function renderBadgesClases(clases, theme = 'success') {
    if (!clases || !clases.length) return '<span class="text-muted fst-italic small">— Sin clases asignadas —</span>'
    return clases
      .map((c) => {
        const nombre = escapeHTML(c.nombre || 'Clase')
        const horario = c.clase_horarios?.[0]
          ? ` (${escapeHTML(c.clase_horarios[0].dia || '')} ${escapeHTML(String(c.clase_horarios[0].hora_inicio || '').slice(0, 5))})`
          : ''
        return `<span class="badge bg-${theme}-subtle text-${theme}-emphasis border border-${theme}-subtle text-wrap py-1.5 px-2.5"><i class="bi bi-music-note-beamed me-1"></i>${nombre}${horario}</span>`
      })
      .join(' ')
  }

  function mostrarModalAyuda() {
    AppModal.open({
      title: '¿Cómo funciona el Taller de Unificación?',
      size: 'md',
      hideSave: true,
      cancelText: 'Entendido',
      body: `
        <div class="p-2">
          <h6 class="fw-bold mb-2"><i class="bi bi-diagram-3 text-primary me-1"></i> Lógica de Fusión Segura</h6>
          <p class="small text-muted mb-3">
            El taller detecta alumnos que comparten fecha de nacimiento, tutor o datos de contacto idénticos, garantizando que los hermanos no sean confundidos como duplicados.
          </p>
          <ol class="small text-muted ps-3 mb-0 space-y-2">
            <li class="mb-2"><strong>Registro Principal:</strong> Conserva su identificador único (ID), legajo y perfil en la base de datos.</li>
            <li class="mb-2"><strong>Migración de Historial:</strong> Todas las inscripciones de clases, asistencias pasadas y evaluaciones del registro secundario se transfieren automáticamente al principal.</li>
            <li><strong>Eliminación limpia:</strong> Una vez migrado todo el historial, el registro secundario se elimina de forma atómica en Supabase.</li>
          </ol>
        </div>
      `,
    })
  }
}
