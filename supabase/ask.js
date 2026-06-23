#!/usr/bin/env node
/**
 * ask.js - Natural language -> Supabase query via LLM
 * Prioritizes Groq (Llama-3.3) for high availability, falling back to Gemini 2.5 Flash if needed.
 *
 * Usage: node supabase/ask.js "<pregunta en lenguaje natural>"
 * Requires OPENAI_API_KEY (Groq) or GEMINI_API_KEY in environment
 */

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const GROQ_API_KEY = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GROQ_API_KEY && !GEMINI_API_KEY) {
  console.error('Error: Neither OPENAI_API_KEY (Groq) nor GEMINI_API_KEY was found in environment variables.')
  process.exit(1)
}

const args = process.argv.slice(2)
const query = args.join(' ').trim()

if (!query) {
  console.log('Uso: node supabase/ask.js "<pregunta en lenguaje natural>"')
  process.exit(0)
}

const SCHEMA_PROMPT = `You are an expert database programmer for a music school management system. Write raw Node.js code (no wrappers, no markdown fences) that queries a Supabase database to answer the question below. The client is the global variable supabase. Helper getDateRange is pre-defined at runtime.

## SCHEMA

- alumnos: id(uuid), nombre_completo, instrumento_principal, nivel_actual, fecha_ingreso(date), representante_nombre, representante_tlf, correo_representante, activo(bool), nivel
- maestros: id(uuid), nombre_completo, especialidad, tipo_maestro, activo(bool), tlf, correo, puede_ser_suplente(bool), es_admin(bool)
- clases: id(uuid), nombre, estado, maestro_principal_id->maestros.id, maestro_suplente_id->maestros.id, tipo_clase, instrumento, activo(bool), capacity_maxima, whatsapp_group_jid
- salones: id(uuid), nombre, ubicacion, activo, capacidad, codigo_salon
- clase_horarios: id(uuid), clase_id->clases.id, dia(Lunes/Martes/Miercoles/Jueves/Viernes/Sabado), hora_inicio, hora_fin, salon_id->salones.id, maestro_id->maestros.id
- sesiones_clase: id(uuid), clase_id->clases.id, fecha(date), maestro_id->maestros.id, salon_id->salones.id, estado, periodo_id->periodos.id
- asistencias: id(uuid), sesion_clase_id->sesiones_clase.id, clase_id->clases.id, alumno_id->alumnos.id, fecha(date), estado(presente/ausente/tarde/justificado), observaciones, periodo_id->periodos.id
- alumnos_clases: id(uuid), alumno_id->alumnos.id, clase_id->clases.id, fecha_inscripcion(date), activo(bool)
- solicitudes_ausencia: id(uuid), maestro_id->maestros.id, fecha_ausencia(date), motivo, suplente_id->maestros.id, estado(aprobada/pendiente)
- periodos: id(uuid), nombre, fecha_inicio(date), fecha_fin(date), activo(bool)

## HELPERS

getDateRange(type, offset=0) returns {start, end} as YYYY-MM-DD
  type: week or month or today    offset: 0=current -1=last 1=next

## RULES

1. Dates: use getDateRange. Last week=getDateRange(week,-1). This month=getDateRange(month,0).
2. Attendance: filter asistencias.fecha directly. NEVER chain clases to sesiones_clase to asistencias.
3. Joins: embedded select .select(alumno_id, alumnos(nombre_completo)) not sequential awaits.
4. Distinct count: new Set(data.map(r=>r.alumno_id)).size
5. IDs are UUIDs, never parseInt().
6. Names: .ilike(nombre_completo, percent+name+percent)
7. Active: .eq(activo,true) on alumnos/clases/maestros unless asked for all.
8. Output arrays/objects: JSON.stringify(result,null,2). Single values: plain string.
9. Errors: if(error){console.error(error.message);return}
10. No imports, no wrappers, raw awaitable statements only.

## EXAMPLES

Q: Cuantos alumnos asistieron la semana pasada?
const {start,end}=getDateRange(week,-1)
const {data,error}=await supabase.from(asistencias).select(alumno_id).eq(estado,presente).gte(fecha,start).lte(fecha,end)
if(error){console.error(error.message);return}
console.log(new Set(data.map(r=>r.alumno_id)).size+alumnos entre+start+y+end)

Q: Que clases tienen mas inasistencias este mes?
const {start,end}=getDateRange(month,0)
const {data,error}=await supabase.from(asistencias).select(clase_id,estado,clases(nombre)).gte(fecha,start).lte(fecha,end)
if(error){console.error(error.message);return}
const byC={}
for(const r of data){if(!byC[r.clase_id])byC[r.clase_id]={n:r.clases?.nombre,t:0,a:0};byC[r.clase_id].t++;if(r.estado===ausente||r.estado===tarde)byC[r.clase_id].a++}
console.log(JSON.stringify(Object.values(byC).sort((a,b)=>b.a-a.a).map(c=>({clase:c.n,ausentes:c.a})),null,2))

Q: Que maestros tienen clases los sabados?
const {data,error}=await supabase.from(clase_horarios).select(hora_inicio,hora_fin,maestros(nombre_completo),clases(nombre),salones(nombre)).eq(dia,Sabado)
if(error){console.error(error.message);return}
console.log(JSON.stringify(data,null,2))

Question: ${query}`

