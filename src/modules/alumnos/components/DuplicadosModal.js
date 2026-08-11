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
    completa: '<span class="badge rounded-pill border border-success-subtle bg-success-subtle text-success" style="font-size:0.7rem;">completa</span>',
    coincide: '<span class="badge rounded-pill border border-secondary-subtle bg-body-secondary text-body-secondary" style="font-size:0.7rem;">coincide</span>',
    conflicto: '<span class="badge rounded-pill border border-danger-subtle bg-danger-subtle text-danger" style="font-size:0.7rem;">conflicto</span>',
    vacia: '<span class="badge rounded-pill border border-secondary-subtle bg-body-secondary text-muted" style="font-size:0.7rem;">vacío</span>',
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
      return `<span class="badge bg-${theme}-subtle text-${theme}-emphasis border border-${theme}-subtle text-wrap text-start"><i class="bi bi-music-note-beamed me-1"></i>${nombre}${horario}</span>`
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
            <i class="bi bi-search-heart display-4 text-warning"></i>
            <p class="mt-3 mb-1 fw-semibold fs-5">Análisis inteligente de duplicados</p>
            <p class="text-muted mb-0 small px-3">
              El motor evaluará coincidencias fonéticas, variantes ortográficas (ej. <em>Matias</em> vs <em>Mathias Alejandro</em>),
              mismo padre o madre, teléfonos y fechas de nacimiento.
            </p>
          </div>
        `,
        onSave: async () => {
          try {
            AppModal.showLoading('Analizando <strong>alumnos</strong> y relaciones...')
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
              <i class="bi bi-emoji-smile display-4 text-success"></i>
              <p class="mt-3 mb-1 fw-semibold">No se encontraron alumnos duplicados</p>
              <p class="text-muted mb-0 small">No hay registros que parezcan corresponder a la misma persona.</p>
            </div>
          `,
        })
        return
      }

      const items = duplicados
        .map((d, idx) => {
          const badge = NIVEL_BADGE[d.nivel] || NIVEL_BADGE.media
          const compartidos = d.coincidencias?.compartidos || 0
          const pct = Math.round(d.puntaje * 100)

          const motivos = []
          if (d.coincidencias?.padre_nombre) motivos.push('Mismo Padre')
          if (d.coincidencias?.madre_nombre) motivos.push('Misma Madre')
          if (d.coincidencias?.telefono) motivos.push('Mismo Teléfono')
          if (d.coincidencias?.fecha_nacimiento) motivos.push('Misma Fecha Nac.')
          if (d.esSubsetNombre) motivos.push('Nombre contenido/similar')

          const motivosHTML = motivos.length
            ? `<div class="text-muted small mt-1"><i class="bi bi-info-circle me-1"></i>${escapeHTML(motivos.join(' · '))}</div>`
            : ''

          return `
            <div class="d-flex align-items-start gap-2 border rounded-3 p-3 mb-2 bg-body shadow-sm" data-duplicado-idx="${idx}" style="cursor:pointer; transition: transform .15s, border-color .15s;" role="button">
              <div class="avatar-compact bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:40px;height:40px;font-weight:600;">
                ${escapeHTML((d.a.nombre_completo || d.a.nombre || '?').slice(0, 1).toUpperCase())}
              </div>
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <div class="fw-semibold text-truncate">${escapeHTML(d.a.nombre_completo || d.a.nombre || 'Sin nombre')}</div>
                  <span class="badge rounded-pill ${badge.clase} flex-shrink-0" style="font-size:0.7rem;"><i class="bi ${badge.icono} me-1"></i>${escapeHTML(d.nivelEtiqueta || d.nivel)} (${pct}%)</span>
                </div>
                <div class="text-muted small text-truncate"><i class="bi bi-arrow-repeat me-1 text-secondary"></i>${escapeHTML(d.b.nombre_completo || d.b.nombre || 'Sin nombre')}</div>
                ${motivosHTML}
              </div>
              <i class="bi bi-chevron-right text-muted align-self-center fs-5"></i>
            </div>
          `
        })
        .join('')

      AppModal.open({
        title: `Alumnos duplicados encontrados (${duplicados.length})`,
        size: 'lg',
        hideSave: true,
        cancelText: 'Cerrar',
        body: `
          <p class="text-muted small mb-3">
            Se encontraron <strong>${duplicados.length}</strong> pareja(s) de alumnos con alta probabilidad de ser la misma persona.
            Haz clic en una pareja para inspeccionar sus clases, elegir cuál conservar y resolver los datos a unificar.
          </p>
          <div style="max-height: 60vh; overflow-y: auto; padding-right: 4px;">${items}</div>
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

      const renderModalContent = (body) => {
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
            ? `<select class="form-select form-select-sm" data-fusion-key="${campo.key}" data-fusion-label="${escapeHTML(campo.label)}">
                <option value="__principal__" ${campo.valorFusionado === campo.valorPrincipal ? 'selected' : ''}>${escapeHTML(campo.valorPrincipal)} (de ${escapeHTML(principal.nombre_completo || 'Principal')})</option>
                <option value="__obsoleto__" ${campo.valorFusionado === campo.valorObsoleto ? 'selected' : ''}>${escapeHTML(campo.valorObsoleto)} (de ${escapeHTML(obsoleto.nombre_completo || 'Obsoleto')})</option>
              </select>`
            : `<span style="font-weight:500;">${resultante}</span>`

          return `
            <tr data-fusion-row="${campo.key}" data-fusion-tipo="${campo.tipo}">
              <td class="py-2 align-middle">
                <div class="fw-semibold" style="font-size:0.85rem;">${escapeHTML(campo.label)}</div>
                <div class="mt-1">${badge}</div>
              </td>
              <td class="py-2 align-middle small">${principalValor}</td>
              <td class="py-2 align-middle small">${obsoletoValor}</td>
              <td class="py-2 align-middle">${celdaResultante}</td>
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
            <tr class="table-secondary">
              <td colspan="4" class="py-1 fw-bold text-uppercase" style="font-size:0.72rem; letter-spacing:0.04em;">${escapeHTML(grupo)}</td>
            </tr>
            ${campos.map(renderFila).join('')}
          `)
          .join('')

        const resumenCompletados = fusion.completadosLabels.length
          ? `<div class="mb-1 small text-success"><i class="bi bi-check-circle-fill me-1"></i>Datos que se completan automáticamente: <strong>${escapeHTML(fusion.completadosLabels.join(', '))}</strong></div>`
          : ''

        const resumenConflictos = fusion.conflictosLabels.length
          ? `<div class="mb-1 small text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>Conflictos a revisar: <strong>${escapeHTML(fusion.conflictosLabels.join(', '))}</strong> (selecciona el valor deseado en la tabla)</div>`
          : `<div class="mb-1 small text-muted"><i class="bi bi-check2 me-1"></i>Sin conflictos de datos: toda la información faltante se completa de forma automática.</div>`

        return `
          <!-- Selector del alumno a conservar como principal -->
          <div class="p-2 mb-3 border rounded-3 bg-body-tertiary">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <span class="small fw-bold text-uppercase text-body-secondary"><i class="bi bi-shield-check text-primary me-1"></i>¿Cuál alumno deseas conservar como Principal?</span>
                <div class="text-muted small">El registro principal se conserva y absorbe todos los datos, clases e historial del otro.</div>
              </div>
              <div class="btn-group btn-group-sm" role="group" id="btn-group-choose-principal">
                <button type="button" class="btn ${principal.id === duplicado.a.id ? 'btn-primary' : 'btn-outline-secondary'}" data-principal-id="${duplicado.a.id}">
                  Conservar: ${escapeHTML(duplicado.a.nombre_completo || duplicado.a.nombre || 'Alumno A')}
                </button>
                <button type="button" class="btn ${principal.id === duplicado.b.id ? 'btn-primary' : 'btn-outline-secondary'}" data-principal-id="${duplicado.b.id}">
                  Conservar: ${escapeHTML(duplicado.b.nombre_completo || duplicado.b.nombre || 'Alumno B')}
                </button>
              </div>
            </div>
          </div>

          <!-- Tarjetas de estado de clases de ambos alumnos -->
          <div class="row g-2 mb-3">
            <div class="col-md-6">
              <div class="p-2 border rounded-3 bg-body h-100 shadow-sm border-primary-subtle">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold text-primary small text-truncate"><i class="bi bi-person-fill me-1"></i>${escapeHTML(principal.nombre_completo || principal.nombre || 'Principal')}</span>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Principal</span>
                </div>
                <div class="small">
                  <span class="text-muted fw-semibold">Clases inscritas (${clasesPrincipal.length}):</span>
                  <div class="mt-1 d-flex flex-wrap gap-1">
                    ${renderBadgesClases(clasesPrincipal, 'primary')}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-2 border rounded-3 bg-body h-100 shadow-sm border-warning-subtle">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold text-secondary small text-truncate"><i class="bi bi-person-dash me-1"></i>${escapeHTML(obsoleto.nombre_completo || obsoleto.nombre || 'Secundario')}</span>
                  <span class="badge bg-danger-subtle text-danger border border-danger-subtle">A eliminar tras fusionar</span>
                </div>
                <div class="small">
                  <span class="text-muted fw-semibold">Clases inscritas (${clasesObsoleto.length}):</span>
                  <div class="mt-1 d-flex flex-wrap gap-1">
                    ${renderBadgesClases(clasesObsoleto, 'warning')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Banner Informativo de Unificación de Clases -->
          <div class="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3 border-success-subtle bg-success-subtle text-success-emphasis">
            <i class="bi bi-diagram-3-fill fs-5 flex-shrink-0"></i>
            <div>
              <strong>Fusión de clases:</strong> Al confirmar la fusión, <strong>${escapeHTML(principal.nombre_completo || principal.nombre || 'Principal')}</strong> quedará inscrito en <strong>${clasesUnificadas.length}</strong> clase(s) unificando ambas inscripciones:
              <div class="mt-1 d-flex flex-wrap gap-1">
                ${renderBadgesClases(clasesUnificadas, 'success')}
              </div>
            </div>
          </div>

          ${resumenConflictos}
          ${resumenCompletados}

          <!-- Tabla de Fusión Campo a Campo -->
          <div class="table-responsive border rounded-3 mt-2" style="max-height:48vh; overflow:auto;">
            <table class="table table-sm align-middle mb-0">
              <thead class="table-light sticky-top" style="z-index:5;">
                <tr>
                  <th style="width:24%;">Campo</th>
                  <th style="width:25%;">${escapeHTML(principal.nombre_completo || 'Principal')} (Conservado)</th>
                  <th style="width:25%;">${escapeHTML(obsoleto.nombre_completo || 'Obsoleto')} (A absorber)</th>
                  <th style="width:26%;">Resultado final</th>
                </tr>
              </thead>
              <tbody>${filasPorGrupo}</tbody>
            </table>
          </div>

          <div class="text-muted small mt-3">
            <i class="bi bi-lightning-charge text-warning me-1"></i>Al confirmar: se actualiza el registro principal, se migran todas las clases, asistencias, evaluaciones y progresos del registro secundario, y luego se elimina el registro secundario de forma atómica e irreversible.
          </div>
        `
      }

      const abrirModalDetalle = () => {
        let fusionActual = construirFusion(principal, obsoleto)

        AppModal.open({
          title: 'Revisar y fusionar alumnos',
          size: 'xl',
          saveText: 'Confirmar y fusionar',
          cancelText: 'Volver a la lista',
          body: `<div id="modal-detalle-duplicado-container">${renderModalContent()}</div>`,
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