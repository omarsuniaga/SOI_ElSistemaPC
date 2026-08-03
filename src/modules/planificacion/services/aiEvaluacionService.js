/**
 * aiEvaluacionService.js — Servicio de Asistencia IA (GROQ Proxy) para Evaluación y Tareas
 */

import { callGroq } from '../api/groqService.js'

/**
 * Genera una secuencia didáctica de ruta con Objetivos e Indicadores usando IA (GROQ).
 * @param {Object} params
 * @param {string} params.instrumento — Instrumento o asignatura (ej. Violín, Piano, Solfeo)
 * @param {string|number} params.nivelNombre — Nivel técnico (ej. Nivel 1: Básico)
 * @param {Array<string>} [params.temasPrevios] — Lista de temas ya vistos
 * @returns {Promise<Array<Object>>} Lista de unidades sugeridas con sus indicadores
 */
export async function sugerirRutaDidacticaIA({ instrumento = 'Música', nivelNombre = 'Nivel 1: Básico', temasPrevios = [] }) {
  const contextoPrevio = temasPrevios.length > 0
    ? `El alumno ya domina los temas previos: ${temasPrevios.join(', ')}.`
    : 'Es la primera etapa de aprendizaje para esta materia.'

  const prompt = `Como Máximo Director Pedagógico Musical de El Sistema, genera una propuesta didáctica estructurada para la materia: "${instrumento}" en el nivel: "${nivelNombre}".
${contextoPrevio}

Requisitos pedagógicos:
1. Diseña de 3 a 4 Unidades Didácticas progresivas y lógicas.
2. Cada Unidad DEBE incluir estrictamente entre 2 a 3 Indicadores Evaluables (objetivos concretos de cada clase).
3. Establece secuencialidad pedagógica coherente (la Unidad 2 se apoya en la Unidad 1).

Responde ÚNICAMENTE en JSON válido con este esquema exacto (sin texto adicional ni explicaciones afuera del JSON):
[
  {
    "id": "obj-1",
    "titulo": "Unidad 1: [Nombre didáctico de la unidad]",
    "indicadores": [
      { "id": "ind-1-1", "titulo": "[Contenido de la clase 1]" },
      { "id": "ind-1-2", "titulo": "[Contenido de la clase 2]" }
    ]
  }
]`

  try {
    const raw = await callGroq([{ role: 'user', content: prompt }])
    const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[aiEvaluacionService] Error llamando a GROQ, usando fallback estructurado:', err)
    return [
      {
        id: 'obj-ia-1',
        titulo: `Unidad 1: Técnica Base e Iniciación - ${instrumento}`,
        indicadores: [
          { id: 'ind-ia-1-1', titulo: 'Postura corporal equilibrada y emisión sonora libre' },
          { id: 'ind-ia-1-2', titulo: 'Control de pulso rítmico y afinación base' },
        ],
      },
      {
        id: 'obj-ia-2',
        titulo: `Unidad 2: Articulación y Desarrollo Melódico - ${instrumento}`,
        indicadores: [
          { id: 'ind-ia-2-1', titulo: 'Digitación de escalas e independencia digital' },
          { id: 'ind-ia-2-2', titulo: 'Fraseo dinámico y lectura a vista' },
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
