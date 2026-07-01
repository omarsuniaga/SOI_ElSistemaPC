import{r as e}from"./rolldown-runtime-DlOssbPu.js";import"./modulepreload-polyfill-Ke7zwH0v.js";import{i as t}from"./supabase-KnARm58N.js";import{t as n}from"./vendor-CtPF6k7y.js";import{t as r}from"./preload-helper-BQrMkyGX.js";import{t as i}from"./config-EAsd4M2K.js";import{b as a,f as o,p as s,r as c,u as l}from"./tareasApi-CG6j5SPo.js";import{t as u}from"./tareasView-IF_FHNQu.js";import{a as d,i as f,n as p,r as m,t as h}from"./instrumentosApi-BC8lM_7y.js";var g=e({actualizarAccesorio:()=>oe,actualizarActivo:()=>te,actualizarReparacion:()=>pe,anularFactura:()=>be,cambiarEstadoActivo:()=>ne,cambiarEstadoReparacion:()=>me,crearAccesorio:()=>ae,crearActivo:()=>ee,crearComodato:()=>Oe,crearEventoManual:()=>le,crearFacturaReparacion:()=>ve,crearReparacion:()=>fe,devolverComodato:()=>ke,eliminarAccesorio:()=>se,eliminarReparacion:()=>he,generarContratoPDF:()=>Te,generarReporte:()=>Ee,intercambiarInstrumentos:()=>Ce,obtenerAccesorios:()=>ie,obtenerActivoPorId:()=>y,obtenerActivos:()=>v,obtenerActivosOciosos:()=>Me,obtenerComodatosActivos:()=>je,obtenerComodatosAlumno:()=>Ae,obtenerComodatosPorVencer:()=>Se,obtenerComodatosVencidos:()=>xe,obtenerFactura:()=>_e,obtenerFacturasReparacion:()=>ge,obtenerHistorialActivo:()=>ce,obtenerKPI:()=>De,obtenerReparacion:()=>de,obtenerReparaciones:()=>ue,registrarPagoFactura:()=>ye,renovarComodato:()=>we,subirContratoComodato:()=>Ne,subirFotoActivo:()=>re});function _(e){return{data:null,error:e?{code:e.code||500,message:e.message||`Error interno`}:null}}async function v(e={}){try{let n=t.from(`inventario_activos`).select(`*`,{count:`exact`}).eq(`activo`,!0).order(`codigo_inventario`);if(e.estado_uso&&(n=n.eq(`estado_uso`,e.estado_uso)),e.tipo_instrumento&&(n=n.ilike(`tipo_instrumento`,`%`+e.tipo_instrumento+`%`)),e.estado_conservacion&&(n=n.eq(`estado_conservacion`,e.estado_conservacion)),e.ubicacion&&(n=n.ilike(`ubicacion`,`%`+e.ubicacion+`%`)),e.q){let t=e.q.toLowerCase();n=n.or(`codigo_inventario.ilike.%`+t+`%,tipo_instrumento.ilike.%`+t+`%,marca.ilike.%`+t+`%,modelo.ilike.%`+t+`%`)}if(e.page&&e.pageSize){let t=(e.page-1)*e.pageSize;n=n.range(t,t+e.pageSize-1)}let{data:r,error:i,count:a}=await n;return i?_(i):{data:r,total:a,error:null}}catch(e){return _(e)}}async function y(e){try{let{data:n,error:r}=await t.from(`inventario_activos`).select(`*, inventario_accesorios(*), comodatos_activos!inner(*)`).eq(`id`,e).single();return r?_(r):n?{data:n,error:null}:{data:null,error:{code:404,message:`Activo no encontrado`}}}catch(e){return _(e)}}async function ee(e){try{let{data:n,error:r}=await t.from(`inventario_activos`).insert([e]).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function te(e,n){try{let{data:r,error:i}=await t.from(`inventario_activos`).update(n).eq(`id`,e).select().single();return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function ne(e,n){try{let{data:r,error:i}=await t.rpc(`cambiar_estado_activo`,{p_id:e,p_nuevo_estado:n});return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function re(e,n){try{let r=n.name?n.name.split(`.`).pop():`jpg`,i=`activos/`+e+`/foto.`+r,{error:a}=await t.storage.from(`inventario`).upload(i,n,{upsert:!0});if(a)return _(a);let{data:o}=t.storage.from(`inventario`).getPublicUrl(i),{data:s,error:c}=await t.from(`inventario_activos`).update({foto_url:o.publicUrl}).eq(`id`,e).select().single();return c?_(c):{data:s,error:null}}catch(e){return _(e)}}async function ie(e){try{let n=t.from(`inventario_accesorios`).select(`*, inventario_activos!inner(codigo_inventario, tipo_instrumento)`).order(`created_at`,{ascending:!1});e&&(n=n.eq(`activo_id`,e));let{data:r,error:i}=await n;return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function ae(e){try{let{data:n,error:r}=await t.from(`inventario_accesorios`).insert([e]).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function oe(e,n){try{let{data:r,error:i}=await t.from(`inventario_accesorios`).update(n).eq(`id`,e).select().single();return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function se(e){try{let{data:n,error:r}=await t.from(`inventario_accesorios`).delete().eq(`id`,e).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function ce(e,n={}){try{let r=t.from(`inventario_historial`).select(`*`).eq(`activo_id`,e).order(`fecha`,{ascending:!1});n.tipo_evento&&(r=r.eq(`tipo_evento`,n.tipo_evento)),n.limit&&(r=r.limit(n.limit));let{data:i,error:a}=await r;return a?_(a):{data:i,error:null}}catch(e){return _(e)}}async function le(e){try{let{data:n,error:r}=await t.from(`inventario_historial`).insert([{activo_id:e.activo_id,tipo_evento:e.tipo_evento,descripcion:e.descripcion,usuario_id:e.usuario_id||null,metadata:e.metadata||null}]).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function ue(e={}){try{let n=t.from(`inventario_reparaciones`).select(`*, inventario_activos!inner(codigo_inventario, tipo_instrumento, marca)`).order(`created_at`,{ascending:!1});e.estado&&(n=n.eq(`estado`,e.estado)),e.activo_id&&(n=n.eq(`activo_id`,e.activo_id)),e.desde&&(n=n.gte(`fecha_ingreso`,e.desde)),e.hasta&&(n=n.lte(`fecha_ingreso`,e.hasta));let{data:r,error:i}=await n;return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function de(e){try{let{data:n,error:r}=await t.from(`inventario_reparaciones`).select(`*, inventario_activos!inner(codigo_inventario, tipo_instrumento, marca, modelo)`).eq(`id`,e).single();return r?_(r):n?{data:n,error:null}:{data:null,error:{code:404,message:`Reparación no encontrada`}}}catch(e){return _(e)}}async function fe(e){try{let{data:n,error:r}=await t.rpc(`crear_reparacion`,{p_activo_id:e.activo_id,p_tipo_tallerista:e.tipo_tallerista,p_tallerista_nombre:e.tallerista_nombre,p_descripcion:e.descripcion,p_costo_estimado:e.costo_estimado,p_proveedor_factura_url:e.proveedor_factura_url});return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function pe(e,n){try{let{data:r,error:i}=await t.from(`inventario_reparaciones`).update(n).eq(`id`,e).select().single();return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function me(e,n){try{let{data:r,error:i}=await t.rpc(`cambiar_estado_reparacion`,{p_id:e,p_nuevo_estado:n});return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function he(e){try{let{data:n,error:r}=await t.from(`inventario_reparaciones`).delete().eq(`id`,e).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function ge(e={}){try{let n=t.from(`facturas_reparacion`).select(`*, inventario_reparaciones!inner(activo_id, descripcion)`).order(`created_at`,{ascending:!1});e.estado_pago&&(n=n.eq(`estado_pago`,e.estado_pago)),e.tipo_factura&&(n=n.eq(`tipo_factura`,e.tipo_factura)),e.desde&&(n=n.gte(`fecha_emision`,e.desde)),e.hasta&&(n=n.lte(`fecha_emision`,e.hasta));let{data:r,error:i}=await n;return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function _e(e){try{let{data:n,error:r}=await t.from(`facturas_reparacion`).select(`*, inventario_reparaciones!inner(*)`).eq(`id`,e).single();return r?_(r):n?{data:n,error:null}:{data:null,error:{code:404,message:`Factura no encontrada`}}}catch(e){return _(e)}}async function ve(e){try{let{data:n,error:r}=await t.from(`facturas_reparacion`).insert([e]).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function ye(e,n={}){try{let r={estado_pago:`pagado`,fecha_pago:n.fecha_pago||new Date().toISOString().split(`T`)[0]};n.metodo_pago&&(r.metodo_pago=n.metodo_pago);let{data:i,error:a}=await t.from(`facturas_reparacion`).update(r).eq(`id`,e).eq(`estado_pago`,`pendiente`).select().single();return a?_(a):i?{data:i,error:null}:{data:null,error:{code:400,message:`Factura no encontrada o ya no está pendiente`}}}catch(e){return _(e)}}async function be(e){try{let{data:n,error:r}=await t.from(`facturas_reparacion`).update({estado_pago:`anulada`}).eq(`id`,e).eq(`estado_pago`,`pendiente`).select().single();return r?_(r):n?{data:n,error:null}:{data:null,error:{code:400,message:`Factura no encontrada o no está pendiente`}}}catch(e){return _(e)}}async function xe(){try{let e=new Date().toISOString().split(`T`)[0],{data:n,error:r}=await t.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca), alumnos(nombre_completo)`).eq(`estado`,`activo`).lt(`fecha_vencimiento`,e).order(`fecha_vencimiento`,{ascending:!0});return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function Se(e=7){try{let n=new Date().toISOString().split(`T`)[0],r=new Date;r.setDate(r.getDate()+e);let i=r.toISOString().split(`T`)[0],{data:a,error:o}=await t.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca), alumnos(nombre_completo)`).eq(`estado`,`activo`).gte(`fecha_vencimiento`,n).lte(`fecha_vencimiento`,i).order(`fecha_vencimiento`,{ascending:!0});return o?_(o):{data:a,error:null}}catch(e){return _(e)}}async function Ce(e,n,r){try{let{data:i,error:a}=await t.rpc(`intercambiar_instrumentos`,{p_comodato_origen_id:e,p_activo_destino_id:n,p_alumno_id:r});return a?_(a):{data:i,error:null}}catch(e){return _(e)}}async function we(e,n){try{let{data:r,error:i}=await t.rpc(`renovar_comodato`,{p_comodato_id:e,p_nueva_fecha_vencimiento:n?.fecha_vencimiento,p_nuevo_tipo:n?.tipo_comodato});return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function Te(e){try{let{data:n,error:r}=await t.rpc(`generar_contrato_pdf`,{p_comodato_id:e});return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function Ee(e,n={}){try{let{data:r,error:i}=await t.rpc(`generar_reporte_inventario`,{p_tipo:e,p_filtros:n});return i?_(i):{data:r,error:null}}catch(e){return _(e)}}async function De(){try{let{data:e,error:n}=await t.rpc(`obtener_kpi_inventario`);return n?_(n):{data:e,error:null}}catch(e){return _(e)}}async function Oe(e){try{let{data:n,error:r}=await t.from(`comodatos_activos`).insert([e]).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function ke(e){try{let{data:n,error:r}=await t.from(`comodatos_activos`).update({estado:`devuelto`,fecha_devolucion:new Date().toISOString().split(`T`)[0]}).eq(`id`,e).select().single();return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function Ae(e){try{let{data:n,error:r}=await t.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca, modelo)`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1});return r?_(r):{data:n,error:null}}catch(e){return _(e)}}async function je(){try{let{data:e,error:n}=await t.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca, modelo), alumnos(nombre_completo)`).eq(`estado`,`activo`).order(`fecha_entrega`,{ascending:!1});return n?_(n):{data:e,error:null}}catch(e){return _(e)}}async function Me(){try{let{data:e,error:n}=await t.from(`vw_activos_ociosos`).select(`*`).order(`dias_prestado`,{ascending:!1});return n?_(n):{data:e,error:null}}catch(e){return _(e)}}async function Ne(e,n){try{let r=`comodatos/`+e+`/contrato.pdf`,{error:i}=await t.storage.from(`documentos`).upload(r,n,{upsert:!0,contentType:`application/pdf`});if(i)return _(i);let{data:a}=t.storage.from(`documentos`).getPublicUrl(r),{data:o,error:s}=await t.from(`comodatos_activos`).update({contrato_firmado_url:a.publicUrl}).eq(`id`,e).select().single();return s?_(s):{data:o,error:null}}catch(e){return _(e)}}var Pe=[`disponible`,`prestado`,`en_mantenimiento`,`en_reparacion`,`de_baja`],Fe={disponible:[`prestado`,`en_mantenimiento`,`en_reparacion`,`de_baja`],prestado:[`disponible`,`en_mantenimiento`,`en_reparacion`],en_mantenimiento:[`disponible`,`en_reparacion`],en_reparacion:[`disponible`,`en_mantenimiento`],de_baja:[]};function Ie(e,t){let n=Fe[e];return n?n.includes(t):!1}function Le(e){let t=[];return e.tipo_instrumento||t.push(`tipo_instrumento es requerido`),e.codigo_inventario?/^V8-[A-Z]{3,4}-\d{3,}$/.test(e.codigo_inventario)||t.push(`codigo_inventario debe tener formato V8-XXX-001`):t.push(`codigo_inventario es requerido`),e.estado_uso&&!Pe.includes(e.estado_uso)&&t.push(`estado_uso inválido: ${e.estado_uso}`),e.estado_conservacion&&![`excelente`,`bueno`,`regular`,`mantenimiento`,`de_baja`].includes(e.estado_conservacion)&&t.push(`estado_conservacion inválido: ${e.estado_conservacion}`),e.valor_adquisicion!=null&&e.valor_adquisicion<0&&t.push(`valor_adquisicion no puede ser negativo`),t}function b(e){if(!e.fecha_adquisicion)return null;let t=new Date(e.fecha_adquisicion),n=new Date,r=n.getFullYear()-t.getFullYear(),i=n.getMonth()-t.getMonth();return i<0||i===0&&n.getDate()<t.getDate()?r-1:r}function Re(e){return!(!e.activo||e.estado_uso===`prestado`||e.estado_uso===`en_reparacion`||e.estado_uso===`de_baja`)}function ze(e){return e.activo?e.estado_uso===`prestado`?`El instrumento está en comodato activo.`:e.estado_uso===`en_reparacion`?`El instrumento está en reparación.`:e.estado_uso===`de_baja`?`El instrumento ya está dado de baja.`:null:`Instrumento inactivo o dado de baja del sistema.`}function Be(e){if(e.valor_adquisicion==null)return null;if(!e.fecha_adquisicion)return e.valor_adquisicion;let t=b(e);if(t>=10)return 0;let n=e.valor_adquisicion/10*t;return Math.max(0,e.valor_adquisicion-n)}function x(e){return{excelente:`badge bg-success`,bueno:`badge bg-primary`,regular:`badge bg-warning text-dark`,mantenimiento:`badge bg-orange text-dark`,de_baja:`badge bg-danger`}[e]??`badge bg-secondary`}function S(e){return{disponible:`badge bg-success`,prestado:`badge bg-info text-dark`,en_mantenimiento:`badge bg-warning text-dark`,en_reparacion:`badge bg-danger`,de_baja:`badge bg-dark`}[e]??`badge bg-secondary`}var Ve=[`funda`,`arco`,`cuerdas`,`boquilla`,`atril`,`parlante`,`cable`,`otro`];function He(e){let t=[];return e.tipo?Ve.includes(e.tipo)||t.push(`tipo inválido: ${e.tipo}. Válidos: ${Ve.join(`, `)}`):t.push(`tipo es requerido`),e.activo_id||t.push(`activo_id es requerido`),(!e.cantidad||e.cantidad<=0)&&t.push(`cantidad debe ser mayor a 0`),t}var C=[`asignacion`,`devolucion`,`reparacion`,`cambio_estado`,`baja`,`creacion`,`observacion`],Ue={asignacion:`bi-clipboard-check`,devolucion:`bi-box-arrow-left`,reparacion:`bi-tools`,cambio_estado:`bi-arrow-repeat`,baja:`bi-trash`,creacion:`bi-plus-circle`,observacion:`bi-chat-dots`},We=0;function Ge(){return We++,`evt-${Date.now()}-${We}`}function w(e,t,n,r,i){if(!C.includes(t))throw Error(`tipo_evento inválido: ${t}. Válidos: ${C.join(`, `)}`);return{id:Ge(),activo_id:e,tipo_evento:t,descripcion:n,fecha:new Date().toISOString(),usuario_id:r||null,metadata:i||null}}function Ke(e){let t=new Date(e.fecha).toLocaleDateString(`es-DO`,{year:`numeric`,month:`long`,day:`numeric`,hour:`2-digit`,minute:`2-digit`});return{...e,icono:Ue[e.tipo_evento]||`bi-question-circle`,fecha_legible:t,tipo_label:e.tipo_evento.replace(/_/g,` `).replace(/\b\w/g,e=>e.toUpperCase())}}function qe(e){let t={};return e.forEach(e=>{let n=new Date(e.fecha),r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}`;t[r]||(t[r]=[]),t[r].push(e)}),t}function Je(e){return[...e].sort((e,t)=>new Date(t.fecha)-new Date(e.fecha)).map(e=>Ke(e))}var Ye={recibido:[`en_reparacion`],en_reparacion:[`finalizado`],finalizado:[`entregado`],entregado:[]},T=[`externo`,`luthier_interno`];function E(e,t){let n=Ye[e];return n?n.includes(t):!1}function Xe(e){let t=[];return e.activo_id||t.push(`activo_id es requerido`),e.descripcion||t.push(`descripcion es requerida`),e.tipo_tallerista?T.includes(e.tipo_tallerista)||t.push(`tipo_tallerista inválido: ${e.tipo_tallerista}. Válidos: ${T.join(`, `)}`):t.push(`tipo_tallerista es requerido`),!e.tallerista_nombre&&e.tipo_tallerista&&t.push(`tallerista_nombre es requerido`),e.costo_estimado!=null&&e.costo_estimado<0&&t.push(`costo_estimado no puede ser negativo`),t}var D=[`efectivo`,`transferencia`,`deposito`,`tarjeta`],O=[`alumno`,`institucion`];function Ze(e){let t=[];return e.reparacion_id||t.push(`reparacion_id es requerido`),(!e.monto_total||e.monto_total<=0)&&t.push(`monto_total debe ser mayor a 0`),e.metodo_pago?D.includes(e.metodo_pago)||t.push(`metodo_pago inválido: ${e.metodo_pago}. Válidos: ${D.join(`, `)}`):t.push(`metodo_pago es requerido`),e.tipo_factura&&!O.includes(e.tipo_factura)&&t.push(`tipo_factura inválido: ${e.tipo_factura}. Válidos: ${O.join(`, `)}`),t}function Qe(e){return e.estado_pago===`pendiente`}function $e(e){return{...e,estado_pago:`pagado`,fecha_pago:new Date().toISOString().split(`T`)[0]}}var k=[`escolar`,`anual`,`eventual`];function A(e,t){return!(e.estado!==`activo`||!t.activo||t.estado_uso===`en_reparacion`||t.estado_uso===`de_baja`)}function et(e,t,n,r){if(!A(e,r))throw Error(`No se puede intercambiar: el comodato origen no puede intercambiarse con el activo destino`);if(!A(t,n))throw Error(`No se puede intercambiar: el comodato destino no puede intercambiarse con el activo origen`);return{comodatoOrigenActualizado:{...e,activo_id:r.id,intercambiado_con_id:t.id},comodatoDestinoActualizado:{...t,activo_id:n.id,intercambiado_con_id:e.id}}}function j(e){if(!e.fecha_vencimiento)return null;let t=new Date;t.setHours(0,0,0,0);let n=e.fecha_vencimiento.split(`-`),r=new Date(Number(n[0]),Number(n[1])-1,Number(n[2]));return r.setHours(0,0,0,0),Math.round((r-t)/(1e3*60*60*24))}function tt(e){if(e.estado!==`activo`)return!1;let t=j(e);return t===null?!1:t<=30}function M(e){let t=j(e);return t===null?{label:`Sin vencimiento`,clase:`badge bg-secondary`}:t<0?{label:`Vencido hace ${Math.abs(t)} días`,clase:`badge bg-danger`}:t===0?{label:`Vence hoy`,clase:`badge bg-danger`}:t<=7?{label:`Vence en ${t} días`,clase:`badge bg-warning text-dark`}:t<=30?{label:`Vence en ${t} días`,clase:`badge bg-info text-dark`}:{label:`Vence en ${t} días`,clase:`badge bg-success`}}var nt=e({actualizarAccesorio:()=>mt,actualizarActivo:()=>lt,actualizarReparacion:()=>xt,anularFactura:()=>Ot,cambiarEstadoActivo:()=>ut,cambiarEstadoReparacion:()=>St,crearAccesorio:()=>pt,crearActivo:()=>ct,crearComodato:()=>kt,crearEventoManual:()=>_t,crearFacturaReparacion:()=>Et,crearReparacion:()=>bt,devolverComodato:()=>Bt,eliminarAccesorio:()=>ht,eliminarReparacion:()=>Ct,generarContratoPDF:()=>Ft,generarReporte:()=>It,intercambiarInstrumentos:()=>Mt,obtenerAccesorios:()=>ft,obtenerActivoPorId:()=>st,obtenerActivos:()=>ot,obtenerActivosOciosos:()=>Vt,obtenerComodatosActivos:()=>zt,obtenerComodatosAlumno:()=>Rt,obtenerComodatosPorVencer:()=>jt,obtenerComodatosVencidos:()=>At,obtenerFactura:()=>Tt,obtenerFacturasReparacion:()=>wt,obtenerHistorialActivo:()=>gt,obtenerKPI:()=>Lt,obtenerReparacion:()=>yt,obtenerReparaciones:()=>vt,registrarPagoFactura:()=>Dt,renovarComodato:()=>Pt,subirContratoComodato:()=>Ht,subirFotoActivo:()=>dt}),N=100;function P(){return N++,`mock-`+N+`-`+Date.now()}function F(){let e=50+Math.random()*100;return new Promise(t=>setTimeout(t,e))}function I(e){return JSON.parse(JSON.stringify(e))}function rt(e,t=1,n=20){let r=(t-1)*n;return{data:e.slice(r,r+n),total:e.length,page:t,pageSize:n}}function L(e){return{data:null,error:{code:404,message:`${e} no encontrado`}}}var R=()=>new Date().toISOString().split(`T`)[0];function z(e={}){return{id:P(`act`),codigo_inventario:`V8-VIO-001`,tipo_instrumento:`Violín`,marca:`Marca Test`,modelo:`Modelo X`,numero_serie:`SN-001`,ubicacion:`Aula 1`,estado_conservacion:`bueno`,estado_uso:`disponible`,activo:!0,fecha_adquisicion:`2020-01-15`,valor_adquisicion:15e3,proveedor:`Proveedor Test`,foto_url:null,fecha_baja:null,motivo_baja:null,created_at:`2024-01-01T00:00:00Z`,updated_at:`2024-01-01T00:00:00Z`,...e}}function B(e={}){return{id:P(`acc`),activo_id:null,tipo:`funda`,marca:`Marca Acc`,cantidad:1,estado:`nuevo`,observaciones:``,fecha_asignacion:null,...e}}function V(e={}){return{id:P(`hst`),activo_id:null,tipo_evento:`observacion`,descripcion:`Evento generado`,fecha:new Date().toISOString(),usuario_id:null,metadata:null,...e}}function H(e={}){return{id:P(`rep`),activo_id:null,tipo_tallerista:`externo`,tallerista_nombre:`Tallerista Test`,descripcion:`Reparación de rutina`,costo_estimado:1e3,costo_real:null,fecha_ingreso:R(),fecha_egreso:null,estado:`recibido`,proveedor_factura_url:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...e}}function it(e={}){return{id:P(`fac`),reparacion_id:null,monto_total:1e3,impuestos:180,metodo_pago:`efectivo`,responsable_id:null,tipo_factura:`alumno`,fecha_emision:R(),pdf_generado_url:null,estado_pago:`pendiente`,fecha_pago:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...e}}function U(e={}){return{id:P(`com`),activo_id:null,alumno_id:null,alumno_nombre:`Alumno Test`,fecha_entrega:`2025-01-15`,fecha_devolucion:null,fecha_vencimiento:null,estado:`activo`,tipo_comodato:`escolar`,instrumento_propio_id:null,renovado_de_id:null,intercambiado_con_id:null,contrato_firmado_url:null,...e}}function W(e={}){return{id:P(`alu`),nombre_completo:`Alumno Test`,email:`alumno@test.com`,telefono:`809-000-0000`,...e}}function at(){let e=z({id:`act-001`,codigo_inventario:`V8-VIO-001`,tipo_instrumento:`Violín`,marca:`Stradivarius`,modelo:`Model 1`,estado_uso:`disponible`,estado_conservacion:`bueno`,fecha_adquisicion:`2020-01-15`,valor_adquisicion:15e3}),t=z({id:`act-002`,codigo_inventario:`V8-VIO-002`,tipo_instrumento:`Violín`,marca:`Yamaha`,modelo:`V5`,estado_uso:`prestado`,estado_conservacion:`bueno`,fecha_adquisicion:`2021-06-01`,valor_adquisicion:12e3}),n=z({id:`act-003`,codigo_inventario:`V8-CEL-001`,tipo_instrumento:`Cello`,marca:`Eastman`,modelo:`VC100`,estado_uso:`disponible`,estado_conservacion:`excelente`,fecha_adquisicion:`2022-03-10`,valor_adquisicion:45e3}),r=z({id:`act-004`,codigo_inventario:`V8-GUI-001`,tipo_instrumento:`Guitarra`,marca:`Alhambra`,modelo:`4P`,estado_uso:`en_reparacion`,estado_conservacion:`regular`,fecha_adquisicion:`2019-11-20`,valor_adquisicion:8e3}),i=z({id:`act-005`,codigo_inventario:`V8-FLA-001`,tipo_instrumento:`Flauta`,marca:`Yamaha`,modelo:`YFL-222`,estado_uso:`de_baja`,estado_conservacion:`de_baja`,activo:!1,fecha_adquisicion:`2015-05-05`,valor_adquisicion:5e3,fecha_baja:`2024-12-01`,motivo_baja:`Daño irreversible`}),a=z({id:`act-006`,codigo_inventario:`V8-TRO-001`,tipo_instrumento:`Trompeta`,marca:`Bach`,modelo:`TR200`,estado_uso:`disponible`,estado_conservacion:`bueno`,fecha_adquisicion:`2023-01-10`,valor_adquisicion:22e3}),o=z({id:`act-007`,codigo_inventario:`V8-PER-001`,tipo_instrumento:`Percusión`,marca:`Pearl`,modelo:`Export`,estado_uso:`en_mantenimiento`,estado_conservacion:`mantenimiento`,fecha_adquisicion:`2018-08-15`,valor_adquisicion:35e3}),s=z({id:`act-008`,codigo_inventario:`V8-PIA-001`,tipo_instrumento:`Piano`,marca:`Kawai`,modelo:`K-300`,estado_uso:`disponible`,estado_conservacion:`bueno`,fecha_adquisicion:`2024-02-20`,valor_adquisicion:18e4}),c=W({id:`alu-001`,nombre_completo:`Juan Pérez`,email:`juan@test.com`}),l=W({id:`alu-002`,nombre_completo:`María García`,email:`maria@test.com`}),u=W({id:`alu-003`,nombre_completo:`Carlos López`,email:`carlos@test.com`}),d=new Date;d.setDate(d.getDate()+45);let f=d.toISOString().split(`T`)[0],p=new Date;p.setDate(p.getDate()+5);let m=p.toISOString().split(`T`)[0],h=new Date;h.setDate(h.getDate()-2);let g=h.toISOString().split(`T`)[0],_=U({id:`com-001`,activo_id:`act-002`,alumno_id:`alu-001`,alumno_nombre:`Juan Pérez`,fecha_vencimiento:f,estado:`activo`,tipo_comodato:`escolar`}),v=U({id:`com-002`,activo_id:`act-003`,alumno_id:`alu-002`,alumno_nombre:`María García`,fecha_entrega:`2024-08-15`,fecha_devolucion:`2024-12-15`,estado:`devuelto`,tipo_comodato:`escolar`}),y=U({id:`com-003`,activo_id:`act-001`,alumno_id:`alu-003`,alumno_nombre:`Carlos López`,fecha_vencimiento:m,estado:`activo`,tipo_comodato:`eventual`}),ee=U({id:`com-004`,activo_id:`act-006`,alumno_id:`alu-001`,alumno_nombre:`Juan Pérez`,fecha_vencimiento:g,estado:`activo`,tipo_comodato:`anual`}),te=B({id:`acc-001`,activo_id:`act-001`,tipo:`funda`,marca:`Gewa`,cantidad:1,estado:`nuevo`,fecha_asignacion:`2024-01-15`}),ne=B({id:`acc-002`,activo_id:`act-001`,tipo:`arco`,marca:`Brasil`,cantidad:2,estado:`bueno`,fecha_asignacion:`2024-01-15`}),re=B({id:`acc-003`,activo_id:`act-004`,tipo:`cuerdas`,marca:`D'Addario`,cantidad:5,estado:`bueno`,fecha_asignacion:`2024-03-10`}),ie=B({id:`acc-004`,activo_id:null,tipo:`atril`,marca:`Manhasset`,cantidad:3,estado:`nuevo`}),ae=B({id:`acc-005`,activo_id:`act-002`,tipo:`funda`,marca:`Gewa`,cantidad:1,estado:`regular`,fecha_asignacion:`2024-06-01`}),oe=V({id:`hst-001`,activo_id:`act-001`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-01-01T10:00:00Z`}),se=V({id:`hst-002`,activo_id:`act-001`,tipo_evento:`asignacion`,descripcion:`Instrumento asignado a Carlos López`,fecha:`2024-09-01T08:00:00Z`,usuario_id:`usr-admin`}),ce=V({id:`hst-003`,activo_id:`act-002`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-01-10T10:00:00Z`}),le=V({id:`hst-004`,activo_id:`act-002`,tipo_evento:`asignacion`,descripcion:`Instrumento asignado a Juan Pérez`,fecha:`2024-06-01T08:00:00Z`,usuario_id:`usr-admin`}),ue=V({id:`hst-005`,activo_id:`act-003`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-02-01T10:00:00Z`}),de=V({id:`hst-006`,activo_id:`act-003`,tipo_evento:`asignacion`,descripcion:`Instrumento asignado a María García`,fecha:`2024-08-15T08:00:00Z`,usuario_id:`usr-admin`}),fe=V({id:`hst-007`,activo_id:`act-003`,tipo_evento:`devolucion`,descripcion:`Instrumento devuelto por María García`,fecha:`2024-12-15T14:00:00Z`,usuario_id:`usr-admin`}),pe=V({id:`hst-008`,activo_id:`act-004`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-01-05T10:00:00Z`}),me=V({id:`hst-009`,activo_id:`act-004`,tipo_evento:`reparacion`,descripcion:`Ingreso a reparación: Cambio de cuerdas y ajuste`,fecha:`2024-10-01T09:00:00Z`,usuario_id:`usr-admin`}),he=V({id:`hst-010`,activo_id:`act-001`,tipo_evento:`cambio_estado`,descripcion:`Cambio de estado: disponible → prestado`,fecha:`2024-09-01T08:00:00Z`,usuario_id:`usr-admin`}),ge=H({id:`rep-001`,activo_id:`act-004`,tipo_tallerista:`luthier_interno`,tallerista_nombre:`Luthier Interno`,descripcion:`Cambio de cuerdas y ajuste de mástil`,costo_estimado:2500,costo_real:null,fecha_ingreso:`2024-10-01`,estado:`en_reparacion`}),_e=H({id:`rep-002`,activo_id:`act-001`,tipo_tallerista:`externo`,tallerista_nombre:`Taller Pérez`,descripcion:`Reparación de fisura en tapa armónica`,costo_estimado:3500,costo_real:3200,fecha_ingreso:`2024-08-01`,fecha_egreso:`2024-08-20`,estado:`entregado`}),ve=it({id:`fac-001`,reparacion_id:`rep-002`,monto_total:3200,impuestos:576,metodo_pago:`efectivo`,tipo_factura:`alumno`,estado_pago:`pendiente`,fecha_emision:`2024-08-20`});return{activos:[e,t,n,r,i,a,o,s],alumnos:[c,l,u],comodatos:[_,v,y,ee],accesorios:[te,ne,re,ie,ae],historial:[oe,se,ce,le,ue,de,fe,pe,me,he],reparaciones:[ge,_e],facturas:[ve]}}var G=at();async function ot(e={}){await F();let t=I(G.activos).filter(e=>e.activo!==!1);if(e.estado_uso&&(t=t.filter(t=>t.estado_uso===e.estado_uso)),e.tipo_instrumento&&(t=t.filter(t=>t.tipo_instrumento===e.tipo_instrumento)),e.estado_conservacion&&(t=t.filter(t=>t.estado_conservacion===e.estado_conservacion)),e.ubicacion&&(t=t.filter(t=>t.ubicacion===e.ubicacion)),e.q){let n=e.q.toLowerCase();t=t.filter(e=>Object.values(e).some(e=>String(e??``).toLowerCase().includes(n)))}return rt(t,e.page,e.pageSize)}async function st(e){await F();let t=G.activos.find(t=>t.id===e);return t?{data:I(t),error:null}:L(`Activo`)}async function ct(e){await F();let t=Le(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};let n=z({id:P(`act`),...e,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});G.activos.push(n);let r=w(n.id,`creacion`,`Instrumento registrado`,e.usuario_id);return G.historial.push({...r,id:P(`hst`)}),{data:I(n),error:null}}async function lt(e,t){await F();let n=G.activos.findIndex(t=>t.id===e);if(n===-1)return L(`Activo`);let r=Le({...G.activos[n],...t});return r.length?{data:null,error:{code:400,message:r.join(`; `)}}:(G.activos[n]={...G.activos[n],...t,updated_at:new Date().toISOString()},{data:I(G.activos[n]),error:null})}async function ut(e,t){await F();let n=G.activos.findIndex(t=>t.id===e);if(n===-1)return L(`Activo`);let r=G.activos[n].estado_uso;if(!Ie(r,t))return{data:null,error:{code:400,message:`Transición inválida de `+r+` a `+t}};G.activos[n].estado_uso=t,G.activos[n].updated_at=new Date().toISOString();let i=w(e,`cambio_estado`,`Cambio de estado: `+r+` → `+t,null,{estado_anterior:r,estado_nuevo:t});return G.historial.push({...i,id:P(`hst`)}),{data:I(G.activos[n]),error:null}}async function dt(e,t){await F();let n=G.activos.findIndex(t=>t.id===e);return n===-1?L(`Activo`):(G.activos[n].foto_url=`https://storage.test/activos/`+e+`/foto.jpg`,G.activos[n].updated_at=new Date().toISOString(),{data:{foto_url:G.activos[n].foto_url},error:null})}async function ft(e){await F();let t=I(G.accesorios);return e&&(t=t.filter(t=>t.activo_id===e)),{data:t,error:null}}async function pt(e){await F();let t=He(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};if(!G.activos.some(t=>t.id===e.activo_id))return{data:null,error:{code:400,message:`activo_id no existe`}};let n=B({id:P(`acc`),...e,fecha_asignacion:R()});return G.accesorios.push(n),{data:I(n),error:null}}async function mt(e,t){await F();let n=G.accesorios.findIndex(t=>t.id===e);return n===-1?L(`Accesorio`):(G.accesorios[n]={...G.accesorios[n],...t},{data:I(G.accesorios[n]),error:null})}async function ht(e){await F();let t=G.accesorios.findIndex(t=>t.id===e);if(t===-1)return L(`Accesorio`);let[n]=G.accesorios.splice(t,1);return{data:I(n),error:null}}async function gt(e,t={}){await F();let n=I(G.historial).filter(t=>t.activo_id===e);return t.tipo_evento&&(n=n.filter(e=>e.tipo_evento===t.tipo_evento)),n.sort((e,t)=>new Date(t.fecha)-new Date(e.fecha)),{data:n,error:null}}async function _t(e){await F();try{let t={...w(e.activo_id,e.tipo_evento,e.descripcion,e.usuario_id,e.metadata),id:P(`hst`)};return G.historial.push(t),{data:I(t),error:null}}catch(e){return{data:null,error:{code:400,message:e.message}}}}async function vt(e={}){await F();let t=I(G.reparaciones);return e.estado&&(t=t.filter(t=>t.estado===e.estado)),e.activo_id&&(t=t.filter(t=>t.activo_id===e.activo_id)),e.desde&&(t=t.filter(t=>t.fecha_ingreso>=e.desde)),e.hasta&&(t=t.filter(t=>t.fecha_ingreso<=e.hasta)),t.sort((e,t)=>new Date(t.created_at)-new Date(e.created_at)),{data:t,error:null}}async function yt(e){await F();let t=G.reparaciones.find(t=>t.id===e);return t?{data:I(t),error:null}:L(`Reparación`)}async function bt(e){await F();let t=Xe(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};if(!G.activos.find(t=>t.id===e.activo_id))return{data:null,error:{code:400,message:`activo_id no existe`}};let n=H({id:P(`rep`),...e,estado:`recibido`});G.reparaciones.push(n);let r=w(e.activo_id,`reparacion`,`Ingreso a reparación: `+e.descripcion,e.usuario_id);return G.historial.push({...r,id:P(`hst`)}),{data:I(n),error:null}}async function xt(e,t){await F();let n=G.reparaciones.findIndex(t=>t.id===e);return n===-1?L(`Reparación`):t.estado&&t.estado!==G.reparaciones[n].estado&&!E(G.reparaciones[n].estado,t.estado)?{data:null,error:{code:400,message:`Transición inválida de `+actual+` a `+nuevoEstado}}:(G.reparaciones[n]={...G.reparaciones[n],...t,updated_at:new Date().toISOString()},{data:I(G.reparaciones[n]),error:null})}async function St(e,t){await F();let n=G.reparaciones.findIndex(t=>t.id===e);if(n===-1)return L(`Reparación`);let r=G.reparaciones[n].estado;if(!E(r,t))return{data:null,error:{code:400,message:`Transición inválida de `+r+` a `+t}};G.reparaciones[n].estado=t,G.reparaciones[n].updated_at=new Date().toISOString();let i=G.activos.findIndex(e=>e.id===G.reparaciones[n].activo_id);i!==-1&&t===`entregado`&&(G.activos[i].estado_uso=`disponible`),i!==-1&&t===`en_reparacion`&&(G.activos[i].estado_uso=`en_reparacion`);let a=w(G.reparaciones[n].activo_id,`cambio_estado`,`Reparación `+r+` → `+t);return G.historial.push({...a,id:P(`hst`)}),{data:I(G.reparaciones[n]),error:null}}async function Ct(e){await F();let t=G.reparaciones.findIndex(t=>t.id===e);if(t===-1)return L(`Reparación`);let[n]=G.reparaciones.splice(t,1);return{data:I(n),error:null}}async function wt(e={}){await F();let t=I(G.facturas);return e.estado_pago&&(t=t.filter(t=>t.estado_pago===e.estado_pago)),e.tipo_factura&&(t=t.filter(t=>t.tipo_factura===e.tipo_factura)),e.desde&&(t=t.filter(t=>t.fecha_emision>=e.desde)),e.hasta&&(t=t.filter(t=>t.fecha_emision<=e.hasta)),t.sort((e,t)=>new Date(t.created_at)-new Date(e.created_at)),{data:t,error:null}}async function Tt(e){await F();let t=G.facturas.find(t=>t.id===e);return t?{data:I(t),error:null}:L(`Factura`)}async function Et(e){await F();let t=Ze(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};if(!G.reparaciones.some(t=>t.id===e.reparacion_id))return{data:null,error:{code:400,message:`reparacion_id no existe`}};if(G.facturas.find(t=>t.reparacion_id===e.reparacion_id&&t.estado_pago!==`anulada`))return{data:null,error:{code:400,message:`La reparación ya tiene una factura activa`}};let n=it({id:P(`fac`),...e,estado_pago:`pendiente`});return G.facturas.push(n),{data:I(n),error:null}}async function Dt(e,t={}){await F();let n=G.facturas.findIndex(t=>t.id===e);if(n===-1)return L(`Factura`);let r=G.facturas[n];return r.estado_pago===`pagado`?{data:null,error:{code:400,message:`La factura ya está pagada`}}:r.estado_pago===`anulada`?{data:null,error:{code:400,message:`No se puede pagar una factura anulada`}}:(G.facturas[n]=$e({...r,...t,fecha_pago:t.fecha_pago||R()}),{data:I(G.facturas[n]),error:null})}async function Ot(e){await F();let t=G.facturas.findIndex(t=>t.id===e);return t===-1?L(`Factura`):Qe(G.facturas[t])?(G.facturas[t].estado_pago=`anulada`,G.facturas[t].updated_at=new Date().toISOString(),{data:I(G.facturas[t]),error:null}):{data:null,error:{code:400,message:`Solo se pueden anular facturas en estado pendiente`}}}async function kt(e){await F();let t=G.activos.find(t=>t.id===e.activo_id);if(!t)return{data:null,error:{code:400,message:`activo_id no existe`}};if(t.estado_uso!==`disponible`)return{data:null,error:{code:400,message:`Activo no está disponible para comodato`}};let n=U({id:P(),activo_id:e.activo_id,alumno_id:e.alumno_id,tipo_comodato:e.tipo_comodato||`escolar`,estado:e.estado||`activo`,fecha_entrega:R(),fecha_vencimiento:e.fecha_vencimiento||null,instrumento_propio_id:e.instrumento_propio_id||null,...e});G.comodatos.push(n);let r=G.activos.findIndex(t=>t.id===e.activo_id);r!==-1&&(G.activos[r].estado_uso=`prestado`);let i=w(e.activo_id,`asignacion`,`Instrumento asignado en comodato a `+(e.alumno_id||`desconocido`),e.usuario_id||`mock-user`,{comodato_id:n.id});return G.historial.push({...i,id:P()}),{data:I(n),error:null}}async function At(){return await F(),{data:I(G.comodatos).filter(e=>{if(e.estado!==`activo`)return!1;let t=j(e);return t!==null&&t<0}),error:null}}async function jt(e=7){return await F(),{data:I(G.comodatos).filter(t=>{if(t.estado!==`activo`)return!1;let n=j(t);return n!==null&&n>=0&&n<=e}),error:null}}async function Mt(e,t,n){await F();let r=G.comodatos.find(t=>t.id===e);if(!r)return{data:null,error:{code:404,message:`Comodato origen no encontrado`}};let i=G.activos.find(e=>e.id===t);if(!i)return{data:null,error:{code:404,message:`Activo destino no encontrado`}};let a=G.comodatos.find(e=>e.activo_id===t&&e.estado===`activo`),o=G.activos.find(e=>e.id===r.activo_id);if(!o)return{data:null,error:{code:404,message:`Activo origen no encontrado`}};try{if(a){let t=et(r,a,o,i),n=G.comodatos.findIndex(t=>t.id===e),s=G.comodatos.findIndex(e=>e.id===a.id);return G.comodatos[n]=t.comodatoOrigenActualizado,G.comodatos[s]=t.comodatoDestinoActualizado,G.activos[G.activos.findIndex(e=>e.id===o.id)]={...o,estado_uso:Nt(t.comodatoDestinoActualizado)},G.activos[G.activos.findIndex(e=>e.id===i.id)]={...i,estado_uso:Nt(t.comodatoOrigenActualizado)},{data:{comodatoOrigen:t.comodatoOrigenActualizado,comodatoDestino:t.comodatoDestinoActualizado},error:null}}let n=r.activo_id,s=G.comodatos.findIndex(t=>t.id===e);return G.comodatos[s]={...r,activo_id:t,intercambiado_con_id:t},n&&(G.activos[G.activos.findIndex(e=>e.id===n)].estado_uso=`disponible`),G.activos[G.activos.findIndex(e=>e.id===t)].estado_uso=`prestado`,{data:{comodatoOrigen:G.comodatos[s]},error:null}}catch(e){return{data:null,error:{code:400,message:e.message}}}}function Nt(e){return e.estado===`activo`?`prestado`:`disponible`}async function Pt(e,t){await F();let n=G.comodatos.findIndex(t=>t.id===e);if(n===-1)return L(`Comodato`);let r=G.comodatos[n];if(!tt(r))return{data:null,error:{code:400,message:`El comodato no puede renovarse`}};G.comodatos[n]={...r,estado:`renovado`};let i=U({id:P(`com`),activo_id:r.activo_id,alumno_id:r.alumno_id,alumno_nombre:r.alumno_nombre,tipo_comodato:t?.tipo_comodato||r.tipo_comodato,fecha_vencimiento:t?.fecha_vencimiento||(()=>{let e=new Date;return e.setFullYear(e.getFullYear()+1),e.toISOString().split(`T`)[0]})(),renovado_de_id:r.id,estado:`activo`});return G.comodatos.push(i),{data:{viejo:I(G.comodatos[n]),nuevo:I(i)},error:null}}async function Ft(e){return await F(),G.comodatos.find(t=>t.id===e)?{data:{url:`https://storage.test/comodatos/`+e+`/contrato.pdf`,comodatoId:e},error:null}:L(`Comodato`)}async function It(e,t={}){await F();let n=await r(()=>import(`./reportes-D44zhI-v.js`),[]),i={activos:I(G.activos),comodatos:I(G.comodatos),reparaciones:I(G.reparaciones)};return{data:n.armarReporte(e,i),error:null}}async function Lt(){await F();let e=await r(()=>import(`./reportes-D44zhI-v.js`),[]),t=e.resumirInventario({activos:G.activos,comodatos:G.comodatos,reparaciones:G.reparaciones}),n=e.activosPorTipo(G.activos),i=G.comodatos.filter(e=>{if(e.estado!==`activo`)return!1;let t=j(e);return t!==null&&t<0}),a=G.comodatos.filter(e=>{if(e.estado!==`activo`)return!1;let t=j(e);return t!==null&&t>=0&&t<=7});return{data:{resumen:t,distribucion_por_tipo:n,comodatos_vencidos:i.length,comodatos_proximos_vencer:a.length,total_en_reparacion:G.reparaciones.filter(e=>e.estado===`en_reparacion`||e.estado===`recibido`).length},error:null}}async function Rt(e){return await F(),{data:I(G.comodatos).filter(t=>t.alumno_id===e).sort((e,t)=>new Date(t.fecha_entrega)-new Date(e.fecha_entrega)),error:null}}async function zt(){return await F(),{data:I(G.comodatos).filter(e=>e.estado===`activo`).sort((e,t)=>new Date(t.fecha_entrega)-new Date(e.fecha_entrega)),error:null}}async function Bt(e){await F();let t=G.comodatos.findIndex(t=>t.id===e);if(t===-1)return L(`Comodato`);G.comodatos[t].estado=`devuelto`,G.comodatos[t].fecha_devolucion=R();let n=G.activos.findIndex(e=>e.id===G.comodatos[t].activo_id);n!==-1&&(G.activos[n].estado_uso=`disponible`);let r=w(G.comodatos[t].activo_id,`devolucion`,`Instrumento devuelto por `+(G.comodatos[t].alumno_nombre||`desconocido`));return G.historial.push({...r,id:P(`hst`)}),{data:I(G.comodatos[t]),error:null}}async function Vt(){await F();let e=G.comodatos.filter(e=>e.estado===`activo`).map(e=>e.activo_id);return{data:I(G.activos).filter(t=>e.includes(t.id)).map(e=>({...e,dias_prestado:30,dias_hasta_vencimiento:(()=>{let t=G.comodatos.find(t=>t.activo_id===e.id&&t.estado===`activo`);return t?j(t):null})()})),error:null}}async function Ht(e,t){return await F(),{data:{url:`https://storage.test/comodatos/contrato.pdf`},error:null}}var K=()=>i.isDemoMode?nt:g,q=(...e)=>K().obtenerActivos(...e),Ut=(...e)=>K().crearActivo(...e),Wt=(...e)=>K().actualizarActivo(...e),Gt=(...e)=>K().obtenerActivoPorId(...e),Kt=(...e)=>K().cambiarEstadoActivo(...e),qt=(...e)=>K().obtenerAccesorios(...e),Jt=(...e)=>K().obtenerHistorialActivo(...e),Yt=(...e)=>K().crearEventoManual(...e),Xt=(...e)=>K().obtenerReparaciones(...e),Zt=(...e)=>K().obtenerComodatosVencidos(...e),Qt=(...e)=>K().obtenerComodatosPorVencer(...e),$t=(...e)=>K().renovarComodato(...e),en=(...e)=>K().obtenerKPI(...e),tn=(...e)=>K().crearComodato(...e),nn=(...e)=>K().devolverComodato(...e),rn=(...e)=>K().obtenerComodatosAlumno(...e),J=(...e)=>K().obtenerComodatosActivos(...e),an=(...e)=>K().obtenerActivosOciosos(...e),on=(...e)=>K().subirContratoComodato(...e),Y=20;async function sn(e){let t=new AbortController,r=1;e.innerHTML=`<p class="p-4">Cargando inventario...</p>`,await i();async function i(){let t=new URLSearchParams(window.location.search),n={tipo_instrumento:t.get(`tipo`)||``,estado_uso:t.get(`uso`)||``,estado_conservacion:t.get(`conservacion`)||``,q:t.get(`q`)||``,page:parseInt(t.get(`page`),10)||1};r=n.page;let i={...n,pageSize:Y};Object.keys(i).forEach(e=>{i[e]||delete i[e]});let o=await q(i);if(o.error){e.innerHTML=`<div class="alert alert-danger m-4">Error: ${o.error.message}</div>`;return}let s=o.data||[],c=o.total||0,l=Math.ceil(c/Y)||1,u=[...new Set(s.map(e=>e.tipo_instrumento).filter(Boolean))].sort(),d=s.map(e=>{let t=b(e),n=t===null?`—`:`${t} años`;return`
        <tr>
          <td class="font-monospace small">${e.codigo_inventario}</td>
          <td>${e.tipo_instrumento}</td>
          <td class="text-muted">${[e.marca,e.modelo].filter(Boolean).join(` `)}</td>
          <td><span class="${x(e.estado_conservacion)}">${e.estado_conservacion}</span></td>
          <td><span class="${S(e.estado_uso)}">${e.estado_uso}</span></td>
          <td>${e.ubicacion}</td>
          <td>${n}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-info btn-view" data-id="${e.id}">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-secondary btn-editar"
                data-id="${e.id}"
                data-codigo="${e.codigo_inventario}"
                data-tipo="${e.tipo_instrumento}"
                data-marca="${e.marca||``}"
                data-modelo="${e.modelo||``}"
                data-serie="${e.numero_serie||``}"
                data-conservacion="${e.estado_conservacion}"
                data-uso="${e.estado_uso}"
                data-ubicacion="${e.ubicacion}"
                data-adquisicion="${e.fecha_adquisicion||``}"
                data-valor="${e.valor_adquisicion||``}"
                data-proveedor="${e.proveedor||``}"
                data-foto="${e.foto_url||``}"
                data-notas="${(e.notas||``).replace(/"/g,`&quot;`)}">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </td>
        </tr>
      `}).join(``),f=(r-1)*Y+1,p=Math.min(r*Y,c);e.innerHTML=`
      <div class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0"><i class="bi bi-music-note-list me-2"></i>Inventario de Instrumentos</h4>
          <button id="btn-nuevo" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i> Nuevo instrumento
          </button>
        </div>

        <div class="card shadow-sm mb-3">
          <div class="card-body py-2">
            <form id="filter-form" class="row g-2 align-items-end">
              <div class="col-md-2">
                <label class="form-label small mb-0">Tipo</label>
                <select id="filter-tipo" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  ${u.map(e=>`<option value="${e}" ${n.tipo_instrumento===e?`selected`:``}>${e}</option>`).join(``)}
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small mb-0">Estado uso</label>
                <select id="filter-estado-uso" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  <option value="disponible" ${n.estado_uso===`disponible`?`selected`:``}>Disponible</option>
                  <option value="prestado" ${n.estado_uso===`prestado`?`selected`:``}>Prestado</option>
                  <option value="en_mantenimiento" ${n.estado_uso===`en_mantenimiento`?`selected`:``}>En mantenimiento</option>
                  <option value="en_reparacion" ${n.estado_uso===`en_reparacion`?`selected`:``}>En reparación</option>
                  <option value="de_baja" ${n.estado_uso===`de_baja`?`selected`:``}>De baja</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small mb-0">Conservación</label>
                <select id="filter-estado-conservacion" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  <option value="excelente" ${n.estado_conservacion===`excelente`?`selected`:``}>Excelente</option>
                  <option value="bueno" ${n.estado_conservacion===`bueno`?`selected`:``}>Bueno</option>
                  <option value="regular" ${n.estado_conservacion===`regular`?`selected`:``}>Regular</option>
                  <option value="mantenimiento" ${n.estado_conservacion===`mantenimiento`?`selected`:``}>Mantenimiento</option>
                  <option value="de_baja" ${n.estado_conservacion===`de_baja`?`selected`:``}>De baja</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small mb-0">Buscar</label>
                <input id="search-input" type="text" class="form-control form-control-sm" placeholder="Código, tipo, marca..." value="${n.q||``}">
              </div>
              <div class="col-md-1">
                <button id="btn-buscar" type="submit" class="btn btn-sm btn-outline-primary w-100">
                  <i class="bi bi-search"></i>
                </button>
              </div>
              <div class="col-md-1">
                <button id="btn-limpiar" type="button" class="btn btn-sm btn-outline-secondary w-100">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Marca / Modelo</th>
                  <th>Conservación</th>
                  <th>Uso</th>
                  <th>Ubicación</th>
                  <th>Antigüedad</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody id="tbody-activos">
                ${d||`<tr><td colspan="8" class="text-center text-muted py-4">Sin instrumentos registrados</td></tr>`}
              </tbody>
            </table>
          </div>
          ${l>1?`
          <div class="card-footer d-flex justify-content-between align-items-center">
            <small class="text-muted">Mostrando ${f}-${p} de ${c}</small>
            <nav>
              <ul class="pagination pagination-sm mb-0" id="pagination">
                <li class="page-item ${r<=1?`disabled`:``}">
                  <button class="page-link" data-page="${r-1}">&laquo;</button>
                </li>
                ${Array.from({length:l},(e,t)=>t+1).map(e=>`
                  <li class="page-item ${e===r?`active`:``}">
                    <button class="page-link" data-page="${e}">${e}</button>
                  </li>
                `).join(``)}
                <li class="page-item ${r>=l?`disabled`:``}">
                  <button class="page-link" data-page="${r+1}">&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>
          `:``}
        </div>

        <!-- Modal nuevo/editar instrumento -->
        <div class="modal fade" id="modal-instrumento" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modal-titulo">Nuevo instrumento</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="form-instrumento" novalidate>
                  <input type="hidden" name="id" />
                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label class="form-label fw-semibold">Tipo de instrumento</label>
                      <input type="text" class="form-control" name="tipo_instrumento" required placeholder="Violín, Cello, Flauta...">
                    </div>
                    <div class="col-6">
                      <label class="form-label fw-semibold">Código inventario</label>
                      <input type="text" class="form-control" name="codigo_instrumento" required placeholder="V8-VIO-001">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-4">
                      <label class="form-label fw-semibold">Marca</label>
                      <input type="text" class="form-control" name="marca">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Modelo</label>
                      <input type="text" class="form-control" name="modelo">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">N° de serie</label>
                      <input type="text" class="form-control" name="numero_serie">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-4">
                      <label class="form-label fw-semibold">Estado conservación</label>
                      <select class="form-select" name="estado_conservacion" required>
                        <option value="excelente">Excelente</option>
                        <option value="bueno" selected>Bueno</option>
                        <option value="regular">Regular</option>
                        <option value="mantenimiento">En mantenimiento</option>
                        <option value="de_baja">De baja</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Estado uso</label>
                      <select class="form-select" name="estado_uso">
                        <option value="disponible" selected>Disponible</option>
                        <option value="prestado">Prestado</option>
                        <option value="en_mantenimiento">En mantenimiento</option>
                        <option value="en_reparacion">En reparación</option>
                        <option value="de_baja">De baja</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Ubicación</label>
                      <input type="text" class="form-control" name="ubicacion" value="Sede Principal">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-4">
                      <label class="form-label fw-semibold">Fecha de adquisición</label>
                      <input type="date" class="form-control" name="fecha_adquisicion">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Valor de adquisición</label>
                      <input type="number" class="form-control" name="valor_adquisicion" min="0" step="0.01" placeholder="RD$">
                    </div>
                    <div class="col-4">
                      <label class="form-label fw-semibold">Proveedor</label>
                      <input type="text" class="form-control" name="proveedor" placeholder="Nombre del proveedor">
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">URL de foto</label>
                    <input type="url" class="form-control" name="foto_url" placeholder="https://...">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Notas</label>
                    <textarea class="form-control" name="notas" rows="2"></textarea>
                  </div>
                  <div id="modal-error" class="alert alert-danger d-none"></div>
                </form>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button id="btn-guardar-instrumento" class="btn btn-primary">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,a()}function a(){e.querySelector(`#filter-form`)?.addEventListener(`submit`,e=>{e.preventDefault(),o()},{signal:t.signal}),e.querySelector(`#btn-buscar`)?.addEventListener(`click`,()=>{o()},{signal:t.signal}),e.querySelector(`#btn-limpiar`)?.addEventListener(`click`,()=>{s()},{signal:t.signal}),e.querySelector(`#pagination`)?.addEventListener(`click`,e=>{let t=e.target.closest(`.page-link`);if(!t)return;let n=parseInt(t.dataset.page,10);n&&(c({page:n}),i())},{signal:t.signal}),e.querySelector(`#btn-nuevo`)?.addEventListener(`click`,()=>{l=null,e.querySelector(`#modal-titulo`).textContent=`Nuevo instrumento`,e.querySelector(`#form-instrumento`).reset(),e.querySelector(`[name="id"]`).value=``,e.querySelector(`#modal-error`).classList.add(`d-none`),u()?.show()},{signal:t.signal}),e.querySelector(`#tbody-activos`)?.addEventListener(`click`,t=>{let n=t.target.closest(`.btn-view`);if(n){let e=n.dataset.id;window.router&&window.router.navigate(`inventario-detalle`,{activoId:e});return}let r=t.target.closest(`.btn-editar`);if(!r)return;l=r.dataset.id;let i=e.querySelector(`#form-instrumento`);i.querySelector(`[name="id"]`).value=r.dataset.id,i.querySelector(`[name="tipo_instrumento"]`).value=r.dataset.tipo,i.querySelector(`[name="marca"]`).value=r.dataset.marca,i.querySelector(`[name="modelo"]`).value=r.dataset.modelo,i.querySelector(`[name="numero_serie"]`).value=r.dataset.serie,i.querySelector(`[name="codigo_instrumento"]`).value=r.dataset.codigo,i.querySelector(`[name="estado_conservacion"]`).value=r.dataset.conservacion,i.querySelector(`[name="estado_uso"]`).value=r.dataset.uso,i.querySelector(`[name="ubicacion"]`).value=r.dataset.ubicacion,i.querySelector(`[name="fecha_adquisicion"]`).value=r.dataset.adquisicion,i.querySelector(`[name="valor_adquisicion"]`).value=r.dataset.valor,i.querySelector(`[name="proveedor"]`).value=r.dataset.proveedor,i.querySelector(`[name="foto_url"]`).value=r.dataset.foto,i.querySelector(`[name="notas"]`).value=r.dataset.notas||``,e.querySelector(`#modal-titulo`).textContent=`Editar instrumento`,e.querySelector(`#modal-error`).classList.add(`d-none`),u()?.show()},{signal:t.signal}),e.querySelector(`#btn-guardar-instrumento`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#form-instrumento`),n=e.querySelector(`#modal-error`),r=new FormData(t),a=Object.fromEntries(r.entries());delete a.id,a.marca||delete a.marca,a.modelo||delete a.modelo,a.numero_serie||delete a.numero_serie,a.fecha_adquisicion||delete a.fecha_adquisicion,a.valor_adquisicion||delete a.valor_adquisicion,a.proveedor||delete a.proveedor,a.foto_url||delete a.foto_url,a.notas||delete a.notas;let o=e.querySelector(`#btn-guardar-instrumento`);o.disabled=!0;let{error:s}=l?await Wt(l,a):await Ut(a);o.disabled=!1,s?(n.textContent=s.message,n.classList.remove(`d-none`)):(u()?.hide(),i())},{signal:t.signal})}function o(){c({tipo_instrumento:e.querySelector(`#filter-tipo`)?.value||``,estado_uso:e.querySelector(`#filter-estado-uso`)?.value||``,estado_conservacion:e.querySelector(`#filter-estado-conservacion`)?.value||``,q:e.querySelector(`#search-input`)?.value||``,page:1}),r=1,i()}function s(){let t=e.querySelector(`#search-input`);t&&(t.value=``),e.querySelector(`#filter-tipo`).value=``,e.querySelector(`#filter-estado-uso`).value=``,e.querySelector(`#filter-estado-conservacion`).value=``,c({page:1}),r=1,i()}function c(e){let t=new URL(window.location);Object.entries(e).forEach(([e,n])=>{n&&n!==``?t.searchParams.set(e,n):t.searchParams.delete(e)}),window.history.replaceState({},``,t)}let l=null;function u(){let t=e.querySelector(`#modal-instrumento`);return t?new n(t):null}return{teardown:()=>t.abort()}}async function X(e){let r=new AbortController;e.innerHTML=`<p class="p-4">Cargando comodatos...</p>`;let[{data:i,error:a},{data:o,error:s}]=await Promise.all([J(),q({estado_uso:`disponible`})]);if(a||s)return e.innerHTML=`<div class="alert alert-danger m-4">Error: `+(a||s).message+`</div>`,{teardown:()=>r.abort()};let c=(i||[]).map(e=>{let t=e.fecha_vencimiento?M(e):{label:`Sin vencimiento`,clase:`badge bg-secondary`},n=tt(e);return`<tr><td class="font-monospace small">`+((e.inventario_activos&&e.inventario_activos.codigo_inventario)??`—`)+`</td><td>`+((e.inventario_activos&&e.inventario_activos.tipo_instrumento)??`—`)+`</td><td><a href="#" class="btn-historial-alumno" data-alumno-id="`+(e.alumno_id||``)+`" data-alumno-nombre="`+(e.alumno_nombre||``)+`">`+(e.alumnos?.nombre_completo||e.alumno_nombre||`—`)+`</a></td><td>`+(e.fecha_entrega?new Date(e.fecha_entrega).toLocaleDateString(`es-DO`):`—`)+`</td><td>`+(e.fecha_vencimiento?new Date(e.fecha_vencimiento).toLocaleDateString(`es-DO`):`—`)+`</td><td><span class="`+t.clase+`">`+t.label+`</span></td><td><span class="badge bg-`+(e.estado===`activo`?`success`:`secondary`)+`">`+(e.estado||`activo`)+`</span></td><td class="d-flex gap-1">`+(n?`<button class="btn btn-sm btn-outline-warning btn-renovar" data-id="`+e.id+`" title="Renovar"><i class="bi bi-arrow-clockwise"></i></button>`:``)+`<button class="btn btn-sm btn-outline-info btn-intercambiar" data-id="`+e.id+`" title="Intercambiar"><i class="bi bi-arrow-left-right"></i></button><button class="btn btn-sm btn-outline-danger btn-devolver" data-id="`+e.id+`" data-alumno="`+(e.alumnos?.nombre_completo||e.alumno_nombre||``)+`" data-instrumento="`+(e.inventario_activos&&e.inventario_activos.codigo_inventario||``)+`"><i class="bi bi-box-arrow-in-left"></i></button></td></tr>`}).join(``),l=(o||[]).map(e=>`<option value="`+e.id+`">`+e.codigo_inventario+` — `+e.tipo_instrumento+`</option>`).join(``),u=k.map(e=>`<option value="`+e+`">`+e.charAt(0).toUpperCase()+e.slice(1)+`</option>`).join(``);e.innerHTML=[`<div class="container-fluid p-4">`,`<div class="d-flex justify-content-between align-items-center mb-4">`,`<h4 class="mb-0"><i class="bi bi-clipboard-check me-2"></i>Control de Comodatos</h4>`,`<div class="d-flex gap-2">`,`<button id="btn-alertas" class="btn btn-warning btn-sm"><i class="bi bi-exclamation-triangle me-1"></i> Alertas</button>`,`<button id="btn-nuevo-comodato" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i> Asignar instrumento</button>`,`</div></div>`,`<div class="card shadow-sm mb-3"><div class="card-body py-2">`,`<form id="filter-form" class="row g-2 align-items-end">`,`<div class="col-md-3"><label class="form-label small mb-0">Tipo comodato</label>`,`<select id="filter-tipo" class="form-select form-select-sm"><option value="">Todos</option>`+k.map(e=>`<option value="`+e+`">`+e+`</option>`).join(``)+`</select></div>`,`<div class="col-md-3"><label class="form-label small mb-0">Estado</label>`,`<select id="filter-estado" class="form-select form-select-sm"><option value="">Todos</option><option value="activo">Activo</option><option value="vencido">Vencido</option><option value="proximo">Próximo a vencer</option></select></div>`,`<div class="col-md-3"><label class="form-label small mb-0">Buscar instrumento</label>`,`<input id="search-input" type="text" class="form-control form-control-sm" placeholder="Código o tipo..."></div>`,`<div class="col-md-3 d-flex gap-1">`,`<button id="btn-filtrar" class="btn btn-sm btn-outline-primary"><i class="bi bi-funnel"></i> Filtrar</button>`,`<button id="btn-limpiar" class="btn btn-sm btn-outline-secondary"><i class="bi bi-x-circle"></i></button>`,`</div></form></div></div>`,`<div class="card shadow-sm"><div class="card-body p-0">`,`<table class="table table-hover mb-0"><thead class="table-light">`,`<tr><th>Código</th><th>Instrumento</th><th>Alumno</th><th>Entrega</th><th>Vencimiento</th><th>Estado ven.</th><th>Estado</th><th></th></tr>`,`</thead><tbody id="tbody-comodatos">`+(c||`<tr><td colspan="8" class="text-center text-muted py-4">Sin comodatos activos</td></tr>`)+`</tbody></table>`,`</div></div></div>`,`<div class="modal fade" id="modal-comodato" tabindex="-1"><div class="modal-dialog"><div class="modal-content">`,`<div class="modal-header"><h5 class="modal-title">Asignar instrumento en comodato</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>`,`<div class="modal-body"><form id="form-comodato" novalidate>`,`<div class="mb-3"><label class="form-label fw-semibold">Instrumento disponible</label><select class="form-select" name="activo_id" required><option value="">— Seleccionar —</option>`+l+`</select></div>`,`<div class="mb-3"><label class="form-label fw-semibold">Alumno</label><select class="form-select" name="alumno_id" id="select-alumno" required><option value="">Cargando...</option></select></div>`,`<div class="row g-3 mb-3"><div class="col-6"><label class="form-label fw-semibold">Tipo comodato</label><select class="form-select" name="tipo_comodato">`+u+`</select></div>`,`<div class="col-6"><label class="form-label fw-semibold">Fecha vencimiento</label><input type="date" class="form-control" name="fecha_vencimiento"></div></div>`,`<div class="mb-3"><label class="form-label fw-semibold">Instrumento propio ID</label><input type="text" class="form-control" name="instrumento_propio_id" placeholder="Opcional"></div>`,`<div class="mb-3"><label class="form-label fw-semibold">Observaciones</label><textarea class="form-control" name="observaciones" rows="2"></textarea></div><div class="mb-3"><label class="form-label fw-semibold">Contrato firmado (PDF)</label><input type="file" class="form-control" id="contrato-file" accept=".pdf,image/*"></div>`,`<div id="modal-comodato-error" class="alert alert-danger d-none"></div>`,`</form></div>`,`<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>`,`<button id="btn-guardar-comodato" class="btn btn-primary"><i class="bi bi-save me-1"></i> Asignar</button></div>`,`</div></div></div>`,`<div class="modal fade" id="modal-historial-alumno" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">`,`<div class="modal-header"><h5 class="modal-title" id="modal-historial-titulo">Historial del alumno</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>`,`<div class="modal-body" id="modal-historial-body"><p>Cargando...</p></div>`,`<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button></div>`,`</div></div></div>`,`<div class="modal fade" id="modal-devolucion" tabindex="-1"><div class="modal-dialog"><div class="modal-content">`,`<div class="modal-header"><h5 class="modal-title">Confirmar devolución</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>`,`<div class="modal-body"><p id="devolucion-info"></p><label class="form-label fw-semibold">Fecha de devolución</label><input type="date" class="form-control" id="input-fecha-devolucion" value="`+new Date().toISOString().split(`T`)[0]+`"></div>`,`<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>`,`<button id="btn-confirmar-devolucion" class="btn btn-danger">Confirmar devolución</button></div>`,`</div></div></div>`].join(`
`),t.from(`alumnos`).select(`id, nombre_completo`).eq(`activo`,!0).order(`nombre_completo`).then(({data:t})=>{let n=e.querySelector(`#select-alumno`);!n||!t||(n.innerHTML=`<option value="">— Seleccionar alumno —</option>`+t.map(e=>`<option value="`+e.id+`">`+e.nombre_completo+`</option>`).join(``))}),e.querySelector(`#btn-alertas`)?.addEventListener(`click`,()=>{window.router?.navigate(`inventario-alertas`)},{signal:r.signal}),e.querySelector(`#btn-nuevo-comodato`)?.addEventListener(`click`,()=>{e.querySelector(`#form-comodato`)?.reset(),e.querySelector(`#modal-comodato-error`)?.classList.add(`d-none`),d(`modal-comodato`)?.show()},{signal:r.signal}),e.querySelector(`#tbody-comodatos`)?.addEventListener(`click`,async t=>{let n=t.target.closest(`button`);if(!n)return;let r=n.dataset.id;if(n.classList.contains(`btn-devolver`)){let{alumno:t,instrumento:i}=n.dataset;e.querySelector(`#devolucion-info`).textContent=`Devolver `+(i||`el instrumento`)+` de `+(t||`alumno`)+`?`,e.querySelector(`#input-fecha-devolucion`).value=new Date().toISOString().split(`T`)[0],e.querySelector(`#btn-confirmar-devolucion`).dataset.id=r,d(`modal-devolucion`)?.show()}else if(n.classList.contains(`btn-renovar`)){if(!confirm(`¿Renovar este comodato?`))return;n.disabled=!0;let{error:t}=await $t(r);t?(alert(`Error: `+t.message),n.disabled=!1):(d(`modal-comodato`)?.hide(),X(e))}else n.classList.contains(`btn-intercambiar`)&&window.router?.navigate(`inventario-intercambio`)},{signal:r.signal}),e.querySelector(`#btn-confirmar-devolucion`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#btn-confirmar-devolucion`).dataset.id;if(!t)return;let n=e.querySelector(`#btn-confirmar-devolucion`);n.disabled=!0;let{error:r}=await nn(t);r?(alert(`Error: `+r.message),n.disabled=!1):(d(`modal-devolucion`)?.hide(),X(e))},{signal:r.signal}),e.querySelector(`#tbody-comodatos`)?.addEventListener(`click`,async t=>{let n=t.target.closest(`.btn-historial-alumno`);if(!n)return;let r=n.dataset.alumnoId,i=n.dataset.alumnoNombre;e.querySelector(`#modal-historial-titulo`).textContent=`Historial de `+(i||`Alumno`);let a=e.querySelector(`#modal-historial-body`);a.innerHTML=`<p>Cargando...</p>`,d(`modal-historial-alumno`)?.show();let{data:o}=await rn(r);a.innerHTML=o&&o.length>0?`<table class="table table-sm"><thead><tr><th>Instrumento</th><th>Entrega</th><th>Devolución</th><th>Estado</th></tr></thead><tbody>`+o.map(e=>`<tr><td>`+(e.inventario_activos&&e.inventario_activos.codigo_inventario||e.activo_id||`---`)+`</td><td>`+(e.fecha_entrega?new Date(e.fecha_entrega).toLocaleDateString(`es-DO`):`---`)+`</td><td>`+(e.fecha_devolucion?new Date(e.fecha_devolucion).toLocaleDateString(`es-DO`):`---`)+`</td><td>`+(e.estado||`---`)+`</td></tr>`).join(``)+`</tbody></table>`:`<p class="text-muted">Sin historial de comodatos.</p>`},{signal:r.signal}),e.querySelector(`#btn-guardar-comodato`)?.addEventListener(`click`,async()=>{let n=e.querySelector(`#form-comodato`),r=e.querySelector(`#modal-comodato-error`),i=new FormData(n),a=i.get(`activo_id`),o=i.get(`alumno_id`),s=i.get(`observaciones`)||null,c=i.get(`tipo_comodato`)||`escolar`,l=i.get(`fecha_vencimiento`)||null,u=i.get(`instrumento_propio_id`)||null;if(!a||!o){r.textContent=`Seleccioná el instrumento y el alumno.`,r.classList.remove(`d-none`);return}let f=e.querySelector(`#btn-guardar-comodato`);f.disabled=!0,f.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;let{data:p}=await t.auth.getSession(),{data:m,error:h}=await tn({activo_id:a,alumno_id:o,observaciones:s,registrado_por:p?.session?.user?.id??null,fecha_entrega:new Date().toISOString().split(`T`)[0],estado:`activo`,tipo_comodato:c,fecha_vencimiento:l,instrumento_propio_id:u});if(f.disabled=!1,f.innerHTML=`<i class="bi bi-save me-1"></i> Asignar`,h)r.textContent=h.message.includes(`uix_comodato_activo`)?`Este instrumento ya tiene un comodato activo.`:h.message,r.classList.remove(`d-none`);else{let t=e.querySelector(`#contrato-file`)?.files?.[0];t&&m?.id&&on(m.id,t),d(`modal-comodato`)?.hide(),X(e)}},{signal:r.signal});function d(t){let r=e.querySelector(`#`+t);return r?new n(r):null}return{teardown:()=>r.abort()}}async function Z(e){let t=new AbortController;e.innerHTML=`<p class="p-4">Verificando alertas...</p>`;let[n,r,i]=await Promise.all([Zt(),Qt(7),an()]),a=n.data||[],o=r.data||[],s=i.data||[],c=a.length+o.length+s.length;if(n.error||r.error||i.error)return e.innerHTML=`<div class="alert alert-danger m-4">Error al cargar alertas</div>`,{teardown:()=>t.abort()};function l(e,t,n,r,i){return r.length===0?``:`<div class="card shadow-sm mb-3 border-`+n+`"><div class="card-header fw-semibold text-bg-`+n+`"><i class="bi `+t+` me-1"></i> `+e+` <span class="badge bg-light text-dark ms-1">`+r.length+`</span></div><div class="card-body p-0"><table class="table table-hover mb-0"><thead class="table-light"><tr><th>Alumno</th><th>Instrumento</th><th>Detalle</th><th>Acción sugerida</th><th></th></tr></thead><tbody>`+r.map((t,r)=>{let a=t.fecha_vencimiento?M(t):null;return`<tr><td>`+(t.alumnos?.nombre_completo||t.alumno_nombre||t.alumno_id||`---`)+`</td><td class="font-monospace small">`+(t.inventario_activos?.codigo_inventario||t.codigo_inventario||t.activo_id||`---`)+`</td><td>`+(a?a.label:t.dias_prestado?t.dias_prestado+` días prestado`:`---`)+`</td><td>`+i(t,r)+`</td><td><button class="btn btn-sm btn-outline-`+n+` btn-resolver" data-type="`+e+`" data-idx="`+r+`"><i class="bi bi-check-circle"></i> Resolver</button></td></tr>`}).join(``)+`</tbody></table></div></div>`}return e.innerHTML=[`<div class="container-fluid p-4">`,`<h4 class="mb-1"><i class="bi bi-exclamation-triangle me-2 text-warning"></i>Alertas de Comodatos</h4>`,`<p class="text-muted small mb-4">`+c+` alerta`+(c===1?``:`s`)+` activa`+(c===1?``:`s`)+`</p>`,l(`Vencidos`,`bi-calendar-x-fill`,`danger`,a,()=>`<span class="badge bg-danger">Devolver urgente</span>`),l(`Vencimiento próximo`,`bi-calendar-warning`,`warning`,o,()=>`<span class="badge bg-warning text-dark">Renovar</span>`),l(`Alumno inactivo`,`bi-person-x-fill`,`info`,s,()=>`<span class="badge bg-info text-dark">Contactar alumno</span>`),c===0?`<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Sin alertas activas.</div>`:``,`</div>`].join(`
`),e.querySelectorAll(`.btn-resolver`).forEach(n=>{n.addEventListener(`click`,async()=>{let t=n.dataset.type,r=parseInt(n.dataset.idx),i,c;t.includes(`Vencidos`)?(i=a,c=`devolver`):t.includes(`Vencimiento`)?(i=o,c=`renovar`):(i=s,c=`contactar`);let l=i[r];if(l)if(n.disabled=!0,c===`renovar`){if(!confirm(`¿Renovar este comodato?`)){n.disabled=!1;return}let{error:t}=await $t(l.id);t?(alert(`Error: `+t.message),n.disabled=!1):Z(e)}else if(c===`devolver`){if(!confirm(`¿Devolver este instrumento?`)){n.disabled=!1;return}let{error:t}=await nn(l.id);t?(alert(`Error: `+t.message),n.disabled=!1):Z(e)}else alert(`Contactar al alumno: `+(l.alumnos?.nombre_completo||l.alumno_nombre||l.alumno_id||`desconocido`)),n.disabled=!1},{signal:t.signal})}),{teardown:()=>t.abort()}}async function cn(e,{activoId:t}){let n=new AbortController;e.innerHTML=`<p class="p-4">Cargando detalle del instrumento...</p>`;let[r,i,a,o,s]=await Promise.all([Gt(t),Jt(t),qt(t),Xt({activo_id:t}),J()]);if(r.error)return e.innerHTML=`<div class="alert alert-danger m-4">Error: ${r.error.message}</div>`,{teardown:()=>n.abort()};let c=r.data,l=i.data||[],u=a.data||[],d=o.data||[],f=(s.data||[]).filter(e=>e.activo_id===t),p=b(c),m=Be(c),h=Re(c),g=ze(c),_=Je(l),v=f.find(e=>e.estado===`activo`);return e.innerHTML=`
    <div class="container-fluid p-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#" id="breadcrumb-inventario">Inventario</a></li>
          <li class="breadcrumb-item active" aria-current="page">${c.codigo_inventario}</li>
        </ol>
      </nav>

      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 class="mb-1">
            <i class="bi bi-music-note me-2"></i>${c.tipo_instrumento}
            <span class="detail-badge ms-2">${S(c.estado_uso)}</span>
            <span class="detail-badge ms-1">${x(c.estado_conservacion)}</span>
          </h4>
          <p class="text-muted mb-0 font-monospace small">${c.codigo_inventario}</p>
        </div>
        <div class="btn-group">
          <button id="btn-editar-activo" class="btn btn-outline-primary btn-sm" data-id="${c.id}">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
          <button id="btn-comodato-activo" class="btn btn-outline-info btn-sm" data-id="${c.id}">
            <i class="bi bi-clipboard-check me-1"></i>Comodato
          </button>
          <button id="btn-reparar-activo" class="btn btn-outline-warning btn-sm" data-id="${c.id}">
            <i class="bi bi-tools me-1"></i>Reparar
          </button>
          <button id="btn-baja-activo" class="btn btn-outline-danger btn-sm" data-id="${c.id}"
            ${h?``:`disabled`}
            title="${g||`Dar de baja`}">
            <i class="bi bi-trash me-1"></i>Baja
          </button>
        </div>
      </div>

      <ul class="nav nav-tabs mb-3" id="detail-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="tab-general-tab" data-bs-toggle="tab" data-bs-target="#tab-general" type="button">General</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-comodato-tab" data-bs-toggle="tab" data-bs-target="#tab-comodato" type="button">Comodato</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-historial-tab" data-bs-toggle="tab" data-bs-target="#tab-historial" type="button">Historial</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-accesorios-tab" data-bs-toggle="tab" data-bs-target="#tab-accesorios" type="button">Accesorios</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-reparaciones-tab" data-bs-toggle="tab" data-bs-target="#tab-reparaciones" type="button">Reparaciones</button>
        </li>
      </ul>

      <div class="tab-content" id="detail-tab-content">
        <div class="tab-pane fade show active" id="tab-general">${`
    <div class="row g-3">
      <div class="col-md-6">
        <table class="table table-sm table-borderless">
          <tr><th class="text-muted ps-0">Código</th><td class="fw-semibold font-monospace">${c.codigo_inventario}</td></tr>
          <tr><th class="text-muted ps-0">Tipo</th><td>${c.tipo_instrumento}</td></tr>
          <tr><th class="text-muted ps-0">Marca</th><td>${c.marca||`—`}</td></tr>
          <tr><th class="text-muted ps-0">Modelo</th><td>${c.modelo||`—`}</td></tr>
          <tr><th class="text-muted ps-0">N° Serie</th><td class="font-monospace">${c.numero_serie||`—`}</td></tr>
          <tr><th class="text-muted ps-0">Ubicación</th><td>${c.ubicacion||`—`}</td></tr>
          <tr><th class="text-muted ps-0">Estado conservación</th><td><span class="${x(c.estado_conservacion)}">${c.estado_conservacion}</span></td></tr>
          <tr><th class="text-muted ps-0">Estado uso</th><td><span class="${S(c.estado_uso)}">${c.estado_uso}</span></td></tr>
        </table>
      </div>
      <div class="col-md-6">
        <table class="table table-sm table-borderless">
          <tr><th class="text-muted ps-0">Fecha adquisición</th><td>${c.fecha_adquisicion?new Date(c.fecha_adquisicion).toLocaleDateString(`es-DO`):`—`}</td></tr>
          <tr><th class="text-muted ps-0">Valor adquisición</th><td>${c.valor_adquisicion?`RD$ ${Number(c.valor_adquisicion).toLocaleString(`es-DO`)}`:`—`}</td></tr>
          <tr><th class="text-muted ps-0">Valor depreciado</th><td>${m===null?`—`:`RD$ ${m.toLocaleString(`es-DO`)}`}</td></tr>
          <tr><th class="text-muted ps-0">Antigüedad</th><td>${p===null?`—`:`${p} años`}</td></tr>
          <tr><th class="text-muted ps-0">Proveedor</th><td>${c.proveedor||`—`}</td></tr>
          <tr><th class="text-muted ps-0">Activo</th><td>${c.activo===!1?`<span class="badge bg-danger">No</span>`:`<span class="badge bg-success">Sí</span>`}</td></tr>
          ${c.fecha_baja?`<tr><th class="text-muted ps-0">Fecha baja</th><td>${new Date(c.fecha_baja).toLocaleDateString(`es-DO`)}</td></tr>`:``}
          ${c.motivo_baja?`<tr><th class="text-muted ps-0">Motivo baja</th><td>${c.motivo_baja}</td></tr>`:``}
        </table>
      </div>
    </div>
    ${c.notas?`<div class="alert alert-secondary mt-2"><strong>Notas:</strong> ${c.notas}</div>`:``}
    ${c.foto_url?`<div class="mt-2"><img src="${c.foto_url}" alt="Foto" class="img-fluid rounded" style="max-height:200px"></div>`:``}
  `}</div>
        <div class="tab-pane fade" id="tab-comodato">${(()=>{if(!v)return`<p class="text-muted py-3">Sin comodato activo para este instrumento.</p>`;let e=M(v);return`
      <table class="table table-sm table-borderless">
        <tr><th class="text-muted ps-0">Alumno</th><td>${v.alumno_nombre||`—`}</td></tr>
        <tr><th class="text-muted ps-0">Fecha entrega</th><td>${new Date(v.fecha_entrega).toLocaleDateString(`es-DO`)}</td></tr>
        <tr><th class="text-muted ps-0">Tipo</th><td>${v.tipo_comodato||`—`}</td></tr>
        <tr><th class="text-muted ps-0">Estado</th><td><span class="${e.clase}">${e.label}</span></td></tr>
        ${v.observaciones?`<tr><th class="text-muted ps-0">Observaciones</th><td>${v.observaciones}</td></tr>`:``}
      </table>
    `})()}</div>
        <div class="tab-pane fade" id="tab-historial">${_.length===0?`<p class="text-muted py-3">Sin eventos registrados.</p>`:_.map(e=>`
      <div class="d-flex gap-3 mb-3">
        <div class="text-center" style="width:40px">
          <i class="bi ${e.icono} fs-4 text-muted"></i>
        </div>
        <div class="flex-grow-1">
          <p class="mb-0 fw-semibold">${e.tipo_label}</p>
          <small class="text-muted">${e.descripcion}</small>
          <br><small class="text-muted">${e.fecha_legible}</small>
        </div>
      </div>
    `).join(``)}</div>
        <div class="tab-pane fade" id="tab-accesorios">${u.length===0?`<p class="text-muted py-3">Sin accesorios asignados.</p>`:`
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Tipo</th><th>Marca</th><th>Cantidad</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${u.map(e=>`
            <tr>
              <td>${e.tipo}</td>
              <td>${e.marca||`—`}</td>
              <td>${e.cantidad}</td>
              <td>${e.estado||`—`}</td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `}</div>
        <div class="tab-pane fade" id="tab-reparaciones">${(()=>{if(d.length===0)return`<p class="text-muted py-3">Sin reparaciones registradas.</p>`;let e=e=>({recibido:`badge bg-secondary`,en_reparacion:`badge bg-warning text-dark`,finalizado:`badge bg-info text-dark`,entregado:`badge bg-success`})[e]||`badge bg-secondary`;return`
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr><th>Descripción</th><th>Tallerista</th><th>Estado</th><th>Ingreso</th><th>Costo</th></tr>
        </thead>
        <tbody>
          ${d.map(t=>`
            <tr>
              <td>${t.descripcion?t.descripcion.substring(0,50):`—`}</td>
              <td>${t.tallerista_nombre||`—`}</td>
              <td><span class="${e(t.estado)}">${t.estado}</span></td>
              <td>${new Date(t.fecha_ingreso).toLocaleDateString(`es-DO`)}</td>
              <td>${t.costo_real?`RD$ ${Number(t.costo_real).toLocaleString(`es-DO`)}`:t.costo_estimado?`RD$ ${Number(t.costo_estimado).toLocaleString(`es-DO`)} (est.)`:`—`}</td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `})()}</div>
      </div>
    </div>
  `,e.querySelector(`#breadcrumb-inventario`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router&&window.router.navigate(`inventario-stock`)},{signal:n.signal}),e.querySelector(`#btn-editar-activo`)?.addEventListener(`click`,()=>{window.router&&window.router.navigate(`inventario-stock`,{editId:c.id})},{signal:n.signal}),e.querySelector(`#btn-comodato-activo`)?.addEventListener(`click`,()=>{window.router&&window.router.navigate(`inventario-comodatos`,{activoId:c.id})},{signal:n.signal}),e.querySelector(`#btn-reparar-activo`)?.addEventListener(`click`,()=>{window.router&&window.router.navigate(`inventario-stock`)},{signal:n.signal}),e.querySelector(`#btn-baja-activo`)?.addEventListener(`click`,async()=>{if(!h||!confirm(`¿Dar de baja el instrumento ${c.codigo_inventario}?`))return;let{error:t}=await Kt(c.id,`de_baja`);t?alert(`Error: ${t.message}`):cn(e,{activoId:c.id})},{signal:n.signal}),{teardown:()=>n.abort()}}async function ln(e,{activoId:t}){let r=new AbortController,i=new Set(C);e.innerHTML=`<p class="p-4">Cargando historial...</p>`,await a();async function a(){let{data:n,error:r}=await Jt(t);if(r){e.innerHTML=`<div class="alert alert-danger m-4">Error: ${r.message}</div>`;return}let a=qe(Je((n||[]).filter(e=>i.has(e.tipo_evento)))),s=Object.entries(a).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>{let[n,r]=e.split(`-`);return`
        <div class="timeline-group mb-4">
          <h6 class="fw-bold text-muted mb-3 border-bottom pb-1">${`${[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`][parseInt(r,10)-1]} ${n}`}</h6>
          <div class="ms-2 border-start border-2 ps-3">
            ${t.map(e=>`
        <div class="timeline-item d-flex gap-3 mb-3 ps-3 position-relative">
          <div class="timeline-dot position-absolute start-0 top-0 mt-1"
            style="width:12px;height:12px;border-radius:50%;background:var(--bs-primary);border:2px solid var(--bs-primary-bg-subtle)">
          </div>
          <div class="text-center flex-shrink-0" style="width:36px">
            <i class="bi ${e.icono} fs-5 text-primary"></i>
          </div>
          <div class="flex-grow-1">
            <p class="mb-0 fw-semibold small">${e.tipo_label}</p>
            <p class="mb-0">${e.descripcion}</p>
            <small class="text-muted">${e.fecha_legible}</small>
            ${e.usuario_id?`<br><small class="text-muted">Por: ${e.usuario_id}</small>`:``}
          </div>
        </div>
      `).join(``)}
          </div>
        </div>
      `}).join(``);e.innerHTML=`
      <div class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0"><i class="bi bi-clock-history me-2"></i>Historial del instrumento</h4>
          <div class="d-flex gap-2">
            <button id="btn-volver" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i> Volver
            </button>
            <button id="btn-agregar-evento" class="btn btn-primary btn-sm">
              <i class="bi bi-plus-lg me-1"></i> Agregar evento manual
            </button>
          </div>
        </div>

        <div class="card shadow-sm mb-3">
          <div class="card-body py-2" id="filter-tipo-evento">
            <label class="form-label small fw-semibold mb-2">Filtrar por tipo de evento</label>
            <div class="d-flex flex-wrap gap-1">
              ${C.map(e=>{let t=Ue[e]||`bi-question-circle`,n=e.replace(/_/g,` `).replace(/\b\w/g,e=>e.toUpperCase());return`
        <div class="form-check form-check-inline">
          <input class="form-check-input filter-evento" type="checkbox" value="${e}"
            ${i.has(e)?`checked`:``}>
          <label class="form-check-label">
            <i class="bi ${t} me-1"></i>${n}
          </label>
        </div>
      `}).join(``)}
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body" id="timeline">
            ${s||`<p class="text-muted text-center py-4">Sin eventos registrados para este instrumento.</p>`}
          </div>
        </div>

        <!-- Modal agregar evento manual -->
        <div class="modal fade" id="modal-evento-manual" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Agregar evento manual</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="form-evento-manual" novalidate>
                  <input type="hidden" name="activo_id" value="${t}">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Tipo de evento</label>
                    <select class="form-select" name="tipo_evento" required>
                      ${C.filter(e=>e!==`creacion`).map(e=>`
                        <option value="${e}">${e.replace(/_/g,` `).replace(/\b\w/g,e=>e.toUpperCase())}</option>
                      `).join(``)}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Descripción</label>
                    <textarea class="form-control" name="descripcion" rows="3" required placeholder="Detalle del evento..."></textarea>
                  </div>
                  <div id="modal-evento-error" class="alert alert-danger d-none"></div>
                </form>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button id="btn-guardar-evento" class="btn btn-primary">
                  <i class="bi bi-save me-1"></i> Guardar evento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,o()}function o(){e.querySelector(`#filter-tipo-evento`)?.addEventListener(`change`,t=>{t.target.closest(`.filter-evento`)&&(i=new Set(Array.from(e.querySelectorAll(`.filter-evento:checked`)).map(e=>e.value)),a())},{signal:r.signal}),e.querySelector(`#btn-agregar-evento`)?.addEventListener(`click`,()=>{e.querySelector(`#form-evento-manual`).reset(),e.querySelector(`#modal-evento-error`).classList.add(`d-none`),s()?.show()},{signal:r.signal}),e.querySelector(`#btn-guardar-evento`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#form-evento-manual`),n=e.querySelector(`#modal-evento-error`),r=new FormData(t),i={activo_id:r.get(`activo_id`),tipo_evento:r.get(`tipo_evento`),descripcion:r.get(`descripcion`)};if(!i.tipo_evento||!i.descripcion.trim()){n.textContent=`Completá todos los campos requeridos.`,n.classList.remove(`d-none`);return}let o=e.querySelector(`#btn-guardar-evento`);o.disabled=!0;let{error:c}=await Yt(i);o.disabled=!1,c?(n.textContent=c.message,n.classList.remove(`d-none`)):(s()?.hide(),a())},{signal:r.signal})}function s(){let t=e.querySelector(`#modal-evento-manual`);return t?new n(t):null}return{teardown:()=>r.abort()}}async function un(e={}){return e&&Object.keys(e).length>0?o(e):l()}async function dn(e,t={}){let n=null;return t.estado===`completada`?n=await c(e,t.feedback??null):(t.estado&&(n=await a(e,t.estado)),t.feedback!=null&&(n=await s(e,t.feedback))),n}async function fn(e){let t=new AbortController;e.innerHTML=`<p class="p-4">Cargando dashboard...</p>`;let[n,r,i,a,o]=await Promise.all([en(),q({pageSize:200}),J(),Xt({}),un({departamento:`LOG`})]);if(n.error)return e.innerHTML=`<div class="alert alert-danger m-4">Error: ${n.error.message}</div>`,{teardown:()=>t.abort()};let s=n.data;r.data?.data||r.data;let c=i.data||[],l=a.data||[],u=o.data||[],d=s.resumen||s,f=s.distribucion_por_tipo||{},p=[`#0d6efd`,`#6f42c1`,`#d63384`,`#fd7e14`,`#ffc107`,`#198754`,`#0dcaf0`,`#dc3545`],m=Object.keys(f).map((e,t)=>{let n=d.total>0?(f[e]/d.total*100).toFixed(1):0;return{label:e,count:f[e],pct:n,color:p[t%p.length]}}),h=m.map((e,t)=>{let n=m.slice(0,t).reduce((e,t)=>e+parseFloat(t.pct),0);return`${e.color} ${n}% ${n+parseFloat(e.pct)}%`}).join(`, `);new Date().setHours(0,0,0,0);let g=(c||[]).filter(e=>e.estado===`activo`&&e.fecha_vencimiento).map(e=>({...e,_vencimiento:M(e)})).filter(e=>!e._vencimiento.label.startsWith(`Sin`)).sort((e,t)=>new Date(e.fecha_vencimiento)-new Date(t.fecha_vencimiento)).slice(0,10).map(e=>`
    <tr>
      <td class="font-monospace small">${e.activo_id||`—`}</td>
      <td>${e.alumno_nombre||`—`}</td>
      <td>${new Date(e.fecha_vencimiento).toLocaleDateString(`es-DO`)}</td>
      <td><span class="${e._vencimiento.clase}">${e._vencimiento.label}</span></td>
    </tr>
  `).join(``),_=[...l].sort((e,t)=>new Date(t.created_at||t.fecha_ingreso)-new Date(e.created_at||e.fecha_ingreso)).slice(0,10).map(e=>{let t={recibido:`badge bg-secondary`,en_reparacion:`badge bg-warning text-dark`,finalizado:`badge bg-info text-dark`,entregado:`badge bg-success`}[e.estado]||`badge bg-secondary`;return`
      <tr>
        <td class="font-monospace small">${e.activo_id||`—`}</td>
        <td>${e.descripcion?e.descripcion.substring(0,40):`—`}</td>
        <td>${e.tallerista_nombre||`—`}</td>
        <td><span class="${t}">${e.estado}</span></td>
        <td>${new Date(e.fecha_ingreso).toLocaleDateString(`es-DO`)}</td>
      </tr>
    `}).join(``);return e.innerHTML=`
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0"><i class="bi bi-speedometer2 me-2"></i>Dashboard de Inventario</h4>
      </div>

      <div class="row g-3 mb-4" id="kpi-row">
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-primary h-100" id="kpi-total">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Total</h6>
              <span class="kpi-value fs-2 fw-bold">${d.total}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-success h-100" id="kpi-disponibles">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Disponibles</h6>
              <span class="kpi-value fs-2 fw-bold">${d.disponibles}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-info h-100" id="kpi-en-uso">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">En uso</h6>
              <span class="kpi-value fs-2 fw-bold">${d.en_uso}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-warning h-100" id="kpi-ociosos">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Ociosos</h6>
              <span class="kpi-value fs-2 fw-bold">${d.ociosos}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-danger h-100" id="kpi-en-reparacion">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">En reparación</h6>
              <span class="kpi-value fs-2 fw-bold">${d.en_reparacion}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-dark h-100" id="kpi-de-baja">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">De baja</h6>
              <span class="kpi-value fs-2 fw-bold">${d.de_baja}</span>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-xl-3">
          <div class="card border-primary h-100" id="kpi-valor-total">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase text-muted">Valor total</h6>
              <span class="kpi-value fs-4 fw-bold text-primary">RD$ ${(d.valor_total||0).toLocaleString(`es-DO`)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">Distribución por tipo</div>
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="text-center">
                ${m.length>0?`
                <div id="pie-chart" class="mx-auto mb-3"
                  style="width:180px;height:180px;border-radius:50%;
                  background: conic-gradient(${h});">
                </div>
                `:`<p class="text-muted">Sin datos</p>`}
                <ul id="pie-legend" class="list-unstyled small text-start d-inline-block">
                  ${m.map(e=>`
                    <li><span class="d-inline-block rounded me-1" style="width:12px;height:12px;background:${e.color}"></span>
                    ${e.label}: ${e.count} (${e.pct}%)</li>
                  `).join(``)}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">Próximos a vencer</div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0" id="tabla-proximos-vencer">
                <thead class="table-light small">
                  <tr><th>Código</th><th>Alumno</th><th>Vencimiento</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  ${g||`<tr><td colspan="4" class="text-center text-muted py-3">Sin comodatos próximos a vencer</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-8">
          <div class="card h-100">
            <div class="card-header fw-semibold">Últimas reparaciones</div>
            <div class="card-body p-0">
              <table class="table table-hover mb-0" id="tabla-ultimas-reparaciones">
                <thead class="table-light small">
                  <tr><th>Activo</th><th>Descripción</th><th>Tallerista</th><th>Estado</th><th>Ingreso</th></tr>
                </thead>
                <tbody>
                  ${_||`<tr><td colspan="5" class="text-center text-muted py-3">Sin reparaciones registradas</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header fw-semibold d-flex justify-content-between align-items-center">
              <span>📋 Tareas de Logística (Hermes)</span>
              <span class="badge bg-primary text-white">${u.filter(e=>e.estado!==`completada`).length}</span>
            </div>
            <div class="card-body p-3" style="max-height: 250px; overflow-y: auto;">
              ${u.filter(e=>e.estado!==`completada`).map(e=>{let t=e.checklist||[],n=t.filter(e=>(e.estado||(e.completado?`completada`:`pendiente`))===`completada`).length,r=t.length>0?Math.round(n/t.length*100):0;return`
                  <div class="p-2 mb-2 rounded-3 border bg-light" id="dash-task-${e.id}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong class="text-dark d-block" style="font-size: 11px;">${e.titulo}</strong>
                        <span class="text-muted" style="font-size: 9px;">Vence: ${e.fecha_vencimiento}</span>
                      </div>
                      <button class="btn btn-outline-success btn-sm btn-quick-complete rounded-pill px-2 py-0" style="font-size: 9px;" data-id="${e.id}">
                        Listo
                      </button>
                    </div>
                    <div class="progress mb-2" style="height: 3px;">
                      <div class="progress-bar bg-success" style="width: ${r}%;"></div>
                    </div>
                    <div class="text-muted" style="font-size: 9px;">${n}/${t.length} pasos listos (${r}%)</div>
                  </div>
                `}).join(``)||`<p class="text-muted small text-center my-3">Sin tareas pendientes de logística.</p>`}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelectorAll(`.btn-quick-complete`).forEach(t=>{t.addEventListener(`click`,async n=>{n.stopPropagation();let r=t.dataset.id;if(confirm(`¿Marcar esta tarea de logística como completada?`)){let{error:t}=await dn(r,{estado:`completada`});t||fn(e)}})}),{teardown:()=>t.abort()}}var Q={disponible:{label:`Disponible`,color:`#059669`,bg:`#d1fae5`},asignado:{label:`Asignado`,color:`#2563eb`,bg:`#dbeafe`},danado:{label:`Dañado`,color:`#dc2626`,bg:`#fee2e2`},en_reparacion:{label:`En reparación`,color:`#d97706`,bg:`#fef3c7`},fuera_de_uso:{label:`Fuera de uso`,color:`#6b7280`,bg:`#f3f4f6`}};function pn(e){let t=Q[e]||{label:e,color:`#374151`,bg:`#f9fafb`};return`<span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:9999px;
    font-size:0.75rem;font-weight:600;background:${t.bg};color:${t.color}">${t.label}</span>`}function mn(e){let t=document.createElement(`form`);return t.id=`form-crear-instrumento`,t.style.cssText=`background:#fff;border:1px solid #e2e8f0;border-radius:12px;
    padding:1.25rem;margin-bottom:1.5rem`,t.innerHTML=`
    <h6 style="font-weight:700;margin:0 0 1rem;color:#111">Registrar nuevo instrumento</h6>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin-bottom:1rem">
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Código *</label>
        <input name="codigo" class="form-control form-control-sm" placeholder="VIO-001" required />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Nombre *</label>
        <input name="nombre" class="form-control form-control-sm" placeholder="Violín 4/4" required />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Tipo</label>
        <input name="tipo" class="form-control form-control-sm" placeholder="cuerda, viento..." />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Marca</label>
        <input name="marca" class="form-control form-control-sm" placeholder="Yamaha" />
      </div>
      <div>
        <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Serie</label>
        <input name="serie" class="form-control form-control-sm" placeholder="SN-12345" />
      </div>
    </div>
    <div style="margin-bottom:1rem">
      <label style="font-size:0.8125rem;font-weight:600;color:#374151;display:block;margin-bottom:0.25rem">Notas</label>
      <textarea name="notas" class="form-control form-control-sm" rows="2" placeholder="Observaciones opcionales..."></textarea>
    </div>
    <div id="crear-error" class="alert alert-danger d-none small py-2"></div>
    <button type="submit" class="btn btn-sm btn-primary">
      <i class="bi bi-plus-circle me-1"></i>Registrar instrumento
    </button>
  `,t.addEventListener(`submit`,async n=>{n.preventDefault();let r=t.querySelector(`[type=submit]`),i=t.querySelector(`#crear-error`),a=Object.fromEntries(new FormData(t));r.disabled=!0,r.textContent=`Guardando...`,i.classList.add(`d-none`);try{await e(a),t.reset()}catch(e){i.textContent=`Error: ${e.message}`,i.classList.remove(`d-none`)}finally{r.disabled=!1,r.innerHTML=`<i class="bi bi-plus-circle me-1"></i>Registrar instrumento`}}),t}function hn(e,t,n,r){let i=document.createElement(`tr`);return i.innerHTML=`
    <td style="font-size:0.8125rem;font-weight:600">${e.codigo}</td>
    <td style="font-size:0.8125rem">${e.nombre}</td>
    <td style="font-size:0.8125rem">${e.tipo||`—`}</td>
    <td style="font-size:0.8125rem">${e.marca||`—`}</td>
    <td>${pn(e.estado)}</td>
    <td style="font-size:0.8125rem">${e.alumno_nombre||`—`}</td>
    <td>
      <div style="display:flex;gap:0.375rem;flex-wrap:wrap">
        <select class="form-select form-select-sm select-estado" style="width:auto;font-size:0.75rem" data-id="${e.id}" data-current="${e.estado}">
          ${Object.entries(Q).map(([t,{label:n}])=>`<option value="${t}" ${t===e.estado?`selected`:``}>${n}</option>`).join(``)}
        </select>
        <button class="btn btn-sm btn-outline-secondary btn-asignar" data-id="${e.id}" style="font-size:0.75rem" title="Asignar a alumno">
          <i class="bi bi-person-check"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger btn-danar" data-id="${e.id}" style="font-size:0.75rem" title="Reportar daño (abre caso Hermes)">
          <i class="bi bi-exclamation-triangle"></i>
        </button>
      </div>
    </td>
  `,i.querySelector(`.select-estado`).addEventListener(`change`,async n=>{let r=n.target.value;if(r!==e.estado){n.target.disabled=!0;try{await t(e.id,r)}catch(t){n.target.value=e.estado,alert(`Error: ${t.message}`)}finally{n.target.disabled=!1}}}),i.querySelector(`.btn-asignar`).addEventListener(`click`,()=>{let t=window.prompt(`Nombre del alumno para asignar "${e.nombre}":`);if(!t?.trim())return;let r=`alu-${Date.now()}`;n(e.id,r,t.trim())}),i.querySelector(`.btn-danar`).addEventListener(`click`,async t=>{let n=window.prompt(`Describí el daño de "${e.nombre}". Esto abre un caso Hermes (Lutería, Inventario, Finanzas, Académico, Comunicación):`);if(n===null)return;let i=t.currentTarget;i.disabled=!0;try{await r(e.id,n.trim()),alert(`Caso abierto: se delegaron tareas a los departamentos involucrados.`)}catch(e){alert(`Error: ${e.message}`)}finally{i.disabled=!1}}),i}async function gn(e){let t=new AbortController;e.innerHTML=`
    <div style="padding:1.5rem;max-width:1100px;margin:0 auto">
      <div style="margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <h5 style="margin:0;font-weight:700;color:#111">Gestión de Instrumentos</h5>
          <p style="margin:0.25rem 0 0;font-size:0.875rem;color:#6b7280">Registro, asignación y cambio de estado</p>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <select id="filtro-estado" class="form-select form-select-sm" style="width:auto">
            <option value="">Todos los estados</option>
            ${Object.entries(Q).map(([e,{label:t}])=>`<option value="${e}">${t}</option>`).join(``)}
          </select>
          <button id="btn-refresh-inst" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
      <div id="form-crear-container"></div>
      <div id="inst-table-container">
        <div class="d-flex justify-content-center align-items-center" style="min-height:200px">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  `;let n=e.querySelector(`#inst-table-container`),r=e.querySelector(`#form-crear-container`),i=e.querySelector(`#filtro-estado`),a=[];async function o(){let e={};i.value&&(e.estado=i.value),n.innerHTML=`<div class="d-flex justify-content-center align-items:center" style="min-height:150px">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`;try{a=await f(e),s()}catch(e){n.innerHTML=`<div class="alert alert-danger">Error al cargar: ${e.message}</div>`}}function s(){if(a.length===0){n.innerHTML=`<div style="text-align:center;padding:2rem;color:#6b7280">
        <i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:0.5rem"></i>
        <p style="margin:0">Sin instrumentos registrados para este filtro.</p>
      </div>`;return}let e=document.createElement(`div`);e.style.cssText=`overflow-x:auto`,e.innerHTML=`
      <table class="table table-sm table-hover" style="font-size:0.875rem;min-width:700px">
        <thead style="background:#f8fafc">
          <tr>
            <th>Código</th><th>Nombre</th><th>Tipo</th><th>Marca</th>
            <th>Estado</th><th>Alumno</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody id="inst-tbody"></tbody>
      </table>
    `;let t=e.querySelector(`#inst-tbody`);a.forEach(e=>{let n=hn(e,async(e,t)=>{await p(e,t),await o()},async(e,t,n)=>{await h(e,t,n),await o()},async(e,t)=>{await d(e,t),await o()});t.appendChild(n)}),n.innerHTML=``,n.appendChild(e)}let c=mn(async e=>{await m(e),await o()});return r.appendChild(c),i.addEventListener(`change`,o,{signal:t.signal}),e.querySelector(`#btn-refresh-inst`).addEventListener(`click`,o,{signal:t.signal}),await o(),{teardown(){t.abort()}}}function _n(e,n){let r=n?.user?.email??`Usuario`;e.style.background=`#f8fafc`,e.innerHTML=`
    <nav style="background:linear-gradient(90deg,#2563eb,#0891b2);color:#fff;
      padding:0 1.5rem;height:56px;display:flex;align-items:center;
      justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:sticky;top:0;z-index:100">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <i class="bi bi-music-note-list" style="font-size:1.25rem"></i>
        <span style="font-weight:700;font-size:1rem;letter-spacing:0.02em">Portal de Inventario</span>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span style="font-size:0.8125rem;opacity:0.85">${r}</span>
        <button id="btn-logout" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
          color:#fff;border-radius:8px;padding:0.25rem 0.75rem;font-size:0.8125rem;cursor:pointer">
          <i class="bi bi-box-arrow-right me-1"></i>Salir
        </button>
      </div>
    </nav>

    <div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:0 1.5rem;display:flex;gap:0">
      <button class="portal-tab active" data-view="dashboard"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-speedometer2 me-1"></i>Inicio
      </button>
      <button class="portal-tab" data-view="stock"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-music-note-list me-1"></i>Instrumentos
      </button>
      <button class="portal-tab" data-view="comodatos"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-clipboard-check me-1"></i>Comodatos
      </button>
      <button class="portal-tab" data-view="alertas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-exclamation-triangle me-1"></i>Alertas
      </button>
      <button class="portal-tab" data-view="tareas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-list-task me-1"></i>Tareas (Hermes)
      </button>
      <button class="portal-tab" data-view="instrumentos-gestion"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-music-note-beamed me-1"></i>Instrumentos
      </button>
    </div>

    <div id="portal-content" style="background:#f8fafc;min-height:calc(100vh - 105px)"></div>
  `;let i=e.querySelector(`#portal-content`),a=null;function o(t){e.querySelectorAll(`.portal-tab`).forEach(e=>{let n=e.dataset.view===t;e.style.borderBottomColor=n?`#2563eb`:`transparent`,e.style.color=n?`#2563eb`:`#64748b`}),a?.teardown?.(),t===`dashboard`?fn(i).then(e=>{a=e}):t===`stock`?sn(i).then(e=>{a=e}):t===`comodatos`?X(i).then(e=>{a=e}):t===`alertas`?Z(i).then(e=>{a=e}):t===`tareas`?u(i,{departamento:`LOG`,hideCalendarBtn:!0}).then(e=>{a=e}):t===`instrumentos-gestion`&&gn(i).then(e=>{a=e})}e.querySelectorAll(`.portal-tab`).forEach(e=>{e.addEventListener(`click`,()=>o(e.dataset.view))}),e.querySelector(`#btn-logout`)?.addEventListener(`click`,async()=>{await t.auth.signOut(),window.location.reload()}),window.router={navigate:(e,t)=>{e===`inventario-dashboard`?o(`dashboard`):e===`inventario-stock`?o(`stock`):e===`inventario-comodatos`?o(`comodatos`):e===`inventario-alertas`?o(`alertas`):e===`inventario-tareas`?o(`tareas`):e===`inventario-instrumentos`?o(`instrumentos-gestion`):e===`inventario-detalle`?(a?.teardown?.(),cn(i,t).then(e=>{a=e})):e===`inventario-historial`&&(a?.teardown?.(),ln(i,t).then(e=>{a=e}))}},o(`dashboard`)}async function vn(e){let{data:n}=await t.from(`profiles`).select(`rol`).eq(`id`,e).maybeSingle();return n?.rol===`admin`||n?.rol===`inventarista`}function $(e,n=null){e.style.background=``,e.innerHTML=`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#2563eb 0%,#0891b2 100%)">
      <div style="background:#fff;border-radius:16px;padding:2.5rem;width:100%;max-width:380px;
        box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;background:#dbeafe;border-radius:50%;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <i class="bi bi-music-note-list" style="font-size:1.5rem;color:#2563eb"></i>
          </div>
          <h4 style="color:#111;margin:0;font-weight:700">Portal de Inventario</h4>
          <p style="color:#6b7280;font-size:0.875rem;margin-top:0.25rem">El Sistema Punta Cana</p>
        </div>
        ${n?`<div class="alert alert-danger py-2 small">${n}</div>`:``}
        <form id="login-form">
          <div class="mb-3">
            <input type="email" id="email" class="form-control" placeholder="Correo electrónico" required autofocus />
          </div>
          <div class="mb-4">
            <input type="password" id="password" class="form-control" placeholder="Contraseña" required />
          </div>
          <div id="login-error" class="alert alert-danger d-none small py-2"></div>
          <button type="submit" id="btn-login" class="btn w-100 fw-semibold"
            style="background:#2563eb;color:#fff;border:none">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  `,document.querySelector(`#login-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=document.querySelector(`#email`).value,i=document.querySelector(`#password`).value,a=document.querySelector(`#btn-login`),o=document.querySelector(`#login-error`);a.disabled=!0,a.textContent=`Entrando...`,o.classList.add(`d-none`);let{data:s,error:c}=await t.auth.signInWithPassword({email:r,password:i});if(c){o.textContent=`Credenciales incorrectas.`,o.classList.remove(`d-none`),a.disabled=!1,a.textContent=`Iniciar sesión`;return}if(!await vn(s.session.user.id)){await t.auth.signOut(),$(e,`Tu cuenta no tiene acceso a este portal.`);return}_n(e,s.session)})}async function yn(){let e=document.querySelector(`#app`),{data:{session:n},error:r}=await t.auth.getSession();if(r||!n){$(e);return}if(!await vn(n.user.id)){$(e,`Tu cuenta no tiene acceso a este portal.`);return}_n(e,n)}yn();