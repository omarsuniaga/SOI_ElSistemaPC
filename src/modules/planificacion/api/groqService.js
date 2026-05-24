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

// ── Curriculum AI Functions ──────────────────────────────────────────────────

/**
 * Ask GROQ which curriculum objectives were likely covered by a plan.
 * Returns array of { alumno, objetivo_id, nivel, razon }.
 *
 * @param {{ tema, objetivos, contenido, notas_dsl }} plan
 * @param {string[]} alumnos  — list of student names parsed from DSL
 * @param {Array<{id, descripcion}>} objetivos_curriculo
 */
export async function extraerCobertura(plan, alumnos, objetivos_curriculo) {
  const prompt = `Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

Plan de clase:
- Tema: ${plan.tema}
- Objetivos escritos por el maestro: ${plan.objetivos || '(ninguno)'}
- Contenido: ${plan.contenido || '(ninguno)'}
- Notas DSL: ${plan.notas_dsl || '(ninguno)'}

Alumnos mencionados: ${alumnos.join(', ') || '(ninguno)'}

Objetivos curriculares a evaluar:
${objetivos_curriculo.map(o => `- id:${o.id} → ${o.descripcion}`).join('\n')}

Responde SOLO en JSON válido con este formato exacto:
{
  "coberturas": [
    { "alumno": "nombre", "objetivo_id": "uuid", "nivel": "iniciando|en_proceso|logrado", "razon": "breve justificación" }
  ]
}
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas. Si no hay evidencia clara, devuelve coberturas vacías.`

  if (config.isDemoMode || !config.groq.apiKey) {
    const mockCoberturas = alumnos.slice(0, 2).flatMap(alumno =>
      objetivos_curriculo.slice(0, 2).map(o => ({
        alumno,
        objetivo_id: o.id,
        nivel: 'en_proceso',
        razon: 'Demo: objetivo relacionado con el tema'
      }))
    )
    return { success: true, coberturas: mockCoberturas, isMock: true }
  }

  try {
    const response = await fetch(`${config.groq.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error GROQ extraerCobertura')
    }
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{"coberturas":[]}')
    return { success: true, coberturas: parsed.coberturas || [], isMock: false }
  } catch (error) {
    console.error('extraerCobertura error:', error)
    return { success: false, coberturas: [], error: error.message }
  }
}

/**
 * Generate a draft plan for a student based on pending objectives and recent themes.
 *
 * @param {{ nombre, instrumento, nivel }} alumno
 * @param {Array<{descripcion}>} objetivos_pendientes
 * @param {string[]} ultimos_temas  — last 3 executed plan themes
 */
export async function sugerirPlan(alumno, objetivos_pendientes, ultimos_temas) {
  const prompt = `Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

Alumno: ${alumno.nombre}, instrumento: ${alumno.instrumento}, nivel: ${alumno.nivel}

Objetivos pendientes del currículo (priorizar estos):
${objetivos_pendientes.map(o => `- ${o.descripcion}`).join('\n') || '(sin objetivos pendientes registrados)'}

Últimas clases trabajadas (no repetir):
${ultimos_temas.join(', ') || '(ninguna)'}

Responde SOLO en JSON válido con este formato exacto:
{
  "tema": "...",
  "objetivos": "...",
  "contenido": "...",
  "recursos": ["..."]
}
Sé específico y pedagógicamente relevante para el instrumento y nivel.`

  if (config.isDemoMode || !config.groq.apiKey) {
    return {
      success: true,
      plan: {
        tema: `Clase de ${alumno.instrumento} — Nivel ${alumno.nivel}`,
        objetivos: objetivos_pendientes[0]?.descripcion || 'Repaso general',
        contenido: 'Ejercicios de calentamiento, escala mayor, pieza del repertorio.',
        recursos: ['Partitura del repertorio', 'Metrónomo']
      },
      isMock: true
    }
  }

  try {
    const response = await fetch(`${config.groq.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error GROQ sugerirPlan')
    }
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{}')
    return { success: true, plan: parsed, isMock: false }
  } catch (error) {
    console.error('sugerirPlan error:', error)
    return { success: false, plan: null, error: error.message }
  }
}

/**
 * Generate qualitative pedagogical feedback for a teacher based on their
 * executed plans and curriculum coverage.
 *
 * @param {string} instrumento
 * @param {Array<{tema, contenido, objetivos}>} planes_ejecutados  — last 8 weeks
 * @param {object} curriculo  — full curriculum object from obtenerCurriculo()
 * @param {string} resumen_cobertura  — human-readable summary of objective coverage
 */
export async function analizarEnfoque(instrumento, planes_ejecutados, curriculo, resumen_cobertura) {
  const pilares_texto = curriculo?.curriculo_pilares?.map(p =>
    `Pilar "${p.nombre}": ${p.curriculo_objetivos?.map(o => o.descripcion).join('; ')}`
  ).join('\n') || '(sin currículo definido)'

  const planes_texto = planes_ejecutados.map((p, i) =>
    `Clase ${i + 1}: ${p.tema} — ${p.contenido || p.objetivos || ''}`
  ).join('\n')

  const prompt = `Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

Instrumento principal: ${instrumento}

Currículo de referencia:
${pilares_texto}

Planes ejecutados (últimas 8 semanas):
${planes_texto || '(ninguno)'}

Cobertura de objetivos actual:
${resumen_cobertura || '(sin datos)'}

Escribe 2-3 párrafos:
1. Fortalezas del enfoque actual
2. Áreas del currículo que podrían reforzarse
3. Sugerencias concretas para próximas semanas

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios. Responde en español.`

  if (config.isDemoMode || !config.groq.apiKey) {
    return {
      success: true,
      feedback: `Tu enfoque en las últimas semanas muestra consistencia y dedicación. Se nota claridad en la presentación de contenidos técnicos.\n\nHay oportunidad de ampliar el trabajo en repertorio variado y lectura a primera vista, áreas que aparecen menos frecuentes en los planes recientes.\n\nPara las próximas semanas, te sugiero incorporar al menos una pieza nueva por mes y dedicar 5-10 minutos de cada clase a ejercicios de lectura rítmica.`,
      isMock: true
    }
  }

  try {
    const response = await fetch(`${config.groq.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.groq.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.8,
      }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error GROQ analizarEnfoque')
    }
    const data = await response.json()
    const feedback = data.choices[0]?.message?.content?.trim() || ''
    return { success: true, feedback, isMock: false }
  } catch (error) {
    console.error('analizarEnfoque error:', error)
    return { success: false, feedback: '', error: error.message }
  }
}