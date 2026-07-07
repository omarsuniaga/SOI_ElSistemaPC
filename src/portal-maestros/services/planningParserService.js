import { callGroq } from './groqService.js';

/**
 * Servicio para parsear archivos de planificación (PDF, DOCX, MD)
 * y extraer estructura curricular usando IA.
 */

const EXTRACT_PLANNING_PROMPT = `
Eres un arquitecto pedagógico experto en el sistema SOI (Sistema Operativo Institucional).
Tu tarea es analizar una planificación académica y extraer su estructura curricular en 4 niveles jerárquicos (que se colgarán de la Clase seleccionada).

Debes devolver un objeto JSON estrictamente formateado con esta estructura:
{
  "niveles": [
    {
      "nombre": "Nombre del nivel (ej: Nivel 1 - Iniciación)",
      "objetivo_general": "Objetivo principal del nivel",
      "numero_nivel": 1,
      "temas": [
        {
          "nombre": "Nombre del tema (ej: Postura y Embocadura)",
          "tipo": "TECNICA | SONIDO | AFINACION | ARCO | MANO_IZQ | REPERTORIO",
          "es_critico": true/false,
          "objetivos": [
            {
              "nombre": "Nombre del objetivo (ej: Mantener la espalda recta)",
              "indicadores": [
                {
                  "descripcion": "Descripción del indicador evaluable",
                  "es_requerido": true/false
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

Reglas CRÍTICAS:
1. Respeta los 4 niveles: Nivel -> Tema -> Objetivo -> Indicador.
2. Los indicadores son la unidad mínima de evaluación.
3. Clasifica cada Tema en uno de los tipos (TECNICA, SONIDO, AFINACION, etc.).
4. Responde ÚNICAMENTE con el bloque JSON.
`;

/**
 * Extrae texto de un archivo PDF
 */
async function extractTextFromPDF(file) {
  // Cargamos PDF.js dinámicamente si no está
  if (!window.pdfjsLib) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
  }

  return fullText;
}

/**
 * Extrae texto de un archivo DOCX
 */
