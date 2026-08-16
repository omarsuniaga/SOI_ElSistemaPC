import{i as e}from"./AppModal-Du6jXNYA.js";import{a as t,c as n,i as r,l as i,m as a,n as o,o as s,p as c,r as l,s as u,t as d,u as f}from"./pwaInstaller-DKgXOIzT.js";import{i as p}from"./supabase-Cgh_dhNB.js";import{i as m}from"./maestroAuth-BMzDPnai.js";import{t as h}from"./groqService-BEo2aU8D.js";import{t as g}from"./academicService-DqQGbV03.js";import{a as _,i as v,o as y,r as b}from"./portalUtils-CkF82Yyk.js";import{a as x,i as S,n as C,r as w,s as T,t as E}from"./maestroRouteService-Bb_DSTf4.js";import{u as D}from"./weeklyPlanAdapter-E65PNMYx.js";import{t as O}from"./catalogService-M5LBxZnn.js";import{t as k}from"./claseEmergenteModal-DzBloOSJ.js";import{t as A}from"./claseAnalysisModal-D4_bAre7.js";var j=0;function M(e=`tmp`){return j+=1,`${e}-${Date.now()}-${j}`}function N({maestroId:t,claseId:n,route:r=null,onSaved:i}={}){if(!t||!n){e.error(`Falta identificar al maestro o la clase`);return}let a={routeId:r?.id||null,nombre:r?.nombre||``,unidades:F(r?.unidades||[])},o=document.createElement(`div`);o.className=`trb-backdrop`,o.innerHTML=`
    <div class="trb-modal" role="dialog" aria-modal="true" aria-label="Mapa de rutas">
      <div class="trb-header">
        <div class="trb-header-titles">
          <h3>${r?`Editar`:`Nuevo`} mapa de rutas</h3>
          <span class="trb-header-subtitle" id="trb-header-subtitle"></span>
        </div>
        <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="trb-body">
        <label class="trb-field">
          <span>Nombre de la ruta</span>
          <input type="text" class="trb-input" id="trb-nombre" placeholder="Ej. Violín Nivel 1 — Grupo A" value="${v(a.nombre)}" />
        </label>

        <div class="trb-actions-row">
          <button class="trb-btn trb-btn-secondary" id="trb-btn-clonar" ${r?``:`disabled title="Guarda primero para poder clonar"`}>
            <i class="bi bi-copy"></i> Clonar esta ruta
          </button>
          <button class="trb-btn trb-btn-secondary" id="trb-btn-acm" disabled title="Próximamente: el catálogo institucional ACM aún no está disponible en esta versión">
            <i class="bi bi-diagram-3"></i> Importar desde ACM (próximamente)
          </button>
        </div>

        <div class="trb-unidades" id="trb-unidades"></div>

        <button class="trb-btn trb-btn-add-unidad" id="trb-add-unidad">
          <i class="bi bi-plus-circle"></i> Agregar Unidad
        </button>
      </div>
      <div class="trb-footer">
        <button class="trb-btn trb-btn-ghost" id="trb-cancelar">Cancelar</button>
        <button class="trb-btn trb-btn-primary" id="trb-guardar">
          <i class="bi bi-check2"></i> Guardar ruta
        </button>
      </div>
    </div>
  `,document.body.appendChild(o);let s=()=>o.remove();o.querySelector(`.trb-close`).addEventListener(`click`,s),o.querySelector(`#trb-cancelar`).addEventListener(`click`,s),o.addEventListener(`click`,e=>{e.target===o&&s()});let c=o.querySelector(`#trb-unidades`),l=o.querySelector(`#trb-header-subtitle`),d=new Set,f=new Set,p=null;function m(){let e=a.unidades.length,t=a.unidades.reduce((e,t)=>e+t.objetivos.length,0),n=g().length;l.textContent=e?`${e} unidad${e===1?``:`es`} · ${t} objetivo${t===1?``:`s`} · ${n} indicador${n===1?``:`es`}`:`Todavía no tiene unidades`}function h(){c.innerHTML=a.unidades.map((e,t)=>_(e,t)).join(``),S(),m()}function g(){let e=[];return a.unidades.forEach(t=>{t.objetivos.forEach(t=>{t.indicadores.forEach(t=>{e.push({id:t._localId,nombre:t.nombre||`(sin nombre)`})})})}),e}function _(e,t){let n=d.has(e._localId),r=e.objetivos.length,i=e.objetivos.reduce((e,t)=>e+t.indicadores.length,0);return`
      <div class="trb-unidad ${n?`trb-expanded`:``}" data-ui="${t}">
        <div class="trb-card-header" data-role="toggle-unidad" data-ui="${t}">
          <button class="trb-chevron" data-role="toggle-unidad" data-ui="${t}" aria-expanded="${n}" aria-label="${n?`Colapsar`:`Expandir`} unidad">
            <i class="bi bi-chevron-right"></i>
          </button>
          <span class="trb-badge-orden">U${t+1}</span>
          <input type="text" class="trb-input trb-input-ghost trb-input-inline" data-role="unidad-nombre" data-ui="${t}"
                 placeholder="Nombre de la unidad" value="${v(e.nombre)}" />
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
                      placeholder="Ej. El alumno domina el agarre correcto del arco y la postura corporal base.">${v(e.descripcion||``)}</textarea>
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
                 placeholder="Nombre del objetivo" value="${v(t.nombre)}" />
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
                 placeholder="Nombre del indicador" value="${v(e.nombre)}" />
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
                ${v(i.nombre)}
              </button>
            `).join(``):`<p class="trb-prereq-empty">Todavía no hay otros indicadores en esta ruta.</p>`}
      </div>`:``;return`
      <div class="trb-prereq" data-ui="${t}" data-oi="${n}" data-ii="${r}">
        <span class="trb-prereq-label"><i class="bi bi-link-45deg"></i> Prerrequisito</span>
        <div class="trb-prereq-control">
          ${a?`
            <button class="trb-prereq-chip" data-role="prereq-toggle" data-ui="${t}" data-oi="${n}" data-ii="${r}" title="Cambiar prerrequisito">
              ${v(a.nombre)}
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
    `}function S(){c.querySelectorAll(`[data-role="toggle-unidad"]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=a.unidades[+e.dataset.ui]._localId;d.has(n)?d.delete(n):d.add(n),h()})}),c.querySelectorAll(`[data-role="toggle-objetivo"]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let{ui:n,oi:r}=e.dataset,i=a.unidades[+n].objetivos[+r]._localId;f.has(i)?f.delete(i):f.add(i),h()})}),c.querySelectorAll(`[data-role="unidad-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{a.unidades[+e.dataset.ui].nombre=e.value}),e.addEventListener(`click`,e=>e.stopPropagation())}),c.querySelectorAll(`[data-role="unidad-descripcion"]`).forEach(e=>{e.addEventListener(`input`,()=>{a.unidades[+e.dataset.ui].descripcion=e.value})}),c.querySelectorAll(`[data-role="objetivo-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{a.unidades[+e.dataset.ui].objetivos[+e.dataset.oi].nombre=e.value}),e.addEventListener(`click`,e=>e.stopPropagation())}),c.querySelectorAll(`[data-role="indicador-nombre"]`).forEach(e=>{e.addEventListener(`input`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;a.unidades[+t].objetivos[+n].indicadores[+r].nombre=e.value,h()})}),c.querySelectorAll(`[data-role="prereq-toggle"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset,i=a.unidades[+t].objetivos[+n].indicadores[+r]._localId;p=p===i?null:i,h()})}),c.querySelectorAll(`[data-role="prereq-pick"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r,value:i}=e.dataset;a.unidades[+t].objetivos[+n].indicadores[+r].prerequisito_local_id=i||null,p=null,h()})}),c.querySelectorAll(`[data-role="prereq-clear"]`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;a.unidades[+t].objetivos[+n].indicadores[+r].prerequisito_local_id=null,p=null,h()})}),c.querySelectorAll(`[data-role="add-objetivo"]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=E();a.unidades[+e.dataset.ui].objetivos.push(t),f.add(t._localId),h()})}),c.querySelectorAll(`[data-role="add-indicador"]`).forEach(e=>{e.addEventListener(`click`,()=>{a.unidades[+e.dataset.ui].objetivos[+e.dataset.oi].indicadores.push(D()),h()})}),c.querySelectorAll(`.trb-remove-unidad`).forEach(e=>{e.addEventListener(`click`,()=>{a.unidades.splice(+e.dataset.ui,1),h()})}),c.querySelectorAll(`.trb-remove-objetivo`).forEach(e=>{e.addEventListener(`click`,()=>{a.unidades[+e.dataset.ui].objetivos.splice(+e.dataset.oi,1),h()})}),c.querySelectorAll(`.trb-remove-indicador`).forEach(e=>{e.addEventListener(`click`,()=>{let{ui:t,oi:n,ii:r}=e.dataset;a.unidades[+t].objetivos[+n].indicadores.splice(+r,1),h()})})}function E(){return{_localId:M(`obj`),nombre:``,indicadores:[]}}function D(){return{_localId:M(`ind`),nombre:``,prerequisito_local_id:null}}o.querySelector(`#trb-add-unidad`).addEventListener(`click`,()=>{let e={_localId:M(`uni`),nombre:``,descripcion:``,objetivos:[]};a.unidades.push(e),d.add(e._localId),h()}),o.querySelector(`#trb-nombre`).addEventListener(`input`,e=>{a.nombre=e.target.value}),o.querySelector(`#trb-btn-clonar`).addEventListener(`click`,async()=>{if(!a.routeId)return;let t=(await u()||[]).filter(e=>e.id!==n);if(t.length===0){e.error(`No tienes otra clase disponible para clonar esta ruta`);return}let r=await L(t);if(!r)return;let o=window.prompt(`Nombre para la ruta clonada:`,`Copia de ${a.nombre}`);if(o)try{let t=await C(a.routeId,o,r);e.success(`Ruta clonada correctamente`),s(),i?.(t)}catch(t){let n=t.message?.includes(`duplicate key`)||t.message?.includes(`23505`);e.error(n?`Esa clase ya tiene una ruta propia — no se puede clonar encima`:`No se pudo clonar la ruta: ${t.message}`)}}),o.querySelector(`#trb-guardar`).addEventListener(`click`,async()=>{if(!a.nombre.trim()){e.error(`Ponle un nombre a la ruta antes de guardar`);return}if(a.unidades.length===0){e.error(`Agrega al menos una unidad`);return}if(a.unidades.some(e=>!e.nombre.trim()||e.objetivos.length===0)){e.error(`Cada unidad necesita nombre y al menos un objetivo`);return}let r=I(a.unidades),c=o.querySelector(`#trb-guardar`);c.disabled=!0,c.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Guardando…`;try{let o=a.routeId?await T(a.routeId,r):await w(t,n,a.nombre.trim(),r);e.success(`Ruta guardada`),s(),i?.(o)}catch(t){e.error(`No se pudo guardar la ruta: ${t.message}`),c.disabled=!1,c.innerHTML=`<i class="bi bi-check2"></i> Guardar ruta`}}),h()}async function P(e,t,n){let r=await x(e,t);if(!r||r.length===0){N({maestroId:e,claseId:t,onSaved:n});return}let i=document.createElement(`div`);i.className=`trb-backdrop`,i.innerHTML=`
    <div class="trb-modal trb-modal-sm" role="dialog" aria-modal="true">
      <div class="trb-header">
        <h3>Tus rutas para esta clase</h3>
        <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="trb-body">
        <div class="trb-route-list">
          ${r.map(e=>`
            <button class="trb-route-item" data-route-id="${e.id}">
              <span class="trb-route-nombre">${v(e.nombre)}</span>
              <span class="trb-route-meta">${e.unidades.length} unidades</span>
            </button>
          `).join(``)}
        </div>
        <button class="trb-btn trb-btn-add-unidad" id="trb-nueva-ruta">
          <i class="bi bi-plus-circle"></i> Crear ruta nueva
        </button>
      </div>
    </div>
  `,document.body.appendChild(i);let a=()=>i.remove();i.querySelector(`.trb-close`).addEventListener(`click`,a),i.addEventListener(`click`,e=>{e.target===i&&a()}),i.querySelector(`#trb-nueva-ruta`).addEventListener(`click`,()=>{a(),N({maestroId:e,claseId:t,onSaved:n})}),i.querySelectorAll(`.trb-route-item`).forEach(i=>{i.addEventListener(`click`,()=>{let o=r.find(e=>e.id===i.dataset.routeId);a(),N({maestroId:e,claseId:t,route:o,onSaved:n})})})}function F(e){let t=new Map,n=e.map(e=>({...e,_localId:M(`uni`),objetivos:(e.objetivos||[]).map(e=>({...e,_localId:M(`obj`),indicadores:(e.indicadores||[]).map(e=>{let n=M(`ind`);return t.set(e.id,n),{...e,_localId:n}})}))}));return n.forEach(e=>e.objetivos.forEach(e=>e.indicadores.forEach(e=>{e.prerequisito_local_id=e.prerequisito_indicador_id&&t.get(e.prerequisito_indicador_id)||null}))),n}function I(e){return e.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),descripcion:e.descripcion?.trim()||null,objetivos:e.objetivos.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),indicadores:e.indicadores.map((e,t)=>({id:e._localId,orden:t,nombre:e.nombre.trim(),prerequisito_indicador_id:e.prerequisito_local_id||null}))}))}))}function L(e){return new Promise(t=>{let n=document.createElement(`div`);n.className=`trb-backdrop`,n.innerHTML=`
      <div class="trb-modal trb-modal-sm" role="dialog" aria-modal="true">
        <div class="trb-header">
          <h3>Clonar hacia qué clase</h3>
          <button class="trb-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="trb-body">
          <div class="trb-route-list">
            ${e.map(e=>`
              <button class="trb-route-item" data-clase-id="${e.id}">
                <span class="trb-route-nombre">${v(e.nombre)}</span>
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
  `,document.head.appendChild(e)}async function R({claseId:n,fecha:r,indicadorId:i,indicadorNombre:o,breadcrumb:s=``,evaluadoPor:l,onSaved:u}={}){if(!n||!r||!i){e.error(`Faltan datos para abrir la calificación del indicador`);return}let f=document.createElement(`div`);f.className=`igm-backdrop`,f.innerHTML=`
    <div class="igm-modal" role="dialog" aria-modal="true" aria-label="Calificaciones">
      <div class="igm-header">
        <div>
          ${s?`<div class="igm-breadcrumb">${v(s)}</div>`:``}
          <h3>${v(o||`Indicador`)}</h3>
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
  `,document.body.appendChild(f);let p=!1,m=()=>{f.remove(),p&&u?.()};f.querySelector(`.igm-close`).addEventListener(`click`,m),f.addEventListener(`click`,e=>{e.target===f&&m()});let g=f.querySelector(`.igm-body`),_=new Map;try{let[s,u,y,b]=await Promise.all([O(n),d(n,r),t(i,n),S(i)]);y.forEach(e=>_.set(e.alumno_id,e));let x=new Set(u.presentes),C=new Set(u.ausentes),w=Object.fromEntries(s.map(e=>[e.id,e]));if(x.size===0&&C.size===0){g.innerHTML=`
        <div class="igm-empty">
          <i class="bi bi-clipboard-x"></i>
          <p>No hay asistencia registrada para el ${v(r)}.</p>
          <p class="igm-empty-sub">Pasa asistencia primero para poder calificar este indicador.</p>
        </div>
      `;return}let T={};if(b){let e=await Promise.all([...x].map(async e=>[e,await E(b.id,e,n)]));T=Object.fromEntries(e)}function D(e){let t=w[e];if(!t)return``;let n=_.get(e)||{},r=n.nota||0,i=b&&!T[e],a=!!n.review_flag;return`
        <div class="igm-alumno-row" data-alumno-id="${e}">
          <div class="igm-alumno-info">
            <span class="igm-alumno-nombre">${v(t.nombre)}</span>
            ${i?`<span class="igm-warn-badge" title="Prerrequisito no satisfecho"><i class="bi bi-exclamation-triangle-fill"></i> Requiere "${v(b.nombre)}"</span>`:``}
            ${a?`<span class="igm-review-badge" title="Recalificado el prerrequisito, revisa esta nota"><i class="bi bi-arrow-repeat"></i> Revisar</span>`:``}
          </div>
          <div class="igm-stars" data-alumno-id="${e}">
            ${[1,2,3,4,5].map(e=>`<button class="igm-star ${e<=r?`igm-star-filled`:``}" data-value="${e}" aria-label="${e} estrellas"><i class="bi bi-star-fill"></i></button>`).join(``)}
          </div>
        </div>
      `}function k(e){let t=w[e];if(!t)return``;let n=_.get(e)||{};if(n.recovery_status===`recuperado`||n.recovery_status===`no_recuperable`){let r=n.recovery_status===`recuperado`?`Recuperado`:`No recuperable`,i=n.recovery_status===`recuperado`?`igm-recuperado`:`igm-no-recuperable`;return`
          <div class="igm-alumno-row" data-alumno-id="${e}">
            <div class="igm-alumno-info">
              <span class="igm-alumno-nombre">${v(t.nombre)}</span>
            </div>
            <span class="igm-deuda-resuelta ${i}"><i class="bi bi-check-circle-fill"></i> ${r}</span>
          </div>
        `}return`
        <div class="igm-alumno-row igm-alumno-row-deuda" data-alumno-id="${e}">
          <div class="igm-alumno-info">
            <span class="igm-alumno-nombre">${v(t.nombre)}</span>
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
      `}g.innerHTML=`
      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-people-fill"></i> Presentes</h4>
        <div class="igm-alumno-list" id="igm-presentes">
          ${[...x].map(D).join(``)||`<p class="igm-empty-inline">Sin alumnos presentes</p>`}
        </div>
      </div>

      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-exclamation-circle-fill"></i> Con Deudas Académicas</h4>
        <div class="igm-alumno-list" id="igm-ausentes">
          ${[...C].map(k).join(``)||`<p class="igm-empty-inline">Nadie ausente esta sesión</p>`}
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
    `;function A(){let e=[...x].every(e=>(_.get(e)||{}).nota),t=[...C].every(e=>{let t=(_.get(e)||{}).recovery_status;return t===`recuperado`||t===`no_recuperable`}),n=f.querySelector(`#igm-completar`),r=e&&t;n.disabled=!r,n.classList.toggle(`igm-btn-success`,r),r&&(n.innerHTML=`<i class="bi bi-check2-all"></i> Indicador completamente evaluado`)}function j(){g.querySelectorAll(`.igm-stars`).forEach(t=>{let r=t.dataset.alumnoId;t.querySelectorAll(`.igm-star`).forEach(a=>{a.addEventListener(`click`,async()=>{let o=Number(a.dataset.value);t.querySelectorAll(`.igm-star`).forEach(e=>{e.classList.toggle(`igm-star-filled`,Number(e.dataset.value)<=o)});try{let e=await c({alumnoId:r,indicadorId:i,claseId:n,nota:o,evaluadoPor:l});_.set(r,{..._.get(r)||{},...e,nota:o}),p=!0,A()}catch(t){e.error(`No se pudo guardar: ${t.message}`)}})})})}function M(){g.querySelectorAll(`.igm-btn-deuda`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.alumnoId,n=g.querySelector(`.igm-recovery-form[data-alumno-id="${t}"]`);n&&(n.hidden=!n.hidden)})}),g.querySelectorAll(`.igm-recovery-cancel`).forEach(e=>{e.addEventListener(`click`,()=>{let t=g.querySelector(`.igm-recovery-form[data-alumno-id="${e.dataset.alumnoId}"]`);t&&(t.hidden=!0)})}),g.querySelectorAll(`.igm-recovery-confirm`).forEach(t=>{t.addEventListener(`click`,async()=>{let r=t.dataset.alumnoId,o=g.querySelector(`.igm-recovery-select[data-alumno-id="${r}"]`),s=g.querySelector(`.igm-recovery-notes[data-alumno-id="${r}"]`),c=o.value,u=s.value.trim();t.disabled=!0;try{let t=await a(r,i,n,c,u,null,l);_.set(r,{..._.get(r)||{},...t,recovery_status:c}),p=!0;let o=g.querySelector(`.igm-alumno-row-deuda[data-alumno-id="${r}"]`),s=g.querySelector(`.igm-recovery-form[data-alumno-id="${r}"]`);o&&(o.outerHTML=k(r)),s&&s.remove(),e.success(`Recuperación registrada`),A()}catch(n){e.error(`No se pudo registrar la recuperación: ${n.message}`),t.disabled=!1}})})}function N(){let t=g.querySelector(`#igm-observaciones`),r=g.querySelector(`#igm-analizar`),a=g.querySelector(`#igm-analisis-resultado`);t.addEventListener(`input`,()=>{r.disabled=!t.value.trim()}),r.addEventListener(`click`,async()=>{let s=t.value.trim();if(s){r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Analizando…`;try{let t=await h(s,{indicadorNombre:o,estudiantesPresentes:[...x].map(e=>w[e]?.nombre).filter(Boolean)});if(a.hidden=!1,a.innerHTML=`
            <div class="igm-panorama"><i class="bi bi-lightbulb-fill"></i> ${v(t.panorama)}</div>
            ${t.sugerirCalificarConEstrellas?`
              <div class="igm-sugerencia-estrellas">
                <p>El texto no trae una valoración clara. ¿Cómo calificarías el resultado de la clase para los presentes?</p>
                <div class="igm-stars igm-stars-grupal" id="igm-stars-grupal">
                  ${[1,2,3,4,5].map(e=>`<button class="igm-star" data-value="${e}" aria-label="${e} estrellas"><i class="bi bi-star-fill"></i></button>`).join(``)}
                </div>
                <p class="igm-sugerencia-nota">Se aplicará solo a los ${x.size} alumnos presentes. Los ausentes seguirán "Con Deuda Académica".</p>
              </div>
            `:``}
          `,t.sugerirCalificarConEstrellas){let t=a.querySelectorAll(`#igm-stars-grupal .igm-star`);t.forEach(r=>{r.addEventListener(`click`,async()=>{let a=Number(r.dataset.value);t.forEach(e=>e.classList.toggle(`igm-star-filled`,Number(e.dataset.value)<=a));try{await Promise.all([...x].map(async e=>{let t=await c({alumnoId:e,indicadorId:i,claseId:n,nota:a,evaluadoPor:l});_.set(e,{..._.get(e)||{},...t,nota:a});let r=g.querySelector(`.igm-stars[data-alumno-id="${e}"]`);r&&r.querySelectorAll(`.igm-star`).forEach(e=>{e.classList.toggle(`igm-star-filled`,Number(e.dataset.value)<=a)})})),p=!0,e.success(`Calificación grupal aplicada a ${x.size} presentes`),A()}catch(t){e.error(`No se pudo aplicar la calificación grupal: ${t.message}`)}})})}}catch(t){e.error(`No se pudo analizar: ${t.message}`)}finally{r.disabled=!1,r.innerHTML=`<i class="bi bi-magic"></i> Analizar`}}})}j(),M(),N(),A(),f.querySelector(`#igm-completar`).addEventListener(`click`,()=>{e.success(`Indicador marcado como completamente evaluado`),p=!0,m()})}catch(e){console.error(`[IndicadorGradingModal] error:`,e),g.innerHTML=`<p class="igm-empty-inline" style="color:var(--pm-danger,#ef4444)">Error al cargar: ${v(e.message)}</p>`}}if(!document.getElementById(`igm-styles`)){let e=document.createElement(`style`);e.id=`igm-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function z(e){let[t,n]=(e||`00:00`).split(`:`).map(Number);return t*60+n}function B(e,t,n){let r=z(e),i=z(t);return n>=r&&n<i?`en-curso`:n>=i?`pasada`:r-n<=15?`proxima`:`futura`}function V(t,n,r){let i=document.createElement(`div`);i.id=`pm-hoy-autonav-banner`,i.innerHTML=`
    <div class="pm-autonav-content">
      <i class="bi bi-play-circle-fill pm-autonav-icon"></i>
      <span class="pm-autonav-msg">Abriendo clase en curso…</span>
      <span class="pm-autonav-count" id="pm-autonav-count">3</span>
      <button class="pm-autonav-cancel" id="pm-autonav-cancel">Cancelar</button>
    </div>
  `,document.body.appendChild(i);let a=3,o=!1,s=document.getElementById(`pm-autonav-count`),c=setInterval(()=>{o||(a--,s&&(s.textContent=a),a<=0&&(clearInterval(c),i.remove(),o||(window.router?window.router.navigate(`asistencia?clase=${t}&fecha=${n}`):r?.(t))))},1e3);document.getElementById(`pm-autonav-cancel`)?.addEventListener(`click`,()=>{o=!0,clearInterval(c),i.remove(),e.show(`Auto-navegación cancelada`,`info`)})}async function H(e,{onClaseClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let n=m();if(!n){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let r=new Date,a=r.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),c=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`;try{let d=await o(n.id,c);if(d&&d.length>0){e.innerHTML=G(d,a,r),q(e,c,n.id);return}let p=await u();if(!p||p.length===0){e.innerHTML=`
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
      `,J(e,c,n.id,[]);return}let m=p.map(e=>e.id),h=Object.fromEntries(p.map(e=>[e.id,e])),x=await D(n.id).catch(()=>[]),S=Object.fromEntries((x||[]).map(e=>[String(e.group_id),e])),C=(await l(m)).filter(e=>e.dia?.toLowerCase()===a).sort((e,t)=>e.hora_inicio.localeCompare(t.hora_inicio));if(!C||C.length===0){e.innerHTML=`
        <div style="padding: 1rem 1rem 2rem;">
          <h2 class="pm-date-header">${b(a)} ${_(r)}</h2>
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
      `,J(e,c,n.id,p);return}let w=new Date(r);w.setDate(w.getDate()-3);let T=`${w.getFullYear()}-${String(w.getMonth()+1).padStart(2,`0`)}-${String(w.getDate()).padStart(2,`0`)}`,E=new Date(r);E.setDate(E.getDate()-1);let O=`${E.getFullYear()}-${String(E.getMonth()+1).padStart(2,`0`)}-${String(E.getDate()).padStart(2,`0`)}`,k=(await f(n.id,T,O)||[]).filter(e=>{if(!m.includes(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),j=(await f(n.id,c,c)).filter(e=>m.includes(e.clase_id)).filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return t||e.borrador===!1&&n}),M=new Set(j.map(e=>e.clase_id)),N=await s(m),P={};for(let e of N||[])e.clase_id&&(P[e.clase_id]=(P[e.clase_id]||0)+1);let F=[...new Set(C.map(e=>e.salon_id).filter(Boolean))],I=F.length>0?await i(F):[],L=Object.fromEntries(I.map(e=>[e.id,e.nombre])),R=r.getHours()*60+r.getMinutes(),z=null,H=null,W=C.map(e=>{let t=h[e.clase_id],n=M.has(t.id),r=P[t.id]||0,i=B(e.hora_inicio,e.hora_fin,R),a=S[String(t.id)]||null;i===`en-curso`&&(!n&&!z&&(z=t.id),n&&!H&&(H=t.id));let o=n?`<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`:`<span class="pm-badge pm-badge-danger">Sin registrar</span>`,s=i===`en-curso`?`<span class="pm-badge pm-badge-en-curso"><i class="bi bi-circle-fill pm-pulse-dot me-1"></i>En curso</span>`:i===`proxima`?`<span class="pm-badge pm-badge-proxima"><i class="bi bi-clock me-1"></i>Próximamente</span>`:``;return`
        <div class="pm-clase-card ${[n?`registrada`:`sin-registrar`,i===`en-curso`?`pm-clase-en-curso`:``,i===`proxima`?`pm-clase-proxima`:``,i===`pasada`?`pm-clase-pasada`:``].filter(Boolean).join(` `)}" data-clase-id="${t.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="pm-clase-nombre">${v(t.nombre)}</div>
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
            <div class="meta-item"><i class="bi bi-clock"></i> ${y(e.hora_inicio)} – ${y(e.hora_fin)}</div>
            <div class="meta-item"><i class="bi bi-music-note-beamed"></i> ${v(t.instrumento||`—`)}</div>
            <div class="meta-item"><i class="bi bi-people"></i> ${r} alumnos</div>
            ${e.salon_id?`<div class="meta-item"><i class="bi bi-geo-alt"></i> ${v(L[e.salon_id]||`Salón`)}</div>`:``}
          </div>
          ${a?`<div class="pm-badge pm-badge-info mt-2"><i class="bi bi-diagram-3 me-1"></i>ACM Semana ${a.current_week||1}</div>`:``}
        </div>
      `}).join(``),K=k.length>0?`
      <div class="pm-pendientes-banner">
        <div class="pm-pendientes-header">
          <i class="bi bi-clipboard-x-fill"></i>
          <span>${k.length===1?`1 clase sin registrar de los últimos días`:`${k.length} clases sin registrar de los últimos días`}</span>
        </div>
        <div class="pm-pendientes-list">
          ${k.map(e=>{let t=h[e.clase_id];if(!t)return``;let n=e.fecha?e.fecha.split(`-`).reverse().slice(0,2).join(`/`):`—`;return`
              <button class="pm-pendiente-item" data-clase-id="${t.id}" data-fecha="${e.fecha}">
                <div class="pm-pendiente-info">
                  <span class="pm-pendiente-nombre">${v(t.nombre)}</span>
                  <span class="pm-pendiente-fecha">${n}</span>
                </div>
                <span class="pm-pendiente-cta">Registrar <i class="bi bi-arrow-right"></i></span>
              </button>`}).join(``)}
        </div>
      </div>`:``;e.innerHTML=`
      <div style="padding: 1rem 1rem 2rem;">
        <h2 class="pm-date-header">${b(a)} ${_(r)}</h2>
        ${K}
        <div class="pm-clases-container">
          ${W}
        </div>
      </div>
    `,e.querySelectorAll(`.pm-pendiente-item`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.claseId,r=e.dataset.fecha;try{await g.createSnapshotFromPlan(t,r,n.id)}catch{}window.router&&window.router.navigate(`asistencia?clase=${t}&fecha=${r}`)})}),e.querySelectorAll(`.pm-clase-card`).forEach(e=>{let r=e.querySelector(`.pm-analisis-btn`);r?r.addEventListener(`click`,e=>{e.stopPropagation(),e.preventDefault();let t=r.dataset.claseId;console.log(`[HoyView] Abriendo análisis para clase:`,t),A(t,c)}):console.warn(`[HoyView] No se encontró botón de análisis en card`);let i=e.querySelector(`.pm-mapa-btn`);i&&i.addEventListener(`click`,e=>{e.stopPropagation(),e.preventDefault();let t=i.dataset.claseId;U(t,n,c)}),e.addEventListener(`click`,async()=>{if(e.classList.contains(`pm-card-loading`))return;e.classList.add(`pm-card-loading`);let r=e.dataset.claseId;try{await g.createSnapshotFromPlan(r,c,n.id)}catch(e){console.error(`Error generando snapshot:`,e)}e.classList.remove(`pm-card-loading`),t?.(r)})});let Y=z||H;Y&&(requestAnimationFrame(()=>{let t=e.querySelector(`[data-clase-id="${Y}"]`);t&&typeof t.scrollIntoView==`function`&&t.scrollIntoView({behavior:`smooth`,block:`center`})}),z&&setTimeout(()=>{V(z,c,t)},800))}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${v(t.message)}</p>`}}async function U(e,t,r){let i=await n(t.id,e,!0);if(!i||i.length===0){P(t.id,e,()=>{U(e,t,r)});return}let a=i[0];await W(a,e,t,r)}async function W(e,t,n,i){let a=await r(e.id,t),o=Object.fromEntries((a||[]).map(e=>[e.indicador_id,e.check_state])),s=document.createElement(`div`);s.className=`pmr-backdrop`;function c(e){return e===`double`?`<i class="bi bi-check2-all pmr-check-double" title="Doble check: todos evaluados"></i>`:e===`single`?`<i class="bi bi-check2 pmr-check-single" title="Check simple: hay deudas pendientes"></i>`:`<span class="pmr-check-none" title="Sin dictar todavía"></span>`}let l=(e.unidades||[]).map(e=>`
    <div class="pmr-unidad">
      <div class="pmr-unidad-title">${v(e.nombre)}</div>
      ${(e.objetivos||[]).map(t=>`
        <div class="pmr-objetivo">
          <div class="pmr-objetivo-title">${v(t.nombre)}</div>
          <div class="pmr-indicadores">
            ${(t.indicadores||[]).map(n=>`
              <button class="pmr-indicador" data-indicador-id="${n.id}" data-indicador-nombre="${v(n.nombre)}" data-breadcrumb="${v(e.nombre)} &gt; ${v(t.nombre)}">
                ${c(o[n.id])}
                <span>${v(n.nombre)}</span>
              </button>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    </div>
  `).join(``);s.innerHTML=`
    <div class="pmr-modal" role="dialog" aria-modal="true">
      <div class="pmr-header">
        <h3><i class="bi bi-signpost-2-fill"></i> ${v(e.nombre)}</h3>
        <div class="pmr-header-actions">
          <button class="pmr-editar-btn" title="Editar ruta"><i class="bi bi-pencil-square"></i></button>
          <button class="pmr-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
      <div class="pmr-body">
        ${l||`<p class="pmr-empty">Esta ruta todavía no tiene unidades.</p>`}
      </div>
    </div>
  `,document.body.appendChild(s);let u=()=>s.remove();s.querySelector(`.pmr-close`).addEventListener(`click`,u),s.addEventListener(`click`,e=>{e.target===s&&u()}),s.querySelector(`.pmr-editar-btn`).addEventListener(`click`,()=>{u(),P(n.id,t,()=>{U(t,n,i)})}),s.querySelectorAll(`.pmr-indicador`).forEach(r=>{r.addEventListener(`click`,async()=>{u(),await R({claseId:t,fecha:i,indicadorId:r.dataset.indicadorId,indicadorNombre:r.dataset.indicadorNombre,breadcrumb:r.dataset.breadcrumb,evaluadoPor:n.user_id,onSaved:()=>W(e,t,n,i)})})})}if(!document.getElementById(`pmr-styles`)){let e=document.createElement(`style`);e.id=`pmr-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function G(e,t,n){let r=e.map(e=>{let t=`${e.hora_inicio?e.hora_inicio.slice(0,5):`—`} – ${e.hora_fin?e.hora_fin.slice(0,5):`—`}`,n=e.motivo||``,r=e.contenido||e.observaciones||``,i=K(e.motivo);return`
      <div class="pm-clase-card pm-emergente-card" data-eme-id="${e.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="pm-clase-nombre">${v(e.nombre_clase)}</div>
          <span class="pm-badge pm-badge-warning">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>Emergente
          </span>
        </div>
        ${n?`<div class="pm-eme-motivo ${i}">${v(n)}</div>`:``}
        <div class="pm-clase-meta">
          <div class="meta-item"><i class="bi bi-clock"></i> ${t}</div>
          ${r?`<div class="meta-item"><i class="bi bi-chat-text"></i> ${v(r)}</div>`:``}
        </div>
      </div>
    `}).join(``);return`
    <div style="padding: 1rem 1rem 2rem;">
      <h2 class="pm-date-header">${b(t)} ${_(n)}</h2>
      <p class="pm-eme-subtitle">
        <i class="bi bi-exclamation-triangle-fill"></i>
        Clase emergente registrada — reemplaza tus clases programadas de hoy
      </p>
      <div class="pm-clases-container">
        ${r}
      </div>
    </div>
  `}function K(e){return{suplencia:`pm-eme-motivo-suplencia`,eventual:`pm-eme-motivo-eventual`,reforzamiento:`pm-eme-motivo-reforzamiento`,otro:`pm-eme-motivo-otro`}[e]||`pm-eme-motivo-otro`}function q(e,t,n){e.querySelectorAll(`.pm-emergente-card`).forEach(e=>{e.addEventListener(`click`,()=>{e.classList.contains(`pm-card-loading`)||(e.classList.add(`pm-card-loading`),window.router&&window.router.navigate(`clase-emergente?fecha=${t}`),e.classList.remove(`pm-card-loading`))})})}function J(t,n,r,i){t.querySelector(`#btn-clase-emergente`)?.addEventListener(`click`,async()=>{let t=[];try{let e=(i||[]).map(e=>e.id);if(e.length>0){let n=await s(e),r={};n.forEach(e=>{if(!e.alumnos)return;r[e.alumno_id]||(r[e.alumno_id]=[]);let t=i.find(t=>t.id===e.clase_id);t&&r[e.alumno_id].push(t.nombre)});let a=new Set;t=n.map(e=>e.alumnos).filter(Boolean).filter(e=>a.has(e.id)?!1:(a.add(e.id),!0)).map(e=>({...e,clase_nombres:r[e.id]||[]}))}}catch(e){console.warn(`[HoyView] No se pudieron cargar alumnos para clase emergente:`,e)}k({fecha:n,clases:i||[],alumnos:t,maestroId:r,onSave:async t=>{let{data:n,error:r}=await p.from(`sesiones_clase`).insert([t]).select().single();if(r)throw r;e.success(`Clase emergente creada. Procedé a pasar asistencia.`),window.location.hash=`#/asistencia?sesion=${n.id}&fecha=${t.fecha}`}})})}if(!document.getElementById(`pm-hoy-pendientes-styles`)){let e=document.createElement(`style`);if(e.id=`pm-hoy-pendientes-styles`,!document.getElementById(`pm-badge-warning-style`)){let e=document.createElement(`style`);e.id=`pm-badge-warning-style`,e.textContent=`
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
  `,document.head.appendChild(e)}export{H as renderHoyView};