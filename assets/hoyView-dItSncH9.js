import{t as e}from"./AppToast-DNGTRY9B.js";import{a as t,i as n,n as r,o as i,r as a,t as o}from"./pwaInstaller-Cs9gG4Do.js";import{i as s}from"./supabase-Dhe7Tlxd.js";import{i as c}from"./maestroAuth-CdApllXF.js";import{d as l}from"./weeklyPlanAdapter-D1qpirzw.js";import{t as u}from"./academicService-or-p50Yc.js";import{a as d,i as f,o as p,r as m}from"./portalUtils-CkF82Yyk.js";import{t as h}from"./claseEmergenteModal-DtKzxPON.js";import{t as g}from"./claseAnalysisModal-COv2o22Q.js";function _(e){let[t,n]=(e||`00:00`).split(`:`).map(Number);return t*60+n}function v(e,t,n){let r=_(e),i=_(t);return n>=r&&n<i?`en-curso`:n>=i?`pasada`:r-n<=15?`proxima`:`futura`}function y(t,n,r){let i=document.createElement(`div`);i.id=`pm-hoy-autonav-banner`,i.innerHTML=`
    <div class="pm-autonav-content">
      <i class="bi bi-play-circle-fill pm-autonav-icon"></i>
      <span class="pm-autonav-msg">Abriendo clase en curso…</span>
      <span class="pm-autonav-count" id="pm-autonav-count">3</span>
      <button class="pm-autonav-cancel" id="pm-autonav-cancel">Cancelar</button>
    </div>
  `,document.body.appendChild(i);let a=3,o=!1,s=document.getElementById(`pm-autonav-count`),c=setInterval(()=>{o||(a--,s&&(s.textContent=a),a<=0&&(clearInterval(c),i.remove(),o||(window.router?window.router.navigate(`asistencia?clase=${t}&fecha=${n}`):r?.(t))))},1e3);document.getElementById(`pm-autonav-cancel`)?.addEventListener(`click`,()=>{o=!0,clearInterval(c),i.remove(),e.show(`Auto-navegación cancelada`,`info`)})}async function b(e,{onClaseClick:s}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let h=c();if(!h){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let _=new Date,b=_.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),S=`${_.getFullYear()}-${String(_.getMonth()+1).padStart(2,`0`)}-${String(_.getDate()).padStart(2,`0`)}`;try{let c=await o(h.id,S);if(c&&c.length>0){e.innerHTML=x(c,b,_),C(e,S,h.id);return}let T=await n();if(!T||T.length===0){e.innerHTML=`
        <div class="pm-hoy-empty-state">
          <div class="pm-hoy-empty-card">
            <div class="pm-hoy-empty-icon"><i class="bi bi-lightning-charge-fill"></i></div>
            <h2 class="pm-hoy-empty-title">No tienes clases registradas hoy</h2>
            <p class="pm-hoy-empty-text">Si vas a impartir una clase especial o de reemplazo, puedes crearla aquí mismo.</p>
            <button class="pm-btn pm-btn-primary pm-hoy-emergente-btn" id="btn-clase-emergente">
              <i class="bi bi-plus-circle me-1"></i> Clase emergente
            </button>
          </div>
        </div>
      `,w(e,S,h.id,[]);return}let E=T.map(e=>e.id),D=Object.fromEntries(T.map(e=>[e.id,e])),O=await l(h.id).catch(()=>[]),k=Object.fromEntries((O||[]).map(e=>[String(e.group_id),e])),A=(await r(E)).filter(e=>e.dia?.toLowerCase()===b).sort((e,t)=>e.hora_inicio.localeCompare(t.hora_inicio));if(!A||A.length===0){e.innerHTML=`
        <div style="padding: 1rem 1rem 2rem;">
          <h2 class="pm-date-header">${m(b)} ${d(_)}</h2>
          <div class="pm-hoy-empty-state">
            <div class="pm-hoy-empty-card">
              <div class="pm-hoy-empty-icon"><i class="bi bi-lightning-charge-fill"></i></div>
              <h2 class="pm-hoy-empty-title">No tienes clases programadas hoy</h2>
              <p class="pm-hoy-empty-text">Si vas a dar una clase especial, abre la clase emergente desde aquí.</p>
              <button class="pm-btn pm-btn-primary pm-hoy-emergente-btn" id="btn-clase-emergente">
                <i class="bi bi-plus-circle me-1"></i> Clase emergente
              </button>
            </div>
          </div>
        </div>
      `,w(e,S,h.id,T);return}let j=new Date(_);j.setDate(j.getDate()-3);let M=`${j.getFullYear()}-${String(j.getMonth()+1).padStart(2,`0`)}-${String(j.getDate()).padStart(2,`0`)}`,N=new Date(_);N.setDate(N.getDate()-1);let P=`${N.getFullYear()}-${String(N.getMonth()+1).padStart(2,`0`)}-${String(N.getDate()).padStart(2,`0`)}`,F=(await i(h.id,M,P)||[]).filter(e=>{if(!E.includes(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),I=(await i(h.id,S,S)).filter(e=>E.includes(e.clase_id)).filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return t||e.borrador===!1&&n}),L=new Set(I.map(e=>e.clase_id)),R=await a(E),z={};for(let e of R||[])e.clase_id&&(z[e.clase_id]=(z[e.clase_id]||0)+1);let B=[...new Set(A.map(e=>e.salon_id).filter(Boolean))],V=B.length>0?await t(B):[],H=Object.fromEntries(V.map(e=>[e.id,e.nombre])),U=_.getHours()*60+_.getMinutes(),W=null,G=null,K=A.map(e=>{let t=D[e.clase_id],n=L.has(t.id),r=z[t.id]||0,i=v(e.hora_inicio,e.hora_fin,U),a=k[String(t.id)]||null;i===`en-curso`&&(!n&&!W&&(W=t.id),n&&!G&&(G=t.id));let o=n?`<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`:`<span class="pm-badge pm-badge-danger">Sin registrar</span>`,s=i===`en-curso`?`<span class="pm-badge pm-badge-en-curso"><i class="bi bi-circle-fill pm-pulse-dot me-1"></i>En curso</span>`:i===`proxima`?`<span class="pm-badge pm-badge-proxima"><i class="bi bi-clock me-1"></i>Próximamente</span>`:``;return`
        <div class="pm-clase-card ${[n?`registrada`:`sin-registrar`,i===`en-curso`?`pm-clase-en-curso`:``,i===`proxima`?`pm-clase-proxima`:``,i===`pasada`?`pm-clase-pasada`:``].filter(Boolean).join(` `)}" data-clase-id="${t.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="pm-clase-nombre">${f(t.nombre)}</div>
            <div class="d-flex flex-wrap gap-1 justify-content-end align-items-start">
              ${s}
              ${o}
              <button class="pm-analisis-btn" data-clase-id="${t.id}" title="Ver análisis" aria-label="Analizar clase">
                <i class="bi bi-graph-up"></i>
              </button>
            </div>
          </div>
          <div class="pm-clase-meta">
            <div class="meta-item"><i class="bi bi-clock"></i> ${p(e.hora_inicio)} – ${p(e.hora_fin)}</div>
            <div class="meta-item"><i class="bi bi-music-note-beamed"></i> ${f(t.instrumento||`—`)}</div>
            <div class="meta-item"><i class="bi bi-people"></i> ${r} alumnos</div>
            ${e.salon_id?`<div class="meta-item"><i class="bi bi-geo-alt"></i> ${f(H[e.salon_id]||`Salón`)}</div>`:``}
          </div>
          ${a?`<div class="pm-badge pm-badge-info mt-2"><i class="bi bi-diagram-3 me-1"></i>ACM Semana ${a.current_week||1}</div>`:``}
        </div>
      `}).join(``),q=F.length>0?`
      <div class="pm-pendientes-banner">
        <div class="pm-pendientes-header">
          <i class="bi bi-clipboard-x-fill"></i>
          <span>${F.length===1?`1 clase sin registrar de los últimos días`:`${F.length} clases sin registrar de los últimos días`}</span>
        </div>
        <div class="pm-pendientes-list">
          ${F.map(e=>{let t=D[e.clase_id];if(!t)return``;let n=e.fecha?e.fecha.split(`-`).reverse().slice(0,2).join(`/`):`—`;return`
              <button class="pm-pendiente-item" data-clase-id="${t.id}" data-fecha="${e.fecha}">
                <div class="pm-pendiente-info">
                  <span class="pm-pendiente-nombre">${f(t.nombre)}</span>
                  <span class="pm-pendiente-fecha">${n}</span>
                </div>
                <span class="pm-pendiente-cta">Registrar <i class="bi bi-arrow-right"></i></span>
              </button>`}).join(``)}
        </div>
      </div>`:``;e.innerHTML=`
      <div style="padding: 1rem 1rem 2rem;">
        <h2 class="pm-date-header">${m(b)} ${d(_)}</h2>
        ${q}
        <div class="pm-clases-container">
          ${K}
        </div>
      </div>
    `,e.querySelectorAll(`.pm-pendiente-item`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.claseId,n=e.dataset.fecha;try{await u.createSnapshotFromPlan(t,n,h.id)}catch{}window.router&&window.router.navigate(`asistencia?clase=${t}&fecha=${n}`)})}),e.querySelectorAll(`.pm-clase-card`).forEach(e=>{let t=e.querySelector(`.pm-analisis-btn`);t?t.addEventListener(`click`,e=>{e.stopPropagation(),e.preventDefault();let n=t.dataset.claseId;console.log(`[HoyView] Abriendo análisis para clase:`,n),g(n,S)}):console.warn(`[HoyView] No se encontró botón de análisis en card`),e.addEventListener(`click`,async()=>{if(e.classList.contains(`pm-card-loading`))return;e.classList.add(`pm-card-loading`);let t=e.dataset.claseId;try{await u.createSnapshotFromPlan(t,S,h.id)}catch(e){console.error(`Error generando snapshot:`,e)}e.classList.remove(`pm-card-loading`),s?.(t)})});let J=W||G;J&&(requestAnimationFrame(()=>{e.querySelector(`[data-clase-id="${J}"]`)?.scrollIntoView({behavior:`smooth`,block:`center`})}),W&&setTimeout(()=>{y(W,S,s)},800))}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${f(t.message)}</p>`}}function x(e,t,n){let r=e.map(e=>{let t=`${e.hora_inicio?e.hora_inicio.slice(0,5):`—`} – ${e.hora_fin?e.hora_fin.slice(0,5):`—`}`,n=e.motivo||``,r=e.contenido||e.observaciones||``,i=S(e.motivo);return`
      <div class="pm-clase-card pm-emergente-card" data-eme-id="${e.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="pm-clase-nombre">${f(e.nombre_clase)}</div>
          <span class="pm-badge pm-badge-warning">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>Emergente
          </span>
        </div>
        ${n?`<div class="pm-eme-motivo ${i}">${f(n)}</div>`:``}
        <div class="pm-clase-meta">
          <div class="meta-item"><i class="bi bi-clock"></i> ${t}</div>
          ${r?`<div class="meta-item"><i class="bi bi-chat-text"></i> ${f(r)}</div>`:``}
        </div>
      </div>
    `}).join(``);return`
    <div style="padding: 1rem 1rem 2rem;">
      <h2 class="pm-date-header">${m(t)} ${d(n)}</h2>
      <p class="pm-eme-subtitle">
        <i class="bi bi-exclamation-triangle-fill"></i>
        Clase emergente registrada — reemplaza tus clases programadas de hoy
      </p>
      <div class="pm-clases-container">
        ${r}
      </div>
    </div>
  `}function S(e){return{suplencia:`pm-eme-motivo-suplencia`,eventual:`pm-eme-motivo-eventual`,reforzamiento:`pm-eme-motivo-reforzamiento`,otro:`pm-eme-motivo-otro`}[e]||`pm-eme-motivo-otro`}function C(e,t,n){e.querySelectorAll(`.pm-emergente-card`).forEach(e=>{e.addEventListener(`click`,()=>{e.classList.contains(`pm-card-loading`)||(e.classList.add(`pm-card-loading`),window.router&&window.router.navigate(`clase-emergente?fecha=${t}`),e.classList.remove(`pm-card-loading`))})})}function w(t,n,r,i){t.querySelector(`#btn-clase-emergente`)?.addEventListener(`click`,async()=>{let t=[];try{let e=(i||[]).map(e=>e.id);if(e.length>0){let n=await a(e),r={};n.forEach(e=>{if(!e.alumnos)return;r[e.alumno_id]||(r[e.alumno_id]=[]);let t=i.find(t=>t.id===e.clase_id);t&&r[e.alumno_id].push(t.nombre)});let o=new Set;t=n.map(e=>e.alumnos).filter(Boolean).filter(e=>o.has(e.id)?!1:(o.add(e.id),!0)).map(e=>({...e,clase_nombres:r[e.id]||[]}))}}catch(e){console.warn(`[HoyView] No se pudieron cargar alumnos para clase emergente:`,e)}h({fecha:n,clases:i||[],alumnos:t,maestroId:r,onSave:async t=>{let{data:n,error:r}=await s.from(`sesiones_clase`).insert([t]).select().single();if(r)throw r;e.success(`Clase emergente creada. Procedé a pasar asistencia.`),window.location.hash=`#/asistencia?sesion=${n.id}&fecha=${t.fecha}`}})})}if(!document.getElementById(`pm-hoy-pendientes-styles`)){let e=document.createElement(`style`);if(e.id=`pm-hoy-pendientes-styles`,!document.getElementById(`pm-badge-warning-style`)){let e=document.createElement(`style`);e.id=`pm-badge-warning-style`,e.textContent=`
        .pm-badge-warning {
          background: rgba(245,158,11,0.15);
          color: #d97706;
          border: 1px solid rgba(245,158,11,0.3);
        }
      `,document.head.appendChild(e)}e.textContent=`
    .pm-pendientes-banner {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }
    .pm-pendientes-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--pm-danger, #ef4444);
      margin-bottom: 0.6rem;
    }
    .pm-pendientes-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .pm-pendiente-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface);
      border: 1px solid rgba(239,68,68,0.15);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: background 0.15s, border-color 0.15s;
      gap: 0.5rem;
    }
    .pm-pendiente-item:hover {
      background: rgba(239,68,68,0.06);
      border-color: rgba(239,68,68,0.35);
    }
    .pm-pendiente-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .pm-pendiente-nombre {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text);
    }
    .pm-pendiente-fecha {
      font-size: 0.72rem;
      color: var(--pm-text-muted);
    }
    .pm-pendiente-cta {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pm-danger, #ef4444);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* ── Emergente card ──────────────────────────── */
    .pm-emergente-card {
      border: 2px solid rgba(245,158,11,0.4) !important;
      background: linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%) !important;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .pm-emergente-card:hover {
      border-color: rgba(245,158,11,0.7) !important;
      box-shadow: 0 2px 12px rgba(245,158,11,0.15);
    }
    .pm-eme-subtitle {
      font-size: 0.82rem;
      color: #d97706;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .pm-eme-motivo {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      display: inline-block;
    }
    .pm-eme-motivo-suplencia     { background: rgba(59,130,246,0.1); color: #2563eb; }
    .pm-eme-motivo-eventual      { background: rgba(139,92,246,0.1); color: #7c3aed; }
    .pm-eme-motivo-reforzamiento { background: rgba(16,185,129,0.1); color: #059669; }
    .pm-eme-motivo-otro          { background: rgba(245,158,11,0.1); color: #d97706; }

    /* ── Botón de análisis ──────────────────────────── */
    .pm-analisis-btn {
      background: transparent;
      border: 2px solid var(--pm-border, #d1d5db);
      border-radius: 8px;
      padding: 0.5rem 0.7rem;
      min-width: 32px;
      height: 32px;
      font-size: 1rem;
      color: var(--pm-text-muted, #6b7280);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 10;
      flex-shrink: 0;
      pointer-events: auto !important;
    }
    .pm-analisis-btn:hover {
      background: var(--pm-primary, #3b82f6);
      color: white;
      border-color: var(--pm-primary, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .pm-analisis-btn:active {
      transform: scale(0.95);
    }
    .pm-analisis-btn:focus {
      outline: 2px solid var(--pm-primary, #3b82f6);
      outline-offset: 2px;
    }

    /* ── Estado temporal de clases ──────────────────── */
    .pm-clase-en-curso {
      border: 2px solid var(--pm-primary, #3b82f6) !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
      position: relative;
    }
    .pm-clase-proxima {
      border-left: 3px solid var(--pm-warning, #f59e0b) !important;
    }
    .pm-clase-pasada {
      opacity: 0.55;
    }

    /* Badge en curso */
    .pm-badge-en-curso {
      background: rgba(59,130,246,0.15);
      color: var(--pm-primary, #3b82f6);
      border: 1px solid rgba(59,130,246,0.35);
    }
    .pm-badge-proxima {
      background: rgba(245,158,11,0.12);
      color: #d97706;
      border: 1px solid rgba(245,158,11,0.3);
    }

    /* Punto pulsante dentro del badge "En curso" */
    .pm-pulse-dot {
      font-size: 0.5rem;
      animation: pm-pulse 1.2s ease-in-out infinite;
    }
    @keyframes pm-pulse {
      0%, 100% { opacity: 1; transform: scale(1);   }
      50%       { opacity: 0.4; transform: scale(0.75); }
    }

    /* ── Banner de auto-navegación ──────────────────── */
    #pm-hoy-autonav-banner {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-primary, #3b82f6);
      border-radius: 16px;
      padding: 0.75rem 1.25rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      z-index: 9000;
      animation: pm-slide-up 0.3s ease;
      min-width: 280px;
      max-width: 90vw;
    }
    @keyframes pm-slide-up {
      from { opacity: 0; transform: translateX(-50%) translateY(16px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .pm-autonav-content {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .pm-autonav-icon {
      font-size: 1.2rem;
      color: var(--pm-primary, #3b82f6);
      flex-shrink: 0;
    }
    .pm-autonav-msg {
      flex: 1;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text);
    }
    .pm-autonav-count {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--pm-primary, #3b82f6);
      min-width: 1.2rem;
      text-align: center;
    }
    .pm-autonav-cancel {
      background: none;
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pm-text-muted);
      cursor: pointer;
      flex-shrink: 0;
    }
    .pm-autonav-cancel:hover {
      background: var(--pm-surface-2);
      color: var(--pm-text);
    }

    .pm-hoy-empty-state {
      min-height: 55vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .pm-hoy-empty-card {
      width: min(100%, 560px);
      text-align: center;
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 24px;
      padding: 2rem 1.5rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    }
    .pm-hoy-empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      background: rgba(245,158,11,0.12);
      color: var(--pm-warning, #f59e0b);
      font-size: 2rem;
    }
    .pm-hoy-empty-title {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--pm-text);
    }
    .pm-hoy-empty-text {
      margin: 0 auto 1.25rem;
      max-width: 42ch;
      color: var(--pm-text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .pm-hoy-emergente-btn {
      min-width: 220px;
      padding: 0.85rem 1.25rem;
      border-radius: 999px;
      box-shadow: 0 12px 30px rgba(59,130,246,0.22);
    }
  `,document.head.appendChild(e)}export{b as renderHoyView};