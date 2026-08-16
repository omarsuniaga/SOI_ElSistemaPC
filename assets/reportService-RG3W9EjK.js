import{i as e,s as t}from"./AppModal-Du6jXNYA.js";import{i as n}from"./supabase-Cgh_dhNB.js";import{i as r}from"./groqService-BEo2aU8D.js";var i=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}},a=`
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
`;function o(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function s(e){let t=(e.extraItems||[]).map(e=>`<span><strong>${o(e.label)}:</strong> ${o(e.value)}</span>`).join(``);return`
    <header class="rpt-header">
      <div class="rpt-header-top">
        <div class="rpt-logo-area">
          <div class="rpt-esp-circle">ESP</div>
          <div class="rpt-inst-name">
            <strong>El Sistema Punta Cana</strong>
            <span>República Dominicana · Departamento Académico</span>
          </div>
        </div>
        <div class="rpt-doc-tag">${o(e.docTag)}</div>
      </div>
      <div class="rpt-header-bar">
        <span><strong>Clase:</strong> ${o(e.clase)}</span>
        <span><strong>Docente:</strong> ${o(e.docente)}</span>
        <span><strong>Período:</strong> ${o(e.periodo)}</span>
        ${t}
      </div>
    </header>
  `}function c(e,t,n){return`
    <footer class="rpt-footer">
      <div class="rpt-footer-row">
        <span>Generado por SOI · Docente → Coord. Académica → Coord. Administrativa → Dirección Ejecutiva</span>
        <span>Pág ${e}/${t} · ${o(n)}</span>
      </div>
      <div class="rpt-sigs">
        <div class="rpt-sig-line"><div class="line"></div><span>Firma Docente</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Coordinación Académica</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Dirección Ejecutiva</span></div>
      </div>
    </footer>
  `}function l(e){return`<div class="rpt-chips">${e.map(e=>`
    <div class="rpt-chip chip-${o(e.type)}">
      <span class="chip-val">${o(String(e.value))}</span>
      <span class="chip-lbl">${o(e.label)}</span>
    </div>
  `).join(``)}</div>`}function u(e){let t={P:`P`,A:`A`,J:`J`}[e]??o(e);return`<span class="att-cell att-${o(e)}">${t}</span>`}function d(e,t,n=60){let r=e===`LOGRADO`?100:n,i={LOGRADO:`Logrado`,EN_PROGRESO:`En progreso`,INICIADO:`Iniciado`}[e]??e;return`
    <div class="prog-row prog-${o(e)}">
      <div class="prog-label">
        <span>${o(t)}</span>
        <span>${o(i)}</span>
      </div>
      <div class="prog-bar-outer">
        <div class="prog-bar-inner" style="width:${r}%"></div>
      </div>
    </div>
  `}function f(e,t,n){let r={pos:`✅`,neg:`⛔`,warn:`⚠️`,info:`📋`}[e]??``;return`
    <div class="obs-block obs-${o(e)}">
      <span class="obs-label">${r} ${o(t)}</span>
      <span>${o(n)}</span>
    </div>
  `}function p(e,t,n){return`
    <div class="comp-row">
      <span class="comp-label">${o(e)}</span>
      <div style="flex:1;display:flex;gap:4px;align-items:center">
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${o(n)}" style="width:${t.prev}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${t.prev}%</span>
        <span style="font-size:7pt;color:var(--ink3)">→</span>
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${o(n)}" style="width:${t.cur}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${t.cur}%</span>
      </div>
      <span class="comp-delta ${o(t.cls)}">${o(t.label)}</span>
    </div>
  `}function m(e){return!e||e.length===0?``:`<div class="rpt-content-chips">${e.map(e=>`<span class="content-chip">${o(e)}</span>`).join(``)}</div>`}function h(e,t=`reporte`){let n=window.open(``,`_blank`);return n?(n.document.open(),n.document.write(e),n.document.close(),n.focus(),n.onload=()=>{setTimeout(()=>n.print(),500)},setTimeout(()=>{try{n&&!n.closed&&n.print()}catch{}},1500),!0):(g(e,t),!1)}function g(e,t=`reporte`){let n=new Date().toISOString().split(`T`)[0],r=new Blob([e],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`${t}-${n}.html`,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}function _(e,t=!1){return`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe El Sistema Punta Cana</title>
  <style>
    ${t?`@page { size: letter landscape; margin: 0; }`:`@page { size: letter portrait; margin: 0; }`}
    ${a}
  </style>
</head>
<body>
  ${e}
</body>
</html>`}var v=t({buildAlumnoAttMap:()=>b,calcAttendanceStats:()=>y,generateAcademicClosureReport:()=>O,generateDailyReport:()=>T,generateMonthlyAttendance:()=>E,generateMonthlyPedagogical:()=>D});function y(e){let t=e||[];return{P:t.filter(e=>e.estado===`P`).length,A:t.filter(e=>e.estado===`A`).length,J:t.filter(e=>e.estado===`J`).length,total:t.length}}function b(e){let t={};for(let n of e)for(let e of n.asistencia||[])t[e.alumno_id]||(t[e.alumno_id]={}),t[e.alumno_id][n.id]=e.estado;return t}function x(e){return e?new Date(e+`T00:00:00`).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):``}function S(e){return[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`][e-1]??``}function C(e,t){return new Date(e,t,0).getDate()}function w(e){return String(e).padStart(2,`0`)}async function T(t){try{let{data:r,error:i}=await n.from(`sesiones_clase`).select(`id, fecha, clase_id, asistencia, contenido`).eq(`id`,t).single();if(i)throw i;let a;if(r.clase_id){let{data:e,error:t}=await n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,r.clase_id).single();if(t)throw t;a=e}else a={id:t,nombre:r.actividad||`Actividad Especial`,instrumento:r.motivo||``,maestro_id:r.maestro_id};let d=`Docente`;if(a.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,a.maestro_id).single();e&&(d=e.nombre_completo)}let p=1;if(r.clase_id){let{count:e}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,r.clase_id).lte(`fecha`,r.fecha);p=e||1}let g=[];if(r.clase_id){let{data:e,error:t}=await n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,r.clase_id).eq(`activo`,!0).order(`alumnos(nombre_completo)`);if(t)throw t;g=(e||[]).map(e=>e.alumnos).filter(Boolean)}else{let e=(r.asistencia||[]).map(e=>e.alumno_id).filter(Boolean);if(e.length>0){let{data:t}=await n.from(`alumnos`).select(`id, nombre_completo`).in(`id`,e);g=t||[]}}if(!g||g.length===0){e.error(`No hay alumnos registrados para esta actividad.`);return}let v=r.asistencia||[],b=y(v),S={};v.forEach(e=>{S[e.alumno_id]=e});let C=g.length>20,w=r.contenido||``,T=w.split(/[\n,]/).map(e=>e.replace(/^\s*[-*\d.]+\s*/,``).trim()).filter(e=>e.length>2&&e.length<60).slice(0,12),E=w.split(`
`).filter(e=>e.trim()),D=[];for(let e of E)/destacad|excelente|logr/i.test(e)?D.push({type:`pos`,label:`Destacado`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo|falt/i.test(e)?D.push({type:`neg`,label:`Alerta`,text:e.replace(/^[-*]\s*/,``)}):/novedad|nota|aviso/i.test(e)&&D.push({type:`info`,label:`Novedad`,text:e.replace(/^[-*]\s*/,``)});let O=D.slice(0,4).map(e=>f(e.type,e.label,e.text)).join(``),k=`REPORTE DIARIO · ${x(r.fecha)}`,ee=a.nombre,te=s({docTag:k,clase:ee,docente:d,periodo:`Sesión #${p} · ${x(r.fecha)}`}),A=l([{label:`Presentes`,value:b.P,type:`ok`},{label:`Ausentes`,value:b.A,type:`bad`},{label:`Justificados`,value:b.J,type:`warn`},{label:`Total`,value:g.length,type:`navy`}]),j=`
      <p class="rpt-section-title">Registro de asistencia</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación</th></tr></thead>
        <tbody>${g.map((e,t)=>{let n=S[e.id],r=n?.estado??`—`,i=[`P`,`A`,`J`].includes(r)?u(r):o(r),a=o(n?.observacion||``);return`<tr>
        <td>${t+1}</td>
        <td>${o(e.nombre_completo)}</td>
        <td style="text-align:center">${i}</td>
        <td style="font-size:6.5pt;color:#6b7085">${a}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    `,M=T.length>0?`<p class="rpt-section-title">Contenido de la sesión</p>${m(T)}`:``,N=O?`<p class="rpt-section-title">Observaciones</p><div class="rpt-obs">${O}</div>`:``,ne=c(1,1,x(r.fecha));h(_(`
      <div class="${C?`page land`:`page`}">
        ${te}
        ${A}
        ${j}
        ${M}
        ${N}
        ${ne}
      </div>
    `,C),`reporte-diario-${r.fecha?.replace(/-/g,``)||`fecha`}`)||e.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(t){console.error(`[reportService] generateDailyReport:`,t),e.error(`Error al generar el reporte: `+t.message)}}async function E(t,r,i){try{let a=w(i),d=C(r,i),f=`${r}-${a}-01`,m=`${r}-${a}-${d}`,g=i===1?12:i-1,v=i===1?r-1:r,T=w(g),E=C(v,g),D=`${v}-${T}-01`,O=`${v}-${T}-${E}`,[k,ee,te,A,j]=await Promise.all([n.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,t).gte(`fecha`,f).lte(`fecha`,m).order(`fecha`),n.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)`).eq(`clase_id`,t).gte(`fecha`,f).lte(`fecha`,m),n.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,t).gte(`fecha`,D).lte(`fecha`,O),n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,t).single(),n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,t).eq(`activo`,!0)]);for(let e of[k,A,j])if(e.error)throw e.error;let M=k.data||[],N=ee.data||[],ne=te.data||[],re=A.data,ie=(j.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo));if(M.length===0){e.error(`No hay sesiones registradas para este período.`);return}let P=`Docente`;if(re.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,re.maestro_id).single();e&&(P=e.nombre_completo)}let{count:ae}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,t).lt(`fecha`,f),F=ae||0,I=ie.length>18||M.length>16,L=0,R=0,z=0;M.forEach(e=>{let t=y(e.asistencia);L+=t.P,R+=t.A,z+=t.J});let B=L+R+z,V=0,H=0,U=0;ne.forEach(e=>{let t=y(e.asistencia);V+=t.P,H+=t.A,U+=t.J});let W=V+H+U,G=(e,t)=>t>0?Math.round(e/t*100):0,K=(e,t,n,r)=>{let i=G(e,n),a=G(t,r),o=i-a;return{cur:i,prev:a,diff:o,label:`${o>0?`+`:``}${o}%`,cls:o>=0?`delta-up`:`delta-down`}},q=K(L,V,B,W),J=K(R,H,B,W),Y=K(z,U,B,W),oe=b(M),se={docTag:`RESUMEN MENSUAL · ${S(i).toUpperCase()} ${r}`,clase:re.nombre,docente:P,periodo:`${S(i)} ${r}`,extraItems:[{label:`Sesiones`,value:M.length},{label:`Alumnos`,value:ie.length}]},ce=l([{label:`Presentes`,value:`${L} (${G(L,B)}%)`,type:`ok`},{label:`Ausentes`,value:`${R} (${G(R,B)}%)`,type:`bad`},{label:`Justificados`,value:`${z} (${G(z,B)}%)`,type:`warn`},{label:`Sesiones`,value:M.length,type:`navy`}]),le=`
      <p class="rpt-section-title">Asistencia diaria por alumno</p>
      <table class="rpt-table" style="font-size:6.5pt">
        <thead><tr>
          <th>#</th><th>Alumno</th>
          ${M.map((e,t)=>`<th style="text-align:center;font-size:6pt">S${F+t+1}</th>`).join(``)}
          <th style="text-align:center;background:var(--ok)">P</th>
          <th style="text-align:center;background:var(--bad)">A</th>
          <th style="text-align:center;background:var(--warn)">J</th>
        </tr></thead>
        <tbody>${ie.map((e,t)=>{let n=oe[e.id]||{},r=0,i=0,a=0,s=M.map(e=>{let t=n[e.id]??`—`;return t===`P`&&r++,t===`A`&&i++,t===`J`&&a++,`<td style="text-align:center">${[`P`,`A`,`J`].includes(t)?u(t):o(t)}</td>`}).join(``);return`<tr>
        <td>${t+1}</td>
        <td>${o(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</td>
        ${s}
        <td style="text-align:center;font-weight:700;color:var(--ok)">${r}</td>
        <td style="text-align:center;font-weight:700;color:var(--bad)">${i}</td>
        <td style="text-align:center;font-weight:700;color:var(--warn)">${a}</td>
      </tr>`}).join(``)}${`<tr style="background:#f0f4ff;font-weight:700">
      <td colspan="2">TOTALES</td>
      ${M.map(()=>`<td></td>`).join(``)}
      <td style="text-align:center;color:var(--ok)">${L}</td>
      <td style="text-align:center;color:var(--bad)">${R}</td>
      <td style="text-align:center;color:var(--warn)">${z}</td>
    </tr>`}</tbody>
      </table>
    `,ue=`
      <div class="${I?`page land`:`page`}">
        ${s(se)}
        ${ce}
        ${le}
        ${c(1,N.length>0||W>0?2:1,`${S(i)} ${r}`)}
      </div>
    `,X=``;if(N.length>0||W>0){let e=N.map((e,t)=>`<tr>
        <td>${t+1}</td>
        <td>${o(e.alumnos?.nombre_completo??``)}</td>
        <td>${o(x(e.fecha))}</td>
        <td>${o(e.tipo??`Justificado`)}</td>
        <td>${o(e.motivo??``)}</td>
      </tr>`).join(``),t=e?`
        <p class="rpt-section-title">Justificaciones detalladas</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
          <tbody>${e}</tbody>
        </table>
      `:``,n=W>0?`
        <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${S(g)} ${v}</p>
        <div style="max-width:260mm">
          ${p(`Presentes`,q,`bar-ok`)}
          ${p(`Ausentes`,J,`bar-bad`)}
          ${p(`Justif.`,Y,`bar-warn`)}
        </div>
      `:``;X=`
        <div class="${I?`page land`:`page`}">
          ${s(se)}
          ${t}
          ${n}
          ${c(2,2,`${S(i)} ${r}`)}
        </div>
      `}h(_(ue+X,I),`resumen-asistencia-${r}-${w(i)}`)||e.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(t){console.error(`[reportService] generateMonthlyAttendance:`,t),e.error(`Error al generar el resumen: `+t.message)}}async function D(t,i,a){try{let u=w(a),g=C(i,a),v=`${i}-${u}-01`,T=`${i}-${u}-${g}`,E=a===1?12:a-1,D=a===1?i-1:i,O=w(E),k=C(D,E),ee=`${D}-${O}-01`,te=`${D}-${O}-${k}`,[A,j,M,N,ne,re,ie]=await Promise.all([n.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,t).gte(`fecha`,v).lte(`fecha`,T).order(`fecha`),n.from(`observaciones_sesion`).select(`sesion_clase_id, contenido_ia_dsl, contenido_dsl`).in(`sesion_clase_id`,(await n.from(`sesiones_clase`).select(`id`).eq(`clase_id`,t).gte(`fecha`,v).lte(`fecha`,T)).data?.map(e=>e.id)||[]),n.from(`progresos`).select(`id, alumno_id, objetivo_id, tipo, contenido_dsl, created_at,
                 alumnos(nombre_completo),
                 curriculo_objetivos(descripcion, categoria)`).eq(`clase_id`,t).gte(`created_at`,v).lte(`created_at`,T),n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,t).single(),n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,t).eq(`activo`,!0),n.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,t).gte(`fecha`,ee).lte(`fecha`,te),n.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo`).eq(`clase_id`,t).gte(`fecha`,v).lte(`fecha`,T)]);if(A.error)throw A.error;if(N.error)throw N.error;let P=A.data||[],ae=j.data||[],F=M.data||[],I=N.data,L=(ne.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo)),R=re.data||[],z=ie.data||[];if(P.length===0){e.error(`No hay sesiones registradas para este período.`);return}let B=`Docente`;if(I.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,I.maestro_id).single();e&&(B=e.nombre_completo)}let{count:V}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,t).lt(`fecha`,v),H=V||0,U={};ae.forEach(e=>{U[e.sesion_clase_id]=e});let W=0,G=0,K=0;P.forEach(e=>{let t=y(e.asistencia);W+=t.P,G+=t.A,K+=t.J});let q=W+G+K,J=(e,t)=>t>0?Math.round(e/t*100):0,Y=0,oe=0,se=0;R.forEach(e=>{let t=y(e.asistencia);Y+=t.P,oe+=t.A,se+=t.J});let ce=Y+oe+se,le=new Set;P.forEach(e=>{let t=U[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(/[\n,]/).forEach(e=>{let t=e.replace(/^\s*[-*\d.]+\s*/,``).trim();t.length>2&&t.length<60&&le.add(t)})});let ue=[...le].slice(0,16),X=[];P.forEach(e=>{let t=U[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(`
`).forEach(e=>{/destacad|excelente/i.test(e)?X.push({type:`pos`,label:`Destacado Académico`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo/i.test(e)?X.push({type:`neg`,label:`Alerta Asistencia`,text:e.replace(/^[-*]\s*/,``)}):/novedad|administrativ/i.test(e)?X.push({type:`info`,label:`Novedad Administrativa`,text:e.replace(/^[-*]\s*/,``)}):/nota|pedagóg/i.test(e)&&X.push({type:`warn`,label:`Nota Pedagógica`,text:e.replace(/^[-*]\s*/,``)})})});let de=X.slice(0,4);for(;de.length<4;)de.push({type:`info`,label:`Nota`,text:`—`});let fe=P.map((e,t)=>{let n=y(e.asistencia),r=U[e.id],i=(r?.contenido_ia_dsl||r?.contenido_dsl||``).split(/[\n,]/)[0]?.replace(/^[-*\d.]+\s*/,``).trim()||`Sin contenido registrado`;return`
        <div class="session-card">
          <div class="sc-top">S${H+t+1} · ${o(x(e.fecha))}</div>
          <div style="font-size:6pt;color:var(--ink3);margin-bottom:2px">${o(i.slice(0,45))}</div>
          <div class="sc-att">
            <span class="att-cell att-P">P:${n.P}</span>
            <span class="att-cell att-A">A:${n.A}</span>
            <span class="att-cell att-J">J:${n.J}</span>
          </div>
        </div>
      `}).join(``),pe={docTag:`INFORME PEDAGÓGICO · ${S(a).toUpperCase()} ${i}`,clase:I.nombre,docente:B,periodo:`${S(a)} ${i}`,extraItems:[{label:`Sesiones`,value:P.length},{label:`Alumnos`,value:L.length}]},me=`
      <div class="page land">
        ${s(pe)}
        ${l([{label:`Sesiones`,value:P.length,type:`navy`},{label:`% Asistencia`,value:J(W,q)+`%`,type:`ok`},{label:`Presentes`,value:W,type:`ok`},{label:`Ausentes`,value:G,type:`bad`},{label:`Justif.`,value:K,type:`warn`},{label:`Contenidos`,value:ue.length,type:`info`}])}
        <p class="rpt-section-title">Contenidos trabajados</p>
        ${m(ue)}
        <p class="rpt-section-title">Observaciones institucionales</p>
        <div class="rpt-obs">
          ${de.map(e=>f(e.type,e.label,e.text)).join(``)}
        </div>
        <p class="rpt-section-title">Cronograma de sesiones</p>
        <div class="session-grid">${fe}</div>
        ${c(1,3,`${S(a)} ${i}`)}
      </div>
    `,he=L.length>12?`cols-4`:`cols-3`,ge=b(P),_e={};z.forEach(e=>{_e[e.alumno_id]||(_e[e.alumno_id]=[]),_e[e.alumno_id].push(e)});let Z={};F.forEach(e=>{Z[e.alumno_id]||(Z[e.alumno_id]=[]),Z[e.alumno_id].push(e)});let ve=L.map(e=>{let t=ge[e.id]||{},n=0,r=0,i=0;P.forEach(e=>{let a=t[e.id];a===`P`&&n++,a===`A`&&r++,a===`J`&&i++});let a=P.length,s=J(n,a),c,l;s>=90&&Z[e.id]?.some(e=>e.tipo===`LOGRADO`)?(c=`Destacado`,l=`badge-destacado`):s<60?(c=`En Riesgo`,l=`badge-riesgo`):s>=75?(c=`Estable`,l=`badge-estable`):(c=`En Mejora`,l=`badge-mejora`);let u=e.nombre_completo.split(` `),f=o((u[0]?.[0]??``)+(u[2]?.[0]??u[1]?.[0]??``)),p=_e[e.id]||[],m=p.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Justificaciones</div>
          ${p.slice(0,4).map(e=>`<div class="pc-just-item" style="font-size:6pt">${o(e.motivo||e.tipo)} — ${o(x(e.fecha))}</div>`).join(``)}
        </div>
      `:``,h=Z[e.id]||[],g=h.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Progreso</div>
          ${h.slice(0,3).map(e=>{let t=e.curriculo_objetivos?.descripcion||e.contenido_dsl||`Objetivo`,n=e.tipo===`LOGRADO`?100:e.tipo===`EN_PROGRESO`?60:30;return d(e.tipo,t.slice(0,28),n)}).join(``)}
        </div>
      `:`<div class="pc-section" style="color:var(--ink3);font-size:6pt">Sin registros de progreso este mes</div>`;return`
        <div class="profile-card">
          <div class="pc-head">
            <div class="pc-avatar">${f}</div>
            <div>
              <div class="pc-name">${o(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</div>
              <span class="pc-badge ${l}">${o(c)}</span>
            </div>
          </div>
          <div class="pc-section">
            <div class="pc-section-title">Asistencia</div>
            <div class="pc-row"><span>Presentes:</span><span><strong>${n}</strong> de ${a}</span></div>
            <div class="pc-row"><span>Ausentes:</span><span><strong>${r}</strong></span></div>
            <div class="pc-row"><span>Justificados:</span><span><strong>${i}</strong></span></div>
          </div>
          ${m}
          ${g}
        </div>
      `}).join(``),ye=`
      <div class="page land">
        ${s(pe)}
        <p class="rpt-section-title">Perfiles individuales</p>
        <div class="profile-grid ${he}">${ve}</div>
        ${c(2,3,`${S(a)} ${i}`)}
      </div>
    `,be={clase:I.nombre,docente:B,mes:`${S(a)} ${i}`,totalAlumnos:L.length},Q=await r(P.map((e,t)=>({...e,numero_sesion:H+t+1})),F,be),xe=(()=>{let e=J(W,q),t=J(Y,ce||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n>=0?`delta-up`:`delta-down`}})(),Se=(()=>{let e=J(G,q),t=J(oe,ce||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n<0?`delta-up`:`delta-down`}})(),Ce=R.length*2,we=ue.length,Te=`
      <div style="display:grid;grid-template-columns:60% 40%;gap:6mm">
        <div>
          <p class="rpt-section-title">Comparativa estadística</p>
          ${p(`Presentes`,xe,`bar-ok`)}
          ${p(`Ausentes`,Se,`bar-bad`)}
          <div style="margin-top:4px">
            <table class="rpt-table" style="font-size:7pt">
              <thead><tr>
                <th>Indicador</th>
                <th>${S(E)} ${D}</th>
                <th>${S(a)} ${i}</th>
                <th>Δ</th>
              </tr></thead>
              <tbody>
                <tr><td>Contenidos cubiertos</td><td>${Ce}</td><td>${we}</td>
                    <td class="${we>=Ce?`delta-up`:`delta-down`}" style="font-weight:700">
                      ${we>=Ce?`+`:``}${we-Ce}
                    </td></tr>
                <tr><td>Logros individuales</td>
                    <td>${R.length>0?`—`:`0`}</td>
                    <td>${F.filter(e=>e.tipo===`LOGRADO`).length}</td>
                    <td class="delta-up" style="font-weight:700">${F.filter(e=>e.tipo===`LOGRADO`).length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p class="rpt-section-title">Patrones detectados</p>
          ${Q.patrones.positivos.length>0?`
            <div style="margin-bottom:4px">
              <div style="font-size:6.5pt;font-weight:700;color:var(--ok);margin-bottom:2px">✅ Positivos</div>
              ${Q.patrones.positivos.map(e=>`<div style="font-size:7pt;margin-bottom:2px">• ${o(e)}</div>`).join(``)}
            </div>
          `:``}
          ${Q.patrones.atencion.length>0?`
            <div>
              <div style="font-size:6.5pt;font-weight:700;color:var(--warn);margin-bottom:2px">⚠️ Atención requerida</div>
              ${Q.patrones.atencion.map(e=>`<div style="font-size:7pt;margin-bottom:2px">• ${o(e)}</div>`).join(``)}
            </div>
          `:``}
          ${!Q.patrones.positivos.length&&!Q.patrones.atencion.length?`<div style="font-size:7pt;color:var(--ink3)">(Análisis no disponible)</div>`:``}
        </div>
      </div>
    `,$=Q.recomendaciones,Ee=`
      <p class="rpt-section-title" style="margin-top:4mm">Recomendaciones institucionales</p>
      <div class="reco-grid">
        <div class="reco-card">
          <div class="reco-title">📚 Académico</div>
          <div>${o($.academico||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">📋 Logística</div>
          <div>${o($.logistica||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">⭐ Talentos</div>
          <div>${o($.talentos||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">🎯 Refuerzo</div>
          <div>${o($.refuerzo||`(Sin datos suficientes)`)}</div>
        </div>
      </div>
    `,De=Q.notaDireccion?`
      <div class="nota-dir">
        <div class="nota-title">📝 Nota para Dirección Ejecutiva</div>
        <div>${o(Q.notaDireccion)}</div>
      </div>
    `:``,Oe=`
      <div class="page land">
        ${s(pe)}
        ${Te}
        ${Ee}
        ${De}
        ${c(3,3,`${S(a)} ${i}`)}
      </div>
    `;h(_(me+ye+Oe,!0),`informe-pedagogico-${i}-${w(a)}`)||e.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(t){console.error(`[reportService] generateMonthlyPedagogical:`,t),e.error(`Error al generar el informe pedagógico: `+t.message)}}async function O(t={}){try{let n=t.periodo||{},r=t.resumen||{},i=Array.isArray(t.clases)?t.clases:[],a=Array.isArray(t.alumnos)?t.alumnos:[],u=(r.totalPresentes||0)+(r.totalAusentes||0)+(r.totalJustificados||0),d=u>0?((r.totalPresentes||0)+(r.totalJustificados||0))/u*100:null,f=a.filter(e=>(e.tasaAsistencia==null?100:e.tasaAsistencia)<70),p=a.filter(e=>(e.tasaAsistencia==null?0:e.tasaAsistencia)>=90),m=a.flatMap(e=>Array.isArray(e.justificaciones)?e.justificaciones:[]).reduce((e,t)=>{let n=String(t||``).trim().toLowerCase();return n&&(e[n]=(e[n]||0)+1),e},{}),g=Object.entries(m).sort((e,t)=>t[1]-e[1]).slice(0,5),v=s({docTag:`CIERRE ACADÉMICO`,clase:n.nombre||`Período institucional`,docente:`Coordinación / Dirección`,periodo:`${x(n.fecha_inicio||n.fechaInicio)} a ${x(n.fecha_fin||n.fechaFin)}`.trim(),extraItems:[{label:`Estado`,value:n.cerrado?`Cerrado`:`Activo`},{label:`Período ID`,value:n.id||n.periodo_id||`N/D`}]}),y=l([{label:`Clases`,value:r.totalClases||0,type:`navy`},{label:`Contenido`,value:r.totalContenido||0,type:`info`},{label:`Presentes`,value:r.totalPresentes||0,type:`ok`},{label:`Ausentes`,value:r.totalAusentes||0,type:`bad`},{label:`Justificados`,value:r.totalJustificados||0,type:`warn`},{label:`Alumnos`,value:r.totalAlumnos||a.length||0,type:`navy`}]),b=i.length?`
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
                  <td>${o(e.claseNombre||e.nombre||`—`)}</td>
                  <td>${o(e.maestroNombre||`—`)}</td>
                  <td>${o(e.sesiones??0)}</td>
                  <td>${o(e.contenidosTrabajados??0)}</td>
                  <td>${o(e.presentes??0)}</td>
                  <td>${o(e.ausentes??0)}</td>
                  <td>${o(e.justificados??0)}</td>
                </tr>`).join(``)}
          </tbody>
        </table>
      `:`<div class="nota-dir">No hay clases consolidadas para este período.</div>`,S=a.length?`
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
            ${a.slice(0,30).map(e=>`
                <tr>
                  <td>${o(e.alumnoNombre||e.nombre_completo||`—`)}</td>
                  <td>${o(e.presentes??0)}</td>
                  <td>${o(e.ausentes??0)}</td>
                  <td>${o(e.justificados??0)}</td>
                  <td>${o(e.tasaAsistencia==null?`N/D`:`${e.tasaAsistencia.toFixed(1)}%`)}</td>
                  <td>${o(e.totalRegistrosProgreso??0)}</td>
                </tr>`).join(``)}
          </tbody>
        </table>
      `:`<div class="nota-dir">No hay alumnos consolidados para este período.</div>`;h(_(`
      <div class="page">
        ${v}
        ${y}
        ${`
      <p class="rpt-section-title">Indicadores institucionales</p>
      <div class="reco-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="reco-card"><div class="reco-title">Cumplimiento de clases</div><div>${o(r.totalClases||0)}</div></div>
        <div class="reco-card"><div class="reco-title">Asistencia global</div><div>${o(`${r.totalPresentes||0} / ${r.totalAusentes||0} / ${r.totalJustificados||0}`)}</div></div>
        <div class="reco-card"><div class="reco-title">Cobertura de alumnos</div><div>${o(r.totalAlumnos||a.length||0)}</div></div>
        <div class="reco-card"><div class="reco-title">Tasa global</div><div>${o(d==null?`N/D`:`${d.toFixed(1)}%`)}</div></div>
      </div>
    `}
        ${`
      <p class="rpt-section-title">Lectura ejecutiva</p>
      <div class="reco-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="reco-card">
          <div class="reco-title">Alumnos en riesgo</div>
          <div>${o(f.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Alumnos destacados</div>
          <div>${o(p.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Justificaciones frecuentes</div>
          <div>${o(g.length)}</div>
        </div>
      </div>
    `}
        ${g.length?`
        <p class="rpt-section-title">Razones de justificación más frecuentes</p>
        <table class="rpt-table">
          <thead><tr><th>Razón</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${g.map(([e,t])=>`<tr><td>${o(e)}</td><td>${o(t)}</td></tr>`).join(``)}
          </tbody>
        </table>
      `:``}
        
      <div class="nota-dir">
        <div class="nota-title">Cierre institucional</div>
        <div>Este informe consolida el período académico cerrado y debe archivarse como evidencia oficial de semestre/año escolar.</div>
      </div>
    
        ${c(1,2,`${x(n.fecha_inicio||n.fechaInicio)} - ${x(n.fecha_fin||n.fechaFin)}`)}
      </div>
    
      <div class="page land">
        ${v}
        ${b}
        ${S}
        ${c(2,2,`${x(n.fecha_inicio||n.fechaInicio)} - ${x(n.fecha_fin||n.fechaFin)}`)}
      </div>
    `,!0),`cierre-academico-${n.id||`periodo`}`)||e.info(`El reporte se descargó como archivo HTML. Abrilo en el navegador e imprimilo como PDF.`)}catch(t){console.error(`[reportService] generateAcademicClosureReport:`,t),e.error(`Error al generar el cierre académico: `+t.message)}}export{v as a,D as i,T as n,i as o,E as r,O as t};