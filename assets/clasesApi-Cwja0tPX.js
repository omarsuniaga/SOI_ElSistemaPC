import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{i as t}from"./supabase-BryBf0UA.js";import{i as n}from"./maestroAuth-BZ2ChDTg.js";import{a as r,u as i}from"./alumnosApi-CeFKHcQC.js";import{t as a}from"./clases-C8FwunQU.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function o(){let e=0;document.addEventListener(`touchstart`,t=>{t.touches.length===1&&(e=t.touches[0].clientY)},{passive:!0}),document.addEventListener(`touchmove`,t=>{if(t.touches.length===1&&t.touches[0].clientY-e>0){let e=t.target,n=!1,r=!1;for(;e&&e!==document.body&&e!==document.documentElement;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentNode;continue}let t=window.getComputedStyle(e);if(!t){e=e.parentNode;continue}let i=t.overflowY;if((i===`auto`||i===`scroll`)&&e.scrollHeight>e.clientHeight){r=!0,e.scrollTop<=0&&(n=!0);break}e=e.parentNode}r||(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop)<=0&&(n=!0),n&&t.cancelable&&t.preventDefault()}},{passive:!1})}var s={misClases:6e5,horarios:6e5,sesiones:12e4,inscripciones:6e5,salones:36e5,ausencias:12e4,metricasSesiones:12e4},c=new Map,l=new Map;function u(e){let t=l.get(e);return t?Date.now()-t.timestamp<t.ttl:!1}function d(e,t,n){c.set(e,t),l.set(e,{timestamp:Date.now(),ttl:n||6e4})}function f(e){return u(e)?c.get(e):(c.delete(e),l.delete(e),null)}function p(e,t,n){d(e,t,s[n]||6e4)}function m(e){for(let t of c.keys())t.includes(e)&&(c.delete(t),l.delete(t))}function h(){c.clear(),l.clear()}function g(e){return f(e)}function _(){return[...c.keys()]}var v={get:f,set:p,invalidate:m,invalidateAll:h,getCached:g,_keys:_},ee={MIS_CLASES:`mis_clases`,HORARIOS:`horarios`,SESIONES:`sesiones`,INSCRIPCIONES:`inscripciones`,SALONES:`salones`,AUSENCIAS:`ausencias`,RUTAS:`rutas`,EMERGENTES:`emergentes`};async function te(){let e=n();return e?.id?e.id:null}async function y(e=!1){if(typeof process<`u`&&{}.VITEST)return[{id:`550e8400-e29b-41d4-a716-446655440000`,nombre:`Violin 101`,instrumento:`Violin`,capacidad_maxima:20,maestro_principal_id:`dc73014a-9528-4081-84eb-f713b72031ff`}];let n=await te();if(!n)return[];if(!e){let e=v.getCached(`${ee.MIS_CLASES}_${n}`);if(e)return e}let{data:r,error:i}=await t.from(`clases`).select(`id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id`).or(`maestro_principal_id.eq.${n},maestro_suplente_id.eq.${n},maestro_id.eq.${n}`);if(i)return console.warn(`[MaestroData] Error cargando clases:`,i.message),[];let a=r||[];return v.set(`${ee.MIS_CLASES}_${n}`,a,`misClases`),a}async function ne(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,dia:`jueves`,hora_inicio:`08:00:00`,hora_fin:`09:00:00`,salon_id:`salon-1`}];if(!e||e.length===0)return[];let r=`horarios_${e.sort().join(`,`)}`;if(!n){let e=v.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`clase_horarios`).select(`hora_inicio, hora_fin, salon_id, clase_id, dia`).in(`clase_id`,e);if(a)return console.warn(`[MaestroData] Error cargando horarios:`,a.message),[];let o=i||[];return v.set(r,o,`horarios`),o}async function b(e,n,r,i=!1){if(!e)return[];if(!i){let t=re(e,n,r);if(t){let e=v.getCached(t);if(e)return e.filter(e=>e.fecha>=n&&e.fecha<=r)}let i=`sesiones_${e}_${n}_${r}`,a=v.getCached(i);if(a)return a}let{data:a,error:o}=await t.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,e).gte(`fecha`,n).lte(`fecha`,r);if(o)return console.warn(`[MaestroData] Error cargando sesiones:`,o.message),[];let s=a||[];return v.set(`sesiones_${e}_${n}_${r}`,s,`sesiones`),s}function re(e,t,n){let r=`sesiones_${e}_`;for(let e of ie()){if(!e.startsWith(r))continue;let i=e.replace(r,``).split(`_`);if(i.length===2){let[r,a]=i;if(r<=t&&a>=n)return e}}return null}function ie(){return v._keys?v._keys():[]}async function x(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`1`,alumnos:{id:`1`,nombre_completo:`Estudiante 1`,instrumento_principal:`Violin`}},{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`2`,alumnos:{id:`2`,nombre_completo:`Estudiante 2`,instrumento_principal:`Violin`}}];if(!e||e.length===0)return[];let r=`inscripciones_${e.sort().join(`,`)}`;if(!n){let e=v.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`alumnos_clases`).select(`clase_id, alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).in(`clase_id`,e).eq(`activo`,!0);if(a)return console.warn(`[MaestroData] Error cargando inscripciones:`,a.message),[];let o=i||[];return v.set(r,o,`inscripciones`),o}async function S(e,n=!1){if(!e||e.length===0)return[];let r=`salones_${e.sort().join(`,`)}`;if(!n){let e=v.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`salones`).select(`id, nombre`).in(`id`,e);if(a)return console.warn(`[MaestroData] Error cargando salones:`,a.message),[];let o=i||[];return v.set(r,o,`salones`),o}async function ae(){let e=await te();if(!e)return;let t=await y(),n=t.map(e=>e.id);if(n.length===0)return;let r=new Date,i=new Date(r.getFullYear(),r.getMonth(),1),a=new Date(r.getFullYear(),r.getMonth()+1,0),o=new Date(r);o.setDate(o.getDate()-28);let s=o<i?o.toISOString().split(`T`)[0]:i.toISOString().split(`T`)[0],c=a.toISOString().split(`T`)[0],[l,u,,d]=await Promise.all([ne(n),x(n),b(e,s,c),Promise.resolve(null)]),f=[...new Set(l.map(e=>e.salon_id).filter(Boolean))];f.length>0&&await S(f),console.log(`[Prefetch] Mes cargado: ${t.length} clases, ${l.length} horarios, ${u.length} inscripciones`)}async function oe(e,n){if(!e||!n)return[];let r=`emergentes_${e}_${n}`,i=v.getCached(r);if(i)return i;let{data:a,error:o}=await t.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,e).eq(`fecha`,n).order(`hora_inicio`,{ascending:!0,nullsFirst:!1});if(o)return console.warn(`[MaestroData] Error cargando clases emergentes:`,o.message),[];let s=a||[];return v.set(r,s,`emergentes`),s}function se(){v.invalidate(`mis_clases`),v.invalidate(`horarios`),v.invalidate(`inscripciones`),v.invalidate(`sesiones`)}var C=null,w=null,T=null;({init(){window.pwaInstaller=this,this._injectStyles(),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),C=e}),window.addEventListener(`appinstalled`,()=>{localStorage.setItem(`pwa-installed`,`true`),C=null})},async evaluateInsights(){let e=n();if(e?.id)try{let t=await y(),n=new Date,r=new Date(n.getTime()-10080*60*1e3),i=n.toISOString().split(`T`)[0],a=r.toISOString().split(`T`)[0],o=await b(e.id,a,i),s=[],c=(o||[]).filter(e=>e.borrador===!0);if(c.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre]));if(c.length===1){let t=c[0],n=e[t.clase_id]||`Clase`,r=t.fecha?t.fecha.split(`-`).reverse().slice(0,2).join(`/`):``,i=r?` del ${r}`:``;s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tenés el registro de ${n}${i} en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${t.clase_id}&fecha=${t.fecha}`)}})}else{let e=c[0];s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tenés ${c.length} registros de clase en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${e.clase_id}&fecha=${e.fecha}`)}})}}let l=new Set((t||[]).map(e=>e.id)),u=(o||[]).filter(e=>{if(e.fecha>=i||!l.has(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)});if(u.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre])),n=u[0],r=e[n.clase_id]||`Clase`,i=n.fecha?n.fecha.split(`-`).reverse().slice(0,2).join(`/`):``;s.push({id:`sessions-without-attendance`,priority:`high`,icon:`bi-clipboard-x-fill`,text:u.length===1?`${r} del ${i} quedó sin registrar asistencia.`:`Tenés ${u.length} clases sin asistencia registrada esta semana.`,actionLabel:`Registrar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${n.clase_id}&fecha=${n.fecha}`)}})}e.telefono||e.tlf||s.push({id:`profile-incomplete`,priority:`medium`,icon:`bi-person-exclamation`,text:`Completá tu número de teléfono en tu perfil de usuario.`,actionLabel:`Completar`,action:()=>{window.router&&window.router.navigate(`perfil`)}}),(!t||t.length===0)&&s.push({id:`no-classes-assigned`,priority:`low`,icon:`bi-info-circle-fill`,text:`No tienes clases asignadas en el sistema actualmente.`,actionLabel:`Soporte`,action:()=>{window.router&&window.router.navigate(`perfil`)}});let d=s.filter(e=>{let t=localStorage.getItem(`soi-dismissed-${e.id}`);return t?Date.now()-parseInt(t,10)>10080*60*1e3:!0});if(d.length>0){let e=d[0];if(this.currentAlertId===e.id&&this.currentAlertText===e.text)return;this._showInsightBanner(e)}else this.dismissBanner()}catch(e){console.warn(`[SmartInsights] Error al evaluar alertas:`,e)}},_showInsightBanner(e){let t=document.getElementById(`pwa-smart-banner`)||w;if(t){let n=t.querySelector(`.psb-capsule`);if(n){n.style.transition=`opacity 0.2s ease`,n.style.opacity=`0`,setTimeout(()=>{let t=n.querySelector(`.psb-severity-dot`);t&&(t.className=`psb-severity-dot ${e.priority}`,t.innerHTML=`<i class="bi ${e.icon}"></i>`);let r=n.querySelector(`.psb-title`);r&&(r.textContent=e.text);let i=n.querySelector(`#pwa-banner-action`);if(i){i.innerHTML=`<span>${e.actionLabel}</span>`;let t=i.cloneNode(!0);i.parentNode.replaceChild(t,i),t.addEventListener(`click`,()=>{e.action()})}let a=n.querySelector(`#pwa-banner-close`);if(a){let t=a.cloneNode(!0);a.parentNode.replaceChild(t,a),t.addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})}this.currentAlertId=e.id,this.currentAlertText=e.text,n.style.opacity=`1`},200);return}}w=document.createElement(`div`),w.id=`pwa-smart-banner`,w.setAttribute(`role`,`status`),w.setAttribute(`aria-live`,`polite`),w.innerHTML=`
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
    `,document.body.prepend(w),this.currentAlertId=e.id,this.currentAlertText=e.text,requestAnimationFrame(()=>{requestAnimationFrame(()=>w?.classList.add(`psb-visible`))}),document.getElementById(`pwa-banner-action`).addEventListener(`click`,()=>{e.action()}),document.getElementById(`pwa-banner-close`).addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})},dismissBanner(){if(this.currentAlertId=null,this.currentAlertText=null,!w)return;w.classList.remove(`psb-visible`);let e=w;w=null,setTimeout(()=>{e.remove()},400)},promptInstall(){/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():C?this._triggerNativeInstall():this._showDesktopGuide()},async _triggerNativeInstall(){if(!C){this._showDesktopGuide();return}try{await C.prompt();let{outcome:e}=await C.userChoice;e===`accepted`&&localStorage.setItem(`pwa-installed`,`true`)}catch(e){console.warn(`[PWA] Error al mostrar prompt:`,e)}finally{C=null}},_showIOSGuide(){if(T)return;T=document.createElement(`div`),T.id=`pwa-guide-modal`,T.innerHTML=`
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
              <span>Tocá el botón <strong>Compartir</strong> <i class="bi bi-box-arrow-up"></i> en la barra inferior de Safari</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>Deslizá hacia abajo y tocá <strong>"Añadir a pantalla de inicio"</strong></span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Presioná <strong>Añadir</strong> — la app aparecerá como un ícono nativo</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `,document.body.appendChild(T);let e=()=>{T?.classList.add(`pgm-hiding`),setTimeout(()=>{T?.remove(),T=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_showDesktopGuide(){if(T)return;T=document.createElement(`div`),T.id=`pwa-guide-modal`,T.innerHTML=`
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-display"></i>
          </div>
          <h3 id="pgm-title">Instalar como App de Escritorio</h3>
          <p class="pgm-subtitle">Accedé sin el navegador, como una app nativa</p>
          <ol class="pgm-steps">
            <li>
              <span class="pgm-step-num">1</span>
              <span>En la barra de Chrome buscá el ícono <strong>"Instalar aplicación"</strong> (ícono de pantalla con flecha)</span>
            </li>
            <li>
              <span class="pgm-step-num">2</span>
              <span>En <strong>Edge</strong>: Menú ⋯ → Apps → Instalar este sitio como app</span>
            </li>
            <li>
              <span class="pgm-step-num">3</span>
              <span>Confirmá la instalación — SOI Maestros quedará en tu escritorio y barra de tareas</span>
            </li>
          </ol>
          <button class="pgm-btn" id="pgm-close">Entendido</button>
        </div>
      </div>
    `,document.body.appendChild(T);let e=()=>{T?.classList.add(`pgm-hiding`),setTimeout(()=>{T?.remove(),T=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_isStandalone(){return window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`},_injectStyles(){if(document.getElementById(`pwa-installer-styles`))return;let e=document.createElement(`style`);e.id=`pwa-installer-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}}).init();var ce=class{constructor(e=`default`){this.scope=e,this.subscriptions=[],this.intervals=[],this.listeners=[]}registerChannel(e){e&&!this.subscriptions.includes(e)&&this.subscriptions.push(e)}registerInterval(e){e!==null&&!this.intervals.includes(e)&&this.intervals.push(e)}registerListener(e,t,n){e&&t&&n&&this.listeners.push({el:e,event:t,fn:n})}destroy(){this.subscriptions.forEach(e=>{try{e&&t.removeChannel(e)}catch(e){console.warn(`[LifecycleManager] Error removing channel (${this.scope}):`,e)}}),this.intervals.forEach(e=>{try{clearInterval(e)}catch(e){console.warn(`[LifecycleManager] Error clearing interval (${this.scope}):`,e)}}),this.listeners.forEach(({el:e,event:t,fn:n})=>{try{e&&t&&n&&e.removeEventListener(t,n)}catch(e){console.warn(`[LifecycleManager] Error removing listener (${this.scope}):`,e)}}),this.subscriptions=[],this.intervals=[],this.listeners=[],console.log(`[LifecycleManager] Cleanup completed for scope: ${this.scope}`)}},E=class e{constructor(e={}){this.id=e.id||null,this.clase_id=e.clase_id||null,this.maestro_id=e.maestro_id||null,this.fecha_inicio=e.fecha_inicio||null,this.tema=e.tema||``,this.objetivos=e.objetivos||``,this.contenido=e.contenido||``,this.recursos=Array.isArray(e.recursos)?e.recursos:[],this.evaluacion_metodo=e.evaluacion_metodo||``,this.observaciones=e.observaciones||``,this.notas_dsl=e.notas_dsl||``,this.estado=e.estado||`planificado`,this.instrumento=e.instrumento||null,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null,this.clase_nombre=e.clase_nombre||null,this.maestro_nombre=e.maestro_nombre||null}validate(){let t=[];return!this.tema||!this.tema.trim()?t.push(`El tema es obligatorio`):this.tema.trim().length<3?t.push(`El tema debe tener mínimo 3 caracteres`):this.tema.trim().length>200&&t.push(`El tema no puede exceder 200 caracteres`),this.clase_id||t.push(`La clase es obligatoria`),this.objetivos&&this.objetivos.length>1e3&&t.push(`Los objetivos no pueden exceder 1000 caracteres`),this.contenido&&this.contenido.length>2e3&&t.push(`El contenido no puede exceder 2000 caracteres`),this.evaluacion_metodo&&this.evaluacion_metodo.length>500&&t.push(`El método de evaluación no puede exceder 500 caracteres`),this.observaciones&&this.observaciones.length>1e3&&t.push(`Las observaciones no pueden exceder 1000 caracteres`),this.instrumento&&this.instrumento.length>100&&t.push(`El instrumento no puede exceder 100 caracteres`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}canEdit(){return this.estado===`planificado`||this.estado===`ejecutado`}canApprove(){return this.estado===`ejecutado`}isLocked(){return this.estado===`revisado`}static getEstados(){return[{value:`planificado`,label:`Planificado`,color:`bg-primary`},{value:`ejecutado`,label:`Ejecutado`,color:`bg-success`},{value:`revisado`,label:`Revisado`,color:`bg-info`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_inicio:this.fecha_inicio,tema:this.tema.trim(),objetivos:this.objetivos.trim()||null,contenido:this.contenido.trim()||null,recursos:this.recursos,evaluacion_metodo:this.evaluacion_metodo.trim()||null,observaciones:this.observaciones.trim()||null,notas_dsl:this.notas_dsl||null,estado:this.estado,instrumento:this.instrumento?.trim()||null}}},D={alumnos:/#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,calificacion:/(\d)\/(\d)/g};function O(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)r[1]&&n.push(r[1].trim());return n}function le(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function k(e){return!e||typeof e!=`string`?{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[]}:{alumnos:O(e,D.alumnos),contenido:O(e,D.contenido),sugerencias:O(e,D.sugerencias),tareas:O(e,D.tareas),medidas:O(e,D.medidas),calificacion:le(e),objetivos:O(e,D.objetivos)}}function A(e){if(!e)return``;let t=e;return t=t.replace(D.calificacion,(e,t,n)=>`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`),t=t.replace(D.objetivos,(e,t)=>`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">__OBJ_START__${t}__OBJ_END__</span>`),t=t.replace(D.alumnos,(e,t)=>`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`),t=t.replace(D.contenido,(e,t)=>`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`),t=t.replace(D.sugerencias,(e,t)=>`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`),t=t.replace(D.tareas,(e,t)=>`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`),t=t.replace(D.medidas,(e,t)=>`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`),t=ue(t),t=t.replace(/__OBJ_START__/g,`&gt;`),t=t.replace(/__OBJ_END__/g,``),t}function ue(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var de=175,fe=[`Ejemplo:`,`#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica`,`#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5`,``,`Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo`].join(`
`),j=null,M=``;function pe(e=``,t=null){let n=document.createElement(`div`);n.className=`dsl-editor-container`;let r=document.createElement(`div`);r.className=`dsl-editor-wrapper position-relative`;let i=document.createElement(`div`);i.className=`dsl-editor form-control`,i.contentEditable=`true`,i.spellcheck=`false`,i.setAttribute(`data-placeholder`,fe),i.innerHTML=e?A(e):``;let a=document.createElement(`div`);a.className=`dsl-highlight-layer position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(a),r.appendChild(i),n.appendChild(r),me();function o(){return i.innerText||i.textContent||``}function s(){let e=o();e!==M&&(M=e,a.innerHTML=A(e)+`<br>`)}function c(){a.scrollTop=i.scrollTop,a.scrollLeft=i.scrollLeft}function l(){clearTimeout(j),j=setTimeout(()=>{s();let e=k(o());t&&t(o(),e)},de)}function u(e){e.key===`Tab`&&(e.preventDefault(),document.execCommand(`insertText`,!1,`  `))}function d(){c()}i.addEventListener(`input`,l),i.addEventListener(`keydown`,u),i.addEventListener(`scroll`,d),i.addEventListener(`focus`,()=>{n.classList.add(`focused`)}),i.addEventListener(`blur`,()=>{n.classList.remove(`focused`),s()});function f(e){i.innerHTML=e?A(e):``,M=o(),a.innerHTML=A(M)+`<br>`}function p(){return o()}function m(){return k(o())}function h(){i.focus()}function g(e){i.focus(),document.execCommand(`insertText`,!1,e)}function _(e,t=``){i.focus();let n=window.getSelection();if(!n.rangeCount)return;let r=n.getRangeAt(0);r.deleteContents();let a=document.createTextNode(e),s=document.createTextNode(t);r.insertNode(a),r.collapse(!1),r.insertNode(s),r.setStartAfter(a),r.setEndAfter(a),n.removeAllRanges(),n.addRange(r),M=o()}return n.component={element:n,editor:i,setContent:f,getContent:p,getParsed:m,focus:h,insertText:g,insertAtCursor:_},n.setContent=f,n.getContent=p,n.getParsed=m,n.focus=h,n.insertText=g,n.insertAtCursor=_,e&&(M=e),n}function me(){if(document.getElementById(`dsl-editor-styles`))return;let e=document.createElement(`style`);e.id=`dsl-editor-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function he(e={}){let{onAlumnoClick:t=null,onGrabarClick:n=null,onEnriquecerClick:r=null,editor:i=null}=e,a=document.createElement(`div`);return a.className=`dsl-toolbar btn-group btn-group-sm me-2`,[{id:`alumno`,icon:`#`,label:`Alumno`,title:`Insertar mention de alumno`,className:`btn btn-outline-primary`,action:()=>{t?t(i):i&&i.insertAtCursor(`#`,``)}},{id:`contenido`,icon:`[]`,label:`Contenido`,title:`Insertar contenido`,className:`btn btn-outline-success`,action:()=>{i&&i.insertAtCursor(`[`,`]`)}},{id:`sugerencia`,icon:`()`,label:`Sugerencia`,title:`Insertar sugerencia`,className:`btn btn-outline-warning`,action:()=>{i&&i.insertAtCursor(`(`,`)`)}},{id:`tarea`,icon:`{}`,label:`Tarea`,title:`Insertar tarea`,className:`btn btn-outline-purple`,action:()=>{i&&i.insertAtCursor(`{`,`}`)}},{id:`medida`,icon:`$`,label:`Medida`,title:`Insertar medida técnica`,className:`btn btn-outline-info`,action:()=>{i&&i.insertAtCursor(`$`,``)}},{id:`calificacion`,icon:`4/5`,label:`Calificación`,title:`Insertar calificación`,className:`btn btn-outline-danger`,action:()=>{i&&i.insertText(`4/5`)}},{id:`objetivo`,icon:`>`,label:`Objetivo`,title:`Insertar referencia a objetivo`,className:`btn btn-outline-secondary`,action:()=>{i&&i.insertAtCursor(`>`,``)}},{id:`grabar`,icon:`🎤`,label:`Grabar`,title:`Grabar audio (placeholder)`,className:`btn btn-outline-dark`,action:()=>{n&&n(i)}},{id:`enriquecer`,icon:`✨`,label:`IA`,title:`Enriquecer con IA (placeholder)`,className:`btn btn-outline-dark`,action:()=>{r&&r(i)}}].forEach(e=>{let t=document.createElement(`button`);t.className=e.className,t.type=`button`,t.title=e.title,t.innerHTML=`<span class="dsl-toolbar-btn">${e.icon}</span>`,t.addEventListener(`click`,t=>{t.preventDefault(),e.action()}),a.appendChild(t)}),ge(),a}function ge(){if(document.getElementById(`dsl-toolbar-styles`))return;let e=document.createElement(`style`);e.id=`dsl-toolbar-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function _e(e={}){let{initialContent:t=``,onChange:n=null,onAlumnoClick:r=null,onGrabarClick:i=null,onEnriquecerClick:a=null}=e,o=document.createElement(`div`);o.className=`dsl-editor-with-toolbar`;let s=pe(t,n),c=he({onAlumnoClick:r,onGrabarClick:i,onEnriquecerClick:a,editor:s});return o.appendChild(c),o.appendChild(s),o.container=o,o}function ve(e={}){let{onSelect:t=null,onClose:n=null}=e,i=new Set,a=``,o=document.createElement(`div`);o.className=`modal fade`,o.setAttribute(`tabindex`,`-1`),o.setAttribute(`role`,`dialog`),o.innerHTML=`
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
  `;let s=o.querySelector(`.search-input`),c=o.querySelector(`.alumno-list`),l=o.querySelector(`.confirm-btn`),u=o.querySelector(`.cancel-btn`);async function d(){let e=await r();f(a?e.filter(e=>e.nombre_completo.toLowerCase().includes(a.toLowerCase())):e)}function f(e){if(c.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`text-center text-muted py-4`,e.textContent=`No se encontraron alumnos`,c.appendChild(e);return}e.forEach(e=>{let t=document.createElement(`label`);t.className=`list-group-item d-flex align-items-center gap-2 cursor-pointer`,t.style.cursor=`pointer`;let n=document.createElement(`input`);n.type=`checkbox`,n.className=`form-check-input`,n.checked=i.has(e.id),n.value=e.id;let r=document.createElement(`div`);r.className=`flex-grow-1`,r.innerHTML=`
        <div class="fw-medium">${N(e.nombre_completo)}</div>
        <small class="text-muted">${N(e.instrumento_principal)}</small>
      `,t.appendChild(n),t.appendChild(r),n.addEventListener(`change`,()=>{n.checked?i.add(e.id):i.delete(e.id)}),t.addEventListener(`click`,e=>{e.target!==n&&(n.checked=!n.checked,n.dispatchEvent(new Event(`change`)))}),c.appendChild(t)})}s.addEventListener(`input`,e=>{a=e.target.value,d()}),l.addEventListener(`click`,()=>{t&&t(Array.from(i)),m()}),u.addEventListener(`click`,()=>{n&&n(),m()});function p(){i.clear(),a=``,s.value=``;let e=new bootstrap.Modal(o);e.show(),d(),o.bsModal=e}function m(){o.bsModal&&o.bsModal.hide()}return o.openModal=p,o.closeModal=m,o}function N(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function ye(e,n){let r=t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);e&&(r=r.eq(`instrumento`,e)),n&&(r=r.eq(`nivel`,n));let{data:i,error:a}=await r.maybeSingle();if(a)throw a;return i||null}async function be(){let{data:e,error:n}=await t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(n)throw n;return(e||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function P({instrumento:e,nivel:n,descripcion:r}){let{data:i,error:a}=await t.from(`curriculos`).insert({instrumento:e,nivel:n,descripcion:r}).select().single();if(a)throw a;return i}async function xe(e,n){let{data:r,error:i}=await t.from(`curriculos`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function Se(e,t){return xe(e,{activo:t})}async function F(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_pilares`).insert({curriculo_id:e,nombre:n,orden:r}).select().single();if(a)throw a;return i}async function Ce(e,n){let{data:r,error:i}=await t.from(`curriculo_pilares`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function we(e){let{error:n}=await t.from(`curriculo_pilares`).delete().eq(`id`,e);if(n)throw n}async function I(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_objetivos`).insert({pilar_id:e,descripcion:n,orden:r}).select().single();if(a)throw a;return i}async function Te(e,n){let{data:r,error:i}=await t.from(`curriculo_objetivos`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function Ee(e){let{error:n}=await t.from(`curriculo_objetivos`).delete().eq(`id`,e);if(n)throw n}async function De({instrumento:e,nivel:t,descripcion:n,pilares:r}){if(!e||e.trim()===``)throw Error(`El instrumento es obligatorio para crear el plan.`);if(!r||r.length===0)throw Error(`La propuesta debe tener al menos un pilar.`);let i=await P({instrumento:e.trim(),nivel:t?.trim()||``,descripcion:n?.trim()||`Plan generado por IA`}),a=[];for(let e=0;e<r.length;e++){let t=r[e],n=await F(i.id,t.nombre||`Pilar ${e+1}`,e),o=t.objetivos||[];for(let e=0;e<o.length;e++){let t=await I(n.id,o[e].descripcion||`Objetivo ${e+1}`,e);a.push({id:t.id,descripcion:t.descripcion})}}return{curriculo:i,allObjetivos:a}}var Oe=e({actualizarPlanificacion:()=>L,crearPlanificacion:()=>Me,eliminarPlanificacion:()=>Ne,marcarEjecutada:()=>Fe,marcarRevisada:()=>Pe,marcarRevisadasMasivo:()=>R,obtenerClases:()=>Ie,obtenerCoberturaCurricular:()=>ze,obtenerMaestro:()=>Le,obtenerPlanificacion:()=>Ae,obtenerPlanificaciones:()=>ke,obtenerPlanificacionesConDetalles:()=>je,obtenerSesiones:()=>Re});async function ke(e=null){let n=t.from(`planificaciones`).select(`*`);e&&(n=n.eq(`maestro_id`,e));let{data:r,error:i}=await n.order(`created_at`,{ascending:!1});if(i)throw i;return(r||[]).map(e=>new E(e))}async function Ae(e){let{data:n,error:r}=await t.from(`planificaciones`).select(`*`).eq(`id`,e).single();if(r)throw r;return new E(n)}async function je(e=null){let n=t.from(`planificaciones`).select(`
    *,
    clase:clases (nombre),
    maestro:maestros (nombre_completo)
  `);e&&(n=n.eq(`maestro_id`,e));let{data:r,error:i}=await n.order(`created_at`,{ascending:!1});if(i)throw console.error(`Error cargando planificaciones:`,i.message),Error(`No se pudieron cargar las planificaciones`);return r.map(e=>new E({...e,clase_nombre:e.clase?.nombre||`Sin asignar`,maestro_nombre:e.maestro?.nombre_completo||`Sin asignar`}))}async function Me(e){let n=new E(e),r=n.validate();if(r.length>0)throw Error(r.join(`. `));let{data:i,error:a}=await t.from(`planificaciones`).insert([n.toJSON()]).select();if(a)throw a;return new E(i[0])}async function L(e,n){let{data:r}=await t.from(`planificaciones`).select(`*`).eq(`id`,e).single(),i=new E({...r,...n}),a=i.validate();if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`planificaciones`).update(i.toJSON()).eq(`id`,e).select();if(s)throw s;return new E(o[0])}async function Ne(e){let{error:n}=await t.from(`planificaciones`).delete().eq(`id`,e);if(n)throw n}async function R(e){if(!e||!e.length)return[];let{data:n,error:r}=await t.from(`planificaciones`).update({estado:`revisado`}).in(`id`,e).select();if(r)throw r;return(n||[]).map(e=>new E(e))}async function Pe(e){return(await R([e]))[0]||null}async function Fe(e){return L(e,{estado:`ejecutado`})}async function Ie(){let{data:e,error:n}=await t.from(`clases`).select(`*`).order(`nombre`);if(n)throw n;return e||[]}async function Le(e){let{data:n,error:r}=await t.from(`maestros`).select(`*`).eq(`id`,e).single();if(r)throw r;return n}async function Re(e,n,r){let i=t.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,e);n&&(i=i.gte(`fecha`,n)),r&&(i=i.lte(`fecha`,r));let{data:a,error:o}=await i.order(`fecha`,{ascending:!1});if(o)throw o;return a||[]}async function ze(e=null){let n=t.from(`clases`).select(`
      id,
      nombre,
      instrumento,
      maestro_id,
      maestro:maestros ( nombre_completo ),
      planificaciones ( id, estado, tema, updated_at )
    `).eq(`activo`,!0).order(`nombre`,{ascending:!0});e&&(n=n.eq(`maestro_id`,e));let{data:r,error:i}=await n;if(i)throw Error(`Error cargando cobertura curricular: ${i.message}`);return(r||[]).map(e=>{let t=Array.isArray(e.planificaciones)?e.planificaciones:[],n=t.length>0?t[0]:null;return{clase_id:e.id,clase_nombre:e.nombre||`Sin nombre`,instrumento:e.instrumento||`General`,maestro_id:e.maestro_id,maestro_nombre:e.maestro?.nombre_completo||`Sin asignar`,tiene_plan:!!n,plan_id:n?.id??null,plan_estado:n?.estado??null,plan_tema:n?.tema??null,plan_updated_at:n?.updated_at??null}})}var Be={planificaciones:[{id:`plan_001`,clase_id:`clase_001`,maestro_id:`maestro_001`,fecha_inicio:`2026-05-11`,tema:`Escala de Do Mayor - ejercicios de arco`,objetivos:`Que el alumno ejecute la escala de Do Mayor en primera posición con arco parejo.`,contenido:`Calentamiento: arcos largos en cuerdas al aire. Escala de Do Mayor dos octavas. Ejercicio de cambio de cuerda.`,recursos:[`Violín`,`Arco`,`Atril`,`Partitura`],evaluacion_metodo:`Observación directa de la ejecución`,observaciones:`Recordar a los alumnos traer partitura la próxima clase.`,notas_dsl:`# Observaciones individuales
- alumno:"Juan Pérez" asiste:true ejecuta:regular
- alumno:"María García" asiste:true ejecuta:bien
- alumno:"Pedro López" asiste:false justifica:enfermedad`,estado:`planificado`,instrumento:`Violín`,created_at:`2026-05-08T10:00:00Z`,updated_at:`2026-05-08T10:00:00Z`},{id:`plan_002`,clase_id:`clase_002`,maestro_id:`maestro_002`,fecha_inicio:`2026-05-12`,tema:`Arpegios en tonalidades mayores`,objetivos:`Fortalecer la digitación de arpegios en Do, Sol y Fa mayor.`,contenido:`Ejercicios de digitación. Arpegio de Do Mayor (inversiones). Arpegio de Sol Mayor. Arpegio de Fa Mayor. Práctica de pieza asignada.`,recursos:[`Piano`,`Banco`,`Partitura`],evaluacion_metodo:`Ejecución individual de cada arpegio`,observaciones:``,notas_dsl:`# Registro de clase
- pieza:"Sonatina Op.36 No.1" avance:65%
- técnica:escala_cromática velocidad:🟡 medio`,estado:`ejecutado`,instrumento:`Piano`,created_at:`2026-05-08T10:30:00Z`,updated_at:`2026-05-12T18:00:00Z`},{id:`plan_003`,clase_id:`clase_003`,maestro_id:`maestro_001`,fecha_inicio:`2026-05-07`,tema:`Técnica de rasgueo - patrones avanzados`,objetivos:`Dominar 4 patrones de rasgueo distintos. Preparar pieza de examen.`,contenido:`Revisión de patrones básicos. Introducción a rasgueo sincopado. Patrones con acentos. Práctica de 'Recuerdos de la Alhambra' (adaptación).`,recursos:[`Guitarra`,`Cejilla`,`Púa`],evaluacion_metodo:`Grabación de ejecución para autoevaluación`,observaciones:`Próxima clase: ensayo general para recital.`,notas_dsl:`# Evaluación alumnos
- alumno:"Carlos Ruiz" nivel:🟢 avanzado pieza:lista
- alumno:"Ana Torres" nivel:🟡 medio necesita:cejilla
- alumno:"Luis Méndez" nivel:🔴 principiante observa:ritmo_inestable`,estado:`revisado`,instrumento:`Guitarra`,created_at:`2026-05-05T09:00:00Z`,updated_at:`2026-05-08T15:00:00Z`},{id:`plan_004`,clase_id:`clase_004`,maestro_id:`maestro_003`,fecha_inicio:`2026-05-13`,tema:`Ejercicios de respiración y embocadura`,objetivos:`Mejorar la capacidad pulmonar y la calidad del sonido en la flauta traversera.`,contenido:`Respiración diafragmática. Ejercicios de sonido prolongado. Escala cromática en toda la extensión. Dinámicas (piano/forte).`,recursos:[`Flauta traversera`,`Atril`,`Metrónomo`],evaluacion_metodo:`Medición de duración de sonido continuo`,observaciones:`Algunos alumnos necesitan refuerzo en digitación de notas agudas.`,notas_dsl:``,estado:`planificado`,instrumento:`Flauta`,created_at:`2026-05-08T11:00:00Z`,updated_at:`2026-05-08T11:00:00Z`},{id:`plan_005`,clase_id:`clase_005`,maestro_id:`maestro_004`,fecha_inicio:`2026-05-06`,tema:`Montaje de repertorio coral - canción 2`,objetivos:`Aprender la segunda canción del repertorio de fin de semestre por secciones.`,contenido:`Calentamiento vocal (15 min). Trabajo por cuerdas: sopranos, altos, tenores. Ensamblaje completo de la obra. Trabajo de dinámicas y expresión.`,recursos:[`Piano`,`Partituras`,`Atriles`],evaluacion_metodo:`Ensayo general con grabación`,observaciones:`Distribuir partituras con 1 semana de anticipación.`,notas_dsl:`# Asistencia
- total_alumnos:22 presentes:20 ausentes:2
- ausente:"Sofía Martínez" justifica:ciática
- ausente:"Diego Ramírez" justifica:examen_escuela`,estado:`ejecutado`,instrumento:`Voz`,created_at:`2026-05-04T08:00:00Z`,updated_at:`2026-05-06T18:30:00Z`}]},z=[{id:`maestro_001`,nombre_completo:`Carlos Méndez`,email:`carlos.mendez@instituto.edu`,especialidad:`Violín`,instrumentos:[`Violín`,`Viola`],estado:`activo`,created_at:`2025-01-15T08:00:00Z`},{id:`maestro_002`,nombre_completo:`María Torres`,email:`maria.torres@instituto.edu`,especialidad:`Piano`,instrumentos:[`Piano`,`Teclado`],estado:`activo`,created_at:`2025-02-01T08:00:00Z`},{id:`maestro_003`,nombre_completo:`José Ramírez`,email:`jose.ramirez@instituto.edu`,especialidad:`Flauta`,instrumentos:[`Flauta traversera`,`Flautín`],estado:`activo`,created_at:`2025-01-20T08:00:00Z`},{id:`maestro_004`,nombre_completo:`Luisa Fernanda Díaz`,email:`luisa.diaz@instituto.edu`,especialidad:`Voz`,instrumentos:[`Voz`,`Coro`],estado:`activo`,created_at:`2025-03-10T08:00:00Z`}],Ve=e({actualizarPlanificacion:()=>Ke,crearPlanificacion:()=>Ge,eliminarPlanificacion:()=>qe,marcarEjecutada:()=>Xe,marcarRevisada:()=>Ye,marcarRevisadasMasivo:()=>Je,obtenerClases:()=>Ze,obtenerCoberturaCurricular:()=>et,obtenerMaestro:()=>Qe,obtenerPlanificacion:()=>Ue,obtenerPlanificaciones:()=>He,obtenerPlanificacionesConDetalles:()=>We,obtenerSesiones:()=>$e}),B=`planificaciones_demo`,V=1,H=null;function U(){if(H===null){try{let e=localStorage.getItem(B);if(e){let t=JSON.parse(e);if(t&&t.schemaVersion===V&&Array.isArray(t.planificaciones)){H=t.planificaciones;return}}}catch{}H=(Be.planificaciones||[]).map(e=>({...e})),W()}}function W(){try{localStorage.setItem(B,JSON.stringify({schemaVersion:V,planificaciones:H}))}catch(e){console.warn(`[planificacionMock] Failed to persist to localStorage:`,e.message)}}function G(e=150){return new Promise(t=>setTimeout(t,e))}async function He(e=null){await G(),U();let t=H;return e&&(t=t.filter(t=>t.maestro_id===e)),t.sort((e,t)=>new Date(t.created_at||0)-new Date(e.created_at||0)).map(e=>new E(e))}async function Ue(e){await G(),U();let t=H.find(t=>t.id===e);if(!t)throw Error(`Planificación no encontrada`);return new E(t)}async function We(e=null){await G(),U();let t=H;e&&(t=t.filter(t=>t.maestro_id===e));let n=a?.clases||[],r=z||[];return t.sort((e,t)=>new Date(t.created_at||0)-new Date(e.created_at||0)).map(e=>new E({...e,clase_nombre:n.find(t=>t.id===e.clase_id)?.nombre||`Sin asignar`,maestro_nombre:r.find(t=>t.id===e.maestro_id)?.nombre_completo||`Sin asignar`}))}async function Ge(e){await G(),U();let t=new E(e),n=t.validate();if(n.length>0)throw Error(n.join(`. `));let r=new Date().toISOString(),i={...t.toJSON(),id:`plan_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,created_at:r,updated_at:r};return H.push(i),W(),new E(i)}async function Ke(e,t){await G(),U();let n=H.findIndex(t=>t.id===e);if(n===-1)throw Error(`Planificación no encontrada`);let r=new E({...H[n],...t}),i=r.validate();if(i.length>0)throw Error(i.join(`. `));let a={...H[n],...r.toJSON(),id:H[n].id,created_at:H[n].created_at,updated_at:new Date().toISOString()};return H[n]=a,W(),new E(a)}async function qe(e){await G(),U();let t=H.findIndex(t=>t.id===e);if(t===-1)throw Error(`Planificación no encontrada`);H.splice(t,1),W()}async function Je(e){if(await G(),U(),!e||!e.length)return[];let t=[];for(let n of e){let e=H.findIndex(e=>e.id===n);e!==-1&&(H[e]={...H[e],estado:`revisado`,updated_at:new Date().toISOString()},t.push(new E(H[e])))}return t.length>0&&W(),t}async function Ye(e){return(await Je([e]))[0]||null}async function Xe(e){return Ke(e,{estado:`ejecutado`})}async function Ze(){return await G(),[...a?.clases||[]].sort((e,t)=>(e.nombre||``).localeCompare(t.nombre||``))}async function Qe(e){await G();let t=(z||[]).find(t=>t.id===e);if(!t)throw Error(`Maestro no encontrado`);return{...t}}async function $e(e,t,n){return await G(),[]}async function et(e=null){await G(),U();let t=a?.clases||[],n=z||[];return(e?t.filter(t=>t.maestro_id===e):t).map(e=>{let t=H.find(t=>t.clase_id===e.id)??null,r=n.find(t=>t.id===e.maestro_id);return{clase_id:e.id,clase_nombre:e.nombre||`Sin nombre`,instrumento:e.instrumento||`General`,maestro_id:e.maestro_id,maestro_nombre:r?.nombre_completo||`Sin asignar`,tiene_plan:!!t,plan_id:t?.id??null,plan_estado:t?.estado??null,plan_tema:t?.tema??null,plan_updated_at:t?.updated_at??null}})}var K=i.isDemoMode?Ve:Oe,tt=e=>K.obtenerPlanificaciones(e),nt=e=>K.obtenerPlanificacion(e),rt=e=>K.obtenerPlanificacionesConDetalles(e),it=e=>K.crearPlanificacion(e),at=(e,t)=>K.actualizarPlanificacion(e,t),ot=e=>K.eliminarPlanificacion(e),st=e=>K.marcarRevisadasMasivo(e),ct=()=>K.obtenerClases(),lt=e=>K.obtenerCoberturaCurricular(e),ut=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}},q={PRESENTE:`presente`,AUSENTE:`ausente`,JUSTIFICADO:`justificado`,TARDE:`tarde`},dt={P:q.PRESENTE,A:q.AUSENTE,J:q.JUSTIFICADO,T:q.TARDE,presente:q.PRESENTE,ausente:q.AUSENTE,justificado:q.JUSTIFICADO,tarde:q.TARDE};function ft(e){return e?dt[e]||e:q.PRESENTE}var pt={presente:{short:`P`,label:`Presente`,css:`success`},ausente:{short:`A`,label:`Ausente`,css:`danger`},justificado:{short:`J`,label:`Justificado`,css:`warning`}};function J(e,t){throw console.error(e,t?.message),Error(e)}function mt(e){let t=e?.message?.toLowerCase()||``;return t.includes(`unique constraint`)||t.includes(`duplicate key`)||t.includes(`uk_asistencias`)||t.includes(`unique`)&&t.includes(`duplicate`)}async function ht({fechaInicio:e,fechaFin:n,periodoId:r,claseId:i,maestroId:a}={}){let o=t.from(`sesiones_clase`).select(`
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
    `).order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});if(e&&(o=o.gte(`fecha`,e)),n&&(o=o.lte(`fecha`,n)),i&&(o=o.eq(`clase_id`,i)),r){let{data:i}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,r).single();i&&(e||(o=o.gte(`fecha`,i.fecha_inicio)),n||(o=o.lte(`fecha`,i.fecha_fin)))}let{data:s,error:c}=await o;c&&J(`No se pudieron cargar las sesiones`,c);let l=(s||[]).map(e=>{let t=e.asistencias||[];return{sesionId:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,temaPrincipal:e.tema_principal,observacionesGenerales:e.observaciones_generales,estado:e.estado,claseId:e.clase_id,claseNombre:e.clases?.nombre??`—`,instrumento:e.clases?.instrumento??`—`,maestroId:e.clases?.maestro_principal_id??null,maestroNombre:e.clases?.maestros?.nombre_completo??`—`,totalPresentes:t.filter(e=>e.estado===q.PRESENTE).length,totalAusentes:t.filter(e=>e.estado===q.AUSENTE).length,totalJustificados:t.filter(e=>e.estado===q.JUSTIFICADO).length,totalRegistros:t.length}}),u=l;return a&&(u=l.filter(e=>e.maestroId&&e.maestroId.toString()===a.toString())),gt(u)}function gt(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return Array.from(t.entries()).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,sesiones:t}))}async function _t(e){e||J(`Se requiere sesionId`);let{data:n,error:r}=await t.from(`sesiones_clase`).select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `).eq(`id`,e).single();r&&J(`No se pudo cargar la sesión`,r);let{data:i,error:a}=await t.from(`asistencias`).select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e).order(`alumnos(nombre_completo)`,{ascending:!0});a&&J(`No se pudieron cargar las asistencias`,a);let{data:o}=await t.from(`justificaciones`).select(`motivo, descripcion, archivo_url, estado, alumno_id`).eq(`sesion_id`,e),s={};o&&o.forEach(e=>{s[e.alumno_id]=e});let{data:c,error:l}=await t.from(`observaciones_alumnos`).select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e);l&&J(`No se pudieron cargar las observaciones`,l);let{data:u,error:d}=await t.from(`contenidos_sesion`).select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `).eq(`sesion_clase_id`,e);return d&&J(`No se pudieron cargar los contenidos`,d),{sesion:{id:n.id,fecha:n.fecha,horaInicio:n.hora_inicio,horaFin:n.hora_fin,temaPrincipal:n.tema_principal,observacionesGenerales:n.observaciones_generales,estado:n.estado,claseNombre:n.clases?.nombre??`—`,instrumento:n.clases?.instrumento??`—`,maestroNombre:n.clases?.maestros?.nombre_completo??`—`},asistencias:(i||[]).map(e=>({id:e.id,estado:e.estado,justificacionTexto:e.justificacion_texto,observacion:e.observaciones,alumnoId:e.alumno_id,alumnoNombre:e.alumnos?.nombre_completo??`—`,justificacion:s[e.alumno_id]??null})),observaciones:(c||[]).map(e=>({id:e.id,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion??e.observacion,prioridad:e.prioridad,alumnoId:e.alumnos?.id,alumnoNombre:e.alumnos?.nombre_completo??`—`})),contenidos:(u||[]).map(e=>({id:e.id,descripcion:e.descripcion,nivelLogro:e.nivel_logro,planTitulo:e.planificaciones?.titulo}))}}async function vt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});return n&&J(`No se pudieron cargar los períodos`,n),e||[]}async function yt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).single();return n?null:e}async function bt(){let{data:e,error:n}=await t.from(`clases`).select(`id, nombre, instrumento`).order(`nombre`,{ascending:!0});return n&&J(`No se pudieron cargar las clases`,n),e||[]}async function xt(e){e?.length||J(`No hay asistencias para registrar`);let n=[...new Set(e.map(e=>e.alumno_id))];n.some(e=>!e)&&J(`Todas las asistencias deben tener alumno_id`);let{data:r,error:i}=await t.from(`alumnos`).select(`id`).in(`id`,n);i&&J(`No se pudo validar alumnos en la base de datos`,i);let a=new Set(r?.map(e=>e.id)||[]),o=n.filter(e=>!a.has(e));o.length>0&&J(`Los siguientes alumnos no existen: ${o.join(`, `)}`);let s=e.filter(e=>e.sesion_clase_id?!0:(console.warn(`[asistenciasApi] Saltando alumno ${e.alumno_id} sin sesion_clase_id (se sincronizará vía offline queue)`),!1)).map(e=>{if(!e.clase_id)throw Error(`clase_id es requerido para alumno ${e.alumno_id}`);if(!e.fecha)throw Error(`fecha es requerido para alumno ${e.alumno_id}`);return{sesion_clase_id:e.sesion_clase_id,clase_id:e.clase_id,alumno_id:e.alumno_id,fecha:e.fecha,estado:ft(e.estado),justificacion_texto:(e.justificacion_texto||``).trim()||null,observaciones:(e.observaciones||``).trim()||null,...e.registrado_por?{registrado_por:e.registrado_por}:{}}});if(s.length===0)return console.warn(`[asistenciasApi] No hay registros válidos con sesion_clase_id para insertar`),[];let{data:c,error:l}=await t.from(`asistencias`).upsert(s,{onConflict:`clase_id,alumno_id,fecha`}).select();if(l&&mt(l)){console.warn(`[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:`,l.message);let{data:e,error:n}=await t.from(`asistencias`).insert(s,{returning:`representation`}).select();return n&&J(`No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)`,l),e||[]}return l&&J(`No se pudieron registrar las asistencias`,l),c}async function St({periodoId:e,fecha:n,claseId:r}={}){try{let i,a;if(e){let{data:n,error:r}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,e).single();r&&console.warn(`No se pudo cargar el período, mostrando todas las sesiones`,r),n&&(i=n.fecha_inicio,a=n.fecha_fin)}let o=t.from(`vw_asistencias_consolidada`).select(`
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
      `);i&&(o=o.gte(`fecha`,i)),a&&(o=o.lte(`fecha`,a)),n&&(o=o.eq(`fecha`,n)),r&&(o=o.eq(`clase_id`,r));let{data:s,error:c}=await o.order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});c&&J(`No se pudieron cargar las sesiones consolidadas`,c),Array.isArray(s)||(console.warn(`sesiones no es un array, usando array vacío`,s),s=[]),s=s.filter(e=>e.borrador===!1);let l={};s&&s.length>0&&s.forEach(e=>{let t={clase_id:e.clase_id,clase_nombre:e.nombre_clase,fecha:e.fecha,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,maestro_nombre:e.maestro_principal||`Sin asignar`,maestro_auxiliar_nombre:e.maestro_auxiliar||null,observacion_clase:e.observacion_clase||null,observacion_sesion:e.observacion_sesion||null,presentes:e.presentes||0,ausentes:e.ausentes||0,justificados:e.justificados||0,total_alumnos:e.total_registros||0,asistencias:e.asistencias_detalle?Array.isArray(e.asistencias_detalle)?e.asistencias_detalle:JSON.parse(e.asistencias_detalle||`[]`):[],justificaciones:e.justificaciones_detalle?Array.isArray(e.justificaciones_detalle)?e.justificaciones_detalle:JSON.parse(e.justificaciones_detalle||`[]`):[]};l[e.fecha]||(l[e.fecha]=[]),l[e.fecha].push(t)});let u=Object.entries(l).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,clases:t.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``))})),d=u.flatMap(e=>e.clases);return{timelineByDate:u,resumenGlobal:{totalClases:d.length,totalPresentes:d.reduce((e,t)=>e+t.presentes,0),totalAusentes:d.reduce((e,t)=>e+t.ausentes,0),totalJustificados:d.reduce((e,t)=>e+t.justificados,0),totalRegistros:d.reduce((e,t)=>e+t.total_alumnos,0),totalSesiones:s.length}}}catch(e){J(`Error en getReporteConsolidado`,e)}}var Ct=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`],wt=/^([01]\d|2[0-3]):([0-5]\d)$/;function Y(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function Tt(e,t){let n=Y(e.inicio),r=Y(e.fin),i=Y(t.inicio);return n<Y(t.fin)&&i<r}function Et(e,t){let n=[];for(let r=0;r<e.length;r++){let i=e[r];if(!wt.test(i.inicio)||!wt.test(i.fin)){n.push(`${t}: franja ${r+1} tiene formato de hora inválido (use HH:MM)`);continue}if(Y(i.inicio)>=Y(i.fin)){n.push(`${t}: franja ${r+1} — la hora de inicio (${i.inicio}) debe ser anterior a la de fin (${i.fin})`);continue}for(let a=r+1;a<e.length;a++)Tt(i,e[a])&&n.push(`${t}: las franjas ${r+1} y ${a+1} se solapan`)}return n}function Dt(e){if(!e||typeof e!=`object`)return{valid:!1,errors:[`Disponibilidad debe ser un objeto`]};let t=[];for(let[n,r]of Object.entries(e)){if(!Ct.includes(n)){t.push(`Día inválido: "${n}"`);continue}if(!Array.isArray(r)){t.push(`${n}: las franjas deben ser un array`);continue}let e=Et(r,n);t.push(...e)}return{valid:t.length===0,errors:t}}async function Ot(e,n){let r=Dt(n);if(!r.valid)return{success:!1,errors:r.errors};let{error:i}=await t.from(`maestros`).update({disponibilidad:n}).eq(`id`,e);return i?(console.error(`[DisponibilidadApi] Error updating:`,i.message),{success:!1,errors:[i.message]}):{success:!0}}async function kt(e){let n=t.from(`maestros`).select(`id, nombre_completo, especialidad, habilidades, disponibilidad`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});e?.length&&(n=n.in(`id`,e));let{data:r,error:i}=await n;if(i)throw console.error(`[DisponibilidadApi] Error fetching bulk:`,i.message),Error(`No se pudieron cargar las disponibilidades`);return r.map(e=>({id:e.id,nombre:e.nombre_completo||``,especialidad:e.especialidad||``,habilidades:Array.isArray(e.habilidades)?e.habilidades:[],disponibilidad:e.disponibilidad||{}}))}function At(e){if(!e||!e.trim())return null;let t=e.replace(/\D/g,``);if(t.length<7)return null;let n=t;return n.length>11&&(n=n.startsWith(`1`)?n.slice(0,11):n.slice(0,10)),n.length===11&&n.startsWith(`1`)?`+`+n:n.length===10?`+1`+n:n}function jt(e){if(!e||!e.trim())return`—`;let t=e.replace(/\D/g,``),n=t.length===11&&t.startsWith(`1`)?t.slice(1):t.length===10?t:null;return n?`(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`:e}function Mt(e,t=``){if(!e)return null;let n=e.replace(/\D/g,``);if(n.length<7)return null;let r=`https://wa.me/${n}`;return t?`${r}?text=${encodeURIComponent(t)}`:r}function Nt(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function X(e){if(!e)return``;let t=e.split(`:`);return t.length>=2?`${t[0]}:${t[1]}`:e}function Pt(e){return{activa:`Activa`,suspendida:`Suspendida`,finalizada:`Finalizada`}[e]||`Activa`}function Ft(e){return e&&{violin:`bi-music-note-beamed`,viola:`bi-music-note-beamed`,cello:`bi-music-note-beamed`,bajo:`bi-music-note-beamed`,guitarra:`bi-music-note-beamed`,arpa:`bi-music-note-beamed`,flauta:`bi-wind`,oboe:`bi-wind`,clarinete:`bi-wind`,fagot:`bi-wind`,trompa:`bi-wind`,trompeta:`bi-wind`,trombon:`bi-wind`,tuba:`bi-wind`,piano:`bi-piano`,percusion:`bi-disc`,voz:`bi-mic`,direccion:`bi-person-badge`,solfeo:`bi-journal-text`,teoría:`bi-book`}[e.toLowerCase()]||`bi-music-note`}function It(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function Lt(e){let t=[`#007aff`,`#5856d6`,`#34c759`,`#ff3b30`,`#ff9500`,`#5ac8fa`];if(!e)return t[0];let n=0;for(let t=0;t<e.length;t++)n=e.charCodeAt(t)+((n<<5)-n);return t[Math.abs(n)%t.length]}function Z(e){if(!e)return 0;let t=e.trim(),n=!1,r=t;t.toLowerCase().includes(`pm`)?(n=!0,r=t.toLowerCase().replace(`pm`,``).trim()):t.toLowerCase().includes(`am`)&&(r=t.toLowerCase().replace(`am`,``).trim());let i=r.split(`:`),a=parseInt(i[0],10)||0,o=parseInt(i[1],10)||0;return n&&a<12?a+=12:!n&&a===12&&(a=0),a*60+o}var Q=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.maestro_principal_id=e.maestro_principal_id||e.maestro_id||null,this.maestro_suplente_id=e.maestro_suplente_id||e.maestro_auxiliar_id||null,this.tiene_suplente=e.tiene_suplente||!1,this.programa_id=e.programa_id||null,this.instrumento=e.instrumento||``,this.horarios=e.horarios||[],this.capacidad_maxima=e.capacidad_maxima??e.max_alumnos??20,this.estado=e.estado||`activa`,this.descripcion=e.descripcion||e.notas_pedagogicas||``,this.tipo_clase=e.tipo_clase||`grupal`,this.nivel_id=e.nivel_id||null,this.planificacion_id=e.planificacion_id||null,this.ruta_id=e.ruta_id||null,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}get maestro_id(){return this.maestro_principal_id}set maestro_id(e){this.maestro_principal_id=e}get maestro_auxiliar_id(){return this.maestro_suplente_id}set maestro_auxiliar_id(e){this.maestro_suplente_id=e}get max_alumnos(){return this.capacidad_maxima}set max_alumnos(e){this.capacidad_maxima=e}get notas_pedagogicas(){return this.descripcion}set notas_pedagogicas(e){this.descripcion=e}validate(){let e=[];!this.nombre||!this.nombre.trim()?e.push(`El nombre es obligatorio`):this.nombre.trim().length<3?e.push(`El nombre debe tener mínimo 3 caracteres`):this.nombre.trim().length>100&&e.push(`El nombre no puede exceder 100 caracteres`),this.maestro_principal_id||e.push(`El maestro titular es obligatorio`),this.programa_id||e.push(`El programa es obligatorio`),(!this.instrumento||!this.instrumento.trim())&&e.push(`El instrumento es obligatorio`),(!this.horarios||this.horarios.length===0)&&e.push(`Debe agregar al menos un horario`);for(let t of this.horarios)t.dia||e.push(`El día es obligatorio en todos los horarios`),(!t.hora_inicio||!t.hora_fin)&&e.push(`La hora de inicio y fin son obligatorias en todos los horarios`),t.hora_inicio&&t.hora_fin&&Z(t.hora_inicio)>=Z(t.hora_fin)&&e.push(`La hora de inicio debe ser menor que la hora de fin`);let t={};this.horarios.forEach(e=>{if(!e.dia||!e.hora_inicio||!e.hora_fin)return;let n=e.dia.toLowerCase().trim();t[n]||(t[n]=[]),t[n].push(e)});for(let n in t){let r=t[n].sort((e,t)=>Z(e.hora_inicio)-Z(t.hora_inicio));for(let t=0;t<r.length-1;t++){let i=r[t],a=r[t+1];if(Z(i.hora_fin)>Z(a.hora_inicio)){let t=n.charAt(0).toUpperCase()+n.slice(1);e.push(`Existen horarios solapados en la misma clase (${t})`);break}}}return this.capacidad_maxima!==void 0&&this.capacidad_maxima!==null&&(this.capacidad_maxima<1?e.push(`El máximo de alumnos debe ser al menos 1`):this.capacidad_maxima>100&&e.push(`El máximo de alumnos no puede exceder 100`)),this.descripcion&&this.descripcion.length>1e3&&e.push(`Las notas pedagógicas no pueden exceder 1000 caracteres`),e}isCompleto(){return!!(this.nombre&&this.maestro_principal_id&&this.programa_id&&this.instrumento&&this.horarios?.length>0)}toJSON(){return{id:this.id,nombre:this.nombre.trim(),maestro_principal_id:this.maestro_principal_id,maestro_suplente_id:this.maestro_suplente_id||null,programa_id:this.programa_id,instrumento:this.instrumento.trim(),capacidad_maxima:this.capacidad_maxima,estado:this.estado,descripcion:this.descripcion.trim()||null,tipo_clase:this.tipo_clase||`grupal`,ruta_id:this.ruta_id||null}}static getEstados(){return[`activa`,`suspendida`,`finalizada`]}static getDiasSemana(){return[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`]}static getEstadoLabel(e){return{activa:`Activa`,suspendida:`Suspendida`,finalizada:`Finalizada`}[e]||e}};async function Rt({salonId:e,maestroId:n,dia:r,horaInicio:i,horaFin:a,excludeClaseId:o=null}){if(!r||!i||!a)return null;let s=Z(i),c=Z(a);if(e){let{data:n,error:i}=await t.from(`clase_horarios`).select(`*, clases(nombre)`).eq(`salon_id`,e).eq(`dia`,r);if(!i&&n)for(let e of n){if(o&&e.clase_id===o)continue;let t=Z(e.hora_inicio);if(s<Z(e.hora_fin)&&t<c)return{tipo:`salón`,clase_nombre:e.clases?.nombre||`Otra clase`,detalle:`El salón ya está ocupado por "${e.clases?.nombre}"`,horario:`${e.dia} de ${X(e.hora_inicio)} a ${X(e.hora_fin)}`}}}if(n){let{data:e,error:i}=await t.from(`clase_horarios`).select(`*, clases!inner(nombre, maestro_principal_id)`).eq(`clases.maestro_principal_id`,n).eq(`dia`,r);if(!i&&e)for(let t of e){if(o&&t.clase_id===o)continue;let e=Z(t.hora_inicio);if(s<Z(t.hora_fin)&&e<c)return{tipo:`maestro`,clase_nombre:t.clases?.nombre||`Otra clase`,detalle:`El maestro ya tiene otra clase asignada ("${t.clases?.nombre}")`,horario:`${t.dia} de ${X(t.hora_inicio)} a ${X(t.hora_fin)}`}}}return null}function $(e){return e?new Q({...e,maestro_principal_id:e.maestro_principal_id??e.maestro_id??null,maestro_suplente_id:e.maestro_suplente_id??null,tiene_suplente:!!e.maestro_suplente_id,capacidad_maxima:e.capacidad_maxima??e.max_alumnos??20,descripcion:e.descripcion??e.notas_pedagogicas??``}):null}async function zt(){let{data:e,error:n}=await t.from(`clases`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando clases:`,n.message),Error(`No se pudieron cargar las clases`);let{data:r}=await t.from(`clase_horarios`).select(`*`).order(`dia`,{ascending:!0});return(e||[]).map(e=>{let t=$(e);return t.horarios=r?.filter(t=>t.clase_id===e.id)||[],t})}async function Bt(e){let{data:n,error:r}=await t.from(`clases`).select(`*`).eq(`id`,e).single();if(r)throw console.error(`Error cargando clase:`,r.message),Error(`Clase no encontrada`);let{data:i}=await t.from(`clase_horarios`).select(`*`).eq(`clase_id`,e),a=$(n);return a.horarios=i||[],a}async function Vt(e,n=!1){let r=$(e);r.horarios=e.horarios||[];let i=r.validate();if(i.length>0)throw Error(i.join(`. `));if(!n)for(let e of r.horarios){let t=await Rt({salonId:e.salon_id,maestroId:r.maestro_principal_id,dia:e.dia,horaInicio:e.hora_inicio,horaFin:e.hora_fin});if(t){let e=Error(`Conflicto de ${t.tipo}: ${t.detalle} el ${t.horario}`);throw e.isConflict=!0,e.conflictData=t,e}}let a=r.toJSON();delete a.id;let{data:o,error:s}=await t.from(`clases`).insert([a]).select();if(s)throw console.error(`Error creando clase:`,s.message),Error(`No se pudo crear la clase`);let c=o[0];if(r.horarios.length>0){let e=r.horarios.map(e=>({clase_id:c.id,dia:e.dia,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,salon_id:e.salon_id||null,maestro_id:c.maestro_principal_id})),{error:n}=await t.from(`clase_horarios`).insert(e);if(n)throw console.error(`Error creando horarios:`,n.message),await t.from(`clases`).delete().eq(`id`,c.id),Error(`No se pudieron crear los horarios de la clase`);return $({...c,horarios:e})}return $(c)}async function Ht(e,n,r=!1){let i=await Bt(e),a=new Q({...i,...n});n.horarios===void 0?a.horarios=i.horarios:a.horarios=n.horarios;let o=a.validate();if(o.length>0)throw Error(o.join(`. `));if(!r&&n.horarios)for(let t of a.horarios){let n=await Rt({salonId:t.salon_id,maestroId:a.maestro_id,dia:t.dia,horaInicio:t.hora_inicio,horaFin:t.hora_fin,excludeClaseId:e});if(n){let e=Error(`Conflicto de ${n.tipo}: ${n.detalle} el ${n.horario}`);throw e.isConflict=!0,e.conflictData=n,e}}let{data:s,error:c}=await t.from(`clases`).update(a.toJSON()).eq(`id`,e).select();if(c)throw console.error(`Error actualizando clase:`,c.message),Error(`No se pudo actualizar la clase`);if(n.horarios){let{error:r}=await t.from(`clase_horarios`).delete().eq(`clase_id`,e);if(r)throw console.error(`Error eliminando horarios anteriores:`,r.message),Error(`No se pudieron actualizar los horarios de la clase`);if(n.horarios.length>0){let r=n.horarios.map(t=>({clase_id:e,dia:t.dia,hora_inicio:t.hora_inicio,hora_fin:t.hora_fin,salon_id:t.salon_id||null,maestro_id:a.maestro_principal_id})),{error:i}=await t.from(`clase_horarios`).insert(r);if(i)throw console.error(`Error insertando nuevos horarios:`,i.message),Error(`No se pudieron guardar los nuevos horarios de la clase: `+i.message)}}return Bt(e)}async function Ut(e){let{error:n}=await t.from(`clases`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando clase:`,n.message),Error(`No se pudo eliminar la clase`)}async function Wt(e){let{data:n,error:r}=await t.from(`clases`).select(`
      *,
      clase_horarios ( dia, hora_inicio, hora_fin, salon_id ),
      alumnos_clases ( id )
    `).or(`maestro_principal_id.eq.${e},maestro_suplente_id.eq.${e}`).order(`nombre`,{ascending:!0});if(r)throw r;return(n||[]).map(t=>{let n=$(t);return n.horarios=t.clase_horarios||[],n.total_alumnos=(t.alumnos_clases||[]).length,n.es_suplente=t.maestro_principal_id!==e,n})}async function Gt(e,n,r=null,i=null){let{data:a,error:o}=await t.from(`alumnos_clases`).insert([{clase_id:e,alumno_id:n,activo:!0,fecha_inscripcion:new Date().toISOString().split(`T`)[0],hora_inicio:r,hora_fin:i}]).select();if(o)throw o.code===`23505`?Error(`El alumno ya está inscrito en esta clase`):o;return a[0]}async function Kt(e,n){let{error:r}=await t.from(`alumnos_clases`).delete().eq(`clase_id`,e).eq(`alumno_id`,n);if(r)throw r}async function qt(e,n,r,i){let{data:a,error:o}=await t.from(`alumnos_clases`).update({hora_inicio:r,hora_fin:i}).eq(`clase_id`,e).eq(`alumno_id`,n).select();if(o)throw o;return a[0]}async function Jt(e){let{data:n,error:r}=await t.from(`alumnos_clases`).select(`*, alumno:alumnos(*)`).eq(`clase_id`,e).eq(`activo`,!0).order(`created_at`,{ascending:!1});if(r)throw r;return n||[]}export{_e as $,xt as A,rt as B,pt as C,vt as D,yt as E,st as F,I as G,Ce as H,ct as I,we as J,F as K,lt as L,at as M,it as N,St as O,ot as P,ve as Q,nt as R,Ot as S,_t as T,De as U,Te as V,P as W,ye as X,be as Y,Se as Z,Z as _,Ut as a,x as at,Mt as b,zt as c,b as ct,Nt as d,o as dt,k as et,X as f,Ft as g,It as h,Kt as i,ne as it,ut as j,ht as k,Wt as l,se as lt,Pt as m,qt as n,ce as nt,Gt as o,y as ot,Lt as p,Ee as q,Vt as r,oe as rt,Jt as s,S as st,Ht as t,E as tt,Q as u,ae as ut,jt as v,bt as w,kt as x,At as y,tt as z};