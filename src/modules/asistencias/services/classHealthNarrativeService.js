/**
 * classHealthNarrativeService.js — Resúmenes por IA del informe de Salud de las Clases.
 *
 * Envía solo el contenido de sesiones ya registrado (observaciones) al proxy de
 * Groq. Las clases se identifican con ids posicionales (c0, c1, ...), nunca con
 * ids de base de datos. Nunca lanza: un lote fallido deja sus clases sin resumen.
 */

import { callGroq, parseGroqJSON } from '../../../portal-maestros/services/groqService.js'

const DEFAULT_BATCH_SIZE = 8
const DEFAULT_TIMEOUT_MS = 20000
const MAX_ENTRY_CHARS = 400
const MAX_NARRATIVE_CHARS = 600

const SYSTEM_PROMPT = [
  'Eres un asistente que redacta resúmenes pedagógicos breves en español neutro y profesional.',
  'Respondes ÚNICAMENTE con JSON válido, sin texto adicional.',
].join(' ')

function buildUserPrompt(batch, monthLabel) {
  const blocks = batch.map(({ id, clase }) => {
    const lines = clase.content.entries.map(
      (entry) => `${entry.date}: ${String(entry.text).slice(0, MAX_ENTRY_CHARS)}`,
    )
    return [
      `[${id}] Clase: ${clase.className}`,
      `Sesiones con contenido: ${clase.content.entries.length}`,
      ...lines,
    ].join('\n')
  })

  return [
    `Mes: ${monthLabel || 'Mes no indicado'}`,
    '',
    'Para cada clase, resume en 2 o 3 oraciones qué se trabajó durante el mes y cómo se distribuyó el enfoque.',
    'Usa ÚNICAMENTE el texto proporcionado; no inventes contenidos.',
    'No menciones nombres de alumnos.',
    'No evalúes ni juzgues al maestro ni a los alumnos.',
    'Responde ÚNICAMENTE con JSON con esta forma: {"resumenes":[{"id":"c0","resumen":"..."}]}',
    '',
    blocks.join('\n\n'),
  ].join('\n')
}

function withTimeout(promise, ms) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Narrative batch timed out')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

/**
 * @param {Array} classes Classes from buildClassHealthData (each with content.entries).
 * @returns {Promise<{ narratives: Array<string|null>, failed: number }>}
 */
export async function generateClassNarratives(
  classes,
  { monthLabel, callModel = callGroq, batchSize = DEFAULT_BATCH_SIZE, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  const narratives = classes.map(() => null)
  const pending = classes
    .map((clase, index) => ({ id: `c${index}`, index, clase }))
    .filter(({ clase }) => clase.content?.entries?.length > 0)

  let failed = 0

  for (let start = 0; start < pending.length; start += batchSize) {
    const batch = pending.slice(start, start + batchSize)
    const expectedIds = new Set(batch.map(({ id }) => id))

    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(batch, monthLabel) },
      ]
      const raw = await withTimeout(
        Promise.resolve().then(() => callModel(messages)),
        timeoutMs,
      )
      const parsed = parseGroqJSON(String(raw))
      const items = Array.isArray(parsed?.resumenes) ? parsed.resumenes : []

      for (const item of items) {
        if (!item || typeof item.id !== 'string' || !expectedIds.has(item.id)) continue
        if (typeof item.resumen !== 'string') continue
        const text = item.resumen.trim()
        if (!text) continue
        const { index } = batch.find(({ id }) => id === item.id)
        if (narratives[index] === null) {
          narratives[index] = text.slice(0, MAX_NARRATIVE_CHARS)
        }
      }
    } catch {
      // Swallowed on purpose: the batch's classes stay without narrative.
    }

    for (const { index } of batch) {
      if (narratives[index] === null) failed++
    }
  }

  return { narratives, failed }
}
