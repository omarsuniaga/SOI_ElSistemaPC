/**
 * indiceEnsenanzaGuiadaWidget.js — Spec D-01/D-02 (openspec/changes/juego-gamificado-planificacion)
 *
 * Muestra la adopción de la enseñanza guiada por indicador (maestro_routes)
 * frente a la bitácora de texto libre — enmarcado como RECONOCIMIENTO, nunca
 * como ranking o comparación negativa (D-02, MUST NOT).
 *
 * Deliberadamente NO es una tabla ordenada de todos los maestros de mejor a
 * peor (ese es exactamente el patrón "punitivo" que ya existe en
 * CumplimientoMaestrosWidget.js, con categorías "incumplidor"/"negligente" —
 * ese widget es para OTRA métrica, cumplimiento de bitácora, y no debe
 * copiarse acá): solo se nombra a quienes están en o por encima del promedio
 * institucional ("destacados"), nunca a quienes están por debajo.
 *
 * `buildIndiceEnsenanzaGuiadaData`/`renderIndiceEnsenanzaGuiadaHTML` están
 * separadas del factory `indiceEnsenanzaGuiadaWidget(containerId)` para
 * poder probarlas sin mockear el DOM/Supabase completo.
 *
 * NOTA: el copy exacto ("Maestros destacados por enseñanza guiada", etc.) es
 * un borrador razonable — spec.md pide validarlo con DIR antes de dar la
 * tarea por cerrada del todo (no se asume el texto final).
 */
import { getIndiceEnsenanzaGuiada } from '../api/indiceEnsenanzaGuiadaApi.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'

/**
 * @param {Array<{maestroId, nombre, totalSesiones, sesionesConIndicador, indice}>} registros
 * @returns {{promedioInstitucional: number, totalMaestros: number, destacados: Array}}
 */
export function buildIndiceEnsenanzaGuiadaData(registros = []) {
  const conSesiones = registros.filter((r) => r.totalSesiones > 0)

  if (conSesiones.length === 0) {
    return { promedioInstitucional: 0, totalMaestros: 0, destacados: [] }
  }

  const promedioInstitucional = conSesiones.reduce((sum, r) => sum + r.indice, 0) / conSesiones.length

  const destacados = conSesiones
    .filter((r) => r.indice > 0 && r.indice >= promedioInstitucional)
    .sort((a, b) => b.indice - a.indice)
    .slice(0, 5)

  return { promedioInstitucional, totalMaestros: conSesiones.length, destacados }
}

export function renderIndiceEnsenanzaGuiadaHTML({ promedioInstitucional, totalMaestros, destacados }) {
  if (totalMaestros === 0) {
    return `
      <div class="ieg-widget">
        <div class="premium-no-data">
          <i class="bi bi-stars fs-4 d-block mb-2 text-secondary"></i>
          Todavía no hay sesiones registradas para calcular el índice de enseñanza guiada.
        </div>
      </div>
    `
  }

  const promedioPct = Math.round(promedioInstitucional * 100)

  return `
    <div class="ieg-widget">
      <div class="ieg-resumen">
        <div class="ieg-resumen-valor">${promedioPct}%</div>
        <div class="ieg-resumen-label">
          Promedio institucional de sesiones con evaluación guiada por indicador
          <span class="ieg-resumen-sub">(${totalMaestros} maestro${totalMaestros === 1 ? '' : 's'} con sesiones registradas)</span>
        </div>
      </div>

      <h4 class="ieg-destacados-title"><i class="bi bi-stars"></i> Maestros destacados por enseñanza guiada</h4>
      <p class="ieg-destacados-subtitle">Reconocimiento a quienes ya integran la evaluación guiada por indicador en su rutina de clase — no es un ranking, y no se muestra a otros maestros.</p>

      ${
        destacados.length > 0
          ? `
        <div class="ieg-destacados-list">
          ${destacados
            .map(
              (d) => `
            <div class="ieg-destacado-card">
              <i class="bi bi-mortarboard-fill"></i>
              <span class="ieg-destacado-nombre">${escapeHTML(d.nombre)}</span>
              <span class="ieg-destacado-badge">${Math.round(d.indice * 100)}%</span>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : `<p class="premium-no-data">Todavía ningún maestro supera el promedio institucional — cuando alguno lo haga, aparecerá acá.</p>`
      }
    </div>
  `
}

export function indiceEnsenanzaGuiadaWidget(containerId) {
  const container = document.getElementById(containerId)

  return {
    async init() {
      if (!container) return
      container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando índice de enseñanza guiada...</div>
        </div>
      `

      try {
        const registros = await getIndiceEnsenanzaGuiada()
        const data = buildIndiceEnsenanzaGuiadaData(registros)
        container.innerHTML = renderIndiceEnsenanzaGuiadaHTML(data)
      } catch (err) {
        console.error('[indiceEnsenanzaGuiadaWidget] Error:', err)
        container.innerHTML = `
          <div class="premium-error-card">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>No se pudo cargar el índice de enseñanza guiada.</div>
          </div>
        `
      }
    },

    destroy() {
      if (container) container.innerHTML = ''
    },
  }
}

// ─── Estilos ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('ieg-styles')) {
  const s = document.createElement('style')
  s.id = 'ieg-styles'
  s.textContent = `
    .ieg-widget { display: flex; flex-direction: column; gap: 1rem; }
    .ieg-resumen {
      display: flex; align-items: baseline; gap: 0.75rem; padding: 1rem 1.25rem;
      background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.18); border-radius: 12px;
    }
    .ieg-resumen-valor { font-size: 2rem; font-weight: 800; color: #3b82f6; line-height: 1; }
    .ieg-resumen-label { font-size: 0.82rem; color: var(--bs-secondary-color); }
    .ieg-resumen-sub { display: block; font-size: 0.72rem; opacity: 0.8; margin-top: 0.15rem; }
    .ieg-destacados-title { font-size: 0.95rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.4rem; color: #d97706; }
    .ieg-destacados-subtitle { font-size: 0.78rem; color: var(--bs-secondary-color); margin: -0.5rem 0 0.25rem; }
    .ieg-destacados-list { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .ieg-destacado-card {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.9rem;
      background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px;
    }
    .ieg-destacado-card i { color: #f59e0b; }
    .ieg-destacado-nombre { font-size: 0.85rem; font-weight: 600; }
    .ieg-destacado-badge {
      font-size: 0.72rem; font-weight: 700; color: #d97706; background: rgba(245,158,11,0.15);
      padding: 0.15rem 0.5rem; border-radius: 999px;
    }
  `
  document.head.appendChild(s)
}
