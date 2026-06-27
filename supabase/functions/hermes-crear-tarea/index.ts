/**
 * Supabase Edge Function: hermes-crear-tarea
 *
 * Hermes (Telegram) manda una solicitud en TEXTO LIBRE. La función:
 *   1. Clasifica el DEPARTAMENTO + resume la tarea con GROQ (server-side).
 *   2. Inserta la tarea en `tareas_institucionales` (service_role).
 * La tarea aparece automáticamente en el portal del departamento (tareasView.js) y,
 * si es alta/critica, dispara el aviso de WhatsApp (trigger fn_trigger_hermes_task_wa_alert).
 *
 * Auth: header `x-hermes-token: <HERMES_EMAIL_TOKEN>` (token de máquina de Hermes).
 *
 * Body: { "texto": "necesito la relación de pago de febrero", "departamento"?: "FIN" }
 *   - `departamento` opcional fuerza el destino (salta la clasificación de depto).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''
const HERMES_TOKEN = Deno.env.get('HERMES_EMAIL_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const DEPTOS = ['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO']
const PRIOS = ['baja', 'media', 'alta', 'critica']

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hermes-token',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

const SYSTEM = `Sos el clasificador de solicitudes de "El Sistema Punta Cana". Dada una solicitud en
texto libre, identificá qué DEPARTAMENTO debe atenderla y resumí la tarea.
- DIR Dirección: decisiones ejecutivas, protocolo, alianzas, invitaciones.
- ACM Académica: clases, repertorio, ensayos, pedagogía, progresos.
- ADM Administración: inscripciones, datos de alumnos/maestros, personal, aprobaciones.
- FIN Financiero: pagos, cobros, presupuesto, relaciones de pago, viáticos, aranceles, facturas.
- LOG Logística: instrumentos, inventario, comodatos, transporte, montaje.
- COM Comunicaciones: difusión, prensa, redes, correos, piezas gráficas.
- TECNICO Técnico: sonido, escenario, soporte técnico, mantenimiento.
Devolvé SOLO un JSON: {"departamento":"FIN","titulo":"...","descripcion":"...","prioridad":"media","confianza":0.0}
con prioridad ∈ baja|media|alta|critica.`

async function clasificar(texto: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: texto },
      ],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `GROQ error ${res.status}`)
  let raw = (data.choices?.[0]?.message?.content || '').trim()
  raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const m = raw.match(/\{[\s\S]*\}/)
  const p = JSON.parse(m ? m[0] : raw)
  return {
    departamento: DEPTOS.includes(p.departamento) ? p.departamento : 'DIR',
    titulo: (p.titulo || 'Solicitud institucional').toString().trim(),
    descripcion: (p.descripcion || texto).toString().trim(),
    prioridad: PRIOS.includes(p.prioridad) ? p.prioridad : 'media',
    confianza: typeof p.confianza === 'number' ? p.confianza : 0.5,
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)
  if (!HERMES_TOKEN || req.headers.get('x-hermes-token') !== HERMES_TOKEN)
    return json({ error: 'No autorizado' }, 401)
  if (!GROQ_API_KEY) return json({ error: 'GROQ_API_KEY no configurada' }, 500)

  let body: { texto?: string; departamento?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }
  const texto = (body.texto || '').trim()
  if (!texto) return json({ error: 'Falta el campo "texto"' }, 400)

  let clasif
  try {
    clasif = await clasificar(texto)
  } catch (err) {
    return json({ error: `Clasificación falló: ${(err as Error).message}` }, 502)
  }

  // Override manual de departamento si vino en el body.
  if (body.departamento && DEPTOS.includes(body.departamento.toUpperCase())) {
    clasif.departamento = body.departamento.toUpperCase()
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE)
  const { data, error } = await sb
    .from('tareas_institucionales')
    .insert({
      titulo: clasif.titulo,
      descripcion: clasif.descripcion,
      departamento: clasif.departamento,
      estado: 'pendiente',
      prioridad: clasif.prioridad,
    })
    .select('id, titulo, departamento, prioridad, estado')
    .single()

  if (error) return json({ error: `No se pudo crear la tarea: ${error.message}` }, 500)

  return json({ ok: true, clasificacion: clasif, tarea: data })
})
