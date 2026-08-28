/**
 * DuplicadosModal — revisión, selección y fusión inteligente de alumnos duplicados.
 *
 * Flujo optimizado y diseño gráfico V2 de alta claridad:
 *  1. Análisis inmediato con detección fonética y correlación de identidad.
 *  2. Header con tarjeta de coincidencia visual: quiénes son los 2 alumnos, % similitud y motivos exactos.
 *  3. Selección de registro Principal mediante tarjetas interactivas "Radio Card".
 *  4. Fusión de clases transparente con desglose antes/después.
 *  5. Tabla de resolución de campos codificada por colores (Coincidencia / Completado / Conflicto).
 *  6. Totalmente optimizado para Dark Mode y Light Mode mediante tokens de diseño Bootstrap 5.3 / CSS Vars.
 *  7. Botón informativo contextual "¿Cómo funciona la fusión?".
 *  8. Flujo continuo sin cierres abruptos.
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
  alta: { clase: 'bg-success-subtle text-success border border-success-subtle', icono: 'bi-shield-check' },
  media: { clase: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle', icono: 'bi-exclamation-triangle-fill' },
}

function formatearValor(v) {
  if (v === null || v === undefined || v === '') return '<span class="text-body-secondary fst-italic opacity-50">— vacío —</span>'
  return escapeHTML(String(v))
}

function formatearTipo(tipo) {
  const badges = {
    completa: '<span class="badge rounded-pill border border-primary-subtle bg-primary-subtle text-primary py-1 px-2" style="font-size:0.7rem;"><i class="bi bi-plus-circle me-1"></i>Completa datos</span>',
    coincide: '<span class="badge rounded-pill border border-success-subtle bg-success-subtle text-success py-1 px-2" style="font-size:0.7rem;"><i class="bi bi-check2-circle me-1"></i>Idéntico</span>',
    conflicto: '<span class="badge rounded-pill border border-danger-subtle bg-danger-subtle text-danger py-1 px-2" style="font-size:0.7rem;"><i class="bi bi-exclamation-octagon-fill me-1"></i>Conflicto (elegir)</span>',
    vacia: '<span class="badge rounded-pill border border-secondary-subtle bg-body-secondary text-body-secondary py-1 px-2" style="font-size:0.7rem;">Sin datos</span>',
  }
  return badges[tipo] || badges.vacia
}

function renderBadgesClases(clases, theme = 'primary') {
  if (!clases || !clases.length) return '<span class="text-body-secondary fst-italic small opacity-75">— Sin clases registradas —</span>'
  return clases
    .map((c) => {
      const nombre = escapeHTML(c.nombre || 'Clase')
      const horario = c.clase_horarios?.[0]
        ? ` (${escapeHTML(c.clase_horarios[0].dia || '')} ${escapeHTML(String(c.clase_horarios[0].hora_inicio || '').slice(0, 5))})`
        : ''
      return `<span class="badge bg-${theme}-subtle text-${theme}-emphasis border border-${theme}-subtle py-1.5 px-2.5 rounded-3 shadow-xs fw-medium text-start"><i class="bi bi-music-note-beamed me-1"></i>${nombre}${horario}</span>`
    })
    .join(' ')
}

export const DuplicadosModal = {
  /** @param {{ alumnos?: object[], onSuccess?: () => void }} opts */
  async abrir({ alumnos, onSuccess } = {}) {
    let listaAlumnos = alumnos || []

    // ── Paso 1: análisis automático inmediato ────────────────────────────────
    try {
      AppModal.showLoading('Analizando base de datos en busca de posibles duplicados...')
      if (!listaAlumnos.length) {
        listaAlumnos = await obtenerTodosLosAlumnosParaAnalisis()
      }
      const duplicadosPendientes = detectarPosiblesDuplicados(listaAlumnos)
      AppModal.hideLoading()
      
      ejecutarFlujoLista(duplicadosPendientes)
    } catch (error) {
      AppModal.hideLoading()
      console.error('[DuplicadosModal] Error en análisis inicial:', error)
      AppToast.error(error.message || 'No se pudieron analizar los alumnos duplicados')
    }

    // ── Modal Informativo / Guía de Fusión ───────────────────────────────────
    function mostrarGuiaInformativa() {
      AppModal.open({
        title: '¿Cómo funciona la fusión de duplicados?',
        size: 'md',
        hideSave: true,
        cancelText: 'Entendido',
        body: `
          <div class="p-2">
            <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-primary-subtle text-primary border border-primary-subtle mb-3">
              <i class="bi bi-shield-shaded fs-1 flex-shrink-0"></i>
              <div>
                <h6 class="fw-bold mb-1">Unificación Inteligente y Segura</h6>
                <p class="small mb-0 text-body">El proceso consolida dos registros de un mismo estudiante en uno solo sin perder ningún dato histórico.</p>
              </div>
            </div>

            <div class="d-flex flex-column gap-2.5">
              <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
                <span class="badge bg-primary rounded-circle p-2 flex-shrink-0" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">1</span>
                <div>
                  <strong class="d-block small text-body">Registro Principal vs Secundario</strong>
                  <span class="text-body-secondary small">El alumno que elijas como <strong>Principal</strong> mantendrá su ID en el sistema. El <strong>Secundario</strong> será absorbido y eliminado.</span>
                </div>
              </div>

              <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
                <span class="badge bg-success rounded-circle p-2 flex-shrink-0" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">2</span>
                <div>
                  <strong class="d-block small text-body">Migración Total de Clases</strong>
                  <span class="text-body-secondary small">Todas las clases, asistencias y evaluaciones inscritas en ambos alumnos se unifican bajo el registro principal sin duplicarse.</span>
                </div>
              </div>

              <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
                <span class="badge bg-info text-white rounded-circle p-2 flex-shrink-0" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">3</span>
                <div>
                  <strong class="d-block small text-body">Resolución de Datos Faltantes</strong>
                  <span class="text-body-secondary small">Los datos vacíos del principal (como teléfono, cédula o representante) se completan automáticamente con los del secundario.</span>
                </div>
              </div>

              <div class="d-flex align-items-start gap-2.5 p-2.5 rounded-3 border border-secondary-subtle bg-body">
                <span class="badge bg-warning text-black fw-bold rounded-circle p-2 flex-shrink-0" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">4</span>
                <div>
                  <strong class="d-block small text-body">Operación Atómica en Base de Datos</strong>
                  <span class="text-body-secondary small">La fusión se ejecuta en una sola transacción en Supabase/PostgreSQL. Si algo falla, ningún dato se modifica.</span>
                </div>
              </div>
            </div>
          </div>
        `,
      })
    }

    // ── Paso 2: listado interactivo con retención de estado ──────────────────
    function ejecutarFlujoLista(duplicados) {
      if (!duplicados || !duplicados.length) {
        AppModal.open({
          title: 'Alumnos duplicados',
          size: 'md',
          hideSave: true,
          cancelText: 'Cerrar',
          body: `
            <div class="text-center py-4">
              <div class="p-3 rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3">
                <i class="bi bi-check-circle-fill fs-1"></i>
              </div>
              <h5 class="fw-bold mb-1 text-body">¡Base de datos limpia y unificada!</h5>
              <p class="text-body-secondary mb-0 small">No se encontraron más alumnos duplicados pendientes de revisión.</p>
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
          if (d.coincidencias?.padre_nombre) motivos.push('Padre idéntico')
          if (d.coincidencias?.madre_nombre) motivos.push('Madre idéntica')
          if (d.coincidencias?.telefono) motivos.push('Mismo teléfono')
          if (d.coincidencias?.fecha_nacimiento) motivos.push('Misma fecha nac.')
          if (d.esSubsetNombre) motivos.push('Nombre fonético similar')

          const motivosBadges = motivos
            .map((m) => `<span class="badge bg-body-secondary text-body-secondary border border-secondary-subtle rounded-pill px-2 py-0.5" style="font-size:0.68rem;"><i class="bi bi-check2 text-success me-0.5"></i>${escapeHTML(m)}</span>`)
            .join(' ')

          return `
            <div class="col-12 col-lg-6" id="duplicado-card-${idx}">
              <div class="d-flex align-items-start gap-3 border border-secondary-subtle rounded-4 p-3 bg-body shadow-xs hover-shadow transition-all h-100 position-relative">
                <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:46px;height:46px;font-size:1.1rem;font-weight:700;">
                  ${escapeHTML((d.a.nombre_completo || d.a.nombre || '?').slice(0, 1).toUpperCase())}
                </div>
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
                    <strong class="text-body text-truncate" style="font-size:0.92rem;">${escapeHTML(d.a.nombre_completo || d.a.nombre || 'Sin nombre')}</strong>
                    <span class="badge rounded-pill ${badge.clase} flex-shrink-0 py-1 px-2.5" style="font-size:0.72rem;"><i class="bi ${badge.icono} me-1"></i>${pct}% similitud</span>
                  </div>
                  <div class="text-body-secondary small text-truncate mb-1.5"><i class="bi bi-arrow-left-right me-1 text-secondary"></i>${escapeHTML(d.b.nombre_completo || d.b.nombre || 'Sin nombre')}</div>
                  <div class="d-flex flex-wrap gap-1">${motivosBadges}</div>
                </div>
                <div class="d-flex flex-column gap-1.5 flex-shrink-0 align-self-center">
                  <button type="button" class="btn btn-sm btn-primary rounded-3 shadow-xs px-3 py-1.5 fw-semibold" data-action="revisar" data-duplicado-idx="${idx}" style="font-size:0.8rem;">
                    <span>Revisar</span>
                    <i class="bi bi-chevron-right ms-1"></i>
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-secondary rounded-3 px-2 py-1" data-action="rapida" data-duplicado-idx="${idx}" title="Fusión automática inteligente conservando al más completo" style="font-size:0.72rem;">
                    <i class="bi bi-lightning-charge-fill text-warning me-0.5"></i>Rápida
                  </button>
                </div>
              </div>
            </div>
          `
        })
        .join('')

      AppModal.open({
        title: `Alumnos duplicados detectados (${duplicados.length})`,
        size: 'view',
        hideSave: true,
        cancelText: 'Cerrar',
        body: `
          <div class="p-2">
            <div class="d-flex align-items-center justify-content-between p-3 rounded-4 bg-body-tertiary border border-secondary-subtle mb-3 shadow-xs flex-wrap gap-2">
              <div>
                <h6 class="fw-bold mb-0.5 text-body d-flex align-items-center gap-2">
                  <i class="bi bi-people text-primary"></i>
                  <span>Posibles coincidencias en la base de datos</span>
                </h6>
                <small class="text-body-secondary">Se encontraron <strong>${duplicados.length}</strong> parejas que corresponden a la misma persona.</small>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 py-1.5 shadow-xs fw-semibold" id="btnInfoGuiaLista">
                  <i class="bi bi-info-circle-fill me-1"></i>¿Cómo funciona?
                </button>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5">
                  ${duplicados.length} pendientes
                </span>
              </div>
            </div>
            <div class="row g-2.5 overflow-auto pe-1" style="max-height: calc(92vh - 220px);">${items}</div>
          </div>
        `,
        onShow: (body) => {
          body.querySelector('#btnInfoGuiaLista')?.addEventListener('click', () => mostrarGuiaInformativa())

          body.querySelectorAll('[data-action="revisar"]').forEach((btn) => {
            btn.addEventListener('click', () => {
              const idx = Number(btn.dataset.duplicadoIdx)
              abrirDetalle(duplicados[idx], duplicados, idx)
            })
          })

          body.querySelectorAll('[data-action="rapida"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
              const idx = Number(btn.dataset.duplicadoIdx)
              await ejecutarFusionRapida(duplicados[idx], duplicados)
            })
          })
        },
      })
    }

    // ── Fusión Rápida Inteligente ────────────────────────────────────
    async function ejecutarFusionRapida(duplicado, listaActual) {
      try {
        AppModal.showLoading('Ejecutando fusión rápida en base de datos...')
        const principal = quienEsMasCompleto(duplicado.a, duplicado.b)
        const obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a
        const fusion = construirFusion(principal, obsoleto)

        const datosFusion = { ...fusion.resultante }
        delete datosFusion.id

        await fusionarAlumnos({
          principalId: principal.id,
          obsoletoId: obsoleto.id,
          datosFusion,
        })

        AppModal.hideLoading()
        AppToast.success(`Fusión completada: se conservó a "${principal.nombre_completo || principal.nombre}"`)

        if (typeof onSuccess === 'function') onSuccess()

        const filtrados = listaActual.filter(
          (d) => d.a.id !== principal.id && d.a.id !== obsoleto.id && d.b.id !== principal.id && d.b.id !== obsoleto.id
        )
        ejecutarFlujoLista(filtrados)
      } catch (error) {
        AppModal.hideLoading()
        console.error('[DuplicadosModal] Error en fusión rápida:', error)
        AppToast.error(error.message || 'No se pudo realizar la fusión rápida')
      }
    }

    // ── Paso 3: detalle de fusión con clases y selector de principal ──────────
    async function abrirDetalle(duplicado, listaCompletaDuplicados, currentIndex = 0) {
      AppModal.showLoading('Cargando clases e historial de ambos alumnos...')

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

      const sugerido = quienEsMasCompleto(duplicado.a, duplicado.b)
      let principal = sugerido
      let obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a

      const renderModalContent = () => {
        const clasesPrincipal = principal.id === duplicado.a.id ? clasesA : clasesB
        const clasesObsoleto = principal.id === duplicado.a.id ? clasesB : clasesA

        const mapClasesUnificadas = new Map()
        ;[...clasesPrincipal, ...clasesObsoleto].forEach((c) => {
          if (c?.id) mapClasesUnificadas.set(c.id, c)
          else if (c?.nombre) mapClasesUnificadas.set(c.nombre, c)
        })
        const clasesUnificadas = Array.from(mapClasesUnificadas.values())

        const fusion = construirFusion(principal, obsoleto)

        // Motivos de coincidencia destacados
        const motivos = []
        if (duplicado.coincidencias?.padre_nombre) motivos.push(`Padre idéntico (${escapeHTML(duplicado.a.padre_nombre || '')})`)
        if (duplicado.coincidencias?.madre_nombre) motivos.push(`Madre idéntica (${escapeHTML(duplicado.a.madre_nombre || '')})`)
        if (duplicado.coincidencias?.telefono) motivos.push(`Mismo teléfono (${escapeHTML(duplicado.a.telefono || '')})`)
        if (duplicado.coincidencias?.fecha_nacimiento) motivos.push(`Misma fecha nac. (${formatDate(duplicado.a.fecha_nacimiento)})`)
        if (duplicado.esSubsetNombre) motivos.push(`Nombre fonéticamente coincidente`)

        const motivosHTML = motivos
          .map((m) => `<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1" style="font-size:0.75rem;"><i class="bi bi-check-circle-fill me-1"></i>${m}</span>`)
          .join(' ')

        const renderFila = (campo) => {
          const badge = formatearTipo(campo.tipo)
          const principalValor = formatearValor(campo.valorPrincipal)
          const obsoletoValor = formatearValor(campo.valorObsoleto)
          const resultante = formatearValor(campo.valorFusionado)

          let filaClase = ''
          if (campo.tipo === 'conflicto') filaClase = 'bg-danger bg-opacity-10'
          else if (campo.tipo === 'completa') filaClase = 'bg-primary bg-opacity-10'

          const celdaResultante = campo.puedeElegir
            ? `<select class="form-select form-select-sm rounded-3 shadow-xs border-primary fw-semibold py-1 bg-body text-body" data-fusion-key="${campo.key}" data-fusion-label="${escapeHTML(campo.label)}" style="font-size:0.8rem;">
                <option value="__principal__" ${campo.valorFusionado === campo.valorPrincipal ? 'selected' : ''}>${escapeHTML(campo.valorPrincipal)} (de Principal)</option>
                <option value="__obsoleto__" ${campo.valorFusionado === campo.valorObsoleto ? 'selected' : ''}>${escapeHTML(campo.valorObsoleto)} (de Secundario)</option>
              </select>`
            : `<span style="font-weight:600;" class="text-body">${resultante}</span>`

          return `
            <tr data-fusion-row="${campo.key}" data-fusion-tipo="${campo.tipo}" class="${filaClase}">
              <td class="py-2.5 align-middle">
                <div class="fw-semibold text-body" style="font-size:0.85rem;">${escapeHTML(campo.label)}</div>
                <div class="mt-0.5">${badge}</div>
              </td>
              <td class="py-2.5 align-middle small text-body">${principalValor}</td>
              <td class="py-2.5 align-middle small text-body-secondary">${obsoletoValor}</td>
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
            <tr class="bg-body-secondary bg-opacity-50">
              <td colspan="4" class="py-1.5 fw-bold text-uppercase text-body-secondary" style="font-size:0.75rem; letter-spacing:0.04em;"><i class="bi bi-folder2-open me-1"></i>${escapeHTML(grupo)}</td>
            </tr>
            ${campos.map(renderFila).join('')}
          `)
          .join('')

        const resumenCompletados = fusion.completadosLabels.length
          ? `<span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1"><i class="bi bi-plus-circle me-1"></i>${fusion.completadosLabels.length} datos completados</span>`
          : ''

        const resumenConflictos = fusion.conflictosLabels.length
          ? `<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1"><i class="bi bi-exclamation-circle-fill me-1"></i>${fusion.conflictosLabels.length} conflictos a elegir</span>`
          : `<span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1"><i class="bi bi-check2-circle me-1"></i>Sin conflictos</span>`

        return `
          <div class="d-flex flex-column gap-3 pb-2">
            
            <!-- Barra Superior de Navegación e Información -->
            <div class="d-flex justify-content-between align-items-center pb-2 border-bottom border-secondary-subtle flex-wrap gap-2 flex-shrink-0">
              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 shadow-xs fw-semibold" id="btnVolverALista">
                  <i class="bi bi-arrow-left me-1"></i>Volver a la lista
                </button>
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-2.5 py-1">
                  Pareja ${currentIndex + 1} de ${listaCompletaDuplicados.length}
                </span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 py-1 shadow-xs fw-semibold" id="btnInfoGuiaDetalle">
                  <i class="bi bi-info-circle-fill me-1"></i>¿Cómo funciona?
                </button>
              </div>
            </div>

            <!-- BANNER PRINCIPAL DE COINCIDENCIA: ¿Quiénes coinciden y por qué? -->
            <div class="p-3 rounded-4 bg-body-tertiary border border-secondary-subtle shadow-xs">
              <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-secondary-subtle flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-primary text-white rounded-circle p-2" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
                    <i class="bi bi-link-45deg"></i>
                  </span>
                  <div>
                    <strong class="text-body d-block" style="font-size:0.95rem;">Coincidencia detectada entre 2 expedientes</strong>
                    <small class="text-body-secondary">Selecciona abajo cuál de los dos deseas conservar como registro principal.</small>
                  </div>
                </div>
                <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1.5 fw-bold" style="font-size:0.82rem;">
                  <i class="bi bi-shield-check me-1"></i>${Math.round(duplicado.puntaje * 100)}% de Similitud
                </span>
              </div>

              <!-- Motivos exactos de coincidencia -->
              <div class="d-flex align-items-center gap-1.5 flex-wrap pt-1">
                <span class="small fw-semibold text-body-secondary me-1"><i class="bi bi-fingerprint text-primary me-1"></i>Motivos detectados:</span>
                ${motivosHTML}
              </div>
            </div>

            <!-- COMPARATIVA EN DOS TARJETAS SELECCIONABLES (RADIO CARDS) -->
            <div class="row g-3">
              
              <!-- Tarjeta Alumno A -->
              <div class="col-12 col-md-6">
                <div class="p-3 rounded-4 border transition-all h-100 ${principal.id === duplicado.a.id ? 'border-2 border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-secondary-subtle bg-body-tertiary bg-opacity-50'} position-relative" style="cursor:pointer;" id="card-select-alumno-a">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2.5">
                      <div class="avatar-compact ${principal.id === duplicado.a.id ? 'bg-primary text-white' : 'bg-body-secondary text-body-secondary border border-secondary-subtle'} d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:42px;height:42px;font-weight:700;">
                        ${escapeHTML((duplicado.a.nombre_completo || duplicado.a.nombre || 'A').slice(0, 1).toUpperCase())}
                      </div>
                      <div>
                        <strong class="text-body d-block" style="font-size:0.95rem;">${escapeHTML(duplicado.a.nombre_completo || duplicado.a.nombre || 'Alumno A')}</strong>
                        <small class="text-body-secondary">ID: ${duplicado.a.id}</small>
                      </div>
                    </div>

                    ${principal.id === duplicado.a.id
                      ? `<span class="badge bg-primary text-white rounded-pill px-2.5 py-1 shadow-xs"><i class="bi bi-check-circle-fill me-1"></i>PRINCIPAL (Conservado)</span>`
                      : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1"><i class="bi bi-arrow-down-circle me-1"></i>Secundario (A absorber)</span>`
                    }
                  </div>

                  <div class="d-flex flex-column gap-1 small text-body-secondary my-2.5" style="font-size:0.78rem;">
                    <div><i class="bi ${getInstrumentoIcon(duplicado.a.instrumento_principal || duplicado.a.instrumento)} text-primary me-1.5"></i>Cátedra: <strong class="text-body">${escapeHTML(duplicado.a.instrumento_principal || duplicado.a.instrumento || 'No especificada')}</strong></div>
                    <div><i class="bi bi-card-heading text-secondary me-1.5"></i>Cédula: <strong class="text-body">${escapeHTML(duplicado.a.cedula || 'No registrada')}</strong></div>
                    <div><i class="bi bi-calendar-event text-secondary me-1.5"></i>Nacimiento: <strong class="text-body">${formatDate(duplicado.a.fecha_nacimiento)}</strong></div>
                    <div><i class="bi bi-whatsapp text-success me-1.5"></i>Teléfono: <strong class="text-body">${escapeHTML(duplicado.a.telefono || 'Sin teléfono')}</strong></div>
                    <div><i class="bi bi-person-heart text-danger me-1.5"></i>Representante: <strong class="text-body">${escapeHTML(duplicado.a.padre_nombre || duplicado.a.madre_nombre || duplicado.a.familiar_nombre || 'No registrado')}</strong></div>
                  </div>

                  <div class="pt-2 border-top border-secondary-subtle">
                    <small class="text-body-secondary fw-semibold d-block mb-1" style="font-size:0.72rem;">Clases inscritas (${clasesA.length}):</small>
                    <div class="d-flex flex-wrap gap-1">${renderBadgesClases(clasesA, 'primary')}</div>
                  </div>

                  <div class="mt-3 text-center">
                    <button type="button" class="btn btn-sm w-100 rounded-3 fw-bold ${principal.id === duplicado.a.id ? 'btn-primary' : 'btn-outline-secondary'}" data-principal-id="${duplicado.a.id}">
                      <i class="bi ${principal.id === duplicado.a.id ? 'bi-check2-circle' : 'bi-circle'} me-1.5"></i>${principal.id === duplicado.a.id ? '✓ Conservando este alumno como Principal' : 'Elegir este como Principal'}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tarjeta Alumno B -->
              <div class="col-12 col-md-6">
                <div class="p-3 rounded-4 border transition-all h-100 ${principal.id === duplicado.b.id ? 'border-2 border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-secondary-subtle bg-body-tertiary bg-opacity-50'} position-relative" style="cursor:pointer;" id="card-select-alumno-b">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2.5">
                      <div class="avatar-compact ${principal.id === duplicado.b.id ? 'bg-primary text-white' : 'bg-body-secondary text-body-secondary border border-secondary-subtle'} d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:42px;height:42px;font-weight:700;">
                        ${escapeHTML((duplicado.b.nombre_completo || duplicado.b.nombre || 'B').slice(0, 1).toUpperCase())}
                      </div>
                      <div>
                        <strong class="text-body d-block" style="font-size:0.95rem;">${escapeHTML(duplicado.b.nombre_completo || duplicado.b.nombre || 'Alumno B')}</strong>
                        <small class="text-body-secondary">ID: ${duplicado.b.id}</small>
                      </div>
                    </div>

                    ${principal.id === duplicado.b.id
                      ? `<span class="badge bg-primary text-white rounded-pill px-2.5 py-1 shadow-xs"><i class="bi bi-check-circle-fill me-1"></i>PRINCIPAL (Conservado)</span>`
                      : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1"><i class="bi bi-arrow-down-circle me-1"></i>Secundario (A absorber)</span>`
                    }
                  </div>

                  <div class="d-flex flex-column gap-1 small text-body-secondary my-2.5" style="font-size:0.78rem;">
                    <div><i class="bi ${getInstrumentoIcon(duplicado.b.instrumento_principal || duplicado.b.instrumento)} text-primary me-1.5"></i>Cátedra: <strong class="text-body">${escapeHTML(duplicado.b.instrumento_principal || duplicado.b.instrumento || 'No especificada')}</strong></div>
                    <div><i class="bi bi-card-heading text-secondary me-1.5"></i>Cédula: <strong class="text-body">${escapeHTML(duplicado.b.cedula || 'No registrada')}</strong></div>
                    <div><i class="bi bi-calendar-event text-secondary me-1.5"></i>Nacimiento: <strong class="text-body">${formatDate(duplicado.b.fecha_nacimiento)}</strong></div>
                    <div><i class="bi bi-whatsapp text-success me-1.5"></i>Teléfono: <strong class="text-body">${escapeHTML(duplicado.b.telefono || 'Sin teléfono')}</strong></div>
                    <div><i class="bi bi-person-heart text-danger me-1.5"></i>Representante: <strong class="text-body">${escapeHTML(duplicado.b.padre_nombre || duplicado.b.madre_nombre || duplicado.b.familiar_nombre || 'No registrado')}</strong></div>
                  </div>

                  <div class="pt-2 border-top border-secondary-subtle">
                    <small class="text-body-secondary fw-semibold d-block mb-1" style="font-size:0.72rem;">Clases inscritas (${clasesB.length}):</small>
                    <div class="d-flex flex-wrap gap-1">${renderBadgesClases(clasesB, 'warning')}</div>
                  </div>

                  <div class="mt-3 text-center">
                    <button type="button" class="btn btn-sm w-100 rounded-3 fw-bold ${principal.id === duplicado.b.id ? 'btn-primary' : 'btn-outline-secondary'}" data-principal-id="${duplicado.b.id}">
                      <i class="bi ${principal.id === duplicado.b.id ? 'bi-check2-circle' : 'bi-circle'} me-1.5"></i>${principal.id === duplicado.b.id ? '✓ Conservando este alumno como Principal' : 'Elegir este como Principal'}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- BANNER DE UNIFICACIÓN DE CLASES -->
            <div class="p-3 rounded-4 bg-success-subtle bg-opacity-30 border border-success-subtle shadow-xs">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1.5">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-diagram-3-fill text-success fs-5"></i>
                  <strong class="text-success-emphasis small">Resultado de Fusión de Clases (${clasesUnificadas.length} en total):</strong>
                </div>
                <small class="text-success fw-medium">Ambos horarios se combinan sin duplicados</small>
              </div>
              <div class="d-flex flex-wrap gap-1">
                ${renderBadgesClases(clasesUnificadas, 'success')}
              </div>
            </div>

            <!-- TABLA DE RESOLUCIÓN CAMPO A CAMPO -->
            <div class="p-3 rounded-4 border border-secondary-subtle bg-body shadow-xs">
              <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary-subtle flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-table text-primary"></i>
                  <strong class="small text-uppercase text-body" style="font-size:0.8rem;">Resolución de Datos Campo a Campo</strong>
                </div>
                <div class="d-flex align-items-center gap-1.5 flex-wrap">
                  ${resumenConflictos}
                  ${resumenCompletados}
                </div>
              </div>

              <div class="table-responsive rounded-3 border border-secondary-subtle" style="max-height: 480px; overflow-y: auto;">
                <table class="table table-hover align-middle mb-0" style="font-size:0.82rem;">
                  <thead class="sticky-top bg-body-tertiary border-bottom border-secondary-subtle">
                    <tr>
                      <th style="width:25%; font-size:0.75rem;">Campo</th>
                      <th style="width:25%; font-size:0.75rem;">En Alumno Principal (${escapeHTML(principal.nombre_completo || principal.nombre)})</th>
                      <th style="width:25%; font-size:0.75rem;">En Alumno Secundario (${escapeHTML(obsoleto.nombre_completo || obsoleto.nombre)})</th>
                      <th style="width:25%; font-size:0.75rem;">Valor Definitivo</th>
                    </tr>
                  </thead>
                  <tbody>${filasPorGrupo}</tbody>
                </table>
              </div>

              <div class="text-body-secondary small mt-2.5 pt-2 border-top border-secondary-subtle d-flex align-items-center justify-content-between flex-wrap gap-1" style="font-size:0.75rem;">
                <span><i class="bi bi-shield-fill-check text-success me-1"></i>La fusión es atómica y transaccional en base de datos.</span>
                <span class="text-body-secondary"><i class="bi bi-info-circle me-1"></i>Puedes cambiar cualquier valor en caso de conflicto antes de confirmar.</span>
              </div>
            </div>

          </div>
        `
      }

      let fusionActual = construirFusion(principal, obsoleto)

      AppModal.open({
        title: 'Revisar y fusionar alumnos',
        size: 'view',
        saveText: 'Confirmar y fusionar',
        cancelText: 'Volver a la lista',
        body: `<div id="modal-detalle-duplicado-container">${renderModalContent()}</div>`,
        onCancel: () => {
          if (listaCompletaDuplicados?.length) {
            ejecutarFlujoLista(listaCompletaDuplicados)
          }
        },
        onShow: (modalBody) => {
          const bindEvents = () => {
            modalBody.querySelector('#btnVolverALista')?.addEventListener('click', () => {
              AppModal.close()
              ejecutarFlujoLista(listaCompletaDuplicados)
            })

            modalBody.querySelector('#btnInfoGuiaDetalle')?.addEventListener('click', () => {
              mostrarGuiaInformativa()
            })

            // Click en Tarjetas o Botones para seleccionar Principal
            const setPrincipal = (targetId) => {
              if (targetId === principal.id) return
              principal = targetId === duplicado.a.id ? duplicado.a : duplicado.b
              obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a
              fusionActual = construirFusion(principal, obsoleto)
              const container = modalBody.querySelector('#modal-detalle-duplicado-container')
              if (container) {
                container.innerHTML = renderModalContent()
                bindEvents()
              }
            }

            modalBody.querySelectorAll('[data-principal-id]').forEach((btn) => {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                setPrincipal(btn.dataset.principalId)
              })
            })

            modalBody.querySelector('#card-select-alumno-a')?.addEventListener('click', () => setPrincipal(duplicado.a.id))
            modalBody.querySelector('#card-select-alumno-b')?.addEventListener('click', () => setPrincipal(duplicado.b.id))

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
            AppModal.showLoading('Fusionando expedientes y unificando clases en Supabase...')
            const datosFusion = { ...fusionActual.resultante }
            delete datosFusion.id

            await fusionarAlumnos({
              principalId: principal.id,
              obsoletoId: obsoleto.id,
              datosFusion,
            })

            AppModal.hideLoading()
            AppToast.success(
              `Fusión exitosa: se conservó a "${principal.nombre_completo || principal.nombre}" y se transfirieron sus clases.`,
            )

            if (typeof onSuccess === 'function') onSuccess()

            const filtrados = listaCompletaDuplicados.filter(
              (d) => d.a.id !== principal.id && d.a.id !== obsoleto.id && d.b.id !== principal.id && d.b.id !== obsoleto.id
            )
            
            ejecutarFlujoLista(filtrados)
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
  },
}
