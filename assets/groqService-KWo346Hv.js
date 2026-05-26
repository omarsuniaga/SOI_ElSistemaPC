import{i as e}from"./supabase-C4ics26R.js";function t(e=``){return e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^\p{L}\p{N}\s#]/gu,` `).replace(/\s+/g,` `).trim()}var n=[{estado:`DIFICULTAD`,peso:4,keywords:[`no logro`,`no logra`,`no pudo`,`no puede`,`dificultad`,`le cuesta`,`les cuesta`,`se le dificulta`,`se les dificulta`,`confunde`,`confunden`,`sigue mostrando dificultad`,`siguen mostrando dificultad`,`necesita reforzar`,`necesitan reforzar`,`falta practica`,`falta mejorar`,`todavia no`]},{estado:`LOGRADO`,peso:3,keywords:[`logro`,`logra correctamente`,`domina`,`domino`,`dominan`,`excelente`,`muy bien`,`supero`,`superaron`,`perfecto`,`completo correctamente`,`completaron correctamente`,`ya sabe`,`ya saben`]},{estado:`INICIADO`,peso:2,keywords:[`inicio`,`comenzo`,`comenzaron`,`primera vez`,`se introdujo`,`se introdujeron`,`nuevo contenido`,`empez`,`conocier`,`presentamos`]},{estado:`EN_PROGRESO`,peso:1,keywords:[`trabajo`,`trabajaron`,`practico`,`practicaron`,`repaso`,`repasaron`,`continua`,`continuan`,`sigue`,`siguen`,`mejorando`,`avanzando`,`progresando`,`van bien`,`casi`]}];function r(e){let r=t(e),i=[];for(let e of n)for(let n of e.keywords){let a=t(n);r.includes(a)&&i.push({estado:e.estado,peso:e.peso,evidence:n})}return i.length?(i.sort((e,t)=>t.peso-e.peso),{value:i[0].estado,confidence:Math.min(.95,.55+i.length*.15),evidence:i.map(e=>e.evidence)}):{value:`EN_PROGRESO`,confidence:.4,evidence:[]}}function i(e){let t=e.match(/(\d(?:[.,]\d)?)\s*\/\s*5/);if(t)return parseFloat(t[1].replace(`,`,`.`));let n=e.match(/nota[:\s]+(\d(?:[.,]\d)?)/i);return n?parseFloat(n[1].replace(`,`,`.`)):null}function a(e){let t=e.match(/\{([^}]+)\}/);if(t)return t[1].trim();let n=e.match(/(?:tarea[:\s]+|para la pr[oó]xima[,:\s]+|practicar en casa[,:\s]+)([^.!?\n]{5,80})/i);return n?n[1].trim():null}var o={CONDUCTA:[`mal comportamiento`,`mala conducta`,`conducta disruptiva`,`comportamiento negativo`,`falta de respeto`,`irrespetuoso`,`irrespetuosa`,`agresivo`,`agresiva`,`pelea`,`peleo`,`golpeo`,`insulto`,`insulto`,`indisciplina`,`indisciplinado`,`indisciplinada`,`actitud negativa`,`actitud problema`,`mala actitud`,`no quiso`,`se nego`,`berrinche`],ATENCION:[`dificultad en la atencion`,`atencion y concentracion`,`concentracion`,`se distrae`,`no logra concentrarse`,`no atiende`,`no presta atencion`,`distrae`,`falta de atencion`,`falta de concentracion`],RIESGO_PEDAGOGICO:[`frustracion`,`atraso`,`acumulando fallas`,`riesgo`,`cuesta mas`,`le cuesta`,`les cuesta`,`se le dificulta`,`se les dificulta`,`dificultad tecnica`]};function s(e,n){let r=t(e);if(n===`comportamiento`||n===`conducta`)return{active:!0,type:`CONDUCTA`,mensaje:`Alerta de comportamiento detectada.`};for(let[e,n]of Object.entries(o))if(n.some(e=>r.includes(t(e))))return{active:!0,type:e,mensaje:`Alerta de ${(e===`RIESGO_PEDAGOGICO`?`Riesgo Pedagógico`:e===`ATENCION`?`Atención y Concentración`:`Conducta`).toLowerCase()} detectada.`};return{active:!1,type:null,mensaje:null}}var c={tecnica:[`escala`,`posición`,`posicion`,`arco`,`digitación`,`digitacion`,`embocadura`,`afinación`,`afinacion`,`técnica`,`tecnica`,`vibrato`,`pizzicato`,`staccato`,`legato`,`golpe de arco`,`detaché`],repertorio:[`obra`,`pieza`,`danzón`,`danzon`,`minueto`,`sonata`,`concierto`,`sinfonía`,`sinfonia`,`compases`,`c\\.\\d`,`repertorio`,`canción`,`cancion`,`melodía`,`melodia`],teoria:[`ritmo`,`compás`,`compas`,`armonía`,`armonia`,`lectura`,`solfeo`,`teoría`,`teoria`,`nota`,`clave`,`intervalo`,`acorde`],interpretacion:[`expresión`,`expresion`,`fraseo`,`dinámica`,`dinamica`,`tempo`,`articulación`,`articulacion`,`musicalidad`,`carácter`,`caracter`]};function l(e,t=`instrumento`){if(t===`teoria`)return`teoria`;let n=e.toLowerCase();for(let[e,t]of Object.entries(c))if(t.some(e=>new RegExp(e).test(n)))return e;return t===`ensayo_general`?`repertorio`:`tecnica`}function u(e){let n=new Map;function r(e,r){if(!e)return;let i=t(e),a=n.get(i)||[];a.some(e=>e.id===r.id)||a.push(r),n.set(i,a)}for(let t of e){let e=(t.nombre||t.nombre_completo||``).toLowerCase().trim(),n=(t.nombreCorto||t.nombre_corto||t.nombre||t.nombre_completo||``).toLowerCase().trim();e&&r(e,t),n&&n!==e&&r(n,t)}e.map(e=>(e.nombre||e.nombre_completo||``).toLowerCase().trim().split(` `)[0]);for(let t of e){let e=(t.nombre||t.nombre_completo||``).toLowerCase().trim().split(` `)[0];e&&r(e,t)}return n}function d(e,t,n,r){let i=e.toLowerCase(),a=n?.length?n:r;if(/\btodos\b|\btodo el grupo\b|\btoda la clase\b|\bel grupo\b/.test(i))return{students:a,ambiguous:!1,requires_confirmation:!1};let o=new Map,s=!1;for(let[n,r]of t.entries()){let t=n.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);RegExp(`(?<![a-záéíóúñ])${t}(?![a-záéíóúñ])`,`i`).test(e)&&(r.length>1&&(s=!0),r.forEach(e=>{o.set(e.id||e.nombre||e.nombre_completo,e)}))}return{students:Array.from(o.values()),ambiguous:s,requires_confirmation:s}}function f(e){return e.replace(/Lec\./gi,`Lec§`).replace(/c\./gi,`c§`).replace(/n\.º/gi,`n§º`).replace(/(\d)[.](\d)/g,`$1§$2`).replace(/([.!?;])\s+/g,`$1
`).split(`
`).map(e=>e.replace(/Lec§/gi,`Lec.`).replace(/c§/gi,`c.`).replace(/n§º/gi,`n.º`).replace(/(\d)§(\d)/g,`$1.$2`).trim()).filter(Boolean)}function p(e,t={}){let{alumnos:n=[],tipoClase:o=`instrumento`}=t,c=t.presentes?.length?t.presentes:n,p=u(c),_=e.split(/\n{2,}/).map(e=>e.replace(/\n/g,` `).trim()).filter(e=>e.length>10).flatMap(e=>{let t=f(e);return t.length<=1?[e]:t.filter(e=>{if(m(e))return!1;let t=e.toLowerCase(),r=d(e,p,c,n).students.length>0,i=/\btodos\b|\btodo el grupo\b|\btoda la clase\b|\balgunos\b/i.test(t),a=/(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(e);return r||i||a}).length>1?t.filter(e=>!m(e)):[e]});if(!_.length)return[];let v=[],y=new Set;for(let e of _){let t=e.toLowerCase(),u=/(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(e),f=/\balgunos\b/i.test(t)&&!d(e,p,c,n).students.length,{students:m,ambiguous:h,requires_confirmation:g}=d(e,p,c,n),_=/^\s*(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)\b/i.test(e),b=u&&(!m.length||_),x=!m.length&&!b&&!f,S=m.length>1||/\btodos\b|\btodo el grupo\b|\btoda la clase\b/.test(t)||b||x,C=l(e,o),w=r(e),T=s(e,C),E=T.active?T:w.value===`DIFICULTAD`?{active:!0,type:`RIESGO_PEDAGOGICO`,mensaje:`Riesgo pedagógico detectado.`}:T;!S&&!b&&m.length===1&&(w.value===`DIFICULTAD`||E.active)&&y.add(m[0].id||m[0].nombre||m[0].nombre_completo),v.push({alumnos:m,alumnoTags:[],fragment:e,estado:w,nota:i(e),tarea:a(e),esColectivo:S,isExclusion:b,isIndeterminado:f,alerta:E.active||w.value===`DIFICULTAD`,alertDetails:E,tipoClase:o,ambiguous:h,requires_confirmation:g,scope:`individual`})}h(v);for(let e of v)if(e.isExclusion){let t=Array.from(y);e.alumnos=c.filter(e=>{let n=e.id||e.nombre||e.nombre_completo;return!t.includes(n)}),e.esColectivo=!0,e.scope=`grupo_excluyendo`,e.excludeIds=t,e.alumnoTags=[`Todos (excluyendo)`]}else e.isIndeterminado?(e.alumnos=[],e.esColectivo=!1,e.scope=`subgrupo_indeterminado`,e.requires_confirmation=!0,e.alumnoTags=[`Algunos`]):(e.scope=e.esColectivo?`grupo`:`individual`,e.esColectivo&&!e.alumnos.length?(e.alumnos=c,e.alumnoTags=[`Todos`]):e.alumnoTags=e.esColectivo?[`Todos`]:e.alumnos.map(e=>e.nombreCorto||e.nombre_corto||e.nombre||e.nombre_completo));return g(v,c,p)}function m(e){let n=t(e);return/^es fundamental\b/.test(n)||/^es importante (que|senalar|notar|destacar)\b/.test(n)||/\bdebemos continuar\b/.test(n)||/\bpara asegurarnos\b/.test(n)||/\bde manera equilibrada\b/.test(n)||/\bcontinuemos trabajando\b/.test(n)||/\bseguir trabajando\b/.test(n)||/\bcontinuar practicando\b/.test(n)}function h(e){let t=/\b(?:el alumno|la alumna|este alumno|esta alumna|dicho alumno|dicha alumna)\b/i,n=[],r=!1;for(let i of e){if(i.alumnos?.length>0){!i.esColectivo&&!i.isExclusion&&!i.isIndeterminado?(n=i.alumnos,r=!0):r=!1;continue}r&&n.length&&t.test(i.fragment)&&(i.alumnos=[...n],i.esColectivo=n.length>1,i.inherited_subject=!0)}}function g(e,n,r){let i=[];for(let n of e){if(!n.alerta||n.esColectivo||n.isIndeterminado){i.push(n);continue}let e=f(n.fragment),r=e.some(e=>{let n=t(e);return o.RIESGO_PEDAGOGICO.some(e=>n.includes(t(e)))}),a=e.some(e=>{let n=t(e);return o.ATENCION.some(e=>n.includes(t(e)))});if(r&&a){let r=e.filter(e=>{let n=t(e);return o.ATENCION.some(e=>n.includes(t(e)))}),a=e.filter(e=>!r.includes(e));a.length&&i.push({...n,fragment:a.join(` `),alertDetails:{active:!0,type:`RIESGO_PEDAGOGICO`,mensaje:`Riesgo pedagógico detectado.`}}),r.length&&i.push({...n,fragment:r.join(` `),alertDetails:{active:!0,type:`ATENCION`,mensaje:`Alerta de atención y concentración detectada.`}})}else i.push(n)}return i}function _(e){let t=[];for(let n=0;n<e.length;n++)for(let r=n+1;r<e.length;r++){let i=e[n],a=e[r];if(!v(i.alumnos,a.alumnos)||!y(i.contenido,a.contenido))continue;let o=i.nota!=null&&a.nota!=null&&Math.abs(i.nota-a.nota)>1.5,s=i.estado!==a.estado&&(i.estado===`LOGRADO`&&a.estado===`INICIADO`||i.estado===`INICIADO`&&a.estado===`LOGRADO`);if(o||s){let e=o?`Notas contradictorias: ${i.nota}/5 vs ${a.nota}/5 para "${i.contenido}"`:`Estados contradictorios: ${i.estado} vs ${a.estado} para "${i.contenido}"`;t.push({idxA:n,idxB:r,reason:e})}}return t}function v(e,t){if(!e?.length||!t?.length||e.length!==t.length)return!1;let n=new Set(e.map(e=>e.toLowerCase()));return t.every(e=>n.has(e.toLowerCase()))}function y(e,t){if(!e||!t)return!1;let n=e=>e.toLowerCase().replace(/[^a-záéíóúñ0-9]/g,` `).trim(),r=n(e),i=n(t);return r===i?!0:r.includes(i)||i.includes(r)}var b={model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,temperature:.2};function x(){return`/functions/v1/groq-proxy`}async function S(){let{data:{session:t}}=await e.auth.getSession();return{Authorization:`Bearer ${t?.access_token??``}`,"Content-Type":`application/json`,apikey:``}}async function C(e,t=b.temperature){let n=await S(),r=await fetch(`${x()}/chat`,{method:`POST`,headers:n,body:JSON.stringify({model:b.model,messages:e,temperature:t})}),i;try{i=await r.json()}catch{throw Error(`Groq proxy returned non-JSON (status ${r.status})`)}if(!r.ok||i.error){let e=i.error?.message??i.error??`Groq proxy error ${r.status}`;throw console.error(`[GROQ] proxyChat error response:`,r.status,i),Error(e)}let a=i.choices?.[0]?.message?.content;if(!a)throw console.error(`[GROQ] proxyChat: empty or missing content in response`,i),Error(`Groq devolvió una respuesta vacía`);return a.trim()}var w=`
Eres un experto en escritura pedagógica y claridad profesional.
Tu tarea es MEJORAR el texto que recibes del maestro, enfocándose en:
1. Gramática y ortografía correctas
2. Claridad y concisión
3. Tono profesional pero accesible
4. Agregar perspectivas pedagógicas cuando sea relevante
5. Mantener la voz y estilo del maestro original

Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni cambios de significado.
`,T=`
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
`,E=`Eres un asistente pedagógico musical.

Recibes grupos de progreso ya detectados por código de un texto de observación musical.
Tu tarea es completar únicamente dos campos por grupo:

- "contenido": etiqueta breve y concisa de lo trabajado (ej. "Violín Lec. 11", "Escala de Sol mayor"). Máximo 50 caracteres.
- "observacion": resumen pedagógico y cualitativo del nivel actual del alumno. Máximo 80 caracteres.

Responde únicamente con JSON válido, sin markdown (sin bloques de código \`\`\`json) y sin explicaciones adicionales.

Formato exacto de respuesta:
{
  "items": [
    {
      "id": "g_1",
      "contenido": "...",
      "observacion": "..."
    }
  ]
}

Cada grupo incluye un campo "alert_type" que el sistema ya detectó: CONDUCTA, ATENCION, RIESGO_PEDAGOGICO, o null.

Reglas estrictas:
- No cambies alumnos.
- No cambies estados.
- No inventes logros que no estén sugeridos.
- No uses palabras como "correctamente", "domina", "logró", "aplica bien" o similares si el fragmento no contiene evidencia explícita de logro. Si el fragmento solo describe que se vio o trabajó un material, descríbelo de forma neutral (ej: "Trabajó la lección").
- Si el fragmento menciona compases específicos, inclúyelos en el contenido (ej. "Danzón c.33-40").
- Si "alert_type" es "ATENCION": usa "Atención y concentración" en contenido. NUNCA uses "Comportamiento" ni "Enfoque" para este tipo de alerta.
- Si "alert_type" es "RIESGO_PEDAGOGICO": usa el nombre técnico de la dificultad en contenido (ej: "Técnica del arco", "Posición del violín"). NUNCA uses "Comportamiento".
- Si "alert_type" es "CONDUCTA": usa "Comportamiento" en contenido. Reserva este término SOLO para conducta disruptiva, falta de respeto o indisciplina explícita.
- Si "alert_type" es null y el fragmento trata de inasistencia o llegada tarde, usa "Asistencia" en contenido.
- Escribe siempre en un español neutro impecable y profesional (no uses voseo ni modismos locales).
`,D=`
Eres un pedagogo musical especializado en diseño curricular.

Analizas registros reales de clase de un período determinado y propones
un plan curricular estructurado en pilares y objetivos.

FORMATO DE RESPUESTA (JSON válido, sin texto adicional):
{
  "pilares": [
    {
      "nombre": "Nombre del pilar",
      "tipo": "tecnica|repertorio|teoria|interpretacion",
      "objetivos": [
        {
          "descripcion": "Nombre conciso del objetivo (máximo 60 caracteres)",
          "prioridad": "alta|media|consolidacion"
        }
      ]
    }
  ],
  "resumen": "Una frase que describe el foco pedagógico detectado (máximo 120 caracteres)"
}

REGLAS DE CONSTRUCCIÓN:
- Máximo 4 pilares — usa solo los tipos que aparecen en los datos
- De 2 a 6 objetivos por pilar
- Los registros con estado LOGRADO indican consolidación — inclúyelos con prioridad "consolidacion"
- Los registros EN_PROGRESO son el foco principal — asígnales prioridad "alta"
- Los registros INICIADO son objetivos emergentes — inclúyelos solo si frecuencia >= 2, prioridad "media"
- Nombres de objetivos: concisos, pedagógicamente precisos, máximo 60 caracteres
- No inventes contenidos que no estén presentes en los registros
- Si no hay suficientes datos para un pilar, omítelo
`;async function O(e){try{return await C([{role:`system`,content:w},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en improveText:`,e),e}}async function k(e,t={}){let n=t.presentes?.join(`, `)||``,r=t.indicadorActivo||`ninguno`,i=T+`\n\nCONTEXTO ADICIONAL:\nAlumnos en clase: ${n||`no especificados`}\nIndicador activo en la ruta: ${r}\n`;try{return await C([{role:`system`,content:i},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en structureTextToDSL:`,e),e}}function A(e){let t=e.replace(/^\s*```(?:json)?\s*/i,``).replace(/\s*```\s*$/i,``).trim();t=t.replace(/['']/g,`'`).replace(/[""]/g,`"`);try{return JSON.parse(t)}catch{}try{return JSON.parse(M(t))}catch{}try{return JSON.parse(j(t))}catch{}try{return JSON.parse(j(M(t)))}catch{}let n=t.match(/\{[\s\S]*/);if(n){let e=j(n[0]);try{return JSON.parse(e)}catch{}try{return JSON.parse(M(e))}catch{}}let r=t.match(/\[[\s\S]*/);if(r){let e=j(r[0]);try{return JSON.parse(e)}catch{}try{return JSON.parse(M(e))}catch{}}throw SyntaxError(`Unable to repair Groq JSON response`)}function j(e){let t=[],n=!1,r=0;for(;r<e.length;){let i=e[r];if(n){if(i===`\\`){r+=2;continue}i===`"`&&(n=!1)}else i===`"`?n=!0:i===`{`?t.push(`}`):i===`[`?t.push(`]`):(i===`}`||i===`]`)&&t.pop();r++}let i=n?`"`:``;return i+=t.reverse().join(``),e+i}function M(e){let t=``,n=!1,r=0;for(;r<e.length;){let i=e[r];if(n&&i===`\\`){t+=i+(e[r+1]??``),r+=2;continue}if(i===`"`)if(!n)n=!0,t+=i;else{let a=r+1;for(;a<e.length&&(e[a]===` `||e[a]===`	`);)a++;let o=e[a];o===`,`||o===`:`||o===`}`||o===`]`||o===`
`||o===`\r`||a>=e.length?(n=!1,t+=i):t+=`\\"`}else t+=i;r++}return t}function N(e,t){let n=e;for(let e of t){let t=(e.nombre||e.nombre_completo||``).toLowerCase().trim(),r=(e.nombreCorto||e.nombre_corto||e.nombre||e.nombre_completo||``).toLowerCase().trim(),i=e=>e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);t&&(n=n.replace(new RegExp(i(t),`gi`),``)),r&&r!==t&&(n=n.replace(new RegExp(i(r),`gi`),``));let a=(e.nombre||e.nombre_completo||``).toLowerCase().trim().split(` `)[0];a&&(n=n.replace(RegExp(`#${i(a)}`,`gi`),``),n=n.replace(RegExp(`\\b${i(a)}\\b`,`gi`),``))}return n.replace(/\s+/g,` `).replace(/^\s*[,.;]\s*/,``).trim()}async function P(e,t={}){let n=t.alumnos||[],r=t.presentes?.length?t.presentes:n,i=p(e,{...t,alumnos:n,presentes:r});if(!i.length)return{dsl:``,progreso:[],resumen:`Registro general de clase sin evaluaciones detectadas.`};let a={instrumento:t.instrumento||`música`,tipoClase:t.tipoClase||`instrumento`,groups:i.map((e,n)=>({id:`g_${n+1}`,fragment:N(e.fragment,r),estado:e.estado?.value||e.estado,tipo:l(e.fragment,t.tipoClase),scope:e.scope||`grupo`,alert_type:e.alertDetails?.type||null}))},o=i.map(()=>({contenido:``,observacion:``})),s;try{s=await C([{role:`system`,content:E},{role:`user`,content:JSON.stringify(a)}],.1);let e=A(s),t=e&&Array.isArray(e.items)?e.items:Array.isArray(e)?e:null;t&&t.length===i.length?o=t:t&&(o=i.map((e,n)=>t.find(e=>e.id===`g_${n+1}`)||t[n]||{contenido:``,observacion:``}))}catch(e){console.warn(`[GROQ] Enrich call failed, using fallback:`,e.message,`| raw:`,s??`(no response)`)}let c=i.map((e,n)=>{let r=o[n]||{},i=(r.contenido||``).trim()||F(e.fragment),a=l(i+` `+e.fragment,t.tipoClase);return{alumnos:e.alumnos.map(e=>e.nombre||e.nombre_completo||e.nombreCorto),contenido:i,tipo:a,estado:e.estado?.value||e.estado,nota:e.nota,tarea:e.tarea,observacion:(r.observacion||``).trim()||null,es_colectivo:e.esColectivo,alerta:e.alerta||!1,alertaTipo:e.alertDetails?.type||null,alertDetails:e.alertDetails,scope:e.scope||`grupo`,excludeIds:e.excludeIds||[],requires_confirmation:e.requires_confirmation||!1}});return{dsl:I(c,r),progreso:c,resumen:L(c,t.instrumento)}}function F(e){return e.replace(/\d\/5/g,``).replace(/\{[^}]*\}/g,``).replace(/\([^)]*\)/g,``).replace(/\b(todos|todo|grupo|clase|el|la|los|las|un|una)\b/gi,``).trim().slice(0,50)||`Clase`}function I(e,t){return e.map(e=>{let t=e.es_colectivo?`#Todos`:e.alumnos?.length?e.alumnos.map(e=>`#${e.replace(/\s+/g,`_`)}`).join(`, `):`#General`,n=`!${e.estado}`,r=e.nota?` ${e.nota}/5`:``,i=e.tarea?` {${e.tarea}}`:``,a=e.observacion?` (${e.observacion})`:``;return`${t} [${e.contenido}] ${n}${r}${a}${i}`}).join(` · `)}function L(e,t){if(!e.length)return`Registro de clase sin evaluaciones detectadas.`;let n=[...new Set(e.map(e=>e.tipo))].join(`, `),r=e.map(e=>e.estado),i={LOGRADO:`con logros consolidados`,EN_PROGRESO:`en progreso`,INICIADO:`iniciando contenidos`}[r.sort((e,t)=>r.filter(e=>e===t).length-r.filter(t=>t===e).length)[0]]||`evaluada`;return`Sesión de ${t||`música`} — ${n} — ${i}.`}async function R(e,t={}){let n=`
CONTEXTO:
- Clase: ${t.nombreClase||`no especificado`}
- Instrumento: ${t.instrumento||`no especificado`}
- Nivel estimado: ${t.nivel||`no especificado`}
- Total sesiones analizadas: ${e.totalSesiones}
- Período desde: ${e.fechaDesde}

REGISTROS (ordenados por frecuencia de aparición en sesiones):
${JSON.stringify(e.registros,null,2)}
`,r=D+`

`+n;try{let e=(await C([{role:`system`,content:r},{role:`user`,content:`Genera la propuesta curricular basada en estos registros.`}],.2)).replace(/^\s*```(?:json)?\s*/i,``).replace(/\s*```\s*$/i,``).trim();console.debug(`[GROQ] proposeCurriculum cleaned:`,e);let t=JSON.parse(e);return{pilares:Array.isArray(t.pilares)?t.pilares:[],resumen:t.resumen||``}}catch(e){throw console.error(`[GROQ] Error en proposeCurriculum:`,e,`| raw:`,typeof raw<`u`?raw:`(no response)`),Error(`No se pudo generar la propuesta curricular. Verifica la conexión con el servicio de IA.`)}}async function z(e){try{return await C(e)}catch(e){throw console.error(`[GROQ] Error en callGroq:`,e),e}}async function B(e,t,n){let r=e.map(e=>{let t=e.asistencia||[],n=t.filter(e=>e.estado===`P`).length,r=t.filter(e=>e.estado===`A`).length,i=t.filter(e=>e.estado===`J`).length;return`Sesión ${e.numero_sesion} (${e.fecha}): ${n} presentes, ${r} ausentes, ${i} justificados`}).join(`
`),i=t.map(e=>`${e.alumnos?.nombre_completo??`Alumno`} — ${e.curriculo_objetivos?.descripcion??e.contenido_dsl??``}: ${e.tipo}`).join(`
`),a=`Eres el asistente pedagógico del Departamento Académico de El Sistema Punta Cana.
Analiza los datos del mes de ${n.mes} para la clase "${n.clase}" (docente: ${n.docente}, ${n.totalAlumnos} alumnos).

DATOS DE ASISTENCIA:
${r}

DATOS DE PROGRESO:
${i}

Devuelve un JSON con esta estructura exacta (sin texto adicional, solo el JSON):
{
  "patrones": {
    "positivos": ["máximo 3 patrones positivos detectados"],
    "atencion": ["máximo 3 situaciones que requieren atención"]
  },
  "recomendaciones": {
    "academico": "recomendación académica en 2 oraciones",
    "logistica": "recomendación logística/administrativa en 2 oraciones",
    "talentos": "recomendación sobre talentos o alumnos destacados en 2 oraciones",
    "refuerzo": "recomendación sobre alumnos que necesitan refuerzo en 2 oraciones"
  },
  "notaDireccion": "nota ejecutiva de 3-4 oraciones para el director, destacando lo más relevante del mes"
}
Usa español neutro, tono formal-institucional, sin voseo.`;try{return A(await C([{role:`user`,content:a}],.3))}catch(e){return console.error(`[groqService] generateMonthlyPatterns failed:`,e),{patrones:{positivos:[],atencion:[]},recomendaciones:{academico:``,logistica:``,talentos:``,refuerzo:``},notaDireccion:``}}}export{R as a,O as i,z as n,k as o,B as r,_ as s,P as t};