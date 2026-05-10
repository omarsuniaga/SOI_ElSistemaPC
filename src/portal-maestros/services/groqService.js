/**
 * Servicio para interactuar con la API de GROQ (Llama 3 y Whisper).
 * La API key se obtiene desde Supabase (tabla system_config).
 */

import { supabase } from '../../lib/supabaseClient.js'

const GROQ_CONFIG = {
  baseURL: 'https://api.groq.com/openai/v1',
  model: 'llama-3.1-8b-instant',
  whisperModel: 'whisper-large-v3',
  temperature: 0.2
};

const SYSTEM_PROMPT = `
Eres un asistente pedagógico musical especializado.
Recibes el registro de clase de un maestro de música (puede ser texto libre o transcripción).
Tu tarea es estructurar la información usando estrictamente este DSL:
  #Nombre    = alumno mencionado
  [texto]    = contenido dado en clase
  (texto)    = sugerencia de mejora para el alumno
  {texto}    = tarea asignada
  $término   = medida técnica (una palabra o frase con guion bajo)
  N/5        = calificación
  >CÓDIGO    = objetivo curricular alcanzado

Reglas:
- Agrupa alumnos con el mismo contenido: #Pedro, #Laura [Escala Do]
- Si no hay información de un tipo, omite el token.
- Responde ÚNICAMENTE con el texto en DSL, sin explicaciones ni preámbulos.
- Mantén el tono profesional pero cercano.
`;

const IMPROVE_TEXT_PROMPT = `
Eres un experto en escritura pedagógica y claridad profesional.
Tu tarea es MEJORAR el texto que recibes del maestro, enfocándose en:
1. Gramática y ortografía correctas
2. Claridad y concisión
3. Tono profesional pero accesible
4. Agregar perspectivas pedagógicas cuando sea relevante
5. Mantener la voz y estilo del maestro original

Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni cambios de significado.
`;

const STRUCTURE_TO_DSL_PROMPT = `
Eres un experto en convertir observaciones de clase al formato DSL pedagógico.
Recibes una observación libre de un maestro (ejemplo: "María no entendió bien los acordes. Necesita práctica")
Tu tarea es ESTRUCTURARLA usando los tokens DSL:
  #Nombre    = alumno mencionado
  [texto]    = contenido dado en clase
  (texto)    = sugerencia de mejora para el alumno
  {texto}    = tarea asignada
  $término   = medida técnica (una palabra o frase con guion bajo)
  >CÓDIGO    = objetivo curricular alcanzado

Reglas:
- Identifica el alumno (María) → #María
- Identifica el contenido ([acordes])
- Transforma la sugerencia → (práctica) o (Requiere más práctica en acordes)
- Sugiere tareas si es relevante
- Responde ÚNICAMENTE con el texto estructurado en DSL, sin explicaciones.

Ejemplo entrada: "María no entendió bien los acordes. Necesita práctica"
Ejemplo salida: "#María [acordes] (Requiere más práctica) {Ejercitar escala mayor en Do}
`;


/**
 * Obtiene la API key de GROQ desde Supabase (system_config).
 * @returns {Promise<string>}
 */
async function getGroqApiKey() {
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'groq_api_key')
    .maybeSingle()

  if (error) {
    console.error('[GROQ] Error consultando system_config:', error)
    throw new Error('No se pudo obtener la configuración de IA.')
  }

  if (!data?.value) {
    throw new Error('API key de GROQ no configurada en el sistema.')
  }

  return data.value
}

/**
 * Toma un texto libre y lo convierte a formato DSL.
 * @param {string} text 
 * @returns {Promise<string>}
 */
export async function enrichToDSL(text) {
  const apiKey = await getGroqApiKey()

  try {
    const response = await fetch(`${GROQ_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: GROQ_CONFIG.temperature
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('[GROQ] Error en enrichToDSL:', err);
    throw err;
  }
}

/**
 * Transcribe un archivo de audio (Blob) usando Whisper y luego lo pasa a Llama para DSLizar.
 * @param {Blob} audioBlob 
 * @returns {Promise<string>}
 */
export async function transcribeAndStructure(audioBlob) {
  const apiKey = await getGroqApiKey()

  try {
    // 1. Transcripción con Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.m4a');
    formData.append('model', GROQ_CONFIG.whisperModel);

    const whisperRes = await fetch(`${GROQ_CONFIG.baseURL}/audio/transcriptions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData
    });

    const whisperData = await whisperRes.json();
    if (whisperData.error) throw new Error(whisperData.error.message);
    
    const transcription = whisperData.text;

    // 2. Estructuración con Llama 3
    return await enrichToDSL(transcription);
  } catch (err) {
    console.error('[GROQ] Error en transcripción:', err);
    throw err;
  }
}

/**
 * Mejora un texto para claridad, gramática y perspectiva pedagógica.
 * @param {string} text - Texto original a mejorar
 * @returns {Promise<string>} Texto mejorado
 */
export async function improveText(text) {
  const apiKey = await getGroqApiKey()

  try {
    const response = await fetch(`${GROQ_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: [
          { role: 'system', content: IMPROVE_TEXT_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: GROQ_CONFIG.temperature
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('[GROQ] Error en improveText:', err);
    throw err;
  }
}

/**
 * Convierte texto libre a estructura DSL.
 * @param {string} text - Texto libre del maestro
 * @returns {Promise<string>} Texto estructurado en DSL
 */
export async function structureTextToDSL(text) {
  const apiKey = await getGroqApiKey()

  try {
    const response = await fetch(`${GROQ_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: [
          { role: 'system', content: STRUCTURE_TO_DSL_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: GROQ_CONFIG.temperature
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('[GROQ] Error en structureTextToDSL:', err);
    throw err;
  }
}

/**
 * Función genérica para chat con GROQ.
 * @param {Array<{role: string, content: string}>} messages - Array de mensajes
 * @returns {Promise<string>}
 */
export async function callGroq(messages) {
  const apiKey = await getGroqApiKey()

  try {
    const response = await fetch(`${GROQ_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: messages,
        temperature: GROQ_CONFIG.temperature
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error('[GROQ] Error en callGroq:', err);
    throw err;
  }
}