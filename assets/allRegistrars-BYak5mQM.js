const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/boletinesService-DuVI9lfu.js","assets/AppModal-B8f8dDnR.js","assets/supabase-Cgh_dhNB.js","assets/planificacion-b0EpdCa7.js","assets/config-CNiOV0RX.js","assets/planificacionAdapter-Dyi8LwW_.js","assets/clases-nt5JqYH7.js","assets/IndicadorLogro-C_uDnyrO.js","assets/idb-hTByFGMt.js","assets/clasesApi-D88txlnO.js","assets/normalizeText-DvPabODc.js","assets/periodoSniffer-ZO5JsHUX.js","assets/router-DPk1oCHJ.js","assets/vendor-GwDQZeW3.js","assets/vendor-COf7rB16.css","assets/asistenciasApi-D5v1hunc.js","assets/asistenciasSupabase-_BMYhQ5v.js","assets/three-PxM-BH2Y.js","assets/salaTrabajo3dView-CLew3dyd.js","assets/simuladorLogMapper-DOwzR9m9.js","assets/salaTrabajoView-BCVAiBee.js"])))=>i.map(i=>d[i]);
import{i as e,r as t,s as n,t as r}from"./AppModal-B8f8dDnR.js";import{a as i,i as a}from"./supabase-Cgh_dhNB.js";import"./vendor-GwDQZeW3.js";import{g as o}from"./planificacion-b0EpdCa7.js";import{t as s}from"./router-DPk1oCHJ.js";import{C as c,D as l,E as u,J as d,M as f,N as p,O as ee,P as te,S as ne,T as re,X as ie,Z as m,a as ae,d as oe,i as se,j as ce,k as le,n as ue,o as de,q as fe,r as pe,s as me,t as he,u as ge,w as _e}from"./scoreDirectorView-BNcE2WLI.js";import{n as ve}from"./groqService-Cu889xeB.js";import{T as ye,b as be,c as xe,l as Se,r as Ce,s as we,u as Te,w as Ee,y as De}from"./tareas-BkDsnxPX.js";import{t as Oe}from"./tareasView-Dxc2hHaO.js";var ke={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`,OPR:`Operaciones`},Ae={critica:`danger`,alta:`warning`,media:`info`,baja:`secondary`},h={procedimientos:[],processContracts:[],cargando:!1};function g(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function je(e){let t=new AbortController;return await Me(e),e.addEventListener(`click`,async t=>{if(t.target.closest(`#btn-refrescar-proc`))return Me(e);let n=t.target.closest(`[data-open-case-detail]`);if(n){s.navigate(`hermes-caso`,{processCode:n.dataset.processCode||null,correlationId:n.dataset.correlationId||null});return}let r=t.target.closest(`[data-start-process-code]`);if(r){let t=r.dataset.startProcessCode,n=h.processContracts.find(e=>e.process_code===t),i=window.prompt(`Título del caso para ${t}:`,n?.process_name||t);if(!i?.trim())return;let a=window.prompt(`Descripción breve del caso:`)||``;try{await be({process_code:t,title:i.trim(),description:a.trim()||null,source:`manual`,priority:`media`,metadata:{opened_from:`procedimientos_view`}}),alert(`Caso SOI abierto: Hermes generó las tareas departamentales del contrato.`),Me(e)}catch(e){alert(`Error: ${e.message}`)}return}if(t.target.closest(`#btn-caso-alumno`)){let t=window.prompt(`Nombre del alumno en riesgo:`);if(!t?.trim())return;let n=window.prompt(`Motivo (ausencias, bajo progreso, morosidad…):`)||``;if(ye(`${t}\n${n}`)){alert(Ee());return}try{await De(null,t.trim(),n.trim()),alert(`Caso abierto: se delegaron tareas a Académico, Comunicación, Finanzas y Dirección.`),Me(e)}catch(e){alert(`Error: ${e.message}`)}}},{signal:t.signal}),{teardown:()=>t.abort()}}async function Me(e){try{h.cargando=!0,Pe(e);let[t,n]=await Promise.all([xe(),Te()]);h.procedimientos=t,h.processContracts=n}catch(t){e.innerHTML=`<div class="alert alert-danger m-3">Error cargando procedimientos: ${g(t.message)}</div>`;return}finally{h.cargando=!1}Pe(e)}function Ne(e){return{totalProc:e.length,enCurso:e.filter(e=>e.pct_avance<100&&e.total>e.canceladas).length,bloqueados:e.filter(e=>e.bloqueadas>0).length,observados:e.filter(e=>e.observadas>0).length,criticos:e.filter(e=>e.prioridad_max===`critica`).length}}function Pe(e){if(h.cargando&&h.procedimientos.length===0){e.innerHTML=`<div class="text-center text-muted py-5"><div class="spinner-border" role="status"></div><p class="mt-2">Cargando procedimientos…</p></div>`;return}let t=h.procedimientos,n=Ne(t),r=(e,t,n,r)=>`
    <div class="col">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body py-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${r} fs-4 text-${n}"></i>
            <div>
              <div class="fs-4 fw-bold lh-1">${t}</div>
              <div class="small text-muted">${e}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`,i=t.length===0?`<div class="text-center text-muted py-5"><i class="bi bi-inbox fs-1"></i><p class="mt-2">No hay procedimientos activos.</p></div>`:t.map(Fe).join(``),a=h.processContracts.length===0?`<div class="text-muted small">No hay contratos SOI activos registrados.</div>`:h.processContracts.map(Ie).join(``);e.innerHTML=`
    <div class="p-3 p-md-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 class="mb-0"><i class="bi bi-diagram-3 me-2"></i>Procedimientos institucionales</h3>
          <p class="text-muted mb-0 small">Vista consolidada del Director — avance por caso (correlation_id)</p>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-caso-alumno" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-person-exclamation"></i> Caso: alumno en riesgo
          </button>
          <button id="btn-refrescar-proc" class="btn btn-outline-primary btn-sm" ${h.cargando?`disabled`:``}>
            <i class="bi bi-arrow-clockwise"></i> ${h.cargando?`Actualizando…`:`Refrescar`}
          </button>
        </div>
      </div>

      <div class="row row-cols-2 row-cols-md-5 g-2 mb-4">
        ${r(`Procedimientos`,n.totalProc,`primary`,`bi-diagram-3`)}
        ${r(`En curso`,n.enCurso,`info`,`bi-hourglass-split`)}
        ${r(`Con bloqueos`,n.bloqueados,`danger`,`bi-slash-circle`)}
        ${r(`Con observadas`,n.observados,`warning`,`bi-eye`)}
        ${r(`Críticos`,n.criticos,`danger`,`bi-exclamation-octagon`)}
      </div>

      <section class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="mb-0"><i class="bi bi-bezier2 me-2"></i>Contratos SOI ejecutables</h5>
          <p class="text-muted small mb-3">Procesos documentados que Hermes puede convertir en caso + tareas auditables.</p>
          <div class="row row-cols-1 row-cols-lg-3 g-3">
            ${a}
          </div>
        </div>
      </section>

      <div class="row row-cols-1 row-cols-lg-2 g-3">
        ${i}
      </div>
    </div>`}function Fe(e){let t=Ae[e.prioridad_max]||`secondary`,n=e.bloqueadas>0?`bg-danger`:e.pct_avance===100?`bg-success`:`bg-primary`,r=(e.departamentos||[]).map(e=>`<span class="badge bg-light text-dark border me-1">${g(ke[e]||e)}</span>`).join(``),i=[];return e.bloqueadas>0&&i.push(`<span class="badge bg-danger me-1"><i class="bi bi-slash-circle"></i> ${e.bloqueadas} bloqueada${e.bloqueadas>1?`s`:``}</span>`),e.observadas>0&&i.push(`<span class="badge bg-warning text-dark me-1"><i class="bi bi-eye"></i> ${e.observadas} observada${e.observadas>1?`s`:``}</span>`),`
    <div class="col">
      <div class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 class="card-title mb-0">${g(e.titulo_muestra)}</h6>
            <span class="badge bg-${t} text-capitalize">${g(e.prioridad_max)}</span>
          </div>
          <div class="mb-2">${r}</div>
          <div class="progress mb-1" style="height: 8px;" role="progressbar" aria-valuenow="${e.pct_avance}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar ${n}" style="width: ${e.pct_avance}%"></div>
          </div>
          <div class="d-flex justify-content-between small text-muted mb-2">
            <span>${e.pct_avance}% completado</span>
            <span>${e.completadas}/${e.total} tareas</span>
          </div>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>${i.join(``)||`<span class="badge bg-light text-success border"><i class="bi bi-check-circle"></i> sin bloqueos</span>`}</div>
            <button class="btn btn-sm btn-outline-secondary" data-open-case-detail data-process-code="${g(e.process_code||``)}" data-correlation-id="${g(e.correlation_id||``)}">
              <i class="bi bi-binoculars"></i> Ver caso
            </button>
          </div>
        </div>
      </div>
    </div>`}function Ie(e){let t=(e.responsible_departments||[]).map(e=>`<span class="badge bg-light text-dark border me-1">${g(ke[e]||e)}</span>`).join(``),n={manual:`Manual`,semi_auto:`Semi-auto`,automated:`Automatizado`,deprecated:`Deprecado`}[e.automation_status]||e.automation_status;return`
    <div class="col">
      <div class="border rounded-3 p-3 h-100 bg-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="fw-semibold">${g(e.process_code)}</div>
            <div class="small">${g(e.process_name)}</div>
          </div>
          <span class="badge bg-primary-subtle text-primary border">${g(n)}</span>
        </div>
        <div class="mt-2 small text-muted">
          Dueño: ${g(ke[e.department_owner]||e.department_owner)}
        </div>
        <div class="mt-2">${t}</div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="small text-muted">${e.recurrence_count||0} recurrencia${e.recurrence_count===1?``:`s`}</span>
          <button class="btn btn-sm btn-outline-primary" data-start-process-code="${g(e.process_code)}">
            <i class="bi bi-play-circle"></i> Abrir caso
          </button>
        </div>
      </div>
    </div>`}var Le={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`,OPR:`Operaciones`};function _(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function Re(e){return{pendiente:`secondary`,en_progreso:`info`,completada:`success`,bloqueada:`danger`,cancelada:`dark`,observada:`warning`}[e]||`secondary`}var v={detail:null,cargando:!1};async function ze(e,t={}){let n=new AbortController;try{v.cargando=!0,Be(e),v.detail=await Se({correlationId:t.correlationId||null,processCode:t.processCode||null}),v.cargando=!1,Ve(e,t)}catch(t){return v.cargando=!1,e.innerHTML=`<div class="alert alert-danger m-3">No pude cargar el caso: ${_(t.message)}</div>`,{teardown:()=>n.abort()}}return e.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-open-case-tasks]`);if(t){s.navigate(`hermes-tareas`,{processCode:t.dataset.processCode,correlationId:t.dataset.correlationId});return}if(e.target.closest(`#btn-back-procedimientos`)){s.navigate(`hermes-procedimientos`);return}let n=e.target.closest(`#btn-cerrar-caso`);if(!n)return;let r=n.dataset.caseId;if(!r)return;let i=window.prompt(`Resumen de cierre (opcional):`);if(i!==null)try{n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Cerrando...`,await Ce({caseId:r,closureSummary:i?.trim()||null,actor:m().getUsuario?.()||{}}),s.navigate(`hermes-procedimientos`)}catch(e){alert(`Error al cerrar el caso: ${e.message}`),n.disabled=!1,n.innerHTML=`<i class="bi bi-check2-all"></i> Cerrar caso`}},{signal:n.signal}),{teardown:()=>n.abort()}}function Be(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 320px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted mb-0">Cargando detalle del caso…</p>
      </div>
    </div>`}function Ve(e,t){let n=v.detail||{},r=n.contract||null,i=n.tasks||[],a=n.metrics||{total:0,completadas:0,bloqueadas:0,observadas:0,evidencias:0},o=r?.process_code||t.processCode||i[0]?.process_code||`—`,s=r?.process_name||i[0]?.titulo||`Caso Hermes`,c=r?.department_owner||i[0]?.departamento||`—`,l=(r?.responsible_departments||[...new Set(i.map(e=>e.departamento))]).map(e=>`<span class="badge bg-light text-dark border me-1">${_(Le[e]||e)}</span>`).join(``),u=(r?.required_evidence||[]).map(e=>`<li class="mb-1">${_(e.label||e.type||e)}</li>`).join(``),d=(r?.closure_criteria||[]).map(e=>`<li class="mb-1">${_(e)}</li>`).join(``),f=i.length===0?`<div class="text-muted small">No se encontraron tareas para este caso.</div>`:i.map(He).join(``),p=a.total>0&&a.total===a.completadas&&a.bloqueadas===0;e.innerHTML=`
    <div class="p-3 p-md-4">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <div class="text-muted small">Caso / procedimiento</div>
          <h3 class="mb-1">${_(s)}</h3>
          <div class="small text-muted">Process code: <strong>${_(o)}</strong> · Correlation: <code>${_(n.correlation_id||t.correlationId||`—`)}</code></div>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-back-procedimientos" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i> Procedimientos
          </button>
          <button class="btn btn-primary btn-sm" data-open-case-tasks data-process-code="${_(o)}" data-correlation-id="${_(n.correlation_id||t.correlationId||``)}">
            <i class="bi bi-list-check"></i> Ver tareas del caso
          </button>
          ${p&&n.correlation_id?`
          <button id="btn-cerrar-caso" class="btn btn-success btn-sm" data-case-id="${_(n.correlation_id)}">
            <i class="bi bi-check2-all"></i> Cerrar caso
          </button>`:``}
        </div>
      </div>

      <div class="row row-cols-2 row-cols-lg-4 g-2 mb-4">
        ${y(`Tareas`,a.total,`primary`,`bi-list-task`)}
        ${y(`Completadas`,a.completadas,`success`,`bi-check-circle`)}
        ${y(`Bloqueadas`,a.bloqueadas,`danger`,`bi-slash-circle`)}
        ${y(`Evidencias`,a.evidencias,`info`,`bi-paperclip`)}
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-bezier2 me-2"></i>Contrato SOI</h5>
              <div class="row g-3 small">
                <div class="col-md-6"><div class="text-muted">Dueño</div><div class="fw-semibold">${_(Le[c]||c)}</div></div>
                <div class="col-md-6"><div class="text-muted">Documento canónico</div><div class="fw-semibold">${_(r?.canonical_doc_path||`—`)}</div></div>
                <div class="col-12"><div class="text-muted">Departamentos responsables</div><div class="mt-1">${l||`<span class="text-muted">—</span>`}</div></div>
              </div>
            </div>
          </section>

          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-clipboard-check me-2"></i>Tareas del caso</h5>
              <div class="vstack gap-2">
                ${f}
              </div>
            </div>
          </section>
        </div>

        <div class="col-lg-4">
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-collection me-2"></i>Evidencia requerida</h5>
              ${u?`<ul class="small mb-0">${u}</ul>`:`<div class="text-muted small">No definida en el contrato.</div>`}
            </div>
          </section>

          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-check2-square me-2"></i>Criterio de cierre</h5>
              ${d?`<ul class="small mb-0">${d}</ul>`:`<div class="text-muted small">No definido en el contrato.</div>`}
              <hr>
              <div class="small text-muted mb-1">Estado del caso</div>
              <div class="fw-semibold ${p?`text-success`:`text-warning`}">
                ${p?`Listo para cierre`:`Aún abierto`}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>`}function He(e){let t=Array.isArray(e.checklist)&&e.checklist.length>0?Math.round(e.checklist.filter(e=>e.completado).length/e.checklist.length*100):0,n=Re(e.estado);return`
    <div class="border rounded-3 p-3 bg-body">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${_(e.titulo)}</div>
          <div class="small text-muted">${_(Le[e.departamento]||e.departamento)} · ${_(e.process_code||`sin process_code`)}</div>
        </div>
        <span class="badge bg-${n} text-capitalize">${_(e.estado)}</span>
      </div>
      <div class="small text-muted mt-2">${e.fecha_vencimiento?`Vence: ${_(e.fecha_vencimiento)}`:`Sin vencimiento`}</div>
      <div class="progress mt-2" style="height: 6px;">
        <div class="progress-bar bg-${n}" style="width: ${t}%"></div>
      </div>
    </div>`}function y(e,t,n,r){return`
    <div class="col">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body py-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${r} fs-4 text-${n}"></i>
            <div>
              <div class="fs-4 fw-bold lh-1">${t}</div>
              <div class="small text-muted">${e}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`}var Ue={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`},We=[`¿Cómo va la operación en general?`,`¿Qué departamentos tienen tareas pendientes?`,`¿Qué casos requieren atención inmediata?`,`¿Cómo va la reinscripción?`],b={snapshot:null,procedimientos:[],historial:[]};function x(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function Ge(e){return String(e??``).normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase()}async function Ke(e){let t=new AbortController;try{[b.snapshot,b.procedimientos]=await Promise.all([we(),xe()])}catch(n){return e.innerHTML=`<div class="alert alert-danger m-3">No pude consultar el estado: ${x(n.message)}</div>`,{teardown:()=>t.abort()}}Je(e);let n=()=>{let t=e.querySelector(`#hermes-q`),n=t.value.trim();if(!n)return;b.historial.push({rol:`user`,texto:n}),b.historial.push({rol:`hermes`,html:qe(n)}),t.value=``,Je(e);let r=e.querySelector(`#hermes-log`);r&&(r.scrollTop=r.scrollHeight)};return e.addEventListener(`click`,t=>{t.target.closest(`#hermes-send`)&&n();let r=t.target.closest(`.hermes-sug`);r&&(e.querySelector(`#hermes-q`).value=r.dataset.q,n())},{signal:t.signal}),e.addEventListener(`keydown`,e=>{e.target.id===`hermes-q`&&e.key===`Enter`&&(e.preventDefault(),n())},{signal:t.signal}),{teardown:()=>t.abort()}}function qe(e){let t=Ge(e),n=b.snapshot;if(/(atencion|inmediat|urgent|bloque|critic|riesgo|priorid)/.test(t)){let e=n.atencion_inmediata||[];return e.length===0?`<p>✅ No hay tareas bloqueadas ni críticas abiertas. Nada requiere atención inmediata.</p>`:`<p><strong>${e.length}</strong> tarea(s) requieren atención inmediata:</p><ul class="mb-0">`+e.map(e=>`<li><span class="badge bg-${e.estado===`bloqueada`?`danger`:`warning text-dark`} me-1">${x(e.estado)}</span>
        <strong>${x(Ue[e.departamento]||e.departamento)}</strong> — ${x(e.titulo)}</li>`).join(``)+`</ul>`}if(/(pendient|departament|quien|quienes|cargad|saturad)/.test(t)){let e=(n.por_departamento||[]).filter(e=>e.abiertas>0);return e.length===0?`<p>No hay tareas abiertas en ningún departamento.</p>`:`<p>Tareas abiertas por departamento:</p><ul class="mb-0">`+e.map(e=>`<li><strong>${x(Ue[e.departamento]||e.departamento)}</strong>: ${e.abiertas} abiertas
        (${e.pendientes} pendientes${e.bloqueadas>0?`, <span class="text-danger">${e.bloqueadas} bloqueadas</span>`:``})</li>`).join(``)+`</ul>`}let r=t.split(/\s+/).filter(e=>e.length>=4&&![`como`,`va`,`van`,`esta`,`estan`,`sobre`,`para`,`proceso`,`procedimiento`,`caso`].includes(e));if(/(como va|como van|proceso|procedimiento|caso|estado de)/.test(t)&&r.length>0){let e=b.procedimientos.filter(e=>{let t=Ge(e.titulo_muestra);return r.some(e=>t.includes(e))});if(e.length>0)return`<p>Encontré ${e.length} procedimiento(s) relacionados:</p><ul class="mb-0">`+e.slice(0,8).map(e=>`<li><strong>${e.pct_avance}%</strong> — ${x(e.titulo_muestra)}
          <span class="text-muted">(${e.completadas}/${e.total} tareas${e.bloqueadas>0?`, ${e.bloqueadas} bloqueadas`:``})</span></li>`).join(``)+`</ul>`}let i=n.tareas,a=i.pendiente+i.en_progreso+i.bloqueada+i.observada;return`<p>Estado general de la operación:</p>
    <ul class="mb-0">
      <li><strong>${n.total_procedimientos}</strong> procedimientos en el sistema</li>
      <li><strong>${i.total}</strong> tareas — ${a} abiertas, ${i.completada} completadas</li>
      <li>Pendientes: ${i.pendiente} · En progreso: ${i.en_progreso}
        ${i.bloqueada>0?`· <span class="text-danger">Bloqueadas: ${i.bloqueada}</span>`:``}
        ${i.observada>0?`· <span class="text-warning">Observadas: ${i.observada}</span>`:``}</li>
    </ul>`}function Je(e){let t=b.historial.length===0?`<div class="text-muted text-center py-4">
         <i class="bi bi-robot fs-1"></i>
         <p class="mt-2 mb-0">Preguntale a Hermes sobre el estado de la operación.</p>
       </div>`:b.historial.map(e=>e.rol===`user`?`<div class="d-flex justify-content-end mb-2"><div class="p-2 px-3 rounded bg-primary text-white" style="max-width:80%">${x(e.texto)}</div></div>`:`<div class="d-flex justify-content-start mb-3"><div class="p-2 px-3 rounded bg-light border" style="max-width:90%"><div class="small text-muted mb-1"><i class="bi bi-robot"></i> Hermes</div>${e.html}</div></div>`).join(``);e.innerHTML=`
    <div class="p-3 p-md-4" style="max-width:900px;margin:0 auto">
      <h3 class="mb-1"><i class="bi bi-robot me-2"></i>Consultar a Hermes</h3>
      <p class="text-muted small">Respuestas factuales desde el estado real — sin generación libre.</p>

      <div class="mb-2 d-flex flex-wrap gap-2">
        ${We.map(e=>`<button class="btn btn-sm btn-outline-secondary hermes-sug" data-q="${x(e)}">${x(e)}</button>`).join(``)}
      </div>

      <div id="hermes-log" class="border rounded p-3 mb-2 bg-white" style="height:380px;overflow-y:auto">
        ${t}
      </div>

      <div class="input-group">
        <input id="hermes-q" type="text" class="form-control" placeholder="Escribí tu pregunta…" autocomplete="off" />
        <button id="hermes-send" class="btn btn-primary"><i class="bi bi-send"></i></button>
      </div>
    </div>`}window.router=s;var Ye=`hermes-tareas`;function Xe(){let e=localStorage.getItem(`app-theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e===`dark`||e===null&&t;document.documentElement.setAttribute(`data-bs-theme`,n?`dark`:`light`)}function Ze(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-bs-theme`,e),localStorage.setItem(`app-theme`,e)}var Qe=null;function $e(e,t){for(let n of e)if(n.items.some(e=>e.id===t))return n.id;return e[0]?.id}function et(e,t,n){if(Qe?.abort(),Qe=new AbortController,document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),!t)return;let r=m.getUser(),i=r?r.email||r.full_name||`Usuario`:``,o=localStorage.getItem(n)||e.defaultRoute,c=$e(e.navGroups,o),l=document.documentElement.getAttribute(`data-bs-theme`)===`dark`,u=document.createElement(`aside`);u.className=`app-sidebar`,u.innerHTML=`
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi ${e.brandIcon}"></i></div>
      <span class="sidebar-brand-text">${e.brandText}</span>
    </div>
    <nav class="sidebar-nav">
      ${e.navGroups.map(e=>`
        <div class="nav-group ${e.id===c?`expanded`:``}" data-group="${e.id}">
          <button class="nav-group-header">
            <i class="bi ${e.icon} group-icon"></i>
            <span>${e.label}</span>
            <i class="bi bi-chevron-down chevron"></i>
          </button>
          <div class="nav-group-items">
            ${e.items.map(e=>`
              <button class="nav-item-btn ${e.id===o?`active`:``}" data-route="${e.id}">
                <i class="bi ${e.icon}"></i>
                <span>${e.label}</span>
              </button>`).join(``)}
          </div>
        </div>`).join(``)}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="bi bi-person-circle"></i>
        <span class="sidebar-user-name" title="${i}">${i.split(`@`)[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${l?`bi-sun-fill`:`bi-moon-fill`}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `;let d=document.createElement(`nav`);d.className=`app-bottom-nav`,d.innerHTML=e.navGroups.map(e=>`
    <button class="bottom-tab ${e.id===c?`active`:``}" data-group="${e.id}">
      <i class="bi ${e.icon}"></i>
      <span>${e.label}</span>
    </button>
  `).join(``);let f=document.createElement(`div`);f.className=`mobile-sub-sheet`,f.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `,document.body.prepend(u),document.body.prepend(d),document.body.prepend(f);let{signal:p}=Qe,ee=(t=localStorage.getItem(n)||e.defaultRoute)=>{let r=$e(e.navGroups,t);d.querySelectorAll(`.bottom-tab`).forEach(e=>{e.classList.toggle(`active`,e.dataset.group===r)});let i=f.dataset.group;f.classList.contains(`open`)&&i&&i!==r&&f.classList.remove(`open`)};u.querySelectorAll(`.nav-group-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.nav-group`),n=t.classList.contains(`expanded`);u.querySelectorAll(`.nav-group`).forEach(e=>e.classList.remove(`expanded`)),n||t.classList.add(`expanded`)},{signal:p})}),u.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>{s.navigate(e.dataset.route)},{signal:p})}),u.querySelector(`#sidebarBtnTheme`).addEventListener(`click`,()=>{Ze();let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;u.querySelector(`#sidebarBtnTheme i`).className=e?`bi bi-sun-fill`:`bi bi-moon-fill`},{signal:p}),u.querySelector(`#sidebarBtnLogout`).addEventListener(`click`,async()=>{await a.auth.signOut(),window.location.reload()},{signal:p});function te(t){let r=e.navGroups.find(e=>e.id===t);if(!r)return;let i=localStorage.getItem(n)||e.defaultRoute,a=document.getElementById(`sheetTitle`),o=document.getElementById(`sheetItems`);!a||!o||(a.textContent=r.label,o.innerHTML=r.items.map(e=>`
      <button class="sheet-item ${e.id===i?`active`:``}" data-route="${e.id}">
        <i class="bi ${e.icon}"></i>
        <span>${e.label}</span>
      </button>
    `).join(``),f.dataset.group=t,f.classList.add(`open`),o.querySelectorAll(`.sheet-item`).forEach(t=>{t.addEventListener(`click`,()=>{s.navigate(t.dataset.route),f.classList.remove(`open`),d.querySelectorAll(`.bottom-tab`).forEach(n=>n.classList.toggle(`active`,n.dataset.group===$e(e.navGroups,t.dataset.route)))})}))}d.querySelectorAll(`.bottom-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.group;f.classList.contains(`open`)&&f.dataset.group===t?f.classList.remove(`open`):(te(t),d.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===t)))})}),window.addEventListener(`routeChanged`,e=>{let t=e.detail;ee(t),u.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.route===t)})},{signal:p}),ee(o)}async function tt(e){let{data:t}=await a.from(`profiles`).select(`rol`).eq(`id`,e).maybeSingle();return t?.rol||null}function nt(e,t){document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),e.innerHTML=`
    <div class="d-flex align-items-center justify-content-center" style="min-height:100vh">
      <div class="text-center p-4">
        <i class="bi bi-shield-lock" style="font-size:3rem;opacity:0.4"></i>
        <h4 class="mt-3">Sin acceso a ${t}</h4>
        <p class="text-muted">Tu cuenta no tiene permiso para este portal.</p>
        <button class="btn btn-outline-secondary btn-sm" id="btnSalir">
          <i class="bi bi-box-arrow-right me-1"></i>Cambiar de cuenta
        </button>
      </div>
    </div>
  `,e.querySelector(`#btnSalir`)?.addEventListener(`click`,async()=>{await a.auth.signOut(),window.location.reload()})}async function rt(e){let t=`current-view-${e.hermesDept.toLowerCase()}`,n=document.querySelector(`#app`);if(!n){console.error(`El contenedor #app no existe en el HTML`);return}Xe();try{ie()}catch(e){console.error(`Error registrando auth:`,e)}e.registrars.forEach(e=>{try{e()}catch(e){console.error(`Error registrando módulo:`,e)}}),s.register(Ye,(t,n={})=>Oe(t,{departamento:e.hermesDept,hideCalendarBtn:!0,...n})),s.register(`hermes-caso`,(e,t={})=>ze(e,t)),s.register(`cierre-academico`,e=>l(e)),s.register(`hermes-procedimientos`,e=>je(e)),s.register(`dir-score`,e=>he(e)),s.register(`hermes-consulta`,e=>Ke(e)),s.initCustomEvents(),await m.refreshAuth(),s.setAuthGuard(()=>m.isAuthenticated(),[`login`,`register`]),s.init=function(){let n=localStorage.getItem(t)||e.defaultRoute;this.navigate(n)};let r=s._navigateTo.bind(s);s._navigateTo=function(e,n={}){r(e,n),localStorage.setItem(t,e)};let i=async()=>{if(!m.isAuthenticated()){et(e,!1,t),s.navigate(`login`);return}let r=m.getUser()||m.getState?.().user;if(!r?.id){console.warn(`[portalShell] autenticado pero sin user.id; redirigiendo a login`),et(e,!1,t),s.navigate(`login`);return}let i=await tt(r.id);if(!e.allowedRoles.includes(i)){nt(n,e.brandText);return}et(e,!0,t);let a=localStorage.getItem(t);s.navigate(a&&s.routes[a]?a:e.defaultRoute)};try{await i()}catch(t){console.error(`[portalShell] Error en boot:`,t),it(n,e.brandText,t);return}let a=!1;m.subscribe(async e=>{if(!a){a=!0;try{e.user?await i():(document.querySelector(`.app-sidebar`)?.remove(),n.innerHTML=``,s.navigate(`login`))}catch(e){console.error(`[portalShell] Error en re-gate:`,e)}finally{a=!1}}})}function it(e,t,n){document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),e.innerHTML=`
    <div class="d-flex align-items-center justify-content-center" style="min-height:100vh">
      <div class="text-center p-4" style="max-width:520px">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size:2.5rem"></i>
        <h5 class="mt-3">No se pudo iniciar ${t}</h5>
        <pre class="text-start small bg-body-secondary p-3 rounded mt-3" style="white-space:pre-wrap;overflow:auto;max-height:240px">${String(n?.stack||n?.message||n)}</pre>
        <button class="btn btn-outline-secondary btn-sm" onclick="window.location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
        </button>
      </div>
    </div>
  `}var at={violin:`Violín`,volín:`Violín`,violín:`Violín`,viola:`Viola`,cello:`Cello`,violoncello:`Cello`,violonchelo:`Cello`,chelo:`Cello`,contrabajo:`Contrabajo`,flauta:`Flauta`,oboe:`Oboe`,clarinete:`Clarinete`,fagot:`Fagot`,saxofon:`Saxofón`,saxofón:`Saxofón`,corno:`Corno`,trompeta:`Trompeta`,trombón:`Trombón`,trombon:`Trombón`,tuba:`Tuba`,percusión:`Percusión`,percusion:`Percusión`,coro:`Coro`,piano:`Piano`},ot={cuerdas:{label:`Cuerdas`,icon:`bi-music-note-beamed`,instrumentos:[`Violín`,`Viola`,`Cello`,`Contrabajo`]},maderas:{label:`Maderas`,icon:`bi-wind`,instrumentos:[`Flauta`,`Oboe`,`Clarinete`,`Fagot`,`Saxofón`]},metales:{label:`Metales`,icon:`bi-trumpet`,instrumentos:[`Corno`,`Trompeta`,`Trombón`,`Tuba`]},percusion:{label:`Percusión`,icon:`bi-bullseye`,instrumentos:[`Percusión`]},coro:{label:`Coro`,icon:`bi-people`,instrumentos:[`Coro`]},otros:{label:`Otros`,icon:`bi-three-dots`,instrumentos:[`Piano`]}};function st(e){return e?at[String(e).trim().toLowerCase()]||ft(String(e).trim()):null}function ct(e){let t=st(e);if(!t)return`otros`;for(let[e,n]of Object.entries(ot))if(n.instrumentos.includes(t))return e;return`otros`}function lt(e){if(!e)return null;let t=String(e).replace(/\D/g,``);return t.length===0||(t.length===10&&(t=`1`+t),t.length<11)?null:t}function ut(e,t=``){let n=lt(e);return n?`https://wa.me/${n}${t?`?text=${encodeURIComponent(t)}`:``}`:null}function dt(e,t={}){if(!e)return``;let n=ot[ct(t.instrumento)];return e.replace(/\{nombre_alumno\}/g,t.alumno||``).replace(/\{representante\}/g,t.contactoNombre||``).replace(/\{instrumento\}/g,st(t.instrumento)||``).replace(/\{seccion\}/g,n?.label||``)}function ft(e){return e&&e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()}[[`Ana Lucía Pérez`,`Violín`,`María Pérez`,`8095551001`,`maria.perez@example.com`],[`Carlos Ramírez`,`Violin`,`José Ramírez`,`8295551002`,`jose.ramirez@example.com`],[`Daniela Gómez`,`Viola`,`Rosa Gómez`,`8495551003`,`rosa.gomez@example.com`],[`Esteban Núñez`,`Cello`,`Pedro Núñez`,`8095551004`,`pedro.nunez@example.com`],[`Fabiola Díaz`,`Contrabajo`,`Luisa Díaz`,`8095551005`,null],[`Gabriel Soto`,`Flauta`,`Carmen Soto`,`8295551006`,`carmen.soto@example.com`],[`Helena Cruz`,`Clarinete`,`Marta Cruz`,`8495551007`,`marta.cruz@example.com`],[`Iván Mejía`,`Trompeta`,`Raúl Mejía`,`8095551008`,`raul.mejia@example.com`],[`Julia Vargas`,`Trombón`,`Sofía Vargas`,null,`sofia.vargas@example.com`],[`Kevin Reyes`,`Percusión`,`Ana Reyes`,`8295551010`,`ana.reyes@example.com`]].map((e,t)=>{let[n,r,i,a,o]=e;return{alumnoId:`mock-al-${String(t+1).padStart(3,`0`)}`,alumno:n,instrumento:st(r),familia:ct(r),contactoNombre:i,whatsapp:a,email:o}}),new Date().toISOString(),new Date().toISOString();var pt=n({eliminarPlantilla:()=>_t,enviarCorreo:()=>vt,getContactos:()=>mt,getPlantillas:()=>ht,guardarPlantilla:()=>gt});async function mt(){let{data:e,error:t}=await a.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, activo, representante_nombre, representante_tlf, madre_nombre, madre_tlf_whatsapp, padre_nombre, padre_tlf_whatsapp, familiar_nombre, familiar_telefono, correo_representante`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(t)throw t;return(e||[]).map(e=>{let t=e.madre_tlf_whatsapp||e.padre_tlf_whatsapp||e.representante_tlf||e.familiar_telefono||null,n=e.representante_nombre||e.madre_nombre||e.padre_nombre||e.familiar_nombre||`Representante`;return{alumnoId:e.id,alumno:e.nombre_completo,instrumento:st(e.instrumento_principal),familia:ct(e.instrumento_principal),contactoNombre:n,whatsapp:t,email:e.correo_representante||null}})}async function ht(){let{data:e,error:t}=await a.from(`document_templates`).select(`id, nombre, tipo, descripcion, contenido, variables, estado, version, updated_at`).order(`nombre`,{ascending:!0});if(t)throw t;return e||[]}async function gt(e){let t={nombre:e.nombre,tipo:e.tipo||`mensaje`,descripcion:e.descripcion||null,contenido:e.contenido||``,variables:e.variables||[],estado:e.estado||`activa`,updated_at:new Date().toISOString()};if(e.id){let{data:n,error:r}=await a.from(`document_templates`).update(t).eq(`id`,e.id).select().single();if(r)throw r;return n}let{data:n,error:r}=await a.from(`document_templates`).insert(t).select().single();if(r)throw r;return n}async function _t(e){let{error:t}=await a.from(`document_templates`).delete().eq(`id`,e);if(t)throw t;return!0}async function vt(e){let{data:t,error:n}=await a.functions.invoke(`send-email`,{body:e});if(n){let e=n.message;try{let t=await n.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(t&&t.ok===!1&&t.enviados===0)throw Error(t.batches?.[0]?.error||`No se pudo enviar el correo`);return t}var S=pt,yt=S.getContactos,bt=S.getPlantillas,xt=S.guardarPlantilla,St=S.eliminarPlantilla,Ct=S.enviarCorreo,wt=`Eres el asistente de redacción del Departamento de Comunicaciones de
"El Sistema Punta Cana", una fundación de educación musical para jóvenes de bajos recursos.
Mejorás mensajes institucionales dirigidos a representantes/familias de alumnos.
Reglas:
- Tono cálido, cercano y respetuoso, pero profesional e institucional.
- Español neutro dominicano. Claro y conciso.
- Conservá las variables entre llaves como {nombre_alumno}, {representante}, {instrumento}, {seccion} EXACTAMENTE como están.
- No inventes datos (fechas, lugares, montos) que no estén en el texto original.
- Devolvé SOLO el mensaje mejorado, sin explicaciones ni comillas.`;async function Tt(e,t=``){let n=t?`Instrucción adicional: ${t}\n\nMensaje a mejorar:\n${e}`:`Mensaje a mejorar:\n${e}`,r=await ve([{role:`system`,content:wt},{role:`user`,content:n}]);return typeof r==`string`?r.trim():r&&typeof r.content==`string`?r.content.trim():String(r||``).trim()}function Et(e){let t=new Date;return t.setDate(t.getDate()+e),t.toISOString().slice(0,10)}new Date(Date.now()-2*864e5).toISOString(),Et(-1),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),Et(0),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString();var Dt=n({actualizarSeguimiento:()=>Nt,cerrarSeguimiento:()=>Pt,crearSeguimiento:()=>Mt,eliminarSeguimiento:()=>Ft,getSeguimientos:()=>At,getSeguimientosByAlumno:()=>jt}),Ot=`comunicaciones_seguimiento`,kt=`id, alumno_id, contacto_nombre, contacto_telefono, contacto_email, canal, fecha, resultado, notas, requiere_seguimiento, proxima_accion, proxima_fecha, estado, responsable_id, created_at, updated_at`;async function At(e={}){let t=a.from(Ot).select(kt);e.alumno_id&&(t=t.eq(`alumno_id`,e.alumno_id)),e.estado&&(t=t.eq(`estado`,e.estado)),e.canal&&(t=t.eq(`canal`,e.canal));let{data:n,error:r}=await t.order(`fecha`,{ascending:!1});if(r)throw r;return n||[]}async function jt(e){return At({alumno_id:e})}async function Mt(e){let t={alumno_id:e.alumno_id||null,contacto_nombre:e.contacto_nombre||null,contacto_telefono:e.contacto_telefono||null,contacto_email:e.contacto_email||null,canal:e.canal||`llamada`,fecha:e.fecha||new Date().toISOString(),resultado:e.resultado||`contactado`,notas:e.notas||null,requiere_seguimiento:!!e.requiere_seguimiento,proxima_accion:e.proxima_accion||null,proxima_fecha:e.proxima_fecha||null,estado:e.estado||`abierto`},{data:n,error:r}=await a.from(Ot).insert(t).select(kt).single();if(r)throw r;return n}async function Nt(e,t={}){let{data:n,error:r}=await a.from(Ot).update(t).eq(`id`,e).select(kt).single();if(r)throw r;return n}async function Pt(e){return Nt(e,{estado:`cerrado`,requiere_seguimiento:!1})}async function Ft(e){let{error:t}=await a.from(Ot).delete().eq(`id`,e);if(t)throw t;return!0}var C=Dt,It=C.getSeguimientos;C.getSeguimientosByAlumno;var Lt=C.crearSeguimiento,Rt=C.actualizarSeguimiento,zt=C.cerrarSeguimiento,Bt=C.eliminarSeguimiento,w={llamada:{label:`Llamada`,icon:`bi-telephone`},whatsapp:{label:`WhatsApp`,icon:`bi-whatsapp`},correo:{label:`Correo`,icon:`bi-envelope`},reunion:{label:`Reunión`,icon:`bi-people`},otro:{label:`Otro`,icon:`bi-chat-dots`}},Vt={contactado:{label:`Contactado`,color:`success`},buzon_no_contesto:{label:`Buzón / No contestó`,color:`secondary`},reagendar:{label:`Reagendar`,color:`warning`},sin_interes:{label:`Sin interés`,color:`dark`},resuelto:{label:`Resuelto`,color:`primary`}};function Ht(e){if(e instanceof Date)return new Date(e);if(typeof e==`string`){let t=e.match(/^(\d{4})-(\d{2})-(\d{2})/);if(t)return new Date(Number(t[1]),Number(t[2])-1,Number(t[3]))}return new Date(e)}function Ut(e){let t=Ht(e);return t.setHours(0,0,0,0),t}function Wt(e){return e?.proxima_fecha?Ut(e.proxima_fecha):null}function Gt(e){return e?.estado===`abierto`}function Kt(e,t=new Date){let n=Wt(e);return n?Math.round((n-Ut(t))/864e5):null}function qt(e=[],t=new Date){let n={vencidos:[],hoy:[],proximos:[]};for(let r of e){if(!Gt(r)||!r?.requiere_seguimiento)continue;let e=Kt(r,t);e!==null&&(e<0?n.vencidos.push(r):e===0?n.hoy.push(r):n.proximos.push(r))}return n}var T={registros:[],filtroCanal:`todos`,filtroEstado:`abierto`},E=null;async function D(e){E?.abort(),E=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{T.registros=await It(),Jt(e)}catch(n){console.error(`[Seguimiento] Error:`,n),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar seguimiento</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>E?.abort()}}function Jt(e){let t=qt(T.registros),n=Zt();e.innerHTML=`
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
            style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
            <i class="bi bi-telephone-outbound fs-4"></i>
          </div>
          <div>
            <h1 class="mb-0 h3">Seguimiento de Comunicaciones</h1>
            <p class="text-muted small mb-0">Registro de interacciones · agenda de próximos pasos</p>
          </div>
        </div>
        <button class="btn btn-primary" id="segNuevo"><i class="bi bi-plus-lg me-1"></i>Registrar interacción</button>
      </div>

      <!-- Agenda de follow-up -->
      <div class="row g-3 mb-4">
        ${Yt(`Vencidos`,t.vencidos,`danger`,`bi-exclamation-octagon`)}
        ${Yt(`Para hoy`,t.hoy,`warning`,`bi-calendar-day`)}
        ${Yt(`Próximos`,t.proximos,`info`,`bi-calendar-week`)}
      </div>

      <!-- Historial -->
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h6 class="fw-bold mb-0"><i class="bi bi-clock-history me-1"></i>Historial de interacciones</h6>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" id="segFiltroEstado" style="max-width:140px">
            <option value="todos" ${T.filtroEstado===`todos`?`selected`:``}>Todos</option>
            <option value="abierto" ${T.filtroEstado===`abierto`?`selected`:``}>Abiertos</option>
            <option value="cerrado" ${T.filtroEstado===`cerrado`?`selected`:``}>Cerrados</option>
          </select>
          <select class="form-select form-select-sm" id="segFiltroCanal" style="max-width:140px">
            <option value="todos">Todo canal</option>
            ${Object.entries(w).map(([e,t])=>`<option value="${e}" ${T.filtroCanal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select>
        </div>
      </div>
      <div id="segLista">
        ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay interacciones para este filtro</div>`:n.map(Xt).join(``)}
      </div>
    </div>
  `,Qt(e)}function Yt(e,n,r,i){return`
    <div class="col-md-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-${r} bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
          <span class="fw-bold text-${r}"><i class="bi ${i} me-1"></i>${e}</span>
          <span class="badge bg-${r}">${n.length}</span>
        </div>
        <div class="card-body p-2" style="max-height:240px;overflow-y:auto">
          ${n.length===0?`<p class="text-muted small text-center mb-0 py-3">Sin pendientes</p>`:n.map(e=>`
            <button class="btn btn-light btn-sm w-100 text-start mb-1 seg-agenda-item" data-id="${e.id}">
              <div class="fw-semibold small">${t(e.contacto_nombre||`Contacto`)}</div>
              <div class="text-muted extra-small">${t(e.proxima_accion||`Seguimiento`)}</div>
            </button>`).join(``)}
        </div>
      </div>
    </div>
  `}function Xt(e){let n=w[e.canal]||w.otro,r=Vt[e.resultado]||{label:e.resultado,color:`secondary`},i=e.requiere_seguimiento?Kt(e):null,a=i===null?`text-muted`:i<0?`text-danger`:i===0?`text-warning`:`text-muted`;return`
    <div class="card border-0 shadow-sm mb-2 seg-card" data-id="${e.id}">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="bi ${n.icon} text-primary"></i>
              <span class="fw-semibold">${t(e.contacto_nombre||`Contacto`)}</span>
              <span class="badge bg-${r.color} bg-opacity-75">${r.label}</span>
              ${e.estado===`cerrado`?`<span class="badge bg-secondary">Cerrado</span>`:``}
            </div>
            ${e.notas?`<p class="small text-secondary mb-1">${t(e.notas)}</p>`:``}
            ${e.requiere_seguimiento&&e.proxima_fecha?`<div class="small ${a}"><i class="bi bi-arrow-return-right"></i>
                    ${t(e.proxima_accion||`Seguimiento`)} · ${e.proxima_fecha}${i!==null&&i<0?` (vencido)`:i===0?` (hoy)`:``}</div>`:``}
          </div>
          <div class="text-end flex-shrink-0">
            <div class="text-muted extra-small mb-1">${new Date(e.fecha).toLocaleDateString(`es-DO`)}</div>
            <button class="btn btn-sm btn-outline-secondary seg-edit" data-id="${e.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            ${e.estado===`abierto`?`<button class="btn btn-sm btn-outline-success seg-cerrar" data-id="${e.id}" title="Cerrar"><i class="bi bi-check2"></i></button>`:``}
          </div>
        </div>
      </div>
    </div>
  `}function Zt(){let e=[...T.registros];return T.filtroEstado!==`todos`&&(e=e.filter(e=>e.estado===T.filtroEstado)),T.filtroCanal!==`todos`&&(e=e.filter(e=>e.canal===T.filtroCanal)),e}function Qt(t){let n=E.signal;t.querySelector(`#segNuevo`)?.addEventListener(`click`,()=>$t(null,()=>D(t)),{signal:n}),t.querySelector(`#segFiltroEstado`)?.addEventListener(`change`,e=>{T.filtroEstado=e.target.value,Jt(t)},{signal:n}),t.querySelector(`#segFiltroCanal`)?.addEventListener(`change`,e=>{T.filtroCanal=e.target.value,Jt(t)},{signal:n});let r=e=>{let n=T.registros.find(t=>t.id===e);n&&$t(n,()=>D(t))};t.querySelectorAll(`.seg-agenda-item, .seg-edit`).forEach(e=>e.addEventListener(`click`,()=>r(e.dataset.id),{signal:n})),t.querySelectorAll(`.seg-cerrar`).forEach(r=>r.addEventListener(`click`,async()=>{try{await zt(r.dataset.id),e.show(`Seguimiento cerrado`,`success`),D(t)}catch(t){e.show(`Error: ${t.message}`,`error`)}},{signal:n}))}function $t(n,i,a=null){let o=!n,s=n||{alumno_id:a?.alumnoId||null,contacto_nombre:a?.alumno||a?.contactoNombre||``,contacto_telefono:a?.whatsapp||``,contacto_email:a?.email||``,canal:`llamada`,fecha:new Date().toISOString(),resultado:`contactado`,notas:``,requiere_seguimiento:!1,proxima_accion:``,proxima_fecha:``,estado:`abierto`},c=new Date().toISOString().slice(0,10);r.open({title:o?`Registrar interacción`:`Editar seguimiento`,size:`lg`,body:`
      <div class="row g-2 mb-2">
        <div class="col-md-6"><label class="form-label small fw-semibold">Contacto *</label>
          <input type="text" class="form-control form-control-sm" id="segNombre" value="${t(s.contacto_nombre||``)}"></div>
        <div class="col-md-6"><label class="form-label small fw-semibold">Teléfono</label>
          <input type="text" class="form-control form-control-sm" id="segTel" value="${t(s.contacto_telefono||``)}"></div>
      </div>
      <div class="row g-2 mb-2">
        <div class="col-md-4"><label class="form-label small fw-semibold">Canal</label>
          <select class="form-select form-select-sm" id="segCanal">
            ${Object.entries(w).map(([e,t])=>`<option value="${e}" ${s.canal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Resultado</label>
          <select class="form-select form-select-sm" id="segResultado">
            ${Object.entries(Vt).map(([e,t])=>`<option value="${e}" ${s.resultado===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segFecha" value="${(s.fecha||``).slice(0,10)||c}"></div>
      </div>
      <div class="mb-2"><label class="form-label small fw-semibold">Notas (¿qué se habló? ¿en qué quedaron?)</label>
        <textarea class="form-control form-control-sm" id="segNotas" rows="3">${t(s.notas||``)}</textarea></div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="segReq" ${s.requiere_seguimiento?`checked`:``}>
        <label class="form-check-label small fw-semibold" for="segReq">Requiere seguimiento (agendar próxima acción)</label>
      </div>
      <div id="segProxWrap" class="row g-2 ${s.requiere_seguimiento?``:`d-none`}">
        <div class="col-md-8"><label class="form-label small">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="segProxAccion" value="${t(s.proxima_accion||``)}" placeholder="Ej. Volver a llamar para confirmar"></div>
        <div class="col-md-4"><label class="form-label small">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segProxFecha" value="${s.proxima_fecha||``}"></div>
      </div>
    `,saveText:o?`Registrar`:`Guardar`,deleteText:`Eliminar`,onDelete:o?null:async()=>{try{await Bt(s.id),e.show(`Registro eliminado`,`success`),i?.()}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}},onShow:e=>{e.querySelector(`#segReq`)?.addEventListener(`change`,t=>{e.querySelector(`#segProxWrap`).classList.toggle(`d-none`,!t.target.checked)})},onSave:async t=>{let n=t.querySelector(`#segNombre`).value.trim();if(!n)return e.show(`El contacto es obligatorio`,`error`),!1;let r=t.querySelector(`#segReq`).checked,a={alumno_id:s.alumno_id||null,contacto_nombre:n,contacto_telefono:t.querySelector(`#segTel`).value.trim()||null,contacto_email:s.contacto_email||null,canal:t.querySelector(`#segCanal`).value,resultado:t.querySelector(`#segResultado`).value,fecha:new Date(t.querySelector(`#segFecha`).value||c).toISOString(),notas:t.querySelector(`#segNotas`).value.trim()||null,requiere_seguimiento:r,proxima_accion:r&&t.querySelector(`#segProxAccion`).value.trim()||null,proxima_fecha:r&&t.querySelector(`#segProxFecha`).value||null};try{o?await Lt(a):await Rt(s.id,a),e.show(`Seguimiento guardado`,`success`),i?.()}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}}})}var en=[`{nombre_alumno}`,`{representante}`,`{instrumento}`,`{seccion}`],O={contactos:[],plantillas:[],tab:`directorio`,filtroFamilia:`todas`,busqueda:``,seleccion:new Set,canal:`whatsapp`,asunto:``,mensaje:``},k=null;async function tn(e){k?.abort(),k=new AbortController,e.innerHTML=nn();try{let[t,n]=await Promise.all([yt(),bt()]);O.contactos=t,O.plantillas=n,A(e)}catch(n){console.error(`[Comunicaciones] Error:`,n),e.innerHTML=`<div class="container mt-5"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar Comunicaciones</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>k?.abort()}}function nn(){return`<div class="d-flex justify-content-center align-items-center" style="min-height:400px">
    <div class="text-center"><div class="spinner-border text-primary mb-3"></div>
    <p class="text-muted">Cargando central de comunicaciones...</p></div></div>`}function A(e){e.innerHTML=`
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
          <i class="bi bi-megaphone fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Central de Comunicaciones</h1>
          <p class="text-muted small mb-0">Directorio · WhatsApp · Correo · Plantillas · IA</p>
        </div>
      </div>

      <ul class="nav nav-pills comm-tabs mb-3">
        ${j(`directorio`,`bi-journal-text`,`Directorio`)}
        ${j(`compositor`,`bi-pencil-square`,`Compositor${O.seleccion.size?` (${O.seleccion.size})`:``}`)}
        ${j(`plantillas`,`bi-files`,`Plantillas`)}
        ${j(`boletines`,`bi-robot`,`Boletines Automáticos`)}
      </ul>

      <div id="comm-body"></div>
    </div>
  `,e.querySelectorAll(`.comm-tab-btn`).forEach(t=>t.addEventListener(`click`,()=>{O.tab=t.dataset.tab,A(e)},{signal:k.signal})),rn(e)}function j(e,t,n){return`<li class="nav-item"><button class="nav-link comm-tab-btn ${O.tab===e?`active`:``}" data-tab="${e}">
    <i class="bi ${t} me-1"></i>${n}</button></li>`}function rn(e){let t=e.querySelector(`#comm-body`);O.tab===`directorio`?on(e,t):O.tab===`compositor`?N(e,t):O.tab===`plantillas`?pn(e,t):P(e,t)}function an(){let e=[...O.contactos];if(O.filtroFamilia!==`todas`&&(e=e.filter(e=>e.familia===O.filtroFamilia)),O.busqueda){let t=O.busqueda.toLowerCase();e=e.filter(e=>(e.alumno||``).toLowerCase().includes(t)||(e.contactoNombre||``).toLowerCase().includes(t)||(e.instrumento||``).toLowerCase().includes(t))}return e}function on(e,n){let r=an(),i=Object.entries(ot),a=e=>O.contactos.filter(t=>t.familia===e).length;n.innerHTML=`
    <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
      <input type="text" class="form-control form-control-sm" id="commBuscar" style="max-width:260px"
        placeholder="🔍 Buscar alumno, representante o instrumento" value="${t(O.busqueda)}">
      <button class="btn btn-sm ${O.filtroFamilia===`todas`?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="todas">
        Todas (${O.contactos.length})
      </button>
      ${i.filter(([e])=>a(e)>0).map(([e,t])=>`<button class="btn btn-sm ${O.filtroFamilia===e?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label} (${a(e)})
            </button>`).join(``)}
    </div>

    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="commSelAll">
        <label class="form-check-label small" for="commSelAll">Seleccionar los ${r.length} filtrados</label>
      </div>
      <div class="small text-muted">
        <span class="fw-bold text-primary">${O.seleccion.size}</span> seleccionados
        ${O.seleccion.size?`· <button class="btn btn-link btn-sm p-0 align-baseline" id="commClear">limpiar</button>`:``}
      </div>
    </div>

    <div class="table-responsive comm-table-wrap">
      <table class="table table-sm table-hover align-middle mb-0">
        <thead class="table-light"><tr>
          <th style="width:36px"></th><th>Alumno</th><th>Instrumento</th><th>Representante</th>
          <th>WhatsApp</th><th>Correo</th><th style="width:44px"></th>
        </tr></thead>
        <tbody>
          ${r.length===0?`<tr><td colspan="7" class="text-center text-muted py-4">Sin contactos para este filtro</td></tr>`:r.map(sn).join(``)}
        </tbody>
      </table>
    </div>

    <div class="comm-sticky-actions mt-3">
      <button class="btn btn-primary" id="commToComposer" ${O.seleccion.size===0?`disabled`:``}>
        <i class="bi bi-pencil-square me-1"></i> Redactar a ${O.seleccion.size} contacto${O.seleccion.size===1?``:`s`}
      </button>
    </div>
  `;let o=k.signal;n.querySelector(`#commBuscar`)?.addEventListener(`input`,t=>{O.busqueda=t.target.value,on(e,n)},{signal:o}),n.querySelectorAll(`.comm-fam`).forEach(t=>t.addEventListener(`click`,()=>{O.filtroFamilia=t.dataset.fam,on(e,n)},{signal:o}));let s=r.length>0&&r.every(e=>O.seleccion.has(e.alumnoId)),c=n.querySelector(`#commSelAll`);c&&(c.checked=s),c?.addEventListener(`change`,t=>{r.forEach(e=>t.target.checked?O.seleccion.add(e.alumnoId):O.seleccion.delete(e.alumnoId)),A(e)},{signal:o}),n.querySelector(`#commClear`)?.addEventListener(`click`,()=>{O.seleccion.clear(),A(e)},{signal:o}),n.querySelectorAll(`.comm-row-check`).forEach(t=>t.addEventListener(`change`,n=>{n.target.checked?O.seleccion.add(t.dataset.id):O.seleccion.delete(t.dataset.id),A(e)},{signal:o})),n.querySelector(`#commToComposer`)?.addEventListener(`click`,()=>{O.tab=`compositor`,A(e)},{signal:o}),n.querySelectorAll(`.comm-seg-btn`).forEach(e=>e.addEventListener(`click`,()=>{let t=O.contactos.find(t=>t.alumnoId===e.dataset.id);t&&$t(null,null,t)},{signal:o}))}function sn(e){let n=lt(e.whatsapp);return`<tr>
    <td><input class="form-check-input comm-row-check" type="checkbox" data-id="${e.alumnoId}" ${O.seleccion.has(e.alumnoId)?`checked`:``}></td>
    <td class="fw-semibold">${t(e.alumno||``)}</td>
    <td><span class="badge bg-light text-dark border">${t(e.instrumento||`—`)}</span></td>
    <td class="small">${t(e.contactoNombre||``)}</td>
    <td class="small">${n?`<i class="bi bi-whatsapp text-success"></i> ${t(e.whatsapp)}`:`<span class="text-muted">—</span>`}</td>
    <td class="small">${e.email?`<i class="bi bi-envelope text-primary"></i> ${t(e.email)}`:`<span class="text-muted">—</span>`}</td>
    <td><button class="btn btn-sm btn-outline-primary comm-seg-btn" data-id="${e.alumnoId}" title="Registrar seguimiento"><i class="bi bi-telephone-plus"></i></button></td>
  </tr>`}function M(){return O.contactos.filter(e=>O.seleccion.has(e.alumnoId))}function N(e,n){let r=M();if(r.length===0){n.innerHTML=`<div class="alert alert-info"><i class="bi bi-info-circle me-1"></i>
      No hay destinatarios. Andá al <button class="btn btn-link btn-sm p-0 align-baseline" id="commGoDir">Directorio</button> y seleccioná contactos.</div>`,n.querySelector(`#commGoDir`)?.addEventListener(`click`,()=>{O.tab=`directorio`,A(e)},{signal:k.signal});return}let i=r.filter(e=>lt(e.whatsapp)).length,a=r.filter(e=>e.email).length,o=O.plantillas;n.innerHTML=`
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="btn-group mb-3" role="group">
              <button class="btn btn-sm ${O.canal===`whatsapp`?`btn-success`:`btn-outline-success`} comm-canal" data-canal="whatsapp">
                <i class="bi bi-whatsapp me-1"></i>WhatsApp (${i})
              </button>
              <button class="btn btn-sm ${O.canal===`email`?`btn-primary`:`btn-outline-primary`} comm-canal" data-canal="email">
                <i class="bi bi-envelope me-1"></i>Correo (${a})
              </button>
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold d-flex justify-content-between">
                <span>Plantilla</span>
                <span class="text-muted">Variables: insertá con los botones</span>
              </label>
              <select class="form-select form-select-sm mb-2" id="commTpl">
                <option value="">— Sin plantilla (escribir desde cero) —</option>
                ${o.map(e=>`<option value="${e.id}">${t(e.nombre)} · ${t(e.tipo||``)}</option>`).join(``)}
              </select>
            </div>

            ${O.canal===`email`?`<div class="mb-2"><input type="text" class="form-control form-control-sm" id="commAsunto"
                     placeholder="Asunto del correo" value="${t(O.asunto)}"></div>`:``}

            <div class="mb-2 d-flex flex-wrap gap-1">
              ${en.map(e=>`<button class="btn btn-outline-secondary btn-sm py-0 comm-var" data-var="${e}">${e}</button>`).join(``)}
            </div>

            <textarea class="form-control" id="commMsg" rows="8" placeholder="Escribí el mensaje...">${t(O.mensaje)}</textarea>

            <div class="d-flex gap-2 mt-2 flex-wrap">
              <button class="btn btn-sm btn-outline-primary" id="commIA">
                <i class="bi bi-stars me-1"></i>Mejorar con IA
              </button>
              <button class="btn btn-sm btn-outline-secondary" id="commIAOpts">
                <i class="bi bi-sliders me-1"></i>Ajustar tono…
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="fw-bold mb-2"><i class="bi bi-people me-1"></i>${r.length} destinatarios</h6>
            <div class="comm-recipients mb-3">
              ${r.slice(0,40).map(e=>`<span class="badge bg-light text-dark border me-1 mb-1">${t(e.alumno)}</span>`).join(``)}
              ${r.length>40?`<span class="badge bg-secondary">+${r.length-40} más</span>`:``}
            </div>
            <div id="commActionZone"></div>
          </div>
        </div>
      </div>
    </div>
  `;let s=k.signal;n.querySelectorAll(`.comm-canal`).forEach(t=>t.addEventListener(`click`,()=>{O.canal=t.dataset.canal,N(e,n)},{signal:s}));let c=n.querySelector(`#commMsg`);c?.addEventListener(`input`,e=>{O.mensaje=e.target.value},{signal:s}),n.querySelector(`#commAsunto`)?.addEventListener(`input`,e=>{O.asunto=e.target.value},{signal:s}),n.querySelector(`#commTpl`)?.addEventListener(`change`,t=>{let r=O.plantillas.find(e=>e.id===t.target.value);r&&(O.mensaje=r.contenido||``,N(e,n))},{signal:s}),n.querySelectorAll(`.comm-var`).forEach(e=>e.addEventListener(`click`,()=>{gn(c,e.dataset.var),O.mensaje=c.value},{signal:s})),n.querySelector(`#commIA`)?.addEventListener(`click`,()=>dn(e,n,``),{signal:s}),n.querySelector(`#commIAOpts`)?.addEventListener(`click`,()=>fn(e,n),{signal:s}),cn(e,n)}function cn(e,t){let n=t.querySelector(`#commActionZone`);if(!n)return;let r=M();if(O.canal===`whatsapp`)n.innerHTML=`
      <button class="btn btn-success w-100" id="commGenWa">
        <i class="bi bi-whatsapp me-1"></i>Generar links de WhatsApp
      </button>
      <p class="text-muted small mt-2 mb-0">Se abre un link por contacto con el mensaje pre-cargado (personalizado con sus variables). Hacés clic y se envía desde tu WhatsApp.</p>
      <div id="commWaLinks" class="mt-2"></div>
    `,t.querySelector(`#commGenWa`)?.addEventListener(`click`,()=>ln(t),{signal:k.signal});else{let e=r.filter(e=>e.email);n.innerHTML=`
      <button class="btn btn-primary w-100" id="commSendMail" ${e.length===0?`disabled`:``}>
        <i class="bi bi-send me-1"></i>Enviar a ${e.length} correo${e.length===1?``:`s`}
      </button>
      <p class="text-muted small mt-2 mb-0">El correo va por la fundación (Resend). Los destinatarios van en copia oculta (bcc).</p>
    `,t.querySelector(`#commSendMail`)?.addEventListener(`click`,()=>un(t),{signal:k.signal})}}function ln(e){let n=M().filter(e=>lt(e.whatsapp)),r=e.querySelector(`#commWaLinks`);if(n.length===0){r.innerHTML=`<div class="alert alert-warning small mb-0">Ningún destinatario tiene un WhatsApp válido.</div>`;return}r.innerHTML=`
    <div class="d-grid gap-1 comm-wa-list">
      ${n.map(e=>`<a href="${ut(e.whatsapp,dt(O.mensaje,e))}" target="_blank" rel="noopener" class="btn btn-outline-success btn-sm text-start">
            <i class="bi bi-whatsapp me-1"></i>${t(e.alumno)} <span class="text-muted">— ${t(e.contactoNombre)}</span>
          </a>`).join(``)}
    </div>
    <button class="btn btn-link btn-sm mt-1 p-0" id="commWaAll">Abrir todos (puede bloquear el navegador)</button>
  `,e.querySelector(`#commWaAll`)?.addEventListener(`click`,()=>{n.forEach(e=>window.open(ut(e.whatsapp,dt(O.mensaje,e)),`_blank`,`noopener`))},{signal:k.signal})}async function un(t){let n=M().filter(e=>e.email),r=O.asunto.trim(),i=O.mensaje.trim();if(!r){e.show(`Falta el asunto del correo`,`error`);return}if(!i){e.show(`El mensaje está vacío`,`error`);return}let a=t.querySelector(`#commSendMail`),o=a.innerHTML;a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`;try{let t=_n(dt(i,n[0])),a=await Ct({to:n.map(e=>e.email),subject:r,html:t});e.show(`Correo enviado a ${a.enviados} de ${a.total} destinatarios`,a.fallidos?`warning`:`success`)}catch(t){e.show(`Error: ${t.message}`,`error`)}finally{a.disabled=!1,a.innerHTML=o}}async function dn(t,n,r){let i=O.mensaje.trim();if(!i){e.show(`Escribí algo primero para mejorarlo`,`error`);return}let a=n.querySelector(`#commIA`),o=a?.innerHTML;a&&(a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Mejorando...`);try{O.mensaje=await Tt(i,r),N(t,n),e.show(`Mensaje mejorado con IA`,`success`)}catch(t){e.show(`IA no disponible: ${t.message}`,`error`),a&&o&&(a.disabled=!1,a.innerHTML=o)}}function fn(e,t){r.open({title:`Ajustar tono con IA`,body:`
      <p class="small text-muted">Elegí cómo querés que la IA reescriba el mensaje:</p>
      <div class="d-grid gap-2">
        ${[`Más formal`,`Más cálido y cercano`,`Más corto y directo`,`Más motivador`,`Corregir ortografía y gramática`].map(e=>`<button class="btn btn-outline-primary comm-tono" data-tono="${e}">${e}</button>`).join(``)}
      </div>`,hideSave:!0,cancelText:`Cerrar`}),setTimeout(()=>{document.querySelectorAll(`.comm-tono`).forEach(n=>n.addEventListener(`click`,()=>{r.close(),dn(e,t,n.dataset.tono)},{once:!0}))},50)}function pn(e,t){t.innerHTML=`
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted small mb-0">Plantillas reutilizables para mensajes y correos. Usá variables como {nombre_alumno}.</p>
      <button class="btn btn-primary btn-sm" id="commNewTpl"><i class="bi bi-plus-lg me-1"></i>Nueva plantilla</button>
    </div>
    <div class="row g-2">
      ${O.plantillas.length===0?`<div class="col-12"><div class="alert alert-info">Aún no hay plantillas.</div></div>`:O.plantillas.map(mn).join(``)}
    </div>
  `;let n=k.signal;t.querySelector(`#commNewTpl`)?.addEventListener(`click`,()=>hn(e,null),{signal:n}),t.querySelectorAll(`.comm-tpl-edit`).forEach(t=>t.addEventListener(`click`,()=>hn(e,O.plantillas.find(e=>e.id===t.dataset.id)),{signal:n})),t.querySelectorAll(`.comm-tpl-use`).forEach(t=>t.addEventListener(`click`,()=>{O.mensaje=O.plantillas.find(e=>e.id===t.dataset.id)?.contenido||``,O.tab=`compositor`,A(e)},{signal:n}))}function mn(e){return`<div class="col-md-6 col-xl-4">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="fw-bold mb-1">${t(e.nombre)}</h6>
          <span class="badge bg-light text-dark border">${t(e.tipo||`mensaje`)}</span>
        </div>
        <p class="text-muted small mb-2">${t(e.descripcion||``)}</p>
        <p class="small comm-tpl-preview">${t((e.contenido||``).slice(0,120))}${(e.contenido||``).length>120?`…`:``}</p>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary comm-tpl-use" data-id="${e.id}"><i class="bi bi-pencil-square me-1"></i>Usar</button>
          <button class="btn btn-sm btn-outline-secondary comm-tpl-edit" data-id="${e.id}"><i class="bi bi-gear"></i></button>
        </div>
      </div>
    </div>
  </div>`}function hn(n,i){let a=!i;r.open({title:a?`Nueva plantilla`:`Editar plantilla`,size:`lg`,body:`
      <div class="mb-2"><label class="form-label small fw-semibold">Nombre *</label>
        <input type="text" class="form-control form-control-sm" id="tplNombre" value="${t(i?.nombre||``)}"></div>
      <div class="row g-2 mb-2">
        <div class="col-6"><label class="form-label small fw-semibold">Tipo</label>
          <select class="form-select form-select-sm" id="tplTipo">
            ${[`mensaje`,`correo`,`carta`].map(e=>`<option value="${e}" ${i?.tipo===e?`selected`:``}>${e}</option>`).join(``)}
          </select></div>
        <div class="col-6"><label class="form-label small fw-semibold">Descripción</label>
          <input type="text" class="form-control form-control-sm" id="tplDesc" value="${t(i?.descripcion||``)}"></div>
      </div>
      <div class="mb-1"><label class="form-label small fw-semibold">Contenido</label>
        <div class="mb-1 d-flex flex-wrap gap-1">
          ${en.map(e=>`<button type="button" class="btn btn-outline-secondary btn-sm py-0 tplVar" data-var="${e}">${e}</button>`).join(``)}
        </div>
        <textarea class="form-control" id="tplContenido" rows="6">${t(i?.contenido||``)}</textarea>
      </div>
    `,saveText:a?`Crear`:`Guardar`,deleteText:`Eliminar`,onDelete:a?null:async()=>{try{await St(i.id),O.plantillas=O.plantillas.filter(e=>e.id!==i.id),e.show(`Plantilla eliminada`,`success`),A(n)}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}},onSave:async t=>{let r=t.querySelector(`#tplNombre`).value.trim();if(!r)return e.show(`El nombre es obligatorio`,`error`),!1;let a={id:i?.id,nombre:r,tipo:t.querySelector(`#tplTipo`).value,descripcion:t.querySelector(`#tplDesc`).value.trim(),contenido:t.querySelector(`#tplContenido`).value,variables:en.filter(e=>t.querySelector(`#tplContenido`).value.includes(e)).map(e=>e.replace(/[{}]/g,``))};try{let t=await xt(a),r=O.plantillas.findIndex(e=>e.id===t.id);r>=0?O.plantillas[r]=t:O.plantillas.push(t),e.show(`Plantilla guardada`,`success`),A(n)}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}}}),setTimeout(()=>{document.querySelectorAll(`.tplVar`).forEach(e=>e.addEventListener(`click`,()=>{gn(document.querySelector(`#tplContenido`),e.dataset.var)}))},50)}function gn(e,t){if(!e)return;let n=e.selectionStart??e.value.length,r=e.selectionEnd??e.value.length;e.value=e.value.slice(0,n)+t+e.value.slice(r),e.focus(),e.selectionStart=e.selectionEnd=n+t.length}function _n(e){return`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">
    ${t(e).replace(/\n/g,`<br>`)}
  </div>`}async function P(n,r){let a=await i(()=>import(`./boletinesService-DuVI9lfu.js`).then(e=>e.t),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16])),o=a.obtenerBoletinesEnviados(),s={ausencia_irregular:{label:`Ausencia Irregular`,css:`bg-danger-subtle text-danger border border-danger-subtle`},desempeno_bajo:{label:`Desempeño Bajo`,css:`bg-warning-subtle text-warning-emphasis border border-warning-subtle`},logro_pedagogico:{label:`Logro Pedagógico`,css:`bg-success-subtle text-success border border-success-subtle`},cumpleanos:{label:`Cumpleaños`,css:`bg-info-subtle text-info-emphasis border border-info-subtle`}};r.innerHTML=`
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-3 mb-3">
          <div class="card-body p-3">
            <h6 class="card-title fw-bold mb-2"><i class="bi bi-gear-fill text-primary"></i> Disparadores de Boletines</h6>
            <p class="text-muted small">Simula los disparos automáticos del sistema o tareas programadas (Fase 1).</p>
            <div class="d-grid gap-2">
              <button class="btn btn-outline-danger btn-sm text-start" id="btnRunAusencias">
                <i class="bi bi-calendar-x me-1"></i> Verificar Ausencias Semanales
              </button>
              <button class="btn btn-outline-info btn-sm text-start" id="btnRunCumpleanos">
                <i class="bi bi-gift me-1"></i> Verificar Cumpleaños Diarios
              </button>
              <button class="btn btn-outline-success btn-sm text-start" id="btnRunAvanceMock">
                <i class="bi bi-trophy me-1"></i> Simular Avance Pedagógico (Logro)
              </button>
            </div>
            <hr class="my-3">
            <div class="bg-light p-2 rounded-2 small text-muted">
              <i class="bi bi-info-circle me-1"></i> En producción, estos disparadores corren como tareas programadas (cron jobs) o ganchos del servidor.
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-clock-history"></i> Boletines Enviados Recientemente</h6>
              <span class="badge bg-secondary rounded-pill small">${o.length} en total</span>
            </div>

            ${o.length===0?`
              <div class="text-center py-5 text-muted">
                <i class="bi bi-chat-left-dots fs-1 mb-2 d-block"></i>
                No se han disparado boletines automáticos todavía hoy.
              </div>
            `:`
              <div class="table-responsive" style="max-height: 450px;">
                <table class="table table-hover align-middle table-sm border-0">
                  <thead>
                    <tr class="table-light">
                      <th class="border-0 small">Fecha y Hora</th>
                      <th class="border-0 small">Estudiante</th>
                      <th class="border-0 small">Tipo</th>
                      <th class="border-0 small">Mensaje Pre-cargado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${o.map(e=>{let n=s[e.tipo]||{label:e.tipo,css:`bg-secondary`};return`
                        <tr>
                          <td class="small text-muted">${new Date(e.fecha_envio).toLocaleString(`es-ES`,{month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})}</td>
                          <td>
                            <div class="fw-semibold small">${t(e.alumno_nombre)}</div>
                            <div class="text-muted small" style="font-size:11px">${t(e.contacto_nombre)} (${t(e.contacto_telefono)})</div>
                          </td>
                          <td><span class="badge rounded-pill ${n.css} small" style="font-size:10px">${n.label}</span></td>
                          <td class="small text-muted" style="max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" 
                              title="${t(e.mensaje)}">${t(e.mensaje)}</td>
                        </tr>
                      `}).join(``)}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `,r.querySelector(`#btnRunAusencias`).addEventListener(`click`,async()=>{try{let t=await a.procesarAusenciasSemanales();e.show(`Simulación completada: ${t.procesados} estudiantes analizados, ${t.enviados} boletines enviados.`,`success`),P(n,r)}catch(t){e.show(`Error: ${t.message}`,`error`)}}),r.querySelector(`#btnRunCumpleanos`).addEventListener(`click`,async()=>{try{let t=await a.procesarCumpleanosDiarios();e.show(`Simulación completada: ${t.enviados} saludos de cumpleaños enviados.`,`success`),P(n,r)}catch(t){e.show(`Error: ${t.message}`,`error`)}}),r.querySelector(`#btnRunAvanceMock`).addEventListener(`click`,async()=>{try{await a.procesarAvancePedagogico(`1`,`demo-ind-2`),e.show(`Simulación completada: Logro pedagógico registrado y notificado.`,`success`),P(n,r)}catch(t){e.show(`Error: ${t.message}`,`error`)}})}function F(e,t=18){let n=new Date;return n.setDate(n.getDate()+e),n.setHours(t,0,0,0),n.toISOString()}F(12),F(12,21),F(3,8),F(20,17),F(8,15),F(8,18),F(5,10),F(5,12),F(25,9),F(25,10);var vn=n({getEventos:()=>xn}),yn=`calendario_institucional`,bn=`id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, departamento_responsable, estado`;async function xn(e={}){let t=e.desde||new Date().toISOString(),n=e.dias??120,r=new Date(new Date(t).getTime()+n*864e5).toISOString(),i=a.from(yn).select(bn).gte(`fecha_inicio`,t).lte(`fecha_inicio`,r);e.categoria&&e.categoria!==`todas`&&(i=i.eq(`categoria`,e.categoria));let{data:o,error:s}=await i.order(`fecha_inicio`,{ascending:!0});if(s)throw s;return o||[]}var Sn=vn.getEventos,I={concierto:{label:`Concierto`,icon:`bi-music-note-beamed`,color:`primary`},ensayo:{label:`Ensayo`,icon:`bi-music-note`,color:`info`},reunion:{label:`Reunión`,icon:`bi-people`,color:`secondary`},patrocinio:{label:`Patrocinio`,icon:`bi-gift`,color:`success`},pago:{label:`Pago`,icon:`bi-cash-coin`,color:`warning`},corte:{label:`Corte`,icon:`bi-scissors`,color:`dark`},inscripcion:{label:`Inscripción`,icon:`bi-person-plus`,color:`primary`},auditoria:{label:`Auditoría`,icon:`bi-shield-check`,color:`secondary`},otro:{label:`Otro`,icon:`bi-calendar-event`,color:`secondary`}},Cn=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function wn(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function L(e,t=new Date){return e?.fecha_inicio?Math.round((wn(e.fecha_inicio)-wn(t))/864e5):null}function Tn(e,t=30,n=new Date){let r=L(e,n);return r!==null&&r>=0&&r<=t}function En(e=[]){let t=new Map;for(let n of e){if(!n?.fecha_inicio)continue;let e=new Date(n.fecha_inicio),r=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}`;t.has(r)||t.set(r,{clave:r,label:`${Cn[e.getMonth()]} ${e.getFullYear()}`,eventos:[]}),t.get(r).eventos.push(n)}let n=[...t.values()].sort((e,t)=>e.clave.localeCompare(t.clave));for(let e of n)e.eventos.sort((e,t)=>new Date(e.fecha_inicio)-new Date(t.fecha_inicio));return n}var R={eventos:[],filtroCategoria:`todas`},z=null;async function Dn(e){z?.abort(),z=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{R.eventos=await Sn({dias:120}),On(e)}catch(n){console.error(`[CalendarioCom] Error:`,n),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar el calendario</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>z?.abort()}}function On(e){let t=En(R.filtroCategoria===`todas`?R.eventos:R.eventos.filter(e=>e.categoria===R.filtroCategoria)),n=R.eventos.filter(e=>Tn(e,7)).length,r=R.eventos.filter(e=>Tn(e,30)).length,i=R.eventos.find(e=>e.categoria===`concierto`&&L(e)>=0),a=[...new Set(R.eventos.map(e=>e.categoria))];e.innerHTML=`
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
          <i class="bi bi-calendar-week fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Calendario de Comunicación</h1>
          <p class="text-muted small mb-0">Eventos, ciclos y temporadas · lente sobre el calendario institucional</p>
        </div>
      </div>

      <div class="tareas-kpis d-flex gap-2 flex-wrap mb-3">
        ${kn(`Próximos 7 días`,n,`danger`)}
        ${kn(`Próximos 30 días`,r,`warning`)}
        ${kn(`Total en agenda`,R.eventos.length,`primary`)}
        ${i?`<div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
                 <small class="text-muted">Próximo concierto</small>
                 <div class="fw-bold text-info">${L(i)} día${L(i)===1?``:`s`}</div>
               </div>`:``}
      </div>

      <div class="d-flex gap-2 flex-wrap mb-3">
        <button class="btn btn-sm ${R.filtroCategoria===`todas`?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="todas">Todas</button>
        ${a.map(e=>{let t=I[e]||I.otro;return`<button class="btn btn-sm ${R.filtroCategoria===e?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label}</button>`}).join(``)}
      </div>

      <div id="calAgenda">
        ${t.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-calendar-x"></i> No hay eventos próximos para este filtro</div>`:t.map(An).join(``)}
      </div>
    </div>
  `;let o=z.signal;e.querySelectorAll(`.cal-cat`).forEach(t=>t.addEventListener(`click`,()=>{R.filtroCategoria=t.dataset.cat,On(e)},{signal:o}))}function kn(e,t,n){return`<div class="kpi-card bg-${n} bg-opacity-10 p-2 rounded">
    <small class="text-muted">${e}</small>
    <div class="fs-5 fw-bold text-${n}">${t}</div>
  </div>`}function An(e){return`
    <div class="mb-4">
      <h6 class="fw-bold text-uppercase small text-muted mb-2 border-bottom pb-1">${t(e.label)}</h6>
      ${e.eventos.map(jn).join(``)}
    </div>
  `}function jn(e){let n=I[e.categoria]||I.otro,r=L(e),i=new Date(e.fecha_inicio),a=i.toLocaleDateString(`es-DO`,{weekday:`short`,day:`2-digit`,month:`short`}),o=i.toLocaleTimeString(`es-DO`,{hour:`2-digit`,minute:`2-digit`}),s=r===0?`Hoy`:r===1?`Mañana`:r>0?`En ${r} días`:`Pasado`;return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="text-center flex-shrink-0" style="width:54px">
            <div class="badge bg-${n.color} bg-opacity-10 text-${n.color} border border-${n.color}-subtle w-100 py-1">
              <i class="bi ${n.icon}"></i>
            </div>
            <div class="extra-small text-muted mt-1">${s}</div>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${t(e.titulo)}</div>
            <div class="small text-secondary">${t(e.descripcion||``)}</div>
            <div class="d-flex flex-wrap gap-3 mt-1 small text-muted">
              <span><i class="bi bi-calendar3 me-1"></i>${a} · ${o}</span>
              ${e.ubicacion&&e.ubicacion!==`—`?`<span><i class="bi bi-geo-alt me-1"></i>${t(e.ubicacion)}</span>`:``}
              <span><i class="bi bi-building me-1"></i>${t(e.departamento_responsable||``)}</span>
              <span class="badge bg-${n.color} bg-opacity-75">${n.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Mn(){s.register(`comunicaciones`,e=>tn(e)),s.register(`com-seguimiento`,e=>D(e)),s.register(`com-calendario`,e=>Dn(e))}var B=(e,t)=>({id:`mock-dep-${e.toLowerCase()}`,codigo:e,nombre:t,descripcion:null,email:null,responsable_nombre:null,responsable_email:null,activo:!0,updated_at:new Date().toISOString()});B(`DIR`,`Dirección`),B(`ACM`,`Académica`),B(`ADM`,`Administración`),B(`FIN`,`Financiero`),B(`COM`,`Comunicaciones`),B(`LOG`,`Logística`),B(`TECNICO`,`Técnico`);var Nn=n({actualizarDepartamento:()=>Ln,enviarCorreoPrueba:()=>Rn,getDepartamentos:()=>In}),Pn=`departamentos`,Fn=`id, codigo, nombre, descripcion, email, responsable_nombre, responsable_email, activo, updated_at`;async function In(){let{data:e,error:t}=await a.from(Pn).select(Fn).order(`codigo`,{ascending:!0});if(t)throw t;return e||[]}async function Ln(e,t={}){let n={};t.nombre!==void 0&&(n.nombre=t.nombre),t.email!==void 0&&(n.email=t.email||null),t.responsable_nombre!==void 0&&(n.responsable_nombre=t.responsable_nombre||null),t.responsable_email!==void 0&&(n.responsable_email=t.responsable_email||null),t.activo!==void 0&&(n.activo=t.activo),n.updated_at=new Date().toISOString();let{data:r,error:i}=await a.from(Pn).update(n).eq(`id`,e).select(Fn).single();if(i)throw i;return r}async function Rn(e,t=``){let{data:n,error:r}=await a.functions.invoke(`send-email`,{body:{to:e,subject:`Correo de prueba — Departamento ${t}`.trim(),html:`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#1f2937">
        <p>Este es un <strong>correo de prueba</strong> del SOI (El Sistema Punta Cana).</p>
        <p>Si lo recibís, la casilla del departamento <strong>${zn(t)}</strong> está configurada correctamente
        y Hermes podrá despachar correos a este destino. 🎻</p>
      </div>`}});if(r){let e=r.message;try{let t=await r.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(n&&n.ok===!1&&n.enviados===0)throw Error(n.batches?.[0]?.error||`No se pudo enviar el correo de prueba`);return n}function zn(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var Bn=Nn,Vn=Bn.getDepartamentos,Hn=Bn.actualizarDepartamento,Un=Bn.enviarCorreoPrueba,Wn=/^[^@\s]+@[^@\s]+\.[^@\s]+$/,Gn=null;async function Kn(e){Gn?.abort(),Gn=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{qn(e,await Vn())}catch(n){console.error(`[Departamentos] Error:`,n),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar departamentos</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>Gn?.abort()}}function qn(e,t){let n=t.filter(e=>!e.email).length;e.innerHTML=`
    <div class="page-container" style="max-width:960px;margin:0 auto;padding:1.25rem">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(124,58,237,0.1);color:#7c3aed">
          <i class="bi bi-envelope-at fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Correos de Departamentos</h1>
          <p class="text-muted small mb-0">Correo institucional y responsable de cada departamento. Hermes los usa para despachar mensajes.</p>
        </div>
      </div>

      ${n>0?`<div class="alert alert-warning small py-2"><i class="bi bi-exclamation-triangle me-1"></i>
              ${n} departamento${n===1?``:`s`} sin correo definido. Hermes no podrÃ¡ enviarles hasta cargarlo.</div>`:`<div class="alert alert-success small py-2"><i class="bi bi-check-circle me-1"></i>
              Todos los departamentos tienen correo configurado.</div>`}

      <div class="row g-3">
        ${t.map(Jn).join(``)}
      </div>
    </div>
  `,Yn(e,t)}function Jn(e){return`
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100 dep-card" data-id="${e.id}">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary">${t(e.codigo)}</span>
              <input type="text" class="form-control form-control-sm dep-nombre" style="max-width:200px"
                value="${t(e.nombre||``)}">
            </div>
            <div class="form-check form-switch m-0" title="Activo">
              <input class="form-check-input dep-activo" type="checkbox" ${e.activo?`checked`:``}>
            </div>
          </div>

          <label class="form-label small fw-semibold mb-1">Correo institucional</label>
          <input type="email" class="form-control form-control-sm mb-2 dep-email"
            placeholder="ej. finanzas@funeyca.org" value="${t(e.email||``)}">

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Responsable</label>
              <input type="text" class="form-control form-control-sm dep-resp-nombre"
                placeholder="Nombre" value="${t(e.responsable_nombre||``)}">
            </div>
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Correo responsable</label>
              <input type="email" class="form-control form-control-sm dep-resp-email"
                placeholder="opcional" value="${t(e.responsable_email||``)}">
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-primary dep-save" data-id="${e.id}">
              <i class="bi bi-check-lg me-1"></i>Guardar
            </button>
            <button class="btn btn-sm btn-outline-secondary dep-test" data-id="${e.id}" data-codigo="${t(e.codigo)}"
              ${e.email?``:`disabled`} title="${e.email?`Enviar correo de prueba`:`CargÃ¡ un correo primero`}">
              <i class="bi bi-send me-1"></i>Probar
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function Yn(e,t){let n=Gn.signal;e.querySelectorAll(`.dep-save`).forEach(r=>r.addEventListener(`click`,()=>Xn(e,t,r),{signal:n})),e.querySelectorAll(`.dep-test`).forEach(t=>t.addEventListener(`click`,()=>Zn(e,t),{signal:n}))}async function Xn(t,n,r){let i=r.closest(`.dep-card`),a=i.querySelector(`.dep-nombre`).value.trim(),o=i.querySelector(`.dep-email`).value.trim(),s=i.querySelector(`.dep-resp-nombre`).value.trim(),c=i.querySelector(`.dep-resp-email`).value.trim(),l=i.querySelector(`.dep-activo`).checked;if(!a){e.show(`El nombre es obligatorio`,`error`);return}if(o&&!Wn.test(o)){e.show(`El correo institucional no es vÃ¡lido`,`error`);return}if(c&&!Wn.test(c)){e.show(`El correo del responsable no es vÃ¡lido`,`error`);return}let u=r.innerHTML;r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{let i=await Hn(r.dataset.id,{nombre:a,email:o,activo:l,responsable_nombre:s,responsable_email:c}),u=n.findIndex(e=>e.id===i.id);u>=0&&(n[u]=i),e.show(`${i.codigo} actualizado`,`success`),qn(t,n)}catch(t){e.show(`Error: ${t.message}`,`error`),r.disabled=!1,r.innerHTML=u}}async function Zn(t,n){let r=n.closest(`.dep-card`).querySelector(`.dep-email`).value.trim();if(!r||!Wn.test(r)){e.show(`CargÃ¡ un correo vÃ¡lido antes de probar`,`error`);return}let i=n.innerHTML;n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{await Un(r,n.dataset.codigo),e.show(`Correo de prueba enviado a ${r}`,`success`)}catch(t){e.show(`No se pudo enviar: ${t.message}`,`error`)}finally{n.disabled=!1,n.innerHTML=i}}function Qn(){s.register(`departamentos`,e=>Kn(e))}async function $n(){let{data:e,error:t}=await a.from(`campanias_periodo`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw t;return e??[]}async function er(e){let{data:t,error:n}=await a.from(`campanias_periodo`).insert(e).select().single();if(n)throw n;return t}async function tr(e,t){let{data:n,error:r}=await a.from(`campanias_periodo`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(r)throw r;return n}async function nr(e){return tr(e,{activo:!1})}async function rr(e){let{data:t,error:n}=await a.rpc(`fn_preview_campania`,{p_id:e});if(n)throw n;return t}async function ir(e){let{data:t,error:n}=await a.rpc(`fn_activar_campania`,{p_id:e});if(n)throw n;return t}async function ar(e,t=null){let{data:n,error:r}=await a.rpc(`fn_encolar_campania`,{p_campania_id:e,p_limite:t});if(r)throw r;return n}var V={campanias:[],seleccionada:null,preview:null,cargando:!1},or={inscripcion:`Inscripción`,reinscripcion:`Reinscripción`};async function sr(e){await H(e)}async function H(e){try{cr(e),V.campanias=await $n(),ur(e)}catch(t){lr(e,t.message)}}function cr(e){e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <h1 class="h3 fw-bold mb-4">Períodos / Campañas</h1>
      <div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>
    </div>`}function lr(e,t){e.innerHTML=`
    <div class="container py-5 text-center">
      <div class="alert alert-danger border-0 shadow-sm p-4 rounded-3">
        <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
        <h4 class="fw-bold">Error al cargar campañas</h4>
        <p>${U(t)}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-retry">Reintentar</button>
      </div>
    </div>`,document.getElementById(`btn-retry`)?.addEventListener(`click`,()=>sr(e))}function ur(e){let t=V.campanias.find(e=>e.id===V.seleccionada)||null;e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 class="h3 fw-bold mb-1">Períodos / Campañas</h1>
          <p class="text-body-secondary mb-0 small">Inscripción y reinscripción · activación con previsualización</p>
        </div>
      </div>

      <div class="alert alert-warning border-0 shadow-sm small d-flex align-items-start gap-2" role="alert">
        <i class="bi bi-shield-exclamation fs-5"></i>
        <div>El envío real está <strong>bloqueado</strong> hasta el módulo anti-ban. Activar una campaña
        <strong>materializa la audiencia</strong> (deduplicada y trazable), pero <strong>no manda WhatsApps</strong>.</div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-7">
          ${dr()}
        </div>
        <div class="col-12 col-lg-5">
          ${fr()}
          ${t?pr(t):``}
        </div>
      </div>
    </div>`,mr(e)}function dr(){return V.campanias.length===0?`<div class="card border-0 shadow-sm rounded-3"><div class="card-body text-body-secondary text-center py-5">
      <i class="bi bi-megaphone fs-1 d-block mb-2 opacity-50"></i>No hay campañas. Creá una a la derecha.</div></div>`:`<div class="card border-0 shadow-sm rounded-3 overflow-hidden">
    <div class="list-group list-group-flush">${V.campanias.map(e=>{let t=e.activo,n=e.id===V.seleccionada;return`
      <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2 ${n?`active`:``}" data-sel="${e.id}">
        <span class="text-truncate">
          <span class="fw-semibold">${U(e.nombre)}</span>
          <span class="badge text-bg-secondary ms-1">${or[e.accion]||e.accion} ${U(e.tipo)}</span>
          <br><small class="${n?``:`text-body-secondary`}">${U(e.fecha_inicio)} → ${U(e.fecha_fin)}</small>
        </span>
        <span class="badge rounded-pill ${t?`text-bg-success`:`text-bg-light`}">${t?`Activa`:`Inactiva`}</span>
      </button>`}).join(``)}</div></div>`}function fr(){return`
    <div class="card border-0 shadow-sm rounded-3 mb-3">
      <div class="card-body">
        <h2 class="h6 fw-bold mb-3"><i class="bi bi-plus-circle me-1"></i>Nueva campaña</h2>
        <form id="form-campania" class="row g-2">
          <div class="col-12">
            <input class="form-control form-control-sm" name="nombre" placeholder="Nombre (ej: Inscripción A 2026)" required>
          </div>
          <div class="col-6">
            <select class="form-select form-select-sm" name="accion" required>
              <option value="inscripcion">Inscripción</option>
              <option value="reinscripcion">Reinscripción</option>
            </select>
          </div>
          <div class="col-6">
            <select class="form-select form-select-sm" name="tipo" required>
              <option value="A">Semestre A</option>
              <option value="B">Semestre B</option>
            </select>
          </div>
          <div class="col-6">
            <input type="date" class="form-control form-control-sm" name="fecha_inicio" required>
          </div>
          <div class="col-6">
            <input type="date" class="form-control form-control-sm" name="fecha_fin" required>
          </div>
          <div class="col-12">
            <button class="btn btn-sm btn-primary rounded-pill px-3 w-100" type="submit">Crear campaña</button>
          </div>
        </form>
      </div>
    </div>`}function pr(e){let t=V.preview,n;if(V.cargando)n=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>`;else if(!t)n=`<p class="text-body-secondary small mb-0">Previsualizá la audiencia antes de activar.</p>`;else if(t.accion===`inscripcion`){let e=t.primer_contacto+t.recuperacion>t.cupo_disponible;n=`
      <ul class="list-unstyled small mb-2">
        <li>• Primer contacto: <strong>${t.primer_contacto}</strong></li>
        <li>• Recuperación: <strong>${t.recuperacion}</strong></li>
        <li class="text-body-secondary">• Sin teléfono: ${t.sin_telefono}</li>
        <li>• Cupo disponible: <strong>${t.cupo_disponible}</strong> / ${t.cupo_total}</li>
      </ul>
      ${e?`<div class="alert alert-warning py-2 px-2 small mb-2">⚠️ La audiencia supera el cupo disponible. Abrí otro grupo de Iniciación Musical o enviá en tandas.</div>`:``}`}else n=`
      <ul class="list-unstyled small mb-2">
        <li>• Reinscripción: <strong>${t.reinscripcion}</strong></li>
        <li class="text-body-secondary">• Sin teléfono: ${t.sin_telefono}</li>
      </ul>`;return`
    <div class="card border-0 shadow-sm rounded-3">
      <div class="card-body">
        <h2 class="h6 fw-bold mb-2"><i class="bi bi-play-circle me-1"></i>${U(e.nombre)}</h2>
        ${n}
        <div class="d-flex gap-2 flex-wrap mt-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" id="btn-preview">
            <i class="bi bi-search me-1"></i>Previsualizar
          </button>
          <button class="btn btn-sm btn-primary rounded-pill px-3" id="btn-activar" ${V.preview?``:`disabled`}>
            <i class="bi bi-megaphone me-1"></i>Activar y materializar
          </button>
          ${e.activo?`<button class="btn btn-sm btn-success rounded-pill px-3" id="btn-encolar" title="Mueve una tanda a la cola respetando opt-out y tope diario">
            <i class="bi bi-send me-1"></i>Encolar tanda (anti-ban)
          </button>`:``}
          ${e.activo?`<button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-desactivar">Desactivar</button>`:``}
        </div>
      </div>
    </div>`}function mr(e){e.querySelectorAll(`[data-sel]`).forEach(t=>t.addEventListener(`click`,()=>{V.seleccionada=t.dataset.sel,V.preview=null,ur(e)})),e.querySelector(`#form-campania`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=new FormData(t.target);try{V.seleccionada=(await er({nombre:n.get(`nombre`),accion:n.get(`accion`),tipo:n.get(`tipo`),fecha_inicio:n.get(`fecha_inicio`),fecha_fin:n.get(`fecha_fin`)})).id,V.preview=null,await H(e)}catch(e){alert(`Error al crear campaña: ${e.message}`)}}),e.querySelector(`#btn-preview`)?.addEventListener(`click`,async()=>{V.cargando=!0,ur(e);try{V.preview=await rr(V.seleccionada)}catch(e){alert(`Error en preview: ${e.message}`)}finally{V.cargando=!1,ur(e)}}),e.querySelector(`#btn-activar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto materializa la audiencia deduplicada (no envía WhatsApps). ¿Continuar?`))try{let t=await ir(V.seleccionada);alert(`Campaña activada. Audiencia materializada: ${t.materializados} contacto(s).`),V.preview=null,await H(e)}catch(e){alert(`Error al activar: ${e.message}`)}}),e.querySelector(`#btn-encolar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto mueve una tanda a la cola de envío (respeta opt-out y tope diario). Los mensajes se despachan con ritmo anti-ban solo si el gateway está activo. ¿Continuar?`))try{let t=await ar(V.seleccionada);alert(`Encolados: ${t.encolados}. Tope hoy: ${t.cap_hoy} · Enviados hoy: ${t.enviados_hoy} · Restante: ${t.restante_tras_encolar}.`),await H(e)}catch(e){alert(`Error al encolar: ${e.message}`)}}),e.querySelector(`#btn-desactivar`)?.addEventListener(`click`,async()=>{try{await nr(V.seleccionada),await H(e)}catch(e){alert(`Error al desactivar: ${e.message}`)}})}function U(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function hr(){s.register(`campanias`,sr)}async function gr(){let{data:e,error:t}=await a.from(`hermes_whatsapp_config`).select(`*`).eq(`activo`,!0).single();if(t&&t.code!==`PGRST116`)throw t;return e||null}async function _r(e){let t=await gr();if(!t)throw Error(`No existe configuracion activa`);let{data:n,error:r}=await a.from(`hermes_whatsapp_config`).update(e).eq(`id`,t.id).select().single();if(r)throw r;return n}var W={config:null,edit:{},cargando:!0};async function vr(e){try{W.cargando=!0,W.config=await gr(),G(e)}catch(t){br(e,t.message)}finally{W.cargando=!1}}async function yr(e){if(Object.keys(W.edit).length)try{W.cargando=!0,W.config=await _r(W.edit),W.edit={},G(e)}catch(t){br(e,t.message)}finally{W.cargando=!1}}function G(e){let{config:t,edit:n,cargando:r}=W;if(e.innerHTML=`
    <div style="max-width: 700px; font-family: monospace;">
      <h1>Gateway WhatsApp (Baileys) — Subsistema 4</h1>
      ${t?`
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold; width: 180px;">Número dedicado</td>
              <td style="padding: 12px;">
                <strong>${n.numero_wid??t.numero_wid??`(sin asignar)`}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="text" id="inp_numero_wid"
                  value="${n.numero_wid??t.numero_wid??``}"
                  placeholder="Ej: +1 (829) 555-0123"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Nombre amigable</td>
              <td style="padding: 12px;">
                <strong>${n.numero_nombre??t.numero_nombre??`(sin nombre)`}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="text" id="inp_numero_nombre"
                  value="${n.numero_nombre??t.numero_nombre??``}"
                  placeholder="Ej: Inscripción 2026"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Cap diario (msgs)</td>
              <td style="padding: 12px;">
                <strong>${n.cap_diario??t.cap_diario}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="number" id="inp_cap_diario"
                  value="${n.cap_diario??t.cap_diario}"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Warmup desde</td>
              <td style="padding: 12px;">
                <strong>${n.warmup_desde??t.warmup_desde??`(no iniciado)`}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="date" id="inp_warmup_desde"
                  value="${n.warmup_desde??t.warmup_desde??``}"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Warmup dias</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${t.warmup_dias}</strong> (fijo)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Jitter (seg)</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${t.jitter_min_seg}–${t.jitter_max_seg}s</strong> (fijo)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Rate limit</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${t.rate_limit_hora} msgs/hora</strong> (fijo)
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Activo</td>
              <td colspan="2" style="padding: 12px;">
                <strong style="color: ${t.activo?`green`:`red`};">
                  ${t.activo?`✓ SÍ`:`✗ NO`}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 24px;">
          <button id="btn_guardar"
            style="
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              ${r||!Object.keys(n).length?`opacity: 0.5; cursor: not-allowed;`:``}
            "
            ${r||!Object.keys(n).length?`disabled`:``}
          >
            ${r?`Guardando...`:`Guardar cambios`}
          </button>
        </div>
      `:`<p style="color: #666;">No hay configuración activa. Contacta al administrador.</p>`}
    </div>
  `,t&&!r){let t=e.querySelector(`#inp_numero_wid`),n=e.querySelector(`#inp_numero_nombre`),r=e.querySelector(`#inp_cap_diario`),i=e.querySelector(`#inp_warmup_desde`),a=e.querySelector(`#btn_guardar`);t&&t.addEventListener(`change`,t=>{W.edit.numero_wid=t.target.value||null,G(e)}),n&&n.addEventListener(`change`,t=>{W.edit.numero_nombre=t.target.value||null,G(e)}),r&&r.addEventListener(`change`,t=>{W.edit.cap_diario=parseInt(t.target.value)||null,G(e)}),i&&i.addEventListener(`change`,t=>{W.edit.warmup_desde=t.target.value||null,G(e)}),a&&a.addEventListener(`click`,()=>yr(e))}}function br(e,t){e.innerHTML=`<div style="color: red; padding: 20px;">Error: ${t}</div>`}function xr(){s.register(`gateway-config`,vr)}var Sr=[`creado`,`corriendo`,`pausado`,`finalizado`,`error`];async function Cr(e){let{data:t,error:n}=await a.from(`sim_runs`).select(`*`).eq(`id`,e).single();if(n)throw n;return t}async function wr(e,t){if(!Sr.includes(t))throw Error(`estado inválido: "${t}". Debe ser uno de: ${Sr.join(`, `)}`);let{data:n,error:r}=await a.from(`sim_runs`).update({estado:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(r)throw r;return n}async function Tr(e,t){if(!(t>0))throw Error(`nuevaVelocidad debe ser mayor que 0`);let{data:n,error:r}=await a.from(`sim_runs`).update({velocidad:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(r)throw r;return n}async function Er(e,t){let{data:n,error:r}=await a.from(`sim_runs`).update({fecha_actual_virtual:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(r)throw r;return n}async function Dr(e){let{data:t,error:n}=await a.from(`sim_calendario`).select(`*`).eq(`run_id`,e).order(`fecha_inicio`,{ascending:!0});if(n)throw n;return t||[]}async function Or(e,t){let n=new Date(t),r=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),0,0,0)),i=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),23,59,59,999)),{data:o,error:s}=await a.from(`sim_calendario`).select(`*`).eq(`run_id`,e).gte(`fecha_inicio`,r.toISOString()).lte(`fecha_inicio`,i.toISOString()).order(`fecha_inicio`,{ascending:!0});if(s)throw s;return o||[]}async function kr(e,{departamento:t=null}={}){let n=a.from(`sim_log`).select(`*`).eq(`run_id`,e);t&&(n=n.eq(`departamento`,t));let{data:r,error:i}=await n.order(`created_at`,{ascending:!1});if(i)throw i;return r||[]}async function Ar(e){let{data:t,error:n}=await a.from(`sim_outbox`).select(`*`).eq(`run_id`,e).order(`created_at`,{ascending:!1});if(n)throw n;return t||[]}async function jr({run_id:e,fecha_simulada:t,eventos:n}={}){if(!e)throw Error(`run_id es requerido para invocar simulador-tick`);if(!t)throw Error(`fecha_simulada es requerida para invocar simulador-tick`);let{data:r,error:i}=await a.functions.invoke(`simulador-tick`,{body:{run_id:e,fecha_simulada:t,eventos:n||[]}});if(i)throw Error(i.message||`Error al invocar simulador-tick`);if(r?.error)throw Error(r.error);return r}function Mr({velocidad:e,onTick:t}){if(typeof e!=`number`||!(e>0))throw Error(`velocidad debe ser un número mayor que 0 (segundos reales por día simulado)`);if(typeof t!=`function`)throw Error(`onTick debe ser una función`);let n=e,r=`pausado`,i=null;function a(){i!=null&&(clearInterval(i),i=null)}function o(){a(),r===`corriendo`&&(i=setInterval(()=>{t()},n*1e3))}function s(){r!==`corriendo`&&(r=`corriendo`,o())}function c(){r=`pausado`,a()}function l(){r!==`corriendo`&&(r=`corriendo`,o())}function u(){r=`pausado`,a()}function d(e){if(typeof e!=`number`||!(e>0))throw Error(`nuevaVelocidad debe ser un número mayor que 0`);n=e,r===`corriendo`&&o()}function f(){return r}function p(){return n}return{start:s,pause:c,resume:l,stop:u,cambiarVelocidad:d,getEstado:f,getVelocidad:p}}var Nr=Object.freeze({creado:Object.freeze({label:`Creado`,color:`secondary`}),corriendo:Object.freeze({label:`Corriendo`,color:`success`}),pausado:Object.freeze({label:`Pausado`,color:`warning`}),finalizado:Object.freeze({label:`Finalizado`,color:`primary`}),error:Object.freeze({label:`Error`,color:`danger`})}),Pr=Object.freeze({pendiente:Object.freeze({label:`Pendiente`,color:`secondary`}),enviado:Object.freeze({label:`Enviado`,color:`success`}),fallido:Object.freeze({label:`Fallido`,color:`danger`})});function Fr(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?`—`:t.toLocaleDateString(`es-ES`,{year:`numeric`,month:`long`,day:`numeric`})}function Ir(e){if(!e?.fecha_inicio_virtual||!e?.fecha_fin_virtual||!e?.fecha_actual_virtual)return 0;let t=new Date(e.fecha_inicio_virtual).getTime(),n=new Date(e.fecha_fin_virtual).getTime(),r=new Date(e.fecha_actual_virtual).getTime();if(Number.isNaN(t)||Number.isNaN(n)||Number.isNaN(r)||n<=t)return 0;let i=(r-t)/(n-t)*100;return Math.max(0,Math.min(100,Math.round(i)))}function Lr(e){return Nr[e]||{label:e,color:`secondary`}}function Rr(e){return Pr[e]||{label:e,color:`secondary`}}function zr(e){let t={};for(let n of e||[])n?.fecha_inicio&&(t[n.fecha_inicio]||(t[n.fecha_inicio]=[]),t[n.fecha_inicio].push(n));return t}var Br=`00000000-0000-0000-0000-000000000001`,Vr=[1,2,5,10,30,60],Hr=1440*60*1e3,K={run:null,cargando:!1,procesandoTick:!1},q=null,J=null;function Ur(){J?.stop(),J=null}async function Wr(t){if(!(!K.run||K.procesandoTick)){K.procesandoTick=!0;try{let n=new Date(K.run.fecha_actual_virtual),r=K.run.fecha_fin_virtual?new Date(K.run.fecha_fin_virtual):null,i=new Date(n.getTime()+Hr);if(r&&i.getTime()>=r.getTime()){Ur(),K.run=await wr(K.run.id,`finalizado`),e.show(`Simulación finalizada: se alcanzó la fecha de fin`,`success`),Y(t);return}let a=i.toISOString(),o=await Or(K.run.id,a);o.length>0&&await jr({run_id:K.run.id,fecha_simulada:a,eventos:o}),K.run=await Er(K.run.id,a),Y(t)}catch(t){console.error(`[panelControlView] Error al avanzar el reloj:`,t.message),e.show(`Error al procesar el tick: ${t.message}`,`error`)}finally{K.procesandoTick=!1}}}function Gr(e){return J||(J=Mr({velocidad:K.run?.velocidad||10,onTick:()=>Wr(e)}),J)}function Y(e){q?.signal.aborted||(Yr(e),Xr(e))}async function Kr(e,t={}){q?.abort(),q=new AbortController;try{K.cargando=!0,qr(e),K.run=await Cr(t.runId||Br).catch(()=>null),K.cargando=!1,Yr(e),Xr(e)}catch(t){console.error(`[panelControlView] Error:`,t.message),Jr(e,t.message)}return{teardown:()=>{q?.abort(),Ur()}}}function qr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function Jr(e,n){e.innerHTML=`
    <div class="alert alert-danger m-4">
      <i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}
    </div>
  `}function Yr(e){let n=K.run,r=n?Lr(n.estado):null,i=n?Ir(n):0,a=n?.velocidad||10;e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-sliders fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Panel de Control</h1>
          <p class="text-muted small mb-0">Simulación operativa institucional (sandbox)</p>
        </div>
      </div>

      ${n?`
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">${t(n.nombre)}</h5>
                <span class="badge bg-${r.color}">${r.label}</span>
              </div>
              <div class="text-end">
                <small class="text-muted d-block">Fecha simulada</small>
                <strong id="fechaSimuladaActual">${Fr(n.fecha_actual_virtual)}</strong>
              </div>
            </div>

            <div class="progress mb-3" style="height: 10px;">
              <div class="progress-bar" style="width: ${i}%;"></div>
            </div>
            <small class="text-muted">${i}% completado</small>

            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-success btn-sm" id="btnIniciar" ${n.estado===`corriendo`?`disabled`:``}>
                <i class="bi bi-play-fill me-1"></i>Iniciar
              </button>
              <button class="btn btn-warning btn-sm" id="btnPausar" ${n.estado===`corriendo`?``:`disabled`}>
                <i class="bi bi-pause-fill me-1"></i>Pausar
              </button>
              <button class="btn btn-outline-secondary btn-sm" id="btnReanudar" ${n.estado===`pausado`?``:`disabled`}>
                <i class="bi bi-arrow-clockwise me-1"></i>Reanudar
              </button>

              <select class="form-select form-select-sm" id="selectVelocidad" style="max-width: 160px;">
                ${Vr.map(e=>`<option value="${e}" ${a===e?`selected`:``}>${e}s / día simulado</option>`).join(``)}
              </select>
            </div>
          </div>
        </div>`:`<div class="alert alert-info">
               <p class="mb-2">No hay corrida activa.</p>
               <button class="btn btn-primary btn-sm" id="btnCrearRun">
                 <i class="bi bi-plus-circle me-1"></i>Crear corrida desde seed
               </button>
             </div>`}
    </div>
  `}function Xr(t){let n=q.signal;t.querySelector(`#btnCrearRun`)?.addEventListener(`click`,async()=>{try{K.run=await Cr(Br),e.show(`Corrida demo cargada`,`success`),Y(t)}catch(t){e.show(`Error al crear la corrida: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#btnIniciar`)?.addEventListener(`click`,async()=>{try{K.run=await wr(K.run.id,`corriendo`),Gr(t).start(),Y(t)}catch(t){e.show(`Error al iniciar: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#btnPausar`)?.addEventListener(`click`,async()=>{try{J?.pause(),K.run=await wr(K.run.id,`pausado`),Y(t)}catch(t){e.show(`Error al pausar: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#btnReanudar`)?.addEventListener(`click`,async()=>{try{K.run=await wr(K.run.id,`corriendo`),Gr(t).resume(),Y(t)}catch(t){e.show(`Error al reanudar: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#selectVelocidad`)?.addEventListener(`change`,async t=>{let n=parseInt(t.target.value,10);try{K.run=await Tr(K.run.id,n),J?.cambiarVelocidad(n),e.show(`Velocidad actualizada: ${n}s / día simulado`,`success`)}catch(t){e.show(`Error al cambiar velocidad: ${t.message}`,`error`)}},{signal:n})}var Zr=`00000000-0000-0000-0000-000000000001`,X={eventos:[],cargando:!1,runId:Zr},Qr=null;async function $r(e,t={}){Qr?.abort(),Qr=new AbortController,X.runId=t.runId||Zr;try{X.cargando=!0,ei(e),X.eventos=await Dr(X.runId),X.cargando=!1,ri(e)}catch(t){console.error(`[calendarioRunView] Error:`,t.message),ti(e,t.message)}return{teardown:()=>{Qr?.abort()}}}function ei(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function ti(e,n){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}</div>`}var ni={programado:`secondary`,en_curso:`info`,completado:`success`,cancelado:`danger`};function ri(e){let t=zr(X.eventos),n=Object.keys(t).sort();e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-calendar-event fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Calendario de la Corrida</h1>
          <p class="text-muted small mb-0">${X.eventos.length} evento(s) sembrado(s)</p>
        </div>
      </div>

      ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay eventos en esta corrida</div>`:n.map(e=>`
        <div class="mb-3">
          <h6 class="text-muted mb-2">${Fr(e)}${t[e].length>1?` <span class="badge bg-info">${t[e].length} eventos concurrentes</span>`:``}</h6>
          ${t[e].map(ii).join(``)}
        </div>`).join(``)}
    </div>
  `}function ii(e){let n=ni[e.estado]||`secondary`;return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3 d-flex justify-content-between align-items-center">
        <div>
          <strong>${t(e.titulo)}</strong>
          <p class="text-muted small mb-0">${t(e.descripcion||``)}</p>
          <span class="text-muted small"><i class="bi bi-building"></i> ${t(e.departamento_responsable)} · ${t(e.categoria)}</span>
        </div>
        <span class="badge bg-${n}">${t(e.estado)}</span>
      </div>
    </div>
  `}var ai=`00000000-0000-0000-0000-000000000001`,oi=[`DIR`,`ACM`,`ADM`,`FIN`,`LOG`,`COM`,`TECNICO`],Z={entradas:[],cargando:!1,filtroDepartamento:`todos`,runId:ai},Q=null,si=null;async function ci(e){let t=Z.filtroDepartamento===`todos`?{}:{departamento:Z.filtroDepartamento};Z.entradas=await kr(Z.runId,t),pi(e),hi(e)}function li(e){a?.channel&&(si?.unsubscribe?.(),si=a.channel(`simulador:sim_log:${Z.runId}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`sim_log`},async t=>{if(!Q?.signal.aborted&&t?.new?.run_id===Z.runId)try{await ci(e)}catch(e){console.error(`[logView] Realtime refresh error:`,e.message)}}).subscribe())}async function ui(e,t={}){Q?.abort(),Q=new AbortController,Z.runId=t.runId||ai;try{Z.cargando=!0,di(e),await ci(e),li(e)}catch(t){console.error(`[logView] Error:`,t.message),fi(e,t.message)}return{teardown:()=>{Q?.abort(),si?.unsubscribe?.(),si=null}}}function di(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function fi(e,n){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}</div>`}function pi(e){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-journal-text fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Log en Vivo</h1>
          <p class="text-muted small mb-0">Auditoría de acciones de agentes (sim_log)</p>
        </div>
      </div>

      <div class="mb-3">
        <select class="form-select form-select-sm" id="filtroDepartamentoLog" style="max-width: 200px;">
          <option value="todos" ${Z.filtroDepartamento===`todos`?`selected`:``}>Todos los departamentos</option>
          ${oi.map(e=>`<option value="${e}" ${Z.filtroDepartamento===e?`selected`:``}>${e}</option>`).join(``)}
        </select>
      </div>

      <div id="logList">
        ${Z.entradas.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Sin entradas de log todavía</div>`:Z.entradas.map(mi).join(``)}
      </div>
    </div>
  `}function mi(e){return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-secondary me-2">${t(e.departamento)}</span>
            <strong>${t(e.agente)}</strong>
            <span class="text-muted"> — ${t(e.accion)}</span>
          </div>
          <small class="text-muted">${new Date(e.created_at).toLocaleString(`es-ES`)}</small>
        </div>
      </div>
    </div>
  `}function hi(e){let t=Q.signal;e.querySelector(`#filtroDepartamentoLog`)?.addEventListener(`change`,async t=>{Z.filtroDepartamento=t.target.value;try{await ci(e)}catch(e){console.error(`[logView] Error al filtrar:`,e.message)}},{signal:t})}var gi=`00000000-0000-0000-0000-000000000001`,$={mensajes:[],cargando:!1,runId:gi},_i=null;async function vi(e,t={}){_i?.abort(),_i=new AbortController,$.runId=t.runId||gi;try{$.cargando=!0,yi(e),$.mensajes=await Ar($.runId),$.cargando=!1,xi(e)}catch(t){console.error(`[outboxView] Error:`,t.message),bi(e,t.message)}return{teardown:()=>{_i?.abort()}}}function yi(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function bi(e,n){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}</div>`}function xi(e){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-send fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Outbox</h1>
          <p class="text-muted small mb-0">Mensajes salientes simulados — SIEMPRE redirigidos a la whitelist de seguridad</p>
        </div>
      </div>

      ${$.mensajes.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Sin mensajes en el outbox todavía</div>`:`<div class="table-responsive">
               <table class="table table-sm align-middle">
                 <thead>
                   <tr>
                     <th>Canal</th>
                     <th>Destinatario original</th>
                     <th>Destinatario redirigido (real)</th>
                     <th>Estado</th>
                     <th>Fecha</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${$.mensajes.map(Si).join(``)}
                 </tbody>
               </table>
             </div>`}
    </div>
  `}function Si(e){let n=Rr(e.estado);return`
    <tr>
      <td><span class="badge bg-info">${t(e.canal)}</span></td>
      <td class="text-muted">${t(e.destinatario_original)}</td>
      <td><strong>${t(e.destinatario_redirigido)}</strong></td>
      <td><span class="badge bg-${n.color}">${n.label}</span></td>
      <td><small class="text-muted">${new Date(e.created_at).toLocaleString(`es-ES`)}</small></td>
    </tr>
  `}function Ci(){try{let e=document.createElement(`canvas`);return!!(e.getContext(`webgl2`)||e.getContext(`webgl`))}catch{return!1}}function wi(e){if(e!==void 0)try{return!!e()}catch{return!1}return Ci()}async function Ti(e){if(wi())try{let t=await i(()=>import(`./three-PxM-BH2Y.js`).then(e=>e.n),__vite__mapDeps([17,1])),{renderSalaTrabajo3dView:n}=await i(async()=>{let{renderSalaTrabajo3dView:e}=await import(`./salaTrabajo3dView-CLew3dyd.js`);return{renderSalaTrabajo3dView:e}},__vite__mapDeps([18,2,17,1,19]));return await n(e,{},t)}catch(e){console.warn(`[salaTrabajo3DEntryView] 3D falló, cayendo a 2D:`,e.message)}let{renderSalaTrabajoView:t}=await i(async()=>{let{renderSalaTrabajoView:e}=await import(`./salaTrabajoView-BCVAiBee.js`);return{renderSalaTrabajoView:e}},__vite__mapDeps([20,1,2,19]));return t(e,{modoFallback:!0})}function Ei(){s.register(`simulador-sala-trabajo`,e=>Ti(e)),s.register(`simulador-panel-control`,e=>Kr(e)),s.register(`simulador-calendario`,e=>$r(e)),s.register(`simulador-log`,e=>ui(e)),s.register(`simulador-outbox`,e=>vi(e))}var Di=[ue,Mn,Qn,fe,f,p,ge,oe,o,le,ee,se,ce,u,_e,te,d,ne,re,c,me,de,ae,hr,xr,pe,Ei];export{Cr as a,kr as i,Fr as n,rt as o,Lr as r,Di as t};