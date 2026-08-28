/**
 * DuplicadosModal — triage continuo de alumnos duplicados.
 *
 * Flujo rediseñado (Master-Detail / Workbench limpio):
 *  1. Al abrir se analiza automáticamente la base y se muestra la lista de parejas
 *     candidatas con búsqueda rápida, nivel de certeza y motivos de coincidencia.
 *  2. Al abrir una pareja:
 *     - Carga en tiempo real las clases inscritas de ambos alumnos.
 *     - Tarjetas interactivas A vs B para elegir el registro Principal con 1 click.
 *     - Banner limpio de consolidación de clases e historial.
 *     - Tabla comparativa directa (Diff Matrix) con selección por radio button y preview en vivo.
 *  3. Ejecuta la fusión transaccional atómica en backend (RPC). Al terminar:
 *     - Notifica el éxito con un toast.
 *     - Quita la pareja resuelta de la cola.
 *     - Vuelve automáticamente a la lista SIN cerrar el modal, mostrando el contador restante.
 *  4. La vista de alumnos se refresca una sola vez, al cerrar el modal, si hubo fusiones.
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
  if (v === null || v === undefined || v === '') return '<span class="text-muted fst-italic opacity-75">— vacío —</span>'
  return escapeHTML(String(v))
}

function formatearTipo(tipo) {
  const badges = {
    completa: '<span class="badge rounded-pill border border-primary-subtle bg-primary-subtle text-primary" style="font-size:0.7rem;"><i class="bi bi-lightning-charge me-1"></i>auto-completa</span>',
    coincide: '<span class="badge rounded-pill border border-success-subtle bg-success-subtle text-success" style="font-size:0.7rem;"><i class="bi bi-check-circle-fill me-1"></i>idéntico</span>',
    conflicto: '<span class="badge rounded-pill border border-danger-subtle bg-danger-subtle text-danger" style="font-size:0.7rem;"><i class="bi bi-exclamation-triangle-fill me-1"></i>conflicto</span>',
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
      return `<span class="badge bg-${theme}-subtle text-${theme}-emphasis border border-${theme}-subtle text-wrap text-start py-1 px-2"><i class="bi bi-music-note-beamed me-1"></i>${nombre}${horario}</span>`
    })
    .join(' ')
}

function renderTarjetaPareja(d, idx) {
  const badge = NIVEL_BADGE[d.nivel] || NIVEL_BADGE.media
  const pct = Math.round(d.puntaje * 100)

  const motivos = []
  if (d.coincidencias?.padre_nombre) motivos.push('Mismo Padre')
  if (d.coincidencias?.madre_nombre) motivos.push('Misma Madre')
  if (d.coincidencias?.telefono) motivos.push('Mismo Teléfono')
  if (d.coincidencias?.fecha_nacimiento) motivos.push('Misma Fecha Nac.')
  if (d.esSubsetNombre) motivos.push('Nombre similar')

  const motivosHTML = motivos.length
    ? `<div class="text-muted small mt-1"><i class="bi bi-tags me-1 text-secondary"></i>${escapeHTML(motivos.join(' · '))}</div>`
    : ''

  const inicial = (d.a.nombre_completo || d.a.nombre || '?').slice(0, 1).toUpperCase()

  return `
    <div class="d-flex align-items-start gap-3 border rounded-3 p-3 mb-2 bg-body shadow-sm card-duplicado-item" data-duplicado-idx="${idx}" style="cursor:pointer; transition: all .15s ease;" role="button">
      <div class="avatar-compact bg-primary-subtle text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:42px;height:42px;font-weight:700;font-size:1rem;">
        ${escapeHTML(inicial)}
      </div>
      <div class="flex-grow-1 min-w-0">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div class="fw-bold text-truncate text-body-emphasis" style="font-size:0.95rem;">${escapeHTML(d.a.nombre_completo || d.a.nombre || 'Sin nombre')}</div>
          <span class="badge rounded-pill ${badge.clase} flex-shrink-0" style="font-size:0.72rem;"><i class="bi ${badge.icono} me-1"></i>${pct}% match</span>
        </div>
        <div class="text-muted small text-truncate mt-0.5"><i class="bi bi-arrow-return-right me-1 text-secondary"></i>${escapeHTML(d.b.nombre_completo || d.b.nombre || 'Sin nombre')}</div>
        ${motivosHTML}
      </div>
      <i class="bi bi-chevron-right text-muted align-self-center fs-5"></i>
    </div>
  `
}

export const DuplicadosModal = {
  /** @param {{ alumnos?: object[], onSuccess?: () => void }} opts */
  async abrir({ alumnos, onSuccess } = {}) {
    let listaAlumnos = alumnos || []
    let cola = []
    let yaAnalizado = false
    let fusionesRealizadas = 0

    // La vista de alumnos se refresca una sola vez, al cerrar, si hubo fusiones.
    const emitirActualizacion = () => {
      if (fusionesRealizadas > 0 && typeof onSuccess === 'function') onSuccess()
    }

    // ── Vista: cargando ─────────────────────────────────────────────────────
    const renderCargando = (mensaje) => {
      AppModal.open({
        title: 'Alumnos duplicados',
        size: 'lg',
        hideSave: true,
        cancelText: 'Cerrar',
        onCancel: emitirActualizacion,
        body: `
          <div class="d-flex flex-column align-items-center justify-content-center py-5">
            <div class="spinner-border text-primary mb-3" role="status"><span class="visually-hidden">Cargando...</span></div>
            <p class="text-muted mb-0 fw-medium">${escapeHTML(mensaje)}</p>
          </div>
        `,
      })
    }

    // ── Vista: error de análisis ────────────────────────────────────────────
    const renderErrorAnalisis = () => {
      AppModal.open({
        title: 'Alumnos duplicados',
        size: 'md',
        saveText: 'Reintentar análisis',
        cancelText: 'Cerrar',
        onCancel: emitirActualizacion,
        body: `
          <div class="text-center py-4">
            <i class="bi bi-wifi-off display-4 text-danger"></i>
            <p class="mt-3 mb-1 fw-semibold">No se pudo completar el análisis</p>
            <p class="text-muted mb-0 small">Revisá la conexión e intentá nuevamente.</p>
          </div>
        `,
        onSave: async () => {
          await analizar()
          return false
        },
      })
    }

    // ── Análisis automático ─────────────────────────────────────────────────
    const analizar = async () => {
      renderCargando('Analizando alumnos, familias y contactos en busca de duplicados...')
      try {
        if (!listaAlumnos.length) {
          listaAlumnos = await obtenerTodosLosAlumnosParaAnalisis()
        }
        cola = detectarPosiblesDuplicados(listaAlumnos)
        yaAnalizado = true
        renderLista()
      } catch (error) {
        console.error('[DuplicadosModal] Error detectando:', error)
        AppToast.error(error.message || 'No se pudieron analizar los duplicados')
        renderErrorAnalisis()
      }
    }

    // ── Vista: sin parejas pendientes ───────────────────────────────────────
    const renderVacio = () => {
      const titulo = yaAnalizado && fusionesRealizadas > 0
        ? '¡Listo! No quedan más parejas por revisar'
        : 'No se encontraron alumnos duplicados'
      AppModal.open({
        title: 'Alumnos duplicados',
        size: 'md',
        hideSave: true,
        cancelText: 'Cerrar',
        onCancel: emitirActualizacion,
        body: `
          <div class="text-center py-4">
            <i class="bi bi-emoji-smile display-4 text-success"></i>
            <p class="mt-3 mb-1 fw-semibold">${titulo}</p>
            <p class="text-muted mb-0 small">No hay registros pendientes que parezcan corresponder a la misma persona.</p>
          </div>
        `,
      })
    }

    // ── Vista: lista de parejas ─────────────────────────────────────────────
    const renderLista = () => {
      if (!cola.length) {
        renderVacio()
        return
      }

      const items = cola.map((d, idx) => renderTarjetaPareja(d, idx)).join('')

      AppModal.open({
        title: `Alumnos duplicados — ${cola.length} pareja(s) por revisar`,
        size: 'lg',
        hideSave: true,
        cancelText: 'Cerrar',
        onCancel: emitirActualizacion,
        body: `
          <div class="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
            <p class="text-muted small mb-0">
              Seleccioná una pareja para revisar clases, elegir cuál conservar y fusionar datos.
            </p>
            <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle font-monospace">${cola.length} pendientes</span>
          </div>

          <div class="mb-3">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-body-tertiary border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0" id="input-buscar-duplicados" placeholder="Filtrar por nombre...">
            </div>
          </div>

          <div id="lista-duplicados-container" style="max-height: 60vh; overflow-y: auto; padding-right: 4px;">${items}</div>
        `,
        onShow: (body) => {
          const container = body.querySelector('#lista-duplicados-container')
          const searchInput = body.querySelector('#input-buscar-duplicados')

          if (searchInput && container) {
            searchInput.addEventListener('input', (e) => {
              const q = e.target.value.toLowerCase().trim()
              container.querySelectorAll('.card-duplicado-item').forEach((card) => {
                const text = card.textContent.toLowerCase()
                card.style.display = text.includes(q) ? 'flex' : 'none'
              })
            })
          }

          body.querySelectorAll('[data-duplicado-idx]').forEach((card) => {
            card.addEventListener('click', () => {
              const idx = Number(card.dataset.duplicadoIdx)
              if (cola[idx]) abrirDetalle(cola[idx])
            })
          })
        },
      })
    }

    // ── Vista: detalle de fusión (Workbench Rediseñado) ──────────────────────
    const abrirDetalle = async (duplicado) => {
      renderCargando('Cargando clases e historial de ambos alumnos...')

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
      }

      // Por defecto sugerir el más completo
      const sugerido = quienEsMasCompleto(duplicado.a, duplicado.b)
      let principal = sugerido
      let obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a
      let fusionActual = construirFusion(principal, obsoleto)

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

          // Selector interactivo con radios por valor en caso de conflicto
          const celdaResultante = campo.puedeElegir
            ? `<select class="form-select form-select-sm" data-fusion-key="${campo.key}" data-fusion-label="${escapeHTML(campo.label)}">
                <option value="__principal__" ${campo.valorFusionado === campo.valorPrincipal ? 'selected' : ''}>${escapeHTML(campo.valorPrincipal)} (de ${escapeHTML(principal.nombre_completo || 'Principal')})</option>
                <option value="__obsoleto__" ${campo.valorFusionado === campo.valorObsoleto ? 'selected' : ''}>${escapeHTML(campo.valorObsoleto)} (de ${escapeHTML(obsoleto.nombre_completo || 'Obsoleto')})</option>
              </select>`
            : `<span class="fw-semibold text-body-emphasis">${resultante}</span>`

          return `
            <tr data-fusion-row="${campo.key}" data-fusion-tipo="${campo.tipo}">
              <td class="py-2.5 px-3 align-middle" style="width:24%;">
                <div class="fw-semibold text-body-emphasis" style="font-size:0.85rem;">${escapeHTML(campo.label)}</div>
                <div class="mt-0.5">${badge}</div>
              </td>
              <td class="py-2.5 px-3 align-middle small text-body" style="width:26%;">${principalValor}</td>
              <td class="py-2.5 px-3 align-middle small text-body" style="width:26%;">${obsoletoValor}</td>
              <td class="py-2.5 px-3 align-middle bg-body-tertiary bg-opacity-50" style="width:24%;">${celdaResultante}</td>
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
              <td colspan="4" class="py-1.5 px-3 fw-bold text-uppercase text-secondary" style="font-size:0.72rem; letter-spacing:0.04em;">${escapeHTML(grupo)}</td>
            </tr>
            ${campos.map(renderFila).join('')}
          `)
          .join('')

        const resumenConflictos = fusion.conflictosLabels.length
          ? `<div class="mb-2 small text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>Conflictos a revisar: <strong>${escapeHTML(fusion.conflictosLabels.join(', '))}</strong> (seleccioná el valor deseado en la tabla)</div>`
          : `<div class="mb-2 small text-success"><i class="bi bi-check-circle-fill me-1"></i>Sin conflictos de datos: toda la información faltante se completa de forma automática.</div>`

        return `
          <!-- 1. HEADER: Tarjetas comparativas de Alumno A vs Alumno B -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="small fw-bold text-uppercase text-body-secondary">
                <i class="bi bi-people-fill text-primary me-1"></i>1. ¿Cuál registro conservar como Principal?
              </span>
              <span class="text-muted small">El registro principal conserva su ID y legajo, absorbiendo al secundario.</span>
            </div>

            <div class="row g-3" id="btn-group-choose-principal">
              <!-- Tarjeta Alumno A -->
              <div class="col-md-6">
                <div class="p-3 border rounded-3 h-100 position-relative cursor-pointer ${principal.id === duplicado.a.id ? 'border-primary shadow-sm bg-primary-subtle bg-opacity-10' : 'bg-body'}" 
                     data-principal-id="${duplicado.a.id}" style="cursor:pointer; transition: all .15s ease;">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-compact ${principal.id === duplicado.a.id ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'} rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width:34px;height:34px;font-size:0.85rem;">
                        ${escapeHTML((duplicado.a.nombre_completo || duplicado.a.nombre || 'A').slice(0, 2).toUpperCase())}
                      </div>
                      <div>
                        <div class="fw-bold text-body-emphasis">${escapeHTML(duplicado.a.nombre_completo || duplicado.a.nombre || 'Alumno A')}</div>
                        <span class="text-muted small font-monospace" style="font-size:0.72rem;">ID: ...${escapeHTML(String(duplicado.a.id || '').slice(-6))}</span>
                      </div>
                    </div>
                    <span class="badge ${principal.id === duplicado.a.id ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary border'}">
                      ${principal.id === duplicado.a.id ? '<i class="bi bi-check-circle-fill me-1"></i>Principal (Conserva ID)' : 'A absorber'}
                    </span>
                  </div>

                  <div class="small text-muted pt-2 border-top">
                    <div><strong>Cátedra:</strong> ${escapeHTML(duplicado.a.catedra || duplicado.a.instrumento || '—')}</div>
                    <div><strong>Clases actuales:</strong> ${clasesA.length} clase(s)</div>
                  </div>
                </div>
              </div>

              <!-- Tarjeta Alumno B -->
              <div class="col-md-6">
                <div class="p-3 border rounded-3 h-100 position-relative cursor-pointer ${principal.id === duplicado.b.id ? 'border-primary shadow-sm bg-primary-subtle bg-opacity-10' : 'bg-body'}" 
                     data-principal-id="${duplicado.b.id}" style="cursor:pointer; transition: all .15s ease;">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-compact ${principal.id === duplicado.b.id ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'} rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width:34px;height:34px;font-size:0.85rem;">
                        ${escapeHTML((duplicado.b.nombre_completo || duplicado.b.nombre || 'B').slice(0, 2).toUpperCase())}
                      </div>
                      <div>
                        <div class="fw-bold text-body-emphasis">${escapeHTML(duplicado.b.nombre_completo || duplicado.b.nombre || 'Alumno B')}</div>
                        <span class="text-muted small font-monospace" style="font-size:0.72rem;">ID: ...${escapeHTML(String(duplicado.b.id || '').slice(-6))}</span>
                      </div>
                    </div>
                    <span class="badge ${principal.id === duplicado.b.id ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary border'}">
                      ${principal.id === duplicado.b.id ? '<i class="bi bi-check-circle-fill me-1"></i>Principal (Conserva ID)' : 'A absorber'}
                    </span>
                  </div>

                  <div class="small text-muted pt-2 border-top">
                    <div><strong>Cátedra:</strong> ${escapeHTML(duplicado.b.catedra || duplicado.b.instrumento || '—')}</div>
                    <div><strong>Clases actuales:</strong> ${clasesB.length} clase(s)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. BANNER: Consolidación de Clases e Historial -->
          <div class="alert alert-success py-2.5 px-3 small d-flex align-items-start gap-2.5 mb-3 border-success-subtle bg-success-subtle text-success-emphasis rounded-3">
            <i class="bi bi-music-note-list fs-5 flex-shrink-0 mt-0.5"></i>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-1">
                <strong>Fusión de clases e historial académico:</strong>
                <span class="badge bg-success text-white">${clasesUnificadas.length} clase(s) unificadas</span>
              </div>
              <div class="mt-1">
                Al confirmar la fusión, <strong>${escapeHTML(principal.nombre_completo || principal.nombre || 'Principal')}</strong> conservará todas las inscripciones combinadas sin duplicaciones:
              </div>
              <div class="mt-2 d-flex flex-wrap gap-1.5">
                ${renderBadgesClases(clasesUnificadas, 'success')}
              </div>
            </div>
          </div>

          ${resumenConflictos}

          <!-- 3. TABLA: Resolución campo a campo (Diff Matrix) -->
          <div class="table-responsive border rounded-3 mb-3" style="max-height:46vh; overflow-y:auto;">
            <table class="table table-sm table-hover align-middle mb-0">
              <thead class="table-light sticky-top" style="z-index:5;">
                <tr>
                  <th class="py-2 px-3">Campo</th>
                  <th class="py-2 px-3">${escapeHTML(principal.nombre_completo || 'Principal')} <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-1" style="font-size:0.65rem;">Conservado</span></th>
                  <th class="py-2 px-3">${escapeHTML(obsoleto.nombre_completo || 'Obsoleto')} <span class="badge bg-secondary-subtle text-secondary border ms-1" style="font-size:0.65rem;">A absorber</span></th>
                  <th class="py-2 px-3 text-success">Resultado final</th>
                </tr>
              </thead>
              <tbody>${filasPorGrupo}</tbody>
            </table>
          </div>

          <div class="text-muted small d-flex align-items-center gap-2">
            <i class="bi bi-shield-check text-success flex-shrink-0"></i>
            <span>La fusión migra automáticamente asistencias, calificaciones y progresos al registro conservado.</span>
          </div>
        `
      }

      AppModal.open({
        title: 'Revisar y fusionar alumnos',
        size: 'xl',
        saveText: 'Confirmar y fusionar',
        cancelText: 'Cerrar',
        onCancel: emitirActualizacion,
        body: `
          <button type="button" class="btn btn-sm btn-link text-decoration-none ps-0 mb-3" id="btn-volver-lista">
            <i class="bi bi-arrow-left me-1"></i>Volver a la cola (${cola.length} pendiente(s))
          </button>
          <div id="modal-detalle-duplicado-container">${renderModalContent()}</div>
        `,
        onShow: (modalBody) => {
          modalBody.querySelector('#btn-volver-lista')?.addEventListener('click', () => renderLista())

          const bindEvents = () => {
            // Click directo en cualquiera de las 2 tarjetas para alternar Principal
            modalBody.querySelectorAll('[data-principal-id]').forEach((card) => {
              card.addEventListener('click', () => {
                const targetId = card.dataset.principalId
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

            fusionesRealizadas += 1

            // Quitar la pareja resuelta y toda pareja pendiente que referencie al registro eliminado.
            const obsoletoId = obsoleto.id
            cola = cola.filter(
              (d) => d !== duplicado && d.a.id !== obsoletoId && d.b.id !== obsoletoId,
            )

            // El modal NO se cierra: se vuelve a la lista con la cola actualizada.
            renderLista()
            return false
          } catch (error) {
            AppModal.hideLoading()
            console.error('[DuplicadosModal] Error fusionando:', error)
            AppToast.error(error.message || 'No se pudieron fusionar los alumnos')
            return false
          }
        },
      })
    }

    await analizar()
  },
}
