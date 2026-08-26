/**
 * DuplicadosModal — revisión, selección y fusión inteligente de alumnos duplicados.
 *
 * Flujo:
 *  1. Analiza y detecta posibles duplicados mediante algoritmos fonéticos,
 *     soft token overlap y correlación de identidad familiar/contacto.
 *  2. Muestra la lista de parejas encontradas con nivel de certeza y motivos de coincidencia.
 *  3. Al abrir una pareja:
 *     - Carga en tiempo real las clases inscritas de ambos alumnos.
 *     - Permite al usuario elegir dinámicamente cuál alumno conservar como Principal.
 *     - Muestra el resultado de unificación de clases (ambas clases se combinan).
 *     - Permite resolver conflictos campo a campo antes de confirmar.
 *  4. Ejecuta la fusión transaccional atómica en backend (RPC) y refresca la vista.
 */
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
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
  alta: { clase: 'bg-success-subtle text-success border-success-subtle', icono: 'bi-check-circle-fill' },
  media: { clase: 'bg-warning-subtle text-warning-emphasis border-warning-subtle', icono: 'bi-exclamation-triangle-fill' },
}

function formatearValor(v) {
  if (v === null || v === undefined || v === '') return '<span class="text-muted fst-italic">— vacío —</span>'
  return escapeHTML(String(v))
}

function formatearTipo(tipo) {
  const badges = {
    completa: '<span class="badge rounded-pill border border-success-subtle bg-success-subtle text-success py-1 px-2" style="font-size:0.7rem;"><i class="bi bi-plus-circle me-1"></i>completa</span>',
    coincide: '<span class="badge rounded-pill border border-secondary-subtle bg-body-secondary text-body-secondary py-1 px-2" style="font-size:0.7rem;"><i class="bi bi-check2 me-1"></i>coincide</span>',
    conflicto: '<span class="badge rounded-pill border border-danger-subtle bg-danger-subtle text-danger py-1 px-2" style="font-size:0.7rem;"><i class="bi bi-exclamation-circle me-1"></i>conflicto</span>',
    vacia: '<span class="badge rounded-pill border border-secondary-subtle bg-body-secondary text-muted py-1 px-2" style="font-size:0.7rem;">vacío</span>',
  }
  return badges[tipo] || badges.vacia
}

function renderBadgesClases(clases, theme = 'primary') {
  if (!clases || !clases.length) return '<span class="text-muted fst-italic small">— Sin clases asignadas —</span>'
  return clases
    .map((c) => {
      const nombre = escapeHTML(c.nombre || 'Clase')
      const horario = c.clase_horarios?.[0]
        ? ` (${escapeHTML(c.clase_horarios[0].dia || '')} ${escapeHTML(String(c.clase_horarios[0].hora_inicio || '').slice(0, 5))})`
        : ''
      return `<span class="badge bg-${theme}-subtle text-${theme}-emphasis border border-${theme}-subtle text-wrap text-start py-1.5 px-2.5 rounded-3 shadow-xs fw-medium"><i class="bi bi-music-note-beamed me-1"></i>${nombre}${horario}</span>`
    })
    .join(' ')
}

