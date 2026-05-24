import{i as e}from"./supabase-C4ics26R.js";var t={baseURL:`https://api.groq.com/openai/v1`,model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,temperature:.2},n=`
Eres un experto en escritura pedagógica y claridad profesional.
Tu tarea es MEJORAR el texto que recibes del maestro, enfocándose en:
1. Gramática y ortografía correctas
2. Claridad y concisión
3. Tono profesional pero accesible
4. Agregar perspectivas pedagógicas cuando sea relevante
5. Mantener la voz y estilo del maestro original

Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni cambios de significado.
`,r=`
Sos un experto en convertir observaciones de clase al formato DSL pedagógico.
Recibís una observación libre de un maestro de música.
Tu tarea es ESTRUCTURARLA usando los tokens DSL:

  #Nombre    = alumno mencionado
  [texto]    = contenido o indicador evaluado
  (texto)    = observación pedagógica / sugerencia de mejora
  {texto}    = tarea asignada para la próxima clase
  $término   = medida técnica (digitación, arco, respiración, etc.)
  N/5        = calificación numérica (ej: 4/5)

Reglas strictas:
- NO uses >CÓDIGO a menos que el maestro mencione explícitamente un código curricular
- Usa [indicador] para referenciar el contenido evaluado
- Si hay un indicador activo en la ruta, mencionalo en [ ]
- Las calificaciones van al FINAL de cada línea (ej: #María [Escalas] (buen trabajo) 5/5)
- Si el maestro no mencionó un alumno, agrupalo con #todos
- Solo usa los tokens que tengan contenido real — omití los que estén vacíos
- Respondé ÚNICAMENTE con el texto estructurado en DSL, sin explicaciones ni prefijos

MAL: "#María [Escalas] (mejoró) {practicar} 4/5 >CÓDIGO"
MAL: "#María >CÓDIGO"
BIEN: "#María [Escalas] (mejoró notablemente en la ejecución económica) {Escala F mayor en 3 octavas} 5/5"
`;async function i(){let{data:t,error:n}=await e.from(`system_config`).select(`value`).eq(`key`,`groq_api_key`).maybeSingle();if(n)throw console.error(`[GROQ] Error consultando system_config:`,n),Error(`No se pudo obtener la configuración de IA.`);if(!t?.value)throw Error(`API key de GROQ no configurada en el sistema.`);return t.value}async function a(e){let r=await i();try{let i=await(await fetch(`${t.baseURL}/chat/completions`,{method:`POST`,headers:{Authorization:`Bearer ${r}`,"Content-Type":`application/json`},body:JSON.stringify({model:t.model,messages:[{role:`system`,content:n},{role:`user`,content:e}],temperature:t.temperature})})).json();if(i.error)throw Error(i.error.message);return i.choices[0].message.content.trim()}catch(e){throw console.error(`[GROQ] Error en improveText:`,e),e}}async function o(e,n={}){let a=await i(),o=n.presentes?.join(`, `)||``,s=n.indicadorActivo||`ninguno`,c=r+`
\n\nCONTEXTO ADICIONAL:\nAlumnos en clase: ${o||`no especificados`}\nIndicador activo en la ruta: ${s}\n`;try{let n=await(await fetch(`${t.baseURL}/chat/completions`,{method:`POST`,headers:{Authorization:`Bearer ${a}`,"Content-Type":`application/json`},body:JSON.stringify({model:t.model,messages:[{role:`system`,content:c},{role:`user`,content:e}],temperature:t.temperature})})).json();if(n.error)throw Error(n.error.message);return n.choices[0].message.content.trim()}catch(e){throw console.error(`[GROQ] Error en structureTextToDSL:`,e),e}}async function s(e){let n=await i();try{let r=await(await fetch(`${t.baseURL}/chat/completions`,{method:`POST`,headers:{Authorization:`Bearer ${n}`,"Content-Type":`application/json`},body:JSON.stringify({model:t.model,messages:e,temperature:t.temperature})})).json();if(r.error)throw Error(r.error.message);return r.choices[0].message.content.trim()}catch(e){throw console.error(`[GROQ] Error en callGroq:`,e),e}}export{a as n,o as r,s as t};