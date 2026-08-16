import{i as e,t}from"./evaluacionClaseService-PzaE8gD7.js";var n=[1,2,3,4,5];function r({claseId:n,claseIndicadorId:r,indicadorDescripcion:a=``,presentes:s=[],fecha:c=null,evaluadoPor:l=null,onGuardado:u=null,onClosed:d=null}){document.querySelectorAll(`.calificacion-indicador-overlay`).forEach(e=>e.remove());let f=new Map,p=document.createElement(`div`);if(p.className=`calificacion-indicador-overlay`,p.innerHTML=i({indicadorDescripcion:a,presentes:s,fecha:c}),document.body.appendChild(p),!document.getElementById(`calificacion-indicador-styles`)){let e=document.createElement(`style`);e.id=`calificacion-indicador-styles`,e.textContent=o(),document.head.appendChild(e)}let m=()=>{p.remove(),d?.()};p.querySelector(`.calificacion-panel-close-x`)?.addEventListener(`click`,m),p.querySelector(`.calificacion-panel-backdrop`)?.addEventListener(`click`,m),p.querySelector(`.calificacion-panel-cancelar-btn`)?.addEventListener(`click`,m),p.querySelectorAll(`.calificacion-alumno-row`).forEach(e=>{let n=e.dataset.alumnoId;e.querySelectorAll(`.btn-nota`).forEach(r=>{r.addEventListener(`click`,()=>{let i=Number(r.dataset.nota);f.set(n,i),e.querySelectorAll(`.btn-nota`).forEach(e=>e.classList.toggle(`selected`,e===r));let a=e.querySelector(`.calificacion-badge-slot`);a&&(a.innerHTML=t(i)?`<span class="calificacion-superado-badge">Superado</span>`:``)})})}),p.querySelector(`.calificacion-panel-guardar-btn`)?.addEventListener(`click`,async()=>{let t=p.querySelector(`.calificacion-panel-guardar-btn`);t.disabled=!0,t.textContent=`Guardando...`;let i=0;for(let[t,a]of f.entries())try{await e({alumno_id:t,clase_indicador_id:r,clase_id:n,nota:a,evaluado_por:l}),i++}catch(e){console.error(`[calificacionIndicadorPanel] Error guardando evaluación:`,t,e)}u?.({guardados:i,total:f.size}),m()})}function i({indicadorDescripcion:e,presentes:t,fecha:r}){let i=t.map(e=>`
      <div class="calificacion-alumno-row" data-alumno-id="${e.id}">
        <div class="calificacion-alumno-info">
          <span class="calificacion-alumno-nombre">${a(e.nombre)}</span>
          <span class="calificacion-badge-slot"></span>
        </div>
        <div class="calificacion-notas-btns">
          ${n.map(e=>`<button type="button" class="btn btn-sm btn-outline-primary btn-nota" data-nota="${e}">${e}</button>`).join(``)}
        </div>
      </div>
    `).join(``);return`
    <div class="calificacion-panel-backdrop"></div>
    <div class="calificacion-panel-dialog">
      <div class="calificacion-panel-header">
        <div>
          <h5 class="calificacion-panel-title">Calificar Indicador</h5>
          <p class="calificacion-panel-subtitle">${a(e)}${r?` — ${a(r)}`:``}</p>
        </div>
        <button class="calificacion-panel-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="calificacion-panel-body">
        ${t.length===0?`<div class="text-muted text-center py-3">No hay alumnos presentes registrados para hoy.</div>`:i}
      </div>
      <div class="calificacion-panel-footer">
        <button class="btn btn-outline-secondary calificacion-panel-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary calificacion-panel-guardar-btn" ${t.length===0?`disabled`:``}>Guardar</button>
      </div>
    </div>
  `}function a(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function o(){return`
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
  `}export{r as t};