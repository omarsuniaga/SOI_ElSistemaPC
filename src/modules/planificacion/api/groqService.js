import { config } from '../../../core/config/config.js'
import { parseDsl, getTokenSummary } from '../utils/dslParser.js'

const BASE_PROMPT = `Eres un asistente pedagógico musical. Recebir el registro de clase de un maestro.
Estructura la información usando este DSL:
- #Nombre = alumno mencionado
- [texto] = contenido dado
- (texto) = sugerencia de mejora
- {texto} = tarea asignada
- $término = medida técnica
- N/5 = calificación
Responde SOLO con el texto estructurado en DSL, sin explicaciones.`

const MOCK_RESPONSES = {
  'escala do': '#Pedro [Escala Do Mayor] $1Octava (Practicar digitación) {Estudiar escala Do Mayor 10min/día} 4/5\n#Lucía [Escala Do# Mayor] $1Octava (Mayor velocidad) {Practicar cambio de posición} 3/5',
  'default': '#Alumno [Contenido dado] $medida (sugerencia) {tarea} N/5',
}

function getMockEnrichResponse(input) {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (lower.includes(key)) {
      return response
    }
  }

  const parsed = parseDsl(input)
  if (parsed.alumnos.length > 0) {
    return input
  }

  return MOCK_RESPONSES.default.replace('Alumno', 'Estudiante').replace('Contenido dado', input.substring(0, 30))
}

export async function enrichText(texto) {
  if (!texto || texto.trim().length === 0) {
    return { success: false, message: 'El texto no puede estar vacío', dsl: '' }
  }

  if (config.isDemoMode) {
    const mockResult = getMockEnrichResponse(texto)
    return { success: true, message: 'Demo mode - respuesta mock', dsl: mockResult, debug: { isMock: true } }
  }

  if (!config.groq.apiKey) {
    return { success: false, message: 'API key no configurada', dsl: getMockEnrichResponse(texto), debug: { isMock: true, fallback: true } }
  }

  try {
    const fullPrompt = `${BASE_PROMPT}\n\nTexto del maestro: "${texto}"`

    const response = await fetch(`${config.groq.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [
          { role: 'system', content: BASE_PROMPT },
          { role: 'user', content: `Texto del maestro: "${texto}"` }
        ],
        max_tokens: config.groq.maxTokens,
        temperature: config.groq.temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en API GROQ')
    }

    const data = await response.json()
    const dslResponse = data.choices[0]?.message?.content || ''

    return {
      success: true,
      message: 'Enriquecido correctamente',
      dsl: dslResponse.trim(),
      debug: { isMock: false, model: config.groq.model },
    }
  } catch (error) {
    console.error('GROQ enrichText error:', error)
    return {
      success: false,
      message: `Error: ${error.message}`,
      dsl: getMockEnrichResponse(texto),
      debug: { isMock: true, fallback: true, error: error.message },
    }
  }
}

export async function transcribeAudio(audioBlob) {
  if (!audioBlob) {
    return { success: false, message: 'Audio no proporcionado', transcript: '' }
  }

  if (config.isDemoMode) {
    return {
      success: true,
      message: 'Demo mode - transcript mock',
      transcript: 'hoy dimos escala do con pedro se porto mal',
      debug: { isMock: true },
    }
  }

  if (!config.groq.apiKey) {
    return {
      success: false,
      message: 'API key no configurada',
      transcript: 'today we did do scale with peter',
      debug: { isMock: true, fallback: true },
    }
  }

  try {
    const formData = new FormData()
    const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' })
    formData.append('file', audioFile)
    formData.append('model', config.groq.whisperModel)

    const response = await fetch(`https://api.groq.com/openai/v1/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Whisper API')
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Transcripción exitosa',
      transcript: data.text || '',
      debug: { isMock: false, model: config.groq.whisperModel },
    }
  } catch (error) {
    console.error('GROQ transcribeAudio error:', error)
    return {
      success: false,
      message: `Error: ${error.message}`,
      transcript: '',
      debug: { isMock: true, fallback: true, error: error.message },
    }
  }
}

export async function transcribeAndParse(audioBlob) {
  const transcriptResult = await transcribeAudio(audioBlob)

  if (!transcriptResult.success) {
    return transcriptResult
  }

  const enrichResult = await enrichText(transcriptResult.transcript)

  return {
    success: enrichResult.success,
    message: `Transcripción: ${transcriptResult.message}, Enriquecimiento: ${enrichResult.message}`,
    transcript: transcriptResult.transcript,
    dsl: enrichResult.dsl,
    debug: { transcript: transcriptResult.debug, enrich: enrichResult.debug },
  }
}

export async function enrichFromText(texto) {
  return enrichText(texto)
}