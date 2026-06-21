#!/usr/bin/env node

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1'

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY not found in environment variables.')
  process.exit(1)
}

const args = process.argv.slice(2)
const query = args.join(' ').trim()

if (!query) {
  console.log('Uso: node supabase/ask.js "<pregunta en lenguaje natural>"')
  process.exit(0)
}

const systemPrompt = `You are an expert database programmer. Your task is to write the body of a Node.js asynchronous function \`run()\` that queries a Supabase database to answer the user's question.

The database client is available as a global variable \`supabase\`.
The tables in the database are:
- \`alumnos\`:
  Columns: id, user_id, nombre_completo, fecha_nacimiento, instrumento_principal, nivel_actual, fecha_ingreso, representante_nombre, representante_tlf, correo_representante, activo (boolean), nivel, etc.
- \`maestros\`:
  Columns: id, user_id, nombre_completo, especialidad, tipo_maestro, activo (boolean), tlf, correo, puede_ser_suplente (boolean), es_admin (boolean), etc.
- \`clases\`:
  Columns: id, nombre, estado, maestro_principal_id, maestro_suplente_id, tipo_clase, instrumento, activo (boolean), capacity_maxima, salon, route_version_id, whatsapp_group_jid
- \`salones\`:
  Columns: id, nombre, ubicacion, activo, capacidad, codigo_salon, is_active
- \`clase_horarios\`:
  Columns: id, clase_id, dia (e.g. 'Lunes', 'Martes', 'Sabado'), hora_inicio, hora_fin, salon_id, maestro_id
- \`solicitudes_ausencia\`:
  Columns: id, maestro_id, fecha_ausencia (YYYY-MM-DD), motivo, suplente_id, estado ('aprobada', 'pendiente', etc.)
- \`asistencias\`:
  Columns: id, clase_id, alumno_id, fecha (YYYY-MM-DD), estado ('presente', 'ausente', 'justificado'), observaciones, registrado_por, marked_at

Rules:
1. Write ONLY the Javascript code that runs the query using \`supabase\` to answer the user's question.
2. Do NOT import supabase or create a client. It is already initialized.
3. Do NOT define any function wrapper (like \`async function run()\` or \`function query()\`). Write the query statements directly.
4. Do NOT include markdown code blocks (like \`\`\`javascript ... \`\`\`). Output ONLY the raw Javascript code.
5. Output should contain a way to format the results and print them. When printing array data, lists, objects, or multiple records, always use \`console.log(JSON.stringify(results, null, 2))\` so the output is printed as valid, parseable JSON. For simple counts or statements, a normal string is fine.
6. If the query requires counts, sum, grouping, or joins, write standard Javascript/Supabase queries. If the query gets multiple rows, print them nicely.
7. CRITICAL: The Supabase Javascript client does NOT support SQL aggregate methods like \`.group()\`, \`.having()\`, \`.sum()\`, or \`.count()\` directly on the query builder. To aggregate, group, or count records, query the raw rows (e.g. using \`supabase.from('asistencias').select('*')\`) and perform the aggregation, grouping, counting, and filtering in memory using Javascript (e.g., \`Array.reduce()\`, \`Array.filter()\`, maps, etc.).
8. CRITICAL: The Supabase Javascript builder does NOT support subqueries or nesting query objects inside filters (e.g. you cannot do \`.eq('maestro_id', supabase.from('maestros')...)\`). Instead, you must query sequentially using \`await\`: execute the first query (e.g. to find the teacher's ID by name), check if the data exists, get the ID from the results (e.g. \`const maestroId = teachers[0].id\`), and then pass that resolved ID into the next query.
9. CRITICAL: All ID fields (such as \`id\`, \`alumno_id\`, \`maestro_id\`, \`clase_id\`, etc.) are UUID strings. Do NOT use \`parseInt()\` or attempt to convert IDs to numbers; compare and treat them strictly as strings.
10. When looking up students or teachers, prefer matching names using case-insensitive comparisons (like \`.ilike('nombre_completo', '%name%')\`) or partial matches if applicable.
11. CRITICAL: Use the exact column names specified in the schema. For example, for the table 'alumnos', the column is 'nombre_completo' (do NOT use 'nombre'). For the table 'maestros', the column is 'nombre_completo' (do NOT use 'nombre').
12. Always check if 'activo' or 'is_active' is true when asked for active entities, unless the query asks for all.
13. Handle errors by logging them to \`console.error\`.
14. Keep it concise. Output ONLY the code to be inserted into the run() function body.

Example 1 (Basic query):
const { count, error } = await supabase.from('alumnos').select('*', { count: 'exact', head: true }).eq('activo', true);
if (error) {
  console.error('Error:', error.message);
} else {
  console.log(\`Tenemos \${count} alumnos activos.\`);
}

Example 2 (Sequential query):
const { data: maestros, error: mErr } = await supabase.from('maestros').select('id').ilike('nombre_completo', '%manuel marcano%').eq('activo', true).limit(1);
if (mErr) {
  console.error('Error finding maestro:', mErr.message);
} else if (!maestros || maestros.length === 0) {
  console.log('No se encontro al maestro Manuel Marcano.');
} else {
  const maestroId = maestros[0].id;
  const hoy = new Date().toISOString().split('T')[0];
  const { data: ausencias, error: aErr } = await supabase.from('solicitudes_ausencia').select('suplente_id').eq('maestro_id', maestroId).eq('fecha_ausencia', hoy).limit(1);
  if (aErr) {
    console.error('Error finding absence:', aErr.message);
  } else if (!ausencias || ausencias.length === 0) {
    console.log('No hay ausencias programadas hoy.');
  } else {
    // Process results...
  }
}
`

