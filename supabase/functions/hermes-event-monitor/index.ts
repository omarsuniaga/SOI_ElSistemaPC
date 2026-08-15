/**
 * Supabase Edge Function: hermes-event-monitor
 *
 * Monitorea la completitud de eventos institucionales con tareas delegadas por HERMES.
 * Cuando TODAS las tareas de un evento están en estado 'completada' o 'cancelada',
 * envía un email de alerta a DIR para que descargue el Acta de Cierre desde el portal.
 *
 * Invocado por pg_cron cada hora. También puede invocarse manualmente.
 *
 * Body (opcional):
 *   { "event_id": "uuid" }  → revisa solo ese evento
 *   { "check_all": true }   → revisa todos los eventos activos con tareas
 *
 * Auth: x-hermes-token (igual que hermes-crear-tarea)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const HERMES_TOKEN = Deno.env.get('HERMES_EMAIL_TOKEN') ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hermes-token',
}

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

interface EventoResumen {
  event_id: string
  titulo: string
  fecha_inicio: string
  total: number
  finalizadas: number
}

async function getEventosParaChequear(sb: ReturnType<typeof createClient>, eventId?: string): Promise<EventoResumen[]> {
  // Agrupamos tareas por event_id y calculamos % de completitud
  let query = sb
    .from('tareas_institucionales')
    .select('event_id, estado')
    .not('event_id', 'is', null)

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  const { data: tareas, error } = await query
  if (error || !tareas) return []

  // Agrupar por event_id
  const grupos: Record<string, { total: number; finalizadas: number }> = {}
  for (const t of tareas) {
    if (!t.event_id) continue
    if (!grupos[t.event_id]) grupos[t.event_id] = { total: 0, finalizadas: 0 }
    grupos[t.event_id].total++
    if (t.estado === 'completada' || t.estado === 'cancelada') {
      grupos[t.event_id].finalizadas++
    }
  }

  // Filtrar solo los que están al 100%
  const eventIds100 = Object.entries(grupos)
    .filter(([, g]) => g.total > 0 && g.total === g.finalizadas)
    .map(([id]) => id)

  if (eventIds100.length === 0) return []

  // Obtener info del evento
  const { data: eventos, error: errEvt } = await sb
    .from('calendario_institucional')
    .select('id, titulo, fecha_inicio, estado')
    .in('id', eventIds100)
    .neq('estado', 'cerrado') // No notificar eventos ya cerrados

  if (errEvt || !eventos) return []

  return eventos.map((e) => ({
    event_id: e.id,
    titulo: e.titulo,
    fecha_inicio: e.fecha_inicio,
    total: grupos[e.id]?.total ?? 0,
    finalizadas: grupos[e.id]?.finalizadas ?? 0,
  }))
}

async function notificarCierreEvento(
  sb: ReturnType<typeof createClient>,
  evento: EventoResumen,
): Promise<void> {
  const portalUrl = `${SUPABASE_URL.replace('supabase.co', 'vercel.app')}/hermes/tareas`
  const fechaFormateada = new Date(evento.fecha_inicio).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #14326e; color: white; padding: 24px;">
        <h1 style="margin: 0; font-size: 20px;">El Sistema Punta Cana</h1>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Sistema Operativo Institucional · HERMES</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #e8f5e9; border-left: 4px solid #2e7d32; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #2e7d32; font-size: 18px;">✅ Evento Completado al 100%</h2>
        </div>
        <p style="color: #333;">Todas las tareas del siguiente evento institucional han sido completadas:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px 12px; font-weight: bold; width: 40%;">Evento</td>
            <td style="padding: 8px 12px;">${evento.titulo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold;">Fecha del evento</td>
            <td style="padding: 8px 12px;">${fechaFormateada}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px 12px; font-weight: bold;">Tareas completadas</td>
            <td style="padding: 8px 12px; color: #2e7d32; font-weight: bold;">${evento.finalizadas} / ${evento.total}</td>
          </tr>
        </table>
        <p style="color: #555;">Como próximo paso, puede descargar el <strong>Acta Oficial de Cierre (PDF)</strong> desde el portal institucional:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${portalUrl}" style="background: #14326e; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
            📄 Ir al Portal · Descargar Acta PDF
          </a>
        </div>
        <p style="color: #888; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 12px; margin-top: 20px;">
          Este mensaje fue generado automáticamente por HERMES SOI · ${new Date().toLocaleString('es-DO')}
        </p>
      </div>
    </div>
  `

  // Llamar a la edge function send-email
  await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hermes-token': HERMES_TOKEN,
    },
    body: JSON.stringify({
      departamento: 'DIR',
      subject: `✅ ${evento.titulo} — todas las tareas completadas · Descargar Acta`,
      html,
    }),
  })

  // Marcar el evento como 'cerrado' en calendario para no renotificar
  await sb
    .from('calendario_institucional')
    .update({ estado: 'cerrado', updated_at: new Date().toISOString() })
    .eq('id', evento.event_id)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  // Auth: hermes token de máquina O JWT de Supabase (para llamadas desde pg_cron)
  const hermesToken = req.headers.get('x-hermes-token')
  const authHeader = req.headers.get('Authorization')
  const isHermesAuth = HERMES_TOKEN && hermesToken === HERMES_TOKEN
  const isSupabaseJWT = authHeader?.startsWith('Bearer ') ?? false
  if (!isHermesAuth && !isSupabaseJWT) {
    return json({ error: 'No autorizado' }, 401)
  }

  let body: { event_id?: string; check_all?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    body = { check_all: true }
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE)

  const eventos = await getEventosParaChequear(sb, body.event_id)

  if (eventos.length === 0) {
    return json({ ok: true, notificaciones: 0, message: 'No hay eventos completados al 100% pendientes de notificación.' })
  }

  const resultados: string[] = []
  for (const evento of eventos) {
    try {
      await notificarCierreEvento(sb, evento)
      resultados.push(`✅ ${evento.titulo}`)
    } catch (err) {
      resultados.push(`❌ ${evento.titulo}: ${(err as Error).message}`)
    }
  }

  return json({ ok: true, notificaciones: resultados.length, resultados })
})
