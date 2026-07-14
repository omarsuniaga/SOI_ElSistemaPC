import{i as e}from"./supabase-Cgh_dhNB.js";import{t}from"./config-CNiOV0RX.js";function n(e=``){return e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^\p{L}\p{N}\s#]/gu,` `).replace(/\s+/g,` `).trim()}var r=[{estado:`DIFICULTAD`,peso:4,keywords:[`no logro`,`no logra`,`no pudo`,`no puede`,`dificultad`,`le cuesta`,`les cuesta`,`se le dificulta`,`se les dificulta`,`confunde`,`confunden`,`sigue mostrando dificultad`,`siguen mostrando dificultad`,`necesita reforzar`,`necesitan reforzar`,`falta practica`,`falta mejorar`,`todavia no`]},{estado:`LOGRADO`,peso:3,keywords:[`logro`,`logra correctamente`,`domina`,`domino`,`dominan`,`excelente`,`muy bien`,`supero`,`superaron`,`perfecto`,`completo correctamente`,`completaron correctamente`,`ya sabe`,`ya saben`]},{estado:`INICIADO`,peso:2,keywords:[`inicio`,`comenzo`,`comenzaron`,`primera vez`,`se introdujo`,`se introdujeron`,`nuevo contenido`,`empez`,`conocier`,`presentamos`]},{estado:`EN_PROGRESO`,peso:1,keywords:[`trabajo`,`trabajaron`,`practico`,`practicaron`,`repaso`,`repasaron`,`continua`,`continuan`,`sigue`,`siguen`,`mejorando`,`avanzando`,`progresando`,`van bien`,`casi`]}];function i(e){let t=n(e),i=[];for(let e of r)for(let r of e.keywords){let a=n(r);t.includes(a)&&i.push({estado:e.estado,peso:e.peso,evidence:r})}return i.length?(i.sort((e,t)=>t.peso-e.peso),{value:i[0].estado,confidence:Math.min(.95,.55+i.length*.15),evidence:i.map(e=>e.evidence)}):{value:`EN_PROGRESO`,confidence:.4,evidence:[]}}function a(e){let t=e.match(/(\d(?:[.,]\d)?)\s*\/\s*5/);if(t)return parseFloat(t[1].replace(`,`,`.`));let n=e.match(/nota[:\s]+(\d(?:[.,]\d)?)/i);return n?parseFloat(n[1].replace(`,`,`.`)):null}function o(e){let t=e.match(/\{([^}]+)\}/);if(t)return t[1].trim();let n=e.match(/(?:tarea[:\s]+|para la pr[oó]xima[,:\s]+|practicar en casa[,:\s]+)([^.!?\n]{5,80})/i);return n?n[1].trim():null}var s={CONDUCTA:[`mal comportamiento`,`mala conducta`,`conducta disruptiva`,`comportamiento negativo`,`falta de respeto`,`irrespetuoso`,`irrespetuosa`,`agresivo`,`agresiva`,`pelea`,`peleo`,`golpeo`,`insulto`,`insulto`,`indisciplina`,`indisciplinado`,`indisciplinada`,`actitud negativa`,`actitud problema`,`mala actitud`,`no quiso`,`se nego`,`berrinche`],ATENCION:[`dificultad en la atencion`,`atencion y concentracion`,`concentracion`,`se distrae`,`no logra concentrarse`,`no atiende`,`no presta atencion`,`distrae`,`falta de atencion`,`falta de concentracion`],RIESGO_PEDAGOGICO:[`frustracion`,`atraso`,`acumulando fallas`,`riesgo`,`cuesta mas`,`le cuesta`,`les cuesta`,`se le dificulta`,`se les dificulta`,`dificultad tecnica`]};function c(e,t){let r=n(e);if(t===`comportamiento`||t===`conducta`)return{active:!0,type:`CONDUCTA`,mensaje:`Alerta de comportamiento detectada.`};for(let[e,t]of Object.entries(s))if(t.some(e=>r.includes(n(e))))return{active:!0,type:e,mensaje:`Alerta de ${(e===`RIESGO_PEDAGOGICO`?`Riesgo Pedagógico`:e===`ATENCION`?`Atención y Concentración`:`Conducta`).toLowerCase()} detectada.`};return{active:!1,type:null,mensaje:null}}var l={tecnica:[`escala`,`posición`,`posicion`,`arco`,`digitación`,`digitacion`,`embocadura`,`afinación`,`afinacion`,`técnica`,`tecnica`,`vibrato`,`pizzicato`,`staccato`,`legato`,`golpe de arco`,`detaché`],repertorio:[`obra`,`pieza`,`danzón`,`danzon`,`minueto`,`sonata`,`concierto`,`sinfonía`,`sinfonia`,`compases`,`c\\.\\d`,`repertorio`,`canción`,`cancion`,`melodía`,`melodia`],teoria:[`ritmo`,`compás`,`compas`,`armonía`,`armonia`,`lectura`,`solfeo`,`teoría`,`teoria`,`nota`,`clave`,`intervalo`,`acorde`],interpretacion:[`expresión`,`expresion`,`fraseo`,`dinámica`,`dinamica`,`tempo`,`articulación`,`articulacion`,`musicalidad`,`carácter`,`caracter`]};function u(e,t=`instrumento`){if(t===`teoria`)return`teoria`;let n=e.toLowerCase();for(let[e,t]of Object.entries(l))if(t.some(e=>new RegExp(e).test(n)))return e;return t===`ensayo_general`?`repertorio`:`tecnica`}function d(e){let t=new Map;function r(e,r){if(!e)return;let i=n(e),a=t.get(i)||[];a.some(e=>e.id===r.id)||a.push(r),t.set(i,a)}for(let t of e){let e=(t.nombre||t.nombre_completo||``).toLowerCase().trim(),n=(t.nombreCorto||t.nombre_corto||t.nombre||t.nombre_completo||``).toLowerCase().trim();e&&r(e,t),n&&n!==e&&r(n,t)}e.map(e=>(e.nombre||e.nombre_completo||``).toLowerCase().trim().split(` `)[0]);for(let t of e){let e=(t.nombre||t.nombre_completo||``).toLowerCase().trim().split(` `)[0];e&&r(e,t)}return t}function f(e,t,n,r){let i=e.toLowerCase(),a=n?.length?n:r;if(/\btodos(?!\s+los\s+(?:compases|dedos|ejercicios|dias|metodos|aspectos|materiales|detalles|objetivos|retos|elementos|puntos|errores|fallas))\b|\btodo el grupo\b|\btoda la clase\b|\bel grupo\b/.test(i))return{students:a,ambiguous:!1,requires_confirmation:!1};let o=new Map,s=!1;for(let[n,r]of t.entries()){let t=n.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);RegExp(`(?<![a-záéíóúñ])${t}(?![a-záéíóúñ])`,`i`).test(e)&&(r.length>1&&(s=!0),r.forEach(e=>{o.set(e.id||e.nombre||e.nombre_completo,e)}))}return{students:Array.from(o.values()),ambiguous:s,requires_confirmation:s}}function p(e){return e.replace(/Lec\./gi,`Lec§`).replace(/c\./gi,`c§`).replace(/n\.º/gi,`n§º`).replace(/(\d)[.](\d)/g,`$1§$2`).replace(/([.!?;])\s+/g,`$1
`).split(`
`).map(e=>e.replace(/Lec§/gi,`Lec.`).replace(/c§/gi,`c.`).replace(/n§º/gi,`n.º`).replace(/(\d)§(\d)/g,`$1.$2`).trim()).filter(Boolean)}var m=/\b(?:el alumno|la alumna|este alumno|esta alumna|dicho alumno|dicha alumna)\b/i;function h(e,t={}){let{alumnos:n=[],tipoClase:r=`instrumento`}=t,s=t.presentes?.length?t.presentes:n,l=d(s),h=e.split(/\n{2,}/).map(e=>e.replace(/\n/g,` `).trim()).filter(e=>e.length>10).flatMap(e=>{let t=p(e).filter(e=>!g(e));return t.length===0?[]:t.length===1?[t[0]]:t.filter(e=>{let t=e.toLowerCase(),r=f(e,l,s,n).students.length>0,i=/\btodos(?!\s+los\s+(?:compases|dedos|ejercicios|dias|metodos|aspectos|materiales|detalles|objetivos|retos|elementos|puntos|errores|fallas))\b|\btodo el grupo\b|\btoda la clase\b|\balgunos\b/i.test(t),a=/(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(e),o=m.test(e);return r||i||a||o}).length>1?t:[t.join(` `)]});if(!h.length)return[];let y=[],b=new Set;for(let e of h){let t=e.toLowerCase(),d=/(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(e),p=/\balgunos\b/i.test(t)&&!f(e,l,s,n).students.length,{students:m,ambiguous:h,requires_confirmation:g}=f(e,l,s,n),_=/^\s*(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)\b/i.test(e),v=d&&(!m.length||_),x=!m.length&&!v&&!p,S=m.length>1||/\btodos(?!\s+los\s+(?:compases|dedos|ejercicios|dias|metodos|aspectos|materiales|detalles|objetivos|retos|elementos|puntos|errores|fallas))\b|\btodo el grupo\b|\btoda la clase\b/.test(t)||v||x,C=u(e,r),w=i(e),T=c(e,C),E=T.active?T:w.value===`DIFICULTAD`?{active:!0,type:`RIESGO_PEDAGOGICO`,mensaje:`Riesgo pedagógico detectado.`}:T;!S&&!v&&m.length===1&&(w.value===`DIFICULTAD`||E.active)&&b.add(m[0].id||m[0].nombre||m[0].nombre_completo),y.push({alumnos:m,alumnoTags:[],fragment:e,estado:w,nota:a(e),tarea:o(e),esColectivo:S,isExclusion:v,isIndeterminado:p,alerta:E.active||w.value===`DIFICULTAD`,alertDetails:E,tipoClase:r,ambiguous:h,requires_confirmation:g,scope:`individual`})}_(y);for(let e of y)if(e.isExclusion){let t=Array.from(b);e.alumnos=s.filter(e=>{let n=e.id||e.nombre||e.nombre_completo;return!t.includes(n)}),e.esColectivo=!0,e.scope=`grupo_excluyendo`,e.excludeIds=t,e.alumnoTags=[`Todos (excluyendo)`]}else e.isIndeterminado?(e.alumnos=[],e.esColectivo=!1,e.scope=`subgrupo_indeterminado`,e.requires_confirmation=!0,e.alumnoTags=[`Algunos`]):(e.scope=e.esColectivo?`grupo`:`individual`,e.esColectivo&&!e.alumnos.length?(e.alumnos=s,e.alumnoTags=[`Todos`]):e.alumnoTags=e.esColectivo?[`Todos`]:e.alumnos.map(e=>e.nombreCorto||e.nombre_corto||e.nombre||e.nombre_completo));return v(y,s,l)}function g(e){let t=n(e);return/^es fundamental\b/.test(t)||/^es importante (que|senalar|notar|destacar)\b/.test(t)||/\bdebemos continuar\b/.test(t)||/\bpara asegurarnos\b/.test(t)||/\bde manera equilibrada\b/.test(t)||/\bcontinuemos trabajando\b/.test(t)||/\bseguir trabajando\b/.test(t)||/\bcontinuar practicando\b/.test(t)}function _(e){let t=[],n=!1;for(let r of e){if(r.alumnos?.length>0){!r.esColectivo&&!r.isExclusion&&!r.isIndeterminado?(t=r.alumnos,n=!0):n=!1;continue}n&&t.length&&m.test(r.fragment)&&(r.alumnos=[...t],r.esColectivo=t.length>1,r.inherited_subject=!0)}}function v(e,t,r){let i=[];for(let t of e){if(!t.alerta||t.esColectivo||t.isIndeterminado){i.push(t);continue}let e=p(t.fragment),r=e.some(e=>{let t=n(e);return s.RIESGO_PEDAGOGICO.some(e=>t.includes(n(e)))}),a=e.some(e=>{let t=n(e);return s.ATENCION.some(e=>t.includes(n(e)))});if(r&&a){let r=e.filter(e=>{let t=n(e);return s.ATENCION.some(e=>t.includes(n(e)))}),a=e.filter(e=>!r.includes(e));a.length&&i.push({...t,fragment:a.join(` `),alertDetails:{active:!0,type:`RIESGO_PEDAGOGICO`,mensaje:`Riesgo pedagógico detectado.`}}),r.length&&i.push({...t,fragment:r.join(` `),alertDetails:{active:!0,type:`ATENCION`,mensaje:`Alerta de atención y concentración detectada.`}})}else i.push(t)}return i}function y(e){let t=[];for(let n=0;n<e.length;n++)for(let r=n+1;r<e.length;r++){let i=e[n],a=e[r];if(!b(i.alumnos,a.alumnos)||!x(i.contenido,a.contenido))continue;let o=i.nota!=null&&a.nota!=null&&Math.abs(i.nota-a.nota)>1.5,s=i.estado!==a.estado&&(i.estado===`LOGRADO`&&a.estado===`INICIADO`||i.estado===`INICIADO`&&a.estado===`LOGRADO`);if(o||s){let e=o?`Notas contradictorias: ${i.nota}/5 vs ${a.nota}/5 para "${i.contenido}"`:`Estados contradictorios: ${i.estado} vs ${a.estado} para "${i.contenido}"`;t.push({idxA:n,idxB:r,reason:e})}}return t}function b(e,t){if(!e?.length||!t?.length||e.length!==t.length)return!1;let n=new Set(e.map(e=>e.toLowerCase()));return t.every(e=>n.has(e.toLowerCase()))}function x(e,t){if(!e||!t)return!1;let n=e=>e.toLowerCase().replace(/[^a-záéíóúñ0-9]/g,` `).trim(),r=n(e),i=n(t);return r===i||r.includes(i)||i.includes(r)}var S={cuerdas:[`violín`,`viola`,`violonchelo`,`violoncello`,`contrabajo`],violines:[`violín`],violas:[`viola`],cellos:[`violonchelo`,`violoncello`],contrabajos:[`contrabajo`],maderas:[`flauta`,`oboe`,`clarinete`],vientos_madera:[`flauta`,`oboe`,`clarinete`],flautas:[`flauta`],oboes:[`oboe`],clarinetes:[`clarinete`],tutti:[],general:[],individual:[]};function C(e){return!e||typeof e!=`string`?``:e.trim().toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).split(/\s+/).map(e=>e.endsWith(`es`)&&e.length>4?e.slice(0,-2):e.endsWith(`s`)&&!e.endsWith(`es`)&&e.length>3?e.slice(0,-1):e).join(` `)}function w(e,t=[]){let n=S[e];if(!n)return console.warn(`[seccionesOrquestales] Sección "${e}" no encontrada en el mapa`),[];if(e===`tutti`||e===`general`)return t.map(T);if(e===`individual`)return[];let r=n.map(C);return t.filter(e=>{let t=C(e.instrumento_principal||e.instrumento||``);return r.some(e=>t.includes(e))}).map(T)}function T(e){return{id:e.id,nombre_completo:e.nombre_completo||e.nombre||``,instrumento_principal:e.instrumento_principal||e.instrumento||``}}function E(e,t=[]){return e.map(e=>{if(e.seccion===`individual`||e.es_colectivo===!0||e.alumnos&&e.alumnos.length>0)return e;let n=e.seccion||`general`;if(!(n in S))return e;let r=w(n,t).map(e=>e.nombre_completo);return{...e,alumnos:r}})}function D(e=[]){let t=[`SECCIONES:`];for(let[n,r]of Object.entries(S)){let i=w(n,e);if(i.length===0)continue;let a=r.length>0?r.join(`, `):n,o=i.map(e=>e.nombre_completo).join(`, `);t.push(`- ${n} (${a}): ${o}`)}return t.join(`
`)}var O={model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,temperature:.2};function k(){return`https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/groq-proxy`}async function A(){let{data:{session:t}}=await e.auth.getSession();return{Authorization:`Bearer ${t?.access_token??``}`,"Content-Type":`application/json`,apikey:`sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P`}}async function j(e,n){let r=await fetch(`${t.ai.ollamaUrl}/v1/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({model:t.ai.ollamaModel,messages:e,temperature:n})}),i;try{i=await r.json()}catch{throw Error(`Ollama returned non-JSON (status ${r.status})`)}if(!r.ok||i.error){let e=i.error?.message??i.error??`Ollama error ${r.status}`;throw console.error(`[OLLAMA] chat error response:`,r.status,i),Error(e)}let a=i.choices?.[0]?.message?.content;if(!a)throw console.error(`[OLLAMA] chat: empty or missing content in response`,i),Error(`Ollama devolvió una respuesta vacía`);return a.trim()}async function M(e,n=O.temperature){if(t.ai.provider===`ollama`)return j(e,n);let r=await A(),i=await fetch(`${k()}/chat`,{method:`POST`,headers:r,body:JSON.stringify({model:O.model,messages:e,temperature:n})}),a;try{a=await i.json()}catch{throw Error(`Groq proxy returned non-JSON (status ${i.status})`)}if(!i.ok||a.error){let e=a.error?.message??a.error??`Groq proxy error ${i.status}`;throw console.error(`[GROQ] proxyChat error response:`,i.status,a),Error(e)}let o=a.choices?.[0]?.message?.content;if(!o)throw console.error(`[GROQ] proxyChat: empty or missing content in response`,a),Error(`Groq devolvió una respuesta vacía`);return o.trim()}var N=`
Eres un experto en escritura pedagógica y claridad profesional.
Tu tarea es MEJORAR el texto que recibes del maestro, enfocándose en:
1. Gramática y ortografía correctas
2. Claridad y concisión
3. Tono profesional pero accesible
4. Agregar perspectivas pedagógicas cuando sea relevante
5. Mantener la voz y estilo del maestro original

Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni cambios de significado.
`,P=`
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
`,F=`Eres un analista pedagógico musical.

Recibís el texto de observación de un maestro de música y la lista de alumnos presentes.
Tu tarea es ANALIZARLO y devolver un JSON con puntos calificables fragmentados.

Tu misión es ser HONESTO, no optimista. Calificás la EVIDENCIA DE RESULTADO presente en el texto, no la intención ni la actividad.

═══ RÚBRICA DE EVIDENCIA LINGÜÍSTICA ═══

Usá esta rúbrica para inferir estado y nota según la evidencia del texto:

LOGRO CONCRETO → LOGRADO, nota 5
  Disparadores: "logró perfectamente", "quedó resuelto", "con precisión", "dominaron", "sin errores"
  Ej: "los violines lograron la entrada con precisión"

LOGRO PARCIAL → LOGRADO, nota 4
  Disparadores: "mejoró notablemente", "salió bien", "ya casi", "lograron mayormente"
  Ej: "la frase de maderas salió bien, casi limpia"

ACTIVIDAD SIN EVIDENCIA → EN_PROGRESO, nota 3 (DEFAULT)
  Disparadores: "trabajamos", "revisamos", "pasamos por", "practicamos", "vimos"
  Ej: "revisamos los compases 23 al 49" → se trabajó, no se dice si se logró

DIFICULTAD O TRABAJO EN CURSO → EN_PROGRESO, nota 2
  Disparadores: "buscando la cohesión", "aún no", "con dificultad", "les costó", "para lograr"
  Ej: "buscando la cohesión de las semicorcheas" → no se logró aún

PRIMERA EXPOSICIÓN → INICIADO, nota 1-2
  Disparadores: "se mostró", "se explicó", "primera vez", "se introdujo", "empezamos", "comenzamos"
  Ej: "se les mostró el patrón rítmico por primera vez"

═══ REGLAS DE OBJETIVIDAD ═══
- Sin evidencia de logro → nota 3, estado EN_PROGRESO (JAMÁS infieras logros)
- "Buscando", "para lograr", "trabajando en" → nota 2 (expresan que NO se logró)
- "Se mostró", "se introdujo" por primera vez → INICIADO, nota 1-2
- No inventes logros. Si el texto solo dice "revisamos" → nota 3
- No asignes notas 4-5 a menos que el lenguaje EXPRESE explícitamente logro
- Cada punto debe incluir "explicacion_objetiva" citando la frase del texto que justifica la nota

═══ SEGMENTACIÓN ═══
Dividí el texto en TANTOS puntos calificables como sea necesario.
Cada punto = UNA UNIDAD TEMÁTICA INDEPENDIENTE:

- Por alumno: si menciona a "María", "Juan", "Pedro" individualmente → punto separado cada uno
- Por sección: si menciona "maderas", "violines", "cuerdas", "tutti" → punto por sección
- Por contenido: cada pasaje, técnica, obra o tema diferente → punto separado
- Una misma persona/sección puede tener MÚLTIPLES puntos (ej. "María trabajó escalas y después arpegios")

Ejemplos de segmentación:
  "revisamos maderas c.23-49 y violines c.198" → 2 puntos (maderas, violines)
  "María trabajó escalas y Pedro inició arpegios" → 2 puntos (María, Pedro)
  "toda la clase trabajó el danzón" → 1 punto colectivo
  "hoy con la orquesta: maderas c.23-49, violines armónicos c.198, y tutti cierre" → 3 puntos

Si no hay alumnos individuales mencionados y no hay secciones claras → 1 punto colectivo descriptivo.

═══ FORMATO EXACTO DE RESPUESTA ═══
JSON válido, SIN bloques de código, SIN markdown, SIN explicaciones.

{
  "items": [
    {
      "contenido": "etiqueta breve (máx 50 chars, ej. 'Danzón maderas c.23-49' o 'Escala Sol M')",
      "alumnos": ["Nombre1", "Nombre2"],
      "es_colectivo": false,
      "seccion": "maderas | violines | tutti | cuerdas | general | individual",
      "estado": "LOGRADO | EN_PROGRESO | INICIADO",
      "nota": 3,
      "observacion": "resumen cualitativo en 1 frase (máx 80 chars)",
      "tarea": "tarea específica o null",
      "explicacion_objetiva": "Justificación citando la evidencia textual exacta"
    }
  ],
  "resumen": "Una frase que sintetice la sesión (máx 120 chars)"
}

Reglas del formato:
- "alumnos": solo nombres que estén en la lista "alumnosPresentes". Vacío [] si es colectivo.
- "es_colectivo": true cuando el punto aplica a todo el grupo o sección, no a individuos
- "seccion": identificador libre (el que mejor describa: "violines 1", "maderas", "cuerdas", "tutti", "individual")
- "nota": null solo si no hay suficiente información; de lo contrario 1-5 siguiendo la rúbrica
- "tarea": solo si el texto menciona explícitamente tarea o "para la próxima"

Escribí en español neutro profesional, sin voseo, sin modismos locales.
Respondé ÚNICAMENTE el JSON, sin prefijos, sin texto adicional.

═══ SECCIONES PRESENTES ═══
A continuación, los alumnos presentes agrupados por sección orquestal:
__SECCIONES_CONTEXT__
`,I=`
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
`;async function L(e){try{return await M([{role:`system`,content:N},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en improveText:`,e),e}}async function R(e,t={}){let n=t.presentes?.join(`, `)||``,r=t.indicadorActivo||`ninguno`,i=P+`\n\nCONTEXTO ADICIONAL:\nAlumnos en clase: ${n||`no especificados`}\nIndicador activo en la ruta: ${r}\n`;try{return await M([{role:`system`,content:i},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en structureTextToDSL:`,e),e}}function z(e){let t=e.replace(/^\s*```(?:json)?\s*/i,``).replace(/\s*```\s*$/i,``).trim();t=t.replace(/[‘’]/g,`'`).replace(/[“”]/g,`"`);try{return JSON.parse(t)}catch{}try{return JSON.parse(V(t))}catch{}try{return JSON.parse(B(t))}catch{}try{return JSON.parse(B(V(t)))}catch{}let n=t.match(/\{[\s\S]*/);if(n){let e=B(n[0]);try{return JSON.parse(e)}catch{}try{return JSON.parse(V(e))}catch{}}let r=t.match(/\[[\s\S]*/);if(r){let e=B(r[0]);try{return JSON.parse(e)}catch{}try{return JSON.parse(V(e))}catch{}}throw SyntaxError(`Unable to repair Groq JSON response`)}function B(e){let t=[],n=!1,r=0;for(;r<e.length;){let i=e[r];if(n){if(i===`\\`){r+=2;continue}i===`"`&&(n=!1)}else i===`"`?n=!0:i===`{`?t.push(`}`):i===`[`?t.push(`]`):(i===`}`||i===`]`)&&t.pop();r++}let i=n?`"`:``;return i+=t.reverse().join(``),e+i}function V(e){let t=``,n=!1,r=0;for(;r<e.length;){let i=e[r];if(n&&i===`\\`){t+=i+(e[r+1]??``),r+=2;continue}if(i===`"`)if(!n)n=!0,t+=i;else{let a=r+1;for(;a<e.length&&(e[a]===` `||e[a]===`	`);)a++;let o=e[a];o===`,`||o===`:`||o===`}`||o===`]`||o===`
`||o===`\r`||a>=e.length?(n=!1,t+=i):t+=`\\"`}else t+=i;r++}return t}function H(e,t){let n=new Set(t.map(e=>(e.nombre||e.nombre_completo||``).toLowerCase().trim()));return e.map(e=>{let t=e.nota;t!=null&&(t=Math.round(Math.min(5,Math.max(0,Number(t)))*2)/2,isNaN(t)&&(t=null));let r=[`LOGRADO`,`EN_PROGRESO`,`INICIADO`].includes(e.estado)?e.estado:`EN_PROGRESO`,i=[];Array.isArray(e.alumnos)&&(i=e.alumnos.filter(e=>{if(!e||typeof e!=`string`)return!1;let t=e.toLowerCase().trim();return n.has(t)||[...n].some(e=>e.includes(t)||t.includes(e))}));let a=!!e.seccion&&![`general`,`individual`].includes(e.seccion),o=e.es_colectivo===!0||i.length===0&&!a;return{contenido:e.contenido||``,alumnos:o?[]:i,es_colectivo:o,seccion:e.seccion||`general`,estado:r,nota:t,observacion:e.observacion||null,tarea:e.tarea||null,explicacion_objetiva:e.explicacion_objetiva||null}})}function U(e,t){return e.map(e=>e.es_colectivo?{...e,alumnos:t.map(e=>e.nombre||e.nombre_completo||``)}:e)}async function W(e,t={}){let n=t.presentes?.length?t.presentes:t.alumnos||[],r={observacion:e,alumnosPresentes:n.map(e=>e.nombre||e.nombre_completo||``),tipoClase:t.tipoClase||`instrumento`,instrumento:t.instrumento||`música`},i=D(n),a=F.replace(`__SECCIONES_CONTEXT__`,i),o=[],s=``;try{let e=z(await M([{role:`system`,content:a},{role:`user`,content:JSON.stringify(r)}],.1)),t=e&&Array.isArray(e.items)?e.items:null;t&&t.length>0&&(o=t,s=e.resumen||``)}catch(e){console.warn(`[GROQ] analyzeObservation — full analysis failed, falling back:`,e.message)}if(!o.length)return G(e,t,n);let c=U(E(H(o,n),n),n).map(e=>{let n=u((e.contenido||``)+` `+(e.observacion||``),t.tipoClase);return{alumnos:e.alumnos,contenido:e.contenido,tipo:n,estado:e.estado,nota:e.nota,tarea:e.tarea,observacion:e.observacion,es_colectivo:e.es_colectivo,seccion:e.seccion,explicacion_objetiva:e.explicacion_objetiva,alerta:!1,alertaTipo:null,alertDetails:null}});return{dsl:J(c,n),progreso:c,resumen:s||Y(c,t.instrumento)}}async function G(e,t,n){let r=t.alumnos||[],i=h(e,{...t,alumnos:r,presentes:n});if(!i.length)return{dsl:``,progreso:[],resumen:`Registro general de clase sin evaluaciones detectadas.`};let a={instrumento:t.instrumento||`música`,tipoClase:t.tipoClase||`instrumento`,groups:i.map((e,r)=>({id:`g_${r+1}`,fragment:K(e.fragment,n),estado:e.estado?.value||e.estado,tipo:u(e.fragment,t.tipoClase),scope:e.scope||`grupo`}))},o=i.map(()=>({contenido:``,observacion:``})),s;try{s=await M([{role:`system`,content:`Eres un asistente pedagógico musical.
Recibes grupos de progreso ya detectados de un texto de observación musical.
Tu tarea es completar únicamente "contenido" (etiqueta breve, máx 50 chars) y "observacion" (resumen, máx 80 chars).
Responde JSON: {"items":[{"id":"g_1","contenido":"...","observacion":"..."}]}
Sin markdown, sin explicaciones.`},{role:`user`,content:JSON.stringify(a)}],.1);let e=z(s),t=e&&Array.isArray(e.items)?e.items:Array.isArray(e)?e:null;t&&t.length===i.length?o=t:t&&(o=i.map((e,n)=>t.find(e=>e.id===`g_${n+1}`)||t[n]||{contenido:``,observacion:``}))}catch(e){console.warn(`[GROQ] Legacy enrich failed:`,e.message)}let c=i.map((e,n)=>{let r=o[n]||{},i=(r.contenido||``).trim()||q(e.fragment),a=u(i+` `+e.fragment,t.tipoClase);return{alumnos:e.alumnos.map(e=>e.nombre||e.nombre_completo||e.nombreCorto),contenido:i,tipo:a,estado:e.estado?.value||e.estado,nota:e.nota,tarea:e.tarea,observacion:(r.observacion||``).trim()||null,es_colectivo:e.esColectivo,alerta:e.alerta||!1,alertaTipo:e.alertDetails?.type||null,alertDetails:e.alertDetails,scope:e.scope||`grupo`,excludeIds:e.excludeIds||[],requires_confirmation:e.requires_confirmation||!1}});return{dsl:J(c,n),progreso:c,resumen:Y(c,t.instrumento)}}function K(e,t){let n=e;for(let e of t){let t=(e.nombre||e.nombre_completo||``).toLowerCase().trim(),r=(e.nombreCorto||e.nombre_corto||e.nombre||e.nombre_completo||``).toLowerCase().trim(),i=e=>e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);t&&(n=n.replace(new RegExp(i(t),`gi`),``)),r&&r!==t&&(n=n.replace(new RegExp(i(r),`gi`),``));let a=(e.nombre||e.nombre_completo||``).toLowerCase().trim().split(` `)[0];a&&(n=n.replace(RegExp(`#${i(a)}`,`gi`),``),n=n.replace(RegExp(`\\b${i(a)}\\b`,`gi`),``))}return n.replace(/\s+/g,` `).replace(/^\s*[,.;]\s*/,``).trim()}function q(e){return e.replace(/\d\/5/g,``).replace(/\{[^}]*\}/g,``).replace(/\([^)]*\)/g,``).replace(/\b(todos|todo|grupo|clase|el|la|los|las|un|una)\b/gi,``).trim().slice(0,50)||`Clase`}function J(e,t){return e.map(e=>{let t=e.es_colectivo?`#Todos`:e.alumnos?.length?e.alumnos.map(e=>`#${e.replace(/\s+/g,`_`)}`).join(`, `):`#General`,n=`!${e.estado}`,r=e.nota?` ${e.nota}/5`:``,i=e.tarea?` {${e.tarea}}`:``,a=e.observacion?` (${e.observacion})`:``;return`${t} [${e.contenido}] ${n}${r}${a}${i}`}).join(` · `)}function Y(e,t){if(!e.length)return`Registro de clase sin evaluaciones detectadas.`;let n=[...new Set(e.map(e=>e.tipo))].join(`, `),r=e.map(e=>e.estado),i={LOGRADO:`con logros consolidados`,EN_PROGRESO:`en progreso`,INICIADO:`iniciando contenidos`}[r.sort((e,t)=>r.filter(e=>e===t).length-r.filter(t=>t===e).length)[0]]||`evaluada`;return`Sesión de ${t||`música`} — ${n} — ${i}.`}async function X(e,t={}){let n=`
CONTEXTO:
- Clase: ${t.nombreClase||`no especificado`}
- Instrumento: ${t.instrumento||`no especificado`}
- Nivel estimado: ${t.nivel||`no especificado`}
- Total sesiones analizadas: ${e.totalSesiones}
- Período desde: ${e.fechaDesde}

REGISTROS (ordenados por frecuencia de aparición en sesiones):
${JSON.stringify(e.registros,null,2)}
`,r=I+`

`+n,i;try{i=await M([{role:`system`,content:r},{role:`user`,content:`Genera la propuesta curricular basada en estos registros.`}],.2);let e=i.replace(/^\s*```(?:json)?\s*/i,``).replace(/\s*```\s*$/i,``).trim();console.debug(`[GROQ] proposeCurriculum cleaned:`,e);let t=JSON.parse(e);return{pilares:Array.isArray(t.pilares)?t.pilares:[],resumen:t.resumen||``}}catch(e){throw console.error(`[GROQ] Error en proposeCurriculum:`,e,`| raw:`,i===void 0?`(no response)`:i),Error(`No se pudo generar la propuesta curricular. Verifica la conexión con el servicio de IA.`)}}async function Z(e){try{return await M(e)}catch(e){throw console.error(`[GROQ] Error en callGroq:`,e),e}}async function Q(e,t,n){let r=e.map(e=>{let t=e.asistencia||[],n=t.filter(e=>e.estado===`P`).length,r=t.filter(e=>e.estado===`A`).length,i=t.filter(e=>e.estado===`J`).length;return`Sesión ${e.numero_sesion} (${e.fecha}): ${n} presentes, ${r} ausentes, ${i} justificados`}).join(`
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
Usa español neutro, tono formal-institucional, sin voseo.`;try{return z(await M([{role:`user`,content:a}],.3))}catch(e){return console.error(`[groqService] generateMonthlyPatterns failed:`,e),{patrones:{positivos:[],atencion:[]},recomendaciones:{academico:``,logistica:``,talentos:``,refuerzo:``},notaDireccion:``}}}export{z as a,w as c,L as i,y as l,Z as n,X as o,Q as r,R as s,W as t};