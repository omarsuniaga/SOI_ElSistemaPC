import { supabase } from '../../lib/supabaseClient.js'
import { validarSolicitud } from './ausenciaValidator.js'
import { crearSolicitud, registrarAuditoria, buscarClasesAfectadas } from './ausenciaService.js'

/**
 * Crear nueva solicitud de ausencia (Maestro)
 */
export async function crearAusencia(data) {
  // Validate
  const validation = validarSolicitud(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  // Find affected classes
  const clasesAfectadas = await buscarClasesAfectadas(
    data.maestro_id,
    data.fecha_inicio,
    data.fecha_fin
  );

  // Create absence
  const ausencia = await crearSolicitud({
    ...data,
    clases_afectadas: clasesAfectadas.map(c => ({
      clase_id: c.id,
      cobertura: data.cobertura?.[c.id] || null
    }))
  });

  // Notify director
  await crearNotificacion(
    null, // Will be director_id from schema
    'nueva_solicitud_ausencia',
    {
      ausencia_id: ausencia.id,
      maestro_nombre: data.maestro_nombre,
      fechas: `${data.fecha_inicio} - ${data.fecha_fin}`
    }
  );

  return ausencia;
}

/**
 * Get pending absences for director review
 */
export async function obtenerPendientesDirector(directorId) {
  const { data: ausencias, error } = await supabase
    .from('ausencias_maestros')
    .select('*')
    .eq('estado', 'en_revision')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ausencias || [];
}

/**
 * Director reviews absence
 */
export async function revisarAusencia(ausenciaId, directorId, accion, notas) {
  let nuevoEstado;

  if (accion === 'aprobar') {
    nuevoEstado = 'pendiente_admin';
  } else if (accion === 'rechazar') {
    nuevoEstado = 'rechazada';
  } else if (accion === 'solicitar_info') {
    nuevoEstado = 'solicitada';
  }

  const { data, error } = await supabase
    .from('ausencias_maestros')
    .update({
      estado: nuevoEstado,
      revisado_por: directorId,
      revision_notas: notas,
      revision_en: new Date().toISOString()
    })
    .eq('id', ausenciaId)
    .select();

  if (error) throw error;

  // Register audit
  await registrarAuditoria(ausenciaId, directorId, accion, notas);

  // Notify maestro if rejected or info requested
  if (accion === 'rechazar' || accion === 'solicitar_info') {
    const { data: ausencia } = await supabase
      .from('ausencias_maestros')
      .select('maestro_id')
      .eq('id', ausenciaId)
      .single();

    if (ausencia) {
      await crearNotificacion(
        ausencia.maestro_id,
        'revision_director',
        {
          accion,
          notas
        }
      );
    }
  }

  return data[0];
}

/**
 * Admin approves absence (FINAL)
 */
export async function aprobarAusencia(ausenciaId, adminId, notas) {
  const { data, error } = await supabase
    .from('ausencias_maestros')
    .update({
      estado: 'aprobada',
      aprobado_por: adminId,
      aprobado_en: new Date().toISOString()
    })
    .eq('id', ausenciaId)
    .select();

  if (error) throw error;

  // Register audit
  await registrarAuditoria(ausenciaId, adminId, 'aprobada', notas);

  // Notify maestro
  const { data: ausencia } = await supabase
    .from('ausencias_maestros')
    .select('maestro_id')
    .eq('id', ausenciaId)
    .single();

  if (ausencia) {
    await crearNotificacion(
      ausencia.maestro_id,
      'ausencia_aprobada',
      { ausencia_id: ausenciaId }
    );
  }

  return data[0];
}

/**
 * Admin rejects absence (FINAL)
 */
export async function rechazarAusencia(ausenciaId, adminId, razon) {
  const { data, error } = await supabase
    .from('ausencias_maestros')
    .update({
      estado: 'rechazada',
      rechazado_por: adminId,
      rechazado_en: new Date().toISOString(),
      razon_rechazo: razon
    })
    .eq('id', ausenciaId)
    .select();

  if (error) throw error;

  // Register audit
  await registrarAuditoria(ausenciaId, adminId, 'rechazada', razon);

  // Notify maestro
  const { data: ausencia } = await supabase
    .from('ausencias_maestros')
    .select('maestro_id')
    .eq('id', ausenciaId)
    .single();

  if (ausencia) {
    await crearNotificacion(
      ausencia.maestro_id,
      'ausencia_rechazada',
      {
        razon,
        ausencia_id: ausenciaId
      }
    );
  }

  return data[0];
}

/**
 * Get audit trail for absence
 */
export async function obtenerAuditoria(ausenciaId) {
  const { data, error } = await supabase
    .from('ausencias_auditoria')
    .select('*, actor:actor_id(nombre)')
    .eq('ausencia_id', ausenciaId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data || [];
}

/**
 * Internal: Create portal notification
 */
async function crearNotificacion(profileId, tipo, data) {
  if (!profileId) return; // Skip if no recipient

  const mensajes = {
    'nueva_solicitud_ausencia': `Nueva solicitud de ausencia: ${data.maestro_nombre} (${data.fechas})`,
    'revision_director': data.accion === 'rechazar'
      ? `Tu solicitud fue rechazada: ${data.notas}`
      : 'Director solicita más información sobre tu ausencia',
    'ausencia_aprobada': '✓ Tu ausencia fue aprobada',
    'ausencia_rechazada': `✗ Tu solicitud no fue aprobada: ${data.razon}`
  };

  await supabase.from('notificaciones').insert({
    profile_id: profileId,
    tipo: 'sistema',
    titulo: 'Solicitud de Ausencia',
    mensaje: mensajes[tipo] || 'Actualización de ausencia',
    deep_link: '/ausencias',
    estado: 'pendiente'
  });
}

/**
 * Get all classes for a maestro
 */
export async function obtenerClasesMaestro(maestroId) {
  const { data, error } = await supabase
    .from('clases')
    .select('id, nombre, instrumento, maestro_id')
    .eq('maestro_id', maestroId);

  if (error) throw error;
  return data || [];
}

/**
 * Get sessions in a date range for given classes
 */
export async function obtenerSesionesRango(claseIds, fechaInicio, fechaFin) {
  if (!claseIds || claseIds.length === 0) return [];

  const { data, error } = await supabase
    .from('sesiones')
    .select('id, clase_id, fecha, hora_inicio, hora_fin, salon_id')
    .in('clase_id', claseIds)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)
    .order('fecha', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get recurring schedules (horarios) for classes
 */
export async function obtenerHorariosClases(claseIds) {
  if (!claseIds || claseIds.length === 0) return [];

  const { data, error } = await supabase
    .from('horarios')
    .select('id, clase_id, dia, hora_inicio, hora_fin')
    .in('clase_id', claseIds);

  if (error) throw error;
  return data || [];
}

/**
 * Get all active salons
 */
export async function obtenerSalonesActivos() {
  const { data, error } = await supabase
    .from('salones')
    .select('id, nombre, capacidad, ubicacion')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get occupied sessions for a given date and time
 */
export async function obtenerSesionesOcupadas(fecha, hora) {
  if (!fecha || !hora) return [];

  const { data, error } = await supabase
    .from('sesiones')
    .select('id, salon_id, clase_id, fecha, hora_inicio, hora_fin')
    .eq('fecha', fecha)
    .order('hora_inicio', { ascending: true });

  if (error) throw error;

  // Filter sessions that overlap with the given time
  return (data || []).filter((sesion) => {
    if (!sesion.hora_inicio || !sesion.hora_fin) return false;
    return hora >= sesion.hora_inicio && hora < sesion.hora_fin;
  });
}

/**
 * Get substitute teachers for a class
 */
export async function obtenerMaestrosSuplentes(claseId) {
  if (!claseId) return [];

  // Get the main teacher's instrument first
  const { data: clase, error: claseError } = await supabase
    .from('clases')
    .select('instrumento')
    .eq('id', claseId)
    .single();

  if (claseError || !clase) return [];

  // Get other active teachers with same instrument
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre_completo, correo')
    .eq('rol', 'maestro')
    .eq('activo', true)
    .neq('id', clase.maestro_id || 'null')
    .order('nombre_completo', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Register an absence request
 */
export async function registrarAusencia(payload) {
  const { data, error } = await supabase
    .from('ausencias_maestros')
    .insert([{
      maestro_id: payload.maestro_id,
      tipo_ausencia: payload.tipo_ausencia,
      fecha_inicio: payload.fecha_inicio,
      fecha_fin: payload.fecha_fin,
      motivo: payload.motivo,
      urgencia: payload.urgencia,
      duracion_tipo: payload.duracion_tipo,
      clases_afectadas: payload.clases_afectadas,
      actividades_por_clase: payload.actividades_por_clase,
      clase_emergente: payload.clase_emergente,
      archivo_url: payload.archivo_url,
      estado: payload.estado || 'pendiente',
      creado_en: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create absence notification for director
 */
export async function crearNotificacionAusencia({ ausencia, maestro, approvalUrl }) {
  if (!ausencia || !maestro) return null;

  const fechas = ausencia.fecha_inicio === ausencia.fecha_fin
    ? ausencia.fecha_inicio
    : `${ausencia.fecha_inicio} al ${ausencia.fecha_fin}`;

  const mensaje = `Nueva solicitud de ausencia: ${maestro.nombre_completo || maestro.nombre} (${fechas}) - Tipo: ${ausencia.tipo_ausencia}`;

  const { data, error } = await supabase
    .from('notificaciones')
    .insert([{
      profile_id: null, // Will be set by trigger to director
      tipo: 'sistema',
      titulo: 'Nueva Solicitud de Ausencia',
      mensaje,
      deep_link: approvalUrl || '/ausencias/pendientes',
      estado: 'pendiente',
      ausencia_id: ausencia.id,
      creado_en: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
