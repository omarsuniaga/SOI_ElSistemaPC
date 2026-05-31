const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-C6WUHrjo.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CsoeaaUJ.js","assets/typeof-C7CwdyHk.js","assets/jspdf.plugin.autotable-BYntMLuC.js","assets/alumnos-GmOXYzgJ.js","assets/clases-B84PNoYk.js","assets/sesiones-DT2wzp6f.js","assets/cumplimientoMaestrosWidget-EfZFh2_Y.js","assets/supabase-DJmkTfk1.js","assets/cumplimientoMaestrosWidget-BlUYKlE2.css","assets/analyticsFillingBehaviorWidget-jvxTQK6x.js","assets/analyticsFillingBehaviorWidget-uKNaEzXM.css"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{i as t}from"./supabase-DJmkTfk1.js";import{r as n}from"./maestroAuth-BmUoS2wq.js";import{n as r}from"./vendor-BhXhnmkW.js";import{t as i}from"./AppToast-BOjiJExQ.js";import{t as a}from"./preload-helper-CsoeaaUJ.js";import{t as o}from"./AppModal-DIPPctm9.js";import{t as s}from"./alumnos-GmOXYzgJ.js";import{t as c}from"./router-CcRIuSbB.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function l(){let e=0;document.addEventListener(`touchstart`,t=>{t.touches.length===1&&(e=t.touches[0].clientY)},{passive:!0}),document.addEventListener(`touchmove`,t=>{if(t.touches.length===1&&t.touches[0].clientY-e>0){let e=t.target,n=!1,r=!1;for(;e&&e!==document.body&&e!==document.documentElement;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentNode;continue}let t=window.getComputedStyle(e);if(!t){e=e.parentNode;continue}let i=t.overflowY;if((i===`auto`||i===`scroll`)&&e.scrollHeight>e.clientHeight){r=!0,e.scrollTop<=0&&(n=!0);break}e=e.parentNode}r||(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop)<=0&&(n=!0),n&&t.cancelable&&t.preventDefault()}},{passive:!1})}var u={misClases:6e5,horarios:6e5,sesiones:12e4,inscripciones:6e5,salones:36e5,ausencias:12e4,metricasSesiones:12e4},d=new Map,f=new Map;function p(e){let t=f.get(e);return t?Date.now()-t.timestamp<t.ttl:!1}function m(e,t,n){d.set(e,t),f.set(e,{timestamp:Date.now(),ttl:n||6e4})}function h(e){return p(e)?d.get(e):(d.delete(e),f.delete(e),null)}function ee(e,t,n){m(e,t,u[n]||6e4)}function te(e){for(let t of d.keys())t.includes(e)&&(d.delete(t),f.delete(t))}function ne(){d.clear(),f.clear()}function re(e){return h(e)}function ie(){return[...d.keys()]}var g={get:h,set:ee,invalidate:te,invalidateAll:ne,getCached:re,_keys:ie},ae={MIS_CLASES:`mis_clases`,HORARIOS:`horarios`,SESIONES:`sesiones`,INSCRIPCIONES:`inscripciones`,SALONES:`salones`,AUSENCIAS:`ausencias`,RUTAS:`rutas`,EMERGENTES:`emergentes`};async function oe(){let e=n();return e?.id?e.id:null}async function se(e=!1){if(typeof process<`u`&&{}.VITEST)return[{id:`550e8400-e29b-41d4-a716-446655440000`,nombre:`Violin 101`,instrumento:`Violin`,capacidad_maxima:20,maestro_principal_id:`dc73014a-9528-4081-84eb-f713b72031ff`}];let n=await oe();if(!n)return[];if(!e){let e=g.getCached(`${ae.MIS_CLASES}_${n}`);if(e)return e}let{data:r,error:i}=await t.from(`clases`).select(`id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id`).or(`maestro_principal_id.eq.${n},maestro_suplente_id.eq.${n},maestro_id.eq.${n}`);if(i)return console.warn(`[MaestroData] Error cargando clases:`,i.message),[];let a=r||[];return g.set(`${ae.MIS_CLASES}_${n}`,a,`misClases`),a}async function ce(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,dia:`jueves`,hora_inicio:`08:00:00`,hora_fin:`09:00:00`,salon_id:`salon-1`}];if(!e||e.length===0)return[];let r=`horarios_${e.sort().join(`,`)}`;if(!n){let e=g.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`clase_horarios`).select(`hora_inicio, hora_fin, salon_id, clase_id, dia`).in(`clase_id`,e);if(a)return console.warn(`[MaestroData] Error cargando horarios:`,a.message),[];let o=i||[];return g.set(r,o,`horarios`),o}async function le(e,n,r,i=!1){if(!e)return[];if(!i){let t=ue(e,n,r);if(t){let e=g.getCached(t);if(e)return e.filter(e=>e.fecha>=n&&e.fecha<=r)}let i=`sesiones_${e}_${n}_${r}`,a=g.getCached(i);if(a)return a}let{data:a,error:o}=await t.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,e).gte(`fecha`,n).lte(`fecha`,r);if(o)return console.warn(`[MaestroData] Error cargando sesiones:`,o.message),[];let s=a||[];return g.set(`sesiones_${e}_${n}_${r}`,s,`sesiones`),s}function ue(e,t,n){let r=`sesiones_${e}_`;for(let e of de()){if(!e.startsWith(r))continue;let i=e.replace(r,``).split(`_`);if(i.length===2){let[r,a]=i;if(r<=t&&a>=n)return e}}return null}function de(){return g._keys?g._keys():[]}async function fe(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`1`,alumnos:{id:`1`,nombre_completo:`Estudiante 1`,instrumento_principal:`Violin`}},{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`2`,alumnos:{id:`2`,nombre_completo:`Estudiante 2`,instrumento_principal:`Violin`}}];if(!e||e.length===0)return[];let r=`inscripciones_${e.sort().join(`,`)}`;if(!n){let e=g.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`alumnos_clases`).select(`clase_id, alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).in(`clase_id`,e).eq(`activo`,!0);if(a)return console.warn(`[MaestroData] Error cargando inscripciones:`,a.message),[];let o=i||[];return g.set(r,o,`inscripciones`),o}async function pe(e,n=!1){if(!e||e.length===0)return[];let r=`salones_${e.sort().join(`,`)}`;if(!n){let e=g.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`salones`).select(`id, nombre`).in(`id`,e);if(a)return console.warn(`[MaestroData] Error cargando salones:`,a.message),[];let o=i||[];return g.set(r,o,`salones`),o}async function me(){let e=await oe();if(!e)return;let t=await se(),n=t.map(e=>e.id);if(n.length===0)return;let r=new Date,i=new Date(r.getFullYear(),r.getMonth(),1),a=new Date(r.getFullYear(),r.getMonth()+1,0),o=new Date(r);o.setDate(o.getDate()-28);let s=o<i?o.toISOString().split(`T`)[0]:i.toISOString().split(`T`)[0],c=a.toISOString().split(`T`)[0],[l,u,,d]=await Promise.all([ce(n),fe(n),le(e,s,c),Promise.resolve(null)]),f=[...new Set(l.map(e=>e.salon_id).filter(Boolean))];f.length>0&&await pe(f),console.log(`[Prefetch] Mes cargado: ${t.length} clases, ${l.length} horarios, ${u.length} inscripciones`)}async function he(e,n){if(!e||!n)return[];let r=`emergentes_${e}_${n}`,i=g.getCached(r);if(i)return i;let{data:a,error:o}=await t.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,e).eq(`fecha`,n).order(`hora_inicio`,{ascending:!0,nullsFirst:!1});if(o)return console.warn(`[MaestroData] Error cargando clases emergentes:`,o.message),[];let s=a||[];return g.set(r,s,`emergentes`),s}function ge(){g.invalidate(`mis_clases`),g.invalidate(`horarios`),g.invalidate(`inscripciones`),g.invalidate(`sesiones`)}var _=null,v=null,y=null;({init(){window.pwaInstaller=this,this._injectStyles(),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),_=e}),window.addEventListener(`appinstalled`,()=>{localStorage.setItem(`pwa-installed`,`true`),_=null})},async evaluateInsights(){let e=n();if(e?.id)try{let t=await se(),n=new Date,r=new Date(n.getTime()-10080*60*1e3),i=n.toISOString().split(`T`)[0],a=r.toISOString().split(`T`)[0],o=await le(e.id,a,i),s=[],c=(o||[]).filter(e=>e.borrador===!0);if(c.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre]));if(c.length===1){let t=c[0],n=e[t.clase_id]||`Clase`,r=t.fecha?t.fecha.split(`-`).reverse().slice(0,2).join(`/`):``,i=r?` del ${r}`:``;s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tenés el registro de ${n}${i} en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${t.clase_id}&fecha=${t.fecha}`)}})}else{let e=c[0];s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tenés ${c.length} registros de clase en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${e.clase_id}&fecha=${e.fecha}`)}})}}let l=new Set((t||[]).map(e=>e.id)),u=(o||[]).filter(e=>{if(e.fecha>=i||!l.has(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)});if(u.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre])),n=u[0],r=e[n.clase_id]||`Clase`,i=n.fecha?n.fecha.split(`-`).reverse().slice(0,2).join(`/`):``;s.push({id:`sessions-without-attendance`,priority:`high`,icon:`bi-clipboard-x-fill`,text:u.length===1?`${r} del ${i} quedó sin registrar asistencia.`:`Tenés ${u.length} clases sin asistencia registrada esta semana.`,actionLabel:`Registrar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${n.clase_id}&fecha=${n.fecha}`)}})}e.telefono||e.tlf||s.push({id:`profile-incomplete`,priority:`medium`,icon:`bi-person-exclamation`,text:`Completá tu número de teléfono en tu perfil de usuario.`,actionLabel:`Completar`,action:()=>{window.router&&window.router.navigate(`perfil`)}}),(!t||t.length===0)&&s.push({id:`no-classes-assigned`,priority:`low`,icon:`bi-info-circle-fill`,text:`No tienes clases asignadas en el sistema actualmente.`,actionLabel:`Soporte`,action:()=>{window.router&&window.router.navigate(`perfil`)}});let d=s.filter(e=>{let t=localStorage.getItem(`soi-dismissed-${e.id}`);return t?Date.now()-parseInt(t,10)>10080*60*1e3:!0});if(d.length>0){let e=d[0];if(this.currentAlertId===e.id&&this.currentAlertText===e.text)return;this._showInsightBanner(e)}else this.dismissBanner()}catch(e){console.warn(`[SmartInsights] Error al evaluar alertas:`,e)}},_showInsightBanner(e){let t=document.getElementById(`pwa-smart-banner`)||v;if(t){let n=t.querySelector(`.psb-capsule`);if(n){n.style.transition=`opacity 0.2s ease`,n.style.opacity=`0`,setTimeout(()=>{let t=n.querySelector(`.psb-severity-dot`);t&&(t.className=`psb-severity-dot ${e.priority}`,t.innerHTML=`<i class="bi ${e.icon}"></i>`);let r=n.querySelector(`.psb-title`);r&&(r.textContent=e.text);let i=n.querySelector(`#pwa-banner-action`);if(i){i.innerHTML=`<span>${e.actionLabel}</span>`;let t=i.cloneNode(!0);i.parentNode.replaceChild(t,i),t.addEventListener(`click`,()=>{e.action()})}let a=n.querySelector(`#pwa-banner-close`);if(a){let t=a.cloneNode(!0);a.parentNode.replaceChild(t,a),t.addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})}this.currentAlertId=e.id,this.currentAlertText=e.text,n.style.opacity=`1`},200);return}}v=document.createElement(`div`),v.id=`pwa-smart-banner`,v.setAttribute(`role`,`status`),v.setAttribute(`aria-live`,`polite`),v.innerHTML=`
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
    `,document.body.prepend(v),this.currentAlertId=e.id,this.currentAlertText=e.text,requestAnimationFrame(()=>{requestAnimationFrame(()=>v?.classList.add(`psb-visible`))}),document.getElementById(`pwa-banner-action`).addEventListener(`click`,()=>{e.action()}),document.getElementById(`pwa-banner-close`).addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})},dismissBanner(){if(this.currentAlertId=null,this.currentAlertText=null,!v)return;v.classList.remove(`psb-visible`);let e=v;v=null,setTimeout(()=>{e.remove()},400)},promptInstall(){/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():_?this._triggerNativeInstall():this._showDesktopGuide()},async _triggerNativeInstall(){if(!_){this._showDesktopGuide();return}try{await _.prompt();let{outcome:e}=await _.userChoice;e===`accepted`&&localStorage.setItem(`pwa-installed`,`true`)}catch(e){console.warn(`[PWA] Error al mostrar prompt:`,e)}finally{_=null}},_showIOSGuide(){if(y)return;y=document.createElement(`div`),y.id=`pwa-guide-modal`,y.innerHTML=`
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
    `,document.body.appendChild(y);let e=()=>{y?.classList.add(`pgm-hiding`),setTimeout(()=>{y?.remove(),y=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_showDesktopGuide(){if(y)return;y=document.createElement(`div`),y.id=`pwa-guide-modal`,y.innerHTML=`
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
    `,document.body.appendChild(y);let e=()=>{y?.classList.add(`pgm-hiding`),setTimeout(()=>{y?.remove(),y=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_isStandalone(){return window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`},_injectStyles(){if(document.getElementById(`pwa-installer-styles`))return;let e=document.createElement(`style`);e.id=`pwa-installer-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}}).init();var b=class e{constructor(e={}){this.id=e.id||null,this.clase_id=e.clase_id||null,this.maestro_id=e.maestro_id||null,this.fecha_inicio=e.fecha_inicio||null,this.tema=e.tema||``,this.objetivos=e.objetivos||``,this.contenido=e.contenido||``,this.recursos=Array.isArray(e.recursos)?e.recursos:[],this.evaluacion_metodo=e.evaluacion_metodo||``,this.observaciones=e.observaciones||``,this.notas_dsl=e.notas_dsl||``,this.estado=e.estado||`planificado`,this.instrumento=e.instrumento||null,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null,this.clase_nombre=e.clase_nombre||null,this.maestro_nombre=e.maestro_nombre||null}validate(){let t=[];return!this.tema||!this.tema.trim()?t.push(`El tema es obligatorio`):this.tema.trim().length<3?t.push(`El tema debe tener mínimo 3 caracteres`):this.tema.trim().length>200&&t.push(`El tema no puede exceder 200 caracteres`),this.clase_id||t.push(`La clase es obligatoria`),this.objetivos&&this.objetivos.length>1e3&&t.push(`Los objetivos no pueden exceder 1000 caracteres`),this.contenido&&this.contenido.length>2e3&&t.push(`El contenido no puede exceder 2000 caracteres`),this.evaluacion_metodo&&this.evaluacion_metodo.length>500&&t.push(`El método de evaluación no puede exceder 500 caracteres`),this.observaciones&&this.observaciones.length>1e3&&t.push(`Las observaciones no pueden exceder 1000 caracteres`),this.instrumento&&this.instrumento.length>100&&t.push(`El instrumento no puede exceder 100 caracteres`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}canEdit(){return this.estado===`planificado`||this.estado===`ejecutado`}canApprove(){return this.estado===`ejecutado`}isLocked(){return this.estado===`revisado`}static getEstados(){return[{value:`planificado`,label:`Planificado`,color:`bg-primary`},{value:`ejecutado`,label:`Ejecutado`,color:`bg-success`},{value:`revisado`,label:`Revisado`,color:`bg-info`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_inicio:this.fecha_inicio,tema:this.tema.trim(),objetivos:this.objetivos.trim()||null,contenido:this.contenido.trim()||null,recursos:this.recursos,evaluacion_metodo:this.evaluacion_metodo.trim()||null,observaciones:this.observaciones.trim()||null,estado:this.estado,instrumento:this.instrumento?.trim()||null}}},x={alumnos:/#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,calificacion:/(\d)\/(\d)/g};function S(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)r[1]&&n.push(r[1].trim());return n}function _e(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function ve(e){return!e||typeof e!=`string`?{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[]}:{alumnos:S(e,x.alumnos),contenido:S(e,x.contenido),sugerencias:S(e,x.sugerencias),tareas:S(e,x.tareas),medidas:S(e,x.medidas),calificacion:_e(e),objetivos:S(e,x.objetivos)}}function ye(e){if(!e)return``;let t=e;return t=t.replace(x.calificacion,(e,t,n)=>`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`),t=t.replace(x.objetivos,(e,t)=>`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">__OBJ_START__${t}__OBJ_END__</span>`),t=t.replace(x.alumnos,(e,t)=>`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`),t=t.replace(x.contenido,(e,t)=>`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`),t=t.replace(x.sugerencias,(e,t)=>`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`),t=t.replace(x.tareas,(e,t)=>`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`),t=t.replace(x.medidas,(e,t)=>`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`),t=be(t),t=t.replace(/__OBJ_START__/g,`&gt;`),t=t.replace(/__OBJ_END__/g,``),t}function be(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var xe=175,Se=[`Ejemplo:`,`#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica`,`#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5`,``,`Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo`].join(`
`),Ce=null,C=``;function we(e=``,t=null){let n=document.createElement(`div`);n.className=`dsl-editor-container`;let r=document.createElement(`div`);r.className=`dsl-editor-wrapper position-relative`;let i=document.createElement(`div`);i.className=`dsl-editor form-control`,i.contentEditable=`true`,i.spellcheck=`false`,i.setAttribute(`data-placeholder`,Se),i.innerHTML=e?ye(e):``;let a=document.createElement(`div`);a.className=`dsl-highlight-layer position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(a),r.appendChild(i),n.appendChild(r),Te();function o(){return i.innerText||i.textContent||``}function s(){let e=o();e!==C&&(C=e,a.innerHTML=ye(e)+`<br>`)}function c(){a.scrollTop=i.scrollTop,a.scrollLeft=i.scrollLeft}function l(){clearTimeout(Ce),Ce=setTimeout(()=>{s();let e=ve(o());t&&t(o(),e)},xe)}function u(e){e.key===`Tab`&&(e.preventDefault(),document.execCommand(`insertText`,!1,`  `))}function d(){c()}i.addEventListener(`input`,l),i.addEventListener(`keydown`,u),i.addEventListener(`scroll`,d),i.addEventListener(`focus`,()=>{n.classList.add(`focused`)}),i.addEventListener(`blur`,()=>{n.classList.remove(`focused`),s()});function f(e){i.innerHTML=e?ye(e):``,C=o(),a.innerHTML=ye(C)+`<br>`}function p(){return o()}function m(){return ve(o())}function h(){i.focus()}function ee(e){i.focus(),document.execCommand(`insertText`,!1,e)}function te(e,t=``){i.focus();let n=window.getSelection();if(!n.rangeCount)return;let r=n.getRangeAt(0);r.deleteContents();let a=document.createTextNode(e),s=document.createTextNode(t);r.insertNode(a),r.collapse(!1),r.insertNode(s),r.setStartAfter(a),r.setEndAfter(a),n.removeAllRanges(),n.addRange(r),C=o()}return n.component={element:n,editor:i,setContent:f,getContent:p,getParsed:m,focus:h,insertText:ee,insertAtCursor:te},n.setContent=f,n.getContent=p,n.getParsed=m,n.focus=h,n.insertText=ee,n.insertAtCursor=te,e&&(C=e),n}function Te(){if(document.getElementById(`dsl-editor-styles`))return;let e=document.createElement(`style`);e.id=`dsl-editor-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Ee(e={}){let{onAlumnoClick:t=null,onGrabarClick:n=null,onEnriquecerClick:r=null,editor:i=null}=e,a=document.createElement(`div`);return a.className=`dsl-toolbar btn-group btn-group-sm me-2`,[{id:`alumno`,icon:`#`,label:`Alumno`,title:`Insertar mention de alumno`,className:`btn btn-outline-primary`,action:()=>{t?t(i):i&&i.insertAtCursor(`#`,``)}},{id:`contenido`,icon:`[]`,label:`Contenido`,title:`Insertar contenido`,className:`btn btn-outline-success`,action:()=>{i&&i.insertAtCursor(`[`,`]`)}},{id:`sugerencia`,icon:`()`,label:`Sugerencia`,title:`Insertar sugerencia`,className:`btn btn-outline-warning`,action:()=>{i&&i.insertAtCursor(`(`,`)`)}},{id:`tarea`,icon:`{}`,label:`Tarea`,title:`Insertar tarea`,className:`btn btn-outline-purple`,action:()=>{i&&i.insertAtCursor(`{`,`}`)}},{id:`medida`,icon:`$`,label:`Medida`,title:`Insertar medida técnica`,className:`btn btn-outline-info`,action:()=>{i&&i.insertAtCursor(`$`,``)}},{id:`calificacion`,icon:`4/5`,label:`Calificación`,title:`Insertar calificación`,className:`btn btn-outline-danger`,action:()=>{i&&i.insertText(`4/5`)}},{id:`objetivo`,icon:`>`,label:`Objetivo`,title:`Insertar referencia a objetivo`,className:`btn btn-outline-secondary`,action:()=>{i&&i.insertAtCursor(`>`,``)}},{id:`grabar`,icon:`🎤`,label:`Grabar`,title:`Grabar audio (placeholder)`,className:`btn btn-outline-dark`,action:()=>{n&&n(i)}},{id:`enriquecer`,icon:`✨`,label:`IA`,title:`Enriquecer con IA (placeholder)`,className:`btn btn-outline-dark`,action:()=>{r&&r(i)}}].forEach(e=>{let t=document.createElement(`button`);t.className=e.className,t.type=`button`,t.title=e.title,t.innerHTML=`<span class="dsl-toolbar-btn">${e.icon}</span>`,t.addEventListener(`click`,t=>{t.preventDefault(),e.action()}),a.appendChild(t)}),De(),a}function De(){if(document.getElementById(`dsl-toolbar-styles`))return;let e=document.createElement(`style`);e.id=`dsl-toolbar-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Oe(e={}){let{initialContent:t=``,onChange:n=null,onAlumnoClick:r=null,onGrabarClick:i=null,onEnriquecerClick:a=null}=e,o=document.createElement(`div`);o.className=`dsl-editor-with-toolbar`;let s=we(t,n),c=Ee({onAlumnoClick:r,onGrabarClick:i,onEnriquecerClick:a,editor:s});return o.appendChild(c),o.appendChild(s),o.container=o,o}var ke={version:`1.0.0`,environment:`production`,isDemoMode:localStorage.getItem(`demo_mode`)===`true`,groq:{apiKey:``,model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,endpoint:`https://api.groq.com/openai/v1`,maxTokens:1024,temperature:.3},tareas:{localStorageKey:`maestro_tarea`,diasVencimientoDefault:7}},Ae=e({PARENTESCOS:()=>je,actualizarAlumno:()=>Ie,crearAlumno:()=>Fe,eliminarAlumno:()=>Le,getParentescoLabel:()=>Me,obtenerAlumno:()=>Pe,obtenerAlumnos:()=>Ne,obtenerAlumnosActivos:()=>Be,obtenerAlumnosPorMes:()=>He,obtenerInscripcionesAlumno:()=>Ve,validarCedula:()=>ze,validarEmail:()=>Re}),je=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}];function Me(e){let t=je.find(t=>t.value===e);return t?t.label:e}function w(e){return e?{...e,id:e.id,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,telefono:e.familiar_telefono??``,is_active:e.activo??!0,cedula:e.representante_cedula??``,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``,sabe_leer:e.sabe_leer??!1,sabe_escribir:e.sabe_escribir??!1,nacionalidad:e.nacionalidad??null,tiene_pasaporte:e.tiene_pasaporte??!1,como_se_entero:e.como_se_entero??null,ubicacion_maps_url:e.ubicacion_maps_url??null,tiene_conocimientos_musicales:e.tiene_conocimientos_musicales??!1,instrumento_previo:e.instrumento_previo??null,nivel_lectura_musical:e.nivel_lectura_musical??null,interes_musical:e.interes_musical??null,instrumento_interes:e.instrumento_interes??null,iniciacion_musical_requerida:e.iniciacion_musical_requerida??!1,fecha_elegible_audicion:e.fecha_elegible_audicion??null,fecha_fin_iniciacion:e.fecha_fin_iniciacion??null,alergias_descripcion:e.alergias_descripcion??null,tiene_condicion_transmisible:e.tiene_condicion_transmisible??!1,condicion_transmisible_descripcion:e.condicion_transmisible_descripcion??null,alergia_medicamento:e.alergia_medicamento??!1,alergia_medicamento_descripcion:e.alergia_medicamento_descripcion??null,impedimento_social:e.impedimento_social??!1,problemas_conducta:e.problemas_conducta??`no`,centro_estudios:e.centro_estudios??null,grado_nivel:e.grado_nivel??null,padres_en_vida:e.padres_en_vida??null,representante_nombre:e.representante_nombre??null,representante_parentesco:e.representante_parentesco??null,representante_tlf:e.representante_tlf??null,acepta_beca_4500:e.acepta_beca_4500??!1,acepta_pago_600:e.acepta_pago_600??!1,fecha_aceptacion_compromisos:e.fecha_aceptacion_compromisos??null}:null}async function Ne(){let{data:e,error:n}=await t.from(`alumnos`).select(`*`).order(`nombre_completo`,{ascending:!0});if(n)throw console.error(`Error cargando alumnos:`,n.message),Error(`No se pudieron cargar los alumnos`);return e.map(w)}async function Pe(e){let{data:n,error:r}=await t.from(`alumnos`).select(`*`).eq(`id`,e).single();if(r)throw console.error(`Error cargando alumno:`,r.message),Error(`Alumno no encontrado`);return w(n)}async function Fe(e){let n=(e.nombre||e.nombre_completo||``).trim();if(!n)throw Error(`El nombre es obligatorio`);let r={nombre_completo:n,correo_representante:(e.email||``).trim().toLowerCase()||null,representante_cedula:(e.cedula||e.representante_cedula||``).trim()||null,instrumento_principal:(e.instrumento||``).trim()||null,activo:e.is_active===void 0?!0:e.is_active,familiar_nombre:(e.familiar_nombre||``).trim()||null,familiar_telefono:(e.telefono||e.familiar_telefono||``).trim()||null,familiar_parentesco:(e.familiar_parentesco||``).trim()||null,contacto_emergencia_nombre:(e.contacto_emergencia_nombre||``).trim()||null,contacto_emergencia_telefono:(e.contacto_emergencia_telefono||``).trim()||null,contacto_emergencia_parentesco:(e.contacto_emergencia_parentesco||``).trim()||null,condiciones_medicas:(e.condiciones_medicas||``).trim()||null,alergias:(e.alergias||``).trim()||null,medicamentos:(e.medicamentos||``).trim()||null,sabe_leer:e.sabe_leer??null,sabe_escribir:e.sabe_escribir??null,nacionalidad:e.nacionalidad??null,tiene_pasaporte:e.tiene_pasaporte??!1,como_se_entero:e.como_se_entero??null,municipio_residencia:e.municipio_residencia??null,sector_calle_numero:e.sector_calle_numero??null,ubicacion_maps_url:e.ubicacion_maps_url??null,madre_nombre:e.madre_nombre??null,madre_cedula:e.madre_cedula??null,madre_tlf_whatsapp:e.madre_tlf_whatsapp??null,padre_nombre:e.padre_nombre??null,padre_cedula:e.padre_cedula??null,padre_tlf_whatsapp:e.padre_tlf_whatsapp??null,representante_nombre:e.representante_nombre??null,representante_parentesco:e.representante_parentesco??null,representante_tlf:e.representante_tlf??null,otro_responsable_nombre:e.otro_responsable_nombre??null,otro_responsable_cedula:e.otro_responsable_cedula??null,otro_responsable_tlf:e.otro_responsable_tlf??null,contacto_emergencia_2_nombre:e.contacto_emergencia_2_nombre??null,contacto_emergencia_2_telefono:e.contacto_emergencia_2_telefono??null,familia_monoparental:e.familia_monoparental??null,beneficiario_subsidio_estado:e.beneficiario_subsidio_estado??null,subsidio_descripcion:e.subsidio_descripcion??null,apoyo_actividades:e.apoyo_actividades??null,tiene_conocimientos_musicales:e.tiene_conocimientos_musicales??null,instrumento_previo:e.instrumento_previo??null,nivel_lectura_musical:e.nivel_lectura_musical??null,interes_musical:e.interes_musical??null,instrumento_interes:e.instrumento_interes??null,requiere_iniciacion_musical:e.tiene_conocimientos_musicales!==!0,fecha_ingreso_iniciacion:e.tiene_conocimientos_musicales===!0?null:new Date().toISOString().slice(0,10),por_que_unirse:e.por_que_unirse??null,sentimiento_musica_clasica:e.sentimiento_musica_clasica??null,sentimiento_aprender_instrumento:e.sentimiento_aprender_instrumento??null,aspiracion_instrumento:e.aspiracion_instrumento??null,musico_favorito:e.musico_favorito??null,preferencia_aprendizaje_musical:e.preferencia_aprendizaje_musical??null,tiene_alergias:e.tiene_alergias??null,alergias_descripcion:e.alergias_descripcion??null,tiene_condicion_transmisible:e.tiene_condicion_transmisible??null,condicion_transmisible_desc:e.condicion_transmisible_desc??null,tiene_alergia_medicamento:e.tiene_alergia_medicamento??null,alergia_medicamento_desc:e.alergia_medicamento_desc??null,impedimento_social:e.impedimento_social??null,problemas_conducta:e.problemas_conducta||null,centro_estudios:e.centro_estudios??null,grado_nivel:e.grado_nivel??null,padres_en_vida:e.padres_en_vida||null,acepta_beca_4500:e.acepta_beca_4500??!1,fecha_aceptacion_beca:e.acepta_beca_4500?new Date().toISOString():null,acepta_pago_600:e.acepta_pago_600??!1,fecha_aceptacion_pago:e.acepta_pago_600?new Date().toISOString():null,autoriza_fotos_redes:e.autoriza_fotos_redes??!1},{data:i,error:a}=await t.from(`alumnos`).insert([r]).select();if(a)throw console.error(`Error creando alumno:`,a.message),Error(`No se pudo crear el alumno`);return w(i[0])}async function Ie(e,n){let r={};n.nombre!==void 0&&(r.nombre_completo=n.nombre?n.nombre.trim():n.nombre),n.nombre_completo!==void 0&&(r.nombre_completo=n.nombre_completo?n.nombre_completo.trim():n.nombre_completo),n.email!==void 0&&(r.correo_representante=n.email?n.email.trim().toLowerCase():n.email),n.instrumento!==void 0&&(r.instrumento_principal=n.instrumento?n.instrumento.trim():n.instrumento),n.cedula!==void 0&&(r.representante_cedula=n.cedula?n.cedula.trim():n.cedula),n.is_active!==void 0&&(r.activo=n.is_active),n.activo!==void 0&&(r.activo=n.activo),n.telefono!==void 0&&(r.familiar_telefono=n.telefono?n.telefono.trim():n.telefono),n.familiar_telefono!==void 0&&(r.familiar_telefono=n.familiar_telefono?n.familiar_telefono.trim():n.familiar_telefono),n.familiar_nombre!==void 0&&(r.familiar_nombre=n.familiar_nombre?n.familiar_nombre.trim():n.familiar_nombre),n.familiar_parentesco!==void 0&&(r.familiar_parentesco=n.familiar_parentesco?n.familiar_parentesco.trim():n.familiar_parentesco),n.contacto_emergencia_nombre!==void 0&&(r.contacto_emergencia_nombre=n.contacto_emergencia_nombre?n.contacto_emergencia_nombre.trim():n.contacto_emergencia_nombre),n.contacto_emergencia_telefono!==void 0&&(r.contacto_emergencia_telefono=n.contacto_emergencia_telefono?n.contacto_emergencia_telefono.trim():n.contacto_emergencia_telefono),n.contacto_emergencia_parentesco!==void 0&&(r.contacto_emergencia_parentesco=n.contacto_emergencia_parentesco?n.contacto_emergencia_parentesco.trim():n.contacto_emergencia_parentesco),n.condiciones_medicas!==void 0&&(r.condiciones_medicas=n.condiciones_medicas?n.condiciones_medicas.trim():n.condiciones_medicas),n.alergias!==void 0&&(r.alergias=n.alergias?n.alergias.trim():n.alergias),n.medicamentos!==void 0&&(r.medicamentos=n.medicamentos?n.medicamentos.trim():n.medicamentos);let{data:i,error:a}=await t.from(`alumnos`).update(r).eq(`id`,e).select();if(a)throw console.error(`Error actualizando alumno:`,a),a.code===`PGRST201`||a.message?.includes(`row-level security`)?Error(`No tienes permisos para actualizar este alumno. Contacta al administrador.`):Error(`No se pudo actualizar el alumno: ${a.message||`Error desconocido`}`);return w(i[0])}async function Le(e){let{error:n}=await t.from(`alumnos`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando alumno:`,n.message),Error(`No se pudo eliminar el alumno`)}async function Re(e){let{data:n,error:r}=await t.from(`alumnos`).select(`id`).eq(`correo_representante`,e.trim().toLowerCase()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando email:`,r.message),!!n}async function ze(e){let{data:n,error:r}=await t.from(`alumnos`).select(`id`).eq(`representante_cedula`,e.trim()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando cédula:`,r.message),!!n}async function Be(){let{data:e,error:n}=await t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(n)throw Error(`No se pudieron cargar los alumnos`);return e.map(w)}async function Ve(e){let{data:n,error:r}=await t.from(`alumnos_clases`).select(`clase_id, clase:clases(nombre)`).eq(`alumno_id`,e);if(r)throw console.error(`Error cargando inscripciones de alumno:`,r.message),Error(`No se pudieron cargar las clases del alumno`);return(n||[]).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase?.nombre??`Clase sin nombre`}))}async function He(e,n){let r=`${e}-${String(n).padStart(2,`0`)}-01`,i=new Date(e,n,0).getDate(),a=`${e}-${String(n).padStart(2,`0`)}-${i}`,{data:o,error:s}=await t.from(`alumnos`).select(`*`).gte(`created_at`,`${r}T00:00:00`).lte(`created_at`,`${a}T23:59:59`).order(`created_at`,{ascending:!0});if(s)throw Error(`No se pudieron cargar los alumnos del mes`);return o.map(w)}var Ue=e({actualizarAlumno:()=>Je,crearAlumno:()=>qe,eliminarAlumno:()=>Ye,obtenerAlumno:()=>Ke,obtenerAlumnos:()=>Ge,obtenerAlumnosPorMes:()=>et,obtenerInscripcionesAlumno:()=>$e,validarCedula:()=>Ze,validarEmail:()=>Xe}),T=(e=500)=>new Promise(t=>setTimeout(t,e));function We(e){return e?{...e,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,is_active:e.activo??!0,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``}:null}var E=[...s];async function Ge(){return await T(),E.map(We)}async function Ke(e){await T();let t=E.find(t=>t.id===e);if(!t)throw Error(`Alumno no encontrado (Demo)`);return We(t)}async function qe(e){await T();let t={...e,id:Math.random().toString(36).substr(2,9),nombre_completo:e.nombre||e.nombre_completo,activo:e.is_active===void 0?!0:e.is_active};return E.push(t),We(t)}async function Je(e,t){await T();let n=E.findIndex(t=>t.id===e);if(n===-1)throw Error(`Alumno no encontrado (Demo)`);return E[n]={...E[n],...t},We(E[n])}async function Ye(e){await T(),E=E.filter(t=>t.id!==e)}async function Xe(e){return await T(100),E.some(t=>t.correo_representante===e.trim().toLowerCase())}async function Ze(e){return await T(100),E.some(t=>t.representante_cedula===e.trim())}var Qe=[{alumno_id:`1`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`1`,clase_id:`clase_005`,clase_nombre:`Coro Infantil`},{alumno_id:`2`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`4`,clase_id:`clase_004`,clase_nombre:`Flauta Travesera`}];async function $e(e){return await T(200),Qe.filter(t=>t.alumno_id===e).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase_nombre}))}async function et(e,t){return await T(300),E.filter(n=>{let r=new Date(n.created_at??n.fecha_ingreso??``);return r.getFullYear()===e&&r.getMonth()+1===t}).map(We)}function tt(e,t){let[n,r,i]=e.split(`-`).map(Number),a=r-1+t,o=n+Math.floor(a/12),s=(a%12+12)%12,c=new Date(Date.UTC(o,s+1,0)).getUTCDate(),l=Math.min(i,c);return`${o}-${String(s+1).padStart(2,`0`)}-${String(l).padStart(2,`0`)}`}function nt(e,t){return e?.tiene_conocimientos_musicales===!0&&e?.nivel_lectura_musical===`avanzado`?{iniciacion_musical_requerida:!1,fecha_fin_iniciacion:null,fecha_elegible_audicion:null}:{iniciacion_musical_requerida:!0,fecha_fin_iniciacion:tt(t,6),fecha_elegible_audicion:tt(t,3)}}var D=()=>ke.isDemoMode?Ue:Ae,rt=(...e)=>D().obtenerAlumnos(...e),it=(...e)=>D().obtenerAlumnos(...e),at=(...e)=>D().obtenerAlumno(...e);async function ot(e){let t=nt(e,e.fecha_ingreso??new Date().toISOString().slice(0,10)),n={...e,...t,fecha_aceptacion_compromisos:e.fecha_aceptacion_compromisos??new Date().toISOString()};return D().crearAlumno(n)}var st=(...e)=>D().actualizarAlumno(...e),ct=(...e)=>D().eliminarAlumno(...e),lt=(...e)=>D().obtenerInscripcionesAlumno(...e),ut=(...e)=>D().obtenerAlumnosPorMes(...e),dt=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}];function ft(e={}){let{onSelect:t=null,onClose:n=null}=e,r=new Set,i=``,a=document.createElement(`div`);a.className=`modal fade`,a.setAttribute(`tabindex`,`-1`),a.setAttribute(`role`,`dialog`),a.innerHTML=`
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
  `;let o=a.querySelector(`.search-input`),s=a.querySelector(`.alumno-list`),c=a.querySelector(`.confirm-btn`),l=a.querySelector(`.cancel-btn`);async function u(){let e=await it();d(i?e.filter(e=>e.nombre_completo.toLowerCase().includes(i.toLowerCase())):e)}function d(e){if(s.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`text-center text-muted py-4`,e.textContent=`No se encontraron alumnos`,alunoList.appendChild(e);return}e.forEach(e=>{let t=document.createElement(`label`);t.className=`list-group-item d-flex align-items-center gap-2 cursor-pointer`,t.style.cursor=`pointer`;let n=document.createElement(`input`);n.type=`checkbox`,n.className=`form-check-input`,n.checked=r.has(e.id),n.value=e.id;let i=document.createElement(`div`);i.className=`flex-grow-1`,i.innerHTML=`
        <div class="fw-medium">${pt(e.nombre_completo)}</div>
        <small class="text-muted">${pt(e.instrumento_principal)}</small>
      `,t.appendChild(n),t.appendChild(i),n.addEventListener(`change`,()=>{n.checked?r.add(e.id):r.delete(e.id)}),t.addEventListener(`click`,e=>{e.target!==n&&(n.checked=!n.checked,n.dispatchEvent(new Event(`change`)))}),s.appendChild(t)})}o.addEventListener(`input`,e=>{i=e.target.value,u()}),c.addEventListener(`click`,()=>{t&&t(Array.from(r)),p()}),l.addEventListener(`click`,()=>{n&&n(),p()});function f(){r.clear(),i=``,o.value=``;let e=new bootstrap.Modal(a);e.show(),u(),a.bsModal=e}function p(){a.bsModal&&a.bsModal.hide()}return a.openModal=f,a.closeModal=p,a}function pt(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function mt(e,n){let r=t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);e&&(r=r.eq(`instrumento`,e)),n&&(r=r.eq(`nivel`,n));let{data:i,error:a}=await r.maybeSingle();if(a)throw a;return i||null}async function ht(){let{data:e,error:n}=await t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(n)throw n;return(e||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function gt({instrumento:e,nivel:n,descripcion:r}){let{data:i,error:a}=await t.from(`curriculos`).insert({instrumento:e,nivel:n,descripcion:r}).select().single();if(a)throw a;return i}async function _t(e,n){let{data:r,error:i}=await t.from(`curriculos`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function vt(e,t){return _t(e,{activo:t})}async function yt(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_pilares`).insert({curriculo_id:e,nombre:n,orden:r}).select().single();if(a)throw a;return i}async function bt(e,n){let{data:r,error:i}=await t.from(`curriculo_pilares`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function xt(e){let{error:n}=await t.from(`curriculo_pilares`).delete().eq(`id`,e);if(n)throw n}async function St(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_objetivos`).insert({pilar_id:e,descripcion:n,orden:r}).select().single();if(a)throw a;return i}async function Ct(e,n){let{data:r,error:i}=await t.from(`curriculo_objetivos`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function wt(e){let{error:n}=await t.from(`curriculo_objetivos`).delete().eq(`id`,e);if(n)throw n}async function Tt({instrumento:e,nivel:t,descripcion:n,pilares:r}){if(!e||e.trim()===``)throw Error(`El instrumento es obligatorio para crear el plan.`);if(!r||r.length===0)throw Error(`La propuesta debe tener al menos un pilar.`);let i=await gt({instrumento:e.trim(),nivel:t?.trim()||``,descripcion:n?.trim()||`Plan generado por IA`}),a=[];for(let e=0;e<r.length;e++){let t=r[e],n=await yt(i.id,t.nombre||`Pilar ${e+1}`,e),o=t.objetivos||[];for(let e=0;e<o.length;e++){let t=await St(n.id,o[e].descripcion||`Objetivo ${e+1}`,e);a.push({id:t.id,descripcion:t.descripcion})}}return{curriculo:i,allObjetivos:a}}async function Et(e=null){let n=t.from(`planificaciones`).select(`
    *,
    clase:clases (nombre),
    maestro:maestros (nombre_completo)
  `);e&&(n=n.eq(`maestro_id`,e));let{data:r,error:i}=await n.order(`created_at`,{ascending:!1});if(i)throw console.error(`Error cargando planificaciones:`,i.message),Error(`No se pudieron cargar las planificaciones`);return r.map(e=>new b({...e,clase_nombre:e.clase?.nombre||`Sin asignar`,maestro_nombre:e.maestro?.nombre_completo||`Sin asignar`}))}async function Dt(e){let n=new b(e),r=n.validate();if(r.length>0)throw Error(r.join(`. `));let{data:i,error:a}=await t.from(`planificaciones`).insert([n.toJSON()]).select();if(a)throw a;return new b(i[0])}async function Ot(e,n){let{data:r}=await t.from(`planificaciones`).select(`*`).eq(`id`,e).single(),i=new b({...r,...n}),a=i.validate();if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`planificaciones`).update(i.toJSON()).eq(`id`,e).select();if(s)throw s;return new b(o[0])}async function kt(e){let{error:n}=await t.from(`planificaciones`).delete().eq(`id`,e);if(n)throw n}async function At(e){if(!e||!e.length)return[];let{data:n,error:r}=await t.from(`planificaciones`).update({estado:`revisado`}).in(`id`,e).select();if(r)throw r;return(n||[]).map(e=>new b(e))}var jt=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}},O={PRESENTE:`presente`,AUSENTE:`ausente`,JUSTIFICADO:`justificado`,TARDE:`tarde`},Mt={P:O.PRESENTE,A:O.AUSENTE,J:O.JUSTIFICADO,T:O.TARDE,presente:O.PRESENTE,ausente:O.AUSENTE,justificado:O.JUSTIFICADO,tarde:O.TARDE};function Nt(e){return e?Mt[e]||e:O.PRESENTE}var Pt={presente:{short:`P`,label:`Presente`,css:`success`},ausente:{short:`A`,label:`Ausente`,css:`danger`},justificado:{short:`J`,label:`Justificado`,css:`warning`}};function k(e,t){throw console.error(e,t?.message),Error(e)}function Ft(e){let t=e?.message?.toLowerCase()||``;return t.includes(`unique constraint`)||t.includes(`duplicate key`)||t.includes(`uk_asistencias`)||t.includes(`unique`)&&t.includes(`duplicate`)}async function It({fechaInicio:e,fechaFin:n,periodoId:r,claseId:i,maestroId:a}={}){let o=t.from(`sesiones_clase`).select(`
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
    `).order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});if(e&&(o=o.gte(`fecha`,e)),n&&(o=o.lte(`fecha`,n)),i&&(o=o.eq(`clase_id`,i)),r){let{data:i}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,r).single();i&&(e||(o=o.gte(`fecha`,i.fecha_inicio)),n||(o=o.lte(`fecha`,i.fecha_fin)))}let{data:s,error:c}=await o;c&&k(`No se pudieron cargar las sesiones`,c);let l=(s||[]).map(e=>{let t=e.asistencias||[];return{sesionId:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,temaPrincipal:e.tema_principal,observacionesGenerales:e.observaciones_generales,estado:e.estado,claseId:e.clase_id,claseNombre:e.clases?.nombre??`—`,instrumento:e.clases?.instrumento??`—`,maestroId:e.clases?.maestro_principal_id??null,maestroNombre:e.clases?.maestros?.nombre_completo??`—`,totalPresentes:t.filter(e=>e.estado===O.PRESENTE).length,totalAusentes:t.filter(e=>e.estado===O.AUSENTE).length,totalJustificados:t.filter(e=>e.estado===O.JUSTIFICADO).length,totalRegistros:t.length}}),u=l;return a&&(u=l.filter(e=>e.maestroId&&e.maestroId.toString()===a.toString())),Lt(u)}function Lt(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return Array.from(t.entries()).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,sesiones:t}))}async function Rt(e){e||k(`Se requiere sesionId`);let{data:n,error:r}=await t.from(`sesiones_clase`).select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `).eq(`id`,e).single();r&&k(`No se pudo cargar la sesión`,r);let{data:i,error:a}=await t.from(`asistencias`).select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e).order(`alumnos(nombre_completo)`,{ascending:!0});a&&k(`No se pudieron cargar las asistencias`,a);let{data:o}=await t.from(`justificaciones`).select(`motivo, descripcion, archivo_url, estado, alumno_id`).eq(`sesion_id`,e),s={};o&&o.forEach(e=>{s[e.alumno_id]=e});let{data:c,error:l}=await t.from(`observaciones_alumnos`).select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e);l&&k(`No se pudieron cargar las observaciones`,l);let{data:u,error:d}=await t.from(`contenidos_sesion`).select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `).eq(`sesion_clase_id`,e);return d&&k(`No se pudieron cargar los contenidos`,d),{sesion:{id:n.id,fecha:n.fecha,horaInicio:n.hora_inicio,horaFin:n.hora_fin,temaPrincipal:n.tema_principal,observacionesGenerales:n.observaciones_generales,estado:n.estado,claseNombre:n.clases?.nombre??`—`,instrumento:n.clases?.instrumento??`—`,maestroNombre:n.clases?.maestros?.nombre_completo??`—`},asistencias:(i||[]).map(e=>({id:e.id,estado:e.estado,justificacionTexto:e.justificacion_texto,observacion:e.observaciones,alumnoId:e.alumno_id,alumnoNombre:e.alumnos?.nombre_completo??`—`,justificacion:s[e.alumno_id]??null})),observaciones:(c||[]).map(e=>({id:e.id,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion??e.observacion,prioridad:e.prioridad,alumnoId:e.alumnos?.id,alumnoNombre:e.alumnos?.nombre_completo??`—`})),contenidos:(u||[]).map(e=>({id:e.id,descripcion:e.descripcion,nivelLogro:e.nivel_logro,planTitulo:e.planificaciones?.titulo}))}}async function zt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});return n&&k(`No se pudieron cargar los períodos`,n),e||[]}async function Bt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).single();return n?null:e}async function Vt(){let{data:e,error:n}=await t.from(`clases`).select(`id, nombre, instrumento`).order(`nombre`,{ascending:!0});return n&&k(`No se pudieron cargar las clases`,n),e||[]}async function Ht(e){e?.length||k(`No hay asistencias para registrar`);let n=[...new Set(e.map(e=>e.alumno_id))];n.some(e=>!e)&&k(`Todas las asistencias deben tener alumno_id`);let{data:r,error:i}=await t.from(`alumnos`).select(`id`).in(`id`,n);i&&k(`No se pudo validar alumnos en la base de datos`,i);let a=new Set(r?.map(e=>e.id)||[]),o=n.filter(e=>!a.has(e));o.length>0&&k(`Los siguientes alumnos no existen: ${o.join(`, `)}`);let s=e.filter(e=>e.sesion_clase_id?!0:(console.warn(`[asistenciasApi] Saltando alumno ${e.alumno_id} sin sesion_clase_id (se sincronizará vía offline queue)`),!1)).map(e=>{if(!e.clase_id)throw Error(`clase_id es requerido para alumno ${e.alumno_id}`);if(!e.fecha)throw Error(`fecha es requerido para alumno ${e.alumno_id}`);return{sesion_clase_id:e.sesion_clase_id,clase_id:e.clase_id,alumno_id:e.alumno_id,fecha:e.fecha,estado:Nt(e.estado),justificacion_texto:(e.justificacion_texto||``).trim()||null,observaciones:(e.observaciones||``).trim()||null,...e.registrado_por?{registrado_por:e.registrado_por}:{}}});if(s.length===0)return console.warn(`[asistenciasApi] No hay registros válidos con sesion_clase_id para insertar`),[];let{data:c,error:l}=await t.from(`asistencias`).upsert(s,{onConflict:`clase_id,alumno_id,fecha`}).select();if(l&&Ft(l)){console.warn(`[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:`,l.message);let{data:e,error:n}=await t.from(`asistencias`).insert(s,{returning:`representation`}).select();return n&&k(`No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)`,l),e||[]}return l&&k(`No se pudieron registrar las asistencias`,l),c}async function Ut({periodoId:e,fecha:n,claseId:r}={}){try{let i,a;if(e){let{data:n,error:r}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,e).single();r&&console.warn(`No se pudo cargar el período, mostrando todas las sesiones`,r),n&&(i=n.fecha_inicio,a=n.fecha_fin)}let o=t.from(`vw_asistencias_consolidada`).select(`
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
      `);i&&(o=o.gte(`fecha`,i)),a&&(o=o.lte(`fecha`,a)),n&&(o=o.eq(`fecha`,n)),r&&(o=o.eq(`clase_id`,r));let{data:s,error:c}=await o.order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});c&&k(`No se pudieron cargar las sesiones consolidadas`,c),Array.isArray(s)||(console.warn(`sesiones no es un array, usando array vacío`,s),s=[]),s=s.filter(e=>e.borrador===!1),console.log(`📊 Filtro de borradores: ${s.length} sesiones reales`),console.log(`📊 getReporteConsolidado DEBUG:`,{periodoId:e,sesionesCount:s.length,dataSource:`vw_asistencias_consolidada`,firstSesion:s[0]?{fecha:s[0].fecha,nombre_clase:s[0].nombre_clase,presentes:s[0].presentes,ausentes:s[0].ausentes,justificados:s[0].justificados}:`NO SESIONES`});let l={};s&&s.length>0&&s.forEach(e=>{let t={clase_id:e.clase_id,clase_nombre:e.nombre_clase,fecha:e.fecha,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,maestro_nombre:e.maestro_principal||`Sin asignar`,maestro_auxiliar_nombre:e.maestro_auxiliar||null,observacion_clase:e.observacion_clase||null,observacion_sesion:e.observacion_sesion||null,presentes:e.presentes||0,ausentes:e.ausentes||0,justificados:e.justificados||0,total_alumnos:e.total_registros||0,asistencias:e.asistencias_detalle?Array.isArray(e.asistencias_detalle)?e.asistencias_detalle:JSON.parse(e.asistencias_detalle||`[]`):[],justificaciones:e.justificaciones_detalle?Array.isArray(e.justificaciones_detalle)?e.justificaciones_detalle:JSON.parse(e.justificaciones_detalle||`[]`):[]};l[e.fecha]||(l[e.fecha]=[]),l[e.fecha].push(t)});let u=Object.entries(l).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,clases:t.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``))})),d=u.flatMap(e=>e.clases);return{timelineByDate:u,resumenGlobal:{totalClases:d.length,totalPresentes:d.reduce((e,t)=>e+t.presentes,0),totalAusentes:d.reduce((e,t)=>e+t.ausentes,0),totalJustificados:d.reduce((e,t)=>e+t.justificados,0),totalRegistros:d.reduce((e,t)=>e+t.total_alumnos,0),totalSesiones:s.length}}}catch(e){k(`Error en getReporteConsolidado`,e)}}var Wt=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`],Gt=/^([01]\d|2[0-3]):([0-5]\d)$/;function A(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function Kt(e,t){let n=A(e.inicio),r=A(e.fin),i=A(t.inicio);return n<A(t.fin)&&i<r}function qt(e,t){let n=[];for(let r=0;r<e.length;r++){let i=e[r];if(!Gt.test(i.inicio)||!Gt.test(i.fin)){n.push(`${t}: franja ${r+1} tiene formato de hora inválido (use HH:MM)`);continue}if(A(i.inicio)>=A(i.fin)){n.push(`${t}: franja ${r+1} — la hora de inicio (${i.inicio}) debe ser anterior a la de fin (${i.fin})`);continue}for(let a=r+1;a<e.length;a++)Kt(i,e[a])&&n.push(`${t}: las franjas ${r+1} y ${a+1} se solapan`)}return n}function Jt(e){if(!e||typeof e!=`object`)return{valid:!1,errors:[`Disponibilidad debe ser un objeto`]};let t=[];for(let[n,r]of Object.entries(e)){if(!Wt.includes(n)){t.push(`Día inválido: "${n}"`);continue}if(!Array.isArray(r)){t.push(`${n}: las franjas deben ser un array`);continue}let e=qt(r,n);t.push(...e)}return{valid:t.length===0,errors:t}}async function Yt(e,n){let r=Jt(n);if(!r.valid)return{success:!1,errors:r.errors};let{error:i}=await t.from(`maestros`).update({disponibilidad:n}).eq(`id`,e);return i?(console.error(`[DisponibilidadApi] Error updating:`,i.message),{success:!1,errors:[i.message]}):{success:!0}}async function Xt(e){let n=t.from(`maestros`).select(`id, nombre_completo, especialidad, habilidades, disponibilidad`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});e?.length&&(n=n.in(`id`,e));let{data:r,error:i}=await n;if(i)throw console.error(`[DisponibilidadApi] Error fetching bulk:`,i.message),Error(`No se pudieron cargar las disponibilidades`);return r.map(e=>({id:e.id,nombre:e.nombre_completo||``,especialidad:e.especialidad||``,habilidades:Array.isArray(e.habilidades)?e.habilidades:[],disponibilidad:e.disponibilidad||{}}))}function Zt(e){if(!e||!e.trim())return null;let t=e.replace(/\D/g,``);if(t.length<7)return null;let n=t;return n.length>11&&(n=n.startsWith(`1`)?n.slice(0,11):n.slice(0,10)),n.length===11&&n.startsWith(`1`)?`+`+n:n.length===10?`+1`+n:n}function Qt(e){if(!e||!e.trim())return`—`;let t=e.replace(/\D/g,``),n=t.length===11&&t.startsWith(`1`)?t.slice(1):t.length===10?t:null;return n?`(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`:e}function $t(e,t=``){if(!e)return null;let n=e.replace(/\D/g,``);if(n.length<7)return null;let r=`https://wa.me/${n}`;return t?`${r}?text=${encodeURIComponent(t)}`:r}var en=[{key:`nombre_completo`,label:`Nombre completo`,peso:10,grupo:`Personal`},{key:`fecha_nacimiento`,label:`Fecha de nacimiento`,peso:8,grupo:`Personal`},{key:`genero`,label:`Género`,peso:3,grupo:`Personal`},{key:`nacionalidad`,label:`Nacionalidad`,peso:3,grupo:`Personal`},{key:`municipio_residencia`,label:`Municipio`,peso:4,grupo:`Personal`},{key:`direccion`,label:`Dirección`,peso:4,grupo:`Personal`},{key:`madre_tlf_whatsapp`,label:`WhatsApp de la madre`,peso:8,grupo:`Contacto`},{key:`padre_tlf_whatsapp`,label:`WhatsApp del padre`,peso:5,grupo:`Contacto`},{key:`representante_tlf`,label:`Teléfono representante`,peso:5,grupo:`Contacto`},{key:`madre_nombre`,label:`Nombre de la madre`,peso:6,grupo:`Familia`},{key:`padre_nombre`,label:`Nombre del padre`,peso:5,grupo:`Familia`},{key:`representante_nombre`,label:`Nombre del representante`,peso:6,grupo:`Familia`},{key:`representante_parentesco`,label:`Parentesco representante`,peso:3,grupo:`Familia`},{key:`contacto_emergencia_nombre`,label:`Contacto de emergencia`,peso:4,grupo:`Familia`},{key:`instrumento_principal`,label:`Instrumento principal`,peso:8,grupo:`Musical`},{key:`instrumento_interes`,label:`Instrumento de interés`,peso:4,grupo:`Musical`},{key:`nivel_actual`,label:`Nivel actual`,peso:4,grupo:`Musical`},{key:`centro_estudios`,label:`Centro de estudios`,peso:4,grupo:`Escolar`},{key:`grado_nivel`,label:`Grado / Nivel`,peso:3,grupo:`Escolar`},{key:`alergias_descripcion`,label:`Alergias (declaradas)`,peso:3,grupo:`Salud`,opcional:!0},{key:`problemas_conducta`,label:`Conducta (declarada)`,peso:3,grupo:`Salud`,opcional:!0},{key:`acepta_pago_600`,label:`Acepta pago RD$600`,peso:5,grupo:`Compromisos`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos en redes`,peso:3,grupo:`Compromisos`}],tn=en.reduce((e,t)=>e+t.peso,0);function nn(e,t){let n=e[t];return!(n==null||n===``||typeof n==`string`&&n.trim()===``)}function rn(e){let t=[],n=[];for(let r of en)nn(e,r.key)?n.push(r):t.push(r);let r=n.reduce((e,t)=>e+t.peso,0),i=Math.round(r/tn*100),a=i>=90?`completo`:i>=65?`bueno`:i>=35?`parcial`:`critico`,o={};for(let t of en)o[t.grupo]||(o[t.grupo]={total:0,completos:0,porcentaje:0,faltantes:[]}),o[t.grupo].total++,nn(e,t.key)?o[t.grupo].completos++:o[t.grupo].faltantes.push(t.label);for(let e of Object.values(o))e.porcentaje=Math.round(e.completos/e.total*100);return{porcentaje:i,nivel:a,camposFaltantes:t,camposCompletos:n,porGrupo:o}}var an={critico:`danger`,parcial:`warning`,bueno:`info`,completo:`success`},on={critico:`Crítico`,parcial:`Parcial`,bueno:`Bueno`,completo:`Completo`};function sn(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`Fecha desconocida`}function cn(e){if(!e)return null;let t=new Date,n=new Date(e),r=t.getFullYear()-n.getFullYear(),i=t.getMonth()-n.getMonth();return(i<0||i===0&&t.getDate()<n.getDate())&&r--,r}function j(e){return e==null?``:String(e).replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e})}function ln(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var M={alumnos:[],alumnosOriginales:[],cargando:!1,editando:null,viewingId:null,deletingId:null,filtroGenero:``,filtroEstado:`todos`},N=null,un={nombreMax:100,emailMax:100,cedulaMax:20,telefonoMax:20,acudienteMax:100,direccionMax:255,sectionMax:100};async function dn(e){try{M.cargando=!0,fn(e);let t=await rt();M.alumnos=t,M.alumnosOriginales=[...t],M.cargando=!1,mn(e),_n(e)}catch(t){console.error(t),pn(e,t.message)}}function fn(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando alumnos...</p>
      </div>
    </div>
  `}function pn(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${j(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>dn(e))}function mn(e){e.innerHTML=`
    <div class="page-container">
      <div class="alumnos-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-people fs-4"></i>
          </div>
          <div>
            <h1 class="alumnos-title-premium mb-0">Alumnos</h1>
            <p class="text-muted small mb-0">${M.alumnos.length} alumnos en total</p>
          </div>
        </div>
        
        <div class="alumnos-header-actions flex-wrap">
          <button class="btn btn-outline-success btn-sm-compact" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-outline-secondary btn-sm-compact" id="btnReporteMes" title="Inscritos por mes">
            <i class="bi bi-bar-chart"></i> Reporte
          </button>
          <button class="btn btn-outline-danger btn-sm-compact" id="btnPdfDemo" title="Vista previa PDFs">
            <i class="bi bi-file-earmark-pdf"></i> PDFs
          </button>
          <button class="btn btn-success btn-sm-compact" id="btnInscribir">
            <i class="bi bi-person-plus me-1"></i>Inscribir
          </button>
          <button class="btn btn-premium-action" id="btnAgregarAlumno">
            <i class="bi bi-plus-lg me-1"></i>Nuevo Alumno
          </button>
        </div>
      </div>

      <div class="alumnos-filter-toolbar mb-4 flex-wrap">
        <div class="premium-search-container flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar alumno..." id="buscar" autocomplete="off">
        </div>

        <!-- Dropdown de Filtros Múltiples -->
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm-compact d-flex align-items-center gap-2 dropdown-toggle position-relative" type="button" id="btnDropdownFiltros" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" style="min-height: 32px; border-radius: 8px;">
            <i class="bi bi-funnel"></i> <span>Filtros</span>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary d-none" id="filtrosBadgeCount" style="font-size: 0.65rem; padding: 0.25em 0.5em;">
              0
            </span>
          </button>
          <div class="dropdown-menu dropdown-menu-end p-3 shadow-lg border" aria-labelledby="btnDropdownFiltros" style="min-width: 270px; border-radius: 12px; background: var(--bs-body-bg); z-index: 1050;">
            <h6 class="dropdown-header px-0 mb-2 text-primary d-flex align-items-center gap-2" style="font-size: 0.85rem; font-weight: 700; background: transparent; border: none; color: var(--bs-primary) !important;">
              <i class="bi bi-sliders"></i> Segmentar Alumnos
            </h6>
            
            <!-- Filtro WhatsApp -->
            <div class="mb-2">
              <label class="form-label-compact mb-1" style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">WhatsApp</label>
              <div class="position-relative d-flex align-items-center w-100">
                <i class="bi bi-whatsapp select-icon-muted" style="left: 10px; font-size: 0.85rem;"></i>
                <select class="form-select premium-filter-select" id="filtroWhatsapp" style="padding-left: 28px !important;">
                  <option value="todos">Todos</option>
                  <option value="con_whatsapp">Con WhatsApp</option>
                  <option value="sin_whatsapp">Sin WhatsApp</option>
                </select>
              </div>
            </div>

            <!-- Filtro Completitud -->
            <div class="mb-2">
              <label class="form-label-compact mb-1" style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">Completitud Perfil</label>
              <div class="position-relative d-flex align-items-center w-100">
                <i class="bi bi-shield-check select-icon-muted" style="left: 10px; font-size: 0.85rem;"></i>
                <select class="form-select premium-filter-select" id="filtroCompletitud" style="padding-left: 28px !important;">
                  <option value="todos">Todos los rangos</option>
                  <option value="critico">Crítico (Rojo)</option>
                  <option value="parcial">Parcial (Amarillo)</option>
                  <option value="bueno">Bueno (Turquesa)</option>
                  <option value="completo">Completo (Sin badge)</option>
                </select>
              </div>
            </div>

            <!-- Filtro Instrumento -->
            <div class="mb-3">
              <label class="form-label-compact mb-1" style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">Instrumento</label>
              <div class="position-relative d-flex align-items-center w-100">
                <i class="bi bi-music-note select-icon-muted" style="left: 10px; font-size: 0.85rem;"></i>
                <select class="form-select premium-filter-select" id="filtroInstrumento" style="padding-left: 28px !important;">
                  <option value="todos">Todos</option>
                  <option value="con_instrumento">Con Instrumento</option>
                  <option value="sin_instrumento">Sin Instrumento</option>
                </select>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
              <button class="btn btn-link btn-sm text-decoration-none text-muted p-0" id="btnLimpiarFiltros" style="font-size: 0.75rem;">
                <i class="bi bi-trash3 me-0.5"></i> Limpiar
              </button>
              <span class="text-muted" id="filtrosActivosCount" style="font-size: 0.72rem; font-weight: 600; opacity: 0.8;">
                Filtros activos: 0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="alumnosTBody">
          ${hn(M.alumnos)}
        </div>
        <div id="emptyContainer">
          ${M.alumnos.length===0?gn():``}
        </div>
      </div>

    </div>
  `}function hn(e){return e.length?e.map(e=>{let t=e.nombre||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`,{porcentaje:a,nivel:o}=rn(e),s=o!==`completo`,c=s?an[o]:``;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${ln(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${j(t)}</span>
            </div>
            <small class="text-muted text-truncate">
              ${j(e.instrumento||`Sin instrumento especificado`)} ${e.familiar_nombre?`• Rep: ${j(e.familiar_nombre)}`:``}
            </small>
          </div>
        </div>
        
        <!-- Acciones y Estados perfectamente alineados a la derecha -->
        <div class="d-flex align-items-center gap-3 flex-shrink-0">
          <!-- Columna Badge Completitud (52px de ancho fijo) -->
          <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 52px;">
            ${s?`
              <span class="badge badge-completitud badge-completitud-${c}" title="Perfil ${a}% completo — ${on[o]}">
                ${a}%
              </span>
            `:``}
          </div>
          
          <!-- Columna Botón Editar (36px de ancho fijo) -->
          <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 36px;">
            <button class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" data-action="edit" data-id="${e.id}" title="Editar alumno" style="height: 32px; width: 32px; min-height: 32px; padding: 0;">
              <i class="bi bi-pencil-square"></i>
            </button>
          </div>
          
          <!-- Columna Botón WhatsApp (36px de ancho fijo) -->
          <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 36px;">
            ${e.telefono?`
              <button class="btn btn-sm btn-success bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="height: 32px; width: 32px; min-height: 32px; padding: 0;">
                <i class="bi bi-whatsapp"></i>
              </button>
            `:``}
          </div>
          
          <!-- Flecha de Navegación -->
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function gn(){return`
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted mb-0">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
    </div>
  `}function _n(e){N=e,e.querySelector(`#btnAgregarAlumno`)?.addEventListener(`click`,()=>Sn()),e.querySelector(`#btnInscribir`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-inscribir`)),e.querySelector(`#btnReporteMes`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-reporte-mes`)),e.querySelector(`#btnPdfDemo`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-pdf-demo`)),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>Tn()),e.querySelector(`#buscar`)?.addEventListener(`input`,P),e.querySelector(`#filtroWhatsapp`)?.addEventListener(`change`,P),e.querySelector(`#filtroCompletitud`)?.addEventListener(`change`,P),e.querySelector(`#filtroInstrumento`)?.addEventListener(`change`,P),e.querySelector(`#btnLimpiarFiltros`)?.addEventListener(`click`,t=>{t.stopPropagation();let n=e.querySelector(`#filtroWhatsapp`),r=e.querySelector(`#filtroCompletitud`),i=e.querySelector(`#filtroInstrumento`);n&&(n.value=`todos`),r&&(r.value=`todos`),i&&(i.value=`todos`),P()}),e.querySelector(`#alumnosTBody`)?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){window.router?.navigate(`alumno`,{id:t.dataset.id});return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id;n.dataset.action===`edit`?window.router?.navigate(`alumno`,{id:r}):n.dataset.action===`delete`?Cn(r):n.dataset.action===`whatsapp`&&vn(r)})}function vn(e){let t=M.alumnosOriginales.find(t=>t.id===e);!t||!t.telefono||o.open({title:`Enviar WhatsApp a `+j(t.nombre),size:`md`,saveText:`Enviar WhatsApp`,body:`
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> ${Qt(t.telefono)}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,onSave:async e=>{let n=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=$t(t.telefono,n);r&&window.open(r,`_blank`)}})}function P(){let e=N.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=N.querySelector(`#filtroWhatsapp`)?.value||`todos`,n=N.querySelector(`#filtroCompletitud`)?.value||`todos`,r=N.querySelector(`#filtroInstrumento`)?.value||`todos`;M.alumnos=M.alumnosOriginales.filter(i=>{let a=!e||(i.nombre||``).toLowerCase().includes(e)||(i.instrumento||``).toLowerCase().includes(e)||(i.telefono||``).toLowerCase().includes(e)||(i.familiar_nombre||``).toLowerCase().includes(e),o=!!i.telefono&&i.telefono.trim()!==``,s=t===`todos`||t===`con_whatsapp`&&o||t===`sin_whatsapp`&&!o,{nivel:c}=rn(i),l=n===`todos`||n===c,u=!!i.instrumento&&i.instrumento.trim()!==``&&i.instrumento.toLowerCase()!==`sin instrumento especificado`;return a&&s&&l&&(r===`todos`||r===`con_instrumento`&&u||r===`sin_instrumento`&&!u)});let i=0;t!==`todos`&&i++,n!==`todos`&&i++,r!==`todos`&&i++;let a=N.querySelector(`#filtrosBadgeCount`);a&&(a.textContent=i,i>0?a.classList.remove(`d-none`):a.classList.add(`d-none`));let o=N.querySelector(`#filtrosActivosCount`);o&&(o.textContent=`Filtros activos: ${i}`),wn()}function yn(e=``){return dt.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function bn(e=null){let t=e||{};return`<form class="row g-2">
    <div class="col-12">
      <label class="form-label-compact">Nombre Completo *</label>
      <input type="text" class="form-control input-dense" id="modal-nombre" maxlength="${un.nombreMax}" required placeholder="Juan Pérez" autocomplete="off" value="${j(t.nombre||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Teléfono (WhatsApp) *</label>
      <input type="tel" class="form-control input-dense" id="modal-telefono" required placeholder="+58 412 555 1234" autocomplete="off" value="${j(t.telefono||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Email</label>
      <input type="email" class="form-control input-dense" id="modal-email" maxlength="${un.emailMax}" placeholder="representante@ejemplo.com" autocomplete="off" value="${j(t.email||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Cédula del Alumno</label>
      <input type="text" class="form-control input-dense" id="modal-cedula" maxlength="${un.cedulaMax}" placeholder="12345678" autocomplete="off" value="${j(t.cedula||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Fecha de Nacimiento</label>
      <input type="date" class="form-control input-dense" id="modal-fechaNacimiento" value="${t.fecha_nacimiento||``}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Género</label>
      <select class="form-select input-dense" id="modal-genero">
        <option value="" ${t.genero?``:`selected`}>No especificado</option>
        <option value="M" ${t.genero===`M`?`selected`:``}>Masculino</option>
        <option value="F" ${t.genero===`F`?`selected`:``}>Femenino</option>
        <option value="O" ${t.genero===`O`?`selected`:``}>Otro</option>
        <option value="N" ${t.genero===`N`?`selected`:``}>No binario</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Instrumento *</label>
      <input type="text" class="form-control input-dense" id="modal-instrumento" required maxlength="${un.sectionMax}" placeholder="Violín, Piano..." autocomplete="off" value="${j(t.instrumento||``)}">
    </div>
    <div class="col-12">
      <label class="form-label-compact">Dirección</label>
      <input type="text" class="form-control input-dense" id="modal-direccion" maxlength="${un.direccionMax}" placeholder="Dirección completa" autocomplete="off" value="${j(t.direccion||``)}">
    </div>
    
    <div class="col-12 mt-3">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-contacto-emergencia-nombre" placeholder="Nombre contacto" value="${j(t.contacto_emergencia_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-contacto-emergencia-telefono" placeholder="+58 412 555 1234" value="${j(t.contacto_emergencia_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-contacto-emergencia-parentesco">
              ${yn(t.contacto_emergencia_parentesco)}
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-people me-1"></i>Datos del Familiar</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-familiar-nombre" placeholder="Nombre familiar" value="${j(t.familiar_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-familiar-telefono-input" placeholder="+58 412 555 1234" value="${j(t.familiar_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-familiar-parentesco-input">
              ${yn(t.familiar_parentesco)}
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="border rounded p-2 bg-warning bg-opacity-10">
        <h6 class="mb-2"><i class="bi bi-heart-pulse me-1"></i>Información Médica</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Condiciones médicas</label>
            <textarea class="form-control input-dense" id="modal-condiciones-medicas" rows="2" placeholder="Diabetes, epilepsia, etc.">${j(t.condiciones_medicas||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Alergias</label>
            <textarea class="form-control input-dense" id="modal-alergias" rows="2" placeholder="Alimentos, medicamentos, etc.">${j(t.alergias||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Medicamentos</label>
            <textarea class="form-control input-dense" id="modal-medicamentos" rows="2" placeholder="Medicamentos actuales">${j(t.medicamentos||``)}</textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="modal-esActivo" ${t.is_active===!1?``:`checked`}>
        <label class="form-check-label" for="modal-esActivo">Alumno activo</label>
      </div>
    </div>
  </form>`}async function xn(e,t=null){let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),a=e.querySelector(`#modal-telefono`).value.trim(),o=e.querySelector(`#modal-cedula`).value.trim(),s=e.querySelector(`#modal-fechaNacimiento`).value,c=e.querySelector(`#modal-genero`).value,l=e.querySelector(`#modal-instrumento`).value.trim(),u=e.querySelector(`#modal-familiar-nombre`).value.trim(),d=e.querySelector(`#modal-familiar-telefono-input`).value.trim()||a,f=e.querySelector(`#modal-familiar-parentesco-input`).value,p=e.querySelector(`#modal-esActivo`).checked;return n?l?a?{nombre:n,email:r||null,telefono:Zt(a)||a,cedula:o||null,fecha_nacimiento:s||null,genero:c||null,instrumento:l,is_active:p,familiar_nombre:u||null,familiar_telefono:Zt(d)||d||null,familiar_parentesco:f||null,contacto_emergencia_nombre:e.querySelector(`#modal-contacto-emergencia-nombre`).value.trim()||null,contacto_emergencia_telefono:Zt(e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim())||e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim()||null,contacto_emergencia_parentesco:e.querySelector(`#modal-contacto-emergencia-parentesco`).value||null,condiciones_medicas:e.querySelector(`#modal-condiciones-medicas`).value.trim()||null,alergias:e.querySelector(`#modal-alergias`).value.trim()||null,medicamentos:e.querySelector(`#modal-medicamentos`).value.trim()||null}:(i.error(`El teléfono es obligatorio para WhatsApp`),null):(i.error(`El instrumento es obligatorio`),null):(i.error(`El nombre es obligatorio`),null)}function Sn(){M.editando=null,o.open({title:`Crear Nuevo Alumno`,size:`lg`,body:bn(),saveText:`Guardar`,onSave:async e=>{let t=await xn(e);if(!t)return!1;let n=await ot(t);M.alumnosOriginales.push(n),P(),i.success(`Alumno creado exitosamente`)}})}function Cn(e){let t=M.alumnosOriginales.find(t=>t.id===e);if(!t){i.error(`Alumno no encontrado`);return}M.deletingId=e,o.open({title:`⚠️ Eliminar Alumno`,size:`md`,saveText:`Eliminar`,body:`<div class="d-flex flex-column align-items-center justify-content-center py-5">
             <div class="spinner-border text-primary mb-3" role="status">
               <span class="visually-hidden">Cargando...</span>
             </div>
             <p class="text-muted mb-0">Analizando estado de inscripciones...</p>
           </div>`,onSave:async()=>{await ct(e),M.alumnosOriginales=M.alumnosOriginales.filter(t=>t.id!==e),P(),o.close(),i.success(`Alumno eliminado correctamente`)}});let n=document.querySelector(`#app-global-modal .app-modal-btn-save`);n&&(n.style.display=`none`),setTimeout(async()=>{try{if(M.deletingId!==e)return;let r=await lt(e),i=document.querySelector(`#app-global-modal .app-modal-body`);if(!i||M.deletingId!==e)return;n&&(n.style.display=``),r.length===0?i.innerHTML=`
          <div class="alert alert-success d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(40, 167, 69, 0.08); color: #155724;">
            <i class="bi bi-person-check-fill fs-3 text-success mt-1"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1" style="color: #0f6826;">Contacto Huérfano / Eliminación Segura</h6>
              <p class="mb-0 small" style="opacity: 0.9;">Este alumno no posee matrículas registradas ni está inscrito en ninguna clase activa en el período actual. Su eliminación no afectará datos académicos.</p>
            </div>
          </div>
          <p class="mb-2">¿Estás seguro de que querés eliminar permanentemente al alumno <strong>${j(t.nombre)}</strong>?</p>
          <p class="text-muted small mb-0"><i class="bi bi-info-circle me-1"></i> Esta acción es irreversible y limpiará todo su registro de contacto del sistema.</p>
        `:i.innerHTML=`
          <div class="alert alert-danger d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(220, 53, 69, 0.08); color: #721c24;">
            <i class="bi bi-exclamation-triangle-fill fs-3 text-danger mt-1"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1" style="color: #af232f;">¡Alumno con Clases Activas!</h6>
              <p class="mb-2 small" style="opacity: 0.9;">Este alumno está matriculado e inscrito en las siguientes clases del período actual:</p>
              <ul class="list-unstyled mb-2 ps-0" style="max-height: 150px; overflow-y: auto;">
                ${r.map(e=>`
          <li class="d-flex align-items-center gap-2 py-2 border-bottom border-light">
            <i class="bi bi-journal-bookmark-fill text-danger fs-5"></i>
            <span class="fw-semibold text-dark" style="font-size: 0.9rem;">${j(e.clase_nombre)}</span>
          </li>
        `).join(``)}
              </ul>
              <p class="mb-0 small fw-bold mt-2"><i class="bi bi-slash-circle-fill me-1"></i> ADVERTENCIA CRÍTICA: Eliminar a este alumno borrará físicamente su registro de asistencia, calificaciones históricas y matrículas activas.</p>
            </div>
          </div>
          <p class="mb-2">¿Realmente querés eliminar permanentemente al alumno <strong>${j(t.nombre)}</strong> y todos sus registros?</p>
          <p class="text-muted small mb-0"><i class="bi bi-exclamation-octagon-fill text-danger me-1"></i> Esta acción no se puede deshacer y puede provocar inconsistencias en los reportes de estas clases.</p>
        `}catch(r){if(console.error(r),M.deletingId!==e)return;let i=document.querySelector(`#app-global-modal .app-modal-body`);i&&(n&&(n.style.display=``),i.innerHTML=`
          <div class="alert alert-warning d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1">Error de Verificación</h6>
              <p class="mb-0 small">No se pudo comprobar si el alumno tiene clases activas. Procedé con precaución.</p>
            </div>
          </div>
          <p>¿Querés eliminar al alumno <strong>${j(t.nombre)}</strong> de todas formas?</p>
        `)}},300)}function wn(){let e=N.querySelector(`#alumnosTBody`);if(!e)return;M.alumnos.length===0?e.innerHTML=gn():e.innerHTML=hn(M.alumnos);let t=N.querySelector(`#emptyContainer`);t&&(t.innerHTML=M.alumnos.length===0?gn():``);let n=N.querySelector(`.alumnos-header-premium p.text-muted`);n&&(n.textContent=`${M.alumnos.length} alumnos en total`)}function Tn(){if(M.alumnosOriginales.length===0){i.error(`No hay alumnos para exportar`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Estado`,`Fecha Nac.`,`Sección`],...M.alumnosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.estado||`activo`,e.fecha_nacimiento||``,e.section||``])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`alumnos-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),i.success(`CSV exportado exitosamente`)}var F=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.descripcion=e.descripcion||``,this.nivel=e.nivel||``,this.duracion_anios=e.duracion_anios||null,this.activo=e.activo===void 0?!0:e.activo,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(e=[]){let t=[];return!this.nombre||!this.nombre.trim()?t.push(`El nombre del programa es obligatorio`):this.nombre.length>100&&t.push(`El nombre no puede exceder los 100 caracteres`),this.nivel?e.length>0&&!e.includes(this.nivel)&&t.push(`El nivel seleccionado no es válido`):t.push(`El nivel es obligatorio`),this.descripcion&&this.descripcion.length>500&&t.push(`La descripción no puede exceder los 500 caracteres`),this.duracion_anios!==null&&(isNaN(this.duracion_anios)||this.duracion_anios<0)&&t.push(`La duración debe ser un número positivo`),t}toJSON(){return{nombre:this.nombre.trim(),descripcion:this.descripcion?this.descripcion.trim():``,nivel:this.nivel,duracion_anios:this.duracion_anios,activo:this.activo}}},En=[{value:``,label:`Sin nivel específico`},{value:`1`,label:`1° Año`},{value:`2`,label:`2° Año`},{value:`3`,label:`3° Año`},{value:`4`,label:`4° Año`},{value:`5`,label:`5° Año`},{value:`6`,label:`6° Año`},{value:`inicial`,label:`Nivel Inicial`},{value:`intermedio`,label:`Nivel Intermedio`},{value:`avanzado`,label:`Nivel Avanzado`},{value:`preuniversitario`,label:`Pre-Universitario`}];function Dn(e){let t=En.find(t=>t.value===e);return t?t.label:e||`-`}async function On(){let{data:e,error:n}=await t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando programas:`,n.message),n;return(e||[]).map(e=>new F(e))}async function kn(e){let n=new F(e),r=En.map(e=>e.value).filter(Boolean),i=n.validate(r);if(i.length>0)throw Error(i.join(`. `));let{data:a,error:o}=await t.from(`programas`).insert([n.toJSON()]).select();if(o)throw console.error(`Error creando programa:`,o.message),o;return new F(a[0])}async function An(e,n){let r=new F(n),i=En.map(e=>e.value).filter(Boolean),a=r.validate(i);if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`programas`).update(r.toJSON()).eq(`id`,e).select();if(s)throw console.error(`Error actualizando programa:`,s.message),s;return new F(o[0])}async function jn(e){let{error:n}=await t.from(`programas`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando programa:`,n.message),n}async function Mn(e){let{jsPDF:t}=await a(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-C6WUHrjo.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([0,1,2,3])),{default:n}=await a(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BYntMLuC.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([4,1])),r=new t;r.setFontSize(18),r.text(`Programas Académicos`,14,22),r.setFontSize(10),r.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,30),n(r,{head:[[`Nombre`,`Nivel`,`Descripción`,`Estado`,`Creado`]],body:e.map(e=>[e.nombre,Dn(e.nivel),e.descripcion?e.descripcion.substring(0,50)+(e.descripcion.length>50?`...`:``):`-`,e.activo?`Activo`:`Inactivo`,e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`):`-`]),startY:35,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),r.save(`programas.pdf`)}var I={programas:[],programasOriginales:[],cargando:!1},Nn={nombreMax:100,descripcionMax:500};function L(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function Pn(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`N/A`}function Fn(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function In(e=``){return En.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}async function Ln(e){try{I.cargando=!0,Rn(e);let t=await On();I.programas=t,I.programasOriginales=[...t],I.cargando=!1,Bn(e),Wn(e)}catch(t){console.error(`[ProgramasView]`,t),zn(e,t.message)}}function Rn(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando programas...</p>
      </div>
    </div>
  `}function zn(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${L(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>Ln(e))}function Bn(e){e.innerHTML=`
    <div class="page-container">
      <div class="programas-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-journal-bookmark fs-4"></i>
          </div>
          <div>
            <h1 class="programas-title-premium page-title mb-0">Programas</h1>
            <p class="text-muted small mb-0">${I.programas.length} programas en total</p>
          </div>
        </div>
        
        <div class="programas-header-actions">
          <button class="btn btn-outline-secondary btn-sm-compact me-2" id="btnExportarPDF" title="Exportar PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="btn btn-premium-action" id="btnAgregarPrograma">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Programa
          </button>
        </div>
      </div>

      <div class="programas-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar programa..." id="buscar">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="programasTBody">
          ${Vn(I.programas)}
        </div>
        <div id="emptyContainer">
          ${I.programas.length===0?Hn():``}
        </div>
      </div>
    </div>
  `}function Vn(e){return e.length?e.map(e=>{let t=Fn(e.nombre),n=Dn(e.nivel),r=L(e.descripcion||`Sin descripción`),i=`border-accent-${e.activo?`success`:`secondary`}`,a=`bg-${e.activo?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${t}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${L(e.nombre)}</span>
            <small class="text-muted text-truncate">${n} • ${r.substring(0,50)}${r.length>50?`...`:``}</small>
          </div>
        </div>
        <div class="flex-shrink-0 text-muted ms-2 pe-1">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function Hn(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No hay programas que coincidan con la búsqueda.</p>
    </div>
  `}var Un=null;function Wn(e){Un=e,e.querySelector(`#btnAgregarPrograma`)?.addEventListener(`click`,()=>qn()),e.querySelector(`#btnExportarPDF`)?.addEventListener(`click`,async()=>{try{await Mn(I.programas),i.success(`PDF generado exitosamente`)}catch{i.error(`Error al generar PDF`)}}),e.querySelector(`#buscar`)?.addEventListener(`input`,Gn),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,Gn),e.querySelector(`#programasTBody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t){let t=e.target.closest(`.list-group-item[data-id]`);t&&Xn(t.dataset.id);return}let{action:n,id:r}=t.dataset;n===`edit`&&Jn(r),n===`delete`&&Zn(r)})}function Gn(){let e=Un.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=Un.querySelector(`#filtroEstado`)?.value||`todos`;I.programas=I.programasOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||(n.descripcion||``).toLowerCase().includes(e),i=t===`todos`||t===`activo`&&n.activo||t===`inactivo`&&!n.activo;return r&&i}),Kn()}function Kn(){let e=Un.querySelector(`#programasTBody`);e&&(e.innerHTML=Vn(I.programas));let t=Un.querySelector(`#emptyContainer`);t&&(t.innerHTML=I.programas.length===0?Hn():``)}function qn(){Yn({title:`Nuevo Programa`,saveText:`Crear Programa`})}function Jn(e){let t=I.programasOriginales.find(t=>t.id===e);if(!t)return i.error(`Programa no encontrado`);Yn({title:`Editar Programa`,saveText:`Guardar Cambios`,programa:t})}function Yn({title:e,saveText:t,programa:n=null}){o.open({title:e,saveText:t,body:`
      <form id="form-programa" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Nombre del Programa *</label>
          <input type="text" class="form-control input-dense" id="prog-nombre" required maxlength="${Nn.nombreMax}" value="${L(n?.nombre||``)}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Nivel / Año *</label>
          <select class="form-select input-dense" id="prog-nivel">
            ${In(n?.nivel||``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Duración (años)</label>
          <input type="number" class="form-control input-dense" id="prog-duracion" min="0" step="0.5" value="${n?.duracion_anios||``}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción</label>
          <textarea class="form-control input-dense" id="prog-descripcion" rows="3" maxlength="${Nn.descripcionMax}">${L(n?.descripcion||``)}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="prog-activo" ${n?.activo===!1?``:`checked`}>
            <label class="form-check-label" for="prog-activo">Programa Activo</label>
          </div>
        </div>
      </form>
    `,onSave:async e=>{let t={nombre:e.querySelector(`#prog-nombre`).value.trim(),nivel:e.querySelector(`#prog-nivel`).value,duracion_anios:e.querySelector(`#prog-duracion`).value?parseFloat(e.querySelector(`#prog-duracion`).value):null,descripcion:e.querySelector(`#prog-descripcion`).value.trim(),activo:e.querySelector(`#prog-activo`).checked},r=new F(t),a=En.map(e=>e.value).filter(Boolean),o=r.validate(a);if(o.length>0)return i.error(o[0]),!1;try{if(n){let e=await An(n.id,t),r=I.programasOriginales.findIndex(e=>e.id===n.id);I.programasOriginales[r]=e,i.success(`Programa actualizado`)}else{let e=await kn(t);I.programasOriginales.unshift(e),i.success(`Programa creado`)}return Gn(),!0}catch(e){return i.error(e.message),!1}}})}function Xn(e){let t=I.programasOriginales.find(t=>t.id===e);t&&o.open({title:`Perfil del Programa`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="programa-profile">
        <!-- Header Banner / Avatar Section -->
        <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
          <div class="position-relative" style="flex-shrink: 0;">
            <div class="avatar-large bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center fw-bold" 
                 style="width: 60px; height: 60px; font-size: 1.6rem; border-radius: 50%;">
              ${Fn(t.nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 bg-${t.activo?`success`:`danger`} border border-light rounded-circle" 
                  style="transform: translate(10%, 10%);"
                  title="${t.activo?`Activo`:`Inactivo`}">
            </span>
          </div>
          <div class="overflow-hidden">
            <h4 class="h5 mb-1 fw-bold text-truncate" style="letter-spacing: -0.01em;">${L(t.nombre)}</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">${Dn(t.nivel)}</span>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="row g-3">
          <div class="col-md-6">
            <div class="programa-profile-card h-100">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-clock me-1 text-primary"></i> Duración
              </label>
              <p class="mb-0 fw-semibold programa-profile-value" style="font-size: 0.95rem;">
                ${t.duracion_anios?`${t.duracion_anios} ${t.duracion_anios===1?`año`:`años`}`:`No especificada`}
              </p>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="programa-profile-card h-100 d-flex flex-column justify-content-between">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-fingerprint me-1 text-primary"></i> Identificador
              </label>
              <div class="d-flex align-items-center justify-content-between">
                <span class="font-monospace programa-profile-value small text-truncate pe-2" style="font-size: 0.85rem;">${t.id}</span>
                <button class="btn btn-link btn-sm p-0 text-decoration-none text-muted" id="copy-id-btn" title="Copiar ID" style="cursor: pointer;">
                  <i class="bi bi-copy"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="programa-profile-card">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-file-text me-1 text-primary"></i> Descripción
              </label>
              <p class="mb-0 programa-profile-desc" style="font-size: 0.9rem; line-height: 1.5; white-space: pre-line;">
                ${L(t.descripcion||`Sin descripción detallada.`)}
              </p>
            </div>
          </div>

          <div class="col-12">
            <div class="programa-profile-card">
              <div class="row g-2">
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-check me-1"></i> Creado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${Pn(t.created_at)}</p>
                </div>
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-event me-1"></i> Modificado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${t.updated_at?Pn(t.updated_at):Pn(t.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="col-12 text-end d-flex align-items-center justify-content-end gap-2 mt-2">
            <button class="btn btn-outline-danger btn-sm px-3" id="view-delete-btn" title="Eliminar programa">
              <i class="bi bi-trash me-1"></i> Eliminar
            </button>
            <button class="btn btn-primary btn-sm px-4" id="view-edit-btn" title="Editar programa">
              <i class="bi bi-pencil me-1"></i> Editar
            </button>
          </div>
        </div>
      </div>
    `,onShow:n=>{n.querySelector(`#view-edit-btn`).addEventListener(`click`,()=>{o.close(),setTimeout(()=>Jn(e),300)}),n.querySelector(`#view-delete-btn`).addEventListener(`click`,()=>{o.close(),setTimeout(()=>Zn(e),300)}),n.querySelector(`#copy-id-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(t.id),i.success(`ID copiado al portapapeles`)})}})}function Zn(e){let t=I.programasOriginales.find(t=>t.id===e);t&&o.open({title:`⚠️ Eliminar Programa`,saveText:`Confirmar Eliminación`,body:`
      <p>¿Estás seguro de eliminar el programa <strong>${L(t.nombre)}</strong>?</p>
      <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Esta acción no se puede deshacer.</p>
    `,onSave:async()=>{try{return await jn(e),I.programasOriginales=I.programasOriginales.filter(t=>t.id!==e),Gn(),i.success(`Programa eliminado`),!0}catch{return i.error(`Error al eliminar`),!1}}})}function Qn(e){return e?{...e,user_id:e.user_id??null,nombre:e.nombre_completo??``,email:e.correo??``,telefono:e.tlf??``,instrumento:e.especialidad??``,bio:e.resena??``,is_active:e.activo??!0,especialidades:Array.isArray(e.especialidades)?e.especialidades:[]}:null}async function $n(){let{data:e,error:n}=await t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0});if(n)throw console.error(`Error cargando maestros:`,n.message),Error(`No se pudieron cargar los maestros`);return e.map(Qn)}async function er(e,n){let r={},i=n.nombre||n.nombre_completo;i!==void 0&&(r.nombre_completo=i.trim());let a=n.email||n.correo;a!==void 0&&(r.correo=a.trim().toLowerCase());let o=n.telefono||n.tlf;o!==void 0&&(r.tlf=o.trim());let s=n.instrumento||n.especialidad;s!==void 0&&(r.especialidad=s.trim());let c=n.bio||n.resena;c!==void 0&&(r.resena=c.trim()),n.is_active!==void 0&&(r.activo=n.is_active),n.activo!==void 0&&(r.activo=n.activo),n.especialidades!==void 0&&(r.especialidades=Array.isArray(n.especialidades)?n.especialidades:[]);let{data:l,error:u}=await t.from(`maestros`).update(r).eq(`id`,e).select();if(u)throw console.error(`Error actualizando maestro:`,u.message),Error(`No se pudo actualizar el maestro`);return Qn(l[0])}async function tr(e){let{error:n}=await t.from(`maestros`).update({activo:!1}).eq(`id`,e);if(n)throw console.error(`Error inactivando maestro:`,n.message),Error(`No se pudo desactivar el maestro`)}async function nr(e){let{error:n}=await t.from(`maestros`).update({activo:!0}).eq(`id`,e);if(n)throw console.error(`Error activando maestro:`,n.message),Error(`No se pudo activar el maestro`)}async function rr(e){let{data:n,error:r}=await t.from(`maestros`).select(`id`).eq(`correo`,e.trim().toLowerCase()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando email:`,r.message),!!n}function R(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function ir(e){return e?`success`:`secondary`}function ar(e){return e?`Activo`:`Inactivo`}function or(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function z(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function B(e){if(!e)return``;let t=e.split(`:`);return t.length>=2?`${t[0]}:${t[1]}`:e}function sr(e){return{activa:`Activa`,suspendida:`Suspendida`,finalizada:`Finalizada`}[e]||`Activa`}function cr(e){return e&&{violin:`bi-music-note-beamed`,viola:`bi-music-note-beamed`,cello:`bi-music-note-beamed`,bajo:`bi-music-note-beamed`,guitarra:`bi-music-note-beamed`,arpa:`bi-music-note-beamed`,flauta:`bi-wind`,oboe:`bi-wind`,clarinete:`bi-wind`,fagot:`bi-wind`,trompa:`bi-wind`,trompeta:`bi-wind`,trombon:`bi-wind`,tuba:`bi-wind`,piano:`bi-piano`,percusion:`bi-disc`,voz:`bi-mic`,direccion:`bi-person-badge`,solfeo:`bi-journal-text`,teoría:`bi-book`}[e.toLowerCase()]||`bi-music-note`}function lr(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function ur(e){let t=[`#007aff`,`#5856d6`,`#34c759`,`#ff3b30`,`#ff9500`,`#5ac8fa`];if(!e)return t[0];let n=0;for(let t=0;t<e.length;t++)n=e.charCodeAt(t)+((n<<5)-n);return t[Math.abs(n)%t.length]}function V(e){if(!e)return 0;let t=e.trim(),n=!1,r=t;t.toLowerCase().includes(`pm`)?(n=!0,r=t.toLowerCase().replace(`pm`,``).trim()):t.toLowerCase().includes(`am`)&&(r=t.toLowerCase().replace(`am`,``).trim());let i=r.split(`:`),a=parseInt(i[0],10)||0,o=parseInt(i[1],10)||0;return n&&a<12?a+=12:!n&&a===12&&(a=0),a*60+o}var dr=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.maestro_principal_id=e.maestro_principal_id||e.maestro_id||null,this.maestro_suplente_id=e.maestro_suplente_id||e.maestro_auxiliar_id||null,this.tiene_suplente=e.tiene_suplente||!1,this.programa_id=e.programa_id||null,this.instrumento=e.instrumento||``,this.horarios=e.horarios||[],this.capacidad_maxima=e.capacidad_maxima??e.max_alumnos??20,this.estado=e.estado||`activa`,this.descripcion=e.descripcion||e.notas_pedagogicas||``,this.tipo_clase=e.tipo_clase||`grupal`,this.nivel_id=e.nivel_id||null,this.planificacion_id=e.planificacion_id||null,this.ruta_id=e.ruta_id||null,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}get maestro_id(){return this.maestro_principal_id}set maestro_id(e){this.maestro_principal_id=e}get maestro_auxiliar_id(){return this.maestro_suplente_id}set maestro_auxiliar_id(e){this.maestro_suplente_id=e}get max_alumnos(){return this.capacidad_maxima}set max_alumnos(e){this.capacidad_maxima=e}get notas_pedagogicas(){return this.descripcion}set notas_pedagogicas(e){this.descripcion=e}validate(){let e=[];!this.nombre||!this.nombre.trim()?e.push(`El nombre es obligatorio`):this.nombre.trim().length<3?e.push(`El nombre debe tener mínimo 3 caracteres`):this.nombre.trim().length>100&&e.push(`El nombre no puede exceder 100 caracteres`),this.maestro_principal_id||e.push(`El maestro titular es obligatorio`),this.programa_id||e.push(`El programa es obligatorio`),(!this.instrumento||!this.instrumento.trim())&&e.push(`El instrumento es obligatorio`),(!this.horarios||this.horarios.length===0)&&e.push(`Debe agregar al menos un horario`);for(let t of this.horarios)t.dia||e.push(`El día es obligatorio en todos los horarios`),(!t.hora_inicio||!t.hora_fin)&&e.push(`La hora de inicio y fin son obligatorias en todos los horarios`),t.hora_inicio&&t.hora_fin&&V(t.hora_inicio)>=V(t.hora_fin)&&e.push(`La hora de inicio debe ser menor que la hora de fin`);let t={};this.horarios.forEach(e=>{if(!e.dia||!e.hora_inicio||!e.hora_fin)return;let n=e.dia.toLowerCase().trim();t[n]||(t[n]=[]),t[n].push(e)});for(let n in t){let r=t[n].sort((e,t)=>V(e.hora_inicio)-V(t.hora_inicio));for(let t=0;t<r.length-1;t++){let i=r[t],a=r[t+1];if(V(i.hora_fin)>V(a.hora_inicio)){let t=n.charAt(0).toUpperCase()+n.slice(1);e.push(`Existen horarios solapados en la misma clase (${t})`);break}}}return this.capacidad_maxima!==void 0&&this.capacidad_maxima!==null&&(this.capacidad_maxima<1?e.push(`El máximo de alumnos debe ser al menos 1`):this.capacidad_maxima>100&&e.push(`El máximo de alumnos no puede exceder 100`)),this.descripcion&&this.descripcion.length>1e3&&e.push(`Las notas pedagógicas no pueden exceder 1000 caracteres`),e}isCompleto(){return!!(this.nombre&&this.maestro_principal_id&&this.programa_id&&this.instrumento&&this.horarios?.length>0)}toJSON(){return{id:this.id,nombre:this.nombre.trim(),maestro_principal_id:this.maestro_principal_id,maestro_suplente_id:this.maestro_suplente_id||null,programa_id:this.programa_id,instrumento:this.instrumento.trim(),capacidad_maxima:this.capacidad_maxima,estado:this.estado,descripcion:this.descripcion.trim()||null,tipo_clase:this.tipo_clase||`grupal`,ruta_id:this.ruta_id||null}}static getEstados(){return[`activa`,`suspendida`,`finalizada`]}static getDiasSemana(){return[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`]}static getEstadoLabel(e){return{activa:`Activa`,suspendida:`Suspendida`,finalizada:`Finalizada`}[e]||e}};async function fr({salonId:e,maestroId:n,dia:r,horaInicio:i,horaFin:a,excludeClaseId:o=null}){if(!r||!i||!a)return null;let s=V(i),c=V(a);if(e){let{data:n,error:i}=await t.from(`clase_horarios`).select(`*, clases(nombre)`).eq(`salon_id`,e).eq(`dia`,r);if(!i&&n)for(let e of n){if(o&&e.clase_id===o)continue;let t=V(e.hora_inicio);if(s<V(e.hora_fin)&&t<c)return{tipo:`salón`,clase_nombre:e.clases?.nombre||`Otra clase`,detalle:`El salón ya está ocupado por "${e.clases?.nombre}"`,horario:`${e.dia} de ${B(e.hora_inicio)} a ${B(e.hora_fin)}`}}}if(n){let{data:e,error:i}=await t.from(`clase_horarios`).select(`*, clases!inner(nombre, maestro_principal_id)`).eq(`clases.maestro_principal_id`,n).eq(`dia`,r);if(!i&&e)for(let t of e){if(o&&t.clase_id===o)continue;let e=V(t.hora_inicio);if(s<V(t.hora_fin)&&e<c)return{tipo:`maestro`,clase_nombre:t.clases?.nombre||`Otra clase`,detalle:`El maestro ya tiene otra clase asignada ("${t.clases?.nombre}")`,horario:`${t.dia} de ${B(t.hora_inicio)} a ${B(t.hora_fin)}`}}}return null}function H(e){return e?new dr({...e,maestro_principal_id:e.maestro_principal_id??e.maestro_id??null,maestro_suplente_id:e.maestro_suplente_id??null,tiene_suplente:!!e.maestro_suplente_id,capacidad_maxima:e.capacidad_maxima??e.max_alumnos??20,descripcion:e.descripcion??e.notas_pedagogicas??``}):null}async function pr(){let{data:e,error:n}=await t.from(`clases`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando clases:`,n.message),Error(`No se pudieron cargar las clases`);let{data:r}=await t.from(`clase_horarios`).select(`*`).order(`dia`,{ascending:!0});return(e||[]).map(e=>{let t=H(e);return t.horarios=r?.filter(t=>t.clase_id===e.id)||[],t})}async function mr(e){let{data:n,error:r}=await t.from(`clases`).select(`*`).eq(`id`,e).single();if(r)throw console.error(`Error cargando clase:`,r.message),Error(`Clase no encontrada`);let{data:i}=await t.from(`clase_horarios`).select(`*`).eq(`clase_id`,e),a=H(n);return a.horarios=i||[],a}async function hr(e,n=!1){let r=H(e);r.horarios=e.horarios||[];let i=r.validate();if(i.length>0)throw Error(i.join(`. `));if(!n)for(let e of r.horarios){let t=await fr({salonId:e.salon_id,maestroId:r.maestro_principal_id,dia:e.dia,horaInicio:e.hora_inicio,horaFin:e.hora_fin});if(t){let e=Error(`Conflicto de ${t.tipo}: ${t.detalle} el ${t.horario}`);throw e.isConflict=!0,e.conflictData=t,e}}let a=r.toJSON();delete a.id;let{data:o,error:s}=await t.from(`clases`).insert([a]).select();if(s)throw console.error(`Error creando clase:`,s.message),Error(`No se pudo crear la clase`);let c=o[0];if(r.horarios.length>0){let e=r.horarios.map(e=>({clase_id:c.id,dia:e.dia,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,salon_id:e.salon_id||null,maestro_id:c.maestro_principal_id})),{error:n}=await t.from(`clase_horarios`).insert(e);if(n)throw console.error(`Error creando horarios:`,n.message),await t.from(`clases`).delete().eq(`id`,c.id),Error(`No se pudieron crear los horarios de la clase`);return H({...c,horarios:e})}return H(c)}async function gr(e,n,r=!1){let i=await mr(e),a=new dr({...i,...n});n.horarios===void 0?a.horarios=i.horarios:a.horarios=n.horarios;let o=a.validate();if(o.length>0)throw Error(o.join(`. `));if(!r&&n.horarios)for(let t of a.horarios){let n=await fr({salonId:t.salon_id,maestroId:a.maestro_id,dia:t.dia,horaInicio:t.hora_inicio,horaFin:t.hora_fin,excludeClaseId:e});if(n){let e=Error(`Conflicto de ${n.tipo}: ${n.detalle} el ${n.horario}`);throw e.isConflict=!0,e.conflictData=n,e}}let{data:s,error:c}=await t.from(`clases`).update(a.toJSON()).eq(`id`,e).select();if(c)throw console.error(`Error actualizando clase:`,c.message),Error(`No se pudo actualizar la clase`);if(n.horarios){let{error:r}=await t.from(`clase_horarios`).delete().eq(`clase_id`,e);if(r)throw console.error(`Error eliminando horarios anteriores:`,r.message),Error(`No se pudieron actualizar los horarios de la clase`);if(n.horarios.length>0){let r=n.horarios.map(t=>({clase_id:e,dia:t.dia,hora_inicio:t.hora_inicio,hora_fin:t.hora_fin,salon_id:t.salon_id||null,maestro_id:a.maestro_principal_id})),{error:i}=await t.from(`clase_horarios`).insert(r);if(i)throw console.error(`Error insertando nuevos horarios:`,i.message),Error(`No se pudieron guardar los nuevos horarios de la clase: `+i.message)}}return mr(e)}async function _r(e){let{error:n}=await t.from(`clases`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando clase:`,n.message),Error(`No se pudo eliminar la clase`)}async function vr(e){let{data:n,error:r}=await t.from(`clases`).select(`
      *,
      clase_horarios ( dia, hora_inicio, hora_fin, salon_id ),
      alumnos_clases ( id )
    `).or(`maestro_principal_id.eq.${e},maestro_suplente_id.eq.${e}`).order(`nombre`,{ascending:!0});if(r)throw r;return(n||[]).map(t=>{let n=H(t);return n.horarios=t.clase_horarios||[],n.total_alumnos=(t.alumnos_clases||[]).length,n.es_suplente=t.maestro_principal_id!==e,n})}async function yr(e,n,r=null,i=null){let{data:a,error:o}=await t.from(`alumnos_clases`).insert([{clase_id:e,alumno_id:n,activo:!0,fecha_inscripcion:new Date().toISOString().split(`T`)[0],hora_inicio:r,hora_fin:i}]).select();if(o)throw o.code===`23505`?Error(`El alumno ya está inscrito en esta clase`):o;return a[0]}async function br(e,n){let{error:r}=await t.from(`alumnos_clases`).delete().eq(`clase_id`,e).eq(`alumno_id`,n);if(r)throw r}async function xr(e,n,r,i){let{data:a,error:o}=await t.from(`alumnos_clases`).update({hora_inicio:r,hora_fin:i}).eq(`clase_id`,e).eq(`alumno_id`,n).select();if(o)throw o;return a[0]}async function Sr(e){let{data:n,error:r}=await t.from(`alumnos_clases`).select(`*, alumno:alumnos(*)`).eq(`clase_id`,e).eq(`activo`,!0).order(`created_at`,{ascending:!1});if(r)throw r;return n||[]}var Cr=class{constructor(e={}){this.id=e.id,this.instrumento=e.instrumento,this.nivel=e.nivel,this.nombre=e.nombre,this.tipo=e.tipo,this.estado=e.estado,this.descripcion=e.descripcion,this.ruta_base_id=e.ruta_base_id,this.duracion_semanas=e.duracion_semanas||40,this.creada_por=e.creada_por,this.aprobada_por=e.aprobada_por,this.fecha_aprobacion=e.fecha_aprobacion,this.objetivos=e.objetivos||[],this.created_at=e.created_at,this.updated_at=e.updated_at}validate(){let e=[];return this.instrumento?.trim()||e.push(`Instrumento es requerido`),this.nivel?.trim()||e.push(`Nivel es requerido`),this.nombre?.trim()||e.push(`Nombre es requerido`),this.nombre?.length>200&&e.push(`Nombre máximo 200 caracteres`),[`soi-estandar`,`maestro-variante`].includes(this.tipo)||e.push(`Tipo debe ser soi-estandar o maestro-variante`),[`activa`,`pendiente`,`aprobada`,`rechazada`].includes(this.estado)||e.push(`Estado inválido`),this.tipo===`maestro-variante`&&!this.ruta_base_id&&e.push(`Variante debe referenciar ruta base`),(this.duracion_semanas<1||this.duracion_semanas>52)&&e.push(`Duración debe estar entre 1 y 52 semanas`),(!Array.isArray(this.objetivos)||this.objetivos.length===0)&&e.push(`Debe haber al menos 1 objetivo`),this.objetivos.forEach((t,n)=>{t.descripcion?.trim()||e.push(`Objetivo ${n+1}: descripción requerida`),t.semana_inicio<1&&e.push(`Objetivo ${n+1}: semana_inicio >= 1`),t.semana_fin>this.duracion_semanas&&e.push(`Objetivo ${n+1}: semana_fin <= ${this.duracion_semanas}`),t.semana_fin<t.semana_inicio&&e.push(`Objetivo ${n+1}: semana_fin >= semana_inicio`)}),e}isVariante(){return this.tipo===`maestro-variante`}isActiva(){return this.estado===`activa`}isPendiente(){return this.estado===`pendiente`}toJSON(){return{id:this.id,instrumento:this.instrumento,nivel:this.nivel,nombre:this.nombre,tipo:this.tipo,estado:this.estado,descripcion:this.descripcion,ruta_base_id:this.ruta_base_id,duracion_semanas:this.duracion_semanas,creada_por:this.creada_por,aprobada_por:this.aprobada_por,fecha_aprobacion:this.fecha_aprobacion,objetivos:this.objetivos,created_at:this.created_at,updated_at:this.updated_at}}static getEstados(){return[{value:`activa`,label:`Activa`,color:`bg-success`},{value:`pendiente`,label:`Pendiente de aprobación`,color:`bg-warning`},{value:`aprobada`,label:`Aprobada`,color:`bg-info`},{value:`rechazada`,label:`Rechazada`,color:`bg-danger`}]}};async function wr(e){let n=new Cr(e).validate();if(n.length>0)throw Error(`Validación fallida: ${n.join(`, `)}`);let{data:r,error:i}=await t.from(`rutas_contenido`).insert({instrumento:e.instrumento,nivel:e.nivel,nombre:e.nombre,tipo:e.tipo,estado:e.estado,descripcion:e.descripcion,ruta_base_id:e.ruta_base_id,duracion_semanas:e.duracion_semanas,creada_por:e.creada_por}).select().single();if(i)throw i;let a=e.objetivos.map((e,t)=>({ruta_id:r.id,descripcion:e.descripcion,semana_inicio:e.semana_inicio,semana_fin:e.semana_fin,orden:e.orden||t+1,objetivo_id:e.objetivo_id||null})),{data:o,error:s}=await t.from(`ruta_contenido_objetivos`).insert(a).select();if(s)throw s;return{...r,objetivos:o}}async function Tr(e){let{data:n,error:r}=await t.from(`rutas_contenido`).select(`*`).eq(`id`,e).single();if(r)throw r;let{data:i,error:a}=await t.from(`ruta_contenido_objetivos`).select(`*`).eq(`ruta_id`,e).order(`orden`,{ascending:!0});if(a)throw a;return{...n,objetivos:i}}async function Er(e={}){let n=t.from(`rutas_contenido`).select(`*`);e.instrumento&&(n=n.eq(`instrumento`,e.instrumento)),e.nivel&&(n=n.eq(`nivel`,e.nivel)),e.estado&&(n=n.eq(`estado`,e.estado)),e.tipo&&(n=n.eq(`tipo`,e.tipo));let{data:r,error:i}=await n.order(`created_at`,{ascending:!1});if(i)throw i;return r||[]}async function Dr(){let{data:e,error:n}=await t.from(`rutas_contenido`).select(`*, rutas_contenido!ruta_base_id(nombre)`).eq(`tipo`,`maestro-variante`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(n)throw n;return e||[]}async function Or(e,n,r=null){let{data:i}=await t.auth.getUser(),{data:a,error:o}=await t.from(`rutas_contenido`).update({estado:n?`aprobada`:`rechazada`,aprobada_por:i?.user?.id,fecha_aprobacion:new Date().toISOString(),descripcion:n?void 0:r,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(o)throw o;return a}async function kr(e,n,r,i){let a=await Tr(e),{data:o}=await t.auth.getUser();return await wr({instrumento:a.instrumento,nivel:a.nivel,nombre:n,tipo:`maestro-variante`,estado:`pendiente`,descripcion:r,ruta_base_id:e,duracion_semanas:a.duracion_semanas,creada_por:o?.user?.id,objetivos:i})}var Ar=`
<style id="ruta-selector-style">
.ruta-option { padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
.ruta-option:hover { background: #f8f9fa; border-color: #007bff; }
.ruta-option.selected { background: #e7f1ff; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.25); }
.ruta-info { font-size: 0.85rem; color: #666; margin-top: 4px; }
</style>`;function jr(e,t,n){let r=document.getElementById(`ruta-selector-modal`);r&&r.remove();let a=document.createElement(`div`);a.id=`ruta-selector-modal`,a.innerHTML=`${Ar}
    <div class="modal fade" id="ruta-selector-dialog" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-diagram-3 me-2"></i>Selecciona Ruta de Contenidos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ruta-selector-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(a);let o=document.getElementById(`ruta-selector-dialog`),s=new bootstrap.Modal(o);async function c(){let r=document.getElementById(`ruta-selector-body`);try{let i=await Er({instrumento:e,nivel:t,estado:`activa`});if(i.length===0){r.innerHTML=`<p class="text-muted text-center">No hay rutas disponibles para este instrumento/nivel.</p>`;return}let a=null,c=i.find(e=>e.tipo===`soi-estandar`);c&&(a=c.id),r.innerHTML=`
        <div class="alert alert-info small mb-3">
          <i class="bi bi-lightbulb me-2"></i>La ruta define los objetivos que cubrirás en este período.
        </div>
        <div id="ruta-list">${i.map(e=>`
          <div class="ruta-option ${a===e.id?`selected`:``}" data-ruta-id="${e.id}">
            <strong>${e.tipo===`soi-estandar`?`📌`:`⚡`} ${e.nombre}</strong>
            <div class="ruta-info">
              ${e.duracion_semanas} semanas
              ${e.tipo===`maestro-variante`?`| Variante aprobada`:`| Estándar SOI`}
            </div>
          </div>
        `).join(``)}</div>
      `,document.querySelectorAll(`.ruta-option`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.ruta-option`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),a=e.dataset.rutaId})});let l=o.querySelector(`.btn-close`);l.onclick=()=>{s.hide(),a&&n(a)}}catch(e){r.innerHTML=`<div class="alert alert-danger">${e.message}</div>`,i.error(`Error cargando rutas`)}}o.addEventListener(`shown.bs.modal`,c),s.show()}var U={maestros:[],salones:[],programas:[],alumnos:[],onSuccess:null},Mr={nombreMax:100,notasMax:500};async function Nr(e=null,t={}){U={...U,...t};let n=!!e,r=[],a=[];if(n){i.info(`Cargando datos de la clase...`);let t=await Sr(e.id);r=(t||[]).map(e=>e.alumno_id),a=t||[]}let s=n?`Editar Clase: ${e.nombre}`:`Nueva Clase`,c=n?`Guardar Cambios`:`Crear Clase`;o.open({title:s,saveText:c,size:`lg`,body:Pr(e,r,a),onShow:t=>{Ir(t,e)},onSave:async t=>await Lr(t,e)})}function Pr(e,t,n=[]){return`
    <form class="row g-3" id="formClase">
      <div class="col-md-6">
        <label class="form-label-compact">Nombre de la Clase *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ej: Violín Básico A" value="${z(e?.nombre||``)}" maxlength="${Mr.nombreMax}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar..." value="${z(e?.instrumento||``)}">
        ${Hr()}
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Ruta de Contenido</label>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="modal-ruta-display" readonly placeholder="Seleccionar ruta..." value="${e?.ruta_id?`Ruta seleccionada`:``}">
          <button type="button" class="btn btn-outline-primary btn-sm" id="btn-seleccionar-ruta" style="white-space: nowrap;">
            <i class="bi bi-diagram-3 me-1"></i>Elegir
          </button>
        </div>
        <input type="hidden" id="modal-ruta_id" value="${e?.ruta_id||``}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Programa *</label>
        <select class="form-select input-dense" id="modal-programa_id" required>
          ${Br(e?.programa_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro Titular *</label>
        <select class="form-select input-dense" id="modal-maestro_id" required>
          ${Rr(e?.maestro_principal_id)}
        </select>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center gap-2">
          <label class="form-label-compact mb-0">Maestro Suplente</label>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="modal-tiene_suplente" ${e?.tiene_suplente?`checked`:``}>
          </div>
        </div>
        <select class="form-select input-dense" id="modal-maestro_suplente_id" style="display: ${e?.tiene_suplente?`block`:`none`}; margin-top: 8px;">
          ${Rr(e?.maestro_suplente_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. Alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${e?.capacidad_maxima||20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${Vr(e?.estado||`activa`)}
        </select>
      </div>
      
      <div class="col-12 mt-3 pt-2 border-top">
        <label class="form-label-compact d-block mb-2"><i class="bi bi-gear me-1"></i> Dinámica de la Clase *</label>
        <div class="d-flex align-items-center bg-body-tertiary p-2 rounded border">
          <div class="form-check me-4">
            <input class="form-check-input cursor-pointer" type="radio" name="modal-tipo_clase" id="tipo-grupal" value="grupal" ${!e||e.tipo_clase!==`rotativa`?`checked`:``}>
            <label class="form-check-label small cursor-pointer lh-sm" for="tipo-grupal">
              <strong>Grupal</strong><br>
              <span class="text-muted" style="font-size: 0.75rem;">Asistencia global, todos los alumnos asisten en el mismo horario.</span>
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input cursor-pointer" type="radio" name="modal-tipo_clase" id="tipo-rotativa" value="rotativa" ${e?.tipo_clase===`rotativa`?`checked`:``}>
            <label class="form-check-label small cursor-pointer lh-sm" for="tipo-rotativa">
              <strong>Rotativa (Turnos)</strong><br>
              <span class="text-muted" style="font-size: 0.75rem;">Clase individual o micro-grupos. Se asignan slots de tiempo a cada alumno.</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="col-12 mt-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label-compact mb-0">Horarios y Salones *</label>
          <button type="button" class="btn btn-sm btn-outline-primary" id="btn-add-horario">
            <i class="bi bi-plus-circle me-1"></i> Agregar Horario
          </button>
        </div>
        <div id="modal-horarios-container" class="mb-3">
          ${Wr(e?.horarios||[])}
        </div>
      </div>

      <div class="col-12">
        <label class="form-label-compact">Notas Pedagógicas</label>
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Observaciones sobre el grupo o metodología..." maxlength="${Mr.notasMax}">${z(e?.descripcion||``)}</textarea>
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-grupal" style="display:${e?.tipo_clase===`rotativa`?`none`:`block`}">
        <label class="form-label-compact mb-2"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
        ${Gr(t)}
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-rotativa" style="display:${e?.tipo_clase===`rotativa`?`block`:`none`}">
        <label class="form-label-compact mb-2"><i class="bi bi-person-lines-fill me-1"></i>Turnos individuales</label>
        ${Fr(n)}
      </div>
    </form>
  `}function Fr(e=[]){let t=U.alumnos||[],n=(e=``,n=``,r=``)=>(t.find(t=>t.id===e),`
      <div class="slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary">
        <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
          <option value="">Seleccionar alumno…</option>
          ${t.map(t=>`
            <option value="${t.id}" ${t.id===e?`selected`:``}>
              ${z(t.nombre_completo)}${t.instrumento_principal?` — ${z(t.instrumento_principal)}`:``}
            </option>`).join(``)}
        </select>
        <div class="d-flex align-items-center gap-1 flex-shrink-0">
          <input type="time" class="form-control form-control-sm slot-hora-inicio" value="${n}" style="width:110px;" required title="Hora inicio">
          <span class="text-muted small">–</span>
          <input type="time" class="form-control form-control-sm slot-hora-fin" value="${r}" style="width:110px;" required title="Hora fin">
        </div>
        <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
          <i class="bi bi-x-circle-fill fs-5"></i>
        </button>
      </div>`);return`
    <div id="slots-container" class="mb-2">
      ${e.length?e.map(e=>n(e.alumno_id,(e.hora_inicio||``).slice(0,5),(e.hora_fin||``).slice(0,5))).join(``):n()}
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary w-100" id="btn-add-slot">
      <i class="bi bi-plus-circle me-1"></i> Agregar turno
    </button>
    <div class="text-end mt-1">
      <small class="text-muted" id="slots-count">
        ${e.length||0} turno${e.length===1?``:`s`} asignado${e.length===1?``:`s`}
      </small>
    </div>`}function Ir(e,t){let n=e.querySelector(`#btn-seleccionar-ruta`);n&&n.addEventListener(`click`,async t=>{t.preventDefault();let n=e.querySelector(`#modal-instrumento`)?.value?.trim();if(!n){i.warning(`Selecciona un instrumento primero`);return}jr(n,`Cualquier Nivel`,t=>{e.querySelector(`#modal-ruta_id`).value=t,e.querySelector(`#modal-ruta-display`).value=`Ruta seleccionada ✓`,i.success(`Ruta asignada a la clase`)})});let r=e.querySelector(`#modal-tiene_suplente`),a=e.querySelector(`#modal-maestro_suplente_id`);r&&a&&r.addEventListener(`change`,e=>{a.style.display=e.target.checked?`block`:`none`,e.target.checked||(a.value=``)}),e.querySelector(`#btn-add-horario`).addEventListener(`click`,()=>{let t=e.querySelector(`#modal-horarios-container`),n=t.children.length,r=document.createElement(`div`);r.innerHTML=Ur(null,n),t.appendChild(r.firstElementChild)}),e.querySelector(`#modal-horarios-container`).addEventListener(`click`,t=>{let n=t.target.closest(`.btn-remove-horario`);n&&(e.querySelector(`#modal-horarios-container`).children.length>1?n.closest(`.horario-row`).remove():i.warning(`La clase debe tener al menos un horario`))});let o=e.querySelector(`#seccion-alumnos-grupal`),s=e.querySelector(`#seccion-alumnos-rotativa`);e.querySelectorAll(`input[name="modal-tipo_clase"]`).forEach(t=>{t.addEventListener(`change`,()=>{let t=e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value===`rotativa`;o.style.display=t?`none`:`block`,s.style.display=t?`block`:`none`})});let c=e.querySelector(`#slots-container`),l=e.querySelector(`#slots-count`),u=()=>{let e=c.querySelectorAll(`.slot-row`).length;l.textContent=`${e} turno${e===1?``:`s`} asignado${e===1?``:`s`}`};e.querySelector(`#btn-add-slot`)?.addEventListener(`click`,()=>{let e=U.alumnos||[],t=document.createElement(`div`);t.innerHTML=(Fr([]).split(`id="slots-container"`)[1],``);let n=document.createElement(`div`);n.className=`slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary`,n.innerHTML=`
      <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
        <option value="">Seleccionar alumno…</option>
        ${e.map(e=>`<option value="${e.id}">${z(e.nombre_completo)}${e.instrumento_principal?` — ${z(e.instrumento_principal)}`:``}</option>`).join(``)}
      </select>
      <div class="d-flex align-items-center gap-1 flex-shrink-0">
        <input type="time" class="form-control form-control-sm slot-hora-inicio" style="width:110px;" required title="Hora inicio">
        <span class="text-muted small">–</span>
        <input type="time" class="form-control form-control-sm slot-hora-fin" style="width:110px;" required title="Hora fin">
      </div>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
        <i class="bi bi-x-circle-fill fs-5"></i>
      </button>`,c.appendChild(n),u()}),c?.addEventListener(`click`,e=>{if(e.target.closest(`.btn-remove-slot`)){if(c.querySelectorAll(`.slot-row`).length<=1){i.warning(`Debe haber al menos un turno en una clase rotativa`);return}e.target.closest(`.slot-row`).remove(),u()}});let d=e.querySelector(`#search-modal-alumnos`),f=e.querySelectorAll(`.alumno-check-item`);d?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();f.forEach(e=>{let n=e.dataset.nombre.includes(t)||e.dataset.instrumento.includes(t);e.style.display=n?`block`:`none`})});let p=e.querySelectorAll(`.alumnos-list input[type="checkbox"]`),m=e.querySelector(`#alumnos-selection-count`),h=()=>{let e=Array.from(p).filter(e=>e.checked).length;m&&(m.textContent=`${e} alumnos seleccionados`)};p.forEach(e=>e.addEventListener(`change`,h)),h()}async function Lr(e,t){let n=!!t,r=(()=>{let t=e.querySelector(`#modal-maestro_suplente_id`).value,n=e.querySelector(`#modal-tiene_suplente`).checked;return{nombre:e.querySelector(`#modal-nombre`).value.trim(),programa_id:e.querySelector(`#modal-programa_id`).value,maestro_principal_id:e.querySelector(`#modal-maestro_id`).value,maestro_suplente_id:n?t:null,tiene_suplente:n,instrumento:e.querySelector(`#modal-instrumento`).value.trim(),capacidad_maxima:parseInt(e.querySelector(`#modal-max_alumnos`).value)||20,estado:e.querySelector(`#modal-estado`).value,tipo_clase:e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value||`grupal`,descripcion:e.querySelector(`#modal-notas_pedagogicas`).value.trim(),ruta_id:e.querySelector(`#modal-ruta_id`)?.value||null,horarios:Array.from(e.querySelectorAll(`.horario-row`)).map(e=>({dia:e.querySelector(`[name="horario-dia"]`).value,hora_inicio:e.querySelector(`[name="horario-hora_inicio"]`).value,hora_fin:e.querySelector(`[name="horario-hora_fin"]`).value,salon_id:e.querySelector(`[name="horario-salon_id"]`).value||null}))}})(),a=new dr(r).validate();if(a.length>0)return i.error(a[0]),!1;let o=()=>Array.from(e.querySelectorAll(`#slots-container .slot-row`)).map(e=>({alumno_id:e.querySelector(`.slot-alumno-select`).value,hora_inicio:e.querySelector(`.slot-hora-inicio`).value,hora_fin:e.querySelector(`.slot-hora-fin`).value})).filter(e=>e.alumno_id),s=async t=>{let n=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value),r=(await Sr(t)).map(e=>e.alumno_id),i=n.filter(e=>!r.includes(e)),a=r.filter(e=>!n.includes(e));await Promise.all([...i.map(e=>yr(t,e)),...a.map(e=>br(t,e))])},c=async e=>{let t=o();if(t.length===0)return i.warning(`Agregá al menos un turno`),!1;if(t.find(e=>!e.hora_inicio||!e.hora_fin))return i.error(`Todos los turnos deben tener hora de inicio y fin`),!1;let n=(await Sr(e)).map(e=>e.alumno_id),r=t.map(e=>e.alumno_id),a=n.filter(e=>!r.includes(e));return await Promise.all(a.map(t=>br(e,t))),await Promise.all(t.map(t=>n.includes(t.alumno_id)?xr(e,t.alumno_id,t.hora_inicio,t.hora_fin):yr(e,t.alumno_id,t.hora_inicio,t.hora_fin))),!0};try{let a;if(n)if(a=await gr(t.id,r),r.tipo_clase===`rotativa`){if(!await c(a.id))return!1}else await s(a.id);else if(a=await hr(r),r.tipo_clase===`rotativa`){if(!await c(a.id))return!1}else{let t=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value);t.length>0&&await Promise.all(t.map(e=>yr(a.id,e)))}return i.success(n?`Clase actualizada`:`Clase creada`),U.onSuccess&&U.onSuccess(),!0}catch(e){return e.isConflict?i.warning(`Conflicto detected: ${e.message}`):i.error(e.message),!1}}function Rr(e=``){return`<option value="">Seleccionar maestro...</option>`+U.maestros.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${z(t.nombre_completo||t.nombre)}</option>`).join(``)}function zr(e=``){return`<option value="">Sin salón (Online/Otro)</option>`+U.salones.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${z(t.nombre)}</option>`).join(``)}function Br(e=``){return`<option value="">Seleccionar programa...</option>`+U.programas.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${z(t.nombre)}</option>`).join(``)}function Vr(e=`activa`){return dr.getEstados().map(t=>`<option value="${t}" ${t===e?`selected`:``}>${dr.getEstadoLabel(t)}</option>`).join(``)}function Hr(){return`<datalist id="instrumentos-list">${[`Violín`,`Viola`,`Cello`,`Piano`,`Flauta`,`Teoría`,`Coro`].map(e=>`<option value="${e}">`).join(``)}</datalist>`}function Ur(e,t){return`
    <div class="horario-row bg-body-tertiary p-2 rounded mb-2 border" data-index="${t}">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <select class="form-select form-select-sm" name="horario-dia" required>
            <option value="">Día...</option>
            ${[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`].map(t=>`<option value="${t}" ${e?.dia===t?`selected`:``}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-3">
          <input type="time" class="form-control form-control-sm" name="horario-hora_inicio" value="${(e?.hora_inicio||``).slice(0,5)}" required>
        </div>
        <div class="col-md-3">
          <input type="time" class="form-control form-control-sm" name="horario-hora_fin" value="${(e?.hora_fin||``).slice(0,5)}" required>
        </div>
        <div class="col-md-2 d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-link text-danger btn-remove-horario" title="Quitar"><i class="bi bi-x-circle"></i></button>
        </div>
        <div class="col-12 mt-1">
          <select class="form-select form-select-sm" name="horario-salon_id">
            ${zr(e?.salon_id)}
          </select>
        </div>
      </div>
    </div>
  `}function Wr(e=[]){return e.length===0?Ur(null,0):e.map((e,t)=>Ur(e,t)).join(``)}function Gr(e=[]){return`
    <div class="alumnos-selector-container">
      <div class="input-group input-group-sm mb-2">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" id="search-modal-alumnos" placeholder="Filtrar por nombre o instrumento...">
      </div>
      <div class="alumnos-list border rounded bg-body-tertiary" style="max-height: 200px; overflow-y: auto; padding: 8px;">
        ${(U.alumnos||[]).map(t=>`
          <div class="form-check alumno-check-item" data-nombre="${t.nombre_completo.toLowerCase()}" data-instrumento="${(t.instrumento_principal||``).toLowerCase()}">
            <input class="form-check-input" type="checkbox" value="${t.id}" id="chk-a-${t.id}" ${e.includes(t.id)?`checked`:``}>
            <label class="form-check-label small w-100 cursor-pointer" for="chk-a-${t.id}">
              ${z(t.nombre_completo)} <span class="text-muted">(${z(t.instrumento_principal||`N/A`)})</span>
            </label>
          </div>
        `).join(``)}
      </div>
      <div class="text-end mt-1"><small class="text-muted" id="alumnos-selection-count">0 seleccionados</small></div>
    </div>
  `}var Kr=`app-help-panel`,qr=`app-help-overlay`,Jr=!1;function Yr(){if(Jr)return;Jr=!0;let e=document.createElement(`style`);e.id=`app-help-panel-styles`,e.textContent=`
    /* ── Overlay ─────────────────────────────────────────── */
    #app-help-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.18);
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.22s ease;
    }
    #app-help-overlay.hp-visible { opacity: 1; }

    /* ── Panel ───────────────────────────────────────────── */
    #app-help-panel {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(380px, 94vw);
      background: var(--bs-body-bg, #fff);
      border-left: 1px solid var(--bs-border-color, #e5e7eb);
      box-shadow: -12px 0 40px rgba(0,0,0,0.08);
      z-index: 3001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.26s cubic-bezier(0.32,0,0.08,1);
      overflow: hidden;
    }
    #app-help-panel.hp-visible { transform: translateX(0); }

    /* ── Header ──────────────────────────────────────────── */
    #ahp-header {
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      height: 56px;
      border-bottom: 1px solid var(--bs-border-color, #e5e7eb);
      flex-shrink: 0;
      gap: 0.625rem;
    }
    #ahp-badge {
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #6b7280);
      font-size: 0.78rem;
      flex-shrink: 0;
    }
    #ahp-title {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--bs-body-color, #111827);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #ahp-close {
      background: none; border: none; cursor: pointer;
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      transition: background 0.12s, color 0.12s;
      flex-shrink: 0;
    }
    #ahp-close:hover {
      background: var(--bs-tertiary-bg, #f3f4f6);
      color: var(--bs-body-color, #374151);
    }

    /* ── Body ────────────────────────────────────────────── */
    #ahp-body {
      overflow-y: auto;
      padding: 1.5rem 1.25rem 2rem;
      flex: 1;
    }
    #ahp-body::-webkit-scrollbar { width: 4px; }
    #ahp-body::-webkit-scrollbar-track { background: transparent; }
    #ahp-body::-webkit-scrollbar-thumb { background: var(--bs-border-color, #d1d5db); border-radius: 2px; }

    /* ── Intro ───────────────────────────────────────────── */
    .ahp-intro {
      font-size: 0.8125rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.65;
      margin: 0 0 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--bs-border-color, #f0f0f0);
    }

    /* ── Section label ───────────────────────────────────── */
    .ahp-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color, #9ca3af);
      margin-bottom: 0.75rem;
    }

    /* ── Section item ────────────────────────────────────── */
    .ahp-item {
      display: flex;
      gap: 0.875rem;
      padding: 0.875rem 0 0.875rem 0.875rem;
      border-left: 2px solid var(--ahp-accent, #e5e7eb);
      margin-bottom: 0.5rem;
      transition: border-color 0.15s;
    }
    .ahp-item:last-child { margin-bottom: 0; }
    .ahp-item:hover { border-left-color: var(--ahp-accent-hover, #93c5fd); }

    .ahp-item-icon {
      font-size: 0.9rem;
      color: var(--ahp-accent, #6b7280);
      flex-shrink: 0;
      margin-top: 1px;
      width: 16px;
      text-align: center;
    }
    .ahp-item-body {}
    .ahp-item-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--bs-body-color, #111827);
      margin-bottom: 0.2rem;
      line-height: 1.3;
    }
    .ahp-item-desc {
      font-size: 0.77rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.6;
      margin: 0;
    }

    /* ── Help trigger button (usado en los headers de vistas) */
    .btn-help-trigger {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      background: transparent;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      font-size: 0.75rem;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .btn-help-trigger:hover {
      border-color: var(--bs-primary, #3b82f6);
      color: var(--bs-primary, #3b82f6);
      background: var(--bs-primary-bg-subtle, #eff6ff);
    }
  `,document.head.appendChild(e)}function Xr(){if(document.getElementById(Kr))return;Yr();let e=document.createElement(`div`);e.id=qr,document.body.appendChild(e);let t=document.createElement(`div`);t.id=Kr,t.setAttribute(`role`,`complementary`),t.setAttribute(`aria-label`,`Ayuda`),t.innerHTML=`
    <div id="ahp-header">
      <div id="ahp-badge"><i class="bi bi-question"></i></div>
      <span id="ahp-title">Ayuda</span>
      <button id="ahp-close" aria-label="Cerrar">
        <i class="bi bi-x" style="font-size:1.1rem;"></i>
      </button>
    </div>
    <div id="ahp-body"></div>
  `,document.body.appendChild(t),e.addEventListener(`click`,()=>W.close()),t.querySelector(`#ahp-close`).addEventListener(`click`,()=>W.close()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&W.close()})}var W={open({title:e,intro:t,sections:n=[]}){Xr();let r=document.getElementById(Kr),i=document.getElementById(qr);document.getElementById(`ahp-title`).textContent=e||`Ayuda`,document.getElementById(`ahp-body`).innerHTML=`
      ${t?`<p class="ahp-intro">${t}</p>`:``}
      ${n.length?`<div class="ahp-label">En esta pantalla</div>`:``}
      ${n.map(e=>{let t=e.color||`#6b7280`;return`
          <div class="ahp-item" style="--ahp-accent:${t};--ahp-accent-hover:${e.color?e.color+`60`:`#d1d5db`};">
            <i class="bi ${e.icon||`bi-dot`} ahp-item-icon" style="color:${t};"></i>
            <div class="ahp-item-body">
              <div class="ahp-item-title">${e.title}</div>
              <p class="ahp-item-desc">${e.description}</p>
            </div>
          </div>`}).join(``)}
    `,i.style.display=`block`,requestAnimationFrame(()=>{i.classList.add(`hp-visible`),r.classList.add(`hp-visible`)})},close(){let e=document.getElementById(Kr),t=document.getElementById(qr);!e||!e.classList.contains(`hp-visible`)||(e.classList.remove(`hp-visible`),t.classList.remove(`hp-visible`),setTimeout(()=>{t&&(t.style.display=`none`)},280))}},G={maestros:[],maestrosOriginales:[],editando:null,deletingId:null},Zr={nombreMax:100},K=null,Qr=[`Piano`,`Guitarra`,`Violín`,`Viola`,`Cello`,`Contrabajo`,`Flauta`,`Clarinete`,`Oboe`,`Fagot`,`Saxofón`,`Trompeta`,`Trombón`,`Corno`,`Tuba`,`Percusión`,`Batería`,`Canto`,`Teoría`,`Solfeo`,`Dirección`,`Composición`,`Arreglos`];async function $r(e){try{ei(e);let t=await $n();G.maestros=t,G.maestrosOriginales=[...t],ai(e),si(e)}catch(t){console.error(t),ti(e,t.message)}}function ei(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
      </div>
    </div>
  `}function ti(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${R(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>$r(e))}function ni(e=[],t=`modal-especialidades-input`){return`
    <div class="mb-3">
      <label class="form-label-compact">Especialidades</label>
      <div class="especialidades-chips-container" id="modal-especialidades-container">
        <div class="chips-wrapper d-flex flex-wrap gap-1 mb-2">
          ${e.map(e=>`
            <span class="badge bg-primary-subtle text-primary rounded-pill chip-item">
              ${R(e)}
              <i class="bi bi-x-lg chip-remove" data-especialidad="${R(e)}" style="cursor:pointer;margin-left:4px;"></i>
            </span>
          `).join(``)}
        </div>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="${t}" placeholder="Escribir y presionar Enter...">
          <button type="button" class="btn btn-outline-secondary btn-sm-compact" id="btnAddEspecialidad">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        <div class="mt-2">
          <small class="text-muted">Sugerencias:</small>
          <div class="d-flex flex-wrap gap-1 mt-1">
            ${Qr.slice(0,8).map(e=>`
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${R(e)}">${R(e)}</button>
            `).join(`, `)}
          </div>
        </div>
      </div>
    </div>
  `}function ri(e){let t=e.querySelector(`.especialidades-chips-container`);if(!t)return[];let n=t.querySelectorAll(`.chip-item`);return Array.from(n).map(e=>e.textContent.replace(/×$/,``).trim())}function ii(e,t){let n=e.querySelector(`#modal-especialidades-input`),r=e.querySelector(`#btnAddEspecialidad`),i=e.querySelector(`.especialidades-chips-container`),a=r=>{let a=r.trim();if(a){if(!ri(e).includes(a)){let e=i.querySelector(`.chips-wrapper`),n=document.createElement(`span`);n.className=`badge bg-primary-subtle text-primary rounded-pill chip-item`,n.innerHTML=`${R(a)}<i class="bi bi-x-lg chip-remove" data-especialidad="${R(a)}" style="cursor:pointer;margin-left:4px;"></i>`,e.appendChild(n),t&&t()}n.value=``}};n?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(e.preventDefault(),a(n.value))}),r?.addEventListener(`click`,()=>a(n.value)),i?.addEventListener(`click`,e=>{e.target.classList.contains(`chip-remove`)&&(e.target.closest(`.chip-item`).remove(),t&&t()),e.target.classList.contains(`suggest-chip`)&&(e.preventDefault(),a(e.target.dataset.especialidad))})}function ai(e){e.innerHTML=`
    <div class="page-container">
      <div class="maestros-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-person-check fs-4"></i>
          </div>
          <div>
            <h1 class="maestros-title-premium mb-0">Maestros</h1>
            <p class="text-muted small mb-0">${G.maestros.length} maestros en total</p>
          </div>
        </div>
        
        <div class="maestros-header-actions">
          <button class="btn-help-trigger" id="btn-help-maestros" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <button class="btn btn-outline-success btn-sm-compact me-2" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-premium-action" id="btnAgregarMaestro">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Maestro
          </button>
        </div>
      </div>

      <div class="maestros-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar maestro..." id="buscar" autocomplete="off">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="maestrosTBody">
          ${oi(G.maestros)}
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `}function oi(e){return e.length?e.map(e=>{let t=e.nombre||e.name||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${or(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${R(t)}</span>
            <small class="text-muted text-truncate">
              ${R(e.instrumento||`Sin instrumento especificado`)}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          ${e.telefono?`
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="min-height: 32px;" ${n?``:`disabled`}>
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${R(e.telefono)}</span>
            </button>
          `:`<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>`}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):`
      <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No hay maestros registrados.
      </div>`}function si(e){K=e,e.querySelector(`#btnAgregarMaestro`).addEventListener(`click`,()=>ui()),e.querySelector(`#btn-help-maestros`)?.addEventListener(`click`,()=>{W.open({title:`Maestros`,intro:`Gestión del plantel docente. Desde acá podés ver, agregar, editar y desactivar maestros, y acceder al perfil completo de cada uno.`,sections:[{icon:`bi-search`,title:`Buscador y filtros`,description:`Filtrá por nombre, instrumento o estado (activo/inactivo) en tiempo real.`,color:`#6b7280`},{icon:`bi-person-badge`,title:`Tarjeta de maestro`,description:`Nombre, instrumento principal, clases activas y estado. Badge verde = activo, gris = inactivo.`,color:`#3b82f6`},{icon:`bi-eye`,title:`Ver perfil`,description:`Perfil completo: datos personales, clases (titular y suplente), horarios y ocupación.`,color:`#10b981`},{icon:`bi-pencil`,title:`Editar desde el perfil`,description:`Desde el perfil podés editar cualquier clase que dicte directamente, sin salir del modal.`,color:`#f59e0b`},{icon:`bi-person-x`,title:`Desactivar maestro`,description:`Desactivar oculta al maestro de listas operativas pero conserva su historial. No elimina datos.`,color:`#ef4444`}]})}),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>gi()),e.querySelector(`#buscar`).addEventListener(`input`,()=>li()),e.querySelector(`#filtroEstado`).addEventListener(`change`,()=>li()),e.querySelector(`#maestrosTBody`).addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){fi(t.dataset.id);return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id,i=n.dataset.action;i===`edit`?di(r):i===`delete`?pi(r):i===`whatsapp`&&ci(r)})}function ci(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t||!t.telefono)return;let n=t.telefono.replace(/\D/g,``);o.open({title:`Enviar WhatsApp a `+R(t.nombre||t.name||``),size:`md`,saveText:`Enviar WhatsApp`,body:`
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> +${n}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,onSave:async e=>{let t=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=`https://wa.me/${n}?text=${encodeURIComponent(t)}`;window.open(r,`_blank`)}})}function li(){let e=K.querySelector(`#buscar`).value.trim().toLowerCase(),t=K.querySelector(`#filtroEstado`).value;G.maestros=G.maestrosOriginales.filter(n=>{let r=(n.nombre||n.name||``).toLowerCase(),i=!e||r.includes(e)||(n.email||``).toLowerCase().includes(e)||(n.instrumento||``).toLowerCase().includes(e)||(n.especialidad||``).toLowerCase().includes(e)||(n.especialidades||[]).some(t=>t.toLowerCase().includes(e)),a=n.is_active??!0;return i&&(t===`todos`||t===`activo`&&a||t===`inactivo`&&!a)}),mi()}function ui(){G.editando=null,o.open({title:`Crear Nuevo Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${Zr.nombreMax}" placeholder="Juan Pérez">
        <small class="text-muted" id="modal-nombreCount">0/${Zr.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required placeholder="email@ejemplo.com">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Contraseña *</label>
        <input type="password" class="form-control input-dense" id="modal-password" required placeholder="Contraseña para iniciar sesión" minlength="6">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" placeholder="+58 412 1234567">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required placeholder="Violín">
      </div>
      ${ni([],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2" placeholder="Breve descripción..."></textarea>
      </div>
    </form>`,onShow:e=>ii(e),saveText:`Guardar`,onSave:async e=>{let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-password`)?.value,a=e.querySelector(`#modal-telefono`).value.trim(),o=e.querySelector(`#modal-instrumento`).value.trim(),s=e.querySelector(`#modal-bio`).value.trim();if(!n)return q(`El nombre es obligatorio`,`error`),!1;if(!r)return q(`El email es obligatorio`,`error`),!1;if(!hi(r))return q(`El formato del email no es válido`,`error`),!1;if(!i||i.length<6)return q(`La contraseña debe tener al menos 6 caracteres`,`error`),!1;if(!o)return q(`El instrumento es obligatorio`,`error`),!1;if(r&&await rr(r))return q(`El email ya está registrado`,`error`),!1;let c=ri(e);try{let{data:e,error:l}=await t.auth.signUp({email:r,password:i,options:{data:{full_name:n,rol:`maestro`}}});if(l)return q(l.message||`Error al crear usuario`,`error`),!1;if(!e?.user)return q(`No se pudo crear el usuario`,`error`),!1;let u=e.user.id;await t.from(`profiles`).update({estado:`activo`}).eq(`id`,u),await t.from(`maestros`).update({tlf:a||null,especialidad:o||null,resena:s||null,especialidades:c}).eq(`user_id`,u);let d=await $n();G.maestros=d,G.maestrosOriginales=[...d],li(),q(`Maestro creado exitosamente. Ya puede iniciar sesión.`,`success`)}catch(e){console.error(`Error creando maestro:`,e),q(`Error al crear el maestro: `+e.message,`error`)}}})}function di(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t){q(`Maestro no encontrado`,`error`);return}G.editando=e,o.open({title:`Editar Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${Zr.nombreMax}" value="${R(t.nombre||t.name||``)}">
        <small class="text-muted" id="modal-nombreCount">${(t.nombre||t.name||``).length}/${Zr.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required value="${R(t.email||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" value="${R(t.telefono||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required value="${R(t.instrumento||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" value="${R(t.especialidad||``)}">
      </div>
      ${ni(t.especialidades||[],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2">${R(t.bio||``)}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${t.is_active===!1?``:`checked`}>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,onShow:e=>ii(e),saveText:`Guardar cambios`,onSave:async e=>{let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-instrumento`).value.trim(),o=e.querySelector(`#modal-especialidad`).value.trim(),s=e.querySelector(`#modal-bio`).value.trim(),c=e.querySelector(`#modal-esActivo`).checked;if(!n)return q(`El nombre es obligatorio`,`error`),!1;if(!r)return q(`El email es obligatorio`,`error`),!1;if(!hi(r))return q(`El formato del email no es válido`,`error`),!1;if(r&&t.email!==r&&await rr(r))return q(`El email ya está registrado`,`error`),!1;let l=ri(e),u={nombre:n,email:r||null,telefono:i||null,instrumento:a||null,especialidad:o||null,bio:s||null,is_active:c,especialidades:l};await er(G.editando,u);let d=G.maestrosOriginales.findIndex(e=>e.id===G.editando);d!==-1&&(G.maestrosOriginales[d]={...G.maestrosOriginales[d],...u}),li(),q(`Maestro actualizado correctamente`,`success`)}})}function fi(e){let n=G.maestrosOriginales.find(t=>t.id===e);if(!n){q(`Maestro no encontrado`,`error`);return}let r=n.nombre||n.name||`-`,i=n.is_active??!0;o.open({title:r,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${R(r)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${n.email?`<a href="mailto:${R(n.email)}">${R(n.email)}</a>`:`-`}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${R(n.telefono||`-`)}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${R(n.instrumento||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidad</label>
            <p class="form-control-plaintext">${R(n.especialidad||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidades</label>
            <p class="form-control-plaintext">
              ${(n.especialidades||[]).length?n.especialidades.map(e=>`<span class="badge bg-primary-subtle text-primary me-1">${R(e)}</span>`).join(``):`Sin especialidades`}
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${ir(i)}">${ar(i)}</span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold">Biografía</label>
        <p class="form-control-plaintext">${R(n.bio||`Sin biografía`)}</p>
      </div>
      <hr>
      <div class="mb-2">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="fw-bold" style="font-size:0.95rem;"><i class="bi bi-journal-text me-1 text-primary"></i> Clases Asignadas</span>
          <span id="maestro-clases-badge" class="badge bg-primary-subtle text-primary rounded-pill" style="font-size:0.75rem;">Cargando...</span>
        </div>
        <div id="maestro-clases-container">
          <div class="d-flex align-items-center gap-2 text-muted py-2">
            <div class="spinner-border spinner-border-sm text-primary"></div>
            <small>Cargando clases...</small>
          </div>
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-auto">
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Eliminar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar Perfil
        </button>
      </div>
    `,onShow:async n=>{n.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>di(e),300)}),n.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>pi(e),300)});let r=n.querySelector(`#maestro-clases-container`),i=n.querySelector(`#maestro-clases-badge`);(async()=>{try{let[n,a,s,c,l]=await Promise.all([vr(e),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]),u={maestros:a.data||[],salones:s.data||[],programas:c.data||[],alumnos:l.data||[]};if(i.textContent=`${n.length} clase${n.length===1?``:`s`}`,n.length===0){r.innerHTML=`
              <div class="text-center py-4 text-muted">
                <i class="bi bi-journal-x" style="font-size:2rem; opacity:0.4;"></i>
                <p class="mt-2 mb-0 small">Sin clases asignadas actualmente.</p>
              </div>`;return}let d={lunes:`Lun`,martes:`Mar`,miercoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sabado:`Sáb`,domingo:`Dom`},f=e=>e?.slice(0,5)||``,p=e=>`${d[e.dia]||e.dia} ${f(e.hora_inicio)}–${f(e.hora_fin)}`;r.innerHTML=`
            <div class="d-flex flex-column gap-2">
              ${n.map(e=>{let t=e.estado===`activa`||e.estado==null,n=e.capacidad_maxima?Math.round(e.total_alumnos/e.capacidad_maxima*100):null,r=n>=90?`#ef4444`:n>=70?`#f59e0b`:`#10b981`,i=e.horarios.map(e=>`<span style="background:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color);border-radius:20px;padding:1px 8px;font-size:0.7rem;white-space:nowrap;">${p(e)}</span>`).join(``);return`
                  <div class="clase-card" data-clase-id="${e.id}" style="
                    border-radius: 10px;
                    border: 1px solid var(--bs-border-color);
                    overflow: hidden;
                    transition: box-shadow 0.15s;
                    ${t?``:`opacity:0.6;`}
                  ">
                    <div class="d-flex align-items-stretch">

                      <!-- Indicador de rol -->
                      <div style="width:4px;flex-shrink:0;background:${e.es_suplente?`#f59e0b`:`#6366f1`};"></div>

                      <!-- Info -->
                      <div class="flex-grow-1 px-3 py-2 overflow-hidden">
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span class="fw-semibold text-truncate" style="font-size:0.87rem;" title="${R(e.nombre)}">${R(e.nombre)}</span>
                          ${t?``:`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;">Inactiva</span>`}
                          ${e.es_suplente?`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#fffbeb;color:#92400e;border:1px solid #fde68a;">Suplente</span>`:``}
                        </div>

                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1" style="font-size:0.75rem;color:var(--bs-secondary-color);">
                          ${e.instrumento?`<span>${R(e.instrumento)}</span><span style="opacity:0.3;">·</span>`:``}
                          ${e.horarios.length?i:`<span class="fst-italic" style="opacity:0.5;">Sin horario</span>`}
                        </div>

                        <div class="d-flex align-items-center gap-1" style="font-size:0.72rem;">
                          <i class="bi bi-people" style="color:var(--bs-secondary-color);"></i>
                          <span style="color:var(--bs-secondary-color);">${e.total_alumnos}${e.capacidad_maxima?`/${e.capacidad_maxima}`:``}</span>
                          ${n===null?``:`
                            <div style="flex:1;max-width:60px;height:4px;background:var(--bs-tertiary-bg);border-radius:2px;overflow:hidden;margin-left:4px;">
                              <div style="width:${n}%;height:100%;background:${r};border-radius:2px;transition:width 0.3s;"></div>
                            </div>
                            <span style="color:${r};font-weight:600;">${n}%</span>`}
                        </div>
                      </div>

                      <!-- Acciones -->
                      <div class="d-flex flex-column" style="border-left:1px solid var(--bs-border-color);flex-shrink:0;">
                        <button class="btn btn-link btn-editar-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${e.id}" title="Editar"
                          style="font-size:0.65rem;color:#6366f1;text-decoration:none;border-radius:0;border-bottom:1px solid var(--bs-border-color);">
                          <i class="bi bi-pencil" style="font-size:0.95rem;"></i>
                          Editar
                        </button>
                        <button class="btn btn-link btn-desvincular-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${e.id}"
                          data-clase-nombre="${R(e.nombre)}"
                          data-es-suplente="${e.es_suplente}"
                          title="Quitar"
                          style="font-size:0.65rem;color:#ef4444;text-decoration:none;border-radius:0;">
                          <i class="bi bi-person-dash" style="font-size:0.95rem;"></i>
                          Quitar
                        </button>
                      </div>

                    </div>
                  </div>`}).join(``)}
            </div>`,r.querySelectorAll(`.btn-editar-clase`).forEach(t=>{t.addEventListener(`click`,t=>{let r=t.currentTarget.dataset.claseId,i=n.find(e=>e.id===r);i&&(o.close(),setTimeout(()=>{Nr(i,{...u,onSuccess:()=>{setTimeout(()=>fi(e),300)}})},300))})}),r.querySelectorAll(`.btn-desvincular-clase`).forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget.dataset.claseId,r=t.currentTarget.dataset.claseNombre,i=t.currentTarget.dataset.esSuplente===`true`?`maestro_suplente_id`:`maestro_principal_id`;if(confirm(`¿Quitar a este maestro de "${r}"?`))try{t.currentTarget.disabled=!0,t.currentTarget.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`,await gr(n,{[i]:null},!0),q(`Maestro desvinculado correctamente`,`success`),o.close(),setTimeout(()=>fi(e),300)}catch(e){q(`Error al desvincular: `+e.message,`error`),t.currentTarget.disabled=!1,t.currentTarget.innerHTML=`<i class="bi bi-person-dash" style="font-size:1rem;"></i><span>Quitar</span>`}})})}catch{i.textContent=`Error`,r.innerHTML=`
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar las clases.
            </div>`}})()}})}function pi(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t){q(`Maestro no encontrado`,`error`);return}G.deletingId=e;let n=t.nombre||t.name||``,r=t.is_active!==!1;o.open({title:r?`⏸️ Desactivar Maestro`:`▶️ Reactivar Maestro`,size:`sm`,saveText:r?`Desactivar`:`Reactivar`,body:r?`<p>¿Desactivar al maestro <strong>${R(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro no aparecerá en las listas, pero sus datos se conservarán.</p>`:`<p>¿Reactivar al maestro <strong>${R(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro volverá a aparecer en las listas.</p>`,onSave:async()=>{r?(await tr(e),q(`Maestro desactivado correctamente`,`success`)):(await nr(e),q(`Maestro reactivado correctamente`,`success`)),li()}})}function mi(){let e=K.querySelector(`#maestrosTBody`);if(!e)return;e.innerHTML=oi(G.maestros);let t=K.querySelector(`.maestros-header-premium p.text-muted`);t&&(t.textContent=`${G.maestros.length} maestros en total`)}function hi(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function gi(){if(G.maestrosOriginales.length===0){q(`No hay maestros para exportar`,`error`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Instrumento`,`Especialidad`,`Estado`],...G.maestrosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.instrumento||``,e.especialidad||``,e.is_active===!1?`Inactivo`:`Activo`])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`maestros-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),q(`CSV exportado exitosamente`,`success`)}function q(e,t=`info`){let n=K.querySelector(`#toastContainer`);if(!n)return;let i=t===`success`?`bg-success`:t===`error`?`bg-danger`:`bg-info`,a=t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:`bi-info-circle`,o=t===`success`?`Éxito`:t===`error`?`Error`:`Información`,s=document.createElement(`div`);s.className=`toast`,s.setAttribute(`role`,`alert`),s.setAttribute(`aria-live`,`assertive`),s.setAttribute(`aria-atomic`,`true`),s.innerHTML=`
    <div class="toast-header ${i} text-white">
      <i class="bi ${a} me-2"></i>
      <strong class="me-auto">${o}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${R(e)}</div>
  `,n.appendChild(s),new r(s,{autohide:!0,delay:3e3}).show(),s.addEventListener(`hidden.bs.toast`,()=>s.remove())}var _i=e({getAlertasActivas:()=>Si,getAlertasRojas:()=>Ci,getAlumnosDestacados:()=>ji,getAlumnosEnRiesgoAcademico:()=>Mi,getAlumnosEnRiesgoAlto:()=>xi,getCorrelacionAsistenciaRendimiento:()=>Fi,getDestacadosYRiesgoAcademico:()=>Ai,getEstadisticasPeriodoActivo:()=>ki,getEstadisticasPeriodos:()=>Oi,getHistorialEstadoAlumno:()=>Ii,getPatronAsistencia:()=>Di,getRachaAusencias:()=>Ni,getRendimientoMaestro:()=>Ei,getRendimientoMaestros:()=>Ti,getResumenAlertas:()=>wi,getResumenAlumno:()=>yi,getResumenAlumnos:()=>vi,getRiesgoAbandono:()=>bi,getTasaAsistenciaPeriodo:()=>Pi,registrarCambioEstadoAlumno:()=>Li});async function vi(){let{data:e,error:n}=await t.from(`vw_resumen_alumno`).select(`*`).order(`nombre_completo`);if(n)throw Error(`No se pudo cargar el resumen de alumnos`);return e}async function yi(e){let{data:n,error:r}=await t.from(`vw_resumen_alumno`).select(`*`).eq(`id`,e).single();if(r)throw Error(`No se pudo cargar el resumen del alumno`);return n}async function bi({nivel:e=null}={}){let n=t.from(`vw_riesgo_abandono`).select(`*`).order(`score_riesgo`,{ascending:!1});e&&(n=n.eq(`nivel_riesgo`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis de riesgo`);return r}async function xi(){return bi({nivel:`alto`})}async function Si({color:e=null,alumnoId:n=null}={}){let r=t.from(`vw_alertas_activas`).select(`*`).order(`fecha_referencia`,{ascending:!0});e&&(r=r.eq(`color`,e)),n&&(r=r.eq(`alumno_id`,n));let{data:i,error:a}=await r;if(a)throw Error(`No se pudieron cargar las alertas`);return i}async function Ci(){return Si({color:`rojo`})}async function wi(){let{data:e,error:n}=await t.from(`vw_alertas_activas`).select(`color, tipo_alerta`);if(n)throw Error(`No se pudo obtener el resumen de alertas`);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length,porTipo:e.reduce((e,t)=>(e[t.tipo_alerta]=(e[t.tipo_alerta]||0)+1,e),{})}}async function Ti(){let{data:e,error:n}=await t.from(`vw_rendimiento_maestro`).select(`*`);if(n)throw Error(`No se pudo cargar el rendimiento de maestros`);return e}async function Ei(e){let{data:n,error:r}=await t.from(`vw_rendimiento_maestro`).select(`*`).eq(`maestro_id`,e).single();if(r)throw Error(`No se pudo cargar el rendimiento del maestro`);return n}async function Di({instrumento:e=null}={}){let n=t.from(`vw_patron_asistencia`).select(`*`).order(`dia_semana_num`);e&&(n=n.eq(`instrumento_principal`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el patrón de asistencia`);return r}async function Oi(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`);if(n)throw Error(`No se pudieron cargar las estadísticas por período`);return e}async function ki(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`).eq(`activo`,!0).order(`fecha_inicio`,{ascending:!1}).limit(1);if(n)throw Error(`No se pudieron cargar las estadísticas del período activo: `+n.message);return e&&e.length>0?e[0]:null}async function Ai({categoria:e=null}={}){let n=t.from(`vw_destacados_y_riesgo_academico`).select(`*`);e&&(n=n.eq(`categoria`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis académico`);return r}async function ji(){return Ai({categoria:`destacado`})}async function Mi(){return Ai({categoria:`riesgo_academico`})}async function Ni(e){let{data:n,error:r}=await t.rpc(`fn_racha_ausencias`,{p_alumno_id:e});if(r)throw Error(`No se pudo calcular la racha de ausencias`);return n}async function Pi(e,n,r=null){let i={p_alumno_id:e,p_desde:n};r&&(i.p_hasta=r);let{data:a,error:o}=await t.rpc(`fn_tasa_asistencia_periodo`,i);if(o)throw Error(`No se pudo calcular la tasa de asistencia`);return a}async function Fi(){let{data:e,error:n}=await t.rpc(`fn_correlacion_asistencia_rendimiento`);if(n)throw Error(`No se pudo calcular la correlación`);return e}async function Ii(e){let{data:n,error:r}=await t.from(`historial_estado_alumno`).select(`*`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1});if(r)throw Error(`No se pudo cargar el historial`);return n}async function Li(e,n,r,i=null){if(![`activo`,`baja_voluntaria`,`baja_academica`,`suspendido`,`egresado`].includes(n))throw Error(`Estado no válido`);let{data:a,error:o}=await t.from(`historial_estado_alumno`).insert([{alumno_id:e,estado:n,motivo:r?.trim()||null,registrado_por:i||null,fecha:new Date().toISOString().split(`T`)[0]}]).select();if(o)throw Error(`No se pudo registrar el cambio de estado`);return a[0]}async function J(e){let t={"/assets/data/mocks/alumnos.json":()=>a(()=>import(`./alumnos-GmOXYzgJ.js`).then(e=>e.n),__vite__mapDeps([5,1])),"/assets/data/mocks/clases.json":()=>a(()=>import(`./clases-B84PNoYk.js`).then(e=>e.t),__vite__mapDeps([6,1])),"/assets/data/mocks/sesiones.json":()=>a(()=>import(`./sesiones-DT2wzp6f.js`).then(e=>e.t),__vite__mapDeps([7,1])),"/assets/data/mocks/maestro_tareas.json":()=>a(()=>import(`./maestro_tareas-DQE4KntO.js`),[]),"/assets/data/mocks/metricas_periodo.json":()=>a(()=>import(`./metricas_periodo-tizIW6SZ.js`),[]),"/assets/data/mocks/alertas_config.json":()=>a(()=>import(`./alertas_config-jMTVNLxD.js`),[]),"/assets/data/mocks/objetivos_gamificacion.json":()=>a(()=>import(`./objetivos_gamificacion-CsmdNMPt.js`),[]),"/assets/data/mocks/ausencias.json":()=>a(()=>import(`./ausencias-BGyO207M.js`),[]),"/assets/data/mocks/planificacion-curricular.json":()=>a(()=>import(`./planificacion-curricular-ypoUoRLc.js`),[])}[e];if(t){let e=await t();return e.default||e}return console.warn(`loadJsonMock: ruta no mapeada: ${e}`),null}var Ri=e({getAlertasActivas:()=>qi,getAlertasConfig:()=>Gi,getAlumnosDestacados:()=>Qi,getEstadisticasPeriodo:()=>Hi,getEstadisticasPeriodoActivo:()=>Ui,getHistorialEstadoAlumno:()=>Yi,getRachaAusencias:()=>Xi,getResumenAlertas:()=>Ji,getResumenAlumno:()=>Vi,getResumenAlumnos:()=>Bi,getRiesgoAbandono:()=>Zi,getTasaAsistenciaPeriodo:()=>Wi,updateAlertaConfig:()=>Ki}),zi=`/assets/data/mocks/metricas_periodo.json`;async function Bi(){return(await J(zi)).estadisticas_periodo[0]?.total_alumnos||0}async function Vi(e){return null}async function Hi(){return(await J(zi)).configuraciones}async function Ui(){let e=await J(zi),t=e.configuraciones.find(e=>e.activo),n=e.estadisticas_periodo.find(e=>e.periodo_id===t?.id);return t?{...t,...n}:null}async function Wi(e,t,n=null){return 87.5}async function Gi(){return await J(`/assets/data/mocks/alertas_config.json`)}async function Ki(e,t){return console.log(`Mock: updateAlertaConfig`,e,t),{id:e,...t}}async function qi(e={}){return(await J(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo)}async function Ji(){let e=(await J(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length}}async function Yi(e){return[]}async function Xi(e){return 0}async function Zi({nivel:e=null}={}){let t=[{nombre_completo:`Mateo Fernández`,score_riesgo:88,nivel_riesgo:`alto`},{nombre_completo:`Lucía Benítez`,score_riesgo:65,nivel_riesgo:`medio`},{nombre_completo:`Santiago Morales`,score_riesgo:35,nivel_riesgo:`bajo`}];return e?t.filter(t=>t.nivel_riesgo===e):t}async function Qi(){return[{nombre_completo:`Valeria Russo`,promedio:9.85,programa:`Violín Cátedra`},{nombre_completo:`Thiago Silva`,promedio:9.72,programa:`Violín Inicial`},{nombre_completo:`Delfina Lombardi`,promedio:9.6,programa:`Violín Cátedra`}]}var $i=()=>ke.isDemoMode?Ri:_i,ea=(...e)=>$i().getEstadisticasPeriodoActivo(...e),ta=(...e)=>$i().getTasaAsistenciaPeriodo(...e),na=(...e)=>$i().getAlertasActivas(...e),ra=(...e)=>$i().getResumenAlertas(...e),ia=(...e)=>$i().getAlumnosDestacados(...e);function aa({label:e,value:t,color:n=`primary`,icon:r=`bi-graph-up`}){let i=`bg-${n}`,a=`text-${n}`;return`
    <div class="card border-0 shadow-sm h-100 pm-metric-card">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="metric-icon ${i} bg-opacity-10 ${a} rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="bi ${r}"></i>
          </div>
          <div>
            <div class="text-muted small fw-bold text-uppercase" style="letter-spacing: 0.5px;">${z(e)}</div>
            <div class="h3 mb-0 fw-extrabold ${a}">${t}</div>
          </div>
        </div>
      </div>
    </div>
  `}var oa=e({callDslRpc:()=>fa,getAuditLogs:()=>ua,getOperaciones:()=>da,getSystemLogs:()=>ca,recordSystemLog:()=>la}),sa=`soi_system_logs`;async function ca(){try{let e=localStorage.getItem(sa),t=e?JSON.parse(e):[];if(t.length===0){let e={timestamp:new Date().toISOString(),level:`INFO`,module:`PWA`,message:`System logs initialized. Tracking core activities.`,network:navigator.onLine?`Online`:`Offline`};t.push(e),localStorage.setItem(sa,JSON.stringify(t))}return t}catch(e){return console.error(`Error al leer los logs del sistema local:`,e),[]}}async function la(e){try{let t=await ca(),n={timestamp:new Date().toISOString(),level:e.level||`INFO`,module:e.module||`Client`,message:e.message||`Sin mensaje de error especificado`,network:navigator.onLine?`Online`:`Offline`,stack:e.stack||``};return t.unshift(n),t.length>100&&t.pop(),localStorage.setItem(sa,JSON.stringify(t)),n}catch(e){console.error(`Error al registrar log de sistema:`,e)}}async function ua(){try{let{data:e,error:n}=await t.from(`ausencias_auditoria`).select(`*`).order(`created_at`,{ascending:!1});if(n)throw await la({level:`ERROR`,module:`SupabaseClient`,message:`Falla al consultar ausencias_auditoria (RLS o Permisos): ${n.message}`}),n;return(e||[]).map(e=>({id:e.id,ausencia_id:e.ausencia_id,actor_id:e.actor_id,usuario_id:e.actor_id,creado_a:e.created_at,created_at:e.created_at,accion:e.accion,notas:e.notas,detalles:e.notas?{notas:e.notas}:{}}))}catch(e){return console.warn(`Excepción de RLS controlada con éxito en getAuditLogs:`,e.message||e),await la({level:`WARNING`,module:`ObservabilidadAPI`,message:`Audit logs no disponibles (RLS o Red caída). Retornando lista vacía resiliente.`}),[]}}async function da(){try{let{data:e,error:n}=await t.from(`operaciones_sistema`).select(`*`).order(`created_at`,{ascending:!1}).limit(50);return n?(await la({level:`WARNING`,module:`ObservabilidadAPI`,message:`Error al consultar operaciones_sistema: ${n.message}`}),[]):(e||[]).map(e=>({id:e.id,tipo:e.tipo,descripcion:e.descripcion,estado:e.estado,timestamp:e.created_at||e.timestamp,detalles:e.detalles||{}}))}catch(e){return console.warn(`Error al obtener operaciones del sistema:`,e.message||e),await la({level:`WARNING`,module:`ObservabilidadAPI`,message:`Operaciones del sistema no disponibles. Retornando lista vacía.`}),[]}}async function fa(){let[e,n,r]=await Promise.all([t.from(`view_institutional_radar`).select(`*`),t.from(`view_node_difficulty`).select(`*`).order(`failure_percentage`,{ascending:!1}),t.from(`vw_rendimiento_maestro`).select(`*`)]);return{radarData:e.data||[],nodeDifficulty:n.data||[],complianceData:r.data||[]}}var pa=e({callDslRpc:()=>xa,getAuditLogs:()=>va,getOperaciones:()=>ba,getSystemLogs:()=>_a,recordSystemLog:()=>ya}),ma=[{timestamp:new Date(Date.now()-36e5*48).toISOString(),level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 12ms, LCP: 950ms, CLS: 0.01.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*36).toISOString(),level:`INFO`,module:`SyncManager`,message:`Network online detected. Synchronizing queue of 3 records.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*24).toISOString(),level:`INFO`,module:`ServiceWorker`,message:`SW cached all static assets successfully. Version 2.1.0.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*18).toISOString(),level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).`,network:`Online`},{timestamp:new Date(Date.now()-36e5*12).toISOString(),level:`INFO`,module:`AuthModule`,message:`User session validated successfully. Token refreshed.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*6).toISOString(),level:`INFO`,module:`IndexedDB`,message:`Offline store initialized with 12 pending records.`,network:`Offline`},{timestamp:new Date(Date.now()-36e5*1).toISOString(),level:`INFO`,module:`SyncManager`,message:`Background sync completed: 8 records pushed to server.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*30).toISOString(),level:`WARNING`,module:`SyncManager`,message:`Network offline detected. Queuing 3 pending academic attendance records locally.`,network:`Offline`},{timestamp:new Date(Date.now()-36e5*20).toISOString(),level:`WARNING`,module:`HTTPClient`,message:`Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.`,stack:`TimeoutException: Request took longer than 5000ms`,network:`Online`},{timestamp:new Date(Date.now()-36e5*10).toISOString(),level:`WARNING`,module:`SupabaseClient`,message:`Rate limit approaching: 85/100 requests in current window.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*3).toISOString(),level:`WARNING`,module:`CacheAPI`,message:`Cache storage nearly full (42MB / 50MB). Consider clearing old entries.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*48).toISOString(),level:`ERROR`,module:`SupabaseClient`,message:`Failed to query public.ausencias_auditoria due to temporary connection timeout.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*24).toISOString(),level:`ERROR`,module:`AuthModule`,message:`Policy check violation for non-admin user trying to access logs. Terminating session gracefully.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*8).toISOString(),level:`ERROR`,module:`SyncManager`,message:`Failed to push 2 attendance records: 409 Conflict — record already exists.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*2).toISOString(),level:`ERROR`,module:`ServiceWorker`,message:`Unhandled promise rejection: TypeError: Failed to fetch dynamically imported module.`,stack:`TypeError: Failed to fetch
  at HTMLScriptElement.onerror (serviceWorker.js:42)`,network:`Online`},{timestamp:new Date(Date.now()-36e5*.5).toISOString(),level:`ERROR`,module:`IndexedDB`,message:`Transaction aborted: QuotaExceededError when attempting to store log batch.`,network:`Online`}],ha=[{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a22`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a33`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`APROBACION_FINAL`,notas:`Ausencia aprobada automáticamente por cumplimiento de documentos adjuntos.`,creado_a:new Date(Date.now()-36e5*24*30).toISOString(),created_at:new Date(Date.now()-36e5*24*30).toISOString(),detalles:{motivo:`Médico`,maestro:`Carlos Gómez`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a23`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`CREACION`,notas:`Registro inicial de solicitud de ausencia por comisión de servicios.`,creado_a:new Date(Date.now()-36e5*24*28).toISOString(),created_at:new Date(Date.now()-36e5*24*28).toISOString(),detalles:{motivo:`Capacitación externa`,maestro:`María Luz`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a24`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`RECHAZO`,notas:`Rechazada por falta de justificativo médico oficial impreso.`,creado_a:new Date(Date.now()-36e5*24*25).toISOString(),created_at:new Date(Date.now()-36e5*24*25).toISOString(),detalles:{motivo:`Asuntos personales`,maestro:`Pedro Almonte`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a25`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a35`,usuario_id:`maestro.violin@gentleai.com`,usuario_nombre:`Lucía Mendoza`,accion:`ausencia_creada`,notas:`Solicitud de ausencia por participación en festival regional de cuerdas.`,creado_a:new Date(Date.now()-36e5*24*22).toISOString(),created_at:new Date(Date.now()-36e5*24*22).toISOString(),detalles:{motivo:`Comisión oficial`,maestro:`Lucía Mendoza`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a26`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a36`,usuario_id:`maestro.piano@gentleai.com`,usuario_nombre:`Roberto Díaz`,accion:`ausencia_creada`,notas:`Incapacidad médica por laringitis diagnosticada.`,creado_a:new Date(Date.now()-36e5*24*20).toISOString(),created_at:new Date(Date.now()-36e5*24*20).toISOString(),detalles:{motivo:`Médico`,maestro:`Roberto Díaz`,duracion:`5 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a27`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a37`,usuario_id:`maestro.percusion@gentleai.com`,usuario_nombre:`Ana Martínez`,accion:`ausencia_creada`,notas:`Solicitud por duelo familiar (fallecimiento de familiar directo).`,creado_a:new Date(Date.now()-36e5*24*18).toISOString(),created_at:new Date(Date.now()-36e5*24*18).toISOString(),detalles:{motivo:`Duelo`,maestro:`Ana Martínez`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a28`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a38`,usuario_id:`maestro.cuerdas@gentleai.com`,usuario_nombre:`Pedro Castillo`,accion:`ausencia_creada`,notas:`Ausencia por capacitación pedagógica en el extranjero.`,creado_a:new Date(Date.now()-36e5*24*15).toISOString(),created_at:new Date(Date.now()-36e5*24*15).toISOString(),detalles:{motivo:`Capacitación`,maestro:`Pedro Castillo`,duracion:`7 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a29`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a39`,usuario_id:`maestro.vientos@gentleai.com`,usuario_nombre:`Carmen Rivas`,accion:`ausencia_creada`,notas:`Solicitud por emergencia familiar de último momento.`,creado_a:new Date(Date.now()-36e5*24*12).toISOString(),created_at:new Date(Date.now()-36e5*24*12).toISOString(),detalles:{motivo:`Emergencia familiar`,maestro:`Carmen Rivas`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a30`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a40`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: pendiente → aprobada. Documentación completa.`,creado_a:new Date(Date.now()-36e5*24*10).toISOString(),created_at:new Date(Date.now()-36e5*24*10).toISOString(),detalles:{estado_anterior:`pendiente`,estado_nuevo:`aprobada`,motivo_cambio:`Documentación completa`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a31`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a41`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`estado_modificado`,notas:`Cambio de estado: aprobada → rechazada. Se detectó inconsistencia en fechas.`,creado_a:new Date(Date.now()-36e5*24*8).toISOString(),created_at:new Date(Date.now()-36e5*24*8).toISOString(),detalles:{estado_anterior:`aprobada`,estado_nuevo:`rechazada`,motivo_cambio:`Inconsistencia en fechas`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a32`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a42`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`estado_modificado`,notas:`Cambio de estado: pendiente → en_revision. Se solicitaron documentos adicionales.`,creado_a:new Date(Date.now()-36e5*24*6).toISOString(),created_at:new Date(Date.now()-36e5*24*6).toISOString(),detalles:{estado_anterior:`pendiente`,estado_nuevo:`en_revision`,motivo_cambio:`Documentos adicionales requeridos`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a33`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a43`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: en_revision → aprobada. Todo en orden.`,creado_a:new Date(Date.now()-36e5*24*5).toISOString(),created_at:new Date(Date.now()-36e5*24*5).toISOString(),detalles:{estado_anterior:`en_revision`,estado_nuevo:`aprobada`,motivo_cambio:`Documentación verificada`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a44`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: aprobada → cancelada. El maestro solicitó cancelación.`,creado_a:new Date(Date.now()-36e5*24*3).toISOString(),created_at:new Date(Date.now()-36e5*24*3).toISOString(),detalles:{estado_anterior:`aprobada`,estado_nuevo:`cancelada`,motivo_cambio:`Solicitud del maestro`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a35`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a45`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso especial aprobado para asistir a congreso de educación musical.`,creado_a:new Date(Date.now()-36e5*24*21).toISOString(),created_at:new Date(Date.now()-36e5*24*21).toISOString(),detalles:{tipo_permiso:`Congreso`,maestro:`Santiago Ortiz`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a36`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a46`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`permiso_aprobado`,notas:`Permiso por medio día para trámite personal urgente.`,creado_a:new Date(Date.now()-36e5*24*17).toISOString(),created_at:new Date(Date.now()-36e5*24*17).toISOString(),detalles:{tipo_permiso:`Personal`,maestro:`Valentina Suárez`,duracion:`0.5 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a37`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a47`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso sindical aprobado según convenio colectivo.`,creado_a:new Date(Date.now()-36e5*24*14).toISOString(),created_at:new Date(Date.now()-36e5*24*14).toISOString(),detalles:{tipo_permiso:`Sindical`,maestro:`Ricardo Peña`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a38`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a48`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`permiso_aprobado`,notas:`Permiso académico aprobado para rendir examen de posgrado.`,creado_a:new Date(Date.now()-36e5*24*9).toISOString(),created_at:new Date(Date.now()-36e5*24*9).toISOString(),detalles:{tipo_permiso:`Académico`,maestro:`Daniela Ríos`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a39`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a49`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso especial aprobado para donación de sangre (beneficio institucional).`,creado_a:new Date(Date.now()-36e5*24*4).toISOString(),created_at:new Date(Date.now()-36e5*24*4).toISOString(),detalles:{tipo_permiso:`Beneficio institucional`,maestro:`Fernando Mora`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a40`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a50`,usuario_id:`maestro.vientos@gentleai.com`,usuario_nombre:`Miguel Ángel`,accion:`ausencia_creada`,notas:`Solicitud por enfermedad repentina. Adjunta certificado médico.`,creado_a:new Date(Date.now()-36e5*24*2).toISOString(),created_at:new Date(Date.now()-36e5*24*2).toISOString(),detalles:{motivo:`Enfermedad`,maestro:`Miguel Ángel`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a41`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a51`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`APROBACION_FINAL`,notas:`Aprobación final de ausencia por maternidad. Sustitución asignada.`,creado_a:new Date(Date.now()-36e5*24*1).toISOString(),created_at:new Date(Date.now()-36e5*24*1).toISOString(),detalles:{motivo:`Maternidad`,maestro:`Gabriela Torres`,duracion:`90 días`,sustituto:`María Fernández`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a42`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a52`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`CREACION`,notas:`Registro de ausencia preventiva por brote de gripe en el aula.`,creado_a:new Date(Date.now()-36e5*12).toISOString(),created_at:new Date(Date.now()-36e5*12).toISOString(),detalles:{motivo:`Preventivo`,maestro:`Varios`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a43`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a53`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`RECHAZO`,notas:`Rechazada por superar el límite de días permitidos sin justificación.`,creado_a:new Date(Date.now()-36e5*6).toISOString(),created_at:new Date(Date.now()-36e5*6).toISOString(),detalles:{motivo:`Exceso de días`,maestro:`Laura Jiménez`,duracion:`15 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a44`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a54`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso de cuidado familiar aprobado según normativa institucional.`,creado_a:new Date(Date.now()-36e5*3).toISOString(),created_at:new Date(Date.now()-36e5*3).toISOString(),detalles:{tipo_permiso:`Cuidado familiar`,maestro:`Andrea Vega`,duracion:`2 días`}}],ga=[{id:`op-001`,tipo:`sincronizacion`,descripcion:`Sincronización masiva de asistencias del período`,estado:`completado`,timestamp:new Date(Date.now()-36e5*48).toISOString(),detalles:{registros_sincronizados:234,duracion_ms:3450}},{id:`op-002`,tipo:`reporte`,descripcion:`Generación de reporte mensual de rendimiento`,estado:`completado`,timestamp:new Date(Date.now()-36e5*36).toISOString(),detalles:{tipo_reporte:`rendimiento`,alumnos_incluidos:120}},{id:`op-003`,tipo:`sincronizacion`,descripcion:`Respaldo de base de datos local a la nube`,estado:`fallido`,timestamp:new Date(Date.now()-36e5*30).toISOString(),detalles:{error:`Conexión interrumpida durante la transferencia`,tamano_mb:256}},{id:`op-004`,tipo:`mantenimiento`,descripcion:`Limpieza de registros huérfanos en ausencias_auditoria`,estado:`completado`,timestamp:new Date(Date.now()-36e5*24).toISOString(),detalles:{registros_eliminados:15}},{id:`op-005`,tipo:`reporte`,descripcion:`Exportación de estadísticas a Excel para dirección académica`,estado:`completado`,timestamp:new Date(Date.now()-36e5*18).toISOString(),detalles:{formato:`xlsx`,tamano_kb:450}},{id:`op-006`,tipo:`sincronizacion`,descripcion:`Sincronización de perfiles de nuevos maestros`,estado:`completado`,timestamp:new Date(Date.now()-36e5*12).toISOString(),detalles:{maestros_sincronizados:3,duracion_ms:1200}},{id:`op-007`,tipo:`mantenimiento`,descripcion:`Actualización de índices de base de datos`,estado:`en_progreso`,timestamp:new Date(Date.now()-36e5*8).toISOString(),detalles:{tablas_afectadas:5,progreso:`65%`}},{id:`op-008`,tipo:`reporte`,descripcion:`Generación de alertas tempranas de abandono`,estado:`fallido`,timestamp:new Date(Date.now()-36e5*6).toISOString(),detalles:{error:`Timeout en consulta a vw_riesgo_abandono`,duracion_ms:15e3}},{id:`op-009`,tipo:`sincronizacion`,descripcion:`Carga de planificación curricular del nuevo período`,estado:`pendiente`,timestamp:new Date(Date.now()-36e5*4).toISOString(),detalles:{periodo:`2026-02`,archivos_pendientes:8}},{id:`op-010`,tipo:`mantenimiento`,descripcion:`Compactación de almacenamiento offline (IndexedDB)`,estado:`completado`,timestamp:new Date(Date.now()-36e5*2).toISOString(),detalles:{espacio_liberado_mb:12,registros_compactados:340}},{id:`op-011`,tipo:`reporte`,descripcion:`Reporte de cumplimiento docente semanal`,estado:`completado`,timestamp:new Date(Date.now()-36e5*1).toISOString(),detalles:{tipo_reporte:`cumplimiento`,maestros_evaluados:45}}];async function _a(){return await new Promise(e=>setTimeout(e,250)),[...ma]}async function va(){return await new Promise(e=>setTimeout(e,300)),[...ha]}async function ya(e){await new Promise(e=>setTimeout(e,50));let t={timestamp:new Date().toISOString(),level:e.level||`INFO`,module:e.module||`Client`,message:e.message||`Sin mensaje de error especificado`,network:navigator.onLine?`Online`:`Offline`,stack:e.stack||``};return ma.unshift(t),console.log(`Mock: System Log registrado`,t),t}async function ba(){return await new Promise(e=>setTimeout(e,200)),[...ga]}async function xa(e){return await new Promise(e=>setTimeout(e,200)),{radarData:[{id:`1`,health_status:`active`,days_inactive:2},{id:`2`,health_status:`stagnant`,days_inactive:15},{id:`3`,health_status:`stagnant`,days_inactive:20},{id:`4`,health_status:`active`,days_inactive:0},{id:`5`,health_status:`not_started`,days_inactive:30}],nodeDifficulty:[{node_name:`Posición de Mano Izquierda (Violín)`,failure_percentage:75},{node_name:`Postura de Arco (Violín)`,failure_percentage:60},{node_name:`Afinación Básica`,failure_percentage:45}],complianceData:[{nombre:`Carlos Gómez`,categoria:`negligente`,sesiones_rojo:8},{nombre:`María Luz`,categoria:`regular`,sesiones_rojo:3},{nombre:`Pedro Almonte`,categoria:`responsable`,sesiones_rojo:0}]}}var Sa=()=>ke.isDemoMode?pa:oa,Ca=(...e)=>Sa().getSystemLogs(...e),wa=(...e)=>Sa().getAuditLogs(...e),Ta=(...e)=>Sa().recordSystemLog(...e),Ea=(...e)=>Sa().callDslRpc(...e);function Da(e){let t=null,n=`ALL`,r=null,a=null;async function o(){t&&(t.innerHTML=`
      <div class="row g-3">
        <div class="col-12 col-lg-8">
          <div class="p-3 bg-light bg-opacity-25 border rounded-3 h-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <span class="small fw-semibold text-secondary">Filtro de Severidad:</span>
              <div class="btn-group btn-group-sm shadow-sm" role="group">
                <button class="btn btn-outline-secondary ${n===`ALL`?`active`:``}" data-log-filter="ALL">TODOS</button>
                <button class="btn btn-outline-info ${n===`INFO`?`active`:``}" data-log-filter="INFO">INFO</button>
                <button class="btn btn-outline-warning text-dark ${n===`WARNING`?`active`:``}" data-log-filter="WARNING">WARN</button>
                <button class="btn btn-outline-danger ${n===`ERROR`?`active`:``}" data-log-filter="ERROR">ERROR</button>
              </div>
            </div>

            <!-- Terminal Consola -->
            <div class="obs-terminal-container">
              <div class="obs-terminal-header">
                <div class="obs-terminal-dots">
                  <div class="obs-terminal-dot red"></div>
                  <div class="obs-terminal-dot yellow"></div>
                  <div class="obs-terminal-dot green"></div>
                </div>
                <div class="obs-terminal-title">SOI_OS v1.1.0 // PWA_TERMINAL_LOGS</div>
                <div id="live-net-status"></div>
              </div>
              <div class="obs-terminal-body" id="logs-body">
                <div class="text-center py-5 text-muted">Cargando consola técnica...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="p-3 bg-light bg-opacity-25 border rounded-3 h-100 d-flex flex-column justify-content-between">
            <div>
              <h6 class="fw-bold text-primary mb-2"><i class="bi bi-bug me-1"></i>Simulador de Eventos Técnicos</h6>
              <p class="extra-small text-muted lh-base">
                Genera de manera interactiva excepciones en caliente para evaluar el sistema de alertas tempranas, el flujo RLS de Supabase y la tolerancia offline.
              </p>
              <div class="vstack gap-2 mt-3">
                <button class="btn btn-sm btn-outline-danger text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-rls">
                  <span><i class="bi bi-shield-x me-1"></i> Falla de Permisos RLS</span>
                  <span class="badge bg-danger">ERROR</span>
                </button>
                <button class="btn btn-sm btn-outline-warning text-dark text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-timeout">
                  <span><i class="bi bi-wifi-off me-1"></i> Timeout de Petición HTTP</span>
                  <span class="badge bg-warning text-dark">WARN</span>
                </button>
                <button class="btn btn-sm btn-outline-success text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-vitals">
                  <span><i class="bi bi-activity me-1"></i> Reportar Core Web Vitals</span>
                  <span class="badge bg-success">INFO</span>
                </button>
              </div>
            </div>

            <div class="mt-4 border-top pt-3">
              <span class="small fw-semibold text-secondary d-block mb-1">Audit Trail de Conectividad</span>
              <p class="extra-small text-muted mb-0">
                La PWA encola de forma resiliente todos los logs de excepción locales en su almacenamiento cacheado cuando no detecta conexión a internet.
              </p>
            </div>
          </div>
        </div>
      </div>
    `,s(),await c(),l())}function s(){let e=t.querySelector(`#live-net-status`);e&&(e.innerHTML=navigator.onLine?`<span class="badge bg-success rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small"><span class="spinner-grow spinner-grow-sm text-white obs-net-spinner obs-spinner-slow"></span> ONLINE</span>`:`<span class="badge bg-warning text-dark rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small obs-pulse-offline"><span class="spinner-grow spinner-grow-sm text-dark obs-net-spinner"></span> OFFLINE</span>`)}async function c(){let e=t.querySelector(`#logs-body`);if(!e)return;let r=await Ca(),i=n===`ALL`?r:r.filter(e=>e.level===n);if(i.length===0){e.innerHTML=`<div class="text-center text-muted py-5">[Consola vacía. No hay logs registrados con severidad "${n}"]</div>`;return}e.innerHTML=i.map(e=>{let t=`obs-log-level-info`;e.level===`WARNING`&&(t=`obs-log-level-warning`),e.level===`ERROR`&&(t=`obs-log-level-error`);let n=`
        <div class="obs-log-item">
          <span class="obs-log-ts">[${e.timestamp?e.timestamp.substring(11,19):new Date().toISOString().substring(11,19)}]</span>
          <span class="${t}">[${e.level}]</span>
          <span class="obs-log-module">${z(e.module)}</span>:
          <span>${z(e.message)}</span>
          <span class="obs-log-net">${e.network}</span>
      `;return e.stack&&(n+=`<pre class="obs-log-stack">${z(e.stack)}</pre>`),n+=`</div>`,n}).join(``)}function l(){t.querySelectorAll(`[data-log-filter]`).forEach(e=>{e.addEventListener(`click`,()=>{t.querySelectorAll(`[data-log-filter]`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),n=e.dataset.logFilter,c()})}),t.querySelector(`#btn-clear-logs`)?.addEventListener(`click`,()=>{localStorage.setItem(`soi_system_logs`,JSON.stringify([])),i.show(`Consola de logs de sistema limpiada con éxito`,`success`),c()}),t.querySelector(`#btn-mock-rls`)?.addEventListener(`click`,async()=>{await Ta({level:`ERROR`,module:`SupabaseClient`,message:`Security policy violation for select on public.ausencias_auditoria table (RLS error).`,stack:`Error: Row Level Security block
  at executeSelect (supabaseClient.js:84:18)
  at getAuditLogs (observabilidadSupabase.js:46:12)`}),i.show(`Log de error de RLS inyectado`,`danger`),c()}),t.querySelector(`#btn-mock-timeout`)?.addEventListener(`click`,async()=>{await Ta({level:`WARNING`,module:`HTTPClient`,message:`Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.`,stack:`TimeoutException: Request took longer than 5000ms`}),i.show(`Log de timeout de red inyectado`,`warning`),c()}),t.querySelector(`#btn-mock-vitals`)?.addEventListener(`click`,async()=>{await Ta({level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).`}),i.show(`Log de Core Web Vitals inyectado`,`success`),c()})}return{async init(){if(t=document.getElementById(e),!t){console.error(`[systemLogsWidget] Contenedor #${e} no encontrado en el DOM`);return}await o(),r=()=>{s(),i.show(`Conectividad restablecida. Sistema Online.`,`success`)},a=()=>{s(),i.show(`Conexión perdida. Trabajando en modo Offline.`,`warning`)},window.addEventListener(`online`,r),window.addEventListener(`offline`,a)},destroy(){r&&window.removeEventListener(`online`,r),a&&window.removeEventListener(`offline`,a)}}}function Oa(e){let t=null,n=``,r=`ALL`;async function i(){t&&(t.innerHTML=`
      <div class="row g-3 mb-4 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold text-secondary">Buscar por Actor / Notas / ID</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control shadow-sm" id="input-audit-search" placeholder="Correo, UUID, notas..." value="${z(n)}">
          </div>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-secondary">Acción Transaccional</label>
          <select class="form-select shadow-sm" id="select-audit-action">
            <option value="ALL" ${r===`ALL`?`selected`:``}>Todas las Acciones</option>
            <option value="APROBACION_FINAL" ${r===`APROBACION_FINAL`?`selected`:``}>Aprobación Final</option>
            <option value="CREACION" ${r===`CREACION`?`selected`:``}>Creación</option>
            <option value="RECHAZO" ${r===`RECHAZO`?`selected`:``}>Rechazo</option>
          </select>
        </div>
        <div class="col-12 col-md-3">
          <button class="btn btn-outline-primary w-100 shadow-sm" id="btn-reset-audit-filters"><i class="bi bi-arrow-counterclockwise me-1"></i>Limpiar Filtros</button>
        </div>
      </div>

      <div class="table-responsive page-glass p-0 overflow-hidden shadow-sm border rounded-3">
        <table class="table table-hover table-striped align-middle mb-0" id="table-audit-trail">
          <thead class="table-light">
            <tr>
              <th class="py-3 px-3 obs-audit-header">Fecha y Hora</th>
              <th class="py-3 obs-audit-header">Acción</th>
              <th class="py-3 obs-audit-header">Usuario Actor</th>
              <th class="py-3 obs-audit-header">Notas de Transacción</th>
              <th class="py-3 px-3 text-center obs-audit-header">Detalles</th>
            </tr>
          </thead>
          <tbody class="small" id="audit-trail-tbody">
            <tr>
              <td colspan="5" class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="audit-pagination-info" class="text-muted extra-small mt-2 text-end fw-semibold"></div>
    `,await a(),l())}async function a(){let e=t.querySelector(`#audit-trail-tbody`),i=t.querySelector(`#audit-pagination-info`);if(!e)return;let a=await wa()||[];if(n.trim()!==``){let e=n.toLowerCase();a=a.filter(t=>t.actor_id&&t.actor_id.toLowerCase().includes(e)||t.usuario_id&&t.usuario_id.toLowerCase().includes(e)||t.notas&&t.notas.toLowerCase().includes(e)||t.id&&t.id.toLowerCase().includes(e))}r!==`ALL`&&(a=a.filter(e=>e.accion===r));let o=a.slice(0,50);if(o.length===0){e.innerHTML=`<tr><td colspan="5" class="text-center text-muted py-5"><i class="bi bi-info-circle me-1"></i> No se encontraron registros de auditoría.</td></tr>`,i&&(i.textContent=`Mostrando 0 registros`);return}e.innerHTML=o.map(e=>{let t=`bg-secondary`;e.accion===`APROBACION_FINAL`&&(t=`bg-success bg-opacity-10 text-success border border-success-subtle`),e.accion===`CREACION`&&(t=`bg-primary bg-opacity-10 text-primary border border-primary-subtle`),e.accion===`RECHAZO`&&(t=`bg-danger bg-opacity-10 text-danger border border-danger-subtle`);let n=e.creado_a?new Date(e.creado_a).toLocaleString(`es-ES`):`Fecha no disponible`,r=e.usuario_id||e.actor_id||`Sistema`;return`
        <tr>
          <td class="text-nowrap px-3 text-secondary">${n}</td>
          <td><span class="badge ${t} px-2.5 py-1.5 rounded-pill fw-semibold obs-audit-action-label">${e.accion}</span></td>
          <td class="fw-semibold text-break obs-audit-actor-cell" title="${r}">${r}</td>
          <td class="text-secondary">${z(e.notas||`Sin comentarios adicionales`)}</td>
          <td class="text-center px-3">
            <button class="btn btn-sm btn-outline-secondary btn-audit-detail rounded-circle shadow-sm obs-audit-detail-btn" data-audit-id="${e.id}">
              <i class="bi bi-info-circle-fill obs-audit-detail-icon"></i>
            </button>
          </td>
        </tr>
      `}).join(``),i&&(i.textContent=`Mostrando ${o.length} de ${a.length} registros (límite de 50 registros por página)`),t.querySelectorAll(`.btn-audit-detail`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.auditId,n=o.find(e=>e.id===t);n&&s(n)})})}function s(e){let t=e.detalles?Object.keys(e.detalles).map(t=>`
          <div class="col-6 mb-2">
            <span class="d-block extra-small text-muted text-uppercase fw-bold">${t}</span>
            <span class="small fw-semibold text-secondary">${z(String(e.detalles[t]))}</span>
          </div>
        `).join(``):``,n=`
      <div class="p-3">
        <div class="mb-3">
          <strong class="small text-secondary d-block">ID ÚNICO DE AUDITORÍA:</strong>
          <div class="font-monospace bg-light bg-opacity-50 p-2.5 rounded border text-break extra-small mt-1 text-primary fw-semibold">${e.id}</div>
        </div>
        <div class="row g-2 mb-3 bg-light bg-opacity-25 p-2.5 rounded border">
          <div class="col-6">
            <strong class="extra-small text-secondary d-block text-uppercase">Fecha y Hora:</strong>
            <span class="small fw-semibold">${new Date(e.creado_a).toLocaleString(`es-ES`)}</span>
          </div>
          <div class="col-6">
            <strong class="extra-small text-secondary d-block text-uppercase">Acción Transaccional:</strong>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1 rounded-pill mt-0.5 fw-bold obs-audit-badge">${e.accion}</span>
          </div>
        </div>
        <div class="mb-3">
          <strong class="small text-secondary d-block">USUARIO ACTOR RESPONSABLE:</strong>
          <div class="mt-1 small text-dark fw-bold text-break"><i class="bi bi-person-fill me-1 text-secondary"></i> ${e.usuario_id||e.actor_id}</div>
        </div>
        <div class="mb-3">
          <strong class="small text-secondary d-block">NOTAS / OBSERVACIÓN:</strong>
          <div class="mt-1 p-3 bg-light bg-opacity-25 rounded border text-secondary small lh-base italic">"${z(e.notas||`Sin notas registradas en esta transacción`)}"</div>
        </div>
        ${t?`
          <div class="border-top pt-3">
            <strong class="small text-secondary d-block mb-2">METADATOS EN PAYLOAD (JSON):</strong>
            <div class="row g-2 bg-light bg-opacity-10 p-2 rounded border">
              ${t}
            </div>
          </div>
        `:``}
      </div>
    `;o.open({title:`Detalles del Audit Trail de Seguridad`,body:n,hideSave:!0,cancelText:`Cerrar`})}let c=[];function l(){let e=t.querySelector(`#input-audit-search`),i=e=>{n=e.target.value,a()};e?.addEventListener(`input`,i),e&&c.push({el:e,event:`input`,fn:i});let o=t.querySelector(`#select-audit-action`),s=e=>{r=e.target.value,a()};o?.addEventListener(`change`,s),o&&c.push({el:o,event:`change`,fn:s});let l=t.querySelector(`#btn-reset-audit-filters`),u=()=>{n=``,r=`ALL`,e&&(e.value=``),o&&(o.value=`ALL`),a()};l?.addEventListener(`click`,u),l&&c.push({el:l,event:`click`,fn:u})}return{async init(){if(t=document.getElementById(e),!t){console.error(`[auditTrailWidget] Contenedor #${e} no encontrado en el DOM`);return}await i()},destroy(){c.forEach(({el:e,event:t,fn:n})=>{e.removeEventListener(t,n)}),c=[],t=null}}}var Y={activeTab:localStorage.getItem(`pm_metrics_tab`)||`resumen`,stats:null,cargando:!1,container:null,activeWidgetInstance:null,_onlineListener:null,_offlineListener:null};async function ka(e){if(e)try{Y.activeWidgetInstance&&typeof Y.activeWidgetInstance.destroy==`function`&&(Y.activeWidgetInstance.destroy(),Y.activeWidgetInstance=null),Y.container=e,Y.cargando=!0,Aa(e),Y.stats=await ea(),Y.resumenAlertas=await ra(),Y.cargando=!1,Ma(e),Ba(e)}catch(t){console.error(t),ja(e,t.message)}}function Aa(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center obs-loading-area"><div class="spinner-border text-primary" role="status"></div></div>`}function ja(e,t){e.innerHTML=`<div class="alert alert-danger m-3"><h5>Error analítico</h5><p>${z(t)}</p></div>`}function Ma(e){e.innerHTML=`
    <div class="page-container">
      <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-cpu me-2 text-primary"></i>Analytics & Observability Hub</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- Monitor de Sincronización Offline Reactivo -->
          <div id="offline-network-badge-container"></div>
          <button id="btn-guia-analisis" class="btn btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 small fw-semibold transition-all">
            <i class="bi bi-info-circle-fill"></i>
            <span>Guía de Análisis</span>
          </button>
        </div>
      </div>

      <div class="pm-tabs-container mb-4">
        <div class="btn-group w-100 shadow-sm flex-wrap" role="group">
          <button class="btn btn-outline-primary ${Y.activeTab===`resumen`?`active`:``}" data-tab="resumen"><i class="bi bi-speedometer2 me-1"></i> Resumen</button>
          <button class="btn btn-outline-primary ${Y.activeTab===`operaciones`?`active`:``}" data-tab="operaciones"><i class="bi bi-gear-fill me-1"></i> Operaciones</button>
          <button class="btn btn-outline-primary ${Y.activeTab===`logs`?`active`:``}" data-tab="logs"><i class="bi bi-terminal me-1"></i> Logs PWA</button>
          <button class="btn btn-outline-primary ${Y.activeTab===`auditoria`?`active`:``}" data-tab="auditoria"><i class="bi bi-shield-check me-1"></i> Auditoría</button>
          <button class="btn btn-outline-primary ${Y.activeTab===`ia`?`active`:``}" data-tab="ia"><i class="bi bi-robot me-1"></i> IA Intelligence</button>
        </div>
      </div>

      <div id="hub-content">
        ${Pa()}
      </div>
    </div>
  `,Na()}function Na(){let e=Y.container.querySelector(`#offline-network-badge-container`);e&&(e.innerHTML=navigator.onLine?`<span class="badge bg-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-white obs-spinner-slow" role="status"></span><i class="bi bi-cloud-check me-1"></i> Online</span>`:`<span class="badge bg-warning text-dark rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-dark animate-pulse" role="status"></span><i class="bi bi-cloud-slash me-1"></i> Offline - Logs encolados</span>`)}function Pa(){switch(Y.activeTab){case`resumen`:return Fa();case`operaciones`:return Ia();case`logs`:return La();case`auditoria`:return Ra();case`ia`:return za();default:return Fa()}}function Fa(){let e=Y.stats||{},t=Y.resumenAlertas||{total:0,rojas:0};return`
    <div class="row g-3">
      <div class="col-md-6 col-lg-3">
        ${aa({label:`Alumnos Activos`,value:e.total_alumnos||0,icon:`bi-people`,color:`primary`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${aa({label:`Promedio Global`,value:(e.promedio_general||0).toFixed(2),icon:`bi-star`,color:`success`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${aa({label:`Alertas Rojas`,value:t.rojas,icon:`bi-exclamation-octagon`,color:`danger`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${aa({label:`Asistencia Hoy`,value:(e.asistencia_hoy_porcentaje||0)+`%`,icon:`bi-check2-circle`,color:`info`})}
      </div>
      
      <div class="col-12 mt-4">
        <h5 class="fw-bold mb-3"><i class="bi bi-trophy me-2 text-warning"></i>Alumnos Destacados</h5>
        <div class="page-glass p-0 overflow-hidden">
          <div id="destacados-placeholder" class="p-4 text-center text-muted">Cargando destacados...</div>
        </div>
      </div>
    </div>
  `}function Ia(){return`
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 class="fw-bold m-0"><i class="bi bi-gear-wide-connected text-primary me-2"></i>Monitoreo de Operaciones y Cumplimiento Docente</h5>
        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1.5 rounded-pill">Cruces de Rendimiento</span>
      </div>
      <div class="alert alert-info small mb-4">
        <i class="bi bi-info-circle me-1"></i> <strong>Punto Ciego Analítico:</strong> Este panel cruza la tasa de asistencia de los estudiantes con las demoras y cumplimiento de llenado de registros por parte del personal docente.
      </div>
      <div class="row g-4">
        <div class="col-12 col-xl-7">
          <div class="p-3 border rounded-3 bg-light bg-opacity-25 shadow-sm">
            <h6 class="fw-bold mb-3"><i class="bi bi-person-badge text-primary me-1"></i>Estado de Cumplimiento Docente</h6>
            <div id="cumplimiento-maestros-container">
              <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            </div>
          </div>
        </div>
        <div class="col-12 col-xl-5">
          <div class="p-3 border rounded-3 bg-light bg-opacity-25 shadow-sm">
            <h6 class="fw-bold mb-3"><i class="bi bi-graph-up-arrow text-primary me-1"></i>Velocidad de Llenado de Registros</h6>
            <div id="comportamiento-llenado-container">
              <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function La(){return`
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h5 class="fw-bold m-0"><i class="bi bi-terminal-fill text-danger me-2"></i>Consola Técnica y Monitor de Red</h5>
        <button class="btn btn-sm btn-outline-secondary" id="btn-clear-logs"><i class="bi bi-trash me-1"></i>Limpiar Consola</button>
      </div>
      <!-- Widget Modular de Logs Técnicos -->
      <div id="system-logs-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function Ra(){return`
    <div class="page-glass p-4">
      <!-- Widget Modular de Auditoría -->
      <div id="audit-trail-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function za(){return`
    <div class="text-center py-5">
      <i class="bi bi-robot fs-1 text-primary d-block mb-3 animate-bell"></i>
      <h5>SOI Intelligence</h5>
      <p class="text-muted">Genera un análisis narrativo del estado actual de tu grupo.</p>
      <div class="d-flex justify-content-center gap-2 flex-wrap">
        <button class="btn btn-primary px-4 rounded-pill" id="btn-run-ia">
          <i class="bi bi-magic me-1"></i> Iniciar Análisis de IA
        </button>
        <a href="#/metricas-ia-reportes" class="btn btn-outline-secondary px-4 rounded-pill">
          <i class="bi bi-file-earmark-richtext me-1"></i> Generador de Reportes Completo
        </a>
      </div>
      <div id="ia-result-area" class="mt-4 text-start obs-ia-result-box"></div>
    </div>
  `}function Ba(e){e.querySelectorAll(`[data-tab]`).forEach(t=>{t.addEventListener(`click`,()=>{Y.activeWidgetInstance&&typeof Y.activeWidgetInstance.destroy==`function`&&(Y.activeWidgetInstance.destroy(),Y.activeWidgetInstance=null),Y.activeTab=t.dataset.tab,localStorage.setItem(`pm_metrics_tab`,Y.activeTab),Ma(e),Ba(e),Va()})}),e.querySelector(`#btn-guia-analisis`)?.addEventListener(`click`,()=>{Ua()}),Y._onlineListener=Na,Y._offlineListener=Na,window.addEventListener(`online`,Y._onlineListener),window.addEventListener(`offline`,Y._offlineListener),Va()}async function Va(){if(Y.activeTab===`resumen`){let e=await ia(),t=Y.container.querySelector(`#destacados-placeholder`);t&&(t.className=``,t.innerHTML=`
        <table class="table table-compact table-hover mb-0">
          <tbody class="small">
            ${e.slice(0,5).map(e=>`
              <tr>
                <td><i class="bi bi-award text-warning me-2"></i><strong>${z(e.nombre_completo)}</strong></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">${e.promedio}</span></td>
                <td class="text-muted">${z(e.programa)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      `)}if(Y.activeTab===`operaciones`){try{let{CumplimientoMaestrosWidget:e}=await a(async()=>{let{CumplimientoMaestrosWidget:e}=await import(`./cumplimientoMaestrosWidget-EfZFh2_Y.js`).then(e=>e.n);return{CumplimientoMaestrosWidget:e}},__vite__mapDeps([8,1,2,9,10]));await new e(`cumplimiento-maestros-container`).init()}catch(e){console.error(`Error al cargar el widget de CumplimientoMaestrosWidget:`,e);let t=Y.container.querySelector(`#cumplimiento-maestros-container`);t&&(t.innerHTML=`<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar el Cumplimiento de Maestros.</div>`)}try{let{analyticsFillingBehaviorWidget:e}=await a(async()=>{let{analyticsFillingBehaviorWidget:e}=await import(`./analyticsFillingBehaviorWidget-jvxTQK6x.js`).then(e=>e.n);return{analyticsFillingBehaviorWidget:e}},__vite__mapDeps([11,1,9,12]));await e(`comportamiento-llenado-container`).init()}catch(e){console.error(`Error al cargar el widget de Comportamiento de Llenado:`,e);let t=Y.container.querySelector(`#comportamiento-llenado-container`);t&&(t.innerHTML=`<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar la Analítica de Llenado.</div>`)}}if(Y.activeTab===`logs`){let e=Da(`system-logs-container`);Y.activeWidgetInstance=e,await e.init()}if(Y.activeTab===`auditoria`){let e=Oa(`audit-trail-container`);Y.activeWidgetInstance=e,await e.init()}Y.activeTab===`ia`&&Ha()}function Ha(){Y.container.querySelector(`#btn-run-ia`)?.addEventListener(`click`,async()=>{let e=Y.container.querySelector(`#ia-result-area`);e&&(e.innerHTML=`<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Analizando datos...</p></div>`,setTimeout(()=>{e.innerHTML=`
        <div class="page-glass p-3 border-primary border-start border-4">
          <p class="small mb-2"><strong>Análisis Institucional:</strong></p>
          <p class="extra-small text-secondary">Basado en el rendimiento del período actual, se observa una mejora del 12% en la asistencia del grupo de Cuerdas. Sin embargo, 3 alumnos muestran un patrón de riesgo por inasistencias en la última racha de 15 días.</p>
          <button class="btn btn-xs btn-outline-primary mt-2" id="btn-copy-report">Copiar Reporte</button>
        </div>
      `,Y.container.querySelector(`#btn-copy-report`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.querySelector(`p.text-secondary`).innerText),i.show(`Reporte copiado al portapapeles`,`success`)})},1500))})}function Ua(){o.open({title:`Guía de Análisis Académico y Observabilidad`,body:`
    <div class="obs-guia-modal-body container-fluid p-0">
      <div class="row g-0 flex-column flex-md-row">
        <!-- Barra de navegación lateral -->
        <div class="col-12 col-md-4 border-end pb-3 pb-md-0 pe-md-3 mb-3 mb-md-0 obs-border-subtle">
          <div class="d-flex flex-row flex-md-column gap-1 overflow-x-auto overflow-y-hidden obs-scrollbar-none" id="guia-modal-tabs">
            <button class="obs-guia-tab-btn active text-nowrap" data-guia="resumen" type="button">
              <i class="bi bi-speedometer2"></i>
              <span>Resumen & KPIs</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="operaciones" type="button">
              <i class="bi bi-gear-fill"></i>
              <span>Operaciones & Docencia</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="logs" type="button">
              <i class="bi bi-terminal"></i>
              <span>Logs de Sistema</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="auditoria" type="button">
              <i class="bi bi-shield-check"></i>
              <span>Auditoría Trail</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="ia" type="button">
              <i class="bi bi-robot"></i>
              <span>SOI Intelligence</span>
            </button>
          </div>
        </div>

        <!-- Panel de contenidos principal -->
        <div class="col-12 col-md-8 ps-md-3">
          <div class="guia-panels-content">
            
            <!-- PANEL RESUMEN -->
            <div class="guia-panel active" id="pane-resumen">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-speedometer2"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Métricas Macro y KPIs de Control</h6>
                  <p class="extra-small text-muted mb-0">El pulso integral del período académico en tiempo real.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-primary obs-guia-card-title">Resumen General</span>
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle extra-small">KPIs</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Consolida a nivel institucional la cantidad de estudiantes inscritos, el promedio general y el porcentaje de asistencia de la fecha actual.
                  </p>
                  <div class="obs-guia-data-badge">
                    <i class="bi bi-database me-1 text-primary"></i> vw_estadisticas_periodo
                  </div>
                </div>
                
                <div class="obs-guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-warning obs-guia-card-title">Alumnos Destacados</span>
                    <span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle extra-small">Rendimiento</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Identifica automáticamente a los alumnos sobresalientes con un promedio ponderado mayor o igual a <strong>9.50</strong> para visibilizar e incentivar el mérito académico.
                  </p>
                  <div class="obs-guia-data-badge">
                    <i class="bi bi-database me-1 text-warning"></i> vw_destacados_y_riesgo_academico
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL OPERACIONES -->
            <div class="guia-panel d-none" id="pane-operaciones">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-gear-fill"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Cumplimiento Operativo y Docencia</h6>
                  <p class="extra-small text-muted mb-0">Cruce dinámico del llenado de clases y estadísticas operativas.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <span class="fw-bold small text-primary d-block mb-2">Detección de Puntos Ciegos</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Estudia si el ausentismo estudiantil coincide con retrasos u omisión de registros de asistencia por parte de maestros en categoría irregular o negligente.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL LOGS -->
            <div class="guia-panel d-none" id="pane-logs">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-danger bg-opacity-10 text-danger">
                  <i class="bi bi-terminal"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Consola de Depuración del Cliente (PWA)</h6>
                  <p class="extra-small text-muted mb-0">Monitoreo de excepciones técnicas, red y tolerancia offline.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <span class="fw-bold small text-danger d-block mb-2">Excepciones de Red y RLS</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Muestra fallas al ejecutar políticas de seguridad en la base de datos o caídas en la conexión de Internet del cliente, con logs persistidos.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL AUDITORIA -->
            <div class="guia-panel d-none" id="pane-auditoria">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-success bg-opacity-10 text-success">
                  <i class="bi bi-shield-check"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Audit Trail - Control de Cambios</h6>
                  <p class="extra-small text-muted mb-0">Trazabilidad histórica de todas las solicitudes y aprobaciones de ausencias.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <span class="fw-bold small text-success d-block mb-2">Inmutabilidad Histórica</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Cada vez que un maestro o administrador crea, aprueba o rechaza una ausencia, se graba un log transaccional no-modificable para prevenir el fraude.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL IA -->
            <div class="guia-panel d-none" id="pane-ia">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-info bg-opacity-10 text-info">
                  <i class="bi bi-robot"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">SOI Intelligence - IA de Confianza</h6>
                  <p class="extra-small text-muted mb-0">Modelos generativos (Groq) con inyección de contexto rigurosa.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card border-start border-3 border-info">
                  <span class="badge bg-info bg-opacity-10 text-info border border-info-subtle extra-small mb-2">Protocolo Antialucinaciones</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Para asegurar análisis veraces, la IA no tiene acceso general a la base de datos transaccional. En su lugar, el sistema compila paquetes de datos agregados en JSON provenientes de las vistas consolidadas según el tipo de reporte solicitado.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,size:`lg`,hideSave:!0,cancelText:`Entendido`,onShow:e=>{let t=e.querySelectorAll(`#guia-modal-tabs button`),n=e.querySelectorAll(`.guia-panel`);t.forEach(r=>{r.addEventListener(`click`,()=>{t.forEach(e=>e.classList.remove(`active`)),r.classList.add(`active`),n.forEach(e=>e.classList.add(`d-none`));let i=e.querySelector(`#pane-${r.dataset.guia}`);i&&i.classList.remove(`d-none`)})})}})}var Wa=class{constructor(e,t={}){this.container=e,this.data=t.data||[],this.onSelect=t.onSelect||(()=>{}),this.expandedNodes=new Set,this.selectedNodeId=null,this.icons={block:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,level:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M2 12h20M2 7h20"></path></svg>`,node:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`,indicator:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,expander:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`},this._injectStyles(),this.render(),this._bindEvents()}setData(e){this.data=e,this.render()}render(){this.container.innerHTML=`
      <div class="academic-tree">
        ${this._generateTreeHTML(this.data)}
      </div>
    `}_generateTreeHTML(e,t=0){return!e||e.length===0?``:`
      <ul class="tree-list ${t>0?`tree-sublist`:``}" style="--level: ${t}">
        ${e.map(e=>this._generateNodeHTML(e,t)).join(``)}
      </ul>
    `}_generateNodeHTML(e,t){let n=this.expandedNodes.has(e.id),r=this.selectedNodeId===e.id,i=e.children&&e.children.length>0,a=e.is_critical?`is-critical`:``,o=r?`is-selected`:``,s=e.name||e.description||`Sin nombre`;return e.type===`level`&&(s=`Nivel: ${s}`),e.type===`block`&&(s=`Bloque: ${s}`),`
      <li class="tree-node ${o} ${a}" 
          data-id="${e.id}" 
          data-type="${e.type}" 
          data-level="${t}">
        <div class="tree-node-content" style="padding-left: ${t*16+8}px">
          <span class="tree-expander ${i?``:`is-hidden`} ${n?`is-expanded`:``}">
            ${this.icons.expander}
          </span>
          <span class="tree-icon">${this.icons[e.type]||``}</span>
          <span class="tree-label">${s}</span>
          ${e.is_critical?`<span class="tree-badge-critical">FUEGO</span>`:``}
        </div>
        <div class="tree-children-container" style="display: ${n?`block`:`none`}">
          ${i?this._generateTreeHTML(e.children,t+1):``}
        </div>
      </li>
    `}_bindEvents(){this.container.addEventListener(`click`,e=>{let t=e.target.closest(`.tree-expander`),n=e.target.closest(`.tree-node-content`);if(t&&!t.classList.contains(`is-hidden`)){let n=t.closest(`.tree-node`);this._toggleExpand(n),e.stopPropagation();return}if(n){let e=n.closest(`.tree-node`);this._selectNode(e)}})}_toggleExpand(e){let t=e.dataset.id,n=e.querySelector(`.tree-expander`),r=e.querySelector(`.tree-children-container`);this.expandedNodes.has(t)?(this.expandedNodes.delete(t),n.classList.remove(`is-expanded`),r&&(r.style.display=`none`)):(this.expandedNodes.add(t),n.classList.add(`is-expanded`),r&&(r.style.display=`block`))}_selectNode(e){let t=e.dataset.id;e.dataset.type;let n=this.container.querySelector(`.tree-node.is-selected`);n&&n.classList.remove(`is-selected`),e.classList.add(`is-selected`),this.selectedNodeId=t;let r=this._findNodeById(this.data,t);this.onSelect(r)}_findNodeById(e,t){for(let n of e){if(n.id===t)return n;if(n.children){let e=this._findNodeById(n.children,t);if(e)return e}}return null}_injectStyles(){if(document.getElementById(`tree-view-styles`))return;let e=document.createElement(`style`);e.id=`tree-view-styles`,e.textContent=`
      .academic-tree {
        user-select: none;
        font-family: var(--sans, system-ui);
        color: var(--apple-ink, #1d1d1f);
        padding: 8px 0;
      }
      .tree-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .tree-node-content {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 10px;
        transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        gap: 10px;
        margin: 1px 8px;
        position: relative;
      }
      .tree-node-content:hover {
        background: var(--apple-parchment, #f5f5f7);
      }
      .tree-node.is-selected > .tree-node-content {
        background: var(--apple-primary, #0066cc);
        color: #fff;
      }
      .tree-expander {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--apple-ink-muted-48, #86868b);
        transition: transform 0.2s ease;
      }
      .tree-expander.is-expanded {
        transform: rotate(90deg);
      }
      .tree-expander.is-hidden {
        visibility: hidden;
      }
      .tree-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        color: var(--apple-primary, #0066cc);
      }
      .tree-node.is-selected .tree-icon,
      .tree-node.is-selected .tree-expander {
        color: rgba(255, 255, 255, 0.9);
      }
      .tree-node.is-critical .tree-icon {
        color: #ff3b30;
      }
      .tree-label {
        font-size: 14px;
        font-weight: 400;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tree-node.is-selected .tree-label {
        font-weight: 500;
      }
      .tree-badge-critical {
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        background: #ff3b30;
        color: #fff;
        border-radius: 4px;
        margin-left: auto;
        letter-spacing: 0.05em;
      }
      .tree-children-container {
        overflow: hidden;
      }
      /* Animación suave para hover */
      .tree-node-content::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 10px;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .tree-node-content:hover::after {
        opacity: 1;
      }
      [data-bs-theme="dark"] .tree-node-content:hover {
        background: rgba(255,255,255,0.08);
      }
      [data-bs-theme="dark"] .tree-node.is-selected > .tree-node-content {
        background: var(--apple-primary, #0066cc);
      }
    `,document.head.appendChild(e)}};async function Ga(){let{data:e,error:n}=await t.from(`routes`).select(`*`).order(`name`);if(n)throw console.error(`Error fetching routes:`,n.message),Error(`No se pudieron cargar las rutas`);return e}async function Ka(e){let{data:n,error:r}=await t.from(`route_versions`).select(`*`).eq(`route_id`,e).order(`version_number`,{ascending:!1});if(r)throw console.error(`Error fetching route versions:`,r.message),Error(`No se pudieron cargar las versiones de la ruta`);return n}async function qa(e){if(!e)return[];try{let{data:n,error:r}=await t.from(`blocks`).select(`*`).eq(`route_version_id`,e).order(`order_index`);if(r)throw r;if(!n.length)return[];let i=n.map(e=>e.id),{data:a,error:o}=await t.from(`levels`).select(`*`).in(`block_id`,i).order(`order_index`);if(o)throw o;let s=a.map(e=>e.id),{data:c,error:l}=await t.from(`nodes`).select(`*`).in(`level_id`,s).order(`order_index`).limit(5e3);if(l)throw l;let u=c.map(e=>e.id),{data:d,error:f}=await t.from(`indicators`).select(`*`).in(`node_id`,u).order(`order_index`).limit(1e4);if(f)throw f;return n.map(e=>({...e,type:`block`,children:a.filter(t=>t.block_id===e.id).map(e=>({...e,type:`level`,children:c.filter(t=>t.level_id===e.id).map(e=>({...e,type:`node`,children:d.filter(t=>t.node_id===e.id).map(e=>({...e,type:`indicator`}))}))}))}))}catch(e){throw console.error(`Error building academic tree:`,e.message),Error(`Error al construir el árbol académico`)}}async function Ja(e){let{data:n,error:r}=await t.from(`node_resources`).select(`*`).eq(`node_id`,e).order(`order_index`);if(r)throw r;return n}async function Ya(e){let{id:n,...r}=e;if(n){let{data:e,error:i}=await t.from(`node_resources`).update(r).eq(`id`,n).select().single();if(i)throw i;return e}else{let{data:e,error:n}=await t.from(`node_resources`).insert([r]).select().single();if(n)throw n;return e}}async function Xa(e){let{error:n}=await t.from(`node_resources`).delete().eq(`id`,e);if(n)throw n;return!0}async function Za(e,n){let{data:r,error:i}=await t.from(`nodes`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}var Qa=class{constructor(e,t={}){this.container=e,this.node=null,this.resources=[],this.onUpdate=t.onUpdate||(()=>{}),this._injectStyles(),this.renderEmpty()}async setNode(e){if(!e){this.node=null,this.resources=[],this.renderEmpty();return}this.node=e,this.renderLoading();try{this.resources=await Ja(e.id),this.render()}catch(e){console.error(`Error loading resources:`,e),this.renderError(`No se pudieron cargar los recursos del nodo.`)}}renderEmpty(){this.container.innerHTML=`
      <div class="resource-editor-empty">
        <i class="bi bi-diagram-3"></i>
        <h3>Selecciona un nodo</h3>
        <p>Elige un elemento del árbol curricular para editar sus recursos y metadatos.</p>
      </div>
    `}renderLoading(){this.container.innerHTML=`
      <div class="resource-editor-loading">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Cargando recursos...</p>
      </div>
    `}renderError(e){this.container.innerHTML=`
      <div class="resource-editor-error">
        <i class="bi bi-exclamation-triangle"></i>
        <p>${e}</p>
        <button class="apple-btn apple-btn-secondary" id="retry-node-btn">Reintentar</button>
      </div>
    `,this.container.querySelector(`#retry-node-btn`)?.addEventListener(`click`,()=>this.setNode(this.node))}render(){let e=this.node.type===`node`,t=this.node.type===`indicator`;this.container.innerHTML=`
      <div class="resource-editor">
        <header class="resource-header">
          <div class="header-main">
            <span class="node-badge">${this.node.type.toUpperCase()}</span>
            <h1>${this.node.name||this.node.description||`Sin título`}</h1>
          </div>
          <p class="node-id">ID: ${this.node.id}</p>
        </header>

        <section class="editor-section">
          <div class="section-header">
            <h2>Metadatos</h2>
          </div>
          <div class="apple-card">
            <div class="form-group mb-3">
              <label class="apple-label">Nombre / Descripción</label>
              <input type="text" class="apple-input" id="node-name" value="${this.node.name||this.node.description||``}">
            </div>
            ${e?`
              <div class="form-check form-switch apple-switch">
                <input class="form-check-input" type="checkbox" id="node-critical" ${this.node.is_critical?`checked`:``}>
                <label class="form-check-label" for="node-critical">Marcar como Punto Crítico (FUEGO)</label>
              </div>
            `:``}
            <div class="mt-3 text-end">
              <button class="apple-btn apple-btn-primary" id="save-node-metadata">Guardar Cambios</button>
            </div>
          </div>
        </section>

        ${e||t?`
          <section class="editor-section">
            <div class="section-header">
              <h2>Recursos Educativos</h2>
              <button class="apple-btn apple-btn-secondary btn-sm" id="add-resource-btn">
                <i class="bi bi-plus-lg"></i> Añadir Recurso
              </button>
            </div>
            <div class="resources-list" id="resources-list">
              ${this.resources.length===0?`
                <div class="empty-list-placeholder">No hay recursos asociados a este nodo.</div>
              `:this.resources.map(e=>this._renderResourceCard(e)).join(``)}
            </div>
          </section>
        `:``}
      </div>
    `,this._bindEvents()}_renderResourceCard(e){return`
      <div class="apple-card resource-card" data-id="${e.id}">
        <div class="resource-card-icon ${e.resource_type}">
          <i class="bi ${{video:`bi-play-circle-fill`,pdf:`bi-file-earmark-pdf-fill`,exercise_text:`bi-pencil-square`,link:`bi-link-45deg`}[e.resource_type]||`bi-file-earmark`}"></i>
        </div>
        <div class="resource-card-content">
          <div class="resource-card-info">
            <h3>${e.title}</h3>
            <span class="resource-type-tag">${e.resource_type}</span>
          </div>
          <p class="resource-card-url">${e.url||`Sin URL`}</p>
        </div>
        <div class="resource-card-actions">
          <button class="icon-btn edit-res" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="icon-btn delete-res" title="Eliminar"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `}_bindEvents(){this.container.querySelector(`#save-node-metadata`)?.addEventListener(`click`,async()=>{let e=this.container.querySelector(`#node-name`).value,t=this.container.querySelector(`#node-critical`)?.checked,n=this.container.querySelector(`#save-node-metadata`);n.disabled=!0,n.textContent=`Guardando...`;try{let n={name:e};this.node.type===`node`&&(n.is_critical=t),this.node.type===`indicator`&&(n.description=e),await Za(this.node.id,n),Object.assign(this.node,n),this.onUpdate(this.node),this.render()}catch(e){alert(`Error al guardar: `+e.message)}finally{n.disabled=!1,n.textContent=`Guardar Cambios`}}),this.container.querySelector(`#add-resource-btn`)?.addEventListener(`click`,()=>{this._showResourceModal()}),this.container.querySelectorAll(`.edit-res`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.resource-card`).dataset.id,n=this.resources.find(e=>e.id===t);this._showResourceModal(n)})}),this.container.querySelectorAll(`.delete-res`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`.resource-card`).dataset.id;if(confirm(`¿Estás seguro de que deseas eliminar este recurso?`))try{await Xa(t),this.resources=this.resources.filter(e=>e.id!==t),this.render()}catch(e){alert(`Error al eliminar: `+e.message)}})})}_showResourceModal(e=null){let t=!!e,n=`resourceModal`,r=document.getElementById(n);r&&r.remove(),r=document.createElement(`div`),r.id=n,r.className=`modal fade apple-modal`,r.tabIndex=-1,r.innerHTML=`
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${t?`Editar Recurso`:`Nuevo Recurso`}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="resource-form">
              <div class="form-group mb-3">
                <label class="apple-label">Tipo de Recurso</label>
                <div class="resource-type-selector">
                  ${[{id:`video`,label:`Video (YouTube/Vimeo)`,icon:`bi-play-circle`},{id:`pdf`,label:`Documento PDF`,icon:`bi-file-earmark-pdf`},{id:`exercise_text`,label:`Ejercicio (Markdown)`,icon:`bi-pencil-square`},{id:`link`,label:`Enlace Externo`,icon:`bi-link-45deg`}].map(t=>`
                    <label class="type-option ${e?.resource_type===t.id||!e&&t.id===`video`?`active`:``}">
                      <input type="radio" name="resource_type" value="${t.id}" ${e?.resource_type===t.id||!e&&t.id===`video`?`checked`:``}>
                      <i class="bi ${t.icon}"></i>
                      <span>${t.id.split(`_`)[0]}</span>
                    </label>
                  `).join(``)}
                </div>
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">Título</label>
                <input type="text" class="apple-input" name="title" value="${e?.title||``}" required placeholder="Ej: Video Introductorio">
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">URL / Link</label>
                <input type="url" class="apple-input" name="url" value="${e?.url||``}" placeholder="https://...">
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">Contenido / Instrucciones</label>
                <textarea class="apple-input" name="content" rows="4" placeholder="Contenido o instrucciones para ejercicios...">${e?.content||``}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="apple-btn apple-btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="apple-btn apple-btn-primary" id="save-resource-confirm-btn">${t?`Actualizar`:`Crear Recurso`}</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(r);let i=new bootstrap.Modal(r);i.show(),r.querySelectorAll(`.type-option`).forEach(e=>{e.addEventListener(`click`,()=>{r.querySelectorAll(`.type-option`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`)})}),r.querySelector(`#save-resource-confirm-btn`).addEventListener(`click`,async()=>{let n=r.querySelector(`#resource-form`),a=new FormData(n),o={node_id:this.node.id,resource_type:a.get(`resource_type`),title:a.get(`title`),url:a.get(`url`),content:a.get(`content`),order_index:e?.order_index||this.resources.length};if(t&&(o.id=e.id),!o.title){alert(`El título es obligatorio`);return}try{let e=await Ya(o);if(t){let t=this.resources.findIndex(t=>t.id===e.id);this.resources[t]=e}else this.resources.push(e);this.render(),i.hide()}catch(e){alert(`Error al guardar recurso: `+e.message)}})}_injectStyles(){if(document.getElementById(`resource-editor-styles`))return;let e=document.createElement(`style`);e.id=`resource-editor-styles`,e.textContent=`
      .resource-editor {
        padding: 32px;
        max-width: 900px;
        margin: 0 auto;
        animation: fadeIn 0.3s ease;
      }
      .resource-header {
        margin-bottom: 40px;
      }
      .header-main {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      .node-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 4px 8px;
        background: var(--apple-primary, #0066cc);
        color: #fff;
        border-radius: 6px;
        letter-spacing: 0.05em;
      }
      .resource-header h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .node-id {
        font-size: 12px;
        color: var(--apple-ink-muted-48, #86868b);
      }
      
      .editor-section {
        margin-bottom: 48px;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .section-header h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }

      /* Apple Cards */
      .apple-card {
        background: var(--apple-background, #fff);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      [data-bs-theme="dark"] .apple-card {
        background: #1c1c1e;
        border: 1px solid rgba(255,255,255,0.05);
      }

      /* Form Elements */
      .apple-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--apple-ink-muted-64, #515154);
        margin-bottom: 8px;
        display: block;
      }
      .apple-input {
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid var(--apple-parchment-dark, #d2d2d7);
        background: var(--apple-parchment-light, #fbfbfd);
        font-size: 15px;
        transition: all 0.2s ease;
      }
      .apple-input:focus {
        outline: none;
        border-color: var(--apple-primary, #0066cc);
        box-shadow: 0 0 0 4px rgba(0,102,204,0.1);
      }
      [data-bs-theme="dark"] .apple-input {
        background: #2c2c2e;
        border-color: #3a3a3c;
        color: #fff;
      }

      .apple-btn {
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
      }
      .apple-btn-primary {
        background: var(--apple-primary, #0066cc);
        color: #fff;
      }
      .apple-btn-primary:hover {
        background: #0077ed;
      }
      .apple-btn-secondary {
        background: var(--apple-parchment, #f5f5f7);
        color: var(--apple-primary, #0066cc);
      }
      .apple-btn-secondary:hover {
        background: #e8e8ed;
      }
      
      /* Resources List */
      .resources-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .resource-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
      }
      .resource-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      }
      .resource-card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      .resource-card-icon.video { background: #e3f2fd; color: #1976d2; }
      .resource-card-icon.pdf { background: #fbe9e7; color: #d84315; }
      .resource-card-icon.exercise_text { background: #f3e5f5; color: #7b1fa2; }
      .resource-card-icon.link { background: #e8f5e9; color: #2e7d32; }

      .resource-card-content {
        flex: 1;
        min-width: 0;
      }
      .resource-card-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
      }
      .resource-card-info h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .resource-type-tag {
        font-size: 10px;
        text-transform: uppercase;
        padding: 2px 6px;
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
        color: #666;
      }
      .resource-card-url {
        font-size: 13px;
        color: var(--apple-ink-muted-48, #86868b);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .resource-card-actions {
        display: flex;
        gap: 8px;
      }
      .icon-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--apple-ink-muted-48, #86868b);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-btn:hover {
        background: rgba(0,0,0,0.05);
        color: var(--apple-ink, #1d1d1f);
      }
      .icon-btn.danger:hover {
        color: #ff3b30;
        background: #fff5f5;
      }

      /* Modal Specifics */
      .resource-type-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .type-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border-radius: 12px;
        border: 2px solid transparent;
        background: var(--apple-parchment, #f5f5f7);
        cursor: pointer;
        transition: all 0.2s;
      }
      .type-option input { display: none; }
      .type-option i { font-size: 20px; margin-bottom: 4px; }
      .type-option span { font-size: 12px; font-weight: 500; }
      .type-option.active {
        border-color: var(--apple-primary, #0066cc);
        background: #fff;
      }

      /* Placeholders */
      .resource-editor-empty, .resource-editor-loading, .resource-editor-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        padding: 40px;
        color: var(--apple-ink-muted-48, #86868b);
      }
      .resource-editor-empty i { font-size: 64px; margin-bottom: 16px; opacity: 0.2; }
      .empty-list-placeholder {
        padding: 40px;
        text-align: center;
        border: 2px dashed var(--apple-parchment-dark, #d2d2d7);
        border-radius: 18px;
        color: var(--apple-ink-muted-48, #86868b);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,document.head.appendChild(e)}};async function $a(e){eo(),e.innerHTML=`
    <div class="admin-view-container">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h1>Mapa Curricular</h1>
          <div class="version-selector-container">
            <select id="route-selector" class="apple-select mb-2">
              <option value="">Seleccionar Ruta...</option>
            </select>
            <select id="version-selector" class="apple-select" disabled>
              <option value="">Versión...</option>
            </select>
          </div>
        </div>
        <div id="tree-container" class="tree-viewport">
          <div class="tree-placeholder">
            <i class="bi bi-arrow-up-circle"></i>
            <p>Selecciona una ruta y versión para comenzar.</p>
          </div>
        </div>
      </div>
      <div class="admin-detail-panel" id="detail-container">
        <!-- NodeResourceEditor se renderiza aquí -->
      </div>
    </div>
  `;let t=e.querySelector(`#tree-container`),n=e.querySelector(`#detail-container`),r=e.querySelector(`#route-selector`),i=e.querySelector(`#version-selector`),a=new Qa(n,{onUpdate:e=>{console.log(`Node updated:`,e)}}),o=new Wa(t,{onSelect:e=>{a.setNode(e)}});try{(await Ga()).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,r.appendChild(t)})}catch(e){console.error(`Error loading routes:`,e)}r.addEventListener(`change`,async()=>{let e=r.value;if(i.innerHTML=`<option value="">Versión...</option>`,i.disabled=!0,t.innerHTML=`<div class="tree-placeholder"><p>Cargando versiones...</p></div>`,!e){t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una ruta para comenzar.</p></div>`;return}try{(await Ka(e)).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`V${e.version_number} - ${new Date(e.created_at).toLocaleDateString()}`,i.appendChild(t)}),i.disabled=!1,t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una versión.</p></div>`}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar versiones.</p></div>`}}),i.addEventListener(`change`,async()=>{let e=i.value;if(e){t.innerHTML=`
      <div class="tree-loading">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Construyendo mapa curricular...</span>
      </div>
    `;try{let t=await qa(e);o.setData(t)}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar el árbol curricular.</p></div>`}}})}function eo(){if(document.getElementById(`academic-admin-layout-styles`))return;let e=document.createElement(`style`);e.id=`academic-admin-layout-styles`,e.textContent=`
    .admin-view-container {
      display: flex;
      height: 100vh;
      width: 100%;
      background: var(--apple-parchment-light, #fbfbfd);
      overflow: hidden;
    }

    .admin-sidebar {
      width: 350px;
      min-width: 350px;
      background: #fff;
      border-right: 1px solid rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      z-index: 10;
    }
    [data-bs-theme="dark"] .admin-sidebar {
      background: #1c1c1e;
      border-right: 1px solid rgba(255,255,255,0.08);
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .sidebar-header h1 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }

    .apple-select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--apple-parchment-dark, #d2d2d7);
      background: var(--apple-parchment, #f5f5f7);
      font-size: 14px;
      font-weight: 500;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2386868b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      cursor: pointer;
    }
    [data-bs-theme="dark"] .apple-select {
      background-color: #2c2c2e;
      border-color: #3a3a3c;
      color: #fff;
    }

    .tree-viewport {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 40px;
    }

    .admin-detail-panel {
      flex: 1;
      overflow-y: auto;
      background: var(--apple-parchment-light, #fbfbfd);
    }
    [data-bs-theme="dark"] .admin-detail-panel {
      background: #000;
    }

    .tree-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      text-align: center;
      padding: 20px;
      color: #86868b;
    }
    .tree-placeholder i { font-size: 32px; margin-bottom: 12px; opacity: 0.3; }
    .tree-placeholder p { font-size: 13px; margin: 0; }

    .tree-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 40px;
      font-size: 13px;
      color: #0066cc;
    }

    /* Ocultar scrollbar pero mantener scroll */
    .tree-viewport::-webkit-scrollbar { width: 6px; }
    .tree-viewport::-webkit-scrollbar-track { background: transparent; }
    .tree-viewport::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
    [data-bs-theme="dark"] .tree-viewport::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
  `,document.head.appendChild(e)}var X={clases:[],clasesOriginales:[],maestros:[],salones:[],programas:[],alumnos:[],cargando:!1,filtroEstado:`todos`,filtroInstrumento:``,vista:`tabla`,container:null,mostrarDiasVacios:!0};async function to(e){if(e)try{X.container=e,X.cargando=!0,no(e);let[n,r,i,a,o]=await Promise.all([pr(),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]);X.clases=n,X.clasesOriginales=[...n],X.maestros=r.data||[],X.salones=i.data||[],X.programas=a.data||[],X.alumnos=o.data||[],X.cargando=!1,io(e),uo(e)}catch(t){console.error(t),ro(e,t.message)}}function no(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `}function ro(e,t){e.innerHTML=`
    <div class="container mt-5 text-center">
      <div class="alert alert-danger d-inline-block" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${z(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>to(e))}function io(e){e.innerHTML=`
    <div class="page-container">
      <div class="clases-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-book fs-4"></i>
          </div>
          <div>
            <h1 class="clases-title-premium mb-0">Clases</h1>
            <p class="text-muted small mb-0">${X.clases.length} clases en total</p>
          </div>
        </div>
        
        <div class="clases-header-actions">
          <button class="btn-help-trigger" id="btn-help-clases" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <div class="view-segmented-control">
            <button class="view-segment-btn ${X.vista===`tabla`?`active`:``}" id="btn-vista-tabla" title="Vista de lista">
              <i class="bi bi-list-ul"></i>
            </button>
            <button class="view-segment-btn ${X.vista===`calendario`?`active`:``}" id="btn-vista-calendario" title="Vista de agenda">
              <i class="bi bi-calendar-week"></i>
            </button>
          </div>
          <button class="btn btn-premium-action" id="btnAgregarClase">
            <i class="bi bi-plus-lg me-1.5"></i>Nueva Clase
          </button>
        </div>
      </div>

      <div class="clases-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar clase o instrumento..." id="buscar">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="suspendida">Suspendidas</option>
            <option value="finalizada">Finalizadas</option>
          </select>
        </div>
      </div>

      <div id="view-content">
        ${X.vista===`tabla`?ao():co()}
      </div>
    </div>
  `}function ao(){return X.clases.length===0?so():`
    <div class="page-glass rounded w-100">
      <div class="list-group list-group-flush w-100" id="clasesListBody">
        ${X.clases.map(e=>oo(e)).join(``)}
      </div>
    </div>
  `}function oo(e){let t=e.nombre||`Sin nombre`,n=X.maestros.find(t=>t.id===e.maestro_principal_id),r=n?n.nombre_completo||n.nombre:`Sin maestro`,i=lr(t),a=e.estado||`activa`,o=`border-accent-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,s=`bg-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,c=(e.horarios||[]).slice(0,3),l=c.length>0?c.map(e=>`${(e.dia||``).slice(0,2).toUpperCase()} ${(e.hora_inicio||``).slice(0,5)}`).join(` • `):`Sin horarios`;return`
    <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${o}" data-id="${e.id}" style="cursor: pointer;">
      <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
        <div class="position-relative flex-shrink-0">
          <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
            ${i}
          </div>
          <span class="position-absolute bottom-0 end-0 p-1 ${s} border border-light rounded-circle" style="transform: translate(10%, 10%);">
            <span class="visually-hidden">${a}</span>
          </span>
        </div>
        <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
          <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${z(t)}</span>
          <small class="text-muted text-truncate">${z(r)} • ${z(e.instrumento||`-`)}</small>
          <small class="text-muted extra-small mt-1" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i>${z(l)}</small>
        </div>
      </div>
      <div class="flex-shrink-0 text-muted ms-2 pe-1">
        <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
      </div>
    </div>
  `}function so(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No se encontraron clases.</p>
    </div>
  `}function co(){if(X.clases.length===0)return so();let e=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`],t={lunes:`Lunes`,martes:`Martes`,miércoles:`Miércoles`,jueves:`Jueves`,viernes:`Viernes`,sábado:`Sábado`},n={lunes:[],martes:[],miércoles:[],jueves:[],viernes:[],sábado:[]};X.clases.forEach(e=>{(e.horarios||[]).forEach(t=>{let r=(t.dia||``).toLowerCase().trim();n[r]&&n[r].push({...t,clase:e})})}),Object.keys(n).forEach(e=>{n[e].sort((e,t)=>V(e.hora_inicio)-V(t.hora_inicio))});let r=X.mostrarDiasVacios?``:`hide-empty-days`;return`
    <div class="weekly-schedule-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 px-1 weekly-schedule-toolbar">
        <span class="small text-muted fw-semibold"><i class="bi bi-calendar-week me-1"></i>Agenda Semanal</span>
        <div class="form-check form-switch m-0 d-flex align-items-center gap-2">
          <input class="form-check-input cursor-pointer" type="checkbox" role="switch" id="toggle-empty-days" ${X.mostrarDiasVacios?`checked`:``}>
          <label class="form-check-label select-none small text-muted cursor-pointer" for="toggle-empty-days">Mostrar días vacíos</label>
        </div>
      </div>
      <div class="weekly-schedule-grid ${r}">
        ${e.map(e=>{let r=n[e],i=t[e];return`
            <div class="schedule-day-column ${r.length===0?`is-empty`:``}" data-day="${e}">
              <div class="schedule-day-header">
                <span class="day-label">${i}</span>
                <span class="day-count-badge bg-primary bg-opacity-10 text-primary">${r.length}</span>
              </div>
              <div class="schedule-blocks-container">
                ${r.length>0?r.map(e=>{let t=e.clase,n=t.estado||`activa`,r=B(e.hora_inicio),i=B(e.hora_fin),a=X.salones.find(t=>t.id===e.salon_id),o=a?a.nombre:`Online/Otro`;return`
                    <div class="time-block-card p-2 rounded mb-2 border-start-accent ${`border-accent-${n===`activa`?`success`:n===`suspendida`?`warning`:`secondary`}`}" data-id="${t.id}" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="time-range small fw-bold text-primary"><i class="bi bi-clock me-1"></i>${r} - ${i}</span>
                        <i class="bi ${cr(t.instrumento)} text-muted" style="font-size: 0.85rem;"></i>
                      </div>
                      <div class="fw-semibold text-truncate small class-name" style="font-size: 0.9rem;">${z(t.nombre)}</div>
                      <div class="d-flex justify-content-between align-items-center mt-1 extra-small text-muted">
                        <span class="text-truncate" style="max-width: 60%;"><i class="bi bi-person me-0.5"></i>${z(X.maestros.find(e=>e.id===t.maestro_principal_id)?.nombre_completo||`Sin maestro`)}</span>
                        <span class="badge bg-body-secondary text-body-secondary-custom px-1.5 py-0.5 rounded" style="font-size: 0.7rem;"><i class="bi bi-geo-alt me-0.5"></i>${z(o)}</span>
                      </div>
                    </div>
                  `}).join(``):`
                  <div class="empty-day-block text-muted text-center py-4 small">
                    <i class="bi bi-calendar-minus d-block mb-1 opacity-50"></i>
                    Sin clases
                  </div>
                `}
              </div>
            </div>
          `}).join(``)}
      </div>
    </div>
  `}async function lo(e){if(e){o.open({title:`Cargando...`,hideSave:!0,size:`md`,body:`
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando perfil de la clase...</p>
      </div>
    `});try{let t=await Sr(e.id),n=t.length,r=X.maestros.find(t=>t.id===e.maestro_principal_id),i=r?r.nombre_completo||r.nombre:`Sin maestro`,a=e.tiene_suplente||e.maestro_suplente_id?X.maestros.find(t=>t.id===e.maestro_suplente_id):null,s=a?a.nombre_completo||a.nombre:null,c=X.programas.find(t=>t.id===e.programa_id),l=c?c.nombre:`Sin programa`,u=``;u=e.horarios&&e.horarios.length>0?e.horarios.map(e=>{let t=e.dia.charAt(0).toUpperCase()+e.dia.slice(1),n=X.salones.find(t=>t.id===e.salon_id),r=n?n.nombre:`Online/Otro`;return`
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-secondary-subtle text-secondary-custom py-1" style="font-size: 0.75rem; min-width: 60px;">${t}</span>
            <span class="small fw-semibold">${B(e.hora_inicio)} - ${B(e.hora_fin)}</span>
            <span class="small text-muted">• <i class="bi bi-geo-alt me-0.5"></i>${z(r)}</span>
          </div>
        `}).join(``):`<div class="text-muted small">Sin horarios asignados</div>`;let d=``;d=t&&t.length>0?`
        <div class="list-group list-group-flush border-top">
          ${t.map(e=>{let t=e.alumno;if(!t)return``;let n=lr(t.nombre_completo||t.nombre||`?`);return`
              <div class="list-group-item d-flex align-items-center gap-3 py-2 px-3 border-bottom-0 bg-transparent">
                <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle" style="width: 32px; height: 32px; font-size: 0.85rem; background-color: ${ur(t.id)}; font-weight:600;">
                  ${n}
                </div>
                <div class="d-flex flex-column overflow-hidden">
                  <span class="fw-semibold text-truncate small" style="font-size: 0.9rem; color: var(--bs-body-color);">${z(t.nombre_completo||t.nombre)}</span>
                  <small class="text-muted extra-small">${z(t.instrumento_principal||`Sin instrumento`)}</small>
                </div>
              </div>
            `}).join(``)}
        </div>
      `:`
        <div class="text-muted text-center py-4 small bg-body-tertiary rounded">
          <i class="bi bi-people d-block mb-1 opacity-50" style="font-size: 1.25rem;"></i>
          No hay alumnos inscritos en esta clase
        </div>
      `;let f=e.capacidad_maxima||20,p=Math.min(100,Math.round(n/f*100)),m=`bg-success`;p>=90?m=`bg-danger`:p>=70&&(m=`bg-warning`);let h=`
      <div class="class-profile-container">
        <!-- Profile Header / Hero Card -->
        <div class="class-hero-card d-flex align-items-center gap-3 p-3 rounded mb-4" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
          <div class="position-relative">
            <div class="avatar-large bg-primary bg-opacity-15 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 56px; height: 56px; font-size: 1.5rem; font-weight: 700;">
              <i class="bi ${cr(e.instrumento)}"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 p-1.5 bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="overflow-hidden">
            <h4 class="mb-1 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${z(e.nombre)}</h4>
            <span class="badge rounded-pill bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} text-capitalize" style="font-size: 0.75rem;">${sr(e.estado)}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-person-badge me-1"></i>Maestro Principal</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${z(i)}</span>
              ${s?`<small class="text-muted d-block extra-small mt-1"><i class="bi bi-person me-0.5"></i>Suplente: ${z(s)}</small>`:``}
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-music-note me-1"></i>Instrumento</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${z(e.instrumento||`Sin asignar`)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-collection me-1"></i>Programa</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${z(l)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-2"><i class="bi bi-calendar3 me-1"></i>Horarios y Salones</small>
              <div class="horarios-list-container">
                ${u}
              </div>
            </div>
          </div>
        </div>

        <!-- Enrollment Progress Bar -->
        <div class="enrollment-occupancy-card p-3 rounded mb-4 border bg-body-tertiary">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold small text-muted"><i class="bi bi-people me-1"></i>Ocupación e Inscripciones</span>
            <span class="badge bg-secondary bg-opacity-10 text-secondary-custom small fw-semibold" style="font-size: 0.75rem;">${n} / ${f} Alumnos</span>
          </div>
          <div class="progress bg-body-secondary" style="height: 10px; border-radius: 6px; overflow: hidden;">
            <div class="progress-bar ${m} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${p}%" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${f}"></div>
          </div>
        </div>

        <!-- Description / Pedagogical Notes -->
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Notas Pedagógicas</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${z(e.descripcion||`Sin notas pedagógicas registradas.`)}</p>
        </div>

        <!-- Alumnos Inscritos List -->
        <div class="alumnos-inscritos-section mb-4">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="font-size: 0.95rem;">
            <i class="bi bi-person-check text-primary"></i> Alumnos Inscritos
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill small" style="font-size: 0.75rem;">${n}</span>
          </h6>
          <div class="alumnos-scroll-list border rounded" style="max-height: 180px; overflow-y: auto;">
            ${d}
          </div>
        </div>

        <!-- Action Buttons (moved inside profile modal as requested) -->
        <div class="class-profile-actions border-top pt-3 mt-4">
          <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 btn-profile-delete" data-id="${e.id}">
            <i class="bi bi-trash"></i> Eliminar Clase
          </button>
          <div class="class-profile-secondary-actions">
            <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 btn-profile-edit" data-id="${e.id}">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-secondary btn-sm btn-profile-close">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;o.open({title:`Perfil de Clase: ${e.nombre}`,hideSave:!0,size:`md`,body:h,onShow:t=>{let n=t.closest(`.app-modal-dialog`)?.querySelector(`.app-modal-footer`);n&&n.style.setProperty(`display`,`none`,`important`),t.querySelector(`.btn-profile-edit`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>{Nr(e,{maestros:X.maestros,salones:X.salones,programas:X.programas,alumnos:X.alumnos,onSuccess:()=>to(X.container)})},250)}),t.querySelector(`.btn-profile-delete`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>{po(e.id)},250)}),t.querySelector(`.btn-profile-close`)?.addEventListener(`click`,()=>{o.close()})}})}catch(e){console.error(e),i.error(`Error al cargar la información detallada de la clase`),o.close()}}}function uo(e){e.querySelector(`#btn-help-clases`)?.addEventListener(`click`,()=>{W.open({title:`Clases`,intro:`Gestión completa de clases: creación, horarios, asignación de maestros, inscripción de alumnos y control de capacidad.`,sections:[{icon:`bi-easel2`,title:`Lista de clases`,description:`Todas las clases del sistema. Filtrá por instrumento, nivel y estado. Las activas aparecen primero.`,color:`#3b82f6`},{icon:`bi-clock`,title:`Horarios`,description:`Cada clase puede tener múltiples horarios semanales. El sistema detecta conflictos de salón y de maestro automáticamente.`,color:`#6366f1`},{icon:`bi-people`,title:`Inscripción de alumnos`,description:`"Grupal": todos comparten el horario. "Rotativa (Turnos)": cada alumno tiene su propio horario individual dentro de la clase.`,color:`#10b981`},{icon:`bi-bar-chart`,title:`Capacidad`,description:`Barra de ocupación: inscriptos vs capacidad máxima. Rojo cuando supera el 90%.`,color:`#f59e0b`},{icon:`bi-person-workspace`,title:`Maestro titular y suplente`,description:`Cada clase tiene un maestro principal (obligatorio) y puede tener suplente (opcional). Ambos aparecen en el perfil del maestro.`,color:`#6b7280`}]})}),e.querySelector(`#btnAgregarClase`)?.addEventListener(`click`,()=>{Nr(null,{maestros:X.maestros,salones:X.salones,programas:X.programas,alumnos:X.alumnos,onSuccess:()=>to(e)})}),e.querySelector(`#btn-vista-tabla`)?.addEventListener(`click`,()=>{X.vista=`tabla`,io(e),uo(e)}),e.querySelector(`#btn-vista-calendario`)?.addEventListener(`click`,()=>{X.vista=`calendario`,io(e),uo(e)}),e.querySelector(`#buscar`)?.addEventListener(`input`,fo),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,fo);let t=e.querySelector(`#view-content`);t?.addEventListener(`change`,t=>{if(t.target&&t.target.id===`toggle-empty-days`){X.mostrarDiasVacios=t.target.checked;let n=e.querySelector(`.weekly-schedule-grid`);n&&(X.mostrarDiasVacios?n.classList.remove(`hide-empty-days`):n.classList.add(`hide-empty-days`))}}),t?.addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id], .time-block-card[data-id]`);if(t){let e=t.dataset.id,n=X.clasesOriginales.find(t=>t.id===e);n&&lo(n)}})}function fo(){let e=X.container.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=X.container.querySelector(`#filtroEstado`)?.value||`todos`;X.clases=X.clasesOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||n.instrumento.toLowerCase().includes(e),i=t===`todos`||n.estado===t;return r&&i});let n=X.container.querySelector(`#view-content`);n&&(n.innerHTML=X.vista===`tabla`?ao():co())}function po(e){let t=X.clasesOriginales.find(t=>t.id===e);t&&o.open({title:`⚠️ Eliminar Clase`,saveText:`Eliminar Definitivamente`,body:`<p>¿Estás seguro de eliminar la clase <strong>${z(t.nombre)}</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await _r(e),i.success(`Clase eliminada`),to(X.container),!0}catch(e){return i.error(e.message),!1}}})}async function mo(e){e.innerHTML=`
    <div class="pm-view-header">
      <h2><i class="bi bi-person-check"></i> Aprobación de Maestros</h2>
      <p class="pm-view-subtitle">Revisá y aprobá las solicitudes de registro de maestros</p>
    </div>
    <div id="aprobacion-content">
      <div class="pm-loading">
        <div class="pm-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>  
    </div>
  `;try{let{data:n,error:r}=await t.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(r)throw r;console.log(`Estamos aqui:`,n);let i=e.querySelector(`#aprobacion-content`);if(!n||n.length===0){i.innerHTML=`
        <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>No hay maestros pendientes de aprobación</h3>
          <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
        </div>
      `;return}i.innerHTML=`
      <div class="table-responsive" style="margin-top: 1rem;">
        <table class="table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Email</th>
              <th>Descripción</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>`
              <tr data-profile-id="${e.id}">
                <td>${_o(e.nombre_completo||`—`)}</td>
                <td>${_o(e.email)}</td>
                <td>${_o(e.instrumento||`—`)}</td>
                <td>${vo(e.created_at)}</td>
                <td class="aprobacion-actions">
                  <button class="btn btn-success btn-sm btn-aprobar" data-id="${e.id}">
                    <i class="bi bi-check-circle"></i> Aprobar
                  </button>
                  <button class="btn btn-danger btn-sm btn-rechazar" data-id="${e.id}">
                    <i class="bi bi-x-circle"></i> Rechazar
                  </button>
                </td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `,i.querySelectorAll(`.btn-aprobar`).forEach(e=>{e.addEventListener(`click`,()=>ho(e.dataset.id,i))}),i.querySelectorAll(`.btn-rechazar`).forEach(e=>{e.addEventListener(`click`,()=>go(e.dataset.id,`rechazado`,null,i))})}catch(t){let n=e.querySelector(`#aprobacion-content`);n.innerHTML=`
      <div class="pm-error" style="text-align: center; padding: 2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes: ${t.message}</p>
        <button class="btn btn-outline-light btn-sm" id="btn-retry-aprobacion">
          Intentar de nuevo
        </button>
      </div>
    `,n.querySelector(`#btn-retry-aprobacion`)?.addEventListener(`click`,()=>mo(e)),console.error(`[AprobacionView] Error:`,t.message)}}function ho(e,t){o.open({title:`Aprobar Usuario`,size:`sm`,saveText:`Aprobar`,body:`
      <p>Seleccioná el rol para este usuario:</p>
      <div class="mb-3">
        <label class="form-label-compact">Rol</label>
        <select class="form-select" id="aprobacion-rol-select">
          <option value="maestro">Maestro</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    `,onSave:async n=>{let r=n.querySelector(`#aprobacion-rol-select`).value;await go(e,`activo`,r,t)}})}async function go(e,n,r,i){let a=i?.querySelector(`tr[data-profile-id="${e}"]`);if(!(!a&&i)){a?.querySelectorAll(`button`).forEach(e=>e.disabled=!0);try{if(n===`activo`){let n=!1,{data:i,error:a}=await t.rpc(`approve_maestro_profile`,{p_profile_id:e,p_new_rol:r||`maestro`,p_new_estado:`activo`});if(!a&&i?.success&&(n=!0),!n){console.warn(`[AprobacionView] RPC falló, usando operaciones directas:`,a?.message||i?.error);let{error:n,count:o}=await t.from(`profiles`).update({rol:r||`maestro`,estado:`activo`}).eq(`id`,e).select();if(n)throw Error(`No se pudo actualizar el perfil: ${n.message}`);let{data:s}=await t.from(`profiles`).select(`estado, rol`).eq(`id`,e).maybeSingle();if(s?.estado!==`activo`)throw Error(`No se pudo activar el perfil. Por favor cerrá sesión e iniciá sesión nuevamente como admin, luego intentá aprobar de nuevo.`)}if(r===`maestro`||!r){let{data:n}=await t.from(`profiles`).select(`id, email, nombre_completo`).eq(`id`,e).maybeSingle();if(n){let{data:e}=await t.from(`maestros`).select(`id, user_id`).or(`user_id.eq.${n.id},correo.eq.${n.email}`).maybeSingle();e?e.user_id||await t.from(`maestros`).update({user_id:n.id}).eq(`id`,e.id):await t.from(`maestros`).insert({user_id:n.id,nombre_completo:n.nombre_completo,correo:n.email,instrumento:``,activo:!0})}}}else{let{error:r}=await t.from(`profiles`).update({estado:n}).eq(`id`,e);if(r)throw r}a&&(a.style.transition=`opacity 0.3s ease`,a.style.opacity=`0`,setTimeout(()=>a.remove(),300));let o=r===`admin`?`Admin`:`Maestro`;if(window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:n===`activo`?`${o} aprobado correctamente`:`Usuario rechazado`,type:`success`}})),i){let e=i.querySelector(`tbody`);e&&e.querySelectorAll(`tr`).length===0&&(i.innerHTML=`
          <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
              <i class="bi bi-inbox"></i>
            </div>
            <h3>No hay maestros pendientes de aprobación</h3>
            <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
          </div>
        `)}}catch(e){a?.querySelectorAll(`button`).forEach(e=>e.disabled=!1),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al ${n===`activo`?`aprobar`:`rechazar`} usuario: ${e.message}`,type:`error`}})),console.error(`[AprobacionView] Action error:`,e.message)}}}function _o(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function vo(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`})}catch{return e}}async function yo(){let{data:e,error:n}=await t.from(`ausencias_maestros`).select(`
      id,
      maestro_id,
      tipo_ausencia,
      urgencia,
      fecha_inicio,
      fecha_fin,
      motivo,
      estado,
      created_at
    `).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(n)throw n;if(!e||e.length===0)return[];let r=[...new Set(e.map(e=>e.maestro_id).filter(Boolean))];if(r.length>0){let{data:n,error:i}=await t.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,r);if(!i&&n){let t=new Map(n.map(e=>[e.id,e]));return e.map(e=>{let n=t.get(e.maestro_id);return{...e,maestros:n?{nombre_completo:n.nombre_completo,correo:n.email}:e.maestros||null}})}}return e.map(e=>({...e,maestros:e.maestros||null}))}async function bo(e,n,r){let{data:i,error:a}=await t.from(`ausencias_maestros`).update({estado:n,decision_notas:r||null,decidido_en:new Date().toISOString()}).eq(`id`,e).select().single();if(a)throw a;return i}function xo(e,t=``){return bo(e,`aprobada`,t)}function So(e,t=``){return bo(e,`rechazada`,t)}function Z(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function Co(e){if(!e)return`—`;let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}function wo(e){let t=Co(e.fecha_inicio);return!e.fecha_fin||e.fecha_fin===e.fecha_inicio?t:`${t} → ${Co(e.fecha_fin)}`}function To(e){return e.maestros?.nombre_completo||e.maestro_nombre||`Maestro no especificado`}function Eo(e){return e.maestros?.correo||``}var Do={enfermedad:{label:`Médica`,icon:`bi-heart-pulse-fill`,color:`#ef4444`},personal:{label:`Personal`,icon:`bi-person-fill`,color:`#3b82f6`},capacitacion:{label:`Capacitación`,icon:`bi-mortarboard-fill`,color:`#8b5cf6`},vacaciones:{label:`Vacaciones`,icon:`bi-sun-fill`,color:`#f59e0b`},otro:{label:`Otro`,icon:`bi-three-dots`,color:`#6b7280`}},Oo={baja:{label:`Baja`,color:`#22c55e`,bg:`rgba(34,197,94,0.12)`},media:{label:`Media`,color:`#f59e0b`,bg:`rgba(245,158,11,0.12)`},alta:{label:`Alta`,color:`#ef4444`,bg:`rgba(239,68,68,0.12)`}};function ko(e){if(e.clase_emergente?.fecha){let t=e.clase_emergente.hora?` a las ${e.clase_emergente.hora}`:``;return`<i class="bi bi-calendar-check"></i> Reprogramada para ${e.clase_emergente.fecha}${t}`}return e.maestro_suplente_id||e.suplente_nombre?`<i class="bi bi-person-check"></i> Suplente: ${Z(e.suplente_nombre||e.maestro_suplente_id)}`:`<i class="bi bi-clock"></i> Pendiente de coordinación`}function Ao(){if(document.getElementById(`ausencia-aprobacion-card-styles`))return;let e=document.createElement(`style`);e.id=`ausencia-aprobacion-card-styles`,e.textContent=`
    .ausencia-approval-card {
      background: var(--bs-card-bg, #fff);
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.1));
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s;
    }
    .ausencia-approval-card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .aac-accent-bar {
      height: 4px;
      width: 100%;
    }

    .aac-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1rem 0.5rem;
    }

    .aac-avatar {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      background: var(--aac-tipo-color, #6b7280);
    }

    .aac-header-info {
      flex: 1;
      min-width: 0;
    }

    .aac-teacher-name {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .aac-teacher-email {
      font-size: 0.75rem;
      opacity: 0.55;
      margin: 0;
    }

    .aac-badges {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-top: 0.4rem;
    }

    .aac-tipo-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--aac-tipo-color, #6b7280);
      background: color-mix(in srgb, var(--aac-tipo-color, #6b7280) 12%, transparent);
    }

    .aac-urg-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .aac-body {
      padding: 0.5rem 1rem;
    }

    .aac-date-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--bs-body-color);
    }

    .aac-date-row i {
      opacity: 0.55;
    }

    .aac-coverage {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      opacity: 0.7;
      margin-bottom: 0.5rem;
    }

    .aac-motivo {
      font-size: 0.82rem;
      line-height: 1.5;
      opacity: 0.8;
      padding: 0.6rem 0.75rem;
      border-radius: 0.5rem;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.04));
      margin-bottom: 0.75rem;
    }

    .aac-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.73rem;
      opacity: 0.55;
      margin-bottom: 0.25rem;
    }

    .aac-notes-wrap {
      padding: 0 1rem 0.75rem;
    }

    .aac-notes-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      opacity: 0.65;
      margin-bottom: 0.35rem;
    }

    .aac-notes-input {
      width: 100%;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      border-radius: 0.5rem;
      padding: 0.45rem 0.65rem;
      font-size: 0.82rem;
      background: var(--bs-body-bg);
      color: var(--bs-body-color);
      resize: vertical;
      min-height: 3rem;
      transition: border-color 0.15s;
    }
    .aac-notes-input:focus {
      outline: none;
      border-color: var(--aac-tipo-color, #3b82f6);
    }

    .aac-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
    }

    .aac-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.55rem;
      border-radius: 0.6rem;
      border: none;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .aac-btn:active { transform: scale(0.97); }
    .aac-btn:disabled { opacity: 0.45; pointer-events: none; }

    .aac-btn-approve {
      background: rgba(34,197,94,0.15);
      color: #16a34a;
    }
    .aac-btn-approve:hover { background: rgba(34,197,94,0.25); }

    .aac-btn-reject {
      background: rgba(239,68,68,0.12);
      color: #dc2626;
    }
    .aac-btn-reject:hover { background: rgba(239,68,68,0.22); }

    /* Dark mode compatibility */
    [data-bs-theme="dark"] .ausencia-approval-card,
    [data-portal-theme="dark"] .ausencia-approval-card {
      border-color: rgba(255,255,255,0.1);
    }

    [data-bs-theme="dark"] .aac-motivo,
    [data-portal-theme="dark"] .aac-motivo {
      background: rgba(255,255,255,0.05);
    }
  `,document.head.appendChild(e)}function jo(e,{onApprove:t=()=>{},onReject:n=()=>{}}={}){Ao();let r=Do[e.tipo_ausencia]||Do.otro,i=Oo[e.urgencia]||{label:e.urgencia||`Normal`,color:`#6b7280`,bg:`rgba(107,114,128,0.12)`},a=Array.isArray(e.clases_afectadas)?e.clases_afectadas.length:0,o=To(e),s=o.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase(),c=document.createElement(`article`);c.className=`ausencia-approval-card`,c.dataset.ausenciaCard=e.id,c.style.setProperty(`--aac-tipo-color`,r.color);let l=e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``;c.innerHTML=`
    <div class="aac-accent-bar" style="background: ${Z(r.color)};"></div>

    <div class="aac-header">
      <div class="aac-avatar" style="background: ${Z(r.color)};">${Z(s)}</div>
      <div class="aac-header-info">
        <p class="aac-teacher-name">${Z(o)}</p>
        <p class="aac-teacher-email">${Z(Eo(e))}</p>
        <div class="aac-badges">
          <span class="aac-tipo-chip" style="--aac-tipo-color:${Z(r.color)}">
            <i class="bi ${Z(r.icon)}"></i> ${Z(r.label)}
          </span>
          <span class="aac-urg-chip" style="color:${Z(i.color)};background:${Z(i.bg)}">
            <i class="bi bi-circle-fill" style="font-size:0.45rem"></i> ${Z(i.label)}
          </span>
        </div>
      </div>
    </div>

    <div class="aac-body">
      <div class="aac-date-row">
        <i class="bi bi-calendar-range"></i>
        ${Z(wo(e))}
      </div>
      <div class="aac-coverage">${ko(e)}</div>
      ${a>0?`<div class="aac-meta"><span><i class="bi bi-journal-text"></i> ${a} clase${a>1?`s`:``} afectada${a>1?`s`:``}</span></div>`:``}
      ${e.motivo?`<div class="aac-motivo">${Z(e.motivo)}</div>`:``}
      <div class="aac-meta">
        ${l?`<span><i class="bi bi-clock-history"></i> Enviada el ${l}</span>`:``}
      </div>
    </div>

    <div class="aac-notes-wrap">
      <label class="aac-notes-label" for="notes-${Z(e.id)}">Nota de decisión (opcional)</label>
      <textarea
        class="aac-notes-input"
        id="notes-${Z(e.id)}"
        data-decision-notes
        rows="2"
        placeholder="Ej: Aprobada según reglamento art. 5..."
      ></textarea>
    </div>

    <div class="aac-actions">
      <button type="button" class="aac-btn aac-btn-approve" data-action="approve">
        <i class="bi bi-check-circle-fill"></i> Aprobar
      </button>
      <button type="button" class="aac-btn aac-btn-reject" data-action="reject">
        <i class="bi bi-x-circle-fill"></i> Rechazar
      </button>
    </div>
  `;let u=()=>c.querySelector(`[data-decision-notes]`)?.value?.trim()||``,d=c.querySelector(`[data-action="approve"]`),f=c.querySelector(`[data-action="reject"]`);return d.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,d.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Aprobando...`,await t(e.id,u())}),f.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,f.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Rechazando...`,await n(e.id,u())}),c}function Mo(e,t=`success`){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}function No(){if(document.getElementById(`ausencias-admin-view-styles`))return;let e=document.createElement(`style`);e.id=`ausencias-admin-view-styles`,e.textContent=`
    .aav-root {
      padding: 1.25rem 1rem 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .aav-header {
      margin-bottom: 1.5rem;
    }

    .aav-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
    }

    .aav-icon-wrap {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: rgba(239,68,68,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .aav-icon-wrap i {
      font-size: 1.2rem;
      color: #ef4444;
    }

    .aav-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .aav-subtitle {
      font-size: 0.82rem;
      opacity: 0.55;
      margin: 0;
      padding-left: calc(2.5rem + 0.75rem);
    }

    /* ── Stats strip ── */
    .aav-stats {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .aav-stat {
      flex: 1;
      min-width: 100px;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.04));
      border-radius: 0.75rem;
      padding: 0.65rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    [data-bs-theme="dark"] .aav-stat,
    [data-portal-theme="dark"] .aav-stat {
      background: rgba(255,255,255,0.05);
    }

    .aav-stat-num {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .aav-stat-label {
      font-size: 0.72rem;
      opacity: 0.6;
      line-height: 1.3;
    }

    /* ── Refresh btn ── */
    .aav-refresh-btn {
      background: transparent;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      border-radius: 0.5rem;
      padding: 0.3rem 0.75rem;
      font-size: 0.78rem;
      cursor: pointer;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: background 0.15s;
      margin-left: auto;
    }
    .aav-refresh-btn:hover { background: var(--bs-tertiary-bg); }
    .aav-refresh-btn.spinning i { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Action bar ── */
    .aav-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .aav-count-label {
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.65;
    }

    /* ── List ── */
    .aav-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* ── Empty state ── */
    .aav-empty {
      text-align: center;
      padding: 3.5rem 1.5rem;
    }

    .aav-empty-icon {
      font-size: 3.5rem;
      opacity: 0.2;
      margin-bottom: 0.75rem;
    }

    .aav-empty-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.3rem;
    }

    .aav-empty-sub {
      font-size: 0.82rem;
      opacity: 0.55;
    }

    /* ── Error state ── */
    .aav-error {
      text-align: center;
      padding: 2rem;
      color: #ef4444;
      font-size: 0.85rem;
    }

    /* ── Loading ── */
    .aav-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      opacity: 0.6;
      font-size: 0.9rem;
    }

    .aav-spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `,document.head.appendChild(e)}function Po(e){No(),e.innerHTML=`
    <div class="aav-root">
      <div class="aav-header">
        <div class="aav-title-row">
          <div class="aav-icon-wrap"><i class="bi bi-calendar-x-fill"></i></div>
          <h2 class="aav-title">Solicitudes de Ausencia</h2>
        </div>
        <p class="aav-subtitle">Revisá y aprobá o rechazá las ausencias solicitadas por los maestros.</p>
        <div class="aav-stats" id="aav-stats-row">
          <!-- se llena después de cargar -->
        </div>
      </div>

      <div class="aav-action-bar">
        <span class="aav-count-label" id="aav-count-label"></span>
        <button class="aav-refresh-btn" id="aav-refresh-btn">
          <i class="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      <div id="aav-content">
        <div class="aav-loading">
          <div class="aav-spinner"></div>
          <span>Cargando solicitudes...</span>
        </div>
      </div>
    </div>
  `}function Fo(e,t){let n=t.length,r=t.filter(e=>e.urgencia===`alta`).length,i=t.filter(e=>e.urgencia===`media`).length;e.innerHTML=`
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#ef4444">${n}</div>
        <div class="aav-stat-label">Pendiente${n===1?``:`s`}</div>
      </div>
      <i class="bi bi-hourglass-split" style="font-size:1.3rem;opacity:.35"></i>
    </div>
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#ef4444">${r}</div>
        <div class="aav-stat-label">Urgencia alta</div>
      </div>
      <i class="bi bi-exclamation-triangle-fill" style="font-size:1.3rem;color:#ef4444;opacity:.5"></i>
    </div>
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#f59e0b">${i}</div>
        <div class="aav-stat-label">Urgencia media</div>
      </div>
      <i class="bi bi-dash-circle-fill" style="font-size:1.3rem;color:#f59e0b;opacity:.5"></i>
    </div>
  `}function Io(e){e.innerHTML=`
    <div class="aav-empty">
      <div class="aav-empty-icon"><i class="bi bi-inbox"></i></div>
      <h3 class="aav-empty-title">Todo al día</h3>
      <p class="aav-empty-sub">No hay solicitudes de ausencia pendientes en este momento.</p>
    </div>
  `}async function Lo(e){let t=e.querySelector(`#aav-content`),n=e.querySelector(`#aav-stats-row`),r=e.querySelector(`#aav-count-label`),i=e.querySelector(`#aav-refresh-btn`);t&&(t.innerHTML=`
      <div class="aav-loading">
        <div class="aav-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    `);try{let i=await yo();if(n&&Fo(n,i),r&&(r.textContent=i.length===0?`Sin solicitudes pendientes`:`${i.length} solicitud${i.length>1?`es`:``} pendiente${i.length>1?`s`:``}`),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate(),!i.length){Io(t);return}t.innerHTML=``;let a=document.createElement(`div`);a.className=`aav-list`,t.appendChild(a);let o=[...i].sort((e,t)=>{let n={alta:0,media:1,baja:2},r=n[e.urgencia]??3,i=n[t.urgencia]??3;return r===i?(e.created_at||``).localeCompare(t.created_at||``):r-i});for(let t of o)a.appendChild(jo(t,{onApprove:async(t,n)=>{await xo(t,n),Mo(`Ausencia aprobada`,`success`),await Lo(e)},onReject:async(t,n)=>{await So(t,n),Mo(`Ausencia rechazada`,`success`),await Lo(e)}}))}catch(e){t&&(t.innerHTML=`
        <div class="aav-error">
          <i class="bi bi-exclamation-triangle"></i>
          Error al cargar solicitudes: ${e.message}
        </div>
      `),Mo(`Error al cargar ausencias: ${e.message}`,`error`)}finally{i&&i.classList.remove(`spinning`)}}async function Ro(e){Po(e);let t=e.querySelector(`.aav-root`);await Lo(t);let n=e.querySelector(`#aav-refresh-btn`);n&&n.addEventListener(`click`,async()=>{n.classList.add(`spinning`),await Lo(t)})}function zo(e){let t=new Date;return t.setDate(t.getDate()-e),t.toISOString().split(`T`)[0]}function Q(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``}function Bo(e){if(!e)return``;let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4),r=Math.floor(t/36e5),i=Math.floor(t/864e5);return n<2?`ahora mismo`:n<60?`hace ${n} min`:r<24?`hace ${r}h`:i<7?`hace ${i}d`:Q(e)}var Vo={enfermedad:`Médica`,personal:`Personal`,capacitacion:`Capacitación`,vacaciones:`Vacaciones`,otro:`Otro`};async function Ho(){let e=zo(30),{data:n,error:r}=await t.from(`ausencias_maestros`).select(`
      id, maestro_id, tipo_ausencia, urgencia, fecha_inicio, fecha_fin,
      estado, motivo, created_at, decidido_en,
      maestros:maestro_id(nombre_completo, correo, instrumento)
    `).in(`estado`,[`pendiente`,`aprobada`,`rechazada`]).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(50);if(r)throw r;if(!n||n.length===0)return[];let i=[...new Set(n.map(e=>e.maestro_id).filter(Boolean))];if(i.length>0){let{data:e,error:r}=await t.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,i);if(!r&&e){let r=e.map(e=>e.email).filter(Boolean),i=new Map;if(r.length>0){let{data:e}=await t.from(`maestros`).select(`correo, especialidad`).in(`correo`,r);e&&(i=new Map(e.map(e=>[e.correo.toLowerCase(),e.especialidad])))}let a=new Map(e.map(e=>{let t=i.get(e.email?.toLowerCase())||null;return[e.id,{nombre_completo:e.nombre_completo,correo:e.email,instrumento:t}]}));return n.map(e=>{let t=a.get(e.maestro_id);return{...e,maestros:t||e.maestros||null}})}}return n.map(e=>({...e,maestros:e.maestros||null}))}function Uo(e,t=[]){let n=e.maestros?.nombre_completo||`Maestro`,r=Vo[e.tipo_ausencia]||e.tipo_ausencia||`Ausencia`,i=e.estado===`pendiente`,a=e.estado===`aprobada`,o=e.fecha_inicio===e.fecha_fin?Q(e.fecha_inicio):`${Q(e.fecha_inicio)} → ${Q(e.fecha_fin)}`,s=e.maestros?.instrumento,c=i&&s?t.filter(t=>t.instrumento===s&&t.id!==e.maestro_id).slice(0,3):[];return{id:`ausencia:${e.id}`,source:`ausencia`,sourceId:e.id,priority:i?e.urgencia===`alta`?`alta`:e.urgencia===`media`?`media`:`baja`:`info`,actionable:i,estado:e.estado,urgencia:e.urgencia,tipo_ausencia:e.tipo_ausencia,icon:i?`bi-calendar-x-fill`:a?`bi-calendar-check-fill`:`bi-calendar-minus-fill`,iconColor:i?e.urgencia===`alta`?`#ef4444`:e.urgencia===`media`?`#f59e0b`:`#6b7280`:a?`#22c55e`:`#ef4444`,category:`ausencia`,titulo:i?`${n} solicitó ausencia ${r.toLowerCase()}`:a?`Ausencia de ${n} aprobada`:`Ausencia de ${n} rechazada`,subtitulo:o,motivo:e.motivo||``,timestamp:e.created_at,timeAgo:Bo(e.created_at),actionRoute:i?`admin-ausencias`:null,actionLabel:i?`Revisar`:null,suplentesSugeridos:c,maestroInstrumento:s}}async function Wo(){let e=zo(7),n=new Date().toISOString().split(`T`)[0],{data:r,error:i}=await t.from(`sesiones_clase`).select(`
      id, fecha, asistencia, borrador, contenido, clase_id,
      clases:clase_id(nombre, maestro_id,
        maestros:maestro_id(nombre_completo)
      )
    `).gte(`fecha`,e).lt(`fecha`,n).order(`fecha`,{ascending:!1}).limit(200);if(i)throw i;return r||[]}function Go(e){let t=e.filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),n={};for(let e of t){let t=e.clases?.maestro_id||`unknown`,r=e.clases?.maestros?.nombre_completo||`Maestro desconocido`;n[t]||(n[t]={nombre:r,count:0,ultima:e.fecha,mid:t}),n[t].count++,e.fecha>n[t].ultima&&(n[t].ultima=e.fecha)}return Object.values(n).map(e=>({id:`compliance:${e.mid}`,source:`sesion`,sourceId:e.mid,priority:e.count>=3?`alta`:e.count>=2?`media`:`baja`,actionable:!1,estado:`info`,icon:`bi-clipboard-x-fill`,iconColor:e.count>=3?`#ef4444`:e.count>=2?`#f59e0b`:`#6b7280`,category:`compliance`,titulo:`${e.nombre} tiene ${e.count} clase${e.count>1?`s`:``} sin asistencia`,subtitulo:`Última: ${Q(e.ultima)} · últimos 7 días`,motivo:``,timestamp:new Date(`${e.ultima}T12:00:00`).toISOString(),timeAgo:Q(e.ultima),actionRoute:null,actionLabel:null}))}async function Ko(){let e=zo(7),{data:n,error:r}=await t.from(`alumnos`).select(`id, nombre_completo, created_at`).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(20);return r?(console.warn(`[adminNotifApi] alumnos fetch warn:`,r.message),[]):n||[]}function qo(e){return e.map(e=>({id:`alumno:${e.id}`,source:`alumno`,sourceId:e.id,priority:`info`,actionable:!1,estado:`info`,icon:`bi-person-plus-fill`,iconColor:`#3b82f6`,category:`alumno`,titulo:`Nuevo alumno registrado: ${e.nombre_completo||`Alumno`}`,subtitulo:`Estado: activo`,motivo:``,timestamp:e.created_at,timeAgo:Bo(e.created_at),actionRoute:null,actionLabel:null}))}async function Jo(){let{data:e,error:n}=await t.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1}).limit(20);return n?(console.warn(`[adminNotifApi] pending teachers fetch warn:`,n.message),[]):e||[]}function Yo(e){return{id:`maestro-pendiente:${e.id}`,source:`maestro`,sourceId:e.id,priority:`alta`,actionable:!0,estado:`pendiente`,icon:`bi-person-badge-fill`,iconColor:`#ef4444`,category:`maestro`,titulo:`Nuevo maestro registrado esperando aprobación: ${e.nombre_completo||`Maestro`}`,subtitulo:`Email: ${e.email}`,motivo:``,timestamp:e.created_at,timeAgo:Bo(e.created_at),actionRoute:`admin-aprobacion`,actionLabel:`Ver Aprobaciones`}}async function Xo(){let{data:e,error:n}=await t.from(`maestros`).select(`id, nombre_completo, correo, especialidad`).eq(`activo`,!0);return n?(console.warn(`[adminNotifApi] active maestros fetch warn:`,n.message),[]):(e||[]).map(e=>({id:e.id,nombre_completo:e.nombre_completo,email:e.correo,instrumento:e.especialidad}))}async function Zo(){let e=zo(30),{data:n,error:r}=await t.from(`asistencias`).select(`
      alumno_id, estado, fecha,
      alumnos:alumno_id(nombre_completo)
    `).gte(`fecha`,e).order(`fecha`,{ascending:!1});if(r)return console.warn(`[adminNotifApi] early warning fetch warn:`,r.message),[];let i={};for(let e of n||[]){let t=e.alumno_id;t&&(i[t]||(i[t]={nombre:e.alumnos?.nombre_completo||`Estudiante`,asistencias:[]}),i[t].asistencias.push(e.estado))}let a=[];for(let[e,t]of Object.entries(i)){let n=t.asistencias.length;if(n<3)continue;let r=0;for(let e of t.asistencias)if(e===`A`||e===`ausente`)r++;else if(e===`P`||e===`presente`||e===`T`||e===`tarde`)break;if(r>=3){a.push({id:`riesgo-alumno-ausencias:${e}`,source:`riesgo`,sourceId:e,priority:`alta`,actionable:!1,estado:`info`,icon:`bi-exclamation-triangle-fill`,iconColor:`#ef4444`,category:`compliance`,titulo:`Riesgo de Deserción: ${t.nombre}`,subtitulo:`Acumula ${r} inasistencias consecutivas en los últimos 30 días.`,motivo:`Acción recomendada: Contactar de urgencia al tutor legal o revisar ficha médica.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`alumno?id=${e}`,actionLabel:`Ver Ficha`});continue}let i=t.asistencias.filter(e=>e===`P`||e===`presente`).length,o=i/n;o<.7&&a.push({id:`riesgo-alumno-rate:${e}`,source:`riesgo`,sourceId:e,priority:`media`,actionable:!1,estado:`info`,icon:`bi-graph-down`,iconColor:`#f59e0b`,category:`compliance`,titulo:`Bajo Compliance Académico: ${t.nombre}`,subtitulo:`Asistencia del ${Math.round(o*100)}% en los últimos 30 días (${i} de ${n} clases).`,motivo:`Acción recomendada: Coordinar entrevista de seguimiento y analizar tutoría.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`alumno?id=${e}`,actionLabel:`Ver Ficha`})}return a}async function Qo(){let[e,t,n,r,i,a]=await Promise.allSettled([Ho(),Wo(),Ko(),Jo(),Xo(),Zo()]),o=[];try{o=await Xo()}catch(e){console.warn(`[adminNotifApi] fallback active maestros failed:`,e)}let s=e.status===`fulfilled`?e.value.map(e=>Uo(e,o)):[],c=t.status===`fulfilled`?Go(t.value):[],l=n.status===`fulfilled`?qo(n.value):[],u=r.status===`fulfilled`?r.value.map(Yo):[],d=a.status===`fulfilled`?a.value:[],f=[...s,...c,...l,...u,...d],p={alta:0,media:1,baja:2,info:3};return f.sort((e,t)=>{if(e.actionable!==t.actionable)return e.actionable?-1:1;let n=p[e.priority]??4,r=p[t.priority]??4;return n===r?(t.timestamp||``).localeCompare(e.timestamp||``):n-r}),f}async function $o(){let[e,n]=await Promise.allSettled([t.from(`ausencias_maestros`).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`pendiente`),t.from(`profiles`).select(`id`,{count:`exact`,head:!0}).eq(`rol`,`maestro`).eq(`estado`,`pendiente`)]);return(e.status===`fulfilled`&&!e.value.error&&e.value.count||0)+(n.status===`fulfilled`&&!n.value.error&&n.value.count||0)}async function es(){let{data:e,error:n}=await t.from(`profiles`).select(`id, nombre_completo, email`).eq(`rol`,`maestro`).eq(`estado`,`activo`).order(`nombre_completo`,{ascending:!0});if(n)throw n;return(e||[]).map(e=>({profile_id:e.id,nombre:e.nombre_completo||e.email||`Maestro`,email:e.email}))}async function ts(e,{titulo:n,mensaje:r,deep_link:i=`/notificaciones`}){if(!e?.length)throw Error(`Se requiere al menos un destinatario`);let a=e.map(e=>({profile_id:e,tipo:`aviso_admin`,titulo:n,mensaje:r,deep_link:i,estado:`pendiente`})),{error:o}=await t.from(`notificaciones`).insert(a);if(o)throw o;let s=0;try{s=(await Promise.allSettled(e.map(e=>fetch(`/functions/v1/send-push`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer `,apikey:``},body:JSON.stringify({profile_id:e,title:n,body:r,data:{tipo:`aviso_admin`,deepLink:i}})}).then(e=>e.ok?e.json():Promise.reject(Error(`HTTP ${e.status}`)))))).filter(e=>e.status===`fulfilled`&&e.value?.sent>0).length}catch(e){console.warn(`[adminNotifApi] Web push dispatch failed (in-app notif still sent):`,e.message)}return{sent:a.length,pushed:s}}async function ns({limit:e=50}={}){let{data:n,error:r}=await t.from(`notificaciones`).select(`id, titulo, mensaje, deep_link, estado, created_at, profile_id`).eq(`tipo`,`aviso_admin`).order(`created_at`,{ascending:!1}).limit(e*20);if(r)throw r;if(!n?.length)return[];let i=new Map;for(let e of n){let t=e.created_at?.slice(0,16),n=`${e.titulo}|${t}`;i.has(n)||i.set(n,{titulo:e.titulo,mensaje:e.mensaje,deep_link:e.deep_link,created_at:e.created_at,recipients:[]}),i.get(n).recipients.push(e.profile_id)}return[...i.values()].slice(0,e).map(e=>({...e,recipientCount:e.recipients.length}))}var rs=null,is=null,as=null;function $(){clearTimeout(as),as=setTimeout(async()=>{try{let e=await $o();is?.(e)}catch(e){console.warn(`[realtimeService] count fetch failed:`,e.message)}},800)}function os(e,t){if(!(typeof Notification>`u`)&&Notification.permission===`granted`&&(localStorage.getItem(`current-view`)||``)!==`admin-notificaciones`)try{new Notification(e,{body:t,icon:`/icons/icon-192x192.png`,badge:`/icons/icon-72x72.png`,tag:`admin-notif`,renotify:!0})}catch{}}function ss(e){rs||=(is=e,typeof Notification<`u`&&Notification.permission===`default`&&Notification.requestPermission().catch(()=>{}),t.channel(`admin-notif-realtime`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`ausencias_maestros`},e=>{os(`📅 Nueva solicitud de ausencia`,`Un maestro solicitó una ausencia — revisá el Centro de Actividad.`),$()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`ausencias_maestros`,filter:`estado=eq.pendiente`},()=>$()).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`profiles`,filter:`rol=eq.maestro`},e=>{os(`👤 Nuevo maestro pendiente de aprobación`,`${e.new?.nombre_completo||`Un maestro`} se registró y está esperando aprobación.`),$()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`profiles`,filter:`estado=eq.pendiente`},()=>$()).subscribe(e=>{e===`SUBSCRIBED`&&$()}))}function cs(){rs&&=(t.removeChannel(rs),null),is=null,clearTimeout(as)}function ls(){is?.(0)}function us(){if(document.getElementById(`anv-styles`))return;let e=document.createElement(`style`);e.id=`anv-styles`,e.textContent=`
    .anv-root {
      padding: 1.25rem 1rem 5rem;
      max-width: 680px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .anv-header {
      margin-bottom: 1.5rem;
    }

    .anv-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .anv-title-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .anv-icon-wrap {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: rgba(99,102,241,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .anv-icon-wrap i {
      font-size: 1.2rem;
      color: #6366f1;
    }

    .anv-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .anv-subtitle {
      font-size: 0.8rem;
      opacity: 0.5;
      margin: 0;
      padding-left: calc(2.5rem + 0.75rem);
    }

    /* ── KPI Widgets (Glassmorphism) ── */
    .anv-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      margin-top: 1.25rem;
    }

    .anv-kpi-card {
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
    }

    .anv-kpi-card:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.08);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .anv-kpi-card.active {
      background: rgba(99, 102, 241, 0.08);
      border-color: #6366f1;
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
    }

    .anv-kpi-num {
      font-size: 1.6rem;
      font-weight: 800;
      line-height: 1;
      color: var(--bs-body-color);
    }

    .anv-kpi-card.criticas .anv-kpi-num { color: #ef4444; }
    .anv-kpi-card.compliance .anv-kpi-num { color: #f59e0b; }
    .anv-kpi-card.novedades .anv-kpi-num { color: #3b82f6; }

    .anv-kpi-label {
      font-size: 0.72rem;
      font-weight: 600;
      opacity: 0.6;
    }

    /* ── Search Bar ── */
    .anv-search-container {
      margin-bottom: 1.25rem;
      position: relative;
    }

    .anv-search-input {
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--bs-body-color);
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    .anv-search-input:focus {
      outline: none;
      background: #fff;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .anv-search-icon {
      position: absolute;
      left: 0.95rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
      opacity: 0.4;
      pointer-events: none;
    }

    /* ── Filters ── */
    .anv-filters {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .anv-filter-btn {
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      background: transparent;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--bs-body-color);
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .anv-filter-btn.active {
      background: #6366f1;
      border-color: #6366f1;
      color: #fff;
    }

    .anv-filter-btn:not(.active):hover {
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.05));
    }

    .anv-filter-count {
      background: rgba(255,255,255,0.25);
      border-radius: 999px;
      font-size: 0.65rem;
      padding: 0.05rem 0.4rem;
      min-width: 1.2rem;
      text-align: center;
    }

    .anv-filter-btn:not(.active) .anv-filter-count {
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.08));
      color: var(--bs-body-color);
    }

    /* ── Action bar ── */
    .anv-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .anv-showing {
      font-size: 0.75rem;
      opacity: 0.5;
    }

    .anv-refresh-btn {
      background: transparent;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.12));
      border-radius: 0.5rem;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      cursor: pointer;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: background 0.15s;
    }
    .anv-refresh-btn:hover { background: var(--bs-tertiary-bg); }
    .anv-refresh-btn.spinning i { animation: anv-spin 0.7s linear infinite; }
    
    .animate-pulse {
      animation: pulse-ring 1.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
    }

    @keyframes pulse-ring {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }

    @keyframes anv-spin { to { transform: rotate(360deg); } }

    /* ── Timeline ── */
    .anv-timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
    }

    /* Vertical line */
    .anv-timeline::before {
      content: '';
      position: absolute;
      left: 1.125rem;
      top: 0.5rem;
      bottom: 0.5rem;
      width: 2px;
      background: var(--bs-border-color, rgba(0,0,0,0.08));
      border-radius: 1px;
    }

    /* ── Event card ── */
    .anv-event {
      display: flex;
      gap: 0.85rem;
      padding: 0.75rem 0;
      position: relative;
      animation: anv-fadein 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes anv-fadein {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .anv-event-dot {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.95rem;
      position: relative;
      z-index: 1;
      border: 2px solid var(--bs-body-bg, #fff);
    }

    .anv-event-body {
      flex: 1;
      min-width: 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--bs-border-color, rgba(0,0,0,0.06));
    }

    .anv-event:last-child .anv-event-body {
      border-bottom: none;
    }

    .anv-event-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.15rem;
    }

    .anv-event-titulo {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.4;
      flex: 1;
      min-width: 0;
    }

    .anv-event-time {
      font-size: 0.7rem;
      opacity: 0.45;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .anv-event-sub {
      font-size: 0.77rem;
      opacity: 0.6;
      margin-bottom: 0.35rem;
    }

    .anv-event-motivo {
      font-size: 0.76rem;
      opacity: 0.55;
      font-style: italic;
      margin-bottom: 0.4rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* ── Category chip ── */
    .anv-cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      margin-bottom: 0.3rem;
    }

    /* ── Priority indicator ── */
    .anv-event[data-priority="alta"]   .anv-event-titulo { color: #ef4444; }
    .anv-event[data-priority="media"]  .anv-event-titulo { color: #f59e0b; }

    /* ── Suplentes recomendados ── */
    .anv-suplentes-box {
      margin-top: 0.65rem;
      padding: 0.65rem 0.8rem;
      background: rgba(99, 102, 241, 0.04);
      border: 1px dashed rgba(99, 102, 241, 0.2);
      border-radius: 0.75rem;
    }

    .anv-suplentes-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .anv-suplentes-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .anv-suplente-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0.04);
      padding: 0.3rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.74rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.01);
    }

    .anv-suplente-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .anv-suplente-name {
      font-weight: 600;
      color: var(--bs-body-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .anv-suplente-email {
      font-size: 0.65rem;
      opacity: 0.5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .anv-suplente-btn {
      padding: 0.2rem 0.5rem;
      border-radius: 0.35rem;
      border: none;
      background: rgba(99,102,241,0.08);
      color: #6366f1;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .anv-suplente-btn:hover {
      background: #6366f1;
      color: #fff;
    }

    .anv-suplente-btn.notified {
      background: rgba(34,197,94,0.12);
      color: #16a34a;
      pointer-events: none;
    }

    /* ── Inline actions ── */
    .anv-inline-actions {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .anv-action-btn {
      padding: 0.28rem 0.75rem;
      border-radius: 0.5rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: opacity 0.15s, transform 0.1s;
    }
    .anv-action-btn:active  { transform: scale(0.96); }
    .anv-action-btn:disabled { opacity: 0.4; pointer-events: none; }

    .anv-btn-approve {
      background: rgba(34,197,94,0.12);
      color: #16a34a;
    }
    .anv-btn-approve:hover { background: rgba(34,197,94,0.22); }

    .anv-btn-reject {
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }
    .anv-btn-reject:hover { background: rgba(239,68,68,0.2); }

    .anv-btn-goto {
      background: rgba(99,102,241,0.1);
      color: #6366f1;
    }
    .anv-btn-goto:hover { background: rgba(99,102,241,0.2); }

    /* ── Estado chip (post-decision) ── */
    .anv-estado-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      margin-top: 0.4rem;
    }

    /* ── Empty / Error / Loading ── */
    .anv-center {
      text-align: center;
      padding: 3.5rem 1.5rem;
    }
    .anv-center-icon {
      font-size: 3rem;
      opacity: 0.2;
      margin-bottom: 0.75rem;
    }
    .anv-center-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .anv-center-sub {
      font-size: 0.8rem;
      opacity: 0.5;
    }

    .anv-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      opacity: 0.6;
      font-size: 0.88rem;
    }
    .anv-spinner {
      width: 1.4rem;
      height: 1.4rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: anv-spin 0.7s linear infinite;
    }

    /* ── Dark mode ── */
    [data-bs-theme="dark"] .anv-event-dot,
    [data-portal-theme="dark"] .anv-event-dot {
      border-color: var(--bs-body-bg, #1e1e2e);
    }

    [data-bs-theme="dark"] .anv-kpi-card,
    [data-portal-theme="dark"] .anv-kpi-card {
      background: rgba(30, 30, 46, 0.45);
      border-color: rgba(255, 255, 255, 0.05);
    }

    [data-bs-theme="dark"] .anv-suplente-item,
    [data-portal-theme="dark"] .anv-suplente-item {
      background: rgba(30, 30, 46, 0.6);
      border-color: rgba(255, 255, 255, 0.05);
    }

    [data-bs-theme="dark"] .anv-search-input,
    [data-portal-theme="dark"] .anv-search-input {
      background: rgba(30, 30, 46, 0.6);
      border-color: rgba(255, 255, 255, 0.05);
    }
  `,document.head.appendChild(e)}var ds=[{key:`all`,label:`Todo`,icon:`bi-grid-fill`},{key:`ausencia`,label:`Ausencias`,icon:`bi-calendar-x-fill`},{key:`compliance`,label:`Alertas`,icon:`bi-exclamation-triangle-fill`},{key:`alumno`,label:`Novedades`,icon:`bi-person-plus-fill`}],fs={ausencia:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`},compliance:{bg:`rgba(245,158,11,0.1)`,color:`#f59e0b`},alumno:{bg:`rgba(59,130,246,0.1)`,color:`#3b82f6`},maestro:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`}},ps={ausencia:`Ausencia`,compliance:`Alerta`,alumno:`Novedad`,maestro:`Seguridad`},ms={aprobada:{label:`Aprobada`,bg:`rgba(34,197,94,0.12)`,color:`#16a34a`,icon:`bi-check-circle-fill`},rechazada:{label:`Rechazada`,bg:`rgba(239,68,68,0.12)`,color:`#dc2626`,icon:`bi-x-circle-fill`},pendiente:{label:`Pendiente`,bg:`rgba(245,158,11,0.12)`,color:`#d97706`,icon:`bi-hourglass-split`}};async function hs(e){us(),`Notification`in window&&Notification.permission===`default`&&Notification.requestPermission();let n=[],r=`all`,i=``,a=null;function s(){e.innerHTML=`
      <div class="anv-root">
        <div class="anv-header">
          <div class="anv-title-row d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="anv-title-left">
              <div class="anv-icon-wrap"><i class="bi bi-bell-fill"></i></div>
              <h2 class="anv-title">Centro de Actividad</h2>
            </div>
            <div class="d-flex gap-2">
              <button id="anv-btn-historial" class="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: white;">
                <i class="bi bi-clock-history"></i>
                <span>Historial</span>
              </button>
              <button id="anv-btn-send-notif" class="btn btn-sm btn-warning rounded-pill px-3 fw-semibold d-flex align-items-center gap-2">
                <i class="bi bi-send-fill"></i>
                <span>Enviar notificación</span>
              </button>
              <button id="anv-btn-help" class="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: white;">
                <i class="bi bi-question-circle-fill"></i>
                <span>Guía</span>
              </button>
            </div>
          </div>
          <p class="anv-subtitle">Gobernanza escolar proactiva y control operativo en tiempo real.</p>
          
          <!-- Mini-Dashboard KPIs Translúcidos -->
          <div class="anv-kpis" id="anv-kpi-container">
            <div class="anv-kpi-card active" data-kpi="all">
              <span class="anv-kpi-num" id="kpi-todo">-</span>
              <span class="anv-kpi-label">Total Eventos</span>
            </div>
            <div class="anv-kpi-card criticas" data-kpi="critica">
              <span class="anv-kpi-num" id="kpi-criticas">-</span>
              <span class="anv-kpi-label">Pendientes Críticas</span>
            </div>
            <div class="anv-kpi-card compliance" data-kpi="compliance">
              <span class="anv-kpi-num" id="kpi-compliance">-</span>
              <span class="anv-kpi-label">Alertas Académicas</span>
            </div>
            <div class="anv-kpi-card novedades" data-kpi="alumno">
              <span class="anv-kpi-num" id="kpi-novedades">-</span>
              <span class="anv-kpi-label">Registros Nuevos</span>
            </div>
          </div>

          <!-- Buscador Inteligente en Caliente -->
          <div class="anv-search-container">
            <i class="bi bi-search anv-search-icon"></i>
            <input type="text" id="anv-search-bar" class="anv-search-input" placeholder="Buscar por docente, alumno, instrumento o motivo..." autocomplete="off">
          </div>

          <div class="anv-filters" id="anv-filters"></div>
        </div>

        <div class="anv-action-bar">
          <span class="anv-showing" id="anv-showing"></span>
          <button class="anv-refresh-btn" id="anv-refresh-btn">
            <i class="bi bi-broadcast"></i> Conectando...
          </button>
        </div>

        <div id="anv-body">
          <div class="anv-loading">
            <div class="anv-spinner"></div>
            <span>Cargando actividad operativa...</span>
          </div>
        </div>
      </div>
    `,e.querySelector(`#anv-search-bar`)?.addEventListener(`input`,e=>{i=e.target.value,m()}),e.querySelectorAll(`[data-kpi]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),r=t.dataset.kpi,l(),m()})}),e.querySelector(`#anv-btn-help`)?.addEventListener(`click`,()=>{ee()})}function l(){let t=e.querySelector(`#anv-filters`);if(!t)return;t.innerHTML=``;let i={};for(let e of n)i[e.category]=(i[e.category]||0)+1;ds.forEach(a=>{let o=a.key===`all`?n.length:i[a.key]||0,s=r===a.key,c=document.createElement(`button`);c.className=`anv-filter-btn`+(s?` active`:``),c.dataset.filter=a.key,c.innerHTML=`<i class="bi ${a.icon}"></i> ${a.label} <span class="anv-filter-count">${o}</span>`,c.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`));let t=e.querySelector(`[data-kpi="${a.key}"]`);t&&t.classList.add(`active`),r=a.key,m(),l()}),t.appendChild(c)})}function u(){let t=n.length,r=n.filter(e=>e.actionable||e.priority===`alta`).length,i=n.filter(e=>e.category===`compliance`).length,a=n.filter(e=>e.category===`alumno`||e.category===`maestro`).length,o=e.querySelector(`#kpi-todo`),s=e.querySelector(`#kpi-criticas`),c=e.querySelector(`#kpi-compliance`),l=e.querySelector(`#kpi-novedades`);o&&(o.textContent=t),s&&(s.textContent=r),c&&(c.textContent=i),l&&(l.textContent=a)}function d(e,t){if(`Notification`in window&&Notification.permission===`granted`)try{new Notification(e,{body:t,icon:`/img/icons/icon-192x192.png`,vibrate:[200,100,200],tag:`soi-admin-notif`})}catch(e){console.warn(`[Web Push] Fallback via SW required:`,e)}}function f(){if(a)return;let n=t.getChannels().find(e=>e.topic===`realtime:admin-feed-channel`);n&&t.removeChannel(n),a=t.channel(`admin-feed-channel`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`ausencias_maestros`},async e=>{console.log(`[Realtime WebSocket] Nueva ausencia detectada:`,e),d(`Nueva Ausencia Solicitada`,`Un maestro ha enviado una solicitud de ausencia urgente.`),await h(!0)}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`ausencias_maestros`},async()=>{await h(!0)}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`profiles`},async e=>{e.new&&e.new.rol===`maestro`&&(console.log(`[Realtime WebSocket] Nuevo maestro registrado:`,e),d(`Nuevo Registro de Seguridad`,`${e.new.nombre_completo} se ha registrado esperando aprobación.`),await h(!0))}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`asistencias`},async()=>{await h(!0)}).subscribe(t=>{let n=e.querySelector(`#anv-refresh-btn`);n&&(t===`SUBSCRIBED`?(n.innerHTML=`<i class="bi bi-broadcast text-success animate-pulse"></i> Feed en Vivo`,n.style.borderColor=`rgba(34,197,94,0.3)`,n.title=`Conectado mediante WebSockets en tiempo real.`):(n.innerHTML=`<i class="bi bi-exclamation-triangle-fill text-warning"></i> Re-conectar`,n.style.borderColor=`rgba(245,158,11,0.3)`,n.title=`WebSockets inactivos. Haz clic para actualizar manualmente.`))})}function p(e,n){let r=document.createElement(`div`);r.className=`anv-event`,r.dataset.priority=e.priority,r.dataset.category=e.category;let i=fs[e.category]||{bg:`rgba(99,102,241,0.12)`,color:`#6366f1`},a=ps[e.category]||e.category,o=``;if((e.source===`ausencia`||e.source===`maestro`)&&!e.actionable){let t=ms[e.estado===`activo`?`aprobada`:e.estado===`rechazado`?`rechazada`:e.estado];t&&(o=`
          <span class="anv-estado-chip" style="background:${t.bg};color:${t.color}">
            <i class="bi ${t.icon}"></i> ${t.label===`Aprobada`&&e.source===`maestro`?`Aprobado`:t.label===`Rechazada`&&e.source===`maestro`?`Rechazado`:t.label}
          </span>
        `)}let s=``;e.suplentesSugeridos&&e.suplentesSugeridos.length>0&&e.actionable&&(s=`
        <div class="anv-suplentes-box">
          <div class="anv-suplentes-title">
            <i class="bi bi-magic"></i> Suplentes Recomendados (${e.maestroInstrumento||`Instrumento`})
          </div>
          <div class="anv-suplentes-list">
            ${e.suplentesSugeridos.map(e=>`
              <div class="anv-suplente-item">
                <div class="anv-suplente-info">
                  <span class="anv-suplente-name">${e.nombre_completo}</span>
                  <span class="anv-suplente-email">${e.email}</span>
                </div>
                <button class="anv-suplente-btn" data-action="notify-sub" data-sub-name="${e.nombre_completo}" data-sub-email="${e.email}">
                  <i class="bi bi-send-fill"></i> Proponer
                </button>
              </div>
            `).join(``)}
          </div>
        </div>
      `);let l=``;if(e.actionable&&e.source===`ausencia`)l=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-approve" data-action="approve" data-id="${e.sourceId}">
            <i class="bi bi-check-circle"></i> Aprobar
          </button>
          <button class="anv-action-btn anv-btn-reject" data-action="reject" data-id="${e.sourceId}">
            <i class="bi bi-x-circle"></i> Rechazar
          </button>
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="admin-ausencias">
            <i class="bi bi-arrow-right-circle"></i> Ver detalle
          </button>
        </div>
      `;else if(e.actionable&&e.source===`maestro`)l=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-approve" data-action="approve-maestro" data-id="${e.sourceId}">
            <i class="bi bi-check-circle"></i> Aprobar
          </button>
          <button class="anv-action-btn anv-btn-reject" data-action="reject-maestro" data-id="${e.sourceId}">
            <i class="bi bi-x-circle"></i> Rechazar
          </button>
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${e.actionRoute}">
            <i class="bi bi-arrow-right-circle"></i> Ver Aprobaciones
          </button>
        </div>
      `;else if(e.actionRoute){let t=e.actionParams?` data-params='${JSON.stringify(e.actionParams)}'`:``;l=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${e.actionRoute}"${t}>
            <i class="bi bi-arrow-right-circle"></i> ${e.actionLabel||`Ver`}
          </button>
        </div>
      `}return r.innerHTML=`
      <div class="anv-event-dot" style="background:${i.bg}">
        <i class="bi ${e.icon}" style="color:${e.iconColor}"></i>
      </div>
      <div class="anv-event-body">
        <span class="anv-cat-chip" style="background:${i.bg};color:${i.color}">
          ${a}
        </span>
        <div class="anv-event-top">
          <span class="anv-event-titulo">${e.titulo}</span>
          <span class="anv-event-time">${e.timeAgo}</span>
        </div>
        <div class="anv-event-sub">${e.subtitulo}</div>
        ${e.motivo?`<div class="anv-event-motivo">"${e.motivo}"</div>`:``}
        ${s}
        ${o}
        ${l}
      </div>
    `,r.querySelectorAll(`[data-action]`).forEach(i=>{i.addEventListener(`click`,async a=>{a.stopPropagation();let o=i.dataset.action;if(o===`goto`){let e=window.router||c;if(e){let[t,n]=(i.dataset.route||``).split(`?`),r=i.dataset.params?JSON.parse(i.dataset.params):{};n&&new URLSearchParams(n).forEach((e,t)=>{r[t]=e}),e.navigate(t,r)}return}if(o===`notify-sub`){let e=i.dataset.subName;i.disabled=!0,i.innerHTML=`<i class="bi bi-check-lg"></i> Propuesto`,i.className=`anv-suplente-btn notified`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Propuesta de suplencia enviada a ${e}`,type:`success`}}));return}if(r.querySelectorAll(`[data-action="approve"],[data-action="reject"],[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!0),o===`approve`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await xo(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia aprobada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`aprobada`,e.priority=`info`,e.icon=`bi-calendar-check-fill`,e.iconColor=`#22c55e`;let t=p(e,n);t.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(t),u(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(o===`reject`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await So(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia rechazada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazada`,e.priority=`info`,e.icon=`bi-calendar-minus-fill`,e.iconColor=`#ef4444`;let t=p(e,n);t.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(t),u(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}else if(o===`approve-maestro`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:i}=await t.from(`profiles`).update({estado:`activo`}).eq(`id`,e.sourceId);if(i)throw i;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro aprobado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`activo`,e.priority=`info`,e.icon=`bi-person-check-fill`,e.iconColor=`#22c55e`,e.titulo=`Maestro registrado aprobado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let a=p(e,n);a.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(a),u()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(o===`reject-maestro`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:i}=await t.from(`profiles`).update({estado:`rechazado`}).eq(`id`,e.sourceId);if(i)throw i;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro rechazado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazado`,e.priority=`info`,e.icon=`bi-person-dash-fill`,e.iconColor=`#ef4444`,e.titulo=`Maestro registrado rechazado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let a=p(e,n);a.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(a),u()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}})}),r}function m(){let t=e.querySelector(`#anv-body`),a=e.querySelector(`#anv-showing`);if(!t)return;let o=n;if(r===`critica`?o=n.filter(e=>e.actionable||e.priority===`alta`):r!==`all`&&(o=n.filter(e=>e.category===r)),i.trim().length>0){let e=i.toLowerCase().trim();o=o.filter(t=>(t.titulo||``).toLowerCase().includes(e)||(t.subtitulo||``).toLowerCase().includes(e)||(t.motivo||``).toLowerCase().includes(e)||(t.maestroInstrumento||``).toLowerCase().includes(e))}if(a&&(a.textContent=o.length===0?`Sin eventos encontrados`:`${o.length} evento${o.length>1?`s`:``}`),o.length===0){t.innerHTML=`
        <div class="anv-center">
          <div class="anv-center-icon"><i class="bi bi-check-circle"></i></div>
          <p class="anv-center-title">Sin novedades</p>
          <p class="anv-center-sub">No hay eventos que coincidan con la búsqueda o el filtro activo.</p>
        </div>
      `;return}t.innerHTML=``;let s=document.createElement(`div`);s.className=`anv-timeline`,o.forEach(e=>{s.appendChild(p(e,()=>h(!0)))}),t.appendChild(s)}async function h(t=!1){let r=e.querySelector(`#anv-refresh-btn`),i=e.querySelector(`#anv-body`);r&&!t&&r.classList.add(`spinning`),i&&n.length===0&&(i.innerHTML=`
        <div class="anv-loading">
          <div class="anv-spinner"></div>
          <span>Cargando actividad operativa...</span>
        </div>
      `);try{n=await Qo(),u(),l(),m(),f()}catch(t){console.error(`[adminNotificacionesView] load error:`,t);let r=e.querySelector(`#anv-body`);r&&n.length===0&&(r.innerHTML=`
          <div class="anv-center">
            <div class="anv-center-icon"><i class="bi bi-exclamation-triangle"></i></div>
            <p class="anv-center-title">Error al cargar</p>
            <p class="anv-center-sub">${t.message}</p>
          </div>
        `)}finally{r&&r.classList.remove(`spinning`)}}function ee(){o.open({title:`Guía del Usuario — Centro de Actividad`,body:`
      <style>
        .anv-help-body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--bs-body-color, #212529);
        }
        .anv-help-section {
          background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.03);
          border: 1px solid rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.15);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: transform 0.2s;
        }
        .anv-help-section:hover {
          transform: translateY(-2px);
          border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.25);
        }
        .anv-help-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 1.1rem;
          margin-right: 0.75rem;
        }
      </style>
      <div class="anv-help-body container-fluid">
        <p class="small text-muted mb-4">Esta guía te orientará en el uso del <strong>Centro de Actividad</strong>, el motor inteligente y predictivo de gobernanza y control operativo escolar.</p>
        
        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-danger bg-opacity-10 text-danger"><i class="bi bi-calendar-x-fill"></i></div>
            <h6 class="fw-bold mb-0">Gestión de Ausencias & Suplentes</h6>
          </div>
          <p class="extra-small text-secondary mb-2 lh-base">
            Cuando un maestro solicita una ausencia, el sistema activa automáticamente el **Auto-Substitution Suggester** (Motor de Reemplazo).
          </p>
          <ul class="extra-small text-secondary mb-0 ps-3 lh-base">
            <li><strong>Recomendación Inteligente:</strong> El sistema identifica en tiempo real a otros maestros activos que enseñen la misma especialidad (instrumento) y te los presenta como candidatos aptos para cubrir la vacante.</li>
            <li><strong>Acción Inline:</strong> Hacé clic en <strong>"Proponer"</strong> al lado de un candidato sugerido para asignarlo provisionalmente. También podés <strong>Aprobar</strong> o <strong>Rechazar</strong> la solicitud de ausencia directo desde la tarjeta con actualización atómica (in-place).</li>
          </ul>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <h6 class="fw-bold mb-0">Early Warning Risk Engine (Alertas de Riesgo)</h6>
          </div>
          <p class="extra-small text-secondary mb-2 lh-base">
            El sistema audita continuamente la asistencia estudiantil en busca de anomalías para prevenir la deserción:
          </p>
          <ul class="extra-small text-secondary mb-0 ps-3 lh-base">
            <li><strong>Riesgo de Deserción (Prioridad Alta - Rojo):</strong> Se dispara cuando un alumno acumula <strong>3 o más inasistencias consecutivas</strong> en los últimos 30 días. <em>Recomendación: Contactar de urgencia al tutor.</em></li>
            <li><strong>Bajo Compliance (Prioridad Media - Naranja):</strong> Se dispara si el porcentaje general de asistencia de un estudiante cae por debajo del <strong>70%</strong>. <em>Recomendación: Agendar reunión de seguimiento.</em></li>
          </ul>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-success bg-opacity-10 text-success"><i class="bi bi-broadcast"></i></div>
            <h6 class="fw-bold mb-0">Control en Vivo (Realtime WebSockets)</h6>
          </div>
          <p class="extra-small text-secondary mb-0 lh-base">
            El Centro de Actividad está conectado permanentemente a Supabase mediante WebSockets. El badge superior de **"Feed en Vivo"** te indica la salud de la conexión. Si ocurren eventos en la escuela mientras estás en otra pestaña, recibirás **notificaciones de escritorio del sistema (Web Push)** para que no te pierdas nada.
          </p>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-info bg-opacity-10 text-info"><i class="bi bi-funnel-fill"></i></div>
            <h6 class="fw-bold mb-0">Buscador & KPIs en Caliente</h6>
          </div>
          <p class="extra-small text-secondary mb-0 lh-base">
            Filtrá todo el feed interactivo al instante escribiendo en el buscador (docente, alumno, instrumento o motivo) o haciendo clic en cualquiera de las 4 tarjetas de KPIs del mini-dashboard superior.
          </p>
        </div>
      </div>
    `,size:`lg`,hideSave:!0,cancelText:`Entendido`})}async function te(){let e=[];try{e=await es()}catch{}let t=e.map(e=>`<option value="${e.profile_id}">${e.nombre}</option>`).join(``);o.open({title:`<i class="bi bi-send-fill me-2 text-warning"></i>Enviar notificación a maestros`,body:`
        <div class="mb-3">
          <label class="form-label fw-semibold">Destinatarios</label>
          <select class="form-select" id="sn-destinatarios" multiple size="5">
            <option value="__all__" style="font-weight:700">📢 Todos los maestros activos</option>
            ${t}
          </select>
          <div class="form-text">Ctrl+click para seleccionar varios. "Todos" hace envío masivo.</div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Título</label>
          <input type="text" class="form-control" id="sn-titulo" placeholder="Ej: Recordatorio de asistencia" maxlength="80">
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Mensaje</label>
          <textarea class="form-control" id="sn-mensaje" rows="3" placeholder="Escribe el mensaje aquí..." maxlength="300"></textarea>
          <div class="form-text" id="sn-char-count">0 / 300</div>
        </div>
        <div id="sn-status"></div>
      `,hideSave:!0,onShow:()=>{let e=document.getElementById(`sn-mensaje`),t=document.getElementById(`sn-char-count`);e?.addEventListener(`input`,()=>{t&&(t.textContent=`${e.value.length} / 300`)})}}),setTimeout(()=>{let t=document.querySelector(`.modal-footer`);if(!t)return;let n=document.createElement(`button`);n.type=`button`,n.className=`btn btn-warning fw-semibold`,n.id=`sn-btn-send`,n.innerHTML=`<i class="bi bi-send me-1"></i>Enviar`,t.appendChild(n),n.addEventListener(`click`,async()=>{let t=document.getElementById(`sn-titulo`),r=document.getElementById(`sn-mensaje`),i=document.getElementById(`sn-destinatarios`),a=document.getElementById(`sn-status`),s=t?.value.trim(),c=r?.value.trim(),l=Array.from(i?.selectedOptions||[]).map(e=>e.value);if(!s){t?.classList.add(`is-invalid`);return}if(!c){r?.classList.add(`is-invalid`);return}if(!l.length){a&&(a.innerHTML=`<div class="alert alert-warning py-2 mb-0">Seleccioná al menos un destinatario.</div>`);return}n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`;try{let t=l;l.includes(`__all__`)&&(t=e.map(e=>e.profile_id));let{sent:r}=await ts(t,{titulo:s,mensaje:c});a&&(a.innerHTML=`
            <div class="alert alert-success py-2 mb-0">
              <i class="bi bi-check-circle me-1"></i>
              Notificación enviada a <strong>${r}</strong> maestro${r===1?``:`s`}.
            </div>`),n.innerHTML=`<i class="bi bi-check2 me-1"></i>Enviado`,setTimeout(()=>o.open({body:``}),1800)}catch(e){a&&(a.innerHTML=`<div class="alert alert-danger py-2 mb-0">Error: ${e.message}</div>`),n.disabled=!1,n.innerHTML=`<i class="bi bi-send me-1"></i>Enviar`}})},50)}async function ne(){o.open({title:`<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas`,body:`<div class="d-flex align-items-center gap-2 py-3 text-muted">
      <div class="spinner-border spinner-border-sm"></div><span>Cargando historial…</span>
    </div>`,hideSave:!0,cancelText:`Cerrar`});let e=[];try{e=await ns({limit:30})}catch(e){o.open({title:`Error`,body:`<div class="alert alert-danger">No se pudo cargar el historial: ${e.message}</div>`,hideSave:!0,cancelText:`Cerrar`});return}if(!e.length){o.open({title:`<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas`,body:`<div class="text-center py-4 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2" style="opacity:0.3"></i>
          <p class="mb-0">Todavía no se enviaron notificaciones.</p>
        </div>`,hideSave:!0,cancelText:`Cerrar`});return}let t=e=>e?new Date(e).toLocaleString(`es-DO`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):``,n=e.map(e=>`
      <div class="border rounded p-3 mb-2" style="font-size:0.875rem;">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
          <strong class="text-truncate" style="max-width:70%;">${e.titulo||`(sin título)`}</strong>
          <span class="badge bg-secondary flex-shrink-0">${e.recipientCount} destinatario${e.recipientCount===1?``:`s`}</span>
        </div>
        <p class="text-muted mb-1" style="white-space:pre-wrap;word-break:break-word;">${e.mensaje||``}</p>
        <small class="text-muted"><i class="bi bi-clock me-1"></i>${t(e.created_at)}</small>
      </div>`).join(``);o.open({title:`<i class="bi bi-clock-history me-2"></i>Historial <span class="badge bg-secondary ms-1">${e.length}</span>`,body:`<div style="max-height:420px;overflow-y:auto;">${n}</div>`,hideSave:!0,cancelText:`Cerrar`})}return s(),await h(),ls(),e.querySelector(`#anv-refresh-btn`)?.addEventListener(`click`,()=>h(!1)),e.querySelector(`#anv-btn-send-notif`)?.addEventListener(`click`,()=>te()),e.querySelector(`#anv-btn-historial`)?.addEventListener(`click`,()=>ne()),function(){a&&=(t.removeChannel(a),null)}}export{At as $,cn as A,ge as At,Yt as B,br as C,b as Ct,z as D,se as Dt,vr as E,fe as Et,rn as F,zt as G,Vt as H,Qt as I,Ht as J,Ut as K,Zt as L,sn as M,l as Mt,an as N,Ln as O,pe as Ot,on as P,kt as Q,$t as R,kr as S,ve as St,Sr as T,ce as Tt,Rt as U,Pt as V,Bt as W,Ot as X,jt as Y,Dt as Z,Or as _,at as _t,yo as a,St as at,Tr as b,ke as bt,$a as c,xt as ct,na as d,vt as dt,Et as et,ea as f,ft,W as g,it as gt,$r as h,ot as ht,Ro as i,gt as it,j,me as jt,dn as k,le as kt,ka as l,ht as lt,ta as m,st as mt,ss as n,bt as nt,mo as o,yt as ot,ra as p,dt as pt,It as q,cs as r,Tt as rt,to as s,wt as st,hs as t,Ct as tt,Ea as u,mt as ut,wr as v,rt as vt,yr as w,he as wt,Dr as x,Oe as xt,Er as y,ut as yt,Xt as z};