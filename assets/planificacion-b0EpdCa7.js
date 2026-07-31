import{i as e,r as t,s as n,t as r}from"./AppModal-B8f8dDnR.js";import{i}from"./supabase-Cgh_dhNB.js";import{t as a}from"./config-CNiOV0RX.js";import{a as o,c as s,i as c,n as l,o as u,r as d,t as f}from"./planificacionAdapter-Dyi8LwW_.js";import{a as p,c as m,i as h,n as g,o as _,r as v,s as y,t as b}from"./IndicadorLogro-C_uDnyrO.js";import{t as x}from"./router-DPk1oCHJ.js";var ee=n({actualizarPermiso:()=>te,aprobarSolicitud:()=>ae,crearSolicitud:()=>ne,obtenerPermisoPorMaestro:()=>w,obtenerPermisos:()=>C,obtenerSolicitudPorMaestro:()=>re,obtenerSolicitudesPendientes:()=>ie,rechazarSolicitud:()=>oe});function S(e){return e?{...e,id:e.id,maestro_id:e.maestro_id??``,maestro_nombre:e.maestros?.nombre_completo??``,maestro_email:e.maestros?.correo??``,puede_registrar_alumnos:e.puede_registrar_alumnos??!1,puede_inscribir_clases:e.puede_inscribir_clases??!1,permisos:Array.isArray(e.permisos)?e.permisos:[],solicitudes:Array.isArray(e.solicitudes)?e.solicitudes:[],concedido_por:e.concedido_por??null,concedido_por_nombre:null,creado_en:e.creado_en||null,actualizado_en:e.actualizado_en||null}:null}async function C(){let{data:e,error:t}=await i.from(`permisos_maestros`).select(`*, maestros!permisos_maestros_maestro_id_fkey(nombre_completo, correo)`).order(`creado_en`,{ascending:!1});if(t)throw console.error(`Error cargando permisos:`,t.message),Error(`No se pudieron cargar los permisos`);return e.map(S)}async function w(e){let{data:t,error:n}=await i.from(`permisos_maestros`).select(`*, maestros!permisos_maestros_maestro_id_fkey(nombre_completo, correo)`).eq(`maestro_id`,e).maybeSingle();if(n)throw console.error(`Error cargando permiso:`,n.message),Error(`No se pudo cargar el permiso`);return S(t)}async function te(e,t){let{data:n}=await i.from(`permisos_maestros`).select(`puede_registrar_alumnos, puede_inscribir_clases, permisos, solicitudes`).eq(`maestro_id`,e).maybeSingle(),r={maestro_id:e,puede_registrar_alumnos:`puede_registrar_alumnos`in t?t.puede_registrar_alumnos??!1:n?.puede_registrar_alumnos??!1,puede_inscribir_clases:`puede_inscribir_clases`in t?t.puede_inscribir_clases??!1:n?.puede_inscribir_clases??!1,permisos:Array.isArray(t.permisos)?t.permisos:n?.permisos??[],solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:n?.solicitudes??[],concedido_por:t.concedido_por||null},{data:a,error:o}=await i.from(`permisos_maestros`).upsert(r,{onConflict:`maestro_id`}).select().single();if(o)throw console.error(`Error actualizando permiso:`,o.message),Error(`No se pudo actualizar el permiso`);return S(a)}function T(e){return e?{id:e.id,maestro_id:e.maestro_id??``,maestro_nombre:e.maestros?.nombre_completo??``,maestro_email:e.maestros?.correo??``,solicita_alumnos:e.solicita_alumnos??!1,solicita_clases:e.solicita_clases??!1,estado:e.estado??`pendiente`,creado_en:e.creado_en||null,actualizado_en:e.actualizado_en||null,aprobado_en:e.aprobado_en||null,aprobado_por:e.aprobado_por||null,aprobado_por_nombre:e.maestros_aprobado?.nombre_completo??``,motivo_rechazo:e.motivo_rechazo||null}:null}async function ne(e,t,n){if(!e)throw Error(`maestroId es requerido`);let{data:r}=await i.from(`solicitudes_permisos`).select(`id, estado`).eq(`maestro_id`,e).eq(`estado`,`pendiente`).maybeSingle();if(r)throw Error(`Ya existe una solicitud pendiente para este maestro`);let a=[];t&&a.push(`alumnos:create`),n&&a.push(`clases:enroll`);let{data:o,error:s}=await i.from(`solicitudes_permisos`).insert([{maestro_id:e,solicita_alumnos:t??!1,solicita_clases:n??!1,tipos:a,estado:`pendiente`}]).select(`*, maestros!maestro_id(nombre_completo, correo)`).single();if(s)throw console.error(`Error creando solicitud:`,s.message),Error(`No se pudo crear la solicitud de permisos: ${s.message}`);return T(o)}async function re(e){let{data:t,error:n}=await i.from(`solicitudes_permisos`).select(`*, maestros!maestro_id(nombre_completo, correo)`).eq(`maestro_id`,e).order(`creado_en`,{ascending:!1}).maybeSingle();if(n)throw console.error(`Error obteniendo solicitud:`,n.message),Error(`No se pudo obtener la solicitud`);return T(t)}async function ie(){let{data:e,error:t}=await i.from(`solicitudes_permisos`).select(`*, maestros!maestro_id(nombre_completo, correo)`).eq(`estado`,`pendiente`).order(`creado_en`,{ascending:!0});if(t)throw console.error(`Error obteniendo solicitudes pendientes:`,t.message),Error(`No se pudieron cargar las solicitudes pendientes`);return(e||[]).map(T)}async function ae(e,t){if(!e||!t)throw Error(`solicitudId y adminId son requeridos`);let{data:n,error:r}=await i.from(`solicitudes_permisos`).update({estado:`aprobado`,aprobado_en:new Date().toISOString(),aprobado_por:t}).eq(`id`,e).select(`*, maestros!maestro_id(nombre_completo, correo)`).single();if(r)throw console.error(`Error aprobando solicitud:`,r.message),Error(`No se pudo aprobar la solicitud`);if(n?.maestro_id){let e=T(n),r=[];e.solicita_alumnos&&r.push(`registrar_alumnos`,`alumnos:create`),e.solicita_clases&&r.push(`inscribir_clases`,`clases:enroll`,`clases:create`);let i=await w(n.maestro_id),a=Array.isArray(i?.permisos)?i.permisos:[];await te(n.maestro_id,{puede_registrar_alumnos:e.solicita_alumnos||(i?.puede_registrar_alumnos??!1),puede_inscribir_clases:e.solicita_clases||(i?.puede_inscribir_clases??!1),permisos:[...new Set([...a,...r])],concedido_por:t})}return T(n)}async function oe(e,t,n){if(!e||!t)throw Error(`solicitudId y adminId son requeridos`);let{data:r,error:a}=await i.from(`solicitudes_permisos`).update({estado:`rechazado`,aprobado_en:new Date().toISOString(),aprobado_por:t,motivo_rechazo:n||``}).eq(`id`,e).select(`*, maestros!maestro_id(nombre_completo, correo)`).single();if(a)throw console.error(`Error rechazando solicitud:`,a.message),Error(`No se pudo rechazar la solicitud`);return T(r)}var se=class{constructor(e=`default`){this.scope=e,this.subscriptions=[],this.intervals=[],this.listeners=[]}registerChannel(e){e&&!this.subscriptions.includes(e)&&this.subscriptions.push(e)}registerInterval(e){e!==null&&!this.intervals.includes(e)&&this.intervals.push(e)}registerListener(e,t,n){e&&t&&n&&this.listeners.push({el:e,event:t,fn:n})}destroy(){this.subscriptions.forEach(e=>{try{e&&i.removeChannel(e)}catch(e){console.warn(`[LifecycleManager] Error removing channel (${this.scope}):`,e)}}),this.intervals.forEach(e=>{try{clearInterval(e)}catch(e){console.warn(`[LifecycleManager] Error clearing interval (${this.scope}):`,e)}}),this.listeners.forEach(({el:e,event:t,fn:n})=>{try{e&&t&&n&&e.removeEventListener(t,n)}catch(e){console.warn(`[LifecycleManager] Error removing listener (${this.scope}):`,e)}}),this.subscriptions=[],this.intervals=[],this.listeners=[],console.log(`[LifecycleManager] Cleanup completed for scope: ${this.scope}`)}};async function ce(e){let{error:t}=await i.from(`sesiones_clase`).delete().eq(`id`,e);if(t)throw console.error(`Error eliminando sesión:`,t.message),Error(`No se pudo eliminar la sesión`);return{success:!0}}function le(){return`https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/groq-proxy`}async function ue(){let{data:{session:e}}=await i.auth.getSession();return{Authorization:`Bearer ${e?.access_token??``}`,"Content-Type":`application/json`,apikey:`sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P`}}async function de(e,{maxTokens:t,temperature:n,responseFormat:r}={}){let i={model:a.ai.ollamaModel,messages:e,...t&&{max_tokens:t},...n!==void 0&&{temperature:n},...r&&{response_format:r}},o=await fetch(`${a.ai.ollamaUrl}/v1/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(i)}),s=await o.json();if(!o.ok||s.error)throw Error(s.error?.message??`Ollama error ${o.status}`);return s.choices[0].message.content.trim()}async function fe(e,{maxTokens:t,temperature:n,responseFormat:r}={}){if(a.ai.provider===`ollama`)try{return await de(e,{maxTokens:t,temperature:n,responseFormat:r})}catch(e){console.warn(`[groqService] Ollama call failed (CSP/network), using edge proxy fallback:`,e)}let i=await ue(),o={model:a.groq.model,messages:e,...t&&{max_tokens:t},...n!==void 0&&{temperature:n},...r&&{response_format:r}},s=await fetch(`${le()}/chat`,{method:`POST`,headers:i,body:JSON.stringify(o)}),c=await s.json();if(!s.ok||c.error)throw Error(c.error?.message??`Groq proxy error ${s.status}`);return c.choices[0].message.content.trim()}async function pe(e,t={}){return a.isDemoMode?`Respuesta generada en Modo Demo de Inteligencia Artificial (GROQ Proxy).`:fe(e,t)}async function me({instrumento:e=`Música`,nivelIndex:t=0}){let n=`Como pedagogo musical experto de El Sistema, genera una secuencia didáctica de 4 objetivos con 2 indicadores cada uno para ${e} en el Nivel ${t}.
Responde ÚNICAMENTE en JSON con el formato:
[
  { "id": "obj-1", "titulo": "Objetivo 1", "indicadores": [{ "id": "ind-1-1", "titulo": "Indicador 1" }] }
]`;try{let e=(await pe([{role:`user`,content:n}])).replace(/```json/g,``).replace(/```/g,``).trim(),t=JSON.parse(e);return Array.isArray(t)?t:[]}catch(e){return console.warn(`[aiEvaluacionService] Error llamando a GROQ, usando fallback demo:`,e),[{id:`obj-demo-1`,titulo:`Introducción Técnica Nivel ${t}`,indicadores:[{id:`ind-demo-1-1`,titulo:`Postura y emisión de sonido libre`},{id:`ind-demo-1-2`,titulo:`Control de pulso rítmico`}]}]}}async function he({indicadorTitulo:e,alumnosNecesitanRefuerzo:t=1}){let n=`Redacta una tarea corta y práctica de 2 líneas para la casa para ${t} alumnos que necesitan reforzar el tema: "${e}".`;try{return(await pe([{role:`user`,content:n}])).trim()}catch{return`Practicar en casa 15 minutos diarios los ejercicios de ${e} a velocidad lenta.`}}var ge=[{id:`nivel-0`,nombre:`Nivel 0: Iniciación / Descubrimiento`,color:`success`},{id:`nivel-1`,nombre:`Nivel 1: Básico / Formación Técnica`,color:`primary`},{id:`nivel-2`,nombre:`Nivel 2: Intermedio / Desarrollo Solista`,color:`warning`},{id:`nivel-3`,nombre:`Nivel 3: Avanzado / Maestría Institucional`,color:`danger`}];async function E({plan:n=null,esACM:i=!1,onSaved:a=null}={}){let s=[];try{s=await o()}catch(e){console.error(`[EditorPlanificacionModal] Error cargando clases:`,e)}let c=!!(n&&n.id),u=c?`Editar Estructura Curricular`:i?`Diseñador Curricular Institucional (ACM)`:`Nueva Planificación Didáctica`,d={nivelId:n?.nivelId||`nivel-1`,frecuenciaSemanal:n?.frecuenciaSemanal||2,semanasTotales:n?.semanasTotales||24,objetivos:n?.objetivosEstructurados||[{id:`obj-1`,titulo:`Dominio de Postura y Emisión Sonora`,indicadores:[{id:`ind-1`,titulo:`Postura corporal equilibrada y relajada`,prerrequisitoId:null},{id:`ind-2`,titulo:`Distribución fluida del arco en cuerdas abiertas`,prerrequisitoId:`ind-1`}]},{id:`obj-2`,titulo:`Afinación y Articulación Digital`,indicadores:[{id:`ind-3`,titulo:`Colocación exacta de 1er y 2do dedo`,prerrequisitoId:`ind-2`},{id:`ind-4`,titulo:`Independencia digital a pulso 60 BPM`,prerrequisitoId:`ind-3`}]}]},p=n?.clase_id||n?.claseId||``,m=n?.titulo||`Plan Didáctico Semestral (6 Meses)`,h=n?.semana||1,g=`
    <form id="form-editor-plan-interactivo" class="needs-validation" novalidate>
      <!-- Cabecera de Perfil e IA (Dark Mode Friendly) -->
      <div class="d-flex flex-wrap justify-content-between align-items-center bg-body-tertiary p-3 rounded-3 mb-3 gap-2 border border-secondary-subtle">
        <div>
          <span class="badge ${i?`bg-primary`:`bg-secondary`} me-2">
            <i class="bi ${i?`bi-shield-check`:`bi-person-badge`} me-1"></i>${i?`Coordinación ACM`:`Docente Especialista`}
          </span>
          <span class="text-body-secondary small">Diseño Jerárquico: Nivel ➔ Objetivos ➔ 1 Indicador por Clase</span>
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary shadow-sm" id="btn-ia-autogenerar-estructura">
          <i class="bi bi-magic me-1"></i>Generar Mapeo Completo con IA (GROQ)
        </button>
      </div>

      <!-- Datos Generales y Calculador de Frecuencia -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <label class="form-label fw-semibold text-body">Clase / Agrupación <span class="text-danger">*</span></label>
          <select class="form-select form-select-sm" id="editor-plan-clase" required>
            <option value="">-- Seleccionar Clase --</option>
            ${s.map(e=>`
              <option value="${e.id}" ${e.id===p?`selected`:``}>
                ${t(e.nombre||e.name||`Clase ${e.id}`)}
              </option>
            `).join(``)}
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label fw-semibold text-body">Nivel Técnico de Avance (Mundo)</label>
          <select class="form-select form-select-sm" id="editor-plan-nivel">
            ${ge.map(e=>`
              <option value="${e.id}" ${e.id===d.nivelId?`selected`:``}>
                ${e.nombre}
              </option>
            `).join(``)}
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label fw-semibold text-body">Frecuencia Semanal</label>
          <select class="form-select form-select-sm" id="editor-plan-frecuencia">
            <option value="1" ${d.frecuenciaSemanal===1?`selected`:``}>1 Clase / semana (24 Clases / 6 Meses)</option>
            <option value="2" ${d.frecuenciaSemanal===2?`selected`:``}>2 Clases / semana (48 Clases / 6 Meses)</option>
            <option value="3" ${d.frecuenciaSemanal===3?`selected`:``}>3 Clases / semana (72 Clases / 6 Meses)</option>
          </select>
        </div>

        <div class="col-md-10">
          <label class="form-label fw-semibold text-body">Título Principal de la Planificación <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm" id="editor-plan-titulo" placeholder="Ej. Ruta Técnica de Violín - Semestre 1" value="${t(m)}" required>
        </div>

        <div class="col-md-2">
          <label class="form-label fw-semibold text-body">Semana Inicial</label>
          <input type="number" class="form-control form-control-sm" id="editor-plan-semana" min="1" max="52" value="${h}">
        </div>
      </div>

      <!-- BANNER EXPLICATIVO DE RITMO DIDÁCTICO -->
      <div class="alert alert-info border-info-subtle bg-info-subtle text-info-emphasis d-flex align-items-center py-2 px-3 rounded-3 mb-3 small" id="banner-ritmo-didactico">
        <i class="bi bi-clock-history display-6 me-3"></i>
        <div>
          <strong>Ritmo Curricular:</strong> <span id="txt-ritmo-calculado">2 clases por semana = ~48 clases totales en 6 meses (24 semanas)</span>.
          <div class="text-body-secondary" style="font-size:0.8rem;">
            Margen operativo para conciertos, feriados y repasos: ~4 Clases ➔ <strong>Meta Real: ~44 Indicadores por Semestre</strong>.
          </div>
        </div>
      </div>

      <!-- NAVEGACIÓN TAB: Constructor Interactivo vs Vista Previa Grafo SVG -->
      <ul class="nav nav-tabs mb-3" id="tab-plan-builder" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="tab-builder-btn" data-bs-toggle="tab" data-bs-target="#tab-builder-pane" type="button" role="tab">
            <i class="bi bi-diagram-3 me-1"></i>1. Objetivos e Indicadores por Clase
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-preview-btn" data-bs-toggle="tab" data-bs-target="#tab-preview-pane" type="button" role="tab">
            <i class="bi bi-eye me-1"></i>2. Grafo SVG de Ruta
          </button>
        </li>
      </ul>

      <div class="tab-content" id="tab-plan-builder-content">
        <!-- TAB 1: Editor de Objetivos e Indicadores -->
        <div class="tab-pane fade show active" id="tab-builder-pane" role="tabpanel">
          <div id="contenedor-objetivos-list"></div>

          <button type="button" class="btn btn-sm btn-outline-success mt-2" id="btn-agregar-objetivo">
            <i class="bi bi-plus-circle me-1"></i>+ Agregar Objetivo Pedagógico
          </button>
        </div>

        <!-- TAB 2: Grafo SVG Interactivo con Soporte Dark Mode -->
        <div class="tab-pane fade" id="tab-preview-pane" role="tabpanel">
          <div class="border border-secondary-subtle rounded-3 p-3 bg-body-tertiary text-body text-center">
            <h6 class="fw-bold mb-1 text-body">Representación Vectorial de la Ruta Pedagógica (SVG)</h6>
            <p class="text-body-secondary small mb-3">Cada nodo corresponde a 1 Clase Evaluables (1 a 5 estrellas).</p>
            <div id="builder-svg-preview-container" style="min-height: 250px;"></div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-top border-secondary-subtle">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="editor-plan-enviar" ${n?.estado===`publicada`||i?`checked`:``}>
          <label class="form-check-label fw-medium text-body" for="editor-plan-enviar">
            ${i?`Publicar como Plantilla Oficial Institucional`:`Enviar a revisión pedagógica ACM`}
          </label>
        </div>
      </div>
    </form>
  `;function _(e){let t=parseInt(e.querySelector(`#editor-plan-frecuencia`)?.value||`2`,10);d.frecuenciaSemanal=t;let n=t*24;Math.max(n-4,20);let r=e.querySelector(`#txt-ritmo-calculado`);r&&(r.textContent=`${t} clase(s) por semana = ~${n} clases proyectadas en 6 meses (24 semanas)`)}function y(e){let n=e.querySelector(`#contenedor-objetivos-list`);if(!n)return;if(d.objetivos.length===0){n.innerHTML=`
        <div class="text-center py-4 text-body-secondary border border-secondary-subtle rounded-3 bg-body-tertiary">
          <i class="bi bi-journal-plus display-6 d-block mb-2"></i>
          Sin objetivos asignados. Presioná <strong>"+ Agregar Objetivo Pedagógico"</strong> para comenzar.
        </div>
      `;return}let r=[];d.objetivos.forEach(e=>{e.indicadores.forEach(t=>{r.push({id:t.id,titulo:t.titulo,objTitulo:e.titulo})})});let i=1;n.innerHTML=d.objetivos.map((e,n)=>`
      <div class="card mb-3 border border-secondary-subtle shadow-sm card-objetivo-item bg-body-tertiary text-body" data-obj-idx="${n}">
        <div class="card-header bg-body-secondary d-flex align-items-center justify-content-between py-2 border-bottom border-secondary-subtle">
          <div class="d-flex align-items-center gap-2 flex-grow-1 me-3">
            <span class="badge bg-primary rounded-pill">Unidad ${n+1}</span>
            <input type="text" class="form-control form-control-sm fw-bold input-objetivo-titulo bg-body text-body" data-obj-idx="${n}" value="${t(e.titulo)}" placeholder="Título del Objetivo Pedagógico (Ruta/Sección)">
          </div>
          <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-objetivo" data-obj-idx="${n}" title="Eliminar Objetivo">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="card-body p-3">
          <label class="form-label text-body-secondary small fw-bold text-uppercase mb-2">
            Indicadores de Logro Evaluables (1 Clase por Indicador)
          </label>

          <div class="contenedor-indicadores-list">
            ${e.indicadores.map((e,a)=>`
              <div class="d-flex align-items-center gap-2 mb-2 p-2 border border-secondary-subtle rounded bg-body item-indicador-row" data-obj-idx="${n}" data-ind-idx="${a}">
                <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle text-nowrap">Clase ${i++}</span>
                <input type="text" class="form-control form-control-sm flex-grow-1 input-indicador-titulo bg-body text-body" data-obj-idx="${n}" data-ind-idx="${a}" value="${t(e.titulo)}" placeholder="Objetivo de la clase (ej: Emisión sonora en Re)">
                
                <select class="form-select form-select-sm select-prerrequisito bg-body text-body" data-obj-idx="${n}" data-ind-idx="${a}" style="max-width: 200px;">
                  <option value="">Sin Prerrequisito</option>
                  ${r.filter(t=>t.id!==e.id).map(n=>`
                    <option value="${n.id}" ${n.id===e.prerrequisitoId?`selected`:``}>
                      Requiere: ${t(n.titulo.slice(0,20))}…
                    </option>
                  `).join(``)}
                </select>

                <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-eliminar-indicador" data-obj-idx="${n}" data-ind-idx="${a}">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            `).join(``)}
          </div>

          <button type="button" class="btn btn-sm btn-link text-primary p-0 mt-1 btn-agregar-indicador" data-obj-idx="${n}">
            <i class="bi bi-plus-short"></i>+ Añadir Clase / Indicador Evaluables
          </button>
        </div>
      </div>
    `).join(``),b(e),x(e)}function b(e){e.querySelectorAll(`.input-objetivo-titulo`).forEach(t=>{t.addEventListener(`input`,t=>{let n=parseInt(t.target.dataset.objIdx,10);d.objetivos[n]&&(d.objetivos[n].titulo=t.target.value,x(e))})}),e.querySelectorAll(`.input-indicador-titulo`).forEach(t=>{t.addEventListener(`input`,t=>{let n=parseInt(t.target.dataset.objIdx,10),r=parseInt(t.target.dataset.indIdx,10);d.objetivos[n]?.indicadores[r]&&(d.objetivos[n].indicadores[r].titulo=t.target.value,x(e))})}),e.querySelectorAll(`.select-prerrequisito`).forEach(t=>{t.addEventListener(`change`,t=>{let n=parseInt(t.target.dataset.objIdx,10),r=parseInt(t.target.dataset.indIdx,10);d.objetivos[n]?.indicadores[r]&&(d.objetivos[n].indicadores[r].prerrequisitoId=t.target.value||null,x(e))})}),e.querySelectorAll(`.btn-eliminar-objetivo`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.dataset.objIdx,10);d.objetivos.splice(n,1),y(e)})}),e.querySelectorAll(`.btn-agregar-indicador`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.dataset.objIdx,10);if(d.objetivos[n]){let t=`ind-${Date.now()}`;d.objetivos[n].indicadores.push({id:t,titulo:`Objetivo de Clase ${d.objetivos[n].indicadores.length+1}`,prerrequisitoId:null}),y(e)}})}),e.querySelectorAll(`.btn-eliminar-indicador`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.dataset.objIdx,10),r=parseInt(t.dataset.indIdx,10);d.objetivos[n]?.indicadores&&(d.objetivos[n].indicadores.splice(r,1),y(e))})})}function x(t){let n=t.querySelector(`#builder-svg-preview-container`);if(!n)return;let r=[];if(d.objetivos.forEach(e=>{e.indicadores.forEach(e=>{r.push({id:e.id,titulo:e.titulo,estado:e.prerrequisitoId?`en_proceso`:`logrado`})})}),r.length===0){n.innerHTML=`<span class="text-body-secondary small">Agregá indicadores de clase para visualizar la ruta en SVG.</span>`;return}v({container:n,nodos:r,onNodeClick:t=>{e.info(`Indicador: ${t.titulo}`)}})}r.open({title:u,size:`xl`,saveText:c?`Guardar Cambios`:`Crear Estructura`,cancelText:`Cancelar`,body:g,onSave:async()=>{let t=document.querySelector(`#editor-plan-clase`)?.value,r=parseInt(document.querySelector(`#editor-plan-semana`)?.value||`1`,10),o=document.querySelector(`#editor-plan-titulo`)?.value?.trim(),s=document.querySelector(`#editor-plan-nivel`)?.value,u=document.querySelector(`#editor-plan-enviar`)?.checked;if(!t||!o)return e.show(`Por favor completá la clase y el título principal`,`warning`),!1;let p=[];d.objetivos.forEach(e=>{p.push(`[OBJETIVO] ${e.titulo}`),e.indicadores.forEach(e=>{p.push(`  • [CLASE] ${e.titulo}`)})});let m=i&&u?`publicada`:u?`revisada`:n?.estado||`borrador`,h={clase_id:t,semana:r,titulo:o,nivelId:s,frecuenciaSemanal:d.frecuenciaSemanal,semanasTotales:24,objetivosEstructurados:d.objetivos,contenidos:p,estado:m,esPlantillaOficial:i,fecha:n?.fecha||new Date().toISOString().slice(0,10)};try{return c?(await f(n.id,h),e.show(`Estructura curricular actualizada correctamente`,`success`)):(await l(h),e.show(i?`Plan Institucional Oficial publicado`:`Planificación creada correctamente`,`success`)),a?.(),!0}catch(t){return console.error(`[EditorPlanificacionModal] Error al guardar:`,t),e.show(`Error al guardar: ${t.message}`,`error`),!1}}}),setTimeout(()=>{let t=document.querySelector(`.modal.show`)||document;t.querySelector(`#editor-plan-frecuencia`)?.addEventListener(`change`,()=>{_(t)}),_(t),y(t),t.querySelector(`#btn-agregar-objetivo`)?.addEventListener(`click`,()=>{let e=d.objetivos.length+1;d.objetivos.push({id:`obj-${Date.now()}`,titulo:`Unidad / Objetivo ${e}`,indicadores:[{id:`ind-${Date.now()}-1`,titulo:`Contenido de Clase 1`,prerrequisitoId:null},{id:`ind-${Date.now()}-2`,titulo:`Contenido de Clase 2`,prerrequisitoId:`ind-${Date.now()}-1`}]}),y(t)}),t.querySelector(`#btn-ia-autogenerar-estructura`)?.addEventListener(`click`,async()=>{let n=t.querySelector(`#btn-ia-autogenerar-estructura`);n&&(n.disabled=!0),e.show(`Generando Plan Semestral (48 Clases Evaluables) con IA (GROQ)...`,`info`);let r=await me({instrumento:`Música e Instrumento`,nivelIndex:1});r&&r.length>0&&(d.objetivos=r.map((e,t)=>({id:`obj-ia-${t}`,titulo:e.titulo||`Unidad Pedagógica ${t+1}`,indicadores:(e.indicadores||[`Clase de técnica`,`Clase de repertorio`]).map((e,n)=>({id:`ind-ia-${t}-${n}`,titulo:typeof e==`string`?e:e.titulo||`Contenido Evaluables`,prerrequisitoId:n>0?`ind-ia-${t}-${n-1}`:null}))})),y(t),e.show(`Planificación semestral generada con éxito`,`success`)),n&&(n.disabled=!1)})},150)}async function D(e){if(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando mis planificaciones...</span>
      </div>
    </div>
  `;try{_e(e,await s())}catch(n){console.error(`[MaestroPlanificacionView] Error:`,n),e.innerHTML=`
      <div class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar las planificaciones: ${t(n.message)}
      </div>
    `}}}function _e(n,r){let i=`todos`,a=()=>{let a=r.filter(e=>i===`todos`?!0:i===`borrador`?e.estado===`borrador`:i===`revisada`?e.estado===`revisada`:i!==`publicada`||e.estado===`publicada`),o=n.querySelector(`#maestro-planes-list`);if(o){if(a.length===0){o.innerHTML=`
        <div class="col-12">
          <div class="card border-0 bg-body-secondary text-center py-5 rounded-4">
            <div class="card-body">
              <i class="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
              <h5 class="fw-semibold">No tenés planificaciones cargadas</h5>
              <p class="text-muted small max-w-md mx-auto mb-3">
                Creá tu primer plan didáctico para organizar los contenidos y objetivos de tus clases.
              </p>
              <button class="btn btn-primary btn-sm rounded-3" id="btn-crear-primer-plan">
                <i class="bi bi-plus-lg me-1"></i>Crear Plan Didáctico
              </button>
            </div>
          </div>
        </div>
      `,o.querySelector(`#btn-crear-primer-plan`)?.addEventListener(`click`,()=>{E({onSaved:()=>D(n)})});return}o.innerHTML=a.map(e=>{let n=ve(e.estado),r=Array.isArray(e.contenidos)?e.contenidos:typeof e.contenidos==`string`?[e.contenidos]:[];return`
        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card h-100 border-0 shadow-sm rounded-3 hover-shadow transition-all">
            <div class="card-body d-flex flex-direction-column justify-content-between p-3">
              <div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.75rem;">
                    <i class="bi bi-easel me-1"></i>${t(e.clase_nombre||e.clases?.nombre||e.claseId||`Sin clase asignada`)}
                  </span>
                  ${n}
                </div>
                <h6 class="card-title fw-bold text-body mb-2">${t(e.titulo||`Plan sin título`)}</h6>
                <div class="text-muted mb-3" style="font-size:0.78rem;">
                  <i class="bi bi-calendar3 me-1"></i>Semana ${e.semana||1} · ${e.fecha?e.fecha.slice(0,10):`—`}
                </div>

                ${r.length>0?`
                  <div class="bg-body-tertiary p-2 rounded-2 mb-3" style="font-size:0.8rem;">
                    <div class="fw-semibold text-muted mb-1" style="font-size:0.72rem; text-transform:uppercase;">Contenidos / Objetivos:</div>
                    <ul class="mb-0 ps-3">
                      ${r.slice(0,3).map(e=>`<li>${t(e)}</li>`).join(``)}
                      ${r.length>3?`<li class="text-muted opacity-75">+${r.length-3} más...</li>`:``}
                    </ul>
                  </div>
                `:``}
              </div>

              <div class="pt-2 border-top d-flex align-items-center justify-content-between mt-2">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary btn-edit-plan" data-id="${e.id}" title="Editar">
                    <i class="bi bi-pencil me-1"></i>Editar
                  </button>
                  <button class="btn btn-outline-danger btn-delete-plan" data-id="${e.id}" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                ${e.estado===`borrador`?`
                  <button class="btn btn-sm btn-outline-primary btn-enviar-revision" data-id="${e.id}">
                    <i class="bi bi-send me-1"></i>Enviar ACM
                  </button>
                `:``}
              </div>
            </div>
          </div>
        </div>
      `}).join(``),o.querySelectorAll(`.btn-edit-plan`).forEach(e=>{e.addEventListener(`click`,()=>{let t=r.find(t=>String(t.id)===String(e.dataset.id));t&&E({plan:t,onSaved:()=>D(n)})})}),o.querySelectorAll(`.btn-delete-plan`).forEach(t=>{t.addEventListener(`click`,async()=>{if(confirm(`¿Estás seguro de eliminar esta planificación?`))try{await d(t.dataset.id),e.show(`Planificación eliminada`,`success`),D(n)}catch(t){e.show(`Error al eliminar: ${t.message}`,`error`)}})}),o.querySelectorAll(`.btn-enviar-revision`).forEach(t=>{t.addEventListener(`click`,async()=>{try{await f(t.dataset.id,{estado:`revisada`}),e.show(`Planificación enviada a revisión pedagógica (ACM)`,`success`),D(n)}catch(t){e.show(`Error al enviar: ${t.message}`,`error`)}})})}};n.innerHTML=`
    <div class="container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-journal-text text-primary me-2"></i>Mis Planificaciones Didácticas</h4>
          <p class="text-muted small mb-0">Gestioná las secuencias didácticas y contenidos semanales de tus clases.</p>
        </div>
        <button class="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-nuevo-plan">
          <i class="bi bi-plus-lg"></i>Nueva Planificación
        </button>
      </div>

      <div class="card border-0 bg-body-tertiary mb-4 p-2 rounded-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="btn-group btn-group-sm id="filter-tabs">
            <button class="btn btn-outline-secondary active" data-filter="todos">Todos</button>
            <button class="btn btn-outline-secondary" data-filter="borrador">Borradores</button>
            <button class="btn btn-outline-secondary" data-filter="revisada">Enviados (ACM)</button>
            <button class="btn btn-outline-secondary" data-filter="publicada">Aprobados</button>
          </div>
          <span class="text-muted small"><strong id="planes-count">${r.length}</strong> planificaciones registradas</span>
        </div>
      </div>

      <div class="row g-3" id="maestro-planes-list"></div>
    </div>
  `,n.querySelector(`#btn-nuevo-plan`)?.addEventListener(`click`,()=>{E({onSaved:()=>D(n)})}),n.querySelectorAll(`#filter-tabs button`).forEach(e=>{e.addEventListener(`click`,()=>{n.querySelectorAll(`#filter-tabs button`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),i=e.dataset.filter,a()})}),a()}function ve(e){return e===`publicada`?`<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i>Aprobado</span>`:e===`revisada`?`<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="bi bi-clock me-1"></i>En Revisión</span>`:`<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="bi bi-pencil-square me-1"></i>Borrador</span>`}var O=class{static calcular({semanasTotales:e=24,semanaActual:t=1,totalIndicadores:n=1,indicadoresCompletados:r=0}){let i=Math.max(e,1),a=Math.min(Math.max(t,1),i),o=Math.max(n,1),s=Math.round(a/i*100),c=Math.min(Math.round(r/o*100),100),l=c-s,u=null;return l<=-15?u={nivel:`critico`,codigo:`DESFASE_CRITICO`,mensaje:`⚠️ Alerta de Desfase Crítico: Se esperaba ${s}% (Semana ${a}/${i}), pero el avance real es ${c}% (${l}%). Requiere justificación.`,desfasePct:l,requiereJustificacion:!0}:l<=-8&&(u={nivel:`moderado`,codigo:`DESFASE_MODERADO`,mensaje:`🟡 Alerta de Retraso Moderado: Avance real ${c}% vs. esperado ${s}%.`,desfasePct:l,requiereJustificacion:!1}),{semanasTotales:i,semanaActual:a,avanceEsperadoPct:s,avanceRealPct:c,desfasePct:l,alertaDesfase:u}}};function ye({plan:n,calculoDesfase:i,onSubmitted:a=null}){if(!n)return;let o=`
    <div>
      <div class="alert alert-warning p-3 mb-3 border-warning">
        <h6 class="fw-bold mb-1"><i class="bi bi-clock-history me-1"></i>Diagnóstico de Desfase de Tiempo</h6>
        <p class="small mb-0">
          <strong>Semana ${i.semanaActual} de ${i.semanasTotales}</strong><br/>
          Avance Esperado: <strong>${i.avanceEsperadoPct}%</strong> | Avance Real: <strong>${i.avanceRealPct}%</strong> (${i.desfasePct}%).
        </p>
      </div>

      <form id="form-justificacion-desfase">
        <div class="mb-3">
          <label class="form-label fw-semibold">Motivo Principal del Desfase <span class="text-danger">*</span></label>
          <select class="form-select" id="justificacion-motivo" required>
            <option value="">-- Seleccionar Causa --</option>
            <option value="salud">Licencia / Motivos de Salud del Docente</option>
            <option value="ensayos">Ensayos Extraordinarios o Concierto Institucional</option>
            <option value="feriados">Días Feriados / Suspensión de Actividades</option>
            <option value="nivelacion">Necesidad de Nivelación Técnica del Grupo</option>
            <option value="otro">Otro motivo justificado</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Explicación y Plan de Ajuste Pedagógico <span class="text-danger">*</span></label>
          <textarea class="form-control" id="justificacion-detalle" rows="4" placeholder="Detallá las razones del atraso y cómo proponés ajustar el cronograma con Coordinación ACM..." required></textarea>
        </div>
      </form>
    </div>
  `;r.open({title:`📝 Justificar Desfase: ${t(n.titulo||`Planificación`)}`,size:`lg`,saveText:`Enviar Justificación a ACM`,cancelText:`Cancelar`,body:o,onSave:async()=>{let t=document.querySelector(`#justificacion-motivo`)?.value,r=document.querySelector(`#justificacion-detalle`)?.value?.trim();return!t||!r?(e.show(`Por favor completá la causa y la explicación detallada.`,`error`),!1):(a?.({planId:n.id,motivo:t,detalle:r,desfasePct:i.desfasePct,fecha:new Date().toISOString()}),e.show(`Justificación enviada a la Coordinación ACM con éxito`,`success`),!0)}})}async function k(e){if(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando revisiones pedagógicas...</span>
      </div>
    </div>
  `;try{be(e,await s())}catch(n){console.error(`[AcmAprobacionView] Error:`,n),e.innerHTML=`
      <div class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar revisiones: ${t(n.message)}
      </div>
    `}}}function be(n,r){let i=`revisada`,a=new Set,o=()=>{let o=r.filter(e=>i===`todos`?!0:i===`revisada`?e.estado===`revisada`:i===`publicada`?e.estado===`publicada`:i!==`borrador`||e.estado===`borrador`),c=n.querySelector(`#acm-planes-tbody`),l=n.querySelector(`#acm-pendientes-count`);if(l&&(l.textContent=r.filter(e=>e.estado===`revisada`).length),c){if(o.length===0){c.innerHTML=`
        <tr>
          <td colspan="6" class="text-center py-5 text-muted">
            <i class="bi bi-check-all display-5 text-success d-block mb-2"></i>
            <strong>No hay planificaciones pendientes en este filtro.</strong>
          </td>
        </tr>
      `;return}c.innerHTML=o.map(e=>{let n=a.has(String(e.id)),r=e.maestro_nombre||e.maestros?.nombre_completo||`Maestro`,i=e.clase_nombre||e.clases?.nombre||`Clase ${e.clase_id}`,o=O.calcular({semanasTotales:e.semanasTotales||24,semanaActual:e.semana||12,totalIndicadores:e.totalIndicadores||10,indicadoresCompletados:e.indicadoresCompletados||3});return`
        <tr>
          <td class="text-center">
            <input type="checkbox" class="form-check-input chk-plan" data-id="${e.id}" ${n?`checked`:``}>
          </td>
          <td>
            <div class="fw-bold text-body">${t(e.titulo||`Plan sin título`)}</div>
            <small class="text-muted">Semana ${e.semana||1} · ${e.fecha?e.fecha.slice(0,10):``}</small>
            ${o.alertaDesfase?`
              <div class="mt-1">
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style="font-size:0.7rem;">
                  <i class="bi bi-clock-history me-1"></i>Desfase: ${o.desfasePct}% (${o.avanceRealPct}% real vs ${o.avanceEsperadoPct}% esp.)
                </span>
              </div>
            `:``}
          </td>
          <td>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">${t(i)}</span>
          </td>
          <td>${t(r)}</td>
          <td>
            ${xe(e.estado)}
          </td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              ${e.estado===`publicada`?``:`
                <button class="btn btn-sm btn-success btn-aprobar-plan" data-id="${e.id}" title="Aprobar">
                  <i class="bi bi-check-lg me-1"></i>Aprobar
                </button>
              `}
              <button class="btn btn-sm btn-outline-primary btn-promocionar-plantilla" data-id="${e.id}" title="Promocionar a Plantilla Oficial Institucional">
                <i class="bi bi-star me-1"></i>Hacer Plantilla
              </button>
              ${o.alertaDesfase?`
                <button class="btn btn-sm btn-outline-warning btn-justificar-desfase" data-id="${e.id}" title="Justificar atraso de tiempo">
                  <i class="bi bi-exclamation-triangle me-1"></i>Justificar Atraso
                </button>
              `:``}
              ${e.estado===`revisada`?`
                <button class="btn btn-sm btn-outline-secondary btn-devolver-plan" data-id="${e.id}" title="Devolver a borrador">
                  <i class="bi bi-arrow-return-left me-1"></i>Devolver
                </button>
              `:``}
            </div>
          </td>
        </tr>
      `}).join(``),c.querySelectorAll(`.chk-plan`).forEach(e=>{e.addEventListener(`change`,()=>{e.checked?a.add(e.dataset.id):a.delete(e.dataset.id),s()})}),c.querySelectorAll(`.btn-aprobar-plan`).forEach(t=>{t.addEventListener(`click`,async()=>{try{await f(t.dataset.id,{estado:`publicada`}),e.show(`Planificación aprobada y publicada`,`success`),k(n)}catch(t){e.show(`Error al aprobar: ${t.message}`,`error`)}})}),c.querySelectorAll(`.btn-promocionar-plantilla`).forEach(t=>{t.addEventListener(`click`,async()=>{try{await f(t.dataset.id,{esPlantillaOficial:!0,estado:`publicada`}),e.show(`Planificación promocionada a Plantilla Oficial Institucional ⭐`,`success`),k(n)}catch(t){e.show(`Error al promocionar: ${t.message}`,`error`)}})}),c.querySelectorAll(`.btn-justificar-desfase`).forEach(t=>{t.addEventListener(`click`,()=>{let i=r.find(e=>String(e.id)===String(t.dataset.id));i&&ye({plan:i,calculoDesfase:O.calcular({semanasTotales:i.semanasTotales||24,semanaActual:i.semana||12,totalIndicadores:i.totalIndicadores||10,indicadoresCompletados:i.indicadoresCompletados||3}),onSubmitted:t=>{e.show(`Justificación registrada. Notificada a Coordinación ACM.`,`success`),k(n)}})})}),c.querySelectorAll(`.btn-devolver-plan`).forEach(t=>{t.addEventListener(`click`,async()=>{try{await f(t.dataset.id,{estado:`borrador`}),e.show(`Planificación devuelta a borrador`,`info`),k(n)}catch(t){e.show(`Error al devolver: ${t.message}`,`error`)}})})}},s=()=>{let e=n.querySelector(`#btn-aprobar-masivo`);e&&(e.disabled=a.size===0,e.innerHTML=`<i class="bi bi-check2-all me-1"></i>Aprobar Seleccionados (${a.size})`)};n.innerHTML=`
    <div class="container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-shield-check text-primary me-2"></i>Portal ACM: Gobernanza y Aprobación Curricular</h4>
          <p class="text-muted small mb-0">Revisión de planificaciones, alertas de velocidad temporal y co-construcción pedagógica.</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-crear-disenador-full">
            <i class="bi bi-journal-plus"></i>Diseñar Plan Completo (ACM)
          </button>
          <button class="btn btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-ver-ruta-full">
            <i class="bi bi-diagram-3"></i>Ver Ruta SVG Completa
          </button>
          <button class="btn btn-success d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-aprobar-masivo" disabled>
            <i class="bi bi-check2-all"></i>Aprobar Seleccionados (0)
          </button>
        </div>
      </div>

      <div class="card border-0 bg-body-tertiary mb-4 p-2 rounded-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="btn-group btn-group-sm" id="acm-filter-tabs">
            <button class="btn btn-outline-secondary active" data-filter="revisada">
              Pendientes de Revisión <span class="badge bg-warning text-dark ms-1" id="acm-pendientes-count">0</span>
            </button>
            <button class="btn btn-outline-secondary" data-filter="publicada">Aprobados</button>
            <button class="btn btn-outline-secondary" data-filter="borrador">Borradores</button>
            <button class="btn btn-outline-secondary" data-filter="todos">Todos</button>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px;" class="text-center">
                  <input type="checkbox" class="form-check-input" id="chk-select-all">
                </th>
                <th>Título / Plan</th>
                <th>Clase</th>
                <th>Maestro</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="acm-planes-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `,n.querySelector(`#btn-crear-disenador-full`)?.addEventListener(`click`,()=>{x.navigate(`planificacion-disenador`)}),n.querySelector(`#btn-ver-ruta-full`)?.addEventListener(`click`,()=>{x.navigate(`planificacion-ruta`)}),n.querySelector(`#chk-select-all`)?.addEventListener(`change`,e=>{let t=e.target.checked;n.querySelectorAll(`.chk-plan`).forEach(e=>{e.checked=t,t?a.add(e.dataset.id):a.delete(e.dataset.id)}),s()}),n.querySelector(`#btn-aprobar-masivo`)?.addEventListener(`click`,async()=>{if(a.size!==0)try{await c(Array.from(a)),e.show(`${a.size} planificaciones aprobadas con éxito`,`success`),a.clear(),k(n)}catch(t){e.show(`Error en aprobación masiva: ${t.message}`,`error`)}}),n.querySelectorAll(`#acm-filter-tabs button`).forEach(e=>{e.addEventListener(`click`,()=>{n.querySelectorAll(`#acm-filter-tabs button`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),i=e.dataset.filter,a.clear(),s(),o()})}),o()}function xe(e){return e===`publicada`?`<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i>Aprobado</span>`:e===`revisada`?`<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="bi bi-clock me-1"></i>Pendiente ACM</span>`:`<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="bi bi-pencil-square me-1"></i>Borrador</span>`}async function Se(e){if(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando métricas de cobertura curricular...</span>
      </div>
    </div>
  `;try{Ce(e,await u(null))}catch(n){console.error(`[CoberturaCurricularView] Error:`,n),e.innerHTML=`
      <div class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar la cobertura curricular: ${t(n.message)}
      </div>
    `}}}function Ce(e,n){let r=Array.isArray(n)?n:n?.clases||[],i=r.length,a=r.filter(e=>e.plan_id||e.tienePlan||e.planificacion).length,o=i>0?Math.round(a/i*100):0;e.innerHTML=`
    <div class="container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-grid-3x3-gap text-primary me-2"></i>Cobertura Curricular e Indicadores</h4>
          <p class="text-muted small mb-0">Auditoría del avance pedagógico y cumplimiento del currículo institucional por clase.</p>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-3 p-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 bg-primary-subtle text-primary p-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px;">
                <i class="bi bi-easel2 fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold text-uppercase">Total de Clases</div>
                <h3 class="fw-bold mb-0">${i}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-3 p-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 bg-success-subtle text-success p-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px;">
                <i class="bi bi-journal-check fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold text-uppercase">Clases con Plan Didáctico</div>
                <h3 class="fw-bold mb-0">${a} <span class="fs-6 fw-normal text-muted">(${o}%)</span></h3>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-3 p-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 ${o>=80?`bg-success-subtle text-success`:`bg-warning-subtle text-warning`} p-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px;">
                <i class="bi bi-graph-up-arrow fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold text-uppercase">Cobertura Curricular Media</div>
                <h3 class="fw-bold mb-0">${o}%</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Table -->
      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div class="card-header bg-body-tertiary border-0 fw-bold py-3">
          <i class="bi bi-list-task me-2 text-primary"></i>Detalle de Cobertura por Clase
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Clase / Asignatura</th>
                <th>Maestro Asignado</th>
                <th>Estado del Plan</th>
                <th>Avance Curricular</th>
              </tr>
            </thead>
            <tbody>
              ${r.length===0?`
                <tr><td colspan="4" class="text-center py-4 text-muted">Sin datos de clases disponibles.</td></tr>
              `:r.map(e=>{let n=e.nombre||e.name||`Clase ${e.id}`,r=e.maestro_nombre||e.maestro||`Sin asignar`,i=!!(e.plan_id||e.tienePlan||e.planificacion),a=e.porcentaje||(i?85:0);return`
                  <tr>
                    <td><strong class="text-body">${t(n)}</strong></td>
                    <td>${t(r)}</td>
                    <td>
                      ${i?`<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-lg me-1"></i>Plan Vigente</span>`:`<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="bi bi-exclamation-triangle me-1"></i>Sin Plan</span>`}
                    </td>
                    <td style="min-width: 180px;">
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 8px;">
                          <div class="progress-bar ${a>=75?`bg-success`:a>=40?`bg-primary`:`bg-danger`}" role="progressbar" style="width: ${a}%;"></div>
                        </div>
                        <span class="small fw-semibold text-muted" style="min-width: 38px;">${a}%</span>
                      </div>
                    </td>
                  </tr>
                `}).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}var A={route_versions:[{id:`demo-route-version-1`,route_id:`demo-route-1`,clase_id:`demo-clase-1`,origen:`acm`,status:`published`,propuesta_por:null,feedback:null,created_at:`2026-06-01T10:00:00Z`},{id:`demo-route-version-propuesta-1`,route_id:`demo-route-1`,clase_id:`demo-clase-1`,origen:`maestro`,status:`propuesta`,propuesta_por:`demo-maestro-1`,feedback:null,created_at:`2026-07-01T09:00:00Z`}],levels:[{id:`demo-level-1`,route_version_id:`demo-route-version-1`,level_number:1,name:`Nivel 1 — Iniciación`},{id:`demo-level-2`,route_version_id:`demo-route-version-1`,level_number:2,name:`Nivel 2 — Intermedio`},{id:`demo-level-propuesta-1`,route_version_id:`demo-route-version-propuesta-1`,level_number:1,name:`Nivel 1 — Propuesto`}],nodes:[{id:`demo-node-1`,level_id:`demo-level-1`,name:`Postura`,order_index:0},{id:`demo-node-2`,level_id:`demo-level-2`,name:`Escalas`,order_index:0},{id:`demo-node-propuesta-1`,level_id:`demo-level-propuesta-1`,name:`Repertorio inicial`,order_index:0}],objetivos:[{id:`demo-obj-1`,node_id:`demo-node-1`,nombre:`Mantener la espalda recta`,order_index:0,activo:!0},{id:`demo-obj-2`,node_id:`demo-node-2`,nombre:`Tocar la escala de Do Mayor`,order_index:0,activo:!0},{id:`demo-obj-propuesta-1`,node_id:`demo-node-propuesta-1`,nombre:`Interpretar una pieza simple`,order_index:0,activo:!0}],indicators:[{id:`demo-ind-1`,objetivo_id:`demo-obj-1`,description:`Espalda alineada durante toda la sesión`,is_required:!0,order_index:0},{id:`demo-ind-2`,objetivo_id:`demo-obj-1`,description:`Hombros relajados`,is_required:!1,order_index:1},{id:`demo-ind-3`,objetivo_id:`demo-obj-2`,description:`Ejecuta la escala ascendente sin errores`,is_required:!0,order_index:0},{id:`demo-ind-propuesta-1`,objetivo_id:`demo-obj-propuesta-1`,description:`Ejecuta la pieza de memoria`,is_required:!0,order_index:0}],indicator_attempts:[{id:`demo-attempt-1`,student_id:`demo-alumno-1`,indicator_id:`demo-ind-2`,result:`approved`}]},we=`curriculo_tres_planos_route_versions_demo`,Te=2,j=null;function M(){if(j===null){try{let e=localStorage.getItem(we);if(e){let t=JSON.parse(e);if(t&&t.schemaVersion===Te&&Array.isArray(t.rows)){j=t.rows;return}}}catch{}j=JSON.parse(JSON.stringify(A.route_versions)),N()}}function N(){try{localStorage.setItem(we,JSON.stringify({rows:j,schemaVersion:Te}))}catch(e){console.warn(`[curriculoTresPlanosStore] Failed to persist:`,e.message)}}function Ee(){return M(),j}function P(e){return M(),j.find(t=>t.id===e)||null}function De(e){return M(),j.push(e),N(),{...e}}function F(e,t){M();let n=j.findIndex(t=>t.id===e);if(n===-1)throw Error(`Propuesta no encontrada.`);return j[n]={...j[n],...t,updated_at:new Date().toISOString()},N(),{...j[n]}}function Oe(e){return e?.estructura?.niveles?e.estructura.niveles.map((t,n)=>({id:`${e.id}-level-${n}`,level_number:t.numero_nivel??n+1,name:t.nombre,nodes:(t.temas||[]).map((t,r)=>({id:`${e.id}-node-${n}-${r}`,name:t.nombre,objetivos:(t.objetivos||[]).map((t,i)=>({id:`${e.id}-obj-${n}-${r}-${i}`,nombre:t.nombre,indicators:(t.indicadores||[]).map((t,a)=>({id:`${e.id}-ind-${n}-${r}-${i}-${a}`,description:t.descripcion,is_required:t.es_requerido!==!1}))}))}))})):A.levels.filter(t=>t.route_version_id===e.id).map(e=>({...e,nodes:A.nodes.filter(t=>t.level_id===e.id).map(e=>({...e,objetivos:A.objetivos.filter(t=>t.node_id===e.id).map(e=>({...e,indicators:A.indicators.filter(t=>t.objetivo_id===e.id)}))}))}))}var ke=n({devolverPropuesta:()=>Me,listarPropuestasPendientes:()=>Ae,publicarPropuesta:()=>je});function I(e=80){return new Promise(t=>setTimeout(t,e))}async function Ae(){return await I(),Ee().filter(e=>e.origen===`maestro`&&e.status===`propuesta`).map(e=>({...e,levels:Oe(e)}))}async function je(e){if(!e)throw Error(`publicarPropuesta: se requiere routeVersionId.`);if(await I(),!P(e))throw Error(`Propuesta no encontrada.`);return F(e,{status:`published`})}async function Me(e,t){if(!e)throw Error(`devolverPropuesta: se requiere routeVersionId.`);if(!t||!t.trim())throw Error(`devolverPropuesta: se requiere feedback para explicar el motivo de la devolución.`);if(await I(),!P(e))throw Error(`Propuesta no encontrada.`);return F(e,{status:`devuelta`,feedback:t.trim()})}var Ne=n({devolverPropuesta:()=>Ie,listarPropuestasPendientes:()=>Pe,publicarPropuesta:()=>Fe});async function Pe(){let{data:e,error:t}=await i.from(`route_versions`).select(`*, levels(id, level_number, nodes(id, name, objetivos(id, nombre, indicators(id, description))))`).eq(`origen`,`maestro`).eq(`status`,`propuesta`).order(`created_at`,{ascending:!1});if(t)throw t;return e||[]}async function Fe(e){if(!e)throw Error(`publicarPropuesta: se requiere routeVersionId.`);let{data:t,error:n}=await i.from(`route_versions`).update({status:`published`,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(n)throw n;return t}async function Ie(e,t){if(!e)throw Error(`devolverPropuesta: se requiere routeVersionId.`);if(!t||!t.trim())throw Error(`devolverPropuesta: se requiere feedback para explicar el motivo de la devolución.`);let{data:n,error:r}=await i.from(`route_versions`).update({status:`devuelta`,feedback:t.trim(),updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(r)throw r;return n}var L=a.isDemoMode?ke:Ne,Le=()=>L.listarPropuestasPendientes(),Re=e=>L.publicarPropuesta(e),ze=(e,t)=>L.devolverPropuesta(e,t);async function R(e){e.innerHTML=`
    <div class="acm-propuestas-container">
      <div class="acm-propuestas-header">
        <h1>Propuestas de Maestros</h1>
        <p>Revisá el contenido curricular propuesto y decidí si publicarlo o devolverlo con feedback.</p>
      </div>
      <div class="acm-propuestas-body" style="display:flex; gap:1.5rem;">
        <div class="acm-propuestas-list" id="acm-propuestas-list" style="flex: 0 0 320px;"></div>
        <div class="acm-propuestas-detail" id="acm-propuestas-detail" style="flex:1;">
          <p class="acm-placeholder">Seleccione una propuesta para revisarla.</p>
        </div>
      </div>
    </div>
  `;let n=e.querySelector(`#acm-propuestas-list`),r=e.querySelector(`#acm-propuestas-detail`),i=[];try{i=await Le()}catch(e){console.error(`[acmPropuestasView] Error cargando propuestas:`,e),n.innerHTML=`<p class="acm-error">Error al cargar propuestas: ${t(e.message)}</p>`;return}if(!i.length){n.innerHTML=`<p class="acm-placeholder">No hay propuestas pendientes de revisión.</p>`;return}n.innerHTML=i.map(e=>`
      <button type="button" class="acm-propuesta-item" data-propuesta-id="${t(e.id)}">
        <strong>Clase: ${t(e.clase_id||`sin clase`)}</strong>
        <span class="acm-propuesta-fecha">${t(e.created_at||``)}</span>
      </button>
    `).join(``),n.querySelectorAll(`[data-propuesta-id]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=i.find(e=>e.id===t.dataset.propuestaId);n&&Be(r,n,{onResolved:()=>R(e)})})})}function Be(e,t,{onResolved:n}){e.innerHTML=`
    <div class="acm-propuesta-detail-inner">
      <h3>Árbol de contenido propuesto</h3>
      <div class="acm-tree">${Ve(t.levels||[])}</div>

      <div class="acm-feedback-block" style="margin-top:1rem;">
        <label for="acm-feedback-textarea">Feedback (obligatorio para devolver)</label>
        <textarea id="acm-feedback-textarea" data-role="feedback-textarea" rows="3" style="width:100%;"></textarea>
      </div>

      <div class="acm-actions" style="margin-top:1rem; display:flex; gap:0.5rem;">
        <button type="button" class="btn-apple-primary" data-action="publicar">Publicar</button>
        <button type="button" class="btn-apple-secondary" data-action="devolver">Devolver</button>
      </div>
    </div>
  `;let r=``;e.querySelector(`[data-role="feedback-textarea"]`).addEventListener(`input`,e=>{r=e.target.value}),e.querySelector(`[data-action="publicar"]`).addEventListener(`click`,async()=>{try{await Re(t.id),n()}catch(e){console.error(`[acmPropuestasView] Error al publicar:`,e),window.alert(`Error al publicar: ${e.message}`)}}),e.querySelector(`[data-action="devolver"]`).addEventListener(`click`,async()=>{if(!r.trim()){window.alert(`Escriba un feedback antes de devolver la propuesta.`);return}try{await ze(t.id,r),n()}catch(e){console.error(`[acmPropuestasView] Error al devolver:`,e),window.alert(`Error al devolver: ${e.message}`)}})}function Ve(e){return e.length?e.slice().sort((e,t)=>(e.level_number||0)-(t.level_number||0)).map(e=>`
      <div class="acm-tree-level">
        <strong>Nivel ${t(String(e.level_number??``))}</strong>
        ${(e.nodes||[]).map(e=>`
          <div class="acm-tree-node" style="margin-left:1rem;">
            <em>${t(e.name||``)}</em>
            ${(e.objetivos||[]).map(e=>`
              <div class="acm-tree-objetivo" style="margin-left:1rem;">
                ${t(e.nombre||``)}
                <ul>
                  ${(e.indicators||[]).map(e=>`<li>${t(e.description||``)}</li>`).join(``)}
                </ul>
              </div>
            `).join(``)}
          </div>
        `).join(``)}
      </div>
    `).join(``):`<p class="acm-placeholder">Esta propuesta no tiene niveles.</p>`}var He=[`borrador`,`activo`,`archivado`];async function Ue(e,t){if(!e||!t)throw Error(`claseId y routeVersionId son requeridos`);let{data:n}=await i.from(`class_curriculum_plan`).select(`id`).eq(`clase_id`,e).eq(`estado`,`activo`).maybeSingle();n?.id&&await i.from(`class_curriculum_plan`).update({estado:`archivado`}).eq(`id`,n.id);let{data:r,error:a}=await i.from(`class_curriculum_plan`).insert({clase_id:e,route_version_id:t,estado:`activo`}).select().single();if(a)throw a;return r}async function We(e){let{data:t,error:n}=await i.from(`class_curriculum_plan`).select(`*`).eq(`clase_id`,e).eq(`estado`,`activo`).maybeSingle();if(n)throw n;return t}async function Ge(e,t){if(!He.includes(t))throw Error(`Estado no válido`);let{data:n,error:r}=await i.from(`class_curriculum_plan`).update({estado:t}).eq(`clase_id`,e).select().single();if(r)throw r;return n}var Ke=[`nombre`,`descripcion`,`order_index`];async function qe(e){if(!Array.isArray(e)||e.length===0)throw Error(`Se requiere al menos un objetivo`);let t=e.map(e=>({clase_id:e.clase_id,level_id:e.level_id,nombre:e.nombre,descripcion:e.descripcion||null,orden_objetivo:e.orden_objetivo??null,origen_node_id:e.origen_node_id||null,origen_objetivo_id:e.origen_objetivo_id||null,created_by:e.created_by||null})),{data:n,error:r}=await i.from(`clase_mapa_objetivos`).insert(t).select();if(r)throw r;return n}async function z(e){let{data:t,error:n}=await i.from(`clase_mapa_objetivos`).select(`*`).eq(`clase_id`,e).is(`archived_at`,null).order(`order_index`);if(n)throw n;return t||[]}async function Je(e,t){let n={};for(let e of Ke)t[e]!==void 0&&(n[e]=t[e]);if(Object.keys(n).length===0)throw Error(`No hay campos válidos para actualizar (permitidos: nombre, descripcion, order_index)`);let{data:r,error:a}=await i.from(`clase_mapa_objetivos`).update(n).eq(`id`,e).select().single();if(a)throw a;return r}async function Ye(e){let{error:t}=await i.from(`clase_mapa_objetivos`).delete().eq(`clase_id`,e);if(t)throw t}var Xe=class{constructor(){this.planificacion=null,this.rutaAsignada=null,this.objetivos=[],this.evaluaciones=[],this.progresoAlumnos=[],this.cargando=!1,this.error=null,this._listeners=[]}subscribe(e){return this._listeners.push(e),()=>{this._listeners=this._listeners.filter(t=>t!==e)}}_notify(){this._listeners.forEach(e=>e(this))}async fetchRutaDeClase(e){this.cargando=!0,this.error=null,this._notify();try{return this.rutaAsignada=await We(e),this.cargando=!1,this._notify(),this.rutaAsignada}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async asignarRuta(e,t){this.cargando=!0,this.error=null,this._notify();try{let n=await Ue(e,t);return this.rutaAsignada=n,this.cargando=!1,this._notify(),n}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async cambiarEstado(e,t){this.cargando=!0,this.error=null,this._notify();try{let n=await Ge(e,t);return this.cargando=!1,this._notify(),n}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async fetchObjetivos(e){this.cargando=!0,this.error=null,this._notify();try{return this.objetivos=await z(e),this.cargando=!1,this._notify(),this.objetivos}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async agregarObjetivos(e,t,n){this.cargando=!0,this.error=null,this._notify();try{let r=await qe(n.map(n=>({planificacion_id:e,class_curriculum_plan_id:t,node_id:n.node_id,indicator_id:n.indicator_id,semana:n.semana||null})));return this.objetivos=await z(e),this.cargando=!1,this._notify(),r}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async actualizarObjetivo(e,t){this.cargando=!0,this.error=null,this._notify();try{let n=await Je(e,t);return this.cargando=!1,this._notify(),n}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async eliminarObjetivos(e){this.cargando=!0,this.error=null,this._notify();try{await Ye(e),this.objetivos=[],this.cargando=!1,this._notify()}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async evaluarAlumno(e){this.cargando=!0,this.error=null,this._notify();try{let t=await m(e);return this.evaluaciones=await _(e.clase_id),this.cargando=!1,this._notify(),t}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async fetchEvaluaciones(e){this.cargando=!0,this.error=null,this._notify();try{return this.evaluaciones=await _(e),this.cargando=!1,this._notify(),this.evaluaciones}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}async fetchProgresoAlumnos(e){this.cargando=!0,this.error=null,this._notify();try{return this.progresoAlumnos=await y(e),this.cargando=!1,this._notify(),this.progresoAlumnos}catch(e){throw this.error=e.message,this.cargando=!1,this._notify(),e}}reset(){this.planificacion=null,this.rutaAsignada=null,this.objetivos=[],this.evaluaciones=[],this.progresoAlumnos=[],this.cargando=!1,this.error=null,this._notify()}},B=null;function Ze(){return B||=new Xe,B}var V=Ze();function Qe(e){if(!e)return;let t=V.subscribe(()=>H(e));return H(e),V.fetchRutaDeClase(``).catch(()=>{}),()=>t()}function H(e){if(V.cargando&&!V.rutaAsignada&&V.objetivos.length===0){e.innerHTML=`
      <div class="clase-plan-view">
        <div class="d-flex justify-content-center align-items-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>`;return}if(V.error&&!V.rutaAsignada){e.innerHTML=`
      <div class="clase-plan-view">
        <div class="alert alert-warning d-flex align-items-start gap-3 m-3" role="alert">
          <i class="bi bi-exclamation-triangle fs-4 text-warning mt-1"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar planificación</h5>
            <p class="mb-0 small">${U(V.error)}</p>
          </div>
        </div>
      </div>`;return}let t=V.rutaAsignada,n=V.objetivos||[];e.innerHTML=`
    <div class="clase-plan-view">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-journal-check fs-4"></i>
        </div>
        <div>
          <h4 class="fw-bold mb-0">Planificación de Clase</h4>
          <p class="text-muted small mb-0">Vinculá indicadores curriculares y evaluá el progreso de tus alumnos</p>
        </div>
      </div>

      <!-- Route Status Card -->
      ${t?$e(t):et()}

      <!-- Objectives List -->
      ${t?tt(n):``}

      <!-- Progress Panel Placeholder -->
      <div id="clase-plan-progreso-container" class="mt-4"></div>
    </div>
  `,nt(e)}function $e(e){let t=e.estado===`activo`?`Activa`:e.estado===`borrador`?`Borrador`:`Archivada`,n=e.estado===`activo`?`success`:e.estado===`borrador`?`warning`:`secondary`;return`
    <div class="page-glass rounded p-3 mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-diagram-3 text-${n}"></i>
          <div>
            <div class="fw-bold small">Ruta Asignada</div>
            <small class="text-muted">ID: ${U(e.route_version_id||e.id)}</small>
          </div>
        </div>
        <span class="badge bg-${n} bg-opacity-10 text-${n}">${t}</span>
      </div>
    </div>`}function et(){return`
    <div class="page-glass rounded p-4 mb-4 text-center">
      <i class="bi bi-diagram-3 d-block mb-2" style="font-size: 2rem; opacity: 0.3;"></i>
      <h6 class="text-muted mb-1">Sin ruta curricular asignada</h6>
      <p class="text-muted small mb-3">Asigná una ruta desde ACM para vincular indicadores a tus planificaciones.</p>
    </div>`}function tt(e){if(e.length===0)return`
      <div class="page-glass rounded p-3 mb-4">
        <div class="fw-bold small mb-2"><i class="bi bi-list-check me-1"></i>Objetivos Vinculados</div>
        <div class="text-muted small text-center py-2">No hay indicadores vinculados aún.</div>
      </div>`;let t=e.map(e=>{let t=e.estado===`completado`?`<span class="badge bg-success bg-opacity-10 text-success">Completado</span>`:e.estado===`en_progreso`?`<span class="badge bg-warning bg-opacity-10 text-warning">En proceso</span>`:`<span class="badge bg-secondary bg-opacity-10 text-secondary">Pendiente</span>`;return`
      <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-bullseye text-primary small"></i>
          <span class="small">${U(e.indicator_description||e.indicator_id)}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          ${t}
          <button class="btn btn-sm btn-outline-primary" data-action="evaluar" data-indicator-id="${e.indicator_id}" title="Evaluar">
            <i class="bi bi-clipboard-check"></i>
          </button>
        </div>
      </div>`}).join(``);return`
    <div class="page-glass rounded p-3 mb-4">
      <div class="fw-bold small mb-2"><i class="bi bi-list-check me-1"></i>Objetivos Vinculados (${e.length})</div>
      ${t}
    </div>`}function nt(e){e.querySelectorAll(`[data-action="evaluar"]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.indicatorId;document.dispatchEvent(new CustomEvent(`evaluacion:open`,{detail:{indicatorId:t}}))})})}function U(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}var rt=n({renderDisenadorCurricularView:()=>at}),it=[{id:`nivel-0`,nombre:`Nivel 0: Iniciación / Descubrimiento`,color:`success`},{id:`nivel-1`,nombre:`Nivel 1: Básico / Formación Técnica`,color:`primary`},{id:`nivel-2`,nombre:`Nivel 2: Intermedio / Desarrollo Solista`,color:`warning`},{id:`nivel-3`,nombre:`Nivel 3: Avanzado / Maestría Institucional`,color:`danger`}];async function at(e){if(!e)return;e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 450px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
        <h5 class="fw-bold text-body">Cargando Diseñador Curricular Institucional...</h5>
        <p class="text-body-secondary small">Cargando catálogo de clases y datos de alumnos reales</p>
      </div>
    </div>
  `;let t=[];try{t=await o()}catch(e){console.error(`[DisenadorCurricularView] Error:`,e)}let n={claseId:t[0]?.id||``,nivelId:`nivel-1`,frecuenciaSemanal:2,frecuenciaOrigen:`manual`,semanasTotales:24,objetivos:[{id:`obj-1`,titulo:`Dominio de Postura y Emisión Sonora Libre`,indicadores:[{id:`ind-1`,titulo:`Postura corporal equilibrada y relajada`,prerrequisitoId:null},{id:`ind-2`,titulo:`Distribución fluida del arco en cuerdas abiertas`,prerrequisitoId:`ind-1`}]},{id:`obj-2`,titulo:`Afinación y Articulación Digital`,indicadores:[{id:`ind-3`,titulo:`Colocación exacta de 1er y 2do dedo`,prerrequisitoId:`ind-2`},{id:`ind-4`,titulo:`Independencia digital a pulso 60 BPM`,prerrequisitoId:`ind-3`}]}]};ot(e,t,n)}function ot(e,n,r){let i={list:[],porNodo:new Map,currentNodoId:null,datosListos:!0},a=async()=>{i.porNodo.clear(),i.datosListos=!0,r.claseId&&(i.list=await g(r.claseId))},o=()=>{e.innerHTML=`
      <div class="container-fluid px-4 py-4">
        <!-- HEADER EN GLASSMORPHISM Y GRADIENTE HSL PREMIUM -->
        <div class="card border-0 shadow-lg rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
             style="background: linear-gradient(135deg, hsl(210, 80%, 18%), hsl(240, 75%, 26%), hsl(220, 90%, 36%));">
          
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 position-relative z-1">
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" id="btn-volver-acm" style="width:42px; height:42px;">
                <i class="bi bi-arrow-left text-dark fs-5"></i>
              </button>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-white text-primary fw-bold shadow-sm px-2 py-1">
                    <i class="bi bi-shield-check me-1"></i>Coordinación ACM & Docente
                  </span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-check-circle me-1"></i>Conectado a Datos Reales
                  </span>
                </div>
                <h2 class="fw-bold mb-0 text-white">Diseñador Curricular Institucional</h2>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-light text-primary fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-ia-generar-full">
                <i class="bi bi-magic"></i>Generar Mapeo con IA (GROQ)
              </button>
              <button type="button" class="btn btn-success fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-guardar-plan-full">
                <i class="bi bi-check-circle-fill"></i>Publicar Plan Oficial
              </button>
            </div>
          </div>
        </div>

        <!-- CONFIGURACIÓN DE CLASE Y FRECUENCIA -->
        <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 mb-4 shadow-sm">
          <h5 class="fw-bold mb-3 text-body"><i class="bi bi-sliders me-2 text-primary"></i>Parámetros Curriculares y Frecuencia Horaria</h5>
          
          <div class="row g-3">
            <div class="col-md-5">
              <label class="form-label fw-semibold text-body">Clase / Asignatura <span class="text-danger">*</span></label>
              <select class="form-select border-secondary-subtle" id="select-clase-full">
                <option value="">-- Seleccionar Clase --</option>
                ${n.map(e=>`
                  <option value="${e.id}" ${e.id===r.claseId?`selected`:``}>
                    ${t(e.nombre||e.name||`Clase ${e.id}`)}
                  </option>
                `).join(``)}
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-body">Nivel Técnico (Mundo)</label>
              <select class="form-select border-secondary-subtle" id="select-nivel-full">
                ${it.map(e=>`
                  <option value="${e.id}" ${e.id===r.nivelId?`selected`:``}>
                    ${e.nombre}
                  </option>
                `).join(``)}
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label fw-semibold text-body">Clases / Semana</label>
              <div class="input-group">
                <input type="number" class="form-control border-secondary-subtle" id="input-frecuencia-full" min="1" max="14" step="0.5" value="${r.frecuenciaSemanal}">
                <button class="btn btn-outline-primary" type="button" id="btn-auto-frecuencia" title="Detectar desde el horario de la clase">
                  <i class="bi bi-magic me-1"></i>Auto
                </button>
              </div>
            </div>

            <div class="col-12">
              <div class="alert alert-info border-info-subtle bg-info-subtle text-info-emphasis d-flex align-items-center py-2 px-3 rounded-3 mb-0 small" id="banner-frecuencia-info">
                <i class="bi bi-calendar-range display-6 me-3"></i>
                <div>
                  <strong>Cálculo Semestral:</strong> <span id="lbl-ritmo-calculado">${r.frecuenciaSemanal} clase(s)/semana ➔ ~${Math.round(r.frecuenciaSemanal*24)} clases en 6 meses (24 semanas)</span>.
                  <div class="text-body-secondary" style="font-size:0.8rem;">
                    Con 4 clases de margen para conciertos y repasos, la meta real es de <strong>~${Math.max(Math.round(r.frecuenciaSemanal*24)-4,20)} Indicadores Evaluables</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EDITOR A DOS COLUMNAS -->
        <div class="row g-4">
          <!-- ESTRUCTURA DE UNIDADES -->
          <div class="col-lg-7">
            <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="fw-bold text-body mb-0"><i class="bi bi-list-check me-2 text-primary"></i>Unidades e Indicadores de Logro</h5>
                <button type="button" class="btn btn-sm btn-outline-success" id="btn-add-objetivo-full">
                  <i class="bi bi-plus-circle me-1"></i>+ Agregar Objetivo
                </button>
              </div>

              <div id="lista-objetivos-container"></div>
            </div>
          </div>

          <!-- MAPA SVG & MATRIZ DE ALUMNOS -->
          <div class="col-lg-5">
            <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm sticky-top" style="top: 20px;">
              <h5 class="fw-bold text-body mb-2"><i class="bi bi-diagram-3 me-2 text-primary"></i>Grafo Vectorial de Ruta SVG</h5>
              <p class="text-body-secondary small mb-3">Toca cualquier nodo para consultar o ciclar la evaluación de los alumnos reales.</p>

              <div id="full-svg-canvas-container" style="min-height: 240px;"></div>

              <!-- PANEL DE ALUMNOS DE LA CLASE -->
              <div id="nodo-alumnos-eval-panel" class="mt-4 pt-3 border-top border-secondary-subtle" style="display: none;">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h6 class="fw-bold mb-0 text-body" id="lbl-nodo-eval-titulo">Alumnos en la Clase</h6>
                  <span class="badge bg-primary" id="badge-nodo-eval-estado">En Tiempo Real</span>
                </div>

                <div class="table-responsive" style="max-height: 260px;">
                  <table class="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Alumno Real</th>
                        <th class="text-center">Calificación (1-5★)</th>
                      </tr>
                    </thead>
                    <tbody id="tbody-alumnos-eval"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,st(e,n,r,i,a),W(e,r,i)};a().then(()=>o())}function W(e,n,r){let i=e.querySelector(`#lista-objetivos-container`);if(!i)return;if(n.objetivos.length===0){i.innerHTML=`
      <div class="text-center py-5 text-body-secondary border border-secondary-subtle rounded-3 bg-body">
        <i class="bi bi-journal-x display-5 d-block mb-2"></i>
        Sin objetivos agregados. Presiona <strong>"+ Agregar Objetivo"</strong>.
      </div>
    `;return}let a=[];n.objetivos.forEach(e=>{e.indicadores.forEach(t=>{a.push({id:t.id,titulo:t.titulo,objTitulo:e.titulo})})});let o=1;i.innerHTML=n.objetivos.map((e,n)=>`
    <div class="card mb-3 border border-secondary-subtle shadow-sm bg-body text-body" data-obj-idx="${n}">
      <div class="card-header bg-body-secondary d-flex align-items-center justify-content-between py-2 border-bottom border-secondary-subtle">
        <div class="d-flex align-items-center gap-2 flex-grow-1 me-2">
          <span class="badge bg-primary rounded-pill">Unidad ${n+1}</span>
          <input type="text" class="form-control form-control-sm fw-bold input-obj-title bg-body text-body" data-obj-idx="${n}" value="${t(e.titulo)}" placeholder="Título del Objetivo Pedagógico">
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger btn-del-obj" data-obj-idx="${n}" title="Eliminar Unidad">
          <i class="bi bi-trash"></i>
        </button>
      </div>

      <div class="card-body p-3">
        <label class="form-label text-body-secondary small fw-bold text-uppercase mb-2">Indicadores Evaluables (1 Clase por Indicador)</label>
        
        <div class="indicadores-wrapper">
          ${e.indicadores.map((e,r)=>`
            <div class="d-flex align-items-center gap-2 mb-2 p-2 border border-secondary-subtle rounded bg-body-tertiary" data-obj-idx="${n}" data-ind-idx="${r}">
              <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle text-nowrap">Clase ${o++}</span>
              <input type="text" class="form-control form-control-sm flex-grow-1 input-ind-title bg-body text-body" data-obj-idx="${n}" data-ind-idx="${r}" value="${t(e.titulo)}" placeholder="Objetivo evaluable de la clase">

              <select class="form-select form-select-sm select-prereq bg-body text-body" data-obj-idx="${n}" data-ind-idx="${r}" style="max-width: 190px;">
                <option value="">Sin Prerrequisito</option>
                ${a.filter(t=>t.id!==e.id).map(n=>`
                  <option value="${n.id}" ${n.id===e.prerrequisitoId?`selected`:``}>
                    Requiere: ${t(n.titulo.slice(0,18))}…
                  </option>
                `).join(``)}
              </select>

              <button type="button" class="btn btn-sm btn-link text-danger p-0 px-1 btn-del-ind" data-obj-idx="${n}" data-ind-idx="${r}">
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          `).join(``)}
        </div>

        <button type="button" class="btn btn-sm btn-link text-primary p-0 mt-1 btn-add-ind" data-obj-idx="${n}">
          <i class="bi bi-plus-short"></i>+ Añadir Clase / Indicador
        </button>
      </div>
    </div>
  `).join(``),ct(e,n,r),G(e,n,r)}function st(t,n,r,i,a){t.querySelector(`#btn-volver-acm`)?.addEventListener(`click`,()=>{x.navigate(`planificacion-acm`)}),t.querySelector(`#select-clase-full`)?.addEventListener(`change`,e=>{r.claseId=e.target.value,a().then(()=>W(t,r,i))}),t.querySelector(`#input-frecuencia-full`)?.addEventListener(`input`,e=>{r.frecuenciaSemanal=parseFloat(e.target.value||`2`),lt(t,r)}),t.querySelector(`#btn-auto-frecuencia`)?.addEventListener(`click`,()=>{let i=n.find(e=>String(e.id)===String(r.claseId));if(!i){e.show(`Selecciona primero una clase para detectar su horario`,`warning`);return}let a=2;if(Array.isArray(i.diasSemana))a=i.diasSemana.length;else if(typeof i.horario==`string`){let e=i.horario.match(/lunes|martes|miércoles|jueves|viernes|sábado|domingo/gi);e&&(a=new Set(e.map(e=>e.toLowerCase())).size)}r.frecuenciaSemanal=a;let o=t.querySelector(`#input-frecuencia-full`);o&&(o.value=a),e.show(`Horario detectado: ${a} clases/semana`,`info`),lt(t,r)}),t.querySelector(`#btn-ia-generar-full`)?.addEventListener(`click`,async()=>{let n=t.querySelector(`#btn-ia-generar-full`);n&&(n.disabled=!0),e.show(`Generando Estructura Curricular con IA (GROQ)...`,`info`);let a=await me({instrumento:`Música e Instrumento`,nivelIndex:1});a&&a.length>0&&(r.objetivos=a.map((e,t)=>({id:`obj-full-ia-${t}`,titulo:e.titulo||`Unidad Didáctica ${t+1}`,indicadores:(e.indicadores||[`Evaluación de desempeño`]).map((e,n)=>({id:`ind-full-ia-${t}-${n}`,titulo:typeof e==`string`?e:e.titulo||`Contenido Evaluables`,prerrequisitoId:n>0?`ind-full-ia-${t}-${n-1}`:null}))})),W(t,r,i),e.show(`Estructura generada por IA cargada exitosamente`,`success`)),n&&(n.disabled=!1)}),t.querySelector(`#btn-guardar-plan-full`)?.addEventListener(`click`,async()=>{if(!r.claseId){e.show(`Debes seleccionar una Clase o Agrupación`,`warning`);return}let n=[];r.objetivos.forEach(e=>{n.push(`[OBJETIVO] ${e.titulo}`),e.indicadores.forEach(e=>{n.push(`  • [CLASE] ${e.titulo}`)})});let i={clase_id:r.claseId,semana:1,titulo:`Plan Didáctico Semestral - ${r.frecuenciaSemanal} clases/sem`,nivelId:t.querySelector(`#select-nivel-full`)?.value||`nivel-1`,frecuenciaSemanal:r.frecuenciaSemanal,semanasTotales:24,objetivosEstructurados:r.objetivos,contenidos:n,estado:`publicada`,esPlantillaOficial:!0,fecha:new Date().toISOString().slice(0,10)};try{await l(i),e.show(`Plan Institucional Oficial publicado con éxito ⭐`,`success`),x.navigate(`planificacion-acm`)}catch(t){e.show(`Error al publicar plan: ${t.message}`,`error`)}}),t.querySelector(`#btn-add-objetivo-full`)?.addEventListener(`click`,()=>{let e=r.objetivos.length+1;r.objetivos.push({id:`obj-${Date.now()}`,titulo:`Unidad Didáctica ${e}`,indicadores:[{id:`ind-${Date.now()}-1`,titulo:`Contenido Evaluables 1`,prerrequisitoId:null}]}),W(t,r,i)})}function ct(e,t,n){e.querySelectorAll(`.input-obj-title`).forEach(r=>{r.addEventListener(`input`,r=>{let i=parseInt(r.target.dataset.objIdx,10);t.objetivos[i]&&(t.objetivos[i].titulo=r.target.value,G(e,t,n))})}),e.querySelectorAll(`.input-ind-title`).forEach(r=>{r.addEventListener(`input`,r=>{let i=parseInt(r.target.dataset.objIdx,10),a=parseInt(r.target.dataset.indIdx,10);t.objetivos[i]?.indicadores[a]&&(t.objetivos[i].indicadores[a].titulo=r.target.value,G(e,t,n))})}),e.querySelectorAll(`.select-prereq`).forEach(r=>{r.addEventListener(`change`,r=>{let i=parseInt(r.target.dataset.objIdx,10),a=parseInt(r.target.dataset.indIdx,10);t.objetivos[i]?.indicadores[a]&&(t.objetivos[i].indicadores[a].prerrequisitoId=r.target.value||null,G(e,t,n))})}),e.querySelectorAll(`.btn-del-obj`).forEach(r=>{r.addEventListener(`click`,()=>{let i=parseInt(r.dataset.objIdx,10);t.objetivos.splice(i,1),W(e,t,n)})}),e.querySelectorAll(`.btn-add-ind`).forEach(r=>{r.addEventListener(`click`,()=>{let i=parseInt(r.dataset.objIdx,10);if(t.objetivos[i]){let r=`ind-${Date.now()}`;t.objetivos[i].indicadores.push({id:r,titulo:`Objetivo de Clase ${t.objetivos[i].indicadores.length+1}`,prerrequisitoId:null}),W(e,t,n)}})}),e.querySelectorAll(`.btn-del-ind`).forEach(r=>{r.addEventListener(`click`,()=>{let i=parseInt(r.dataset.objIdx,10),a=parseInt(r.dataset.indIdx,10);t.objetivos[i]?.indicadores&&(t.objetivos[i].indicadores.splice(a,1),W(e,t,n))})})}function lt(e,t){let n=t.frecuenciaSemanal,r=Math.round(n*24),i=Math.max(r-4,15),a=e.querySelector(`#lbl-ritmo-calculado`);a&&(a.textContent=`${n} clase(s)/semana ➔ ~${r} clases en 6 meses (24 semanas). Meta real: ~${i} Indicadores.`)}function G(e,t,n){let r=e.querySelector(`#full-svg-canvas-container`);if(!r)return;let i=[];if(t.objetivos.forEach(e=>{e.indicadores.forEach(e=>{i.push({id:e.id,titulo:e.titulo,estado:e.prerrequisitoId?`en_proceso`:`logrado`})})}),i.length===0){r.innerHTML=`<div class="text-body-secondary small py-5 text-center">Agregá indicadores para visualizar el mapa SVG en tiempo real.</div>`;return}v({container:r,nodos:i,onNodeClick:r=>{ut(e,r,n,t)}})}function ut(n,r,i,a){let o=n.querySelector(`#nodo-alumnos-eval-panel`),s=n.querySelector(`#lbl-nodo-eval-titulo`),c=n.querySelector(`#tbody-alumnos-eval`);if(!o||!c)return;o.style.display=`block`,s&&(s.textContent=`Evaluación: ${r.titulo}`),i.currentNodoId=r.id;let l=n.querySelector(`#badge-nodo-eval-estado`),u=()=>{c.innerHTML=(i.list||[]).map(e=>`
      <tr class="row-alumno-eval${i.datosListos?``:` opacity-50`}" data-id="${e.id}" style="cursor: pointer;">
        <td class="fw-semibold text-body">${t(e.nombre)}</td>
        <td class="text-center">
          <span class="fs-6 text-warning">
            ${dt(e.estrellas)}
          </span>
          <small class="text-body-secondary ms-1">(${e.estrellas>0?`${e.estrellas}/5★`:`Sin Registrar`})</small>
        </td>
      </tr>
    `).join(``),c.querySelectorAll(`.row-alumno-eval`).forEach(t=>{t.addEventListener(`click`,()=>{if(!i.datosListos)return;let n=t.dataset.id,o=i.list.find(e=>String(e.id)===String(n));o&&(o.estrellas=b.siguienteEstrella(o.estrellas),h.guardarLocal({alumnoId:o.id,claseId:a.claseId,nodoId:r.id,estrellas:o.estrellas}),u(),e.show(`${o.nombre}: ${o.estrellas}★ registrados`,`info`))})})},d=i.porNodo.get(r.id);if(d){i.list=d,i.datosListos=!0,u();return}i.datosListos=!1,u(),l&&(l.textContent=`Actualizando…`),g(a.claseId,r.id).then(e=>{i.currentNodoId===r.id&&(i.porNodo.set(r.id,e),i.list=e,i.datosListos=!0,u(),l&&(l.textContent=`En Tiempo Real`))})}function dt(e){let t=``;for(let n=1;n<=5;n++)n<=e?t+=`<i class="bi bi-star-fill text-warning"></i>`:t+=`<i class="bi bi-star text-secondary opacity-50"></i>`;return t}var ft=n({renderRutaPedagogicaView:()=>pt});async function pt(e){if(!e)return;e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 450px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
        <h5 class="fw-bold text-body">Cargando Datos Reales de la Ruta Pedagógica...</h5>
        <p class="text-body-secondary small">Sincronizando la matriz de alumnos y evaluaciones 1-5★</p>
      </div>
    </div>
  `;let t=[],n=[];try{let[e,r]=await Promise.all([o(),s()]);t=e||[],n=r||[]}catch(e){console.error(`[RutaPedagogicaView] Error:`,e)}mt(e,t,n)}function mt(n,r,i){let a=r[0]?.id||``,o=null,s=[],c=new Map,l=!0,u=async()=>{c.clear(),l=!0,s=await g(a),p()},d=()=>{let e=n.querySelector(`#panel-alumnos-evaluacion-nodo`),r=n.querySelector(`#lbl-nodo-seleccionado`);e&&(e.style.display=o?`block`:`none`),r&&(r.innerHTML=`<i class="bi bi-award-fill text-warning me-2"></i>${t(o?.titulo||`Selecciona un Nodo`)}`)},f=()=>{let e=n.querySelector(`#tbody-alumnos-ruta`);if(!e)return;e.innerHTML=s.map(e=>{let n=e.nombre.split(` `).slice(0,2).map(e=>e[0]).join(``).toUpperCase();return`
          <tr class="row-alumno-ruta${l?``:` opacity-50`}" data-id="${e.id}" style="cursor: pointer;">
            <td>
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                     style="width: 40px; height: 40px; background: linear-gradient(135deg, hsl(220, 80%, 55%), hsl(280, 75%, 60%)); flex-shrink: 0;">
                  ${n}
                </div>
                <div>
                  <div class="fw-bold text-body fs-6">${t(e.nombre)}</div>
                  <small class="text-body-secondary">ID: ${e.id.slice(0,8)}</small>
                </div>
              </div>
            </td>

            <td class="text-center">
              <span class="badge ${e.idia>=80?`bg-success-subtle text-success`:`bg-warning-subtle text-warning-emphasis`} border px-2 py-1">
                IDIA ${e.idia}%
              </span>
            </td>

            <td class="text-center">
              <span class="badge ${e.presente?`bg-success-subtle text-success border border-success-subtle`:`bg-danger-subtle text-danger border border-danger-subtle`}">
                ${e.presente?`Presente`:`Ausente (Bloqueado)`}
              </span>
            </td>

            <td class="text-center">
              <div class="fs-4 text-warning user-select-none">
                ${gt(e.estrellas)}
              </div>
              <small class="fw-bold text-body-secondary">${e.estrellas>0?`${e.estrellas} Estrellas (${_t(e.estrellas)})`:`Sin Registrar (0★)`}</small>
            </td>

            <td class="text-end">
              <button class="btn btn-sm ${e.presente?`btn-outline-primary`:`btn-outline-secondary`} btn-evaluar-one-tap" data-id="${e.id}" ${!e.presente||!l?`disabled`:``}>
                <i class="bi bi-hand-index me-1"></i>Ciclar ★
              </button>
            </td>
          </tr>
        `}).join(``);let r=n.querySelector(`#kpi-evaluados-count`);r&&(r.textContent=`${s.filter(e=>e.estrellas>0).length} / ${s.length}`)},p=()=>{let p=i.find(e=>String(e.clase_id||e.claseId)===String(a))||i[0],m=r.find(e=>String(e.id)===String(a))||{nombre:`Clase General`},_=p?.objetivosEstructurados?ht(p):[{id:`nd-1`,titulo:`Postura corporal y emisión sonora libre`,estado:`logrado`},{id:`nd-2`,titulo:`Escala de Do Mayor en cuerdas Re-Sol`,estado:`en_proceso`},{id:`nd-3`,titulo:`Estudio Nº 4: Control de pulso a 80 BPM`,estado:`pendiente`},{id:`nd-4`,titulo:`Articulación de 1er y 2do dedo`,estado:`pendiente`},{id:`nd-5`,titulo:`Repertorio: Canción de Mayo (Suzuki)`,estado:`pendiente`}],y=s.length,ee=s.filter(e=>e.estrellas>0).length,S=Math.round(s.reduce((e,t)=>e+(t.idia||0),0)/(y||1));n.innerHTML=`
      <div class="container-fluid px-4 py-4">
        <!-- CABECERA PREMIUM EN GLASSMORPHISM / HSL GRADIENTE -->
        <div class="card border-0 shadow-lg rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
             style="background: linear-gradient(135deg, hsl(224, 76%, 16%), hsl(263, 70%, 28%), hsl(217, 91%, 35%));">
          <div class="position-absolute top-0 end-0 p-3 pe-none" style="opacity:.1;">
            <i class="bi bi-diagram-3-fill display-1"></i>
          </div>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 position-relative z-1">
            <div class="d-flex align-items-center gap-3">
              <button class="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" id="btn-volver-plan" style="width:42px; height:42px;">
                <i class="bi bi-arrow-left text-dark fs-5"></i>
              </button>
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-white text-primary fw-bold shadow-sm px-2 py-1">
                    <i class="bi bi-music-note-beamed me-1"></i>${t(m.nombre||`Clase Académica`)}
                  </span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-wifi me-1"></i>Modo Datos Reales + Sync Offline
                  </span>
                </div>
                <h2 class="fw-bold mb-0 text-white">Ruta Pedagógica Interactiva</h2>
              </div>
            </div>

            <!-- SELECTOR DE CLASE Y ACCIONES -->
            <div class="d-flex flex-wrap align-items-center gap-2">
              <select class="form-select border-0 shadow-sm text-body fw-bold" id="select-clase-ruta" style="min-width: 240px; background-color: rgba(255, 255, 255, 0.95);">
                ${r.map(e=>`
                  <option value="${e.id}" ${e.id===a?`selected`:``}>
                    ${t(e.nombre||e.name||`Clase ${e.id}`)}
                  </option>
                `).join(``)}
              </select>
              <button class="btn btn-warning fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-ir-disenador">
                <i class="bi bi-pencil-square"></i>Diseñar Estructura ACM
              </button>
            </div>
          </div>

          <!-- CHIPS DE MÉTRICAS -->
          <div class="row g-3 mt-3 pt-3 border-top border-white border-opacity-10">
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-people fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Inscritos Reales</div>
                  <div class="fw-bold fs-5">${y} Alumnos</div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-activity fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Salud IDIA Promedio</div>
                  <div class="fw-bold fs-5">${S}%</div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-check2-circle fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Evaluados en Nodo</div>
                  <div class="fw-bold fs-5" id="kpi-evaluados-count">${ee} / ${y}</div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="d-flex align-items-center gap-2">
                <div class="p-2 bg-white bg-opacity-10 rounded-3" style="background:rgba(255,255,255,.15);"><i class="bi bi-diagram-2 fs-4"></i></div>
                <div>
                  <div class="small opacity-75">Nodos Curriculares</div>
                  <div class="fw-bold fs-5">${_.length} Nodos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CANVAS SVG DE GRAFO VECTORIAL -->
        <div class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm mb-4">
          <div id="full-ruta-svg-canvas" style="min-height: 260px;"></div>
        </div>

        <!-- SECCIÓN DE EVALUACIÓN DE ALUMNOS (SE DESPLIEGA AL SELECCIONAR NODO) -->
        <div id="panel-alumnos-evaluacion-nodo" class="card border border-secondary-subtle bg-body-tertiary rounded-4 p-4 shadow-sm" style="display: ${o?`block`:`none`};">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-3 border-bottom border-secondary-subtle">
            <div>
              <h4 class="fw-bold text-body mb-1" id="lbl-nodo-seleccionado">
                <i class="bi bi-award-fill text-warning me-2"></i>${t(o?.titulo||`Selecciona un Nodo`)}
              </h4>
              <p class="text-body-secondary small mb-0">Toca la fila de cualquier alumno para ciclar la evaluación 1-5★. (0★ = Sin Registrar).</p>
            </div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6 fw-semibold">
              <i class="bi bi-hand-index-thumb me-1"></i>1-Tap Star Evaluator
            </span>
          </div>

          <!-- GRID DE TARJETAS DE ALUMNOS (DISEÑO PREMIUM A DOS COLUMNAS / TABLA) -->
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Alumno Inscrito</th>
                  <th class="text-center">Índice IDIA</th>
                  <th class="text-center">Asistencia</th>
                  <th class="text-center">Calificación (1-5★)</th>
                  <th class="text-end">Acción Rápida</th>
                </tr>
              </thead>
              <tbody id="tbody-alumnos-ruta"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;let C=n.querySelector(`#full-ruta-svg-canvas`);C&&v({container:C,nodos:_,onNodeClick:t=>{o=t,e.info(`Nodo Seleccionado: ${t.titulo}`),d();let n=c.get(t.id);if(n){s=n,l=!0,f();return}l=!1,f(),g(a,t.id).then(e=>{o?.id===t.id&&(c.set(t.id,e),s=e,l=!0,f())})}}),n.querySelector(`#btn-volver-plan`)?.addEventListener(`click`,()=>{x.navigate(`planificacion-acm`)}),n.querySelector(`#btn-ir-disenador`)?.addEventListener(`click`,()=>{x.navigate(`planificacion-disenador`)}),n.querySelector(`#select-clase-ruta`)?.addEventListener(`change`,e=>{a=e.target.value,o=null,u()}),n.querySelector(`#tbody-alumnos-ruta`)?.addEventListener(`click`,t=>{if(!l)return;let n=t.target.closest(`.row-alumno-ruta`);if(!n)return;let r=n.dataset.id,i=s.find(e=>String(e.id)===String(r));i&&i.presente&&(i.estrellas=b.siguienteEstrella(i.estrellas),h.guardarLocal({alumnoId:i.id,claseId:a,nodoId:o?.id||`nodo-1`,estrellas:i.estrellas}),f(),e.show(`${i.nombre}: ${i.estrellas}★ registrad@s en LocalStorage/Offline`,`info`))}),d(),f()};u()}function ht(e){let t=[];return Array.isArray(e.objetivosEstructurados)&&e.objetivosEstructurados.forEach(e=>{Array.isArray(e.indicadores)&&e.indicadores.forEach(n=>{t.push({id:n.id,titulo:`${e.titulo}: ${n.titulo}`,estado:n.prerrequisitoId?`en_proceso`:`logrado`})})}),t}function gt(e){let t=``;for(let n=1;n<=5;n++)n<=e?t+=`<i class="bi bi-star-fill text-warning me-1"></i>`:t+=`<i class="bi bi-star text-secondary opacity-50 me-1"></i>`;return t}function _t(e){return e===1?`Iniciado`:e===2?`En Proceso`:e===3?`Aprobado Básico`:e===4?`Logrado Fluido`:e===5?`Dominado Total`:`Sin Registrar`}function vt(){x.register(`planificacion`,e=>D(e)),x.register(`planificacion-acm`,e=>k(e)),x.register(`planificacion-maestros`,e=>k(e)),x.register(`planificacion-disenador`,e=>at(e)),x.register(`planificacion-ruta`,e=>pt(e)),x.register(`planificacion-cobertura`,e=>Se(e)),x.register(`planificacion-clase`,e=>Qe(e)),x.register(`maestro-propuestas-pendientes`,e=>R(e))}[`Ejemplo:`,`#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica`,`#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5`,``,`Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo`].join(`
`);var yt=n({PARENTESCOS:()=>bt,actualizarAlumno:()=>Tt,crearAlumno:()=>wt,eliminarAlumno:()=>Et,getParentescoLabel:()=>xt,obtenerAlumno:()=>Ct,obtenerAlumnos:()=>St,obtenerAlumnosActivos:()=>kt,obtenerAlumnosFiltradosYOrdenados:()=>Mt,obtenerAlumnosPorMes:()=>jt,obtenerAsistenciasAlumno:()=>It,obtenerInscripcionesAlumno:()=>At,obtenerInscripcionesDetalladasAlumno:()=>Lt,obtenerProgresoAlumno:()=>Pt,obtenerResumenAcademico:()=>Ft,validarCedula:()=>Ot,validarEmail:()=>Dt,verificarEliminacionAlumno:()=>Nt}),bt=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}];function xt(e){let t=bt.find(t=>t.value===e);return t?t.label:e}function K(e){if(!e)return null;let t=(e.alumnos_clases||[]).map(e=>e.clase?.nombre??``).filter(Boolean),n=t.length>0?t.join(`, `):e.clases||``;return{...e,id:e.id,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,telefono:e.familiar_telefono??``,is_active:e.activo??!0,cedula:e.representante_cedula??``,clases:n||`Sin clases`,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``,sabe_leer:e.sabe_leer??!1,sabe_escribir:e.sabe_escribir??!1,nacionalidad:e.nacionalidad??null,tiene_pasaporte:e.tiene_pasaporte??!1,como_se_entero:e.como_se_entero??null,ubicacion_maps_url:e.ubicacion_maps_url??null,tiene_conocimientos_musicales:e.tiene_conocimientos_musicales??!1,instrumento_previo:e.instrumento_previo??null,nivel_lectura_musical:e.nivel_lectura_musical??null,interes_musical:e.interes_musical??null,instrumento_interes:e.instrumento_interes??null,iniciacion_musical_requerida:e.iniciacion_musical_requerida??!1,fecha_elegible_audicion:e.fecha_elegible_audicion??null,fecha_fin_iniciacion:e.fecha_fin_iniciacion??null,alergias_descripcion:e.alergias_descripcion??null,tiene_condicion_transmisible:e.tiene_condicion_transmisible??!1,condicion_transmisible_descripcion:e.condicion_transmisible_descripcion??null,alergia_medicamento:e.alergia_medicamento??!1,alergia_medicamento_descripcion:e.alergia_medicamento_descripcion??null,impedimento_social:e.impedimento_social??!1,problemas_conducta:e.problemas_conducta??`no`,centro_estudios:e.centro_estudios??null,grado_nivel:e.grado_nivel??null,padres_en_vida:e.padres_en_vida??null,representante_nombre:e.representante_nombre??null,representante_parentesco:e.representante_parentesco??null,representante_tlf:e.representante_tlf??null,acepta_beca_4500:e.acepta_beca_4500??!1,acepta_pago_600:e.acepta_pago_600??!1,fecha_aceptacion_compromisos:e.fecha_aceptacion_compromisos??null}}async function St({page:e=0,pageSize:t=1e3}={}){let n=e*t,r=n+t-1,{data:a,error:o,count:s}=await i.from(`alumnos`).select(`*`,{count:`exact`}).order(`nombre_completo`,{ascending:!0}).range(n,r);if(o)throw console.error(`Error cargando alumnos:`,o.message),Error(`No se pudieron cargar los alumnos`);return{alumnos:(a||[]).map(K),total:s??0}}async function Ct(e){let{data:t,error:n}=await i.from(`alumnos`).select(`*`).eq(`id`,e).single();if(n)throw console.error(`Error cargando alumno:`,n.message),Error(`Alumno no encontrado`);return K(t)}async function wt(e){let t=(e.nombre||e.nombre_completo||``).trim();if(!t)throw Error(`El nombre es obligatorio`);let n=e.familia_id||null,r=!1;if(!n){let{data:e,error:a}=await i.rpc(`fn_crear_familia_para_alumno`,{p_nombre:`Familia ${t}`});if(a)throw Error(`No se pudo registrar la familia del alumno: ${a.message}`);n=e,r=!0}if(!n)throw Error(`No se pudo determinar la familia del alumno`);let a={nombre_completo:t,correo_representante:(e.email||``).trim().toLowerCase()||null,representante_cedula:(e.cedula||e.representante_cedula||``).trim()||null,instrumento_principal:(e.instrumento||``).trim()||null,activo:e.is_active===void 0||e.is_active,familiar_nombre:(e.familiar_nombre||``).trim()||null,familiar_telefono:(e.telefono||e.familiar_telefono||``).trim()||null,familiar_parentesco:(e.familiar_parentesco||``).trim()||null,contacto_emergencia_nombre:(e.contacto_emergencia_nombre||``).trim()||null,contacto_emergencia_telefono:(e.contacto_emergencia_telefono||``).trim()||null,contacto_emergencia_parentesco:(e.contacto_emergencia_parentesco||``).trim()||null,condiciones_medicas:(e.condiciones_medicas||``).trim()||null,alergias:(e.alergias||``).trim()||null,medicamentos:(e.medicamentos||``).trim()||null,sabe_leer:e.sabe_leer??null,sabe_escribir:e.sabe_escribir??null,nacionalidad:e.nacionalidad??null,tiene_pasaporte:e.tiene_pasaporte??!1,como_se_entero:e.como_se_entero??null,municipio_residencia:e.municipio_residencia??null,sector_calle_numero:e.sector_calle_numero??null,ubicacion_maps_url:e.ubicacion_maps_url??null,madre_nombre:e.madre_nombre??null,madre_cedula:e.madre_cedula??null,madre_tlf_whatsapp:e.madre_tlf_whatsapp??null,padre_nombre:e.padre_nombre??null,padre_cedula:e.padre_cedula??null,padre_tlf_whatsapp:e.padre_tlf_whatsapp??null,representante_nombre:e.representante_nombre??null,representante_parentesco:e.representante_parentesco??null,representante_tlf:e.representante_tlf??null,otro_responsable_nombre:e.otro_responsable_nombre??null,otro_responsable_cedula:e.otro_responsable_cedula??null,otro_responsable_tlf:e.otro_responsable_tlf??null,contacto_emergencia_2_nombre:e.contacto_emergencia_2_nombre??null,contacto_emergencia_2_telefono:e.contacto_emergencia_2_telefono??null,familia_monoparental:e.familia_monoparental??null,beneficiario_subsidio_estado:e.beneficiario_subsidio_estado??null,subsidio_descripcion:e.subsidio_descripcion??null,apoyo_actividades:e.apoyo_actividades??null,tiene_conocimientos_musicales:e.tiene_conocimientos_musicales??null,instrumento_previo:e.instrumento_previo??null,nivel_lectura_musical:e.nivel_lectura_musical??null,interes_musical:e.interes_musical??null,instrumento_interes:e.instrumento_interes??null,requiere_iniciacion_musical:e.tiene_conocimientos_musicales!==!0,fecha_ingreso_iniciacion:e.tiene_conocimientos_musicales===!0?null:new Date().toISOString().slice(0,10),por_que_unirse:e.por_que_unirse??null,sentimiento_musica_clasica:e.sentimiento_musica_clasica??null,sentimiento_aprender_instrumento:e.sentimiento_aprender_instrumento??null,aspiracion_instrumento:e.aspiracion_instrumento??null,musico_favorito:e.musico_favorito??null,preferencia_aprendizaje_musical:e.preferencia_aprendizaje_musical??null,tiene_alergias:e.tiene_alergias??null,alergias_descripcion:e.alergias_descripcion??null,tiene_condicion_transmisible:e.tiene_condicion_transmisible??null,condicion_transmisible_desc:e.condicion_transmisible_desc??null,tiene_alergia_medicamento:e.tiene_alergia_medicamento??null,alergia_medicamento_desc:e.alergia_medicamento_desc??null,impedimento_social:e.impedimento_social??null,problemas_conducta:e.problemas_conducta||null,centro_estudios:e.centro_estudios??null,grado_nivel:e.grado_nivel??null,padres_en_vida:e.padres_en_vida||null,acepta_beca_4500:e.acepta_beca_4500??!1,fecha_aceptacion_beca:e.acepta_beca_4500?new Date().toISOString():null,acepta_pago_600:e.acepta_pago_600??!1,fecha_aceptacion_pago:e.acepta_pago_600?new Date().toISOString():null,autoriza_fotos_redes:e.autoriza_fotos_redes??!1};a.familia_id=n;let{data:o,error:s}=await i.from(`alumnos`).insert([a]).select();if(s)throw r&&await i.rpc(`fn_eliminar_familia_huerfana`,{p_familia_id:n}).catch(()=>{}),console.error(`Error creando alumno:`,s.message),Error(s.message||`No se pudo crear el alumno`);return K(o[0])}async function Tt(e,t){let n={};Object.assign(n,t),t.nombre!==void 0&&(n.nombre_completo=t.nombre?t.nombre.trim():t.nombre),t.nombre_completo!==void 0&&(n.nombre_completo=t.nombre_completo?t.nombre_completo.trim():t.nombre_completo),t.email!==void 0&&(n.correo_representante=t.email?t.email.trim().toLowerCase():t.email),t.instrumento!==void 0&&(n.instrumento_principal=t.instrumento?t.instrumento.trim():t.instrumento),t.cedula!==void 0&&(n.representante_cedula=t.cedula?t.cedula.trim():t.cedula),t.is_active!==void 0&&(n.activo=t.is_active),t.activo!==void 0&&(n.activo=t.activo),t.telefono!==void 0&&(n.familiar_telefono=t.telefono?t.telefono.trim():t.telefono),t.familiar_telefono!==void 0&&(n.familiar_telefono=t.familiar_telefono?t.familiar_telefono.trim():t.familiar_telefono),t.familiar_nombre!==void 0&&(n.familiar_nombre=t.familiar_nombre?t.familiar_nombre.trim():t.familiar_nombre),t.familiar_parentesco!==void 0&&(n.familiar_parentesco=t.familiar_parentesco?t.familiar_parentesco.trim():t.familiar_parentesco),t.contacto_emergencia_nombre!==void 0&&(n.contacto_emergencia_nombre=t.contacto_emergencia_nombre?t.contacto_emergencia_nombre.trim():t.contacto_emergencia_nombre),t.contacto_emergencia_telefono!==void 0&&(n.contacto_emergencia_telefono=t.contacto_emergencia_telefono?t.contacto_emergencia_telefono.trim():t.contacto_emergencia_telefono),t.contacto_emergencia_parentesco!==void 0&&(n.contacto_emergencia_parentesco=t.contacto_emergencia_parentesco?t.contacto_emergencia_parentesco.trim():t.contacto_emergencia_parentesco),t.condiciones_medicas!==void 0&&(n.condiciones_medicas=t.condiciones_medicas?t.condiciones_medicas.trim():t.condiciones_medicas),t.alergias!==void 0&&(n.alergias=t.alergias?t.alergias.trim():t.alergias),t.medicamentos!==void 0&&(n.medicamentos=t.medicamentos?t.medicamentos.trim():t.medicamentos),delete n.nombre,delete n.email,delete n.instrumento,delete n.cedula,delete n.is_active,delete n.telefono,delete n.clases,delete n.genero,delete n._completitud,delete n.id;let{data:r,error:a}=await i.from(`alumnos`).update(n).eq(`id`,e).select();if(a)throw console.error(`Error actualizando alumno:`,a),a.code===`PGRST201`||a.message?.includes(`row-level security`)?Error(`No tienes permisos para actualizar este alumno. Contacta al administrador.`):Error(`No se pudo actualizar el alumno: ${a.message||`Error desconocido`}`);if(!r||r.length===0)throw Error(`Alumno no encontrado tras actualizar`);return K(r[0])}async function Et(e){let{error:t}=await i.from(`alumnos`).delete().eq(`id`,e);if(t)throw console.error(`Error eliminando alumno:`,t.message),Error(`No se pudo eliminar el alumno`)}async function Dt(e){let{data:t,error:n}=await i.from(`alumnos`).select(`id`).eq(`correo_representante`,e.trim().toLowerCase()).maybeSingle();return n&&n.code!==`PGRST116`&&console.error(`Error validando email:`,n.message),!!t}async function Ot(e){let{data:t,error:n}=await i.from(`alumnos`).select(`id`).eq(`representante_cedula`,e.trim()).maybeSingle();return n&&n.code!==`PGRST116`&&console.error(`Error validando cédula:`,n.message),!!t}async function kt(){let{data:e,error:t}=await i.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(t)throw Error(`No se pudieron cargar los alumnos`);return e.map(K)}async function At(e){let{data:t,error:n}=await i.from(`alumnos_clases`).select(`clase_id, clase:clases(nombre)`).eq(`alumno_id`,e);if(n)throw console.error(`Error cargando inscripciones de alumno:`,n.message),Error(`No se pudieron cargar las clases del alumno`);return(t||[]).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase?.nombre??`Clase sin nombre`}))}async function jt(e,t){let n=`${e}-${String(t).padStart(2,`0`)}-01`,r=new Date(e,t,0).getDate(),a=`${e}-${String(t).padStart(2,`0`)}-${r}`,{data:o,error:s}=await i.from(`alumnos`).select(`*`).gte(`created_at`,`${n}T00:00:00`).lte(`created_at`,`${a}T23:59:59`).order(`created_at`,{ascending:!0});if(s)throw Error(`No se pudieron cargar los alumnos del mes`);return o.map(K)}async function Mt({id_clase:e,instrumento:t,ordenEdadAsc:n,ordenInstrumentoAsc:r,soloActivos:a=!0}={}){let o=i.from(`alumnos`);if(o=e?o.select(`*, enrolled_class:alumnos_clases!inner(clase_id), alumnos_clases(clase:clases(nombre))`).eq(`enrolled_class.clase_id`,e):o.select(`*, alumnos_clases(clase:clases(nombre))`),a&&(o=o.eq(`activo`,!0)),t&&(o=o.eq(`instrumento_principal`,t)),r!==void 0&&(o=o.order(`instrumento_principal`,{ascending:r})),n!==void 0){let e=!n;o=o.order(`fecha_nacimiento`,{ascending:e})}let{data:s,error:c}=await o;if(c)throw console.error(`Error al obtener alumnos filtrados y ordenados:`,c.message),Error(`No se pudieron obtener los alumnos con los filtros especificados`);return s.map(K)}async function Nt(e){let t=await At(e);return{canDelete:t.length===0,activeClasses:t.map(e=>e.clase_nombre)}}async function Pt(e){let{data:t,error:n}=await i.from(`progresos`).select(`*`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1});if(n)throw console.error(`Error cargando progreso de alumno:`,n.message),Error(`No se pudo cargar el progreso del alumno`);return t||[]}async function Ft(e){let[{data:t,error:n},{data:r,error:a}]=await Promise.all([i.from(`alumnos`).select(`nivel, promedio_notas`).eq(`id`,e).maybeSingle(),i.from(`progresos`).select(`calificacion, fecha_evaluacion, contenido_dsl`).eq(`alumno_id`,e).not(`calificacion`,`is`,null)]);if(n)throw Error(`No se pudo cargar el resumen académico: ${n.message}`);if(a)throw Error(`No se pudo cargar el resumen académico: ${a.message}`);let o=t?.promedio_notas==null?null:Number(t.promedio_notas),s=(r||[]).map(e=>Number(e.calificacion)*20),c=[...o==null?[]:[o],...s],l=c.length>0?Math.round(c.reduce((e,t)=>e+t,0)/c.length*10)/10:null;return{nivel:t?.nivel||null,promedioBase:o,totalEvaluaciones:s.length,promedioEvaluaciones:s.length>0?Math.round(s.reduce((e,t)=>e+t,0)/s.length*10)/10:null,promedioActualizado:l}}async function It(e){let{data:t,error:n}=await i.from(`asistencias`).select(`*`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1});if(n)throw console.error(`Error cargando asistencias de alumno:`,n.message),Error(`No se pudieron cargar las asistencias del alumno`);return t||[]}async function Lt(e){let{data:t,error:n}=await i.from(`alumnos_clases`).select(`clase_id, clases(id, nombre, clase_horarios(dia, hora_inicio))`).eq(`alumno_id`,e).eq(`activo`,!0);if(n)throw console.error(`Error cargando inscripciones detalladas de alumno:`,n.message),Error(`No se pudieron cargar las clases del alumno`);return(t||[]).map(e=>e.clases).filter(Boolean)}var Rt=n({default:()=>q}),q=JSON.parse(`[{"id":"1","nombre_completo":"Juan Pérez","correo_representante":"juan.perez@example.com","instrumento_principal":"Piano","activo":true,"fecha_nacimiento":"2010-05-15","nacionalidad":"dominicana","municipio_residencia":"Santo Domingo Este","sector_calle_numero":"Calle Falsa 123, Los Prados","sabe_leer":true,"sabe_escribir":true,"madre_nombre":"María Pérez","madre_cedula":"001-1234567-8","madre_tlf_whatsapp":"809-555-0101","padre_nombre":"Carlos Pérez","padre_cedula":"001-8765432-1","padre_tlf_whatsapp":"809-555-0102","representante_nombre":"María Pérez","representante_parentesco":"madre","representante_tlf":"809-555-0101","familia_monoparental":false,"beneficiario_subsidio_estado":false,"tiene_conocimientos_musicales":true,"interes_musical":"instrumento","instrumento_interes":"Piano","centro_estudios":"Escuela Primaria Los Prados","grado_nivel":"5to","acepta_pago_600":true,"autoriza_fotos_redes":true,"acepta_beca_4500":false,"tiene_alergias":true,"alergias_descripcion":"Penicilina","problemas_conducta":"no","created_at":"2026-05-10T10:30:00"},{"id":"2","nombre_completo":"Ana García","correo_representante":"ana.garcia@example.com","instrumento_principal":"Violín","activo":true,"fecha_nacimiento":"2012-08-20","nacionalidad":"dominicana","municipio_residencia":"Santiago","sector_calle_numero":"Avenida Siempre Viva 742, Los Jardines","sabe_leer":true,"sabe_escribir":true,"madre_nombre":"Laura García","madre_cedula":"002-8765432-1","madre_tlf_whatsapp":"809-555-0202","padre_nombre":"José García","padre_cedula":"002-1234567-8","padre_tlf_whatsapp":"809-555-0203","representante_nombre":"José García","representante_parentesco":"padre","representante_tlf":"809-555-0202","familia_monoparental":false,"beneficiario_subsidio_estado":true,"subsidio_descripcion":"Subsidio único del Estado","tiene_conocimientos_musicales":false,"interes_musical":"instrumento","instrumento_interes":"Violín","centro_estudios":"Colegio San José","grado_nivel":"7mo","acepta_pago_600":true,"autoriza_fotos_redes":true,"acepta_beca_4500":true,"tiene_alergias":false,"problemas_conducta":"no","created_at":"2026-05-12T14:20:00"},{"id":"3","nombre_completo":"Luis Rodríguez","correo_representante":"luis.rod@example.com","instrumento_principal":"Guitarra","activo":false,"fecha_nacimiento":"2009-11-02","nacionalidad":"dominicana","municipio_residencia":"La Romana","sector_calle_numero":"Pasaje del Sol 45","sabe_leer":true,"sabe_escribir":true,"madre_nombre":"Elena Rodríguez","madre_cedula":"003-1122334-5","madre_tlf_whatsapp":"809-555-0303","padre_nombre":"","padre_cedula":"","padre_tlf_whatsapp":"","representante_nombre":"Elena Rodríguez","representante_parentesco":"madre","representante_tlf":"809-555-0303","familia_monoparental":true,"beneficiario_subsidio_estado":false,"tiene_conocimientos_musicales":false,"interes_musical":"ambas","instrumento_interes":"Guitarra","centro_estudios":"","grado_nivel":"","acepta_pago_600":false,"autoriza_fotos_redes":true,"acepta_beca_4500":false,"tiene_alergias":false,"problemas_conducta":"no","created_at":"2026-05-14T09:15:00"},{"id":"4","nombre_completo":"Sofía Castillo","correo_representante":"sofia.castillo@example.com","instrumento_principal":"Flauta Travesera","activo":true,"fecha_nacimiento":"2014-03-10","nacionalidad":"dominicana","municipio_residencia":"Punta Cana","sector_calle_numero":"Calle Las Flores 8, Bavaro","sabe_leer":false,"sabe_escribir":false,"madre_nombre":"Carmen Castillo","madre_cedula":"004-9988776-6","madre_tlf_whatsapp":"829-555-0404","padre_nombre":"Roberto Castillo","padre_cedula":"004-8877665-5","padre_tlf_whatsapp":"829-555-0405","representante_nombre":"Roberto Castillo","representante_parentesco":"padre","representante_tlf":"829-555-0404","familia_monoparental":false,"beneficiario_subsidio_estado":false,"tiene_conocimientos_musicales":false,"interes_musical":"cantar","instrumento_interes":"Flauta","centro_estudios":"Jardín Infantil Bavaro","grado_nivel":"Pre-primario","acepta_pago_600":true,"autoriza_fotos_redes":false,"acepta_beca_4500":false,"tiene_alergias":true,"alergias_descripcion":"Frutos secos","problemas_conducta":"no","created_at":"2026-05-15T11:00:00"},{"id":"5","nombre_completo":"Mateo Fernández","correo_representante":"mateo.fernandez@example.com","instrumento_principal":"Percusión","activo":true,"fecha_nacimiento":"2011-07-22","nacionalidad":"dominicana","municipio_residencia":"Higüey","sector_calle_numero":"Av. Principal 123, Centro","sabe_leer":true,"sabe_escribir":true,"madre_nombre":"Carmen Fernández","madre_cedula":"005-5566778-9","madre_tlf_whatsapp":"849-555-0505","padre_nombre":"","padre_cedula":"","padre_tlf_whatsapp":"","representante_nombre":"Carmen Fernández","representante_parentesco":"madre","representante_tlf":"849-555-0505","familia_monoparental":true,"beneficiario_subsidio_estado":true,"subsidio_descripcion":"Bono escolar","tiene_conocimientos_musicales":true,"interes_musical":"instrumento","instrumento_interes":"Batería","centro_estudios":"Escuela Básica Higüey","grado_nivel":"6to","acepta_pago_600":true,"autoriza_fotos_redes":true,"acepta_beca_4500":false,"tiene_alergias":false,"problemas_conducta":"pocas_veces","created_at":"2026-05-16T08:45:00"},{"id":"6","nombre_completo":"Valentina Morillo","correo_representante":"valentina.m@example.com","instrumento_principal":"Canto","activo":true,"fecha_nacimiento":"","nacionalidad":"","municipio_residencia":"","sector_calle_numero":"","sabe_leer":null,"sabe_escribir":null,"madre_nombre":"","madre_cedula":"","madre_tlf_whatsapp":"","padre_nombre":"","padre_cedula":"","padre_tlf_whatsapp":"","representante_nombre":"Lucía Morillo","representante_parentesco":"","representante_tlf":"809-555-0606","familia_monoparental":null,"beneficiario_subsidio_estado":null,"tiene_conocimientos_musicales":null,"interes_musical":"","instrumento_interes":"","centro_estudios":"","grado_nivel":"","acepta_pago_600":null,"autoriza_fotos_redes":null,"acepta_beca_4500":null,"tiene_alergias":null,"problemas_conducta":null,"created_at":"2026-05-18T16:30:00"},{"id":"7","nombre_completo":"Sebastián Ortiz","correo_representante":"","instrumento_principal":"Violonchelo","activo":true,"fecha_nacimiento":"2013-01-05","nacionalidad":"dominicana","municipio_residencia":"Santo Domingo","sector_calle_numero":"Calle Esperanza 55","sabe_leer":true,"sabe_escribir":true,"madre_nombre":"Rosa Ortiz","madre_cedula":"006-2233445-6","madre_tlf_whatsapp":"809-555-0707","padre_nombre":"Pedro Ortiz","padre_cedula":"006-5544332-1","padre_tlf_whatsapp":"809-555-0708","representante_nombre":"Rosa Ortiz","representante_parentesco":"madre","representante_tlf":"809-555-0707","familia_monoparental":false,"beneficiario_subsidio_estado":false,"tiene_conocimientos_musicales":true,"interes_musical":"instrumento","instrumento_interes":"Violonchelo","centro_estudios":"Colegio San Felipe","grado_nivel":"4to","acepta_pago_600":true,"autoriza_fotos_redes":true,"acepta_beca_4500":false,"tiene_alergias":false,"problemas_conducta":"no","created_at":"2026-05-20T10:00:00"},{"id":"8","nombre_completo":"Camila Herrera","correo_representante":"camila.h@example.com","instrumento_principal":"Clarinete","activo":true,"fecha_nacimiento":"2010-12-18","nacionalidad":"dominicana","municipio_residencia":"La Romana","sector_calle_numero":"","sabe_leer":true,"sabe_escribir":true,"madre_nombre":"Sofía Herrera","madre_cedula":"007-9988776-6","madre_tlf_whatsapp":"","padre_nombre":"","padre_cedula":"","padre_tlf_whatsapp":"","representante_nombre":"Sofía Herrera","representante_parentesco":"madre","representante_tlf":"809-555-0808","familia_monoparental":true,"beneficiario_subsidio_estado":null,"tiene_conocimientos_musicales":false,"interes_musical":"ambas","instrumento_interes":"Clarinete","centro_estudios":"","grado_nivel":"","acepta_pago_600":false,"autoriza_fotos_redes":true,"acepta_beca_4500":false,"tiene_alergias":null,"problemas_conducta":"no","created_at":"2026-05-22T13:15:00"},{"id":"9","nombre_completo":"Dyakenson Lamerique","correo_representante":"dyakenson.lamerique@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2011-01-01","nacionalidad":"dominicana","representante_tlf":"829-928-7837","observaciones_generales":"ID Inventario: ESPCVLN42MU","created_at":"2026-07-29T12:00:00"},{"id":"10","nombre_completo":"Emmanuel De los Santos Tavarez","correo_representante":"emmanuel.de.los.santos.tavarez@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2017-01-01","nacionalidad":"dominicana","representante_tlf":"829-886-1050","observaciones_generales":"ID Inventario: 23,066","created_at":"2026-07-29T12:00:00"},{"id":"11","nombre_completo":"Elianny Mejia","correo_representante":"elianny.mejia@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"809-982-1853","observaciones_generales":"ID Inventario: 22,083","created_at":"2026-07-29T12:00:00"},{"id":"12","nombre_completo":"Edelyn Abreu Mejia","correo_representante":"edelyn.abreu.mejia@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2012-01-01","nacionalidad":"dominicana","representante_tlf":"829-863-6465","observaciones_generales":"ID Inventario: 23,056","created_at":"2026-07-29T12:00:00"},{"id":"13","nombre_completo":"Yeiri Alexandra Germain Michel","correo_representante":"yeiri.alexandra.germain.michel@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2013-01-01","nacionalidad":"dominicana","representante_tlf":"809-258-5632","observaciones_generales":"ID Inventario: 23,059","created_at":"2026-07-29T12:00:00"},{"id":"14","nombre_completo":"Escarlet Lisbeth Martinez","correo_representante":"escarlet.lisbeth.martinez@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2015-01-01","nacionalidad":"dominicana","representante_tlf":"849-266-5100","observaciones_generales":"ID Inventario: 22,081","created_at":"2026-07-29T12:00:00"},{"id":"15","nombre_completo":"Angenie St Juste Philogene","correo_representante":"angenie.st.juste.philogene@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2013-01-01","nacionalidad":"dominicana","representante_tlf":"829-557-7515","observaciones_generales":"ID Inventario: 23,061","created_at":"2026-07-29T12:00:00"},{"id":"16","nombre_completo":"Yurma Stjuste Philogene","correo_representante":"yurma.stjuste.philogene@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2013-01-01","nacionalidad":"dominicana","representante_tlf":"849-868-2014","observaciones_generales":"ID Inventario: 23,062","created_at":"2026-07-29T12:00:00"},{"id":"17","nombre_completo":"Angelita St Juste  Philogene","correo_representante":"angelita.st.juste..philogene@example.com","instrumento_principal":"Violín 1","activo":true,"fecha_nacimiento":"2015-01-01","nacionalidad":"dominicana","representante_tlf":"829-557-7515","observaciones_generales":"ID Inventario: 22,087","created_at":"2026-07-29T12:00:00"},{"id":"18","nombre_completo":"Cesar Andres Mendoza Gimenez","correo_representante":"cesar.andres.mendoza.gimenez@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2011-09-01","nacionalidad":"dominicana","representante_tlf":"829-840-6942","observaciones_generales":"ID Inventario: 23,058 | Asignación Instrumento: 2025-06-28","created_at":"2026-07-29T12:00:00"},{"id":"19","nombre_completo":"Santa Isaura Castillo Díaz","correo_representante":"santa.isaura.castillo.d.az@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2017-01-01","nacionalidad":"dominicana","representante_tlf":"809-979-9258","observaciones_generales":"ID Inventario: ESPCVLN28SG","created_at":"2026-07-29T12:00:00"},{"id":"20","nombre_completo":"Gabriela Jireh Marte Colome","correo_representante":"gabriela.jireh.marte.colome@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-753-9979","observaciones_generales":"ID Inventario: 23,055 | Asignación Instrumento: 2025-06-10","created_at":"2026-07-29T12:00:00"},{"id":"21","nombre_completo":"Yereni Esther Germain Michel","correo_representante":"yereni.esther.germain.michel@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2017-01-01","nacionalidad":"dominicana","representante_tlf":"809-258-5632","observaciones_generales":"ID Inventario: 24.090. | Asignación Instrumento: 2025-06-06","created_at":"2026-07-29T12:00:00"},{"id":"22","nombre_completo":"Amelia Marlin Gutierrez","correo_representante":"amelia.marlin.gutierrez@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"809-967-6171","observaciones_generales":"ID Inventario: 22.090. | Asignación Instrumento: 2025-06-17","created_at":"2026-07-29T12:00:00"},{"id":"23","nombre_completo":"Lia Annelise Lopez Matos","correo_representante":"lia.annelise.lopez.matos@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2016-08-23","nacionalidad":"dominicana","representante_tlf":"829-853-3972","observaciones_generales":"ID Inventario: ESPCVLN45SG | Asignación Instrumento: 2025-06-10","created_at":"2026-07-29T12:00:00"},{"id":"24","nombre_completo":"Jeydhen Andres Peguero Cortorreal","correo_representante":"jeydhen.andres.peguero.cortorreal@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"809-841-9649","observaciones_generales":"ID Inventario: PERSONAL","created_at":"2026-07-29T12:00:00"},{"id":"25","nombre_completo":"Rosyairy Gabriel Reyes","correo_representante":"rosyairy.gabriel.reyes@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2017-01-01","nacionalidad":"dominicana","representante_tlf":"809-364-2097","observaciones_generales":"ID Inventario: ESPCVLN34RO | Asignación Instrumento: 2025-06-10","created_at":"2026-07-29T12:00:00"},{"id":"26","nombre_completo":"Ruth Esther Camille Jn Simon","correo_representante":"ruth.esther.camille.jn.simon@example.com","instrumento_principal":"Clarinete","activo":true,"fecha_nacimiento":"2011-01-01","nacionalidad":"dominicana","representante_tlf":"809-999-6334","observaciones_generales":"ID Inventario: 22,101 | Asignación Instrumento: 2025-06-18","created_at":"2026-07-29T12:00:00"},{"id":"27","nombre_completo":"Geily Yosairy Diviche","correo_representante":"geily.yosairy.diviche@example.com","instrumento_principal":"Clarinete","activo":true,"fecha_nacimiento":"2013-01-01","nacionalidad":"dominicana","representante_tlf":"809-460-9313","observaciones_generales":"ID Inventario: 22,102 | Asignación Instrumento: 2025-06-12","created_at":"2026-07-29T12:00:00"},{"id":"28","nombre_completo":"Yangel Jair Medina Ramirez","correo_representante":"yangel.jair.medina.ramirez@example.com","instrumento_principal":"Clarinete","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"829-324-6576","observaciones_generales":"ID Inventario: 23.070.","created_at":"2026-07-29T12:00:00"},{"id":"29","nombre_completo":"Williams Abraham Fariñas Solano","correo_representante":"williams.abraham.fari.as.solano@example.com","instrumento_principal":"Contrabajo","activo":true,"fecha_nacimiento":"2009-01-01","nacionalidad":"dominicana","representante_tlf":"809-648-5562","observaciones_generales":"ID Inventario: 22,086","created_at":"2026-07-29T12:00:00"},{"id":"30","nombre_completo":"Nairoby Jean","correo_representante":"nairoby.jean@example.com","instrumento_principal":"Contrabajo","activo":true,"fecha_nacimiento":"2010-01-01","nacionalidad":"dominicana","representante_tlf":"829-840-9444","observaciones_generales":"ID Inventario: 23,051","created_at":"2026-07-29T12:00:00"},{"id":"31","nombre_completo":"Julianny Dalexa Mendez","correo_representante":"julianny.dalexa.mendez@example.com","instrumento_principal":"Contrabajo","activo":true,"fecha_nacimiento":"2014-06-02","nacionalidad":"dominicana","representante_tlf":"809-804-6949","observaciones_generales":"ID Inventario: COMPARTIDO","created_at":"2026-07-29T12:00:00"},{"id":"32","nombre_completo":"Laura Gil Santana","correo_representante":"laura.gil.santana@example.com","instrumento_principal":"Contrabajo","activo":true,"fecha_nacimiento":"2015-01-01","nacionalidad":"dominicana","representante_tlf":"829-663-8698","observaciones_generales":"ID Inventario: ESPCCTB10YA","created_at":"2026-07-29T12:00:00"},{"id":"33","nombre_completo":"Christina Pierre","correo_representante":"christina.pierre@example.com","instrumento_principal":"Contrabajo","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-839-7825","observaciones_generales":"ID Inventario: ESPCCTB11YA","created_at":"2026-07-29T12:00:00"},{"id":"34","nombre_completo":"Maia Santana Aracena","correo_representante":"maia.santana.aracena@example.com","instrumento_principal":"Contrabajo","activo":true,"fecha_nacimiento":"2013-01-01","nacionalidad":"dominicana","representante_tlf":"829-663-8698","observaciones_generales":"ID Inventario: ESPCCTB12YA","created_at":"2026-07-29T12:00:00"},{"id":"35","nombre_completo":"Diafreisi Dumond","correo_representante":"diafreisi.dumond@example.com","instrumento_principal":"Corno","activo":true,"fecha_nacimiento":"2011-01-01","nacionalidad":"dominicana","representante_tlf":"809-961-7864","observaciones_generales":"ID Inventario: 24,094","created_at":"2026-07-29T12:00:00"},{"id":"36","nombre_completo":"Alegna Cuello Medina","correo_representante":"alegna.cuello.medina@example.com","instrumento_principal":"Flauta","activo":true,"fecha_nacimiento":"2017-01-01","nacionalidad":"dominicana","representante_tlf":"809-875-5523","observaciones_generales":"ID Inventario: 22,095","created_at":"2026-07-29T12:00:00"},{"id":"37","nombre_completo":"Zara Isabella Diaz Bodre","correo_representante":"zara.isabella.diaz.bodre@example.com","instrumento_principal":"Flauta","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-394-1017","observaciones_generales":"ID Inventario: 22,095 | Asignación Instrumento: 2025-06-07","created_at":"2026-07-29T12:00:00"},{"id":"38","nombre_completo":"Alina Marola Jimenez Vargas","correo_representante":"alina.marola.jimenez.vargas@example.com","instrumento_principal":"Flauta","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"809-304-2080","observaciones_generales":"ID Inventario: 22,097","created_at":"2026-07-29T12:00:00"},{"id":"39","nombre_completo":"Ansherlin Zoe Contreras Polanco","correo_representante":"ansherlin.zoe.contreras.polanco@example.com","instrumento_principal":"Flauta","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"829-977-4033","observaciones_generales":"ID Inventario: 24,091","created_at":"2026-07-29T12:00:00"},{"id":"40","nombre_completo":"Jacob David Rojas Arellán","correo_representante":"jacob.david.rojas.arell.n@example.com","instrumento_principal":"Flauta","activo":true,"fecha_nacimiento":"2019-01-01","nacionalidad":"dominicana","representante_tlf":"809-437-7577","observaciones_generales":"ID Inventario: ESPCFLT08NU","created_at":"2026-07-29T12:00:00"},{"id":"41","nombre_completo":"Josias Alejandro Fariñas Solano","correo_representante":"josias.alejandro.fari.as.solano@example.com","instrumento_principal":"Oboe","activo":true,"fecha_nacimiento":"2012-01-01","nacionalidad":"dominicana","representante_tlf":"829-648-5562","observaciones_generales":"ID Inventario: 23,067 | Asignación Instrumento: 2024-09-06","created_at":"2026-07-29T12:00:00"},{"id":"42","nombre_completo":"Cher Akemi Corredor","correo_representante":"cher.akemi.corredor@example.com","instrumento_principal":"Oboe","activo":true,"fecha_nacimiento":"2015-01-01","nacionalidad":"dominicana","representante_tlf":"829-439-8064","observaciones_generales":"ID Inventario: 23,068 | Asignación Instrumento: 2025-06-06","created_at":"2026-07-29T12:00:00"},{"id":"43","nombre_completo":"Elisha Sosa","correo_representante":"elisha.sosa@example.com","instrumento_principal":"Percusión","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-750-1155","created_at":"2026-07-29T12:00:00"},{"id":"44","nombre_completo":"Marthin Alejandro Ramos","correo_representante":"marthin.alejandro.ramos@example.com","instrumento_principal":"Percusión","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"809-215-9387","created_at":"2026-07-29T12:00:00"},{"id":"45","nombre_completo":"Zoe García Acevedo","correo_representante":"zoe.garc.a.acevedo@example.com","instrumento_principal":"Percusión","activo":true,"fecha_nacimiento":"2011-01-01","nacionalidad":"dominicana","representante_tlf":"829-850-0005","created_at":"2026-07-29T12:00:00"},{"id":"46","nombre_completo":"Mauricio José Urquia","correo_representante":"mauricio.jos..urquia@example.com","instrumento_principal":"Trombón","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-355-1711","observaciones_generales":"ID Inventario: 22,109","created_at":"2026-07-29T12:00:00"},{"id":"47","nombre_completo":"Mathias Alejandro Ramos","correo_representante":"mathias.alejandro.ramos@example.com","instrumento_principal":"Trompeta","activo":true,"fecha_nacimiento":"2015-01-01","nacionalidad":"dominicana","representante_tlf":"809-215-9387","observaciones_generales":"ID Inventario: 22,111 | Asignación Instrumento: 2025-06-09","created_at":"2026-07-29T12:00:00"},{"id":"48","nombre_completo":"Yeseña Joseph Bless","correo_representante":"yese.a.joseph.bless@example.com","instrumento_principal":"Trompeta","activo":true,"fecha_nacimiento":"2012-01-01","nacionalidad":"dominicana","representante_tlf":"809-280-5920","observaciones_generales":"ID Inventario: 22,114","created_at":"2026-07-29T12:00:00"},{"id":"49","nombre_completo":"Feder de los Santos Gonzales","correo_representante":"feder.de.los.santos.gonzales@example.com","instrumento_principal":"Trompeta","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-928-1188","observaciones_generales":"ID Inventario: 22,115","created_at":"2026-07-29T12:00:00"},{"id":"50","nombre_completo":"Jose Tomás Lorenzo Ogando","correo_representante":"jose.tom.s.lorenzo.ogando@example.com","instrumento_principal":"Trompeta","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"809-803-3158","observaciones_generales":"ID Inventario: 22.110.","created_at":"2026-07-29T12:00:00"},{"id":"51","nombre_completo":"Jhoennsy Sariel Castillo Batista","correo_representante":"jhoennsy.sariel.castillo.batista@example.com","instrumento_principal":"Tuba","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"809-228-1971","observaciones_generales":"ID Inventario: 22,121","created_at":"2026-07-29T12:00:00"},{"id":"52","nombre_completo":"María Naroldy Hilario","correo_representante":"mar.a.naroldy.hilario@example.com","instrumento_principal":"Viola","activo":true,"fecha_nacimiento":"2011-01-01","nacionalidad":"dominicana","representante_tlf":"849-873-0530","observaciones_generales":"ID Inventario: 23,053","created_at":"2026-07-29T12:00:00"},{"id":"53","nombre_completo":"Jaime de la Cruz","correo_representante":"jaime.de.la.cruz@example.com","instrumento_principal":"Viola","activo":true,"fecha_nacimiento":"2011-01-01","nacionalidad":"dominicana","representante_tlf":"829-278-9337","observaciones_generales":"ID Inventario: 23,054","created_at":"2026-07-29T12:00:00"},{"id":"54","nombre_completo":"Branyan Francisco Peguero","correo_representante":"branyan.francisco.peguero@example.com","instrumento_principal":"Viola","activo":true,"fecha_nacimiento":"2012-01-01","nacionalidad":"dominicana","representante_tlf":"829-558-0279","observaciones_generales":"ID Inventario: ESPCVLA21JA","created_at":"2026-07-29T12:00:00"},{"id":"55","nombre_completo":"Dariel Aquino Mejia","correo_representante":"dariel.aquino.mejia@example.com","instrumento_principal":"Viola","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-887-7671","observaciones_generales":"ID Inventario: ESPCVLA22EX | Asignación Instrumento: 2025-06-06","created_at":"2026-07-29T12:00:00"},{"id":"56","nombre_completo":"Argeiris Yudeny Pacheco Pinales","correo_representante":"argeiris.yudeny.pacheco.pinales@example.com","instrumento_principal":"Viola","activo":true,"fecha_nacimiento":"2012-01-01","nacionalidad":"dominicana","representante_tlf":"849-456-1545","observaciones_generales":"ID Inventario: ESPCVLA23EX","created_at":"2026-07-29T12:00:00"},{"id":"57","nombre_completo":"Jhouse Manuel Lacen","correo_representante":"jhouse.manuel.lacen@example.com","instrumento_principal":"Viola","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"829-558-3023","observaciones_generales":"ID Inventario: ESPCVLN39EX | Asignación Instrumento: 2025-06-07","created_at":"2026-07-29T12:00:00"},{"id":"58","nombre_completo":"Helen Sofia Alvarado Pérez","correo_representante":"helen.sofia.alvarado.p.rez@example.com","instrumento_principal":"Viola","activo":true,"fecha_nacimiento":"2017-01-01","nacionalidad":"dominicana","representante_tlf":"809-710-6176","observaciones_generales":"ID Inventario: ESPCVLN44RO","created_at":"2026-07-29T12:00:00"},{"id":"59","nombre_completo":"Lucas Gutierrez Pérez","correo_representante":"lucas.gutierrez.p.rez@example.com","instrumento_principal":"Flauta","activo":true,"fecha_nacimiento":"2019-01-01","nacionalidad":"dominicana","representante_tlf":"","observaciones_generales":"ID Inventario: 22,088 | Asignación Instrumento: 2025-06-17","created_at":"2026-07-29T12:00:00"},{"id":"60","nombre_completo":"Eva Taveras","correo_representante":"eva.taveras@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"829-672-6826","observaciones_generales":"ID Inventario: 22,089","created_at":"2026-07-29T12:00:00"},{"id":"61","nombre_completo":"Alanna Pilier","correo_representante":"alanna.pilier@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2018-01-01","nacionalidad":"dominicana","representante_tlf":"829-680-7245","observaciones_generales":"ID Inventario: ESPCVLN25SG","created_at":"2026-07-29T12:00:00"},{"id":"62","nombre_completo":"Nicole Castillo Díaz","correo_representante":"nicole.castillo.d.az@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"809-979-9258","observaciones_generales":"ID Inventario: ESPCVLN26SG","created_at":"2026-07-29T12:00:00"},{"id":"63","nombre_completo":"Ashley Saint Philippe","correo_representante":"ashley.saint.philippe@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"829-604-8490","observaciones_generales":"ID Inventario: ESPCVLN37RO","created_at":"2026-07-29T12:00:00"},{"id":"64","nombre_completo":"Alejandra Annaly Pérez","correo_representante":"alejandra.annaly.p.rez@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"849-245-8848","observaciones_generales":"ID Inventario: ESPCVLN46YS","created_at":"2026-07-29T12:00:00"},{"id":"65","nombre_completo":"Daniel Monfismon Peralte","correo_representante":"daniel.monfismon.peralte@example.com","instrumento_principal":"Violín 2","activo":true,"fecha_nacimiento":"2018-01-01","nacionalidad":"dominicana","representante_tlf":"829-274-8894","created_at":"2026-07-29T12:00:00"},{"id":"66","nombre_completo":"Amy Balbuena","correo_representante":"amy.balbuena@example.com","instrumento_principal":"Violoncello","activo":true,"fecha_nacimiento":"2012-01-01","nacionalidad":"dominicana","representante_tlf":"829-913-6681","observaciones_generales":"ID Inventario: 24,087","created_at":"2026-07-29T12:00:00"},{"id":"67","nombre_completo":"Ysabella Valentina Brito Suniaga","correo_representante":"ysabella.valentina.brito.suniaga@example.com","instrumento_principal":"Violoncello","activo":true,"fecha_nacimiento":"2014-01-01","nacionalidad":"dominicana","representante_tlf":"809-215-6273","observaciones_generales":"ID Inventario: 24.250.","created_at":"2026-07-29T12:00:00"},{"id":"68","nombre_completo":"Alondra Lorenzo Ogando","correo_representante":"alondra.lorenzo.ogando@example.com","instrumento_principal":"Violoncello","activo":true,"fecha_nacimiento":"2010-01-01","nacionalidad":"dominicana","representante_tlf":"809-803-3158","observaciones_generales":"ID Inventario: ESPCVLC14EX","created_at":"2026-07-29T12:00:00"},{"id":"69","nombre_completo":"Lia Bonilla Santana","correo_representante":"lia.bonilla.santana@example.com","instrumento_principal":"Violoncello","activo":true,"fecha_nacimiento":"2012-01-01","nacionalidad":"dominicana","representante_tlf":"829-846-8470","observaciones_generales":"ID Inventario: ESPCVLC17EX | Asignación Instrumento: 2025-05-29","created_at":"2026-07-29T12:00:00"},{"id":"70","nombre_completo":"Sol Marte","correo_representante":"sol.marte@example.com","instrumento_principal":"Violoncello","activo":true,"fecha_nacimiento":"2017-01-01","nacionalidad":"dominicana","representante_tlf":"809-617-5724","observaciones_generales":"ID Inventario: ESPCVLC19RO | Asignación Instrumento: 2025-06-24","created_at":"2026-07-29T12:00:00"},{"id":"71","nombre_completo":"Dinora Amanda Evangelista Paniagua","correo_representante":"dinora.amanda.evangelista.paniagua@example.com","instrumento_principal":"Violoncello","activo":true,"fecha_nacimiento":"2016-01-01","nacionalidad":"dominicana","representante_tlf":"809-219-8782","observaciones_generales":"ID Inventario: ESPCVLC20RO","created_at":"2026-07-29T12:00:00"},{"id":"72","nombre_completo":"Aarón Di Lorenzo","correo_representante":"aar.n.di.lorenzo@example.com","instrumento_principal":"Violoncello","activo":true,"fecha_nacimiento":"2015-01-01","nacionalidad":"dominicana","representante_tlf":"829-341-7693","observaciones_generales":"ID Inventario: PERSONAL","created_at":"2026-07-29T12:00:00"}]`),zt=n({actualizarAlumno:()=>Gt,crearAlumno:()=>Wt,eliminarAlumno:()=>Kt,obtenerAlumno:()=>Ut,obtenerAlumnos:()=>Ht,obtenerAlumnosFiltradosYOrdenados:()=>Zt,obtenerAlumnosPorMes:()=>Xt,obtenerAsistenciasAlumno:()=>tn,obtenerInscripcionesAlumno:()=>Yt,obtenerInscripcionesDetalladasAlumno:()=>nn,obtenerProgresoAlumno:()=>$t,obtenerResumenAcademico:()=>en,validarCedula:()=>Jt,validarEmail:()=>qt,verificarEliminacionAlumno:()=>Qt}),J=(e=500)=>new Promise(t=>setTimeout(t,e)),Y=[{alumno_id:`1`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`1`,clase_id:`clase_005`,clase_nombre:`Coro Infantil`},{alumno_id:`2`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`4`,clase_id:`clase_004`,clase_nombre:`Flauta Travesera`}];function X(e){if(!e)return null;let t=(Y||[]).filter(t=>t.alumno_id===e.id).map(e=>e.clase_nombre).join(`, `)||`Sin clases`;return{...e,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,is_active:e.activo??!0,clases:t,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``}}var Bt=`soi_mock_alumnos`;function Vt(){try{if(typeof localStorage<`u`){let e=localStorage.getItem(Bt);if(e)return JSON.parse(e)}}catch{}return[...q]}function Z(e){try{typeof localStorage<`u`&&localStorage.setItem(Bt,JSON.stringify(e))}catch{}}var Q=Vt();async function Ht({page:e=0,pageSize:t=100}={}){await J();let n=e*t,r=n+t;return{alumnos:Q.slice(n,r).map(X),total:Q.length}}async function Ut(e){await J();let t=Q.find(t=>t.id===e);if(!t)throw Error(`Alumno no encontrado (Demo)`);return X(t)}async function Wt(e){await J();let t={...e,id:Math.random().toString(36).substr(2,9),nombre_completo:e.nombre||e.nombre_completo,activo:e.is_active===void 0||e.is_active};return Q.push(t),Z(Q),X(t)}async function Gt(e,t){await J();let n=Q.findIndex(t=>t.id===e);if(n===-1)throw Error(`Alumno no encontrado (Demo)`);return Q[n]={...Q[n],...t},Z(Q),X(Q[n])}async function Kt(e){await J(),Q=Q.filter(t=>t.id!==e),Z(Q)}async function qt(e){return await J(100),Q.some(t=>t.correo_representante===e.trim().toLowerCase())}async function Jt(e){return await J(100),Q.some(t=>t.representante_cedula===e.trim())}async function Yt(e){return await J(200),Y.filter(t=>t.alumno_id===e).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase_nombre}))}async function Xt(e,t){return await J(300),Q.filter(n=>{let r=new Date(n.created_at??n.fecha_ingreso??``);return r.getFullYear()===e&&r.getMonth()+1===t}).map(X)}async function Zt({id_clase:e,instrumento:t,ordenEdadAsc:n,ordenInstrumentoAsc:r,soloActivos:i=!0}={}){await J();let a=[...Q];if(i&&(a=a.filter(e=>e.activo!==!1&&e.is_active!==!1)),e){let t=Y.filter(t=>t.clase_id===e).map(e=>e.alumno_id);a=a.filter(e=>t.includes(e.id))}return t&&(a=a.filter(e=>e.instrumento_principal===t)),a.sort((e,t)=>{if(r!==void 0){let n=e.instrumento_principal||``,i=t.instrumento_principal||``,a=n.localeCompare(i);if(a!==0)return r?a:-a}if(n!==void 0){let r=e.fecha_nacimiento?new Date(e.fecha_nacimiento):new Date(0),i=(t.fecha_nacimiento?new Date(t.fecha_nacimiento):new Date(0))-r;return n?i:-i}return 0}),a.map(X)}async function Qt(e){await J();let t=Y.filter(t=>t.alumno_id===e);return{canDelete:t.length===0,activeClasses:t.map(e=>e.clase_nombre)}}async function $t(e){return await J(),[]}async function en(e){return await J(),{nivel:null,promedioBase:null,totalEvaluaciones:0,promedioEvaluaciones:null,promedioActualizado:null}}async function tn(e){return await J(),[]}async function nn(e){return await J(),[{id:`clase_001`,nombre:`Violín Principiantes A`,clase_horarios:[{dia:`Lunes`,hora_inicio:`14:00:00`}]}]}function rn(e,t){let[n,r,i]=e.split(`-`).map(Number),a=r-1+t,o=n+Math.floor(a/12),s=(a%12+12)%12,c=new Date(Date.UTC(o,s+1,0)).getUTCDate(),l=Math.min(i,c);return`${o}-${String(s+1).padStart(2,`0`)}-${String(l).padStart(2,`0`)}`}function an(e,t){return e?.tiene_conocimientos_musicales===!0&&e?.nivel_lectura_musical===`avanzado`?{iniciacion_musical_requerida:!1,fecha_fin_iniciacion:null,fecha_elegible_audicion:null}:{iniciacion_musical_requerida:!0,fecha_fin_iniciacion:rn(t,6),fecha_elegible_audicion:rn(t,3)}}var $=()=>a.isDemoMode?zt:yt,on=(...e)=>$().obtenerAlumnos(...e),sn=(...e)=>$().obtenerAlumno(...e);async function cn(e){let t=an(e,e.fecha_ingreso??new Date().toISOString().slice(0,10)),n={...e,...t,fecha_aceptacion_compromisos:e.fecha_aceptacion_compromisos??new Date().toISOString()};return $().crearAlumno(n)}var ln=(...e)=>$().actualizarAlumno(...e),un=(...e)=>$().eliminarAlumno(...e),dn=(...e)=>$().obtenerAlumnosPorMes(...e),fn=(...e)=>$().obtenerAlumnosFiltradosYOrdenados(...e),pn=(...e)=>$().verificarEliminacionAlumno(...e),mn=(...e)=>$().obtenerProgresoAlumno(...e),hn=(...e)=>$().obtenerResumenAcademico(...e),gn=(...e)=>$().obtenerAsistenciasAlumno(...e),_n=(...e)=>$().obtenerInscripcionesDetalladasAlumno(...e),vn=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}];p();export{ne as C,ee as E,se as S,re as T,ft as _,sn as a,he as b,dn as c,mn as d,hn as f,vt as g,Rt as h,un as i,gn as l,q as m,ln as n,on as o,pn as p,cn as r,fn as s,vn as t,_n as u,rt as v,w,ce as x,De as y};