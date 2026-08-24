import{i as e,s as t}from"./AppModal-Du6jXNYA.js";import{i as n}from"./supabase-Cgh_dhNB.js";import{i as r}from"./groqService-BEo2aU8D.js";var i=`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #1a1d29; background: #fff; }

  :root {
    --navy: #1e3a5f;
    --teal: #0e7490;
    --teal2: #ecfeff;
    --gold: #d4af37;
    --ok: #1f6e3e;    --ok2: #e7f5ec;
    --bad: #a31b1b;   --bad2: #fde8e8;
    --warn: #a35c00;  --warn2: #fef6e8;
    --info: #0e7490;  --info2: #ecfeff;
    --ink: #1a1d29;   --ink2: #3d4152; --ink3: #6b7085;
    --border: #d5d8e3;
  }

  /* --- Page layout --- */
  .page {
    width: 216mm;
    min-height: 279mm;
    padding: 10mm 12mm 14mm;
    position: relative;
    page-break-after: always;
  }
  .page.land {
    width: 279mm;
    min-height: 216mm;
    padding: 8mm 10mm 12mm;
  }
  @media print {
    body { margin: 0; }
    .page { page-break-after: always; }
  }

  /* --- Header --- */
  .rpt-header { margin-bottom: 6mm; }
  .rpt-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid var(--teal);
    padding-bottom: 4px;
    margin-bottom: 4px;
  }
  .rpt-logo-area { display: flex; align-items: center; gap: 8px; }
  .rpt-esp-circle {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--navy), #2c5282);
    border-radius: 50%;
    border: 2px solid var(--teal);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 800; font-size: 9pt;
    flex-shrink: 0;
  }
  .rpt-logo-img { height: 38px; width: auto; object-fit: contain; }
  .rpt-inst-name strong { display: block; font-size: 9.5pt; color: var(--navy); text-transform: uppercase; letter-spacing: 0.4px; }
  .rpt-inst-name span   { font-size: 7pt; color: var(--ink3); }
  .rpt-doc-tag {
    background: var(--teal); color: #fff;
    font-size: 7pt; font-weight: 700;
    padding: 3px 10px; border-radius: 2px;
    text-transform: uppercase; letter-spacing: 0.6px;
    white-space: nowrap;
  }
  .rpt-header-bar {
    background: var(--teal2);
    border-left: 3px solid var(--teal);
    border-radius: 3px;
    padding: 3px 8px;
    display: flex; flex-wrap: wrap; gap: 14px;
    font-size: 7pt; color: var(--ink2);
  }
  .rpt-header-bar strong { color: var(--navy); }

  /* --- Footer --- */
  .rpt-footer {
    position: absolute; bottom: 8mm; left: 12mm; right: 12mm;
    border-top: 1px solid var(--border);
    padding-top: 4px;
    font-size: 6.5pt; color: var(--ink3);
  }
  .rpt-footer-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .rpt-sigs { display: flex; gap: 30mm; margin-top: 10mm; }
  .rpt-sig-line { text-align: center; }
  .rpt-sig-line .line { width: 50mm; border-bottom: 1px solid var(--ink3); margin-bottom: 3px; }

  /* --- Metric chips --- */
  .rpt-chips { display: flex; gap: 6px; margin-bottom: 5mm; flex-wrap: wrap; }
  .rpt-chip {
    border: 1px solid var(--border); border-radius: 5px;
    padding: 5px 10px; text-align: center; min-width: 48px;
  }
  .rpt-chip .chip-val { font-size: 14pt; font-weight: 800; display: block; }
  .rpt-chip .chip-lbl { font-size: 6pt; text-transform: uppercase; color: var(--ink3); display: block; }
  .chip-ok  { border-color: var(--ok);   }  .chip-ok  .chip-val { color: var(--ok);   }
  .chip-bad { border-color: var(--bad);  }  .chip-bad .chip-val { color: var(--bad);  }
  .chip-warn{ border-color: var(--warn); }  .chip-warn .chip-val{ color: var(--warn); }
  .chip-info{ border-color: var(--teal); }  .chip-info .chip-val{ color: var(--teal); }
  .chip-navy{ border-color: var(--navy); }  .chip-navy .chip-val{ color: var(--navy); }

  /* --- Attendance table --- */
  .rpt-table { width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-bottom: 5mm; }
  .rpt-table th { background: var(--navy); color: #fff; padding: 3px 5px; text-align: left; font-weight: 700; }
  .rpt-table td { padding: 3px 5px; border-bottom: 1px solid var(--border); }
  .rpt-table tr:nth-child(even) td { background: #f8f9fc; }
  .att-cell {
    display: inline-block; padding: 1px 6px; border-radius: 3px;
    font-weight: 700; font-size: 7pt; text-align: center; min-width: 22px;
  }
  .att-P  { background: var(--ok2);   color: var(--ok);   }
  .att-A  { background: var(--bad2);  color: var(--bad);  }
  .att-J  { background: var(--warn2); color: var(--warn); }

  /* --- Content chips --- */
  .rpt-content-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4mm; }
  .content-chip {
    background: var(--teal2); color: var(--navy);
    border: 1px solid var(--teal); border-radius: 3px;
    font-size: 6.5pt; padding: 2px 7px;
  }

  /* --- Obs blocks --- */
  .rpt-obs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4mm; }
  .obs-block { border-radius: 4px; padding: 5px 8px; font-size: 7.5pt; }
  .obs-pos  { background: var(--ok2);   border-left: 3px solid var(--ok);   }
  .obs-neg  { background: var(--bad2);  border-left: 3px solid var(--bad);  }
  .obs-warn { background: var(--warn2); border-left: 3px solid var(--warn); }
  .obs-info { background: var(--teal2); border-left: 3px solid var(--teal); }
  .obs-block .obs-label { font-weight: 700; font-size: 6.5pt; text-transform: uppercase; margin-bottom: 2px; display: block; }

  /* --- Progress bars --- */
  .prog-row { margin-bottom: 3px; }
  .prog-label { font-size: 6.5pt; color: var(--ink2); display: flex; justify-content: space-between; margin-bottom: 2px; }
  .prog-bar-outer { height: 5px; background: var(--border); border-radius: 3px; }
  .prog-bar-inner { height: 100%; border-radius: 3px; }
  .prog-LOGRADO    .prog-bar-inner { background: var(--ok);   width: 100%; }
  .prog-EN_PROGRESO .prog-bar-inner { background: var(--teal); }
  .prog-INICIADO   .prog-bar-inner { background: #9ca3af; }

  /* --- Profile cards (Doc 3 Pág 2) --- */
  .profile-grid { display: grid; gap: 4mm; }
  .profile-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .profile-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
  .profile-card { border: 1px solid var(--border); border-radius: 5px; overflow: hidden; font-size: 7pt; }
  .pc-head { background: var(--navy); color: #fff; padding: 4px 7px; display: flex; align-items: center; gap: 5px; }
  .pc-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 7pt; flex-shrink: 0; }
  .pc-name { font-weight: 700; font-size: 7.5pt; }
  .pc-badge { display: inline-block; padding: 1px 5px; border-radius: 2px; font-size: 6pt; font-weight: 700; color: #fff; margin-top: 2px; }
  .badge-destacado  { background: var(--teal); }
  .badge-mejora     { background: #1d4ed8; }
  .badge-estable    { background: #6c757d; }
  .badge-riesgo     { background: var(--bad); }
  .pc-section { padding: 4px 7px; border-bottom: 1px solid var(--border); }
  .pc-section-title { font-size: 6pt; font-weight: 700; text-transform: uppercase; color: var(--ink3); margin-bottom: 2px; }
  .pc-row { display: flex; justify-content: space-between; margin-bottom: 1px; }
  .pc-just-item::before { content: '• '; }

  /* --- Session grid (Doc 3 Pág 1) --- */
  .session-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 7pt; margin-bottom: 4mm; }
  .session-card { border: 1px solid var(--border); border-radius: 3px; padding: 4px 6px; }
  .session-card .sc-top { font-weight: 700; color: var(--navy); margin-bottom: 2px; }
  .session-card .sc-att { display: flex; gap: 6px; }

  /* --- Comparativa bars (Doc 2 Pág 2 + Doc 3 Pág 3) --- */
  .comp-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 7.5pt; }
  .comp-label { width: 70px; color: var(--ink2); }
  .comp-bar-wrap { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .comp-bar { height: 100%; border-radius: 4px; }
  .comp-bar.bar-ok  { background: var(--ok); }
  .comp-bar.bar-bad { background: var(--bad); }
  .comp-bar.bar-warn{ background: var(--warn); }
  .comp-delta { font-size: 7pt; font-weight: 700; width: 36px; }
  .delta-up   { color: var(--ok); }
  .delta-down { color: var(--bad); }

  /* --- Section titles --- */
  .rpt-section-title {
    font-size: 8pt; font-weight: 700; text-transform: uppercase;
    color: var(--navy); letter-spacing: 0.4px;
    border-bottom: 1px solid var(--teal); padding-bottom: 2px; margin-bottom: 4px;
  }

  /* --- Recommendations (Doc 3 Pág 3) --- */
  .reco-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 4mm; }
  .reco-card { background: var(--teal2); border: 1px solid var(--teal); border-radius: 4px; padding: 6px 8px; font-size: 7pt; }
  .reco-card .reco-title { font-weight: 700; color: var(--navy); margin-bottom: 3px; font-size: 7pt; text-transform: uppercase; }

  /* --- Nota dirección --- */
  .nota-dir { background: #fffbeb; border: 1px solid var(--gold); border-radius: 4px; padding: 6px 10px; font-size: 7.5pt; margin-bottom: 4mm; }
  .nota-dir .nota-title { font-weight: 700; color: var(--navy); margin-bottom: 3px; font-size: 7pt; text-transform: uppercase; }
`;function a(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function o(e){let t=(e.extraItems||[]).map(e=>`<span><strong>${a(e.label)}:</strong> ${a(e.value)}</span>`).join(``);return`
    <header class="rpt-header">
      <div class="rpt-header-top">
        <div class="rpt-logo-area">
          <div class="rpt-esp-circle">ESP</div>
          <div class="rpt-inst-name">
            <strong>El Sistema Punta Cana</strong>
            <span>República Dominicana · Departamento Académico</span>
          </div>
        </div>
        <div class="rpt-doc-tag">${a(e.docTag)}</div>
      </div>
      <div class="rpt-header-bar">
        <span><strong>Clase:</strong> ${a(e.clase)}</span>
        <span><strong>Docente:</strong> ${a(e.docente)}</span>
        <span><strong>Período:</strong> ${a(e.periodo)}</span>
        ${t}
      </div>
    </header>
  `}function s(e,t,n){return`
    <footer class="rpt-footer">
      <div class="rpt-footer-row">
        <span>Generado por SOI · Docente → Coord. Académica → Coord. Administrativa → Dirección Ejecutiva</span>
        <span>Pág ${e}/${t} · ${a(n)}</span>
      </div>
      <div class="rpt-sigs">
        <div class="rpt-sig-line"><div class="line"></div><span>Firma Docente</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Coordinación Académica</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Dirección Ejecutiva</span></div>
      </div>
    </footer>
  `}function c(e){return`<div class="rpt-chips">${e.map(e=>`
    <div class="rpt-chip chip-${a(e.type)}">
      <span class="chip-val">${a(String(e.value))}</span>
      <span class="chip-lbl">${a(e.label)}</span>
    </div>
  `).join(``)}</div>`}function l(e){let t={P:`P`,A:`A`,J:`J`}[e]??a(e);return`<span class="att-cell att-${a(e)}">${t}</span>`}function u(e,t,n=60){let r=e===`LOGRADO`?100:n,i={LOGRADO:`Logrado`,EN_PROGRESO:`En progreso`,INICIADO:`Iniciado`}[e]??e;return`
    <div class="prog-row prog-${a(e)}">
      <div class="prog-label">
        <span>${a(t)}</span>
        <span>${a(i)}</span>
      </div>
      <div class="prog-bar-outer">
        <div class="prog-bar-inner" style="width:${r}%"></div>
      </div>
    </div>
  `}function d(e,t,n){let r={pos:`✅`,neg:`⛔`,warn:`⚠️`,info:`📋`}[e]??``;return`
    <div class="obs-block obs-${a(e)}">
      <span class="obs-label">${r} ${a(t)}</span>
      <span>${a(n)}</span>
    </div>
  `}function f(e,t,n){return`
    <div class="comp-row">
      <span class="comp-label">${a(e)}</span>
      <div style="flex:1;display:flex;gap:4px;align-items:center">
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${a(n)}" style="width:${t.prev}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${t.prev}%</span>
        <span style="font-size:7pt;color:var(--ink3)">→</span>
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${a(n)}" style="width:${t.cur}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${t.cur}%</span>
      </div>
      <span class="comp-delta ${a(t.cls)}">${a(t.label)}</span>
    </div>
  `}function p(e){return!e||e.length===0?``:`<div class="rpt-content-chips">${e.map(e=>`<span class="content-chip">${a(e)}</span>`).join(``)}</div>`}function m(e,t=`reporte`){let n=window.open(``,`_blank`);return n?(n.document.open(),n.document.write(e),n.document.close(),n.focus(),n.onload=()=>{setTimeout(()=>n.print(),500)},setTimeout(()=>{try{n&&!n.closed&&n.print()}catch{}},1500),!0):(h(e,t),!1)}function h(e,t=`reporte`){let n=new Date().toISOString().split(`T`)[0],r=new Blob([e],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`${t}-${n}.html`,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}function g(e,t=!1){return`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe El Sistema Punta Cana</title>
  <style>
    ${t?`@page { size: letter landscape; margin: 0; }`:`@page { size: letter portrait; margin: 0; }`}
    ${i}
  </style>
</head>
<body>
  ${e}
</body>
</html>`}var _=t({buildAlumnoAttMap:()=>y,calcAttendanceStats:()=>v,generateAcademicClosureReport:()=>D,generateDailyReport:()=>w,generateMonthlyAttendance:()=>T,generateMonthlyPedagogical:()=>E});function v(e){let t=e||[];return{P:t.filter(e=>e.estado===`P`).length,A:t.filter(e=>e.estado===`A`).length,J:t.filter(e=>e.estado===`J`).length,total:t.length}}function y(e){let t={};for(let n of e)for(let e of n.asistencia||[])t[e.alumno_id]||(t[e.alumno_id]={}),t[e.alumno_id][n.id]=e.estado;return t}function b(e){return e?new Date(e+`T00:00:00`).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):``}function x(e){return[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`][e-1]??``}function S(e,t){return new Date(e,t,0).getDate()}function C(e){return String(e).padStart(2,`0`)}async function w(t){try{let{data:r,error:i}=await n.from(`sesiones_clase`).select(`id, fecha, clase_id, asistencia, contenido`).eq(`id`,t).single();if(i)throw i;let u;if(r.clase_id){let{data:e,error:t}=await n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,r.clase_id).single();if(t)throw t;u=e}else u={id:t,nombre:r.actividad||`Actividad Especial`,instrumento:r.motivo||``,maestro_id:r.maestro_id};let f=`Docente`;if(u.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,u.maestro_id).single();e&&(f=e.nombre_completo)}let h=1;if(r.clase_id){let{count:e}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,r.clase_id).lte(`fecha`,r.fecha);h=e||1}let _=[];if(r.clase_id){let{data:e,error:t}=await n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,r.clase_id).eq(`activo`,!0).order(`alumnos(nombre_completo)`);if(t)throw t;_=(e||[]).map(e=>e.alumnos).filter(Boolean)}else{let e=(r.asistencia||[]).map(e=>e.alumno_id).filter(Boolean);if(e.length>0){let{data:t}=await n.from(`alumnos`).select(`id, nombre_completo`).in(`id`,e);_=t||[]}}if(!_||_.length===0){e.error(`No hay alumnos registrados para esta actividad.`);return}let y=r.asistencia||[],x=v(y),S={};y.forEach(e=>{S[e.alumno_id]=e});let{data:C}=await n.from(`justificaciones`).select(`alumno_id, motivo`).eq(`sesion_id`,t),w={};(C||[]).forEach(e=>{w[e.alumno_id]=e.motivo});let T=_.length>20,E=r.contenido||``,D=E.split(/[\n,]/).map(e=>e.replace(/^\s*[-*\d.]+\s*/,``).trim()).filter(e=>e.length>2&&e.length<60).slice(0,12),O=E.split(`
`).filter(e=>e.trim()),k=[];for(let e of O)/destacad|excelente|logr/i.test(e)?k.push({type:`pos`,label:`Destacado`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo|falt/i.test(e)?k.push({type:`neg`,label:`Alerta`,text:e.replace(/^[-*]\s*/,``)}):/novedad|nota|aviso/i.test(e)&&k.push({type:`info`,label:`Novedad`,text:e.replace(/^[-*]\s*/,``)});let ee=k.slice(0,4).map(e=>d(e.type,e.label,e.text)).join(``),te=`REPORTE DIARIO · ${b(r.fecha)}`,A=u.nombre,ne=o({docTag:te,clase:A,docente:f,periodo:`Sesión #${h} · ${b(r.fecha)}`}),j=c([{label:`Presentes`,value:x.P,type:`ok`},{label:`Ausentes`,value:x.A,type:`bad`},{label:`Justificados`,value:x.J,type:`warn`},{label:`Total`,value:_.length,type:`navy`}]),M=`
      <p class="rpt-section-title">Registro de asistencia</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación / Justificación</th></tr></thead>
        <tbody>${_.map((e,t)=>{let n=S[e.id],r=n?.estado??`—`,i=[`P`,`A`,`J`].includes(r)?l(r):a(r),o=a(n?.observacion||w[e.id]||``);return`<tr>
        <td>${t+1}</td>
        <td>${a(e.nombre_completo)}</td>
        <td style="text-align:center">${i}</td>
        <td style="font-size:6.5pt;color:#6b7085">${o}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    `,re=D.length>0?`<p class="rpt-section-title">Contenido de la sesión</p>${p(D)}`:``,N=ee?`<p class="rpt-section-title">Observaciones</p><div class="rpt-obs">${ee}</div>`:``,P=s(1,1,b(r.fecha));m(g(`
      <div class="${T?`page land`:`page`}">
        ${ne}
        ${j}
        ${M}
        ${re}
        ${N}
        ${P}
      </div>
    `,T),`reporte-diario-${r.fecha?.replace(/-/g,``)||`fecha`}`)||e.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(t){console.error(`[reportService] generateDailyReport:`,t),e.error(`Error al generar el reporte: `+t.message)}}async function T(t,r,i){try{let u=C(i),d=S(r,i),p=`${r}-${u}-01`,h=`${r}-${u}-${d}`,_=i===1?12:i-1,w=i===1?r-1:r,T=C(_),E=S(w,_),D=`${w}-${T}-01`,O=`${w}-${T}-${E}`,[k,ee,te,A,ne]=await Promise.all([n.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,t).gte(`fecha`,p).lte(`fecha`,h).order(`fecha`),n.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)`).eq(`clase_id`,t).gte(`fecha`,p).lte(`fecha`,h),n.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,t).gte(`fecha`,D).lte(`fecha`,O),n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,t).single(),n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,t).eq(`activo`,!0)]);for(let e of[k,A,ne])if(e.error)throw e.error;let j=k.data||[],M=ee.data||[],re=te.data||[],N=A.data,P=(ne.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo));if(j.length===0){e.error(`No hay sesiones registradas para este período.`);return}let F=`Docente`;if(N.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,N.maestro_id).single();e&&(F=e.nombre_completo)}let{count:ie}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,t).lt(`fecha`,p),I=ie||0,L=P.length>18||j.length>16,R=0,z=0,B=0;j.forEach(e=>{let t=v(e.asistencia);R+=t.P,z+=t.A,B+=t.J});let V=R+z+B,H=0,U=0,W=0;re.forEach(e=>{let t=v(e.asistencia);H+=t.P,U+=t.A,W+=t.J});let G=H+U+W,K=(e,t)=>t>0?Math.round(e/t*100):0,q=(e,t,n,r)=>{let i=K(e,n),a=K(t,r),o=i-a;return{cur:i,prev:a,diff:o,label:`${o>0?`+`:``}${o}%`,cls:o>=0?`delta-up`:`delta-down`}},ae=q(R,H,V,G),oe=q(z,U,V,G),J=q(B,W,V,G),se=y(j),Y={docTag:`RESUMEN MENSUAL · ${x(i).toUpperCase()} ${r}`,clase:N.nombre,docente:F,periodo:`${x(i)} ${r}`,extraItems:[{label:`Sesiones`,value:j.length},{label:`Alumnos`,value:P.length}]},ce=c([{label:`Presentes`,value:`${R} (${K(R,V)}%)`,type:`ok`},{label:`Ausentes`,value:`${z} (${K(z,V)}%)`,type:`bad`},{label:`Justificados`,value:`${B} (${K(B,V)}%)`,type:`warn`},{label:`Sesiones`,value:j.length,type:`navy`}]),le=`
      <p class="rpt-section-title">Asistencia diaria por alumno</p>
      <table class="rpt-table" style="font-size:6.5pt">
        <thead><tr>
          <th>#</th><th>Alumno</th>
          ${j.map((e,t)=>`<th style="text-align:center;font-size:6pt">S${I+t+1}</th>`).join(``)}
          <th style="text-align:center;background:var(--ok)">P</th>
          <th style="text-align:center;background:var(--bad)">A</th>
          <th style="text-align:center;background:var(--warn)">J</th>
        </tr></thead>
        <tbody>${P.map((e,t)=>{let n=se[e.id]||{},r=0,i=0,o=0,s=j.map(e=>{let t=n[e.id]??`—`;return t===`P`&&r++,t===`A`&&i++,t===`J`&&o++,`<td style="text-align:center">${[`P`,`A`,`J`].includes(t)?l(t):a(t)}</td>`}).join(``);return`<tr>
        <td>${t+1}</td>
        <td>${a(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</td>
        ${s}
        <td style="text-align:center;font-weight:700;color:var(--ok)">${r}</td>
        <td style="text-align:center;font-weight:700;color:var(--bad)">${i}</td>
        <td style="text-align:center;font-weight:700;color:var(--warn)">${o}</td>
      </tr>`}).join(``)}${`<tr style="background:#f0f4ff;font-weight:700">
      <td colspan="2">TOTALES</td>
      ${j.map(()=>`<td></td>`).join(``)}
      <td style="text-align:center;color:var(--ok)">${R}</td>
      <td style="text-align:center;color:var(--bad)">${z}</td>
      <td style="text-align:center;color:var(--warn)">${B}</td>
    </tr>`}</tbody>
      </table>
    `,ue=`
      <div class="${L?`page land`:`page`}">
        ${o(Y)}
        ${ce}
        ${le}
        ${s(1,M.length>0||G>0?2:1,`${x(i)} ${r}`)}
      </div>
    `,X=``;if(M.length>0||G>0){let e=M.map((e,t)=>`<tr>
        <td>${t+1}</td>
        <td>${a(e.alumnos?.nombre_completo??``)}</td>
        <td>${a(b(e.fecha))}</td>
        <td>${a(e.tipo??`Justificado`)}</td>
        <td>${a(e.motivo??``)}</td>
      </tr>`).join(``),t=e?`
        <p class="rpt-section-title">Justificaciones detalladas</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
          <tbody>${e}</tbody>
        </table>
      `:``,n=G>0?`
        <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${x(_)} ${w}</p>
        <div style="max-width:260mm">
          ${f(`Presentes`,ae,`bar-ok`)}
          ${f(`Ausentes`,oe,`bar-bad`)}
          ${f(`Justif.`,J,`bar-warn`)}
        </div>
      `:``;X=`
        <div class="${L?`page land`:`page`}">
          ${o(Y)}
          ${t}
          ${n}
          ${s(2,2,`${x(i)} ${r}`)}
        </div>
      `}m(g(ue+X,L),`resumen-asistencia-${r}-${C(i)}`)||e.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(t){console.error(`[reportService] generateMonthlyAttendance:`,t),e.error(`Error al generar el resumen: `+t.message)}}async function E(t,i,l){try{let h=C(l),_=S(i,l),w=`${i}-${h}-01`,T=`${i}-${h}-${_}`,E=l===1?12:l-1,D=l===1?i-1:i,O=C(E),k=S(D,E),ee=`${D}-${O}-01`,te=`${D}-${O}-${k}`,[A,ne,j,M,re,N,P]=await Promise.all([n.from(`sesiones_clase`).select(`id, fecha, asistencia, contenido`).eq(`clase_id`,t).gte(`fecha`,w).lte(`fecha`,T).order(`fecha`),n.from(`observaciones_sesion`).select(`sesion_id, contenido_ia_dsl, contenido_raw`).in(`sesion_id`,(await n.from(`sesiones_clase`).select(`id`).eq(`clase_id`,t).gte(`fecha`,w).lte(`fecha`,T)).data?.map(e=>e.id)||[]),n.from(`progresos`).select(`id, alumno_id, objetivo_id, evaluacion_tipo, estado_cualitativo, calificacion,
                 contenido_dsl, created_at,
                 alumnos(nombre_completo),
                 curriculo_objetivos(descripcion, categoria)`).eq(`clase_id`,t).gte(`created_at`,w).lte(`created_at`,T),n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,t).single(),n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,t).eq(`activo`,!0),n.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,t).gte(`fecha`,ee).lte(`fecha`,te),n.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo`).eq(`clase_id`,t).gte(`fecha`,w).lte(`fecha`,T)]);if(A.error)throw A.error;if(M.error)throw M.error;let F=A.data||[],ie=ne.data||[],I=j.data||[],L=M.data,R=(re.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo)),z=N.data||[],B=P.data||[];if(F.length===0){e.error(`No hay sesiones registradas para este período.`);return}let V=`Docente`;if(L.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,L.maestro_id).single();e&&(V=e.nombre_completo)}let{count:H}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,t).lt(`fecha`,w),U=H||0,W={};ie.forEach(e=>{W[e.sesion_id]=e});let G=e=>{let t=W[e.id];return t?.contenido_ia_dsl||t?.contenido_raw||e.contenido||``},K=0,q=0,ae=0;F.forEach(e=>{let t=v(e.asistencia);K+=t.P,q+=t.A,ae+=t.J});let oe=K+q+ae,J=(e,t)=>t>0?Math.round(e/t*100):0,se=0,Y=0,ce=0;z.forEach(e=>{let t=v(e.asistencia);se+=t.P,Y+=t.A,ce+=t.J});let le=se+Y+ce,ue=new Set;F.forEach(e=>{let t=G(e);t&&t.split(/[\n,]/).forEach(e=>{let t=e.replace(/^\s*[-*\d.]+\s*/,``).trim();t.length>2&&t.length<60&&ue.add(t)})});let X=[...ue].slice(0,16),Z=[];F.forEach(e=>{let t=G(e);t&&t.split(`
`).forEach(e=>{/destacad|excelente/i.test(e)?Z.push({type:`pos`,label:`Destacado Académico`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo/i.test(e)?Z.push({type:`neg`,label:`Alerta Asistencia`,text:e.replace(/^[-*]\s*/,``)}):/novedad|administrativ/i.test(e)?Z.push({type:`info`,label:`Novedad Administrativa`,text:e.replace(/^[-*]\s*/,``)}):/nota|pedagóg/i.test(e)&&Z.push({type:`warn`,label:`Nota Pedagógica`,text:e.replace(/^[-*]\s*/,``)})})});let de=Z.slice(0,4);for(;de.length<4;)de.push({type:`info`,label:`Nota`,text:`—`});let fe=F.map((e,t)=>{let n=v(e.asistencia),r=G(e).split(/[\n,]/)[0]?.replace(/^[-*\d.]+\s*/,``).trim()||`Sin contenido registrado`;return`
        <div class="session-card">
          <div class="sc-top">S${U+t+1} · ${a(b(e.fecha))}</div>
          <div style="font-size:6pt;color:var(--ink3);margin-bottom:2px">${a(r.slice(0,45))}</div>
          <div class="sc-att">
            <span class="att-cell att-P">P:${n.P}</span>
            <span class="att-cell att-A">A:${n.A}</span>
            <span class="att-cell att-J">J:${n.J}</span>
          </div>
        </div>
      `}).join(``),pe={docTag:`INFORME PEDAGÓGICO · ${x(l).toUpperCase()} ${i}`,clase:L.nombre,docente:V,periodo:`${x(l)} ${i}`,extraItems:[{label:`Sesiones`,value:F.length},{label:`Alumnos`,value:R.length}]},me=`
      <div class="page land">
        ${o(pe)}
        ${c([{label:`Sesiones`,value:F.length,type:`navy`},{label:`% Asistencia`,value:J(K,oe)+`%`,type:`ok`},{label:`Presentes`,value:K,type:`ok`},{label:`Ausentes`,value:q,type:`bad`},{label:`Justif.`,value:ae,type:`warn`},{label:`Contenidos`,value:X.length,type:`info`}])}
        <p class="rpt-section-title">Contenidos trabajados</p>
        ${p(X)}
        <p class="rpt-section-title">Observaciones institucionales</p>
        <div class="rpt-obs">
          ${de.map(e=>d(e.type,e.label,e.text)).join(``)}
        </div>
        <p class="rpt-section-title">Cronograma de sesiones</p>
        <div class="session-grid">${fe}</div>
        ${s(1,3,`${x(l)} ${i}`)}
      </div>
    `,he=R.length>12?`cols-4`:`cols-3`,ge=y(F),_e={};B.forEach(e=>{_e[e.alumno_id]||(_e[e.alumno_id]=[]),_e[e.alumno_id].push(e)});let Q={};I.forEach(e=>{Q[e.alumno_id]||(Q[e.alumno_id]=[]),Q[e.alumno_id].push(e)});let ve=R.map(e=>{let t=ge[e.id]||{},n=0,r=0,i=0;F.forEach(e=>{let a=t[e.id];a===`P`&&n++,a===`A`&&r++,a===`J`&&i++});let o=F.length,s=J(n,o),c,l;s>=90&&Q[e.id]?.some(e=>e.estado_cualitativo===`LOGRADO`)?(c=`Destacado`,l=`badge-destacado`):s<60?(c=`En Riesgo`,l=`badge-riesgo`):s>=75?(c=`Estable`,l=`badge-estable`):(c=`En Mejora`,l=`badge-mejora`);let d=e.nombre_completo.split(` `),f=a((d[0]?.[0]??``)+(d[2]?.[0]??d[1]?.[0]??``)),p=_e[e.id]||[],m=p.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Justificaciones</div>
          ${p.slice(0,4).map(e=>`<div class="pc-just-item" style="font-size:6pt">${a(e.motivo||e.tipo)} — ${a(b(e.fecha))}</div>`).join(``)}
        </div>
      `:``,h=Q[e.id]||[],g=h.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Progreso</div>
          ${h.slice(0,3).map(e=>{let t=e.curriculo_objetivos?.descripcion||e.contenido_dsl||`Objetivo`,n=e.estado_cualitativo,r=n===`LOGRADO`?100:n===`EN_PROGRESO`?60:30;return u(n,t.slice(0,28),r)}).join(``)}
        </div>
      `:`<div class="pc-section" style="color:var(--ink3);font-size:6pt">Sin registros de progreso este mes</div>`;return`
        <div class="profile-card">
          <div class="pc-head">
            <div class="pc-avatar">${f}</div>
            <div>
              <div class="pc-name">${a(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</div>
              <span class="pc-badge ${l}">${a(c)}</span>
            </div>
          </div>
          <div class="pc-section">
            <div class="pc-section-title">Asistencia</div>
            <div class="pc-row"><span>Presentes:</span><span><strong>${n}</strong> de ${o}</span></div>
            <div class="pc-row"><span>Ausentes:</span><span><strong>${r}</strong></span></div>
            <div class="pc-row"><span>Justificados:</span><span><strong>${i}</strong></span></div>
          </div>
          ${m}
          ${g}
        </div>
      `}).join(``),ye=`
      <div class="page land">
        ${o(pe)}
        <p class="rpt-section-title">Perfiles individuales</p>
        <div class="profile-grid ${he}">${ve}</div>
        ${s(2,3,`${x(l)} ${i}`)}
      </div>
    `,be={clase:L.nombre,docente:V,mes:`${x(l)} ${i}`,totalAlumnos:R.length},$=await r(F.map((e,t)=>({...e,numero_sesion:U+t+1})),I,be),xe=(()=>{let e=J(K,oe),t=J(se,le||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n>=0?`delta-up`:`delta-down`}})(),Se=(()=>{let e=J(q,oe),t=J(Y,le||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n<0?`delta-up`:`delta-down`}})(),Ce=z.length*2,we=X.length,Te=`
      <div style="display:grid;grid-template-columns:60% 40%;gap:6mm">
        <div>
          <p class="rpt-section-title">Comparativa estadística</p>
          ${f(`Presentes`,xe,`bar-ok`)}
          ${f(`Ausentes`,Se,`bar-bad`)}
          <div style="margin-top:4px">
            <table class="rpt-table" style="font-size:7pt">
              <thead><tr>
                <th>Indicador</th>
                <th>${x(E)} ${D}</th>
                <th>${x(l)} ${i}</th>
                <th>Δ</th>
              </tr></thead>
              <tbody>
                <tr><td>Contenidos cubiertos</td><td>${Ce}</td><td>${we}</td>
                    <td class="${we>=Ce?`delta-up`:`delta-down`}" style="font-weight:700">
                      ${we>=Ce?`+`:``}${we-Ce}
                    </td></tr>
                <tr><td>Logros individuales</td>
                    <td>${z.length>0?`—`:`0`}</td>
                    <td>${I.filter(e=>e.estado_cualitativo===`LOGRADO`).length}</td>
                    <td class="delta-up" style="font-weight:700">${I.filter(e=>e.estado_cualitativo===`LOGRADO`).length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p class="rpt-section-title">Patrones detectados</p>
          ${$.patrones.positivos.length>0?`
            <div style="margin-bottom:4px">
              <div style="font-size:6.5pt;font-weight:700;color:var(--ok);margin-bottom:2px">✅ Positivos</div>
              ${$.patrones.positivos.map(e=>`<div style="font-size:7pt;margin-bottom:2px">• ${a(e)}</div>`).join(``)}
            </div>
          `:``}
          ${$.patrones.atencion.length>0?`
            <div>
              <div style="font-size:6.5pt;font-weight:700;color:var(--warn);margin-bottom:2px">⚠️ Atención requerida</div>
              ${$.patrones.atencion.map(e=>`<div style="font-size:7pt;margin-bottom:2px">• ${a(e)}</div>`).join(``)}
            </div>
          `:``}
          ${!$.patrones.positivos.length&&!$.patrones.atencion.length?`<div style="font-size:7pt;color:var(--ink3)">(Análisis no disponible)</div>`:``}
        </div>
      </div>
    `,Ee=$.recomendaciones,De=`
      <p class="rpt-section-title" style="margin-top:4mm">Recomendaciones institucionales</p>
      <div class="reco-grid">
        <div class="reco-card">
          <div class="reco-title">📚 Académico</div>
          <div>${a(Ee.academico||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">📋 Logística</div>
          <div>${a(Ee.logistica||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">⭐ Talentos</div>
          <div>${a(Ee.talentos||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">🎯 Refuerzo</div>
          <div>${a(Ee.refuerzo||`(Sin datos suficientes)`)}</div>
        </div>
      </div>
    `,Oe=$.notaDireccion?`
      <div class="nota-dir">
        <div class="nota-title">📝 Nota para Dirección Ejecutiva</div>
        <div>${a($.notaDireccion)}</div>
      </div>
    `:``,ke=`
      <div class="page land">
        ${o(pe)}
        ${Te}
        ${De}
        ${Oe}
        ${s(3,3,`${x(l)} ${i}`)}
      </div>
    `;m(g(me+ye+ke,!0),`informe-pedagogico-${i}-${C(l)}`)||e.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(t){console.error(`[reportService] generateMonthlyPedagogical:`,t),e.error(`Error al generar el informe pedagógico: `+t.message)}}async function D(t={}){try{let n=t.periodo||{},r=t.resumen||{},i=Array.isArray(t.clases)?t.clases:[],l=Array.isArray(t.alumnos)?t.alumnos:[],u=(r.totalPresentes||0)+(r.totalAusentes||0)+(r.totalJustificados||0),d=u>0?((r.totalPresentes||0)+(r.totalJustificados||0))/u*100:null,f=l.filter(e=>(e.tasaAsistencia==null?100:e.tasaAsistencia)<70),p=l.filter(e=>(e.tasaAsistencia==null?0:e.tasaAsistencia)>=90),h=l.flatMap(e=>Array.isArray(e.justificaciones)?e.justificaciones:[]).reduce((e,t)=>{let n=String(t||``).trim().toLowerCase();return n&&(e[n]=(e[n]||0)+1),e},{}),_=Object.entries(h).sort((e,t)=>t[1]-e[1]).slice(0,5),v=o({docTag:`CIERRE ACADÉMICO`,clase:n.nombre||`Período institucional`,docente:`Coordinación / Dirección`,periodo:`${b(n.fecha_inicio||n.fechaInicio)} a ${b(n.fecha_fin||n.fechaFin)}`.trim(),extraItems:[{label:`Estado`,value:n.cerrado?`Cerrado`:`Activo`},{label:`Período ID`,value:n.id||n.periodo_id||`N/D`}]}),y=c([{label:`Clases`,value:r.totalClases||0,type:`navy`},{label:`Contenido`,value:r.totalContenido||0,type:`info`},{label:`Presentes`,value:r.totalPresentes||0,type:`ok`},{label:`Ausentes`,value:r.totalAusentes||0,type:`bad`},{label:`Justificados`,value:r.totalJustificados||0,type:`warn`},{label:`Alumnos`,value:r.totalAlumnos||l.length||0,type:`navy`}]),x=i.length?`
        <p class="rpt-section-title">Detalle por clase</p>
        <table class="rpt-table">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Docente</th>
              <th>Sesiones</th>
              <th>Contenido</th>
              <th>P</th>
              <th>A</th>
              <th>J</th>
            </tr>
          </thead>
          <tbody>
            ${i.map(e=>`
                <tr>
                  <td>${a(e.claseNombre||e.nombre||`—`)}</td>
                  <td>${a(e.maestroNombre||`—`)}</td>
                  <td>${a(e.sesiones??0)}</td>
                  <td>${a(e.contenidosTrabajados??0)}</td>
                  <td>${a(e.presentes??0)}</td>
                  <td>${a(e.ausentes??0)}</td>
                  <td>${a(e.justificados??0)}</td>
                </tr>`).join(``)}
          </tbody>
        </table>
      `:`<div class="nota-dir">No hay clases consolidadas para este período.</div>`,S=l.length?`
        <p class="rpt-section-title">Detalle por alumno</p>
        <table class="rpt-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Presentes</th>
              <th>Ausentes</th>
              <th>Justificados</th>
              <th>Asistencia</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            ${l.slice(0,30).map(e=>`
                <tr>
                  <td>${a(e.alumnoNombre||e.nombre_completo||`—`)}</td>
                  <td>${a(e.presentes??0)}</td>
                  <td>${a(e.ausentes??0)}</td>
                  <td>${a(e.justificados??0)}</td>
                  <td>${a(e.tasaAsistencia==null?`N/D`:`${e.tasaAsistencia.toFixed(1)}%`)}</td>
                  <td>${a(e.totalRegistrosProgreso??0)}</td>
                </tr>`).join(``)}
          </tbody>
        </table>
      `:`<div class="nota-dir">No hay alumnos consolidados para este período.</div>`;m(g(`
      <div class="page">
        ${v}
        ${y}
        ${`
      <p class="rpt-section-title">Indicadores institucionales</p>
      <div class="reco-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="reco-card"><div class="reco-title">Cumplimiento de clases</div><div>${a(r.totalClases||0)}</div></div>
        <div class="reco-card"><div class="reco-title">Asistencia global</div><div>${a(`${r.totalPresentes||0} / ${r.totalAusentes||0} / ${r.totalJustificados||0}`)}</div></div>
        <div class="reco-card"><div class="reco-title">Cobertura de alumnos</div><div>${a(r.totalAlumnos||l.length||0)}</div></div>
        <div class="reco-card"><div class="reco-title">Tasa global</div><div>${a(d==null?`N/D`:`${d.toFixed(1)}%`)}</div></div>
      </div>
    `}
        ${`
      <p class="rpt-section-title">Lectura ejecutiva</p>
      <div class="reco-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="reco-card">
          <div class="reco-title">Alumnos en riesgo</div>
          <div>${a(f.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Alumnos destacados</div>
          <div>${a(p.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Justificaciones frecuentes</div>
          <div>${a(_.length)}</div>
        </div>
      </div>
    `}
        ${_.length?`
        <p class="rpt-section-title">Razones de justificación más frecuentes</p>
        <table class="rpt-table">
          <thead><tr><th>Razón</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${_.map(([e,t])=>`<tr><td>${a(e)}</td><td>${a(t)}</td></tr>`).join(``)}
          </tbody>
        </table>
      `:``}
        
      <div class="nota-dir">
        <div class="nota-title">Cierre institucional</div>
        <div>Este informe consolida el período académico cerrado y debe archivarse como evidencia oficial de semestre/año escolar.</div>
      </div>
    
        ${s(1,2,`${b(n.fecha_inicio||n.fechaInicio)} - ${b(n.fecha_fin||n.fechaFin)}`)}
      </div>
    
      <div class="page land">
        ${v}
        ${x}
        ${S}
        ${s(2,2,`${b(n.fecha_inicio||n.fechaInicio)} - ${b(n.fecha_fin||n.fechaFin)}`)}
      </div>
    `,!0),`cierre-academico-${n.id||`periodo`}`)||e.info(`El reporte se descargó como archivo HTML. Abrilo en el navegador e imprimilo como PDF.`)}catch(t){console.error(`[reportService] generateAcademicClosureReport:`,t),e.error(`Error al generar el cierre académico: `+t.message)}}export{E as a,s as c,m as d,g as f,T as i,o as l,D as n,_ as o,w as r,a as s,v as t,c as u};