import{i as e}from"./supabase-KnARm58N.js";import{i as t}from"./maestroAuth-CgmSmLyS.js";import{t as n}from"./AppToast-3qbHkRVc.js";import{t as r}from"./phoneUtils-BHeSQPiO.js";import{i}from"./portalUtils-C92TBVO0.js";var a=`alumno_plan_entradas`;async function o(t){let{data:n,error:r}=await e.from(a).select(`id, tipo, titulo, descripcion, nivel_referencia, objetivo_id, sesion_id, created_at, maestro_id`).eq(`alumno_id`,t).order(`created_at`,{ascending:!1});if(r)throw Error(r.message);return n||[]}async function s(t){if(!t.titulo?.trim())throw Error(`titulo requerido`);let{data:n,error:r}=await e.from(a).insert({alumno_id:t.alumno_id,maestro_id:t.maestro_id,tipo:t.tipo,titulo:t.titulo.trim(),descripcion:t.descripcion?.trim()||null,nivel_referencia:t.nivel_referencia||null,objetivo_id:t.objetivo_id||null,sesion_id:t.sesion_id||null}).select().single();if(r)throw Error(r.message);return n}async function c(t){let{error:n}=await e.from(a).delete().eq(`id`,t);if(n)throw Error(n.message)}var l={diagnostico:{label:`Diagnóstico`,icon:`🔍`,color:`#6366f1`,bg:`#6366f115`},logro:{label:`Logro`,icon:`✅`,color:`#16a34a`,bg:`#16a34a15`},en_progreso:{label:`En progreso`,icon:`📈`,color:`#2563eb`,bg:`#2563eb15`},dificultad:{label:`Dificultad`,icon:`⚠️`,color:`#dc2626`,bg:`#dc262615`},objetivo:{label:`Objetivo`,icon:`🎯`,color:`#d97706`,bg:`#d9770615`}},u=[`diagnostico`,`logro`,`en_progreso`,`dificultad`,`objetivo`],d=class{constructor({container:e,alumnoId:t,maestroId:n}){this._container=e,this._alumnoId=t,this._maestroId=n,this._entries=[],this._formOpen=!1}async init(){this._container.innerHTML=`<div class="pm-loading-zen"><div class="pm-pulse"></div></div>`,await this._load(),this._render()}async _load(){this._entries=await o(this._alumnoId)}_render(){this._container.innerHTML=this._buildHTML(),this._attachEvents()}_buildHTML(){let e=this._entries.length>0,t=this._entries.some(e=>e.tipo===`diagnostico`);return`
      <div class="pe-panel">
        ${this._buildToolbar(t)}
        ${e?this._buildTimeline():this._buildEmpty()}
        ${this._formOpen?this._buildForm(t):``}
      </div>
      ${this._buildStyles()}
    `}_buildToolbar(e){return`
      <div class="pe-toolbar">
        <span class="pe-toolbar__count">${this._entries.length} entrada${this._entries.length===1?``:`s`}</span>
        <button class="pe-btn pe-btn-primary" data-testid="pe-btn-add" data-action="open-form">
          <span>+</span>
          ${e?`Nueva entrada`:`Registrar diagnóstico`}
        </button>
      </div>
    `}_buildEmpty(){return`
      <div class="pe-empty" data-testid="pe-empty">
        <span style="font-size:2rem;">📋</span>
        <p>Sin entradas registradas.</p>
        <p style="font-size:0.78rem;color:var(--pm-text-muted);">
          Comenzá con un <strong>diagnóstico inicial</strong> para documentar el nivel actual del alumno.
        </p>
      </div>
    `}_buildTimeline(){return`
      <div class="pe-timeline">
        ${this._entries.map(e=>this._buildEntry(e)).join(``)}
      </div>
    `}_buildEntry(e){let t=l[e.tipo]||l.logro,n=new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`});return`
      <div class="pe-entry" data-testid="pe-entry" data-id="${e.id}">
        <div class="pe-entry__dot" style="background:${t.color}"></div>
        <div class="pe-entry__body">
          <div class="pe-entry__header">
            <span class="pe-badge" data-testid="pe-tipo-badge" style="color:${t.color};background:${t.bg}">
              ${t.icon} ${t.label}
            </span>
            <span class="pe-entry__date">${n}</span>
            <button class="pe-btn-icon pe-btn-delete" data-action="delete" data-id="${e.id}" title="Eliminar">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          <p class="pe-entry__titulo" data-testid="pe-entry-titulo">${i(e.titulo)}</p>
          ${e.descripcion?`<p class="pe-entry__desc">${i(e.descripcion)}</p>`:``}
          ${e.nivel_referencia?`<span class="pe-nivel">${e.nivel_referencia}</span>`:``}
        </div>
      </div>
    `}_buildForm(e){let t=e?`logro`:`diagnostico`;return`
      <div class="pe-form-overlay">
        <div class="pe-form">
          <div class="pe-form__header">
            <strong>${e?`Nueva entrada`:`Diagnóstico inicial`}</strong>
            <button class="pe-btn-icon" data-action="close-form"><i class="bi bi-x-lg"></i></button>
          </div>

          <label class="pe-label">Tipo</label>
          <select class="pe-select" id="pe-tipo">
            ${u.map(e=>`
              <option value="${e}" ${e===t?`selected`:``}>${l[e].icon} ${l[e].label}</option>
            `).join(``)}
          </select>

          <label class="pe-label">Título <span style="color:var(--pm-danger)">*</span></label>
          <input class="pe-input" id="pe-titulo" type="text" maxlength="200"
            placeholder="${e?`Ej: Dominó escala de Do mayor`:`Ej: Conoce posición 1 en violín`}" />

          <label class="pe-label">Descripción (opcional)</label>
          <textarea class="pe-textarea" id="pe-descripcion" rows="3"
            placeholder="Detalles, contexto, observaciones del maestro..."></textarea>

          <label class="pe-label">Nivel de referencia</label>
          <select class="pe-select" id="pe-nivel">
            <option value="">— Sin especificar —</option>
            <option value="inicial">Inicial</option>
            <option value="basico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <div class="pe-form__actions">
            <button class="pe-btn pe-btn-ghost" data-action="close-form">Cancelar</button>
            <button class="pe-btn pe-btn-primary" data-action="save-entry" id="pe-save-btn">
              Guardar
            </button>
          </div>
        </div>
      </div>
    `}_buildStyles(){return`
      <style>
        .pe-panel { display:flex; flex-direction:column; gap:0.75rem; }
        .pe-toolbar { display:flex; align-items:center; justify-content:space-between; }
        .pe-toolbar__count { font-size:0.75rem; color:var(--pm-text-muted); }
        .pe-btn { display:inline-flex; align-items:center; gap:0.35rem; padding:0.4rem 0.85rem;
          border-radius:8px; border:none; font-size:0.82rem; font-weight:600; cursor:pointer;
          transition:opacity 0.15s; }
        .pe-btn:active { opacity:0.7; }
        .pe-btn-primary { background:var(--pm-primary); color:#fff; }
        .pe-btn-ghost { background:var(--pm-surface-2); color:var(--pm-text-muted);
          border:1px solid var(--pm-border); }
        .pe-btn-icon { background:none; border:none; cursor:pointer; color:var(--pm-text-muted);
          padding:0.2rem 0.4rem; border-radius:6px; font-size:0.8rem; transition:color 0.15s; }
        .pe-btn-delete:hover { color:var(--pm-danger); }
        .pe-empty { text-align:center; padding:1.25rem 0.5rem; color:var(--pm-text-muted); }
        .pe-empty p { margin:0.25rem 0; font-size:0.85rem; }
        .pe-timeline { display:flex; flex-direction:column; gap:0; position:relative; }
        .pe-timeline::before { content:''; position:absolute; left:9px; top:14px; bottom:14px;
          width:2px; background:var(--pm-border); border-radius:1px; }
        .pe-entry { display:flex; gap:0.75rem; padding:0.45rem 0; position:relative; }
        .pe-entry__dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:8px;
          border:2px solid var(--pm-surface, #fff); position:relative; z-index:1; }
        .pe-entry__body { flex:1; min-width:0; background:var(--pm-surface-2);
          border:1px solid var(--pm-border); border-radius:10px; padding:0.6rem 0.75rem; }
        .pe-entry__header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;
          flex-wrap:wrap; }
        .pe-badge { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px;
          flex-shrink:0; }
        .pe-entry__date { font-size:0.68rem; color:var(--pm-text-muted); margin-left:auto; }
        .pe-entry__titulo { font-size:0.85rem; font-weight:600; margin:0; color:var(--pm-text); }
        .pe-entry__desc { font-size:0.78rem; color:var(--pm-text-muted); margin:0.25rem 0 0;
          line-height:1.45; font-style:italic; }
        .pe-nivel { display:inline-block; font-size:0.65rem; font-weight:600;
          text-transform:uppercase; letter-spacing:0.04em; color:var(--pm-primary);
          background:rgba(99,102,241,0.12); padding:1px 6px; border-radius:4px; margin-top:0.3rem; }
        .pe-form-overlay { position:relative; }
        .pe-form { background:var(--pm-surface-2); border:1px solid var(--pm-border);
          border-radius:14px; padding:1rem; display:flex; flex-direction:column; gap:0.6rem; }
        .pe-form__header { display:flex; justify-content:space-between; align-items:center;
          margin-bottom:0.1rem; }
        .pe-form__header strong { font-size:0.9rem; }
        .pe-label { font-size:0.72rem; font-weight:600; color:var(--pm-text-muted);
          text-transform:uppercase; letter-spacing:0.04em; margin-bottom:-0.25rem; }
        .pe-input, .pe-select, .pe-textarea {
          width:100%; border:1px solid var(--pm-border); border-radius:8px;
          padding:0.5rem 0.65rem; font-size:0.85rem; background:var(--pm-surface);
          color:var(--pm-text); font-family:inherit; box-sizing:border-box;
          outline:none; transition:border-color 0.15s; }
        .pe-input:focus, .pe-select:focus, .pe-textarea:focus { border-color:var(--pm-primary); }
        .pe-textarea { resize:vertical; min-height:70px; line-height:1.45; }
        .pe-form__actions { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.25rem; }
      </style>
    `}_attachEvents(){this._container.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.action;n===`open-form`&&this._openForm(),n===`close-form`&&this._closeForm(),n===`save-entry`&&this._handleSave(),n===`delete`&&this.deleteEntry(e.dataset.id)})})}_openForm(){this._formOpen=!0,this._render(),setTimeout(()=>this._container.querySelector(`#pe-titulo`)?.focus(),50)}_closeForm(){this._formOpen=!1,this._render()}async _handleSave(){let e=this._container.querySelector(`#pe-tipo`)?.value,t=this._container.querySelector(`#pe-titulo`)?.value?.trim(),n=this._container.querySelector(`#pe-descripcion`)?.value?.trim(),r=this._container.querySelector(`#pe-nivel`)?.value;if(!t){this._container.querySelector(`#pe-titulo`)?.focus();return}let i=this._container.querySelector(`#pe-save-btn`);i&&(i.disabled=!0,i.textContent=`Guardando...`);try{await this.addEntry({tipo:e,titulo:t,descripcion:n||null,nivel_referencia:r||null}),this._formOpen=!1}catch(e){console.error(`[PlanEstudiosPanel] save error:`,e),i&&(i.disabled=!1,i.textContent=`Guardar`)}}async addEntry(e){let t=await s({alumno_id:this._alumnoId,maestro_id:this._maestroId,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion||null,nivel_referencia:e.nivel_referencia||null});this._entries=[t,...this._entries],this._render()}async deleteEntry(e){this._entries=this._entries.filter(t=>t.id!==e),this._render(),await c(e)}};function f(e){if(!e)return null;let t=e.replace(/\D/g,``);return t.length===10&&/^(809|829|849)/.test(t)?`1`+t:t.length===11&&t.startsWith(`1`)||t.length>=10?t:null}var p=e=>`soi_wa_templates_${e}`,m=[{id:`tpl-1`,label:`📋 Asistencia`,text:`Hola Saludos, le escribo de "El Sistema Punta Cana" para informarle sobre las asistencias de clases de {alumno}. Por favor comuníquese con nosotros para más detalles.`},{id:`tpl-2`,label:`📝 Evaluación`,text:`Hola Saludos, le informamos que {alumno} tiene evaluaciones recientes disponibles para revisión. Puede consultar su progreso con nosotros.`},{id:`tpl-3`,label:`📅 Recordatorio`,text:`Hola Saludos, le recordamos que {alumno} tiene clase próximamente. Cualquier ausencia debe ser justificada con anticipación.`},{id:`tpl-4`,label:`🤝 Reunión`,text:`Hola Saludos, me gustaría coordinar una reunión para conversar sobre el progreso de {alumno}. ¿Cuándo le viene bien?`}];function h(e){try{let t=localStorage.getItem(p(e));return t?JSON.parse(t):m.map(e=>({...e}))}catch{return m.map(e=>({...e}))}}function g(e,t){localStorage.setItem(p(e),JSON.stringify(t))}function _(e,{alumno:t,contacto:n}){return e.replace(/\{alumno\}/g,t).replace(/\{contacto\}/g,n)}function v(e){return e?e.replace(/\[([^\]]+)\]/g,(e,t)=>{let n=t.indexOf(`:`);if(n>0){let e=t.slice(0,n).trim(),r=t.slice(n+1).trim();return r?`${e}: ${r}`:e}return t.trim()}).replace(/\n{3,}/g,`

`).trim():``}var y={LOGRADO:{label:`Logrado`,color:`#198754`,bg:`#19875418`,icon:`✅`},EN_PROGRESO:{label:`En progreso`,color:`#0d6efd`,bg:`#0d6efd18`,icon:`📈`},INICIADO:{label:`Iniciado`,color:`#6c757d`,bg:`#6c757d18`,icon:`🔰`},DIFICULTAD:{label:`Dificultad`,color:`#dc3545`,bg:`#dc354518`,icon:`⚠️`}};async function b(t,r,a=0){let o=t.querySelector(`#pm-alumno-progresos-root`);if(!o)return;let s=a===0;s&&(o.innerHTML=`<div class="pm-loading-zen"><div class="pm-pulse"></div></div>`);try{let{data:n,error:c}=await e.from(`progresos`).select(`id, contenido_dsl, estado_cualitativo, calificacion, observaciones, fecha_evaluacion, clase_id, indicadores`).eq(`alumno_id`,r).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``).order(`fecha_evaluacion`,{ascending:!1}).range(a,a+19);if(c)throw c;if(!n||n.length===0){s&&(o.innerHTML=`<p style="font-size:0.82rem;color:var(--pm-text-muted);text-align:center;padding:1rem 0;">Sin registros de progreso generados por IA aún.</p>`);return}let l=[...new Set(n.map(e=>e.clase_id).filter(Boolean))],{data:u}=l.length?await e.from(`clases`).select(`id, nombre`).in(`id`,l):{data:[]},d=new Map((u||[]).map(e=>[e.id,e.nombre])),f=new Map;for(let e of n){let t=e.contenido_dsl;f.has(t)||f.set(t,{contenido:t,entries:[]}),f.get(t).entries.push(e)}let p=Array.from(f.values()).map(({contenido:e,entries:t})=>{let n=t[0],r=y[n.estado_cualitativo]??y.EN_PROGRESO,a=new Date(n.fecha_evaluacion).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`2-digit`});return`
        <details class="pm-prog-card">
          <summary class="pm-prog-card__summary">
            <span class="pm-prog-card__icon" style="color:${r.color}">${r.icon}</span>
            <div class="pm-prog-card__info">
              <span class="pm-prog-card__name">${i(e)}</span>
              <span class="pm-prog-card__meta">${t.length} registro${t.length===1?``:`s`} · último: ${a}</span>
            </div>
            <span class="pm-prog-card__badge" style="color:${r.color};background:${r.bg}">${r.label}</span>
            <i class="bi bi-chevron-down pm-prog-card__chevron"></i>
          </summary>
          <div class="pm-prog-card__timeline">
            ${t.map(e=>{let t=y[e.estado_cualitativo]??y.EN_PROGRESO,n=new Date(e.fecha_evaluacion).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}),r=d.get(e.clase_id)||`Clase`,a=e.indicadores?.tarea,o=e.calificacion==null?null:`${e.calificacion}/5`;return`
                <div class="pm-prog-entry">
                  <div class="pm-prog-entry__dot" style="background:${t.color}"></div>
                  <div class="pm-prog-entry__body">
                    <div class="pm-prog-entry__header">
                      <span class="pm-prog-entry__fecha">${n}</span>
                      <span class="pm-prog-entry__clase">${i(r)}</span>
                      ${o?`<span class="pm-prog-entry__nota" style="color:${t.color}">${o}</span>`:``}
                    </div>
                    <span class="pm-prog-entry__estado" style="color:${t.color}">${t.icon} ${t.label}</span>
                    ${e.observaciones?`<p class="pm-prog-entry__obs">${i(e.observaciones)}</p>`:``}
                    ${a?`<p class="pm-prog-entry__tarea">📋 ${i(a)}</p>`:``}
                  </div>
                </div>
              `}).join(``)}
          </div>
        </details>
      `}).join(``);if(s)o.innerHTML=`
        <div class="pm-prog-list">
          ${p}
        </div>
        <style>
          .pm-prog-list { display: flex; flex-direction: column; gap: 0.5rem; }
          .pm-prog-card {
            border: 1px solid var(--pm-border);
            border-radius: 10px;
            overflow: hidden;
            background: var(--pm-surface-2);
          }
          .pm-prog-card__summary {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.65rem 0.75rem;
            cursor: pointer;
            list-style: none;
            user-select: none;
          }
          .pm-prog-card__summary::-webkit-details-marker { display: none; }
          .pm-prog-card__icon { font-size: 1.1rem; flex-shrink: 0; }
          .pm-prog-card__info { flex: 1; min-width: 0; }
          .pm-prog-card__name {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--pm-text);
          }
          .pm-prog-card__meta {
            display: block;
            font-size: 0.68rem;
            color: var(--pm-text-muted);
            margin-top: 1px;
          }
          .pm-prog-card__badge {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 99px;
            flex-shrink: 0;
          }
          .pm-prog-card__chevron {
            font-size: 0.75rem;
            color: var(--pm-text-muted);
            transition: transform 0.2s;
            flex-shrink: 0;
          }
          details[open] .pm-prog-card__chevron { transform: rotate(180deg); }
          .pm-prog-card__timeline {
            border-top: 1px solid var(--pm-border);
            padding: 0.5rem 0.75rem 0.5rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0;
            position: relative;
          }
          .pm-prog-card__timeline::before {
            content: '';
            position: absolute;
            left: 1.15rem;
            top: 0.75rem;
            bottom: 0.75rem;
            width: 2px;
            background: var(--pm-border);
            border-radius: 1px;
          }
          .pm-prog-entry {
            display: flex;
            gap: 0.75rem;
            padding: 0.4rem 0;
            position: relative;
          }
          .pm-prog-entry__dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 4px;
            border: 2px solid var(--pm-surface-2);
            position: relative;
            z-index: 1;
          }
          .pm-prog-entry__body { flex: 1; }
          .pm-prog-entry__header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 0.1rem;
          }
          .pm-prog-entry__fecha { font-size: 0.72rem; color: var(--pm-text-muted); font-weight: 600; }
          .pm-prog-entry__clase {
            font-size: 0.68rem;
            color: var(--pm-text-muted);
            background: var(--pm-surface);
            padding: 1px 6px;
            border-radius: 4px;
          }
          .pm-prog-entry__nota { font-size: 0.72rem; font-weight: 700; margin-left: auto; }
          .pm-prog-entry__estado { font-size: 0.72rem; font-weight: 600; }
          .pm-prog-entry__obs {
            font-size: 0.78rem;
            color: var(--pm-text);
            margin: 0.15rem 0 0;
            line-height: 1.45;
            font-style: italic;
          }
          .pm-prog-entry__tarea {
            font-size: 0.72rem;
            color: var(--pm-text-muted);
            margin: 0.1rem 0 0;
          }
        </style>
      `;else{let e=o.querySelector(`.pm-prog-list`);if(e){let t=document.createElement(`div`);t.innerHTML=p,e.append(...t.children)}}if(n&&n.length===20){let e=document.createElement(`button`);e.className=`pm-btn pm-btn-outline`,e.style.cssText=`display:block;margin:0.75rem auto 0;font-size:0.82rem;`,e.textContent=`Cargar más`,e.onclick=()=>{e.remove(),b(t,r,a+20)},o.appendChild(e)}}catch(e){s?o.innerHTML=`<p style="color:var(--pm-danger);font-size:0.82rem;">Error al cargar historial: ${i(e.message)}</p>`:(console.error(`[_renderProgresos] Error loading page:`,e),n!==void 0&&n&&n.error(`Error al cargar más registros: `+e.message))}}async function x(n,{alumnoId:a}){n.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let o=t();if(!o){n.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!a){n.innerHTML=`<p class="pm-empty">No se especificó el alumno.</p>`;return}try{let{data:t,error:s}=await e.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, tlf_alumno, fecha_nacimiento, created_at, nivel_actual, representante_nombre, representante_tlf, correo_representante, direccion`).eq(`id`,a).single();if(s||!t){console.error(`[AlumnoPerfil] Error al obtener alumno:`,s),n.innerHTML=`
        <div class="pm-empty" style="padding:3rem 1rem;">
          <i class="bi bi-person-x" style="font-size:3rem;opacity:0.3;"></i>
          <p>Alumno no encontrado o error de acceso.</p>
          <button class="pm-btn pm-btn-secondary" onclick="window.history.back()" style="margin-top:1rem;">Volver</button>
        </div>
      `;return}let{data:c}=await e.from(`alumnos_clases`).select(`clase_id`).eq(`alumno_id`,a).eq(`activo`,!0),l=(c||[]).map(e=>e.clase_id).filter(Boolean),{data:u}=await e.from(`sesiones_clase`).select(`id, clase_id, fecha, contenido_dsl, asistencia`).filter(`asistencia`,`cs`,JSON.stringify([{alumno_id:a}])).order(`fecha`,{ascending:!1}).limit(60),p=(u||[]).map(e=>{let t=e.asistencia?.find(e=>e.alumno_id===a);return t?{fecha:e.fecha,estado:t.estado,clase_id:e.clase_id,sesion_id:e.id,contenido_dsl:e.contenido_dsl,observaciones:t.observaciones||null}:null}).filter(Boolean);new Map(p.map(e=>[e.sesion_id,e.contenido_dsl]));let{data:m}=await e.from(`indicator_attempts`).select(`id, nota, observations, tarea, created_at, indicator_id, covered_by_clase_id`).eq(`student_id`,a).order(`created_at`,{ascending:!1}).limit(30),{data:y}=await e.from(`ausencias`).select(`id, fecha_inicio, fecha_fin, motivo, estado, clase_id`).eq(`alumno_id`,a).order(`fecha_inicio`,{ascending:!1}).limit(10),{data:x}=await e.from(`justificaciones`).select(`sesion_id, motivo, evidencia_url, estado, fecha`).eq(`alumno_id`,a).order(`fecha`,{ascending:!1}),S=new Map((x||[]).map(e=>[e.sesion_id,e])),C=p.length,w=p.filter(e=>e.estado===`P`).length,T=p.filter(e=>e.estado===`A`).length,E=p.filter(e=>e.estado===`J`).length,D=p.filter(e=>e.estado===`T`).length,O=C>0?Math.round(w/C*100):0,k=m?.filter(e=>e.nota!=null&&e.nota!==0)||[],A={};k.forEach(e=>{let t=e.covered_by_clase_id||`sin_clase`;A[t]||(A[t]=[]),A[t].push(e.nota)});let j=Object.values(A).map(e=>e.reduce((e,t)=>e+t,0)/e.length),M=j.length>0?Math.round(j.reduce((e,t)=>e+t,0)/j.length*10)/10:0,N=k.filter(e=>e.nota>=4).length,P=k.length,F=P>0?Math.round(N/P*100):0,I={};p.forEach(e=>{I[e.clase_id]||(I[e.clase_id]={P:0,A:0,J:0,T:0,total:0}),e.estado&&(I[e.clase_id][e.estado]=(I[e.clase_id][e.estado]||0)+1,I[e.clase_id].total++)});let L=new Set([...l,...Object.keys(I)]),{data:R}=L.size>0?await e.from(`clases`).select(`id, nombre, instrumento, nivel`).in(`id`,[...L]):{data:[]},z=new Map((R||[]).map(e=>[e.id,e])),B=p.filter(e=>e.estado===`P`&&e.contenido_dsl?.trim()),V=m?.filter(e=>e.observations?.trim())||[],H=`—`;if(t.fecha_nacimiento){let e=new Date(t.fecha_nacimiento),n=new Date;H=n.getFullYear()-e.getFullYear(),(n.getMonth()<e.getMonth()||n.getMonth()===e.getMonth()&&n.getDate()<e.getDate())&&H--}let U=t.created_at?new Date(t.created_at).toLocaleDateString(`es-ES`,{month:`long`,year:`numeric`}):`Reciente`,W=(t.instrumento_principal||``).toLowerCase(),G=`var(--pm-primary)`;(W.includes(`violin`)||W.includes(`cuerda`))&&(G=`#FF3B30`),(W.includes(`piano`)||W.includes(`teclado`))&&(G=`#FF9500`),W.includes(`guitarra`)&&(G=`#5856D6`),(W.includes(`canto`)||W.includes(`voz`))&&(G=`#AF52DE`),n.innerHTML=`
      <div class="pm-alumno-zen pm-animate-fade-in">
        <!-- Hero Section -->
        <div class="pm-zen-hero" style="--accent-gradient: ${G}">
          <div class="pm-zen-hero__overlay"></div>
          <header class="pm-zen-header">
            <button id="pm-alumno-back" class="pm-zen-back">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="pm-zen-header-tag">Perfil Académico</span>
          </header>
          
          <div class="pm-zen-hero__content">
            <div class="pm-zen-avatar" style="width:70px;height:70px;font-size:1.8rem;">
              ${(t.nombre_completo||`A`)[0].toUpperCase()}
            </div>
            <div class="pm-zen-info">
              <h1 class="pm-zen-name">${i(t.nombre_completo)}</h1>
              <p class="pm-zen-instrument">${i(t.instrumento_principal||`Estudiante`)}</p>
              <p style="font-size:0.8rem;opacity:0.8;margin-top:4px;">Nivel ${t.nivel_actual||1} • ${H} años</p>
            </div>
          </div>
        </div>

        <div class="pm-zen-body">
          <!-- 📊 Panel de Métricas Principales -->
          <div class="pm-zen-mosaic" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-zen-card pm-zen-card--large pm-glass" style="grid-column: span 2;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <span class="pm-zen-card__label" style="font-size:0.78rem;font-weight:500;">📈 Rendimiento Académico</span>
                ${P>0?`<span style="font-size:1.4rem;font-weight:700;line-height:1;color:${M>=4?`var(--pm-success)`:M>=2?`var(--pm-warning)`:`var(--pm-danger)`}">${M.toFixed(1)}</span>`:`<span style="font-size:0.8rem;color:var(--pm-text-muted);">Sin datos</span>`}
              </div>
              ${P>0?`
              <div class="pm-student-panel__progress-bar" style="height:6px;border-radius:3px;background:var(--pm-border);">
                <div style="width:${F}%;background:${M>=4?`var(--pm-success)`:M>=2?`var(--pm-warning)`:`var(--pm-danger)`};height:100%;border-radius:3px;"></div>
              </div>
              <p style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.4rem;">
                ${N} de ${P} indicadores aprobados · ${F}%
              </p>`:`<p style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.25rem;">Aún no hay evaluaciones registradas</p>`}
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">✅ Asistencia</span>
              ${C>0?`<div style="display:flex;align-items:baseline;gap:0.25rem;">
                     <span class="pm-zen-card__value" style="font-size:1.8rem;color:${O>=75?`var(--pm-success)`:O>=50?`var(--pm-warning)`:`var(--pm-danger)`};line-height:1;">${w}</span>
                     <span style="font-size:1rem;color:var(--pm-text-muted);font-weight:500;">/ ${C}</span>
                   </div>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;margin-top:2px;">
                     ${O}% asistencia
                     ${T>0?`· <span style="color:var(--pm-danger)">${T} ausente${T>1?`s`:``}</span>`:``}
                     ${E>0?`· <span style="color:var(--pm-warning)">${E} justif.</span>`:``}
                     ${D>0?`· <span style="color:#FF9500">${D} tarde${D>1?`s`:``}</span>`:``}
                   </p>`:`<span class="pm-zen-card__value" style="font-size:1.1rem;color:var(--pm-text-muted);">Sin clases</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">No hay sesiones registradas</p>`}
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">📅 Clases Activas</span>
              ${l.length>0?`<span class="pm-zen-card__value" style="font-size:1.8rem;">${l.length}</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">Materias inscritas</p>`:`<span class="pm-zen-card__value" style="font-size:1.1rem;color:var(--pm-text-muted);">Sin inscripción</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">No está en ninguna clase activa</p>`}
            </div>
          </div>

          <!-- 🎵 Clases Inscritas -->
          ${l.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🎵 Clases Inscritas</h3>
            <div class="pm-zen-clases-grid">
              ${l.map(e=>{let t=z.get(e);if(!t)return``;let n=I[e]||{P:0,A:0,J:0,T:0,total:0},r=n.total>0?Math.round(n.P/n.total*100):null,a=m?.filter(t=>t.covered_by_clase_id===e&&t.nota!=null&&t.nota!==0)||[],o=a.length>0?Math.round(a.reduce((e,t)=>e+t.nota,0)/a.length*10)/10:null;return`
                  <div class="pm-zen-clase-card pm-glass">
                    <div class="pm-zen-clase-header">
                      <strong>${i(t.nombre)}</strong>
                      ${t.nivel?`<span class="pm-zen-clase-nivel">Nivel ${t.nivel}</span>`:``}
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <p class="pm-zen-clase-inst" style="margin:0;">${i(t.instrumento||``)}</p>
                      ${o===null?`
                        <span class="badge-apple" style="background:var(--pm-surface-3); color:var(--pm-text-muted); font-size:0.65rem; padding:2px 6px; border-radius:10px;">Sin notas</span>
                      `:`
                        <span class="badge-apple" style="background:${o>=4?`rgba(52, 199, 89, 0.12)`:o>=3?`rgba(255, 149, 0, 0.12)`:`rgba(255, 59, 48, 0.12)`}; color:${o>=4?`rgb(36, 172, 69)`:o>=3?`rgb(229, 134, 0)`:`rgb(221, 35, 29)`}; font-size:0.7rem; font-weight:700; padding:2px 6px; border-radius:10px; display:inline-flex; align-items:center; gap:2px;">
                          ⭐ ${o.toFixed(1)}
                        </span>
                      `}
                    </div>
                    <div class="pm-zen-clase-stats">
                      <div class="pm-zen-clase-stat" style="flex:1.2;">
                        <div style="display:flex;align-items:baseline;gap:3px;">
                          <span class="pm-zen-stat-value" style="color:${r===null?`var(--pm-text-muted)`:r>=75?`var(--pm-success)`:r>=50?`var(--pm-warning)`:`var(--pm-danger)`};">${n.P}</span>
                          <span style="font-size:0.7rem;color:var(--pm-text-muted);">/ ${n.total||`—`}</span>
                        </div>
                        <span class="pm-zen-stat-label">${r===null?`Sin datos`:r+`%`}</span>
                      </div>
                      ${n.A>0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-danger);">${n.A}</span>
                        <span class="pm-zen-stat-label">Ausente${n.A>1?`s`:``}</span>
                      </div>`:``}
                      ${n.J>0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-warning);">${n.J}</span>
                        <span class="pm-zen-stat-label">Justif.</span>
                      </div>`:``}
                      ${n.T>0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:#FF9500;">${n.T}</span>
                        <span class="pm-zen-stat-label">Tarde${n.T>1?`s`:``}</span>
                      </div>`:``}
                      ${n.total===0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-text-muted);">—</span>
                        <span class="pm-zen-stat-label">Sin registros</span>
                      </div>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📖 Bitácora de Clases -->
          ${B.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📖 Bitácora de Clases</h3>
            <div class="pm-zen-bitacora">
              ${B.map(e=>{let t=z.get(e.clase_id),n=v(e.contenido_dsl);return`
                  <div class="pm-zen-bitacora-item pm-glass">
                    <div class="pm-zen-bitacora-header">
                      <span class="pm-zen-bitacora-clase">${i(t?.nombre||`Clase`)}</span>
                      <span class="pm-zen-bitacora-fecha">${new Date(e.fecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`2-digit`})}</span>
                    </div>
                    <p class="pm-zen-bitacora-contenido">${i(n)}</p>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📝 Últimas Evaluaciones -->
          ${k.length>0?`
          <details class="pm-zen-section pm-zen-accordion">
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">📝 Últimas Evaluaciones</span>
              <span class="pm-zen-accordion-meta">${k.length} registro${k.length===1?``:`s`}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-evaluaciones" style="margin-top:0.75rem;">
              ${k.slice(0,8).map(e=>{let t=new Date(e.created_at),n=e.nota>=4?`var(--pm-success)`:e.nota>=2?`var(--pm-warning)`:`var(--pm-danger)`;return`
                  <div class="pm-zen-eval-item">
                    <div class="pm-zen-eval-icon" style="background:${n}20;color:${n}">${e.nota>=4?`✅`:e.nota>=2?`⚠️`:`❌`}</div>
                    <div class="pm-zen-eval-content">
                      <div class="pm-zen-eval-header">
                        <strong>Nota: ${e.nota}</strong>
                        <span>${t.toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`})}</span>
                      </div>
                      ${e.tarea?`<p class="pm-zen-eval-tarea">${i(e.tarea)}</p>`:``}
                      ${e.observations?`<p class="pm-zen-eval-obs">${i(e.observations.substring(0,80))}${e.observations.length>80?`...`:``}</p>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </details>
          `:``}

          <!-- 💬 Desenvolvimiento del Alumno -->
          ${V.length>0?`
          <details class="pm-zen-section pm-zen-accordion">
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">💬 Desenvolvimiento</span>
              <span class="pm-zen-accordion-meta">${V.length} observación${V.length===1?``:`es`}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-desenvolvimiento" style="margin-top:0.75rem;">
              ${V.map(e=>{let t=e.nota>=4?`var(--pm-success)`:e.nota>=2?`var(--pm-warning)`:`var(--pm-danger)`;return`
                  <div class="pm-zen-desenv-item">
                    <div class="pm-zen-desenv-dot" style="background:${e.nota==null?`var(--pm-primary)`:t}"></div>
                    <div class="pm-zen-desenv-content">
                      <div class="pm-zen-desenv-header">
                        <span class="pm-zen-desenv-fecha">${new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`})}</span>
                        ${e.nota==null?``:`<span class="pm-zen-desenv-nota" style="color:${t};">Nota: ${e.nota}</span>`}
                      </div>
                      <p class="pm-zen-desenv-obs">${i(e.observations)}</p>
                      ${e.tarea?`<p class="pm-zen-desenv-tarea">📋 ${i(e.tarea)}</p>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </details>
          `:``}

          <!-- 📅 Historial de Asistencia -->
          <details class="pm-zen-section pm-zen-accordion" ${p.length>0?`open`:``}>
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">📅 Historial de Asistencia</span>
              <span class="pm-zen-accordion-meta">${C} sesión${C===1?``:`es`}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-asistencia-timeline" style="margin-top:0.75rem;">
              ${p.length===0?`<p class="pm-zen-empty">Sin registros de asistencia</p>`:p.slice(0,30).map(e=>{let t={P:`Presente`,A:`Ausente`,J:`Justificado`,T:`Tardanza`},n={P:`var(--pm-success)`,A:`var(--pm-danger)`,J:`var(--pm-warning)`,T:`#FF9500`},r=z.get(e.clase_id),a=e.estado===`J`?S.get(e.sesion_id):null;return`
                      <div class="pm-zen-asistencia-item">
                        <div class="pm-zen-asistencia-dot" style="background:${n[e.estado]||`var(--pm-border)`}"></div>
                        <div class="pm-zen-asistencia-content">
                          <div class="pm-zen-asistencia-header">
                            <strong style="color:${n[e.estado]||`inherit`}">${t[e.estado]||e.estado}</strong>
                            <span>${new Date(e.fecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`2-digit`})}</span>
                          </div>
                          <span class="pm-zen-asistencia-clase">${i(r?.nombre||`Clase`)}</span>
                          ${a?`
                            <div class="pm-zen-justif-box">
                              <div class="pm-zen-justif-header">
                                <i class="bi bi-file-earmark-text" style="font-size:0.75rem;"></i>
                                <span>Justificación</span>
                                <span class="pm-zen-justif-estado" style="color:${{pendiente:`var(--pm-warning)`,aprobado:`var(--pm-success)`,rechazado:`var(--pm-danger)`}[a.estado]||`var(--pm-text-muted)`};">${a.estado}</span>
                              </div>
                              <p class="pm-zen-justif-motivo">${i(a.motivo)}</p>
                              ${a.evidencia_url?`<a class="pm-zen-justif-evidencia" href="${a.evidencia_url}" target="_blank" rel="noopener"><i class="bi bi-paperclip"></i> Ver evidencia</a>`:``}
                            </div>
                          `:e.estado===`J`?`<span class="pm-zen-asistencia-obs" style="color:var(--pm-warning);">Justificado — sin detalle registrado</span>`:``}
                          ${e.observaciones?`<span class="pm-zen-asistencia-obs">${i(e.observaciones)}</span>`:``}
                        </div>
                      </div>
                    `}).join(``)}
            </div>
          </details>

          <!-- 🚨 Ausencias Recientes -->
          ${y&&y.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🚨 Ausencias Registradas</h3>
            <div class="pm-zen-ausencias">
              ${y.map(e=>{let t=new Date(e.fecha_inicio).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}),n=e.fecha_fin?new Date(e.fecha_fin).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):t,r={pendiente:`var(--pm-warning)`,aprobada:`var(--pm-success)`,rechazada:`var(--pm-danger)`};return`
                  <div class="pm-zen-ausencia-item">
                    <div class="pm-zen-ausencia-icon" style="background:${r[e.estado]||`var(--pm-border)`}20">
                      <i class="bi bi-calendar-x" style="color:${r[e.estado]||`var(--pm-text-muted)`}"></i>
                    </div>
                    <div class="pm-zen-ausencia-content">
                      <div class="pm-zen-ausencia-header">
                        <strong>${t===n?t:`${t} - ${n}`}</strong>
                        <span class="pm-zen-ausencia-estado" style="color:${r[e.estado]||`var(--pm-text-muted)`}">${e.estado||`pendiente`}</span>
                      </div>
                      ${e.motivo?`<p class="pm-zen-ausencia-motivo">${i(e.motivo.substring(0,60))}${e.motivo.length>60?`...`:``}</p>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📞 Información de Contacto -->
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📞 Datos de Contacto</h3>
            <div class="pm-zen-details-grid">
              <div class="pm-zen-detail">
                <i class="bi bi-telephone-fill"></i>
                <div style="flex:1;min-width:0;">
                  <span>${t.tlf_alumno?`Teléfono alumno`:t.representante_tlf?`Teléfono representante`:`Teléfono`}</span>
                  <strong>${r(t.tlf_alumno||t.representante_tlf)||`—`}</strong>
                </div>
                ${t.tlf_alumno||t.representante_tlf?`
                <button
                  id="btn-whatsapp-alumno"
                  class="pm-btn-whatsapp"
                  data-phone="${t.tlf_alumno||t.representante_tlf}"
                  title="Enviar mensaje por WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>`:``}
              </div>
              ${t.representante_nombre?`
              <div class="pm-zen-detail">
                <i class="bi bi-person-vcard"></i>
                <div>
                  <span>Representante</span>
                  <strong>${i(t.representante_nombre)}</strong>
                </div>
              </div>`:``}
              ${t.correo_representante?`
              <div class="pm-zen-detail">
                <i class="bi bi-envelope"></i>
                <div>
                  <span>Correo representante</span>
                  <strong>${i(t.correo_representante)}</strong>
                </div>
              </div>`:``}
              ${t.direccion?`
              <div class="pm-zen-detail">
                <i class="bi bi-geo-alt"></i>
                <div>
                  <span>Dirección</span>
                  <strong>${i(t.direccion)}</strong>
                </div>
              </div>`:``}
              <div class="pm-zen-detail">
                <i class="bi bi-calendar-check"></i>
                <div>
                  <span>Fecha de ingreso</span>
                  <strong>${U}</strong>
                </div>
              </div>
              <div class="pm-zen-detail">
                <i class="bi bi-cake"></i>
                <div>
                  <span>Fecha de nacimiento</span>
                  <strong>${t.fecha_nacimiento?new Date(t.fecha_nacimiento).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`}):`No registrada`}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Progreso Académico (Interactive) -->
          <div class="pm-zen-section">
            <div class="pm-zen-section-header">
              <h3 class="pm-zen-section-title">📚 Plan de Estudios</h3>
            </div>
            <div id="pm-alumno-progreso-root" class="pm-zen-progress-container">
              <div class="pm-loading-zen"><div class="pm-pulse"></div></div>
            </div>
          </div>

          <!-- 🎯 Historial de Progreso (IA) -->
          <div class="pm-zen-section">
            <div class="pm-zen-section-header">
              <h3 class="pm-zen-section-title">🎯 Historial de Progreso (IA)</h3>
            </div>
            <div id="pm-alumno-progresos-root" class="pm-zen-progress-container">
              <div class="pm-loading-zen"><div class="pm-pulse"></div></div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .pm-zen-clases-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
        .pm-zen-clase-card {
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
          padding: 0.75rem;
        }
        .pm-zen-clase-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .pm-zen-clase-header strong {
          font-size: 0.85rem;
          line-height: 1.2;
        }
        .pm-zen-clase-nivel {
          font-size: 0.65rem;
          color: var(--pm-primary);
          background: var(--pm-primary);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .pm-zen-clase-inst {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0.5rem;
        }
        .pm-zen-clase-stats {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--pm-border);
          padding-top: 0.5rem;
        }
        .pm-zen-clase-stat {
          text-align: center;
        }
        .pm-zen-stat-value {
          display: block;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .pm-zen-stat-label {
          font-size: 0.6rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-evaluaciones {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pm-zen-eval-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
        }
        .pm-zen-eval-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .pm-zen-eval-content {
          flex: 1;
          min-width: 0;
        }
        .pm-zen-eval-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .pm-zen-eval-tarea {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
        .pm-zen-eval-obs {
          font-size: 0.75rem;
          color: var(--pm-text);
          margin: 0.25rem 0 0;
          font-style: italic;
        }
        .pm-zen-asistencia-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .pm-zen-asistencia-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.25rem 0;
        }
        .pm-zen-asistencia-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .pm-zen-asistencia-content {
          flex: 1;
        }
        .pm-zen-asistencia-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }
        .pm-zen-asistencia-clase {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-asistencia-obs {
          display: block;
          font-size: 0.68rem;
          color: var(--pm-text-muted);
          font-style: italic;
          margin-top: 1px;
        }
        .pm-zen-ausencias {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pm-zen-ausencia-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
        }
        .pm-zen-ausencia-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pm-zen-ausencia-content {
          flex: 1;
        }
        .pm-zen-ausencia-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .pm-zen-ausencia-estado {
          font-size: 0.7rem;
          text-transform: capitalize;
        }
        .pm-zen-ausencia-motivo {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
        /* Botón WhatsApp */
        .pm-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          border: none;
          background: #25D366;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .pm-btn-whatsapp:hover { background: #1ebe5a; transform: scale(1.03); }
        .pm-btn-whatsapp:active { transform: scale(0.97); }
        /* Modal WhatsApp */
        #pm-wa-modal { display: none; }
        #pm-wa-modal.open { display: block; }
        .pm-wa-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1050;
        }
        .pm-wa-dialog {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1051;
          background: var(--pm-surface, #fff);
          border-radius: 20px 20px 0 0;
          max-width: 520px;
          margin: 0 auto;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.15);
          animation: waSlideUp 0.25s ease;
        }
        @keyframes waSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .pm-wa-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 1rem 1rem 0.75rem;
          border-bottom: 1px solid var(--pm-border);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .pm-wa-header span { flex: 1; }
        .pm-wa-close {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: var(--pm-text-muted);
          padding: 0 0.25rem;
        }
        .pm-wa-body { padding: 0.85rem 1rem; }
        .pm-wa-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 0.5rem;
        }
        .pm-wa-templates {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .pm-wa-tpl {
          padding: 0.3rem 0.75rem;
          border-radius: 16px;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--pm-text);
        }
        .pm-wa-tpl:hover { border-color: #25D366; color: #25D366; }
        .pm-wa-tpl.active { background: #25D36615; border-color: #25D366; color: #1a9e4d; font-weight: 600; }
        .pm-wa-textarea {
          width: 100%;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          padding: 0.65rem 0.75rem;
          font-size: 0.85rem;
          line-height: 1.5;
          resize: vertical;
          background: var(--pm-surface-2);
          color: var(--pm-text);
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s;
        }
        .pm-wa-textarea:focus { border-color: #25D366; }
        .pm-wa-footer {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1rem 1.25rem;
          border-top: 1px solid var(--pm-border);
        }
        .pm-wa-cancel {
          flex: 1;
          padding: 0.6rem;
          border-radius: 10px;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          color: var(--pm-text-muted);
          font-size: 0.85rem;
          cursor: pointer;
        }
        .pm-wa-send {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem;
          border-radius: 10px;
          background: #25D366;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }
        .pm-wa-send:hover { background: #1ebe5a; }
        .pm-wa-tpl-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; }
        .pm-wa-tpl-row .pm-wa-label { margin:0; }
        .pm-wa-manage-btn {
          font-size: 0.72rem; background: none; border: 1px solid var(--pm-border);
          border-radius: 8px; padding: 2px 10px; cursor: pointer; color: var(--pm-text-muted);
        }
        .pm-wa-manage-btn:hover { border-color: var(--pm-primary); color: var(--pm-primary); }
        .pm-wa-hint { font-size: 0.68rem; color: var(--pm-text-muted); margin: 0.3rem 0 0; }
        .pm-wa-hint code { background: var(--pm-surface-2); padding: 1px 4px; border-radius: 4px; }
        .pm-wa-back {
          background: none; border: none; font-size: 0.9rem; cursor: pointer;
          color: var(--pm-primary); font-weight: 600; padding: 0 0.5rem 0 0;
        }
        .pm-wa-add-tpl {
          display: block; width: 100%; margin-top: 0.75rem; padding: 0.55rem;
          border: 1px dashed var(--pm-border); border-radius: 10px; background: none;
          color: var(--pm-primary); font-size: 0.82rem; cursor: pointer; text-align: center;
        }
        .pm-wa-add-tpl:hover { background: var(--pm-surface-2); }
        .pm-wa-mgr-item {
          background: var(--pm-surface-2); border-radius: 10px;
          padding: 0.65rem 0.75rem; margin-bottom: 0.6rem;
        }
        .pm-wa-mgr-item-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
        .pm-wa-mgr-label {
          flex: 1; border: 1px solid var(--pm-border); border-radius: 7px;
          padding: 0.3rem 0.5rem; font-size: 0.82rem; font-weight: 600;
          background: var(--pm-surface); color: var(--pm-text);
        }
        .pm-wa-mgr-del {
          background: none; border: none; cursor: pointer; font-size: 1rem;
          opacity: 0.5; flex-shrink: 0;
        }
        .pm-wa-mgr-del:hover { opacity: 1; }
        .pm-wa-mgr-text {
          width: 100%; border: 1px solid var(--pm-border); border-radius: 7px;
          padding: 0.4rem 0.5rem; font-size: 0.8rem; resize: vertical;
          background: var(--pm-surface); color: var(--pm-text);
          font-family: inherit; box-sizing: border-box; line-height: 1.45;
        }
        .pm-wa-mgr-save {
          margin-top: 0.4rem; padding: 0.3rem 0.85rem; border-radius: 7px;
          border: none; background: var(--pm-primary); color: white;
          font-size: 0.78rem; cursor: pointer; font-weight: 600;
        }
        .pm-wa-mgr-save:hover { opacity: 0.85; }
        /* Acordeón */
        .pm-zen-accordion { list-style: none; }
        .pm-zen-accordion summary { list-style: none; }
        .pm-zen-accordion summary::-webkit-details-marker { display: none; }
        .pm-zen-accordion-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.1rem 0;
          user-select: none;
        }
        .pm-zen-accordion-header:hover .pm-zen-section-title { opacity: 0.8; }
        .pm-zen-accordion-meta {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          background: var(--pm-surface-2);
          padding: 2px 7px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .pm-accordion-chevron {
          margin-left: auto;
          font-size: 0.8rem;
          color: var(--pm-text-muted);
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        details[open] .pm-accordion-chevron { transform: rotate(180deg); }
        /* Justificaciones */
        .pm-zen-justif-box {
          margin-top: 0.35rem;
          background: var(--pm-warning)15;
          border: 1px solid var(--pm-warning)40;
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
        }
        .pm-zen-justif-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          margin-bottom: 0.25rem;
        }
        .pm-zen-justif-estado {
          margin-left: auto;
          font-size: 0.68rem;
          text-transform: capitalize;
          font-weight: 700;
        }
        .pm-zen-justif-motivo {
          font-size: 0.8rem;
          line-height: 1.45;
          margin: 0;
          color: var(--pm-text);
        }
        .pm-zen-justif-evidencia {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          color: var(--pm-primary);
          margin-top: 0.3rem;
          text-decoration: none;
        }
        .pm-zen-justif-evidencia:hover { text-decoration: underline; }
        /* Bitácora de Clases */
        .pm-zen-bitacora {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pm-zen-bitacora-item {
          padding: 0.75rem;
          border-radius: var(--pm-radius-sm);
          background: var(--pm-surface-2);
          border-left: 3px solid var(--pm-primary);
        }
        .pm-zen-bitacora-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .pm-zen-bitacora-clase {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--pm-primary);
        }
        .pm-zen-bitacora-fecha {
          font-size: 0.72rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-bitacora-contenido {
          font-size: 0.8rem;
          line-height: 1.5;
          margin: 0;
          color: var(--pm-text);
          white-space: pre-wrap;
        }
        /* Desenvolvimiento */
        .pm-zen-desenvolvimiento {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          padding-left: 1.25rem;
        }
        .pm-zen-desenvolvimiento::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--pm-border);
          border-radius: 1px;
        }
        .pm-zen-desenv-item {
          display: flex;
          gap: 0.75rem;
          padding-bottom: 1rem;
          position: relative;
        }
        .pm-zen-desenv-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 3px;
          position: absolute;
          left: -1.35rem;
          border: 2px solid var(--pm-surface);
        }
        .pm-zen-desenv-content {
          flex: 1;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
          padding: 0.6rem 0.75rem;
        }
        .pm-zen-desenv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        .pm-zen-desenv-fecha {
          font-size: 0.72rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-desenv-nota {
          font-size: 0.72rem;
          font-weight: 700;
        }
        .pm-zen-desenv-obs {
          font-size: 0.82rem;
          line-height: 1.55;
          margin: 0;
          color: var(--pm-text);
        }
        .pm-zen-desenv-tarea {
          font-size: 0.73rem;
          color: var(--pm-text-muted);
          margin: 0.3rem 0 0;
        }
      </style>
    `,n.querySelector(`#pm-alumno-back`).onclick=()=>window.history.back();let K=f(t.tlf_alumno||t.representante_tlf);if(K){let e=t.nombre_completo||`el alumno`,r=t.representante_nombre||e,a={alumno:e,contacto:r},s=document.createElement(`div`);s.id=`pm-wa-modal`,s.innerHTML=`
        <div class="pm-wa-backdrop"></div>
        <div class="pm-wa-dialog">
          <!-- Vista: Enviar mensaje -->
          <div id="pm-wa-view-send">
            <div class="pm-wa-header">
              <svg viewBox="0 0 24 24" fill="#25D366" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>Mensaje para <strong>${i(r)}</strong></span>
              <button class="pm-wa-close" id="pm-wa-close">✕</button>
            </div>
            <div class="pm-wa-body">
              <div class="pm-wa-tpl-row">
                <p class="pm-wa-label">Plantillas</p>
                <button class="pm-wa-manage-btn" id="pm-wa-manage">✏️ Gestionar</button>
              </div>
              <div class="pm-wa-templates" id="pm-wa-tpl-list"></div>
              <p class="pm-wa-label" style="margin-top:0.85rem;">Mensaje</p>
              <textarea id="pm-wa-text" class="pm-wa-textarea" rows="5" placeholder="Escribí tu mensaje aquí..."></textarea>
              <p class="pm-wa-hint">Usá <code>{alumno}</code> y <code>{contacto}</code> como variables dinámicas.</p>
            </div>
            <div class="pm-wa-footer">
              <button class="pm-wa-cancel" id="pm-wa-cancel">Cancelar</button>
              <a id="pm-wa-send" class="pm-wa-send" href="#" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Abrir en WhatsApp
              </a>
            </div>
          </div>

          <!-- Vista: Gestionar plantillas -->
          <div id="pm-wa-view-mgr" style="display:none;">
            <div class="pm-wa-header">
              <button class="pm-wa-back" id="pm-wa-back">‹ Volver</button>
              <span style="flex:1;font-weight:600;">Gestionar plantillas</span>
              <button class="pm-wa-close" id="pm-wa-close2">✕</button>
            </div>
            <div class="pm-wa-body" style="max-height:55vh;overflow-y:auto;">
              <div id="pm-wa-tpl-mgr-list"></div>
              <button class="pm-wa-add-tpl" id="pm-wa-add-tpl">+ Nueva plantilla</button>
            </div>
          </div>
        </div>
      `,n.appendChild(s);let c=s.querySelector(`#pm-wa-view-send`),l=s.querySelector(`#pm-wa-view-mgr`),u=s.querySelector(`#pm-wa-tpl-list`),d=s.querySelector(`#pm-wa-tpl-mgr-list`),f=s.querySelector(`#pm-wa-text`),p=s.querySelector(`#pm-wa-send`);function m(){return h(o.id)}function v(e){g(o.id,e)}function y(){let e=f.value.trim();p.href=e?`https://wa.me/${K}?text=${encodeURIComponent(e)}`:`https://wa.me/${K}`}function b(e){u.querySelectorAll(`.pm-wa-tpl`).forEach(e=>e.classList.remove(`active`)),u.querySelector(`[data-id="${e.id}"]`)?.classList.add(`active`),f.value=_(e.text,a),y()}function x(){let e=m();u.innerHTML=e.length?e.map(e=>`<button class="pm-wa-tpl" data-id="${e.id}">${i(e.label)}</button>`).join(``):`<span style="font-size:0.78rem;color:var(--pm-text-muted);">Sin plantillas — creá una en Gestionar.</span>`,u.querySelectorAll(`.pm-wa-tpl`).forEach(e=>{e.addEventListener(`click`,()=>{let t=m().find(t=>t.id===e.dataset.id);t&&b(t)})});let t=m()[0];t&&b(t)}function S(){let e=m();d.innerHTML=e.length===0?`<p style="font-size:0.82rem;color:var(--pm-text-muted);text-align:center;padding:1rem 0;">Sin plantillas todavía.</p>`:e.map(e=>`
            <div class="pm-wa-mgr-item" data-id="${e.id}">
              <div class="pm-wa-mgr-item-header">
                <input class="pm-wa-mgr-label" value="${i(e.label)}" placeholder="Nombre de la plantilla" />
                <button class="pm-wa-mgr-del" data-id="${e.id}" title="Eliminar">🗑</button>
              </div>
              <textarea class="pm-wa-mgr-text" rows="3">${i(e.text)}</textarea>
              <button class="pm-wa-mgr-save" data-id="${e.id}">Guardar</button>
            </div>
          `).join(``),d.querySelectorAll(`.pm-wa-mgr-save`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.pm-wa-mgr-item`),n=e.dataset.id,r=m(),i=r.findIndex(e=>e.id===n);i!==-1&&(r[i].label=t.querySelector(`.pm-wa-mgr-label`).value.trim()||r[i].label,r[i].text=t.querySelector(`.pm-wa-mgr-text`).value.trim(),v(r),e.textContent=`✓ Guardado`,setTimeout(()=>{e.textContent=`Guardar`},1500))})}),d.querySelectorAll(`.pm-wa-mgr-del`).forEach(e=>{e.addEventListener(`click`,()=>{v(m().filter(t=>t.id!==e.dataset.id)),S()})})}s.querySelector(`#pm-wa-add-tpl`).addEventListener(`click`,()=>{let e=m();e.push({id:`tpl-${Date.now()}`,label:`✏️ Nueva plantilla`,text:`Hola {contacto}, le escribo sobre {alumno}.`}),v(e),S()}),s.querySelector(`#pm-wa-manage`).addEventListener(`click`,()=>{c.style.display=`none`,l.style.display=`block`,S()}),s.querySelector(`#pm-wa-back`).addEventListener(`click`,()=>{l.style.display=`none`,c.style.display=`block`,x()});let C=()=>{s.classList.add(`open`),x()},w=()=>{s.classList.remove(`open`),l.style.display=`none`,c.style.display=`block`};n.querySelector(`#btn-whatsapp-alumno`)?.addEventListener(`click`,C),s.querySelector(`#pm-wa-close`).addEventListener(`click`,w),s.querySelector(`#pm-wa-close2`).addEventListener(`click`,w),s.querySelector(`#pm-wa-cancel`).addEventListener(`click`,w),s.querySelector(`.pm-wa-backdrop`).addEventListener(`click`,w),f.addEventListener(`input`,y),p.addEventListener(`click`,()=>setTimeout(w,300))}let q=n.querySelector(`#pm-alumno-progreso-root`);q&&new d({container:q,alumnoId:a,maestroId:o.id}).init().catch(e=>{console.error(`[AlumnoPerfil] PlanEstudiosPanel error:`,e),q.innerHTML=`<p style="color:var(--pm-danger);font-size:0.82rem;">Error al cargar plan de estudios: ${i(e.message)}</p>`}),b(n,a)}catch(e){console.error(`[AlumnoPerfil] Error crítico:`,e),n.innerHTML=`
      <div class="pm-zen-error">
        <i class="bi bi-exclamation-octagon"></i>
        <p>No pudimos cargar el perfil en este momento</p>
        <button class="pm-btn pm-btn-secondary" onclick="window.history.back()">Regresar</button>
      </div>
    `}}export{x as renderAlumnoPerfilView};