/**
 * comunicacionesApi.js — Dispatcher: enruta a mock o supabase según VITE_USE_MOCK.
 * El asistente IA (GROQ) se expone aquí reutilizando el groqService existente.
 */

import * as mock from './comunicacionesMock.js'
import * as real from './comunicacionesSupabase.js'
import { callGroq } from '../../../portal-maestros/services/groqService.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const getContactos = api.getContactos
export const getPlantillas = api.getPlantillas
export const guardarPlantilla = api.guardarPlantilla
export const eliminarPlantilla = api.eliminarPlantilla
export const enviarCorreo = api.enviarCorreo

const SYSTEM_PROMPT = `Eres el asistente de redacción del Departamento de Comunicaciones de
"El Sistema Punta Cana", una fundación de educación musical para jóvenes de bajos recursos.
Mejorás mensajes institucionales dirigidos a representantes/familias de alumnos.
Reglas:
- Tono cálido, cercano y respetuoso, pero profesional e institucional.
- Español neutro dominicano. Claro y conciso.
- Conservá las variables entre llaves como {nombre_alumno}, {representante}, {instrumento}, {seccion} EXACTAMENTE como están.
- No inventes datos (fechas, lugares, montos) que no estén en el texto original.
- Devolvé SOLO el mensaje mejorado, sin explicaciones ni comillas.`

/**
 * Mejora la redacción de un mensaje con IA (GROQ).
 * @param {string} texto
 * @param {string} [instruccion] — ajuste opcional ("más formal", "más corto", etc.)
 * @returns {Promise<string>}
 */
export async function mejorarConIA(texto, instruccion = '') {
  const userContent = instruccion
    ? `Instrucción adicional: ${instruccion}\n\nMensaje a mejorar:\n${texto}`
    : `Mensaje a mejorar:\n${texto}`

  const respuesta = await callGroq([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ])

  // callGroq puede devolver string o un objeto con .content según el proxy.
  if (typeof respuesta === 'string') return respuesta.trim()
  if (respuesta && typeof respuesta.content === 'string') return respuesta.content.trim()
  return String(respuesta || '').trim()
}
