import{t as e}from"./AppToast-DNGTRY9B.js";import{i as t}from"./supabase-DtQm9tmr.js";import{t as n}from"./AppModal-B_r6aHTM.js";import{b as r,d as i,g as a,h as o,m as s,p as c,r as l,t as u,u as d,x as f,y as p}from"./tareasApi-Cd330Wdd.js";var m={pendiente:{label:`Pendiente`,color:`secondary`,icon:`bi-clock`},en_progreso:{label:`En Progreso`,color:`info`,icon:`bi-play-circle`},completada:{label:`Completada`,color:`success`,icon:`bi-check-circle`},bloqueada:{label:`Bloqueada`,color:`danger`,icon:`bi-x-octagon`},cancelada:{label:`Cancelada`,color:`dark`,icon:`bi-dash-circle`},observada:{label:`Observada`,color:`warning`,icon:`bi-eye`}};function h(e){let t=m[e]??{label:e,color:`secondary`,icon:`bi-question-circle`};return`<span class="badge bg-${t.color} task-status-badge" data-estado="${e}"><i class="bi ${t.icon} me-1"></i>${t.label}</span>`}function g(){return{...m}}var _={alumno:`bi-person`,maestro:`bi-person-workspace`,postulante:`bi-person-plus`,representante:`bi-people`,instrumento:`bi-music-note-beamed`,evento:`bi-calendar-event`,otro:`bi-link-45deg`},v={alumno:`Alumno`,maestro:`Maestro`,postulante:`Postulante`,representante:`Representante`,instrumento:`Instrumento`,evento:`Evento`,otro:`Otro`};function y(e){if(!e?.entidad_tipo)return``;let t=e.entidad_tipo,n=e.entidad_label||t,r=_[t]??`bi-link-45deg`,i=v[t]??t,a=String(n).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),o=String(i).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);return`<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 task-entity-chip" title="${o}: ${a}"><i class="bi ${r} me-1"></i>${o}: ${a}</span>`}function b(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function x(e){if(!e)return``;try{return new Date(e).toLocaleString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}catch{return e}}function S(e,t=[]){let n=t.length===0?`<p class="text-muted small text-center py-2"><i class="bi bi-chat-square-dots me-1"></i>Sin comentarios aún.</p>`:t.map(e=>`
        <div class="task-comment-item d-flex gap-2 mb-3" data-comment-id="${b(e.id)}">
          <div class="task-comment-avatar flex-shrink-0 rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width:32px;height:32px;">
            <i class="bi bi-person-fill small"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-baseline gap-2 mb-1">
              <strong class="small">${b(e.autor_nombre||`Anónimo`)}</strong>
              <small class="text-muted">${x(e.created_at)}</small>
            </div>
            <p class="mb-0 small">${b(e.cuerpo)}</p>
          </div>
        </div>
      `).join(``);return`
    <div class="task-comments-panel" data-tarea-id="${b(e)}">
      <h6 class="mb-3"><i class="bi bi-chat-left-text me-1 text-primary"></i>Comentarios internos
        <span class="badge bg-secondary ms-1">${t.length}</span>
      </h6>
      <div class="task-comments-thread mb-3" style="max-height:260px;overflow-y:auto;">
        ${n}
      </div>
      <div class="task-comment-form">
        <label class="form-label small fw-semibold">Agregar comentario</label>
        <textarea class="form-control form-control-sm task-comment-input" id="taskCommentInput"
          rows="2" placeholder="Escribe tu comentario aquí..."></textarea>
        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-sm btn-primary task-comment-submit" type="button">
            <i class="bi bi-send me-1"></i>Enviar
          </button>
        </div>
      </div>
    </div>
  `}function C(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function w(e){if(!e)return``;try{return new Date(e).toLocaleString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}catch{return e}}var T={estado:`Estado`,asignado_a:`Asignado a`,prioridad:`Prioridad`,fecha_vencimiento:`Vencimiento`,entidad_tipo:`Tipo de entidad`,entidad_id:`ID de entidad`,correlation_id:`Correlation ID`};function E(e=[]){if(e.length===0)return`
      <div class="task-history-timeline">
        <h6 class="mb-3"><i class="bi bi-clock-history me-1 text-muted"></i>Historial de cambios</h6>
        <p class="text-muted small text-center py-2"><i class="bi bi-journal-x me-1"></i>Sin cambios registrados.</p>
      </div>
    `;let t=e.map(e=>{let t=T[e.campo]??C(e.campo),n=e.actor_nombre?C(e.actor_nombre):`<em class="text-muted">Sistema</em>`,r=e.valor_anterior==null?`<span class="text-muted small">—</span>`:`<span class="text-danger text-decoration-line-through small">${C(e.valor_anterior)}</span>`,i=e.valor_nuevo==null?`<span class="text-muted small">—</span>`:`<span class="text-success fw-semibold small">${C(e.valor_nuevo)}</span>`;return`
      <div class="task-history-entry d-flex gap-3 mb-3" data-history-id="${C(e.id)}">
        <div class="task-history-dot flex-shrink-0 d-flex flex-column align-items-center">
          <div class="rounded-circle bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center justify-content-center" style="width:28px;height:28px;">
            <i class="bi bi-pencil-fill text-primary" style="font-size:0.6rem;"></i>
          </div>
          <div class="task-history-line flex-grow-1 border-start border-2 border-light" style="min-height:16px;margin-left:1px;"></div>
        </div>
        <div class="flex-grow-1 pb-2">
          <div class="d-flex flex-wrap align-items-baseline gap-2 mb-1">
            <strong class="small">${t}</strong>
            <span class="small text-muted">cambió de</span>
            ${r}
            <i class="bi bi-arrow-right small text-muted"></i>
            ${i}
          </div>
          <div class="d-flex gap-2 small text-muted">
            <span><i class="bi bi-person me-1"></i>${n}</span>
            <span>·</span>
            <span><i class="bi bi-clock me-1"></i>${w(e.created_at)}</span>
          </div>
        </div>
      </div>
    `}).join(``);return`
    <div class="task-history-timeline">
      <h6 class="mb-3"><i class="bi bi-clock-history me-1 text-primary"></i>Historial de cambios
        <span class="badge bg-secondary ms-1">${e.length}</span>
      </h6>
      <div class="task-history-entries" style="max-height:280px;overflow-y:auto;">
        ${t}
      </div>
    </div>
  `}function D(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function O(e){if(!e)return``;try{return new Date(e).toLocaleDateString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}function k(e){return!e||e===0?``:e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function A(e){return e?e.startsWith(`image/`)?`bi-file-earmark-image`:e===`application/pdf`?`bi-file-earmark-pdf text-danger`:e.includes(`word`)||e.includes(`document`)?`bi-file-earmark-word text-primary`:e.includes(`sheet`)||e.includes(`excel`)?`bi-file-earmark-excel text-success`:`bi-file-earmark-text`:`bi-file-earmark`}function j(e,t=[]){let n=t.length===0?`<p class="text-muted small text-center py-2"><i class="bi bi-paperclip me-1"></i>Sin adjuntos.</p>`:t.map(e=>`
    <div class="task-attachment-item d-flex align-items-center gap-3 p-2 rounded border mb-2" data-adj-id="${D(e.id)}" data-storage-path="${D(e.storage_path)}">
      <div class="flex-shrink-0 text-muted" style="font-size:1.4rem;">
        <i class="bi ${A(e.mime_type)}"></i>
      </div>
      <div class="flex-grow-1 overflow-hidden">
        <div class="fw-semibold small text-truncate" title="${D(e.nombre)}">${D(e.nombre)}</div>
        <div class="text-muted" style="font-size:0.75rem;">
          ${e.subido_por_nombre?`<span><i class="bi bi-person me-1"></i>${D(e.subido_por_nombre)}</span>`:``}
          ${e.size_bytes?`<span class="ms-2">${k(e.size_bytes)}</span>`:``}
          ${e.created_at?`<span class="ms-2"><i class="bi bi-calendar3 me-1"></i>${O(e.created_at)}</span>`:``}
        </div>
      </div>
      <div class="flex-shrink-0">
        <button class="btn btn-sm btn-outline-secondary task-attachment-download" type="button"
          data-storage-path="${D(e.storage_path)}"
          title="Descargar ${D(e.nombre)}">
          <i class="bi bi-download"></i>
        </button>
      </div>
    </div>
  `).join(``);return`
    <div class="task-attachments-panel" data-tarea-id="${D(e)}">
      <h6 class="mb-3">
        <i class="bi bi-paperclip me-1 text-primary"></i>Adjuntos
        <span class="badge bg-secondary ms-1">${t.length}</span>
      </h6>
      <div class="task-attachments-list">
        ${n}
      </div>
    </div>
  `}function M(e,t,n){e.querySelectorAll(`.task-attachment-download`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.storagePath;if(n)try{e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;let r=await t(n);window.open(r,`_blank`,`noopener,noreferrer`)}catch(e){console.error(`[taskAttachmentsPanel] Error al obtener URL firmada:`,e.message)}finally{e.disabled=!1,e.innerHTML=`<i class="bi bi-download"></i>`}},n?{signal:n}:{})})}var N={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`},P=Object.fromEntries(Object.entries(g()).map(([e,t])=>[e,{label:t.label,color:t.color}])),F={baja:{label:`Baja`,color:`secondary`,orden:3},media:{label:`Media`,color:`info`,orden:2},alta:{label:`Alta`,color:`warning`,orden:1},critica:{label:`Crítica`,color:`danger`,orden:0}},I={tareas:[],cargando:!1,filtroEstado:`todos`,filtroDepartamento:`todos`,filtroPrioridad:`todos`,busqueda:``,departamentoFijo:null,processCode:null,correlationId:null,actor:null},L=null,R=null;async function z(){return I.departamentoFijo?i(I.departamentoFijo):d()}async function B(e){I.tareas=await z(),I.cargando=!1,G(e),J(e)}function V(e){t?.channel&&(R?.unsubscribe?.(),R=t.channel(`hermes:tareas_institucionales`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`tareas_institucionales`},async()=>{if(!L?.signal.aborted)try{await B(e)}catch(e){console.error(`[TareasView] Realtime refresh error:`,e.message)}}).subscribe())}async function H(e,t={}){L?.abort(),L=new AbortController,I.departamentoFijo=t.departamento||null,I.processCode=t.processCode||null,I.correlationId=t.correlationId||null,t.actor!==void 0&&(I.actor=t.actor);try{I.cargando=!0,U(e),await B(e),V(e)}catch(t){console.error(`[TareasView] Error:`,t.message),W(e,t.message)}return{teardown:()=>{L?.abort(),R?.unsubscribe?.(),R=null}}}function U(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando tareas institucionales...</p>
      </div>
    </div>
  `}function W(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
            <p>${Z(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>H(e,{departamento:I.departamentoFijo,actor:I.actor}),{signal:L.signal})}function G(e){let t=q(),n=e=>I.tareas.filter(t=>t.estado===e).length;e.innerHTML=`
    <div class="page-container">
      <div class="tareas-header mb-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-check2-square fs-4"></i>
          </div>
          <div>
            <h1 class="tareas-title mb-0">${Z(I.departamentoFijo?`Tareas — ${N[I.departamentoFijo]||I.departamentoFijo}`:I.processCode?`Tareas del caso ${I.processCode}`:`Tareas Institucionales`)}</h1>
            <p class="text-muted small mb-0">Sistema Hermes · delegación automática</p>
            ${I.correlationId?`<p class="text-muted small mb-0">Caso: <code>${Z(I.correlationId)}</code></p>`:``}
          </div>
        </div>

        <div class="tareas-kpis d-flex gap-2 flex-wrap">
          <div class="kpi-card bg-secondary bg-opacity-10 p-2 rounded">
            <small class="text-muted">Pendientes</small>
            <div class="fs-5 fw-bold text-secondary">${n(`pendiente`)}</div>
          </div>
          <div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
            <small class="text-muted">En Progreso</small>
            <div class="fs-5 fw-bold text-info">${n(`en_progreso`)}</div>
          </div>
          <div class="kpi-card bg-danger bg-opacity-10 p-2 rounded">
            <small class="text-muted">Bloqueadas</small>
            <div class="fs-5 fw-bold text-danger">${n(`bloqueada`)}</div>
          </div>
          <div class="kpi-card bg-success bg-opacity-10 p-2 rounded">
            <small class="text-muted">Completadas</small>
            <div class="fs-5 fw-bold text-success">${n(`completada`)}</div>
          </div>
          ${n(`observada`)>0?`<div class="kpi-card bg-warning bg-opacity-10 p-2 rounded">
                   <small class="text-muted">Observadas</small>
                   <div class="fs-5 fw-bold text-warning">${n(`observada`)}</div>
                 </div>`:``}
        </div>
      </div>

      <div class="tareas-filters mb-4 d-flex gap-2 flex-wrap">
        <div class="flex-grow-1" style="min-width: 200px;">
          <input type="text" class="form-control form-control-sm" id="buscarTarea"
            placeholder="🔍 Buscar tarea..." autocomplete="off" value="${Z(I.busqueda)}">
        </div>
        <select class="form-select form-select-sm" id="filtroEstado" style="max-width: 150px;">
          <option value="todos">Todos Estados</option>
          ${Object.entries(P).map(([e,t])=>`<option value="${e}" ${I.filtroEstado===e?`selected`:``}>${t.label}</option>`).join(``)}
        </select>
        ${I.departamentoFijo?``:`<select class="form-select form-select-sm" id="filtroDepartamento" style="max-width: 160px;">
                 <option value="todos">Todos Departamentos</option>
                 ${Object.entries(N).map(([e,t])=>`<option value="${e}" ${I.filtroDepartamento===e?`selected`:``}>${t}</option>`).join(``)}
               </select>`}
        <select class="form-select form-select-sm" id="filtroPrioridad" style="max-width: 130px;">
          <option value="todos">Toda Prioridad</option>
          ${Object.entries(F).map(([e,t])=>`<option value="${e}" ${I.filtroPrioridad===e?`selected`:``}>${t.label}</option>`).join(``)}
        </select>
      </div>

      <div id="tareasList" class="tareas-list">
        ${t.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`:t.map(K).join(``)}
      </div>
    </div>
  `}function K(e){let t=P[e.estado]||P.pendiente,n=F[e.prioridad]||F.media,r=Array.isArray(e.checklist)?e.checklist:[],i=r.filter(e=>e.completado).length,a=r.length,o=a>0?i/a*100:0,s=e.fecha_vencimiento?Math.ceil((new Date(e.fecha_vencimiento)-new Date)/864e5):null,c=s===null?`text-muted`:s<0?`text-danger`:s<3?`text-warning`:`text-muted`,l=y(e),u=h(e.estado);return`
    <div class="tarea-card card border-0 mb-3 shadow-sm" data-tarea-id="${e.id}">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="flex-shrink-0">
            <span class="badge bg-${n.color}" title="${n.label}">${n.label}</span>
          </div>
          <div class="flex-grow-1">
            <h5 class="card-title mb-1">${Z(e.titulo)}</h5>
            <p class="card-text text-muted small mb-2">${Z(e.descripcion||``)}</p>
            <div class="d-flex flex-wrap gap-2 mb-2 small align-items-center">
              <span class="text-muted"><i class="bi bi-building"></i> ${N[e.departamento]||e.departamento}</span>
              ${e.fecha_vencimiento?`<span class="${c}"><i class="bi bi-calendar"></i> ${e.fecha_vencimiento}${s!==null&&s<0?` (vencida)`:``}</span>`:``}
              ${e.event_id?`<span class="text-muted"><i class="bi bi-link-45deg"></i> Evento</span>`:``}
              ${l}
            </div>
            ${a>0?`<div class="mb-1">
                     <div class="d-flex justify-content-between align-items-center mb-1">
                       <small class="text-muted">Checklist</small>
                       <small class="text-muted">${i}/${a}</small>
                     </div>
                     <div class="progress" style="height: 6px;">
                       <div class="progress-bar bg-${t.color}" style="width: ${o}%;"></div>
                     </div>
                   </div>`:``}
          </div>
          <div class="flex-shrink-0 text-end">
            <div class="mb-2">${u}</div>
            <button class="btn btn-sm btn-outline-primary btn-detalle" data-tarea-id="${e.id}" title="Ver detalles">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function q(){let e=[...I.tareas];if(I.filtroEstado!==`todos`&&(e=e.filter(e=>e.estado===I.filtroEstado)),!I.departamentoFijo&&I.filtroDepartamento!==`todos`&&(e=e.filter(e=>e.departamento===I.filtroDepartamento)),I.filtroPrioridad!==`todos`&&(e=e.filter(e=>e.prioridad===I.filtroPrioridad)),I.busqueda){let t=I.busqueda.toLowerCase();e=e.filter(e=>e.titulo.toLowerCase().includes(t)||(e.descripcion||``).toLowerCase().includes(t))}return e.sort((e,t)=>(F[e.prioridad]?.orden??9)-(F[t.prioridad]?.orden??9)),e}function J(e){let t=L.signal,n=()=>{G(e),J(e)};e.querySelector(`#buscarTarea`)?.addEventListener(`input`,t=>{I.busqueda=t.target.value;let n=e.querySelector(`#tareasList`),r=q();n.innerHTML=r.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`:r.map(K).join(``),Y(e)},{signal:t}),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,e=>{I.filtroEstado=e.target.value,n()},{signal:t}),e.querySelector(`#filtroDepartamento`)?.addEventListener(`change`,e=>{I.filtroDepartamento=e.target.value,n()},{signal:t}),e.querySelector(`#filtroPrioridad`)?.addEventListener(`change`,e=>{I.filtroPrioridad=e.target.value,n()},{signal:t}),Y(e)}function Y(e){let t=L.signal;e.querySelectorAll(`.btn-detalle`).forEach(n=>{n.addEventListener(`click`,()=>{let t=I.tareas.find(e=>e.id===n.dataset.tareaId);t&&X(e,t)},{signal:t})})}async function X(t,i){let d=F[i.prioridad]||F.media,m=Array.isArray(i.checklist)?i.checklist:[],g=h(i.estado),_=y(i),v=[],b=[];try{[v,b]=await Promise.all([s(i.id),o(i.id)])}catch{}let x=Array.isArray(i.documentos_adjuntos)?i.documentos_adjuntos:[],C=Object.entries(P).filter(([e])=>e!==`observada`);n.open({title:i.titulo,size:`xl`,body:`
      <div class="modal-tarea-content">
        <p>${Z(i.descripcion||``)}</p>
        <div class="row mb-3">
          <div class="col-md-4"><strong>Departamento</strong><p>${N[i.departamento]||i.departamento}</p></div>
          <div class="col-md-4"><strong>Prioridad</strong><p><span class="badge bg-${d.color}">${d.label}</span></p></div>
          <div class="col-md-4"><strong>Vencimiento</strong><p>${i.fecha_vencimiento||`—`}</p></div>
        </div>

        ${_?`<div class="mb-3"><strong>Entidad asociada</strong><div class="mt-1">${_}</div></div>`:``}

        <div class="mb-3">
          <strong>Estado actual</strong>
          <div class="mt-1 mb-2">${g}</div>
          ${i.estado===`observada`?`<input type="hidden" id="modalEstado" value="observada">
                 <p class="text-muted small mt-1"><i class="bi bi-info-circle me-1"></i>Este estado sólo puede modificarse mediante una nueva transición.</p>`:`<select class="form-select form-select-sm" id="modalEstado">
                   ${C.map(([e,t])=>`<option value="${e}" ${i.estado===e?`selected`:``}>${t.label}</option>`).join(``)}
                 </select>`}
        </div>

        ${i.estado===`observada`?``:`<div class="mb-3 border rounded p-3 bg-warning bg-opacity-10">
                 <strong class="d-block mb-2"><i class="bi bi-eye me-1 text-warning"></i>Marcar como Observada</strong>
                 <p class="small text-muted mb-2">Requiere un comentario obligatorio que explique la observación.</p>
                 <textarea class="form-control form-control-sm" id="modalObservarComentario" rows="2"
                   placeholder="Motivo de la observación (obligatorio)..."></textarea>
                 <button class="btn btn-sm btn-warning mt-2" id="btnObservar" type="button">
                   <i class="bi bi-eye me-1"></i>Marcar como Observada
                 </button>
               </div>`}

        ${m.length>0?`<div class="mb-3">
                 <strong>Checklist</strong>
                 <div class="list-group list-group-flush mt-1" id="modalChecklist">
                   ${m.map((e,t)=>`
                     <label class="list-group-item px-0 d-flex align-items-center gap-2">
                       <input class="form-check-input m-0 chk-item" type="checkbox" data-idx="${t}" ${e.completado?`checked`:``}>
                       <span class="${e.completado?`text-decoration-line-through text-muted`:``}">${Z(e.item)}</span>
                     </label>`).join(``)}
                 </div>
               </div>`:``}

        <div class="mb-3">
          <strong>Feedback / notas de cierre</strong>
          <textarea class="form-control form-control-sm mt-1" id="modalFeedback" rows="2"
            placeholder="Comentario del responsable...">${Z(i.feedback||``)}</textarea>
        </div>

        <!-- SP-0: Comments, History, Attachments panels -->
        <hr>
        <div class="row g-3 mt-1">
          <div class="col-md-6">
            ${S(i.id,v)}
          </div>
          <div class="col-md-6">
            ${j(i.id,x)}
          </div>
        </div>
        <div class="mt-3">
          ${E(b)}
        </div>
      </div>
    `,saveText:`Guardar cambios`,onOpen:r=>{let o=L.signal;M(r,f,o);let c=r.querySelector(`#btnObservar`);c?.addEventListener(`click`,async()=>{let o=r.querySelector(`#modalObservarComentario`)?.value?.trim()||``;if(!o){e.show(`El comentario es obligatorio para marcar como Observada`,`error`);return}try{c.disabled=!0;let r=I.actor||{id:null,nombre:`Usuario`};await a(i.id,o,r),e.show(`Tarea marcada como Observada`,`success`),n.close?.(),await H(t,{departamento:I.departamentoFijo,actor:I.actor})}catch(t){e.show(`Error: ${t.message}`,`error`),c.disabled=!1}},{signal:o});let l=r.querySelector(`.task-comment-submit`);l?.addEventListener(`click`,async()=>{let t=r.querySelector(`.task-comment-input`),n=t?.value?.trim()||``;if(!n){e.show(`El comentario no puede estar vacío`,`error`);return}try{l.disabled=!0;let a=I.actor||{id:null,nombre:`Usuario`};await u(i.id,n,a),e.show(`Comentario agregado`,`success`),t&&(t.value=``);let o=await s(i.id),c=r.querySelector(`.task-comments-panel`);c&&(c.outerHTML=S(i.id,o))}catch(t){e.show(`Error: ${t.message}`,`error`)}finally{l.disabled=!1}},{signal:o})},onSave:async n=>{let a=n.querySelector(`#modalEstado`).value,o=n.querySelector(`#modalFeedback`).value.trim();try{let s=n.querySelectorAll(`.chk-item`);for(let e of s){let t=parseInt(e.dataset.idx,10);!!m[t]?.completado!==e.checked&&await p(i.id,t,e.checked)}a===`completada`?await l(i.id,o||null):a!==`observada`&&(await r(i.id,a),o!==(i.feedback||``)&&await c(i.id,o)),e.show(`Tarea actualizada`,`success`),await H(t,{departamento:I.departamentoFijo,actor:I.actor})}catch(t){e.show(`Error: ${t.message}`,`error`)}}})}function Z(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}export{H as t};