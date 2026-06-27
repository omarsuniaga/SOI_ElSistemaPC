import { callGroq, parseGroqJSON } from '../../../portal-maestros/services/groqService.js'

export const INTENCIONES = {
  AGENDAR_CITA: 'agendar_cita',
  REPROGRAMAR: 'reprogramar',
  CANCELAR: 'cancelar',
  CONFIRMAR_ASISTENCIA: 'confirmar_asistencia',
  PREGUNTAR_REQUISITOS: 'preguntar_requisitos',
  CONSULTA_GENERAL: 'consulta_general',
  NO_RESPUESTA: 'no_respuesta',
}

const INTENCIONES_VALIDAS = Object.values(INTENCIONES)

const SYSTEM_PROMPT = `Eres el clasificador de intenciones del departamento de Admisión de "El Sistema Punta Cana", una institución musical.

Dado un mensaje de WhatsApp de un padre/madre/representante, determinás su INTENCIÓN respecto al proceso de inscripción.

CONTEXTO recibís (si está disponible):
- Estado actual del postulante en el pipeline
- Último mensaje que le enviamos (para entender a qué responde)

INTENCIONES POSIBLES (elegí UNA):
- agendar_cita: El padre QUIERE agendar una cita presencial para la inscripción.
  Frases: "sí quiero", "puedo ir", "agendeme", "sí", "quiero inscribirlo",
  "puedo el jueves", "mañana puedo", "esta bien", "ok", "claro".
  Incluye también respuestas positivas a una oferta de horario.

- reprogramar: El padre NO PUEDE en la fecha/hora ofrecida y quiere cambiarla.
  Frases: "no puedo ese día", "cambiemos", "mejor otro día", "estoy ocupado",
  "no me queda bien", "podemos moverlo", "más tarde".

- cancelar: El padre RECHAZA el proceso de inscripción definitivamente.
  Frases: "no me interesa", "ya no quiero", "gracias pero no", "lo decidí",
  "no vamos a inscribirlo", "demos de baja".

- confirmar_asistencia: El padre CONFIRMA que asistirá a una cita ya agendada.
  Frases: "sí voy", "estaré allá", "confirmado", "cuente conmigo",
  "allí estaremos", "sí, confirmo".

- preguntar_requisitos: El padre pregunta qué documentos/requisitos necesita.
  Frases: "qué documentos", "qué necesito llevar", "requisitos", "qué papeles",
  "qué debo traer", "necesito llevar algo".

- consulta_general: Pregunta sobre horarios, costos, ubicación, etc.
  Frases: "cuánto cuesta", "horarios", "dónde queda", "qué días",
  "es gratis", "cuándo empiezan las clases".

- no_respuesta: Saludo, mensaje vacío, irrelevante, o que no expresa intención clara.
  Frases: "hola", "jaja", "gracias", "ok", "bueno", emojis solos, "ah ok".

REGLAS:
- Priorizá la intención más específica sobre no_respuesta. "ok" después de
  ofrecer un horario → agendar_cita, no no_respuesta.
- Si el mensaje menciona una fecha/día/hora, incluíla en fecha_sugerida.
- Confianza: 0.0 a 1.0. Soltá 0.0 si estás adivinando.

Devolvé SOLO un JSON válido (sin markdown, sin texto adicional):
{"intencion":"agendar_cita","confianza":0.95,"argumento":"quiere agendar cita","fecha_sugerida":null}`

export const INTENCION_DEFAULT = {
  intencion: INTENCIONES.NO_RESPUESTA,
  confianza: 0,
  argumento: 'No se pudo analizar el mensaje',
  fecha_sugerida: null,
}

function esMensajeVacio(mensaje) {
  if (!mensaje || typeof mensaje !== 'string') return true
  const limpio = mensaje.replace(/[\s\n\r]+/g, '').trim()
  if (limpio.length === 0) return true
  const soloEmojis = limpio.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
  if (soloEmojis.length === 0) return true
  return false
}

function construirPrompt(mensaje, contexto) {
  const contextoStr = contexto?.estadoPostulante || contexto?.ultimoMensajeEnviado
    ? `\n\nCONTEXTO:\n- Estado del postulante: ${contexto.estadoPostulante || 'desconocido'}\n- Último mensaje enviado: "${contexto.ultimoMensajeEnviado || 'ninguno'}"`
    : ''

  return `${SYSTEM_PROMPT}\n\nMENSAJE DEL REPRESENTANTE:\n"${mensaje}"${contextoStr}`
}

function parsearIntencion(raw, mensaje) {
  try {
    const parsed = parseGroqJSON(raw)

    const intencion = INTENCIONES_VALIDAS.includes(parsed.intencion)
      ? parsed.intencion
      : INTENCIONES.NO_RESPUESTA

    const confianza = typeof parsed.confianza === 'number'
      ? Math.max(0, Math.min(1, parsed.confianza))
      : 0

    return {
      intencion,
      confianza,
      argumento: typeof parsed.argumento === 'string' ? parsed.argumento : null,
      fecha_sugerida: typeof parsed.fecha_sugerida === 'string' ? parsed.fecha_sugerida : null,
    }
  } catch {
    return { ...INTENCION_DEFAULT, argumento: `Error al parsear: mensaje="${mensaje.slice(0, 100)}"` }
  }
}

export async function analizarIntencion(mensaje, contexto = {}) {
  if (esMensajeVacio(mensaje)) {
    return { ...INTENCION_DEFAULT, argumento: 'Mensaje vacío o solo emojis' }
  }

  try {
    const prompt = construirPrompt(mensaje, contexto)
    const raw = await callGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])
    return parsearIntencion(raw, mensaje)
  } catch (err) {
    return { ...INTENCION_DEFAULT, argumento: `Error llamando a GROQ: ${err.message}` }
  }
}

export function fechaValida(str) {
  if (!str || typeof str !== 'string') return null
  const d = new Date(str)
  return !isNaN(d.getTime()) ? d.toISOString() : null
}
