const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AchievementsSummaryModal-DrGzVr84.js","assets/portalUtils-CkF82Yyk.js"])))=>i.map(i=>d[i]);
import{i as e}from"./AppModal-Du6jXNYA.js";import{a as t,c as n,d as r,f as i,g as a,h as o,i as s,l as c,n as l,o as u,r as d,s as f,t as p,u as m}from"./pwaInstaller-CABasb_l.js";import{a as h,i as g}from"./supabase-Cgh_dhNB.js";import{i as _}from"./maestroAuth-BMzDPnai.js";import{r as v,t as y}from"./jspdf.plugin.autotable-DPzO4huE.js";import{t as b}from"./groqService-BEo2aU8D.js";import{t as x}from"./academicService-CHV7olLE.js";import{a as S,i as C,o as w,r as T}from"./portalUtils-CkF82Yyk.js";import{a as E,c as D,i as O,l as k,n as A,o as j,r as M,t as N}from"./maestroRouteService-C-CCRznf.js";import{u as P}from"./weeklyPlanAdapter-E65PNMYx.js";import{t as F}from"./catalogService-M5LBxZnn.js";import{t as I}from"./claseEmergenteModal-DzBloOSJ.js";import{t as L}from"./claseAnalysisModal-D4_bAre7.js";var R={azul:[20,60,130],azulClaro:[220,232,250],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248]},z=215.9,B=279.4,V=14;function H(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function U(e,t=`—`){return String(e??``).trim()||t}function W(e,t=``){e.setFillColor(...R.azul),e.rect(0,0,z,32,`F`),e.setFillColor(...R.dorado),e.rect(0,32,z,2.5,`F`),e.setFillColor(...R.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...R.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,16,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Tocamos Corazones, Cambiamos Vidas · Punta Cana`,16,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...R.dorado),e.text(`RUTA PERSONAL DEL MAESTRO`,z-V,13,{align:`right`}),t&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(t,z-V,20,{align:`right`})),e.setTextColor(...R.grisOscuro)}function G(e,t){e.setFillColor(...R.azul),e.rect(0,B-8,z,8,`F`),e.setFillColor(...R.dorado),e.rect(0,B-8,4,8,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...R.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,16,B-4.5),e.text(`Pág. ${t}`,z-V,B-4.5,{align:`right`})}function ee(e,t){return`ruta-maestro-${String(e||`ruta`).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}-${t}.pdf`}function te(e=[],t=new Map){return e.map(e=>({unidadNombre:e.nombre,objetivos:(e.objetivos||[]).map(e=>({nombre:e.nombre,indicadores:(e.indicadores||[]).map(e=>{let n=t.get(e.id);return{nombre:e.nombre,nota:n?.promedio??null,evaluados:n?.evaluados??0}})}))}))}function ne({claseNombre:e,maestroNombre:t=``,unidades:n=[]}){let r=new v({unit:`mm`,format:`letter`}),i=H(),a=ee(e,new Date().toISOString().slice(0,10));if(W(r,`Generado: ${i}`),r.setFillColor(...R.azulClaro),r.roundedRect(V,42,z-V*2,18,2,2,`F`),r.setFont(`helvetica`,`bold`),r.setFontSize(13),r.setTextColor(...R.azul),r.text(U(e),18,49),r.setFont(`helvetica`,`normal`),r.setFontSize(8),r.setTextColor(...R.grisMedio),r.text(`Maestro: ${U(t)}  ·  Generado: ${i}`,18,56),n.length===0){r.setFont(`helvetica`,`italic`),r.setFontSize(9),r.setTextColor(...R.grisMedio),r.text(`Esta ruta todavía no tiene unidades.`,V,66),G(r,1),r.save(a);return}let o=[];n.forEach((e,t)=>{(e.objetivos||[]).forEach((n,r)=>{let i=`${t+1}.${r+1}`,a=n.indicadores||[];if(a.length===0){o.push([r===0?e.unidadNombre:``,i,U(n.nombre),`(sin indicadores)`,`—`]);return}a.forEach((t,a)=>{let s=t.nota==null?`—`:`${t.nota.toFixed(1)} (n=${t.evaluados})`;o.push([r===0&&a===0?e.unidadNombre:``,a===0?i:``,a===0?U(n.nombre):``,U(t.nombre),s])})})}),y(r,{startY:66,margin:{top:44,left:V,right:V},theme:`grid`,head:[[`Unidad`,`#`,`Objetivo`,`Indicador`,`Nota promedio`]],headStyles:{fillColor:R.azul,textColor:R.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`,valign:`top`},alternateRowStyles:{fillColor:R.grisClaro},columnStyles:{0:{cellWidth:24,fontStyle:`bold`},1:{cellWidth:10},2:{cellWidth:38},3:{cellWidth:78},4:{cellWidth:24,textColor:[217,119,6]}},body:o,didDrawPage:t=>{W(r,`${e}`),G(r,t.pageNumber)}}),G(r,1),r.save(a)}var K=0;function q(e=`tmp`){return K+=1,`${e}-${Date.now()}-${K}`}function J({maestroId:t,claseId:r,route:i=null,onSaved:a}={}){if(!t||!r){e.error(`Falta identificar al maestro o la clase`);return}let o={routeId:i?.id||null,nombre:i?.nombre||``,unidades:re(i?.unidades||[])},s=document.createElement(`div`);s.className=`trb-backdrop`,s.innerHTML=`
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
    `}function S(){l.querySelectorAll(`[data-role="toggle-unidad"]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=o.unidades[+e.dataset.ui]._localId;d.has(n)?d.delete(n):d.add(n),h()})}),l.querySelectorAll(`[data-role="toggle-objetivo"]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let{ui:n,oi:r}=e.dataset,i=o.unidades[+n].objetivos[+r]._localId;f.has(i)?f.delete(i):f.add(i),h()})}),l.querySelectorAll(`[data-role="unidad-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{o.unidades[+e.dataset.ui].nombre=e.value}),e.addEventListener(`click`,e=>e.stopPropagation())}),l.querySelectorAll(`[data-role="unidad-descripcion"]`).forEach(e=>{e.addEventListener(`input`,()=>{o.unidades[+e.dataset.ui].descripcion=e.value})}),l.querySelectorAll(`[data-role="objetivo-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{o.unidades[+e.dataset.ui].objetivos[+e.dataset.oi].nombre=e.value}),e.addEventListener(`click`,e=>e.stopPropagation())}),l.querySelectorAll(`[data-role="indicador-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;o.unidades[+t].objetivos[+n].indicadores[+r].nombre=e.value,h()})}),l.querySelectorAll(`[data-role="prereq-toggle"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset,i=o.unidades[+t].objetivos[+n].indicadores[+r]._localId;p=p===i?null:i,h()})}),l.querySelectorAll(`[data-role="prereq-pick"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r,value:i}=e.dataset;o.unidades[+t].objetivos[+n].indicadores[+r].prerequisito_local_id=i||null,p=null,h()})}),l.querySelectorAll(`[data-role="prereq-clear"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;o.unidades[+t].objetivos[+n].indicadores[+r].prerequisito_local_id=null,p=null,h()})}),l.querySelectorAll(`[data-role="add-objetivo"]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=w();o.unidades[+e.dataset.ui].objetivos.push(t),f.add(t._localId),h()})}),l.querySelectorAll(`[data-role="add-indicador"]`).forEach(e=>{e.addEventListener(`click`,()=>{o.unidades[+e.dataset.ui].objetivos[+e.dataset.oi].indicadores.push(T()),h()})}),l.querySelectorAll(`.trb-remove-unidad`).forEach(e=>{e.addEventListener(`click`,()=>{o.unidades.splice(+e.dataset.ui,1),h()})}),l.querySelectorAll(`.trb-remove-objetivo`).forEach(e=>{e.addEventListener(`click`,()=>{o.unidades[+e.dataset.ui].objetivos.splice(+e.dataset.oi,1),h()})}),l.querySelectorAll(`.trb-remove-indicador`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;o.unidades[+t].objetivos[+n].indicadores.splice(+r,1),h()})})}function w(){return{_localId:q(`obj`),nombre:``,indicadores:[]}}function T(){return{_localId:q(`ind`),nombre:``,prerequisito_local_id:null}}function O(e){return{_localId:q(`uni`),nombre:e?.nombre||``,descripcion:``,objetivos:(e?.objetivos||[]).map(e=>({_localId:q(`obj`),nombre:e.nombre||``,indicadores:(e.indicadores||[]).map(e=>({_localId:q(`ind`),nombre:e.nombre||``,prerequisito_local_id:null}))}))}}s.querySelector(`#trb-add-unidad`).addEventListener(`click`,()=>{let e={_localId:q(`uni`),nombre:``,descripcion:``,objetivos:[]};o.unidades.push(e),d.add(e._localId),h()}),s.querySelector(`#trb-btn-ia-unidad`).addEventListener(`click`,async()=>{let t=s.querySelector(`#trb-btn-ia-unidad`);t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Generando…`;try{let t=O(await D({instrumento:(await n()||[]).find(e=>e.id===r)?.instrumento||`Música`,unidadesExistentes:o.unidades}));o.unidades.push(t),d.add(t._localId),h(),e.success(`Unidad sugerida por IA agregada — revísala antes de guardar`)}catch(t){console.error(`[TeacherRouteBuilder] Error sugiriendo unidad con IA:`,t),e.error(`No se pudo generar la sugerencia con IA`)}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-stars"></i> Sugerir unidad con IA`}}),s.querySelector(`#trb-nombre`).addEventListener(`input`,e=>{o.nombre=e.target.value}),s.querySelector(`#trb-btn-clonar`).addEventListener(`click`,async()=>{if(!o.routeId)return;let t=(await n()||[]).filter(e=>e.id!==r);if(t.length===0){e.error(`No tienes otra clase disponible para clonar esta ruta`);return}let i=await ae(t);if(!i)return;let s=window.prompt(`Nombre para la ruta clonada:`,`Copia de ${o.nombre}`);if(s)try{let t=await A(o.routeId,s,i);e.success(`Ruta clonada correctamente`),c(),a?.(t)}catch(t){let n=t.message?.includes(`duplicate key`)||t.message?.includes(`23505`);e.error(n?`Esa clase ya tiene una ruta propia — no se puede clonar encima`:`No se pudo clonar la ruta: ${t.message}`)}}),s.querySelector(`#trb-btn-exportar-pdf`).addEventListener(`click`,async()=>{if(!o.routeId)return;let t=s.querySelector(`#trb-btn-exportar-pdf`);t.disabled=!0;try{let e=[];o.unidades.forEach(t=>t.objetivos.forEach(t=>t.indicadores.forEach(t=>{t.id&&e.push(t.id)})));let[t,i]=await Promise.all([n(),E(e,r)]),a=(t||[]).find(e=>e.id===r),s=_(),c=te(o.unidades,i);ne({claseNombre:a?.nombre||`Clase`,maestroNombre:s?.nombre_completo||``,unidades:c})}catch(t){console.error(`[TeacherRouteBuilder] Error exportando PDF:`,t),e.error(`No se pudo generar el PDF de la ruta.`)}finally{t.disabled=!1}}),s.querySelector(`#trb-guardar`).addEventListener(`click`,async()=>{if(!o.nombre.trim()){e.error(`Ponle un nombre a la ruta antes de guardar`);return}if(o.unidades.length===0){e.error(`Agrega al menos una unidad`);return}if(o.unidades.some(e=>!e.nombre.trim()||e.objetivos.length===0)){e.error(`Cada unidad necesita nombre y al menos un objetivo`);return}let n=ie(o.unidades),i=s.querySelector(`#trb-guardar`);i.disabled=!0,i.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Guardando…`;try{let i=o.routeId?await k(o.routeId,n):await M(t,r,o.nombre.trim(),n);e.success(`Ruta guardada`),c(),a?.(i)}catch(t){e.error(`No se pudo guardar la ruta: ${t.message}`),i.disabled=!1,i.innerHTML=`<i class="bi bi-check2"></i> Guardar ruta`}}),h()}async function Y(e,t,n){let r=await j(e,t);if(!r||r.length===0){J({maestroId:e,claseId:t,onSaved:n});return}let i=document.createElement(`div`);i.className=`trb-backdrop`,i.innerHTML=`
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
  `,document.body.appendChild(i);let a=()=>i.remove();i.querySelector(`.trb-close`).addEventListener(`click`,a),i.addEventListener(`click`,e=>{e.target===i&&a()}),i.querySelector(`#trb-nueva-ruta`).addEventListener(`click`,()=>{a(),J({maestroId:e,claseId:t,onSaved:n})}),i.querySelectorAll(`.trb-route-item`).forEach(i=>{i.addEventListener(`click`,()=>{let o=r.find(e=>e.id===i.dataset.routeId);a(),J({maestroId:e,claseId:t,route:o,onSaved:n})})})}function re(e){let t=new Map,n=e.map(e=>({...e,_localId:q(`uni`),objetivos:(e.objetivos||[]).map(e=>({...e,_localId:q(`obj`),indicadores:(e.indicadores||[]).map(e=>{let n=q(`ind`);return t.set(e.id,n),{...e,_localId:n}})}))}));return n.forEach(e=>e.objetivos.forEach(e=>e.indicadores.forEach(e=>{e.prerequisito_local_id=e.prerequisito_indicador_id&&t.get(e.prerequisito_indicador_id)||null}))),n}function ie(e){return e.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),descripcion:e.descripcion?.trim()||null,objetivos:e.objetivos.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),indicadores:e.indicadores.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),prerequisito_indicador_id:e.prerequisito_local_id||null}))}))}))}function ae(e){return new Promise(t=>{let n=document.createElement(`div`);n.className=`trb-backdrop`,n.innerHTML=`
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
  `,document.head.appendChild(e)}async function oe({claseId:n,fecha:r,indicadorId:i,indicadorNombre:s,breadcrumb:c=``,evaluadoPor:l,onSaved:u}={}){if(!n||!r||!i){e.error(`Faltan datos para abrir la calificación del indicador`);return}let d=document.createElement(`div`);d.className=`igm-backdrop`,d.innerHTML=`
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
  `,document.body.appendChild(d);let g=!1,_=()=>{d.remove(),g&&u?.()};d.querySelector(`.igm-close`).addEventListener(`click`,_),d.addEventListener(`click`,e=>{e.target===d&&_()});let v=d.querySelector(`.igm-body`),y=new Map,x=new Map;async function S(e){let[t,n]=await Promise.all([f(e),m(e)]);x.set(e,{logroIds:new Set(t.map(e=>e.id)),rachaActual:n?.racha_actual||0})}async function w(e,t){try{let[n,r]=await Promise.all([f(e),m(e)]),i=x.get(e)||{logroIds:new Set,rachaActual:0},a=n.filter(e=>!i.logroIds.has(e.id)),o=r?.racha_actual||0,s=o>i.rachaActual;return x.set(e,{logroIds:new Set(n.map(e=>e.id)),rachaActual:o}),a.length===0&&!s?null:{studentName:t,logrosNuevos:a,rachaActual:o,rachaSubio:s}}catch(e){return console.warn(`[IndicadorGradingModal] Error comprobando logros/racha:`,e),null}}async function T(e){let t=e.filter(Boolean);if(t.length===0)return;let{createAchievementsSummaryModal:n}=await h(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-DrGzVr84.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([0,1]));await n(document.body,t)}async function E(e,t){await T([await w(e,t)])}try{let[c,u,f,m]=await Promise.all([F(n),p(n,r),t(i,n),O(i)]);f.forEach(e=>y.set(e.alumno_id,e));let h=new Set(u.presentes),x=new Set(u.ausentes),D=Object.fromEntries(c.map(e=>[e.id,e]));if(await Promise.all([...h,...x].map(e=>S(e))),h.size===0&&x.size===0){v.innerHTML=`
        <div class="igm-empty">
          <i class="bi bi-clipboard-x"></i>
          <p>No hay asistencia registrada para el ${C(r)}.</p>
          <p class="igm-empty-sub">Pasa asistencia primero para poder calificar este indicador.</p>
        </div>
      `;return}let k={};if(m){let e=await Promise.all([...h].map(async e=>[e,await N(m.id,e,n)]));k=Object.fromEntries(e)}function A(e){let t=D[e];if(!t)return``;let n=y.get(e)||{},r=n.nota||0,i=m&&!k[e],a=!!n.review_flag;return`
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
      `}function j(e){let t=D[e];if(!t)return``;let n=y.get(e)||{};if(n.recovery_status===`recuperado`||n.recovery_status===`no_recuperable`){let r=n.recovery_status===`recuperado`?`Recuperado`:`No recuperable`,i=n.recovery_status===`recuperado`?`igm-recuperado`:`igm-no-recuperable`;return`
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
          ${[...h].map(A).join(``)||`<p class="igm-empty-inline">Sin alumnos presentes</p>`}
        </div>
      </div>

      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-exclamation-circle-fill"></i> Con Deudas Académicas</h4>
        <div class="igm-alumno-list" id="igm-ausentes">
          ${[...x].map(j).join(``)||`<p class="igm-empty-inline">Nadie ausente esta sesión</p>`}
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
    `;function M(){let e=[...h].every(e=>(y.get(e)||{}).nota),t=[...x].every(e=>{let t=(y.get(e)||{}).recovery_status;return t===`recuperado`||t===`no_recuperable`}),n=d.querySelector(`#igm-completar`),r=e&&t;n.disabled=!r,n.classList.toggle(`igm-btn-success`,r),r&&(n.innerHTML=`<i class="bi bi-check2-all"></i> Indicador completamente evaluado`)}function P(){v.querySelectorAll(`.igm-stars`).forEach(t=>{let r=t.dataset.alumnoId;t.querySelectorAll(`.igm-star`).forEach(a=>{a.addEventListener(`click`,async()=>{let s=Number(a.dataset.value);t.querySelectorAll(`.igm-star`).forEach(e=>{e.classList.toggle(`igm-star-filled`,Number(e.dataset.value)<=s)});try{let e=await o({alumnoId:r,indicadorId:i,claseId:n,nota:s,evaluadoPor:l});y.set(r,{...y.get(r)||{},...e,nota:s}),g=!0,M(),E(r,D[r]?.nombre)}catch(t){e.error(`No se pudo guardar: ${t.message}`)}})})})}function I(){v.querySelectorAll(`.igm-btn-deuda`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.alumnoId,n=v.querySelector(`.igm-recovery-form[data-alumno-id="${t}"]`);n&&(n.hidden=!n.hidden)})}),v.querySelectorAll(`.igm-recovery-cancel`).forEach(e=>{e.addEventListener(`click`,()=>{let t=v.querySelector(`.igm-recovery-form[data-alumno-id="${e.dataset.alumnoId}"]`);t&&(t.hidden=!0)})}),v.querySelectorAll(`.igm-recovery-confirm`).forEach(t=>{t.addEventListener(`click`,async()=>{let r=t.dataset.alumnoId,o=v.querySelector(`.igm-recovery-select[data-alumno-id="${r}"]`),s=v.querySelector(`.igm-recovery-notes[data-alumno-id="${r}"]`),c=o.value,u=s.value.trim();t.disabled=!0;try{let t=await a(r,i,n,c,u,null,l);y.set(r,{...y.get(r)||{},...t,recovery_status:c}),g=!0;let o=v.querySelector(`.igm-alumno-row-deuda[data-alumno-id="${r}"]`),s=v.querySelector(`.igm-recovery-form[data-alumno-id="${r}"]`);o&&(o.outerHTML=j(r)),s&&s.remove(),e.success(`Recuperación registrada`),M(),E(r,D[r]?.nombre)}catch(n){e.error(`No se pudo registrar la recuperación: ${n.message}`),t.disabled=!1}})})}function L(){let t=v.querySelector(`#igm-observaciones`),r=v.querySelector(`#igm-analizar`),a=v.querySelector(`#igm-analisis-resultado`);t.addEventListener(`input`,()=>{r.disabled=!t.value.trim()}),r.addEventListener(`click`,async()=>{let c=t.value.trim();if(c){r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Analizando…`;try{let t=await b(c,{indicadorNombre:s,estudiantesPresentes:[...h].map(e=>D[e]?.nombre).filter(Boolean)});if(a.hidden=!1,a.innerHTML=`
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
          `,t.sugerirCalificarConEstrellas){let t=a.querySelectorAll(`#igm-stars-grupal .igm-star`);t.forEach(r=>{r.addEventListener(`click`,async()=>{let a=Number(r.dataset.value);t.forEach(e=>e.classList.toggle(`igm-star-filled`,Number(e.dataset.value)<=a));try{let t=await Promise.all([...h].map(async e=>{let t=await o({alumnoId:e,indicadorId:i,claseId:n,nota:a,evaluadoPor:l});y.set(e,{...y.get(e)||{},...t,nota:a});let r=v.querySelector(`.igm-stars[data-alumno-id="${e}"]`);return r&&r.querySelectorAll(`.igm-star`).forEach(e=>{e.classList.toggle(`igm-star-filled`,Number(e.dataset.value)<=a)}),w(e,D[e]?.nombre)}));g=!0,e.success(`Calificación grupal aplicada a ${h.size} presentes`),M(),T(t)}catch(t){e.error(`No se pudo aplicar la calificación grupal: ${t.message}`)}})})}}catch(t){e.error(`No se pudo analizar: ${t.message}`)}finally{r.disabled=!1,r.innerHTML=`<i class="bi bi-magic"></i> Analizar`}}})}P(),I(),L(),M(),d.querySelector(`#igm-completar`).addEventListener(`click`,()=>{e.success(`Indicador marcado como completamente evaluado`),g=!0,_()})}catch(e){console.error(`[IndicadorGradingModal] error:`,e),v.innerHTML=`<p class="igm-empty-inline" style="color:var(--pm-danger,#ef4444)">Error al cargar: ${C(e.message)}</p>`}}if(!document.getElementById(`igm-styles`)){let e=document.createElement(`style`);e.id=`igm-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function X(e){let[t,n]=(e||`00:00`).split(`:`).map(Number);return t*60+n}function se(e,t,n){let r=X(e),i=X(t);return n>=r&&n<i?`en-curso`:n>=i?`pasada`:r-n<=15?`proxima`:`futura`}function ce(t,n,r){let i=document.createElement(`div`);i.id=`pm-hoy-autonav-banner`,i.innerHTML=`
    <div class="pm-autonav-content">
      <i class="bi bi-play-circle-fill pm-autonav-icon"></i>
      <span class="pm-autonav-msg">Abriendo clase en curso…</span>
      <span class="pm-autonav-count" id="pm-autonav-count">3</span>
      <button class="pm-autonav-cancel" id="pm-autonav-cancel">Cancelar</button>
    </div>
  `,document.body.appendChild(i);let a=3,o=!1,s=document.getElementById(`pm-autonav-count`),c=setInterval(()=>{o||(a--,s&&(s.textContent=a),a<=0&&(clearInterval(c),i.remove(),o||(window.router?window.router.navigate(`asistencia?clase=${t}&fecha=${n}`):r?.(t))))},1e3);document.getElementById(`pm-autonav-cancel`)?.addEventListener(`click`,()=>{o=!0,clearInterval(c),i.remove(),e.show(`Auto-navegación cancelada`,`info`)})}async function le(e,{onClaseClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let a=_();if(!a){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let o=new Date,s=o.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),c=`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,`0`)}-${String(o.getDate()).padStart(2,`0`)}`;try{let f=await l(a.id,c);if(f&&f.length>0){e.innerHTML=ue(f,s,o),fe(e,c,a.id);return}let p=await n();if(!p||p.length===0){e.innerHTML=`
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
      `,$(e,c,a.id,[]);return}let m=p.map(e=>e.id),h=Object.fromEntries(p.map(e=>[e.id,e])),g=await P(a.id).catch(()=>[]),_=Object.fromEntries((g||[]).map(e=>[String(e.group_id),e])),v=(await d(m)).filter(e=>e.dia?.toLowerCase()===s).sort((e,t)=>e.hora_inicio.localeCompare(t.hora_inicio));if(!v||v.length===0){e.innerHTML=`
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
      `,$(e,c,a.id,p);return}let y=new Date(o);y.setDate(y.getDate()-3);let b=`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,`0`)}-${String(y.getDate()).padStart(2,`0`)}`,E=new Date(o);E.setDate(E.getDate()-1);let D=`${E.getFullYear()}-${String(E.getMonth()+1).padStart(2,`0`)}-${String(E.getDate()).padStart(2,`0`)}`,O=(await i(a.id,b,D)||[]).filter(e=>{if(!m.includes(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),k=(await i(a.id,c,c)).filter(e=>m.includes(e.clase_id)).filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return t||e.borrador===!1&&n}),A=new Set(k.map(e=>e.clase_id)),j=await u(m),M={};for(let e of j||[])e.clase_id&&(M[e.clase_id]=(M[e.clase_id]||0)+1);let N=[...new Set(v.map(e=>e.salon_id).filter(Boolean))],F=N.length>0?await r(N):[],I=Object.fromEntries(F.map(e=>[e.id,e.nombre])),R=o.getHours()*60+o.getMinutes(),z=null,B=null,V=v.map(e=>{let t=h[e.clase_id],n=A.has(t.id),r=M[t.id]||0,i=se(e.hora_inicio,e.hora_fin,R),a=_[String(t.id)]||null;i===`en-curso`&&(!n&&!z&&(z=t.id),n&&!B&&(B=t.id));let o=n?`<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`:`<span class="pm-badge pm-badge-danger">Sin registrar</span>`,s=i===`en-curso`?`<span class="pm-badge pm-badge-en-curso"><i class="bi bi-circle-fill pm-pulse-dot me-1"></i>En curso</span>`:i===`proxima`?`<span class="pm-badge pm-badge-proxima"><i class="bi bi-clock me-1"></i>Próximamente</span>`:``;return`
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
            ${e.salon_id?`<div class="meta-item"><i class="bi bi-geo-alt"></i> ${C(I[e.salon_id]||`Salón`)}</div>`:``}
          </div>
          ${a?`<div class="pm-badge pm-badge-info mt-2"><i class="bi bi-diagram-3 me-1"></i>ACM Semana ${a.current_week||1}</div>`:``}
        </div>
      `}).join(``),H=O.length>0?`
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
        ${H}
        <div class="pm-clases-container">
          ${V}
        </div>
      </div>
    `,e.querySelectorAll(`.pm-pendiente-item`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.claseId,n=e.dataset.fecha;try{await x.createSnapshotFromPlan(t,n,a.id)}catch{}window.router&&window.router.navigate(`asistencia?clase=${t}&fecha=${n}`)})}),e.querySelectorAll(`.pm-clase-card`).forEach(e=>{let n=e.querySelector(`.pm-analisis-btn`);n?n.addEventListener(`click`,e=>{e.stopPropagation(),e.preventDefault();let t=n.dataset.claseId;console.log(`[HoyView] Abriendo análisis para clase:`,t),L(t,c)}):console.warn(`[HoyView] No se encontró botón de análisis en card`);let r=e.querySelector(`.pm-mapa-btn`);r&&r.addEventListener(`click`,e=>{e.stopPropagation(),e.preventDefault();let t=r.dataset.claseId;Z(t,a,c)}),e.addEventListener(`click`,async()=>{if(e.classList.contains(`pm-card-loading`))return;e.classList.add(`pm-card-loading`);let n=e.dataset.claseId;try{await x.createSnapshotFromPlan(n,c,a.id)}catch(e){console.error(`Error generando snapshot:`,e)}e.classList.remove(`pm-card-loading`),t?.(n)})});let U=z||B;U&&(requestAnimationFrame(()=>{let t=e.querySelector(`[data-clase-id="${U}"]`);t&&typeof t.scrollIntoView==`function`&&t.scrollIntoView({behavior:`smooth`,block:`center`})}),z&&setTimeout(()=>{ce(z,c,t)},800))}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${C(t.message)}</p>`}}async function Z(e,t,n){let r=await c(t.id,e,!0);if(!r||r.length===0){Y(t.id,e,()=>{Z(e,t,n)});return}let i=r[0];await Q(i,e,t,n)}async function Q(e,t,n,r){let i=await s(e.id,t),a=Object.fromEntries((i||[]).map(e=>[e.indicador_id,e.check_state])),o=document.createElement(`div`);o.className=`pmr-backdrop`;function c(e){return e===`double`?`<i class="bi bi-check2-all pmr-check-double" title="Doble check: todos evaluados"></i>`:e===`single`?`<i class="bi bi-check2 pmr-check-single" title="Check simple: hay deudas pendientes"></i>`:`<span class="pmr-check-none" title="Sin dictar todavía"></span>`}let l=(e.unidades||[]).map(e=>`
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
  `,document.body.appendChild(o);let u=()=>o.remove();o.querySelector(`.pmr-close`).addEventListener(`click`,u),o.addEventListener(`click`,e=>{e.target===o&&u()}),o.querySelector(`.pmr-editar-btn`).addEventListener(`click`,()=>{u(),Y(n.id,t,()=>{Z(t,n,r)})}),o.querySelectorAll(`.pmr-indicador`).forEach(i=>{i.addEventListener(`click`,async()=>{u(),await oe({claseId:t,fecha:r,indicadorId:i.dataset.indicadorId,indicadorNombre:i.dataset.indicadorNombre,breadcrumb:i.dataset.breadcrumb,evaluadoPor:n.user_id,onSaved:()=>Q(e,t,n,r)})})})}if(!document.getElementById(`pmr-styles`)){let e=document.createElement(`style`);e.id=`pmr-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function ue(e,t,n){let r=e.map(e=>{let t=`${e.hora_inicio?e.hora_inicio.slice(0,5):`—`} – ${e.hora_fin?e.hora_fin.slice(0,5):`—`}`,n=e.motivo||``,r=e.contenido||e.observaciones||``,i=de(e.motivo);return`
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
  `}function de(e){return{suplencia:`pm-eme-motivo-suplencia`,eventual:`pm-eme-motivo-eventual`,reforzamiento:`pm-eme-motivo-reforzamiento`,otro:`pm-eme-motivo-otro`}[e]||`pm-eme-motivo-otro`}function fe(e,t,n){e.querySelectorAll(`.pm-emergente-card`).forEach(e=>{e.addEventListener(`click`,()=>{e.classList.contains(`pm-card-loading`)||(e.classList.add(`pm-card-loading`),window.router&&window.router.navigate(`clase-emergente?fecha=${t}`),e.classList.remove(`pm-card-loading`))})})}function $(t,n,r,i){t.querySelector(`#btn-clase-emergente`)?.addEventListener(`click`,async()=>{let t=[];try{let e=(i||[]).map(e=>e.id);if(e.length>0){let n=await u(e),r={};n.forEach(e=>{if(!e.alumnos)return;r[e.alumno_id]||(r[e.alumno_id]=[]);let t=i.find(t=>t.id===e.clase_id);t&&r[e.alumno_id].push(t.nombre)});let a=new Set;t=n.map(e=>e.alumnos).filter(Boolean).filter(e=>a.has(e.id)?!1:(a.add(e.id),!0)).map(e=>({...e,clase_nombres:r[e.id]||[]}))}}catch(e){console.warn(`[HoyView] No se pudieron cargar alumnos para clase emergente:`,e)}I({fecha:n,clases:i||[],alumnos:t,maestroId:r,onSave:async t=>{let{data:n,error:r}=await g.from(`sesiones_clase`).insert([t]).select().single();if(r)throw r;e.success(`Clase emergente creada. Procedé a pasar asistencia.`),window.location.hash=`#/asistencia?sesion=${n.id}&fecha=${t.fecha}`}})})}if(!document.getElementById(`pm-hoy-pendientes-styles`)){let e=document.createElement(`style`);if(e.id=`pm-hoy-pendientes-styles`,!document.getElementById(`pm-badge-warning-style`)){let e=document.createElement(`style`);e.id=`pm-badge-warning-style`,e.textContent=`
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
  `,document.head.appendChild(e)}export{le as renderHoyView};