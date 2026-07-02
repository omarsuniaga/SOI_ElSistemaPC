import{i as e}from"./AppToast-DNGTRY9B.js";import{i as t}from"./supabase-Dhe7Tlxd.js";import{t as n}from"./tareasView-2XihvmzN.js";function r(e){if(!e||!e.student_id||!e.jurado_id)return!1;for(let t of[`c1`,`c2`,`c3`,`c4`,`c5`,`c6`,`c7`,`c8`]){let n=e[t];if(n==null||!Number.isInteger(n)||n<1||n>4)return!1}return!0}var i=e({getAllEvaluations:()=>f,getAssignedStudents:()=>c,getCurrentUser:()=>a,getEvaluationsByJurado:()=>l,getRepertoire:()=>s,getSections:()=>o,getStudentResults:()=>d,saveEvaluation:()=>u});async function a(){let{data:{user:e},error:n}=await t.auth.getUser();if(n)throw Error(`auth failed: ${n.message}`);let{data:r}=await t.rpc(`get_user_role`);return{id:e.id,email:e.email,role:r}}async function o(){let{data:e,error:n}=await t.from(`sections`).select(`*`).order(`name`);if(n)throw Error(`getSections failed: ${n.message}`);return e}async function s(e){let{data:n,error:r}=await t.from(`repertoire_items`).select(`*`).eq(`section_id`,e).order(`name`);if(r)throw Error(`getRepertoire failed: ${r.message}`);return n}async function c(e){let{data:n,error:r}=await t.from(`students`).select(`*`).order(`full_name`);if(r)throw Error(`getAssignedStudents failed: ${r.message}`);return n}async function l(e){let{data:n,error:r}=await t.from(`evaluations`).select(`*`).eq(`jurado_id`,e).order(`created_at`);if(r)throw Error(`getEvaluationsByJurado failed: ${r.message}`);return n}async function u(e){let{data:n,error:r}=await t.from(`evaluations`).upsert(e,{onConflict:`student_id,jurado_id`}).select().single();if(r)throw Error(`saveEvaluation failed: ${r.message}`);return n}async function d(){let{data:e,error:n}=await t.from(`student_results`).select(`*`);if(n)throw Error(`getStudentResults failed: ${n.message}`);return e}async function f(){let{data:e,error:n}=await t.from(`evaluations`).select(`*, students(full_name), sections(name)`).order(`created_at`,{ascending:!1});if(n)throw Error(`getAllEvaluations failed: ${n.message}`);return e}var p=i,m={getCurrentUser:p.getCurrentUser,getSections:p.getSections,getRepertoire:p.getRepertoire,getAssignedStudents:p.getAssignedStudents,getEvaluationsByJurado:p.getEvaluationsByJurado,saveEvaluation:p.saveEvaluation,getStudentResults:p.getStudentResults,getAllEvaluations:p.getAllEvaluations};function h(e,t){let n={students:[],evaluations:new Map,selectedStudentId:null,formState:{c1:null,c2:null,c3:null,c4:null,c5:null,c6:null,c7:null,c8:null},saving:!1},i=()=>{e.innerHTML=`
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
      </div>`,a()},a=()=>{let t=e.querySelector(`#student-list`);t.innerHTML=n.students.map(e=>{let t=n.evaluations.get(e.id),r=t&&t.c1!==null?`<span class="badge bg-success ms-2">✓</span>`:`<span class="badge bg-secondary ms-2">—</span>`;return`<button class="list-group-item list-group-item-action ${n.selectedStudentId===e.id?`active`:``}" data-student-id="${e.id}">
        <strong>${e.full_name}</strong><small class="text-muted ms-2">${e.section_id}</small>${r}
      </button>`}).join(``),t.querySelectorAll(`[data-student-id]`).forEach(e=>{e.addEventListener(`click`,()=>s(e.dataset.studentId))})},o=()=>{let i=e.querySelector(`#evaluation-form`),s=[{key:`c1`,label:`Afinación General`},{key:`c2`,label:`Ritmo Escala`},{key:`c3`,label:`Sonido`},{key:`c4`,label:`Digitación`},{key:`c5`,label:`Afinación Repertorio`},{key:`c6`,label:`Ritmo Repertorio`},{key:`c7`,label:`Articulación`},{key:`c8`,label:`Lectura`}],c=r({...n.formState,student_id:n.selectedStudentId,jurado_id:`placeholder`});i.innerHTML=`
      <form id="eval-form">
        ${s.map(e=>`
          <div class="mb-2 row">
            <label class="col-sm-4 col-form-label">${e.label}</label>
            <div class="col-sm-8">
              <select class="form-select" data-key="${e.key}">
                <option value="">—</option>
                ${[1,2,3,4].map(t=>`<option value="${t}" ${n.formState[e.key]===t?`selected`:``}>${t}</option>`).join(``)}
              </select>
            </div>
          </div>`).join(``)}
        <button type="submit" class="btn btn-primary w-100" ${c?``:`disabled`}>
          ${n.saving?`Guardando...`:`Guardar Evaluación`}
        </button>
      </form>`,i.querySelectorAll(`[data-key]`).forEach(e=>{e.addEventListener(`change`,()=>{n.formState[e.dataset.key]=e.value?Number(e.value):null,o()})}),i.querySelector(`#eval-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),!n.saving){n.saving=!0,o();try{await t.saveEvaluation({student_id:n.selectedStudentId,jurado_id:`usr-jurado-1`,...n.formState}),n.evaluations.set(n.selectedStudentId,{...n.formState,c1:n.formState.c1}),a()}catch(e){alert(`Error al guardar: `+e.message)}finally{n.saving=!1,o()}}})},s=e=>{n.selectedStudentId=e;let t=n.evaluations.get(e);n.formState=t?{c1:t.c1,c2:t.c2,c3:t.c3,c4:t.c4,c5:t.c5,c6:t.c6,c7:t.c7,c8:t.c8}:{c1:null,c2:null,c3:null,c4:null,c5:null,c6:null,c7:null,c8:null},a(),o()};return(async()=>{try{let[e,r]=await Promise.all([t.getAssignedStudents(`usr-jurado-1`),t.getEvaluationsByJurado(`usr-jurado-1`)]);n.students=e,r.forEach(e=>n.evaluations.set(e.student_id,e)),i()}catch(t){e.innerHTML=`<div class="alert alert-danger">Error: ${t.message}</div>`}})(),{destroy:()=>{e.innerHTML=``}}}function g(e,t){let n=t=>{e.innerHTML=`
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
`))})};return(async()=>{try{let e=await t.getStudentResults();n(e)}catch(t){e.innerHTML=`<div class="alert alert-danger">Error: ${t.message}</div>`}})(),{destroy:()=>{e.innerHTML=``}}}var _=null;function v(e){let t=document.getElementById(`view-container`);if(!t)return;let r=async r=>{if(_&&_.destroy&&_.destroy(),_=null,r===`#resultados`&&e!==`admin`){window.location.hash=`#evaluacion`;return}if(r===`#tareas`){_={destroy:(await n(t,{hideCalendarBtn:!0}))?.teardown||(()=>{})};return}_=r===`#resultados`?g(t,m):h(t,m)};window.addEventListener(`hashchange`,()=>r(window.location.hash)),r(window.location.hash||`#evaluacion`)}async function y(e){let t=document.getElementById(`app`);if(!t)return;let n=await m.getSections();t.innerHTML=`
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
    </div>`,v(e)}export{y as mountAudiciones};