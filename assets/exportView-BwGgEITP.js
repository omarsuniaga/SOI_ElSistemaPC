import{s as e}from"./alumnosApi-CeFKHcQC.js";import{d as t,l as n,u as r}from"./admin-CDIYsp56.js";var i={azul:[20,60,130],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],azulClaro:[220,232,250]},a=215.9,o=279.4,s=14;function c(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function l(e,t=`—`){return String(e??``).trim()||t}function u(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function d(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function f(e,t,n=``){return e.setFillColor(...i.azul),e.rect(0,0,a,32,`F`),e.setFillColor(...i.dorado),e.rect(0,32,a,2.5,`F`),e.setFillColor(...i.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...i.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,s+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,s+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...i.dorado),e.text(t,a-s,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,a-s,20,{align:`right`})),e.setTextColor(...i.grisOscuro),38}function p(e,t){e.setFillColor(...i.azul),e.rect(0,o-12,a,12,`F`),e.setFillColor(...i.dorado),e.rect(0,o-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...i.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,s+2,o-4.5),e.text(`Pág. ${t}`,a-s,o-4.5,{align:`right`})}function m(e,t,n,r=i.azul){return e.setFillColor(...r),e.rect(s,n,a-s*2,6.5,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...i.blanco),e.text(t,s+3,n+4.4),e.setTextColor(...i.grisOscuro),n+7.5}function h(e,t,r,a=52){return n(e,{startY:r,margin:{left:s,right:s},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:i.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:i.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:a,fillColor:i.azulClaro,textColor:i.azul}},body:t}),e.lastAutoTable.finalY+2.5}function g(e,t,n,r,i,a){return t+n>o-22?(p(e,r.n),r.n++,e.addPage(),f(e,i,`Continuación · ${a}`)):t}function _(e,t,n){let r=`FICHA TÉCNICA DEL ALUMNO`,_=l(t.nombre_completo),v=c();e.addPage(),n.n++;let y=f(e,r,`Generado: ${v}`);e.setFont(`helvetica`,`bold`),e.setFontSize(55),e.setTextColor(235,240,252),e.text(`USO INTERNO`,a/2,o/2,{align:`center`,angle:45}),e.setTextColor(...i.grisOscuro),e.setFillColor(...i.azulClaro),e.roundedRect(s,y,a-s*2,18,2,2,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(13),e.setTextColor(...i.azul),e.text(_,s+4,y+7),e.setFont(`helvetica`,`normal`),e.setFontSize(8.5),e.setTextColor(...i.grisMedio);let b=[`Edad: ${d(t.fecha_nacimiento)}`,`F. Nac.: ${u(t.fecha_nacimiento)}`,`Instrumento: ${l(t.instrumento_principal)}`,`Nivel: ${l(t.nivel_actual)}`].join(`    ·    `);e.text(b,s+4,y+14),e.setTextColor(...i.grisOscuro),y+=22,y=g(e,y,30,n,r,_),y=m(e,`DATOS PERSONALES`,y),y=h(e,[[`Nombre completo`,l(t.nombre_completo)],[`Fecha nacimiento`,u(t.fecha_nacimiento)],[`Edad`,d(t.fecha_nacimiento)],[`Género`,l(t.genero)],[`Nacionalidad`,l(t.nacionalidad)],[`Municipio`,l(t.municipio_residencia)],[`Dirección`,l(t.sector_calle_numero)],[`Tel. alumno`,l(t.tlf_alumno)],[`Cómo se enteró`,l(t.como_se_entero)]],y),y=g(e,y,30,n,r,_),y=m(e,`REPRESENTANTE`,y),y=h(e,[[`Nombre`,l(t.representante_nombre)],[`Parentesco`,l(t.representante_parentesco)],[`Cédula`,l(t.representante_cedula)],[`Teléfono`,l(t.representante_tlf)],[`Correo`,l(t.correo_representante)],[`Madre`,l(t.madre_nombre)],[`Tel. madre`,l(t.madre_tlf_whatsapp)],[`Padre`,l(t.padre_nombre)],[`Tel. padre`,l(t.padre_tlf_whatsapp)]],y),y=g(e,y,25,n,r,_),y=m(e,`DATOS MUSICALES`,y),y=h(e,[[`Instrumento`,l(t.instrumento_principal)],[`Nivel actual`,l(t.nivel_actual)],[`Interés musical`,l(t.interes_musical)],[`Instrumento de interés`,l(t.instrumento_interes)],[`Conocimientos previos`,t.tiene_conocimientos_musicales?`Sí`:`No`],[`Nivel lectura musical`,l(t.nivel_lectura_musical)]],y),y=g(e,y,20,n,r,_),y=m(e,`DATOS ACADÉMICOS`,y),y=h(e,[[`Centro de estudios`,l(t.centro_estudios)],[`Grado/Nivel`,l(t.grado_nivel)],[`Sabe leer`,t.sabe_leer?`Sí`:`No`],[`Sabe escribir`,t.sabe_escribir?`Sí`:`No`]],y),y=g(e,y,20,n,r,_),y=m(e,`SALUD`,y),y=h(e,[[`Alergias`,t.tiene_alergias?l(t.alergias_descripcion):`No`],[`Cond. transmisible`,t.tiene_condicion_transmisible?l(t.condicion_transmisible_descripcion):`No`],[`Alerg. medicamento`,t.alergia_medicamento?l(t.alergia_medicamento_descripcion):`No`],[`Conducta`,l(t.problemas_conducta)]],y),p(e,n.n)}function v(e,t=`Fichas Técnicas — Lote`){if(!e||e.length===0)throw Error(`No hay alumnos para generar el lote`);let a=new r({unit:`mm`,format:`letter`}),o={n:1},u=f(a,t,`Generado: ${c()}`);return a.setFont(`helvetica`,`bold`),a.setFontSize(11),a.setTextColor(...i.azul),a.text(`Total de alumnos: ${e.length}`,s,u+8),u+=16,n(a,{startY:u,margin:{left:s,right:s},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Nivel`,`Representante`]],headStyles:{fillColor:i.azul,textColor:i.blanco,fontStyle:`bold`,fontSize:8},styles:{fontSize:7.5,cellPadding:{top:1.5,bottom:1.5,left:2.5,right:2.5}},alternateRowStyles:{fillColor:i.grisClaro},body:e.map((e,t)=>[t+1,l(e.nombre_completo),l(e.instrumento_principal),l(e.nivel_actual),l(e.representante_nombre)])}),p(a,1),e.forEach(e=>_(a,e,o)),a}function y(e,t){let n=v(e,t),r=new Date().toISOString().slice(0,10);n.save(`fichas-lote-${r}.pdf`)}var b={azul:[20,60,130],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],azulClaro:[220,232,250]},x=14;function S(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function C(e,t=`—`){return String(e??``).trim()||t}function w(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function T(e,t,n=``){let r=e.internal.pageSize.getWidth();return e.setFillColor(...b.azul),e.rect(0,0,r,32,`F`),e.setFillColor(...b.dorado),e.rect(0,32,r,2.5,`F`),e.setFillColor(...b.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...b.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,x+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,x+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...b.dorado),e.text(t,r-x,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,r-x,20,{align:`right`})),e.setTextColor(...b.grisOscuro),42}function E(e){let t=e.internal.getNumberOfPages(),n=e.internal.pageSize.getHeight(),r=e.internal.pageSize.getWidth();for(let i=1;i<=t;i++)e.setPage(i),e.setFillColor(...b.azul),e.rect(0,n-12,r,12,`F`),e.setFillColor(...b.dorado),e.rect(0,n-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...b.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,x+2,n-4.5),e.text(`Pág. ${i} / ${t}`,r-x,n-4.5,{align:`right`})}function D(e,t=``){let i=new r({unit:`mm`,format:`letter`,orientation:`landscape`}),a=t||S(),o=T(i,`LISTA DE ALUMNOS ACTIVOS`,a);return i.setFont(`helvetica`,`normal`),i.setFontSize(8.5),i.setTextColor(...b.grisMedio),i.text(`Total: ${e.length} alumno(s)   ·   Generado: ${S()}`,x,o),o+=6,n(i,{startY:o,margin:{left:x,right:x},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Nivel`,`Representante`,`Teléfono`,`Correo`,`Inscrito`]],headStyles:{fillColor:b.azul,textColor:b.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:b.grisClaro},columnStyles:{0:{cellWidth:8},6:{cellWidth:45}},body:e.map((e,t)=>[t+1,C(e.nombre_completo),C(e.instrumento_principal),C(e.nivel_actual),C(e.representante_nombre),C(e.representante_tlf),C(e.correo_representante),w(e.created_at)]),didDrawPage:()=>T(i,`LISTA DE ALUMNOS ACTIVOS`,a)}),E(i),i}function O(e,t){let n=D(e,t),r=new Date().toISOString().slice(0,10);n.save(`lista-alumnos-${r}.pdf`)}function k(e,t,i){let a=new r({unit:`mm`,format:`letter`,orientation:`landscape`}),o=`${w(t)} — ${w(i)}`,s=T(a,`ALUMNOS INSCRITOS`,o);return a.setFont(`helvetica`,`normal`),a.setFontSize(8.5),a.setTextColor(...b.grisMedio),a.text(`Total: ${e.length} alumno(s) en el período   ·   Generado: ${S()}`,x,s),s+=6,n(a,{startY:s,margin:{left:x,right:x},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Representante`,`Teléfono`,`Correo`,`Fecha inscripción`]],headStyles:{fillColor:b.azul,textColor:b.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:b.grisClaro},columnStyles:{0:{cellWidth:8},5:{cellWidth:45}},body:e.map((e,t)=>[t+1,C(e.nombre_completo),C(e.instrumento_principal),C(e.representante_nombre),C(e.representante_tlf),C(e.correo_representante),w(e.created_at)]),didDrawPage:()=>T(a,`ALUMNOS INSCRITOS`,o)}),E(a),a}function A(e,t,n){k(e,t,n).save(`inscritos-${t}-a-${n}.pdf`)}function j(e){let t=new r({unit:`mm`,format:`letter`,orientation:`landscape`}),i=T(t,`DIRECTORIO DE MAESTROS`,S());return t.setFont(`helvetica`,`normal`),t.setFontSize(8.5),t.setTextColor(...b.grisMedio),t.text(`Total: ${e.length} maestro(s)   ·   Generado: ${S()}`,x,i),i+=6,n(t,{startY:i,margin:{left:x,right:x},theme:`grid`,head:[[`#`,`Nombre`,`Especialidad`,`Correo`,`Teléfono`,`Clases asignadas`,`Reseña`]],headStyles:{fillColor:b.azul,textColor:b.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:b.grisClaro},columnStyles:{0:{cellWidth:8},5:{cellWidth:50},6:{cellWidth:55}},body:e.map((e,t)=>{let n=Array.isArray(e.clases)&&e.clases.length?e.clases.map(e=>e.nombre??e).join(`
`):`—`;return[t+1,C(e.nombre),C(e.instrumento),C(e.email),C(e.telefono),n,C(e.bio)]}),didDrawPage:()=>T(t,`DIRECTORIO DE MAESTROS`,S())}),E(t),t}function M(e){let t=j(e),n=new Date().toISOString().slice(0,10);t.save(`maestros-${n}.pdf`)}async function N(e){e.innerHTML=`
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-10 mx-auto">

          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-file-earmark-arrow-down fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Exportar Datos</h2>
              <small class="text-muted">Genera reportes y fichas en PDF para impresión o archivo digital</small>
            </div>
          </div>

          <!-- Fichas técnicas lote -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-person-vcard me-2 text-primary"></i>
                Fichas Técnicas — Lote
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Un solo PDF con la ficha completa de cada alumno (una ficha por página).
                Ideal para imprimir todos los expedientes o generar el respaldo digital.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Filtro</label>
                  <select class="form-select" id="fichas-filtro">
                    <option value="activos">Solo activos</option>
                    <option value="todos">Todos (activos e inactivos)</option>
                  </select>
                </div>
                <div class="col-auto">
                  <button class="btn btn-primary" id="btn-fichas-lote">
                    <i class="bi bi-download me-2"></i>Descargar Fichas
                  </button>
                </div>
                <div class="col-auto">
                  <span id="fichas-status" class="text-muted small"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de alumnos activos -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-success bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-table me-2 text-success"></i>
                Lista de Alumnos Activos
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Tabla con todos los alumnos activos. Filtrado opcional por instrumento.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="lista-instrumento"
                    placeholder="Ej: Violín — vacío = todos">
                </div>
                <div class="col-auto">
                  <button class="btn btn-success" id="btn-lista-alumnos">
                    <i class="bi bi-download me-2"></i>Descargar Lista
                  </button>
                </div>
                <div class="col-auto">
                  <span id="lista-status" class="text-muted small"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Alumnos inscritos por rango -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-warning bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-calendar-range me-2 text-warning"></i>
                Alumnos Inscritos — Rango de Fechas
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Lista de alumnos cuya inscripción cae dentro del período seleccionado.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Desde</label>
                  <input type="date" class="form-control" id="rango-desde">
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Hasta</label>
                  <input type="date" class="form-control" id="rango-hasta">
                </div>
                <div class="col-auto">
                  <button class="btn btn-warning" id="btn-inscritos-rango">
                    <i class="bi bi-download me-2"></i>Descargar Reporte
                  </button>
                </div>
                <div class="col-auto">
                  <span id="rango-status" class="text-muted small"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Directorio de maestros -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-people me-2 text-info"></i>
                Directorio de Maestros
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Lista de todos los maestros con especialidad, contacto y reseña de clases.
              </p>
              <div class="d-flex align-items-center gap-3">
                <button class="btn btn-info text-white" id="btn-maestros">
                  <i class="bi bi-download me-2"></i>Descargar Directorio
                </button>
                <span id="maestros-status" class="text-muted small"></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,I(e)}function P(e,t,n=!1){let r=document.getElementById(e);r&&(r.textContent=t,r.className=n?`text-danger small`:`text-muted small`)}function F(e,t){let n=document.getElementById(e);n&&(n.disabled=t,t?(n.dataset.originalHtml=n.innerHTML,n.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`):n.innerHTML=n.dataset.originalHtml||n.innerHTML)}function I(n){n.querySelector(`#btn-fichas-lote`).addEventListener(`click`,async()=>{F(`btn-fichas-lote`,!0),P(`fichas-status`,`Cargando alumnos...`);try{let t=await e(),n=document.getElementById(`fichas-filtro`).value,r=n===`activos`?t.filter(e=>e.is_active!==!1):t;if(r.length===0){P(`fichas-status`,`No se encontraron alumnos.`,!0);return}P(`fichas-status`,`Generando ${r.length} ficha(s)...`),y(r,n===`activos`?`Fichas Técnicas — Alumnos Activos`:`Fichas Técnicas — Todos los Alumnos`),P(`fichas-status`,`✓ ${r.length} ficha(s) descargadas`)}catch(e){P(`fichas-status`,`Error: ${e.message}`,!0)}finally{F(`btn-fichas-lote`,!1)}}),n.querySelector(`#btn-lista-alumnos`).addEventListener(`click`,async()=>{F(`btn-lista-alumnos`,!0),P(`lista-status`,`Cargando...`);try{let t=await e(),n=document.getElementById(`lista-instrumento`).value.trim().toLowerCase(),r=t.filter(e=>e.is_active!==!1);if(n&&(r=r.filter(e=>L(e.instrumento_principal).toLowerCase().includes(n))),r.length===0){P(`lista-status`,`No se encontraron alumnos.`,!0);return}let i=n?`Instrumento: ${n}`:`Todos los activos`;O(r,i),P(`lista-status`,`✓ ${r.length} alumno(s)`)}catch(e){P(`lista-status`,`Error: ${e.message}`,!0)}finally{F(`btn-lista-alumnos`,!1)}}),n.querySelector(`#btn-inscritos-rango`).addEventListener(`click`,async()=>{let t=document.getElementById(`rango-desde`).value,n=document.getElementById(`rango-hasta`).value;if(!t||!n){P(`rango-status`,`Selecciona ambas fechas.`,!0);return}if(t>n){P(`rango-status`,`"Desde" debe ser anterior a "Hasta".`,!0);return}F(`btn-inscritos-rango`,!0),P(`rango-status`,`Cargando...`);try{let r=(await e()).filter(e=>{let r=(e.created_at??``).slice(0,10);return r>=t&&r<=n});if(r.length===0){P(`rango-status`,`No hay alumnos en ese rango.`,!0);return}A(r,t,n),P(`rango-status`,`✓ ${r.length} alumno(s)`)}catch(e){P(`rango-status`,`Error: ${e.message}`,!0)}finally{F(`btn-inscritos-rango`,!1)}}),n.querySelector(`#btn-maestros`).addEventListener(`click`,async()=>{F(`btn-maestros`,!0),P(`maestros-status`,`Cargando...`);try{let e=await t();if(e.length===0){P(`maestros-status`,`No se encontraron maestros.`,!0);return}M(e),P(`maestros-status`,`✓ ${e.length} maestro(s)`)}catch(e){P(`maestros-status`,`Error: ${e.message}`,!0)}finally{F(`btn-maestros`,!1)}})}function L(e,t=`—`){return String(e??``).trim()||t}export{N as renderExportView};