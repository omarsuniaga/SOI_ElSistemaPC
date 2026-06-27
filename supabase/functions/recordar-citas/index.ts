/**
 * Supabase Edge Function: recordar-citas
 *
 * Recordatorios D-1 para citas de inscripción.
 * Ejecutado diariamente por pg_cron vía net.http_post.
 *
 * Flujo:
 *   1. Busca postulantes con cita agendada para mañana
 *   2. Encola mensaje recordatorio en hermes_whatsapp_queue
 *   3. Actualiza conversación a ESPERANDO_CONFIRMACION_D1
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

function getClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

function resolverNombre(p: Record<string, unknown>): string {
  const representante = p.representante_nombre as string | undefined
  const madre = p.madre_nombre as string | undefined
  const padre = p.padre_nombre as string | undefined
  return representante || madre || padre || 'Representante'
}

function obtenerTelefono(p: Record<string, unknown>): string {
  return (p.madre_tlf_whatsapp ||
    p.padre_tlf_whatsapp ||
    p.telefono_alumno ||
    p.telefono_representante ||
    p.representante_tlf ||
    '') as string
}

function toJid(telefono: string): string | null {
  if (!telefono) return null
  const limpio = telefono.replace(/[^0-9]/g, '')
  if (limpio.length < 10) return null
  return `${limpio}@s.whatsapp.net`
}

function formatearHora(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const DOCS_REQUERIDOS = [
  'Cédula del representante',
  'Partida de nacimiento del alumno',
  'Constancia escolar',
  'Foto del alumno',
  'Documentos médicos (si aplica)',
]

function docsToList(): string {
  return DOCS_REQUERIDOS.map(d => `• ${d}`).join('\n')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método no permitido' }, 405)
  }

  const supabase = getClient()

  // ── 1. Calcular ventana de mañana ──────────────────────────────────────
  const ahora = new Date()
  const manana = new Date(ahora)
  manana.setDate(manana.getDate() + 1)
  const inicio = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0)
  const fin = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

  // ── 2. Buscar postulantes con cita mañana ──────────────────────────────
  const { data: postulantes, error: queryError } = await supabase
    .from('postulantes')
    .select('*')
    .eq('estado', 'cita_agendada')
    .gte('fecha_cita', inicio.toISOString())
    .lte('fecha_cita', fin.toISOString())

  if (queryError) {
    console.error('[recordar-citas] Error consultando postulantes:', queryError.message)
    return json({ ok: false, error: queryError.message }, 502)
  }

  // ── 3. Enviar recordatorios ────────────────────────────────────────────
  let enviados = 0
  const errores: string[] = []

  for (const p of postulantes || []) {
    try {
      const telefono = obtenerTelefono(p)
      const jid = toJid(telefono)
      if (!jid) {
        errores.push(`${p.id}: sin teléfono válido`)
        continue
      }

      const nombre = resolverNombre(p)
      const hora = p.fecha_cita
        ? formatearHora(p.fecha_cita as string)
        : 'la hora acordada'

      const mensaje = `Hola ${nombre}, le recordamos que mañana tiene una cita en *El Sistema Punta Cana* a las *${hora}*.\n\n*Requisitos:*\n${docsToList()}\n\n¿Confirma su asistencia?`

      // Upsert conversación
      const { error: upsertError } = await supabase
        .from('conversaciones_whatsapp')
        .upsert(
          {
            postulante_id: p.id,
            jid,
            estado_conversacion: 'esperando_confirmacion_d1',
            ultimo_mensaje_enviado: mensaje,
            ultimo_mensaje_recibido: null,
            ultima_intencion: null,
            reintentos: 0,
            fecha_cita_propuesta: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'postulante_id' },
        )

      if (upsertError) {
        errores.push(`${p.id}: upsert falló (${upsertError.message})`)
        continue
      }

      // Encolar mensaje
      const { error: queueError } = await supabase
        .from('hermes_whatsapp_queue')
        .insert({ jid, mensaje, estado: 'pendiente' })

      if (queueError) {
        errores.push(`${p.id}: encolar falló (${queueError.message})`)
        continue
      }

      enviados++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errores.push(`${p.id}: ${msg}`)
    }
  }

  // ── 4. Log resultado ──────────────────────────────────────────────────
  console.log(
    `[recordar-citas] OK enviados=${enviados}/${postulantes?.length ?? 0} errores=${errores.length}`,
  )

  return json({
    ok: true,
    total: postulantes?.length ?? 0,
    enviados,
    errores: errores.length > 0 ? errores : undefined,
  })
})
