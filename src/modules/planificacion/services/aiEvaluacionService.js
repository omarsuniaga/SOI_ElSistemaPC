/**
 * aiEvaluacionService.js — Servicio de Asistencia IA (GROQ Proxy) para Evaluación y Tareas
 */

import { callGroq } from '../api/groqService.js'

/**
 * Genera una secuencia didáctica de ruta con Objetivos e Indicadores usando IA.
 * @param {Object} params
 * @param {string} params.instrumento — Instrumento o asignatura (ej. Violín, Solfeo)
 * @param {number} params.nivelIndex — Nivel (0, 1, 2, 3)
 * @returns {Promise<Array<Object>>} Lista de nodos sugeridos
 */
export async function sugerirRutaDidacticaIA({ instrumento = 'Música', nivelIndex = 0 }) {
  const prompt = `Como pedagogo musical experto de El Sistema, genera una secuencia didáctica de 4 objetivos con 2 indicadores cada uno para ${instrumento} en el Nivel ${nivelIndex}.
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
