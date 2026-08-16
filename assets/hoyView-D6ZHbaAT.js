const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/InsigniaCelebrationOverlay-Bqb6K9i4.js","assets/AppModal-Du6jXNYA.js","assets/supabase-Cgh_dhNB.js","assets/portalUtils-CkF82Yyk.js","assets/AchievementsSummaryModal-DrGzVr84.js"])))=>i.map(i=>d[i]);
import{i as e}from"./AppModal-Du6jXNYA.js";import{a as t,c as n,d as r,f as i,g as a,h as o,i as s,l as c,n as l,o as u,r as d,s as f,t as p,u as m}from"./pwaInstaller-CABasb_l.js";import{a as h,i as g}from"./supabase-Cgh_dhNB.js";import{i as _}from"./maestroAuth-BMzDPnai.js";import{r as v,t as y}from"./jspdf.plugin.autotable-DPzO4huE.js";import{t as b}from"./groqService-BEo2aU8D.js";import{t as x}from"./academicService-b7bfwMLY.js";import{a as S,i as C,o as w,r as T}from"./portalUtils-CkF82Yyk.js";import{a as E,c as D,i as O,l as k,n as A,o as j,r as M,t as N}from"./maestroRouteService-C-CCRznf.js";import{u as ee}from"./weeklyPlanAdapter-E65PNMYx.js";import{t as te}from"./catalogService-M5LBxZnn.js";import{t as ne}from"./claseEmergenteModal-DzBloOSJ.js";import{t as re}from"./claseAnalysisModal-D4_bAre7.js";var P={azul:[20,60,130],azulClaro:[220,232,250],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248]},F=215.9,I=279.4,ie=14;function ae(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function oe(e,t=`—`){return String(e??``).trim()||t}function se(e,t=``){e.setFillColor(...P.azul),e.rect(0,0,F,32,`F`),e.setFillColor(...P.dorado),e.rect(0,32,F,2.5,`F`),e.setFillColor(...P.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...P.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,16,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Tocamos Corazones, Cambiamos Vidas · Punta Cana`,16,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...P.dorado),e.text(`RUTA PERSONAL DEL MAESTRO`,F-ie,13,{align:`right`}),t&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(t,F-ie,20,{align:`right`})),e.setTextColor(...P.grisOscuro)}function ce(e,t){e.setFillColor(...P.azul),e.rect(0,I-8,F,8,`F`),e.setFillColor(...P.dorado),e.rect(0,I-8,4,8,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...P.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,16,I-4.5),e.text(`Pág. ${t}`,F-ie,I-4.5,{align:`right`})}function le(e,t){return`ruta-maestro-${String(e||`ruta`).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}-${t}.pdf`}function ue(e=[],t=new Map){return e.map(e=>({unidadNombre:e.nombre,objetivos:(e.objetivos||[]).map(e=>({nombre:e.nombre,indicadores:(e.indicadores||[]).map(e=>{let n=t.get(e.id);return{nombre:e.nombre,nota:n?.promedio??null,evaluados:n?.evaluados??0}})}))}))}function de({claseNombre:e,maestroNombre:t=``,unidades:n=[]}){let r=new v({unit:`mm`,format:`letter`}),i=ae(),a=le(e,new Date().toISOString().slice(0,10));if(se(r,`Generado: ${i}`),r.setFillColor(...P.azulClaro),r.roundedRect(ie,42,F-ie*2,18,2,2,`F`),r.setFont(`helvetica`,`bold`),r.setFontSize(13),r.setTextColor(...P.azul),r.text(oe(e),18,49),r.setFont(`helvetica`,`normal`),r.setFontSize(8),r.setTextColor(...P.grisMedio),r.text(`Maestro: ${oe(t)}  ·  Generado: ${i}`,18,56),n.length===0){r.setFont(`helvetica`,`italic`),r.setFontSize(9),r.setTextColor(...P.grisMedio),r.text(`Esta ruta todavía no tiene unidades.`,ie,66),ce(r,1),r.save(a);return}let o=[];n.forEach((e,t)=>{(e.objetivos||[]).forEach((n,r)=>{let i=`${t+1}.${r+1}`,a=n.indicadores||[];if(a.length===0){o.push([r===0?e.unidadNombre:``,i,oe(n.nombre),`(sin indicadores)`,`—`]);return}a.forEach((t,a)=>{let s=t.nota==null?`—`:`${t.nota.toFixed(1)} (n=${t.evaluados})`;o.push([r===0&&a===0?e.unidadNombre:``,a===0?i:``,a===0?oe(n.nombre):``,oe(t.nombre),s])})})}),y(r,{startY:66,margin:{top:44,left:ie,right:ie},theme:`grid`,head:[[`Unidad`,`#`,`Objetivo`,`Indicador`,`Nota promedio`]],headStyles:{fillColor:P.azul,textColor:P.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`,valign:`top`},alternateRowStyles:{fillColor:P.grisClaro},columnStyles:{0:{cellWidth:24,fontStyle:`bold`},1:{cellWidth:10},2:{cellWidth:38},3:{cellWidth:78},4:{cellWidth:24,textColor:[217,119,6]}},body:o,didDrawPage:t=>{se(r,`${e}`),ce(r,t.pageNumber)}}),ce(r,1),r.save(a)}var fe=0;function pe(e=`tmp`){return fe+=1,`${e}-${Date.now()}-${fe}`}function me({maestroId:t,claseId:r,route:i=null,onSaved:a}={}){if(!t||!r){e.error(`Falta identificar al maestro o la clase`);return}let o={routeId:i?.id||null,nombre:i?.nombre||``,unidades:ge(i?.unidades||[])},s=document.createElement(`div`);s.className=`trb-backdrop`,s.innerHTML=`
    <div class="trb-modal" role="dialog" aria-modal="true" aria-label="Mapa de rutas">
      <div class="trb-header">
        <div class="trb-header-titles">
          <h3>${i?`Editar`:`Nuevo`} mapa de rutas</h3>
          <span class="trb-header-subtitle" id="trb-header-subtitle"></span>
        </div>
        <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="trb-body">
        <label class="trb-field">
          <span>Nombre de la ruta</span>
          <input type="text" class="trb-input" id="trb-nombre" placeholder="Ej. Violín Nivel 1 — Grupo A" value="${C(o.nombre)}" />
        </label>

        <div class="trb-actions-row">
          <button class="trb-btn trb-btn-secondary" id="trb-btn-clonar" ${i?``:`disabled title="Guarda primero para poder clonar"`}>
            <i class="bi bi-copy"></i> Clonar esta ruta
          </button>
          <button class="trb-btn trb-btn-secondary" id="trb-btn-exportar-pdf" ${i?``:`disabled title="Guarda primero para poder exportar"`}>
            <i class="bi bi-file-earmark-pdf"></i> Exportar a PDF
          </button>
          <button class="trb-btn trb-btn-secondary" id="trb-btn-acm" disabled title="Próximamente: el catálogo institucional ACM aún no está disponible en esta versión">
            <i class="bi bi-diagram-3"></i> Importar desde ACM (próximamente)
          </button>
        </div>

        <div class="trb-unidades" id="trb-unidades"></div>

        <div class="trb-actions-row">
          <button class="trb-btn trb-btn-add-unidad" id="trb-add-unidad">
            <i class="bi bi-plus-circle"></i> Agregar Unidad
          </button>
          <button class="trb-btn trb-btn-secondary" id="trb-btn-ia-unidad">
            <i class="bi bi-stars"></i> Sugerir unidad con IA
          </button>
        </div>
      </div>
      <div class="trb-footer">
        <button class="trb-btn trb-btn-ghost" id="trb-cancelar">Cancelar</button>
        <button class="trb-btn trb-btn-primary" id="trb-guardar">
          <i class="bi bi-check2"></i> Guardar ruta
        </button>
      </div>
    </div>
  `,document.body.appendChild(s);let c=()=>s.remove();s.querySelector(`.trb-close`).addEventListener(`click`,c),s.querySelector(`#trb-cancelar`).addEventListener(`click`,c),s.addEventListener(`click`,e=>{e.target===s&&c()});let l=s.querySelector(`#trb-unidades`),u=s.querySelector(`#trb-header-subtitle`),d=new Set,f=new Set,p=null;function m(){let e=o.unidades.length,t=o.unidades.reduce((e,t)=>e+t.objetivos.length,0),n=g().length;u.textContent=e?`${e} unidad${e===1?``:`es`} · ${t} objetivo${t===1?``:`s`} · ${n} indicador${n===1?``:`es`}`:`Todavía no tiene unidades`}function h(){l.innerHTML=o.unidades.map((e,t)=>v(e,t)).join(``),S(),m()}function g(){let e=[];return o.unidades.forEach(t=>{t.objetivos.forEach(t=>{t.indicadores.forEach(t=>{e.push({id:t._localId,nombre:t.nombre||`(sin nombre)`})})})}),e}function v(e,t){let n=d.has(e._localId),r=e.objetivos.length,i=e.objetivos.reduce((e,t)=>e+t.indicadores.length,0);return`
      <div class="trb-unidad ${n?`trb-expanded`:``}" data-ui="${t}">
        <div class="trb-card-header" data-role="toggle-unidad" data-ui="${t}">
          <button class="trb-chevron" data-role="toggle-unidad" data-ui="${t}" aria-expanded="${n}" aria-label="${n?`Colapsar`:`Expandir`} unidad">
            <i class="bi bi-chevron-right"></i>
          </button>
          <span class="trb-badge-orden">U${t+1}</span>
          <input type="text" class="trb-input trb-input-ghost trb-input-inline" data-role="unidad-nombre" data-ui="${t}"
                 placeholder="Nombre de la unidad" value="${C(e.nombre)}" />
          <span class="trb-count-pill">${r} obj · ${i} ind</span>
          <button class="trb-icon-btn trb-remove-unidad" data-ui="${t}" title="Quitar unidad">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        ${n?`
        <div class="trb-card-body">
          <label class="trb-field trb-field-sm">
            <span>Descripción / síntesis <em>(qué aprende el alumno — se le muestra como resumen de la unidad)</em></span>
            <textarea class="trb-textarea" data-role="unidad-descripcion" data-ui="${t}"
                      placeholder="Ej. El alumno domina el agarre correcto del arco y la postura corporal base.">${C(e.descripcion||``)}</textarea>
          </label>
          <div class="trb-objetivos">
            ${e.objetivos.map((n,r)=>y(e,n,t,r)).join(``)}
          </div>
          <button class="trb-btn trb-btn-add-sub" data-role="add-objetivo" data-ui="${t}">
            <i class="bi bi-plus"></i> Agregar Objetivo
          </button>
        </div>`:``}
      </div>
    `}function y(e,t,n,r){let i=f.has(t._localId),a=t.indicadores.length;return`
      <div class="trb-objetivo ${i?`trb-expanded`:``}" data-ui="${n}" data-oi="${r}">
        <div class="trb-card-header" data-role="toggle-objetivo" data-ui="${n}" data-oi="${r}">
          <button class="trb-chevron" data-role="toggle-objetivo" data-ui="${n}" data-oi="${r}" aria-expanded="${i}" aria-label="${i?`Colapsar`:`Expandir`} objetivo">
            <i class="bi bi-chevron-right"></i>
          </button>
          <span class="trb-badge-orden trb-badge-orden-sm">O${r+1}</span>
          <input type="text" class="trb-input trb-input-ghost trb-input-inline" data-role="objetivo-nombre" data-ui="${n}" data-oi="${r}"
                 placeholder="Nombre del objetivo" value="${C(t.nombre)}" />
          <span class="trb-count-pill">${a} ind</span>
          <button class="trb-icon-btn trb-remove-objetivo" data-ui="${n}" data-oi="${r}" title="Quitar objetivo">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        ${i?`
        <div class="trb-card-body">
          <div class="trb-indicadores">
            ${t.indicadores.map((e,t)=>b(e,n,r,t)).join(``)}
          </div>
          <button class="trb-btn trb-btn-add-sub trb-btn-add-indicador" data-role="add-indicador" data-ui="${n}" data-oi="${r}">
            <i class="bi bi-plus"></i> Agregar Indicador
          </button>
        </div>`:``}
      </div>
    `}function b(e,t,n,r){return`
      <div class="trb-indicador" data-ui="${t}" data-oi="${n}" data-ii="${r}">
        <div class="trb-indicador-row">
          <span class="trb-badge-orden trb-badge-orden-xs">I${r+1}</span>
          <input type="text" class="trb-input trb-input-inline" data-role="indicador-nombre" data-ui="${t}" data-oi="${n}" data-ii="${r}"
                 placeholder="Nombre del indicador" value="${C(e.nombre)}" />
          <button class="trb-icon-btn trb-remove-indicador" data-ui="${t}" data-oi="${n}" data-ii="${r}" title="Quitar indicador">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        ${x(e,t,n,r)}
      </div>
    `}function x(e,t,n,r){let i=g().filter(t=>t.id!==e._localId),a=i.find(t=>t.id===e.prerequisito_local_id)||null,o=p===e._localId?`
      <div class="trb-prereq-panel">
        ${i.length?i.map(i=>`
              <button class="trb-prereq-option ${i.id===e.prerequisito_local_id?`trb-prereq-option-active`:``}"
                      data-role="prereq-pick" data-ui="${t}" data-oi="${n}" data-ii="${r}" data-value="${i.id}">
                ${C(i.nombre)}
              </button>
            `).join(``):`<p class="trb-prereq-empty">Todavía no hay otros indicadores en esta ruta.</p>`}
      </div>`:``;return`
      <div class="trb-prereq" data-ui="${t}" data-oi="${n}" data-ii="${r}">
        <span class="trb-prereq-label"><i class="bi bi-link-45deg"></i> Prerrequisito</span>
        <div class="trb-prereq-control">
          ${a?`
            <button class="trb-prereq-chip" data-role="prereq-toggle" data-ui="${t}" data-oi="${n}" data-ii="${r}" title="Cambiar prerrequisito">
              ${C(a.nombre)}
            </button>
            <button class="trb-icon-btn trb-prereq-clear" data-role="prereq-clear" data-ui="${t}" data-oi="${n}" data-ii="${r}" title="Quitar prerrequisito">
              <i class="bi bi-x-lg"></i>
            </button>
          `:`
            <button class="trb-prereq-add" data-role="prereq-toggle" data-ui="${t}" data-oi="${n}" data-ii="${r}">
              <i class="bi bi-plus"></i> Agregar prerrequisito
            </button>
          `}
        </div>
        ${o}
      </div>
    `}function S(){l.querySelectorAll(`[data-role="toggle-unidad"]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=o.unidades[+e.dataset.ui]._localId;d.has(n)?d.delete(n):d.add(n),h()})}),l.querySelectorAll(`[data-role="toggle-objetivo"]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let{ui:n,oi:r}=e.dataset,i=o.unidades[+n].objetivos[+r]._localId;f.has(i)?f.delete(i):f.add(i),h()})}),l.querySelectorAll(`[data-role="unidad-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{o.unidades[+e.dataset.ui].nombre=e.value}),e.addEventListener(`click`,e=>e.stopPropagation())}),l.querySelectorAll(`[data-role="unidad-descripcion"]`).forEach(e=>{e.addEventListener(`input`,()=>{o.unidades[+e.dataset.ui].descripcion=e.value})}),l.querySelectorAll(`[data-role="objetivo-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{o.unidades[+e.dataset.ui].objetivos[+e.dataset.oi].nombre=e.value}),e.addEventListener(`click`,e=>e.stopPropagation())}),l.querySelectorAll(`[data-role="indicador-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;o.unidades[+t].objetivos[+n].indicadores[+r].nombre=e.value,h()})}),l.querySelectorAll(`[data-role="prereq-toggle"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset,i=o.unidades[+t].objetivos[+n].indicadores[+r]._localId;p=p===i?null:i,h()})}),l.querySelectorAll(`[data-role="prereq-pick"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r,value:i}=e.dataset;o.unidades[+t].objetivos[+n].indicadores[+r].prerequisito_local_id=i||null,p=null,h()})}),l.querySelectorAll(`[data-role="prereq-clear"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;o.unidades[+t].objetivos[+n].indicadores[+r].prerequisito_local_id=null,p=null,h()})}),l.querySelectorAll(`[data-role="add-objetivo"]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=w();o.unidades[+e.dataset.ui].objetivos.push(t),f.add(t._localId),h()})}),l.querySelectorAll(`[data-role="add-indicador"]`).forEach(e=>{e.addEventListener(`click`,()=>{o.unidades[+e.dataset.ui].objetivos[+e.dataset.oi].indicadores.push(T()),h()})}),l.querySelectorAll(`.trb-remove-unidad`).forEach(e=>{e.addEventListener(`click`,()=>{o.unidades.splice(+e.dataset.ui,1),h()})}),l.querySelectorAll(`.trb-remove-objetivo`).forEach(e=>{e.addEventListener(`click`,()=>{o.unidades[+e.dataset.ui].objetivos.splice(+e.dataset.oi,1),h()})}),l.querySelectorAll(`.trb-remove-indicador`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;o.unidades[+t].objetivos[+n].indicadores.splice(+r,1),h()})})}function w(){return{_localId:pe(`obj`),nombre:``,indicadores:[]}}function T(){return{_localId:pe(`ind`),nombre:``,prerequisito_local_id:null}}function O(e){return{_localId:pe(`uni`),nombre:e?.nombre||``,descripcion:``,objetivos:(e?.objetivos||[]).map(e=>({_localId:pe(`obj`),nombre:e.nombre||``,indicadores:(e.indicadores||[]).map(e=>({_localId:pe(`ind`),nombre:e.nombre||``,prerequisito_local_id:null}))}))}}s.querySelector(`#trb-add-unidad`).addEventListener(`click`,()=>{let e={_localId:pe(`uni`),nombre:``,descripcion:``,objetivos:[]};o.unidades.push(e),d.add(e._localId),h()}),s.querySelector(`#trb-btn-ia-unidad`).addEventListener(`click`,async()=>{let t=s.querySelector(`#trb-btn-ia-unidad`);t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Generando…`;try{let t=O(await D({instrumento:(await n()||[]).find(e=>e.id===r)?.instrumento||`Música`,unidadesExistentes:o.unidades}));o.unidades.push(t),d.add(t._localId),h(),e.success(`Unidad sugerida por IA agregada — revísala antes de guardar`)}catch(t){console.error(`[TeacherRouteBuilder] Error sugiriendo unidad con IA:`,t),e.error(`No se pudo generar la sugerencia con IA`)}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-stars"></i> Sugerir unidad con IA`}}),s.querySelector(`#trb-nombre`).addEventListener(`input`,e=>{o.nombre=e.target.value}),s.querySelector(`#trb-btn-clonar`).addEventListener(`click`,async()=>{if(!o.routeId)return;let t=(await n()||[]).filter(e=>e.id!==r);if(t.length===0){e.error(`No tienes otra clase disponible para clonar esta ruta`);return}let i=await ve(t);if(!i)return;let s=window.prompt(`Nombre para la ruta clonada:`,`Copia de ${o.nombre}`);if(s)try{let t=await A(o.routeId,s,i);e.success(`Ruta clonada correctamente`),c(),a?.(t)}catch(t){let n=t.message?.includes(`duplicate key`)||t.message?.includes(`23505`);e.error(n?`Esa clase ya tiene una ruta propia — no se puede clonar encima`:`No se pudo clonar la ruta: ${t.message}`)}}),s.querySelector(`#trb-btn-exportar-pdf`).addEventListener(`click`,async()=>{if(!o.routeId)return;let t=s.querySelector(`#trb-btn-exportar-pdf`);t.disabled=!0;try{let e=[];o.unidades.forEach(t=>t.objetivos.forEach(t=>t.indicadores.forEach(t=>{t.id&&e.push(t.id)})));let[t,i]=await Promise.all([n(),E(e,r)]),a=(t||[]).find(e=>e.id===r),s=_(),c=ue(o.unidades,i);de({claseNombre:a?.nombre||`Clase`,maestroNombre:s?.nombre_completo||``,unidades:c})}catch(t){console.error(`[TeacherRouteBuilder] Error exportando PDF:`,t),e.error(`No se pudo generar el PDF de la ruta.`)}finally{t.disabled=!1}}),s.querySelector(`#trb-guardar`).addEventListener(`click`,async()=>{if(!o.nombre.trim()){e.error(`Ponle un nombre a la ruta antes de guardar`);return}if(o.unidades.length===0){e.error(`Agrega al menos una unidad`);return}if(o.unidades.some(e=>!e.nombre.trim()||e.objetivos.length===0)){e.error(`Cada unidad necesita nombre y al menos un objetivo`);return}let n=_e(o.unidades),i=s.querySelector(`#trb-guardar`);i.disabled=!0,i.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Guardando…`;try{let i=o.routeId?await k(o.routeId,n):await M(t,r,o.nombre.trim(),n);e.success(`Ruta guardada`),c(),a?.(i)}catch(t){e.error(`No se pudo guardar la ruta: ${t.message}`),i.disabled=!1,i.innerHTML=`<i class="bi bi-check2"></i> Guardar ruta`}}),h()}async function he(e,t,n){let r=await j(e,t);if(!r||r.length===0){me({maestroId:e,claseId:t,onSaved:n});return}let i=document.createElement(`div`);i.className=`trb-backdrop`,i.innerHTML=`
    <div class="trb-modal trb-modal-sm" role="dialog" aria-modal="true">
      <div class="trb-header">
        <h3>Tus rutas para esta clase</h3>
        <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="trb-body">
        <div class="trb-route-list">
          ${r.map(e=>`
            <button class="trb-route-item" data-route-id="${e.id}">
              <span class="trb-route-nombre">${C(e.nombre)}</span>
              <span class="trb-route-meta">${e.unidades.length} unidades</span>
            </button>
          `).join(``)}
        </div>
        <button class="trb-btn trb-btn-add-unidad" id="trb-nueva-ruta">
          <i class="bi bi-plus-circle"></i> Crear ruta nueva
        </button>
      </div>
    </div>
  `,document.body.appendChild(i);let a=()=>i.remove();i.querySelector(`.trb-close`).addEventListener(`click`,a),i.addEventListener(`click`,e=>{e.target===i&&a()}),i.querySelector(`#trb-nueva-ruta`).addEventListener(`click`,()=>{a(),me({maestroId:e,claseId:t,onSaved:n})}),i.querySelectorAll(`.trb-route-item`).forEach(i=>{i.addEventListener(`click`,()=>{let o=r.find(e=>e.id===i.dataset.routeId);a(),me({maestroId:e,claseId:t,route:o,onSaved:n})})})}function ge(e){let t=new Map,n=e.map(e=>({...e,_localId:pe(`uni`),objetivos:(e.objetivos||[]).map(e=>({...e,_localId:pe(`obj`),indicadores:(e.indicadores||[]).map(e=>{let n=pe(`ind`);return t.set(e.id,n),{...e,_localId:n}})}))}));return n.forEach(e=>e.objetivos.forEach(e=>e.indicadores.forEach(e=>{e.prerequisito_local_id=e.prerequisito_indicador_id&&t.get(e.prerequisito_indicador_id)||null}))),n}function _e(e){return e.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),descripcion:e.descripcion?.trim()||null,objetivos:e.objetivos.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),indicadores:e.indicadores.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),prerequisito_indicador_id:e.prerequisito_local_id||null}))}))}))}function ve(e){return new Promise(t=>{let n=document.createElement(`div`);n.className=`trb-backdrop`,n.innerHTML=`
      <div class="trb-modal trb-modal-sm" role="dialog" aria-modal="true">
        <div class="trb-header">
          <h3>Clonar hacia qué clase</h3>
          <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="trb-body">
          <div class="trb-route-list">
            ${e.map(e=>`
              <button class="trb-route-item" data-clase-id="${e.id}">
                <span class="trb-route-nombre">${C(e.nombre)}</span>
              </button>
            `).join(``)}
          </div>
        </div>
      </div>
    `,document.body.appendChild(n);let r=e=>{n.remove(),t(e)};n.querySelector(`.trb-close`).addEventListener(`click`,()=>r(null)),n.addEventListener(`click`,e=>{e.target===n&&r(null)}),n.querySelectorAll(`.trb-route-item`).forEach(e=>{e.addEventListener(`click`,()=>r(e.dataset.claseId))})})}if(!document.getElementById(`trb-styles`)){let e=document.createElement(`style`);e.id=`trb-styles`,e.textContent=`
    .trb-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.6);
      display: flex; align-items: center; justify-content: center;
      /* El footer móvil fuerza z-index 9999 — el modal debe quedar por
         encima para que "Guardar ruta" nunca quede tapado. */
      z-index: 10000; padding: 1rem;
    }
    .trb-modal {
      background: var(--pm-surface, #fff); color: var(--pm-text, #111827);
      border-radius: 18px;
      width: min(680px, 100%);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 64px rgba(0,0,0,0.35);
    }
    .trb-modal-sm { width: min(420px, 100%); }
    .trb-header {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      padding: 1.1rem 1.35rem; border-bottom: 1px solid var(--pm-border, #e5e7eb);
    }
    .trb-header-titles { display: flex; flex-direction: column; gap: 0.15rem; }
    .trb-header h3 { margin: 0; font-size: 1.08rem; font-weight: 700; color: var(--pm-text, #111827); }
    .trb-header-subtitle { font-size: 0.76rem; color: var(--pm-text-muted, #6b7280); }
    .trb-close {
      background: var(--pm-surface-2, #f3f4f6); border: none; font-size: 1rem; cursor: pointer;
      color: var(--pm-text-muted, #6b7280); width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .trb-close:hover { background: rgba(239,68,68,0.12); color: var(--pm-danger, #ef4444); }
    .trb-body { padding: 1.1rem 1.35rem; overflow-y: auto; overflow-x: hidden; flex: 1; }
    .trb-footer {
      display: flex; justify-content: flex-end; gap: 0.6rem;
      padding: 0.9rem 1.35rem; border-top: 1px solid var(--pm-border, #e5e7eb);
    }
    .trb-field { display: block; margin-bottom: 1rem; }
    .trb-field span { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.3rem; color: var(--pm-text-muted, #6b7280); }
    .trb-input, .trb-select {
      width: 100%; padding: 0.55rem 0.7rem; border-radius: 9px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.88rem;
      background: var(--pm-surface-2, #f9fafb); color: var(--pm-text, #111827);
      transition: border-color 0.15s ease;
    }
    .trb-input:focus, .trb-select:focus {
      outline: none; border-color: var(--pm-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }
    .trb-input::placeholder { color: var(--pm-text-muted, #9ca3af); }
    .trb-input-inline { flex: 1; }
    .trb-actions-row { display: flex; gap: 0.5rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
    .trb-btn {
      border-radius: 9px; padding: 0.48rem 0.85rem; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 0.35rem;
      transition: filter 0.15s ease, background 0.15s ease;
    }
    .trb-btn:hover:not(:disabled) { filter: brightness(1.08); }
    .trb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .trb-btn-primary { background: var(--pm-primary, #3b82f6); color: #fff; }
    .trb-btn-secondary { background: var(--pm-surface-2, #f3f4f6); color: var(--pm-text, #111827); border-color: var(--pm-border, #d1d5db); }
    .trb-btn-ghost { background: none; color: var(--pm-text-muted, #6b7280); }
    .trb-btn-ghost:hover:not(:disabled) { background: var(--pm-surface-2, #f3f4f6); }
    .trb-btn-add-unidad {
      background: rgba(59,130,246,0.1); color: var(--pm-primary, #3b82f6);
      width: 100%; justify-content: center; margin-top: 0.6rem; padding: 0.6rem;
    }
    .trb-btn-add-unidad:hover:not(:disabled) { background: rgba(59,130,246,0.16); }
    .trb-btn-add-sub {
      background: none; color: var(--pm-primary, #3b82f6); padding: 0.3rem 0.55rem;
      font-size: 0.78rem; margin-top: 0.35rem; border-radius: 7px;
    }
    .trb-btn-add-sub:hover:not(:disabled) { background: rgba(59,130,246,0.08); }

    /* ── Acordeón Unidad → Objetivo → Indicador ─────────────────────
       Cada nivel es una tarjeta encapsulada, colapsada por defecto: el
       header (chevron + badge + nombre + conteo + borrar) siempre visible,
       el cuerpo (descripción/hijos) solo se renderiza si está expandido. */
    .trb-unidades { display: flex; flex-direction: column; gap: 0.7rem; }
    .trb-unidad {
      border: 1.5px solid var(--pm-border, #e5e7eb); border-left: 4px solid var(--pm-primary, #3b82f6);
      border-radius: 12px; background: var(--pm-surface-2, #fafafa); overflow: hidden;
    }
    .trb-unidad.trb-expanded { box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    .trb-objetivo {
      border: 1px solid var(--pm-border, #e5e7eb); border-left: 3px solid #7c3aed; border-radius: 10px;
      background: var(--pm-surface, #fff); overflow: hidden;
    }

    .trb-card-header {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 0.85rem;
      cursor: pointer; min-width: 0; flex-wrap: wrap;
    }
    .trb-card-header .trb-input-ghost { flex: 1 1 110px; min-width: 90px; }
    .trb-card-header .trb-count-pill { margin-left: 32px; }
    .trb-chevron {
      background: none; border: none; color: var(--pm-text-muted, #6b7280); cursor: pointer;
      padding: 0.15rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      transition: transform 0.18s ease;
    }
    .trb-expanded > .trb-card-header .trb-chevron { transform: rotate(90deg); }
    .trb-card-body { padding: 0 0.85rem 0.85rem; display: flex; flex-direction: column; gap: 0.7rem; }

    .trb-input-ghost {
      background: transparent; border-color: transparent; padding: 0.3rem 0.4rem;
      min-width: 0;
    }
    .trb-input-ghost:hover { background: var(--pm-surface, rgba(0,0,0,0.03)); }
    .trb-input-ghost:focus { background: var(--pm-surface, #fff); border-color: var(--pm-primary, #3b82f6); }

    .trb-count-pill {
      font-size: 0.68rem; font-weight: 700; color: var(--pm-text-muted, #6b7280);
      background: var(--pm-surface, rgba(0,0,0,0.05)); border-radius: 999px;
      padding: 0.2rem 0.5rem; white-space: nowrap; flex-shrink: 0;
    }

    .trb-field-sm span { font-weight: 500; font-style: normal; }
    .trb-field-sm span em { font-style: normal; font-weight: 400; opacity: 0.8; }
    .trb-textarea {
      width: 100%; min-height: 56px; padding: 0.55rem 0.7rem; border-radius: 9px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.85rem; resize: vertical;
      background: var(--pm-surface, #fff); color: var(--pm-text, #111827); font-family: inherit;
    }
    .trb-textarea:focus {
      outline: none; border-color: var(--pm-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }
    .trb-textarea::placeholder { color: var(--pm-text-muted, #9ca3af); }

    .trb-objetivos { display: flex; flex-direction: column; gap: 0.55rem; }
    .trb-indicadores { display: flex; flex-direction: column; gap: 0.5rem; }
    .trb-indicador {
      border: 1px solid var(--pm-border, #e5e7eb); border-radius: 9px;
      padding: 0.5rem; background: var(--pm-surface-2, #f9fafb);
      display: flex; flex-direction: column; gap: 0.4rem; min-width: 0;
    }
    .trb-indicador-row { display: flex; align-items: center; gap: 0.4rem; min-width: 0; }
    .trb-indicador-row .trb-input { min-width: 0; }

    /* ── Prerrequisito: componente atómico (label + chip/agregar + quitar + panel) ── */
    .trb-prereq { position: relative; padding-left: calc(0.7rem + 24px); }
    .trb-prereq-label {
      display: flex; align-items: center; gap: 0.25rem; font-size: 0.68rem;
      color: var(--pm-text-muted, #6b7280); font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.03em; margin-bottom: 0.3rem;
    }
    .trb-prereq-control { display: flex; align-items: center; gap: 0.35rem; }
    .trb-prereq-chip, .trb-prereq-add {
      display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; font-weight: 600;
      border-radius: 999px; padding: 0.3rem 0.65rem; cursor: pointer; border: 1px solid transparent;
      max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .trb-prereq-chip {
      background: rgba(59,130,246,0.12); color: var(--pm-primary, #3b82f6);
      border-color: rgba(59,130,246,0.25);
    }
    .trb-prereq-chip:hover { background: rgba(59,130,246,0.2); }
    .trb-prereq-add {
      background: var(--pm-surface, #fff); color: var(--pm-text-muted, #6b7280);
      border-color: var(--pm-border, #d1d5db); border-style: dashed;
    }
    .trb-prereq-add:hover { border-color: var(--pm-primary, #3b82f6); color: var(--pm-primary, #3b82f6); }
    .trb-prereq-clear { font-size: 0.85rem; padding: 0.25rem; }
    .trb-prereq-panel {
      display: flex; flex-direction: column; gap: 0.2rem; margin-top: 0.4rem;
      border: 1px solid var(--pm-border, #e5e7eb); border-radius: 9px; padding: 0.35rem;
      background: var(--pm-surface, #fff); max-height: 160px; overflow-y: auto;
    }
    .trb-prereq-option {
      text-align: left; background: none; border: none; border-radius: 6px;
      padding: 0.4rem 0.55rem; font-size: 0.8rem; color: var(--pm-text, #111827); cursor: pointer;
    }
    .trb-prereq-option:hover { background: var(--pm-surface-2, #f3f4f6); }
    .trb-prereq-option-active { background: rgba(59,130,246,0.12); color: var(--pm-primary, #3b82f6); font-weight: 600; }
    .trb-prereq-empty { font-size: 0.76rem; color: var(--pm-text-muted, #6b7280); padding: 0.4rem 0.2rem; margin: 0; }

    .trb-badge-orden {
      background: var(--pm-primary, #3b82f6); color: #fff; font-size: 0.7rem; font-weight: 700;
      border-radius: 6px; padding: 0.18rem 0.45rem; flex-shrink: 0;
    }
    .trb-badge-orden-sm { background: #7c3aed; }
    .trb-badge-orden-xs { background: #059669; font-size: 0.65rem; }
    .trb-icon-btn {
      background: none; border: none; color: var(--pm-danger, #ef4444);
      cursor: pointer; font-size: 0.95rem; flex-shrink: 0; padding: 0.3rem;
      border-radius: 7px; transition: background 0.15s ease;
    }
    .trb-icon-btn:hover { background: rgba(239,68,68,0.12); }

    .trb-route-list { display: flex; flex-direction: column; gap: 0.55rem; margin-bottom: 0.85rem; }
    .trb-route-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.7rem 0.9rem; border: 1px solid var(--pm-border, #e5e7eb);
      border-radius: 11px; background: var(--pm-surface-2, #fff); color: var(--pm-text, #111827);
      cursor: pointer; text-align: left; transition: border-color 0.15s ease, background 0.15s ease;
    }
    .trb-route-item:hover { border-color: var(--pm-primary, #3b82f6); background: rgba(59,130,246,0.08); }
    .trb-route-nombre { font-weight: 600; font-size: 0.88rem; }
    .trb-route-meta { font-size: 0.75rem; color: var(--pm-text-muted, #6b7280); }
  `,document.head.appendChild(e)}function ye(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function be(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.__proto__=t}var xe={autoSleep:120,force3D:`auto`,nullTargetWarn:1,units:{lineHeight:``}},Se={duration:.5,overwrite:!1,delay:0},Ce,L,R,we=1e8,z=1/we,Te=Math.PI*2,Ee=Te/4,De=0,Oe=Math.sqrt,ke=Math.cos,Ae=Math.sin,B=function(e){return typeof e==`string`},V=function(e){return typeof e==`function`},je=function(e){return typeof e==`number`},Me=function(e){return e===void 0},Ne=function(e){return typeof e==`object`},Pe=function(e){return e!==!1},Fe=function(){return typeof window<`u`},Ie=function(e){return V(e)||B(e)},Le=typeof ArrayBuffer==`function`&&ArrayBuffer.isView||function(){},H=Array.isArray,Re=/random\([^)]+\)/g,ze=/,\s*/g,Be=/(?:-?\.?\d|\.)+/gi,Ve=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,He=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,Ue=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,We=/[+-]=-?[.\d]+/,Ge=/[^,'"\[\]\s]+/gi,Ke=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,U,qe,Je,Ye,Xe={},Ze={},Qe,$e=function(e){return(Ze=Ot(e,Xe))&&Hr},et=function(e,t){return console.warn(`Invalid property`,e,`set to`,t,`Missing plugin? gsap.registerPlugin()`)},tt=function(e,t){return!t&&console.warn(e)},nt=function(e,t){return e&&(Xe[e]=t)&&Ze&&(Ze[e]=t)||Xe},rt=function(){return 0},it={suppressEvents:!0,isStart:!0,kill:!1},at={suppressEvents:!0,kill:!1},ot={suppressEvents:!0},st={},ct=[],lt={},ut,dt={},ft={},pt=30,mt=[],ht=``,gt=function(e){var t=e[0],n,r;if(Ne(t)||V(t)||(e=[e]),!(n=(t._gsap||{}).harness)){for(r=mt.length;r--&&!mt[r].targetTest(t););n=mt[r]}for(r=e.length;r--;)e[r]&&(e[r]._gsap||(e[r]._gsap=new tr(e[r],n)))||e.splice(r,1);return e},_t=function(e){return e._gsap||gt(dn(e))[0]._gsap},vt=function(e,t,n){return(n=e[t])&&V(n)?e[t]():Me(n)&&e.getAttribute&&e.getAttribute(t)||n},W=function(e,t){return(e=e.split(`,`)).forEach(t)||e},G=function(e){return Math.round(e*1e5)/1e5||0},K=function(e){return Math.round(e*1e7)/1e7||0},yt=function(e,t){var n=t.charAt(0),r=parseFloat(t.substr(2));return e=parseFloat(e),n===`+`?e+r:n===`-`?e-r:n===`*`?e*r:e/r},bt=function(e,t){for(var n=t.length,r=0;e.indexOf(t[r])<0&&++r<n;);return r<n},xt=function(){var e=ct.length,t=ct.slice(0),n,r;for(lt={},ct.length=0,n=0;n<e;n++)r=t[n],r&&r._lazy&&(r.render(r._lazy[0],r._lazy[1],!0)._lazy=0)},St=function(e){return!!(e._initted||e._startAt||e.add)},Ct=function(e,t,n,r){ct.length&&!L&&xt(),e.render(t,n,r||!!(L&&t<0&&St(e))),ct.length&&!L&&xt()},wt=function(e){var t=parseFloat(e);return(t||t===0)&&(e+``).match(Ge).length<2?t:B(e)?e.trim():e},Tt=function(e){return e},Et=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},Dt=function(e){return function(t,n){for(var r in n)r in t||r===`duration`&&e||r===`ease`||(t[r]=n[r])}},Ot=function(e,t){for(var n in t)e[n]=t[n];return e},kt=function e(t,n){for(var r in n)r!==`__proto__`&&r!==`constructor`&&r!==`prototype`&&(t[r]=Ne(n[r])?e(t[r]||(t[r]={}),n[r]):n[r]);return t},At=function(e,t){var n={},r;for(r in e)r in t||(n[r]=e[r]);return n},jt=function(e){var t=e.parent||U,n=e.keyframes?Dt(H(e.keyframes)):Et;if(Pe(e.inherit))for(;t;)n(e,t.vars.defaults),t=t.parent||t._dp;return e},Mt=function(e,t){for(var n=e.length,r=n===t.length;r&&n--&&e[n]===t[n];);return n<0},Nt=function(e,t,n,r,i){n===void 0&&(n=`_first`),r===void 0&&(r=`_last`);var a=e[r],o;if(i)for(o=t[i];a&&a[i]>o;)a=a._prev;return a?(t._next=a._next,a._next=t):(t._next=e[n],e[n]=t),t._next?t._next._prev=t:e[r]=t,t._prev=a,t.parent=t._dp=e,t},Pt=function(e,t,n,r){n===void 0&&(n=`_first`),r===void 0&&(r=`_last`);var i=t._prev,a=t._next;i?i._next=a:e[n]===t&&(e[n]=a),a?a._prev=i:e[r]===t&&(e[r]=i),t._next=t._prev=t.parent=null},Ft=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},It=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var n=e;n;)n._dirty=1,n=n.parent;return e},Lt=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Rt=function(e,t,n,r){return e._startAt&&(L?e._startAt.revert(at):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,r))},zt=function e(t){return!t||t._ts&&e(t.parent)},Bt=function(e){return e._repeat?Vt(e._tTime,e=e.duration()+e._rDelay)*e:0},Vt=function(e,t){var n=Math.floor(e=K(e/t));return e&&n===e?n-1:n},Ht=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},Ut=function(e){return e._end=K(e._start+(e._tDur/Math.abs(e._ts||e._rts||z)||0))},Wt=function(e,t){var n=e._dp;return n&&n.smoothChildTiming&&e._ts&&(e._start=K(n._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),Ut(e),n._dirty||It(n,e)),e},Gt=function(e,t){var n;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(n=Ht(e.rawTime(),t),(!t._dur||on(0,t.totalDuration(),n)-t._tTime>z)&&t.render(n,!0)),It(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(n=e;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;e._zTime=-z}},Kt=function(e,t,n,r){return t.parent&&Ft(t),t._start=K((je(n)?n:n||e!==U?nn(e,n,t):e._time)+t._delay),t._end=K(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),Nt(e,t,`_first`,`_last`,e._sort?`_start`:0),Xt(t)||(e._recent=t),r||Gt(e,t),e._ts<0&&Wt(e,e._tTime),e},qt=function(e,t){return(Xe.ScrollTrigger||et(`scrollTrigger`,t))&&Xe.ScrollTrigger.create(t,e)},Jt=function(e,t,n,r,i){if(lr(e,t,i),!e._initted)return 1;if(!n&&e._pt&&!L&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&ut!==Hn.frame)return ct.push(e),e._lazy=[i,r],1},Yt=function e(t){var n=t.parent;return n&&n._ts&&n._initted&&!n._lock&&(n.rawTime()<0||e(n))},Xt=function(e){var t=e.data;return t===`isFromStart`||t===`isStart`},Zt=function(e,t,n,r){var i=e.ratio,a=t<0||!t&&(!e._start&&Yt(e)&&!(!e._initted&&Xt(e))||(e._ts<0||e._dp._ts<0)&&!Xt(e))?0:1,o=e._rDelay,s=0,c,l,u;if(o&&e._repeat&&(s=on(0,e._tDur,t),l=Vt(s,o),e._yoyo&&l&1&&(a=1-a),l!==Vt(e._tTime,o)&&(i=1-a,e.vars.repeatRefresh&&e._initted&&e.invalidate())),a!==i||L||r||e._zTime===z||!t&&e._zTime){if(!e._initted&&Jt(e,t,r,n,s))return;for(u=e._zTime,e._zTime=t||(n?z:0),n||=t&&!u,e.ratio=a,e._from&&(a=1-a),e._time=0,e._tTime=s,c=e._pt;c;)c.r(a,c.d),c=c._next;t<0&&Rt(e,t,n,!0),e._onUpdate&&!n&&On(e,`onUpdate`),s&&e._repeat&&!n&&e.parent&&On(e,`onRepeat`),(t>=e._tDur||t<0)&&e.ratio===a&&(a&&Ft(e,1),!n&&!L&&(On(e,a?`onComplete`:`onReverseComplete`,!0),e._prom&&e._prom()))}else e._zTime||=t},Qt=function(e,t,n){var r;if(n>t)for(r=e._first;r&&r._start<=n;){if(r.data===`isPause`&&r._start>t)return r;r=r._next}else for(r=e._last;r&&r._start>=n;){if(r.data===`isPause`&&r._start<t)return r;r=r._prev}},$t=function(e,t,n,r){var i=e._repeat,a=K(t)||0,o=e._tTime/e._tDur;return o&&!r&&(e._time*=a/e._dur),e._dur=a,e._tDur=i?i<0?1e10:K(a*(i+1)+e._rDelay*i):a,o>0&&!r&&Wt(e,e._tTime=e._tDur*o),e.parent&&Ut(e),n||It(e.parent,e),e},en=function(e){return e instanceof X?It(e):$t(e,e._dur)},tn={_start:0,endTime:rt,totalDuration:rt},nn=function e(t,n,r){var i=t.labels,a=t._recent||tn,o=t.duration()>=we?a.endTime(!1):t._dur,s,c,l;return B(n)&&(isNaN(n)||n in i)?(c=n.charAt(0),l=n.substr(-1)===`%`,s=n.indexOf(`=`),c===`<`||c===`>`?(s>=0&&(n=n.replace(/=/,``)),(c===`<`?a._start:a.endTime(a._repeat>=0))+(parseFloat(n.substr(1))||0)*(l?(s<0?a:r).totalDuration()/100:1)):s<0?(n in i||(i[n]=o),i[n]):(c=parseFloat(n.charAt(s-1)+n.substr(s+1)),l&&r&&(c=c/100*(H(r)?r[0]:r).totalDuration()),s>1?e(t,n.substr(0,s-1),r)+c:o+c)):n==null?o:+n},rn=function(e,t,n){var r=je(t[1]),i=(r?2:1)+(e<2?0:1),a=t[i],o,s;if(r&&(a.duration=t[1]),a.parent=n,e){for(o=a,s=n;s&&!(`immediateRender`in o);)o=s.vars.defaults||{},s=Pe(s.vars.inherit)&&s.parent;a.immediateRender=Pe(o.immediateRender),e<2?a.runBackwards=1:a.startAt=t[i-1]}return new Z(t[0],a,t[i+1])},an=function(e,t){return e||e===0?t(e):t},on=function(e,t,n){return n<e?e:n>t?t:n},q=function(e,t){return!B(e)||!(t=Ke.exec(e))?``:t[1]},sn=function(e,t,n){return an(n,function(n){return on(e,t,n)})},cn=[].slice,ln=function(e,t){return e&&Ne(e)&&`length`in e&&(!t&&!e.length||e.length-1 in e&&Ne(e[0]))&&!e.nodeType&&e!==qe},un=function(e,t,n){return n===void 0&&(n=[]),e.forEach(function(e){var r;return B(e)&&!t||ln(e,1)?(r=n).push.apply(r,dn(e)):n.push(e)})||n},dn=function(e,t,n){return R&&!t&&R.selector?R.selector(e):B(e)&&!n&&(Je||!Un())?cn.call((t||Ye).querySelectorAll(e),0):H(e)?un(e,n):ln(e)?cn.call(e,0):e?[e]:[]},fn=function(e){return e=dn(e)[0]||tt(`Invalid scope`)||{},function(t){var n=e.current||e.nativeElement||e;return dn(t,n.querySelectorAll?n:n===e?tt(`Invalid scope`)||Ye.createElement(`div`):e)}},pn=function(e){return e.sort(function(){return .5-Math.random()})},mn=function(e){if(V(e))return e;var t=Ne(e)?e:{each:e},n=Xn(t.ease),r=t.from||0,i=parseFloat(t.base)||0,a={},o=r>0&&r<1,s=isNaN(r)||o,c=t.axis,l=r,u=r;return B(r)?l=u={center:.5,edges:.5,end:1}[r]||0:!o&&s&&(l=r[0],u=r[1]),function(e,o,d){var f=(d||t).length,p=a[f],m,h,g,_,v,y,b,x,S;if(!p){if(S=t.grid===`auto`?0:(t.grid||[1,we])[1],!S){for(b=-we;b<(b=d[S++].getBoundingClientRect().left)&&S<f;);S<f&&S--}for(p=a[f]=[],m=s?Math.min(S,f)*l-.5:r%S,h=S===we?0:s?f*u/S-.5:r/S|0,b=0,x=we,y=0;y<f;y++)g=y%S-m,_=h-(y/S|0),p[y]=v=c?Math.abs(c===`y`?_:g):Oe(g*g+_*_),v>b&&(b=v),v<x&&(x=v);r===`random`&&pn(p),p.max=b-x,p.min=x,p.v=f=(parseFloat(t.amount)||parseFloat(t.each)*(S>f?f-1:c?c===`y`?f/S:S:Math.max(S,f/S))||0)*(r===`edges`?-1:1),p.b=f<0?i-f:i,p.u=q(t.amount||t.each)||0,n=n&&f<0?Yn(n):n}return f=(p[e]-p.min)/p.max||0,K(p.b+(n?n(f):f)*p.v)+p.u}},hn=function(e){var t=10**((e+``).split(`.`)[1]||``).length;return function(n){var r=K(Math.round(parseFloat(n)/e)*e*t);return(r-r%1)/t+(je(n)?0:q(n))}},gn=function(e,t){var n=H(e),r,i;return!n&&Ne(e)&&(r=n=e.radius||we,e.values?(e=dn(e.values),(i=!je(e[0]))&&(r*=r)):e=hn(e.increment)),an(t,n?V(e)?function(t){return i=e(t),Math.abs(i-t)<=r?i:t}:function(t){for(var n=parseFloat(i?t.x:t),a=parseFloat(i?t.y:0),o=we,s=0,c=e.length,l,u;c--;)i?(l=e[c].x-n,u=e[c].y-a,l=l*l+u*u):l=Math.abs(e[c]-n),l<o&&(o=l,s=c);return s=!r||o<=r?e[s]:t,i||s===t||je(t)?s:s+q(t)}:hn(e))},_n=function(e,t,n,r){return an(H(e)?!t:n===!0?!!(n=0):!r,function(){return H(e)?e[~~(Math.random()*e.length)]:(n||=1e-5)&&(r=n<1?10**((n+``).length-2):1)&&Math.floor(Math.round((e-n/2+Math.random()*(t-e+n*.99))/n)*n*r)/r})},vn=function(){var e=[...arguments];return function(t){return e.reduce(function(e,t){return t(e)},t)}},yn=function(e,t){return function(n){return e(parseFloat(n))+(t||q(n))}},bn=function(e,t,n){return Tn(e,t,0,1,n)},xn=function(e,t,n){return an(n,function(n){return e[~~t(n)]})},Sn=function e(t,n,r){var i=n-t;return H(t)?xn(t,e(0,t.length),n):an(r,function(e){return(i+(e-t)%i)%i+t})},Cn=function e(t,n,r){var i=n-t,a=i*2;return H(t)?xn(t,e(0,t.length-1),n):an(r,function(e){return e=(a+(e-t)%a)%a||0,t+(e>i?a-e:e)})},wn=function(e){return e.replace(Re,function(e){var t=e.indexOf(`[`)+1,n=e.substring(t||7,t?e.indexOf(`]`):e.length-1).split(ze);return _n(t?n:+n[0],t?0:+n[1],+n[2]||1e-5)})},Tn=function(e,t,n,r,i){var a=t-e,o=r-n;return an(i,function(t){return n+((t-e)/a*o||0)})},En=function e(t,n,r,i){var a=isNaN(t+n)?0:function(e){return(1-e)*t+e*n};if(!a){var o=B(t),s={},c,l,u,d,f;if(r===!0&&(i=1)&&(r=null),o)t={p:t},n={p:n};else if(H(t)&&!H(n)){for(u=[],d=t.length,f=d-2,l=1;l<d;l++)u.push(e(t[l-1],t[l]));d--,a=function(e){e*=d;var t=Math.min(f,~~e);return u[t](e-t)},r=n}else i||(t=Ot(H(t)?[]:{},t));if(!u){for(c in n)ir.call(s,t,c,`get`,n[c]);a=function(e){return wr(e,s)||(o?t.p:t)}}}return an(r,a)},Dn=function(e,t,n){var r=e.labels,i=we,a,o,s;for(a in r)o=r[a]-t,o<0==!!n&&o&&i>(o=Math.abs(o))&&(s=a,i=o);return s},On=function(e,t,n){var r=e.vars,i=r[t],a=R,o=e._ctx,s,c,l;if(i)return s=r[t+`Params`],c=r.callbackScope||e,n&&ct.length&&xt(),o&&(R=o),l=s?i.apply(c,s):i.call(c),R=a,l},kn=function(e){return Ft(e),e.scrollTrigger&&e.scrollTrigger.kill(!!L),e.progress()<1&&On(e,`onInterrupt`),e},An,jn=[],Mn=function(e){if(e)if(e=!e.name&&e.default||e,Fe()||e.headless){var t=e.name,n=V(e),r=t&&!n&&e.init?function(){this._props=[]}:e,i={init:rt,render:wr,add:ir,kill:Er,modifier:Tr,rawVars:0},a={targetTest:0,get:0,getSetter:br,aliases:{},register:0};if(Un(),e!==r){if(dt[t])return;Et(r,Et(At(e,i),a)),Ot(r.prototype,Ot(i,At(e,a))),dt[r.prop=t]=r,e.targetTest&&(mt.push(r),st[t]=1),t=(t===`css`?`CSS`:t.charAt(0).toUpperCase()+t.substr(1))+`Plugin`}nt(t,r),e.register&&e.register(Hr,r,Q)}else jn.push(e)},J=255,Nn={aqua:[0,J,J],lime:[0,J,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,J],navy:[0,0,128],white:[J,J,J],olive:[128,128,0],yellow:[J,J,0],orange:[J,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[J,0,0],pink:[J,192,203],cyan:[0,J,J],transparent:[J,J,J,0]},Pn=function(e,t,n){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(n-t)*e*6:e<.5?n:e*3<2?t+(n-t)*(2/3-e)*6:t)*J+.5|0},Fn=function(e,t,n){var r=e?je(e)?[e>>16,e>>8&J,e&J]:0:Nn.black,i,a,o,s,c,l,u,d,f,p;if(!r){if(e.substr(-1)===`,`&&(e=e.substr(0,e.length-1)),Nn[e])r=Nn[e];else if(e.charAt(0)===`#`){if(e.length<6&&(i=e.charAt(1),a=e.charAt(2),o=e.charAt(3),e=`#`+i+i+a+a+o+o+(e.length===5?e.charAt(4)+e.charAt(4):``)),e.length===9)return r=parseInt(e.substr(1,6),16),[r>>16,r>>8&J,r&J,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),r=[e>>16,e>>8&J,e&J]}else if(e.substr(0,3)===`hsl`){if(r=p=e.match(Be),!t)s=r[0]%360/360,c=r[1]/100,l=r[2]/100,a=l<=.5?l*(c+1):l+c-l*c,i=l*2-a,r.length>3&&(r[3]*=1),r[0]=Pn(s+1/3,i,a),r[1]=Pn(s,i,a),r[2]=Pn(s-1/3,i,a);else if(~e.indexOf(`=`))return r=e.match(Ve),n&&r.length<4&&(r[3]=1),r}else r=e.match(Be)||Nn.transparent;r=r.map(Number)}return t&&!p&&(i=r[0]/J,a=r[1]/J,o=r[2]/J,u=Math.max(i,a,o),d=Math.min(i,a,o),l=(u+d)/2,u===d?s=c=0:(f=u-d,c=l>.5?f/(2-u-d):f/(u+d),s=u===i?(a-o)/f+(a<o?6:0):u===a?(o-i)/f+2:(i-a)/f+4,s*=60),r[0]=~~(s+.5),r[1]=~~(c*100+.5),r[2]=~~(l*100+.5)),n&&r.length<4&&(r[3]=1),r},In=function(e){var t=[],n=[],r=-1;return e.split(Rn).forEach(function(e){var i=e.match(He)||[];t.push.apply(t,i),n.push(r+=i.length+1)}),t.c=n,t},Ln=function(e,t,n){var r=``,i=(e+r).match(Rn),a=t?`hsla(`:`rgba(`,o=0,s,c,l,u;if(!i)return e;if(i=i.map(function(e){return(e=Fn(e,t,1))&&a+(t?e[0]+`,`+e[1]+`%,`+e[2]+`%,`+e[3]:e.join(`,`))+`)`}),n&&(l=In(e),s=n.c,s.join(r)!==l.c.join(r)))for(c=e.replace(Rn,`1`).split(He),u=c.length-1;o<u;o++)r+=c[o]+(~s.indexOf(o)?i.shift()||a+`0,0,0,0)`:(l.length?l:i.length?i:n).shift());if(!c)for(c=e.split(Rn),u=c.length-1;o<u;o++)r+=c[o]+i[o];return r+c[u]},Rn=function(){var e=`(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b`,t;for(t in Nn)e+=`|`+t+`\\b`;return RegExp(e+`)`,`gi`)}(),zn=/hsl[a]?\(/,Bn=function(e){var t=e.join(` `),n;if(Rn.lastIndex=0,Rn.test(t))return n=zn.test(t),e[1]=Ln(e[1],n),e[0]=Ln(e[0],n,In(e[1])),!0},Vn,Hn=function(){var e=Date.now,t=500,n=33,r=e(),i=r,a=1e3/240,o=a,s=[],c,l,u,d,f,p,m=function u(m){var h=e()-i,g=m===!0,_,v,y,b;if((h>t||h<0)&&(r+=h-n),i+=h,y=i-r,_=y-o,(_>0||g)&&(b=++d.frame,f=y-d.time*1e3,d.time=y/=1e3,o+=_+(_>=a?4:a-_),v=1),g||(c=l(u)),v)for(p=0;p<s.length;p++)s[p](y,f,b,m)};return d={time:0,frame:0,tick:function(){m(!0)},deltaRatio:function(e){return f/(1e3/(e||60))},wake:function(){Qe&&(!Je&&Fe()&&(qe=Je=window,Ye=qe.document||{},Xe.gsap=Hr,(qe.gsapVersions||=[]).push(Hr.version),$e(Ze||qe.GreenSockGlobals||!qe.gsap&&qe||{}),jn.forEach(Mn)),u=typeof requestAnimationFrame<`u`&&requestAnimationFrame,c&&d.sleep(),l=u||function(e){return setTimeout(e,o-d.time*1e3+1|0)},Vn=1,m(2))},sleep:function(){(u?cancelAnimationFrame:clearTimeout)(c),Vn=0,l=rt},lagSmoothing:function(e,r){t=e||1/0,n=Math.min(r||33,t)},fps:function(e){a=1e3/(e||240),o=d.time*1e3+a},add:function(e,t,n){var r=t?function(t,n,i,a){e(t,n,i,a),d.remove(r)}:e;return d.remove(e),s[n?`unshift`:`push`](r),Un(),r},remove:function(e,t){~(t=s.indexOf(e))&&s.splice(t,1)&&p>=t&&p--},_listeners:s},d}(),Un=function(){return!Vn&&Hn.wake()},Y={},Wn=/^[\d.\-M][\d.\-,\s]/,Gn=/["']/g,Kn=function(e){for(var t={},n=e.substr(1,e.length-3).split(`:`),r=n[0],i=1,a=n.length,o,s,c;i<a;i++)s=n[i],o=i===a-1?s.length:s.lastIndexOf(`,`),c=s.substr(0,o),t[r]=isNaN(c)?c.replace(Gn,``).trim():+c,r=s.substr(o+1).trim();return t},qn=function(e){var t=e.indexOf(`(`)+1,n=e.indexOf(`)`),r=e.indexOf(`(`,t);return e.substring(t,~r&&r<n?e.indexOf(`)`,n+1):n)},Jn=function(e){var t=(e+``).split(`(`),n=Y[t[0]];return n&&t.length>1&&n.config?n.config.apply(null,~e.indexOf(`{`)?[Kn(t[1])]:qn(e).split(`,`).map(wt)):Y._CE&&Wn.test(e)?Y._CE(``,e):n},Yn=function(e){return function(t){return 1-e(1-t)}},Xn=function(e,t){return e&&(V(e)?e:Y[e]||Jn(e))||t},Zn=function(e,t,n,r){n===void 0&&(n=function(e){return 1-t(1-e)}),r===void 0&&(r=function(e){return e<.5?t(e*2)/2:1-t((1-e)*2)/2});var i={easeIn:t,easeOut:n,easeInOut:r},a;return W(e,function(e){for(var t in Y[e]=Xe[e]=i,Y[a=e.toLowerCase()]=n,i)Y[a+(t===`easeIn`?`.in`:t===`easeOut`?`.out`:`.inOut`)]=Y[e+`.`+t]=i[t]}),i},Qn=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},$n=function e(t,n,r){var i=n>=1?n:1,a=(r||(t?.3:.45))/(n<1?n:1),o=a/Te*(Math.asin(1/i)||0),s=function(e){return e===1?1:i*2**(-10*e)*Ae((e-o)*a)+1},c=t===`out`?s:t===`in`?function(e){return 1-s(1-e)}:Qn(s);return a=Te/a,c.config=function(n,r){return e(t,n,r)},c},er=function e(t,n){n===void 0&&(n=1.70158);var r=function(e){return e?--e*e*((n+1)*e+n)+1:0},i=t===`out`?r:t===`in`?function(e){return 1-r(1-e)}:Qn(r);return i.config=function(n){return e(t,n)},i};W(`Linear,Quad,Cubic,Quart,Quint,Strong`,function(e,t){var n=t<5?t+1:t;Zn(e+`,Power`+(n-1),t?function(e){return e**+n}:function(e){return e},function(e){return 1-(1-e)**n},function(e){return e<.5?(e*2)**n/2:1-((1-e)*2)**n/2})}),Y.Linear.easeNone=Y.none=Y.Linear.easeIn,Zn(`Elastic`,$n(`in`),$n(`out`),$n()),(function(e,t){var n=1/t,r=2*n,i=2.5*n,a=function(a){return a<n?e*a*a:a<r?e*(a-1.5/t)**2+.75:a<i?e*(a-=2.25/t)*a+.9375:e*(a-2.625/t)**2+.984375};Zn(`Bounce`,function(e){return 1-a(1-e)},a)})(7.5625,2.75),Zn(`Expo`,function(e){return 2**(10*(e-1))*e+e*e*e*e*e*e*(1-e)}),Zn(`Circ`,function(e){return-(Oe(1-e*e)-1)}),Zn(`Sine`,function(e){return e===1?1:-ke(e*Ee)+1}),Zn(`Back`,er(`in`),er(`out`),er()),Y.SteppedEase=Y.steps=Xe.SteppedEase={config:function(e,t){e===void 0&&(e=1);var n=1/e,r=e+ +!t,i=+!!t,a=1-z;return function(e){return((r*on(0,a,e)|0)+i)*n}}},Se.ease=Y[`quad.out`],W(`onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt`,function(e){return ht+=e+`,`+e+`Params,`});var tr=function(e,t){this.id=De++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:vt,this.set=t?t.getSetter:br},nr=function(){function e(e){this.vars=e,this._delay=+e.delay||0,(this._repeat=e.repeat===1/0?-2:e.repeat||0)&&(this._rDelay=e.repeatDelay||0,this._yoyo=!!e.yoyo||!!e.yoyoEase),this._ts=1,$t(this,+e.duration,1,1),this.data=e.data,R&&(this._ctx=R,R.data.push(this)),Vn||Hn.wake()}var t=e.prototype;return t.delay=function(e){return e||e===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+e-this._delay),this._delay=e,this):this._delay},t.duration=function(e){return arguments.length?this.totalDuration(this._repeat>0?e+(e+this._rDelay)*this._repeat:e):this.totalDuration()&&this._dur},t.totalDuration=function(e){return arguments.length?(this._dirty=0,$t(this,this._repeat<0?e:(e-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},t.totalTime=function(e,t){if(Un(),!arguments.length)return this._tTime;var n=this._dp;if(n&&n.smoothChildTiming&&this._ts){for(Wt(this,e),!n._dp||n.parent||Gt(n,this);n&&n.parent;)n.parent._time!==n._start+(n._ts>=0?n._tTime/n._ts:(n.totalDuration()-n._tTime)/-n._ts)&&n.totalTime(n._tTime,!0),n=n.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&e<this._tDur||this._ts<0&&e>0||!this._tDur&&!e)&&Kt(this._dp,this,this._start-this._delay)}return(this._tTime!==e||!this._dur&&!t||this._initted&&Math.abs(this._zTime)===z||!this._initted&&this._dur&&e||!e&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=e),Ct(this,e,t)),this},t.time=function(e,t){return arguments.length?this.totalTime(Math.min(this.totalDuration(),e+Bt(this))%(this._dur+this._rDelay)||(e?this._dur:0),t):this._time},t.totalProgress=function(e,t){return arguments.length?this.totalTime(this.totalDuration()*e,t):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},t.progress=function(e,t){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-e:e)+Bt(this),t):this.duration()?Math.min(1,this._time/this._dur):+(this.rawTime()>0)},t.iteration=function(e,t){var n=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(e-1)*n,t):this._repeat?Vt(this._tTime,n)+1:1},t.timeScale=function(e,t){if(!arguments.length)return this._rts===-z?0:this._rts;if(this._rts===e)return this;var n=this.parent&&this._ts?Ht(this.parent._time,this):this._tTime;return this._rts=+e||0,this._ts=this._ps||e===-z?0:this._rts,this.totalTime(on(-Math.abs(this._delay),this.totalDuration(),n),t!==!1),Ut(this),Lt(this)},t.paused=function(e){return arguments.length?(this._ps!==e&&(this._ps=e,e?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(Un(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==z&&(this._tTime-=z)))),this):this._ps},t.startTime=function(e){if(arguments.length){this._start=K(e);var t=this.parent||this._dp;return t&&(t._sort||!this.parent)&&Kt(t,this,this._start-this._delay),this}return this._start},t.endTime=function(e){return this._start+(Pe(e)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},t.rawTime=function(e){var t=this.parent||this._dp;return t?e&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Ht(t.rawTime(e),this):this._tTime:this._tTime},t.revert=function(e){e===void 0&&(e=ot);var t=L;return L=e,St(this)&&(this.timeline&&this.timeline.revert(e),this.totalTime(-.01,e.suppressEvents)),this.data!==`nested`&&e.kill!==!1&&this.kill(),L=t,this},t.globalTime=function(e){for(var t=this,n=arguments.length?e:t.rawTime();t;)n=t._start+n/(Math.abs(t._ts)||1),t=t._dp;return!this.parent&&this._sat?this._sat.globalTime(e):n},t.repeat=function(e){return arguments.length?(this._repeat=e===1/0?-2:e,en(this)):this._repeat===-2?1/0:this._repeat},t.repeatDelay=function(e){if(arguments.length){var t=this._time;return this._rDelay=e,en(this),t?this.time(t):this}return this._rDelay},t.yoyo=function(e){return arguments.length?(this._yoyo=e,this):this._yoyo},t.seek=function(e,t){return this.totalTime(nn(this,e),Pe(t))},t.restart=function(e,t){return this.play().totalTime(e?-this._delay:0,Pe(t)),this._dur||(this._zTime=-z),this},t.play=function(e,t){return e!=null&&this.seek(e,t),this.reversed(!1).paused(!1)},t.reverse=function(e,t){return e!=null&&this.seek(e||this.totalDuration(),t),this.reversed(!0).paused(!1)},t.pause=function(e,t){return e!=null&&this.seek(e,t),this.paused(!0)},t.resume=function(){return this.paused(!1)},t.reversed=function(e){return arguments.length?(!!e!==this.reversed()&&this.timeScale(-this._rts||(e?-z:0)),this):this._rts<0},t.invalidate=function(){return this._initted=this._act=0,this._zTime=-z,this},t.isActive=function(){var e=this.parent||this._dp,t=this._start,n;return!!(!e||this._ts&&this._initted&&e.isActive()&&(n=e.rawTime(!0))>=t&&n<this.endTime(!0)-z)},t.eventCallback=function(e,t,n){var r=this.vars;return arguments.length>1?(t?(r[e]=t,n&&(r[e+`Params`]=n),e===`onUpdate`&&(this._onUpdate=t)):delete r[e],this):r[e]},t.then=function(e){var t=this,n=t._prom;return new Promise(function(r){var i=V(e)?e:Tt,a=function(){var e=t.then;t.then=null,n&&n(),V(i)&&(i=i(t))&&(i.then||i===t)&&(t.then=e),r(i),t.then=e};t._initted&&t.totalProgress()===1&&t._ts>=0||!t._tTime&&t._ts<0?a():t._prom=a})},t.kill=function(){kn(this)},e}();Et(nr.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-z,_prom:0,_ps:!1,_rts:1});var X=function(e){be(t,e);function t(t,n){var r;return t===void 0&&(t={}),r=e.call(this,t)||this,r.labels={},r.smoothChildTiming=!!t.smoothChildTiming,r.autoRemoveChildren=!!t.autoRemoveChildren,r._sort=Pe(t.sortChildren),U&&Kt(t.parent||U,ye(r),n),t.reversed&&r.reverse(),t.paused&&r.paused(!0),t.scrollTrigger&&qt(ye(r),t.scrollTrigger),r}var n=t.prototype;return n.to=function(e,t,n){return rn(0,arguments,this),this},n.from=function(e,t,n){return rn(1,arguments,this),this},n.fromTo=function(e,t,n,r){return rn(2,arguments,this),this},n.set=function(e,t,n){return t.duration=0,t.parent=this,jt(t).repeatDelay||(t.repeat=0),t.immediateRender=!!t.immediateRender,new Z(e,t,nn(this,n),1),this},n.call=function(e,t,n){return Kt(this,Z.delayedCall(0,e,t),n)},n.staggerTo=function(e,t,n,r,i,a,o){return n.duration=t,n.stagger=n.stagger||r,n.onComplete=a,n.onCompleteParams=o,n.parent=this,new Z(e,n,nn(this,i)),this},n.staggerFrom=function(e,t,n,r,i,a,o){return n.runBackwards=1,jt(n).immediateRender=Pe(n.immediateRender),this.staggerTo(e,t,n,r,i,a,o)},n.staggerFromTo=function(e,t,n,r,i,a,o,s){return r.startAt=n,jt(r).immediateRender=Pe(r.immediateRender),this.staggerTo(e,t,r,i,a,o,s)},n.render=function(e,t,n){var r=this._time,i=this._dirty?this.totalDuration():this._tDur,a=this._dur,o=e<=0?0:K(e),s=this._zTime<0!=e<0&&(this._initted||!a),c,l,u,d,f,p,m,h,g,_,v,y;if(this!==U&&o>i&&e>=0&&(o=i),o!==this._tTime||n||s){if(r!==this._time&&a&&(o+=this._time-r,e+=this._time-r),c=o,g=this._start,h=this._ts,p=!h,s&&(a||(r=this._zTime),(e||!t)&&(this._zTime=e)),this._repeat){if(v=this._yoyo,f=a+this._rDelay,this._repeat<-1&&e<0)return this.totalTime(f*100+e,t,n);if(c=K(o%f),o===i?(d=this._repeat,c=a):(_=K(o/f),d=~~_,d&&d===_&&(c=a,d--),c>a&&(c=a)),_=Vt(this._tTime,f),!r&&this._tTime&&_!==d&&this._tTime-_*f-this._dur<=0&&(_=d),v&&d&1&&(c=a-c,y=1),d!==_&&!this._lock){var b=v&&_&1,x=b===(v&&d&1);if(d<_&&(b=!b),r=b?0:o%a?a:o,this._lock=1,this.render(r||(y?0:K(d*f)),t,!a)._lock=0,this._tTime=o,!t&&this.parent&&On(this,`onRepeat`),this.vars.repeatRefresh&&!y&&(this.invalidate()._lock=1,_=d),r&&r!==this._time||p!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act||(a=this._dur,i=this._tDur,x&&(this._lock=2,r=b?a:-1e-4,this.render(r,!0),this.vars.repeatRefresh&&!y&&this.invalidate()),this._lock=0,!this._ts&&!p))return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(m=Qt(this,K(r),K(c)),m&&(o-=c-(c=m._start))),this._tTime=o,this._time=c,this._act=!!h,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=e,r=0),!r&&o&&a&&!t&&!_&&(On(this,`onStart`),this._tTime!==o))return this;if(c>=r&&e>=0)for(l=this._first;l;){if(u=l._next,(l._act||c>=l._start)&&l._ts&&m!==l){if(l.parent!==this)return this.render(e,t,n);if(l.render(l._ts>0?(c-l._start)*l._ts:(l._dirty?l.totalDuration():l._tDur)+(c-l._start)*l._ts,t,n),c!==this._time||!this._ts&&!p){m=0,u&&(o+=this._zTime=-z);break}}l=u}else{l=this._last;for(var S=e<0?e:c;l;){if(u=l._prev,(l._act||S<=l._end)&&l._ts&&m!==l){if(l.parent!==this)return this.render(e,t,n);if(l.render(l._ts>0?(S-l._start)*l._ts:(l._dirty?l.totalDuration():l._tDur)+(S-l._start)*l._ts,t,n||L&&St(l)),c!==this._time||!this._ts&&!p){m=0,u&&(o+=this._zTime=S?-z:z);break}}l=u}}if(m&&!t&&(this.pause(),m.render(c>=r?0:-z)._zTime=c>=r?1:-1,this._ts))return this._start=g,Ut(this),this.render(e,t,n);this._onUpdate&&!t&&On(this,`onUpdate`,!0),(o===i&&this._tTime>=this.totalDuration()||!o&&r)&&(g===this._start||Math.abs(h)!==Math.abs(this._ts))&&(this._lock||((e||!a)&&(o===i&&this._ts>0||!o&&this._ts<0)&&Ft(this,1),!t&&!(e<0&&!r)&&(o||r||!i)&&(On(this,o===i&&e>=0?`onComplete`:`onReverseComplete`,!0),this._prom&&!(o<i&&this.timeScale()>0)&&this._prom())))}return this},n.add=function(e,t){var n=this;if(je(t)||(t=nn(this,t,e)),!(e instanceof nr)){if(H(e))return e.forEach(function(e){return n.add(e,t)}),this;if(B(e))return this.addLabel(e,t);if(V(e))e=Z.delayedCall(0,e);else return this}return this===e?this:Kt(this,e,t)},n.getChildren=function(e,t,n,r){e===void 0&&(e=!0),t===void 0&&(t=!0),n===void 0&&(n=!0),r===void 0&&(r=-we);for(var i=[],a=this._first;a;)a._start>=r&&(a instanceof Z?t&&i.push(a):(n&&i.push(a),e&&i.push.apply(i,a.getChildren(!0,t,n)))),a=a._next;return i},n.getById=function(e){for(var t=this.getChildren(1,1,1),n=t.length;n--;)if(t[n].vars.id===e)return t[n]},n.remove=function(e){return B(e)?this.removeLabel(e):V(e)?this.killTweensOf(e):(e.parent===this&&Pt(this,e),e===this._recent&&(this._recent=this._last),It(this))},n.totalTime=function(t,n){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=K(Hn.time-(this._ts>0?t/this._ts:(this.totalDuration()-t)/-this._ts))),e.prototype.totalTime.call(this,t,n),this._forcing=0,this):this._tTime},n.addLabel=function(e,t){return this.labels[e]=nn(this,t),this},n.removeLabel=function(e){return delete this.labels[e],this},n.addPause=function(e,t,n){var r=Z.delayedCall(0,t||rt,n);return r.data=`isPause`,this._hasPause=1,Kt(this,r,nn(this,e))},n.removePause=function(e){var t=this._first;for(e=nn(this,e);t;)t._start===e&&t.data===`isPause`&&Ft(t),t=t._next},n.killTweensOf=function(e,t,n){for(var r=this.getTweensOf(e,n),i=r.length;i--;)sr!==r[i]&&r[i].kill(e,t);return this},n.getTweensOf=function(e,t){for(var n=[],r=dn(e),i=this._first,a=je(t),o;i;)i instanceof Z?bt(i._targets,r)&&(a?(!sr||i._initted&&i._ts)&&i.globalTime(0)<=t&&i.globalTime(i.totalDuration())>t:!t||i.isActive())&&n.push(i):(o=i.getTweensOf(r,t)).length&&n.push.apply(n,o),i=i._next;return n},n.tweenTo=function(e,t){t||={};var n=this,r=nn(n,e),i=t,a=i.startAt,o=i.onStart,s=i.onStartParams,c=i.immediateRender,l,u=Z.to(n,Et({ease:t.ease||`none`,lazy:!1,immediateRender:!1,time:r,overwrite:`auto`,duration:t.duration||Math.abs((r-(a&&`time`in a?a.time:n._time))/n.timeScale())||z,onStart:function(){if(n.pause(),!l){var e=t.duration||Math.abs((r-(a&&`time`in a?a.time:n._time))/n.timeScale());u._dur!==e&&$t(u,e,0,1).render(u._time,!0,!0),l=1}o&&o.apply(u,s||[])}},t));return c?u.render(0):u},n.tweenFromTo=function(e,t,n){return this.tweenTo(t,Et({startAt:{time:nn(this,e)}},n))},n.recent=function(){return this._recent},n.nextLabel=function(e){return e===void 0&&(e=this._time),Dn(this,nn(this,e))},n.previousLabel=function(e){return e===void 0&&(e=this._time),Dn(this,nn(this,e),1)},n.currentLabel=function(e){return arguments.length?this.seek(e,!0):this.previousLabel(this._time+z)},n.shiftChildren=function(e,t,n){n===void 0&&(n=0);var r=this._first,i=this.labels,a;for(e=K(e);r;)r._start>=n&&(r._start+=e,r._end+=e),r=r._next;if(t)for(a in i)i[a]>=n&&(i[a]+=e);return It(this)},n.invalidate=function(t){var n=this._first;for(this._lock=0;n;)n.invalidate(t),n=n._next;return e.prototype.invalidate.call(this,t)},n.clear=function(e){e===void 0&&(e=!0);for(var t=this._first,n;t;)n=t._next,this.remove(t),t=n;return this._dp&&(this._time=this._tTime=this._pTime=0),e&&(this.labels={}),It(this)},n.totalDuration=function(e){var t=0,n=this,r=n._last,i=we,a,o,s;if(arguments.length)return n.timeScale((n._repeat<0?n.duration():n.totalDuration())/(n.reversed()?-e:e));if(n._dirty){for(s=n.parent;r;)a=r._prev,r._dirty&&r.totalDuration(),o=r._start,o>i&&n._sort&&r._ts&&!n._lock?(n._lock=1,Kt(n,r,o-r._delay,1)._lock=0):i=o,o<0&&r._ts&&(t-=o,(!s&&!n._dp||s&&s.smoothChildTiming)&&(n._start+=K(o/n._ts),n._time-=o,n._tTime-=o),n.shiftChildren(-o,!1,-1/0),i=0),r._end>t&&r._ts&&(t=r._end),r=a;$t(n,n===U&&n._time>t?n._time:t,1,1),n._dirty=0}return n._tDur},t.updateRoot=function(e){if(U._ts&&(Ct(U,Ht(e,U)),ut=Hn.frame),Hn.frame>=pt){pt+=xe.autoSleep||120;var t=U._first;if((!t||!t._ts)&&xe.autoSleep&&Hn._listeners.length<2){for(;t&&!t._ts;)t=t._next;t||Hn.sleep()}}},t}(nr);Et(X.prototype,{_lock:0,_hasPause:0,_forcing:0});var rr=function(e,t,n,r,i,a,o){var s=new Q(this._pt,e,t,0,1,Cr,null,i),c=0,l=0,u,d,f,p,m,h,g,_;for(s.b=n,s.e=r,n+=``,r+=``,(g=~r.indexOf(`random(`))&&(r=wn(r)),a&&(_=[n,r],a(_,e,t),n=_[0],r=_[1]),d=n.match(Ue)||[];u=Ue.exec(r);)p=u[0],m=r.substring(c,u.index),f?f=(f+1)%5:m.substr(-5)===`rgba(`&&(f=1),p!==d[l++]&&(h=parseFloat(d[l-1])||0,s._pt={_next:s._pt,p:m||l===1?m:`,`,s:h,c:p.charAt(1)===`=`?yt(h,p)-h:parseFloat(p)-h,m:f&&f<4?Math.round:0},c=Ue.lastIndex);return s.c=c<r.length?r.substring(c,r.length):``,s.fp=o,(We.test(r)||g)&&(s.e=0),this._pt=s,s},ir=function(e,t,n,r,i,a,o,s,c,l){V(r)&&(r=r(i||0,e,a));var u=e[t],d=n===`get`?V(u)?c?e[t.indexOf(`set`)||!V(e[`get`+t.substr(3)])?t:`get`+t.substr(3)](c):e[t]():u:n,f=V(u)?c?vr:_r:gr,p;if(B(r)&&(~r.indexOf(`random(`)&&(r=wn(r)),r.charAt(1)===`=`&&(p=yt(d,r)+(q(d)||0),(p||p===0)&&(r=p))),!l||d!==r||cr)return!isNaN(d*r)&&r!==``?(p=new Q(this._pt,e,t,+d||0,r-(d||0),typeof u==`boolean`?Sr:xr,0,f),c&&(p.fp=c),o&&p.modifier(o,this,e),this._pt=p):(!u&&!(t in e)&&et(t,r),rr.call(this,e,t,d,r,f,s||xe.stringFilter,c))},ar=function(e,t,n,r,i){if(V(e)&&(e=pr(e,i,t,n,r)),!Ne(e)||e.style&&e.nodeType||H(e)||Le(e))return B(e)?pr(e,i,t,n,r):e;var a={},o;for(o in e)a[o]=pr(e[o],i,t,n,r);return a},or=function(e,t,n,r,i,a){var o,s,c,l;if(dt[e]&&(o=new dt[e]).init(i,o.rawVars?t[e]:ar(t[e],r,i,a,n),n,r,a)!==!1&&(n._pt=s=new Q(n._pt,i,e,0,1,o.render,o,0,o.priority),n!==An))for(c=n._ptLookup[n._targets.indexOf(i)],l=o._props.length;l--;)c[o._props[l]]=s;return o},sr,cr,lr=function e(t,n,r){var i=t.vars,a=i.ease,o=i.startAt,s=i.immediateRender,c=i.lazy,l=i.onUpdate,u=i.runBackwards,d=i.yoyoEase,f=i.keyframes,p=i.autoRevert,m=t._dur,h=t._startAt,g=t._targets,_=t.parent,v=_&&_.data===`nested`?_.vars.targets:g,y=t._overwrite===`auto`&&!Ce,b=t.timeline,x=i.easeReverse||d,S,C,w,T,E,D,O,k,A,j,M,N,ee;if(b&&(!f||!a)&&(a=`none`),t._ease=Xn(a,Se.ease),t._rEase=x&&(Xn(x)||t._ease),t._from=!b&&!!i.runBackwards,t._from&&(t.ratio=1),!b||f&&!i.stagger){if(k=g[0]?_t(g[0]).harness:0,N=k&&i[k.prop],S=At(i,st),h&&(h._zTime<0&&h.progress(1),n<0&&u&&s&&!p?h.render(-1,!0):h.revert(u&&m?at:it),h._lazy=0),o){if(Ft(t._startAt=Z.set(g,Et({data:`isStart`,overwrite:!1,parent:_,immediateRender:!0,lazy:!h&&Pe(c),startAt:null,delay:0,onUpdate:l&&function(){return On(t,`onUpdate`)},stagger:0},o))),t._startAt._dp=0,t._startAt._sat=t,n<0&&(L||!s&&!p)&&t._startAt.revert(at),s&&m&&n<=0&&r<=0){n&&(t._zTime=n);return}}else if(u&&m&&!h){if(n&&(s=!1),w=Et({overwrite:!1,data:`isFromStart`,lazy:s&&!h&&Pe(c),immediateRender:s,stagger:0,parent:_},S),N&&(w[k.prop]=N),Ft(t._startAt=Z.set(g,w)),t._startAt._dp=0,t._startAt._sat=t,n<0&&(L?t._startAt.revert(at):t._startAt.render(-1,!0)),t._zTime=n,!s)e(t._startAt,z,z);else if(!n)return}for(t._pt=t._ptCache=0,c=m&&Pe(c)||c&&!m,C=0;C<g.length;C++){if(E=g[C],O=E._gsap||gt(g)[C]._gsap,t._ptLookup[C]=j={},lt[O.id]&&ct.length&&xt(),M=v===g?C:v.indexOf(E),k&&(A=new k).init(E,N||S,t,M,v)!==!1&&(t._pt=T=new Q(t._pt,E,A.name,0,1,A.render,A,0,A.priority),A._props.forEach(function(e){j[e]=T}),A.priority&&(D=1)),!k||N)for(w in S)dt[w]&&(A=or(w,S,t,M,E,v))?A.priority&&(D=1):j[w]=T=ir.call(t,E,w,`get`,S[w],M,v,0,i.stringFilter);t._op&&t._op[C]&&t.kill(E,t._op[C]),y&&t._pt&&(sr=t,U.killTweensOf(E,j,t.globalTime(n)),ee=!t.parent,sr=0),t._pt&&c&&(lt[O.id]=1)}D&&Or(t),t._onInit&&t._onInit(t)}t._onUpdate=l,t._initted=(!t._op||t._pt)&&!ee,f&&n<=0&&b.render(we,!0,!0)},ur=function(e,t,n,r,i,a,o,s){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],l,u,d,f;if(!c)for(c=e._ptCache[t]=[],d=e._ptLookup,f=e._targets.length;f--;){if(l=d[f][t],l&&l.d&&l.d._pt)for(l=l.d._pt;l&&l.p!==t&&l.fp!==t;)l=l._next;if(!l)return cr=1,e.vars[t]=`+=0`,lr(e,o),cr=0,s?tt(t+` not eligible for reset. Try splitting into individual properties`):1;c.push(l)}for(f=c.length;f--;)u=c[f],l=u._pt||u,l.s=(r||r===0)&&!i?r:l.s+(r||0)+a*l.c,l.c=n-l.s,u.e&&=G(n)+q(u.e),u.b&&=l.s+q(u.b)},dr=function(e,t){var n=e[0]?_t(e[0]).harness:0,r=n&&n.aliases,i,a,o,s;if(!r)return t;for(a in i=Ot({},t),r)if(a in i)for(s=r[a].split(`,`),o=s.length;o--;)i[s[o]]=i[a];return i},fr=function(e,t,n,r){var i=t.ease||r||`power1.inOut`,a,o;if(H(t))o=n[e]||(n[e]=[]),t.forEach(function(e,n){return o.push({t:n/(t.length-1)*100,v:e,e:i})});else for(a in t)o=n[a]||(n[a]=[]),a===`ease`||o.push({t:parseFloat(e),v:t[a],e:i})},pr=function(e,t,n,r,i){return V(e)?e.call(t,n,r,i):B(e)&&~e.indexOf(`random(`)?wn(e):e},mr=ht+`repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert`,hr={};W(mr+`,id,stagger,delay,duration,paused,scrollTrigger`,function(e){return hr[e]=1});var Z=function(e){be(t,e);function t(t,n,r,i){var a;typeof n==`number`&&(r.duration=n,n=r,r=null),a=e.call(this,i?n:jt(n))||this;var o=a.vars,s=o.duration,c=o.delay,l=o.immediateRender,u=o.stagger,d=o.overwrite,f=o.keyframes,p=o.defaults,m=o.scrollTrigger,h=n.parent||U,g=(H(t)||Le(t)?je(t[0]):`length`in n)?[t]:dn(t),_,v,y,b,x,S,C,w;if(a._targets=g.length?gt(g):tt(`GSAP target `+t+` not found. https://gsap.com`,!xe.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=d,f||u||Ie(s)||Ie(c)){n=a.vars;var T=n.easeReverse||n.yoyoEase;if(_=a.timeline=new X({data:`nested`,defaults:p||{},targets:h&&h.data===`nested`?h.vars.targets:g}),_.kill(),_.parent=_._dp=ye(a),_._start=0,u||Ie(s)||Ie(c)){if(b=g.length,C=u&&mn(u),Ne(u))for(x in u)~mr.indexOf(x)&&(w||={},w[x]=u[x]);for(v=0;v<b;v++)y=At(n,hr),y.stagger=0,T&&(y.easeReverse=T),w&&Ot(y,w),S=g[v],y.duration=+pr(s,ye(a),v,S,g),y.delay=(+pr(c,ye(a),v,S,g)||0)-a._delay,!u&&b===1&&y.delay&&(a._delay=c=y.delay,a._start+=c,y.delay=0),_.to(S,y,C?C(v,S,g):0),_._ease=Y.none;_.duration()?s=c=0:a.timeline=0}else if(f){jt(Et(_.vars.defaults,{ease:`none`})),_._ease=Xn(f.ease||n.ease||`none`);var E=0,D,O,k;if(H(f))f.forEach(function(e){return _.to(g,e,`>`)}),_.duration();else{for(x in y={},f)x===`ease`||x===`easeEach`||fr(x,f[x],y,f.easeEach);for(x in y)for(D=y[x].sort(function(e,t){return e.t-t.t}),E=0,v=0;v<D.length;v++)O=D[v],k={ease:O.e,duration:(O.t-(v?D[v-1].t:0))/100*s},k[x]=O.v,_.to(g,k,E),E+=k.duration;_.duration()<s&&_.to({},{duration:s-_.duration()})}}s||a.duration(s=_.duration())}else a.timeline=0;return d===!0&&!Ce&&(sr=ye(a),U.killTweensOf(g),sr=0),Kt(h,ye(a),r),n.reversed&&a.reverse(),n.paused&&a.paused(!0),(l||!s&&!f&&a._start===K(h._time)&&Pe(l)&&zt(ye(a))&&h.data!==`nested`)&&(a._tTime=-z,a.render(Math.max(0,-c)||0)),m&&qt(ye(a),m),a}var n=t.prototype;return n.render=function(e,t,n){var r=this._time,i=this._tDur,a=this._dur,o=e<0,s=e>i-z&&!o?i:e<z?0:e,c,l,u,d,f,p,m,h;if(!a)Zt(this,e,t,n);else if(s!==this._tTime||!e||n||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==o||this._lazy){if(c=s,h=this.timeline,this._repeat){if(d=a+this._rDelay,this._repeat<-1&&o)return this.totalTime(d*100+e,t,n);if(c=K(s%d),s===i?(u=this._repeat,c=a):(f=K(s/d),u=~~f,u&&u===f?(c=a,u--):c>a&&(c=a)),p=this._yoyo&&u&1,p&&(c=a-c),f=Vt(this._tTime,d),c===r&&!n&&this._initted&&u===f)return this._tTime=s,this;u!==f&&this.vars.repeatRefresh&&!p&&!this._lock&&c!==d&&this._initted&&(this._lock=n=1,this.render(K(d*u),!0).invalidate()._lock=0)}if(!this._initted){if(Jt(this,o?e:c,n,t,s))return this._tTime=0,this;if(r!==this._time&&!(n&&this.vars.repeatRefresh&&u!==f))return this;if(a!==this._dur)return this.render(e,t,n)}if(this._rEase){var g=c<r;if(g!==this._inv){var _=g?r:a-r;this._inv=g,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=r,this._invRecip=_?(g?-1:1)/_:0,this._invScale=g?-this.ratio:1-this.ratio,this._invEase=g?this._rEase:this._ease}this.ratio=m=this._invRatio+this._invScale*this._invEase((c-this._invTime)*this._invRecip)}else this.ratio=m=this._ease(c/a);if(this._from&&(this.ratio=m=1-m),this._tTime=s,this._time=c,!this._act&&this._ts&&(this._act=1,this._lazy=0),!r&&s&&!t&&!f&&(On(this,`onStart`),this._tTime!==s))return this;for(l=this._pt;l;)l.r(m,l.d),l=l._next;h&&h.render(e<0?e:h._dur*h._ease(c/this._dur),t,n)||this._startAt&&(this._zTime=e),this._onUpdate&&!t&&(o&&Rt(this,e,t,n),On(this,`onUpdate`)),this._repeat&&u!==f&&this.vars.onRepeat&&!t&&this.parent&&On(this,`onRepeat`),(s===this._tDur||!s)&&this._tTime===s&&(o&&!this._onUpdate&&Rt(this,e,!0,!0),(e||!a)&&(s===this._tDur&&this._ts>0||!s&&this._ts<0)&&Ft(this,1),!t&&!(o&&!r)&&(s||r||p)&&(On(this,s===i?`onComplete`:`onReverseComplete`,!0),this._prom&&!(s<i&&this.timeScale()>0)&&this._prom()))}return this},n.targets=function(){return this._targets},n.invalidate=function(t){return(!t||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(t),e.prototype.invalidate.call(this,t)},n.resetTo=function(e,t,n,r,i){Vn||Hn.wake(),this._ts||this.play();var a=Math.min(this._dur,(this._dp._time-this._start)*this._ts),o;return this._initted||lr(this,a),o=this._ease(a/this._dur),ur(this,e,t,n,r,o,a,i)?this.resetTo(e,t,n,r,1):(Wt(this,0),this.parent||Nt(this._dp,this,`_first`,`_last`,this._dp._sort?`_start`:0),this.render(0))},n.kill=function(e,t){if(t===void 0&&(t=`all`),!e&&(!t||t===`all`))return this._lazy=this._pt=0,this.parent?kn(this):this.scrollTrigger&&this.scrollTrigger.kill(!!L),this;if(this.timeline){var n=this.timeline.totalDuration();return this.timeline.killTweensOf(e,t,sr&&sr.vars.overwrite!==!0)._first||kn(this),this.parent&&n!==this.timeline.totalDuration()&&$t(this,this._dur*this.timeline._tDur/n,0,1),this}var r=this._targets,i=e?dn(e):r,a=this._ptLookup,o=this._pt,s,c,l,u,d,f,p;if((!t||t===`all`)&&Mt(r,i))return t===`all`&&(this._pt=0),kn(this);for(s=this._op=this._op||[],t!==`all`&&(B(t)&&(d={},W(t,function(e){return d[e]=1}),t=d),t=dr(r,t)),p=r.length;p--;)if(~i.indexOf(r[p]))for(d in c=a[p],t===`all`?(s[p]=t,u=c,l={}):(l=s[p]=s[p]||{},u=t),u)f=c&&c[d],f&&((!(`kill`in f.d)||f.d.kill(d)===!0)&&Pt(this,f,`_pt`),delete c[d]),l!==`all`&&(l[d]=1);return this._initted&&!this._pt&&o&&kn(this),this},t.to=function(e,n){return new t(e,n,arguments[2])},t.from=function(e,t){return rn(1,arguments)},t.delayedCall=function(e,n,r,i){return new t(n,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:e,onComplete:n,onReverseComplete:n,onCompleteParams:r,onReverseCompleteParams:r,callbackScope:i})},t.fromTo=function(e,t,n){return rn(2,arguments)},t.set=function(e,n){return n.duration=0,n.repeatDelay||(n.repeat=0),new t(e,n)},t.killTweensOf=function(e,t,n){return U.killTweensOf(e,t,n)},t}(nr);Et(Z.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0}),W(`staggerTo,staggerFrom,staggerFromTo`,function(e){Z[e]=function(){var t=new X,n=cn.call(arguments,0);return n.splice(e===`staggerFromTo`?5:4,0,0),t[e].apply(t,n)}});var gr=function(e,t,n){return e[t]=n},_r=function(e,t,n){return e[t](n)},vr=function(e,t,n,r){return e[t](r.fp,n)},yr=function(e,t,n){return e.setAttribute(t,n)},br=function(e,t){return V(e[t])?_r:Me(e[t])&&e.setAttribute?yr:gr},xr=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},Sr=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},Cr=function(e,t){var n=t._pt,r=``;if(!e&&t.b)r=t.b;else if(e===1&&t.e)r=t.e;else{for(;n;)r=n.p+(n.m?n.m(n.s+n.c*e):Math.round((n.s+n.c*e)*1e4)/1e4)+r,n=n._next;r+=t.c}t.set(t.t,t.p,r,t)},wr=function(e,t){for(var n=t._pt;n;)n.r(e,n.d),n=n._next},Tr=function(e,t,n,r){for(var i=this._pt,a;i;)a=i._next,i.p===r&&i.modifier(e,t,n),i=a},Er=function(e){for(var t=this._pt,n,r;t;)r=t._next,t.p===e&&!t.op||t.op===e?Pt(this,t,`_pt`):t.dep||(n=1),t=r;return!n},Dr=function(e,t,n,r){r.mSet(e,t,r.m.call(r.tween,n,r.mt),r)},Or=function(e){for(var t=e._pt,n,r,i,a;t;){for(n=t._next,r=i;r&&r.pr>t.pr;)r=r._next;(t._prev=r?r._prev:a)?t._prev._next=t:i=t,(t._next=r)?r._prev=t:a=t,t=n}e._pt=i},Q=function(){function e(e,t,n,r,i,a,o,s,c){this.t=t,this.s=r,this.c=i,this.p=n,this.r=a||xr,this.d=o||this,this.set=s||gr,this.pr=c||0,this._next=e,e&&(e._prev=this)}var t=e.prototype;return t.modifier=function(e,t,n){this.mSet=this.mSet||this.set,this.set=Dr,this.m=e,this.mt=n,this.tween=t},e}();W(ht+`parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse`,function(e){return st[e]=1}),Xe.TweenMax=Xe.TweenLite=Z,Xe.TimelineLite=Xe.TimelineMax=X,U=new X({sortChildren:!1,defaults:Se,autoRemoveChildren:!0,id:`root`,smoothChildTiming:!0}),xe.stringFilter=Bn;var kr=[],Ar={},jr=[],Mr=0,Nr=0,Pr=function(e){return(Ar[e]||jr).map(function(e){return e()})},Fr=function(){var e=Date.now(),t=[];e-Mr>2&&(Pr(`matchMediaInit`),kr.forEach(function(e){var n=e.queries,r=e.conditions,i,a,o,s;for(a in n)i=qe.matchMedia(n[a]).matches,i&&(o=1),i!==r[a]&&(r[a]=i,s=1);s&&(e.revert(),o&&t.push(e))}),Pr(`matchMediaRevert`),t.forEach(function(e){return e.onMatch(e,function(t){return e.add(null,t)})}),Mr=e,Pr(`matchMedia`))},Ir=function(){function e(e,t){this.selector=t&&fn(t),this.data=[],this._r=[],this.isReverted=!1,this.id=Nr++,e&&this.add(e)}var t=e.prototype;return t.add=function(e,t,n){V(e)&&(n=t,t=e,e=V);var r=this,i=function(){var e=R,i=r.selector,a;return e&&e!==r&&e.data.push(r),n&&(r.selector=fn(n)),R=r,a=t.apply(r,arguments),V(a)&&r._r.push(a),R=e,r.selector=i,r.isReverted=!1,a};return r.last=i,e===V?i(r,function(e){return r.add(null,e)}):e?r[e]=i:i},t.ignore=function(e){var t=R;R=null,e(this),R=t},t.getTweens=function(){var t=[];return this.data.forEach(function(n){return n instanceof e?t.push.apply(t,n.getTweens()):n instanceof Z&&!(n.parent&&n.parent.data===`nested`)&&t.push(n)}),t},t.clear=function(){this._r.length=this.data.length=0},t.kill=function(e,t){var n=this;if(e?(function(){for(var t=n.getTweens(),r=n.data.length,i;r--;)i=n.data[r],i.data===`isFlip`&&(i.revert(),i.getChildren(!0,!0,!1).forEach(function(e){return t.splice(t.indexOf(e),1)}));for(t.map(function(e){return{g:e._dur||e._delay||e._sat&&!e._sat.vars.immediateRender?e.globalTime(0):-1/0,t:e}}).sort(function(e,t){return t.g-e.g||-1/0}).forEach(function(t){return t.t.revert(e)}),r=n.data.length;r--;)i=n.data[r],i instanceof X?i.data!==`nested`&&(i.scrollTrigger&&i.scrollTrigger.revert(),i.kill()):!(i instanceof Z)&&i.revert&&i.revert(e);n._r.forEach(function(t){return t(e,n)}),n.isReverted=!0})():this.data.forEach(function(e){return e.kill&&e.kill()}),this.clear(),t)for(var r=kr.length;r--;)kr[r].id===this.id&&kr.splice(r,1)},t.revert=function(e){this.kill(e||{})},e}(),Lr=function(){function e(e){this.contexts=[],this.scope=e,R&&R.data.push(this)}var t=e.prototype;return t.add=function(e,t,n){Ne(e)||(e={matches:e});var r=new Ir(0,n||this.scope),i=r.conditions={},a,o,s;for(o in R&&!r.selector&&(r.selector=R.selector),this.contexts.push(r),t=r.add(`onMatch`,t),r.queries=e,e)o===`all`?s=1:(a=qe.matchMedia(e[o]),a&&(kr.indexOf(r)<0&&kr.push(r),(i[o]=a.matches)&&(s=1),a.addListener?a.addListener(Fr):a.addEventListener(`change`,Fr)));return s&&t(r,function(e){return r.add(null,e)}),this},t.revert=function(e){this.kill(e||{})},t.kill=function(e){this.contexts.forEach(function(t){return t.kill(e,!0)})},e}(),Rr={registerPlugin:function(){[...arguments].forEach(function(e){return Mn(e)})},timeline:function(e){return new X(e)},getTweensOf:function(e,t){return U.getTweensOf(e,t)},getProperty:function(e,t,n,r){B(e)&&(e=dn(e)[0]);var i=_t(e||{}).get,a=n?Tt:wt;return n===`native`&&(n=``),e&&(t?a((dt[t]&&dt[t].get||i)(e,t,n,r)):function(t,n,r){return a((dt[t]&&dt[t].get||i)(e,t,n,r))})},quickSetter:function(e,t,n){if(e=dn(e),e.length>1){var r=e.map(function(e){return Hr.quickSetter(e,t,n)}),i=r.length;return function(e){for(var t=i;t--;)r[t](e)}}e=e[0]||{};var a=dt[t],o=_t(e),s=o.harness&&(o.harness.aliases||{})[t]||t,c=a?function(t){var r=new a;An._pt=0,r.init(e,n?t+n:t,An,0,[e]),r.render(1,r),An._pt&&wr(1,An)}:o.set(e,s);return a?c:function(t){return c(e,s,n?t+n:t,o,1)}},quickTo:function(e,t,n){var r,i=Hr.to(e,Et((r={},r[t]=`+=0.1`,r.paused=!0,r.stagger=0,r),n||{})),a=function(e,n,r){return i.resetTo(t,e,n,r)};return a.tween=i,a},isTweening:function(e){return U.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=Xn(e.ease,Se.ease)),kt(Se,e||{})},config:function(e){return kt(xe,e||{})},registerEffect:function(e){var t=e.name,n=e.effect,r=e.plugins,i=e.defaults,a=e.extendTimeline;(r||``).split(`,`).forEach(function(e){return e&&!dt[e]&&!Xe[e]&&tt(t+` effect requires `+e+` plugin.`)}),ft[t]=function(e,t,r){return n(dn(e),Et(t||{},i),r)},a&&(X.prototype[t]=function(e,n,r){return this.add(ft[t](e,Ne(n)?n:(r=n)&&{},this),r)})},registerEase:function(e,t){Y[e]=Xn(t)},parseEase:function(e,t){return arguments.length?Xn(e,t):Y},getById:function(e){return U.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var n=new X(e),r,i;for(n.smoothChildTiming=Pe(e.smoothChildTiming),U.remove(n),n._dp=0,n._time=n._tTime=U._time,r=U._first;r;)i=r._next,(t||!(!r._dur&&r instanceof Z&&r.vars.onComplete===r._targets[0]))&&Kt(n,r,r._start-r._delay),r=i;return Kt(U,n,0),n},context:function(e,t){return e?new Ir(e,t):R},matchMedia:function(e){return new Lr(e)},matchMediaRefresh:function(){return kr.forEach(function(e){var t=e.conditions,n,r;for(r in t)t[r]&&(t[r]=!1,n=1);n&&e.revert()})||Fr()},addEventListener:function(e,t){var n=Ar[e]||(Ar[e]=[]);~n.indexOf(t)||n.push(t)},removeEventListener:function(e,t){var n=Ar[e],r=n&&n.indexOf(t);r>=0&&n.splice(r,1)},utils:{wrap:Sn,wrapYoyo:Cn,distribute:mn,random:_n,snap:gn,normalize:bn,getUnit:q,clamp:sn,splitColor:Fn,toArray:dn,selector:fn,mapRange:Tn,pipe:vn,unitize:yn,interpolate:En,shuffle:pn},install:$e,effects:ft,ticker:Hn,updateRoot:X.updateRoot,plugins:dt,globalTimeline:U,core:{PropTween:Q,globals:nt,Tween:Z,Timeline:X,Animation:nr,getCache:_t,_removeLinkedListItem:Pt,reverting:function(){return L},context:function(e){return e&&R&&(R.data.push(e),e._ctx=R),R},suppressOverwrites:function(e){return Ce=e}}};W(`to,from,fromTo,delayedCall,set,killTweensOf`,function(e){return Rr[e]=Z[e]}),Hn.add(X.updateRoot),An=Rr.to({},{duration:0});var zr=function(e,t){for(var n=e._pt;n&&n.p!==t&&n.op!==t&&n.fp!==t;)n=n._next;return n},Br=function(e,t){var n=e._targets,r,i,a;for(r in t)for(i=n.length;i--;)a=e._ptLookup[i][r],(a&&=a.d)&&(a._pt&&(a=zr(a,r)),a&&a.modifier&&a.modifier(t[r],e,n[i],r))},Vr=function(e,t){return{name:e,headless:1,rawVars:1,init:function(e,n,r){r._onInit=function(e){var r,i;if(B(n)&&(r={},W(n,function(e){return r[e]=1}),n=r),t){for(i in r={},n)r[i]=t(n[i]);n=r}Br(e,n)}}}},Hr=Rr.registerPlugin({name:`attr`,init:function(e,t,n,r,i){var a,o,s;for(a in this.tween=n,t)s=e.getAttribute(a)||``,o=this.add(e,`setAttribute`,(s||0)+``,t[a],r,i,0,0,a),o.op=a,o.b=s,this._props.push(a)},render:function(e,t){for(var n=t._pt;n;)L?n.set(n.t,n.p,n.b,n):n.r(e,n.d),n=n._next}},{name:`endArray`,headless:1,init:function(e,t){for(var n=t.length;n--;)this.add(e,n,e[n]||0,t[n],0,0,0,0,0,1)}},Vr(`roundProps`,hn),Vr(`modifiers`),Vr(`snap`,gn))||Rr;Z.version=X.version=Hr.version=`3.15.0`,Qe=1,Fe()&&Un(),Y.Power0,Y.Power1,Y.Power2,Y.Power3,Y.Power4,Y.Linear,Y.Quad,Y.Cubic,Y.Quart,Y.Quint,Y.Strong,Y.Elastic,Y.Back,Y.SteppedEase,Y.Bounce,Y.Sine,Y.Expo,Y.Circ;var Ur,Wr,Gr,Kr,qr,Jr,Yr,Xr=function(){return typeof window<`u`},Zr={},Qr=180/Math.PI,$r=Math.PI/180,ei=Math.atan2,ti=1e8,ni=/([A-Z])/g,ri=/(left|right|width|margin|padding|x)/i,ii=/[\s,\(]\S/,ai={autoAlpha:`opacity,visibility`,scale:`scaleX,scaleY`,alpha:`opacity`},oi=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},si=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},ci=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},li=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},ui=function(e,t){var n=t.s+t.c*e;t.set(t.t,t.p,~~(n+(n<0?-.5:.5))+t.u,t)},di=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},fi=function(e,t){return t.set(t.t,t.p,e===1?t.e:t.b,t)},pi=function(e,t,n){return e.style[t]=n},mi=function(e,t,n){return e.style.setProperty(t,n)},hi=function(e,t,n){return e._gsap[t]=n},gi=function(e,t,n){return e._gsap.scaleX=e._gsap.scaleY=n},_i=function(e,t,n,r,i){var a=e._gsap;a.scaleX=a.scaleY=n,a.renderTransform(i,a)},vi=function(e,t,n,r,i){var a=e._gsap;a[t]=n,a.renderTransform(i,a)},$=`transform`,yi=$+`Origin`,bi=function e(t,n){var r=this,i=this.target,a=i.style,o=i._gsap;if(t in Zr&&a){if(this.tfm=this.tfm||{},t!==`transform`)t=ai[t]||t,~t.indexOf(`,`)?t.split(`,`).forEach(function(e){return r.tfm[e]=zi(i,e)}):this.tfm[t]=o.x?o[t]:zi(i,t),t===yi&&(this.tfm.zOrigin=o.zOrigin);else return ai.transform.split(`,`).forEach(function(t){return e.call(r,t,n)});if(this.props.indexOf($)>=0)return;o.svg&&(this.svgo=i.getAttribute(`data-svg-origin`),this.props.push(yi,n,``)),t=$}(a||n)&&this.props.push(t,n,a[t])},xi=function(e){e.translate&&(e.removeProperty(`translate`),e.removeProperty(`scale`),e.removeProperty(`rotate`))},Si=function(){var e=this.props,t=this.target,n=t.style,r=t._gsap,i,a;for(i=0;i<e.length;i+=3)e[i+1]?e[i+1]===2?t[e[i]](e[i+2]):t[e[i]]=e[i+2]:e[i+2]?n[e[i]]=e[i+2]:n.removeProperty(e[i].substr(0,2)===`--`?e[i]:e[i].replace(ni,`-$1`).toLowerCase());if(this.tfm){for(a in this.tfm)r[a]=this.tfm[a];r.svg&&(r.renderTransform(),t.setAttribute(`data-svg-origin`,this.svgo||``)),i=Yr(),(!i||!i.isStart)&&!n[$]&&(xi(n),r.zOrigin&&n[yi]&&(n[yi]+=` `+r.zOrigin+`px`,r.zOrigin=0,r.renderTransform()),r.uncache=1)}},Ci=function(e,t){var n={target:e,props:[],revert:Si,save:bi};return e._gsap||Hr.core.getCache(e),t&&e.style&&e.nodeType&&t.split(`,`).forEach(function(e){return n.save(e)}),n},wi,Ti=function(e,t){var n=Wr.createElementNS?Wr.createElementNS((t||`http://www.w3.org/1999/xhtml`).replace(/^https/,`http`),e):Wr.createElement(e);return n&&n.style?n:Wr.createElement(e)},Ei=function e(t,n,r){var i=getComputedStyle(t);return i[n]||i.getPropertyValue(n.replace(ni,`-$1`).toLowerCase())||i.getPropertyValue(n)||!r&&e(t,Oi(n)||n,1)||``},Di=`O,Moz,ms,Ms,Webkit`.split(`,`),Oi=function(e,t,n){var r=(t||qr).style,i=5;if(e in r&&!n)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);i--&&!(Di[i]+e in r););return i<0?null:(i===3?`ms`:i>=0?Di[i]:``)+e},ki=function(){Xr()&&window.document&&(Ur=window,Wr=Ur.document,Gr=Wr.documentElement,qr=Ti(`div`)||{style:{}},Ti(`div`),$=Oi($),yi=$+`Origin`,qr.style.cssText=`border-width:0;line-height:0;position:absolute;padding:0`,wi=!!Oi(`perspective`),Yr=Hr.core.reverting,Kr=1)},Ai=function(e){var t=e.ownerSVGElement,n=Ti(`svg`,t&&t.getAttribute(`xmlns`)||`http://www.w3.org/2000/svg`),r=e.cloneNode(!0),i;r.style.display=`block`,n.appendChild(r),Gr.appendChild(n);try{i=r.getBBox()}catch{}return n.removeChild(r),Gr.removeChild(n),i},ji=function(e,t){for(var n=t.length;n--;)if(e.hasAttribute(t[n]))return e.getAttribute(t[n])},Mi=function(e){var t,n;try{t=e.getBBox()}catch{t=Ai(e),n=1}return t&&(t.width||t.height)||n||(t=Ai(e)),t&&!t.width&&!t.x&&!t.y?{x:+ji(e,[`x`,`cx`,`x1`])||0,y:+ji(e,[`y`,`cy`,`y1`])||0,width:0,height:0}:t},Ni=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&Mi(e))},Pi=function(e,t){if(t){var n=e.style,r;t in Zr&&t!==yi&&(t=$),n.removeProperty?(r=t.substr(0,2),(r===`ms`||t.substr(0,6)===`webkit`)&&(t=`-`+t),n.removeProperty(r===`--`?t:t.replace(ni,`-$1`).toLowerCase())):n.removeAttribute(t)}},Fi=function(e,t,n,r,i,a){var o=new Q(e._pt,t,n,0,1,a?fi:di);return e._pt=o,o.b=r,o.e=i,e._props.push(n),o},Ii={deg:1,rad:1,turn:1},Li={grid:1,flex:1},Ri=function e(t,n,r,i){var a=parseFloat(r)||0,o=(r+``).trim().substr((a+``).length)||`px`,s=qr.style,c=ri.test(n),l=t.tagName.toLowerCase()===`svg`,u=(l?`client`:`offset`)+(c?`Width`:`Height`),d=100,f=i===`px`,p=i===`%`,m,h,g,_;if(i===o||!a||Ii[i]||Ii[o])return a;if(o!==`px`&&!f&&(a=e(t,n,r,`px`)),_=t.getCTM&&Ni(t),(p||o===`%`)&&(Zr[n]||~n.indexOf(`adius`)))return m=_?t.getBBox()[c?`width`:`height`]:t[u],G(p?a/m*d:a/100*m);if(s[c?`width`:`height`]=d+(f?o:i),h=i!==`rem`&&~n.indexOf(`adius`)||i===`em`&&t.appendChild&&!l?t:t.parentNode,_&&(h=(t.ownerSVGElement||{}).parentNode),(!h||h===Wr||!h.appendChild)&&(h=Wr.body),g=h._gsap,g&&p&&g.width&&c&&g.time===Hn.time&&!g.uncache)return G(a/g.width*d);if(p&&(n===`height`||n===`width`)){var v=t.style[n];t.style[n]=d+i,m=t[u],v?t.style[n]=v:Pi(t,n)}else(p||o===`%`)&&!Li[Ei(h,`display`)]&&(s.position=Ei(t,`position`)),h===t&&(s.position=`static`),h.appendChild(qr),m=qr[u],h.removeChild(qr),s.position=`absolute`;return c&&p&&(g=_t(h),g.time=Hn.time,g.width=h[u]),G(f?m*a/d:m&&a?d/m*a:0)},zi=function(e,t,n,r){var i;return Kr||ki(),t in ai&&t!==`transform`&&(t=ai[t],~t.indexOf(`,`)&&(t=t.split(`,`)[0])),Zr[t]&&t!==`transform`?(i=Zi(e,r),i=t===`transformOrigin`?i.svg?i.origin:Qi(Ei(e,yi))+` `+i.zOrigin+`px`:i[t]):(i=e.style[t],(!i||i===`auto`||r||~(i+``).indexOf(`calc(`))&&(i=Wi[t]&&Wi[t](e,t,n)||Ei(e,t)||vt(e,t)||+(t===`opacity`))),n&&!~(i+``).trim().indexOf(` `)?Ri(e,t,i,n)+n:i},Bi=function(e,t,n,r){if(!n||n===`none`){var i=Oi(t,e,1),a=i&&Ei(e,i,1);a&&a!==n?(t=i,n=a):t===`borderColor`&&(n=Ei(e,`borderTopColor`))}var o=new Q(this._pt,e.style,t,0,1,Cr),s=0,c=0,l,u,d,f,p,m,h,g,_,v,y,b;if(o.b=n,o.e=r,n+=``,r+=``,r.substring(0,6)===`var(--`&&(r=Ei(e,r.substring(4,r.indexOf(`)`)))),r===`auto`&&(m=e.style[t],e.style[t]=r,r=Ei(e,t)||r,m?e.style[t]=m:Pi(e,t)),l=[n,r],Bn(l),n=l[0],r=l[1],d=n.match(He)||[],b=r.match(He)||[],b.length){for(;u=He.exec(r);)h=u[0],_=r.substring(s,u.index),p?p=(p+1)%5:(_.substr(-5)===`rgba(`||_.substr(-5)===`hsla(`)&&(p=1),h!==(m=d[c++]||``)&&(f=parseFloat(m)||0,y=m.substr((f+``).length),h.charAt(1)===`=`&&(h=yt(f,h)+y),g=parseFloat(h),v=h.substr((g+``).length),s=He.lastIndex-v.length,v||(v=v||xe.units[t]||y,s===r.length&&(r+=v,o.e+=v)),y!==v&&(f=Ri(e,t,m,v)||0),o._pt={_next:o._pt,p:_||c===1?_:`,`,s:f,c:g-f,m:p&&p<4||t===`zIndex`?Math.round:0});o.c=s<r.length?r.substring(s,r.length):``}else o.r=t===`display`&&r===`none`?fi:di;return We.test(r)&&(o.e=0),this._pt=o,o},Vi={top:`0%`,bottom:`100%`,left:`0%`,right:`100%`,center:`50%`},Hi=function(e){var t=e.split(` `),n=t[0],r=t[1]||`50%`;return(n===`top`||n===`bottom`||r===`left`||r===`right`)&&(e=n,n=r,r=e),t[0]=Vi[n]||n,t[1]=Vi[r]||r,t.join(` `)},Ui=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var n=t.t,r=n.style,i=t.u,a=n._gsap,o,s,c;if(i===`all`||i===!0)r.cssText=``,s=1;else for(i=i.split(`,`),c=i.length;--c>-1;)o=i[c],Zr[o]&&(s=1,o=o===`transformOrigin`?yi:$),Pi(n,o);s&&(Pi(n,$),a&&(a.svg&&n.removeAttribute(`transform`),r.scale=r.rotate=r.translate=`none`,Zi(n,1),a.uncache=1,xi(r)))}},Wi={clearProps:function(e,t,n,r,i){if(i.data!==`isFromStart`){var a=e._pt=new Q(e._pt,t,n,0,0,Ui);return a.u=r,a.pr=-10,a.tween=i,e._props.push(n),1}}},Gi=[1,0,0,1,0,0],Ki={},qi=function(e){return e===`matrix(1, 0, 0, 1, 0, 0)`||e===`none`||!e},Ji=function(e){var t=Ei(e,$);return qi(t)?Gi:t.substr(7).match(Ve).map(G)},Yi=function(e,t){var n=e._gsap||_t(e),r=e.style,i=Ji(e),a,o,s,c;return n.svg&&e.getAttribute(`transform`)?(s=e.transform.baseVal.consolidate().matrix,i=[s.a,s.b,s.c,s.d,s.e,s.f],i.join(`,`)===`1,0,0,1,0,0`?Gi:i):(i===Gi&&!e.offsetParent&&e!==Gr&&!n.svg&&(s=r.display,r.display=`block`,a=e.parentNode,(!a||!e.offsetParent&&!e.getBoundingClientRect().width)&&(c=1,o=e.nextElementSibling,Gr.appendChild(e)),i=Ji(e),s?r.display=s:Pi(e,`display`),c&&(o?a.insertBefore(e,o):a?a.appendChild(e):Gr.removeChild(e))),t&&i.length>6?[i[0],i[1],i[4],i[5],i[12],i[13]]:i)},Xi=function(e,t,n,r,i,a){var o=e._gsap,s=i||Yi(e,!0),c=o.xOrigin||0,l=o.yOrigin||0,u=o.xOffset||0,d=o.yOffset||0,f=s[0],p=s[1],m=s[2],h=s[3],g=s[4],_=s[5],v=t.split(` `),y=parseFloat(v[0])||0,b=parseFloat(v[1])||0,x,S,C,w;n?s!==Gi&&(S=f*h-p*m)&&(C=h/S*y+b*(-m/S)+(m*_-h*g)/S,w=y*(-p/S)+f/S*b-(f*_-p*g)/S,y=C,b=w):(x=Mi(e),y=x.x+(~v[0].indexOf(`%`)?y/100*x.width:y),b=x.y+(~(v[1]||v[0]).indexOf(`%`)?b/100*x.height:b)),r||r!==!1&&o.smooth?(g=y-c,_=b-l,o.xOffset=u+(g*f+_*m)-g,o.yOffset=d+(g*p+_*h)-_):o.xOffset=o.yOffset=0,o.xOrigin=y,o.yOrigin=b,o.smooth=!!r,o.origin=t,o.originIsAbsolute=!!n,e.style[yi]=`0px 0px`,a&&(Fi(a,o,`xOrigin`,c,y),Fi(a,o,`yOrigin`,l,b),Fi(a,o,`xOffset`,u,o.xOffset),Fi(a,o,`yOffset`,d,o.yOffset)),e.setAttribute(`data-svg-origin`,y+` `+b)},Zi=function(e,t){var n=e._gsap||new tr(e);if(`x`in n&&!t&&!n.uncache)return n;var r=e.style,i=n.scaleX<0,a=`px`,o=`deg`,s=getComputedStyle(e),c=Ei(e,yi)||`0`,l=u=d=m=h=g=_=v=y=0,u,d,f=p=1,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,ee,te,ne,re,P,F,I;return n.svg=!!(e.getCTM&&Ni(e)),s.translate&&((s.translate!==`none`||s.scale!==`none`||s.rotate!==`none`)&&(r[$]=(s.translate===`none`?``:`translate3d(`+(s.translate+` 0 0`).split(` `).slice(0,3).join(`, `)+`) `)+(s.rotate===`none`?``:`rotate(`+s.rotate+`) `)+(s.scale===`none`?``:`scale(`+s.scale.split(` `).join(`,`)+`) `)+(s[$]===`none`?``:s[$])),r.scale=r.rotate=r.translate=`none`),S=Yi(e,n.svg),n.svg&&(n.uncache?(N=e.getBBox(),c=n.xOrigin-N.x+`px `+(n.yOrigin-N.y)+`px`,M=``):M=!t&&e.getAttribute(`data-svg-origin`),Xi(e,M||c,!!M||n.originIsAbsolute,n.smooth!==!1,S)),b=n.xOrigin||0,x=n.yOrigin||0,S!==Gi&&(E=S[0],D=S[1],O=S[2],k=S[3],l=A=S[4],u=j=S[5],S.length===6?(f=Math.sqrt(E*E+D*D),p=Math.sqrt(k*k+O*O),m=E||D?ei(D,E)*Qr:0,_=O||k?ei(O,k)*Qr+m:0,_&&(p*=Math.abs(Math.cos(_*$r))),n.svg&&(l-=b-(b*E+x*O),u-=x-(b*D+x*k))):(I=S[6],P=S[7],te=S[8],ne=S[9],re=S[10],F=S[11],l=S[12],u=S[13],d=S[14],C=ei(I,re),h=C*Qr,C&&(w=Math.cos(-C),T=Math.sin(-C),M=A*w+te*T,N=j*w+ne*T,ee=I*w+re*T,te=A*-T+te*w,ne=j*-T+ne*w,re=I*-T+re*w,F=P*-T+F*w,A=M,j=N,I=ee),C=ei(-O,re),g=C*Qr,C&&(w=Math.cos(-C),T=Math.sin(-C),M=E*w-te*T,N=D*w-ne*T,ee=O*w-re*T,F=k*T+F*w,E=M,D=N,O=ee),C=ei(D,E),m=C*Qr,C&&(w=Math.cos(C),T=Math.sin(C),M=E*w+D*T,N=A*w+j*T,D=D*w-E*T,j=j*w-A*T,E=M,A=N),h&&Math.abs(h)+Math.abs(m)>359.9&&(h=m=0,g=180-g),f=G(Math.sqrt(E*E+D*D+O*O)),p=G(Math.sqrt(j*j+I*I)),C=ei(A,j),_=Math.abs(C)>2e-4?C*Qr:0,y=F?1/(F<0?-F:F):0),n.svg&&(M=e.getAttribute(`transform`),n.forceCSS=e.setAttribute(`transform`,``)||!qi(Ei(e,$)),M&&e.setAttribute(`transform`,M))),Math.abs(_)>90&&Math.abs(_)<270&&(i?(f*=-1,_+=m<=0?180:-180,m+=m<=0?180:-180):(p*=-1,_+=_<=0?180:-180)),t||=n.uncache,n.x=l-((n.xPercent=l&&(!t&&n.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-l)?-50:0)))?e.offsetWidth*n.xPercent/100:0)+a,n.y=u-((n.yPercent=u&&(!t&&n.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-u)?-50:0)))?e.offsetHeight*n.yPercent/100:0)+a,n.z=d+a,n.scaleX=G(f),n.scaleY=G(p),n.rotation=G(m)+o,n.rotationX=G(h)+o,n.rotationY=G(g)+o,n.skewX=_+o,n.skewY=v+o,n.transformPerspective=y+a,(n.zOrigin=parseFloat(c.split(` `)[2])||!t&&n.zOrigin||0)&&(r[yi]=Qi(c)),n.xOffset=n.yOffset=0,n.force3D=xe.force3D,n.renderTransform=n.svg?aa:wi?ia:ea,n.uncache=0,n},Qi=function(e){return(e=e.split(` `))[0]+` `+e[1]},$i=function(e,t,n){var r=q(t);return G(parseFloat(t)+parseFloat(Ri(e,`x`,n+`px`,r)))+r},ea=function(e,t){t.z=`0px`,t.rotationY=t.rotationX=`0deg`,t.force3D=0,ia(e,t)},ta=`0deg`,na=`0px`,ra=`) `,ia=function(e,t){var n=t||this,r=n.xPercent,i=n.yPercent,a=n.x,o=n.y,s=n.z,c=n.rotation,l=n.rotationY,u=n.rotationX,d=n.skewX,f=n.skewY,p=n.scaleX,m=n.scaleY,h=n.transformPerspective,g=n.force3D,_=n.target,v=n.zOrigin,y=``,b=g===`auto`&&e&&e!==1||g===!0;if(v&&(u!==ta||l!==ta)){var x=parseFloat(l)*$r,S=Math.sin(x),C=Math.cos(x),w;x=parseFloat(u)*$r,w=Math.cos(x),a=$i(_,a,S*w*-v),o=$i(_,o,-Math.sin(x)*-v),s=$i(_,s,C*w*-v+v)}h!==na&&(y+=`perspective(`+h+ra),(r||i)&&(y+=`translate(`+r+`%, `+i+`%) `),(b||a!==na||o!==na||s!==na)&&(y+=s!==na||b?`translate3d(`+a+`, `+o+`, `+s+`) `:`translate(`+a+`, `+o+ra),c!==ta&&(y+=`rotate(`+c+ra),l!==ta&&(y+=`rotateY(`+l+ra),u!==ta&&(y+=`rotateX(`+u+ra),(d!==ta||f!==ta)&&(y+=`skew(`+d+`, `+f+ra),(p!==1||m!==1)&&(y+=`scale(`+p+`, `+m+ra),_.style[$]=y||`translate(0, 0)`},aa=function(e,t){var n=t||this,r=n.xPercent,i=n.yPercent,a=n.x,o=n.y,s=n.rotation,c=n.skewX,l=n.skewY,u=n.scaleX,d=n.scaleY,f=n.target,p=n.xOrigin,m=n.yOrigin,h=n.xOffset,g=n.yOffset,_=n.forceCSS,v=parseFloat(a),y=parseFloat(o),b,x,S,C,w;s=parseFloat(s),c=parseFloat(c),l=parseFloat(l),l&&(l=parseFloat(l),c+=l,s+=l),s||c?(s*=$r,c*=$r,b=Math.cos(s)*u,x=Math.sin(s)*u,S=Math.sin(s-c)*-d,C=Math.cos(s-c)*d,c&&(l*=$r,w=Math.tan(c-l),w=Math.sqrt(1+w*w),S*=w,C*=w,l&&(w=Math.tan(l),w=Math.sqrt(1+w*w),b*=w,x*=w)),b=G(b),x=G(x),S=G(S),C=G(C)):(b=u,C=d,x=S=0),(v&&!~(a+``).indexOf(`px`)||y&&!~(o+``).indexOf(`px`))&&(v=Ri(f,`x`,a,`px`),y=Ri(f,`y`,o,`px`)),(p||m||h||g)&&(v=G(v+p-(p*b+m*S)+h),y=G(y+m-(p*x+m*C)+g)),(r||i)&&(w=f.getBBox(),v=G(v+r/100*w.width),y=G(y+i/100*w.height)),w=`matrix(`+b+`,`+x+`,`+S+`,`+C+`,`+v+`,`+y+`)`,f.setAttribute(`transform`,w),_&&(f.style[$]=w)},oa=function(e,t,n,r,i){var a=360,o=B(i),s=parseFloat(i)*(o&&~i.indexOf(`rad`)?Qr:1)-r,c=r+s+`deg`,l,u;return o&&(l=i.split(`_`)[1],l===`short`&&(s%=a,s!==s%(a/2)&&(s+=s<0?a:-a)),l===`cw`&&s<0?s=(s+a*ti)%a-~~(s/a)*a:l===`ccw`&&s>0&&(s=(s-a*ti)%a-~~(s/a)*a)),e._pt=u=new Q(e._pt,t,n,r,s,si),u.e=c,u.u=`deg`,e._props.push(n),u},sa=function(e,t){for(var n in t)e[n]=t[n];return e},ca=function(e,t,n){var r=sa({},n._gsap),i=`perspective,force3D,transformOrigin,svgOrigin`,a=n.style,o,s,c,l,u,d,f,p;for(s in r.svg?(c=n.getAttribute(`transform`),n.setAttribute(`transform`,``),a[$]=t,o=Zi(n,1),Pi(n,$),n.setAttribute(`transform`,c)):(c=getComputedStyle(n)[$],a[$]=t,o=Zi(n,1),a[$]=c),Zr)c=r[s],l=o[s],c!==l&&i.indexOf(s)<0&&(f=q(c),p=q(l),u=f===p?parseFloat(c):Ri(n,s,c,p),d=parseFloat(l),e._pt=new Q(e._pt,o,s,u,d-u,oi),e._pt.u=p||0,e._props.push(s));sa(o,r)};W(`padding,margin,Width,Radius`,function(e,t){var n=`Top`,r=`Right`,i=`Bottom`,a=`Left`,o=(t<3?[n,r,i,a]:[n+a,n+r,i+r,i+a]).map(function(n){return t<2?e+n:`border`+n+e});Wi[t>1?`border`+e:e]=function(e,t,n,r,i){var a,s;if(arguments.length<4)return a=o.map(function(t){return zi(e,t,n)}),s=a.join(` `),s.split(a[0]).length===5?a[0]:s;a=(r+``).split(` `),s={},o.forEach(function(e,t){return s[e]=a[t]=a[t]||a[(t-1)/2|0]}),e.init(t,s,i)}});var la={name:`css`,register:ki,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,n,r,i){var a=this._props,o=e.style,s=n.vars.startAt,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;for(m in Kr||ki(),this.styles=this.styles||Ci(e),C=this.styles.props,this.tween=n,t)if(m!==`autoRound`&&(l=t[m],!(dt[m]&&or(m,t,n,r,e,i)))){if(f=typeof l,p=Wi[m],f===`function`&&(l=l.call(n,r,e,i),f=typeof l),f===`string`&&~l.indexOf(`random(`)&&(l=wn(l)),p)p(this,e,m,l,n)&&(S=1);else if(m.substr(0,2)===`--`)c=(getComputedStyle(e).getPropertyValue(m)+``).trim(),l+=``,Rn.lastIndex=0,Rn.test(c)||(h=q(c),g=q(l),g?h!==g&&(c=Ri(e,m,c,g)+g):h&&(l+=h)),this.add(o,`setProperty`,c,l,r,i,0,0,m),a.push(m),C.push(m,0,o[m]);else if(f!==`undefined`){if(s&&m in s?(c=typeof s[m]==`function`?s[m].call(n,r,e,i):s[m],B(c)&&~c.indexOf(`random(`)&&(c=wn(c)),q(c+``)||c===`auto`||(c+=xe.units[m]||q(zi(e,m))||``),(c+``).charAt(1)===`=`&&(c=zi(e,m))):c=zi(e,m),d=parseFloat(c),_=f===`string`&&l.charAt(1)===`=`&&l.substr(0,2),_&&(l=l.substr(2)),u=parseFloat(l),m in ai&&(m===`autoAlpha`&&(d===1&&zi(e,`visibility`)===`hidden`&&u&&(d=0),C.push(`visibility`,0,o.visibility),Fi(this,o,`visibility`,d?`inherit`:`hidden`,u?`inherit`:`hidden`,!u)),m!==`scale`&&m!==`transform`&&(m=ai[m],~m.indexOf(`,`)&&(m=m.split(`,`)[0]))),v=m in Zr,v){if(this.styles.save(m),w=l,f===`string`&&l.substring(0,6)===`var(--`){if(l=Ei(e,l.substring(4,l.indexOf(`)`))),l.substring(0,5)===`calc(`){var T=e.style.perspective;e.style.perspective=l,l=Ei(e,`perspective`),T?e.style.perspective=T:Pi(e,`perspective`)}u=parseFloat(l)}if(y||(b=e._gsap,b.renderTransform&&!t.parseTransform||Zi(e,t.parseTransform),x=t.smoothOrigin!==!1&&b.smooth,y=this._pt=new Q(this._pt,o,$,0,1,b.renderTransform,b,0,-1),y.dep=1),m===`scale`)this._pt=new Q(this._pt,b,`scaleY`,b.scaleY,(_?yt(b.scaleY,_+u):u)-b.scaleY||0,oi),this._pt.u=0,a.push(`scaleY`,m),m+=`X`;else if(m===`transformOrigin`){C.push(yi,0,o[yi]),l=Hi(l),b.svg?Xi(e,l,0,x,0,this):(g=parseFloat(l.split(` `)[2])||0,g!==b.zOrigin&&Fi(this,b,`zOrigin`,b.zOrigin,g),Fi(this,o,m,Qi(c),Qi(l)));continue}else if(m===`svgOrigin`){Xi(e,l,1,x,0,this);continue}else if(m in Ki){oa(this,b,m,d,_?yt(d,_+l):l);continue}else if(m===`smoothOrigin`){Fi(this,b,`smooth`,b.smooth,l);continue}else if(m===`force3D`){b[m]=l;continue}else if(m===`transform`){ca(this,l,e);continue}}else m in o||(m=Oi(m)||m);if(v||(u||u===0)&&(d||d===0)&&!ii.test(l)&&m in o)h=(c+``).substr((d+``).length),u||=0,g=q(l)||(m in xe.units?xe.units[m]:h),h!==g&&(d=Ri(e,m,c,g)),this._pt=new Q(this._pt,v?b:o,m,d,(_?yt(d,_+u):u)-d,!v&&(g===`px`||m===`zIndex`)&&t.autoRound!==!1?ui:oi),this._pt.u=g||0,v&&w!==l?(this._pt.b=c,this._pt.e=w,this._pt.r=li):h!==g&&g!==`%`&&(this._pt.b=c,this._pt.r=ci);else if(m in o)Bi.call(this,e,m,c,_?_+l:l);else if(m in e)this.add(e,m,c||e[m],_?_+l:l,r,i);else if(m!==`parseTransform`){et(m,l);continue}v||(m in o?C.push(m,0,o[m]):typeof e[m]==`function`?C.push(m,2,e[m]()):C.push(m,1,c||e[m])),a.push(m)}}S&&Or(this)},render:function(e,t){if(t.tween._time||!Yr())for(var n=t._pt;n;)n.r(e,n.d),n=n._next;else t.styles.revert()},get:zi,aliases:ai,getSetter:function(e,t,n){var r=ai[t];return r&&r.indexOf(`,`)<0&&(t=r),t in Zr&&t!==yi&&(e._gsap.x||zi(e,`x`))?n&&Jr===n?t===`scale`?gi:hi:(Jr=n||{})&&(t===`scale`?_i:vi):e.style&&!Me(e.style[t])?pi:~t.indexOf(`-`)?mi:br(e,t)},core:{_removeProperty:Pi,_getMatrix:Yi}};Hr.utils.checkPrefix=Oi,Hr.core.getStyleSaver=Ci,(function(e,t,n,r){var i=W(e+`,`+t+`,`+n,function(e){Zr[e]=1});W(t,function(e){xe.units[e]=`deg`,Ki[e]=1}),ai[i[13]]=e+`,`+t,W(r,function(e){var t=e.split(`:`);ai[t[1]]=i[t[0]]})})(`x,y,z,scale,scaleX,scaleY,xPercent,yPercent`,`rotation,rotationX,rotationY,skewX,skewY`,`transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective`,`0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY`),W(`x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective`,function(e){xe.units[e]=`px`}),Hr.registerPlugin(la);var ua=Hr.registerPlugin(la)||Hr;ua.core.Tween;async function da({claseId:n,fecha:r,indicadorId:i,indicadorNombre:s,breadcrumb:c=``,evaluadoPor:l,onSaved:u}={}){if(!n||!r||!i){e.error(`Faltan datos para abrir la calificación del indicador`);return}let d=document.createElement(`div`);d.className=`igm-backdrop`,d.innerHTML=`
    <div class="igm-modal" role="dialog" aria-modal="true" aria-label="Calificaciones">
      <div class="igm-header">
        <div>
          ${c?`<div class="igm-breadcrumb">${C(c)}</div>`:``}
          <h3>${C(s||`Indicador`)}</h3>
        </div>
        <button class="igm-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="igm-body">
        <div class="igm-loading"><div class="spinner-border spinner-border-sm"></div> Cargando…</div>
      </div>
      <div class="igm-footer">
        <button class="igm-btn igm-btn-primary" id="igm-completar" disabled>
          <i class="bi bi-check2-all"></i> Marcar como completamente evaluado
        </button>
      </div>
    </div>
  `,document.body.appendChild(d);let g=!1,_=()=>{d.remove(),g&&u?.()};d.querySelector(`.igm-close`).addEventListener(`click`,_),d.addEventListener(`click`,e=>{e.target===d&&_()});let v=d.querySelector(`.igm-body`),y=new Map,x=new Map;async function S(e){let[t,n]=await Promise.all([f(e),m(e)]);x.set(e,{logroIds:new Set(t.map(e=>e.id)),rachaActual:n?.racha_actual||0})}async function w(e,t){try{let[n,r]=await Promise.all([f(e),m(e)]),i=x.get(e)||{logroIds:new Set,rachaActual:0},a=n.filter(e=>!i.logroIds.has(e.id)),o=r?.racha_actual||0,s=o>i.rachaActual;return x.set(e,{logroIds:new Set(n.map(e=>e.id)),rachaActual:o}),a.length===0&&!s?null:{studentName:t,logrosNuevos:a,rachaActual:o,rachaSubio:s}}catch(e){return console.warn(`[IndicadorGradingModal] Error comprobando logros/racha:`,e),null}}async function T(e){let t=e.filter(Boolean).flatMap(e=>e.logrosNuevos||[])[0];if(!t)return;let{default:n}=await h(async()=>{let{default:e}=await import(`./InsigniaCelebrationOverlay-Bqb6K9i4.js`);return{default:e}},__vite__mapDeps([0,1,2,3]));await n(t)}async function E(e){let t=e.filter(Boolean);if(t.length===0)return;await T(t);let{createAchievementsSummaryModal:n}=await h(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-DrGzVr84.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([4,3]));await n(document.body,t)}async function D(e,t){await E([await w(e,t)])}function k(e,t){e.classList.toggle(`igm-star-filled`,t),ua.to(e,{color:t?`#f59e0b`:`#d1d5db`,duration:.25}),ua.fromTo(e,{scale:1},{scale:t?1.3:1,duration:.15,ease:`power1.out`,yoyo:!0,repeat:+!!t})}try{let[c,u,f,m]=await Promise.all([te(n),p(n,r),t(i,n),O(i)]);f.forEach(e=>y.set(e.alumno_id,e));let h=new Set(u.presentes),x=new Set(u.ausentes),T=Object.fromEntries(c.map(e=>[e.id,e]));if(await Promise.all([...h,...x].map(e=>S(e))),h.size===0&&x.size===0){v.innerHTML=`
        <div class="igm-empty">
          <i class="bi bi-clipboard-x"></i>
          <p>No hay asistencia registrada para el ${C(r)}.</p>
          <p class="igm-empty-sub">Pasa asistencia primero para poder calificar este indicador.</p>
        </div>
      `;return}let A={};if(m){let e=await Promise.all([...h].map(async e=>[e,await N(m.id,e,n)]));A=Object.fromEntries(e)}function j(e){let t=T[e];if(!t)return``;let n=y.get(e)||{},r=n.nota||0,i=m&&!A[e],a=!!n.review_flag;return`
        <div class="igm-alumno-row" data-alumno-id="${e}">
          <div class="igm-alumno-info">
            <span class="igm-alumno-nombre">${C(t.nombre)}</span>
            ${i?`<span class="igm-warn-badge" title="Prerrequisito no satisfecho"><i class="bi bi-exclamation-triangle-fill"></i> Requiere "${C(m.nombre)}"</span>`:``}
            ${a?`<span class="igm-review-badge" title="Recalificado el prerrequisito, revisa esta nota"><i class="bi bi-arrow-repeat"></i> Revisar</span>`:``}
          </div>
          <div class="igm-stars" data-alumno-id="${e}">
            ${[1,2,3,4,5].map(e=>`<button class="igm-star ${e<=r?`igm-star-filled`:``}" data-value="${e}" aria-label="${e} estrellas"><i class="bi bi-star-fill"></i></button>`).join(``)}
          </div>
        </div>
      `}function M(e){let t=T[e];if(!t)return``;let n=y.get(e)||{};if(n.recovery_status===`recuperado`||n.recovery_status===`no_recuperable`){let r=n.recovery_status===`recuperado`?`Recuperado`:`No recuperable`,i=n.recovery_status===`recuperado`?`igm-recuperado`:`igm-no-recuperable`;return`
          <div class="igm-alumno-row" data-alumno-id="${e}">
            <div class="igm-alumno-info">
              <span class="igm-alumno-nombre">${C(t.nombre)}</span>
            </div>
            <span class="igm-deuda-resuelta ${i}"><i class="bi bi-check-circle-fill"></i> ${r}</span>
          </div>
        `}return`
        <div class="igm-alumno-row igm-alumno-row-deuda" data-alumno-id="${e}">
          <div class="igm-alumno-info">
            <span class="igm-alumno-nombre">${C(t.nombre)}</span>
          </div>
          <button class="igm-btn-deuda" data-alumno-id="${e}">
            Con Deudas Académicas
          </button>
        </div>
        <div class="igm-recovery-form" data-alumno-id="${e}" hidden>
          <select class="igm-recovery-select" data-alumno-id="${e}">
            <option value="recuperado">Recuperado</option>
            <option value="no_recuperable">No Recuperable</option>
          </select>
          <textarea class="igm-recovery-notes" data-alumno-id="${e}" placeholder="Nota (opcional)"></textarea>
          <div class="igm-recovery-actions">
            <button class="igm-btn igm-btn-ghost igm-recovery-cancel" data-alumno-id="${e}">Cancelar</button>
            <button class="igm-btn igm-btn-primary igm-recovery-confirm" data-alumno-id="${e}">Registrar</button>
          </div>
        </div>
      `}v.innerHTML=`
      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-people-fill"></i> Presentes</h4>
        <div class="igm-alumno-list" id="igm-presentes">
          ${[...h].map(j).join(``)||`<p class="igm-empty-inline">Sin alumnos presentes</p>`}
        </div>
      </div>

      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-exclamation-circle-fill"></i> Con Deudas Académicas</h4>
        <div class="igm-alumno-list" id="igm-ausentes">
          ${[...x].map(M).join(``)||`<p class="igm-empty-inline">Nadie ausente esta sesión</p>`}
        </div>
      </div>

      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-chat-left-text-fill"></i> Observaciones</h4>
        <textarea class="igm-observaciones" id="igm-observaciones" placeholder="Escribe cómo fue la clase…" maxlength="1000"></textarea>
        <button class="igm-btn igm-btn-secondary igm-analizar" id="igm-analizar" disabled>
          <i class="bi bi-magic"></i> Analizar
        </button>
        <div class="igm-analisis-resultado" id="igm-analisis-resultado" hidden></div>
      </div>
    `;function ee(){let e=[...h].every(e=>(y.get(e)||{}).nota),t=[...x].every(e=>{let t=(y.get(e)||{}).recovery_status;return t===`recuperado`||t===`no_recuperable`}),n=d.querySelector(`#igm-completar`),r=e&&t;n.disabled=!r,n.classList.toggle(`igm-btn-success`,r),r&&(n.innerHTML=`<i class="bi bi-check2-all"></i> Indicador completamente evaluado`)}function ne(){v.querySelectorAll(`.igm-stars`).forEach(t=>{let r=t.dataset.alumnoId;t.querySelectorAll(`.igm-star`).forEach(a=>{a.addEventListener(`click`,async()=>{let s=Number(a.dataset.value);t.querySelectorAll(`.igm-star`).forEach(e=>{k(e,Number(e.dataset.value)<=s)});try{let e=await o({alumnoId:r,indicadorId:i,claseId:n,nota:s,evaluadoPor:l});y.set(r,{...y.get(r)||{},...e,nota:s}),g=!0,ee(),D(r,T[r]?.nombre)}catch(t){e.error(`No se pudo guardar: ${t.message}`)}})})})}function re(){v.querySelectorAll(`.igm-btn-deuda`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.alumnoId,n=v.querySelector(`.igm-recovery-form[data-alumno-id="${t}"]`);n&&(n.hidden=!n.hidden)})}),v.querySelectorAll(`.igm-recovery-cancel`).forEach(e=>{e.addEventListener(`click`,()=>{let t=v.querySelector(`.igm-recovery-form[data-alumno-id="${e.dataset.alumnoId}"]`);t&&(t.hidden=!0)})}),v.querySelectorAll(`.igm-recovery-confirm`).forEach(t=>{t.addEventListener(`click`,async()=>{let r=t.dataset.alumnoId,o=v.querySelector(`.igm-recovery-select[data-alumno-id="${r}"]`),s=v.querySelector(`.igm-recovery-notes[data-alumno-id="${r}"]`),c=o.value,u=s.value.trim();t.disabled=!0;try{let t=await a(r,i,n,c,u,null,l);y.set(r,{...y.get(r)||{},...t,recovery_status:c}),g=!0;let o=v.querySelector(`.igm-alumno-row-deuda[data-alumno-id="${r}"]`),s=v.querySelector(`.igm-recovery-form[data-alumno-id="${r}"]`);o&&(o.outerHTML=M(r)),s&&s.remove(),e.success(`Recuperación registrada`),ee(),D(r,T[r]?.nombre)}catch(n){e.error(`No se pudo registrar la recuperación: ${n.message}`),t.disabled=!1}})})}function P(){let t=v.querySelector(`#igm-observaciones`),r=v.querySelector(`#igm-analizar`),a=v.querySelector(`#igm-analisis-resultado`);t.addEventListener(`input`,()=>{r.disabled=!t.value.trim()}),r.addEventListener(`click`,async()=>{let c=t.value.trim();if(c){r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Analizando…`;try{let t=await b(c,{indicadorNombre:s,estudiantesPresentes:[...h].map(e=>T[e]?.nombre).filter(Boolean)});if(a.hidden=!1,a.innerHTML=`
            <div class="igm-panorama"><i class="bi bi-lightbulb-fill"></i> ${C(t.panorama)}</div>
            ${t.sugerirCalificarConEstrellas?`
              <div class="igm-sugerencia-estrellas">
                <p>El texto no trae una valoración clara. ¿Cómo calificarías el resultado de la clase para los presentes?</p>
                <div class="igm-stars igm-stars-grupal" id="igm-stars-grupal">
                  ${[1,2,3,4,5].map(e=>`<button class="igm-star" data-value="${e}" aria-label="${e} estrellas"><i class="bi bi-star-fill"></i></button>`).join(``)}
                </div>
                <p class="igm-sugerencia-nota">Se aplicará solo a los ${h.size} alumnos presentes. Los ausentes seguirán "Con Deuda Académica".</p>
              </div>
            `:``}
          `,t.sugerirCalificarConEstrellas){let t=a.querySelectorAll(`#igm-stars-grupal .igm-star`);t.forEach(r=>{r.addEventListener(`click`,async()=>{let a=Number(r.dataset.value);t.forEach(e=>k(e,Number(e.dataset.value)<=a));try{let t=await Promise.all([...h].map(async e=>{let t=await o({alumnoId:e,indicadorId:i,claseId:n,nota:a,evaluadoPor:l});y.set(e,{...y.get(e)||{},...t,nota:a});let r=v.querySelector(`.igm-stars[data-alumno-id="${e}"]`);return r&&r.querySelectorAll(`.igm-star`).forEach(e=>{k(e,Number(e.dataset.value)<=a)}),w(e,T[e]?.nombre)}));g=!0,e.success(`Calificación grupal aplicada a ${h.size} presentes`),ee(),E(t)}catch(t){e.error(`No se pudo aplicar la calificación grupal: ${t.message}`)}})})}}catch(t){e.error(`No se pudo analizar: ${t.message}`)}finally{r.disabled=!1,r.innerHTML=`<i class="bi bi-magic"></i> Analizar`}}})}ne(),re(),P(),ee(),d.querySelector(`#igm-completar`).addEventListener(`click`,()=>{e.success(`Indicador marcado como completamente evaluado`),g=!0,_()})}catch(e){console.error(`[IndicadorGradingModal] error:`,e),v.innerHTML=`<p class="igm-empty-inline" style="color:var(--pm-danger,#ef4444)">Error al cargar: ${C(e.message)}</p>`}}if(!document.getElementById(`igm-styles`)){let e=document.createElement(`style`);e.id=`igm-styles`,e.textContent=`
    .igm-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9500; padding: 1rem;
    }
    .igm-modal {
      background: var(--pm-surface, #fff);
      border-radius: 16px; width: min(640px, 100%); max-height: 90vh;
      display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    }
    .igm-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--pm-border, #e5e7eb);
    }
    .igm-header h3 { margin: 0.15rem 0 0; font-size: 1.05rem; font-weight: 700; }
    .igm-breadcrumb { font-size: 0.75rem; color: var(--pm-text-muted); font-weight: 600; }
    .igm-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--pm-text-muted); }
    .igm-body { padding: 1rem 1.25rem; overflow-y: auto; flex: 1; }
    .igm-footer { padding: 0.85rem 1.25rem; border-top: 1px solid var(--pm-border, #e5e7eb); }
    .igm-loading { display: flex; align-items: center; gap: 0.5rem; justify-content: center; padding: 2rem 0; color: var(--pm-text-muted); }
    .igm-empty { text-align: center; padding: 2rem 1rem; color: var(--pm-text-muted); }
    .igm-empty i { font-size: 2rem; margin-bottom: 0.5rem; display: block; }
    .igm-empty-sub { font-size: 0.82rem; }
    .igm-empty-inline { color: var(--pm-text-muted); font-size: 0.85rem; padding: 0.5rem 0; }

    .igm-section { margin-bottom: 1.25rem; }
    .igm-section-title {
      font-size: 0.85rem; font-weight: 700; margin: 0 0 0.5rem;
      display: flex; align-items: center; gap: 0.4rem; color: var(--pm-text);
    }
    .igm-alumno-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .igm-alumno-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.5rem; padding: 0.5rem 0.65rem; border: 1px solid var(--pm-border, #e5e7eb);
      border-radius: 10px; background: var(--pm-surface-2, #fafafa); flex-wrap: wrap;
    }
    .igm-alumno-info { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .igm-alumno-nombre { font-size: 0.86rem; font-weight: 600; }
    .igm-warn-badge, .igm-review-badge {
      font-size: 0.68rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 6px;
    }
    .igm-warn-badge { background: rgba(245,158,11,0.12); color: #d97706; }
    .igm-review-badge { background: rgba(139,92,246,0.12); color: #7c3aed; }

    .igm-stars { display: flex; gap: 0.15rem; }
    .igm-star { background: none; border: none; cursor: pointer; color: #d1d5db; font-size: 1.1rem; padding: 0.1rem; }
    .igm-star-filled { color: #f59e0b; }

    .igm-btn-deuda {
      background: rgba(239,68,68,0.08); color: var(--pm-danger, #ef4444);
      border: 1px solid rgba(239,68,68,0.25); border-radius: 8px;
      padding: 0.35rem 0.6rem; font-size: 0.78rem; font-weight: 700; cursor: pointer;
    }
    .igm-deuda-resuelta { font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; gap: 0.3rem; }
    .igm-recuperado { color: #059669; }
    .igm-no-recuperable { color: var(--pm-text-muted); }

    .igm-recovery-form {
      display: flex; flex-direction: column; gap: 0.4rem;
      padding: 0.6rem; margin: -0.2rem 0 0.4rem; border: 1px dashed var(--pm-border, #d1d5db);
      border-radius: 10px; background: var(--pm-surface, #fff);
    }
    .igm-recovery-select, .igm-recovery-notes {
      width: 100%; padding: 0.4rem 0.55rem; border-radius: 8px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.82rem;
    }
    .igm-recovery-notes { min-height: 50px; resize: vertical; }
    .igm-recovery-actions { display: flex; justify-content: flex-end; gap: 0.4rem; }

    .igm-observaciones {
      width: 100%; min-height: 80px; padding: 0.55rem 0.7rem; border-radius: 10px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.85rem; resize: vertical; margin-bottom: 0.5rem;
    }

    .igm-btn {
      border-radius: 8px; padding: 0.45rem 0.8rem; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 0.35rem;
    }
    .igm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .igm-btn-primary { background: var(--pm-primary, #3b82f6); color: #fff; width: 100%; justify-content: center; }
    .igm-btn-success { background: #059669 !important; }
    .igm-btn-secondary { background: var(--pm-surface-2, #f3f4f6); color: var(--pm-text, #111827); border-color: var(--pm-border, #d1d5db); }
    .igm-btn-ghost { background: none; color: var(--pm-text-muted); }

    .igm-analisis-resultado {
      margin-top: 0.6rem; padding: 0.7rem 0.8rem; border-radius: 10px;
      background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.18);
    }
    .igm-panorama { font-size: 0.84rem; display: flex; gap: 0.4rem; align-items: flex-start; color: var(--pm-text); }
    .igm-panorama i { color: #f59e0b; flex-shrink: 0; margin-top: 0.1rem; }
    .igm-sugerencia-estrellas { margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px dashed rgba(59,130,246,0.25); }
    .igm-sugerencia-estrellas p { font-size: 0.8rem; margin: 0 0 0.4rem; color: var(--pm-text); }
    .igm-stars-grupal { display: flex; gap: 0.25rem; }
    .igm-stars-grupal .igm-star { font-size: 1.4rem; }
    .igm-sugerencia-nota { font-size: 0.72rem !important; color: var(--pm-text-muted) !important; margin-top: 0.35rem !important; }
  `,document.head.appendChild(e)}function fa(e){let[t,n]=(e||`00:00`).split(`:`).map(Number);return t*60+n}function pa(e,t,n){let r=fa(e),i=fa(t);return n>=r&&n<i?`en-curso`:n>=i?`pasada`:r-n<=15?`proxima`:`futura`}function ma(t,n,r){let i=document.createElement(`div`);i.id=`pm-hoy-autonav-banner`,i.innerHTML=`
    <div class="pm-autonav-content">
      <i class="bi bi-play-circle-fill pm-autonav-icon"></i>
      <span class="pm-autonav-msg">Abriendo clase en curso…</span>
      <span class="pm-autonav-count" id="pm-autonav-count">3</span>
      <button class="pm-autonav-cancel" id="pm-autonav-cancel">Cancelar</button>
    </div>
  `,document.body.appendChild(i);let a=3,o=!1,s=document.getElementById(`pm-autonav-count`),c=setInterval(()=>{o||(a--,s&&(s.textContent=a),a<=0&&(clearInterval(c),i.remove(),o||(window.router?window.router.navigate(`asistencia?clase=${t}&fecha=${n}`):r?.(t))))},1e3);document.getElementById(`pm-autonav-cancel`)?.addEventListener(`click`,()=>{o=!0,clearInterval(c),i.remove(),e.show(`Auto-navegación cancelada`,`info`)})}async function ha(e,{onClaseClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let a=_();if(!a){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let o=new Date,s=o.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),c=`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,`0`)}-${String(o.getDate()).padStart(2,`0`)}`;try{let f=await l(a.id,c);if(f&&f.length>0){e.innerHTML=va(f,s,o),ba(e,c,a.id);return}let p=await n();if(!p||p.length===0){e.innerHTML=`
        <div class="pm-hoy-empty-state">
          <div class="pm-hoy-empty-card">
            <div class="pm-hoy-empty-icon"><i class="bi bi-lightning-charge-fill"></i></div>
            <h2 class="pm-hoy-empty-title">No tienes clases registradas hoy</h2>
            <p class="pm-hoy-empty-text">Si vas a impartir una clase especial o de reemplazo, puedes crearla aquí mismo.</p>
            <button class="pm-btn pm-btn-primary pm-hoy-emergente-btn" id="btn-clase-emergente">
              <i class="bi bi-plus-circle me-1"></i> Clase emergente
            </button>
          </div>
        </div>
      `,xa(e,c,a.id,[]);return}let m=p.map(e=>e.id),h=Object.fromEntries(p.map(e=>[e.id,e])),g=await ee(a.id).catch(()=>[]),_=Object.fromEntries((g||[]).map(e=>[String(e.group_id),e])),v=(await d(m)).filter(e=>e.dia?.toLowerCase()===s).sort((e,t)=>e.hora_inicio.localeCompare(t.hora_inicio));if(!v||v.length===0){e.innerHTML=`
        <div style="padding: 1rem 1rem 2rem;">
          <h2 class="pm-date-header">${T(s)} ${S(o)}</h2>
          <div class="pm-hoy-empty-state">
            <div class="pm-hoy-empty-card">
              <div class="pm-hoy-empty-icon"><i class="bi bi-lightning-charge-fill"></i></div>
              <h2 class="pm-hoy-empty-title">No tienes clases programadas hoy</h2>
              <p class="pm-hoy-empty-text">Si vas a dar una clase especial, abre la clase emergente desde aquí.</p>
              <button class="pm-btn pm-btn-primary pm-hoy-emergente-btn" id="btn-clase-emergente">
                <i class="bi bi-plus-circle me-1"></i> Clase emergente
              </button>
            </div>
          </div>
        </div>
      `,xa(e,c,a.id,p);return}let y=new Date(o);y.setDate(y.getDate()-3);let b=`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,`0`)}-${String(y.getDate()).padStart(2,`0`)}`,E=new Date(o);E.setDate(E.getDate()-1);let D=`${E.getFullYear()}-${String(E.getMonth()+1).padStart(2,`0`)}-${String(E.getDate()).padStart(2,`0`)}`,O=(await i(a.id,b,D)||[]).filter(e=>{if(!m.includes(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),k=(await i(a.id,c,c)).filter(e=>m.includes(e.clase_id)).filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return t||e.borrador===!1&&n}),A=new Set(k.map(e=>e.clase_id)),j=await u(m),M={};for(let e of j||[])e.clase_id&&(M[e.clase_id]=(M[e.clase_id]||0)+1);let N=[...new Set(v.map(e=>e.salon_id).filter(Boolean))],te=N.length>0?await r(N):[],ne=Object.fromEntries(te.map(e=>[e.id,e.nombre])),P=o.getHours()*60+o.getMinutes(),F=null,I=null,ie=v.map(e=>{let t=h[e.clase_id],n=A.has(t.id),r=M[t.id]||0,i=pa(e.hora_inicio,e.hora_fin,P),a=_[String(t.id)]||null;i===`en-curso`&&(!n&&!F&&(F=t.id),n&&!I&&(I=t.id));let o=n?`<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`:`<span class="pm-badge pm-badge-danger">Sin registrar</span>`,s=i===`en-curso`?`<span class="pm-badge pm-badge-en-curso"><i class="bi bi-circle-fill pm-pulse-dot me-1"></i>En curso</span>`:i===`proxima`?`<span class="pm-badge pm-badge-proxima"><i class="bi bi-clock me-1"></i>Próximamente</span>`:``;return`
        <div class="pm-clase-card ${[n?`registrada`:`sin-registrar`,i===`en-curso`?`pm-clase-en-curso`:``,i===`proxima`?`pm-clase-proxima`:``,i===`pasada`?`pm-clase-pasada`:``].filter(Boolean).join(` `)}" data-clase-id="${t.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="pm-clase-nombre">${C(t.nombre)}</div>
            <div class="d-flex flex-wrap gap-1 justify-content-end align-items-start">
              ${s}
              ${o}
              <button class="pm-analisis-btn" data-clase-id="${t.id}" title="Analizar" aria-label="Analizar clase">
                <i class="bi bi-graph-up"></i>
              </button>
              <button class="pm-mapa-btn" data-clase-id="${t.id}" title="Mapa de rutas" aria-label="Mapa de rutas de la clase">
                <i class="bi bi-signpost-2-fill"></i>
              </button>
            </div>
          </div>
          <div class="pm-clase-meta">
            <div class="meta-item"><i class="bi bi-clock"></i> ${w(e.hora_inicio)} – ${w(e.hora_fin)}</div>
            <div class="meta-item"><i class="bi bi-music-note-beamed"></i> ${C(t.instrumento||`—`)}</div>
            <div class="meta-item"><i class="bi bi-people"></i> ${r} alumnos</div>
            ${e.salon_id?`<div class="meta-item"><i class="bi bi-geo-alt"></i> ${C(ne[e.salon_id]||`Salón`)}</div>`:``}
          </div>
          ${a?`<div class="pm-badge pm-badge-info mt-2"><i class="bi bi-diagram-3 me-1"></i>ACM Semana ${a.current_week||1}</div>`:``}
        </div>
      `}).join(``),ae=O.length>0?`
      <div class="pm-pendientes-banner">
        <div class="pm-pendientes-header">
          <i class="bi bi-clipboard-x-fill"></i>
          <span>${O.length===1?`1 clase sin registrar de los últimos días`:`${O.length} clases sin registrar de los últimos días`}</span>
        </div>
        <div class="pm-pendientes-list">
          ${O.map(e=>{let t=h[e.clase_id];if(!t)return``;let n=e.fecha?e.fecha.split(`-`).reverse().slice(0,2).join(`/`):`—`;return`
              <button class="pm-pendiente-item" data-clase-id="${t.id}" data-fecha="${e.fecha}">
                <div class="pm-pendiente-info">
                  <span class="pm-pendiente-nombre">${C(t.nombre)}</span>
                  <span class="pm-pendiente-fecha">${n}</span>
                </div>
                <span class="pm-pendiente-cta">Registrar <i class="bi bi-arrow-right"></i></span>
              </button>`}).join(``)}
        </div>
      </div>`:``;e.innerHTML=`
      <div style="padding: 1rem 1rem 2rem;">
        <h2 class="pm-date-header">${T(s)} ${S(o)}</h2>
        ${ae}
        <div class="pm-clases-container">
          ${ie}
        </div>
      </div>
    `,e.querySelectorAll(`.pm-pendiente-item`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.claseId,n=e.dataset.fecha;try{await x.createSnapshotFromPlan(t,n,a.id)}catch{}window.router&&window.router.navigate(`asistencia?clase=${t}&fecha=${n}`)})}),e.querySelectorAll(`.pm-clase-card`).forEach(e=>{let n=e.querySelector(`.pm-analisis-btn`);n?n.addEventListener(`click`,e=>{e.stopPropagation(),e.preventDefault();let t=n.dataset.claseId;console.log(`[HoyView] Abriendo análisis para clase:`,t),re(t,c)}):console.warn(`[HoyView] No se encontró botón de análisis en card`);let r=e.querySelector(`.pm-mapa-btn`);r&&r.addEventListener(`click`,e=>{e.stopPropagation(),e.preventDefault();let t=r.dataset.claseId;ga(t,a,c)}),e.addEventListener(`click`,async()=>{if(e.classList.contains(`pm-card-loading`))return;e.classList.add(`pm-card-loading`);let n=e.dataset.claseId;try{await x.createSnapshotFromPlan(n,c,a.id)}catch(e){console.error(`Error generando snapshot:`,e)}e.classList.remove(`pm-card-loading`),t?.(n)})});let oe=F||I;oe&&(requestAnimationFrame(()=>{let t=e.querySelector(`[data-clase-id="${oe}"]`);t&&typeof t.scrollIntoView==`function`&&t.scrollIntoView({behavior:`smooth`,block:`center`})}),F&&setTimeout(()=>{ma(F,c,t)},800))}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${C(t.message)}</p>`}}async function ga(e,t,n){let r=await c(t.id,e,!0);if(!r||r.length===0){he(t.id,e,()=>{ga(e,t,n)});return}let i=r[0];await _a(i,e,t,n)}async function _a(e,t,n,r){let i=await s(e.id,t),a=Object.fromEntries((i||[]).map(e=>[e.indicador_id,e.check_state])),o=document.createElement(`div`);o.className=`pmr-backdrop`;function c(e){return e===`double`?`<i class="bi bi-check2-all pmr-check-double" title="Doble check: todos evaluados"></i>`:e===`single`?`<i class="bi bi-check2 pmr-check-single" title="Check simple: hay deudas pendientes"></i>`:`<span class="pmr-check-none" title="Sin dictar todavía"></span>`}let l=(e.unidades||[]).map(e=>`
    <div class="pmr-unidad">
      <div class="pmr-unidad-title">${C(e.nombre)}</div>
      ${(e.objetivos||[]).map(t=>`
        <div class="pmr-objetivo">
          <div class="pmr-objetivo-title">${C(t.nombre)}</div>
          <div class="pmr-indicadores">
            ${(t.indicadores||[]).map(n=>`
              <button class="pmr-indicador" data-indicador-id="${n.id}" data-indicador-nombre="${C(n.nombre)}" data-breadcrumb="${C(e.nombre)} &gt; ${C(t.nombre)}">
                ${c(a[n.id])}
                <span>${C(n.nombre)}</span>
              </button>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    </div>
  `).join(``);o.innerHTML=`
    <div class="pmr-modal" role="dialog" aria-modal="true">
      <div class="pmr-header">
        <h3><i class="bi bi-signpost-2-fill"></i> ${C(e.nombre)}</h3>
        <div class="pmr-header-actions">
          <button class="pmr-editar-btn" title="Editar ruta"><i class="bi bi-pencil-square"></i></button>
          <button class="pmr-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
      <div class="pmr-body">
        ${l||`<p class="pmr-empty">Esta ruta todavía no tiene unidades.</p>`}
      </div>
    </div>
  `,document.body.appendChild(o);let u=()=>o.remove();o.querySelector(`.pmr-close`).addEventListener(`click`,u),o.addEventListener(`click`,e=>{e.target===o&&u()}),o.querySelector(`.pmr-editar-btn`).addEventListener(`click`,()=>{u(),he(n.id,t,()=>{ga(t,n,r)})}),o.querySelectorAll(`.pmr-indicador`).forEach(i=>{i.addEventListener(`click`,async()=>{u(),await da({claseId:t,fecha:r,indicadorId:i.dataset.indicadorId,indicadorNombre:i.dataset.indicadorNombre,breadcrumb:i.dataset.breadcrumb,evaluadoPor:n.user_id,onSaved:()=>_a(e,t,n,r)})})})}if(!document.getElementById(`pmr-styles`)){let e=document.createElement(`style`);e.id=`pmr-styles`,e.textContent=`
    .pmr-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9400; padding: 1rem;
    }
    .pmr-modal {
      background: var(--pm-surface, #fff); border-radius: 16px;
      width: min(560px, 100%); max-height: 85vh; display: flex; flex-direction: column;
      box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    }
    .pmr-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.15rem; border-bottom: 1px solid var(--pm-border, #e5e7eb);
    }
    .pmr-header h3 { margin: 0; font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; }
    .pmr-header-actions { display: flex; gap: 0.4rem; }
    .pmr-editar-btn, .pmr-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--pm-text-muted); }
    .pmr-body { padding: 1rem 1.15rem; overflow-y: auto; flex: 1; }
    .pmr-empty { color: var(--pm-text-muted); font-size: 0.85rem; text-align: center; padding: 1.5rem 0; }
    .pmr-unidad { margin-bottom: 1rem; }
    .pmr-unidad-title { font-size: 0.85rem; font-weight: 700; color: var(--pm-primary, #3b82f6); margin-bottom: 0.4rem; }
    .pmr-objetivo { margin: 0.4rem 0 0.4rem 0.6rem; }
    .pmr-objetivo-title { font-size: 0.78rem; font-weight: 600; color: var(--pm-text-muted); margin-bottom: 0.3rem; }
    .pmr-indicadores { display: flex; flex-direction: column; gap: 0.3rem; margin-left: 0.6rem; }
    .pmr-indicador {
      display: flex; align-items: center; gap: 0.5rem; text-align: left;
      padding: 0.4rem 0.6rem; border-radius: 8px; border: 1px solid var(--pm-border, #e5e7eb);
      background: var(--pm-surface-2, #fafafa); cursor: pointer; font-size: 0.82rem; color: var(--pm-text);
    }
    .pmr-indicador:hover { border-color: var(--pm-primary, #3b82f6); background: rgba(59,130,246,0.05); }
    .pmr-check-double { color: #3b82f6; }
    .pmr-check-single { color: #9ca3af; }
    .pmr-check-none { display: inline-block; width: 1em; }

    .pm-mapa-btn {
      background: transparent; border: 2px solid var(--pm-border, #d1d5db); border-radius: 8px;
      padding: 0.5rem 0.7rem; min-width: 32px; height: 32px; font-size: 1rem;
      color: var(--pm-text-muted, #6b7280); cursor: pointer; transition: all 0.2s ease;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 10;
    }
    .pm-mapa-btn:hover {
      background: var(--pm-primary, #3b82f6); color: white; border-color: var(--pm-primary, #3b82f6);
      transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  `,document.head.appendChild(e)}function va(e,t,n){let r=e.map(e=>{let t=`${e.hora_inicio?e.hora_inicio.slice(0,5):`—`} – ${e.hora_fin?e.hora_fin.slice(0,5):`—`}`,n=e.motivo||``,r=e.contenido||e.observaciones||``,i=ya(e.motivo);return`
      <div class="pm-clase-card pm-emergente-card" data-eme-id="${e.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="pm-clase-nombre">${C(e.nombre_clase)}</div>
          <span class="pm-badge pm-badge-warning">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>Emergente
          </span>
        </div>
        ${n?`<div class="pm-eme-motivo ${i}">${C(n)}</div>`:``}
        <div class="pm-clase-meta">
          <div class="meta-item"><i class="bi bi-clock"></i> ${t}</div>
          ${r?`<div class="meta-item"><i class="bi bi-chat-text"></i> ${C(r)}</div>`:``}
        </div>
      </div>
    `}).join(``);return`
    <div style="padding: 1rem 1rem 2rem;">
      <h2 class="pm-date-header">${T(t)} ${S(n)}</h2>
      <p class="pm-eme-subtitle">
        <i class="bi bi-exclamation-triangle-fill"></i>
        Clase emergente registrada — reemplaza tus clases programadas de hoy
      </p>
      <div class="pm-clases-container">
        ${r}
      </div>
    </div>
  `}function ya(e){return{suplencia:`pm-eme-motivo-suplencia`,eventual:`pm-eme-motivo-eventual`,reforzamiento:`pm-eme-motivo-reforzamiento`,otro:`pm-eme-motivo-otro`}[e]||`pm-eme-motivo-otro`}function ba(e,t,n){e.querySelectorAll(`.pm-emergente-card`).forEach(e=>{e.addEventListener(`click`,()=>{e.classList.contains(`pm-card-loading`)||(e.classList.add(`pm-card-loading`),window.router&&window.router.navigate(`clase-emergente?fecha=${t}`),e.classList.remove(`pm-card-loading`))})})}function xa(t,n,r,i){t.querySelector(`#btn-clase-emergente`)?.addEventListener(`click`,async()=>{let t=[];try{let e=(i||[]).map(e=>e.id);if(e.length>0){let n=await u(e),r={};n.forEach(e=>{if(!e.alumnos)return;r[e.alumno_id]||(r[e.alumno_id]=[]);let t=i.find(t=>t.id===e.clase_id);t&&r[e.alumno_id].push(t.nombre)});let a=new Set;t=n.map(e=>e.alumnos).filter(Boolean).filter(e=>a.has(e.id)?!1:(a.add(e.id),!0)).map(e=>({...e,clase_nombres:r[e.id]||[]}))}}catch(e){console.warn(`[HoyView] No se pudieron cargar alumnos para clase emergente:`,e)}ne({fecha:n,clases:i||[],alumnos:t,maestroId:r,onSave:async t=>{let{data:n,error:r}=await g.from(`sesiones_clase`).insert([t]).select().single();if(r)throw r;e.success(`Clase emergente creada. Procedé a pasar asistencia.`),window.location.hash=`#/asistencia?sesion=${n.id}&fecha=${t.fecha}`}})})}if(!document.getElementById(`pm-hoy-pendientes-styles`)){let e=document.createElement(`style`);if(e.id=`pm-hoy-pendientes-styles`,!document.getElementById(`pm-badge-warning-style`)){let e=document.createElement(`style`);e.id=`pm-badge-warning-style`,e.textContent=`
        .pm-badge-warning {
          background: rgba(245,158,11,0.15);
          color: #d97706;
          border: 1px solid rgba(245,158,11,0.3);
        }
      `,document.head.appendChild(e)}e.textContent=`
    .pm-pendientes-banner {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }
    .pm-pendientes-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--pm-danger, #ef4444);
      margin-bottom: 0.6rem;
    }
    .pm-pendientes-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .pm-pendiente-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface);
      border: 1px solid rgba(239,68,68,0.15);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: background 0.15s, border-color 0.15s;
      gap: 0.5rem;
    }
    .pm-pendiente-item:hover {
      background: rgba(239,68,68,0.06);
      border-color: rgba(239,68,68,0.35);
    }
    .pm-pendiente-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .pm-pendiente-nombre {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text);
    }
    .pm-pendiente-fecha {
      font-size: 0.72rem;
      color: var(--pm-text-muted);
    }
    .pm-pendiente-cta {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pm-danger, #ef4444);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* ── Emergente card ──────────────────────────── */
    .pm-emergente-card {
      border: 2px solid rgba(245,158,11,0.4) !important;
      background: linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%) !important;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .pm-emergente-card:hover {
      border-color: rgba(245,158,11,0.7) !important;
      box-shadow: 0 2px 12px rgba(245,158,11,0.15);
    }
    .pm-eme-subtitle {
      font-size: 0.82rem;
      color: #d97706;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .pm-eme-motivo {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      display: inline-block;
    }
    .pm-eme-motivo-suplencia     { background: rgba(59,130,246,0.1); color: #2563eb; }
    .pm-eme-motivo-eventual      { background: rgba(139,92,246,0.1); color: #7c3aed; }
    .pm-eme-motivo-reforzamiento { background: rgba(16,185,129,0.1); color: #059669; }
    .pm-eme-motivo-otro          { background: rgba(245,158,11,0.1); color: #d97706; }

    /* ── Botón de análisis ──────────────────────────── */
    .pm-analisis-btn {
      background: transparent;
      border: 2px solid var(--pm-border, #d1d5db);
      border-radius: 8px;
      padding: 0.5rem 0.7rem;
      min-width: 32px;
      height: 32px;
      font-size: 1rem;
      color: var(--pm-text-muted, #6b7280);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 10;
      flex-shrink: 0;
      pointer-events: auto !important;
    }
    .pm-analisis-btn:hover {
      background: var(--pm-primary, #3b82f6);
      color: white;
      border-color: var(--pm-primary, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .pm-analisis-btn:active {
      transform: scale(0.95);
    }
    .pm-analisis-btn:focus {
      outline: 2px solid var(--pm-primary, #3b82f6);
      outline-offset: 2px;
    }

    /* ── Estado temporal de clases ──────────────────── */
    .pm-clase-en-curso {
      border: 2px solid var(--pm-primary, #3b82f6) !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
      position: relative;
    }
    .pm-clase-proxima {
      border-left: 3px solid var(--pm-warning, #f59e0b) !important;
    }
    .pm-clase-pasada {
      opacity: 0.55;
    }

    /* Badge en curso */
    .pm-badge-en-curso {
      background: rgba(59,130,246,0.15);
      color: var(--pm-primary, #3b82f6);
      border: 1px solid rgba(59,130,246,0.35);
    }
    .pm-badge-proxima {
      background: rgba(245,158,11,0.12);
      color: #d97706;
      border: 1px solid rgba(245,158,11,0.3);
    }

    /* Punto pulsante dentro del badge "En curso" */
    .pm-pulse-dot {
      font-size: 0.5rem;
      animation: pm-pulse 1.2s ease-in-out infinite;
    }
    @keyframes pm-pulse {
      0%, 100% { opacity: 1; transform: scale(1);   }
      50%       { opacity: 0.4; transform: scale(0.75); }
    }

    /* ── Banner de auto-navegación ──────────────────── */
    #pm-hoy-autonav-banner {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-primary, #3b82f6);
      border-radius: 16px;
      padding: 0.75rem 1.25rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      z-index: 9000;
      animation: pm-slide-up 0.3s ease;
      min-width: 280px;
      max-width: 90vw;
    }
    @keyframes pm-slide-up {
      from { opacity: 0; transform: translateX(-50%) translateY(16px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .pm-autonav-content {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .pm-autonav-icon {
      font-size: 1.2rem;
      color: var(--pm-primary, #3b82f6);
      flex-shrink: 0;
    }
    .pm-autonav-msg {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text);
    }
    .pm-autonav-count {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--pm-primary, #3b82f6);
      min-width: 1.2rem;
      text-align: center;
    }
    .pm-autonav-cancel {
      background: none;
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pm-text-muted);
      cursor: pointer;
      flex-shrink: 0;
    }
    .pm-autonav-cancel:hover {
      background: var(--pm-surface-2);
      color: var(--pm-text);
    }

    .pm-hoy-empty-state {
      min-height: 55vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .pm-hoy-empty-card {
      width: min(100%, 560px);
      text-align: center;
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 24px;
      padding: 2rem 1.5rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    }
    .pm-hoy-empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      background: rgba(245,158,11,0.12);
      color: var(--pm-warning, #f59e0b);
      font-size: 2rem;
    }
    .pm-hoy-empty-title {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--pm-text);
    }
    .pm-hoy-empty-text {
      margin: 0 auto 1.25rem;
      max-width: 42ch;
      color: var(--pm-text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .pm-hoy-emergente-btn {
      min-width: 220px;
      padding: 0.85rem 1.25rem;
      border-radius: 999px;
      box-shadow: 0 12px 30px rgba(59,130,246,0.22);
    }
  `,document.head.appendChild(e)}export{ha as renderHoyView};