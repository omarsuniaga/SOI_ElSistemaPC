const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/maestroRouteService-C-CCRznf.js","assets/AppModal-Du6jXNYA.js","assets/supabase-Cgh_dhNB.js","assets/groqService-BEo2aU8D.js"])))=>i.map(i=>d[i]);
import{a as e,i as t}from"./supabase-Cgh_dhNB.js";import{i as n,s as r}from"./maestroAuth-BMzDPnai.js";function i(){let e=0;document.addEventListener(`touchstart`,t=>{t.touches.length===1&&(e=t.touches[0].clientY)},{passive:!0}),document.addEventListener(`touchmove`,t=>{if(t.touches.length===1&&t.touches[0].clientY-e>0){let e=t.target,n=!1,r=!1;for(;e&&e!==document.body&&e!==document.documentElement;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentNode;continue}let t=window.getComputedStyle(e);if(!t){e=e.parentNode;continue}let i=t.overflowY;if((i===`auto`||i===`scroll`)&&e.scrollHeight>e.clientHeight){r=!0,e.scrollTop<=0&&(n=!0);break}e=e.parentNode}r||(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop)<=0&&(n=!0),n&&t.cancelable&&t.preventDefault()}},{passive:!1})}var a={MIS_CLASES:`mis_clases`,HORARIOS:`horarios`,SESIONES:`sesiones`,INSCRIPCIONES:`inscripciones`,SALONES:`salones`,AUSENCIAS:`ausencias`,RUTAS:`rutas`,EMERGENTES:`emergentes`};async function o(){let e=n();return e?.id?e.id:null}async function s(e=!1){if(typeof process<`u`&&{}.VITEST)return[{id:`550e8400-e29b-41d4-a716-446655440000`,nombre:`Violin 101`,instrumento:`Violin`,capacidad_maxima:20,maestro_principal_id:`dc73014a-9528-4081-84eb-f713b72031ff`}];let n=await o();if(!n)return[];if(!e){let e=r.getCached(`${a.MIS_CLASES}_${n}`);if(e)return e}let{data:i,error:s}=await t.from(`clases`).select(`id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id`).or(`maestro_principal_id.eq.${n},maestro_suplente_id.eq.${n},maestro_id.eq.${n}`);if(s)return console.warn(`[MaestroData] Error cargando clases:`,s.message),[];let c=i||[];return r.set(`${a.MIS_CLASES}_${n}`,c,`misClases`),c}async function c(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,dia:`jueves`,hora_inicio:`08:00:00`,hora_fin:`09:00:00`,salon_id:`salon-1`}];if(!e||e.length===0)return[];let i=`horarios_${e.sort().join(`,`)}`;if(!n){let e=r.getCached(i);if(e)return e}let{data:a,error:o}=await t.from(`clase_horarios`).select(`hora_inicio, hora_fin, salon_id, clase_id, dia`).in(`clase_id`,e);if(o)return console.warn(`[MaestroData] Error cargando horarios:`,o.message),[];let s=a||[];return r.set(i,s,`horarios`),s}async function l(e,n,i,a=!1){if(!e)return[];if(!a){let t=u(e,n,i);if(t){let e=r.getCached(t);if(e)return e.filter(e=>e.fecha>=n&&e.fecha<=i)}let a=`sesiones_${e}_${n}_${i}`,o=r.getCached(a);if(o)return o}let{data:o,error:s}=await t.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,e).gte(`fecha`,n).lte(`fecha`,i);if(s)return console.warn(`[MaestroData] Error cargando sesiones:`,s.message),[];let c=o||[];return r.set(`sesiones_${e}_${n}_${i}`,c,`sesiones`),c}function u(e,t,n){let r=`sesiones_${e}_`;for(let e of d()){if(!e.startsWith(r))continue;let i=e.replace(r,``).split(`_`);if(i.length===2){let[r,a]=i;if(r<=t&&a>=n)return e}}return null}function d(){return r._keys?r._keys():[]}async function f(e,n=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`1`,alumnos:{id:`1`,nombre_completo:`Estudiante 1`,instrumento_principal:`Violin`}},{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`2`,alumnos:{id:`2`,nombre_completo:`Estudiante 2`,instrumento_principal:`Violin`}}];if(!e||e.length===0)return[];let i=`inscripciones_${e.sort().join(`,`)}`;if(!n){let e=r.getCached(i);if(e)return e}let{data:a,error:o}=await t.from(`alumnos_clases`).select(`clase_id, alumno_id, hora_inicio, hora_fin, alumnos(id, nombre_completo, instrumento_principal)`).in(`clase_id`,e).eq(`activo`,!0);if(o)return console.warn(`[MaestroData] Error cargando inscripciones:`,o.message),[];let s=a||[];return r.set(i,s,`inscripciones`),s}async function p(e,n=!1){if(!e||e.length===0)return[];let i=`salones_${e.sort().join(`,`)}`;if(!n){let e=r.getCached(i);if(e)return e}let{data:a,error:o}=await t.from(`salones`).select(`id, nombre`).in(`id`,e);if(o)return console.warn(`[MaestroData] Error cargando salones:`,o.message),[];let s=a||[];return r.set(i,s,`salones`),s}async function m(){let e=await o();if(!e)return;let t=await s(),n=t.map(e=>e.id);if(n.length===0)return;let r=new Date,i=new Date(r.getFullYear(),r.getMonth(),1),a=new Date(r.getFullYear(),r.getMonth()+1,0),u=new Date(r);u.setDate(u.getDate()-28);let d=u<i?u.toISOString().split(`T`)[0]:i.toISOString().split(`T`)[0],m=a.toISOString().split(`T`)[0],[h,g,,_]=await Promise.all([c(n),f(n),l(e,d,m),Promise.resolve(null)]),v=[...new Set(h.map(e=>e.salon_id).filter(Boolean))];v.length>0&&await p(v),console.log(`[Prefetch] Mes cargado: ${t.length} clases, ${h.length} horarios, ${g.length} inscripciones`)}async function h(e,n){if(!e||!n)return[];let i=`emergentes_${e}_${n}`,a=r.getCached(i);if(a)return a;let{data:o,error:s}=await t.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,e).eq(`fecha`,n).order(`hora_inicio`,{ascending:!0,nullsFirst:!1});if(s)return console.warn(`[MaestroData] Error cargando clases emergentes:`,s.message),[];let c=o||[];return r.set(i,c,`emergentes`),c}function g(){r.invalidate(`mis_clases`),r.invalidate(`horarios`),r.invalidate(`inscripciones`),r.invalidate(`sesiones`)}async function _(t,n,i=!1){if(!t||!n)return[];let a=`personal_routes_${t}_${n}`;if(!i){let e=r.getCached(a);if(e)return e}try{let{getTeacherRoutes:i}=await e(async()=>{let{getTeacherRoutes:e}=await import(`./maestroRouteService-C-CCRznf.js`).then(e=>e.s);return{getTeacherRoutes:e}},__vite__mapDeps([0,1,2,3])),o=await i(t,n);return r.set(a,o,`personal_routes`),o}catch(e){return console.warn(`[MaestroData] Error cargando rutas personales:`,e.message),[]}}async function v(e,n){if(!e||!n)return[];let i=`check_states_${e}_${n}`,a=r.getCached(i);if(a)return a;try{let{data:a,error:o}=await t.from(`maestro_unidades`).select(`id`).eq(`ruta_id`,e);if(o)return console.warn(`[MaestroData] Error loading unidades:`,o.message),[];let s=(a||[]).map(e=>e.id);if(s.length===0)return[];let{data:c,error:l}=await t.from(`maestro_objetivos`).select(`id`).in(`unidad_id`,s);if(l)return console.warn(`[MaestroData] Error loading objetivos:`,l.message),[];let u=(c||[]).map(e=>e.id);if(u.length===0)return[];let{data:d,error:f}=await t.from(`maestro_indicadores`).select(`id`).in(`objetivo_id`,u);if(f)return console.warn(`[MaestroData] Error loading indicators:`,f.message),[];let p=(d||[]).map(e=>e.id);if(p.length===0)return[];let{count:m,error:h}=await t.from(`alumnos_clases`).select(`alumno_id`,{count:`exact`,head:!0}).eq(`clase_id`,n).eq(`activo`,!0);if(h)return console.warn(`[MaestroData] Error loading alumnos inscritos:`,h.message),p.map(e=>({indicador_id:e,check_state:`none`}));let{data:g,error:_}=await t.from(`evaluacion_indicador`).select(`maestro_indicador_id, alumno_id, recovery_status`).in(`maestro_indicador_id`,p).eq(`clase_id`,n);if(_)return console.warn(`[MaestroData] Error loading evaluations:`,_.message),p.map(e=>({indicador_id:e,check_state:`none`}));let v=new Map;for(let e of g||[]){let t=v.get(e.maestro_indicador_id)||[];t.push(e),v.set(e.maestro_indicador_id,t)}let y=p.map(e=>{let t=v.get(e)||[];if(t.length===0)return{indicador_id:e,check_state:`none`};let n=t.some(e=>e.recovery_status===`pendiente`||e.recovery_status===null),r=(m??t.length)>t.length;return{indicador_id:e,check_state:n||r?`single`:`double`,stats:{evaluados:t.length,total:m??t.length}}});return r.set(i,y,`check_states`),y}catch(e){return console.error(`[MaestroData] getIndicadorCheckStates error:`,e),[]}}async function y({alumnoId:e,indicadorId:n,claseId:i,nota:a,observaciones:o,evaluadoPor:s}){if(!e||!n||!i)throw Error(`Missing required parameters: alumnoId, indicadorId, claseId`);let{data:c,error:l}=await t.from(`evaluacion_indicador`).upsert({alumno_id:e,maestro_indicador_id:n,clase_id:i,nota:a??null,observaciones:o??null,recovery_status:`no_aplica`,evaluado_por:s||null},{onConflict:`alumno_id,maestro_indicador_id,clase_id`}).select();if(l)throw Error(`Failed to save nota: ${l.message}`);return r.invalidate(`check_states`),c[0]||{}}async function b(e,n,i,a,o,s,c){if(!e||!n||!i)throw Error(`Missing required parameters: alumnoId, indicadorId, claseId`);if(a!==`recuperado`&&a!==`no_recuperable`)throw Error(`Invalid recovery status: ${a}`);try{let{data:l,error:u}=await t.from(`evaluacion_indicador`).upsert({alumno_id:e,maestro_indicador_id:n,clase_id:i,recovery_status:a,recovery_notes:o||null,recovery_timestamp:new Date().toISOString(),recovery_grade:s||null,evaluado_por:c||null},{onConflict:`alumno_id,maestro_indicador_id,clase_id`}).select();if(u)throw Error(`Failed to update recovery status: ${u.message}`);return r.invalidate(`check_states`),a===`recuperado`&&await x(e,n,i),l[0]||{}}catch(e){throw console.error(`[MaestroData] updateRecoveryStatus error:`,e),e}}async function x(e,n,r){try{let{data:i,error:a}=await t.from(`indicador_prerequisito`).select(`indicador_id`).eq(`prerequisito_indicador_id`,n);if(a||!i||i.length===0)return;let o=i.map(e=>e.indicador_id),{error:s}=await t.from(`evaluacion_indicador`).update({review_flag:!0}).eq(`alumno_id`,e).eq(`clase_id`,r).in(`maestro_indicador_id`,o);s&&console.warn(`[MaestroData] Warning flagging dependent indicadores:`,s.message)}catch(e){console.warn(`[MaestroData] _flagDependentIndicadores error:`,e.message)}}async function S(e,n){if(!e||!n)return{presentes:[],ausentes:[]};try{let{data:r,error:i}=await t.from(`asistencias`).select(`alumno_id, estado`).eq(`clase_id`,e).eq(`fecha`,n);return i?(console.warn(`[MaestroData] Error loading attendance:`,i.message),{presentes:[],ausentes:[]}):{presentes:(r||[]).filter(e=>e.estado===`presente`||e.estado===`tarde`).map(e=>e.alumno_id),ausentes:(r||[]).filter(e=>e.estado===`ausente`||e.estado===`justificado`).map(e=>e.alumno_id)}}catch(e){return console.error(`[MaestroData] getAttendanceForClass error:`,e),{presentes:[],ausentes:[]}}}async function C(e,n){if(!e||!n)return[];try{let{data:r,error:i}=await t.from(`evaluacion_indicador`).select(`*`).eq(`maestro_indicador_id`,e).eq(`clase_id`,n);return i?(console.warn(`[MaestroData] Error loading evaluations:`,i.message),[]):r||[]}catch(e){return console.error(`[MaestroData] getIndicadorEvaluations error:`,e),[]}}var w=null,T=null,E=null;({init(){window.pwaInstaller=this,this._injectStyles(),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),w=e}),window.addEventListener(`appinstalled`,()=>{localStorage.setItem(`pwa-installed`,`true`),w=null})},async evaluateInsights(){let e=n();if(e?.id)try{let t=await s(),n=new Date,r=new Date(n.getTime()-10080*60*1e3),i=n.toISOString().split(`T`)[0],a=r.toISOString().split(`T`)[0],o=await l(e.id,a,i),c=[],u=(o||[]).filter(e=>e.borrador===!0);if(u.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre]));if(u.length===1){let t=u[0],n=e[t.clase_id]||`Clase`,r=t.fecha?t.fecha.split(`-`).reverse().slice(0,2).join(`/`):``,i=r?` del ${r}`:``;c.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tienes el registro de ${n}${i} en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${t.clase_id}&fecha=${t.fecha}`)}})}else{let e=u[0];c.push({id:`draft-sessions`,priority:`high`,icon:`bi-exclamation-triangle-fill`,text:`Tienes ${u.length} registros de clase en borrador.`,actionLabel:`Revisar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${e.clase_id}&fecha=${e.fecha}`)}})}}let d=new Set((t||[]).map(e=>e.id)),f=(o||[]).filter(e=>{if(e.fecha>=i||!d.has(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)});if(f.length>0){let e=Object.fromEntries((t||[]).map(e=>[e.id,e.nombre])),n=f[0],r=e[n.clase_id]||`Clase`,i=n.fecha?n.fecha.split(`-`).reverse().slice(0,2).join(`/`):``;c.push({id:`sessions-without-attendance`,priority:`high`,icon:`bi-clipboard-x-fill`,text:f.length===1?`${r} del ${i} quedó sin registrar asistencia.`:`Tienes ${f.length} clases sin asistencia registrada esta semana.`,actionLabel:`Registrar`,action:()=>{window.router&&window.router.navigate(`asistencia?clase=${n.clase_id}&fecha=${n.fecha}`)}})}e.telefono||e.tlf||c.push({id:`profile-incomplete`,priority:`medium`,icon:`bi-person-exclamation`,text:`Completa tu número de teléfono en tu perfil de usuario.`,actionLabel:`Completar`,action:()=>{window.router&&window.router.navigate(`perfil`)}}),w!==null&&!this._isStandalone()&&c.push({id:`pwa-install-prompt`,priority:`medium`,icon:`bi-download`,text:`Instala SOI Maestros en tu pantalla de inicio para acceso rápido sin conexión.`,actionLabel:`Instalar`,action:()=>{this.promptInstall()}}),(!t||t.length===0)&&c.push({id:`no-classes-assigned`,priority:`low`,icon:`bi-info-circle-fill`,text:`No tienes clases asignadas en el sistema actualmente.`,actionLabel:`Soporte`,action:()=>{window.router&&window.router.navigate(`perfil`)}});let p=c.filter(e=>{let t=localStorage.getItem(`soi-dismissed-${e.id}`);return!t||Date.now()-parseInt(t,10)>10080*60*1e3});if(p.length>0){let e=p[0];if(this.currentAlertId===e.id&&this.currentAlertText===e.text)return;this._showInsightBanner(e)}else this.dismissBanner()}catch(e){console.warn(`[SmartInsights] Error al evaluar alertas:`,e)}},_showInsightBanner(e){let t=document.getElementById(`pwa-smart-banner`)||T;if(t){let n=t.querySelector(`.psb-capsule`);if(n){n.style.transition=`opacity 0.2s ease`,n.style.opacity=`0`,setTimeout(()=>{let t=n.querySelector(`.psb-severity-dot`);t&&(t.className=`psb-severity-dot ${e.priority}`,t.innerHTML=`<i class="bi ${e.icon}"></i>`);let r=n.querySelector(`.psb-title`);r&&(r.textContent=e.text);let i=n.querySelector(`#pwa-banner-action`);if(i){i.innerHTML=`<span>${e.actionLabel}</span>`;let t=i.cloneNode(!0);i.parentNode.replaceChild(t,i),t.addEventListener(`click`,()=>{e.action()})}let a=n.querySelector(`#pwa-banner-close`);if(a){let t=a.cloneNode(!0);a.parentNode.replaceChild(t,a),t.addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})}this.currentAlertId=e.id,this.currentAlertText=e.text,n.style.opacity=`1`},200);return}}T=document.createElement(`div`),T.id=`pwa-smart-banner`,T.setAttribute(`role`,`status`),T.setAttribute(`aria-live`,`polite`),T.innerHTML=`
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
    `,document.body.prepend(T),this.currentAlertId=e.id,this.currentAlertText=e.text,requestAnimationFrame(()=>{requestAnimationFrame(()=>T?.classList.add(`psb-visible`))}),document.getElementById(`pwa-banner-action`).addEventListener(`click`,()=>{e.action()}),document.getElementById(`pwa-banner-close`).addEventListener(`click`,()=>{localStorage.setItem(`soi-dismissed-${e.id}`,Date.now().toString()),this.dismissBanner()})},dismissBanner(){if(this.currentAlertId=null,this.currentAlertText=null,!T)return;T.classList.remove(`psb-visible`);let e=T;T=null,setTimeout(()=>{e.remove()},400)},promptInstall(){/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():w?this._triggerNativeInstall():this._showDesktopGuide()},async _triggerNativeInstall(){if(!w){this._showDesktopGuide();return}try{await w.prompt();let{outcome:e}=await w.userChoice;e===`accepted`&&localStorage.setItem(`pwa-installed`,`true`)}catch(e){console.warn(`[PWA] Error al mostrar prompt:`,e)}finally{w=null}},_showIOSGuide(){if(E)return;E=document.createElement(`div`),E.id=`pwa-guide-modal`,E.innerHTML=`
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
    `,document.body.appendChild(E);let e=()=>{E?.classList.add(`pgm-hiding`),setTimeout(()=>{E?.remove(),E=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_showDesktopGuide(){if(E)return;E=document.createElement(`div`),E.id=`pwa-guide-modal`,E.innerHTML=`
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
    `,document.body.appendChild(E);let e=()=>{E?.classList.add(`pgm-hiding`),setTimeout(()=>{E?.remove(),E=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_isStandalone(){return window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`},_injectStyles(){if(document.getElementById(`pwa-installer-styles`))return;let e=document.createElement(`style`);e.id=`pwa-installer-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}}).init();export{C as a,_ as c,g as d,m as f,i as h,v as i,p as l,b as m,h as n,f as o,y as p,c as r,s,S as t,l as u};