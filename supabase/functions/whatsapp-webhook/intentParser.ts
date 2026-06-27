const GROQ_BASE = 'https://api.groq.com/openai/v1'

export const INTENTS = {
  AGENDAR_CITA: 'agendar_cita',
  REPROGRAMAR: 'reprogramar',
  CANCELAR: 'cancelar',
  CONFIRMAR_ASISTENCIA: 'confirmar_asistencia',
  PREGUNTAR_REQUISITOS: 'preguntar_requisitos',
  CONSULTA_GENERAL: 'consulta_general',
  AGRADECIMIENTO: 'agradecimiento',
  DESPEDIDA: 'despedida',
  NO_RESPUESTA: 'no_respuesta',
} as const

export type Intent = (typeof INTENTS)[keyof typeof INTENTS]

const VALID_INTENTS = new Set(Object.values(INTENTS))

export interface IntentResult {
  intencion: Intent
  confianza: number
  argumento: string | null
  fecha_sugerida: string | null
}

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

- agradecimiento: El padre da las gracias o expresa gratitud sin intención de agendar.
  Frases: "muchas gracias", "gracias por todo", "te agradezco", "muy amable".

- despedida: El padre se despide o indica que la conversación terminó.
  Frases: "que tengas buen día", "adiós", "nos vemos", "hasta luego", "cuídese",
  "chao", "bye".

- no_respuesta: Saludo inicial, mensaje vacío, irrelevante, o que no expresa intención clara.
  Frases: "hola", "jaja", "ok", "bueno", emojis solos, "ah ok".

REGLAS:
- Priorizá la intención más específica sobre no_respuesta. "ok" después de
  ofrecer un horario → agendar_cita, no no_respuesta.
- fecha_sugerida: SOLO si el MENSAJE DEL REPRESENTANTE menciona una fecha/día/hora
  NUEVA. NO uses fechas del CONTEXTO. Si no hay fecha en el mensaje del
  representante, poné null.
- Confianza: 0.0 a 1.0. Soltá 0.0 si estás adivinando.

Devolvé SOLO un JSON válido (sin markdown, sin texto adicional):
{"intencion":"agendar_cita","confianza":0.95,"argumento":"quiere agendar cita","fecha_sugerida":null}`

const DEFAULT_INTENT: IntentResult = {
  intencion: INTENTS.NO_RESPUESTA,
  confianza: 0,
  argumento: 'No se pudo analizar el mensaje',
  fecha_sugerida: null,
}

function isEmptyMessage(mensaje: string): boolean {
  if (!mensaje || typeof mensaje !== 'string') return true
  const limpio = mensaje.replace(/[\s\n\r]+/g, '').trim()
  if (limpio.length === 0) return true
  const soloEmojis = limpio.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    '',
  ).trim()
  return soloEmojis.length === 0
}

function buildPrompt(mensaje: string, contexto?: { estadoPostulante?: string; ultimoMensajeEnviado?: string | null }): string {
  const contextoStr = contexto?.estadoPostulante || contexto?.ultimoMensajeEnviado
    ? `\n\nCONTEXTO:\n- Estado del postulante: ${contexto.estadoPostulante || 'desconocido'}\n- Último mensaje enviado: "${contexto.ultimoMensajeEnviado || 'ninguno'}"`
    : ''
  return `${SYSTEM_PROMPT}\n\nMENSAJE DEL REPRESENTANTE:\n"${mensaje}"${contextoStr}`
}

function parseIntent(raw: string, mensaje: string): IntentResult {
  try {
    const s = raw
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
    const parsed = JSON.parse(s)

    const intencion = VALID_INTENTS.has(parsed.intencion)
      ? parsed.intencion
      : INTENTS.NO_RESPUESTA

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
    return { ...DEFAULT_INTENT, argumento: `Error al parsear: mensaje="${mensaje.slice(0, 100)}"` }
  }
}

export async function analizarIntencion(
  groqApiKey: string,
  mensaje: string,
  contexto?: { estadoPostulante?: string; ultimoMensajeEnviado?: string | null },
): Promise<IntentResult> {
  if (isEmptyMessage(mensaje)) {
    return { ...DEFAULT_INTENT, argumento: 'Mensaje vacío o solo emojis' }
  }

  try {
    const prompt = buildPrompt(mensaje, contexto)
    const body = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }

    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Groq API error ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const content: string | undefined = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Groq returned empty response')

    return parseIntent(content.trim(), mensaje)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ...DEFAULT_INTENT, argumento: `Error llamando a GROQ: ${msg}` }
  }
}
