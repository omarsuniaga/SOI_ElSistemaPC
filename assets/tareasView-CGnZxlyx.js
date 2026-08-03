import{i as e,r as t,t as n}from"./AppModal-Du6jXNYA.js";import{i as r}from"./supabase-Cgh_dhNB.js";import{C as i,S as a,_ as o,d as s,f as c,g as l,h as u,i as d,m as f,n as p,o as m,t as h,v as ee,x as g}from"./tareas-DhHTOK4G.js";var _={pendiente:{label:`Pendiente`,color:`secondary`,icon:`bi-clock`},en_progreso:{label:`En Progreso`,color:`info`,icon:`bi-play-circle`},completada:{label:`Completada`,color:`success`,icon:`bi-check-circle`},bloqueada:{label:`Bloqueada`,color:`danger`,icon:`bi-x-octagon`},cancelada:{label:`Cancelada`,color:`dark`,icon:`bi-dash-circle`},observada:{label:`Observada`,color:`warning`,icon:`bi-eye`}};function v(e){let t=_[e]??{label:e,color:`secondary`,icon:`bi-question-circle`};return`<span class="badge bg-${t.color} task-status-badge" data-estado="${e}"><i class="bi ${t.icon} me-1"></i>${t.label}</span>`}function y(){return{..._}}var b={alumno:`bi-person`,maestro:`bi-person-workspace`,postulante:`bi-person-plus`,representante:`bi-people`,instrumento:`bi-music-note-beamed`,evento:`bi-calendar-event`,otro:`bi-link-45deg`},x={alumno:`Alumno`,maestro:`Maestro`,postulante:`Postulante`,representante:`Representante`,instrumento:`Instrumento`,evento:`Evento`,otro:`Otro`};function S(e){if(!e?.entidad_tipo)return``;let t=e.entidad_tipo,n=e.entidad_label||t,r=b[t]??`bi-link-45deg`,i=x[t]??t,a=String(n).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),o=String(i).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);return`<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 task-entity-chip" title="${o}: ${a}"><i class="bi ${r} me-1"></i>${o}: ${a}</span>`}function C(e){if(!e)return``;try{return new Date(e).toLocaleString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}catch{return e}}function w(e,n=[]){let r=n.length===0?`<p class="text-muted small text-center py-2"><i class="bi bi-chat-square-dots me-1"></i>Sin comentarios aÃºn.</p>`:n.map(e=>`
        <div class="task-comment-item d-flex gap-2 mb-3" data-comment-id="${t(e.id)}">
          <div class="task-comment-avatar flex-shrink-0 rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width:32px;height:32px;">
            <i class="bi bi-person-fill small"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-baseline gap-2 mb-1">
              <strong class="small">${t(e.autor_nombre||`AnÃ³nimo`)}</strong>
              <small class="text-muted">${C(e.created_at)}</small>
            </div>
            <p class="mb-0 small">${t(e.cuerpo)}</p>
          </div>
        </div>
      `).join(``);return`
    <div class="task-comments-panel" data-tarea-id="${t(e)}">
      <h6 class="mb-3"><i class="bi bi-chat-left-text me-1 text-primary"></i>Comentarios internos
        <span class="badge bg-secondary ms-1">${n.length}</span>
      </h6>
      <div class="task-comments-thread mb-3" style="max-height:260px;overflow-y:auto;">
        ${r}
      </div>
      <div class="task-comment-form">
        <label class="form-label small fw-semibold">Agregar comentario</label>
        <textarea class="form-control form-control-sm task-comment-input" id="taskCommentInput"
          rows="2" placeholder="Escribe tu comentario aquÃ­..."></textarea>
        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-sm btn-primary task-comment-submit" type="button">
            <i class="bi bi-send me-1"></i>Enviar
          </button>
        </div>
      </div>
    </div>
  `}function T(e){if(!e)return``;try{return new Date(e).toLocaleString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}catch{return e}}var E={estado:`Estado`,asignado_a:`Asignado a`,prioridad:`Prioridad`,fecha_vencimiento:`Vencimiento`,entidad_tipo:`Tipo de entidad`,entidad_id:`ID de entidad`,correlation_id:`Correlation ID`};function D(e=[]){if(e.length===0)return`
      <div class="task-history-timeline">
        <h6 class="mb-3"><i class="bi bi-clock-history me-1 text-muted"></i>Historial de cambios</h6>
        <p class="text-muted small text-center py-2"><i class="bi bi-journal-x me-1"></i>Sin cambios registrados.</p>
      </div>
    `;let n=e.map(e=>{let n=E[e.campo]??t(e.campo),r=e.actor_nombre?t(e.actor_nombre):`<em class="text-muted">Sistema</em>`,i=e.valor_anterior==null?`<span class="text-muted small">â€”</span>`:`<span class="text-danger text-decoration-line-through small">${t(e.valor_anterior)}</span>`,a=e.valor_nuevo==null?`<span class="text-muted small">â€”</span>`:`<span class="text-success fw-semibold small">${t(e.valor_nuevo)}</span>`;return`
      <div class="task-history-entry d-flex gap-3 mb-3" data-history-id="${t(e.id)}">
        <div class="task-history-dot flex-shrink-0 d-flex flex-column align-items-center">
          <div class="rounded-circle bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center justify-content-center" style="width:28px;height:28px;">
            <i class="bi bi-pencil-fill text-primary" style="font-size:0.6rem;"></i>
          </div>
          <div class="task-history-line flex-grow-1 border-start border-2 border-light" style="min-height:16px;margin-left:1px;"></div>
        </div>
        <div class="flex-grow-1 pb-2">
          <div class="d-flex flex-wrap align-items-baseline gap-2 mb-1">
            <strong class="small">${n}</strong>
            <span class="small text-muted">cambiÃ³ de</span>
            ${i}
            <i class="bi bi-arrow-right small text-muted"></i>
            ${a}
          </div>
          <div class="d-flex gap-2 small text-muted">
            <span><i class="bi bi-person me-1"></i>${r}</span>
            <span>Â·</span>
            <span><i class="bi bi-clock me-1"></i>${T(e.created_at)}</span>
          </div>
        </div>
      </div>
    `}).join(``);return`
    <div class="task-history-timeline">
      <h6 class="mb-3"><i class="bi bi-clock-history me-1 text-primary"></i>Historial de cambios
        <span class="badge bg-secondary ms-1">${e.length}</span>
      </h6>
      <div class="task-history-entries" style="max-height:280px;overflow-y:auto;">
        ${n}
      </div>
    </div>
  `}function O(e){if(!e)return``;try{return new Date(e).toLocaleDateString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}function k(e){return!e||e===0?``:e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function A(e){return e?e.startsWith(`image/`)?`bi-file-earmark-image`:e===`application/pdf`?`bi-file-earmark-pdf text-danger`:e.includes(`word`)||e.includes(`document`)?`bi-file-earmark-word text-primary`:e.includes(`sheet`)||e.includes(`excel`)?`bi-file-earmark-excel text-success`:`bi-file-earmark-text`:`bi-file-earmark`}function j(e,n=[]){let r=n.length===0?`<p class="text-muted small text-center py-2"><i class="bi bi-paperclip me-1"></i>Sin adjuntos.</p>`:n.map(e=>`
    <div class="task-attachment-item d-flex align-items-center gap-3 p-2 rounded border mb-2" data-adj-id="${t(e.id)}" data-storage-path="${t(e.storage_path)}">
      <div class="flex-shrink-0 text-muted" style="font-size:1.4rem;">
        <i class="bi ${A(e.mime_type)}"></i>
      </div>
      <div class="flex-grow-1 overflow-hidden">
        <div class="fw-semibold small text-truncate" title="${t(e.nombre)}">${t(e.nombre)}</div>
        <div class="text-muted" style="font-size:0.75rem;">
          ${e.subido_por_nombre?`<span><i class="bi bi-person me-1"></i>${t(e.subido_por_nombre)}</span>`:``}
          ${e.size_bytes?`<span class="ms-2">${k(e.size_bytes)}</span>`:``}
          ${e.created_at?`<span class="ms-2"><i class="bi bi-calendar3 me-1"></i>${O(e.created_at)}</span>`:``}
        </div>
      </div>
      <div class="flex-shrink-0">
        <button class="btn btn-sm btn-outline-secondary task-attachment-download" type="button"
          data-storage-path="${t(e.storage_path)}"
          title="Descargar ${t(e.nombre)}">
          <i class="bi bi-download"></i>
        </button>
      </div>
    </div>
  `).join(``);return`
    <div class="task-attachments-panel" data-tarea-id="${t(e)}">
      <h6 class="mb-3">
        <i class="bi bi-paperclip me-1 text-primary"></i>Adjuntos
        <span class="badge bg-secondary ms-1">${n.length}</span>
      </h6>
      <div class="task-attachments-list">
        ${r}
      </div>
    </div>
  `}function M(e,t,n){e.querySelectorAll(`.task-attachment-download`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.storagePath;if(n)try{e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;let r=await t(n);window.open(r,`_blank`,`noopener,noreferrer`)}catch(e){console.error(`[taskAttachmentsPanel] Error al obtener URL firmada:`,e.message)}finally{e.disabled=!1,e.innerHTML=`<i class="bi bi-download"></i>`}},n?{signal:n}:{})})}var N=[`completada`,`cancelada`];function P(e){return!e||e.entidad_tipo!==`tool_call`||N.includes(e.estado)?!1:F(e)!==null}function F(e){return!e||!Array.isArray(e.checklist)?null:e.checklist.find(e=>e&&e.item===`tool_call_payload`)?.payload??null}function I(e){return!e||typeof e!=`object`?[]:Object.entries(e).map(([e,t])=>t==null?{clave:e,valor:`—`}:typeof t==`object`?{clave:e,valor:JSON.stringify(t)}:{clave:e,valor:String(t)})}var L={DIR:`DirecciÃ³n`,ACM:`AcadÃ©mica`,ADM:`AdministraciÃ³n`,FIN:`Financiero`,LOG:`LogÃ­stica`,COM:`Comunicaciones`,TECNICO:`TÃ©cnico`},R=Object.fromEntries(Object.entries(y()).map(([e,t])=>[e,{label:t.label,color:t.color}])),z={baja:{label:`Baja`,color:`secondary`,orden:3},media:{label:`Media`,color:`info`,orden:2},alta:{label:`Alta`,color:`warning`,orden:1},critica:{label:`CrÃ­tica`,color:`danger`,orden:0}},B={tareas:[],cargando:!1,filtroEstado:`todos`,filtroDepartamento:`todos`,filtroPrioridad:`todos`,busqueda:``,departamentoFijo:null,processCode:null,correlationId:null,actor:null},V=null,H=null;async function U(){return B.departamentoFijo?c(B.departamentoFijo):s()}async function W(e){B.tareas=await U(),B.cargando=!1,Y(e),Q(e)}function G(e){r?.channel&&(H?.unsubscribe?.(),H=r.channel(`hermes:tareas_institucionales`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`tareas_institucionales`},async()=>{if(!V?.signal.aborted)try{await W(e)}catch(e){console.error(`[TareasView] Realtime refresh error:`,e.message)}}).subscribe())}async function K(e,t={}){V?.abort(),V=new AbortController,B.departamentoFijo=t.departamento||null,B.processCode=t.processCode||null,B.correlationId=t.correlationId||null,t.actor!==void 0&&(B.actor=t.actor);try{B.cargando=!0,q(e),await W(e),G(e)}catch(t){console.error(`[TareasView] Error:`,t.message),J(e,t.message)}return{teardown:()=>{V?.abort(),H?.unsubscribe?.(),H=null}}}function q(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando tareas institucionales...</p>
      </div>
    </div>
  `}function J(e,n){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
            <p>${t(n)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>K(e,{departamento:B.departamentoFijo,actor:B.actor}),{signal:V.signal})}function Y(e){let n=Z(),r=e=>B.tareas.filter(t=>t.estado===e).length;e.innerHTML=`
    <div class="page-container">
      <div class="tareas-header mb-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-check2-square fs-4"></i>
          </div>
          <div>
            <h1 class="tareas-title mb-0">${t(B.departamentoFijo?`Tareas â€” ${L[B.departamentoFijo]||B.departamentoFijo}`:B.processCode?`Tareas del caso ${B.processCode}`:`Tareas Institucionales`)}</h1>
            <p class="text-muted small mb-0">Sistema Hermes · delegación automática</p>
            ${B.correlationId?`<p class="text-muted small mb-0">Caso: <code>${t(B.correlationId)}</code></p>`:``}
          </div>
          <div class="ms-auto">
            <button class="btn btn-sm btn-outline-info" id="btnSimularTelegram">
              <i class="bi bi-telegram me-1"></i>Simular Ingesta Telegram
            </button>
          </div>
        </div>

        <div class="tareas-kpis d-flex gap-2 flex-wrap">
          <div class="kpi-card bg-secondary bg-opacity-10 p-2 rounded">
            <small class="text-muted">Pendientes</small>
            <div class="fs-5 fw-bold text-secondary">${r(`pendiente`)}</div>
          </div>
          <div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
            <small class="text-muted">En Progreso</small>
            <div class="fs-5 fw-bold text-info">${r(`en_progreso`)}</div>
          </div>
          <div class="kpi-card bg-danger bg-opacity-10 p-2 rounded">
            <small class="text-muted">Bloqueadas</small>
            <div class="fs-5 fw-bold text-danger">${r(`bloqueada`)}</div>
          </div>
          <div class="kpi-card bg-success bg-opacity-10 p-2 rounded">
            <small class="text-muted">Completadas</small>
            <div class="fs-5 fw-bold text-success">${r(`completada`)}</div>
          </div>
          ${r(`observada`)>0?`<div class="kpi-card bg-warning bg-opacity-10 p-2 rounded">
                   <small class="text-muted">Observadas</small>
                   <div class="fs-5 fw-bold text-warning">${r(`observada`)}</div>
                 </div>`:``}
        </div>
      </div>

      <div class="tareas-filters mb-4 d-flex gap-2 flex-wrap">
        <div class="flex-grow-1" style="min-width: 200px;">
          <input type="text" class="form-control form-control-sm" id="buscarTarea"
            placeholder="ðŸ” Buscar tarea..." autocomplete="off" value="${t(B.busqueda)}">
        </div>
        <select class="form-select form-select-sm" id="filtroEstado" style="max-width: 150px;">
          <option value="todos">Todos Estados</option>
          ${Object.entries(R).map(([e,t])=>`<option value="${e}" ${B.filtroEstado===e?`selected`:``}>${t.label}</option>`).join(``)}
        </select>
        ${B.departamentoFijo?``:`<select class="form-select form-select-sm" id="filtroDepartamento" style="max-width: 160px;">
                 <option value="todos">Todos Departamentos</option>
                 ${Object.entries(L).map(([e,t])=>`<option value="${e}" ${B.filtroDepartamento===e?`selected`:``}>${t}</option>`).join(``)}
               </select>`}
        <select class="form-select form-select-sm" id="filtroPrioridad" style="max-width: 130px;">
          <option value="todos">Toda Prioridad</option>
          ${Object.entries(z).map(([e,t])=>`<option value="${e}" ${B.filtroPrioridad===e?`selected`:``}>${t.label}</option>`).join(``)}
        </select>
      </div>

      <div id="tareasList" class="tareas-list">
        ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`:n.map(X).join(``)}
      </div>
    </div>
  `}function X(e){let n=R[e.estado]||R.pendiente,r=z[e.prioridad]||z.media,i=Array.isArray(e.checklist)?e.checklist:[],a=i.filter(e=>e.completado).length,o=i.length,s=o>0?a/o*100:0,c=e.fecha_vencimiento?Math.ceil((new Date(e.fecha_vencimiento)-new Date)/864e5):null,l=c===null?`text-muted`:c<0?`text-danger`:c<3?`text-warning`:`text-muted`,u=S(e),d=v(e.estado),f=e.entidad_tipo===`tool_call`;return`
    <div class="tarea-card card border-0 mb-3 shadow-sm" data-tarea-id="${e.id}">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="flex-shrink-0">
            <span class="badge bg-${r.color}" title="${r.label}">${r.label}</span>
            ${f?`<span class="badge bg-dark ms-1" title="Solicitud de aprobaciÃ³n de tool"><i class="bi bi-robot me-1"></i>Tool</span>`:``}
          </div>
          <div class="flex-grow-1">
            <h5 class="card-title mb-1">${t(e.titulo)}</h5>
            <p class="card-text text-muted small mb-2">${t(e.descripcion||``)}</p>
            <div class="d-flex flex-wrap gap-2 mb-2 small align-items-center">
              <span class="text-muted"><i class="bi bi-building"></i> ${L[e.departamento]||e.departamento}</span>
              ${e.fecha_vencimiento?`<span class="${l}"><i class="bi bi-calendar"></i> ${e.fecha_vencimiento}${c!==null&&c<0?` (vencida)`:``}</span>`:``}
              ${e.event_id?`<span class="text-muted"><i class="bi bi-link-45deg"></i> Evento</span>`:``}
              ${u}
            </div>
            ${o>0?`<div class="mb-1">
                     <div class="d-flex justify-content-between align-items-center mb-1">
                       <small class="text-muted">Checklist</small>
                       <small class="text-muted">${a}/${o}</small>
                     </div>
                     <div class="progress" style="height: 6px;">
                       <div class="progress-bar bg-${n.color}" style="width: ${s}%;"></div>
                     </div>
                   </div>`:``}
          </div>
          <div class="flex-shrink-0 text-end">
            <div class="mb-2">${d}</div>
            <button class="btn btn-sm btn-outline-primary btn-detalle" data-tarea-id="${e.id}" title="Ver detalles">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function Z(){let e=[...B.tareas];if(B.filtroEstado!==`todos`&&(e=e.filter(e=>e.estado===B.filtroEstado)),!B.departamentoFijo&&B.filtroDepartamento!==`todos`&&(e=e.filter(e=>e.departamento===B.filtroDepartamento)),B.filtroPrioridad!==`todos`&&(e=e.filter(e=>e.prioridad===B.filtroPrioridad)),B.busqueda){let t=B.busqueda.toLowerCase();e=e.filter(e=>e.titulo.toLowerCase().includes(t)||(e.descripcion||``).toLowerCase().includes(t))}return e.sort((e,t)=>(z[e.prioridad]?.orden??9)-(z[t.prioridad]?.orden??9)),e}function Q(e){let t=V.signal,n=()=>{Y(e),Q(e)};e.querySelector(`#buscarTarea`)?.addEventListener(`input`,t=>{B.busqueda=t.target.value;let n=e.querySelector(`#tareasList`),r=Z();n.innerHTML=r.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`:r.map(X).join(``),$(e)},{signal:t}),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,e=>{B.filtroEstado=e.target.value,n()},{signal:t}),e.querySelector(`#filtroDepartamento`)?.addEventListener(`change`,e=>{B.filtroDepartamento=e.target.value,n()},{signal:t}),e.querySelector(`#filtroPrioridad`)?.addEventListener(`change`,e=>{B.filtroPrioridad=e.target.value,n()},{signal:t}),e.querySelector(`#btnSimularTelegram`)?.addEventListener(`click`,()=>ne(e),{signal:t}),$(e)}function $(e){let t=V.signal;e.querySelectorAll(`.btn-detalle`).forEach(n=>{n.addEventListener(`click`,()=>{let t=B.tareas.find(e=>e.id===n.dataset.tareaId);t&&te(e,t)},{signal:t})})}async function te(r,s){let c=z[s.prioridad]||z.media,m=Array.isArray(s.checklist)?s.checklist:[],_=v(s.estado),y=S(s),b=[],x=[];try{[b,x]=await Promise.all([u(s.id),l(s.id)])}catch{}let C=Array.isArray(s.documentos_adjuntos)?s.documentos_adjuntos:[],T=Object.entries(R).filter(([e])=>e!==`observada`),E=P(s),O=E?F(s):null,k=O?I(O.args):[];n.open({title:s.titulo,size:`xl`,body:`
      <div class="modal-tarea-content">
        <p>${t(s.descripcion||``)}</p>
        <div class="row mb-3">
          <div class="col-md-4"><strong>Departamento</strong><p>${L[s.departamento]||s.departamento}</p></div>
          <div class="col-md-4"><strong>Prioridad</strong><p><span class="badge bg-${c.color}">${c.label}</span></p></div>
          <div class="col-md-4"><strong>Vencimiento</strong><p>${s.fecha_vencimiento||`â€”`}</p></div>
        </div>

        ${y?`<div class="mb-3"><strong>Entidad asociada</strong><div class="mt-1">${y}</div></div>`:``}

        ${E&&O?`<div class="mb-3 border rounded p-3 bg-dark bg-opacity-10" id="toolApprovalPanel">
                 <strong class="d-block mb-2"><i class="bi bi-robot me-1"></i>Solicitud de ejecuciÃ³n de tool</strong>
                 <div class="row mb-2 small">
                   <div class="col-md-6"><span class="text-muted">Tool</span><p class="mb-0 fw-semibold">${t(s.entidad_label||O.tool_name)}</p></div>
                   <div class="col-md-6"><span class="text-muted">Departamento</span><p class="mb-0">${L[s.departamento]||s.departamento}</p></div>
                 </div>
                 ${k.length>0?`<table class="table table-sm table-borderless mb-2">
                          <tbody>
                            ${k.map(e=>`<tr><td class="text-muted small" style="width:40%;">${t(e.clave)}</td><td class="small">${t(e.valor)}</td></tr>`).join(``)}
                          </tbody>
                        </table>`:`<p class="text-muted small mb-2">Esta tool no requiere argumentos.</p>`}
                 <textarea class="form-control form-control-sm mb-2" id="toolRechazoMotivo" rows="2"
                   placeholder="Motivo del rechazo (obligatorio solo si rechazÃ¡s)..."></textarea>
                 <div class="d-flex gap-2">
                   <button class="btn btn-sm btn-success" id="btnAprobarTool" type="button">
                     <i class="bi bi-check-circle me-1"></i>Aprobar y ejecutar
                   </button>
                   <button class="btn btn-sm btn-outline-danger" id="btnRechazarTool" type="button">
                     <i class="bi bi-x-circle me-1"></i>Rechazar
                   </button>
                 </div>
               </div>`:``}

        <div class="mb-3">
          <strong>Estado actual</strong>
          <div class="mt-1 mb-2">${_}</div>
          ${s.estado===`observada`?`<input type="hidden" id="modalEstado" value="observada">
                 <p class="text-muted small mt-1"><i class="bi bi-info-circle me-1"></i>Este estado sÃ³lo puede modificarse mediante una nueva transiciÃ³n.</p>`:`<select class="form-select form-select-sm" id="modalEstado">
                   ${T.map(([e,t])=>`<option value="${e}" ${s.estado===e?`selected`:``}>${t.label}</option>`).join(``)}
                 </select>`}
        </div>

        ${s.estado===`observada`?``:`<div class="mb-3 border rounded p-3 bg-warning bg-opacity-10">
                 <strong class="d-block mb-2"><i class="bi bi-eye me-1 text-warning"></i>Marcar como Observada</strong>
                 <p class="small text-muted mb-2">Requiere un comentario obligatorio que explique la observaciÃ³n.</p>
                 <textarea class="form-control form-control-sm" id="modalObservarComentario" rows="2"
                   placeholder="Motivo de la observaciÃ³n (obligatorio)..."></textarea>
                 <button class="btn btn-sm btn-warning mt-2" id="btnObservar" type="button">
                   <i class="bi bi-eye me-1"></i>Marcar como Observada
                 </button>
               </div>`}

        ${m.length>0?`<div class="mb-3">
                 <strong>Checklist</strong>
                 <div class="list-group list-group-flush mt-1" id="modalChecklist">
                   ${m.map((e,n)=>`
                     <label class="list-group-item px-0 d-flex align-items-center gap-2">
                       <input class="form-check-input m-0 chk-item" type="checkbox" data-idx="${n}" ${e.completado?`checked`:``}>
                       <span class="${e.completado?`text-decoration-line-through text-muted`:``}">${t(e.item)}</span>
                     </label>`).join(``)}
                 </div>
               </div>`:``}

        <div class="mb-3">
          <strong>Feedback / notas de cierre</strong>
          <textarea class="form-control form-control-sm mt-1" id="modalFeedback" rows="2"
            placeholder="Comentario del responsable...">${t(s.feedback||``)}</textarea>
        </div>

        <!-- SP-0: Comments, History, Attachments panels -->
        <hr>
        <div class="row g-3 mt-1">
          <div class="col-md-6">
            ${w(s.id,b)}
          </div>
          <div class="col-md-6">
            ${j(s.id,C)}
          </div>
        </div>
        <div class="mt-3">
          ${D(x)}
        </div>
      </div>
    `,saveText:`Guardar cambios`,onOpen:t=>{let a=V.signal;M(t,i,a);let c=t.querySelector(`#btnObservar`);c?.addEventListener(`click`,async()=>{let i=t.querySelector(`#modalObservarComentario`)?.value?.trim()||``;if(!i){e.show(`El comentario es obligatorio para marcar como Observada`,`error`);return}try{c.disabled=!0;let t=B.actor||{id:null,nombre:`Usuario`};await o(s.id,i,t),e.show(`Tarea marcada como Observada`,`success`),n.close?.(),await K(r,{departamento:B.departamentoFijo,actor:B.actor})}catch(t){e.show(`Error: ${t.message}`,`error`),c.disabled=!1}},{signal:a});let l=t.querySelector(`#btnAprobarTool`),d=t.querySelector(`#btnRechazarTool`);l?.addEventListener(`click`,async()=>{try{l.disabled=!0,d&&(d.disabled=!0);let t=B.actor||{id:null,nombre:`Usuario`},i=await p(s.id,t);e.show(i?.mensaje||`Tool ejecutada correctamente`,`success`),n.close?.(),await K(r,{departamento:B.departamentoFijo,actor:B.actor})}catch(t){e.show(`Error al aprobar la tool: ${t.message}`,`error`),l.disabled=!1,d&&(d.disabled=!1)}},{signal:a}),d?.addEventListener(`click`,async()=>{let i=t.querySelector(`#toolRechazoMotivo`)?.value?.trim()||``;if(!i){e.show(`El motivo del rechazo es obligatorio`,`error`);return}try{d.disabled=!0,l&&(l.disabled=!0);let t=B.actor||{id:null,nombre:`Usuario`};await ee(s.id,i,t),e.show(`Solicitud de tool rechazada`,`success`),n.close?.(),await K(r,{departamento:B.departamentoFijo,actor:B.actor})}catch(t){e.show(`Error al rechazar la tool: ${t.message}`,`error`),d.disabled=!1,l&&(l.disabled=!1)}},{signal:a});let f=t.querySelector(`.task-comment-submit`);f?.addEventListener(`click`,async()=>{let n=t.querySelector(`.task-comment-input`),r=n?.value?.trim()||``;if(!r){e.show(`El comentario no puede estar vacÃ­o`,`error`);return}try{f.disabled=!0;let i=B.actor||{id:null,nombre:`Usuario`};await h(s.id,r,i),e.show(`Comentario agregado`,`success`),n&&(n.value=``);let a=await u(s.id),o=t.querySelector(`.task-comments-panel`);o&&(o.outerHTML=w(s.id,a))}catch(t){e.show(`Error: ${t.message}`,`error`)}finally{f.disabled=!1}},{signal:a})},onSave:async t=>{let n=t.querySelector(`#modalEstado`).value,i=t.querySelector(`#modalFeedback`).value.trim();try{let o=t.querySelectorAll(`.chk-item`);for(let e of o){let t=parseInt(e.dataset.idx,10);!!m[t]?.completado!==e.checked&&await g(s.id,t,e.checked)}n===`completada`?await d(s.id,i||null):n!==`observada`&&(await a(s.id,n),i!==(s.feedback||``)&&await f(s.id,i)),e.show(`Tarea actualizada`,`success`),await K(r,{departamento:B.departamentoFijo,actor:B.actor})}catch(t){e.show(`Error: ${t.message}`,`error`)}}})}function ne(t){n.open({title:`Simulador de Ingesta de Telegram (Bot de Tareas)`,size:`md`,body:`
      <div class="mb-3">
        <label class="form-label small fw-semibold">Mensaje de Telegram</label>
        <textarea class="form-control" id="telegramMsg" rows="3" 
                  placeholder="Ej: direccion urgente necesito una constancia de estudios para beca"></textarea>
        <p class="text-muted small mt-1" style="font-size:11px">Escribe tu mensaje indicando el departamento como prefijo (ej: direccion, docencia, atencion, luteria, calidad, desarrollo).</p>
      </div>
      <div class="mb-2">
        <label class="form-label small fw-semibold">Simular Usuario</label>
        <select class="form-select form-select-sm" id="telegramUser">
          <option value="1">Juan Pérez (Docente)</option>
          <option value="2">María Gómez (Coordinadora)</option>
          <option value="3">Pedro Núñez (Luthier)</option>
        </select>
      </div>
    `,saveText:`Procesar con IA (Groq)`,onSave:async n=>{let r=n.querySelector(`#telegramMsg`).value.trim();if(!r)return e.show(`Escribe un mensaje primero`,`error`),!1;try{let n=/^(direccion|secretaria|docencia|atencion|calidad|desarrollo|dirección|luteria|finanzas)/i,i=r.match(n);if(!i)return e.show(`Formato incorrecto. El mensaje debe comenzar con el departamento.`,`error`),!1;let a={direccion:`DIR`,secretaria:`SEC`,docencia:`ACM`,atencion:`ADM`,calidad:`DIR`,desarrollo:`ACM`,luteria:`LOG`,finanzas:`FIN`}[i[1].toLowerCase()]||`DIR`,o=r.replace(n,``).trim();await m({titulo:`Telegram: ${o.length>50?o.substring(0,50)+`...`:o}`,descripcion:`Mensaje de Telegram: "${r}"`,departamento:a,estado:`pendiente`,prioridad:r.toLowerCase().includes(`urgente`)?`alta`:`media`,correlation_id:`corr_tg_${Date.now()}`}),e.show(`Mensaje procesado: Tarea creada en `+a,`success`),await W(t)}catch(t){return e.show(`Error al procesar: `+t.message,`error`),!1}}})}export{K as t};