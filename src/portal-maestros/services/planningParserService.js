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
  
  const worker = await Tesseract.createWorker({
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

/**
 * Función principal: Procesa el archivo y devuelve la estructura JSON
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

    // Llamada a Groq
    const messages = [
      { role: 'system', content: EXTRACT_PLANNING_PROMPT },
      { role: 'user', content: `Analiza esta planificación y devuelve SOLO el JSON:\n\n${text.substring(0, 8000)}` }
    ];

    const jsonResponse = await callGroq(messages);
    
    // ROBUSTEZ: Extraer solo el bloque JSON (por si la IA añade texto extra)
    const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('La IA no devolvió un formato de datos válido.');
    }

    const cleanJson = jsonMatch[0].trim();
    return JSON.parse(cleanJson);

  } catch (err) {
    console.error('[PlanningParser] Error:', err);
    throw err;
  }
}
