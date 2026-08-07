/**
 * historialIndicadorModal.js — Historial de evaluaciones de un indicador (solo lectura)
 *
 * Cierra el flujo ACM descrito por el usuario: "al presionar sobre la clase,
 * puede ver los detalles de cuándo se dio la clase y puede ver la
 * calificación de sus alumnos". No es un panel de calificación — es la
 * versión de solo lectura de `calificacionIndicadorPanel.js`, mismo patrón
 * visual, sin acciones de escritura.
 *
 * Usa `evaluacionClaseService.obtenerHistorialPorIndicadorClase`, que lee de
 * `evaluacion_indicador_historial` (migración 20260807000002) — un log
 * append-only poblado por trigger. La tabla `evaluacion_indicador` en sí es
 * "estado actual" (UNIQUE alumno_id+clase_indicador_id, se sobrescribe en
 * cada recalificación); leer de ahí directamente solo mostraba la última
 * nota por alumno, no las evaluaciones anteriores — de ahí el historial
 * separado. Se combina con `realAlumnosService` para el nombre de cada
 * alumno.
 */
import { obtenerHistorialPorIndicadorClase } from '../services/evaluacionClaseService.js'
import { obtenerAlumnosRealesPorClase } from '../services/realAlumnosService.js'

/**
 * @param {object} options
 * @param {string} options.claseId
 * @param {string} options.claseIndicadorId - id de clase_mapa_indicadores
 * @param {string} [options.indicadorDescripcion]
 */
export function renderHistorialIndicadorModal({ claseId, claseIndicadorId, indicadorDescripcion = '' }) {
  document.querySelectorAll('.historial-indicador-overlay').forEach((el) => el.remove())

  const overlay = document.createElement('div')
  overlay.className = 'historial-indicador-overlay'
  overlay.innerHTML = _buildHTML({ indicadorDescripcion, cargando: true })
  document.body.appendChild(overlay)

  if (!document.getElementById('historial-indicador-styles')) {
    const style = document.createElement('style')
    style.id = 'historial-indicador-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  const close = () => overlay.remove()
  overlay.querySelector('.historial-indicador-close-x')?.addEventListener('click', close)
  overlay.querySelector('.historial-indicador-backdrop')?.addEventListener('click', close)

  _cargar({ claseId, claseIndicadorId, indicadorDescripcion, overlay, close })
}

async function _cargar({ claseId, claseIndicadorId, indicadorDescripcion, overlay, close }) {
  let filas = []
  try {
    const [eventos, alumnos] = await Promise.all([
      obtenerHistorialPorIndicadorClase(claseIndicadorId, claseId),
      obtenerAlumnosRealesPorClase(claseId),
    ])
    const nombrePorAlumno = new Map(alumnos.map((a) => [String(a.id), a.nombre]))
    // Un mismo alumno puede aparecer varias veces acá — cada fila es una
    // evaluación distinta (recalificación), no el estado actual por alumno.
    filas = eventos
      .filter((ev) => ev.nota != null)
      .map((ev) => ({
        alumno: nombrePorAlumno.get(String(ev.alumno_id)) || 'Alumno',
        nota: ev.nota,
        fecha: ev.registrado_en,
      }))
  } catch (err) {
    console.error('[historialIndicadorModal] Error cargando historial:', err)
  }

  overlay.innerHTML = _buildHTML({ indicadorDescripcion, cargando: false, filas })
  overlay.querySelector('.historial-indicador-close-x')?.addEventListener('click', close)
  overlay.querySelector('.historial-indicador-backdrop')?.addEventListener('click', close)
  overlay.querySelector('.historial-indicador-cerrar-btn')?.addEventListener('click', close)
}

function _buildHTML({ indicadorDescripcion, cargando, filas = [] }) {
  const rows = filas
    .map(
      (f) => `
      <div class="historial-indicador-row">
        <span class="historial-indicador-alumno">${esc(f.alumno)}</span>
        <span class="historial-indicador-nota">${'★'.repeat(f.nota)}${'☆'.repeat(5 - f.nota)}</span>
        <span class="historial-indicador-fecha">${_formatearFecha(f.fecha)}</span>
      </div>
    `,
    )
    .join('')

  return `
    <div class="historial-indicador-backdrop"></div>
    <div class="historial-indicador-dialog">
      <div class="historial-indicador-header">
        <div>
          <h5 class="historial-indicador-title">Historial de evaluaciones</h5>
          <p class="historial-indicador-subtitle">${esc(indicadorDescripcion)}</p>
        </div>
        <button class="historial-indicador-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="historial-indicador-body">
        ${
          cargando
            ? '<div class="text-muted text-center py-3">Cargando...</div>'
            : filas.length === 0
              ? '<div class="text-muted text-center py-3">Todavía no hay evaluaciones registradas para este indicador.</div>'
              : rows
        }
      </div>
      <div class="historial-indicador-footer">
        <button class="btn btn-outline-secondary historial-indicador-cerrar-btn">Cerrar</button>
      </div>
    </div>
  `
}

function _formatearFecha(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function _getStyles() {
  return `
    .historial-indicador-overlay {
      position: fixed; inset: 0; z-index: 10003;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .historial-indicador-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .historial-indicador-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 480px;
      max-height: 80vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .historial-indicador-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .historial-indicador-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .historial-indicador-subtitle { font-size: 0.78rem; color: var(--bs-secondary-color, #6c757d); margin: 0.15rem 0 0; }
    .historial-indicador-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .historial-indicador-body { flex: 1; overflow-y: auto; padding: 0.5rem 1.25rem; }
    .historial-indicador-row {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color, #eee);
      font-size: 0.85rem;
    }
    .historial-indicador-alumno { font-weight: 600; flex: 1; }
    .historial-indicador-nota { color: #f59e0b; letter-spacing: 1px; }
    .historial-indicador-fecha { color: var(--bs-secondary-color, #6c757d); font-size: 0.75rem; white-space: nowrap; }
    .historial-indicador-footer {
      display: flex; justify-content: flex-end;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `
}
