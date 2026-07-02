/**
 * clasificadorApi.js — Enrutamiento inteligente de solicitudes por departamento.
 *
 * Dada una solicitud en texto libre, GROQ identifica qué DEPARTAMENTO debe
 * atenderla y resume la tarea. Luego se crea en `tareas_institucionales`, que ya:
 *   - aparece en el portal del departamento (renderTareasView filtra por departamento)
 *   - dispara fn_trigger_hermes_task_wa_alert (aviso WhatsApp si alta/critica)
 *
 * La pieza nueva es SOLO la clasificación; el resto reutiliza la infraestructura.
 */

import { callGroq } from '../../../portal-maestros/services/groqService.js'
import * as tareasApi from './tareasApi.js'
import {
  buildSafeRejectionMessage,
  shouldBlockSensitiveMessage,
} from './whatsappSecurityGuard.js'

export const DEPARTAMENTOS_VALIDOS = ['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO']
export const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta', 'critica']

const SYSTEM_PROMPT = `Sos el clasificador de solicitudes institucionales de "El Sistema Punta Cana".
Dada una solicitud en texto libre, identificás qué DEPARTAMENTO debe atenderla y resumís la tarea.

Departamentos:
- DIR: Dirección — decisiones ejecutivas, protocolo, alianzas, invitaciones a autoridades.
- ACM: Académica — clases, repertorio, ensayos, pedagogía, progresos de alumnos.
- ADM: Administración — inscripciones, datos de alumnos/maestros, personal, aprobaciones.
- FIN: Financiero — pagos, cobros, presupuesto, RELACIONES DE PAGO, viáticos, aranceles, facturas.
- LOG: Logística — instrumentos, inventario, comodatos, transporte, montaje, sonido físico.
- COM: Comunicaciones — difusión, prensa, redes, correos institucionales, piezas gráficas.
- TECNICO: Técnico — sonido, escenario, soporte técnico, mantenimiento de equipos.

Devolvé SOLO un JSON válido (sin texto adicional, sin markdown) con esta forma EXACTA:
{"departamento":"FIN","titulo":"...","descripcion":"...","prioridad":"media","confianza":0.0}

Reglas:
- departamento ∈ DIR|ACM|ADM|FIN|LOG|COM|TECNICO (el más adecuado).
- titulo: imperativo y corto (máx ~8 palabras).
- descripcion: la solicitud completa, clara.
- prioridad ∈ baja|media|alta|critica (según urgencia evidente; ante la duda, media).
- confianza: número 0..1 de qué tan seguro estás del departamento.`

function parseJsonGroq(raw) {
  if (!raw) throw new Error('Respuesta vacía de la IA')
  let s = String(raw).trim()
  // Quitar fences de código si vinieran.
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  // Extraer el primer objeto JSON.
  const match = s.match(/\{[\s\S]*\}/)
  if (match) s = match[0]
  return JSON.parse(s)
}

/**
 * Clasifica un texto libre → departamento + resumen de tarea.
 * @param {string} texto
 * @returns {Promise<{departamento, titulo, descripcion, prioridad, confianza}>}
 */
export async function clasificarDepartamento(texto) {
  if (shouldBlockSensitiveMessage(texto)) {
    return {
      departamento: 'DIR',
      titulo: 'Solicitud bloqueada por seguridad',
      descripcion: buildSafeRejectionMessage(),
      prioridad: 'media',
      confianza: 1,
      bloqueada: true,
    }
  }

  const resp = await callGroq([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: texto },
  ])
  const raw = typeof resp === 'string' ? resp : resp?.content || ''
  const p = parseJsonGroq(raw)

  const departamento = DEPARTAMENTOS_VALIDOS.includes(p.departamento) ? p.departamento : 'DIR'
  const prioridad = PRIORIDADES_VALIDAS.includes(p.prioridad) ? p.prioridad : 'media'
  return {
    departamento,
    titulo: (p.titulo || 'Solicitud institucional').toString().trim(),
    descripcion: (p.descripcion || texto).toString().trim(),
    prioridad,
    confianza: typeof p.confianza === 'number' ? p.confianza : 0.5,
    bloqueada: false,
  }
}

/**
 * Clasifica + crea la tarea institucional. `overrides` permite confirmar/ajustar
 * lo que sugirió la IA antes de crear (departamento, prioridad, titulo, etc.).
 * @returns {Promise<{clasificacion, tarea}>}
 */
export async function crearTareaDesdeTexto(texto, overrides = {}) {
  const clasificacion = await clasificarDepartamento(texto)
  if (clasificacion.bloqueada) {
    return {
      clasificacion,
      tarea: null,
    }
  }
  const tarea = await tareasApi.crearTareaInstitucional({
    titulo: overrides.titulo || clasificacion.titulo,
    descripcion: overrides.descripcion || clasificacion.descripcion,
    departamento: overrides.departamento || clasificacion.departamento,
    prioridad: overrides.prioridad || clasificacion.prioridad,
    estado: 'pendiente',
    fecha_vencimiento: overrides.fecha_vencimiento || null,
  })
  return { clasificacion, tarea }
}
