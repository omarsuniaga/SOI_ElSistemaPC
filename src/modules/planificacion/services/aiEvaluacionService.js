/**
 * aiEvaluacionService.js — Servicio de Asistencia IA (GROQ Proxy) para Evaluación y Tareas
 */

import { callGroq } from '../api/groqService.js'
import { generarUUIDSeguro } from '../domain/IndicadorLogro.js'

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
    if (!Array.isArray(parsed)) return []

    return parsed.map((u, uIdx) => {
      const uId = generarUUIDSeguro()
      const oId = generarUUIDSeguro()
      return {
        id: uId,
        titulo: u.titulo || `Unidad Didáctica ${uIdx + 1}`,
        persistido: false,
        objetivos: [
          {
            id: oId,
            unidadId: uId,
            titulo: `Objetivo General ${uIdx + 1}`,
            persistido: false,
            indicadores: (u.indicadores || []).map((ind, indIdx) => {
              const iId = generarUUIDSeguro()
              return {
                id: iId,
                objetivoId: oId,
                titulo: typeof ind === 'string' ? ind : ind.titulo || `Indicador ${indIdx + 1}`,
                descripcion: '',
                nivelIndex: 0,
                orden: indIdx + 1,
                prerrequisitoId: null,
                persistido: false,
              }
            }),
          },
        ],
      }
    })
  } catch (err) {
    console.warn('[aiEvaluacionService] Error llamando a GROQ, usando fallback estructurado:', err)
    const u1Id = generarUUIDSeguro()
    const o1Id = generarUUIDSeguro()
    const u2Id = generarUUIDSeguro()
    const o2Id = generarUUIDSeguro()
    return [
      {
        id: u1Id,
        titulo: `Unidad 1: Técnica Base e Iniciación - ${instrumento}`,
        persistido: false,
        objetivos: [
          {
            id: o1Id,
            unidadId: u1Id,
            titulo: 'Fundamentos de Postura y Emisión',
            persistido: false,
            indicadores: [
              {
                id: generarUUIDSeguro(),
                objetivoId: o1Id,
                titulo: 'Postura corporal equilibrada y emisión sonora libre',
                descripcion: '',
                nivelIndex: 0,
                orden: 1,
                prerrequisitoId: null,
                persistido: false,
              },
              {
                id: generarUUIDSeguro(),
                objetivoId: o1Id,
                titulo: 'Control de pulso rítmico y afinación base',
                descripcion: '',
                nivelIndex: 0,
                orden: 2,
                prerrequisitoId: null,
                persistido: false,
              },
            ],
          },
        ],
      },
      {
        id: u2Id,
        titulo: `Unidad 2: Articulación y Desarrollo Melódico - ${instrumento}`,
        persistido: false,
        objetivos: [
          {
            id: o2Id,
            unidadId: u2Id,
            titulo: 'Desarrollo Melódico e Independencia Digital',
            persistido: false,
            indicadores: [
              {
                id: generarUUIDSeguro(),
                objetivoId: o2Id,
                titulo: 'Digitación de escalas e independencia digital',
                descripcion: '',
                nivelIndex: 0,
                orden: 1,
                prerrequisitoId: null,
                persistido: false,
              },
              {
                id: generarUUIDSeguro(),
                objetivoId: o2Id,
                titulo: 'Fraseo dinámico y lectura a vista',
                descripcion: '',
                nivelIndex: 0,
                orden: 2,
                prerrequisitoId: null,
                persistido: false,
              },
            ],
          },
        ],
      },
    ]
  }
}


/**
 * Genera la SIGUIENTE Unidad Didáctica incremental (1 por cada clic) mediante análisis profundo con IA (GROQ).
 *
 * Analiza el instrumento, nivel técnico, unidades existentes y la complejidad pedagógica para:
 * 1. Proponer 1 nueva Unidad coherente sin repetir contenidos.
 * 2. Determinar analíticamente la cantidad exacta de Indicadores Evaluables necesarios (2 a 4).
 * 3. Asignar los prerrequisitos técnicos inmediatos para cada indicador.
 * 4. Estimación del número de clases presenciales necesarias según la dificultad del tema.
 *
 * @param {Object} params
 * @param {string} params.instrumento — Instrumento o asignatura (ej. Violín, Piano)
 * @param {string} params.nivelNombre — Nivel técnico (ej. Nivel 1: Básico)
 * @param {number} params.numeroUnidad — Número secuencial de la unidad a generar (1, 2, 3...)
 * @param {Array<Object>} [params.unidadesExistentes] — Lista de unidades e indicadores previamente creados
 * @returns {Promise<Object>} Objeto completo de la nueva unidad sugerida
 */
