const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-Cp9PwTtV.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CsoeaaUJ.js","assets/typeof-Jix6Nskq.js","assets/alumnos-DymqG36Y.js","assets/clases-Xmh2Auy3.js","assets/sesiones-BqS1eJ32.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{i as t}from"./supabase-C4ics26R.js";import{n}from"./vendor-BWfrAznO.js";import{t as r}from"./AppToast-BOjiJExQ.js";import{t as i}from"./preload-helper-CsoeaaUJ.js";import{t as a}from"./AppModal-CLA9fW7x.js";import{t as o}from"./alumnos-DymqG36Y.js";import{_ as s,a as c,c as l,d as u,f as d,g as f,h as p,i as m,l as h,m as ee,n as g,o as te,p as ne,s as _,t as v,u as re,v as ie}from"./clasesApi-3E3-66yq.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function ae(){let e=0;document.addEventListener(`touchstart`,t=>{t.touches.length===1&&(e=t.touches[0].clientY)},{passive:!0}),document.addEventListener(`touchmove`,t=>{if(t.touches.length===1&&t.touches[0].clientY-e>0){let e=t.target,n=!1,r=!1;for(;e&&e!==document.body&&e!==document.documentElement;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentNode;continue}let t=window.getComputedStyle(e);if(!t){e=e.parentNode;continue}let i=t.overflowY;if((i===`auto`||i===`scroll`)&&e.scrollHeight>e.clientHeight){r=!0,e.scrollTop<=0&&(n=!0);break}e=e.parentNode}r||(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop)<=0&&(n=!0),n&&t.cancelable&&t.preventDefault()}},{passive:!1})}var y=null,b=null,x=null;({init(){window.pwaInstaller=this,this._injectStyles(),!this._isStandalone()&&(/iPhone|iPad|iPod/i.test(navigator.userAgent),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),y=e,this._updateBannerButton()}),window.addEventListener(`appinstalled`,()=>{this._dismissBanner(!0),y=null}),setTimeout(()=>this._showSmartBanner(),300))},_showSmartBanner(){if(b||this._isStandalone())return;let e=/iPhone|iPad|iPod/i.test(navigator.userAgent),t=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);b=document.createElement(`div`),b.id=`pwa-smart-banner`,b.setAttribute(`role`,`banner`),b.setAttribute(`aria-label`,`Instalar aplicación SOI Maestros`),b.innerHTML=`
      <div class="psb-content">
        <div class="psb-icon">
          <img src="/icons/icon-192.png" alt="SOI" onerror="this.parentElement.innerHTML='<i class=\\"bi bi-mortarboard-fill psb-icon-fallback\\"></i>'">
        </div>
        <div class="psb-info">
          <strong class="psb-title">SOI Maestros</strong>
          <span class="psb-subtitle">${t?`Instala la app · Acceso directo`:`Abrí como aplicación de escritorio`}</span>
        </div>
        <button class="psb-action" id="pwa-banner-action" aria-label="${e?`Ver cómo instalar`:`Abrir en aplicación`}">
          ${e?`<i class="bi bi-box-arrow-up"></i> <span>Instalar</span>`:`<i class="bi bi-window-plus"></i> <span>Abrir en aplicación</span>`}
        </button>
        <button class="psb-close" id="pwa-banner-close" aria-label="Cerrar aviso">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `,document.body.prepend(b),this._pushBodyDown(),requestAnimationFrame(()=>{requestAnimationFrame(()=>b?.classList.add(`psb-visible`))}),document.getElementById(`pwa-banner-action`).addEventListener(`click`,()=>{/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():y?this._triggerNativeInstall():this._showDesktopGuide()}),document.getElementById(`pwa-banner-close`).addEventListener(`click`,()=>{this._dismissBanner(!1)})},_updateBannerButton(){let e=document.getElementById(`pwa-banner-action`);e&&y&&(e.innerHTML=`<i class="bi bi-window-plus"></i> <span>Abrir en aplicación</span>`)},_dismissBanner(e=!1){b&&(b.classList.remove(`psb-visible`),this._resetBodyPadding(),setTimeout(()=>{b?.remove(),b=null},350),e&&localStorage.setItem(`pwa-installed`,`true`))},_pushBodyDown(){let e=document.querySelector(`#app, .pm-portal-container, main, body > div:not(#pwa-smart-banner)`);e&&(e.style.transition=`padding-top 0.35s ease`,e.style.paddingTop=`60px`)},_resetBodyPadding(){let e=document.querySelector(`#app, .pm-portal-container, main, body > div:not(#pwa-smart-banner)`);e&&(e.style.paddingTop=``)},async _triggerNativeInstall(){if(!y){this._showDesktopGuide();return}try{await y.prompt();let{outcome:e}=await y.userChoice;e===`accepted`&&this._dismissBanner(!0)}catch(e){console.warn(`[PWA] Error al mostrar prompt:`,e)}finally{y=null}},_showIOSGuide(){if(x)return;x=document.createElement(`div`),x.id=`pwa-guide-modal`,x.innerHTML=`
      <div class="pgm-overlay" id="pgm-overlay">
        <div class="pgm-card" role="dialog" aria-modal="true" aria-labelledby="pgm-title">
          <div class="pgm-icon-wrap">
            <i class="bi bi-phone"></i>
          </div>
          <h3 id="pgm-title">Instalar en iPhone / iPad</h3>
          <p class="pgm-subtitle">Añade SOI Maestros a tu pantalla de inicio</p>
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
    `,document.body.appendChild(x);let e=()=>{x?.classList.add(`pgm-hiding`),setTimeout(()=>{x?.remove(),x=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},_showDesktopGuide(){if(x)return;x=document.createElement(`div`),x.id=`pwa-guide-modal`,x.innerHTML=`
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
    `,document.body.appendChild(x);let e=()=>{x?.classList.add(`pgm-hiding`),setTimeout(()=>{x?.remove(),x=null},300)};document.getElementById(`pgm-close`).addEventListener(`click`,e),document.getElementById(`pgm-overlay`).addEventListener(`click`,t=>{t.target.id===`pgm-overlay`&&e()})},promptInstall(){/iPhone|iPad|iPod/i.test(navigator.userAgent)?this._showIOSGuide():y?this._triggerNativeInstall():this._showDesktopGuide()},_isStandalone(){return window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`},_injectStyles(){if(document.getElementById(`pwa-installer-styles`))return;let e=document.createElement(`style`);e.id=`pwa-installer-styles`,e.textContent=`
      /* ── Smart Banner ──────────────────────────────── */
      #pwa-smart-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        transform: translateY(-100%);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }

      #pwa-smart-banner.psb-visible {
        transform: translateY(0);
      }

      .psb-content {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: rgba(20, 20, 30, 0.96);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        min-height: 52px;
      }

      .psb-icon {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        overflow: hidden;
        flex-shrink: 0;
        background: linear-gradient(135deg, #5856D6, #7C7AE6);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .psb-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      }

      .psb-icon-fallback {
        font-size: 18px;
        color: white;
      }

      .psb-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }

      .psb-title {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .psb-subtitle {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.55);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .psb-action {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 7px 14px;
        background: #5856D6;
        color: #fff;
        border: none;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        transition: background 0.2s, transform 0.15s;
        letter-spacing: -0.01em;
      }

      .psb-action:hover {
        background: #6a68e0;
        transform: scale(1.03);
      }

      .psb-action:active {
        transform: scale(0.97);
      }

      .psb-close {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.35);
        cursor: pointer;
        padding: 4px 6px;
        font-size: 16px;
        flex-shrink: 0;
        transition: color 0.2s;
        line-height: 1;
        display: flex;
        align-items: center;
      }

      .psb-close:hover {
        color: rgba(255, 255, 255, 0.8);
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
    `,document.head.appendChild(e)}}).init();var S=class e{constructor(e={}){this.id=e.id||null,this.clase_id=e.clase_id||null,this.maestro_id=e.maestro_id||null,this.fecha_inicio=e.fecha_inicio||null,this.tema=e.tema||``,this.objetivos=e.objetivos||``,this.contenido=e.contenido||``,this.recursos=Array.isArray(e.recursos)?e.recursos:[],this.evaluacion_metodo=e.evaluacion_metodo||``,this.observaciones=e.observaciones||``,this.notas_dsl=e.notas_dsl||``,this.estado=e.estado||`planificado`,this.instrumento=e.instrumento||null,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null,this.clase_nombre=e.clase_nombre||null,this.maestro_nombre=e.maestro_nombre||null}validate(){let t=[];return!this.tema||!this.tema.trim()?t.push(`El tema es obligatorio`):this.tema.trim().length<3?t.push(`El tema debe tener mínimo 3 caracteres`):this.tema.trim().length>200&&t.push(`El tema no puede exceder 200 caracteres`),this.clase_id||t.push(`La clase es obligatoria`),this.objetivos&&this.objetivos.length>1e3&&t.push(`Los objetivos no pueden exceder 1000 caracteres`),this.contenido&&this.contenido.length>2e3&&t.push(`El contenido no puede exceder 2000 caracteres`),this.evaluacion_metodo&&this.evaluacion_metodo.length>500&&t.push(`El método de evaluación no puede exceder 500 caracteres`),this.observaciones&&this.observaciones.length>1e3&&t.push(`Las observaciones no pueden exceder 1000 caracteres`),this.instrumento&&this.instrumento.length>100&&t.push(`El instrumento no puede exceder 100 caracteres`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}canEdit(){return this.estado===`planificado`||this.estado===`ejecutado`}canApprove(){return this.estado===`ejecutado`}isLocked(){return this.estado===`revisado`}static getEstados(){return[{value:`planificado`,label:`Planificado`,color:`bg-primary`},{value:`ejecutado`,label:`Ejecutado`,color:`bg-success`},{value:`revisado`,label:`Revisado`,color:`bg-info`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_inicio:this.fecha_inicio,tema:this.tema.trim(),objetivos:this.objetivos.trim()||null,contenido:this.contenido.trim()||null,recursos:this.recursos,evaluacion_metodo:this.evaluacion_metodo.trim()||null,observaciones:this.observaciones.trim()||null,estado:this.estado,instrumento:this.instrumento?.trim()||null}}},C={alumnos:/#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,calificacion:/(\d)\/(\d)/g};function w(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)r[1]&&n.push(r[1].trim());return n}function oe(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function se(e){return!e||typeof e!=`string`?{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[]}:{alumnos:w(e,C.alumnos),contenido:w(e,C.contenido),sugerencias:w(e,C.sugerencias),tareas:w(e,C.tareas),medidas:w(e,C.medidas),calificacion:oe(e),objetivos:w(e,C.objetivos)}}function ce(e){if(!e)return``;let t=e;return t=t.replace(C.calificacion,(e,t,n)=>`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`),t=t.replace(C.objetivos,(e,t)=>`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">__OBJ_START__${t}__OBJ_END__</span>`),t=t.replace(C.alumnos,(e,t)=>`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`),t=t.replace(C.contenido,(e,t)=>`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`),t=t.replace(C.sugerencias,(e,t)=>`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`),t=t.replace(C.tareas,(e,t)=>`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`),t=t.replace(C.medidas,(e,t)=>`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`),t=le(t),t=t.replace(/__OBJ_START__/g,`&gt;`),t=t.replace(/__OBJ_END__/g,``),t}function le(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var ue=175,de=null,T=``;function fe(e=``,t=null){let n=document.createElement(`div`);n.className=`dsl-editor-container`;let r=document.createElement(`div`);r.className=`dsl-editor-wrapper position-relative`;let i=document.createElement(`div`);i.className=`dsl-editor form-control`,i.contentEditable=`true`,i.spellcheck=`false`,i.setAttribute(`data-placeholder`,`Escribe aquí usando notación DSL: #Alumno [Contenido] (Sugerencia) {Tarea} $Medida 4/5 >Objetivo`),i.innerHTML=e?ce(e):``;let a=document.createElement(`div`);a.className=`dsl-highlight-layer position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(a),r.appendChild(i),n.appendChild(r),pe();function o(){return i.innerText||i.textContent||``}function s(){let e=o();e!==T&&(T=e,a.innerHTML=ce(e)+`<br>`)}function c(){a.scrollTop=i.scrollTop,a.scrollLeft=i.scrollLeft}function l(){clearTimeout(de),de=setTimeout(()=>{s();let e=se(o());t&&t(o(),e)},ue)}function u(e){e.key===`Tab`&&(e.preventDefault(),document.execCommand(`insertText`,!1,`  `))}function d(){c()}i.addEventListener(`input`,l),i.addEventListener(`keydown`,u),i.addEventListener(`scroll`,d),i.addEventListener(`focus`,()=>{n.classList.add(`focused`)}),i.addEventListener(`blur`,()=>{n.classList.remove(`focused`),s()});function f(e){i.innerHTML=e?ce(e):``,T=o(),a.innerHTML=ce(T)+`<br>`}function p(){return o()}function m(){return se(o())}function h(){i.focus()}function ee(e){i.focus(),document.execCommand(`insertText`,!1,e)}function g(e,t=``){i.focus();let n=window.getSelection();if(!n.rangeCount)return;let r=n.getRangeAt(0);r.deleteContents();let a=document.createTextNode(e),s=document.createTextNode(t);r.insertNode(a),r.collapse(!1),r.insertNode(s),r.setStartAfter(a),r.setEndAfter(a),n.removeAllRanges(),n.addRange(r),T=o()}return n.component={element:n,editor:i,setContent:f,getContent:p,getParsed:m,focus:h,insertText:ee,insertAtCursor:g},n.setContent=f,n.getContent=p,n.getParsed=m,n.focus=h,n.insertText=ee,n.insertAtCursor=g,e&&(T=e),n}function pe(){if(document.getElementById(`dsl-editor-styles`))return;let e=document.createElement(`style`);e.id=`dsl-editor-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function me(e={}){let{onAlumnoClick:t=null,onGrabarClick:n=null,onEnriquecerClick:r=null,editor:i=null}=e,a=document.createElement(`div`);return a.className=`dsl-toolbar btn-group btn-group-sm me-2`,[{id:`alumno`,icon:`#`,label:`Alumno`,title:`Insertar mention de alumno`,className:`btn btn-outline-primary`,action:()=>{t?t(i):i&&i.insertAtCursor(`#`,``)}},{id:`contenido`,icon:`[]`,label:`Contenido`,title:`Insertar contenido`,className:`btn btn-outline-success`,action:()=>{i&&i.insertAtCursor(`[`,`]`)}},{id:`sugerencia`,icon:`()`,label:`Sugerencia`,title:`Insertar sugerencia`,className:`btn btn-outline-warning`,action:()=>{i&&i.insertAtCursor(`(`,`)`)}},{id:`tarea`,icon:`{}`,label:`Tarea`,title:`Insertar tarea`,className:`btn btn-outline-purple`,action:()=>{i&&i.insertAtCursor(`{`,`}`)}},{id:`medida`,icon:`$`,label:`Medida`,title:`Insertar medida técnica`,className:`btn btn-outline-info`,action:()=>{i&&i.insertAtCursor(`$`,``)}},{id:`calificacion`,icon:`4/5`,label:`Calificación`,title:`Insertar calificación`,className:`btn btn-outline-danger`,action:()=>{i&&i.insertText(`4/5`)}},{id:`objetivo`,icon:`>`,label:`Objetivo`,title:`Insertar referencia a objetivo`,className:`btn btn-outline-secondary`,action:()=>{i&&i.insertAtCursor(`>`,``)}},{id:`grabar`,icon:`🎤`,label:`Grabar`,title:`Grabar audio (placeholder)`,className:`btn btn-outline-dark`,action:()=>{n&&n(i)}},{id:`enriquecer`,icon:`✨`,label:`IA`,title:`Enriquecer con IA (placeholder)`,className:`btn btn-outline-dark`,action:()=>{r&&r(i)}}].forEach(e=>{let t=document.createElement(`button`);t.className=e.className,t.type=`button`,t.title=e.title,t.innerHTML=`<span class="dsl-toolbar-btn">${e.icon}</span>`,t.addEventListener(`click`,t=>{t.preventDefault(),e.action()}),a.appendChild(t)}),he(),a}function he(){if(document.getElementById(`dsl-toolbar-styles`))return;let e=document.createElement(`style`);e.id=`dsl-toolbar-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function ge(e={}){let{initialContent:t=``,onChange:n=null,onAlumnoClick:r=null,onGrabarClick:i=null,onEnriquecerClick:a=null}=e,o=document.createElement(`div`);o.className=`dsl-editor-with-toolbar`;let s=fe(t,n),c=me({onAlumnoClick:r,onGrabarClick:i,onEnriquecerClick:a,editor:s});return o.appendChild(c),o.appendChild(s),o.container=o,o}var _e={version:`1.0.0`,environment:`production`,isDemoMode:localStorage.getItem(`demo_mode`)===`true`,groq:{apiKey:``,model:`llama-3.1-8b-instant`,whisperModel:`whisper-large-v3`,endpoint:`https://api.groq.com/openai/v1`,maxTokens:1024,temperature:.3},tareas:{localStorageKey:`maestro_tarea`,diasVencimientoDefault:7}},ve=e({PARENTESCOS:()=>ye,actualizarAlumno:()=>Te,crearAlumno:()=>we,eliminarAlumno:()=>Ee,getParentescoLabel:()=>be,obtenerAlumno:()=>Ce,obtenerAlumnos:()=>Se,obtenerAlumnosActivos:()=>ke,obtenerInscripcionesAlumno:()=>Ae,validarCedula:()=>Oe,validarEmail:()=>De}),ye=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}];function be(e){let t=ye.find(t=>t.value===e);return t?t.label:e}function xe(e){return e?{...e,id:e.id,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,telefono:e.familiar_telefono??``,is_active:e.activo??!0,cedula:e.representante_cedula??``,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``}:null}async function Se(){let{data:e,error:n}=await t.from(`alumnos`).select(`*`).order(`nombre_completo`,{ascending:!0});if(n)throw console.error(`Error cargando alumnos:`,n.message),Error(`No se pudieron cargar los alumnos`);return e.map(xe)}async function Ce(e){let{data:n,error:r}=await t.from(`alumnos`).select(`*`).eq(`id`,e).single();if(r)throw console.error(`Error cargando alumno:`,r.message),Error(`Alumno no encontrado`);return xe(n)}async function we(e){let n=(e.nombre||e.nombre_completo||``).trim();if(!n)throw Error(`El nombre es obligatorio`);let r={nombre_completo:n,correo_representante:(e.email||``).trim().toLowerCase()||null,representante_cedula:(e.cedula||``).trim()||null,instrumento_principal:(e.instrumento||``).trim()||null,activo:e.is_active===void 0?!0:e.is_active,familiar_nombre:(e.familiar_nombre||``).trim()||null,familiar_telefono:(e.telefono||e.familiar_telefono||``).trim()||null,familiar_parentesco:(e.familiar_parentesco||``).trim()||null,contacto_emergencia_nombre:(e.contacto_emergencia_nombre||``).trim()||null,contacto_emergencia_telefono:(e.contacto_emergencia_telefono||``).trim()||null,contacto_emergencia_parentesco:(e.contacto_emergencia_parentesco||``).trim()||null,condiciones_medicas:(e.condiciones_medicas||``).trim()||null,alergias:(e.alergias||``).trim()||null,medicamentos:(e.medicamentos||``).trim()||null},{data:i,error:a}=await t.from(`alumnos`).insert([r]).select();if(a)throw console.error(`Error creando alumno:`,a.message),Error(`No se pudo crear el alumno`);return xe(i[0])}async function Te(e,n){let r={};n.nombre!==void 0&&(r.nombre_completo=n.nombre?n.nombre.trim():n.nombre),n.nombre_completo!==void 0&&(r.nombre_completo=n.nombre_completo?n.nombre_completo.trim():n.nombre_completo),n.email!==void 0&&(r.correo_representante=n.email?n.email.trim().toLowerCase():n.email),n.instrumento!==void 0&&(r.instrumento_principal=n.instrumento?n.instrumento.trim():n.instrumento),n.cedula!==void 0&&(r.representante_cedula=n.cedula?n.cedula.trim():n.cedula),n.is_active!==void 0&&(r.activo=n.is_active),n.activo!==void 0&&(r.activo=n.activo),n.telefono!==void 0&&(r.familiar_telefono=n.telefono?n.telefono.trim():n.telefono),n.familiar_telefono!==void 0&&(r.familiar_telefono=n.familiar_telefono?n.familiar_telefono.trim():n.familiar_telefono),n.familiar_nombre!==void 0&&(r.familiar_nombre=n.familiar_nombre?n.familiar_nombre.trim():n.familiar_nombre),n.familiar_parentesco!==void 0&&(r.familiar_parentesco=n.familiar_parentesco?n.familiar_parentesco.trim():n.familiar_parentesco),n.contacto_emergencia_nombre!==void 0&&(r.contacto_emergencia_nombre=n.contacto_emergencia_nombre?n.contacto_emergencia_nombre.trim():n.contacto_emergencia_nombre),n.contacto_emergencia_telefono!==void 0&&(r.contacto_emergencia_telefono=n.contacto_emergencia_telefono?n.contacto_emergencia_telefono.trim():n.contacto_emergencia_telefono),n.contacto_emergencia_parentesco!==void 0&&(r.contacto_emergencia_parentesco=n.contacto_emergencia_parentesco?n.contacto_emergencia_parentesco.trim():n.contacto_emergencia_parentesco),n.condiciones_medicas!==void 0&&(r.condiciones_medicas=n.condiciones_medicas?n.condiciones_medicas.trim():n.condiciones_medicas),n.alergias!==void 0&&(r.alergias=n.alergias?n.alergias.trim():n.alergias),n.medicamentos!==void 0&&(r.medicamentos=n.medicamentos?n.medicamentos.trim():n.medicamentos);let{data:i,error:a}=await t.from(`alumnos`).update(r).eq(`id`,e).select();if(a)throw console.error(`Error actualizando alumno:`,a),a.code===`PGRST201`||a.message?.includes(`row-level security`)?Error(`No tienes permisos para actualizar este alumno. Contacta al administrador.`):Error(`No se pudo actualizar el alumno: ${a.message||`Error desconocido`}`);return xe(i[0])}async function Ee(e){let{error:n}=await t.from(`alumnos`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando alumno:`,n.message),Error(`No se pudo eliminar el alumno`)}async function De(e){let{data:n,error:r}=await t.from(`alumnos`).select(`id`).eq(`correo_representante`,e.trim().toLowerCase()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando email:`,r.message),!!n}async function Oe(e){let{data:n,error:r}=await t.from(`alumnos`).select(`id`).eq(`representante_cedula`,e.trim()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando cédula:`,r.message),!!n}async function ke(){let{data:e,error:n}=await t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(n)throw Error(`No se pudieron cargar los alumnos`);return e.map(xe)}async function Ae(e){let{data:n,error:r}=await t.from(`alumnos_clases`).select(`clase_id, clase:clases(nombre)`).eq(`alumno_id`,e);if(r)throw console.error(`Error cargando inscripciones de alumno:`,r.message),Error(`No se pudieron cargar las clases del alumno`);return(n||[]).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase?.nombre??`Clase sin nombre`}))}var je=e({actualizarAlumno:()=>Ie,crearAlumno:()=>Fe,eliminarAlumno:()=>Le,obtenerAlumno:()=>Pe,obtenerAlumnos:()=>Ne,obtenerInscripcionesAlumno:()=>Ve,validarCedula:()=>ze,validarEmail:()=>Re}),E=(e=500)=>new Promise(t=>setTimeout(t,e));function Me(e){return e?{...e,nombre:e.nombre_completo??``,email:e.correo_representante??``,instrumento:e.instrumento_principal??``,is_active:e.activo??!0,contacto_emergencia_nombre:e.contacto_emergencia_nombre??``,contacto_emergencia_telefono:e.contacto_emergencia_telefono??``,contacto_emergencia_parentesco:e.contacto_emergencia_parentesco??``,familiar_nombre:e.familiar_nombre??``,familiar_telefono:e.familiar_telefono??``,familiar_parentesco:e.familiar_parentesco??``,condiciones_medicas:e.condiciones_medicas??``,alergias:e.alergias??``,medicamentos:e.medicamentos??``}:null}var D=[...o];async function Ne(){return await E(),D.map(Me)}async function Pe(e){await E();let t=D.find(t=>t.id===e);if(!t)throw Error(`Alumno no encontrado (Demo)`);return Me(t)}async function Fe(e){await E();let t={...e,id:Math.random().toString(36).substr(2,9),nombre_completo:e.nombre||e.nombre_completo,activo:e.is_active===void 0?!0:e.is_active};return D.push(t),Me(t)}async function Ie(e,t){await E();let n=D.findIndex(t=>t.id===e);if(n===-1)throw Error(`Alumno no encontrado (Demo)`);return D[n]={...D[n],...t},Me(D[n])}async function Le(e){await E(),D=D.filter(t=>t.id!==e)}async function Re(e){return await E(100),D.some(t=>t.correo_representante===e.trim().toLowerCase())}async function ze(e){return await E(100),D.some(t=>t.representante_cedula===e.trim())}var Be=[{alumno_id:`1`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`1`,clase_id:`clase_005`,clase_nombre:`Coro Infantil`},{alumno_id:`2`,clase_id:`clase_001`,clase_nombre:`Violín Principiantes A`},{alumno_id:`4`,clase_id:`clase_004`,clase_nombre:`Flauta Travesera`}];async function Ve(e){return await E(200),Be.filter(t=>t.alumno_id===e).map(e=>({clase_id:e.clase_id,clase_nombre:e.clase_nombre}))}var O=()=>_e.isDemoMode?je:ve,He=(...e)=>O().obtenerAlumnos(...e),Ue=(...e)=>O().obtenerAlumnos(...e),We=(...e)=>O().crearAlumno(...e),Ge=(...e)=>O().actualizarAlumno(...e),Ke=(...e)=>O().eliminarAlumno(...e),qe=(...e)=>O().validarEmail(...e),Je=(...e)=>O().validarCedula(...e),Ye=(...e)=>O().obtenerInscripcionesAlumno(...e),Xe=[{value:`madre`,label:`Madre`},{value:`padre`,label:`Padre`},{value:`abuela`,label:`Abuela/Abuelo`},{value:`tia`,label:`Tía/Tío`},{value:`hermana`,label:`Hermana/Hermano`},{value:`tutor`,label:`Tutor Legal`},{value:`otro`,label:`Otro`}],Ze=e=>{let t=Xe.find(t=>t.value===e);return t?t.label:e};function Qe(e={}){let{onSelect:t=null,onClose:n=null}=e,r=new Set,i=``,a=document.createElement(`div`);a.className=`modal fade`,a.setAttribute(`tabindex`,`-1`),a.setAttribute(`role`,`dialog`),a.innerHTML=`
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
  `;let o=a.querySelector(`.search-input`),s=a.querySelector(`.alumno-list`),c=a.querySelector(`.confirm-btn`),l=a.querySelector(`.cancel-btn`);async function u(){let e=await Ue();d(i?e.filter(e=>e.nombre_completo.toLowerCase().includes(i.toLowerCase())):e)}function d(e){if(s.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`text-center text-muted py-4`,e.textContent=`No se encontraron alumnos`,alunoList.appendChild(e);return}e.forEach(e=>{let t=document.createElement(`label`);t.className=`list-group-item d-flex align-items-center gap-2 cursor-pointer`,t.style.cursor=`pointer`;let n=document.createElement(`input`);n.type=`checkbox`,n.className=`form-check-input`,n.checked=r.has(e.id),n.value=e.id;let i=document.createElement(`div`);i.className=`flex-grow-1`,i.innerHTML=`
        <div class="fw-medium">${$e(e.nombre_completo)}</div>
        <small class="text-muted">${$e(e.instrumento_principal)}</small>
      `,t.appendChild(n),t.appendChild(i),n.addEventListener(`change`,()=>{n.checked?r.add(e.id):r.delete(e.id)}),t.addEventListener(`click`,e=>{e.target!==n&&(n.checked=!n.checked,n.dispatchEvent(new Event(`change`)))}),s.appendChild(t)})}o.addEventListener(`input`,e=>{i=e.target.value,u()}),c.addEventListener(`click`,()=>{t&&t(Array.from(r)),p()}),l.addEventListener(`click`,()=>{n&&n(),p()});function f(){r.clear(),i=``,o.value=``;let e=new bootstrap.Modal(a);e.show(),u(),a.bsModal=e}function p(){a.bsModal&&a.bsModal.hide()}return a.openModal=f,a.closeModal=p,a}function $e(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function et(e,n){let r=t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);e&&(r=r.eq(`instrumento`,e)),n&&(r=r.eq(`nivel`,n));let{data:i,error:a}=await r.maybeSingle();if(a)throw a;return i||null}async function tt(){let{data:e,error:n}=await t.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(n)throw n;return(e||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function nt({instrumento:e,nivel:n,descripcion:r}){let{data:i,error:a}=await t.from(`curriculos`).insert({instrumento:e,nivel:n,descripcion:r}).select().single();if(a)throw a;return i}async function rt(e,n){let{data:r,error:i}=await t.from(`curriculos`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function it(e,t){return rt(e,{activo:t})}async function at(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_pilares`).insert({curriculo_id:e,nombre:n,orden:r}).select().single();if(a)throw a;return i}async function ot(e,n){let{data:r,error:i}=await t.from(`curriculo_pilares`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function st(e){let{error:n}=await t.from(`curriculo_pilares`).delete().eq(`id`,e);if(n)throw n}async function ct(e,n,r=0){let{data:i,error:a}=await t.from(`curriculo_objetivos`).insert({pilar_id:e,descripcion:n,orden:r}).select().single();if(a)throw a;return i}async function lt(e,n){let{data:r,error:i}=await t.from(`curriculo_objetivos`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}async function ut(e){let{error:n}=await t.from(`curriculo_objetivos`).delete().eq(`id`,e);if(n)throw n}async function dt(){let{data:e,error:n}=await t.from(`planificaciones`).select(`
      *,
      clase:clases (nombre),
      maestro:maestros (nombre_completo)
    `).order(`created_at`,{ascending:!1});if(n)throw console.error(`Error cargando planificaciones:`,n.message),Error(`No se pudieron cargar las planificaciones`);return e.map(e=>new S({...e,clase_nombre:e.clase?.nombre||`Sin asignar`,maestro_nombre:e.maestro?.nombre_completo||`Sin asignar`}))}async function ft(e){let n=new S(e),r=n.validate();if(r.length>0)throw Error(r.join(`. `));let{data:i,error:a}=await t.from(`planificaciones`).insert([n.toJSON()]).select();if(a)throw a;return new S(i[0])}async function pt(e,n){let{data:r}=await t.from(`planificaciones`).select(`*`).eq(`id`,e).single(),i=new S({...r,...n}),a=i.validate();if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`planificaciones`).update(i.toJSON()).eq(`id`,e).select();if(s)throw s;return new S(o[0])}async function mt(e){let{error:n}=await t.from(`planificaciones`).delete().eq(`id`,e);if(n)throw n}async function ht(e){if(!e||!e.length)return[];let{data:n,error:r}=await t.from(`planificaciones`).update({estado:`revisado`}).in(`id`,e).select();if(r)throw r;return(n||[]).map(e=>new S(e))}var gt=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}},k={PRESENTE:`presente`,AUSENTE:`ausente`,JUSTIFICADO:`justificado`,TARDE:`tarde`},_t={P:k.PRESENTE,A:k.AUSENTE,J:k.JUSTIFICADO,T:k.TARDE,presente:k.PRESENTE,ausente:k.AUSENTE,justificado:k.JUSTIFICADO,tarde:k.TARDE};function vt(e){return e?_t[e]||e:k.PRESENTE}var yt={presente:{short:`P`,label:`Presente`,css:`success`},ausente:{short:`A`,label:`Ausente`,css:`danger`},justificado:{short:`J`,label:`Justificado`,css:`warning`}};function A(e,t){throw console.error(e,t?.message),Error(e)}function bt(e){let t=e?.message?.toLowerCase()||``;return t.includes(`unique constraint`)||t.includes(`duplicate key`)||t.includes(`uk_asistencias`)||t.includes(`unique`)&&t.includes(`duplicate`)}async function xt({fechaInicio:e,fechaFin:n,periodoId:r,claseId:i,maestroId:a}={}){let o=t.from(`sesiones_clase`).select(`
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
    `).order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});if(e&&(o=o.gte(`fecha`,e)),n&&(o=o.lte(`fecha`,n)),i&&(o=o.eq(`clase_id`,i)),r){let{data:i}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,r).single();i&&(e||(o=o.gte(`fecha`,i.fecha_inicio)),n||(o=o.lte(`fecha`,i.fecha_fin)))}let{data:s,error:c}=await o;c&&A(`No se pudieron cargar las sesiones`,c);let l=(s||[]).map(e=>{let t=e.asistencias||[];return{sesionId:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,temaPrincipal:e.tema_principal,observacionesGenerales:e.observaciones_generales,estado:e.estado,claseId:e.clase_id,claseNombre:e.clases?.nombre??`—`,instrumento:e.clases?.instrumento??`—`,maestroId:e.clases?.maestro_principal_id??null,maestroNombre:e.clases?.maestros?.nombre_completo??`—`,totalPresentes:t.filter(e=>e.estado===k.PRESENTE).length,totalAusentes:t.filter(e=>e.estado===k.AUSENTE).length,totalJustificados:t.filter(e=>e.estado===k.JUSTIFICADO).length,totalRegistros:t.length}}),u=l;return a&&(u=l.filter(e=>e.maestroId&&e.maestroId.toString()===a.toString())),St(u)}function St(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return Array.from(t.entries()).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,sesiones:t}))}async function Ct(e){e||A(`Se requiere sesionId`);let{data:n,error:r}=await t.from(`sesiones_clase`).select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `).eq(`id`,e).single();r&&A(`No se pudo cargar la sesión`,r);let{data:i,error:a}=await t.from(`asistencias`).select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e).order(`alumnos(nombre_completo)`,{ascending:!0});a&&A(`No se pudieron cargar las asistencias`,a);let{data:o}=await t.from(`justificaciones`).select(`motivo, descripcion, archivo_url, estado, alumno_id`).eq(`sesion_id`,e),s={};o&&o.forEach(e=>{s[e.alumno_id]=e});let{data:c,error:l}=await t.from(`observaciones_alumnos`).select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e);l&&A(`No se pudieron cargar las observaciones`,l);let{data:u,error:d}=await t.from(`contenidos_sesion`).select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `).eq(`sesion_clase_id`,e);return d&&A(`No se pudieron cargar los contenidos`,d),{sesion:{id:n.id,fecha:n.fecha,horaInicio:n.hora_inicio,horaFin:n.hora_fin,temaPrincipal:n.tema_principal,observacionesGenerales:n.observaciones_generales,estado:n.estado,claseNombre:n.clases?.nombre??`—`,instrumento:n.clases?.instrumento??`—`,maestroNombre:n.clases?.maestros?.nombre_completo??`—`},asistencias:(i||[]).map(e=>({id:e.id,estado:e.estado,justificacionTexto:e.justificacion_texto,observacion:e.observaciones,alumnoId:e.alumno_id,alumnoNombre:e.alumnos?.nombre_completo??`—`,justificacion:s[e.alumno_id]??null})),observaciones:(c||[]).map(e=>({id:e.id,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion??e.observacion,prioridad:e.prioridad,alumnoId:e.alumnos?.id,alumnoNombre:e.alumnos?.nombre_completo??`—`})),contenidos:(u||[]).map(e=>({id:e.id,descripcion:e.descripcion,nivelLogro:e.nivel_logro,planTitulo:e.planificaciones?.titulo}))}}async function wt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});return n&&A(`No se pudieron cargar los períodos`,n),e||[]}async function Tt(){let{data:e,error:n}=await t.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).single();return n?null:e}async function Et(){let{data:e,error:n}=await t.from(`clases`).select(`id, nombre, instrumento`).order(`nombre`,{ascending:!0});return n&&A(`No se pudieron cargar las clases`,n),e||[]}async function Dt(e){e?.length||A(`No hay asistencias para registrar`);let n=[...new Set(e.map(e=>e.alumno_id))];n.some(e=>!e)&&A(`Todas las asistencias deben tener alumno_id`);let{data:r,error:i}=await t.from(`alumnos`).select(`id`).in(`id`,n);i&&A(`No se pudo validar alumnos en la base de datos`,i);let a=new Set(r?.map(e=>e.id)||[]),o=n.filter(e=>!a.has(e));o.length>0&&A(`Los siguientes alumnos no existen: ${o.join(`, `)}`);let s=e.map(e=>{if(!e.sesion_clase_id)throw Error(`sesion_clase_id es requerido para alumno ${e.alumno_id}`);if(!e.clase_id)throw Error(`clase_id es requerido para alumno ${e.alumno_id}`);if(!e.fecha)throw Error(`fecha es requerido para alumno ${e.alumno_id}`);return{sesion_clase_id:e.sesion_clase_id,clase_id:e.clase_id,alumno_id:e.alumno_id,fecha:e.fecha,estado:vt(e.estado),justificacion_texto:(e.justificacion_texto||``).trim()||null,observaciones:(e.observaciones||``).trim()||null,...e.registrado_por?{registrado_por:e.registrado_por}:{}}}),{data:c,error:l}=await t.from(`asistencias`).upsert(s,{onConflict:`clase_id,alumno_id,fecha`}).select();if(l&&bt(l)){console.warn(`[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:`,l.message);let{data:e,error:n}=await t.from(`asistencias`).insert(s,{returning:`representation`}).select();return n&&A(`No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)`,l),e||[]}return l&&A(`No se pudieron registrar las asistencias`,l),c}async function Ot({periodoId:e,fecha:n,claseId:r}={}){try{let i,a;if(e){let{data:n,error:r}=await t.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,e).single();r&&console.warn(`No se pudo cargar el período, mostrando todas las sesiones`,r),n&&(i=n.fecha_inicio,a=n.fecha_fin)}let o=t.from(`vw_asistencias_consolidada`).select(`
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
      `);i&&(o=o.gte(`fecha`,i)),a&&(o=o.lte(`fecha`,a)),n&&(o=o.eq(`fecha`,n)),r&&(o=o.eq(`clase_id`,r));let{data:s,error:c}=await o.order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});c&&A(`No se pudieron cargar las sesiones consolidadas`,c),Array.isArray(s)||(console.warn(`sesiones no es un array, usando array vacío`,s),s=[]),s=s.filter(e=>e.borrador===!1),console.log(`📊 Filtro de borradores: ${s.length} sesiones reales`),console.log(`📊 getReporteConsolidado DEBUG:`,{periodoId:e,sesionesCount:s.length,dataSource:`vw_asistencias_consolidada`,firstSesion:s[0]?{fecha:s[0].fecha,nombre_clase:s[0].nombre_clase,presentes:s[0].presentes,ausentes:s[0].ausentes,justificados:s[0].justificados}:`NO SESIONES`});let l={};s&&s.length>0&&s.forEach(e=>{let t={clase_id:e.clase_id,clase_nombre:e.nombre_clase,fecha:e.fecha,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,maestro_nombre:e.maestro_principal||`Sin asignar`,maestro_auxiliar_nombre:e.maestro_auxiliar||null,observacion_clase:e.observacion_clase||null,observacion_sesion:e.observacion_sesion||null,presentes:e.presentes||0,ausentes:e.ausentes||0,justificados:e.justificados||0,total_alumnos:e.total_registros||0,asistencias:e.asistencias_detalle?Array.isArray(e.asistencias_detalle)?e.asistencias_detalle:JSON.parse(e.asistencias_detalle||`[]`):[],justificaciones:e.justificaciones_detalle?Array.isArray(e.justificaciones_detalle)?e.justificaciones_detalle:JSON.parse(e.justificaciones_detalle||`[]`):[]};l[e.fecha]||(l[e.fecha]=[]),l[e.fecha].push(t)});let u=Object.entries(l).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,clases:t.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``))})),d=u.flatMap(e=>e.clases);return{timelineByDate:u,resumenGlobal:{totalClases:d.length,totalPresentes:d.reduce((e,t)=>e+t.presentes,0),totalAusentes:d.reduce((e,t)=>e+t.ausentes,0),totalJustificados:d.reduce((e,t)=>e+t.justificados,0),totalRegistros:d.reduce((e,t)=>e+t.total_alumnos,0),totalSesiones:s.length}}}catch(e){A(`Error en getReporteConsolidado`,e)}}function kt(e){if(!e||!e.trim())return null;let t=e.replace(/\D/g,``);if(t.length<7)return null;let n=t;return n.length>11&&(n=n.startsWith(`1`)?n.slice(0,11):n.slice(0,10)),n.length===11&&n.startsWith(`1`)?`+`+n:n.length===10?`+1`+n:n}function j(e){if(!e||!e.trim())return`—`;let t=e.replace(/\D/g,``),n=t.length===11&&t.startsWith(`1`)?t.slice(1):t.length===10?t:null;return n?`(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`:e}function At(e,t=``){if(!e)return null;let n=e.replace(/\D/g,``);if(n.length<7)return null;let r=`https://wa.me/${n}`;return t?`${r}?text=${encodeURIComponent(t)}`:r}function jt(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`Fecha desconocida`}function Mt(e){if(!e)return null;let t=new Date,n=new Date(e),r=t.getFullYear()-n.getFullYear(),i=t.getMonth()-n.getMonth();return(i<0||i===0&&t.getDate()<n.getDate())&&r--,r}function M(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function Nt(e){return{M:`Masculino`,F:`Femenino`,O:`Otro`,N:`No binario`}[e?.toUpperCase()]||`No especificado`}function Pt(e){return e?`bg-success`:`bg-secondary`}function Ft(e){return e?`Activo`:`Inactivo`}function It(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var N={alumnos:[],alumnosOriginales:[],cargando:!1,editando:null,viewingId:null,deletingId:null,filtroGenero:``,filtroEstado:`todos`},P=null,F={nombreMax:100,emailMax:100,cedulaMax:20,telefonoMax:20,acudienteMax:100,direccionMax:255,sectionMax:100};async function Lt(e){try{N.cargando=!0,Rt(e);let t=await He();N.alumnos=t,N.alumnosOriginales=[...t],N.cargando=!1,Bt(e),Ut(e)}catch(t){console.error(t),zt(e,t.message)}}function Rt(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando alumnos...</p>
      </div>
    </div>
  `}function zt(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${M(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>Lt(e))}function Bt(e){e.innerHTML=`
    <div class="page-container">
      <div class="alumnos-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-people fs-4"></i>
          </div>
          <div>
            <h1 class="alumnos-title-premium mb-0">Alumnos</h1>
            <p class="text-muted small mb-0">${N.alumnos.length} alumnos en total</p>
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
          ${Vt(N.alumnos)}
        </div>
        <div id="emptyContainer">
          ${N.alumnos.length===0?Ht():``}
        </div>
      </div>

    </div>
  `}function Vt(e){return e.length?e.map(e=>{let t=e.nombre||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${It(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${M(t)}</span>
            <small class="text-muted text-truncate">
              ${M(e.instrumento||`Sin instrumento especificado`)} ${e.familiar_nombre?`• Rep: ${M(e.familiar_nombre)}`:``}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-2 d-flex align-items-center justify-content-center" data-action="edit" data-id="${e.id}" title="Editar alumno" style="min-height: 32px; width: 32px;">
            <i class="bi bi-pencil-square"></i>
          </button>
          ${e.telefono?`
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="min-height: 32px;">
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${j(e.telefono)}</span>
            </button>
          `:`<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>`}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function Ht(){return`
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted mb-0">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
    </div>
  `}function Ut(e){P=e,e.querySelector(`#btnAgregarAlumno`)?.addEventListener(`click`,()=>Jt()),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>$t()),e.querySelector(`#buscar`)?.addEventListener(`input`,I),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,I),e.querySelector(`#alumnosTBody`)?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){Xt(t.dataset.id);return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id;n.dataset.action===`edit`?Yt(r):n.dataset.action===`delete`?Zt(r):n.dataset.action===`whatsapp`&&Wt(r)})}function Wt(e){let t=N.alumnosOriginales.find(t=>t.id===e);!t||!t.telefono||a.open({title:`Enviar WhatsApp a `+M(t.nombre),size:`md`,saveText:`Enviar WhatsApp`,body:`
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> ${j(t.telefono)}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,onSave:async e=>{let n=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=At(t.telefono,n);r&&window.open(r,`_blank`)}})}function I(){let e=P.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=P.querySelector(`#filtroEstado`)?.value||`todos`;N.alumnos=N.alumnosOriginales.filter(n=>{let r=!e||(n.nombre||``).toLowerCase().includes(e)||(n.instrumento||``).toLowerCase().includes(e)||(n.telefono||``).toLowerCase().includes(e)||(n.familiar_nombre||``).toLowerCase().includes(e),i=t===`todos`||t===`activo`&&n.is_active||t===`inactivo`&&!n.is_active;return r&&i}),Qt()}function Gt(e=``){return Xe.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function Kt(e=null){let t=e||{};return`<form class="row g-2">
    <div class="col-12">
      <label class="form-label-compact">Nombre Completo *</label>
      <input type="text" class="form-control input-dense" id="modal-nombre" maxlength="${F.nombreMax}" required placeholder="Juan Pérez" autocomplete="off" value="${M(t.nombre||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Teléfono (WhatsApp) *</label>
      <input type="tel" class="form-control input-dense" id="modal-telefono" required placeholder="+58 412 555 1234" autocomplete="off" value="${M(t.telefono||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Email</label>
      <input type="email" class="form-control input-dense" id="modal-email" maxlength="${F.emailMax}" placeholder="representante@ejemplo.com" autocomplete="off" value="${M(t.email||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Cédula del Alumno</label>
      <input type="text" class="form-control input-dense" id="modal-cedula" maxlength="${F.cedulaMax}" placeholder="12345678" autocomplete="off" value="${M(t.cedula||``)}">
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
      <input type="text" class="form-control input-dense" id="modal-instrumento" required maxlength="${F.sectionMax}" placeholder="Violín, Piano..." autocomplete="off" value="${M(t.instrumento||``)}">
    </div>
    <div class="col-12">
      <label class="form-label-compact">Dirección</label>
      <input type="text" class="form-control input-dense" id="modal-direccion" maxlength="${F.direccionMax}" placeholder="Dirección completa" autocomplete="off" value="${M(t.direccion||``)}">
    </div>
    
    <div class="col-12 mt-3">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-contacto-emergencia-nombre" placeholder="Nombre contacto" value="${M(t.contacto_emergencia_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-contacto-emergencia-telefono" placeholder="+58 412 555 1234" value="${M(t.contacto_emergencia_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-contacto-emergencia-parentesco">
              ${Gt(t.contacto_emergencia_parentesco)}
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
            <input type="text" class="form-control input-dense" id="modal-familiar-nombre" placeholder="Nombre familiar" value="${M(t.familiar_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-familiar-telefono-input" placeholder="+58 412 555 1234" value="${M(t.familiar_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-familiar-parentesco-input">
              ${Gt(t.familiar_parentesco)}
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
            <textarea class="form-control input-dense" id="modal-condiciones-medicas" rows="2" placeholder="Diabetes, epilepsia, etc.">${M(t.condiciones_medicas||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Alergias</label>
            <textarea class="form-control input-dense" id="modal-alergias" rows="2" placeholder="Alimentos, medicamentos, etc.">${M(t.alergias||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Medicamentos</label>
            <textarea class="form-control input-dense" id="modal-medicamentos" rows="2" placeholder="Medicamentos actuales">${M(t.medicamentos||``)}</textarea>
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
  </form>`}async function qt(e,t=null){let n=e.querySelector(`#modal-nombre`).value.trim(),i=e.querySelector(`#modal-email`).value.trim().toLowerCase(),a=e.querySelector(`#modal-telefono`).value.trim(),o=e.querySelector(`#modal-cedula`).value.trim(),s=e.querySelector(`#modal-fechaNacimiento`).value,c=e.querySelector(`#modal-genero`).value,l=e.querySelector(`#modal-instrumento`).value.trim(),u=e.querySelector(`#modal-familiar-nombre`).value.trim(),d=e.querySelector(`#modal-familiar-telefono-input`).value.trim()||a,f=e.querySelector(`#modal-familiar-parentesco-input`).value,p=e.querySelector(`#modal-esActivo`).checked;return n?l?a?{nombre:n,email:i||null,telefono:kt(a)||a,cedula:o||null,fecha_nacimiento:s||null,genero:c||null,instrumento:l,is_active:p,familiar_nombre:u||null,familiar_telefono:kt(d)||d||null,familiar_parentesco:f||null,contacto_emergencia_nombre:e.querySelector(`#modal-contacto-emergencia-nombre`).value.trim()||null,contacto_emergencia_telefono:kt(e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim())||e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim()||null,contacto_emergencia_parentesco:e.querySelector(`#modal-contacto-emergencia-parentesco`).value||null,condiciones_medicas:e.querySelector(`#modal-condiciones-medicas`).value.trim()||null,alergias:e.querySelector(`#modal-alergias`).value.trim()||null,medicamentos:e.querySelector(`#modal-medicamentos`).value.trim()||null}:(r.error(`El teléfono es obligatorio para WhatsApp`),null):(r.error(`El instrumento es obligatorio`),null):(r.error(`El nombre es obligatorio`),null)}function Jt(){N.editando=null,a.open({title:`Crear Nuevo Alumno`,size:`lg`,body:Kt(),saveText:`Guardar`,onSave:async e=>{let t=await qt(e);if(!t)return!1;let n=await We(t);N.alumnosOriginales.push(n),I(),r.success(`Alumno creado exitosamente`)}})}function Yt(e){let t=N.alumnosOriginales.find(t=>t.id===e);if(!t){r.error(`Alumno no encontrado`);return}N.editando=e,a.open({title:`Editar Alumno`,size:`lg`,body:Kt(t),saveText:`Guardar cambios`,onSave:async e=>{try{let n=await qt(e,t);if(!n)return!1;await Ge(N.editando,n);let i=N.alumnosOriginales.findIndex(e=>e.id===N.editando);i!==-1&&(N.alumnosOriginales[i]={...N.alumnosOriginales[i],...n}),I(),r.success(`Alumno actualizado correctamente`)}catch(e){return console.error(`[alumnosView] Error al actualizar alumno:`,e),r.error(e.message||`Error al guardar los cambios`),!1}}})}function Xt(e){let t=N.alumnosOriginales.find(t=>t.id===e);if(!t){r.error(`Alumno no encontrado`);return}N.viewingId=e,a.open({title:M(t.nombre),hideSave:!0,cancelText:`Cerrar`,size:`lg`,body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${M(t.nombre)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${t.email?`<a href="mailto:${M(t.email)}">${M(t.email)}</a>`:`-`}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Cédula</label>
            <p class="form-control-plaintext">${M(t.cedula||`-`)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Edad</label>
            <p class="form-control-plaintext">${Mt(t.fecha_nacimiento)?Mt(t.fecha_nacimiento)+` años`:`-`}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-2">
            <label class="form-label fw-bold">Género</label>
            <p class="form-control-plaintext">${Nt(t.genero)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${M(t.instrumento||`-`)}</p>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${Pt(t.is_active)}">
                ${Ft(t.is_active)}
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
            <p class="form-control-plaintext">${M(t.familiar_nombre||`-`)}</p>
          </div>
          ${t.telefono?`
            <div class="mb-2">
              <label class="form-label fw-bold">Teléfono (WhatsApp)</label>
              <p class="form-control-plaintext"><a href="${At(t.telefono)}" target="_blank" class="text-success text-decoration-none"><i class="bi bi-whatsapp"></i> ${j(t.telefono)}</a></p>
            </div>
          `:``}
        </div>
        <div class="col-md-6">
          ${t.email?`
            <div class="mb-2">
              <label class="form-label fw-bold">Email</label>
              <p class="form-control-plaintext"><a href="mailto:${M(t.email)}">${M(t.email)}</a></p>
            </div>
          `:``}
          ${t.direccion?`
            <div class="mb-2">
              <label class="form-label fw-bold">Dirección</label>
              <p class="form-control-plaintext">${M(t.direccion)}</p>
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
            <p class="form-control-plaintext">${M(t.contacto_emergencia_nombre||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${t.contacto_emergencia_telefono?`<a href="tel:${t.contacto_emergencia_telefono}">${j(t.contacto_emergencia_telefono)}</a>`:`-`}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Parentesco</label>
            <p class="form-control-plaintext">${Ze(t.contacto_emergencia_parentesco)}</p>
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
            <p class="form-control-plaintext">${M(t.familiar_nombre||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${t.familiar_telefono?`<a href="tel:${t.familiar_telefono}">${j(t.familiar_telefono)}</a>`:`-`}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Parentesco</label>
            <p class="form-control-plaintext">${Ze(t.familiar_parentesco)}</p>
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
            <p class="form-control-plaintext">${M(t.condiciones_medicas||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Alergias</label>
            <p class="form-control-plaintext">${M(t.alergias||`-`)}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-2">
            <label class="form-label fw-bold">Medicamentos</label>
            <p class="form-control-plaintext">${M(t.medicamentos||`-`)}</p>
          </div>
        </div>
      </div>
      `:``}

      <div class="row mt-2 pt-2 border-top">
        <div class="col-6">
          <label class="form-label fw-bold">Creado</label>
          <p class="form-control-plaintext small">${jt(t.created_at)}</p>
        </div>
        <div class="col-6">
          <label class="form-label fw-bold">Última actualización</label>
          <p class="form-control-plaintext small">${jt(t.updated_at)}</p>
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
    `,onShow:e=>{e.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{a.close(),setTimeout(()=>Yt(t.id),300)}),e.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{a.close(),setTimeout(()=>Zt(t.id),300)})}})}function Zt(e){let t=N.alumnosOriginales.find(t=>t.id===e);if(!t){r.error(`Alumno no encontrado`);return}N.deletingId=e,a.open({title:`⚠️ Eliminar Alumno`,size:`md`,saveText:`Eliminar`,body:`<div class="d-flex flex-column align-items-center justify-content-center py-5">
             <div class="spinner-border text-primary mb-3" role="status">
               <span class="visually-hidden">Cargando...</span>
             </div>
             <p class="text-muted mb-0">Analizando estado de inscripciones...</p>
           </div>`,onSave:async()=>{await Ke(e),N.alumnosOriginales=N.alumnosOriginales.filter(t=>t.id!==e),I(),a.close(),r.success(`Alumno eliminado correctamente`)}});let n=document.querySelector(`#app-global-modal .app-modal-btn-save`);n&&(n.style.display=`none`),setTimeout(async()=>{try{if(N.deletingId!==e)return;let r=await Ye(e),i=document.querySelector(`#app-global-modal .app-modal-body`);if(!i||N.deletingId!==e)return;n&&(n.style.display=``),r.length===0?i.innerHTML=`
          <div class="alert alert-success d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(40, 167, 69, 0.08); color: #155724;">
            <i class="bi bi-person-check-fill fs-3 text-success mt-1"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1" style="color: #0f6826;">Contacto Huérfano / Eliminación Segura</h6>
              <p class="mb-0 small" style="opacity: 0.9;">Este alumno no posee matrículas registradas ni está inscrito en ninguna clase activa en el período actual. Su eliminación no afectará datos académicos.</p>
            </div>
          </div>
          <p class="mb-2">¿Estás seguro de que querés eliminar permanentemente al alumno <strong>${M(t.nombre)}</strong>?</p>
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
            <span class="fw-semibold text-dark" style="font-size: 0.9rem;">${M(e.clase_nombre)}</span>
          </li>
        `).join(``)}
              </ul>
              <p class="mb-0 small fw-bold mt-2"><i class="bi bi-slash-circle-fill me-1"></i> ADVERTENCIA CRÍTICA: Eliminar a este alumno borrará físicamente su registro de asistencia, calificaciones históricas y matrículas activas.</p>
            </div>
          </div>
          <p class="mb-2">¿Realmente querés eliminar permanentemente al alumno <strong>${M(t.nombre)}</strong> y todos sus registros?</p>
          <p class="text-muted small mb-0"><i class="bi bi-exclamation-octagon-fill text-danger me-1"></i> Esta acción no se puede deshacer y puede provocar inconsistencias en los reportes de estas clases.</p>
        `}catch(r){if(console.error(r),N.deletingId!==e)return;let i=document.querySelector(`#app-global-modal .app-modal-body`);i&&(n&&(n.style.display=``),i.innerHTML=`
          <div class="alert alert-warning d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1">Error de Verificación</h6>
              <p class="mb-0 small">No se pudo comprobar si el alumno tiene clases activas. Procedé con precaución.</p>
            </div>
          </div>
          <p>¿Querés eliminar al alumno <strong>${M(t.nombre)}</strong> de todas formas?</p>
        `)}},300)}function Qt(){let e=P.querySelector(`#alumnosTBody`);if(!e)return;N.alumnos.length===0?e.innerHTML=Ht():e.innerHTML=Vt(N.alumnos);let t=P.querySelector(`#emptyContainer`);t&&(t.innerHTML=N.alumnos.length===0?Ht():``);let n=P.querySelector(`.alumnos-header-premium p.text-muted`);n&&(n.textContent=`${N.alumnos.length} alumnos en total`)}function $t(){if(N.alumnosOriginales.length===0){r.error(`No hay alumnos para exportar`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Estado`,`Fecha Nac.`,`Sección`],...N.alumnosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.estado||`activo`,e.fecha_nacimiento||``,e.section||``])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`alumnos-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),r.success(`CSV exportado exitosamente`)}var L=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.descripcion=e.descripcion||``,this.nivel=e.nivel||``,this.duracion_anios=e.duracion_anios||null,this.activo=e.activo===void 0?!0:e.activo,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(e=[]){let t=[];return!this.nombre||!this.nombre.trim()?t.push(`El nombre del programa es obligatorio`):this.nombre.length>100&&t.push(`El nombre no puede exceder los 100 caracteres`),this.nivel?e.length>0&&!e.includes(this.nivel)&&t.push(`El nivel seleccionado no es válido`):t.push(`El nivel es obligatorio`),this.descripcion&&this.descripcion.length>500&&t.push(`La descripción no puede exceder los 500 caracteres`),this.duracion_anios!==null&&(isNaN(this.duracion_anios)||this.duracion_anios<0)&&t.push(`La duración debe ser un número positivo`),t}toJSON(){return{nombre:this.nombre.trim(),descripcion:this.descripcion?this.descripcion.trim():``,nivel:this.nivel,duracion_anios:this.duracion_anios,activo:this.activo}}},R=[{value:``,label:`Sin nivel específico`},{value:`1`,label:`1° Año`},{value:`2`,label:`2° Año`},{value:`3`,label:`3° Año`},{value:`4`,label:`4° Año`},{value:`5`,label:`5° Año`},{value:`6`,label:`6° Año`},{value:`inicial`,label:`Nivel Inicial`},{value:`intermedio`,label:`Nivel Intermedio`},{value:`avanzado`,label:`Nivel Avanzado`},{value:`preuniversitario`,label:`Pre-Universitario`}];function en(e){let t=R.find(t=>t.value===e);return t?t.label:e||`-`}async function tn(){let{data:e,error:n}=await t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando programas:`,n.message),n;return(e||[]).map(e=>new L(e))}async function nn(e){let n=new L(e),r=R.map(e=>e.value).filter(Boolean),i=n.validate(r);if(i.length>0)throw Error(i.join(`. `));let{data:a,error:o}=await t.from(`programas`).insert([n.toJSON()]).select();if(o)throw console.error(`Error creando programa:`,o.message),o;return new L(a[0])}async function rn(e,n){let r=new L(n),i=R.map(e=>e.value).filter(Boolean),a=r.validate(i);if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`programas`).update(r.toJSON()).eq(`id`,e).select();if(s)throw console.error(`Error actualizando programa:`,s.message),s;return new L(o[0])}async function an(e){let{error:n}=await t.from(`programas`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando programa:`,n.message),n}async function on(e){let{jsPDF:t}=await i(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-Cp9PwTtV.js`);return{jsPDF:e}},__vite__mapDeps([0,1,2,3])),{default:n}=await i(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BcXxEeZj.js`);return{default:e}},[]),r=new t;r.setFontSize(18),r.text(`Programas Académicos`,14,22),r.setFontSize(10),r.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,30),n(r,{head:[[`Nombre`,`Nivel`,`Descripción`,`Estado`,`Creado`]],body:e.map(e=>[e.nombre,en(e.nivel),e.descripcion?e.descripcion.substring(0,50)+(e.descripcion.length>50?`...`:``):`-`,e.activo?`Activo`:`Inactivo`,e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`):`-`]),startY:35,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),r.save(`programas.pdf`)}var z={programas:[],programasOriginales:[],cargando:!1},sn={nombreMax:100,descripcionMax:500};function B(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function cn(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`N/A`}function ln(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function un(e=``){return R.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}async function dn(e){try{z.cargando=!0,fn(e);let t=await tn();z.programas=t,z.programasOriginales=[...t],z.cargando=!1,mn(e),_n(e)}catch(t){console.error(`[ProgramasView]`,t),pn(e,t.message)}}function fn(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando programas...</p>
      </div>
    </div>
  `}function pn(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${B(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>dn(e))}function mn(e){e.innerHTML=`
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
          ${hn(z.programas)}
        </div>
        <div id="emptyContainer">
          ${z.programas.length===0?gn():``}
        </div>
      </div>
    </div>
  `}function hn(e){return e.length?e.map(e=>{let t=ln(e.nombre),n=en(e.nivel),r=B(e.descripcion||`Sin descripción`),i=`border-accent-${e.activo?`success`:`secondary`}`,a=`bg-${e.activo?`success`:`secondary`}`;return`
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
    `}).join(``):``}function gn(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No hay programas que coincidan con la búsqueda.</p>
    </div>
  `}var V=null;function _n(e){V=e,e.querySelector(`#btnAgregarPrograma`)?.addEventListener(`click`,()=>bn()),e.querySelector(`#btnExportarPDF`)?.addEventListener(`click`,async()=>{try{await on(z.programas),r.success(`PDF generado exitosamente`)}catch{r.error(`Error al generar PDF`)}}),e.querySelector(`#buscar`)?.addEventListener(`input`,vn),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,vn),e.querySelector(`#programasTBody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t){let t=e.target.closest(`.list-group-item[data-id]`);t&&Cn(t.dataset.id);return}let{action:n,id:r}=t.dataset;n===`edit`&&xn(r),n===`delete`&&wn(r)})}function vn(){let e=V.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=V.querySelector(`#filtroEstado`)?.value||`todos`;z.programas=z.programasOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||(n.descripcion||``).toLowerCase().includes(e),i=t===`todos`||t===`activo`&&n.activo||t===`inactivo`&&!n.activo;return r&&i}),yn()}function yn(){let e=V.querySelector(`#programasTBody`);e&&(e.innerHTML=hn(z.programas));let t=V.querySelector(`#emptyContainer`);t&&(t.innerHTML=z.programas.length===0?gn():``)}function bn(){Sn({title:`Nuevo Programa`,saveText:`Crear Programa`})}function xn(e){let t=z.programasOriginales.find(t=>t.id===e);if(!t)return r.error(`Programa no encontrado`);Sn({title:`Editar Programa`,saveText:`Guardar Cambios`,programa:t})}function Sn({title:e,saveText:t,programa:n=null}){a.open({title:e,saveText:t,body:`
      <form id="form-programa" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Nombre del Programa *</label>
          <input type="text" class="form-control input-dense" id="prog-nombre" required maxlength="${sn.nombreMax}" value="${B(n?.nombre||``)}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Nivel / Año *</label>
          <select class="form-select input-dense" id="prog-nivel">
            ${un(n?.nivel||``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Duración (años)</label>
          <input type="number" class="form-control input-dense" id="prog-duracion" min="0" step="0.5" value="${n?.duracion_anios||``}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción</label>
          <textarea class="form-control input-dense" id="prog-descripcion" rows="3" maxlength="${sn.descripcionMax}">${B(n?.descripcion||``)}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="prog-activo" ${n?.activo===!1?``:`checked`}>
            <label class="form-check-label" for="prog-activo">Programa Activo</label>
          </div>
        </div>
      </form>
    `,onSave:async e=>{let t={nombre:e.querySelector(`#prog-nombre`).value.trim(),nivel:e.querySelector(`#prog-nivel`).value,duracion_anios:e.querySelector(`#prog-duracion`).value?parseFloat(e.querySelector(`#prog-duracion`).value):null,descripcion:e.querySelector(`#prog-descripcion`).value.trim(),activo:e.querySelector(`#prog-activo`).checked},i=new L(t),a=R.map(e=>e.value).filter(Boolean),o=i.validate(a);if(o.length>0)return r.error(o[0]),!1;try{if(n){let e=await rn(n.id,t),i=z.programasOriginales.findIndex(e=>e.id===n.id);z.programasOriginales[i]=e,r.success(`Programa actualizado`)}else{let e=await nn(t);z.programasOriginales.unshift(e),r.success(`Programa creado`)}return vn(),!0}catch(e){return r.error(e.message),!1}}})}function Cn(e){let t=z.programasOriginales.find(t=>t.id===e);t&&a.open({title:`Perfil del Programa`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="programa-profile">
        <!-- Header Banner / Avatar Section -->
        <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
          <div class="position-relative" style="flex-shrink: 0;">
            <div class="avatar-large bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center fw-bold" 
                 style="width: 60px; height: 60px; font-size: 1.6rem; border-radius: 50%;">
              ${ln(t.nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 bg-${t.activo?`success`:`danger`} border border-light rounded-circle" 
                  style="transform: translate(10%, 10%);"
                  title="${t.activo?`Activo`:`Inactivo`}">
            </span>
          </div>
          <div class="overflow-hidden">
            <h4 class="h5 mb-1 fw-bold text-truncate" style="letter-spacing: -0.01em;">${B(t.nombre)}</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">${en(t.nivel)}</span>
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
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${cn(t.created_at)}</p>
                </div>
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-event me-1"></i> Modificado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${t.updated_at?cn(t.updated_at):cn(t.created_at)}</p>
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
    `,onShow:n=>{n.querySelector(`#view-edit-btn`).addEventListener(`click`,()=>{a.close(),setTimeout(()=>xn(e),300)}),n.querySelector(`#view-delete-btn`).addEventListener(`click`,()=>{a.close(),setTimeout(()=>wn(e),300)}),n.querySelector(`#copy-id-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(t.id),r.success(`ID copiado al portapapeles`)})}})}function wn(e){let t=z.programasOriginales.find(t=>t.id===e);t&&a.open({title:`⚠️ Eliminar Programa`,saveText:`Confirmar Eliminación`,body:`
      <p>¿Estás seguro de eliminar el programa <strong>${B(t.nombre)}</strong>?</p>
      <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Esta acción no se puede deshacer.</p>
    `,onSave:async()=>{try{return await an(e),z.programasOriginales=z.programasOriginales.filter(t=>t.id!==e),vn(),r.success(`Programa eliminado`),!0}catch{return r.error(`Error al eliminar`),!1}}})}function Tn(e){return e?{...e,user_id:e.user_id??null,nombre:e.nombre_completo??``,email:e.correo??``,telefono:e.tlf??``,instrumento:e.especialidad??``,bio:e.resena??``,is_active:e.activo??!0,especialidades:Array.isArray(e.especialidades)?e.especialidades:[]}:null}async function En(){let{data:e,error:n}=await t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0});if(n)throw console.error(`Error cargando maestros:`,n.message),Error(`No se pudieron cargar los maestros`);return e.map(Tn)}async function Dn(e){let n=(e.nombre||e.nombre_completo||``).trim();if(!n)throw Error(`El nombre es obligatorio`);let r={nombre_completo:n,correo:(e.email||e.correo||``).trim().toLowerCase()||null,tlf:(e.telefono||e.tlf||``).trim()||null,especialidad:(e.instrumento||e.especialidad||``).trim()||null,resena:(e.bio||e.resena||``).trim()||null,activo:e.is_active===void 0?e.activo===void 0?!0:e.activo:e.is_active,especialidades:Array.isArray(e.especialidades)?e.especialidades:[],user_id:e.user_id||null},{data:i,error:a}=await t.from(`maestros`).insert([r]).select();if(a)throw console.error(`Error creando maestro:`,a.message),Error(`No se pudo crear el maestro`);return Tn(i[0])}async function On(e,n){let r={},i=n.nombre||n.nombre_completo;i!==void 0&&(r.nombre_completo=i.trim());let a=n.email||n.correo;a!==void 0&&(r.correo=a.trim().toLowerCase());let o=n.telefono||n.tlf;o!==void 0&&(r.tlf=o.trim());let s=n.instrumento||n.especialidad;s!==void 0&&(r.especialidad=s.trim());let c=n.bio||n.resena;c!==void 0&&(r.resena=c.trim()),n.is_active!==void 0&&(r.activo=n.is_active),n.activo!==void 0&&(r.activo=n.activo),n.especialidades!==void 0&&(r.especialidades=Array.isArray(n.especialidades)?n.especialidades:[]);let{data:l,error:u}=await t.from(`maestros`).update(r).eq(`id`,e).select();if(u)throw console.error(`Error actualizando maestro:`,u.message),Error(`No se pudo actualizar el maestro`);return Tn(l[0])}async function kn(e){let{error:n}=await t.from(`maestros`).update({activo:!1}).eq(`id`,e);if(n)throw console.error(`Error inactivando maestro:`,n.message),Error(`No se pudo desactivar el maestro`)}async function An(e){let{error:n}=await t.from(`maestros`).update({activo:!0}).eq(`id`,e);if(n)throw console.error(`Error activando maestro:`,n.message),Error(`No se pudo activar el maestro`)}async function jn(e){let{data:n,error:r}=await t.from(`maestros`).select(`id`).eq(`correo`,e.trim().toLowerCase()).maybeSingle();return r&&r.code!==`PGRST116`&&console.error(`Error validando email:`,r.message),!!n}function H(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function Mn(e){return e?`success`:`secondary`}function Nn(e){return e?`Activo`:`Inactivo`}function Pn(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var U={maestros:[],salones:[],programas:[],alumnos:[],onSuccess:null},Fn={nombreMax:100,notasMax:500};async function In(e=null,t={}){U={...U,...t};let n=!!e,i=[],o=[];if(n){r.info(`Cargando datos de la clase...`);let t=await l(e.id);i=(t||[]).map(e=>e.alumno_id),o=t||[]}let s=n?`Editar Clase: ${e.nombre}`:`Nueva Clase`,c=n?`Guardar Cambios`:`Crear Clase`;a.open({title:s,saveText:c,size:`lg`,body:Ln(e,i,o),onShow:t=>{zn(t,e)},onSave:async t=>await Bn(t,e)})}function Ln(e,t,n=[]){return`
    <form class="row g-3" id="formClase">
      <div class="col-md-6">
        <label class="form-label-compact">Nombre de la Clase *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ej: Violín Básico A" value="${d(e?.nombre||``)}" maxlength="${Fn.nombreMax}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar..." value="${d(e?.instrumento||``)}">
        ${Gn()}
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Programa *</label>
        <select class="form-select input-dense" id="modal-programa_id" required>
          ${Un(e?.programa_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro Titular *</label>
        <select class="form-select input-dense" id="modal-maestro_id" required>
          ${Vn(e?.maestro_principal_id)}
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
          ${Vn(e?.maestro_suplente_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. Alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${e?.capacidad_maxima||20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${Wn(e?.estado||`activa`)}
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
          ${qn(e?.horarios||[])}
        </div>
      </div>

      <div class="col-12">
        <label class="form-label-compact">Notas Pedagógicas</label>
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Observaciones sobre el grupo o metodología..." maxlength="${Fn.notasMax}">${d(e?.descripcion||``)}</textarea>
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-grupal" style="display:${e?.tipo_clase===`rotativa`?`none`:`block`}">
        <label class="form-label-compact mb-2"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
        ${Jn(t)}
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-rotativa" style="display:${e?.tipo_clase===`rotativa`?`block`:`none`}">
        <label class="form-label-compact mb-2"><i class="bi bi-person-lines-fill me-1"></i>Turnos individuales</label>
        ${Rn(n)}
      </div>
    </form>
  `}function Rn(e=[]){let t=U.alumnos||[],n=(e=``,n=``,r=``)=>(t.find(t=>t.id===e),`
      <div class="slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary">
        <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
          <option value="">Seleccionar alumno…</option>
          ${t.map(t=>`
            <option value="${t.id}" ${t.id===e?`selected`:``}>
              ${d(t.nombre_completo)}${t.instrumento_principal?` — ${d(t.instrumento_principal)}`:``}
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
    </div>`}function zn(e,t){let n=e.querySelector(`#modal-tiene_suplente`),i=e.querySelector(`#modal-maestro_suplente_id`);n&&i&&n.addEventListener(`change`,e=>{i.style.display=e.target.checked?`block`:`none`,e.target.checked||(i.value=``)}),e.querySelector(`#btn-add-horario`).addEventListener(`click`,()=>{let t=e.querySelector(`#modal-horarios-container`),n=t.children.length,r=document.createElement(`div`);r.innerHTML=Kn(null,n),t.appendChild(r.firstElementChild)}),e.querySelector(`#modal-horarios-container`).addEventListener(`click`,t=>{let n=t.target.closest(`.btn-remove-horario`);n&&(e.querySelector(`#modal-horarios-container`).children.length>1?n.closest(`.horario-row`).remove():r.warning(`La clase debe tener al menos un horario`))});let a=e.querySelector(`#seccion-alumnos-grupal`),o=e.querySelector(`#seccion-alumnos-rotativa`);e.querySelectorAll(`input[name="modal-tipo_clase"]`).forEach(t=>{t.addEventListener(`change`,()=>{let t=e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value===`rotativa`;a.style.display=t?`none`:`block`,o.style.display=t?`block`:`none`})});let s=e.querySelector(`#slots-container`),c=e.querySelector(`#slots-count`),l=()=>{let e=s.querySelectorAll(`.slot-row`).length;c.textContent=`${e} turno${e===1?``:`s`} asignado${e===1?``:`s`}`};e.querySelector(`#btn-add-slot`)?.addEventListener(`click`,()=>{let e=U.alumnos||[],t=document.createElement(`div`);t.innerHTML=(Rn([]).split(`id="slots-container"`)[1],``);let n=document.createElement(`div`);n.className=`slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary`,n.innerHTML=`
      <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
        <option value="">Seleccionar alumno…</option>
        ${e.map(e=>`<option value="${e.id}">${d(e.nombre_completo)}${e.instrumento_principal?` — ${d(e.instrumento_principal)}`:``}</option>`).join(``)}
      </select>
      <div class="d-flex align-items-center gap-1 flex-shrink-0">
        <input type="time" class="form-control form-control-sm slot-hora-inicio" style="width:110px;" required title="Hora inicio">
        <span class="text-muted small">–</span>
        <input type="time" class="form-control form-control-sm slot-hora-fin" style="width:110px;" required title="Hora fin">
      </div>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
        <i class="bi bi-x-circle-fill fs-5"></i>
      </button>`,s.appendChild(n),l()}),s?.addEventListener(`click`,e=>{if(e.target.closest(`.btn-remove-slot`)){if(s.querySelectorAll(`.slot-row`).length<=1){r.warning(`Debe haber al menos un turno en una clase rotativa`);return}e.target.closest(`.slot-row`).remove(),l()}});let u=e.querySelector(`#search-modal-alumnos`),f=e.querySelectorAll(`.alumno-check-item`);u?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();f.forEach(e=>{let n=e.dataset.nombre.includes(t)||e.dataset.instrumento.includes(t);e.style.display=n?`block`:`none`})});let p=e.querySelectorAll(`.alumnos-list input[type="checkbox"]`),m=e.querySelector(`#alumnos-selection-count`),h=()=>{let e=Array.from(p).filter(e=>e.checked).length;m&&(m.textContent=`${e} alumnos seleccionados`)};p.forEach(e=>e.addEventListener(`change`,h)),h()}async function Bn(e,t){let n=!!t,i=(()=>{let t=e.querySelector(`#modal-maestro_suplente_id`).value,n=e.querySelector(`#modal-tiene_suplente`).checked;return{nombre:e.querySelector(`#modal-nombre`).value.trim(),programa_id:e.querySelector(`#modal-programa_id`).value,maestro_principal_id:e.querySelector(`#modal-maestro_id`).value,maestro_suplente_id:n?t:null,tiene_suplente:n,instrumento:e.querySelector(`#modal-instrumento`).value.trim(),capacidad_maxima:parseInt(e.querySelector(`#modal-max_alumnos`).value)||20,estado:e.querySelector(`#modal-estado`).value,tipo_clase:e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value||`grupal`,descripcion:e.querySelector(`#modal-notas_pedagogicas`).value.trim(),horarios:Array.from(e.querySelectorAll(`.horario-row`)).map(e=>({dia:e.querySelector(`[name="horario-dia"]`).value,hora_inicio:e.querySelector(`[name="horario-hora_inicio"]`).value,hora_fin:e.querySelector(`[name="horario-hora_fin"]`).value,salon_id:e.querySelector(`[name="horario-salon_id"]`).value||null}))}})(),a=new u(i).validate();if(a.length>0)return r.error(a[0]),!1;let o=()=>Array.from(e.querySelectorAll(`#slots-container .slot-row`)).map(e=>({alumno_id:e.querySelector(`.slot-alumno-select`).value,hora_inicio:e.querySelector(`.slot-hora-inicio`).value,hora_fin:e.querySelector(`.slot-hora-fin`).value})).filter(e=>e.alumno_id),s=async t=>{let n=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value),r=(await l(t)).map(e=>e.alumno_id),i=n.filter(e=>!r.includes(e)),a=r.filter(e=>!n.includes(e));await Promise.all([...i.map(e=>_(t,e)),...a.map(e=>c(t,e))])},d=async e=>{let t=o();if(t.length===0)return r.warning(`Agregá al menos un turno`),!1;if(t.find(e=>!e.hora_inicio||!e.hora_fin))return r.error(`Todos los turnos deben tener hora de inicio y fin`),!1;let n=(await l(e)).map(e=>e.alumno_id),i=t.map(e=>e.alumno_id),a=n.filter(e=>!i.includes(e));return await Promise.all(a.map(t=>c(e,t))),await Promise.all(t.map(t=>n.includes(t.alumno_id)?g(e,t.alumno_id,t.hora_inicio,t.hora_fin):_(e,t.alumno_id,t.hora_inicio,t.hora_fin))),!0};try{let a;if(n)if(a=await v(t.id,i),i.tipo_clase===`rotativa`){if(!await d(a.id))return!1}else await s(a.id);else if(a=await m(i),i.tipo_clase===`rotativa`){if(!await d(a.id))return!1}else{let t=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value);t.length>0&&await Promise.all(t.map(e=>_(a.id,e)))}return r.success(n?`Clase actualizada`:`Clase creada`),U.onSuccess&&U.onSuccess(),!0}catch(e){return e.isConflict?r.warning(`Conflicto detected: ${e.message}`):r.error(e.message),!1}}function Vn(e=``){return`<option value="">Seleccionar maestro...</option>`+U.maestros.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${d(t.nombre_completo||t.nombre)}</option>`).join(``)}function Hn(e=``){return`<option value="">Sin salón (Online/Otro)</option>`+U.salones.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${d(t.nombre)}</option>`).join(``)}function Un(e=``){return`<option value="">Seleccionar programa...</option>`+U.programas.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${d(t.nombre)}</option>`).join(``)}function Wn(e=`activa`){return u.getEstados().map(t=>`<option value="${t}" ${t===e?`selected`:``}>${u.getEstadoLabel(t)}</option>`).join(``)}function Gn(){return`<datalist id="instrumentos-list">${[`Violín`,`Viola`,`Cello`,`Piano`,`Flauta`,`Teoría`,`Coro`].map(e=>`<option value="${e}">`).join(``)}</datalist>`}function Kn(e,t){return`
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
            ${Hn(e?.salon_id)}
          </select>
        </div>
      </div>
    </div>
  `}function qn(e=[]){return e.length===0?Kn(null,0):e.map((e,t)=>Kn(e,t)).join(``)}function Jn(e=[]){return`
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
              ${d(t.nombre_completo)} <span class="text-muted">(${d(t.instrumento_principal||`N/A`)})</span>
            </label>
          </div>
        `).join(``)}
      </div>
      <div class="text-end mt-1"><small class="text-muted" id="alumnos-selection-count">0 seleccionados</small></div>
    </div>
  `}var Yn=`app-help-panel`,Xn=`app-help-overlay`,Zn=!1;function Qn(){if(Zn)return;Zn=!0;let e=document.createElement(`style`);e.id=`app-help-panel-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function $n(){if(document.getElementById(Yn))return;Qn();let e=document.createElement(`div`);e.id=Xn,document.body.appendChild(e);let t=document.createElement(`div`);t.id=Yn,t.setAttribute(`role`,`complementary`),t.setAttribute(`aria-label`,`Ayuda`),t.innerHTML=`
    <div id="ahp-header">
      <div id="ahp-badge"><i class="bi bi-question"></i></div>
      <span id="ahp-title">Ayuda</span>
      <button id="ahp-close" aria-label="Cerrar">
        <i class="bi bi-x" style="font-size:1.1rem;"></i>
      </button>
    </div>
    <div id="ahp-body"></div>
  `,document.body.appendChild(t),e.addEventListener(`click`,()=>W.close()),t.querySelector(`#ahp-close`).addEventListener(`click`,()=>W.close()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&W.close()})}var W={open({title:e,intro:t,sections:n=[]}){$n();let r=document.getElementById(Yn),i=document.getElementById(Xn);document.getElementById(`ahp-title`).textContent=e||`Ayuda`,document.getElementById(`ahp-body`).innerHTML=`
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
    `,i.style.display=`block`,requestAnimationFrame(()=>{i.classList.add(`hp-visible`),r.classList.add(`hp-visible`)})},close(){let e=document.getElementById(Yn),t=document.getElementById(Xn);!e||!e.classList.contains(`hp-visible`)||(e.classList.remove(`hp-visible`),t.classList.remove(`hp-visible`),setTimeout(()=>{t&&(t.style.display=`none`)},280))}},G={maestros:[],maestrosOriginales:[],editando:null,deletingId:null},er={nombreMax:100},K=null,tr=[`Piano`,`Guitarra`,`Violín`,`Viola`,`Cello`,`Contrabajo`,`Flauta`,`Clarinete`,`Oboe`,`Fagot`,`Saxofón`,`Trompeta`,`Trombón`,`Corno`,`Tuba`,`Percusión`,`Batería`,`Canto`,`Teoría`,`Solfeo`,`Dirección`,`Composición`,`Arreglos`];async function nr(e){try{rr(e);let t=await En();G.maestros=t,G.maestrosOriginales=[...t],cr(e),ur(e)}catch(t){console.error(t),ir(e,t.message)}}function rr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
      </div>
    </div>
  `}function ir(e,t){e.innerHTML=`
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
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>nr(e))}function ar(e=[],t=`modal-especialidades-input`){return`
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
            ${tr.slice(0,8).map(e=>`
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${H(e)}">${H(e)}</button>
            `).join(`, `)}
          </div>
        </div>
      </div>
    </div>
  `}function or(e){let t=e.querySelector(`.especialidades-chips-container`);if(!t)return[];let n=t.querySelectorAll(`.chip-item`);return Array.from(n).map(e=>e.textContent.replace(/×$/,``).trim())}function sr(e,t){let n=e.querySelector(`#modal-especialidades-input`),r=e.querySelector(`#btnAddEspecialidad`),i=e.querySelector(`.especialidades-chips-container`),a=r=>{let a=r.trim();if(a){if(!or(e).includes(a)){let e=i.querySelector(`.chips-wrapper`),n=document.createElement(`span`);n.className=`badge bg-primary-subtle text-primary rounded-pill chip-item`,n.innerHTML=`${H(a)}<i class="bi bi-x-lg chip-remove" data-especialidad="${H(a)}" style="cursor:pointer;margin-left:4px;"></i>`,e.appendChild(n),t&&t()}n.value=``}};n?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(e.preventDefault(),a(n.value))}),r?.addEventListener(`click`,()=>a(n.value)),i?.addEventListener(`click`,e=>{e.target.classList.contains(`chip-remove`)&&(e.target.closest(`.chip-item`).remove(),t&&t()),e.target.classList.contains(`suggest-chip`)&&(e.preventDefault(),a(e.target.dataset.especialidad))})}function cr(e){e.innerHTML=`
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
          ${lr(G.maestros)}
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `}function lr(e){return e.length?e.map(e=>{let t=e.nombre||e.name||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${Pn(t)}
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
      </div>`}function ur(e){K=e,e.querySelector(`#btnAgregarMaestro`).addEventListener(`click`,()=>fr()),e.querySelector(`#btn-help-maestros`)?.addEventListener(`click`,()=>{W.open({title:`Maestros`,intro:`Gestión del plantel docente. Desde acá podés ver, agregar, editar y desactivar maestros, y acceder al perfil completo de cada uno.`,sections:[{icon:`bi-search`,title:`Buscador y filtros`,description:`Filtrá por nombre, instrumento o estado (activo/inactivo) en tiempo real.`,color:`#6b7280`},{icon:`bi-person-badge`,title:`Tarjeta de maestro`,description:`Nombre, instrumento principal, clases activas y estado. Badge verde = activo, gris = inactivo.`,color:`#3b82f6`},{icon:`bi-eye`,title:`Ver perfil`,description:`Perfil completo: datos personales, clases (titular y suplente), horarios y ocupación.`,color:`#10b981`},{icon:`bi-pencil`,title:`Editar desde el perfil`,description:`Desde el perfil podés editar cualquier clase que dicte directamente, sin salir del modal.`,color:`#f59e0b`},{icon:`bi-person-x`,title:`Desactivar maestro`,description:`Desactivar oculta al maestro de listas operativas pero conserva su historial. No elimina datos.`,color:`#ef4444`}]})}),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>vr()),e.querySelector(`#buscar`).addEventListener(`input`,()=>q()),e.querySelector(`#filtroEstado`).addEventListener(`change`,()=>q()),e.querySelector(`#maestrosTBody`).addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){mr(t.dataset.id);return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id,i=n.dataset.action;i===`edit`?pr(r):i===`delete`?hr(r):i===`whatsapp`&&dr(r)})}function dr(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t||!t.telefono)return;let n=t.telefono.replace(/\D/g,``);a.open({title:`Enviar WhatsApp a `+H(t.nombre||t.name||``),size:`md`,saveText:`Enviar WhatsApp`,body:`
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
    `,onSave:async e=>{let t=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=`https://wa.me/${n}?text=${encodeURIComponent(t)}`;window.open(r,`_blank`)}})}function q(){let e=K.querySelector(`#buscar`).value.trim().toLowerCase(),t=K.querySelector(`#filtroEstado`).value;G.maestros=G.maestrosOriginales.filter(n=>{let r=(n.nombre||n.name||``).toLowerCase(),i=!e||r.includes(e)||(n.email||``).toLowerCase().includes(e)||(n.instrumento||``).toLowerCase().includes(e)||(n.especialidad||``).toLowerCase().includes(e)||(n.especialidades||[]).some(t=>t.toLowerCase().includes(e)),a=n.is_active??!0;return i&&(t===`todos`||t===`activo`&&a||t===`inactivo`&&!a)}),gr()}function fr(){G.editando=null,a.open({title:`Crear Nuevo Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${er.nombreMax}" placeholder="Juan Pérez">
        <small class="text-muted" id="modal-nombreCount">0/${er.nombreMax}</small>
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
      ${ar([],`modal-especialidades-input`)}
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
    </form>`,onShow:e=>sr(e),saveText:`Guardar`,onSave:async e=>{let t=e.querySelector(`#modal-nombre`).value.trim(),n=e.querySelector(`#modal-email`).value.trim().toLowerCase(),r=e.querySelector(`#modal-telefono`).value.trim(),i=e.querySelector(`#modal-instrumento`).value.trim(),a=e.querySelector(`#modal-especialidad`).value.trim(),o=e.querySelector(`#modal-bio`).value.trim(),s=e.querySelector(`#modal-esActivo`).checked;if(!t)return J(`El nombre es obligatorio`,`error`),!1;if(!n)return J(`El email es obligatorio`,`error`),!1;if(!_r(n))return J(`El formato del email no es válido`,`error`),!1;if(n&&await jn(n))return J(`El email ya está registrado`,`error`),!1;let c=or(e),l=await Dn({nombre:t,email:n||null,telefono:r||null,instrumento:i||null,especialidad:a||null,bio:o||null,is_active:s,especialidades:c});G.maestrosOriginales.push(l),q(),J(`Maestro creado exitosamente`,`success`)}})}function pr(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t){J(`Maestro no encontrado`,`error`);return}G.editando=e,a.open({title:`Editar Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${er.nombreMax}" value="${H(t.nombre||t.name||``)}">
        <small class="text-muted" id="modal-nombreCount">${(t.nombre||t.name||``).length}/${er.nombreMax}</small>
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
      ${ar(t.especialidades||[],`modal-especialidades-input`)}
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
    </form>`,onShow:e=>sr(e),saveText:`Guardar cambios`,onSave:async e=>{let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-instrumento`).value.trim(),o=e.querySelector(`#modal-especialidad`).value.trim(),s=e.querySelector(`#modal-bio`).value.trim(),c=e.querySelector(`#modal-esActivo`).checked;if(!n)return J(`El nombre es obligatorio`,`error`),!1;if(!r)return J(`El email es obligatorio`,`error`),!1;if(!_r(r))return J(`El formato del email no es válido`,`error`),!1;if(r&&t.email!==r&&await jn(r))return J(`El email ya está registrado`,`error`),!1;let l=or(e),u={nombre:n,email:r||null,telefono:i||null,instrumento:a||null,especialidad:o||null,bio:s||null,is_active:c,especialidades:l};await On(G.editando,u);let d=G.maestrosOriginales.findIndex(e=>e.id===G.editando);d!==-1&&(G.maestrosOriginales[d]={...G.maestrosOriginales[d],...u}),q(),J(`Maestro actualizado correctamente`,`success`)}})}function mr(e){let n=G.maestrosOriginales.find(t=>t.id===e);if(!n){J(`Maestro no encontrado`,`error`);return}let r=n.nombre||n.name||`-`,i=n.is_active??!0;a.open({title:r,hideSave:!0,cancelText:`Cerrar`,body:`
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
              <span class="badge ${Mn(i)}">${Nn(i)}</span>
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
    `,onShow:async n=>{n.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{a.close(),setTimeout(()=>pr(e),300)}),n.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{a.close(),setTimeout(()=>hr(e),300)});let r=n.querySelector(`#maestro-clases-container`),i=n.querySelector(`#maestro-clases-badge`);(async()=>{try{let[n,o,s,c,l]=await Promise.all([re(e),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]),u={maestros:o.data||[],salones:s.data||[],programas:c.data||[],alumnos:l.data||[]};if(i.textContent=`${n.length} clase${n.length===1?``:`s`}`,n.length===0){r.innerHTML=`
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
            </div>`,r.querySelectorAll(`.btn-editar-clase`).forEach(t=>{t.addEventListener(`click`,t=>{let r=t.currentTarget.dataset.claseId,i=n.find(e=>e.id===r);i&&(a.close(),setTimeout(()=>{In(i,{...u,onSuccess:()=>{setTimeout(()=>mr(e),300)}})},300))})}),r.querySelectorAll(`.btn-desvincular-clase`).forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget.dataset.claseId,r=t.currentTarget.dataset.claseNombre,i=t.currentTarget.dataset.esSuplente===`true`?`maestro_suplente_id`:`maestro_principal_id`;if(confirm(`¿Quitar a este maestro de "${r}"?`))try{t.currentTarget.disabled=!0,t.currentTarget.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`,await v(n,{[i]:null},!0),J(`Maestro desvinculado correctamente`,`success`),a.close(),setTimeout(()=>mr(e),300)}catch(e){J(`Error al desvincular: `+e.message,`error`),t.currentTarget.disabled=!1,t.currentTarget.innerHTML=`<i class="bi bi-person-dash" style="font-size:1rem;"></i><span>Quitar</span>`}})})}catch{i.textContent=`Error`,r.innerHTML=`
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar las clases.
            </div>`}})()}})}function hr(e){let t=G.maestrosOriginales.find(t=>t.id===e);if(!t){J(`Maestro no encontrado`,`error`);return}G.deletingId=e;let n=t.nombre||t.name||``,r=t.is_active!==!1;a.open({title:r?`⏸️ Desactivar Maestro`:`▶️ Reactivar Maestro`,size:`sm`,saveText:r?`Desactivar`:`Reactivar`,body:r?`<p>¿Desactivar al maestro <strong>${H(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro no aparecerá en las listas, pero sus datos se conservarán.</p>`:`<p>¿Reactivar al maestro <strong>${H(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro volverá a aparecer en las listas.</p>`,onSave:async()=>{r?(await kn(e),J(`Maestro desactivado correctamente`,`success`)):(await An(e),J(`Maestro reactivado correctamente`,`success`)),q()}})}function gr(){let e=K.querySelector(`#maestrosTBody`);if(!e)return;e.innerHTML=lr(G.maestros);let t=K.querySelector(`.maestros-header-premium p.text-muted`);t&&(t.textContent=`${G.maestros.length} maestros en total`)}function _r(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function vr(){if(G.maestrosOriginales.length===0){J(`No hay maestros para exportar`,`error`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Instrumento`,`Especialidad`,`Estado`],...G.maestrosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.instrumento||``,e.especialidad||``,e.is_active===!1?`Inactivo`:`Activo`])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`maestros-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),J(`CSV exportado exitosamente`,`success`)}function J(e,t=`info`){let r=K.querySelector(`#toastContainer`);if(!r)return;let i=t===`success`?`bg-success`:t===`error`?`bg-danger`:`bg-info`,a=t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:`bi-info-circle`,o=t===`success`?`Éxito`:t===`error`?`Error`:`Información`,s=document.createElement(`div`);s.className=`toast`,s.setAttribute(`role`,`alert`),s.setAttribute(`aria-live`,`assertive`),s.setAttribute(`aria-atomic`,`true`),s.innerHTML=`
    <div class="toast-header ${i} text-white">
      <i class="bi ${a} me-2"></i>
      <strong class="me-auto">${o}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${H(e)}</div>
  `,r.appendChild(s),new n(s,{autohide:!0,delay:3e3}).show(),s.addEventListener(`hidden.bs.toast`,()=>s.remove())}var yr=e({getAlertasActivas:()=>wr,getAlertasRojas:()=>Tr,getAlumnosDestacados:()=>Nr,getAlumnosEnRiesgoAcademico:()=>Pr,getAlumnosEnRiesgoAlto:()=>Cr,getCorrelacionAsistenciaRendimiento:()=>Lr,getDestacadosYRiesgoAcademico:()=>Mr,getEstadisticasPeriodoActivo:()=>jr,getEstadisticasPeriodos:()=>Ar,getHistorialEstadoAlumno:()=>Rr,getPatronAsistencia:()=>kr,getRachaAusencias:()=>Fr,getRendimientoMaestro:()=>Or,getRendimientoMaestros:()=>Dr,getResumenAlertas:()=>Er,getResumenAlumno:()=>xr,getResumenAlumnos:()=>br,getRiesgoAbandono:()=>Sr,getTasaAsistenciaPeriodo:()=>Ir,registrarCambioEstadoAlumno:()=>zr});async function br(){let{data:e,error:n}=await t.from(`vw_resumen_alumno`).select(`*`).order(`nombre_completo`);if(n)throw Error(`No se pudo cargar el resumen de alumnos`);return e}async function xr(e){let{data:n,error:r}=await t.from(`vw_resumen_alumno`).select(`*`).eq(`id`,e).single();if(r)throw Error(`No se pudo cargar el resumen del alumno`);return n}async function Sr({nivel:e=null}={}){let n=t.from(`vw_riesgo_abandono`).select(`*`).order(`score_riesgo`,{ascending:!1});e&&(n=n.eq(`nivel_riesgo`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis de riesgo`);return r}async function Cr(){return Sr({nivel:`alto`})}async function wr({color:e=null,alumnoId:n=null}={}){let r=t.from(`vw_alertas_activas`).select(`*`).order(`fecha_referencia`,{ascending:!0});e&&(r=r.eq(`color`,e)),n&&(r=r.eq(`alumno_id`,n));let{data:i,error:a}=await r;if(a)throw Error(`No se pudieron cargar las alertas`);return i}async function Tr(){return wr({color:`rojo`})}async function Er(){let{data:e,error:n}=await t.from(`vw_alertas_activas`).select(`color, tipo_alerta`);if(n)throw Error(`No se pudo obtener el resumen de alertas`);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length,porTipo:e.reduce((e,t)=>(e[t.tipo_alerta]=(e[t.tipo_alerta]||0)+1,e),{})}}async function Dr(){let{data:e,error:n}=await t.from(`vw_rendimiento_maestro`).select(`*`);if(n)throw Error(`No se pudo cargar el rendimiento de maestros`);return e}async function Or(e){let{data:n,error:r}=await t.from(`vw_rendimiento_maestro`).select(`*`).eq(`maestro_id`,e).single();if(r)throw Error(`No se pudo cargar el rendimiento del maestro`);return n}async function kr({instrumento:e=null}={}){let n=t.from(`vw_patron_asistencia`).select(`*`).order(`dia_semana_num`);e&&(n=n.eq(`instrumento_principal`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el patrón de asistencia`);return r}async function Ar(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`);if(n)throw Error(`No se pudieron cargar las estadísticas por período`);return e}async function jr(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`).eq(`activo`,!0).order(`fecha_inicio`,{ascending:!1}).limit(1);if(n)throw Error(`No se pudieron cargar las estadísticas del período activo: `+n.message);return e&&e.length>0?e[0]:null}async function Mr({categoria:e=null}={}){let n=t.from(`vw_destacados_y_riesgo_academico`).select(`*`);e&&(n=n.eq(`categoria`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis académico`);return r}async function Nr(){return Mr({categoria:`destacado`})}async function Pr(){return Mr({categoria:`riesgo_academico`})}async function Fr(e){let{data:n,error:r}=await t.rpc(`fn_racha_ausencias`,{p_alumno_id:e});if(r)throw Error(`No se pudo calcular la racha de ausencias`);return n}async function Ir(e,n,r=null){let i={p_alumno_id:e,p_desde:n};r&&(i.p_hasta=r);let{data:a,error:o}=await t.rpc(`fn_tasa_asistencia_periodo`,i);if(o)throw Error(`No se pudo calcular la tasa de asistencia`);return a}async function Lr(){let{data:e,error:n}=await t.rpc(`fn_correlacion_asistencia_rendimiento`);if(n)throw Error(`No se pudo calcular la correlación`);return e}async function Rr(e){let{data:n,error:r}=await t.from(`historial_estado_alumno`).select(`*`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1});if(r)throw Error(`No se pudo cargar el historial`);return n}async function zr(e,n,r,i=null){if(![`activo`,`baja_voluntaria`,`baja_academica`,`suspendido`,`egresado`].includes(n))throw Error(`Estado no válido`);let{data:a,error:o}=await t.from(`historial_estado_alumno`).insert([{alumno_id:e,estado:n,motivo:r?.trim()||null,registrado_por:i||null,fecha:new Date().toISOString().split(`T`)[0]}]).select();if(o)throw Error(`No se pudo registrar el cambio de estado`);return a[0]}async function Y(e){let t={"/assets/data/mocks/alumnos.json":()=>i(()=>import(`./alumnos-DymqG36Y.js`).then(e=>e.n),__vite__mapDeps([4,1])),"/assets/data/mocks/clases.json":()=>i(()=>import(`./clases-Xmh2Auy3.js`).then(e=>e.t),__vite__mapDeps([5,1])),"/assets/data/mocks/sesiones.json":()=>i(()=>import(`./sesiones-BqS1eJ32.js`).then(e=>e.t),__vite__mapDeps([6,1])),"/assets/data/mocks/maestro_tareas.json":()=>i(()=>import(`./maestro_tareas-rcpKQ0HE.js`),[]),"/assets/data/mocks/metricas_periodo.json":()=>i(()=>import(`./metricas_periodo-CCZtLr-R.js`),[]),"/assets/data/mocks/alertas_config.json":()=>i(()=>import(`./alertas_config-BQAnnM1Z.js`),[]),"/assets/data/mocks/objetivos_gamificacion.json":()=>i(()=>import(`./objetivos_gamificacion-EzZMnNH1.js`),[]),"/assets/data/mocks/ausencias.json":()=>i(()=>import(`./ausencias-CA52ddyE.js`),[]),"/assets/data/mocks/planificacion-curricular.json":()=>i(()=>import(`./planificacion-curricular-1ZUj2M41.js`),[])}[e];if(t){let e=await t();return e.default||e}return console.warn(`loadJsonMock: ruta no mapeada: ${e}`),null}var Br=e({getAlertasActivas:()=>Yr,getAlertasConfig:()=>qr,getAlumnosDestacados:()=>ei,getEstadisticasPeriodo:()=>Wr,getEstadisticasPeriodoActivo:()=>Gr,getHistorialEstadoAlumno:()=>Zr,getRachaAusencias:()=>Qr,getResumenAlertas:()=>Xr,getResumenAlumno:()=>Ur,getResumenAlumnos:()=>Hr,getRiesgoAbandono:()=>$r,getTasaAsistenciaPeriodo:()=>Kr,updateAlertaConfig:()=>Jr}),Vr=`/assets/data/mocks/metricas_periodo.json`;async function Hr(){return(await Y(Vr)).estadisticas_periodo[0]?.total_alumnos||0}async function Ur(e){return null}async function Wr(){return(await Y(Vr)).configuraciones}async function Gr(){let e=await Y(Vr),t=e.configuraciones.find(e=>e.activo),n=e.estadisticas_periodo.find(e=>e.periodo_id===t?.id);return t?{...t,...n}:null}async function Kr(e,t,n=null){return 87.5}async function qr(){return await Y(`/assets/data/mocks/alertas_config.json`)}async function Jr(e,t){return console.log(`Mock: updateAlertaConfig`,e,t),{id:e,...t}}async function Yr(e={}){return(await Y(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo)}async function Xr(){let e=(await Y(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length}}async function Zr(e){return[]}async function Qr(e){return 0}async function $r({nivel:e=null}={}){let t=[{nombre_completo:`Mateo Fernández`,score_riesgo:88,nivel_riesgo:`alto`},{nombre_completo:`Lucía Benítez`,score_riesgo:65,nivel_riesgo:`medio`},{nombre_completo:`Santiago Morales`,score_riesgo:35,nivel_riesgo:`bajo`}];return e?t.filter(t=>t.nivel_riesgo===e):t}async function ei(){return[{nombre_completo:`Valeria Russo`,promedio:9.85,programa:`Violín Cátedra`},{nombre_completo:`Thiago Silva`,promedio:9.72,programa:`Violín Inicial`},{nombre_completo:`Delfina Lombardi`,promedio:9.6,programa:`Violín Cátedra`}]}var X=()=>_e.isDemoMode?Br:yr,ti=(...e)=>X().getEstadisticasPeriodoActivo(...e),ni=(...e)=>X().getTasaAsistenciaPeriodo(...e),ri=(...e)=>X().getAlertasActivas(...e),ii=(...e)=>X().getResumenAlertas(...e),ai=(...e)=>X().getRiesgoAbandono(...e),oi=(...e)=>X().getAlumnosDestacados(...e);function si({label:e,value:t,color:n=`primary`,icon:r=`bi-graph-up`}){let i=`bg-${n}`,a=`text-${n}`;return`
    <div class="card border-0 shadow-sm h-100 pm-metric-card">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="metric-icon ${i} bg-opacity-10 ${a} rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="bi ${r}"></i>
          </div>
          <div>
            <div class="text-muted small fw-bold text-uppercase" style="letter-spacing: 0.5px;">${d(e)}</div>
            <div class="h3 mb-0 fw-extrabold ${a}">${t}</div>
          </div>
        </div>
      </div>
    </div>
  `}var Z={activeTab:localStorage.getItem(`pm_metrics_tab`)||`resumen`,stats:null,alertas:[],riesgo:[],cargando:!1,container:null};async function ci(e){if(e)try{Z.container=e,Z.cargando=!0,li(e),Z.stats=await ti(),Z.resumenAlertas=await ii(),Z.cargando=!1,di(e),_i(e)}catch(t){console.error(t),ui(e,t.message)}}function li(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function ui(e,t){e.innerHTML=`<div class="alert alert-danger m-3"><h5>Error analítico</h5><p>${d(t)}</p></div>`}function di(e){e.innerHTML=`
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
          <button class="btn btn-outline-primary ${Z.activeTab===`resumen`?`active`:``}" data-tab="resumen"><i class="bi bi-speedometer2 me-1"></i> Resumen</button>
          <button class="btn btn-outline-primary ${Z.activeTab===`alertas`?`active`:``}" data-tab="alertas"><i class="bi bi-bell me-1"></i> Alertas</button>
          <button class="btn btn-outline-primary ${Z.activeTab===`riesgo`?`active`:``}" data-tab="riesgo"><i class="bi bi-shield-exclamation me-1"></i> Riesgo</button>
          <button class="btn btn-outline-primary ${Z.activeTab===`ia`?`active`:``}" data-tab="ia"><i class="bi bi-robot me-1"></i> IA Analysis</button>
        </div>
      </div>

      <div id="hub-content">
        ${fi()}
      </div>
    </div>
  `}function fi(){switch(Z.activeTab){case`resumen`:return pi();case`alertas`:return mi();case`riesgo`:return hi();case`ia`:return gi();default:return pi()}}function pi(){let e=Z.stats||{},t=Z.resumenAlertas||{total:0,rojas:0};return`
    <div class="row g-3">
      <div class="col-md-6 col-lg-3">
        ${si({label:`Alumnos Activos`,value:e.total_alumnos||0,icon:`bi-people`,color:`primary`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${si({label:`Promedio Global`,value:(e.promedio_general||0).toFixed(2),icon:`bi-star`,color:`success`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${si({label:`Alertas Rojas`,value:t.rojas,icon:`bi-exclamation-octagon`,color:`danger`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${si({label:`Asistencia Hoy`,value:(e.asistencia_hoy_porcentaje||0)+`%`,icon:`bi-check2-circle`,color:`info`})}
      </div>
      
      <div class="col-12 mt-4">
        <h5 class="fw-bold mb-3"><i class="bi bi-trophy me-2 text-warning"></i>Alumnos Destacados</h5>
        <div class="page-glass p-0 overflow-hidden">
          <div id="destacados-placeholder" class="p-4 text-center text-muted">Cargando destacados...</div>
        </div>
      </div>
    </div>
  `}function mi(){return`
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold m-0">Alertas de Seguimiento Académico</h5>
        <span class="badge bg-danger">${Z.resumenAlertas?.rojas||0} Críticas</span>
      </div>
      <div id="alertas-list-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function hi(){return`
    <div class="page-glass p-4">
      <h5 class="fw-bold mb-4">Análisis Proactivo de Riesgo de Abandono</h5>
      <div class="alert alert-info small mb-4">
        <i class="bi bi-info-circle me-1"></i> El puntaje de riesgo se calcula combinando racha de ausencias, promedio académico y participación.
      </div>
      <div id="riesgo-list-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function gi(){return`
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
  `}function _i(e){e.querySelectorAll(`[data-tab]`).forEach(t=>{t.addEventListener(`click`,()=>{Z.activeTab=t.dataset.tab,localStorage.setItem(`pm_metrics_tab`,Z.activeTab),di(e),_i(e),vi()})}),e.querySelector(`#btn-guia-analisis`)?.addEventListener(`click`,()=>{bi()}),vi()}async function vi(){if(Z.activeTab===`resumen`){let e=await oi(),t=Z.container.querySelector(`#destacados-placeholder`);t&&(t.className=``,t.innerHTML=`
        <table class="table table-compact table-hover mb-0">
          <tbody class="small">
            ${e.slice(0,5).map(e=>`
              <tr>
                <td><i class="bi bi-award text-warning me-2"></i><strong>${d(e.nombre_completo)}</strong></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">${e.promedio}</span></td>
                <td class="text-muted">${d(e.programa)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      `)}if(Z.activeTab===`alertas`){let e=await ri(),t=Z.container.querySelector(`#alertas-list-container`);t&&(t.innerHTML=e.length===0?`<p class="text-center text-muted">No hay alertas activas.</p>`:e.map(e=>`
          <div class="alert-item d-flex align-items-center gap-3 p-3 border-bottom">
            <div class="bg-${e.color} rounded-circle" style="width:12px;height:12px;"></div>
            <div class="flex-grow-1">
              <div class="fw-bold small">${d(e.nombre_alumno)}</div>
              <div class="extra-small text-muted">${d(e.descripcion_alerta)}</div>
            </div>
            <div class="text-end small text-muted">${e.fecha_referencia}</div>
          </div>
        `).join(``))}if(Z.activeTab===`riesgo`){let e=await ai(),t=Z.container.querySelector(`#riesgo-list-container`);t&&(t.innerHTML=`
        <table class="table table-compact table-hover">
          <thead><tr><th>Alumno</th><th class="text-center">Score</th><th>Nivel</th></tr></thead>
          <tbody class="small">
            ${e.map(e=>`
              <tr>
                <td>${d(e.nombre_completo)}</td>
                <td class="text-center fw-bold">${e.score_riesgo}</td>
                <td><span class="badge bg-${e.nivel_riesgo===`alto`?`danger`:`warning`}">${e.nivel_riesgo.toUpperCase()}</span></td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      `)}Z.activeTab===`ia`&&yi()}function yi(){Z.container.querySelector(`#btn-run-ia`)?.addEventListener(`click`,async()=>{let e=Z.container.querySelector(`#ia-result-area`);e&&(e.innerHTML=`<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Analizando datos...</p></div>`,setTimeout(()=>{e.innerHTML=`
        <div class="page-glass p-3 border-primary border-start border-4">
          <p class="small mb-2"><strong>Análisis Institucional:</strong></p>
          <p class="extra-small text-secondary">Basado en el rendimiento del período actual, se observa una mejora del 12% en la asistencia del grupo de Cuerdas. Sin embargo, 3 alumnos muestran un patrón de riesgo por inasistencias en la última racha de 15 días.</p>
          <button class="btn btn-xs btn-outline-primary mt-2" id="btn-copy-report">Copiar Reporte</button>
        </div>
      `,Z.container.querySelector(`#btn-copy-report`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.querySelector(`p.text-secondary`).innerText),r.show(`Reporte copiado al portapapeles`,`success`)})},1500))})}function bi(){a.open({title:`Guía de Análisis Académico`,body:`
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
  `,size:`lg`,hideSave:!0,cancelText:`Entendido`,onShow:e=>{let t=e.querySelectorAll(`#guia-modal-tabs button`),n=e.querySelectorAll(`.guia-panel`);t.forEach(r=>{r.addEventListener(`click`,()=>{t.forEach(e=>e.classList.remove(`active`)),r.classList.add(`active`),n.forEach(e=>e.classList.add(`d-none`));let i=e.querySelector(`#pane-${r.dataset.guia}`);i&&i.classList.remove(`d-none`)})})}})}var xi=class{constructor(e,t={}){this.container=e,this.data=t.data||[],this.onSelect=t.onSelect||(()=>{}),this.expandedNodes=new Set,this.selectedNodeId=null,this.icons={block:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,level:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M2 12h20M2 7h20"></path></svg>`,node:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`,indicator:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,expander:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`},this._injectStyles(),this.render(),this._bindEvents()}setData(e){this.data=e,this.render()}render(){this.container.innerHTML=`
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
    `,document.head.appendChild(e)}};async function Si(){let{data:e,error:n}=await t.from(`routes`).select(`*`).order(`name`);if(n)throw console.error(`Error fetching routes:`,n.message),Error(`No se pudieron cargar las rutas`);return e}async function Ci(e){let{data:n,error:r}=await t.from(`route_versions`).select(`*`).eq(`route_id`,e).order(`version_number`,{ascending:!1});if(r)throw console.error(`Error fetching route versions:`,r.message),Error(`No se pudieron cargar las versiones de la ruta`);return n}async function wi(e){if(!e)return[];try{let{data:n,error:r}=await t.from(`blocks`).select(`*`).eq(`route_version_id`,e).order(`order_index`);if(r)throw r;if(!n.length)return[];let i=n.map(e=>e.id),{data:a,error:o}=await t.from(`levels`).select(`*`).in(`block_id`,i).order(`order_index`);if(o)throw o;let s=a.map(e=>e.id),{data:c,error:l}=await t.from(`nodes`).select(`*`).in(`level_id`,s).order(`order_index`).limit(5e3);if(l)throw l;let u=c.map(e=>e.id),{data:d,error:f}=await t.from(`indicators`).select(`*`).in(`node_id`,u).order(`order_index`).limit(1e4);if(f)throw f;return n.map(e=>({...e,type:`block`,children:a.filter(t=>t.block_id===e.id).map(e=>({...e,type:`level`,children:c.filter(t=>t.level_id===e.id).map(e=>({...e,type:`node`,children:d.filter(t=>t.node_id===e.id).map(e=>({...e,type:`indicator`}))}))}))}))}catch(e){throw console.error(`Error building academic tree:`,e.message),Error(`Error al construir el árbol académico`)}}async function Ti(e){let{data:n,error:r}=await t.from(`node_resources`).select(`*`).eq(`node_id`,e).order(`order_index`);if(r)throw r;return n}async function Ei(e){let{id:n,...r}=e;if(n){let{data:e,error:i}=await t.from(`node_resources`).update(r).eq(`id`,n).select().single();if(i)throw i;return e}else{let{data:e,error:n}=await t.from(`node_resources`).insert([r]).select().single();if(n)throw n;return e}}async function Di(e){let{error:n}=await t.from(`node_resources`).delete().eq(`id`,e);if(n)throw n;return!0}async function Oi(e,n){let{data:r,error:i}=await t.from(`nodes`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}var ki=class{constructor(e,t={}){this.container=e,this.node=null,this.resources=[],this.onUpdate=t.onUpdate||(()=>{}),this._injectStyles(),this.renderEmpty()}async setNode(e){if(!e){this.node=null,this.resources=[],this.renderEmpty();return}this.node=e,this.renderLoading();try{this.resources=await Ti(e.id),this.render()}catch(e){console.error(`Error loading resources:`,e),this.renderError(`No se pudieron cargar los recursos del nodo.`)}}renderEmpty(){this.container.innerHTML=`
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
    `}_bindEvents(){this.container.querySelector(`#save-node-metadata`)?.addEventListener(`click`,async()=>{let e=this.container.querySelector(`#node-name`).value,t=this.container.querySelector(`#node-critical`)?.checked,n=this.container.querySelector(`#save-node-metadata`);n.disabled=!0,n.textContent=`Guardando...`;try{let n={name:e};this.node.type===`node`&&(n.is_critical=t),this.node.type===`indicator`&&(n.description=e),await Oi(this.node.id,n),Object.assign(this.node,n),this.onUpdate(this.node),this.render()}catch(e){alert(`Error al guardar: `+e.message)}finally{n.disabled=!1,n.textContent=`Guardar Cambios`}}),this.container.querySelector(`#add-resource-btn`)?.addEventListener(`click`,()=>{this._showResourceModal()}),this.container.querySelectorAll(`.edit-res`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.resource-card`).dataset.id,n=this.resources.find(e=>e.id===t);this._showResourceModal(n)})}),this.container.querySelectorAll(`.delete-res`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`.resource-card`).dataset.id;if(confirm(`¿Estás seguro de que deseas eliminar este recurso?`))try{await Di(t),this.resources=this.resources.filter(e=>e.id!==t),this.render()}catch(e){alert(`Error al eliminar: `+e.message)}})})}_showResourceModal(e=null){let t=!!e,n=`resourceModal`,r=document.getElementById(n);r&&r.remove(),r=document.createElement(`div`),r.id=n,r.className=`modal fade apple-modal`,r.tabIndex=-1,r.innerHTML=`
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
    `,document.body.appendChild(r);let i=new bootstrap.Modal(r);i.show(),r.querySelectorAll(`.type-option`).forEach(e=>{e.addEventListener(`click`,()=>{r.querySelectorAll(`.type-option`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`)})}),r.querySelector(`#save-resource-confirm-btn`).addEventListener(`click`,async()=>{let n=r.querySelector(`#resource-form`),a=new FormData(n),o={node_id:this.node.id,resource_type:a.get(`resource_type`),title:a.get(`title`),url:a.get(`url`),content:a.get(`content`),order_index:e?.order_index||this.resources.length};if(t&&(o.id=e.id),!o.title){alert(`El título es obligatorio`);return}try{let e=await Ei(o);if(t){let t=this.resources.findIndex(t=>t.id===e.id);this.resources[t]=e}else this.resources.push(e);this.render(),i.hide()}catch(e){alert(`Error al guardar recurso: `+e.message)}})}_injectStyles(){if(document.getElementById(`resource-editor-styles`))return;let e=document.createElement(`style`);e.id=`resource-editor-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}};async function Ai(e){ji(),e.innerHTML=`
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
  `;let t=e.querySelector(`#tree-container`),n=e.querySelector(`#detail-container`),r=e.querySelector(`#route-selector`),i=e.querySelector(`#version-selector`),a=new ki(n,{onUpdate:e=>{console.log(`Node updated:`,e)}}),o=new xi(t,{onSelect:e=>{a.setNode(e)}});try{(await Si()).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,r.appendChild(t)})}catch(e){console.error(`Error loading routes:`,e)}r.addEventListener(`change`,async()=>{let e=r.value;if(i.innerHTML=`<option value="">Versión...</option>`,i.disabled=!0,t.innerHTML=`<div class="tree-placeholder"><p>Cargando versiones...</p></div>`,!e){t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una ruta para comenzar.</p></div>`;return}try{(await Ci(e)).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`V${e.version_number} - ${new Date(e.created_at).toLocaleDateString()}`,i.appendChild(t)}),i.disabled=!1,t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una versión.</p></div>`}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar versiones.</p></div>`}}),i.addEventListener(`change`,async()=>{let e=i.value;if(e){t.innerHTML=`
      <div class="tree-loading">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Construyendo mapa curricular...</span>
      </div>
    `;try{let t=await wi(e);o.setData(t)}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar el árbol curricular.</p></div>`}}})}function ji(){if(document.getElementById(`academic-admin-layout-styles`))return;let e=document.createElement(`style`);e.id=`academic-admin-layout-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}var Q={clases:[],clasesOriginales:[],maestros:[],salones:[],programas:[],alumnos:[],cargando:!1,filtroEstado:`todos`,filtroInstrumento:``,vista:`tabla`,container:null,mostrarDiasVacios:!0};async function $(e){if(e)try{Q.container=e,Q.cargando=!0,Mi(e);let[n,r,i,a,o]=await Promise.all([h(),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]);Q.clases=n,Q.clasesOriginales=[...n],Q.maestros=r.data||[],Q.salones=i.data||[],Q.programas=a.data||[],Q.alumnos=o.data||[],Q.cargando=!1,Pi(e),Bi(e)}catch(t){console.error(t),Ni(e,t.message)}}function Mi(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `}function Ni(e,t){e.innerHTML=`
    <div class="container mt-5 text-center">
      <div class="alert alert-danger d-inline-block" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${d(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>$(e))}function Pi(e){e.innerHTML=`
    <div class="page-container">
      <div class="clases-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-book fs-4"></i>
          </div>
          <div>
            <h1 class="clases-title-premium mb-0">Clases</h1>
            <p class="text-muted small mb-0">${Q.clases.length} clases en total</p>
          </div>
        </div>
        
        <div class="clases-header-actions">
          <button class="btn-help-trigger" id="btn-help-clases" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <div class="view-segmented-control">
            <button class="view-segment-btn ${Q.vista===`tabla`?`active`:``}" id="btn-vista-tabla" title="Vista de lista">
              <i class="bi bi-list-ul"></i>
            </button>
            <button class="view-segment-btn ${Q.vista===`calendario`?`active`:``}" id="btn-vista-calendario" title="Vista de agenda">
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
        ${Q.vista===`tabla`?Fi():Ri()}
      </div>
    </div>
  `}function Fi(){return Q.clases.length===0?Li():`
    <div class="page-glass rounded w-100">
      <div class="list-group list-group-flush w-100" id="clasesListBody">
        ${Q.clases.map(e=>Ii(e)).join(``)}
      </div>
    </div>
  `}function Ii(e){let t=e.nombre||`Sin nombre`,n=Q.maestros.find(t=>t.id===e.maestro_principal_id),r=n?n.nombre_completo||n.nombre:`Sin maestro`,i=f(t),a=e.estado||`activa`,o=`border-accent-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,s=`bg-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,c=(e.horarios||[]).slice(0,3),l=c.length>0?c.map(e=>`${(e.dia||``).slice(0,2).toUpperCase()} ${(e.hora_inicio||``).slice(0,5)}`).join(` • `):`Sin horarios`;return`
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
          <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${d(t)}</span>
          <small class="text-muted text-truncate">${d(r)} • ${d(e.instrumento||`-`)}</small>
          <small class="text-muted extra-small mt-1" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i>${d(l)}</small>
        </div>
      </div>
      <div class="flex-shrink-0 text-muted ms-2 pe-1">
        <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
      </div>
    </div>
  `}function Li(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No se encontraron clases.</p>
    </div>
  `}function Ri(){if(Q.clases.length===0)return Li();let e=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`],t={lunes:`Lunes`,martes:`Martes`,miércoles:`Miércoles`,jueves:`Jueves`,viernes:`Viernes`,sábado:`Sábado`},n={lunes:[],martes:[],miércoles:[],jueves:[],viernes:[],sábado:[]};Q.clases.forEach(e=>{(e.horarios||[]).forEach(t=>{let r=(t.dia||``).toLowerCase().trim();n[r]&&n[r].push({...t,clase:e})})}),Object.keys(n).forEach(e=>{n[e].sort((e,t)=>ie(e.hora_inicio)-ie(t.hora_inicio))});let r=Q.mostrarDiasVacios?``:`hide-empty-days`;return`
    <div class="weekly-schedule-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 px-1 weekly-schedule-toolbar">
        <span class="small text-muted fw-semibold"><i class="bi bi-calendar-week me-1"></i>Agenda Semanal</span>
        <div class="form-check form-switch m-0 d-flex align-items-center gap-2">
          <input class="form-check-input cursor-pointer" type="checkbox" role="switch" id="toggle-empty-days" ${Q.mostrarDiasVacios?`checked`:``}>
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
                ${r.length>0?r.map(e=>{let t=e.clase,n=t.estado||`activa`,r=ne(e.hora_inicio),i=ne(e.hora_fin),a=Q.salones.find(t=>t.id===e.salon_id),o=a?a.nombre:`Online/Otro`;return`
                    <div class="time-block-card p-2 rounded mb-2 border-start-accent ${`border-accent-${n===`activa`?`success`:n===`suspendida`?`warning`:`secondary`}`}" data-id="${t.id}" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="time-range small fw-bold text-primary"><i class="bi bi-clock me-1"></i>${r} - ${i}</span>
                        <i class="bi ${s(t.instrumento)} text-muted" style="font-size: 0.85rem;"></i>
                      </div>
                      <div class="fw-semibold text-truncate small class-name" style="font-size: 0.9rem;">${d(t.nombre)}</div>
                      <div class="d-flex justify-content-between align-items-center mt-1 extra-small text-muted">
                        <span class="text-truncate" style="max-width: 60%;"><i class="bi bi-person me-0.5"></i>${d(Q.maestros.find(e=>e.id===t.maestro_principal_id)?.nombre_completo||`Sin maestro`)}</span>
                        <span class="badge bg-body-secondary text-body-secondary-custom px-1.5 py-0.5 rounded" style="font-size: 0.7rem;"><i class="bi bi-geo-alt me-0.5"></i>${d(o)}</span>
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
  `}async function zi(e){if(e){a.open({title:`Cargando...`,hideSave:!0,size:`md`,body:`
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando perfil de la clase...</p>
      </div>
    `});try{let t=await l(e.id),n=t.length,r=Q.maestros.find(t=>t.id===e.maestro_principal_id),i=r?r.nombre_completo||r.nombre:`Sin maestro`,o=e.tiene_suplente||e.maestro_suplente_id?Q.maestros.find(t=>t.id===e.maestro_suplente_id):null,c=o?o.nombre_completo||o.nombre:null,u=Q.programas.find(t=>t.id===e.programa_id),m=u?u.nombre:`Sin programa`,h=``;h=e.horarios&&e.horarios.length>0?e.horarios.map(e=>{let t=e.dia.charAt(0).toUpperCase()+e.dia.slice(1),n=Q.salones.find(t=>t.id===e.salon_id),r=n?n.nombre:`Online/Otro`;return`
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-secondary-subtle text-secondary-custom py-1" style="font-size: 0.75rem; min-width: 60px;">${t}</span>
            <span class="small fw-semibold">${ne(e.hora_inicio)} - ${ne(e.hora_fin)}</span>
            <span class="small text-muted">• <i class="bi bi-geo-alt me-0.5"></i>${d(r)}</span>
          </div>
        `}).join(``):`<div class="text-muted small">Sin horarios asignados</div>`;let g=``;g=t&&t.length>0?`
        <div class="list-group list-group-flush border-top">
          ${t.map(e=>{let t=e.alumno;if(!t)return``;let n=f(t.nombre_completo||t.nombre||`?`);return`
              <div class="list-group-item d-flex align-items-center gap-3 py-2 px-3 border-bottom-0 bg-transparent">
                <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle" style="width: 32px; height: 32px; font-size: 0.85rem; background-color: ${ee(t.id)}; font-weight:600;">
                  ${n}
                </div>
                <div class="d-flex flex-column overflow-hidden">
                  <span class="fw-semibold text-truncate small" style="font-size: 0.9rem; color: var(--bs-body-color);">${d(t.nombre_completo||t.nombre)}</span>
                  <small class="text-muted extra-small">${d(t.instrumento_principal||`Sin instrumento`)}</small>
                </div>
              </div>
            `}).join(``)}
        </div>
      `:`
        <div class="text-muted text-center py-4 small bg-body-tertiary rounded">
          <i class="bi bi-people d-block mb-1 opacity-50" style="font-size: 1.25rem;"></i>
          No hay alumnos inscritos en esta clase
        </div>
      `;let te=e.capacidad_maxima||20,_=Math.min(100,Math.round(n/te*100)),v=`bg-success`;_>=90?v=`bg-danger`:_>=70&&(v=`bg-warning`);let re=`
      <div class="class-profile-container">
        <!-- Profile Header / Hero Card -->
        <div class="class-hero-card d-flex align-items-center gap-3 p-3 rounded mb-4" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
          <div class="position-relative">
            <div class="avatar-large bg-primary bg-opacity-15 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 56px; height: 56px; font-size: 1.5rem; font-weight: 700;">
              <i class="bi ${s(e.instrumento)}"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 p-1.5 bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="overflow-hidden">
            <h4 class="mb-1 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${d(e.nombre)}</h4>
            <span class="badge rounded-pill bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} text-capitalize" style="font-size: 0.75rem;">${p(e.estado)}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-person-badge me-1"></i>Maestro Principal</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${d(i)}</span>
              ${c?`<small class="text-muted d-block extra-small mt-1"><i class="bi bi-person me-0.5"></i>Suplente: ${d(c)}</small>`:``}
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-music-note me-1"></i>Instrumento</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${d(e.instrumento||`Sin asignar`)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-collection me-1"></i>Programa</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${d(m)}</span>
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
            <div class="progress-bar ${v} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${_}%" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${te}"></div>
          </div>
        </div>

        <!-- Description / Pedagogical Notes -->
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Notas Pedagógicas</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${d(e.descripcion||`Sin notas pedagógicas registradas.`)}</p>
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
    `;a.open({title:`Perfil de Clase: ${e.nombre}`,hideSave:!0,size:`md`,body:re,onShow:t=>{let n=t.closest(`.app-modal-dialog`)?.querySelector(`.app-modal-footer`);n&&n.style.setProperty(`display`,`none`,`important`),t.querySelector(`.btn-profile-edit`)?.addEventListener(`click`,()=>{a.close(),setTimeout(()=>{In(e,{maestros:Q.maestros,salones:Q.salones,programas:Q.programas,alumnos:Q.alumnos,onSuccess:()=>$(Q.container)})},250)}),t.querySelector(`.btn-profile-delete`)?.addEventListener(`click`,()=>{a.close(),setTimeout(()=>{Hi(e.id)},250)}),t.querySelector(`.btn-profile-close`)?.addEventListener(`click`,()=>{a.close()})}})}catch(e){console.error(e),r.error(`Error al cargar la información detallada de la clase`),a.close()}}}function Bi(e){e.querySelector(`#btn-help-clases`)?.addEventListener(`click`,()=>{W.open({title:`Clases`,intro:`Gestión completa de clases: creación, horarios, asignación de maestros, inscripción de alumnos y control de capacidad.`,sections:[{icon:`bi-easel2`,title:`Lista de clases`,description:`Todas las clases del sistema. Filtrá por instrumento, nivel y estado. Las activas aparecen primero.`,color:`#3b82f6`},{icon:`bi-clock`,title:`Horarios`,description:`Cada clase puede tener múltiples horarios semanales. El sistema detecta conflictos de salón y de maestro automáticamente.`,color:`#6366f1`},{icon:`bi-people`,title:`Inscripción de alumnos`,description:`"Grupal": todos comparten el horario. "Rotativa (Turnos)": cada alumno tiene su propio horario individual dentro de la clase.`,color:`#10b981`},{icon:`bi-bar-chart`,title:`Capacidad`,description:`Barra de ocupación: inscriptos vs capacidad máxima. Rojo cuando supera el 90%.`,color:`#f59e0b`},{icon:`bi-person-workspace`,title:`Maestro titular y suplente`,description:`Cada clase tiene un maestro principal (obligatorio) y puede tener suplente (opcional). Ambos aparecen en el perfil del maestro.`,color:`#6b7280`}]})}),e.querySelector(`#btnAgregarClase`)?.addEventListener(`click`,()=>{In(null,{maestros:Q.maestros,salones:Q.salones,programas:Q.programas,alumnos:Q.alumnos,onSuccess:()=>$(e)})}),e.querySelector(`#btn-vista-tabla`)?.addEventListener(`click`,()=>{Q.vista=`tabla`,Pi(e),Bi(e)}),e.querySelector(`#btn-vista-calendario`)?.addEventListener(`click`,()=>{Q.vista=`calendario`,Pi(e),Bi(e)}),e.querySelector(`#buscar`)?.addEventListener(`input`,Vi),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,Vi);let t=e.querySelector(`#view-content`);t?.addEventListener(`change`,t=>{if(t.target&&t.target.id===`toggle-empty-days`){Q.mostrarDiasVacios=t.target.checked;let n=e.querySelector(`.weekly-schedule-grid`);n&&(Q.mostrarDiasVacios?n.classList.remove(`hide-empty-days`):n.classList.add(`hide-empty-days`))}}),t?.addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id], .time-block-card[data-id]`);if(t){let e=t.dataset.id,n=Q.clasesOriginales.find(t=>t.id===e);n&&zi(n)}})}function Vi(){let e=Q.container.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=Q.container.querySelector(`#filtroEstado`)?.value||`todos`;Q.clases=Q.clasesOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||n.instrumento.toLowerCase().includes(e),i=t===`todos`||n.estado===t;return r&&i});let n=Q.container.querySelector(`#view-content`);n&&(n.innerHTML=Q.vista===`tabla`?Fi():Ri())}function Hi(e){let t=Q.clasesOriginales.find(t=>t.id===e);t&&a.open({title:`⚠️ Eliminar Clase`,saveText:`Eliminar Definitivamente`,body:`<p>¿Estás seguro de eliminar la clase <strong>${d(t.nombre)}</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await te(e),r.success(`Clase eliminada`),$(Q.container),!0}catch(e){return r.error(e.message),!1}}})}export{nt as A,Ue as B,pt as C,dt as D,ht as E,tt as F,ge as G,Je as H,et as I,ae as J,se as K,it as L,at as M,ut as N,lt as O,st as P,Qe as R,gt as S,mt as T,qe as U,He as V,_e as W,Tt as _,ti as a,xt as b,nr as c,Lt as d,j as f,Ct as g,Et as h,ri as i,ct as j,ot as k,W as l,yt as m,Ai as n,ii as o,kt as p,S as q,ci as r,ni as s,$ as t,dn as u,wt as v,ft as w,Dt as x,Ot as y,We as z};