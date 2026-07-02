const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pushService-B2lrPakC.js","assets/AppToast-DNGTRY9B.js","assets/supabase-DtQm9tmr.js","assets/maestroAuth-BSssKFds.js","assets/main-maestros-Dx9fUrFr.js","assets/pwaInstaller-z4oiul73.js","assets/vendor-fghBzJSA.js","assets/vendor-COf7rB16.css","assets/idb-CdbSE3_O.js","assets/lifecycleManager-DB4okEAD.js","assets/preload-helper-CZgWQFsJ.js","assets/main-maestros-j-hYLO3G.css","assets/sistemaView-D1h25ZIO.js","assets/router-DweyPy3s.js","assets/groqService-P7B49C_r.js","assets/CHANGELOG-DPV2OdzA.js","assets/ausenciasPanel-_BOGMsNy.js","assets/ausenciaModal-CEScFRa-.js","assets/AppModal-B_r6aHTM.js","assets/portalUtils-CkF82Yyk.js"])))=>i.map(i=>d[i]);
import{t as e}from"./main-maestros-Dx9fUrFr.js";import{i as t}from"./supabase-DtQm9tmr.js";import{i as n,n as r,o as i}from"./maestroAuth-BSssKFds.js";import{a,c as o,d as s,f as c,i as l,l as u,n as d,p as f,r as p}from"./pushService-B2lrPakC.js";import{t as m}from"./preload-helper-CZgWQFsJ.js";import{t as h}from"./AppModal-B_r6aHTM.js";import{n as g}from"./phoneUtils-Cpl-jyW9.js";import{t as _}from"./sanitize-9bDGu3i_.js";import{i as v}from"./disponibilidadApi-Ozfvjgao.js";import{n as y}from"./CHANGELOG-DPV2OdzA.js";import{c as b,i as x}from"./portalUtils-CkF82Yyk.js";import{t as S}from"./ausenciaModal-CEScFRa-.js";var C={async open(){let e=await d(),t=await l();h.open({title:`Notificaciones`,size:`md`,body:this._renderBody(e,t),saveText:`Hecho`,onShow:e=>this._initLogic(e),onSave:async e=>(await this._handleSave(e),!0)})},_renderBody(e,t){return`
      <div class="pm-notif-config pm-fade-in">
        <p class="apple-caption mb-4">Gestiona cómo y cuándo quieres recibir las alertas del sistema SOI.</p>

        <!-- Grupo 1: Estado General -->
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-primary">
              <i class="bi bi-broadcast"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Alertas Push</span>
              <span class="pm-settings-row__desc">Habilitar en este dispositivo</span>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-push" ${t?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Grupo 2: Recordatorios de Clase -->
        <div class="pm-settings-label">RECORDATORIOS DE CLASE</div>
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-warning">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Antes de empezar</span>
              <select id="modal-notif-min-antes" class="pm-apple-select-inline">
                <option value="5" ${e.min_antes_clase===5?`selected`:``}>5 min</option>
                <option value="15" ${e.min_antes_clase===15?`selected`:``}>15 min</option>
                <option value="30" ${e.min_antes_clase===30?`selected`:``}>30 min</option>
              </select>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-pre" ${e.alerta_pre_clase?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>

          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Pase de lista pendiente</span>
              <select id="modal-notif-min-post" class="pm-apple-select-inline">
                <option value="30" ${e.min_post_clase_sin_registro===30?`selected`:``}>30 min</option>
                <option value="60" ${e.min_post_clase_sin_registro===60?`selected`:``}>1 hora</option>
              </select>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-post" ${e.alerta_post_clase?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Grupo 3: Otras Alertas -->
        <div class="pm-settings-label">OTRAS ALERTAS</div>
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-info">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Resumen de 24 horas</span>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-24h" ${e.alerta_24h?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <div class="mt-4">
          <button class="btn-apple-secondary w-100" id="modal-notif-test">
            <i class="bi bi-send me-2"></i> Enviar prueba de diagnóstico
          </button>
        </div>

        <style>
          .pm-settings-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: var(--pm-text-muted);
            margin: 1.5rem 0 0.5rem 0.5rem;
            letter-spacing: 0.05em;
          }
          .pm-settings-group {
            background: var(--pm-surface-2);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--pm-border);
          }
          .pm-settings-row {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 1rem;
            border-bottom: 1px solid var(--pm-border);
          }
          .pm-settings-row:last-child { border-bottom: none; }
          .pm-settings-row__icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.1rem;
            flex-shrink: 0;
          }
          .pm-settings-row__info { flex: 1; min-width: 0; }
          .pm-settings-row__title { display: block; font-size: 0.95rem; font-weight: 500; color: var(--pm-text); }
          .pm-settings-row__desc { display: block; font-size: 0.75rem; color: var(--pm-text-muted); }
          
          .pm-apple-select-inline {
            background: transparent;
            border: none;
            color: var(--pm-primary);
            font-size: 0.85rem;
            font-weight: 600;
            padding: 0;
            cursor: pointer;
            outline: none;
          }
          
          /* Switch iOS Style */
          .pm-apple-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
            flex-shrink: 0;
          }
          .pm-apple-switch input { opacity: 0; width: 0; height: 0; }
          .pm-apple-switch-slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background-color: var(--pm-border);
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 24px;
          }
          .pm-apple-switch-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          input:checked + .pm-apple-switch-slider { background-color: var(--pm-success); }
          input:checked + .pm-apple-switch-slider:before { transform: translateX(20px); }
        </style>
      </div>
    `},_initLogic(e){e.querySelector(`#modal-notif-test`).addEventListener(`click`,async()=>{await c()||window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Primero activa las notificaciones`,type:`warning`}}))});let t=e.querySelector(`#modal-notif-push`);t.addEventListener(`change`,async()=>{if(t.checked,t.checked){let e=await s();e.success?this._toast(`Notificaciones activadas`,`success`):(t.checked=!1,this._toast(e.error||`Error al suscribir`,`danger`))}else(await f()).success&&this._toast(`Notificaciones desactivadas`,`info`)})},async _handleSave(e){await u({alerta_pre_clase:e.querySelector(`#modal-notif-pre`).checked,min_antes_clase:parseInt(e.querySelector(`#modal-notif-min-antes`).value,10),alerta_post_clase:e.querySelector(`#modal-notif-post`).checked,min_post_clase_sin_registro:parseInt(e.querySelector(`#modal-notif-min-post`).value,10),alerta_24h:e.querySelector(`#modal-notif-24h`).checked,alerta_48h:!0}),this._toast(`Preferencias guardadas`,`success`)},_toast(e,t){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}},w={container:null,async init(){document.getElementById(`push-diagnostic-panel`)||(this.createPanel(),await this.checkStatus())},createPanel(){this.container=document.createElement(`div`),this.container.id=`push-diagnostic-panel`,this.container.innerHTML=`
      <div class="push-diagnostic-overlay" id="push-diagnostic-overlay">
        <div class="push-diagnostic-card">
          <div class="push-diagnostic-header">
            <h5><i class="bi bi-bell-fill"></i> Configuración de Notificaciones</h5>
            <button class="btn-close" id="push-diagnostic-close"></button>
          </div>
          
          <div class="push-diagnostic-body">
            <!-- Estado General -->
            <div class="mb-4">
              <div class="push-status-grid">
                <div class="push-status-item" id="status-browser">
                  <div class="status-icon"><i class="bi bi-browser-chrome"></i></div>
                  <div class="status-label">Navegador</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-permission">
                  <div class="status-icon"><i class="bi bi-shield-check"></i></div>
                  <div class="status-label">Permiso</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-serviceworker">
                  <div class="status-icon"><i class="bi bi-gear"></i></div>
                  <div class="status-label">Service Worker</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-subscription">
                  <div class="status-icon"><i class="bi bi-radioactive"></i></div>
                  <div class="status-label">Suscripción</div>
                  <div class="status-value">...</div>
                </div>
              </div>
            </div>

            <!-- Diagnóstico Detallado -->
            <div class="push-diagnostic-details" id="diagnostic-details">
              <!-- Se llena dinámicamente -->
            </div>

            <!-- Acciones -->
            <div class="push-diagnostic-actions mt-4">
              <button class="btn-push-ios-primary w-100" id="btn-enable-push">
                <i class="bi bi-bell-fill"></i> Activar Notificaciones
              </button>
              <button class="btn-push-ios-secondary w-100" id="btn-test-push">
                <i class="bi bi-send-fill"></i> Probar Notificación
              </button>
            </div>

            <!-- Resultado -->
            <div class="push-diagnostic-result mt-3" id="diagnostic-result"></div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(this.container),this.injectStyles(),this.bindEvents()},injectStyles(){if(document.getElementById(`push-diagnostic-styles`))return;let e=document.createElement(`style`);e.id=`push-diagnostic-styles`,e.textContent=`
      .push-diagnostic-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        animation: pm-fade-in 0.3s ease-out;
      }
      
      .push-diagnostic-card {
        background: var(--pm-surface, #fff);
        border-radius: 24px;
        width: 92%;
        max-width: 440px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: pm-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .push-diagnostic-header {
        background: var(--pm-primary);
        color: white;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      
      .push-diagnostic-header h5 {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      
      .push-diagnostic-body {
        padding: 1.5rem;
        background: var(--pm-surface);
      }
      
      .push-status-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 1.5rem;
      }
      
      .push-status-item {
        background: var(--pm-surface-2);
        border-radius: 20px;
        padding: 1.25rem;
        text-align: center;
        border: 1px solid var(--pm-border);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .push-status-item.success { border-color: rgba(74, 222, 128, 0.4); background: rgba(74, 222, 128, 0.05); }
      .push-status-item.warning { border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.05); }
      .push-status-item.error { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); }
      
      .push-status-item .status-icon {
        font-size: 1.75rem;
        margin-bottom: 0.75rem;
        color: var(--pm-primary);
      }
      
      .push-status-item.success .status-icon { color: #22c55e; }
      .push-status-item.warning .status-icon { color: #f59e0b; }
      
      .push-status-item .status-label {
        font-size: 0.7rem;
        color: var(--pm-text-muted);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      
      .push-status-item .status-value {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--pm-text);
      }
      
      .push-diagnostic-details {
        background: var(--pm-surface-2);
        border-radius: 16px;
        padding: 0.5rem 1rem;
        border: 1px solid var(--pm-border);
        margin-bottom: 1.5rem;
      }
      
      .push-diagnostic-details .log-item {
        padding: 10px 0;
        border-bottom: 1px solid var(--pm-border);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .push-diagnostic-details .log-item:last-child { border-bottom: none; }
      .push-diagnostic-details .log-ok { color: #22c55e; }
      .push-diagnostic-details .log-warn { color: #f59e0b; }
      .push-diagnostic-details .log-error { color: #ef4444; }
      
      .push-diagnostic-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .btn-push-ios-primary {
        background: var(--pm-primary);
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 14px;
        font-weight: 700;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        transition: all 0.2s;
      }
      
      .btn-push-ios-secondary {
        background: var(--pm-surface-2);
        color: var(--pm-text);
        border: 1px solid var(--pm-border);
        padding: 0.85rem;
        border-radius: 14px;
        font-weight: 600;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }
      
      .btn-push-ios-primary:active, .btn-push-ios-secondary:active {
        transform: scale(0.97);
        opacity: 0.8;
      }

      .push-diagnostic-result {
        margin-top: 1.25rem;
        padding: 1rem;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        animation: pm-fade-in 0.3s;
      }
      
      .push-diagnostic-result.success { background: rgba(34, 197, 94, 0.1); color: #166534; }
      .push-diagnostic-result.error { background: rgba(239, 68, 68, 0.1); color: #991b1b; }
      .push-diagnostic-result.info { background: rgba(59, 130, 246, 0.1); color: #1e40af; }

      [data-portal-theme="dark"] .push-diagnostic-card { background: #1c1c1e; }
      [data-portal-theme="dark"] .push-status-item { background: #2c2c2e; }
    `,document.head.appendChild(e)},bindEvents(){document.getElementById(`push-diagnostic-close`).addEventListener(`click`,()=>this.close()),document.getElementById(`push-diagnostic-overlay`).addEventListener(`click`,e=>{e.target.id===`push-diagnostic-overlay`&&this.close()}),document.getElementById(`btn-enable-push`).addEventListener(`click`,()=>this.enablePush()),document.getElementById(`btn-test-push`).addEventListener(`click`,()=>this.testPush())},async checkStatus(){let e=[],t=document.getElementById(`diagnostic-details`),n=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),r=/iPhone|iPad|iPod/i.test(navigator.userAgent),i=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);e.push({text:`📱 Dispositivo: ${n?r?`iOS`:`Android`:`Desktop`}`,type:`info`}),n&&i&&e.push({text:`⚠️ iOS Safari: Requiere iOS 16.4+ y agregar a pantalla de inicio`,type:`warn`});let o=a();e.push({text:`Navegador: ${o?`✅ Compatible`:`❌ No compatible`}`,type:o?`ok`:`error`}),this.updateStatusItem(`status-browser`,o);let s=`default`;`Notification`in window&&(s=Notification.permission);let c=s===`granted`;e.push({text:`Permiso: ${s===`granted`?`✅ Otorgado`:s===`denied`?`❌ Denegado - ve a Configuración del navegador`:`⚠️ No solicitado - click en Activar abajo`}`,type:c?`ok`:`warn`}),this.updateStatusItem(`status-permission`,c,s);let l=`no-registrado`,u=!1;if(`serviceWorker`in navigator)try{let t=await navigator.serviceWorker.getRegistration(`/sw.js`);t?(l=t.active?`✅ Activo`:`⏳ Registrado`,u=!!t.active,e.push({text:`Service Worker: ${l}`,type:`ok`})):e.push({text:`Service Worker: ❌ No registrado`,type:`error`}),this.updateStatusItem(`status-serviceworker`,u)}catch(t){e.push({text:`Service Worker: ❌ Error - ${t.message}`,type:`error`}),this.updateStatusItem(`status-serviceworker`,!1)}else e.push({text:`Service Worker: ❌ No soportado`,type:`error`}),this.updateStatusItem(`status-serviceworker`,!1);let d=`no-suscrito`;if(u)try{let t=await p();d=t.subscribed?`✅ Suscrito`:`❌ No suscrito`,e.push({text:`Suscripción: ${d}`,type:t.subscribed?`ok`:`warn`}),this.updateStatusItem(`status-subscription`,t.subscribed)}catch(t){e.push({text:`Suscripción: ❌ Error - ${t.message}`,type:`error`}),this.updateStatusItem(`status-subscription`,!1)}else e.push({text:`Suscripción: ⚠️ SW inactivo`,type:`warn`}),this.updateStatusItem(`status-subscription`,!1);return t.innerHTML=e.map(e=>`<div class="log-item log-${e.type}">${e.text}</div>`).join(``),{browserSupported:o,permOk:c,swActive:u}},updateStatusItem(e,t,n=``){let r=document.getElementById(e);r.className=`push-status-item ${t?`success`:`warning`}`;let i=r.querySelector(`.status-value`);i.textContent=t?`✓ Listo`:`⚠ Revisar`,n&&(i.textContent+=` (${n})`)},async enablePush(){let e=document.getElementById(`diagnostic-result`),t=document.getElementById(`btn-enable-push`);t.disabled=!0,t.innerHTML=`<span class="pm-spinner-sm me-2"></span> Configurando...`;try{e.className=`push-diagnostic-result info`;let t=/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent),n=/iPhone|iPad|iPod/i.test(navigator.userAgent);t&&n?e.innerHTML=`📱 iOS detectado: Se abrirá una solicitud de permiso...`:t?e.innerHTML=`📱 Android detectado: Solicitando permiso...`:e.innerHTML=`Solicitando permiso de notificaciones...`;let{granted:r,error:i}=await o();if(!r)throw Error((i||`Permiso denegado`)+(t?`<br><br><strong>En móvil:</strong> Ve a Configuración → Safari → Notificaciones → Permitir`:``));e.innerHTML=`Registrando en el sistema de notificaciones...`;let a=await s();if(!a.success)throw Error(a.error||`Error al suscribirse a push`);e.className=`push-diagnostic-result success`;let c=/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent),l=`✅ ¡Notificaciones push activadas!`;c&&(l+=`<br><small>💡 En móvil, agrega la app a pantalla de inicio para notificaciones completas (botón Compartir → Agregar a pantalla de inicio)</small>`),e.innerHTML=l,await this.checkStatus(),setTimeout(()=>this.testPush(),2e3)}catch(t){e.className=`push-diagnostic-result error`,e.innerHTML=`❌ ${t.message}`}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-bell me-2"></i>Activar Notificaciones Push`}},async testPush(){let e=document.getElementById(`diagnostic-result`);try{let t=await c();t.success?(e.className=`push-diagnostic-result success`,e.innerHTML=`✅ ${t.method===`serviceWorker`?`¡Notificación del sistema enviada! Deberías verla en tu escritorio.`:`Notificación enviada (modo local).`}`):(e.className=`push-diagnostic-result error`,e.innerHTML=`❌ ${_(t.error)}`)}catch(t){e.className=`push-diagnostic-result error`,e.innerHTML=`❌ Error: ${_(t.message)}`}},open(){this.init();let t=document.getElementById(`push-diagnostic-overlay`);t.style.display=`flex`;let n=document.querySelector(`#push-diagnostic-panel .push-diagnostic-card`);n&&(this._trap&&this._trap.dispose(),this._trap=e(n,{onClose:()=>this.close()}))},close(){this._trap&&=(this._trap.dispose(),null);let e=document.getElementById(`push-diagnostic-overlay`);e&&(e.style.display=`none`)}},T={dirty:!1,saving:!1,theme:localStorage.getItem(`portal-maestros-theme`)||`system`,pushEnabled:!1},E=[{key:`lunes`,label:`Lunes`},{key:`martes`,label:`Martes`},{key:`miércoles`,label:`Miércoles`},{key:`jueves`,label:`Jueves`},{key:`viernes`,label:`Viernes`},{key:`sábado`,label:`Sábado`},{key:`domingo`,label:`Domingo`}];function D(e){let t=n();if(!t){e.innerHTML=`
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa.</p>
      </div>`;return}T.dirty=!1,T.saving=!1,m(()=>import(`./pushService-B2lrPakC.js`).then(e=>e.s).then(async e=>{T.pushEnabled=(await e.getNotificationPreferences()).push_activo;let t=document.querySelector(`#btn-toggle-push-main input`);t&&(t.checked=T.pushEnabled);let n=document.getElementById(`pm-notif-sub-badge`);n&&(n.textContent=T.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`)}),__vite__mapDeps([0,1,2,3])),e.innerHTML=`
    <div class="pm-settings pm-fade-in" role="main" aria-label="Configuración del perfil">
      <header class="pm-settings-header">
        <h1 class="apple-display-md">Perfil</h1>
        <p class="apple-caption">Gestiona tu cuenta, apariencia y notificaciones</p>
      </header>
      <div class="pm-settings-grid">
        <div id="pm-banner-perfil-incompleto" style="display:none;" class="pm-profile-alert"></div>
        <div class="pm-settings-col" id="col-izquierda"></div>
        <div class="pm-settings-col" id="col-derecha"></div>
      </div>
      <footer class="pm-settings-footer">
        <p>SOI Sistema Operativo Institucional</p>
        <p class="pm-settings-footer__version">
          v${y} &copy; 2026
          ${t?.es_admin?`<button id="pm-ver-sistema-btn" style="
            margin-left:0.5rem;background:none;border:none;cursor:pointer;
            color:var(--pm-primary,#3b82f6);font-size:0.72rem;font-weight:600;
            padding:0.1rem 0.4rem;border-radius:6px;text-decoration:underline;
          ">Ver historial del sistema</button>`:``}
        </p>
      </footer>
    </div>`;let r=document.getElementById(`col-izquierda`),i=document.getElementById(`col-derecha`);O(r,t),k(r,t),A(i),j(i,t),M(i),N(i,t),i.insertAdjacentHTML(`beforeend`,`<div id="pm-collaboration-container"></div>`),L(i),R(i),G(t),B(t),K(),m(async()=>{let{getPermisos:e,solicitarPermiso:t}=await import(`./main-maestros-Dx9fUrFr.js`).then(e=>e.a);return{getPermisos:e,solicitarPermiso:t}},__vite__mapDeps([4,1,5,2,3,6,7,8,0,9,10,11])).then(async({getPermisos:e,solicitarPermiso:n})=>{try{await e(t.id),document.getElementById(`pm-collaboration-container`)}catch(e){console.warn(`[PerfilView] Error cargando permisos de colaboración:`,e.message)}})}function O(e,t){let n=b(t.nombre_completo);e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-profile-hero" aria-label="Información del perfil">
      <div class="pm-profile-hero__content">
        <div class="pm-settings-avatar">
          ${t.avatar_url?`<img src="${x(t.avatar_url)}" alt="Avatar" class="pm-settings-avatar__img">`:`<div class="pm-settings-avatar__placeholder" aria-hidden="true">${x(n)}</div>`}
          <button class="pm-settings-avatar__edit" id="btnCambiarAvatar" title="Cambiar foto" aria-label="Cambiar foto de perfil">
            <i class="bi bi-camera" aria-hidden="true"></i>
          </button>
        </div>
        <div class="pm-profile-hero__info">
          <h2 class="pm-profile-hero__name">${x(t.nombre_completo)}</h2>
          <p class="pm-profile-hero__email">${x(t.email)}</p>
          ${t.especialidad?`
            <span class="chip-apple active" aria-label="Especialidad: ${x(t.especialidad)}">
              <i class="bi bi-mortarboard" aria-hidden="true"></i> ${x(t.especialidad)}
            </span>`:``}
        </div>
      </div>
    </section>`)}function k(e,t){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="datos-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-person-circle pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="datos-title" class="pm-settings-section__title">Datos Personales</h3>
          <p class="pm-settings-section__desc">Información básica de tu cuenta</p>
        </div>
      </div>
      <div class="pm-settings-form-grid">
        <div class="pm-settings-field">
          <label for="perfilNombre" class="apple-caption">Nombre Completo</label>
          <input type="text" class="input-apple" id="perfilNombre" value="${x(t.nombre_completo)}" placeholder="Tu nombre">
        </div>
        <div class="pm-settings-field">
          <label for="perfilTelefono" class="apple-caption">Teléfono</label>
          <input type="tel" class="input-apple" id="perfilTelefono" value="${x(t.tlf||t.telefono||``)}" placeholder="809-000-0000" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
        </div>
        <div class="pm-settings-field">
          <label for="perfilEspecialidad" class="apple-caption">Especialidad</label>
          <input type="text" class="input-apple" id="perfilEspecialidad" value="${x(t.especialidad||``)}" placeholder="Ej. Violín">
        </div>
      </div>
      <div class="pm-settings-actions">
        <button class="btn-apple-primary" id="btnGuardarPerfil" disabled>
          <i class="bi bi-check2" aria-hidden="true"></i>
          <span>Guardar Cambios</span>
        </button>
      </div>
    </section>`)}function A(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="apariencia-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-palette pm-icon-amber" aria-hidden="true"></i>
        <div>
          <h3 id="apariencia-title" class="pm-settings-section__title">Apariencia</h3>
          <p class="pm-settings-section__desc">Personaliza el tema visual</p>
        </div>
      </div>
      <div class="pm-theme-picker" role="radiogroup" aria-label="Seleccionar tema">
        <button class="pm-theme-opt" data-theme="light" id="pm-theme-light" role="radio" aria-checked="false">
          <div class="pm-theme-preview light"></div><span>Claro</span>
        </button>
        <button class="pm-theme-opt" data-theme="dark" id="pm-theme-dark" role="radio" aria-checked="false">
          <div class="pm-theme-preview dark"></div><span>Oscuro</span>
        </button>
        <button class="pm-theme-opt" data-theme="system" id="pm-theme-system" role="radio" aria-checked="false">
          <div class="pm-theme-preview system"></div><span>Auto</span>
        </button>
      </div>
    </section>`)}function j(e,t){let n=a(),r=n?`<span class="pm-badge-sub" id="pm-notif-sub-badge" aria-live="polite" aria-atomic="true">${T.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`}</span>`:``;e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="notif-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-bell pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="notif-title" class="pm-settings-section__title">Notificaciones</h3>
          <p class="pm-settings-section__desc">Gestiona tus alertas y avisos</p>
        </div>
        <label class="pm-apple-switch" id="btn-toggle-push-main" aria-label="Activar notificaciones push">
          <input type="checkbox" ${T.pushEnabled?`checked`:``}>
          <span class="pm-apple-switch-slider"></span>
        </label>
      </div>
      ${r}
      <div class="pm-settings-actions-row" style="margin-top:0.5rem;">
        <button class="btn-apple-utility w-100" id="btn-abrir-config-notif">
          <i class="bi bi-gear-wide-connected" aria-hidden="true"></i> Configurar preferencias...
        </button>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="btn-probar-notificacion">
          <i class="bi bi-send"></i> Probar notificación
        </button>
        <button class="btn-apple-utility" id="btn-push-diagnostic">
          <i class="bi bi-broadcast"></i> Diagnosticar
        </button>
      </div>
      ${n?``:`<p class="apple-caption mt-2" style="color:var(--pm-danger)">Push no soportado en este navegador.</p>`}
    </section>`)}function M(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="ausencias-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-event pm-icon-teal" aria-hidden="true"></i>
        <div>
          <h3 id="ausencias-title" class="pm-settings-section__title">Ausencias</h3>
          <p class="pm-settings-section__desc">Gestiona tus permisos</p>
        </div>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="pm-btn-ver-ausencias"><i class="bi bi-clock-history" aria-hidden="true"></i> Historial</button>
        <button class="btn-apple-utility" id="pm-btn-solicitar-ausencia"><i class="bi bi-plus-lg" aria-hidden="true"></i> Solicitar</button>
      </div>
    </section>`)}function N(e,t){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="solicitudes-title" id="pm-solicitudes-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-envelope-paper pm-icon-blue" aria-hidden="true"></i>
        <div style="flex-grow: 1;">
          <h3 id="solicitudes-title" class="pm-settings-section__title">Necesidades</h3>
          <p class="pm-settings-section__desc">Materiales y pedagógicas</p>
        </div>
        <button class="btn-apple-secondary btn-apple-sm" id="btn-nueva-necesidad">
          <i class="bi bi-plus-lg" aria-hidden="true"></i> Solicitar
        </button>
      </div>

      <div id="sol-historial" class="mt-3">
        <div class="text-center text-muted py-2" style="font-size:0.85rem;">
          <span class="spinner-border spinner-border-sm me-1"></span>Cargando...
        </div>
      </div>
    </section>`),P(t)}async function P(e){await I(e.id),document.getElementById(`btn-nueva-necesidad`)?.addEventListener(`click`,()=>{F(e)})}function F(e){h.open({title:`Nueva Solicitud`,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
      <form id="form-sol-necesidad" novalidate>
        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-semibold text-muted mb-1">Tipo *</label>
            <select class="form-select input-apple" id="sol-tipo" required>
              <option value="">Seleccioná el tipo</option>
              <option value="material">Material</option>
              <option value="pedagogico">Pedagógico</option>
              <option value="tecnico">Técnico</option>
              <option value="institucional">Institucional</option>
            </select>
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-semibold text-muted mb-1">Categoría</label>
            <select class="form-select input-apple" id="sol-categoria">
              <option value="">— sin categoría —</option>
              <option value="cuerdas">Cuerdas</option>
              <option value="cañas">Cañas</option>
              <option value="resinas">Resinas</option>
              <option value="atriles">Atriles</option>
              <option value="metodos">Métodos</option>
              <option value="partituras">Partituras</option>
              <option value="reparacion">Reparación de instrumentos</option>
              <option value="taller">Taller específico</option>
              <option value="capacitacion">Capacitación</option>
              <option value="apoyo_pedagogico">Apoyo pedagógico</option>
              <option value="material_aula">Material de aula</option>
              <option value="salon">Necesidades de salón</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold text-muted mb-1">Título *</label>
            <input type="text" class="form-control input-apple" id="sol-titulo"
                   placeholder="Ej: Cuerdas para violines de iniciación" required maxlength="120">
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-semibold text-muted mb-1">Área / Instrumento</label>
            <input type="text" class="form-control input-apple" id="sol-area" placeholder="Ej: Violín">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label small fw-semibold text-muted mb-1">Cantidad</label>
            <input type="number" class="form-control input-apple" id="sol-cantidad" min="1" placeholder="10">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label small fw-semibold text-muted mb-1">Prioridad *</label>
            <select class="form-select input-apple" id="sol-prioridad" required>
              <option value="baja">Baja</option>
              <option value="media" selected>Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold text-muted mb-1">Descripción *</label>
            <textarea class="form-control input-apple" id="sol-descripcion" rows="3"
                      placeholder="Describí la necesidad con detalle..." required maxlength="800"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold text-muted mb-1">Observaciones adicionales</label>
            <textarea class="form-control input-apple" id="sol-observaciones" rows="2"
                      placeholder="Preferencias, especificaciones, etc." maxlength="400"></textarea>
          </div>
          <div class="col-12 d-flex align-items-center gap-3 mt-4 pt-3 border-top">
            <button type="submit" class="btn-apple-primary flex-grow-1" id="btn-sol-submit">
              <i class="bi bi-send me-1" aria-hidden="true"></i>Enviar Solicitud
            </button>
            <span id="sol-status" class="small text-muted" style="display:none; flex-grow:1; text-align:right;"></span>
          </div>
        </div>
      </form>
    `,onOpen:n=>{n.querySelector(`#form-sol-necesidad`).addEventListener(`submit`,async r=>{r.preventDefault();let i=n.querySelector(`#sol-tipo`)?.value?.trim(),a=n.querySelector(`#sol-titulo`)?.value?.trim(),o=n.querySelector(`#sol-descripcion`)?.value?.trim(),s=n.querySelector(`#sol-prioridad`)?.value||`media`;if(!i||!a||!o){[{id:`#sol-tipo`,v:i},{id:`#sol-titulo`,v:a},{id:`#sol-descripcion`,v:o}].forEach(({id:e,v:t})=>n.querySelector(e)?.classList.toggle(`is-invalid`,!t));return}let c=n.querySelector(`#btn-sol-submit`),l=n.querySelector(`#sol-status`);c&&(c.disabled=!0,c.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`),l&&(l.style.display=`none`);try{let{error:r}=await t.from(`solicitudes_necesidades`).insert({maestro_id:e.id,maestro_nombre:e.nombre_completo||e.nombre||``,tipo_necesidad:i,categoria:n.querySelector(`#sol-categoria`)?.value||null,titulo:a,descripcion:o,prioridad:s,cantidad:parseInt(n.querySelector(`#sol-cantidad`)?.value)||null,area:n.querySelector(`#sol-area`)?.value?.trim()||null,observaciones:n.querySelector(`#sol-observaciones`)?.value?.trim()||null,estado:`pendiente`,fecha_solicitud:new Date().toISOString().split(`T`)[0]});if(r)throw r;l&&(l.textContent=`✓ Solicitud enviada correctamente`,l.className=`small text-success`,l.style.display=`block`),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Solicitud enviada correctamente`,type:`success`}})),await I(e.id),setTimeout(()=>{h.close()},1e3)}catch(e){console.error(`[solicitudes]`,e),l&&(l.textContent=`Error al enviar. Intentá de nuevo.`,l.className=`small text-danger`,l.style.display=`block`)}finally{c&&(c.disabled=!1,c.innerHTML=`<i class="bi bi-send me-1"></i>Enviar solicitud`)}})}})}async function I(e){let n=document.getElementById(`sol-historial`);if(n)try{let{data:r,error:i}=await t.from(`solicitudes_necesidades`).select(`*`).eq(`maestro_id`,e).order(`created_at`,{ascending:!1}).limit(20);if(i)throw i;if(!r||r.length===0){n.innerHTML=`<p class="text-muted small fst-italic mb-0">No tenés solicitudes anteriores.</p>`;return}let a={pendiente:`bg-warning-subtle text-warning-emphasis`,en_revision:`bg-info-subtle text-info-emphasis`,aprobada:`bg-success-subtle text-success-emphasis`,rechazada:`bg-danger-subtle text-danger-emphasis`,resuelta:`bg-secondary-subtle text-secondary-emphasis`},o={urgente:`text-danger`,alta:`text-warning`,media:`text-primary`,baja:`text-secondary`};n.innerHTML=r.map(e=>`
      <div class="card border-0 shadow-sm mb-2">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div class="flex-grow-1 overflow-hidden">
              <div class="fw-semibold small text-truncate">${x(e.titulo)}</div>
              <div class="text-muted" style="font-size:0.72rem;">
                ${x(e.tipo_necesidad)} · ${x(e.fecha_solicitud||`—`)} ·
                <span class="${o[e.prioridad]||`text-secondary`}">${x(e.prioridad)}</span>
              </div>
            </div>
            <span class="badge flex-shrink-0 ${a[e.estado]||`bg-secondary-subtle text-secondary-emphasis`}">${x((e.estado||``).replace(`_`,` `))}</span>
          </div>
          ${e.respuesta_admin?`
            <div class="border-start border-2 border-primary ps-2 mt-2">
              <div class="text-muted" style="font-size:0.72rem;font-weight:600;">Respuesta admin:</div>
              <div class="small">${x(e.respuesta_admin)}</div>
            </div>`:``}
        </div>
      </div>`).join(``)}catch(e){console.error(`[historial sol]`,e),n&&(n.innerHTML=`<p class="text-danger small mb-0">Error al cargar el historial.</p>`)}}function L(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="install-title" id="pm-install-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-phone-fill pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="install-title" class="pm-settings-section__title">Instalar App</h3>
          <p class="pm-settings-section__desc">Acceso rápido desde tu dispositivo</p>
        </div>
      </div>
      <div id="pm-install-body">
        <p style="font-size:0.82rem;color:var(--pm-text-muted);margin:0 0 0.75rem;">
          Instalá el portal como aplicación nativa para usarlo sin navegador, con acceso offline y notificaciones push.
        </p>
        <div class="pm-settings-actions-row">
          <button class="btn-apple-primary w-100" id="pm-btn-install-profile" style="gap:0.5rem;">
            <i class="bi bi-download"></i> Instalar en este dispositivo
          </button>
        </div>
        <p id="pm-install-note" class="pm-install-note" style="display:none;"></p>
      </div>
    </section>`);let t=document.getElementById(`pm-btn-install-profile`),n=document.getElementById(`pm-install-note`);if(window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`){t.innerHTML=`<i class="bi bi-check-circle-fill"></i> App ya instalada`,t.disabled=!0,t.style.opacity=`0.6`;return}t?.addEventListener(`click`,()=>{window.pwaInstaller?window.pwaInstaller.promptInstall():(n.style.display=`block`,n.innerHTML=`
        <strong>Instalación manual:</strong><br>
        • <b>Chrome/Edge (Android/PC):</b> Menú ⋮ → "Instalar app"<br>
        • <b>Safari (iPhone/iPad):</b> Compartir <i class="bi bi-box-arrow-up"></i> → "Añadir a pantalla inicio"<br>
        • <b>Firefox:</b> no admite PWA nativa.`)}),window.addEventListener(`beforeinstallprompt`,()=>{t&&(t.disabled=!1)},{once:!0})}function R(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section pm-section-danger" aria-labelledby="sesion-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-lock pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="sesion-title" class="pm-settings-section__title">Seguridad</h3>
          <p class="pm-settings-section__desc">Cerrar sesión en este equipo</p>
        </div>
        <button class="btn-apple-secondary" id="btnCerrarSesion" style="border-color:var(--pm-danger);color:var(--pm-danger)">Salir</button>
      </div>
    </section>`)}function z(e,t,n){return`
    <div class="pm-avail-franja" data-dia="${e}" data-index="${t}">
      <input type="time" class="pm-apple-time" value="${n.inicio||`08:00`}" data-field="inicio" aria-label="Hora inicio">
      <span>a</span>
      <input type="time" class="pm-apple-time" value="${n.fin||`12:00`}" data-field="fin" aria-label="Hora fin">
      <button class="pm-avail-franja__del" aria-label="Eliminar franja"><i class="bi bi-trash" aria-hidden="true"></i></button>
    </div>`}function B(e){document.querySelectorAll(`#perfilNombre, #perfilTelefono, #perfilEspecialidad, .pm-apple-time`).forEach(e=>{e.addEventListener(`input`,()=>{T.dirty=!0;let e=document.getElementById(`btnGuardarPerfil`);e&&(e.disabled=!1)})}),document.getElementById(`btnGuardarPerfil`)?.addEventListener(`click`,()=>V(e)),document.getElementById(`btnCerrarSesion`)?.addEventListener(`click`,U),document.getElementById(`pm-ver-sistema-btn`)?.addEventListener(`click`,()=>{m(async()=>{let{renderSistemaView:e}=await import(`./sistemaView-D1h25ZIO.js`);return{renderSistemaView:e}},__vite__mapDeps([12,1,4,5,2,3,6,7,8,0,9,10,11,13,14,15])).then(({renderSistemaView:e})=>{h.open({title:`<i class="bi bi-cpu-fill me-2"></i>Sistema SOI — v${y}`,size:`xl`,saveText:null,cancelText:`Cerrar`,body:`<div id="pm-sistema-modal-body"></div>`,onOpen:t=>{e(t.querySelector(`#pm-sistema-modal-body`))}})})}),document.getElementById(`btnCambiarAvatar`)?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Cambio de avatar disponible próximamente`,type:`info`}}))});let t=document.querySelector(`#btn-toggle-push-main input`);t?.addEventListener(`change`,async e=>{if(t.disabled=!0,t.checked){let e=await s();e.success?(T.pushEnabled=!0,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificaciones activadas`,type:`success`}}))):(t.checked=!1,T.pushEnabled=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e.error||`Error al activar`,type:`danger`}})))}else await f(),T.pushEnabled=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificaciones desactivadas`,type:`info`}}));t.disabled=!1;let n=document.getElementById(`pm-notif-sub-badge`);n&&(n.textContent=T.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`)}),document.getElementById(`btn-abrir-config-notif`)?.addEventListener(`click`,()=>C.open()),document.getElementById(`btn-push-diagnostic`)?.addEventListener(`click`,()=>w.open()),document.getElementById(`btn-probar-notificacion`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`btn-probar-notificacion`);e.disabled=!0,e.innerHTML=`<span class="pm-settings-spinner"></span> Enviando...`;let t=await c();t.success?(e.innerHTML=`<i class="bi bi-check2"></i> Notificación enviada`,setTimeout(()=>{e.innerHTML=`<i class="bi bi-send"></i> Probar notificación`,e.disabled=!1},2e3)):(e.innerHTML=`<i class="bi bi-exclamation-triangle"></i> Error`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t.error||`No se pudo enviar notificación de prueba. Verifica los permisos.`,type:`danger`}})),setTimeout(()=>{e.innerHTML=`<i class="bi bi-send"></i> Probar notificación`,e.disabled=!1},2e3))}),document.getElementById(`pm-theme-light`)?.addEventListener(`click`,()=>W(`light`)),document.getElementById(`pm-theme-dark`)?.addEventListener(`click`,()=>W(`dark`)),document.getElementById(`pm-theme-system`)?.addEventListener(`click`,()=>W(`system`)),document.getElementById(`pm-btn-ver-ausencias`)?.addEventListener(`click`,async()=>{let{ausenciasPanel:e}=await m(async()=>{let{ausenciasPanel:e}=await import(`./ausenciasPanel-_BOGMsNy.js`);return{ausenciasPanel:e}},__vite__mapDeps([16,1,2,3,17,4,5,6,7,8,0,9,10,11,18,19]));e.open()}),document.getElementById(`pm-btn-solicitar-ausencia`)?.addEventListener(`click`,()=>S.open()),document.querySelectorAll(`.pm-avail-dia__header`).forEach(e=>{e.addEventListener(`click`,()=>{e.dataset.dia;let t=e.closest(`.pm-avail-dia`),n=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,!n),t.classList.toggle(`open`,!n)})}),document.querySelectorAll(`.pm-avail-add-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.dia,n=e.closest(`.pm-avail-dia`),r=document.getElementById(`pm-avail-franjas-${t}`),i=r.querySelectorAll(`.pm-avail-franja`).length;r.insertAdjacentHTML(`beforeend`,z(t,i,{inicio:`08:00`,fin:`12:00`})),n.classList.add(`open`),n.querySelector(`.pm-avail-dia__header`).setAttribute(`aria-expanded`,`true`),T.dirty=!0,document.getElementById(`btnGuardarPerfil`).disabled=!1})}),document.addEventListener(`click`,e=>{let t=e.target.closest(`.pm-avail-franja__del`);t&&(t.closest(`.pm-avail-franja`).remove(),T.dirty=!0,document.getElementById(`btnGuardarPerfil`).disabled=!1)})}async function V(e){let n=document.getElementById(`perfilNombre`).value.trim(),i=g(document.getElementById(`perfilTelefono`).value.trim())||document.getElementById(`perfilTelefono`).value.trim(),a=document.getElementById(`perfilEspecialidad`).value.trim(),o=H();if(!n){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`El nombre es obligatorio`,type:`danger`}}));return}T.saving=!0;let s=document.getElementById(`btnGuardarPerfil`),c=s.innerHTML;s.disabled=!0,s.innerHTML=`<span class="pm-settings-spinner"></span><span>Guardando...</span>`;try{let s=await v(e.id,o);if(!s.success){let e=s.errors.join(`
`);throw Error(e)}let{error:c}=await t.from(`maestros`).update({nombre_completo:n,tlf:i,especialidad:a}).eq(`id`,e.id);if(c)throw c;let l={...e,nombre_completo:n,nombre:n,telefono:i,tlf:i,especialidad:a,disponibilidad:o};localStorage.setItem(r,JSON.stringify(l)),T.dirty=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Perfil actualizado`,type:`success`}})),window.pwaInstaller&&window.pwaInstaller.evaluateInsights()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al guardar: `+e.message,type:`danger`}}))}finally{T.saving=!1,s.disabled=!1,s.innerHTML=c}}function H(){let e={};return E.forEach(({key:t})=>{let n=[];document.querySelectorAll(`[data-dia="${t}"].pm-avail-franja`).forEach(e=>{let t=e.querySelector(`[data-field="inicio"]`)?.value,r=e.querySelector(`[data-field="fin"]`)?.value;t&&r&&n.push({inicio:t,fin:r})}),e[t]=n}),e}function U(){h.open({title:`¿Cerrar Sesión?`,size:`sm`,body:`
      <div style="text-align:center; padding:1rem 0;">
        <i class="bi bi-box-arrow-right" style="font-size:2.5rem;color:var(--pm-danger);opacity:0.8;"></i>
        <p style="margin-top:1rem;">¿Estás seguro que quieres salir?</p>
      </div>`,saveText:`Salir`,cancelText:`Cancelar`,onSave:async()=>(await i(),window.location.reload(),!0)})}function W(e){let t=e===`system`?window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`:e;document.documentElement.setAttribute(`data-bs-theme`,t),document.documentElement.setAttribute(`data-portal-theme`,t),document.documentElement.classList.toggle(`pm-dark`,t===`dark`),document.querySelectorAll(`.pm-theme-opt`).forEach(t=>{t.setAttribute(`aria-checked`,t.dataset.theme===e?`true`:`false`),t.classList.toggle(`active`,t.dataset.theme===e)}),localStorage.setItem(`portal-maestros-theme`,e),T.theme=e}function G(e){let t=!e.especialidad||!e.disponibilidad||Object.keys(e.disponibilidad||{}).length===0,n=document.getElementById(`pm-banner-perfil-incompleto`);n&&(t?(n.style.display=`block`,n.innerHTML=`
      <div class="pm-profile-alert__inner">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        <div><strong>Completa tu perfil</strong><p>Agrega tu especialidad y disponibilidad horaria.</p></div>
      </div>`):n.style.display=`none`)}function K(){document.querySelectorAll(`.card-apple`).forEach((e,t)=>{e.style.opacity=`0`,e.style.transform=`translateY(12px)`,setTimeout(()=>{e.style.transition=`opacity 0.4s ease, transform 0.4s ease`,e.style.opacity=`1`,e.style.transform=`translateY(0)`},50*t)})}var q=`
  .pm-profile-alert {
    grid-column: 1 / -1;
    padding: 0 0 0.5rem;
  }
  .pm-profile-alert__inner {
    background: rgba(234, 179, 8, 0.12);
    border: 1px solid rgba(234, 179, 8, 0.4);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--pm-warning);
  }
  .pm-profile-alert__inner i { font-size: 1.4rem; flex-shrink: 0; }
  .pm-profile-alert__inner strong { display: block; font-size: 0.9rem; }
  .pm-profile-alert__inner p { margin: 0.15rem 0 0; font-size: 0.78rem; opacity: 0.85; }
  .pm-badge-warning {
    background: rgba(234, 179, 8, 0.15);
    color: var(--pm-warning);
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
    letter-spacing: 0.05em;
  }
  .pm-avail-days { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
  .pm-avail-dia { border: 1px solid var(--pm-border); border-radius: 10px; overflow: hidden; }
  .pm-avail-dia__header {
    width: 100%;
    background: var(--pm-surface-2);
    border: none;
    padding: 0.6rem 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--pm-text);
    transition: background 0.15s;
  }
  .pm-avail-dia__header:hover { background: var(--pm-border); }
  .pm-avail-dia__label { font-size: 0.85rem; font-weight: 600; flex: 1; text-align: left; }
  .pm-avail-dia__count { font-size: 0.72rem; color: var(--pm-text-muted); }
  .pm-avail-dia__arrow { font-size: 0.8rem; color: var(--pm-text-muted); transition: transform 0.2s; }
  .pm-avail-dia.open .pm-avail-dia__arrow { transform: rotate(180deg); }
  .pm-avail-dia__body { 
    padding: 0; 
    background: var(--pm-surface); 
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  }
  .pm-avail-dia.open .pm-avail-dia__body {
    max-height: 1000px;
    padding: 0.85rem;
  }
  .pm-avail-franjas { display: flex; flex-direction: column; gap: 0.4rem; }
  .pm-avail-franja {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--pm-surface-2);
    border-radius: 8px;
    padding: 0.4rem 0.6rem;
  }
  .pm-avail-franja span { font-size: 0.75rem; color: var(--pm-text-muted); flex-shrink: 0; }
  .pm-apple-time {
    background: var(--pm-surface);
    border: 1px solid var(--pm-border);
    border-radius: 6px;
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
    color: var(--pm-text);
    font-family: inherit;
    color-scheme: light;
  }
  .pm-avail-franja__del {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--pm-text-muted);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 4px;
    transition: color 0.15s;
    flex-shrink: 0;
  }
  .pm-avail-franja__del:hover { color: var(--pm-danger); }
  .pm-avail-add-btn { margin-top: 0.5rem; width: 100%; }
  .pm-avail-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .pm-avail-actions .pm-avail-add-btn { flex: 1; }
  .pm-avail-actions .pm-avail-copy-btn { flex: 0 0 auto; }
  
  /* Popup de copiar horario */
  .pm-copy-popup { position: fixed; inset: 0; z-index: 9999; }
  .pm-copy-popup__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
  .pm-badge-sub {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 12px;
    background: var(--pm-primary-light, rgba(59,130,246,0.12));
    color: var(--pm-primary, #3b82f6);
    margin: 0.25rem 0 0 0;
  }
  .pm-copy-popup__content { 
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--pm-surface); border-radius: 12px; padding: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 200px;
  }
  .pm-copy-popup__title { margin: 0 0 0.75rem; font-weight: 600; font-size: 0.9rem; }
  .pm-copy-popup__options { display: flex; flex-direction: column; gap: 0.25rem; }
  .pm-copy-dest-btn { 
    background: var(--pm-surface-2); border: none; padding: 0.5rem 0.75rem; 
    border-radius: 6px; text-align: left; cursor: pointer; color: var(--pm-text);
  }
  .pm-copy-dest-btn:hover { background: var(--pm-border); }

  /* Colaboración de permisos */
  .pm-collab-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  .pm-collab-card {
    background: var(--pm-surface-2);
    border: 1px solid var(--pm-border);
    border-radius: 12px;
    padding: 0.85rem;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .pm-collab-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: rgba(59, 130, 246, 0.3);
  }
  .pm-collab-card.active {
    border-color: rgba(34, 197, 94, 0.3);
  }
  .pm-collab-card.active:hover {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.05);
  }
  .pm-collab-card.pending {
    border-color: rgba(234, 179, 8, 0.3);
  }
  .pm-collab-card.pending:hover {
    border-color: rgba(234, 179, 8, 0.5);
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.05);
  }
  .pm-collab-card__header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .pm-collab-card__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: var(--pm-surface);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    flex-shrink: 0;
  }
  .pm-collab-card__info {
    flex: 1;
  }
  .pm-collab-card__name {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: var(--pm-text);
  }
  .pm-collab-card__desc {
    font-size: 0.75rem;
    color: var(--pm-text-muted);
    margin: 0.2rem 0 0;
    line-height: 1.3;
  }
  .pm-collab-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--pm-border);
    gap: 0.75rem;
  }
  .pm-collab-badge {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .pm-collab-badge.active {
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
  }
  .pm-collab-badge.pending {
    background: rgba(234, 179, 8, 0.12);
    color: #eab308;
  }
  .pm-collab-badge.inactive {
    background: var(--pm-surface);
    color: var(--pm-text-muted);
    border: 1px solid var(--pm-border);
  }
  .pm-collab-card__action {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
  .pm-collab-help-text {
    font-size: 0.7rem;
    color: var(--pm-text-muted);
    margin: 0;
    text-align: right;
  }

  /* Lista alumnos/clases en gestionAlumnosClasesView */
  .pgac-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.6rem;
  }
  .pgac-list-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.6rem;
    background: var(--pm-surface-2);
    border-radius: 8px;
    border: 1px solid var(--pm-border);
    transition: background 0.15s;
  }
  .pgac-list-item:hover { background: var(--pm-border); }
  .pgac-list-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(59,130,246,0.15);
    color: var(--pm-primary, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .pgac-list-avatar--teal {
    background: rgba(20,184,166,0.15);
    color: #14b8a6;
  }
  .pgac-list-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }
  .pgac-list-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--pm-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pgac-list-sub {
    font-size: 0.72rem;
    color: var(--pm-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Nota instalación manual */
  .pm-install-note {
    font-size: 0.78rem;
    color: var(--pm-text-muted);
    background: var(--pm-surface-2);
    border: 1px solid var(--pm-border);
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
    margin-top: 0.65rem;
    line-height: 1.6;
  }
`;if(!document.getElementById(`pm-avail-styles`)){let e=document.createElement(`style`);e.id=`pm-avail-styles`,e.textContent=q,document.head.appendChild(e)}export{D as renderPerfilView};