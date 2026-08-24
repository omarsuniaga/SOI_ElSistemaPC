const REQUIRED_LABELS = [
  'medidor',
  'fecha del balance',
  'balance',
  'lectura',
  'suspension al llegar a',
  'fecha aproximada de corte',
]

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => String.fromCodePoint(
      code[0].toLowerCase() === 'x' ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10),
    ))
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
}

function text(value) {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function label(value) {
  return value.replace(/\*+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function parseQuantity(value, fieldName) {
  const match = value.trim().match(/^([+-]?(?:\d{1,3}(?:,\d{3})*|\d+)(?:[.,]\d+)?)\s*kwh$/i)
  if (!match) throw new Error(`CEPM markup changed: invalid ${fieldName} quantity`)
  const numberText = match[1]
  const normalized = numberText.includes(',') && numberText.includes('.')
    ? numberText.replace(/,/g, '')
    : numberText.replace(',', '.')
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) throw new Error(`CEPM markup changed: invalid ${fieldName} quantity`)
  return parsed
}

function parseDominicanDate(value, fieldName) {
  const match = value.trim().match(/^(?:(\d{1,2})-([A-Za-z]{3})-(\d{2,4})|(\d{4})-([A-Za-z]{3})-(\d{1,2}))\s+(\d{1,2}):(\d{2})$/)
  if (!match) throw new Error(`CEPM markup changed: invalid ${fieldName} date`)
  const [, dayFirst, monthFirst, yearFirst, yearLast, monthLast, dayLast, hourText, minuteText] = match
  const dayText = dayFirst || dayLast
  const monthText = monthFirst || monthLast
  const yearText = yearFirst || yearLast
  const month = MONTHS[monthText.toLowerCase()]
  const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (month === undefined || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error(`CEPM markup changed: invalid ${fieldName} date`)
  }
  const iso = `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-04:00`
  if (Number.isNaN(Date.parse(iso))) throw new Error(`CEPM markup changed: invalid ${fieldName} date`)
  return iso
}

export function isValidCepmMeter(meter) {
  return typeof meter === 'string' && /^[A-Za-z0-9]{4,32}$/.test(meter)
}

export function parseCepmPublicBalance(html, expectedMeter) {
  if (typeof html !== 'string' || html.length === 0 || html.length > 256_000) throw new Error('CEPM returned an invalid response')
  if (!isValidCepmMeter(expectedMeter)) throw new Error('Invalid CEPM meter reference')
  if (!/id=["']gv["']/i.test(html)) throw new Error('CEPM did not return the expected balance table')
  if (/no se encontr|error de consulta|medidor invalido/i.test(text(html))) throw new Error('CEPM rejected the meter query')

  const fields = new Map()
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => text(cell[1]))
    if (cells.length === 2) fields.set(label(cells[0]), cells[1])
  }
  for (const required of REQUIRED_LABELS) {
    if (!fields.has(required)) throw new Error(`CEPM markup changed: missing ${required}`)
  }

  const meter = fields.get('medidor')
  if (meter !== expectedMeter) throw new Error('CEPM response meter does not match the requested account')
  const balanceDateRaw = fields.get('fecha del balance')
  const cutoffDateRaw = fields.get('fecha aproximada de corte')
  const balanceRaw = fields.get('balance')
  const readingRaw = fields.get('lectura')
  const suspensionRaw = fields.get('suspension al llegar a')

  return {
    observedAt: parseDominicanDate(balanceDateRaw, 'balance'),
    cutoffAt: parseDominicanDate(cutoffDateRaw, 'cutoff'),
    balanceKwh: parseQuantity(balanceRaw, 'balance'),
    readingKwh: parseQuantity(readingRaw, 'reading'),
    suspensionThresholdKwh: parseQuantity(suspensionRaw, 'suspension threshold'),
    sourceSummary: {
      schema: 'cepm-public-balance-v1',
      meter,
      balanceDateRaw,
      cutoffDateRaw,
      balanceRaw,
      readingRaw,
      suspensionRaw,
    },
  }
}
