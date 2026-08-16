/**
 * aiEvaluacionService.js — Servicio de Asistencia IA (GROQ Proxy) para Evaluación y Tareas
 */

import { callGroq } from '../api/groqService.js'

/**
 * Genera una secuencia didáctica de ruta con Objetivos e Indicadores usando IA.
 * @param {Object} params
 * @param {string} params.instrumento — Instrumento o asignatura (ej. Violín, Solfeo)
 * @param {number} params.nivelIndex — Nivel (0, 1, 2, 3)
 * @param {string[]} [params.objetivosExistentes] — nombres de los objetivos que
 *   YA existen en esa Unidad/Nivel de la clase (si los hay), para que la IA
 *   continúe la ruta de forma coherente en vez de repetir o contradecir lo
 *   que el maestro/coordinador ya redactó. Opcional y retrocompatible — los
 *   callers que no lo pasan (ej. EditorPlanificacionModal.js, sistema
 *   legado) siguen generando contenido genérico como antes.
 * @returns {Promise<Array<Object>>} Lista de nodos sugeridos
 */
export async function sugerirRutaDidacticaIA({ instrumento = 'Música', nivelIndex = 0, objetivosExistentes = [] }) {
  const contextoPrevio =
    objetivosExistentes.length > 0
      ? `\n\nEsta clase YA tiene estos objetivos redactados para este mismo nivel/unidad, en este orden:\n${objetivosExistentes
          .map((o, i) => `${i + 1}. ${o}`)
          .join('\n')}\nGenerá SOLO objetivos NUEVOS que continúen esa progresión de forma coherente (más avanzados, sin repetir ni contradecir los anteriores). No los repitas en la respuesta.`
      : ''

  const prompt = `Como pedagogo musical experto de El Sistema, genera una secuencia didáctica de 4 objetivos con 2 indicadores cada uno para ${instrumento} en el Nivel ${nivelIndex}.${contextoPrevio}
Responde ÚNICAMENTE en JSON con el formato:
[
  { "id": "obj-1", "titulo": "Objetivo 1", "indicadores": [{ "id": "ind-1-1", "titulo": "Indicador 1" }] }
]`

  try {
    const raw = await callGroq([{ role: 'user', content: prompt }])
    const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[aiEvaluacionService] Error llamando a GROQ, usando fallback demo:', err)
    return [
      {
        id: 'obj-demo-1',
        titulo: `Introducción Técnica Nivel ${nivelIndex}`,
        indicadores: [
          { id: 'ind-demo-1-1', titulo: 'Postura y emisión de sonido libre' },
          { id: 'ind-demo-1-2', titulo: 'Control de pulso rítmico' },
        ],
      },
    ]
  }
}

/**
 * Genera una sugerencia de tarea de refuerzo personalizada basada en los resultados de evaluación.
 * @param {Object} params
 * @param {string} params.indicadorTitulo — Nombre del indicador evaluado
 * @param {number} params.alumnosNecesitanRefuerzo — Cantidad de alumnos con <3 estrellas
 * @returns {Promise<string>} Texto de la tarea sugerida
 */
export async function sugerirTareaRefuerzoIA({ indicadorTitulo, alumnosNecesitanRefuerzo = 1 }) {
  const prompt = `Redacta una tarea corta y práctica de 2 líneas para la casa para ${alumnosNecesitanRefuerzo} alumnos que necesitan reforzar el tema: "${indicadorTitulo}".`

  try {
    const raw = await callGroq([{ role: 'user', content: prompt }])
    return raw.trim()
  } catch (err) {
    return `Practicar en casa 15 minutos diarios los ejercicios de ${indicadorTitulo} a velocidad lenta.`
  }
}

/**
 * "Profesionalizar con IA" (REQ-11, Tarea 3.5): toma el texto libre de la
 * bitácora de sesión (`bitacoraSesionPanel.js`) y devuelve una versión
 * redactada con tono profesional/pedagógico, para que el maestro la revise
 * y decida si la acepta — nunca se guarda sola (ver
 * `bitacoraSesionService.guardarTextoProfesionalizado`, que exige
 * `aceptadoPorMaestro: true` explícito).
 *
 * Reutiliza la misma integración GROQ que `sugerirRutaDidacticaIA`
 * (`callGroq` vía `api/groqService.js` — proxy Edge Function, la API key
 * nunca llega al navegador). No usa el `improveText` de
 * `portal-maestros/services/groqService.js` a propósito: ese vive en un
 * módulo distinto (portal de maestros) y este componente pertenece al
 * módulo `planificacion`, que ya tiene su propio proxy GROQ — cruzar esa
 * frontera introduciría un acoplamiento entre módulos que no existe hoy.
 *
 * @param {string} texto - texto libre original escrito por el maestro
 * @returns {Promise<string>} versión profesionalizada del texto
 */
export async function profesionalizarBitacoraIA(texto) {
  if (!texto || !texto.trim()) return ''

  const prompt = `Redactá de forma profesional y pedagógica la siguiente nota de bitácora de un maestro de música de El Sistema, manteniendo los hechos EXACTOS que describe (no inventes nombres, notas, ni datos que no estén en el texto original). Máximo 3 oraciones, tono institucional pero cálido.

Texto original del maestro:
"""
${texto}
"""

Responde ÚNICAMENTE con el texto profesionalizado, sin comillas ni explicaciones adicionales.`

  try {
    const raw = await callGroq([{ role: 'user', content: prompt }])
    return raw.trim()
  } catch (err) {
    console.warn('[aiEvaluacionService] Error profesionalizando bitácora con GROQ:', err)
    return texto
  }
}
