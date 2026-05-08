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