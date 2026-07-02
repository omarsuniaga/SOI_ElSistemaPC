import{i as e}from"./supabase-Dhe7Tlxd.js";import{i as t}from"./maestroAuth-CdApllXF.js";function n(){let e=0;document.addEventListener(`touchstart`,t=>{t.touches.length===1&&(e=t.touches[0].clientY)},{passive:!0}),document.addEventListener(`touchmove`,t=>{if(t.touches.length===1&&t.touches[0].clientY-e>0){let e=t.target,n=!1,r=!1;for(;e&&e!==document.body&&e!==document.documentElement;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentNode;continue}let t=window.getComputedStyle(e);if(!t){e=e.parentNode;continue}let i=t.overflowY;if((i===`auto`||i===`scroll`)&&e.scrollHeight>e.clientHeight){r=!0,e.scrollTop<=0&&(n=!0);break}e=e.parentNode}r||(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop)<=0&&(n=!0),n&&t.cancelable&&t.preventDefault()}},{passive:!1})}var r={misClases:6e5,horarios:6e5,sesiones:12e4,inscripciones:6e5,salones:36e5,ausencias:12e4,metricasSesiones:12e4},i=new Map,a=new Map;function o(e){let t=a.get(e);return t?Date.now()-t.timestamp<t.ttl:!1}function s(e,t,n){i.set(e,t),a.set(e,{timestamp:Date.now(),ttl:n||6e4})}function c(e){return o(e)?i.get(e):(i.delete(e),a.delete(e),null)}function l(e,t,n){s(e,t,r[n]||6e4)}function u(e){for(let t of i.keys())t.includes(e)&&(i.delete(t),a.delete(t))}function d(){i.clear(),a.clear()}function f(e){return c(e)}function p(){return[...i.keys()]}var m={get:c,set:l,invalidate:u,invalidateAll:d,getCached:f,_keys:p},h={MIS_CLASES:`mis_clases`,HORARIOS:`horarios`,SESIONES:`sesiones`,INSCRIPCIONES:`inscripciones`,SALONES:`salones`,AUSENCIAS:`ausencias`,RUTAS:`rutas`,EMERGENTES:`emergentes`};async function g(){let e=t();return e?.id?e.id:null}async function _(t=!1){if(typeof process<`u`&&{}.VITEST)return[{id:`550e8400-e29b-41d4-a716-446655440000`,nombre:`Violin 101`,instrumento:`Violin`,capacidad_maxima:20,maestro_principal_id:`dc73014a-9528-4081-84eb-f713b72031ff`}];let n=await g();if(!n)return[];if(!t){let e=m.getCached(`${h.MIS_CLASES}_${n}`);if(e)return e}let{data:r,error:i}=await e.from(`clases`).select(`id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id`).or(`maestro_principal_id.eq.${n},maestro_suplente_id.eq.${n},maestro_id.eq.${n}`);if(i)return console.warn(`[MaestroData] Error cargando clases:`,i.message),[];let a=r||[];return m.set(`${h.MIS_CLASES}_${n}`,a,`misClases`),a}async function v(t,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,dia:`jueves`,hora_inicio:`08:00:00`,hora_fin:`09:00:00`,salon_id:`salon-1`}];if(!t||t.length===0)return[];let r=`horarios_${t.sort().join(`,`)}`;if(!n){let e=m.getCached(r);if(e)return e}let{data:i,error:a}=await e.from(`clase_horarios`).select(`hora_inicio, hora_fin, salon_id, clase_id, dia`).in(`clase_id`,t);if(a)return console.warn(`[MaestroData] Error cargando horarios:`,a.message),[];let o=i||[];return m.set(r,o,`horarios`),o}async function y(t,n,r,i=!1){if(!t)return[];if(!i){let e=b(t,n,r);if(e){let t=m.getCached(e);if(t)return t.filter(e=>e.fecha>=n&&e.fecha<=r)}let i=`sesiones_${t}_${n}_${r}`,a=m.getCached(i);if(a)return a}let{data:a,error:o}=await e.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,t).gte(`fecha`,n).lte(`fecha`,r);if(o)return console.warn(`[MaestroData] Error cargando sesiones:`,o.message),[];let s=a||[];return m.set(`sesiones_${t}_${n}_${r}`,s,`sesiones`),s}function b(e,t,n){let r=`sesiones_${e}_`;for(let e of x()){if(!e.startsWith(r))continue;let i=e.replace(r,``).split(`_`);if(i.length===2){let[r,a]=i;if(r<=t&&a>=n)return e}}return null}function x(){return m._keys?m._keys():[]}async function S(t,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`1`,alumnos:{id:`1`,nombre_completo:`Estudiante 1`,instrumento_principal:`Violin`}},{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`2`,alumnos:{id:`2`,nombre_completo:`Estudiante 2`,instrumento_principal:`Violin`}}];if(!t||t.length===0)return[];let r=`inscripciones_${t.sort().join(`,`)}`;if(!n){let e=m.getCached(r);if(e)return e}let{data:i,error:a}=await e.from(`alumnos_clases`).select(`clase_id, alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).in(`clase_id`,t).eq(`activo`,!0);if(a)return console.warn(`[MaestroData] Error cargando inscripciones:`,a.message),[];let o=i||[];return m.set(r,o,`inscripciones`),o}async function C(t,n=!1){if(!t||t.length===0)return[];let r=`salones_${t.sort().join(`,`)}`;if(!n){let e=m.getCached(r);if(e)return e}let{data:i,error:a}=await e.from(`salones`).select(`id, nombre`).in(`id`,t);if(a)return console.warn(`[MaestroData] Error cargando salones:`,a.message),[];let o=i||[];return m.set(r,o,`salones`),o}async function w(){let e=await g();if(!e)return;let t=await _(),n=t.map(e=>e.id);if(n.length===0)return;let r=new Date,i=new Date(r.getFullYear(),r.getMonth(),1),a=new Date(r.getFullYear(),r.getMonth()+1,0),o=new Date(r);o.setDate(o.getDate()-28);let s=o<i?o.toISOString().split(`T`)[0]:i.toISOString().split(`T`)[0],c=a.toISOString().split(`T`)[0],[l,u,,d]=await Promise.all([v(n),S(n),y(e,s,c),Promise.resolve(null)]),f=[...new Set(l.map(e=>e.salon_id).filter(Boolean))];f.length>0&&await C(f),console.log(`[Prefetch] Mes cargado: ${t.length} clases, ${l.length} horarios, ${u.length} inscripciones`)}async function T(t,n){if(!t||!n)return[];let r=`emergentes_${t}_${n}`,i=m.getCached(r);if(i)return i;let{data:a,error:o}=await e.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,t).eq(`fecha`,n).order(`hora_inicio`,{ascending:!0,nullsFirst:!1});if(o)return console.warn(`[MaestroData] Error cargando clases emergentes:`,o.message),[];let s=a||[];return m.set(r,s,`emergentes`),s}function E(){m.invalidate(`mis_clases`),m.invalidate(`horarios`),m.invalidate(`inscripciones`),m.invalidate(`sesiones`)}var D=null,O=null,k=null;({init(){window.pwaInstaller=this,this._injectStyles(),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),D=e}),window.addEventListener(`appinstalled`,()=>{localStorage.setItem(`pwa-installed`,`true`),D=null})},async evaluateInsights(){let e=t();if(e?.id)try{let t=await _(),n=new Date,r=new Date(n.getTime()-10080*60*1e3),i=n.toISOString().split(`T`)[0],a=r.toISOString().split(`T`)[0],o=await y(e.id,a,i),s=[],c=(o||[]).filter(e=>e.borrador===!0);if(c.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre]));if(c.length===1){let t=c[0],n=e[t.clase_id]||`Clase`,r=t.fecha?t.fecha.split(`-`).reverse().slice(0,2).join(`/`):``,i=r?` del ${r}`:``;s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tienes el registro de ${n}${i} en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${t.clase_id}&fecha=${t.fecha}`)}})}else{let e=c[0];s.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tienes ${c.length} registros de clase en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${e.clase_id}&fecha=${e.fecha}`)}})}}let l=new Set((t||[]).map(e=>e.id)),u=(o||[]).filter(e=>{if(e.fecha>=i||!l.has(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)});if(u.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre])),n=u[0],r=e[n.clase_id]||`Clase`,i=n.fecha?n.fecha.split(`-`).reverse().slice(0,2).join(`/`):``;s.push({id:`sessions-without-attendance`,priority:`high`,icon:`bi-clipboard-x-fill`,text:u.length===1?`${r} del ${i} quedó sin registrar asistencia.`:`Tienes ${u.length} clases sin asistencia registrada esta semana.`,actionLabel:`Registrar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${n.clase_id}&fecha=${n.fecha}`)}})}e.telefono||e.tlf||s.push({id:`profile-incomplete`,priority:`medium`,icon:`bi-person-exclamation`,text:`Completa tu número de teléfono en tu perfil de usuario.`,actionLabel:`Completar`,action:()=>{window.router&&window.router.navigate(`perfil`)}}),D!==null&&!this._isStandalone()&&s.push({id:`pwa-install-prompt`,priority:`medium`,icon:`bi-download`,text:`Instala SOI Maestros en tu pantalla de inicio para acceso rápido sin conexión.`,actionLabel:`Instalar`,action:()=>{this.promptInstall()}}),(!t||t.length===0)&&s.push({id:`no-classes-assigned`,priority:`low`,icon:`bi-info-circle-fill`,text:`No tienes clases asignadas en el sistema actualmente.`,actionLabel:`Soporte`,action:()=>{window.router&&window.router.navigate(`perfil`)}});let d=s.filter(e=>{let t=localStorage.getItem(`soi-dismissed-${e.id}`);return t?Date.now()-parseInt(t,10)>10080*60*1e3:!0});if(d.length>0){let e=d[0];if(this.currentAlertId===e.id&&this.currentAlertText===e.text)return;this._showInsightBanner(e)}else this.dismissBanner()}catch(e){console.warn(`[SmartInsights] Error al evaluar alertas:`,e)}},_showInsightBanner(e){let t=document.getElementById(`pwa-smart-banner`)||O;if(t){let n=t.querySelector(`.psb-capsule`);if(n){n.style.transition=`opacity 0.2s ease`,n.style.opacity=`0`,setTimeout(()=>{let t=n.querySelector(`.psb-severity-dot`);t&&(t.className=`psb-severity-dot ${e.priority}`,t.innerHTML=`<i class="bi ${e.icon}"></i>`);let r=n.querySelector(`.psb-title`);r&&(r.textContent=e.text);let i=n.querySelector(`#pwa-banner-action`);if(i){i.innerHTML=`<span>${e.actionLabel}</span>`;let t=i.cloneNode(!0);i.parentNode.replaceChild(t,i),t.addEventListener(`click`,()=>{e.action()})}let a=n.querySelector(`#pwa-banner-close`);if(a){let t=a.cloneNode(!0);a.parentNode.replaceChild(t,a),t.addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})}this.currentAlertId=e.id,this.currentAlertText=e.text,n.style.opacity=`1`},200);return}}O=document.createElement(`div`),O.id=`pwa-smart-banner`,O.setAttribute(`role`,`status`),O.setAttribute(`aria-live`,`polite`),O.innerHTML=`
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
    `,document.body.prepend(O),this.currentAlertId=e.id,this.currentAlertText=e.text,requestAnimationFrame(()=>{requestAnimationFrame(()=>O?.classList.add(`psb-visible`))}),document.getElementById(`pwa-banner-action`).addEventListener(`click`,()=>{e.action()}),document.getElementById(`pwa-banner-close`).addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})},dismissBanner(){if(this.currentAlertId=null,this.currentAlertText=null,!O)return;O.classList.remove(`psb-visible`);let e=O;O=null,setTimeout(()=>{e.remove()},400)},promptInstall(){/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():D?this._triggerNativeInstall():this._showDesktopGuide()},async _triggerNativeInstall(){if(!D){this._showDesktopGuide();return}try{await D.prompt();let{outcome:e}=await D.userChoice;e===`accepted`&&localStorage.setItem(`pwa-installed`,`true`)}catch(e){console.warn(`[PWA] Error al mostrar prompt:`,e)}finally{D=null}},_showIOSGuide(){if(k)return;k=document.createElement(`div`),k.id=`pwa-guide-modal`,k.innerHTML=`
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
    `,document.body.appendChild(k);let e=()=>{k?.classList.add(`pgm-hiding`),setTimeout(()=>{k?.remove(),k=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_showDesktopGuide(){if(k)return;k=document.createElement(`div`),k.id=`pwa-guide-modal`,k.innerHTML=`
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
    `,document.body.appendChild(k);let e=()=>{k?.classList.add(`pgm-hiding`),setTimeout(()=>{k?.remove(),k=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_isStandalone(){return window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`},_injectStyles(){if(document.getElementById(`pwa-installer-styles`))return;let e=document.createElement(`style`);e.id=`pwa-installer-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}}).init();export{C as a,w as c,_ as i,n as l,v as n,y as o,S as r,E as s,T as t};