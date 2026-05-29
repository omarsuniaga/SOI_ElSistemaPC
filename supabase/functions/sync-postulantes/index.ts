import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-api-key, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSllLwP-2-O1yFvjHVy-rpUP6mY469R5XtMQxr0o9DX446jfIdAZuz-Ppxqaofn0vApf8FrPT8KJ7P7/pub?gid=1036949263&single=true&output=csv'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
)

function splitCSVRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n')
  if (lines.length < 2) return []
  const headers = splitCSVRow(lines[0])
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = splitCSVRow(line)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim()
    })
    rows.push(row)
  }
  return rows
}

function parseDate(str: string): string | null {
  if (!str) return null
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  const [, d, m, y] = match
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function normalizeYN(str: string): boolean | null {
  const s = (str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (
    s.startsWith('si') ||
    s.startsWith('sí') ||
    s === 'hare lo posible' ||
    s === 'haré lo posible'
  )
    return true
  if (s.startsWith('no')) return false
  return null
}

function mapRepresentante(str: string): string {
  const s = (str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (s.includes('ambos') || s.includes('ambas')) return 'ambos'
  if (s.includes('madre')) return 'madre'
  if (s.includes('padre')) return 'padre'
  return str?.trim() ?? ''
}

function parseTimestamp(str: string): string | null {
  if (!str) return null
  // Expected format: DD/MM/YYYY HH:MM:SS or D/M/YYYY H:MM:SS (Dominican locale)
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (match) {
    const [, d, m, y, h, min, s] = match
    const dt = new Date(+y, +m - 1, +d, +h, +min, s ? +s : 0)
    return isNaN(dt.getTime()) ? null : dt.toISOString()
  }
  // Also handle rows where timestamp is just a date (no time)
  const dateMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dateMatch) {
    const [, d, m, y] = dateMatch
    const dt = new Date(+y, +m - 1, +d)
    return isNaN(dt.getTime()) ? null : dt.toISOString()
  }
  // Fallback: let JS try (ISO format, US format, etc.)
  const dt = new Date(str)
  return isNaN(dt.getTime()) ? null : dt.toISOString()
}

function mapRowToPostulante(row: Record<string, string>) {
  const aceptaPago = normalizeYN(
    row['¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?'],
  )
  const autorizaFotos = normalizeYN(
    row[
      '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?'
    ],
  )

  return {
    nombre_completo: row['Nombre del Alumno'] ?? '',
    fecha_nacimiento: parseDate(row['Fecha de Nacimiento del Alumno']),
    telefono_alumno: row['Número de teléfono del alumno'] ?? '',
    correo: row['Dirección de correo electrónico'] ?? '',
    nacionalidad: row['Nacionalidad'] ?? '',
    sector_calle_numero: row['Dirección completa del alumno'] ?? '',
    madre_nombre: row['¿Cuál es el nombre completo de la madre?'] ?? '',
    madre_tlf_whatsapp: row['¿Numero telefónico de ambos padres?'] ?? '',
    padre_nombre: row['¿Cuál es el nombre completo del padre?'] ?? '',
    padre_tlf_whatsapp: row['Telefono opcional'] ?? '',
    representante_parentesco: mapRepresentante(row['¿Quién sera su representante legal?']),
    acepta_pago_600: aceptaPago ?? false,
    autoriza_fotos_redes: autorizaFotos ?? false,
    religion_limita:
      normalizeYN(
        row[
          '¿La religión del alumno limita participar en actividades (ensayos, conciertos, viajes)?'
        ],
      ) ?? false,
    disponibilidad_tiempo:
      row['¿Cuál es la disponibilidad de tiempo del alumno para asistir a clases?'] ?? '',
    tiene_transporte:
      normalizeYN(row['¿El alumno tiene medios de transporte para asistir a las clases?']) ?? false,
    representantes_apoyan:
      normalizeYN(
        row[
          '¿Los representantes están dispuestos a apoyar al alumno en cuanto a promover el estudio en casa, llevarlo o apoyarlo a asistir a las actividades (ensayos, masterclass, conciertos)?'
        ],
      ) ?? false,
    copia_cedula:
      normalizeYN(
        row['¿Está dispuesto a proporcionar copia de la cédula del alumno y representante?'],
      ) ?? false,
    fecha_postulacion: parseTimestamp(row['Marca temporal']),
    sincronizado_en: new Date().toISOString(),
  }
}

async function isAuthorized(req: Request): Promise<boolean> {
  // Apps Script: x-api-key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey && apiKey === Deno.env.get('SYNC_API_KEY')) return true

  // PWA: Supabase JWT (admin only)
  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)
    if (!error && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()
      if (profile?.rol === 'admin' || profile?.rol === 'maestro') return true
    }
  }

  return false
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    status,
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  if (!(await isAuthorized(req))) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    console.log('[sync-postulantes] Fetching CSV from Google Sheet...')
    const res = await fetch(SHEET_CSV_URL)
    if (!res.ok) {
      throw new Error(`Failed to fetch sheet: ${res.status}`)
    }
    const text = await res.text()

    const rows = parseCSV(text)
    console.log(`[sync-postulantes] Parsed ${rows.length} rows from CSV`)

    let upserted = 0
    let errors = 0

    for (const row of rows) {
      const postulante = mapRowToPostulante(row)
      if (!postulante.nombre_completo) continue

      const { error } = await supabase.from('postulantes').upsert(postulante, {
        onConflict: 'correo,nombre_completo',
        ignoreDuplicates: false,
      })

      if (error) {
        console.error('[sync-postulantes] Upsert error:', error.message)
        errors++
      } else {
        upserted++
      }
    }

    console.log(`[sync-postulantes] Done. ${upserted} upserted, ${errors} errors`)

    return jsonResponse({
      status: 'success',
      total_rows: rows.length,
      upserted,
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[sync-postulantes] Fatal error:', err)
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})
