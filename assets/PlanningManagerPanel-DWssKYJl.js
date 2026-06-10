import{t as e}from"./AppToast-BfOaB9z8.js";import{i as t}from"./portalUtils-d8JQ9zxl.js";import{t as n}from"./AppModal-BRx623gX.js";import{i as r}from"./planningService-s-tkfwT4.js";import{a as i,c as a,i as o,l as s,n as c,o as l,r as u,s as d,t as f,u as p}from"./curriculumAdminService-DG-1Anrw.js";async function m(m,{publishedRouteVersionId:h,onChanged:g}){let _=null;function v(){m.innerHTML=`
      <div class="pm-planning-empty" style="max-width:520px;margin:0 auto;">
        <p style="font-size:1.05rem;font-weight:600;margin-bottom:0.5rem;">✏️ Editar el currículo de esta ruta</p>
        <p style="margin-bottom:1.25rem;">Se creará (o abrirá) <strong>tu borrador propio</strong>. Podés agregar, editar o quitar niveles, nodos e indicadores sin afectar la ruta publicada que ven los demás maestros.</p>
        <button id="pm-mg-open-draft" class="pm-planning-btn pm-planning-btn-info" style="min-height:44px;padding:0.7rem 1.4rem;">
          Abrir mi borrador
        </button>
      </div>
    `,m.querySelector(`#pm-mg-open-draft`)?.addEventListener(`click`,y)}async function y(){m.innerHTML=`<div class="pm-planning-empty"><p>Preparando tu borrador editable…<br><small>La primera vez puede tardar unos segundos.</small></p></div>`;try{_=await d(h)}catch(e){console.error(`[manager] Error creando borrador:`,e),m.innerHTML=`<div class="pm-planning-empty"><p>No se pudo abrir tu borrador. Intenta de nuevo.</p></div>`;return}await b()}async function b(){let e;try{e=await r(_)}catch(e){console.error(`[manager] Error cargando borrador:`,e),m.innerHTML=`<div class="pm-planning-empty"><p>Error al cargar el borrador.</p></div>`;return}x(e),g?.()}function x(e){m.innerHTML=`
      <style>
        .pm-mg-banner { background: var(--pm-warning-light, #fef3c7); color: var(--pm-warning-dark, #92400e); border-radius: 10px; padding: 0.6rem 0.9rem; font-size: 0.8rem; margin-bottom: 1rem; }
        .pm-mg-block { border: 1px solid var(--pm-border); border-radius: 12px; margin-bottom: 0.75rem; overflow: hidden; }
        .pm-mg-block-head { padding: 0.8rem 1rem; background: var(--pm-surface-2); display: flex; align-items: center; gap: 0.5rem; }
        .pm-mg-block-name { font-weight: 700; flex: 1; }
        .pm-mg-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-top: 1px solid var(--pm-border); }
        .pm-mg-level { padding-left: 1.25rem; }
        .pm-mg-node { padding-left: 2.25rem; background: var(--pm-surface); }
        .pm-mg-indicator { padding-left: 3.25rem; font-size: 0.82rem; color: var(--pm-text-muted); }
        .pm-mg-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pm-mg-num { width: 22px; height: 22px; border-radius: 50%; background: var(--pm-primary); color: #fff; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pm-mg-act { background: none; border: 1px solid var(--pm-border); border-radius: 6px; padding: 0.2rem 0.45rem; cursor: pointer; font-size: 0.8rem; line-height: 1; color: var(--pm-text); }
        .pm-mg-act:hover { background: var(--pm-surface-2); }
        .pm-mg-act-add { border-color: var(--pm-primary); color: var(--pm-primary); font-weight: 600; }
        @media (max-width: 640px) {
          .pm-mg-row { flex-wrap: wrap; padding: 0.5rem 0.6rem; }
          .pm-mg-node { padding-left: 1.25rem; }
          .pm-mg-indicator { padding-left: 1.75rem; }
          .pm-mg-act { min-height: 36px; }
        }
      </style>
      <div class="pm-mg-banner">
        ✏️ Estás editando <strong>tu borrador propio</strong>. La ruta publicada que ven los demás maestros no se modifica.
      </div>
      ${e.length===0?`<div class="pm-planning-empty"><p>El borrador no tiene bloques.</p></div>`:e.map(e=>S(e)).join(``)}
    `,k()}function S(e){return`
      <div class="pm-mg-block">
        <div class="pm-mg-block-head">
          <span class="pm-mg-block-name">${t(e.name||`Bloque`)}</span>
          <button class="pm-mg-act pm-mg-act-add" data-action="add-level" data-block="${e.id}">+ Nivel</button>
        </div>
        ${(e.levels||[]).map(e=>C(e)).join(``)}
      </div>
    `}function C(e){return`
      <div class="pm-mg-row pm-mg-level">
        <span class="pm-mg-num">${e.level_number??`·`}</span>
        <span class="pm-mg-label"><strong>${t(e.name||`Nivel`)}</strong></span>
        <button class="pm-mg-act pm-mg-act-add" data-action="add-node" data-level="${e.id}">+ Nodo</button>
        <button class="pm-mg-act" data-action="edit-level" data-id="${e.id}" data-name="${t(e.name||``)}">✏️</button>
        <button class="pm-mg-act" data-action="del-level" data-id="${e.id}">🗑️</button>
      </div>
      ${(e.nodes||[]).map(e=>w(e)).join(``)}
    `}function w(e){return`
      <div class="pm-mg-row pm-mg-node">
        <span class="pm-mg-label">${t(e.name||`Nodo`)}</span>
        <button class="pm-mg-act pm-mg-act-add" data-action="add-indicator" data-node="${e.id}">+ Indicador</button>
        <button class="pm-mg-act" data-action="edit-node" data-id="${e.id}" data-name="${t(e.name||``)}">✏️</button>
        <button class="pm-mg-act" data-action="del-node" data-id="${e.id}">🗑️</button>
      </div>
      ${(e.indicators||[]).map(e=>T(e)).join(``)}
    `}function T(e){let n=e.nombre||e.description||`Indicador`;return`
      <div class="pm-mg-row pm-mg-indicator">
        <span class="pm-mg-label">${t(n)}</span>
        <button class="pm-mg-act" data-action="edit-indicator" data-id="${e.id}" data-name="${t(n)}">✏️</button>
        <button class="pm-mg-act" data-action="del-indicator" data-id="${e.id}">🗑️</button>
      </div>
    `}function E({title:r,label:i,value:a=``,onSubmit:o}){n.open({title:r,size:`sm`,body:`
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem;">${t(i)}</label>
        <input id="pm-mg-input" type="text" value="${t(a)}"
          style="width:100%; padding:0.6rem; border:1px solid var(--pm-border); border-radius:8px; font-size:0.95rem;" />
      `,saveText:`Guardar`,onSave:async()=>{let t=document.getElementById(`pm-mg-input`)?.value?.trim();if(!t)return e.error(`El nombre no puede estar vacío`),!1;await o(t)}})}function D({title:e,message:r,onConfirm:i}){n.open({title:e,size:`sm`,body:`<p style="font-size:0.9rem;">${t(r)}</p>`,saveText:`Eliminar`,onSave:async()=>{await i()}})}async function O(t,n){try{await t(),e.success(n),await b()}catch(t){console.error(`[manager] Error:`,t),e.error(`No se pudo guardar el cambio`)}}function k(){m.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.action,n=e.dataset.id;if(t===`add-level`)return E({title:`Nuevo nivel`,label:`Nombre del nivel`,onSubmit:t=>O(()=>c({blockId:e.dataset.block,routeVersionId:_,name:t}),`Nivel creado`)});if(t===`edit-level`)return E({title:`Editar nivel`,label:`Nombre del nivel`,value:e.dataset.name,onSubmit:e=>O(()=>s(n,{name:e}),`Nivel actualizado`)});if(t===`del-level`)return D({title:`Eliminar nivel`,message:`Se eliminará el nivel y todo su contenido del borrador. ¿Continuar?`,onConfirm:()=>O(()=>i(n),`Nivel eliminado`)});if(t===`add-node`)return E({title:`Nuevo nodo/tema`,label:`Nombre del nodo`,onSubmit:t=>O(()=>u({levelId:e.dataset.level,routeVersionId:_,name:t}),`Nodo creado`)});if(t===`edit-node`)return E({title:`Editar nodo`,label:`Nombre del nodo`,value:e.dataset.name,onSubmit:e=>O(()=>p(n,{name:e}),`Nodo actualizado`)});if(t===`del-node`)return D({title:`Eliminar nodo`,message:`Se eliminará el nodo y sus indicadores del borrador. ¿Continuar?`,onConfirm:()=>O(()=>l(n),`Nodo eliminado`)});if(t===`add-indicator`)return E({title:`Nuevo indicador`,label:`Texto del indicador`,onSubmit:t=>O(()=>f({nodeId:e.dataset.node,nombre:t}),`Indicador creado`)});if(t===`edit-indicator`)return E({title:`Editar indicador`,label:`Texto del indicador`,value:e.dataset.name,onSubmit:e=>O(()=>a(n,{nombre:e,description:e}),`Indicador actualizado`)});if(t===`del-indicator`)return D({title:`Eliminar indicador`,message:`El indicador se marcará como inactivo en tu borrador. ¿Continuar?`,onConfirm:()=>O(()=>o(n),`Indicador eliminado`)})})})}v()}export{m as renderPlanningManager};