var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),c=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},u=(n,r,a)=>(a=n==null?{}:e(i(n)),l(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n)),d=e=>a.call(e,`module.exports`)?e[`module.exports`]:l(t({},`__esModule`,{value:!0}),e),f=`app-toast-container`,p=!1;function m(){if(p)return;p=!0;let e=document.createElement(`style`);e.id=`app-toast-styles`,e.textContent=`
    #app-toast-container {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 11020;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }

    .app-toast {
      pointer-events: all;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      min-width: 280px;
      max-width: 360px;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(24, 24, 32, 0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      color: #fff;
      font-size: 0.875rem;
      line-height: 1.4;
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
    }

    .app-toast.app-toast--visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .app-toast.app-toast--hiding {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }

    .app-toast__icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .app-toast__body {
      flex: 1;
      min-width: 0;
    }

    .app-toast__title {
      font-weight: 700;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin-bottom: 2px;
      opacity: 0.75;
    }

    .app-toast__msg {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.9);
    }

    .app-toast__close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.4);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
      align-self: flex-start;
    }
    .app-toast__close:hover { color: #fff; }

    /* Colores por tipo */
    .app-toast--success .app-toast__icon { color: #34d399; }
    .app-toast--success { border-color: rgba(52,211,153,0.2); }

    .app-toast--error .app-toast__icon   { color: #f87171; }
    .app-toast--error   { border-color: rgba(248,113,113,0.2); }

    .app-toast--warning .app-toast__icon { color: #fbbf24; }
    .app-toast--warning { border-color: rgba(251,191,36,0.2); }

    .app-toast--info .app-toast__icon    { color: #60a5fa; }
    .app-toast--info    { border-color: rgba(96,165,250,0.2); }

    @media (max-width: 400px) {
      #app-toast-container { right: 0.75rem; left: 0.75rem; }
      .app-toast { min-width: unset; max-width: 100%; }
    }
  `,document.head.appendChild(e)}function h(){let e=document.getElementById(f);return e||(e=document.createElement(`div`),e.id=f,document.body.appendChild(e)),e}var g={success:{icon:`bi bi-check-circle-fill`,title:`Éxito`},error:{icon:`bi bi-exclamation-octagon-fill`,title:`Error`},danger:{icon:`bi bi-exclamation-octagon-fill`,title:`Error`},warning:{icon:`bi bi-exclamation-triangle-fill`,title:`Atención`},info:{icon:`bi bi-info-circle-fill`,title:`Info`}};function _(e){e._dismissing||(e._dismissing=!0,e.classList.remove(`app-toast--visible`),e.classList.add(`app-toast--hiding`),setTimeout(()=>e.remove(),350))}var v={show(e,t=`info`){m();let n=h(),r=g[t]||g.info,i=t===`danger`?`error`:t,a=document.createElement(`div`);a.className=`app-toast app-toast--${i}`,a.setAttribute(`role`,`alert`),a.setAttribute(`aria-live`,`polite`),a.innerHTML=`
      <i class="${r.icon} app-toast__icon" aria-hidden="true"></i>
      <div class="app-toast__body">
        <div class="app-toast__title">${r.title}</div>
        <div class="app-toast__msg">${e}</div>
      </div>
      <button class="app-toast__close" aria-label="Cerrar">&#x2715;</button>
    `,n.appendChild(a),a.querySelector(`.app-toast__close`).addEventListener(`click`,()=>_(a)),requestAnimationFrame(()=>{requestAnimationFrame(()=>a.classList.add(`app-toast--visible`))});let o=setTimeout(()=>_(a),4e3);a.addEventListener(`mouseenter`,()=>clearTimeout(o)),a.addEventListener(`mouseleave`,()=>{setTimeout(()=>_(a),1500)})},success(e){this.show(e,`success`)},error(e){this.show(e,`error`)},danger(e){this.show(e,`danger`)},info(e){this.show(e,`info`)},warning(e){this.show(e,`warning`)}};export{d as a,c as i,s as n,u as o,o as r,v as t};