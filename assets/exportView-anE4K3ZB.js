import{i as e}from"./supabase-KnARm58N.js";import{d as t,h as n,l as r,n as i,r as a,t as o}from"./DocumentPreviewModal-DcNWVqJ-.js";import{t as s}from"./jspdf.es.min-GjK8N93W.js";import{t as c}from"./jspdf.plugin.autotable-BLAnV92G.js";import{s as l}from"./alumnosApi-Bzqf1UxF.js";import{o as u,s as d}from"./documentBatchService-8kKpeQyq.js";var f={azul:[20,60,130],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],azulClaro:[220,232,250]},p=215.9,m=279.4,h=14;function g(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function _(e,t=`—`){return String(e??``).trim()||t}function v(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function y(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function b(e,t,n=``){return e.setFillColor(...f.azul),e.rect(0,0,p,32,`F`),e.setFillColor(...f.dorado),e.rect(0,32,p,2.5,`F`),e.setFillColor(...f.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...f.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,h+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,h+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...f.dorado),e.text(t,p-h,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,p-h,20,{align:`right`})),e.setTextColor(...f.grisOscuro),38}function x(e,t){e.setFillColor(...f.azul),e.rect(0,m-12,p,12,`F`),e.setFillColor(...f.dorado),e.rect(0,m-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...f.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,h+2,m-4.5),e.text(`Pág. ${t}`,p-h,m-4.5,{align:`right`})}function S(e,t,n,r=f.azul){return e.setFillColor(...r),e.rect(h,n,p-h*2,6.5,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...f.blanco),e.text(t,h+3,n+4.4),e.setTextColor(...f.grisOscuro),n+7.5}function C(e,t,n,r=52){return c(e,{startY:n,margin:{left:h,right:h},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:f.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:f.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r,fillColor:f.azulClaro,textColor:f.azul}},body:t}),e.lastAutoTable.finalY+2.5}function w(e,t,n,r,i,a){return t+n>m-22?(x(e,r.n),r.n++,e.addPage(),b(e,i,`Continuación · ${a}`)):t}function ee(e,t,n){let r=`FICHA TÉCNICA DEL ALUMNO`,i=_(t.nombre_completo),a=g();e.addPage(),n.n++;let o=b(e,r,`Generado: ${a}`);e.setFont(`helvetica`,`bold`),e.setFontSize(55),e.setTextColor(235,240,252),e.text(`USO INTERNO`,p/2,m/2,{align:`center`,angle:45}),e.setTextColor(...f.grisOscuro),e.setFillColor(...f.azulClaro),e.roundedRect(h,o,p-h*2,18,2,2,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(13),e.setTextColor(...f.azul),e.text(i,h+4,o+7),e.setFont(`helvetica`,`normal`),e.setFontSize(8.5),e.setTextColor(...f.grisMedio);let s=[`Edad: ${y(t.fecha_nacimiento)}`,`F. Nac.: ${v(t.fecha_nacimiento)}`,`Instrumento: ${_(t.instrumento_principal)}`,`Nivel: ${_(t.nivel_actual)}`].join(`    ·    `);e.text(s,h+4,o+14),e.setTextColor(...f.grisOscuro),o+=22,o=w(e,o,30,n,r,i),o=S(e,`DATOS PERSONALES`,o),o=C(e,[[`Nombre completo`,_(t.nombre_completo)],[`Fecha nacimiento`,v(t.fecha_nacimiento)],[`Edad`,y(t.fecha_nacimiento)],[`Género`,_(t.genero)],[`Nacionalidad`,_(t.nacionalidad)],[`Municipio`,_(t.municipio_residencia)],[`Dirección`,_(t.sector_calle_numero)],[`Tel. alumno`,_(t.tlf_alumno)],[`Cómo se enteró`,_(t.como_se_entero)]],o),o=w(e,o,30,n,r,i),o=S(e,`REPRESENTANTE`,o),o=C(e,[[`Nombre`,_(t.representante_nombre)],[`Parentesco`,_(t.representante_parentesco)],[`Cédula`,_(t.representante_cedula)],[`Teléfono`,_(t.representante_tlf)],[`Correo`,_(t.correo_representante)],[`Madre`,_(t.madre_nombre)],[`Tel. madre`,_(t.madre_tlf_whatsapp)],[`Padre`,_(t.padre_nombre)],[`Tel. padre`,_(t.padre_tlf_whatsapp)]],o),o=w(e,o,25,n,r,i),o=S(e,`DATOS MUSICALES`,o),o=C(e,[[`Instrumento`,_(t.instrumento_principal)],[`Nivel actual`,_(t.nivel_actual)],[`Interés musical`,_(t.interes_musical)],[`Instrumento de interés`,_(t.instrumento_interes)],[`Conocimientos previos`,t.tiene_conocimientos_musicales?`Sí`:`No`],[`Nivel lectura musical`,_(t.nivel_lectura_musical)]],o),o=w(e,o,20,n,r,i),o=S(e,`DATOS ACADÉMICOS`,o),o=C(e,[[`Centro de estudios`,_(t.centro_estudios)],[`Grado/Nivel`,_(t.grado_nivel)],[`Sabe leer`,t.sabe_leer?`Sí`:`No`],[`Sabe escribir`,t.sabe_escribir?`Sí`:`No`]],o),o=w(e,o,20,n,r,i),o=S(e,`SALUD`,o),o=C(e,[[`Alergias`,t.tiene_alergias?_(t.alergias_descripcion):`No`],[`Cond. transmisible`,t.tiene_condicion_transmisible?_(t.condicion_transmisible_descripcion):`No`],[`Alerg. medicamento`,t.alergia_medicamento?_(t.alergia_medicamento_descripcion):`No`],[`Conducta`,_(t.problemas_conducta)]],o),x(e,n.n)}function te(e,t=`Fichas Técnicas — Lote`){if(!e||e.length===0)throw Error(`No hay alumnos para generar el lote`);let n=new s({unit:`mm`,format:`letter`}),r={n:1},i=b(n,t,`Generado: ${g()}`);return n.setFont(`helvetica`,`bold`),n.setFontSize(11),n.setTextColor(...f.azul),n.text(`Total de alumnos: ${e.length}`,h,i+8),i+=16,c(n,{startY:i,margin:{left:h,right:h},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Nivel`,`Representante`]],headStyles:{fillColor:f.azul,textColor:f.blanco,fontStyle:`bold`,fontSize:8},styles:{fontSize:7.5,cellPadding:{top:1.5,bottom:1.5,left:2.5,right:2.5}},alternateRowStyles:{fillColor:f.grisClaro},body:e.map((e,t)=>[t+1,_(e.nombre_completo),_(e.instrumento_principal),_(e.nivel_actual),_(e.representante_nombre)])}),x(n,1),e.forEach(e=>ee(n,e,r)),n}function ne(e,t){let n=te(e,t),r=new Date().toISOString().slice(0,10);n.save(`fichas-lote-${r}.pdf`)}var T={azul:[20,60,130],azulMedio:[40,90,170],azulClaro:[220,232,250],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],verde:[20,120,60],verdeClaro:[220,245,230],rojo:[180,20,20],naranja:[180,90,20],morado:[90,40,140],moradoClaro:[240,230,250]},E=215.9,D=279.4,O=14;function re(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function k(e,t=`—`){return String(e??``).trim()||t}function A(e){if(!e)return`—`;try{let t=(e+``).slice(0,10).split(`-`);return`${t[2]}/${t[1]}/${t[0]}`}catch{return e}}function j(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function M(e){if(!e||typeof e!=`string`)return[];let t=[],n=/\[([^\]]+)\]/g,r;for(;(r=n.exec(e))!==null;){let e=r[1].trim();e&&t.push(e)}return t}function ie(e){if(!e)return null;let t=e.match(/\b(\d+(?:\.\d+)?)\s*\/\s*(\d+)\b/);return t?`${t[1]}/${t[2]}`:null}function N(e,t,n=``){return e.setFillColor(...T.azul),e.rect(0,0,E,32,`F`),e.setFillColor(...T.dorado),e.rect(0,32,E,2.5,`F`),e.setFillColor(...T.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...T.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,O+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,O+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...T.dorado),e.text(t,E-O,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,E-O,20,{align:`right`})),e.setTextColor(...T.grisOscuro),38}function ae(e){let t=e.internal.getNumberOfPages();for(let n=1;n<=t;n++)e.setPage(n),e.setFillColor(...T.azul),e.rect(0,D-12,E,12,`F`),e.setFillColor(...T.dorado),e.rect(0,D-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...T.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,O+2,D-4.5),e.text(`Pág. ${n} / ${t}`,E-O,D-4.5,{align:`right`})}function P(e,t,n,r=T.azul){return e.setFillColor(...r),e.rect(O,n,E-O*2,7,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8.5),e.setTextColor(...T.blanco),e.text(t,O+3,n+4.8),e.setTextColor(...T.grisOscuro),n+9}function F(e,t,n,r=52){return c(e,{startY:n,margin:{left:O,right:O},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:T.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:T.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r,fillColor:T.azulClaro,textColor:T.azul}},body:t}),e.lastAutoTable.finalY+3}function I(e,t,n){return e.setFont(`helvetica`,`italic`),e.setFontSize(8),e.setTextColor(...T.grisMedio),e.text(t,O,n+5),e.setTextColor(...T.grisOscuro),n+10}function L(e,t,n,r,i,a){return t+n>D-22?(e.setFillColor(...T.azul),e.rect(0,D-12,E,12,`F`),e.setFillColor(...T.dorado),e.rect(0,D-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...T.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,O+2,D-4.5),e.text(`Pág. ${r.n}`,E-O,D-4.5,{align:`right`}),r.n++,e.addPage(),N(e,i,`Expediente: ${a}`)):t}function oe(e,t,n,r,i){let a=k(t.nombre_completo)===`—`?k(t.nombre):k(t.nombre_completo);n=L(e,n,10,r,i,a),n=P(e,`1. DATOS PERSONALES Y REPRESENTANTE`,n,T.azul),e.setFillColor(...T.azulClaro),e.roundedRect(O,n,E-O*2,18,2,2,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(13),e.setTextColor(...T.azul),e.text(a,O+4,n+7),e.setFont(`helvetica`,`normal`),e.setFontSize(8.5),e.setTextColor(...T.grisMedio);let o=k(t.instrumento_principal)===`—`?k(t.instrumento):k(t.instrumento_principal),s=[`Edad: ${j(t.fecha_nacimiento)}`,`Instrumento: ${o}`,`Nivel: ${k(t.nivel_actual)}`].join(`    ·    `);return e.text(s,O+4,n+14),e.setTextColor(...T.grisOscuro),n+=22,n=F(e,[[`Nombre completo`,a],[`Fecha nacimiento`,A(t.fecha_nacimiento)],[`Edad`,j(t.fecha_nacimiento)],[`Género`,k(t.genero)],[`Nacionalidad`,k(t.nacionalidad)],[`Municipio`,k(t.municipio_residencia)],[`Dirección`,k(t.sector_calle_numero??t.direccion)],[`Tel. alumno`,k(t.tlf_alumno)],[`Centro estudios`,k(t.centro_estudios)],[`Grado/Nivel`,k(t.grado_nivel)]],n),n=L(e,n,25,r,i,a),n=F(e,[[`Representante`,k(t.representante_nombre)],[`Parentesco`,k(t.representante_parentesco)],[`Cédula`,k(t.representante_cedula)],[`Teléfono`,k(t.representante_tlf)],[`Correo`,k(t.correo_representante)],[`Madre`,k(t.madre_nombre)],[`Tel. madre`,k(t.madre_tlf_whatsapp)],[`Padre`,k(t.padre_nombre)],[`Tel. padre`,k(t.padre_tlf_whatsapp)]],n),n}function se(e,t,n,r,i,a,o){let s=k(n.nombre_completo)===`—`?k(n.nombre):k(n.nombre_completo);if(r=L(e,r,15,i,a,s),r=P(e,`${o}. HISTORIAL DE ASISTENCIAS`,r,T.verde),!t||t.length===0)return I(e,`Sin registros de asistencia.`,r);let l=t.filter(e=>(e.estado??(e.asistio?`presente`:`ausente`))===`presente`).length,u=t.filter(e=>(e.estado??(e.asistio?`presente`:`ausente`))===`ausente`).length,d=t.filter(e=>e.estado===`justificado`).length,f=t.length,p=f>0?Math.round(l/f*100):0;return e.setFillColor(...T.verdeClaro),e.rect(O,r,E-O*2,10,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...T.verde),e.text(`Total: ${f} clases  ·  Presentes: ${l} (${p}%)  ·  Ausentes: ${u}  ·  Justificados: ${d}`,O+3,r+6.5),e.setTextColor(...T.grisOscuro),r+=13,c(e,{startY:r,margin:{left:O,right:O},theme:`grid`,head:[[`Fecha`,`Estado`,`Qué trabajaron en clase`,`Observación del alumno`]],headStyles:{fillColor:T.verde,textColor:T.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.8,bottom:1.8,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:T.grisClaro},columnStyles:{0:{cellWidth:20},1:{cellWidth:22},2:{cellWidth:88}},body:t.map(e=>{let t=e.estado??(e.asistio?`presente`:`ausente`),n=e.sesion??e.sesiones_clase??null,r=`—`;if(n){let e=k(n.tema_principal),t=M(n.contenido_dsl??n.contenido??``);t.length>0?r=t.join(`
`):e===`—`?n.contenido&&(r=n.contenido.slice(0,120)):r=e}return[A(e.fecha),t.charAt(0).toUpperCase()+t.slice(1),r,k(e.observaciones??e.justificacion_texto)]})}),e.lastAutoTable.finalY+4}function ce(e,t,n,r,i,a,o){let s=k(n.nombre_completo)===`—`?k(n.nombre):k(n.nombre_completo);if(r=L(e,r,15,i,a,s),r=P(e,`${o}. PROGRESOS Y PARTICIPACIÓN`,r,T.azulMedio),!t||t.length===0)return I(e,`Sin registros de progresos.`,r);let l=t.filter(e=>e.calificacion!=null).map(e=>Number(e.calificacion)),u=l.length>0?(l.reduce((e,t)=>e+t,0)/l.length).toFixed(1):`—`;return e.setFillColor(...T.azulClaro),e.rect(O,r,E-O*2,10,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...T.azul),e.text(`Total: ${t.length} evaluaciones  ·  Promedio: ${u}`,O+3,r+6.5),e.setTextColor(...T.grisOscuro),r+=13,c(e,{startY:r,margin:{left:O,right:O},theme:`grid`,head:[[`Fecha`,`Tipo`,`Qué se evaluó`,`Participación`,`Calif.`,`Observaciones`]],headStyles:{fillColor:T.azulMedio,textColor:T.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.8,bottom:1.8,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:T.grisClaro},columnStyles:{0:{cellWidth:20},1:{cellWidth:22},2:{cellWidth:65},4:{cellWidth:12}},body:t.map(e=>{let t=M(e.contenido_dsl??``),n=t.length>0?t.join(`
`):k(e.contenido_dsl),r=ie(e.contenido_dsl)??(e.calificacion==null?`—`:String(e.calificacion));return[A(e.fecha_evaluacion??e.fecha),k(e.evaluacion_tipo),n,k(e.estado_cualitativo),r,k(e.observaciones)]})}),e.lastAutoTable.finalY+4}function le(e,t,n,r,i,a,o){let s=k(n.nombre_completo)===`—`?k(n.nombre):k(n.nombre_completo);return r=L(e,r,15,i,a,s),r=P(e,`${o}. HISTORIAL DE OBSERVACIONES`,r,T.naranja),!t||t.length===0?I(e,`Sin observaciones registradas.`,r):(c(e,{startY:r,margin:{left:O,right:O},theme:`grid`,head:[[`Fecha`,`Tipo`,`Estado`,`Descripción / Seguimiento`]],headStyles:{fillColor:T.naranja,textColor:T.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.8,bottom:1.8,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:T.grisClaro},columnStyles:{0:{cellWidth:20},1:{cellWidth:25},2:{cellWidth:20}},body:t.map(e=>[A(e.created_at??e.fecha),k(e.tipo),k(e.estado),k(e.descripcion??e.texto??e.observacion)])}),e.lastAutoTable.finalY+4)}function ue(e,t,n,r,i,a,o){let s=k(n.nombre_completo)===`—`?k(n.nombre):k(n.nombre_completo);r=L(e,r,15,i,a,s),r=P(e,`${o}. DOMINIO: ESCALAS, OBRAS Y TÉCNICAS`,r,T.morado);let l=t??[];if(l.length===0)return I(e,`Sin indicadores registrados.`,r);let u={Técnicas:[],"Escalas y Arpegios":[],"Repertorio / Obras":[],Otros:[]};l.forEach(e=>{let t=(e.indicador?.nodo?.name??e.nodo?.name??e.node_name??``).toUpperCase(),n=k(e.indicador?.description??e.description??e.indicador_id),r=A(e.covered_date??e.fecha??e.created_at),i=[n,e.nota==null?e.result?k(e.result):`—`:`${e.nota}/5`,r];/TÉCNICA|ARCO|MANO|DEDO|POSTURA|AFINAC|SONIDO/.test(t)?u.Técnicas.push(i):/ESCALA|ARPEGIO|PATRÓN/.test(t)?u[`Escalas y Arpegios`].push(i):/OBRA|REPERTORIO|ESTUDIO|PIEZA/.test(t)?u[`Repertorio / Obras`].push(i):u.Otros.push(i)});let d=Object.entries(u).filter(([,e])=>e.length>0);if(d.length===0)return I(e,`Sin indicadores dominados registrados.`,r);for(let[t,n]of d)r=L(e,r,18,i,a,s),e.setFillColor(...T.moradoClaro),e.rect(O,r,E-O*2,6,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(7.5),e.setTextColor(...T.morado),e.text(`${t} (${n.length})`,O+3,r+4.2),e.setTextColor(...T.grisOscuro),r+=7,c(e,{startY:r,margin:{left:O,right:O},theme:`grid`,head:[[`Descripción`,`Nota`,`Fecha`]],headStyles:{fillColor:T.morado,textColor:T.blanco,fontStyle:`bold`,fontSize:7},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:T.grisClaro},columnStyles:{1:{cellWidth:18},2:{cellWidth:22}},body:n}),r=e.lastAutoTable.finalY+4;return r}function de(e,t={},n={}){let r=new s({unit:`mm`,format:`letter`}),i={n:1},a=k(e.nombre_completo)===`—`?k(e.nombre):k(e.nombre_completo),o=`EXPEDIENTE DEL ALUMNO`,c=N(r,o,`Generado: ${re()}`);r.setFont(`helvetica`,`bold`),r.setFontSize(55),r.setTextColor(235,240,252),r.text(`CONFIDENCIAL`,E/2,D/2,{align:`center`,angle:45}),r.setTextColor(...T.grisOscuro);let l=[t.ficha&&`Datos personales`,t.asistencias&&`Asistencias`,t.progresos&&`Progresos y participación`,t.observaciones&&`Observaciones`,t.dominio&&`Dominio: escalas, obras y técnicas`].filter(Boolean);r.setFont(`helvetica`,`bold`),r.setFontSize(8),r.setTextColor(...T.grisMedio),r.text(`Contenido: ${l.join(`  ·  `)}`,O,c+5),c+=12;let u=1;return t.ficha&&(c=oe(r,e,c,i,o),u++),t.asistencias&&(c=L(r,c,20,i,o,a),c=se(r,n.asistencias,e,c,i,o,u),u++),t.progresos&&(c=L(r,c,20,i,o,a),c=ce(r,n.progresos,e,c,i,o,u),u++),t.observaciones&&(c=L(r,c,20,i,o,a),c=le(r,n.observaciones,e,c,i,o,u),u++),t.dominio&&(c=L(r,c,20,i,o,a),c=ue(r,n.indicadores,e,c,i,o,u)),ae(r),r}function fe(e,t,n){let r=de(e,t,n),i=(k(e.nombre_completo)===`—`?k(e.nombre):k(e.nombre_completo)).toLowerCase().replace(/\s+/g,`-`),a=new Date().toISOString().slice(0,10);r.save(`expediente-${i}-${a}.pdf`)}var R={azul:[20,60,130],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],azulClaro:[220,232,250]},z=14;function B(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function V(e,t=`—`){return String(e??``).trim()||t}function H(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function U(e,t,n=``){let r=e.internal.pageSize.getWidth();return e.setFillColor(...R.azul),e.rect(0,0,r,32,`F`),e.setFillColor(...R.dorado),e.rect(0,32,r,2.5,`F`),e.setFillColor(...R.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...R.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,z+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,z+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...R.dorado),e.text(t,r-z,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,r-z,20,{align:`right`})),e.setTextColor(...R.grisOscuro),42}function W(e){let t=e.internal.getNumberOfPages(),n=e.internal.pageSize.getHeight(),r=e.internal.pageSize.getWidth();for(let i=1;i<=t;i++)e.setPage(i),e.setFillColor(...R.azul),e.rect(0,n-12,r,12,`F`),e.setFillColor(...R.dorado),e.rect(0,n-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...R.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,z+2,n-4.5),e.text(`Pág. ${i} / ${t}`,r-z,n-4.5,{align:`right`})}function pe(e,t=``){let n=new s({unit:`mm`,format:`letter`,orientation:`landscape`}),r=t||B(),i=U(n,`LISTA DE ALUMNOS ACTIVOS`,r);return n.setFont(`helvetica`,`normal`),n.setFontSize(8.5),n.setTextColor(...R.grisMedio),n.text(`Total: ${e.length} alumno(s)   ·   Generado: ${B()}`,z,i),i+=6,c(n,{startY:i,margin:{left:z,right:z},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Nivel`,`Representante`,`Teléfono`,`Correo`,`Inscrito`]],headStyles:{fillColor:R.azul,textColor:R.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:R.grisClaro},columnStyles:{0:{cellWidth:8},6:{cellWidth:45}},body:e.map((e,t)=>[t+1,V(e.nombre_completo),V(e.instrumento_principal),V(e.nivel_actual),V(e.representante_nombre),V(e.representante_tlf),V(e.correo_representante),H(e.created_at)]),didDrawPage:()=>U(n,`LISTA DE ALUMNOS ACTIVOS`,r)}),W(n),n}function me(e,t){let n=pe(e,t),r=new Date().toISOString().slice(0,10);n.save(`lista-alumnos-${r}.pdf`)}function he(e,t,n){let r=new s({unit:`mm`,format:`letter`,orientation:`landscape`}),i=`${H(t)} — ${H(n)}`,a=U(r,`ALUMNOS INSCRITOS`,i);return r.setFont(`helvetica`,`normal`),r.setFontSize(8.5),r.setTextColor(...R.grisMedio),r.text(`Total: ${e.length} alumno(s) en el período   ·   Generado: ${B()}`,z,a),a+=6,c(r,{startY:a,margin:{left:z,right:z},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Representante`,`Teléfono`,`Correo`,`Fecha inscripción`]],headStyles:{fillColor:R.azul,textColor:R.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:R.grisClaro},columnStyles:{0:{cellWidth:8},5:{cellWidth:45}},body:e.map((e,t)=>[t+1,V(e.nombre_completo),V(e.instrumento_principal),V(e.representante_nombre),V(e.representante_tlf),V(e.correo_representante),H(e.created_at)]),didDrawPage:()=>U(r,`ALUMNOS INSCRITOS`,i)}),W(r),r}function ge(e,t,n){he(e,t,n).save(`inscritos-${t}-a-${n}.pdf`)}function _e(e){let t=new s({unit:`mm`,format:`letter`,orientation:`landscape`}),n=U(t,`DIRECTORIO DE MAESTROS`,B());return t.setFont(`helvetica`,`normal`),t.setFontSize(8.5),t.setTextColor(...R.grisMedio),t.text(`Total: ${e.length} maestro(s)   ·   Generado: ${B()}`,z,n),n+=6,c(t,{startY:n,margin:{left:z,right:z},theme:`grid`,head:[[`#`,`Nombre`,`Especialidad`,`Correo`,`Teléfono`,`Clases asignadas`,`Reseña`]],headStyles:{fillColor:R.azul,textColor:R.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:R.grisClaro},columnStyles:{0:{cellWidth:8},5:{cellWidth:50},6:{cellWidth:55}},body:e.map((e,t)=>{let n=Array.isArray(e.clases)&&e.clases.length?e.clases.map(e=>e.nombre??e).join(`
`):`—`;return[t+1,V(e.nombre),V(e.instrumento),V(e.email),V(e.telefono),n,V(e.bio)]}),didDrawPage:()=>U(t,`DIRECTORIO DE MAESTROS`,B())}),W(t),t}function ve(e){let t=_e(e),n=new Date().toISOString().slice(0,10);t.save(`maestros-${n}.pdf`)}var G=[],K=null,q=[],J=`todos`,ye=[{key:`nombre_completo`,label:`Nombre completo`,critical:!0},{key:`centro_estudios`,label:`Centro educativo`,critical:!0},{key:`grado_nivel`,label:`Grado o nivel escolar`,critical:!1},{key:`representante_nombre`,label:`Nombre del representante`,critical:!0},{key:`representante_tlf`,label:`Teléfono del representante`,critical:!0},{key:`correo_representante`,label:`Correo del representante`,critical:!1},{key:`instrumento_principal`,label:`Instrumento principal`,critical:!1}];async function be(e){e.innerHTML=`
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-10 mx-auto">

          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-file-earmark-arrow-down fs-2 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Exportar Datos</h2>
              <small class="text-muted">Genera reportes y expedientes en PDF para impresión o archivo digital</small>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 1 — EXPEDIENTE INDIVIDUAL
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow border-primary mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-person-lines-fill me-2"></i>
                Expediente Individual por Alumno
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Buscá un alumno y seleccioná qué secciones incluir: ficha técnica, asistencias, progresos, observaciones e indicadores dominados.
              </p>

              <!-- Buscador -->
              <div class="mb-3">
                <label class="form-label fw-semibold small">Buscar alumno</label>
                <input type="text" class="form-control" id="exp-buscar"
                  placeholder="Nombre, instrumento o cédula del representante...">
                <div id="exp-resultados" class="list-group mt-1" style="max-height:220px;overflow-y:auto;display:none;"></div>
              </div>

              <!-- Alumno seleccionado -->
              <div id="exp-alumno-chip" class="mb-3" style="display:none;">
                <span class="badge bg-primary fs-6 py-2 px-3" id="exp-alumno-nombre"></span>
                <button class="btn btn-sm btn-link text-danger ms-2" id="exp-limpiar">
                  <i class="bi bi-x-circle"></i> Cambiar alumno
                </button>
              </div>

              <!-- Secciones a incluir -->
              <div id="exp-opciones" style="display:none;">
                <label class="form-label fw-semibold small">Secciones a incluir en el PDF</label>
                <div class="row g-2 mb-3">
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-ficha" checked>
                      <label class="form-check-label small fw-semibold" for="sec-ficha">
                        <i class="bi bi-person-vcard text-primary me-1"></i>Ficha técnica
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-asistencias" checked>
                      <label class="form-check-label small fw-semibold" for="sec-asistencias">
                        <i class="bi bi-calendar-check text-success me-1"></i>Asistencias
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-progresos" checked>
                      <label class="form-check-label small fw-semibold" for="sec-progresos">
                        <i class="bi bi-graph-up text-primary me-1"></i>Progresos y calificaciones
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-observaciones" checked>
                      <label class="form-check-label small fw-semibold" for="sec-observaciones">
                        <i class="bi bi-chat-left-text text-warning me-1"></i>Observaciones
                      </label>
                    </div>
                  </div>
                  <div class="col-6 col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="sec-dominio" checked>
                      <label class="form-check-label small fw-semibold" for="sec-dominio">
                        <i class="bi bi-award text-info me-1"></i>Escalas, obras y técnicas
                      </label>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-3">
                  <button class="btn btn-primary" id="btn-expediente">
                    <i class="bi bi-file-earmark-pdf me-2"></i>Descargar Expediente
                  </button>
                  <span id="exp-status" class="text-muted small"></span>
                </div>
              </div>

            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 2 — FICHAS TÉCNICAS EN LOTE
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-person-vcard me-2 text-primary"></i>
                Fichas Técnicas — Lote
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Un solo PDF con la ficha de inscripción de cada alumno (una ficha por página). Ideal para imprimir todos los expedientes o generar el respaldo digital.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Estado</label>
                  <select class="form-select" id="fichas-filtro">
                    <option value="activos">Solo activos</option>
                    <option value="todos">Todos</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="fichas-instrumento"
                    placeholder="Ej: Violín — vacío = todos">
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

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 3 — LISTA DE ALUMNOS ACTIVOS
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-success bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-table me-2 text-success"></i>
                Lista de Alumnos Activos
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Tabla con todos los alumnos activos. Filtrá por instrumento o nivel.
              </p>
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="lista-instrumento"
                    placeholder="Ej: Violín — vacío = todos">
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Nivel (opcional)</label>
                  <input type="text" class="form-control" id="lista-nivel"
                    placeholder="Ej: Iniciación">
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

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 4 — INSCRITOS POR RANGO DE FECHAS
          ══════════════════════════════════════════════════════════ -->
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
                <div class="col-md-3">
                  <label class="form-label fw-semibold small">Instrumento (opcional)</label>
                  <input type="text" class="form-control" id="rango-instrumento"
                    placeholder="Todos">
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

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 5 — DIRECTORIO DE MAESTROS
          ══════════════════════════════════════════════════════════ -->
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

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 6 — DIAGNÓSTICO DE DATOS PARA DOCUMENTOS
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-secondary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-clipboard-check me-2 text-secondary"></i>
                Diagnóstico de datos para documentos
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3">
                Verificá qué alumnos tienen datos completos para generar permisos de ausencia, autorizaciones de viaje o cartas institucionales.
              </p>
              <div class="d-flex align-items-center gap-3 mb-3">
                <button class="btn btn-secondary" id="btn-ejecutar-diagnostico">
                  <i class="bi bi-search me-2"></i>Ejecutar diagnóstico
                </button>
                <span id="diag-status" class="text-muted small"></span>
              </div>
              <div id="diagnostico-resultado" style="display:none;">
                <!-- Resumen -->
                <div class="row g-2 mb-4" id="diag-resumen"></div>
                <!-- Filtros -->
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <input type="text" class="form-control form-control-sm" id="diag-buscar"
                         placeholder="Buscar alumno por nombre..." style="max-width:260px;">
                  <div class="btn-group btn-group-sm" id="diag-filtros">
                    <button class="btn btn-secondary active" data-diag="todos">Todos</button>
                    <button class="btn btn-outline-success"  data-diag="completo">Completos</button>
                    <button class="btn btn-outline-warning"  data-diag="incompleto">Incompletos</button>
                    <button class="btn btn-outline-danger"   data-diag="critico">Críticos</button>
                  </div>
                </div>
                <!-- Lista -->
                <div id="diag-lista"></div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════
               SECCIÓN 7 — DOCUMENTOS INSTITUCIONALES
          ══════════════════════════════════════════════════════════ -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-file-text me-2 text-primary"></i>
                Documentos institucionales
              </h5>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-4">
                Generá permisos de ausencia, autorizaciones de viaje y cartas institucionales con datos reales de los alumnos.
              </p>
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <div class="card h-100 border-0 shadow-sm text-center p-3" data-doc-nav="documentos-historial" style="cursor:pointer;">
                    <i class="bi bi-clock-history fs-2 text-info mb-2"></i>
                    <div class="small fw-semibold">Historial</div>
                    <div class="text-muted" style="font-size:0.72rem;">Documentos generados</div>
                  </div>
                </div>
              </div>
              <h6 class="fw-bold mb-3">Generar documento individual</h6>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold">1. Buscar alumno</label>
                  <input type="text" class="form-control form-control-sm" id="doc-buscar-alumno"
                         placeholder="Nombre del alumno...">
                  <div id="doc-alumno-resultados" class="list-group mt-1" style="max-height:180px;overflow-y:auto;display:none;"></div>
                  <div id="doc-alumno-chip" class="mt-2" style="display:none;">
                    <span class="badge bg-primary" id="doc-alumno-nombre"></span>
                    <button class="btn btn-link btn-sm text-danger p-0 ms-2" id="doc-limpiar-alumno">
                      <i class="bi bi-x-circle"></i> Cambiar
                    </button>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold">2. Seleccionar plantilla</label>
                  <select class="form-select form-select-sm" id="doc-template-select" disabled>
                    <option value="">— Primero seleccioná un alumno —</option>
                  </select>
                </div>
                <div class="col-12" id="doc-actividad-form" style="display:none;">
                  <hr class="my-2">
                  <h6 class="small fw-semibold mb-2">3. Datos de la actividad</h6>
                  <div class="row g-2">
                    <div class="col-12 col-md-6">
                      <label class="form-label small">Nombre de la actividad *</label>
                      <input type="text" class="form-control form-control-sm" id="doc-act-nombre" placeholder="Ej: Concierto Institucional">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Fecha de la actividad</label>
                      <input type="date" class="form-control form-control-sm" id="doc-act-fecha">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Lugar</label>
                      <input type="text" class="form-control form-control-sm" id="doc-act-lugar" placeholder="Ej: Centro León">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Hora de salida</label>
                      <input type="time" class="form-control form-control-sm" id="doc-act-hora-salida">
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small">Hora de regreso</label>
                      <input type="time" class="form-control form-control-sm" id="doc-act-hora-regreso">
                    </div>
                    <div class="col-12">
                      <label class="form-label small">Responsable institucional</label>
                      <input type="text" class="form-control form-control-sm" id="doc-act-responsable" value="Coordinación Pedagógica">
                    </div>
                    <div class="col-12">
                      <label class="form-label small">Motivo / descripción del permiso</label>
                      <textarea class="form-control form-control-sm" id="doc-act-motivo" rows="2"
                                placeholder="Explicá brevemente el motivo del permiso..."></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label small">Observaciones internas</label>
                      <textarea class="form-control form-control-sm" id="doc-act-observaciones" rows="2"></textarea>
                    </div>
                    <div class="col-12">
                      <button class="btn btn-primary btn-sm" id="btn-doc-preview">
                        <i class="bi bi-eye me-1"></i>Vista previa y generar PDF
                      </button>
                      <span id="doc-gen-status" class="small text-muted ms-2"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;try{G=await l()}catch{G=[]}K=null,Te(e)}function Y(e,t=`—`){return String(e??``).trim()||t}function X(e,t,n=!1){let r=document.getElementById(e);r&&(r.textContent=t,r.className=n?`text-danger small`:`text-muted small`)}function Z(e,t){let n=document.getElementById(e);n&&(n.disabled=t,t?(n.dataset.originalHtml=n.innerHTML,n.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`):n.innerHTML=n.dataset.originalHtml||n.innerHTML)}function xe(e){let t=e.querySelector(`#exp-buscar`),n=e.querySelector(`#exp-resultados`),r=e.querySelector(`#exp-alumno-chip`),i=e.querySelector(`#exp-opciones`),a=e.querySelector(`#exp-alumno-nombre`),o=e.querySelector(`#exp-limpiar`);t.addEventListener(`input`,()=>{let e=t.value.trim().toLowerCase();if(e.length<1){n.style.display=`none`;return}let o=G.filter(t=>{let n=(Y(t.nombre_completo)+` `+Y(t.nombre)).toLowerCase(),r=(Y(t.instrumento_principal)+` `+Y(t.instrumento)).toLowerCase(),i=(Y(t.representante_cedula)+` `+Y(t.cedula)).toLowerCase();return n.includes(e)||r.includes(e)||i.includes(e)}).slice(0,12);o.length===0?n.innerHTML=`<div class="list-group-item text-muted small">Sin resultados</div>`:(n.innerHTML=o.map(e=>{let t=Y(e.nombre_completo)===`—`?Y(e.nombre):Y(e.nombre_completo),n=Y(e.instrumento_principal)===`—`?Y(e.instrumento):Y(e.instrumento_principal);return`
        <button type="button" class="list-group-item list-group-item-action py-2 px-3"
          data-id="${e.id}">
          <span class="fw-semibold">${t}</span>
          <span class="text-muted small ms-2">${n}</span>
        </button>
        `}).join(``),n.querySelectorAll(`button`).forEach(e=>{e.addEventListener(`click`,()=>{let o=G.find(t=>t.id===e.dataset.id);o&&Se(o,t,n,r,a,i)})})),n.style.display=`block`}),document.addEventListener(`click`,e=>{!n.contains(e.target)&&e.target!==t&&(n.style.display=`none`)},{capture:!0}),o.addEventListener(`click`,()=>{K=null,t.value=``,r.style.display=`none`,i.style.display=`none`,t.focus()})}function Se(e,t,n,r,i,a){K=e,t.value=``,n.style.display=`none`,i.textContent=Y(e.nombre_completo)===`—`?Y(e.nombre):Y(e.nombre_completo),r.style.display=`block`,a.style.display=`block`}async function Ce(t){let{data:n,error:r}=await e.from(`asistencias`).select(`*, sesion:sesiones_clase(fecha, contenido_dsl, contenido, tema_principal)`).eq(`alumno_id`,t).order(`fecha`,{ascending:!1});if(r)throw Error(`Asistencias: ${r.message}`);return n??[]}async function we(t){let{data:n,error:r}=await e.from(`observaciones_alumnos`).select(`*`).eq(`alumno_id`,t).order(`created_at`,{ascending:!1});if(r)throw Error(`Observaciones: ${r.message}`);return n??[]}async function Q(t){let{data:n,error:r}=await e.from(`indicator_attempts`).select(`*, indicador:indicators(description, nodo:nodes(name, is_critical))`).or(`alumno_id.eq.${t},student_id.eq.${t}`).order(`created_at`,{ascending:!1});return r?[]:n??[]}function Te(e){xe(e),e.querySelector(`#btn-expediente`).addEventListener(`click`,async()=>{if(!K){X(`exp-status`,`Seleccioná un alumno primero.`,!0);return}let e={ficha:document.getElementById(`sec-ficha`).checked,asistencias:document.getElementById(`sec-asistencias`).checked,progresos:document.getElementById(`sec-progresos`).checked,observaciones:document.getElementById(`sec-observaciones`).checked,dominio:document.getElementById(`sec-dominio`).checked};if(!Object.values(e).some(Boolean)){X(`exp-status`,`Seleccioná al menos una sección.`,!0);return}Z(`btn-expediente`,!0),X(`exp-status`,`Cargando datos...`);try{let t=K.id,n={},i=[];e.asistencias&&i.push(Ce(t).then(e=>{n.asistencias=e})),e.progresos&&i.push(r(t).then(e=>{n.progresos=e})),e.observaciones&&i.push(we(t).then(e=>{n.observaciones=e})),e.dominio&&i.push(Q(t).then(e=>{n.indicadores=e})),await Promise.all(i),fe(K,e,n),X(`exp-status`,`✓ Expediente descargado`)}catch(e){X(`exp-status`,`Error: ${e.message}`,!0)}finally{Z(`btn-expediente`,!1)}}),e.querySelector(`#btn-fichas-lote`).addEventListener(`click`,async()=>{Z(`btn-fichas-lote`,!0),X(`fichas-status`,`Cargando alumnos...`);try{let e=document.getElementById(`fichas-filtro`).value,t=document.getElementById(`fichas-instrumento`).value.trim().toLowerCase(),n=e===`activos`?G.filter(e=>e.is_active!==!1):G;if(t&&(n=n.filter(e=>Y(e.instrumento_principal).toLowerCase().includes(t))),n.length===0){X(`fichas-status`,`Sin alumnos con ese filtro.`,!0);return}X(`fichas-status`,`Generando ${n.length} ficha(s)...`);let r=[`Fichas Técnicas`];e===`activos`&&r.push(`Alumnos Activos`),t&&r.push(t.charAt(0).toUpperCase()+t.slice(1)),ne(n,r.join(` — `)),X(`fichas-status`,`✓ ${n.length} ficha(s) descargadas`)}catch(e){X(`fichas-status`,`Error: ${e.message}`,!0)}finally{Z(`btn-fichas-lote`,!1)}}),e.querySelector(`#btn-lista-alumnos`).addEventListener(`click`,async()=>{Z(`btn-lista-alumnos`,!0),X(`lista-status`,`Filtrando...`);try{let e=document.getElementById(`lista-instrumento`).value.trim().toLowerCase(),t=document.getElementById(`lista-nivel`).value.trim().toLowerCase(),n=G.filter(e=>e.is_active!==!1);if(e&&(n=n.filter(t=>Y(t.instrumento_principal).toLowerCase().includes(e))),t&&(n=n.filter(e=>Y(e.nivel_actual).toLowerCase().includes(t))),n.length===0){X(`lista-status`,`Sin alumnos con ese filtro.`,!0);return}let r=[`Todos los activos`];e&&(r[0]=`Instrumento: ${e}`),t&&r.push(`Nivel: ${t}`),me(n,r.join(`  ·  `)),X(`lista-status`,`✓ ${n.length} alumno(s)`)}catch(e){X(`lista-status`,`Error: ${e.message}`,!0)}finally{Z(`btn-lista-alumnos`,!1)}}),e.querySelector(`#btn-inscritos-rango`).addEventListener(`click`,async()=>{let e=document.getElementById(`rango-desde`).value,t=document.getElementById(`rango-hasta`).value,n=document.getElementById(`rango-instrumento`).value.trim().toLowerCase();if(!e||!t){X(`rango-status`,`Seleccioná ambas fechas.`,!0);return}if(e>t){X(`rango-status`,`"Desde" debe ser anterior a "Hasta".`,!0);return}Z(`btn-inscritos-rango`,!0),X(`rango-status`,`Filtrando...`);try{let r=G.filter(n=>{let r=(n.created_at??``).slice(0,10);return r>=e&&r<=t});if(n&&(r=r.filter(e=>Y(e.instrumento_principal).toLowerCase().includes(n))),r.length===0){X(`rango-status`,`Sin alumnos en ese rango.`,!0);return}ge(r,e,t),X(`rango-status`,`✓ ${r.length} alumno(s)`)}catch(e){X(`rango-status`,`Error: ${e.message}`,!0)}finally{Z(`btn-inscritos-rango`,!1)}}),e.querySelector(`#btn-maestros`).addEventListener(`click`,async()=>{Z(`btn-maestros`,!0),X(`maestros-status`,`Cargando...`);try{let e=await n();if(e.length===0){X(`maestros-status`,`Sin maestros.`,!0);return}ve(e),X(`maestros-status`,`✓ ${e.length} maestro(s)`)}catch(e){X(`maestros-status`,`Error: ${e.message}`,!0)}finally{Z(`btn-maestros`,!1)}}),e.querySelector(`#btn-ejecutar-diagnostico`)?.addEventListener(`click`,async()=>{Z(`btn-ejecutar-diagnostico`,!0),X(`diag-status`,`Cargando alumnos...`),await Ee(e),Z(`btn-ejecutar-diagnostico`,!1),X(`diag-status`,``)}),e.querySelector(`#diag-buscar`)?.addEventListener(`input`,()=>$(e)),e.querySelector(`#diag-filtros`)?.addEventListener(`click`,t=>{let n=t.target.closest(`[data-diag]`);n&&(e.querySelectorAll(`#diag-filtros [data-diag]`).forEach(e=>{e.className=e.dataset.diag===`todos`?`btn btn-secondary`:e.dataset.diag===`completo`?`btn btn-outline-success`:e.dataset.diag===`incompleto`?`btn btn-outline-warning`:`btn btn-outline-danger`}),n.classList.remove(`btn-outline-success`,`btn-outline-warning`,`btn-outline-danger`,`btn-secondary`,`btn-outline-secondary`),n.classList.add(n.dataset.diag===`todos`?`btn-secondary`:n.dataset.diag===`completo`?`btn-success`:n.dataset.diag===`incompleto`?`btn-warning`:`btn-danger`),J=n.dataset.diag,$(e))}),e.querySelector(`#diag-lista`)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-edit-alumno]`);t&&window.router?.navigate(`alumno`,{id:t.dataset.editAlumno})});let t=null,s=null,c=[];a({estado:`activa`}).then(e=>{c=e}).catch(()=>{}),e.querySelectorAll(`[data-doc-nav]`).forEach(e=>{e.addEventListener(`click`,()=>window.router?.navigate(e.dataset.docNav))}),e.querySelector(`#doc-buscar-alumno`)?.addEventListener(`input`,t=>{let n=t.target.value.trim().toLowerCase(),r=e.querySelector(`#doc-alumno-resultados`);if(!r)return;if(!n){r.style.display=`none`;return}let i=G.filter(e=>(e.nombre_completo||``).toLowerCase().includes(n)).slice(0,8);if(i.length===0){r.style.display=`none`;return}r.innerHTML=i.map(e=>`<button class="list-group-item list-group-item-action small py-1" data-alumno-id="${e.id}" data-alumno-nombre="${e.nombre_completo}">${e.nombre_completo}</button>`).join(``),r.style.display=`block`}),e.querySelector(`#doc-alumno-resultados`)?.addEventListener(`click`,async n=>{let r=n.target.closest(`[data-alumno-id]`);if(r){t=r.dataset.alumnoId,e.querySelector(`#doc-buscar-alumno`).value=``,e.querySelector(`#doc-alumno-resultados`).style.display=`none`,e.querySelector(`#doc-alumno-chip`).style.display=`block`,e.querySelector(`#doc-alumno-nombre`).textContent=r.dataset.alumnoNombre;try{s=await d(t);let n=e.querySelector(`#doc-template-select`);n.disabled=!1,n.innerHTML=`<option value="">— Seleccioná una plantilla —</option>`+c.map(e=>`<option value="${e.id}" data-tipo="${e.tipo}">${e.nombre}</option>`).join(``)}catch(e){console.error(`[doc] error loading alumno:`,e)}}}),e.querySelector(`#doc-limpiar-alumno`)?.addEventListener(`click`,()=>{t=null,s=null,e.querySelector(`#doc-alumno-chip`).style.display=`none`,e.querySelector(`#doc-buscar-alumno`).value=``;let n=e.querySelector(`#doc-template-select`);n.disabled=!0,n.innerHTML=`<option value="">— Primero seleccioná un alumno —</option>`,e.querySelector(`#doc-actividad-form`).style.display=`none`}),e.querySelector(`#doc-template-select`)?.addEventListener(`change`,t=>{e.querySelector(`#doc-actividad-form`).style.display=t.target.value?`block`:`none`}),e.querySelector(`#btn-doc-preview`)?.addEventListener(`click`,async()=>{if(!s)return;let n=e.querySelector(`#doc-template-select`)?.value;if(!n)return;let r=c.find(e=>e.id===n);if(!r)return;let a={nombre:e.querySelector(`#doc-act-nombre`)?.value?.trim()||``,fecha:e.querySelector(`#doc-act-fecha`)?.value||``,lugar:e.querySelector(`#doc-act-lugar`)?.value?.trim()||``,hora_salida:e.querySelector(`#doc-act-hora-salida`)?.value||``,hora_regreso:e.querySelector(`#doc-act-hora-regreso`)?.value||``,motivo:e.querySelector(`#doc-act-motivo`)?.value?.trim()||``,observaciones:e.querySelector(`#doc-act-observaciones`)?.value?.trim()||``},l=e.querySelector(`#doc-act-responsable`)?.value?.trim()||`Coordinación Pedagógica`;if(!a.nombre){e.querySelector(`#doc-gen-status`).textContent=`Ingresá el nombre de la actividad.`;return}let{contenidoFinal:d,variablesUsadas:f,variablesFaltantes:p,advertencias:m}=i({template:r,context:u({alumno:s.alumno,escolaridad:s.escolaridad,actividad:a,extra:{responsable:l}})});o({title:r.nombre,tipo:r.tipo,alumnoNombre:s.alumno?.nombre_completo||``,alumnoId:t,templateId:n,contenidoFinal:d,variablesUsadas:f,variablesFaltantes:p,advertencias:m})})}async function Ee(t){try{let{data:n,error:r}=await e.from(`alumnos`).select(`id, nombre_completo, centro_estudios, grado_nivel, representante_nombre, representante_tlf, correo_representante, instrumento_principal`).eq(`es_activo`,!0);if(r)throw r;q=(n||[]).map(e=>{let t=ye.filter(t=>{let n=e[t.key];return n==null||n===``}),n=t.length===0?`completo`:t.some(e=>e.critical)?`critico`:`incompleto`;return{...e,missing:t,status:n}}),J=`todos`;let i=q.filter(e=>e.status===`completo`).length,a=q.filter(e=>e.status===`incompleto`).length,o=q.filter(e=>e.status===`critico`).length,s=t.querySelector(`#diag-resumen`);s&&(s.innerHTML=`
      <div class="col-6 col-md-3"><div class="card border-0 bg-body-secondary text-center py-2"><div class="fs-4 fw-bold">${q.length}</div><small class="text-muted">Total alumnos</small></div></div>
      <div class="col-6 col-md-3"><div class="card border-0 bg-success-subtle text-center py-2"><div class="fs-4 fw-bold text-success">${i}</div><small class="text-muted">Completos</small></div></div>
      <div class="col-6 col-md-3"><div class="card border-0 bg-warning-subtle text-center py-2"><div class="fs-4 fw-bold text-warning">${a}</div><small class="text-muted">Incompletos</small></div></div>
      <div class="col-6 col-md-3"><div class="card border-0 bg-danger-subtle text-center py-2"><div class="fs-4 fw-bold text-danger">${o}</div><small class="text-muted">Críticos</small></div></div>
    `);let c=t.querySelector(`#diagnostico-resultado`);c&&(c.style.display=``),t.querySelectorAll(`#diag-filtros [data-diag]`).forEach(e=>{e.className=e.dataset.diag===`todos`?`btn btn-secondary active`:e.dataset.diag===`completo`?`btn btn-outline-success`:e.dataset.diag===`incompleto`?`btn btn-outline-warning`:`btn btn-outline-danger`}),$(t)}catch(e){console.error(`[diagnosis]`,e),X(`diag-status`,`Error: ${e.message}`,!0)}}function $(e){let n=e.querySelector(`#diag-lista`);if(!n)return;let r=t(e.querySelector(`#diag-buscar`)?.value||``),i=q.filter(e=>!(J!==`todos`&&e.status!==J||r&&!t(e.nombre_completo||``).includes(r)));if(i.length===0){n.innerHTML=`<p class="text-muted small fst-italic">No hay alumnos en esta categoría.</p>`;return}let a={completo:`bg-success-subtle text-success-emphasis`,incompleto:`bg-warning-subtle text-warning-emphasis`,critico:`bg-danger-subtle text-danger-emphasis`},o={completo:`Completo`,incompleto:`Incompleto`,critico:`Crítico`};n.innerHTML=i.map(e=>`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="fw-semibold small">${Y(e.nombre_completo,`Sin nombre`)}</div>
            ${e.missing.length===0?`<div class="text-success small"><i class="bi bi-check-circle me-1"></i>Datos completos</div>`:`<div class="small text-muted mt-1">
                   <span class="fw-semibold">Faltan:</span>
                   ${e.missing.map(e=>`<span class="badge ${e.critical?`bg-danger-subtle text-danger-emphasis`:`bg-warning-subtle text-warning-emphasis`} me-1">${e.label}</span>`).join(``)}
                 </div>`}
          </div>
          <div class="d-flex flex-column align-items-end gap-1">
            <span class="badge ${a[e.status]}">${o[e.status]}</span>
            <button class="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                    data-edit-alumno="${e.id}" style="font-size:0.75rem;">
              <i class="bi bi-pencil me-1"></i>Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join(``)}export{be as renderExportView};