import{a as e,d as t,f as n,i as r,l as i,n as a,p as o,r as s}from"./pushService-CMfdphyW.js";import{B as c,F as l,G as u,H as d,I as f,L as p,P as m,R as h,U as g,V as _,W as v,z as y}from"./scoreDirectorView-CNqyd2ks.js";var b=[{id:`google/gemini-2.0-flash-exp`,name:`🔥 Gemini 2.0 Flash (Gratis)`,provider:`openrouter`},{id:`google/gemini-flash-1.5-exp`,name:`Google Gemini Flash 1.5 (Gratis)`,provider:`openrouter`},{id:`google/gemma-4-31b`,name:`Google Gemma 4 31B (Gratis)`,provider:`openrouter`},{id:`google/gemma-4-26b-a4b`,name:`Google Gemma 4 26B (Gratis)`,provider:`openrouter`},{id:`nvidia/nemotron-3-super-8b`,name:`NVIDIA Nemotron 3 Super (Gratis)`,provider:`openrouter`},{id:`nvidia/nemotron-nano-9b-v2`,name:`NVIDIA Nemotron Nano 9B (Gratis)`,provider:`openrouter`},{id:`poolside/laguna-xs.2`,name:`Poolside Laguna XS (Gratis)`,provider:`openrouter`},{id:`mistralai/mistral-7b-instruct`,name:`Mistral 7B (Gratis)`,provider:`openrouter`},{id:`anthropic/claude-3-haiku`,name:`Claude 3 Haiku (Gratis)`,provider:`openrouter`},{id:`openrouter/auto`,name:`🤖 Auto-Selector (Gratis - El mejor gratuito)`,provider:`openrouter`},{id:`groq-llama-3.3-70b`,name:`LLaMA 3.3 70B (GROQ - Rápido)`,provider:`groq`},{id:`groq-llama-3.1-70b`,name:`LLaMA 3.1 70B (GROQ)`,provider:`groq`}];function x(e){try{return localStorage.getItem(`portal-maestros:${e}`)}catch{return null}}function S(e,t){try{localStorage.setItem(`portal-maestros:${e}`,t)}catch{}}function C(){try{let e=localStorage.getItem(`portal-maestros:groq-usage`);return e?JSON.parse(e):null}catch{return null}}async function w(w){let[T,E,D,O,k,A]=await Promise.all([l()||x(`groq-key`)||``,p()||x(`openrouter-key`)||``,h()||`google/gemini-2.0-flash-exp`,y()||`llama-3.1-8b-instant`,f()||`llama-3.1-8b-instant`,m()]),j=b.find(e=>e.id===D)||b[0];w.innerHTML=`
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-8 mx-auto">
          
          <!-- Título -->
          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-gear fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Configuración del Sistema</h2>
              <small class="text-muted">Administra las API keys y preferencias de IA</small>
            </div>
          </div>

          <!-- Panel de IA -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-robot me-2"></i>
                Configuración de Inteligencia Artificial
              </h5>
              <small class="text-muted">Priorizamos modelos gratuitos para reducir costos</small>
            </div>
            <div class="card-body">
              <!-- Selector de Modelo -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Modelo de IA activo</label>
                <select class="form-select" id="preferred-model">
                  ${b.map(e=>`
                    <option value="${e.id}" ${e.id===D?`selected`:``}>
                      ${e.name}
                    </option>
                  `).join(``)}
                </select>
                <div class="form-text">Este modelo se usará por defecto en todas las requests</div>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-12 col-lg-6">
                  <label class="form-label fw-semibold">Modelo clasificador Telegram</label>
                  <input
                    type="text"
                    class="form-control"
                    id="telegram-classifier-model"
                    value="${O}"
                    placeholder="llama-3.1-8b-instant"
                  >
                  <div class="form-text">Usado por telegram-classifier-cron para clasificar mensajes.</div>
                </div>
                <div class="col-12 col-lg-6">
                  <label class="form-label fw-semibold">Modelo clasificador Hermes</label>
                  <input
                    type="text"
                    class="form-control"
                    id="hermes-classifier-model"
                    value="${k}"
                    placeholder="llama-3.1-8b-instant"
                  >
                  <div class="form-text">Usado por hermes-crear-tarea para clasificar solicitudes.</div>
                </div>
              </div>

              <hr class="my-4">

              <!-- OpenRouter -->
              <div class="mb-4">
                <div class="d-flex align-items-center mb-2">
                  <span class="badge bg-success me-2">GRATIS</span>
                  <h6 class="mb-0 fw-bold">OpenRouter</h6>
                </div>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-cloud"></i></span>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="openrouter-api-key" 
                    placeholder="sk-or-v2-..."
                    value="${E}"
                  >
                  <button class="btn btn-outline-secondary" type="button" id="toggle-openrouter-key">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <div class="form-text">
                  Modelos gratuitos: Gemini, Mistral, Claude Haiku. 
                  <a href="https://openrouter.ai/settings/keys" target="_blank">Obtener key →</a>
                </div>
              </div>

              <!-- GROQ -->
              <div class="mb-4">
                <div class="d-flex align-items-center mb-2">
                  <span class="badge bg-warning text-dark me-2">BACKUP</span>
                  <h6 class="mb-0 fw-bold">GROQ</h6>
                </div>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lightning-charge"></i></span>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="groq-api-key" 
                    placeholder="gsk_..."
                    value="${T}"
                  >
                  <button class="btn btn-outline-secondary" type="button" id="toggle-groq-key">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
                <div class="form-text">
                  LLaMA 3.3 70B - Rápido y económico. 
                  <a href="https://console.groq.com" target="_blank">Obtener key →</a>
                </div>
              </div>

              <!-- Botones -->
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" id="save-all-keys">
                  <i class="bi bi-save me-2"></i>
                  Guardar Configuración
                </button>
                <button class="btn btn-outline-primary" id="test-connection">
                  <i class="bi bi-lightning-charge me-2"></i>
                  Probar Conexión
                </button>
              </div>

              <div id="config-status" class="mt-3"></div>
            </div>
          </div>

          <!-- Panel de Notificaciones -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-bell me-2"></i>
                Notificaciones
              </h5>
              <small class="text-muted">Controla tus alertas y recordatorios de clase</small>
            </div>
            <div class="card-body">
              <!-- Web Push Notifications -->
              <div class="mb-4">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="push-enabled"
                    role="switch"
                  >
                  <label class="form-check-label" for="push-enabled">
                    <strong>Habilitar Web Push Notifications</strong>
                  </label>
                </div>
                <div class="form-text">Recibe notificaciones en el navegador aunque no tengas la app abierta</div>
                <div id="push-status" class="mt-2"></div>
              </div>

              <hr class="my-4">

              <!-- Alertas de Clase -->
              <div class="mb-4">
                <div class="form-check form-switch mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="alert-pre-class"
                    role="switch"
                    checked
                  >
                  <label class="form-check-label" for="alert-pre-class">
                    <strong>Alertas antes de clase</strong>
                  </label>
                </div>
                <div class="input-group input-group-sm" style="max-width: 200px;">
                  <span class="input-group-text">
                    <i class="bi bi-clock"></i>
                  </span>
                  <input
                    type="number"
                    class="form-control"
                    id="minutes-before-class"
                    min="1"
                    max="120"
                    value="15"
                  >
                  <span class="input-group-text">minutos</span>
                </div>
                <div class="form-text">Recibe alerta antes de que comience cada clase</div>
              </div>

              <!-- Alertas Después de Clase -->
              <div class="mb-4">
                <div class="form-check form-switch mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="alert-post-class"
                    role="switch"
                    checked
                  >
                  <label class="form-check-label" for="alert-post-class">
                    <strong>Alertas si no registras asistencia</strong>
                  </label>
                </div>
                <div class="input-group input-group-sm" style="max-width: 200px;">
                  <span class="input-group-text">
                    <i class="bi bi-clock"></i>
                  </span>
                  <input
                    type="number"
                    class="form-control"
                    id="minutes-after-class"
                    min="1"
                    max="300"
                    value="60"
                  >
                  <span class="input-group-text">minutos</span>
                </div>
                <div class="form-text">Te recordamos si no marcaste asistencia después de clase</div>
              </div>

              <hr class="my-4">

              <!-- Botones -->
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" id="save-notifications">
                  <i class="bi bi-save me-2"></i>
                  Guardar Notificaciones
                </button>
                <button class="btn btn-outline-secondary" id="test-notification">
                  <i class="bi bi-send me-2"></i>
                  Probar Notificación
                </button>
              </div>

              <div id="notification-status" class="mt-3"></div>
            </div>
          </div>

          <!-- Estadísticas de Uso -->
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-graph-down me-2"></i>
                Uso y Límites
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-4">
                  <h4 class="text-primary" id="usage-minute">-</h4>
                  <small class="text-muted">Este minuto</small>
                </div>
                <div class="col-4">
                  <h4 class="text-primary" id="usage-hour">-</h4>
                  <small class="text-muted">Esta hora</small>
                </div>
                <div class="col-4">
                  <h4 class="text-secondary" id="usage-cache">-</h4>
                  <small class="text-muted">En cache</small>
                </div>
              </div>
              <hr>
              <button class="btn btn-outline-secondary btn-sm" id="clear-cache">
                <i class="bi bi-trash me-1"></i> Limpiar Cache
              </button>
            </div>
          </div>

          <!-- Documentos institucionales -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-warning bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-file-earmark-pdf me-2 text-danger"></i>
                Documentos Institucionales
              </h5>
              <small class="text-muted">URLs de PDFs que se incluyen en la constancia de inscripción</small>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-semibold" for="url-reglamento">
                  <i class="bi bi-journal-text me-1 text-danger"></i> Reglamento del programa
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="url-reglamento"
                  placeholder="https://drive.google.com/..."
                  value="${A.reglamento??``}"
                >
                <div class="form-text">Se imprime como enlace en la constancia del representante.</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold" for="url-horario">
                  <i class="bi bi-calendar-week me-1 text-primary"></i> Horario de clases
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="url-horario"
                  placeholder="https://drive.google.com/..."
                  value="${A.horario??``}"
                >
                <div class="form-text">Horario general del programa (PDF o imagen en Google Drive).</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold" for="url-bienvenida">
                  <i class="bi bi-star me-1 text-warning"></i> Carta de bienvenida / Manual del alumno
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="url-bienvenida"
                  placeholder="https://drive.google.com/..."
                  value="${A.bienvenida??``}"
                >
                <div class="form-text">Opcional — documento de bienvenida para nuevos alumnos.</div>
              </div>

              <div class="d-flex gap-2 align-items-center">
                <button class="btn btn-warning" id="save-docs">
                  <i class="bi bi-save me-2"></i>Guardar documentos
                </button>
                <div id="docs-status"></div>
              </div>
            </div>
          </div>

          <!-- Información del Sistema -->
          <div class="card shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Información del Sistema
              </h5>
            </div>
            <div class="card-body">
              <table class="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <td class="text-muted" style="width: 150px;">Versión</td>
                    <td>1.0.0</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Modo</td>
                    <td><span class="badge bg-success">Demo</span></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Proveedor</td>
                    <td>${j.provider===`groq`?`GROQ`:`OpenRouter`}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Modelo activo</td>
                    <td><code>${D}</code></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Telegram model</td>
                    <td><code>${O}</code></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Hermes model</td>
                    <td><code>${k}</code></td>
                  </tr>
                  <tr>
                    <td class="text-muted">Fallback</td>
                    <td>${E&&T?`<span class="text-success">Automático</span>`:E?`OpenRouter only`:`GROQ only`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;function M(e,t){let n=document.getElementById(e),r=document.getElementById(t);n.type===`password`?(n.type=`text`,r.innerHTML=`<i class="bi bi-eye-slash"></i>`):(n.type=`password`,r.innerHTML=`<i class="bi bi-eye"></i>`)}document.getElementById(`toggle-openrouter-key`).addEventListener(`click`,()=>M(`openrouter-api-key`,`toggle-openrouter-key`)),document.getElementById(`toggle-groq-key`).addEventListener(`click`,()=>M(`groq-api-key`,`toggle-groq-key`)),document.getElementById(`save-all-keys`).addEventListener(`click`,async()=>{let e=document.getElementById(`groq-api-key`).value.trim(),t=document.getElementById(`openrouter-api-key`).value.trim(),n=document.getElementById(`preferred-model`).value,r=document.getElementById(`telegram-classifier-model`).value.trim(),i=document.getElementById(`hermes-classifier-model`).value.trim(),a=document.getElementById(`config-status`);a.innerHTML=`<div class="spinner-border spinner-border-sm me-2"></div> Guardando...`;try{e&&(await _(e),S(`groq-key`,e)),t&&(await g(t),S(`openrouter-key`,t)),await v(n),r&&await u(r),i&&await d(i),a.innerHTML=`<div class="alert alert-success alert-dismissible fade show mb-0"><i class="bi bi-check-circle me-1"></i> Configuración guardada correctamente<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`}catch(e){a.innerHTML=`<div class="alert alert-danger alert-dismissible fade show mb-0"><i class="bi bi-exclamation-triangle me-1"></i> Error: ${e.message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`}}),document.getElementById(`test-connection`).addEventListener(`click`,async()=>{let e=document.getElementById(`config-status`),t=document.getElementById(`preferred-model`).value,n=b.find(e=>e.id===t);e.innerHTML=`<div class="spinner-border spinner-border-sm me-2"></div> Probando conexión...`;let r=``,i=``;if(n.provider===`openrouter`?(r=document.getElementById(`openrouter-api-key`).value.trim(),i=`https://openrouter.ai/api/v1/models`):(r=document.getElementById(`groq-api-key`).value.trim(),i=`https://api.groq.com/openai/v1/models`),!r){e.innerHTML=`<div class="alert alert-warning mb-0">Ingresa una API key para el modelo seleccionado</div>`;return}try{let t=await fetch(i,{headers:{Authorization:`Bearer ${r}`}});if(t.ok)e.innerHTML=`<div class="alert alert-success alert-dismissible fade show mb-0"><i class="bi bi-check-circle me-1"></i> Conexión exitosa con ${n.name}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;else{let n=await t.text();e.innerHTML=`<div class="alert alert-danger alert-dismissible fade show mb-0"><i class="bi bi-exclamation-triangle me-1"></i> Error ${t.status}: ${n.substring(0,100)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`}}catch(t){e.innerHTML=`<div class="alert alert-danger mb-0">Error de conexión: ${t.message}</div>`}});function N(){let e=document.getElementById(`usage-minute`),t=document.getElementById(`usage-hour`),n=document.getElementById(`usage-cache`);if(!e||!t||!n)return;let r=C();if(!r){e.textContent=`0/10`,t.textContent=`0/100`,n.textContent=`0`;return}let i=Date.now(),a=i-6e4,o=i-36e5,s=r.requests?.filter(e=>e>a).length||0,c=r.requests?.filter(e=>e>o).length||0,l=r.cache?Object.keys(r.cache).length:0;e.textContent=`${s}/10`,t.textContent=`${c}/100`,n.textContent=l}N(),setInterval(N,5e3),document.getElementById(`clear-cache`).addEventListener(`click`,()=>{try{localStorage.removeItem(`portal-maestros:groq-usage`),N(),document.getElementById(`config-status`).innerHTML=`<div class="alert alert-info mb-0">Cache limpiado</div>`}catch(e){console.error(`Error clearing cache:`,e)}});async function P(){try{let t=await a(),n=await r();document.getElementById(`alert-pre-class`).checked=t.alerta_pre_clase??!0,document.getElementById(`minutes-before-class`).value=t.min_antes_clase??15,document.getElementById(`alert-post-class`).checked=t.alerta_post_clase??!0,document.getElementById(`minutes-after-class`).value=t.min_post_clase_sin_registro??60,e()?(document.getElementById(`push-enabled`).checked=n,await F()):(document.getElementById(`push-enabled`).disabled=!0,document.getElementById(`push-status`).innerHTML=`<div class="alert alert-warning alert-sm mb-0">Tu navegador no soporta Web Push</div>`)}catch(e){console.error(`Error loading notification preferences:`,e)}}async function F(){let e=document.getElementById(`push-status`);try{let{subscribed:t,error:n}=await s();t?e.innerHTML=`<div class="alert alert-success alert-sm mb-0"><i class="bi bi-check-circle me-1"></i> Push habilitado correctamente</div>`:n?e.innerHTML=`<div class="alert alert-info alert-sm mb-0">${n}</div>`:e.innerHTML=``}catch(e){console.error(`Error updating push status:`,e)}}document.getElementById(`push-enabled`).addEventListener(`change`,async e=>{let n=document.getElementById(`notification-status`),r=e.target;if(r.checked){n.innerHTML=`<div class="spinner-border spinner-border-sm me-2"></div> Habilitando push...`;try{let e=await t();e.success?(n.innerHTML=`<div class="alert alert-success alert-dismissible fade show mb-0"><i class="bi bi-check-circle me-1"></i> Web Push habilitado<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`,await F()):(n.innerHTML=`<div class="alert alert-danger alert-dismissible fade show mb-0"><i class="bi bi-exclamation-triangle me-1"></i> ${e.error||`Error al habilitar push`}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`,r.checked=!1)}catch(e){n.innerHTML=`<div class="alert alert-danger mb-0">Error: ${e.message}</div>`,r.checked=!1}}else{n.innerHTML=`<div class="spinner-border spinner-border-sm me-2"></div> Deshabilitando push...`;try{await o(),n.innerHTML=`<div class="alert alert-info alert-dismissible fade show mb-0"><i class="bi bi-info-circle me-1"></i> Web Push deshabilitado<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`,await F()}catch(e){n.innerHTML=`<div class="alert alert-danger mb-0">Error: ${e.message}</div>`,r.checked=!0}}}),document.getElementById(`save-notifications`).addEventListener(`click`,async()=>{let e=document.getElementById(`notification-status`);e.innerHTML=`<div class="spinner-border spinner-border-sm me-2"></div> Guardando...`;try{let{error:t}=await i({alerta_pre_clase:document.getElementById(`alert-pre-class`).checked,min_antes_clase:parseInt(document.getElementById(`minutes-before-class`).value),alerta_post_clase:document.getElementById(`alert-post-class`).checked,min_post_clase_sin_registro:parseInt(document.getElementById(`minutes-after-class`).value)});t?e.innerHTML=`<div class="alert alert-danger alert-dismissible fade show mb-0"><i class="bi bi-exclamation-triangle me-1"></i> Error: ${t}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`:e.innerHTML=`<div class="alert alert-success alert-dismissible fade show mb-0"><i class="bi bi-check-circle me-1"></i> Preferencias guardadas correctamente<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`}catch(t){e.innerHTML=`<div class="alert alert-danger mb-0">Error: ${t.message}</div>`,console.error(`Error saving notification preferences:`,t)}}),document.getElementById(`test-notification`).addEventListener(`click`,async()=>{let e=document.getElementById(`notification-status`);e.innerHTML=`<div class="spinner-border spinner-border-sm me-2"></div> Enviando notificación de prueba...`;try{let t=await n();t.success?e.innerHTML=`<div class="alert alert-success alert-dismissible fade show mb-0"><i class="bi bi-check-circle me-1"></i> ${t.method===`serviceWorker`?`Notificación push del sistema operativo`:`Notificación local del navegador`} enviada<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`:e.innerHTML=`<div class="alert alert-warning alert-dismissible fade show mb-0"><i class="bi bi-exclamation-triangle me-1"></i> ${t.error||`Debes habilitar los permisos de notificación`}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`}catch(t){e.innerHTML=`<div class="alert alert-danger mb-0">Error: ${t.message}</div>`,console.error(`Error sending test notification:`,t)}}),document.getElementById(`save-docs`).addEventListener(`click`,async()=>{let e=document.getElementById(`docs-status`);e.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>`;try{await c({reglamento:document.getElementById(`url-reglamento`).value.trim()||null,horario:document.getElementById(`url-horario`).value.trim()||null,bienvenida:document.getElementById(`url-bienvenida`).value.trim()||null}),e.innerHTML=`<span class="text-success"><i class="bi bi-check-circle me-1"></i>Guardado</span>`,setTimeout(()=>{e.innerHTML=``},2500)}catch(t){e.innerHTML=`<span class="text-danger"><i class="bi bi-x-circle me-1"></i>${t.message}</span>`}}),P()}export{w as renderConfigView};