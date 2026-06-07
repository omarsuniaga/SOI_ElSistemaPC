import{i as e}from"./supabase-BryBf0UA.js";import{t}from"./AppToast-BfOaB9z8.js";import{i as n}from"./portalUtils-d8JQ9zxl.js";import{t as r}from"./AppModal-Cd47jEcw.js";import{i,t as a}from"./planningService-s-tkfwT4.js";import{r as o,s}from"./curriculumAdminService-DG-1Anrw.js";async function c(e,t={}){let{claseId:n=null,desde:r=null,hasta:i=null,limit:a=50}=t,[o,s]=await Promise.all([l(e,{claseId:n,desde:r,hasta:i}),u(e,{claseId:n,desde:r,hasta:i})]);if(o.error)throw o.error;if(s.error)throw s.error;let c=[...d(o.data??[],{claseId:n,desde:r,hasta:i}),...f(s.data??[])];return c.sort((e,t)=>{let n=t.fecha.localeCompare(e.fecha);return n===0?t.created_at.localeCompare(e.created_at):n}),c.slice(0,a)}function l(t,{claseId:n}){return e.from(`observaciones_sesion`).select(`
      id, contenido_raw, contenido_ia_dsl, created_at,
      sesiones_clase!observaciones_sesion_sesion_id_fkey(
        id, fecha, clase_id,
        clases(nombre, instrumento)
      )
    `).eq(`maestro_id`,t).eq(`es_borrador`,!1)}function u(t,{claseId:n,desde:r,hasta:i}){let a=e.from(`indicator_sessions`).select(`
      id, fecha, descripcion, calificacion, clase_id, created_at,
      nodes(id, name, type),
      clases(nombre, instrumento)
    `).eq(`maestro_id`,t);return n&&(a=a.eq(`clase_id`,n)),r&&(a=a.gte(`fecha`,r)),i&&(a=a.lte(`fecha`,i)),a}function d(e,{claseId:t=null,desde:n=null,hasta:r=null}={}){return e.map(e=>{let i=Array.isArray(e.sesiones_clase)?e.sesiones_clase[0]:e.sesiones_clase;if(!i||t&&i.clase_id!==t||n&&i.fecha<n||r&&i.fecha>r)return null;let a=Array.isArray(i.clases)?i.clases[0]:i.clases;return{id:e.id,type:`observacion`,fecha:i.fecha??``,clase_id:i.clase_id??``,clase_nombre:a?.nombre??``,clase_instrumento:a?.instrumento??``,contenido_raw:e.contenido_raw??null,contenido_ia_dsl:e.contenido_ia_dsl??null,node_id:null,node_name:null,node_type:null,descripcion:null,calificacion:null,estado:`sin_planificar`,created_at:e.created_at??``}}).filter(Boolean)}function f(e){return e.map(e=>{let t=Array.isArray(e.nodes)?e.nodes[0]:e.nodes,n=Array.isArray(e.clases)?e.clases[0]:e.clases;return{id:e.id,type:`indicador`,fecha:e.fecha??``,clase_id:e.clase_id??``,clase_nombre:n?.nombre??``,clase_instrumento:n?.instrumento??``,contenido_raw:null,contenido_ia_dsl:null,node_id:t?.id??null,node_name:t?.name??null,node_type:t?.type??null,descripcion:e.descripcion??null,calificacion:e.calificacion??null,estado:`registrado`,created_at:e.created_at??``}})}var p=`
<style>
  .pm-ht-filters {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding: 0.75rem 0.9rem;
    background: var(--pm-surface-2, #f8f9fa);
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 10px;
  }
  .pm-ht-filters select,
  .pm-ht-filters label {
    font-size: 0.88rem;
    color: var(--pm-text, #1e293b);
  }
  .pm-ht-filters select {
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 7px;
    background: var(--pm-surface, #fff);
    cursor: pointer;
  }
  .pm-ht-filters label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
  }

  .pm-ht-card {
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 12px;
    padding: 0.9rem 1rem;
    margin-bottom: 0.65rem;
    background: var(--pm-surface, #fff);
    transition: box-shadow 0.15s;
  }
  .pm-ht-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  }
  .pm-ht-card.sin-planificar {
    background: rgba(251,191,36,0.06);
  }
  .pm-ht-card.registrado {
    background: rgba(74,222,128,0.06);
  }

  .pm-ht-card-header {
    font-size: 0.82rem;
    color: var(--pm-text-muted, #64748b);
    margin-bottom: 0.45rem;
  }
  .pm-ht-card-body {
    font-size: 0.92rem;
    color: var(--pm-text, #1e293b);
    margin-bottom: 0.6rem;
    line-height: 1.5;
  }
  .pm-ht-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .pm-ht-estado {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border-radius: 20px;
  }
  .pm-ht-estado.sin-planificar {
    background: rgba(251,191,36,0.18);
    color: #92400e;
  }
  .pm-ht-estado.registrado {
    background: rgba(74,222,128,0.2);
    color: #166534;
  }

  .pm-ht-btn-promover {
    padding: 0.4rem 0.9rem;
    min-height: 36px;
    font-size: 0.84rem;
    font-weight: 600;
    background: var(--pm-primary, #6366f1);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .pm-ht-btn-promover:hover {
    opacity: 0.88;
  }

  .pm-ht-empty {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--pm-text-muted, #64748b);
    font-size: 0.92rem;
  }

  .pm-ht-modal-excerpt {
    background: var(--pm-surface-2, #f8f9fa);
    border-left: 3px solid var(--pm-border, #e2e8f0);
    border-radius: 0 6px 6px 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.88rem;
    color: var(--pm-text, #1e293b);
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  .pm-ht-modal-section {
    margin-bottom: 1rem;
  }
  .pm-ht-modal-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
    color: var(--pm-text-muted, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .pm-ht-modal-search {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    box-sizing: border-box;
  }
  .pm-ht-node-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 8px;
    padding: 0.35rem 0;
  }
  .pm-ht-node-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    font-size: 0.88rem;
  }
  .pm-ht-node-item:hover {
    background: var(--pm-surface-2, #f8f9fa);
  }
  .pm-ht-node-item input[type=radio] {
    cursor: pointer;
  }
  .pm-ht-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.9rem 0;
    color: var(--pm-text-muted, #64748b);
    font-size: 0.82rem;
  }
  .pm-ht-divider::before,
  .pm-ht-divider::after {
    content: '';
    flex: 1;
    border-top: 1px solid var(--pm-border, #e2e8f0);
  }
  .pm-ht-calificacion {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .pm-ht-cal-label {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .pm-ht-cal-label:hover {
    background: var(--pm-surface-2, #f8f9fa);
  }
  .pm-ht-modal-error {
    color: #dc2626;
    font-size: 0.83rem;
    margin-top: 0.5rem;
    display: none;
  }
  .pm-ht-new-node-input {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 8px;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    .pm-ht-filters {
      gap: 0.5rem;
      padding: 0.6rem 0.75rem;
    }
    .pm-ht-card {
      padding: 0.75rem 0.8rem;
    }
    .pm-ht-card-footer {
      flex-direction: column;
      align-items: flex-start;
    }
    .pm-ht-btn-promover {
      width: 100%;
      text-align: center;
    }
  }
</style>
`;async function m(e,{maestroId:l,claseId:u,publishedRouteVersionId:d,onPromoted:f}){let m=[],h=`todos`,g=!1;e.innerHTML=p+`<div class="pm-ht-empty"><p>Cargando historial…</p></div>`;try{m=await c(l,{claseId:u})}catch(t){console.error(`[PlanningHistorialPane] Error fetching historial:`,t),e.innerHTML=p+`<div class="pm-ht-empty"><p>No se pudo cargar el historial.</p></div>`;return}_();function _(){let t=v(m),n=t.length===0?`<div class="pm-ht-empty"><p>No hay registros que coincidan con los filtros.</p></div>`:t.map(e=>y(e)).join(``);e.querySelector(`style`),e.innerHTML=p+`
      <div class="pm-ht-filters">
        <select id="pm-ht-tipo">
          <option value="todos"${h===`todos`?` selected`:``}>Tipo: Todos</option>
          <option value="observacion"${h===`observacion`?` selected`:``}>Solo observaciones</option>
          <option value="indicador"${h===`indicador`?` selected`:``}>Solo indicadores</option>
        </select>
        <label>
          <input type="checkbox" id="pm-ht-sinplan"${g?` checked`:``} />
          Solo sin planificar
        </label>
      </div>
      <div id="pm-ht-list">${n}</div>
    `,b()}function v(e){return e.filter(e=>!(h!==`todos`&&e.type!==h||g&&e.estado!==`sin_planificar`))}function y(e){let t=C(e.fecha),r=e.estado===`sin_planificar`?`sin-planificar`:`registrado`;if(e.type===`observacion`){let i=e.contenido_raw||e.contenido_ia_dsl||``,a=i.slice(0,120)+(i.length>120?`…`:``);return`
        <div class="pm-ht-card ${r}" data-id="${n(e.id)}">
          <div class="pm-ht-card-header">📅 ${n(t)} · ${n(e.clase_nombre)}</div>
          <div class="pm-ht-card-body">${a?`"${n(a)}"`:`<em>Sin contenido</em>`}</div>
          <div class="pm-ht-card-footer">
            <span class="pm-ht-estado ${r}">
              ${e.estado===`sin_planificar`?`○ Sin planificar`:`✅ Registrado en ruta`}
            </span>
            ${e.estado===`sin_planificar`?`<button class="pm-ht-btn-promover" data-action="promover" data-id="${n(e.id)}">+ Promover</button>`:``}
          </div>
        </div>
      `}let i={bien:`🟢`,regular:`🟡`,mal:`🔴`}[e.calificacion??``]??``,a={bien:`Bien`,regular:`Regular`,mal:`Mal`}[e.calificacion??``]??e.calificacion??``,o=e.descripcion?e.descripcion.slice(0,100)+(e.descripcion.length>100?`…`:``):``;return`
      <div class="pm-ht-card ${r}" data-id="${n(e.id)}">
        <div class="pm-ht-card-header">
          📅 ${n(t)} · ${n(e.clase_nombre)}${e.clase_instrumento?` · 🎻 ${n(e.clase_instrumento)}`:``}
          ${e.node_name?` · <strong>${n(e.node_name)}</strong>`:``}
        </div>
        ${e.calificacion?`<div class="pm-ht-card-body">Calificación: ${i} ${n(a)}</div>`:``}
        ${o?`<div class="pm-ht-card-body" style="font-size:0.85rem;color:var(--pm-text-muted);">${n(o)}</div>`:``}
        <div class="pm-ht-card-footer">
          <span class="pm-ht-estado ${r}">
            ${e.estado===`sin_planificar`?`○ Sin planificar`:`✅ Registrado en ruta`}
          </span>
        </div>
      </div>
    `}function b(){e.querySelector(`#pm-ht-tipo`)?.addEventListener(`change`,e=>{h=e.target.value,_()}),e.querySelector(`#pm-ht-sinplan`)?.addEventListener(`change`,e=>{g=e.target.checked,_()}),e.querySelectorAll(`[data-action="promover"]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.id,n=m.find(e=>e.id===t);n&&x(n)})})}async function x(c){if(!d){t.error(`Seleccioná una clase con ruta publicada para promover este contenido.`);return}let p=[];try{p=await i(d)}catch(e){console.error(`[PlanningHistorialPane] Error loading hierarchy:`,e),t.error(`No se pudo cargar la ruta. Intentá de nuevo.`);return}let h=p.flatMap(e=>(e.levels??[]).flatMap(e=>(e.nodes??[]).map(e=>({id:e.id,name:e.name??``})))),g=c.contenido_raw||c.contenido_ia_dsl||``,_=g.slice(0,150)+(g.length>150?`…`:``),v=`
      <div class="pm-ht-modal-excerpt">${_?n(_):`<em>Sin contenido de texto</em>`}</div>

      <div class="pm-ht-modal-section">
        <span class="pm-ht-modal-label">¿Corresponde a un nodo existente?</span>
        <input
          type="text"
          id="pm-ht-node-search"
          class="pm-ht-modal-search"
          placeholder="🔍 Buscar nodo…"
        />
        <div class="pm-ht-node-list" id="pm-ht-node-list">
          ${S(h)}
        </div>
      </div>

      <div class="pm-ht-modal-section">
        <span class="pm-ht-modal-label">Calificación</span>
        <div class="pm-ht-calificacion">
          <label class="pm-ht-cal-label"><input type="radio" name="pm-ht-cal" value="bien" /> 🟢 Bien</label>
          <label class="pm-ht-cal-label"><input type="radio" name="pm-ht-cal" value="regular" /> 🟡 Regular</label>
          <label class="pm-ht-cal-label"><input type="radio" name="pm-ht-cal" value="mal" /> 🔴 Mal</label>
        </div>
      </div>

      <div class="pm-ht-divider">ó</div>

      <div class="pm-ht-modal-section">
        <span class="pm-ht-modal-label">+ Crear nuevo nodo en mi borrador</span>
        <input
          type="text"
          id="pm-ht-new-node"
          class="pm-ht-new-node-input"
          placeholder="Nombre del nuevo nodo…"
        />
      </div>

      <div class="pm-ht-modal-error" id="pm-ht-modal-error">Seleccioná un nodo existente o escribí un nombre para crear uno nuevo.</div>
    `;r.open({title:`Registrar en la ruta`,size:`md`,body:v,saveText:`Guardar`,onSave:async n=>{n.querySelector(`#pm-ht-node-search`);let r=n.querySelector(`#pm-ht-node-list`),i=n.querySelector(`#pm-ht-new-node`),h=n.querySelector(`#pm-ht-modal-error`),g=n.querySelector(`input[name="pm-ht-cal"]:checked`),_=r?.querySelector(`input[type=radio]:checked`)?.value??null,v=i?.value?.trim()??``,y=g?.value??null;if(!_&&!v)return h&&(h.style.display=`block`),!1;h&&(h.style.display=`none`);try{let n=_,r=d;if(!_&&v){let e=await s(d);r=e;let i=p[0]?.levels?.[0];if(!i)return t.error(`La ruta no tiene niveles. Agregá un nivel desde la pestaña Gestionar.`),!1;let a=await o({levelId:i.id,routeVersionId:e,name:v});n=a?.id??a}await a({maestroId:l,routeVersionId:r,nodeId:n,claseId:u,fecha:c.fecha,descripcion:c.contenido_raw?.slice(0,200)??null,calificacion:y,estudianteIds:[],notasIndividuales:{}});let i=m.findIndex(e=>e.id===c.id);i!==-1&&(m[i]={...m[i],estado:`registrado`});let h=e.querySelector(`.pm-ht-card[data-id="${CSS.escape(c.id)}"]`);if(h){h.classList.remove(`sin-planificar`),h.classList.add(`registrado`);let e=h.querySelector(`.pm-ht-estado`);e&&(e.className=`pm-ht-estado registrado`,e.textContent=`✅ Registrado en ruta`),h.querySelector(`[data-action="promover"]`)?.remove()}t.success(`Contenido registrado en la ruta.`),f?.()}catch(e){return console.error(`[PlanningHistorialPane] Error promoviendo:`,e),t.error(`No se pudo registrar el contenido. Intentá de nuevo.`),!1}}}),requestAnimationFrame(()=>{let e=document.getElementById(`pm-ht-node-search`),t=document.getElementById(`pm-ht-node-list`);e&&t&&e.addEventListener(`input`,()=>{let n=e.value.toLowerCase();t.innerHTML=S(n?h.filter(e=>e.name.toLowerCase().includes(n)):h)})})}function S(e){return e.length===0?`<div style="padding:0.5rem 0.75rem; font-size:0.85rem; color:var(--pm-text-muted);">Sin resultados</div>`:e.map(e=>`
        <label class="pm-ht-node-item">
          <input type="radio" name="pm-ht-node" value="${n(e.id)}" />
          ${n(e.name)}
        </label>
      `).join(``)}function C(e){if(!e)return``;try{return new Date(e+`T00:00:00`).toLocaleDateString(`es-AR`,{day:`numeric`,month:`short`})}catch{return e}}}export{m as renderPlanningHistorialPane};