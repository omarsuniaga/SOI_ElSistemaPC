// Base de conocimiento de respuestas CERRADAS (anti-inyección).
// El LLM solo clasifica intención; el texto de respuesta SIEMPRE sale de esta KB
// curada — nunca generado libremente. Scope: solo "El Sistema Punta Cana".
import faqData from './kb/faq.json' with { type: 'json' }

export interface FaqEntry {
  id: string
  intencion: string
  claves: string[]
  respuesta: string
}

const FAQ = faqData as FaqEntry[]

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/**
 * Devuelve la mejor FAQ que matchea el mensaje, o null si ninguna alcanza umbral.
 * El score suma 1 por cada clave presente, +1 si la intención del LLM coincide.
 */
export function buscarFaq(mensaje: string, intencion?: string): FaqEntry | null {
  const t = norm(mensaje)
  let best: FaqEntry | null = null
  let bestScore = 0
  for (const e of FAQ) {
    let score = e.claves.reduce((acc, k) => acc + (t.includes(norm(k)) ? 1 : 0), 0)
    if (intencion && e.intencion === intencion && score > 0) score += 1
    if (score > bestScore) {
      bestScore = score
      best = e
    }
  }
  return bestScore >= 1 ? best : null
}

// Respuesta canned cuando la consulta queda fuera de alcance (jamás generación libre).
export const MENSAJE_FUERA_DE_ALCANCE =
  'Por ahora solo puedo ayudarte con temas de El Sistema Punta Cana: inscripción, requisitos, horarios y citas. ¿En qué de eso te ayudo?'
