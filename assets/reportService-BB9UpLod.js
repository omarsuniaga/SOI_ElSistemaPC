import{i as e,t}from"./AppToast-DNGTRY9B.js";import{i as n}from"./supabase-Dhe7Tlxd.js";import{r}from"./groqService-CYFe0boH.js";var i={PRESENTE:`presente`,AUSENTE:`ausente`,JUSTIFICADO:`justificado`,TARDE:`tarde`},a={P:i.PRESENTE,A:i.AUSENTE,J:i.JUSTIFICADO,T:i.TARDE,presente:i.PRESENTE,ausente:i.AUSENTE,justificado:i.JUSTIFICADO,tarde:i.TARDE};function o(e){return e?a[e]||e:i.PRESENTE}var s={presente:{short:`P`,label:`Presente`,css:`success`},ausente:{short:`A`,label:`Ausente`,css:`danger`},justificado:{short:`J`,label:`Justificado`,css:`warning`}};function c(e,t){throw console.error(e,t?.message),Error(e)}function l(e){let t=e?.message?.toLowerCase()||``;return t.includes(`unique constraint`)||t.includes(`duplicate key`)||t.includes(`uk_asistencias`)||t.includes(`unique`)&&t.includes(`duplicate`)}async function u({fechaInicio:e,fechaFin:t,periodoId:r,claseId:a,maestroId:o}={}){let s=n.from(`sesiones_clase`).select(`
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
    `).order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});if(e&&(s=s.gte(`fecha`,e)),t&&(s=s.lte(`fecha`,t)),a&&(s=s.eq(`clase_id`,a)),r){let{data:i}=await n.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,r).single();i&&(e||(s=s.gte(`fecha`,i.fecha_inicio)),t||(s=s.lte(`fecha`,i.fecha_fin)))}let{data:l,error:u}=await s;u&&c(`No se pudieron cargar las sesiones`,u);let f=(l||[]).map(e=>{let t=e.asistencias||[];return{sesionId:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,temaPrincipal:e.tema_principal,observacionesGenerales:e.observaciones_generales,estado:e.estado,claseId:e.clase_id,claseNombre:e.clases?.nombre??`—`,instrumento:e.clases?.instrumento??`—`,maestroId:e.clases?.maestro_principal_id??null,maestroNombre:e.clases?.maestros?.nombre_completo??`—`,totalPresentes:t.filter(e=>e.estado===i.PRESENTE).length,totalAusentes:t.filter(e=>e.estado===i.AUSENTE).length,totalJustificados:t.filter(e=>e.estado===i.JUSTIFICADO).length,totalRegistros:t.length}}),p=f;return o&&(p=f.filter(e=>e.maestroId&&e.maestroId.toString()===o.toString())),d(p)}function d(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return Array.from(t.entries()).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,sesiones:t}))}async function f(e){e||c(`Se requiere sesionId`);let{data:t,error:r}=await n.from(`sesiones_clase`).select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `).eq(`id`,e).single();r&&c(`No se pudo cargar la sesión`,r);let{data:i,error:a}=await n.from(`asistencias`).select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e).order(`alumnos(nombre_completo)`,{ascending:!0});a&&c(`No se pudieron cargar las asistencias`,a);let{data:o}=await n.from(`justificaciones`).select(`motivo, descripcion, archivo_url, estado, alumno_id`).eq(`sesion_id`,e),s={};o&&o.forEach(e=>{s[e.alumno_id]=e});let{data:l,error:u}=await n.from(`observaciones_alumnos`).select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,e);u&&c(`No se pudieron cargar las observaciones`,u);let{data:d,error:f}=await n.from(`contenidos_sesion`).select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `).eq(`sesion_clase_id`,e);return f&&c(`No se pudieron cargar los contenidos`,f),{sesion:{id:t.id,fecha:t.fecha,horaInicio:t.hora_inicio,horaFin:t.hora_fin,temaPrincipal:t.tema_principal,observacionesGenerales:t.observaciones_generales,estado:t.estado,claseNombre:t.clases?.nombre??`—`,instrumento:t.clases?.instrumento??`—`,maestroNombre:t.clases?.maestros?.nombre_completo??`—`},asistencias:(i||[]).map(e=>({id:e.id,estado:e.estado,justificacionTexto:e.justificacion_texto,observacion:e.observaciones,alumnoId:e.alumno_id,alumnoNombre:e.alumnos?.nombre_completo??`—`,justificacion:s[e.alumno_id]??null})),observaciones:(l||[]).map(e=>({id:e.id,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion??e.observacion,prioridad:e.prioridad,alumnoId:e.alumnos?.id,alumnoNombre:e.alumnos?.nombre_completo??`—`})),contenidos:(d||[]).map(e=>({id:e.id,descripcion:e.descripcion,nivelLogro:e.nivel_logro,planTitulo:e.planificaciones?.titulo}))}}async function p(){let{data:e,error:t}=await n.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});return t&&c(`No se pudieron cargar los períodos`,t),e||[]}async function m(){let{data:e,error:t}=await n.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).single();return t?null:e}async function h(){let{data:e,error:t}=await n.from(`clases`).select(`id, nombre, instrumento`).order(`nombre`,{ascending:!0});return t&&c(`No se pudieron cargar las clases`,t),e||[]}async function g(e){e?.length||c(`No hay asistencias para registrar`);let t=[...new Set(e.map(e=>e.alumno_id))];t.some(e=>!e)&&c(`Todas las asistencias deben tener alumno_id`);let{data:r,error:i}=await n.from(`alumnos`).select(`id`).in(`id`,t);i&&c(`No se pudo validar alumnos en la base de datos`,i);let a=new Set(r?.map(e=>e.id)||[]),s=t.filter(e=>!a.has(e));s.length>0&&c(`Los siguientes alumnos no existen: ${s.join(`, `)}`);let u=e.filter(e=>e.sesion_clase_id?!0:(console.warn(`[asistenciasApi] Saltando alumno ${e.alumno_id} sin sesion_clase_id (se sincronizará vía offline queue)`),!1)).map(e=>{if(!e.clase_id)throw Error(`clase_id es requerido para alumno ${e.alumno_id}`);if(!e.fecha)throw Error(`fecha es requerido para alumno ${e.alumno_id}`);return{sesion_clase_id:e.sesion_clase_id,clase_id:e.clase_id,alumno_id:e.alumno_id,fecha:e.fecha,estado:o(e.estado),justificacion_texto:(e.justificacion_texto||``).trim()||null,observaciones:(e.observaciones||``).trim()||null,...e.registrado_por?{registrado_por:e.registrado_por}:{}}});if(u.length===0)return console.warn(`[asistenciasApi] No hay registros válidos con sesion_clase_id para insertar`),[];let{data:d,error:f}=await n.from(`asistencias`).upsert(u,{onConflict:`clase_id,alumno_id,fecha`}).select();if(f&&l(f)){console.warn(`[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:`,f.message);let{data:e,error:t}=await n.from(`asistencias`).insert(u,{returning:`representation`}).select();return t&&c(`No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)`,f),e||[]}return f&&c(`No se pudieron registrar las asistencias`,f),d}async function _({periodoId:e,fecha:t,claseId:r}={}){try{let i,a;if(e){let{data:t,error:r}=await n.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,e).single();r&&console.warn(`No se pudo cargar el período, mostrando todas las sesiones`,r),t&&(i=t.fecha_inicio,a=t.fecha_fin)}let o=n.from(`vw_asistencias_consolidada`).select(`
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
      `);i&&(o=o.gte(`fecha`,i)),a&&(o=o.lte(`fecha`,a)),t&&(o=o.eq(`fecha`,t)),r&&(o=o.eq(`clase_id`,r));let{data:s,error:l}=await o.order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});l&&c(`No se pudieron cargar las sesiones consolidadas`,l),Array.isArray(s)||(console.warn(`sesiones no es un array, usando array vacío`,s),s=[]),s=s.filter(e=>e.borrador===!1);let u={};s&&s.length>0&&s.forEach(e=>{let t={clase_id:e.clase_id,clase_nombre:e.nombre_clase,fecha:e.fecha,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,maestro_nombre:e.maestro_principal||`Sin asignar`,maestro_auxiliar_nombre:e.maestro_auxiliar||null,observacion_clase:e.observacion_clase||null,observacion_sesion:e.observacion_sesion||null,presentes:e.presentes||0,ausentes:e.ausentes||0,justificados:e.justificados||0,total_alumnos:e.total_registros||0,asistencias:e.asistencias_detalle?Array.isArray(e.asistencias_detalle)?e.asistencias_detalle:JSON.parse(e.asistencias_detalle||`[]`):[],justificaciones:e.justificaciones_detalle?Array.isArray(e.justificaciones_detalle)?e.justificaciones_detalle:JSON.parse(e.justificaciones_detalle||`[]`):[]};u[e.fecha]||(u[e.fecha]=[]),u[e.fecha].push(t)});let d=Object.entries(u).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,clases:t.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``))})),f={presente:0,justificado:1,ausente:2},p=new Set;for(let e of d)for(let t of e.clases){let e=new Map;for(let n of t.asistencias||[]){if(!n)continue;let t=n.alumno_id||n.alumnoId||n.alumno_nombre,r=e.get(t);(!r||(f[n.estado]??9)<(f[r.estado]??9))&&e.set(t,n)}t.asistencias=[...e.values()].sort((e,t)=>(e.alumno_nombre||``).localeCompare(t.alumno_nombre||``)),t.presentes=t.asistencias.filter(e=>e.estado===`presente`).length,t.ausentes=t.asistencias.filter(e=>e.estado===`ausente`).length,t.justificados=t.asistencias.filter(e=>e.estado===`justificado`).length,t.total_alumnos=t.asistencias.length,t.asistencias.forEach(e=>p.add(e.alumno_id||e.alumnoId))}if(p.size>0){let e=[...p].filter(Boolean),{data:t}=await n.from(`alumnos`).select(`id, instrumento_principal`).in(`id`,e),r={};(t||[]).forEach(e=>{r[e.id]=e.instrumento_principal||null});for(let e of d)for(let t of e.clases)for(let e of t.asistencias)e.instrumento=r[e.alumno_id||e.alumnoId]||null}let m=d.flatMap(e=>e.clases);return{timelineByDate:d,resumenGlobal:{totalClases:m.length,totalPresentes:m.reduce((e,t)=>e+t.presentes,0),totalAusentes:m.reduce((e,t)=>e+t.ausentes,0),totalJustificados:m.reduce((e,t)=>e+t.justificados,0),totalRegistros:m.reduce((e,t)=>e+t.total_alumnos,0),totalSesiones:s.length}}}catch(e){c(`Error en getReporteConsolidado`,e)}}async function v(e,t){let r=n.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);e&&(r=r.eq(`instrumento`,e)),t&&(r=r.eq(`nivel`,t));let{data:i,error:a}=await r.maybeSingle();if(a)throw a;return i||null}async function y(){let{data:e,error:t}=await n.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(t)throw t;return(e||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function b({instrumento:e,nivel:t,descripcion:r}){let{data:i,error:a}=await n.from(`curriculos`).insert({instrumento:e,nivel:t,descripcion:r}).select().single();if(a)throw a;return i}async function x(e,t){let{data:r,error:i}=await n.from(`curriculos`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function S(e,t){return x(e,{activo:t})}async function C(e,t,r=0){let{data:i,error:a}=await n.from(`curriculo_pilares`).insert({curriculo_id:e,nombre:t,orden:r}).select().single();if(a)throw a;return i}async function w(e,t){let{data:r,error:i}=await n.from(`curriculo_pilares`).update(t).eq(`id`,e).select().single();if(i)throw i;return r}async function T(e){let{error:t}=await n.from(`curriculo_pilares`).delete().eq(`id`,e);if(t)throw t}async function E(e,t,r=0){let{data:i,error:a}=await n.from(`curriculo_objetivos`).insert({pilar_id:e,descripcion:t,orden:r}).select().single();if(a)throw a;return i}async function D(e,t){let{data:r,error:i}=await n.from(`curriculo_objetivos`).update(t).eq(`id`,e).select().single();if(i)throw i;return r}async function O(e){let{error:t}=await n.from(`curriculo_objetivos`).delete().eq(`id`,e);if(t)throw t}async function k({instrumento:e,nivel:t,descripcion:n,pilares:r}){if(!e||e.trim()===``)throw Error(`El instrumento es obligatorio para crear el plan.`);if(!r||r.length===0)throw Error(`La propuesta debe tener al menos un pilar.`);let i=await b({instrumento:e.trim(),nivel:t?.trim()||``,descripcion:n?.trim()||`Plan generado por IA`}),a=[];for(let e=0;e<r.length;e++){let t=r[e],n=await C(i.id,t.nombre||`Pilar ${e+1}`,e),o=t.objetivos||[];for(let e=0;e<o.length;e++){let t=await E(n.id,o[e].descripcion||`Objetivo ${e+1}`,e);a.push({id:t.id,descripcion:t.descripcion})}}return{curriculo:i,allObjetivos:a}}var A=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}},j=`
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
`;function M(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function N(e){let t=(e.extraItems||[]).map(e=>`<span><strong>${M(e.label)}:</strong> ${M(e.value)}</span>`).join(``);return`
    <header class="rpt-header">
      <div class="rpt-header-top">
        <div class="rpt-logo-area">
          <div class="rpt-esp-circle">ESP</div>
          <div class="rpt-inst-name">
            <strong>El Sistema Punta Cana</strong>
            <span>República Dominicana · Departamento Académico</span>
          </div>
        </div>
        <div class="rpt-doc-tag">${M(e.docTag)}</div>
      </div>
      <div class="rpt-header-bar">
        <span><strong>Clase:</strong> ${M(e.clase)}</span>
        <span><strong>Docente:</strong> ${M(e.docente)}</span>
        <span><strong>Período:</strong> ${M(e.periodo)}</span>
        ${t}
      </div>
    </header>
  `}function P(e,t,n){return`
    <footer class="rpt-footer">
      <div class="rpt-footer-row">
        <span>Generado por SOI · Docente → Coord. Académica → Coord. Administrativa → Dirección Ejecutiva</span>
        <span>Pág ${e}/${t} · ${M(n)}</span>
      </div>
      <div class="rpt-sigs">
        <div class="rpt-sig-line"><div class="line"></div><span>Firma Docente</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Coordinación Académica</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Dirección Ejecutiva</span></div>
      </div>
    </footer>
  `}function ee(e){return`<div class="rpt-chips">${e.map(e=>`
    <div class="rpt-chip chip-${M(e.type)}">
      <span class="chip-val">${M(String(e.value))}</span>
      <span class="chip-lbl">${M(e.label)}</span>
    </div>
  `).join(``)}</div>`}function te(e){let t={P:`P`,A:`A`,J:`J`}[e]??M(e);return`<span class="att-cell att-${M(e)}">${t}</span>`}function F(e,t,n=60){let r=e===`LOGRADO`?100:n,i={LOGRADO:`Logrado`,EN_PROGRESO:`En progreso`,INICIADO:`Iniciado`}[e]??e;return`
    <div class="prog-row prog-${M(e)}">
      <div class="prog-label">
        <span>${M(t)}</span>
        <span>${M(i)}</span>
      </div>
      <div class="prog-bar-outer">
        <div class="prog-bar-inner" style="width:${r}%"></div>
      </div>
    </div>
  `}function I(e,t,n){let r={pos:`✅`,neg:`⛔`,warn:`⚠️`,info:`📋`}[e]??``;return`
    <div class="obs-block obs-${M(e)}">
      <span class="obs-label">${r} ${M(t)}</span>
      <span>${M(n)}</span>
    </div>
  `}function L(e,t,n){return`
    <div class="comp-row">
      <span class="comp-label">${M(e)}</span>
      <div style="flex:1;display:flex;gap:4px;align-items:center">
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${M(n)}" style="width:${t.prev}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${t.prev}%</span>
        <span style="font-size:7pt;color:var(--ink3)">→</span>
        <div class="comp-bar-wrap" style="max-width:100px">
          <div class="comp-bar ${M(n)}" style="width:${t.cur}%"></div>
        </div>
        <span style="font-size:6.5pt;color:var(--ink3);width:28px">${t.cur}%</span>
      </div>
      <span class="comp-delta ${M(t.cls)}">${M(t.label)}</span>
    </div>
  `}function R(e){return!e||e.length===0?``:`<div class="rpt-content-chips">${e.map(e=>`<span class="content-chip">${M(e)}</span>`).join(``)}</div>`}function z(e,t=`reporte`){let n=window.open(``,`_blank`);return n?(n.document.open(),n.document.write(e),n.document.close(),n.focus(),n.onload=()=>{setTimeout(()=>n.print(),500)},setTimeout(()=>{try{n&&!n.closed&&n.print()}catch{}},1500),!0):(B(e,t),!1)}function B(e,t=`reporte`){let n=new Date().toISOString().split(`T`)[0],r=new Blob([e],{type:`text/html;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=`${t}-${n}.html`,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}function ne(e,t=!1){return`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe El Sistema Punta Cana</title>
  <style>
    ${t?`@page { size: letter landscape; margin: 0; }`:`@page { size: letter portrait; margin: 0; }`}
    ${j}
  </style>
</head>
<body>
  ${e}
</body>
</html>`}var V=e({buildAlumnoAttMap:()=>re,calcAttendanceStats:()=>H,generateAcademicClosureReport:()=>Y,generateDailyReport:()=>K,generateMonthlyAttendance:()=>q,generateMonthlyPedagogical:()=>J});function H(e){let t=e||[];return{P:t.filter(e=>e.estado===`P`).length,A:t.filter(e=>e.estado===`A`).length,J:t.filter(e=>e.estado===`J`).length,total:t.length}}function re(e){let t={};for(let n of e)for(let e of n.asistencia||[])t[e.alumno_id]||(t[e.alumno_id]={}),t[e.alumno_id][n.id]=e.estado;return t}function U(e){return e?new Date(e+`T00:00:00`).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):``}function W(e){return[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`][e-1]??``}function ie(e,t){return new Date(e,t,0).getDate()}function G(e){return String(e).padStart(2,`0`)}async function K(e){try{let{data:r,error:i}=await n.from(`sesiones_clase`).select(`id, fecha, clase_id, asistencia, contenido`).eq(`id`,e).single();if(i)throw i;let a;if(r.clase_id){let{data:e,error:t}=await n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,r.clase_id).single();if(t)throw t;a=e}else a={id:e,nombre:r.actividad||`Actividad Especial`,instrumento:r.motivo||``,maestro_id:r.maestro_id};let o=`Docente`;if(a.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,a.maestro_id).single();e&&(o=e.nombre_completo)}let s=1;if(r.clase_id){let{count:e}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,r.clase_id).lte(`fecha`,r.fecha);s=e||1}let c=[];if(r.clase_id){let{data:e,error:t}=await n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,r.clase_id).eq(`activo`,!0).order(`alumnos(nombre_completo)`);if(t)throw t;c=(e||[]).map(e=>e.alumnos).filter(Boolean)}else{let e=(r.asistencia||[]).map(e=>e.alumno_id).filter(Boolean);if(e.length>0){let{data:t}=await n.from(`alumnos`).select(`id, nombre_completo`).in(`id`,e);c=t||[]}}if(!c||c.length===0){t.error(`No hay alumnos registrados para esta actividad.`);return}let l=r.asistencia||[],u=H(l),d={};l.forEach(e=>{d[e.alumno_id]=e});let f=c.length>20,p=r.contenido||``,m=p.split(/[\n,]/).map(e=>e.replace(/^\s*[-*\d.]+\s*/,``).trim()).filter(e=>e.length>2&&e.length<60).slice(0,12),h=p.split(`
`).filter(e=>e.trim()),g=[];for(let e of h)/destacad|excelente|logr/i.test(e)?g.push({type:`pos`,label:`Destacado`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo|falt/i.test(e)?g.push({type:`neg`,label:`Alerta`,text:e.replace(/^[-*]\s*/,``)}):/novedad|nota|aviso/i.test(e)&&g.push({type:`info`,label:`Novedad`,text:e.replace(/^[-*]\s*/,``)});let _=g.slice(0,4).map(e=>I(e.type,e.label,e.text)).join(``),v=`REPORTE DIARIO · ${U(r.fecha)}`,y=a.nombre,b=N({docTag:v,clase:y,docente:o,periodo:`Sesión #${s} · ${U(r.fecha)}`}),x=ee([{label:`Presentes`,value:u.P,type:`ok`},{label:`Ausentes`,value:u.A,type:`bad`},{label:`Justificados`,value:u.J,type:`warn`},{label:`Total`,value:c.length,type:`navy`}]),S=`
      <p class="rpt-section-title">Registro de asistencia</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación</th></tr></thead>
        <tbody>${c.map((e,t)=>{let n=d[e.id],r=n?.estado??`—`,i=[`P`,`A`,`J`].includes(r)?te(r):M(r),a=M(n?.observacion||``);return`<tr>
        <td>${t+1}</td>
        <td>${M(e.nombre_completo)}</td>
        <td style="text-align:center">${i}</td>
        <td style="font-size:6.5pt;color:#6b7085">${a}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    `,C=m.length>0?`<p class="rpt-section-title">Contenido de la sesión</p>${R(m)}`:``,w=_?`<p class="rpt-section-title">Observaciones</p><div class="rpt-obs">${_}</div>`:``,T=P(1,1,U(r.fecha));z(ne(`
      <div class="${f?`page land`:`page`}">
        ${b}
        ${x}
        ${S}
        ${C}
        ${w}
        ${T}
      </div>
    `,f),`reporte-diario-${r.fecha?.replace(/-/g,``)||`fecha`}`)||t.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(e){console.error(`[reportService] generateDailyReport:`,e),t.error(`Error al generar el reporte: `+e.message)}}async function q(e,r,i){try{let a=G(i),o=ie(r,i),s=`${r}-${a}-01`,c=`${r}-${a}-${o}`,l=i===1?12:i-1,u=i===1?r-1:r,d=G(l),f=ie(u,l),p=`${u}-${d}-01`,m=`${u}-${d}-${f}`,[h,g,_,v,y]=await Promise.all([n.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,e).gte(`fecha`,s).lte(`fecha`,c).order(`fecha`),n.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)`).eq(`clase_id`,e).gte(`fecha`,s).lte(`fecha`,c),n.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,e).gte(`fecha`,p).lte(`fecha`,m),n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,e).single(),n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,e).eq(`activo`,!0)]);for(let e of[h,v,y])if(e.error)throw e.error;let b=h.data||[],x=g.data||[],S=_.data||[],C=v.data,w=(y.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo));if(b.length===0){t.error(`No hay sesiones registradas para este período.`);return}let T=`Docente`;if(C.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,C.maestro_id).single();e&&(T=e.nombre_completo)}let{count:E}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,e).lt(`fecha`,s),D=E||0,O=w.length>18||b.length>16,k=0,A=0,j=0;b.forEach(e=>{let t=H(e.asistencia);k+=t.P,A+=t.A,j+=t.J});let F=k+A+j,I=0,R=0,B=0;S.forEach(e=>{let t=H(e.asistencia);I+=t.P,R+=t.A,B+=t.J});let V=I+R+B,K=(e,t)=>t>0?Math.round(e/t*100):0,q=(e,t,n,r)=>{let i=K(e,n),a=K(t,r),o=i-a;return{cur:i,prev:a,diff:o,label:`${o>0?`+`:``}${o}%`,cls:o>=0?`delta-up`:`delta-down`}},J=q(k,I,F,V),Y=q(A,R,F,V),X=q(j,B,F,V),ae=re(b),oe={docTag:`RESUMEN MENSUAL · ${W(i).toUpperCase()} ${r}`,clase:C.nombre,docente:T,periodo:`${W(i)} ${r}`,extraItems:[{label:`Sesiones`,value:b.length},{label:`Alumnos`,value:w.length}]},se=ee([{label:`Presentes`,value:`${k} (${K(k,F)}%)`,type:`ok`},{label:`Ausentes`,value:`${A} (${K(A,F)}%)`,type:`bad`},{label:`Justificados`,value:`${j} (${K(j,F)}%)`,type:`warn`},{label:`Sesiones`,value:b.length,type:`navy`}]),ce=`
      <p class="rpt-section-title">Asistencia diaria por alumno</p>
      <table class="rpt-table" style="font-size:6.5pt">
        <thead><tr>
          <th>#</th><th>Alumno</th>
          ${b.map((e,t)=>`<th style="text-align:center;font-size:6pt">S${D+t+1}</th>`).join(``)}
          <th style="text-align:center;background:var(--ok)">P</th>
          <th style="text-align:center;background:var(--bad)">A</th>
          <th style="text-align:center;background:var(--warn)">J</th>
        </tr></thead>
        <tbody>${w.map((e,t)=>{let n=ae[e.id]||{},r=0,i=0,a=0,o=b.map(e=>{let t=n[e.id]??`—`;return t===`P`&&r++,t===`A`&&i++,t===`J`&&a++,`<td style="text-align:center">${[`P`,`A`,`J`].includes(t)?te(t):M(t)}</td>`}).join(``);return`<tr>
        <td>${t+1}</td>
        <td>${M(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</td>
        ${o}
        <td style="text-align:center;font-weight:700;color:var(--ok)">${r}</td>
        <td style="text-align:center;font-weight:700;color:var(--bad)">${i}</td>
        <td style="text-align:center;font-weight:700;color:var(--warn)">${a}</td>
      </tr>`}).join(``)}${`<tr style="background:#f0f4ff;font-weight:700">
      <td colspan="2">TOTALES</td>
      ${b.map(()=>`<td></td>`).join(``)}
      <td style="text-align:center;color:var(--ok)">${k}</td>
      <td style="text-align:center;color:var(--bad)">${A}</td>
      <td style="text-align:center;color:var(--warn)">${j}</td>
    </tr>`}</tbody>
      </table>
    `,le=`
      <div class="${O?`page land`:`page`}">
        ${N(oe)}
        ${se}
        ${ce}
        ${P(1,x.length>0||V>0?2:1,`${W(i)} ${r}`)}
      </div>
    `,Z=``;if(x.length>0||V>0){let e=x.map((e,t)=>`<tr>
        <td>${t+1}</td>
        <td>${M(e.alumnos?.nombre_completo??``)}</td>
        <td>${M(U(e.fecha))}</td>
        <td>${M(e.tipo??`Justificado`)}</td>
        <td>${M(e.motivo??``)}</td>
      </tr>`).join(``),t=e?`
        <p class="rpt-section-title">Justificaciones detalladas</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
          <tbody>${e}</tbody>
        </table>
      `:``,n=V>0?`
        <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${W(l)} ${u}</p>
        <div style="max-width:260mm">
          ${L(`Presentes`,J,`bar-ok`)}
          ${L(`Ausentes`,Y,`bar-bad`)}
          ${L(`Justif.`,X,`bar-warn`)}
        </div>
      `:``;Z=`
        <div class="${O?`page land`:`page`}">
          ${N(oe)}
          ${t}
          ${n}
          ${P(2,2,`${W(i)} ${r}`)}
        </div>
      `}z(ne(le+Z,O),`resumen-asistencia-${r}-${G(i)}`)||t.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(e){console.error(`[reportService] generateMonthlyAttendance:`,e),t.error(`Error al generar el resumen: `+e.message)}}async function J(e,i,a){try{let o=G(a),s=ie(i,a),c=`${i}-${o}-01`,l=`${i}-${o}-${s}`,u=a===1?12:a-1,d=a===1?i-1:i,f=G(u),p=ie(d,u),m=`${d}-${f}-01`,h=`${d}-${f}-${p}`,[g,_,v,y,b,x,S]=await Promise.all([n.from(`sesiones_clase`).select(`id, fecha, asistencia`).eq(`clase_id`,e).gte(`fecha`,c).lte(`fecha`,l).order(`fecha`),n.from(`observaciones_sesion`).select(`sesion_clase_id, contenido_ia_dsl, contenido_dsl`).in(`sesion_clase_id`,(await n.from(`sesiones_clase`).select(`id`).eq(`clase_id`,e).gte(`fecha`,c).lte(`fecha`,l)).data?.map(e=>e.id)||[]),n.from(`progresos`).select(`id, alumno_id, objetivo_id, tipo, contenido_dsl, created_at,
                 alumnos(nombre_completo),
                 curriculo_objetivos(descripcion, categoria)`).eq(`clase_id`,e).gte(`created_at`,c).lte(`created_at`,l),n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`id`,e).single(),n.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,e).eq(`activo`,!0),n.from(`sesiones_clase`).select(`id, asistencia`).eq(`clase_id`,e).gte(`fecha`,m).lte(`fecha`,h),n.from(`justificaciones`).select(`alumno_id, fecha, tipo, motivo`).eq(`clase_id`,e).gte(`fecha`,c).lte(`fecha`,l)]);if(g.error)throw g.error;if(y.error)throw y.error;let C=g.data||[],w=_.data||[],T=v.data||[],E=y.data,D=(b.data||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>e.nombre_completo.localeCompare(t.nombre_completo)),O=x.data||[],k=S.data||[];if(C.length===0){t.error(`No hay sesiones registradas para este período.`);return}let A=`Docente`;if(E.maestro_id){let{data:e}=await n.from(`maestros`).select(`nombre_completo`).eq(`id`,E.maestro_id).single();e&&(A=e.nombre_completo)}let{count:j}=await n.from(`sesiones_clase`).select(`id`,{count:`exact`,head:!0}).eq(`clase_id`,e).lt(`fecha`,c),te=j||0,B={};w.forEach(e=>{B[e.sesion_clase_id]=e});let V=0,K=0,q=0;C.forEach(e=>{let t=H(e.asistencia);V+=t.P,K+=t.A,q+=t.J});let J=V+K+q,Y=(e,t)=>t>0?Math.round(e/t*100):0,X=0,ae=0,oe=0;O.forEach(e=>{let t=H(e.asistencia);X+=t.P,ae+=t.A,oe+=t.J});let se=X+ae+oe,ce=new Set;C.forEach(e=>{let t=B[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(/[\n,]/).forEach(e=>{let t=e.replace(/^\s*[-*\d.]+\s*/,``).trim();t.length>2&&t.length<60&&ce.add(t)})});let le=[...ce].slice(0,16),Z=[];C.forEach(e=>{let t=B[e.id];t&&(t.contenido_ia_dsl||t.contenido_dsl||``).split(`
`).forEach(e=>{/destacad|excelente/i.test(e)?Z.push({type:`pos`,label:`Destacado Académico`,text:e.replace(/^[-*]\s*/,``)}):/alerta|ausencia|riesgo/i.test(e)?Z.push({type:`neg`,label:`Alerta Asistencia`,text:e.replace(/^[-*]\s*/,``)}):/novedad|administrativ/i.test(e)?Z.push({type:`info`,label:`Novedad Administrativa`,text:e.replace(/^[-*]\s*/,``)}):/nota|pedagóg/i.test(e)&&Z.push({type:`warn`,label:`Nota Pedagógica`,text:e.replace(/^[-*]\s*/,``)})})});let ue=Z.slice(0,4);for(;ue.length<4;)ue.push({type:`info`,label:`Nota`,text:`—`});let de=C.map((e,t)=>{let n=H(e.asistencia),r=B[e.id],i=(r?.contenido_ia_dsl||r?.contenido_dsl||``).split(/[\n,]/)[0]?.replace(/^[-*\d.]+\s*/,``).trim()||`Sin contenido registrado`;return`
        <div class="session-card">
          <div class="sc-top">S${te+t+1} · ${M(U(e.fecha))}</div>
          <div style="font-size:6pt;color:var(--ink3);margin-bottom:2px">${M(i.slice(0,45))}</div>
          <div class="sc-att">
            <span class="att-cell att-P">P:${n.P}</span>
            <span class="att-cell att-A">A:${n.A}</span>
            <span class="att-cell att-J">J:${n.J}</span>
          </div>
        </div>
      `}).join(``),fe={docTag:`INFORME PEDAGÓGICO · ${W(a).toUpperCase()} ${i}`,clase:E.nombre,docente:A,periodo:`${W(a)} ${i}`,extraItems:[{label:`Sesiones`,value:C.length},{label:`Alumnos`,value:D.length}]},pe=`
      <div class="page land">
        ${N(fe)}
        ${ee([{label:`Sesiones`,value:C.length,type:`navy`},{label:`% Asistencia`,value:Y(V,J)+`%`,type:`ok`},{label:`Presentes`,value:V,type:`ok`},{label:`Ausentes`,value:K,type:`bad`},{label:`Justif.`,value:q,type:`warn`},{label:`Contenidos`,value:le.length,type:`info`}])}
        <p class="rpt-section-title">Contenidos trabajados</p>
        ${R(le)}
        <p class="rpt-section-title">Observaciones institucionales</p>
        <div class="rpt-obs">
          ${ue.map(e=>I(e.type,e.label,e.text)).join(``)}
        </div>
        <p class="rpt-section-title">Cronograma de sesiones</p>
        <div class="session-grid">${de}</div>
        ${P(1,3,`${W(a)} ${i}`)}
      </div>
    `,me=D.length>12?`cols-4`:`cols-3`,he=re(C),ge={};k.forEach(e=>{ge[e.alumno_id]||(ge[e.alumno_id]=[]),ge[e.alumno_id].push(e)});let Q={};T.forEach(e=>{Q[e.alumno_id]||(Q[e.alumno_id]=[]),Q[e.alumno_id].push(e)});let _e=D.map(e=>{let t=he[e.id]||{},n=0,r=0,i=0;C.forEach(e=>{let a=t[e.id];a===`P`&&n++,a===`A`&&r++,a===`J`&&i++});let a=C.length,o=Y(n,a),s,c;o>=90&&Q[e.id]?.some(e=>e.tipo===`LOGRADO`)?(s=`Destacado`,c=`badge-destacado`):o<60?(s=`En Riesgo`,c=`badge-riesgo`):o>=75?(s=`Estable`,c=`badge-estable`):(s=`En Mejora`,c=`badge-mejora`);let l=e.nombre_completo.split(` `),u=M((l[0]?.[0]??``)+(l[2]?.[0]??l[1]?.[0]??``)),d=ge[e.id]||[],f=d.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Justificaciones</div>
          ${d.slice(0,4).map(e=>`<div class="pc-just-item" style="font-size:6pt">${M(e.motivo||e.tipo)} — ${M(U(e.fecha))}</div>`).join(``)}
        </div>
      `:``,p=Q[e.id]||[],m=p.length>0?`
        <div class="pc-section">
          <div class="pc-section-title">Progreso</div>
          ${p.slice(0,3).map(e=>{let t=e.curriculo_objetivos?.descripcion||e.contenido_dsl||`Objetivo`,n=e.tipo===`LOGRADO`?100:e.tipo===`EN_PROGRESO`?60:30;return F(e.tipo,t.slice(0,28),n)}).join(``)}
        </div>
      `:`<div class="pc-section" style="color:var(--ink3);font-size:6pt">Sin registros de progreso este mes</div>`;return`
        <div class="profile-card">
          <div class="pc-head">
            <div class="pc-avatar">${u}</div>
            <div>
              <div class="pc-name">${M(e.nombre_completo.split(` `)[0]+` `+(e.nombre_completo.split(` `)[2]||e.nombre_completo.split(` `)[1]||``))}</div>
              <span class="pc-badge ${c}">${M(s)}</span>
            </div>
          </div>
          <div class="pc-section">
            <div class="pc-section-title">Asistencia</div>
            <div class="pc-row"><span>Presentes:</span><span><strong>${n}</strong> de ${a}</span></div>
            <div class="pc-row"><span>Ausentes:</span><span><strong>${r}</strong></span></div>
            <div class="pc-row"><span>Justificados:</span><span><strong>${i}</strong></span></div>
          </div>
          ${f}
          ${m}
        </div>
      `}).join(``),ve=`
      <div class="page land">
        ${N(fe)}
        <p class="rpt-section-title">Perfiles individuales</p>
        <div class="profile-grid ${me}">${_e}</div>
        ${P(2,3,`${W(a)} ${i}`)}
      </div>
    `,ye={clase:E.nombre,docente:A,mes:`${W(a)} ${i}`,totalAlumnos:D.length},$=await r(C.map((e,t)=>({...e,numero_sesion:te+t+1})),T,ye),be=(()=>{let e=Y(V,J),t=Y(X,se||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n>=0?`delta-up`:`delta-down`}})(),xe=(()=>{let e=Y(K,J),t=Y(ae,se||1),n=e-t;return{cur:e,prev:t,diff:n,label:`${n>0?`+`:``}${n}%`,cls:n<0?`delta-up`:`delta-down`}})(),Se=O.length*2,Ce=le.length,we=`
      <div style="display:grid;grid-template-columns:60% 40%;gap:6mm">
        <div>
          <p class="rpt-section-title">Comparativa estadística</p>
          ${L(`Presentes`,be,`bar-ok`)}
          ${L(`Ausentes`,xe,`bar-bad`)}
          <div style="margin-top:4px">
            <table class="rpt-table" style="font-size:7pt">
              <thead><tr>
                <th>Indicador</th>
                <th>${W(u)} ${d}</th>
                <th>${W(a)} ${i}</th>
                <th>Δ</th>
              </tr></thead>
              <tbody>
                <tr><td>Contenidos cubiertos</td><td>${Se}</td><td>${Ce}</td>
                    <td class="${Ce>=Se?`delta-up`:`delta-down`}" style="font-weight:700">
                      ${Ce>=Se?`+`:``}${Ce-Se}
                    </td></tr>
                <tr><td>Logros individuales</td>
                    <td>${O.length>0?`—`:`0`}</td>
                    <td>${T.filter(e=>e.tipo===`LOGRADO`).length}</td>
                    <td class="delta-up" style="font-weight:700">${T.filter(e=>e.tipo===`LOGRADO`).length}</td>
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
              ${$.patrones.positivos.map(e=>`<div style="font-size:7pt;margin-bottom:2px">• ${M(e)}</div>`).join(``)}
            </div>
          `:``}
          ${$.patrones.atencion.length>0?`
            <div>
              <div style="font-size:6.5pt;font-weight:700;color:var(--warn);margin-bottom:2px">⚠️ Atención requerida</div>
              ${$.patrones.atencion.map(e=>`<div style="font-size:7pt;margin-bottom:2px">• ${M(e)}</div>`).join(``)}
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
          <div>${M(Te.academico||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">📋 Logística</div>
          <div>${M(Te.logistica||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">⭐ Talentos</div>
          <div>${M(Te.talentos||`(Sin datos suficientes)`)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">🎯 Refuerzo</div>
          <div>${M(Te.refuerzo||`(Sin datos suficientes)`)}</div>
        </div>
      </div>
    `,De=$.notaDireccion?`
      <div class="nota-dir">
        <div class="nota-title">📝 Nota para Dirección Ejecutiva</div>
        <div>${M($.notaDireccion)}</div>
      </div>
    `:``,Oe=`
      <div class="page land">
        ${N(fe)}
        ${we}
        ${Ee}
        ${De}
        ${P(3,3,`${W(a)} ${i}`)}
      </div>
    `;z(ne(pe+ve+Oe,!0),`informe-pedagogico-${i}-${G(a)}`)||t.info(`El reporte se descargó como archivo. Abrilo en el navegador y usá Imprimir → Guardar como PDF.`)}catch(e){console.error(`[reportService] generateMonthlyPedagogical:`,e),t.error(`Error al generar el informe pedagógico: `+e.message)}}async function Y(e={}){try{let n=e.periodo||{},r=e.resumen||{},i=Array.isArray(e.clases)?e.clases:[],a=Array.isArray(e.alumnos)?e.alumnos:[],o=(r.totalPresentes||0)+(r.totalAusentes||0)+(r.totalJustificados||0),s=o>0?((r.totalPresentes||0)+(r.totalJustificados||0))/o*100:null,c=a.filter(e=>(e.tasaAsistencia==null?100:e.tasaAsistencia)<70),l=a.filter(e=>(e.tasaAsistencia==null?0:e.tasaAsistencia)>=90),u=a.flatMap(e=>Array.isArray(e.justificaciones)?e.justificaciones:[]).reduce((e,t)=>{let n=String(t||``).trim().toLowerCase();return n&&(e[n]=(e[n]||0)+1),e},{}),d=Object.entries(u).sort((e,t)=>t[1]-e[1]).slice(0,5),f=N({docTag:`CIERRE ACADÉMICO`,clase:n.nombre||`Período institucional`,docente:`Coordinación / Dirección`,periodo:`${U(n.fecha_inicio||n.fechaInicio)} a ${U(n.fecha_fin||n.fechaFin)}`.trim(),extraItems:[{label:`Estado`,value:n.cerrado?`Cerrado`:`Activo`},{label:`Período ID`,value:n.id||n.periodo_id||`N/D`}]}),p=ee([{label:`Clases`,value:r.totalClases||0,type:`navy`},{label:`Contenido`,value:r.totalContenido||0,type:`info`},{label:`Presentes`,value:r.totalPresentes||0,type:`ok`},{label:`Ausentes`,value:r.totalAusentes||0,type:`bad`},{label:`Justificados`,value:r.totalJustificados||0,type:`warn`},{label:`Alumnos`,value:r.totalAlumnos||a.length||0,type:`navy`}]),m=i.length?`
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
                  <td>${M(e.claseNombre||e.nombre||`—`)}</td>
                  <td>${M(e.maestroNombre||`—`)}</td>
                  <td>${M(e.sesiones??0)}</td>
                  <td>${M(e.contenidosTrabajados??0)}</td>
                  <td>${M(e.presentes??0)}</td>
                  <td>${M(e.ausentes??0)}</td>
                  <td>${M(e.justificados??0)}</td>
                </tr>`).join(``)}
          </tbody>
        </table>
      `:`<div class="nota-dir">No hay clases consolidadas para este período.</div>`,h=a.length?`
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
                  <td>${M(e.alumnoNombre||e.nombre_completo||`—`)}</td>
                  <td>${M(e.presentes??0)}</td>
                  <td>${M(e.ausentes??0)}</td>
                  <td>${M(e.justificados??0)}</td>
                  <td>${M(e.tasaAsistencia==null?`N/D`:`${e.tasaAsistencia.toFixed(1)}%`)}</td>
                  <td>${M(e.totalRegistrosProgreso??0)}</td>
                </tr>`).join(``)}
          </tbody>
        </table>
      `:`<div class="nota-dir">No hay alumnos consolidados para este período.</div>`;z(ne(`
      <div class="page">
        ${f}
        ${p}
        ${`
      <p class="rpt-section-title">Indicadores institucionales</p>
      <div class="reco-grid" style="grid-template-columns:repeat(4,1fr)">
        <div class="reco-card"><div class="reco-title">Cumplimiento de clases</div><div>${M(r.totalClases||0)}</div></div>
        <div class="reco-card"><div class="reco-title">Asistencia global</div><div>${M(`${r.totalPresentes||0} / ${r.totalAusentes||0} / ${r.totalJustificados||0}`)}</div></div>
        <div class="reco-card"><div class="reco-title">Cobertura de alumnos</div><div>${M(r.totalAlumnos||a.length||0)}</div></div>
        <div class="reco-card"><div class="reco-title">Tasa global</div><div>${M(s==null?`N/D`:`${s.toFixed(1)}%`)}</div></div>
      </div>
    `}
        ${`
      <p class="rpt-section-title">Lectura ejecutiva</p>
      <div class="reco-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="reco-card">
          <div class="reco-title">Alumnos en riesgo</div>
          <div>${M(c.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Alumnos destacados</div>
          <div>${M(l.length)}</div>
        </div>
        <div class="reco-card">
          <div class="reco-title">Justificaciones frecuentes</div>
          <div>${M(d.length)}</div>
        </div>
      </div>
    `}
        ${d.length?`
        <p class="rpt-section-title">Razones de justificación más frecuentes</p>
        <table class="rpt-table">
          <thead><tr><th>Razón</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${d.map(([e,t])=>`<tr><td>${M(e)}</td><td>${M(t)}</td></tr>`).join(``)}
          </tbody>
        </table>
      `:``}
        
      <div class="nota-dir">
        <div class="nota-title">Cierre institucional</div>
        <div>Este informe consolida el período académico cerrado y debe archivarse como evidencia oficial de semestre/año escolar.</div>
      </div>
    
        ${P(1,2,`${U(n.fecha_inicio||n.fechaInicio)} - ${U(n.fecha_fin||n.fechaFin)}`)}
      </div>
    
      <div class="page land">
        ${f}
        ${m}
        ${h}
        ${P(2,2,`${U(n.fecha_inicio||n.fechaInicio)} - ${U(n.fecha_fin||n.fechaFin)}`)}
      </div>
    `,!0),`cierre-academico-${n.id||`periodo`}`)||t.info(`El reporte se descargó como archivo HTML. Abrilo en el navegador e imprimilo como PDF.`)}catch(e){console.error(`[reportService] generateAcademicClosureReport:`,e),t.error(`Error al generar el cierre académico: `+e.message)}}export{_ as C,p as S,g as T,S as _,V as a,f as b,w as c,E as d,C as f,v as g,y as h,J as i,k as l,T as m,K as n,A as o,O as p,q as r,D as s,Y as t,b as u,s as v,u as w,m as x,h as y};