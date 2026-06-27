/**
 * Supabase Edge Function: hermes-crear-cita
 *
 * Hermes agenda una cita de inscripción para un postulante. La función:
 *   1. Resuelve el postulante (por id o por teléfono).
 *   2. Verifica que el slot no choque con otra cita (±30 min).
 *   3. Setea postulantes.fecha_cita + estado='cita_agendada'.
 *   4. Crea el evento en calendario_institucional (categoría inscripcion, depto ADM).
 * La cita aparece en el Calendario de Citas de ADM (lee postulantes.fecha_cita).
 *
 * Auth: header `x-hermes-token: <HERMES_EMAIL_TOKEN>`.
 * Body: { "fecha_cita": "2026-07-10T14:00:00Z", "postulante_id"?: "...", "telefono"?: "809..." }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const HERMES_TOKEN = Deno.env.get('HERMES_EMAIL_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hermes-token',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

const soloDigitos = (s: string) => String(s || '').replace(/\D/g, '')
const nombreAlumno = (p: any) => p.nombre_completo || 'Postulante'
const nombreRepre = (p: any) => p.madre_nombre || p.padre_nombre || p.representante_parentesco || 'Representante'
const telefonoDe = (p: any) => p.madre_tlf_whatsapp || p.padre_tlf_whatsapp || p.telefono_alumno || null

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)
  if (!HERMES_TOKEN || req.headers.get('x-hermes-token') !== HERMES_TOKEN)
    return json({ error: 'No autorizado' }, 401)

  let body: { fecha_cita?: string; postulante_id?: string; telefono?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const fechaCita = (body.fecha_cita || '').trim()
  if (!fechaCita || isNaN(Date.parse(fechaCita)))
    return json({ error: 'Falta "fecha_cita" (ISO válida)' }, 400)

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE)

  // 1) Resolver postulante por id o por teléfono.
  let postulante: any = null
  if (body.postulante_id) {
    const { data } = await sb.from('postulantes').select('*').eq('id', body.postulante_id).maybeSingle()
    postulante = data
  } else if (body.telefono) {
    const tel = soloDigitos(body.telefono).slice(-10) // últimos 10 dígitos
    const { data } = await sb
      .from('postulantes')
      .select('*')
      .or(`madre_tlf_whatsapp.ilike.%${tel},padre_tlf_whatsapp.ilike.%${tel},telefono_alumno.ilike.%${tel}`)
      .limit(1)
    postulante = data?.[0] || null
  }
  if (!postulante) return json({ error: 'Postulante no encontrado (usá postulante_id o telefono)' }, 404)

  // 2) Verificar choque ±30 min con otras citas.
  const ini = new Date(new Date(fechaCita).getTime() - 30 * 60 * 1000).toISOString()
  const fin = new Date(new Date(fechaCita).getTime() + 30 * 60 * 1000).toISOString()
  const { data: choques } = await sb
    .from('postulantes')
    .select('id, nombre_completo, fecha_cita')
    .gte('fecha_cita', ini)
    .lte('fecha_cita', fin)
    .not('fecha_cita', 'is', null)
    .neq('id', postulante.id)
  if (choques && choques.length > 0) {
    return json({ ok: false, conflicto: true, choca_con: choques }, 409)
  }

  // 3) Setear fecha_cita + estado.
  const { error: upErr } = await sb
    .from('postulantes')
    .update({ fecha_cita: fechaCita, estado: 'cita_agendada' })
    .eq('id', postulante.id)
  if (upErr) return json({ error: `No se pudo agendar: ${upErr.message}` }, 500)

  // 4) Crear evento en calendario_institucional (mismo shape que el webhook).
  const fechaFin = new Date(new Date(fechaCita).getTime() + 30 * 60 * 1000).toISOString()
  const tel = telefonoDe(postulante)
  await sb.from('calendario_institucional').insert({
    titulo: `Inscripción: ${nombreAlumno(postulante)} - ${nombreRepre(postulante)}`,
    descripcion: `Cita de inscripción para ${nombreAlumno(postulante)}. Contacto: ${tel || 's/n'}`,
    categoria: 'inscripcion',
    fecha_inicio: fechaCita,
    fecha_fin: fechaFin,
    departamento_responsable: 'ADM',
    metadata: { postulante_id: postulante.id, telefono_contacto: tel, tipo: 'cita_inscripcion', origen: 'hermes' },
    estado: 'programado',
  })

  return json({
    ok: true,
    cita: {
      postulante_id: postulante.id,
      nombre: nombreAlumno(postulante),
      representante: nombreRepre(postulante),
      fecha_cita: fechaCita,
    },
  })
})
