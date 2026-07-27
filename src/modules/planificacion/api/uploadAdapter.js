import { supabase } from '../../../lib/supabaseClient.js'

const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'xls', 'md', 'txt', 'doc', 'docx']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function validateFile(file) {
  if (!file) return { valid: false, error: 'No se seleccionó archivo' }
  const ext = file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Formato no soportado: .${ext}. Formatos válidos: PDF, Excel, DOC, DOCX, Markdown, TXT.`,
    }
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el límite de ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`,
    }
  }
  return { valid: true }
}

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'pdf') {
    return await extractPdfText(file)
  }
  if (['xlsx', 'xls'].includes(ext)) {
    return await extractExcelText(file)
  }
  if (['doc', 'docx'].includes(ext)) {
    return await extractDocText(file)
  }
  if (['md', 'txt'].includes(ext)) {
    return await file.text()
  }

  return await file.text()
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = () => reject(new Error(`No se pudo cargar: ${src}`))
    document.head.appendChild(s)
  })
}

async function extractPdfText(file) {
  const PDF_VERSION = '3.11.174'
  await loadScript(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_VERSION}/pdf.min.js`)
  const pdfjsLib = window.pdfjsLib
  if (!pdfjsLib) throw new Error('No se pudo cargar el parser de PDF')

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_VERSION}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item) => item.str).join(' ')
    pages.push(pageText)
  }

  return pages.join('\n\n')
}

async function extractExcelText(file) {
  const XLSX = await import('xlsx')
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const texts = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    if (csv.trim()) {
      texts.push(`--- Hoja: ${sheetName} ---\n${csv}`)
    }
  }

  return texts.join('\n\n')
}

async function extractDocText(file) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js')
  if (!window.mammoth) throw new Error('No se pudo cargar el parser de DOC')

  const arrayBuffer = await file.arrayBuffer()
  const result = await window.mammoth.extractRawText({ arrayBuffer })
  return result.value || ''
}

export async function uploadToStorage(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `planificacion-uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from('planificacion-docs')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Error al subir archivo: ${error.message}`)
  return path
}

export async function parseWithAI(extractedText) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token

  if (!token) throw new Error('Sesión no válida. Iniciá sesión nuevamente.')

  const response = await fetch(`${supabaseUrl}/functions/v1/groq-proxy/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      parseMode: 'curriculum',
      content: extractedText,
    }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error(errBody.error || `Error del servidor de IA: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('La IA no devolvió contenido.')

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('La IA devolvió JSON inválido. Intentá con otro documento.')
  }

  return validateHierarchy(parsed)
}

function validateHierarchy(data) {
  if (!data || typeof data !== 'object') throw new Error('Respuesta inválida: no es un objeto')
  if (!data.route || !data.levels) {
    throw new Error('Estructura incompleta: faltan "route" o "levels"')
  }
  if (!Array.isArray(data.levels) || data.levels.length === 0) {
    throw new Error('Debe haber al menos un nivel en la estructura')
  }

  for (const level of data.levels) {
    if (!level.nombre) throw new Error('Cada nivel debe tener un "nombre"')
    if (!Array.isArray(level.nodes) || level.nodes.length === 0) {
      throw new Error(`El nivel "${level.nombre}" debe tener al menos un nodo`)
    }
    for (const node of level.nodes) {
      if (!node.nombre) throw new Error('Cada nodo debe tener un "nombre"')
      if (!Array.isArray(node.objetivos) || node.objetivos.length === 0) {
        throw new Error(`El nodo "${node.nombre}" debe tener al menos un objetivo`)
      }
      for (const obj of node.objetivos) {
        if (!obj.descripcion) throw new Error('Cada objetivo debe tener una "descripcion"')
        if (!Array.isArray(obj.indicadores)) obj.indicadores = []
      }
    }
  }

  return data
}
