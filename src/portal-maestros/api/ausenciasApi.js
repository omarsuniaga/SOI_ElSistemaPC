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