export async function sugerirSiguienteUnidadIA({
  instrumento = 'Música',
  nivelNombre = 'Nivel 1: Básico',
  numeroUnidad = 1,
  unidadesExistentes = [],
}) {
  // El historial se construye con el árbol COMPLETO (unidad → objetivo →
  // indicadores) para que GROQ vea la secuencia pedagógica real. Antes se
  // leía `u.indicadores` (plano), que en este esquema nunca existe: las
  // unidades tienen `.objetivos[].indicadores[]`.
  const historialText = unidadesExistentes.length > 0
    ? unidadesExistentes
        .map((u, i) => {
          const objetivosText = (u.objetivos || [])
            .map((o, oi) => {
              const inds = (o.indicadores || []).map((ind) => ind.titulo).join(', ')
              return `    Objetivo ${oi + 1}: ${o.titulo}${inds ? ` -> [${inds}]` : ''}`
            })
            .join('\n')
          return `Unidad ${i + 1}: ${u.titulo}\n${objetivosText}`
        })
        .join('\n')
    : 'No hay unidades previas creadas aún en este plan.'

  const prompt = `Como Máximo Director Pedagógico Musical de El Sistema, estás diseñando paso a paso la estructura curricular para: "${instrumento}" (${nivelNombre}).

HISTORIAL DE UNIDADES Y TEMAS YA CREADOS:
${historialText}

TAREA PEDAGÓGICA CONCRETA:
Analiza a profundidad el progreso pedagógico y genera ÚNICAMENTE LA SIGUIENTE UNIDAD DIDÁCTICA (Unidad #${numeroUnidad}).

REGLAS DE ANÁLISIS DE GROQ:
1. CONTINUIDAD LÓGICA: La nueva Unidad debe ser la continuación didáctica natural del historial previo (sin repetir temas ya vistos).
2. MULTI-INDICADORES: Evalúa cuántos indicadores específicos son requeridos para dominar esta unidad (entre 2 y 4 indicadores). No te limites a 1 solo indicador.
3. PRERREQUISITOS TÉCNICOS: Cada indicador debe fundamentarse en el indicador previo inmediato o en un tema del historial.
4. ESTIMACIÓN DE CLASES: Calcula cuántas clases presenciales (de 45 min) se requerirán para dominar esta unidad según su complejidad técnica (ej. 2, 3 o 4 clases).

Responde ÚNICAMENTE en formato JSON válido (sin explicaciones afuera del JSON):
{
  "titulo": "Unidad ${numeroUnidad}: [Título descriptivo y profesional]",
  "complejidad": "baja|media|alta",
  "clasesEstimadas": 3,
  "justificacionPedagogica": "[Explicación de 1 línea de por qué se requieren esos indicadores]",
  "indicadores": [
    {
      "titulo": "[Título del indicador de la clase 1]",
      "esPrerrequisitoDeSiguiente": true
    },
    {
      "titulo": "[Título del indicador de la clase 2]",
      "esPrerrequisitoDeSiguiente": false
    }
  ]
}`

  const raw = await callGroq([{ role: 'user', content: prompt }])
  const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  if (!parsed || !parsed.titulo) {
    throw new Error('GROQ no devolvió una estructura de unidad válida. Intenta nuevamente.')
  }

  const unidadId = generarUUIDSeguro()
  const indIds = (Array.isArray(parsed.indicadores) ? parsed.indicadores : []).map(() => generarUUIDSeguro())
  const indicadoresFormateados = (Array.isArray(parsed.indicadores) ? parsed.indicadores : []).map((ind, j) => ({
    id: indIds[j],
    titulo: typeof ind === 'string' ? ind : ind.titulo || `Indicador ${j + 1}`,
    prerrequisitoId: j > 0 ? indIds[j - 1] : null,
  }))

  if (indicadoresFormateados.length < 2 || indicadoresFormateados.length > 4) {
    throw new Error(
      `GROQ devolvió ${indicadoresFormateados.length} indicadores (fuera del rango 2-4 exigido). Intenta nuevamente.`,
    )
  }

  return {
    id: unidadId,
    titulo: parsed.titulo,
    complejidad: parsed.complejidad || 'media',
    clasesEstimadas: parsed.clasesEstimadas || indicadoresFormateados.length,
    justificacionPedagogica: parsed.justificacionPedagogica || '',
    indicadores: indicadoresFormateados,
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
