import{t as e}from"./AppToast-DNGTRY9B.js";import{i as t,o as n}from"./main-maestros-DhjjXu6q.js";import{i as r}from"./maestroAuth-CdApllXF.js";import{_ as i,h as a,r as o,s,v as c,x as l}from"./alumnosApi-RGOWObgH.js";function u(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function d(e){return String(e||`?`).trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function f(e){if(!e||e.length===0)return`<span style="color:var(--pm-text-muted);font-size:.8rem;">Sin horario asignado</span>`;let t={lunes:`Lun`,martes:`Mar`,miercoles:`Mié`,miércoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sabado:`Sáb`,sábado:`Sáb`,domingo:`Dom`};return e.map(e=>`<span class="gcv-horario-chip">${t[e.dia]||e.dia||``} ${(e.hora_inicio||``).slice(0,5)}–${(e.hora_fin||``).slice(0,5)}</span>`).join(` `)}var p=null,m=[],h=new Set;async function g(e){e.innerHTML=k();let n=r();if(!n){e.innerHTML=A(`bi-lock`,`Sin sesión activa`,`Por favor ingresá nuevamente.`);return}try{let r=await t(n.id);if(!r.puede_inscribir_clases){e.innerHTML=v(r),y(n.id);return}let[i,a]=await Promise.all([l(n.id),s().catch(()=>[])]);m=a.filter(e=>e.activo!==!1&&e.is_active!==!1),e.innerHTML=b(i),E(i),i.length>0&&await S(i[0].id,i)}catch(t){console.error(`[GestionarClases]`,t),e.innerHTML=A(`bi-exclamation-triangle`,`Error al cargar`,u(t.message))}}function _(e){let t=e?.solicitudes||[],n=e?.solicitud_actual;return t.includes(`clases:enroll`)||t.includes(`inscribir_clases`)||n?.estado===`pendiente`&&n?.solicita_clases}function v(e){return`
    <div class="gcv-root">
      <div class="gcv-permission-card">
        <div class="gcv-permission-icon">
          <i class="bi bi-shield-exclamation"></i>
        </div>
        <h2 class="gcv-permission-title">Acceso de Colaborador Requerido</h2>
        <p class="gcv-permission-copy">
          Para gestionar clases e inscribir alumnos, necesitás que Admin active tu permiso de clases.
        </p>
        <div id="gcv-permission-action">
          ${_(e)?`
            <div class="gcv-pending-badge">
              <i class="bi bi-clock-history"></i>
              Solicitud Pendiente de Aprobación
            </div>
          `:`
            <button class="gcv-btn gcv-btn-primary" id="gcv-btn-request-classes" type="button">
              <i class="bi bi-send-fill"></i>
              Solicitar Permiso de Clases
            </button>
          `}
        </div>
      </div>
    </div>
  `}function y(t){let r=document.getElementById(`gcv-btn-request-classes`);r&&r.addEventListener(`click`,async()=>{r.disabled=!0;let i=r.innerHTML;r.innerHTML=`<span class="gcv-spinner-sm"></span> Enviando...`;try{await n(t,`clases:enroll`),e.success(`Solicitud de permiso enviada correctamente.`);let r=document.getElementById(`gcv-permission-action`);r&&(r.innerHTML=`
          <div class="gcv-pending-badge">
            <i class="bi bi-clock-history"></i>
            Solicitud Pendiente de Aprobación
          </div>`)}catch(t){e.error(`Error al solicitar: `+t.message),r.disabled=!1,r.innerHTML=i}})}function b(e){return`
    <div class="gcv-root">
      <div class="gcv-header">
        <div class="gcv-header-left">
          <i class="bi bi-mortarboard gcv-header-icon"></i>
          <div>
            <h2 class="gcv-title">Mis Clases</h2>
            <p class="gcv-subtitle">${e.length} clase${e.length===1?``:`s`} asignada${e.length===1?``:`s`}</p>
          </div>
        </div>
      </div>

      ${e.length===0?A(`bi-calendar-x`,`Sin clases asignadas`,`El administrador debe asignarte clases primero.`):`<div class="gcv-layout">
            <div class="gcv-clase-list" id="gcv-clase-list">
              ${e.map(e=>x(e)).join(``)}
            </div>
            <div class="gcv-panel" id="gcv-panel">
              <div class="gcv-panel-placeholder">
                <i class="bi bi-arrow-left-circle" style="font-size:2.5rem;opacity:.3;"></i>
                <p style="margin-top:.75rem;opacity:.4;">Seleccioná una clase</p>
              </div>
            </div>
          </div>`}
    </div>
  `}function x(e){let t=u(e.nombre||`Clase sin nombre`),n=f(e.horarios||[]),r=u(e.nivel||``),i=e.capacidad_maxima??e.max_alumnos??`–`;return`
    <button class="gcv-clase-card" data-clase-id="${e.id}" id="gcv-card-${e.id}" type="button">
      <div class="gcv-clase-card-top">
        <div class="gcv-clase-avatar">
          <i class="bi bi-music-note-beamed"></i>
        </div>
        <div class="gcv-clase-info">
          <span class="gcv-clase-name">${t}</span>
          ${r?`<span class="gcv-clase-nivel">${r}</span>`:``}
        </div>
        <i class="bi bi-chevron-right gcv-clase-arrow"></i>
      </div>
      <div class="gcv-clase-horarios">${n}</div>
      <div class="gcv-clase-meta">
        <span><i class="bi bi-people"></i> Cap. ${i}</span>
      </div>
    </button>
  `}async function S(e,t){p=e,document.querySelectorAll(`.gcv-clase-card`).forEach(e=>e.classList.remove(`active`)),document.getElementById(`gcv-card-${e}`)?.classList.add(`active`);let n=document.getElementById(`gcv-panel`);if(!n)return;let r=t.find(t=>t.id===e);if(r){n.innerHTML=`<div class="gcv-loading"><div class="gcv-spinner"></div></div>`;try{let i=await c(e),a=i.map(e=>e.alumno).filter(Boolean);h=new Set(i.map(e=>e.alumno_id)),n.innerHTML=C(r,a,m.filter(e=>!h.has(e.id))),D(e,t)}catch(e){n.innerHTML=A(`bi-exclamation-circle`,`Error al cargar alumnos`,u(e.message))}}}function C(e,t,n){return`
    <div class="gcv-panel-inner">
      <div class="gcv-panel-header">
        <h3 class="gcv-panel-title"><i class="bi bi-people-fill"></i> ${u(e.nombre||`Clase`)}</h3>
        <span class="gcv-enrolled-badge">${t.length} alumno${t.length===1?``:`s`}</span>
      </div>

      <!-- Search bar -->
      <div class="gcv-search-bar">
        <i class="bi bi-search gcv-search-icon"></i>
        <input
          type="text"
          id="gcv-search"
          class="gcv-search-input"
          placeholder="Buscar alumno por nombre o instrumento..."
          autocomplete="off"
        />
        <button class="gcv-btn-new" id="gcv-btn-nuevo" type="button" title="Registrar nuevo alumno">
          <i class="bi bi-person-plus"></i>
          <span>Nuevo</span>
        </button>
      </div>

      <!-- Quick register form -->
      <div class="gcv-new-form d-none" id="gcv-new-form">
        <p class="gcv-new-form-title"><i class="bi bi-person-plus-fill"></i> Registrar nuevo alumno</p>
        <div class="gcv-new-form-grid">
          <input type="text" id="gcv-nuevo-nombre" class="gcv-input" placeholder="Nombre completo *" />
          <input type="text" id="gcv-nuevo-instrumento" class="gcv-input" placeholder="Instrumento *" />
          <input type="tel" id="gcv-nuevo-telefono" class="gcv-input" placeholder="Teléfono representante *" />
        </div>
        <div class="gcv-new-form-actions">
          <button type="button" class="gcv-btn gcv-btn-ghost" id="gcv-btn-cancelar-nuevo">Cancelar</button>
          <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-guardar-nuevo">
            <i class="bi bi-floppy"></i> Guardar e inscribir
          </button>
        </div>
      </div>

      <!-- Enrolled students -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <span class="gcv-section-label"><i class="bi bi-check-circle-fill gcv-icon-success"></i> Inscritos</span>
          <span class="gcv-section-count" id="gcv-count-inscritos">${t.length}</span>
        </div>
        <div id="gcv-lista-inscritos" class="gcv-student-list">
          ${t.length===0?`<p class="gcv-empty-list">Sin alumnos inscritos aún.</p>`:t.map(e=>w(e)).join(``)}
        </div>
      </div>

      <div class="gcv-divider"></div>

      <!-- Available students -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <span class="gcv-section-label"><i class="bi bi-person-plus-fill gcv-icon-primary"></i> Agregar alumno</span>
          <span class="gcv-section-count" id="gcv-count-disponibles">${n.length} disponibles</span>
        </div>
        <div id="gcv-lista-disponibles" class="gcv-student-list gcv-available-list">
          ${n.length===0?`<p class="gcv-empty-list">Todos los alumnos activos ya están inscritos.</p>`:n.map(e=>T(e)).join(``)}
        </div>
        ${n.length>0?`
          <div class="gcv-add-actions">
            <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-inscribir">
              <i class="bi bi-person-check"></i> Inscribir seleccionados
            </button>
          </div>
        `:``}
      </div>
    </div>
  `}function w(e){let t=u(e.nombre_completo||e.nombre||`Alumno`),n=u(e.instrumento_principal||e.instrumento||``);return`
    <div class="gcv-student-row inscrito-item"
         data-alumno-id="${e.id}"
         data-name="${t.toLowerCase()}"
         data-instrumento="${n.toLowerCase()}">
      <div class="gcv-student-avatar gcv-avatar-success">${d(t)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${t}</span>
        ${n?`<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${n}</span>`:``}
      </div>
      <button type="button" class="gcv-btn-remove desinscribir-btn" data-alumno-id="${e.id}" title="Quitar de la clase">
        <i class="bi bi-person-x"></i>
      </button>
    </div>
  `}function T(e){let t=u(e.nombre_completo||e.nombre||`Alumno`),n=u(e.instrumento_principal||e.instrumento||``);return`
    <label class="gcv-student-row gcv-student-selectable disponible-item"
           data-alumno-id="${e.id}"
           data-name="${t.toLowerCase()}"
           data-instrumento="${n.toLowerCase()}">
      <input class="gcv-checkbox" type="checkbox" value="${e.id}" />
      <div class="gcv-student-avatar gcv-avatar-primary">${d(t)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${t}</span>
        ${n?`<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${n}</span>`:``}
      </div>
    </label>
  `}function E(e){document.getElementById(`gcv-clase-list`)?.addEventListener(`click`,async t=>{let n=t.target.closest(`.gcv-clase-card`);if(!n)return;let r=n.dataset.claseId;r&&r!==p&&await S(r,e)})}function D(t,n){document.getElementById(`gcv-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();document.querySelectorAll(`.inscrito-item`).forEach(e=>{let n=!t||(e.dataset.name||``).includes(t)||(e.dataset.instrumento||``).includes(t);e.style.display=n?``:`none`}),document.querySelectorAll(`.disponible-item`).forEach(e=>{let n=!t||(e.dataset.name||``).includes(t)||(e.dataset.instrumento||``).includes(t);e.style.display=n?``:`none`})}),document.getElementById(`gcv-btn-nuevo`)?.addEventListener(`click`,()=>{document.getElementById(`gcv-new-form`)?.classList.remove(`d-none`),document.getElementById(`gcv-nuevo-nombre`)?.focus()}),document.getElementById(`gcv-btn-cancelar-nuevo`)?.addEventListener(`click`,O),document.getElementById(`gcv-btn-guardar-nuevo`)?.addEventListener(`click`,async()=>{let r=document.getElementById(`gcv-nuevo-nombre`).value.trim(),a=document.getElementById(`gcv-nuevo-instrumento`).value.trim(),c=document.getElementById(`gcv-nuevo-telefono`).value.trim();if(!r||!a||!c){e.error(`Nombre, instrumento y teléfono son obligatorios`);return}let l=document.getElementById(`gcv-btn-guardar-nuevo`);l.disabled=!0,l.innerHTML=`<span class="gcv-spinner-sm"></span> Guardando...`;try{await i(t,(await o({nombre_completo:r,instrumento_principal:a,familiar_telefono:c,activo:!0})).id),e.success(`${r} registrado e inscrito exitosamente`),m=(await s().catch(()=>m)).filter(e=>e.activo!==!1&&e.is_active!==!1),await S(t,n)}catch(t){e.error(`Error: `+t.message),l.disabled=!1,l.innerHTML=`<i class="bi bi-floppy"></i> Guardar e inscribir`}}),document.getElementById(`gcv-lista-inscritos`)?.addEventListener(`click`,async r=>{let i=r.target.closest(`.desinscribir-btn`);if(!i)return;let o=i.dataset.alumnoId,s=i.closest(`.gcv-student-row`)?.querySelector(`.gcv-student-name`)?.textContent||`este alumno`;if(confirm(`¿Quitar a ${s} de esta clase?`)){i.disabled=!0,i.innerHTML=`<span class="gcv-spinner-sm"></span>`;try{await a(t,o),e.success(`${s} quitado de la clase`),await S(t,n)}catch(t){e.error(`Error: `+t.message),i.disabled=!1,i.innerHTML=`<i class="bi bi-person-x"></i>`}}}),document.getElementById(`gcv-btn-inscribir`)?.addEventListener(`click`,async()=>{let r=[...document.querySelectorAll(`#gcv-lista-disponibles .gcv-checkbox:checked`)];if(!r.length){e.error(`Seleccioná al menos un alumno`);return}let a=document.getElementById(`gcv-btn-inscribir`);a.disabled=!0,a.innerHTML=`<span class="gcv-spinner-sm"></span> Inscribiendo...`;try{for(let e of r)await i(t,e.value);e.success(`${r.length} alumno${r.length>1?`s`:``} inscrito${r.length>1?`s`:``} correctamente`),await S(t,n)}catch(t){e.error(`Error: `+t.message),a.disabled=!1,a.innerHTML=`<i class="bi bi-person-check"></i> Inscribir seleccionados`}})}function O(){let e=document.getElementById(`gcv-new-form`);e&&e.classList.add(`d-none`),[`gcv-nuevo-nombre`,`gcv-nuevo-instrumento`,`gcv-nuevo-telefono`].forEach(e=>{let t=document.getElementById(e);t&&(t.value=``)})}function k(){return`
    <div class="gcv-root">
      <div class="gcv-header">
        <div class="gcv-skeleton gcv-skel-title"></div>
      </div>
      <div class="gcv-layout">
        <div class="gcv-clase-list">
          ${[1,2,3].map(()=>`<div class="gcv-skeleton gcv-skel-card"></div>`).join(``)}
        </div>
        <div class="gcv-panel">
          <div class="gcv-loading"><div class="gcv-spinner"></div></div>
        </div>
      </div>
    </div>
  `}function A(e,t,n){return`
    <div class="gcv-empty-state">
      <i class="bi ${e} gcv-empty-icon"></i>
      <p class="gcv-empty-title">${t}</p>
      <p class="gcv-empty-msg">${n}</p>
    </div>
  `}export{g as renderGestionarClasesView};