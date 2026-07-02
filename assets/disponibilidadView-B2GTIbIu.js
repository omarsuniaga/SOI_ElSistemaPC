import{t as e}from"./AppToast-DNGTRY9B.js";import{a as t,i as n,r,t as i}from"./disponibilidadApi-B58xp3Uh.js";import{t as a}from"./a11yUtils-DRYT20ux.js";var o=[{key:`lunes`,label:`Lunes`,short:`L`},{key:`martes`,label:`Martes`,short:`M`},{key:`miércoles`,label:`Miércoles`,short:`X`},{key:`jueves`,label:`Jueves`,short:`J`},{key:`viernes`,label:`Viernes`,short:`V`},{key:`sábado`,label:`Sábado`,short:`S`}],s=360,c=1320,l=c-s;function u(){if(document.getElementById(`pm-disponibilidad-styles`))return;let e=document.createElement(`style`);e.id=`pm-disponibilidad-styles`,e.textContent=`
    /* ── Layout ── */
    .pm-disp-container { padding: 1.5rem; max-width: 860px; margin: 0 auto; }

    /* ── Header ── */
    .pm-disp-header {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white; padding: 1.75rem 2rem; border-radius: 20px;
      margin-bottom: 1.5rem; position: relative; overflow: hidden;
    }
    .pm-disp-header::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.09) 0%, transparent 55%);
      pointer-events: none;
    }
    .pm-disp-header-row {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
    }
    .pm-disp-title { font-size: 1.6rem; font-weight: 800; margin: 0 0 0.3rem; letter-spacing: -0.02em; }
    .pm-disp-subtitle { font-size: 0.88rem; opacity: 0.88; margin: 0; line-height: 1.5; }
    .pm-disp-save-btn {
      background: rgba(255,255,255,0.18); color: white; border: 1px solid rgba(255,255,255,0.35);
      border-radius: 10px; padding: 0.55rem 1.15rem; font-size: 0.85rem; font-weight: 700;
      cursor: pointer; white-space: nowrap; transition: background 0.15s, transform 0.15s;
      display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
    }
    .pm-disp-save-btn:hover:not(:disabled) { background: rgba(255,255,255,0.28); transform: translateY(-1px); }
    .pm-disp-save-btn:disabled { opacity: 0.5; cursor: default; }
    .pm-disp-dirty-badge {
      font-size: 0.68rem; background: #f59e0b; color: #000; border-radius: 999px;
      padding: 0.1rem 0.45rem; font-weight: 700; display: none;
    }
    .pm-disp-dirty-badge.visible { display: inline; }

    /* ── Weekly summary ── */
    .pm-disp-summary {
      background: var(--pm-surface); border: 1px solid var(--pm-border);
      border-radius: 16px; padding: 1.1rem 1.25rem; margin-bottom: 1.25rem;
    }
    .pm-disp-summary-title {
      font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px;
      font-weight: 700; color: var(--pm-text-muted); margin-bottom: 0.85rem;
    }
    .pm-disp-week-grid {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem;
    }
    .pm-disp-day-col { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
    .pm-disp-day-label {
      font-size: 0.72rem; font-weight: 700; color: var(--pm-text-muted);
    }
    .pm-disp-day-track {
      width: 100%; height: 56px; border-radius: 8px; position: relative;
      background: var(--pm-border); overflow: hidden;
    }
    .pm-disp-day-bar {
      position: absolute; left: 0; right: 0; border-radius: 4px;
      background: linear-gradient(180deg, #7c3aed, #4f46e5);
      opacity: 0.85; transition: height 0.3s, top 0.3s;
    }
    .pm-disp-day-hours {
      font-size: 0.68rem; color: var(--pm-text-muted); font-weight: 600;
    }

    /* ── Días acordeón ── */
    .pm-disp-days { display: flex; flex-direction: column; gap: 0.65rem; }
    .pm-disp-day-panel {
      background: var(--pm-surface); border: 1px solid var(--pm-border);
      border-radius: 14px; overflow: hidden; transition: box-shadow 0.2s;
    }
    .pm-disp-day-panel.has-slots { border-color: rgba(124,58,237,0.35); }
    .pm-disp-day-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.8rem 1rem; cursor: pointer; user-select: none; gap: 0.75rem;
      background: transparent; border: none; width: 100%; text-align: left; outline: none;
    }
    .pm-disp-day-panel-header:hover { background: var(--pm-surface-2, rgba(0,0,0,0.015)); }
    .pm-disp-day-name {
      font-size: 0.92rem; font-weight: 700; color: var(--pm-text);
    }
    .pm-disp-day-info {
      font-size: 0.75rem; color: var(--pm-text-muted); flex: 1;
    }
    .pm-disp-day-chevron {
      font-size: 0.8rem; color: var(--pm-text-muted);
      transition: transform 0.2s ease;
    }
    .pm-disp-day-chevron.open { transform: rotate(180deg); }
    .pm-disp-day-body {
      display: none; border-top: 1px solid var(--pm-border);
      padding: 0.85rem 1rem; animation: pm-disp-slide-in 0.18s ease;
    }
    .pm-disp-day-body.open { display: block; }
    @keyframes pm-disp-slide-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Franjas ── */
    .pm-disp-slots { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.75rem; }
    .pm-disp-slot {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.5rem 0.75rem; border-radius: 10px;
      background: rgba(124,58,237,0.05); border: 1px solid rgba(124,58,237,0.15);
      animation: pm-disp-slot-in 0.18s ease;
    }
    @keyframes pm-disp-slot-in {
      from { opacity: 0; transform: scale(0.97); }
      to   { opacity: 1; transform: scale(1); }
    }
    .pm-disp-slot-icon { font-size: 0.9rem; flex-shrink: 0; color: #7c3aed; }
    .pm-disp-slot-time {
      font-size: 0.88rem; font-weight: 700; color: var(--pm-text); flex: 1;
      font-variant-numeric: tabular-nums;
    }
    .pm-disp-slot-duration {
      font-size: 0.72rem; color: var(--pm-text-muted);
    }
    .pm-disp-slot-del {
      background: transparent; border: none; cursor: pointer; padding: 0.2rem 0.35rem;
      border-radius: 6px; color: var(--pm-text-muted); font-size: 0.95rem; line-height: 1;
      transition: background 0.15s, color 0.15s;
    }
    .pm-disp-slot-del:hover { background: rgba(239,68,68,0.08); color: #ef4444; }
    .pm-disp-empty-slots {
      font-size: 0.8rem; color: var(--pm-text-muted); padding: 0.35rem 0;
      font-style: italic;
    }

    /* ── Formulario de nueva franja ── */
    .pm-disp-add-form {
      display: none; gap: 0.6rem; align-items: flex-end; flex-wrap: wrap;
      padding: 0.75rem; background: var(--pm-surface-2, rgba(0,0,0,0.02));
      border-radius: 10px; border: 1px dashed var(--pm-border);
      margin-top: 0.5rem;
    }
    .pm-disp-add-form.open { display: flex; }
    .pm-disp-add-form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .pm-disp-add-form label { font-size: 0.72rem; font-weight: 600; color: var(--pm-text-muted); }
    .pm-disp-add-form input[type="time"] {
      padding: 0.4rem 0.6rem; border: 1px solid var(--pm-border);
      border-radius: 8px; font-size: 0.85rem; font-weight: 600;
      background: var(--pm-surface); color: var(--pm-text);
      font-variant-numeric: tabular-nums; outline: none;
      transition: border-color 0.15s;
    }
    .pm-disp-add-form input[type="time"]:focus { border-color: #7c3aed; }
    .pm-disp-add-confirm {
      background: #7c3aed; color: white; border: none; border-radius: 8px;
      padding: 0.42rem 0.85rem; font-size: 0.82rem; font-weight: 700;
      cursor: pointer; transition: background 0.15s, transform 0.15s;
    }
    .pm-disp-add-confirm:hover { background: #6d28d9; transform: translateY(-1px); }
    .pm-disp-add-cancel {
      background: transparent; color: var(--pm-text-muted); border: none;
      padding: 0.42rem 0.65rem; font-size: 0.82rem; cursor: pointer;
      border-radius: 8px; transition: background 0.15s;
    }
    .pm-disp-add-cancel:hover { background: var(--pm-border); }
    .pm-disp-add-error {
      font-size: 0.75rem; color: #ef4444; width: 100%;
      display: none; align-items: center; gap: 0.3rem;
    }
    .pm-disp-add-error.visible { display: flex; }
    .pm-disp-add-toggle {
      background: transparent; border: 1px dashed var(--pm-border);
      border-radius: 8px; padding: 0.38rem 0.75rem; font-size: 0.78rem;
      font-weight: 600; color: var(--pm-text-muted); cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      display: flex; align-items: center; gap: 0.3rem;
    }
    .pm-disp-add-toggle:hover { border-color: #7c3aed; color: #7c3aed; }

    /* ── Responsivo ── */
    @media (max-width: 640px) {
      .pm-disp-container { padding: 0.75rem; }
      .pm-disp-header { padding: 1.1rem 1.1rem; border-radius: 14px; }
      .pm-disp-title { font-size: 1.25rem; }
      .pm-disp-week-grid { grid-template-columns: repeat(6, 1fr); }
    }
  `,document.head.appendChild(e)}function d(e,t){let n=r(t)-r(e),i=Math.floor(n/60),a=n%60;return i>0?a>0?`${i}h ${a}min`:`${i}h`:`${a}min`}function f(e){return e.reduce((e,t)=>e+(r(t.fin)-r(t.inicio)),0)/60}async function p(p,{maestroId:m}){u();let h={},g=!1;p.innerHTML=`
    <div class="pm-disp-container">

      <!-- Header -->
      <div class="pm-disp-header">
        <div class="pm-disp-header-row">
          <div>
            <h1 class="pm-disp-title">🗓️ Disponibilidad Horaria</h1>
            <p class="pm-disp-subtitle">
              Registra tus bloques de tiempo disponibles. El sistema usará esta información
              para generar un horario optimizado según tus clases.
            </p>
          </div>
          <button class="pm-disp-save-btn" id="pm-disp-save" type="button" disabled>
            <span id="pm-disp-save-text">Guardar</span>
            <span class="spinner-border spinner-border-sm d-none" id="pm-disp-save-spinner" role="status" aria-hidden="true"></span>
            <span class="pm-disp-dirty-badge" id="pm-disp-dirty-badge">●</span>
          </button>
        </div>
      </div>

      <!-- Resumen visual semanal -->
      <div class="pm-disp-summary" id="pm-disp-summary" aria-label="Resumen visual de disponibilidad semanal">
        <div class="pm-disp-summary-title">Resumen de la semana</div>
        <div class="pm-disp-week-grid" id="pm-disp-week-grid">
          ${o.map(e=>`
            <div class="pm-disp-day-col" id="pm-summary-col-${e.key}">
              <div class="pm-disp-day-label">${e.short}</div>
              <div class="pm-disp-day-track" title="${e.label}">
                <!-- barras renderizadas por JS -->
              </div>
              <div class="pm-disp-day-hours" id="pm-summary-hrs-${e.key}">0h</div>
            </div>
          `).join(``)}
        </div>
      </div>

      <!-- Paneles por día -->
      <div class="pm-disp-days" id="pm-disp-days">
        ${o.map(e=>`
          <div class="pm-disp-day-panel" id="pm-day-panel-${e.key}">
            <button class="pm-disp-day-panel-header" data-day="${e.key}" type="button"
              aria-expanded="false" aria-controls="pm-day-body-${e.key}">
              <span class="pm-disp-day-name">${e.label}</span>
              <span class="pm-disp-day-info" id="pm-day-info-${e.key}">Sin franjas registradas</span>
              <span class="pm-disp-day-chevron" id="pm-day-chevron-${e.key}">▾</span>
            </button>
            <div class="pm-disp-day-body" id="pm-day-body-${e.key}" role="region" aria-label="Franjas de ${e.label}">
              <div class="pm-disp-slots" id="pm-slots-${e.key}">
                <div class="pm-disp-empty-slots">Sin franjas registradas para este día.</div>
              </div>
              <button class="pm-disp-add-toggle" id="pm-add-toggle-${e.key}" data-day="${e.key}" type="button">
                + Agregar franja
              </button>
              <div class="pm-disp-add-form" id="pm-add-form-${e.key}" data-day="${e.key}">
                <div class="pm-disp-add-form-group">
                  <label for="pm-input-inicio-${e.key}">Inicio</label>
                  <input type="time" id="pm-input-inicio-${e.key}" value="08:00" min="06:00" max="21:00">
                </div>
                <div class="pm-disp-add-form-group">
                  <label for="pm-input-fin-${e.key}">Fin</label>
                  <input type="time" id="pm-input-fin-${e.key}" value="10:00" min="07:00" max="22:00">
                </div>
                <button class="pm-disp-add-confirm" data-day="${e.key}" type="button">Añadir</button>
                <button class="pm-disp-add-cancel" data-day="${e.key}" type="button">Cancelar</button>
                <div class="pm-disp-add-error" id="pm-add-error-${e.key}" role="alert">
                  <span>⚠</span><span id="pm-add-error-msg-${e.key}"></span>
                </div>
              </div>
            </div>
          </div>
        `).join(``)}
      </div>

    </div>
  `;let _=p.querySelector(`#pm-disp-save`),v=p.querySelector(`#pm-disp-save-text`),y=p.querySelector(`#pm-disp-save-spinner`),b=p.querySelector(`#pm-disp-dirty-badge`);function x(e=!0){g=e,_.disabled=!e,b.classList.toggle(`visible`,e)}function S(){o.forEach(({key:e})=>{let t=h[e]||[],n=p.querySelector(`#pm-summary-col-${e} .pm-disp-day-track`),i=p.querySelector(`#pm-summary-hrs-${e}`);if(!n)return;n.innerHTML=``;let a=f(t);i.textContent=a>0?`${a%1==0?a:a.toFixed(1)}h`:`0h`,t.forEach(e=>{let t=Math.max(r(e.inicio),s),i=Math.min(r(e.fin),c);if(i<=t)return;let a=(t-s)/l*100,o=(i-t)/l*100,u=document.createElement(`div`);u.className=`pm-disp-day-bar`,u.style.top=`${a}%`,u.style.height=`${o}%`,n.appendChild(u)})})}function C(e){let t=h[e]||[],n=p.querySelector(`#pm-slots-${e}`),i=p.querySelector(`#pm-day-panel-${e}`),o=p.querySelector(`#pm-day-info-${e}`);if(!n)return;i.classList.toggle(`has-slots`,t.length>0);let s=[...t].sort((e,t)=>r(e.inicio)-r(t.inicio));if(o.textContent=t.length>0?`${t.length} franja${t.length>1?`s`:``} · ${f(t).toFixed(1)}h disponible`:`Sin franjas registradas`,s.length===0){n.innerHTML=`<div class="pm-disp-empty-slots">Sin franjas registradas para este día.</div>`;return}n.innerHTML=s.map((t,n)=>`
      <div class="pm-disp-slot" data-day="${e}" data-idx="${n}">
        <span class="pm-disp-slot-icon">⏱</span>
        <span class="pm-disp-slot-time">${t.inicio} — ${t.fin}</span>
        <span class="pm-disp-slot-duration">${d(t.inicio,t.fin)}</span>
        <button class="pm-disp-slot-del" data-day="${e}" data-inicio="${t.inicio}" data-fin="${t.fin}"
          type="button" title="Eliminar franja" aria-label="Eliminar franja ${t.inicio}–${t.fin}">×</button>
      </div>
    `).join(``),n.querySelectorAll(`.pm-disp-slot-del`).forEach(e=>{e.addEventListener(`click`,()=>{let{day:t,inicio:n,fin:r}=e.dataset;h[t]=(h[t]||[]).filter(e=>!(e.inicio===n&&e.fin===r)),h[t].length===0&&delete h[t],C(t),S(),x(),a(`Franja ${n}–${r} eliminada.`)})}),S()}p.querySelectorAll(`.pm-disp-day-panel-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.day,n=p.querySelector(`#pm-day-body-${t}`),r=p.querySelector(`#pm-day-chevron-${t}`),i=n.classList.contains(`open`);n.classList.toggle(`open`,!i),r.classList.toggle(`open`,!i),e.setAttribute(`aria-expanded`,String(!i))})}),p.querySelectorAll(`.pm-disp-add-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.day,n=p.querySelector(`#pm-add-form-${t}`),r=n.classList.contains(`open`);n.classList.toggle(`open`,!r),e.textContent=r?`+ Agregar franja`:`− Cancelar`,r||(p.querySelector(`#pm-input-inicio-${t}`)?.focus(),T(t))})}),p.querySelectorAll(`.pm-disp-add-cancel`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.day,n=p.querySelector(`#pm-add-form-${t}`),r=p.querySelector(`#pm-add-toggle-${t}`);n.classList.remove(`open`),r.textContent=`+ Agregar franja`,T(t)})});function w(e,t){let n=p.querySelector(`#pm-add-error-${e}`),r=p.querySelector(`#pm-add-error-msg-${e}`);n&&r&&(r.textContent=t,n.classList.add(`visible`))}function T(e){p.querySelector(`#pm-add-error-${e}`)?.classList.remove(`visible`)}p.querySelectorAll(`.pm-disp-add-confirm`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.day,n=p.querySelector(`#pm-input-inicio-${t}`)?.value,i=p.querySelector(`#pm-input-fin-${t}`)?.value;if(T(t),!n||!i){w(t,`Ingresa hora de inicio y fin.`);return}if(r(n)>=r(i)){w(t,`La hora de inicio (${n}) debe ser anterior al fin (${i}).`);return}let o={inicio:n,fin:i},s=h[t]||[],c=s.find(e=>{let t=r(e.inicio),a=r(e.fin),o=r(n);return t<r(i)&&o<a});if(c){w(t,`Se solapa con la franja existente ${c.inicio}–${c.fin}.`);return}h[t]=[...s,o],C(t),x(),a(`Franja ${n}–${i} agregada a ${t}.`);let l=p.querySelector(`#pm-add-form-${t}`),u=p.querySelector(`#pm-add-toggle-${t}`);l.classList.remove(`open`),u.textContent=`+ Agregar franja`})}),o.forEach(({key:e})=>{let t=p.querySelector(`#pm-input-inicio-${e}`),n=p.querySelector(`#pm-input-fin-${e}`),r=p.querySelector(`.pm-disp-add-confirm[data-day="${e}"]`);[t,n].forEach(e=>{e?.addEventListener(`keydown`,e=>{e.key===`Enter`&&r?.click()})})}),_.addEventListener(`click`,async()=>{let r=t(h);if(!r.valid){e.error(`Errores de validación:\n${r.errors.join(`
`)}`);return}_.disabled=!0,y.classList.remove(`d-none`),v.textContent=`Guardando...`;try{let t=await n(m,h);if(!t.success){e.error(t.errors?.join(`, `)||`No se pudo guardar.`);return}e.success(`Disponibilidad guardada correctamente.`),a(`Disponibilidad guardada.`),x(!1)}catch(t){console.error(`[disponibilidad] Error guardando:`,t),e.error(`Error al conectar con el servidor.`)}finally{_.isConnected&&(_.disabled=!g,y.classList.add(`d-none`),v.textContent=`Guardar`)}});try{p.querySelector(`#pm-disp-days`).style.opacity=`0.5`,h=await i(m),o.forEach(({key:e})=>C(e)),S();let e=[`domingo`,`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`][new Date().getDay()];if(o.find(t=>t.key===e)){let t=p.querySelector(`#pm-day-body-${e}`),n=p.querySelector(`#pm-day-chevron-${e}`),r=p.querySelector(`[data-day="${e}"].pm-disp-day-panel-header`);t?.classList.add(`open`),n?.classList.add(`open`),r?.setAttribute(`aria-expanded`,`true`)}a(`Disponibilidad horaria cargada.`)}catch(t){console.error(`[disponibilidad] Error cargando:`,t),e.error(`No se pudo cargar la disponibilidad. Intenta recargar.`)}finally{let e=p.querySelector(`#pm-disp-days`);e&&(e.style.opacity=`1`)}}export{p as renderDisponibilidadView};