const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/three-CGQ8LZer.js","assets/AppToast-BfaQtGFE.js","assets/salaTrabajo3dView-CdAdziXY.js","assets/supabase-Cgh_dhNB.js","assets/simuladorLogMapper-DOwzR9m9.js","assets/salaTrabajoView-DvyujooA.js","assets/AppModal-C8uxOJPY.js"])))=>i.map(i=>d[i]);
import{r as e,t}from"./AppToast-BfaQtGFE.js";import{a as n,i as r}from"./supabase-Cgh_dhNB.js";import"./vendor-Bs2a3q3z.js";import{A as i,C as a,D as o,E as s,K as c,M as l,N as u,S as d,T as f,X as p,Z as m,a as ee,b as te,i as ne,j as re,k as ie,l as ae,n as oe,o as se,q as ce,r as le,t as ue,u as de,w as fe,x as pe}from"./scoreDirectorView-CNqyd2ks.js";import{t as h}from"./router-Dfb4XAS3.js";import{n as g,t as me}from"./AppModal-C8uxOJPY.js";import{n as he}from"./groqService-Cu889xeB.js";import{T as ge,b as _e,c as ve,l as ye,r as be,s as xe,u as Se,w as Ce,y as we}from"./tareas-DeTW-RPg.js";import{t as Te}from"./tareasView-D80l3P8r.js";var Ee={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`,OPR:`Operaciones`},De={critica:`danger`,alta:`warning`,media:`info`,baja:`secondary`},_={procedimientos:[],processContracts:[],cargando:!1};function v(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function Oe(e){let t=new AbortController;return await y(e),e.addEventListener(`click`,async t=>{if(t.target.closest(`#btn-refrescar-proc`))return y(e);let n=t.target.closest(`[data-open-case-detail]`);if(n){h.navigate(`hermes-caso`,{processCode:n.dataset.processCode||null,correlationId:n.dataset.correlationId||null});return}let r=t.target.closest(`[data-start-process-code]`);if(r){let t=r.dataset.startProcessCode,n=_.processContracts.find(e=>e.process_code===t),i=window.prompt(`Título del caso para ${t}:`,n?.process_name||t);if(!i?.trim())return;let a=window.prompt(`Descripción breve del caso:`)||``;try{await _e({process_code:t,title:i.trim(),description:a.trim()||null,source:`manual`,priority:`media`,metadata:{opened_from:`procedimientos_view`}}),alert(`Caso SOI abierto: Hermes generó las tareas departamentales del contrato.`),y(e)}catch(e){alert(`Error: ${e.message}`)}return}if(t.target.closest(`#btn-caso-alumno`)){let t=window.prompt(`Nombre del alumno en riesgo:`);if(!t?.trim())return;let n=window.prompt(`Motivo (ausencias, bajo progreso, morosidad…):`)||``;if(ge(`${t}\n${n}`)){alert(Ce());return}try{await we(null,t.trim(),n.trim()),alert(`Caso abierto: se delegaron tareas a Académico, Comunicación, Finanzas y Dirección.`),y(e)}catch(e){alert(`Error: ${e.message}`)}}},{signal:t.signal}),{teardown:()=>t.abort()}}async function y(e){try{_.cargando=!0,Ae(e);let[t,n]=await Promise.all([ve(),Se()]);_.procedimientos=t,_.processContracts=n}catch(t){e.innerHTML=`<div class="alert alert-danger m-3">Error cargando procedimientos: ${v(t.message)}</div>`;return}finally{_.cargando=!1}Ae(e)}function ke(e){return{totalProc:e.length,enCurso:e.filter(e=>e.pct_avance<100&&e.total>e.canceladas).length,bloqueados:e.filter(e=>e.bloqueadas>0).length,observados:e.filter(e=>e.observadas>0).length,criticos:e.filter(e=>e.prioridad_max===`critica`).length}}function Ae(e){if(_.cargando&&_.procedimientos.length===0){e.innerHTML=`<div class="text-center text-muted py-5"><div class="spinner-border" role="status"></div><p class="mt-2">Cargando procedimientos…</p></div>`;return}let t=_.procedimientos,n=ke(t),r=(e,t,n,r)=>`
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
    </div>`,i=t.length===0?`<div class="text-center text-muted py-5"><i class="bi bi-inbox fs-1"></i><p class="mt-2">No hay procedimientos activos.</p></div>`:t.map(je).join(``),a=_.processContracts.length===0?`<div class="text-muted small">No hay contratos SOI activos registrados.</div>`:_.processContracts.map(Me).join(``);e.innerHTML=`
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
          <button id="btn-refrescar-proc" class="btn btn-outline-primary btn-sm" ${_.cargando?`disabled`:``}>
            <i class="bi bi-arrow-clockwise"></i> ${_.cargando?`Actualizando…`:`Refrescar`}
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
    </div>`}function je(e){let t=De[e.prioridad_max]||`secondary`,n=e.bloqueadas>0?`bg-danger`:e.pct_avance===100?`bg-success`:`bg-primary`,r=(e.departamentos||[]).map(e=>`<span class="badge bg-light text-dark border me-1">${v(Ee[e]||e)}</span>`).join(``),i=[];return e.bloqueadas>0&&i.push(`<span class="badge bg-danger me-1"><i class="bi bi-slash-circle"></i> ${e.bloqueadas} bloqueada${e.bloqueadas>1?`s`:``}</span>`),e.observadas>0&&i.push(`<span class="badge bg-warning text-dark me-1"><i class="bi bi-eye"></i> ${e.observadas} observada${e.observadas>1?`s`:``}</span>`),`
    <div class="col">
      <div class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 class="card-title mb-0">${v(e.titulo_muestra)}</h6>
            <span class="badge bg-${t} text-capitalize">${v(e.prioridad_max)}</span>
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
            <button class="btn btn-sm btn-outline-secondary" data-open-case-detail data-process-code="${v(e.process_code||``)}" data-correlation-id="${v(e.correlation_id||``)}">
              <i class="bi bi-binoculars"></i> Ver caso
            </button>
          </div>
        </div>
      </div>
    </div>`}function Me(e){let t=(e.responsible_departments||[]).map(e=>`<span class="badge bg-light text-dark border me-1">${v(Ee[e]||e)}</span>`).join(``),n={manual:`Manual`,semi_auto:`Semi-auto`,automated:`Automatizado`,deprecated:`Deprecado`}[e.automation_status]||e.automation_status;return`
    <div class="col">
      <div class="border rounded-3 p-3 h-100 bg-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="fw-semibold">${v(e.process_code)}</div>
            <div class="small">${v(e.process_name)}</div>
          </div>
          <span class="badge bg-primary-subtle text-primary border">${v(n)}</span>
        </div>
        <div class="mt-2 small text-muted">
          Dueño: ${v(Ee[e.department_owner]||e.department_owner)}
        </div>
        <div class="mt-2">${t}</div>
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="small text-muted">${e.recurrence_count||0} recurrencia${e.recurrence_count===1?``:`s`}</span>
          <button class="btn btn-sm btn-outline-primary" data-start-process-code="${v(e.process_code)}">
            <i class="bi bi-play-circle"></i> Abrir caso
          </button>
        </div>
      </div>
    </div>`}var Ne={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`,OPR:`Operaciones`};function b(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function Pe(e){return{pendiente:`secondary`,en_progreso:`info`,completada:`success`,bloqueada:`danger`,cancelada:`dark`,observada:`warning`}[e]||`secondary`}var x={detail:null,cargando:!1};async function Fe(e,t={}){let n=new AbortController;try{x.cargando=!0,Ie(e),x.detail=await ye({correlationId:t.correlationId||null,processCode:t.processCode||null}),x.cargando=!1,Le(e,t)}catch(t){return x.cargando=!1,e.innerHTML=`<div class="alert alert-danger m-3">No pude cargar el caso: ${b(t.message)}</div>`,{teardown:()=>n.abort()}}return e.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-open-case-tasks]`);if(t){h.navigate(`hermes-tareas`,{processCode:t.dataset.processCode,correlationId:t.dataset.correlationId});return}if(e.target.closest(`#btn-back-procedimientos`)){h.navigate(`hermes-procedimientos`);return}let n=e.target.closest(`#btn-cerrar-caso`);if(!n)return;let r=n.dataset.caseId;if(!r)return;let i=window.prompt(`Resumen de cierre (opcional):`);if(i!==null)try{n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Cerrando...`,await be({caseId:r,closureSummary:i?.trim()||null,actor:m().getUsuario?.()||{}}),h.navigate(`hermes-procedimientos`)}catch(e){alert(`Error al cerrar el caso: ${e.message}`),n.disabled=!1,n.innerHTML=`<i class="bi bi-check2-all"></i> Cerrar caso`}},{signal:n.signal}),{teardown:()=>n.abort()}}function Ie(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 320px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted mb-0">Cargando detalle del caso…</p>
      </div>
    </div>`}function Le(e,t){let n=x.detail||{},r=n.contract||null,i=n.tasks||[],a=n.metrics||{total:0,completadas:0,bloqueadas:0,observadas:0,evidencias:0},o=r?.process_code||t.processCode||i[0]?.process_code||`—`,s=r?.process_name||i[0]?.titulo||`Caso Hermes`,c=r?.department_owner||i[0]?.departamento||`—`,l=(r?.responsible_departments||[...new Set(i.map(e=>e.departamento))]).map(e=>`<span class="badge bg-light text-dark border me-1">${b(Ne[e]||e)}</span>`).join(``),u=(r?.required_evidence||[]).map(e=>`<li class="mb-1">${b(e.label||e.type||e)}</li>`).join(``),d=(r?.closure_criteria||[]).map(e=>`<li class="mb-1">${b(e)}</li>`).join(``),f=i.length===0?`<div class="text-muted small">No se encontraron tareas para este caso.</div>`:i.map(Re).join(``),p=a.total>0&&a.total===a.completadas&&a.bloqueadas===0;e.innerHTML=`
    <div class="p-3 p-md-4">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <div class="text-muted small">Caso / procedimiento</div>
          <h3 class="mb-1">${b(s)}</h3>
          <div class="small text-muted">Process code: <strong>${b(o)}</strong> · Correlation: <code>${b(n.correlation_id||t.correlationId||`—`)}</code></div>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-back-procedimientos" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i> Procedimientos
          </button>
          <button class="btn btn-primary btn-sm" data-open-case-tasks data-process-code="${b(o)}" data-correlation-id="${b(n.correlation_id||t.correlationId||``)}">
            <i class="bi bi-list-check"></i> Ver tareas del caso
          </button>
          ${p&&n.correlation_id?`
          <button id="btn-cerrar-caso" class="btn btn-success btn-sm" data-case-id="${b(n.correlation_id)}">
            <i class="bi bi-check2-all"></i> Cerrar caso
          </button>`:``}
        </div>
      </div>

      <div class="row row-cols-2 row-cols-lg-4 g-2 mb-4">
        ${ze(`Tareas`,a.total,`primary`,`bi-list-task`)}
        ${ze(`Completadas`,a.completadas,`success`,`bi-check-circle`)}
        ${ze(`Bloqueadas`,a.bloqueadas,`danger`,`bi-slash-circle`)}
        ${ze(`Evidencias`,a.evidencias,`info`,`bi-paperclip`)}
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          <section class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="mb-3"><i class="bi bi-bezier2 me-2"></i>Contrato SOI</h5>
              <div class="row g-3 small">
                <div class="col-md-6"><div class="text-muted">Dueño</div><div class="fw-semibold">${b(Ne[c]||c)}</div></div>
                <div class="col-md-6"><div class="text-muted">Documento canónico</div><div class="fw-semibold">${b(r?.canonical_doc_path||`—`)}</div></div>
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
    </div>`}function Re(e){let t=Array.isArray(e.checklist)&&e.checklist.length>0?Math.round(e.checklist.filter(e=>e.completado).length/e.checklist.length*100):0,n=Pe(e.estado);return`
    <div class="border rounded-3 p-3 bg-body">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${b(e.titulo)}</div>
          <div class="small text-muted">${b(Ne[e.departamento]||e.departamento)} · ${b(e.process_code||`sin process_code`)}</div>
        </div>
        <span class="badge bg-${n} text-capitalize">${b(e.estado)}</span>
      </div>
      <div class="small text-muted mt-2">${e.fecha_vencimiento?`Vence: ${b(e.fecha_vencimiento)}`:`Sin vencimiento`}</div>
      <div class="progress mt-2" style="height: 6px;">
        <div class="progress-bar bg-${n}" style="width: ${t}%"></div>
      </div>
    </div>`}function ze(e,t,n,r){return`
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
    </div>`}var Be={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`},Ve=[`¿Cómo va la operación en general?`,`¿Qué departamentos tienen tareas pendientes?`,`¿Qué casos requieren atención inmediata?`,`¿Cómo va la reinscripción?`],S={snapshot:null,procedimientos:[],historial:[]};function C(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function He(e){return String(e??``).normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase()}async function Ue(e){let t=new AbortController;try{[S.snapshot,S.procedimientos]=await Promise.all([xe(),ve()])}catch(n){return e.innerHTML=`<div class="alert alert-danger m-3">No pude consultar el estado: ${C(n.message)}</div>`,{teardown:()=>t.abort()}}Ge(e);let n=()=>{let t=e.querySelector(`#hermes-q`),n=t.value.trim();if(!n)return;S.historial.push({rol:`user`,texto:n}),S.historial.push({rol:`hermes`,html:We(n)}),t.value=``,Ge(e);let r=e.querySelector(`#hermes-log`);r&&(r.scrollTop=r.scrollHeight)};return e.addEventListener(`click`,t=>{t.target.closest(`#hermes-send`)&&n();let r=t.target.closest(`.hermes-sug`);r&&(e.querySelector(`#hermes-q`).value=r.dataset.q,n())},{signal:t.signal}),e.addEventListener(`keydown`,e=>{e.target.id===`hermes-q`&&e.key===`Enter`&&(e.preventDefault(),n())},{signal:t.signal}),{teardown:()=>t.abort()}}function We(e){let t=He(e),n=S.snapshot;if(/(atencion|inmediat|urgent|bloque|critic|riesgo|priorid)/.test(t)){let e=n.atencion_inmediata||[];return e.length===0?`<p>✅ No hay tareas bloqueadas ni críticas abiertas. Nada requiere atención inmediata.</p>`:`<p><strong>${e.length}</strong> tarea(s) requieren atención inmediata:</p><ul class="mb-0">`+e.map(e=>`<li><span class="badge bg-${e.estado===`bloqueada`?`danger`:`warning text-dark`} me-1">${C(e.estado)}</span>
        <strong>${C(Be[e.departamento]||e.departamento)}</strong> — ${C(e.titulo)}</li>`).join(``)+`</ul>`}if(/(pendient|departament|quien|quienes|cargad|saturad)/.test(t)){let e=(n.por_departamento||[]).filter(e=>e.abiertas>0);return e.length===0?`<p>No hay tareas abiertas en ningún departamento.</p>`:`<p>Tareas abiertas por departamento:</p><ul class="mb-0">`+e.map(e=>`<li><strong>${C(Be[e.departamento]||e.departamento)}</strong>: ${e.abiertas} abiertas
        (${e.pendientes} pendientes${e.bloqueadas>0?`, <span class="text-danger">${e.bloqueadas} bloqueadas</span>`:``})</li>`).join(``)+`</ul>`}let r=t.split(/\s+/).filter(e=>e.length>=4&&![`como`,`va`,`van`,`esta`,`estan`,`sobre`,`para`,`proceso`,`procedimiento`,`caso`].includes(e));if(/(como va|como van|proceso|procedimiento|caso|estado de)/.test(t)&&r.length>0){let e=S.procedimientos.filter(e=>{let t=He(e.titulo_muestra);return r.some(e=>t.includes(e))});if(e.length>0)return`<p>Encontré ${e.length} procedimiento(s) relacionados:</p><ul class="mb-0">`+e.slice(0,8).map(e=>`<li><strong>${e.pct_avance}%</strong> — ${C(e.titulo_muestra)}
          <span class="text-muted">(${e.completadas}/${e.total} tareas${e.bloqueadas>0?`, ${e.bloqueadas} bloqueadas`:``})</span></li>`).join(``)+`</ul>`}let i=n.tareas,a=i.pendiente+i.en_progreso+i.bloqueada+i.observada;return`<p>Estado general de la operación:</p>
    <ul class="mb-0">
      <li><strong>${n.total_procedimientos}</strong> procedimientos en el sistema</li>
      <li><strong>${i.total}</strong> tareas — ${a} abiertas, ${i.completada} completadas</li>
      <li>Pendientes: ${i.pendiente} · En progreso: ${i.en_progreso}
        ${i.bloqueada>0?`· <span class="text-danger">Bloqueadas: ${i.bloqueada}</span>`:``}
        ${i.observada>0?`· <span class="text-warning">Observadas: ${i.observada}</span>`:``}</li>
    </ul>`}function Ge(e){let t=S.historial.length===0?`<div class="text-muted text-center py-4">
         <i class="bi bi-robot fs-1"></i>
         <p class="mt-2 mb-0">Preguntale a Hermes sobre el estado de la operación.</p>
       </div>`:S.historial.map(e=>e.rol===`user`?`<div class="d-flex justify-content-end mb-2"><div class="p-2 px-3 rounded bg-primary text-white" style="max-width:80%">${C(e.texto)}</div></div>`:`<div class="d-flex justify-content-start mb-3"><div class="p-2 px-3 rounded bg-light border" style="max-width:90%"><div class="small text-muted mb-1"><i class="bi bi-robot"></i> Hermes</div>${e.html}</div></div>`).join(``);e.innerHTML=`
    <div class="p-3 p-md-4" style="max-width:900px;margin:0 auto">
      <h3 class="mb-1"><i class="bi bi-robot me-2"></i>Consultar a Hermes</h3>
      <p class="text-muted small">Respuestas factuales desde el estado real — sin generación libre.</p>

      <div class="mb-2 d-flex flex-wrap gap-2">
        ${Ve.map(e=>`<button class="btn btn-sm btn-outline-secondary hermes-sug" data-q="${C(e)}">${C(e)}</button>`).join(``)}
      </div>

      <div id="hermes-log" class="border rounded p-3 mb-2 bg-white" style="height:380px;overflow-y:auto">
        ${t}
      </div>

      <div class="input-group">
        <input id="hermes-q" type="text" class="form-control" placeholder="Escribí tu pregunta…" autocomplete="off" />
        <button id="hermes-send" class="btn btn-primary"><i class="bi bi-send"></i></button>
      </div>
    </div>`}window.router=h;var Ke=`hermes-tareas`;function qe(){let e=localStorage.getItem(`app-theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e===`dark`||e===null&&t;document.documentElement.setAttribute(`data-bs-theme`,n?`dark`:`light`)}function Je(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-bs-theme`,e),localStorage.setItem(`app-theme`,e)}var Ye=null;function Xe(e,t){for(let n of e)if(n.items.some(e=>e.id===t))return n.id;return e[0]?.id}function Ze(e,t,n){if(Ye?.abort(),Ye=new AbortController,document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),!t)return;let i=m.getUser(),a=i?i.email||i.full_name||`Usuario`:``,o=localStorage.getItem(n)||e.defaultRoute,s=Xe(e.navGroups,o),c=document.documentElement.getAttribute(`data-bs-theme`)===`dark`,l=document.createElement(`aside`);l.className=`app-sidebar`,l.innerHTML=`
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi ${e.brandIcon}"></i></div>
      <span class="sidebar-brand-text">${e.brandText}</span>
    </div>
    <nav class="sidebar-nav">
      ${e.navGroups.map(e=>`
        <div class="nav-group ${e.id===s?`expanded`:``}" data-group="${e.id}">
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
        <span class="sidebar-user-name" title="${a}">${a.split(`@`)[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${c?`bi-sun-fill`:`bi-moon-fill`}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `;let u=document.createElement(`nav`);u.className=`app-bottom-nav`,u.innerHTML=e.navGroups.map(e=>`
    <button class="bottom-tab ${e.id===s?`active`:``}" data-group="${e.id}">
      <i class="bi ${e.icon}"></i>
      <span>${e.label}</span>
    </button>
  `).join(``);let d=document.createElement(`div`);d.className=`mobile-sub-sheet`,d.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `,document.body.prepend(l),document.body.prepend(u),document.body.prepend(d);let{signal:f}=Ye,p=(t=localStorage.getItem(n)||e.defaultRoute)=>{let r=Xe(e.navGroups,t);u.querySelectorAll(`.bottom-tab`).forEach(e=>{e.classList.toggle(`active`,e.dataset.group===r)});let i=d.dataset.group;d.classList.contains(`open`)&&i&&i!==r&&d.classList.remove(`open`)};l.querySelectorAll(`.nav-group-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.nav-group`),n=t.classList.contains(`expanded`);l.querySelectorAll(`.nav-group`).forEach(e=>e.classList.remove(`expanded`)),n||t.classList.add(`expanded`)},{signal:f})}),l.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>{h.navigate(e.dataset.route)},{signal:f})}),l.querySelector(`#sidebarBtnTheme`).addEventListener(`click`,()=>{Je();let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;l.querySelector(`#sidebarBtnTheme i`).className=e?`bi bi-sun-fill`:`bi bi-moon-fill`},{signal:f}),l.querySelector(`#sidebarBtnLogout`).addEventListener(`click`,async()=>{await r.auth.signOut(),window.location.reload()},{signal:f});function ee(t){let r=e.navGroups.find(e=>e.id===t);if(!r)return;let i=localStorage.getItem(n)||e.defaultRoute,a=document.getElementById(`sheetTitle`),o=document.getElementById(`sheetItems`);!a||!o||(a.textContent=r.label,o.innerHTML=r.items.map(e=>`
      <button class="sheet-item ${e.id===i?`active`:``}" data-route="${e.id}">
        <i class="bi ${e.icon}"></i>
        <span>${e.label}</span>
      </button>
    `).join(``),d.dataset.group=t,d.classList.add(`open`),o.querySelectorAll(`.sheet-item`).forEach(t=>{t.addEventListener(`click`,()=>{h.navigate(t.dataset.route),d.classList.remove(`open`),u.querySelectorAll(`.bottom-tab`).forEach(n=>n.classList.toggle(`active`,n.dataset.group===Xe(e.navGroups,t.dataset.route)))})}))}u.querySelectorAll(`.bottom-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.group;d.classList.contains(`open`)&&d.dataset.group===t?d.classList.remove(`open`):(ee(t),u.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===t)))})}),window.addEventListener(`routeChanged`,e=>{let t=e.detail;p(t),l.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.route===t)})},{signal:f}),p(o)}async function Qe(e){let{data:t}=await r.from(`profiles`).select(`rol`).eq(`id`,e).maybeSingle();return t?.rol||null}function $e(e,t){document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),e.innerHTML=`
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
  `,e.querySelector(`#btnSalir`)?.addEventListener(`click`,async()=>{await r.auth.signOut(),window.location.reload()})}async function et(e){let t=`current-view-${e.hermesDept.toLowerCase()}`,n=document.querySelector(`#app`);if(!n){console.error(`El contenedor #app no existe en el HTML`);return}qe();try{p()}catch(e){console.error(`Error registrando auth:`,e)}e.registrars.forEach(e=>{try{e()}catch(e){console.error(`Error registrando módulo:`,e)}}),h.register(Ke,(t,n={})=>Te(t,{departamento:e.hermesDept,hideCalendarBtn:!0,...n})),h.register(`hermes-caso`,(e,t={})=>Fe(e,t)),h.register(`cierre-academico`,e=>f(e)),h.register(`hermes-procedimientos`,e=>Oe(e)),h.register(`dir-score`,e=>ue(e)),h.register(`hermes-consulta`,e=>Ue(e)),h.initCustomEvents(),await m.refreshAuth(),h.setAuthGuard(()=>m.isAuthenticated(),[`login`,`register`]),h.init=function(){let n=localStorage.getItem(t)||e.defaultRoute;this.navigate(n)};let r=h._navigateTo.bind(h);h._navigateTo=function(e,n={}){r(e,n),localStorage.setItem(t,e)};let i=async()=>{if(!m.isAuthenticated()){Ze(e,!1,t),h.navigate(`login`);return}let r=m.getUser()||m.getState?.().user;if(!r?.id){console.warn(`[portalShell] autenticado pero sin user.id; redirigiendo a login`),Ze(e,!1,t),h.navigate(`login`);return}let i=await Qe(r.id);if(!e.allowedRoles.includes(i)){$e(n,e.brandText);return}Ze(e,!0,t);let a=localStorage.getItem(t);h.navigate(a&&h.routes[a]?a:e.defaultRoute)};try{await i()}catch(t){console.error(`[portalShell] Error en boot:`,t),tt(n,e.brandText,t);return}let a=!1;m.subscribe(async e=>{if(!a){a=!0;try{e.user?await i():(document.querySelector(`.app-sidebar`)?.remove(),n.innerHTML=``,h.navigate(`login`))}catch(e){console.error(`[portalShell] Error en re-gate:`,e)}finally{a=!1}}})}function tt(e,t,n){document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),e.innerHTML=`
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
  `}var nt={violin:`Violín`,volín:`Violín`,violín:`Violín`,viola:`Viola`,cello:`Cello`,violoncello:`Cello`,violonchelo:`Cello`,chelo:`Cello`,contrabajo:`Contrabajo`,flauta:`Flauta`,oboe:`Oboe`,clarinete:`Clarinete`,fagot:`Fagot`,saxofon:`Saxofón`,saxofón:`Saxofón`,corno:`Corno`,trompeta:`Trompeta`,trombón:`Trombón`,trombon:`Trombón`,tuba:`Tuba`,percusión:`Percusión`,percusion:`Percusión`,coro:`Coro`,piano:`Piano`},rt={cuerdas:{label:`Cuerdas`,icon:`bi-music-note-beamed`,instrumentos:[`Violín`,`Viola`,`Cello`,`Contrabajo`]},maderas:{label:`Maderas`,icon:`bi-wind`,instrumentos:[`Flauta`,`Oboe`,`Clarinete`,`Fagot`,`Saxofón`]},metales:{label:`Metales`,icon:`bi-trumpet`,instrumentos:[`Corno`,`Trompeta`,`Trombón`,`Tuba`]},percusion:{label:`Percusión`,icon:`bi-bullseye`,instrumentos:[`Percusión`]},coro:{label:`Coro`,icon:`bi-people`,instrumentos:[`Coro`]},otros:{label:`Otros`,icon:`bi-three-dots`,instrumentos:[`Piano`]}};function w(e){return e?nt[String(e).trim().toLowerCase()]||st(String(e).trim()):null}function it(e){let t=w(e);if(!t)return`otros`;for(let[e,n]of Object.entries(rt))if(n.instrumentos.includes(t))return e;return`otros`}function T(e){if(!e)return null;let t=String(e).replace(/\D/g,``);return t.length===0||(t.length===10&&(t=`1`+t),t.length<11)?null:t}function at(e,t=``){let n=T(e);return n?`https://wa.me/${n}${t?`?text=${encodeURIComponent(t)}`:``}`:null}function ot(e,t={}){if(!e)return``;let n=rt[it(t.instrumento)];return e.replace(/\{nombre_alumno\}/g,t.alumno||``).replace(/\{representante\}/g,t.contactoNombre||``).replace(/\{instrumento\}/g,w(t.instrumento)||``).replace(/\{seccion\}/g,n?.label||``)}function st(e){return e&&e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()}[[`Ana Lucía Pérez`,`Violín`,`María Pérez`,`8095551001`,`maria.perez@example.com`],[`Carlos Ramírez`,`Violin`,`José Ramírez`,`8295551002`,`jose.ramirez@example.com`],[`Daniela Gómez`,`Viola`,`Rosa Gómez`,`8495551003`,`rosa.gomez@example.com`],[`Esteban Núñez`,`Cello`,`Pedro Núñez`,`8095551004`,`pedro.nunez@example.com`],[`Fabiola Díaz`,`Contrabajo`,`Luisa Díaz`,`8095551005`,null],[`Gabriel Soto`,`Flauta`,`Carmen Soto`,`8295551006`,`carmen.soto@example.com`],[`Helena Cruz`,`Clarinete`,`Marta Cruz`,`8495551007`,`marta.cruz@example.com`],[`Iván Mejía`,`Trompeta`,`Raúl Mejía`,`8095551008`,`raul.mejia@example.com`],[`Julia Vargas`,`Trombón`,`Sofía Vargas`,null,`sofia.vargas@example.com`],[`Kevin Reyes`,`Percusión`,`Ana Reyes`,`8295551010`,`ana.reyes@example.com`]].map((e,t)=>{let[n,r,i,a,o]=e;return{alumnoId:`mock-al-${String(t+1).padStart(3,`0`)}`,alumno:n,instrumento:w(r),familia:it(r),contactoNombre:i,whatsapp:a,email:o}}),new Date().toISOString(),new Date().toISOString();var ct=e({eliminarPlantilla:()=>ft,enviarCorreo:()=>pt,getContactos:()=>lt,getPlantillas:()=>ut,guardarPlantilla:()=>dt});async function lt(){let{data:e,error:t}=await r.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, activo, representante_nombre, representante_tlf, madre_nombre, madre_tlf_whatsapp, padre_nombre, padre_tlf_whatsapp, familiar_nombre, familiar_telefono, correo_representante`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(t)throw t;return(e||[]).map(e=>{let t=e.madre_tlf_whatsapp||e.padre_tlf_whatsapp||e.representante_tlf||e.familiar_telefono||null,n=e.representante_nombre||e.madre_nombre||e.padre_nombre||e.familiar_nombre||`Representante`;return{alumnoId:e.id,alumno:e.nombre_completo,instrumento:w(e.instrumento_principal),familia:it(e.instrumento_principal),contactoNombre:n,whatsapp:t,email:e.correo_representante||null}})}async function ut(){let{data:e,error:t}=await r.from(`document_templates`).select(`id, nombre, tipo, descripcion, contenido, variables, estado, version, updated_at`).order(`nombre`,{ascending:!0});if(t)throw t;return e||[]}async function dt(e){let t={nombre:e.nombre,tipo:e.tipo||`mensaje`,descripcion:e.descripcion||null,contenido:e.contenido||``,variables:e.variables||[],estado:e.estado||`activa`,updated_at:new Date().toISOString()};if(e.id){let{data:n,error:i}=await r.from(`document_templates`).update(t).eq(`id`,e.id).select().single();if(i)throw i;return n}let{data:n,error:i}=await r.from(`document_templates`).insert(t).select().single();if(i)throw i;return n}async function ft(e){let{error:t}=await r.from(`document_templates`).delete().eq(`id`,e);if(t)throw t;return!0}async function pt(e){let{data:t,error:n}=await r.functions.invoke(`send-email`,{body:e});if(n){let e=n.message;try{let t=await n.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(t&&t.ok===!1&&t.enviados===0)throw Error(t.batches?.[0]?.error||`No se pudo enviar el correo`);return t}var E=ct,mt=E.getContactos,ht=E.getPlantillas,gt=E.guardarPlantilla,_t=E.eliminarPlantilla,vt=E.enviarCorreo,yt=`Eres el asistente de redacción del Departamento de Comunicaciones de
"El Sistema Punta Cana", una fundación de educación musical para jóvenes de bajos recursos.
Mejorás mensajes institucionales dirigidos a representantes/familias de alumnos.
Reglas:
- Tono cálido, cercano y respetuoso, pero profesional e institucional.
- Español neutro dominicano. Claro y conciso.
- Conservá las variables entre llaves como {nombre_alumno}, {representante}, {instrumento}, {seccion} EXACTAMENTE como están.
- No inventes datos (fechas, lugares, montos) que no estén en el texto original.
- Devolvé SOLO el mensaje mejorado, sin explicaciones ni comillas.`;async function bt(e,t=``){let n=t?`Instrucción adicional: ${t}\n\nMensaje a mejorar:\n${e}`:`Mensaje a mejorar:\n${e}`,r=await he([{role:`system`,content:yt},{role:`user`,content:n}]);return typeof r==`string`?r.trim():r&&typeof r.content==`string`?r.content.trim():String(r||``).trim()}function xt(e){let t=new Date;return t.setDate(t.getDate()+e),t.toISOString().slice(0,10)}new Date(Date.now()-2*864e5).toISOString(),xt(-1),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),xt(0),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString();var St=e({actualizarSeguimiento:()=>Dt,cerrarSeguimiento:()=>Ot,crearSeguimiento:()=>Et,eliminarSeguimiento:()=>kt,getSeguimientos:()=>wt,getSeguimientosByAlumno:()=>Tt}),D=`comunicaciones_seguimiento`,Ct=`id, alumno_id, contacto_nombre, contacto_telefono, contacto_email, canal, fecha, resultado, notas, requiere_seguimiento, proxima_accion, proxima_fecha, estado, responsable_id, created_at, updated_at`;async function wt(e={}){let t=r.from(D).select(Ct);e.alumno_id&&(t=t.eq(`alumno_id`,e.alumno_id)),e.estado&&(t=t.eq(`estado`,e.estado)),e.canal&&(t=t.eq(`canal`,e.canal));let{data:n,error:i}=await t.order(`fecha`,{ascending:!1});if(i)throw i;return n||[]}async function Tt(e){return wt({alumno_id:e})}async function Et(e){let t={alumno_id:e.alumno_id||null,contacto_nombre:e.contacto_nombre||null,contacto_telefono:e.contacto_telefono||null,contacto_email:e.contacto_email||null,canal:e.canal||`llamada`,fecha:e.fecha||new Date().toISOString(),resultado:e.resultado||`contactado`,notas:e.notas||null,requiere_seguimiento:!!e.requiere_seguimiento,proxima_accion:e.proxima_accion||null,proxima_fecha:e.proxima_fecha||null,estado:e.estado||`abierto`},{data:n,error:i}=await r.from(D).insert(t).select(Ct).single();if(i)throw i;return n}async function Dt(e,t={}){let{data:n,error:i}=await r.from(D).update(t).eq(`id`,e).select(Ct).single();if(i)throw i;return n}async function Ot(e){return Dt(e,{estado:`cerrado`,requiere_seguimiento:!1})}async function kt(e){let{error:t}=await r.from(D).delete().eq(`id`,e);if(t)throw t;return!0}var O=St,At=O.getSeguimientos;O.getSeguimientosByAlumno;var jt=O.crearSeguimiento,Mt=O.actualizarSeguimiento,Nt=O.cerrarSeguimiento,Pt=O.eliminarSeguimiento,k={llamada:{label:`Llamada`,icon:`bi-telephone`},whatsapp:{label:`WhatsApp`,icon:`bi-whatsapp`},correo:{label:`Correo`,icon:`bi-envelope`},reunion:{label:`Reunión`,icon:`bi-people`},otro:{label:`Otro`,icon:`bi-chat-dots`}},Ft={contactado:{label:`Contactado`,color:`success`},buzon_no_contesto:{label:`Buzón / No contestó`,color:`secondary`},reagendar:{label:`Reagendar`,color:`warning`},sin_interes:{label:`Sin interés`,color:`dark`},resuelto:{label:`Resuelto`,color:`primary`}};function It(e){if(e instanceof Date)return new Date(e);if(typeof e==`string`){let t=e.match(/^(\d{4})-(\d{2})-(\d{2})/);if(t)return new Date(Number(t[1]),Number(t[2])-1,Number(t[3]))}return new Date(e)}function Lt(e){let t=It(e);return t.setHours(0,0,0,0),t}function Rt(e){return e?.proxima_fecha?Lt(e.proxima_fecha):null}function zt(e){return e?.estado===`abierto`}function Bt(e,t=new Date){let n=Rt(e);return n?Math.round((n-Lt(t))/864e5):null}function Vt(e=[],t=new Date){let n={vencidos:[],hoy:[],proximos:[]};for(let r of e){if(!zt(r)||!r?.requiere_seguimiento)continue;let e=Bt(r,t);e!==null&&(e<0?n.vencidos.push(r):e===0?n.hoy.push(r):n.proximos.push(r))}return n}var A={registros:[],filtroCanal:`todos`,filtroEstado:`abierto`},j=null;async function M(e){j?.abort(),j=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{A.registros=await At(),Ht(e)}catch(t){console.error(`[Seguimiento] Error:`,t),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar seguimiento</h5>
      <p>${g(t.message)}</p></div></div>`}return{teardown:()=>j?.abort()}}function Ht(e){let t=Vt(A.registros),n=Gt();e.innerHTML=`
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
        ${Ut(`Vencidos`,t.vencidos,`danger`,`bi-exclamation-octagon`)}
        ${Ut(`Para hoy`,t.hoy,`warning`,`bi-calendar-day`)}
        ${Ut(`Próximos`,t.proximos,`info`,`bi-calendar-week`)}
      </div>

      <!-- Historial -->
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h6 class="fw-bold mb-0"><i class="bi bi-clock-history me-1"></i>Historial de interacciones</h6>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" id="segFiltroEstado" style="max-width:140px">
            <option value="todos" ${A.filtroEstado===`todos`?`selected`:``}>Todos</option>
            <option value="abierto" ${A.filtroEstado===`abierto`?`selected`:``}>Abiertos</option>
            <option value="cerrado" ${A.filtroEstado===`cerrado`?`selected`:``}>Cerrados</option>
          </select>
          <select class="form-select form-select-sm" id="segFiltroCanal" style="max-width:140px">
            <option value="todos">Todo canal</option>
            ${Object.entries(k).map(([e,t])=>`<option value="${e}" ${A.filtroCanal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select>
        </div>
      </div>
      <div id="segLista">
        ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay interacciones para este filtro</div>`:n.map(Wt).join(``)}
      </div>
    </div>
  `,Kt(e)}function Ut(e,t,n,r){return`
    <div class="col-md-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-${n} bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
          <span class="fw-bold text-${n}"><i class="bi ${r} me-1"></i>${e}</span>
          <span class="badge bg-${n}">${t.length}</span>
        </div>
        <div class="card-body p-2" style="max-height:240px;overflow-y:auto">
          ${t.length===0?`<p class="text-muted small text-center mb-0 py-3">Sin pendientes</p>`:t.map(e=>`
            <button class="btn btn-light btn-sm w-100 text-start mb-1 seg-agenda-item" data-id="${e.id}">
              <div class="fw-semibold small">${g(e.contacto_nombre||`Contacto`)}</div>
              <div class="text-muted extra-small">${g(e.proxima_accion||`Seguimiento`)}</div>
            </button>`).join(``)}
        </div>
      </div>
    </div>
  `}function Wt(e){let t=k[e.canal]||k.otro,n=Ft[e.resultado]||{label:e.resultado,color:`secondary`},r=e.requiere_seguimiento?Bt(e):null,i=r===null?`text-muted`:r<0?`text-danger`:r===0?`text-warning`:`text-muted`;return`
    <div class="card border-0 shadow-sm mb-2 seg-card" data-id="${e.id}">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="bi ${t.icon} text-primary"></i>
              <span class="fw-semibold">${g(e.contacto_nombre||`Contacto`)}</span>
              <span class="badge bg-${n.color} bg-opacity-75">${n.label}</span>
              ${e.estado===`cerrado`?`<span class="badge bg-secondary">Cerrado</span>`:``}
            </div>
            ${e.notas?`<p class="small text-secondary mb-1">${g(e.notas)}</p>`:``}
            ${e.requiere_seguimiento&&e.proxima_fecha?`<div class="small ${i}"><i class="bi bi-arrow-return-right"></i>
                    ${g(e.proxima_accion||`Seguimiento`)} · ${e.proxima_fecha}${r!==null&&r<0?` (vencido)`:r===0?` (hoy)`:``}</div>`:``}
          </div>
          <div class="text-end flex-shrink-0">
            <div class="text-muted extra-small mb-1">${new Date(e.fecha).toLocaleDateString(`es-DO`)}</div>
            <button class="btn btn-sm btn-outline-secondary seg-edit" data-id="${e.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            ${e.estado===`abierto`?`<button class="btn btn-sm btn-outline-success seg-cerrar" data-id="${e.id}" title="Cerrar"><i class="bi bi-check2"></i></button>`:``}
          </div>
        </div>
      </div>
    </div>
  `}function Gt(){let e=[...A.registros];return A.filtroEstado!==`todos`&&(e=e.filter(e=>e.estado===A.filtroEstado)),A.filtroCanal!==`todos`&&(e=e.filter(e=>e.canal===A.filtroCanal)),e}function Kt(e){let n=j.signal;e.querySelector(`#segNuevo`)?.addEventListener(`click`,()=>qt(null,()=>M(e)),{signal:n}),e.querySelector(`#segFiltroEstado`)?.addEventListener(`change`,t=>{A.filtroEstado=t.target.value,Ht(e)},{signal:n}),e.querySelector(`#segFiltroCanal`)?.addEventListener(`change`,t=>{A.filtroCanal=t.target.value,Ht(e)},{signal:n});let r=t=>{let n=A.registros.find(e=>e.id===t);n&&qt(n,()=>M(e))};e.querySelectorAll(`.seg-agenda-item, .seg-edit`).forEach(e=>e.addEventListener(`click`,()=>r(e.dataset.id),{signal:n})),e.querySelectorAll(`.seg-cerrar`).forEach(r=>r.addEventListener(`click`,async()=>{try{await Nt(r.dataset.id),t.show(`Seguimiento cerrado`,`success`),M(e)}catch(e){t.show(`Error: ${e.message}`,`error`)}},{signal:n}))}function qt(e,n,r=null){let i=!e,a=e||{alumno_id:r?.alumnoId||null,contacto_nombre:r?.alumno||r?.contactoNombre||``,contacto_telefono:r?.whatsapp||``,contacto_email:r?.email||``,canal:`llamada`,fecha:new Date().toISOString(),resultado:`contactado`,notas:``,requiere_seguimiento:!1,proxima_accion:``,proxima_fecha:``,estado:`abierto`},o=new Date().toISOString().slice(0,10);me.open({title:i?`Registrar interacción`:`Editar seguimiento`,size:`lg`,body:`
      <div class="row g-2 mb-2">
        <div class="col-md-6"><label class="form-label small fw-semibold">Contacto *</label>
          <input type="text" class="form-control form-control-sm" id="segNombre" value="${g(a.contacto_nombre||``)}"></div>
        <div class="col-md-6"><label class="form-label small fw-semibold">Teléfono</label>
          <input type="text" class="form-control form-control-sm" id="segTel" value="${g(a.contacto_telefono||``)}"></div>
      </div>
      <div class="row g-2 mb-2">
        <div class="col-md-4"><label class="form-label small fw-semibold">Canal</label>
          <select class="form-select form-select-sm" id="segCanal">
            ${Object.entries(k).map(([e,t])=>`<option value="${e}" ${a.canal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Resultado</label>
          <select class="form-select form-select-sm" id="segResultado">
            ${Object.entries(Ft).map(([e,t])=>`<option value="${e}" ${a.resultado===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segFecha" value="${(a.fecha||``).slice(0,10)||o}"></div>
      </div>
      <div class="mb-2"><label class="form-label small fw-semibold">Notas (¿qué se habló? ¿en qué quedaron?)</label>
        <textarea class="form-control form-control-sm" id="segNotas" rows="3">${g(a.notas||``)}</textarea></div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="segReq" ${a.requiere_seguimiento?`checked`:``}>
        <label class="form-check-label small fw-semibold" for="segReq">Requiere seguimiento (agendar próxima acción)</label>
      </div>
      <div id="segProxWrap" class="row g-2 ${a.requiere_seguimiento?``:`d-none`}">
        <div class="col-md-8"><label class="form-label small">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="segProxAccion" value="${g(a.proxima_accion||``)}" placeholder="Ej. Volver a llamar para confirmar"></div>
        <div class="col-md-4"><label class="form-label small">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segProxFecha" value="${a.proxima_fecha||``}"></div>
      </div>
    `,saveText:i?`Registrar`:`Guardar`,deleteText:`Eliminar`,onDelete:i?null:async()=>{try{await Pt(a.id),t.show(`Registro eliminado`,`success`),n?.()}catch(e){return t.show(`Error: ${e.message}`,`error`),!1}},onShow:e=>{e.querySelector(`#segReq`)?.addEventListener(`change`,t=>{e.querySelector(`#segProxWrap`).classList.toggle(`d-none`,!t.target.checked)})},onSave:async e=>{let r=e.querySelector(`#segNombre`).value.trim();if(!r)return t.show(`El contacto es obligatorio`,`error`),!1;let s=e.querySelector(`#segReq`).checked,c={alumno_id:a.alumno_id||null,contacto_nombre:r,contacto_telefono:e.querySelector(`#segTel`).value.trim()||null,contacto_email:a.contacto_email||null,canal:e.querySelector(`#segCanal`).value,resultado:e.querySelector(`#segResultado`).value,fecha:new Date(e.querySelector(`#segFecha`).value||o).toISOString(),notas:e.querySelector(`#segNotas`).value.trim()||null,requiere_seguimiento:s,proxima_accion:s&&e.querySelector(`#segProxAccion`).value.trim()||null,proxima_fecha:s&&e.querySelector(`#segProxFecha`).value||null};try{i?await jt(c):await Mt(a.id,c),t.show(`Seguimiento guardado`,`success`),n?.()}catch(e){return t.show(`Error: ${e.message}`,`error`),!1}}})}var Jt=[`{nombre_alumno}`,`{representante}`,`{instrumento}`,`{seccion}`],N={contactos:[],plantillas:[],tab:`directorio`,filtroFamilia:`todas`,busqueda:``,seleccion:new Set,canal:`whatsapp`,asunto:``,mensaje:``},P=null;async function Yt(e){P?.abort(),P=new AbortController,e.innerHTML=Xt();try{let[t,n]=await Promise.all([mt(),ht()]);N.contactos=t,N.plantillas=n,F(e)}catch(t){console.error(`[Comunicaciones] Error:`,t),e.innerHTML=`<div class="container mt-5"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar Comunicaciones</h5>
      <p>${g(t.message)}</p></div></div>`}return{teardown:()=>P?.abort()}}function Xt(){return`<div class="d-flex justify-content-center align-items-center" style="min-height:400px">
    <div class="text-center"><div class="spinner-border text-primary mb-3"></div>
    <p class="text-muted">Cargando central de comunicaciones...</p></div></div>`}function F(e){e.innerHTML=`
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
        ${Zt(`directorio`,`bi-journal-text`,`Directorio`)}
        ${Zt(`compositor`,`bi-pencil-square`,`Compositor${N.seleccion.size?` (${N.seleccion.size})`:``}`)}
        ${Zt(`plantillas`,`bi-files`,`Plantillas`)}
      </ul>

      <div id="comm-body"></div>
    </div>
  `,e.querySelectorAll(`.comm-tab-btn`).forEach(t=>t.addEventListener(`click`,()=>{N.tab=t.dataset.tab,F(e)},{signal:P.signal})),Qt(e)}function Zt(e,t,n){return`<li class="nav-item"><button class="nav-link comm-tab-btn ${N.tab===e?`active`:``}" data-tab="${e}">
    <i class="bi ${t} me-1"></i>${n}</button></li>`}function Qt(e){let t=e.querySelector(`#comm-body`);N.tab===`directorio`?en(e,t):N.tab===`compositor`?nn(e,t):ln(e,t)}function $t(){let e=[...N.contactos];if(N.filtroFamilia!==`todas`&&(e=e.filter(e=>e.familia===N.filtroFamilia)),N.busqueda){let t=N.busqueda.toLowerCase();e=e.filter(e=>(e.alumno||``).toLowerCase().includes(t)||(e.contactoNombre||``).toLowerCase().includes(t)||(e.instrumento||``).toLowerCase().includes(t))}return e}function en(e,t){let n=$t(),r=Object.entries(rt),i=e=>N.contactos.filter(t=>t.familia===e).length;t.innerHTML=`
    <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
      <input type="text" class="form-control form-control-sm" id="commBuscar" style="max-width:260px"
        placeholder="🔍 Buscar alumno, representante o instrumento" value="${g(N.busqueda)}">
      <button class="btn btn-sm ${N.filtroFamilia===`todas`?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="todas">
        Todas (${N.contactos.length})
      </button>
      ${r.filter(([e])=>i(e)>0).map(([e,t])=>`<button class="btn btn-sm ${N.filtroFamilia===e?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label} (${i(e)})
            </button>`).join(``)}
    </div>

    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="commSelAll">
        <label class="form-check-label small" for="commSelAll">Seleccionar los ${n.length} filtrados</label>
      </div>
      <div class="small text-muted">
        <span class="fw-bold text-primary">${N.seleccion.size}</span> seleccionados
        ${N.seleccion.size?`· <button class="btn btn-link btn-sm p-0 align-baseline" id="commClear">limpiar</button>`:``}
      </div>
    </div>

    <div class="table-responsive comm-table-wrap">
      <table class="table table-sm table-hover align-middle mb-0">
        <thead class="table-light"><tr>
          <th style="width:36px"></th><th>Alumno</th><th>Instrumento</th><th>Representante</th>
          <th>WhatsApp</th><th>Correo</th><th style="width:44px"></th>
        </tr></thead>
        <tbody>
          ${n.length===0?`<tr><td colspan="7" class="text-center text-muted py-4">Sin contactos para este filtro</td></tr>`:n.map(tn).join(``)}
        </tbody>
      </table>
    </div>

    <div class="comm-sticky-actions mt-3">
      <button class="btn btn-primary" id="commToComposer" ${N.seleccion.size===0?`disabled`:``}>
        <i class="bi bi-pencil-square me-1"></i> Redactar a ${N.seleccion.size} contacto${N.seleccion.size===1?``:`s`}
      </button>
    </div>
  `;let a=P.signal;t.querySelector(`#commBuscar`)?.addEventListener(`input`,n=>{N.busqueda=n.target.value,en(e,t)},{signal:a}),t.querySelectorAll(`.comm-fam`).forEach(n=>n.addEventListener(`click`,()=>{N.filtroFamilia=n.dataset.fam,en(e,t)},{signal:a}));let o=n.length>0&&n.every(e=>N.seleccion.has(e.alumnoId)),s=t.querySelector(`#commSelAll`);s&&(s.checked=o),s?.addEventListener(`change`,t=>{n.forEach(e=>t.target.checked?N.seleccion.add(e.alumnoId):N.seleccion.delete(e.alumnoId)),F(e)},{signal:a}),t.querySelector(`#commClear`)?.addEventListener(`click`,()=>{N.seleccion.clear(),F(e)},{signal:a}),t.querySelectorAll(`.comm-row-check`).forEach(t=>t.addEventListener(`change`,n=>{n.target.checked?N.seleccion.add(t.dataset.id):N.seleccion.delete(t.dataset.id),F(e)},{signal:a})),t.querySelector(`#commToComposer`)?.addEventListener(`click`,()=>{N.tab=`compositor`,F(e)},{signal:a}),t.querySelectorAll(`.comm-seg-btn`).forEach(e=>e.addEventListener(`click`,()=>{let t=N.contactos.find(t=>t.alumnoId===e.dataset.id);t&&qt(null,null,t)},{signal:a}))}function tn(e){let t=T(e.whatsapp);return`<tr>
    <td><input class="form-check-input comm-row-check" type="checkbox" data-id="${e.alumnoId}" ${N.seleccion.has(e.alumnoId)?`checked`:``}></td>
    <td class="fw-semibold">${g(e.alumno||``)}</td>
    <td><span class="badge bg-light text-dark border">${g(e.instrumento||`—`)}</span></td>
    <td class="small">${g(e.contactoNombre||``)}</td>
    <td class="small">${t?`<i class="bi bi-whatsapp text-success"></i> ${g(e.whatsapp)}`:`<span class="text-muted">—</span>`}</td>
    <td class="small">${e.email?`<i class="bi bi-envelope text-primary"></i> ${g(e.email)}`:`<span class="text-muted">—</span>`}</td>
    <td><button class="btn btn-sm btn-outline-primary comm-seg-btn" data-id="${e.alumnoId}" title="Registrar seguimiento"><i class="bi bi-telephone-plus"></i></button></td>
  </tr>`}function I(){return N.contactos.filter(e=>N.seleccion.has(e.alumnoId))}function nn(e,t){let n=I();if(n.length===0){t.innerHTML=`<div class="alert alert-info"><i class="bi bi-info-circle me-1"></i>
      No hay destinatarios. Andá al <button class="btn btn-link btn-sm p-0 align-baseline" id="commGoDir">Directorio</button> y seleccioná contactos.</div>`,t.querySelector(`#commGoDir`)?.addEventListener(`click`,()=>{N.tab=`directorio`,F(e)},{signal:P.signal});return}let r=n.filter(e=>T(e.whatsapp)).length,i=n.filter(e=>e.email).length,a=N.plantillas;t.innerHTML=`
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="btn-group mb-3" role="group">
              <button class="btn btn-sm ${N.canal===`whatsapp`?`btn-success`:`btn-outline-success`} comm-canal" data-canal="whatsapp">
                <i class="bi bi-whatsapp me-1"></i>WhatsApp (${r})
              </button>
              <button class="btn btn-sm ${N.canal===`email`?`btn-primary`:`btn-outline-primary`} comm-canal" data-canal="email">
                <i class="bi bi-envelope me-1"></i>Correo (${i})
              </button>
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold d-flex justify-content-between">
                <span>Plantilla</span>
                <span class="text-muted">Variables: insertá con los botones</span>
              </label>
              <select class="form-select form-select-sm mb-2" id="commTpl">
                <option value="">— Sin plantilla (escribir desde cero) —</option>
                ${a.map(e=>`<option value="${e.id}">${g(e.nombre)} · ${g(e.tipo||``)}</option>`).join(``)}
              </select>
            </div>

            ${N.canal===`email`?`<div class="mb-2"><input type="text" class="form-control form-control-sm" id="commAsunto"
                     placeholder="Asunto del correo" value="${g(N.asunto)}"></div>`:``}

            <div class="mb-2 d-flex flex-wrap gap-1">
              ${Jt.map(e=>`<button class="btn btn-outline-secondary btn-sm py-0 comm-var" data-var="${e}">${e}</button>`).join(``)}
            </div>

            <textarea class="form-control" id="commMsg" rows="8" placeholder="Escribí el mensaje...">${g(N.mensaje)}</textarea>

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
            <h6 class="fw-bold mb-2"><i class="bi bi-people me-1"></i>${n.length} destinatarios</h6>
            <div class="comm-recipients mb-3">
              ${n.slice(0,40).map(e=>`<span class="badge bg-light text-dark border me-1 mb-1">${g(e.alumno)}</span>`).join(``)}
              ${n.length>40?`<span class="badge bg-secondary">+${n.length-40} más</span>`:``}
            </div>
            <div id="commActionZone"></div>
          </div>
        </div>
      </div>
    </div>
  `;let o=P.signal;t.querySelectorAll(`.comm-canal`).forEach(n=>n.addEventListener(`click`,()=>{N.canal=n.dataset.canal,nn(e,t)},{signal:o}));let s=t.querySelector(`#commMsg`);s?.addEventListener(`input`,e=>{N.mensaje=e.target.value},{signal:o}),t.querySelector(`#commAsunto`)?.addEventListener(`input`,e=>{N.asunto=e.target.value},{signal:o}),t.querySelector(`#commTpl`)?.addEventListener(`change`,n=>{let r=N.plantillas.find(e=>e.id===n.target.value);r&&(N.mensaje=r.contenido||``,nn(e,t))},{signal:o}),t.querySelectorAll(`.comm-var`).forEach(e=>e.addEventListener(`click`,()=>{fn(s,e.dataset.var),N.mensaje=s.value},{signal:o})),t.querySelector(`#commIA`)?.addEventListener(`click`,()=>sn(e,t,``),{signal:o}),t.querySelector(`#commIAOpts`)?.addEventListener(`click`,()=>cn(e,t),{signal:o}),rn(e,t)}function rn(e,t){let n=t.querySelector(`#commActionZone`);if(!n)return;let r=I();if(N.canal===`whatsapp`)n.innerHTML=`
      <button class="btn btn-success w-100" id="commGenWa">
        <i class="bi bi-whatsapp me-1"></i>Generar links de WhatsApp
      </button>
      <p class="text-muted small mt-2 mb-0">Se abre un link por contacto con el mensaje pre-cargado (personalizado con sus variables). Hacés clic y se envía desde tu WhatsApp.</p>
      <div id="commWaLinks" class="mt-2"></div>
    `,t.querySelector(`#commGenWa`)?.addEventListener(`click`,()=>an(t),{signal:P.signal});else{let e=r.filter(e=>e.email);n.innerHTML=`
      <button class="btn btn-primary w-100" id="commSendMail" ${e.length===0?`disabled`:``}>
        <i class="bi bi-send me-1"></i>Enviar a ${e.length} correo${e.length===1?``:`s`}
      </button>
      <p class="text-muted small mt-2 mb-0">El correo va por la fundación (Resend). Los destinatarios van en copia oculta (bcc).</p>
    `,t.querySelector(`#commSendMail`)?.addEventListener(`click`,()=>on(t),{signal:P.signal})}}function an(e){let t=I().filter(e=>T(e.whatsapp)),n=e.querySelector(`#commWaLinks`);if(t.length===0){n.innerHTML=`<div class="alert alert-warning small mb-0">Ningún destinatario tiene un WhatsApp válido.</div>`;return}n.innerHTML=`
    <div class="d-grid gap-1 comm-wa-list">
      ${t.map(e=>`<a href="${at(e.whatsapp,ot(N.mensaje,e))}" target="_blank" rel="noopener" class="btn btn-outline-success btn-sm text-start">
            <i class="bi bi-whatsapp me-1"></i>${g(e.alumno)} <span class="text-muted">— ${g(e.contactoNombre)}</span>
          </a>`).join(``)}
    </div>
    <button class="btn btn-link btn-sm mt-1 p-0" id="commWaAll">Abrir todos (puede bloquear el navegador)</button>
  `,e.querySelector(`#commWaAll`)?.addEventListener(`click`,()=>{t.forEach(e=>window.open(at(e.whatsapp,ot(N.mensaje,e)),`_blank`,`noopener`))},{signal:P.signal})}async function on(e){let n=I().filter(e=>e.email),r=N.asunto.trim(),i=N.mensaje.trim();if(!r){t.show(`Falta el asunto del correo`,`error`);return}if(!i){t.show(`El mensaje está vacío`,`error`);return}let a=e.querySelector(`#commSendMail`),o=a.innerHTML;a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`;try{let e=pn(ot(i,n[0])),a=await vt({to:n.map(e=>e.email),subject:r,html:e});t.show(`Correo enviado a ${a.enviados} de ${a.total} destinatarios`,a.fallidos?`warning`:`success`)}catch(e){t.show(`Error: ${e.message}`,`error`)}finally{a.disabled=!1,a.innerHTML=o}}async function sn(e,n,r){let i=N.mensaje.trim();if(!i){t.show(`Escribí algo primero para mejorarlo`,`error`);return}let a=n.querySelector(`#commIA`),o=a?.innerHTML;a&&(a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Mejorando...`);try{N.mensaje=await bt(i,r),nn(e,n),t.show(`Mensaje mejorado con IA`,`success`)}catch(e){t.show(`IA no disponible: ${e.message}`,`error`),a&&o&&(a.disabled=!1,a.innerHTML=o)}}function cn(e,t){me.open({title:`Ajustar tono con IA`,body:`
      <p class="small text-muted">Elegí cómo querés que la IA reescriba el mensaje:</p>
      <div class="d-grid gap-2">
        ${[`Más formal`,`Más cálido y cercano`,`Más corto y directo`,`Más motivador`,`Corregir ortografía y gramática`].map(e=>`<button class="btn btn-outline-primary comm-tono" data-tono="${e}">${e}</button>`).join(``)}
      </div>`,hideSave:!0,cancelText:`Cerrar`}),setTimeout(()=>{document.querySelectorAll(`.comm-tono`).forEach(n=>n.addEventListener(`click`,()=>{me.close(),sn(e,t,n.dataset.tono)},{once:!0}))},50)}function ln(e,t){t.innerHTML=`
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted small mb-0">Plantillas reutilizables para mensajes y correos. Usá variables como {nombre_alumno}.</p>
      <button class="btn btn-primary btn-sm" id="commNewTpl"><i class="bi bi-plus-lg me-1"></i>Nueva plantilla</button>
    </div>
    <div class="row g-2">
      ${N.plantillas.length===0?`<div class="col-12"><div class="alert alert-info">Aún no hay plantillas.</div></div>`:N.plantillas.map(un).join(``)}
    </div>
  `;let n=P.signal;t.querySelector(`#commNewTpl`)?.addEventListener(`click`,()=>dn(e,null),{signal:n}),t.querySelectorAll(`.comm-tpl-edit`).forEach(t=>t.addEventListener(`click`,()=>dn(e,N.plantillas.find(e=>e.id===t.dataset.id)),{signal:n})),t.querySelectorAll(`.comm-tpl-use`).forEach(t=>t.addEventListener(`click`,()=>{N.mensaje=N.plantillas.find(e=>e.id===t.dataset.id)?.contenido||``,N.tab=`compositor`,F(e)},{signal:n}))}function un(e){return`<div class="col-md-6 col-xl-4">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="fw-bold mb-1">${g(e.nombre)}</h6>
          <span class="badge bg-light text-dark border">${g(e.tipo||`mensaje`)}</span>
        </div>
        <p class="text-muted small mb-2">${g(e.descripcion||``)}</p>
        <p class="small comm-tpl-preview">${g((e.contenido||``).slice(0,120))}${(e.contenido||``).length>120?`…`:``}</p>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary comm-tpl-use" data-id="${e.id}"><i class="bi bi-pencil-square me-1"></i>Usar</button>
          <button class="btn btn-sm btn-outline-secondary comm-tpl-edit" data-id="${e.id}"><i class="bi bi-gear"></i></button>
        </div>
      </div>
    </div>
  </div>`}function dn(e,n){let r=!n;me.open({title:r?`Nueva plantilla`:`Editar plantilla`,size:`lg`,body:`
      <div class="mb-2"><label class="form-label small fw-semibold">Nombre *</label>
        <input type="text" class="form-control form-control-sm" id="tplNombre" value="${g(n?.nombre||``)}"></div>
      <div class="row g-2 mb-2">
        <div class="col-6"><label class="form-label small fw-semibold">Tipo</label>
          <select class="form-select form-select-sm" id="tplTipo">
            ${[`mensaje`,`correo`,`carta`].map(e=>`<option value="${e}" ${n?.tipo===e?`selected`:``}>${e}</option>`).join(``)}
          </select></div>
        <div class="col-6"><label class="form-label small fw-semibold">Descripción</label>
          <input type="text" class="form-control form-control-sm" id="tplDesc" value="${g(n?.descripcion||``)}"></div>
      </div>
      <div class="mb-1"><label class="form-label small fw-semibold">Contenido</label>
        <div class="mb-1 d-flex flex-wrap gap-1">
          ${Jt.map(e=>`<button type="button" class="btn btn-outline-secondary btn-sm py-0 tplVar" data-var="${e}">${e}</button>`).join(``)}
        </div>
        <textarea class="form-control" id="tplContenido" rows="6">${g(n?.contenido||``)}</textarea>
      </div>
    `,saveText:r?`Crear`:`Guardar`,deleteText:`Eliminar`,onDelete:r?null:async()=>{try{await _t(n.id),N.plantillas=N.plantillas.filter(e=>e.id!==n.id),t.show(`Plantilla eliminada`,`success`),F(e)}catch(e){return t.show(`Error: ${e.message}`,`error`),!1}},onSave:async r=>{let i=r.querySelector(`#tplNombre`).value.trim();if(!i)return t.show(`El nombre es obligatorio`,`error`),!1;let a={id:n?.id,nombre:i,tipo:r.querySelector(`#tplTipo`).value,descripcion:r.querySelector(`#tplDesc`).value.trim(),contenido:r.querySelector(`#tplContenido`).value,variables:Jt.filter(e=>r.querySelector(`#tplContenido`).value.includes(e)).map(e=>e.replace(/[{}]/g,``))};try{let n=await gt(a),r=N.plantillas.findIndex(e=>e.id===n.id);r>=0?N.plantillas[r]=n:N.plantillas.push(n),t.show(`Plantilla guardada`,`success`),F(e)}catch(e){return t.show(`Error: ${e.message}`,`error`),!1}}}),setTimeout(()=>{document.querySelectorAll(`.tplVar`).forEach(e=>e.addEventListener(`click`,()=>{fn(document.querySelector(`#tplContenido`),e.dataset.var)}))},50)}function fn(e,t){if(!e)return;let n=e.selectionStart??e.value.length,r=e.selectionEnd??e.value.length;e.value=e.value.slice(0,n)+t+e.value.slice(r),e.focus(),e.selectionStart=e.selectionEnd=n+t.length}function pn(e){return`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">
    ${g(e).replace(/\n/g,`<br>`)}
  </div>`}function L(e,t=18){let n=new Date;return n.setDate(n.getDate()+e),n.setHours(t,0,0,0),n.toISOString()}L(12),L(12,21),L(3,8),L(20,17),L(8,15),L(8,18),L(5,10),L(5,12),L(25,9),L(25,10);var mn=e({getEventos:()=>_n}),hn=`calendario_institucional`,gn=`id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, departamento_responsable, estado`;async function _n(e={}){let t=e.desde||new Date().toISOString(),n=e.dias??120,i=new Date(new Date(t).getTime()+n*864e5).toISOString(),a=r.from(hn).select(gn).gte(`fecha_inicio`,t).lte(`fecha_inicio`,i);e.categoria&&e.categoria!==`todas`&&(a=a.eq(`categoria`,e.categoria));let{data:o,error:s}=await a.order(`fecha_inicio`,{ascending:!0});if(s)throw s;return o||[]}var vn=mn.getEventos,yn={concierto:{label:`Concierto`,icon:`bi-music-note-beamed`,color:`primary`},ensayo:{label:`Ensayo`,icon:`bi-music-note`,color:`info`},reunion:{label:`Reunión`,icon:`bi-people`,color:`secondary`},patrocinio:{label:`Patrocinio`,icon:`bi-gift`,color:`success`},pago:{label:`Pago`,icon:`bi-cash-coin`,color:`warning`},corte:{label:`Corte`,icon:`bi-scissors`,color:`dark`},inscripcion:{label:`Inscripción`,icon:`bi-person-plus`,color:`primary`},auditoria:{label:`Auditoría`,icon:`bi-shield-check`,color:`secondary`},otro:{label:`Otro`,icon:`bi-calendar-event`,color:`secondary`}},bn=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function xn(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function R(e,t=new Date){return e?.fecha_inicio?Math.round((xn(e.fecha_inicio)-xn(t))/864e5):null}function Sn(e,t=30,n=new Date){let r=R(e,n);return r!==null&&r>=0&&r<=t}function Cn(e=[]){let t=new Map;for(let n of e){if(!n?.fecha_inicio)continue;let e=new Date(n.fecha_inicio),r=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}`;t.has(r)||t.set(r,{clave:r,label:`${bn[e.getMonth()]} ${e.getFullYear()}`,eventos:[]}),t.get(r).eventos.push(n)}let n=[...t.values()].sort((e,t)=>e.clave.localeCompare(t.clave));for(let e of n)e.eventos.sort((e,t)=>new Date(e.fecha_inicio)-new Date(t.fecha_inicio));return n}var z={eventos:[],filtroCategoria:`todas`},wn=null;async function Tn(e){wn?.abort(),wn=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{z.eventos=await vn({dias:120}),En(e)}catch(t){console.error(`[CalendarioCom] Error:`,t),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar el calendario</h5>
      <p>${g(t.message)}</p></div></div>`}return{teardown:()=>wn?.abort()}}function En(e){let t=Cn(z.filtroCategoria===`todas`?z.eventos:z.eventos.filter(e=>e.categoria===z.filtroCategoria)),n=z.eventos.filter(e=>Sn(e,7)).length,r=z.eventos.filter(e=>Sn(e,30)).length,i=z.eventos.find(e=>e.categoria===`concierto`&&R(e)>=0),a=[...new Set(z.eventos.map(e=>e.categoria))];e.innerHTML=`
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
        ${Dn(`Próximos 7 días`,n,`danger`)}
        ${Dn(`Próximos 30 días`,r,`warning`)}
        ${Dn(`Total en agenda`,z.eventos.length,`primary`)}
        ${i?`<div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
                 <small class="text-muted">Próximo concierto</small>
                 <div class="fw-bold text-info">${R(i)} día${R(i)===1?``:`s`}</div>
               </div>`:``}
      </div>

      <div class="d-flex gap-2 flex-wrap mb-3">
        <button class="btn btn-sm ${z.filtroCategoria===`todas`?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="todas">Todas</button>
        ${a.map(e=>{let t=yn[e]||yn.otro;return`<button class="btn btn-sm ${z.filtroCategoria===e?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label}</button>`}).join(``)}
      </div>

      <div id="calAgenda">
        ${t.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-calendar-x"></i> No hay eventos próximos para este filtro</div>`:t.map(On).join(``)}
      </div>
    </div>
  `;let o=wn.signal;e.querySelectorAll(`.cal-cat`).forEach(t=>t.addEventListener(`click`,()=>{z.filtroCategoria=t.dataset.cat,En(e)},{signal:o}))}function Dn(e,t,n){return`<div class="kpi-card bg-${n} bg-opacity-10 p-2 rounded">
    <small class="text-muted">${e}</small>
    <div class="fs-5 fw-bold text-${n}">${t}</div>
  </div>`}function On(e){return`
    <div class="mb-4">
      <h6 class="fw-bold text-uppercase small text-muted mb-2 border-bottom pb-1">${g(e.label)}</h6>
      ${e.eventos.map(kn).join(``)}
    </div>
  `}function kn(e){let t=yn[e.categoria]||yn.otro,n=R(e),r=new Date(e.fecha_inicio),i=r.toLocaleDateString(`es-DO`,{weekday:`short`,day:`2-digit`,month:`short`}),a=r.toLocaleTimeString(`es-DO`,{hour:`2-digit`,minute:`2-digit`}),o=n===0?`Hoy`:n===1?`Mañana`:n>0?`En ${n} días`:`Pasado`;return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="text-center flex-shrink-0" style="width:54px">
            <div class="badge bg-${t.color} bg-opacity-10 text-${t.color} border border-${t.color}-subtle w-100 py-1">
              <i class="bi ${t.icon}"></i>
            </div>
            <div class="extra-small text-muted mt-1">${o}</div>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${g(e.titulo)}</div>
            <div class="small text-secondary">${g(e.descripcion||``)}</div>
            <div class="d-flex flex-wrap gap-3 mt-1 small text-muted">
              <span><i class="bi bi-calendar3 me-1"></i>${i} · ${a}</span>
              ${e.ubicacion&&e.ubicacion!==`—`?`<span><i class="bi bi-geo-alt me-1"></i>${g(e.ubicacion)}</span>`:``}
              <span><i class="bi bi-building me-1"></i>${g(e.departamento_responsable||``)}</span>
              <span class="badge bg-${t.color} bg-opacity-75">${t.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function An(){h.register(`comunicaciones`,e=>Yt(e)),h.register(`com-seguimiento`,e=>M(e)),h.register(`com-calendario`,e=>Tn(e))}var B=(e,t)=>({id:`mock-dep-${e.toLowerCase()}`,codigo:e,nombre:t,descripcion:null,email:null,responsable_nombre:null,responsable_email:null,activo:!0,updated_at:new Date().toISOString()});B(`DIR`,`Dirección`),B(`ACM`,`Académica`),B(`ADM`,`Administración`),B(`FIN`,`Financiero`),B(`COM`,`Comunicaciones`),B(`LOG`,`Logística`),B(`TECNICO`,`Técnico`);var jn=e({actualizarDepartamento:()=>Fn,enviarCorreoPrueba:()=>In,getDepartamentos:()=>Pn}),Mn=`departamentos`,Nn=`id, codigo, nombre, descripcion, email, responsable_nombre, responsable_email, activo, updated_at`;async function Pn(){let{data:e,error:t}=await r.from(Mn).select(Nn).order(`codigo`,{ascending:!0});if(t)throw t;return e||[]}async function Fn(e,t={}){let n={};t.nombre!==void 0&&(n.nombre=t.nombre),t.email!==void 0&&(n.email=t.email||null),t.responsable_nombre!==void 0&&(n.responsable_nombre=t.responsable_nombre||null),t.responsable_email!==void 0&&(n.responsable_email=t.responsable_email||null),t.activo!==void 0&&(n.activo=t.activo),n.updated_at=new Date().toISOString();let{data:i,error:a}=await r.from(Mn).update(n).eq(`id`,e).select(Nn).single();if(a)throw a;return i}async function In(e,t=``){let{data:n,error:i}=await r.functions.invoke(`send-email`,{body:{to:e,subject:`Correo de prueba — Departamento ${t}`.trim(),html:`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#1f2937">
        <p>Este es un <strong>correo de prueba</strong> del SOI (El Sistema Punta Cana).</p>
        <p>Si lo recibís, la casilla del departamento <strong>${Ln(t)}</strong> está configurada correctamente
        y Hermes podrá despachar correos a este destino. 🎻</p>
      </div>`}});if(i){let e=i.message;try{let t=await i.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(n&&n.ok===!1&&n.enviados===0)throw Error(n.batches?.[0]?.error||`No se pudo enviar el correo de prueba`);return n}function Ln(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var Rn=jn,zn=Rn.getDepartamentos,Bn=Rn.actualizarDepartamento,Vn=Rn.enviarCorreoPrueba,Hn=/^[^@\s]+@[^@\s]+\.[^@\s]+$/,Un=null;async function Wn(e){Un?.abort(),Un=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{Gn(e,await zn())}catch(t){console.error(`[Departamentos] Error:`,t),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar departamentos</h5>
      <p>${g(t.message)}</p></div></div>`}return{teardown:()=>Un?.abort()}}function Gn(e,t){let n=t.filter(e=>!e.email).length;e.innerHTML=`
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
        ${t.map(Kn).join(``)}
      </div>
    </div>
  `,qn(e,t)}function Kn(e){return`
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100 dep-card" data-id="${e.id}">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary">${g(e.codigo)}</span>
              <input type="text" class="form-control form-control-sm dep-nombre" style="max-width:200px"
                value="${g(e.nombre||``)}">
            </div>
            <div class="form-check form-switch m-0" title="Activo">
              <input class="form-check-input dep-activo" type="checkbox" ${e.activo?`checked`:``}>
            </div>
          </div>

          <label class="form-label small fw-semibold mb-1">Correo institucional</label>
          <input type="email" class="form-control form-control-sm mb-2 dep-email"
            placeholder="ej. finanzas@funeyca.org" value="${g(e.email||``)}">

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Responsable</label>
              <input type="text" class="form-control form-control-sm dep-resp-nombre"
                placeholder="Nombre" value="${g(e.responsable_nombre||``)}">
            </div>
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Correo responsable</label>
              <input type="email" class="form-control form-control-sm dep-resp-email"
                placeholder="opcional" value="${g(e.responsable_email||``)}">
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-primary dep-save" data-id="${e.id}">
              <i class="bi bi-check-lg me-1"></i>Guardar
            </button>
            <button class="btn btn-sm btn-outline-secondary dep-test" data-id="${e.id}" data-codigo="${g(e.codigo)}"
              ${e.email?``:`disabled`} title="${e.email?`Enviar correo de prueba`:`CargÃ¡ un correo primero`}">
              <i class="bi bi-send me-1"></i>Probar
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function qn(e,t){let n=Un.signal;e.querySelectorAll(`.dep-save`).forEach(r=>r.addEventListener(`click`,()=>Jn(e,t,r),{signal:n})),e.querySelectorAll(`.dep-test`).forEach(t=>t.addEventListener(`click`,()=>Yn(e,t),{signal:n}))}async function Jn(e,n,r){let i=r.closest(`.dep-card`),a=i.querySelector(`.dep-nombre`).value.trim(),o=i.querySelector(`.dep-email`).value.trim(),s=i.querySelector(`.dep-resp-nombre`).value.trim(),c=i.querySelector(`.dep-resp-email`).value.trim(),l=i.querySelector(`.dep-activo`).checked;if(!a){t.show(`El nombre es obligatorio`,`error`);return}if(o&&!Hn.test(o)){t.show(`El correo institucional no es vÃ¡lido`,`error`);return}if(c&&!Hn.test(c)){t.show(`El correo del responsable no es vÃ¡lido`,`error`);return}let u=r.innerHTML;r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{let i=await Bn(r.dataset.id,{nombre:a,email:o,activo:l,responsable_nombre:s,responsable_email:c}),u=n.findIndex(e=>e.id===i.id);u>=0&&(n[u]=i),t.show(`${i.codigo} actualizado`,`success`),Gn(e,n)}catch(e){t.show(`Error: ${e.message}`,`error`),r.disabled=!1,r.innerHTML=u}}async function Yn(e,n){let r=n.closest(`.dep-card`).querySelector(`.dep-email`).value.trim();if(!r||!Hn.test(r)){t.show(`CargÃ¡ un correo vÃ¡lido antes de probar`,`error`);return}let i=n.innerHTML;n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{await Vn(r,n.dataset.codigo),t.show(`Correo de prueba enviado a ${r}`,`success`)}catch(e){t.show(`No se pudo enviar: ${e.message}`,`error`)}finally{n.disabled=!1,n.innerHTML=i}}function Xn(){h.register(`departamentos`,e=>Wn(e))}async function Zn(){let{data:e,error:t}=await r.from(`campanias_periodo`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw t;return e??[]}async function Qn(e){let{data:t,error:n}=await r.from(`campanias_periodo`).insert(e).select().single();if(n)throw n;return t}async function $n(e,t){let{data:n,error:i}=await r.from(`campanias_periodo`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return n}async function er(e){return $n(e,{activo:!1})}async function tr(e){let{data:t,error:n}=await r.rpc(`fn_preview_campania`,{p_id:e});if(n)throw n;return t}async function nr(e){let{data:t,error:n}=await r.rpc(`fn_activar_campania`,{p_id:e});if(n)throw n;return t}async function rr(e,t=null){let{data:n,error:i}=await r.rpc(`fn_encolar_campania`,{p_campania_id:e,p_limite:t});if(i)throw i;return n}var V={campanias:[],seleccionada:null,preview:null,cargando:!1},ir={inscripcion:`Inscripción`,reinscripcion:`Reinscripción`};async function ar(e){await H(e)}async function H(e){try{or(e),V.campanias=await Zn(),cr(e)}catch(t){sr(e,t.message)}}function or(e){e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <h1 class="h3 fw-bold mb-4">Períodos / Campañas</h1>
      <div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>
    </div>`}function sr(e,t){e.innerHTML=`
    <div class="container py-5 text-center">
      <div class="alert alert-danger border-0 shadow-sm p-4 rounded-3">
        <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
        <h4 class="fw-bold">Error al cargar campañas</h4>
        <p>${U(t)}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-retry">Reintentar</button>
      </div>
    </div>`,document.getElementById(`btn-retry`)?.addEventListener(`click`,()=>ar(e))}function cr(e){let t=V.campanias.find(e=>e.id===V.seleccionada)||null;e.innerHTML=`
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
          ${lr()}
        </div>
        <div class="col-12 col-lg-5">
          ${ur()}
          ${t?dr(t):``}
        </div>
      </div>
    </div>`,fr(e)}function lr(){return V.campanias.length===0?`<div class="card border-0 shadow-sm rounded-3"><div class="card-body text-body-secondary text-center py-5">
      <i class="bi bi-megaphone fs-1 d-block mb-2 opacity-50"></i>No hay campañas. Creá una a la derecha.</div></div>`:`<div class="card border-0 shadow-sm rounded-3 overflow-hidden">
    <div class="list-group list-group-flush">${V.campanias.map(e=>{let t=e.activo,n=e.id===V.seleccionada;return`
      <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2 ${n?`active`:``}" data-sel="${e.id}">
        <span class="text-truncate">
          <span class="fw-semibold">${U(e.nombre)}</span>
          <span class="badge text-bg-secondary ms-1">${ir[e.accion]||e.accion} ${U(e.tipo)}</span>
          <br><small class="${n?``:`text-body-secondary`}">${U(e.fecha_inicio)} → ${U(e.fecha_fin)}</small>
        </span>
        <span class="badge rounded-pill ${t?`text-bg-success`:`text-bg-light`}">${t?`Activa`:`Inactiva`}</span>
      </button>`}).join(``)}</div></div>`}function ur(){return`
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
    </div>`}function dr(e){let t=V.preview,n;if(V.cargando)n=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>`;else if(!t)n=`<p class="text-body-secondary small mb-0">Previsualizá la audiencia antes de activar.</p>`;else if(t.accion===`inscripcion`){let e=t.primer_contacto+t.recuperacion>t.cupo_disponible;n=`
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
    </div>`}function fr(e){e.querySelectorAll(`[data-sel]`).forEach(t=>t.addEventListener(`click`,()=>{V.seleccionada=t.dataset.sel,V.preview=null,cr(e)})),e.querySelector(`#form-campania`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=new FormData(t.target);try{V.seleccionada=(await Qn({nombre:n.get(`nombre`),accion:n.get(`accion`),tipo:n.get(`tipo`),fecha_inicio:n.get(`fecha_inicio`),fecha_fin:n.get(`fecha_fin`)})).id,V.preview=null,await H(e)}catch(e){alert(`Error al crear campaña: ${e.message}`)}}),e.querySelector(`#btn-preview`)?.addEventListener(`click`,async()=>{V.cargando=!0,cr(e);try{V.preview=await tr(V.seleccionada)}catch(e){alert(`Error en preview: ${e.message}`)}finally{V.cargando=!1,cr(e)}}),e.querySelector(`#btn-activar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto materializa la audiencia deduplicada (no envía WhatsApps). ¿Continuar?`))try{let t=await nr(V.seleccionada);alert(`Campaña activada. Audiencia materializada: ${t.materializados} contacto(s).`),V.preview=null,await H(e)}catch(e){alert(`Error al activar: ${e.message}`)}}),e.querySelector(`#btn-encolar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto mueve una tanda a la cola de envío (respeta opt-out y tope diario). Los mensajes se despachan con ritmo anti-ban solo si el gateway está activo. ¿Continuar?`))try{let t=await rr(V.seleccionada);alert(`Encolados: ${t.encolados}. Tope hoy: ${t.cap_hoy} · Enviados hoy: ${t.enviados_hoy} · Restante: ${t.restante_tras_encolar}.`),await H(e)}catch(e){alert(`Error al encolar: ${e.message}`)}}),e.querySelector(`#btn-desactivar`)?.addEventListener(`click`,async()=>{try{await er(V.seleccionada),await H(e)}catch(e){alert(`Error al desactivar: ${e.message}`)}})}function U(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function pr(){h.register(`campanias`,ar)}async function mr(){let{data:e,error:t}=await r.from(`hermes_whatsapp_config`).select(`*`).eq(`activo`,!0).single();if(t&&t.code!==`PGRST116`)throw t;return e||null}async function hr(e){let t=await mr();if(!t)throw Error(`No existe configuracion activa`);let{data:n,error:i}=await r.from(`hermes_whatsapp_config`).update(e).eq(`id`,t.id).select().single();if(i)throw i;return n}var W={config:null,edit:{},cargando:!0};async function gr(e){try{W.cargando=!0,W.config=await mr(),G(e)}catch(t){vr(e,t.message)}finally{W.cargando=!1}}async function _r(e){if(Object.keys(W.edit).length)try{W.cargando=!0,W.config=await hr(W.edit),W.edit={},G(e)}catch(t){vr(e,t.message)}finally{W.cargando=!1}}function G(e){let{config:t,edit:n,cargando:r}=W;if(e.innerHTML=`
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
  `,t&&!r){let t=e.querySelector(`#inp_numero_wid`),n=e.querySelector(`#inp_numero_nombre`),r=e.querySelector(`#inp_cap_diario`),i=e.querySelector(`#inp_warmup_desde`),a=e.querySelector(`#btn_guardar`);t&&t.addEventListener(`change`,t=>{W.edit.numero_wid=t.target.value||null,G(e)}),n&&n.addEventListener(`change`,t=>{W.edit.numero_nombre=t.target.value||null,G(e)}),r&&r.addEventListener(`change`,t=>{W.edit.cap_diario=parseInt(t.target.value)||null,G(e)}),i&&i.addEventListener(`change`,t=>{W.edit.warmup_desde=t.target.value||null,G(e)}),a&&a.addEventListener(`click`,()=>_r(e))}}function vr(e,t){e.innerHTML=`<div style="color: red; padding: 20px;">Error: ${t}</div>`}function yr(){h.register(`gateway-config`,gr)}var br=[`creado`,`corriendo`,`pausado`,`finalizado`,`error`];async function xr(e){let{data:t,error:n}=await r.from(`sim_runs`).select(`*`).eq(`id`,e).single();if(n)throw n;return t}async function Sr(e,t){if(!br.includes(t))throw Error(`estado inválido: "${t}". Debe ser uno de: ${br.join(`, `)}`);let{data:n,error:i}=await r.from(`sim_runs`).update({estado:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(i)throw i;return n}async function Cr(e,t){if(!(t>0))throw Error(`nuevaVelocidad debe ser mayor que 0`);let{data:n,error:i}=await r.from(`sim_runs`).update({velocidad:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(i)throw i;return n}async function wr(e,t){let{data:n,error:i}=await r.from(`sim_runs`).update({fecha_actual_virtual:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(i)throw i;return n}async function Tr(e){let{data:t,error:n}=await r.from(`sim_calendario`).select(`*`).eq(`run_id`,e).order(`fecha_inicio`,{ascending:!0});if(n)throw n;return t||[]}async function Er(e,t){let n=new Date(t),i=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),0,0,0)),a=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),23,59,59,999)),{data:o,error:s}=await r.from(`sim_calendario`).select(`*`).eq(`run_id`,e).gte(`fecha_inicio`,i.toISOString()).lte(`fecha_inicio`,a.toISOString()).order(`fecha_inicio`,{ascending:!0});if(s)throw s;return o||[]}async function Dr(e,{departamento:t=null}={}){let n=r.from(`sim_log`).select(`*`).eq(`run_id`,e);t&&(n=n.eq(`departamento`,t));let{data:i,error:a}=await n.order(`created_at`,{ascending:!1});if(a)throw a;return i||[]}async function Or(e){let{data:t,error:n}=await r.from(`sim_outbox`).select(`*`).eq(`run_id`,e).order(`created_at`,{ascending:!1});if(n)throw n;return t||[]}async function kr({run_id:e,fecha_simulada:t,eventos:n}={}){if(!e)throw Error(`run_id es requerido para invocar simulador-tick`);if(!t)throw Error(`fecha_simulada es requerida para invocar simulador-tick`);let{data:i,error:a}=await r.functions.invoke(`simulador-tick`,{body:{run_id:e,fecha_simulada:t,eventos:n||[]}});if(a)throw Error(a.message||`Error al invocar simulador-tick`);if(i?.error)throw Error(i.error);return i}function Ar({velocidad:e,onTick:t}){if(typeof e!=`number`||!(e>0))throw Error(`velocidad debe ser un número mayor que 0 (segundos reales por día simulado)`);if(typeof t!=`function`)throw Error(`onTick debe ser una función`);let n=e,r=`pausado`,i=null;function a(){i!=null&&(clearInterval(i),i=null)}function o(){a(),r===`corriendo`&&(i=setInterval(()=>{t()},n*1e3))}function s(){r!==`corriendo`&&(r=`corriendo`,o())}function c(){r=`pausado`,a()}function l(){r!==`corriendo`&&(r=`corriendo`,o())}function u(){r=`pausado`,a()}function d(e){if(typeof e!=`number`||!(e>0))throw Error(`nuevaVelocidad debe ser un número mayor que 0`);n=e,r===`corriendo`&&o()}function f(){return r}function p(){return n}return{start:s,pause:c,resume:l,stop:u,cambiarVelocidad:d,getEstado:f,getVelocidad:p}}var jr=Object.freeze({creado:Object.freeze({label:`Creado`,color:`secondary`}),corriendo:Object.freeze({label:`Corriendo`,color:`success`}),pausado:Object.freeze({label:`Pausado`,color:`warning`}),finalizado:Object.freeze({label:`Finalizado`,color:`primary`}),error:Object.freeze({label:`Error`,color:`danger`})}),Mr=Object.freeze({pendiente:Object.freeze({label:`Pendiente`,color:`secondary`}),enviado:Object.freeze({label:`Enviado`,color:`success`}),fallido:Object.freeze({label:`Fallido`,color:`danger`})});function Nr(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?`—`:t.toLocaleDateString(`es-ES`,{year:`numeric`,month:`long`,day:`numeric`})}function Pr(e){if(!e?.fecha_inicio_virtual||!e?.fecha_fin_virtual||!e?.fecha_actual_virtual)return 0;let t=new Date(e.fecha_inicio_virtual).getTime(),n=new Date(e.fecha_fin_virtual).getTime(),r=new Date(e.fecha_actual_virtual).getTime();if(Number.isNaN(t)||Number.isNaN(n)||Number.isNaN(r)||n<=t)return 0;let i=(r-t)/(n-t)*100;return Math.max(0,Math.min(100,Math.round(i)))}function Fr(e){return jr[e]||{label:e,color:`secondary`}}function Ir(e){return Mr[e]||{label:e,color:`secondary`}}function Lr(e){let t={};for(let n of e||[])n?.fecha_inicio&&(t[n.fecha_inicio]||(t[n.fecha_inicio]=[]),t[n.fecha_inicio].push(n));return t}var Rr=`00000000-0000-0000-0000-000000000001`,zr=[1,2,5,10,30,60],Br=1440*60*1e3,K={run:null,cargando:!1,procesandoTick:!1},q=null,J=null;function Vr(){J?.stop(),J=null}async function Hr(e){if(!(!K.run||K.procesandoTick)){K.procesandoTick=!0;try{let n=new Date(K.run.fecha_actual_virtual),r=K.run.fecha_fin_virtual?new Date(K.run.fecha_fin_virtual):null,i=new Date(n.getTime()+Br);if(r&&i.getTime()>=r.getTime()){Vr(),K.run=await Sr(K.run.id,`finalizado`),t.show(`Simulación finalizada: se alcanzó la fecha de fin`,`success`),Y(e);return}let a=i.toISOString(),o=await Er(K.run.id,a);o.length>0&&await kr({run_id:K.run.id,fecha_simulada:a,eventos:o}),K.run=await wr(K.run.id,a),Y(e)}catch(e){console.error(`[panelControlView] Error al avanzar el reloj:`,e.message),t.show(`Error al procesar el tick: ${e.message}`,`error`)}finally{K.procesandoTick=!1}}}function Ur(e){return J||(J=Ar({velocidad:K.run?.velocidad||10,onTick:()=>Hr(e)}),J)}function Y(e){q?.signal.aborted||(qr(e),Jr(e))}async function Wr(e,t={}){q?.abort(),q=new AbortController;try{K.cargando=!0,Gr(e),K.run=await xr(t.runId||Rr).catch(()=>null),K.cargando=!1,qr(e),Jr(e)}catch(t){console.error(`[panelControlView] Error:`,t.message),Kr(e,t.message)}return{teardown:()=>{q?.abort(),Vr()}}}function Gr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function Kr(e,t){e.innerHTML=`
    <div class="alert alert-danger m-4">
      <i class="bi bi-exclamation-triangle"></i> Error: ${g(t)}
    </div>
  `}function qr(e){let t=K.run,n=t?Fr(t.estado):null,r=t?Pr(t):0,i=t?.velocidad||10;e.innerHTML=`
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

      ${t?`
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">${g(t.nombre)}</h5>
                <span class="badge bg-${n.color}">${n.label}</span>
              </div>
              <div class="text-end">
                <small class="text-muted d-block">Fecha simulada</small>
                <strong id="fechaSimuladaActual">${Nr(t.fecha_actual_virtual)}</strong>
              </div>
            </div>

            <div class="progress mb-3" style="height: 10px;">
              <div class="progress-bar" style="width: ${r}%;"></div>
            </div>
            <small class="text-muted">${r}% completado</small>

            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-success btn-sm" id="btnIniciar" ${t.estado===`corriendo`?`disabled`:``}>
                <i class="bi bi-play-fill me-1"></i>Iniciar
              </button>
              <button class="btn btn-warning btn-sm" id="btnPausar" ${t.estado===`corriendo`?``:`disabled`}>
                <i class="bi bi-pause-fill me-1"></i>Pausar
              </button>
              <button class="btn btn-outline-secondary btn-sm" id="btnReanudar" ${t.estado===`pausado`?``:`disabled`}>
                <i class="bi bi-arrow-clockwise me-1"></i>Reanudar
              </button>

              <select class="form-select form-select-sm" id="selectVelocidad" style="max-width: 160px;">
                ${zr.map(e=>`<option value="${e}" ${i===e?`selected`:``}>${e}s / día simulado</option>`).join(``)}
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
  `}function Jr(e){let n=q.signal;e.querySelector(`#btnCrearRun`)?.addEventListener(`click`,async()=>{try{K.run=await xr(Rr),t.show(`Corrida demo cargada`,`success`),Y(e)}catch(e){t.show(`Error al crear la corrida: ${e.message}`,`error`)}},{signal:n}),e.querySelector(`#btnIniciar`)?.addEventListener(`click`,async()=>{try{K.run=await Sr(K.run.id,`corriendo`),Ur(e).start(),Y(e)}catch(e){t.show(`Error al iniciar: ${e.message}`,`error`)}},{signal:n}),e.querySelector(`#btnPausar`)?.addEventListener(`click`,async()=>{try{J?.pause(),K.run=await Sr(K.run.id,`pausado`),Y(e)}catch(e){t.show(`Error al pausar: ${e.message}`,`error`)}},{signal:n}),e.querySelector(`#btnReanudar`)?.addEventListener(`click`,async()=>{try{K.run=await Sr(K.run.id,`corriendo`),Ur(e).resume(),Y(e)}catch(e){t.show(`Error al reanudar: ${e.message}`,`error`)}},{signal:n}),e.querySelector(`#selectVelocidad`)?.addEventListener(`change`,async e=>{let n=parseInt(e.target.value,10);try{K.run=await Cr(K.run.id,n),J?.cambiarVelocidad(n),t.show(`Velocidad actualizada: ${n}s / día simulado`,`success`)}catch(e){t.show(`Error al cambiar velocidad: ${e.message}`,`error`)}},{signal:n})}var Yr=`00000000-0000-0000-0000-000000000001`,X={eventos:[],cargando:!1,runId:Yr},Xr=null;async function Zr(e,t={}){Xr?.abort(),Xr=new AbortController,X.runId=t.runId||Yr;try{X.cargando=!0,Qr(e),X.eventos=await Tr(X.runId),X.cargando=!1,ti(e)}catch(t){console.error(`[calendarioRunView] Error:`,t.message),$r(e,t.message)}return{teardown:()=>{Xr?.abort()}}}function Qr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function $r(e,t){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${g(t)}</div>`}var ei={programado:`secondary`,en_curso:`info`,completado:`success`,cancelado:`danger`};function ti(e){let t=Lr(X.eventos),n=Object.keys(t).sort();e.innerHTML=`
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
          <h6 class="text-muted mb-2">${Nr(e)}${t[e].length>1?` <span class="badge bg-info">${t[e].length} eventos concurrentes</span>`:``}</h6>
          ${t[e].map(ni).join(``)}
        </div>`).join(``)}
    </div>
  `}function ni(e){let t=ei[e.estado]||`secondary`;return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3 d-flex justify-content-between align-items-center">
        <div>
          <strong>${g(e.titulo)}</strong>
          <p class="text-muted small mb-0">${g(e.descripcion||``)}</p>
          <span class="text-muted small"><i class="bi bi-building"></i> ${g(e.departamento_responsable)} · ${g(e.categoria)}</span>
        </div>
        <span class="badge bg-${t}">${g(e.estado)}</span>
      </div>
    </div>
  `}var ri=`00000000-0000-0000-0000-000000000001`,ii=[`DIR`,`ACM`,`ADM`,`FIN`,`LOG`,`COM`,`TECNICO`],Z={entradas:[],cargando:!1,filtroDepartamento:`todos`,runId:ri},Q=null,ai=null;async function oi(e){let t=Z.filtroDepartamento===`todos`?{}:{departamento:Z.filtroDepartamento};Z.entradas=await Dr(Z.runId,t),di(e),pi(e)}function si(e){r?.channel&&(ai?.unsubscribe?.(),ai=r.channel(`simulador:sim_log:${Z.runId}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`sim_log`},async t=>{if(!Q?.signal.aborted&&t?.new?.run_id===Z.runId)try{await oi(e)}catch(e){console.error(`[logView] Realtime refresh error:`,e.message)}}).subscribe())}async function ci(e,t={}){Q?.abort(),Q=new AbortController,Z.runId=t.runId||ri;try{Z.cargando=!0,li(e),await oi(e),si(e)}catch(t){console.error(`[logView] Error:`,t.message),ui(e,t.message)}return{teardown:()=>{Q?.abort(),ai?.unsubscribe?.(),ai=null}}}function li(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function ui(e,t){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${g(t)}</div>`}function di(e){e.innerHTML=`
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
          ${ii.map(e=>`<option value="${e}" ${Z.filtroDepartamento===e?`selected`:``}>${e}</option>`).join(``)}
        </select>
      </div>

      <div id="logList">
        ${Z.entradas.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Sin entradas de log todavía</div>`:Z.entradas.map(fi).join(``)}
      </div>
    </div>
  `}function fi(e){return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-secondary me-2">${g(e.departamento)}</span>
            <strong>${g(e.agente)}</strong>
            <span class="text-muted"> — ${g(e.accion)}</span>
          </div>
          <small class="text-muted">${new Date(e.created_at).toLocaleString(`es-ES`)}</small>
        </div>
      </div>
    </div>
  `}function pi(e){let t=Q.signal;e.querySelector(`#filtroDepartamentoLog`)?.addEventListener(`change`,async t=>{Z.filtroDepartamento=t.target.value;try{await oi(e)}catch(e){console.error(`[logView] Error al filtrar:`,e.message)}},{signal:t})}var mi=`00000000-0000-0000-0000-000000000001`,$={mensajes:[],cargando:!1,runId:mi},hi=null;async function gi(e,t={}){hi?.abort(),hi=new AbortController,$.runId=t.runId||mi;try{$.cargando=!0,_i(e),$.mensajes=await Or($.runId),$.cargando=!1,yi(e)}catch(t){console.error(`[outboxView] Error:`,t.message),vi(e,t.message)}return{teardown:()=>{hi?.abort()}}}function _i(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function vi(e,t){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${g(t)}</div>`}function yi(e){e.innerHTML=`
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
                   ${$.mensajes.map(bi).join(``)}
                 </tbody>
               </table>
             </div>`}
    </div>
  `}function bi(e){let t=Ir(e.estado);return`
    <tr>
      <td><span class="badge bg-info">${g(e.canal)}</span></td>
      <td class="text-muted">${g(e.destinatario_original)}</td>
      <td><strong>${g(e.destinatario_redirigido)}</strong></td>
      <td><span class="badge bg-${t.color}">${t.label}</span></td>
      <td><small class="text-muted">${new Date(e.created_at).toLocaleString(`es-ES`)}</small></td>
    </tr>
  `}function xi(){try{let e=document.createElement(`canvas`);return!!(e.getContext(`webgl2`)||e.getContext(`webgl`))}catch{return!1}}function Si(e){if(e!==void 0)try{return!!e()}catch{return!1}return xi()}async function Ci(e){if(Si())try{let t=await n(()=>import(`./three-CGQ8LZer.js`).then(e=>e.n),__vite__mapDeps([0,1])),{renderSalaTrabajo3dView:r}=await n(async()=>{let{renderSalaTrabajo3dView:e}=await import(`./salaTrabajo3dView-CdAdziXY.js`);return{renderSalaTrabajo3dView:e}},__vite__mapDeps([2,3,0,1,4]));return await r(e,{},t)}catch(e){console.warn(`[salaTrabajo3DEntryView] 3D falló, cayendo a 2D:`,e.message)}let{renderSalaTrabajoView:t}=await n(async()=>{let{renderSalaTrabajoView:e}=await import(`./salaTrabajoView-DvyujooA.js`);return{renderSalaTrabajoView:e}},__vite__mapDeps([5,3,6,4]));return t(e,{modoFallback:!0})}function wi(){h.register(`simulador-sala-trabajo`,e=>Ci(e)),h.register(`simulador-panel-control`,e=>Wr(e)),h.register(`simulador-calendario`,e=>Zr(e)),h.register(`simulador-log`,e=>ci(e)),h.register(`simulador-outbox`,e=>gi(e))}var Ti=[An,Xn,c,re,l,ae,de,ie,o,s,le,i,fe,d,u,ce,te,a,pe,se,ee,ne,pr,yr,oe,wi];export{xr as a,Dr as i,Nr as n,et as o,Fr as r,Ti as t};