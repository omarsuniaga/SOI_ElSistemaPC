/**
 * InsigniaCelebrationOverlay.js — Celebración al otorgarse un logro nuevo
 * (Spec C-02, openspec/changes/juego-gamificado-planificacion).
 *
 * Carga `@rive-app/canvas-lite` de forma DIFERIDA (import() dinámico) desde
 * este mismo módulo, que a su vez solo se importa dinámicamente desde
 * IndicadorGradingModal.js cuando ya se confirmó un logro nuevo — el runtime
 * de Rive nunca llega al bundle principal del portal (design.md: "la mayoría
 * de las sesiones de calificación NO otorgan un logro nuevo, cargar Rive en
 * cada carga sería pagar el costo de bundle para el caso poco frecuente").
 *
 * Placeholder de animación (Tarea 3.9): todavía no existe un archivo `.riv`
 * de celebración institucional — es un entregable de diseño gráfico, fuera
 * de alcance de este cambio de código. Este módulo SÍ integra el runtime
 * real (instancia `Rive`, intenta cargar `RIVE_SRC`), pero como ese archivo
 * no existe hoy, `onLoadError` dispara el fallback CSS (emoji + badge del
 * logro) — el maestro nunca ve un overlay roto, y el día que exista el
 * `.riv` real solo hay que reemplazar `RIVE_SRC`, sin tocar el wiring.
 */
import { escHTML } from '../utils/portalUtils.js'

const RIVE_SRC = '/assets/rive/celebracion-logro.riv'

function _renderFallback(overlay) {
  overlay.querySelector('.ico-canvas-slot').innerHTML = `
    <div class="ico-fallback-emoji" aria-hidden="true">🎉</div>
  `
}

async function _tryLoadRive(canvas, onDone) {
  try {
    const { Rive, Fit, Layout, Alignment } = await import('@rive-app/canvas-lite')
    new Rive({
      src: RIVE_SRC,
      canvas,
      autoplay: true,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => onDone(true),
      onLoadError: () => onDone(false),
    })
  } catch (err) {
    console.warn('[InsigniaCelebrationOverlay] Error cargando runtime de Rive:', err)
    onDone(false)
  }
}

/**
 * @param {{nombre: string, descripcion?: string, icono?: string}} logro
 * @returns {Promise<void>} resuelve cuando el maestro cierra el overlay
 */
export default function showInsigniaCelebrationOverlay(logro) {
  if (!logro?.nombre) return Promise.resolve()

  const overlay = document.createElement('div')
  overlay.className = 'ico-overlay pm-animate-fade-in'
  overlay.innerHTML = `
    <div class="ico-card pm-animate-scale-up">
      <div class="ico-canvas-slot">
        <canvas class="ico-rive-canvas" width="220" height="220"></canvas>
      </div>
      <h3 class="ico-titulo">¡Nueva insignia!</h3>
      <p class="ico-logro-nombre"><i class="bi bi-${escHTML(logro.icono || 'award-fill')}"></i> ${escHTML(logro.nombre)}</p>
      ${logro.descripcion ? `<p class="ico-logro-desc">${escHTML(logro.descripcion)}</p>` : ''}
      <button class="ico-btn-cerrar" id="ico-cerrar">Genial</button>
    </div>
  `
  document.body.appendChild(overlay)

  const canvas = overlay.querySelector('.ico-rive-canvas')
  _tryLoadRive(canvas, (loaded) => {
    if (!loaded) _renderFallback(overlay)
  })

  return new Promise((resolve) => {
    overlay.querySelector('#ico-cerrar').addEventListener('click', () => {
      overlay.classList.add('pm-animate-fade-out')
      setTimeout(() => {
        overlay.remove()
        resolve()
      }, 250)
    })
  })
}

// ─── Estilos ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('ico-styles')) {
  const s = document.createElement('style')
  s.id = 'ico-styles'
  s.textContent = `
    .ico-overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 10000; padding: 1rem;
    }
    .ico-card {
      background: #fff; border-radius: 24px; padding: 2rem;
      max-width: 340px; width: 100%; text-align: center;
      box-shadow: 0 24px 64px rgba(0,0,0,0.3);
    }
    .ico-canvas-slot { width: 220px; height: 220px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; }
    .ico-rive-canvas { max-width: 100%; }
    .ico-fallback-emoji { font-size: 5rem; line-height: 1; animation: ico-bounce 0.6s ease-in-out; }
    @keyframes ico-bounce { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
    .ico-titulo { font-size: 1.3rem; font-weight: 800; margin: 0 0 0.5rem; color: var(--pm-text, #111827); }
    .ico-logro-nombre { font-size: 1rem; font-weight: 700; color: #d97706; margin: 0 0 0.35rem; }
    .ico-logro-desc { font-size: 0.85rem; color: var(--pm-text-muted, #6b7280); margin: 0 0 1.25rem; }
    .ico-btn-cerrar {
      width: 100%; padding: 0.75rem; border-radius: 14px; border: none;
      background: #f59e0b; color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer;
    }
    .ico-btn-cerrar:active { transform: scale(0.98); opacity: 0.9; }
  `
  document.head.appendChild(s)
}
