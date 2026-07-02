import{s as e}from"./main-maestros-Blsiwphc.js";import{i as t}from"./supabase--PHJV0L9.js";function n(e,{alumnos:t=[],onSelect:n}){let r=document.getElementById(`pm-alumno-picker-modal`);r||(r=document.createElement(`div`),r.id=`pm-alumno-picker-modal`,r.className=`pm-modal-overlay`,r.innerHTML=`
      <div class="pm-modal-content">
        <div class="pm-modal-header">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Mencionar Alumnos</h3>
          <button class="pm-modal-close" id="pm-picker-close">&times;</button>
        </div>
        <div class="pm-modal-body" style="max-height: 300px; overflow-y: auto;">
          <div id="pm-picker-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <!-- Lista de alumnos con checkboxes -->
          </div>
        </div>
        <div class="pm-modal-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border);">
          <button class="pm-btn pm-btn-primary" id="pm-picker-insert">Insertar Menciones</button>
        </div>
      </div>
    `,document.body.appendChild(r));let i=r.querySelector(`#pm-picker-list`),a=r.querySelector(`#pm-picker-close`),o=r.querySelector(`#pm-picker-insert`);function s(){i.innerHTML=t.map(e=>`
      <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--pm-surface-2);">
        <input type="checkbox" class="pm-alumno-check" value="${e.nombre_completo.replace(/\s+/g,``)}" data-id="${e.id}">
        <span style="font-size: 0.9rem;">${e.nombre_completo}</span>
      </label>
    `).join(``)}function c(){s(),r.classList.add(`open`)}function l(){r.classList.remove(`open`)}return a.onclick=l,o.onclick=()=>{let e=Array.from(r.querySelectorAll(`.pm-alumno-check:checked`)).map(e=>`#${e.value}`);e.length>0&&n(e.join(`, `)+` `),l()},{open:c,close:l}}async function r(r,{maestroId:i}){r.innerHTML=`
    <div style="padding-bottom: 2rem;">
      <h2 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;">Crear Clase Emergente</h2>
      
      <div class="pm-card" style="padding: 1rem;">
        <div class="mb-3">
          <label class="pm-label">Fecha</label>
          <input type="date" id="eme-fecha" class="pm-input" value="${new URLSearchParams(window.location.hash.split(`?`)[1]||``).get(`fecha`)||new Date().toISOString().split(`T`)[0]}">
        </div>

        <div class="mb-3">
          <label class="pm-label">Motivo de la Clase</label>
          <select id="eme-motivo" class="pm-input">
            <option value="suplencia">Suplencia de maestro</option>
            <option value="eventual">Actividad eventual</option>
            <option value="reforzamiento">Reforzamiento académico</option>
            <option value="otro">Otro motivo</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="pm-label">Nombre de la Clase / Instrumento</label>
          <input type="text" id="eme-nombre" class="pm-input" placeholder="Ej: Refuerzo de Violín I">
        </div>

        <div class="mb-3">
          <label class="pm-label">Alumnos Participantes</label>
          <div id="eme-alumnos-chips" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="color:var(--pm-text-muted); font-size:0.8rem;">Ningún alumno seleccionado</span>
          </div>
          <button class="pm-btn" id="btn-eme-pick-alumnos" style="width:auto; padding:0.5rem 1rem; font-size:0.8rem; border:1px solid var(--pm-primary); color:var(--pm-primary);">
            + Seleccionar Alumnos
          </button>
        </div>

        <div class="mb-4">
          <label class="pm-label">Contenido / Observaciones</label>
          <textarea id="eme-contenido" class="pm-input" rows="3" placeholder="¿Qué se dio en esta clase?"></textarea>
        </div>

        <button class="pm-btn pm-btn-primary" id="btn-eme-guardar">Guardar y Continuar a Asistencia</button>
      </div>
    </div>
  `,r.querySelector(`#eme-alumnos-chips`);let a=[];try{let{data:e}=await t.from(`alumnos_clases`).select(`alumno:alumnos(id, nombre_completo)`).eq(`activo`,!0);a=(e||[]).map(e=>e.alumno).filter(Boolean)}catch(e){console.error(e)}let o=n(r,{alumnos:a,onSelect:e=>{alert(`Alumnos seleccionados correctamente`)}});r.querySelector(`#btn-eme-pick-alumnos`).onclick=()=>o.open(),r.querySelector(`#btn-eme-guardar`).onclick=async()=>{let t={maestro_id:i,fecha:r.querySelector(`#eme-fecha`).value,motivo:r.querySelector(`#eme-motivo`).value,nombre_clase:r.querySelector(`#eme-nombre`).value,contenido:r.querySelector(`#eme-contenido`).value,created_at:new Date().toISOString()};if(!t.nombre_clase){alert(`Por favor ingresa un nombre para la clase.`);return}await e({tabla:`clases_emergentes`,operacion:`insert`,payload:t}),alert(`Clase emergente registrada. Redirigiendo...`),window.location.hash=`#/hoy`}}export{r as renderClaseEmergenteView};