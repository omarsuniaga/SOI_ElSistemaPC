import{t as e}from"./AppToast-DNGTRY9B.js";import{i as t,r as n}from"./pwaInstaller-Dg2tWEty.js";import{t as r}from"./vendor-fghBzJSA.js";import{i,l as a,m as o,o as s,r as c}from"./weeklyPlanAdapter-DIRb7zzn.js";import{t as l}from"./a11yUtils-DRYT20ux.js";var u={achieved:{label:`Dominado`,icon:`🟢`,cardClass:`estado-completado`},exceeded:{label:`Sobresaliente`,icon:`🔵`,cardClass:`estado-completado`},in_process:{label:`En proceso`,icon:`🟡`,cardClass:`estado-parcial`},needs_reinforcement:{label:`Requiere refuerzo`,icon:`🟠`,cardClass:`estado-parcial`},failed:{label:`No logrado`,icon:`🔴`,cardClass:`estado-no_iniciado`},not_started:{label:`Sin iniciar`,icon:`⚪`,cardClass:`estado-no_iniciado`}},d={violin:`🎻`,viola:`🎻`,cello:`🎻`,contrabajo:`🎻`,chelo:`🎻`,piano:`🎹`,teclado:`🎹`,guitarra:`🎸`,bajo:`🎸`,ukulele:`🎸`,flauta:`🪈`,clarinete:`🎵`,oboe:`🎵`,fagot:`🎵`,saxofon:`🎵`,trompeta:`🎺`,trombon:`🎺`,tuba:`🎺`,corno:`🎺`,corneta:`🎺`,percusion:`🥁`,bateria:`🥁`,marimba:`🥁`,xilofono:`🥁`,timbal:`🥁`,canto:`🎤`,voz:`🎤`,vocal:`🎤`,arpa:`🪗`,acordeon:`🪗`,teoria:`📖`,solfeo:`📖`,armonia:`📖`,historia:`📖`};function f(e){return u[e]||u.not_started}function p(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function m(e){if(!e)return`🎼`;let t=e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``);return Object.entries(d).find(([e])=>t.includes(e))?.[1]||`🎼`}function h(e){return e>=70?`#10b981`:e>=30?`#f59e0b`:`#ef4444`}function g(e){let t=new Set;return(e?.items||[]).filter(e=>{let n=e.indicator_id||`${e.node_id}:${e.topic}`;return t.has(n)?!1:(t.add(n),!0)})}function _(e,t,n){let r=n.length;return g(e).map(e=>{let i=n.map(n=>t[`${n}_${e.indicator_id}`]?.status||`not_started`),a=i.filter(e=>[`achieved`,`exceeded`].includes(e)).length,o=i.filter(e=>[`in_process`,`needs_reinforcement`].includes(e)).length,s=`not_started`;a>0&&a===r&&r>0?s=`achieved`:(a>0||o>0)&&(s=`in_process`);let c=f(s);return{id:e.indicator_id||e.node_id||e.id,weekNumber:e.week_number,topic:e.topic,objective:e.objective,evidence:e.evidence,assessmentMethod:e.assessment_method,teacherStrategy:e.teacher_strategy,progressPercentage:r>0?Math.round(a/r*100):0,achievedCount:a,totalStudents:r,overallStatus:s,meta:c}})}function v(e,t,n){let r=n.map(e=>e.alumno_id).filter(Boolean),i=g(e?.plan),a=i.length,o=0;if(a>0&&r.length>0){let e=0;i.forEach(n=>{r.forEach(r=>{let i=t[`${r}_${n.indicator_id}`]?.status||`not_started`;[`achieved`,`exceeded`].includes(i)&&e++})}),o=Math.round(e/(a*r.length)*100)}return{progressPercentage:o,totalStudents:r.length}}function y(e=3){return`
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
  `}function b(e,t){e.innerHTML=`<div class="pm-planning-empty"><p>${p(t)}</p></div>`}async function x(u,{maestroId:d}){let f=null,g=null,x=[],S={},C={},w=[];if(!document.getElementById(`pm-planning-styles`)){let e=document.createElement(`style`);e.id=`pm-planning-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}u.innerHTML=`
    <div class="pm-planning-container">
      <div class="pm-planning-header">
        <h1 class="pm-planning-title">📚 Planificación Académica</h1>
        <p style="margin:0; opacity:0.88; font-size:0.95rem; line-height:1.5;">
          ACM define la guía institucional. Adapta pedagógicamente la ejecución de tu grupo
          y evalúa el progreso en tiempo real.
        </p>
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
        ${y(3)}
      </div>
    </div>
  `;let T=u.querySelector(`#pm-planning-content`),E=null;(function(){let e=u.querySelector(`#pm-step-slide`),t=u.querySelectorAll(`#pm-step-dots .pm-stepper-dot`),n=u.querySelector(`#pm-step-prev`),r=u.querySelector(`#pm-step-next`);if(!e)return;let i=t.length,a=0;function o(o){a=Math.max(0,Math.min(i-1,o)),e.style.transform=`translateX(-${a*100}%)`,t.forEach((e,t)=>{e.classList.toggle(`active`,t===a),e.setAttribute(`aria-selected`,String(t===a))}),n&&(n.disabled=a===0),r&&(r.disabled=a===i-1)}n?.addEventListener(`click`,()=>o(a-1)),r?.addEventListener(`click`,()=>o(a+1)),t.forEach(e=>e.addEventListener(`click`,()=>o(Number(e.dataset.step))));let s=setInterval(()=>{a<i-1?o(a+1):clearInterval(s)},5e3);u.querySelector(`#pm-guide-stepper`)?.addEventListener(`pointerdown`,()=>clearInterval(s)),o(0)})();async function D(e){let t=T.querySelector(`[data-clase-id="${e}"]`);if(t)try{let[r,i,o]=await Promise.all([s(e,d).catch(()=>null),a(e).catch(()=>({})),n([e]).catch(()=>[])]),{progressPercentage:c}=v(r,i,o),l=h(c),u=t.querySelector(`.pm-card-progress-bar`),f=t.querySelector(`.pm-progress-pct`);u&&(u.style.width=`${c}%`,u.style.backgroundColor=l),f&&(f.textContent=`${c}%`)}catch(e){console.warn(`[planning] No se pudo actualizar la tarjeta:`,e)}}async function O(){T.innerHTML=y(3);try{let e=await t();if(e.length===0){T.innerHTML=`
          <div class="pm-planning-empty">
            <div style="font-size:3rem; margin-bottom:1rem;">📋</div>
            <p style="font-size:1.05rem; font-weight:600; margin-bottom:0.25rem;">Sin clases asignadas</p>
            <p style="font-size:0.85rem;">Cuando ACM te asigne clases aparecerán aquí.</p>
          </div>`,l(`No tienes clases asignadas actualmente.`);return}let r=(await Promise.allSettled(e.map(async e=>{let[t,r,i]=await Promise.all([s(e.id,d).catch(()=>null),a(e.id).catch(()=>({})),n([e.id]).catch(()=>[])]),{progressPercentage:o,totalStudents:c}=v(t,r,i);return{...e,currentWeek:t?.route?.current_week||1,hasGuide:!!t,progressPercentage:o,totalStudents:c}}))).map((t,n)=>t.status===`fulfilled`?t.value:{...e[n],currentWeek:1,hasGuide:!1,progressPercentage:0,totalStudents:0});T.innerHTML=`
        <h3 class="pm-section-heading">Mis Clases <span style="font-size:0.82rem; font-weight:500; color:var(--pm-text-muted);">(${r.length})</span></h3>
        <div class="pm-planning-classes-grid">
          ${r.map((e,t)=>{let n=m(e.instrumento),r=h(e.progressPercentage),i=e.hasGuide&&e.totalStudents>0;return`
              <div class="pm-class-card-interactive" data-clase-id="${e.id}"
                   role="button" tabindex="0" aria-label="Abrir clase ${p(e.nombre)}"
                   style="animation-delay:${t*60}ms;">

                <!-- Avatar circular con ícono de instrumento -->
                <div class="pm-class-card-avatar">${n}</div>

                <!-- Cuerpo compacto -->
                <div class="pm-class-card-body">
                  <div class="pm-class-card-top">
                    <h4 class="pm-class-card-title">${p(e.nombre)}</h4>
                    <span class="pm-class-card-badge" style="${e.hasGuide?`background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.25);`:`background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2);`}">
                      ${e.hasGuide?`● ACM`:`○ Sin guía`}
                    </span>
                  </div>

                  <div class="pm-class-card-plan">${p(e.plan_estudio||`Sin plan curricular`)}</div>

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
      `,l(`${r.length} clases cargadas.`),T.querySelectorAll(`.pm-class-card-interactive`).forEach(e=>{let t=async()=>{let t=e.dataset.claseId,n=r.find(e=>String(e.id)===String(t));n&&(f=n.id,await k(),M(n))};e.addEventListener(`click`,t),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),t())})})}catch(t){console.error(`[planning] Error renderizando clases:`,t),e.error(`No se pudieron cargar las clases asignadas.`),b(T,`No se pudieron cargar tus clases.`)}}async function k(){if(f)try{let[e,t,r]=await Promise.all([s(f,d).catch(()=>null),n([f]).catch(()=>[]),a(f).catch(()=>({}))]);g=e,w=t,C=r,S=await A(e?.route?.weekly_plan_id);let i=t.map(e=>e.alumno_id).filter(Boolean);x=_(e?.plan,r,i)}catch(e){console.error(`[planning] Error al refrescar datos:`,e)}}async function A(e){return!f||!d||!e?{}:(await i(f,d,e).catch(()=>[])).reduce((e,t)=>(e[String(t.week_number)]=t,e),{})}function j(e){let t=S[String(e.week_number)]||null;return{...e,teacher_strategy:t?.teacher_strategy??e.teacher_strategy,student_activity:t?.student_activity??e.student_activity,homework:t?.homework??e.homework,evidence:t?.evidence??e.evidence,teacher_notes:t?.teacher_notes??``,hasTeacherAdjustment:!!t}}function M(t,n=`general`){E&&=(r.getInstance(E)?.dispose(),E.remove(),null);let i=g?.route,a=g?.plan?.items||[],s=i?.current_week||1,u={general:``,temas:a.length>0?a.length:``,indicadores:x.length>0?x.length:``};function _(e,t,r){let i=u[e];return`
        <button class="pm-tab-btn ${n===e?`active`:``}" data-tab="${e}" type="button">
          ${t} ${r}
          ${i?`<span class="pm-tab-count">${i}</span>`:``}
        </button>
      `}E=document.createElement(`div`),E.className=`modal fade`,E.setAttribute(`tabindex`,`-1`),E.setAttribute(`aria-hidden`,`true`),E.setAttribute(`aria-label`,`Detalle de clase: ${t.nombre}`),E.innerHTML=`
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="background:var(--pm-surface); color:var(--pm-text); border:1px solid var(--pm-border); border-radius:20px; box-shadow:0 24px 64px rgba(0,0,0,0.15);">

          <!-- Header del modal -->
          <div class="modal-header border-0 pb-0" style="padding:1.5rem 1.5rem 0.75rem;">
            <div style="display:flex; align-items:center; gap:0.9rem; flex:1; min-width:0;">
              <div style="width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; background:rgba(59,130,246,0.1); flex-shrink:0;">
                ${m(t.instrumento)}
              </div>
              <div style="min-width:0;">
                <h4 style="margin:0; font-weight:800; font-size:1.15rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--pm-text);">
                  ${p(t.nombre)}
                </h4>
                <div style="font-size:0.8rem; color:var(--pm-text-muted); margin-top:0.15rem;">
                  ${p(t.plan_estudio||`Sin plan`)}
                  ${i?.current_week?` · <strong style="color:var(--pm-primary);">Semana ${i.current_week} activa</strong>`:``}
                </div>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>

          <!-- Pestañas -->
          <div style="display:flex; gap:0; padding:0 1.5rem; border-bottom:1px solid var(--pm-border); overflow-x:auto;">
            ${_(`general`,`📋`,`Perfil`)}
            ${_(`temas`,`📅`,`Temas y Ajustes`)}
            ${_(`indicadores`,`🎯`,`Indicadores`)}
          </div>

          <!-- Cuerpo -->
          <div class="modal-body" style="padding:1.5rem; min-height:360px;">

            <!-- ── Pestaña: Perfil y Cobertura ── -->
            <div class="pm-tab-pane ${n===`general`?``:`d-none`}" data-pane="general">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div style="padding:1.1rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.015)); height:100%;">
                    <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.6px; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.5rem;">Perfil Curricular</div>
                    <div style="font-weight:700; font-size:1.05rem; margin-bottom:0.5rem; color:var(--pm-text);">${p(t.plan_estudio||`Sin plan asignado`)}</div>
                    <p style="font-size:0.82rem; color:var(--pm-text-muted); margin:0; line-height:1.5;">${p(t.descripcion||`Clase de formación activa dentro del plan institucional.`)}</p>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div style="padding:1.1rem; border:1px solid var(--pm-border); border-radius:14px; background:var(--pm-surface-2,rgba(0,0,0,0.015)); height:100%;">
                    <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.6px; font-weight:700; color:var(--pm-text-muted); margin-bottom:0.75rem;">Resumen Académico</div>
                    ${[[`Instrumento`,p(t.instrumento||`General`)],[`Alumnos inscritos`,`${t.totalStudents||0}`],[`Semanas en plan`,`${a.length}`],[`Semana activa`,`${s}`]].map(([e,t])=>`
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
                      <span style="font-size:1.6rem; font-weight:800; color:${h(t.progressPercentage)}; min-width:56px; text-align:right;">${t.progressPercentage}%</span>
                    </div>
                    <div style="height:12px; border-radius:999px; background:var(--pm-border); overflow:hidden;">
                      <div style="height:100%; width:${t.progressPercentage}%; background:${h(t.progressPercentage)}; border-radius:999px; transition:width 0.6s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--pm-text-muted); margin-top:0.5rem;">
                      <span>0%</span>
                      <span style="color:${h(t.progressPercentage)}; font-weight:700;">
                        ${t.progressPercentage<30?`Inicial`:t.progressPercentage<70?`En progreso`:`Avanzado`}
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Pestaña: Temas y Ajustes ── -->
            <div class="pm-tab-pane ${n===`temas`?``:`d-none`}" data-pane="temas">
              ${a.length===0?`
                <div class="pm-planning-empty">
                  <div style="font-size:2.5rem; margin-bottom:0.75rem;">📭</div>
                  <p>Esta clase no tiene semanas en el plan ACM.</p>
                </div>
              `:a.map(e=>{let t=j(e),n=e.week_number<s,r=e.week_number===s,i=n?`past`:r?`current`:`upcoming`,a=n?`Pasada`:r?`Esta semana`:`Semana ${e.week_number}`;return`
                  <div class="pm-week-item ${r?`is-current`:``}" id="pm-week-${e.week_number}">
                    <button class="pm-week-header" data-week="${e.week_number}" type="button" aria-expanded="${r}">
                      <span class="pm-week-status-dot ${i}"></span>
                      <span style="font-size:0.72rem; font-weight:600; color:var(--pm-text-muted); min-width:80px;">${a}</span>
                      <span style="font-weight:700; font-size:0.92rem; flex:1; color:var(--pm-text);">${p(e.topic)}</span>
                      ${t.hasTeacherAdjustment?`<span style="font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:6px; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2); font-weight:600;">✍ Ajustado</span>`:``}
                      <span class="pm-week-chevron ${r?`open`:``}">▾</span>
                    </button>
                    <div class="pm-week-body ${r?`open`:``}" id="pm-week-body-${e.week_number}">
                      <div style="padding:1rem;">
                        <!-- Info ACM base -->
                        <div style="padding:0.85rem; background:var(--pm-surface-2,rgba(0,0,0,0.02)); border-radius:10px; margin-bottom:1rem; border:1px dashed var(--pm-border);">
                          <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:var(--pm-text-muted); letter-spacing:0.5px; margin-bottom:0.4rem;">Base ACM (solo lectura)</div>
                          <div style="font-size:0.83rem; color:var(--pm-text); margin-bottom:0.5rem;">${p(e.objective||`Sin objetivo registrado`)}</div>
                          <div class="row g-2">
                            <div class="col-12 col-sm-6">
                              <div style="font-size:0.72rem; font-weight:700; color:var(--pm-text-muted);">Estrategia base:</div>
                              <div style="font-size:0.8rem; color:var(--pm-text-muted);">${p(e.teacher_strategy||`—`)}</div>
                            </div>
                            <div class="col-12 col-sm-6">
                              <div style="font-size:0.72rem; font-weight:700; color:var(--pm-text-muted);">Evidencia base:</div>
                              <div style="font-size:0.8rem; color:var(--pm-text-muted);">${p(e.evidence||`—`)}</div>
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
                              >${p(t.teacher_strategy||``)}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Actividad del estudiante</label>
                              <textarea class="form-control form-control-sm rounded-3" name="student_activity" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${p(t.student_activity||``)}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Tarea asignada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="homework" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${p(t.homework||``)}</textarea>
                            </div>
                            <div class="col-12 col-md-6">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Evidencia ajustada</label>
                              <textarea class="form-control form-control-sm rounded-3" name="evidence" rows="3"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${p(t.evidence||``)}</textarea>
                            </div>
                            <div class="col-12">
                              <label class="form-label" style="font-size:0.8rem; font-weight:600; color:var(--pm-text);">Notas pedagógicas</label>
                              <textarea class="form-control form-control-sm rounded-3" name="teacher_notes" rows="2"
                                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                              >${p(t.teacher_notes||``)}</textarea>
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
              ${x.length===0?`
                <div class="pm-planning-empty">
                  <div style="font-size:2.5rem; margin-bottom:0.75rem;">🎯</div>
                  <p>No hay indicadores curriculares cargados para esta clase.</p>
                  <p style="font-size:0.82rem;">ACM debe asignar una guía activa antes de evaluar indicadores.</p>
                </div>
              `:`
                <div style="font-size:0.8rem; color:var(--pm-text-muted); margin-bottom:1rem; padding:0.65rem 0.85rem; background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.15); border-radius:10px;">
                  💡 Marca indicadores de forma grupal o evalúa individualmente por alumno. Los cambios se guardan de inmediato.
                </div>
                ${x.map(e=>{let t=h(e.progressPercentage);return`
                    <div class="pm-indicator-card">
                      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:0.65rem;">
                        <div style="flex:1; min-width:220px;">
                          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
                            <span style="font-size:0.7rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:6px; background:var(--pm-surface-2,rgba(0,0,0,0.05)); color:var(--pm-text-muted);">Sem. ${e.weekNumber}</span>
                            <span style="font-size:0.68rem; font-weight:600; padding:0.15rem 0.5rem; border-radius:6px; background:rgba(59,130,246,0.08); color:var(--pm-primary);">${e.meta.icon} ${e.meta.label}</span>
                          </div>
                          <h5 style="font-weight:700; font-size:0.92rem; margin:0 0 0.25rem; color:var(--pm-text);">${p(e.topic)}</h5>
                          <p style="font-size:0.78rem; color:var(--pm-text-muted); margin:0;">${p(e.objective||`Sin objetivo registrado`)}</p>
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
    `,document.body.appendChild(E);let v=new r(E),y=E.querySelectorAll(`.pm-tab-btn`),b=E.querySelectorAll(`.pm-tab-pane`);y.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.tab;y.forEach(e=>e.classList.toggle(`active`,e.dataset.tab===t)),b.forEach(e=>e.classList.toggle(`d-none`,e.dataset.pane!==t))})}),E.querySelectorAll(`.pm-week-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.week,n=E.querySelector(`#pm-week-body-${t}`),r=e.querySelector(`.pm-week-chevron`),i=n?.classList.contains(`open`);n?.classList.toggle(`open`,!i),r?.classList.toggle(`open`,!i),e.setAttribute(`aria-expanded`,String(!i))})}),E.querySelectorAll(`.pm-week-adjustment-form`).forEach(n=>{n.addEventListener(`submit`,async r=>{r.preventDefault();let a=Number(n.dataset.week),o=new FormData(n),s=n.querySelector(`button[type="submit"]`),u=s?.querySelector(`.btn-text`),f=s?.querySelector(`.spinner-border`);s&&(s.disabled=!0),f?.classList.remove(`d-none`),u&&(u.textContent=`Guardando...`);try{await c({group_id:t.id,teacher_id:d,weekly_plan_id:i?.weekly_plan_id,week_number:a,teacher_strategy:String(o.get(`teacher_strategy`)||``).trim(),student_activity:String(o.get(`student_activity`)||``).trim(),homework:String(o.get(`homework`)||``).trim(),evidence:String(o.get(`evidence`)||``).trim(),teacher_notes:String(o.get(`teacher_notes`)||``).trim()}),e.success(`Ajustes guardados — Semana ${a}.`),l(`Ajuste de la semana ${a} guardado correctamente.`),await k(),M(t,`temas`)}catch(t){console.error(`[planning] Error guardando ajuste:`,t),e.error(t.message||`No se pudieron guardar los ajustes.`)}finally{s?.isConnected&&(s.disabled=!1,f?.classList.add(`d-none`),u&&(u.textContent=`Guardar ajuste`))}})}),E.querySelectorAll(`.btn-mark-seen-group`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.dataset.indicatorId,i=n.querySelector(`.btn-text`),a=n.querySelector(`.spinner-border`);n.disabled=!0,a?.classList.remove(`d-none`),i&&(i.textContent=`Procesando...`);try{let n=w.filter(e=>String(e.clase_id)===String(t.id)).map(e=>e.alumno_id).filter(Boolean);if(n.length===0){e.warning(`Esta clase no tiene alumnos inscritos para calificar.`);return}await Promise.all(n.map(e=>o(e,r,`achieved`,`Aprobado masivamente`,``,null))),e.success(`Indicador marcado como Dominado para todo el grupo.`),l(`Indicador marcado como dominado para todos los alumnos.`),await k(),M(t,`indicadores`)}catch(t){console.error(`[planning] Error al calificar indicador grupal:`,t),e.error(`Error al actualizar el progreso del indicador.`)}finally{n?.isConnected&&(n.disabled=!1,a?.classList.add(`d-none`),i&&(i.textContent=`🟢 Marcar Grupo`))}})}),E.querySelectorAll(`.btn-toggle-individual`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.indicatorId,i=E.querySelector(`#individual-eval-${r}`),a=E.querySelector(`#alumnos-list-ind-${r}`);if(!i)return;if(!i.classList.contains(`d-none`)){i.classList.add(`d-none`),n.classList.replace(`btn-secondary`,`btn-outline-secondary`);return}if(i.classList.remove(`d-none`),n.classList.replace(`btn-outline-secondary`,`btn-secondary`),a.children.length>0)return;let s=w.filter(e=>String(e.clase_id)===String(t.id)).map(e=>e.alumnos).filter(Boolean);if(s.length===0){a.innerHTML=`<div class="col-12 text-muted" style="font-size:0.82rem;">Sin alumnos inscritos en esta clase.</div>`;return}a.innerHTML=s.map(e=>{let t=(C||{})[`${e.id}_${r}`]?.status||`not_started`;return`
            <div class="col-12 col-sm-6" style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.65rem; border-radius:10px; border:1px dashed var(--pm-border); gap:0.5rem;">
              <span style="font-size:0.82rem; font-weight:600; color:var(--pm-text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p(e.nombre_completo)}</span>
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
          `}).join(``),a.querySelectorAll(`.select-student-indicator`).forEach(i=>{i.addEventListener(`change`,async()=>{let a=i.dataset.studentId,s=i.value;i.disabled=!0;try{await o(a,r,s,`Calificación individual`,``,null),e.success(`Calificación guardada.`),l(`Calificación del alumno guardada.`),await k();let i=C||{},c=w.filter(e=>String(e.clase_id)===String(t.id)).map(e=>e.alumno_id).filter(Boolean),u=c.filter(e=>[`achieved`,`exceeded`].includes(i[`${e}_${r}`]?.status||`not_started`)).length,d=c.length,f=d>0?Math.round(u/d*100):0,p=h(f),m=n.closest(`.pm-indicator-card`),g=m?.querySelector(`.ind-progress-bar`),_=m?.querySelector(`.ind-progress-bar`)?.parentElement?.previousElementSibling?.querySelector(`span:last-child`);g&&(g.style.width=`${f}%`,g.style.background=p),_&&(_.textContent=`${f}%`),n.textContent=`👥 ${u}/${d}`}catch(t){console.error(`[planning] Error actualizando indicador:`,t),e.error(`No se pudo guardar la calificación.`)}finally{i.disabled=!1}})})})}),E.addEventListener(`hidden.bs.modal`,()=>{r.getInstance(E)?.dispose(),E.remove(),E=null,f&&D(f)},{once:!0}),v.show(),l(`Panel de clase ${t.nombre} abierto.`)}await O()}export{x as renderPlanificacionView};