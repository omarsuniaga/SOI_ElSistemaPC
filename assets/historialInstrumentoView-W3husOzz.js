const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/reportes-CsoDPoh8.js","assets/AppModal-Du6jXNYA.js"])))=>i.map(i=>d[i]);
import{s as e}from"./AppModal-Du6jXNYA.js";import{a as t,i as n}from"./supabase-Cgh_dhNB.js";import{t as r}from"./vendor-mK9cUK6A.js";import{t as i}from"./config-CNiOV0RX.js";import{S as a,d as o,i as s,m as c,p as l}from"./tareas-DhHTOK4G.js";async function u(e={}){return e&&Object.keys(e).length>0?l(e):o()}async function d(e,t={}){let n=null;return t.estado===`completada`?n=await s(e,t.feedback??null):(t.estado&&(n=await a(e,t.estado)),t.feedback!=null&&(n=await c(e,t.feedback))),n}var f=e({actualizarAccesorio:()=>x,actualizarActivo:()=>_,actualizarReparacion:()=>se,anularFactura:()=>pe,cambiarEstadoActivo:()=>v,cambiarEstadoReparacion:()=>S,crearAccesorio:()=>b,crearActivo:()=>g,crearComodato:()=>xe,crearEventoManual:()=>re,crearFacturaReparacion:()=>de,crearReparacion:()=>oe,devolverComodato:()=>Se,eliminarAccesorio:()=>te,eliminarReparacion:()=>ce,generarContratoPDF:()=>ve,generarReporte:()=>ye,intercambiarInstrumentos:()=>ge,obtenerAccesorios:()=>ee,obtenerActivoPorId:()=>h,obtenerActivos:()=>m,obtenerActivosOciosos:()=>Te,obtenerComodatosActivos:()=>we,obtenerComodatosAlumno:()=>Ce,obtenerComodatosPorVencer:()=>he,obtenerComodatosVencidos:()=>me,obtenerFactura:()=>ue,obtenerFacturasReparacion:()=>le,obtenerHistorialActivo:()=>ne,obtenerKPI:()=>be,obtenerReparacion:()=>ae,obtenerReparaciones:()=>ie,registrarPagoFactura:()=>fe,renovarComodato:()=>_e,subirContratoComodato:()=>Ee,subirFotoActivo:()=>y});function p(e){return{data:null,error:e?{code:e.code||500,message:e.message||`Error interno`}:null}}async function m(e={}){try{let t=n.from(`inventario_activos`).select(`*`,{count:`exact`}).eq(`activo`,!0).order(`codigo_inventario`);if(e.estado_uso&&(t=t.eq(`estado_uso`,e.estado_uso)),e.tipo_instrumento&&(t=t.ilike(`tipo_instrumento`,`%`+e.tipo_instrumento+`%`)),e.estado_conservacion&&(t=t.eq(`estado_conservacion`,e.estado_conservacion)),e.ubicacion&&(t=t.ilike(`ubicacion`,`%`+e.ubicacion+`%`)),e.q){let n=e.q.toLowerCase();t=t.or(`codigo_inventario.ilike.%`+n+`%,tipo_instrumento.ilike.%`+n+`%,marca.ilike.%`+n+`%,modelo.ilike.%`+n+`%`)}if(e.page&&e.pageSize){let n=(e.page-1)*e.pageSize;t=t.range(n,n+e.pageSize-1)}let{data:r,error:i,count:a}=await t;return i?p(i):{data:r,total:a,error:null}}catch(e){return p(e)}}async function h(e){try{let{data:t,error:r}=await n.from(`inventario_activos`).select(`*, inventario_accesorios(*), comodatos_activos(*)`).eq(`id`,e).single();return r?p(r):t?{data:t,error:null}:{data:null,error:{code:404,message:`Activo no encontrado`}}}catch(e){return p(e)}}async function g(e){try{let{data:t,error:r}=await n.from(`inventario_activos`).insert([e]).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function _(e,t){try{let{data:r,error:i}=await n.from(`inventario_activos`).update(t).eq(`id`,e).select().single();return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function v(e,t){try{let{data:r,error:i}=await n.rpc(`cambiar_estado_activo`,{p_id:e,p_nuevo_estado:t});return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function y(e,t){try{let r=t.name?t.name.split(`.`).pop():`jpg`,i=`activos/`+e+`/foto.`+r,{error:a}=await n.storage.from(`inventario`).upload(i,t,{upsert:!0});if(a)return p(a);let{data:o}=n.storage.from(`inventario`).getPublicUrl(i),{data:s,error:c}=await n.from(`inventario_activos`).update({foto_url:o.publicUrl}).eq(`id`,e).select().single();return c?p(c):{data:s,error:null}}catch(e){return p(e)}}async function ee(e){try{let t=n.from(`inventario_accesorios`).select(`*, inventario_activos!inner(codigo_inventario, tipo_instrumento)`).order(`created_at`,{ascending:!1});e&&(t=t.eq(`activo_id`,e));let{data:r,error:i}=await t;return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function b(e){try{let{data:t,error:r}=await n.from(`inventario_accesorios`).insert([e]).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function x(e,t){try{let{data:r,error:i}=await n.from(`inventario_accesorios`).update(t).eq(`id`,e).select().single();return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function te(e){try{let{data:t,error:r}=await n.from(`inventario_accesorios`).delete().eq(`id`,e).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function ne(e,t={}){try{let r=n.from(`inventario_historial`).select(`*`).eq(`activo_id`,e).order(`fecha`,{ascending:!1});t.tipo_evento&&(r=r.eq(`tipo_evento`,t.tipo_evento)),t.limit&&(r=r.limit(t.limit));let{data:i,error:a}=await r;return a?p(a):{data:i,error:null}}catch(e){return p(e)}}async function re(e){try{let{data:t,error:r}=await n.from(`inventario_historial`).insert([{activo_id:e.activo_id,tipo_evento:e.tipo_evento,descripcion:e.descripcion,usuario_id:e.usuario_id||null,metadata:e.metadata||null}]).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function ie(e={}){try{let t=n.from(`inventario_reparaciones`).select(`*, inventario_activos!inner(codigo_inventario, tipo_instrumento, marca)`).order(`created_at`,{ascending:!1});e.estado&&(t=t.eq(`estado`,e.estado)),e.activo_id&&(t=t.eq(`activo_id`,e.activo_id)),e.desde&&(t=t.gte(`fecha_ingreso`,e.desde)),e.hasta&&(t=t.lte(`fecha_ingreso`,e.hasta));let{data:r,error:i}=await t;return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function ae(e){try{let{data:t,error:r}=await n.from(`inventario_reparaciones`).select(`*, inventario_activos!inner(codigo_inventario, tipo_instrumento, marca, modelo)`).eq(`id`,e).single();return r?p(r):t?{data:t,error:null}:{data:null,error:{code:404,message:`Reparación no encontrada`}}}catch(e){return p(e)}}async function oe(e){try{let{data:t,error:r}=await n.rpc(`crear_reparacion`,{p_activo_id:e.activo_id,p_tipo_tallerista:e.tipo_tallerista,p_tallerista_nombre:e.tallerista_nombre,p_descripcion:e.descripcion,p_costo_estimado:e.costo_estimado,p_proveedor_factura_url:e.proveedor_factura_url});return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function se(e,t){try{let{data:r,error:i}=await n.from(`inventario_reparaciones`).update(t).eq(`id`,e).select().single();return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function S(e,t){try{let{data:r,error:i}=await n.rpc(`cambiar_estado_reparacion`,{p_id:e,p_nuevo_estado:t});return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function ce(e){try{let{data:t,error:r}=await n.from(`inventario_reparaciones`).delete().eq(`id`,e).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function le(e={}){try{let t=n.from(`facturas_reparacion`).select(`*, inventario_reparaciones!inner(activo_id, descripcion)`).order(`created_at`,{ascending:!1});e.estado_pago&&(t=t.eq(`estado_pago`,e.estado_pago)),e.tipo_factura&&(t=t.eq(`tipo_factura`,e.tipo_factura)),e.desde&&(t=t.gte(`fecha_emision`,e.desde)),e.hasta&&(t=t.lte(`fecha_emision`,e.hasta));let{data:r,error:i}=await t;return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function ue(e){try{let{data:t,error:r}=await n.from(`facturas_reparacion`).select(`*, inventario_reparaciones!inner(*)`).eq(`id`,e).single();return r?p(r):t?{data:t,error:null}:{data:null,error:{code:404,message:`Factura no encontrada`}}}catch(e){return p(e)}}async function de(e){try{let{data:t,error:r}=await n.from(`facturas_reparacion`).insert([e]).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function fe(e,t={}){try{let r={estado_pago:`pagado`,fecha_pago:t.fecha_pago||new Date().toISOString().split(`T`)[0]};t.metodo_pago&&(r.metodo_pago=t.metodo_pago);let{data:i,error:a}=await n.from(`facturas_reparacion`).update(r).eq(`id`,e).eq(`estado_pago`,`pendiente`).select().single();return a?p(a):i?{data:i,error:null}:{data:null,error:{code:400,message:`Factura no encontrada o ya no está pendiente`}}}catch(e){return p(e)}}async function pe(e){try{let{data:t,error:r}=await n.from(`facturas_reparacion`).update({estado_pago:`anulada`}).eq(`id`,e).eq(`estado_pago`,`pendiente`).select().single();return r?p(r):t?{data:t,error:null}:{data:null,error:{code:400,message:`Factura no encontrada o no está pendiente`}}}catch(e){return p(e)}}async function me(){try{let e=new Date().toISOString().split(`T`)[0],{data:t,error:r}=await n.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca), alumnos(nombre_completo)`).eq(`estado`,`activo`).lt(`fecha_vencimiento`,e).order(`fecha_vencimiento`,{ascending:!0});return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function he(e=7){try{let t=new Date().toISOString().split(`T`)[0],r=new Date;r.setDate(r.getDate()+e);let i=r.toISOString().split(`T`)[0],{data:a,error:o}=await n.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca), alumnos(nombre_completo)`).eq(`estado`,`activo`).gte(`fecha_vencimiento`,t).lte(`fecha_vencimiento`,i).order(`fecha_vencimiento`,{ascending:!0});return o?p(o):{data:a,error:null}}catch(e){return p(e)}}async function ge(e,t,r){try{let{data:i,error:a}=await n.rpc(`intercambiar_instrumentos`,{p_comodato_origen_id:e,p_activo_destino_id:t,p_alumno_id:r});return a?p(a):{data:i,error:null}}catch(e){return p(e)}}async function _e(e,t){try{let{data:r,error:i}=await n.rpc(`renovar_comodato`,{p_comodato_id:e,p_nueva_fecha_vencimiento:t?.fecha_vencimiento,p_nuevo_tipo:t?.tipo_comodato});return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function ve(e){try{let{data:t,error:r}=await n.rpc(`generar_contrato_pdf`,{p_comodato_id:e});return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function ye(e,t={}){try{let{data:r,error:i}=await n.rpc(`generar_reporte_inventario`,{p_tipo:e,p_filtros:t});return i?p(i):{data:r,error:null}}catch(e){return p(e)}}async function be(){try{let{data:e,error:t}=await n.rpc(`obtener_kpi_inventario`);return t?p(t):{data:e,error:null}}catch(e){return p(e)}}async function xe(e){try{let{data:t,error:r}=await n.from(`comodatos_activos`).insert([e]).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function Se(e){try{let{data:t,error:r}=await n.from(`comodatos_activos`).update({estado:`devuelto`,fecha_devolucion:new Date().toISOString().split(`T`)[0]}).eq(`id`,e).select().single();return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function Ce(e){try{let{data:t,error:r}=await n.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca, modelo)`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1});return r?p(r):{data:t,error:null}}catch(e){return p(e)}}async function we(){try{let{data:e,error:t}=await n.from(`comodatos_activos`).select(`*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca, modelo), alumnos(nombre_completo)`).eq(`estado`,`activo`).order(`fecha_entrega`,{ascending:!1});return t?p(t):{data:e,error:null}}catch(e){return p(e)}}async function Te(){try{let{data:e,error:t}=await n.from(`vw_activos_ociosos`).select(`*`).order(`dias_prestado`,{ascending:!1});return t?p(t):{data:e,error:null}}catch(e){return p(e)}}async function Ee(e,t){try{let r=`comodatos/`+e+`/contrato.pdf`,{error:i}=await n.storage.from(`documentos`).upload(r,t,{upsert:!0,contentType:`application/pdf`});if(i)return p(i);let{data:a}=n.storage.from(`documentos`).getPublicUrl(r),{data:o,error:s}=await n.from(`comodatos_activos`).update({contrato_firmado_url:a.publicUrl}).eq(`id`,e).select().single();return s?p(s):{data:o,error:null}}catch(e){return p(e)}}var De=[`disponible`,`prestado`,`en_mantenimiento`,`en_reparacion`,`de_baja`],Oe={disponible:[`prestado`,`en_mantenimiento`,`en_reparacion`,`de_baja`],prestado:[`disponible`,`en_mantenimiento`,`en_reparacion`],en_mantenimiento:[`disponible`,`en_reparacion`],en_reparacion:[`disponible`,`en_mantenimiento`],de_baja:[]};function ke(e,t){let n=Oe[e];return n?n.includes(t):!1}function C(e){let t=[];return e.tipo_instrumento||t.push(`tipo_instrumento es requerido`),e.codigo_inventario?/^V8-[A-Z]{3,4}-\d{3,}$/.test(e.codigo_inventario)||t.push(`codigo_inventario debe tener formato V8-XXX-001`):t.push(`codigo_inventario es requerido`),e.estado_uso&&!De.includes(e.estado_uso)&&t.push(`estado_uso inválido: ${e.estado_uso}`),e.estado_conservacion&&![`excelente`,`bueno`,`regular`,`mantenimiento`,`de_baja`].includes(e.estado_conservacion)&&t.push(`estado_conservacion inválido: ${e.estado_conservacion}`),e.valor_adquisicion!=null&&e.valor_adquisicion<0&&t.push(`valor_adquisicion no puede ser negativo`),t}function w(e){if(!e.fecha_adquisicion)return null;let t=new Date(e.fecha_adquisicion),n=new Date,r=n.getFullYear()-t.getFullYear(),i=n.getMonth()-t.getMonth();return i<0||i===0&&n.getDate()<t.getDate()?r-1:r}function Ae(e){return!(!e.activo||e.estado_uso===`prestado`||e.estado_uso===`en_reparacion`||e.estado_uso===`de_baja`)}function je(e){return e.activo?e.estado_uso===`prestado`?`El instrumento está en comodato activo.`:e.estado_uso===`en_reparacion`?`El instrumento está en reparación.`:e.estado_uso===`de_baja`?`El instrumento ya está dado de baja.`:null:`Instrumento inactivo o dado de baja del sistema.`}function Me(e){if(e.valor_adquisicion==null)return null;if(!e.fecha_adquisicion)return e.valor_adquisicion;let t=w(e);if(t>=10)return 0;let n=e.valor_adquisicion/10*t;return Math.max(0,e.valor_adquisicion-n)}function T(e){return{excelente:`badge bg-success`,bueno:`badge bg-primary`,regular:`badge bg-warning text-dark`,mantenimiento:`badge bg-orange text-dark`,de_baja:`badge bg-danger`}[e]??`badge bg-secondary`}function E(e){return{disponible:`badge bg-success`,prestado:`badge bg-info text-dark`,en_mantenimiento:`badge bg-warning text-dark`,en_reparacion:`badge bg-danger`,de_baja:`badge bg-dark`}[e]??`badge bg-secondary`}var Ne=[`funda`,`arco`,`cuerdas`,`boquilla`,`atril`,`parlante`,`cable`,`otro`];function Pe(e){let t=[];return e.tipo?Ne.includes(e.tipo)||t.push(`tipo inválido: ${e.tipo}. Válidos: ${Ne.join(`, `)}`):t.push(`tipo es requerido`),e.activo_id||t.push(`activo_id es requerido`),(!e.cantidad||e.cantidad<=0)&&t.push(`cantidad debe ser mayor a 0`),t}var D=[`asignacion`,`devolucion`,`reparacion`,`cambio_estado`,`baja`,`creacion`,`observacion`],Fe={asignacion:`bi-clipboard-check`,devolucion:`bi-box-arrow-left`,reparacion:`bi-tools`,cambio_estado:`bi-arrow-repeat`,baja:`bi-trash`,creacion:`bi-plus-circle`,observacion:`bi-chat-dots`},Ie=0;function Le(){return Ie++,`evt-${Date.now()}-${Ie}`}function O(e,t,n,r,i){if(!D.includes(t))throw Error(`tipo_evento inválido: ${t}. Válidos: ${D.join(`, `)}`);return{id:Le(),activo_id:e,tipo_evento:t,descripcion:n,fecha:new Date().toISOString(),usuario_id:r||null,metadata:i||null}}function Re(e){let t=new Date(e.fecha).toLocaleDateString(`es-DO`,{year:`numeric`,month:`long`,day:`numeric`,hour:`2-digit`,minute:`2-digit`});return{...e,icono:Fe[e.tipo_evento]||`bi-question-circle`,fecha_legible:t,tipo_label:e.tipo_evento.replace(/_/g,` `).replace(/\b\w/g,e=>e.toUpperCase())}}function ze(e){let t={};return e.forEach(e=>{let n=new Date(e.fecha),r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}`;t[r]||(t[r]=[]),t[r].push(e)}),t}function Be(e){return[...e].sort((e,t)=>new Date(t.fecha)-new Date(e.fecha)).map(e=>Re(e))}var Ve=[`recibido`,`en_reparacion`,`finalizado`,`entregado`],He={recibido:[`en_reparacion`],en_reparacion:[`finalizado`],finalizado:[`entregado`],entregado:[]},Ue=[`externo`,`luthier_interno`];function We(e,t){let n=He[e];return n?n.includes(t):!1}function Ge(e){let t=[];return e.activo_id||t.push(`activo_id es requerido`),e.descripcion||t.push(`descripcion es requerida`),e.tipo_tallerista?Ue.includes(e.tipo_tallerista)||t.push(`tipo_tallerista inválido: ${e.tipo_tallerista}. Válidos: ${Ue.join(`, `)}`):t.push(`tipo_tallerista es requerido`),!e.tallerista_nombre&&e.tipo_tallerista&&t.push(`tallerista_nombre es requerido`),e.costo_estimado!=null&&e.costo_estimado<0&&t.push(`costo_estimado no puede ser negativo`),t}function Ke(e){if(!e.fecha_ingreso||!e.fecha_egreso)return 0;let t=new Date(e.fecha_ingreso),n=new Date(e.fecha_egreso);return Math.max(0,Math.floor((n-t)/(1e3*60*60*24)))}var qe=[`efectivo`,`transferencia`,`deposito`,`tarjeta`],Je=[`alumno`,`institucion`];function Ye(e,t){return t===void 0&&(t=.18),e*t}function Xe(e,t){return e+t}function Ze(e){return`RD $${Number(e).toFixed(2)}`}function Qe(e){let t=[];return e.reparacion_id||t.push(`reparacion_id es requerido`),(!e.monto_total||e.monto_total<=0)&&t.push(`monto_total debe ser mayor a 0`),e.metodo_pago?qe.includes(e.metodo_pago)||t.push(`metodo_pago inválido: ${e.metodo_pago}. Válidos: ${qe.join(`, `)}`):t.push(`metodo_pago es requerido`),e.tipo_factura&&!Je.includes(e.tipo_factura)&&t.push(`tipo_factura inválido: ${e.tipo_factura}. Válidos: ${Je.join(`, `)}`),t}function $e(e){return e.estado_pago===`pendiente`}function et(e){return{...e,estado_pago:`pagado`,fecha_pago:new Date().toISOString().split(`T`)[0]}}var tt=[`escolar`,`anual`,`eventual`];function nt(e,t){return!(e.estado!==`activo`||!t.activo||t.estado_uso===`en_reparacion`||t.estado_uso===`de_baja`)}function rt(e,t,n,r){if(!nt(e,r))throw Error(`No se puede intercambiar: el comodato origen no puede intercambiarse con el activo destino`);if(!nt(t,n))throw Error(`No se puede intercambiar: el comodato destino no puede intercambiarse con el activo origen`);return{comodatoOrigenActualizado:{...e,activo_id:r.id,intercambiado_con_id:t.id},comodatoDestinoActualizado:{...t,activo_id:n.id,intercambiado_con_id:e.id}}}function k(e){if(!e.fecha_vencimiento)return null;let t=new Date;t.setHours(0,0,0,0);let n=e.fecha_vencimiento.split(`-`),r=new Date(Number(n[0]),Number(n[1])-1,Number(n[2]));return r.setHours(0,0,0,0),Math.round((r-t)/(1e3*60*60*24))}function it(e){if(e.estado!==`activo`)return!1;let t=k(e);return t!==null&&t<=30}function A(e){let t=k(e);return t===null?{label:`Sin vencimiento`,clase:`badge bg-secondary`}:t<0?{label:`Vencido hace ${Math.abs(t)} días`,clase:`badge bg-danger`}:t===0?{label:`Vence hoy`,clase:`badge bg-danger`}:t<=7?{label:`Vence en ${t} días`,clase:`badge bg-warning text-dark`}:t<=30?{label:`Vence en ${t} días`,clase:`badge bg-info text-dark`}:{label:`Vence en ${t} días`,clase:`badge bg-success`}}var at=e({actualizarAccesorio:()=>vt,actualizarActivo:()=>pt,actualizarReparacion:()=>Tt,anularFactura:()=>Mt,cambiarEstadoActivo:()=>mt,cambiarEstadoReparacion:()=>Et,crearAccesorio:()=>_t,crearActivo:()=>ft,crearComodato:()=>Nt,crearEventoManual:()=>xt,crearFacturaReparacion:()=>At,crearReparacion:()=>wt,devolverComodato:()=>Wt,eliminarAccesorio:()=>yt,eliminarReparacion:()=>Dt,generarContratoPDF:()=>zt,generarReporte:()=>Bt,intercambiarInstrumentos:()=>It,obtenerAccesorios:()=>gt,obtenerActivoPorId:()=>dt,obtenerActivos:()=>ut,obtenerActivosOciosos:()=>Gt,obtenerComodatosActivos:()=>Ut,obtenerComodatosAlumno:()=>Ht,obtenerComodatosPorVencer:()=>Ft,obtenerComodatosVencidos:()=>Pt,obtenerFactura:()=>kt,obtenerFacturasReparacion:()=>Ot,obtenerHistorialActivo:()=>bt,obtenerKPI:()=>Vt,obtenerReparacion:()=>Ct,obtenerReparaciones:()=>St,registrarPagoFactura:()=>jt,renovarComodato:()=>Rt,subirContratoComodato:()=>Kt,subirFotoActivo:()=>ht}),ot=100;function j(){return ot++,`mock-`+ot+`-`+Date.now()}function M(){let e=50+Math.random()*100;return new Promise(t=>setTimeout(t,e))}function N(e){return JSON.parse(JSON.stringify(e))}function st(e,t=1,n=20){let r=(t-1)*n;return{data:e.slice(r,r+n),total:e.length,page:t,pageSize:n}}function P(e){return{data:null,error:{code:404,message:`${e} no encontrado`}}}var F=()=>new Date().toISOString().split(`T`)[0];function I(e={}){return{id:j(`act`),codigo_inventario:`V8-VIO-001`,tipo_instrumento:`Violín`,marca:`Marca Test`,modelo:`Modelo X`,numero_serie:`SN-001`,ubicacion:`Aula 1`,estado_conservacion:`bueno`,estado_uso:`disponible`,activo:!0,fecha_adquisicion:`2020-01-15`,valor_adquisicion:15e3,proveedor:`Proveedor Test`,foto_url:null,fecha_baja:null,motivo_baja:null,created_at:`2024-01-01T00:00:00Z`,updated_at:`2024-01-01T00:00:00Z`,...e}}function L(e={}){return{id:j(`acc`),activo_id:null,tipo:`funda`,marca:`Marca Acc`,cantidad:1,estado:`nuevo`,observaciones:``,fecha_asignacion:null,...e}}function R(e={}){return{id:j(`hst`),activo_id:null,tipo_evento:`observacion`,descripcion:`Evento generado`,fecha:new Date().toISOString(),usuario_id:null,metadata:null,...e}}function z(e={}){return{id:j(`rep`),activo_id:null,tipo_tallerista:`externo`,tallerista_nombre:`Tallerista Test`,descripcion:`Reparación de rutina`,costo_estimado:1e3,costo_real:null,fecha_ingreso:F(),fecha_egreso:null,estado:`recibido`,proveedor_factura_url:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...e}}function ct(e={}){return{id:j(`fac`),reparacion_id:null,monto_total:1e3,impuestos:180,metodo_pago:`efectivo`,responsable_id:null,tipo_factura:`alumno`,fecha_emision:F(),pdf_generado_url:null,estado_pago:`pendiente`,fecha_pago:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...e}}function B(e={}){return{id:j(`com`),activo_id:null,alumno_id:null,alumno_nombre:`Alumno Test`,fecha_entrega:`2025-01-15`,fecha_devolucion:null,fecha_vencimiento:null,estado:`activo`,tipo_comodato:`escolar`,instrumento_propio_id:null,renovado_de_id:null,intercambiado_con_id:null,contrato_firmado_url:null,...e}}function V(e={}){return{id:j(`alu`),nombre_completo:`Alumno Test`,email:`alumno@test.com`,telefono:`809-000-0000`,...e}}function lt(){let e=I({id:`act-001`,codigo_inventario:`V8-VIO-001`,tipo_instrumento:`Violín`,marca:`Stradivarius`,modelo:`Model 1`,estado_uso:`disponible`,estado_conservacion:`bueno`,fecha_adquisicion:`2020-01-15`,valor_adquisicion:15e3}),t=I({id:`act-002`,codigo_inventario:`V8-VIO-002`,tipo_instrumento:`Violín`,marca:`Yamaha`,modelo:`V5`,estado_uso:`prestado`,estado_conservacion:`bueno`,fecha_adquisicion:`2021-06-01`,valor_adquisicion:12e3}),n=I({id:`act-003`,codigo_inventario:`V8-CEL-001`,tipo_instrumento:`Cello`,marca:`Eastman`,modelo:`VC100`,estado_uso:`disponible`,estado_conservacion:`excelente`,fecha_adquisicion:`2022-03-10`,valor_adquisicion:45e3}),r=I({id:`act-004`,codigo_inventario:`V8-GUI-001`,tipo_instrumento:`Guitarra`,marca:`Alhambra`,modelo:`4P`,estado_uso:`en_reparacion`,estado_conservacion:`regular`,fecha_adquisicion:`2019-11-20`,valor_adquisicion:8e3}),i=I({id:`act-005`,codigo_inventario:`V8-FLA-001`,tipo_instrumento:`Flauta`,marca:`Yamaha`,modelo:`YFL-222`,estado_uso:`de_baja`,estado_conservacion:`de_baja`,activo:!1,fecha_adquisicion:`2015-05-05`,valor_adquisicion:5e3,fecha_baja:`2024-12-01`,motivo_baja:`Daño irreversible`}),a=I({id:`act-006`,codigo_inventario:`V8-TRO-001`,tipo_instrumento:`Trompeta`,marca:`Bach`,modelo:`TR200`,estado_uso:`disponible`,estado_conservacion:`bueno`,fecha_adquisicion:`2023-01-10`,valor_adquisicion:22e3}),o=I({id:`act-007`,codigo_inventario:`V8-PER-001`,tipo_instrumento:`Percusión`,marca:`Pearl`,modelo:`Export`,estado_uso:`en_mantenimiento`,estado_conservacion:`mantenimiento`,fecha_adquisicion:`2018-08-15`,valor_adquisicion:35e3}),s=I({id:`act-008`,codigo_inventario:`V8-PIA-001`,tipo_instrumento:`Piano`,marca:`Kawai`,modelo:`K-300`,estado_uso:`disponible`,estado_conservacion:`bueno`,fecha_adquisicion:`2024-02-20`,valor_adquisicion:18e4}),c=V({id:`alu-001`,nombre_completo:`Juan Pérez`,email:`juan@test.com`}),l=V({id:`alu-002`,nombre_completo:`María García`,email:`maria@test.com`}),u=V({id:`alu-003`,nombre_completo:`Carlos López`,email:`carlos@test.com`}),d=new Date;d.setDate(d.getDate()+45);let f=d.toISOString().split(`T`)[0],p=new Date;p.setDate(p.getDate()+5);let m=p.toISOString().split(`T`)[0],h=new Date;h.setDate(h.getDate()-2);let g=h.toISOString().split(`T`)[0],_=B({id:`com-001`,activo_id:`act-002`,alumno_id:`alu-001`,alumno_nombre:`Juan Pérez`,fecha_vencimiento:f,estado:`activo`,tipo_comodato:`escolar`}),v=B({id:`com-002`,activo_id:`act-003`,alumno_id:`alu-002`,alumno_nombre:`María García`,fecha_entrega:`2024-08-15`,fecha_devolucion:`2024-12-15`,estado:`devuelto`,tipo_comodato:`escolar`}),y=B({id:`com-003`,activo_id:`act-001`,alumno_id:`alu-003`,alumno_nombre:`Carlos López`,fecha_vencimiento:m,estado:`activo`,tipo_comodato:`eventual`}),ee=B({id:`com-004`,activo_id:`act-006`,alumno_id:`alu-001`,alumno_nombre:`Juan Pérez`,fecha_vencimiento:g,estado:`activo`,tipo_comodato:`anual`}),b=L({id:`acc-001`,activo_id:`act-001`,tipo:`funda`,marca:`Gewa`,cantidad:1,estado:`nuevo`,fecha_asignacion:`2024-01-15`}),x=L({id:`acc-002`,activo_id:`act-001`,tipo:`arco`,marca:`Brasil`,cantidad:2,estado:`bueno`,fecha_asignacion:`2024-01-15`}),te=L({id:`acc-003`,activo_id:`act-004`,tipo:`cuerdas`,marca:`D'Addario`,cantidad:5,estado:`bueno`,fecha_asignacion:`2024-03-10`}),ne=L({id:`acc-004`,activo_id:null,tipo:`atril`,marca:`Manhasset`,cantidad:3,estado:`nuevo`}),re=L({id:`acc-005`,activo_id:`act-002`,tipo:`funda`,marca:`Gewa`,cantidad:1,estado:`regular`,fecha_asignacion:`2024-06-01`}),ie=R({id:`hst-001`,activo_id:`act-001`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-01-01T10:00:00Z`}),ae=R({id:`hst-002`,activo_id:`act-001`,tipo_evento:`asignacion`,descripcion:`Instrumento asignado a Carlos López`,fecha:`2024-09-01T08:00:00Z`,usuario_id:`usr-admin`}),oe=R({id:`hst-003`,activo_id:`act-002`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-01-10T10:00:00Z`}),se=R({id:`hst-004`,activo_id:`act-002`,tipo_evento:`asignacion`,descripcion:`Instrumento asignado a Juan Pérez`,fecha:`2024-06-01T08:00:00Z`,usuario_id:`usr-admin`}),S=R({id:`hst-005`,activo_id:`act-003`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-02-01T10:00:00Z`}),ce=R({id:`hst-006`,activo_id:`act-003`,tipo_evento:`asignacion`,descripcion:`Instrumento asignado a María García`,fecha:`2024-08-15T08:00:00Z`,usuario_id:`usr-admin`}),le=R({id:`hst-007`,activo_id:`act-003`,tipo_evento:`devolucion`,descripcion:`Instrumento devuelto por María García`,fecha:`2024-12-15T14:00:00Z`,usuario_id:`usr-admin`}),ue=R({id:`hst-008`,activo_id:`act-004`,tipo_evento:`creacion`,descripcion:`Instrumento registrado en el sistema`,fecha:`2024-01-05T10:00:00Z`}),de=R({id:`hst-009`,activo_id:`act-004`,tipo_evento:`reparacion`,descripcion:`Ingreso a reparación: Cambio de cuerdas y ajuste`,fecha:`2024-10-01T09:00:00Z`,usuario_id:`usr-admin`}),fe=R({id:`hst-010`,activo_id:`act-001`,tipo_evento:`cambio_estado`,descripcion:`Cambio de estado: disponible → prestado`,fecha:`2024-09-01T08:00:00Z`,usuario_id:`usr-admin`}),pe=z({id:`rep-001`,activo_id:`act-004`,tipo_tallerista:`luthier_interno`,tallerista_nombre:`Luthier Interno`,descripcion:`Cambio de cuerdas y ajuste de mástil`,costo_estimado:2500,costo_real:null,fecha_ingreso:`2024-10-01`,estado:`en_reparacion`}),me=z({id:`rep-002`,activo_id:`act-001`,tipo_tallerista:`externo`,tallerista_nombre:`Taller Pérez`,descripcion:`Reparación de fisura en tapa armónica`,costo_estimado:3500,costo_real:3200,fecha_ingreso:`2024-08-01`,fecha_egreso:`2024-08-20`,estado:`entregado`}),he=ct({id:`fac-001`,reparacion_id:`rep-002`,monto_total:3200,impuestos:576,metodo_pago:`efectivo`,tipo_factura:`alumno`,estado_pago:`pendiente`,fecha_emision:`2024-08-20`});return{activos:[e,t,n,r,i,a,o,s],alumnos:[c,l,u],comodatos:[_,v,y,ee],accesorios:[b,x,te,ne,re],historial:[ie,ae,oe,se,S,ce,le,ue,de,fe],reparaciones:[pe,me],facturas:[he]}}var H=lt();async function ut(e={}){await M();let t=N(H.activos).filter(e=>e.activo!==!1);if(e.estado_uso&&(t=t.filter(t=>t.estado_uso===e.estado_uso)),e.tipo_instrumento&&(t=t.filter(t=>t.tipo_instrumento===e.tipo_instrumento)),e.estado_conservacion&&(t=t.filter(t=>t.estado_conservacion===e.estado_conservacion)),e.ubicacion&&(t=t.filter(t=>t.ubicacion===e.ubicacion)),e.q){let n=e.q.toLowerCase();t=t.filter(e=>Object.values(e).some(e=>String(e??``).toLowerCase().includes(n)))}return st(t,e.page,e.pageSize)}async function dt(e){await M();let t=H.activos.find(t=>t.id===e);return t?{data:N(t),error:null}:P(`Activo`)}async function ft(e){await M();let t=C(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};let n=I({id:j(`act`),...e,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});H.activos.push(n);let r=O(n.id,`creacion`,`Instrumento registrado`,e.usuario_id);return H.historial.push({...r,id:j(`hst`)}),{data:N(n),error:null}}async function pt(e,t){await M();let n=H.activos.findIndex(t=>t.id===e);if(n===-1)return P(`Activo`);let r=C({...H.activos[n],...t});return r.length?{data:null,error:{code:400,message:r.join(`; `)}}:(H.activos[n]={...H.activos[n],...t,updated_at:new Date().toISOString()},{data:N(H.activos[n]),error:null})}async function mt(e,t){await M();let n=H.activos.findIndex(t=>t.id===e);if(n===-1)return P(`Activo`);let r=H.activos[n].estado_uso;if(!ke(r,t))return{data:null,error:{code:400,message:`Transición inválida de `+r+` a `+t}};H.activos[n].estado_uso=t,H.activos[n].updated_at=new Date().toISOString();let i=O(e,`cambio_estado`,`Cambio de estado: `+r+` → `+t,null,{estado_anterior:r,estado_nuevo:t});return H.historial.push({...i,id:j(`hst`)}),{data:N(H.activos[n]),error:null}}async function ht(e,t){await M();let n=H.activos.findIndex(t=>t.id===e);return n===-1?P(`Activo`):(H.activos[n].foto_url=`https://storage.test/activos/`+e+`/foto.jpg`,H.activos[n].updated_at=new Date().toISOString(),{data:{foto_url:H.activos[n].foto_url},error:null})}async function gt(e){await M();let t=N(H.accesorios);return e&&(t=t.filter(t=>t.activo_id===e)),{data:t,error:null}}async function _t(e){await M();let t=Pe(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};if(!H.activos.some(t=>t.id===e.activo_id))return{data:null,error:{code:400,message:`activo_id no existe`}};let n=L({id:j(`acc`),...e,fecha_asignacion:F()});return H.accesorios.push(n),{data:N(n),error:null}}async function vt(e,t){await M();let n=H.accesorios.findIndex(t=>t.id===e);return n===-1?P(`Accesorio`):(H.accesorios[n]={...H.accesorios[n],...t},{data:N(H.accesorios[n]),error:null})}async function yt(e){await M();let t=H.accesorios.findIndex(t=>t.id===e);if(t===-1)return P(`Accesorio`);let[n]=H.accesorios.splice(t,1);return{data:N(n),error:null}}async function bt(e,t={}){await M();let n=N(H.historial).filter(t=>t.activo_id===e);return t.tipo_evento&&(n=n.filter(e=>e.tipo_evento===t.tipo_evento)),n.sort((e,t)=>new Date(t.fecha)-new Date(e.fecha)),{data:n,error:null}}async function xt(e){await M();try{let t={...O(e.activo_id,e.tipo_evento,e.descripcion,e.usuario_id,e.metadata),id:j(`hst`)};return H.historial.push(t),{data:N(t),error:null}}catch(e){return{data:null,error:{code:400,message:e.message}}}}async function St(e={}){await M();let t=N(H.reparaciones);return e.estado&&(t=t.filter(t=>t.estado===e.estado)),e.activo_id&&(t=t.filter(t=>t.activo_id===e.activo_id)),e.desde&&(t=t.filter(t=>t.fecha_ingreso>=e.desde)),e.hasta&&(t=t.filter(t=>t.fecha_ingreso<=e.hasta)),t.sort((e,t)=>new Date(t.created_at)-new Date(e.created_at)),{data:t,error:null}}async function Ct(e){await M();let t=H.reparaciones.find(t=>t.id===e);return t?{data:N(t),error:null}:P(`Reparación`)}async function wt(e){await M();let t=Ge(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};if(!H.activos.find(t=>t.id===e.activo_id))return{data:null,error:{code:400,message:`activo_id no existe`}};let n=z({id:j(`rep`),...e,estado:`recibido`});H.reparaciones.push(n);let r=O(e.activo_id,`reparacion`,`Ingreso a reparación: `+e.descripcion,e.usuario_id);return H.historial.push({...r,id:j(`hst`)}),{data:N(n),error:null}}async function Tt(e,t){await M();let n=H.reparaciones.findIndex(t=>t.id===e);return n===-1?P(`Reparación`):t.estado&&t.estado!==H.reparaciones[n].estado&&!We(H.reparaciones[n].estado,t.estado)?{data:null,error:{code:400,message:`Transición inválida de `+actual+` a `+nuevoEstado}}:(H.reparaciones[n]={...H.reparaciones[n],...t,updated_at:new Date().toISOString()},{data:N(H.reparaciones[n]),error:null})}async function Et(e,t){await M();let n=H.reparaciones.findIndex(t=>t.id===e);if(n===-1)return P(`Reparación`);let r=H.reparaciones[n].estado;if(!We(r,t))return{data:null,error:{code:400,message:`Transición inválida de `+r+` a `+t}};H.reparaciones[n].estado=t,H.reparaciones[n].updated_at=new Date().toISOString();let i=H.activos.findIndex(e=>e.id===H.reparaciones[n].activo_id);i!==-1&&t===`entregado`&&(H.activos[i].estado_uso=`disponible`),i!==-1&&t===`en_reparacion`&&(H.activos[i].estado_uso=`en_reparacion`);let a=O(H.reparaciones[n].activo_id,`cambio_estado`,`Reparación `+r+` → `+t);return H.historial.push({...a,id:j(`hst`)}),{data:N(H.reparaciones[n]),error:null}}async function Dt(e){await M();let t=H.reparaciones.findIndex(t=>t.id===e);if(t===-1)return P(`Reparación`);let[n]=H.reparaciones.splice(t,1);return{data:N(n),error:null}}async function Ot(e={}){await M();let t=N(H.facturas);return e.estado_pago&&(t=t.filter(t=>t.estado_pago===e.estado_pago)),e.tipo_factura&&(t=t.filter(t=>t.tipo_factura===e.tipo_factura)),e.desde&&(t=t.filter(t=>t.fecha_emision>=e.desde)),e.hasta&&(t=t.filter(t=>t.fecha_emision<=e.hasta)),t.sort((e,t)=>new Date(t.created_at)-new Date(e.created_at)),{data:t,error:null}}async function kt(e){await M();let t=H.facturas.find(t=>t.id===e);return t?{data:N(t),error:null}:P(`Factura`)}async function At(e){await M();let t=Qe(e);if(t.length)return{data:null,error:{code:400,message:t.join(`; `)}};if(!H.reparaciones.some(t=>t.id===e.reparacion_id))return{data:null,error:{code:400,message:`reparacion_id no existe`}};if(H.facturas.find(t=>t.reparacion_id===e.reparacion_id&&t.estado_pago!==`anulada`))return{data:null,error:{code:400,message:`La reparación ya tiene una factura activa`}};let n=ct({id:j(`fac`),...e,estado_pago:`pendiente`});return H.facturas.push(n),{data:N(n),error:null}}async function jt(e,t={}){await M();let n=H.facturas.findIndex(t=>t.id===e);if(n===-1)return P(`Factura`);let r=H.facturas[n];return r.estado_pago===`pagado`?{data:null,error:{code:400,message:`La factura ya está pagada`}}:r.estado_pago===`anulada`?{data:null,error:{code:400,message:`No se puede pagar una factura anulada`}}:(H.facturas[n]=et({...r,...t,fecha_pago:t.fecha_pago||F()}),{data:N(H.facturas[n]),error:null})}async function Mt(e){await M();let t=H.facturas.findIndex(t=>t.id===e);return t===-1?P(`Factura`):$e(H.facturas[t])?(H.facturas[t].estado_pago=`anulada`,H.facturas[t].updated_at=new Date().toISOString(),{data:N(H.facturas[t]),error:null}):{data:null,error:{code:400,message:`Solo se pueden anular facturas en estado pendiente`}}}async function Nt(e){await M();let t=H.activos.find(t=>t.id===e.activo_id);if(!t)return{data:null,error:{code:400,message:`activo_id no existe`}};if(t.estado_uso!==`disponible`)return{data:null,error:{code:400,message:`Activo no está disponible para comodato`}};let n=B({id:j(),activo_id:e.activo_id,alumno_id:e.alumno_id,tipo_comodato:e.tipo_comodato||`escolar`,estado:e.estado||`activo`,fecha_entrega:F(),fecha_vencimiento:e.fecha_vencimiento||null,instrumento_propio_id:e.instrumento_propio_id||null,...e});H.comodatos.push(n);let r=H.activos.findIndex(t=>t.id===e.activo_id);r!==-1&&(H.activos[r].estado_uso=`prestado`);let i=O(e.activo_id,`asignacion`,`Instrumento asignado en comodato a `+(e.alumno_id||`desconocido`),e.usuario_id||`mock-user`,{comodato_id:n.id});return H.historial.push({...i,id:j()}),{data:N(n),error:null}}async function Pt(){return await M(),{data:N(H.comodatos).filter(e=>{if(e.estado!==`activo`)return!1;let t=k(e);return t!==null&&t<0}),error:null}}async function Ft(e=7){return await M(),{data:N(H.comodatos).filter(t=>{if(t.estado!==`activo`)return!1;let n=k(t);return n!==null&&n>=0&&n<=e}),error:null}}async function It(e,t,n){await M();let r=H.comodatos.find(t=>t.id===e);if(!r)return{data:null,error:{code:404,message:`Comodato origen no encontrado`}};let i=H.activos.find(e=>e.id===t);if(!i)return{data:null,error:{code:404,message:`Activo destino no encontrado`}};let a=H.comodatos.find(e=>e.activo_id===t&&e.estado===`activo`),o=H.activos.find(e=>e.id===r.activo_id);if(!o)return{data:null,error:{code:404,message:`Activo origen no encontrado`}};try{if(a){let t=rt(r,a,o,i),n=H.comodatos.findIndex(t=>t.id===e),s=H.comodatos.findIndex(e=>e.id===a.id);return H.comodatos[n]=t.comodatoOrigenActualizado,H.comodatos[s]=t.comodatoDestinoActualizado,H.activos[H.activos.findIndex(e=>e.id===o.id)]={...o,estado_uso:Lt(t.comodatoDestinoActualizado)},H.activos[H.activos.findIndex(e=>e.id===i.id)]={...i,estado_uso:Lt(t.comodatoOrigenActualizado)},{data:{comodatoOrigen:t.comodatoOrigenActualizado,comodatoDestino:t.comodatoDestinoActualizado},error:null}}let n=r.activo_id,s=H.comodatos.findIndex(t=>t.id===e);return H.comodatos[s]={...r,activo_id:t,intercambiado_con_id:t},n&&(H.activos[H.activos.findIndex(e=>e.id===n)].estado_uso=`disponible`),H.activos[H.activos.findIndex(e=>e.id===t)].estado_uso=`prestado`,{data:{comodatoOrigen:H.comodatos[s]},error:null}}catch(e){return{data:null,error:{code:400,message:e.message}}}}function Lt(e){return e.estado===`activo`?`prestado`:`disponible`}async function Rt(e,t){await M();let n=H.comodatos.findIndex(t=>t.id===e);if(n===-1)return P(`Comodato`);let r=H.comodatos[n];if(!it(r))return{data:null,error:{code:400,message:`El comodato no puede renovarse`}};H.comodatos[n]={...r,estado:`renovado`};let i=B({id:j(`com`),activo_id:r.activo_id,alumno_id:r.alumno_id,alumno_nombre:r.alumno_nombre,tipo_comodato:t?.tipo_comodato||r.tipo_comodato,fecha_vencimiento:t?.fecha_vencimiento||(()=>{let e=new Date;return e.setFullYear(e.getFullYear()+1),e.toISOString().split(`T`)[0]})(),renovado_de_id:r.id,estado:`activo`});return H.comodatos.push(i),{data:{viejo:N(H.comodatos[n]),nuevo:N(i)},error:null}}async function zt(e){return await M(),H.comodatos.find(t=>t.id===e)?{data:{url:`https://storage.test/comodatos/`+e+`/contrato.pdf`,comodatoId:e},error:null}:P(`Comodato`)}async function Bt(e,n={}){await M();let r=await t(()=>import(`./reportes-CsoDPoh8.js`).then(e=>e.i),__vite__mapDeps([0,1])),i={activos:N(H.activos),comodatos:N(H.comodatos),reparaciones:N(H.reparaciones)};return{data:r.armarReporte(e,i),error:null}}async function Vt(){await M();let e=await t(()=>import(`./reportes-CsoDPoh8.js`).then(e=>e.i),__vite__mapDeps([0,1])),n=e.resumirInventario({activos:H.activos,comodatos:H.comodatos,reparaciones:H.reparaciones}),r=e.activosPorTipo(H.activos),i=H.comodatos.filter(e=>{if(e.estado!==`activo`)return!1;let t=k(e);return t!==null&&t<0}),a=H.comodatos.filter(e=>{if(e.estado!==`activo`)return!1;let t=k(e);return t!==null&&t>=0&&t<=7});return{data:{resumen:n,distribucion_por_tipo:r,comodatos_vencidos:i.length,comodatos_proximos_vencer:a.length,total_en_reparacion:H.reparaciones.filter(e=>e.estado===`en_reparacion`||e.estado===`recibido`).length},error:null}}async function Ht(e){return await M(),{data:N(H.comodatos).filter(t=>t.alumno_id===e).sort((e,t)=>new Date(t.fecha_entrega)-new Date(e.fecha_entrega)),error:null}}async function Ut(){return await M(),{data:N(H.comodatos).filter(e=>e.estado===`activo`).sort((e,t)=>new Date(t.fecha_entrega)-new Date(e.fecha_entrega)),error:null}}async function Wt(e){await M();let t=H.comodatos.findIndex(t=>t.id===e);if(t===-1)return P(`Comodato`);H.comodatos[t].estado=`devuelto`,H.comodatos[t].fecha_devolucion=F();let n=H.activos.findIndex(e=>e.id===H.comodatos[t].activo_id);n!==-1&&(H.activos[n].estado_uso=`disponible`);let r=O(H.comodatos[t].activo_id,`devolucion`,`Instrumento devuelto por `+(H.comodatos[t].alumno_nombre||`desconocido`));return H.historial.push({...r,id:j(`hst`)}),{data:N(H.comodatos[t]),error:null}}async function Gt(){await M();let e=H.comodatos.filter(e=>e.estado===`activo`).map(e=>e.activo_id);return{data:N(H.activos).filter(t=>e.includes(t.id)).map(e=>({...e,dias_prestado:30,dias_hasta_vencimiento:(()=>{let t=H.comodatos.find(t=>t.activo_id===e.id&&t.estado===`activo`);return t?k(t):null})()})),error:null}}async function Kt(e,t){return await M(),{data:{url:`https://storage.test/comodatos/contrato.pdf`},error:null}}var qt=e({actualizarActivo:()=>Yt,actualizarReparacion:()=>nn,anularFactura:()=>ln,cambiarEstadoActivo:()=>Zt,cambiarEstadoReparacion:()=>rn,crearActivo:()=>Jt,crearComodato:()=>mn,crearEventoManual:()=>$t,crearFacturaReparacion:()=>sn,crearReparacion:()=>tn,devolverComodato:()=>J,intercambiarInstrumentos:()=>fn,obtenerAccesorios:()=>Qt,obtenerActivoPorId:()=>Xt,obtenerActivos:()=>W,obtenerActivosOciosos:()=>gn,obtenerComodatosActivos:()=>Y,obtenerComodatosAlumno:()=>hn,obtenerComodatosPorVencer:()=>dn,obtenerComodatosVencidos:()=>un,obtenerFactura:()=>on,obtenerFacturasReparacion:()=>an,obtenerHistorialActivo:()=>G,obtenerKPI:()=>pn,obtenerReparacion:()=>en,obtenerReparaciones:()=>K,registrarPagoFactura:()=>cn,renovarComodato:()=>q,subirContratoComodato:()=>_n}),U=()=>i.isDemoMode?at:f,W=(...e)=>U().obtenerActivos(...e),Jt=(...e)=>U().crearActivo(...e),Yt=(...e)=>U().actualizarActivo(...e),Xt=(...e)=>U().obtenerActivoPorId(...e),Zt=(...e)=>U().cambiarEstadoActivo(...e),Qt=(...e)=>U().obtenerAccesorios(...e),G=(...e)=>U().obtenerHistorialActivo(...e),$t=(...e)=>U().crearEventoManual(...e),K=(...e)=>U().obtenerReparaciones(...e),en=(...e)=>U().obtenerReparacion(...e),tn=(...e)=>U().crearReparacion(...e),nn=(...e)=>U().actualizarReparacion(...e),rn=(...e)=>U().cambiarEstadoReparacion(...e),an=(...e)=>U().obtenerFacturasReparacion(...e),on=(...e)=>U().obtenerFactura(...e),sn=(...e)=>U().crearFacturaReparacion(...e),cn=(...e)=>U().registrarPagoFactura(...e),ln=(...e)=>U().anularFactura(...e),un=(...e)=>U().obtenerComodatosVencidos(...e),dn=(...e)=>U().obtenerComodatosPorVencer(...e),fn=(...e)=>U().intercambiarInstrumentos(...e),q=(...e)=>U().renovarComodato(...e),pn=(...e)=>U().obtenerKPI(...e),mn=(...e)=>U().crearComodato(...e),J=(...e)=>U().devolverComodato(...e),hn=(...e)=>U().obtenerComodatosAlumno(...e),Y=(...e)=>U().obtenerComodatosActivos(...e),gn=(...e)=>U().obtenerActivosOciosos(...e),_n=(...e)=>U().subirContratoComodato(...e),X=20;async function vn(e){let t=new AbortController,n=1;e.innerHTML=`<p class="p-4">Cargando inventario...</p>`,await i();async function i(){let t=new URLSearchParams(window.location.search),r={tipo_instrumento:t.get(`tipo`)||``,estado_uso:t.get(`uso`)||``,estado_conservacion:t.get(`conservacion`)||``,q:t.get(`q`)||``,page:parseInt(t.get(`page`),10)||1};n=r.page;let i={...r,pageSize:X};Object.keys(i).forEach(e=>{i[e]||delete i[e]});let o=await W(i);if(o.error){e.innerHTML=`<div class="alert alert-danger m-4">Error: ${o.error.message}</div>`;return}let s=o.data||[],c=o.total||0,l=Math.ceil(c/X)||1,u=[...new Set(s.map(e=>e.tipo_instrumento).filter(Boolean))].sort(),d=s.map(e=>{let t=w(e),n=t===null?`—`:`${t} años`;return`
        <tr>
          <td class="font-monospace small">${e.codigo_inventario}</td>
          <td>${e.tipo_instrumento}</td>
          <td class="text-muted">${[e.marca,e.modelo].filter(Boolean).join(` `)}</td>
          <td><span class="${T(e.estado_conservacion)}">${e.estado_conservacion}</span></td>
          <td><span class="${E(e.estado_uso)}">${e.estado_uso}</span></td>
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
      `}).join(``),f=(n-1)*X+1,p=Math.min(n*X,c);e.innerHTML=`
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
                  ${u.map(e=>`<option value="${e}" ${r.tipo_instrumento===e?`selected`:``}>${e}</option>`).join(``)}
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small mb-0">Estado uso</label>
                <select id="filter-estado-uso" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  <option value="disponible" ${r.estado_uso===`disponible`?`selected`:``}>Disponible</option>
                  <option value="prestado" ${r.estado_uso===`prestado`?`selected`:``}>Prestado</option>
                  <option value="en_mantenimiento" ${r.estado_uso===`en_mantenimiento`?`selected`:``}>En mantenimiento</option>
                  <option value="en_reparacion" ${r.estado_uso===`en_reparacion`?`selected`:``}>En reparación</option>
                  <option value="de_baja" ${r.estado_uso===`de_baja`?`selected`:``}>De baja</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label small mb-0">Conservación</label>
                <select id="filter-estado-conservacion" class="form-select form-select-sm">
                  <option value="">Todos</option>
                  <option value="excelente" ${r.estado_conservacion===`excelente`?`selected`:``}>Excelente</option>
                  <option value="bueno" ${r.estado_conservacion===`bueno`?`selected`:``}>Bueno</option>
                  <option value="regular" ${r.estado_conservacion===`regular`?`selected`:``}>Regular</option>
                  <option value="mantenimiento" ${r.estado_conservacion===`mantenimiento`?`selected`:``}>Mantenimiento</option>
                  <option value="de_baja" ${r.estado_conservacion===`de_baja`?`selected`:``}>De baja</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label small mb-0">Buscar</label>
                <input id="search-input" type="text" class="form-control form-control-sm" placeholder="Código, tipo, marca..." value="${r.q||``}">
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
                <li class="page-item ${n<=1?`disabled`:``}">
                  <button class="page-link" data-page="${n-1}">&laquo;</button>
                </li>
                ${Array.from({length:l},(e,t)=>t+1).map(e=>`
                  <li class="page-item ${e===n?`active`:``}">
                    <button class="page-link" data-page="${e}">${e}</button>
                  </li>
                `).join(``)}
                <li class="page-item ${n>=l?`disabled`:``}">
                  <button class="page-link" data-page="${n+1}">&raquo;</button>
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
    `,a()}function a(){e.querySelector(`#filter-form`)?.addEventListener(`submit`,e=>{e.preventDefault(),o()},{signal:t.signal}),e.querySelector(`#btn-buscar`)?.addEventListener(`click`,()=>{o()},{signal:t.signal}),e.querySelector(`#btn-limpiar`)?.addEventListener(`click`,()=>{s()},{signal:t.signal}),e.querySelector(`#pagination`)?.addEventListener(`click`,e=>{let t=e.target.closest(`.page-link`);if(!t)return;let n=parseInt(t.dataset.page,10);n&&(c({page:n}),i())},{signal:t.signal}),e.querySelector(`#btn-nuevo`)?.addEventListener(`click`,()=>{l=null,e.querySelector(`#modal-titulo`).textContent=`Nuevo instrumento`,e.querySelector(`#form-instrumento`).reset(),e.querySelector(`[name="id"]`).value=``,e.querySelector(`#modal-error`).classList.add(`d-none`),u()?.show()},{signal:t.signal}),e.querySelector(`#tbody-activos`)?.addEventListener(`click`,t=>{let n=t.target.closest(`.btn-view`);if(n){let e=n.dataset.id;window.router&&window.router.navigate(`inventario-detalle`,{activoId:e});return}let r=t.target.closest(`.btn-editar`);if(!r)return;l=r.dataset.id;let i=e.querySelector(`#form-instrumento`);i.querySelector(`[name="id"]`).value=r.dataset.id,i.querySelector(`[name="tipo_instrumento"]`).value=r.dataset.tipo,i.querySelector(`[name="marca"]`).value=r.dataset.marca,i.querySelector(`[name="modelo"]`).value=r.dataset.modelo,i.querySelector(`[name="numero_serie"]`).value=r.dataset.serie,i.querySelector(`[name="codigo_instrumento"]`).value=r.dataset.codigo,i.querySelector(`[name="estado_conservacion"]`).value=r.dataset.conservacion,i.querySelector(`[name="estado_uso"]`).value=r.dataset.uso,i.querySelector(`[name="ubicacion"]`).value=r.dataset.ubicacion,i.querySelector(`[name="fecha_adquisicion"]`).value=r.dataset.adquisicion,i.querySelector(`[name="valor_adquisicion"]`).value=r.dataset.valor,i.querySelector(`[name="proveedor"]`).value=r.dataset.proveedor,i.querySelector(`[name="foto_url"]`).value=r.dataset.foto,i.querySelector(`[name="notas"]`).value=r.dataset.notas||``,e.querySelector(`#modal-titulo`).textContent=`Editar instrumento`,e.querySelector(`#modal-error`).classList.add(`d-none`),u()?.show()},{signal:t.signal}),e.querySelector(`#btn-guardar-instrumento`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#form-instrumento`),n=e.querySelector(`#modal-error`),r=new FormData(t),a=Object.fromEntries(r.entries());delete a.id,a.marca||delete a.marca,a.modelo||delete a.modelo,a.numero_serie||delete a.numero_serie,a.fecha_adquisicion||delete a.fecha_adquisicion,a.valor_adquisicion||delete a.valor_adquisicion,a.proveedor||delete a.proveedor,a.foto_url||delete a.foto_url,a.notas||delete a.notas;let o=e.querySelector(`#btn-guardar-instrumento`);o.disabled=!0;let{error:s}=l?await Yt(l,a):await Jt(a);o.disabled=!1,s?(n.textContent=s.message,n.classList.remove(`d-none`)):(u()?.hide(),i())},{signal:t.signal})}function o(){c({tipo_instrumento:e.querySelector(`#filter-tipo`)?.value||``,estado_uso:e.querySelector(`#filter-estado-uso`)?.value||``,estado_conservacion:e.querySelector(`#filter-estado-conservacion`)?.value||``,q:e.querySelector(`#search-input`)?.value||``,page:1}),n=1,i()}function s(){let t=e.querySelector(`#search-input`);t&&(t.value=``),e.querySelector(`#filter-tipo`).value=``,e.querySelector(`#filter-estado-uso`).value=``,e.querySelector(`#filter-estado-conservacion`).value=``,c({page:1}),n=1,i()}function c(e){let t=new URL(window.location);Object.entries(e).forEach(([e,n])=>{n&&n!==``?t.searchParams.set(e,n):t.searchParams.delete(e)}),window.history.replaceState({},``,t)}let l=null;function u(){let t=e.querySelector(`#modal-instrumento`);return t?new r(t):null}return{teardown:()=>t.abort()}}var Z=class{x;y;pressure;time;constructor(e,t,n,r){if(isNaN(e)||isNaN(t))throw Error(`Point is invalid: (${e}, ${t})`);this.x=+e,this.y=+t,this.pressure=n||0,this.time=r||Date.now()}distanceTo(e){return Math.sqrt((this.x-e.x)**2+(this.y-e.y)**2)}equals(e){return this.x===e.x&&this.y===e.y&&this.pressure===e.pressure&&this.time===e.time}velocityFrom(e){return this.time===e.time?0:this.distanceTo(e)/(this.time-e.time)}},yn=class e{constructor(e,t,n,r,i,a){this.startPoint=e,this.control2=t,this.control1=n,this.endPoint=r,this.startWidth=i,this.endWidth=a}static fromPoints(t,n){let r=this.calculateControlPoints(t[0],t[1],t[2]).c2,i=this.calculateControlPoints(t[1],t[2],t[3]).c1;return new e(t[1],r,i,t[2],n.start,n.end)}static calculateControlPoints(e,t,n){let r=e.x-t.x,i=e.y-t.y,a=t.x-n.x,o=t.y-n.y,s={x:(e.x+t.x)/2,y:(e.y+t.y)/2},c={x:(t.x+n.x)/2,y:(t.y+n.y)/2},l=Math.sqrt(r*r+i*i),u=Math.sqrt(a*a+o*o),d=s.x-c.x,f=s.y-c.y,p=l+u==0?0:u/(l+u),m={x:c.x+d*p,y:c.y+f*p},h=t.x-m.x,g=t.y-m.y;return{c1:new Z(s.x+h,s.y+g),c2:new Z(c.x+h,c.y+g)}}length(){let e=0,t,n;for(let r=0;r<=10;r+=1){let i=r/10,a=this.point(i,this.startPoint.x,this.control1.x,this.control2.x,this.endPoint.x),o=this.point(i,this.startPoint.y,this.control1.y,this.control2.y,this.endPoint.y);if(r>0){let r=a-t,i=o-n;e+=Math.sqrt(r*r+i*i)}t=a,n=o}return e}point(e,t,n,r,i){return t*(1-e)*(1-e)*(1-e)+3*n*(1-e)*(1-e)*e+3*r*(1-e)*e*e+i*e*e*e}},bn=class{_et;constructor(){try{this._et=new EventTarget}catch{this._et=document}}addEventListener(e,t,n){this._et.addEventListener(e,t,n)}dispatchEvent(e){return this._et.dispatchEvent(e)}removeEventListener(e,t,n){this._et.removeEventListener(e,t,n)}};function xn(e,t=250){let n=0,r=null,i,a,o,s=()=>{n=Date.now(),r=null,i=e.apply(a,o),r||(a=null,o=[])};return function(...c){let l=Date.now(),u=t-(l-n);return a=this,o=c,u<=0||u>t?(r&&=(clearTimeout(r),null),n=l,i=e.apply(a,o),r||(a=null,o=[])):r||=window.setTimeout(s,u),i}}var Sn=class e extends bn{constructor(t,n={}){super(),this.canvas=t,this.velocityFilterWeight=n.velocityFilterWeight||.7,this.minWidth=n.minWidth||.5,this.maxWidth=n.maxWidth||2.5,this.throttle=n.throttle??16,this.minDistance=n.minDistance??5,this.dotSize=n.dotSize||0,this.penColor=n.penColor||`black`,this.backgroundColor=n.backgroundColor||`rgba(0,0,0,0)`,this.compositeOperation=n.compositeOperation||`source-over`,this.canvasContextOptions=n.canvasContextOptions??{},this._strokeMoveUpdate=this.throttle?xn(e.prototype._strokeUpdate,this.throttle):e.prototype._strokeUpdate,this._handleMouseDown=this._handleMouseDown.bind(this),this._handleMouseMove=this._handleMouseMove.bind(this),this._handleMouseUp=this._handleMouseUp.bind(this),this._handleTouchStart=this._handleTouchStart.bind(this),this._handleTouchMove=this._handleTouchMove.bind(this),this._handleTouchEnd=this._handleTouchEnd.bind(this),this._handlePointerDown=this._handlePointerDown.bind(this),this._handlePointerMove=this._handlePointerMove.bind(this),this._handlePointerUp=this._handlePointerUp.bind(this),this._handlePointerCancel=this._handlePointerCancel.bind(this),this._handleTouchCancel=this._handleTouchCancel.bind(this),this._ctx=t.getContext(`2d`,this.canvasContextOptions),this.clear(),this.on()}dotSize;minWidth;maxWidth;penColor;minDistance;velocityFilterWeight;compositeOperation;backgroundColor;throttle;canvasContextOptions;_ctx;_drawingStroke=!1;_isEmpty=!0;_dataUrl;_dataUrlOptions;_lastPoints=[];_data=[];_lastVelocity=0;_lastWidth=0;_strokeMoveUpdate;_strokePointerId;clear(){let{_ctx:e,canvas:t}=this;e.fillStyle=this.backgroundColor,e.clearRect(0,0,t.width,t.height),e.fillRect(0,0,t.width,t.height),this._data=[],this._reset(this._getPointGroupOptions()),this._isEmpty=!0,this._dataUrl=void 0,this._dataUrlOptions=void 0,this._strokePointerId=void 0}redraw(){let e=this._data,t=this._dataUrl,n=this._dataUrlOptions;this.clear(),t&&this.fromDataURL(t,n),this.fromData(e,{clear:!1})}fromDataURL(e,t={}){return new Promise((n,r)=>{let i=new Image,a=t.ratio||window.devicePixelRatio||1,o=t.width||this.canvas.width/a,s=t.height||this.canvas.height/a,c=t.xOffset||0,l=t.yOffset||0;this._reset(this._getPointGroupOptions()),i.onload=()=>{this._ctx.drawImage(i,c,l,o,s),n()},i.onerror=e=>{r(e)},i.crossOrigin=`anonymous`,i.src=e,this._isEmpty=!1,this._dataUrl=e,this._dataUrlOptions={...t}})}toDataURL(e=`image/png`,t){switch(e){case`image/svg+xml`:return typeof t!=`object`&&(t=void 0),`data:image/svg+xml;base64,${btoa(this.toSVG(t))}`;default:return typeof t!=`number`&&(t=void 0),this.canvas.toDataURL(e,t)}}on(){this.canvas.style.touchAction=`none`,this.canvas.style.msTouchAction=`none`,this.canvas.style.userSelect=`none`,this.canvas.style.webkitUserSelect=`none`;let e=/Macintosh/.test(navigator.userAgent)&&`ontouchstart`in document;window.PointerEvent&&!e?this._handlePointerEvents():(this._handleMouseEvents(),`ontouchstart`in window&&this._handleTouchEvents())}off(){this.canvas.style.touchAction=`auto`,this.canvas.style.msTouchAction=`auto`,this.canvas.style.userSelect=`auto`,this.canvas.style.webkitUserSelect=`auto`,this.canvas.removeEventListener(`pointerdown`,this._handlePointerDown),this.canvas.removeEventListener(`mousedown`,this._handleMouseDown),this.canvas.removeEventListener(`touchstart`,this._handleTouchStart),this._removeMoveUpEventListeners()}_getListenerFunctions(){let e=window.document===this.canvas.ownerDocument?window:this.canvas.ownerDocument.defaultView??this.canvas.ownerDocument;return{addEventListener:e.addEventListener.bind(e),removeEventListener:e.removeEventListener.bind(e)}}_removeMoveUpEventListeners(){let{removeEventListener:e}=this._getListenerFunctions();e(`pointermove`,this._handlePointerMove),e(`pointerup`,this._handlePointerUp),e(`pointercancel`,this._handlePointerCancel),e(`mousemove`,this._handleMouseMove),e(`mouseup`,this._handleMouseUp),e(`touchmove`,this._handleTouchMove),e(`touchend`,this._handleTouchEnd),e(`touchcancel`,this._handleTouchCancel)}isEmpty(){return this._isEmpty}fromData(e,{clear:t=!0}={}){t&&this.clear(),this._fromData(e,this._drawCurve.bind(this),this._drawDot.bind(this)),this._data=this._data.concat(e)}toData(){return this._data}_isLeftButtonPressed(e,t){return t?e.buttons===1:(e.buttons&1)==1}_pointerEventToSignatureEvent(e){return{event:e,type:e.type,x:e.clientX,y:e.clientY,pressure:`pressure`in e?e.pressure:0}}_touchEventToSignatureEvent(e){let t=e.changedTouches[0];return{event:e,type:e.type,x:t.clientX,y:t.clientY,pressure:t.force}}_handleMouseDown(e){!this._isLeftButtonPressed(e,!0)||this._drawingStroke||this._strokeBegin(this._pointerEventToSignatureEvent(e))}_handleMouseMove(e){if(!this._isLeftButtonPressed(e,!0)||!this._drawingStroke){this._strokeEnd(this._pointerEventToSignatureEvent(e),!1);return}this._strokeMoveUpdate(this._pointerEventToSignatureEvent(e))}_handleMouseUp(e){this._isLeftButtonPressed(e)||this._strokeEnd(this._pointerEventToSignatureEvent(e))}_handleTouchStart(e){e.targetTouches.length!==1||this._drawingStroke||(e.cancelable&&e.preventDefault(),this._strokeBegin(this._touchEventToSignatureEvent(e)))}_handleTouchMove(e){if(e.targetTouches.length===1){if(e.cancelable&&e.preventDefault(),!this._drawingStroke){this._strokeEnd(this._touchEventToSignatureEvent(e),!1);return}this._strokeMoveUpdate(this._touchEventToSignatureEvent(e))}}_handleTouchEnd(e){e.targetTouches.length===0&&(e.cancelable&&e.preventDefault(),this._strokeEnd(this._touchEventToSignatureEvent(e)))}_handlePointerCancel(e){this._allowPointerId(e)&&(e.preventDefault(),this._strokeEnd(this._pointerEventToSignatureEvent(e),!1))}_handleTouchCancel(e){e.cancelable&&e.preventDefault(),this._strokeEnd(this._touchEventToSignatureEvent(e),!1)}_getPointerId(e){return e.persistentDeviceId||e.pointerId}_allowPointerId(e,t=!1){return this._strokePointerId===void 0?t:this._getPointerId(e)===this._strokePointerId}_handlePointerDown(e){this._drawingStroke||!this._isLeftButtonPressed(e)||!this._allowPointerId(e,!0)||(this._strokePointerId=this._getPointerId(e),e.preventDefault(),this._strokeBegin(this._pointerEventToSignatureEvent(e)))}_handlePointerMove(e){if(this._allowPointerId(e)){if(!this._isLeftButtonPressed(e,!0)||!this._drawingStroke){this._strokeEnd(this._pointerEventToSignatureEvent(e),!1);return}e.preventDefault(),this._strokeMoveUpdate(this._pointerEventToSignatureEvent(e))}}_handlePointerUp(e){this._isLeftButtonPressed(e)||!this._allowPointerId(e)||(e.preventDefault(),this._strokeEnd(this._pointerEventToSignatureEvent(e)))}_getPointGroupOptions(e){return{penColor:e&&`penColor`in e?e.penColor:this.penColor,dotSize:e&&`dotSize`in e?e.dotSize:this.dotSize,minWidth:e&&`minWidth`in e?e.minWidth:this.minWidth,maxWidth:e&&`maxWidth`in e?e.maxWidth:this.maxWidth,velocityFilterWeight:e&&`velocityFilterWeight`in e?e.velocityFilterWeight:this.velocityFilterWeight,compositeOperation:e&&`compositeOperation`in e?e.compositeOperation:this.compositeOperation}}_strokeBegin(e){if(!this.dispatchEvent(new CustomEvent(`beginStroke`,{detail:e,cancelable:!0})))return;let{addEventListener:t}=this._getListenerFunctions();switch(e.event.type){case`mousedown`:t(`mousemove`,this._handleMouseMove,{passive:!1}),t(`mouseup`,this._handleMouseUp,{passive:!1});break;case`touchstart`:t(`touchmove`,this._handleTouchMove,{passive:!1}),t(`touchend`,this._handleTouchEnd,{passive:!1}),t(`touchcancel`,this._handleTouchCancel,{passive:!1});break;case`pointerdown`:t(`pointermove`,this._handlePointerMove,{passive:!1}),t(`pointerup`,this._handlePointerUp,{passive:!1}),t(`pointercancel`,this._handlePointerCancel,{passive:!1});break;default:}this._drawingStroke=!0;let n=this._getPointGroupOptions(),r={...n,points:[]};this._data.push(r),this._reset(n),this._strokeUpdate(e)}_strokeUpdate(e){if(!this._drawingStroke)return;if(this._data.length===0){this._strokeBegin(e);return}this.dispatchEvent(new CustomEvent(`beforeUpdateStroke`,{detail:e}));let t=this._createPoint(e.x,e.y,e.pressure),n=this._data[this._data.length-1],r=n.points,i=r.length>0&&r[r.length-1],a=i?t.distanceTo(i)<=this.minDistance:!1,o=this._getPointGroupOptions(n);if(!i||!(i&&a)){let e=this._addPoint(t,o);i?e&&this._drawCurve(e,o):this._drawDot(t,o),r.push({time:t.time,x:t.x,y:t.y,pressure:t.pressure})}this.dispatchEvent(new CustomEvent(`afterUpdateStroke`,{detail:e}))}_strokeEnd(e,t=!0){this._removeMoveUpEventListeners(),this._drawingStroke&&(t&&this._strokeUpdate(e),this._drawingStroke=!1,this._strokePointerId=void 0,this.dispatchEvent(new CustomEvent(`endStroke`,{detail:e})))}_handlePointerEvents(){this._drawingStroke=!1,this.canvas.addEventListener(`pointerdown`,this._handlePointerDown,{passive:!1})}_handleMouseEvents(){this._drawingStroke=!1,this.canvas.addEventListener(`mousedown`,this._handleMouseDown,{passive:!1})}_handleTouchEvents(){this.canvas.addEventListener(`touchstart`,this._handleTouchStart,{passive:!1})}_reset(e){this._lastPoints=[],this._lastVelocity=0,this._lastWidth=(e.minWidth+e.maxWidth)/2,this._ctx.fillStyle=e.penColor,this._ctx.globalCompositeOperation=e.compositeOperation}_createPoint(e,t,n){let r=this.canvas.getBoundingClientRect();return new Z(e-r.left,t-r.top,n,new Date().getTime())}_addPoint(e,t){let{_lastPoints:n}=this;if(n.push(e),n.length>2){n.length===3&&n.unshift(n[0]);let e=this._calculateCurveWidths(n[1],n[2],t),r=yn.fromPoints(n,e);return n.shift(),r}return null}_calculateCurveWidths(e,t,n){let r=n.velocityFilterWeight*t.velocityFrom(e)+(1-n.velocityFilterWeight)*this._lastVelocity,i=this._strokeWidth(r,n),a={end:i,start:this._lastWidth};return this._lastVelocity=r,this._lastWidth=i,a}_strokeWidth(e,t){return Math.max(t.maxWidth/(e+1),t.minWidth)}_drawCurveSegment(e,t,n){let r=this._ctx;r.moveTo(e,t),r.arc(e,t,n,0,2*Math.PI,!1),this._isEmpty=!1}_drawCurve(e,t){let n=this._ctx,r=e.endWidth-e.startWidth,i=Math.ceil(e.length())*2;n.beginPath(),n.fillStyle=t.penColor;for(let n=0;n<i;n+=1){let a=n/i,o=a*a,s=o*a,c=1-a,l=c*c,u=l*c,d=u*e.startPoint.x;d+=3*l*a*e.control1.x,d+=3*c*o*e.control2.x,d+=s*e.endPoint.x;let f=u*e.startPoint.y;f+=3*l*a*e.control1.y,f+=3*c*o*e.control2.y,f+=s*e.endPoint.y;let p=Math.min(e.startWidth+s*r,t.maxWidth);this._drawCurveSegment(d,f,p)}n.closePath(),n.fill()}_drawDot(e,t){let n=this._ctx,r=t.dotSize>0?t.dotSize:(t.minWidth+t.maxWidth)/2;n.beginPath(),this._drawCurveSegment(e.x,e.y,r),n.closePath(),n.fillStyle=t.penColor,n.fill()}_fromData(e,t,n){for(let r of e){let{points:e}=r,i=this._getPointGroupOptions(r);if(e.length>1)for(let n=0;n<e.length;n+=1){let r=e[n],a=new Z(r.x,r.y,r.pressure,r.time);n===0&&this._reset(i);let o=this._addPoint(a,i);o&&t(o,i)}else this._reset(i),n(e[0],i)}}toSVG({includeBackgroundColor:e=!1,includeDataUrl:t=!1}={}){let n=this._data,r=Math.max(window.devicePixelRatio||1,1),i=this.canvas.width/r,a=this.canvas.height/r,o=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`);if(o.setAttribute(`xmlns`,`http://www.w3.org/2000/svg`),o.setAttribute(`xmlns:xlink`,`http://www.w3.org/1999/xlink`),o.setAttribute(`viewBox`,`0 0 ${i} ${a}`),o.setAttribute(`width`,i.toString()),o.setAttribute(`height`,a.toString()),e&&this.backgroundColor){let e=document.createElement(`rect`);e.setAttribute(`width`,`100%`),e.setAttribute(`height`,`100%`),e.setAttribute(`fill`,this.backgroundColor),o.appendChild(e)}if(t&&this._dataUrl){let e=this._dataUrlOptions?.ratio||window.devicePixelRatio||1,t=this._dataUrlOptions?.width||this.canvas.width/e,n=this._dataUrlOptions?.height||this.canvas.height/e,r=this._dataUrlOptions?.xOffset||0,i=this._dataUrlOptions?.yOffset||0,a=document.createElement(`image`);a.setAttribute(`x`,r.toString()),a.setAttribute(`y`,i.toString()),a.setAttribute(`width`,t.toString()),a.setAttribute(`height`,n.toString()),a.setAttribute(`preserveAspectRatio`,`none`),a.setAttribute(`href`,this._dataUrl),o.appendChild(a)}return this._fromData(n,(e,{penColor:t})=>{let n=document.createElement(`path`);if(!isNaN(e.control1.x)&&!isNaN(e.control1.y)&&!isNaN(e.control2.x)&&!isNaN(e.control2.y)){let r=`M ${e.startPoint.x.toFixed(3)},${e.startPoint.y.toFixed(3)} C ${e.control1.x.toFixed(3)},${e.control1.y.toFixed(3)} ${e.control2.x.toFixed(3)},${e.control2.y.toFixed(3)} ${e.endPoint.x.toFixed(3)},${e.endPoint.y.toFixed(3)}`;n.setAttribute(`d`,r),n.setAttribute(`stroke-width`,(e.endWidth*2.25).toFixed(3)),n.setAttribute(`stroke`,t),n.setAttribute(`fill`,`none`),n.setAttribute(`stroke-linecap`,`round`),o.appendChild(n)}},(e,{penColor:t,dotSize:n,minWidth:r,maxWidth:i})=>{let a=document.createElement(`circle`),s=n>0?n:(r+i)/2;a.setAttribute(`r`,s.toString()),a.setAttribute(`cx`,e.x.toString()),a.setAttribute(`cy`,e.y.toString()),a.setAttribute(`fill`,t),o.appendChild(a)}),o.outerHTML}};async function Q(e){let t=new AbortController,i=null;e.innerHTML=`<p class="p-4">Cargando comodatos...</p>`;let[{data:a,error:o},{data:s,error:c}]=await Promise.all([Y(),W({estado_uso:`disponible`})]);if(o||c)return e.innerHTML=`<div class="alert alert-danger m-4">Error: `+(o||c).message+`</div>`,{teardown:()=>t.abort()};let l=(a||[]).map(e=>{let t=e.fecha_vencimiento?A(e):{label:`Sin vencimiento`,clase:`badge bg-secondary`},n=it(e);return`<tr><td class="font-monospace small">`+((e.inventario_activos&&e.inventario_activos.codigo_inventario)??`—`)+`</td><td>`+((e.inventario_activos&&e.inventario_activos.tipo_instrumento)??`—`)+`</td><td><a href="#" class="btn-historial-alumno" data-alumno-id="`+(e.alumno_id||``)+`" data-alumno-nombre="`+(e.alumno_nombre||``)+`">`+(e.alumnos?.nombre_completo||e.alumno_nombre||`—`)+`</a></td><td>`+(e.fecha_entrega?new Date(e.fecha_entrega).toLocaleDateString(`es-DO`):`—`)+`</td><td>`+(e.fecha_vencimiento?new Date(e.fecha_vencimiento).toLocaleDateString(`es-DO`):`—`)+`</td><td><span class="`+t.clase+`">`+t.label+`</span></td><td><span class="badge bg-`+(e.estado===`activo`?`success`:`secondary`)+`">`+(e.estado||`activo`)+`</span></td><td class="d-flex gap-1">`+(n?`<button class="btn btn-sm btn-outline-warning btn-renovar" data-id="`+e.id+`" title="Renovar"><i class="bi bi-arrow-clockwise"></i></button>`:``)+`<button class="btn btn-sm btn-outline-info btn-intercambiar" data-id="`+e.id+`" title="Intercambiar"><i class="bi bi-arrow-left-right"></i></button><button class="btn btn-sm btn-outline-danger btn-devolver" data-id="`+e.id+`" data-alumno="`+(e.alumnos?.nombre_completo||e.alumno_nombre||``)+`" data-instrumento="`+(e.inventario_activos&&e.inventario_activos.codigo_inventario||``)+`"><i class="bi bi-box-arrow-in-left"></i></button></td></tr>`}).join(``),u=(s||[]).map(e=>`<option value="`+e.id+`">`+e.codigo_inventario+` — `+e.tipo_instrumento+`</option>`).join(``),d=tt.map(e=>`<option value="`+e+`">`+e.charAt(0).toUpperCase()+e.slice(1)+`</option>`).join(``);e.innerHTML=[`<div class="container-fluid p-4">`,`<div class="d-flex justify-content-between align-items-center mb-4">`,`<h4 class="mb-0"><i class="bi bi-clipboard-check me-2"></i>Control de Comodatos</h4>`,`<div class="d-flex gap-2">`,`<button id="btn-alertas" class="btn btn-warning btn-sm"><i class="bi bi-exclamation-triangle me-1"></i> Alertas</button>`,`<button id="btn-nuevo-comodato" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg me-1"></i> Asignar instrumento</button>`,`</div></div>`,`<div class="card shadow-sm mb-3"><div class="card-body py-2">`,`<form id="filter-form" class="row g-2 align-items-end">`,`<div class="col-md-3"><label class="form-label small mb-0">Tipo comodato</label>`,`<select id="filter-tipo" class="form-select form-select-sm"><option value="">Todos</option>`+tt.map(e=>`<option value="`+e+`">`+e+`</option>`).join(``)+`</select></div>`,`<div class="col-md-3"><label class="form-label small mb-0">Estado</label>`,`<select id="filter-estado" class="form-select form-select-sm"><option value="">Todos</option><option value="activo">Activo</option><option value="vencido">Vencido</option><option value="proximo">Próximo a vencer</option></select></div>`,`<div class="col-md-3"><label class="form-label small mb-0">Buscar instrumento</label>`,`<input id="search-input" type="text" class="form-control form-control-sm" placeholder="Código o tipo..."></div>`,`<div class="col-md-3 d-flex gap-1">`,`<button id="btn-filtrar" class="btn btn-sm btn-outline-primary"><i class="bi bi-funnel"></i> Filtrar</button>`,`<button id="btn-limpiar" class="btn btn-sm btn-outline-secondary"><i class="bi bi-x-circle"></i></button>`,`</div></form></div></div>`,`<div class="card shadow-sm"><div class="card-body p-0">`,`<table class="table table-hover mb-0"><thead class="table-light">`,`<tr><th>Código</th><th>Instrumento</th><th>Alumno</th><th>Entrega</th><th>Vencimiento</th><th>Estado ven.</th><th>Estado</th><th></th></tr>`,`</thead><tbody id="tbody-comodatos">`+(l||`<tr><td colspan="8" class="text-center text-muted py-4">Sin comodatos activos</td></tr>`)+`</tbody></table>`,`</div></div></div>`,`<div class="modal fade" id="modal-comodato" tabindex="-1"><div class="modal-dialog"><div class="modal-content">`,`<div class="modal-header"><h5 class="modal-title">Asignar instrumento en comodato</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>`,`<div class="modal-body"><form id="form-comodato" novalidate>`,`<div class="mb-3"><label class="form-label fw-semibold">Instrumento disponible</label><select class="form-select" name="activo_id" required><option value="">— Seleccionar —</option>`+u+`</select></div>`,`<div class="mb-3"><label class="form-label fw-semibold">Alumno</label><select class="form-select" name="alumno_id" id="select-alumno" required><option value="">Cargando...</option></select></div>`,`<div class="row g-3 mb-3"><div class="col-6"><label class="form-label fw-semibold">Tipo comodato</label><select class="form-select" name="tipo_comodato">`+d+`</select></div>`,`<div class="col-6"><label class="form-label fw-semibold">Fecha vencimiento</label><input type="date" class="form-control" name="fecha_vencimiento"></div></div>`,`<div class="mb-3"><label class="form-label fw-semibold">Instrumento propio ID</label><input type="text" class="form-control" name="instrumento_propio_id" placeholder="Opcional"></div>`,`<div class="mb-3"><label class="form-label fw-semibold">Observaciones</label><textarea class="form-control" name="observaciones" rows="2"></textarea></div><div class="mb-3"><label class="form-label fw-semibold">Contrato firmado (PDF)</label><input type="file" class="form-control" id="contrato-file" accept=".pdf,image/*"></div><div class="mb-3"><label class="form-label fw-semibold d-block">Firma Digital del Representante</label><div class="p-1" style="border: 1.5px solid rgba(0,0,0,0.15); background: white; border-radius: 8px;"><canvas id="signature-pad-canvas" width="450" height="150" style="width: 100%; height: 150px; background: white; border-radius: 6px; cursor: crosshair;"></canvas></div><button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="btn-limpiar-firma">Limpiar Firma</button></div>`,`<div id="modal-comodato-error" class="alert alert-danger d-none"></div>`,`</form></div>`,`<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>`,`<button id="btn-guardar-comodato" class="btn btn-primary"><i class="bi bi-save me-1"></i> Asignar</button></div>`,`</div></div></div>`,`<div class="modal fade" id="modal-historial-alumno" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">`,`<div class="modal-header"><h5 class="modal-title" id="modal-historial-titulo">Historial del alumno</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>`,`<div class="modal-body" id="modal-historial-body"><p>Cargando...</p></div>`,`<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button></div>`,`</div></div></div>`,`<div class="modal fade" id="modal-devolucion" tabindex="-1"><div class="modal-dialog"><div class="modal-content">`,`<div class="modal-header"><h5 class="modal-title">Confirmar devolución</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>`,`<div class="modal-body"><p id="devolucion-info"></p><label class="form-label fw-semibold">Fecha de devolución</label><input type="date" class="form-control" id="input-fecha-devolucion" value="`+new Date().toISOString().split(`T`)[0]+`"></div>`,`<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>`,`<button id="btn-confirmar-devolucion" class="btn btn-danger">Confirmar devolución</button></div>`,`</div></div></div>`].join(`
`),n.rpc(`get_alumnos_disponibles_para_inscripcion`).then(({data:t})=>{let n=e.querySelector(`#select-alumno`);!n||!t||(n.innerHTML=`<option value="">— Seleccionar alumno —</option>`+t.map(e=>`<option value="`+e.id+`">`+e.nombre_completo+`</option>`).join(``))}),e.querySelector(`#btn-alertas`)?.addEventListener(`click`,()=>{window.router?.navigate(`inventario-alertas`)},{signal:t.signal}),e.querySelector(`#btn-nuevo-comodato`)?.addEventListener(`click`,()=>{e.querySelector(`#form-comodato`)?.reset(),e.querySelector(`#modal-comodato-error`)?.classList.add(`d-none`),f(`modal-comodato`)?.show(),setTimeout(()=>{let t=e.querySelector(`#signature-pad-canvas`);t&&(i=new Sn(t,{penColor:`rgb(0, 0, 0)`}))},250)},{signal:t.signal}),e.querySelector(`#btn-limpiar-firma`)?.addEventListener(`click`,()=>{i?.clear()},{signal:t.signal}),e.querySelector(`#tbody-comodatos`)?.addEventListener(`click`,async t=>{let n=t.target.closest(`button`);if(!n)return;let r=n.dataset.id;if(n.classList.contains(`btn-devolver`)){let{alumno:t,instrumento:i}=n.dataset;e.querySelector(`#devolucion-info`).textContent=`Devolver `+(i||`el instrumento`)+` de `+(t||`alumno`)+`?`,e.querySelector(`#input-fecha-devolucion`).value=new Date().toISOString().split(`T`)[0],e.querySelector(`#btn-confirmar-devolucion`).dataset.id=r,f(`modal-devolucion`)?.show()}else if(n.classList.contains(`btn-renovar`)){if(!confirm(`¿Renovar este comodato?`))return;n.disabled=!0;let{error:t}=await q(r);t?(alert(`Error: `+t.message),n.disabled=!1):(f(`modal-comodato`)?.hide(),Q(e))}else n.classList.contains(`btn-intercambiar`)&&window.router?.navigate(`inventario-intercambio`)},{signal:t.signal}),e.querySelector(`#btn-confirmar-devolucion`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#btn-confirmar-devolucion`).dataset.id;if(!t)return;let n=e.querySelector(`#btn-confirmar-devolucion`);n.disabled=!0;let{error:r}=await J(t);r?(alert(`Error: `+r.message),n.disabled=!1):(f(`modal-devolucion`)?.hide(),Q(e))},{signal:t.signal}),e.querySelector(`#tbody-comodatos`)?.addEventListener(`click`,async t=>{let n=t.target.closest(`.btn-historial-alumno`);if(!n)return;let r=n.dataset.alumnoId,i=n.dataset.alumnoNombre;e.querySelector(`#modal-historial-titulo`).textContent=`Historial de `+(i||`Alumno`);let a=e.querySelector(`#modal-historial-body`);a.innerHTML=`<p>Cargando...</p>`,f(`modal-historial-alumno`)?.show();let{data:o}=await hn(r);a.innerHTML=o&&o.length>0?`<table class="table table-sm"><thead><tr><th>Instrumento</th><th>Entrega</th><th>Devolución</th><th>Estado</th></tr></thead><tbody>`+o.map(e=>`<tr><td>`+(e.inventario_activos&&e.inventario_activos.codigo_inventario||e.activo_id||`---`)+`</td><td>`+(e.fecha_entrega?new Date(e.fecha_entrega).toLocaleDateString(`es-DO`):`---`)+`</td><td>`+(e.fecha_devolucion?new Date(e.fecha_devolucion).toLocaleDateString(`es-DO`):`---`)+`</td><td>`+(e.estado||`---`)+`</td></tr>`).join(``)+`</tbody></table>`:`<p class="text-muted">Sin historial de comodatos.</p>`},{signal:t.signal}),e.querySelector(`#btn-guardar-comodato`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#form-comodato`),r=e.querySelector(`#modal-comodato-error`),a=new FormData(t),o=a.get(`activo_id`),s=a.get(`alumno_id`),c=a.get(`observaciones`)||``,l=a.get(`tipo_comodato`)||`escolar`,u=a.get(`fecha_vencimiento`)||null,d=a.get(`instrumento_propio_id`)||null;if(!o||!s){r.textContent=`Seleccioná el instrumento y el alumno.`,r.classList.remove(`d-none`);return}let p=null;if(i&&!i.isEmpty()){let e=i.toDataURL();p=`SHA256:`+btoa(e).substring(0,32).toUpperCase(),c=c?`${c} [Firma Digital: ${p}]`:`[Firma Digital: ${p}]`}let m=e.querySelector(`#btn-guardar-comodato`);m.disabled=!0,m.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;let{data:h}=await n.auth.getSession(),{data:g,error:_}=await mn({activo_id:o,alumno_id:s,observaciones:c||null,registrado_por:h?.session?.user?.id??null,fecha_entrega:new Date().toISOString().split(`T`)[0],estado:`activo`,tipo_comodato:l,fecha_vencimiento:u,instrumento_propio_id:d});if(m.disabled=!1,m.innerHTML=`<i class="bi bi-save me-1"></i> Asignar`,_)r.textContent=_.message.includes(`uix_comodato_activo`)?`Este instrumento ya tiene un comodato activo.`:_.message,r.classList.remove(`d-none`);else{let t=e.querySelector(`#contrato-file`)?.files?.[0];t&&g?.id&&_n(g.id,t),f(`modal-comodato`)?.hide(),Q(e)}},{signal:t.signal});function f(t){let n=e.querySelector(`#`+t);return n?new r(n):null}return{teardown:()=>t.abort()}}async function $(e){let t=new AbortController;e.innerHTML=`<p class="p-4">Verificando alertas...</p>`;let[n,r,i]=await Promise.all([un(),dn(7),gn()]),a=n.data||[],o=r.data||[],s=i.data||[],c=a.length+o.length+s.length;if(n.error||r.error||i.error)return e.innerHTML=`<div class="alert alert-danger m-4">Error al cargar alertas</div>`,{teardown:()=>t.abort()};function l(e,t,n,r,i){return r.length===0?``:`<div class="card shadow-sm mb-3 border-`+n+`"><div class="card-header fw-semibold text-bg-`+n+`"><i class="bi `+t+` me-1"></i> `+e+` <span class="badge bg-light text-dark ms-1">`+r.length+`</span></div><div class="card-body p-0"><table class="table table-hover mb-0"><thead class="table-light"><tr><th>Alumno</th><th>Instrumento</th><th>Detalle</th><th>Acción sugerida</th><th></th></tr></thead><tbody>`+r.map((t,r)=>{let a=t.fecha_vencimiento?A(t):null;return`<tr><td>`+(t.alumnos?.nombre_completo||t.alumno_nombre||t.alumno_id||`---`)+`</td><td class="font-monospace small">`+(t.inventario_activos?.codigo_inventario||t.codigo_inventario||t.activo_id||`---`)+`</td><td>`+(a?a.label:t.dias_prestado?t.dias_prestado+` días prestado`:`---`)+`</td><td>`+i(t,r)+`</td><td><button class="btn btn-sm btn-outline-`+n+` btn-resolver" data-type="`+e+`" data-idx="`+r+`"><i class="bi bi-check-circle"></i> Resolver</button></td></tr>`}).join(``)+`</tbody></table></div></div>`}return e.innerHTML=[`<div class="container-fluid p-4">`,`<h4 class="mb-1"><i class="bi bi-exclamation-triangle me-2 text-warning"></i>Alertas de Comodatos</h4>`,`<p class="text-muted small mb-4">`+c+` alerta`+(c===1?``:`s`)+` activa`+(c===1?``:`s`)+`</p>`,l(`Vencidos`,`bi-calendar-x-fill`,`danger`,a,()=>`<span class="badge bg-danger">Devolver urgente</span>`),l(`Vencimiento próximo`,`bi-calendar-warning`,`warning`,o,()=>`<span class="badge bg-warning text-dark">Renovar</span>`),l(`Alumno inactivo`,`bi-person-x-fill`,`info`,s,()=>`<span class="badge bg-info text-dark">Contactar alumno</span>`),c===0?`<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Sin alertas activas.</div>`:``,`</div>`].join(`
`),e.querySelectorAll(`.btn-resolver`).forEach(n=>{n.addEventListener(`click`,async()=>{let t=n.dataset.type,r=parseInt(n.dataset.idx),i,c;t.includes(`Vencidos`)?(i=a,c=`devolver`):t.includes(`Vencimiento`)?(i=o,c=`renovar`):(i=s,c=`contactar`);let l=i[r];if(l)if(n.disabled=!0,c===`renovar`){if(!confirm(`¿Renovar este comodato?`)){n.disabled=!1;return}let{error:t}=await q(l.id);t?(alert(`Error: `+t.message),n.disabled=!1):$(e)}else if(c===`devolver`){if(!confirm(`¿Devolver este instrumento?`)){n.disabled=!1;return}let{error:t}=await J(l.id);t?(alert(`Error: `+t.message),n.disabled=!1):$(e)}else alert(`Contactar al alumno: `+(l.alumnos?.nombre_completo||l.alumno_nombre||l.alumno_id||`desconocido`)),n.disabled=!1},{signal:t.signal})}),{teardown:()=>t.abort()}}async function Cn(e){let t=new AbortController;e.innerHTML=`<p class="p-4">Cargando dashboard...</p>`;let[n,r,i,a,o]=await Promise.all([pn(),W({pageSize:200}),Y(),K({}),u({departamento:`LOG`})]);if(n.error)return e.innerHTML=`<div class="alert alert-danger m-4">Error: ${n.error.message}</div>`,{teardown:()=>t.abort()};let s=n.data;r.data?.data||r.data;let c=i.data||[],l=a.data||[],f=o.data||[],p=s.resumen||s,m=s.distribucion_por_tipo||{},h=[`#0d6efd`,`#6f42c1`,`#d63384`,`#fd7e14`,`#ffc107`,`#198754`,`#0dcaf0`,`#dc3545`],g=Object.keys(m).map((e,t)=>{let n=p.total>0?(m[e]/p.total*100).toFixed(1):0;return{label:e,count:m[e],pct:n,color:h[t%h.length]}}),_=g.map((e,t)=>{let n=g.slice(0,t).reduce((e,t)=>e+parseFloat(t.pct),0);return`${e.color} ${n}% ${n+parseFloat(e.pct)}%`}).join(`, `);new Date().setHours(0,0,0,0);let v=(c||[]).filter(e=>e.estado===`activo`&&e.fecha_vencimiento).map(e=>({...e,_vencimiento:A(e)})).filter(e=>!e._vencimiento.label.startsWith(`Sin`)).sort((e,t)=>new Date(e.fecha_vencimiento)-new Date(t.fecha_vencimiento)).slice(0,10).map(e=>`
    <tr>
      <td class="font-monospace small">${e.activo_id||`—`}</td>
      <td>${e.alumno_nombre||`—`}</td>
      <td>${new Date(e.fecha_vencimiento).toLocaleDateString(`es-DO`)}</td>
      <td><span class="${e._vencimiento.clase}">${e._vencimiento.label}</span></td>
    </tr>
  `).join(``),y=[...l].sort((e,t)=>new Date(t.created_at||t.fecha_ingreso)-new Date(e.created_at||e.fecha_ingreso)).slice(0,10).map(e=>{let t={recibido:`badge bg-secondary`,en_reparacion:`badge bg-warning text-dark`,finalizado:`badge bg-info text-dark`,entregado:`badge bg-success`}[e.estado]||`badge bg-secondary`;return`
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
              <span class="kpi-value fs-2 fw-bold">${p.total}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-success h-100" id="kpi-disponibles">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Disponibles</h6>
              <span class="kpi-value fs-2 fw-bold">${p.disponibles}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-info h-100" id="kpi-en-uso">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">En uso</h6>
              <span class="kpi-value fs-2 fw-bold">${p.en_uso}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-warning h-100" id="kpi-ociosos">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">Ociosos</h6>
              <span class="kpi-value fs-2 fw-bold">${p.ociosos}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-danger h-100" id="kpi-en-reparacion">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">En reparación</h6>
              <span class="kpi-value fs-2 fw-bold">${p.en_reparacion}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-xl-2">
          <div class="card text-bg-dark h-100" id="kpi-de-baja">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase">De baja</h6>
              <span class="kpi-value fs-2 fw-bold">${p.de_baja}</span>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-xl-3">
          <div class="card border-primary h-100" id="kpi-valor-total">
            <div class="card-body text-center">
              <h6 class="card-title small text-uppercase text-muted">Valor total</h6>
              <span class="kpi-value fs-4 fw-bold text-primary">RD$ ${(p.valor_total||0).toLocaleString(`es-DO`)}</span>
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
                ${g.length>0?`
                <div id="pie-chart" class="mx-auto mb-3"
                  style="width:180px;height:180px;border-radius:50%;
                  background: conic-gradient(${_});">
                </div>
                `:`<p class="text-muted">Sin datos</p>`}
                <ul id="pie-legend" class="list-unstyled small text-start d-inline-block">
                  ${g.map(e=>`
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
                  ${v||`<tr><td colspan="4" class="text-center text-muted py-3">Sin comodatos próximos a vencer</td></tr>`}
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
                  ${y||`<tr><td colspan="5" class="text-center text-muted py-3">Sin reparaciones registradas</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header fw-semibold d-flex justify-content-between align-items-center">
              <span>📋 Tareas de Logística (Hermes)</span>
              <span class="badge bg-primary text-white">${f.filter(e=>e.estado!==`completada`).length}</span>
            </div>
            <div class="card-body p-3" style="max-height: 250px; overflow-y: auto;">
              ${f.filter(e=>e.estado!==`completada`).map(e=>{let t=e.checklist||[],n=t.filter(e=>(e.estado||(e.completado?`completada`:`pendiente`))===`completada`).length,r=t.length>0?Math.round(n/t.length*100):0;return`
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
  `,e.querySelectorAll(`.btn-quick-complete`).forEach(t=>{t.addEventListener(`click`,async n=>{n.stopPropagation();let r=t.dataset.id;if(confirm(`¿Marcar esta tarea de logística como completada?`)){let{error:t}=await d(r,{estado:`completada`});t||Cn(e)}})}),{teardown:()=>t.abort()}}async function wn(e,{activoId:t}){let n=new AbortController;e.innerHTML=`<p class="p-4">Cargando detalle del instrumento...</p>`;let[r,i,a,o,s]=await Promise.all([Xt(t),G(t),Qt(t),K({activo_id:t}),Y()]);if(r.error)return e.innerHTML=`<div class="alert alert-danger m-4">Error: ${r.error.message}</div>`,{teardown:()=>n.abort()};let c=r.data,l=i.data||[],u=a.data||[],d=o.data||[],f=(s.data||[]).filter(e=>e.activo_id===t),p=w(c),m=Me(c),h=Ae(c),g=je(c),_=Be(l),v=f.find(e=>e.estado===`activo`);return e.innerHTML=`
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
            <span class="detail-badge ms-2">${E(c.estado_uso)}</span>
            <span class="detail-badge ms-1">${T(c.estado_conservacion)}</span>
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
          <tr><th class="text-muted ps-0">Estado conservación</th><td><span class="${T(c.estado_conservacion)}">${c.estado_conservacion}</span></td></tr>
          <tr><th class="text-muted ps-0">Estado uso</th><td><span class="${E(c.estado_uso)}">${c.estado_uso}</span></td></tr>
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
        <div class="tab-pane fade" id="tab-comodato">${(()=>{if(!v)return`<p class="text-muted py-3">Sin comodato activo para este instrumento.</p>`;let e=A(v);return`
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
  `,e.querySelector(`#breadcrumb-inventario`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router&&window.router.navigate(`inventario-stock`)},{signal:n.signal}),e.querySelector(`#btn-editar-activo`)?.addEventListener(`click`,()=>{window.router&&window.router.navigate(`inventario-stock`,{editId:c.id})},{signal:n.signal}),e.querySelector(`#btn-comodato-activo`)?.addEventListener(`click`,()=>{window.router&&window.router.navigate(`inventario-comodatos`,{activoId:c.id})},{signal:n.signal}),e.querySelector(`#btn-reparar-activo`)?.addEventListener(`click`,()=>{window.router&&window.router.navigate(`inventario-stock`)},{signal:n.signal}),e.querySelector(`#btn-baja-activo`)?.addEventListener(`click`,async()=>{if(!h||!confirm(`¿Dar de baja el instrumento ${c.codigo_inventario}?`))return;let{error:t}=await Zt(c.id,`de_baja`);t?alert(`Error: ${t.message}`):wn(e,{activoId:c.id})},{signal:n.signal}),{teardown:()=>n.abort()}}async function Tn(e,{activoId:t}){let n=new AbortController,i=new Set(D);e.innerHTML=`<p class="p-4">Cargando historial...</p>`,await a();async function a(){let{data:n,error:r}=await G(t);if(r){e.innerHTML=`<div class="alert alert-danger m-4">Error: ${r.message}</div>`;return}let a=ze(Be((n||[]).filter(e=>i.has(e.tipo_evento)))),s=Object.entries(a).sort(([e],[t])=>t.localeCompare(e)).map(([e,t])=>{let[n,r]=e.split(`-`);return`
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
              ${D.map(e=>{let t=Fe[e]||`bi-question-circle`,n=e.replace(/_/g,` `).replace(/\b\w/g,e=>e.toUpperCase());return`
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
                      ${D.filter(e=>e!==`creacion`).map(e=>`
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
    `,o()}function o(){e.querySelector(`#filter-tipo-evento`)?.addEventListener(`change`,t=>{t.target.closest(`.filter-evento`)&&(i=new Set(Array.from(e.querySelectorAll(`.filter-evento:checked`)).map(e=>e.value)),a())},{signal:n.signal}),e.querySelector(`#btn-agregar-evento`)?.addEventListener(`click`,()=>{e.querySelector(`#form-evento-manual`).reset(),e.querySelector(`#modal-evento-error`).classList.add(`d-none`),s()?.show()},{signal:n.signal}),e.querySelector(`#btn-guardar-evento`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#form-evento-manual`),n=e.querySelector(`#modal-evento-error`),r=new FormData(t),i={activo_id:r.get(`activo_id`),tipo_evento:r.get(`tipo_evento`),descripcion:r.get(`descripcion`)};if(!i.tipo_evento||!i.descripcion.trim()){n.textContent=`Completá todos los campos requeridos.`,n.classList.remove(`d-none`);return}let o=e.querySelector(`#btn-guardar-evento`);o.disabled=!0;let{error:c}=await $t(i);o.disabled=!1,c?(n.textContent=c.message,n.classList.remove(`d-none`)):(s()?.hide(),a())},{signal:n.signal})}function s(){let t=e.querySelector(`#modal-evento-manual`);return t?new r(t):null}return{teardown:()=>n.abort()}}export{E as A,Xe as C,Ke as D,He as E,u as M,Ge as O,Ye as S,Ve as T,an as _,Q as a,K as b,ln as c,tn as d,fn as f,on as g,Y as h,$ as i,d as j,T as k,rn as l,W as m,wn as n,vn as o,qt as p,Cn as r,nn as s,Tn as t,sn as u,G as v,Ze as w,cn as x,en as y};