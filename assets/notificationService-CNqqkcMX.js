import{i as e}from"./supabase-KnARm58N.js";import{i as t}from"./maestroAuth-lT-ZcZZd.js";import{i as n,n as r,s as i}from"./maestroDataService-BGjCE976.js";import{o as a}from"./pushService-DVAfSSV4.js";import{t as o}from"./lifecycleManager-CSbEuGDH.js";var s=null;function c(e,t){s=e}function l(e){s&&s(e)}function u(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function d(e){if(!e||typeof e!=`string`)return{claseId:null,fecha:null,isValid:!1};let t=e.match(/^\/asistencia\/([a-f0-9-]{36})\/(\d{4}-\d{2}-\d{2})$/);return t?{claseId:t[1],fecha:t[2],isValid:!0}:{claseId:null,fecha:null,isValid:!1}}function f(e){let{claseId:t,fecha:n,isValid:r}=d(e);if(!r){console.warn(`[notificationService] Invalid deep link:`,e);return}window.appNavigate?.({view:`asistencia`,claseId:t,fecha:n})}a(e=>{if(e.event===`subscriptionChanged`)console.log(`[Notif] Push subscription changed:`,e.subscribed);else if(e.event===`notificationReceived`){console.log(`[Notif] Real-time push received:`,e.notification),b(e.notification);let t=e.notification;t?.data?.deep_link?f(t.data.deep_link):t?.data?.deep_link_url&&f(t.data.deep_link_url),T.some(t=>t.id===e.notification.id)||(T.unshift({...e.notification,created_at:e.notification.created_at||new Date().toISOString()}),O())}});var p=new o(`maestro-notifications`),m=30*1e3,h=60*1e3,g=120*1e3,_=new Map;function v(e){return`${e.tipo||`unknown`}:${e.clase_id||e.alumno_id||e.id||`generic`}:${Math.floor(Date.now()/h)}`}function y(){let e=Date.now();for(let[t,n]of _.entries())e>n&&_.delete(t)}function b(e){let t=v(e),n=Date.now()+g;_.set(t,n)}function x(){return y(),_.size}function S(e){return`notif_cache_${e}`}function C(e){try{let t=T.filter(e=>!String(e.id).startsWith(`local_`)).slice(0,30);localStorage.setItem(S(e),JSON.stringify(t))}catch{}}function w(e){try{let t=localStorage.getItem(S(e));return t?JSON.parse(t):[]}catch{return[]}}var T=[],E=[];function D(e){return E.push(e),e(T),()=>{E=E.filter(t=>t!==e)}}function O(){E.forEach(e=>e([...T]))}async function k(){let n=t();if(!n)return[];T.length===0&&(T=w(n.id),T.length>0&&O());try{let{data:t,error:r}=await e.from(`notificaciones`).select(`*`).eq(`profile_id`,n.id).order(`created_at`,{ascending:!1}).limit(30);if(r)return console.warn(`[NotifService] Error fetch:`,r),T;let i=(t||[]).map(e=>({...e,created_at:e.created_at||new Date().toISOString()})),a=T.filter(e=>String(e.id).startsWith(`local_`));return T=[...i,...a],await A(n.id),C(n.id),O(),T}catch(e){return console.error(`[NotifService]`,e),T}}async function A(e){try{let t=new Date,a=u(t),o=t.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[s,c]=await Promise.all([n(),i(e,a,a)]),l=s.map(e=>e.id),d=Object.fromEntries(s.map(e=>[e.id,e])),f=(await r(l)).filter(e=>e.dia?.toLowerCase()===o);c.filter(e=>e.estado===`pendiente`||e.estado===`borrador`||e.borrador===!0);let p=new Set(c.filter(e=>e.borrador===!1||e.estado===`registrada`||e.estado===`cerrada`).map(e=>e.clase_id));T=T.filter(e=>String(e.id).startsWith(`local_`)?!p.has(e.clase_id):!0);let m=new Date;for(let e of f){if(!e.hora_fin||p.has(e.clase_id))continue;let[t,n]=e.hora_fin.split(`:`),r=new Date;r.setHours(parseInt(t,10),parseInt(n,10),0,0);let i=(m-r)/6e4;if(i<30)continue;let o=d[e.clase_id],s=`${e.clase_id}_${a}`;if(T.some(e=>e.referencia_id===s&&e.tipo===`sesion_sin_registrar`))continue;let c=e.hora_fin?e.hora_fin.slice(0,5):``,l=e.hora_inicio?e.hora_inicio.slice(0,5):``,u=l&&c?` (${l}–${c})`:``,f=Math.round(i),h=f>=60?`hace ${Math.floor(f/60)}h ${f%60}min`:`hace ${f} min`;T.unshift({id:`local_`+s,tipo:`sesion_sin_registrar`,titulo:`Clase sin registrar`,mensaje:`${o?.nombre||`Tu clase`}${u} terminó ${h}. Registrá la asistencia para que quede guardada.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:s,clase_id:e.clase_id,fecha:a})}for(let e of f){if(!e.hora_inicio)continue;let[t,n]=e.hora_inicio.split(`:`),r=new Date;r.setHours(parseInt(t,10),parseInt(n,10),0,0);let i=(r-m)/6e4;if(i<0||i>15)continue;let o=d[e.clase_id],s=`prox_${e.clase_id}_${a}`;if(T.some(e=>e.referencia_id===s))continue;let c=e.hora_inicio?e.hora_inicio.slice(0,5):``,l=Math.round(i);T.unshift({id:`local_`+s,tipo:`recordatorio_clase`,titulo:`Clase por empezar`,mensaje:`${o?.nombre||`Tu clase`}${c?` a las ${c}`:``} empieza en ${l} ${l===1?`minuto`:`minutos`}. Prepará la planificación.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:s,clase_id:e.clase_id,fecha:a})}}catch(e){console.warn(`[NotifService] Error local alerts:`,e)}}async function j(n){let r=t(),i=T.find(e=>e.id===n);if(i&&(i.estado=`leida`),O(),r&&C(r.id),!String(n).startsWith(`local_`))try{await e.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`id`,n)}catch(e){console.warn(`[NotifService] Error al marcar leída`,e)}}async function M(n){let r=t();if(T=T.filter(e=>e.id!==n),O(),r&&C(r.id),String(n).startsWith(`local_`))return{success:!0};try{let{error:t}=await e.from(`notificaciones`).delete().eq(`id`,n);return t?(console.error(`[NotifService] Error al eliminar en base de datos:`,t.message),{success:!1,error:t}):{success:!0}}catch(e){return console.error(`[NotifService] Excepción al eliminar:`,e),{success:!1,error:e}}}async function N(){let n=t();if(T.forEach(e=>{e.estado!==`leida`&&(e.estado=`leida`)}),O(),n&&C(n.id),n)try{await e.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`profile_id`,n.id).neq(`estado`,`leida`)}catch(e){console.warn(`[NotifService] Error al marcar todas`,e)}}function P(){return T.filter(e=>e.estado===`pendiente`||e.estado===`enviada`).length}var F=null;function I(){let n=t();n&&(F||(F=e.channel(`notificaciones:${n.id}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${n.id}`},e=>{let t={...e.new,created_at:e.new.created_at||new Date().toISOString()};T.some(e=>e.id===t.id)||(T.unshift(t),C(n.id),O(),L(t),console.log(`[Realtime] Nueva notificación recibida:`,t.titulo))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${n.id}`},e=>{let t=T.findIndex(t=>t.id===e.new.id);t!==-1&&(T[t]={...T[t],...e.new},C(n.id),O())}).subscribe(e=>{console.log(`[Realtime] Canal notificaciones: ${e}`),(e===`CHANNEL_ERROR`||e===`SUBSCRIPTION_ERROR`)&&(console.warn(`[Realtime] Canal cerrado, activando polling como fallback`),F=null,H())}),p.registerChannel(F)))}function L(e){if(document.getElementById(`pm-notificaciones-drawer-overlay`)?.classList.contains(`open`))return;let t=document.getElementById(`pm-notif-inapp-toast`);t&&t.remove();let n=R(e.tipo),r=document.createElement(`div`);r.id=`pm-notif-inapp-toast`,r.setAttribute(`role`,`alert`),r.setAttribute(`aria-live`,`polite`),r.innerHTML=`
    <div class="pm-iat-content">
      <div class="pm-iat-icon">${n}</div>
      <div class="pm-iat-text">
        <strong class="pm-iat-title">${e.titulo||`Nueva notificación`}</strong>
        <span class="pm-iat-msg">${e.mensaje||``}</span>
      </div>
      <button class="pm-iat-close" aria-label="Cerrar">×</button>
    </div>
  `,document.body.appendChild(r),B(),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add(`pm-iat-visible`))});let i=()=>{r.classList.remove(`pm-iat-visible`),setTimeout(()=>r.remove(),350)};r.querySelector(`.pm-iat-close`).addEventListener(`click`,i),r.addEventListener(`click`,e=>{e.target.classList.contains(`pm-iat-close`)||(document.getElementById(`pm-bell-btn`)?.click(),i())}),setTimeout(i,6e3)}function R(e){return{sesion_sin_registrar:`⚠️`,recordatorio_clase:`⏰`,mensaje_admin:`📣`,tarea_vencida:`📕`,in_app:`🔔`}[e]||`🔔`}var z=!1;function B(){if(z)return;z=!0;let e=document.createElement(`style`);e.textContent=`
    #pm-notif-inapp-toast {
      position: fixed;
      top: 72px;
      right: 16px;
      z-index: 10002;
      max-width: 340px;
      width: calc(100vw - 32px);
      opacity: 0;
      transform: translateY(-12px);
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
      cursor: pointer;
    }
    #pm-notif-inapp-toast.pm-iat-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .pm-iat-content {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(22, 22, 30, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 12px 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    }
    .pm-iat-icon { font-size: 22px; flex-shrink: 0; line-height: 1.4; }
    .pm-iat-text { flex: 1; min-width: 0; }
    .pm-iat-title {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 2px;
    }
    .pm-iat-msg {
      display: block;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .pm-iat-close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.35);
      font-size: 18px;
      cursor: pointer;
      padding: 0 2px;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .pm-iat-close:hover { color: #fff; }
    @media (max-width: 400px) {
      #pm-notif-inapp-toast { right: 8px; max-width: calc(100vw - 16px); }
    }
  `,document.head.appendChild(e)}var V=null;function H(){V===null&&(V=setInterval(()=>{document.visibilityState!==`hidden`&&k()},m),p.registerInterval(V))}function U(){V!==null&&(clearInterval(V),V=null)}document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`?(k(),H()):U()});function W(){let e=u();T=T.filter(t=>String(t.id).startsWith(`local_`)?t.referencia_id?.includes(e):!0)}W(),document.visibilityState!==`hidden`&&H();export{j as a,I as c,P as i,l,k as n,N as o,x as r,D as s,M as t,c as u};