import{i as e}from"./supabase-DtQm9tmr.js";function t(e=``){return e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^\p{L}\p{N}\s#]/gu,` `).replace(/\s+/g,` `).trim()}var n=[{estado:`DIFICULTAD`,peso:4,keywords:[`no logro`,`no logra`,`no pudo`,`no puede`,`dificultad`,`le cuesta`,`les cuesta`,`se le dificulta`,`se les dificulta`,`confunde`,`confunden`,`sigue mostrando dificultad`,`siguen mostrando dificultad`,`necesita reforzar`,`necesitan reforzar`,`falta practica`,`falta mejorar`,`todavia no`]},{estado:`LOGRADO`,peso:3,keywords:[`logro`,`logra correctamente`,`domina`,`domino`,`dominan`,`excelente`,`muy bien`,`supero`,`superaron`,`perfecto`,`completo correctamente`,`completaron correctamente`,`ya sabe`,`ya saben`]},{estado:`INICIADO`,peso:2,keywords:[`inicio`,`comenzo`,`comenzaron`,`primera vez`,`se introdujo`,`se introdujeron`,`nuevo contenido`,`empez`,`conocier`,`presentamos`]},{estado:`EN_PROGRESO`,peso:1,keywords:[`trabajo`,`trabajaron`,`practico`,`practicaron`,`repaso`,`repasaron`,`continua`,`continuan`,`sigue`,`siguen`,`mejorando`,`avanzando`,`progresando`,`van bien`,`casi`]}];function r(e){let r=t(e),i=[];for(let e of n)for(let n of e.keywords){let a=t(n);r.includes(a)&&i.push({estado:e.estado,peso:e.peso,evidence:n})}return i.length?(i.sort((e,t)=>t.peso-e.peso),{value:i[0].estado,confidence:Math.min(.95,.55+i.length*.15),evidence:i.map(e=>e.evidence)}):{value:`EN_PROGRESO`,confidence:.4,evidence:[]}}function i(e){let t=e.match(/(\d(?:[.,]\d)?)\s*\/\s*5/);if(t)return parseFloat(t[1].replace(`,`,`.`));let n=e.match(/nota[:\s]+(\d(?:[.,]\d)?)/i);return n?parseFloat(n[1].replace(`,`,`.`)):null}function a(e){let t=e.match(/\{([^}]+)\}/);if(t)return t[1].trim();let n=e.match(/(?:tarea[:\s]+|para la pr[oó]xima[,:\s]+|practicar en casa[,:\s]+)([^.!?\n]{5,80})/i);return n?n[1].trim():null}var o={CONDUCTA:[`mal comportamiento`,`mala conducta`,`conducta disruptiva`,`comportamiento negativo`,`falta de respeto`,`irrespetuoso`,`irrespetuosa`,`agresivo`,`agresiva`,`pelea`,`peleo`,`golpeo`,`insulto`,`insulto`,`indisciplina`,`indisciplinado`,`indisciplinada`,`actitud negativa`,`actitud problema`,`mala actitud`,`no quiso`,`se nego`,`berrinche`],ATENCION:[`dificultad en la atencion`,`atencion y concentracion`,`concentracion`,`se distrae`,`no logra concentrarse`,`no atiende`,`no presta atencion`,`distrae`,`falta de atencion`,`falta de concentracion`],RIESGO_PEDAGOGICO:[`frustracion`,`atraso`,`acumulando fallas`,`riesgo`,`cuesta mas`,`le cuesta`,`les cuesta`,`se le dificulta`,`se les dificulta`,`dificultad tecnica`]};function s(e,n){let r=t(e);if(n===`comportamiento`||n===`conducta`)return{active:!0,type:`CONDUCTA`,mensaje:`Alerta de comportamiento detectada.`};for(let[e,n]of Object.entries(o))if(n.some(e=>r.includes(t(e))))return{active:!0,type:e,mensaje:`Alerta de ${(e===`RIESGO_PEDAGOGICO`?`Riesgo Pedagógico`:e===`ATENCION`?`Atención y Concentración`:`Conducta`).toLowerCase()} detectada.`};return{active:!1,type:null,mensaje:null}}var c={tecnica:[`escala`,`posición`,`posicion`,`arco`,`digitación`,`digitacion`,`embocadura`,`afinación`,`afinacion`,`técnica`,`tecnica`,`vibrato`,`pizzicato`,`staccato`,`legato`,`golpe de arco`,`detaché`],repertorio:[`obra`,`pieza`,`danzón`,`danzon`,`minueto`,`sonata`,`concierto`,`sinfonía`,`sinfonia`,`compases`,`c\\.\\d`,`repertorio`,`canción`,`cancion`,`melodía`,`melodia`],teoria:[`ritmo`,`compás`,`compas`,`armonía`,`armonia`,`lectura`,`solfeo`,`teoría`,`teoria`,`nota`,`clave`,`intervalo`,`acorde`],interpretacion:[`expresión`,`expresion`,`fraseo`,`dinámica`,`dinamica`,`tempo`,`articulación`,`articulacion`,`musicalidad`,`carácter`,`caracter`]};function l(e,t=`instrumento`){if(t===`teoria`)return`teoria`;let n=e.toLowerCase();for(let[e,t]of Object.entries(c))if(t.some(e=>new RegExp(e).test(n)))return e;return t===`ensayo_general`?`repertorio`:`tecnica`}function u(e){let n=new Map;function r(e,r){if(!e)return;let i=t(e),a=n.get(i)||[];a.some(e=>e.id===r.id)||a.push(r),n.set(i,a)}for(let t of e){let e=(t.nombre||t.nombre_completo||``).toLowerCase().trim(),n=(t.nombreCorto||t.nombre_corto||t.nombre||t.nombre_completo||``).toLowerCase().trim();e&&r(e,t),n&&n!==e&&r(n,t)}e.map(e=>(e.nombre||e.nombre_completo||``).toLowerCase().trim().split(` `)[0]);for(let t of e){let e=(t.nombre||t.nombre_completo||``).toLowerCase().trim().split(` `)[0];e&&r(e,t)}return n}function d(e,t,n,r){let i=e.toLowerCase(),a=n?.length?n:r;if(/\btodos(?!\s+los\s+(?:compases|dedos|ejercicios|dias|metodos|aspectos|materiales|detalles|objetivos|retos|elementos|puntos|errores|fallas))\b|\btodo el grupo\b|\btoda la clase\b|\bel grupo\b/.test(i))return{students:a,ambiguous:!1,requires_confirmation:!1};let o=new Map,s=!1;for(let[n,r]of t.entries()){let t=n.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);RegExp(`(?<![a-záéíóúñ])${t}(?![a-záéíóúñ])`,`i`).test(e)&&(r.length>1&&(s=!0),r.forEach(e=>{o.set(e.id||e.nombre||e.nombre_completo,e)}))}return{students:Array.from(o.values()),ambiguous:s,requires_confirmation:s}}function f(e){return e.replace(/Lec\./gi,`Lec§`).replace(/c\./gi,`c§`).replace(/n\.º/gi,`n§º`).replace(/(\d)[.](\d)/g,`$1§$2`).replace(/([.!?;])\s+/g,`$1
`).split(`
`).map(e=>e.replace(/Lec§/gi,`Lec.`).replace(/c§/gi,`c.`).replace(/n§º/gi,`n.º`).replace(/(\d)§(\d)/g,`$1.$2`).trim()).filter(Boolean)}var p=/\b(?:el alumno|la alumna|este alumno|esta alumna|dicho alumno|dicha alumna)\b/i;function m(e,t={}){let{alumnos:n=[],tipoClase:o=`instrumento`}=t,c=t.presentes?.length?t.presentes:n,m=u(c),v=e.split(/\n{2,}/).map(e=>e.replace(/\n/g,` `).trim()).filter(e=>e.length>10).flatMap(e=>{let t=f(e).filter(e=>!h(e));return t.length===0?[]:t.length===1?[t[0]]:t.filter(e=>{let t=e.toLowerCase(),r=d(e,m,c,n).students.length>0,i=/\btodos(?!\s+los\s+(?:compases|dedos|ejercicios|dias|metodos|aspectos|materiales|detalles|objetivos|retos|elementos|puntos|errores|fallas))\b|\btodo el grupo\b|\btoda la clase\b|\balgunos\b/i.test(t),a=/(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(e),o=p.test(e);return r||i||a||o}).length>1?t:[t.join(` `)]});if(!v.length)return[];let y=[],b=new Set;for(let e of v){let t=e.toLowerCase(),u=/(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(e),f=/\balgunos\b/i.test(t)&&!d(e,m,c,n).students.length,{students:p,ambiguous:h,requires_confirmation:g}=d(e,m,c,n),_=/^\s*(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)\b/i.test(e),v=u&&(!p.length||_),x=!p.length&&!v&&!f,S=p.length>1||/\btodos(?!\s+los\s+(?:compases|dedos|ejercicios|dias|metodos|aspectos|materiales|detalles|objetivos|retos|elementos|puntos|errores|fallas))\b|\btodo el grupo\b|\btoda la clase\b/.test(t)||v||x,C=l(e,o),w=r(e),T=s(e,C),E=T.active?T:w.value===`DIFICULTAD`?{active:!0,type:`RIESGO_PEDAGOGICO`,mensaje:`Riesgo pedagógico detectado.`}:T;!S&&!v&&p.length===1&&(w.value===`DIFICULTAD`||E.active)&&b.add(p[0].id||p[0].nombre||p[0].nombre_completo),y.push({alumnos:p,alumnoTags:[],fragment:e,estado:w,nota:i(e),tarea:a(e),esColectivo:S,isExclusion:v,isIndeterminado:f,alerta:E.active||w.value===`DIFICULTAD`,alertDetails:E,tipoClase:o,ambiguous:h,requires_confirmation:g,scope:`individual`})}g(y);for(let e of y)if(e.isExclusion){let t=Array.from(b);e.alumnos=c.filter(e=>{let n=e.id||e.nombre||e.nombre_completo;return!t.includes(n)}),e.esColectivo=!0,e.scope=`grupo_excluyendo`,e.excludeIds=t,e.alumnoTags=[`Todos (excluyendo)`]}else e.isIndeterminado?(e.alumnos=[],e.esColectivo=!1,e.scope=`subgrupo_indeterminado`,e.requires_confirmation=!0,e.alumnoTags=[`Algunos`]):(e.scope=e.esColectivo?`grupo`:`individual`,e.esColectivo&&!e.alumnos.length?(e.alumnos=c,e.alumnoTags=[`Todos`]):e.alumnoTags=e.esColectivo?[`Todos`]:e.alumnos.map(e=>e.nombreCorto||e.nombre_corto||e.nombre||e.nombre_completo));return _(y,c,m)}function h(e){let n=t(e);return/^es fundamental\b/.test(n)||/^es importante (que|senalar|notar|destacar)\b/.test(n)||/\bdebemos continuar\b/.test(n)||/\bpara asegurarnos\b/.test(n)||/\bde manera equilibrada\b/.test(n)||/\bcontinuemos trabajando\b/.test(n)||/\bseguir trabajando\b/.test(n)||/\bcontinuar practicando\b/.test(n)}function g(e){let t=[],n=!1;for(let r of e){if(r.alumnos?.length>0){!r.esColectivo&&!r.isExclusion&&!r.isIndeterminado?(t=r.alumnos,n=!0):n=!1;continue}n&&t.length&&p.test(r.fragment)&&(r.alumnos=[...t],r.esColectivo=t.length>1,r.inherited_subject=!0)}}function _(e,n,r){let i=[];for(let n of e){if(!n.alerta||n.esColectivo||n.isIndeterminado){i.push(n);continue}let e=f(n.fragment),r=e.some(e=>{let n=t(e);return o.RIESGO_PEDAGOGICO.some(e=>n.includes(t(e)))}),a=e.some(e=>{let n=t(e);return o.ATENCION.some(e=>n.includes(t(e)))});if(r&&a){let r=e.filter(e=>{let n=t(e);return o.ATENCION.some(e=>n.includes(t(e)))}),a=e.filter(e=>!r.includes(e));a.length&&i.push({...n,fragment:a.join(` `),alertDetails:{active:!0,type:`RIESGO_PEDAGOGICO`,mensaje:`Riesgo pedagógico detectado.`}}),r.length&&i.push({...n,fragment:r.join(` `),alertDetails:{active:!0,type:`ATENCION`,mensaje:`Alerta de atención y concentración detectada.`}})}else i.push(n)}return i}function v(e){let t=[];for(let n=0;n<e.length;n++)for(let r=n+1;r<e.length;r++){let i=e[n],a=e[r];if(!y(i.alumnos,a.alumnos)||!b(i.contenido,a.contenido))continue;let o=i.nota!=null&&a.nota!=null&&Math.abs(i.nota-a.nota)>1.5,s=i.estado!==a.estado&&(i.estado===`LOGRADO`&&a.estado===`INICIADO`||i.estado===`INICIADO`&&a.estado===`LOGRADO`);if(o||s){let e=o?`Notas contradictorias: ${i.nota}/5 vs ${a.nota}/5 para "${i.contenido}"`:`Estados contradictorios: ${i.estado} vs ${a.estado} para "${i.contenido}"`;t.push({idxA:n,idxB:r,reason:e})}}return t}function y(e,t){if(!e?.length||!t?.length||e.length!==t.length)return!1;let n=new Set(e.map(e=>e.toLowerCase()));return t.every(e=>n.has(e.toLowerCase()))}function b(e,t){if(!e||!t)return!1;let n=e=>e.toLowerCase().replace(/[^a-záéíóúñ0-9]/g,` `).trim(),r=n(e),i=n(t);return r===i?!0:r.includes(i)||i.includes(r)}var x={cuerdas:[`violín`,`viola`,`violonchelo`,`violoncello`,`contrabajo`],violines:[`violín`],violas:[`viola`],cellos:[`violonchelo`,`violoncello`],contrabajos:[`contrabajo`],maderas:[`flauta`,`oboe`,`clarinete`],vientos_madera:[`flauta`,`oboe`,`clarinete`],flautas:[`flauta`],oboes:[`oboe`],clarinetes:[`clarinete`],tutti:[],general:[],individual:[]};function S(e){return!e||typeof e!=`string`?``:e.trim().toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).split(/\s+/).map(e=>e.endsWith(`es`)&&e.length>4?e.slice(0,-2):e.endsWith(`s`)&&!e.endsWith(`es`)&&e.length>3?e.slice(0,-1):e).join(` `)}function C(e,t=[]){let n=x[e];if(!n)return console.warn(`[seccionesOrquestales] Sección "${e}" no encontrada en el mapa`),[];if(e===`tutti`||e===`general`)return t.map(w);if(e===`individual`)return[];let r=n.map(S);return t.filter(e=>{let t=S(e.instrumento_principal||e.instrumento||``);return r.some(e=>t.includes(e))}).map(w)}function w(e){return{id:e.id,nombre_completo:e.nombre_completo||e.nombre||``,instrumento_principal:e.instrumento_principal||e.instrumento||``}}function T(e,t=[]){return e.map(e=>{if(e.seccion===`individual`||e.es_colectivo===!0||e.alumnos&&e.alumnos.length>0)return e;let n=e.seccion||`general`;if(!(n in x))return e;let r=C(n,t).map(e=>e.nombre_completo);return{...e,alumnos:r}})}function E(e=[]){let t=[`SECCIONES:`];for(let[n,r]of Object.entries(x)){let i=C(n,e);if(i.length===0)continue;let a=r.length>0?r.join(`, `):n,o=i.map(e=>e.nombre_completo).join(`, `);t.push(`- ${n} (${a}): ${o}`)}return t.join(`
`)}var D={model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,temperature:.2};function O(){return`https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/groq-proxy`}async function k(){let{data:{session:t}}=await e.auth.getSession();return{Authorization:`Bearer ${t?.access_token??``}`,"Content-Type":`application/json`,apikey:`sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P`}}async function A(e,t=D.temperature){let n=await k(),r=await fetch(`${O()}/chat`,{method:`POST`,headers:n,body:JSON.stringify({model:D.model,messages:e,temperature:t})}),i;try{i=await r.json()}catch{throw Error(`Groq proxy returned non-JSON (status ${r.status})`)}if(!r.ok||i.error){let e=i.error?.message??i.error??`Groq proxy error ${r.status}`;throw console.error(`[GROQ] proxyChat error response:`,r.status,i),Error(e)}let a=i.choices?.[0]?.message?.content;if(!a)throw console.error(`[GROQ] proxyChat: empty or missing content in response`,i),Error(`Groq devolvió una respuesta vacía`);return a.trim()}var j=`
Eres un experto en escritura pedagógica y claridad profesional.
Tu tarea es MEJORAR el texto que recibes del maestro, enfocándose en:
1. Gramática y ortografía correctas
2. Claridad y concisión
3. Tono profesional pero accesible
4. Agregar perspectivas pedagógicas cuando sea relevante
5. Mantener la voz y estilo del maestro original

Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni cambios de significado.
`,M=`
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
`,N=`Eres un analista pedagógico musical.

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
`,P=`
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
`;async function F(e){try{return await A([{role:`system`,content:j},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en improveText:`,e),e}}async function I(e,t={}){let n=t.presentes?.join(`, `)||``,r=t.indicadorActivo||`ninguno`,i=M+`\n\nCONTEXTO ADICIONAL:\nAlumnos en clase: ${n||`no especificados`}\nIndicador activo en la ruta: ${r}\n`;try{return await A([{role:`system`,content:i},{role:`user`,content:e}])}catch(e){throw console.error(`[GROQ] Error en structureTextToDSL:`,e),e}}function L(e){let t=e.replace(/^\s*```(?:json)?\s*/i,``).replace(/\s*```\s*$/i,``).trim();t=t.replace(/[‘’]/g,`'`).replace(/[“”]/g,`"`);try{return JSON.parse(t)}catch{}try{return JSON.parse(z(t))}catch{}try{return JSON.parse(R(t))}catch{}try{return JSON.parse(R(z(t)))}catch{}let n=t.match(/\{[\s\S]*/);if(n){let e=R(n[0]);try{return JSON.parse(e)}catch{}try{return JSON.parse(z(e))}catch{}}let r=t.match(/\[[\s\S]*/);if(r){let e=R(r[0]);try{return JSON.parse(e)}catch{}try{return JSON.parse(z(e))}catch{}}throw SyntaxError(`Unable to repair Groq JSON response`)}function R(e){let t=[],n=!1,r=0;for(;r<e.length;){let i=e[r];if(n){if(i===`\\`){r+=2;continue}i===`"`&&(n=!1)}else i===`"`?n=!0:i===`{`?t.push(`}`):i===`[`?t.push(`]`):(i===`}`||i===`]`)&&t.pop();r++}let i=n?`"`:``;return i+=t.reverse().join(``),e+i}function z(e){let t=``,n=!1,r=0;for(;r<e.length;){let i=e[r];if(n&&i===`\\`){t+=i+(e[r+1]??``),r+=2;continue}if(i===`"`)if(!n)n=!0,t+=i;else{let a=r+1;for(;a<e.length&&(e[a]===` `||e[a]===`	`);)a++;let o=e[a];o===`,`||o===`:`||o===`}`||o===`]`||o===`
`||o===`\r`||a>=e.length?(n=!1,t+=i):t+=`\\"`}else t+=i;r++}return t}function B(e,t){let n=new Set(t.map(e=>(e.nombre||e.nombre_completo||``).toLowerCase().trim()));return e.map(e=>{let t=e.nota;t!=null&&(t=Math.round(Math.min(5,Math.max(0,Number(t)))*2)/2,isNaN(t)&&(t=null));let r=[`LOGRADO`,`EN_PROGRESO`,`INICIADO`].includes(e.estado)?e.estado:`EN_PROGRESO`,i=[];Array.isArray(e.alumnos)&&(i=e.alumnos.filter(e=>{if(!e||typeof e!=`string`)return!1;let t=e.toLowerCase().trim();return n.has(t)||[...n].some(e=>e.includes(t)||t.includes(e))}));let a=!!e.seccion&&![`general`,`individual`].includes(e.seccion),o=e.es_colectivo===!0||i.length===0&&!a;return{contenido:e.contenido||``,alumnos:o?[]:i,es_colectivo:o,seccion:e.seccion||`general`,estado:r,nota:t,observacion:e.observacion||null,tarea:e.tarea||null,explicacion_objetiva:e.explicacion_objetiva||null}})}function V(e,t){return e.map(e=>e.es_colectivo?{...e,alumnos:t.map(e=>e.nombre||e.nombre_completo||``)}:e)}async function H(e,t={}){let n=t.presentes?.length?t.presentes:t.alumnos||[],r={observacion:e,alumnosPresentes:n.map(e=>e.nombre||e.nombre_completo||``),tipoClase:t.tipoClase||`instrumento`,instrumento:t.instrumento||`música`},i=E(n),a=N.replace(`__SECCIONES_CONTEXT__`,i),o=[],s=``;try{let e=L(await A([{role:`system`,content:a},{role:`user`,content:JSON.stringify(r)}],.1)),t=e&&Array.isArray(e.items)?e.items:null;t&&t.length>0&&(o=t,s=e.resumen||``)}catch(e){console.warn(`[GROQ] analyzeObservation — full analysis failed, falling back:`,e.message)}if(!o.length)return U(e,t,n);let c=V(T(B(o,n),n),n).map(e=>{let n=l((e.contenido||``)+` `+(e.observacion||``),t.tipoClase);return{alumnos:e.alumnos,contenido:e.contenido,tipo:n,estado:e.estado,nota:e.nota,tarea:e.tarea,observacion:e.observacion,es_colectivo:e.es_colectivo,seccion:e.seccion,explicacion_objetiva:e.explicacion_objetiva,alerta:!1,alertaTipo:null,alertDetails:null}});return{dsl:K(c,n),progreso:c,resumen:s||q(c,t.instrumento)}}async function U(e,t,n){let r=t.alumnos||[],i=m(e,{...t,alumnos:r,presentes:n});if(!i.length)return{dsl:``,progreso:[],resumen:`Registro general de clase sin evaluaciones detectadas.`};let a={instrumento:t.instrumento||`música`,tipoClase:t.tipoClase||`instrumento`,groups:i.map((e,r)=>({id:`g_${r+1}`,fragment:W(e.fragment,n),estado:e.estado?.value||e.estado,tipo:l(e.fragment,t.tipoClase),scope:e.scope||`grupo`}))},o=i.map(()=>({contenido:``,observacion:``})),s;try{s=await A([{role:`system`,content:`Eres un asistente pedagógico musical.
Recibes grupos de progreso ya detectados de un texto de observación musical.
Tu tarea es completar únicamente "contenido" (etiqueta breve, máx 50 chars) y "observacion" (resumen, máx 80 chars).
Responde JSON: {"items":[{"id":"g_1","contenido":"...","observacion":"..."}]}
Sin markdown, sin explicaciones.`},{role:`user`,content:JSON.stringify(a)}],.1);let e=L(s),t=e&&Array.isArray(e.items)?e.items:Array.isArray(e)?e:null;t&&t.length===i.length?o=t:t&&(o=i.map((e,n)=>t.find(e=>e.id===`g_${n+1}`)||t[n]||{contenido:``,observacion:``}))}catch(e){console.warn(`[GROQ] Legacy enrich failed:`,e.message)}let c=i.map((e,n)=>{let r=o[n]||{},i=(r.contenido||``).trim()||G(e.fragment),a=l(i+` `+e.fragment,t.tipoClase);return{alumnos:e.alumnos.map(e=>e.nombre||e.nombre_completo||e.nombreCorto),contenido:i,tipo:a,estado:e.estado?.value||e.estado,nota:e.nota,tarea:e.tarea,observacion:(r.observacion||``).trim()||null,es_colectivo:e.esColectivo,alerta:e.alerta||!1,alertaTipo:e.alertDetails?.type||null,alertDetails:e.alertDetails,scope:e.scope||`grupo`,excludeIds:e.excludeIds||[],requires_confirmation:e.requires_confirmation||!1}});return{dsl:K(c,n),progreso:c,resumen:q(c,t.instrumento)}}function W(e,t){let n=e;for(let e of t){let t=(e.nombre||e.nombre_completo||``).toLowerCase().trim(),r=(e.nombreCorto||e.nombre_corto||e.nombre||e.nombre_completo||``).toLowerCase().trim(),i=e=>e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);t&&(n=n.replace(new RegExp(i(t),`gi`),``)),r&&r!==t&&(n=n.replace(new RegExp(i(r),`gi`),``));let a=(e.nombre||e.nombre_completo||``).toLowerCase().trim().split(` `)[0];a&&(n=n.replace(RegExp(`#${i(a)}`,`gi`),``),n=n.replace(RegExp(`\\b${i(a)}\\b`,`gi`),``))}return n.replace(/\s+/g,` `).replace(/^\s*[,.;]\s*/,``).trim()}function G(e){return e.replace(/\d\/5/g,``).replace(/\{[^}]*\}/g,``).replace(/\([^)]*\)/g,``).replace(/\b(todos|todo|grupo|clase|el|la|los|las|un|una)\b/gi,``).trim().slice(0,50)||`Clase`}function K(e,t){return e.map(e=>{let t=e.es_colectivo?`#Todos`:e.alumnos?.length?e.alumnos.map(e=>`#${e.replace(/\s+/g,`_`)}`).join(`, `):`#General`,n=`!${e.estado}`,r=e.nota?` ${e.nota}/5`:``,i=e.tarea?` {${e.tarea}}`:``,a=e.observacion?` (${e.observacion})`:``;return`${t} [${e.contenido}] ${n}${r}${a}${i}`}).join(` · `)}function q(e,t){if(!e.length)return`Registro de clase sin evaluaciones detectadas.`;let n=[...new Set(e.map(e=>e.tipo))].join(`, `),r=e.map(e=>e.estado),i={LOGRADO:`con logros consolidados`,EN_PROGRESO:`en progreso`,INICIADO:`iniciando contenidos`}[r.sort((e,t)=>r.filter(e=>e===t).length-r.filter(t=>t===e).length)[0]]||`evaluada`;return`Sesión de ${t||`música`} — ${n} — ${i}.`}async function J(e,t={}){let n=`
CONTEXTO:
- Clase: ${t.nombreClase||`no especificado`}
- Instrumento: ${t.instrumento||`no especificado`}
- Nivel estimado: ${t.nivel||`no especificado`}
- Total sesiones analizadas: ${e.totalSesiones}
- Período desde: ${e.fechaDesde}

REGISTROS (ordenados por frecuencia de aparición en sesiones):
${JSON.stringify(e.registros,null,2)}
`,r=P+`

`+n,i;try{i=await A([{role:`system`,content:r},{role:`user`,content:`Genera la propuesta curricular basada en estos registros.`}],.2);let e=i.replace(/^\s*```(?:json)?\s*/i,``).replace(/\s*```\s*$/i,``).trim();console.debug(`[GROQ] proposeCurriculum cleaned:`,e);let t=JSON.parse(e);return{pilares:Array.isArray(t.pilares)?t.pilares:[],resumen:t.resumen||``}}catch(e){throw console.error(`[GROQ] Error en proposeCurriculum:`,e,`| raw:`,i===void 0?`(no response)`:i),Error(`No se pudo generar la propuesta curricular. Verifica la conexión con el servicio de IA.`)}}async function Y(e){try{return await A(e)}catch(e){throw console.error(`[GROQ] Error en callGroq:`,e),e}}async function X(e,t,n){let r=e.map(e=>{let t=e.asistencia||[],n=t.filter(e=>e.estado===`P`).length,r=t.filter(e=>e.estado===`A`).length,i=t.filter(e=>e.estado===`J`).length;return`Sesión ${e.numero_sesion} (${e.fecha}): ${n} presentes, ${r} ausentes, ${i} justificados`}).join(`
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
Usa español neutro, tono formal-institucional, sin voseo.`;try{return L(await A([{role:`user`,content:a}],.3))}catch(e){return console.error(`[groqService] generateMonthlyPatterns failed:`,e),{patrones:{positivos:[],atencion:[]},recomendaciones:{academico:``,logistica:``,talentos:``,refuerzo:``},notaDireccion:``}}}export{L as a,C as c,F as i,v as l,Y as n,J as o,X as r,I as s,H as t};