async function extractTextFromDocx(file) {
  if (!window.mammoth) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.0/mammoth.browser.min.js');
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Lee un archivo Markdown o Texto
 */
async function extractTextFromMarkdown(file) {
  return await file.text();
}

/**
 * Realiza OCR en una imagen
 */
async function extractTextFromImage(file, onProgress) {
  if (!window.Tesseract) {
    await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
  }
  
  const worker = await window.Tesseract.createWorker({
    logger: m => {
      if (m.status === 'recognizing' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
      console.log(`[OCR Progress] ${m.status}: ${(m.progress * 100).toFixed(1)}%`);
    }
  });
  
  await worker.loadLanguage('spa');
  await worker.initialize('spa');
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();
  return text;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const DEFAULT_MAX_CHARS = 5000;
const NIVEL_HEADER_REGEX = /(?=^Nivel\b)/m;

/**
 * Divide el texto de una planificación en "chunks" procesables por la IA.
 *
 * Estrategia (curriculo-tres-planos WU #4):
 *   1. Si el texto contiene encabezados de la forma "Nivel ..." al inicio de
 *      línea, se divide por esos encabezados (cada nivel es una unidad
 *      pedagógica natural — evita partir un nivel a la mitad).
 *   2. Si no hay encabezados "Nivel" pero el texto excede `maxChars`, se
 *      divide en bloques de tamaño fijo (fallback puramente mecánico).
 *   3. Si no aplica ninguno de los dos casos, se devuelve un único chunk.
 *
 * @param {string} text
 * @param {{ maxChars?: number }} [options]
 * @returns {string[]}
 */
export function chunkPlanningText(text, { maxChars = DEFAULT_MAX_CHARS } = {}) {
  const nivelChunks = text.split(NIVEL_HEADER_REGEX).filter((chunk) => chunk.trim().length > 0);

  if (nivelChunks.length > 1) {
    return nivelChunks;
  }

  if (text.length <= maxChars) {
    return [text];
  }

  const sizeChunks = [];
  for (let i = 0; i < text.length; i += maxChars) {
    sizeChunks.push(text.slice(i, i + maxChars));
  }
  return sizeChunks;
}

/**
 * Valida que un objeto parseado de la IA respete la jerarquía de 4 niveles
 * (Nivel -> Tema -> Objetivo -> Indicador) exigida por EXTRACT_PLANNING_PROMPT.
 *
 * Lanza un `Error` descriptivo en el primer nivel de la jerarquía donde falte
 * la clave esperada — el mensaje siempre menciona el nombre de la clave
 * faltante para facilitar debugging (ver tests).
 *
 * @param {unknown} structure
 * @returns {true}
 */
export function validatePlanningStructure(structure) {
  if (!structure || !Array.isArray(structure.niveles)) {
    throw new Error('Estructura inválida: falta la clave "niveles" (debe ser un array).');
  }

  structure.niveles.forEach((nivel, nIdx) => {
    if (!Array.isArray(nivel?.temas)) {
      throw new Error(`Estructura inválida: el nivel #${nIdx + 1} no tiene "temas" (debe ser un array).`);
    }

    nivel.temas.forEach((tema, tIdx) => {
      if (!Array.isArray(tema?.objetivos)) {
        throw new Error(
          `Estructura inválida: el tema #${tIdx + 1} del nivel #${nIdx + 1} no tiene "objetivos" (debe ser un array).`,
        );
      }

      tema.objetivos.forEach((objetivo, oIdx) => {
        if (!Array.isArray(objetivo?.indicadores)) {
          throw new Error(
            `Estructura inválida: el objetivo #${oIdx + 1} del tema #${tIdx + 1} no tiene "indicadores" (debe ser un array).`,
          );
        }

        objetivo.indicadores.forEach((indicador, iIdx) => {
          if (!indicador || typeof indicador.descripcion !== 'string' || !indicador.descripcion.trim()) {
            throw new Error(
              `Estructura inválida: el indicador #${iIdx + 1} del objetivo #${oIdx + 1} no tiene "descripcion".`,
            );
          }
        });
      });
    });
  });

  return true;
}

/**
 * Fusiona los resultados parciales de múltiples chunks en una única
 * estructura, concatenando los niveles en el orden en que aparecieron.
 */
function mergeChunkResults(results) {
  return {
    niveles: results.flatMap((result) => (Array.isArray(result?.niveles) ? result.niveles : [])),
  };
}

/**
 * Envía un chunk de texto a la IA y devuelve el JSON parseado (sin validar).
 */
async function parseChunkWithAI(chunkText) {
  const messages = [
    { role: 'system', content: EXTRACT_PLANNING_PROMPT },
    { role: 'user', content: `Analiza esta planificación y devuelve SOLO el JSON:\n\n${chunkText}` },
  ];

  const jsonResponse = await callGroq(messages);

  // ROBUSTEZ: Extraer solo el bloque JSON (por si la IA añade texto extra)
  const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('La IA no devolvió un formato de datos válido.');
  }

  return JSON.parse(jsonMatch[0].trim());
}

/**
 * Función principal: Procesa el archivo y devuelve la estructura JSON.
 *
 * MODO BORRADOR: esta función NUNCA persiste datos — solo extrae texto,
 * lo divide en chunks (WU #4), llama a la IA por cada chunk, fusiona los
 * resultados y valida la estructura final antes de devolverla. La decisión
 * de guardar (como propuesta o descartar) es responsabilidad exclusiva de
 * la vista que la invoca (proponerContenidoView.js, WU #7).
 */
export async function parsePlanningFile(file, onProgress) {
  let text = '';
  const ext = file.name.split('.').pop().toLowerCase();

  try {
    if (ext === 'pdf') {
      text = await extractTextFromPDF(file);
    } else if (ext === 'docx') {
      text = await extractTextFromDocx(file);
    } else if (ext === 'md' || ext === 'txt') {
      text = await extractTextFromMarkdown(file);
    } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
      text = await extractTextFromImage(file, onProgress);
    } else {
      throw new Error('Formato no soportado. Usa PDF, DOCX, MD o Imágenes.');
    }

    if (!text.trim()) throw new Error('El archivo parece estar vacío o no contiene texto legible.');

    const chunks = chunkPlanningText(text);
    const partials = [];
    for (const chunk of chunks) {
      partials.push(await parseChunkWithAI(chunk));
    }

    const merged = chunks.length > 1 ? mergeChunkResults(partials) : partials[0];

    validatePlanningStructure(merged);

    return merged;
  } catch (err) {
    console.error('[PlanningParser] Error:', err);
    throw err;
  }
}
