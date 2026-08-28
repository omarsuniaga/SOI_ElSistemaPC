/**
 * duplicadosWorkbenchView.js
 *
 * Taller de Unificación de Duplicados — Vista Dedicada de 4 Columnas (Zero-Friction UX):
 *  - Columna 1: Bandeja vertical de parejas detectadas con buscador y filtros.
 *  - Columna 2: Ficha completa y clases del Alumno A (Selector Principal).
 *  - Columna 3: Ficha completa y clases del Alumno B (Selector Principal).
 *  - Columna 4: Resultado Unificado en vivo, resolución de conflictos y botón de fusión atómica.
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
import { getInstrumentoIcon } from '../../clases/utils/clasesUtils.js'
import { formatDate } from '../utils/alumnosUtils.js'

const NIVEL_BADGE = {
  alta: { clase: 'bg-success-subtle text-success border border-success-subtle', icono: 'bi-shield-check' },
  media: { clase: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle', icono: 'bi-exclamation-triangle-fill' },
}

function formatearValor(v) {
  if (v === null || v === undefined || v === '') return '<span class="text-body-secondary fst-italic opacity-50">— vacío —</span>'
  return escapeHTML(String(v))
}

function formatearTipo(tipo) {
  const badges = {
    completa: '<span class="badge rounded-pill border border-primary-subtle bg-primary-subtle text-primary py-0.5 px-1.5" style="font-size:0.65rem;"><i class="bi bi-plus-circle me-0.5"></i>Completa</span>',
    coincide: '<span class="badge rounded-pill border border-success-subtle bg-success-subtle text-success py-0.5 px-1.5" style="font-size:0.65rem;"><i class="bi bi-check2-circle me-0.5"></i>Idéntico</span>',
    conflicto: '<span class="badge rounded-pill border border-danger-subtle bg-danger-subtle text-danger py-0.5 px-1.5" style="font-size:0.65rem;"><i class="bi bi-exclamation-octagon-fill me-0.5"></i>Conflicto</span>',
    vacia: '<span class="badge rounded-pill border border-secondary-subtle bg-body-secondary text-body-secondary py-0.5 px-1.5" style="font-size:0.65rem;">Sin datos</span>',
  }
  return badges[tipo] || badges.vacia
}

function renderBadgesClases(clases, theme = 'primary') {
  if (!clases || !clases.length) return '<span class="text-body-secondary fst-italic small opacity-75" style="font-size:0.75rem;">— Sin clases registradas —</span>'
  return clases
    .map((c) => {
      const nombre = escapeHTML(c.nombre || 'Clase')
      const horario = c.clase_horarios?.[0]
        ? ` (${escapeHTML(c.clase_horarios[0].dia || '')} ${escapeHTML(String(c.clase_horarios[0].hora_inicio || '').slice(0, 5))})`
        : ''
      return `<span class="badge bg-${theme}-subtle text-${theme}-emphasis border border-${theme}-subtle py-1 px-2 rounded-3 shadow-xs fw-medium text-start" style="font-size:0.72rem;"><i class="bi bi-music-note-beamed me-1"></i>${nombre}${horario}</span>`
    })
    .join(' ')
}

export async function renderDuplicadosWorkbenchView(container) {
  if (!container) return

  // Estado reactivo local
  const state = {
    loading: true,
    alumnos: [],
    duplicados: [],
    filtroBusqueda: '',
    selectedIdx: 0,
    clasesA: [],
    clasesB: [],
    loadingClases: false,
    principalId: null,
    fusionActual: null,
  }

  container.innerHTML = `
    <div class="container-fluid px-3 py-3" id="workbench-duplicados-root">
      
      <!-- HEADER PRINCIPAL DE LA VISTA -->
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary-subtle flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2.5">
          <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 shadow-xs fw-semibold d-flex align-items-center gap-1.5" id="btnVolverAlumnos">
            <i class="bi bi-arrow-left"></i>
            <span>Volver a Alumnos</span>
          </button>
          <div>
            <h5 class="fw-bold mb-0 text-body d-flex align-items-center gap-2">
              <i class="bi bi-diagram-3-fill text-primary"></i>
              <span>Taller de Unificación de Duplicados</span>
            </h5>
            <small class="text-body-secondary" id="txtSubtitleDuplicados">Analizando expedientes...</small>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 py-1.5 shadow-xs fw-semibold d-flex align-items-center gap-1.5" id="btnInfoGuia">
            <i class="bi bi-info-circle-fill"></i>
            <span>¿Cómo funciona?</span>
          </button>
          <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 shadow-xs fw-semibold d-flex align-items-center gap-1.5" id="btnReanalizar">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Re-analizar</span>
          </button>
        </div>
      </div>

      <!-- CONTENEDOR PRINCIPAL REACTIVO -->
      <div id="workbench-content-area">
        <div class="text-center py-5">
          <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
          <h6 class="fw-bold text-body">Escaneando la base de datos...</h6>
          <p class="text-body-secondary small">Evaluando coincidencias fonéticas, familiares y teléfonos.</p>
        </div>
      </div>

    </div>
  `

  // ── Eventos de Cabecera ────────────────────────────────────────────────────
  container.querySelector('#btnVolverAlumnos')?.addEventListener('click', () => {
    router.navigate('alumnos')
  })

  container.querySelector('#btnInfoGuia')?.addEventListener('click', () => {
    AppModal.open({
      title: '¿Cómo funciona la unificación de duplicados?',
      size: 'md',
      hideSave: true,
      cancelText: 'Entendido',
      body: `
        <div class="p-2">
          <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-primary-subtle text-primary border border-primary-subtle mb-3">
            <i class="bi bi-shield-shaded fs-1 flex-shrink-0"></i>
            <div>
              <h6 class="fw-bold mb-1">Unificación Segura de 4 Columnas</h6>
              <p class="small mb-0 text-body">Diseñado para comparar lado a lado y fusionar expedientes de forma atómica.</p>
            </div>
          </div>
          <div class="d-flex flex-column gap-2.5">
            <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
              <span class="badge bg-primary rounded-circle p-2 flex-shrink-0" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;">1</span>
              <div class="small">
                <strong class="d-block text-body">Bandeja de Duplicados (Columna 1)</strong>
                <span class="text-body-secondary">Selecciona cualquier pareja de la lista para cargar sus expedientes automáticamente.</span>
              </div>
            </div>
            <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
              <span class="badge bg-success rounded-circle p-2 flex-shrink-0" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;">2</span>
              <div class="small">
                <strong class="d-block text-body">Elección de Principal (Columnas 2 y 3)</strong>
                <span class="text-body-secondary">Haz clic en "Conservar este como Principal" en el alumno que mantendrá su ID original.</span>
              </div>
            </div>
            <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
              <span class="badge bg-info text-white rounded-circle p-2 flex-shrink-0" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;">3</span>
              <div class="small">
                <strong class="d-block text-body">Resultado Unificado (Columna 4)</strong>
                <span class="text-body-secondary">Todas las clases de ambos alumnos se combinan y los datos faltantes se completan.</span>
              </div>
            </div>
            <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
              <span class="badge bg-warning text-black fw-bold rounded-circle p-2 flex-shrink-0" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;">4</span>
              <div class="small">
                <strong class="d-block text-body">Fusión Atómica</strong>
                <span class="text-body-secondary">Al hacer clic en "Confirmar y Fusionar", el registro secundario transfiere su historial y se da de baja.</span>
              </div>
            </div>
          </div>
        </div>
      `,
    })
  })

  container.querySelector('#btnReanalizar')?.addEventListener('click', async () => {
    await cargarDatos(true)
  })

  // ── Carga y Análisis de Datos ──────────────────────────────────────────────
  async function cargarDatos(forzar = false) {
    try {
      state.loading = true
      render()
      if (!state.alumnos.length || forzar) {
        state.alumnos = await obtenerTodosLosAlumnosParaAnalisis()
      }
      state.duplicados = detectarPosiblesDuplicados(state.alumnos)
      state.selectedIdx = 0
      state.loading = false

      if (state.duplicados.length > 0) {
        await cargarClasesPareja(state.duplicados[0])
      } else {
        render()
      }
    } catch (err) {
      state.loading = false
      console.error('[duplicadosWorkbenchView] Error cargando duplicados:', err)
      AppToast.error(err.message || 'Error al analizar duplicados')
      render()
    }
  }

  // Carga clases detalladas para la pareja seleccionada
  async function cargarClasesPareja(duplicado) {
    if (!duplicado) return
    state.loadingClases = true
    render()

    try {
      const [resA, resB] = await Promise.all([
        obtenerInscripcionesDetalladasAlumno(duplicado.a.id),
        obtenerInscripcionesDetalladasAlumno(duplicado.b.id),
      ])
      state.clasesA = resA || []
      state.clasesB = resB || []

      // Sugerir el más completo por defecto
      const sugerido = quienEsMasCompleto(duplicado.a, duplicado.b)
      state.principalId = sugerido.id
      const obsoleto = state.principalId === duplicado.a.id ? duplicado.b : duplicado.a
      state.fusionActual = construirFusion(sugerido, obsoleto)
    } catch (err) {
      console.warn('[duplicadosWorkbenchView] Error cargando clases:', err)
    } finally {
      state.loadingClases = false
      render()
    }
  }

  // ── Render Principal del Workbench ─────────────────────────────────────────
  function render() {
    const area = container.querySelector('#workbench-content-area')
    const subtitle = container.querySelector('#txtSubtitleDuplicados')
    if (!area) return

    if (state.loading) {
      if (subtitle) subtitle.textContent = 'Analizando expedientes...'
      area.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
          <h6 class="fw-bold text-body">Escaneando la base de datos...</h6>
          <p class="text-body-secondary small">Evaluando coincidencias fonéticas, familiares y teléfonos.</p>
        </div>
      `
      return
    }

    if (!state.duplicados.length) {
      if (subtitle) subtitle.textContent = 'Base de datos limpia y unificada'
      area.innerHTML = `
        <div class="text-center py-5">
          <div class="p-4 rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3 shadow-xs">
            <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
          </div>
          <h4 class="fw-bold text-body mb-2">¡Todo en orden! No hay duplicados pendientes</h4>
          <p class="text-body-secondary small mb-4" style="max-width: 480px; margin: 0 auto;">
            La base de datos se encuentra totalmente normalizada. Todos los expedientes de estudiantes tienen identidades únicas.
          </p>
          <button type="button" class="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-xs" id="btnVolverAlumnosFinal">
            <i class="bi bi-arrow-left me-1.5"></i>Volver al Directorio de Alumnos
          </button>
        </div>
      `
      area.querySelector('#btnVolverAlumnosFinal')?.addEventListener('click', () => router.navigate('alumnos'))
      return
    }

    if (subtitle) {
      subtitle.textContent = `${state.duplicados.length} pareja(s) detectadas con alta coincidencia`
    }

    const duplicado = state.duplicados[state.selectedIdx] || state.duplicados[0]
    const principal = state.principalId === duplicado.a.id ? duplicado.a : duplicado.b
    const obsoleto = state.principalId === duplicado.a.id ? duplicado.b : duplicado.a
    const fusion = state.fusionActual || construirFusion(principal, obsoleto)

    // Unificación de clases
    const clasesPrincipal = principal.id === duplicado.a.id ? state.clasesA : state.clasesB
    const clasesObsoleto = principal.id === duplicado.a.id ? state.clasesB : state.clasesA
    const mapClasesUnificadas = new Map()
    ;[...clasesPrincipal, ...clasesObsoleto].forEach((c) => {
      if (c?.id) mapClasesUnificadas.set(c.id, c)
      else if (c?.nombre) mapClasesUnificadas.set(c.nombre, c)
    })
    const clasesUnificadas = Array.from(mapClasesUnificadas.values())

    // Filtro de búsqueda en la bandeja
    const listaFiltrada = state.duplicados.filter((d) => {
      if (!state.filtroBusqueda) return true
      const q = state.filtroBusqueda.toLowerCase()
      const nA = (d.a.nombre_completo || d.a.nombre || '').toLowerCase()
      const nB = (d.b.nombre_completo || d.b.nombre || '').toLowerCase()
      return nA.includes(q) || nB.includes(q)
    })

    // ── HTML COLUMNA 1: Bandeja de Duplicados ────────────────────────────────
    const col1Cards = listaFiltrada.map((d, idx) => {
      const isSelected = d === duplicado
      const pct = Math.round(d.puntaje * 100)
      const badge = NIVEL_BADGE[d.nivel] || NIVEL_BADGE.media

      const motivos = []
      if (d.coincidencias?.padre_nombre) motivos.push('Padre')
      if (d.coincidencias?.madre_nombre) motivos.push('Madre')
      if (d.coincidencias?.telefono) motivos.push('Teléfono')
      if (d.coincidencias?.fecha_nacimiento) motivos.push('Fecha Nac.')
      if (d.esSubsetNombre) motivos.push('Nombre')

      return `
        <div class="p-2.5 rounded-3 border transition-all mb-2 cursor-pointer ${isSelected ? 'border-2 border-primary bg-primary bg-opacity-10 shadow-xs' : 'border-secondary-subtle bg-body hover-bg-light'}" data-select-duplicado="${state.duplicados.indexOf(d)}" style="cursor:pointer;">
          <div class="d-flex align-items-center justify-content-between gap-1 mb-1">
            <strong class="text-body text-truncate small" style="font-size:0.85rem;">${escapeHTML(d.a.nombre_completo || d.a.nombre || 'A')}</strong>
            <span class="badge ${badge.clase} rounded-pill flex-shrink-0" style="font-size:0.65rem;">${pct}%</span>
          </div>
          <div class="text-body-secondary small text-truncate mb-1.5" style="font-size:0.75rem;">
            <i class="bi bi-arrow-left-right me-1 text-secondary"></i>${escapeHTML(d.b.nombre_completo || d.b.nombre || 'B')}
          </div>
          <div class="d-flex flex-wrap gap-1">
            ${motivos.map((m) => `<span class="badge bg-body-secondary text-body-secondary border border-secondary-subtle rounded-pill py-0.5 px-1.5" style="font-size:0.62rem;"><i class="bi bi-check2 text-success me-0.5"></i>${escapeHTML(m)}</span>`).join('')}
          </div>
        </div>
      `
    }).join('')

    // ── HTML COLUMNA 4: Tabla de Resolución de Campos ────────────────────────
    const renderFilaCampo = (campo) => {
      const badge = formatearTipo(campo.tipo)
      const valorPrincipal = formatearValor(campo.valorPrincipal)
      const valorObsoleto = formatearValor(campo.valorObsoleto)
      const resultante = formatearValor(campo.valorFusionado)

      let filaClase = ''
      if (campo.tipo === 'conflicto') filaClase = 'bg-danger bg-opacity-10'
      else if (campo.tipo === 'completa') filaClase = 'bg-primary bg-opacity-10'

      const celdaResultante = campo.puedeElegir
        ? `<select class="form-select form-select-sm rounded-3 shadow-xs border-primary fw-semibold py-0.5 bg-body text-body" data-fusion-key="${campo.key}" style="font-size:0.75rem;">
            <option value="__principal__" ${campo.valorFusionado === campo.valorPrincipal ? 'selected' : ''}>${escapeHTML(campo.valorPrincipal)} (Principal)</option>
            <option value="__obsoleto__" ${campo.valorFusionado === campo.valorObsoleto ? 'selected' : ''}>${escapeHTML(campo.valorObsoleto)} (Secundario)</option>
          </select>`
        : `<span class="fw-semibold text-body" style="font-size:0.78rem;">${resultante}</span>`

      return `
        <tr data-fusion-row="${campo.key}" class="${filaClase}">
          <td class="py-1.5 align-middle">
            <div class="fw-semibold text-body" style="font-size:0.78rem;">${escapeHTML(campo.label)}</div>
            <div class="mt-0.5">${badge}</div>
          </td>
          <td class="py-1.5 align-middle">${celdaResultante}</td>
        </tr>
      `
    }

    const camposRelevantes = fusion.campos.filter((c) => c.tipo !== 'vacia')

    area.innerHTML = `
      <div class="row g-3 align-items-stretch">
        
        <!-- ═══════════════════════════════════════════════════════════════════
             COLUMNA 1: BANDEJA DE DUPLICADOS
             ═══════════════════════════════════════════════════════════════════ -->
        <div class="col-12 col-xl-3 d-flex flex-column">
          <div class="p-3 rounded-4 border border-secondary-subtle bg-body shadow-xs d-flex flex-column h-100">
            
            <div class="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom border-secondary-subtle">
              <span class="small fw-bold text-uppercase text-body d-flex align-items-center gap-1.5" style="font-size:0.8rem;">
                <i class="bi bi-collection text-primary"></i>
                <span>Bandeja (${state.duplicados.length})</span>
              </span>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5" style="font-size:0.7rem;">
                Pendientes
              </span>
            </div>

            <!-- Buscador interno -->
            <div class="input-group input-group-sm mb-2.5">
              <span class="input-group-text bg-body-tertiary border-secondary-subtle"><i class="bi bi-search text-secondary"></i></span>
              <input type="text" class="form-control bg-body text-body border-secondary-subtle" placeholder="Filtrar por nombre..." id="inputBuscadorDuplicados" value="${escapeHTML(state.filtroBusqueda)}" style="font-size:0.78rem;">
            </div>

            <!-- Lista de Parejas con Scroll -->
            <div class="overflow-auto flex-grow-1 pe-1" style="max-height: calc(100vh - 280px);">
              ${col1Cards || '<div class="text-center py-4 text-body-secondary small">Sin resultados para el filtro.</div>'}
            </div>

          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════
             COLUMNA 2: EXPEDIENTE ALUMNO A
             ═══════════════════════════════════════════════════════════════════ -->
        <div class="col-12 col-md-6 col-xl-3 d-flex flex-column">
          <div class="p-3 rounded-4 border transition-all h-100 d-flex flex-column ${principal.id === duplicado.a.id ? 'border-2 border-primary bg-primary bg-opacity-10 shadow-xs' : 'border-secondary-subtle bg-body-tertiary bg-opacity-50'} position-relative">
            
            <div class="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom border-secondary-subtle">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar-compact ${principal.id === duplicado.a.id ? 'bg-primary text-white' : 'bg-body-secondary text-body-secondary border border-secondary-subtle'} d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:38px;height:38px;font-weight:700;font-size:0.95rem;">
                  ${escapeHTML((duplicado.a.nombre_completo || duplicado.a.nombre || 'A').slice(0, 1).toUpperCase())}
                </div>
                <div class="min-w-0">
                  <strong class="text-body d-block text-truncate" style="font-size:0.88rem;">${escapeHTML(duplicado.a.nombre_completo || duplicado.a.nombre || 'Alumno A')}</strong>
                  <small class="text-body-secondary" style="font-size:0.7rem;">ID: ${duplicado.a.id}</small>
                </div>
              </div>

              ${principal.id === duplicado.a.id
                ? `<span class="badge bg-primary text-white rounded-pill px-2 py-0.5" style="font-size:0.68rem;"><i class="bi bi-check-circle-fill me-1"></i>Principal</span>`
                : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-0.5" style="font-size:0.68rem;"><i class="bi bi-arrow-down-circle me-1"></i>Secundario</span>`
              }
            </div>

            <!-- Ficha de Datos Personales -->
            <div class="d-flex flex-column gap-1 small text-body-secondary my-2 flex-grow-1" style="font-size:0.76rem;">
              <div><i class="bi ${getInstrumentoIcon(duplicado.a.instrumento_principal || duplicado.a.instrumento)} text-primary me-1.5"></i>Cátedra: <strong class="text-body">${escapeHTML(duplicado.a.instrumento_principal || duplicado.a.instrumento || 'No especificada')}</strong></div>
              <div><i class="bi bi-card-heading text-secondary me-1.5"></i>Cédula: <strong class="text-body">${escapeHTML(duplicado.a.cedula || 'No registrada')}</strong></div>
              <div><i class="bi bi-calendar-event text-secondary me-1.5"></i>Nacimiento: <strong class="text-body">${formatDate(duplicado.a.fecha_nacimiento)}</strong></div>
              <div><i class="bi bi-whatsapp text-success me-1.5"></i>Teléfono: <strong class="text-body">${escapeHTML(duplicado.a.telefono || 'Sin teléfono')}</strong></div>
              <div><i class="bi bi-person-heart text-danger me-1.5"></i>Representante: <strong class="text-body">${escapeHTML(duplicado.a.padre_nombre || duplicado.a.madre_nombre || duplicado.a.familiar_nombre || 'No registrado')}</strong></div>
            </div>

            <!-- Clases Inscritas -->
            <div class="pt-2 border-top border-secondary-subtle mb-3">
              <small class="text-body-secondary fw-semibold d-block mb-1" style="font-size:0.7rem;">Clases inscritas (${state.clasesA.length}):</small>
              <div class="d-flex flex-wrap gap-1">${renderBadgesClases(state.clasesA, 'primary')}</div>
            </div>

            <!-- Botón Selector Principal -->
            <button type="button" class="btn btn-sm w-100 rounded-3 fw-bold mt-auto ${principal.id === duplicado.a.id ? 'btn-primary' : 'btn-outline-secondary'}" data-set-principal="${duplicado.a.id}" style="font-size:0.78rem;">
              <i class="bi ${principal.id === duplicado.a.id ? 'bi-check2-circle' : 'bi-circle'} me-1"></i>${principal.id === duplicado.a.id ? '✓ Conservado como Principal' : 'Conservar como Principal'}
            </button>

          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════
             COLUMNA 3: EXPEDIENTE ALUMNO B
             ═══════════════════════════════════════════════════════════════════ -->
        <div class="col-12 col-md-6 col-xl-3 d-flex flex-column">
          <div class="p-3 rounded-4 border transition-all h-100 d-flex flex-column ${principal.id === duplicado.b.id ? 'border-2 border-primary bg-primary bg-opacity-10 shadow-xs' : 'border-secondary-subtle bg-body-tertiary bg-opacity-50'} position-relative">
            
            <div class="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom border-secondary-subtle">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar-compact ${principal.id === duplicado.b.id ? 'bg-primary text-white' : 'bg-body-secondary text-body-secondary border border-secondary-subtle'} d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:38px;height:38px;font-weight:700;font-size:0.95rem;">
                  ${escapeHTML((duplicado.b.nombre_completo || duplicado.b.nombre || 'B').slice(0, 1).toUpperCase())}
                </div>
                <div class="min-w-0">
                  <strong class="text-body d-block text-truncate" style="font-size:0.88rem;">${escapeHTML(duplicado.b.nombre_completo || duplicado.b.nombre || 'Alumno B')}</strong>
                  <small class="text-body-secondary" style="font-size:0.7rem;">ID: ${duplicado.b.id}</small>
                </div>
              </div>

              ${principal.id === duplicado.b.id
                ? `<span class="badge bg-primary text-white rounded-pill px-2 py-0.5" style="font-size:0.68rem;"><i class="bi bi-check-circle-fill me-1"></i>Principal</span>`
                : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-0.5" style="font-size:0.68rem;"><i class="bi bi-arrow-down-circle me-1"></i>Secundario</span>`
              }
            </div>

            <!-- Ficha de Datos Personales -->
            <div class="d-flex flex-column gap-1 small text-body-secondary my-2 flex-grow-1" style="font-size:0.76rem;">
              <div><i class="bi ${getInstrumentoIcon(duplicado.b.instrumento_principal || duplicado.b.instrumento)} text-primary me-1.5"></i>Cátedra: <strong class="text-body">${escapeHTML(duplicado.b.instrumento_principal || duplicado.b.instrumento || 'No especificada')}</strong></div>
              <div><i class="bi bi-card-heading text-secondary me-1.5"></i>Cédula: <strong class="text-body">${escapeHTML(duplicado.b.cedula || 'No registrada')}</strong></div>
              <div><i class="bi bi-calendar-event text-secondary me-1.5"></i>Nacimiento: <strong class="text-body">${formatDate(duplicado.b.fecha_nacimiento)}</strong></div>
              <div><i class="bi bi-whatsapp text-success me-1.5"></i>Teléfono: <strong class="text-body">${escapeHTML(duplicado.b.telefono || 'Sin teléfono')}</strong></div>
              <div><i class="bi bi-person-heart text-danger me-1.5"></i>Representante: <strong class="text-body">${escapeHTML(duplicado.b.padre_nombre || duplicado.b.madre_nombre || duplicado.b.familiar_nombre || 'No registrado')}</strong></div>
            </div>

            <!-- Clases Inscritas -->
            <div class="pt-2 border-top border-secondary-subtle mb-3">
              <small class="text-body-secondary fw-semibold d-block mb-1" style="font-size:0.7rem;">Clases inscritas (${state.clasesB.length}):</small>
              <div class="d-flex flex-wrap gap-1">${renderBadgesClases(state.clasesB, 'warning')}</div>
            </div>

            <!-- Botón Selector Principal -->
            <button type="button" class="btn btn-sm w-100 rounded-3 fw-bold mt-auto ${principal.id === duplicado.b.id ? 'btn-primary' : 'btn-outline-secondary'}" data-set-principal="${duplicado.b.id}" style="font-size:0.78rem;">
              <i class="bi ${principal.id === duplicado.b.id ? 'bi-check2-circle' : 'bi-circle'} me-1"></i>${principal.id === duplicado.b.id ? '✓ Conservado como Principal' : 'Conservar como Principal'}
            </button>

          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════
             COLUMNA 4: RESULTADO UNIFICADO & FUSIÓN EN VIVO
             ═══════════════════════════════════════════════════════════════════ -->
        <div class="col-12 col-xl-3 d-flex flex-column">
          <div class="p-3 rounded-4 border border-secondary-subtle bg-body shadow-xs d-flex flex-column h-100">
            
            <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-secondary-subtle">
              <span class="small fw-bold text-uppercase text-body d-flex align-items-center gap-1.5" style="font-size:0.8rem;">
                <i class="bi bi-magic text-primary"></i>
                <span>Resultado Unificado</span>
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5" style="font-size:0.68rem;">
                ${Math.round(duplicado.puntaje * 100)}% match
              </span>
            </div>

            <!-- Resumen de Clases Combinadas -->
            <div class="p-2.5 rounded-3 bg-success-subtle bg-opacity-30 border border-success-subtle mb-2.5">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <strong class="text-success-emphasis" style="font-size:0.72rem;"><i class="bi bi-diagram-3-fill me-1"></i>Clases combinadas (${clasesUnificadas.length}):</strong>
              </div>
              <div class="d-flex flex-wrap gap-1">${renderBadgesClases(clasesUnificadas, 'success')}</div>
            </div>

            <!-- Tabla de Campos Resultantes -->
            <div class="table-responsive rounded-3 border border-secondary-subtle flex-grow-1 mb-3" style="max-height: calc(100vh - 430px); overflow-y: auto;">
              <table class="table table-hover align-middle mb-0" style="font-size:0.75rem;">
                <thead class="sticky-top bg-body-tertiary border-bottom border-secondary-subtle">
                  <tr>
                    <th style="width:40%;">Campo</th>
                    <th style="width:60%;">Definitivo</th>
                  </tr>
                </thead>
                <tbody>${camposRelevantes.map(renderFilaCampo).join('')}</tbody>
              </table>
            </div>

            <!-- Acciones de Fusión -->
            <div class="d-flex flex-column gap-1.5 mt-auto pt-2 border-top border-secondary-subtle">
              <button type="button" class="btn btn-primary rounded-3 py-2 fw-bold shadow-xs d-flex align-items-center justify-content-center gap-1.5" id="btnConfirmarFusion" style="font-size:0.85rem;">
                <i class="bi bi-check2-circle fs-6"></i>
                <span>Confirmar y Fusionar</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary rounded-3 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1" id="btnFusionRapida" style="font-size:0.75rem;">
                <i class="bi bi-lightning-charge-fill text-warning"></i>
                <span>Fusión Rápida (1-Click)</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    `

    // ── Enlazar Eventos de la Vista ──────────────────────────────────────────
    // Buscador
    const inputBuscador = area.querySelector('#inputBuscadorDuplicados')
    if (inputBuscador) {
      inputBuscador.addEventListener('input', (e) => {
        state.filtroBusqueda = e.target.value
        render()
      })
    }

    // Selección de pareja en la bandeja
    area.querySelectorAll('[data-select-duplicado]').forEach((card) => {
      card.addEventListener('click', async () => {
        const idx = Number(card.dataset.selectDuplicado)
        if (idx === state.selectedIdx) return
        state.selectedIdx = idx
        await cargarClasesPareja(state.duplicados[idx])
      })
    })

    // Selección de Principal
    const cambiarPrincipal = (nuevoPrincipalId) => {
      if (nuevoPrincipalId === state.principalId) return
      state.principalId = nuevoPrincipalId
      const d = state.duplicados[state.selectedIdx]
      const p = state.principalId === d.a.id ? d.a : d.b
      const o = state.principalId === d.a.id ? d.b : d.a
      state.fusionActual = construirFusion(p, o)
      render()
    }

    area.querySelectorAll('[data-set-principal]').forEach((btn) => {
      btn.addEventListener('click', () => cambiarPrincipal(btn.dataset.setPrincipal))
    })

    // Selectores de resolución de conflicto
    area.querySelectorAll('[data-fusion-key]').forEach((select) => {
      select.addEventListener('change', () => {
        const key = select.dataset.fusionKey
        const d = state.duplicados[state.selectedIdx]
        const p = state.principalId === d.a.id ? d.a : d.b
        const o = state.principalId === d.a.id ? d.b : d.a
        const valor = select.value === '__obsoleto__' ? o[key] : p[key]
        const campo = state.fusionActual?.campos.find((c) => c.key === key)
        if (campo) {
          campo.valorFusionado = valor ?? null
          state.fusionActual.resultante[key] = valor ?? null
        }
      })
    })

    // Confirmar Fusión
    area.querySelector('#btnConfirmarFusion')?.addEventListener('click', async () => {
      await procesarFusion(false)
    })

    // Fusión Rápida
    area.querySelector('#btnFusionRapida')?.addEventListener('click', async () => {
      await procesarFusion(true)
    })
  }

  // ── Proceso de Fusión en Backend ───────────────────────────────────────────
  async function procesarFusion(esRapida = false) {
    const duplicado = state.duplicados[state.selectedIdx]
    if (!duplicado) return

    const principal = esRapida ? quienEsMasCompleto(duplicado.a, duplicado.b) : (state.principalId === duplicado.a.id ? duplicado.a : duplicado.b)
    const obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a
    const fusion = esRapida ? construirFusion(principal, obsoleto) : (state.fusionActual || construirFusion(principal, obsoleto))

    try {
      AppModal.showLoading('Ejecutando unificación atómica en base de datos...')
      const datosFusion = { ...fusion.resultante }
      delete datosFusion.id

      await fusionarAlumnos({
        principalId: principal.id,
        obsoletoId: obsoleto.id,
        datosFusion,
      })

      AppModal.hideLoading()
      AppToast.success(`Fusión exitosa: se conservó a "${principal.nombre_completo || principal.nombre}" y se migraron sus clases.`)

      // Filtrar pareja resuelta
      state.duplicados = state.duplicados.filter(
        (d) => d.a.id !== principal.id && d.a.id !== obsoleto.id && d.b.id !== principal.id && d.b.id !== obsoleto.id
      )
      state.selectedIdx = Math.max(0, Math.min(state.selectedIdx, state.duplicados.length - 1))

      if (state.duplicados.length > 0) {
        await cargarClasesPareja(state.duplicados[state.selectedIdx])
      } else {
        render()
      }
    } catch (err) {
      AppModal.hideLoading()
      console.error('[duplicadosWorkbenchView] Error fusionando:', err)
      AppToast.error(err.message || 'Error al fusionar alumnos')
    }
  }

  // Inicializar
  await cargarDatos()
}
