import { supabase } from '../../../lib/supabaseClient.js'

const TABLE = 'system_config'

export async function getConfig(key) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('value')
    .eq('key', key)
    .single()

  if (error) {
    console.warn('Config not found:', key)
    return null
  }
  return data?.value
}

export async function setConfig(key, value) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) {
    console.error('Error saving config:', error)
    throw error
  }
  return { key, value }
}

export async function getGroqApiKey() {
  return getConfig('groq_api_key')
}

export async function setGroqApiKey(apiKey) {
  return setConfig('groq_api_key', apiKey)
}

export async function getOpenRouterApiKey() {
  return getConfig('openrouter_api_key')
}

export async function setOpenRouterApiKey(apiKey) {
  return setConfig('openrouter_api_key', apiKey)
}

export async function getPreferredModel() {
  return getConfig('preferred_ai_model')
}

export async function setPreferredModel(model) {
  return setConfig('preferred_ai_model', model)
}

// ── Documentos institucionales ─────────────────────────────────────────────

export const DOCS_KEYS = {
  URL_REGLAMENTO: 'url_reglamento',
  URL_HORARIO:    'url_horario',
  URL_BIENVENIDA: 'url_bienvenida',
}

/**
 * Returns all institutional document URLs in one call.
 * Missing keys return null.
 */
export async function getDocumentosInstitucionales() {
  const [reglamento, horario, bienvenida] = await Promise.all([
    getConfig(DOCS_KEYS.URL_REGLAMENTO),
    getConfig(DOCS_KEYS.URL_HORARIO),
    getConfig(DOCS_KEYS.URL_BIENVENIDA),
  ])
  return { reglamento, horario, bienvenida }
}

export async function setDocumentosInstitucionales({ reglamento, horario, bienvenida }) {
  const ops = []
  if (reglamento !== undefined) ops.push(setConfig(DOCS_KEYS.URL_REGLAMENTO, reglamento))
  if (horario    !== undefined) ops.push(setConfig(DOCS_KEYS.URL_HORARIO,    horario))
  if (bienvenida !== undefined) ops.push(setConfig(DOCS_KEYS.URL_BIENVENIDA, bienvenida))
  await Promise.all(ops)
}