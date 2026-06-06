import{i as e}from"./supabase-BryBf0UA.js";import{t}from"./AppToast-L43yfvBt.js";import{i as n}from"./portalUtils-BqwkK1cV.js";import{t as r}from"./AppModal-BlN8abkL.js";import{i}from"./planningService-s-tkfwT4.js";async function a(t){let{data:n,error:r}=await e.rpc(`clone_route_version_as_draft`,{p_source_version_id:t});if(r)throw r;return n}async function o(t,n,r){let{data:i}=await e.from(t).select(`order_index`).eq(n,r).order(`order_index`,{ascending:!1}).limit(1);return(i?.[0]?.order_index??-1)+1}async function s({blockId:t,routeVersionId:n,name:r,levelNumber:i=null}){let a=await o(`levels`,`block_id`,t),{data:s,error:c}=await e.from(`levels`).insert([{block_id:t,route_version_id:n,name:r,level_number:i??a+1,order_index:a}]).select(`id`).single();if(c)throw c;return s.id}async function c(t,n){let{error:r}=await e.from(`levels`).update(n).eq(`id`,t);if(r)throw r}async function l(t){let{error:n}=await e.from(`levels`).delete().eq(`id`,t);if(n)throw n}async function u({levelId:t,routeVersionId:n,name:r,type:i=`TECNICA`}){let a=await o(`nodes`,`level_id`,t),{data:s,error:c}=await e.from(`nodes`).insert([{level_id:t,route_version_id:n,name:r,type:i,order_index:a}]).select(`id`).single();if(c)throw c;return s.id}async function d(t,n){let{error:r}=await e.from(`nodes`).update(n).eq(`id`,t);if(r)throw r}async function f(t){let{error:n}=await e.from(`nodes`).delete().eq(`id`,t);if(n)throw n}async function p({nodeId:t,nombre:n,description:r=null}){let i=await o(`indicators`,`node_id`,t),{data:a,error:s}=await e.from(`indicators`).insert([{node_id:t,nombre:n,description:r??n,order_index:i,activo:!0}]).select(`id`).single();if(s)throw s;return a.id}async function m(t,n){let{error:r}=await e.from(`indicators`).update(n).eq(`id`,t);if(r)throw r}async function h(t){let{error:n}=await e.from(`indicators`).update({activo:!1}).eq(`id`,t);if(n)throw n}async function g(e,{publishedRouteVersionId:o,onChanged:g}){let _=null;function v(){e.innerHTML=`
      <div class="pm-planning-empty" style="max-width:520px;margin:0 auto;">
        <p style="font-size:1.05rem;font-weight:600;margin-bottom:0.5rem;">✏️ Editar el currículo de esta ruta</p>
        <p style="margin-bottom:1.25rem;">Se creará (o abrirá) <strong>tu borrador propio</strong>. Podés agregar, editar o quitar niveles, nodos e indicadores sin afectar la ruta publicada que ven los demás maestros.</p>
        <button id="pm-mg-open-draft" class="pm-planning-btn pm-planning-btn-info" style="min-height:44px;padding:0.7rem 1.4rem;">
          Abrir mi borrador
        </button>
      </div>
    `,e.querySelector(`#pm-mg-open-draft`)?.addEventListener(`click`,y)}async function y(){e.innerHTML=`<div class="pm-planning-empty"><p>Preparando tu borrador editable…<br><small>La primera vez puede tardar unos segundos.</small></p></div>`;try{_=await a(o)}catch(t){console.error(`[manager] Error creando borrador:`,t),e.innerHTML=`<div class="pm-planning-empty"><p>No se pudo abrir tu borrador. Intenta de nuevo.</p></div>`;return}await b()}async function b(){let t;try{t=await i(_)}catch(t){console.error(`[manager] Error cargando borrador:`,t),e.innerHTML=`<div class="pm-planning-empty"><p>Error al cargar el borrador.</p></div>`;return}x(t),g?.()}function x(t){e.innerHTML=`
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
      ${t.length===0?`<div class="pm-planning-empty"><p>El borrador no tiene bloques.</p></div>`:t.map(e=>S(e)).join(``)}
    `,k()}function S(e){return`
      <div class="pm-mg-block">
        <div class="pm-mg-block-head">
          <span class="pm-mg-block-name">${n(e.name||`Bloque`)}</span>
          <button class="pm-mg-act pm-mg-act-add" data-action="add-level" data-block="${e.id}">+ Nivel</button>
        </div>
        ${(e.levels||[]).map(e=>C(e)).join(``)}
      </div>
    `}function C(e){return`
      <div class="pm-mg-row pm-mg-level">
        <span class="pm-mg-num">${e.level_number??`·`}</span>
        <span class="pm-mg-label"><strong>${n(e.name||`Nivel`)}</strong></span>
        <button class="pm-mg-act pm-mg-act-add" data-action="add-node" data-level="${e.id}">+ Nodo</button>
        <button class="pm-mg-act" data-action="edit-level" data-id="${e.id}" data-name="${n(e.name||``)}">✏️</button>
        <button class="pm-mg-act" data-action="del-level" data-id="${e.id}">🗑️</button>
      </div>
      ${(e.nodes||[]).map(e=>w(e)).join(``)}
    `}function w(e){return`
      <div class="pm-mg-row pm-mg-node">
        <span class="pm-mg-label">${n(e.name||`Nodo`)}</span>
        <button class="pm-mg-act pm-mg-act-add" data-action="add-indicator" data-node="${e.id}">+ Indicador</button>
        <button class="pm-mg-act" data-action="edit-node" data-id="${e.id}" data-name="${n(e.name||``)}">✏️</button>
        <button class="pm-mg-act" data-action="del-node" data-id="${e.id}">🗑️</button>
      </div>
      ${(e.indicators||[]).map(e=>T(e)).join(``)}
    `}function T(e){let t=e.nombre||e.description||`Indicador`;return`
      <div class="pm-mg-row pm-mg-indicator">
        <span class="pm-mg-label">${n(t)}</span>
        <button class="pm-mg-act" data-action="edit-indicator" data-id="${e.id}" data-name="${n(t)}">✏️</button>
        <button class="pm-mg-act" data-action="del-indicator" data-id="${e.id}">🗑️</button>
      </div>
    `}function E({title:e,label:i,value:a=``,onSubmit:o}){r.open({title:e,size:`sm`,body:`
        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:0.4rem;">${n(i)}</label>
        <input id="pm-mg-input" type="text" value="${n(a)}"
          style="width:100%; padding:0.6rem; border:1px solid var(--pm-border); border-radius:8px; font-size:0.95rem;" />
      `,saveText:`Guardar`,onSave:async()=>{let e=document.getElementById(`pm-mg-input`)?.value?.trim();if(!e)return t.error(`El nombre no puede estar vacío`),!1;await o(e)}})}function D({title:e,message:t,onConfirm:i}){r.open({title:e,size:`sm`,body:`<p style="font-size:0.9rem;">${n(t)}</p>`,saveText:`Eliminar`,onSave:async()=>{await i()}})}async function O(e,n){try{await e(),t.success(n),await b()}catch(e){console.error(`[manager] Error:`,e),t.error(`No se pudo guardar el cambio`)}}function k(){e.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.action,n=e.dataset.id;if(t===`add-level`)return E({title:`Nuevo nivel`,label:`Nombre del nivel`,onSubmit:t=>O(()=>s({blockId:e.dataset.block,routeVersionId:_,name:t}),`Nivel creado`)});if(t===`edit-level`)return E({title:`Editar nivel`,label:`Nombre del nivel`,value:e.dataset.name,onSubmit:e=>O(()=>c(n,{name:e}),`Nivel actualizado`)});if(t===`del-level`)return D({title:`Eliminar nivel`,message:`Se eliminará el nivel y todo su contenido del borrador. ¿Continuar?`,onConfirm:()=>O(()=>l(n),`Nivel eliminado`)});if(t===`add-node`)return E({title:`Nuevo nodo/tema`,label:`Nombre del nodo`,onSubmit:t=>O(()=>u({levelId:e.dataset.level,routeVersionId:_,name:t}),`Nodo creado`)});if(t===`edit-node`)return E({title:`Editar nodo`,label:`Nombre del nodo`,value:e.dataset.name,onSubmit:e=>O(()=>d(n,{name:e}),`Nodo actualizado`)});if(t===`del-node`)return D({title:`Eliminar nodo`,message:`Se eliminará el nodo y sus indicadores del borrador. ¿Continuar?`,onConfirm:()=>O(()=>f(n),`Nodo eliminado`)});if(t===`add-indicator`)return E({title:`Nuevo indicador`,label:`Texto del indicador`,onSubmit:t=>O(()=>p({nodeId:e.dataset.node,nombre:t}),`Indicador creado`)});if(t===`edit-indicator`)return E({title:`Editar indicador`,label:`Texto del indicador`,value:e.dataset.name,onSubmit:e=>O(()=>m(n,{nombre:e,description:e}),`Indicador actualizado`)});if(t===`del-indicator`)return D({title:`Eliminar indicador`,message:`El indicador se marcará como inactivo en tu borrador. ¿Continuar?`,onConfirm:()=>O(()=>h(n),`Indicador eliminado`)})})})}v()}export{g as renderPlanningManager};