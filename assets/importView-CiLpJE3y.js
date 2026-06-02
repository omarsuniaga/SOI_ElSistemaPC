import{i as e}from"./supabase-BryBf0UA.js";var t={students:{label:`Alumnos/Estudiantes`,description:`Importar estudiantes (tabla: alumnos)`,fields:[{name:`nombre_completo`,type:`string`,required:!0,label:`Nombre completo`},{name:`tlf_alumno`,type:`string`,required:!1,label:`Teléfono del alumno`},{name:`direccion`,type:`string`,required:!1,label:`Dirección`},{name:`fecha_nacimiento`,type:`date`,required:!1,label:`Fecha de nacimiento`},{name:`instrumento_principal`,type:`string`,required:!1,label:`Instrumento principal`},{name:`nivel`,type:`string`,required:!1,label:`Nivel`},{name:`fecha_ingreso`,type:`date`,required:!1,label:`Fecha de ingreso`},{name:`padre_nombre`,type:`string`,required:!1,label:`Nombre del padre`},{name:`madre_nombre`,type:`string`,required:!1,label:`Nombre de la madre`},{name:`representante_nombre`,type:`string`,required:!1,label:`Nombre del representante`},{name:`representante_cedula`,type:`string`,required:!1,label:`Cédula del representante`},{name:`representante_tlf`,type:`string`,required:!1,label:`Teléfono del representante`},{name:`correo_representante`,type:`string`,required:!1,label:`Email del representante`},{name:`contacto_emergencia_nombre`,type:`string`,required:!1,label:`Contacto emergencia (nombre)`},{name:`contacto_emergencia_telefono`,type:`string`,required:!1,label:`Contacto emergencia (teléfono)`},{name:`observaciones_generales`,type:`string`,required:!1,label:`Observaciones`},{name:`activo`,type:`boolean`,required:!1,label:`Activo`,default:!0}],table:`alumnos`,idField:`id`},programas:{label:`Programas`,description:`Programas académicos (tabla: programas)`,fields:[{name:`nombre`,type:`string`,required:!0,label:`Nombre del programa`},{name:`descripcion`,type:`string`,required:!1,label:`Descripción`},{name:`nivel`,type:`string`,required:!1,label:`Nivel`},{name:`duracion_anios`,type:`number`,required:!1,label:`Duración (años)`},{name:`activo`,type:`boolean`,required:!1,label:`Activo`,default:!0}],table:`programas`,idField:`id`},salones:{label:`Salones/Aulas`,description:`Espacios físicos (tabla: salones)`,fields:[{name:`nombre`,type:`string`,required:!0,label:`Nombre del salón`},{name:`codigo_salon`,type:`string`,required:!1,label:`Código`},{name:`ubicacion`,type:`string`,required:!1,label:`Ubicación`},{name:`piso`,type:`number`,required:!1,label:`Piso`},{name:`capacidad`,type:`number`,required:!1,label:`Capacidad`,default:20},{name:`is_active`,type:`boolean`,required:!1,label:`Activo`,default:!0}],table:`salones`,idField:`id`},maestros:{label:`Maestros/Profesores`,description:`Docentes del sistema (tabla: maestros)`,fields:[{name:`nombre_completo`,type:`string`,required:!0,label:`Nombre completo`},{name:`correo`,type:`string`,required:!1,label:`Email (correo)`},{name:`tlf`,type:`string`,required:!1,label:`Teléfono`},{name:`especialidad`,type:`string`,required:!1,label:`Especialidad`},{name:`resena`,type:`string`,required:!1,label:`Biografía (reseña)`},{name:`activo`,type:`boolean`,required:!1,label:`Activo`,default:!0}],table:`maestros`,idField:`id`},clases:{label:`Clases/Cursos`,description:`Clases programadas (tabla: clases)`,fields:[{name:`nombre`,type:`string`,required:!0,label:`Nombre de la clase`},{name:`programa_id`,type:`string`,required:!1,label:`ID del programa (UUID)`},{name:`maestro_principal_id`,type:`string`,required:!1,label:`ID del maestro (UUID)`},{name:`maestro_nombre`,type:`string`,required:!1,label:`Nombre del maestro (lookup)`,virtual:!0},{name:`instrumento`,type:`string`,required:!1,label:`Instrumento`},{name:`tipo_clase`,type:`string`,required:!1,label:`Tipo de clase`},{name:`descripcion`,type:`string`,required:!1,label:`Descripción`},{name:`plan_estudio`,type:`string`,required:!1,label:`Plan de estudio / Nivel`,alias:`nivel`},{name:`capacidad_maxima`,type:`number`,required:!1,label:`Capacidad máxima`,default:20,alias:`capacidad`},{name:`activo`,type:`boolean`,required:!1,label:`Activo`,default:!0}],table:`clases`,idField:`id`},inscripciones:{label:`Inscripciones`,description:`Relación alumno-clase (matrículas)`,fields:[{name:`alumno_id`,type:`string`,required:!0,label:`ID del alumno`},{name:`clase_id`,type:`string`,required:!0,label:`ID de la clase`},{name:`fecha_inscripcion`,type:`date`,required:!1,label:`Fecha de inscripción`},{name:`estado`,type:`select`,required:!1,label:`Estado`,options:[`activo`,`suspendido`,`retirado`],default:`activo`}],table:`clase_alumnos`,idField:`id`},asistencias:{label:`Asistencias`,description:`Registro de asistencia a clases`,fields:[{name:`alumno_id`,type:`string`,required:!0,label:`ID del alumno`},{name:`sesion_id`,type:`string`,required:!0,label:`ID de la sesión`},{name:`estado`,type:`select`,required:!0,label:`Estado (P/A/J)`,options:[`P`,`A`,`J`]},{name:`fecha`,type:`date`,required:!0,label:`Fecha (YYYY-MM-DD)`},{name:`observaciones`,type:`string`,required:!1,label:`Observaciones`}],table:`asistencias`,idField:`id`},progresos:{label:`Calificaciones/Progresos`,description:`Calificaciones de estudiantes`,fields:[{name:`alumno_id`,type:`string`,required:!0,label:`ID del alumno`},{name:`clase_id`,type:`string`,required:!0,label:`ID de la clase`},{name:`tipo_evaluacion`,type:`select`,required:!0,label:`Tipo`,options:[`parcial`,`final`,`continua`]},{name:`calificacion`,type:`number`,required:!1,label:`Calificación (0-5)`},{name:`fecha_evaluacion`,type:`date`,required:!1,label:`Fecha de evaluación`},{name:`observaciones`,type:`string`,required:!1,label:`Observaciones`},{name:`estado`,type:`select`,required:!1,label:`Estado`,options:[`en_progreso`,`completado`,`pendiente`],default:`en_progreso`}],table:`progresos_academicos`,idField:`id`}};function n(){return t}function r(e){let t=e.trim().split(`
`);if(t.length<2)return{headers:[],data:[],error:`Archivo vacío o sin datos`};let n=t[0].split(`,`).map(e=>e.trim()),r=[];for(let e=1;e<t.length;e++){let i=t[e].split(`,`).map(e=>e.trim()),a={};n.forEach((e,t)=>{a[e]=i[t]||``}),r.push(a)}return{headers:n,data:r}}function i(e){try{let t=JSON.parse(e),n=Array.isArray(t)?t:[t];return{headers:n.length>0?Object.keys(n[0]):[],data:n,error:null}}catch(e){return{headers:[],data:[],error:`JSON inválido: ${e.message}`}}}function a(e,t,n){if(e===``||e==null)return null;if(typeof e==`boolean`)return e;switch(t){case`number`:let t=parseFloat(e);return isNaN(t)?null:t;case`boolean`:return typeof e==`string`?e.toLowerCase()===`true`||e===`1`||e===`yes`:!!e;case`select`:return e;default:return e}}async function o(t,n,r){if(t===`clases`&&!r.maestro_principal_id&&n.maestro_nombre){let t=String(n.maestro_nombre).trim(),{data:i}=await e.from(`maestros`).select(`id`).ilike(`nombre_completo`,`%${t}%`).limit(1).maybeSingle();i&&(r.maestro_principal_id=i.id)}}async function s(n,r){let i=t[n];if(!i)throw Error(`Entidad no válida`);let s={success:0,errors:[],total:r.length};for(let t=0;t<r.length;t++){let c=r[t],l={};for(let e of i.fields){if(e.virtual)continue;let t=e.name in c?c[e.name]:e.alias&&e.alias in c?c[e.alias]:void 0;l[e.name]=a(t,e.type,e.options)}await o(n,c,l),l.created_at=new Date().toISOString();let u=null;if(i.table===`alumnos`){if(l.correo_representante){let{data:t,error:n}=await e.from(`alumnos`).select(`id`).eq(`correo_representante`,l.correo_representante).limit(1).maybeSingle();!n&&t&&(u=t)}if(!u&&l.representante_cedula){let{data:t,error:n}=await e.from(`alumnos`).select(`id`).eq(`representante_cedula`,l.representante_cedula).limit(1).maybeSingle();!n&&t&&(u=t)}if(!u&&l.nombre_completo){let{data:t,error:n}=await e.from(`alumnos`).select(`id`).ilike(`nombre_completo`,l.nombre_completo).limit(1).maybeSingle();!n&&t&&(u=t)}}else if(l.correo||l.email){let t=l.correo||l.email,{data:n,error:r}=await e.from(i.table).select(`id`).eq(`correo`,t).limit(1).maybeSingle();!r&&n&&(u=n)}else if(l.nombre){let{data:t,error:n}=await e.from(i.table).select(`id`).eq(`nombre`,l.nombre).limit(1).maybeSingle();!n&&t&&(u=t)}if(!u&&l.nombre_completo){let t=l.nombre_completo.toLowerCase(),{data:n,error:r}=await e.from(i.table).select(`id`).ilike(`nombre_completo`,`%${t}%`).limit(1).maybeSingle();!r&&n&&(u=n)}let d=null;if(u){let{error:t}=await e.from(i.table).update(l).eq(`id`,u.id);d=t}else{let{error:t}=await e.from(i.table).insert(l);d=t}d?(console.error(`Import error:`,d),s.errors.push({row:t+1,error:d.message,data:c})):s.success++}return s}async function c(e,n){let r=t[e];if(!r)throw Error(`Entidad no válida`);let i=[];for(let e=0;e<Math.min(n.length,5);e++){let t=n[e],o={},s=[];for(let e of r.fields){if(e.virtual)continue;let n=e.name in t?t[e.name]:e.alias&&e.alias in t?t[e.alias]:void 0;e.required&&(n==null||n===``)&&s.push(`Falta campo requerido: ${e.label||e.name}`),o[e.name]=a(n,e.type,e.options)}i.push({row:e+1,data:o,issues:s})}return i}var l=null;async function u(e){let t=n();e.innerHTML=`
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-10 mx-auto">
          
          <!-- Header -->
          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-cloud-upload fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Importar Datos</h2>
              <small class="text-muted">Pega tu JSON o CSV para importar al sistema</small>
            </div>
          </div>

          <!-- Paso 1: Seleccionar entidad -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0"><span class="badge bg-primary me-2">1</span>Selecciona el tipo de datos</h5>
            </div>
            <div class="card-body">
              <select class="form-select form-select-lg" id="import-entity-select">
                <option value="">-- Selecciona qué vas a importar --</option>
                ${Object.entries(t).map(([e,t])=>`
                  <option value="${e}">${t.label}</option>
                `).join(``)}
              </select>
              <div id="entity-description" class="mt-2 text-muted"></div>
            </div>
          </div>

          <!-- Paso 2: Estructura -->
          <div class="card shadow-sm mb-4" id="structure-card" style="display: none;">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0"><span class="badge bg-info me-2">2</span>Estructura requerida</h5>
            </div>
            <div class="card-body">
              <div id="structure-info" class="mb-3"></div>
              <button class="btn btn-primary btn-lg w-100" id="btn-open-editor">
                <i class="bi bi-pencil-square me-2"></i>Abrir Editor de Datos
              </button>
            </div>
          </div>

          <!-- Paso 3: Editor de datos -->
          <div class="card shadow-sm mb-4" id="editor-card" style="display: none;">
            <div class="card-header bg-success bg-opacity-10">
              <h5 class="mb-0"><span class="badge bg-success me-2">3</span>Pega aquí tu JSON o CSV</h5>
            </div>
            <div class="card-body">
              <div class="alert alert-secondary d-flex align-items-center">
                <i class="bi bi-info-circle me-2"></i>
                <small>Pega el contenido de tu archivo JSON o CSV directamente en el área de texto.</small>
              </div>
              
              <div class="mb-3">
                <textarea class="form-control font-monospace" id="import-data" rows="12" 
                  placeholder='[
  {
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  {
    "name": "Ana García",
    "email": "ana@email.com"
  }
]'></textarea>
              </div>
              
              <div class="d-flex justify-content-between align-items-center">
                <div id="parse-status" class="text-muted"></div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary" id="preview-btn">
                    <i class="bi bi-eye me-1"></i> Previsualizar
                  </button>
                  <button class="btn btn-success btn-lg" id="execute-import-btn" disabled>
                    <i class="bi bi-cloud-upload me-1"></i> Importar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="card shadow-sm mb-4" id="preview-card" style="display: none;">
            <div class="card-header bg-warning bg-opacity-10">
              <h5 class="mb-0"><i class="bi bi-table me-2"></i>Previsualización (5 primeros)</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm table-bordered table-striped" id="preview-table">
                  <thead class="table-light" id="preview-thead"></thead>
                  <tbody id="preview-tbody"></tbody>
                </table>
              </div>
              <div id="preview-issues" class="mt-2"></div>
            </div>
          </div>

          <!-- Results -->
          <div class="card shadow-sm" id="results-card" style="display: none;">
            <div class="card-header" id="results-header">
              <h5 class="mb-0"><i class="bi bi-check-circle me-2"></i>Resultados de Importación</h5>
            </div>
            <div class="card-body" id="results-content"></div>
          </div>

        </div>
      </div>
    </div>
  `;let a=document.getElementById(`import-entity-select`),o=document.getElementById(`entity-description`),u=document.getElementById(`structure-card`),d=document.getElementById(`structure-info`),f=document.getElementById(`editor-card`),p=document.getElementById(`preview-card`),m=document.getElementById(`results-card`),h=document.getElementById(`import-data`),g=document.getElementById(`parse-status`),_=document.getElementById(`preview-btn`),v=document.getElementById(`execute-import-btn`),y=null,b=null;function x(e){return{students:[{nombre_completo:`Juan Pérez González`,tlf_alumno:`+1 809 555 1234`,direccion:`Av. principal 123, Santo Domingo`,fecha_nacimiento:`2010-05-15`,instrumento_principal:`Guitarra`,nivel:`básico`,fecha_ingreso:`2024-01-15`,padre_nombre:`María Pérez`,madre_nombre:`Carlos Pérez`,representante_nombre:`María Pérez`,representante_cedula:`12345678`,representante_tlf:`+1 809 555 5678`,correo_representante:`maria.perez@email.com`,contacto_emergencia_nombre:`Pedro Pérez`,contacto_emergencia_telefono:`+1 809 555 9999`,observaciones_generales:`Alumno responsable`,activo:!0},{nombre_completo:`Ana García López`,tlf_alumno:`+1 809 555 8888`,direccion:`Calle 45, Sto. Dgo.`,fecha_nacimiento:`2012-03-20`,instrumento_principal:`Piano`,nivel:`intermedio`,representante_nombre:`Carlos García`,representante_cedula:`87654321`,representante_tlf:`+1 809 555 7777`,correo_representante:`carlos.g@email.com`,activo:!0}],programas:[{nombre:`Guitarra Clásica`,descripcion:`Programa de guitarra clásica para principiantes`,nivel:`básico`,duracion_anios:3,activo:!0},{nombre:`Piano Iniciación`,descripcion:`Aprende piano desde cero`,nivel:`inicial`,duracion_anios:2,activo:!0}],salones:[{nombre:`Salón A1`,codigo_salon:`A-101`,ubicacion:`Edificio Principal, Piso 1`,piso:1,capacidad:10,is_active:!0},{nombre:`Sala de Piano`,codigo_salon:`PIANO-01`,ubicacion:`Edificio Principal, Piso 2`,piso:2,capacidad:5,is_active:!0}],maestros:[{nombre_completo:`Carlos Rodríguez`,correo:`carlos.rodriguez@soi.edu`,tlf:`+1 809 555 1111`,especialidad:`Guitarra Clásica`,resena:`Maestro con 15 años de experiencia en guitarra clásica`,activo:!0},{nombre_completo:`María Fernández`,correo:`maria.fernandez@soi.edu`,tlf:`+1 809 555 2222`,especialidad:`Piano`,resena:`Licenciada en Música, especialista en piano clásico`,activo:!0}],clases:[{nombre:`Guitarra Básico A`,instrumento:`Guitarra`,tipo_clase:`grupal`,capacidad_maxima:8,activo:!0},{nombre:`Piano Intermedio`,instrumento:`Piano`,tipo_clase:`individual`,capacidad_maxima:5,activo:!0}],inscripciones:[{alumno_id:`uuid-del-alumno-1`,clase_id:`uuid-de-la-clase-1`,fecha_inscripcion:`2024-01-15`,estado:`activo`}],asistencias:[{alumno_id:`uuid-del-alumno`,sesion_id:`uuid-de-la-sesion`,estado:`P`,fecha:`2024-06-10`}],progresos:[{alumno_id:`uuid-del-alumno`,clase_id:`uuid-de-la-clase`,tipo_evaluacion:`parcial`,calificacion:4.5,fecha_evaluacion:`2024-06-15`,observaciones:`Buen progreso en técnica`,estado:`completado`}]}[e]||[{}]}a.addEventListener(`change`,e=>{l=e.target.value;let n=t[l];if(n){o.textContent=n.description,u.style.display=`block`,f.style.display=`none`,p.style.display=`none`,m.style.display=`none`;let e=n.fields.filter(e=>e.required),t=n.fields.filter(e=>!e.required),r=`<div class="row"><div class="col-md-6">`;r+=`<strong class="text-danger">Campos obligatorios:</strong><br>`,r+=`<code>`+e.map(e=>e.name).join(`</code>, <code>`)+`</code>`,r+=`</div><div class="col-md-6">`,r+=`<strong class="text-muted">Campos opcionales:</strong><br>`,r+=`<small>`+t.map(e=>e.name).join(`, `)+`</small>`,r+=`</div></div>`,r+=`<hr><strong>Ejemplo completo (copiá y pegá para probar):</strong><pre class="mt-2 p-2 bg-dark text-light rounded" style="font-size:11px">`;let i=x(l);r+=JSON.stringify(i,null,2)+`</pre>`,d.innerHTML=r}else o.textContent=``,u.style.display=`none`,f.style.display=`none`}),document.getElementById(`btn-open-editor`).addEventListener(`click`,()=>{t[l],f.style.display=`block`,h.value=``,g.innerHTML=``,p.style.display=`none`,v.disabled=!0,h.focus()}),h.addEventListener(`input`,()=>{let e=h.value.trim();if(g.innerHTML=``,v.disabled=!0,e)if((e.startsWith(`[`)||e.startsWith(`{`))&&e.includes(`:`))try{y=i(e),y.error?g.innerHTML=`<span class="text-danger">❌ ${y.error}</span>`:g.innerHTML=`<span class="text-success">✓ JSON válido - ${y.data.length} registros detectados</span>`}catch(e){g.innerHTML=`<span class="text-danger">❌ Error: ${e.message}</span>`}else y=r(e),y.error?g.innerHTML=`<span class="text-danger">❌ ${y.error}</span>`:g.innerHTML=`<span class="text-success">✓ CSV válido - ${y.data.length} registros detectados</span>`}),_.addEventListener(`click`,async()=>{if(!y||y.error||!y.data){g.innerHTML=`<span class="text-danger">❌ No hay datos válidos</span>`;return}b=await c(l,y.data),S(),p.style.display=`block`,v.disabled=!1}),v.addEventListener(`click`,async()=>{if(!(!y||!y.data)){v.disabled=!0,v.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span> Importando...`;try{let e=await s(l,y.data);m.style.display=`block`;let t=document.getElementById(`results-header`),n=document.getElementById(`results-content`);e.errors.length===0?(t.className=`card-header bg-success bg-opacity-10`,n.innerHTML=`
          <div class="alert alert-success mb-0">
            <h5><i class="bi bi-check-circle-fill me-2"></i>✅ Importación exitosa!</h5>
            <p class="mb-0">${e.success} registros importados correctamente.</p>
          </div>
        `):(t.className=`card-header bg-warning bg-opacity-10`,n.innerHTML=`
          <div class="alert alert-warning mb-0">
            <h5>⚠️ Importación con errores</h5>
            <p><strong>${e.success} exitosos</strong> - <strong>${e.errors.length} errores</strong></p>
            <hr>
            <small><strong>Errores:</strong><br>${e.errors.slice(0,5).map(e=>`• Fila ${e.row}: ${e.error}`).join(`<br>`)}</small>
          </div>
        `),h.value=``,g.innerHTML=``,p.style.display=`none`,v.disabled=!0,v.innerHTML=`<i class="bi bi-cloud-upload me-1"></i> Importar`}catch(e){g.innerHTML=`<span class="text-danger">❌ Error: ${e.message}</span>`,v.disabled=!1,v.innerHTML=`<i class="bi bi-cloud-upload me-1"></i> Importar`}}});function S(){if(!b||b.length===0)return;let e=document.getElementById(`preview-thead`),t=document.getElementById(`preview-tbody`),n=document.getElementById(`preview-issues`),r=Object.keys(b[0].data);e.innerHTML=`<tr>`+r.map(e=>`<th>${e}</th>`).join(``)+`</tr>`,t.innerHTML=b.map(e=>`<tr>`+r.map(t=>`<td>${e.data[t]??``}</td>`).join(``)+`</tr>`).join(``);let i=b.flatMap(e=>e.issues);i.length>0?n.innerHTML=`<span class="text-warning">⚠️ ${i.length} advertencias</span>`:n.innerHTML=`<span class="text-success">✓ Todo看起来 bien - listo para importar</span>`}}export{u as renderImportView};