import { supabase } from '../../../lib/supabaseClient.js'

const EDGE_FUNCTION_NAME = 'maestro-credentials'
const EDGE_FUNCTION_DEPLOY_GUIDANCE =
  'La Edge Function maestro-credentials no está desplegada o no es accesible en este proyecto. Debes aplicar la migración de credenciales y desplegar la función en Supabase.'

function normalizeMaestroCredentialsError(error, action) {
  const rawMessage = String(error?.message || error || '').trim()
  const lowerMessage = rawMessage.toLowerCase()

  if (
    lowerMessage.includes('failed to send a request to the edge function') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('network request failed')
  ) {
    return new Error(EDGE_FUNCTION_DEPLOY_GUIDANCE)
  }

  if (lowerMessage.includes('non-2xx status code')) {
    return new Error(
      `La Edge Function ${EDGE_FUNCTION_NAME} respondió con error al ${action}. Revisa los logs remotos de Supabase y la configuración de MAESTRO_CREDENTIALS_SECRET.`,
    )
  }

  return new Error(rawMessage || 'No se pudo procesar las credenciales del maestro')
}

async function invokeMaestroCredentials(action, maestroId) {
  if (!maestroId) {
    throw new Error('El maestroId es obligatorio')
  }

  let response
  try {
    response = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { action, maestroId },
    })
  } catch (error) {
    throw normalizeMaestroCredentialsError(error, action)
  }

  const { data, error } = response || {}

  if (error) {
    throw normalizeMaestroCredentialsError(error, action)
  }

  if (data?.ok === false) {
    throw new Error(data.error || 'No se pudo procesar las credenciales del maestro')
  }

  return data
}

export async function obtenerEstadoCredencialesMaestro(maestroId) {
  return invokeMaestroCredentials('status', maestroId)
}

export async function revelarCredencialesMaestro(maestroId) {
  return invokeMaestroCredentials('reveal', maestroId)
}

export async function generarCredencialesMaestro(maestroId) {
  return invokeMaestroCredentials('generate', maestroId)
}
