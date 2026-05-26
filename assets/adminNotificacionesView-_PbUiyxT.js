const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-DjkFa24L.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CsoeaaUJ.js","assets/typeof-DxaMiMZt.js","assets/alumnos-DymqG36Y.js","assets/clases-IDMUxON6.js","assets/sesiones-t6hlrI4y.js","assets/router-Sn5CI9zK.js","assets/vendor-BWfrAznO.js","assets/vendor-DPfg2iol.css"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{i as t}from"./supabase-C4ics26R.js";import{r as n}from"./maestroAuth-Cae-9DFh.js";import{n as r}from"./vendor-BWfrAznO.js";import{t as i}from"./AppToast-BOjiJExQ.js";import{t as a}from"./preload-helper-CsoeaaUJ.js";import{t as o}from"./AppModal-CLA9fW7x.js";import{t as s}from"./alumnos-DymqG36Y.js";import{_ as c,a as l,c as u,d,f,g as p,h as m,i as h,l as g,m as ee,n as te,o as ne,p as re,s as _,t as ie,u as ae,v as oe}from"./clasesApi-CiNtdXkj.js";import{t as se}from"./router-Sn5CI9zK.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function ce(){let e=0;document.addEventListener(`touchstart`,t=>{t.touches.length===1&&(e=t.touches[0].clientY)},{passive:!0}),document.addEventListener(`touchmove`,t=>{if(t.touches.length===1&&t.touches[0].clientY-e>0){let e=t.target,n=!1,r=!1;for(;e&&e!==document.body&&e!==document.documentElement;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentNode;continue}let t=window.getComputedStyle(e);if(!t){e=e.parentNode;continue}let i=t.overflowY;if((i===`auto`||i===`scroll`)&&e.scrollHeight>e.clientHeight){r=!0,e.scrollTop<=0&&(n=!0);break}e=e.parentNode}r||(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop)<=0&&(n=!0),n&&t.cancelable&&t.preventDefault()}},{passive:!1})}var le={misClases:6e5,horarios:6e5,sesiones:12e4,inscripciones:6e5,salones:36e5,ausencias:12e4,metricasSesiones:12e4},v=new Map,ue=new Map;function de(e){let t=ue.get(e);return t?Date.now()-t.timestamp<t.ttl:!1}function fe(e,t,n){v.set(e,t),ue.set(e,{timestamp:Date.now(),ttl:n||6e4})}function pe(e){return de(e)?v.get(e):(v.delete(e),ue.delete(e),null)}function me(e,t,n){fe(e,t,le[n]||6e4)}function he(e){for(let t of v.keys())t.includes(e)&&(v.delete(t),ue.delete(t))}function ge(){v.clear(),ue.clear()}function _e(e){return pe(e)}function ve(){return[...v.keys()]}var y={get:pe,set:me,invalidate:he,invalidateAll:ge,getCached:_e,_keys:ve},ye={MIS_CLASES:`mis_clases`,HORARIOS:`horarios`,SESIONES:`sesiones`,INSCRIPCIONES:`inscripciones`,SALONES:`salones`,AUSENCIAS:`ausencias`,RUTAS:`rutas`};async function be(){let e=n();return e?.id?e.id:null}async function xe(e=!1){if(typeof process<`u`&&{}.VITEST)return[{id:`550e8400-e29b-41d4-a716-446655440000`,nombre:`Violin 101`,instrumento:`Violin`,capacidad_maxima:20,maestro_principal_id:`dc73014a-9528-4081-84eb-f713b72031ff`}];let n=await be();if(!n)return[];if(!e){let e=y.getCached(`${ye.MIS_CLASES}_${n}`);if(e)return e}let{data:r,error:i}=await t.from(`clases`).select(`id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id`).or(`maestro_principal_id.eq.${n},maestro_suplente_id.eq.${n},maestro_id.eq.${n}`);if(i)return console.warn(`[MaestroData] Error cargando clases:`,i.message),[];let a=r||[];return y.set(`${ye.MIS_CLASES}_${n}`,a,`misClases`),a}async function Se(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,dia:`jueves`,hora_inicio:`08:00:00`,hora_fin:`09:00:00`,salon_id:`salon-1`}];if(!e||e.length===0)return[];let r=`horarios_${e.sort().join(`,`)}`;if(!n){let e=y.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`clase_horarios`).select(`hora_inicio, hora_fin, salon_id, clase_id, dia`).in(`clase_id`,e);if(a)return console.warn(`[MaestroData] Error cargando horarios:`,a.message),[];let o=i||[];return y.set(r,o,`horarios`),o}async function Ce(e,n,r,i=!1){if(!e)return[];if(!i){let t=we(e,n,r);if(t){let e=y.getCached(t);if(e)return e.filter(e=>e.fecha>=n&&e.fecha<=r)}let i=`sesiones_${e}_${n}_${r}`,a=y.getCached(i);if(a)return a}let{data:a,error:o}=await t.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,e).gte(`fecha`,n).lte(`fecha`,r);if(o)return console.warn(`[MaestroData] Error cargando sesiones:`,o.message),[];let s=a||[];return y.set(`sesiones_${e}_${n}_${r}`,s,`sesiones`),s}function we(e,t,n){let r=`sesiones_${e}_`;for(let e of Te()){if(!e.startsWith(r))continue;let i=e.replace(r,``).split(`_`);if(i.length===2){let[r,a]=i;if(r<=t&&a>=n)return e}}return null}function Te(){return y._keys?y._keys():[]}async function Ee(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`1`,alumnos:{id:`1`,nombre_completo:`Estudiante 1`,instrumento_principal:`Violin`}},{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`2`,alumnos:{id:`2`,nombre_completo:`Estudiante 2`,instrumento_principal:`Violin`}}];if(!e||e.length===0)return[];let r=`inscripciones_${e.sort().join(`,`)}`;if(!n){let e=y.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`alumnos_clases`).select(`clase_id, alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).in(`clase_id`,e).eq(`activo`,!0);if(a)return console.warn(`[MaestroData] Error cargando inscripciones:`,a.message),[];let o=i||[];return y.set(r,o,`inscripciones`),o}async function De(e,n=!1){if(!e||e.length===0)return[];let r=`salones_${e.sort().join(`,`)}`;if(!n){let e=y.getCached(r);if(e)return e}let{data:i,error:a}=await t.from(`salones`).select(`id, nombre`).in(`id`,e);if(a)return console.warn(`[MaestroData] Error cargando salones:`,a.message),[];let o=i||[];return y.set(r,o,`salones`),o}async function Oe(){let e=await be();if(!e)return;let t=await xe(),n=t.map(e=>e.id);if(n.length===0)return;let r=new Date,i=new Date(r.getFullYear(),r.getMonth(),1),a=new Date(r.getFullYear(),r.getMonth()+1,0),o=new Date(r);o.setDate(o.getDate()-28);let s=o<i?o.toISOString().split(`T`)[0]:i.toISOString().split(`T`)[0],c=a.toISOString().split(`T`)[0],[l,u,,d]=await Promise.all([Se(n),Ee(n),Ce(e,s,c),Promise.resolve(null)]),f=[...new Set(l.map(e=>e.salon_id).filter(Boolean))];f.length>0&&await De(f),console.log(`[Prefetch] Mes cargado: ${t.length} clases, ${l.length} horarios, ${u.length} inscripciones`)}function ke(){y.invalidate(`mis_clases`),y.invalidate(`horarios`),y.invalidate(`inscripciones`),y.invalidate(`sesiones`)}var b=null,x=null,S=null;({init(){window.pwaInstaller=this,this._injectStyles(),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),b=e}),window.addEventListener(`appinstalled`,()=>{localStorage.setItem(`pwa-installed`,`true`),b=null})},async evaluateInsights(){let e=n();if(e?.id)try{let t=await xe(),n=new Date,r=new Date(n.getTime()-10080*60*1e3),i=n.toISOString().split(`T`)[0],a=r.toISOString().split(`T`)[0],o=await Ce(e.id,a,i),s=[],c=(o||[]).filter(e=>e.borrador===!0);if(c.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre]));if(c.length===1){let t=c[0],n=e[t.clase_id]||`Clase`,r=t.fecha?t.fecha.split(`-`).reverse().slice(0,2).join(`/`):``,i=r?` del ${r}`:``;s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tenés el registro de ${n}${i} en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${t.clase_id}&fecha=${t.fecha}`)}})}else{let e=c[0];s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tenés ${c.length} registros de clase en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${e.clase_id}&fecha=${e.fecha}`)}})}}let l=new Set((t||[]).map(e=>e.id)),u=(o||[]).filter(e=>{if(e.fecha>=i||!l.has(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)});if(u.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre])),n=u[0],r=e[n.clase_id]||`Clase`,i=n.fecha?n.fecha.split(`-`).reverse().slice(0,2).join(`/`):``;s.push({id:`sessions-without-attendance`,priority:`high`,icon:`bi-clipboard-x-fill`,text:u.length===1?`${r} del ${i} quedó sin registrar asistencia.`:`Tenés ${u.length} clases sin asistencia registrada esta semana.`,actionLabel:`Registrar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${n.clase_id}&fecha=${n.fecha}`)}})}e.telefono||e.tlf||s.push({id:`profile-incomplete`,priority:`medium`,icon:`bi-person-exclamation`,text:`Completá tu número de teléfono en tu perfil de usuario.`,actionLabel:`Completar`,action:()=>{window.router&&window.router.navigate(`perfil`)}}),(!t||t.length===0)&&s.push({id:`no-classes-assigned`,priority:`low`,icon:`bi-info-circle-fill`,text:`No tenés clases asignadas en el sistema actualmente.`,actionLabel:`Soporte`,action:()=>{window.router&&window.router.navigate(`perfil`)}});let d=s.filter(e=>{let t=localStorage.getItem(`soi-dismissed-${e.id}`);return t?Date.now()-parseInt(t,10)>10080*60*1e3:!0});if(d.length>0){let e=d[0];if(this.currentAlertId===e.id&&this.currentAlertText===e.text)return;this._showInsightBanner(e)}else this.dismissBanner()}catch(e){console.warn(`[SmartInsights] Error al evaluar alertas:`,e)}},_showInsightBanner(e){let t=document.getElementById(`pwa-smart-banner`)||x;if(t){let n=t.querySelector(`.psb-capsule`);if(n){n.style.transition=`opacity 0.2s ease`,n.style.opacity=`0`,setTimeout(()=>{let t=n.querySelector(`.psb-severity-dot`);t&&(t.className=`psb-severity-dot ${e.priority}`,t.innerHTML=`<i class="bi ${e.icon}"></i>`);let r=n.querySelector(`.psb-title`);r&&(r.textContent=e.text);let i=n.querySelector(`#pwa-banner-action`);if(i){i.innerHTML=`<span>${e.actionLabel}</span>`;let t=i.cloneNode(!0);i.parentNode.replaceChild(t,i),t.addEventListener(`click`,()=>{e.action()})}let a=n.querySelector(`#pwa-banner-close`);if(a){let t=a.cloneNode(!0);a.parentNode.replaceChild(t,a),t.addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})}this.currentAlertId=e.id,this.currentAlertText=e.text,n.style.opacity=`1`},200);return}}x=document.createElement(`div`),x.id=`pwa-smart-banner`,x.setAttribute(`role`,`status`),x.setAttribute(`aria-live`,`polite`),x.innerHTML=`
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
    `,document.body.prepend(x),this.currentAlertId=e.id,this.currentAlertText=e.text,requestAnimationFrame(()=>{requestAnimationFrame(()=>x?.classList.add(`psb-visible`))}),document.getElementById(`pwa-banner-action`).addEventListener(`click`,()=>{e.action()}),document.getElementById(`pwa-banner-close`).addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})},dismissBanner(){if(this.currentAlertId=null,this.currentAlertText=null,!x)return;x.classList.remove(`psb-visible`);let e=x;x=null,setTimeout(()=>{e.remove()},400)},promptInstall(){/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():b?this._triggerNativeInstall():this._showDesktopGuide()},async _triggerNativeInstall(){if(!b){this._showDesktopGuide();return}try{await b.prompt();let{outcome:e}=await b.userChoice;e===`accepted`&&localStorage.setItem(`pwa-installed`,`true`)}catch(e){console.warn(`[PWA] Error al mostrar prompt:`,e)}finally{b=null}},_showIOSGuide(){if(S)return;S=document.createElement(`div`),S.id=`pwa-guide-modal`,S.innerHTML=`
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
    `,document.body.appendChild(S);let e=()=>{S?.classList.add(`pgm-hiding`),setTimeout(()=>{S?.remove(),S=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_showDesktopGuide(){if(S)return;S=document.createElement(`div`),S.id=`pwa-guide-modal`,S.innerHTML=`
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
    `,document.body.appendChild(S);let e=()=>{S?.classList.add(`pgm-hiding`),setTimeout(()=>{S?.remove(),S=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_isStandalone(){return window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`},_injectStyles(){if(document.getElementById(`pwa-installer-styles`))return;let e=document.createElement(`style`);e.id=`pwa-installer-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}}).init();var C=class e{constructor(e={}){this.id=e.id||null,this.clase_id=e.clase_id||null,this.maestro_id=e.maestro_id||null,this.fecha_inicio=e.fecha_inicio||null,this.tema=e.tema||``,this.objetivos=e.objetivos||``,this.contenido=e.contenido||``,this.recursos=Array.isArray(e.recursos)?e.recursos:[],this.evaluacion_metodo=e.evaluacion_metodo||``,this.observaciones=e.observaciones||``,this.notas_dsl=e.notas_dsl||``,this.estado=e.estado||`planificado`,this.instrumento=e.instrumento||null,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null,this.clase_nombre=e.clase_nombre||null,this.maestro_nombre=e.maestro_nombre||null}validate(){let t=[];return!this.tema||!this.tema.trim()?t.push(`El tema es obligatorio`):this.tema.trim().length<3?t.push(`El tema debe tener mínimo 3 caracteres`):this.tema.trim().length>200&&t.push(`El tema no puede exceder 200 caracteres`),this.clase_id||t.push(`La clase es obligatoria`),this.objetivos&&this.objetivos.length>1e3&&t.push(`Los objetivos no pueden exceder 1000 caracteres`),this.contenido&&this.contenido.length>2e3&&t.push(`El contenido no puede exceder 2000 caracteres`),this.evaluacion_metodo&&this.evaluacion_metodo.length>500&&t.push(`El método de evaluación no puede exceder 500 caracteres`),this.observaciones&&this.observaciones.length>1e3&&t.push(`Las observaciones no pueden exceder 1000 caracteres`),this.instrumento&&this.instrumento.length>100&&t.push(`El instrumento no puede exceder 100 caracteres`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}canEdit(){return this.estado===`planificado`||this.estado===`ejecutado`}canApprove(){return this.estado===`ejecutado`}isLocked(){return this.estado===`revisado`}static getEstados(){return[{value:`planificado`,label:`Planificado`,color:`bg-primary`},{value:`ejecutado`,label:`Ejecutado`,color:`bg-success`},{value:`revisado`,label:`Revisado`,color:`bg-info`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_inicio:this.fecha_inicio,tema:this.tema.trim(),objetivos:this.objetivos.trim()||null,contenido:this.contenido.trim()||null,recursos:this.recursos,evaluacion_metodo:this.evaluacion_metodo.trim()||null,observaciones:this.observaciones.trim()||null,estado:this.estado,instrumento:this.instrumento?.trim()||null}}},w={alumnos:/#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,calificacion:/(\d)\/(\d)/g};function T(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)r[1]&&n.push(r[1].trim());return n}function Ae(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function je(e){return!e||typeof e!=`string`?{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[]}:{alumnos:T(e,w.alumnos),contenido:T(e,w.contenido),sugerencias:T(e,w.sugerencias),tareas:T(e,w.tareas),medidas:T(e,w.medidas),calificacion:Ae(e),objetivos:T(e,w.objetivos)}}function Me(e){if(!e)return``;let t=e;return t=t.replace(w.calificacion,(e,t,n)=>`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`),t=t.replace(w.objetivos,(e,t)=>`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">__OBJ_START__${t}__OBJ_END__</span>`),t=t.replace(w.alumnos,(e,t)=>`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`),t=t.replace(w.contenido,(e,t)=>`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`),t=t.replace(w.sugerencias,(e,t)=>`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`),t=t.replace(w.tareas,(e,t)=>`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`),t=t.replace(w.medidas,(e,t)=>`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`),t=Ne(t),t=t.replace(/__OBJ_START__/g,`&gt;`),t=t.replace(/__OBJ_END__/g,``),t}function Ne(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var Pe=175,Fe=[`Ejemplo:`,`#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica`,`#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5`,``,`Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo`].join(`
`),Ie=null,E=``;function Le(e=``,t=null){let n=document.createElement(`div`);n.className=`dsl-editor-container`;let r=document.createElement(`div`);r.className=`dsl-editor-wrapper position-relative`;let i=document.createElement(`div`);i.className=`dsl-editor form-control`,i.contentEditable=`true`,i.spellcheck=`false`,i.setAttribute(`data-placeholder`,Fe),i.innerHTML=e?Me(e):``;let a=document.createElement(`div`);a.className=`dsl-highlight-layer position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(a),r.appendChild(i),n.appendChild(r),Re();function o(){return i.innerText||i.textContent||``}function s(){let e=o();e!==E&&(E=e,a.innerHTML=Me(e)+`<br>`)}function c(){a.scrollTop=i.scrollTop,a.scrollLeft=i.scrollLeft}function l(){clearTimeout(Ie),Ie=setTimeout(()=>{s();let e=je(o());t&&t(o(),e)},Pe)}function u(e){e.key===`Tab`&&(e.preventDefault(),document.execCommand(`insertText`,!1,`  `))}function d(){c()}i.addEventListener(`input`,l),i.addEventListener(`keydown`,u),i.addEventListener(`scroll`,d),i.addEventListener(`focus`,()=>{n.classList.add(`focused`)}),i.addEventListener(`blur`,()=>{n.classList.remove(`focused`),s()});function f(e){i.innerHTML=e?Me(e):``,E=o(),a.innerHTML=Me(E)+`<br>`}function p(){return o()}function m(){return je(o())}function h(){i.focus()}function g(e){i.focus(),document.execCommand(`insertText`,!1,e)}function ee(e,t=``){i.focus();let n=window.getSelection();if(!n.rangeCount)return;let r=n.getRangeAt(0);r.deleteContents();let a=document.createTextNode(e),s=document.createTextNode(t);r.insertNode(a),r.collapse(!1),r.insertNode(s),r.setStartAfter(a),r.setEndAfter(a),n.removeAllRanges(),n.addRange(r),E=o()}return n.component={element:n,editor:i,setContent:f,getContent:p,getParsed:m,focus:h,insertText:g,insertAtCursor:ee},n.setContent=f,n.getContent=p,n.getParsed=m,n.focus=h,n.insertText=g,n.insertAtCursor=ee,e&&(E=e),n}function Re(){if(document.getElementById(`dsl-editor-styles`))return;let e=document.createElement(`style`);e.id=`dsl-editor-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function ze(e={}){let{onAlumnoClick:t=null,onGrabarClick:n=null,onEnriquecerClick:r=null,editor:i=null}=e,a=document.createElement(`div`);return a.className=`dsl-toolbar btn-group btn-group-sm me-2`,[{id:`alumno`,icon:`#`,label:`Alumno`,title:`Insertar mention de alumno`,className:`btn btn-outline-primary`,action:()=>{t?t(i):i&&i.insertAtCursor(`#`,``)}},{id:`contenido`,icon:`[]`,label:`Contenido`,title:`Insertar contenido`,className:`btn btn-outline-success`,action:()=>{i&&i.insertAtCursor(`[`,`]`)}},{id:`sugerencia`,icon:`()`,label:`Sugerencia`,title:`Insertar sugerencia`,className:`btn btn-outline-warning`,action:()=>{i&&i.insertAtCursor(`(`,`)`)}},{id:`tarea`,icon:`{}`,label:`Tarea`,title:`Insertar tarea`,className:`btn btn-outline-purple`,action:()=>{i&&i.insertAtCursor(`{`,`}`)}},{id:`medida`,icon:`$`,label:`Medida`,title:`Insertar medida técnica`,className:`btn btn-outline-info`,action:()=>{i&&i.insertAtCursor(`$`,``)}},{id:`calificacion`,icon:`4/5`,label:`Calificación`,title:`Insertar calificación`,className:`btn btn-outline-danger`,action:()=>{i&&i.insertText(`4/5`)}},{id:`objetivo`,icon:`>`,label:`Objetivo`,title:`Insertar referencia a objetivo`,className:`btn btn-outline-secondary`,action:()=>{i&&i.insertAtCursor(`>`,``)}},{id:`grabar`,icon:`🎤`,label:`Grabar`,title:`Grabar audio (placeholder)`,className:`btn btn-outline-dark`,action:()=>{n&&n(i)}},{id:`enriquecer`,icon:`✨`,label:`IA`,title:`Enriquecer con IA (placeholder)`,className:`btn btn-outline-dark`,action:()=>{r&&r(i)}}].forEach(e=>{let t=document.createElement(`button`);t.className=e.className,t.type=`button`,t.title=e.title,t.innerHTML=`<span class="dsl-toolbar-btn">${e.icon}</span>`,t.addEventListener(`click`,t=>{t.preventDefault(),e.action()}),a.appendChild(t)}),Be(),a}function Be(){if(document.getElementById(`dsl-toolbar-styles`))return;let e=document.createElement(`style`);e.id=`dsl-toolbar-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Ve(e={}){let{initialContent:t=``,onChange:n=null,onAlumnoClick:r=null,onGrabarClick:i=null,onEnriquecerClick:a=null}=e,o=document.createElement(`div`);o.className=`dsl-editor-with-toolbar`;let s=Le(t,n),c=ze({onAlumnoClick:r,onGrabarClick:i,onEnriquecerClick:a,editor:s});return o.appendChild(c),o.appendChild(s),o.container=o,o}var He={version:`1.0.0`,environment:`production`,isDemoMode:localStorage.getItem(`demo_mode`)===`true`,groq:{apiKey:``,model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,endpoint:`https://api.groq.com/openai/v1`,maxTokens:1024,temperature:.3},tareas:{localStorageKey:`maestro_tarea`,diasVencimientoDefault:7}},Ue=e({PARENTESCOS:()=>We,actualizarAlumno:()=>Xe,crearAlumno:()=>Ye,eliminarAlumno:()=>Ze,getParentescoLabel:()=>Ge,obtenerAlumno:()=>Je,obtenerAlumnos:()=>qe,obtenerAlumnosActivos:()=>et,obtenerInscripcionesAlumno:()=>tt,validarCedula:()=>$e,validarEmail:()=>Qe}),We=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}];function Ge(e){let t=We.find(t=>t.value===e);return t?t.label:e}function Ke(e){return e?{...e,id:e.id,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,telefono:e.familiar_telefono??``,is_active:e.activo??!0,cedula:e.representante_cedula??``,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``}:null}async function qe(){let{data:e,error:n}=await t.from(`alumnos`).select(`*`).order(`nombre_completo`,{ascending:!0});if(n)throw console.error(`Error cargando alumnos:`,n.message),Error(`No se pudieron cargar los alumnos`);return e.map(Ke)}async function Je(e){let{data:n,error:r}=await t.from(`alumnos`).select(`*`).eq(`id`,e).single();if(r)throw console.error(`Error cargando alumno:`,r.message),Error(`Alumno no encontrado`);return Ke(n)}async function Ye(e){let n=(e.nombre||e.nombre_completo||``).trim();if(!n)throw Error(`El nombre es obligatorio`);let r={nombre_completo:n,correo_representante:(e.email||``).trim().toLowerCase()||null,representante_cedula:(e.cedula||``).trim()||null,instrumento_principal:(e.instrumento||``).trim()||null,activo:e.is_active===void 0?!0:e.is_active,familiar_nombre:(e.familiar_nombre||``).trim()||null,familiar_telefono:(e.telefono||e.familiar_telefono||``).trim()||null,familiar_parentesco:(e.familiar_parentesco||``).trim()||null,contacto_emergencia_nombre:(e.contacto_emergencia_nombre||``).trim()||null,contacto_emergencia_telefono:(e.contacto_emergencia_telefono||``).trim()||null,contacto_emergencia_parentesco:(e.contacto_emergencia_parentesco||``).trim()||null,condiciones_medicas:(e.condiciones_medicas||``).trim()||null,alergias:(e.alergias||``).trim()||null,medicamentos:(e.medicamentos||``).trim()||null},{data:i,error:a}=await t.from(`alumnos`).insert([r]).select();if(a)throw console.error(`Error creando alumno:`,a.message),Error(`No se pudo crear el alumno`);return Ke(i[0])}async function Xe(e,n){let r={};n.nombre!==void 0&&(r.nombre_completo=n.nombre?n.nombre.trim():n.nombre),n.nombre_completo!==void 0&&(r.nombre_completo=n.nombre_completo?n.nombre_completo.trim():n.nombre_completo),n.email!==void 0&&(r.correo_representante=n.email?n.email.trim().toLowerCase():n.email),n.instrumento!==void 0&&(r.instrumento_principal=n.instrumento?n.instrumento.trim():n.instrumento),n.cedula!==void 0&&(r.representante_cedula=n.cedula?n.cedula.trim():n.cedula),n.is_active!==void 0&&(r.activo=n.is_active),n.activo!==void 0&&(r.activo=n.activo),n.telefono!==void 0&&(r.familiar_telefono=n.telefono?n.telefono.trim():n.telefono),n.familiar_telefono!==void 0&&(r.familiar_telefono=n.familiar_telefono?n.familiar_telefono.trim():n.familiar_telefono),n.familiar_nombre!==void 0&&(r.familiar_nombre=n.familiar_nombre?n.familiar_nombre.trim():n.familiar_nombre),n.familiar_parentesco!==void 0&&(r.familiar_parentesco=n.familiar_parentesco?n.familiar_parentesco.trim():n.familiar_parentesco),n.contacto_emergencia_nombre!==void 0&&(r.contacto_emergencia_nombre=n.contacto_emergencia_nombre?n.contacto_emergencia_nombre.trim():n.contacto_emergencia_nombre),n.contacto_emergencia_telefono!==void 0&&(r.contacto_emergencia_telefono=n.contacto_emergencia_telefono?n.contacto_emergencia_telefono.trim():n.contacto_emergencia_telefono),n.contacto_emergencia_parentesco!==void 0&&(r.contacto_emergencia_parentesco=n.contacto_emergencia_parentesco?n.contacto_emergencia_parentesco.trim():n.contacto_emergencia_parentesco),n.condiciones_medicas!==void 0&&(r.condiciones_medicas=n.condiciones_medicas?n.condiciones_medicas.trim():n.condiciones_medicas),n.alergias!==void 0&&(r.alergias=n.alergias?n.alergias.trim():n.alergias),n.medicamentos!==void 0&&(r.medicamentos=n.medicamentos?n.medicamentos.trim():n.medicamentos);let{data:i,error:a}=await t.from(`alumnos`).update(r).eq(`id`,e).select();if(a)throw console.error(`Error actualizando alumno:`,a),a.code===`PGRST201`||a.message?.includes(`row-level security`)?Error(`No tienes permisos para actualizar este alumno. Contacta al administrador.`):Error(`No se pudo actualizar el alumno: ${a.message||`Error desconocido`}`);return Ke(i[0])}async function Ze(e){let{error:n}=await t.from(`alumnos`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando alumno:`,n.message),Error(`No se pudo eliminar el alumno`)}async function Qe(e){let{data:n,error:r}=await t.from(`alumnos`).select(`id`).eq(`correo_representante`,e.trim().toLowerCase()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando email:`,r.message),!!n}async function $e(e){let{data:n,error:r}=await t.from(`alumnos`).select(`id`).eq(`representante_cedula`,e.trim()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando cédula:`,r.message),!!n}async function et(){let{data:e,error:n}=await t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(n)throw Error(`No se pudieron cargar los alumnos`);return e.map(Ke)}async function tt(e){let{data:n,error:r}=await t.from(`alumnos_clases`).select(`clase_id, clase:clases(nombre)`).eq(`alumno_id`,e);if(r)throw console.error(`Error cargando inscripciones de alumno:`,r.message),Error(`No se pudieron cargar las clases del alumno`);return(n||[]).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase?.nombre??`Clase sin nombre`}))}var nt=e({actualizarAlumno:()=>st,crearAlumno:()=>ot,eliminarAlumno:()=>ct,obtenerAlumno:()=>at,obtenerAlumnos:()=>it,obtenerInscripcionesAlumno:()=>ft,validarCedula:()=>ut,validarEmail:()=>lt}),D=(e=500)=>new Promise(t=>setTimeout(t,e));function rt(e){return e?{...e,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,is_active:e.activo??!0,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``}:null}var O=[...s];async function it(){return await D(),O.map(rt)}async function at(e){await D();let t=O.find(t=>t.id===e);if(!t)throw Error(`Alumno no encontrado (Demo)`);return rt(t)}async function ot(e){await D();let t={...e,id:Math.random().toString(36).substr(2,9),nombre_completo:e.nombre||e.nombre_completo,activo:e.is_active===void 0?!0:e.is_active};return O.push(t),rt(t)}async function st(e,t){await D();let n=O.findIndex(t=>t.id===e);if(n===-1)throw Error(`Alumno no encontrado (Demo)`);return O[n]={...O[n],...t},rt(O[n])}async function ct(e){await D(),O=O.filter(t=>t.id!==e)}async function lt(e){return await D(100),O.some(t=>t.correo_representante===e.trim().toLowerCase())}async function ut(e){return await D(100),O.some(t=>t.representante_cedula===e.trim())}var dt=[{alumno_id:`1`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`1`,clase_id:`clase_005`,clase_nombre:`Coro Infantil`},{alumno_id:`2`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`4`,clase_id:`clase_004`,clase_nombre:`Flauta Travesera`}];async function ft(e){return await D(200),dt.filter(t=>t.alumno_id===e).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase_nombre}))}var k=()=>He.isDemoMode?nt:Ue,pt=(...e)=>k().obtenerAlumnos(...e),mt=(...e)=>k().obtenerAlumnos(...e),ht=(...e)=>k().crearAlumno(...e),gt=(...e)=>k().actualizarAlumno(...e),_t=(...e)=>k().eliminarAlumno(...e),vt=(...e)=>k().validarEmail(...e),yt=(...e)=>k().validarCedula(...e),bt=(...e)=>k().obtenerInscripcionesAlumno(...e),xt=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}],St=e=>{let t=xt.find(t=>t.value===e);return t?t.label:e};function Ct(e={}){let{onSelect:t=null,onClose:n=null}=e,r=new Set,i=``,a=document.createElement(`div`);a.className=`modal fade`,a.setAttribute(`tabindex`,`-1`),a.setAttribute(`role`,`dialog`),a.innerHTML=`
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
  `;let o=a.querySelector(`.search-input`),s=a.querySelector(`.alumno-list`),c=a.querySelector(`.confirm-btn`),l=a.querySelector(`.cancel-btn`);async function u(){let e=await mt();d(i?e.filter(e=>e.nombre_completo.toLowerCase().includes(i.toLowerCase())):e)}function d(e){if(s.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`text-center text-muted py-4`,e.textContent=`No se encontraron alumnos`,alunoList.appendChild(e);return}e.forEach(e=>{let t=document.createElement(`label`);t.className=`list-group-item d-flex align-items-center gap-2 cursor-pointer`,t.style.cursor=`pointer`;let n=document.createElement(`input`);n.type=`checkbox`,n.className=`form-check-input`,n.checked=r.has(e.id),n.value=e.id;let i=document.createElement(`div`);i.className=`flex-grow-1`,i.innerHTML=`
        <div class="fw-medium">${wt(e.nombre_completo)}</div>
        <small class="text-muted">${wt(e.instrumento_principal)}</small>
      `,t.appendChild(n),t.appendChild(i),n.addEventListener(`change`,()=>{n.checked?r.add(e.id):r.delete(e.id)}),t.addEventListener(`click`,e=>{e.target!==n&&(n.checked=!n.checked,n.dispatchEvent(new Event(`change`)))}),s.appendChild(t)})}o.addEventListener(`input`,e=>{i=e.target.value,u()}),c.addEventListener(`click`,()=>{t&&t(Array.from(r)),p()}),l.addEventListener(`click`,()=>{n&&n(),p()});function f(){r.clear(),i=``,o.value=``;let e=new bootstrap.Modal(a);e.show(),u(),a.bsModal=e}function p(){a.bsModal&&a.bsModal.hide()}return a.openModal=f,a.closeModal=p,a}function wt(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function Tt(e,n){let r=t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);e&&(r=r.eq(`instrumento`,e)),n&&(r=r.eq(`nivel`,n));let{data:i,error:a}=await r.maybeSingle();if(a)throw a;return i||null}async function Et(){let{data:e,error:n}=await t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(n)throw n;return(e||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function Dt({instrumento:e,nivel:n,descripcion:r}){let{data:i,error:a}=await t.from(`curriculos`).insert({instrumento:e,nivel:n,descripcion:r}).select().single();if(a)throw a;return i}async function Ot(e,n){let{data:r,error:i}=await t.from(`curriculos`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function kt(e,t){return Ot(e,{activo:t})}async function At(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_pilares`).insert({curriculo_id:e,nombre:n,orden:r}).select().single();if(a)throw a;return i}async function jt(e,n){let{data:r,error:i}=await t.from(`curriculo_pilares`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function Mt(e){let{error:n}=await t.from(`curriculo_pilares`).delete().eq(`id`,e);if(n)throw n}async function Nt(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_objetivos`).insert({pilar_id:e,descripcion:n,orden:r}).select().single();if(a)throw a;return i}async function Pt(e,n){let{data:r,error:i}=await t.from(`curriculo_objetivos`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function Ft(e){let{error:n}=await t.from(`curriculo_objetivos`).delete().eq(`id`,e);if(n)throw n}async function It({instrumento:e,nivel:t,descripcion:n,pilares:r}){if(!e||e.trim()===``)throw Error(`El instrumento es obligatorio para crear el plan.`);if(!r||r.length===0)throw Error(`La propuesta debe tener al menos un pilar.`);let i=await Dt({instrumento:e.trim(),nivel:t?.trim()||``,descripcion:n?.trim()||`Plan generado por IA`}),a=[];for(let e=0;e<r.length;e++){let t=r[e],n=await At(i.id,t.nombre||`Pilar ${e+1}`,e),o=t.objetivos||[];for(let e=0;e<o.length;e++){let t=await Nt(n.id,o[e].descripcion||`Objetivo ${e+1}`,e);a.push({id:t.id,descripcion:t.descripcion})}}return{curriculo:i,allObjetivos:a}}async function Lt(){let{data:e,error:n}=await t.from(`planificaciones`).select(`
      *,
      clase:clases (nombre),
      maestro:maestros (nombre_completo)
    `).order(`created_at`,{ascending:!1});if(n)throw console.error(`Error cargando planificaciones:`,n.message),Error(`No se pudieron cargar las planificaciones`);return e.map(e=>new C({...e,clase_nombre:e.clase?.nombre||`Sin asignar`,maestro_nombre:e.maestro?.nombre_completo||`Sin asignar`}))}async function Rt(e){let n=new C(e),r=n.validate();if(r.length>0)throw Error(r.join(`. `));let{data:i,error:a}=await t.from(`planificaciones`).insert([n.toJSON()]).select();if(a)throw a;return new C(i[0])}async function zt(e,n){let{data:r}=await t.from(`planificaciones`).select(`*`).eq(`id`,e).single(),i=new C({...r,...n}),a=i.validate();if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`planificaciones`).update(i.toJSON()).eq(`id`,e).select();if(s)throw s;return new C(o[0])}async function Bt(e){let{error:n}=await t.from(`planificaciones`).delete().eq(`id`,e);if(n)throw n}async function Vt(e){if(!e||!e.length)return[];let{data:n,error:r}=await t.from(`planificaciones`).update({estado:`revisado`}).in(`id`,e).select();if(r)throw r;return(n||[]).map(e=>new C(e))}var Ht=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}},A={PRESENTE:`presente`,AUSENTE:`ausente`,JUSTIFICADO:`justificado`,TARDE:`tarde`},Ut={P:A.PRESENTE,A:A.AUSENTE,J:A.JUSTIFICADO,T:A.TARDE,presente:A.PRESENTE,ausente:A.AUSENTE,justificado:A.JUSTIFICADO,tarde:A.TARDE};function Wt(e){return e?Ut[e]||e:A.PRESENTE}var Gt={presente:{short:`P`,label:`Presente`,css:`success`},ausente:{short:`A`,label:`Ausente`,css:`danger`},justificado:{short:`J`,label:`Justificado`,css:`warning`}};function j(e,t){throw console.error(e,t?.message),Error(e)}function Kt(e){let t=e?.message?.toLowerCase()||``;return t.includes(`unique constraint`)||t.includes(`duplicate key`)||t.includes(`uk_asistencias`)||t.includes(`unique`)&&t.includes(`duplicate`)}async function qt({fechaInicio:e,fechaFin:n,periodoId:r,claseId:i,maestroId:a}={}){let o=t.from(`sesiones_clase`).select(`
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
    `).order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});if(e&&(o=o.gte(`fecha`,e)),n&&(o=o.lte(`fecha`,n)),i&&(o=o.eq(`clase_id`,i)),r){let{data:i}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,r).single();i&&(e||(o=o.gte(`fecha`,i.fecha_inicio)),n||(o=o.lte(`fecha`,i.fecha_fin)))}let{data:s,error:c}=await o;c&&j(`No se pudieron cargar las sesiones`,c);let l=(s||[]).map(e=>{let t=e.asistencias||[];return{sesionId:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,temaPrincipal:e.tema_principal,observacionesGenerales:e.observaciones_generales,estado:e.estado,claseId:e.clase_id,claseNombre:e.clases?.nombre??`—`,instrumento:e.clases?.instrumento??`—`,maestroId:e.clases?.maestro_principal_id??null,maestroNombre:e.clases?.maestros?.nombre_completo??`—`,totalPresentes:t.filter(e=>e.estado===A.PRESENTE).length,totalAusentes:t.filter(e=>e.estado===A.AUSENTE).length,totalJustificados:t.filter(e=>e.estado===A.JUSTIFICADO).length,totalRegistros:t.length}}),u=l;return a&&(u=l.filter(e=>e.maestroId&&e.maestroId.toString()===a.toString())),Jt(u)}function Jt(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return Array.from(t.entries()).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,sesiones:t}))}async function Yt(e){e||j(`Se requiere sesionId`);let{data:n,error:r}=await t.from(`sesiones_clase`).select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `).eq(`id`,e).single();r&&j(`No se pudo cargar la sesión`,r);let{data:i,error:a}=await t.from(`asistencias`).select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e).order(`alumnos(nombre_completo)`,{ascending:!0});a&&j(`No se pudieron cargar las asistencias`,a);let{data:o}=await t.from(`justificaciones`).select(`motivo, descripcion, archivo_url, estado, alumno_id`).eq(`sesion_id`,e),s={};o&&o.forEach(e=>{s[e.alumno_id]=e});let{data:c,error:l}=await t.from(`observaciones_alumnos`).select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e);l&&j(`No se pudieron cargar las observaciones`,l);let{data:u,error:d}=await t.from(`contenidos_sesion`).select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `).eq(`sesion_clase_id`,e);return d&&j(`No se pudieron cargar los contenidos`,d),{sesion:{id:n.id,fecha:n.fecha,horaInicio:n.hora_inicio,horaFin:n.hora_fin,temaPrincipal:n.tema_principal,observacionesGenerales:n.observaciones_generales,estado:n.estado,claseNombre:n.clases?.nombre??`—`,instrumento:n.clases?.instrumento??`—`,maestroNombre:n.clases?.maestros?.nombre_completo??`—`},asistencias:(i||[]).map(e=>({id:e.id,estado:e.estado,justificacionTexto:e.justificacion_texto,observacion:e.observaciones,alumnoId:e.alumno_id,alumnoNombre:e.alumnos?.nombre_completo??`—`,justificacion:s[e.alumno_id]??null})),observaciones:(c||[]).map(e=>({id:e.id,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion??e.observacion,prioridad:e.prioridad,alumnoId:e.alumnos?.id,alumnoNombre:e.alumnos?.nombre_completo??`—`})),contenidos:(u||[]).map(e=>({id:e.id,descripcion:e.descripcion,nivelLogro:e.nivel_logro,planTitulo:e.planificaciones?.titulo}))}}async function Xt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});return n&&j(`No se pudieron cargar los períodos`,n),e||[]}async function Zt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).single();return n?null:e}async function Qt(){let{data:e,error:n}=await t.from(`clases`).select(`id, nombre, instrumento`).order(`nombre`,{ascending:!0});return n&&j(`No se pudieron cargar las clases`,n),e||[]}async function $t(e){e?.length||j(`No hay asistencias para registrar`);let n=[...new Set(e.map(e=>e.alumno_id))];n.some(e=>!e)&&j(`Todas las asistencias deben tener alumno_id`);let{data:r,error:i}=await t.from(`alumnos`).select(`id`).in(`id`,n);i&&j(`No se pudo validar alumnos en la base de datos`,i);let a=new Set(r?.map(e=>e.id)||[]),o=n.filter(e=>!a.has(e));o.length>0&&j(`Los siguientes alumnos no existen: ${o.join(`, `)}`);let s=e.map(e=>{if(!e.sesion_clase_id)throw Error(`sesion_clase_id es requerido para alumno ${e.alumno_id}`);if(!e.clase_id)throw Error(`clase_id es requerido para alumno ${e.alumno_id}`);if(!e.fecha)throw Error(`fecha es requerido para alumno ${e.alumno_id}`);return{sesion_clase_id:e.sesion_clase_id,clase_id:e.clase_id,alumno_id:e.alumno_id,fecha:e.fecha,estado:Wt(e.estado),justificacion_texto:(e.justificacion_texto||``).trim()||null,observaciones:(e.observaciones||``).trim()||null,...e.registrado_por?{registrado_por:e.registrado_por}:{}}}),{data:c,error:l}=await t.from(`asistencias`).upsert(s,{onConflict:`clase_id,alumno_id,fecha`}).select();if(l&&Kt(l)){console.warn(`[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:`,l.message);let{data:e,error:n}=await t.from(`asistencias`).insert(s,{returning:`representation`}).select();return n&&j(`No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)`,l),e||[]}return l&&j(`No se pudieron registrar las asistencias`,l),c}async function en({periodoId:e,fecha:n,claseId:r}={}){try{let i,a;if(e){let{data:n,error:r}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,e).single();r&&console.warn(`No se pudo cargar el período, mostrando todas las sesiones`,r),n&&(i=n.fecha_inicio,a=n.fecha_fin)}let o=t.from(`vw_asistencias_consolidada`).select(`
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
      `);i&&(o=o.gte(`fecha`,i)),a&&(o=o.lte(`fecha`,a)),n&&(o=o.eq(`fecha`,n)),r&&(o=o.eq(`clase_id`,r));let{data:s,error:c}=await o.order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});c&&j(`No se pudieron cargar las sesiones consolidadas`,c),Array.isArray(s)||(console.warn(`sesiones no es un array, usando array vacío`,s),s=[]),s=s.filter(e=>e.borrador===!1),console.log(`📊 Filtro de borradores: ${s.length} sesiones reales`),console.log(`📊 getReporteConsolidado DEBUG:`,{periodoId:e,sesionesCount:s.length,dataSource:`vw_asistencias_consolidada`,firstSesion:s[0]?{fecha:s[0].fecha,nombre_clase:s[0].nombre_clase,presentes:s[0].presentes,ausentes:s[0].ausentes,justificados:s[0].justificados}:`NO SESIONES`});let l={};s&&s.length>0&&s.forEach(e=>{let t={clase_id:e.clase_id,clase_nombre:e.nombre_clase,fecha:e.fecha,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,maestro_nombre:e.maestro_principal||`Sin asignar`,maestro_auxiliar_nombre:e.maestro_auxiliar||null,observacion_clase:e.observacion_clase||null,observacion_sesion:e.observacion_sesion||null,presentes:e.presentes||0,ausentes:e.ausentes||0,justificados:e.justificados||0,total_alumnos:e.total_registros||0,asistencias:e.asistencias_detalle?Array.isArray(e.asistencias_detalle)?e.asistencias_detalle:JSON.parse(e.asistencias_detalle||`[]`):[],justificaciones:e.justificaciones_detalle?Array.isArray(e.justificaciones_detalle)?e.justificaciones_detalle:JSON.parse(e.justificaciones_detalle||`[]`):[]};l[e.fecha]||(l[e.fecha]=[]),l[e.fecha].push(t)});let u=Object.entries(l).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,clases:t.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``))})),d=u.flatMap(e=>e.clases);return{timelineByDate:u,resumenGlobal:{totalClases:d.length,totalPresentes:d.reduce((e,t)=>e+t.presentes,0),totalAusentes:d.reduce((e,t)=>e+t.ausentes,0),totalJustificados:d.reduce((e,t)=>e+t.justificados,0),totalRegistros:d.reduce((e,t)=>e+t.total_alumnos,0),totalSesiones:s.length}}}catch(e){j(`Error en getReporteConsolidado`,e)}}var tn=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`],nn=/^([01]\d|2[0-3]):([0-5]\d)$/;function M(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function rn(e,t){let n=M(e.inicio),r=M(e.fin),i=M(t.inicio);return n<M(t.fin)&&i<r}function an(e,t){let n=[];for(let r=0;r<e.length;r++){let i=e[r];if(!nn.test(i.inicio)||!nn.test(i.fin)){n.push(`${t}: franja ${r+1} tiene formato de hora inválido (use HH:MM)`);continue}if(M(i.inicio)>=M(i.fin)){n.push(`${t}: franja ${r+1} — la hora de inicio (${i.inicio}) debe ser anterior a la de fin (${i.fin})`);continue}for(let a=r+1;a<e.length;a++)rn(i,e[a])&&n.push(`${t}: las franjas ${r+1} y ${a+1} se solapan`)}return n}function on(e){if(!e||typeof e!=`object`)return{valid:!1,errors:[`Disponibilidad debe ser un objeto`]};let t=[];for(let[n,r]of Object.entries(e)){if(!tn.includes(n)){t.push(`Día inválido: "${n}"`);continue}if(!Array.isArray(r)){t.push(`${n}: las franjas deben ser un array`);continue}let e=an(r,n);t.push(...e)}return{valid:t.length===0,errors:t}}async function sn(e,n){let r=on(n);if(!r.valid)return{success:!1,errors:r.errors};let{error:i}=await t.from(`maestros`).update({disponibilidad:n}).eq(`id`,e);return i?(console.error(`[DisponibilidadApi] Error updating:`,i.message),{success:!1,errors:[i.message]}):{success:!0}}async function cn(e){let n=t.from(`maestros`).select(`id, nombre_completo, especialidad, habilidades, disponibilidad`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});e?.length&&(n=n.in(`id`,e));let{data:r,error:i}=await n;if(i)throw console.error(`[DisponibilidadApi] Error fetching bulk:`,i.message),Error(`No se pudieron cargar las disponibilidades`);return r.map(e=>({id:e.id,nombre:e.nombre_completo||``,especialidad:e.especialidad||``,habilidades:Array.isArray(e.habilidades)?e.habilidades:[],disponibilidad:e.disponibilidad||{}}))}function ln(e){if(!e||!e.trim())return null;let t=e.replace(/\D/g,``);if(t.length<7)return null;let n=t;return n.length>11&&(n=n.startsWith(`1`)?n.slice(0,11):n.slice(0,10)),n.length===11&&n.startsWith(`1`)?`+`+n:n.length===10?`+1`+n:n}function N(e){if(!e||!e.trim())return`—`;let t=e.replace(/\D/g,``),n=t.length===11&&t.startsWith(`1`)?t.slice(1):t.length===10?t:null;return n?`(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`:e}function un(e,t=``){if(!e)return null;let n=e.replace(/\D/g,``);if(n.length<7)return null;let r=`https://wa.me/${n}`;return t?`${r}?text=${encodeURIComponent(t)}`:r}function dn(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`Fecha desconocida`}function fn(e){if(!e)return null;let t=new Date,n=new Date(e),r=t.getFullYear()-n.getFullYear(),i=t.getMonth()-n.getMonth();return(i<0||i===0&&t.getDate()<n.getDate())&&r--,r}function P(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function pn(e){return{M:`Masculino`,F:`Femenino`,O:`Otro`,N:`No binario`}[e?.toUpperCase()]||`No especificado`}function mn(e){return e?`bg-success`:`bg-secondary`}function hn(e){return e?`Activo`:`Inactivo`}function gn(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var F={alumnos:[],alumnosOriginales:[],cargando:!1,editando:null,viewingId:null,deletingId:null,filtroGenero:``,filtroEstado:`todos`},I=null,_n={nombreMax:100,emailMax:100,cedulaMax:20,telefonoMax:20,acudienteMax:100,direccionMax:255,sectionMax:100};async function vn(e){try{F.cargando=!0,yn(e);let t=await pt();F.alumnos=t,F.alumnosOriginales=[...t],F.cargando=!1,xn(e),wn(e)}catch(t){console.error(t),bn(e,t.message)}}function yn(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando alumnos...</p>
      </div>
    </div>
  `}function bn(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${P(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>vn(e))}function xn(e){e.innerHTML=`
    <div class="page-container">
      <div class="alumnos-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-people fs-4"></i>
          </div>
          <div>
            <h1 class="alumnos-title-premium mb-0">Alumnos</h1>
            <p class="text-muted small mb-0">${F.alumnos.length} alumnos en total</p>
          </div>
        </div>
        
        <div class="alumnos-header-actions">
          <button class="btn btn-outline-success btn-sm-compact me-2" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-premium-action" id="btnAgregarAlumno">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Alumno
          </button>
        </div>
      </div>

      <div class="alumnos-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar alumno..." id="buscar" autocomplete="off">
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
        <div class="list-group list-group-flush w-100" id="alumnosTBody">
          ${Sn(F.alumnos)}
        </div>
        <div id="emptyContainer">
          ${F.alumnos.length===0?Cn():``}
        </div>
      </div>

    </div>
  `}function Sn(e){return e.length?e.map(e=>{let t=e.nombre||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${gn(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${P(t)}</span>
            <small class="text-muted text-truncate">
              ${P(e.instrumento||`Sin instrumento especificado`)} ${e.familiar_nombre?`• Rep: ${P(e.familiar_nombre)}`:``}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-2 d-flex align-items-center justify-content-center" data-action="edit" data-id="${e.id}" title="Editar alumno" style="min-height: 32px; width: 32px;">
            <i class="bi bi-pencil-square"></i>
          </button>
          ${e.telefono?`
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="min-height: 32px;">
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${N(e.telefono)}</span>
            </button>
          `:`<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>`}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function Cn(){return`
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted mb-0">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
    </div>
  `}function wn(e){I=e,e.querySelector(`#btnAgregarAlumno`)?.addEventListener(`click`,()=>kn()),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>Pn()),e.querySelector(`#buscar`)?.addEventListener(`input`,L),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,L),e.querySelector(`#alumnosTBody`)?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){jn(t.dataset.id);return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id;n.dataset.action===`edit`?An(r):n.dataset.action===`delete`?Mn(r):n.dataset.action===`whatsapp`&&Tn(r)})}function Tn(e){let t=F.alumnosOriginales.find(t=>t.id===e);!t||!t.telefono||o.open({title:`Enviar WhatsApp a `+P(t.nombre),size:`md`,saveText:`Enviar WhatsApp`,body:`
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> ${N(t.telefono)}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,onSave:async e=>{let n=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=un(t.telefono,n);r&&window.open(r,`_blank`)}})}function L(){let e=I.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=I.querySelector(`#filtroEstado`)?.value||`todos`;F.alumnos=F.alumnosOriginales.filter(n=>{let r=!e||(n.nombre||``).toLowerCase().includes(e)||(n.instrumento||``).toLowerCase().includes(e)||(n.telefono||``).toLowerCase().includes(e)||(n.familiar_nombre||``).toLowerCase().includes(e),i=t===`todos`||t===`activo`&&n.is_active||t===`inactivo`&&!n.is_active;return r&&i}),Nn()}function En(e=``){return xt.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function Dn(e=null){let t=e||{};return`<form class="row g-2">
    <div class="col-12">
      <label class="form-label-compact">Nombre Completo *</label>
      <input type="text" class="form-control input-dense" id="modal-nombre" maxlength="${_n.nombreMax}" required placeholder="Juan Pérez" autocomplete="off" value="${P(t.nombre||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Teléfono (WhatsApp) *</label>
      <input type="tel" class="form-control input-dense" id="modal-telefono" required placeholder="+58 412 555 1234" autocomplete="off" value="${P(t.telefono||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Email</label>
      <input type="email" class="form-control input-dense" id="modal-email" maxlength="${_n.emailMax}" placeholder="representante@ejemplo.com" autocomplete="off" value="${P(t.email||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Cédula del Alumno</label>
      <input type="text" class="form-control input-dense" id="modal-cedula" maxlength="${_n.cedulaMax}" placeholder="12345678" autocomplete="off" value="${P(t.cedula||``)}">
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
      <input type="text" class="form-control input-dense" id="modal-instrumento" required maxlength="${_n.sectionMax}" placeholder="Violín, Piano..." autocomplete="off" value="${P(t.instrumento||``)}">
    </div>
    <div class="col-12">
      <label class="form-label-compact">Dirección</label>
      <input type="text" class="form-control input-dense" id="modal-direccion" maxlength="${_n.direccionMax}" placeholder="Dirección completa" autocomplete="off" value="${P(t.direccion||``)}">
    </div>
    
    <div class="col-12 mt-3">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-contacto-emergencia-nombre" placeholder="Nombre contacto" value="${P(t.contacto_emergencia_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-contacto-emergencia-telefono" placeholder="+58 412 555 1234" value="${P(t.contacto_emergencia_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-contacto-emergencia-parentesco">
              ${En(t.contacto_emergencia_parentesco)}
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
            <input type="text" class="form-control input-dense" id="modal-familiar-nombre" placeholder="Nombre familiar" value="${P(t.familiar_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-familiar-telefono-input" placeholder="+58 412 555 1234" value="${P(t.familiar_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-familiar-parentesco-input">
              ${En(t.familiar_parentesco)}
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
            <textarea class="form-control input-dense" id="modal-condiciones-medicas" rows="2" placeholder="Diabetes, epilepsia, etc.">${P(t.condiciones_medicas||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Alergias</label>
            <textarea class="form-control input-dense" id="modal-alergias" rows="2" placeholder="Alimentos, medicamentos, etc.">${P(t.alergias||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Medicamentos</label>
            <textarea class="form-control input-dense" id="modal-medicamentos" rows="2" placeholder="Medicamentos actuales">${P(t.medicamentos||``)}</textarea>
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
  </form>`}async function On(e,t=null){let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),a=e.querySelector(`#modal-telefono`).value.trim(),o=e.querySelector(`#modal-cedula`).value.trim(),s=e.querySelector(`#modal-fechaNacimiento`).value,c=e.querySelector(`#modal-genero`).value,l=e.querySelector(`#modal-instrumento`).value.trim(),u=e.querySelector(`#modal-familiar-nombre`).value.trim(),d=e.querySelector(`#modal-familiar-telefono-input`).value.trim()||a,f=e.querySelector(`#modal-familiar-parentesco-input`).value,p=e.querySelector(`#modal-esActivo`).checked;return n?l?a?{nombre:n,email:r||null,telefono:ln(a)||a,cedula:o||null,fecha_nacimiento:s||null,genero:c||null,instrumento:l,is_active:p,familiar_nombre:u||null,familiar_telefono:ln(d)||d||null,familiar_parentesco:f||null,contacto_emergencia_nombre:e.querySelector(`#modal-contacto-emergencia-nombre`).value.trim()||null,contacto_emergencia_telefono:ln(e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim())||e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim()||null,contacto_emergencia_parentesco:e.querySelector(`#modal-contacto-emergencia-parentesco`).value||null,condiciones_medicas:e.querySelector(`#modal-condiciones-medicas`).value.trim()||null,alergias:e.querySelector(`#modal-alergias`).value.trim()||null,medicamentos:e.querySelector(`#modal-medicamentos`).value.trim()||null}:(i.error(`El teléfono es obligatorio para WhatsApp`),null):(i.error(`El instrumento es obligatorio`),null):(i.error(`El nombre es obligatorio`),null)}function kn(){F.editando=null,o.open({title:`Crear Nuevo Alumno`,size:`lg`,body:Dn(),saveText:`Guardar`,onSave:async e=>{let t=await On(e);if(!t)return!1;let n=await ht(t);F.alumnosOriginales.push(n),L(),i.success(`Alumno creado exitosamente`)}})}function An(e){let t=F.alumnosOriginales.find(t=>t.id===e);if(!t){i.error(`Alumno no encontrado`);return}F.editando=e,o.open({title:`Editar Alumno`,size:`lg`,body:Dn(t),saveText:`Guardar cambios`,onSave:async e=>{try{let n=await On(e,t);if(!n)return!1;await gt(F.editando,n);let r=F.alumnosOriginales.findIndex(e=>e.id===F.editando);r!==-1&&(F.alumnosOriginales[r]={...F.alumnosOriginales[r],...n}),L(),i.success(`Alumno actualizado correctamente`)}catch(e){return console.error(`[alumnosView] Error al actualizar alumno:`,e),i.error(e.message||`Error al guardar los cambios`),!1}}})}function jn(e){let t=F.alumnosOriginales.find(t=>t.id===e);if(!t){i.error(`Alumno no encontrado`);return}F.viewingId=e,o.open({title:P(t.nombre),hideSave:!0,cancelText:`Cerrar`,size:`lg`,body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${P(t.nombre)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${t.email?`<a href="mailto:${P(t.email)}">${P(t.email)}</a>`:`-`}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Cédula</label>
            <p class="form-control-plaintext">${P(t.cedula||`-`)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Edad</label>
            <p class="form-control-plaintext">${fn(t.fecha_nacimiento)?fn(t.fecha_nacimiento)+` años`:`-`}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Género</label>
            <p class="form-control-plaintext">${pn(t.genero)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${P(t.instrumento||`-`)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${mn(t.is_active)}">
                ${hn(t.is_active)}
              </span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Familiar/Representante</label>
            <p class="form-control-plaintext">${P(t.familiar_nombre||`-`)}</p>
          </div>
          ${t.telefono?`
            <div class="mb-2">
              <label class="form-label fw-bold">Teléfono (WhatsApp)</label>
              <p class="form-control-plaintext"><a href="${un(t.telefono)}" target="_blank" class="text-success text-decoration-none"><i class="bi bi-whatsapp"></i> ${N(t.telefono)}</a></p>
            </div>
          `:``}
        </div>
        <div class="col-md-6">
          ${t.email?`
            <div class="mb-2">
              <label class="form-label fw-bold">Email</label>
              <p class="form-control-plaintext"><a href="mailto:${P(t.email)}">${P(t.email)}</a></p>
            </div>
          `:``}
          ${t.direccion?`
            <div class="mb-2">
              <label class="form-label fw-bold">Dirección</label>
              <p class="form-control-plaintext">${P(t.direccion)}</p>
            </div>
          `:``}
        </div>
      </div>
      
      ${t.contacto_emergencia_nombre||t.contacto_emergencia_telefono?`
      <hr>
      <div class="row">
        <div class="col-12">
          <h6 class="text-info"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${P(t.contacto_emergencia_nombre||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${t.contacto_emergencia_telefono?`<a href="tel:${t.contacto_emergencia_telefono}">${N(t.contacto_emergencia_telefono)}</a>`:`-`}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Parentesco</label>
            <p class="form-control-plaintext">${St(t.contacto_emergencia_parentesco)}</p>
          </div>
        </div>
      </div>
      `:``}

      ${t.familiar_nombre||t.familiar_telefono?`
      <div class="row">
        <div class="col-12">
          <h6 class="text-primary"><i class="bi bi-people me-1"></i>Datos del Familiar</h6>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${P(t.familiar_nombre||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${t.familiar_telefono?`<a href="tel:${t.familiar_telefono}">${N(t.familiar_telefono)}</a>`:`-`}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Parentesco</label>
            <p class="form-control-plaintext">${St(t.familiar_parentesco)}</p>
          </div>
        </div>
      </div>
      `:``}

      ${t.condiciones_medicas||t.alergias||t.medicamentos?`
      <div class="row">
        <div class="col-12">
          <h6 class="text-warning"><i class="bi bi-heart-pulse me-1"></i>Información Médica</h6>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Condiciones</label>
            <p class="form-control-plaintext">${P(t.condiciones_medicas||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Alergias</label>
            <p class="form-control-plaintext">${P(t.alergias||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Medicamentos</label>
            <p class="form-control-plaintext">${P(t.medicamentos||`-`)}</p>
          </div>
        </div>
      </div>
      `:``}

      <div class="row mt-2 pt-2 border-top">
        <div class="col-6">
          <label class="form-label fw-bold">Creado</label>
          <p class="form-control-plaintext small">${dn(t.created_at)}</p>
        </div>
        <div class="col-6">
          <label class="form-label fw-bold">Última actualización</label>
          <p class="form-control-plaintext small">${dn(t.updated_at)}</p>
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Eliminar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar Perfil
        </button>
      </div>
    `,onShow:e=>{e.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>An(t.id),300)}),e.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>Mn(t.id),300)})}})}function Mn(e){let t=F.alumnosOriginales.find(t=>t.id===e);if(!t){i.error(`Alumno no encontrado`);return}F.deletingId=e,o.open({title:`⚠️ Eliminar Alumno`,size:`md`,saveText:`Eliminar`,body:`<div class="d-flex flex-column align-items-center justify-content-center py-5">
             <div class="spinner-border text-primary mb-3" role="status">
               <span class="visually-hidden">Cargando...</span>
             </div>
             <p class="text-muted mb-0">Analizando estado de inscripciones...</p>
           </div>`,onSave:async()=>{await _t(e),F.alumnosOriginales=F.alumnosOriginales.filter(t=>t.id!==e),L(),o.close(),i.success(`Alumno eliminado correctamente`)}});let n=document.querySelector(`#app-global-modal .app-modal-btn-save`);n&&(n.style.display=`none`),setTimeout(async()=>{try{if(F.deletingId!==e)return;let r=await bt(e),i=document.querySelector(`#app-global-modal .app-modal-body`);if(!i||F.deletingId!==e)return;n&&(n.style.display=``),r.length===0?i.innerHTML=`
          <div class="alert alert-success d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(40, 167, 69, 0.08); color: #155724;">
            <i class="bi bi-person-check-fill fs-3 text-success mt-1"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1" style="color: #0f6826;">Contacto Huérfano / Eliminación Segura</h6>
              <p class="mb-0 small" style="opacity: 0.9;">Este alumno no posee matrículas registradas ni está inscrito en ninguna clase activa en el período actual. Su eliminación no afectará datos académicos.</p>
            </div>
          </div>
          <p class="mb-2">¿Estás seguro de que querés eliminar permanentemente al alumno <strong>${P(t.nombre)}</strong>?</p>
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
            <span class="fw-semibold text-dark" style="font-size: 0.9rem;">${P(e.clase_nombre)}</span>
          </li>
        `).join(``)}
              </ul>
              <p class="mb-0 small fw-bold mt-2"><i class="bi bi-slash-circle-fill me-1"></i> ADVERTENCIA CRÍTICA: Eliminar a este alumno borrará físicamente su registro de asistencia, calificaciones históricas y matrículas activas.</p>
            </div>
          </div>
          <p class="mb-2">¿Realmente querés eliminar permanentemente al alumno <strong>${P(t.nombre)}</strong> y todos sus registros?</p>
          <p class="text-muted small mb-0"><i class="bi bi-exclamation-octagon-fill text-danger me-1"></i> Esta acción no se puede deshacer y puede provocar inconsistencias en los reportes de estas clases.</p>
        `}catch(r){if(console.error(r),F.deletingId!==e)return;let i=document.querySelector(`#app-global-modal .app-modal-body`);i&&(n&&(n.style.display=``),i.innerHTML=`
          <div class="alert alert-warning d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1">Error de Verificación</h6>
              <p class="mb-0 small">No se pudo comprobar si el alumno tiene clases activas. Procedé con precaución.</p>
            </div>
          </div>
          <p>¿Querés eliminar al alumno <strong>${P(t.nombre)}</strong> de todas formas?</p>
        `)}},300)}function Nn(){let e=I.querySelector(`#alumnosTBody`);if(!e)return;F.alumnos.length===0?e.innerHTML=Cn():e.innerHTML=Sn(F.alumnos);let t=I.querySelector(`#emptyContainer`);t&&(t.innerHTML=F.alumnos.length===0?Cn():``);let n=I.querySelector(`.alumnos-header-premium p.text-muted`);n&&(n.textContent=`${F.alumnos.length} alumnos en total`)}function Pn(){if(F.alumnosOriginales.length===0){i.error(`No hay alumnos para exportar`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Estado`,`Fecha Nac.`,`Sección`],...F.alumnosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.estado||`activo`,e.fecha_nacimiento||``,e.section||``])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`alumnos-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),i.success(`CSV exportado exitosamente`)}var R=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.descripcion=e.descripcion||``,this.nivel=e.nivel||``,this.duracion_anios=e.duracion_anios||null,this.activo=e.activo===void 0?!0:e.activo,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(e=[]){let t=[];return!this.nombre||!this.nombre.trim()?t.push(`El nombre del programa es obligatorio`):this.nombre.length>100&&t.push(`El nombre no puede exceder los 100 caracteres`),this.nivel?e.length>0&&!e.includes(this.nivel)&&t.push(`El nivel seleccionado no es válido`):t.push(`El nivel es obligatorio`),this.descripcion&&this.descripcion.length>500&&t.push(`La descripción no puede exceder los 500 caracteres`),this.duracion_anios!==null&&(isNaN(this.duracion_anios)||this.duracion_anios<0)&&t.push(`La duración debe ser un número positivo`),t}toJSON(){return{nombre:this.nombre.trim(),descripcion:this.descripcion?this.descripcion.trim():``,nivel:this.nivel,duracion_anios:this.duracion_anios,activo:this.activo}}},Fn=[{value:``,label:`Sin nivel específico`},{value:`1`,label:`1° Año`},{value:`2`,label:`2° Año`},{value:`3`,label:`3° Año`},{value:`4`,label:`4° Año`},{value:`5`,label:`5° Año`},{value:`6`,label:`6° Año`},{value:`inicial`,label:`Nivel Inicial`},{value:`intermedio`,label:`Nivel Intermedio`},{value:`avanzado`,label:`Nivel Avanzado`},{value:`preuniversitario`,label:`Pre-Universitario`}];function In(e){let t=Fn.find(t=>t.value===e);return t?t.label:e||`-`}async function Ln(){let{data:e,error:n}=await t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando programas:`,n.message),n;return(e||[]).map(e=>new R(e))}async function Rn(e){let n=new R(e),r=Fn.map(e=>e.value).filter(Boolean),i=n.validate(r);if(i.length>0)throw Error(i.join(`. `));let{data:a,error:o}=await t.from(`programas`).insert([n.toJSON()]).select();if(o)throw console.error(`Error creando programa:`,o.message),o;return new R(a[0])}async function zn(e,n){let r=new R(n),i=Fn.map(e=>e.value).filter(Boolean),a=r.validate(i);if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`programas`).update(r.toJSON()).eq(`id`,e).select();if(s)throw console.error(`Error actualizando programa:`,s.message),s;return new R(o[0])}async function Bn(e){let{error:n}=await t.from(`programas`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando programa:`,n.message),n}async function Vn(e){let{jsPDF:t}=await a(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-DjkFa24L.js`);return{jsPDF:e}},__vite__mapDeps([0,1,2,3])),{default:n}=await a(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BzE1EGzy.js`);return{default:e}},[]),r=new t;r.setFontSize(18),r.text(`Programas Académicos`,14,22),r.setFontSize(10),r.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,30),n(r,{head:[[`Nombre`,`Nivel`,`Descripción`,`Estado`,`Creado`]],body:e.map(e=>[e.nombre,In(e.nivel),e.descripcion?e.descripcion.substring(0,50)+(e.descripcion.length>50?`...`:``):`-`,e.activo?`Activo`:`Inactivo`,e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`):`-`]),startY:35,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),r.save(`programas.pdf`)}var z={programas:[],programasOriginales:[],cargando:!1},Hn={nombreMax:100,descripcionMax:500};function B(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function Un(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`N/A`}function Wn(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function Gn(e=``){return Fn.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}async function Kn(e){try{z.cargando=!0,qn(e);let t=await Ln();z.programas=t,z.programasOriginales=[...t],z.cargando=!1,Yn(e),Qn(e)}catch(t){console.error(`[ProgramasView]`,t),Jn(e,t.message)}}function qn(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando programas...</p>
      </div>
    </div>
  `}function Jn(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${B(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>Kn(e))}function Yn(e){e.innerHTML=`
    <div class="page-container">
      <div class="programas-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-journal-bookmark fs-4"></i>
          </div>
          <div>
            <h1 class="programas-title-premium page-title mb-0">Programas</h1>
            <p class="text-muted small mb-0">${z.programas.length} programas en total</p>
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
          ${Xn(z.programas)}
        </div>
        <div id="emptyContainer">
          ${z.programas.length===0?Zn():``}
        </div>
      </div>
    </div>
  `}function Xn(e){return e.length?e.map(e=>{let t=Wn(e.nombre),n=In(e.nivel),r=B(e.descripcion||`Sin descripción`),i=`border-accent-${e.activo?`success`:`secondary`}`,a=`bg-${e.activo?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${t}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${B(e.nombre)}</span>
            <small class="text-muted text-truncate">${n} • ${r.substring(0,50)}${r.length>50?`...`:``}</small>
          </div>
        </div>
        <div class="flex-shrink-0 text-muted ms-2 pe-1">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function Zn(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No hay programas que coincidan con la búsqueda.</p>
    </div>
  `}var V=null;function Qn(e){V=e,e.querySelector(`#btnAgregarPrograma`)?.addEventListener(`click`,()=>tr()),e.querySelector(`#btnExportarPDF`)?.addEventListener(`click`,async()=>{try{await Vn(z.programas),i.success(`PDF generado exitosamente`)}catch{i.error(`Error al generar PDF`)}}),e.querySelector(`#buscar`)?.addEventListener(`input`,$n),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,$n),e.querySelector(`#programasTBody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t){let t=e.target.closest(`.list-group-item[data-id]`);t&&ir(t.dataset.id);return}let{action:n,id:r}=t.dataset;n===`edit`&&nr(r),n===`delete`&&ar(r)})}function $n(){let e=V.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=V.querySelector(`#filtroEstado`)?.value||`todos`;z.programas=z.programasOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||(n.descripcion||``).toLowerCase().includes(e),i=t===`todos`||t===`activo`&&n.activo||t===`inactivo`&&!n.activo;return r&&i}),er()}function er(){let e=V.querySelector(`#programasTBody`);e&&(e.innerHTML=Xn(z.programas));let t=V.querySelector(`#emptyContainer`);t&&(t.innerHTML=z.programas.length===0?Zn():``)}function tr(){rr({title:`Nuevo Programa`,saveText:`Crear Programa`})}function nr(e){let t=z.programasOriginales.find(t=>t.id===e);if(!t)return i.error(`Programa no encontrado`);rr({title:`Editar Programa`,saveText:`Guardar Cambios`,programa:t})}function rr({title:e,saveText:t,programa:n=null}){o.open({title:e,saveText:t,body:`
      <form id="form-programa" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Nombre del Programa *</label>
          <input type="text" class="form-control input-dense" id="prog-nombre" required maxlength="${Hn.nombreMax}" value="${B(n?.nombre||``)}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Nivel / Año *</label>
          <select class="form-select input-dense" id="prog-nivel">
            ${Gn(n?.nivel||``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Duración (años)</label>
          <input type="number" class="form-control input-dense" id="prog-duracion" min="0" step="0.5" value="${n?.duracion_anios||``}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción</label>
          <textarea class="form-control input-dense" id="prog-descripcion" rows="3" maxlength="${Hn.descripcionMax}">${B(n?.descripcion||``)}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="prog-activo" ${n?.activo===!1?``:`checked`}>
            <label class="form-check-label" for="prog-activo">Programa Activo</label>
          </div>
        </div>
      </form>
    `,onSave:async e=>{let t={nombre:e.querySelector(`#prog-nombre`).value.trim(),nivel:e.querySelector(`#prog-nivel`).value,duracion_anios:e.querySelector(`#prog-duracion`).value?parseFloat(e.querySelector(`#prog-duracion`).value):null,descripcion:e.querySelector(`#prog-descripcion`).value.trim(),activo:e.querySelector(`#prog-activo`).checked},r=new R(t),a=Fn.map(e=>e.value).filter(Boolean),o=r.validate(a);if(o.length>0)return i.error(o[0]),!1;try{if(n){let e=await zn(n.id,t),r=z.programasOriginales.findIndex(e=>e.id===n.id);z.programasOriginales[r]=e,i.success(`Programa actualizado`)}else{let e=await Rn(t);z.programasOriginales.unshift(e),i.success(`Programa creado`)}return $n(),!0}catch(e){return i.error(e.message),!1}}})}function ir(e){let t=z.programasOriginales.find(t=>t.id===e);t&&o.open({title:`Perfil del Programa`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="programa-profile">
        <!-- Header Banner / Avatar Section -->
        <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
          <div class="position-relative" style="flex-shrink: 0;">
            <div class="avatar-large bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center fw-bold" 
                 style="width: 60px; height: 60px; font-size: 1.6rem; border-radius: 50%;">
              ${Wn(t.nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 bg-${t.activo?`success`:`danger`} border border-light rounded-circle" 
                  style="transform: translate(10%, 10%);"
                  title="${t.activo?`Activo`:`Inactivo`}">
            </span>
          </div>
          <div class="overflow-hidden">
            <h4 class="h5 mb-1 fw-bold text-truncate" style="letter-spacing: -0.01em;">${B(t.nombre)}</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">${In(t.nivel)}</span>
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
                ${B(t.descripcion||`Sin descripción detallada.`)}
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
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${Un(t.created_at)}</p>
                </div>
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-event me-1"></i> Modificado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${t.updated_at?Un(t.updated_at):Un(t.created_at)}</p>
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
    `,onShow:n=>{n.querySelector(`#view-edit-btn`).addEventListener(`click`,()=>{o.close(),setTimeout(()=>nr(e),300)}),n.querySelector(`#view-delete-btn`).addEventListener(`click`,()=>{o.close(),setTimeout(()=>ar(e),300)}),n.querySelector(`#copy-id-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(t.id),i.success(`ID copiado al portapapeles`)})}})}function ar(e){let t=z.programasOriginales.find(t=>t.id===e);t&&o.open({title:`⚠️ Eliminar Programa`,saveText:`Confirmar Eliminación`,body:`
      <p>¿Estás seguro de eliminar el programa <strong>${B(t.nombre)}</strong>?</p>
      <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Esta acción no se puede deshacer.</p>
    `,onSave:async()=>{try{return await Bn(e),z.programasOriginales=z.programasOriginales.filter(t=>t.id!==e),$n(),i.success(`Programa eliminado`),!0}catch{return i.error(`Error al eliminar`),!1}}})}function or(e){return e?{...e,user_id:e.user_id??null,nombre:e.nombre_completo??``,email:e.correo??``,telefono:e.tlf??``,instrumento:e.especialidad??``,bio:e.resena??``,is_active:e.activo??!0,especialidades:Array.isArray(e.especialidades)?e.especialidades:[]}:null}async function sr(){let{data:e,error:n}=await t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0});if(n)throw console.error(`Error cargando maestros:`,n.message),Error(`No se pudieron cargar los maestros`);return e.map(or)}async function cr(e){let n=(e.nombre||e.nombre_completo||``).trim();if(!n)throw Error(`El nombre es obligatorio`);let r={nombre_completo:n,correo:(e.email||e.correo||``).trim().toLowerCase()||null,tlf:(e.telefono||e.tlf||``).trim()||null,especialidad:(e.instrumento||e.especialidad||``).trim()||null,resena:(e.bio||e.resena||``).trim()||null,activo:e.is_active===void 0?e.activo===void 0?!0:e.activo:e.is_active,especialidades:Array.isArray(e.especialidades)?e.especialidades:[],user_id:e.user_id||null},{data:i,error:a}=await t.from(`maestros`).insert([r]).select();if(a)throw console.error(`Error creando maestro:`,a.message),Error(`No se pudo crear el maestro`);return or(i[0])}async function lr(e,n){let r={},i=n.nombre||n.nombre_completo;i!==void 0&&(r.nombre_completo=i.trim());let a=n.email||n.correo;a!==void 0&&(r.correo=a.trim().toLowerCase());let o=n.telefono||n.tlf;o!==void 0&&(r.tlf=o.trim());let s=n.instrumento||n.especialidad;s!==void 0&&(r.especialidad=s.trim());let c=n.bio||n.resena;c!==void 0&&(r.resena=c.trim()),n.is_active!==void 0&&(r.activo=n.is_active),n.activo!==void 0&&(r.activo=n.activo),n.especialidades!==void 0&&(r.especialidades=Array.isArray(n.especialidades)?n.especialidades:[]);let{data:l,error:u}=await t.from(`maestros`).update(r).eq(`id`,e).select();if(u)throw console.error(`Error actualizando maestro:`,u.message),Error(`No se pudo actualizar el maestro`);return or(l[0])}async function ur(e){let{error:n}=await t.from(`maestros`).update({activo:!1}).eq(`id`,e);if(n)throw console.error(`Error inactivando maestro:`,n.message),Error(`No se pudo desactivar el maestro`)}async function dr(e){let{error:n}=await t.from(`maestros`).update({activo:!0}).eq(`id`,e);if(n)throw console.error(`Error activando maestro:`,n.message),Error(`No se pudo activar el maestro`)}async function fr(e){let{data:n,error:r}=await t.from(`maestros`).select(`id`).eq(`correo`,e.trim().toLowerCase()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando email:`,r.message),!!n}function H(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function pr(e){return e?`success`:`secondary`}function mr(e){return e?`Activo`:`Inactivo`}function hr(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var U={maestros:[],salones:[],programas:[],alumnos:[],onSuccess:null},gr={nombreMax:100,notasMax:500};async function _r(e=null,t={}){U={...U,...t};let n=!!e,r=[],a=[];if(n){i.info(`Cargando datos de la clase...`);let t=await u(e.id);r=(t||[]).map(e=>e.alumno_id),a=t||[]}let s=n?`Editar Clase: ${e.nombre}`:`Nueva Clase`,c=n?`Guardar Cambios`:`Crear Clase`;o.open({title:s,saveText:c,size:`lg`,body:vr(e,r,a),onShow:t=>{br(t,e)},onSave:async t=>await xr(t,e)})}function vr(e,t,n=[]){return`
    <form class="row g-3" id="formClase">
      <div class="col-md-6">
        <label class="form-label-compact">Nombre de la Clase *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ej: Violín Básico A" value="${f(e?.nombre||``)}" maxlength="${gr.nombreMax}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar..." value="${f(e?.instrumento||``)}">
        ${Er()}
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Programa *</label>
        <select class="form-select input-dense" id="modal-programa_id" required>
          ${wr(e?.programa_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro Titular *</label>
        <select class="form-select input-dense" id="modal-maestro_id" required>
          ${Sr(e?.maestro_principal_id)}
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
          ${Sr(e?.maestro_suplente_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. Alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${e?.capacidad_maxima||20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${Tr(e?.estado||`activa`)}
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
          ${Or(e?.horarios||[])}
        </div>
      </div>

      <div class="col-12">
        <label class="form-label-compact">Notas Pedagógicas</label>
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Observaciones sobre el grupo o metodología..." maxlength="${gr.notasMax}">${f(e?.descripcion||``)}</textarea>
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-grupal" style="display:${e?.tipo_clase===`rotativa`?`none`:`block`}">
        <label class="form-label-compact mb-2"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
        ${kr(t)}
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-rotativa" style="display:${e?.tipo_clase===`rotativa`?`block`:`none`}">
        <label class="form-label-compact mb-2"><i class="bi bi-person-lines-fill me-1"></i>Turnos individuales</label>
        ${yr(n)}
      </div>
    </form>
  `}function yr(e=[]){let t=U.alumnos||[],n=(e=``,n=``,r=``)=>(t.find(t=>t.id===e),`
      <div class="slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary">
        <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
          <option value="">Seleccionar alumno…</option>
          ${t.map(t=>`
            <option value="${t.id}" ${t.id===e?`selected`:``}>
              ${f(t.nombre_completo)}${t.instrumento_principal?` — ${f(t.instrumento_principal)}`:``}
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
    </div>`}function br(e,t){let n=e.querySelector(`#modal-tiene_suplente`),r=e.querySelector(`#modal-maestro_suplente_id`);n&&r&&n.addEventListener(`change`,e=>{r.style.display=e.target.checked?`block`:`none`,e.target.checked||(r.value=``)}),e.querySelector(`#btn-add-horario`).addEventListener(`click`,()=>{let t=e.querySelector(`#modal-horarios-container`),n=t.children.length,r=document.createElement(`div`);r.innerHTML=Dr(null,n),t.appendChild(r.firstElementChild)}),e.querySelector(`#modal-horarios-container`).addEventListener(`click`,t=>{let n=t.target.closest(`.btn-remove-horario`);n&&(e.querySelector(`#modal-horarios-container`).children.length>1?n.closest(`.horario-row`).remove():i.warning(`La clase debe tener al menos un horario`))});let a=e.querySelector(`#seccion-alumnos-grupal`),o=e.querySelector(`#seccion-alumnos-rotativa`);e.querySelectorAll(`input[name="modal-tipo_clase"]`).forEach(t=>{t.addEventListener(`change`,()=>{let t=e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value===`rotativa`;a.style.display=t?`none`:`block`,o.style.display=t?`block`:`none`})});let s=e.querySelector(`#slots-container`),c=e.querySelector(`#slots-count`),l=()=>{let e=s.querySelectorAll(`.slot-row`).length;c.textContent=`${e} turno${e===1?``:`s`} asignado${e===1?``:`s`}`};e.querySelector(`#btn-add-slot`)?.addEventListener(`click`,()=>{let e=U.alumnos||[],t=document.createElement(`div`);t.innerHTML=(yr([]).split(`id="slots-container"`)[1],``);let n=document.createElement(`div`);n.className=`slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary`,n.innerHTML=`
      <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
        <option value="">Seleccionar alumno…</option>
        ${e.map(e=>`<option value="${e.id}">${f(e.nombre_completo)}${e.instrumento_principal?` — ${f(e.instrumento_principal)}`:``}</option>`).join(``)}
      </select>
      <div class="d-flex align-items-center gap-1 flex-shrink-0">
        <input type="time" class="form-control form-control-sm slot-hora-inicio" style="width:110px;" required title="Hora inicio">
        <span class="text-muted small">–</span>
        <input type="time" class="form-control form-control-sm slot-hora-fin" style="width:110px;" required title="Hora fin">
      </div>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
        <i class="bi bi-x-circle-fill fs-5"></i>
      </button>`,s.appendChild(n),l()}),s?.addEventListener(`click`,e=>{if(e.target.closest(`.btn-remove-slot`)){if(s.querySelectorAll(`.slot-row`).length<=1){i.warning(`Debe haber al menos un turno en una clase rotativa`);return}e.target.closest(`.slot-row`).remove(),l()}});let u=e.querySelector(`#search-modal-alumnos`),d=e.querySelectorAll(`.alumno-check-item`);u?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();d.forEach(e=>{let n=e.dataset.nombre.includes(t)||e.dataset.instrumento.includes(t);e.style.display=n?`block`:`none`})});let p=e.querySelectorAll(`.alumnos-list input[type="checkbox"]`),m=e.querySelector(`#alumnos-selection-count`),h=()=>{let e=Array.from(p).filter(e=>e.checked).length;m&&(m.textContent=`${e} alumnos seleccionados`)};p.forEach(e=>e.addEventListener(`change`,h)),h()}async function xr(e,t){let n=!!t,r=(()=>{let t=e.querySelector(`#modal-maestro_suplente_id`).value,n=e.querySelector(`#modal-tiene_suplente`).checked;return{nombre:e.querySelector(`#modal-nombre`).value.trim(),programa_id:e.querySelector(`#modal-programa_id`).value,maestro_principal_id:e.querySelector(`#modal-maestro_id`).value,maestro_suplente_id:n?t:null,tiene_suplente:n,instrumento:e.querySelector(`#modal-instrumento`).value.trim(),capacidad_maxima:parseInt(e.querySelector(`#modal-max_alumnos`).value)||20,estado:e.querySelector(`#modal-estado`).value,tipo_clase:e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value||`grupal`,descripcion:e.querySelector(`#modal-notas_pedagogicas`).value.trim(),horarios:Array.from(e.querySelectorAll(`.horario-row`)).map(e=>({dia:e.querySelector(`[name="horario-dia"]`).value,hora_inicio:e.querySelector(`[name="horario-hora_inicio"]`).value,hora_fin:e.querySelector(`[name="horario-hora_fin"]`).value,salon_id:e.querySelector(`[name="horario-salon_id"]`).value||null}))}})(),a=new d(r).validate();if(a.length>0)return i.error(a[0]),!1;let o=()=>Array.from(e.querySelectorAll(`#slots-container .slot-row`)).map(e=>({alumno_id:e.querySelector(`.slot-alumno-select`).value,hora_inicio:e.querySelector(`.slot-hora-inicio`).value,hora_fin:e.querySelector(`.slot-hora-fin`).value})).filter(e=>e.alumno_id),s=async t=>{let n=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value),r=(await u(t)).map(e=>e.alumno_id),i=n.filter(e=>!r.includes(e)),a=r.filter(e=>!n.includes(e));await Promise.all([...i.map(e=>_(t,e)),...a.map(e=>l(t,e))])},c=async e=>{let t=o();if(t.length===0)return i.warning(`Agregá al menos un turno`),!1;if(t.find(e=>!e.hora_inicio||!e.hora_fin))return i.error(`Todos los turnos deben tener hora de inicio y fin`),!1;let n=(await u(e)).map(e=>e.alumno_id),r=t.map(e=>e.alumno_id),a=n.filter(e=>!r.includes(e));return await Promise.all(a.map(t=>l(e,t))),await Promise.all(t.map(t=>n.includes(t.alumno_id)?te(e,t.alumno_id,t.hora_inicio,t.hora_fin):_(e,t.alumno_id,t.hora_inicio,t.hora_fin))),!0};try{let a;if(n)if(a=await ie(t.id,r),r.tipo_clase===`rotativa`){if(!await c(a.id))return!1}else await s(a.id);else if(a=await h(r),r.tipo_clase===`rotativa`){if(!await c(a.id))return!1}else{let t=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value);t.length>0&&await Promise.all(t.map(e=>_(a.id,e)))}return i.success(n?`Clase actualizada`:`Clase creada`),U.onSuccess&&U.onSuccess(),!0}catch(e){return e.isConflict?i.warning(`Conflicto detected: ${e.message}`):i.error(e.message),!1}}function Sr(e=``){return`<option value="">Seleccionar maestro...</option>`+U.maestros.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${f(t.nombre_completo||t.nombre)}</option>`).join(``)}function Cr(e=``){return`<option value="">Sin salón (Online/Otro)</option>`+U.salones.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${f(t.nombre)}</option>`).join(``)}function wr(e=``){return`<option value="">Seleccionar programa...</option>`+U.programas.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${f(t.nombre)}</option>`).join(``)}function Tr(e=`activa`){return d.getEstados().map(t=>`<option value="${t}" ${t===e?`selected`:``}>${d.getEstadoLabel(t)}</option>`).join(``)}function Er(){return`<datalist id="instrumentos-list">${[`Violín`,`Viola`,`Cello`,`Piano`,`Flauta`,`Teoría`,`Coro`].map(e=>`<option value="${e}">`).join(``)}</datalist>`}function Dr(e,t){return`
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
            ${Cr(e?.salon_id)}
          </select>
        </div>
      </div>
    </div>
  `}function Or(e=[]){return e.length===0?Dr(null,0):e.map((e,t)=>Dr(e,t)).join(``)}function kr(e=[]){return`
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
              ${f(t.nombre_completo)} <span class="text-muted">(${f(t.instrumento_principal||`N/A`)})</span>
            </label>
          </div>
        `).join(``)}
      </div>
      <div class="text-end mt-1"><small class="text-muted" id="alumnos-selection-count">0 seleccionados</small></div>
    </div>
  `}var Ar=`app-help-panel`,jr=`app-help-overlay`,Mr=!1;function Nr(){if(Mr)return;Mr=!0;let e=document.createElement(`style`);e.id=`app-help-panel-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Pr(){if(document.getElementById(Ar))return;Nr();let e=document.createElement(`div`);e.id=jr,document.body.appendChild(e);let t=document.createElement(`div`);t.id=Ar,t.setAttribute(`role`,`complementary`),t.setAttribute(`aria-label`,`Ayuda`),t.innerHTML=`
    <div id="ahp-header">
      <div id="ahp-badge"><i class="bi bi-question"></i></div>
      <span id="ahp-title">Ayuda</span>
      <button id="ahp-close" aria-label="Cerrar">
        <i class="bi bi-x" style="font-size:1.1rem;"></i>
      </button>
    </div>
    <div id="ahp-body"></div>
  `,document.body.appendChild(t),e.addEventListener(`click`,()=>W.close()),t.querySelector(`#ahp-close`).addEventListener(`click`,()=>W.close()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&W.close()})}var W={open({title:e,intro:t,sections:n=[]}){Pr();let r=document.getElementById(Ar),i=document.getElementById(jr);document.getElementById(`ahp-title`).textContent=e||`Ayuda`,document.getElementById(`ahp-body`).innerHTML=`
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
    `,i.style.display=`block`,requestAnimationFrame(()=>{i.classList.add(`hp-visible`),r.classList.add(`hp-visible`)})},close(){let e=document.getElementById(Ar),t=document.getElementById(jr);!e||!e.classList.contains(`hp-visible`)||(e.classList.remove(`hp-visible`),t.classList.remove(`hp-visible`),setTimeout(()=>{t&&(t.style.display=`none`)},280))}},G={maestros:[],maestrosOriginales:[],editando:null,deletingId:null},Fr={nombreMax:100},K=null,Ir=[`Piano`,`Guitarra`,`Violín`,`Viola`,`Cello`,`Contrabajo`,`Flauta`,`Clarinete`,`Oboe`,`Fagot`,`Saxofón`,`Trompeta`,`Trombón`,`Corno`,`Tuba`,`Percusión`,`Batería`,`Canto`,`Teoría`,`Solfeo`,`Dirección`,`Composición`,`Arreglos`];async function Lr(e){try{Rr(e);let t=await sr();G.maestros=t,G.maestrosOriginales=[...t],Ur(e),Gr(e)}catch(t){console.error(t),zr(e,t.message)}}function Rr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
      </div>
    </div>
  `}function zr(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${H(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>Lr(e))}function Br(e=[],t=`modal-especialidades-input`){return`
    <div class="mb-3">
      <label class="form-label-compact">Especialidades</label>
      <div class="especialidades-chips-container" id="modal-especialidades-container">
        <div class="chips-wrapper d-flex flex-wrap gap-1 mb-2">
          ${e.map(e=>`
            <span class="badge bg-primary-subtle text-primary rounded-pill chip-item">
              ${H(e)}
              <i class="bi bi-x-lg chip-remove" data-especialidad="${H(e)}" style="cursor:pointer;margin-left:4px;"></i>
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
            ${Ir.slice(0,8).map(e=>`
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${H(e)}">${H(e)}</button>
            `).join(`, `)}
          </div>
        </div>
      </div>
    </div>
  `}function Vr(e){let t=e.querySelector(`.especialidades-chips-container`);if(!t)return[];let n=t.querySelectorAll(`.chip-item`);return Array.from(n).map(e=>e.textContent.replace(/×$/,``).trim())}function Hr(e,t){let n=e.querySelector(`#modal-especialidades-input`),r=e.querySelector(`#btnAddEspecialidad`),i=e.querySelector(`.especialidades-chips-container`),a=r=>{let a=r.trim();if(a){if(!Vr(e).includes(a)){let e=i.querySelector(`.chips-wrapper`),n=document.createElement(`span`);n.className=`badge bg-primary-subtle text-primary rounded-pill chip-item`,n.innerHTML=`${H(a)}<i class="bi bi-x-lg chip-remove" data-especialidad="${H(a)}" style="cursor:pointer;margin-left:4px;"></i>`,e.appendChild(n),t&&t()}n.value=``}};n?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(e.preventDefault(),a(n.value))}),r?.addEventListener(`click`,()=>a(n.value)),i?.addEventListener(`click`,e=>{e.target.classList.contains(`chip-remove`)&&(e.target.closest(`.chip-item`).remove(),t&&t()),e.target.classList.contains(`suggest-chip`)&&(e.preventDefault(),a(e.target.dataset.especialidad))})}function Ur(e){e.innerHTML=`
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
          ${Wr(G.maestros)}
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `}function Wr(e){return e.length?e.map(e=>{let t=e.nombre||e.name||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${hr(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${H(t)}</span>
            <small class="text-muted text-truncate">
              ${H(e.instrumento||`Sin instrumento especificado`)}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          ${e.telefono?`
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="min-height: 32px;" ${n?``:`disabled`}>
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${H(e.telefono)}</span>
            </button>
          `:`<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>`}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):`
      <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No hay maestros registrados.
      </div>`}function Gr(e){K=e,e.querySelector(`#btnAgregarMaestro`).addEventListener(`click`,()=>Jr()),e.querySelector(`#btn-help-maestros`)?.addEventListener(`click`,()=>{W.open({title:`Maestros`,intro:`Gestión del plantel docente. Desde acá podés ver, agregar, editar y desactivar maestros, y acceder al perfil completo de cada uno.`,sections:[{icon:`bi-search`,title:`Buscador y filtros`,description:`Filtrá por nombre, instrumento o estado (activo/inactivo) en tiempo real.`,color:`#6b7280`},{icon:`bi-person-badge`,title:`Tarjeta de maestro`,description:`Nombre, instrumento principal, clases activas y estado. Badge verde = activo, gris = inactivo.`,color:`#3b82f6`},{icon:`bi-eye`,title:`Ver perfil`,description:`Perfil completo: datos personales, clases (titular y suplente), horarios y ocupación.`,color:`#10b981`},{icon:`bi-pencil`,title:`Editar desde el perfil`,description:`Desde el perfil podés editar cualquier clase que dicte directamente, sin salir del modal.`,color:`#f59e0b`},{icon:`bi-person-x`,title:`Desactivar maestro`,description:`Desactivar oculta al maestro de listas operativas pero conserva su historial. No elimina datos.`,color:`#ef4444`}]})}),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>ei()),e.querySelector(`#buscar`).addEventListener(`input`,()=>qr()),e.querySelector(`#filtroEstado`).addEventListener(`change`,()=>qr()),e.querySelector(`#maestrosTBody`).addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){Xr(t.dataset.id);return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id,i=n.dataset.action;i===`edit`?Yr(r):i===`delete`?Zr(r):i===`whatsapp`&&Kr(r)})}function Kr(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t||!t.telefono)return;let n=t.telefono.replace(/\D/g,``);o.open({title:`Enviar WhatsApp a `+H(t.nombre||t.name||``),size:`md`,saveText:`Enviar WhatsApp`,body:`
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
    `,onSave:async e=>{let t=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=`https://wa.me/${n}?text=${encodeURIComponent(t)}`;window.open(r,`_blank`)}})}function qr(){let e=K.querySelector(`#buscar`).value.trim().toLowerCase(),t=K.querySelector(`#filtroEstado`).value;G.maestros=G.maestrosOriginales.filter(n=>{let r=(n.nombre||n.name||``).toLowerCase(),i=!e||r.includes(e)||(n.email||``).toLowerCase().includes(e)||(n.instrumento||``).toLowerCase().includes(e)||(n.especialidad||``).toLowerCase().includes(e)||(n.especialidades||[]).some(t=>t.toLowerCase().includes(e)),a=n.is_active??!0;return i&&(t===`todos`||t===`activo`&&a||t===`inactivo`&&!a)}),Qr()}function Jr(){G.editando=null,o.open({title:`Crear Nuevo Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${Fr.nombreMax}" placeholder="Juan Pérez">
        <small class="text-muted" id="modal-nombreCount">0/${Fr.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required placeholder="email@ejemplo.com">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" placeholder="+58 412 1234567">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required placeholder="Violín">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" placeholder="Dirección">
      </div>
      ${Br([],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2" placeholder="Breve descripción..."></textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" checked>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,onShow:e=>Hr(e),saveText:`Guardar`,onSave:async e=>{let t=e.querySelector(`#modal-nombre`).value.trim(),n=e.querySelector(`#modal-email`).value.trim().toLowerCase(),r=e.querySelector(`#modal-telefono`).value.trim(),i=e.querySelector(`#modal-instrumento`).value.trim(),a=e.querySelector(`#modal-especialidad`).value.trim(),o=e.querySelector(`#modal-bio`).value.trim(),s=e.querySelector(`#modal-esActivo`).checked;if(!t)return q(`El nombre es obligatorio`,`error`),!1;if(!n)return q(`El email es obligatorio`,`error`),!1;if(!$r(n))return q(`El formato del email no es válido`,`error`),!1;if(n&&await fr(n))return q(`El email ya está registrado`,`error`),!1;let c=Vr(e),l=await cr({nombre:t,email:n||null,telefono:r||null,instrumento:i||null,especialidad:a||null,bio:o||null,is_active:s,especialidades:c});G.maestrosOriginales.push(l),qr(),q(`Maestro creado exitosamente`,`success`)}})}function Yr(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t){q(`Maestro no encontrado`,`error`);return}G.editando=e,o.open({title:`Editar Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${Fr.nombreMax}" value="${H(t.nombre||t.name||``)}">
        <small class="text-muted" id="modal-nombreCount">${(t.nombre||t.name||``).length}/${Fr.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required value="${H(t.email||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" value="${H(t.telefono||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required value="${H(t.instrumento||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" value="${H(t.especialidad||``)}">
      </div>
      ${Br(t.especialidades||[],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2">${H(t.bio||``)}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${t.is_active===!1?``:`checked`}>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,onShow:e=>Hr(e),saveText:`Guardar cambios`,onSave:async e=>{let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-instrumento`).value.trim(),o=e.querySelector(`#modal-especialidad`).value.trim(),s=e.querySelector(`#modal-bio`).value.trim(),c=e.querySelector(`#modal-esActivo`).checked;if(!n)return q(`El nombre es obligatorio`,`error`),!1;if(!r)return q(`El email es obligatorio`,`error`),!1;if(!$r(r))return q(`El formato del email no es válido`,`error`),!1;if(r&&t.email!==r&&await fr(r))return q(`El email ya está registrado`,`error`),!1;let l=Vr(e),u={nombre:n,email:r||null,telefono:i||null,instrumento:a||null,especialidad:o||null,bio:s||null,is_active:c,especialidades:l};await lr(G.editando,u);let d=G.maestrosOriginales.findIndex(e=>e.id===G.editando);d!==-1&&(G.maestrosOriginales[d]={...G.maestrosOriginales[d],...u}),qr(),q(`Maestro actualizado correctamente`,`success`)}})}function Xr(e){let n=G.maestrosOriginales.find(t=>t.id===e);if(!n){q(`Maestro no encontrado`,`error`);return}let r=n.nombre||n.name||`-`,i=n.is_active??!0;o.open({title:r,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${H(r)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${n.email?`<a href="mailto:${H(n.email)}">${H(n.email)}</a>`:`-`}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${H(n.telefono||`-`)}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${H(n.instrumento||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidad</label>
            <p class="form-control-plaintext">${H(n.especialidad||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidades</label>
            <p class="form-control-plaintext">
              ${(n.especialidades||[]).length?n.especialidades.map(e=>`<span class="badge bg-primary-subtle text-primary me-1">${H(e)}</span>`).join(``):`Sin especialidades`}
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${pr(i)}">${mr(i)}</span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold">Biografía</label>
        <p class="form-control-plaintext">${H(n.bio||`Sin biografía`)}</p>
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
    `,onShow:async n=>{n.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>Yr(e),300)}),n.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>Zr(e),300)});let r=n.querySelector(`#maestro-clases-container`),i=n.querySelector(`#maestro-clases-badge`);(async()=>{try{let[n,a,s,c,l]=await Promise.all([ae(e),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]),u={maestros:a.data||[],salones:s.data||[],programas:c.data||[],alumnos:l.data||[]};if(i.textContent=`${n.length} clase${n.length===1?``:`s`}`,n.length===0){r.innerHTML=`
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
                          <span class="fw-semibold text-truncate" style="font-size:0.87rem;" title="${H(e.nombre)}">${H(e.nombre)}</span>
                          ${t?``:`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;">Inactiva</span>`}
                          ${e.es_suplente?`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#fffbeb;color:#92400e;border:1px solid #fde68a;">Suplente</span>`:``}
                        </div>

                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1" style="font-size:0.75rem;color:var(--bs-secondary-color);">
                          ${e.instrumento?`<span>${H(e.instrumento)}</span><span style="opacity:0.3;">·</span>`:``}
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
                          data-clase-nombre="${H(e.nombre)}"
                          data-es-suplente="${e.es_suplente}"
                          title="Quitar"
                          style="font-size:0.65rem;color:#ef4444;text-decoration:none;border-radius:0;">
                          <i class="bi bi-person-dash" style="font-size:0.95rem;"></i>
                          Quitar
                        </button>
                      </div>

                    </div>
                  </div>`}).join(``)}
            </div>`,r.querySelectorAll(`.btn-editar-clase`).forEach(t=>{t.addEventListener(`click`,t=>{let r=t.currentTarget.dataset.claseId,i=n.find(e=>e.id===r);i&&(o.close(),setTimeout(()=>{_r(i,{...u,onSuccess:()=>{setTimeout(()=>Xr(e),300)}})},300))})}),r.querySelectorAll(`.btn-desvincular-clase`).forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget.dataset.claseId,r=t.currentTarget.dataset.claseNombre,i=t.currentTarget.dataset.esSuplente===`true`?`maestro_suplente_id`:`maestro_principal_id`;if(confirm(`¿Quitar a este maestro de "${r}"?`))try{t.currentTarget.disabled=!0,t.currentTarget.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`,await ie(n,{[i]:null},!0),q(`Maestro desvinculado correctamente`,`success`),o.close(),setTimeout(()=>Xr(e),300)}catch(e){q(`Error al desvincular: `+e.message,`error`),t.currentTarget.disabled=!1,t.currentTarget.innerHTML=`<i class="bi bi-person-dash" style="font-size:1rem;"></i><span>Quitar</span>`}})})}catch{i.textContent=`Error`,r.innerHTML=`
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar las clases.
            </div>`}})()}})}function Zr(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t){q(`Maestro no encontrado`,`error`);return}G.deletingId=e;let n=t.nombre||t.name||``,r=t.is_active!==!1;o.open({title:r?`⏸️ Desactivar Maestro`:`▶️ Reactivar Maestro`,size:`sm`,saveText:r?`Desactivar`:`Reactivar`,body:r?`<p>¿Desactivar al maestro <strong>${H(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro no aparecerá en las listas, pero sus datos se conservarán.</p>`:`<p>¿Reactivar al maestro <strong>${H(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro volverá a aparecer en las listas.</p>`,onSave:async()=>{r?(await ur(e),q(`Maestro desactivado correctamente`,`success`)):(await dr(e),q(`Maestro reactivado correctamente`,`success`)),qr()}})}function Qr(){let e=K.querySelector(`#maestrosTBody`);if(!e)return;e.innerHTML=Wr(G.maestros);let t=K.querySelector(`.maestros-header-premium p.text-muted`);t&&(t.textContent=`${G.maestros.length} maestros en total`)}function $r(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function ei(){if(G.maestrosOriginales.length===0){q(`No hay maestros para exportar`,`error`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Instrumento`,`Especialidad`,`Estado`],...G.maestrosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.instrumento||``,e.especialidad||``,e.is_active===!1?`Inactivo`:`Activo`])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`maestros-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),q(`CSV exportado exitosamente`,`success`)}function q(e,t=`info`){let n=K.querySelector(`#toastContainer`);if(!n)return;let i=t===`success`?`bg-success`:t===`error`?`bg-danger`:`bg-info`,a=t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:`bi-info-circle`,o=t===`success`?`Éxito`:t===`error`?`Error`:`Información`,s=document.createElement(`div`);s.className=`toast`,s.setAttribute(`role`,`alert`),s.setAttribute(`aria-live`,`assertive`),s.setAttribute(`aria-atomic`,`true`),s.innerHTML=`
    <div class="toast-header ${i} text-white">
      <i class="bi ${a} me-2"></i>
      <strong class="me-auto">${o}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${H(e)}</div>
  `,n.appendChild(s),new r(s,{autohide:!0,delay:3e3}).show(),s.addEventListener(`hidden.bs.toast`,()=>s.remove())}var ti=e({getAlertasActivas:()=>oi,getAlertasRojas:()=>si,getAlumnosDestacados:()=>hi,getAlumnosEnRiesgoAcademico:()=>gi,getAlumnosEnRiesgoAlto:()=>ai,getCorrelacionAsistenciaRendimiento:()=>yi,getDestacadosYRiesgoAcademico:()=>mi,getEstadisticasPeriodoActivo:()=>pi,getEstadisticasPeriodos:()=>fi,getHistorialEstadoAlumno:()=>bi,getPatronAsistencia:()=>di,getRachaAusencias:()=>_i,getRendimientoMaestro:()=>ui,getRendimientoMaestros:()=>li,getResumenAlertas:()=>ci,getResumenAlumno:()=>ri,getResumenAlumnos:()=>ni,getRiesgoAbandono:()=>ii,getTasaAsistenciaPeriodo:()=>vi,registrarCambioEstadoAlumno:()=>xi});async function ni(){let{data:e,error:n}=await t.from(`vw_resumen_alumno`).select(`*`).order(`nombre_completo`);if(n)throw Error(`No se pudo cargar el resumen de alumnos`);return e}async function ri(e){let{data:n,error:r}=await t.from(`vw_resumen_alumno`).select(`*`).eq(`id`,e).single();if(r)throw Error(`No se pudo cargar el resumen del alumno`);return n}async function ii({nivel:e=null}={}){let n=t.from(`vw_riesgo_abandono`).select(`*`).order(`score_riesgo`,{ascending:!1});e&&(n=n.eq(`nivel_riesgo`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis de riesgo`);return r}async function ai(){return ii({nivel:`alto`})}async function oi({color:e=null,alumnoId:n=null}={}){let r=t.from(`vw_alertas_activas`).select(`*`).order(`fecha_referencia`,{ascending:!0});e&&(r=r.eq(`color`,e)),n&&(r=r.eq(`alumno_id`,n));let{data:i,error:a}=await r;if(a)throw Error(`No se pudieron cargar las alertas`);return i}async function si(){return oi({color:`rojo`})}async function ci(){let{data:e,error:n}=await t.from(`vw_alertas_activas`).select(`color, tipo_alerta`);if(n)throw Error(`No se pudo obtener el resumen de alertas`);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length,porTipo:e.reduce((e,t)=>(e[t.tipo_alerta]=(e[t.tipo_alerta]||0)+1,e),{})}}async function li(){let{data:e,error:n}=await t.from(`vw_rendimiento_maestro`).select(`*`);if(n)throw Error(`No se pudo cargar el rendimiento de maestros`);return e}async function ui(e){let{data:n,error:r}=await t.from(`vw_rendimiento_maestro`).select(`*`).eq(`maestro_id`,e).single();if(r)throw Error(`No se pudo cargar el rendimiento del maestro`);return n}async function di({instrumento:e=null}={}){let n=t.from(`vw_patron_asistencia`).select(`*`).order(`dia_semana_num`);e&&(n=n.eq(`instrumento_principal`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el patrón de asistencia`);return r}async function fi(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`);if(n)throw Error(`No se pudieron cargar las estadísticas por período`);return e}async function pi(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`).eq(`activo`,!0).order(`fecha_inicio`,{ascending:!1}).limit(1);if(n)throw Error(`No se pudieron cargar las estadísticas del período activo: `+n.message);return e&&e.length>0?e[0]:null}async function mi({categoria:e=null}={}){let n=t.from(`vw_destacados_y_riesgo_academico`).select(`*`);e&&(n=n.eq(`categoria`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis académico`);return r}async function hi(){return mi({categoria:`destacado`})}async function gi(){return mi({categoria:`riesgo_academico`})}async function _i(e){let{data:n,error:r}=await t.rpc(`fn_racha_ausencias`,{p_alumno_id:e});if(r)throw Error(`No se pudo calcular la racha de ausencias`);return n}async function vi(e,n,r=null){let i={p_alumno_id:e,p_desde:n};r&&(i.p_hasta=r);let{data:a,error:o}=await t.rpc(`fn_tasa_asistencia_periodo`,i);if(o)throw Error(`No se pudo calcular la tasa de asistencia`);return a}async function yi(){let{data:e,error:n}=await t.rpc(`fn_correlacion_asistencia_rendimiento`);if(n)throw Error(`No se pudo calcular la correlación`);return e}async function bi(e){let{data:n,error:r}=await t.from(`historial_estado_alumno`).select(`*`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1});if(r)throw Error(`No se pudo cargar el historial`);return n}async function xi(e,n,r,i=null){if(![`activo`,`baja_voluntaria`,`baja_academica`,`suspendido`,`egresado`].includes(n))throw Error(`Estado no válido`);let{data:a,error:o}=await t.from(`historial_estado_alumno`).insert([{alumno_id:e,estado:n,motivo:r?.trim()||null,registrado_por:i||null,fecha:new Date().toISOString().split(`T`)[0]}]).select();if(o)throw Error(`No se pudo registrar el cambio de estado`);return a[0]}async function J(e){let t={"/assets/data/mocks/alumnos.json":()=>a(()=>import(`./alumnos-DymqG36Y.js`).then(e=>e.n),__vite__mapDeps([4,1])),"/assets/data/mocks/clases.json":()=>a(()=>import(`./clases-IDMUxON6.js`).then(e=>e.t),__vite__mapDeps([5,1])),"/assets/data/mocks/sesiones.json":()=>a(()=>import(`./sesiones-t6hlrI4y.js`).then(e=>e.t),__vite__mapDeps([6,1])),"/assets/data/mocks/maestro_tareas.json":()=>a(()=>import(`./maestro_tareas-DDJI2X00.js`),[]),"/assets/data/mocks/metricas_periodo.json":()=>a(()=>import(`./metricas_periodo-DdZAbOg7.js`),[]),"/assets/data/mocks/alertas_config.json":()=>a(()=>import(`./alertas_config-C6ytg76N.js`),[]),"/assets/data/mocks/objetivos_gamificacion.json":()=>a(()=>import(`./objetivos_gamificacion-BrqY9FHv.js`),[]),"/assets/data/mocks/ausencias.json":()=>a(()=>import(`./ausencias-C9ld-ISx.js`),[]),"/assets/data/mocks/planificacion-curricular.json":()=>a(()=>import(`./planificacion-curricular-2PU0yhcD.js`),[])}[e];if(t){let e=await t();return e.default||e}return console.warn(`loadJsonMock: ruta no mapeada: ${e}`),null}var Si=e({getAlertasActivas:()=>ji,getAlertasConfig:()=>ki,getAlumnosDestacados:()=>Ii,getEstadisticasPeriodo:()=>Ei,getEstadisticasPeriodoActivo:()=>Di,getHistorialEstadoAlumno:()=>Ni,getRachaAusencias:()=>Pi,getResumenAlertas:()=>Mi,getResumenAlumno:()=>Ti,getResumenAlumnos:()=>wi,getRiesgoAbandono:()=>Fi,getTasaAsistenciaPeriodo:()=>Oi,updateAlertaConfig:()=>Ai}),Ci=`/assets/data/mocks/metricas_periodo.json`;async function wi(){return(await J(Ci)).estadisticas_periodo[0]?.total_alumnos||0}async function Ti(e){return null}async function Ei(){return(await J(Ci)).configuraciones}async function Di(){let e=await J(Ci),t=e.configuraciones.find(e=>e.activo),n=e.estadisticas_periodo.find(e=>e.periodo_id===t?.id);return t?{...t,...n}:null}async function Oi(e,t,n=null){return 87.5}async function ki(){return await J(`/assets/data/mocks/alertas_config.json`)}async function Ai(e,t){return console.log(`Mock: updateAlertaConfig`,e,t),{id:e,...t}}async function ji(e={}){return(await J(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo)}async function Mi(){let e=(await J(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length}}async function Ni(e){return[]}async function Pi(e){return 0}async function Fi({nivel:e=null}={}){let t=[{nombre_completo:`Mateo Fernández`,score_riesgo:88,nivel_riesgo:`alto`},{nombre_completo:`Lucía Benítez`,score_riesgo:65,nivel_riesgo:`medio`},{nombre_completo:`Santiago Morales`,score_riesgo:35,nivel_riesgo:`bajo`}];return e?t.filter(t=>t.nivel_riesgo===e):t}async function Ii(){return[{nombre_completo:`Valeria Russo`,promedio:9.85,programa:`Violín Cátedra`},{nombre_completo:`Thiago Silva`,promedio:9.72,programa:`Violín Inicial`},{nombre_completo:`Delfina Lombardi`,promedio:9.6,programa:`Violín Cátedra`}]}var Y=()=>He.isDemoMode?Si:ti,Li=(...e)=>Y().getEstadisticasPeriodoActivo(...e),Ri=(...e)=>Y().getTasaAsistenciaPeriodo(...e),zi=(...e)=>Y().getAlertasActivas(...e),Bi=(...e)=>Y().getResumenAlertas(...e),Vi=(...e)=>Y().getRiesgoAbandono(...e),Hi=(...e)=>Y().getAlumnosDestacados(...e);function Ui({label:e,value:t,color:n=`primary`,icon:r=`bi-graph-up`}){let i=`bg-${n}`,a=`text-${n}`;return`
    <div class="card border-0 shadow-sm h-100 pm-metric-card">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="metric-icon ${i} bg-opacity-10 ${a} rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="bi ${r}"></i>
          </div>
          <div>
            <div class="text-muted small fw-bold text-uppercase" style="letter-spacing: 0.5px;">${f(e)}</div>
            <div class="h3 mb-0 fw-extrabold ${a}">${t}</div>
          </div>
        </div>
      </div>
    </div>
  `}var X={activeTab:localStorage.getItem(`pm_metrics_tab`)||`resumen`,stats:null,alertas:[],riesgo:[],cargando:!1,container:null};async function Wi(e){if(e)try{X.container=e,X.cargando=!0,Gi(e),X.stats=await Li(),X.resumenAlertas=await Bi(),X.cargando=!1,qi(e),$i(e)}catch(t){console.error(t),Ki(e,t.message)}}function Gi(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function Ki(e,t){e.innerHTML=`<div class="alert alert-danger m-3"><h5>Error analítico</h5><p>${f(t)}</p></div>`}function qi(e){e.innerHTML=`
    <div class="page-container">
      <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-cpu me-2 text-primary"></i>Analytics Hub</span>
        </div>
        <button id="btn-guia-analisis" class="btn btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 small fw-semibold transition-all">
          <i class="bi bi-info-circle-fill"></i>
          <span>Guía de Análisis</span>
        </button>
      </div>

      <div class="pm-tabs-container mb-4">
        <div class="btn-group w-100 shadow-sm" role="group">
          <button class="btn btn-outline-primary ${X.activeTab===`resumen`?`active`:``}" data-tab="resumen"><i class="bi bi-speedometer2 me-1"></i> Resumen</button>
          <button class="btn btn-outline-primary ${X.activeTab===`alertas`?`active`:``}" data-tab="alertas"><i class="bi bi-bell me-1"></i> Alertas</button>
          <button class="btn btn-outline-primary ${X.activeTab===`riesgo`?`active`:``}" data-tab="riesgo"><i class="bi bi-shield-exclamation me-1"></i> Riesgo</button>
          <button class="btn btn-outline-primary ${X.activeTab===`ia`?`active`:``}" data-tab="ia"><i class="bi bi-robot me-1"></i> IA Analysis</button>
        </div>
      </div>

      <div id="hub-content">
        ${Ji()}
      </div>
    </div>
  `}function Ji(){switch(X.activeTab){case`resumen`:return Yi();case`alertas`:return Xi();case`riesgo`:return Zi();case`ia`:return Qi();default:return Yi()}}function Yi(){let e=X.stats||{},t=X.resumenAlertas||{total:0,rojas:0};return`
    <div class="row g-3">
      <div class="col-md-6 col-lg-3">
        ${Ui({label:`Alumnos Activos`,value:e.total_alumnos||0,icon:`bi-people`,color:`primary`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${Ui({label:`Promedio Global`,value:(e.promedio_general||0).toFixed(2),icon:`bi-star`,color:`success`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${Ui({label:`Alertas Rojas`,value:t.rojas,icon:`bi-exclamation-octagon`,color:`danger`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${Ui({label:`Asistencia Hoy`,value:(e.asistencia_hoy_porcentaje||0)+`%`,icon:`bi-check2-circle`,color:`info`})}
      </div>
      
      <div class="col-12 mt-4">
        <h5 class="fw-bold mb-3"><i class="bi bi-trophy me-2 text-warning"></i>Alumnos Destacados</h5>
        <div class="page-glass p-0 overflow-hidden">
          <div id="destacados-placeholder" class="p-4 text-center text-muted">Cargando destacados...</div>
        </div>
      </div>
    </div>
  `}function Xi(){return`
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h5 class="fw-bold m-0"><i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Alertas de Seguimiento Académico</h5>
        <div class="d-flex gap-2 flex-wrap">
          <button id="btn-goto-notifications" class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 shadow-sm transition-all" style="font-size: 0.8rem; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none;">
            <i class="bi bi-bell-fill animate-bell"></i>
            <span>Ir al Centro de Actividad</span>
          </button>
          <span class="badge bg-danger d-flex align-items-center justify-content-center px-3 rounded-pill" style="font-size: 0.85rem;">${X.resumenAlertas?.rojas||0} Críticas</span>
        </div>
      </div>
      <div id="alertas-list-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function Zi(){return`
    <div class="page-glass p-4">
      <h5 class="fw-bold mb-4">Análisis Proactivo de Riesgo de Abandono</h5>
      <div class="alert alert-info small mb-4">
        <i class="bi bi-info-circle me-1"></i> El puntaje de riesgo se calcula combinando racha de ausencias, promedio académico y participación.
      </div>
      <div id="riesgo-list-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function Qi(){return`
    <div class="text-center py-5">
      <i class="bi bi-robot fs-1 text-primary d-block mb-3"></i>
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
      <div id="ia-result-area" class="mt-4 text-start" style="max-width: 600px; margin: 0 auto;"></div>
    </div>
  `}function $i(e){e.querySelectorAll(`[data-tab]`).forEach(t=>{t.addEventListener(`click`,()=>{X.activeTab=t.dataset.tab,localStorage.setItem(`pm_metrics_tab`,X.activeTab),qi(e),$i(e),ea()})}),e.querySelector(`#btn-guia-analisis`)?.addEventListener(`click`,()=>{na()}),ea()}async function ea(){if(X.activeTab===`resumen`){let e=await Hi(),t=X.container.querySelector(`#destacados-placeholder`);t&&(t.className=``,t.innerHTML=`
        <table class="table table-compact table-hover mb-0">
          <tbody class="small">
            ${e.slice(0,5).map(e=>`
              <tr>
                <td><i class="bi bi-award text-warning me-2"></i><strong>${f(e.nombre_completo)}</strong></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">${e.promedio}</span></td>
                <td class="text-muted">${f(e.programa)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      `)}if(X.activeTab===`alertas`){X.container.querySelector(`#btn-goto-notifications`)?.addEventListener(`click`,()=>{a(async()=>{let{router:e}=await import(`./router-Sn5CI9zK.js`).then(e=>e.n);return{router:e}},__vite__mapDeps([7,1,8,9])).then(({router:e})=>{e.navigate(`admin-notificaciones`)})});let e=await zi(),t=X.container.querySelector(`#alertas-list-container`);t&&(t.innerHTML=e.length===0?`<p class="text-center text-muted">No hay alertas activas.</p>`:e.map(e=>`
          <div class="alert-item d-flex align-items-center gap-3 p-3 border-bottom">
            <div class="bg-${e.color} rounded-circle" style="width:12px;height:12px;"></div>
            <div class="flex-grow-1">
              <div class="fw-bold small">${f(e.nombre_alumno)}</div>
              <div class="extra-small text-muted">${f(e.descripcion_alerta)}</div>
            </div>
            <div class="text-end small text-muted">${e.fecha_referencia}</div>
          </div>
        `).join(``))}if(X.activeTab===`riesgo`){let e=await Vi(),t=X.container.querySelector(`#riesgo-list-container`);t&&(t.innerHTML=`
        <table class="table table-compact table-hover">
          <thead><tr><th>Alumno</th><th class="text-center">Score</th><th>Nivel</th></tr></thead>
          <tbody class="small">
            ${e.map(e=>`
              <tr>
                <td>${f(e.nombre_completo)}</td>
                <td class="text-center fw-bold">${e.score_riesgo}</td>
                <td><span class="badge bg-${e.nivel_riesgo===`alto`?`danger`:`warning`}">${e.nivel_riesgo.toUpperCase()}</span></td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      `)}X.activeTab===`ia`&&ta()}function ta(){X.container.querySelector(`#btn-run-ia`)?.addEventListener(`click`,async()=>{let e=X.container.querySelector(`#ia-result-area`);e&&(e.innerHTML=`<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Analizando datos...</p></div>`,setTimeout(()=>{e.innerHTML=`
        <div class="page-glass p-3 border-primary border-start border-4">
          <p class="small mb-2"><strong>Análisis Institucional:</strong></p>
          <p class="extra-small text-secondary">Basado en el rendimiento del período actual, se observa una mejora del 12% en la asistencia del grupo de Cuerdas. Sin embargo, 3 alumnos muestran un patrón de riesgo por inasistencias en la última racha de 15 días.</p>
          <button class="btn btn-xs btn-outline-primary mt-2" id="btn-copy-report">Copiar Reporte</button>
        </div>
      `,X.container.querySelector(`#btn-copy-report`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.querySelector(`p.text-secondary`).innerText),i.show(`Reporte copiado al portapapeles`,`success`)})},1500))})}function na(){o.open({title:`Guía de Análisis Académico`,body:`
    <style>
      .guia-modal-body {
        font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
      }
      .guia-tab-btn {
        background: none;
        border: none;
        border-radius: 10px;
        color: var(--pm-text-muted, #6c757d);
        padding: 0.75rem 1rem;
        text-align: left;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        font-size: 0.875rem;
        position: relative;
        overflow: hidden;
      }
      .guia-tab-btn:hover {
        background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.04);
        color: var(--bs-primary, #0d6efd);
        padding-left: 1.15rem;
      }
      .guia-tab-btn.active {
        background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.08) !important;
        color: var(--bs-primary, #0d6efd) !important;
        font-weight: 600;
        padding-left: 1.15rem;
      }
      .guia-tab-btn.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        height: 60%;
        width: 3px;
        background: var(--bs-primary, #0d6efd);
        border-radius: 0 4px 4px 0;
      }
      
      .guia-panel-card {
        background: rgba(var(--bs-body-bg-rgb, 255, 255, 255), 0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.15);
        border-radius: 14px;
        padding: 1.25rem;
        transition: all 0.25s ease;
      }
      .guia-panel-card:hover {
        transform: translateY(-1px);
        border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.25);
      }

      .guia-icon-box {
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        font-size: 1.1rem;
        flex-shrink: 0;
      }
      
      .guia-data-badge {
        background: rgba(var(--bs-body-color-rgb, 33, 37, 41), 0.03);
        border: 1px solid rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.2);
        border-radius: 8px;
        padding: 0.4rem 0.65rem;
        font-size: 0.725rem;
        font-family: var(--bs-font-monospace, monospace);
        color: var(--pm-text-muted, #6c757d);
        display: inline-flex;
        align-items: center;
      }

      .guia-formula-box {
        background: linear-gradient(135deg, rgba(var(--bs-body-bg-rgb, 255, 255, 255), 0.8) 0%, rgba(var(--bs-tertiary-bg-rgb, 248, 249, 250), 0.8) 100%);
        border: 1px dashed rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.7);
        border-radius: 12px;
        padding: 1.15rem;
      }
    </style>

    <div class="guia-modal-body container-fluid p-0">
      <div class="row g-0 flex-column flex-md-row">
        <!-- Barra de navegación lateral -->
        <div class="col-12 col-md-4 border-end pb-3 pb-md-0 pe-md-3 mb-3 mb-md-0" style="border-color: rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.15) !important;">
          <div class="d-flex flex-row flex-md-column gap-1 overflow-x-auto overflow-y-hidden" id="guia-modal-tabs" style="scrollbar-width: none;">
            <button class="guia-tab-btn active text-nowrap" data-guia="resumen" type="button">
              <i class="bi bi-speedometer2"></i>
              <span>Resumen & KPIs</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="alertas" type="button">
              <i class="bi bi-bell"></i>
              <span>Alertas Activas</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="riesgo" type="button">
              <i class="bi bi-shield-exclamation"></i>
              <span>Riesgo de Abandono</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="ia" type="button">
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
                <div class="guia-icon-box bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-speedometer2"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Métricas Macro y KPIs de Control</h6>
                  <p class="extra-small text-muted mb-0">El pulso integral del período académico en tiempo real.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-primary" style="letter-spacing: -0.01em; font-size:0.825rem;">Resumen General</span>
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle extra-small">KPIs</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Consolida a nivel institucional la cantidad de estudiantes inscritos, el promedio general y el porcentaje de asistencia de la fecha actual.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-primary"></i> vw_estadisticas_periodo
                  </div>
                </div>
                
                <div class="guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-warning" style="letter-spacing: -0.01em; font-size:0.825rem;">Alumnos Destacados</span>
                    <span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle extra-small">Rendimiento</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Identifica automáticamente a los alumnos sobresalientes con un promedio ponderado mayor o igual a <strong>9.50</strong> para visibilizar e incentivar el mérito académico.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-warning"></i> vw_destacados_y_riesgo_academico
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL ALERTAS -->
            <div class="guia-panel d-none" id="pane-alertas">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-danger bg-opacity-10 text-danger">
                  <i class="bi bi-bell"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Seguimiento Reactivo e Incidencias</h6>
                  <p class="extra-small text-muted mb-0">Detección y respuesta ante eventualidades escolares.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="bg-danger rounded-circle" style="width: 7px; height: 7px;"></div>
                    <span class="fw-bold small text-danger" style="font-size:0.825rem;">Alertas Críticas (Rojas)</span>
                  </div>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Disparadas ante ausencias reiteradas e injustificadas o por comentarios de prioridad alta registrados por los maestros (ej. incidentes graves, bajo rendimiento crónico).
                  </p>
                </div>

                <div class="guia-panel-card">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="bg-warning rounded-circle" style="width: 7px; height: 7px;"></div>
                    <span class="fw-bold small text-warning" style="font-size:0.825rem;">Alertas Amarillas (Preventivas)</span>
                  </div>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Avisos tempranos que indican una primera falta injustificada o baja participación, permitiendo al equipo de tutores intervenir preventivamente.
                  </p>
                </div>

                <div class="guia-panel-card bg-light bg-opacity-25 border-dashed">
                  <p class="extra-small text-secondary mb-2 lh-base">
                    Las alertas cruzan de forma reactiva la asistencia diaria y las observaciones docentes con los perfiles curriculares de los estudiantes.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-danger"></i> vw_alertas_activas
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL RIESGO -->
            <div class="guia-panel d-none" id="pane-riesgo">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-warning bg-opacity-10 text-warning">
                  <i class="bi bi-shield-exclamation"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Modelo de Riesgo de Deserción</h6>
                  <p class="extra-small text-muted mb-0">Algoritmo predictivo para interceptar la deserción escolar.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-formula-box">
                  <div class="small fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                    <i class="bi bi-calculator"></i> Ponderación Algorítmica
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    El score predictivo combina la <strong>racha de inasistencias en los últimos 15 días</strong> y la <strong>caída del promedio general</strong> del estudiante en el período activo.
                  </p>
                  
                  <div class="row g-2 text-center">
                    <div class="col-6">
                      <div class="p-2 border border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 extra-small">
                        <div class="fw-bold" style="font-size: 0.725rem;">Riesgo Alto</div>
                        <div class="extra-small opacity-75 font-monospace mt-1" style="font-size:0.625rem;">Racha > 3 O Promedio < 5.0</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-2 border border-warning-subtle bg-warning bg-opacity-10 text-warning rounded-3 extra-small">
                        <div class="fw-bold" style="font-size: 0.725rem;">Riesgo Medio</div>
                        <div class="extra-small opacity-75 font-monospace mt-1" style="font-size:0.625rem;">Racha = 2 O Promedio < 7.0</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="guia-panel-card">
                  <p class="extra-small text-secondary mb-3 lh-base">
                    El score predictivo se recalcula automáticamente en base de datos cada vez que un docente asienta una asistencia o califica una evaluación.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-warning"></i> vw_riesgo_abandono
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL IA -->
            <div class="guia-panel d-none" id="pane-ia">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-info bg-opacity-10 text-info">
                  <i class="bi bi-robot"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">SOI Intelligence - IA de Confianza</h6>
                  <p class="extra-small text-muted mb-0">Modelos generativos (Groq) con inyección de contexto rigurosa.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card border-start border-3 border-info">
                  <span class="badge bg-info bg-opacity-10 text-info border border-info-subtle extra-small mb-2">Protocolo Antialucinaciones</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Para asegurar análisis veraces, la IA no tiene acceso general a la base de datos transaccional. En su lugar, el sistema compila paquetes de datos agregados en JSON provenientes de las vistas consolidadas según el tipo de reporte solicitado.
                  </p>
                </div>

                <div class="guia-panel-card">
                  <div class="fw-bold small text-secondary mb-2" style="font-size: 0.775rem;">Estructura de Datos inyectados:</div>
                  <div class="vstack gap-2 extra-small">
                    <div class="d-flex align-items-start gap-2 py-1">
                      <i class="bi bi-circle-fill text-info mt-1.5" style="font-size:0.35rem;"></i>
                      <div><strong>Analítica Institucional</strong>: Combina <code>vw_estadisticas_periodo</code> y estadísticas de rendimiento docente para correlacionar factores organizacionales.</div>
                    </div>
                    <div class="d-flex align-items-start gap-2 py-1">
                      <i class="bi bi-circle-fill text-info mt-1.5" style="font-size:0.35rem;"></i>
                      <div><strong>Foco de Deserción</strong>: Filtra exclusivamente los alumnos en <code>vw_riesgo_abandono</code> para estructurar planes de intervención y tutoría.</div>
                    </div>
                    <div class="d-flex align-items-start gap-2 py-1">
                      <i class="bi bi-circle-fill text-info mt-1.5" style="font-size:0.35rem;"></i>
                      <div><strong>Progreso Escolar</strong>: Agrupa los promedios de <code>vw_destacados_y_riesgo_academico</code> por cátedra instrumental para redactar boletines periódicos.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,size:`lg`,hideSave:!0,cancelText:`Entendido`,onShow:e=>{let t=e.querySelectorAll(`#guia-modal-tabs button`),n=e.querySelectorAll(`.guia-panel`);t.forEach(r=>{r.addEventListener(`click`,()=>{t.forEach(e=>e.classList.remove(`active`)),r.classList.add(`active`),n.forEach(e=>e.classList.add(`d-none`));let i=e.querySelector(`#pane-${r.dataset.guia}`);i&&i.classList.remove(`d-none`)})})}})}var ra=class{constructor(e,t={}){this.container=e,this.data=t.data||[],this.onSelect=t.onSelect||(()=>{}),this.expandedNodes=new Set,this.selectedNodeId=null,this.icons={block:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,level:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M2 12h20M2 7h20"></path></svg>`,node:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`,indicator:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,expander:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`},this._injectStyles(),this.render(),this._bindEvents()}setData(e){this.data=e,this.render()}render(){this.container.innerHTML=`
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
    `,document.head.appendChild(e)}};async function ia(){let{data:e,error:n}=await t.from(`routes`).select(`*`).order(`name`);if(n)throw console.error(`Error fetching routes:`,n.message),Error(`No se pudieron cargar las rutas`);return e}async function aa(e){let{data:n,error:r}=await t.from(`route_versions`).select(`*`).eq(`route_id`,e).order(`version_number`,{ascending:!1});if(r)throw console.error(`Error fetching route versions:`,r.message),Error(`No se pudieron cargar las versiones de la ruta`);return n}async function oa(e){if(!e)return[];try{let{data:n,error:r}=await t.from(`blocks`).select(`*`).eq(`route_version_id`,e).order(`order_index`);if(r)throw r;if(!n.length)return[];let i=n.map(e=>e.id),{data:a,error:o}=await t.from(`levels`).select(`*`).in(`block_id`,i).order(`order_index`);if(o)throw o;let s=a.map(e=>e.id),{data:c,error:l}=await t.from(`nodes`).select(`*`).in(`level_id`,s).order(`order_index`).limit(5e3);if(l)throw l;let u=c.map(e=>e.id),{data:d,error:f}=await t.from(`indicators`).select(`*`).in(`node_id`,u).order(`order_index`).limit(1e4);if(f)throw f;return n.map(e=>({...e,type:`block`,children:a.filter(t=>t.block_id===e.id).map(e=>({...e,type:`level`,children:c.filter(t=>t.level_id===e.id).map(e=>({...e,type:`node`,children:d.filter(t=>t.node_id===e.id).map(e=>({...e,type:`indicator`}))}))}))}))}catch(e){throw console.error(`Error building academic tree:`,e.message),Error(`Error al construir el árbol académico`)}}async function sa(e){let{data:n,error:r}=await t.from(`node_resources`).select(`*`).eq(`node_id`,e).order(`order_index`);if(r)throw r;return n}async function ca(e){let{id:n,...r}=e;if(n){let{data:e,error:i}=await t.from(`node_resources`).update(r).eq(`id`,n).select().single();if(i)throw i;return e}else{let{data:e,error:n}=await t.from(`node_resources`).insert([r]).select().single();if(n)throw n;return e}}async function la(e){let{error:n}=await t.from(`node_resources`).delete().eq(`id`,e);if(n)throw n;return!0}async function ua(e,n){let{data:r,error:i}=await t.from(`nodes`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}var da=class{constructor(e,t={}){this.container=e,this.node=null,this.resources=[],this.onUpdate=t.onUpdate||(()=>{}),this._injectStyles(),this.renderEmpty()}async setNode(e){if(!e){this.node=null,this.resources=[],this.renderEmpty();return}this.node=e,this.renderLoading();try{this.resources=await sa(e.id),this.render()}catch(e){console.error(`Error loading resources:`,e),this.renderError(`No se pudieron cargar los recursos del nodo.`)}}renderEmpty(){this.container.innerHTML=`
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
    `}_bindEvents(){this.container.querySelector(`#save-node-metadata`)?.addEventListener(`click`,async()=>{let e=this.container.querySelector(`#node-name`).value,t=this.container.querySelector(`#node-critical`)?.checked,n=this.container.querySelector(`#save-node-metadata`);n.disabled=!0,n.textContent=`Guardando...`;try{let n={name:e};this.node.type===`node`&&(n.is_critical=t),this.node.type===`indicator`&&(n.description=e),await ua(this.node.id,n),Object.assign(this.node,n),this.onUpdate(this.node),this.render()}catch(e){alert(`Error al guardar: `+e.message)}finally{n.disabled=!1,n.textContent=`Guardar Cambios`}}),this.container.querySelector(`#add-resource-btn`)?.addEventListener(`click`,()=>{this._showResourceModal()}),this.container.querySelectorAll(`.edit-res`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.resource-card`).dataset.id,n=this.resources.find(e=>e.id===t);this._showResourceModal(n)})}),this.container.querySelectorAll(`.delete-res`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`.resource-card`).dataset.id;if(confirm(`¿Estás seguro de que deseas eliminar este recurso?`))try{await la(t),this.resources=this.resources.filter(e=>e.id!==t),this.render()}catch(e){alert(`Error al eliminar: `+e.message)}})})}_showResourceModal(e=null){let t=!!e,n=`resourceModal`,r=document.getElementById(n);r&&r.remove(),r=document.createElement(`div`),r.id=n,r.className=`modal fade apple-modal`,r.tabIndex=-1,r.innerHTML=`
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
    `,document.body.appendChild(r);let i=new bootstrap.Modal(r);i.show(),r.querySelectorAll(`.type-option`).forEach(e=>{e.addEventListener(`click`,()=>{r.querySelectorAll(`.type-option`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`)})}),r.querySelector(`#save-resource-confirm-btn`).addEventListener(`click`,async()=>{let n=r.querySelector(`#resource-form`),a=new FormData(n),o={node_id:this.node.id,resource_type:a.get(`resource_type`),title:a.get(`title`),url:a.get(`url`),content:a.get(`content`),order_index:e?.order_index||this.resources.length};if(t&&(o.id=e.id),!o.title){alert(`El título es obligatorio`);return}try{let e=await ca(o);if(t){let t=this.resources.findIndex(t=>t.id===e.id);this.resources[t]=e}else this.resources.push(e);this.render(),i.hide()}catch(e){alert(`Error al guardar recurso: `+e.message)}})}_injectStyles(){if(document.getElementById(`resource-editor-styles`))return;let e=document.createElement(`style`);e.id=`resource-editor-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}};async function fa(e){pa(),e.innerHTML=`
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
  `;let t=e.querySelector(`#tree-container`),n=e.querySelector(`#detail-container`),r=e.querySelector(`#route-selector`),i=e.querySelector(`#version-selector`),a=new da(n,{onUpdate:e=>{console.log(`Node updated:`,e)}}),o=new ra(t,{onSelect:e=>{a.setNode(e)}});try{(await ia()).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,r.appendChild(t)})}catch(e){console.error(`Error loading routes:`,e)}r.addEventListener(`change`,async()=>{let e=r.value;if(i.innerHTML=`<option value="">Versión...</option>`,i.disabled=!0,t.innerHTML=`<div class="tree-placeholder"><p>Cargando versiones...</p></div>`,!e){t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una ruta para comenzar.</p></div>`;return}try{(await aa(e)).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`V${e.version_number} - ${new Date(e.created_at).toLocaleDateString()}`,i.appendChild(t)}),i.disabled=!1,t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una versión.</p></div>`}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar versiones.</p></div>`}}),i.addEventListener(`change`,async()=>{let e=i.value;if(e){t.innerHTML=`
      <div class="tree-loading">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Construyendo mapa curricular...</span>
      </div>
    `;try{let t=await oa(e);o.setData(t)}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar el árbol curricular.</p></div>`}}})}function pa(){if(document.getElementById(`academic-admin-layout-styles`))return;let e=document.createElement(`style`);e.id=`academic-admin-layout-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}var Z={clases:[],clasesOriginales:[],maestros:[],salones:[],programas:[],alumnos:[],cargando:!1,filtroEstado:`todos`,filtroInstrumento:``,vista:`tabla`,container:null,mostrarDiasVacios:!0};async function ma(e){if(e)try{Z.container=e,Z.cargando=!0,ha(e);let[n,r,i,a,o]=await Promise.all([g(),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]);Z.clases=n,Z.clasesOriginales=[...n],Z.maestros=r.data||[],Z.salones=i.data||[],Z.programas=a.data||[],Z.alumnos=o.data||[],Z.cargando=!1,_a(e),Ca(e)}catch(t){console.error(t),ga(e,t.message)}}function ha(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `}function ga(e,t){e.innerHTML=`
    <div class="container mt-5 text-center">
      <div class="alert alert-danger d-inline-block" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${f(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>ma(e))}function _a(e){e.innerHTML=`
    <div class="page-container">
      <div class="clases-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-book fs-4"></i>
          </div>
          <div>
            <h1 class="clases-title-premium mb-0">Clases</h1>
            <p class="text-muted small mb-0">${Z.clases.length} clases en total</p>
          </div>
        </div>
        
        <div class="clases-header-actions">
          <button class="btn-help-trigger" id="btn-help-clases" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <div class="view-segmented-control">
            <button class="view-segment-btn ${Z.vista===`tabla`?`active`:``}" id="btn-vista-tabla" title="Vista de lista">
              <i class="bi bi-list-ul"></i>
            </button>
            <button class="view-segment-btn ${Z.vista===`calendario`?`active`:``}" id="btn-vista-calendario" title="Vista de agenda">
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
        ${Z.vista===`tabla`?va():xa()}
      </div>
    </div>
  `}function va(){return Z.clases.length===0?ba():`
    <div class="page-glass rounded w-100">
      <div class="list-group list-group-flush w-100" id="clasesListBody">
        ${Z.clases.map(e=>ya(e)).join(``)}
      </div>
    </div>
  `}function ya(e){let t=e.nombre||`Sin nombre`,n=Z.maestros.find(t=>t.id===e.maestro_principal_id),r=n?n.nombre_completo||n.nombre:`Sin maestro`,i=p(t),a=e.estado||`activa`,o=`border-accent-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,s=`bg-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,c=(e.horarios||[]).slice(0,3),l=c.length>0?c.map(e=>`${(e.dia||``).slice(0,2).toUpperCase()} ${(e.hora_inicio||``).slice(0,5)}`).join(` • `):`Sin horarios`;return`
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
          <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${f(t)}</span>
          <small class="text-muted text-truncate">${f(r)} • ${f(e.instrumento||`-`)}</small>
          <small class="text-muted extra-small mt-1" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i>${f(l)}</small>
        </div>
      </div>
      <div class="flex-shrink-0 text-muted ms-2 pe-1">
        <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
      </div>
    </div>
  `}function ba(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No se encontraron clases.</p>
    </div>
  `}function xa(){if(Z.clases.length===0)return ba();let e=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`],t={lunes:`Lunes`,martes:`Martes`,miércoles:`Miércoles`,jueves:`Jueves`,viernes:`Viernes`,sábado:`Sábado`},n={lunes:[],martes:[],miércoles:[],jueves:[],viernes:[],sábado:[]};Z.clases.forEach(e=>{(e.horarios||[]).forEach(t=>{let r=(t.dia||``).toLowerCase().trim();n[r]&&n[r].push({...t,clase:e})})}),Object.keys(n).forEach(e=>{n[e].sort((e,t)=>oe(e.hora_inicio)-oe(t.hora_inicio))});let r=Z.mostrarDiasVacios?``:`hide-empty-days`;return`
    <div class="weekly-schedule-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 px-1 weekly-schedule-toolbar">
        <span class="small text-muted fw-semibold"><i class="bi bi-calendar-week me-1"></i>Agenda Semanal</span>
        <div class="form-check form-switch m-0 d-flex align-items-center gap-2">
          <input class="form-check-input cursor-pointer" type="checkbox" role="switch" id="toggle-empty-days" ${Z.mostrarDiasVacios?`checked`:``}>
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
                ${r.length>0?r.map(e=>{let t=e.clase,n=t.estado||`activa`,r=re(e.hora_inicio),i=re(e.hora_fin),a=Z.salones.find(t=>t.id===e.salon_id),o=a?a.nombre:`Online/Otro`;return`
                    <div class="time-block-card p-2 rounded mb-2 border-start-accent ${`border-accent-${n===`activa`?`success`:n===`suspendida`?`warning`:`secondary`}`}" data-id="${t.id}" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="time-range small fw-bold text-primary"><i class="bi bi-clock me-1"></i>${r} - ${i}</span>
                        <i class="bi ${c(t.instrumento)} text-muted" style="font-size: 0.85rem;"></i>
                      </div>
                      <div class="fw-semibold text-truncate small class-name" style="font-size: 0.9rem;">${f(t.nombre)}</div>
                      <div class="d-flex justify-content-between align-items-center mt-1 extra-small text-muted">
                        <span class="text-truncate" style="max-width: 60%;"><i class="bi bi-person me-0.5"></i>${f(Z.maestros.find(e=>e.id===t.maestro_principal_id)?.nombre_completo||`Sin maestro`)}</span>
                        <span class="badge bg-body-secondary text-body-secondary-custom px-1.5 py-0.5 rounded" style="font-size: 0.7rem;"><i class="bi bi-geo-alt me-0.5"></i>${f(o)}</span>
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
  `}async function Sa(e){if(e){o.open({title:`Cargando...`,hideSave:!0,size:`md`,body:`
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando perfil de la clase...</p>
      </div>
    `});try{let t=await u(e.id),n=t.length,r=Z.maestros.find(t=>t.id===e.maestro_principal_id),i=r?r.nombre_completo||r.nombre:`Sin maestro`,a=e.tiene_suplente||e.maestro_suplente_id?Z.maestros.find(t=>t.id===e.maestro_suplente_id):null,s=a?a.nombre_completo||a.nombre:null,l=Z.programas.find(t=>t.id===e.programa_id),d=l?l.nombre:`Sin programa`,h=``;h=e.horarios&&e.horarios.length>0?e.horarios.map(e=>{let t=e.dia.charAt(0).toUpperCase()+e.dia.slice(1),n=Z.salones.find(t=>t.id===e.salon_id),r=n?n.nombre:`Online/Otro`;return`
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-secondary-subtle text-secondary-custom py-1" style="font-size: 0.75rem; min-width: 60px;">${t}</span>
            <span class="small fw-semibold">${re(e.hora_inicio)} - ${re(e.hora_fin)}</span>
            <span class="small text-muted">• <i class="bi bi-geo-alt me-0.5"></i>${f(r)}</span>
          </div>
        `}).join(``):`<div class="text-muted small">Sin horarios asignados</div>`;let g=``;g=t&&t.length>0?`
        <div class="list-group list-group-flush border-top">
          ${t.map(e=>{let t=e.alumno;if(!t)return``;let n=p(t.nombre_completo||t.nombre||`?`);return`
              <div class="list-group-item d-flex align-items-center gap-3 py-2 px-3 border-bottom-0 bg-transparent">
                <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle" style="width: 32px; height: 32px; font-size: 0.85rem; background-color: ${ee(t.id)}; font-weight:600;">
                  ${n}
                </div>
                <div class="d-flex flex-column overflow-hidden">
                  <span class="fw-semibold text-truncate small" style="font-size: 0.9rem; color: var(--bs-body-color);">${f(t.nombre_completo||t.nombre)}</span>
                  <small class="text-muted extra-small">${f(t.instrumento_principal||`Sin instrumento`)}</small>
                </div>
              </div>
            `}).join(``)}
        </div>
      `:`
        <div class="text-muted text-center py-4 small bg-body-tertiary rounded">
          <i class="bi bi-people d-block mb-1 opacity-50" style="font-size: 1.25rem;"></i>
          No hay alumnos inscritos en esta clase
        </div>
      `;let te=e.capacidad_maxima||20,ne=Math.min(100,Math.round(n/te*100)),_=`bg-success`;ne>=90?_=`bg-danger`:ne>=70&&(_=`bg-warning`);let ie=`
      <div class="class-profile-container">
        <!-- Profile Header / Hero Card -->
        <div class="class-hero-card d-flex align-items-center gap-3 p-3 rounded mb-4" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
          <div class="position-relative">
            <div class="avatar-large bg-primary bg-opacity-15 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 56px; height: 56px; font-size: 1.5rem; font-weight: 700;">
              <i class="bi ${c(e.instrumento)}"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 p-1.5 bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="overflow-hidden">
            <h4 class="mb-1 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${f(e.nombre)}</h4>
            <span class="badge rounded-pill bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} text-capitalize" style="font-size: 0.75rem;">${m(e.estado)}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-person-badge me-1"></i>Maestro Principal</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${f(i)}</span>
              ${s?`<small class="text-muted d-block extra-small mt-1"><i class="bi bi-person me-0.5"></i>Suplente: ${f(s)}</small>`:``}
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-music-note me-1"></i>Instrumento</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${f(e.instrumento||`Sin asignar`)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-collection me-1"></i>Programa</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${f(d)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-2"><i class="bi bi-calendar3 me-1"></i>Horarios y Salones</small>
              <div class="horarios-list-container">
                ${h}
              </div>
            </div>
          </div>
        </div>

        <!-- Enrollment Progress Bar -->
        <div class="enrollment-occupancy-card p-3 rounded mb-4 border bg-body-tertiary">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold small text-muted"><i class="bi bi-people me-1"></i>Ocupación e Inscripciones</span>
            <span class="badge bg-secondary bg-opacity-10 text-secondary-custom small fw-semibold" style="font-size: 0.75rem;">${n} / ${te} Alumnos</span>
          </div>
          <div class="progress bg-body-secondary" style="height: 10px; border-radius: 6px; overflow: hidden;">
            <div class="progress-bar ${_} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${ne}%" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${te}"></div>
          </div>
        </div>

        <!-- Description / Pedagogical Notes -->
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Notas Pedagógicas</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${f(e.descripcion||`Sin notas pedagógicas registradas.`)}</p>
        </div>

        <!-- Alumnos Inscritos List -->
        <div class="alumnos-inscritos-section mb-4">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="font-size: 0.95rem;">
            <i class="bi bi-person-check text-primary"></i> Alumnos Inscritos
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill small" style="font-size: 0.75rem;">${n}</span>
          </h6>
          <div class="alumnos-scroll-list border rounded" style="max-height: 180px; overflow-y: auto;">
            ${g}
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
    `;o.open({title:`Perfil de Clase: ${e.nombre}`,hideSave:!0,size:`md`,body:ie,onShow:t=>{let n=t.closest(`.app-modal-dialog`)?.querySelector(`.app-modal-footer`);n&&n.style.setProperty(`display`,`none`,`important`),t.querySelector(`.btn-profile-edit`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>{_r(e,{maestros:Z.maestros,salones:Z.salones,programas:Z.programas,alumnos:Z.alumnos,onSuccess:()=>ma(Z.container)})},250)}),t.querySelector(`.btn-profile-delete`)?.addEventListener(`click`,()=>{o.close(),setTimeout(()=>{Ta(e.id)},250)}),t.querySelector(`.btn-profile-close`)?.addEventListener(`click`,()=>{o.close()})}})}catch(e){console.error(e),i.error(`Error al cargar la información detallada de la clase`),o.close()}}}function Ca(e){e.querySelector(`#btn-help-clases`)?.addEventListener(`click`,()=>{W.open({title:`Clases`,intro:`Gestión completa de clases: creación, horarios, asignación de maestros, inscripción de alumnos y control de capacidad.`,sections:[{icon:`bi-easel2`,title:`Lista de clases`,description:`Todas las clases del sistema. Filtrá por instrumento, nivel y estado. Las activas aparecen primero.`,color:`#3b82f6`},{icon:`bi-clock`,title:`Horarios`,description:`Cada clase puede tener múltiples horarios semanales. El sistema detecta conflictos de salón y de maestro automáticamente.`,color:`#6366f1`},{icon:`bi-people`,title:`Inscripción de alumnos`,description:`"Grupal": todos comparten el horario. "Rotativa (Turnos)": cada alumno tiene su propio horario individual dentro de la clase.`,color:`#10b981`},{icon:`bi-bar-chart`,title:`Capacidad`,description:`Barra de ocupación: inscriptos vs capacidad máxima. Rojo cuando supera el 90%.`,color:`#f59e0b`},{icon:`bi-person-workspace`,title:`Maestro titular y suplente`,description:`Cada clase tiene un maestro principal (obligatorio) y puede tener suplente (opcional). Ambos aparecen en el perfil del maestro.`,color:`#6b7280`}]})}),e.querySelector(`#btnAgregarClase`)?.addEventListener(`click`,()=>{_r(null,{maestros:Z.maestros,salones:Z.salones,programas:Z.programas,alumnos:Z.alumnos,onSuccess:()=>ma(e)})}),e.querySelector(`#btn-vista-tabla`)?.addEventListener(`click`,()=>{Z.vista=`tabla`,_a(e),Ca(e)}),e.querySelector(`#btn-vista-calendario`)?.addEventListener(`click`,()=>{Z.vista=`calendario`,_a(e),Ca(e)}),e.querySelector(`#buscar`)?.addEventListener(`input`,wa),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,wa);let t=e.querySelector(`#view-content`);t?.addEventListener(`change`,t=>{if(t.target&&t.target.id===`toggle-empty-days`){Z.mostrarDiasVacios=t.target.checked;let n=e.querySelector(`.weekly-schedule-grid`);n&&(Z.mostrarDiasVacios?n.classList.remove(`hide-empty-days`):n.classList.add(`hide-empty-days`))}}),t?.addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id], .time-block-card[data-id]`);if(t){let e=t.dataset.id,n=Z.clasesOriginales.find(t=>t.id===e);n&&Sa(n)}})}function wa(){let e=Z.container.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=Z.container.querySelector(`#filtroEstado`)?.value||`todos`;Z.clases=Z.clasesOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||n.instrumento.toLowerCase().includes(e),i=t===`todos`||n.estado===t;return r&&i});let n=Z.container.querySelector(`#view-content`);n&&(n.innerHTML=Z.vista===`tabla`?va():xa())}function Ta(e){let t=Z.clasesOriginales.find(t=>t.id===e);t&&o.open({title:`⚠️ Eliminar Clase`,saveText:`Eliminar Definitivamente`,body:`<p>¿Estás seguro de eliminar la clase <strong>${f(t.nombre)}</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await ne(e),i.success(`Clase eliminada`),ma(Z.container),!0}catch(e){return i.error(e.message),!1}}})}async function Ea(e){e.innerHTML=`
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
  `;try{let{data:n,error:r}=await t.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(r)throw r;let i=e.querySelector(`#aprobacion-content`);if(!n||n.length===0){i.innerHTML=`
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
              <th>Instrumento</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>`
              <tr data-profile-id="${e.id}">
                <td>${Oa(e.nombre_completo||`—`)}</td>
                <td>${Oa(e.email)}</td>
                <td>${Oa(e.instrumento||`—`)}</td>
                <td>${ka(e.created_at)}</td>
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
    `,i.querySelectorAll(`.btn-aprobar`).forEach(e=>{e.addEventListener(`click`,()=>Da(e.dataset.id,`activo`,i))}),i.querySelectorAll(`.btn-rechazar`).forEach(e=>{e.addEventListener(`click`,()=>Da(e.dataset.id,`rechazado`,i))})}catch(t){let n=e.querySelector(`#aprobacion-content`);n.innerHTML=`
      <div class="pm-error" style="text-align: center; padding: 2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes: ${t.message}</p>
        <button class="btn btn-outline-light btn-sm" onclick="this.closest('[id]').__reload?.()">
          Intentar de nuevo
        </button>
      </div>
    `,console.error(`[AprobacionView] Error:`,t.message)}}async function Da(e,n,r){let i=r.querySelector(`tr[data-profile-id="${e}"]`);if(i){i.querySelectorAll(`button`).forEach(e=>e.disabled=!0);try{let{error:a}=await t.from(`profiles`).update({estado:n}).eq(`id`,e);if(a)throw a;if(n===`activo`)try{let{data:n}=await t.from(`maestros`).select(`id`).eq(`user_id`,e).maybeSingle();n?.id&&await t.from(`permisos_maestros`).upsert({maestro_id:n.id,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`registrar_alumnos`,`inscribir_clases`]},{onConflict:`maestro_id`})}catch(e){console.warn(`[AprobacionView] Could not grant default permissions:`,e.message)}i.style.transition=`opacity 0.3s ease`,i.style.opacity=`0`,setTimeout(()=>i.remove(),300),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:n===`activo`?`Maestro aprobado correctamente`:`Maestro rechazado`,type:`success`}}));let o=r.querySelector(`tbody`);o&&o.querySelectorAll(`tr`).length===0&&(r.innerHTML=`
        <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>No hay maestros pendientes de aprobación</h3>
          <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
        </div>
      `)}catch(e){i.querySelectorAll(`button`).forEach(e=>e.disabled=!1),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al ${n===`activo`?`aprobar`:`rechazar`} maestro: ${e.message}`,type:`error`}})),console.error(`[AprobacionView] Action error:`,e.message)}}}function Oa(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function ka(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`})}catch{return e}}async function Aa(){let{data:e,error:n}=await t.from(`ausencias_maestros`).select(`
      id,
      maestro_id,
      tipo_ausencia,
      urgencia,
      fecha_inicio,
      fecha_fin,
      motivo,
      estado,
      created_at
    `).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(n)throw n;if(!e||e.length===0)return[];let r=[...new Set(e.map(e=>e.maestro_id).filter(Boolean))];if(r.length>0){let{data:n,error:i}=await t.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,r);if(!i&&n){let t=new Map(n.map(e=>[e.id,e]));return e.map(e=>{let n=t.get(e.maestro_id);return{...e,maestros:n?{nombre_completo:n.nombre_completo,correo:n.email}:e.maestros||null}})}}return e.map(e=>({...e,maestros:e.maestros||null}))}async function ja(e,n,r){let{data:i,error:a}=await t.from(`ausencias_maestros`).update({estado:n,decision_notas:r||null,decidido_en:new Date().toISOString()}).eq(`id`,e).select().single();if(a)throw a;return i}function Ma(e,t=``){return ja(e,`aprobada`,t)}function Na(e,t=``){return ja(e,`rechazada`,t)}function Q(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function Pa(e){if(!e)return`—`;let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}function Fa(e){let t=Pa(e.fecha_inicio);return!e.fecha_fin||e.fecha_fin===e.fecha_inicio?t:`${t} → ${Pa(e.fecha_fin)}`}function Ia(e){return e.maestros?.nombre_completo||e.maestro_nombre||`Maestro no especificado`}function La(e){return e.maestros?.correo||``}var Ra={enfermedad:{label:`Médica`,icon:`bi-heart-pulse-fill`,color:`#ef4444`},personal:{label:`Personal`,icon:`bi-person-fill`,color:`#3b82f6`},capacitacion:{label:`Capacitación`,icon:`bi-mortarboard-fill`,color:`#8b5cf6`},vacaciones:{label:`Vacaciones`,icon:`bi-sun-fill`,color:`#f59e0b`},otro:{label:`Otro`,icon:`bi-three-dots`,color:`#6b7280`}},za={baja:{label:`Baja`,color:`#22c55e`,bg:`rgba(34,197,94,0.12)`},media:{label:`Media`,color:`#f59e0b`,bg:`rgba(245,158,11,0.12)`},alta:{label:`Alta`,color:`#ef4444`,bg:`rgba(239,68,68,0.12)`}};function Ba(e){if(e.clase_emergente?.fecha){let t=e.clase_emergente.hora?` a las ${e.clase_emergente.hora}`:``;return`<i class="bi bi-calendar-check"></i> Reprogramada para ${e.clase_emergente.fecha}${t}`}return e.maestro_suplente_id||e.suplente_nombre?`<i class="bi bi-person-check"></i> Suplente: ${Q(e.suplente_nombre||e.maestro_suplente_id)}`:`<i class="bi bi-clock"></i> Pendiente de coordinación`}function Va(){if(document.getElementById(`ausencia-aprobacion-card-styles`))return;let e=document.createElement(`style`);e.id=`ausencia-aprobacion-card-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Ha(e,{onApprove:t=()=>{},onReject:n=()=>{}}={}){Va();let r=Ra[e.tipo_ausencia]||Ra.otro,i=za[e.urgencia]||{label:e.urgencia||`Normal`,color:`#6b7280`,bg:`rgba(107,114,128,0.12)`},a=Array.isArray(e.clases_afectadas)?e.clases_afectadas.length:0,o=Ia(e),s=o.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase(),c=document.createElement(`article`);c.className=`ausencia-approval-card`,c.dataset.ausenciaCard=e.id,c.style.setProperty(`--aac-tipo-color`,r.color);let l=e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``;c.innerHTML=`
    <div class="aac-accent-bar" style="background: ${Q(r.color)};"></div>

    <div class="aac-header">
      <div class="aac-avatar" style="background: ${Q(r.color)};">${Q(s)}</div>
      <div class="aac-header-info">
        <p class="aac-teacher-name">${Q(o)}</p>
        <p class="aac-teacher-email">${Q(La(e))}</p>
        <div class="aac-badges">
          <span class="aac-tipo-chip" style="--aac-tipo-color:${Q(r.color)}">
            <i class="bi ${Q(r.icon)}"></i> ${Q(r.label)}
          </span>
          <span class="aac-urg-chip" style="color:${Q(i.color)};background:${Q(i.bg)}">
            <i class="bi bi-circle-fill" style="font-size:0.45rem"></i> ${Q(i.label)}
          </span>
        </div>
      </div>
    </div>

    <div class="aac-body">
      <div class="aac-date-row">
        <i class="bi bi-calendar-range"></i>
        ${Q(Fa(e))}
      </div>
      <div class="aac-coverage">${Ba(e)}</div>
      ${a>0?`<div class="aac-meta"><span><i class="bi bi-journal-text"></i> ${a} clase${a>1?`s`:``} afectada${a>1?`s`:``}</span></div>`:``}
      ${e.motivo?`<div class="aac-motivo">${Q(e.motivo)}</div>`:``}
      <div class="aac-meta">
        ${l?`<span><i class="bi bi-clock-history"></i> Enviada el ${l}</span>`:``}
      </div>
    </div>

    <div class="aac-notes-wrap">
      <label class="aac-notes-label" for="notes-${Q(e.id)}">Nota de decisión (opcional)</label>
      <textarea
        class="aac-notes-input"
        id="notes-${Q(e.id)}"
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
  `;let u=()=>c.querySelector(`[data-decision-notes]`)?.value?.trim()||``,d=c.querySelector(`[data-action="approve"]`),f=c.querySelector(`[data-action="reject"]`);return d.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,d.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Aprobando...`,await t(e.id,u())}),f.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,f.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Rechazando...`,await n(e.id,u())}),c}function Ua(e,t=`success`){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}function Wa(){if(document.getElementById(`ausencias-admin-view-styles`))return;let e=document.createElement(`style`);e.id=`ausencias-admin-view-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Ga(e){Wa(),e.innerHTML=`
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
  `}function Ka(e,t){let n=t.length,r=t.filter(e=>e.urgencia===`alta`).length,i=t.filter(e=>e.urgencia===`media`).length;e.innerHTML=`
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
  `}function qa(e){e.innerHTML=`
    <div class="aav-empty">
      <div class="aav-empty-icon"><i class="bi bi-inbox"></i></div>
      <h3 class="aav-empty-title">Todo al día</h3>
      <p class="aav-empty-sub">No hay solicitudes de ausencia pendientes en este momento.</p>
    </div>
  `}async function Ja(e){let t=e.querySelector(`#aav-content`),n=e.querySelector(`#aav-stats-row`),r=e.querySelector(`#aav-count-label`),i=e.querySelector(`#aav-refresh-btn`);t&&(t.innerHTML=`
      <div class="aav-loading">
        <div class="aav-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    `);try{let i=await Aa();if(n&&Ka(n,i),r&&(r.textContent=i.length===0?`Sin solicitudes pendientes`:`${i.length} solicitud${i.length>1?`es`:``} pendiente${i.length>1?`s`:``}`),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate(),!i.length){qa(t);return}t.innerHTML=``;let a=document.createElement(`div`);a.className=`aav-list`,t.appendChild(a);let o=[...i].sort((e,t)=>{let n={alta:0,media:1,baja:2},r=n[e.urgencia]??3,i=n[t.urgencia]??3;return r===i?(e.created_at||``).localeCompare(t.created_at||``):r-i});for(let t of o)a.appendChild(Ha(t,{onApprove:async(t,n)=>{await Ma(t,n),Ua(`Ausencia aprobada`,`success`),await Ja(e)},onReject:async(t,n)=>{await Na(t,n),Ua(`Ausencia rechazada`,`success`),await Ja(e)}}))}catch(e){t&&(t.innerHTML=`
        <div class="aav-error">
          <i class="bi bi-exclamation-triangle"></i>
          Error al cargar solicitudes: ${e.message}
        </div>
      `),Ua(`Error al cargar ausencias: ${e.message}`,`error`)}finally{i&&i.classList.remove(`spinning`)}}async function Ya(e){Ga(e);let t=e.querySelector(`.aav-root`);await Ja(t);let n=e.querySelector(`#aav-refresh-btn`);n&&n.addEventListener(`click`,async()=>{n.classList.add(`spinning`),await Ja(t)})}function Xa(e){let t=new Date;return t.setDate(t.getDate()-e),t.toISOString().split(`T`)[0]}function $(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``}function Za(e){if(!e)return``;let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4),r=Math.floor(t/36e5),i=Math.floor(t/864e5);return n<2?`ahora mismo`:n<60?`hace ${n} min`:r<24?`hace ${r}h`:i<7?`hace ${i}d`:$(e)}var Qa={enfermedad:`Médica`,personal:`Personal`,capacitacion:`Capacitación`,vacaciones:`Vacaciones`,otro:`Otro`};async function $a(){let e=Xa(30),{data:n,error:r}=await t.from(`ausencias_maestros`).select(`
      id, maestro_id, tipo_ausencia, urgencia, fecha_inicio, fecha_fin,
      estado, motivo, created_at, decidido_en,
      maestros:maestro_id(nombre_completo, correo, instrumento)
    `).in(`estado`,[`pendiente`,`aprobada`,`rechazada`]).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(50);if(r)throw r;if(!n||n.length===0)return[];let i=[...new Set(n.map(e=>e.maestro_id).filter(Boolean))];if(i.length>0){let{data:e,error:r}=await t.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,i);if(!r&&e){let r=e.map(e=>e.email).filter(Boolean),i=new Map;if(r.length>0){let{data:e}=await t.from(`maestros`).select(`correo, especialidad`).in(`correo`,r);e&&(i=new Map(e.map(e=>[e.correo.toLowerCase(),e.especialidad])))}let a=new Map(e.map(e=>{let t=i.get(e.email?.toLowerCase())||null;return[e.id,{nombre_completo:e.nombre_completo,correo:e.email,instrumento:t}]}));return n.map(e=>{let t=a.get(e.maestro_id);return{...e,maestros:t||e.maestros||null}})}}return n.map(e=>({...e,maestros:e.maestros||null}))}function eo(e,t=[]){let n=e.maestros?.nombre_completo||`Maestro`,r=Qa[e.tipo_ausencia]||e.tipo_ausencia||`Ausencia`,i=e.estado===`pendiente`,a=e.estado===`aprobada`,o=e.fecha_inicio===e.fecha_fin?$(e.fecha_inicio):`${$(e.fecha_inicio)} → ${$(e.fecha_fin)}`,s=e.maestros?.instrumento,c=i&&s?t.filter(t=>t.instrumento===s&&t.id!==e.maestro_id).slice(0,3):[];return{id:`ausencia:${e.id}`,source:`ausencia`,sourceId:e.id,priority:i?e.urgencia===`alta`?`alta`:e.urgencia===`media`?`media`:`baja`:`info`,actionable:i,estado:e.estado,urgencia:e.urgencia,tipo_ausencia:e.tipo_ausencia,icon:i?`bi-calendar-x-fill`:a?`bi-calendar-check-fill`:`bi-calendar-minus-fill`,iconColor:i?e.urgencia===`alta`?`#ef4444`:e.urgencia===`media`?`#f59e0b`:`#6b7280`:a?`#22c55e`:`#ef4444`,category:`ausencia`,titulo:i?`${n} solicitó ausencia ${r.toLowerCase()}`:a?`Ausencia de ${n} aprobada`:`Ausencia de ${n} rechazada`,subtitulo:o,motivo:e.motivo||``,timestamp:e.created_at,timeAgo:Za(e.created_at),actionRoute:i?`admin-ausencias`:null,actionLabel:i?`Revisar`:null,suplentesSugeridos:c,maestroInstrumento:s}}async function to(){let e=Xa(7),n=new Date().toISOString().split(`T`)[0],{data:r,error:i}=await t.from(`sesiones_clase`).select(`
      id, fecha, asistencia, borrador, contenido, clase_id,
      clases:clase_id(nombre, maestro_id,
        maestros:maestro_id(nombre_completo)
      )
    `).gte(`fecha`,e).lt(`fecha`,n).order(`fecha`,{ascending:!1}).limit(200);if(i)throw i;return r||[]}function no(e){let t=e.filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),n={};for(let e of t){let t=e.clases?.maestro_id||`unknown`,r=e.clases?.maestros?.nombre_completo||`Maestro desconocido`;n[t]||(n[t]={nombre:r,count:0,ultima:e.fecha,mid:t}),n[t].count++,e.fecha>n[t].ultima&&(n[t].ultima=e.fecha)}return Object.values(n).map(e=>({id:`compliance:${e.mid}`,source:`sesion`,sourceId:e.mid,priority:e.count>=3?`alta`:e.count>=2?`media`:`baja`,actionable:!1,estado:`info`,icon:`bi-clipboard-x-fill`,iconColor:e.count>=3?`#ef4444`:e.count>=2?`#f59e0b`:`#6b7280`,category:`compliance`,titulo:`${e.nombre} tiene ${e.count} clase${e.count>1?`s`:``} sin asistencia`,subtitulo:`Última: ${$(e.ultima)} · últimos 7 días`,motivo:``,timestamp:new Date(`${e.ultima}T12:00:00`).toISOString(),timeAgo:$(e.ultima),actionRoute:null,actionLabel:null}))}async function ro(){let e=Xa(7),{data:n,error:r}=await t.from(`alumnos`).select(`id, nombre_completo, created_at`).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(20);return r?(console.warn(`[adminNotifApi] alumnos fetch warn:`,r.message),[]):n||[]}function io(e){return e.map(e=>({id:`alumno:${e.id}`,source:`alumno`,sourceId:e.id,priority:`info`,actionable:!1,estado:`info`,icon:`bi-person-plus-fill`,iconColor:`#3b82f6`,category:`alumno`,titulo:`Nuevo alumno registrado: ${e.nombre_completo||`Alumno`}`,subtitulo:`Estado: activo`,motivo:``,timestamp:e.created_at,timeAgo:Za(e.created_at),actionRoute:null,actionLabel:null}))}async function ao(){let{data:e,error:n}=await t.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1}).limit(20);return n?(console.warn(`[adminNotifApi] pending teachers fetch warn:`,n.message),[]):e||[]}function oo(e){return{id:`maestro-pendiente:${e.id}`,source:`maestro`,sourceId:e.id,priority:`alta`,actionable:!0,estado:`pendiente`,icon:`bi-person-badge-fill`,iconColor:`#ef4444`,category:`maestro`,titulo:`Nuevo maestro registrado esperando aprobación: ${e.nombre_completo||`Maestro`}`,subtitulo:`Email: ${e.email}`,motivo:``,timestamp:e.created_at,timeAgo:Za(e.created_at),actionRoute:`admin-aprobacion`,actionLabel:`Ver Aprobaciones`}}async function so(){let{data:e,error:n}=await t.from(`maestros`).select(`id, nombre_completo, correo, especialidad`).eq(`activo`,!0);return n?(console.warn(`[adminNotifApi] active maestros fetch warn:`,n.message),[]):(e||[]).map(e=>({id:e.id,nombre_completo:e.nombre_completo,email:e.correo,instrumento:e.especialidad}))}async function co(){let e=Xa(30),{data:n,error:r}=await t.from(`asistencias`).select(`
      alumno_id, estado, fecha,
      alumnos:alumno_id(nombre_completo)
    `).gte(`fecha`,e).order(`fecha`,{ascending:!1});if(r)return console.warn(`[adminNotifApi] early warning fetch warn:`,r.message),[];let i={};for(let e of n||[]){let t=e.alumno_id;t&&(i[t]||(i[t]={nombre:e.alumnos?.nombre_completo||`Estudiante`,asistencias:[]}),i[t].asistencias.push(e.estado))}let a=[];for(let[e,t]of Object.entries(i)){let n=t.asistencias.length;if(n<3)continue;let r=0;for(let e of t.asistencias)if(e===`A`||e===`ausente`)r++;else if(e===`P`||e===`presente`||e===`T`||e===`tarde`)break;if(r>=3){a.push({id:`riesgo-alumno-ausencias:${e}`,source:`riesgo`,sourceId:e,priority:`alta`,actionable:!1,estado:`info`,icon:`bi-exclamation-triangle-fill`,iconColor:`#ef4444`,category:`compliance`,titulo:`Riesgo de Deserción: ${t.nombre}`,subtitulo:`Acumula ${r} inasistencias consecutivas en los últimos 30 días.`,motivo:`Acción recomendada: Contactar de urgencia al tutor legal o revisar ficha médica.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`admin-alumnos`,actionLabel:`Ver Ficha`});continue}let i=t.asistencias.filter(e=>e===`P`||e===`presente`).length,o=i/n;o<.7&&a.push({id:`riesgo-alumno-rate:${e}`,source:`riesgo`,sourceId:e,priority:`media`,actionable:!1,estado:`info`,icon:`bi-graph-down`,iconColor:`#f59e0b`,category:`compliance`,titulo:`Bajo Compliance Académico: ${t.nombre}`,subtitulo:`Asistencia del ${Math.round(o*100)}% en los últimos 30 días (${i} de ${n} clases).`,motivo:`Acción recomendada: Coordinar entrevista de seguimiento y analizar tutoría.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`admin-alumnos`,actionLabel:`Ver Ficha`})}return a}async function lo(){let[e,t,n,r,i,a]=await Promise.allSettled([$a(),to(),ro(),ao(),so(),co()]),o=[];try{o=await so()}catch(e){console.warn(`[adminNotifApi] fallback active maestros failed:`,e)}let s=e.status===`fulfilled`?e.value.map(e=>eo(e,o)):[],c=t.status===`fulfilled`?no(t.value):[],l=n.status===`fulfilled`?io(n.value):[],u=r.status===`fulfilled`?r.value.map(oo):[],d=a.status===`fulfilled`?a.value:[],f=[...s,...c,...l,...u,...d],p={alta:0,media:1,baja:2,info:3};return f.sort((e,t)=>{if(e.actionable!==t.actionable)return e.actionable?-1:1;let n=p[e.priority]??4,r=p[t.priority]??4;return n===r?(t.timestamp||``).localeCompare(e.timestamp||``):n-r}),f}function uo(){if(document.getElementById(`anv-styles`))return;let e=document.createElement(`style`);e.id=`anv-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}var fo=[{key:`all`,label:`Todo`,icon:`bi-grid-fill`},{key:`ausencia`,label:`Ausencias`,icon:`bi-calendar-x-fill`},{key:`compliance`,label:`Alertas`,icon:`bi-exclamation-triangle-fill`},{key:`alumno`,label:`Novedades`,icon:`bi-person-plus-fill`}],po={ausencia:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`},compliance:{bg:`rgba(245,158,11,0.1)`,color:`#f59e0b`},alumno:{bg:`rgba(59,130,246,0.1)`,color:`#3b82f6`},maestro:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`}},mo={ausencia:`Ausencia`,compliance:`Alerta`,alumno:`Novedad`,maestro:`Seguridad`},ho={aprobada:{label:`Aprobada`,bg:`rgba(34,197,94,0.12)`,color:`#16a34a`,icon:`bi-check-circle-fill`},rechazada:{label:`Rechazada`,bg:`rgba(239,68,68,0.12)`,color:`#dc2626`,icon:`bi-x-circle-fill`},pendiente:{label:`Pendiente`,bg:`rgba(245,158,11,0.12)`,color:`#d97706`,icon:`bi-hourglass-split`}};async function go(e){uo(),`Notification`in window&&Notification.permission===`default`&&Notification.requestPermission();let n=[],r=`all`,i=``,a=null;function s(){e.innerHTML=`
      <div class="anv-root">
        <div class="anv-header">
          <div class="anv-title-row d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="anv-title-left">
              <div class="anv-icon-wrap"><i class="bi bi-bell-fill"></i></div>
              <h2 class="anv-title">Centro de Actividad</h2>
            </div>
            <button id="anv-btn-help" class="btn btn-sm btn-outline-light rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-2 transition-all" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.25); color: white; cursor: pointer;">
              <i class="bi bi-question-circle-fill"></i>
              <span>Guía del Usuario</span>
            </button>
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
    `,e.querySelector(`#anv-search-bar`)?.addEventListener(`input`,e=>{i=e.target.value,p()}),e.querySelectorAll(`[data-kpi]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),r=t.dataset.kpi,c(),p()})}),e.querySelector(`#anv-btn-help`)?.addEventListener(`click`,()=>{h()})}function c(){let t=e.querySelector(`#anv-filters`);if(!t)return;t.innerHTML=``;let i={};for(let e of n)i[e.category]=(i[e.category]||0)+1;fo.forEach(a=>{let o=a.key===`all`?n.length:i[a.key]||0,s=r===a.key,l=document.createElement(`button`);l.className=`anv-filter-btn`+(s?` active`:``),l.dataset.filter=a.key,l.innerHTML=`<i class="bi ${a.icon}"></i> ${a.label} <span class="anv-filter-count">${o}</span>`,l.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`));let t=e.querySelector(`[data-kpi="${a.key}"]`);t&&t.classList.add(`active`),r=a.key,p(),c()}),t.appendChild(l)})}function l(){let t=n.length,r=n.filter(e=>e.actionable||e.priority===`alta`).length,i=n.filter(e=>e.category===`compliance`).length,a=n.filter(e=>e.category===`alumno`||e.category===`maestro`).length,o=e.querySelector(`#kpi-todo`),s=e.querySelector(`#kpi-criticas`),c=e.querySelector(`#kpi-compliance`),l=e.querySelector(`#kpi-novedades`);o&&(o.textContent=t),s&&(s.textContent=r),c&&(c.textContent=i),l&&(l.textContent=a)}function u(e,t){if(`Notification`in window&&Notification.permission===`granted`)try{new Notification(e,{body:t,icon:`/img/icons/icon-192x192.png`,vibrate:[200,100,200],tag:`soi-admin-notif`})}catch(e){console.warn(`[Web Push] Fallback via SW required:`,e)}}function d(){a||=t.channel(`admin-feed-channel`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`ausencias_maestros`},async e=>{console.log(`[Realtime WebSocket] Nueva ausencia detectada:`,e),u(`Nueva Ausencia Solicitada`,`Un maestro ha enviado una solicitud de ausencia urgente.`),await m(!0)}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`ausencias_maestros`},async()=>{await m(!0)}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`profiles`},async e=>{e.new&&e.new.rol===`maestro`&&(console.log(`[Realtime WebSocket] Nuevo maestro registrado:`,e),u(`Nuevo Registro de Seguridad`,`${e.new.nombre_completo} se ha registrado esperando aprobación.`),await m(!0))}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`asistencias`},async()=>{await m(!0)}).subscribe(t=>{let n=e.querySelector(`#anv-refresh-btn`);n&&(t===`SUBSCRIBED`?(n.innerHTML=`<i class="bi bi-broadcast text-success animate-pulse"></i> Feed en Vivo`,n.style.borderColor=`rgba(34,197,94,0.3)`,n.title=`Conectado mediante WebSockets en tiempo real.`):(n.innerHTML=`<i class="bi bi-exclamation-triangle-fill text-warning"></i> Re-conectar`,n.style.borderColor=`rgba(245,158,11,0.3)`,n.title=`WebSockets inactivos. Haz clic para actualizar manualmente.`))})}function f(e,n){let r=document.createElement(`div`);r.className=`anv-event`,r.dataset.priority=e.priority,r.dataset.category=e.category;let i=po[e.category]||{bg:`rgba(99,102,241,0.12)`,color:`#6366f1`},a=mo[e.category]||e.category,o=``;if((e.source===`ausencia`||e.source===`maestro`)&&!e.actionable){let t=ho[e.estado===`activo`?`aprobada`:e.estado===`rechazado`?`rechazada`:e.estado];t&&(o=`
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
      `);let c=``;return e.actionable&&e.source===`ausencia`?c=`
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
      `:e.actionable&&e.source===`maestro`?c=`
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
      `:e.actionRoute&&(c=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${e.actionRoute}">
            <i class="bi bi-arrow-right-circle"></i> ${e.actionLabel||`Ver`}
          </button>
        </div>
      `),r.innerHTML=`
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
        ${c}
      </div>
    `,r.querySelectorAll(`[data-action]`).forEach(i=>{i.addEventListener(`click`,async a=>{a.stopPropagation();let o=i.dataset.action;if(o===`goto`){let e=window.router||se;e&&e.navigate(i.dataset.route);return}if(o===`notify-sub`){let e=i.dataset.subName;i.disabled=!0,i.innerHTML=`<i class="bi bi-check-lg"></i> Propuesto`,i.className=`anv-suplente-btn notified`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Propuesta de suplencia enviada a ${e}`,type:`success`}}));return}if(r.querySelectorAll(`[data-action="approve"],[data-action="reject"],[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!0),o===`approve`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await Ma(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia aprobada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`aprobada`,e.priority=`info`,e.icon=`bi-calendar-check-fill`,e.iconColor=`#22c55e`;let t=f(e,n);t.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(t),l(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(o===`reject`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await Na(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia rechazada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazada`,e.priority=`info`,e.icon=`bi-calendar-minus-fill`,e.iconColor=`#ef4444`;let t=f(e,n);t.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(t),l(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}else if(o===`approve-maestro`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:i}=await t.from(`profiles`).update({estado:`activo`}).eq(`id`,e.sourceId);if(i)throw i;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro aprobado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`activo`,e.priority=`info`,e.icon=`bi-person-check-fill`,e.iconColor=`#22c55e`,e.titulo=`Maestro registrado aprobado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let a=f(e,n);a.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(a),l()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(o===`reject-maestro`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:i}=await t.from(`profiles`).update({estado:`rechazado`}).eq(`id`,e.sourceId);if(i)throw i;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro rechazado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazado`,e.priority=`info`,e.icon=`bi-person-dash-fill`,e.iconColor=`#ef4444`,e.titulo=`Maestro registrado rechazado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let a=f(e,n);a.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(a),l()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}})}),r}function p(){let t=e.querySelector(`#anv-body`),a=e.querySelector(`#anv-showing`);if(!t)return;let o=n;if(r===`critica`?o=n.filter(e=>e.actionable||e.priority===`alta`):r!==`all`&&(o=n.filter(e=>e.category===r)),i.trim().length>0){let e=i.toLowerCase().trim();o=o.filter(t=>(t.titulo||``).toLowerCase().includes(e)||(t.subtitulo||``).toLowerCase().includes(e)||(t.motivo||``).toLowerCase().includes(e)||(t.maestroInstrumento||``).toLowerCase().includes(e))}if(a&&(a.textContent=o.length===0?`Sin eventos encontrados`:`${o.length} evento${o.length>1?`s`:``}`),o.length===0){t.innerHTML=`
        <div class="anv-center">
          <div class="anv-center-icon"><i class="bi bi-check-circle"></i></div>
          <p class="anv-center-title">Sin novedades</p>
          <p class="anv-center-sub">No hay eventos que coincidan con la búsqueda o el filtro activo.</p>
        </div>
      `;return}t.innerHTML=``;let s=document.createElement(`div`);s.className=`anv-timeline`,o.forEach(e=>{s.appendChild(f(e,()=>m(!0)))}),t.appendChild(s)}async function m(t=!1){let r=e.querySelector(`#anv-refresh-btn`),i=e.querySelector(`#anv-body`);r&&!t&&r.classList.add(`spinning`),i&&n.length===0&&(i.innerHTML=`
        <div class="anv-loading">
          <div class="anv-spinner"></div>
          <span>Cargando actividad operativa...</span>
        </div>
      `);try{n=await lo(),l(),c(),p(),d()}catch(t){console.error(`[adminNotificacionesView] load error:`,t);let r=e.querySelector(`#anv-body`);r&&n.length===0&&(r.innerHTML=`
          <div class="anv-center">
            <div class="anv-center-icon"><i class="bi bi-exclamation-triangle"></i></div>
            <p class="anv-center-title">Error al cargar</p>
            <p class="anv-center-sub">${t.message}</p>
          </div>
        `)}finally{r&&r.classList.remove(`spinning`)}}function h(){o.open({title:`Guía del Usuario — Centro de Actividad`,body:`
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
    `,size:`lg`,hideSave:!0,cancelText:`Entendido`})}s(),await m(),e.querySelector(`#anv-refresh-btn`)?.addEventListener(`click`,()=>m(!1))}export{je as $,Rt as A,Ft as B,Zt as C,$t as D,qt as E,jt as F,Ct as G,Et as H,It as I,pt as J,ht as K,Dt as L,Vt as M,Lt as N,Ht as O,Pt as P,Ve as Q,Nt as R,Yt as S,en as T,Tt as U,Mt as V,kt as W,vt as X,yt as Y,He as Z,ln as _,ma as a,Ce as at,Gt as b,zi as c,ce as ct,Ri as d,C as et,Lr as f,N as g,vn as h,Ea as i,De as it,Bt as j,zt as k,Li as l,Kn as m,Ya as n,Ee as nt,fa as o,ke as ot,W as p,mt as q,Aa as r,xe as rt,Wi as s,Oe as st,go as t,Se as tt,Bi as u,cn as v,Xt as w,Qt as x,sn as y,At as z};