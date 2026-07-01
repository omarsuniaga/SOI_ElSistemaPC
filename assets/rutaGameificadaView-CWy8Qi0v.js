import{i as e}from"./supabase-KnARm58N.js";import{i as t}from"./maestroAuth-lT-ZcZZd.js";import{c as n,i as r}from"./maestroDataService-BGjCE976.js";import{n as i,r as a}from"./rutaTopicStore-BYhY7krO.js";async function o(t){let n=(await r())?.find(e=>e.id===t)?.instrumento;if(!n)return null;let i=n.split(`,`)[0].trim().toLowerCase(),{data:a,error:o}=await e.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${i}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();return o?(console.warn(`[rutaService] resolveRutaIdForClase error:`,o.message),null):a?.route_versions?.[0]?.id||a?.route_versions?.id||null}async function s(t,n){let{data:r,error:i}=await e.from(`blocks`).select(`id, nombre:name, order_index`).eq(`route_version_id`,t).order(`order_index`,{ascending:!0});if(i)throw Error(`[rutaService] blocks: `+i.message);if(!r||r.length===0)return[];let o=r.map(e=>e.id),{data:s,error:c}=await e.from(`levels`).select(`id, block_id, nombre:name, order_index`).in(`block_id`,o).eq(`route_version_id`,t).order(`order_index`,{ascending:!0});if(c)throw Error(`[rutaService] levels: `+c.message);let l=(s??[]).map(e=>e.id);if(l.length===0)return r.map(e=>({...e,levels:[]}));let{data:u,error:d}=await e.from(`nodes`).select(`id, level_id, nombre:name, order_index`).in(`level_id`,l).eq(`route_version_id`,t).order(`order_index`,{ascending:!0});if(d)throw Error(`[rutaService] nodes: `+d.message);let f=(u??[]).map(e=>e.id),{data:p,error:m}=f.length>0?await e.from(`indicators`).select(`id, node_id, nombre:description, order_index`).in(`node_id`,f).eq(`activo`,!0).order(`order_index`,{ascending:!0}):{data:[],error:null};if(m)throw Error(`[rutaService] indicators: `+m.message);let h=await Promise.all((u??[]).map(e=>a(e.id,n).then(t=>({nodeId:e.id,semaphore:t.semaphore})).catch(()=>({nodeId:e.id,semaphore:`gray`})))),g=new Map(h.map(e=>[e.nodeId,e.semaphore])),_=new Map;for(let e of p??[])_.has(e.node_id)||_.set(e.node_id,[]),_.get(e.node_id).push({...e,semaphore:g.get(e.node_id)??`gray`});let v=new Map;for(let e of u??[])v.has(e.level_id)||v.set(e.level_id,[]),v.get(e.level_id).push({...e,semaphore:g.get(e.id)??`gray`,indicators:_.get(e.id)??[]});let y=new Map;for(let[e]of o.map(e=>[e]))y.set(e,[]);let b=new Map;for(let e of s??[])b.has(e.block_id)||b.set(e.block_id,[]),b.get(e.block_id).push(e);for(let[e,t]of b){let n=t.map((e,t,n)=>{let r=v.get(e.id)??[],i=r.flatMap(e=>_.get(e.id)??[]),a=i.filter(e=>(g.get(e.node_id)??`gray`)===`green`).length,o=i.length>0?Math.round(a/i.length*100):0,s=r.map(e=>e.semaphore),c=s.every(e=>e===`green`)&&s.length>0?`green`:s.every(e=>e===`gray`)||s.length===0?`gray`:`yellow`,l=!1;if(t>0){let e=n[t-1],r=(v.get(e.id)??[]).flatMap(e=>_.get(e.id)??[]),i=r.filter(e=>(g.get(e.node_id)??`gray`)===`green`).length;l=r.length>0&&i/r.length<.8}return{...e,semaphore:c,locked:l,percentage:o,nodes:r}});y.set(e,n)}return r.map(e=>({...e,levels:y.get(e.id)??[]}))}var c=new Map,l={on(e,t){c.has(e)||c.set(e,[]),c.get(e).push(t)},off(e,t){if(!c.has(e))return;let n=c.get(e),r=n.indexOf(t);r>-1&&n.splice(r,1)},emit(e,t){c.has(e)&&c.get(e).forEach(n=>{try{n(t)}catch(t){console.error(`[rutaEventEmitter] Error in listener for ${e}:`,t)}})},clearAllListeners(){c.clear()}};function u(e,t){let{blockId:n,blockName:r,isExpanded:i,childCount:a,onToggle:o}=t;e.innerHTML=`
    <div class="block-section" data-block-id="${n}">
      <div class="block-section-header" style="
        padding: 12px 16px;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
      ">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="
            display: inline-block;
            width: 20px;
            height: 20px;
            text-align: center;
            font-size: 0.75rem;
            color: #64748b;
            ${i?`transform: rotate(90deg);`:``}
            transition: transform 0.2s ease;
          ">▶</span>
          <span style="font-weight: 600; color: #1e293b;">${r}</span>
        </div>
        <span style="
          background: #e2e8f0;
          color: #475569;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 0.75rem;
          font-weight: 500;
        ">${a}</span>
      </div>

      <div class="block-section-content" style="${i?``:`display: none;`}">
        <!-- Child levels/nodes will be inserted here by parent -->
      </div>
    </div>
  `,e.querySelector(`.block-section-header`)?.addEventListener(`click`,()=>{o(n)})}var d=()=>typeof globalThis<`u`&&globalThis.getMaestroLocal?globalThis.getMaestroLocal():t(),f=(...e)=>typeof globalThis<`u`&&globalThis.getMisClases?globalThis.getMisClases(...e):r(...e),p=(...e)=>typeof globalThis<`u`&&globalThis.loadRouteTree?globalThis.loadRouteTree(...e):s(...e),m={clases:[],activeClaseId:null,rutaId:null,blocks:[],loading:!1,expandedBlocks:new Set,expandedLevels:new Set,selectedIndicator:null,onTopicSelected:null},h=!1;async function g(e,{onTopicSelected:t}={}){if(m={clases:[],activeClaseId:null,rutaId:null,blocks:[],loading:!1,expandedBlocks:new Set,expandedLevels:new Set,selectedIndicator:null,onTopicSelected:t},e.innerHTML=`<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>`,!d()){e.innerHTML=`<div class="pm-ruta-gamificada"><p class="pm-empty">No hay sesión activa.</p></div>`;return}try{if(n(),m.clases=await f(!0),!m.clases?.length){e.innerHTML=`<div class="pm-ruta-gamificada"><p class="pm-empty">No tienes clases asignadas.</p></div>`;return}m.activeClaseId=m.clases[0].id,await _(),v(e),S(e),C(e)}catch(t){console.error(`[rutaGameificadaView]`,t),e.innerHTML=`<div style="color:red;padding:20px;"><i class="bi bi-exclamation"></i> Error: ${t.message}</div>`}}async function _(){m.loading=!0,m.rutaId=await o(m.activeClaseId),m.rutaId?m.blocks=await p(m.rutaId,m.activeClaseId):m.blocks=[],m.loading=!1}function v(e){e.innerHTML=`
    <div class="pm-ruta-gamificada">
      <div class="pm-ruta-gamificada-container" style="max-width: 800px; margin: 0 auto; padding-bottom: 100px;">
        <div id="ruta-header" style="background: white; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #e2e8f0; padding: 16px;">
          <div class="d-flex align-items-center justify-content-between">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Mi Ruta</h2>
            <select id="ruta-clase-select" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #cbd5e1; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
              ${m.clases.map(e=>`<option value="${e.id}" ${e.id===m.activeClaseId?`selected`:``}>${e.nombre}</option>`).join(``)}
            </select>
          </div>
        </div>
        
        <div id="ruta-tree-area" style="padding-top: 8px;"></div>
      </div>
      <div id="ruta-action-panel"></div>
    </div>
  `;let t=e.querySelector(`#ruta-tree-area`);if(!m.rutaId){t.innerHTML=`<div style="padding:60px; text-align:center; color:#94a3b8;"><i class="bi bi-map fs-1 d-block mb-3"></i>No se encontró ruta publicada para esta clase.</div>`;return}if(m.blocks.length===0){t.innerHTML=`<div style="padding:60px; text-align:center; color:#94a3b8;">La ruta no tiene bloques configurados.</div>`;return}m.blocks.forEach(n=>{let r=document.createElement(`div`);if(t.appendChild(r),u(r,{blockId:n.id,blockName:n.nombre,isExpanded:m.expandedBlocks.has(n.id),childCount:n.levels?.length||0,onToggle:t=>{m.expandedBlocks.has(t)?m.expandedBlocks.delete(t):m.expandedBlocks.add(t),v(e)}}),m.expandedBlocks.has(n.id)){let t=r.querySelector(`.block-section-content`);n.levels.forEach(n=>{t.appendChild(y(n,e))})}}),b(e)}function y(e,t){let n=document.createElement(`div`);n.className=`pm-level-row`,n.style.cssText=`
    border-bottom: 1px solid #f1f5f9;
    background: ${e.locked?`#f8fafc`:`white`};
    opacity: ${e.locked?`0.7`:`1`};
  `;let r=m.expandedLevels.has(e.id);return n.innerHTML=`
    <div class="level-header" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: ${e.locked?`not-allowed`:`pointer`};">
      <div class="level-icon" style="width: 32px; height: 32px; border-radius: 8px; background: ${x(e.semaphore)}; display: flex; align-items: center; justify-content: center; color: white;">
        <i class="bi ${e.locked?`bi-lock-fill`:`bi-layers`}"></i>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.9rem; color: #334155;">${e.nombre}</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
          <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
            <div style="width: ${e.percentage}%; height: 100%; background: ${x(e.semaphore)}; transition: width 0.3s ease;"></div>
          </div>
          <span style="font-size: 0.65rem; font-weight: 800; color: #64748b; min-width: 30px; text-align: right;">${e.percentage}%</span>
        </div>
        <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">${e.nodes?.length||0} nodos • ${e.locked?`Bloqueado`:`Disponible`}</div>
      </div>
      ${e.locked?``:`<i class="bi bi-chevron-right" style="transition: transform 0.2s; ${r?`transform: rotate(90deg);`:``}"></i>`}
    </div>
    <div class="level-content" style="${r?`display: block;`:`display: none;`} padding: 0 16px 16px 56px;">
      ${(e.nodes||[]).map(t=>`
        <div class="node-item" style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${x(t.semaphore)};"></span>
            <span style="font-weight: 600; font-size: 0.85rem; color: #475569;">${t.nombre}</span>
          </div>
          <div class="indicators-list" style="display: flex; flex-direction: column; gap: 4px;">
            ${(t.indicators||[]).map(n=>`
              <div class="indicator-row" 
                data-id="${n.id}" 
                data-nombre="${n.nombre}"
                data-node="${t.nombre}"
                data-level="${e.nombre}"
                data-block="${m.blocks.find(t=>t.id===e.block_id)?.nombre||``}"
                style="padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; border: 1px solid ${m.selectedIndicator?.id===n.id?`#3b82f6`:`transparent`}; background: ${m.selectedIndicator?.id===n.id?`#eff6ff`:`white`}; transition: all 0.2s;"
              >
                ${n.nombre}
              </div>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    </div>
  `,e.locked||n.querySelector(`.level-header`).addEventListener(`click`,()=>{m.expandedLevels.has(e.id)?m.expandedLevels.delete(e.id):m.expandedLevels.add(e.id),v(t)}),n.querySelectorAll(`.indicator-row`).forEach(e=>{e.addEventListener(`click`,n=>{n.stopPropagation(),m.selectedIndicator={id:e.dataset.id,nombre:e.dataset.nombre,nodeNombre:e.dataset.node,levelNombre:e.dataset.level,blockNombre:e.dataset.block},v(t)})}),n}function b(e){let t=e.querySelector(`#ruta-action-panel`);if(!m.selectedIndicator){t.innerHTML=``;return}t.innerHTML=`
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); padding: 16px; z-index: 100;">
      <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div style="flex: 1; overflow: hidden;">
          <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 2px;">
            ${m.selectedIndicator.blockNombre} › ${m.selectedIndicator.levelNombre}
          </div>
          <div style="font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${m.selectedIndicator.nombre}
          </div>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-cancel-select" class="btn btn-outline-secondary btn-sm" style="border-radius: 20px; padding: 8px 16px; font-weight: 600;">Cancelar</button>
          <button id="btn-use-topic" class="btn btn-primary btn-sm" style="border-radius: 20px; padding: 8px 20px; font-weight: 600; background: #3b82f6; border-color: #3b82f6;">
            📌 Usar como tema
          </button>
        </div>
      </div>
    </div>
  `,t.querySelector(`#btn-cancel-select`).addEventListener(`click`,()=>{m.selectedIndicator=null,v(e)}),t.querySelector(`#btn-use-topic`).addEventListener(`click`,()=>{i({...m.selectedIndicator,indicatorId:m.selectedIndicator.id,claseId:m.activeClaseId}),m.onTopicSelected&&m.onTopicSelected(m.activeClaseId)})}function x(e){switch(e){case`green`:return`#22c55e`;case`yellow`:return`#eab308`;case`gray`:return`#94a3b8`;default:return`#94a3b8`}}function S(e){e.querySelector(`#ruta-clase-select`)?.addEventListener(`change`,async t=>{m.activeClaseId=t.target.value,e.innerHTML=`<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>`,await _(),v(e),S(e)})}function C(e){h||(h=!0,l.on(`node-covered`,()=>{_().then(()=>{v(e),S(e)})}))}export{g as renderRutaGameificadaView};