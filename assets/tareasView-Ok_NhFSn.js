import{i as e,r as t,s as n,t as r}from"./AppModal-Du6jXNYA.js";import{i}from"./supabase-Cgh_dhNB.js";import{r as a,t as o}from"./jspdf.plugin.autotable-DPzO4huE.js";var s=[/ignore\s+(all\s+)?(previous\s+)?instructions?/i,/system\s+prompt/i,/developer\s+mode/i,/jailbreak/i,/mu[eé]strame\s+tu\s+prompt/i,/dime\s+tu\s+prompt/i,/dime\s+qu[eé]\s+procesos?\s+sigues?/i,/consulta\s+la\s+base/i,/extrae\s+datos/i,/sql/i,/base\s+de\s+datos/i,/token[s]?\s+máxim[oa]/i],c=Object.freeze({maxTokensPerTurn:350,maxTokensPerSession:1200,maxMessagesPerMinute:10,maxRetriesPerTopic:3,maxCharsPerMessage:1200});function l(e=``){let t=String(e||``);return s.some(e=>e.test(t))}function u(e=``,t=c.maxCharsPerMessage){let n=String(e||``);return n.length<=t?n:`${n.slice(0,Math.max(0,t-1)).trimEnd()}…`}function d(e=``){return l(e)}function f(){return`Disculpe la molestia, solo puedo asistirle con información institucional autorizada. ¿En qué más puedo ayudarle?`}var p=n({actualizarEntidadAsociada:()=>ye,agregarAdjunto:()=>be,agregarComentario:()=>_e,aprobarToolCall:()=>Ce,closeProcessCase:()=>ce,completarTarea:()=>fe,crearEventoInstitucional:()=>me,crearTareaInstitucional:()=>he,getConsultaEstado:()=>oe,getProcedimientos:()=>ae,getProcessCaseDetail:()=>v,getProcessContracts:()=>_,getTareaById:()=>re,getTareas:()=>ne,getTareasByDepartamento:()=>ie,getTareasByEvento:()=>y,getTareasFiltradas:()=>b,guardarFeedback:()=>pe,listarComentarios:()=>ge,listarHistorial:()=>ve,observarTarea:()=>Se,rechazarToolCall:()=>we,reportarAlumnoRiesgo:()=>le,startProcessCase:()=>se,updateChecklistItem:()=>de,updateTareaEstado:()=>ue,urlFirmada:()=>xe}),m=`tareas_institucionales`,h=`id, titulo, descripcion, departamento, estado, prioridad, fecha_vencimiento, asignado_a, checklist, feedback, documentos_adjuntos, event_id, minuta_id, process_code, created_at, updated_at, entidad_tipo, entidad_id, entidad_label, correlation_id, updated_by, updated_by_nombre`,ee=`tareas`,te=3600,g=[`alumno`,`maestro`,`postulante`,`representante`,`instrumento`,`evento`,`otro`];async function ne(){let{data:e,error:t}=await i.from(m).select(h).order(`fecha_vencimiento`,{ascending:!0,nullsFirst:!1});if(t)throw t;return e||[]}async function re(e){let{data:t,error:n}=await i.from(m).select(h).eq(`id`,e).single();if(n)throw n;return t}async function ie(e){let{data:t,error:n}=await i.from(m).select(h).eq(`departamento`,e).order(`fecha_vencimiento`,{ascending:!0,nullsFirst:!1});if(n)throw n;return t||[]}async function ae(){let{data:e,error:t}=await i.rpc(`fn_procedimientos_resumen`);if(t)throw t;return e||[]}async function oe(){let{data:e,error:t}=await i.rpc(`fn_hermes_consulta_estado`);if(t)throw t;return e}async function _({active:e=!0,owner:t=null}={}){let n=i.from(`soi_process_contracts`).select(`process_code, process_name, department_owner, canonical_doc_path, doc_id, trigger_type, required_evidence, closure_criteria, responsible_departments, task_templates, automation_status, recurrence_count, active, metadata, created_at, updated_at`);e!=null&&(n=n.eq(`active`,e)),t&&(n=n.eq(`department_owner`,t));let{data:r,error:a}=await n.order(`process_code`,{ascending:!0});if(a)throw a;return r||[]}async function se(e={}){if(!e.process_code)throw Error(`process_code requerido para abrir un caso SOI`);let{data:t,error:n}=await i.rpc(`fn_hermes_start_process_case`,{p_process_code:e.process_code,p_title:e.title||null,p_description:e.description||null,p_source:e.source||`manual`,p_priority:e.priority||`media`,p_requested_by:e.requested_by||null,p_requested_by_name:e.requested_by_name||null,p_entity_type:e.entity_type||null,p_entity_id:e.entity_id||null,p_entity_label:e.entity_label||null,p_metadata:e.metadata||{}});if(n)throw n;return t}async function v({correlationId:e=null,processCode:t=null}={}){let n={};e&&(n.correlation_id=e),t&&(n.process_code=t);let[r,i]=await Promise.all([_(),b(n)]);return{contract:t?r.find(e=>e.process_code===t)||null:i[0]?.process_code&&r.find(e=>e.process_code===i[0].process_code)||null,correlation_id:e||i[0]?.correlation_id||null,tasks:i,metrics:{total:i.length,completadas:i.filter(e=>e.estado===`completada`).length,bloqueadas:i.filter(e=>e.estado===`bloqueada`).length,observadas:i.filter(e=>e.estado===`observada`).length,evidencias:i.reduce((e,t)=>e+(Array.isArray(t.documentos_adjuntos)?t.documentos_adjuntos.length:0),0)}}}async function ce({caseId:e,closureSummary:t=null,actor:n={},force:r=!1}={}){if(!e)throw Error(`caseId es requerido para cerrar un caso`);let a=r?`fn_hermes_force_close_process_case`:`fn_hermes_close_process_case`,{data:o,error:s}=await i.rpc(a,{p_case_id:e,p_closure_summary:t,p_actor_id:n.id||null,p_actor_nombre:n.nombre||null});if(s)throw s;return o}async function le(e,t,n,r={}){let{data:a,error:o}=await i.rpc(`fn_reportar_alumno_riesgo`,{p_alumno_id:e||null,p_alumno_nombre:t||null,p_motivo:n||null,p_actor_id:r.id||null,p_actor_nombre:r.nombre||null});if(o)throw o;return a}async function y(e){let{data:t,error:n}=await i.from(m).select(h).eq(`event_id`,e).order(`fecha_vencimiento`,{ascending:!0,nullsFirst:!1});if(n)throw n;return t||[]}async function ue(e,t){let{data:n,error:r}=await i.from(m).update({estado:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(h).single();if(r)throw r;return n}async function de(e,t,n){let{data:r,error:a}=await i.from(m).select(`checklist`).eq(`id`,e).single();if(a)throw a;let o=Array.isArray(r.checklist)?r.checklist:[];if(t<0||t>=o.length)throw Error(`Índice de checklist fuera de rango`);o[t]={...o[t],completado:n};let{data:s,error:c}=await i.from(m).update({checklist:o,updated_at:new Date().toISOString()}).eq(`id`,e).select(h).single();if(c)throw c;return s}async function fe(e,t=null){let n={estado:`completada`,updated_at:new Date().toISOString()};t!=null&&(n.feedback=t);let{data:r,error:a}=await i.from(m).update(n).eq(`id`,e).select(h).single();if(a)throw a;return r}async function pe(e,t){let{data:n,error:r}=await i.from(m).update({feedback:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(h).single();if(r)throw r;return n}async function me(e){let t={titulo:e.titulo,descripcion:e.descripcion||null,categoria:e.categoria||`otro`,fecha_inicio:e.fecha_inicio,fecha_fin:e.fecha_fin||e.fecha_inicio,ubicacion:e.ubicacion||null,departamento_responsable:e.departamento_responsable||`DIR`},{data:n,error:r}=await i.from(`calendario_institucional`).insert(t).select(`id, titulo, categoria, fecha_inicio, fecha_fin, departamento_responsable`).single();if(r)throw r;let a=[];try{a=await y(n.id)}catch{}return{evento:n,tareasGeneradas:a}}async function he(e){let t=u(e.titulo||``,c.maxCharsPerMessage),n=u(e.descripcion||``,c.maxCharsPerMessage*2);if(d(`${t}\n${n}`))throw Error(`Solicitud bloqueada por política de seguridad WhatsApp + HERMES`);let r={titulo:t,descripcion:n||null,departamento:e.departamento,estado:e.estado||`pendiente`,prioridad:e.prioridad||`media`,fecha_vencimiento:e.fecha_vencimiento||null,asignado_a:e.asignado_a||null,checklist:e.checklist||[],process_code:e.process_code||null},{data:a,error:o}=await i.from(m).insert(r).select(h).single();if(o)throw o;return a}async function b(e={}){let t=i.from(m).select(h);e.departamento&&(t=t.eq(`departamento`,e.departamento)),e.estado&&(t=t.eq(`estado`,e.estado)),e.prioridad&&(t=t.eq(`prioridad`,e.prioridad)),e.asignado_a&&(t=t.eq(`asignado_a`,e.asignado_a)),e.event_id&&(t=t.eq(`event_id`,e.event_id)),e.process_code&&(t=t.eq(`process_code`,e.process_code)),e.correlation_id&&(t=t.eq(`correlation_id`,e.correlation_id)),e.buscar&&(t=t.or(`titulo.ilike.%${e.buscar}%,descripcion.ilike.%${e.buscar}%`));let{data:n,error:r}=await t.order(`fecha_vencimiento`,{ascending:!0,nullsFirst:!1});if(r)throw r;return n||[]}async function ge(e){let{data:t,error:n}=await i.from(`tarea_comentarios`).select(`id, tarea_id, autor_id, autor_nombre, cuerpo, created_at`).eq(`tarea_id`,e).order(`created_at`,{ascending:!0});if(n)throw n;return t||[]}async function _e(e,t,n){if(!t||t.trim().length===0)throw Error(`El comentario no puede estar vacío (comentario vacío)`);let{data:r,error:a}=await i.from(`tarea_comentarios`).insert({tarea_id:e,autor_id:n?.id??null,autor_nombre:n?.nombre??null,cuerpo:t.trim()}).select(`id, tarea_id, autor_id, autor_nombre, cuerpo, created_at`).single();if(a)throw a;return r}async function ve(e){let{data:t,error:n}=await i.from(`tarea_historial`).select(`id, tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre, actor_rol, actor_departamento, created_at`).eq(`tarea_id`,e).order(`created_at`,{ascending:!0});if(n)throw n;return t||[]}async function ye(e,t,n){if(!g.includes(t.tipo))throw Error(`tipo inválido: "${t.tipo}". Debe ser uno de: ${g.join(`, `)}`);let{data:r,error:a}=await i.from(m).update({entidad_tipo:t.tipo,entidad_id:t.id,entidad_label:t.label,updated_by:n?.id??null,updated_by_nombre:n?.nombre??null,updated_at:new Date().toISOString()}).eq(`id`,e).select(h).single();if(a)throw a;return r}async function be(e,t){if(!t?.storage_path)throw Error(`storage_path requerido en el adjunto (required)`);let{data:n,error:r}=await i.from(m).select(`documentos_adjuntos`).eq(`id`,e).single();if(r)throw r;let a=Array.isArray(n.documentos_adjuntos)?n.documentos_adjuntos:[];a.push(t);let{data:o,error:s}=await i.from(m).update({documentos_adjuntos:a,updated_at:new Date().toISOString()}).eq(`id`,e).select(h).single();if(s)throw s;return o}async function xe(e){let{data:t,error:n}=await i.storage.from(ee).createSignedUrl(e,te);if(n)throw n;return t.signedUrl}async function Se(e,t,n){if(!t||t.trim().length===0)throw Error(`El comentario es requerido para observar una tarea (comentario vacío requerido)`);let{error:r}=await i.rpc(`fn_observar_tarea`,{p_tarea_id:e,p_comentario:t.trim(),p_actor_id:n?.id??null,p_actor_nombre:n?.nombre??null});if(r)throw r}async function Ce(e,t){let{error:n}=await i.from(m).update({estado:`completada`,updated_by:t?.id??null,updated_by_nombre:t?.nombre??null,updated_at:new Date().toISOString()}).eq(`id`,e).eq(`entidad_tipo`,`tool_call`);if(n)throw n;let{data:r,error:a}=await i.functions.invoke(`tool-gateway`,{body:{tarea_id:e}});if(a)throw a;if(r?.error)throw Error(r.error);return r}async function we(e,t,n){if(!t||t.trim().length===0)throw Error(`El motivo de rechazo es obligatorio (comentario vacío)`);let{error:r}=await i.from(m).update({estado:`cancelada`,feedback:t.trim(),updated_by:n?.id??null,updated_by_nombre:n?.nombre??null,updated_at:new Date().toISOString()}).eq(`id`,e).eq(`entidad_tipo`,`tool_call`);if(r)throw r}var x=p,S=x.getTareas;x.getTareaById;var Te=x.getTareasByDepartamento,Ee=x.getTareasByEvento,C=x.updateTareaEstado,De=x.updateChecklistItem,w=x.completarTarea,T=x.guardarFeedback,E=x.getTareasFiltradas,Oe=x.crearEventoInstitucional,D=x.crearTareaInstitucional,O=x.listarComentarios,ke=x.agregarComentario,Ae=x.listarHistorial;x.actualizarEntidadAsociada,x.agregarAdjunto;var je=x.urlFirmada,Me=x.observarTarea,Ne=x.aprobarToolCall,Pe=x.rechazarToolCall,Fe=x.getProcedimientos,Ie=x.reportarAlumnoRiesgo,Le=x.getConsultaEstado,Re=x.getProcessContracts,ze=x.startProcessCase,Be=x.getProcessCaseDetail,Ve=x.closeProcessCase,k={pendiente:{label:`Pendiente`,color:`secondary`,icon:`bi-clock`},en_progreso:{label:`En Progreso`,color:`info`,icon:`bi-play-circle`},completada:{label:`Completada`,color:`success`,icon:`bi-check-circle`},bloqueada:{label:`Bloqueada`,color:`danger`,icon:`bi-x-octagon`},cancelada:{label:`Cancelada`,color:`dark`,icon:`bi-dash-circle`},observada:{label:`Observada`,color:`warning`,icon:`bi-eye`}};function A(e){let t=k[e]??{label:e,color:`secondary`,icon:`bi-question-circle`};return`<span class="badge bg-${t.color} task-status-badge" data-estado="${e}"><i class="bi ${t.icon} me-1"></i>${t.label}</span>`}function He(){return{...k}}var Ue={alumno:`bi-person`,maestro:`bi-person-workspace`,postulante:`bi-person-plus`,representante:`bi-people`,instrumento:`bi-music-note-beamed`,evento:`bi-calendar-event`,otro:`bi-link-45deg`},We={alumno:`Alumno`,maestro:`Maestro`,postulante:`Postulante`,representante:`Representante`,instrumento:`Instrumento`,evento:`Evento`,otro:`Otro`};function j(e){if(!e?.entidad_tipo)return``;let t=e.entidad_tipo,n=e.entidad_label||t,r=Ue[t]??`bi-link-45deg`,i=We[t]??t,a=String(n).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),o=String(i).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);return`<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 task-entity-chip" title="${o}: ${a}"><i class="bi ${r} me-1"></i>${o}: ${a}</span>`}function Ge(e){if(!e)return``;try{return new Date(e).toLocaleString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}catch{return e}}function M(e,n=[]){let r=n.length===0?`<p class="text-muted small text-center py-2"><i class="bi bi-chat-square-dots me-1"></i>Sin comentarios aÃºn.</p>`:n.map(e=>`
        <div class="task-comment-item d-flex gap-2 mb-3" data-comment-id="${t(e.id)}">
          <div class="task-comment-avatar flex-shrink-0 rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width:32px;height:32px;">
            <i class="bi bi-person-fill small"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-baseline gap-2 mb-1">
              <strong class="small">${t(e.autor_nombre||`AnÃ³nimo`)}</strong>
              <small class="text-muted">${Ge(e.created_at)}</small>
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
  `}function Ke(e){if(!e)return``;try{return new Date(e).toLocaleString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}catch{return e}}var qe={estado:`Estado`,asignado_a:`Asignado a`,prioridad:`Prioridad`,fecha_vencimiento:`Vencimiento`,entidad_tipo:`Tipo de entidad`,entidad_id:`ID de entidad`,correlation_id:`Correlation ID`};function Je(e=[]){if(e.length===0)return`
      <div class="task-history-timeline">
        <h6 class="mb-3"><i class="bi bi-clock-history me-1 text-muted"></i>Historial de cambios</h6>
        <p class="text-muted small text-center py-2"><i class="bi bi-journal-x me-1"></i>Sin cambios registrados.</p>
      </div>
    `;let n=e.map(e=>{let n=qe[e.campo]??t(e.campo),r=e.actor_nombre?t(e.actor_nombre):`<em class="text-muted">Sistema</em>`,i=e.valor_anterior==null?`<span class="text-muted small">â€”</span>`:`<span class="text-danger text-decoration-line-through small">${t(e.valor_anterior)}</span>`,a=e.valor_nuevo==null?`<span class="text-muted small">â€”</span>`:`<span class="text-success fw-semibold small">${t(e.valor_nuevo)}</span>`;return`
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
            <span><i class="bi bi-clock me-1"></i>${Ke(e.created_at)}</span>
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
  `}function Ye(e){if(!e)return``;try{return new Date(e).toLocaleDateString(`es-VE`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}function Xe(e){return!e||e===0?``:e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function Ze(e){return e?e.startsWith(`image/`)?`bi-file-earmark-image`:e===`application/pdf`?`bi-file-earmark-pdf text-danger`:e.includes(`word`)||e.includes(`document`)?`bi-file-earmark-word text-primary`:e.includes(`sheet`)||e.includes(`excel`)?`bi-file-earmark-excel text-success`:`bi-file-earmark-text`:`bi-file-earmark`}function Qe(e,n=[]){let r=n.length===0?`<p class="text-muted small text-center py-2"><i class="bi bi-paperclip me-1"></i>Sin adjuntos.</p>`:n.map(e=>`
    <div class="task-attachment-item d-flex align-items-center gap-3 p-2 rounded border mb-2" data-adj-id="${t(e.id)}" data-storage-path="${t(e.storage_path)}">
      <div class="flex-shrink-0 text-muted" style="font-size:1.4rem;">
        <i class="bi ${Ze(e.mime_type)}"></i>
      </div>
      <div class="flex-grow-1 overflow-hidden">
        <div class="fw-semibold small text-truncate" title="${t(e.nombre)}">${t(e.nombre)}</div>
        <div class="text-muted" style="font-size:0.75rem;">
          ${e.subido_por_nombre?`<span><i class="bi bi-person me-1"></i>${t(e.subido_por_nombre)}</span>`:``}
          ${e.size_bytes?`<span class="ms-2">${Xe(e.size_bytes)}</span>`:``}
          ${e.created_at?`<span class="ms-2"><i class="bi bi-calendar3 me-1"></i>${Ye(e.created_at)}</span>`:``}
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
  `}function $e(e,t,n){e.querySelectorAll(`.task-attachment-download`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.storagePath;if(n)try{e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;let r=await t(n);window.open(r,`_blank`,`noopener,noreferrer`)}catch(e){console.error(`[taskAttachmentsPanel] Error al obtener URL firmada:`,e.message)}finally{e.disabled=!1,e.innerHTML=`<i class="bi bi-download"></i>`}},n?{signal:n}:{})})}var et=[`completada`,`cancelada`];function tt(e){return!e||e.entidad_tipo!==`tool_call`||et.includes(e.estado)?!1:N(e)!==null}function N(e){return!e||!Array.isArray(e.checklist)?null:e.checklist.find(e=>e&&e.item===`tool_call_payload`)?.payload??null}function nt(e){return!e||typeof e!=`object`?[]:Object.entries(e).map(([e,t])=>t==null?{clave:e,valor:`—`}:typeof t==`object`?{clave:e,valor:JSON.stringify(t)}:{clave:e,valor:String(t)})}var P={azul:[20,60,130],azulClaro:[220,232,250],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248]},F=215.9,I=279.4,L=14;function rt(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function R(e,t=`—`){return String(e??``).trim()||t}function it(e){return String(e||`caso`).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function z(e,t=``){e.setFillColor(...P.azul),e.rect(0,0,F,32,`F`),e.setFillColor(...P.dorado),e.rect(0,32,F,2.5,`F`),e.setFillColor(...P.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...P.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,16,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Tocamos Corazones, Cambiamos Vidas · Punta Cana`,16,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...P.dorado),e.text(`ACTA DE CIERRE · HERMES`,F-L,13,{align:`right`}),t&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(t,F-L,20,{align:`right`})),e.setTextColor(...P.grisOscuro)}function B(e,t){e.setFillColor(...P.azul),e.rect(0,I-8,F,8,`F`),e.setFillColor(...P.dorado),e.rect(0,I-8,4,8,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...P.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,16,I-4.5),e.text(`Pág. ${t}`,F-L,I-4.5,{align:`right`})}var at={completada:`Completada`,cancelada:`Cancelada`,bloqueada:`Bloqueada`,en_progreso:`En progreso`,observada:`Observada`,pendiente:`Pendiente`};function ot({tasks:e=[],correlation_id:t=``,contract:n={},closure_summary:r=``}){let i=new a({unit:`mm`,format:`letter`});z(i,`Generado: ${rt()}`),i.setFillColor(...P.azulClaro),i.roundedRect(L,42,F-L*2,26,2,2,`F`),i.setFont(`helvetica`,`bold`),i.setFontSize(13),i.setTextColor(...P.azul),i.text(R(n.process_name),18,49),i.setFont(`helvetica`,`normal`),i.setFontSize(8),i.setTextColor(...P.grisMedio),i.text(`Proceso: ${R(n.process_code)}  ·  Departamento: ${R(n.department_owner)}  ·  ID: ${R(t)}`,18,57);let s=74;if(r){i.setFont(`helvetica`,`italic`),i.setFontSize(8.5),i.setTextColor(...P.grisOscuro);let e=i.splitTextToSize(r,F-L*2);i.text(e,L,s),s+=e.length*4.5+4}if(i.setFont(`helvetica`,`bold`),i.setFontSize(8.5),i.setTextColor(...P.grisOscuro),i.text(`Tareas del caso: ${e.length}`,L,s),s+=5,e.length>0){let t=e.map(e=>[R(e.departamento),R(e.titulo),R(e.prioridad),at[e.estado]||R(e.estado),e.fecha_vencimiento?String(e.fecha_vencimiento).slice(0,10):`—`]);o(i,{startY:s,margin:{top:44,left:L,right:L},theme:`grid`,head:[[`Depto.`,`Tarea`,`Prioridad`,`Estado`,`Vencimiento`]],headStyles:{fillColor:P.azul,textColor:P.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:P.grisClaro},body:t,didDrawPage:e=>{z(i,R(n.process_name)),B(i,e.pageNumber)}})}B(i,1),i.save(`acta-cierre-${it(t||n.process_code)}-${new Date().toISOString().slice(0,10)}.pdf`)}var V={DIR:`DirecciÃ³n`,ACM:`AcadÃ©mica`,ADM:`AdministraciÃ³n`,FIN:`Financiero`,LOG:`LogÃ­stica`,COM:`Comunicaciones`,TECNICO:`TÃ©cnico`},H=Object.fromEntries(Object.entries(He()).map(([e,t])=>[e,{label:t.label,color:t.color}])),U={baja:{label:`Baja`,color:`secondary`,orden:3},media:{label:`Media`,color:`info`,orden:2},alta:{label:`Alta`,color:`warning`,orden:1},critica:{label:`CrÃ­tica`,color:`danger`,orden:0}},W={tareas:[],cargando:!1,filtroEstado:`todos`,filtroDepartamento:`todos`,filtroPrioridad:`todos`,busqueda:``,departamentoFijo:null,processCode:null,correlationId:null,actor:null},G=null,K=null;async function st(){return W.departamentoFijo?Te(W.departamentoFijo):S()}async function q(e){W.tareas=await st(),W.cargando=!1,Y(e),Q(e)}function ct(e){i?.channel&&(K?.unsubscribe?.(),K=i.channel(`hermes:tareas_institucionales`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`tareas_institucionales`},async()=>{if(!G?.signal.aborted)try{await q(e)}catch(e){console.error(`[TareasView] Realtime refresh error:`,e.message)}}).subscribe())}async function J(e,t={}){G?.abort(),G=new AbortController,W.departamentoFijo=t.departamento||null,W.processCode=t.processCode||null,W.correlationId=t.correlationId||null,t.actor!==void 0&&(W.actor=t.actor);try{W.cargando=!0,lt(e),await q(e),ct(e)}catch(t){console.error(`[TareasView] Error:`,t.message),ut(e,t.message)}return{teardown:()=>{G?.abort(),K?.unsubscribe?.(),K=null}}}function lt(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando tareas institucionales...</p>
      </div>
    </div>
  `}function ut(e,n){e.innerHTML=`
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
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>J(e,{departamento:W.departamentoFijo,actor:W.actor}),{signal:G.signal})}function dt(){return W.tareas.length!==0&&W.tareas.every(e=>e.estado===`completada`||e.estado===`cancelada`)}function ft(){if(!dt())return``;let e=W.tareas.find(e=>e.event_id)?.event_id||null;return`
    <div class="alert alert-success d-flex align-items-center justify-content-between gap-3 mb-3 py-3 px-4" role="alert" id="cierreBanner">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill fs-4"></i>
        <div>
          <strong>¡Todas las tareas completadas!</strong>
          <div class="small text-success-emphasis">El evento <em>${t(W.tareas[0]?.titulo?.match(/—\s*(.+)$/)?.[1]?.trim()||`este evento`)}</em> está listo. Descargá el Acta Oficial de Cierre.</div>
        </div>
      </div>
      <button class="btn btn-success btn-sm d-flex align-items-center gap-1 text-nowrap" id="btnDescargarActa"
        data-event-id="${t(e||``)}">
        <i class="bi bi-file-earmark-pdf-fill"></i> Descargar Acta PDF
      </button>
    </div>
  `}function Y(e){let n=Z(),r=e=>W.tareas.filter(t=>t.estado===e).length;e.innerHTML=`
    <div class="page-container">
      <div class="tareas-header mb-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-check2-square fs-4"></i>
          </div>
          <div>
            <h1 class="tareas-title mb-0">${t(W.departamentoFijo?`Tareas â€” ${V[W.departamentoFijo]||W.departamentoFijo}`:W.processCode?`Tareas del caso ${W.processCode}`:`Tareas Institucionales`)}</h1>
            <p class="text-muted small mb-0">Sistema Hermes · delegación automática</p>
            ${W.correlationId?`<p class="text-muted small mb-0">Caso: <code>${t(W.correlationId)}</code></p>`:``}
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

      ${ft()}

      <div class="tareas-filters mb-4 d-flex gap-2 flex-wrap">
        <div class="flex-grow-1" style="min-width: 200px;">
          <input type="text" class="form-control form-control-sm" id="buscarTarea"
            placeholder="ðŸ” Buscar tarea..." autocomplete="off" value="${t(W.busqueda)}">
        </div>
        <select class="form-select form-select-sm" id="filtroEstado" style="max-width: 150px;">
          <option value="todos">Todos Estados</option>
          ${Object.entries(H).map(([e,t])=>`<option value="${e}" ${W.filtroEstado===e?`selected`:``}>${t.label}</option>`).join(``)}
        </select>
        ${W.departamentoFijo?``:`<select class="form-select form-select-sm" id="filtroDepartamento" style="max-width: 160px;">
                 <option value="todos">Todos Departamentos</option>
                 ${Object.entries(V).map(([e,t])=>`<option value="${e}" ${W.filtroDepartamento===e?`selected`:``}>${t}</option>`).join(``)}
               </select>`}
        <select class="form-select form-select-sm" id="filtroPrioridad" style="max-width: 130px;">
          <option value="todos">Toda Prioridad</option>
          ${Object.entries(U).map(([e,t])=>`<option value="${e}" ${W.filtroPrioridad===e?`selected`:``}>${t.label}</option>`).join(``)}
        </select>
      </div>

      <div id="tareasList" class="tareas-list">
        ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`:n.map(X).join(``)}
      </div>
    </div>
  `}function X(e){let n=H[e.estado]||H.pendiente,r=U[e.prioridad]||U.media,i=Array.isArray(e.checklist)?e.checklist:[],a=i.filter(e=>e.completado).length,o=i.length,s=o>0?a/o*100:0,c=e.fecha_vencimiento?Math.ceil((new Date(e.fecha_vencimiento)-new Date)/864e5):null,l=c===null?`text-muted`:c<0?`text-danger`:c<3?`text-warning`:`text-muted`,u=j(e),d=A(e.estado),f=e.entidad_tipo===`tool_call`;return`
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
              <span class="text-muted"><i class="bi bi-building"></i> ${V[e.departamento]||e.departamento}</span>
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
  `}function Z(){let e=[...W.tareas];if(W.filtroEstado!==`todos`&&(e=e.filter(e=>e.estado===W.filtroEstado)),!W.departamentoFijo&&W.filtroDepartamento!==`todos`&&(e=e.filter(e=>e.departamento===W.filtroDepartamento)),W.filtroPrioridad!==`todos`&&(e=e.filter(e=>e.prioridad===W.filtroPrioridad)),W.busqueda){let t=W.busqueda.toLowerCase();e=e.filter(e=>e.titulo.toLowerCase().includes(t)||(e.descripcion||``).toLowerCase().includes(t))}return e.sort((e,t)=>(U[e.prioridad]?.orden??9)-(U[t.prioridad]?.orden??9)),e}function Q(t){let n=G.signal,r=()=>{Y(t),Q(t)};t.querySelector(`#buscarTarea`)?.addEventListener(`input`,e=>{W.busqueda=e.target.value;let n=t.querySelector(`#tareasList`),r=Z();n.innerHTML=r.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay tareas que cumplan con los filtros</div>`:r.map(X).join(``),$(t)},{signal:n}),t.querySelector(`#filtroEstado`)?.addEventListener(`change`,e=>{W.filtroEstado=e.target.value,r()},{signal:n}),t.querySelector(`#filtroDepartamento`)?.addEventListener(`change`,e=>{W.filtroDepartamento=e.target.value,r()},{signal:n}),t.querySelector(`#filtroPrioridad`)?.addEventListener(`change`,e=>{W.filtroPrioridad=e.target.value,r()},{signal:n}),t.querySelector(`#btnDescargarActa`)?.addEventListener(`click`,async t=>{let n=t.currentTarget;n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Generando...`;try{let t=n.dataset.eventId,r={};if(t){let{data:e}=await i.from(`calendario_institucional`).select(`id, titulo, categoria, fecha_inicio, departamento_responsable, metadata`).eq(`id`,t).single();e&&(r=e)}ot({tasks:W.tareas,correlation_id:t||W.correlationId||`EVT-ANIVERSARIO`,contract:{process_code:r.categoria?.toUpperCase()||`EVT-P09`,process_name:r.titulo||`Concierto Aniversario Institucional`,department_owner:r.departamento_responsable||`DIR`},closure_summary:`Evento "${r.titulo||`Concierto Aniversario`}" completado al 100%. ${W.tareas.filter(e=>e.estado===`completada`).length} de ${W.tareas.length} tareas ejecutadas exitosamente.`}),e.show(`Acta de Cierre generada y descargada.`,`success`)}catch(t){e.show(`Error al generar el acta: `+t.message,`danger`)}finally{n.disabled=!1,n.innerHTML=`<i class="bi bi-file-earmark-pdf-fill"></i> Descargar Acta PDF`}},{signal:n}),t.querySelector(`#btnSimularTelegram`)?.addEventListener(`click`,()=>mt(t),{signal:n}),$(t)}function $(e){let t=G.signal;e.querySelectorAll(`.btn-detalle`).forEach(n=>{n.addEventListener(`click`,()=>{let t=W.tareas.find(e=>e.id===n.dataset.tareaId);t&&pt(e,t)},{signal:t})})}async function pt(n,i){let a=U[i.prioridad]||U.media,o=Array.isArray(i.checklist)?i.checklist:[],s=A(i.estado),c=j(i),l=[],u=[];try{[l,u]=await Promise.all([O(i.id),Ae(i.id)])}catch{}let d=Array.isArray(i.documentos_adjuntos)?i.documentos_adjuntos:[],f=Object.entries(H).filter(([e])=>e!==`observada`),p=tt(i),m=p?N(i):null,h=m?nt(m.args):[];r.open({title:i.titulo,size:`xl`,body:`
      <div class="modal-tarea-content">
        <p>${t(i.descripcion||``)}</p>
        <div class="row mb-3">
          <div class="col-md-4"><strong>Departamento</strong><p>${V[i.departamento]||i.departamento}</p></div>
          <div class="col-md-4"><strong>Prioridad</strong><p><span class="badge bg-${a.color}">${a.label}</span></p></div>
          <div class="col-md-4"><strong>Vencimiento</strong><p>${i.fecha_vencimiento||`â€”`}</p></div>
        </div>

        ${c?`<div class="mb-3"><strong>Entidad asociada</strong><div class="mt-1">${c}</div></div>`:``}

        ${p&&m?`<div class="mb-3 border rounded p-3 bg-dark bg-opacity-10" id="toolApprovalPanel">
                 <strong class="d-block mb-2"><i class="bi bi-robot me-1"></i>Solicitud de ejecuciÃ³n de tool</strong>
                 <div class="row mb-2 small">
                   <div class="col-md-6"><span class="text-muted">Tool</span><p class="mb-0 fw-semibold">${t(i.entidad_label||m.tool_name)}</p></div>
                   <div class="col-md-6"><span class="text-muted">Departamento</span><p class="mb-0">${V[i.departamento]||i.departamento}</p></div>
                 </div>
                 ${h.length>0?`<table class="table table-sm table-borderless mb-2">
                          <tbody>
                            ${h.map(e=>`<tr><td class="text-muted small" style="width:40%;">${t(e.clave)}</td><td class="small">${t(e.valor)}</td></tr>`).join(``)}
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
          <div class="mt-1 mb-2">${s}</div>
          ${i.estado===`observada`?`<input type="hidden" id="modalEstado" value="observada">
                 <p class="text-muted small mt-1"><i class="bi bi-info-circle me-1"></i>Este estado sÃ³lo puede modificarse mediante una nueva transiciÃ³n.</p>`:`<select class="form-select form-select-sm" id="modalEstado">
                   ${f.map(([e,t])=>`<option value="${e}" ${i.estado===e?`selected`:``}>${t.label}</option>`).join(``)}
                 </select>`}
        </div>

        ${i.estado===`observada`?``:`<div class="mb-3 border rounded p-3 bg-warning bg-opacity-10">
                 <strong class="d-block mb-2"><i class="bi bi-eye me-1 text-warning"></i>Marcar como Observada</strong>
                 <p class="small text-muted mb-2">Requiere un comentario obligatorio que explique la observaciÃ³n.</p>
                 <textarea class="form-control form-control-sm" id="modalObservarComentario" rows="2"
                   placeholder="Motivo de la observaciÃ³n (obligatorio)..."></textarea>
                 <button class="btn btn-sm btn-warning mt-2" id="btnObservar" type="button">
                   <i class="bi bi-eye me-1"></i>Marcar como Observada
                 </button>
               </div>`}

        ${o.length>0?`<div class="mb-3">
                 <strong>Checklist</strong>
                 <div class="list-group list-group-flush mt-1" id="modalChecklist">
                   ${o.map((e,n)=>`
                     <label class="list-group-item px-0 d-flex align-items-center gap-2">
                       <input class="form-check-input m-0 chk-item" type="checkbox" data-idx="${n}" ${e.completado?`checked`:``}>
                       <span class="${e.completado?`text-decoration-line-through text-muted`:``}">${t(e.item)}</span>
                     </label>`).join(``)}
                 </div>
               </div>`:``}

        <div class="mb-3">
          <strong>Feedback / notas de cierre</strong>
          <textarea class="form-control form-control-sm mt-1" id="modalFeedback" rows="2"
            placeholder="Comentario del responsable...">${t(i.feedback||``)}</textarea>
        </div>

        <!-- SP-0: Comments, History, Attachments panels -->
        <hr>
        <div class="row g-3 mt-1">
          <div class="col-md-6">
            ${M(i.id,l)}
          </div>
          <div class="col-md-6">
            ${Qe(i.id,d)}
          </div>
        </div>
        <div class="mt-3">
          ${Je(u)}
        </div>
      </div>
    `,saveText:`Guardar cambios`,onOpen:t=>{let a=G.signal;$e(t,je,a);let o=t.querySelector(`#btnObservar`);o?.addEventListener(`click`,async()=>{let a=t.querySelector(`#modalObservarComentario`)?.value?.trim()||``;if(!a){e.show(`El comentario es obligatorio para marcar como Observada`,`error`);return}try{o.disabled=!0;let t=W.actor||{id:null,nombre:`Usuario`};await Me(i.id,a,t),e.show(`Tarea marcada como Observada`,`success`),r.close?.(),await J(n,{departamento:W.departamentoFijo,actor:W.actor})}catch(t){e.show(`Error: ${t.message}`,`error`),o.disabled=!1}},{signal:a});let s=t.querySelector(`#btnAprobarTool`),c=t.querySelector(`#btnRechazarTool`);s?.addEventListener(`click`,async()=>{try{s.disabled=!0,c&&(c.disabled=!0);let t=W.actor||{id:null,nombre:`Usuario`},a=await Ne(i.id,t);e.show(a?.mensaje||`Tool ejecutada correctamente`,`success`),r.close?.(),await J(n,{departamento:W.departamentoFijo,actor:W.actor})}catch(t){e.show(`Error al aprobar la tool: ${t.message}`,`error`),s.disabled=!1,c&&(c.disabled=!1)}},{signal:a}),c?.addEventListener(`click`,async()=>{let a=t.querySelector(`#toolRechazoMotivo`)?.value?.trim()||``;if(!a){e.show(`El motivo del rechazo es obligatorio`,`error`);return}try{c.disabled=!0,s&&(s.disabled=!0);let t=W.actor||{id:null,nombre:`Usuario`};await Pe(i.id,a,t),e.show(`Solicitud de tool rechazada`,`success`),r.close?.(),await J(n,{departamento:W.departamentoFijo,actor:W.actor})}catch(t){e.show(`Error al rechazar la tool: ${t.message}`,`error`),c.disabled=!1,s&&(s.disabled=!1)}},{signal:a});let l=t.querySelector(`.task-comment-submit`);l?.addEventListener(`click`,async()=>{let n=t.querySelector(`.task-comment-input`),r=n?.value?.trim()||``;if(!r){e.show(`El comentario no puede estar vacÃ­o`,`error`);return}try{l.disabled=!0;let a=W.actor||{id:null,nombre:`Usuario`};await ke(i.id,r,a),e.show(`Comentario agregado`,`success`),n&&(n.value=``);let o=await O(i.id),s=t.querySelector(`.task-comments-panel`);s&&(s.outerHTML=M(i.id,o))}catch(t){e.show(`Error: ${t.message}`,`error`)}finally{l.disabled=!1}},{signal:a})},onSave:async t=>{let r=t.querySelector(`#modalEstado`).value,a=t.querySelector(`#modalFeedback`).value.trim();try{let s=t.querySelectorAll(`.chk-item`);for(let e of s){let t=parseInt(e.dataset.idx,10);!!o[t]?.completado!==e.checked&&await De(i.id,t,e.checked)}r===`completada`?await w(i.id,a||null):r!==`observada`&&(await C(i.id,r),a!==(i.feedback||``)&&await T(i.id,a)),e.show(`Tarea actualizada`,`success`),await J(n,{departamento:W.departamentoFijo,actor:W.actor})}catch(t){e.show(`Error: ${t.message}`,`error`)}}})}function mt(t){r.open({title:`Simulador de Ingesta de Telegram (Bot de Tareas)`,size:`md`,body:`
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
    `,saveText:`Procesar con IA (Groq)`,onSave:async n=>{let r=n.querySelector(`#telegramMsg`).value.trim();if(!r)return e.show(`Escribe un mensaje primero`,`error`),!1;try{let n=/^(direccion|secretaria|docencia|atencion|calidad|desarrollo|dirección|luteria|finanzas)/i,i=r.match(n);if(!i)return e.show(`Formato incorrecto. El mensaje debe comenzar con el departamento.`,`error`),!1;let a={direccion:`DIR`,secretaria:`SEC`,docencia:`ACM`,atencion:`ADM`,calidad:`DIR`,desarrollo:`ACM`,luteria:`LOG`,finanzas:`FIN`}[i[1].toLowerCase()]||`DIR`,o=r.replace(n,``).trim();await D({titulo:`Telegram: ${o.length>50?o.substring(0,50)+`...`:o}`,descripcion:`Mensaje de Telegram: "${r}"`,departamento:a,estado:`pendiente`,prioridad:r.toLowerCase().includes(`urgente`)?`alta`:`media`,correlation_id:`corr_tg_${Date.now()}`}),e.show(`Mensaje procesado: Tarea creada en `+a,`success`),await q(t)}catch(t){return e.show(`Error al procesar: `+t.message,`error`),!1}}})}export{f as _,D as a,Be as c,Ee as d,E as f,C as g,ze as h,Oe as i,Re as l,Ie as m,Ve as n,Le as o,T as p,w as r,Fe as s,J as t,S as u,d as v};