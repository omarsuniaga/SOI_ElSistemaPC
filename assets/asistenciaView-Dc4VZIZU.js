const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/academicService-dKTfSUQ8.js","assets/rolldown-runtime-DlOssbPu.js","assets/preload-helper-lqsI3teB.js","assets/supabase-KnARm58N.js","assets/LevelCompletionModal-D4S5ncv_.js","assets/portalUtils-DbrsCFDo.js","assets/AchievementsSummaryModal-tKnFb9f5.js"])))=>i.map(i=>d[i]);
import{i as e}from"./supabase-KnARm58N.js";import{i as t}from"./maestroAuth-lT-ZcZZd.js";import{c as n,i as r,n as i,o as a,r as o}from"./maestroDataService-BGjCE976.js";import{t as s}from"./idb-DphCmdhj.js";import{r as c,t as l}from"./offlineQueue-C8tVR5V3.js";import{l as u,n as d}from"./notificationService-CNqqkcMX.js";import{t as f}from"./AppToast-Bli1nFQQ.js";import{t as p}from"./focusTrap-_L6o1rch.js";import{a as m,i as h,l as g,o as _,s as v}from"./portalUtils-DbrsCFDo.js";import{t as y}from"./a11yUtils-DoZA0IX7.js";import{c as b,i as x,l as S,o as C,s as w,t as T}from"./groqService-DqCFHp7y.js";import{t as E}from"./preload-helper-lqsI3teB.js";import{t as D}from"./AppModal-Fjeb_yOo.js";import{C as O,a as k,n as A,t as j}from"./observacion.model-BCtZv8mL.js";import{n as ee}from"./planificacionAdapter-YQ-GJwgP.js";import{t as M}from"./academicService-dKTfSUQ8.js";import{generateDailyReport as N,generateMonthlyAttendance as te,generateMonthlyPedagogical as ne}from"./reportService-UN38zrj6.js";import{a as P,i as F,o as I,s as re,t as ie}from"./rutaTopicStore-BYhY7krO.js";function ae(e={}){let{showSyncButton:t=!0}=e,n=document.createElement(`div`);n.className=`pm-sync-badge`,n.style.cssText=`
    display: none;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    cursor: default;
    transition: all 0.2s ease;
    white-space: nowrap;
  `;let r=document.createElement(`span`);r.textContent=`☁️`,r.style.fontSize=`12px`;let i=document.createElement(`span`);i.textContent=``;let a=document.createElement(`button`);t&&(a.textContent=`Sincronizar`,a.style.cssText=`
      background: transparent;
      border: none;
      color: inherit;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 8px;
      text-decoration: underline;
      text-underline-offset: 2px;
    `,a.addEventListener(`click`,async e=>{e.stopPropagation(),a.disabled=!0,window.dispatchEvent(new Event(`online`)),await o(),a.disabled=!1})),n.appendChild(r),n.appendChild(i),t&&n.appendChild(a);async function o(){let e=await c();if(e===0){n.style.display=`none`;return}n.style.display=`inline-flex`,n.style.background=`#fef3c7`,n.style.color=`#92400e`,n.style.border=`1px solid #fde68a`,r.textContent=`☁️`,i.textContent=`${e} pendiente${e===1?``:`s`}`,a&&(a.style.display=navigator.onLine?``:`none`)}function s(){setTimeout(o,2e3)}function l(){o()}return window.addEventListener(`online`,s),window.addEventListener(`offline`,l),o(),{el:n,destroy:()=>{window.removeEventListener(`online`,s),window.removeEventListener(`offline`,l),n.remove()},refresh:o}}function oe(e,{indicator:t,sessionId:n,studentId:r,teacherId:i,onSave:a}){let o=t.status||`pending`;M.getStatusToken(o);let s=document.createElement(`div`);s.className=`pm-node-eval-card pm-animate-fade-in status-${o}`,s.dataset.indicatorId=t.indicator_id,s.innerHTML=`
    <div class="pm-eval-card-header">
      <div class="pm-eval-node-info">
        <span class="pm-eval-node-name">${h(t.node_name)}</span>
        <p class="pm-eval-indicator-desc">${h(t.indicator_description||`Evaluación de nodo`)}</p>
      </div>
      ${t.is_critical?`<span class="pm-badge-critical" title="Nodo Crítico"><i class="bi bi-exclamation-octagon"></i></span>`:``}
    </div>

    <div class="pm-eval-status-selector">
      <button class="pm-eval-btn btn-approved ${o===`approved`?`active`:``}" data-status="approved">
        <i class="bi bi-check-lg"></i> Logrado
      </button>
      <button class="pm-eval-btn btn-in-process ${o===`in_process`?`active`:``}" data-status="in_process">
        <i class="bi bi-arrow-repeat"></i> En Proceso
      </button>
      <button class="pm-eval-btn btn-failed ${o===`failed`?`active`:``}" data-status="failed">
        <i class="bi bi-x-lg"></i> No Logrado
      </button>
    </div>

    <div class="pm-eval-feedback-area">
      <textarea placeholder="Feedback pedagógico (opcional)..." class="pm-eval-feedback-input">${h(t.feedback||``)}</textarea>
    </div>

    <div class="pm-eval-card-footer">
      <span class="pm-eval-save-status"></span>
    </div>
  `;let c=s.querySelectorAll(`.pm-eval-btn`),l=s.querySelector(`.pm-eval-feedback-input`),u=s.querySelector(`.pm-eval-save-status`),d=null,f=async(e=null)=>{let c=e||s.dataset.status||o;u.innerHTML=`<i class="pm-spinner-sm"></i> Guardando...`;try{let e={student_id:r,indicator_id:t.indicator_id,session_id:n,created_by:i,status:c,feedback:l.value,attempt_number:(t.attempt_number||0)+1};await M.saveIndicatorAttempt(e),u.innerHTML=`<i class="bi bi-check-all"></i> Guardado localmente`,s.className=`pm-node-eval-card status-${c}`,a&&a(e)}catch(e){console.error(`Error saving evaluation:`,e),u.innerHTML=`<i class="bi bi-exclamation-circle"></i> Error al guardar`}};c.forEach(e=>{e.onclick=()=>{let t=e.dataset.status;c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),s.dataset.status=t,f(t)}}),l.oninput=()=>{d&&clearTimeout(d),d=setTimeout(()=>f(),1500)},e.appendChild(s)}function se(e,{student:t,sessionId:n,teacherId:r,snapshots:i=[]}){let a=document.getElementById(`pm-evaluation-drawer`);a&&a.remove();let o=document.createElement(`div`);o.id=`pm-evaluation-drawer`,o.className=`pm-drawer-overlay`,o.innerHTML=`
    <div class="pm-drawer">
      <div class="pm-drawer-header">
        <div class="pm-drawer-title-group">
          <h4 class="pm-drawer-title">Evaluar Avance</h4>
          <p class="pm-drawer-subtitle" style="font-size: 0.85rem; color: var(--pm-text-muted); margin: 0;">${h(t.nombre_completo)}</p>
        </div>
        <button class="pm-drawer-close" id="pm-close-eval-drawer">&times;</button>
      </div>
      
      <div class="pm-drawer-body pm-scroll-y">
        ${i.length===0?`
          <div class="pm-empty-state" style="text-align:center; padding: 2rem; color: var(--pm-text-muted);">
            <i class="bi bi-journal-check" style="font-size: 2.5rem; display: block; margin-bottom: 1rem;"></i>
            <p>No hay objetivos planificados para esta sesión.</p>
          </div>
        `:`
          <div id="pm-evaluation-cards-container" class="pm-eval-list"></div>
        `}
      </div>
      
      <div class="pm-drawer-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border);">
        <button class="pm-btn pm-btn-primary pm-btn-block" id="pm-finish-eval" style="width:100%">Listo</button>
      </div>
    </div>
  `,e.appendChild(o);let s=o.querySelector(`#pm-evaluation-cards-container`);s&&i.forEach(e=>{oe(s,{indicator:e,sessionId:n,studentId:t.id,teacherId:r,onSave:e=>{console.log(`Progress saved:`,e)}})}),setTimeout(()=>o.classList.add(`open`),10);let c=()=>{o.classList.remove(`open`),setTimeout(()=>o.remove(),400)},l=o.querySelector(`#pm-close-eval-drawer`),u=o.querySelector(`#pm-finish-eval`);return l&&l.addEventListener(`click`,c),o.addEventListener(`click`,e=>{e.target===o&&c()}),u&&u.addEventListener(`click`,c),{close:c}}function ce(e,{onAceptar:t}){let n=document.getElementById(`pm-generar-informe-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-generar-informe-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
      <div class="pm-modal-content pm-generar-informe-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">
            📋 Generar Informe
          </h3>
          <button class="pm-modal-close" id="pm-informe-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-generar-informe-body">
          <p style="font-size:0.85rem;color:var(--pm-text-muted);margin:0 0 1rem;">
            Este informe es para compartir con padres o tutores. No se registra como evaluación.
          </p>
          <div id="pm-informe-original-panel" style="display:none; margin-bottom:1rem;">
            <h4 style="margin:0 0 0.5rem;font-size:0.8rem;color:var(--pm-text-muted);">Tu registro original</h4>
            <div id="pm-informe-original" class="pm-informe-text" style="background:var(--pm-surface-2);border:1px solid var(--pm-border);border-radius:var(--pm-radius-sm);padding:0.75rem;font-size:0.85rem;color:var(--pm-text-muted);white-space:pre-wrap;max-height:120px;overflow-y:auto;"></div>
          </div>
          <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--pm-text);font-weight:600;">Informe generado</h4>
          <div id="pm-informe-texto" class="pm-informe-text" contenteditable="true"
            style="background:var(--pm-surface);border:1.5px solid var(--pm-primary);border-radius:var(--pm-radius-sm);padding:0.75rem;min-height:180px;max-height:300px;overflow-y:auto;color:var(--pm-text);font-size:0.9rem;line-height:1.6;white-space:pre-wrap;"></div>

          <div class="pm-informe-acciones">
            <button class="pm-btn pm-btn-share" id="btn-informe-copy" title="Copiar al portapapeles">
              <span>📋</span> Copiar
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-whatsapp" title="Compartir por WhatsApp">
              <span>💬</span> WhatsApp
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-email" title="Enviar por email">
              <span>✉️</span> Email
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-pdf" title="Exportar a PDF">
              <span>📄</span> PDF
            </button>
          </div>

          <div style="display:flex;gap:0.75rem;margin-top:1.25rem;">
            <button class="pm-btn" id="pm-informe-descartar" style="flex:1;background:var(--pm-surface);border:1px solid var(--pm-border);">Cerrar</button>
            <button class="pm-btn pm-btn-primary" id="pm-informe-aceptar" style="flex:1;">Usar en el editor</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-generar-informe-styles`))){let e=document.createElement(`style`);e.id=`pm-generar-informe-styles`,e.textContent=`
        .pm-generar-informe-content {
          max-width: 640px;
          width: 95vw;
        }
        .pm-generar-informe-body {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .pm-informe-text {
          font-size: 0.9rem;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }
        .pm-informe-acciones {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }
        .pm-btn-share {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          color: var(--pm-text);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          flex: 1;
          justify-content: center;
        }
        .pm-btn-share:hover {
          background: var(--pm-primary);
          color: #fff;
          border-color: var(--pm-primary);
        }
        .pm-btn-share span { font-size: 0.95rem; }
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-informe-original`),i=n.querySelector(`#pm-informe-original-panel`),a=n.querySelector(`#pm-informe-texto`);function o(){return a.textContent.trim()}async function s(){try{await navigator.clipboard.writeText(o());let e=n.querySelector(`#btn-informe-copy`),t=e.textContent;e.textContent=`✓ Copiado`,setTimeout(()=>{e.textContent=t},2e3)}catch{alert(`No se pudo copiar al portapapeles.`)}}function c(){let e=encodeURIComponent(o());window.open(`https://wa.me/?text=${e}`,`_blank`)}function l(){let e=encodeURIComponent(o());window.open(`mailto:?subject=Informe de clase&body=${e}`,`_blank`)}function u(){let e=o(),t=window.open(``,`_blank`);t.document.write(`
      <html><head><title>Informe de Clase</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 700px; margin: auto; line-height: 1.6; color: #333; }
        h2 { color: #007aff; border-bottom: 2px solid #007aff; padding-bottom: 0.5rem; }
        p { white-space: pre-wrap; }
        @media print { body { padding: 1rem; } }
      </style></head>
      <body>
        <h2>📋 Informe de Clase</h2>
        <p>${e}</p>
        <script>window.print();<\/script>
      </body></html>
    `),t.document.close()}n.querySelector(`#btn-informe-copy`).onclick=s,n.querySelector(`#btn-informe-whatsapp`).onclick=c,n.querySelector(`#btn-informe-email`).onclick=l,n.querySelector(`#btn-informe-pdf`).onclick=u;function d({original:e,improved:t}){r.textContent=e,a.textContent=t,i&&(i.style.display=e?``:`none`),n.classList.add(`open`)}function f(){n.classList.remove(`open`)}return n.querySelector(`#pm-informe-close`).onclick=f,n.querySelector(`#pm-informe-descartar`).onclick=f,n.querySelector(`#pm-informe-aceptar`).onclick=()=>{t&&t(o()),f()},{open:d,close:f}}function le(e,{onAccept:t}){let n=document.getElementById(`pm-structure-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-structure-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
      <div class="pm-modal-content pm-structure-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">🚀 Estructurar con IA</h3>
          <button class="pm-modal-close" id="pm-structure-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-structure-body">
          <div class="pm-structure-panels">
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Original</h4>
              <div id="pm-structure-original" class="pm-structure-text" style="background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Estructura DSL</h4>
              <div id="pm-structure-dsl" class="pm-structure-text" contenteditable="true" style="background: var(--pm-surface); border: 1.5px solid var(--pm-primary); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9rem;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="pm-btn" id="pm-structure-reject" style="flex: 1; background: var(--pm-surface); border: 1px solid var(--pm-border);">Descartar</button>
            <button class="pm-btn pm-btn-primary" id="pm-structure-accept" style="flex: 1;">Insertar</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-structure-modal-styles`))){let e=document.createElement(`style`);e.id=`pm-structure-modal-styles`,e.textContent=`
        .pm-structure-content {
          max-width: 900px;
          width: 90vw;
        }

        .pm-structure-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pm-structure-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .pm-structure-panel {
          display: flex;
          flex-direction: column;
        }

        .pm-structure-text {
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }

        @media (max-width: 768px) {
          .pm-structure-panels {
            grid-template-columns: 1fr;
          }
        }
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-structure-original`),i=n.querySelector(`#pm-structure-dsl`);function a({original:e,dsl:t}){r.textContent=e,i.textContent=t,n.classList.add(`open`)}function o(){n.classList.remove(`open`)}return n.querySelector(`#pm-structure-close`).onclick=o,n.querySelector(`#pm-structure-reject`).onclick=o,n.querySelector(`#pm-structure-accept`).onclick=()=>{t&&t(i.textContent),o()},{open:a,close:o}}var L=`pm_tour_completed`,ue=1500,de=[{target:`.pm-asist-header`,title:`📍 Cabecera de Clase`,body:`Aquí puede ver los datos de la clase, el salón y la fecha. Es su panel de control principal.`},{target:`.pm-asist-bulk-circles`,title:`👥 Asistencia Rápida`,body:`¿Asistieron todos? Presione "P" para marcar a todos los alumnos como presentes en un solo clic.`},{target:`#pm-alumnos-list`,title:`🙋‍♂️ Lista de Alumnos`,body:`Presione el círculo de cada alumno para cambiar entre Presente, Ausente o Retraso.`},{target:`#pm-planificacion-card`,title:`🗺️ Planificación Académica`,body:`Seleccione una Ruta o busque en la Biblioteca. Los temas que ya impartió aparecerán con un check ✅ verde.`},{target:`#pm-dsl-toolbar-container`,title:`🛠️ Caja de Herramientas`,body:`Use el micrófono 🎤 para dictar la clase, o el botón de IA ✨ para mejorar y profesionalizar su redacción automáticamente.`},{target:`#pm-dsl-editor-container`,title:`✍️ Escritura Inteligente (DSL)`,body:`Use [Corchetes] para vincular temas de la planificación y asteriscos * para puntos clave. La IA le ayudará a darle formato profesional.`},{target:`#btn-guardar`,title:`💾 Guardar Sesión`,body:`Al finalizar, no olvide guardar su sesión para que el progreso de los alumnos se registre en el sistema.`}],fe=`
  .pm-tour-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8); z-index: 10000;
    pointer-events: auto; display: none; opacity: 0;
    transition: opacity 0.3s;
  }
  .pm-tour-spotlight {
    position: fixed; border-radius: 12px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
    z-index: 10001; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none; border: 2px solid var(--pm-primary);
  }
  .pm-tour-tooltip {
    position: fixed; width: 280px; background: var(--pm-surface);
    border: 1px solid var(--pm-border); border-radius: 16px;
    padding: 1.5rem; z-index: 10002; color: #fff;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    transition: top 0.4s, left 0.4s; pointer-events: auto;
  }
  .pm-tour-tooltip h4 {
    margin: 0 0 0.5rem; color: var(--pm-primary);
    font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .pm-tour-tooltip p { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--pm-text-muted); }
  .pm-tour-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
  .pm-tour-progress { font-size: 0.75rem; color: var(--pm-text-muted); }
  .pm-tour-btn-skip { background: none; border: none; color: var(--pm-text-muted); font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0; }
  .pm-tour-btn-next {
    background: var(--pm-primary); color: #fff; border: none;
    padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; cursor: pointer;
    font-size: 0.85rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  .pm-help-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(var(--pm-primary-rgb), 0.15); color: var(--pm-primary);
    border: 1px solid rgba(var(--pm-primary-rgb), 0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; font-size: 1rem;
  }
  .pm-help-btn:hover { background: var(--pm-primary); color: #fff; transform: scale(1.1); }
  [data-theme="light"] .pm-tour-tooltip { background: #fff; color: #111; }
  @media (max-width: 480px) {
    .pm-tour-tooltip { width: calc(100% - 40px); left: 20px !important; font-size: 0.85rem; }
  }
`,pe=class{constructor(e,t=de){this._container=e,this._steps=t,this._step=0,this._autoTimer=null,this._overlay=null,this._spotlight=null,this._tooltip=null,this._mounted=!1,this._styleEl=null}mount(){if(!this._mounted)try{this._injectStyles(),this._injectDOM(),this._bindEvents(),this._mounted=!0,localStorage.getItem(L)||(this._autoTimer=setTimeout(()=>this.start(),ue))}catch(e){console.error(`[AsistenciaTour] Error al montar el tour:`,e),this._mounted=!1}}start(){this._overlay&&(this._step=0,this._tooltip.style.display=`block`,this._spotlight.style.display=`block`,this._overlay.style.display=`block`,this._overlay.offsetHeight,this._overlay.style.opacity=`1`,this._showStep(0),localStorage.setItem(L,`true`))}destroy(){this._autoTimer!==null&&(clearTimeout(this._autoTimer),this._autoTimer=null),this._overlay&&=(this._overlay.style.transition=`none`,this._overlay.style.opacity=`0`,this._overlay.style.display=`none`,this._overlay.remove(),null),this._spotlight&&=(this._spotlight.remove(),null),this._tooltip&&=(this._tooltip.remove(),null),this._styleEl&&=(this._styleEl.remove(),null),this._mounted=!1}_injectStyles(){if(document.getElementById(`pm-tour-styles`))return;let e=document.createElement(`style`);e.id=`pm-tour-styles`,e.textContent=fe,document.head.appendChild(e),this._styleEl=e}_injectDOM(){document.getElementById(`pm-tour-overlay`)?.remove(),document.getElementById(`pm-tour-spotlight`)?.remove(),document.getElementById(`pm-tour-tooltip`)?.remove();let e=document.createElement(`div`);e.id=`pm-tour-overlay`,e.className=`pm-tour-overlay`,e.setAttribute(`role`,`dialog`),e.setAttribute(`aria-modal`,`true`),e.setAttribute(`aria-label`,`Guía interactiva`),document.body.appendChild(e),this._overlay=e;let t=document.createElement(`div`);t.id=`pm-tour-spotlight`,t.className=`pm-tour-spotlight`,t.style.display=`none`,document.body.appendChild(t),this._spotlight=t;let n=document.createElement(`div`);n.id=`pm-tour-tooltip`,n.className=`pm-tour-tooltip`,n.style.display=`none`,n.innerHTML=`
      <h4 id="pm-tour-title"></h4>
      <p  id="pm-tour-body"></p>
      <div class="pm-tour-footer">
        <span class="pm-tour-progress" id="pm-tour-progress"></span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button id="pm-tour-skip" class="pm-tour-btn-skip">Saltar guía</button>
          <button id="pm-tour-next" class="pm-tour-btn-next">Siguiente</button>
        </div>
      </div>
    `,document.body.appendChild(n),this._tooltip=n}_bindEvents(){if(!this._tooltip||!this._overlay){console.warn(`[AsistenciaTour] DOM no inyectado correctamente, saltando event binding`);return}this._tooltip.querySelector(`#pm-tour-next`).addEventListener(`click`,()=>this._nextStep()),this._tooltip.querySelector(`#pm-tour-skip`).addEventListener(`click`,()=>this._close()),this._onKeydown=e=>{e.key===`Escape`&&this._close()},document.addEventListener(`keydown`,this._onKeydown),this._onResize=()=>{this._overlay?.style.display!==`none`&&this._showStep(this._step)},window.addEventListener(`resize`,this._onResize,{passive:!0})}_showStep(e){let t=this._steps[e],n=this._container.querySelector(t.target);if(!n){this._nextStep();return}n.scrollIntoView({behavior:`smooth`,block:`center`}),setTimeout(()=>this._positionOnElement(n,t,e),400)}_positionOnElement(e,t,n){if(!this._spotlight||!this._tooltip){console.warn(`[AsistenciaTour] Tour no montado correctamente, abortando posicionamiento`);return}let r=e.getBoundingClientRect();this._spotlight.style.width=`${r.width+20}px`,this._spotlight.style.height=`${r.height+20}px`,this._spotlight.style.top=`${r.top-10}px`,this._spotlight.style.left=`${r.left-10}px`;let i=r.bottom+16;i+200>window.innerHeight&&(i=r.top-200-16);let a=Math.max(16,Math.min(window.innerWidth-280-16,r.left));this._tooltip.style.top=`${i}px`,this._tooltip.style.left=`${a}px`,this._tooltip.querySelector(`#pm-tour-title`).innerHTML=`<span>${t.title}</span>`,this._tooltip.querySelector(`#pm-tour-body`).textContent=t.body,this._tooltip.querySelector(`#pm-tour-progress`).textContent=`${n+1} / ${this._steps.length}`,this._tooltip.querySelector(`#pm-tour-next`).textContent=n===this._steps.length-1?`Finalizar ✓`:`Siguiente →`}_nextStep(){this._step++,this._step<this._steps.length?this._showStep(this._step):this._close()}_close(){this._overlay&&(localStorage.setItem(L,`true`),this._onKeydown&&document.removeEventListener(`keydown`,this._onKeydown),this._onResize&&window.removeEventListener(`resize`,this._onResize),this._tooltip&&(this._tooltip.style.display=`none`),this._spotlight&&(this._spotlight.style.display=`none`),this._overlay.style.opacity=`0`,setTimeout(()=>{this._overlay&&(this._overlay.style.display=`none`)},300))}};function R(){if(document.getElementById(`pm-student-panel-styles`))return;let e=document.createElement(`style`);e.id=`pm-student-panel-styles`,e.textContent=`
    .pm-student-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 400px;
      background: var(--pm-surface, #1e293b); color: #fff; z-index: 1000;
      transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -10px 0 30px rgba(0,0,0,0.3); display: flex; flex-direction: column;
    }
    .pm-student-panel--open { transform: translateX(0); }
    .pm-student-panel__header { 
      padding: 20px; display: flex; align-items: center; gap: 15px; 
      border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
    }
    .pm-student-panel__avatar {
      width: 48px; height: 48px; border-radius: 12px; background: var(--pm-primary, #3b82f6);
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem;
    }
    .pm-student-panel__name { font-weight: 700; font-size: 1.1rem; line-height: 1.2; }
    .pm-student-panel__progress-bar { 
      height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 8px; overflow: hidden;
    }
    .pm-student-panel__progress-fill { height: 100%; background: #10b981; transition: width 1s ease-out; }
    
    .pm-student-panel__body { flex: 1; overflow-y: auto; padding: 20px; }
    .pm-student-panel__section { margin-bottom: 24px; }
    .pm-student-panel__section-title { 
      font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      color: rgba(255,255,255,0.5); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }

    /* Indicators & Timeline */
    .pm-route-indicador {
      background: rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px;
      display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .pm-route-indicador:hover { background: rgba(255,255,255,0.08); transform: translateY(-1px); }
    .pm-route-indicador__icon { font-size: 1.2rem; }
    .pm-route-indicador__name { font-weight: 600; font-size: 0.95rem; }
    .pm-route-indicador__stats { font-size: 0.75rem; color: rgba(255,255,255,0.5); display: block; }
    
    .pm-route-indicador__timeline { 
      margin: -4px 0 12px 0; padding: 12px; background: rgba(255,255,255,0.02); 
      border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.05); border-top: none;
    }
    .pm-timeline-actions { margin-bottom: 12px; }
    .pm-btn-add-eval {
      width: 100%; background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px dashed rgba(96,165,250,0.3);
      padding: 8px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
    }
    .pm-btn-add-eval:hover { background: rgba(59,130,246,0.15); border-color: rgba(96,165,250,0.5); }

    .pm-eval-timeline__item {
      padding: 10px; border-left: 2px solid rgba(255,255,255,0.1); margin-left: 10px; margin-bottom: 12px;
      position: relative; list-style: none;
    }
    .pm-eval-timeline__item::before {
      content: ''; position: absolute; left: -6px; top: 12px; width: 10px; height: 10px;
      background: #1e293b; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
    }
    .pm-eval-timeline__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .pm-eval-timeline__date { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 600; }
    .pm-eval-timeline__edit { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; }
    .pm-eval-timeline__edit:hover { color: #60a5fa; }
    .pm-eval-timeline__nota { font-weight: 700; font-size: 0.85rem; color: #60a5fa; display: block; }
    .pm-eval-timeline__detail { font-size: 0.85rem; color: rgba(255,255,255,0.8); display: block; margin-top: 4px; }

    /* Modal */
    .pm-student-panel__modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
      z-index: 2100; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .pm-student-panel__modal-content {
      background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      animation: pm-panel-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes pm-panel-modal-in { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    
    .pm-student-panel__modal-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
    .pm-student-panel__modal-header h4 { margin: 0; font-size: 1.1rem; }
    .pm-student-panel__modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; opacity: 0.5; }
    .pm-student-panel__modal-close:hover { opacity: 1; }
    
    .pm-student-panel__modal-indicator-name { padding: 0 20px; margin-top: 12px; font-size: 0.85rem; color: #60a5fa; font-weight: 600; }
    .pm-student-panel__modal-body { padding: 20px; }
    .pm-student-panel__modal-field { margin-bottom: 20px; }
    .pm-student-panel__modal-field label { display: block; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; }
    
    .pm-student-panel__nota-picker { display: flex; justify-content: space-between; gap: 8px; }
    .pm-student-panel__nota-btn {
      flex: 1; aspect-ratio: 1; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .pm-student-panel__nota-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
    .pm-student-panel__nota-btn.active { background: #3b82f6; border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.5); }
    
    .pm-student-panel__modal-footer { padding: 20px; display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
    .pm-btn {
      flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none;
    }
    .pm-btn-primary { background: #3b82f6; color: #fff; }
    .pm-btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
    .pm-btn-outline { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
    .pm-btn-outline:hover { background: rgba(255,255,255,0.08); }
  `,document.head.appendChild(e)}function z(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function me(e){return e?e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join(``):`?`}function he(e){return e?new Date(e).toLocaleDateString(`es-AR`,{day:`2-digit`,month:`2-digit`,year:`2-digit`}):``}function ge(e){return e==null?{color:`gray`,icon:`⚫`,label:`Sin evaluar`}:e>=4?{color:`green`,icon:`🟢`,label:`Dominado`}:e>=2?{color:`yellow`,icon:`🟡`,label:`En progreso`}:{color:`red`,icon:`🔴`,label:`Necesita trabajo`}}async function _e(t,n){let{data:r,error:i}=await e.from(`indicators`).select(`id, nombre, description, order_index, node_id, nodes(id, name, order_index, level_id, levels(id, name, level_number))`).eq(`nodes.route_version_id`,n).eq(`activo`,!0).order(`order_index`);if(i)throw i;let a=(r??[]).filter(e=>e.nodes!==null),{data:o,error:s}=await e.from(`indicator_attempts`).select(`id, indicator_id, nota, observations, tarea, created_at, node_id, status, session_id`).eq(`student_id`,t).order(`created_at`,{ascending:!1});if(s)throw s;let c={};for(let e of o??[])c[e.indicator_id]||(c[e.indicator_id]=[]),c[e.indicator_id].push(e);let l=a.map(e=>{let t=c[e.id]??[],n=t[0]??null,r=ge(n?.nota??null);return{id:e.id,nombre:e.nombre||e.description||`Indicador ${e.id}`,node:e.nodes,latestNota:n?.nota??null,latestObs:n?.observations??null,latestTarea:n?.tarea??null,semColor:r.color,semIcon:r.icon,history:t}}),u=l.filter(e=>e.latestNota>=4).length,d=l.length,f=d>0?Math.round(u/d*100):0,p=new Set;return{indicatorSummaries:l.filter(e=>{if(p.has(e.id))return!1;p.add(e.id);let t=e.history.length>0,n=e.latestNota!==null&&e.latestNota!==0;return t||n}),dominados:u,total:d,avance:f,pendingTasks:l.filter(e=>e.latestTarea).map(e=>({indicadorNombre:e.nombre,tarea:e.latestTarea}))}}function ve(e,t){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">${z(me(e.nombre_completo))}</div>
      <div>
        <div class="pm-student-panel__name">${z(e.nombre_completo)}</div>
        <div class="pm-student-panel__meta">Avance: ${t}%</div>
        <div class="pm-student-panel__progress-bar">
          <div class="pm-student-panel__progress-fill" style="width:${t}%"></div>
        </div>
      </div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
  `}function B(e,t){return`
    <div class="pm-timeline-actions">
      <button class="pm-btn-add-eval" data-action="new-eval" data-idx="${t}">
        <i class="bi bi-plus-circle"></i> Nueva evaluación
      </button>
    </div>
    <ul class="pm-eval-timeline">
      ${e.map((e,n)=>`
    <li class="pm-eval-timeline__item">
      <div class="pm-eval-timeline__header">
        <span class="pm-eval-timeline__date">${z(he(e.created_at))}</span>
        <button class="pm-eval-timeline__edit" data-action="edit-eval" data-idx="${t}" data-hidx="${n}">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
      <span class="pm-eval-timeline__nota">Nota: ${z(String(e.nota??`-`))}</span>
      ${e.observations?`<span class="pm-eval-timeline__detail">${z(e.observations)}</span>`:``}
      ${e.tarea?`<span class="pm-eval-timeline__detail"><strong>Tarea:</strong> ${z(e.tarea)}</span>`:``}
    </li>
  `).join(``)||`<p class="pm-empty-history">Sin evaluaciones previas</p>`}
    </ul>
  `}function ye(e){return e.length?e.map((e,t)=>`
    <div class="pm-route-indicador pm-route-indicador--${z(e.semColor)}"
         data-action="toggle-history"
         data-idx="${t}"
         role="button"
         tabindex="0"
         aria-expanded="false">
      <span class="pm-route-indicador__icon">${e.semIcon}</span>
      <div class="pm-route-indicador__info">
        <span class="pm-route-indicador__name">${z(e.nombre)}</span>
        <span class="pm-route-indicador__stats">
          ${e.latestNota==null?`Sin evaluar`:`Última nota: ${e.latestNota}`}
          · ${e.history.length} eval${e.history.length===1?``:`s`}
        </span>
      </div>
    </div>
    <div class="pm-route-indicador__timeline" data-timeline="${t}" hidden>
      ${B(e.history,t)}
    </div>
  `).join(``):`<p style="padding:8px">No hay indicadores en esta ruta.</p>`}function be(e){return e.length?`
    <section class="pm-student-panel__section">
      <h3 class="pm-student-panel__section-title">Tareas pendientes</h3>
      <ul class="pm-pending-tasks">
        ${e.map(e=>`
          <li class="pm-pending-tasks__item">
            <strong>${z(e.indicadorNombre)}:</strong> ${z(e.tarea)}
          </li>
        `).join(``)}
      </ul>
    </section>
  `:``}function xe(e,{indicatorSummaries:t,avance:n,pendingTasks:r}){return`
    ${ve(e,n)}
    <div class="pm-student-panel__body">
      ${be(r)}
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Ruta de aprendizaje</h3>
        <div class="pm-route-map">
          ${ye(t)}
        </div>
      </section>
    </div>
  `}function Se(){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">…</div>
      <div><div class="pm-student-panel__name">Cargando…</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:var(--color-text-muted,#888)">
      Cargando datos del alumno…
    </div>
  `}function Ce(e){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">!</div>
      <div><div class="pm-student-panel__name">Error</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:#c00">
      ${z(e)}
    </div>
  `}function we({alumno:n,rutaId:r,sessionId:i,claseId:a,fecha:o,horaInicio:s}){R();let c=document.createElement(`aside`);c.className=`pm-student-panel`,c.setAttribute(`role`,`dialog`),c.setAttribute(`aria-modal`,`false`),c.setAttribute(`aria-label`,`Progreso de ${n.nombre_completo}`),document.body.appendChild(c);let l=[],u=null;function d(){v()===`desktop`?c.classList.add(`pm-student-panel--desktop`):c.classList.remove(`pm-student-panel--desktop`)}let f=g(d);d();function m(e){let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;if(n===`close`){b();return}if(n===`toggle-history`){let e=t.dataset.idx,n=c.querySelector(`[data-timeline="${e}"]`);if(!n)return;let r=!n.hidden;n.hidden=r,t.setAttribute(`aria-expanded`,String(!r));return}if(n===`new-eval`){let e=t.dataset.idx;h(e);return}if(n===`edit-eval`){let e=t.dataset.idx,n=t.dataset.hidx;h(e,n);return}}async function h(e,t=null){let n=l[e],r=t===null?null:n.history[t],i=r?.nota??null,a=document.createElement(`div`);a.className=`pm-student-panel__modal-overlay pm-animate-fade-in`,a.innerHTML=`
      <div class="pm-student-panel__modal-content">
        <div class="pm-student-panel__modal-header">
          <h4>${r?`Editar`:`Nueva`} Evaluación</h4>
          <button class="pm-student-panel__modal-close" data-action="modal-close">&times;</button>
        </div>
        <p class="pm-student-panel__modal-indicator-name">${z(n.nombre)}</p>
        
        <div class="pm-student-panel__modal-body">
          <div class="pm-student-panel__modal-field">
            <label>Nota del indicador</label>
            <div class="pm-student-panel__nota-picker">
              ${[0,1,2,3,4,5].map(e=>`
                <button class="pm-student-panel__nota-btn ${i===e?`active`:``}" data-nota="${e}">${e}</button>
              `).join(``)}
            </div>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Observaciones / Comentarios</label>
            <textarea id="modal-obs" rows="4" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 12px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Escribe aquí las observaciones...">${r?z(r.observations):``}</textarea>
          </div>
        </div>

        <div class="pm-student-panel__modal-footer">
          <button class="pm-btn pm-btn-outline" data-action="modal-close">Cancelar</button>
          <button class="pm-btn pm-btn-primary" data-action="modal-save">
            ${r?`Actualizar`:`Guardar Evaluación`}
          </button>
        </div>
      </div>
    `,document.body.appendChild(a),a.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-nota]`);if(t){a.querySelectorAll(`[data-nota]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),i=parseInt(t.dataset.nota);return}let o=e.target.closest(`[data-action]`)?.dataset.action;if(o===`modal-close`)a.remove();else if(o===`modal-save`){let e=a.querySelector(`#modal-obs`).value;await _(n.id,i,e,r?.id),a.remove()}}),a.addEventListener(`click`,e=>{e.target===a&&a.remove()})}async function _(r,i,c,l=null){try{let l=t();if(!l)throw Error(`No hay sesión de maestro activa.`);console.log(`[studentProgressPanel] Saving via RPC...`,{claseId:a,fecha:o,horaInicio:s,indicatorId:r,studentId:n.id,nota:i});let{data:u,error:d}=await e.rpc(`ensure_session_and_save_evaluation`,{p_clase_id:a,p_maestro_id:l.id,p_fecha:o,p_hora_inicio:s,p_indicator_id:r,p_student_id:n.id,p_nota:i,p_observations:(c||``).trim()});if(d)throw d;console.log(`[studentProgressPanel] Save successful. Session ID:`,u),await y()}catch(e){console.error(`[studentProgressPanel] Error during RPC save flow:`,e),alert(`Error al guardar la evaluación: `+(e.message||`Error de base de datos`))}}c.addEventListener(`click`,m),c.addEventListener(`keydown`,e=>{if(e.key===`Enter`||e.key===` `){let t=e.target.closest(`[data-action="toggle-history"]`);t&&(e.preventDefault(),t.click())}});async function y(){c.innerHTML=Se(),c.classList.add(`pm-student-panel--open`),u&&u.dispose(),u=p(c,{onClose:()=>b()});try{let e=await _e(n.id,r);l=e.indicatorSummaries,c.innerHTML=xe(n,e)}catch(e){console.error(`[studentProgressPanel] Error loading progress:`,e),c.innerHTML=Ce(e?.message??`Error desconocido al cargar datos.`)}}function b(){c.classList.remove(`pm-student-panel--open`),u&&=(u.dispose(),null),setTimeout(()=>{c.classList.contains(`pm-student-panel--open`)||(c.innerHTML=``,l=[])},300)}function x(){u&&=(u.dispose(),null),f(),c.removeEventListener(`click`,m),c.remove()}return{open:y,close:b,destroy:x}}var V={LOGRADO:{label:`LOGRADO`,cls:`ssp-estado-logrado`},EN_PROGRESO:{label:`EN_PROGRESO`,cls:`ssp-estado-en-progreso`},INICIADO:{label:`INICIADO`,cls:`ssp-estado-iniciado`},MIXTO:{label:`MIXTO`,cls:`ssp-estado-mixto`}},Te={LOGRADO:`ssp-chip-logrado`,EN_PROGRESO:`ssp-chip-en-progreso`,INICIADO:`ssp-chip-iniciado`},H={LOGRADO:`LOGRADO`,EN_PROGRESO:`EN_PROGRESO`,INICIADO:`INICIADO`,MIXTO:`MIXTO`};function U(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function Ee(e){return(e||``).trim().toLowerCase()}function De(e){let t=new Map;for(let n of e){let e=Ee(n.contenido_dsl);if(e)if(!t.has(e))t.set(e,{contenido:n.contenido_dsl,estado:n.estado_cualitativo,alumnos:[{id:n.alumno_id,nombre:n.alumno_nombre||`Alumno`,estado:n.estado_cualitativo}],observaciones:n.observaciones||null,tarea:n.tarea||null});else{let r=t.get(e);r.alumnos.push({id:n.alumno_id,nombre:n.alumno_nombre||`Alumno`,estado:n.estado_cualitativo}),r.estado!==`MIXTO`&&r.estado!==n.estado_cualitativo&&(r.estado=`MIXTO`),!r.observaciones&&n.observaciones&&(r.observaciones=n.observaciones),!r.tarea&&n.tarea&&(r.tarea=n.tarea)}}return Array.from(t.values())}function Oe(){let e=null,t=[];function n(e,n){let r=[`📚 Clase ${e} — ${(()=>{try{let[e,t,r]=n.split(`-`);return`${r}/${t}/${e}`}catch{return n}})()}`];for(let e of t){let t=H[e.estado]||e.estado,n=e.estado===`MIXTO`?e.alumnos.map(e=>{let t=H[e.estado]||e.estado;return`${e.nombre} (${t})`}).join(`, `):e.alumnos.map(e=>e.nombre).join(`, `);r.push(``),r.push(`🔹 ${e.contenido} — ${t}`),r.push(`   Alumnos: ${n}`),e.tarea&&r.push(`   📝 Tarea: ${e.tarea}`)}return r.push(``,`🎯 El Sistema PC`),r.join(`
`)}function r(e,t){let n=V[e.estado]||V.EN_PROGRESO,r=e.alumnos.length,i=e.estado===`MIXTO`,a=e.alumnos.map(e=>`<span class="${i?`ssp-alumno-chip ${Te[e.estado]||``}`:`ssp-alumno-chip`}">${U(e.nombre)}</span>`).join(``),o=e.observaciones?`<div class="ssp-group-obs">${U(e.observaciones)}</div>`:``,s=e.tarea?`<div class="ssp-group-tarea">📝 Tarea: ${U(e.tarea)}</div>`:``;return`
      <div class="ssp-group">
        <div class="ssp-group-header">
          <span class="ssp-group-contenido">${U(e.contenido)}</span>
          <span class="ssp-group-count">${r} alumno${r===1?``:`s`}</span>
          <span class="ssp-estado-badge ${n.cls}">${n.label}</span>
        </div>
        <div class="ssp-group-alumnos">${a}</div>
        ${o}
        ${s}
      </div>
    `}function i(i,a){if(!e)return;let s=t.length>0;e.innerHTML=`
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog" role="dialog" aria-modal="true" aria-label="Resumen pedagógico">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div>
            <strong>Resumen Pedagógico</strong>
            <div class="ssp-subtitle">${U(i)} · ${U(a)}</div>
          </div>
        </div>

        ${s?`
          <div class="ssp-section-title">✅ Grupos de progreso (${t.length})</div>
          <div class="ssp-body">
            ${t.map(e=>r(e)).join(``)}
          </div>
        `:`
          <div class="ssp-empty">
            No hay registros de progreso para esta sesión.<br>
            Usá el botón 🎯 <strong>Analizar</strong> en el editor para generarlos.
          </div>
        `}

        <div class="ssp-footer">
          <button class="pm-btn pm-btn-success ssp-btn-wa" id="ssp-whatsapp">
            <i class="bi bi-whatsapp"></i> Compartir WhatsApp
          </button>
          <button class="pm-btn pm-btn-outline ssp-btn-close" id="ssp-close">✕ Cerrar</button>
        </div>
      </div>
    `,ke(),e.querySelector(`#ssp-whatsapp`).onclick=()=>{let e=n(i,a);window.open(`https://wa.me/?text=${encodeURIComponent(e)}`,`_blank`)},e.querySelector(`#ssp-close`).onclick=o,e.querySelector(`.ssp-backdrop`).onclick=o}async function a({sesionId:n,claseNombre:r,fecha:a,supabase:s}){e||(e=document.createElement(`div`),e.className=`ssp-wrapper`,document.body.appendChild(e)),e.style.display=`flex`,e.innerHTML=`
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div><strong>Resumen Pedagógico</strong><div class="ssp-subtitle">${U(r)}</div></div>
        </div>
        <div class="ssp-loading">Cargando registros...</div>
      </div>
    `,ke(),e.querySelector(`.ssp-backdrop`).onclick=o;let{data:c,error:l}=await s.from(`progresos`).select(`id, alumno_id, contenido_dsl, estado_cualitativo, observaciones, indicadores`).eq(`sesion_clase_id`,n).order(`created_at`,{ascending:!0});if(l){console.error(`[SessionSummaryPanel] Error cargando progresos:`,l),t=[],i(r,a);return}let u=(c||[]).map(e=>({id:e.id,alumno_id:e.alumno_id,contenido_dsl:e.contenido_dsl,estado_cualitativo:e.estado_cualitativo||`EN_PROGRESO`,observaciones:e.observaciones,tarea:e.indicadores?.tarea||null})),d=[...new Set(u.map(e=>e.alumno_id).filter(Boolean))];if(d.length>0){let{data:e}=await s.from(`alumnos`).select(`id, nombre_completo`).in(`id`,d),t=new Map((e||[]).map(e=>[e.id,e.nombre_completo]));u.forEach(e=>{e.alumno_nombre=t.get(e.alumno_id)||`Alumno`})}t=De(u),i(r,a)}function o(){e&&(e.style.display=`none`,e.innerHTML=``),t=[]}return{open:a,close:o}}function ke(){if(document.getElementById(`ssp-styles`))return;let e=document.createElement(`style`);e.id=`ssp-styles`,e.textContent=`
    /* ── Wrapper & backdrop ────────────────────────── */
    .ssp-wrapper {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .ssp-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(2px);
    }

    /* ── Dialog ────────────────────────────────────── */
    .ssp-dialog {
      position: relative;
      z-index: 1;
      background: var(--pm-surface, #fff);
      border-radius: var(--pm-radius, 12px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.22);
      width: 100%;
      max-width: 480px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Header ────────────────────────────────────── */
    .ssp-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .ssp-icon { font-size: 1.5rem; }
    .ssp-subtitle {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      margin-top: 0.1rem;
    }

    /* ── Section title ─────────────────────────────── */
    .ssp-section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--pm-text-muted, #6c757d);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    /* ── Body (group container) ────────────────────── */
    .ssp-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Group card ────────────────────────────────── */
    .ssp-group {
      background: var(--pm-surface-2, #f8f9fa);
      border: 1px solid var(--pm-border, #dee2e6);
      border-radius: var(--pm-radius-sm, 8px);
      padding: 0.7rem 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .ssp-group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .ssp-group-contenido {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text, #212529);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ssp-group-count {
      font-size: 0.72rem;
      color: var(--pm-text-muted, #6c757d);
      white-space: nowrap;
    }

    /* ── Estado badges ─────────────────────────────── */
    .ssp-estado-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      color: #fff;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .ssp-estado-logrado      { background: #198754; }
    .ssp-estado-en-progreso  { background: #0d6efd; }
    .ssp-estado-iniciado     { background: #6c757d; }
    .ssp-estado-mixto        { background: #fd7e14; }

    /* ── Alumno chips ──────────────────────────────── */
    .ssp-group-alumnos {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    .ssp-alumno-chip {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-border, #dee2e6);
      color: var(--pm-text, #212529);
    }
    .ssp-chip-logrado      { border-color: #198754; background: #19875412; }
    .ssp-chip-en-progreso  { border-color: #0d6efd; background: #0d6efd12; }
    .ssp-chip-iniciado     { border-color: #6c757d; background: #6c757d12; }

    /* ── Group observaciones / tarea ───────────────── */
    .ssp-group-obs {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      font-style: italic;
      margin-top: 0.1rem;
    }
    .ssp-group-tarea {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
    }

    /* ── Empty & loading ───────────────────────────── */
    .ssp-empty {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1rem 0;
      line-height: 1.6;
    }
    .ssp-loading {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1.5rem 0;
    }

    /* ── Footer ────────────────────────────────────── */
    .ssp-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.25rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--pm-border, #dee2e6);
    }

    .ssp-footer .pm-btn {
      width: auto;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    .pm-btn-success {
      background: var(--pm-success, #25D366);
      color: #fff;
    }
    .pm-btn-success:hover {
      opacity: 0.9;
    }
    .pm-btn-outline {
      background: transparent;
      border: 1.5px solid var(--pm-border, #dee2e6);
      color: var(--pm-text, #212529);
    }
    .pm-btn-outline:hover {
      background: var(--pm-surface-2, #f8f9fa);
    }
    .ssp-btn-wa { flex: 1; }
    .ssp-btn-close { flex-shrink: 0; }
  `,document.head.appendChild(e)}var Ae=`documentos`;async function je(t,n=`justificaciones`){let r=t.name.split(`.`).pop(),i=`${n}/${`${Date.now()}_${Math.random().toString(36).slice(2)}.${r}`}`,{data:a,error:o}=await e.storage.from(Ae).upload(i,t,{cacheControl:`3600`,upsert:!1});if(o)throw o;let{data:s}=e.storage.from(Ae).getPublicUrl(i);return s.publicUrl}async function Me({sesionId:t,alumnoId:n,claseId:r,fecha:i,motivo:a,evidenciaBase64:o,creadoPor:s},c=null){if(!t||!n||!r||!i||!a)return{error:{message:`Faltan campos requeridos`}};let l=null;if(c)try{l=await je(c)}catch(e){console.warn(`[JustificacionService] Error subiendo evidencia a Storage:`,e)}let u={sesion_id:t,alumno_id:n,clase_id:r,fecha:i,motivo:a,evidencia_url:l||null,evidencia_base64:null,creado_por:s,estado:`pendiente`},{data:d,error:f}=await e.from(`justificaciones`).upsert([u],{onConflict:`sesion_id,alumno_id`,ignoreDuplicates:!1}).select().single();return{data:d,error:f}}async function Ne(t,n){if(!t||!n)return null;let{data:r,error:i}=await e.from(`justificaciones`).select(`*`).eq(`sesion_id`,t).eq(`alumno_id`,n).single();return i&&i.code!==`PGRST116`?(console.warn(`[JustificacionService] Error obteniendo justificación:`,i),null):r||null}async function Pe(t){if(!t)return{error:{message:`ID requerido`}};let{error:n}=await e.from(`justificaciones`).delete().eq(`id`,t);return{error:n}}function Fe(){let e=Promise.resolve();return{run(t){if(typeof t!=`function`)throw TypeError(`asyncMutex.run expects a function`);let n=e.then(()=>t());return e=n.then(()=>{},()=>{}),n}}}function W(e){return(e||``).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).trim()}function Ie(e,t){let n=W(e);return t.find(e=>W(e.nombre)===n||W(e.nombreCorto||e.nombre.split(` `)[0])===n||n.length>=3&&W(e.nombre).includes(n)||n.length>=3&&n.includes(W(e.nombreCorto||e.nombre.split(` `)[0])))??null}function Le(e,t){let n=[],r=[];for(let i of e){if(W(i)===`todos`){n.push(...t);continue}let e=Ie(i,t);e?n.push(e):r.push(`No se encontró el alumno: "${i}"`)}let i=new Set;return{resolved:n.filter(e=>i.has(e.id)?!1:(i.add(e.id),!0)),errors:r}}async function Re(t){if(t.length===0)return{data:[],error:null};let n=new Set,r=t.filter(e=>{let t=`${e.alumno_id}|${e.clase_id}|${e.sesion_clase_id}|${e.contenido_dsl}`;return n.has(t)?!1:(n.add(t),!0)}),{data:i,error:a}=await e.from(`progresos`).upsert(r,{onConflict:`alumno_id,clase_id,sesion_clase_id,contenido_dsl`,ignoreDuplicates:!1}).select(`id, alumno_id, contenido_dsl, estado_cualitativo`);return{data:i,error:a}}async function ze({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,contenido:i,evaluaciones:a,alumnos:o}){if(!a||a.length===0||!t)return{saved:0,error:null};let s=(a||[]).flatMap(e=>{if(e.seccion&&!e.alumno_id&&o&&o.length>0){let t=b(e.seccion,o);return t.length===0?[]:t.map(t=>({...e,alumno_id:t.id,seccion:void 0}))}return e}).map(a=>{let o=`EN_PROGRESO`;return a.nota!==null&&a.nota!==void 0&&(o=a.nota>=4?`LOGRADO`:a.nota>=2?`EN_PROGRESO`:`INICIADO`),{alumno_id:a.alumno_id,clase_id:t,sesion_clase_id:e,maestro_id:n,fecha_evaluacion:r,evaluacion_tipo:`observacion`,estado_cualitativo:o,calificacion:a.nota??null,contenido_dsl:i||``,observaciones:a.observacion||null,indicadores:{tipo:`tecnica`,es_colectivo:!1,tarea:a.tarea||null},objetivo_id:null}});try{let{data:e,error:t}=await Re(s);return t?(console.error(`[Progress] saveProgressFromEvaluaciones error:`,t),{saved:0,error:t.message}):{saved:(e||[]).length,error:null}}catch(e){return console.error(`[Progress] saveProgressFromEvaluaciones exception:`,e),{saved:0,error:e.message}}}async function Be({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:i,alumnos:a}){if(!i||i.length===0)return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromAI — emergente session sin clase_id`),{saved:[],errors:[]};let o=[],s=[];for(let c of i){let{resolved:i,errors:l}=Le(c.alumnos||[],a);s.push(...l);for(let a of i)o.push({alumno_id:a.id,clase_id:t,sesion_clase_id:e,maestro_id:n,fecha_evaluacion:r,evaluacion_tipo:`observacion`,estado_cualitativo:c.estado||`EN_PROGRESO`,calificacion:c.nota??null,contenido_dsl:c.contenido||``,observaciones:c.observacion||null,indicadores:{tipo:c.tipo||`otro`,es_colectivo:c.es_colectivo??!1,tarea:c.tarea||null},objetivo_id:null})}try{let{data:e,error:t}=await Re(o);if(t)throw t;return{saved:(e||[]).map(e=>({alumnoId:e.alumno_id,contenido:e.contenido_dsl,estado:e.estado_cualitativo})),errors:s}}catch(e){return console.warn(`[Progress] Error al guardar progreso:`,e.message),{saved:[],errors:[...s,e.message]}}}async function Ve({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,dslText:i,alumnos:a}){if(!i||!i.trim())return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromDSL — emergente session sin clase_id`),{saved:[],errors:[]};let o=i.split(`
`),s=[];for(let e of o){let t=re(e);if(!t.estados||t.estados.length===0||!t.contenido||t.contenido.length===0)continue;let n=t.estados[0],r=t.contenido[0],i=t.alumnos.length>0?t.alumnos:[`todos`],a=t.calificacion?.valor??null;s.push({alumnos:i,contenido:r,tipo:`tecnica`,estado:n,nota:a,tarea:t.tareas[0]||null,observacion:t.sugerencias[0]||null,es_colectivo:i.includes(`todos`)})}return s.length===0?{saved:[],errors:[]}:Be({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:s,alumnos:a})}async function He({claseId:t,objetivos:n}){if(!t||!n||n.length===0)return{linked:0};let{data:r,error:i}=await e.from(`progresos`).select(`id, contenido_dsl`).eq(`clase_id`,t).is(`objetivo_id`,null).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``);if(i)return console.warn(`[Progress] linkProgresosToObjetivos fetch error:`,i.message),{linked:0};if(!r||r.length===0)return{linked:0};let a=n.map(e=>({id:e.id,norm:W(e.descripcion),raw:e.descripcion})),o=new Map;for(let e of r){let t=W(e.contenido_dsl);if(!t)continue;let n=a.find(e=>e.norm===t);if(!n&&t.length>=5&&(n=a.find(e=>e.norm.length>=5&&e.norm.includes(t))),!n&&t.length>=5&&(n=a.find(e=>e.norm.length>=5&&t.includes(e.norm))),n){let t=o.get(n.id)||[];t.push(e.id),o.set(n.id,t)}}if(o.size===0)return{linked:0};let s=0;for(let[t,n]of o.entries()){let{error:r}=await e.from(`progresos`).update({objetivo_id:t}).in(`id`,n);r?console.warn(`[Progress] linkProgresosToObjetivos update error:`,r.message):s+=n.length}return console.debug(`[Progress] linkProgresosToObjetivos: linked ${s} records`),{linked:s}}var Ue={LOGRADO:{label:`Logrado`,color:`var(--pm-success, #198754)`,bg:`#19875418`},EN_PROGRESO:{label:`En Progreso`,color:`var(--pm-primary, #0d6efd)`,bg:`#0d6efd18`},INICIADO:{label:`Iniciado`,color:`var(--pm-muted,   #6c757d)`,bg:`#6c757d18`}},We=[`LOGRADO`,`EN_PROGRESO`,`INICIADO`];function G(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var Ge={CONDUCTA:{label:`conducta`,icon:`🚨`},ATENCION:{label:`atención`,icon:`🔔`},RIESGO_PEDAGOGICO:{label:`riesgo pedagógico`,icon:`📉`}};function Ke(e){let t={};for(let n of e){let e=n.alertaTipo??n.alertDetails?.type??`CONDUCTA`;t[e]=(t[e]??0)+1}return`${Object.entries(t).map(([e,t])=>{let n=Ge[e]??{label:e.toLowerCase(),icon:`⚠️`};return`${n.icon} ${t} ${n.label}${t>1?`s`:``}`}).join(` · `)} — revisá antes de guardar`}function qe(e,{onConfirm:t,onCancel:n}){let r=[],i=null;function a(e){let t=e.scope||(e.es_colectivo?`grupo`:`individual`),n=e.alumnos||[];if(e.requires_confirmation)return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;switch(t){case`grupo`:case`all`:return`<span class="ppp-scope-chip ppp-scope--all">👥 Todos los presentes</span>`;case`grupo_excluyendo`:case`group_excluding`:return`<span class="ppp-scope-chip ppp-scope--excluding">👥 Resto del grupo</span>`;case`subgrupo_indeterminado`:case`subgroup_unknown`:return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;default:return n.length?n.length===1?`<span class="ppp-scope-chip ppp-scope--individual">👤 ${G(n[0])}</span>`:`<span class="ppp-scope-chip ppp-scope--individual">👤 ${G(n.join(`, `))}</span>`:``}}function o(e,t){let n=Ue[e.estado]??Ue.EN_PROGRESO,r=e.nota?` · ${G(e.nota)}/5`:``,i=e.tarea?`<div class="ppp-tarea">📝 ${G(e.tarea)}</div>`:``,o=!!e.alerta,s=a(e);if(o){let n=Ge[e.alertaTipo]??{label:`Alerta pedagógica`,icon:`⚠️`};return`
        <div class="ppp-card ppp-card--alerta" data-idx="${t}">
          <div class="ppp-card-header">
            <span class="ppp-alerta-badge">${n.icon} ${G(n.label===`conducta`?`Conducta`:n.label===`atención`?`Atención pedagógica`:`Riesgo pedagógico`)}</span>
            <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
          </div>
          ${s?`<div class="ppp-scope-row">${s}</div>`:``}
          <div class="ppp-card-body">
            <span class="ppp-contenido ppp-contenido--alerta">${G(e.contenido)||`—`}</span>
          </div>
          ${e.observacion?`<div class="ppp-obs ppp-obs--alerta">${G(e.observacion)}</div>`:``}
          ${i}
        </div>
      `}return`
      <div class="ppp-card" data-idx="${t}">
        <div class="ppp-card-header">
          ${s||`<span class="ppp-alumnos">${G((e.alumnos||[]).join(`, `))}</span>`}
          <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
        </div>
        <div class="ppp-card-body">
          <span class="ppp-contenido">${G(e.contenido)||`—`}</span>
          <span class="ppp-sep">·</span>
          <button
            class="ppp-estado-btn"
            data-idx="${t}"
            style="color:${n.color};background:${n.bg};border-color:${n.color}"
            title="Click para cambiar estado"
          >${n.label}${r}</button>
        </div>
        ${e.observacion?`<div class="ppp-obs">${G(e.observacion)}</div>`:``}
        ${i}
      </div>
    `}function s(e){if(!i)return;let a=r.length>0,c=r.filter(e=>e.alerta),u=c.length>0?`<div class="ppp-alert-banner">⚠️ ${Ke(c)}</div>`:``,d=S(r),f=d.length>0?`
      <div class="ppp-clarification-banner">
        <div class="ppp-clarification-title">✏️ El texto puede ser más específico</div>
        <div class="ppp-clarification-body">
          ${d.map(e=>`<div class="ppp-clarification-item">• ${G(e.reason)}</div>`).join(``)}
        </div>
        <div class="ppp-clarification-hint">Podés guardar igual o editar el texto arriba para separar mejor las ideas.</div>
      </div>
    `:``;i.innerHTML=`
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${e?`<div class="ppp-resumen">${G(e)}</div>`:``}
        </div>
      </div>
      ${u}
      ${f}
      <div class="ppp-cards">
        ${a?r.map((e,t)=>o(e,t)).join(``):`<div class="ppp-empty">No se detectaron registros de progreso en este texto.</div>`}
      </div>
      <div class="ppp-footer">
        <button class="pm-btn pm-btn-outline ppp-btn-cancel" id="ppp-cancel">Cancelar</button>
        <button class="pm-btn pm-btn-primary ppp-btn-confirm" id="ppp-confirm" ${a?``:`disabled`}>
          ✓ Confirmar y guardar (${r.length})
        </button>
      </div>
    `,Je(),i.querySelectorAll(`.ppp-remove`).forEach(t=>{t.onclick=()=>{r.splice(parseInt(t.dataset.idx),1),s(e)}}),i.querySelectorAll(`.ppp-estado-btn`).forEach(t=>{t.onclick=()=>{let n=parseInt(t.dataset.idx),i=r[n].estado,a=(We.indexOf(i)+1)%We.length;r[n].estado=We[a],s(e)}}),i.querySelector(`#ppp-confirm`).onclick=()=>{t([...r]),l()},i.querySelector(`#ppp-cancel`).onclick=()=>{n&&n(),l()}}function c({progreso:t=[],resumen:n=``}){r=t.map(e=>({...e})),i||(i=document.createElement(`div`),i.className=`pm-progress-preview`,e.appendChild(i)),i.style.display=`block`,s(n),setTimeout(()=>i.scrollIntoView({behavior:`smooth`,block:`start`}),80)}function l(){i&&(i.style.display=`none`,i.innerHTML=``)}return{open:c,close:l}}function Je(){if(document.getElementById(`ppp-alert-styles`))return;let e=document.createElement(`style`);e.id=`ppp-alert-styles`,e.textContent=`
    /* ── Alert banner ────────────────────────────────────────── */
    .ppp-alert-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.5rem 0.75rem;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 6px;
      color: #856404;
      font-size: 0.82rem;
      font-weight: 600;
    }

    /* ── Alert card ──────────────────────────────────────────── */
    .ppp-card--alerta {
      border: 1.5px solid #dc3545 !important;
      background: #fff5f5 !important;
    }
    .dark .ppp-card--alerta,
    [data-theme="dark"] .ppp-card--alerta {
      background: #2a1215 !important;
      border-color: #f87171 !important;
    }

    .ppp-alerta-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #dc3545;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .ppp-alerta-alumno {
      font-size: 0.82rem;
      font-weight: 600;
      color: #dc3545;
      margin: 0.15rem 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ppp-contenido--alerta {
      color: #dc3545 !important;
      font-weight: 700;
    }

    .ppp-obs--alerta {
      color: #b91c1c;
      font-style: italic;
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }

    /* ── Clarification banner ────────────────────────────────── */
    .ppp-clarification-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.6rem 0.75rem;
      background: #f0f4ff;
      border: 1px solid #93c5fd;
      border-radius: 6px;
      font-size: 0.82rem;
    }
    .dark .ppp-clarification-banner,
    [data-theme="dark"] .ppp-clarification-banner {
      background: #1e2a3a;
      border-color: #3b82f6;
    }
    .ppp-clarification-title {
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 0.25rem;
    }
    .ppp-clarification-item {
      color: #1e40af;
      margin: 0.1rem 0;
    }
    .dark .ppp-clarification-item,
    [data-theme="dark"] .ppp-clarification-item {
      color: #93c5fd;
    }
    .ppp-clarification-hint {
      color: #6b7280;
      margin-top: 0.35rem;
      font-style: italic;
    }

    /* ── Scope chips ─────────────────────────────────────────── */
    .ppp-scope-row {
      margin: 0.1rem 0 0.2rem 0;
    }
    .ppp-scope-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.1rem 0.5rem;
      border-radius: 99px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .ppp-scope--all {
      background: #e0f2fe;
      color: #0369a1;
    }
    .dark .ppp-scope--all,
    [data-theme="dark"] .ppp-scope--all {
      background: #0c3554;
      color: #7dd3fc;
    }
    .ppp-scope--individual {
      background: #f0fdf4;
      color: #15803d;
    }
    .dark .ppp-scope--individual,
    [data-theme="dark"] .ppp-scope--individual {
      background: #052e16;
      color: #86efac;
    }
    .ppp-scope--excluding {
      background: #fef9c3;
      color: #854d0e;
    }
    .dark .ppp-scope--excluding,
    [data-theme="dark"] .ppp-scope--excluding {
      background: #3a2900;
      color: #fde047;
    }
    .ppp-scope--unknown {
      background: #faf5ff;
      color: #7c3aed;
      border: 1px dashed #c4b5fd;
    }
    .dark .ppp-scope--unknown,
    [data-theme="dark"] .ppp-scope--unknown {
      background: #1e1030;
      color: #c4b5fd;
    }
  `,document.head.appendChild(e)}async function Ye(t,n=12){let r=new Date;r.setDate(r.getDate()-n*7);let i=r.toISOString().split(`T`)[0],{data:a,error:o}=await e.from(`progresos`).select(`
      contenido_dsl,
      tipo,
      estado_cualitativo,
      fecha_evaluacion,
      alumnos ( nombre_completo )
    `).eq(`clase_id`,t).eq(`evaluacion_tipo`,`observacion`).gte(`fecha_evaluacion`,i).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``).order(`fecha_evaluacion`,{ascending:!1});if(o)throw Error(`Error al obtener registros de progreso: `+o.message);if(!a||a.length===0)return{totalSesiones:0,fechaDesde:i,registros:[]};let s=new Set(a.map(e=>e.fecha_evaluacion)),c=new Map;for(let e of a){let t=(e.contenido_dsl||``).trim().toLowerCase();if(!t)continue;c.has(t)||c.set(t,{contenido_dsl:e.contenido_dsl.trim(),tipo:e.tipo||`otro`,estados:[],fechas:new Set,alumnos:new Set});let n=c.get(t);n.estados.push(e.estado_cualitativo||`EN_PROGRESO`),n.fechas.add(e.fecha_evaluacion);let r=e.alumnos?.nombre_completo;r&&n.alumnos.add(r)}let l=Array.from(c.values()).map(e=>({contenido_dsl:e.contenido_dsl,tipo:e.tipo,estado:e.estados[0]||`EN_PROGRESO`,frecuencia:e.fechas.size,alumnos:Array.from(e.alumnos)}));return l.sort((e,t)=>t.frecuencia-e.frecuencia),{totalSesiones:s.size,fechaDesde:i,registros:l}}var Xe={tecnica:{color:`#0d6efd`,bg:`#0d6efd15`},repertorio:{color:`#198754`,bg:`#19875415`},teoria:{color:`#fd7e14`,bg:`#fd7e1415`},interpretacion:{color:`#6f42c1`,bg:`#6f42c115`},otro:{color:`#6c757d`,bg:`#6c757d15`}},Ze={alta:{label:`Foco`,color:`#dc3545`},media:{label:`Secundario`,color:`#fd7e14`},consolidacion:{label:`Consolidar`,color:`#198754`}};function Qe(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function $e(e,{onAdopt:t,onCancel:n}){let r=[],i=``,a=null;function o(e,t,n){let r=Ze[e.prioridad]??Ze.media;return`
      <div class="cpp-objetivo-row" data-pilar="${t}" data-obj="${n}">
        <span
          class="cpp-objetivo-text"
          data-pilar="${t}"
          data-obj="${n}"
          title="Click para editar"
        >${Qe(e.descripcion)}</span>
        <span class="cpp-prioridad-badge" style="color:${r.color}">${r.label}</span>
        <button class="cpp-remove-obj" data-pilar="${t}" data-obj="${n}" title="Quitar objetivo">✕</button>
      </div>
    `}function s(e,t){let n=Xe[e.tipo]??Xe.otro,r=(e.objetivos||[]).map((e,n)=>o(e,t,n)).join(``);return`
      <div class="cpp-pilar" data-pilar="${t}" style="border-left:3px solid ${n.color};background:${n.bg}">
        <div class="cpp-pilar-header">
          <span
            class="cpp-pilar-title"
            data-pilar="${t}"
            title="Click para editar nombre"
          >${Qe(e.nombre)}</span>
          <button class="cpp-remove-pilar" data-pilar="${t}" title="Quitar pilar">✕</button>
        </div>
        <div class="cpp-objetivos">
          ${r||`<div class="cpp-no-obj">Sin objetivos</div>`}
        </div>
      </div>
    `}function c(){return a?.querySelector(`#cpp-instrumento`)?.value?.trim()||``}function l(){return a?.querySelector(`#cpp-nivel`)?.value?.trim()||``}function u(){return!c()||r.length===0?!1:r.every(e=>(e.objetivos||[]).length>0)}function d(e,o){if(!a)return;let f=r.length>0;a.innerHTML=`
      <div class="cpp-header">
        <span class="cpp-icon">✨</span>
        <div class="cpp-header-text">
          <strong>Propuesta curricular generada por IA</strong>
          ${i?`<div class="cpp-resumen">${Qe(i)}</div>`:``}
        </div>
      </div>
      <div class="cpp-pilares">
        ${f?r.map((e,t)=>s(e,t)).join(``):`<div class="cpp-empty">La IA no detectó suficientes datos para generar una propuesta.</div>`}
      </div>
      <div class="cpp-footer">
        <div class="cpp-fields">
          <label class="cpp-field-label">Instrumento
            <input type="text" id="cpp-instrumento" class="cpp-input" value="${Qe(e)}" placeholder="ej. Violín" />
          </label>
          <label class="cpp-field-label">Nivel
            <input type="text" id="cpp-nivel" class="cpp-input" value="${Qe(o)}" placeholder="ej. Básico" />
          </label>
        </div>
        <div class="cpp-actions">
          <button class="pm-btn pm-btn-outline" id="cpp-cancel">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="cpp-adopt" ${u()?``:`disabled`}>
            ✓ Adoptar plan (${r.length} pilares)
          </button>
        </div>
      </div>
    `,a.querySelectorAll(`.cpp-pilar-title`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=document.createElement(`input`);n.type=`text`,n.className=`cpp-input cpp-inline-input`,n.value=r[t].nombre,e.replaceWith(n),n.focus();let i=()=>{r[t].nombre=n.value.trim()||r[t].nombre,d(c(),l())};n.onblur=i,n.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),i())}}}),a.querySelectorAll(`.cpp-objetivo-text`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj),i=document.createElement(`input`);i.type=`text`,i.className=`cpp-input cpp-inline-input`,i.value=r[t].objetivos[n].descripcion,e.replaceWith(i),i.focus();let a=()=>{r[t].objetivos[n].descripcion=i.value.trim()||r[t].objetivos[n].descripcion,d(c(),l())};i.onblur=a,i.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),a())}}}),a.querySelectorAll(`.cpp-remove-obj`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj);r[t].objetivos.splice(n,1),d(c(),l())}}),a.querySelectorAll(`.cpp-remove-pilar`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar);r.splice(t,1),d(c(),l())}});let m=a.querySelector(`#cpp-instrumento`),h=a.querySelector(`#cpp-adopt`);m&&h&&(m.oninput=()=>{h.disabled=!u()}),h&&(h.onclick=()=>{let e=c(),n=l();if(!e){m?.focus();return}t({instrumento:e,nivel:n,resumen:i,pilares:r}),p()});let g=a.querySelector(`#cpp-cancel`);g&&(g.onclick=()=>{n&&n(),p()})}function f({pilares:t=[],resumen:n=``,instrumento:o=``,nivel:s=``}){r=t.map(e=>({...e,objetivos:(e.objetivos||[]).map(e=>({...e}))})),i=n,a||(a=document.createElement(`div`),a.className=`cpp-panel`,e.appendChild(a)),a.style.display=`block`,d(o,s),setTimeout(()=>a.scrollIntoView({behavior:`smooth`,block:`nearest`}),50)}function p(){a&&(a.style.display=`none`,a.innerHTML=``)}return{open:f,close:p}}function et(e){let t=(e?.nombre||``).toLowerCase();return(e?.instrumento||``).toLowerCase(),/orquesta|ensamble|ensemble|coro|ensayo/.test(t)?`ensayo_general`:/teor[ií]a|solfeo|lenguaje\s+musical/.test(t)?`teoria`:`instrumento`}function tt(e,t){if(!e||e.length===0)return;t.parentNode.querySelectorAll(`.pm-progress-feedback`).forEach(e=>e.remove());let n=[...new Set(e.slice(0,3).map(e=>e.contenido||`progreso`))].join(` · `)+(e.length>3?` y ${e.length-3} más`:``),r=document.createElement(`div`);r.className=`pm-progress-feedback`,r.innerHTML=`<i class="bi bi-check-circle-fill"></i> <span>${e.length} registro(s) guardados — ${n}</span>`,t.parentNode.insertBefore(r,t.nextSibling),setTimeout(()=>r.remove(),4200)}function nt(e,t,n,r,i){if(!r)return`No hay datos de clase disponibles.`;let a=(e||[]).filter(e=>e.estado===`P`).length,o=(e||[]).filter(e=>e.estado===`A`).length,s=(e||[]).filter(e=>e.estado===`J`).length,c=`Reporte de Clase - ${r.nombre||`Sin nombre`}\n`;return c+=`Fecha: ${i||``}\n`,c+=`Instrumento: ${r.instrumento||`N/A`}\n\n`,c+=`RESUMEN DE ASISTENCIA
`,c+=`Presentes: ${a} | Ausentes: ${o} | Justificados: ${s}\n\n`,t&&t.trim()&&(c+=`CONTENIDO DE LA CLASE:\n${t}\n\n`),c+=`DETALLE DE ALUMNOS:
`,(e||[]).forEach(e=>{let t=(n||[]).find(t=>t.id===e.alumno_id)?.nombre_completo||`Alumno`,r=e.estado===`P`?`Presente`:e.estado===`A`?`Ausente`:`Justificado`;c+=`- ${t}: ${r}\n`}),c}function rt(e,t,n=1800){if(t.length>n){let r=t.slice(0,n)+`…

[Texto truncado — el reporte completo excede el límite de caracteres]`;AppToast.warn(`El texto se truncó (${t.length} caracteres, máximo ${n}). Usá la opción PDF para ver el reporte completo.`),window.open(e+encodeURIComponent(r),`_blank`)}else window.open(e+encodeURIComponent(t),`_blank`)}function it(e,t){let{clase:n,horario:r,salonNombre:i,fechaHoy:a,totalAlumnos:o,hasConflict:s,onBack:c}=t,l=[];function u(e,t,n){e.addEventListener(t,n),l.push(()=>e.removeEventListener(t,n))}e.innerHTML=`
    ${s?`
      <div class="pm-conflict-banner">
        <i class="bi bi-exclamation-triangle"></i>
        <span>Sesión modificada externamente. Guardado como revisión.</span>
        <button id="pm-conflict-dismiss">&times;</button>
      </div>
    `:``}
    <div class="pm-asist-header">
      <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
      <div style="flex:1">
        <h2 class="pm-asist-title">${h(n.nombre)}</h2>
        <p class="pm-asist-subtitle">
          ${i?`📍 ${h(i)} · `:``}
          ${r?`${_(r.hora_inicio)} – ${_(r.hora_fin)} · `:``}
          <span style="color:var(--pm-primary); font-weight:700;">${m(new Date(a+`T12:00:00`))}</span> · 
          ${o} alumnos
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div id="pm-sync-badge-container"></div>
        <button id="pm-btn-help" class="pm-help-btn" title="Guía rápida"><i class="bi bi-question-lg"></i></button>
        <div class="pm-asist-bulk-circles">
          <button id="btn-bulk-p" class="pm-bulk-circle p" title="Todos presentes">P</button>
          <button id="btn-bulk-a" class="pm-bulk-circle a" title="Todos ausentes">A</button>
        </div>
      </div>
    </div>
  `;let d=e.querySelector(`#pm-asist-back`);return d&&u(d,`click`,c),{destroy(){l.forEach(e=>{try{e()}catch{}}),l.length=0}}}function at(e,{editor:t,toolbar:n}){let r=!1;return{inject(i,a){if(r||!i||i.claseId!==a)return;let o=`[${i.nombre}] `;t.insertText(o),n.setContext({indicadorActivo:i.nombre});let s=e.querySelector(`#btn-guardar-obs`);s&&(s.style.display=``);let c=e.querySelector(`#pm-dsl-editor-container`);if(c){let e=c.parentElement.querySelector(`.pm-ruta-tema-banner`);e&&e.remove();let t=document.createElement(`div`);t.className=`pm-ruta-tema-banner`,t.style.cssText=`
          background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;
          padding:8px 12px;margin-bottom:8px;font-size:12px;color:#1d4ed8;
          display:flex;align-items:center;gap:8px;
        `,t.innerHTML=`
          <i class="bi bi-diagram-3"></i>
          Tema cargado desde Ruta: <strong>${i.nombre.replace(/</g,`&lt;`)}</strong>
          <button onclick="this.parentElement.remove()" style="
            margin-left:auto;background:none;border:none;cursor:pointer;
            font-size:12px;color:#1d4ed8;
          ">✕</button>
        `,c.parentElement.insertBefore(t,c)}},destroy(){r=!0}}}var K={async getClasses(t=null){let n=e.from(`plan_clases`).select(`*`).eq(`activo`,!0);t&&(n=n.eq(`maestro_id`,t));let{data:r,error:i}=await n.order(`nombre`);return i?(console.error(`Error loading classes:`,i),[]):r},async resolveSmartPlan(e,t=null){let n=await this.getClasses(t||e.maestro_id);if(!n.length)return null;let r=n.find(t=>t.clase_id===e.id);if(r)return r;let i=(e.nombre||``).toLowerCase(),a=(e.instrumento||``).toLowerCase();return r=n.find(e=>(e.nombre||``).toLowerCase()===i),r||a&&(r=n.find(e=>(e.nombre||``).toLowerCase().includes(a)),r)?r:(r=n.find(e=>{let t=(e.nombre||``).toLowerCase();return i.includes(t)||t.includes(i)}),r||n[0])},async addClass(t,n=null,r=null){let i={nombre:t};n&&(i.maestro_id=n),r&&(i.clase_id=r);let{data:a,error:o}=await e.from(`plan_clases`).insert([i]).select().single();if(o)throw o;return a},async updateClass(t,n){let{error:r}=await e.from(`plan_clases`).update({nombre:n}).eq(`id`,t);if(r)throw r},async deleteClass(t){let{error:n}=await e.from(`plan_clases`).delete().eq(`id`,t);if(n)throw n},async getLevelsByClass(t){let{data:n,error:r}=await e.from(`plan_niveles`).select(`*`).eq(`clase_id`,t).order(`numero_nivel`,{ascending:!0});return r?(console.error(`Error loading levels:`,r),[]):n},async addLevel({clase_id:t,nombre:n,numero_nivel:r}){let{data:i,error:a}=await e.from(`plan_niveles`).insert([{clase_id:t,nombre:n,numero_nivel:r||1}]).select().single();if(a)throw a;return i},async updateLevel(t,n){let{error:r}=await e.from(`plan_niveles`).update(n).eq(`id`,t);if(r)throw r},async deleteLevel(t){let{error:n}=await e.from(`plan_niveles`).delete().eq(`id`,t);if(n)throw n},async getNodesByLevel(t){let{data:n,error:r}=await e.from(`plan_temas`).select(`*`).eq(`nivel_id`,t).order(`orden_index`);return r?(console.error(`Error loading topics:`,r),[]):n},async addNode({nivel_id:t,nombre:n,tipo:r}){let{data:i,error:a}=await e.from(`plan_temas`).insert([{nivel_id:t,nombre:n,tipo:r||`TECNICA`}]).select().single();if(a)throw a;return i},async updateNode(t,n){let{error:r}=await e.from(`plan_temas`).update(n).eq(`id`,t);if(r)throw r},async deleteNode(t){let{error:n}=await e.from(`plan_temas`).delete().eq(`id`,t);if(n)throw n},async getObjectivesByNode(t){let{data:n,error:r}=await e.from(`plan_objetivos`).select(`*`).eq(`tema_id`,t).order(`orden_index`);return r?(console.error(`Error loading objectives:`,r),[]):n},async addObjective({tema_id:t,nombre:n}){let{data:r,error:i}=await e.from(`plan_objetivos`).insert([{tema_id:t,nombre:n}]).select().single();if(i)throw i;return r},async updateObjective(t,n){let{error:r}=await e.from(`plan_objetivos`).update({nombre:n}).eq(`id`,t);if(r)throw r},async deleteObjective(t){let{error:n}=await e.from(`plan_objetivos`).delete().eq(`id`,t);if(n)throw n},async getIndicatorsByObjective(t){let{data:n,error:r}=await e.from(`plan_indicadores`).select(`*`).eq(`objetivo_id`,t).order(`orden_index`);return r?(console.error(`Error loading indicators:`,r),[]):n},async addIndicator({objetivo_id:t,descripcion:n,es_requerido:r}){let{data:i,error:a}=await e.from(`plan_indicadores`).insert([{objetivo_id:t,descripcion:n,es_requerido:r??!0}]).select().single();if(a)throw a;return i},async updateIndicator(t,n){let{error:r}=await e.from(`plan_indicadores`).update(n).eq(`id`,t);if(r)throw r},async deleteIndicator(t){let{error:n}=await e.from(`plan_indicadores`).delete().eq(`id`,t);if(n)throw n},async updateIndicatorCalificacion(t,n){let{error:r}=await e.from(`plan_indicadores`).update({calificacion:n}).eq(`id`,t);if(r)throw r},async getRouteHierarchy(t,n=null){let r=t;if(!r){let e=await this.getClasses(n);if(e.length>0)r=e[0].id;else return null}let{data:i,error:a}=await e.from(`plan_niveles`).select(`
        *,
        plan_temas (
          *,
          plan_objetivos (
            *,
            plan_indicadores (*)
          )
        )
      `).eq(`clase_id`,r).order(`numero_nivel`);return a?(console.error(`Error loading hierarchy:`,a),null):i},async importStructure(t,n){if(!t||!n)throw Error(`Faltan datos para la importación.`);console.log(`[Adapter] Iniciando importación masiva optimizada (4 niveles) para clase: ${t}`);for(let r of n.niveles||[]){let{data:n,error:i}=await e.from(`plan_niveles`).insert([{clase_id:t,nombre:r.nombre,numero_nivel:r.numero_nivel||1,objetivo_general:r.objetivo_general}]).select().single();if(i)throw i;let a=(r.temas||[]).map(e=>({nivel_id:n.id,nombre:e.nombre,tipo:e.tipo||`TECNICA`,es_critico:e.es_critico||!1,_originalRef:e}));if(!a.length)continue;let{data:o,error:s}=await e.from(`plan_temas`).insert(a.map(({_originalRef:e,...t})=>t)).select();if(s)throw s;for(let t=0;t<o.length;t++){let n=o[t],r=a[t]._originalRef.objetivos||[];if(!r.length)continue;let i=r.map(e=>({tema_id:n.id,nombre:e.nombre||e,_originalRef:e})),{data:s,error:c}=await e.from(`plan_objetivos`).insert(i.map(({_originalRef:e,...t})=>t)).select();if(c)throw c;let l=[];if(s.forEach((e,t)=>{let n=i[t]._originalRef;n.indicadores&&n.indicadores.length>0&&n.indicadores.forEach(t=>{l.push({objetivo_id:e.id,descripcion:t.descripcion,es_requerido:t.es_requerido??!0})})}),l.length>0){let{error:t}=await e.from(`plan_indicadores`).insert(l);if(t)throw t}}}return console.log(`[Adapter] Importación masiva (4 niveles) completada con éxito.`),!0}};function ot(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function st(e,{claseId:t,rutaId:n,completedTopics:r=[],onIndicadorSelect:i}){let a=[],o=!1,s=null,c=document.createElement(`div`);if(c.className=`pm-route-bar-wrapper`,e.appendChild(c),!document.getElementById(`pm-route-bar-styles`)){let e=document.createElement(`style`);e.id=`pm-route-bar-styles`,e.textContent=`
      .pm-route-bar-wrapper { margin: 0.5rem 1rem; background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 12px; overflow: hidden; }
      .pm-tree-node { padding: 0.75rem 1rem; border-bottom: 1px solid var(--pm-border); cursor: pointer; transition: background 0.2s; }
      .pm-tree-node:hover { background: var(--pm-surface-2); }
      .pm-tree-node.active { border-left: 4px solid var(--pm-primary); background: rgba(var(--pm-primary-rgb), 0.05); }
      .pm-tree-header { display: flex; align-items: center; justify-content: space-between; }
      .pm-tree-title { font-weight: 700; font-size: 0.85rem; color: var(--pm-text); }
      .pm-tree-badge { font-size: 0.65rem; background: var(--pm-primary-light); color: var(--pm-primary); padding: 2px 6px; border-radius: 4px; font-weight: 800; }
      .pm-tree-children { padding-left: 1rem; background: var(--pm-surface-2); display: none; }
      .pm-tree-node.expanded + .pm-tree-children { display: block; }
      .pm-tree-obj { padding: 0.5rem 1rem; font-size: 0.8rem; color: var(--pm-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
      .pm-tree-obj:hover { color: var(--pm-primary); background: rgba(var(--pm-primary-rgb), 0.03); }
      .pm-tree-icon { width: 24px; height: 24px; border-radius: 50%; background: var(--pm-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
    `,document.head.appendChild(e)}function l(e){let t=e.target.closest(`[data-type="node"]`);if(t){t.classList.toggle(`expanded`);return}let n=e.target.closest(`[data-type="obj"]`);if(n){let e=n.dataset.id,t=n.dataset.nombre;s={id:e,nombre:t},i?.({id:e,nombre:t}),u()}}c.addEventListener(`click`,l);function u(){if(o){c.innerHTML=`<div style="padding:1rem; text-align:center; font-size:0.8rem; color:var(--pm-text-muted);">Cargando ruta...</div>`;return}if(!a||a.length===0){c.innerHTML=`<div style="padding:1rem; text-align:center; font-size:0.8rem; color:var(--pm-text-muted);">No hay objetivos configurados para esta clase.</div>`;return}c.innerHTML=a.map(e=>`
      <div class="pm-tree-level">
        <div style="background:var(--pm-surface-2); padding: 0.4rem 1rem; font-size:0.7rem; font-weight:800; color:var(--pm-primary); text-transform:uppercase; letter-spacing:0.5px;">
          ${ot(e.nombre)}
        </div>
        ${(e.plan_temas||[]).map(e=>`
          <div class="pm-tree-node" data-type="node">
            <div class="pm-tree-header">
              <span class="pm-tree-title">${ot(e.nombre)}</span>
              <span class="pm-tree-badge">${e.tipo}</span>
            </div>
          </div>
          <div class="pm-tree-children">
            ${(e.plan_objetivos||[]).map(e=>{let t=(r||[]).includes(e.nombre);return`
                <div class="pm-tree-obj" data-type="obj" data-id="${e.id}" data-nombre="${ot(e.nombre)}">
                  <i class="bi ${t?`bi-check-circle-fill text-success`:s?.id===e.id?`bi-circle-fill text-primary`:`bi-circle`}"></i>
                  <span style="${t?`text-decoration: line-through; opacity: 0.6;`:``}">${ot(e.nombre)}</span>
                </div>
              `}).join(``)}
          </div>
        `).join(``)}
      </div>
    `).join(``)}async function d(){if(n){o=!0,u();try{a=await K.getRouteHierarchy(n)}catch(e){console.error(`[routeTreeBar] Error:`,e)}finally{o=!1,u()}}}function f(){c.removeEventListener(`click`,l),c.remove()}function p(){return s}return d(),{refresh:d,destroy:f,getActiveIndicador:p}}var q={activeClassId:null,activeLevelId:null,activeNodeId:null,activeObjectiveId:null};async function ct(e,t=null){t&&(q.activeClassId=t),e.innerHTML=`
    <div class="pm-rc-container">
      <div class="pm-rc-col" id="pm-rc-classes-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-levels-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-nodes-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-objs-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-inds-wrapper"></div>
    </div>
    <style>
      .pm-rc-container { display: flex; gap: 0; height: 600px; border: 1px solid var(--pm-border); border-radius: 12px; overflow-x: auto; background: var(--pm-surface-2); box-shadow: var(--pm-shadow-sm); }
      .pm-rc-col { flex: 1; min-width: 160px; display: flex; flex-direction: column; border-right: 1px solid var(--pm-border); background: var(--pm-surface); }
      .pm-rc-col:last-child { border-right: none; }
      
      .pm-rc-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid var(--pm-border); background: rgba(255,255,255,0.05); }
      .pm-rc-header h4 { margin: 0; font-size: 0.7rem; font-weight: 800; color: var(--pm-primary); text-transform: uppercase; letter-spacing: 0.8px; }
      
      .pm-rc-btn-add { background: var(--pm-primary); border: none; color: white; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .pm-rc-btn-add:hover { transform: scale(1.1); background: var(--pm-primary-dark); }
      .pm-rc-btn-add i { font-size: 0.9rem; }

      .pm-rc-list { flex: 1; overflow-y: auto; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem; }
      
      .pm-rc-item { padding: 0.7rem 0.9rem; border-radius: 10px; cursor: pointer; border: 1px solid var(--pm-border); transition: all 0.2s; position: relative; display: flex; flex-direction: column; background: var(--pm-surface-3); }
      .pm-rc-item:hover { background: var(--pm-surface-2); border-color: var(--pm-primary); transform: translateX(2px); }
      .pm-rc-item.active { background: var(--pm-primary); border-color: var(--pm-primary); color: white; box-shadow: 0 4px 12px rgba(var(--pm-primary-rgb), 0.3); }
      .pm-rc-item.active .pm-rc-item-sub { color: rgba(255,255,255,0.8); }
      
      .pm-rc-actions { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: none; gap: 4px; }
      .pm-rc-item:hover .pm-rc-actions { display: flex; }
      .pm-rc-btn-action { background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 6px; padding: 4px; font-size: 0.7rem; cursor: pointer; color: var(--pm-text); display: flex; align-items: center; justify-content: center; }
      .pm-rc-btn-action:hover { color: var(--pm-primary); border-color: var(--pm-primary); background: white; }

      .pm-rc-item-text { font-size: 0.85rem; font-weight: 600; line-height: 1.3; word-break: break-word; padding-right: 35px; color: inherit; }
      .pm-rc-item-sub { font-size: 0.65rem; color: var(--pm-text-muted); margin-top: 4px; }
      
      .pm-rc-empty { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; color: var(--pm-text-muted); text-align: center; font-size: 0.8rem; font-style: italic; opacity: 0.6; }
      .pm-rc-ind-card { padding: 0.8rem; border-radius: 10px; border: 1px solid var(--pm-border); font-size: 0.8rem; background: var(--pm-surface-3); display: flex; gap: 0.6rem; color: var(--pm-text); }
      .pm-rc-ind-card i { color: var(--pm-primary); font-size: 1rem; }

      @media (max-width: 768px) {
        .pm-rc-container { flex-direction: column; height: auto; overflow-x: hidden; border-radius: 8px; }
        .pm-rc-col { min-width: 0; border-right: none; border-bottom: 1px solid var(--pm-border); max-height: 300px; }
        .pm-rc-col:last-child { border-bottom: none; }
        .pm-rc-list { max-height: 220px; }
      }
    </style>
  `,await dt()}async function lt(e,t,n,r){D.open({title:`Editar ${e}`,body:`
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del ${e}</label>
        <textarea id="edit-item-content" class="pm-input" style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none; transition:border-color 0.2s;">${h(n)}</textarea>
        <p class="pm-help-text" style="font-size:0.65rem; margin-top:8px; color:var(--pm-text-muted); line-height:1.4;">
          <i class="bi bi-info-circle me-1"></i> Esta modificación afectará a todas las instancias donde se utilice este ${e.toLowerCase()}.
        </p>
      </div>
    `,onSave:async n=>{let i=n.querySelector(`#edit-item-content`).value.trim();if(!i)return!1;try{switch(e){case`Clase`:await K.updateClass(t,i);break;case`Nivel`:await K.updateLevel(t,{nombre:i});break;case`Tema`:await K.updateNode(t,{nombre:i});break;case`Objetivo`:await K.updateObjective(t,i);break;case`Indicador`:await K.updateIndicator(t,{descripcion:i});break}return r(),!0}catch(e){return console.error(`Error saving change:`,e),alert(`Error al guardar: `+(e.message||`Error desconocido`)),!1}},onDelete:async()=>{try{switch(e){case`Clase`:await K.deleteClass(t);break;case`Nivel`:await K.deleteLevel(t);break;case`Tema`:await K.deleteNode(t);break;case`Objetivo`:await K.deleteObjective(t);break;case`Indicador`:await K.deleteIndicator(t);break}return r(),!0}catch(e){return console.error(`Error deleting item:`,e),alert(`No se pudo eliminar: `+(e.message||`Error de base de datos`)),!1}}})}async function ut(e,n,r){if(!n&&e!==`Clase`){alert(`Primero seleccioná el elemento superior para agregar un ${e}`);return}D.open({title:`Agregar Nuevo ${e}`,body:`
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del Nuevo ${e}</label>
        <textarea id="new-item-content" class="pm-input" placeholder="Escribí aquí..." style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none;"></textarea>
      </div>
    `,onSave:async i=>{let a=i.querySelector(`#new-item-content`).value.trim();if(!a)return!1;try{switch(e){case`Clase`:{let e=t();await K.addClass(a,e?e.id:null);break}case`Nivel`:await K.addLevel({clase_id:n,nombre:a,numero_nivel:1});break;case`Tema`:await K.addNode({nivel_id:n,nombre:a,tipo:`TECNICA`});break;case`Objetivo`:await K.addObjective({tema_id:n,nombre:a});break;case`Indicador`:await K.addIndicator({objetivo_id:n,descripcion:a,es_requerido:!0});break}return r(),!0}catch(e){return console.error(`Error adding item:`,e),alert(`No se pudo crear: `+(e.message||`Error de base de datos`)),!1}}})}async function dt(){let e=document.getElementById(`pm-rc-classes-wrapper`),n=t(),r=await K.getClasses(n?n.id:null);!r.some(e=>e.id===q.activeClassId)&&r.length>0?q.activeClassId=r[0].id:r.length===0&&(q.activeClassId=null),e.innerHTML=`
    <div class="pm-rc-header">
      <h4>1. Clase</h4> 
      <button class="pm-rc-btn-add" id="btn-add-class" title="Agregar Clase"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${r.map(e=>`
        <div class="pm-rc-item ${q.activeClassId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${h(e.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,e.querySelector(`#btn-add-class`).onclick=()=>ut(`Clase`,null,()=>dt()),q.activeClassId?ft(q.activeClassId):J(`#pm-rc-levels-wrapper`,`Elegí Clase`),e.querySelectorAll(`.pm-rc-item`).forEach(e=>{let t=e.dataset.id;e.querySelector(`.btn-edit`).onclick=n=>{n.stopPropagation(),lt(`Clase`,t,e.querySelector(`.pm-rc-item-text`).innerText,()=>dt())},e.onclick=()=>{q.activeClassId=t,q.activeLevelId=q.activeNodeId=q.activeObjectiveId=null,dt(),ft(t),J(`#pm-rc-nodes-wrapper`,`Elegí Nivel`),J(`#pm-rc-objs-wrapper`,`Elegí Tema`),J(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function ft(e){let t=document.getElementById(`pm-rc-levels-wrapper`),n=await K.getLevelsByClass(e);!n.some(e=>e.id===q.activeLevelId)&&n.length>0?q.activeLevelId=n[0].id:n.length===0&&(q.activeLevelId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>2. Nivel</h4> 
      <button class="pm-rc-btn-add" id="btn-add-level" title="Agregar Nivel"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${q.activeLevelId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${h(e.nombre)}</span>
          <span class="pm-rc-item-sub">Nivel ${e.numero_nivel}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-level`).onclick=()=>ut(`Nivel`,e,()=>ft(e)),q.activeLevelId?pt(q.activeLevelId):J(`#pm-rc-nodes-wrapper`,`Elegí Nivel`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),lt(`Nivel`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>ft(e))},t.onclick=()=>{q.activeLevelId=n,q.activeNodeId=q.activeObjectiveId=null,ft(e),pt(n),J(`#pm-rc-objs-wrapper`,`Elegí Tema`),J(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function pt(e){let t=document.getElementById(`pm-rc-nodes-wrapper`),n=await K.getNodesByLevel(e);!n.some(e=>e.id===q.activeNodeId)&&n.length>0?q.activeNodeId=n[0].id:n.length===0&&(q.activeNodeId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>3. Tema</h4> 
      <button class="pm-rc-btn-add" id="btn-add-node" title="Agregar Tema"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${q.activeNodeId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${h(e.nombre)}</span>
          <span class="pm-rc-item-badge" style="font-size:0.5rem;background:var(--pm-surface-3);padding:1px 4px;border-radius:3px;margin-top:2px;align-self:flex-start;">${e.tipo}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-node`).onclick=()=>ut(`Tema`,e,()=>pt(e)),q.activeNodeId?mt(q.activeNodeId):J(`#pm-rc-objs-wrapper`,`Elegí Tema`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),lt(`Tema`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>pt(e))},t.onclick=()=>{q.activeNodeId=n,q.activeObjectiveId=null,pt(e),mt(n),J(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function mt(e){let t=document.getElementById(`pm-rc-objs-wrapper`),n=await K.getObjectivesByNode(e);!n.some(e=>e.id===q.activeObjectiveId)&&n.length>0?q.activeObjectiveId=n[0].id:n.length===0&&(q.activeObjectiveId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>4. Objetivo</h4> 
      <button class="pm-rc-btn-add" id="btn-add-obj" title="Agregar Objetivo"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${q.activeObjectiveId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${h(e.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-obj`).onclick=()=>ut(`Objetivo`,e,()=>mt(e)),q.activeObjectiveId?_t(q.activeObjectiveId):J(`#pm-rc-inds-wrapper`,`Elegí Objetivo`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),lt(`Objetivo`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>mt(e))},t.onclick=()=>{q.activeObjectiveId=n,mt(e),_t(n)}})}var ht={0:`Sin eval.`,1:`Inicial`,2:`En desarrollo`,3:`Logrado`,4:`Destacado`,5:`Superado`},gt={0:`var(--pm-text-muted)`,1:`#ef4444`,2:`#f97316`,3:`#22c55e`,4:`#06b6d4`,5:`#8b5cf6`};async function _t(e){let t=document.getElementById(`pm-rc-inds-wrapper`);t.innerHTML=`
    <div class="pm-rc-header">
      <h4>5. Indicador</h4> 
      <button class="pm-rc-btn-add" id="btn-add-ind" title="Agregar Indicador"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${(await K.getIndicatorsByObjective(e)).map(e=>`
        <div class="pm-rc-ind-card" style="position:relative;flex-direction:column;gap:0.5rem;">
          <div style="display:flex;align-items:flex-start;gap:0.6rem;width:100%;">
            <i class="bi ${e.es_requerido?`bi-check-circle-fill`:`bi-circle`}" style="margin-top:2px;"></i>
            <span class="ind-text" style="flex:1;">${h(e.descripcion)}</span>
            <div class="pm-rc-actions" style="display:flex;opacity:0.6;position:static;transform:none;">
              <button class="pm-rc-btn-action btn-edit-ind" data-id="${e.id}"><i class="bi bi-pencil"></i></button>
            </div>
          </div>
          <div class="pm-rc-calif-row" style="display:flex;gap:4px;padding-left:1.6rem;" data-indicator-id="${e.id}">
            ${[1,2,3,4,5].map(t=>`
              <button class="pm-rc-calif-btn" data-calif="${t}" style="
                width:28px;height:28px;border-radius:50%;border:2px solid ${gt[t]};
                background:${e.calificacion===t?gt[t]:`transparent`};
                color:${e.calificacion===t?`#fff`:gt[t]};
                font-size:0.65rem;font-weight:700;cursor:pointer;transition:all 0.15s;
                display:flex;align-items:center;justify-content:center;
              " title="${ht[t]}">${t}</button>
            `).join(``)}
            ${e.calificacion>0?`
              <button class="pm-rc-calif-clear" data-calif="0" style="
                width:28px;height:28px;border-radius:50%;border:2px solid transparent;
                background:transparent;color:var(--pm-text-muted);font-size:0.75rem;
                cursor:pointer;transition:all 0.15s;margin-left:2px;
              " title="Limpiar">✕</button>
            `:``}
            <span style="font-size:0.6rem;color:${gt[e.calificacion]||`var(--pm-text-muted)`};margin-left:auto;align-self:center;font-weight:600;">
              ${ht[e.calificacion]||ht[0]}
            </span>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-ind`).onclick=()=>ut(`Indicador`,e,()=>_t(e)),t.querySelectorAll(`.btn-edit-ind`).forEach(t=>{t.onclick=n=>{n.stopPropagation();let r=t.dataset.id,i=t.closest(`.pm-rc-ind-card`).querySelector(`.ind-text`).innerText;lt(`Indicador`,r,i,()=>_t(e))}}),t.querySelectorAll(`.pm-rc-calif-btn, .pm-rc-calif-clear`).forEach(t=>{t.onclick=async n=>{n.stopPropagation();let r=t.closest(`.pm-rc-calif-row`).dataset.indicatorId,i=parseInt(t.dataset.calif,10);try{await K.updateIndicatorCalificacion(r,i),_t(e)}catch(e){console.error(`Error updating calificacion:`,e)}}})}function J(e,t){let n=document.querySelector(e);n&&(n.innerHTML=`<div class="pm-rc-empty">${t}</div>`)}function vt(e,t){let n=null,i=null,a=[],o=e.querySelector(`#pm-planificacion-card`),s=e.querySelector(`#pm-planificacion-dropdown`),c=e.querySelector(`#pm-planificacion-nombre`),l=e.querySelector(`#pm-plan-list-rutas`),u=e.querySelector(`#pm-plan-list-planificaciones`),d=e.querySelector(`#pm-planificacion-header`),p=e.querySelector(`#btn-copy-as-plan`);d&&d.addEventListener(`click`,()=>{let e=o.classList.toggle(`open`);s.style.display=e?`block`:`none`}),e.querySelectorAll(`.pm-plan-tab-pill`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-plan-tab-pill`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`);let n=t.dataset.tab;l.style.display=n===`rutas`?``:`none`,u.style.display=n===`planificaciones`?``:`none`})});function m(r){n=r.id,localStorage.setItem(`pm_default_plan_${t.claseId}`,r.id),c&&(c.textContent=r.nombre||r.name||`Sin nombre`),u.querySelectorAll(`.pm-plan-item`).forEach(e=>{e.classList.toggle(`active`,e.dataset.planId===r.id)}),_();let l=e.querySelector(`#pm-route-tree-container`),d=e.querySelector(`#pm-active-tema-badge`);n&&l&&(l.innerHTML=``,yt(t.claseId).then(e=>{i=st(l,{claseId:t.claseId,rutaId:n,completedTopics:e,onIndicadorSelect:e=>{t.onIndicadorSelect?.(e),d&&(d.textContent=e.nombre,d.style.display=`inline-block`),o.classList.remove(`open`),s.style.display=`none`}}),a.push(()=>i.destroy())}))}let g=e.querySelector(`#btn-manage-planning`);g&&(g.onclick=e=>{if(e.stopPropagation(),!n){D.open({title:`Atención`,body:`<p>Seleccioná una planificación primero para poder gestionarla.</p>`,confirmText:`Entendido`,hideCancel:!0});return}D.open({title:`Gestionar Estructura: ${c.textContent}`,size:`xl`,body:`<div id="modal-route-config-root"></div>`,saveText:`Cerrar y Actualizar`,onSave:async()=>(i&&i.refresh(),!0)});let t=document.getElementById(`modal-route-config-root`);t&&ct(t,n)}),o&&(async()=>{try{let e=await K.getClasses(t.maestro?t.maestro.id:null),n=localStorage.getItem(`pm_default_plan_${t.claseId}`),r=(t.clase.instrumento||``).toLowerCase().split(`,`).map(e=>e.trim()),i=e.filter(e=>{if(e.id===n)return!0;let t=(e.nombre||``).toLowerCase();return r.some(e=>t.includes(e))});l&&(l.innerHTML=i.length?i.map(e=>`
              <div class="pm-plan-item ${e.id===n?`active`:``}" data-plan-id="${e.id}">
                <span class="pm-plan-item-icon">📍</span>
                <span class="pm-plan-item-name">${h(e.nombre||`Ruta sin nombre`)}</span>
                ${e.id===n?`<span class="pm-tree-badge">ACTIVA</span>`:``}
              </div>`).join(``):`<div style="padding:0.5rem;font-size:0.8rem;color:var(--pm-text-muted)">No hay planes sugeridos para este instrumento</div>`,l.querySelectorAll(`.pm-plan-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=i.find(t=>t.id===e.dataset.planId);t&&m(t)})})),u&&(u.innerHTML=e.map(e=>`
            <div class="pm-plan-item" data-plan-id="${e.id}">
              <span class="pm-plan-item-icon">📚</span>
              <span class="pm-plan-item-name">${h(e.nombre||e.name)}</span>
            </div>`).join(``),u.querySelectorAll(`.pm-plan-item`).forEach(t=>{t.addEventListener(`click`,()=>{let n=e.find(e=>e.id===t.dataset.planId);n&&m(n)})})),o.style.display=``;let a=e.find(e=>e.id===n)||i[0]||await K.resolveSmartPlan(t.clase);a&&m(a)}catch(e){console.warn(`[asistencia] Error cargando planificación unificada:`,e)}})(),p&&p.addEventListener(`click`,async()=>{let e=t.getDslContent();A(`create`,null,await r(),[],{clase_id:t.claseId,maestro_id:t.maestro?.id||null,maestro_nombre:t.maestro?.nombre_completo||null,contenido:e||``,fecha_inicio:t.fechaHoy},async e=>{try{await ee({...e,estado:`planificado`});let t=document.createElement(`div`);t.className=`pm-toast-success`,t.innerHTML=`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Planificación creada exitosamente
          `,document.body.appendChild(t),setTimeout(()=>t.remove(),3e3)}catch(e){console.error(`[asistencia] Error guardando planificación:`,e),f.error(`Error al guardar la planificación: `+(e.message||e))}})}),t.rutaId&&(i=st(e.querySelector(`#pm-route-tree-container`),{claseId:t.claseId,rutaId:t.rutaId,onIndicadorSelect:e=>{t.onIndicadorSelect?.(e)}}),a.push(()=>i.destroy()));function _(){i&&=(i.destroy(),null)}function v(){_(),a.forEach(e=>{try{e()}catch{}}),a.length=0}return{destroy:v,getActiveIndicador:()=>i?.getActiveIndicador()||null,refreshTree:async()=>{i&&await i.refresh()},getActivePlanificacionId:()=>n}}async function yt(t){try{let{data:n}=await e.from(`sesiones_clase`).select(`contenido`).eq(`clase_id`,t).not(`contenido`,`is`,null);if(!n)return[];let r=new Set,i=/\[(.*?)\]/g;return n.forEach(e=>{if(!e.contenido)return;let t;for(;(t=i.exec(e.contenido))!==null;)t[1]&&r.add(t[1].trim())}),Array.from(r)}catch(e){return console.warn(`[asistencia] Error calculando progreso histórico:`,e),[]}}var Y=null,X=[],bt=null,Z=-1,xt=!1,St=null,Ct=!1,wt=0,Tt=0;function Et(){if(!Y){if(Y=document.createElement(`div`),Y.id=`pm-autocomplete-popup`,Y.className=`pm-autocomplete-popup`,Y.style.cssText=`
    position: fixed;
    display: none;
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border, #ddd);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    z-index: 9999;
    min-width: 280px;
    max-width: 360px;
    max-height: 280px;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: pm-ac-fadein 0.15s ease-out;
    user-select: none;
  `,!document.getElementById(`pm-ac-styles`)){let e=document.createElement(`style`);e.id=`pm-ac-styles`,e.textContent=`
      @keyframes pm-ac-fadein {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pm-ac-option {
        padding: 10px 14px;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border, #eee);
        transition: background 0.1s;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .pm-ac-option:last-child { border-bottom: none; }
      .pm-ac-option:hover, .pm-ac-option.selected {
        background: var(--pm-primary-light, #f0f4ff);
      }
      .pm-ac-option.selected {
        background: var(--pm-primary, #007aff);
        color: white;
      }
      .pm-ac-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--pm-surface-2, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      .pm-ac-option.selected .pm-ac-icon {
        background: rgba(255,255,255,0.2);
      }
      .pm-ac-text {
        flex: 1;
        min-width: 0;
      }
      .pm-ac-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--pm-text, #333);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-label {
        color: white;
      }
      .pm-ac-sublabel {
        font-size: 12px;
        color: var(--pm-text-muted, #888);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-sublabel {
        color: rgba(255,255,255,0.7);
      }
      .pm-ac-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--pm-primary-light, #e8f0ff);
        color: var(--pm-primary, #007aff);
        font-weight: 600;
      }
      .pm-ac-option.selected .pm-ac-badge {
        background: rgba(255,255,255,0.2);
        color: white;
      }
      .pm-ac-header {
        padding: 8px 14px;
        font-size: 11px;
        color: var(--pm-text-muted, #888);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--pm-border, #eee);
        background: var(--pm-surface-2, #fafafa);
      }
      .pm-ac-empty {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
      .pm-ac-loading {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
    `,document.head.appendChild(e)}document.body.appendChild(Y)}}function Dt(e,t,n={}){if(Et(),X=e||[],bt=t,St=n.trigger||null,Z=-1,xt=!0,Nt(e),n.position){let e=n.position,t=window.innerWidth,r=window.innerHeight,i=e.x,a=e.y+6;i+320>t-20&&(i=Math.max(10,e.x-320-10)),a+280>r-20&&(a=Math.max(10,e.y-280-10)),Y.style.left=`${i}px`,Y.style.top=`${a}px`}Y.onmousedown=Ot,document.addEventListener(`mousemove`,kt),document.addEventListener(`mouseup`,At),Y.style.display=`block`}function Ot(e){e.target.closest(`.pm-ac-option`)||(Ct=!0,wt=e.clientX-Y.offsetLeft,Tt=e.clientY-Y.offsetTop,Y.style.cursor=`grabbing`,Y.style.transition=`none`)}function kt(e){if(!Ct)return;let t=e.clientX-wt,n=e.clientY-Tt;Y.style.left=`${Math.max(0,t)}px`,Y.style.top=`${Math.max(0,n)}px`}function At(){Ct&&(Ct=!1,Y.style.cursor=``)}function jt(){Y&&(Y.style.display=`none`,Ct=!1,document.removeEventListener(`mousemove`,kt),document.removeEventListener(`mouseup`,At)),X=[],bt=null,Z=-1,xt=!1,St=null}function Mt(e){X=e||[],Z=-1,Nt(e)}function Nt(e){if(!Y)return;if(!e||e.length===0){Y.innerHTML=`
      <div class="pm-ac-empty">
        <span>No hay opciones disponibles</span>
      </div>
    `;return}let t=`<div class="pm-ac-header">${Lt(St)}</div>`;e.forEach((e,n)=>{let r=e.nombre||e.name||e.label||e.description||``,i=e.instrumento||e.descripcion||e.codigo||e.type||``,a=n===Z,o=Rt(St,e),s=e.is_historial?`<span class="pm-ac-badge">Reciente</span>`:``;t+=`
      <div class="pm-ac-option ${a?`selected`:``}" data-index="${n}">
        <div class="pm-ac-icon">${o}</div>
        <div class="pm-ac-text">
          <div class="pm-ac-label">${Bt(r)}</div>
          ${i?`<div class="pm-ac-sublabel">${Bt(i)}</div>`:``}
        </div>
        ${s}
      </div>
    `}),Y.innerHTML=t,Y.querySelectorAll(`.pm-ac-option`).forEach(e=>{e.addEventListener(`click`,()=>{Pt(parseInt(e.dataset.index,10))})})}function Pt(e){if(e>=0&&e<X.length){let t=X[e];bt&&bt(t),jt()}}function Ft(e){if(!(!xt||X.length===0))switch(e.key){case`ArrowDown`:e.preventDefault(),Z=Math.min(Z+1,X.length-1),Nt(X),It();break;case`ArrowUp`:e.preventDefault(),Z=Math.max(Z-1,0),Nt(X),It();break;case`Enter`:e.preventDefault(),Z>=0?Pt(Z):X.length>0&&Pt(0);break;case`Escape`:e.preventDefault(),jt();break;case`Tab`:X.length>0&&Z===-1&&(e.preventDefault(),Pt(0));break}}function It(){if(!Y||Z<0)return;let e=Y.querySelector(`.pm-ac-option[data-index="${Z}"]`);e&&e.scrollIntoView({block:`nearest`,behavior:`smooth`})}function Lt(e){switch(e){case`#`:return`👤 Alumnos`;case`[`:return`📚 Contenidos`;case`(`:return`💡 Sugerencias`;case`{`:return`📝 Tareas`;case`$`:return`🎯 Medidas`;case`>`:return`🎓 Objetivos`;default:return`Opciones`}}function Rt(e,t){if(e===`#`){let e=t.nombre||t.name||``;return t.value===`todos`||e.toLowerCase()===`todos`?`👥`:e.charAt(0).toUpperCase()}return e===`$`?`🎯`:e===`>`&&t.level_number?t.level_number:e===`>`&&t.type?zt(t.type):`•`}function zt(e){return{ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`}[e]||`•`}function Bt(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function Vt(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0).getBoundingClientRect();return{x:t.left,y:t.bottom}}function Ht(){return xt}function Ut(){return Z}var Wt={show:Dt,hide:jt,updateOptions:Mt,handleKeyDown:Ft,getCursorPosition:Vt,isOpen:Ht,getSelectedIndex:Ut},Gt=`portal-maestros-catalogs`,Kt=1,qt={alumnos:{ttl:1440*60*1e3},contenidos:{ttl:10080*60*1e3},medidas:{ttl:720*60*60*1e3},sugerencias:{ttl:720*60*60*1e3},tareas:{ttl:720*60*60*1e3},nodos:{ttl:10080*60*1e3},niveles:{ttl:10080*60*1e3},indicadores:{ttl:10080*60*1e3},historial:{ttl:null}},Jt=null;async function Q(){return Jt||(Jt=await s(Gt,Kt,{upgrade(e){for(let[t,n]of Object.entries(qt))if(!e.objectStoreNames.contains(t)){let n=e.createObjectStore(t,{keyPath:`id`});n.createIndex(`by_updated`,`updated_at`),t===`alumnos`&&n.createIndex(`by_clase`,`clase_id`)}}}),Jt)}async function Yt(e,t){let n=await Q(),r=await n.get(e,t);if(!r)return null;let i=qt[e];if(i?.ttl&&r.updated_at){let a=new Date(r.updated_at).getTime()+i.ttl;if(Date.now()>a)return await n.delete(e,t),null}return r}async function Xt(e){let t=await(await Q()).getAll(e),n=qt[e];if(!n?.ttl)return t;let r=Date.now();return t.filter(e=>e.updated_at?r<=new Date(e.updated_at).getTime()+n.ttl:!0)}async function Zt(e,t,n){return(await Q()).getAllFromIndex(e,t,n)}async function Qt(e,t){let n=await Q(),r={...t,updated_at:new Date().toISOString()};return await n.put(e,r),r}async function $t(e,t){let n=(await Q()).transaction(e,`readwrite`);for(let e of t)await n.store.put({...e,updated_at:new Date().toISOString()});await n.done}async function en(e,t){await(await Q()).delete(e,t)}async function tn(e){await(await Q()).clear(e)}async function nn(e){let t=await Q(),n=qt[e];if(!n?.ttl)return;let r=await t.getAll(e),i=Date.now();for(let a of r)a.updated_at&&i>new Date(a.updated_at).getTime()+n.ttl&&await t.delete(e,a.id)}async function rn(){let e=await Q();for(let t of Object.keys(qt))await e.clear(t)}async function an(e){return(await Xt(e)).length}async function on(e,t){let n=await Q(),r=new Date().toISOString(),i=await n.get(`historial`,e);i?(i.count=(i.count||0)+1,i.last_used=r,i.recent_selections=[t,...(i.recent_selections||[]).slice(0,9)],await n.put(`historial`,i)):await n.put(`historial`,{id:e,trigger:e,count:1,last_used:r,recent_selections:[t],updated_at:r})}async function sn(e){return(await Q()).get(`historial`,e)}async function cn(e,t=5){return(await(await Q()).getAll(`historial`)).filter(t=>t.trigger===e).sort((e,t)=>(t.count||0)-(e.count||0)).slice(0,t)}var $={get:Yt,getAll:Xt,getByIndex:Zt,set:Qt,setBulk:$t,remove:en,clear:tn,cleanExpired:nn,clearAll:rn,getStoreSize:an,addToHistorial:on,getHistorial:sn,getTopUsed:cn};async function ln(t){if(!t)return[];try{let{data:n,error:r}=await e.from(`alumnos_clases`).select(`alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).eq(`clase_id`,t).eq(`activo`,!0);if(r)throw r;if(n)return n.map(e=>e.alumnos).filter(Boolean).map(e=>({id:e.id,nombre:e.nombre_completo||``,instrumento:e.instrumento_principal}))}catch(e){console.warn(`[CatalogService] Error cargando alumnos:`,e)}return[]}async function un(){let t=await $.getAll(`contenidos`);if(t.length>0)return t;try{let{data:t,error:n}=await e.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`contenidos`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(n)throw n;if(t)return await $.setBulk(`contenidos`,t),t}catch(e){console.warn(`[CatalogService] Error cargando contenidos:`,e)}return[]}async function dn(){let t=await $.getAll(`medidas`);if(t.length>0)return t;try{let{data:t,error:n}=await e.from(`catalogos`).select(`id, nombre, codigo, categoria`).eq(`tipo`,`medidas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(n)throw n;if(t)return await $.setBulk(`medidas`,t),t}catch(e){console.warn(`[CatalogService] Error cargando medidas:`,e)}return[]}async function fn(){let t=await $.getAll(`sugerencias`);if(t.length>0)return t;try{let{data:t,error:n}=await e.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`sugerencias`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(n)throw n;if(t)return await $.setBulk(`sugerencias`,t),t}catch(e){console.warn(`[CatalogService] Error cargando sugerencias:`,e)}return[]}async function pn(){let t=await $.getAll(`tareas`);if(t.length>0)return t;try{let{data:t,error:n}=await e.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`tareas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(n)throw n;if(t)return await $.setBulk(`tareas`,t),t}catch(e){console.warn(`[CatalogService] Error cargando tareas:`,e)}return[]}async function mn(){let t=await $.getAll(`niveles`);if(t.length>0)return t;try{let{data:t}=await e.from(`routes`).select(`id`).eq(`instrument`,`violín`).eq(`status`,`published`).limit(1);if(!t||t.length===0)return[];let n=t[0].id,{data:r}=await e.from(`route_versions`).select(`id`).eq(`route_id`,n).eq(`status`,`published`).order(`version`,{ascending:!1}).limit(1);if(!r||r.length===0)return[];let i=r[0].id,{data:a,error:o}=await e.from(`levels`).select(`id, level_number, name, main_objective`).eq(`route_version_id`,i).order(`level_number`,{ascending:!0});if(o)throw o;if(a)return await $.setBulk(`niveles`,a),a}catch(e){console.warn(`[CatalogService] Error cargando niveles:`,e)}return[]}async function hn(t=null){let n=await $.getAll(`nodos`);if(t&&n.length>0){if(n=n.filter(e=>e.level_id===t),n.length>0)return n}else if(n.length>0)return n;try{let n=e.from(`nodes`).select(`id, name, type, is_critical, is_required, objective, level_id, order_index`);t&&(n=n.eq(`level_id`,t));let{data:r,error:i}=await n.order(`order_index`,{ascending:!0});if(i)throw i;if(r)return await $.setBulk(`nodos`,r),r}catch(e){console.warn(`[CatalogService] Error cargando nodos:`,e)}return[]}async function gn(e,t=``,n={}){let r=[];switch(e){case`#`:r=[{label:`todos`,value:`todos`,icon:`👥`,description:`Todos los presentes`}],r=r.concat(await ln(n.claseId));break;case`[`:r=await un();break;case`(`:r=await fn();break;case`{`:r=await pn();break;case`$`:r=await dn();break;case`>`:r=t.toUpperCase().startsWith(`NIVEL`)?await mn():await hn(n.nivelId);break;default:r=[]}if(t&&r.length>0&&(r=_n(r,t)),e&&e!==`#`){let t=(await $.getTopUsed(e,3)).flatMap(e=>e.recent_selections||[]).filter(Boolean).slice(0,3);for(let e of t)r.some(t=>(t.nombre||t.name||``).toLowerCase()===e.toLowerCase())||r.unshift({nombre:e,id:`hist-${e}`,is_historial:!0})}return r}function _n(e,t,n=`nombre`){if(!t)return e;let r=t.toLowerCase(),i=r.length;return e.map(e=>{let t=(e[n]||e.name||e.nombre||``).toLowerCase(),a=0;if(t.startsWith(r))a+=10;else if(t.includes(r))a+=5;else{let e=vn(t,r);if(e<=2&&i>3)a+=3-e;else return null}return t.length<20&&(a+=1),{...e,_score:a}}).filter(Boolean).sort((e,t)=>(t._score||0)-(e._score||0)).slice(0,15)}function vn(e,t){let n=[];for(let e=0;e<=t.length;e++)n[e]=[e];for(let t=0;t<=e.length;t++)n[0][t]=t;for(let r=1;r<=t.length;r++)for(let i=1;i<=e.length;i++)t.charAt(r-1)===e.charAt(i-1)?n[r][i]=n[r-1][i-1]:n[r][i]=Math.min(n[r-1][i-1]+1,n[r][i-1]+1,n[r-1][i]+1);return n[t.length][e.length]}async function yn(e,t){await $.addToHistorial(e,t)}var bn=`
  <div class="pm-dsl-placeholder-title">✨ Escribí lo que pasó en clase con tus propias palabras</div>
  <div class="pm-dsl-placeholder-example" style="font-style:italic;color:var(--pm-text-muted,#888);font-size:0.85rem;margin-bottom:6px">
    "Yereni y Santa avanzaron muy bien hoy con el cambio de posición. Santiago necesita practicar más el arco."
  </div>
  <div class="pm-dsl-placeholder-guide">
    Presioná <strong>✨ Analizar con IA</strong> y Groq va a extraer los avances automáticamente. · O usá los tokens del toolbar si preferís escribir directo: # alumno · [] contenido · {} tarea
  </div>
`;function xn(e,{initialContent:t=``,onChange:n,onAlumnosNeeded:r}){let i=t,a=!1,o=!1,s={};e.innerHTML=`
    <div class="pm-dsl-editor-container">
      <div
        id="pm-dsl-editable"
        class="pm-dsl-editable"
        contenteditable="true"
        spellcheck="false"
      ></div>
      <div class="pm-dsl-placeholder" id="pm-dsl-placeholder">${bn}</div>
      <button class="pm-dsl-help-toggle" id="pm-dsl-help-toggle" title="Mostrar/Ocultar ayuda" aria-label="Mostrar/Ocultar ayuda">?</button>
    </div>
  `;let c=e.querySelector(`#pm-dsl-editable`),l=e.querySelector(`#pm-dsl-placeholder`),u=e.querySelector(`#pm-dsl-help-toggle`),d=window.innerWidth>=768;function f(){let e=d&&i.trim()===``;l.style.display=e?`block`:`none`}f(),u&&u.addEventListener(`click`,e=>{e.stopPropagation(),d=!d,f(),u.classList.toggle(`active`,d)});let p=document.createElement(`div`);p.className=`dsl-tooltip`,e.appendChild(p);function m(){i=c.innerText,f(),n&&n(i)}c.addEventListener(`mouseover`,t=>{let n=t.target.closest(`.dsl-objetivo`);if(n){p.textContent=`Objetivo: ${n.dataset.objetivo}`,p.style.display=`block`;let t=n.getBoundingClientRect(),r=e.getBoundingClientRect();p.style.left=`${t.left-r.left}px`,p.style.top=`${t.top-r.top-25}px`}}),c.addEventListener(`mouseout`,()=>{p.style.display=`none`});function h(){if(!a&&!o){a=!0;try{let e=window.getSelection();if(!e||e.rangeCount===0)return;let t=E(c,e.getRangeAt(0));if(document.activeElement!==c||O)return;let n=window.scrollY;i=c.innerText,c.innerHTML=I(i),D(c,t),window.scrollY!==n&&window.scrollTo({top:n,behavior:`instant`})}catch(e){console.warn(`[DSL] Error en highlight:`,e),i=c.innerText}finally{a=!1}}}function g(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0),n=document.createRange();n.selectNodeContents(c),n.setEnd(t.endContainer,t.endOffset);let r=n.toString().match(/([#([{$>])\s*([^([{$]*)$/);return r?{trigger:r[1],query:r[2]||``}:null}let _=null;c.addEventListener(`mousedown`,()=>{_=null});function v(){let e=window.getSelection();!e||e.rangeCount===0||(_=E(c,e.getRangeAt(0)))}function y(){c.focus(),_!==null&&D(c,_)}let b=null;async function x(e=null){let t,n;if(e)t=e,n=``;else{let e=g();if(!e){Wt.hide();return}t=e.trigger,n=e.query}try{let e=await gn(t,n,s);if(e.length>0){let r=Vt();r&&(v(),Wt.show(e,e=>{S(e,t,n)},{trigger:t,position:r}))}else Wt.hide()}catch(e){console.warn(`[DSL] Error en autocompletado:`,e)}}function S(e,t,n){let r=w(e.nombre||e.name||e.label||e.descripcion||``),i=``;switch(t){case`#`:i=r;break;case`[`:i=r+`]`;break;case`(`:i=r+`)`;break;case`{`:i=r+`}`;break;case`$`:i=e.codigo||r;break;case`>`:i=e.level_number?`NIVEL-${e.level_number}`:e.type?`NODO:${e.type}`:r;break}y();let a=window.getSelection();if(!a||a.rangeCount===0){console.warn(`[DSL] Sin selección activa al insertar autocomplete`);return}if(n.length>0){let e=a.getRangeAt(0),t=document.createRange();t.selectNodeContents(c),t.setEnd(e.endContainer,e.endOffset);let r=t.toString(),i=r.length-n.length;try{let e=document.createRange();C(c,e,i,r.length),e.deleteContents()}catch(e){console.warn(`[DSL] Error limpiando query parcial:`,e)}}T(i+` `),yn(t,r)}function C(e,t,n,r){let i=0,a=[e],o=!1;for(;a.length>0;){let e=a.pop();if(e.nodeType===3){let a=i+e.length;if(!o&&n<=a&&(t.setStart(e,n-i),o=!0),o&&r<=a){t.setEnd(e,r-i);return}i=a}else for(let t=e.childNodes.length-1;t>=0;t--)a.push(e.childNodes[t])}}function w(e){if(!e)return``;let t=document.createElement(`div`);return t.innerHTML=e,t.textContent||t.innerText||``}function T(e){let t=w(e),n=window.getSelection();if(!n||n.rangeCount===0)return;let r=n.getRangeAt(0);r.deleteContents();let i=document.createTextNode(t);r.insertNode(i),r.setStartAfter(i),r.collapse(!0),n.removeAllRanges(),n.addRange(r),m(),h()}function E(e,t){let n=t.cloneRange();return n.selectNodeContents(e),n.setEnd(t.endContainer,t.endOffset),n.toString().length}function D(e,t){let n=document.createRange(),r=window.getSelection();if(!r)return;let i=0,a=[e],o,s=!1;for(;a.length>0&&!s;)if(o=a.pop(),o.nodeType===3){let e=i+o.length;t<=e&&(n.setStart(o,t-i),n.collapse(!0),s=!0),i=e}else{let e=o.childNodes.length;for(;e--;)a.push(o.childNodes[e])}r.removeAllRanges(),r.addRange(n)}c.addEventListener(`compositionstart`,()=>{o=!0}),c.addEventListener(`compositionend`,()=>{o=!1,clearTimeout(A),O||(A=setTimeout(h,300))});let O=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),k=``,A=null;O&&c.addEventListener(`blur`,()=>{i!==k&&(k=i,h())}),c.oninput=()=>{m(),O||(clearTimeout(A),A=setTimeout(()=>{i!==k&&(k=i,h())},300)),clearTimeout(b),b=setTimeout(()=>x(),300)},c.addEventListener(`keydown`,e=>{Ht()&&Ft(e)}),c.addEventListener(`paste`,e=>{let t=e.clipboardData?.items;if(t&&Array.from(t).some(e=>e.type&&e.type.startsWith(`image/`))){e.preventDefault();let t=document.createElement(`div`);t.className=`pm-toast-image-blocked`,t.textContent=`🚫 No puedes pegar imágenes. Usa 🎤 para grabar audio o describe el contenido.`,t.style.cssText=`position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#dc3545; color:white; padding:12px 20px; border-radius:8px; z-index:10000; font-size:14px;`,document.body.appendChild(t),setTimeout(()=>t.remove(),4e3)}});function j(e,t=0,n=null){c.focus();let r=window.getSelection();if(!r||r.rangeCount===0)return;let i=r.getRangeAt(0);i.deleteContents();let a=w(e),o=document.createTextNode(a);if(i.insertNode(o),t>0&&t<e.length){let e=document.createRange();e.setStart(o,t),e.collapse(!0),r.removeAllRanges(),r.addRange(e)}else i.setStartAfter(o),i.collapse(!0),r.removeAllRanges(),r.addRange(i);m(),h(),n&&setTimeout(()=>x(n),50)}return t&&(c.innerText=t,m(),h()),{insertText:j,getValue:()=>i,setValue:e=>{c.innerText=e,m(),h()},setContext:e=>{s=e}}}var Sn=[{trigger:`escalas`,label:`Escalas`,icon:`🎼`,expand:`[Escala Do Mayor] [Escala Re Mayor] [Escala Sol Mayor]`},{trigger:`arpegios`,label:`Arpegios`,icon:`🎹`,expand:`[Arpegio Do Mayor] [Arpegio La menor] [Arpegio Sol Mayor]`},{trigger:`tecnica`,label:`Técnica`,icon:`🎸`,expand:`$Tecnica_mano_derecha $Tecnica_mano_izquierda`},{trigger:`postura`,label:`Postura`,icon:`🧘`,expand:`$Postura_corporal $Posicion_manos`},{trigger:`evaluar`,label:`Evaluar`,icon:`📝`,expand:`4/5 (buen trabajo) {practicar 30 min diarios}`},{trigger:`mejorar`,label:`Mejorar`,icon:`💪`,expand:`(continuar mejorando la digitación) {repetir练习}`},{trigger:`ritmo`,label:`Ritmo`,icon:`🥁`,expand:`$Ritmo_binario $Ritmo_ternario`},{trigger:`dinamica`,label:`Dinámica`,icon:`🔊`,expand:`$Dinamica_piano $Dinamica_forte $Dinamica_mezzo`},{trigger:`afinacion`,label:`Afinación`,icon:`🎵`,expand:`$Afinacion_precisa $Afinacion_relativa`},{trigger:`lectura`,label:`Lectura`,icon:`📖`,expand:`[Lectura a primera vista] [Lectura de notas]`},{trigger:`respiracion`,label:`Respiración`,icon:`🌬️`,expand:`$Respiracion_diafragmatica $Respiracion_costeado`},{trigger:`memo`,label:`Memoria`,icon:`🧠`,expand:`[Técnica de memorización] {practicar de memoria}`}];function Cn(e){if(!e||e.length===0)return Sn.slice(0,6);let t=e.toLowerCase();return Sn.filter(e=>e.trigger.toLowerCase().includes(t)||e.label.toLowerCase().includes(t)).slice(0,6)}function wn(e){let t=Sn.find(t=>t.trigger===e);return t?t.expand:null}function Tn(e,t={}){let n=document.getElementById(`pm-toolbar-help-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-toolbar-help-modal`,n.className=`pm-help-modal-overlay`,n.innerHTML=`
      <div class="pm-help-modal">
        <div class="pm-help-modal-header">
          <div class="pm-help-header-content">
            <div class="pm-help-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 class="pm-help-modal-title">Guía de la Toolbar DSL</h2>
              <p class="pm-help-modal-subtitle">Referencia rápida de tokens y atajos</p>
            </div>
          </div>
          <button class="pm-help-close-btn" id="pm-help-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="pm-help-modal-body">
          ${[{category:`Referencia`,items:[{icon:`👤`,label:`#`,title:`Alumno`,description:`Etiqueta a un alumno individual`,example:`#María, #Pedro`,color:`#3b82f6`},{icon:`📚`,label:`[ ]`,title:`Contenido`,description:`Marca el tema abordado en la clase`,example:`[Escala Do Mayor]`,color:`#10b981`},{icon:`💡`,label:`( )`,title:`Sugerencia`,description:`Anotación de mejora pedagógica`,example:`(Mejorar postura)`,color:`#f59e0b`},{icon:`📝`,label:`{ }`,title:`Tarea`,description:`Asignación para completar`,example:`{Practicar 30 min}`,color:`#8b5cf6`}]},{category:`Técnico`,items:[{icon:`🎯`,label:`$`,title:`Medida`,description:`Término técnico musical`,example:`$vibrato, $legato`,color:`#06b6d4`},{icon:`🎓`,label:`>`,title:`Objetivo`,description:`Meta curricular o achievement`,example:`>NIVEL-3`,color:`#6366f1`}]},{category:`Inteligencia Artificial`,items:[{icon:`✨`,label:`Mejorar`,title:`Mejorar Texto`,description:`Mejora gramática y claridad con IA`,example:`"María no entiende" → texto mejorado`,color:`#ec4899`},{icon:`🚀`,label:`Estructurar`,title:`Estructurar con DSL`,description:`Convierte texto libre a formato DSL`,example:`"María tocando escalas" → #María [Escalas]`,color:`#f97316`}]}].map(e=>`
            <div class="pm-help-section">
              <h3 class="pm-help-section-title">${e.category}</h3>
              <div class="pm-help-grid">
                ${e.items.map(e=>`
                  <div class="pm-help-card" style="--card-accent: ${e.color}">
                    <div class="pm-help-card-header">
                      <div class="pm-help-card-icon">${e.icon}</div>
                      <div class="pm-help-card-label">${e.label}</div>
                      <div class="pm-help-card-title">${e.title}</div>
                    </div>
                    <p class="pm-help-card-desc">${e.description}</p>
                    <div class="pm-help-card-example">
                      <span class="pm-help-example-label">Ejemplo:</span>
                      <code class="pm-help-example-code">${e.example}</code>
                    </div>
                  </div>
                `).join(``)}
              </div>
            </div>
          `).join(``)}
          
          <div class="pm-help-tips">
            <div class="pm-help-tip-icon">💡</div>
            <div class="pm-help-tip-content">
              <strong>Tip:</strong> Escribe el token directamente en el editor para activar el autocompletado. Presiona <kbd>Tab</kbd> para aceptar la primera sugerencia.
            </div>
          </div>
        </div>
        
        <div class="pm-help-modal-footer">
          <button class="pm-help-primary-btn" id="pm-help-close-btn">
            Entendido
          </button>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-help-modal-styles`))){let e=document.createElement(`style`);e.id=`pm-help-modal-styles`,e.textContent=`
        .pm-help-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .pm-help-modal-overlay.open {
          display: flex;
          opacity: 1;
        }
        
        .pm-help-modal {
          background: var(--pm-surface);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                      0 0 0 1px var(--pm-border);
          max-width: 720px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95) translateY(10px);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        
        .pm-help-modal-overlay.open .pm-help-modal {
          transform: scale(1) translateY(0);
        }
        
        .pm-help-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem;
          background: var(--pm-surface-2);
          border-bottom: 1px solid var(--pm-border);
        }
        
        .pm-help-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .pm-help-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--pm-primary) 0%, #6366f1 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .pm-help-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--pm-text);
          margin: 0;
          line-height: 1.3;
        }
        
        .pm-help-modal-subtitle {
          font-size: 0.875rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
        
        .pm-help-close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: var(--pm-surface-2);
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pm-text-muted);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        
        .pm-help-close-btn:hover {
          background: var(--pm-border);
          color: var(--pm-text);
        }
        
        .pm-help-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        
        .pm-help-section {
          margin-bottom: 1.5rem;
        }
        
        .pm-help-section:last-of-type {
          margin-bottom: 0;
        }
        
        .pm-help-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--pm-text-muted);
          margin: 0 0 0.75rem;
          padding-left: 0.5rem;
        }
        
        .pm-help-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .pm-help-card {
          background: var(--pm-surface-2);
          border: 1px solid var(--pm-border);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .pm-help-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-accent, var(--pm-primary));
          opacity: 0.6;
        }
        
        .pm-help-card:hover {
          border-color: var(--card-accent, var(--pm-primary));
          box-shadow: var(--pm-shadow-sm);
          transform: translateY(-1px);
        }
        
        .pm-help-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        
        .pm-help-card-icon {
          font-size: 1.25rem;
          line-height: 1;
        }
        
        .pm-help-card-label {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          background: var(--pm-primary);
          color: white;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        
        .pm-help-card-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--pm-text);
        }
        
        .pm-help-card-desc {
          font-size: 0.8rem;
          color: var(--pm-text-muted);
          margin: 0 0 0.75rem;
          line-height: 1.4;
        }
        
        .pm-help-card-example {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .pm-help-example-label {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
        }
        
        .pm-help-example-code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.75rem;
          background: var(--pm-surface);
          color: var(--card-accent, var(--pm-primary));
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--pm-border);
        }
        
        .pm-help-tips {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: var(--pm-warning-bg);
          border: 1px solid var(--pm-warning-text);
          border-radius: 10px;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .pm-help-tip-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .pm-help-tip-content {
          font-size: 0.85rem;
          color: var(--pm-warning-text);
          line-height: 1.5;
        }
        
        .pm-help-tip-content kbd {
          display: inline-block;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.75rem;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 4px;
          padding: 0.1rem 0.35rem;
          margin: 0 0.1rem;
        }
        
        .pm-help-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--pm-border);
          display: flex;
          justify-content: flex-end;
        }
        
        .pm-help-primary-btn {
          background: linear-gradient(135deg, var(--pm-primary) 0%, var(--apple-primary-dark, #2563eb) 100%);
          color: white;
          border: none;
          padding: 0.625rem 1.5rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        }
        
        .pm-help-primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
        }
        
        .pm-help-primary-btn:active {
          transform: translateY(0);
        }
        
        /* Scrollbar styling */
        .pm-help-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-thumb {
          background: var(--pm-border);
          border-radius: 3px;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-thumb:hover {
          background: var(--pm-text-muted);
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .pm-help-modal {
            max-height: 95vh;
          }
          
          .pm-help-modal-header {
            padding: 1rem;
          }
          
          .pm-help-icon-wrapper {
            width: 40px;
            height: 40px;
          }
          
          .pm-help-modal-title {
            font-size: 1.1rem;
          }
          
          .pm-help-modal-body {
            padding: 1rem;
          }
          
          .pm-help-grid {
            grid-template-columns: 1fr;
          }
        }
      `,document.head.appendChild(e)}let r=null;function i(){n.classList.add(`open`),n.querySelector(`.pm-help-primary-btn`)?.focus(),r&&r.dispose(),r=p(n.querySelector(`.pm-help-modal`),{onClose:()=>a()})}function a(){r&&=(r.dispose(),null),n.classList.remove(`open`)}return n.querySelector(`#pm-help-close`).onclick=a,n.querySelector(`#pm-help-close-btn`).onclick=a,n.onclick=e=>{e.target===n&&a()},document.addEventListener(`keydown`,function e(t){t.key===`Escape`&&n.classList.contains(`open`)&&(a(),document.removeEventListener(`keydown`,e))}),{open:i,close:a}}function En(e,{onInsert:t,onLoading:n,onIaProposal:r,getEditorContent:i,aiService:a,onImproveClick:o,onStructureClick:s,onAnalyzeClick:c}){let l={presentes:[],indicadorActivo:null,indicadoresDisponibles:[]},u=[{token:`alumno`,label:`#`,title:`Etiquetar alumno`,text:`#`,offset:1,icon:`👤`,triggerAC:`#`},{token:`contenido`,label:`[ ]`,title:`Contenido de clase`,text:`[]`,offset:1,icon:`📚`,triggerAC:`[`},{token:`sugerencia`,label:`( )`,title:`Sugerencia pedagógica`,text:`()`,offset:1,icon:`💡`,triggerAC:`(`},{token:`tarea`,label:`{ }`,title:`Tarea / Asignación`,text:`{}`,offset:1,icon:`📝`,triggerAC:`{`},{token:`medida`,label:`$`,title:`Medida técnica`,text:`$`,offset:1,icon:`🎯`,triggerAC:`$`},{token:`objetivo`,label:`>`,title:`Objetivo curricular`,text:`>`,offset:1,icon:`🎓`,triggerAC:`>`}];if(e.innerHTML=`
    <div class="pm-dsl-toolbar">
      ${u.map(e=>`
        <button class="pm-dsl-tool-btn" data-token="${e.token}" title="${e.title}">
          <span class="pm-dsl-tool-symbol">${e.label}</span>
        </button>
      `).join(``)}
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn snippet-btn" id="btn-snippets" title="Snippets / Banco">
        <span class="snippet-icon">/</span>
      </button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn ai" id="btn-generar-informe" title="Generar informe para padres/tutores">📋</button>
      <button class="pm-dsl-tool-btn ai" id="btn-ia-magic" title="Estructurar con IA">🚀</button>
      <button class="pm-dsl-tool-btn ai ai-primary" id="btn-analizar-progreso" title="La IA lee tu texto y extrae los avances de cada alumno automáticamente">✨ Analizar con IA</button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn" id="btn-help" title="Ayuda">❓</button>

    </div>
    <div id="pm-snippet-popup" class="pm-snippet-popup" style="display:none;"></div>
  `,!document.getElementById(`pm-dsl-toolbar-styles`)){let e=document.createElement(`style`);e.id=`pm-dsl-toolbar-styles`,e.textContent=`
      .pm-dsl-toolbar {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem;
        background: var(--pm-surface);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-sm) var(--pm-radius-sm) 0 0;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        align-items: center;
      }
      .pm-dsl-toolbar::-webkit-scrollbar { display: none; }
      
      .pm-dsl-tool-btn {
        min-width: 32px;
        height: 32px;
        padding: 0 0.5rem;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        position: relative;
      }
      .pm-dsl-tool-btn:hover {
        background: var(--pm-surface-2);
        border-color: var(--pm-primary);
        color: var(--pm-primary);
        transform: translateY(-1px);
      }
      .pm-dsl-tool-btn:active { 
        background: var(--pm-border); 
        transform: translateY(1px); 
      }
      .pm-dsl-tool-btn.ai {
        border-color: var(--pm-primary);
        color: var(--pm-primary);
        background: rgba(99, 102, 241, 0.05);
      }
      .pm-dsl-tool-btn.ai-primary {
        padding: 0 0.85rem;
        font-weight: 700;
        font-size: 0.82rem;
        background: var(--pm-primary, #6366f1);
        color: #fff;
        border-color: var(--pm-primary, #6366f1);
        gap: 4px;
        min-width: unset;
        width: auto;
        letter-spacing: 0.01em;
      }
      .pm-dsl-tool-btn.ai-primary:hover {
        background: var(--pm-primary-dark, #4f46e5);
        border-color: var(--pm-primary-dark, #4f46e5);
        color: #fff;
        transform: translateY(-1px);
      }
      .pm-dsl-tool-btn.ai-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      
      .pm-dsl-tool-symbol {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      
      .pm-dsl-divider {
        width: 1px;
        background: var(--pm-border);
        margin: 4px 2px;
        height: 20px;
      }


    `,document.head.appendChild(e)}let d=new Map(u.map(e=>[e.token,e]));e.querySelectorAll(`.pm-dsl-tool-btn[data-token]`).forEach(e=>{e.onclick=()=>{let n=d.get(e.dataset.token);n&&(e.style.transform=`scale(0.9)`,setTimeout(()=>{e.style.transform=``},100),t(n.text,n.offset,n.triggerAC))}});async function f(){let e=i?i():``;if(e.trim()&&o)try{o(e)}catch(e){alert(`Error al generar informe: `+e.message)}}async function p(){let e=i?i():``;if(e.trim()&&s)try{s(e)}catch(e){alert(`Error al estructurar con IA: `+e.message)}}e.querySelector(`#btn-generar-informe`).onclick=f,e.querySelector(`#btn-ia-magic`).onclick=p;let m=e.querySelector(`#btn-analizar-progreso`);m&&(m.onclick=async()=>{let e=i?i():``;if(e.trim()&&c){m.disabled=!0,m.textContent=`⏳ Analizando...`;try{await c(e)}catch{}finally{m.disabled=!1,m.textContent=`✨ Analizar con IA`}}});let h=e.querySelector(`#pm-snippet-popup`);function g(n=``){let r=Cn(n);if(r.length===0){h.style.display=`none`;return}h.innerHTML=r.map(e=>`
      <div class="pm-snippet-item" data-trigger="${e.trigger}">
        <span class="pm-snippet-icon">${e.icon}</span>
        <span class="pm-snippet-label">/${e.trigger}</span>
        <span class="pm-snippet-preview">${e.label}</span>
      </div>
    `).join(``);let i=e.getBoundingClientRect(),a=i.top;h.style.position=`fixed`,h.style.left=`${i.left}px`,h.style.width=`${i.width}px`,a>220?(h.style.top=`auto`,h.style.bottom=`${window.innerHeight-i.top+8}px`,h.style.transformOrigin=`bottom left`):(h.style.bottom=`auto`,h.style.top=`${i.bottom+8}px`,h.style.transformOrigin=`top left`),h.style.display=`block`,h.querySelectorAll(`.pm-snippet-item`).forEach(e=>{e.onclick=()=>{t(wn(e.dataset.trigger)+` `),_()}})}function _(){h.style.display=`none`}if(!document.getElementById(`pm-snippet-styles`)){let e=document.createElement(`style`);e.id=`pm-snippet-styles`,e.textContent=`
      .snippet-btn { font-size: 1rem; font-weight: 800; }
      .snippet-icon { font-weight: 900; color: var(--pm-text-muted); }
      .pm-snippet-popup {
        position: fixed;
        left: 0;
        background: var(--pm-surface);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-md);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 2000;
        max-height: 250px;
        overflow-y: auto;
        min-width: 240px;
        animation: pm-pop-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes pm-pop-up {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .pm-snippet-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border);
      }
      .pm-snippet-item:last-child { border-bottom: none; }
      .pm-snippet-item:hover { background: var(--pm-surface-2); }
      .pm-snippet-icon { font-size: 1rem; }
      .pm-snippet-label {
        font-family: monospace;
        font-weight: 600;
        color: var(--pm-primary);
      }
      .pm-snippet-preview {
        font-size: 0.8rem;
        color: var(--pm-text-muted);
      }
    `,document.head.appendChild(e)}e.querySelector(`#btn-snippets`).onclick=()=>{h.style.display===`block`?_():g()};let v=Tn(e);return e.querySelector(`#btn-help`).onclick=()=>{v.open()},{setContext(e={}){e.presentes!==void 0&&(l.presentes=e.presentes),e.indicadorActivo!==void 0&&(l.indicadorActivo=e.indicadorActivo),e.indicadoresDisponibles!==void 0&&(l.indicadoresDisponibles=e.indicadoresDisponibles)}}}function Dn(e,t){let n=e.querySelector(`#pm-dsl-toolbar-container`),r=e.querySelector(`#pm-dsl-editor-container`),i=null,a=xn(r,{initialContent:t.initialContent||``,onChange:e=>{t.onEditorChange?.(e)}});a.setContext({claseId:t.claseId});function o(e){i=En(n,{onInsert:(e,t,n)=>a.insertText(e,t,n),getEditorContent:()=>a.getValue(),onLoading:()=>{},onIaProposal:t=>e.onIaProposal?.(t),onImproveClick:t=>e.onImproveClick?.(t),onStructureClick:t=>e.onStructureClick?.(t),onAnalyzeClick:t=>e.onAnalyzeClick?.(t)})}function s(){i&&i.destroy(),a.destroy()}return{getEditor:()=>a,getToolbar:()=>i,getValue:()=>a.getValue(),setValue:e=>a.setValue(e),setContext:e=>a.setContext(e),initToolbar:o,destroy:s}}function On(e,{onMarkAll:t}){if(!t)return{destroy(){}};let n=e.querySelector(`#btn-bulk-p`),r=e.querySelector(`#btn-bulk-a`),i=[];function a(e,t,n){e&&(e.addEventListener(t,n),i.push(()=>e.removeEventListener(t,n)))}return a(n,`click`,e=>{e.preventDefault(),t(`P`)}),a(r,`click`,e=>{e.preventDefault(),t(`A`)}),{destroy(){i.forEach(e=>{try{e()}catch{}}),i.length=0}}}function kn({saveFn:e,debounceMs:t=3e4}){let n=null,r=[];function i(i){n!==null&&(clearTimeout(n),n=null),!(!i||!i.trim())&&(n=setTimeout(async()=>{n=null,await e(i),r.forEach(e=>e(i))},t))}function a(){n!==null&&(clearTimeout(n),n=null)}function o(e){r.push(e)}return{onInput:i,destroy:a,onSaved:o}}async function An(t,n,r){let{data:i,error:a}=await e.from(`observaciones_sesion`).select(`id`).eq(`sesion_id`,t).eq(`maestro_id`,n).eq(`es_borrador`,!0).limit(1).maybeSingle();if(a)throw a;if(i){let{data:t,error:n}=await e.from(`observaciones_sesion`).update({contenido_raw:r}).eq(`id`,i.id).select().single();if(n)throw n;return t}else{let{data:i,error:a}=await e.from(`observaciones_sesion`).insert({sesion_id:t,maestro_id:n,contenido_raw:r,es_borrador:!0}).select().single();if(a)throw a;return i}}async function jn(t,n){let{data:r,error:i}=await e.from(`observaciones_sesion`).select(`id, contenido_raw, updated_at`).eq(`sesion_id`,t).eq(`maestro_id`,n).eq(`es_borrador`,!0).limit(1).maybeSingle();if(i)throw i;return r??null}async function Mn(t){let{error:n}=await e.from(`observaciones_sesion`).delete().eq(`id`,t);if(n)throw n}async function Nn(t,n,r,i,a=null,o=null){try{let{error:s}=await e.from(`observaciones_sesion`).delete().eq(`sesion_id`,t).eq(`maestro_id`,n).eq(`es_borrador`,!0);if(s)throw s;let{data:c,error:l}=await e.from(`observaciones_sesion`).insert({sesion_id:t,maestro_id:n,contenido_raw:r,contenido_parsed:i,contenido_ia_dsl:a,contenido_ia_mejorado:o,es_borrador:!1}).select().single();if(l)throw l;return c}catch(e){if(!navigator.onLine||e.message?.includes(`Failed to fetch`))return console.warn(`[autoDraftService] Offline, encolando saveObservation...`),await l({tabla:`observaciones_sesion`,operacion:`upsert`,payload:{sesion_id:t,maestro_id:n,contenido_raw:r,contenido_parsed:i,contenido_ia_dsl:a,contenido_ia_mejorado:o,es_borrador:!1}}),{_offline:!0,sesion_id:t};throw e}}function Pn(e,{sesionId:t,maestroId:n,editor:r,sesionExistenteData:i,onDraftRecovered:a}){if(!t)return{destroy(){}};let o=null,s=!1,c=e.querySelector(`#pm-draft-indicator`);o=kn({saveFn:async e=>{!t||s||await An(t,n,e)},debounceMs:3e4}),o.onSaved(()=>{if(s||!c)return;let e=new Date;c.textContent=`Borrador guardado ${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`,c.style.display=``});let l=e.querySelector(`#pm-dsl-editable`);if(l){let e=l.oninput;l.oninput=function(t){e&&e.call(this,t),o&&!s&&o.onInput(r.getValue())}}return i?.borrador===!0&&jn(t,n).then(e=>{if(!s&&e&&e.contenido_raw&&e.contenido_raw.trim()){let t=e.updated_at?new Date(e.updated_at).toLocaleString(`es-AR`):``;confirm(`Hay un borrador guardado${t?` (${t})`:``}.\n\n¿Deseas recuperarlo?`)?a&&a(e.contenido_raw):Mn(e.id).catch(e=>console.warn(`[autoDraft] Error discarding:`,e))}}).catch(e=>console.warn(`[autoDraft] Error loading draft:`,e)),{destroy(){s=!0,o&&o.destroy()}}}function Fn(e,{onSave:t,onCancel:n,onDelete:r}){let i=document.getElementById(`pm-justif-modal`);if(!i&&(i=document.createElement(`div`),i.id=`pm-justif-modal`,i.className=`pm-justif-modal-overlay`,i.innerHTML=`
      <div class="pm-justif-backdrop"></div>
      <div class="pm-justif-modal">
        <div class="pm-justif-header">
          <div class="pm-justif-header-content">
            <div class="pm-justif-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h2 class="pm-justif-title" id="pm-justif-title">Justificar Inasistencia</h2>
              <p class="pm-justif-subtitle" id="pm-justif-subtitle">Registra el motivo de la ausencia</p>
            </div>
          </div>
          <button class="pm-justif-close" id="pm-justif-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="pm-justif-body">
          <p id="pm-justif-alumno-nombre" class="pm-justif-alumno"></p>
          
          <div class="pm-justif-field">
            <label for="pm-justif-motivo">Motivo de la ausencia *</label>
            <textarea id="pm-justif-motivo" rows="3" 
              placeholder="Ej: Certificado médico, cita médica, viaje familiar, motivo personal..."></textarea>
            <span class="pm-justif-hint">Describe el motivo de la inasistencia</span>
          </div>
          
          <div class="pm-justif-field">
            <label>Evidencia (Opcional)</label>
            <div class="pm-justif-file-area" id="pm-justif-file-area">
              <input type="file" id="pm-justif-file" class="pm-justif-file-input" accept="image/*" capture="environment" />
              <div class="pm-justif-file-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Adjuntar foto del justificante</span>
              </div>
              <div class="pm-justif-file-preview" id="pm-justif-file-preview" style="display:none;">
                <img id="pm-justif-preview-img" src="" alt="Vista previa" />
                <button class="pm-justif-remove-file" id="pm-justif-remove-file" type="button">×</button>
              </div>
            </div>
            <span class="pm-justif-hint">Ej: foto del certificado médico</span>
          </div>
        </div>
        
        <div class="pm-justif-footer">
          <button class="pm-justif-delete" id="pm-justif-delete" style="display:none;" title="Eliminar justificación">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Eliminar
          </button>
          <button class="pm-justif-cancel" id="pm-justif-cancel">Cancelar</button>
          <button class="pm-justif-save" id="pm-justif-save">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span id="pm-justif-btn-text">Guardar Justificación</span>
          </button>
        </div>
      </div>
    `,document.body.appendChild(i),!document.getElementById(`pm-justif-styles`))){let e=document.createElement(`style`);e.id=`pm-justif-styles`,e.textContent=`
        .pm-justif-modal-overlay {
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
        .pm-justif-modal-overlay.open {
          display: flex;
          opacity: 1;
        }
        .pm-justif-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        }
        .pm-justif-modal {
          position: relative;
          background: var(--pm-surface);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95) translateY(10px);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .pm-justif-modal-overlay.open .pm-justif-modal {
          transform: scale(1) translateY(0);
        }
        .pm-justif-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.25rem 1.25rem 0.75rem;
          background: var(--pm-surface-2);
          border-bottom: 1px solid var(--pm-border);
        }
        .pm-justif-header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .pm-justif-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .pm-justif-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--pm-text);
          margin: 0;
        }
        .pm-justif-subtitle {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.2rem 0 0;
        }
        .pm-justif-close {
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
        .pm-justif-close:hover {
          background: var(--pm-border);
          color: var(--pm-text);
        }
        .pm-justif-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
        }
        .pm-justif-alumno {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--pm-primary);
          margin: 0 0 1rem;
          padding: 0.5rem 0.75rem;
          background: rgba(59, 130, 246, 0.08);
          border-radius: 8px;
          border-left: 3px solid var(--pm-primary);
        }
        .pm-justif-field {
          margin-bottom: 1rem;
        }
        .pm-justif-field:last-child {
          margin-bottom: 0;
        }
        .pm-justif-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.35rem;
        }
        .pm-justif-field textarea {
          width: 100%;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--pm-text);
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          min-height: 70px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pm-justif-field textarea:focus {
          outline: none;
          border-color: var(--pm-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .pm-justif-hint {
          display: block;
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          margin-top: 0.25rem;
        }
        .pm-justif-file-area {
          position: relative;
          border: 2px dashed var(--pm-border);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pm-justif-file-area:hover {
          border-color: var(--pm-primary);
          background: rgba(59, 130, 246, 0.05);
        }
        .pm-justif-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .pm-justif-file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--pm-text-muted);
        }
        .pm-justif-file-placeholder svg {
          opacity: 0.5;
        }
        .pm-justif-file-placeholder span {
          font-size: 0.8rem;
        }
        .pm-justif-file-preview {
          position: relative;
        }
        .pm-justif-file-preview img {
          max-width: 100%;
          max-height: 120px;
          border-radius: 8px;
          object-fit: cover;
        }
        .pm-justif-remove-file {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: var(--pm-danger);
          color: white;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-justif-delete {
          margin-right: auto;
          background: transparent;
          border: 1px solid var(--pm-danger);
          border-radius: 8px;
          padding: 0.5rem 0.9rem;
          font-size: 0.825rem;
          font-weight: 500;
          color: var(--pm-danger);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .pm-justif-delete:hover {
          background: var(--pm-danger);
          color: white;
        }
        .pm-justif-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
        }
        .pm-justif-cancel {
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
        .pm-justif-cancel:hover {
          background: var(--pm-border);
        }
        .pm-justif-save {
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pm-justif-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
        }
        @media (max-width: 480px) {
          .pm-justif-modal {
            max-width: 100%;
          }
        }
      `,document.head.appendChild(e)}let a=null,o=null,s=null,c=null,l=!1,u=null,d=null,f=i.querySelector(`#pm-justif-title`),m=i.querySelector(`#pm-justif-subtitle`),h=i.querySelector(`#pm-justif-btn-text`),g=i.querySelector(`#pm-justif-alumno-nombre`),_=i.querySelector(`#pm-justif-motivo`),v=i.querySelector(`#pm-justif-file`),y=i.querySelector(`.pm-justif-file-placeholder`),b=i.querySelector(`.pm-justif-file-preview`),x=i.querySelector(`#pm-justif-preview-img`),S=i.querySelector(`#pm-justif-remove-file`),C=i.querySelector(`#pm-justif-delete`);function w(e,t=null,n=null){a=e,o=t,s=null,c=null,l=!!t,u=n,l?(f.textContent=`Editar Justificación`,m.textContent=`Modifica el motivo de la inasistencia`,h.textContent=`Actualizar`,C.style.display=`flex`):(f.textContent=`Justificar Inasistencia`,m.textContent=`Registra el motivo de la ausencia`,h.textContent=`Guardar Justificación`,C.style.display=`none`),g.textContent=e.nombre_completo,_.value=t?.motivo||``;let r=t?.evidencia_url||t?.evidencia_base64;r?(c=r,x.src=r,y.style.display=`none`,b.style.display=`block`):(c=null,y.style.display=`flex`,b.style.display=`none`),v.value=``,i.classList.add(`open`),_.focus();let S=i.querySelector(`.pm-justif-modal`);S&&(d&&d.dispose(),d=p(S,{onClose:()=>T(!0)}))}function T(e=!1){e&&n&&a&&u!==null&&n(a.id,u),i.classList.remove(`open`),a=null,o=null,s=null,c=null,u=null,d&&=(d.dispose(),null)}i.querySelector(`#pm-justif-close`).onclick=()=>T(!0),i.querySelector(`#pm-justif-cancel`).onclick=()=>T(!0),C.onclick=()=>{a&&confirm(`¿Eliminar la justificación de ${a.nombre_completo}?`)&&(r&&r({alumnoId:a.id,justificacionId:o?.id,existingUrl:o?.evidencia_url||o?.evidencia_base64}),T(!1))},i.querySelector(`.pm-justif-backdrop`).onclick=()=>T(!0),v.onchange=e=>{let t=e.target.files[0];t&&(s=t,c=URL.createObjectURL(t),x.src=c,y.style.display=`none`,b.style.display=`block`)},S.onclick=()=>{c&&!(o?.evidencia_url||o?.evidencia_base64)&&URL.revokeObjectURL(c),s=null,c=null,v.value=``,y.style.display=`flex`,b.style.display=`none`},i.querySelector(`#pm-justif-save`).onclick=()=>{let e=_.value.trim();if(!e){_.focus(),_.style.borderColor=`var(--pm-danger)`,setTimeout(()=>{_.style.borderColor=``},2e3);return}t&&a&&t({alumnoId:a.id,motivo:e,evidenciaFile:s,evidenciaPreview:c,justificacionId:o?.id||null,existingUrl:o?.evidencia_url||o?.evidencia_base64||null,isEdit:l})};let E=e=>{e.key===`Escape`&&(T(),document.removeEventListener(`keydown`,E))};return document.addEventListener(`keydown`,E),{open:w,close:T}}function In(e,{sesionId:t,claseId:n,fechaHoy:r,maestroId:i,supabase:a,guardarJustificacion:o,eliminarJustificacion:s,onJustifDeleted:c,onJustifSaved:l,onJustifCancelled:u,onRenderLista:d,onUpdateProgress:f,onAutoSave:p,onAnnounce:m}){let h=!1,g=Fn(document.body,{onDelete:async({alumnoId:e,justificacionId:t,existingUrl:n})=>{if(!h){if(n){let e=n.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&a.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}t&&s(t).catch(console.warn),c&&c(e),d(e),f();try{await p(!0)}catch(e){console.warn(`[justif] autoSave error:`,e)}m&&m(`Justificación eliminada.`)}},onSave:async({alumnoId:e,motivo:s,evidenciaFile:c,justificacionId:u,existingUrl:d,isEdit:f})=>{if(h)return;let m=document.getElementById(`pm-justif-save`);m&&(m.disabled=!0);try{let m=null;if(f&&u){let e=d;if(c){if(d){let e=d.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&await a.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}let t=c.name.split(`.`).pop(),n=`justificaciones/${Date.now()}_${Math.random().toString(36).slice(2)}.${t}`,{data:r}=await a.storage.from(`documentos`).upload(n,c).catch(()=>({data:null}));if(r){let{data:t}=a.storage.from(`documentos`).getPublicUrl(r.path);e=t.publicUrl}}let{data:t,error:n}=await a.from(`justificaciones`).update({motivo:s,evidencia_url:e}).eq(`id`,u).select().single();if(n)throw n;m=t}else{t||await p(!0,!1);let a=await o({sesionId:t,alumnoId:e,claseId:n,fecha:r,motivo:s,creadoPor:i},c);if(a.error)throw a.error;m=a.data}m&&l&&l(e,m),h||g.close()}catch(e){console.error(`[justificacion] Error guardando:`,e),alert(`Error al guardar la justificación: `+e.message)}finally{m&&(m.disabled=!1)}},onCancel:(e,t)=>{h||(u&&u(e,t),d(e),f())}});return{open(e,t,n){h||g.open(e,t,n)},close(){if(!h)try{g.close()}catch{}},destroy(){h=!0;try{g.close()}catch{}}}}function Ln(e,{alumnos:t,estado:n,rutaId:r,sesionId:i,fechaHoy:a,snapshots:o,justificaciones:s,obtenerJustificacion:c,onEstadoChange:l,onOpenProgressPanel:u,onOpenEvaluationDrawer:d,onOpenJustifModal:f,onAutoSave:p,onAnnounce:m,onUpdateSnapshots:g}){let _=e.querySelector(`#pm-alumnos-list`);if(!_)return{destroy(){},render(){}};let v=null;function y(e,t){return[...e].sort((e,n)=>{let r=t[e.id]!==null,i=t[n.id]!==null;return!r&&i?-1:r&&!i?1:0})}function b(e=null){let r=y(t,n),i=null;if(e){let t=_.querySelector(`[data-id="${e}"]`);t&&(i=t.getBoundingClientRect())}if(_.innerHTML=r.map(e=>x(e,n[e.id])).join(``),e&&i){let t=_.querySelector(`[data-id="${e}"]`),n=t.getBoundingClientRect(),r=i.top-n.top;t.animate([{transform:`translateY(${r}px)`,opacity:.7},{transform:`translateY(0)`,opacity:1}],{duration:300,easing:`cubic-bezier(0.4, 0, 0.2, 1)`})}}function x(e,t){return`
      <div class="pm-asist-item ${t?`estado-${t.toLowerCase()}`:``}" data-id="${e.id}">
        <div class="pm-asist-avatar">${e.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${h(e.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${h(e.instrumento_principal||`—`)}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${t===`P`?`active-p`:``}" data-action="P" data-id="${e.id}">P</button>
          <button class="pm-asist-btn ${t===`J`?`active-j`:``}" data-action="J" data-id="${e.id}">J</button>
          <button class="pm-asist-btn ${t===`A`?`active-a`:``}" data-action="A" data-id="${e.id}">A</button>
        </div>
    </div>
    `}return _.onclick=async e=>{let h=e.target.closest(`.pm-asist-btn`),_=e.target.closest(`.pm-asist-nombre`);if(_){let e=_.closest(`.pm-asist-item`).dataset.id,n=t.find(t=>t.id===e);if(!n)return;if(r){v&&v.destroy(),u&&u(n);return}let s=o.filter(t=>t.student_id===e);if(s.length===0)try{let{academicService:t}=await E(async()=>{let{academicService:e}=await import(`./academicService-dKTfSUQ8.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3])),n=await t.createSnapshotForStudent(i,e,a);n&&(s=n,g&&g(n))}catch(e){console.error(`Error creando snapshot on-demand:`,e)}d&&d(n,s);return}if(!h)return;let{id:y,action:x}=h.dataset;if(window.navigator.vibrate&&window.navigator.vibrate(10),x===`J`){let e=t.find(e=>e.id===y);if(!e)return;if(n[y]===`J`){let t=s[y]||null;!t&&i&&c&&(t=await c(i,y)),f&&f(e,t,null),m&&m(`Editando justificación de ${e.nombre_completo}.`)}else l&&l(y,`J`),b(y),p&&await p(!0),f&&f(e,null,null),m&&m(`Justificación marcada para ${e.nombre_completo}.`);return}if(l&&l(y,n[y]===x?null:x),b(y),m){let e=Object.values(n).filter(e=>e===`P`).length,t=Object.values(n).filter(e=>e===`A`).length,r=Object.values(n).filter(e=>e===`J`).length;m(`Asistencia actualizada. ${e} presentes, ${t} ausentes, ${r} justificados.`)}p&&await p(!0)},{render(e){b(e)},destroy(){_.onclick=null,v&&=(v.destroy(),null)}}}async function Rn(t,n,r,i,a=`Clase`,o=null){if(!i||i.length===0)return{success:!0};let s=i;if(o&&o.length>0){let e=new Set(o.map(e=>e.id)),t=i.length;s=i.filter(t=>e.has(t.alumno_id)),s.length<t&&console.warn(`[Promotion] promocionarObservacionesAlumnos: filtrados ${t-s.length} evaluaciones de alumnos ausentes`)}let c=s.filter(e=>e.observacion&&e.observacion.trim().length>0);if(c.length===0)return{success:!0};let u=c.map(e=>new j({alumno_id:e.alumno_id,maestro_id:r,clase_id:n,sesion_clase_id:t,tipo:`academico`,titulo:`Evaluación SOI: ${a}`,descripcion:e.observacion,prioridad:`media`,estado:`abierta`,fecha_observacion:new Date().toISOString().split(`T`)[0]}).toJSON());try{let{data:t,error:n}=await e.from(`observaciones_alumnos`).upsert(u,{onConflict:`sesion_clase_id,alumno_id`});if(n)throw n;return{success:!0,data:t}}catch(e){if(!navigator.onLine||e.message?.includes(`Failed to fetch`)){console.warn(`[Promotion] Offline, encolando promoción de observaciones...`);for(let e of u)await l({tabla:`observaciones_alumnos`,operacion:`upsert`,payload:e});return{success:!0,_offline:!0,count:u.length}}return console.error(`[Promotion] Error promoviendo observaciones:`,e),{success:!1,error:e.message}}}async function zn(t,n){if(!t||!n)throw Error(`classEventId and status are required`);let{data:r,error:i}=await e.from(`class_events`).update({status:n,updated_at:new Date().toISOString()}).eq(`id`,t).select().single();if(i)throw Error(`Error updating class event status: ${i.message}`);return r}function Bn(e,t){let n=e.querySelector(`#btn-guardar-obs`);return n?(t.rutaId&&(n.style.display=``),n.onclick=async()=>{let r=t.getEditorValue();if(!r||!r.trim()){f.warning(`El editor está vacío. Escribe observaciones antes de guardar.`);return}if(!t.sesionId){f.warning(`Primero guarda la sesión (asistencia) para poder registrar observaciones.`);return}let i=null,a=await Hn(r,t),o=t.planificationCard?.getActiveIndicador();if(i=a||o,!i){f.warning(`Seleccione un indicador en la ruta antes de guardar la observación o escríbalo entre corchetes [Ejemplo].`);return}let s=e.querySelector(`#pm-active-tema-badge`);s&&i.nombre&&(s.textContent=i.nombre,s.style.display=`inline-block`),n.disabled=!0,n.textContent=`Procesando...`;try{let a=t.alumnos.filter(e=>t.estado[e.id]===`P`),o=await F(r,i.id,a,i.nombre);if(o.error)throw Error(o.error);if(o.modo===`natural`&&o.dslGenerado&&!confirm(`📝 Texto convertido a formato estructurado:

`+o.dslGenerado+`

¿Guardar la evaluación?`)){n.disabled=!1,n.textContent=`Guardar observación`;return}if(o.missing.length>0&&!confirm(`Faltan ${o.missing.length} alumno(s) sin evaluar:\n${o.missing.join(`, `)}\n\n¿Guardar de todas formas?`)){n.disabled=!1,n.textContent=`Guardar observación`;return}if(o.evaluaciones.length>0){let{error:e}=await P(t.sesionId,i.id,o.evaluaciones,t.maestro.id,a);if(e)throw e}let s={indicador_id:i.id,evaluaciones:o.evaluaciones};await Nn(t.sesionId,t.maestro.id,r,s,o.dslGenerado||null,o.textoMejorado||null);let c=re(r);if(c.estados&&c.estados.length>0){let e=t.alumnos.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]}));Ve({sesionId:t.sesionId,claseId:t.claseId,maestroId:t.maestro.id,fechaHoy:t.fechaHoy,dslText:r,alumnos:e}).then(({saved:e,errors:n})=>{n.length&&console.warn(`[Progress DSL] Errores:`,n),e.length&&tt(e,t.editorContainer)}).catch(e=>console.warn(`[Progress DSL] Error:`,e.message))}let l=await Rn(t.sesionId,t.claseId,t.maestro.id,o.evaluaciones,t.claseNombre||`Clase`,a);if(l.success||console.warn(`[Fase C] Fallo parcial en promoción:`,l.error),t.planificationCard&&await t.planificationCard.refreshTree(),t.setEditorValue(``),t.onDslContentClear&&t.onDslContentClear(),Vn(o.evaluaciones.length,i.nombre),t.activeClassEventId){try{await zn(t.activeClassEventId,`completed`)}catch(e){console.warn(`[asistencia] Error updating class event status:`,e)}if(t.activeLevel)try{let{academicService:e}=await E(async()=>{let{academicService:e}=await import(`./academicService-dKTfSUQ8.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3]));for(let n of a){let r=await e.checkLevelCompletion(n.id,t.activeLevel);if(r&&r.status===`approved`){let{createLevelCompletionModal:e}=await E(async()=>{let{createLevelCompletionModal:e}=await import(`./LevelCompletionModal-D4S5ncv_.js`);return{createLevelCompletionModal:e}},__vite__mapDeps([4,3,5])),r=e({studentId:n.id,levelId:t.activeLevel});t.onAppendModal?.(r.el||r)}}}catch(e){console.warn(`[asistencia] Error checking level completion:`,e)}}if(o.evaluaciones.length>0&&t.claseId&&i?.nombre){let{error:e}=await ze({sesionId:t.sesionId,claseId:t.claseId,maestroId:t.maestro.id,fechaHoy:t.fechaHoy,contenido:i.nombre,evaluaciones:o.evaluaciones});e&&console.warn(`[asistencia] Error al sincronizar progresos:`,e)}if(t.sesionId){let{academicService:n}=await E(async()=>{let{academicService:e}=await import(`./academicService-dKTfSUQ8.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3])),r=await n.processSessionClosure(t.sesionId);if(r&&r.length>0){let{createAchievementsSummaryModal:t}=await E(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-tKnFb9f5.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([6,5]));await t(e,r)}}n.textContent=`¡Guardado!`,setTimeout(()=>{n.textContent=`Guardar observación`,n.disabled=!1},2e3)}catch(e){console.error(`[asistencia] Error saving observation:`,e),f.error(`Error al guardar: `+(e.message||e)),n.disabled=!1,n.textContent=`Guardar observación`}},{destroy(){}}):{destroy(){}}}function Vn(e,t){let n=document.createElement(`div`);n.innerHTML=`
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
      <span>✅ Observación guardada exitosamente (${e} eval.)</span>
      <span style="font-size:0.85em; opacity:0.9;">Tema detectado: <b>${t}</b></span>
    </div>`,n.style.cssText=`position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--pm-surface, #1e1e1e);color:#fff;padding:12px 24px;border-radius:12px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.3); border: 1px solid var(--apple-success, #22c55e);`,document.body.appendChild(n),setTimeout(()=>n.remove(),4500)}async function Hn(e,t){let n=t.planificationCard?.getActivePlanificacionId();if(!e||!n)return null;let r=e.match(/\[(.*?)\]/);if(!r||!r[1])return null;let i=r[1].trim().toLowerCase(),a=e=>{let t=[`se`,`hizo`,`la`,`el`,`los`,`las`,`un`,`una`,`de`,`del`,`en`,`con`,`por`,`para`,`y`,`o`,`tema`,`indicador`];return e.toLowerCase().replace(/[^\w\sáéíóúñ]/g,``).split(/\s+/).filter(e=>e.length>2&&!t.includes(e))},o=a(i);if(o.length===0)return null;try{let e=await K.getRouteHierarchy(n),t=null,r=0;for(let n of e)for(let e of n.plan_temas||[])for(let n of e.plan_objetivos||[]){let e=a(n.nombre),i=o.filter(t=>e.includes(t)).length;i>r&&(r=i,t=n)}return t}catch(e){return console.warn(`[asistencia] Error resolving indicador:`,e),null}}async function Un(e,{onError:t,silent:n=!1}={}){try{return await e()}catch(e){return console.error(`[safeAsync]`,e),t?t(e):n||f!==void 0&&f&&f.error(`Error inesperado: `+(e.message||e)),null}}async function Wn(t,{sesionId:n,fecha:r,maestro:i,router:a}){try{let{data:o,error:s}=await e.from(`sesiones_clase`).select(`*`).eq(`id`,n).single();if(s||!o){t.innerHTML=`<p class="pm-empty">Sesión no encontrada.</p>`;return}let c=new Date,l=`${c.getFullYear()}-${String(c.getMonth()+1).padStart(2,`0`)}-${String(c.getDate()).padStart(2,`0`)}`,u=r||o.fecha||l,d={id:n,nombre:o.actividad||`Clase Emergente`,instrumento:``};localStorage.setItem(`pm_active_clase_id`,n);let f=Array.isArray(o.asistencia)?o.asistencia:[],p=f.map(e=>e.alumno_id).filter(Boolean),m=[];if(p.length>0){let{data:t}=await e.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,p);m=t||[]}let h={},g={};m.forEach(e=>{h[e.id]=null}),f.forEach(e=>{e.estado&&m.some(t=>t.id===e.alumno_id)&&(h[e.alumno_id]=e.estado)});let _=Kn(t,{clase:d,horario:null,alumnos:m,estado:h,justificaciones:g,maestro:i,fechaHoy:u,claseId:null,sesionId:n,hasConflict:!1,serverDSL:o.contenido||``,snapshots:[],salonNombre:null,rutaId:null,sesionExistenteData:o,router:a});return typeof _==`function`?_:void 0}catch(e){console.error(`[asistenciaView] Error en sesión emergente:`,e.message,e.stack),t.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${h(e.message)}</p>`}}async function Gn(n,{claseId:s,fecha:c,sesionId:l,router:u}={}){let d=typeof n==`string`?document.getElementById(n):n;if(!d){console.error(`[asistenciaView] Container not found:`,n);return}d.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let f=t();if(!f){d.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!s){if(l)return Wn(d,{sesionId:l,fecha:c,maestro:f,router:u});d.innerHTML=`<p class="pm-empty">No se indicó la clase.</p>`;return}localStorage.setItem(`pm_active_clase_id`,s);let p=new Date,m=`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,`0`)}-${String(p.getDate()).padStart(2,`0`)}`,g=c||m;try{let t=p.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[n,c,l,m]=await Promise.all([r(),i([s]),o([s]),e.from(`sesiones_clase`).select(`*`).eq(`clase_id`,s).eq(`maestro_id`,f.id).eq(`fecha`,g).order(`borrador`,{ascending:!0}).order(`updated_at`,{ascending:!1})]),h=n.find(e=>e.id===s);if(!h){d.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`;return}let _=c.find(e=>e.dia?.toLowerCase()===t),v=(l||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>{let n=(e.instrumento_principal||``).localeCompare(t.instrumento_principal||``);return n===0?(e.nombre_completo||``).localeCompare(t.nombre_completo||``):n}),y=m.data||[],b=y[0]||null,x=(()=>{let e=new Map;for(let t of[...y].reverse())Array.isArray(t.asistencia)&&t.asistencia.forEach(t=>{t?.alumno_id&&e.set(t.alumno_id,t.estado)});return[...e.entries()].map(([e,t])=>({alumno_id:e,estado:t}))})(),S=Array.isArray(b?.asistencia)?b.asistencia.map(e=>e?.alumno_id).filter(Boolean):[];if(b?.tipo===`emergente`&&S.length>0){let t=new Set(S),n=new Set(v.map(e=>e.id)),r=S.filter(e=>!n.has(e));if(r.length>0)try{let{data:t}=await e.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,r);v=v.concat(t||[])}catch(e){console.warn(`[asistencia] No se pudieron cargar alumnos extra de clase emergente:`,e)}v=v.filter(e=>t.has(e.id))}let C=b?.id||null,w=b?.updated_at||null,T=b?.contenido||``,E=h.salon?[h.salon]:[],[D,O]=await Promise.all([C?e.from(`class_session_content_snapshots`).select(`*`).eq(`session_id`,C).then(e=>e.data||[]):Promise.resolve([]),E.length>0?a(E):Promise.resolve([])]),k=O.length>0?O[0].nombre:null,A=`pm_asistencia_${s||C}_${g}`,j=localStorage.getItem(`${A}_updated`),ee=!1;w&&j&&new Date(w).getTime()>new Date(j).getTime()+5e3&&(ee=!0);let M=null;try{let t=n?.find(e=>e.id===s)?.instrumento;if(t){let n=t.split(`,`)[0].trim().toLowerCase(),{data:r}=await e.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${n}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();M=r?.route_versions?.[0]?.id||r?.route_versions?.id||null}}catch(e){console.warn(`[asistencia] No se pudo resolver route_version_id:`,e)}let N={},te={};v.forEach(e=>{N[e.id]=null});let ne=x,P={presente:`P`,ausente:`A`,justificado:`J`,tarde:`T`};if(ne.length===0)try{let t=null,n=y.map(e=>e.id).filter(Boolean);if(n.length>0){let{data:r}=await e.from(`asistencias`).select(`alumno_id, estado`).in(`sesion_clase_id`,n);t=r}if((!t||t.length===0)&&s&&g){let{data:n}=await e.from(`asistencias`).select(`alumno_id, estado`).eq(`clase_id`,s).eq(`fecha`,g);t=n}t?.length>0&&(ne=t.map(e=>({alumno_id:e.alumno_id,estado:P[e.estado]??e.estado})))}catch(e){console.warn(`[asistencia] No se pudo restaurar desde tabla asistencias:`,e)}ne.forEach(e=>{if(Object.prototype.hasOwnProperty.call(N,e.alumno_id)){let t=P[e.estado]??e.estado;N[e.alumno_id]=t}});let F=[];if(C)try{F=await e.from(`justificaciones`).select(`alumno_id`).eq(`sesion_id`,C).then(e=>e.data||[]),F.forEach(e=>{Object.prototype.hasOwnProperty.call(N,e.alumno_id)&&(N[e.alumno_id]=`J`)})}catch(e){console.warn(`[asistencia] No se pudieron restaurar justificaciones:`,e)}Kn(d,{clase:h,horario:_,alumnos:v,estado:N,justificaciones:te,maestro:f,fechaHoy:g,claseId:s,sesionId:C,hasConflict:ee,serverDSL:T,snapshots:D,salonNombre:k,rutaId:M,sesionExistenteData:b,router:u})}catch(e){console.error(`[asistenciaView] Error fatal:`,e.message,e.stack),d.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${h(e.message)}</p>`}}function Kn(t,r){let{clase:i,horario:a,alumnos:o,estado:s,justificaciones:c,maestro:p,fechaHoy:m,claseId:h,snapshots:g,serverDSL:_,hasConflict:v,salonNombre:b,rutaId:S,sesionExistenteData:D,router:A}=r,j=r.sesionId,ee=e=>{if(A?.navigate){A.navigate(e);return}window.location.hash=`#/${e}`},M=[],P=`pm_asistencia_${h||j}_${m}`,F=_,I=null,re=Fe(),oe=null,L=null;if(!document.getElementById(`pm-asist-badge-styles`)){let e=document.createElement(`style`);e.id=`pm-asist-badge-styles`,e.textContent=`
      .pm-badge { 
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; 
        background: var(--pm-primary-light, rgba(59,130,246,0.15)); color: var(--pm-primary, #3b82f6);
        white-space: nowrap; border: 1px solid rgba(59,130,246,0.3);
      }
      .pm-badge-warning { background: rgba(245,158,11,0.15); color: #d97706; border-color: rgba(245,158,11,0.3); }
      .pm-badge-danger { background: rgba(239,68,68,0.15); color: #dc2626; border-color: rgba(239,68,68,0.3); }
      .pm-badge-muted { background: var(--pm-surface-2, #374151); color: #e5e7eb; border-color: rgba(255,255,255,0.2); }
      [data-theme="light"] .pm-badge-muted { background: #e5e7eb; color: #374151; border-color: #d1d5db; }
    `,document.head.appendChild(e)}t.innerHTML=`
    <style>
      .pm-asist-header { 
        display: flex; align-items: center; gap: 1rem;
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8); 
        color: white; 
        padding: 1.25rem 1.25rem 2.25rem 1.25rem; 
        border-bottom-left-radius: 28px; 
        border-bottom-right-radius: 28px;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 10;
        width: 100%;
      }
      .pm-asist-title { margin: 0; font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
      .pm-asist-subtitle { margin: 4px 0 0; font-size: 0.75rem; opacity: 0.85; font-weight: 500; color: rgba(255, 255, 255, 0.9); }
      .pm-asist-bulk-circles { display: flex; gap: 0.75rem; align-items: center; }
      .pm-bulk-circle {
        width: 34px; height: 34px; border-radius: 50%; border: 2px solid currentColor;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.1);
      }
      .pm-bulk-circle.p { color: #4ade80; border-color: rgba(74, 222, 128, 0.4); }
      .pm-bulk-circle.a { color: #f87171; border-color: rgba(248, 113, 113, 0.4); }
      .pm-bulk-circle:hover { transform: scale(1.1); background: currentColor; color: var(--pm-surface-2); }
      .pm-asist-nombre { cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
      .pm-asist-nombre:hover { color: var(--pm-primary); }
      .pm-copy-plan-btn {
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.35rem 0.75rem; border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        background: var(--pm-surface-2, #374151); color: var(--pm-text-muted, #9ca3af);
        font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
      }
      .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      [data-theme="light"] .pm-copy-plan-btn { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }
      [data-theme="light"] .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      .pm-route-selector-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: var(--pm-surface-2, #374151);
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        border-radius: 12px;
        margin: 0 1rem 1rem;
      }
      /* Contenedor de la lista para dar aire lateral */
      .pm-asist-alumnos-container {
        padding: 0 1rem 2rem;
      }
      .pm-route-selector-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--pm-text-muted, #9ca3af);
        white-space: nowrap;
      }
      .pm-route-selector {
        flex: 1;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.2));
        background: var(--pm-surface, #2d3748);
        color: var(--pm-text, #e5e7eb);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%239ca3af' d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2rem;
      }
      .pm-route-selector:focus {
        outline: none;
        border-color: var(--pm-primary, #007aff);
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-selector-wrap { background: #f9fafb; border-color: #e5e7eb; }
      [data-theme="light"] .pm-route-selector { background: #fff; color: #374151; border-color: #d1d5db; }
      [data-theme="light"] .pm-route-selector-label { color: #6b7280; }

      /* ── Planificacion Card Premium (Glassmorphism) ── */
      .pm-planificacion-card {
        background: rgba(var(--pm-surface-rgb, 30, 41, 59), 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        margin: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
      .pm-planificacion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .pm-planificacion-header:hover { background: rgba(255, 255, 255, 0.05); }
      .pm-planificacion-header-left { display: flex; align-items: center; gap: 1rem; }
      .pm-planificacion-icon-box {
        width: 42px; height: 42px; background: linear-gradient(135deg, var(--pm-primary), #60a5fa);
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      .pm-planificacion-info { display: flex; flex-direction: column; }
      .pm-planificacion-label { font-size: 0.65rem; font-weight: 800; color: var(--pm-primary); text-transform: uppercase; letter-spacing: 1px; }
      .pm-planificacion-nombre { font-size: 1.1rem; font-weight: 700; color: #fff; margin-top: 2px; }
      
      .pm-planificacion-actions { display: flex; align-items: center; gap: 0.75rem; }
      .pm-btn-circle {
        width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; display: flex;
        align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
      }
      .pm-btn-circle:hover { background: var(--pm-primary); border-color: var(--pm-primary); transform: rotate(45deg); }
      
      .pm-planificacion-dropdown {
        padding: 0 1.5rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-planificacion-tabs-pill {
        display: flex; background: rgba(0, 0, 0, 0.2); padding: 4px;
        border-radius: 30px; margin: 1.5rem 0; border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-plan-tab-pill {
        flex: 1; padding: 0.6rem; border: none; background: none; color: var(--pm-text-muted);
        font-size: 0.8rem; font-weight: 700; cursor: pointer; border-radius: 25px; transition: all 0.3s;
      }
      .pm-plan-tab-pill.active { background: var(--pm-primary); color: #fff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
      
      .pm-plan-list { max-height: 250px; overflow-y: auto; padding-right: 5px; }
      .pm-plan-item {
        display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
        border-radius: 12px; margin-bottom: 0.5rem; background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: all 0.2s;
      }
      .pm-plan-item:hover { background: rgba(255, 255, 255, 0.08); transform: translateX(5px); }
      .pm-plan-item.active { border-color: var(--pm-primary); background: rgba(59, 130, 246, 0.1); }
      .pm-plan-item-icon { font-size: 1.1rem; }
      .pm-plan-item-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
      [data-theme="light"] .pm-planificacion-card { background: #fff; border-color: #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
      [data-theme="light"] .pm-planificacion-header:hover { background: #f9fafb; }
      [data-theme="light"] .pm-planificacion-dropdown { background: #f9fafb; }
      [data-theme="light"] .pm-plan-item:hover { background: rgba(0,122,255,0.05); }

      .pm-active-tema-badge {
        font-size: 0.75rem;
        background: rgba(59, 130, 246, 0.15);
        color: var(--pm-primary);
        padding: 3px 10px;
        border-radius: 12px;
        margin-top: 5px;
        display: inline-block;
        font-weight: 600;
        border: 1px solid rgba(59, 130, 246, 0.3);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .pm-route-tree-dropdown-box {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
        max-height: 350px;
        overflow-y: auto;
        padding-right: 5px;
      }
      /* Scrollbar minimalista para el árbol */
      .pm-route-tree-dropdown-box::-webkit-scrollbar { width: 4px; }
      .pm-route-tree-dropdown-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      [data-theme="light"] .pm-active-tema-badge {
        background: rgba(0, 122, 255, 0.08);
        border-color: rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-tree-dropdown-box {
        border-top-color: #e5e7eb;
      }
      /* Estilos del tour movidos a AsistenciaTour.js */
      .pm-asist-actions-fixed {
        position: fixed;
        bottom: 80px; /* Por encima del menú inferior */
        left: 0; right: 0;
        padding: 0.75rem 1rem;
        background: rgba(var(--pm-bg-rgb), 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        gap: 0.75rem;
        z-index: 1000;
        border-top: 1px solid rgba(255,255,255,0.05);
        box-shadow: 0 -10px 30px rgba(0,0,0,0.2);
      }
      .pm-asist-btn-obs {
        flex: 1;
        background: var(--pm-surface-2);
        color: var(--pm-text);
        border: 1px solid var(--pm-border);
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pm-asist-btn-save {
        flex: 1.5;
        background: var(--pm-primary);
        color: #fff;
        border: none;
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(var(--pm-primary-rgb), 0.3);
        transition: all 0.2s;
      }
      .pm-asist-btn-obs:active, .pm-asist-btn-save:active { transform: scale(0.96); }

      /* ═════════════════════════════════════════════════════════════
         MOBILE OPTIMIZATION — max-width: 767px
         ═════════════════════════════════════════════════════════════ */
      @media (max-width: 767px) {
        /* ── Reduce overall padding/margins for compact layout ── */
        .pm-asist-header {
          padding: 1rem 1rem 1.5rem 1rem;
          margin-bottom: 1rem;
        }

        .pm-asist-alumnos-container {
          padding: 0 0.75rem 1.5rem 0.75rem;
        }

        .pm-route-selector-wrap {
          margin: 0 0.75rem 0.75rem 0.75rem;
          padding: 0.5rem 0.75rem;
        }

        /* ── DSL Editor: larger for more writing space ── */
        .pm-dsl-editor-container {
          min-height: 220px;
        }

        .pm-dsl-editable {
          min-height: 220px;
          padding: 0.85rem;
          font-size: 0.9rem;
        }

        .pm-dsl-placeholder {
          font-size: 0.75rem;
          line-height: 1.3;
          opacity: 0.7;
        }

        .pm-dsl-placeholder-title {
          font-size: 0.8rem;
          margin-bottom: 0.3rem;
        }

        .pm-dsl-placeholder-example {
          margin-bottom: 0.3rem;
          gap: 0.25rem;
        }

        .pm-dsl-placeholder-guide {
          font-size: 0.7rem;
        }

        /* ── Toolbar: compact buttons ── */
        .dsl-toolbar {
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0.5rem;
        }

        .pm-dsl-tool-btn {
          padding: 0.45rem 0.5rem;
          font-size: 0.75rem;
          flex: 0 1 auto;
          min-width: fit-content;
        }

        .pm-dsl-tool-btn.ai {
          font-size: 0.7rem;
          padding: 0.4rem 0.6rem;
        }

        /* ── Actions bar: adjust for mobile nav ── */
        .pm-asist-actions-fixed {
          bottom: 65px;
          padding: 0.6rem 0.75rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pm-asist-btn-obs,
        .pm-asist-btn-save {
          padding: 0.6rem 0.5rem;
          font-size: 0.8rem;
          border-radius: 8px;
          min-height: 40px;
        }

        .pm-asist-btn-obs i,
        .pm-asist-btn-save i {
          font-size: 1rem;
        }

        /* ── Planificación card: collapse some info ── */
        .pm-planificacion-card {
          margin: 0.75rem;
        }

        .pm-planificacion-header {
          padding: 1rem 1.25rem;
        }

        .pm-planificacion-info {
          min-width: 0;
        }

        .pm-planificacion-nombre {
          font-size: 1rem;
        }

        /* ── Hide non-essential sections to save space ── */
        .pm-route-tree-dropdown-box {
          max-height: 200px;
        }

        /* ── Reduce section margins ── */
        .pm-asist-dsl-section {
          margin-top: 1.25rem !important;
          padding: 0 0.75rem;
        }

        .pm-asist-section-title {
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        /* ── Optimize list items spacing ── */
        .pm-asist-item {
          margin-bottom: 0.45rem;
          padding: 0.65rem;
        }

        .pm-asist-nombre {
          font-size: 0.95rem;
        }

        .pm-asist-instrumento {
          font-size: 0.75rem;
        }
      }
    </style>

    <!-- Tour inyectado por AsistenciaTour.js -->

    <div class="pm-asist-root pm-animate-fade-in" style="position:relative; min-height:100vh; padding: 0;">
      <div id="pm-attendance-header"></div>

      <div class="pm-asist-content" style="padding: 0 1rem 160px;">
        <div class="pm-asist-progress-wrap" id="pm-progress-wrap" style="display:none; margin: 1rem 0;">
          <div class="pm-asist-progress-bar">
            <div class="pm-asist-progress-fill" id="pm-progress-fill"></div>
          </div>
          <span class="pm-asist-progress-label" id="pm-progress-label">0/${o.length}</span>
        </div>

        <div id="pm-asist-announce" role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden"></div>

        <div id="pm-alumnos-list" class="pm-alumnos-queue"></div>

        <div id="pm-planificacion-card" class="pm-planificacion-card" style="display:none; margin: 1rem 0;">
        <div id="pm-planificacion-header" class="pm-planificacion-header">
          <div class="pm-planificacion-header-left">
            <div class="pm-planificacion-icon-box">🗺️</div>
            <div class="pm-planificacion-info">
              <div class="pm-planificacion-label">Planificación Académica</div>
              <div id="pm-planificacion-nombre" class="pm-planificacion-nombre">Cargando...</div>
              <div id="pm-active-tema-badge" class="pm-active-tema-badge" style="display:none;"></div>
            </div>
          </div>
          <div class="pm-planificacion-actions">
            <button id="btn-manage-planning" class="pm-btn-circle" title="Ajustar Estructura">
              <i class="bi bi-gear-fill"></i>
            </button>
            <i class="bi bi-chevron-down pm-planificacion-toggle-btn"></i>
          </div>
        </div>
        <div id="pm-planificacion-dropdown" class="pm-planificacion-dropdown" style="display:none;">
          <div class="pm-planificacion-tabs-pill">
            <button class="pm-plan-tab-pill active" data-tab="rutas">Mis Rutas</button>
            <button class="pm-plan-tab-pill" data-tab="planificaciones">Biblioteca</button>
          </div>
          <div id="pm-plan-list-rutas" class="pm-plan-list"></div>
          <div id="pm-plan-list-planificaciones" class="pm-plan-list" style="display:none;"></div>
          
          <!-- EL ARBOL AHORA VIVE AQUI DENTRO -->
          <div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
          <div id="pm-curriculo-proposal-trigger" style="padding:0.5rem 0.75rem 0.75rem;">
            <button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="width:100%;font-size:0.82rem;">
              <i class="bi bi-stars"></i> Proponer plan curricular con IA
            </button>
          </div>
        </div>
      </div>

      <div class="pm-asist-dsl-section" style="margin-top:2rem;">
        <h3 class="pm-asist-section-title"><i class="bi bi-stars"></i> Registro de Clase</h3>
        <div id="pm-dsl-toolbar-container" style="margin-bottom:0.5rem;"></div>
        <div id="pm-dsl-editor-container"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.5rem;">
          <div id="pm-draft-indicator" style="display:none; padding:0.25rem 0.5rem; font-size:0.75rem; color:var(--pm-text-muted);"></div>
          <button class="pm-copy-plan-btn" id="btn-copy-as-plan" title="Copiar este contenido como borrador de planificación">
            <i class="bi bi-clipboard-plus"></i> Copiar como planificación
          </button>
        </div>
      </div>

      <div id="pm-academic-tools" style="margin-top:1.5rem; display:none;"></div>

      <!-- Barra de Acciones Fija (Por encima del menú inferior) -->
      <div class="pm-asist-actions-fixed">
        <button id="btn-guardar-obs" class="pm-asist-btn-obs" style="display:none;">
          <i class="bi bi-chat-left-text"></i> Observación
        </button>
        <button id="btn-guardar" class="pm-asist-btn-save">
          <i class="bi bi-cloud-upload"></i> Guardar sesión
        </button>
      </div>
    </div> <!-- Fin pm-asist-content -->
    </div>

    <!-- Modales... -->
  `;let ue=it(t.querySelector(`#pm-attendance-header`),{clase:i,horario:a,salonNombre:b,fechaHoy:m,totalAlumnos:o.length,hasConflict:v,onBack:()=>{De.destroy();try{xe.close()}catch{}M.forEach(e=>{try{e()}catch{}}),ee(`hoy`)}});M.push(()=>ue.destroy());let de=t.querySelector(`#pm-sync-badge-container`);if(de){let e=ae();de.appendChild(e.el)}let fe=Dn(t,{initialContent:_,claseId:h,onEditorChange:e=>{F=e}}),R=fe.getEditor(),z=t.querySelector(`#pm-dsl-editor-container`),me=ce(t,{onAceptar:e=>{R.setValue(e)}}),he=le(t,{onAccept:e=>{R.setValue(e)}}),ge=qe(z.parentNode,{onConfirm:async e=>{try{let n=o.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]})),{saved:r,errors:i}=await Be({sesionId:j,claseId:h,maestroId:p.id,fechaHoy:m,progressRecords:e,alumnos:n});i.length&&console.warn(`[Progress] Errores parciales:`,i);let a=t.querySelector(`#btn-guardar`);a&&(a.style.removeProperty(`display`),a.click())}catch(e){t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),f.error(`Error al guardar progreso: `+e.message)}},onCancel:()=>{t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`)}}),_e=$e(t.querySelector(`#pm-planificacion-dropdown`)||t,{onAdopt:async({instrumento:e,nivel:t,resumen:n,pilares:r})=>{try{let{curriculo:i,allObjetivos:a}=await k({instrumento:e,nivel:t,descripcion:n,pilares:r}),{linked:o}=await He({claseId:h,objetivos:a}),s=o>0?`Plan creado · ${o} registro${o===1?``:`s`} vinculado${o===1?``:`s`}`:`Plan curricular creado correctamente.`;f.success(s)}catch(e){f.error(`Error al crear el plan: `+e.message)}},onCancel:()=>{}});fe.initToolbar({onImproveClick:async e=>{let n=t.querySelector(`#btn-generar-informe`);n&&(n.disabled=!0);try{let t=await x(e);me.open({original:e,improved:t})}catch(e){f.error(`Error al generar informe: `+e.message)}finally{n&&(n.disabled=!1)}},onStructureClick:async e=>{let n=t.querySelector(`#btn-ia-magic`);n&&(n.disabled=!0);try{let t=oe?.getActiveIndicador(),n=await w(e,{presentes:o.filter(e=>s[e.id]===`P`).map(e=>e.nombre_completo),indicadorActivo:t?.nombre||null});he.open({original:e,dsl:n})}catch(e){f.error(`Error al estructurar con IA: `+e.message)}finally{n&&(n.disabled=!1)}},onAnalyzeClick:async e=>{await Un(async()=>{let n=o.filter(e=>s[e.id]&&s[e.id]!==`A`),r=(e,t)=>{let n=e.trim().split(/\s+/),r=n[0];return t.filter(e=>e.trim().split(/\s+/)[0]===r).length>1?n.slice(0,2).join(` `):r},a=o.map(e=>e.nombre_completo||e.nombre||``),c={alumnos:o.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:r(t,a)}}),presentes:n.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:r(t,a)}}),tipoClase:et(i),instrumento:i.instrumento||``,sesionesRecientes:(g||[]).slice(-2).map(e=>e.contenido||``).filter(Boolean),indicadorActivo:oe?.getActiveIndicador()?.nombre||``};t.querySelector(`#btn-guardar`)?.style.setProperty(`display`,`none`);let l=await T(e,c);if(!l?.progreso?.length){t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),f!==void 0&&f&&f.warning(`La IA no detectó registros de progreso en este texto.`);return}ge.open({progreso:l.progreso,resumen:l.resumen})},{onError:e=>{t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),f!==void 0&&f&&f.error(`Error al analizar con IA: `+e.message)}})}});let ve=fe.getToolbar();oe=vt(t,{claseId:h,clase:i,maestro:p,fechaHoy:m,rutaId:S,editor:R,onIndicadorSelect:e=>{R.insertText(`[${e.nombre}] `),ve&&ve.setContext({indicadorActivo:e.nombre});let n=t.querySelector(`#btn-guardar-obs`);n&&(n.style.display=``)},getDslContent:()=>R.getValue()}),M.push(()=>oe.destroy());let B=t.querySelector(`#btn-proponer-curriculo`);B&&(B.onclick=async()=>{B.disabled=!0,B.innerHTML=`<i class="bi bi-hourglass-split"></i> Analizando...`;try{let e=await Ye(h,12);if(e.registros.length===0){f.error(`No hay registros de progreso suficientes en las últimas 12 semanas para generar una propuesta.`);return}let t=await C(e,{instrumento:i?.instrumento||``,nivel:``,nombreClase:i?.nombre||``});_e.open({pilares:t.pilares,resumen:t.resumen,instrumento:i?.instrumento||``,nivel:``})}catch(e){f.error(`Error al generar propuesta: `+e.message)}finally{B.disabled=!1,B.innerHTML=`<i class="bi bi-stars"></i> Proponer plan curricular con IA`}});let ye=at(t,{editor:R,toolbar:ve}),be=ie();ye.inject(be,h),M.push(()=>ye.destroy());let xe=In(t,{sesionId:j,claseId:h,fechaHoy:m,maestroId:p.id,supabase:e,guardarJustificacion:Me,eliminarJustificacion:Pe,onJustifDeleted:e=>{s[e]=null,delete c[e]},onJustifSaved:(e,t)=>{c[e]=t},onJustifCancelled:(e,t)=>{s[e]=t},onRenderLista:e=>Ce.render(e),onUpdateProgress:()=>Te(),onAutoSave:e=>H(e),onAnnounce:e=>y(e)});M.push(()=>{try{xe.close()}catch{}});let Se=Pn(t,{sesionId:j,maestroId:p.id,editor:R,sesionExistenteData:D,onDraftRecovered:e=>{F=e,R.setValue(e)}});M.push(()=>Se.destroy()),t.querySelector(`#pm-academic-tools`),Bn(t,{rutaId:S,sesionId:j,claseId:h,maestro:p,fechaHoy:m,alumnos:o,estado:s,planificationCard:oe,editorContainer:z,getEditorValue:()=>R.getValue(),setEditorValue:e=>R.setValue(e),onDslContentClear:()=>{F=``},activeClassEventId:null,activeLevel:null,claseNombre:i?.nombre||`Clase`,onAppendModal:e=>{let n=t.querySelector(`.pm-asist-root`);n&&n.appendChild(e)}});let Ce=Ln(t,{alumnos:o,estado:s,rutaId:S,sesionId:j,fechaHoy:m,snapshots:g,justificaciones:c,obtenerJustificacion:Ne,onEstadoChange:(e,t)=>{s[e]=t},onOpenProgressPanel:e=>{V&&V.destroy(),V=we({alumno:e,rutaId:S,sessionId:j,claseId:h,fecha:m,horaInicio:a?.hora_inicio||null}),V.open(),M.push(()=>{V&&V.destroy()})},onOpenEvaluationDrawer:(e,n)=>{se(t,{student:e,sessionId:j,teacherId:p.id,snapshots:n})},onOpenJustifModal:(e,t,n)=>{xe.open(e,t,n)},onAutoSave:e=>H(e),onAnnounce:e=>y(e),onUpdateSnapshots:e=>{g.push(...e)}});M.push(()=>Ce.destroy());let V=null;function Te(){let e=o.length,n=Object.values(s).filter(e=>e!==null).length,r=t.querySelector(`#pm-progress-wrap`),i=t.querySelector(`#pm-progress-fill`),a=t.querySelector(`#pm-progress-label`);if(n===0){r.style.display=`none`;return}r.style.display=`flex`,i.style.width=`${n/e*100}%`,a.textContent=`${n}/${e}`}async function H(t=!1,n=!1){I&&clearTimeout(I);let r=async()=>{let t=o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),n={...j?{}:{clase_id:h},maestro_id:p.id,fecha:m,estado:`pendiente`,borrador:!0,asistencia:t||[],contenido:F||``};if(navigator.onLine)try{if(j){let{error:t}=await e.from(`sesiones_clase`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,j);if(!t){localStorage.setItem(`${P}_updated`,new Date().toISOString());return}throw t}else{let{data:t,error:r}=await e.from(`sesiones_clase`).insert([n]).select(`id`).single();if(!r&&t){j=t.id,console.log(`[asistencia] Nueva sesión creada:`,j),localStorage.setItem(`${P}_updated`,new Date().toISOString());return}throw r||Error(`No se pudo crear la sesión`)}}catch(e){console.warn(`[asistencia] Fallo operación directa, usando cola offline:`,e.message)}await l({tabla:`sesiones_clase`,operacion:j?`update`:`insert`,payload:{...j?{id:j}:{},...n}}),localStorage.setItem(`${P}_updated`,new Date().toISOString())};t?n?await r():await re.run(r):I=setTimeout(()=>{re.run(r).catch(e=>console.error(`[asistencia] Autosave error:`,e))},2e3)}let U=t.querySelector(`.pm-asist-actions-fixed`);if(U){let e=document.createElement(`button`);e.id=`btn-reporte-dia`,e.className=`pm-asist-btn-obs`,e.innerHTML=`📄 Reporte`,e.title=`Genera el Reporte Diario de Asistencia (PDF)`,e.style.flex=`1`,e.style.display=`none`,e.addEventListener(`click`,async t=>{t.preventDefault(),j&&(e.disabled=!0,e.innerHTML=`⏳...`,await N(j),e.disabled=!1,e.innerHTML=`📄 Reporte`)});let t=U.querySelector(`#btn-guardar`);U.insertBefore(e,t);let n=document.createElement(`button`);n.id=`btn-resumen-mes`,n.className=`pm-asist-btn-obs`,n.innerHTML=`📊 Resumen`,n.title=`Genera el Resumen Mensual de Asistencia (PDF)`,n.style.flex=`1`,n.style.display=`none`;let r=new Date;n.addEventListener(`click`,async e=>{e.preventDefault(),h&&(n.disabled=!0,n.innerHTML=`⏳...`,await te(h,r.getFullYear(),r.getMonth()+1),n.disabled=!1,n.innerHTML=`📊 Resumen`)}),U.insertBefore(n,t)}t.querySelector(`#btn-guardar`).onclick=async()=>{let r=t.querySelector(`#btn-guardar`),a=r.textContent;r.textContent=`Guardando...`,r.disabled=!0,await re.run(async()=>{try{let a=o.filter(e=>s[e.id]).map(e=>({...h?{clase_id:h}:{},alumno_id:e.id,fecha:m,estado:s[e.id],registrado_por:p.id})),c=a.length>0,f=F&&F.trim().length>0;if(!c&&!f)throw Error(`Debes marcar asistencia o agregar contenido para guardar`);if(await H(!0,!0),!j){let{data:t}=await e.from(`sesiones_clase`).select(`id`).eq(`clase_id`,h).eq(`maestro_id`,p.id).eq(`fecha`,m).maybeSingle();t&&(j=t.id)}if(c&&h)try{let e=a.map(e=>({...e,...j&&{sesion_clase_id:j}}));await O(e),console.log(`[asistencia] Registradas asistencias individuales:`,e.length)}catch(e){if(console.error(`[asistencia] Error registrando asistencias en bulk:`,e),!navigator.onLine||!j){console.warn(`[asistencia] Encolando asistencias para sync offline...`);for(let e of a)await l({tabla:`asistencias`,operacion:`upsert`,payload:{clase_id:h,alumno_id:e.alumno_id,fecha:m,estado:e.estado,registrado_por:p.id,...j?{sesion_clase_id:j}:{}}})}else throw Error(`No se pudieron registrar las asistencias individuales: `+e.message)}if(j&&(c||f)){let t=o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),{error:r}=await e.from(`sesiones_clase`).update({borrador:!1,estado:`registrada`,asistencia:t,contenido:F||``,updated_at:new Date().toISOString()}).eq(`id`,j).select();if(r){console.warn(`estado "registrada" no permitido, usando fallback "cerrada":`,r.message);let{error:n}=await e.from(`sesiones_clase`).update({borrador:!1,estado:`cerrada`,asistencia:t,contenido:F||``,updated_at:new Date().toISOString()}).eq(`id`,j).select();n&&(console.warn(`Fallback "cerrada" también falló, actualizando solo borrador:`,n.message),await e.from(`sesiones_clase`).update({borrador:!1,asistencia:t,contenido:F||``,updated_at:new Date().toISOString()}).eq(`id`,j))}n(),u(`hoy`),u(`calendario`),u(`metricas`),d().catch(e=>console.warn(`[asistenciaView] Error al actualizar notificaciones:`,e))}if(j){let{academicService:e}=await E(async()=>{let{academicService:e}=await import(`./academicService-dKTfSUQ8.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3])),{createAchievementsSummaryModal:n}=await E(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-tKnFb9f5.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([6,5])),i=await e.processSessionClosure(j);i&&i.length>0?(r.textContent=`¡Logros detectados!`,r.style.background=`var(--pm-success)`,await n(t,i)):console.warn(`[asistencia] processSessionClosure devolvió 0 logros (puede que no haya progresos vinculados a esta sesión aún).`)}else console.warn(`[asistencia] No se pudo obtener sesionId para procesar logros.`);r.textContent=`✓ Guardado`,r.style.background=`var(--apple-success)`;let g=U?.querySelector(`#btn-reporte-dia`);g&&(g.style.display=``);let _=U?.querySelector(`#btn-resumen-mes`);_&&(_.style.display=``);let v=Object.values(s).filter(e=>e===`P`).length,b=Object.values(s).filter(e=>e===`A`).length;y(`Sesión guardada exitosamente. ${v} presentes, ${b} ausentes.`);let x=document.createElement(`div`);x.className=`pm-saved-overlay`,x.innerHTML=`
        <div class="pm-saved-options">
          <div class="pm-saved-header">
            <div class="pm-saved-check-anim">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>Sesión Guardada</h3>
            <p>¿Qué deseas hacer ahora?</p>
          </div>
          <div class="pm-saved-actions">
            <button class="pm-btn pm-btn-primary" id="btn-resumen-pedagogico">
              <i class="bi bi-bar-chart-steps"></i> Resumen pedagógico
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-editar-asistencia">
              <i class="bi bi-pencil"></i> Editar Asistencia
            </button>
            <button class="pm-btn pm-btn-primary" id="btn-reporte-dia-overlay">
              <i class="bi bi-file-earmark-pdf"></i> Reporte del día (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-resumen-mes-overlay">
              <i class="bi bi-bar-chart-line"></i> Resumen del mes (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-informe-ped-overlay">
              <i class="bi bi-mortarboard"></i> Informe pedagógico (PDF)
            </button>
            <button class="pm-btn pm-btn-outline" id="btn-compartir-correo">
              <i class="bi bi-envelope"></i> Compartir por Correo
            </button>
            <button class="pm-btn pm-btn-success" id="btn-compartir-whatsapp">
              <i class="bi bi-whatsapp"></i> Compartir por WhatsApp
            </button>
          </div>
          <div class="pm-saved-nav">
            <button class="pm-saved-nav-btn" id="btn-volver-hoy" title="Volver a Hoy">
              <i class="bi bi-arrow-left-circle"></i>
            </button>
            <button class="pm-saved-nav-btn" id="btn-ir-calendario" title="Ir al Calendario">
              <i class="bi bi-calendar3"></i>
            </button>
          </div>
        </div>
      `,document.body.appendChild(x);let S=x.querySelector(`#btn-resumen-pedagogico`),C=x.querySelector(`#btn-editar-asistencia`),w=x.querySelector(`#btn-compartir-correo`),T=x.querySelector(`#btn-compartir-whatsapp`),D=x.querySelector(`#btn-volver-hoy`),k=x.querySelector(`#btn-ir-calendario`);L&&L.destroy(),L=Oe();let A=L;S&&(S.onclick=()=>{A.open({sesionId:j,claseNombre:i?.nombre||`Clase`,fecha:m,supabase:e})}),C&&(C.onclick=()=>{x.remove(),r.textContent=`Guardar sesión`,r.style.background=``,r.disabled=!1,r.style.display=``}),w&&(w.onclick=async()=>{let e=o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),t=encodeURIComponent(`Reporte de Clase - ${i?.nombre||``} - ${m}`),n=nt(e,F,o,i,m);rt(`mailto:?subject=${t}&body=`,n,1800)}),T&&(T.onclick=async()=>{rt(`https://wa.me/?text=`,nt(o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),F,o,i,m),1600)}),D&&(D.onclick=()=>{x.remove(),ee(`hoy`)}),k&&(k.onclick=()=>{x.remove(),ee(`calendario`)});let M=x.querySelector(`#btn-reporte-dia-overlay`);M&&(M.onclick=async()=>{let e=M.innerHTML;M.disabled=!0,M.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{await N(j)}finally{M.disabled=!1,M.innerHTML=e}});let P=x.querySelector(`#btn-resumen-mes-overlay`);P&&(h?P.onclick=async()=>{let e=P.innerHTML;P.disabled=!0,P.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{let e=new Date;await te(h,e.getFullYear(),e.getMonth()+1)}finally{P.disabled=!1,P.innerHTML=e}}:(P.disabled=!0,P.title=`No disponible para actividades especiales`,P.style.opacity=`0.5`));let I=x.querySelector(`#btn-informe-ped-overlay`);I&&(h?I.onclick=async()=>{let e=I.innerHTML;I.disabled=!0,I.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{let e=new Date;await ne(h,e.getFullYear(),e.getMonth()+1)}finally{I.disabled=!1,I.innerHTML=e}}:(I.disabled=!0,I.title=`No disponible para actividades especiales`,I.style.opacity=`0.5`))}catch(e){console.error(`Error al guardar sesión:`,e),r.textContent=e.message||`Error al guardar`,r.style.background=`var(--pm-danger)`,r.disabled=!1,setTimeout(()=>{r.textContent=a,r.style.background=``},3e3)}})};let Ee=On(t,{onMarkAll:async e=>{o.forEach(t=>{s[t.id]=e}),Ce.render(),Te();try{await H(!0)}catch(t){console.warn(`[asistencia] autoSave error on bulk ${e}:`,t)}y(`Todos los ${o.length} alumnos marcados como ${e===`P`?`presentes`:`ausentes`}.`)}});M.push(()=>Ee.destroy()),Ce.render();let De=new pe(t);De.mount();let ke=t.querySelector(`#pm-btn-help`);return ke&&(ke.onclick=()=>De.start()),()=>{console.log(`[AsistenciaView] Cleanup ejecutado por el Router`),De.destroy();try{xe.close()}catch{}document.querySelectorAll(`.pm-saved-overlay`).forEach(e=>e.remove()),M.forEach(e=>{try{e()}catch{}})}}export{Gn as renderAsistenciaView};