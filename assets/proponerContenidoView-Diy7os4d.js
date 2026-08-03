import{s as e}from"./AppModal-Du6jXNYA.js";import{i as t}from"./supabase-Cgh_dhNB.js";import{y as n}from"./planificacion-BfUtaQ33.js";import{t as r}from"./config-CNiOV0RX.js";import{n as i}from"./groqService-Cu889xeB.js";var a=`
Eres un arquitecto pedagógico experto en el sistema SOI (Sistema Operativo Institucional).
Tu tarea es analizar una planificación académica y extraer su estructura curricular en 4 niveles jerárquicos (que se colgarán de la Clase seleccionada).

Debes devolver un objeto JSON estrictamente formateado con esta estructura:
{
  "niveles": [
    {
      "nombre": "Nombre del nivel (ej: Nivel 1 - Iniciación)",
      "objetivo_general": "Objetivo principal del nivel",
      "numero_nivel": 1,
      "temas": [
        {
          "nombre": "Nombre del tema (ej: Postura y Embocadura)",
          "tipo": "TECNICA | SONIDO | AFINACION | ARCO | MANO_IZQ | REPERTORIO",
          "es_critico": true/false,
          "objetivos": [
            {
              "nombre": "Nombre del objetivo (ej: Mantener la espalda recta)",
              "indicadores": [
                {
                  "descripcion": "Descripción del indicador evaluable",
                  "es_requerido": true/false
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

Reglas CRÍTICAS:
1. Respeta los 4 niveles: Nivel -> Tema -> Objetivo -> Indicador.
2. Los indicadores son la unidad mínima de evaluación.
3. Clasifica cada Tema en uno de los tipos (TECNICA, SONIDO, AFINACION, etc.).
4. Responde ÚNICAMENTE con el bloque JSON.
`;async function o(e){window.pdfjsLib||(await u(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js`),window.pdfjsLib.GlobalWorkerOptions.workerSrc=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`);let t=await e.arrayBuffer(),n=await window.pdfjsLib.getDocument({data:t}).promise,r=``;for(let e=1;e<=n.numPages;e++){let t=await(await n.getPage(e)).getTextContent();r+=t.items.map(e=>e.str).join(` `)+`
`}return r}async function s(e){window.mammoth||await u(`https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.0/mammoth.browser.min.js`);let t=await e.arrayBuffer();return(await window.mammoth.extractRawText({arrayBuffer:t})).value}async function c(e){return await e.text()}async function l(e,t){window.Tesseract||await u(`https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js`);let n=await window.Tesseract.createWorker({logger:e=>{e.status===`recognizing`&&t&&t(Math.round(e.progress*100)),console.log(`[OCR Progress] ${e.status}: ${(e.progress*100).toFixed(1)}%`)}});await n.loadLanguage(`spa`),await n.initialize(`spa`);let{data:{text:r}}=await n.recognize(e);return await n.terminate(),r}function u(e){return new Promise((t,n)=>{let r=document.createElement(`script`);r.src=e,r.onload=t,r.onerror=n,document.head.appendChild(r)})}var d=5e3,f=/(?=^Nivel\b)/m;function p(e,{maxChars:t=d}={}){let n=e.split(f).filter(e=>e.trim().length>0);if(n.length>1)return n;if(e.length<=t)return[e];let r=[];for(let n=0;n<e.length;n+=t)r.push(e.slice(n,n+t));return r}function m(e){if(!e||!Array.isArray(e.niveles))throw Error(`Estructura inválida: falta la clave "niveles" (debe ser un array).`);return e.niveles.forEach((e,t)=>{if(!Array.isArray(e?.temas))throw Error(`Estructura inválida: el nivel #${t+1} no tiene "temas" (debe ser un array).`);e.temas.forEach((e,n)=>{if(!Array.isArray(e?.objetivos))throw Error(`Estructura inválida: el tema #${n+1} del nivel #${t+1} no tiene "objetivos" (debe ser un array).`);e.objetivos.forEach((e,t)=>{if(!Array.isArray(e?.indicadores))throw Error(`Estructura inválida: el objetivo #${t+1} del tema #${n+1} no tiene "indicadores" (debe ser un array).`);e.indicadores.forEach((e,n)=>{if(!e||typeof e.descripcion!=`string`||!e.descripcion.trim())throw Error(`Estructura inválida: el indicador #${n+1} del objetivo #${t+1} no tiene "descripcion".`)})})})}),!0}function h(e){return{niveles:e.flatMap(e=>Array.isArray(e?.niveles)?e.niveles:[])}}async function g(e){let t=(await i([{role:`system`,content:a},{role:`user`,content:`Analiza esta planificación y devuelve SOLO el JSON:\n\n${e}`}])).match(/\{[\s\S]*\}/);if(!t)throw Error(`La IA no devolvió un formato de datos válido.`);return JSON.parse(t[0].trim())}async function _(e,t){let n=``,r=e.name.split(`.`).pop().toLowerCase();try{if(r===`pdf`)n=await o(e);else if(r===`docx`)n=await s(e);else if(r===`md`||r===`txt`)n=await c(e);else if([`jpg`,`jpeg`,`png`].includes(r))n=await l(e,t);else throw Error(`Formato no soportado. Usa PDF, DOCX, MD o Imágenes.`);if(!n.trim())throw Error(`El archivo parece estar vacío o no contiene texto legible.`);let i=p(n),a=[];for(let e of i)a.push(await g(e));let u=i.length>1?h(a):a[0];return m(u),u}catch(e){throw console.error(`[PlanningParser] Error:`,e),e}}var v=e({enviarPropuesta:()=>b});function y(e=80){return new Promise(t=>setTimeout(t,e))}async function b(e,{maestroId:t,claseId:r}={}){if(!t)throw Error(`enviarPropuesta: se requiere maestroId.`);if(!r)throw Error(`enviarPropuesta: se requiere claseId.`);return await y(),n({id:`demo-route-version-propuesta-${Date.now()}`,route_id:`demo-route-1`,clase_id:r,origen:`maestro`,status:`propuesta`,propuesta_por:t,feedback:null,created_at:new Date().toISOString(),estructura:e})}var x=e({enviarPropuesta:()=>S});async function S(e,{maestroId:n,claseId:r}={}){if(!n)throw Error(`enviarPropuesta: se requiere maestroId.`);if(!r)throw Error(`enviarPropuesta: se requiere claseId.`);let i=await C(r),{data:a,error:o}=await t.from(`route_versions`).insert({route_id:i,version:`propuesta-${Date.now()}`,origen:`maestro`,status:`propuesta`,propuesta_por:n,clase_id:r}).select().single();if(o)throw o;return await w(a.id,e.niveles||[]),a}async function C(e){let{data:n,error:r}=await t.from(`route_versions`).select(`route_id`).eq(`clase_id`,e).order(`created_at`,{ascending:!1}).limit(1);if(r)throw r;let i=Array.isArray(n)?n[0]:n;if(!i?.route_id)throw Error(`No se encontró una ruta existente asociada a esta clase.`);return i.route_id}async function w(e,n){for(let[r,i]of n.entries()){let{data:n,error:a}=await t.from(`levels`).insert({route_version_id:e,level_number:i.numero_nivel??r+1,name:i.nombre,main_objective:i.objetivo_general||null}).select().single();if(a)throw a;await T(e,n.id,i.temas||[])}}async function T(e,n,r){for(let[i,a]of r.entries()){let{data:r,error:o}=await t.from(`nodes`).insert({level_id:n,route_version_id:e,name:a.nombre,type:a.tipo||`TECNICA`,is_critical:!!a.es_critico,order_index:i}).select().single();if(o)throw o;await E(r.id,a.objetivos||[])}}async function E(e,n){for(let[r,i]of n.entries()){let{data:n,error:a}=await t.from(`objetivos`).insert({node_id:e,nombre:i.nombre,order_index:r}).select().single();if(a)throw a;let o=(i.indicadores||[]).map((t,r)=>({node_id:e,objetivo_id:n.id,description:t.descripcion,is_required:t.es_requerido!==!1,order_index:r}));if(o.length){let{error:e}=await t.from(`indicators`).insert(o);if(e)throw e}}}var D=r.isDemoMode?v:x,O=(e,t)=>D.enviarPropuesta(e,t);function k(e,{maestroId:t,claseId:n}={}){e.innerHTML=`
    <div class="pm-proponer-container">
      <div style="display:flex; gap:0; border-bottom:1px solid var(--pm-border);">
        <button type="button" class="pm-tab-btn active" data-tab="upload">Subir archivo</button>
        <button type="button" class="pm-tab-btn" data-tab="revisar">Revisar</button>
      </div>

      <div class="pm-tab-pane" data-pane="upload">
        <p class="apple-caption">Subí una planificación (PDF, DOCX, MD o imagen) para extraer su estructura curricular.</p>
        <input type="file" data-role="file-input" accept=".pdf,.docx,.md,.txt,.jpg,.jpeg,.png" />
        <div data-role="upload-status"></div>
      </div>

      <div class="pm-tab-pane d-none" data-pane="revisar">
        <div data-role="tree-preview"></div>
        <div class="pm-proponer-actions" style="margin-top:1rem; display:flex; gap:0.5rem;">
          <button type="button" class="btn-apple-primary" data-action="proponer">Proponer</button>
          <button type="button" class="btn-apple-secondary" data-action="borrador">Guardar borrador</button>
          <button type="button" class="btn-apple-secondary" data-action="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  `;let r=e.querySelectorAll(`.pm-tab-btn`),i=e.querySelectorAll(`.pm-tab-pane`),a=e=>{r.forEach(t=>t.classList.toggle(`active`,t.dataset.tab===e)),i.forEach(t=>t.classList.toggle(`d-none`,t.dataset.pane!==e))};r.forEach(e=>e.addEventListener(`click`,()=>a(e.dataset.tab)));let o=e.querySelector(`[data-role="file-input"]`),s=e.querySelector(`[data-role="upload-status"]`),c=e.querySelector(`[data-role="tree-preview"]`),l=null;o.addEventListener(`change`,async()=>{let e=o.files?.[0];if(e){s.innerHTML=`<div class="pm-spinner pm-spinner-sm"></div> Procesando "${e.name}"...`;try{l=await _(e),s.innerHTML=``,c.innerHTML=A(l.niveles||[]),a(`revisar`)}catch(e){console.error(`[proponerContenidoView] Error al parsear:`,e),l=null,s.innerHTML=`<p class="pm-error">${j(e.message)}</p>`}}}),e.querySelector(`[data-action="proponer"]`).addEventListener(`click`,async()=>{if(l)try{await O(l,{maestroId:t,claseId:n}),window.alert(`Propuesta enviada. El equipo ACM la revisará.`),l=null,o.value=``,c.innerHTML=``,a(`upload`)}catch(e){console.error(`[proponerContenidoView] Error al proponer:`,e),window.alert(`Error al enviar la propuesta: ${e.message}`)}}),e.querySelector(`[data-action="borrador"]`).addEventListener(`click`,()=>{window.alert(`El borrador se mantiene en esta pantalla. Podés seguir editando o proponerlo más tarde.`)}),e.querySelector(`[data-action="cancelar"]`).addEventListener(`click`,()=>{l=null,o.value=``,c.innerHTML=``,s.innerHTML=``,a(`upload`)})}function A(e){return e.length?e.map(e=>`
      <div class="pm-tree-level">
        <strong>${j(e.nombre||``)}</strong>
        ${(e.temas||[]).map(e=>`
          <div class="pm-tree-node" style="margin-left:1rem;">
            <em>${j(e.nombre||``)}</em>
            ${(e.objetivos||[]).map(e=>`
              <div class="pm-tree-objetivo" style="margin-left:1rem;">
                ${j(e.nombre||``)}
                <ul>
                  ${(e.indicadores||[]).map(e=>`<li>${j(e.descripcion||``)}</li>`).join(``)}
                </ul>
              </div>
            `).join(``)}
          </div>
        `).join(``)}
      </div>
    `).join(``):`<p class="apple-caption">Sin niveles detectados.</p>`}function j(e){return e?String(e).replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]):``}export{k as renderProponerContenidoView};