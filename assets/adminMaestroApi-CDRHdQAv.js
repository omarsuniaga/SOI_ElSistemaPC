import{i as e}from"./supabase-Cgh_dhNB.js";async function t(){try{let{data:t,error:n}=await e.from(`maestro_desempeno`).select(`
        id,
        maestro_id,
        maestros(id, nombre_completo),
        total_sesiones,
        sesiones_verde,
        sesiones_amarillo,
        sesiones_naranja,
        sesiones_rojo,
        categoria,
        tendencia,
        fecha_ultima_evaluacion,
        pending_count,
        oldest_dias_atraso,
        updated_at
        `).order(`updated_at`,{ascending:!1});if(n){if(n.code===`PGRST301`||typeof n.message==`string`&&n.message.includes(`relation`)&&n.message.includes(`does not exist`))return console.warn(`[getMaestrosComplianceStatus] Tabla maestro_desempeno no disponible; devolviendo vacío.`),[];throw console.error(`[getMaestrosComplianceStatus] Error:`,n),n}return t||[]}catch(e){throw console.error(`[getMaestrosComplianceStatus] Exception:`,e),e}}async function n(t){try{let{data:n,error:r}=await e.from(`registros_pendientes`).select(`
        id,
        created_at,
        notification_state,
        notif_count,
        last_notified_at,
        clases(nombre),
        sesiones_clase(fecha, hora_inicio)
        `).eq(`maestro_id`,t).eq(`estado`,`pendiente`).in(`tipo`,[`asistencia_pendiente`,`contenido_pendiente`]).order(`created_at`,{ascending:!1});if(r)throw console.error(`[getMaestroPendingRegistros] Error:`,r),r;return n||[]}catch(e){throw console.error(`[getMaestroPendingRegistros] Exception:`,e),e}}async function r(t,n=20){try{let{data:r,error:i}=await e.from(`notificaciones`).select(`
        id,
        titulo,
        tipo,
        escalation_level,
        created_at,
        registro_pendiente_id,
        registros_pendientes(notification_state, clases(nombre))
        `).eq(`maestro_id`,t).like(`tipo`,`%escalation%`).order(`created_at`,{ascending:!1}).limit(n);if(i)throw console.error(`[getMaestroNotificationHistory] Error:`,i),i;return r||[]}catch(e){throw console.error(`[getMaestroNotificationHistory] Exception:`,e),e}}export{n,t as r,r as t};