import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{i as t}from"./supabase-C4ics26R.js";import{t as n}from"./AppToast-BOjiJExQ.js";import{r}from"./groqService-KWo346Hv.js";var i=`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, Arial, sans-serif; color: #1a1d29; background: #fff; }

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
  `}function f(e){return!e||e.length===0?``:`<div class="rpt-content-chips">${e.map(e=>`<span class="content-chip">${a(e)}</span>`).join(``)}</div>`}function p(e){let t=window.open(``,`_blank`);return t?(t.document.open(),t.document.write(e),t.document.close(),setTimeout(()=>t.print(),600),!0):!1}function ee(e,t=!1){return`<!DOCTYPE html>
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
</html>`}var m=e({buildAlumnoAttMap:()=>g,calcAttendanceStats:()=>h,generateDailyReport:()=>x,generateMonthlyAttendance:()=>S,generateMonthlyPedagogical:()=>w});function h(e){let t=e||[];return{P:t.filter(e=>e.estado===`P`).length,A:t.filter(e=>e.estado===`A`).length,J:t.filter(e=>e.estado===`J`).length,total:t.length}}function g(e){let t={};for(let n of e)for(let e of n.asistencia||[])t[e.alumno_id]||(t[e.alumno_id]={}),t[e.alumno_id][n.id]=e.estado;return t}function _(e){return e?new Date(e+`T00:00:00`).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):``}function v(e){return[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`][e-1]??``}function y(e,t){return new Date(e,t,0).getDate()}function b(e){return String(e).padStart(2,`0`)}async function x(e){try{let[r,i]=await Promise.all([t.from(`sesiones_clase`).select(`id, fecha, clase_id, asistencia`).eq(`id`,e).single(),t.from(`observaciones_sesion`).select(`contenido_ia_dsl, contenido_dsl`).eq(`sesion_clase_id`,e).maybeSingle()]);if(r.error)throw r.error;let u=r.data,m=i.data,{data:g,error:v}=await t.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,u.clase_id).single();if(v)throw v;let y=`Docente`;if(g.maestro_id){let{data:e}=await t.from(`maestros`).select(`nombre_completo`).eq(`id`,g.maestro_id).single();e&&(y=e.nombre_completo)}let{count:b}=await t.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,g.id).lte(`fecha`,u.fecha),x=b||1,{data:S,error:C}=await t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,g.id).eq(`activo`,!0).order(`alumnos(nombre_completo)`);if(C)throw C;let w=(S||[]).map(e=>e.alumnos).filter(Boolean);if(!w||w.length===0){n.error(`No hay alumnos registrados para esta clase.`);return}let T=u.asistencia||[],E=h(T),D={};T.forEach(e=>{D[e.alumno_id]=e});let O=w.length>20,k=m?.contenido_ia_dsl||m?.contenido_dsl||``,te=k.split(/[\n,]/).map(e=>e.replace(/^\s*[\-\*\d\.]+\s*/,``).trim()).filter(e=>e.length>2&&e.length<60).slice(0,12),A=k.split(`
`).filter(e=>e.trim()),j=[];for(let e of A)/destacad|excelente|logr/i.test(e)?j.push({type:`pos`,label:`Destacado`,text:e.replace(/^[\-\*]\s*/,``)}):/alerta|ausencia|riesgo|falt/i.test(e)?j.push({type:`neg`,label:`Alerta`,text:e.replace(/^[\-\*]\s*/,``)}):/novedad|nota|aviso/i.test(e)&&j.push({type:`info`,label:`Novedad`,text:e.replace(/^[\-\*]\s*/,``)});let M=j.slice(0,4).map(e=>d(e.type,e.label,e.text)).join(``),N=`REPORTE DIARIO · ${_(u.fecha)}`,ne=g.nombre,P=o({docTag:N,clase:ne,docente:y,periodo:`Sesión #${x} · ${_(u.fecha)}`}),F=c([{label:`Presentes`,value:E.P,type:`ok`},{label:`Ausentes`,value:E.A,type:`bad`},{label:`Justificados`,value:E.J,type:`warn`},{label:`Total`,value:w.length,type:`navy`}]),I=`
      <p class="rpt-section-title">Registro de asistencia</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación</th></tr></thead>
        <tbody>${w.map((e,t)=>{let n=D[e.id],r=n?.estado??`—`,i=[`P`,`A`,`J`].includes(r)?l(r):a(r),o=a(n?.observacion||``);return`<tr>
        <td>${t+1}</td>
        <td>${a(e.nombre_completo)}</td>
        <td style="text-align:center">${i}</td>
        <td style="font-size:6.5pt;color:#6b7085">${o}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    `,re=te.length>0?`<p class="rpt-section-title">Contenido de la sesión</p>${f(te)}`:``,L=M?`<p class="rpt-section-title">Observaciones</p><div class="rpt-obs">${M}</div>`:``,R=s(1,1,_(u.fecha));p(ee(`
      <div class="${O?`page land`:`page`}">
        ${P}
        ${F}
        ${I}
        ${re}
        ${L}
        ${R}
      </div>
    `,O))||n.warn(`El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio e intenta de nuevo.`)}catch(e){console.error(`[reportService] generateDailyReport:`,e),n.error(`Error al generar el reporte: `+e.message)}}async function S(e,r,i){try{let u=b(i),d=y(r,i),f=`${r}-${u}-01`,m=`${r}-${u}-${d}`,x=i===1?12:i-1,S=i===1?r-1:r,w=b(x),T=y(S,x),E=`${S}-${w}-01`,D=`${S}-${w}-${T}`,[O,k,te,A,j]=await Promise.all([t.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,e).gte(`fecha`,f).lte(`fecha`,m).order(`fecha`),t.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)`).eq(`clase_id`,e).gte(`fecha`,f).lte(`fecha`,m),t.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,e).gte(`fecha`,E).lte(`fecha`,D),t.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,e).single(),t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,e).eq(`activo`,!0)]);for(let e of[O,A,j])if(e.error)throw e.error;let M=O.data||[],N=k.data||[],ne=te.data||[],P=A.data,F=(j.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo));if(M.length===0){n.error(`No hay sesiones registradas para este período.`);return}let I=`Docente`;if(P.maestro_id){let{data:e}=await t.from(`maestros`).select(`nombre_completo`).eq(`id`,P.maestro_id).single();e&&(I=e.nombre_completo)}let{count:re}=await t.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,e).lt(`fecha`,f),L=re||0,R=F.length>18||M.length>16,z=0,B=0,V=0;M.forEach(e=>{let t=h(e.asistencia);z+=t.P,B+=t.A,V+=t.J});let H=z+B+V,U=0,ie=0,W=0;ne.forEach(e=>{let t=h(e.asistencia);U+=t.P,ie+=t.A,W+=t.J});let G=U+ie+W,K=(e,t)=>t>0?Math.round(e/t*100):0,q=(e,t,n,r)=>{let i=K(e,n),a=K(t,r),o=i-a;return{cur:i,prev:a,diff:o,label:`${o>0?`+`:``}${o}%`,cls:o>=0?`delta-up`:`delta-down`}},J=q(z,U,H,G),Y=q(B,ie,H,G),X=q(V,W,H,G),ae=g(M),oe={docTag:`RESUMEN MENSUAL · ${v(i).toUpperCase()} ${r}`,clase:P.nombre,docente:I,periodo:`${v(i)} ${r}`,extraItems:[{label:`Sesiones`,value:M.length},{label:`Alumnos`,value:F.length}]},se=c([{label:`Presentes`,value:`${z} (${K(z,H)}%)`,type:`ok`},{label:`Ausentes`,value:`${B} (${K(B,H)}%)`,type:`bad`},{label:`Justificados`,value:`${V} (${K(V,H)}%)`,type:`warn`},{label:`Sesiones`,value:M.length,type:`navy`}]),ce=`
      <p class="rpt-section-title">Asistencia diaria por alumno</p>
      <table class="rpt-table" style="font-size:6.5pt">
        <thead><tr>
          <th>#</th><th>Alumno</th>
          ${M.map((e,t)=>`<th style="text-align:center;font-size:6pt">S${L+t+1}</th>`).join(``)}
          <th style="text-align:center;background:var(--ok)">P</th>
          <th style="text-align:center;background:var(--bad)">A</th>
          <th style="text-align:center;background:var(--warn)">J</th>
        </tr></thead>
        <tbody>${F.map((e,t)=>{let n=ae[e.id]||{},r=0,i=0,o=0,s=M.map(e=>{let t=n[e.id]??`—`;return t===`P`&&r++,t===`A`&&i++,t===`J`&&o++,`<td style="text-align:center">${[`P`,`A`,`J`].includes(t)?l(t):a(t)}</td>`}).join(``);return`<tr>
        <td>${t+1}</td>
        <td>${a(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</td>
        ${s}
        <td style="text-align:center;font-weight:700;color:var(--ok)">${r}</td>
        <td style="text-align:center;font-weight:700;color:var(--bad)">${i}</td>
        <td style="text-align:center;font-weight:700;color:var(--warn)">${o}</td>
      </tr>`}).join(``)}${`<tr style="background:#f0f4ff;font-weight:700">
      <td colspan="2">TOTALES</td>
      ${M.map(()=>`<td></td>`).join(``)}
      <td style="text-align:center;color:var(--ok)">${z}</td>
      <td style="text-align:center;color:var(--bad)">${B}</td>
      <td style="text-align:center;color:var(--warn)">${V}</td>
    </tr>`}</tbody>
      </table>
    `,le=`
      <div class="${R?`page land`:`page`}">
        ${o(oe)}
        ${se}
        ${ce}
        ${s(1,N.length>0||G>0?2:1,`${v(i)} ${r}`)}
      </div>
    `,Z=``;if(N.length>0||G>0){let e=N.map((e,t)=>`<tr>
        <td>${t+1}</td>
        <td>${a(e.alumnos?.nombre_completo??``)}</td>
        <td>${a(_(e.fecha))}</td>
        <td>${a(e.tipo??`Justificado`)}</td>
        <td>${a(e.motivo??``)}</td>
      </tr>`).join(``),t=e?`
        <p class="rpt-section-title">Justificaciones detalladas</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
          <tbody>${e}</tbody>
        </table>
      `:``,n=G>0?`
        <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${v(x)} ${S}</p>
        <div style="max-width:260mm">
          ${C(`Presentes`,J,`bar-ok`)}
          ${C(`Ausentes`,Y,`bar-bad`)}
          ${C(`Justif.`,X,`bar-warn`)}
        </div>
      `:``;Z=`
        <div class="${R?`page land`:`page`}">
          ${o(oe)}
          ${t}
          ${n}
          ${s(2,2,`${v(i)} ${r}`)}
        </div>
      `}p(ee(le+Z,R))||n.warn(`El navegador bloqueó la ventana emergente. Permite las ventanas emergentes e intenta de nuevo.`)}catch(e){console.error(`[reportService] generateMonthlyAttendance:`,e),n.error(`Error al generar el resumen: `+e.message)}}function C(e,t,n){return`
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
  `}async function w(e,i,l){try{let m=b(l),x=y(i,l),S=`${i}-${m}-01`,w=`${i}-${m}-${x}`,T=l===1?12:l-1,E=l===1?i-1:i,D=b(T),O=y(E,T),k=`${E}-${D}-01`,te=`${E}-${D}-${O}`,[A,j,M,N,ne,P,F]=await Promise.all([t.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,e).gte(`fecha`,S).lte(`fecha`,w).order(`fecha`),t.from(`observaciones_sesion`).select(`sesion_clase_id, contenido_ia_dsl, contenido_dsl`).in(`sesion_clase_id`,(await t.from(`sesiones_clase`).select(`id`).eq(`clase_id`,e).gte(`fecha`,S).lte(`fecha`,w)).data?.map(e=>e.id)||[]),t.from(`progresos`).select(`id, alumno_id, objetivo_id, tipo, contenido_dsl, created_at,
                 alumnos(nombre_completo),
                 curriculo_objetivos(descripcion, categoria)`).eq(`clase_id`,e).gte(`created_at`,S).lte(`created_at`,w),t.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,e).single(),t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,e).eq(`activo`,!0),t.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,e).gte(`fecha`,k).lte(`fecha`,te),t.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo`).eq(`clase_id`,e).gte(`fecha`,S).lte(`fecha`,w)]);if(A.error)throw A.error;if(N.error)throw N.error;let I=A.data||[],re=j.data||[],L=M.data||[],R=N.data,z=(ne.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo)),B=P.data||[],V=F.data||[];if(I.length===0){n.error(`No hay sesiones registradas para este período.`);return}let H=`Docente`;if(R.maestro_id){let{data:e}=await t.from(`maestros`).select(`nombre_completo`).eq(`id`,R.maestro_id).single();e&&(H=e.nombre_completo)}let{count:U}=await t.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,e).lt(`fecha`,S),ie=U||0,W={};re.forEach(e=>{W[e.sesion_clase_id]=e});let G=0,K=0,q=0;I.forEach(e=>{let t=h(e.asistencia);G+=t.P,K+=t.A,q+=t.J});let J=G+K+q,Y=(e,t)=>t>0?Math.round(e/t*100):0,X=0,ae=0,oe=0;B.forEach(e=>{let t=h(e.asistencia);X+=t.P,ae+=t.A,oe+=t.J});let se=X+ae+oe,ce=new Set;I.forEach(e=>{let t=W[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(/[\n,]/).forEach(e=>{let t=e.replace(/^\s*[\-\*\d\.]+\s*/,``).trim();t.length>2&&t.length<60&&ce.add(t)})});let le=[...ce].slice(0,16),Z=[];I.forEach(e=>{let t=W[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(`
`).forEach(e=>{/destacad|excelente/i.test(e)?Z.push({type:`pos`,label:`Destacado Académico`,text:e.replace(/^[\-\*]\s*/,``)}):/alerta|ausencia|riesgo/i.test(e)?Z.push({type:`neg`,label:`Alerta Asistencia`,text:e.replace(/^[\-\*]\s*/,``)}):/novedad|administrativ/i.test(e)?Z.push({type:`info`,label:`Novedad Administrativa`,text:e.replace(/^[\-\*]\s*/,``)}):/nota|pedagóg/i.test(e)&&Z.push({type:`warn`,label:`Nota Pedagógica`,text:e.replace(/^[\-\*]\s*/,``)})})});let ue=Z.slice(0,4);for(;ue.length<4;)ue.push({type:`info`,label:`Nota`,text:`—`});let de=I.map((e,t)=>{let n=h(e.asistencia),r=W[e.id],i=(r?.contenido_ia_dsl||r?.contenido_dsl||``).split(/[\n,]/)[0]?.replace(/^[\-\*\d\.]+\s*/,``).trim()||`Sin contenido registrado`;return`
        <div class="session-card">
          <div class="sc-top">S${ie+t+1} · ${a(_(e.fecha))}</div>
          <div style="font-size:6pt;color:var(--ink3);margin-bottom:2px">${a(i.slice(0,45))}</div>
          <div class="sc-att">
            <span class="att-cell att-P">P:${n.P}</span>
            <span class="att-cell att-A">A:${n.A}</span>
            <span class="att-cell att-J">J:${n.J}</span>
          </div>
        </div>
      `}).join(``),fe={docTag:`INFORME PEDAGÓGICO · ${v(l).toUpperCase()} ${i}`,clase:R.nombre,docente:H,periodo:`${v(l)} ${i}`,extraItems:[{label:`Sesiones`,value:I.length},{label:`Alumnos`,value:z.length}]},pe=`
      <div class="page land">
        ${o(fe)}
        ${c([{label:`Sesiones`,value:I.length,type:`navy`},{label:`% Asistencia`,value:Y(G,J)+`%`,type:`ok`},{label:`Presentes`,value:G,type:`ok`},{label:`Ausentes`,value:K,type:`bad`},{label:`Justif.`,value:q,type:`warn`},{label:`Contenidos`,value:le.length,type:`info`}])}
        <p class="rpt-section-title">Contenidos trabajados</p>
        ${f(le)}
        <p class="rpt-section-title">Observaciones institucionales</p>
        <div class="rpt-obs">
          ${ue.map(e=>d(e.type,e.label,e.text)).join(``)}
        </div>
        <p class="rpt-section-title">Cronograma de sesiones</p>
        <div class="session-grid">${de}</div>
        ${s(1,3,`${v(l)} ${i}`)}
      </div>
    `,me=z.length>12?`cols-4`:`cols-3`,he=g(I),ge={};V.forEach(e=>{ge[e.alumno_id]||(ge[e.alumno_id]=[]),ge[e.alumno_id].push(e)});let Q={};L.forEach(e=>{Q[e.alumno_id]||(Q[e.alumno_id]=[]),Q[e.alumno_id].push(e)});let _e=z.map(e=>{let t=he[e.id]||{},n=0,r=0,i=0;I.forEach(e=>{let a=t[e.id];a===`P`&&n++,a===`A`&&r++,a===`J`&&i++});let o=I.length,s=Y(n,o),c,l;s>=90&&Q[e.id]?.some(e=>e.tipo===`LOGRADO`)?(c=`Destacado`,l=`badge-destacado`):s<60?(c=`En Riesgo`,l=`badge-riesgo`):s>=75?(c=`Estable`,l=`badge-estable`):(c=`En Mejora`,l=`badge-mejora`);let d=e.nombre_completo.split(` `),f=a((d[0]?.[0]??``)+(d[2]?.[0]??d[1]?.[0]??``)),p=ge[e.id]||[],ee=p.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Justificaciones</div>
          ${p.slice(0,4).map(e=>`<div class="pc-just-item" style="font-size:6pt">${a(e.motivo||e.tipo)} — ${a(_(e.fecha))}</div>`).join(``)}
        </div>
      `:``,m=Q[e.id]||[],h=m.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Progreso</div>
          ${m.slice(0,3).map(e=>{let t=e.curriculo_objetivos?.descripcion||e.contenido_dsl||`Objetivo`,n=e.tipo===`LOGRADO`?100:e.tipo===`EN_PROGRESO`?60:30;return u(e.tipo,t.slice(0,28),n)}).join(``)}
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
          ${ee}
          ${h}
        </div>
      `}).join(``),ve=`
      <div class="page land">
        ${o(fe)}
        <p class="rpt-section-title">Perfiles individuales</p>
        <div class="profile-grid ${me}">${_e}</div>
        ${s(2,3,`${v(l)} ${i}`)}
      </div>
    `,$=await r(I,L,{clase:R.nombre,docente:H,mes:`${v(l)} ${i}`,totalAlumnos:z.length}),ye=(()=>{let e=Y(G,J),t=Y(X,se||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n>=0?`delta-up`:`delta-down`}})(),be=(()=>{let e=Y(K,J),t=Y(ae,se||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n<0?`delta-up`:`delta-down`}})(),xe=B.length*2,Se=le.length,Ce=`
      <div style="display:grid;grid-template-columns:60% 40%;gap:6mm">
        <div>
          <p class="rpt-section-title">Comparativa estadística</p>
          ${C(`Presentes`,ye,`bar-ok`)}
          ${C(`Ausentes`,be,`bar-bad`)}
          <div style="margin-top:4px">
            <table class="rpt-table" style="font-size:7pt">
              <thead><tr>
                <th>Indicador</th>
                <th>${v(T)} ${E}</th>
                <th>${v(l)} ${i}</th>
                <th>Δ</th>
              </tr></thead>
              <tbody>
                <tr><td>Contenidos cubiertos</td><td>${xe}</td><td>${Se}</td>
                    <td class="${Se>=xe?`delta-up`:`delta-down`}" style="font-weight:700">
                      ${Se>=xe?`+`:``}${Se-xe}
                    </td></tr>
                <tr><td>Logros individuales</td>
                    <td>${B.length>0?`—`:`0`}</td>
                    <td>${L.filter(e=>e.tipo===`LOGRADO`).length}</td>
                    <td class="delta-up" style="font-weight:700">${L.filter(e=>e.tipo===`LOGRADO`).length}</td>
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
    `,we=$.recomendaciones,Te=`
      <p class="rpt-section-title" style="margin-top:4mm">Recomendaciones institucionales</p>
      <div class="reco-grid">
        <div class="reco-card">
          <div class="reco-title">📚 Académico</div>
          <div>${a(we.academico||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">📋 Logística</div>
          <div>${a(we.logistica||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">⭐ Talentos</div>
          <div>${a(we.talentos||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">🎯 Refuerzo</div>
          <div>${a(we.refuerzo||`(Sin datos suficientes)`)}</div>
        </div>
      </div>
    `,Ee=$.notaDireccion?`
      <div class="nota-dir">
        <div class="nota-title">📝 Nota para Dirección Ejecutiva</div>
        <div>${a($.notaDireccion)}</div>
      </div>
    `:``,De=`
      <div class="page land">
        ${o(fe)}
        ${Ce}
        ${Te}
        ${Ee}
        ${s(3,3,`${v(l)} ${i}`)}
      </div>
    `;p(ee(pe+ve+De,!0))||n.warn(`El navegador bloqueó la ventana emergente. Permite las ventanas emergentes e intenta de nuevo.`)}catch(e){console.error(`[reportService] generateMonthlyPedagogical:`,e),n.error(`Error al generar el informe pedagógico: `+e.message)}}export{m as i,S as n,w as r,x as t};