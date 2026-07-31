import{i as e,r as t}from"./AppModal-B8f8dDnR.js";import{i as n,r}from"./pwaInstaller-BvjserFL.js";import{i}from"./supabase-Cgh_dhNB.js";import{t as a}from"./vendor-GwDQZeW3.js";import{i as o,n as s,r as c,t as l}from"./IndicadorLogro-DxErtvEQ.js";import{t as u}from"./router-DPk1oCHJ.js";import{t as d}from"./a11yUtils-DRYT20ux.js";import{a as f,c as p,d as m,i as h,r as g}from"./weeklyPlanAdapter-DNVUXbnX.js";function _(e){return e?String(e).split(`
`).map(e=>e.trim()).filter(Boolean):[]}function v(e){return e?Array.isArray(e)?e.join(`
`):typeof e==`string`?e:``:``}async function y(e,t=null){if(!e)return null;let n=i.from(`planificaciones`).select(`*`).eq(`clase_id`,e).eq(`activo`,!0).order(`created_at`,{ascending:!1}).limit(1);t&&(n=n.eq(`periodo_nombre`,t));let{data:r,error:a}=await n;if(a)throw Error(`No se pudo cargar el plan: ${a.message}`);return r?.[0]??null}async function b(){let{data:e}=await i.auth.getUser(),t=e?.user?.id;if(!t)throw Error(`Sesión no iniciada`);let{data:n,error:r}=await i.from(`maestros`).select(`id`).eq(`user_id`,t).maybeSingle();if(r)throw Error(`No se pudo identificar al maestro: ${r.message}`);if(!n?.id)throw Error(`Su usuario no está vinculado a un maestro`);return n.id}async function x(e){let t=(e.titulo||``).trim();if(!e.clase_id)throw Error(`Falta la clase`);if(!t)throw Error(`El título del plan es obligatorio`);let n={clase_id:e.clase_id,titulo:t,descripcion:(e.descripcion||``).trim()||null,periodo_nombre:e.periodo_nombre||null,fecha_inicio:e.fecha_inicio||null,fecha_fin:e.fecha_fin||null,instrumento:e.instrumento||null,contenidos:_(e.contenidos),obras:_(e.obras),tecnicas:_(e.tecnicas),escalas_arpegios:_(e.escalas_arpegios),estado:e.estado||`borrador`,activo:!0,updated_at:new Date().toISOString()};if(e.id){let{data:t,error:r}=await i.from(`planificaciones`).update(n).eq(`id`,e.id).select().maybeSingle();if(r)throw Error(`No se pudo guardar el plan: ${r.message}`);return t}n.maestro_id=await b();let{data:r,error:a}=await i.from(`planificaciones`).insert([n]).select().maybeSingle();if(a)throw Error(`No se pudo crear el plan: ${a.message}`);return r}async function S(e,{periodoNombre:t,fechaInicio:n=null,fechaFin:r=null}){if(!e)throw Error(`Falta el plan a duplicar`);if(!t)throw Error(`Indique el período de destino`);let{data:a,error:o}=await i.from(`planificaciones`).select(`*`).eq(`id`,e).maybeSingle();if(o)throw Error(`No se pudo leer el plan original: ${o.message}`);if(!a)throw Error(`El plan original ya no existe`);let{id:s,created_at:c,updated_at:l,...u}=a,{data:d,error:f}=await i.from(`planificaciones`).insert([{...u,periodo_nombre:t,fecha_inicio:n,fecha_fin:r,estado:`borrador`,activo:!0,maestro_id:await b()}]).select().maybeSingle();if(f)throw Error(`No se pudo duplicar el plan: ${f.message}`);return d}async function C(e){if(!e)return[];let{data:t,error:n}=await i.from(`clases`).select(`route_version_id`).eq(`id`,e).maybeSingle();if(n)throw Error(`No se pudo leer la clase: ${n.message}`);if(!t?.route_version_id)return[];let{data:r,error:a}=await i.from(`nodes`).select(`id, name, codigo, level:levels!inner(level_number, name, route_version_id)`).eq(`level.route_version_id`,t.route_version_id).not(`codigo`,`is`,null).order(`name`);if(a)throw Error(`No se pudo cargar el apoyo curricular: ${a.message}`);let o=new Set;return(r??[]).filter(e=>o.has(e.codigo)?!1:(o.add(e.codigo),!0))}async function w(){let{data:e,error:t}=await i.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});if(t)throw Error(`No se pudieron cargar los períodos: ${t.message}`);return e??[]}var T=[[`contenidos`,`Contenidos`,`Un contenido por línea`],[`obras`,`Obras y repertorio`,`Una obra por línea`],[`tecnicas`,`Técnicas`,`Una técnica por línea`],[`escalas_arpegios`,`Escalas y arpegios`,`Una por línea`]];function E(e,{clase:n,periodoActivo:r=null,onCambio:i}={}){let a=null,o=[],s=[],c=!0,l=null;function u(e,n,r){return`
      <div style="border-left:3px solid var(--pm-${e},#f59e0b); background:var(--pm-surface-2,rgba(0,0,0,.03));
                  padding:.85rem 1rem; border-radius:0 10px 10px 0; margin-bottom:1rem;">
        <div style="font-weight:700; font-size:.88rem; margin-bottom:.2rem;">${t(n)}</div>
        <div style="font-size:.82rem; color:var(--pm-text-muted); line-height:1.5;">${r}</div>
      </div>`}function d(){if(c){e.innerHTML=`<div style="text-align:center; padding:2.5rem;">
        <div class="spinner-border text-primary" role="status"></div></div>`;return}if(l){e.innerHTML=u(`danger`,`No se pudo cargar el plan`,t(l));return}let i=a??{};e.innerHTML=`
      ${o.length===0?u(`warning`,`Todavía no hay currículo de ${t(n.instrumento||`este instrumento`)}`,`Podés escribir tu plan igual: no necesitás la ruta para planificar. Cuando la coordinación cargue el currículo, vas a poder apoyarte en él para completar los contenidos.`):``}

      ${a?``:u(`primary`,`Esta clase todavía no tiene plan`,`Completá los campos y guardá. Podés dejarlo en borrador y seguir después.`)}

      <form id="pcp-form" style="display:grid; gap:1rem;">
        <div style="display:grid; gap:1rem; grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));">
          <div>
            <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">Título del plan *</label>
            <input name="titulo" class="form-control form-control-sm rounded-3" required
              style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border);"
              placeholder="Ej: Plan Violas — Semestre 2026-II"
              value="${t(i.titulo||``)}">
          </div>
          <div>
            <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">Período</label>
            <input name="periodo_nombre" class="form-control form-control-sm rounded-3" readonly
              style="background:var(--pm-surface-2,rgba(0,0,0,.04)); color:var(--pm-text-muted); border-color:var(--pm-border);"
              value="${t(i.periodo_nombre||r?.nombre||`Sin período activo`)}">
          </div>
        </div>

        <div>
          <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">Descripción</label>
          <textarea name="descripcion" rows="2" class="form-control form-control-sm rounded-3"
            style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
            placeholder="Qué se propone lograr esta clase durante el período.">${t(i.descripcion||``)}</textarea>
        </div>

        ${o.length===0?``:`
          <div>
            <div style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted); margin-bottom:.4rem;">
              Apoyo del currículo · tocá para agregar a contenidos
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:.35rem;">
              ${o.map(e=>`
                <button type="button" class="pcp-chip" data-agregar="${t(e.name)}">
                  ${t(e.codigo)} · ${t(e.name)}
                </button>`).join(``)}
            </div>
          </div>`}

        <div style="display:grid; gap:1rem; grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));">
          ${T.map(([e,n,r])=>`
            <div>
              <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">${n}</label>
              <textarea name="${e}" rows="4" class="form-control form-control-sm rounded-3"
                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                placeholder="${r}">${t(v(i[e]))}</textarea>
            </div>`).join(``)}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:.75rem; flex-wrap:wrap;">
          <div id="pcp-msg" style="font-size:.82rem;"></div>
          <div style="display:flex; gap:.5rem;">
            ${a?`<button type="button" id="pcp-duplicar" class="btn btn-sm btn-outline-secondary rounded-3">
              Reusar en otro período</button>`:``}
            <button type="submit" class="btn btn-sm btn-primary px-4 rounded-3" style="font-weight:600;">
              ${a?`Guardar cambios`:`Crear plan`}
            </button>
          </div>
        </div>
      </form>

      <style>
        .pcp-chip {
          padding:.25rem .6rem; border-radius:14px; font-size:.74rem;
          border:1px solid var(--pm-border); background:var(--pm-surface-2,rgba(0,0,0,.03));
          color:var(--pm-text-muted); cursor:pointer;
        }
        .pcp-chip:hover { background:var(--pm-primary); color:#fff; border-color:var(--pm-primary); }
        .pcp-chip:focus-visible { outline:2px solid var(--pm-primary); outline-offset:2px; }
      </style>`,p()}function f(t,n=`success`){let r=e.querySelector(`#pcp-msg`);r&&(r.textContent=t,r.style.color=n===`success`?`var(--pm-success,#10b981)`:`var(--pm-danger,#ef4444)`,n===`success`&&setTimeout(()=>{r.textContent===t&&(r.textContent=``)},4e3))}function p(){e.querySelectorAll(`[data-agregar]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=e.querySelector(`textarea[name="contenidos"]`);if(!n)return;let r=n.value.trim(),i=t.dataset.agregar;r.split(`
`).some(e=>e.trim()===i)||(n.value=r?`${r}\n${i}`:i,n.focus())})});let t=e.querySelector(`#pcp-form`);t?.addEventListener(`submit`,async e=>{e.preventDefault();let o=t.querySelector(`button[type="submit"]`),s=o.textContent;o.disabled=!0,o.textContent=`Guardando…`;try{let e=new FormData(t),o=await x({id:a?.id,clase_id:n.id,instrumento:n.instrumento,periodo_nombre:r?.nombre??a?.periodo_nombre??null,fecha_inicio:r?.fecha_inicio??null,fecha_fin:r?.fecha_fin??null,titulo:e.get(`titulo`),descripcion:e.get(`descripcion`),contenidos:e.get(`contenidos`),obras:e.get(`obras`),tecnicas:e.get(`tecnicas`),escalas_arpegios:e.get(`escalas_arpegios`)}),s=!a;a=o,d(),f(s?`Plan creado.`:`Cambios guardados.`),i?.(o)}catch(e){o.disabled=!1,o.textContent=s,f(e.message,`error`)}}),e.querySelector(`#pcp-duplicar`)?.addEventListener(`click`,async()=>{let e=s.filter(e=>e.nombre!==a?.periodo_nombre);if(e.length===0){f(`No hay otro período al cual copiar.`,`error`);return}let t=e.find(e=>e.activo)??e[0];if(window.confirm(`Se copiará este plan a "${t.nombre}" como borrador.\n\nEl plan actual no se modifica.`))try{await S(a.id,{periodoNombre:t.nombre,fechaInicio:t.fecha_inicio,fechaFin:t.fecha_fin}),f(`Copiado a "${t.nombre}" como borrador.`)}catch(e){f(e.message,`error`)}})}async function m(){c=!0,d();try{let[e,t,i]=await Promise.all([y(n.id,r?.nombre??null),C(n.id).catch(()=>[]),w().catch(()=>[])]);a=e,o=t,s=i,l=null}catch(e){l=e.message}finally{c=!1,d()}}return m(),{recargar:m,getPlan:()=>a}}var D={achieved:{label:`Dominado`,icon:`🟢`,cardClass:`estado-completado`},exceeded:{label:`Sobresaliente`,icon:`🔵`,cardClass:`estado-completado`},in_process:{label:`En proceso`,icon:`🟡`,cardClass:`estado-parcial`},needs_reinforcement:{label:`Requiere refuerzo`,icon:`🟠`,cardClass:`estado-parcial`},failed:{label:`No logrado`,icon:`🔴`,cardClass:`estado-no_iniciado`},not_started:{label:`Sin iniciar`,icon:`⚪`,cardClass:`estado-no_iniciado`}},O={violin:`🎻`,viola:`🎻`,cello:`🎻`,contrabajo:`🎻`,chelo:`🎻`,piano:`🎹`,teclado:`🎹`,guitarra:`🎸`,bajo:`🎸`,ukulele:`🎸`,flauta:`🪈`,clarinete:`🎵`,oboe:`🎵`,fagot:`🎵`,saxofon:`🎵`,trompeta:`🎺`,trombon:`🎺`,tuba:`🎺`,corno:`🎺`,corneta:`🎺`,percusion:`🥁`,bateria:`🥁`,marimba:`🥁`,xilofono:`🥁`,timbal:`🥁`,canto:`🎤`,voz:`🎤`,vocal:`🎤`,arpa:`🪗`,acordeon:`🪗`,teoria:`📖`,solfeo:`📖`,armonia:`📖`,historia:`📖`};function k(e){return D[e]||D.not_started}function A(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function j(e){if(!e)return`🎼`;let t=e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``);return Object.entries(O).find(([e])=>t.includes(e))?.[1]||`🎼`}function M(e){return e>=70?`#10b981`:e>=30?`#f59e0b`:`#ef4444`}function N(e){let t=new Set;return(e?.items||[]).filter(e=>{let n=e.indicator_id||`${e.node_id}:${e.topic}`;return t.has(n)?!1:(t.add(n),!0)})}function P(e,t,n){let r=n.length;return N(e).map(e=>{let i=n.map(n=>t[`${n}_${e.indicator_id}`]?.status||`not_started`),a=i.filter(e=>[`achieved`,`exceeded`].includes(e)).length,o=i.filter(e=>[`in_process`,`needs_reinforcement`].includes(e)).length,s=`not_started`;a>0&&a===r&&r>0?s=`achieved`:(a>0||o>0)&&(s=`in_process`);let c=k(s);return{id:e.indicator_id||e.node_id||e.id,weekNumber:e.week_number,topic:e.topic,objective:e.objective,evidence:e.evidence,assessmentMethod:e.assessment_method,teacherStrategy:e.teacher_strategy,progressPercentage:r>0?Math.round(a/r*100):0,achievedCount:a,totalStudents:r,overallStatus:s,meta:c}})}function F(e,t,n){let r=n.map(e=>e.alumno_id).filter(Boolean),i=N(e?.plan),a=i.length,o=0;if(a>0&&r.length>0){let e=0;i.forEach(n=>{r.forEach(r=>{let i=t[`${r}_${n.indicator_id}`]?.status||`not_started`;[`achieved`,`exceeded`].includes(i)&&e++})}),o=Math.round(e/(a*r.length)*100)}return{progressPercentage:o,totalStudents:r.length}}function I(e=3){return`
    <h3 class="pm-section-heading">Mis Clases</h3>
    <div class="pm-planning-classes-grid">
      ${Array(e).fill(0).map(()=>`
        <div class="pm-class-card-skeleton">
          <div class="pm-sk pm-sk-icon"></div>
          <div class="pm-sk-body">
            <div class="pm-sk pm-sk-title"></div>
            <div class="pm-sk pm-sk-badge"></div>
            <div class="pm-sk pm-sk-bar"></div>
            <div class="pm-sk pm-sk-stats"></div>
          </div>
        </div>
      `).join(``)}
    </div>
  `}function L(e,t){e.innerHTML=`<div class="pm-planning-empty"><p>${A(t)}</p></div>`}async function R(t,{maestroId:_}){let v=null,y=null,b=[],x={},S={},C=[];if(!document.getElementById(`pm-planning-styles`)){let e=document.createElement(`style`);e.id=`pm-planning-styles`,e.textContent=`
      /* ── Layout ── */
      .pm-planning-container { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }

      /* ── Header ── */
      .pm-planning-header {
        background: linear-gradient(135deg, var(--pm-primary, #3b82f6), #1d4ed8);
        color: white; padding: 2rem; border-radius: 20px; margin-bottom: 1.5rem;
        position: relative; overflow: hidden;
      }
      .pm-planning-header::before {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%);
        pointer-events: none;
      }
      .pm-planning-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.5rem 0; letter-spacing: -0.02em; }

      /* ── Stepper slider ── */
      .pm-stepper {
        display: flex; align-items: center; gap: 0.75rem;
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--pm-border); border-radius: 16px;
        padding: 0.85rem 1rem; margin-bottom: 1.5rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.04);
        min-height: 72px;
      }
      .pm-stepper-nav {
        background: transparent; border: 1px solid var(--pm-border); border-radius: 8px;
        width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--pm-text-muted); font-size: 0.85rem; flex-shrink: 0;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
        outline: none;
      }
      .pm-stepper-nav:hover { border-color: var(--pm-primary); color: var(--pm-primary); background: rgba(59,130,246,0.06); }
      .pm-stepper-nav:disabled { opacity: 0.3; cursor: default; }
      .pm-stepper-track { flex: 1; overflow: hidden; position: relative; }
      .pm-stepper-slide {
        display: flex; gap: 0; width: 100%;
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .pm-stepper-item {
        min-width: 100%; display: flex; align-items: center; gap: 0.75rem;
        padding: 0 0.25rem;
      }
      .pm-step-num {
        width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white; display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 0.82rem;
        box-shadow: 0 2px 8px rgba(59,130,246,0.35);
      }
      .pm-stepper-content h4 { margin: 0 0 0.1rem 0; font-size: 0.88rem; font-weight: 700; color: var(--pm-text); }
      .pm-stepper-content p  { margin: 0; font-size: 0.76rem; color: var(--pm-text-muted); line-height: 1.3; }
      .pm-stepper-dots {
        display: flex; gap: 5px; flex-shrink: 0; align-items: center;
      }
      .pm-stepper-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--pm-border); transition: background 0.2s, transform 0.2s;
        cursor: pointer; border: none; padding: 0;
      }
      .pm-stepper-dot.active {
        background: var(--pm-primary); transform: scale(1.3);
      }

      /* ── Sección heading ── */
      .pm-section-heading {
        font-size: 1.1rem; font-weight: 700; color: var(--pm-text);
        margin: 0 0 1rem 0; letter-spacing: -0.01em;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .pm-section-heading::after {
        content: ''; flex: 1; height: 1px; background: var(--pm-border);
      }

      /* ── Grid de clases ── */
      .pm-planning-classes-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 0.75rem; margin-bottom: 1.5rem;
      }
      .pm-class-card-interactive {
        background: var(--pm-surface); border: 1px solid var(--pm-border);
        border-radius: 14px; padding: 0.85rem 0.9rem; cursor: pointer;
        transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, border-color 0.18s ease;
        display: flex; align-items: center; gap: 0.85rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        animation: pm-card-in 0.35s ease both;
      }
      .pm-class-card-interactive:hover {
        transform: translateY(-3px) scale(1.01);
        box-shadow: 0 8px 20px rgba(0,0,0,0.09);
        border-color: var(--pm-primary);
      }
      .pm-class-card-interactive:focus-visible {
        outline: 2px solid var(--pm-primary); outline-offset: 2px;
      }
      @keyframes pm-card-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .pm-class-card-avatar {
        width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.35rem; line-height: 1;
        background: rgba(59,130,246,0.08);
      }
      .pm-class-card-body { flex: 1; min-width: 0; }
      .pm-class-card-top {
        display: flex; align-items: center; justify-content: space-between;
        gap: 0.4rem; margin-bottom: 0.2rem;
      }
      .pm-class-card-title {
        font-size: 0.9rem; font-weight: 700; margin: 0;
        color: var(--pm-text); line-height: 1.2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pm-class-card-badge {
        font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.45rem;
        border-radius: 5px; flex-shrink: 0; white-space: nowrap;
      }
      .pm-class-card-plan {
        font-size: 0.7rem; color: var(--pm-text-muted); margin-bottom: 0.4rem;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pm-class-card-meta {
        display: flex; align-items: center; gap: 0.6rem;
        font-size: 0.7rem; color: var(--pm-text-muted);
      }
      .pm-class-card-meta-item { display: flex; align-items: center; gap: 0.2rem; }
      .pm-class-card-progress { flex: 1; }
      .pm-class-card-progress-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 0.2rem;
      }
      .pm-progress-pct { font-size: 0.7rem; font-weight: 700; }

      /* ── Skeleton loading ── */
      .pm-class-card-skeleton {
        background: var(--pm-surface); border: 1px solid var(--pm-border);
        border-radius: 14px; padding: 0.85rem 0.9rem;
        display: flex; align-items: center; gap: 0.85rem;
      }
      .pm-sk {
        border-radius: 8px;
        background: linear-gradient(90deg, var(--pm-border) 25%, rgba(255,255,255,0.06) 50%, var(--pm-border) 75%);
        background-size: 200% 100%;
        animation: pm-shimmer 1.4s infinite;
      }
      @keyframes pm-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .pm-sk-icon  { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }
      .pm-sk-body  { flex: 1; display: flex; flex-direction: column; gap: 0.45rem; }
      .pm-sk-title { height: 14px; width: 65%; border-radius: 6px; }
      .pm-sk-badge { height: 11px; width: 40%; border-radius: 5px; }
      .pm-sk-bar   { height: 5px; width: 100%; border-radius: 999px; }
      .pm-sk-stats { height: 10px; width: 55%; border-radius: 5px; }

      /* ── Estado vacío ── */
      .pm-planning-empty { text-align: center; padding: 3rem 1rem; color: var(--pm-text-muted); }

      /* ── Modal — pestañas ── */
      .pm-tab-btn {
        background: transparent; border: none; border-bottom: 2px solid transparent;
        padding: 0.7rem 1.1rem; font-weight: 600; font-size: 0.88rem;
        color: var(--pm-text-muted); cursor: pointer; transition: color 0.15s, border-color 0.15s;
        display: flex; align-items: center; gap: 0.4rem; white-space: nowrap;
        outline: none;
      }
      .pm-tab-btn:hover { color: var(--pm-text); }
      .pm-tab-btn.active { color: var(--pm-primary); border-bottom-color: var(--pm-primary); }
      .pm-tab-count {
        background: rgba(59,130,246,0.12); color: var(--pm-primary);
        font-size: 0.68rem; font-weight: 700; border-radius: 999px;
        padding: 0.1rem 0.45rem; line-height: 1.4;
      }
      .pm-tab-btn.active .pm-tab-count { background: var(--pm-primary); color: #fff; }

      /* ── Acordeón de semanas ── */
      .pm-week-item {
        border: 1px solid var(--pm-border); border-radius: 14px;
        overflow: hidden; margin-bottom: 0.75rem; background: var(--pm-surface);
        transition: box-shadow 0.2s;
      }
      .pm-week-item.is-current { border-color: var(--pm-primary); box-shadow: 0 0 0 1px var(--pm-primary); }
      .pm-week-header {
        display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
        cursor: pointer; user-select: none;
        background: transparent; border: none; width: 100%; text-align: left;
        color: var(--pm-text); font-size: 0.92rem; outline: none;
      }
      .pm-week-status-dot {
        width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      }
      .pm-week-status-dot.past    { background: var(--pm-text-muted); }
      .pm-week-status-dot.current { background: var(--pm-primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
      .pm-week-status-dot.upcoming{ background: var(--pm-border); border: 1px solid var(--pm-text-muted); }
      .pm-week-chevron {
        margin-left: auto; font-size: 0.8rem; transition: transform 0.2s ease; color: var(--pm-text-muted);
      }
      .pm-week-chevron.open { transform: rotate(180deg); }
      .pm-week-body { display: none; border-top: 1px solid var(--pm-border); }
      .pm-week-body.open { display: block; }

      /* ── Indicadores ── */
      .pm-indicator-card {
        background: var(--pm-surface); border: 1px solid var(--pm-border);
        border-radius: 14px; padding: 1rem 1.1rem; margin-bottom: 0.75rem;
        transition: box-shadow 0.2s;
      }
      .pm-indicator-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

      /* ── Responsivo ── */
      @media (max-width: 768px) {
        .pm-planning-container { padding: 0.75rem; }
        .pm-planning-header { padding: 1.25rem; border-radius: 14px; }
        .pm-planning-instructions-steps { grid-template-columns: 1fr; }
        .pm-planning-classes-grid { grid-template-columns: 1fr; }
        .pm-tab-btn { padding: 0.6rem 0.7rem; font-size: 0.82rem; }
      }
    `,document.head.appendChild(e)}t.innerHTML=`
    <div class="pm-planning-container">
      <div class="pm-planning-header">
        <h1 class="pm-planning-title">📚 Planificación Académica</h1>
        <p style="margin:0; opacity:0.88; font-size:0.95rem; line-height:1.5;">
          ACM define la guía institucional. Adapta pedagógicamente la ejecución de tu grupo
          y evalúa el progreso en tiempo real.
        </p>
        <div style="display:flex; gap:0.6rem; margin-top:0.85rem; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-light text-primary fw-bold rounded-3 shadow-sm" id="btn-pm-header-disenador">
            <i class="bi bi-pencil-square me-1"></i>🎨 Diseñador Curricular (ACM)
          </button>
          <button type="button" class="btn btn-sm btn-outline-light fw-bold rounded-3 shadow-sm" id="btn-pm-header-ruta">
            <i class="bi bi-diagram-3 me-1"></i>🗺️ Ver Ruta Pedagógica SVG
          </button>
        </div>
      </div>

      <div class="pm-stepper" id="pm-guide-stepper" aria-label="Guía de uso paso a paso" role="region">
        <button class="pm-stepper-nav" id="pm-step-prev" aria-label="Paso anterior" type="button">‹</button>
        <div class="pm-stepper-track">
          <div class="pm-stepper-slide" id="pm-step-slide">
            <div class="pm-stepper-item">
              <div class="pm-step-num">1</div>
              <div class="pm-stepper-content">
                <h4>Selecciona tu clase</h4>
                <p>Haz clic en cualquier tarjeta del grid para cargar el cronograma y alumnos.</p>
              </div>
            </div>
            <div class="pm-stepper-item">
              <div class="pm-step-num">2</div>
              <div class="pm-stepper-content">
                <h4>Revisa el Perfil ACM</h4>
                <p>Visualiza el plan curricular y la cobertura real de tu grupo en el ciclo.</p>
              </div>
            </div>
            <div class="pm-stepper-item">
              <div class="pm-step-num">3</div>
              <div class="pm-stepper-content">
                <h4>Ajusta tu ejecución</h4>
                <p>Personaliza estrategias, tareas y evidencias sin alterar el plan base de ACM.</p>
              </div>
            </div>
            <div class="pm-stepper-item">
              <div class="pm-step-num">4</div>
              <div class="pm-stepper-content">
                <h4>Evalúa indicadores</h4>
                <p>Marca logros de forma grupal o califica individualmente a cada estudiante.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="pm-stepper-dots" id="pm-step-dots" role="tablist" aria-label="Pasos">
          <button class="pm-stepper-dot active" data-step="0" aria-label="Paso 1" aria-selected="true" role="tab" type="button"></button>
          <button class="pm-stepper-dot" data-step="1" aria-label="Paso 2" aria-selected="false" role="tab" type="button"></button>
          <button class="pm-stepper-dot" data-step="2" aria-label="Paso 3" aria-selected="false" role="tab" type="button"></button>
          <button class="pm-stepper-dot" data-step="3" aria-label="Paso 4" aria-selected="false" role="tab" type="button"></button>
        </div>
        <button class="pm-stepper-nav" id="pm-step-next" aria-label="Paso siguiente" type="button">›</button>
      </div>

      <div id="pm-planning-content" aria-live="polite">
        ${I(3)}
      </div>
    </div>
  `;let w=t.querySelector(`#pm-planning-content`),T=null;(function(){let e=t.querySelector(`#pm-step-slide`),n=t.querySelectorAll(`#pm-step-dots .pm-stepper-dot`),r=t.querySelector(`#pm-step-prev`),i=t.querySelector(`#pm-step-next`);if(!e)return;let a=n.length,o=0;function s(t){o=Math.max(0,Math.min(a-1,t)),e.style.transform=`translateX(-${o*100}%)`,n.forEach((e,t)=>{e.classList.toggle(`active`,t===o),e.setAttribute(`aria-selected`,String(t===o))}),r&&(r.disabled=o===0),i&&(i.disabled=o===a-1)}r?.addEventListener(`click`,()=>s(o-1)),i?.addEventListener(`click`,()=>s(o+1)),n.forEach(e=>e.addEventListener(`click`,()=>s(Number(e.dataset.step))));let c=setInterval(()=>{o<a-1?s(o+1):clearInterval(c)},5e3);t.querySelector(`#pm-guide-stepper`)?.addEventListener(`pointerdown`,()=>clearInterval(c)),s(0)})(),t.querySelector(`#btn-pm-header-disenador`)?.addEventListener(`click`,()=>{u.navigate(`planificacion-disenador`)}),t.querySelector(`#btn-pm-header-ruta`)?.addEventListener(`click`,()=>{u.navigate(`planificacion-ruta`)});async function D(e){let t=w.querySelector(`[data-clase-id="${e}"]`);if(t)try{let[n,i,a]=await Promise.all([f(e,_).catch(()=>null),p(e).catch(()=>({})),r([e]).catch(()=>[])]),{progressPercentage:o}=F(n,i,a),s=M(o),c=t.querySelector(`.pm-card-progress-bar`),l=t.querySelector(`.pm-progress-pct`);c&&(c.style.width=`${o}%`,c.style.backgroundColor=s),l&&(l.textContent=`${o}%`)}catch(e){console.warn(`[planning] No se pudo actualizar la tarjeta:`,e)}}async function O(){w.innerHTML=I(3);try{let e=await n();if(e.length===0){w.innerHTML=`
          <div class="pm-planning-empty">
            <div style="font-size:3rem; margin-bottom:1rem;">📋</div>
            <p style="font-size:1.05rem; font-weight:600; margin-bottom:0.25rem;">Sin clases asignadas</p>
            <p style="font-size:0.85rem;">Cuando ACM te asigne clases aparecerán aquí.</p>
          </div>`,d(`No tienes clases asignadas actualmente.`);return}let t=(await Promise.allSettled(e.map(async e=>{let[t,n,i]=await Promise.all([f(e.id,_).catch(()=>null),p(e.id).catch(()=>({})),r([e.id]).catch(()=>[])]),{progressPercentage:a,totalStudents:o}=F(t,n,i);return{...e,currentWeek:t?.route?.current_week||1,hasGuide:!!t,progressPercentage:a,totalStudents:o}}))).map((t,n)=>t.status===`fulfilled`?t.value:{...e[n],currentWeek:1,hasGuide:!1,progressPercentage:0,totalStudents:0});w.innerHTML=`
        <h3 class="pm-section-heading">Mis Clases <span style="font-size:0.82rem; font-weight:500; color:var(--pm-text-muted);">(${t.length})</span></h3>
        <div class="pm-planning-classes-grid">
          ${t.map((e,t)=>{let n=j(e.instrumento),r=M(e.progressPercentage),i=e.hasGuide&&e.totalStudents>0;return`
              <div class="pm-class-card-interactive" data-clase-id="${e.id}"
                   role="button" tabindex="0" aria-label="Abrir clase ${A(e.nombre)}"
                   style="animation-delay:${t*60}ms;">

                <!-- Avatar circular con ícono de instrumento -->
                <div class="pm-class-card-avatar">${n}</div>

                <!-- Cuerpo compacto -->
                <div class="pm-class-card-body">
                  <div class="pm-class-card-top">
                    <h4 class="pm-class-card-title">${A(e.nombre)}</h4>
                    <span class="pm-class-card-badge" style="${e.hasGuide?`background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.25);`:`background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2);`}">
                      ${e.hasGuide?`● ACM`:`○ Sin guía`}
                    </span>
                  </div>

                  <div class="pm-class-card-plan">${A(e.plan_estudio||`Sin plan curricular`)}</div>

                  ${i?`
                    <div class="pm-class-card-progress">
                      <div class="pm-class-card-progress-row">
                        <div class="pm-class-card-meta">
                          <span class="pm-class-card-meta-item">👥 ${e.totalStudents}</span>
                          <span class="pm-class-card-meta-item">· Sem. ${e.currentWeek}</span>
                        </div>
                        <span class="pm-progress-pct" style="color:${r};">${e.progressPercentage}%</span>
                      </div>
                      <div style="height:4px; border-radius:999px; background:var(--pm-border); overflow:hidden;">
                        <div class="pm-card-progress-bar" style="height:100%; width:${e.progressPercentage}%; background:${r}; border-radius:999px; transition:width 0.5s ease;"></div>
                      </div>
                    </div>
                  `:`
                    <div class="pm-class-card-meta" style="margin-top:0.1rem;">
                      <span class="pm-class-card-meta-item">👥 ${e.totalStudents}</span>
                      <span class="pm-class-card-meta-item" style="color:var(--pm-text-muted); font-style:italic;">
                        · ${e.hasGuide?`Sin inscritos`:`Sin guía ACM`}
                      </span>
                    </div>
                  `}
                </div>
              </div>
            `}).join(``)}
        </div>
      `,d(`${t.length} clases cargadas.`),w.querySelectorAll(`.pm-class-card-interactive`).forEach(e=>{let n=async()=>{let n=e.dataset.claseId,r=t.find(e=>String(e.id)===String(n));r&&(v=r.id,await k(),z(r))};e.addEventListener(`click`,n),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),n())})})}catch(t){console.error(`[planning] Error renderizando clases:`,t),e.error(`No se pudieron cargar las clases asignadas.`),L(w,`No se pudieron cargar tus clases.`)}}async function k(){if(v)try{let[e,t,n]=await Promise.all([f(v,_).catch(()=>null),r([v]).catch(()=>[]),p(v).catch(()=>({}))]);y=e,C=t,S=n,x=await N(e?.route?.weekly_plan_id);let i=t.map(e=>e.alumno_id).filter(Boolean);b=P(e?.plan,n,i)}catch(e){console.error(`[planning] Error al refrescar datos:`,e)}}async function N(e){return!v||!_||!e?{}:(await h(v,_,e).catch(()=>[])).reduce((e,t)=>(e[String(t.week_number)]=t,e),{})}function R(e){let t=x[String(e.week_number)]||null;return{...e,teacher_strategy:t?.teacher_strategy??e.teacher_strategy,student_activity:t?.student_activity??e.student_activity,homework:t?.homework??e.homework,evidence:t?.evidence??e.evidence,teacher_notes:t?.teacher_notes??``,hasTeacherAdjustment:!!t}}function z(t,n=`general`){T&&=(a.getInstance(T)?.dispose(),T.remove(),null);let r=y?.route,o=y?.plan?.items||[],l=r?.current_week||1,f={general:``,temas:o.length>0?o.length:``,indicadores:b.length>0?b.length:``};function p(e,t,r){let i=f[e];return`
        <button class="pm-tab-btn ${n===e?`active`:``}" data-tab="${e}" type="button">
          ${t} ${r}
          ${i?`<span class="pm-tab-count">${i}</span>`:``}
        </button>
      `}T=document.createElement(`div`),T.className=`modal fade`,T.setAttribute(`tabindex`,`-1`),T.setAttribute(`aria-hidden`,`true`),T.setAttribute(`aria-label`,`Detalle de clase: ${t.nombre}`),T.innerHTML=`
      <div class="modal-dialog modal-xxl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="background:var(--pm-surface); color:var(--pm-text); border:1px solid var(--pm-border); border-radius:20px; box-shadow:0 24px 64px rgba(0,0,0,0.15);">

          <!-- Header del modal -->
          <div class="modal-header border-0 pb-0" style="padding:1.5rem 1.5rem 0.75rem;">
            <div style="display:flex; align-items:center; gap:0.9rem; flex:1; min-width:0;">
              <div style="width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; background:rgba(59,130,246,0.1); flex-shrink:0;">
                ${j(t.instrumento)}
              </div>
              <div style="min-width:0;">
                <h4 style="margin:0; font-weight:800; font-size:1.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--pm-text);">
                  ${A(t.nombre)}
                </h4>
                <div style="font-size:0.8rem; color:var(--pm-text-muted); margin-top:0.15rem;">
                  ${A(t.plan_estudio||`Sin plan`)}
                  ${r?.current_week?` · <strong style="color:var(--pm-primary);">Semana ${r.current_week} activa</strong>`:``}
                </div>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>

          <!-- Pestañas -->
          <div style="display:flex; gap:0; padding:0 1.5rem; border-bottom:1px solid var(--pm-border); overflow-x:auto;">
            ${p(`general`,`📋`,`Perfil`)}
            ${p(`plan`,`📝`,`Mi Plan`)}
            ${p(`temas`,`📅`,`Temas y Ajustes`)}
            ${p(`indicadores`,`🎯`,`Indicadores`)}
            ${p(`ruta_svg`,`🗺️`,`Ruta SVG`)}
          </div>

          <!-- Cuerpo -->
          <div class="modal-body" style="padding:1.5rem; min-height:360px;">

            <!-- ── Pestaña: Perfil y Cobertura ── -->
            <div class="pm-tab-pane ${n===`general`?``:`d-none`}" data-pane="general">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div style="padding:1.1rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.015)); height:100%;">
                    <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.6px; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.5rem;">Perfil Curricular</div>
                    <div style="font-weight:700; font-size:1.05rem; margin-bottom:0.5rem; color:var(--pm-text);">${A(t.plan_estudio||`Sin plan asignado`)}</div>
                    <p style="font-size:0.82rem; color:var(--pm-text-muted); margin:0; line-height:1.5;">${A(t.descripcion||`Clase de formación activa dentro del plan institucional.`)}</p>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div style="padding:1.1rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.015)); height:100%;">
                    <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.6px; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.75rem;">Resumen Académico</div>
                    ${[[`Instrumento`,A(t.instrumento||`General`)],[`Alumnos inscritos`,`${t.totalStudents||0}`],[`Semanas en plan`,`${o.length}`],[`Semana activa`,`${l}`]].map(([e,t])=>`
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
                        <span style="font-size:0.82rem; color:var(--pm-text-muted);">${e}</span>
                        <span style="font-size:0.82rem; font-weight:700; color:var(--pm-text);">${t}</span>
                      </div>
                    `).join(``)}
                  </div>
                </div>
                <div class="col-12">
                  <div style="padding:1.25rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.01));">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                      <div>
                        <div style="font-weight:700; font-size:0.95rem; color:var(--pm-text);">Cobertura Curricular del Grupo</div>
                        <div style="font-size:0.78rem; color:var(--pm-text-muted);">Indicadores dominados sobre el total esperado en este ciclo.</div>
                      </div>
                      <span style="font-size:1.6rem; font-weight:800; color:${M(t.progressPercentage)}; min-width:56px; text-align:right;">${t.progressPercentage}%</span>
                    </div>
                    <div style="height:12px; border-radius:999px; background:var(--pm-border); overflow:hidden;">
                      <div style="height:100%; width:${t.progressPercentage}%; background:${M(t.progressPercentage)}; border-radius:999px; transition:width 0.6s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--pm-text-muted); margin-top:0.5rem;">
                      <span>0%</span>
                      <span style="color:${M(t.progressPercentage)}; font-weight:700;">
                        ${t.progressPercentage<30?`Inicial`:t.progressPercentage<70?`En progreso`:`Avanzado`}
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <!-- Banner de Construcción de Ruta & Vista Completa -->
                <div class="col-12 mt-2">
                  <div style="padding:1rem 1.25rem; border:1px solid rgba(59,130,246,0.3); border-radius:14px; background:rgba(59,130,246,0.06); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
                    <div>
                      <div style="font-weight:700; font-size:0.9rem; color:var(--pm-text);">Construcción de Ruta & Evaluación por Nodos</div>
                      <div style="font-size:0.78rem; color:var(--pm-text-muted);">Diseñá el itinerario semestral desde cero o explorá la ruta vectorial con nodos.</div>
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                      <button type="button" class="btn btn-sm btn-primary fw-semibold rounded-3 btn-modal-disenador" data-bs-dismiss="modal">
                        🎨 Diseñador ACM
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-primary fw-semibold rounded-3 btn-modal-ruta-full" data-bs-dismiss="modal">
                        🗺️ Vista SVG
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Pestaña: Mi Plan ── -->
            <div class="pm-tab-pane ${n===`plan`?``:`d-none`}" data-pane="plan">
              <div id="pm-plan-clase-host"></div>
            </div>

            <!-- ── Pestaña: Temas y Ajustes ── -->
            <div class="pm-tab-pane ${n===`temas`?``:`d-none`}" data-pane="temas">
              ${o.length===0?`
                <div class="pm-planning-empty">
                  <div style="font-size:2.5rem; margin-bottom:0.75rem;">📭</div>
                  <p>Esta clase no tiene semanas en el plan ACM.</p>
                </div>
              `:o.map(e=>{let t=R(e),n=e.week_number<l,r=e.week_number===l,i=n?`past`:r?`current`:`upcoming`,a=n?`Pasada`:r?`Esta semana`:`Semana ${e.week_number}`;return`
                  <div class="pm-week-item ${r?`is-current`:``}" id="pm-week-${e.week_number}">
                    <button class="pm-week-header" data-week="${e.week_number}" type="button" aria-expanded="${r}">
                      <span class="pm-week-status-dot ${i}"></span>
                      <span style="font-size:0.72rem; font-weight:600; color:var(--pm-text-muted); min-width:80px;">${a}</span>
                      <span style="font-weight:700; font-size:0.92rem; flex:1; color:var(--pm-text);">${A(e.topic)}</span>
                      ${t.hasTeacherAdjustment?`<span style="font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:6px; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2); font-weight:600;">✍ Ajustado</span>`:``}
                      <span class="pm-week-chevron ${r?`open`:``}">▾</span>
                    </button>
                    <div class="pm-week-body ${r?`open`:``}" id="pm-week-body-${e.week_number}">
                      <div style="padding:1rem;">
                        <!-- Info ACM base -->
                        <div style="padding:0.85rem; background:var(--pm-surface-2,rgba(0,0,0,0.02)); border-radius:10px; margin-bottom:1rem; border:1px dashed var(--pm-border);">
                          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:var(--pm-text-muted); letter-spacing:0.5px; margin-bottom:0.4rem;">Base ACM (solo lectura)</div>
                          <div style="font-size:0.83rem; color:var(--pm-text); margin-bottom:0.5rem;">${A(e.objective||`Sin objetivo registrado`)}</div>
                          <div class="row g-2">
                            <div class="col-12 col-sm-6">
                              <div style="font-size:0.72rem; font-weight:700; color:var(--pm-text-muted);">Estrategia base:</div>
                              <div style="font-size:0.8rem; color:var(--pm-text-muted);">${A(e.teacher_strategy||`—`)}</div>
                            </div>
                            <div class="col-12 col-sm-6">
                              <div style="font-size:0.72rem; font-weight:700; color:var(--pm-text-muted);">Evidencia base:</div>
                              <div style="font-size:0.8rem; color:var(--pm-text-muted);">${A(e.evidence||`—`)}</div>
                            </div>
                          </div>
                        </div>

                        <!-- Formulario de ajuste docente -->
                        <form class="pm-week-adjustment-form" data-week="${e.week_number}">
                          <div style="font-size:0.8rem; font-weight:700; color:var(--pm-primary); margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
                            ✏️ Ajuste Docente — Semana ${e.week_number}
                          </div>
                          <div class="row g-3">
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Estrategia ajustada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="teacher_strategy" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${A(t.teacher_strategy||``)}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Actividad del estudiante</label>
                              <textarea class="form-control form-control-sm rounded-3" name="student_activity" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${A(t.student_activity||``)}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Tarea asignada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="homework" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${A(t.homework||``)}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Evidencia ajustada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="evidence" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${A(t.evidence||``)}</textarea>
                            </div>
                            <div class="col-12">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Notas pedagógicas</label>
                              <textarea class="form-control form-control-sm rounded-3" name="teacher_notes" rows="2"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${A(t.teacher_notes||``)}</textarea>
                            </div>
                            <div class="col-12" style="display:flex; justify-content:flex-end;">
                              <button type="submit" class="btn btn-sm btn-primary px-4 rounded-3" style="font-weight:600; display:flex; align-items:center; gap:0.4rem;">
                                <span class="btn-text">Guardar ajuste</span>
                                <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                `}).join(``)}
            </div>

            <!-- ── Pestaña: Indicadores ── -->
            <div class="pm-tab-pane ${n===`indicadores`?``:`d-none`}" data-pane="indicadores">
              ${b.length===0?`
                <div class="pm-planning-empty">
                  <div style="font-size:2.5rem; margin-bottom:0.75rem;">🎯</div>
                  <p>No hay indicadores curriculares cargados para esta clase.</p>
                  <p style="font-size:0.82rem;">ACM debe asignar una guía activa antes de evaluar indicadores.</p>
                </div>
              `:`
                <div style="font-size:0.8rem; color:var(--pm-text-muted); margin-bottom:1rem; padding:0.65rem 0.85rem; background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.15); border-radius:10px;">
                  💡 Marca indicadores de forma grupal o evalúa individualmente por alumno. Los cambios se guardan de inmediato.
                </div>
                ${b.map(e=>{let t=M(e.progressPercentage);return`
                    <div class="pm-indicator-card">
                      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:0.65rem;">
                        <div style="flex:1; min-width:220px;">
                          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
                            <span style="font-size:0.7rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:6px; background:var(--pm-surface-2,rgba(0,0,0,0.05)); color:var(--pm-text-muted);">Sem. ${e.weekNumber}</span>
                            <span style="font-size:0.68rem; font-weight:600; padding:0.15rem 0.5rem; border-radius:6px; background:rgba(59,130,246,0.08); color:var(--pm-primary);">${e.meta.icon} ${e.meta.label}</span>
                          </div>
                          <h5 style="font-weight:700; font-size:0.92rem; margin:0 0 0.25rem; color:var(--pm-text);">${A(e.topic)}</h5>
                          <p style="font-size:0.78rem; color:var(--pm-text-muted); margin:0;">${A(e.objective||`Sin objetivo registrado`)}</p>
                        </div>
                        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                          <button class="btn btn-outline-success btn-sm rounded-3 btn-mark-seen-group" data-indicator-id="${e.id}"
                            style="font-size:0.78rem; font-weight:600; display:flex; align-items:center; gap:0.35rem;">
                            <span class="btn-text">🟢 Marcar Grupo</span>
                            <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                          </button>
                          <button class="btn btn-sm rounded-3 btn-toggle-individual btn-outline-secondary" data-indicator-id="${e.id}"
                            style="font-size:0.78rem; font-weight:600;">
                            👥 ${e.achievedCount}/${e.totalStudents}
                          </button>
                        </div>
                      </div>
                      <!-- Barra de progreso coloreada -->
                      <div style="margin:0.25rem 0 0.1rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.72rem; margin-bottom:0.3rem;">
                          <span style="color:var(--pm-text-muted);">Dominado por el grupo</span>
                          <span style="font-weight:700; color:${t};">${e.progressPercentage}%</span>
                        </div>
                        <div style="height:6px; border-radius:999px; background:var(--pm-border); overflow:hidden;">
                          <div class="ind-progress-bar" style="height:100%; width:${e.progressPercentage}%; background:${t}; border-radius:999px; transition:width 0.4s;"></div>
                        </div>
                      </div>
                      <!-- Panel individual colapsable -->
                      <div class="d-none mt-3 pt-3" id="individual-eval-${e.id}"
                        style="border-top:1px dashed var(--pm-border);">
                        <div style="font-size:0.78rem; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.6rem; text-transform:uppercase; letter-spacing:0.4px;">
                          Calificación por alumno
                        </div>
                        <div class="row g-2" id="alumnos-list-ind-${e.id}"></div>
                      </div>
                    </div>
                  `}).join(``)}
              `}
            </div>

            <!-- ── Pestaña: Ruta Pedagógica SVG ── -->
            <div class="pm-tab-pane ${n===`ruta_svg`?``:`d-none`}" data-pane="ruta_svg">
              <div style="padding:1rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.015));">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                  <div>
                    <h5 style="margin:0; font-weight:800; color:var(--pm-text);">Grafo Vectorial SVG - ${A(t.nombre)}</h5>
                    <div style="font-size:0.8rem; color:var(--pm-text-muted);">Tocá cualquier nodo para abrir la matriz de alumnos reales y evaluar con 1-Tap ★.</div>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary fw-semibold rounded-3 btn-modal-ruta-full" data-bs-dismiss="modal">
                    <i class="bi bi-arrows-fullscreen me-1"></i>Ver en Pantalla Completa
                  </button>
                </div>

                <div id="pm-svg-canvas-host-${t.id}" style="min-height:260px; background:var(--pm-surface); border-radius:12px; padding:1rem; border:1px solid var(--pm-border);"></div>

                <!-- Panel de Alumnos por Nodo -->
                <div id="pm-nodo-alumnos-host-${t.id}" style="display:none; margin-top:1.2rem; padding-top:1rem; border-top:1px dashed var(--pm-border);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                    <h6 style="font-weight:700; color:var(--pm-text); margin:0;" id="pm-nodo-titulo-${t.id}">Evaluación por Alumno</h6>
                    <span class="badge bg-primary-subtle text-primary border px-2 py-1">1-Tap Star Rating</span>
                  </div>
                  <div class="table-responsive" style="max-height:260px;">
                    <table class="table table-sm table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Alumno Real</th>
                          <th class="text-center">Calificación (1-5★)</th>
                        </tr>
                      </thead>
                      <tbody id="pm-nodo-alumnos-tbody-${t.id}"></tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer border-0" style="padding:1rem 1.5rem;">
            <button type="button" class="btn btn-sm px-4 rounded-3" data-bs-dismiss="modal"
              style="font-weight:600; background:var(--pm-surface-2,rgba(0,0,0,0.05)); color:var(--pm-text); border:1px solid var(--pm-border);">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(T);let h=new a(T),x=T.querySelectorAll(`.pm-tab-btn`),w=T.querySelectorAll(`.pm-tab-pane`);x.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.tab;x.forEach(e=>e.classList.toggle(`active`,e.dataset.tab===t)),w.forEach(e=>e.classList.toggle(`d-none`,e.dataset.pane!==t)),t===`plan`&&I(),t===`ruta_svg`&&P()})});let O=e=>{document.activeElement&&document.activeElement.blur(),h.hide(),setTimeout(()=>{a.getInstance(T)?.dispose(),document.querySelectorAll(`.modal-backdrop`).forEach(e=>e.remove()),document.body.classList.remove(`modal-open`),document.body.style.removeProperty(`overflow`),document.body.style.removeProperty(`padding-right`),T&&=(T.remove(),null),u.navigate(e)},150)};T.querySelectorAll(`.btn-modal-disenador`).forEach(e=>{e.addEventListener(`click`,()=>O(`planificacion-disenador`))}),T.querySelectorAll(`.btn-modal-ruta-full`).forEach(e=>{e.addEventListener(`click`,()=>O(`planificacion-ruta`))});let N=!1;async function P(){if(N)return;N=!0;let e=T.querySelector(`#pm-svg-canvas-host-${t.id}`);if(!e)return;let n=await s(t.id),r=(o||[]).map((e,t)=>({id:`w-node-${e.week_number||t+1}`,titulo:e.topic||`Clase ${e.week_number||t+1}`,estado:t===0?`logrado`:t===1?`en_proceso`:`pendiente`}));c({container:e,nodos:r.length>0?r:[{id:`nd-1`,titulo:`Postura corporal y emisión sonora libre`,estado:`logrado`},{id:`nd-2`,titulo:`Escala de Do Mayor en cuerdas Re-Sol`,estado:`en_proceso`},{id:`nd-3`,titulo:`Estudio Nº 4: Control de pulso a 80 BPM`,estado:`pendiente`}],onNodeClick:e=>{B(T,t.id,e,n)}})}n===`ruta_svg`&&P();let F=null;async function I(){if(F)return;let e=T.querySelector(`#pm-plan-clase-host`);if(!e)return;let n=null;try{let{data:e}=await i.from(`periodos`).select(`nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).maybeSingle();n=e??null}catch{n=null}F=E(e,{clase:t,periodoActivo:n,onCambio:()=>d(`Plan de clase actualizado`)})}n===`plan`&&I(),T.querySelectorAll(`.pm-week-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.week,n=T.querySelector(`#pm-week-body-${t}`),r=e.querySelector(`.pm-week-chevron`),i=n?.classList.contains(`open`);n?.classList.toggle(`open`,!i),r?.classList.toggle(`open`,!i),e.setAttribute(`aria-expanded`,String(!i))})}),T.querySelectorAll(`.pm-week-adjustment-form`).forEach(n=>{n.addEventListener(`submit`,async i=>{i.preventDefault();let a=Number(n.dataset.week),o=new FormData(n),s=n.querySelector(`button[type="submit"]`),c=s?.querySelector(`.btn-text`),l=s?.querySelector(`.spinner-border`);s&&(s.disabled=!0),l?.classList.remove(`d-none`),c&&(c.textContent=`Guardando...`);try{await g({group_id:t.id,teacher_id:_,weekly_plan_id:r?.weekly_plan_id,week_number:a,teacher_strategy:String(o.get(`teacher_strategy`)||``).trim(),student_activity:String(o.get(`student_activity`)||``).trim(),homework:String(o.get(`homework`)||``).trim(),evidence:String(o.get(`evidence`)||``).trim(),teacher_notes:String(o.get(`teacher_notes`)||``).trim()}),e.success(`Ajustes guardados — Semana ${a}.`),d(`Ajuste de la semana ${a} guardado correctamente.`),await k(),z(t,`temas`)}catch(t){console.error(`[planning] Error guardando ajuste:`,t),e.error(t.message||`No se pudieron guardar los ajustes.`)}finally{s?.isConnected&&(s.disabled=!1,l?.classList.add(`d-none`),c&&(c.textContent=`Guardar ajuste`))}})}),T.querySelectorAll(`.btn-mark-seen-group`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.dataset.indicatorId,i=n.querySelector(`.btn-text`),a=n.querySelector(`.spinner-border`);n.disabled=!0,a?.classList.remove(`d-none`),i&&(i.textContent=`Procesando...`);try{let n=C.filter(e=>String(e.clase_id)===String(t.id)).map(e=>e.alumno_id).filter(Boolean);if(n.length===0){e.warning(`Esta clase no tiene alumnos inscritos para calificar.`);return}await Promise.all(n.map(e=>m(e,r,`achieved`,`Aprobado masivamente`,``,null))),e.success(`Indicador marcado como Dominado para todo el grupo.`),d(`Indicador marcado como dominado para todos los alumnos.`),await k(),z(t,`indicadores`)}catch(t){console.error(`[planning] Error al calificar indicador grupal:`,t),e.error(`Error al actualizar el progreso del indicador.`)}finally{n?.isConnected&&(n.disabled=!1,a?.classList.add(`d-none`),i&&(i.textContent=`🟢 Marcar Grupo`))}})}),T.querySelectorAll(`.btn-toggle-individual`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.indicatorId,i=T.querySelector(`#individual-eval-${r}`),a=T.querySelector(`#alumnos-list-ind-${r}`);if(!i)return;if(!i.classList.contains(`d-none`)){i.classList.add(`d-none`),n.classList.replace(`btn-secondary`,`btn-outline-secondary`);return}if(i.classList.remove(`d-none`),n.classList.replace(`btn-outline-secondary`,`btn-secondary`),a.children.length>0)return;let o=C.filter(e=>String(e.clase_id)===String(t.id)).map(e=>e.alumnos).filter(Boolean);if(o.length===0){a.innerHTML=`<div class="col-12 text-muted" style="font-size:0.82rem;">Sin alumnos inscritos en esta clase.</div>`;return}a.innerHTML=o.map(e=>{let t=(S||{})[`${e.id}_${r}`]?.status||`not_started`;return`
            <div class="col-12 col-sm-6" style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.65rem; border-radius:10px; border:1px dashed var(--pm-border); gap:0.5rem;">
              <span style="font-size:0.82rem; font-weight:600; color:var(--pm-text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${A(e.nombre_completo)}</span>
              <select class="form-select form-select-sm select-student-indicator"
                data-student-id="${e.id}" data-indicator-id="${r}"
                style="width:148px; font-size:0.75rem; border-radius:8px; background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); flex-shrink:0;">
                <option value="not_started"          ${t===`not_started`?`selected`:``}>⚪ Sin iniciar</option>
                <option value="in_process"            ${t===`in_process`?`selected`:``}>🟡 En proceso</option>
                <option value="needs_reinforcement"   ${t===`needs_reinforcement`?`selected`:``}>🟠 Req. refuerzo</option>
                <option value="achieved"              ${t===`achieved`?`selected`:``}>🟢 Dominado</option>
                <option value="exceeded"              ${t===`exceeded`?`selected`:``}>🔵 Sobresaliente</option>
                <option value="failed"                ${t===`failed`?`selected`:``}>🔴 No logrado</option>
              </select>
            </div>
          `}).join(``),a.querySelectorAll(`.select-student-indicator`).forEach(i=>{i.addEventListener(`change`,async()=>{let a=i.dataset.studentId,o=i.value;i.disabled=!0;try{await m(a,r,o,`Calificación individual`,``,null),e.success(`Calificación guardada.`),d(`Calificación del alumno guardada.`),await k();let i=S||{},s=C.filter(e=>String(e.clase_id)===String(t.id)).map(e=>e.alumno_id).filter(Boolean),c=s.filter(e=>[`achieved`,`exceeded`].includes(i[`${e}_${r}`]?.status||`not_started`)).length,l=s.length,u=l>0?Math.round(c/l*100):0,f=M(u),p=n.closest(`.pm-indicator-card`),h=p?.querySelector(`.ind-progress-bar`),g=p?.querySelector(`.ind-progress-bar`)?.parentElement?.previousElementSibling?.querySelector(`span:last-child`);h&&(h.style.width=`${u}%`,h.style.background=f),g&&(g.textContent=`${u}%`),n.textContent=`👥 ${c}/${l}`}catch(t){console.error(`[planning] Error actualizando indicador:`,t),e.error(`No se pudo guardar la calificación.`)}finally{i.disabled=!1}})})})}),T.addEventListener(`hidden.bs.modal`,()=>{a.getInstance(T)?.dispose(),T.remove(),T=null,v&&D(v)},{once:!0}),h.show(),d(`Panel de clase ${t.nombre} abierto.`)}function B(t,n,r,i){let a=t.querySelector(`#pm-nodo-alumnos-host-${n}`),s=t.querySelector(`#pm-nodo-titulo-${n}`),c=t.querySelector(`#pm-nodo-alumnos-tbody-${n}`);if(!a||!c)return;a.style.display=`block`,s&&(s.textContent=`Evaluación Alumnos: ${r.titulo}`);let u=()=>{c.innerHTML=(i||[]).map(e=>{let t=``;for(let n=1;n<=5;n++)t+=n<=e.estrellas?`<i class="bi bi-star-fill text-warning me-1"></i>`:`<i class="bi bi-star text-secondary opacity-50 me-1"></i>`;return`
          <tr class="pm-row-alumno-node" data-id="${e.id}" style="cursor:pointer;">
            <td class="fw-bold" style="color:var(--pm-text);">${A(e.nombre)}</td>
            <td class="text-center">
              <span class="fs-6">${t}</span>
              <small style="color:var(--pm-text-muted);" class="ms-1">(${e.estrellas>0?e.estrellas+`/5★`:`Sin Registrar`})</small>
            </td>
          </tr>
        `}).join(``),c.querySelectorAll(`.pm-row-alumno-node`).forEach(t=>{t.addEventListener(`click`,()=>{let a=t.dataset.id,s=i.find(e=>String(e.id)===String(a));s&&(s.estrellas=l.siguienteEstrella(s.estrellas),o.guardarLocal({alumnoId:s.id,claseId:n,nodoId:r.id,estrellas:s.estrellas}),u(),e.show(`${s.nombre}: ${s.estrellas}★ guardados`,`info`))})})};u()}await O()}export{R as renderPlanificacionView};