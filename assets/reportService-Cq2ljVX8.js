import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{i as t}from"./supabase-BryBf0UA.js";import{t as n}from"./AppToast-BfOaB9z8.js";import{r}from"./groqService-BHtbKQwk.js";var i=`
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
  `}function p(e){return!e||e.length===0?``:`<div class="rpt-content-chips">${e.map(e=>`<span class="content-chip">${a(e)}</span>`).join(``)}</div>`}function m(e,t=`reporte`){let n=window.open(``,`_blank`);return n?(n.document.open(),n.document.write(e),n.document.close(),n.focus(),n.onload=()=>{setTimeout(()=>n.print(),500)},setTimeout(()=>{try{n&&!n.closed&&n.print()}catch{}},1500),!0):(h(e,t),!1)}function h(e,t=`reporte`){let n=new Date().toISOString().split(`T`)[0],r=new Blob([e],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`${t}-${n}.html`,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}function ee(e,t=!1){return`<!DOCTYPE html>
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
</html>`}var g=e({buildAlumnoAttMap:()=>v,calcAttendanceStats:()=>_,generateDailyReport:()=>C,generateMonthlyAttendance:()=>w,generateMonthlyPedagogical:()=>T});function _(e){let t=e||[];return{P:t.filter(e=>e.estado===`P`).length,A:t.filter(e=>e.estado===`A`).length,J:t.filter(e=>e.estado===`J`).length,total:t.length}}function v(e){let t={};for(let n of e)for(let e of n.asistencia||[])t[e.alumno_id]||(t[e.alumno_id]={}),t[e.alumno_id][n.id]=e.estado;return t}function y(e){return e?new Date(e+`T00:00:00`).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):``}function b(e){return[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`][e-1]??``}function x(e,t){return new Date(e,t,0).getDate()}function S(e){return String(e).padStart(2,`0`)}async function C(e){try{let{data:r,error:i}=await t.from(`sesiones_clase`).select(`id, fecha, clase_id, asistencia, contenido`).eq(`id`,e).single();if(i)throw i;let u;if(r.clase_id){let{data:e,error:n}=await t.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,r.clase_id).single();if(n)throw n;u=e}else u={id:e,nombre:r.actividad||`Actividad Especial`,instrumento:r.motivo||``,maestro_id:r.maestro_id};let f=`Docente`;if(u.maestro_id){let{data:e}=await t.from(`maestros`).select(`nombre_completo`).eq(`id`,u.maestro_id).single();e&&(f=e.nombre_completo)}let h=1;if(r.clase_id){let{count:e}=await t.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,r.clase_id).lte(`fecha`,r.fecha);h=e||1}let g=[];if(r.clase_id){let{data:e,error:n}=await t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,r.clase_id).eq(`activo`,!0).order(`alumnos(nombre_completo)`);if(n)throw n;g=(e||[]).map(e=>e.alumnos).filter(Boolean)}else{let e=(r.asistencia||[]).map(e=>e.alumno_id).filter(Boolean);if(e.length>0){let{data:n}=await t.from(`alumnos`).select(`id, nombre_completo`).in(`id`,e);g=n||[]}}if(!g||g.length===0){n.error(`No hay alumnos registrados para esta actividad.`);return}let v=r.asistencia||[],b=_(v),x={};v.forEach(e=>{x[e.alumno_id]=e});let S=g.length>20,C=r.contenido||``,w=C.split(/[\n,]/).map(e=>e.replace(/^\s*[-*\d.]+\s*/,``).trim()).filter(e=>e.length>2&&e.length<60).slice(0,12),T=C.split(`
`).filter(e=>e.trim()),E=[];for(let e of T)/destacad|excelente|logr/i.test(e)?E.push({type:`pos`,label:`Destacado`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo|falt/i.test(e)?E.push({type:`neg`,label:`Alerta`,text:e.replace(/^[-*]\s*/,``)}):/novedad|nota|aviso/i.test(e)&&E.push({type:`info`,label:`Novedad`,text:e.replace(/^[-*]\s*/,``)});let D=E.slice(0,4).map(e=>d(e.type,e.label,e.text)).join(``),te=`REPORTE DIARIO · ${y(r.fecha)}`,ne=u.nombre,re=o({docTag:te,clase:ne,docente:f,periodo:`Sesión #${h} · ${y(r.fecha)}`}),O=c([{label:`Presentes`,value:b.P,type:`ok`},{label:`Ausentes`,value:b.A,type:`bad`},{label:`Justificados`,value:b.J,type:`warn`},{label:`Total`,value:g.length,type:`navy`}]),k=`
      <p class="rpt-section-title">Registro de asistencia</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación</th></tr></thead>
        <tbody>${g.map((e,t)=>{let n=x[e.id],r=n?.estado??`—`,i=[`P`,`A`,`J`].includes(r)?l(r):a(r),o=a(n?.observacion||``);return`<tr>
        <td>${t+1}</td>
        <td>${a(e.nombre_completo)}</td>
        <td style="text-align:center">${i}</td>
        <td style="font-size:6.5pt;color:#6b7085">${o}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    `,A=w.length>0?`<p class="rpt-section-title">Contenido de la sesión</p>${p(w)}`:``,j=D?`<p class="rpt-section-title">Observaciones</p><div class="rpt-obs">${D}</div>`:``,ie=s(1,1,y(r.fecha));m(ee(`
      <div class="${S?`page land`:`page`}">
        ${re}
        ${O}
        ${k}
        ${A}
        ${j}
        ${ie}
      </div>
    `,S),`reporte-diario-${r.fecha?.replace(/-/g,``)||`fecha`}`)||n.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(e){console.error(`[reportService] generateDailyReport:`,e),n.error(`Error al generar el reporte: `+e.message)}}async function w(e,r,i){try{let u=S(i),d=x(r,i),p=`${r}-${u}-01`,h=`${r}-${u}-${d}`,g=i===1?12:i-1,C=i===1?r-1:r,w=S(g),T=x(C,g),E=`${C}-${w}-01`,D=`${C}-${w}-${T}`,[te,ne,re,O,k]=await Promise.all([t.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,e).gte(`fecha`,p).lte(`fecha`,h).order(`fecha`),t.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)`).eq(`clase_id`,e).gte(`fecha`,p).lte(`fecha`,h),t.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,e).gte(`fecha`,E).lte(`fecha`,D),t.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,e).single(),t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,e).eq(`activo`,!0)]);for(let e of[te,O,k])if(e.error)throw e.error;let A=te.data||[],j=ne.data||[],ie=re.data||[],ae=O.data,M=(k.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo));if(A.length===0){n.error(`No hay sesiones registradas para este período.`);return}let N=`Docente`;if(ae.maestro_id){let{data:e}=await t.from(`maestros`).select(`nombre_completo`).eq(`id`,ae.maestro_id).single();e&&(N=e.nombre_completo)}let{count:oe}=await t.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,e).lt(`fecha`,p),P=oe||0,F=M.length>18||A.length>16,I=0,L=0,R=0;A.forEach(e=>{let t=_(e.asistencia);I+=t.P,L+=t.A,R+=t.J});let z=I+L+R,B=0,V=0,H=0;ie.forEach(e=>{let t=_(e.asistencia);B+=t.P,V+=t.A,H+=t.J});let U=B+V+H,W=(e,t)=>t>0?Math.round(e/t*100):0,G=(e,t,n,r)=>{let i=W(e,n),a=W(t,r),o=i-a;return{cur:i,prev:a,diff:o,label:`${o>0?`+`:``}${o}%`,cls:o>=0?`delta-up`:`delta-down`}},K=G(I,B,z,U),q=G(L,V,z,U),J=G(R,H,z,U),Y=v(A),X={docTag:`RESUMEN MENSUAL · ${b(i).toUpperCase()} ${r}`,clase:ae.nombre,docente:N,periodo:`${b(i)} ${r}`,extraItems:[{label:`Sesiones`,value:A.length},{label:`Alumnos`,value:M.length}]},se=c([{label:`Presentes`,value:`${I} (${W(I,z)}%)`,type:`ok`},{label:`Ausentes`,value:`${L} (${W(L,z)}%)`,type:`bad`},{label:`Justificados`,value:`${R} (${W(R,z)}%)`,type:`warn`},{label:`Sesiones`,value:A.length,type:`navy`}]),ce=`
      <p class="rpt-section-title">Asistencia diaria por alumno</p>
      <table class="rpt-table" style="font-size:6.5pt">
        <thead><tr>
          <th>#</th><th>Alumno</th>
          ${A.map((e,t)=>`<th style="text-align:center;font-size:6pt">S${P+t+1}</th>`).join(``)}
          <th style="text-align:center;background:var(--ok)">P</th>
          <th style="text-align:center;background:var(--bad)">A</th>
          <th style="text-align:center;background:var(--warn)">J</th>
        </tr></thead>
        <tbody>${M.map((e,t)=>{let n=Y[e.id]||{},r=0,i=0,o=0,s=A.map(e=>{let t=n[e.id]??`—`;return t===`P`&&r++,t===`A`&&i++,t===`J`&&o++,`<td style="text-align:center">${[`P`,`A`,`J`].includes(t)?l(t):a(t)}</td>`}).join(``);return`<tr>
        <td>${t+1}</td>
        <td>${a(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</td>
        ${s}
        <td style="text-align:center;font-weight:700;color:var(--ok)">${r}</td>
        <td style="text-align:center;font-weight:700;color:var(--bad)">${i}</td>
        <td style="text-align:center;font-weight:700;color:var(--warn)">${o}</td>
      </tr>`}).join(``)}${`<tr style="background:#f0f4ff;font-weight:700">
      <td colspan="2">TOTALES</td>
      ${A.map(()=>`<td></td>`).join(``)}
      <td style="text-align:center;color:var(--ok)">${I}</td>
      <td style="text-align:center;color:var(--bad)">${L}</td>
      <td style="text-align:center;color:var(--warn)">${R}</td>
    </tr>`}</tbody>
      </table>
    `,le=`
      <div class="${F?`page land`:`page`}">
        ${o(X)}
        ${se}
        ${ce}
        ${s(1,j.length>0||U>0?2:1,`${b(i)} ${r}`)}
      </div>
    `,Z=``;if(j.length>0||U>0){let e=j.map((e,t)=>`<tr>
        <td>${t+1}</td>
        <td>${a(e.alumnos?.nombre_completo??``)}</td>
        <td>${a(y(e.fecha))}</td>
        <td>${a(e.tipo??`Justificado`)}</td>
        <td>${a(e.motivo??``)}</td>
      </tr>`).join(``),t=e?`
        <p class="rpt-section-title">Justificaciones detalladas</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
          <tbody>${e}</tbody>
        </table>
      `:``,n=U>0?`
        <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${b(g)} ${C}</p>
        <div style="max-width:260mm">
          ${f(`Presentes`,K,`bar-ok`)}
          ${f(`Ausentes`,q,`bar-bad`)}
          ${f(`Justif.`,J,`bar-warn`)}
        </div>
      `:``;Z=`
        <div class="${F?`page land`:`page`}">
          ${o(X)}
          ${t}
          ${n}
          ${s(2,2,`${b(i)} ${r}`)}
        </div>
      `}m(ee(le+Z,F),`resumen-asistencia-${r}-${S(i)}`)||n.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(e){console.error(`[reportService] generateMonthlyAttendance:`,e),n.error(`Error al generar el resumen: `+e.message)}}async function T(e,i,l){try{let h=S(l),g=x(i,l),C=`${i}-${h}-01`,w=`${i}-${h}-${g}`,T=l===1?12:l-1,E=l===1?i-1:i,D=S(T),te=x(E,T),ne=`${E}-${D}-01`,re=`${E}-${D}-${te}`,[O,k,A,j,ie,ae,M]=await Promise.all([t.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,e).gte(`fecha`,C).lte(`fecha`,w).order(`fecha`),t.from(`observaciones_sesion`).select(`sesion_clase_id, contenido_ia_dsl, contenido_dsl`).in(`sesion_clase_id`,(await t.from(`sesiones_clase`).select(`id`).eq(`clase_id`,e).gte(`fecha`,C).lte(`fecha`,w)).data?.map(e=>e.id)||[]),t.from(`progresos`).select(`id, alumno_id, objetivo_id, tipo, contenido_dsl, created_at,
                 alumnos(nombre_completo),
                 curriculo_objetivos(descripcion, categoria)`).eq(`clase_id`,e).gte(`created_at`,C).lte(`created_at`,w),t.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,e).single(),t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,e).eq(`activo`,!0),t.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,e).gte(`fecha`,ne).lte(`fecha`,re),t.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo`).eq(`clase_id`,e).gte(`fecha`,C).lte(`fecha`,w)]);if(O.error)throw O.error;if(j.error)throw j.error;let N=O.data||[],oe=k.data||[],P=A.data||[],F=j.data,I=(ie.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo)),L=ae.data||[],R=M.data||[];if(N.length===0){n.error(`No hay sesiones registradas para este período.`);return}let z=`Docente`;if(F.maestro_id){let{data:e}=await t.from(`maestros`).select(`nombre_completo`).eq(`id`,F.maestro_id).single();e&&(z=e.nombre_completo)}let{count:B}=await t.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,e).lt(`fecha`,C),V=B||0,H={};oe.forEach(e=>{H[e.sesion_clase_id]=e});let U=0,W=0,G=0;N.forEach(e=>{let t=_(e.asistencia);U+=t.P,W+=t.A,G+=t.J});let K=U+W+G,q=(e,t)=>t>0?Math.round(e/t*100):0,J=0,Y=0,X=0;L.forEach(e=>{let t=_(e.asistencia);J+=t.P,Y+=t.A,X+=t.J});let se=J+Y+X,ce=new Set;N.forEach(e=>{let t=H[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(/[\n,]/).forEach(e=>{let t=e.replace(/^\s*[-*\d.]+\s*/,``).trim();t.length>2&&t.length<60&&ce.add(t)})});let le=[...ce].slice(0,16),Z=[];N.forEach(e=>{let t=H[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(`
`).forEach(e=>{/destacad|excelente/i.test(e)?Z.push({type:`pos`,label:`Destacado Académico`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo/i.test(e)?Z.push({type:`neg`,label:`Alerta Asistencia`,text:e.replace(/^[-*]\s*/,``)}):/novedad|administrativ/i.test(e)?Z.push({type:`info`,label:`Novedad Administrativa`,text:e.replace(/^[-*]\s*/,``)}):/nota|pedagóg/i.test(e)&&Z.push({type:`warn`,label:`Nota Pedagógica`,text:e.replace(/^[-*]\s*/,``)})})});let ue=Z.slice(0,4);for(;ue.length<4;)ue.push({type:`info`,label:`Nota`,text:`—`});let de=N.map((e,t)=>{let n=_(e.asistencia),r=H[e.id],i=(r?.contenido_ia_dsl||r?.contenido_dsl||``).split(/[\n,]/)[0]?.replace(/^[-*\d.]+\s*/,``).trim()||`Sin contenido registrado`;return`
        <div class="session-card">
          <div class="sc-top">S${V+t+1} · ${a(y(e.fecha))}</div>
          <div style="font-size:6pt;color:var(--ink3);margin-bottom:2px">${a(i.slice(0,45))}</div>
          <div class="sc-att">
            <span class="att-cell att-P">P:${n.P}</span>
            <span class="att-cell att-A">A:${n.A}</span>
            <span class="att-cell att-J">J:${n.J}</span>
          </div>
        </div>
      `}).join(``),fe={docTag:`INFORME PEDAGÓGICO · ${b(l).toUpperCase()} ${i}`,clase:F.nombre,docente:z,periodo:`${b(l)} ${i}`,extraItems:[{label:`Sesiones`,value:N.length},{label:`Alumnos`,value:I.length}]},pe=`
      <div class="page land">
        ${o(fe)}
        ${c([{label:`Sesiones`,value:N.length,type:`navy`},{label:`% Asistencia`,value:q(U,K)+`%`,type:`ok`},{label:`Presentes`,value:U,type:`ok`},{label:`Ausentes`,value:W,type:`bad`},{label:`Justif.`,value:G,type:`warn`},{label:`Contenidos`,value:le.length,type:`info`}])}
        <p class="rpt-section-title">Contenidos trabajados</p>
        ${p(le)}
        <p class="rpt-section-title">Observaciones institucionales</p>
        <div class="rpt-obs">
          ${ue.map(e=>d(e.type,e.label,e.text)).join(``)}
        </div>
        <p class="rpt-section-title">Cronograma de sesiones</p>
        <div class="session-grid">${de}</div>
        ${s(1,3,`${b(l)} ${i}`)}
      </div>
    `,me=I.length>12?`cols-4`:`cols-3`,he=v(N),ge={};R.forEach(e=>{ge[e.alumno_id]||(ge[e.alumno_id]=[]),ge[e.alumno_id].push(e)});let Q={};P.forEach(e=>{Q[e.alumno_id]||(Q[e.alumno_id]=[]),Q[e.alumno_id].push(e)});let _e=I.map(e=>{let t=he[e.id]||{},n=0,r=0,i=0;N.forEach(e=>{let a=t[e.id];a===`P`&&n++,a===`A`&&r++,a===`J`&&i++});let o=N.length,s=q(n,o),c,l;s>=90&&Q[e.id]?.some(e=>e.tipo===`LOGRADO`)?(c=`Destacado`,l=`badge-destacado`):s<60?(c=`En Riesgo`,l=`badge-riesgo`):s>=75?(c=`Estable`,l=`badge-estable`):(c=`En Mejora`,l=`badge-mejora`);let d=e.nombre_completo.split(` `),f=a((d[0]?.[0]??``)+(d[2]?.[0]??d[1]?.[0]??``)),p=ge[e.id]||[],m=p.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Justificaciones</div>
          ${p.slice(0,4).map(e=>`<div class="pc-just-item" style="font-size:6pt">${a(e.motivo||e.tipo)} — ${a(y(e.fecha))}</div>`).join(``)}
        </div>
      `:``,h=Q[e.id]||[],ee=h.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Progreso</div>
          ${h.slice(0,3).map(e=>{let t=e.curriculo_objetivos?.descripcion||e.contenido_dsl||`Objetivo`,n=e.tipo===`LOGRADO`?100:e.tipo===`EN_PROGRESO`?60:30;return u(e.tipo,t.slice(0,28),n)}).join(``)}
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
          ${ee}
        </div>
      `}).join(``),ve=`
      <div class="page land">
        ${o(fe)}
        <p class="rpt-section-title">Perfiles individuales</p>
        <div class="profile-grid ${me}">${_e}</div>
        ${s(2,3,`${b(l)} ${i}`)}
      </div>
    `,ye={clase:F.nombre,docente:z,mes:`${b(l)} ${i}`,totalAlumnos:I.length},$=await r(N.map((e,t)=>({...e,numero_sesion:V+t+1})),P,ye),be=(()=>{let e=q(U,K),t=q(J,se||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n>=0?`delta-up`:`delta-down`}})(),xe=(()=>{let e=q(W,K),t=q(Y,se||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n<0?`delta-up`:`delta-down`}})(),Se=L.length*2,Ce=le.length,we=`
      <div style="display:grid;grid-template-columns:60% 40%;gap:6mm">
        <div>
          <p class="rpt-section-title">Comparativa estadística</p>
          ${f(`Presentes`,be,`bar-ok`)}
          ${f(`Ausentes`,xe,`bar-bad`)}
          <div style="margin-top:4px">
            <table class="rpt-table" style="font-size:7pt">
              <thead><tr>
                <th>Indicador</th>
                <th>${b(T)} ${E}</th>
                <th>${b(l)} ${i}</th>
                <th>Δ</th>
              </tr></thead>
              <tbody>
                <tr><td>Contenidos cubiertos</td><td>${Se}</td><td>${Ce}</td>
                    <td class="${Ce>=Se?`delta-up`:`delta-down`}" style="font-weight:700">
                      ${Ce>=Se?`+`:``}${Ce-Se}
                    </td></tr>
                <tr><td>Logros individuales</td>
                    <td>${L.length>0?`—`:`0`}</td>
                    <td>${P.filter(e=>e.tipo===`LOGRADO`).length}</td>
                    <td class="delta-up" style="font-weight:700">${P.filter(e=>e.tipo===`LOGRADO`).length}</td>
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
    `,Te=$.recomendaciones,Ee=`
      <p class="rpt-section-title" style="margin-top:4mm">Recomendaciones institucionales</p>
      <div class="reco-grid">
        <div class="reco-card">
          <div class="reco-title">📚 Académico</div>
          <div>${a(Te.academico||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">📋 Logística</div>
          <div>${a(Te.logistica||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">⭐ Talentos</div>
          <div>${a(Te.talentos||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">🎯 Refuerzo</div>
          <div>${a(Te.refuerzo||`(Sin datos suficientes)`)}</div>
        </div>
      </div>
    `,De=$.notaDireccion?`
      <div class="nota-dir">
        <div class="nota-title">📝 Nota para Dirección Ejecutiva</div>
        <div>${a($.notaDireccion)}</div>
      </div>
    `:``,Oe=`
      <div class="page land">
        ${o(fe)}
        ${we}
        ${Ee}
        ${De}
        ${s(3,3,`${b(l)} ${i}`)}
      </div>
    `;m(ee(pe+ve+Oe,!0),`informe-pedagogico-${i}-${S(l)}`)||n.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(e){console.error(`[reportService] generateMonthlyPedagogical:`,e),n.error(`Error al generar el informe pedagógico: `+e.message)}}export{g as i,w as n,T as r,C as t};