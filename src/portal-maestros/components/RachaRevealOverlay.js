/**
 * RachaRevealOverlay.js — overlay a pantalla completa para que el maestro le
 * muestre al alumno su racha actual, en el momento de la clase (Spec R-01,
 * openspec/changes/racha-visible-en-clase).
 *
 * A diferencia de InsigniaCelebrationOverlay.js (PR3 de
 * juego-gamificado-planificacion), NO usa Rive: alcanza con `gsap` (ya
 * instalado) para un conteo ascendente del número — no hay costo de bundle
 * adicional ni necesidad de import() diferido.
 *
 * Copy siempre positivo por tiers (Spec R-03): una racha reiniciada en 1 se
 * ve exactamente igual que la primera racha de un alumno nuevo — nunca
 * expone que "antes era más alta", nunca usa lenguaje de pérdida. Solo
 * recibe UN alumno como parámetro — estructuralmente no puede comparar con
 * otros.
 */
import gsap from 'gsap'
import { escHTML } from '../utils/portalUtils.js'

function _mensajeParaRacha(rachaActual) {
  // `achievementsBaseline` (IndicadorGradingModal.js) usa 0 como default
  // cuando el alumno no tiene fila en `rachas` todavía — mismo caso que
  // `null` acá (el trigger de PR2 nunca escribe racha_actual = 0, siempre
  // arranca en 1 en la primera evaluación).
  if (rachaActual == null || rachaActual === 0) return '¡Vamos a comenzar tu racha! 🎵'
  if (rachaActual === 1) return '¡Empezando una nueva racha! 🌱'
  if (rachaActual <= 4) return `¡Racha de ${rachaActual} clases! Sigue así 🔥`
  return `¡Racha increíble de ${rachaActual} clases! 🌟`
}

/**
 * @param {{alumnoNombre: string, rachaActual: number|null}} params
 * @returns {Promise<void>} resuelve cuando el maestro cierra el overlay
 */
export default function showRachaRevealOverlay({ alumnoNombre, rachaActual = null } = {}) {
  if (!alumnoNombre) return Promise.resolve()

  const mensaje = _mensajeParaRacha(rachaActual)
  const mostrarNumero = rachaActual != null && rachaActual > 0

  const overlay = document.createElement('div')
  overlay.className = 'rro-overlay pm-animate-fade-in'
  overlay.innerHTML = `
    <div class="rro-card pm-animate-scale-up">
      <p class="rro-alumno-nombre">${escHTML(alumnoNombre)}</p>
      ${
        mostrarNumero
          ? `<div class="rro-numero" id="rro-numero">0</div>`
          : `<div class="rro-emoji-grande" aria-hidden="true">🎵</div>`
      }
      <p class="rro-mensaje">${escHTML(mensaje)}</p>
      <button class="rro-btn-cerrar" id="rro-cerrar">Cerrar</button>
    </div>
  `
  document.body.appendChild(overlay)

  if (mostrarNumero) {
    const numeroEl = overlay.querySelector('#rro-numero')
    const contador = { valor: 0 }
    gsap.to(contador, {
      valor: rachaActual,
      duration: 0.8,
      ease: 'power1.out',
      onUpdate: () => {
        numeroEl.textContent = String(Math.round(contador.valor))
      },
    })
  }

  return new Promise((resolve) => {
    overlay.querySelector('#rro-cerrar').addEventListener('click', () => {
      overlay.classList.add('pm-animate-fade-out')
      setTimeout(() => {
        overlay.remove()
        resolve()
      }, 250)
    })
  })
}

// ─── Estilos ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('rro-styles')) {
  const s = document.createElement('style')
  s.id = 'rro-styles'
  s.textContent = `
    .rro-overlay {
      position: fixed; inset: 0; background: linear-gradient(135deg, #1e3a8a, #7c3aed);
      display: flex; align-items: center; justify-content: center;
      z-index: 10000; padding: 1.5rem;
    }
    .rro-card { text-align: center; max-width: 480px; width: 100%; }
    .rro-alumno-nombre { font-size: 1.4rem; font-weight: 700; color: rgba(255,255,255,0.85); margin: 0 0 0.5rem; }
    .rro-numero {
      font-size: clamp(4rem, 20vw, 9rem); font-weight: 900; color: #fff; line-height: 1;
      text-shadow: 0 8px 32px rgba(0,0,0,0.25); margin: 0.5rem 0;
    }
    .rro-emoji-grande { font-size: clamp(4rem, 20vw, 8rem); line-height: 1; margin: 0.5rem 0; }
    .rro-mensaje { font-size: clamp(1.1rem, 4vw, 1.6rem); font-weight: 700; color: #fff; margin: 0.5rem 0 2rem; }
    .rro-btn-cerrar {
      padding: 0.85rem 2.5rem; border-radius: 999px; border: 2px solid rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.15); color: #fff; font-size: 1rem; font-weight: 700;
      cursor: pointer;
    }
    .rro-btn-cerrar:active { transform: scale(0.97); background: rgba(255,255,255,0.25); }
  `
  document.head.appendChild(s)
}
