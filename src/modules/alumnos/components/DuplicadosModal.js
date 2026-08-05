/**
 * DuplicadosModal — revisión y fusión de alumnos duplicados.
 *
 * Flujo:
 *  1. Detecta posibles duplicados (dominio puro) sobre todos los alumnos.
 *  2. Devuelve una lista de parejas con nivel de certeza.
 *  3. Al elegir una pareja, muestra análisis de fusión campo a campo.
 *  4. El usuario revisa/sustituye conflictos y confirma la fusión.
 *  5. Ejecuta la fusión transaccional (RPC backend) y refresca.
 */
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import {
  detectarPosiblesDuplicados,
  construirFusion,
  quienEsMasCompleto,
} from '../domain/duplicadosAlumnos.js'
import { fusionarAlumnos, obtenerTodosLosAlumnosParaAnalisis } from '../api/alumnosApi.js'

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

export const DuplicadosModal = {
  /** @param {{ alumnos: object[], onSuccess?: () => void }} opts */
  async abrir({ alumnos, onSuccess } = {}) {
    let listaAlumnos = alumnos || []

    // ── Paso 1: producir la lista de posibles duplicados ─────────────────
    const abrirDetector = () => {
      AppModal.open({
        title: 'Detectar alumnos duplicados',
        size: 'md',
        saveText: 'Analizar',
        body: `
          <div class="text-center py-4">
            <i class="bi bi-search-heart display-4 text-warning"></i>
            <p class="mt-3 mb-1 fw-semibold">Análisis de duplicados en la base de datos</p>
            <p class="text-muted mb-0">Se compararán todos los registros buscando alumnos que parecen ser la misma persona (nombre, fecha de nacimiento, padres, instrumento).</p>
          </div>
        `,
        onSave: async () => {
          try {
            AppModal.showLoading('Analizando <strong>alumnos</strong>...')
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

    // ── Paso 2: listado de parejas encontradas ───────────────────────────
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
              <p class="text-muted mb-0">No hay registros que parezcan corresponder a la misma persona.</p>
            </div>
          `,
        })
        return
      }

      const items = duplicados.map((d, idx) => {
        const badge = NIVEL_BADGE[d.nivel] || NIVEL_BADGE.media
        const compartidos = d.coincidencias?.compartidos || 0
        const pct = Math.round(d.puntaje * 100)
        return `
          <div class="d-flex align-items-start gap-2 border rounded-3 p-2 mb-2 bg-body" data-duplicado-idx="${idx}" style="cursor:pointer;" role="button">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:38px;height:38px;font-weight:600;">
              ${escapeHTML((d.a.nombre_completo || d.a.nombre || '?').slice(0, 1).toUpperCase())}
            </div>
            <div class="flex-grow-1 min-w-0">
              <div class="fw-semibold text-truncate">${escapeHTML(d.a.nombre_completo || d.a.nombre || 'Sin nombre')}</div>
              <div class="text-muted small text-truncate"><i class="bi bi-arrow-repeat me-1"></i>${escapeHTML(d.b.nombre_completo || d.b.nombre || 'Sin nombre')}</div>
              <div class="mt-1">
                <span class="badge rounded-pill ${badge.clase}" style="font-size:0.68rem;"><i class="bi ${badge.icono} me-1"></i>${escapeHTML(d.nivelEtiqueta || d.nivel)}</span>
                <span class="badge rounded-pill border border-secondary-subtle text-body-secondary" style="font-size:0.68rem;">${compartidos} dato(s) en común · ${pct}%</span>
              </div>
            </div>
            <i class="bi bi-chevron-right text-muted align-self-center"></i>
          </div>
        `
      }).join('')

      AppModal.open({
        title: `Alumnos duplicados (${duplicados.length})`,
        size: 'lg',
        hideSave: true,
        cancelText: 'Cerrar',
        body: `
          <p class="text-muted small mb-3">
            Se encontraron <strong>${duplicados.length}</strong> pareja(s) de alumnos que podrían ser la misma persona.
            Haz clic en una pareja para revisar y fusionar, o edita los datos si prefieres mantenerlos separados.
          </p>
          <div>${items}</div>
        `,
        onShow: (body) => {
          body.querySelectorAll('[data-duplicado-idx]').forEach(card => {
            card.addEventListener('click', () => {
              const idx = Number(card.dataset.duplicadoIdx)
              const d = duplicados[idx]
              abrirDetalle(d)
            })
          })
        },
      })
    }

    // ── Paso 3: detalle de fusión de una pareja ─────────────────────────
    const abrirDetalle = (duplicado) => {
      // El registro más completo se conserva por defecto; el otro se fusiona.
      const principal = quienEsMasCompleto(duplicado.a, duplicado.b)
      const obsoleto = principal.id === duplicado.a.id ? duplicado.b : duplicado.a

      const fusion = construirFusion(principal, obsoleto)

      const renderFila = (campo) => {
        const badge = formatearTipo(campo.tipo)
        const principalValor = formatearValor(campo.valorPrincipal)
        const obsoletoValor = formatearValor(campo.valorObsoleto)
        const resultante = formatearValor(campo.valorFusionado)

        // Columna del resultado editable SOLO en conflictos.
        const celdaResultante = campo.puedeElegir
          ? `<select class="form-select form-select-sm" data-fusion-key="${campo.key}" data-fusion-label="${escapeHTML(campo.label)}">
              <option value="__principal__" ${campo.valorFusionado === campo.valorPrincipal ? 'selected' : ''}>${escapeHTML(campo.valorPrincipal)}</option>
              <option value="__obsoleto__" ${campo.valorFusionado === campo.valorObsoleto ? 'selected' : ''}>${escapeHTML(campo.valorObsoleto)}</option>
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

      // Agrupar por grupo para mejor legibilidad.
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
        ? `<div class="mb-1"><i class="bi bi-check-circle-fill text-success me-1"></i>Completa: <strong class="fw-semibold">${escapeHTML(fusion.completadosLabels.join(', '))}</strong></div>`
        : ''

      const resumenConflictos = fusion.conflictosLabels.length
        ? `<div class="mb-1"><i class="bi bi-exclamation-triangle-fill text-danger me-1"></i>Conflictos a revisar: <strong class="fw-semibold">${escapeHTML(fusion.conflictosLabels.join(', '))}</strong> (usa el selector para elegir)</div>`
        : `<div class="mb-1"><i class="bi bi-check-circle text-success me-1"></i>Sin conflictos: los datos se completan automáticamente.</div>`

      AppModal.open({
        title: 'Revisar y fusionar alumnos',
        size: 'xl',
        saveText: 'Confirmar y fusionar',
        body: `
          <div class="alert alert-info py-2 small mb-3 d-flex gap-2 align-items-center">
            <i class="bi bi-info-circle flex-shrink-0"></i>
            <div>
              Se conservará <strong>${escapeHTML(principal.nombre_completo || principal.nombre || 'Principal')}</strong> y se eliminará <strong>${escapeHTML(obsoleto.nombre_completo || obsoleto.nombre || 'Obsoleto')}</strong> tras migrar sus datos.
            </div>
          </div>

          ${resumenConflictos}
          ${resumenCompletados}

          <div class="table-responsive border rounded-3" style="max-height:52vh; overflow:auto;">
            <table class="table table-sm align-middle mb-0">
              <thead class="table-light sticky-top" style="z-index:5;">
                <tr>
                  <th style="width:26%;">Campo</th>
                  <th style="width:24%;">${escapeHTML(principal.nombre_completo || 'Principal')}</th>
                  <th style="width:24%;">${escapeHTML(obsoleto.nombre_completo || 'Obsoleto')}</th>
                  <th style="width:26%;">Resultado final</th>
                </tr>
              </thead>
              <tbody>${filasPorGrupo}</tbody>
            </table>
          </div>

          <div class="text-muted small mt-3">
            <i class="bi bi-lightning-charge me-1"></i>Al confirmar: se actualiza el registro principal, se migran sus clases, asistencias, progresos y evaluaciones, y se elimina el registro obsoleto. Operación irreversible.
          </div>
        `,
        onShow: (body) => {
          body.querySelectorAll('[data-fusion-key]').forEach(select => {
            select.addEventListener('change', () => {
              const key = select.dataset.fusionKey
              const valor = select.value === '__obsoleto__'
                ? obsoleto[key]
                : principal[key]
              const campo = fusion.campos.find(c => c.key === key)
              if (campo) {
                campo.valorFusionado = valor ?? null
                fusion.resultante[key] = valor ?? null
              }
              // Actualizar celda resultante.
              const row = body.querySelector(`[data-fusion-row="${key}"]`)
              if (row) {
                const celda = row.querySelector('td:last-child span')
                if (celda) celda.innerHTML = formatearValor(valor)
              }
            })
          })
        },
        onSave: async () => {
          try {
            const datosFusion = { ...fusion.resultante }
            delete datosFusion.id
            await fusionarAlumnos({
              principalId: principal.id,
              obsoletoId: obsoleto.id,
              datosFusion,
            })
            AppToast.success(
              `Alumnos fusionados: se conservó "${principal.nombre_completo || principal.nombre}" y se eliminó el registro obsoleto.`
            )
            if (typeof onSuccess === 'function') onSuccess()
          } catch (error) {
            console.error('[DuplicadosModal] Error fusionando:', error)
            AppToast.error(error.message || 'No se pudieron fusionar los alumnos')
          }
        },
      })
    }

    abrirDetector()
  },
}