import{i as e}from"./supabase-KnARm58N.js";import{a as t}from"./alumnosApi-Bzqf1UxF.js";import{f as n,m as r}from"./planificacionAdapter-YQ-GJwgP.js";var i={PRESENTE:`presente`,AUSENTE:`ausente`,JUSTIFICADO:`justificado`,TARDE:`tarde`},a={P:i.PRESENTE,A:i.AUSENTE,J:i.JUSTIFICADO,T:i.TARDE,presente:i.PRESENTE,ausente:i.AUSENTE,justificado:i.JUSTIFICADO,tarde:i.TARDE};function o(e){return e?a[e]||e:i.PRESENTE}var s={presente:{short:`P`,label:`Presente`,css:`success`},ausente:{short:`A`,label:`Ausente`,css:`danger`},justificado:{short:`J`,label:`Justificado`,css:`warning`}};function c(e,t){throw console.error(e,t?.message),Error(e)}function l(e){let t=e?.message?.toLowerCase()||``;return t.includes(`unique constraint`)||t.includes(`duplicate key`)||t.includes(`uk_asistencias`)||t.includes(`unique`)&&t.includes(`duplicate`)}async function u({fechaInicio:t,fechaFin:n,periodoId:r,claseId:a,maestroId:o}={}){let s=e.from(`sesiones_clase`).select(`
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
    `).order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});if(t&&(s=s.gte(`fecha`,t)),n&&(s=s.lte(`fecha`,n)),a&&(s=s.eq(`clase_id`,a)),r){let{data:i}=await e.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,r).single();i&&(t||(s=s.gte(`fecha`,i.fecha_inicio)),n||(s=s.lte(`fecha`,i.fecha_fin)))}let{data:l,error:u}=await s;u&&c(`No se pudieron cargar las sesiones`,u);let f=(l||[]).map(e=>{let t=e.asistencias||[];return{sesionId:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,temaPrincipal:e.tema_principal,observacionesGenerales:e.observaciones_generales,estado:e.estado,claseId:e.clase_id,claseNombre:e.clases?.nombre??`—`,instrumento:e.clases?.instrumento??`—`,maestroId:e.clases?.maestro_principal_id??null,maestroNombre:e.clases?.maestros?.nombre_completo??`—`,totalPresentes:t.filter(e=>e.estado===i.PRESENTE).length,totalAusentes:t.filter(e=>e.estado===i.AUSENTE).length,totalJustificados:t.filter(e=>e.estado===i.JUSTIFICADO).length,totalRegistros:t.length}}),p=f;return o&&(p=f.filter(e=>e.maestroId&&e.maestroId.toString()===o.toString())),d(p)}function d(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return Array.from(t.entries()).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,sesiones:t}))}async function f(t){t||c(`Se requiere sesionId`);let{data:n,error:r}=await e.from(`sesiones_clase`).select(`
      id, fecha, hora_inicio, hora_fin,
      tema_principal, observaciones_generales, estado,
      clases (
        nombre, instrumento,
        maestros!fk_clases_maestro_principal ( nombre_completo )
      )
    `).eq(`id`,t).single();r&&c(`No se pudo cargar la sesión`,r);let{data:i,error:a}=await e.from(`asistencias`).select(`
      id, estado, justificacion_texto, observaciones, alumno_id,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,t).order(`alumnos(nombre_completo)`,{ascending:!0});a&&c(`No se pudieron cargar las asistencias`,a);let{data:o}=await e.from(`justificaciones`).select(`motivo, descripcion, archivo_url, estado, alumno_id`).eq(`sesion_id`,t),s={};o&&o.forEach(e=>{s[e.alumno_id]=e});let{data:l,error:u}=await e.from(`observaciones_alumnos`).select(`
      id, tipo, observacion, titulo, descripcion, prioridad,
      alumnos ( id, nombre_completo )
    `).eq(`sesion_clase_id`,t);u&&c(`No se pudieron cargar las observaciones`,u);let{data:d,error:f}=await e.from(`contenidos_sesion`).select(`
      id, descripcion, nivel_logro,
      planificaciones ( titulo, contenidos )
    `).eq(`sesion_clase_id`,t);return f&&c(`No se pudieron cargar los contenidos`,f),{sesion:{id:n.id,fecha:n.fecha,horaInicio:n.hora_inicio,horaFin:n.hora_fin,temaPrincipal:n.tema_principal,observacionesGenerales:n.observaciones_generales,estado:n.estado,claseNombre:n.clases?.nombre??`—`,instrumento:n.clases?.instrumento??`—`,maestroNombre:n.clases?.maestros?.nombre_completo??`—`},asistencias:(i||[]).map(e=>({id:e.id,estado:e.estado,justificacionTexto:e.justificacion_texto,observacion:e.observaciones,alumnoId:e.alumno_id,alumnoNombre:e.alumnos?.nombre_completo??`—`,justificacion:s[e.alumno_id]??null})),observaciones:(l||[]).map(e=>({id:e.id,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion??e.observacion,prioridad:e.prioridad,alumnoId:e.alumnos?.id,alumnoNombre:e.alumnos?.nombre_completo??`—`})),contenidos:(d||[]).map(e=>({id:e.id,descripcion:e.descripcion,nivelLogro:e.nivel_logro,planTitulo:e.planificaciones?.titulo}))}}async function p(){let{data:t,error:n}=await e.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin, activo`).order(`fecha_inicio`,{ascending:!1});return n&&c(`No se pudieron cargar los períodos`,n),t||[]}async function m(){let{data:t,error:n}=await e.from(`periodos`).select(`id, nombre, fecha_inicio, fecha_fin`).eq(`activo`,!0).single();return n?null:t}async function h(){let{data:t,error:n}=await e.from(`clases`).select(`id, nombre, instrumento`).order(`nombre`,{ascending:!0});return n&&c(`No se pudieron cargar las clases`,n),t||[]}async function g(t){t?.length||c(`No hay asistencias para registrar`);let n=[...new Set(t.map(e=>e.alumno_id))];n.some(e=>!e)&&c(`Todas las asistencias deben tener alumno_id`);let{data:r,error:i}=await e.from(`alumnos`).select(`id`).in(`id`,n);i&&c(`No se pudo validar alumnos en la base de datos`,i);let a=new Set(r?.map(e=>e.id)||[]),s=n.filter(e=>!a.has(e));s.length>0&&c(`Los siguientes alumnos no existen: ${s.join(`, `)}`);let u=t.filter(e=>e.sesion_clase_id?!0:(console.warn(`[asistenciasApi] Saltando alumno ${e.alumno_id} sin sesion_clase_id (se sincronizará vía offline queue)`),!1)).map(e=>{if(!e.clase_id)throw Error(`clase_id es requerido para alumno ${e.alumno_id}`);if(!e.fecha)throw Error(`fecha es requerido para alumno ${e.alumno_id}`);return{sesion_clase_id:e.sesion_clase_id,clase_id:e.clase_id,alumno_id:e.alumno_id,fecha:e.fecha,estado:o(e.estado),justificacion_texto:(e.justificacion_texto||``).trim()||null,observaciones:(e.observaciones||``).trim()||null,...e.registrado_por?{registrado_por:e.registrado_por}:{}}});if(u.length===0)return console.warn(`[asistenciasApi] No hay registros válidos con sesion_clase_id para insertar`),[];let{data:d,error:f}=await e.from(`asistencias`).upsert(u,{onConflict:`clase_id,alumno_id,fecha`}).select();if(f&&l(f)){console.warn(`[registrarAsistenciaBulk] Constraint detected, trying plain INSERT:`,f.message);let{data:t,error:n}=await e.from(`asistencias`).insert(u,{returning:`representation`}).select();return n&&c(`No se pudieron registrar las asistencias (UPSERT y INSERT fallidos)`,f),t||[]}return f&&c(`No se pudieron registrar las asistencias`,f),d}async function _({periodoId:t,fecha:n,claseId:r}={}){try{let i,a;if(t){let{data:n,error:r}=await e.from(`periodos`).select(`fecha_inicio, fecha_fin`).eq(`id`,t).single();r&&console.warn(`No se pudo cargar el período, mostrando todas las sesiones`,r),n&&(i=n.fecha_inicio,a=n.fecha_fin)}let o=e.from(`vw_asistencias_consolidada`).select(`
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
      `);i&&(o=o.gte(`fecha`,i)),a&&(o=o.lte(`fecha`,a)),n&&(o=o.eq(`fecha`,n)),r&&(o=o.eq(`clase_id`,r));let{data:s,error:l}=await o.order(`fecha`,{ascending:!1}).order(`hora_inicio`,{ascending:!0});l&&c(`No se pudieron cargar las sesiones consolidadas`,l),Array.isArray(s)||(console.warn(`sesiones no es un array, usando array vacío`,s),s=[]),s=s.filter(e=>e.borrador===!1);let u={};s&&s.length>0&&s.forEach(e=>{let t={clase_id:e.clase_id,clase_nombre:e.nombre_clase,fecha:e.fecha,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,maestro_nombre:e.maestro_principal||`Sin asignar`,maestro_auxiliar_nombre:e.maestro_auxiliar||null,observacion_clase:e.observacion_clase||null,observacion_sesion:e.observacion_sesion||null,presentes:e.presentes||0,ausentes:e.ausentes||0,justificados:e.justificados||0,total_alumnos:e.total_registros||0,asistencias:e.asistencias_detalle?Array.isArray(e.asistencias_detalle)?e.asistencias_detalle:JSON.parse(e.asistencias_detalle||`[]`):[],justificaciones:e.justificaciones_detalle?Array.isArray(e.justificaciones_detalle)?e.justificaciones_detalle:JSON.parse(e.justificaciones_detalle||`[]`):[]};u[e.fecha]||(u[e.fecha]=[]),u[e.fecha].push(t)});let d=Object.entries(u).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>({fecha:e,clases:t.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``))})),f={presente:0,justificado:1,ausente:2},p=new Set;for(let e of d)for(let t of e.clases){let e=new Map;for(let n of t.asistencias||[]){if(!n)continue;let t=n.alumno_id||n.alumnoId||n.alumno_nombre,r=e.get(t);(!r||(f[n.estado]??9)<(f[r.estado]??9))&&e.set(t,n)}t.asistencias=[...e.values()].sort((e,t)=>(e.alumno_nombre||``).localeCompare(t.alumno_nombre||``)),t.presentes=t.asistencias.filter(e=>e.estado===`presente`).length,t.ausentes=t.asistencias.filter(e=>e.estado===`ausente`).length,t.justificados=t.asistencias.filter(e=>e.estado===`justificado`).length,t.total_alumnos=t.asistencias.length,t.asistencias.forEach(e=>p.add(e.alumno_id||e.alumnoId))}if(p.size>0){let t=[...p].filter(Boolean),{data:n}=await e.from(`alumnos`).select(`id, instrumento_principal`).in(`id`,t),r={};(n||[]).forEach(e=>{r[e.id]=e.instrumento_principal||null});for(let e of d)for(let t of e.clases)for(let e of t.asistencias)e.instrumento=r[e.alumno_id||e.alumnoId]||null}let m=d.flatMap(e=>e.clases);return{timelineByDate:d,resumenGlobal:{totalClases:m.length,totalPresentes:m.reduce((e,t)=>e+t.presentes,0),totalAusentes:m.reduce((e,t)=>e+t.ausentes,0),totalJustificados:m.reduce((e,t)=>e+t.justificados,0),totalRegistros:m.reduce((e,t)=>e+t.total_alumnos,0),totalSesiones:s.length}}}catch(e){c(`Error en getReporteConsolidado`,e)}}var v={alumnos:/#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,calificacion:/(\d)\/(\d)/g};function y(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)r[1]&&n.push(r[1].trim());return n}function b(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function x(e){return!e||typeof e!=`string`?{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[]}:{alumnos:y(e,v.alumnos),contenido:y(e,v.contenido),sugerencias:y(e,v.sugerencias),tareas:y(e,v.tareas),medidas:y(e,v.medidas),calificacion:b(e),objetivos:y(e,v.objetivos)}}function S(e){if(!e)return``;let t=e;return t=t.replace(v.calificacion,(e,t,n)=>`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`),t=t.replace(v.objetivos,(e,t)=>`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">__OBJ_START__${t}__OBJ_END__</span>`),t=t.replace(v.alumnos,(e,t)=>`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`),t=t.replace(v.contenido,(e,t)=>`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`),t=t.replace(v.sugerencias,(e,t)=>`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`),t=t.replace(v.tareas,(e,t)=>`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`),t=t.replace(v.medidas,(e,t)=>`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`),t=ee(t),t=t.replace(/__OBJ_START__/g,`&gt;`),t=t.replace(/__OBJ_END__/g,``),t}function ee(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var C=175,w=[`Ejemplo:`,`#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica`,`#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5`,``,`Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo`].join(`
`),T=null,E=``;function D(e=``,t=null){let n=document.createElement(`div`);n.className=`dsl-editor-container`;let r=document.createElement(`div`);r.className=`dsl-editor-wrapper position-relative`;let i=document.createElement(`div`);i.className=`dsl-editor form-control`,i.contentEditable=`true`,i.spellcheck=`false`,i.setAttribute(`data-placeholder`,w),i.innerHTML=e?S(e):``;let a=document.createElement(`div`);a.className=`dsl-highlight-layer position-absolute top-0 start-0 w-100 h-100 overflow-hidden pe-none`,a.setAttribute(`aria-hidden`,`true`),r.appendChild(a),r.appendChild(i),n.appendChild(r),O();function o(){return i.innerText||i.textContent||``}function s(){let e=o();e!==E&&(E=e,a.innerHTML=S(e)+`<br>`)}function c(){a.scrollTop=i.scrollTop,a.scrollLeft=i.scrollLeft}function l(){clearTimeout(T),T=setTimeout(()=>{s();let e=x(o());t&&t(o(),e)},C)}function u(e){e.key===`Tab`&&(e.preventDefault(),document.execCommand(`insertText`,!1,`  `))}function d(){c()}i.addEventListener(`input`,l),i.addEventListener(`keydown`,u),i.addEventListener(`scroll`,d),i.addEventListener(`focus`,()=>{n.classList.add(`focused`)}),i.addEventListener(`blur`,()=>{n.classList.remove(`focused`),s()});function f(e){i.innerHTML=e?S(e):``,E=o(),a.innerHTML=S(E)+`<br>`}function p(){return o()}function m(){return x(o())}function h(){i.focus()}function g(e){i.focus(),document.execCommand(`insertText`,!1,e)}function _(e,t=``){i.focus();let n=window.getSelection();if(!n.rangeCount)return;let r=n.getRangeAt(0);r.deleteContents();let a=document.createTextNode(e),s=document.createTextNode(t);r.insertNode(a),r.collapse(!1),r.insertNode(s),r.setStartAfter(a),r.setEndAfter(a),n.removeAllRanges(),n.addRange(r),E=o()}return n.component={element:n,editor:i,setContent:f,getContent:p,getParsed:m,focus:h,insertText:g,insertAtCursor:_},n.setContent=f,n.getContent=p,n.getParsed=m,n.focus=h,n.insertText=g,n.insertAtCursor=_,e&&(E=e),n}function O(){if(document.getElementById(`dsl-editor-styles`))return;let e=document.createElement(`style`);e.id=`dsl-editor-styles`,e.textContent=`
    .dsl-editor-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dsl-editor-wrapper {
      border-radius: 0.375rem;
      background: #fff;
    }

    .dsl-editor {
      min-height: 120px;
      max-height: 400px;
      overflow-y: auto;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      outline: none;
      padding: 0.75rem;
    }

    .dsl-editor:empty::before {
      content: attr(data-placeholder);
      color: #6c757d;
      pointer-events: none;
    }

    .dsl-editor-wrapper.focused .dsl-editor {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .dsl-highlight-layer {
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      padding: 0.75rem;
      color: transparent;
      background: transparent;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .dsl-highlight-layer .dsl-token {
      padding: 0.1em 0.2em;
      border-radius: 0.2em;
      font-weight: 500;
    }

    .dsl-highlight-layer .dsl-alumno {
      background: rgba(13, 110, 253, 0.15);
      color: #0d6efd;
    }

    .dsl-highlight-layer .dsl-contenido {
      background: rgba(25, 135, 84, 0.15);
      color: #198754;
    }

    .dsl-highlight-layer .dsl-sugerencia {
      background: rgba(253, 126, 20, 0.15);
      color: #fd7e14;
    }

    .dsl-highlight-layer .dsl-tarea {
      background: rgba(147, 51, 234, 0.15);
      color: #9333ea;
    }

    .dsl-highlight-layer .dsl-medida {
      background: rgba(109, 213, 237, 0.25);
      color: #0aa3c4;
    }

    .dsl-highlight-layer .dsl-calificacion {
      background: rgba(220, 53, 69, 0.15);
      color: #dc3545;
    }

    .dsl-highlight-layer .dsl-objetivo {
      background: rgba(108, 117, 125, 0.15);
      color: #6c757d;
      font-style: italic;
    }

    .dsl-editor::-webkit-scrollbar {
      width: 8px;
    }

    .dsl-editor::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .dsl-editor::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .dsl-editor::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `,document.head.appendChild(e)}function k(e={}){let{onAlumnoClick:t=null,onGrabarClick:n=null,onEnriquecerClick:r=null,editor:i=null}=e,a=document.createElement(`div`);return a.className=`dsl-toolbar btn-group btn-group-sm me-2`,[{id:`alumno`,icon:`#`,label:`Alumno`,title:`Insertar mention de alumno`,className:`btn btn-outline-primary`,action:()=>{t?t(i):i&&i.insertAtCursor(`#`,``)}},{id:`contenido`,icon:`[]`,label:`Contenido`,title:`Insertar contenido`,className:`btn btn-outline-success`,action:()=>{i&&i.insertAtCursor(`[`,`]`)}},{id:`sugerencia`,icon:`()`,label:`Sugerencia`,title:`Insertar sugerencia`,className:`btn btn-outline-warning`,action:()=>{i&&i.insertAtCursor(`(`,`)`)}},{id:`tarea`,icon:`{}`,label:`Tarea`,title:`Insertar tarea`,className:`btn btn-outline-purple`,action:()=>{i&&i.insertAtCursor(`{`,`}`)}},{id:`medida`,icon:`$`,label:`Medida`,title:`Insertar medida técnica`,className:`btn btn-outline-info`,action:()=>{i&&i.insertAtCursor(`$`,``)}},{id:`calificacion`,icon:`4/5`,label:`Calificación`,title:`Insertar calificación`,className:`btn btn-outline-danger`,action:()=>{i&&i.insertText(`4/5`)}},{id:`objetivo`,icon:`>`,label:`Objetivo`,title:`Insertar referencia a objetivo`,className:`btn btn-outline-secondary`,action:()=>{i&&i.insertAtCursor(`>`,``)}},{id:`grabar`,icon:`🎤`,label:`Grabar`,title:`Grabar audio (placeholder)`,className:`btn btn-outline-dark`,action:()=>{n&&n(i)}},{id:`enriquecer`,icon:`✨`,label:`IA`,title:`Enriquecer con IA (placeholder)`,className:`btn btn-outline-dark`,action:()=>{r&&r(i)}}].forEach(e=>{let t=document.createElement(`button`);t.className=e.className,t.type=`button`,t.title=e.title,t.innerHTML=`<span class="dsl-toolbar-btn">${e.icon}</span>`,t.addEventListener(`click`,t=>{t.preventDefault(),e.action()}),a.appendChild(t)}),A(),a}function A(){if(document.getElementById(`dsl-toolbar-styles`))return;let e=document.createElement(`style`);e.id=`dsl-toolbar-styles`,e.textContent=`
    .dsl-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .dsl-toolbar .btn {
      font-size: 14px;
      padding: 0.25rem 0.5rem;
      min-width: 36px;
    }

    .dsl-toolbar-btn {
      font-weight: 600;
    }

    .btn-outline-purple {
      color: #9333ea;
      border-color: #9333ea;
      background-color: transparent;
    }

    .btn-outline-purple:hover {
      color: #fff;
      background-color: #9333ea;
    }

    .btn-outline-info {
      color: #6dd5ed;
      border-color: #6dd5ed;
      background-color: transparent;
    }

    .btn-outline-info:hover {
      color: #fff;
      background-color: #0aa3c4;
      border-color: #0aa3c4;
    }
  `,document.head.appendChild(e)}function j(e={}){let{initialContent:t=``,onChange:n=null,onAlumnoClick:r=null,onGrabarClick:i=null,onEnriquecerClick:a=null}=e,o=document.createElement(`div`);o.className=`dsl-editor-with-toolbar`;let s=D(t,n),c=k({onAlumnoClick:r,onGrabarClick:i,onEnriquecerClick:a,editor:s});return o.appendChild(c),o.appendChild(s),o.container=o,o}function M(e={}){let{onSelect:n=null,onClose:r=null}=e,i=new Set,a=``,o=document.createElement(`div`);o.className=`modal fade`,o.setAttribute(`tabindex`,`-1`),o.setAttribute(`role`,`dialog`),o.innerHTML=`
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Seleccionar Alumnos</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body p-0">
          <div class="p-3 border-bottom bg-light">
            <input type="text" class="form-control search-input" placeholder="Buscar por nombre...">
          </div>
          <div class="alumno-list-container" style="max-height: 300px; overflow-y: auto;">
            <div class="list-group list-group-flush alumno-list">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary cancel-btn" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary confirm-btn">Insertar seleccionados</button>
        </div>
      </div>
    </div>
  `;let s=o.querySelector(`.search-input`),c=o.querySelector(`.alumno-list`),l=o.querySelector(`.confirm-btn`),u=o.querySelector(`.cancel-btn`);async function d(){let e=await t();f(a?e.filter(e=>e.nombre_completo.toLowerCase().includes(a.toLowerCase())):e)}function f(e){if(c.innerHTML=``,e.length===0){let e=document.createElement(`div`);e.className=`text-center text-muted py-4`,e.textContent=`No se encontraron alumnos`,c.appendChild(e);return}e.forEach(e=>{let t=document.createElement(`label`);t.className=`list-group-item d-flex align-items-center gap-2 cursor-pointer`,t.style.cursor=`pointer`;let n=document.createElement(`input`);n.type=`checkbox`,n.className=`form-check-input`,n.checked=i.has(e.id),n.value=e.id;let r=document.createElement(`div`);r.className=`flex-grow-1`,r.innerHTML=`
        <div class="fw-medium">${N(e.nombre_completo)}</div>
        <small class="text-muted">${N(e.instrumento_principal)}</small>
      `,t.appendChild(n),t.appendChild(r),n.addEventListener(`change`,()=>{n.checked?i.add(e.id):i.delete(e.id)}),t.addEventListener(`click`,e=>{e.target!==n&&(n.checked=!n.checked,n.dispatchEvent(new Event(`change`)))}),c.appendChild(t)})}s.addEventListener(`input`,e=>{a=e.target.value,d()}),l.addEventListener(`click`,()=>{n&&n(Array.from(i)),m()}),u.addEventListener(`click`,()=>{r&&r(),m()});function p(){i.clear(),a=``,s.value=``;let e=new bootstrap.Modal(o);e.show(),d(),o.bsModal=e}function m(){o.bsModal&&o.bsModal.hide()}return o.openModal=p,o.closeModal=m,o}function N(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function P(t,n){let r=e.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);t&&(r=r.eq(`instrumento`,t)),n&&(r=r.eq(`nivel`,n));let{data:i,error:a}=await r.maybeSingle();if(a)throw a;return i||null}async function F(){let{data:t,error:n}=await e.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(n)throw n;return(t||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function I({instrumento:t,nivel:n,descripcion:r}){let{data:i,error:a}=await e.from(`curriculos`).insert({instrumento:t,nivel:n,descripcion:r}).select().single();if(a)throw a;return i}async function L(t,n){let{data:r,error:i}=await e.from(`curriculos`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,t).select().single();if(i)throw i;return r}async function R(e,t){return L(e,{activo:t})}async function z(t,n,r=0){let{data:i,error:a}=await e.from(`curriculo_pilares`).insert({curriculo_id:t,nombre:n,orden:r}).select().single();if(a)throw a;return i}async function B(t,n){let{data:r,error:i}=await e.from(`curriculo_pilares`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function V(t){let{error:n}=await e.from(`curriculo_pilares`).delete().eq(`id`,t);if(n)throw n}async function H(t,n,r=0){let{data:i,error:a}=await e.from(`curriculo_objetivos`).insert({pilar_id:t,descripcion:n,orden:r}).select().single();if(a)throw a;return i}async function U(t,n){let{data:r,error:i}=await e.from(`curriculo_objetivos`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function W(t){let{error:n}=await e.from(`curriculo_objetivos`).delete().eq(`id`,t);if(n)throw n}async function G({instrumento:e,nivel:t,descripcion:n,pilares:r}){if(!e||e.trim()===``)throw Error(`El instrumento es obligatorio para crear el plan.`);if(!r||r.length===0)throw Error(`La propuesta debe tener al menos un pilar.`);let i=await I({instrumento:e.trim(),nivel:t?.trim()||``,descripcion:n?.trim()||`Plan generado por IA`}),a=[];for(let e=0;e<r.length;e++){let t=r[e],n=await z(i.id,t.nombre||`Pilar ${e+1}`,e),o=t.objetivos||[];for(let e=0;e<o.length;e++){let t=await H(n.id,o[e].descripcion||`Objetivo ${e+1}`,e);a.push({id:t.id,descripcion:t.descripcion})}}return{curriculo:i,allObjetivos:a}}async function K(e,i=null,a=[],o=[],s={},c){let l=e===`edit`&&!!i,u=[];try{u=await n()}catch{}let d=l?i:{...s};!l&&s.contenido&&!d.notas_dsl&&(d.notas_dsl=s.contenido),!l&&s.maestro_nombre&&!o.find(e=>e.nombre===s.maestro_nombre)&&(o=[{id:s.maestro_id,nombre:s.maestro_nombre},...o]);let f=new r(d),p=document.getElementById(`pm-planificacion-modal`);if(p&&p.remove(),p=document.createElement(`div`),p.id=`pm-planificacion-modal`,p.className=`pm-plan-modal-overlay`,p.innerHTML=J(l,f,a,o,u),document.body.appendChild(p),!document.getElementById(`pm-plan-modal-styles`)){let e=document.createElement(`style`);e.id=`pm-plan-modal-styles`,e.textContent=Y(),document.head.appendChild(e)}let m=()=>{p.classList.remove(`open`),setTimeout(()=>p.remove(),200)};p.querySelector(`.pm-plan-close-x`).onclick=m,p.querySelector(`.pm-plan-cancel-btn`).onclick=m,p.querySelector(`.pm-plan-backdrop`).onclick=m;let h=e=>{e.key===`Escape`&&(m(),document.removeEventListener(`keydown`,h))};document.addEventListener(`keydown`,h);let g=p.querySelector(`#pl-plantilla`);g&&g.addEventListener(`change`,e=>{let t=u.find(t=>t.id===e.target.value);t&&t.id!==`blanco`&&(p.querySelector(`#pl-objetivos`).value=t.objetivos||``,p.querySelector(`#pl-contenido`).value=t.contenido||``,p.querySelector(`#pl-recursos`).value=t.recursos||``,p.querySelector(`#pl-evaluacion`).value=t.evaluacion_metodo||``,Z(p))});let _=p.querySelector(`#pl-clase_id`);_&&_.addEventListener(`change`,()=>{let e=p.querySelector(`#pl-instrumento`);if(e){let t=e.value;e.innerHTML=`<option value="">Todos los instrumentos</option>${Q(a,_.value,null)}`,e.querySelector(`option[value="${t}"]`)&&(e.value=t)}}),X(p);let v=p.querySelector(`#dsl-editor-container`);if(v){let e=M({onSelect:async e=>{let r=(await t()).filter(t=>e.includes(t.id)).map(e=>`#${e.nombre_completo}`).join(`, `);n.component&&n.component.insertText(r+` `)}});document.body.appendChild(e);let n=j({initialContent:f.notas_dsl||``,onChange:(e,t)=>{let n=p.querySelector(`#dsl-summary`);n&&(n.textContent=te(t))},onAlumnoClick:()=>e.openModal()});v.appendChild(n),p._dslEditor=n}let y=p.querySelector(`.pm-plan-save-btn`);y.onclick=async()=>{let e=p.querySelector(`#pl-tema`)?.value.trim(),t=p.querySelector(`#pl-clase_id`)?.value;if(!e){p.querySelector(`#pl-tema`).focus();return}if(!t){p.querySelector(`#pl-clase_id`).focus();return}y.disabled=!0,y.innerHTML=`<span class="pm-plan-spinner"></span> Guardando...`;try{let n=p.querySelector(`#pl-recursos`)?.value||``,r=p._dslEditor,i={clase_id:t,maestro_id:p.querySelector(`#pl-maestro_id`)?.value||null,instrumento:p.querySelector(`#pl-instrumento`)?.value||null,tema:e,fecha_inicio:p.querySelector(`#pl-fecha_inicio`)?.value||null,objetivos:p.querySelector(`#pl-objetivos`)?.value.trim(),contenido:p.querySelector(`#pl-contenido`)?.value.trim(),recursos:n.split(`,`).map(e=>e.trim()).filter(Boolean),evaluacion_metodo:p.querySelector(`#pl-evaluacion`)?.value.trim(),observaciones:p.querySelector(`#pl-observaciones`)?.value.trim(),notas_dsl:r?r.getContent():``,estado:l&&p.querySelector(`#pl-estado`)?.value||`planificado`};c&&await c(i),m()}catch(e){console.error(`[planificacionModal] Error:`,e),y.disabled=!1,y.textContent=l?`Guardar cambios`:`Guardar`}};let b=p.querySelector(`.pm-plan-body`);if(b){let e=document.createElement(`div`);e.style.cssText=`display:flex;gap:1rem;align-items:flex-start`;let t=document.createDocumentFragment();for(;b.firstChild;)t.appendChild(b.firstChild);let n=document.createElement(`div`);n.style.cssText=`flex:1;min-width:0`,n.appendChild(t),e.appendChild(n),e.insertAdjacentHTML(`beforeend`,`
      <div style="position:sticky;top:0;width:220px;flex-shrink:0" id="pl-curriculo-wrapper">
        <div class="card border-0 bg-body-secondary">
          <div class="card-header bg-transparent py-2 border-bottom">
            <span class="small fw-semibold"><i class="bi bi-journal-bookmark me-1 text-primary"></i>Guía curricular</span>
          </div>
          <div class="card-body p-2 small" id="pl-curriculo-body" style="max-height:350px;overflow-y:auto">
            <div class="text-muted text-center small py-3">Seleccioná una clase para ver la guía</div>
          </div>
        </div>
      </div>`),b.appendChild(e);let r=p.querySelector(`#pl-clase_id`);if(r&&(r.addEventListener(`change`,()=>{let e=r.value;if(!e)return;let t=a.find(t=>t.id===e);t?.instrumento&&t?.plan_estudio&&q(t.instrumento,t.plan_estudio,p)}),f.clase_id)){let e=a.find(e=>e.id===f.clase_id);e?.instrumento&&e?.plan_estudio&&q(e.instrumento,e.plan_estudio,p)}}requestAnimationFrame(()=>{p.classList.add(`open`),p.querySelector(`#pl-tema`)?.focus()})}async function q(e,t,n){let r=n.querySelector(`#pl-curriculo-body`);if(r){r.innerHTML=`<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let n=await P(e,t);if(!n){r.innerHTML=`<p class="text-muted small text-center py-2">Sin guía curricular<br>para ${e} — ${t}</p>`;return}r.innerHTML=n.curriculo_pilares.map(e=>`
      <div class="mb-2">
        <div class="fw-semibold text-uppercase text-muted mb-1" style="font-size:.7rem;letter-spacing:.05em">${e.nombre}</div>
        ${e.curriculo_objetivos.map(e=>`
          <div class="d-flex align-items-start gap-1 mb-1">
            <i class="bi bi-circle text-muted" style="font-size:.65rem;margin-top:3px;flex-shrink:0"></i>
            <span style="font-size:.78rem">${e.descripcion}</span>
          </div>`).join(``)}
      </div>`).join(``)}catch(e){r.innerHTML=`<p class="text-danger small">${e.message}</p>`}}}function J(e,t,n,r,i=[]){let a=n.length?n.map(e=>`<option value="${e.id}" ${t.clase_id===e.id?`selected`:``}>${$(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin clases disponibles</option>`,o=r.length?`<option value="">Sin asignar</option>`+r.map(e=>`<option value="${e.id}" ${t.maestro_id===e.id?`selected`:``}>${$(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin maestros disponibles</option>`,s=Array.isArray(t.recursos)?t.recursos.join(`, `):``,c=i.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``);return`
    <div class="pm-plan-backdrop"></div>
    <div class="pm-plan-modal">
      <!-- Header -->
      <div class="pm-plan-header">
        <div class="pm-plan-header-left">
          <div class="pm-plan-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 class="pm-plan-title">${e?`Editar Planificación`:`Nueva Planificación`}</h2>
            <p class="pm-plan-subtitle">Completa los datos para crear tu planificación</p>
          </div>
        </div>
        <button class="pm-plan-close-x" aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="pm-plan-body">
        ${e?``:`
        <div class="pm-plan-section">
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-plantilla">Plantilla</label>
            <select class="pm-plan-select" id="pl-plantilla">
              ${c}
            </select>
            <span class="pm-plan-hint">Selecciona una plantilla para préllenar el formulario</span>
          </div>
        </div>
        `}

        <!-- Datos básicos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Datos Básicos</h3>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-clase_id">Clase *</label>
              <select class="pm-plan-select" id="pl-clase_id" required>
                <option value="">Seleccionar clase</option>
                ${a}
              </select>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-maestro_id">Maestro</label>
              <select class="pm-plan-select" id="pl-maestro_id">
                ${o}
              </select>
            </div>
          </div>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-instrumento">Instrumento / Grupo</label>
              <select class="pm-plan-select" id="pl-instrumento">
                <option value="">Todos los instrumentos</option>
                ${Q(n,t.clase_id,t.instrumento)}
              </select>
              <span class="pm-plan-hint">Dejar vacío si aplica a todos</span>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-fecha_inicio">Fecha de Inicio</label>
              <input type="date" class="pm-plan-input" id="pl-fecha_inicio" value="${t.fecha_inicio||``}">
            </div>
          </div>
          ${e?`
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-estado">Estado</label>
            <select class="pm-plan-select" id="pl-estado">
              <option value="planificado" ${t.estado===`planificado`?`selected`:``}>Planificado</option>
              <option value="ejecutado" ${t.estado===`ejecutado`?`selected`:``}>Ejecutado</option>
              <option value="revisado" ${t.estado===`revisado`?`selected`:``}>Revisado</option>
            </select>
          </div>
          `:``}
        </div>

        <!-- Tema y objetivos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Contenido</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-tema">Tema *</label>
            <input type="text" class="pm-plan-input" id="pl-tema" maxlength="200"
              placeholder="Ej: Introducción a la escala mayor" autocomplete="off"
              value="${$(t.tema||``)}">
            <span class="pm-plan-char-count"><span id="pl-tema-count">${(t.tema||``).length}</span>/200</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-objetivos">Objetivos</label>
            <textarea class="pm-plan-textarea" id="pl-objetivos" rows="2" maxlength="1000"
              placeholder="¿Qué quieres lograr en esta clase?">${$(t.objetivos||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obj-count">${(t.objetivos||``).length}</span>/1000</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-contenido">Contenido</label>
            <textarea class="pm-plan-textarea" id="pl-contenido" rows="3" maxlength="2000"
              placeholder="Desarrollo del tema, actividades...">${$(t.contenido||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-cont-count">${(t.contenido||``).length}</span>/2000</span>
          </div>
        </div>

        <!-- Recursos y evaluación -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Recursos y Evaluación</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-recursos">Recursos</label>
            <input type="text" class="pm-plan-input" id="pl-recursos"
              placeholder="Partitura, audio, pizarra (separados por coma)" autocomplete="off"
              value="${$(s)}">
            <span class="pm-plan-hint">Separa múltiples recursos con coma</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-evaluacion">Método de Evaluación</label>
            <textarea class="pm-plan-textarea" id="pl-evaluacion" rows="2" maxlength="500"
              placeholder="¿Cómo evaluarás el aprendizaje?">${$(t.evaluacion_metodo||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-eval-count">${(t.evaluacion_metodo||``).length}</span>/500</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-observaciones">Observaciones</label>
            <textarea class="pm-plan-textarea" id="pl-observaciones" rows="2" maxlength="1000"
              placeholder="Notas adicionales...">${$(t.observaciones||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obs-count">${(t.observaciones||``).length}</span>/1000</span>
          </div>
        </div>

        <!-- DSL Notes -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Notas DSL</h3>
          <p class="pm-plan-section-desc">Usa notación simplificada: <code>#Alumno</code> <code>[Contenido]</code> <code>(Sugerencia)</code> <code>{Tarea}</code> <code>$Medida</code> <code>&gt;Objetivo</code></p>
          <div id="dsl-editor-container"></div>
          <span class="pm-plan-dsl-summary"><span id="dsl-summary">Sin tokens</span></span>
        </div>
      </div>

      <!-- Footer -->
      <div class="pm-plan-footer">
        <button class="pm-plan-cancel-btn">Cancelar</button>
        <button class="pm-plan-save-btn">${e?`Guardar cambios`:`Guardar`}</button>
      </div>
    </div>
  `}function Y(){return`
    .pm-plan-modal-overlay {
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
    
    .pm-plan-modal-overlay.open {
      display: flex;
      opacity: 1;
    }
    
    .pm-plan-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .pm-plan-modal {
      position: relative;
      background: var(--pm-surface);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                  0 0 0 1px var(--pm-border);
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    .pm-plan-modal-overlay.open .pm-plan-modal {
      transform: scale(1) translateY(0);
    }
    
    .pm-plan-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: var(--pm-surface-2);
      border-bottom: 1px solid var(--pm-border);
      flex-shrink: 0;
    }
    
    .pm-plan-header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    
    .pm-plan-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--pm-primary) 0%, #6366f1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .pm-plan-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--pm-text);
      margin: 0;
    }
    
    .pm-plan-subtitle {
      font-size: 0.8rem;
      color: var(--pm-text-muted);
      margin: 0.2rem 0 0;
    }
    
    .pm-plan-close-x {
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
    
    .pm-plan-close-x:hover {
      background: var(--pm-border);
      color: var(--pm-text);
    }
    
    .pm-plan-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    
    .pm-plan-body::-webkit-scrollbar {
      width: 6px;
    }
    
    .pm-plan-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .pm-plan-body::-webkit-scrollbar-thumb {
      background: var(--pm-border);
      border-radius: 3px;
    }
    
    .pm-plan-section {
      margin-bottom: 1.5rem;
    }
    
    .pm-plan-section:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-section-title {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
    }
    
    .pm-plan-section-desc {
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
      line-height: 1.4;
    }
    
    .pm-plan-section-desc code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.7rem;
      background: var(--pm-surface-2);
      border: 1px solid var(--pm-border);
      border-radius: 4px;
      padding: 0.1rem 0.3rem;
    }
    
    .pm-plan-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    
    .pm-plan-field {
      margin-bottom: 0.75rem;
      position: relative;
    }
    
    .pm-plan-field:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--pm-text);
      margin-bottom: 0.35rem;
    }
    
    .pm-plan-label small {
      font-weight: 400;
      color: var(--pm-text-muted);
    }
    
    .pm-plan-input,
    .pm-plan-select,
    .pm-plan-textarea {
      width: 100%;
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--pm-text);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    .pm-plan-input:focus,
    .pm-plan-select:focus,
    .pm-plan-textarea:focus {
      outline: none;
      border-color: var(--pm-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    
    .pm-plan-textarea {
      resize: vertical;
      min-height: 60px;
      line-height: 1.5;
    }
    
    .pm-plan-hint {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      margin-top: 0.25rem;
    }
    
    .pm-plan-char-count {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      text-align: right;
      margin-top: 0.2rem;
    }
    
    .pm-plan-dsl-summary {
      display: block;
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: var(--pm-surface-2);
      border-radius: 6px;
      text-align: center;
    }
    
    .pm-plan-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--pm-border);
      background: var(--pm-surface-2);
      flex-shrink: 0;
    }
    
    .pm-plan-cancel-btn {
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
    
    .pm-plan-cancel-btn:hover {
      background: var(--pm-border);
    }
    
    .pm-plan-save-btn {
      background: linear-gradient(135deg, var(--pm-primary) 0%, #2563eb 100%);
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .pm-plan-save-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .pm-plan-save-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .pm-plan-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: pm-plan-spin 0.6s linear infinite;
    }
    
    @keyframes pm-plan-spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 640px) {
      .pm-plan-modal {
        max-height: 95vh;
      }
      
      .pm-plan-header {
        padding: 1rem;
      }
      
      .pm-plan-body {
        padding: 1rem;
      }
      
      .pm-plan-grid-2 {
        grid-template-columns: 1fr;
      }
      
      .pm-plan-footer {
        padding: 0.875rem 1rem;
      }
    }
  `}function X(e){[{input:`pl-tema`,count:`pl-tema-count`},{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&r.addEventListener(`input`,()=>{i.textContent=r.value.length})})}function Z(e){[{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&(i.textContent=r.value.length)})}function Q(e,t,n){let r=e.find(e=>e.id===t);return r?.instrumento?r.instrumento.split(`,`).map(e=>e.trim()).filter(Boolean).map(e=>`<option value="${$(e)}" ${n===e?`selected`:``}>${$(e)}</option>`).join(``):``}function $(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function te(e){let t=[];return e.alumnos.length&&t.push(`${e.alumnos.length} alum.`),e.contenido.length&&t.push(`${e.contenido.length} cont.`),e.tareas.length&&t.push(`${e.tareas.length} tar.`),e.calificacion&&t.push(`${e.calificacion.valor}/${e.calificacion.sobre}`),t.length?t.join(`, `):`Sin tokens`}var ne=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||null,this.maestro_id=e.maestro_id||null,this.clase_id=e.clase_id||null,this.sesion_clase_id=e.sesion_clase_id||null,this.tipo=e.tipo||`comportamiento`,this.titulo=e.titulo||``,this.descripcion=e.descripcion||e.observacion||``,this.prioridad=e.prioridad||`media`,this.estado=e.estado||`abierta`,this.fecha_observacion=e.fecha_observacion||e.fecha||null,this.requiere_seguimiento=e.requiere_seguimiento??!1,this.seguimiento_fecha=e.seguimiento_fecha||null,this.seguimiento_observacion=e.seguimiento_observacion||``,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];return this.alumno_id||t.push(`El alumno es obligatorio`),!this.titulo||!this.titulo.trim()?t.push(`El título es obligatorio`):this.titulo.trim().length<5?t.push(`El título debe tener mínimo 5 caracteres`):this.titulo.trim().length>100&&t.push(`El título no puede exceder 100 caracteres`),!this.descripcion||!this.descripcion.trim()?t.push(`La descripción es obligatoria`):this.descripcion.trim().length<20?t.push(`La descripción debe tener mínimo 20 caracteres`):this.descripcion.trim().length>1e3&&t.push(`La descripción no puede exceder 1000 caracteres`),e.getTipos().map(e=>e.value).includes(this.tipo)||t.push(`El tipo de observación no es válido`),e.getPrioridades().map(e=>e.value).includes(this.prioridad)||t.push(`La prioridad no es válida`),e.getEstados().map(e=>e.value).includes(this.estado)||t.push(`El estado no es válido`),t}static getTipos(){return[{value:`comportamiento`,label:`Comportamiento`,icon:`bi-person-badge`},{value:`academico`,label:`Académico`,icon:`bi-mortarboard`},{value:`social`,label:`Social`,icon:`bi-people`},{value:`disciplina`,label:`Disciplina`,icon:`bi-exclamation-octagon`}]}static getPrioridades(){return[{value:`baja`,label:`Baja`,color:`text-success`},{value:`media`,label:`Media`,color:`text-warning`},{value:`alta`,label:`Alta`,color:`text-danger`}]}static getEstados(){return[{value:`abierta`,label:`Abierta`,color:`bg-secondary`},{value:`seguimiento`,label:`Seguimiento`,color:`bg-warning text-dark`},{value:`resuelta`,label:`Resuelta`,color:`bg-success`}]}toJSON(){let e={alumno_id:this.alumno_id,maestro_id:this.maestro_id,clase_id:this.clase_id,sesion_clase_id:this.sesion_clase_id,tipo:this.tipo,titulo:this.titulo.trim(),descripcion:this.descripcion.trim(),observacion:this.descripcion.trim(),prioridad:this.prioridad,estado:this.estado,fecha_observacion:this.fecha_observacion,requiere_seguimiento:this.requiere_seguimiento,seguimiento_fecha:this.seguimiento_fecha,seguimiento_observacion:this.seguimiento_observacion.trim()||null};return this.id&&(e.id=this.id),e}};export{g as C,u as S,h as _,G as a,p as b,z as c,F as d,P as f,s as g,x as h,B as i,W as l,j as m,K as n,I as o,R as p,U as r,H as s,ne as t,V as u,f as v,_ as x,m as y};