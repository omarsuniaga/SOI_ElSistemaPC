import { supabase } from '../../../lib/supabase';

export const calendarApi = {
  async crearEvento(datos) {
    try {
      const { data, error } = await supabase.rpc('fn_crear_evento_calendario', {
        p_departamento_id: datos.departamento_id,
        p_titulo: datos.titulo,
        p_descripcion: datos.descripcion,
        p_tipo: datos.tipo,
        p_fecha_inicio: datos.fecha_inicio,
        p_fecha_fin: datos.fecha_fin,
        p_fecha_alerta: datos.fecha_alerta,
        p_prioridad: datos.prioridad,
        p_notas: datos.notas
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async obtenerEventosProximos(diasHasta = 30) {
    try {
      const { data, error } = await supabase.rpc('fn_obtener_eventos_proximos', {
        p_dias_desde: 0,
        p_dias_hasta: diasHasta
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data: data?.eventos || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async obtenerTareasDepartamento(departamentoId, estado = null) {
    try {
      const { data, error } = await supabase.rpc('fn_obtener_tareas_departamento', {
        p_departamento_id: departamentoId,
        p_estado: estado
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data: data?.tareas || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async actualizarTarea(tareaId, nuevoEstado) {
    try {
      const { data, error } = await supabase.rpc('fn_actualizar_tarea', {
        p_tarea_id: tareaId,
        p_nuevo_estado: nuevoEstado
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
