import{i as e,r as t}from"./AppModal-Du6jXNYA.js";import{c as n}from"./asistenciasApi-ZGiUeNEl.js";import{t as r}from"./MapaContenidoSVG-B-8-5_NT.js";import{_ as i,c as a,d as o,f as s,g as c,h as l,i as u,m as d,n as f,o as p,r as m,t as h,v as g,x as _}from"./mapaClaseService-DaoOTdhF.js";import{r as v,t as y}from"./jspdf.plugin.autotable-DPzO4huE.js";import{t as b}from"./calificacionIndicadorPanel-BK40cdMQ.js";function x({claseId:e,niveles:t=[],objetivo:n=null,maestroId:r=null,onSaved:i=null,onClosed:a=null}){document.querySelectorAll(`.objetivo-editor-modal-overlay`).forEach(e=>e.remove());let o={objetivo:n,indicadores:[],archivarPendienteId:null,archivarObjetivoPendiente:!1},s=document.createElement(`div`);if(s.className=`objetivo-editor-modal-overlay`,document.body.appendChild(s),!document.getElementById(`objetivo-editor-modal-styles`)){let e=document.createElement(`style`);e.id=`objetivo-editor-modal-styles`,e.textContent=O(),document.head.appendChild(e)}let c=()=>{s.remove(),a?.()},l=()=>{s.innerHTML=w({claseId:e,niveles:t,state:o}),C({overlay:s,claseId:e,niveles:t,maestroId:r,state:o,close:c,render:l,onSaved:i})};l(),o.objetivo?.id&&S(o,l)}async function S(e,t){try{e.indicadores=await i(e.objetivo.id)}catch(t){console.error(`[objetivoEditorModal] Error cargando indicadores:`,t),e.indicadores=[]}t()}function C({overlay:e,claseId:t,niveles:n,maestroId:r,state:i,close:c,render:l,onSaved:d}){e.querySelector(`.objetivo-editor-modal-close-x`)?.addEventListener(`click`,c),e.querySelector(`.objetivo-editor-modal-backdrop`)?.addEventListener(`click`,c),e.querySelector(`.objetivo-editor-cancelar-btn`)?.addEventListener(`click`,c),e.querySelector(`.objetivo-editor-guardar-btn`)?.addEventListener(`click`,async()=>{let n=e.querySelector(`#objetivo-editor-nombre`)?.value?.trim()||``,o=e.querySelector(`#objetivo-editor-descripcion`)?.value?.trim()||``,s=e.querySelector(`#objetivo-editor-nivel`)?.value||null;if(!n){E(e,`El nombre del objetivo es requerido`);return}try{if(i.objetivo?.id){let e=await f(i.objetivo.id,{nombre:n,descripcion:o});i.objetivo={...i.objetivo,...e},d?.(i.objetivo)}else{if(!s){E(e,`Seleccioná una unidad`);return}let c=await a({clase_id:t,level_id:s,nombre:n,descripcion:o,orden_objetivo:(await _(t)).filter(e=>e.level_id===s).reduce((e,t)=>Math.max(e,t.orden_objetivo||0),0)+1,created_by:r});i.objetivo=c,d?.(c)}l(),i.objetivo?.id&&S(i,l)}catch(t){console.error(`[objetivoEditorModal] Error guardando objetivo:`,t),E(e,`No se pudo guardar el objetivo`)}}),e.querySelector(`.objetivo-editor-borrar-objetivo-btn`)?.addEventListener(`click`,async()=>{try{await s(i.objetivo.id),c()}catch(t){if(t instanceof h){i.archivarObjetivoPendiente=!0,l();return}console.error(`[objetivoEditorModal] Error borrando objetivo:`,t),E(e,`No se pudo borrar el objetivo`)}}),e.querySelector(`.objetivo-editor-archivar-objetivo-btn`)?.addEventListener(`click`,async()=>{try{await u(i.objetivo.id),c()}catch(t){console.error(`[objetivoEditorModal] Error archivando objetivo:`,t),E(e,`No se pudo archivar el objetivo`)}}),e.querySelector(`.objetivo-editor-agregar-indicador-btn`)?.addEventListener(`click`,async()=>{let n=e.querySelector(`#objetivo-editor-nuevo-indicador`)?.value?.trim()||``;if(n)try{await p({objetivo_id:i.objetivo.id,clase_id:t,descripcion:n}),await S(i,l)}catch(t){console.error(`[objetivoEditorModal] Error agregando indicador:`,t),E(e,`No se pudo agregar el indicador`)}}),e.querySelectorAll(`.objetivo-editor-indicador-row`).forEach(t=>{let n=t.dataset.indicadorId;t.querySelector(`.btn-borrar-indicador`)?.addEventListener(`click`,async()=>{try{await o(n),await S(i,l)}catch(t){if(t instanceof h){i.archivarPendienteId=n,l();return}console.error(`[objetivoEditorModal] Error borrando indicador:`,t),E(e,`No se pudo borrar el indicador`)}}),t.querySelector(`.btn-archivar-indicador`)?.addEventListener(`click`,async()=>{try{await m(n),i.archivarPendienteId=null,await S(i,l)}catch(t){console.error(`[objetivoEditorModal] Error archivando indicador:`,t),E(e,`No se pudo archivar el indicador`)}})})}function w({claseId:e,niveles:t,state:n}){let{objetivo:r}=n,i=!!r?.id,a=!i&&t.length===0,o=t.map(e=>`<option value="${e.id}">${D(e.nombre)}</option>`).join(``);return`
    <div class="objetivo-editor-modal-backdrop"></div>
    <div class="objetivo-editor-modal-dialog">
      <div class="objetivo-editor-modal-header">
        <h5 class="objetivo-editor-modal-title">${i?`Editar Objetivo`:`Nuevo Objetivo`}</h5>
        <button class="objetivo-editor-modal-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="objetivo-editor-modal-body">
        ${a?`
          <div class="objetivo-editor-warning" role="alert">
            Esta clase no tiene unidades (niveles) asignadas en la matriz ACM. Asigná una unidad antes de crear objetivos.
          </div>
        `:``}
        <div class="objetivo-editor-error-msg d-none" role="alert"></div>

        <label class="objetivo-editor-label" for="objetivo-editor-nombre">Nombre</label>
        <input type="text" id="objetivo-editor-nombre" class="form-control" value="${D(r?.nombre||``)}" placeholder="Ej: La 3ra posición" />

        <label class="objetivo-editor-label" for="objetivo-editor-descripcion">Descripción</label>
        <textarea id="objetivo-editor-descripcion" class="form-control" rows="2">${D(r?.descripcion||``)}</textarea>

        ${i?``:`
          <label class="objetivo-editor-label" for="objetivo-editor-nivel">Unidad</label>
          <select id="objetivo-editor-nivel" class="form-select" ${a?`disabled`:``}>
            ${o}
          </select>
        `}

        ${i?T(n):``}
      </div>
      <div class="objetivo-editor-modal-footer">
        ${i?`<button class="btn btn-outline-danger objetivo-editor-borrar-objetivo-btn">Borrar Objetivo</button>`:``}
        ${i&&n.archivarObjetivoPendiente?`<button class="btn btn-warning objetivo-editor-archivar-objetivo-btn">Archivar Objetivo</button>`:``}
        <button class="btn btn-outline-secondary objetivo-editor-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary objetivo-editor-guardar-btn" ${a?`disabled`:``}>Guardar</button>
      </div>
    </div>
  `}function T(e){let t=e.indicadores.map(t=>`
      <div class="objetivo-editor-indicador-row" data-indicador-id="${t.id}">
        <span class="objetivo-editor-indicador-desc">${D(t.descripcion)}</span>
        <div class="objetivo-editor-indicador-actions">
          <button class="btn btn-sm btn-outline-danger btn-borrar-indicador">Borrar</button>
          ${e.archivarPendienteId===t.id?`<button class="btn btn-sm btn-warning btn-archivar-indicador">Archivar</button>`:``}
        </div>
      </div>
    `).join(``);return`
    <hr />
    <h6>Indicadores</h6>
    ${e.archivarPendienteId?`<div class="objetivo-editor-warning" role="alert">No se puede borrar: tiene evaluaciones asociadas. Podés archivarlo en su lugar.</div>`:``}
    <div class="objetivo-editor-indicadores-list">
      ${t||`<div class="text-muted small">Sin indicadores todavía.</div>`}
    </div>
    <div class="objetivo-editor-nuevo-indicador-row">
      <input type="text" id="objetivo-editor-nuevo-indicador" class="form-control form-control-sm" placeholder="Nuevo indicador..." />
      <button class="btn btn-sm btn-outline-primary objetivo-editor-agregar-indicador-btn">Agregar</button>
    </div>
  `}function E(e,t){let n=e.querySelector(`.objetivo-editor-error-msg`);n&&(n.textContent=t,n.classList.remove(`d-none`),setTimeout(()=>n.classList.add(`d-none`),3e3))}function D(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function O(){return`
    .objetivo-editor-modal-overlay {
      position: fixed; inset: 0; z-index: 10001;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .objetivo-editor-modal-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .objetivo-editor-modal-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 560px;
      max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .objetivo-editor-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .objetivo-editor-modal-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .objetivo-editor-modal-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .objetivo-editor-modal-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .objetivo-editor-label { display: block; font-size: 0.75rem; font-weight: 600; margin: 0.5rem 0 0.2rem; }
    .objetivo-editor-warning {
      background: #fef3c7; color: #92400e; padding: 0.5rem 0.75rem; border-radius: 8px;
      font-size: 0.8rem; margin-bottom: 0.75rem;
    }
    .objetivo-editor-error-msg {
      background: #fee2e2; color: #dc2626; padding: 0.5rem 0.75rem; border-radius: 8px;
      font-size: 0.8rem; margin-bottom: 0.75rem;
    }
    .objetivo-editor-indicador-row {
      display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
      padding: 0.4rem 0; border-bottom: 1px solid var(--bs-border-color, #eee);
    }
    .objetivo-editor-indicador-desc { font-size: 0.85rem; }
    .objetivo-editor-indicador-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }
    .objetivo-editor-nuevo-indicador-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .objetivo-editor-modal-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `}var k={azul:[20,60,130],azulClaro:[220,232,250],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],verde:[16,185,129]},A=215.9,j=279.4,M=14;function N(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function P(e,t=`—`){return String(e??``).trim()||t}function F(e,t=``){e.setFillColor(...k.azul),e.rect(0,0,A,32,`F`),e.setFillColor(...k.dorado),e.rect(0,32,A,2.5,`F`),e.setFillColor(...k.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...k.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,16,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Tocamos Corazones, Cambiamos Vidas · Punta Cana`,16,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...k.dorado),e.text(`RUTA DE CONTENIDO DIDÁCTICO`,A-M,13,{align:`right`}),t&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(t,A-M,20,{align:`right`})),e.setTextColor(...k.grisOscuro)}function I(e,t){e.setFillColor(...k.azul),e.rect(0,j-8,A,8,`F`),e.setFillColor(...k.dorado),e.rect(0,j-8,4,8,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...k.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,16,j-4.5),e.text(`Pág. ${t}`,A-M,j-4.5,{align:`right`})}function L(e,t){return`ruta-contenido-${String(e||`clase`).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}-${t}.pdf`}function R(e=[],t=[],n=[],r=new Map){let i=new Map(e.map(e=>[e.id,e.nombre])),a=new Map;for(let e of n)a.has(e.objetivo_id)||a.set(e.objetivo_id,[]),a.get(e.objetivo_id).push(e);let o=[...t].sort((t,n)=>{let r=e.findIndex(e=>e.id===t.level_id),i=e.findIndex(e=>e.id===n.level_id),a=r===-1?2**53-1:r,o=i===-1?2**53-1:i;return a===o?(t.order_index??0)-(n.order_index??0):a-o}),s=new Map;for(let e of o){let t=i.get(e.level_id)||`Sin unidad`;s.has(t)||s.set(t,[]);let n=r.get(e.id);s.get(t).push({nombre:e.nombre,estrellas:n?.estrellas??null,pctAvance:n?.pctAvance??null,indicadores:(a.get(e.id)||[]).map(e=>e.descripcion)})}return[...s.entries()].map(([e,t])=>({unidadNombre:e,objetivos:t}))}function z({claseNombre:e,maestroNombre:t=``,unidades:n=[]}){let r=new v({unit:`mm`,format:`letter`}),i=N(),a=L(e,new Date().toISOString().slice(0,10));if(F(r,`Generado: ${i}`),r.setFillColor(...k.azulClaro),r.roundedRect(M,42,A-M*2,18,2,2,`F`),r.setFont(`helvetica`,`bold`),r.setFontSize(13),r.setTextColor(...k.azul),r.text(P(e),18,49),r.setFont(`helvetica`,`normal`),r.setFontSize(8),r.setTextColor(...k.grisMedio),r.text(`Maestro: ${P(t)}  ·  Generado: ${i}`,18,56),n.length===0){r.setFont(`helvetica`,`italic`),r.setFontSize(9),r.setTextColor(...k.grisMedio),r.text(`Esta clase todavía no tiene objetivos en su ruta de contenido.`,M,66),I(r,1),r.save(a);return}let o=[];n.forEach((e,t)=>{e.objetivos.forEach((n,r)=>{let i=`${t+1}.${r+1}`,a=n.pctAvance==null?`—`:`${n.pctAvance}%`,s=n.estrellas==null?`—`:`★`.repeat(n.estrellas)+`☆`.repeat(3-n.estrellas),c=n.indicadores.length>0?n.indicadores.map((e,t)=>`${i}.${t+1} ${e}`).join(`
`):`(sin indicadores)`;o.push([r===0?e.unidadNombre:``,i,P(n.nombre),c,s,a])})}),y(r,{startY:66,margin:{top:44,left:M,right:M},theme:`grid`,head:[[`Unidad`,`#`,`Objetivo`,`Indicadores`,`Estrellas`,`Avance`]],headStyles:{fillColor:k.azul,textColor:k.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`,valign:`top`},alternateRowStyles:{fillColor:k.grisClaro},columnStyles:{0:{cellWidth:24,fontStyle:`bold`},1:{cellWidth:10},2:{cellWidth:38},3:{cellWidth:78},4:{cellWidth:18,textColor:[217,119,6]},5:{cellWidth:16}},body:o,didDrawPage:t=>{F(r,`${e}`),I(r,t.pageNumber)}}),I(r,1),r.save(a)}function B(){return new Date().toISOString().slice(0,10)}async function V(e,{claseId:t,maestroId:n=null}={}){if(!e||!t)return;e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `;let r={claseId:t,maestroId:n,niveles:[],objetivos:[],estrellasMap:new Map,modo:`diseno`,gateBloqueado:!1,presentes:[],selectedObjetivoId:null,indicadoresSeleccionados:[]};await H(r),await U(r),G(e,r)}async function H(e){try{e.niveles=await g(e.claseId)}catch(t){console.error(`[MapaClaseView] Error cargando niveles asignados:`,t),e.niveles=[]}}async function U(e){try{let[t,n]=await Promise.all([_(e.claseId),l(e.claseId)]);e.objetivos=t||[],e.estrellasMap=new Map((n||[]).map(e=>[e.objetivoId,e]))}catch(t){console.error(`[MapaClaseView] Error cargando objetivos/estrellas:`,t),e.objetivos=[],e.estrellasMap=new Map}}function W(e){let t=new Map(e.niveles.map(e=>[e.id,e.nombre]));return[...e.objetivos].sort((t,n)=>{let r=e.niveles.findIndex(e=>e.id===t.level_id),i=e.niveles.findIndex(e=>e.id===n.level_id),a=r===-1?2**53-1:r,o=i===-1?2**53-1:i;return a===o?(t.order_index??0)-(n.order_index??0):a-o}).map(n=>{let r=e.estrellasMap.get(n.id);return{id:n.id,titulo:n.nombre,unidadNombre:t.get(n.level_id)||`Sin unidad`,...r?{estrellas:r.estrellas,pctAvance:r.pctAvance,estadoVisual:r.estadoVisual}:{}}})}function G(e,t){let n=t.niveles.length===0;e.innerHTML=`
    <div class="mapa-clase-view container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h4 class="fw-bold mb-0">Mapa de Planificación</h4>
        <div class="d-flex flex-wrap gap-2">
          <button type="button" id="btn-exportar-pdf" class="btn btn-sm btn-outline-secondary" ${n?`disabled`:``}>
            <i class="bi bi-file-earmark-pdf me-1"></i>Exportar a PDF
          </button>
          <div class="btn-group" role="group" aria-label="Modo del mapa">
            <button type="button" id="btn-modo-diseno" class="btn btn-sm ${t.modo===`diseno`?`btn-primary`:`btn-outline-primary`}">
              <i class="bi bi-pencil-square me-1"></i>Diseñar Ruta
            </button>
            <button type="button" id="btn-modo-sesion" class="btn btn-sm ${t.modo===`sesion`?`btn-primary`:`btn-outline-primary`}">
              <i class="bi bi-person-video3 me-1"></i>Dar Clase
            </button>
          </div>
        </div>
      </div>

      ${n?`
        <div class="alert alert-warning" role="alert">
          Esta clase no tiene unidades (niveles) asignadas en la matriz ACM (acm_active_routes). Asigná una unidad antes de crear objetivos.
        </div>
      `:``}

      ${t.gateBloqueado?`
        <div class="alert alert-warning d-flex align-items-center justify-content-between gap-2" role="alert">
          <span>No hay asistencia registrada para hoy. Registrala antes de entrar a Dar Clase.</span>
          <button id="btn-ir-asistencias" class="btn btn-sm btn-warning">Ir a Asistencias</button>
        </div>
      `:``}

      <div id="mapa-clase-svg-canvas" class="mb-3"></div>

      <div id="mapa-clase-panel-sesion"></div>
    </div>
  `;let i=e.querySelector(`#mapa-clase-svg-canvas`);i&&r({container:i,nodos:W(t),modo:t.modo,onNodeClick:n=>Y(e,t,n),onAddNodeClick:()=>J(e,t)}),t.modo===`sesion`&&t.selectedObjetivoId&&X(e,t),e.querySelector(`#btn-modo-diseno`)?.addEventListener(`click`,()=>{t.modo=`diseno`,t.gateBloqueado=!1,t.selectedObjetivoId=null,t.indicadoresSeleccionados=[],G(e,t)}),e.querySelector(`#btn-modo-sesion`)?.addEventListener(`click`,()=>q(e,t)),e.querySelector(`#btn-ir-asistencias`)?.addEventListener(`click`,()=>window.router?.navigate(`asistencias`)),e.querySelector(`#btn-exportar-pdf`)?.addEventListener(`click`,()=>K(e,t))}async function K(t,n){let r=t.querySelector(`#btn-exportar-pdf`);r&&(r.disabled=!0);try{let[e,{nombreClase:t,nombreMaestro:r}]=await Promise.all([c(n.claseId),d(n.claseId)]),i=R(n.niveles,n.objetivos,e,n.estrellasMap);z({claseNombre:t||`Clase`,maestroNombre:r,unidades:i})}catch(t){console.error(`[MapaClaseView] Error exportando PDF de la ruta:`,t),e.error(`No se pudo generar el PDF de la ruta de contenido.`)}finally{r&&(r.disabled=n.niveles.length===0)}}async function q(e,t){let r=B(),i={tomada:!1,presentes:[]};try{i=await n({claseId:t.claseId,fecha:r})}catch(e){console.error(`[MapaClaseView] Error verificando asistencia del día:`,e)}if(!i.tomada){t.gateBloqueado=!0,G(e,t);return}t.gateBloqueado=!1,t.presentes=i.presentes||[],t.modo=`sesion`,G(e,t)}function J(t,n){if(n.niveles.length===0){e.warning(`Esta clase no tiene unidades (niveles) asignadas. Asigná una unidad en la matriz ACM primero.`);return}x({claseId:n.claseId,niveles:n.niveles,objetivo:null,maestroId:n.maestroId,onSaved:()=>Z(t,n)})}function Y(e,t,n){if(t.modo===`diseno`){let r=t.objetivos.find(e=>String(e.id)===String(n.id))||null;x({claseId:t.claseId,niveles:t.niveles,objetivo:r,maestroId:t.maestroId,onSaved:()=>Z(e,t)});return}t.selectedObjetivoId=n.id,i(n.id).then(r=>{t.selectedObjetivoId===n.id&&(t.indicadoresSeleccionados=r||[],G(e,t))}).catch(n=>{console.error(`[MapaClaseView] Error cargando indicadores del objetivo:`,n),t.indicadoresSeleccionados=[],G(e,t)})}function X(e,n){let r=e.querySelector(`#mapa-clase-panel-sesion`);if(!r)return;let i=n.objetivos.find(e=>String(e.id)===String(n.selectedObjetivoId)),a=n.indicadoresSeleccionados.map(e=>`
      <div class="mapa-clase-indicador-row d-flex align-items-center justify-content-between border-bottom py-2">
        <span>${t(e.descripcion||``)}</span>
        <button class="btn btn-sm btn-outline-primary btn-calificar-indicador" data-indicador-id="${e.id}">
          Calificar
        </button>
      </div>
    `).join(``);r.innerHTML=`
    <div class="card border-secondary-subtle rounded-4 p-3 bg-body-tertiary">
      <h6 class="fw-bold mb-2">Indicadores de "${t(i?.nombre||``)}"</h6>
      <p class="text-body-secondary small mb-2">Elegí cuáles se cubrieron hoy y calificá a los alumnos presentes.</p>
      ${a||`<div class="text-muted small">Este objetivo todavía no tiene indicadores.</div>`}
    </div>
  `,r.querySelectorAll(`.btn-calificar-indicador`).forEach(t=>{t.addEventListener(`click`,()=>{let r=n.indicadoresSeleccionados.find(e=>String(e.id)===t.dataset.indicadorId);r&&b({claseId:n.claseId,claseIndicadorId:r.id,indicadorDescripcion:r.descripcion,presentes:n.presentes,fecha:B(),evaluadoPor:n.maestroId,onGuardado:()=>Z(e,n)})})})}async function Z(e,t){await U(t),G(e,t)}export{V as renderMapaClaseView};