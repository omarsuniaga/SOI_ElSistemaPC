import{i as e}from"./supabase-BryBf0UA.js";import{s as t}from"./alumnosApi-L2o0ngo-.js";import{t as n}from"./jspdf.es.min-CBtVkUg2.js";import{t as r}from"./jspdf.plugin.autotable-C032RTqY.js";import{t as i,u as a}from"./admin-Nb2BsqRJ.js";var o={azul:[20,60,130],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],azulClaro:[220,232,250]},s=215.9,c=279.4,l=14;function u(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function d(e,t=`—`){return String(e??``).trim()||t}function f(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function p(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function m(e,t,n=``){return e.setFillColor(...o.azul),e.rect(0,0,s,32,`F`),e.setFillColor(...o.dorado),e.rect(0,32,s,2.5,`F`),e.setFillColor(...o.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...o.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,l+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,l+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...o.dorado),e.text(t,s-l,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,s-l,20,{align:`right`})),e.setTextColor(...o.grisOscuro),38}function h(e,t){e.setFillColor(...o.azul),e.rect(0,c-12,s,12,`F`),e.setFillColor(...o.dorado),e.rect(0,c-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...o.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,l+2,c-4.5),e.text(`Pág. ${t}`,s-l,c-4.5,{align:`right`})}function g(e,t,n,r=o.azul){return e.setFillColor(...r),e.rect(l,n,s-l*2,6.5,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...o.blanco),e.text(t,l+3,n+4.4),e.setTextColor(...o.grisOscuro),n+7.5}function _(e,t,n,i=52){return r(e,{startY:n,margin:{left:l,right:l},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:o.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:o.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:i,fillColor:o.azulClaro,textColor:o.azul}},body:t}),e.lastAutoTable.finalY+2.5}function v(e,t,n,r,i,a){return t+n>c-22?(h(e,r.n),r.n++,e.addPage(),m(e,i,`Continuación · ${a}`)):t}function y(e,t,n){let r=`FICHA TÉCNICA DEL ALUMNO`,i=d(t.nombre_completo),a=u();e.addPage(),n.n++;let y=m(e,r,`Generado: ${a}`);e.setFont(`helvetica`,`bold`),e.setFontSize(55),e.setTextColor(235,240,252),e.text(`USO INTERNO`,s/2,c/2,{align:`center`,angle:45}),e.setTextColor(...o.grisOscuro),e.setFillColor(...o.azulClaro),e.roundedRect(l,y,s-l*2,18,2,2,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(13),e.setTextColor(...o.azul),e.text(i,l+4,y+7),e.setFont(`helvetica`,`normal`),e.setFontSize(8.5),e.setTextColor(...o.grisMedio);let b=[`Edad: ${p(t.fecha_nacimiento)}`,`F. Nac.: ${f(t.fecha_nacimiento)}`,`Instrumento: ${d(t.instrumento_principal)}`,`Nivel: ${d(t.nivel_actual)}`].join(`    ·    `);e.text(b,l+4,y+14),e.setTextColor(...o.grisOscuro),y+=22,y=v(e,y,30,n,r,i),y=g(e,`DATOS PERSONALES`,y),y=_(e,[[`Nombre completo`,d(t.nombre_completo)],[`Fecha nacimiento`,f(t.fecha_nacimiento)],[`Edad`,p(t.fecha_nacimiento)],[`Género`,d(t.genero)],[`Nacionalidad`,d(t.nacionalidad)],[`Municipio`,d(t.municipio_residencia)],[`Dirección`,d(t.sector_calle_numero)],[`Tel. alumno`,d(t.tlf_alumno)],[`Cómo se enteró`,d(t.como_se_entero)]],y),y=v(e,y,30,n,r,i),y=g(e,`REPRESENTANTE`,y),y=_(e,[[`Nombre`,d(t.representante_nombre)],[`Parentesco`,d(t.representante_parentesco)],[`Cédula`,d(t.representante_cedula)],[`Teléfono`,d(t.representante_tlf)],[`Correo`,d(t.correo_representante)],[`Madre`,d(t.madre_nombre)],[`Tel. madre`,d(t.madre_tlf_whatsapp)],[`Padre`,d(t.padre_nombre)],[`Tel. padre`,d(t.padre_tlf_whatsapp)]],y),y=v(e,y,25,n,r,i),y=g(e,`DATOS MUSICALES`,y),y=_(e,[[`Instrumento`,d(t.instrumento_principal)],[`Nivel actual`,d(t.nivel_actual)],[`Interés musical`,d(t.interes_musical)],[`Instrumento de interés`,d(t.instrumento_interes)],[`Conocimientos previos`,t.tiene_conocimientos_musicales?`Sí`:`No`],[`Nivel lectura musical`,d(t.nivel_lectura_musical)]],y),y=v(e,y,20,n,r,i),y=g(e,`DATOS ACADÉMICOS`,y),y=_(e,[[`Centro de estudios`,d(t.centro_estudios)],[`Grado/Nivel`,d(t.grado_nivel)],[`Sabe leer`,t.sabe_leer?`Sí`:`No`],[`Sabe escribir`,t.sabe_escribir?`Sí`:`No`]],y),y=v(e,y,20,n,r,i),y=g(e,`SALUD`,y),y=_(e,[[`Alergias`,t.tiene_alergias?d(t.alergias_descripcion):`No`],[`Cond. transmisible`,t.tiene_condicion_transmisible?d(t.condicion_transmisible_descripcion):`No`],[`Alerg. medicamento`,t.alergia_medicamento?d(t.alergia_medicamento_descripcion):`No`],[`Conducta`,d(t.problemas_conducta)]],y),h(e,n.n)}function b(e,t=`Fichas Técnicas — Lote`){if(!e||e.length===0)throw Error(`No hay alumnos para generar el lote`);let i=new n({unit:`mm`,format:`letter`}),a={n:1},s=m(i,t,`Generado: ${u()}`);return i.setFont(`helvetica`,`bold`),i.setFontSize(11),i.setTextColor(...o.azul),i.text(`Total de alumnos: ${e.length}`,l,s+8),s+=16,r(i,{startY:s,margin:{left:l,right:l},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Nivel`,`Representante`]],headStyles:{fillColor:o.azul,textColor:o.blanco,fontStyle:`bold`,fontSize:8},styles:{fontSize:7.5,cellPadding:{top:1.5,bottom:1.5,left:2.5,right:2.5}},alternateRowStyles:{fillColor:o.grisClaro},body:e.map((e,t)=>[t+1,d(e.nombre_completo),d(e.instrumento_principal),d(e.nivel_actual),d(e.representante_nombre)])}),h(i,1),e.forEach(e=>y(i,e,a)),i}function x(e,t){let n=b(e,t),r=new Date().toISOString().slice(0,10);n.save(`fichas-lote-${r}.pdf`)}var S={azul:[20,60,130],azulMedio:[40,90,170],azulClaro:[220,232,250],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],verde:[20,120,60],verdeClaro:[220,245,230],rojo:[180,20,20],naranja:[180,90,20],morado:[90,40,140],moradoClaro:[240,230,250]},C=215.9,w=279.4,T=14;function E(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function D(e,t=`—`){return String(e??``).trim()||t}function O(e){if(!e)return`—`;try{let t=(e+``).slice(0,10).split(`-`);return`${t[2]}/${t[1]}/${t[0]}`}catch{return e}}function k(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function A(e){if(!e||typeof e!=`string`)return[];let t=[],n=/\[([^\]]+)\]/g,r;for(;(r=n.exec(e))!==null;){let e=r[1].trim();e&&t.push(e)}return t}function j(e){if(!e)return null;let t=e.match(/\b(\d+(?:\.\d+)?)\s*\/\s*(\d+)\b/);return t?`${t[1]}/${t[2]}`:null}function M(e,t,n=``){return e.setFillColor(...S.azul),e.rect(0,0,C,32,`F`),e.setFillColor(...S.dorado),e.rect(0,32,C,2.5,`F`),e.setFillColor(...S.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...S.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,T+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,T+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...S.dorado),e.text(t,C-T,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,C-T,20,{align:`right`})),e.setTextColor(...S.grisOscuro),38}function N(e){let t=e.internal.getNumberOfPages();for(let n=1;n<=t;n++)e.setPage(n),e.setFillColor(...S.azul),e.rect(0,w-12,C,12,`F`),e.setFillColor(...S.dorado),e.rect(0,w-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...S.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,T+2,w-4.5),e.text(`Pág. ${n} / ${t}`,C-T,w-4.5,{align:`right`})}function P(e,t,n,r=S.azul){return e.setFillColor(...r),e.rect(T,n,C-T*2,7,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8.5),e.setTextColor(...S.blanco),e.text(t,T+3,n+4.8),e.setTextColor(...S.grisOscuro),n+9}function F(e,t,n,i=52){return r(e,{startY:n,margin:{left:T,right:T},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:S.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:S.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:i,fillColor:S.azulClaro,textColor:S.azul}},body:t}),e.lastAutoTable.finalY+3}function I(e,t,n){return e.setFont(`helvetica`,`italic`),e.setFontSize(8),e.setTextColor(...S.grisMedio),e.text(t,T,n+5),e.setTextColor(...S.grisOscuro),n+10}function L(e,t,n,r,i,a){return t+n>w-22?(e.setFillColor(...S.azul),e.rect(0,w-12,C,12,`F`),e.setFillColor(...S.dorado),e.rect(0,w-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...S.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,T+2,w-4.5),e.text(`Pág. ${r.n}`,C-T,w-4.5,{align:`right`}),r.n++,e.addPage(),M(e,i,`Expediente: ${a}`)):t}function ee(e,t,n,r,i){let a=D(t.nombre_completo)===`—`?D(t.nombre):D(t.nombre_completo);n=L(e,n,10,r,i,a),n=P(e,`1. DATOS PERSONALES Y REPRESENTANTE`,n,S.azul),e.setFillColor(...S.azulClaro),e.roundedRect(T,n,C-T*2,18,2,2,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(13),e.setTextColor(...S.azul),e.text(a,T+4,n+7),e.setFont(`helvetica`,`normal`),e.setFontSize(8.5),e.setTextColor(...S.grisMedio);let o=D(t.instrumento_principal)===`—`?D(t.instrumento):D(t.instrumento_principal),s=[`Edad: ${k(t.fecha_nacimiento)}`,`Instrumento: ${o}`,`Nivel: ${D(t.nivel_actual)}`].join(`    ·    `);return e.text(s,T+4,n+14),e.setTextColor(...S.grisOscuro),n+=22,n=F(e,[[`Nombre completo`,a],[`Fecha nacimiento`,O(t.fecha_nacimiento)],[`Edad`,k(t.fecha_nacimiento)],[`Género`,D(t.genero)],[`Nacionalidad`,D(t.nacionalidad)],[`Municipio`,D(t.municipio_residencia)],[`Dirección`,D(t.sector_calle_numero??t.direccion)],[`Tel. alumno`,D(t.tlf_alumno)],[`Centro estudios`,D(t.centro_estudios)],[`Grado/Nivel`,D(t.grado_nivel)]],n),n=L(e,n,25,r,i,a),n=F(e,[[`Representante`,D(t.representante_nombre)],[`Parentesco`,D(t.representante_parentesco)],[`Cédula`,D(t.representante_cedula)],[`Teléfono`,D(t.representante_tlf)],[`Correo`,D(t.correo_representante)],[`Madre`,D(t.madre_nombre)],[`Tel. madre`,D(t.madre_tlf_whatsapp)],[`Padre`,D(t.padre_nombre)],[`Tel. padre`,D(t.padre_tlf_whatsapp)]],n),n}function te(e,t,n,i,a,o,s){let c=D(n.nombre_completo)===`—`?D(n.nombre):D(n.nombre_completo);if(i=L(e,i,15,a,o,c),i=P(e,`${s}. HISTORIAL DE ASISTENCIAS`,i,S.verde),!t||t.length===0)return I(e,`Sin registros de asistencia.`,i);let l=t.filter(e=>(e.estado??(e.asistio?`presente`:`ausente`))===`presente`).length,u=t.filter(e=>(e.estado??(e.asistio?`presente`:`ausente`))===`ausente`).length,d=t.filter(e=>e.estado===`justificado`).length,f=t.length,p=f>0?Math.round(l/f*100):0;return e.setFillColor(...S.verdeClaro),e.rect(T,i,C-T*2,10,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...S.verde),e.text(`Total: ${f} clases  ·  Presentes: ${l} (${p}%)  ·  Ausentes: ${u}  ·  Justificados: ${d}`,T+3,i+6.5),e.setTextColor(...S.grisOscuro),i+=13,r(e,{startY:i,margin:{left:T,right:T},theme:`grid`,head:[[`Fecha`,`Estado`,`Qué trabajaron en clase`,`Observación del alumno`]],headStyles:{fillColor:S.verde,textColor:S.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.8,bottom:1.8,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:S.grisClaro},columnStyles:{0:{cellWidth:20},1:{cellWidth:22},2:{cellWidth:88}},body:t.map(e=>{let t=e.estado??(e.asistio?`presente`:`ausente`),n=e.sesion??e.sesiones_clase??null,r=`—`;if(n){let e=D(n.tema_principal),t=A(n.contenido_dsl??n.contenido??``);t.length>0?r=t.join(`
`):e===`—`?n.contenido&&(r=n.contenido.slice(0,120)):r=e}return[O(e.fecha),t.charAt(0).toUpperCase()+t.slice(1),r,D(e.observaciones??e.justificacion_texto)]})}),e.lastAutoTable.finalY+4}function ne(e,t,n,i,a,o,s){let c=D(n.nombre_completo)===`—`?D(n.nombre):D(n.nombre_completo);if(i=L(e,i,15,a,o,c),i=P(e,`${s}. PROGRESOS Y PARTICIPACIÓN`,i,S.azulMedio),!t||t.length===0)return I(e,`Sin registros de progresos.`,i);let l=t.filter(e=>e.calificacion!=null).map(e=>Number(e.calificacion)),u=l.length>0?(l.reduce((e,t)=>e+t,0)/l.length).toFixed(1):`—`;return e.setFillColor(...S.azulClaro),e.rect(T,i,C-T*2,10,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...S.azul),e.text(`Total: ${t.length} evaluaciones  ·  Promedio: ${u}`,T+3,i+6.5),e.setTextColor(...S.grisOscuro),i+=13,r(e,{startY:i,margin:{left:T,right:T},theme:`grid`,head:[[`Fecha`,`Tipo`,`Qué se evaluó`,`Participación`,`Calif.`,`Observaciones`]],headStyles:{fillColor:S.azulMedio,textColor:S.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.8,bottom:1.8,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:S.grisClaro},columnStyles:{0:{cellWidth:20},1:{cellWidth:22},2:{cellWidth:65},4:{cellWidth:12}},body:t.map(e=>{let t=A(e.contenido_dsl??``),n=t.length>0?t.join(`
`):D(e.contenido_dsl),r=j(e.contenido_dsl)??(e.calificacion==null?`—`:String(e.calificacion));return[O(e.fecha_evaluacion??e.fecha),D(e.evaluacion_tipo),n,D(e.estado_cualitativo),r,D(e.observaciones)]})}),e.lastAutoTable.finalY+4}function re(e,t,n,i,a,o,s){let c=D(n.nombre_completo)===`—`?D(n.nombre):D(n.nombre_completo);return i=L(e,i,15,a,o,c),i=P(e,`${s}. HISTORIAL DE OBSERVACIONES`,i,S.naranja),!t||t.length===0?I(e,`Sin observaciones registradas.`,i):(r(e,{startY:i,margin:{left:T,right:T},theme:`grid`,head:[[`Fecha`,`Tipo`,`Estado`,`Descripción / Seguimiento`]],headStyles:{fillColor:S.naranja,textColor:S.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.8,bottom:1.8,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:S.grisClaro},columnStyles:{0:{cellWidth:20},1:{cellWidth:25},2:{cellWidth:20}},body:t.map(e=>[O(e.created_at??e.fecha),D(e.tipo),D(e.estado),D(e.descripcion??e.texto??e.observacion)])}),e.lastAutoTable.finalY+4)}function R(e,t,n,i,a,o,s){let c=D(n.nombre_completo)===`—`?D(n.nombre):D(n.nombre_completo);i=L(e,i,15,a,o,c),i=P(e,`${s}. DOMINIO: ESCALAS, OBRAS Y TÉCNICAS`,i,S.morado);let l=t??[];if(l.length===0)return I(e,`Sin indicadores registrados.`,i);let u={Técnicas:[],"Escalas y Arpegios":[],"Repertorio / Obras":[],Otros:[]};l.forEach(e=>{let t=(e.indicador?.nodo?.name??e.nodo?.name??e.node_name??``).toUpperCase(),n=D(e.indicador?.description??e.description??e.indicador_id),r=O(e.covered_date??e.fecha??e.created_at),i=[n,e.nota==null?e.result?D(e.result):`—`:`${e.nota}/5`,r];/TÉCNICA|ARCO|MANO|DEDO|POSTURA|AFINAC|SONIDO/.test(t)?u.Técnicas.push(i):/ESCALA|ARPEGIO|PATRÓN/.test(t)?u[`Escalas y Arpegios`].push(i):/OBRA|REPERTORIO|ESTUDIO|PIEZA/.test(t)?u[`Repertorio / Obras`].push(i):u.Otros.push(i)});let d=Object.entries(u).filter(([,e])=>e.length>0);if(d.length===0)return I(e,`Sin indicadores dominados registrados.`,i);for(let[t,n]of d)i=L(e,i,18,a,o,c),e.setFillColor(...S.moradoClaro),e.rect(T,i,C-T*2,6,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(7.5),e.setTextColor(...S.morado),e.text(`${t} (${n.length})`,T+3,i+4.2),e.setTextColor(...S.grisOscuro),i+=7,r(e,{startY:i,margin:{left:T,right:T},theme:`grid`,head:[[`Descripción`,`Nota`,`Fecha`]],headStyles:{fillColor:S.morado,textColor:S.blanco,fontStyle:`bold`,fontSize:7},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2.5,right:2.5},overflow:`linebreak`},alternateRowStyles:{fillColor:S.grisClaro},columnStyles:{1:{cellWidth:18},2:{cellWidth:22}},body:n}),i=e.lastAutoTable.finalY+4;return i}function z(e,t={},r={}){let i=new n({unit:`mm`,format:`letter`}),a={n:1},o=D(e.nombre_completo)===`—`?D(e.nombre):D(e.nombre_completo),s=`EXPEDIENTE DEL ALUMNO`,c=M(i,s,`Generado: ${E()}`);i.setFont(`helvetica`,`bold`),i.setFontSize(55),i.setTextColor(235,240,252),i.text(`CONFIDENCIAL`,C/2,w/2,{align:`center`,angle:45}),i.setTextColor(...S.grisOscuro);let l=[t.ficha&&`Datos personales`,t.asistencias&&`Asistencias`,t.progresos&&`Progresos y participación`,t.observaciones&&`Observaciones`,t.dominio&&`Dominio: escalas, obras y técnicas`].filter(Boolean);i.setFont(`helvetica`,`bold`),i.setFontSize(8),i.setTextColor(...S.grisMedio),i.text(`Contenido: ${l.join(`  ·  `)}`,T,c+5),c+=12;let u=1;return t.ficha&&(c=ee(i,e,c,a,s),u++),t.asistencias&&(c=L(i,c,20,a,s,o),c=te(i,r.asistencias,e,c,a,s,u),u++),t.progresos&&(c=L(i,c,20,a,s,o),c=ne(i,r.progresos,e,c,a,s,u),u++),t.observaciones&&(c=L(i,c,20,a,s,o),c=re(i,r.observaciones,e,c,a,s,u),u++),t.dominio&&(c=L(i,c,20,a,s,o),c=R(i,r.indicadores,e,c,a,s,u)),N(i),i}function B(e,t,n){let r=z(e,t,n),i=(D(e.nombre_completo)===`—`?D(e.nombre):D(e.nombre_completo)).toLowerCase().replace(/\s+/g,`-`),a=new Date().toISOString().slice(0,10);r.save(`expediente-${i}-${a}.pdf`)}var V={azul:[20,60,130],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],azulClaro:[220,232,250]},H=14;function U(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function W(e,t=`—`){return String(e??``).trim()||t}function G(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function K(e,t,n=``){let r=e.internal.pageSize.getWidth();return e.setFillColor(...V.azul),e.rect(0,0,r,32,`F`),e.setFillColor(...V.dorado),e.rect(0,32,r,2.5,`F`),e.setFillColor(...V.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...V.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,H+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,H+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...V.dorado),e.text(t,r-H,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,r-H,20,{align:`right`})),e.setTextColor(...V.grisOscuro),42}function q(e){let t=e.internal.getNumberOfPages(),n=e.internal.pageSize.getHeight(),r=e.internal.pageSize.getWidth();for(let i=1;i<=t;i++)e.setPage(i),e.setFillColor(...V.azul),e.rect(0,n-12,r,12,`F`),e.setFillColor(...V.dorado),e.rect(0,n-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...V.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,H+2,n-4.5),e.text(`Pág. ${i} / ${t}`,r-H,n-4.5,{align:`right`})}function J(e,t=``){let i=new n({unit:`mm`,format:`letter`,orientation:`landscape`}),a=t||U(),o=K(i,`LISTA DE ALUMNOS ACTIVOS`,a);return i.setFont(`helvetica`,`normal`),i.setFontSize(8.5),i.setTextColor(...V.grisMedio),i.text(`Total: ${e.length} alumno(s)   ·   Generado: ${U()}`,H,o),o+=6,r(i,{startY:o,margin:{left:H,right:H},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Nivel`,`Representante`,`Teléfono`,`Correo`,`Inscrito`]],headStyles:{fillColor:V.azul,textColor:V.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:V.grisClaro},columnStyles:{0:{cellWidth:8},6:{cellWidth:45}},body:e.map((e,t)=>[t+1,W(e.nombre_completo),W(e.instrumento_principal),W(e.nivel_actual),W(e.representante_nombre),W(e.representante_tlf),W(e.correo_representante),G(e.created_at)]),didDrawPage:()=>K(i,`LISTA DE ALUMNOS ACTIVOS`,a)}),q(i),i}function ie(e,t){let n=J(e,t),r=new Date().toISOString().slice(0,10);n.save(`lista-alumnos-${r}.pdf`)}function ae(e,t,i){let a=new n({unit:`mm`,format:`letter`,orientation:`landscape`}),o=`${G(t)} — ${G(i)}`,s=K(a,`ALUMNOS INSCRITOS`,o);return a.setFont(`helvetica`,`normal`),a.setFontSize(8.5),a.setTextColor(...V.grisMedio),a.text(`Total: ${e.length} alumno(s) en el período   ·   Generado: ${U()}`,H,s),s+=6,r(a,{startY:s,margin:{left:H,right:H},theme:`grid`,head:[[`#`,`Nombre`,`Instrumento`,`Representante`,`Teléfono`,`Correo`,`Fecha inscripción`]],headStyles:{fillColor:V.azul,textColor:V.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:V.grisClaro},columnStyles:{0:{cellWidth:8},5:{cellWidth:45}},body:e.map((e,t)=>[t+1,W(e.nombre_completo),W(e.instrumento_principal),W(e.representante_nombre),W(e.representante_tlf),W(e.correo_representante),G(e.created_at)]),didDrawPage:()=>K(a,`ALUMNOS INSCRITOS`,o)}),q(a),a}function oe(e,t,n){ae(e,t,n).save(`inscritos-${t}-a-${n}.pdf`)}function se(e){let t=new n({unit:`mm`,format:`letter`,orientation:`landscape`}),i=K(t,`DIRECTORIO DE MAESTROS`,U());return t.setFont(`helvetica`,`normal`),t.setFontSize(8.5),t.setTextColor(...V.grisMedio),t.text(`Total: ${e.length} maestro(s)   ·   Generado: ${U()}`,H,i),i+=6,r(t,{startY:i,margin:{left:H,right:H},theme:`grid`,head:[[`#`,`Nombre`,`Especialidad`,`Correo`,`Teléfono`,`Clases asignadas`,`Reseña`]],headStyles:{fillColor:V.azul,textColor:V.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:V.grisClaro},columnStyles:{0:{cellWidth:8},5:{cellWidth:50},6:{cellWidth:55}},body:e.map((e,t)=>{let n=Array.isArray(e.clases)&&e.clases.length?e.clases.map(e=>e.nombre??e).join(`
`):`—`;return[t+1,W(e.nombre),W(e.instrumento),W(e.email),W(e.telefono),n,W(e.bio)]}),didDrawPage:()=>K(t,`DIRECTORIO DE MAESTROS`,U())}),q(t),t}function ce(e){let t=se(e),n=new Date().toISOString().slice(0,10);t.save(`maestros-${n}.pdf`)}var Y=[],X=null;async function le(e){e.innerHTML=`
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

        </div>
      </div>
    </div>
  `;try{Y=await t()}catch{Y=[]}X=null,he(e)}function Z(e,t=`—`){return String(e??``).trim()||t}function Q(e,t,n=!1){let r=document.getElementById(e);r&&(r.textContent=t,r.className=n?`text-danger small`:`text-muted small`)}function $(e,t){let n=document.getElementById(e);n&&(n.disabled=t,t?(n.dataset.originalHtml=n.innerHTML,n.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`):n.innerHTML=n.dataset.originalHtml||n.innerHTML)}function ue(e){let t=e.querySelector(`#exp-buscar`),n=e.querySelector(`#exp-resultados`),r=e.querySelector(`#exp-alumno-chip`),i=e.querySelector(`#exp-opciones`),a=e.querySelector(`#exp-alumno-nombre`),o=e.querySelector(`#exp-limpiar`);t.addEventListener(`input`,()=>{let e=t.value.trim().toLowerCase();if(e.length<1){n.style.display=`none`;return}let o=Y.filter(t=>{let n=(Z(t.nombre_completo)+` `+Z(t.nombre)).toLowerCase(),r=(Z(t.instrumento_principal)+` `+Z(t.instrumento)).toLowerCase(),i=(Z(t.representante_cedula)+` `+Z(t.cedula)).toLowerCase();return n.includes(e)||r.includes(e)||i.includes(e)}).slice(0,12);o.length===0?n.innerHTML=`<div class="list-group-item text-muted small">Sin resultados</div>`:(n.innerHTML=o.map(e=>{let t=Z(e.nombre_completo)===`—`?Z(e.nombre):Z(e.nombre_completo),n=Z(e.instrumento_principal)===`—`?Z(e.instrumento):Z(e.instrumento_principal);return`
        <button type="button" class="list-group-item list-group-item-action py-2 px-3"
          data-id="${e.id}">
          <span class="fw-semibold">${t}</span>
          <span class="text-muted small ms-2">${n}</span>
        </button>
        `}).join(``),n.querySelectorAll(`button`).forEach(e=>{e.addEventListener(`click`,()=>{let o=Y.find(t=>t.id===e.dataset.id);o&&de(o,t,n,r,a,i)})})),n.style.display=`block`}),document.addEventListener(`click`,e=>{!n.contains(e.target)&&e.target!==t&&(n.style.display=`none`)},{capture:!0}),o.addEventListener(`click`,()=>{X=null,t.value=``,r.style.display=`none`,i.style.display=`none`,t.focus()})}function de(e,t,n,r,i,a){X=e,t.value=``,n.style.display=`none`,i.textContent=Z(e.nombre_completo)===`—`?Z(e.nombre):Z(e.nombre_completo),r.style.display=`block`,a.style.display=`block`}async function fe(t){let{data:n,error:r}=await e.from(`asistencias`).select(`*, sesion:sesiones_clase(fecha, contenido_dsl, contenido, tema_principal)`).eq(`alumno_id`,t).order(`fecha`,{ascending:!1});if(r)throw Error(`Asistencias: ${r.message}`);return n??[]}async function pe(t){let{data:n,error:r}=await e.from(`observaciones`).select(`*`).eq(`alumno_id`,t).order(`created_at`,{ascending:!1});if(r)throw Error(`Observaciones: ${r.message}`);return n??[]}async function me(t){let{data:n,error:r}=await e.from(`indicator_attempts`).select(`*, indicador:indicators(description, nodo:nodes(name, is_critical))`).or(`alumno_id.eq.${t},student_id.eq.${t}`).order(`created_at`,{ascending:!1});return r?[]:n??[]}function he(e){ue(e),e.querySelector(`#btn-expediente`).addEventListener(`click`,async()=>{if(!X){Q(`exp-status`,`Seleccioná un alumno primero.`,!0);return}let e={ficha:document.getElementById(`sec-ficha`).checked,asistencias:document.getElementById(`sec-asistencias`).checked,progresos:document.getElementById(`sec-progresos`).checked,observaciones:document.getElementById(`sec-observaciones`).checked,dominio:document.getElementById(`sec-dominio`).checked};if(!Object.values(e).some(Boolean)){Q(`exp-status`,`Seleccioná al menos una sección.`,!0);return}$(`btn-expediente`,!0),Q(`exp-status`,`Cargando datos...`);try{let t=X.id,n={},r=[];e.asistencias&&r.push(fe(t).then(e=>{n.asistencias=e})),e.progresos&&r.push(i(t).then(e=>{n.progresos=e})),e.observaciones&&r.push(pe(t).then(e=>{n.observaciones=e})),e.dominio&&r.push(me(t).then(e=>{n.indicadores=e})),await Promise.all(r),B(X,e,n),Q(`exp-status`,`✓ Expediente descargado`)}catch(e){Q(`exp-status`,`Error: ${e.message}`,!0)}finally{$(`btn-expediente`,!1)}}),e.querySelector(`#btn-fichas-lote`).addEventListener(`click`,async()=>{$(`btn-fichas-lote`,!0),Q(`fichas-status`,`Cargando alumnos...`);try{let e=document.getElementById(`fichas-filtro`).value,t=document.getElementById(`fichas-instrumento`).value.trim().toLowerCase(),n=e===`activos`?Y.filter(e=>e.is_active!==!1):Y;if(t&&(n=n.filter(e=>Z(e.instrumento_principal).toLowerCase().includes(t))),n.length===0){Q(`fichas-status`,`Sin alumnos con ese filtro.`,!0);return}Q(`fichas-status`,`Generando ${n.length} ficha(s)...`);let r=[`Fichas Técnicas`];e===`activos`&&r.push(`Alumnos Activos`),t&&r.push(t.charAt(0).toUpperCase()+t.slice(1)),x(n,r.join(` — `)),Q(`fichas-status`,`✓ ${n.length} ficha(s) descargadas`)}catch(e){Q(`fichas-status`,`Error: ${e.message}`,!0)}finally{$(`btn-fichas-lote`,!1)}}),e.querySelector(`#btn-lista-alumnos`).addEventListener(`click`,async()=>{$(`btn-lista-alumnos`,!0),Q(`lista-status`,`Filtrando...`);try{let e=document.getElementById(`lista-instrumento`).value.trim().toLowerCase(),t=document.getElementById(`lista-nivel`).value.trim().toLowerCase(),n=Y.filter(e=>e.is_active!==!1);if(e&&(n=n.filter(t=>Z(t.instrumento_principal).toLowerCase().includes(e))),t&&(n=n.filter(e=>Z(e.nivel_actual).toLowerCase().includes(t))),n.length===0){Q(`lista-status`,`Sin alumnos con ese filtro.`,!0);return}let r=[`Todos los activos`];e&&(r[0]=`Instrumento: ${e}`),t&&r.push(`Nivel: ${t}`),ie(n,r.join(`  ·  `)),Q(`lista-status`,`✓ ${n.length} alumno(s)`)}catch(e){Q(`lista-status`,`Error: ${e.message}`,!0)}finally{$(`btn-lista-alumnos`,!1)}}),e.querySelector(`#btn-inscritos-rango`).addEventListener(`click`,async()=>{let e=document.getElementById(`rango-desde`).value,t=document.getElementById(`rango-hasta`).value,n=document.getElementById(`rango-instrumento`).value.trim().toLowerCase();if(!e||!t){Q(`rango-status`,`Seleccioná ambas fechas.`,!0);return}if(e>t){Q(`rango-status`,`"Desde" debe ser anterior a "Hasta".`,!0);return}$(`btn-inscritos-rango`,!0),Q(`rango-status`,`Filtrando...`);try{let r=Y.filter(n=>{let r=(n.created_at??``).slice(0,10);return r>=e&&r<=t});if(n&&(r=r.filter(e=>Z(e.instrumento_principal).toLowerCase().includes(n))),r.length===0){Q(`rango-status`,`Sin alumnos en ese rango.`,!0);return}oe(r,e,t),Q(`rango-status`,`✓ ${r.length} alumno(s)`)}catch(e){Q(`rango-status`,`Error: ${e.message}`,!0)}finally{$(`btn-inscritos-rango`,!1)}}),e.querySelector(`#btn-maestros`).addEventListener(`click`,async()=>{$(`btn-maestros`,!0),Q(`maestros-status`,`Cargando...`);try{let e=await a();if(e.length===0){Q(`maestros-status`,`Sin maestros.`,!0);return}ce(e),Q(`maestros-status`,`✓ ${e.length} maestro(s)`)}catch(e){Q(`maestros-status`,`Error: ${e.message}`,!0)}finally{$(`btn-maestros`,!1)}})}export{le as renderExportView};