import{i as e}from"./supabase-BryBf0UA.js";import{i as t}from"./maestroAuth-BZ2ChDTg.js";import{f as n,m as r}from"./planificacionAdapter-D9sq6LTl.js";import{a as i}from"./alumnosApi-CG7n3qUK.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function a(){let e=0;document.addEventListener(`touchstart`,t=>{t.touches.length===1&&(e=t.touches[0].clientY)},{passive:!0}),document.addEventListener(`touchmove`,t=>{if(t.touches.length===1&&t.touches[0].clientY-e>0){let e=t.target,n=!1,r=!1;for(;e&&e!==document.body&&e!==document.documentElement;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentNode;continue}let t=window.getComputedStyle(e);if(!t){e=e.parentNode;continue}let i=t.overflowY;if((i===`auto`||i===`scroll`)&&e.scrollHeight>e.clientHeight){r=!0,e.scrollTop<=0&&(n=!0);break}e=e.parentNode}r||(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop)<=0&&(n=!0),n&&t.cancelable&&t.preventDefault()}},{passive:!1})}var o={misClases:6e5,horarios:6e5,sesiones:12e4,inscripciones:6e5,salones:36e5,ausencias:12e4,metricasSesiones:12e4},s=new Map,c=new Map;function l(e){let t=c.get(e);return t?Date.now()-t.timestamp<t.ttl:!1}function u(e,t,n){s.set(e,t),c.set(e,{timestamp:Date.now(),ttl:n||6e4})}function d(e){return l(e)?s.get(e):(s.delete(e),c.delete(e),null)}function f(e,t,n){u(e,t,o[n]||6e4)}function p(e){for(let t of s.keys())t.includes(e)&&(s.delete(t),c.delete(t))}function m(){s.clear(),c.clear()}function h(e){return d(e)}function g(){return[...s.keys()]}var _={get:d,set:f,invalidate:p,invalidateAll:m,getCached:h,_keys:g},v={MIS_CLASES:`mis_clases`,HORARIOS:`horarios`,SESIONES:`sesiones`,INSCRIPCIONES:`inscripciones`,SALONES:`salones`,AUSENCIAS:`ausencias`,RUTAS:`rutas`,EMERGENTES:`emergentes`};async function y(){let e=t();return e?.id?e.id:null}async function b(t=!1){if(typeof process<`u`&&{}.VITEST)return[{id:`550e8400-e29b-41d4-a716-446655440000`,nombre:`Violin 101`,instrumento:`Violin`,capacidad_maxima:20,maestro_principal_id:`dc73014a-9528-4081-84eb-f713b72031ff`}];let n=await y();if(!n)return[];if(!t){let e=_.getCached(`${v.MIS_CLASES}_${n}`);if(e)return e}let{data:r,error:i}=await e.from(`clases`).select(`id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id`).or(`maestro_principal_id.eq.${n},maestro_suplente_id.eq.${n},maestro_id.eq.${n}`);if(i)return console.warn(`[MaestroData] Error cargando clases:`,i.message),[];let a=r||[];return _.set(`${v.MIS_CLASES}_${n}`,a,`misClases`),a}async function x(t,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,dia:`jueves`,hora_inicio:`08:00:00`,hora_fin:`09:00:00`,salon_id:`salon-1`}];if(!t||t.length===0)return[];let r=`horarios_${t.sort().join(`,`)}`;if(!n){let e=_.getCached(r);if(e)return e}let{data:i,error:a}=await e.from(`clase_horarios`).select(`hora_inicio, hora_fin, salon_id, clase_id, dia`).in(`clase_id`,t);if(a)return console.warn(`[MaestroData] Error cargando horarios:`,a.message),[];let o=i||[];return _.set(r,o,`horarios`),o}async function S(t,n,r,i=!1){if(!t)return[];if(!i){let e=ee(t,n,r);if(e){let t=_.getCached(e);if(t)return t.filter(e=>e.fecha>=n&&e.fecha<=r)}let i=`sesiones_${t}_${n}_${r}`,a=_.getCached(i);if(a)return a}let{data:a,error:o}=await e.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,t).gte(`fecha`,n).lte(`fecha`,r);if(o)return console.warn(`[MaestroData] Error cargando sesiones:`,o.message),[];let s=a||[];return _.set(`sesiones_${t}_${n}_${r}`,s,`sesiones`),s}function ee(e,t,n){let r=`sesiones_${e}_`;for(let e of te()){if(!e.startsWith(r))continue;let i=e.replace(r,``).split(`_`);if(i.length===2){let[r,a]=i;if(r<=t&&a>=n)return e}}return null}function te(){return _._keys?_._keys():[]}async function C(t,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`1`,alumnos:{id:`1`,nombre_completo:`Estudiante 1`,instrumento_principal:`Violin`}},{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`2`,alumnos:{id:`2`,nombre_completo:`Estudiante 2`,instrumento_principal:`Violin`}}];if(!t||t.length===0)return[];let r=`inscripciones_${t.sort().join(`,`)}`;if(!n){let e=_.getCached(r);if(e)return e}let{data:i,error:a}=await e.from(`alumnos_clases`).select(`clase_id, alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).in(`clase_id`,t).eq(`activo`,!0);if(a)return console.warn(`[MaestroData] Error cargando inscripciones:`,a.message),[];let o=i||[];return _.set(r,o,`inscripciones`),o}async function w(t,n=!1){if(!t||t.length===0)return[];let r=`salones_${t.sort().join(`,`)}`;if(!n){let e=_.getCached(r);if(e)return e}let{data:i,error:a}=await e.from(`salones`).select(`id, nombre`).in(`id`,t);if(a)return console.warn(`[MaestroData] Error cargando salones:`,a.message),[];let o=i||[];return _.set(r,o,`salones`),o}async function ne(){let e=await y();if(!e)return;let t=await b(),n=t.map(e=>e.id);if(n.length===0)return;let r=new Date,i=new Date(r.getFullYear(),r.getMonth(),1),a=new Date(r.getFullYear(),r.getMonth()+1,0),o=new Date(r);o.setDate(o.getDate()-28);let s=o<i?o.toISOString().split(`T`)[0]:i.toISOString().split(`T`)[0],c=a.toISOString().split(`T`)[0],[l,u,,d]=await Promise.all([x(n),C(n),S(e,s,c),Promise.resolve(null)]),f=[...new Set(l.map(e=>e.salon_id).filter(Boolean))];f.length>0&&await w(f),console.log(`[Prefetch] Mes cargado: ${t.length} clases, ${l.length} horarios, ${u.length} inscripciones`)}async function re(t,n){if(!t||!n)return[];let r=`emergentes_${t}_${n}`,i=_.getCached(r);if(i)return i;let{data:a,error:o}=await e.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,t).eq(`fecha`,n).order(`hora_inicio`,{ascending:!0,nullsFirst:!1});if(o)return console.warn(`[MaestroData] Error cargando clases emergentes:`,o.message),[];let s=a||[];return _.set(r,s,`emergentes`),s}function ie(){_.invalidate(`mis_clases`),_.invalidate(`horarios`),_.invalidate(`inscripciones`),_.invalidate(`sesiones`)}async function ae(t,n=null){let r=`${v.RUTAS}_${t}_${n||`all`}`,i=_.getCached(r);if(i)return i;let a=((await b()).find(e=>e.id===t)?.instrumento||``).split(`,`).map(e=>e.trim().toLowerCase()),o=n?[n.trim().toLowerCase()]:a,{data:s,error:c}=await e.from(`routes`).select(`
      id,
      name,
      instrument,
      route_versions!inner(id, status)
    `).eq(`route_versions.status`,`published`).order(`name`,{ascending:!0});if(c)return console.warn(`[MaestroData] Error cargando rutas:`,c.message),[];let l=(s||[]).map(e=>{let t=Array.isArray(e.route_versions)?e.route_versions.find(e=>e.status===`published`):e.route_versions;return{id:e.id,name:e.name,instrumento:e.instrument||null,route_version_id:t?.id||null}}).filter(e=>{if(!e.route_version_id)return!1;if(o.length===0)return!0;let t=(e.instrumento||``).toLowerCase();return o.some(e=>t.includes(e)||e.includes(t))});return _.set(r,l,v.RUTAS),l}var T=null,E=null,D=null;({init(){window.pwaInstaller=this,this._injectStyles(),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),T=e}),window.addEventListener(`appinstalled`,()=>{localStorage.setItem(`pwa-installed`,`true`),T=null})},async evaluateInsights(){let e=t();if(e?.id)try{let t=await b(),n=new Date,r=new Date(n.getTime()-10080*60*1e3),i=n.toISOString().split(`T`)[0],a=r.toISOString().split(`T`)[0],o=await S(e.id,a,i),s=[],c=(o||[]).filter(e=>e.borrador===!0);if(c.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre]));if(c.length===1){let t=c[0],n=e[t.clase_id]||`Clase`,r=t.fecha?t.fecha.split(`-`).reverse().slice(0,2).join(`/`):``,i=r?` del ${r}`:``;s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tienes el registro de ${n}${i} en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${t.clase_id}&fecha=${t.fecha}`)}})}else{let e=c[0];s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tienes ${c.length} registros de clase en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${e.clase_id}&fecha=${e.fecha}`)}})}}let l=new Set((t||[]).map(e=>e.id)),u=(o||[]).filter(e=>{if(e.fecha>=i||!l.has(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)});if(u.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre])),n=u[0],r=e[n.clase_id]||`Clase`,i=n.fecha?n.fecha.split(`-`).reverse().slice(0,2).join(`/`):``;s.push({id:`sessions-without-attendance`,priority:`high`,icon:`bi-clipboard-x-fill`,text:u.length===1?`${r} del ${i} quedó sin registrar asistencia.`:`Tienes ${u.length} clases sin asistencia registrada esta semana.`,actionLabel:`Registrar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${n.clase_id}&fecha=${n.fecha}`)}})}e.telefono||e.tlf||s.push({id:`profile-incomplete`,priority:`medium`,icon:`bi-person-exclamation`,text:`Completa tu número de teléfono en tu perfil de usuario.`,actionLabel:`Completar`,action:()=>{window.router&&window.router.navigate(`perfil`)}}),T!==null&&!this._isStandalone()&&s.push({id:`pwa-install-prompt`,priority:`medium`,icon:`bi-download`,text:`Instala SOI Maestros en tu pantalla de inicio para acceso rápido sin conexión.`,actionLabel:`Instalar`,action:()=>{this.promptInstall()}}),(!t||t.length===0)&&s.push({id:`no-classes-assigned`,priority:`low`,icon:`bi-info-circle-fill`,text:`No tienes clases asignadas en el sistema actualmente.`,actionLabel:`Soporte`,action:()=>{window.router&&window.router.navigate(`perfil`)}});let d=s.filter(e=>{let t=localStorage.getItem(`soi-dismissed-${e.id}`);return t?Date.now()-parseInt(t,10)>10080*60*1e3:!0});if(d.length>0){let e=d[0];if(this.currentAlertId===e.id&&this.currentAlertText===e.text)return;this._showInsightBanner(e)}else this.dismissBanner()}catch(e){console.warn(`[SmartInsights] Error al evaluar alertas:`,e)}},_showInsightBanner(e){let t=document.getElementById(`pwa-smart-banner`)||E;if(t){let n=t.querySelector(`.psb-capsule`);if(n){n.style.transition=`opacity 0.2s ease`,n.style.opacity=`0`,setTimeout(()=>{let t=n.querySelector(`.psb-severity-dot`);t&&(t.className=`psb-severity-dot ${e.priority}`,t.innerHTML=`<i class="bi ${e.icon}"></i>`);let r=n.querySelector(`.psb-title`);r&&(r.textContent=e.text);let i=n.querySelector(`#pwa-banner-action`);if(i){i.innerHTML=`<span>${e.actionLabel}</span>`;let t=i.cloneNode(!0);i.parentNode.replaceChild(t,i),t.addEventListener(`click`,()=>{e.action()})}let a=n.querySelector(`#pwa-banner-close`);if(a){let t=a.cloneNode(!0);a.parentNode.replaceChild(t,a),t.addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})}this.currentAlertId=e.id,this.currentAlertText=e.text,n.style.opacity=`1`},200);return}}E=document.createElement(`div`),E.id=`pwa-smart-banner`,E.setAttribute(`role`,`status`),E.setAttribute(`aria-live`,`polite`),E.innerHTML=`
      <div class="psb-capsule" style="opacity: 1;">
        <div class="psb-severity-dot ${e.priority}">
          <i class="bi ${e.icon}"></i>
        </div>
        <div class="psb-info">
          <span class="psb-title">${e.text}</span>
        </div>
        <button class="psb-action" id="pwa-banner-action">
          <span>${e.actionLabel}</span>
        </button>
        <button class="psb-close" id="pwa-banner-close" aria-label="Cerrar aviso">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `,document.body.prepend(E),this.currentAlertId=e.id,this.currentAlertText=e.text,requestAnimationFrame(()=>{requestAnimationFrame(()=>E?.classList.add(`psb-visible`))}),document.getElementById(`pwa-banner-action`).addEventListener(`click`,()=>{e.action()}),document.getElementById(`pwa-banner-close`).addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})},dismissBanner(){if(this.currentAlertId=null,this.currentAlertText=null,!E)return;E.classList.remove(`psb-visible`);let e=E;E=null,setTimeout(()=>{e.remove()},400)},promptInstall(){/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():T?this._triggerNativeInstall():this._showDesktopGuide()},async _triggerNativeInstall(){if(!T){this._showDesktopGuide();return}try{await T.prompt();let{outcome:e}=await T.userChoice;e===`accepted`&&localStorage.setItem(`pwa-installed`,`true`)}catch(e){console.warn(`[PWA] Error al mostrar prompt:`,e)}finally{T=null}},_showIOSGuide(){if(D)return;D=document.createElement(`div`),D.id=`pwa-guide-modal`,D.innerHTML=`
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-phone"></i>
          </div>
          <h3 id="pgm-title">Instalar en iPhone / iPad</h3>
          <p class="pgm-subtitle">Añadí SOI Maestros a tu pantalla de inicio</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>Toca el botón <strong>Compartir</strong> <i class="bi bi-box-arrow-up"></i> en la barra inferior de Safari</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>Desliza hacia abajo y toca <strong>"Añadir a pantalla de inicio"</strong></span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Presiona <strong>Añadir</strong> — la app aparecerá como un ícono nativo</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `,document.body.appendChild(D);let e=()=>{D?.classList.add(`pgm-hiding`),setTimeout(()=>{D?.remove(),D=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_showDesktopGuide(){if(D)return;D=document.createElement(`div`),D.id=`pwa-guide-modal`,D.innerHTML=`
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-display"></i>
          </div>
          <h3 id="pgm-title">Instalar como App de Escritorio</h3>
          <p class="pgm-subtitle">Accede sin el navegador, como una app nativa</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>En la barra de Chrome busca el ícono <strong>"Instalar aplicación"</strong> (ícono de pantalla con flecha)</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>En <strong>Edge</strong>: Menú ⋯ → Apps → Instalar este sitio como app</span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Confirma la instalación — SOI Maestros quedará en tu escritorio y barra de tareas</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `,document.body.appendChild(D);let e=()=>{D?.classList.add(`pgm-hiding`),setTimeout(()=>{D?.remove(),D=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_isStandalone(){return window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`},_injectStyles(){if(document.getElementById(`pwa-installer-styles`))return;let e=document.createElement(`style`);e.id=`pwa-installer-styles`,e.textContent=`
      /* ── SOI Smart Insights Banner (Inline above Header) ── */
      #pwa-smart-banner {
        position: relative;
        width: 100%;
        z-index: 10000;
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.3s ease;
      }

      #pwa-smart-banner.psb-visible {
        opacity: 1;
        max-height: 80px;
      }

      .psb-capsule {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        background: #f5f5f7;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        min-height: 48px;
      }

      /* Dark mode styles for capsule */
      [data-portal-theme="dark"] .psb-capsule,
      [data-bs-theme="dark"] .psb-capsule {
        background: rgba(30, 41, 59, 0.88);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .psb-severity-dot {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .psb-severity-dot.high {
        background: rgba(255, 59, 48, 0.15);
        color: #ff3b30;
      }

      .psb-severity-dot.medium {
        background: rgba(255, 149, 0, 0.15);
        color: #ff9500;
      }

      .psb-severity-dot.low {
        background: rgba(9, 132, 227, 0.15);
        color: #0984e3;
      }

      .psb-severity-dot i {
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .psb-info {
        flex: 1;
        min-width: 0;
      }

      .psb-title {
        font-size: 13px;
        font-weight: 600;
        color: #1d1d1f;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Dark mode text */
      [data-portal-theme="dark"] .psb-title,
      [data-bs-theme="dark"] .psb-title {
        color: #f1f5f9;
      }

      .psb-action {
        background: var(--pm-primary, #5856D6);
        color: white !important;
        border: none;
        border-radius: 16px;
        padding: 5px 12px;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .psb-action:hover {
        background: #4745b4;
        transform: translateY(-0.5px);
      }

      .psb-action:active {
        transform: scale(0.96);
      }

      .psb-close {
        background: transparent;
        border: none;
        color: #86868b;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
        flex-shrink: 0;
      }

      .psb-close:hover {
        color: #1d1d1f;
      }

      [data-portal-theme="dark"] .psb-close:hover,
      [data-bs-theme="dark"] .psb-close:hover {
        color: #ffffff;
      }

      /* ── Guide Modal ───────────────────────────────── */
      #pwa-guide-modal .pgm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        z-index: 10001;
        padding: 16px;
        animation: pgm-fade-in 0.25s ease;
      }

      #pwa-guide-modal.pgm-hiding .pgm-overlay {
        animation: pgm-fade-out 0.3s ease forwards;
      }

      @keyframes pgm-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes pgm-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      #pwa-guide-modal .pgm-card {
        background: rgba(22, 22, 30, 0.97);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px 24px 16px 16px;
        padding: 28px 24px 24px;
        max-width: 420px;
        width: 100%;
        text-align: center;
        animation: pgm-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 -4px 40px rgba(0, 0, 0, 0.4);
      }

      #pwa-guide-modal.pgm-hiding .pgm-card {
        animation: pgm-slide-down 0.3s ease forwards;
      }

      @keyframes pgm-slide-up {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      @keyframes pgm-slide-down {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(40px); opacity: 0; }
      }

      .pgm-icon-wrap {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, #5856D6, #7C7AE6);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(88, 86, 214, 0.4);
      }

      .pgm-icon-wrap i {
        font-size: 28px;
        color: white;
      }

      #pwa-guide-modal h3 {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
      }

      .pgm-subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0 0 20px;
      }

      .pgm-steps {
        list-style: none;
        padding: 0;
        margin: 0 0 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        text-align: left;
      }

      .pgm-steps li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13.5px;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.5;
      }

      .pgm-step-num {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(88, 86, 214, 0.3);
        border: 1px solid rgba(88, 86, 214, 0.6);
        color: #7C7AE6;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .pgm-steps strong {
        color: #fff;
      }

      .pgm-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #5856D6, #7C7AE6);
        color: white;
        border: none;
        border-radius: 14px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 16px rgba(88, 86, 214, 0.35);
      }

      .pgm-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(88, 86, 214, 0.5);
      }

      .pgm-btn:active {
        transform: scale(0.98);
      }

      /* Desktop: centrar el modal */
      @media (min-width: 600px) {
        #pwa-guide-modal .pgm-overlay {
          align-items: center;
        }
        #pwa-guide-modal .pgm-card {
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
      }
    `,document.head.appendChild(e)}}).init();var oe=class{constructor(e=`default`){this.scope=e,this.subscriptions=[],this.intervals=[],this.listeners=[]}registerChannel(e){e&&!this.subscriptions.includes(e)&&this.subscriptions.push(e)}registerInterval(e){e!==null&&!this.intervals.includes(e)&&this.intervals.push(e)}registerListener(e,t,n){e&&t&&n&&this.listeners.push({el:e,event:t,fn:n})}destroy(){this.subscriptions.forEach(t=>{try{t&&e.removeChannel(t)}catch(e){console.warn(`[LifecycleManager] Error removing channel (${this.scope}):`,e)}}),this.intervals.forEach(e=>{try{clearInterval(e)}catch(e){console.warn(`[LifecycleManager] Error clearing interval (${this.scope}):`,e)}}),this.listeners.forEach(({el:e,event:t,fn:n})=>{try{e&&t&&n&&e.removeEventListener(t,n)}catch(e){console.warn(`[LifecycleManager] Error removing listener (${this.scope}):`,e)}}),this.subscriptions=[],this.intervals=[],this.listeners=[],console.log(`[LifecycleManager] Cleanup completed for scope: ${this.scope}`)}},O={alumnos:/#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,calificacion:/(\d)\/(\d)/g};function k(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)r[1]&&n.push(r[1].trim());return n}function se(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function A(e){return!e||typeof e!=`string`?{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[]}:{alumnos:k(e,O.alumnos),contenido:k(e,O.contenido),sugerencias:k(e,O.sugerencias),tareas:k(e,O.tareas),medidas:k(e,O.medidas),calificacion:se(e),objetivos:k(e,O.objetivos)}}function j(e){if(!e)return``;let t=e;return t=t.replace(O.calificacion,(e,t,n)=>`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`),t=t.replace(O.objetivos,(e,t)=>`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">__OBJ_START__${t}__OBJ_END__</span>`),t=t.replace(O.alumnos,(e,t)=>`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`),t=t.replace(O.contenido,(e,t)=>`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`),t=t.replace(O.sugerencias,(e,t)=>`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`),t=t.replace(O.tareas,(e,t)=>`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`),t=t.replace(O.medidas,(e,t)=>`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`),t=ce(t),t=t.replace(/__OBJ_START__/g,`&gt;`),t=t.replace(/__OBJ_END__/g,``),t}function ce(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var le=175,ue=[`Ejemplo:`,`#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica`,`#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5`,``,`Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo`].join(`
`),M=null,N=``;function de(e=``,t=null){let n=document.createElement(`div`);n.className=`dsl-editor-container`;let r=document.createElement(`div`);r.className=`dsl-editor-wrapper position-relative`;let i=document.createElement(`div`);i.className=`dsl-editor form-control`,i.contentEditable=`true`,i.spellcheck=`false`,i.setAttribute(`data-placeholder`,ue),i.innerHTML=e?j(e):``;let a=document.createElement(`div`);a.className=`dsl-highlight-layer position-absolute top-0 start-0 w-100 h-100 overflow-hidden pe-none`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(a),r.appendChild(i),n.appendChild(r),fe();function o(){return i.innerText||i.textContent||``}function s(){let e=o();e!==N&&(N=e,a.innerHTML=j(e)+`<br>`)}function c(){a.scrollTop=i.scrollTop,a.scrollLeft=i.scrollLeft}function l(){clearTimeout(M),M=setTimeout(()=>{s();let e=A(o());t&&t(o(),e)},le)}function u(e){e.key===`Tab`&&(e.preventDefault(),document.execCommand(`insertText`,!1,`  `))}function d(){c()}i.addEventListener(`input`,l),i.addEventListener(`keydown`,u),i.addEventListener(`scroll`,d),i.addEventListener(`focus`,()=>{n.classList.add(`focused`)}),i.addEventListener(`blur`,()=>{n.classList.remove(`focused`),s()});function f(e){i.innerHTML=e?j(e):``,N=o(),a.innerHTML=j(N)+`<br>`}function p(){return o()}function m(){return A(o())}function h(){i.focus()}function g(e){i.focus(),document.execCommand(`insertText`,!1,e)}function _(e,t=``){i.focus();let n=window.getSelection();if(!n.rangeCount)return;let r=n.getRangeAt(0);r.deleteContents();let a=document.createTextNode(e),s=document.createTextNode(t);r.insertNode(a),r.collapse(!1),r.insertNode(s),r.setStartAfter(a),r.setEndAfter(a),n.removeAllRanges(),n.addRange(r),N=o()}return n.component={element:n,editor:i,setContent:f,getContent:p,getParsed:m,focus:h,insertText:g,insertAtCursor:_},n.setContent=f,n.getContent=p,n.getParsed=m,n.focus=h,n.insertText=g,n.insertAtCursor=_,e&&(N=e),n}function fe(){if(document.getElementById(`dsl-editor-styles`))return;let e=document.createElement(`style`);e.id=`dsl-editor-styles`,e.textContent=`
    .dsl-editor-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dsl-editor-wrapper {
      border-radius: 0.375rem;
      background: #fff;
    }

    .dsl-editor {
      min-height: 120px;
      max-height: 400px;
      overflow-y: auto;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      outline: none;
      padding: 0.75rem;
    }

    .dsl-editor:empty::before {
      content: attr(data-placeholder);
      color: #6c757d;
      pointer-events: none;
    }

    .dsl-editor-wrapper.focused .dsl-editor {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .dsl-highlight-layer {
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      padding: 0.75rem;
      color: transparent;
      background: transparent;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .dsl-highlight-layer .dsl-token {
      padding: 0.1em 0.2em;
      border-radius: 0.2em;
      font-weight: 500;
    }

    .dsl-highlight-layer .dsl-alumno {
      background: rgba(13, 110, 253, 0.15);
      color: #0d6efd;
    }

    .dsl-highlight-layer .dsl-contenido {
      background: rgba(25, 135, 84, 0.15);
      color: #198754;
    }

    .dsl-highlight-layer .dsl-sugerencia {
      background: rgba(253, 126, 20, 0.15);
      color: #fd7e14;
    }

    .dsl-highlight-layer .dsl-tarea {
      background: rgba(147, 51, 234, 0.15);
      color: #9333ea;
    }

    .dsl-highlight-layer .dsl-medida {
      background: rgba(109, 213, 237, 0.25);
      color: #0aa3c4;
    }

    .dsl-highlight-layer .dsl-calificacion {
      background: rgba(220, 53, 69, 0.15);
      color: #dc3545;
    }

    .dsl-highlight-layer .dsl-objetivo {
      background: rgba(108, 117, 125, 0.15);
      color: #6c757d;
      font-style: italic;
    }

    .dsl-editor::-webkit-scrollbar {
      width: 8px;
    }

    .dsl-editor::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .dsl-editor::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .dsl-editor::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `,document.head.appendChild(e)}function pe(e={}){let{onAlumnoClick:t=null,onGrabarClick:n=null,onEnriquecerClick:r=null,editor:i=null}=e,a=document.createElement(`div`);return a.className=`dsl-toolbar btn-group btn-group-sm me-2`,[{id:`alumno`,icon:`#`,label:`Alumno`,title:`Insertar mention de alumno`,className:`btn btn-outline-primary`,action:()=>{t?t(i):i&&i.insertAtCursor(`#`,``)}},{id:`contenido`,icon:`[]`,label:`Contenido`,title:`Insertar contenido`,className:`btn btn-outline-success`,action:()=>{i&&i.insertAtCursor(`[`,`]`)}},{id:`sugerencia`,icon:`()`,label:`Sugerencia`,title:`Insertar sugerencia`,className:`btn btn-outline-warning`,action:()=>{i&&i.insertAtCursor(`(`,`)`)}},{id:`tarea`,icon:`{}`,label:`Tarea`,title:`Insertar tarea`,className:`btn btn-outline-purple`,action:()=>{i&&i.insertAtCursor(`{`,`}`)}},{id:`medida`,icon:`$`,label:`Medida`,title:`Insertar medida técnica`,className:`btn btn-outline-info`,action:()=>{i&&i.insertAtCursor(`$`,``)}},{id:`calificacion`,icon:`4/5`,label:`Calificación`,title:`Insertar calificación`,className:`btn btn-outline-danger`,action:()=>{i&&i.insertText(`4/5`)}},{id:`objetivo`,icon:`>`,label:`Objetivo`,title:`Insertar referencia a objetivo`,className:`btn btn-outline-secondary`,action:()=>{i&&i.insertAtCursor(`>`,``)}},{id:`grabar`,icon:`🎤`,label:`Grabar`,title:`Grabar audio (placeholder)`,className:`btn btn-outline-dark`,action:()=>{n&&n(i)}},{id:`enriquecer`,icon:`✨`,label:`IA`,title:`Enriquecer con IA (placeholder)`,className:`btn btn-outline-dark`,action:()=>{r&&r(i)}}].forEach(e=>{let t=document.createElement(`button`);t.className=e.className,t.type=`button`,t.title=e.title,t.innerHTML=`<span class="dsl-toolbar-btn">${e.icon}</span>`,t.addEventListener(`click`,t=>{t.preventDefault(),e.action()}),a.appendChild(t)}),me(),a}function me(){if(document.getElementById(`dsl-toolbar-styles`))return;let e=document.createElement(`style`);e.id=`dsl-toolbar-styles`,e.textContent=`
    .dsl-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .dsl-toolbar .btn {
      font-size: 14px;
      padding: 0.25rem 0.5rem;
      min-width: 36px;
    }

    .dsl-toolbar-btn {
      font-weight: 600;
    }

    .btn-outline-purple {
      color: #9333ea;
      border-color: #9333ea;
      background-color: transparent;
    }

    .btn-outline-purple:hover {
      color: #fff;
      background-color: #9333ea;
    }

    .btn-outline-info {
      color: #6dd5ed;
      border-color: #6dd5ed;
      background-color: transparent;
    }

    .btn-outline-info:hover {
      color: #fff;
      background-color: #0aa3c4;
      border-color: #0aa3c4;
    }
  `,document.head.appendChild(e)}function P(e={}){let{initialContent:t=``,onChange:n=null,onAlumnoClick:r=null,onGrabarClick:i=null,onEnriquecerClick:a=null}=e,o=document.createElement(`div`);o.className=`dsl-editor-with-toolbar`;let s=de(t,n),c=pe({onAlumnoClick:r,onGrabarClick:i,onEnriquecerClick:a,editor:s});return o.appendChild(c),o.appendChild(s),o.container=o,o}function he(e={}){let{onSelect:t=null,onClose:n=null}=e,r=new Set,a=``,o=document.createElement(`div`);o.className=`modal fade`,o.setAttribute(`tabindex`,`-1`),o.setAttribute(`role`,`dialog`),o.innerHTML=`
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar Alumnos</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body p-0">
          <div class="p-3 border-bottom bg-light">
            <input type="text" class="form-control search-input" placeholder="Buscar por nombre...">
          </div>
          <div class="alumno-list-container" style="max-height: 300px; overflow-y: auto;">
            <div class="list-group list-group-flush alumno-list">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary cancel-btn" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary confirm-btn">Insertar seleccionados</button>
        </div>
      </div>
    </div>
  `;let s=o.querySelector(`.search-input`),c=o.querySelector(`.alumno-list`),l=o.querySelector(`.confirm-btn`),u=o.querySelector(`.cancel-btn`);async function d(){let e=await i();f(a?e.filter(e=>e.nombre_completo.toLowerCase().includes(a.toLowerCase())):e)}function f(e){if(c.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`text-center text-muted py-4`,e.textContent=`No se encontraron alumnos`,c.appendChild(e);return}e.forEach(e=>{let t=document.createElement(`label`);t.className=`list-group-item d-flex align-items-center gap-2 cursor-pointer`,t.style.cursor=`pointer`;let n=document.createElement(`input`);n.type=`checkbox`,n.className=`form-check-input`,n.checked=r.has(e.id),n.value=e.id;let i=document.createElement(`div`);i.className=`flex-grow-1`,i.innerHTML=`
        <div class="fw-medium">${F(e.nombre_completo)}</div>
        <small class="text-muted">${F(e.instrumento_principal)}</small>
      `,t.appendChild(n),t.appendChild(i),n.addEventListener(`change`,()=>{n.checked?r.add(e.id):r.delete(e.id)}),t.addEventListener(`click`,e=>{e.target!==n&&(n.checked=!n.checked,n.dispatchEvent(new Event(`change`)))}),c.appendChild(t)})}s.addEventListener(`input`,e=>{a=e.target.value,d()}),l.addEventListener(`click`,()=>{t&&t(Array.from(r)),m()}),u.addEventListener(`click`,()=>{n&&n(),m()});function p(){r.clear(),a=``,s.value=``;let e=new bootstrap.Modal(o);e.show(),d(),o.bsModal=e}function m(){o.bsModal&&o.bsModal.hide()}return o.openModal=p,o.closeModal=m,o}function F(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function I(t,n){let r=e.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);t&&(r=r.eq(`instrumento`,t)),n&&(r=r.eq(`nivel`,n));let{data:i,error:a}=await r.maybeSingle();if(a)throw a;return i||null}async function ge(){let{data:t,error:n}=await e.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(n)throw n;return(t||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function L({instrumento:t,nivel:n,descripcion:r}){let{data:i,error:a}=await e.from(`curriculos`).insert({instrumento:t,nivel:n,descripcion:r}).select().single();if(a)throw a;return i}async function _e(t,n){let{data:r,error:i}=await e.from(`curriculos`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,t).select().single();if(i)throw i;return r}async function ve(e,t){return _e(e,{activo:t})}async function R(t,n,r=0){let{data:i,error:a}=await e.from(`curriculo_pilares`).insert({curriculo_id:t,nombre:n,orden:r}).select().single();if(a)throw a;return i}async function ye(t,n){let{data:r,error:i}=await e.from(`curriculo_pilares`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function be(t){let{error:n}=await e.from(`curriculo_pilares`).delete().eq(`id`,t);if(n)throw n}async function z(t,n,r=0){let{data:i,error:a}=await e.from(`curriculo_objetivos`).insert({pilar_id:t,descripcion:n,orden:r}).select().single();if(a)throw a;return i}async function xe(t,n){let{data:r,error:i}=await e.from(`curriculo_objetivos`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function Se(t){let{error:n}=await e.from(`curriculo_objetivos`).delete().eq(`id`,t);if(n)throw n}async function Ce({instrumento:e,nivel:t,descripcion:n,pilares:r}){if(!e||e.trim()===``)throw Error(`El instrumento es obligatorio para crear el plan.`);if(!r||r.length===0)throw Error(`La propuesta debe tener al menos un pilar.`);let i=await L({instrumento:e.trim(),nivel:t?.trim()||``,descripcion:n?.trim()||`Plan generado por IA`}),a=[];for(let e=0;e<r.length;e++){let t=r[e],n=await R(i.id,t.nombre||`Pilar ${e+1}`,e),o=t.objetivos||[];for(let e=0;e<o.length;e++){let t=await z(n.id,o[e].descripcion||`Objetivo ${e+1}`,e);a.push({id:t.id,descripcion:t.descripcion})}}return{curriculo:i,allObjetivos:a}}async function we(e,t=null,a=[],o=[],s={},c){let l=e===`edit`&&!!t,u=[];try{u=await n()}catch{}let d=l?t:{...s};!l&&s.contenido&&!d.notas_dsl&&(d.notas_dsl=s.contenido),!l&&s.maestro_nombre&&!o.find(e=>e.nombre===s.maestro_nombre)&&(o=[{id:s.maestro_id,nombre:s.maestro_nombre},...o]);let f=new r(d),p=document.getElementById(`pm-planificacion-modal`);if(p&&p.remove(),p=document.createElement(`div`),p.id=`pm-planificacion-modal`,p.className=`pm-plan-modal-overlay`,p.innerHTML=Te(l,f,a,o,u),document.body.appendChild(p),!document.getElementById(`pm-plan-modal-styles`)){let e=document.createElement(`style`);e.id=`pm-plan-modal-styles`,e.textContent=Ee(),document.head.appendChild(e)}let m=()=>{p.classList.remove(`open`),setTimeout(()=>p.remove(),200)};p.querySelector(`.pm-plan-close-x`).onclick=m,p.querySelector(`.pm-plan-cancel-btn`).onclick=m,p.querySelector(`.pm-plan-backdrop`).onclick=m;let h=e=>{e.key===`Escape`&&(m(),document.removeEventListener(`keydown`,h))};document.addEventListener(`keydown`,h);let g=p.querySelector(`#pl-plantilla`);g&&g.addEventListener(`change`,e=>{let t=u.find(t=>t.id===e.target.value);t&&t.id!==`blanco`&&(p.querySelector(`#pl-objetivos`).value=t.objetivos||``,p.querySelector(`#pl-contenido`).value=t.contenido||``,p.querySelector(`#pl-recursos`).value=t.recursos||``,p.querySelector(`#pl-evaluacion`).value=t.evaluacion_metodo||``,Oe(p))});let _=p.querySelector(`#pl-clase_id`);_&&_.addEventListener(`change`,()=>{let e=p.querySelector(`#pl-instrumento`);if(e){let t=e.value;e.innerHTML=`<option value="">Todos los instrumentos</option>${V(a,_.value,null)}`,e.querySelector(`option[value="${t}"]`)&&(e.value=t)}}),De(p);let v=p.querySelector(`#dsl-editor-container`);if(v){let e=he({onSelect:async e=>{let n=(await i()).filter(t=>e.includes(t.id)).map(e=>`#${e.nombre_completo}`).join(`, `);t.component&&t.component.insertText(n+` `)}});document.body.appendChild(e);let t=P({initialContent:f.notas_dsl||``,onChange:(e,t)=>{let n=p.querySelector(`#dsl-summary`);n&&(n.textContent=ke(t))},onAlumnoClick:()=>e.openModal()});v.appendChild(t),p._dslEditor=t}let y=p.querySelector(`.pm-plan-save-btn`);y.onclick=async()=>{let e=p.querySelector(`#pl-tema`)?.value.trim(),t=p.querySelector(`#pl-clase_id`)?.value;if(!e){p.querySelector(`#pl-tema`).focus();return}if(!t){p.querySelector(`#pl-clase_id`).focus();return}y.disabled=!0,y.innerHTML=`<span class="pm-plan-spinner"></span> Guardando...`;try{let n=p.querySelector(`#pl-recursos`)?.value||``,r=p._dslEditor,i={clase_id:t,maestro_id:p.querySelector(`#pl-maestro_id`)?.value||null,instrumento:p.querySelector(`#pl-instrumento`)?.value||null,tema:e,fecha_inicio:p.querySelector(`#pl-fecha_inicio`)?.value||null,objetivos:p.querySelector(`#pl-objetivos`)?.value.trim(),contenido:p.querySelector(`#pl-contenido`)?.value.trim(),recursos:n.split(`,`).map(e=>e.trim()).filter(Boolean),evaluacion_metodo:p.querySelector(`#pl-evaluacion`)?.value.trim(),observaciones:p.querySelector(`#pl-observaciones`)?.value.trim(),notas_dsl:r?r.getContent():``,estado:l&&p.querySelector(`#pl-estado`)?.value||`planificado`};c&&await c(i),m()}catch(e){console.error(`[planificacionModal] Error:`,e),y.disabled=!1,y.textContent=l?`Guardar cambios`:`Guardar`}};let b=p.querySelector(`.pm-plan-body`);if(b){let e=document.createElement(`div`);e.style.cssText=`display:flex;gap:1rem;align-items:flex-start`;let t=document.createDocumentFragment();for(;b.firstChild;)t.appendChild(b.firstChild);let n=document.createElement(`div`);n.style.cssText=`flex:1;min-width:0`,n.appendChild(t),e.appendChild(n),e.insertAdjacentHTML(`beforeend`,`
      <div style="position:sticky;top:0;width:220px;flex-shrink:0" id="pl-curriculo-wrapper">
        <div class="card border-0 bg-body-secondary">
          <div class="card-header bg-transparent py-2 border-bottom">
            <span class="small fw-semibold"><i class="bi bi-journal-bookmark me-1 text-primary"></i>Guía curricular</span>
          </div>
          <div class="card-body p-2 small" id="pl-curriculo-body" style="max-height:350px;overflow-y:auto">
            <div class="text-muted text-center small py-3">Seleccioná una clase para ver la guía</div>
          </div>
        </div>
      </div>`),b.appendChild(e);let r=p.querySelector(`#pl-clase_id`);if(r&&(r.addEventListener(`change`,()=>{let e=r.value;if(!e)return;let t=a.find(t=>t.id===e);t?.instrumento&&t?.plan_estudio&&B(t.instrumento,t.plan_estudio,p)}),f.clase_id)){let e=a.find(e=>e.id===f.clase_id);e?.instrumento&&e?.plan_estudio&&B(e.instrumento,e.plan_estudio,p)}}requestAnimationFrame(()=>{p.classList.add(`open`),p.querySelector(`#pl-tema`)?.focus()})}async function B(e,t,n){let r=n.querySelector(`#pl-curriculo-body`);if(r){r.innerHTML=`<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let n=await I(e,t);if(!n){r.innerHTML=`<p class="text-muted small text-center py-2">Sin guía curricular<br>para ${e} — ${t}</p>`;return}r.innerHTML=n.curriculo_pilares.map(e=>`
      <div class="mb-2">
        <div class="fw-semibold text-uppercase text-muted mb-1" style="font-size:.7rem;letter-spacing:.05em">${e.nombre}</div>
        ${e.curriculo_objetivos.map(e=>`
          <div class="d-flex align-items-start gap-1 mb-1">
            <i class="bi bi-circle text-muted" style="font-size:.65rem;margin-top:3px;flex-shrink:0"></i>
            <span style="font-size:.78rem">${e.descripcion}</span>
          </div>`).join(``)}
      </div>`).join(``)}catch(e){r.innerHTML=`<p class="text-danger small">${e.message}</p>`}}}function Te(e,t,n,r,i=[]){let a=n.length?n.map(e=>`<option value="${e.id}" ${t.clase_id===e.id?`selected`:``}>${H(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin clases disponibles</option>`,o=r.length?`<option value="">Sin asignar</option>`+r.map(e=>`<option value="${e.id}" ${t.maestro_id===e.id?`selected`:``}>${H(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin maestros disponibles</option>`,s=Array.isArray(t.recursos)?t.recursos.join(`, `):``,c=i.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``);return`
    <div class="pm-plan-backdrop"></div>
    <div class="pm-plan-modal">
      <!-- Header -->
      <div class="pm-plan-header">
        <div class="pm-plan-header-left">
          <div class="pm-plan-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 class="pm-plan-title">${e?`Editar Planificación`:`Nueva Planificación`}</h2>
            <p class="pm-plan-subtitle">Completa los datos para crear tu planificación</p>
          </div>
        </div>
        <button class="pm-plan-close-x" aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="pm-plan-body">
        ${e?``:`
        <div class="pm-plan-section">
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-plantilla">Plantilla</label>
            <select class="pm-plan-select" id="pl-plantilla">
              ${c}
            </select>
            <span class="pm-plan-hint">Selecciona una plantilla para préllenar el formulario</span>
          </div>
        </div>
        `}

        <!-- Datos básicos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Datos Básicos</h3>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-clase_id">Clase *</label>
              <select class="pm-plan-select" id="pl-clase_id" required>
                <option value="">Seleccionar clase</option>
                ${a}
              </select>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-maestro_id">Maestro</label>
              <select class="pm-plan-select" id="pl-maestro_id">
                ${o}
              </select>
            </div>
          </div>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-instrumento">Instrumento / Grupo</label>
              <select class="pm-plan-select" id="pl-instrumento">
                <option value="">Todos los instrumentos</option>
                ${V(n,t.clase_id,t.instrumento)}
              </select>
              <span class="pm-plan-hint">Dejar vacío si aplica a todos</span>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-fecha_inicio">Fecha de Inicio</label>
              <input type="date" class="pm-plan-input" id="pl-fecha_inicio" value="${t.fecha_inicio||``}">
            </div>
          </div>
          ${e?`
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-estado">Estado</label>
            <select class="pm-plan-select" id="pl-estado">
              <option value="planificado" ${t.estado===`planificado`?`selected`:``}>Planificado</option>
              <option value="ejecutado" ${t.estado===`ejecutado`?`selected`:``}>Ejecutado</option>
              <option value="revisado" ${t.estado===`revisado`?`selected`:``}>Revisado</option>
            </select>
          </div>
          `:``}
        </div>

        <!-- Tema y objetivos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Contenido</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-tema">Tema *</label>
            <input type="text" class="pm-plan-input" id="pl-tema" maxlength="200"
              placeholder="Ej: Introducción a la escala mayor" autocomplete="off"
              value="${H(t.tema||``)}">
            <span class="pm-plan-char-count"><span id="pl-tema-count">${(t.tema||``).length}</span>/200</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-objetivos">Objetivos</label>
            <textarea class="pm-plan-textarea" id="pl-objetivos" rows="2" maxlength="1000"
              placeholder="¿Qué quieres lograr en esta clase?">${H(t.objetivos||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obj-count">${(t.objetivos||``).length}</span>/1000</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-contenido">Contenido</label>
            <textarea class="pm-plan-textarea" id="pl-contenido" rows="3" maxlength="2000"
              placeholder="Desarrollo del tema, actividades...">${H(t.contenido||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-cont-count">${(t.contenido||``).length}</span>/2000</span>
          </div>
        </div>

        <!-- Recursos y evaluación -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Recursos y Evaluación</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-recursos">Recursos</label>
            <input type="text" class="pm-plan-input" id="pl-recursos"
              placeholder="Partitura, audio, pizarra (separados por coma)" autocomplete="off"
              value="${H(s)}">
            <span class="pm-plan-hint">Separa múltiples recursos con coma</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-evaluacion">Método de Evaluación</label>
            <textarea class="pm-plan-textarea" id="pl-evaluacion" rows="2" maxlength="500"
              placeholder="¿Cómo evaluarás el aprendizaje?">${H(t.evaluacion_metodo||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-eval-count">${(t.evaluacion_metodo||``).length}</span>/500</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-observaciones">Observaciones</label>
            <textarea class="pm-plan-textarea" id="pl-observaciones" rows="2" maxlength="1000"
              placeholder="Notas adicionales...">${H(t.observaciones||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obs-count">${(t.observaciones||``).length}</span>/1000</span>
          </div>
        </div>

        <!-- DSL Notes -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Notas DSL</h3>
          <p class="pm-plan-section-desc">Usa notación simplificada: <code>#Alumno</code> <code>[Contenido]</code> <code>(Sugerencia)</code> <code>{Tarea}</code> <code>$Medida</code> <code>&gt;Objetivo</code></p>
          <div id="dsl-editor-container"></div>
          <span class="pm-plan-dsl-summary"><span id="dsl-summary">Sin tokens</span></span>
        </div>
      </div>

      <!-- Footer -->
      <div class="pm-plan-footer">
        <button class="pm-plan-cancel-btn">Cancelar</button>
        <button class="pm-plan-save-btn">${e?`Guardar cambios`:`Guardar`}</button>
      </div>
    </div>
  `}function Ee(){return`
    .pm-plan-modal-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    .pm-plan-modal-overlay.open {
      display: flex;
      opacity: 1;
    }
    
    .pm-plan-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .pm-plan-modal {
      position: relative;
      background: var(--pm-surface);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                  0 0 0 1px var(--pm-border);
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    .pm-plan-modal-overlay.open .pm-plan-modal {
      transform: scale(1) translateY(0);
    }
    
    .pm-plan-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: var(--pm-surface-2);
      border-bottom: 1px solid var(--pm-border);
      flex-shrink: 0;
    }
    
    .pm-plan-header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    
    .pm-plan-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--pm-primary) 0%, #6366f1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .pm-plan-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--pm-text);
      margin: 0;
    }
    
    .pm-plan-subtitle {
      font-size: 0.8rem;
      color: var(--pm-text-muted);
      margin: 0.2rem 0 0;
    }
    
    .pm-plan-close-x {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--pm-surface-2);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pm-text-muted);
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    
    .pm-plan-close-x:hover {
      background: var(--pm-border);
      color: var(--pm-text);
    }
    
    .pm-plan-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    
    .pm-plan-body::-webkit-scrollbar {
      width: 6px;
    }
    
    .pm-plan-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .pm-plan-body::-webkit-scrollbar-thumb {
      background: var(--pm-border);
      border-radius: 3px;
    }
    
    .pm-plan-section {
      margin-bottom: 1.5rem;
    }
    
    .pm-plan-section:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-section-title {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
    }
    
    .pm-plan-section-desc {
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
      line-height: 1.4;
    }
    
    .pm-plan-section-desc code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.7rem;
      background: var(--pm-surface-2);
      border: 1px solid var(--pm-border);
      border-radius: 4px;
      padding: 0.1rem 0.3rem;
    }
    
    .pm-plan-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    
    .pm-plan-field {
      margin-bottom: 0.75rem;
      position: relative;
    }
    
    .pm-plan-field:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--pm-text);
      margin-bottom: 0.35rem;
    }
    
    .pm-plan-label small {
      font-weight: 400;
      color: var(--pm-text-muted);
    }
    
    .pm-plan-input,
    .pm-plan-select,
    .pm-plan-textarea {
      width: 100%;
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--pm-text);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    .pm-plan-input:focus,
    .pm-plan-select:focus,
    .pm-plan-textarea:focus {
      outline: none;
      border-color: var(--pm-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    
    .pm-plan-textarea {
      resize: vertical;
      min-height: 60px;
      line-height: 1.5;
    }
    
    .pm-plan-hint {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      margin-top: 0.25rem;
    }
    
    .pm-plan-char-count {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      text-align: right;
      margin-top: 0.2rem;
    }
    
    .pm-plan-dsl-summary {
      display: block;
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: var(--pm-surface-2);
      border-radius: 6px;
      text-align: center;
    }
    
    .pm-plan-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--pm-border);
      background: var(--pm-surface-2);
      flex-shrink: 0;
    }
    
    .pm-plan-cancel-btn {
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--pm-text);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .pm-plan-cancel-btn:hover {
      background: var(--pm-border);
    }
    
    .pm-plan-save-btn {
      background: linear-gradient(135deg, var(--pm-primary) 0%, #2563eb 100%);
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .pm-plan-save-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .pm-plan-save-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .pm-plan-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: pm-plan-spin 0.6s linear infinite;
    }
    
    @keyframes pm-plan-spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 640px) {
      .pm-plan-modal {
        max-height: 95vh;
      }
      
      .pm-plan-header {
        padding: 1rem;
      }
      
      .pm-plan-body {
        padding: 1rem;
      }
      
      .pm-plan-grid-2 {
        grid-template-columns: 1fr;
      }
      
      .pm-plan-footer {
        padding: 0.875rem 1rem;
      }
    }
  `}function De(e){[{input:`pl-tema`,count:`pl-tema-count`},{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&r.addEventListener(`input`,()=>{i.textContent=r.value.length})})}function Oe(e){[{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&(i.textContent=r.value.length)})}function V(e,t,n){let r=e.find(e=>e.id===t);return r?.instrumento?r.instrumento.split(`,`).map(e=>e.trim()).filter(Boolean).map(e=>`<option value="${H(e)}" ${n===e?`selected`:``}>${H(e)}</option>`).join(``):``}function H(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function ke(e){let t=[];return e.alumnos.length&&t.push(`${e.alumnos.length} alum.`),e.contenido.length&&t.push(`${e.contenido.length} cont.`),e.tareas.length&&t.push(`${e.tareas.length} tar.`),e.calificacion&&t.push(`${e.calificacion.valor}/${e.calificacion.sobre}`),t.length?t.join(`, `):`Sin tokens`}var Ae=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}},U={PRESENTE:`presente`,AUSENTE:`ausente`,JUSTIFICADO:`justificado`,TARDE:`tarde`},je={P:U.PRESENTE,A:U.AUSENTE,J:U.JUSTIFICADO,T:U.TARDE,presente:U.PRESENTE,ausente:U.AUSENTE,justificado:U.JUSTIFICADO,tarde:U.TARDE};function Me(e){return e?je[e]||e:U.PRESENTE}var Ne={presente:{short:`P`,label:`Presente`,css:`success`},ausente:{short:`A`,label:`Ausente`,css:`danger`},justificado:{short:`J`,label:`Justificado`,css:`warning`}};function W(e,t){throw console.error(e,t?.message),Error(e)}function Pe(e){let t=e?.message?.toLowerCase()||``;return t.includes(`unique constraint`)||t.includes(`duplicate key`)||t.includes(`uk_asistencias`)||t.includes(`unique`)&&t.includes(`duplicate`)}async function Fe({fechaInicio:t,fechaFin:n,periodoId:r,claseId:i,maestroId:a}={}){let o=e.from(`sesiones_clase`).select(`
      id,
      fecha,
      hora_inicio,
      hora_fin,
      tema_principal,
      observaciones_generales,
      estado,
      clase_id,
      clases (
        id,
        nombre,
        instrumento,
        maestro_principal_id,
        maestros!fk_clases_maestro_principal (
          id,
          nombre_completo
        )
      ),
      asistencias (
        id,
        estado
      )
    `).order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});if(t&&(o=o.gte(`fecha`,t)),n&&(o=o.lte(`fecha`,n)),i&&(o=o.eq(`clase_id`,i)),r){let{data:i}=await e.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,r).single();i&&(t||(o=o.gte(`fecha`,i.fecha_inicio)),n||(o=o.lte(`fecha`,i.fecha_fin)))}let{data:s,error:c}=await o;c&&W(`No se pudieron cargar las sesiones`,c);let l=(s||[]).map(e=>{let t=e.asistencias||[];return{sesionId:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,temaPrincipal:e.tema_principal,observacionesGenerales:e.observaciones_generales,estado:e.estado,claseId:e.clase_id,claseNombre:e.clases?.nombre??`—`,instrumento:e.clases?.instrumento??`—`,maestroId:e.clases?.maestro_principal_id??null,maestroNombre:e.clases?.maestros?.nombre_completo??`—`,totalPresentes:t.filter(e=>e.estado===U.PRESENTE).length,totalAusentes:t.filter(e=>e.estado===U.AUSENTE).length,totalJustificados:t.filter(e=>e.estado===U.JUSTIFICADO).length,totalRegistros:t.length}}),u=l;return a&&(u=l.filter(e=>e.maestroId&&e.maestroId.toString()===a.toString())),Ie(u)}function Ie(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return Array.from(t.entries()).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,sesiones:t}))}async function Le(t){t||W(`Se requiere sesionId`);let{data:n,error:r}=await e.from(`sesiones_clase`).select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `).eq(`id`,t).single();r&&W(`No se pudo cargar la sesión`,r);let{data:i,error:a}=await e.from(`asistencias`).select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,t).order(`alumnos(nombre_completo)`,{ascending:!0});a&&W(`No se pudieron cargar las asistencias`,a);let{data:o}=await e.from(`justificaciones`).select(`motivo, descripcion, archivo_url, estado, alumno_id`).eq(`sesion_id`,t),s={};o&&o.forEach(e=>{s[e.alumno_id]=e});let{data:c,error:l}=await e.from(`observaciones_alumnos`).select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,t);l&&W(`No se pudieron cargar las observaciones`,l);let{data:u,error:d}=await e.from(`contenidos_sesion`).select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `).eq(`sesion_clase_id`,t);return d&&W(`No se pudieron cargar los contenidos`,d),{sesion:{id:n.id,fecha:n.fecha,horaInicio:n.hora_inicio,horaFin:n.hora_fin,temaPrincipal:n.tema_principal,observacionesGenerales:n.observaciones_generales,estado:n.estado,claseNombre:n.clases?.nombre??`—`,instrumento:n.clases?.instrumento??`—`,maestroNombre:n.clases?.maestros?.nombre_completo??`—`},asistencias:(i||[]).map(e=>({id:e.id,estado:e.estado,justificacionTexto:e.justificacion_texto,observacion:e.observaciones,alumnoId:e.alumno_id,alumnoNombre:e.alumnos?.nombre_completo??`—`,justificacion:s[e.alumno_id]??null})),observaciones:(c||[]).map(e=>({id:e.id,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion??e.observacion,prioridad:e.prioridad,alumnoId:e.alumnos?.id,alumnoNombre:e.alumnos?.nombre_completo??`—`})),contenidos:(u||[]).map(e=>({id:e.id,descripcion:e.descripcion,nivelLogro:e.nivel_logro,planTitulo:e.planificaciones?.titulo}))}}async function Re(){let{data:t,error:n}=await e.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});return n&&W(`No se pudieron cargar los períodos`,n),t||[]}async function ze(){let{data:t,error:n}=await e.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).single();return n?null:t}async function Be(){let{data:t,error:n}=await e.from(`clases`).select(`id, nombre, instrumento`).order(`nombre`,{ascending:!0});return n&&W(`No se pudieron cargar las clases`,n),t||[]}async function Ve(t){t?.length||W(`No hay asistencias para registrar`);let n=[...new Set(t.map(e=>e.alumno_id))];n.some(e=>!e)&&W(`Todas las asistencias deben tener alumno_id`);let{data:r,error:i}=await e.from(`alumnos`).select(`id`).in(`id`,n);i&&W(`No se pudo validar alumnos en la base de datos`,i);let a=new Set(r?.map(e=>e.id)||[]),o=n.filter(e=>!a.has(e));o.length>0&&W(`Los siguientes alumnos no existen: ${o.join(`, `)}`);let s=t.filter(e=>e.sesion_clase_id?!0:(console.warn(`[asistenciasApi] Saltando alumno ${e.alumno_id} sin sesion_clase_id (se sincronizará vía offline queue)`),!1)).map(e=>{if(!e.clase_id)throw Error(`clase_id es requerido para alumno ${e.alumno_id}`);if(!e.fecha)throw Error(`fecha es requerido para alumno ${e.alumno_id}`);return{sesion_clase_id:e.sesion_clase_id,clase_id:e.clase_id,alumno_id:e.alumno_id,fecha:e.fecha,estado:Me(e.estado),justificacion_texto:(e.justificacion_texto||``).trim()||null,observaciones:(e.observaciones||``).trim()||null,...e.registrado_por?{registrado_por:e.registrado_por}:{}}});if(s.length===0)return console.warn(`[asistenciasApi] No hay registros válidos con sesion_clase_id para insertar`),[];let{data:c,error:l}=await e.from(`asistencias`).upsert(s,{onConflict:`clase_id,alumno_id,fecha`}).select();if(l&&Pe(l)){console.warn(`[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:`,l.message);let{data:t,error:n}=await e.from(`asistencias`).insert(s,{returning:`representation`}).select();return n&&W(`No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)`,l),t||[]}return l&&W(`No se pudieron registrar las asistencias`,l),c}async function He({periodoId:t,fecha:n,claseId:r}={}){try{let i,a;if(t){let{data:n,error:r}=await e.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,t).single();r&&console.warn(`No se pudo cargar el período, mostrando todas las sesiones`,r),n&&(i=n.fecha_inicio,a=n.fecha_fin)}let o=e.from(`vw_asistencias_consolidada`).select(`
        fecha,
        sesion_clase_id,
        clase_id,
        nombre_clase,
        hora_inicio,
        hora_fin,
        borrador,
        maestro_principal,
        maestro_auxiliar,
        observacion_clase,
        observacion_sesion,
        presentes,
        ausentes,
        justificados,
        total_registros,
        asistencias_detalle,
        justificaciones_detalle
      `);i&&(o=o.gte(`fecha`,i)),a&&(o=o.lte(`fecha`,a)),n&&(o=o.eq(`fecha`,n)),r&&(o=o.eq(`clase_id`,r));let{data:s,error:c}=await o.order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});c&&W(`No se pudieron cargar las sesiones consolidadas`,c),Array.isArray(s)||(console.warn(`sesiones no es un array, usando array vacío`,s),s=[]),s=s.filter(e=>e.borrador===!1);let l={};s&&s.length>0&&s.forEach(e=>{let t={clase_id:e.clase_id,clase_nombre:e.nombre_clase,fecha:e.fecha,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,maestro_nombre:e.maestro_principal||`Sin asignar`,maestro_auxiliar_nombre:e.maestro_auxiliar||null,observacion_clase:e.observacion_clase||null,observacion_sesion:e.observacion_sesion||null,presentes:e.presentes||0,ausentes:e.ausentes||0,justificados:e.justificados||0,total_alumnos:e.total_registros||0,asistencias:e.asistencias_detalle?Array.isArray(e.asistencias_detalle)?e.asistencias_detalle:JSON.parse(e.asistencias_detalle||`[]`):[],justificaciones:e.justificaciones_detalle?Array.isArray(e.justificaciones_detalle)?e.justificaciones_detalle:JSON.parse(e.justificaciones_detalle||`[]`):[]};l[e.fecha]||(l[e.fecha]=[]),l[e.fecha].push(t)});let u=Object.entries(l).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,clases:t.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``))})),d=u.flatMap(e=>e.clases);return{timelineByDate:u,resumenGlobal:{totalClases:d.length,totalPresentes:d.reduce((e,t)=>e+t.presentes,0),totalAusentes:d.reduce((e,t)=>e+t.ausentes,0),totalJustificados:d.reduce((e,t)=>e+t.justificados,0),totalRegistros:d.reduce((e,t)=>e+t.total_alumnos,0),totalSesiones:s.length}}}catch(e){W(`Error en getReporteConsolidado`,e)}}var Ue=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`],G=/^([01]\d|2[0-3]):([0-5]\d)$/;function K(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function We(e,t){let n=K(e.inicio),r=K(e.fin),i=K(t.inicio);return n<K(t.fin)&&i<r}function Ge(e,t){let n=[];for(let r=0;r<e.length;r++){let i=e[r];if(!G.test(i.inicio)||!G.test(i.fin)){n.push(`${t}: franja ${r+1} tiene formato de hora inválido (use HH:MM)`);continue}if(K(i.inicio)>=K(i.fin)){n.push(`${t}: franja ${r+1} — la hora de inicio (${i.inicio}) debe ser anterior a la de fin (${i.fin})`);continue}for(let a=r+1;a<e.length;a++)We(i,e[a])&&n.push(`${t}: las franjas ${r+1} y ${a+1} se solapan`)}return n}function Ke(e){if(!e||typeof e!=`object`)return{valid:!1,errors:[`Disponibilidad debe ser un objeto`]};let t=[];for(let[n,r]of Object.entries(e)){if(!Ue.includes(n)){t.push(`Día inválido: "${n}"`);continue}if(!Array.isArray(r)){t.push(`${n}: las franjas deben ser un array`);continue}let e=Ge(r,n);t.push(...e)}return{valid:t.length===0,errors:t}}async function qe(t,n){let r=Ke(n);if(!r.valid)return{success:!1,errors:r.errors};let{error:i}=await e.from(`maestros`).update({disponibilidad:n}).eq(`id`,t);return i?(console.error(`[DisponibilidadApi] Error updating:`,i.message),{success:!1,errors:[i.message]}):{success:!0}}async function Je(t){let n=e.from(`maestros`).select(`id, nombre_completo, especialidad, habilidades, disponibilidad`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});t?.length&&(n=n.in(`id`,t));let{data:r,error:i}=await n;if(i)throw console.error(`[DisponibilidadApi] Error fetching bulk:`,i.message),Error(`No se pudieron cargar las disponibilidades`);return r.map(e=>({id:e.id,nombre:e.nombre_completo||``,especialidad:e.especialidad||``,habilidades:Array.isArray(e.habilidades)?e.habilidades:[],disponibilidad:e.disponibilidad||{}}))}function Ye(e){if(!e||!e.trim())return null;let t=e.replace(/\D/g,``);if(t.length<7)return null;let n=t;return n.length>11&&(n=n.startsWith(`1`)?n.slice(0,11):n.slice(0,10)),n.length===11&&n.startsWith(`1`)?`+`+n:n.length===10?`+1`+n:n}function Xe(e){if(!e||!e.trim())return`—`;let t=e.replace(/\D/g,``),n=t.length===11&&t.startsWith(`1`)?t.slice(1):t.length===10?t:null;return n?`(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`:e}function Ze(e,t=``){if(!e)return null;let n=e.replace(/\D/g,``);if(n.length<7)return null;let r=`https://wa.me/${n}`;return t?`${r}?text=${encodeURIComponent(t)}`:r}function Qe(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function q(e){if(!e)return``;let t=e.split(`:`);return t.length>=2?`${t[0]}:${t[1]}`:e}function $e(e){return{activa:`Activa`,suspendida:`Suspendida`,finalizada:`Finalizada`}[e]||`Activa`}function J(e){return e&&{violin:`bi-music-note-beamed`,viola:`bi-music-note-beamed`,cello:`bi-music-note-beamed`,bajo:`bi-music-note-beamed`,guitarra:`bi-music-note-beamed`,arpa:`bi-music-note-beamed`,flauta:`bi-wind`,oboe:`bi-wind`,clarinete:`bi-wind`,fagot:`bi-wind`,trompa:`bi-wind`,trompeta:`bi-wind`,trombon:`bi-wind`,tuba:`bi-wind`,piano:`bi-piano`,percusion:`bi-disc`,voz:`bi-mic`,direccion:`bi-person-badge`,solfeo:`bi-journal-text`,teoría:`bi-book`}[e.toLowerCase()]||`bi-music-note`}function et(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function tt(e){let t=[`#007aff`,`#5856d6`,`#34c759`,`#ff3b30`,`#ff9500`,`#5ac8fa`];if(!e)return t[0];let n=0;for(let t=0;t<e.length;t++)n=e.charCodeAt(t)+((n<<5)-n);return t[Math.abs(n)%t.length]}function Y(e){if(!e)return 0;let t=e.trim(),n=!1,r=t;t.toLowerCase().includes(`pm`)?(n=!0,r=t.toLowerCase().replace(`pm`,``).trim()):t.toLowerCase().includes(`am`)&&(r=t.toLowerCase().replace(`am`,``).trim());let i=r.split(`:`),a=parseInt(i[0],10)||0,o=parseInt(i[1],10)||0;return n&&a<12?a+=12:!n&&a===12&&(a=0),a*60+o}var X=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.maestro_principal_id=e.maestro_principal_id||e.maestro_id||null,this.maestro_suplente_id=e.maestro_suplente_id||e.maestro_auxiliar_id||null,this.tiene_suplente=e.tiene_suplente||!1,this.programa_id=e.programa_id||null,this.instrumento=e.instrumento||``,this.horarios=e.horarios||[],this.capacidad_maxima=e.capacidad_maxima??e.max_alumnos??20,this.estado=e.estado||`activa`,this.descripcion=e.descripcion||e.notas_pedagogicas||``,this.tipo_clase=e.tipo_clase||`grupal`,this.nivel_id=e.nivel_id||null,this.planificacion_id=e.planificacion_id||null,this.ruta_id=e.ruta_id||null,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}get maestro_id(){return this.maestro_principal_id}set maestro_id(e){this.maestro_principal_id=e}get maestro_auxiliar_id(){return this.maestro_suplente_id}set maestro_auxiliar_id(e){this.maestro_suplente_id=e}get max_alumnos(){return this.capacidad_maxima}set max_alumnos(e){this.capacidad_maxima=e}get notas_pedagogicas(){return this.descripcion}set notas_pedagogicas(e){this.descripcion=e}validate(){let e=[];!this.nombre||!this.nombre.trim()?e.push(`El nombre es obligatorio`):this.nombre.trim().length<3?e.push(`El nombre debe tener mínimo 3 caracteres`):this.nombre.trim().length>100&&e.push(`El nombre no puede exceder 100 caracteres`),this.maestro_principal_id||e.push(`El maestro titular es obligatorio`),this.programa_id||e.push(`El programa es obligatorio`),(!this.instrumento||!this.instrumento.trim())&&e.push(`El instrumento es obligatorio`),(!this.horarios||this.horarios.length===0)&&e.push(`Debe agregar al menos un horario`);for(let t of this.horarios)t.dia||e.push(`El día es obligatorio en todos los horarios`),(!t.hora_inicio||!t.hora_fin)&&e.push(`La hora de inicio y fin son obligatorias en todos los horarios`),t.hora_inicio&&t.hora_fin&&Y(t.hora_inicio)>=Y(t.hora_fin)&&e.push(`La hora de inicio debe ser menor que la hora de fin`);let t={};this.horarios.forEach(e=>{if(!e.dia||!e.hora_inicio||!e.hora_fin)return;let n=e.dia.toLowerCase().trim();t[n]||(t[n]=[]),t[n].push(e)});for(let n in t){let r=t[n].sort((e,t)=>Y(e.hora_inicio)-Y(t.hora_inicio));for(let t=0;t<r.length-1;t++){let i=r[t],a=r[t+1];if(Y(i.hora_fin)>Y(a.hora_inicio)){let t=n.charAt(0).toUpperCase()+n.slice(1);e.push(`Existen horarios solapados en la misma clase (${t})`);break}}}return this.capacidad_maxima!==void 0&&this.capacidad_maxima!==null&&(this.capacidad_maxima<1?e.push(`El máximo de alumnos debe ser al menos 1`):this.capacidad_maxima>100&&e.push(`El máximo de alumnos no puede exceder 100`)),this.descripcion&&this.descripcion.length>1e3&&e.push(`Las notas pedagógicas no pueden exceder 1000 caracteres`),e}isCompleto(){return!!(this.nombre&&this.maestro_principal_id&&this.programa_id&&this.instrumento&&this.horarios?.length>0)}toJSON(){return{id:this.id,nombre:this.nombre.trim(),maestro_principal_id:this.maestro_principal_id,maestro_suplente_id:this.maestro_suplente_id||null,programa_id:this.programa_id,instrumento:this.instrumento.trim(),capacidad_maxima:this.capacidad_maxima,estado:this.estado,descripcion:this.descripcion.trim()||null,tipo_clase:this.tipo_clase||`grupal`,ruta_id:this.ruta_id||null}}static getEstados(){return[`activa`,`suspendida`,`finalizada`]}static getDiasSemana(){return[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`]}static getEstadoLabel(e){return{activa:`Activa`,suspendida:`Suspendida`,finalizada:`Finalizada`}[e]||e}};async function Z({salonId:t,maestroId:n,dia:r,horaInicio:i,horaFin:a,excludeClaseId:o=null}){if(!r||!i||!a)return null;let s=Y(i),c=Y(a);if(t){let{data:n,error:i}=await e.from(`clase_horarios`).select(`*, clases(nombre)`).eq(`salon_id`,t).eq(`dia`,r);if(!i&&n)for(let e of n){if(o&&e.clase_id===o)continue;let t=Y(e.hora_inicio);if(s<Y(e.hora_fin)&&t<c)return{tipo:`salón`,clase_nombre:e.clases?.nombre||`Otra clase`,detalle:`El salón ya está ocupado por "${e.clases?.nombre}"`,horario:`${e.dia} de ${q(e.hora_inicio)} a ${q(e.hora_fin)}`}}}if(n){let{data:t,error:i}=await e.from(`clase_horarios`).select(`*, clases!inner(nombre, maestro_principal_id)`).eq(`clases.maestro_principal_id`,n).eq(`dia`,r);if(!i&&t)for(let e of t){if(o&&e.clase_id===o)continue;let t=Y(e.hora_inicio);if(s<Y(e.hora_fin)&&t<c)return{tipo:`maestro`,clase_nombre:e.clases?.nombre||`Otra clase`,detalle:`El maestro ya tiene otra clase asignada ("${e.clases?.nombre}")`,horario:`${e.dia} de ${q(e.hora_inicio)} a ${q(e.hora_fin)}`}}}return null}function Q(e){return e?new X({...e,maestro_principal_id:e.maestro_principal_id??e.maestro_id??null,maestro_suplente_id:e.maestro_suplente_id??null,tiene_suplente:!!e.maestro_suplente_id,capacidad_maxima:e.capacidad_maxima??e.max_alumnos??20,descripcion:e.descripcion??e.notas_pedagogicas??``}):null}async function nt(){let{data:t,error:n}=await e.from(`clases`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando clases:`,n.message),Error(`No se pudieron cargar las clases`);let{data:r}=await e.from(`clase_horarios`).select(`*`).order(`dia`,{ascending:!0});return(t||[]).map(e=>{let t=Q(e);return t.horarios=r?.filter(t=>t.clase_id===e.id)||[],t})}async function $(t){let{data:n,error:r}=await e.from(`clases`).select(`*`).eq(`id`,t).single();if(r)throw console.error(`Error cargando clase:`,r.message),Error(`Clase no encontrada`);let{data:i}=await e.from(`clase_horarios`).select(`*`).eq(`clase_id`,t),a=Q(n);return a.horarios=i||[],a}async function rt(t,n=!1){let r=Q(t);r.horarios=t.horarios||[];let i=r.validate();if(i.length>0)throw Error(i.join(`. `));if(!n)for(let e of r.horarios){let t=await Z({salonId:e.salon_id,maestroId:r.maestro_principal_id,dia:e.dia,horaInicio:e.hora_inicio,horaFin:e.hora_fin});if(t){let e=Error(`Conflicto de ${t.tipo}: ${t.detalle} el ${t.horario}`);throw e.isConflict=!0,e.conflictData=t,e}}let a=r.toJSON();delete a.id;let{data:o,error:s}=await e.from(`clases`).insert([a]).select();if(s)throw console.error(`Error creando clase:`,s.message),Error(`No se pudo crear la clase`);let c=o[0];if(r.horarios.length>0){let t=r.horarios.map(e=>({clase_id:c.id,dia:e.dia,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,salon_id:e.salon_id||null,maestro_id:c.maestro_principal_id})),{error:n}=await e.from(`clase_horarios`).insert(t);if(n)throw console.error(`Error creando horarios:`,n.message),await e.from(`clases`).delete().eq(`id`,c.id),Error(`No se pudieron crear los horarios de la clase`);return Q({...c,horarios:t})}return Q(c)}async function it(t,n,r=!1){let i=await $(t),a=new X({...i,...n});n.horarios===void 0?a.horarios=i.horarios:a.horarios=n.horarios;let o=a.validate();if(o.length>0)throw Error(o.join(`. `));if(!r&&n.horarios)for(let e of a.horarios){let n=await Z({salonId:e.salon_id,maestroId:a.maestro_id,dia:e.dia,horaInicio:e.hora_inicio,horaFin:e.hora_fin,excludeClaseId:t});if(n){let e=Error(`Conflicto de ${n.tipo}: ${n.detalle} el ${n.horario}`);throw e.isConflict=!0,e.conflictData=n,e}}let{data:s,error:c}=await e.from(`clases`).update(a.toJSON()).eq(`id`,t).select();if(c)throw console.error(`Error actualizando clase:`,c.message),Error(`No se pudo actualizar la clase`);if(n.horarios){let{error:r}=await e.from(`clase_horarios`).delete().eq(`clase_id`,t);if(r)throw console.error(`Error eliminando horarios anteriores:`,r.message),Error(`No se pudieron actualizar los horarios de la clase`);if(n.horarios.length>0){let r=n.horarios.map(e=>({clase_id:t,dia:e.dia,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,salon_id:e.salon_id||null,maestro_id:a.maestro_principal_id})),{error:i}=await e.from(`clase_horarios`).insert(r);if(i)throw console.error(`Error insertando nuevos horarios:`,i.message),Error(`No se pudieron guardar los nuevos horarios de la clase: `+i.message)}}return $(t)}async function at(t){let{error:n}=await e.from(`clases`).delete().eq(`id`,t);if(n)throw console.error(`Error eliminando clase:`,n.message),Error(`No se pudo eliminar la clase`)}async function ot(t){let{data:n,error:r}=await e.from(`clases`).select(`
      *,
      clase_horarios ( dia, hora_inicio, hora_fin, salon_id ),
      alumnos_clases ( id )
    `).or(`maestro_principal_id.eq.${t},maestro_suplente_id.eq.${t}`).order(`nombre`,{ascending:!0});if(r)throw r;return(n||[]).map(e=>{let n=Q(e);return n.horarios=e.clase_horarios||[],n.total_alumnos=(e.alumnos_clases||[]).length,n.es_suplente=e.maestro_principal_id!==t,n})}async function st(t,n,r=null,i=null){let{data:a,error:o}=await e.from(`alumnos_clases`).insert([{clase_id:t,alumno_id:n,activo:!0,fecha_inscripcion:new Date().toISOString().split(`T`)[0],hora_inicio:r,hora_fin:i}]).select();if(o)throw o.code===`23505`?Error(`El alumno ya está inscrito en esta clase`):o;return a[0]}async function ct(t,n){let{error:r}=await e.from(`alumnos_clases`).delete().eq(`clase_id`,t).eq(`alumno_id`,n);if(r)throw r}async function lt(t,n,r,i){let{data:a,error:o}=await e.from(`alumnos_clases`).update({hora_inicio:r,hora_fin:i}).eq(`clase_id`,t).eq(`alumno_id`,n).select();if(o)throw o;return a[0]}async function ut(t){let{data:n,error:r}=await e.from(`alumnos_clases`).select(`*, alumno:alumnos(*)`).eq(`clase_id`,t).eq(`activo`,!0).order(`created_at`,{ascending:!1});if(r)throw r;return n||[]}export{S as $,Ve as A,be as B,Ne as C,Re as D,ze as E,Ce as F,A as G,I as H,L as I,x as J,oe as K,z as L,we as M,xe as N,He as O,ye as P,w as Q,R,qe as S,Le as T,ve as U,ge as V,P as W,b as X,C as Y,ae as Z,Y as _,at as a,Ze as b,nt as c,Qe as d,ie as et,q as f,J as g,et as h,ct as i,Ae as j,Fe as k,ot as l,$e as m,lt as n,a as nt,st as o,tt as p,re as q,rt as r,ut as s,it as t,ne as tt,X as u,Xe as v,Be as w,Je as x,Ye as y,Se as z};