import{r as e}from"./AppToast-BfaQtGFE.js";import{i as t}from"./supabase-Cgh_dhNB.js";import{t as n}from"./tareasView-D80l3P8r.js";function r(e){if(!e||!e.student_id||!e.jurado_id)return!1;for(let t of[`afinacion`,`ritmo`,`postura`,`musicalidad`]){let n=e[t];if(n==null||!Number.isInteger(n)||n<1||n>5)return!1}return!0}var i=class{static toPersistence(e){return{c1:e.afinacion===void 0?null:Number(e.afinacion),c2:e.ritmo===void 0?null:Number(e.ritmo),c3:e.postura===void 0?null:Number(e.postura),c4:e.musicalidad===void 0?null:Number(e.musicalidad),c5:null,c6:null,c7:null,c8:null}}static toDomain(e){return{afinacion:e.c1!==null&&e.c1!==void 0?Number(e.c1):0,ritmo:e.c2!==null&&e.c2!==void 0?Number(e.c2):0,postura:e.c3!==null&&e.c3!==void 0?Number(e.c3):0,musicalidad:e.c4!==null&&e.c4!==void 0?Number(e.c4):0}}},a=e({getAllEvaluations:()=>p,getAssignedStudents:()=>l,getCurrentUser:()=>o,getEvaluationsByJurado:()=>u,getRepertoire:()=>c,getSections:()=>s,getStudentResults:()=>f,saveEvaluation:()=>d});async function o(){let{data:{user:e},error:n}=await t.auth.getUser();if(n)throw Error(`auth failed: ${n.message}`);let{data:r}=await t.rpc(`get_user_role`);return{id:e.id,email:e.email,role:r}}async function s(){let{data:e,error:n}=await t.from(`sections`).select(`*`).order(`name`);if(n)throw Error(`getSections failed: ${n.message}`);return e}async function c(e){let{data:n,error:r}=await t.from(`repertoire_items`).select(`*`).eq(`section_id`,e).order(`name`);if(r)throw Error(`getRepertoire failed: ${r.message}`);return n}async function l(e){let{data:n,error:r}=await t.from(`students`).select(`*`).order(`full_name`);if(r)throw Error(`getAssignedStudents failed: ${r.message}`);return n}async function u(e){let{data:n,error:r}=await t.from(`evaluations`).select(`*`).eq(`jurado_id`,e).order(`created_at`);if(r)throw Error(`getEvaluationsByJurado failed: ${r.message}`);return n}async function d(e){let{data:n,error:r}=await t.from(`evaluations`).upsert(e,{onConflict:`student_id,jurado_id`}).select().single();if(r)throw Error(`saveEvaluation failed: ${r.message}`);return n}async function f(){let{data:e,error:n}=await t.from(`student_results`).select(`*`);if(n)throw Error(`getStudentResults failed: ${n.message}`);return e}async function p(){let{data:e,error:n}=await t.from(`evaluations`).select(`*, students(full_name), sections(name)`).order(`created_at`,{ascending:!1});if(n)throw Error(`getAllEvaluations failed: ${n.message}`);return e}var m=a,h={getCurrentUser:m.getCurrentUser,getSections:m.getSections,getRepertoire:m.getRepertoire,getAssignedStudents:m.getAssignedStudents,getEvaluationsByJurado:m.getEvaluationsByJurado,saveEvaluation:m.saveEvaluation,getStudentResults:m.getStudentResults,getAllEvaluations:m.getAllEvaluations};function g(e,t){let n={students:[],evaluations:new Map,selectedStudentId:null,formState:{afinacion:null,ritmo:null,postura:null,musicalidad:null},saving:!1},a=()=>{e.innerHTML=`
      <div class="row">
        <div class="col-md-5">
          <div class="card">
            <div class="card-header"><h5>Estudiantes</h5></div>
            <div class="list-group list-group-flush" id="student-list"></div>
          </div>
        </div>
        <div class="col-md-7">
          <div class="card">
            <div class="card-header"><h5>Evaluación</h5></div>
            <div class="card-body" id="evaluation-form">
              <div class="text-muted">Selecciona un estudiante para evaluar</div>
            </div>
          </div>
        </div>
      </div>`,o()},o=()=>{let t=e.querySelector(`#student-list`);t.innerHTML=n.students.map(e=>{let t=n.evaluations.get(e.id),r=t?i.toDomain(t):null,a=r&&r.afinacion!==0?`<span class="badge bg-success ms-2">✓</span>`:`<span class="badge bg-secondary ms-2">—</span>`;return`<button class="list-group-item list-group-item-action ${n.selectedStudentId===e.id?`active`:``}" data-student-id="${e.id}">
        <strong>${e.full_name}</strong><small class="text-muted ms-2">${e.section_id}</small>${a}
      </button>`}).join(``),t.querySelectorAll(`[data-student-id]`).forEach(e=>{e.addEventListener(`click`,()=>c(e.dataset.studentId))})},s=()=>{let a=e.querySelector(`#evaluation-form`),c=[{key:`postura`,label:`Postura y Técnica (30%)`},{key:`afinacion`,label:`Afinación (30%)`},{key:`ritmo`,label:`Ritmo (20%)`},{key:`musicalidad`,label:`Musicalidad (20%)`}],l=r({...n.formState,student_id:n.selectedStudentId,jurado_id:`placeholder`}),u=Number(n.formState.afinacion)||0,d=Number(n.formState.ritmo)||0,f=Number(n.formState.postura)||0,p=Number(n.formState.musicalidad)||0,m=f*.3+u*.3+d*.2+p*.2,h=`INCOMPLETO`,g=`bg-secondary`;l&&(m>=4?(h=`PROMOVIDO`,g=`bg-success`):m>=2.8?(h=`PERMANECE EN NIVEL ACTUAL`,g=`bg-warning text-dark`):(h=`NO PROMOVIDO`,g=`bg-danger`));let _={1:`1 - Inicial`,2:`2 - En Desarrollo`,3:`3 - Competente`,4:`4 - Sobresaliente`,5:`5 - Excepcional`};a.innerHTML=`
      <form id="eval-form">
        ${c.map(e=>`
          <div class="mb-3 row align-items-center">
            <label class="col-sm-5 col-form-label fw-semibold">${e.label}</label>
            <div class="col-sm-7">
              <select class="form-select" data-key="${e.key}">
                <option value="">— Seleccionar nota —</option>
                ${[1,2,3,4,5].map(t=>`<option value="${t}" ${n.formState[e.key]===t?`selected`:``}>${_[t]}</option>`).join(``)}
              </select>
            </div>
          </div>`).join(``)}
        
         <div class="my-4 p-3 bg-light rounded border border-secondary-subtle">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-bold text-secondary">Promedio Ponderado:</span>
            <span class="fs-4 fw-bold text-primary">${l?m.toFixed(2):`—`} / 5.00</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold text-secondary">Dictamen Sugerido:</span>
            <span class="badge ${g} fs-6 px-3 py-2">${h}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 py-2 fs-5" ${l?``:`disabled`}>
          ${n.saving?`Guardando...`:`Guardar Evaluación`}
        </button>
      </form>`,a.querySelectorAll(`[data-key]`).forEach(e=>{e.addEventListener(`change`,()=>{n.formState[e.dataset.key]=e.value?Number(e.value):null,s()})}),a.querySelector(`#eval-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),!n.saving){n.saving=!0,s();try{let e=i.toPersistence(n.formState);await t.saveEvaluation({student_id:n.selectedStudentId,jurado_id:`usr-jurado-1`,...e}),n.evaluations.set(n.selectedStudentId,{student_id:n.selectedStudentId,jurado_id:`usr-jurado-1`,...e}),o()}catch(e){alert(`Error al guardar: `+e.message)}finally{n.saving=!1,s()}}})},c=e=>{n.selectedStudentId=e;let t=n.evaluations.get(e);n.formState=t?i.toDomain(t):{afinacion:null,ritmo:null,postura:null,musicalidad:null},o(),s()};return(async()=>{try{let[e,r]=await Promise.all([t.getAssignedStudents(`usr-jurado-1`),t.getEvaluationsByJurado(`usr-jurado-1`)]);n.students=e,r.forEach(e=>n.evaluations.set(e.student_id,e)),a()}catch(t){e.innerHTML=`<div class="alert alert-danger">Error: ${t.message}</div>`}})(),{destroy:()=>{e.innerHTML=``}}}function _(e,t){let n=t=>{e.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0">Resultados de Audiciones</h4>
        <button class="btn btn-outline-secondary btn-sm" id="export-csv">Exportar CSV</button>
      </div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead><tr>
            <th>Estudiante</th>
            <th>Sección</th>
            <th>Promedio</th>
            <th>Grupo</th>
          </tr></thead>
          <tbody>
            ${t.map(e=>{let t=e.group===`A`?`success`:e.group===`B`?`primary`:e.group===`C`?`warning`:`danger`;return`<tr>
                <td>${e.student_name}</td>
                <td>${e.section_name}</td>
                <td>${e.avg_score===null?`—`:e.avg_score}</td>
                <td><span class="badge bg-${t}">${e.group||`—`}</span></td>
              </tr>`}).join(``)}
          </tbody>
        </table>
      </div>`,e.querySelector(`#export-csv`)?.addEventListener(`click`,()=>{let e=t.map(e=>`${e.student_name}\t${e.section_name}\t${e.avg_score??``}\t${e.group??``}`);navigator.clipboard.writeText([`Estudiante	Sección	Promedio	Grupo`,...e].join(`
`))})};return(async()=>{try{let e=await t.getStudentResults();n(e)}catch(t){e.innerHTML=`<div class="alert alert-danger">Error: ${t.message}</div>`}})(),{destroy:()=>{e.innerHTML=``}}}var v=null;function y(e){let t=document.getElementById(`view-container`);if(!t)return;let r=async r=>{if(v&&v.destroy&&v.destroy(),v=null,r===`#resultados`&&e!==`admin`){window.location.hash=`#evaluacion`;return}if(r===`#tareas`){v={destroy:(await n(t,{hideCalendarBtn:!0}))?.teardown||(()=>{})};return}v=r===`#resultados`?_(t,h):g(t,h)};window.addEventListener(`hashchange`,()=>r(window.location.hash)),r(window.location.hash||`#evaluacion`)}async function b(e){let t=document.getElementById(`app`);if(!t)return;let n=await h.getSections();t.innerHTML=`
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Audiciones</a>
        <div class="navbar-nav">
          <a class="nav-link" href="#evaluacion">Evaluación</a>
          ${e===`admin`?`<a class="nav-link" href="#resultados">Resultados</a>`:``}
        </div>
      </div>
    </nav>
    <div class="container-fluid mt-3">
      <div class="row">
        <div class="col-md-2">
          <div class="card">
            <div class="card-header">Secciones</div>
            <ul class="list-group list-group-flush">
              ${n.map(e=>`<li class="list-group-item">${e.name}</li>`).join(``)}
              <li class="list-group-item"><a href="#tareas">Tareas institucionales</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-10" id="view-container"></div>
      </div>
    </div>`,y(e)}export{b as mountAudiciones};