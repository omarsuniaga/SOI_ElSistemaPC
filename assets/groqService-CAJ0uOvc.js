import{i as e}from"./supabase-C4ics26R.js";var t={model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,temperature:.2};function n(){return`/functions/v1/groq-proxy`}async function r(){let{data:{session:t}}=await e.auth.getSession();return{Authorization:`Bearer ${t?.access_token??``}`,"Content-Type":`application/json`,apikey:``}}async function i(e,i=t.temperature){let a=await r(),o=await fetch(`${n()}/chat`,{method:`POST`,headers:a,body:JSON.stringify({model:t.model,messages:e,temperature:i})}),s=await o.json();if(!o.ok||s.error)throw Error(s.error?.message??`Groq proxy error ${o.status}`);return s.choices[0].message.content.trim()}var a=`
Eres un experto en escritura pedagógica y claridad profesional.
Tu tarea es MEJORAR el texto que recibes del maestro, enfocándose en:
1. Gramática y ortografía correctas
2. Claridad y concisión
3. Tono profesional pero accesible
4. Agregar perspectivas pedagógicas cuando sea relevante
5. Mantener la voz y estilo del maestro original

Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni cambios de significado.
`,o=`
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
BIEN: "#María [Escalas] (mejoró notablemente en la ejecución económica) {Escala F mayor en 3 octavas} 5/5"
`;async function s(e){try{return await i([{role:`system`,content:a},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en improveText:`,e),e}}async function c(e,t={}){let n=t.presentes?.join(`, `)||``,r=t.indicadorActivo||`ninguno`,a=o+`\n\nCONTEXTO ADICIONAL:\nAlumnos en clase: ${n||`no especificados`}\nIndicador activo en la ruta: ${r}\n`;try{return await i([{role:`system`,content:a},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en structureTextToDSL:`,e),e}}async function l(e){try{return await i(e)}catch(e){throw console.error(`[GROQ] Error en callGroq:`,e),e}}export{s as n,c as r,l as t};