import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escHTML } from '../../utils/portalUtils.js'
import {
  RATING_MAX,
  isRatableState,
  ratingLabel,
  normalizeRating,
} from '../../../modules/asistencias/services/presentRatingsService.js'

const STYLE_ID = 'pm-present-ratings-styles'

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .pm-pr-row { padding: .7rem 0; border-bottom: 1px solid var(--pm-border, rgba(128,128,128,.25)); }
    .pm-pr-row[data-disabled="true"] { opacity: .6; }
    .pm-pr-name { font-weight: 600; }
    .pm-pr-status { font-size: .8rem; color: var(--pm-text-muted, #6b7280); min-height: 1.1em; }
    .pm-pr-scale { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .45rem; }
    .pm-pr-btn { min-width: 44px; min-height: 44px; padding: 0 .6rem; border-radius: 10px; cursor: pointer;
      border: 1px solid var(--pm-border, rgba(128,128,128,.4)); background: transparent; color: inherit; font-weight: 600; }
    .pm-pr-btn[aria-checked="true"] { background: var(--pm-primary, #2563eb); border-color: var(--pm-primary, #2563eb); color: #fff; }
    .pm-pr-btn--clear[aria-checked="true"] { background: #475569; border-color: #475569; }
    .pm-pr-btn:disabled { cursor: not-allowed; }
    .pm-pr-excluded { font-size: .85rem; color: var(--pm-text-muted, #6b7280); margin: .75rem 0 0; }
  `
  document.head.appendChild(style)
}

/**
 * Panel «Evaluar presentes»: valoración de 0 a 5 estrellas por alumno presente.
 * Selección directa (sin ciclos de toque); «Sin evaluar» (null) es distinto de 0.
 * Ausentes, justificados y alumnos sin marcar no se listan para evaluar.
 *
 * @param {Object} opts
 * @param {() => Array<{id:string, nombre_completo?:string, nombre?:string}>} opts.getAlumnos
 * @param {() => Record<string,string|null>} opts.getEstado mapa vivo de asistencia
 * @param {() => string|null} opts.getSesionId
 * @param {(sesionId:string) => Promise<Array<{alumno_id:string, estado:string, valoracion:number|null}>>} opts.loadRatings
 * @param {(sesionId:string, items:Array<{alumno_id:string, valoracion:number|null}>) => Promise<{saved:string[], rejected:Array<{alumno_id:string, reason:string}>}>} opts.saveRatings
 * @param {() => void} [opts.onSaved]
 */
export function createPresentRatingsPanel(opts) {
  injectStyles()
  let opening = false

  const nameOf = (a) => a.nombre_completo || a.nombre || 'Alumno'

  async function open() {
    if (opening) return
    const sesionId = opts.getSesionId()
    if (!sesionId) {
      AppToast.warning('Primero guarda la sesión (asistencia) para poder evaluar a los presentes.')
      return
    }
    const alumnos = opts.getAlumnos() || []
    const estado = opts.getEstado() || {}
    const present = alumnos.filter((a) => isRatableState(estado[a.id]))
    if (present.length === 0) {
      AppToast.warning('No hay alumnos presentes para evaluar.')
      return
    }
    const excluded = alumnos.length - present.length

    opening = true
    let rows
    try {
      rows = await opts.loadRatings(sesionId)
    } catch (err) {
      console.error('[PresentRatings] No se pudieron cargar las valoraciones:', err)
      AppToast.error('No se pudieron cargar las valoraciones guardadas. Intenta de nuevo.')
      opening = false
      return
    }

    const saved = new Map() // alumnoId -> valoración guardada (null = sin evaluar)
    const savable = new Set() // alumnos con asistencia ya guardada y evaluable
    for (const r of rows || []) {
      if (isRatableState(r.estado)) {
        savable.add(r.alumno_id)
        saved.set(r.alumno_id, r.valoracion ?? null)
      }
    }
    const current = new Map(present.map((a) => [a.id, saved.get(a.id) ?? null]))

    const scale = (a) => {
      const disabled = !savable.has(a.id)
      const btn = (value, text, aria, extra = '') =>
        `<button type="button" class="pm-pr-btn ${extra}" role="radio" data-rate="${value}" aria-label="${aria}" aria-checked="false"${disabled ? ' disabled' : ''}>${text}</button>`
      return `<div class="pm-pr-scale" role="radiogroup" aria-label="Valoración de ${escHTML(nameOf(a))}">
        ${btn('', 'Sin evaluar', 'Sin evaluar', 'pm-pr-btn--clear')}
        ${btn(0, '0', 'Cero estrellas')}
        ${[1, 2, 3, 4, 5].map((n) => btn(n, `${n}★`, `${n} ${n === 1 ? 'estrella' : 'estrellas'}`)).join('')}
      </div>`
    }

    const body = `
      <p class="small mb-2">Elige de 0 a ${RATING_MAX} estrellas para cada alumno presente. <strong>«Sin evaluar» no es 0</strong>: significa que aún no valoraste a ese alumno.</p>
      <div data-pr-list>
        ${present.map((a) => `
          <div class="pm-pr-row" data-student-id="${escHTML(a.id)}" data-disabled="${savable.has(a.id) ? 'false' : 'true'}">
            <div class="pm-pr-name">${escHTML(nameOf(a))}</div>
            <div class="pm-pr-status" data-pr-status role="status" aria-live="polite"></div>
            ${scale(a)}
          </div>`).join('')}
      </div>
      ${excluded ? `<p class="pm-pr-excluded">${excluded} alumno${excluded === 1 ? '' : 's'} sin evaluar por estar ausente${excluded === 1 ? '' : 's'}, justificado${excluded === 1 ? '' : 's'} o sin asistencia marcada.</p>` : ''}
    `

    const paint = (root) => {
      root.querySelectorAll('.pm-pr-row').forEach((row) => {
        const id = row.dataset.studentId
        const value = current.get(id)
        const locked = row.dataset.disabled === 'true'
        row.querySelectorAll('[data-rate]').forEach((b) => {
          const v = b.dataset.rate === '' ? null : Number(b.dataset.rate)
          b.setAttribute('aria-checked', String(v === value))
        })
        const dirty = !locked && value !== (saved.get(id) ?? null)
        row.querySelector('[data-pr-status]').textContent = locked
          ? 'Guarda la sesión para poder evaluar a este alumno.'
          : `${ratingLabel(value)}${dirty ? ' · sin guardar' : ''}`
      })
    }

    AppModal.open({
      title: 'Evaluar presentes',
      size: 'lg',
      saveText: 'Guardar valoraciones',
      cancelText: 'Cerrar',
      autoFocus: false,
      body,
      onShow: (root) => {
        paint(root)
        root.querySelector('[data-pr-list]').addEventListener('click', (e) => {
          const btn = e.target.closest('[data-rate]')
          if (!btn || btn.disabled) return
          const id = btn.closest('.pm-pr-row').dataset.studentId
          current.set(id, normalizeRating(btn.dataset.rate))
          paint(root)
        })
      },
      onSave: async (root) => {
        const items = present
          .filter((a) => savable.has(a.id) && current.get(a.id) !== (saved.get(a.id) ?? null))
          .map((a) => ({ alumno_id: a.id, valoracion: current.get(a.id) }))
        if (items.length === 0) {
          AppToast.info('No hay cambios que guardar.')
          return false
        }
        try {
          const result = await opts.saveRatings(sesionId, items)
          if (result.rejected?.length) {
            const names = result.rejected
              .map((r) => nameOf(alumnos.find((a) => a.id === r.alumno_id) || {}))
              .join(', ')
            AppToast.warning(`No se guardó la valoración de: ${names}. Revisa su asistencia guardada.`)
          }
          for (const id of result.saved || []) saved.set(id, current.get(id))
          if (root) paint(root)
          if (result.saved?.length) {
            AppToast.success(`Valoraciones guardadas (${result.saved.length}).`)
            opts.onSaved?.()
          }
          return !result.rejected?.length
        } catch (err) {
          console.error('[PresentRatings] Error al guardar:', err)
          AppToast.error('No se pudieron guardar las valoraciones. Tus selecciones siguen en pantalla.')
          return false
        }
      },
    })
    opening = false
  }

  return { open, destroy() {} }
}
