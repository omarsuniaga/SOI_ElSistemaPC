import{i as e,r as t}from"./AppModal-Du6jXNYA.js";import{a as n,n as r,t as i}from"./MapaContenidoSVG-DzsxSvgK.js";import{c as a}from"./asistenciasApi-Dti_T6Ay.js";import{c as o,d as s,f as c,i as l,l as u,n as d,o as f,p,r as m,s as h,t as g,u as _}from"./mapaClaseService-UtEI55gM.js";function v({claseId:e,niveles:t=[],objetivo:n=null,maestroId:r=null,onSaved:i=null,onClosed:a=null}){document.querySelectorAll(`.objetivo-editor-modal-overlay`).forEach(e=>e.remove());let o={objetivo:n,indicadores:[],archivarPendienteId:null,archivarObjetivoPendiente:!1},s=document.createElement(`div`);if(s.className=`objetivo-editor-modal-overlay`,document.body.appendChild(s),!document.getElementById(`objetivo-editor-modal-styles`)){let e=document.createElement(`style`);e.id=`objetivo-editor-modal-styles`,e.textContent=T(),document.head.appendChild(e)}let c=()=>{s.remove(),a?.()},l=()=>{s.innerHTML=x({claseId:e,niveles:t,state:o}),b({overlay:s,claseId:e,niveles:t,maestroId:r,state:o,close:c,render:l,onSaved:i})};l(),o.objetivo?.id&&y(o,l)}async function y(e,t){try{e.indicadores=await s(e.objetivo.id)}catch(t){console.error(`[objetivoEditorModal] Error cargando indicadores:`,t),e.indicadores=[]}t()}function b({overlay:e,claseId:t,niveles:n,maestroId:r,state:i,close:a,render:s,onSaved:c}){e.querySelector(`.objetivo-editor-modal-close-x`)?.addEventListener(`click`,a),e.querySelector(`.objetivo-editor-modal-backdrop`)?.addEventListener(`click`,a),e.querySelector(`.objetivo-editor-cancelar-btn`)?.addEventListener(`click`,a),e.querySelector(`.objetivo-editor-guardar-btn`)?.addEventListener(`click`,async()=>{let n=e.querySelector(`#objetivo-editor-nombre`)?.value?.trim()||``,a=e.querySelector(`#objetivo-editor-descripcion`)?.value?.trim()||``,o=e.querySelector(`#objetivo-editor-nivel`)?.value||null;if(!n){C(e,`El nombre del objetivo es requerido`);return}try{if(i.objetivo?.id){let e=await d(i.objetivo.id,{nombre:n,descripcion:a});i.objetivo={...i.objetivo,...e},c?.(i.objetivo)}else{if(!o){C(e,`Seleccioná un nivel`);return}let s=await h({clase_id:t,level_id:o,nombre:n,descripcion:a,created_by:r});i.objetivo=s,c?.(s)}s(),i.objetivo?.id&&y(i,s)}catch(t){console.error(`[objetivoEditorModal] Error guardando objetivo:`,t),C(e,`No se pudo guardar el objetivo`)}}),e.querySelector(`.objetivo-editor-borrar-objetivo-btn`)?.addEventListener(`click`,async()=>{try{await u(i.objetivo.id),a()}catch(t){if(t instanceof g){i.archivarObjetivoPendiente=!0,s();return}console.error(`[objetivoEditorModal] Error borrando objetivo:`,t),C(e,`No se pudo borrar el objetivo`)}}),e.querySelector(`.objetivo-editor-archivar-objetivo-btn`)?.addEventListener(`click`,async()=>{try{await l(i.objetivo.id),a()}catch(t){console.error(`[objetivoEditorModal] Error archivando objetivo:`,t),C(e,`No se pudo archivar el objetivo`)}}),e.querySelector(`.objetivo-editor-agregar-indicador-btn`)?.addEventListener(`click`,async()=>{let n=e.querySelector(`#objetivo-editor-nuevo-indicador`)?.value?.trim()||``;if(n)try{await f({objetivo_id:i.objetivo.id,clase_id:t,descripcion:n}),await y(i,s)}catch(t){console.error(`[objetivoEditorModal] Error agregando indicador:`,t),C(e,`No se pudo agregar el indicador`)}}),e.querySelectorAll(`.objetivo-editor-indicador-row`).forEach(t=>{let n=t.dataset.indicadorId;t.querySelector(`.btn-borrar-indicador`)?.addEventListener(`click`,async()=>{try{await o(n),await y(i,s)}catch(t){if(t instanceof g){i.archivarPendienteId=n,s();return}console.error(`[objetivoEditorModal] Error borrando indicador:`,t),C(e,`No se pudo borrar el indicador`)}}),t.querySelector(`.btn-archivar-indicador`)?.addEventListener(`click`,async()=>{try{await m(n),i.archivarPendienteId=null,await y(i,s)}catch(t){console.error(`[objetivoEditorModal] Error archivando indicador:`,t),C(e,`No se pudo archivar el indicador`)}})})}function x({claseId:e,niveles:t,state:n}){let{objetivo:r}=n,i=!!r?.id,a=!i&&t.length===0,o=t.map(e=>`<option value="${e.id}">${w(e.nombre)}</option>`).join(``);return`
    <div class="objetivo-editor-modal-backdrop"></div>
    <div class="objetivo-editor-modal-dialog">
      <div class="objetivo-editor-modal-header">
        <h5 class="objetivo-editor-modal-title">${i?`Editar Objetivo`:`Nuevo Objetivo`}</h5>
        <button class="objetivo-editor-modal-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="objetivo-editor-modal-body">
        ${a?`
          <div class="objetivo-editor-warning" role="alert">
            Esta clase no tiene niveles asignados en la matriz ACM. Asigná un nivel antes de crear objetivos.
          </div>
        `:``}
        <div class="objetivo-editor-error-msg d-none" role="alert"></div>

        <label class="objetivo-editor-label" for="objetivo-editor-nombre">Nombre</label>
        <input type="text" id="objetivo-editor-nombre" class="form-control" value="${w(r?.nombre||``)}" placeholder="Ej: La 3ra posición" />

        <label class="objetivo-editor-label" for="objetivo-editor-descripcion">Descripción</label>
        <textarea id="objetivo-editor-descripcion" class="form-control" rows="2">${w(r?.descripcion||``)}</textarea>

        ${i?``:`
          <label class="objetivo-editor-label" for="objetivo-editor-nivel">Nivel</label>
          <select id="objetivo-editor-nivel" class="form-select" ${a?`disabled`:``}>
            ${o}
          </select>
        `}

        ${i?S(n):``}
      </div>
      <div class="objetivo-editor-modal-footer">
        ${i?`<button class="btn btn-outline-danger objetivo-editor-borrar-objetivo-btn">Borrar Objetivo</button>`:``}
        ${i&&n.archivarObjetivoPendiente?`<button class="btn btn-warning objetivo-editor-archivar-objetivo-btn">Archivar Objetivo</button>`:``}
        <button class="btn btn-outline-secondary objetivo-editor-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary objetivo-editor-guardar-btn" ${a?`disabled`:``}>Guardar</button>
      </div>
    </div>
  `}function S(e){let t=e.indicadores.map(t=>`
      <div class="objetivo-editor-indicador-row" data-indicador-id="${t.id}">
        <span class="objetivo-editor-indicador-desc">${w(t.descripcion)}</span>
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
  `}function C(e,t){let n=e.querySelector(`.objetivo-editor-error-msg`);n&&(n.textContent=t,n.classList.remove(`d-none`),setTimeout(()=>n.classList.add(`d-none`),3e3))}function w(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function T(){return`
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
  `}var E=[1,2,3,4,5];function D({claseId:e,claseIndicadorId:t,indicadorDescripcion:i=``,presentes:a=[],fecha:o=null,evaluadoPor:s=null,onGuardado:c=null,onClosed:l=null}){document.querySelectorAll(`.calificacion-indicador-overlay`).forEach(e=>e.remove());let u=new Map,d=document.createElement(`div`);if(d.className=`calificacion-indicador-overlay`,d.innerHTML=O({indicadorDescripcion:i,presentes:a,fecha:o}),document.body.appendChild(d),!document.getElementById(`calificacion-indicador-styles`)){let e=document.createElement(`style`);e.id=`calificacion-indicador-styles`,e.textContent=A(),document.head.appendChild(e)}let f=()=>{d.remove(),l?.()};d.querySelector(`.calificacion-panel-close-x`)?.addEventListener(`click`,f),d.querySelector(`.calificacion-panel-backdrop`)?.addEventListener(`click`,f),d.querySelector(`.calificacion-panel-cancelar-btn`)?.addEventListener(`click`,f),d.querySelectorAll(`.calificacion-alumno-row`).forEach(e=>{let t=e.dataset.alumnoId;e.querySelectorAll(`.btn-nota`).forEach(n=>{n.addEventListener(`click`,()=>{let i=Number(n.dataset.nota);u.set(t,i),e.querySelectorAll(`.btn-nota`).forEach(e=>e.classList.toggle(`selected`,e===n));let a=e.querySelector(`.calificacion-badge-slot`);a&&(a.innerHTML=r(i)?`<span class="calificacion-superado-badge">Superado</span>`:``)})})}),d.querySelector(`.calificacion-panel-guardar-btn`)?.addEventListener(`click`,async()=>{let r=d.querySelector(`.calificacion-panel-guardar-btn`);r.disabled=!0,r.textContent=`Guardando...`;let i=0;for(let[r,a]of u.entries())try{await n({alumno_id:r,clase_indicador_id:t,clase_id:e,nota:a,evaluado_por:s}),i++}catch(e){console.error(`[calificacionIndicadorPanel] Error guardando evaluación:`,r,e)}c?.({guardados:i,total:u.size}),f()})}function O({indicadorDescripcion:e,presentes:t,fecha:n}){let r=t.map(e=>`
      <div class="calificacion-alumno-row" data-alumno-id="${e.id}">
        <div class="calificacion-alumno-info">
          <span class="calificacion-alumno-nombre">${k(e.nombre)}</span>
          <span class="calificacion-badge-slot"></span>
        </div>
        <div class="calificacion-notas-btns">
          ${E.map(e=>`<button type="button" class="btn btn-sm btn-outline-primary btn-nota" data-nota="${e}">${e}</button>`).join(``)}
        </div>
      </div>
    `).join(``);return`
    <div class="calificacion-panel-backdrop"></div>
    <div class="calificacion-panel-dialog">
      <div class="calificacion-panel-header">
        <div>
          <h5 class="calificacion-panel-title">Calificar Indicador</h5>
          <p class="calificacion-panel-subtitle">${k(e)}${n?` — ${k(n)}`:``}</p>
        </div>
        <button class="calificacion-panel-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="calificacion-panel-body">
        ${t.length===0?`<div class="text-muted text-center py-3">No hay alumnos presentes registrados para hoy.</div>`:r}
      </div>
      <div class="calificacion-panel-footer">
        <button class="btn btn-outline-secondary calificacion-panel-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary calificacion-panel-guardar-btn" ${t.length===0?`disabled`:``}>Guardar</button>
      </div>
    </div>
  `}function k(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function A(){return`
    .calificacion-indicador-overlay {
      position: fixed; inset: 0; z-index: 10002;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .calificacion-panel-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .calificacion-panel-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 560px;
      max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .calificacion-panel-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .calificacion-panel-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .calificacion-panel-subtitle { font-size: 0.78rem; color: var(--bs-secondary-color, #6c757d); margin: 0.15rem 0 0; }
    .calificacion-panel-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .calificacion-panel-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .calificacion-alumno-row {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color, #eee);
    }
    .calificacion-alumno-info { display: flex; align-items: center; gap: 0.5rem; }
    .calificacion-alumno-nombre { font-weight: 600; font-size: 0.9rem; }
    .calificacion-superado-badge {
      background: #d1fae5; color: #065f46; border-radius: 6px; padding: 0.1rem 0.4rem;
      font-size: 0.7rem; font-weight: 700;
    }
    .calificacion-notas-btns { display: flex; gap: 0.25rem; }
    .btn-nota.selected { background: var(--bs-primary, #0d6efd); color: #fff; }
    .calificacion-panel-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `}function j(){return new Date().toISOString().slice(0,10)}async function M(e,{claseId:t,maestroId:n=null}={}){if(!e||!t)return;e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `;let r={claseId:t,maestroId:n,niveles:[],objetivos:[],estrellasMap:new Map,modo:`diseno`,gateBloqueado:!1,presentes:[],selectedObjetivoId:null,indicadoresSeleccionados:[]};await N(r),await P(r),I(e,r)}async function N(e){try{e.niveles=await c(e.claseId)}catch(t){console.error(`[MapaClaseView] Error cargando niveles asignados:`,t),e.niveles=[]}}async function P(e){try{let[t,n]=await Promise.all([p(e.claseId),_(e.claseId)]);e.objetivos=t||[],e.estrellasMap=new Map((n||[]).map(e=>[e.objetivoId,e]))}catch(t){console.error(`[MapaClaseView] Error cargando objetivos/estrellas:`,t),e.objetivos=[],e.estrellasMap=new Map}}function F(e){return e.objetivos.map(t=>{let n=e.estrellasMap.get(t.id);return{id:t.id,titulo:t.nombre,...n?{estrellas:n.estrellas,pctAvance:n.pctAvance,estadoVisual:n.estadoVisual}:{}}})}function I(e,t){let n=t.niveles.length===0;e.innerHTML=`
    <div class="mapa-clase-view container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h4 class="fw-bold mb-0">Mapa de Planificación</h4>
        <div class="btn-group" role="group" aria-label="Modo del mapa">
          <button type="button" id="btn-modo-diseno" class="btn btn-sm ${t.modo===`diseno`?`btn-primary`:`btn-outline-primary`}">
            <i class="bi bi-pencil-square me-1"></i>Diseñar Ruta
          </button>
          <button type="button" id="btn-modo-sesion" class="btn btn-sm ${t.modo===`sesion`?`btn-primary`:`btn-outline-primary`}">
            <i class="bi bi-person-video3 me-1"></i>Dar Clase
          </button>
        </div>
      </div>

      ${n?`
        <div class="alert alert-warning" role="alert">
          Esta clase no tiene niveles asignados en la matriz ACM (acm_active_routes). Asigná un nivel antes de crear objetivos.
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
  `;let r=e.querySelector(`#mapa-clase-svg-canvas`);r&&i({container:r,nodos:F(t),modo:t.modo,onNodeClick:n=>z(e,t,n),onAddNodeClick:()=>R(e,t)}),t.modo===`sesion`&&t.selectedObjetivoId&&B(e,t),e.querySelector(`#btn-modo-diseno`)?.addEventListener(`click`,()=>{t.modo=`diseno`,t.gateBloqueado=!1,t.selectedObjetivoId=null,t.indicadoresSeleccionados=[],I(e,t)}),e.querySelector(`#btn-modo-sesion`)?.addEventListener(`click`,()=>L(e,t)),e.querySelector(`#btn-ir-asistencias`)?.addEventListener(`click`,()=>window.router?.navigate(`asistencias`))}async function L(e,t){let n=j(),r={tomada:!1,presentes:[]};try{r=await a({claseId:t.claseId,fecha:n})}catch(e){console.error(`[MapaClaseView] Error verificando asistencia del día:`,e)}if(!r.tomada){t.gateBloqueado=!0,I(e,t);return}t.gateBloqueado=!1,t.presentes=r.presentes||[],t.modo=`sesion`,I(e,t)}function R(t,n){if(n.niveles.length===0){e.warning(`Esta clase no tiene niveles asignados. Asigná un nivel en la matriz ACM primero.`);return}v({claseId:n.claseId,niveles:n.niveles,objetivo:null,maestroId:n.maestroId,onSaved:()=>V(t,n)})}function z(e,t,n){if(t.modo===`diseno`){let r=t.objetivos.find(e=>String(e.id)===String(n.id))||null;v({claseId:t.claseId,niveles:t.niveles,objetivo:r,maestroId:t.maestroId,onSaved:()=>V(e,t)});return}t.selectedObjetivoId=n.id,s(n.id).then(r=>{t.selectedObjetivoId===n.id&&(t.indicadoresSeleccionados=r||[],I(e,t))}).catch(n=>{console.error(`[MapaClaseView] Error cargando indicadores del objetivo:`,n),t.indicadoresSeleccionados=[],I(e,t)})}function B(e,n){let r=e.querySelector(`#mapa-clase-panel-sesion`);if(!r)return;let i=n.objetivos.find(e=>String(e.id)===String(n.selectedObjetivoId)),a=n.indicadoresSeleccionados.map(e=>`
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
  `,r.querySelectorAll(`.btn-calificar-indicador`).forEach(t=>{t.addEventListener(`click`,()=>{let r=n.indicadoresSeleccionados.find(e=>String(e.id)===t.dataset.indicadorId);r&&D({claseId:n.claseId,claseIndicadorId:r.id,indicadorDescripcion:r.descripcion,presentes:n.presentes,fecha:j(),evaluadoPor:n.maestroId,onGuardado:()=>V(e,n)})})})}async function V(e,t){await P(t),I(e,t)}export{M as renderMapaClaseView};