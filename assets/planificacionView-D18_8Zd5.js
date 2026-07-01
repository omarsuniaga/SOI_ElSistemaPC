const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/PlanningRouteTree-C0eObWgl.js","assets/planningService-CW5PRb28.js","assets/supabase-KnARm58N.js","assets/portalUtils-DbrsCFDo.js","assets/PlanningManagerPanel-CltKOVzb.js","assets/curriculumAdminService-C4U57gHy.js","assets/AppModal-Fjeb_yOo.js","assets/AppToast-Bli1nFQQ.js","assets/PlanningHistorialPane-1rfwcBeo.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,r as n}from"./maestroDataService-BGjCE976.js";import{t as r}from"./AppToast-Bli1nFQQ.js";import{t as i}from"./a11yUtils-DoZA0IX7.js";import{t as a}from"./preload-helper-lqsI3teB.js";import{s as o}from"./alumnosApi-Bzqf1UxF.js";import{n as s,r as c,t as l}from"./planningService-CW5PRb28.js";async function u(e,{indicator:t,claseId:a,maestroId:s,routeVersionId:c,onSave:u}){let d=new Set,f=document.createElement(`div`);f.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;let p=document.createElement(`div`);p.style.cssText=`
    background: var(--pm-surface);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    animation: pm-modal-in 0.2s ease-out;
  `,p.innerHTML=`
    <style>
      @keyframes pm-modal-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .pm-registro-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid var(--pm-border);
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white;
        border-radius: 16px 16px 0 0;
      }

      .pm-registro-title {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0;
      }

      .pm-registro-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .pm-registro-close:hover {
        transform: rotate(90deg);
      }

      .pm-registro-content {
        padding: 2rem;
      }

      .pm-registro-section {
        margin-bottom: 2rem;
      }

      .pm-registro-section-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--pm-text);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pm-registro-students-list {
        display: grid;
        gap: 0.75rem;
        max-height: 300px;
        overflow-y: auto;
        padding-right: 5px;
        border: 1px solid var(--pm-border);
        padding: 1rem;
        border-radius: 8px;
        background: var(--pm-surface-2);
      }

      .pm-registro-student-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 6px;
        transition: all 0.15s;
        cursor: pointer;
      }

      .pm-registro-student-item:hover {
        background: var(--pm-primary-light, rgba(0, 122, 255, 0.1));
      }

      .pm-registro-student-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .pm-registro-student-label {
        flex: 1;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pm-registro-student-instrumento {
        font-size: 0.75rem;
        color: var(--pm-text-muted);
      }

      .pm-registro-bulk-actions {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .pm-registro-bulk-btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface-2);
        color: var(--pm-text);
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-registro-bulk-btn:hover {
        background: var(--pm-primary);
        color: white;
        border-color: var(--pm-primary);
      }

      .pm-registro-textarea {
        width: 100%;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        font-family: inherit;
        font-size: 0.9rem;
        resize: vertical;
        min-height: 100px;
        margin-bottom: 1rem;
      }

      .pm-registro-calificacion {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .pm-registro-calificacion-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }

      .pm-registro-calificacion-option input[type="radio"] {
        cursor: pointer;
      }

      .pm-registro-calificacion-label {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .pm-registro-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--pm-border);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      .pm-registro-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-registro-btn-cancel {
        background: var(--pm-surface-2);
        color: var(--pm-text);
      }

      .pm-registro-btn-cancel:hover {
        background: var(--pm-border);
      }

      .pm-registro-btn-save {
        background: var(--pm-primary);
        color: white;
      }

      .pm-registro-btn-save:hover:not(:disabled) {
        background: #0056b3;
      }

      .pm-registro-btn-save:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .pm-registro-counter {
        font-size: 0.85rem;
        color: var(--pm-text-muted);
        margin-bottom: 1rem;
      }
    </style>

    <div class="pm-registro-header">
      <h2 class="pm-registro-title">Registrar Observación</h2>
      <button class="pm-registro-close" id="pm-registro-close">✕</button>
    </div>

    <div class="pm-registro-content">
      <h3 style="margin: 0 0 0.5rem 0;">📍 ${t.nombre}</h3>
      <p style="margin: 0 0 2rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">${t.descripcion||`Sin descripción`}</p>

      <!-- Seleccionar Estudiantes -->
      <div class="pm-registro-section">
        <div class="pm-registro-section-title">👥 Estudiantes que trabajaron este indicador</div>
        <div class="pm-registro-bulk-actions">
          <button class="pm-registro-bulk-btn" id="pm-select-all">Seleccionar todos</button>
          <button class="pm-registro-bulk-btn" id="pm-deselect-all">Deseleccionar todos</button>
        </div>
        <div class="pm-registro-counter" id="pm-counter">0 seleccionados</div>
        <div class="pm-registro-students-list" id="pm-students-list">
          <p style="color: var(--pm-text-muted); text-align: center;">Cargando estudiantes...</p>
        </div>
      </div>

      <!-- Descripción -->
      <div class="pm-registro-section">
        <div class="pm-registro-section-title">📝 Descripción de la clase</div>
        <textarea
          class="pm-registro-textarea"
          id="pm-registro-descripcion"
          placeholder="Ej: Arco más recto, buena presión. Algunos aún necesitan practicar transferencia."
        ></textarea>
      </div>

      <!-- Calificación -->
      <div class="pm-registro-section">
        <div class="pm-registro-section-title">⭐ Calificación general</div>
        <div class="pm-registro-calificacion">
          <label class="pm-registro-calificacion-option">
            <input type="radio" name="calificacion" value="bien" checked>
            <span class="pm-registro-calificacion-label">✓ Bien</span>
          </label>
          <label class="pm-registro-calificacion-option">
            <input type="radio" name="calificacion" value="regular">
            <span class="pm-registro-calificacion-label">◐ Regular</span>
          </label>
          <label class="pm-registro-calificacion-option">
            <input type="radio" name="calificacion" value="mal">
            <span class="pm-registro-calificacion-label">✗ Mal</span>
          </label>
        </div>
      </div>
    </div>

    <div class="pm-registro-footer">
      <button class="pm-registro-btn pm-registro-btn-cancel" id="pm-registro-cancel">Cancelar</button>
      <button class="pm-registro-btn pm-registro-btn-save" id="pm-registro-save">Guardar Observación</button>
    </div>
  `,f.appendChild(p),e.appendChild(f);try{let e=(await n([a])).map(e=>e.alumno_id);if(e.length===0){document.getElementById(`pm-students-list`).innerHTML=`<p style="color: var(--pm-text-muted); text-align: center;">No hay estudiantes en esta clase</p>`;return}let t=(await o()).filter(t=>e.includes(t.id)),r=document.getElementById(`pm-students-list`);r.innerHTML=t.map(e=>`
      <label class="pm-registro-student-item">
        <input type="checkbox" data-alumno-id="${e.id}">
        <span class="pm-registro-student-label">
          <strong>${e.nombre_completo}</strong>
          <span class="pm-registro-student-instrumento">${e.instrumento_principal||`S/I`}</span>
        </span>
      </label>
    `).join(``),r.querySelectorAll(`input[type="checkbox"]`).forEach(e=>{e.addEventListener(`change`,()=>{e.checked?d.add(e.dataset.alumnoId):d.delete(e.dataset.alumnoId),h()})})}catch(e){console.error(`[registro] Error cargando estudiantes:`,e),document.getElementById(`pm-students-list`).innerHTML=`<p style="color: var(--pm-text-muted); text-align: center;">Error cargando estudiantes</p>`}document.getElementById(`pm-select-all`).addEventListener(`click`,()=>{document.querySelectorAll(`#pm-students-list input[type="checkbox"]`).forEach(e=>{e.checked=!0,d.add(e.dataset.alumnoId)}),h()}),document.getElementById(`pm-deselect-all`).addEventListener(`click`,()=>{document.querySelectorAll(`#pm-students-list input[type="checkbox"]`).forEach(e=>{e.checked=!1,d.delete(e.dataset.alumnoId)}),h()}),document.getElementById(`pm-registro-save`).addEventListener(`click`,async()=>{if(d.size===0){r.warning(`Selecciona al menos un estudiante`);return}let e=document.getElementById(`pm-registro-descripcion`).value.trim(),n=document.querySelector(`input[name="calificacion"]:checked`).value;try{let o=document.getElementById(`pm-registro-save`);o.disabled=!0,o.textContent=`Guardando...`,await l({maestroId:s,routeVersionId:c,nodeId:t.node_id,claseId:a,fecha:new Date().toISOString().split(`T`)[0],descripcion:e,calificacion:n,estudianteIds:Array.from(d)}),r.success(`✓ Observación guardada exitosamente`),i(`Observación para ${t.nombre} guardada. ${d.size} estudiantes registrados.`),m(),u&&u()}catch(e){console.error(`[registro] Error guardando:`,e),r.error(`Error guardando observación`),document.getElementById(`pm-registro-save`).disabled=!1,document.getElementById(`pm-registro-save`).textContent=`Guardar Observación`}});function m(){f.remove()}document.getElementById(`pm-registro-close`).addEventListener(`click`,m),document.getElementById(`pm-registro-cancel`).addEventListener(`click`,m),f.addEventListener(`click`,e=>{e.target===f&&m()});function h(){let e=d.size;document.getElementById(`pm-counter`).textContent=`${e} ${e===1?`estudiante seleccionado`:`estudiantes seleccionados`}`}}async function d(e,{indicator:t,claseId:n,maestroId:r,routeVersionId:i}){let a=document.createElement(`div`);a.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    overflow-y: auto;
  `;let o=document.createElement(`div`);o.style.cssText=`
    background: var(--pm-surface);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 700px;
    width: 90%;
    margin: 2rem auto;
    animation: pm-modal-in 0.2s ease-out;
  `,o.innerHTML=`
    <style>
      @keyframes pm-modal-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .pm-details-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid var(--pm-border);
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white;
        border-radius: 16px 16px 0 0;
      }

      .pm-details-title {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0;
      }

      .pm-details-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .pm-details-close:hover {
        transform: rotate(90deg);
      }

      .pm-details-content {
        padding: 2rem;
        max-height: 70vh;
        overflow-y: auto;
      }

      .pm-details-progress {
        margin-bottom: 2rem;
      }

      .pm-details-progress-title {
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.75rem;
      }

      .pm-details-progress-bar {
        width: 100%;
        height: 10px;
        background: var(--pm-border);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .pm-details-progress-fill {
        height: 100%;
        background: var(--pm-primary);
        transition: width 0.3s;
      }

      .pm-details-progress-label {
        font-size: 0.9rem;
        color: var(--pm-text-muted);
      }

      .pm-details-section {
        margin-bottom: 2rem;
      }

      .pm-details-section-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--pm-text);
        margin-bottom: 1rem;
      }

      .pm-details-observation {
        background: var(--pm-surface-2);
        border-left: 4px solid var(--pm-primary);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .pm-details-obs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .pm-details-obs-date {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--pm-text);
      }

      .pm-details-obs-calificacion {
        font-size: 0.8rem;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        background: var(--pm-primary);
        color: white;
      }

      .pm-details-obs-descripcion {
        font-size: 0.9rem;
        color: var(--pm-text);
        margin-bottom: 0.75rem;
        line-height: 1.4;
      }

      .pm-details-obs-students {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.85rem;
      }

      .pm-details-obs-student-badge {
        background: var(--pm-primary);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }

      .pm-details-student-summary {
        background: var(--pm-surface-2);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.75rem;
      }

      .pm-details-student-name {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--pm-text);
        margin-bottom: 0.25rem;
      }

      .pm-details-student-status {
        font-size: 0.85rem;
        color: var(--pm-text-muted);
      }

      .pm-details-student-status.vio {
        color: #4ade80;
      }

      .pm-details-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--pm-border);
        text-align: right;
      }

      .pm-details-btn-close {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        border: none;
        background: var(--pm-primary);
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-details-btn-close:hover {
        background: #0056b3;
      }
    </style>

    <div class="pm-details-header">
      <h2 class="pm-details-title" id="pm-details-title">Detalles del Indicador</h2>
      <button class="pm-details-close" id="pm-details-close">✕</button>
    </div>

    <div class="pm-details-content" id="pm-details-body">
      <p style="text-align: center; color: var(--pm-text-muted);">Cargando...</p>
    </div>

    <div class="pm-details-footer">
      <button class="pm-details-btn-close" id="pm-details-close-btn">Cerrar</button>
    </div>
  `,a.appendChild(o),e.appendChild(a);try{let e=await s(t.node_id,i,r,n),a=`
      <div class="pm-details-progress">
        <div class="pm-details-progress-title">Progreso General</div>
        <div class="pm-details-progress-bar">
          <div class="pm-details-progress-fill" style="width: ${e.progreso_porcentaje/100*100}%"></div>
        </div>
        <div class="pm-details-progress-label">
          ${e.estudiantes_vieron}/${e.estudiantes_totales} alumnos (${e.progreso_porcentaje}%)
          • ${e.estado.label}
        </div>
      </div>

      <div class="pm-details-section">
        <div class="pm-details-section-title">📋 Historial de Observaciones</div>
        ${e.observaciones.length===0?`<p style="color: var(--pm-text-muted);">Aún no hay observaciones registradas</p>`:e.observaciones.map(e=>`
          <div class="pm-details-observation">
            <div class="pm-details-obs-header">
              <span class="pm-details-obs-date">📅 ${new Date(e.fecha).toLocaleDateString(`es-ES`)}</span>
              <span class="pm-details-obs-calificacion">${e.calificacion===`bien`?`✓`:e.calificacion===`regular`?`◐`:`✗`} ${e.calificacion}</span>
            </div>
            ${e.descripcion?`<p class="pm-details-obs-descripcion">"${e.descripcion}"</p>`:``}
            <div class="pm-details-obs-students">
              ${e.estudiantes.map(e=>`
                <span class="pm-details-obs-student-badge">${e.nombre}</span>
              `).join(``)}
            </div>
          </div>
        `).join(``)}
      </div>

      <div class="pm-details-section">
        <div class="pm-details-section-title">👥 Resumen por Estudiante</div>
        ${e.resumen_estudiantes.map(e=>`
          <div class="pm-details-student-summary">
            <div class="pm-details-student-name">${e.nombre}</div>
            <div class="pm-details-student-status ${e.vio?`vio`:``}">
              ${e.vio?`✓ Vio el contenido (${e.calificacion}) — ${new Date(e.fecha).toLocaleDateString(`es-ES`)}`:`✗ Aún no ha visto`}
            </div>
          </div>
        `).join(``)}
      </div>
    `;document.getElementById(`pm-details-body`).innerHTML=a,document.getElementById(`pm-details-title`).textContent=`${e.nombre} — Historial Completo`}catch(e){console.error(`[details] Error cargando historial:`,e),document.getElementById(`pm-details-body`).innerHTML=`<p style="color: var(--pm-text-muted); text-align: center;">Error cargando información</p>`}function c(){a.remove()}document.getElementById(`pm-details-close`).addEventListener(`click`,c),document.getElementById(`pm-details-close-btn`).addEventListener(`click`,c),a.addEventListener(`click`,e=>{e.target===a&&c()})}function f(e){return Array.isArray(e)&&e.find(e=>{let t=e?.estado?.estado;return t&&t!==`completado`})||null}function p(e){let t=Array.isArray(e)?e:[],n=t.length,r=t.filter(e=>e?.estado?.estado===`completado`).length;return{total:n,completados:r,pendientes:n-r,porcentaje:n>0?Math.round(r/n*100):0}}async function m(n,{maestroId:i}){let o=null,s=null,l=[];n.innerHTML=`
    <style>
      .pm-planning-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .pm-planning-header {
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        margin-bottom: 2rem;
      }

      .pm-planning-title {
        font-size: 1.8rem;
        font-weight: 800;
        margin: 0 0 1rem 0;
      }

      .pm-planning-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .pm-planning-filter {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .pm-planning-filter label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--pm-text-muted);
      }

      .pm-planning-faro {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        margin-bottom: 1.25rem;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: #fff;
        box-shadow: 0 6px 20px rgba(29, 78, 216, 0.25);
      }
      .pm-planning-faro-done {
        background: linear-gradient(135deg, #16a34a, #15803d);
        box-shadow: 0 6px 20px rgba(21, 128, 61, 0.25);
      }
      .pm-planning-faro-icon { font-size: 2rem; line-height: 1; }
      .pm-planning-faro-body { flex: 1; min-width: 0; }
      .pm-planning-faro-label {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        opacity: 0.85;
      }
      .pm-planning-faro-title {
        margin: 0.15rem 0 0;
        font-size: 1.1rem;
        font-weight: 800;
      }
      .pm-planning-faro-meta {
        margin: 0.15rem 0 0;
        font-size: 0.8rem;
        opacity: 0.85;
      }
      .pm-planning-faro .pm-planning-btn {
        white-space: nowrap;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.35);
      }
      .pm-planning-faro .pm-planning-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .pm-planning-filter select {
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        font-weight: 500;
      }

      .pm-planning-grid {
        display: grid;
        gap: 2rem;
      }

      .pm-planning-group {
        display: grid;
        gap: 1rem;
      }

      .pm-planning-group-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--pm-text);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pm-planning-indicator-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.25rem;
        border-radius: 12px;
        border: 2px solid var(--pm-border);
        background: var(--pm-surface);
        transition: all 0.2s;
        cursor: pointer;
      }

      .pm-planning-indicator-card:hover {
        border-color: var(--pm-primary);
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
        transform: translateY(-2px);
      }

      /* Color backgrounds por estado */
      .pm-planning-indicator-card.estado-completado {
        background: rgba(74, 222, 128, 0.08);
        border-color: rgba(74, 222, 128, 0.3);
      }

      .pm-planning-indicator-card.estado-parcial {
        background: rgba(251, 191, 36, 0.08);
        border-color: rgba(251, 191, 36, 0.3);
      }

      .pm-planning-indicator-card.estado-no_iniciado {
        background: rgba(107, 114, 128, 0.05);
        border-color: rgba(107, 114, 128, 0.2);
      }

      .pm-planning-indicator-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        font-weight: bold;
        flex-shrink: 0;
        background: white;
      }

      .pm-planning-indicator-card.estado-completado .pm-planning-indicator-icon {
        background: #4ade80;
        color: white;
      }

      .pm-planning-indicator-card.estado-parcial .pm-planning-indicator-icon {
        background: #fbbf24;
        color: white;
      }

      .pm-planning-indicator-card.estado-no_iniciado .pm-planning-indicator-icon {
        background: #d1d5db;
        color: #6b7280;
      }

      .pm-planning-indicator-content {
        flex: 1;
        min-width: 0;
      }

      .pm-planning-indicator-name {
        font-weight: 700;
        font-size: 1rem;
        margin: 0 0 0.25rem 0;
      }

      .pm-planning-indicator-progress {
        font-size: 0.85rem;
        color: var(--pm-text-muted);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .pm-planning-progress-bar {
        width: 120px;
        height: 6px;
        background: var(--pm-border);
        border-radius: 999px;
        overflow: hidden;
      }

      .pm-planning-progress-fill {
        height: 100%;
        background: var(--pm-primary);
        transition: width 0.3s;
      }

      .pm-planning-indicator-card.estado-completado .pm-planning-progress-fill {
        background: #4ade80;
      }

      .pm-planning-indicator-card.estado-parcial .pm-planning-progress-fill {
        background: #fbbf24;
      }

      .pm-planning-indicator-actions {
        display: flex;
        gap: 0.75rem;
      }

      .pm-planning-btn {
        padding: 0.6rem 1rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-planning-btn-info {
        background: var(--pm-primary);
        color: white;
      }

      .pm-planning-btn-info:hover {
        background: #0056b3;
        transform: scale(1.05);
      }

      .pm-planning-empty {
        text-align: center;
        padding: 3rem;
        color: var(--pm-text-muted);
      }

      /* Tabs */
      .pm-planning-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--pm-border);
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .pm-planning-tabs::-webkit-scrollbar { display: none; }

      .pm-planning-tab {
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        color: var(--pm-text-muted);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .pm-planning-tab:hover { color: var(--pm-primary); }
      .pm-planning-tab.active {
        color: var(--pm-primary);
        border-bottom-color: var(--pm-primary);
      }

      .pm-planning-pane { animation: pmFadeIn 0.2s ease; }
      .pm-planning-pane[hidden] { display: none; }
      @keyframes pmFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Mobile (<= 640px) */
      @media (max-width: 640px) {
        .pm-planning-container { padding: 0.75rem; }
        .pm-planning-header { padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
        .pm-planning-title { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .pm-planning-header p { font-size: 0.85rem; }
        .pm-planning-filters { flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
        .pm-planning-filter { width: 100%; }
        .pm-planning-filter select { width: 100%; min-height: 44px; font-size: 0.95rem; }
        .pm-planning-grid { gap: 1.25rem; }
        .pm-planning-indicator-card { flex-wrap: wrap; gap: 0.75rem; padding: 1rem; }
        .pm-planning-indicator-actions { width: 100%; }
        .pm-planning-btn { width: 100%; min-height: 44px; }
        .pm-planning-progress-bar { width: 100%; }
        .pm-planning-tab { padding: 0.6rem 0.75rem; font-size: 0.85rem; }
        .pm-planning-empty { padding: 1.5rem; }
      }
    </style>

    <div class="pm-planning-container">
      <div class="pm-planning-header">
        <h1 class="pm-planning-title">📚 Planificación Académica</h1>
        <p style="margin: 0; opacity: 0.9;">Semáforo visual de indicadores — Verde (completado), Naranja (parcial), Gris (no trabajado)</p>
      </div>

      <div class="pm-planning-filters">
        <div class="pm-planning-filter">
          <label>Selecciona tu Clase</label>
          <select id="pm-planning-clase-select">
            <option value="">Cargando clases...</option>
          </select>
        </div>
        <div class="pm-planning-filter">
          <label>Selecciona la Ruta</label>
          <select id="pm-planning-ruta-select">
            <option value="">Cargando rutas...</option>
          </select>
        </div>
      </div>

      <div class="pm-planning-tabs" role="tablist">
        <button class="pm-planning-tab active" data-tab="semaforo" role="tab" aria-selected="true">
          📊 Semáforo
        </button>
        <button class="pm-planning-tab" data-tab="ruta" role="tab" aria-selected="false">
          🗺️ Ruta
        </button>
        <button class="pm-planning-tab" data-tab="gestionar" role="tab" aria-selected="false">
          ⚙️ Gestionar
        </button>
        <button class="pm-planning-tab" data-tab="historial" role="tab" aria-selected="false">
          📋 Historial
        </button>
      </div>

      <div class="pm-planning-pane" data-pane="semaforo" role="tabpanel">
        <div id="pm-planning-content">
          <div class="pm-planning-empty">
            <p>Selecciona una clase y ruta para comenzar</p>
          </div>
        </div>
      </div>

      <div class="pm-planning-pane" data-pane="ruta" role="tabpanel" hidden>
        <div id="pm-planning-route-tree">
          <div class="pm-planning-empty">
            <p>Selecciona una ruta para ver su estructura</p>
          </div>
        </div>
      </div>

      <div class="pm-planning-pane" data-pane="gestionar" role="tabpanel" hidden>
        <div id="pm-planning-manager">
          <div class="pm-planning-empty">
            <p>Selecciona una ruta para gestionar su contenido</p>
          </div>
        </div>
      </div>

      <div class="pm-planning-pane" data-pane="historial" role="tabpanel" hidden>
        <div id="pm-planning-historial">
          <div class="pm-planning-empty">
            <p>Selecciona una clase para ver el historial</p>
          </div>
        </div>
      </div>
    </div>
  `;let m=`pm-planning-active-tab`,h=n.querySelectorAll(`.pm-planning-tab`),g=n.querySelectorAll(`.pm-planning-pane`);function _(e){h.forEach(t=>{let n=t.dataset.tab===e;t.classList.toggle(`active`,n),t.setAttribute(`aria-selected`,n?`true`:`false`)}),g.forEach(t=>{t.hidden=t.dataset.pane!==e});try{sessionStorage.setItem(m,e)}catch{}A(e)}h.forEach(e=>{e.addEventListener(`click`,()=>_(e.dataset.tab))});let v=n.querySelector(`#pm-planning-clase-select`),y=n.querySelector(`#pm-planning-ruta-select`),b=n.querySelector(`#pm-planning-content`);try{v.innerHTML=`<option value="">Selecciona una clase...</option>`+(await t()).map(e=>`<option value="${e.id}">${e.nombre} (${e.instrumento||`S/I`})</option>`).join(``)}catch(e){console.error(`[planning] Error cargando clases:`,e),r.error(`Error cargando clases`)}v.addEventListener(`change`,async()=>{if(s=v.value,y.value=``,o=null,b.innerHTML=`<div class="pm-planning-empty"><p>Selecciona una ruta...</p></div>`,E=null,w=null,T=null,n.querySelector(`.pm-planning-tab.active`)?.dataset.tab===`historial`&&P(),s)try{y.innerHTML=`<option value="">Selecciona una ruta...</option>`+(await e(s)).map(e=>`<option value="${e.route_version_id}">${e.name}${e.instrumento?` (${e.instrumento})`:``}</option>`).join(``)}catch(e){console.error(`[planning] Error cargando rutas:`,e),r.error(`Error cargando rutas`)}}),y.addEventListener(`change`,()=>{o=y.value||null,A(n.querySelector(`.pm-planning-tab.active`)?.dataset.tab||`semaforo`)});let x=n.querySelector(`#pm-planning-route-tree`),S=n.querySelector(`#pm-planning-manager`),C=n.querySelector(`#pm-planning-historial`),w=null,T=null,E=null,D=!1,O=!1,k=!1;function A(e){if(e===`semaforo`)return j();if(e===`ruta`)return M();if(e===`gestionar`)return N();if(e===`historial`)return P()}async function j(){if(!o||!s){b.innerHTML=`<div class="pm-planning-empty"><p>Selecciona una clase y ruta para comenzar</p></div>`;return}b.innerHTML=`<div class="pm-planning-empty"><p>Cargando indicadores...</p></div>`;try{l=await c(o,i,s),F()}catch(e){console.error(`[planning] Error cargando indicadores:`,e),r.error(`Error cargando indicadores`),b.innerHTML=`<div class="pm-planning-empty"><p>Error al cargar indicadores. Intenta de nuevo.</p></div>`}}async function M(){if(!o){x.innerHTML=`<div class="pm-planning-empty"><p>Selecciona una ruta para ver su estructura</p></div>`;return}if(!(w===o||D)){D=!0,x.innerHTML=`<div class="pm-planning-empty"><p>Cargando estructura...</p></div>`;try{let{renderPlanningRouteTree:e}=await a(async()=>{let{renderPlanningRouteTree:e}=await import(`./PlanningRouteTree-C0eObWgl.js`);return{renderPlanningRouteTree:e}},__vite__mapDeps([0,1,2,3]));await e(x,{routeVersionId:o}),w=o}catch(e){console.error(`[planning] Error cargando estructura de ruta:`,e),x.innerHTML=`<div class="pm-planning-empty"><p>Error al cargar la estructura. Intenta de nuevo.</p></div>`}finally{D=!1}}}async function N(){if(!o){S.innerHTML=`<div class="pm-planning-empty"><p>Selecciona una ruta para gestionar su contenido</p></div>`;return}if(!(T===o||O)){O=!0,S.innerHTML=`<div class="pm-planning-empty"><p>Preparando tu borrador editable…</p></div>`;try{let{renderPlanningManager:e}=await a(async()=>{let{renderPlanningManager:e}=await import(`./PlanningManagerPanel-CltKOVzb.js`);return{renderPlanningManager:e}},__vite__mapDeps([4,5,2,1,3,6,7]));await e(S,{publishedRouteVersionId:o,maestroId:i,onChanged:()=>{w=null}}),T=o}catch(e){console.error(`[planning] Error cargando gestor:`,e),S.innerHTML=`<div class="pm-planning-empty"><p>Error al cargar el gestor. Intenta de nuevo.</p></div>`}finally{O=!1}}}async function P(){if(!s){C.innerHTML=`<div class="pm-planning-empty"><p>Selecciona una clase para ver el historial</p></div>`;return}let e=`${s}:${o}`;if(!(E===e||k)){k=!0,C.innerHTML=`<div class="pm-planning-empty"><p>Cargando historial...</p></div>`;try{let{renderPlanningHistorialPane:t}=await a(async()=>{let{renderPlanningHistorialPane:e}=await import(`./PlanningHistorialPane-1rfwcBeo.js`);return{renderPlanningHistorialPane:e}},__vite__mapDeps([8,2,5,1,3,6,7]));await t(C,{maestroId:i,claseId:s,publishedRouteVersionId:o,onPromoted:()=>{o&&j()}}),E=e}catch(e){console.error(`[planning] Error cargando historial:`,e),C.innerHTML=`<div class="pm-planning-empty"><p>Error al cargar el historial. Intenta de nuevo.</p></div>`}finally{k=!1}}}try{let e=sessionStorage.getItem(m);e&&e!==`semaforo`&&_(e)}catch{}function F(){if(!l||l.length===0){b.innerHTML=`<div class="pm-planning-empty"><p>No hay indicadores en esta ruta</p></div>`;return}let e={};l.forEach(t=>{let n=t.tipo||`Sin Categoría`;e[n]||(e[n]=[]),e[n].push(t)});let t=Object.entries(e).map(([e,t])=>`
      <div class="pm-planning-group">
        <div class="pm-planning-group-title">
          ${e}
          <span style="font-size: 0.8rem; color: var(--pm-text-muted);">
            (${t.filter(e=>e.estado.estado===`completado`).length}/${t.length})
          </span>
        </div>
        ${t.map(e=>L(e)).join(``)}
      </div>
    `).join(``);b.innerHTML=`${I()}<div class="pm-planning-grid">${t}</div>`;let n=b.querySelector(`[data-faro-register]`);if(n){let e=f(l);n.addEventListener(`click`,()=>z(e))}b.querySelectorAll(`[data-indicator-id]`).forEach(e=>{let t=e.dataset.indicatorId,n=l.find(e=>e.node_id===t);e.addEventListener(`click`,async()=>{await R(n)})}),b.querySelectorAll(`[data-register-btn]`).forEach(e=>{let t=e.dataset.indicatorId,n=l.find(e=>e.node_id===t);e.addEventListener(`click`,e=>{e.stopPropagation(),z(n)})})}function I(){let e=p(l),t=f(l);return t?`
      <div class="pm-planning-faro" role="status">
        <div class="pm-planning-faro-icon">🧭</div>
        <div class="pm-planning-faro-body">
          <p class="pm-planning-faro-label">Próximo a trabajar · ${e.completados}/${e.total} completados</p>
          <p class="pm-planning-faro-title">${t.nombre}</p>
          <p class="pm-planning-faro-meta">${t.estudiantes_vieron}/${t.estudiantes_totales} alumnos lo han visto</p>
        </div>
        <button class="pm-planning-btn pm-planning-btn-info" data-faro-register>
          Registrar avance
        </button>
      </div>
    `:`
        <div class="pm-planning-faro pm-planning-faro-done" role="status">
          <div class="pm-planning-faro-icon">🎉</div>
          <div class="pm-planning-faro-body">
            <p class="pm-planning-faro-label">Ruta al día</p>
            <p class="pm-planning-faro-title">Todos los indicadores están completados (${e.completados}/${e.total})</p>
          </div>
        </div>
      `}function L(e){let t=e.progreso_porcentaje/100*100,{estado:n,icono:r,color:i}=e.estado;return`
      <div class="pm-planning-indicator-card estado-${n}" data-indicator-id="${e.node_id}">
        <div class="pm-planning-indicator-icon">${r}</div>
        <div class="pm-planning-indicator-content">
          <p class="pm-planning-indicator-name">${e.nombre}</p>
          <div class="pm-planning-indicator-progress">
            <div class="pm-planning-progress-bar">
              <div class="pm-planning-progress-fill" style="width: ${t}%"></div>
            </div>
            <span>${e.estudiantes_vieron}/${e.estudiantes_totales} alumnos</span>
          </div>
        </div>
        <div class="pm-planning-indicator-actions">
          <button class="pm-planning-btn pm-planning-btn-info" data-register-btn data-indicator-id="${e.node_id}">
            Registrar
          </button>
        </div>
      </div>
    `}async function R(e){d(n,{indicator:e,claseId:s,maestroId:i,routeVersionId:o})}async function z(e){u(n,{indicator:e,claseId:s,maestroId:i,routeVersionId:o,onSave:async()=>{try{l=await c(o,i,s),F(),r.success(`✓ Indicadores actualizados`)}catch(e){console.error(`[planning] Error reloading:`,e)}}})}}export{m as renderPlanificacionView};