import { supabase } from '../../../lib/supabaseClient.js'

async function invokeMaestroCredentials(action, maestroId) {
  if (!maestroId) {
    throw new Error('El maestroId es obligatorio')
  }

  const { data, error } = await supabase.functions.invoke('maestro-credentials', {
    body: { action, maestroId },
  })

  if (error) {
    throw new Error(error.message || 'No se pudo procesar las credenciales del maestro')
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