export const DuplicadosModal = {
  /** @param {{ alumnos?: object[], onSuccess?: () => void }} opts */
  async abrir({ alumnos, onSuccess } = {}) {
    let listaAlumnos = alumnos || []

    // ── Paso 1: inicio del análisis ──────────────────────────────────────────
    const abrirDetector = () => {
      AppModal.open({
        title: 'Detectar alumnos duplicados',
        size: 'md',
        saveText: 'Analizar base de datos',
        body: `
          <div class="text-center py-4">
            <div class="p-3 rounded-circle bg-warning-subtle text-warning-emphasis d-inline-flex align-items-center justify-content-center mb-3">
              <i class="bi bi-search-heart fs-1"></i>
            </div>
            <h5 class="fw-bold mb-2">Análisis inteligente de duplicados</h5>
            <p class="text-muted mb-0 small px-3">
              El motor evaluará coincidencias fonéticas, variantes ortográficas (ej. <em>Matias</em> vs <em>Mathias Alejandro</em>),
              mismo padre o madre, teléfonos y fechas de nacimiento.
            </p>
          </div>
        `,
        onSave: async () => {
          try {
            AppModal.showLoading('Analizando alumnos y relaciones...')
            if (!listaAlumnos.length) {
              listaAlumnos = await obtenerTodosLosAlumnosParaAnalisis()
            }
            const resultado = detectarPosiblesDuplicados(listaAlumnos)
            AppModal.hideLoading()
            renderLista(resultado)
            return false
          } catch (error) {
            console.error('[DuplicadosModal] Error detectando:', error)
            AppToast.error(error.message || 'No se pudieron analizar los duplicados')
          }
        },
      })
    }

    // ── Paso 2: listado de parejas encontradas ───────────────────────────────
    const renderLista = (duplicados) => {
      if (!duplicados.length) {
        AppModal.open({
          title: 'Alumnos duplicados',
          size: 'md',
          hideSave: true,
          cancelText: 'Cerrar',
          body: `
            <div class="text-center py-4">
              <div class="p-3 rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3">
                <i class="bi bi-emoji-smile fs-1"></i>
              </div>
              <h5 class="fw-bold mb-1">No se encontraron alumnos duplicados</h5>
              <p class="text-muted mb-0 small">No hay registros que parezcan corresponder a la misma persona.</p>
            </div>
          `,
        })
        return
      }

      const items = duplicados
        .map((d, idx) => {
          const badge = NIVEL_BADGE[d.nivel] || NIVEL_BADGE.media
          const pct = Math.round(d.puntaje * 100)

          const motivos = []
          if (d.coincidencias?.padre_nombre) motivos.push('Mismo Padre')
          if (d.coincidencias?.madre_nombre) motivos.push('Misma Madre')
          if (d.coincidencias?.telefono) motivos.push('Mismo Teléfono')
          if (d.coincidencias?.fecha_nacimiento) motivos.push('Misma Fecha Nac.')
          if (d.esSubsetNombre) motivos.push('Nombre contenido/similar')

          const motivosHTML = motivos.length
            ? `<div class="text-muted small mt-1"><i class="bi bi-info-circle me-1 text-primary"></i>${escapeHTML(motivos.join(' · '))}</div>`
            : ''

          return `
            <div class="col-12 col-lg-6">
              <div class="d-flex align-items-start gap-3 border rounded-3 p-3.5 bg-body shadow-xs hover-shadow transition-all h-100" data-duplicado-idx="${idx}" style="cursor:pointer;" role="button">
                <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:46px;height:46px;font-size:1.1rem;font-weight:700;">
                  ${escapeHTML((d.a.nombre_completo || d.a.nombre || '?').slice(0, 1).toUpperCase())}
                </div>
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
                    <strong class="text-body text-truncate" style="font-size:0.95rem;">${escapeHTML(d.a.nombre_completo || d.a.nombre || 'Sin nombre')}</strong>
                    <span class="badge rounded-pill ${badge.clase} flex-shrink-0 py-1 px-2.5" style="font-size:0.75rem;"><i class="bi ${badge.icono} me-1"></i>${escapeHTML(d.nivelEtiqueta || d.nivel)} (${pct}%)</span>
                  </div>
                  <div class="text-muted small text-truncate"><i class="bi bi-arrow-repeat me-1 text-secondary"></i>${escapeHTML(d.b.nombre_completo || d.b.nombre || 'Sin nombre')}</div>
                  ${motivosHTML}
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary rounded-3 shadow-xs flex-shrink-0 px-2.5 py-1 align-self-center" style="font-size:0.78rem;">
                  <span>Revisar</span>
                  <i class="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          `
        })
        .join('')

      AppModal.open({
        title: `Alumnos duplicados encontrados (${duplicados.length})`,
        size: 'view',
        hideSave: true,
        cancelText: 'Cerrar',
        body: `
          <div class="p-2">
            <div class="p-3 rounded-3 bg-body-tertiary border mb-3 shadow-xs">
              <p class="text-muted small mb-0">
                Se encontraron <strong>${duplicados.length}</strong> pareja(s) de alumnos con alta probabilidad de ser la misma persona.
                Haz clic en cualquier pareja para comparar sus clases, elegir cuál conservar como principal y resolver los datos antes de fusionar.
              </p>
            </div>
            <div class="row g-2.5 overflow-auto pe-1" style="max-height: calc(92vh - 220px);">${items}</div>
          </div>
        `,
        onShow: (body) => {
          body.querySelectorAll('[data-duplicado-idx]').forEach((card) => {
            card.addEventListener('click', () => {
              const idx = Number(card.dataset.duplicadoIdx)
              const d = duplicados[idx]
              abrirDetalle(d, duplicados)
            })
          })
        },
      })
    }

    // ── Paso 3: detalle de fusión con clases y selector de principal ──────────
    const abrirDetalle = async (duplicado, listaCompletaDuplicados) => {
      AppModal.showLoading('Cargando clases e historial de los alumnos...')

      let clasesA = []
      let clasesB = []
      try {
        const [resA, resB] = await Promise.all([
          obtenerInscripcionesDetalladasAlumno(duplicado.a.id),
          obtenerInscripcionesDetalladasAlumno(duplicado.b.id),
        ])
        clasesA = resA || []
        clasesB = resB || []
      } catch (err) {
        console.warn('[DuplicadosModal] No se pudieron cargar clases detalladas:', err)
      } finally {
        AppModal.hideLoading()
      }

      // Por defecto sugerir el más completo
      const sugerido = quienEsMasCompleto(duplicado.a, duplicado.b)
      let principal = sugerido
      let obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a

      const renderModalContent = () => {
        const clasesPrincipal = principal.id === duplicado.a.id ? clasesA : clasesB
        const clasesObsoleto = principal.id === duplicado.a.id ? clasesB : clasesA

        // Unificar clases eliminando duplicados por ID de clase
        const mapClasesUnificadas = new Map()
        ;[...clasesPrincipal, ...clasesObsoleto].forEach((c) => {
          if (c?.id) mapClasesUnificadas.set(c.id, c)
          else if (c?.nombre) mapClasesUnificadas.set(c.nombre, c)
        })
        const clasesUnificadas = Array.from(mapClasesUnificadas.values())

        const fusion = construirFusion(principal, obsoleto)

        const renderFila = (campo) => {
          const badge = formatearTipo(campo.tipo)
          const principalValor = formatearValor(campo.valorPrincipal)
          const obsoletoValor = formatearValor(campo.valorObsoleto)
          const resultante = formatearValor(campo.valorFusionado)

          // Selector interactivo en caso de conflicto
          const celdaResultante = campo.puedeElegir
            ? `<select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1" data-fusion-key="${campo.key}" data-fusion-label="${escapeHTML(campo.label)}" style="font-size:0.8rem;">
                <option value="__principal__" ${campo.valorFusionado === campo.valorPrincipal ? 'selected' : ''}>${escapeHTML(campo.valorPrincipal)} (Principal)</option>
                <option value="__obsoleto__" ${campo.valorFusionado === campo.valorObsoleto ? 'selected' : ''}>${escapeHTML(campo.valorObsoleto)} (Secundario)</option>
              </select>`
            : `<span style="font-weight:600;" class="text-body">${resultante}</span>`

          return `
            <tr data-fusion-row="${campo.key}" data-fusion-tipo="${campo.tipo}">
              <td class="py-2.5 align-middle">
                <div class="fw-semibold text-body" style="font-size:0.85rem;">${escapeHTML(campo.label)}</div>
                <div class="mt-0.5">${badge}</div>
              </td>
              <td class="py-2.5 align-middle small">${principalValor}</td>
              <td class="py-2.5 align-middle small">${obsoletoValor}</td>
              <td class="py-2.5 align-middle">${celdaResultante}</td>
            </tr>
          `
        }

        const grupos = {}
        for (const campo of fusion.campos) {
          if (campo.tipo === 'vacia') continue
          if (!grupos[campo.grupo]) grupos[campo.grupo] = []
          grupos[campo.grupo].push(campo)
        }

        const filasPorGrupo = Object.entries(grupos)
          .map(([grupo, campos]) => `
            <tr class="table-light">
              <td colspan="4" class="py-1.5 fw-bold text-uppercase text-secondary" style="font-size:0.75rem; letter-spacing:0.04em;"><i class="bi bi-folder2-open me-1"></i>${escapeHTML(grupo)}</td>
            </tr>
            ${campos.map(renderFila).join('')}
          `)
          .join('')

        const resumenCompletados = fusion.completadosLabels.length
          ? `<div class="p-2.5 rounded-3 bg-success-subtle bg-opacity-30 border border-success-subtle small text-success mb-2"><i class="bi bi-check-circle-fill me-1"></i>Datos que se completan automáticamente: <strong>${escapeHTML(fusion.completadosLabels.join(', '))}</strong></div>`
          : ''

        const resumenConflictos = fusion.conflictosLabels.length
          ? `<div class="p-2.5 rounded-3 bg-danger-subtle bg-opacity-30 border border-danger-subtle small text-danger mb-2"><i class="bi bi-exclamation-triangle-fill me-1"></i>Conflictos a revisar: <strong>${escapeHTML(fusion.conflictosLabels.join(', '))}</strong> (selecciona el valor deseado en la tabla)</div>`
          : `<div class="p-2.5 rounded-3 bg-body-tertiary border small text-muted mb-2"><i class="bi bi-check2-circle text-success me-1"></i>Sin conflictos de datos: toda la información faltante se completará de forma automática.</div>`

        return `
          <div class="h-100 d-flex flex-column">
            
            <!-- Barra Superior: Selección de Registro Principal (Flex Shrink 0) -->
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2 flex-shrink-0">
              <div>
                <h6 class="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                  <i class="bi bi-shield-check text-primary fs-5"></i>
                  <span>¿Cuál alumno deseas conservar como Principal?</span>
                </h6>
                <small class="text-muted">El registro seleccionado absorbe los datos, clases e historial del secundario</small>
              </div>

              <div class="btn-group btn-group-sm rounded-3 shadow-xs overflow-hidden" role="group" id="btn-group-choose-principal">
                <button type="button" class="btn ${principal.id === duplicado.a.id ? 'btn-primary fw-bold' : 'btn-outline-secondary'} px-3 py-1.5" data-principal-id="${duplicado.a.id}">
                  <i class="bi ${principal.id === duplicado.a.id ? 'bi-check2-circle' : 'bi-circle'} me-1"></i>Conservar: ${escapeHTML(duplicado.a.nombre_completo || duplicado.a.nombre || 'Alumno A')}
                </button>
                <button type="button" class="btn ${principal.id === duplicado.b.id ? 'btn-primary fw-bold' : 'btn-outline-secondary'} px-3 py-1.5" data-principal-id="${duplicado.b.id}">
                  <i class="bi ${principal.id === duplicado.b.id ? 'bi-check2-circle' : 'bi-circle'} me-1"></i>Conservar: ${escapeHTML(duplicado.b.nombre_completo || duplicado.b.nombre || 'Alumno B')}
                </button>
              </div>
            </div>

            <!-- Estructura a Dos Columnas Independientes (Exacto al módulo CLASES) -->
            <div class="row g-3 flex-grow-1 overflow-hidden">
              
              <!-- Columna Izquierda: Fichas de Alumnos y Resumen de Clases -->
              <div class="col-12 col-lg-5 d-flex flex-column gap-2.5 overflow-auto pe-1" style="max-height: calc(92vh - 180px);">
                
                <!-- Ficha Alumno Principal (Conservado) -->
                <div class="p-3 border border-primary-subtle rounded-4 bg-body shadow-xs">
                  <div class="d-flex justify-content-between align-items-center mb-2 pb-1.5 border-bottom border-primary-subtle">
                    <div class="d-flex align-items-center gap-2">
                      <div class="p-2 rounded-circle bg-primary text-white flex-shrink-0">
                        <i class="bi bi-person-check-fill"></i>
                      </div>
                      <div class="text-truncate">
                        <strong class="text-primary d-block text-truncate" style="font-size:0.92rem;">${escapeHTML(principal.nombre_completo || principal.nombre || 'Principal')}</strong>
                        <small class="text-muted" style="font-size:0.72rem;">ID: ${principal.id}</small>
                      </div>
                    </div>
                    <span class="badge bg-primary text-white rounded-pill px-2.5 py-1 shadow-xs flex-shrink-0" style="font-size:0.7rem;">
                      <i class="bi bi-shield-lock-fill me-1"></i>Principal
                    </span>
                  </div>

                  <div class="d-flex flex-column gap-1 small text-muted mb-2" style="font-size:0.78rem;">
                    <div><i class="bi ${getInstrumentoIcon(principal.instrumento_principal || principal.instrumento)} text-primary me-1.5"></i>Cátedra: <strong class="text-body">${escapeHTML(principal.instrumento_principal || principal.instrumento || 'Sin instrumento')}</strong></div>
                    <div><i class="bi bi-card-heading text-secondary me-1.5"></i>Cédula: <strong class="text-body">${escapeHTML(principal.cedula || 'No registrada')}</strong></div>
                    <div><i class="bi bi-calendar-event text-secondary me-1.5"></i>Fecha Nac: <strong class="text-body">${formatDate(principal.fecha_nacimiento)}</strong></div>
                    <div><i class="bi bi-whatsapp text-success me-1.5"></i>Teléfono: <strong class="text-body">${escapeHTML(principal.telefono || 'Sin teléfono')}</strong></div>
                    <div><i class="bi bi-person-heart text-danger me-1.5"></i>Representante: <strong class="text-body">${escapeHTML(principal.padre_nombre || principal.madre_nombre || principal.familiar_nombre || 'No registrado')}</strong></div>
                  </div>

                  <div class="pt-1.5 border-top">
                    <small class="text-muted fw-semibold d-block mb-1" style="font-size:0.72rem;">Clases actualmente asignadas (${clasesPrincipal.length}):</small>
                    <div class="d-flex flex-wrap gap-1">
                      ${renderBadgesClases(clasesPrincipal, 'primary')}
                    </div>
                  </div>
                </div>

                <!-- Ficha Alumno Secundario (A Absorber y Eliminar) -->
                <div class="p-3 border border-warning-subtle rounded-4 bg-body shadow-xs">
                  <div class="d-flex justify-content-between align-items-center mb-2 pb-1.5 border-bottom border-warning-subtle">
                    <div class="d-flex align-items-center gap-2">
                      <div class="p-2 rounded-circle bg-warning-subtle text-warning-emphasis flex-shrink-0">
                        <i class="bi bi-person-dash-fill"></i>
                      </div>
                      <div class="text-truncate">
                        <strong class="text-body d-block text-truncate" style="font-size:0.92rem;">${escapeHTML(obsoleto.nombre_completo || obsoleto.nombre || 'Secundario')}</strong>
                        <small class="text-muted" style="font-size:0.72rem;">ID: ${obsoleto.id}</small>
                      </div>
                    </div>
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1 shadow-xs flex-shrink-0" style="font-size:0.7rem;">
                      <i class="bi bi-trash3-fill me-1"></i>A absorber
                    </span>
                  </div>

                  <div class="d-flex flex-column gap-1 small text-muted mb-2" style="font-size:0.78rem;">
                    <div><i class="bi ${getInstrumentoIcon(obsoleto.instrumento_principal || obsoleto.instrumento)} text-primary me-1.5"></i>Cátedra: <strong class="text-body">${escapeHTML(obsoleto.instrumento_principal || obsoleto.instrumento || 'Sin instrumento')}</strong></div>
                    <div><i class="bi bi-card-heading text-secondary me-1.5"></i>Cédula: <strong class="text-body">${escapeHTML(obsoleto.cedula || 'No registrada')}</strong></div>
                    <div><i class="bi bi-calendar-event text-secondary me-1.5"></i>Fecha Nac: <strong class="text-body">${formatDate(obsoleto.fecha_nacimiento)}</strong></div>
                    <div><i class="bi bi-whatsapp text-success me-1.5"></i>Teléfono: <strong class="text-body">${escapeHTML(obsoleto.telefono || 'Sin teléfono')}</strong></div>
                    <div><i class="bi bi-person-heart text-danger me-1.5"></i>Representante: <strong class="text-body">${escapeHTML(obsoleto.padre_nombre || obsoleto.madre_nombre || obsoleto.familiar_nombre || 'No registrado')}</strong></div>
                  </div>

                  <div class="pt-1.5 border-top">
                    <small class="text-muted fw-semibold d-block mb-1" style="font-size:0.72rem;">Clases que se transferirán (${clasesObsoleto.length}):</small>
                    <div class="d-flex flex-wrap gap-1">
                      ${renderBadgesClases(clasesObsoleto, 'warning')}
                    </div>
                  </div>
                </div>

                <!-- Banner Informativo de Unificación de Clases -->
                <div class="p-3 rounded-4 bg-success-subtle bg-opacity-30 border border-success-subtle shadow-xs">
                  <div class="d-flex align-items-center gap-2 mb-1.5">
                    <i class="bi bi-diagram-3-fill text-success fs-5 flex-shrink-0"></i>
                    <strong class="text-success-emphasis small">Fusión de clases (${clasesUnificadas.length} total):</strong>
                  </div>
                  <div class="d-flex flex-wrap gap-1">
                    ${renderBadgesClases(clasesUnificadas, 'success')}
                  </div>
                </div>

              </div>

              <!-- Columna Derecha: Resolución de Datos Campo a Campo -->
              <div class="col-12 col-lg-7 d-flex flex-column h-100">
                <div class="p-3 rounded-4 border bg-body shadow-xs d-flex flex-column h-100">
                  
                  <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom flex-shrink-0 flex-wrap gap-1">
                    <span class="small fw-bold text-uppercase text-body d-flex align-items-center gap-1.5" style="font-size:0.78rem;">
                      <i class="bi bi-table text-primary"></i>
                      <span>Resolución de Campos</span>
                    </span>
                    <div class="d-flex gap-1.5">
                      ${resumenConflictos}
                      ${resumenCompletados}
                    </div>
                  </div>

                  <div class="overflow-auto flex-grow-1 pe-1" style="max-height: calc(92vh - 270px);">
                    <table class="table table-hover align-middle mb-0" style="font-size:0.82rem;">
                      <thead class="table-light sticky-top">
                        <tr>
                          <th style="width:25%; font-size:0.75rem;">Campo</th>
                          <th style="width:25%; font-size:0.75rem;">Principal</th>
                          <th style="width:25%; font-size:0.75rem;">Secundario</th>
                          <th style="width:25%; font-size:0.75rem;">Definitivo</th>
                        </tr>
                      </thead>
                      <tbody>${filasPorGrupo}</tbody>
                    </table>
                  </div>

                  <div class="text-muted small mt-2 pt-2 border-top flex-shrink-0" style="font-size:0.74rem;">
                    <i class="bi bi-shield-fill-check text-success me-1"></i>Al confirmar, la unificación es atómica: se actualiza el principal, se migra el historial y se da de baja el registro secundario.
                  </div>

                </div>
              </div>

            </div>

          </div>
        `
      }

      const abrirModalDetalle = () => {
        let fusionActual = construirFusion(principal, obsoleto)

        AppModal.open({
          title: 'Revisar y fusionar alumnos',
          size: 'view',
          saveText: 'Confirmar y fusionar',
          cancelText: 'Volver a la lista',
          body: `<div id="modal-detalle-duplicado-container" class="h-100">${renderModalContent()}</div>`,
          onCancel: () => {
            if (listaCompletaDuplicados?.length) {
              renderLista(listaCompletaDuplicados)
            }
          },
          onShow: (modalBody) => {
            const bindEvents = () => {
              // Botones para alternar Principal / Secundario
              modalBody.querySelectorAll('#btn-group-choose-principal button').forEach((btn) => {
                btn.addEventListener('click', () => {
                  const targetId = btn.dataset.principalId
                  if (targetId === principal.id) return
                  principal = targetId === duplicado.a.id ? duplicado.a : duplicado.b
                  obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a
                  fusionActual = construirFusion(principal, obsoleto)
                  const container = modalBody.querySelector('#modal-detalle-duplicado-container')
                  if (container) {
                    container.innerHTML = renderModalContent()
                    bindEvents()
                  }
                })
              })

              // Selectores de resolución de conflicto
              modalBody.querySelectorAll('[data-fusion-key]').forEach((select) => {
                select.addEventListener('change', () => {
                  const key = select.dataset.fusionKey
                  const valor = select.value === '__obsoleto__' ? obsoleto[key] : principal[key]
                  const campo = fusionActual.campos.find((c) => c.key === key)
                  if (campo) {
                    campo.valorFusionado = valor ?? null
                    fusionActual.resultante[key] = valor ?? null
                  }
                  const row = modalBody.querySelector(`[data-fusion-row="${key}"]`)
                  if (row) {
                    const celda = row.querySelector('td:last-child span')
                    if (celda) celda.innerHTML = formatearValor(valor)
                  }
                })
              })
            }

            bindEvents()
          },
          onSave: async () => {
            try {
              AppModal.showLoading('Fusionando alumnos y migrando inscripciones...')
              const datosFusion = { ...fusionActual.resultante }
              delete datosFusion.id

              await fusionarAlumnos({
                principalId: principal.id,
                obsoletoId: obsoleto.id,
                datosFusion,
              })

              AppModal.hideLoading()
              AppToast.success(
                `Alumnos fusionados con éxito: se conservó a "${principal.nombre_completo || principal.nombre}" y se migraron todas sus clases.`,
              )

              if (typeof onSuccess === 'function') onSuccess()
              return true
            } catch (error) {
              AppModal.hideLoading()
              console.error('[DuplicadosModal] Error fusionando:', error)
              AppToast.error(error.message || 'No se pudieron fusionar los alumnos')
              return false
            }
          },
        })
      }

      abrirModalDetalle()
    }

    abrirDetector()
  },
}