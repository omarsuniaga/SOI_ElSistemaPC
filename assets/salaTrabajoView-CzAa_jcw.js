import{r as e}from"./AppModal-Du6jXNYA.js";import{i as t}from"./supabase-Cgh_dhNB.js";import{a as n,i as r,n as i,r as a}from"./allRegistrars-oXdbH9Y9.js";import{a as o,i as s,n as c,o as l,t as u}from"./simuladorLogMapper-DOwzR9m9.js";var d=`00000000-0000-0000-0000-000000000001`,f=420,p=null,m=null,h=null,g=null,_=null,v=null,y=null,b=null,x=null;function S(){let e={},t={};for(let n of o)e[n]=s(),t[n]=0;return{maquinas:e,contadores:t}}async function C(e){try{b=await n(d)}catch{b=null}F(e)}function w(e){let t=c(e);v[t.departamento]?.encolarEvento({texto:t.texto}),y[t.departamento]=(y[t.departamento]||0)+1,I(document.getElementById(`salaTrabajoLeyenda`))}async function T(e){if(b)try{let e=await r(b.id);e[0]&&w(e[0])}catch(e){console.error(`[salaTrabajoView] Error al refrescar log:`,e.message)}}function E(e){!t?.channel||!b||(m?.unsubscribe?.(),m=t.channel(`simulador:sala-trabajo:${b.id}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`sim_log`},e=>{p?.signal.aborted||u(e,b.id)&&w(e.new)}).subscribe())}function D(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;return{fondo:e?`#1e1e2e`:`#f5f5fa`,escritorio:e?`#2a2a3d`:`#ffffff`,borde:e?`#44445a`:`#d8d8e6`,texto:e?`#e4e4f0`:`#2b2b3a`,muneco:e?`#8b9cff`:`#4c5fd5`,working:`#f0ad4e`,talking:`#5cb85c`,dialogoFondo:e?`#33334a`:`#ffffff`}}function O(e,t,n,r,i,a){let o=r===`idle`?Math.sin(a/500)*1.5:0,s=r===`working`?i.working:r===`talking`?i.talking:i.muneco;if(e.save(),e.translate(t,n+o),e.beginPath(),e.arc(0,-14,8,0,Math.PI*2),e.fillStyle=s,e.fill(),e.beginPath(),e.roundRect(-7,-6,14,18,4),e.fill(),r!==`talking`&&(e.fillStyle=i.fondo,e.fillRect(-4,-15,2,2),e.fillRect(2,-15,2,2)),r===`working`){let t=Math.sin(a/90)*3;e.fillStyle=s,e.fillRect(-10+t,6,4,3),e.fillRect(6-t,6,4,3)}e.restore()}function k(e,t,n,r,i,a){let o=r-8;e.font=`11px sans-serif`;let s=i.split(` `),c=[],l=``;for(let t of s){let n=l?`${l} ${t}`:t;e.measureText(n).width>o&&l?(c.push(l),l=t):l=n}l&&c.push(l);let u=c.slice(0,3),d=14+u.length*13,f=r;e.fillStyle=a.dialogoFondo,e.strokeStyle=a.borde,e.lineWidth=1,e.beginPath(),e.roundRect(t,n-d,f,d,6),e.fill(),e.stroke(),e.fillStyle=a.texto,u.forEach((r,i)=>{e.fillText(r,t+4,n-d+14+i*13)})}function A(e,t,n,r){let i=D();e.clearRect(0,0,t,n),e.fillStyle=i.fondo,e.fillRect(0,0,t,n);let a=l({width:t,height:n});for(let t of o){let n=a[t],o=v[t],s=o.getEstado();e.fillStyle=i.escritorio,e.strokeStyle=i.borde,e.lineWidth=1,e.beginPath(),e.roundRect(n.x,n.y,n.w,n.h,8),e.fill(),e.stroke(),e.fillStyle=i.texto,e.font=`bold 12px sans-serif`,e.fillText(t,n.x+8,n.y+16),e.font=`10px sans-serif`,e.fillStyle=i.borde,e.fillText(`${y[t]||0} acción(es)`,n.x+8,n.y+n.h-6),O(e,n.x+n.w/2,n.y+n.h/2+6,s,i,r),s===`talking`&&o.getDialogo()&&k(e,n.x+4,n.y+n.h/2-14,n.w-8,o.getDialogo(),i)}}function j(e){let t=e.parentElement;if(!t)return;let n=Math.max(320,t.clientWidth),r=window.devicePixelRatio||1;e.width=n*r,e.height=f*r,e.style.width=`${n}px`,e.style.height=`${f}px`,e.getContext(`2d`).setTransform(r,0,0,r,0,0)}function M(e){let t=e.getContext(`2d`);function n(r){if(document.hidden){h=null;return}let i=parseInt(e.style.width,10)||e.width;A(t,i,f,r),h=requestAnimationFrame(n)}h=requestAnimationFrame(n)}function N(){h!=null&&(cancelAnimationFrame(h),h=null)}function P(){h==null&&!document.hidden&&_&&M(_)}function F(e){let t=e.querySelector(`#salaTrabajoBarra`);if(!t)return;let n=b?a(b.estado):null;t.innerHTML=`
    <div class="d-flex flex-wrap gap-3 align-items-center">
      <span class="text-muted small">Fecha simulada: <strong>${b?i(b.fecha_actual_virtual):`—`}</strong></span>
      ${n?`<span class="badge bg-${n.color}">${n.label}</span>`:``}
      <span class="text-muted small">Velocidad: <strong>${b?.velocidad||`—`}s / día simulado</strong></span>
      <button class="btn btn-outline-secondary btn-sm ms-auto" id="btnRefrescarSala">
        <i class="bi bi-arrow-clockwise me-1"></i>Refrescar
      </button>
    </div>
  `}function I(e){e&&(e.innerHTML=o.map(e=>`<span class="badge bg-light text-dark border me-2 mb-1">${e}: ${y[e]||0}</span>`).join(``))}function L(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function R(t,n){t.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${e(n)}</div>`}async function z(e,t={}){p?.abort(),p=new AbortController;let{maquinas:r,contadores:i}=S();v=r,y=i;try{L(e),b=await n(t.runId||d).catch(()=>null),e.innerHTML=`
      <div class="page-container">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="brand-badge bg-secondary bg-opacity-10 text-secondary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-easel2 fs-4"></i>
          </div>
          <div>
            <h1 class="mb-0 fs-4">Sala de Trabajo</h1>
            <p class="text-muted small mb-0">Animación en vivo de la corrida simulada</p>
          </div>
        </div>

        <div id="salaTrabajoBarra" class="mb-3"></div>

        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body p-2">
            <canvas id="salaTrabajoCanvas" style="width:100%; height:${f}px; display:block;"></canvas>
          </div>
        </div>

        <div id="salaTrabajoLeyenda" class="d-flex flex-wrap"></div>
      </div>
    `,F(e),I(e.querySelector(`#salaTrabajoLeyenda`)),_=e.querySelector(`#salaTrabajoCanvas`),j(_),M(_),typeof ResizeObserver<`u`&&(g=new ResizeObserver(()=>j(_)),g.observe(_.parentElement)),x=()=>{document.hidden?N():P()},document.addEventListener(`visibilitychange`,x,{signal:p.signal}),b&&E(e),e.querySelector(`#btnRefrescarSala`)?.addEventListener(`click`,async()=>{await C(e),await T(e)},{signal:p.signal})}catch(t){console.error(`[salaTrabajoView] Error:`,t.message),R(e,t.message)}return{teardown:()=>{p?.abort(),N(),g?.disconnect(),g=null,m?.unsubscribe?.(),m=null,_=null,x=null}}}export{z as renderSalaTrabajoView};