async function askLLM(prompt) {
  // 1. Try Groq (Llama-3.3-70b) first for speed and reliable uptime
  if (GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SCHEMA_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      })

      if (res.ok) {
        const data = await res.json()
        let code = data.choices?.[0]?.message?.content?.trim()
        if (code) {
          code = code.replace(/^```(?:javascript|js)?\n?/m, '').replace(/\n?```$/m, '').trim()
          return { provider: 'Groq (Llama-3.3)', code }
        }
      } else {
        const err = await res.text()
        console.warn(`[Groq warning] Status ${res.status}: ${err}`)
      }
    } catch (err) {
      console.warn(`[Groq warning] Fetch failed: ${err.message}`)
    }
  }

  // 2. Fall back to Gemini 2.5 Flash if Groq fails or is not configured
  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${SCHEMA_PROMPT}\n\nQuestion: ${prompt}` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
        })
      })

      if (res.ok) {
        const data = await res.json()
        let code = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        if (code) {
          code = code.replace(/^```(?:javascript|js)?\n?/m, '').replace(/\n?```$/m, '').trim()
          return { provider: 'Gemini 2.5 Flash', code }
        }
      } else {
        const err = await res.text()
        console.warn(`[Gemini warning] Status ${res.status}: ${err}`)
      }
    } catch (err) {
      console.warn(`[Gemini warning] Fetch failed: ${err.message}`)
    }
  }

  throw new Error('All configured LLM providers (Groq and Gemini) failed to translate the query.')
}

async function main() {
  try {
    console.log(`Traduciendo: "${query}"...`)
    const result = await askLLM(query)
    console.log(`📡 Traducido con éxito usando ${result.provider}`)

    const tempDir = path.join(__dirname, '.temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const tempFile = path.join(tempDir, 'run-query.js')
    fs.writeFileSync(tempFile, [
      "import { createClient } from '@supabase/supabase-js'",
      "import dotenv from 'dotenv'",
      "import path from 'path'",
      "import { fileURLToPath } from 'url'",
      "const __dirname = path.dirname(fileURLToPath(import.meta.url))",
      "dotenv.config({ path: path.join(__dirname, '../../.env.local') })",
      "dotenv.config({ path: path.join(__dirname, '../../.env') })",
      "const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)",
      "function getDateRange(t,o=0){const n=new Date();if(t==='week'){const w=n.getDay()||7,m=new Date(n);m.setDate(n.getDate()-w+1+o*7);const e=new Date(m);e.setDate(m.getDate()+6);return{start:m.toISOString().slice(0,10),end:e.toISOString().slice(0,10)}}if(t==='month'){const d=new Date(n.getFullYear(),n.getMonth()+o,1),l=new Date(d.getFullYear(),d.getMonth()+1,0);return{start:d.toISOString().slice(0,10),end:l.toISOString().slice(0,10)}}if(t==='today'){const d=n.toISOString().slice(0,10);return{start:d,end:d}}}",
      "async function run() { try {",
      result.code,
      "} catch(e){ console.error('Query error:', e.message) } }",
      "run()"
    ].join('\n'), { encoding: 'utf-8' })

    console.log('\nCodigo generado:\n' + result.code)

    const output = execSync(`node ${tempFile}`, { encoding: 'utf-8' })
    console.log('\nRespuesta:\n' + output)

    // Persist results
    try {
      fs.writeFileSync(path.join(__dirname, 'query-results.txt'), output, 'utf-8')
      const cleaned = output.replace(/^[^[{]*/s, '').trim()
      if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
        const json = JSON.parse(cleaned)
        fs.writeFileSync(path.join(__dirname, 'query-results.json'), JSON.stringify(json, null, 2), 'utf-8')
      }
    } catch (_) {}

    try { fs.unlinkSync(tempFile) } catch (_) {}

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