async function askLLM(prompt, question) {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
  let lastError = null

  for (const model of models) {
    try {
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: question }
          ],
          temperature: 0.1
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Groq API error (${response.status}): ${errText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content.trim()
    } catch (err) {
      lastError = err
      console.warn(`Warning: Model ${model} failed, trying next... Error: ${err.message}`)
    }
  }

  throw lastError
}

async function main() {
  try {
    console.log(`🤖 Traduciendo pregunta: "${query}"...`)
    let code = await askLLM(systemPrompt, query)

    // Clean up code if LLM outputted markdown block code
    if (code.startsWith('```')) {
      code = code.replace(/^```(javascript|js)?\n/, '').replace(/\n```$/, '')
    }

    const tempDir = path.join(__dirname, '.temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempFilePath = path.join(tempDir, 'run-query.js')

    const fileContent = `import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env.local') })
dotenv.config({ path: path.join(__dirname, '../../.env') })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  try {
    ${code}
  } catch (err) {
    console.error('Execution error inside generated query:', err.message)
  }
}
run()
`

    fs.writeFileSync(tempFilePath, fileContent, { encoding: 'utf-8' })

    console.log('\n💻 Código generado:')
    console.log(code)

    // Execute the temporary file and capture the output
    const output = execSync(`node ${tempFilePath}`, { encoding: 'utf-8' })
    console.log('\n📊 Respuesta:')
    console.log(output)

    // Save the output to files in the supabase folder
    try {
      const txtPath = path.join(__dirname, 'query-results.txt')
      fs.writeFileSync(txtPath, output, { encoding: 'utf-8' })
      
      // Clean output by removing environment loader info headers
      const cleaned = output.split('\n')
        .filter(line => !line.trim().startsWith('◇'))
        .join('\n')
        .trim();

      const startBracket = cleaned.indexOf('[');
      const startBrace = cleaned.indexOf('{');
      let jsonStr = '';
      if (startBracket !== -1 && (startBrace === -1 || startBracket < startBrace)) {
        jsonStr = cleaned.substring(startBracket, cleaned.lastIndexOf(']') + 1);
      } else if (startBrace !== -1) {
        jsonStr = cleaned.substring(startBrace, cleaned.lastIndexOf('}') + 1);
      }
      
      if (jsonStr) {
        const json = JSON.parse(jsonStr)
        const jsonPath = path.join(__dirname, 'query-results.json')
        fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), { encoding: 'utf-8' })
      }
    } catch (e) {
      // Ignore write/parse errors
    }

    // Clean up
    try {
      fs.unlinkSync(tempFilePath)
    } catch (e) {
      // Ignore cleanup error
    }

  } catch (err) {
    console.error('\n❌ Error al ejecutar consulta:', err.message)
    process.exit(1)
  }
}

main()
