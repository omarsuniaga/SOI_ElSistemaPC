/**
 * Generated TypeScript Definitions from Live Production Supabase (SOI)
 * Auto-generated via OpenAPI introspection
 * DO NOT manually invent schemas.
 */

export interface Database {
  public: {
    Tables: {
      vw_indice_ensenanza_guiada: {
        Row: {
          maestro_id: string | null;
          total_sesiones: number | null;
          sesiones_con_indicador: number | null;
          indice: number | null;
        };
        Insert: {
          maestro_id?: string | null;
          total_sesiones?: number | null;
          sesiones_con_indicador?: number | null;
          indice?: number | null;
        };
        Update: {
          maestro_id?: string | null;
          total_sesiones?: number | null;
          sesiones_con_indicador?: number | null;
          indice?: number | null;
        };
      };
      inventario_accesorios: {
        Row: {
          id: string | null;
          activo_id: string | null;
          tipo: string | null;
          marca: string | null;
          cantidad: number | null;
          estado: string | null;
          fecha_asignacion: string | null;
          observaciones: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          activo_id?: string | null;
          tipo?: string | null;
          marca?: string | null;
          cantidad?: number | null;
          estado?: string | null;
          fecha_asignacion?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          activo_id?: string | null;
          tipo?: string | null;
          marca?: string | null;
          cantidad?: number | null;
          estado?: string | null;
          fecha_asignacion?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      patrocinantes: {
        Row: {
          id: string | null;
          nombre: string | null;
          tipo: string | null;
          contacto: string | null;
          email: string | null;
          telefono: string | null;
          activo: boolean | null;
          notas: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          contacto?: string | null;
          email?: string | null;
          telefono?: string | null;
          activo?: boolean | null;
          notas?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          contacto?: string | null;
          email?: string | null;
          telefono?: string | null;
          activo?: boolean | null;
          notas?: string | null;
          created_at?: string | null;
        };
      };
      vw_asistencias_consolidada: {
        Row: {
          sesion_clase_id: string | null;
          fecha: string | null;
          clase_id: string | null;
          nombre_clase: string | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          borrador: boolean | null;
          maestro_principal: string | null;
          maestro_auxiliar: string | null;
          observacion_sesion: string | null;
          observacion_clase: string | null;
          presentes: number | null;
          ausentes: number | null;
          justificados: number | null;
          total_registros: number | null;
          asistencias_detalle: any | null;
          justificaciones_detalle: any | null;
        };
        Insert: {
          sesion_clase_id?: string | null;
          fecha?: string | null;
          clase_id?: string | null;
          nombre_clase?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          borrador?: boolean | null;
          maestro_principal?: string | null;
          maestro_auxiliar?: string | null;
          observacion_sesion?: string | null;
          observacion_clase?: string | null;
          presentes?: number | null;
          ausentes?: number | null;
          justificados?: number | null;
          total_registros?: number | null;
          asistencias_detalle?: any | null;
          justificaciones_detalle?: any | null;
        };
        Update: {
          sesion_clase_id?: string | null;
          fecha?: string | null;
          clase_id?: string | null;
          nombre_clase?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          borrador?: boolean | null;
          maestro_principal?: string | null;
          maestro_auxiliar?: string | null;
          observacion_sesion?: string | null;
          observacion_clase?: string | null;
          presentes?: number | null;
          ausentes?: number | null;
          justificados?: number | null;
          total_registros?: number | null;
          asistencias_detalle?: any | null;
          justificaciones_detalle?: any | null;
        };
      };
      campanas_pago: {
        Row: {
          id: string | null;
          nombre: string | null;
          descripcion: string | null;
          incentivo: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          creado_por: string | null;
          activa: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          incentivo?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          creado_por?: string | null;
          activa?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          incentivo?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          creado_por?: string | null;
          activa?: boolean | null;
          created_at?: string | null;
        };
      };
      sim_outbox: {
        Row: {
          id: string | null;
          run_id: string | null;
          canal: string | null;
          destinatario_original: string | null;
          destinatario_redirigido: string | null;
          asunto: string | null;
          mensaje: string | null;
          estado: string | null;
          error_msg: string | null;
          created_at: string | null;
          procesado_at: string | null;
        };
        Insert: {
          id?: string | null;
          run_id?: string | null;
          canal?: string | null;
          destinatario_original?: string | null;
          destinatario_redirigido?: string | null;
          asunto?: string | null;
          mensaje?: string | null;
          estado?: string | null;
          error_msg?: string | null;
          created_at?: string | null;
          procesado_at?: string | null;
        };
        Update: {
          id?: string | null;
          run_id?: string | null;
          canal?: string | null;
          destinatario_original?: string | null;
          destinatario_redirigido?: string | null;
          asunto?: string | null;
          mensaje?: string | null;
          estado?: string | null;
          error_msg?: string | null;
          created_at?: string | null;
          procesado_at?: string | null;
        };
      };
      curriculo_objetivos: {
        Row: {
          id: string | null;
          pilar_id: string | null;
          descripcion: string | null;
          orden: number | null;
        };
        Insert: {
          id?: string | null;
          pilar_id?: string | null;
          descripcion?: string | null;
          orden?: number | null;
        };
        Update: {
          id?: string | null;
          pilar_id?: string | null;
          descripcion?: string | null;
          orden?: number | null;
        };
      };
      student_indicator_progress: {
        Row: {
          id: string | null;
          student_id: string | null;
          indicator_id: string | null;
          session_id: string | null;
          status: string | null;
          score: number | null;
          observation: string | null;
          evidence_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          student_id?: string | null;
          indicator_id?: string | null;
          session_id?: string | null;
          status?: string | null;
          score?: number | null;
          observation?: string | null;
          evidence_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          student_id?: string | null;
          indicator_id?: string | null;
          session_id?: string | null;
          status?: string | null;
          score?: number | null;
          observation?: string | null;
          evidence_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      finanzas_politica_cobranza: {
        Row: {
          singleton: boolean | null;
          dia_vencimiento: number | null;
          dias_mora_amarilla: number | null;
          dias_mora_critica: number | null;
          bloqueo_requiere_aprobacion: boolean | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          singleton?: boolean | null;
          dia_vencimiento?: number | null;
          dias_mora_amarilla?: number | null;
          dias_mora_critica?: number | null;
          bloqueo_requiere_aprobacion?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          singleton?: boolean | null;
          dia_vencimiento?: number | null;
          dias_mora_amarilla?: number | null;
          dias_mora_critica?: number | null;
          bloqueo_requiere_aprobacion?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      observaciones_sesion: {
        Row: {
          id: string | null;
          sesion_id: string | null;
          maestro_id: string | null;
          contenido_raw: string | null;
          contenido_parsed: any | null;
          es_borrador: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          contenido_ia_dsl: string | null;
          first_note_at: string | null;
          last_note_at: string | null;
          ai_fill_at: string | null;
        };
        Insert: {
          id?: string | null;
          sesion_id?: string | null;
          maestro_id?: string | null;
          contenido_raw?: string | null;
          contenido_parsed?: any | null;
          es_borrador?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          contenido_ia_dsl?: string | null;
          first_note_at?: string | null;
          last_note_at?: string | null;
          ai_fill_at?: string | null;
        };
        Update: {
          id?: string | null;
          sesion_id?: string | null;
          maestro_id?: string | null;
          contenido_raw?: string | null;
          contenido_parsed?: any | null;
          es_borrador?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          contenido_ia_dsl?: string | null;
          first_note_at?: string | null;
          last_note_at?: string | null;
          ai_fill_at?: string | null;
        };
      };
      lut_ordenes_reparacion: {
        Row: {
          id: string | null;
          correlation_id: string | null;
          instrumento_id: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          reportado_por: string | null;
          reportado_por_nombre: string | null;
          recibido_por: string | null;
          recibido_por_nombre: string | null;
          tecnico_responsable: string | null;
          tecnico_responsable_nombre: string | null;
          departamento_origen: string | null;
          estado: string | null;
          prioridad: string | null;
          descripcion_inicial: string | null;
          diagnostico_resumen: string | null;
          tipo_dano: string | null;
          gravedad: string | null;
          requiere_reemplazo: boolean | null;
          requiere_cobro: boolean | null;
          requiere_aprobacion_direccion: boolean | null;
          costo_estimado: number | null;
          costo_final: number | null;
          fecha_recepcion: string | null;
          fecha_diagnostico: string | null;
          fecha_inicio_reparacion: string | null;
          fecha_estimada_entrega: string | null;
          fecha_entrega: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          correlation_id?: string | null;
          instrumento_id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          reportado_por?: string | null;
          reportado_por_nombre?: string | null;
          recibido_por?: string | null;
          recibido_por_nombre?: string | null;
          tecnico_responsable?: string | null;
          tecnico_responsable_nombre?: string | null;
          departamento_origen?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          descripcion_inicial?: string | null;
          diagnostico_resumen?: string | null;
          tipo_dano?: string | null;
          gravedad?: string | null;
          requiere_reemplazo?: boolean | null;
          requiere_cobro?: boolean | null;
          requiere_aprobacion_direccion?: boolean | null;
          costo_estimado?: number | null;
          costo_final?: number | null;
          fecha_recepcion?: string | null;
          fecha_diagnostico?: string | null;
          fecha_inicio_reparacion?: string | null;
          fecha_estimada_entrega?: string | null;
          fecha_entrega?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          correlation_id?: string | null;
          instrumento_id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          reportado_por?: string | null;
          reportado_por_nombre?: string | null;
          recibido_por?: string | null;
          recibido_por_nombre?: string | null;
          tecnico_responsable?: string | null;
          tecnico_responsable_nombre?: string | null;
          departamento_origen?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          descripcion_inicial?: string | null;
          diagnostico_resumen?: string | null;
          tipo_dano?: string | null;
          gravedad?: string | null;
          requiere_reemplazo?: boolean | null;
          requiere_cobro?: boolean | null;
          requiere_aprobacion_direccion?: boolean | null;
          costo_estimado?: number | null;
          costo_final?: number | null;
          fecha_recepcion?: string | null;
          fecha_diagnostico?: string | null;
          fecha_inicio_reparacion?: string | null;
          fecha_estimada_entrega?: string | null;
          fecha_entrega?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      repertoire_fragments: {
        Row: {
          id: string | null;
          repertoire_item_id: string | null;
          title: string | null;
          start_measure: string | null;
          end_measure: string | null;
          order_index: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          repertoire_item_id?: string | null;
          title?: string | null;
          start_measure?: string | null;
          end_measure?: string | null;
          order_index?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          repertoire_item_id?: string | null;
          title?: string | null;
          start_measure?: string | null;
          end_measure?: string | null;
          order_index?: number | null;
          created_at?: string | null;
        };
      };
      soi_rule_effectiveness: {
        Row: {
          rule_type: string | null;
          nombre: string | null;
          total_activaciones: number | null;
          casos_resueltos: number | null;
          tasa_exito: number | null;
          tiempo_promedio_horas: number | null;
          ultima_activacion: string | null;
          updated_at: string | null;
        };
        Insert: {
          rule_type?: string | null;
          nombre?: string | null;
          total_activaciones?: number | null;
          casos_resueltos?: number | null;
          tasa_exito?: number | null;
          tiempo_promedio_horas?: number | null;
          ultima_activacion?: string | null;
          updated_at?: string | null;
        };
        Update: {
          rule_type?: string | null;
          nombre?: string | null;
          total_activaciones?: number | null;
          casos_resueltos?: number | null;
          tasa_exito?: number | null;
          tiempo_promedio_horas?: number | null;
          ultima_activacion?: string | null;
          updated_at?: string | null;
        };
      };
      push_subscriptions: {
        Row: {
          id: string | null;
          profile_id: string | null;
          endpoint: string | null;
          p256dh: string | null;
          auth: string | null;
          user_agent: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          profile_id?: string | null;
          endpoint?: string | null;
          p256dh?: string | null;
          auth?: string | null;
          user_agent?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          profile_id?: string | null;
          endpoint?: string | null;
          p256dh?: string | null;
          auth?: string | null;
          user_agent?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      document_templates: {
        Row: {
          id: string | null;
          nombre: string | null;
          tipo: string | null;
          descripcion: string | null;
          contenido: string | null;
          variables: string[] | null;
          estado: string | null;
          version: number | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          descripcion?: string | null;
          contenido?: string | null;
          variables?: string[] | null;
          estado?: string | null;
          version?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          descripcion?: string | null;
          contenido?: string | null;
          variables?: string[] | null;
          estado?: string | null;
          version?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      minutas: {
        Row: {
          id: string | null;
          titulo: string | null;
          fecha_reunion: string | null;
          participantes: any | null;
          puntos_tratados: any | null;
          acuerdos: any | null;
          responsables: any | null;
          fecha_proxima_reunion: string | null;
          visibilidad: string | null;
          creado_por: string | null;
          archivo_adjunto_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          titulo?: string | null;
          fecha_reunion?: string | null;
          participantes?: any | null;
          puntos_tratados?: any | null;
          acuerdos?: any | null;
          responsables?: any | null;
          fecha_proxima_reunion?: string | null;
          visibilidad?: string | null;
          creado_por?: string | null;
          archivo_adjunto_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          titulo?: string | null;
          fecha_reunion?: string | null;
          participantes?: any | null;
          puntos_tratados?: any | null;
          acuerdos?: any | null;
          responsables?: any | null;
          fecha_proxima_reunion?: string | null;
          visibilidad?: string | null;
          creado_por?: string | null;
          archivo_adjunto_url?: string | null;
          created_at?: string | null;
        };
      };
      maestro_routes: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          clase_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sesiones_clase: {
        Row: {
          id: string | null;
          clase_id: string | null;
          horario_id: string | null;
          maestro_id: string | null;
          salon_id: string | null;
          fecha: string | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          tema_principal: string | null;
          contenidos_trabajados: any | null;
          observaciones_generales: string | null;
          estado: string | null;
          cerrada_en: string | null;
          created_at: string | null;
          updated_at: string | null;
          borrador: boolean | null;
          contenido: string | null;
          contenido_dsl: string | null;
          asistencia: any | null;
          es_codocencia: boolean | null;
          actividad: string | null;
          maestro_auxiliar_id: string | null;
          motivo: string | null;
          emergente_id: string | null;
          node_id: string | null;
          node_origen: string | null;
          node_codigo: string | null;
        };
        Insert: {
          id?: string | null;
          clase_id?: string | null;
          horario_id?: string | null;
          maestro_id?: string | null;
          salon_id?: string | null;
          fecha?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          tema_principal?: string | null;
          contenidos_trabajados?: any | null;
          observaciones_generales?: string | null;
          estado?: string | null;
          cerrada_en?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          borrador?: boolean | null;
          contenido?: string | null;
          contenido_dsl?: string | null;
          asistencia?: any | null;
          es_codocencia?: boolean | null;
          actividad?: string | null;
          maestro_auxiliar_id?: string | null;
          motivo?: string | null;
          emergente_id?: string | null;
          node_id?: string | null;
          node_origen?: string | null;
          node_codigo?: string | null;
        };
        Update: {
          id?: string | null;
          clase_id?: string | null;
          horario_id?: string | null;
          maestro_id?: string | null;
          salon_id?: string | null;
          fecha?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          tema_principal?: string | null;
          contenidos_trabajados?: any | null;
          observaciones_generales?: string | null;
          estado?: string | null;
          cerrada_en?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          borrador?: boolean | null;
          contenido?: string | null;
          contenido_dsl?: string | null;
          asistencia?: any | null;
          es_codocencia?: boolean | null;
          actividad?: string | null;
          maestro_auxiliar_id?: string | null;
          motivo?: string | null;
          emergente_id?: string | null;
          node_id?: string | null;
          node_origen?: string | null;
          node_codigo?: string | null;
        };
      };
      catalogo_objetivos_especificos: {
        Row: {
          id: string | null;
          objetivo_general_id: string | null;
          nombre: string | null;
          orden: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          objetivo_general_id?: string | null;
          nombre?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          objetivo_general_id?: string | null;
          nombre?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      notificaciones_asistencia: {
        Row: {
          id: string | null;
          tipo: string | null;
          canal: string | null;
          prioridad: string | null;
          destinatario_telefono: string | null;
          destinatario_nombre: string | null;
          destinatario_email: string | null;
          titulo: string | null;
          cuerpo: string | null;
          estado: string | null;
          fecha_creacion: string | null;
          fecha_programada: string | null;
          fecha_envio: string | null;
          fecha_respuesta: string | null;
          respuesta: string | null;
          respuesta_hora: string | null;
          datos_extra: any | null;
          intentos_envio: number | null;
          error_ultimo: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          tipo?: string | null;
          canal?: string | null;
          prioridad?: string | null;
          destinatario_telefono?: string | null;
          destinatario_nombre?: string | null;
          destinatario_email?: string | null;
          titulo?: string | null;
          cuerpo?: string | null;
          estado?: string | null;
          fecha_creacion?: string | null;
          fecha_programada?: string | null;
          fecha_envio?: string | null;
          fecha_respuesta?: string | null;
          respuesta?: string | null;
          respuesta_hora?: string | null;
          datos_extra?: any | null;
          intentos_envio?: number | null;
          error_ultimo?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          tipo?: string | null;
          canal?: string | null;
          prioridad?: string | null;
          destinatario_telefono?: string | null;
          destinatario_nombre?: string | null;
          destinatario_email?: string | null;
          titulo?: string | null;
          cuerpo?: string | null;
          estado?: string | null;
          fecha_creacion?: string | null;
          fecha_programada?: string | null;
          fecha_envio?: string | null;
          fecha_respuesta?: string | null;
          respuesta?: string | null;
          respuesta_hora?: string | null;
          datos_extra?: any | null;
          intentos_envio?: number | null;
          error_ultimo?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      audiciones: {
        Row: {
          id_auditoria: number | null;
          fecha_auditoria: string | null;
          alumno_id: string | null;
          nombre_alumno: string | null;
          instrumento: string | null;
          evaluador: string | null;
          calif_postura: number | null;
          nota_postura: string | null;
          calif_afinacion: number | null;
          nota_afinacion: string | null;
          calif_ritmo: number | null;
          nota_ritmo: string | null;
          calif_musicalidad: number | null;
          nota_musicalidad: string | null;
          promedio_ponderado: number | null;
          resultado: string | null;
          nivel_asignado: string | null;
          profesor_asignado: string | null;
          proxima_auditoria: string | null;
          validado_por_omar: boolean | null;
          fecha_validacion: string | null;
          created_at: string | null;
        };
        Insert: {
          id_auditoria?: number | null;
          fecha_auditoria?: string | null;
          alumno_id?: string | null;
          nombre_alumno?: string | null;
          instrumento?: string | null;
          evaluador?: string | null;
          calif_postura?: number | null;
          nota_postura?: string | null;
          calif_afinacion?: number | null;
          nota_afinacion?: string | null;
          calif_ritmo?: number | null;
          nota_ritmo?: string | null;
          calif_musicalidad?: number | null;
          nota_musicalidad?: string | null;
          promedio_ponderado?: number | null;
          resultado?: string | null;
          nivel_asignado?: string | null;
          profesor_asignado?: string | null;
          proxima_auditoria?: string | null;
          validado_por_omar?: boolean | null;
          fecha_validacion?: string | null;
          created_at?: string | null;
        };
        Update: {
          id_auditoria?: number | null;
          fecha_auditoria?: string | null;
          alumno_id?: string | null;
          nombre_alumno?: string | null;
          instrumento?: string | null;
          evaluador?: string | null;
          calif_postura?: number | null;
          nota_postura?: string | null;
          calif_afinacion?: number | null;
          nota_afinacion?: string | null;
          calif_ritmo?: number | null;
          nota_ritmo?: string | null;
          calif_musicalidad?: number | null;
          nota_musicalidad?: string | null;
          promedio_ponderado?: number | null;
          resultado?: string | null;
          nivel_asignado?: string | null;
          profesor_asignado?: string | null;
          proxima_auditoria?: string | null;
          validado_por_omar?: boolean | null;
          fecha_validacion?: string | null;
          created_at?: string | null;
        };
      };
      lut_evidencias: {
        Row: {
          id: string | null;
          orden_id: string | null;
          tipo: string | null;
          nombre: string | null;
          storage_path: string | null;
          descripcion: string | null;
          visibilidad: string | null;
          subido_por: string | null;
          subido_por_nombre: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          orden_id?: string | null;
          tipo?: string | null;
          nombre?: string | null;
          storage_path?: string | null;
          descripcion?: string | null;
          visibilidad?: string | null;
          subido_por?: string | null;
          subido_por_nombre?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          orden_id?: string | null;
          tipo?: string | null;
          nombre?: string | null;
          storage_path?: string | null;
          descripcion?: string | null;
          visibilidad?: string | null;
          subido_por?: string | null;
          subido_por_nombre?: string | null;
          created_at?: string | null;
        };
      };
      sim_log: {
        Row: {
          id: string | null;
          run_id: string | null;
          fecha_simulada: string | null;
          departamento: string | null;
          agente: string | null;
          accion: string | null;
          evento_id: string | null;
          payload: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          run_id?: string | null;
          fecha_simulada?: string | null;
          departamento?: string | null;
          agente?: string | null;
          accion?: string | null;
          evento_id?: string | null;
          payload?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          run_id?: string | null;
          fecha_simulada?: string | null;
          departamento?: string | null;
          agente?: string | null;
          accion?: string | null;
          evento_id?: string | null;
          payload?: any | null;
          created_at?: string | null;
        };
      };
      inventario_historial: {
        Row: {
          id: string | null;
          activo_id: string | null;
          tipo_evento: string | null;
          descripcion: string | null;
          fecha: string | null;
          usuario_id: string | null;
          metadata: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          activo_id?: string | null;
          tipo_evento?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          usuario_id?: string | null;
          metadata?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          activo_id?: string | null;
          tipo_evento?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          usuario_id?: string | null;
          metadata?: any | null;
          created_at?: string | null;
        };
      };
      ausencias_maestros: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          tipo_ausencia: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          motivo: string | null;
          estado: string | null;
          urgencia: string | null;
          created_at: string | null;
          updated_at: string | null;
          duracion_tipo: string | null;
          archivo_url: string | null;
          maestro_suplente_id: string | null;
          notificar_director: boolean | null;
          director_notificacion_id: string | null;
          aprobado_por: string | null;
          decision_notas: string | null;
          decidido_en: string | null;
          revisado_por: string | null;
          revision_notas: string | null;
          revision_en: string | null;
          aprobado_en: string | null;
          rechazado_por: string | null;
          rechazado_en: string | null;
          razon_rechazo: string | null;
          intentos_solicitud: number | null;
          fecha_solicitud_original: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          tipo_ausencia?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          motivo?: string | null;
          estado?: string | null;
          urgencia?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          duracion_tipo?: string | null;
          archivo_url?: string | null;
          maestro_suplente_id?: string | null;
          notificar_director?: boolean | null;
          director_notificacion_id?: string | null;
          aprobado_por?: string | null;
          decision_notas?: string | null;
          decidido_en?: string | null;
          revisado_por?: string | null;
          revision_notas?: string | null;
          revision_en?: string | null;
          aprobado_en?: string | null;
          rechazado_por?: string | null;
          rechazado_en?: string | null;
          razon_rechazo?: string | null;
          intentos_solicitud?: number | null;
          fecha_solicitud_original?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          tipo_ausencia?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          motivo?: string | null;
          estado?: string | null;
          urgencia?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          duracion_tipo?: string | null;
          archivo_url?: string | null;
          maestro_suplente_id?: string | null;
          notificar_director?: boolean | null;
          director_notificacion_id?: string | null;
          aprobado_por?: string | null;
          decision_notas?: string | null;
          decidido_en?: string | null;
          revisado_por?: string | null;
          revision_notas?: string | null;
          revision_en?: string | null;
          aprobado_en?: string | null;
          rechazado_por?: string | null;
          rechazado_en?: string | null;
          razon_rechazo?: string | null;
          intentos_solicitud?: number | null;
          fecha_solicitud_original?: string | null;
        };
      };
      asistencias_emergentes: {
        Row: {
          id: string | null;
          clase_emergente_id: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          estado: string | null;
          justificacion: string | null;
          observacion: string | null;
          fecha: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          clase_emergente_id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          estado?: string | null;
          justificacion?: string | null;
          observacion?: string | null;
          fecha?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          clase_emergente_id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          estado?: string | null;
          justificacion?: string | null;
          observacion?: string | null;
          fecha?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_kpi_inventario: {
        Row: {
          total_activos: number | null;
          disponibles: number | null;
          en_uso: number | null;
          en_mantenimiento: number | null;
          en_reparacion: number | null;
          de_baja: number | null;
          valor_total_inventario: number | null;
        };
        Insert: {
          total_activos?: number | null;
          disponibles?: number | null;
          en_uso?: number | null;
          en_mantenimiento?: number | null;
          en_reparacion?: number | null;
          de_baja?: number | null;
          valor_total_inventario?: number | null;
        };
        Update: {
          total_activos?: number | null;
          disponibles?: number | null;
          en_uso?: number | null;
          en_mantenimiento?: number | null;
          en_reparacion?: number | null;
          de_baja?: number | null;
          valor_total_inventario?: number | null;
        };
      };
      programas: {
        Row: {
          id: string | null;
          nombre: string | null;
          descripcion: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          nivel: string | null;
          codigo: string | null;
          duracion_anios: number | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          nivel?: string | null;
          codigo?: string | null;
          duracion_anios?: number | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          nivel?: string | null;
          codigo?: string | null;
          duracion_anios?: number | null;
        };
      };
      contenidos_sesion: {
        Row: {
          id: string | null;
          sesion_clase_id: string | null;
          planificacion_id: string | null;
          modulo_id: string | null;
          unidad_id: string | null;
          ejercicio_id: string | null;
          descripcion: string | null;
          nivel_logro: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          sesion_clase_id?: string | null;
          planificacion_id?: string | null;
          modulo_id?: string | null;
          unidad_id?: string | null;
          ejercicio_id?: string | null;
          descripcion?: string | null;
          nivel_logro?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          sesion_clase_id?: string | null;
          planificacion_id?: string | null;
          modulo_id?: string | null;
          unidad_id?: string | null;
          ejercicio_id?: string | null;
          descripcion?: string | null;
          nivel_logro?: string | null;
          created_at?: string | null;
        };
      };
      intentos_ejercicios: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          ejercicio_id: string | null;
          maestro_id: string | null;
          clase_id: string | null;
          sesion_clase_id: string | null;
          fecha: string | null;
          puntaje: number | null;
          aprobado: boolean | null;
          rubrica: any | null;
          observaciones: string | null;
          evidencia_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          ejercicio_id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          sesion_clase_id?: string | null;
          fecha?: string | null;
          puntaje?: number | null;
          aprobado?: boolean | null;
          rubrica?: any | null;
          observaciones?: string | null;
          evidencia_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          ejercicio_id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          sesion_clase_id?: string | null;
          fecha?: string | null;
          puntaje?: number | null;
          aprobado?: boolean | null;
          rubrica?: any | null;
          observaciones?: string | null;
          evidencia_url?: string | null;
          created_at?: string | null;
        };
      };
      class_session_content_snapshots: {
        Row: {
          id: string | null;
          session_id: string | null;
          node_id: string | null;
          indicator_id: string | null;
          node_name: string | null;
          indicator_description: string | null;
          is_critical: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          session_id?: string | null;
          node_id?: string | null;
          indicator_id?: string | null;
          node_name?: string | null;
          indicator_description?: string | null;
          is_critical?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          session_id?: string | null;
          node_id?: string | null;
          indicator_id?: string | null;
          node_name?: string | null;
          indicator_description?: string | null;
          is_critical?: boolean | null;
          created_at?: string | null;
        };
      };
      class_event_methodology: {
        Row: {
          id: string | null;
          class_event_id: string | null;
          warmup: string | null;
          sound_focus: string | null;
          intonation_focus: string | null;
          main_node_id: string | null;
          technical_focus: string | null;
          study_used: string | null;
          repertoire_used: string | null;
          sight_reading_work: string | null;
          ear_training_work: string | null;
          closing_observation: string | null;
          homework_text: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          class_event_id?: string | null;
          warmup?: string | null;
          sound_focus?: string | null;
          intonation_focus?: string | null;
          main_node_id?: string | null;
          technical_focus?: string | null;
          study_used?: string | null;
          repertoire_used?: string | null;
          sight_reading_work?: string | null;
          ear_training_work?: string | null;
          closing_observation?: string | null;
          homework_text?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          class_event_id?: string | null;
          warmup?: string | null;
          sound_focus?: string | null;
          intonation_focus?: string | null;
          main_node_id?: string | null;
          technical_focus?: string | null;
          study_used?: string | null;
          repertoire_used?: string | null;
          sight_reading_work?: string | null;
          ear_training_work?: string | null;
          closing_observation?: string | null;
          homework_text?: string | null;
          created_at?: string | null;
        };
      };
      catalogos: {
        Row: {
          id: string | null;
          tipo: string | null;
          nombre: string | null;
          descripcion: string | null;
          codigo: string | null;
          categoria: string | null;
          orden: number | null;
          activo: boolean | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          tipo?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          codigo?: string | null;
          categoria?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          tipo?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          codigo?: string | null;
          categoria?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      indicador_prerequisito: {
        Row: {
          id: string | null;
          indicador_id: string | null;
          prerequisito_indicador_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          indicador_id?: string | null;
          prerequisito_indicador_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          indicador_id?: string | null;
          prerequisito_indicador_id?: string | null;
          created_at?: string | null;
        };
      };
      routes: {
        Row: {
          id: string | null;
          name: string | null;
          instrument: string | null;
          description: string | null;
          status: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          name?: string | null;
          instrument?: string | null;
          description?: string | null;
          status?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          instrument?: string | null;
          description?: string | null;
          status?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      telegram_messages_raw: {
        Row: {
          id: string | null;
          telegram_message_id: number | null;
          telegram_chat_id: number | null;
          telegram_user_id: number | null;
          message_type: string | null;
          raw_payload: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          telegram_message_id?: number | null;
          telegram_chat_id?: number | null;
          telegram_user_id?: number | null;
          message_type?: string | null;
          raw_payload?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          telegram_message_id?: number | null;
          telegram_chat_id?: number | null;
          telegram_user_id?: number | null;
          message_type?: string | null;
          raw_payload?: any | null;
          created_at?: string | null;
        };
      };
      vw_riesgo_abandono: {
        Row: {
          alumno_id: string | null;
          nombre_completo: string | null;
          instrumento_principal: string | null;
          nivel: string | null;
          tasa_asistencia: number | null;
          ausencias_28d: number | null;
          ausencias_14d: number | null;
          promedio_calificacion: number | null;
          delta_calificacion: number | null;
          alertas_alta: number | null;
          obs_abiertas: number | null;
          score_riesgo: number | null;
          nivel_riesgo: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          nombre_completo?: string | null;
          instrumento_principal?: string | null;
          nivel?: string | null;
          tasa_asistencia?: number | null;
          ausencias_28d?: number | null;
          ausencias_14d?: number | null;
          promedio_calificacion?: number | null;
          delta_calificacion?: number | null;
          alertas_alta?: number | null;
          obs_abiertas?: number | null;
          score_riesgo?: number | null;
          nivel_riesgo?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          nombre_completo?: string | null;
          instrumento_principal?: string | null;
          nivel?: string | null;
          tasa_asistencia?: number | null;
          ausencias_28d?: number | null;
          ausencias_14d?: number | null;
          promedio_calificacion?: number | null;
          delta_calificacion?: number | null;
          alertas_alta?: number | null;
          obs_abiertas?: number | null;
          score_riesgo?: number | null;
          nivel_riesgo?: string | null;
        };
      };
      solicitudes_necesidades: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          maestro_nombre: string | null;
          tipo_necesidad: string | null;
          categoria: string | null;
          titulo: string | null;
          descripcion: string | null;
          prioridad: string | null;
          cantidad: number | null;
          area: string | null;
          observaciones: string | null;
          estado: string | null;
          respuesta_admin: string | null;
          fecha_solicitud: string | null;
          created_at: string | null;
          updated_at: string | null;
          correlation_id: string | null;
          link_tienda: string | null;
          costo_estimado: number | null;
          presupuesto: number | null;
          departamento_actual: string | null;
          pre_aprobada_por: string | null;
          presupuestado_por: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          maestro_nombre?: string | null;
          tipo_necesidad?: string | null;
          categoria?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          prioridad?: string | null;
          cantidad?: number | null;
          area?: string | null;
          observaciones?: string | null;
          estado?: string | null;
          respuesta_admin?: string | null;
          fecha_solicitud?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          correlation_id?: string | null;
          link_tienda?: string | null;
          costo_estimado?: number | null;
          presupuesto?: number | null;
          departamento_actual?: string | null;
          pre_aprobada_por?: string | null;
          presupuestado_por?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          maestro_nombre?: string | null;
          tipo_necesidad?: string | null;
          categoria?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          prioridad?: string | null;
          cantidad?: number | null;
          area?: string | null;
          observaciones?: string | null;
          estado?: string | null;
          respuesta_admin?: string | null;
          fecha_solicitud?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          correlation_id?: string | null;
          link_tienda?: string | null;
          costo_estimado?: number | null;
          presupuesto?: number | null;
          departamento_actual?: string | null;
          pre_aprobada_por?: string | null;
          presupuestado_por?: string | null;
        };
      };
      asistencias: {
        Row: {
          id: string | null;
          sesion_clase_id: string | null;
          clase_id: string | null;
          alumno_id: string | null;
          fecha: string | null;
          estado: string | null;
          justificacion_texto: string | null;
          observaciones: string | null;
          registrado_por: string | null;
          created_at: string | null;
          updated_at: string | null;
          periodo_id: string | null;
          marked_at: string | null;
        };
        Insert: {
          id?: string | null;
          sesion_clase_id?: string | null;
          clase_id?: string | null;
          alumno_id?: string | null;
          fecha?: string | null;
          estado?: string | null;
          justificacion_texto?: string | null;
          observaciones?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          periodo_id?: string | null;
          marked_at?: string | null;
        };
        Update: {
          id?: string | null;
          sesion_clase_id?: string | null;
          clase_id?: string | null;
          alumno_id?: string | null;
          fecha?: string | null;
          estado?: string | null;
          justificacion_texto?: string | null;
          observaciones?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          periodo_id?: string | null;
          marked_at?: string | null;
        };
      };
      ruta_contenido_objetivos: {
        Row: {
          id: string | null;
          ruta_id: string | null;
          objetivo_id: string | null;
          descripcion: string | null;
          semana_inicio: number | null;
          semana_fin: number | null;
          orden: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          ruta_id?: string | null;
          objetivo_id?: string | null;
          descripcion?: string | null;
          semana_inicio?: number | null;
          semana_fin?: number | null;
          orden?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          ruta_id?: string | null;
          objetivo_id?: string | null;
          descripcion?: string | null;
          semana_inicio?: number | null;
          semana_fin?: number | null;
          orden?: number | null;
          created_at?: string | null;
        };
      };
      acm_teacher_week_adjustments: {
        Row: {
          id: string | null;
          group_id: string | null;
          teacher_id: string | null;
          weekly_plan_id: string | null;
          week_number: number | null;
          teacher_strategy: string | null;
          student_activity: string | null;
          homework: string | null;
          evidence: string | null;
          teacher_notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          group_id?: string | null;
          teacher_id?: string | null;
          weekly_plan_id?: string | null;
          week_number?: number | null;
          teacher_strategy?: string | null;
          student_activity?: string | null;
          homework?: string | null;
          evidence?: string | null;
          teacher_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          group_id?: string | null;
          teacher_id?: string | null;
          weekly_plan_id?: string | null;
          week_number?: number | null;
          teacher_strategy?: string | null;
          student_activity?: string | null;
          homework?: string | null;
          evidence?: string | null;
          teacher_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sim_tareas: {
        Row: {
          id: string | null;
          run_id: string | null;
          event_id: string | null;
          titulo: string | null;
          descripcion: string | null;
          departamento: string | null;
          asignado_a: string | null;
          estado: string | null;
          prioridad: string | null;
          fecha_vencimiento: string | null;
          checklist: any | null;
          feedback: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          run_id?: string | null;
          event_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          departamento?: string | null;
          asignado_a?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          fecha_vencimiento?: string | null;
          checklist?: any | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          run_id?: string | null;
          event_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          departamento?: string | null;
          asignado_a?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          fecha_vencimiento?: string | null;
          checklist?: any | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      plan_niveles: {
        Row: {
          id: string | null;
          clase_id: string | null;
          nombre: string | null;
          numero_nivel: number | null;
          objetivo_general: string | null;
          orden_index: number | null;
        };
        Insert: {
          id?: string | null;
          clase_id?: string | null;
          nombre?: string | null;
          numero_nivel?: number | null;
          objetivo_general?: string | null;
          orden_index?: number | null;
        };
        Update: {
          id?: string | null;
          clase_id?: string | null;
          nombre?: string | null;
          numero_nivel?: number | null;
          objetivo_general?: string | null;
          orden_index?: number | null;
        };
      };
      horarios: {
        Row: {
          id: string | null;
          clase_id: string | null;
          maestro_id: string | null;
          salon_id: string | null;
          dia_semana: number | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          salon_id?: string | null;
          dia_semana?: number | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          salon_id?: string | null;
          dia_semana?: number | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      homework_assignments: {
        Row: {
          id: string | null;
          class_event_id: string | null;
          student_id: string | null;
          teacher_id: string | null;
          node_id: string | null;
          description: string | null;
          due_date: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          class_event_id?: string | null;
          student_id?: string | null;
          teacher_id?: string | null;
          node_id?: string | null;
          description?: string | null;
          due_date?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          class_event_id?: string | null;
          student_id?: string | null;
          teacher_id?: string | null;
          node_id?: string | null;
          description?: string | null;
          due_date?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
      };
      campana_participaciones: {
        Row: {
          id: string | null;
          campana_id: string | null;
          familia_id: string | null;
          aceptada: boolean | null;
          fecha_aceptacion: string | null;
          monto_recuperado_centavos: number | null;
        };
        Insert: {
          id?: string | null;
          campana_id?: string | null;
          familia_id?: string | null;
          aceptada?: boolean | null;
          fecha_aceptacion?: string | null;
          monto_recuperado_centavos?: number | null;
        };
        Update: {
          id?: string | null;
          campana_id?: string | null;
          familia_id?: string | null;
          aceptada?: boolean | null;
          fecha_aceptacion?: string | null;
          monto_recuperado_centavos?: number | null;
        };
      };
      planificacion: {
        Row: {
          id: string | null;
          programa_id: string | null;
          nivel: number | null;
          titulo: string | null;
          contenidos: any | null;
          tecnicas: any | null;
          obras: any | null;
          escalas_arpegios: any | null;
          evaluaciones: any | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          programa_id?: string | null;
          nivel?: number | null;
          titulo?: string | null;
          contenidos?: any | null;
          tecnicas?: any | null;
          obras?: any | null;
          escalas_arpegios?: any | null;
          evaluaciones?: any | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          programa_id?: string | null;
          nivel?: number | null;
          titulo?: string | null;
          contenidos?: any | null;
          tecnicas?: any | null;
          obras?: any | null;
          escalas_arpegios?: any | null;
          evaluaciones?: any | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_ia_asistencias_resumen: {
        Row: {
          alumno_id: string | null;
          total: number | null;
          presentes: number | null;
        };
        Insert: {
          alumno_id?: string | null;
          total?: number | null;
          presentes?: number | null;
        };
        Update: {
          alumno_id?: string | null;
          total?: number | null;
          presentes?: number | null;
        };
      };
      notificaciones_caja: {
        Row: {
          id: string | null;
          familia_id: string | null;
          representante_id: string | null;
          alumno_id: string | null;
          tipo: string | null;
          canal: string | null;
          prioridad: string | null;
          titulo: string | null;
          cuerpo: string | null;
          datos_extra: any | null;
          estado_whatsapp: string | null;
          estado_portal: string | null;
          respuesta_padre: string | null;
          fecha_respuesta: string | null;
          fecha_programada: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          representante_id?: string | null;
          alumno_id?: string | null;
          tipo?: string | null;
          canal?: string | null;
          prioridad?: string | null;
          titulo?: string | null;
          cuerpo?: string | null;
          datos_extra?: any | null;
          estado_whatsapp?: string | null;
          estado_portal?: string | null;
          respuesta_padre?: string | null;
          fecha_respuesta?: string | null;
          fecha_programada?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          representante_id?: string | null;
          alumno_id?: string | null;
          tipo?: string | null;
          canal?: string | null;
          prioridad?: string | null;
          titulo?: string | null;
          cuerpo?: string | null;
          datos_extra?: any | null;
          estado_whatsapp?: string | null;
          estado_portal?: string | null;
          respuesta_padre?: string | null;
          fecha_respuesta?: string | null;
          fecha_programada?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      student_case_events: {
        Row: {
          id: string | null;
          case_id: string | null;
          tipo: string | null;
          titulo: string | null;
          descripcion: string | null;
          metadata: any | null;
          actor_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          case_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          metadata?: any | null;
          actor_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          case_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          metadata?: any | null;
          actor_id?: string | null;
          created_at?: string | null;
        };
      };
      lut_diagnosticos: {
        Row: {
          id: string | null;
          orden_id: string | null;
          diagnostico_tecnico: string | null;
          causa_probable: string | null;
          tipo_dano: string | null;
          gravedad: string | null;
          zona_afectada: string | null;
          reparacion_recomendada: string | null;
          materiales_requeridos: string | null;
          tiempo_estimado_horas: number | null;
          costo_mano_obra: number | null;
          costo_materiales: number | null;
          requiere_servicio_externo: boolean | null;
          observaciones: string | null;
          diagnosticado_por: string | null;
          diagnosticado_por_nombre: string | null;
          created_at: string | null;
          items: any | null;
        };
        Insert: {
          id?: string | null;
          orden_id?: string | null;
          diagnostico_tecnico?: string | null;
          causa_probable?: string | null;
          tipo_dano?: string | null;
          gravedad?: string | null;
          zona_afectada?: string | null;
          reparacion_recomendada?: string | null;
          materiales_requeridos?: string | null;
          tiempo_estimado_horas?: number | null;
          costo_mano_obra?: number | null;
          costo_materiales?: number | null;
          requiere_servicio_externo?: boolean | null;
          observaciones?: string | null;
          diagnosticado_por?: string | null;
          diagnosticado_por_nombre?: string | null;
          created_at?: string | null;
          items?: any | null;
        };
        Update: {
          id?: string | null;
          orden_id?: string | null;
          diagnostico_tecnico?: string | null;
          causa_probable?: string | null;
          tipo_dano?: string | null;
          gravedad?: string | null;
          zona_afectada?: string | null;
          reparacion_recomendada?: string | null;
          materiales_requeridos?: string | null;
          tiempo_estimado_horas?: number | null;
          costo_mano_obra?: number | null;
          costo_materiales?: number | null;
          requiere_servicio_externo?: boolean | null;
          observaciones?: string | null;
          diagnosticado_por?: string | null;
          diagnosticado_por_nombre?: string | null;
          created_at?: string | null;
          items?: any | null;
        };
      };
      soi_eventos: {
        Row: {
          id: string | null;
          tipo: string | null;
          entidad_tipo: string | null;
          entidad_id: string | null;
          actor_id: string | null;
          payload: any | null;
          correlation_id: string | null;
          procesado: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          tipo?: string | null;
          entidad_tipo?: string | null;
          entidad_id?: string | null;
          actor_id?: string | null;
          payload?: any | null;
          correlation_id?: string | null;
          procesado?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          tipo?: string | null;
          entidad_tipo?: string | null;
          entidad_id?: string | null;
          actor_id?: string | null;
          payload?: any | null;
          correlation_id?: string | null;
          procesado?: boolean | null;
          created_at?: string | null;
        };
      };
      planning_documents: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          clase_id: string | null;
          title: string | null;
          file_name: string | null;
          file_url: string | null;
          file_type: string | null;
          file_size: number | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          title?: string | null;
          file_name?: string | null;
          file_url?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          title?: string | null;
          file_name?: string | null;
          file_url?: string | null;
          file_type?: string | null;
          file_size?: number | null;
          description?: string | null;
          created_at?: string | null;
        };
      };
      inventario_import_staging: {
        Row: {
          codigo_importacion: string | null;
          codigo_interno_original: string | null;
          familia: string | null;
          tipo_item: string | null;
          nombre_item: string | null;
          nombre_normalizado: string | null;
          tamano: string | null;
          marca: string | null;
          modelo: string | null;
          serial: string | null;
          cantidad: string | null;
          unidad: string | null;
          ubicacion_actual: string | null;
          estado_asignacion: string | null;
          asignado_a: string | null;
          estado_fisico: string | null;
          requiere_mantenimiento: string | null;
          tiene_arco: string | null;
          tiene_estuche: string | null;
          tiene_funda: string | null;
          tiene_hombrera_almohadilla: string | null;
          faltantes_detectados: string | null;
          donante_inferido: string | null;
          codigo_donante: string | null;
          observaciones: string | null;
          tags: string | null;
          activo: string | null;
          fuente_seccion: string | null;
          numero_original: string | null;
          fila_origen_csv: string | null;
          revisar: string | null;
          alertas_calidad: string | null;
          imported_at: string | null;
        };
        Insert: {
          codigo_importacion?: string | null;
          codigo_interno_original?: string | null;
          familia?: string | null;
          tipo_item?: string | null;
          nombre_item?: string | null;
          nombre_normalizado?: string | null;
          tamano?: string | null;
          marca?: string | null;
          modelo?: string | null;
          serial?: string | null;
          cantidad?: string | null;
          unidad?: string | null;
          ubicacion_actual?: string | null;
          estado_asignacion?: string | null;
          asignado_a?: string | null;
          estado_fisico?: string | null;
          requiere_mantenimiento?: string | null;
          tiene_arco?: string | null;
          tiene_estuche?: string | null;
          tiene_funda?: string | null;
          tiene_hombrera_almohadilla?: string | null;
          faltantes_detectados?: string | null;
          donante_inferido?: string | null;
          codigo_donante?: string | null;
          observaciones?: string | null;
          tags?: string | null;
          activo?: string | null;
          fuente_seccion?: string | null;
          numero_original?: string | null;
          fila_origen_csv?: string | null;
          revisar?: string | null;
          alertas_calidad?: string | null;
          imported_at?: string | null;
        };
        Update: {
          codigo_importacion?: string | null;
          codigo_interno_original?: string | null;
          familia?: string | null;
          tipo_item?: string | null;
          nombre_item?: string | null;
          nombre_normalizado?: string | null;
          tamano?: string | null;
          marca?: string | null;
          modelo?: string | null;
          serial?: string | null;
          cantidad?: string | null;
          unidad?: string | null;
          ubicacion_actual?: string | null;
          estado_asignacion?: string | null;
          asignado_a?: string | null;
          estado_fisico?: string | null;
          requiere_mantenimiento?: string | null;
          tiene_arco?: string | null;
          tiene_estuche?: string | null;
          tiene_funda?: string | null;
          tiene_hombrera_almohadilla?: string | null;
          faltantes_detectados?: string | null;
          donante_inferido?: string | null;
          codigo_donante?: string | null;
          observaciones?: string | null;
          tags?: string | null;
          activo?: string | null;
          fuente_seccion?: string | null;
          numero_original?: string | null;
          fila_origen_csv?: string | null;
          revisar?: string | null;
          alertas_calidad?: string | null;
          imported_at?: string | null;
        };
      };
      view_node_difficulty: {
        Row: {
          node_name: string | null;
          total_attempts: number | null;
          failure_percentage: number | null;
        };
        Insert: {
          node_name?: string | null;
          total_attempts?: number | null;
          failure_percentage?: number | null;
        };
        Update: {
          node_name?: string | null;
          total_attempts?: number | null;
          failure_percentage?: number | null;
        };
      };
      cuotas: {
        Row: {
          id: string | null;
          familia_id: string | null;
          alumno_id: string | null;
          concepto: string | null;
          monto_base_centavos: number | null;
          monto_final_centavos: number | null;
          descuento_centavos: number | null;
          fecha_generacion: string | null;
          fecha_vencimiento: string | null;
          estado: string | null;
          ciclo_mes: number | null;
          ciclo_anio: number | null;
          metadatos: any | null;
          created_at: string | null;
          updated_at: string | null;
          monto_pagado_centavos: number | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          alumno_id?: string | null;
          concepto?: string | null;
          monto_base_centavos?: number | null;
          monto_final_centavos?: number | null;
          descuento_centavos?: number | null;
          fecha_generacion?: string | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          ciclo_mes?: number | null;
          ciclo_anio?: number | null;
          metadatos?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
          monto_pagado_centavos?: number | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          alumno_id?: string | null;
          concepto?: string | null;
          monto_base_centavos?: number | null;
          monto_final_centavos?: number | null;
          descuento_centavos?: number | null;
          fecha_generacion?: string | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          ciclo_mes?: number | null;
          ciclo_anio?: number | null;
          metadatos?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
          monto_pagado_centavos?: number | null;
        };
      };
      planificaciones: {
        Row: {
          id: string | null;
          programa_id: string | null;
          nivel_id: string | null;
          clase_id: string | null;
          maestro_id: string | null;
          titulo: string | null;
          descripcion: string | null;
          periodo_nombre: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          contenidos: any | null;
          tecnicas: any | null;
          obras: any | null;
          escalas_arpegios: any | null;
          evaluaciones: any | null;
          estado: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          instrumento: string | null;
          objetivos_estructurados: any | null;
          frecuencia_semanal: number | null;
          semanas_totales: number | null;
          nivel_texto: string | null;
        };
        Insert: {
          id?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          periodo_nombre?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          contenidos?: any | null;
          tecnicas?: any | null;
          obras?: any | null;
          escalas_arpegios?: any | null;
          evaluaciones?: any | null;
          estado?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          instrumento?: string | null;
          objetivos_estructurados?: any | null;
          frecuencia_semanal?: number | null;
          semanas_totales?: number | null;
          nivel_texto?: string | null;
        };
        Update: {
          id?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          periodo_nombre?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          contenidos?: any | null;
          tecnicas?: any | null;
          obras?: any | null;
          escalas_arpegios?: any | null;
          evaluaciones?: any | null;
          estado?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          instrumento?: string | null;
          objetivos_estructurados?: any | null;
          frecuencia_semanal?: number | null;
          semanas_totales?: number | null;
          nivel_texto?: string | null;
        };
      };
      hermes_reactive_rules: {
        Row: {
          id: string | null;
          rule_type: string | null;
          nombre: string | null;
          descripcion: string | null;
          enabled: boolean | null;
          departamento: string | null;
          conditions_json: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          rule_type?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          enabled?: boolean | null;
          departamento?: string | null;
          conditions_json?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          rule_type?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          enabled?: boolean | null;
          departamento?: string | null;
          conditions_json?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_score_representantes: {
        Row: {
          representante_id: string | null;
          familia_id: string | null;
          score: number | null;
          nivel: string | null;
          puntualidad_pct: number | null;
          consistencia_meses: number | null;
          voluntad_pago_pct: number | null;
          comportamiento_mora_pct: number | null;
          generosidad_pct: number | null;
          calculado_en: string | null;
          ciclo_mes: number | null;
          ciclo_anio: number | null;
          rep_nombre: string | null;
          nombre_familia: string | null;
        };
        Insert: {
          representante_id?: string | null;
          familia_id?: string | null;
          score?: number | null;
          nivel?: string | null;
          puntualidad_pct?: number | null;
          consistencia_meses?: number | null;
          voluntad_pago_pct?: number | null;
          comportamiento_mora_pct?: number | null;
          generosidad_pct?: number | null;
          calculado_en?: string | null;
          ciclo_mes?: number | null;
          ciclo_anio?: number | null;
          rep_nombre?: string | null;
          nombre_familia?: string | null;
        };
        Update: {
          representante_id?: string | null;
          familia_id?: string | null;
          score?: number | null;
          nivel?: string | null;
          puntualidad_pct?: number | null;
          consistencia_meses?: number | null;
          voluntad_pago_pct?: number | null;
          comportamiento_mora_pct?: number | null;
          generosidad_pct?: number | null;
          calculado_en?: string | null;
          ciclo_mes?: number | null;
          ciclo_anio?: number | null;
          rep_nombre?: string | null;
          nombre_familia?: string | null;
        };
      };
      progresos: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          clase_id: string | null;
          sesion_clase_id: string | null;
          asistencia_id: string | null;
          ejercicio_id: string | null;
          maestro_id: string | null;
          fecha_evaluacion: string | null;
          indicadores: any | null;
          estado_cualitativo: string | null;
          calificacion: number | null;
          evaluacion_tipo: string | null;
          observaciones: string | null;
          created_at: string | null;
          updated_at: string | null;
          periodo_id: string | null;
          contenido_dsl: string | null;
          objetivo_id: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          sesion_clase_id?: string | null;
          asistencia_id?: string | null;
          ejercicio_id?: string | null;
          maestro_id?: string | null;
          fecha_evaluacion?: string | null;
          indicadores?: any | null;
          estado_cualitativo?: string | null;
          calificacion?: number | null;
          evaluacion_tipo?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          periodo_id?: string | null;
          contenido_dsl?: string | null;
          objetivo_id?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          sesion_clase_id?: string | null;
          asistencia_id?: string | null;
          ejercicio_id?: string | null;
          maestro_id?: string | null;
          fecha_evaluacion?: string | null;
          indicadores?: any | null;
          estado_cualitativo?: string | null;
          calificacion?: number | null;
          evaluacion_tipo?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          periodo_id?: string | null;
          contenido_dsl?: string | null;
          objetivo_id?: string | null;
        };
      };
      vw_evaluacion_indicador_global: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          clase_id: string | null;
          indicator_id: string | null;
          clase_indicador_id: string | null;
          indicator_id_global: string | null;
          nota: number | null;
          estado: string | null;
          observaciones: string | null;
          evaluado_por: string | null;
          fecha_evaluacion: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          indicator_id?: string | null;
          clase_indicador_id?: string | null;
          indicator_id_global?: string | null;
          nota?: number | null;
          estado?: string | null;
          observaciones?: string | null;
          evaluado_por?: string | null;
          fecha_evaluacion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          indicator_id?: string | null;
          clase_indicador_id?: string | null;
          indicator_id_global?: string | null;
          nota?: number | null;
          estado?: string | null;
          observaciones?: string | null;
          evaluado_por?: string | null;
          fecha_evaluacion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      indicator_session_students: {
        Row: {
          id: string | null;
          indicator_session_id: string | null;
          alumno_id: string | null;
          nota_cualitativa: string | null;
          observaciones_individuales: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          indicator_session_id?: string | null;
          alumno_id?: string | null;
          nota_cualitativa?: string | null;
          observaciones_individuales?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          indicator_session_id?: string | null;
          alumno_id?: string | null;
          nota_cualitativa?: string | null;
          observaciones_individuales?: string | null;
          created_at?: string | null;
        };
      };
      planificacion_nodos: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          programa_id: string | null;
          codigo: string | null;
          nombre: string | null;
          descripcion: string | null;
          nivel: number | null;
          bloque: number | null;
          ponderacion: number | null;
          padre_id: string | null;
          estado: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          programa_id?: string | null;
          codigo?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          nivel?: number | null;
          bloque?: number | null;
          ponderacion?: number | null;
          padre_id?: string | null;
          estado?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          programa_id?: string | null;
          codigo?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          nivel?: number | null;
          bloque?: number | null;
          ponderacion?: number | null;
          padre_id?: string | null;
          estado?: string | null;
          created_at?: string | null;
        };
      };
      maestro_desempeno: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          total_sesiones: number | null;
          sesiones_verde: number | null;
          sesiones_amarillo: number | null;
          sesiones_naranja: number | null;
          sesiones_rojo: number | null;
          categoria: string | null;
          fecha_ultima_evaluacion: string | null;
          tendencia: string | null;
          pending_count: number | null;
          oldest_dias_atraso: number | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          total_sesiones?: number | null;
          sesiones_verde?: number | null;
          sesiones_amarillo?: number | null;
          sesiones_naranja?: number | null;
          sesiones_rojo?: number | null;
          categoria?: string | null;
          fecha_ultima_evaluacion?: string | null;
          tendencia?: string | null;
          pending_count?: number | null;
          oldest_dias_atraso?: number | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          total_sesiones?: number | null;
          sesiones_verde?: number | null;
          sesiones_amarillo?: number | null;
          sesiones_naranja?: number | null;
          sesiones_rojo?: number | null;
          categoria?: string | null;
          fecha_ultima_evaluacion?: string | null;
          tendencia?: string | null;
          pending_count?: number | null;
          oldest_dias_atraso?: number | null;
          updated_at?: string | null;
        };
      };
      clases: {
        Row: {
          id: string | null;
          nombre: string | null;
          programa_id: string | null;
          nivel_id: string | null;
          maestro_principal_id: string | null;
          maestro_suplente_id: string | null;
          tipo_clase: string | null;
          instrumento: string | null;
          descripcion: string | null;
          capacidad_maxima: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          estado: string | null;
          maestro_id: string | null;
          plan_estudio: string | null;
          modalidad: string | null;
          salon: string | null;
          route_version_id: string | null;
          maestro_auxiliar_id: string | null;
          ruta_id: string | null;
          whatsapp_group_jid: string | null;
          es_clase_iniciacion: boolean | null;
          necesita_revision: boolean | null;
          revision_motivo: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          maestro_principal_id?: string | null;
          maestro_suplente_id?: string | null;
          tipo_clase?: string | null;
          instrumento?: string | null;
          descripcion?: string | null;
          capacidad_maxima?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado?: string | null;
          maestro_id?: string | null;
          plan_estudio?: string | null;
          modalidad?: string | null;
          salon?: string | null;
          route_version_id?: string | null;
          maestro_auxiliar_id?: string | null;
          ruta_id?: string | null;
          whatsapp_group_jid?: string | null;
          es_clase_iniciacion?: boolean | null;
          necesita_revision?: boolean | null;
          revision_motivo?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          maestro_principal_id?: string | null;
          maestro_suplente_id?: string | null;
          tipo_clase?: string | null;
          instrumento?: string | null;
          descripcion?: string | null;
          capacidad_maxima?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado?: string | null;
          maestro_id?: string | null;
          plan_estudio?: string | null;
          modalidad?: string | null;
          salon?: string | null;
          route_version_id?: string | null;
          maestro_auxiliar_id?: string | null;
          ruta_id?: string | null;
          whatsapp_group_jid?: string | null;
          es_clase_iniciacion?: boolean | null;
          necesita_revision?: boolean | null;
          revision_motivo?: string | null;
        };
      };
      calendario: {
        Row: {
          id: string | null;
          departamento_id: string | null;
          titulo: string | null;
          descripcion: string | null;
          tipo: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          fecha_alerta: number | null;
          prioridad: string | null;
          estado: string | null;
          responsable_id: string | null;
          protocolo_json: any | null;
          notas: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          departamento_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          tipo?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          fecha_alerta?: number | null;
          prioridad?: string | null;
          estado?: string | null;
          responsable_id?: string | null;
          protocolo_json?: any | null;
          notas?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          departamento_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          tipo?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          fecha_alerta?: number | null;
          prioridad?: string | null;
          estado?: string | null;
          responsable_id?: string | null;
          protocolo_json?: any | null;
          notas?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      modulos: {
        Row: {
          id: string | null;
          programa_id: string | null;
          nivel_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          orden: number | null;
          duracion_estimada_semanas: number | null;
          requisito_modulo_id: string | null;
          porcentaje_aprobacion: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          duracion_estimada_semanas?: number | null;
          requisito_modulo_id?: string | null;
          porcentaje_aprobacion?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          duracion_estimada_semanas?: number | null;
          requisito_modulo_id?: string | null;
          porcentaje_aprobacion?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      nodes: {
        Row: {
          id: string | null;
          level_id: string | null;
          route_version_id: string | null;
          name: string | null;
          type: string | null;
          is_critical: boolean | null;
          is_required: boolean | null;
          objective: string | null;
          order_index: number | null;
          codigo: string | null;
        };
        Insert: {
          id?: string | null;
          level_id?: string | null;
          route_version_id?: string | null;
          name?: string | null;
          type?: string | null;
          is_critical?: boolean | null;
          is_required?: boolean | null;
          objective?: string | null;
          order_index?: number | null;
          codigo?: string | null;
        };
        Update: {
          id?: string | null;
          level_id?: string | null;
          route_version_id?: string | null;
          name?: string | null;
          type?: string | null;
          is_critical?: boolean | null;
          is_required?: boolean | null;
          objective?: string | null;
          order_index?: number | null;
          codigo?: string | null;
        };
      };
      student_cases: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          tipo: string | null;
          titulo: string | null;
          descripcion: string | null;
          nivel_riesgo: string | null;
          estado: string | null;
          origen: string | null;
          responsable_id: string | null;
          fecha_apertura: string | null;
          fecha_cierre: string | null;
          resumen_actual: string | null;
          proxima_accion: string | null;
          proxima_accion_fecha: string | null;
          ultimo_contacto_en: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          nivel_riesgo?: string | null;
          estado?: string | null;
          origen?: string | null;
          responsable_id?: string | null;
          fecha_apertura?: string | null;
          fecha_cierre?: string | null;
          resumen_actual?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          ultimo_contacto_en?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          nivel_riesgo?: string | null;
          estado?: string | null;
          origen?: string | null;
          responsable_id?: string | null;
          fecha_apertura?: string | null;
          fecha_cierre?: string | null;
          resumen_actual?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          ultimo_contacto_en?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      blocks: {
        Row: {
          id: string | null;
          route_version_id: string | null;
          name: string | null;
          level_from: number | null;
          level_to: number | null;
          objective: string | null;
          description: string | null;
          order_index: number | null;
        };
        Insert: {
          id?: string | null;
          route_version_id?: string | null;
          name?: string | null;
          level_from?: number | null;
          level_to?: number | null;
          objective?: string | null;
          description?: string | null;
          order_index?: number | null;
        };
        Update: {
          id?: string | null;
          route_version_id?: string | null;
          name?: string | null;
          level_from?: number | null;
          level_to?: number | null;
          objective?: string | null;
          description?: string | null;
          order_index?: number | null;
        };
      };
      whatsapp_consentimientos: {
        Row: {
          id: string | null;
          jid: string | null;
          nombre_representante: string | null;
          representante_cedula: string | null;
          niño_nombre: string | null;
          niño_edad: number | null;
          campania_id: string | null;
          acepta_campania: boolean | null;
          acepta_estadisticas: boolean | null;
          firmas_digitales: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          jid?: string | null;
          nombre_representante?: string | null;
          representante_cedula?: string | null;
          niño_nombre?: string | null;
          niño_edad?: number | null;
          campania_id?: string | null;
          acepta_campania?: boolean | null;
          acepta_estadisticas?: boolean | null;
          firmas_digitales?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          jid?: string | null;
          nombre_representante?: string | null;
          representante_cedula?: string | null;
          niño_nombre?: string | null;
          niño_edad?: number | null;
          campania_id?: string | null;
          acepta_campania?: boolean | null;
          acepta_estadisticas?: boolean | null;
          firmas_digitales?: string | null;
          created_at?: string | null;
        };
      };
      generated_documents: {
        Row: {
          id: string | null;
          batch_id: string | null;
          template_id: string | null;
          tipo: string | null;
          titulo: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          grupo_nombre: string | null;
          actividad_nombre: string | null;
          contenido_final: string | null;
          variables_usadas: any | null;
          variables_faltantes: any | null;
          advertencias: any | null;
          pdf_url: string | null;
          estado: string | null;
          generado_por: string | null;
          generated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          batch_id?: string | null;
          template_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          grupo_nombre?: string | null;
          actividad_nombre?: string | null;
          contenido_final?: string | null;
          variables_usadas?: any | null;
          variables_faltantes?: any | null;
          advertencias?: any | null;
          pdf_url?: string | null;
          estado?: string | null;
          generado_por?: string | null;
          generated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          batch_id?: string | null;
          template_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          grupo_nombre?: string | null;
          actividad_nombre?: string | null;
          contenido_final?: string | null;
          variables_usadas?: any | null;
          variables_faltantes?: any | null;
          advertencias?: any | null;
          pdf_url?: string | null;
          estado?: string | null;
          generado_por?: string | null;
          generated_at?: string | null;
          created_at?: string | null;
        };
      };
      planned_content: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          clase_id: string | null;
          node_id: string | null;
          planned_date: string | null;
          covered: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          node_id?: string | null;
          planned_date?: string | null;
          covered?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          node_id?: string | null;
          planned_date?: string | null;
          covered?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      xp_log: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          cantidad: number | null;
          concepto: string | null;
          referencia_tipo: string | null;
          referencia_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          cantidad?: number | null;
          concepto?: string | null;
          referencia_tipo?: string | null;
          referencia_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          cantidad?: number | null;
          concepto?: string | null;
          referencia_tipo?: string | null;
          referencia_id?: string | null;
          created_at?: string | null;
        };
      };
      instrumentos: {
        Row: {
          id: string | null;
          codigo: string | null;
          nombre: string | null;
          tipo: string | null;
          marca: string | null;
          serie: string | null;
          estado: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          notas: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          codigo?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          marca?: string | null;
          serie?: string | null;
          estado?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          notas?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          codigo?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          marca?: string | null;
          serie?: string | null;
          estado?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          notas?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      view_evaluaciones_pedagogicas: {
        Row: {
          attempt_id: string | null;
          student_id: string | null;
          student_name: string | null;
          indicator_id: string | null;
          indicator_description: string | null;
          indicator_name: string | null;
          node_id: string | null;
          node_name: string | null;
          node_codigo: string | null;
          level_id: string | null;
          level_name: string | null;
          level_number: number | null;
          result: string | null;
          nota: number | null;
          observations: string | null;
          maestro_id: string | null;
          maestro_name: string | null;
          clase_id: string | null;
          clase_name: string | null;
          covered_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          attempt_id?: string | null;
          student_id?: string | null;
          student_name?: string | null;
          indicator_id?: string | null;
          indicator_description?: string | null;
          indicator_name?: string | null;
          node_id?: string | null;
          node_name?: string | null;
          node_codigo?: string | null;
          level_id?: string | null;
          level_name?: string | null;
          level_number?: number | null;
          result?: string | null;
          nota?: number | null;
          observations?: string | null;
          maestro_id?: string | null;
          maestro_name?: string | null;
          clase_id?: string | null;
          clase_name?: string | null;
          covered_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          attempt_id?: string | null;
          student_id?: string | null;
          student_name?: string | null;
          indicator_id?: string | null;
          indicator_description?: string | null;
          indicator_name?: string | null;
          node_id?: string | null;
          node_name?: string | null;
          node_codigo?: string | null;
          level_id?: string | null;
          level_name?: string | null;
          level_number?: number | null;
          result?: string | null;
          nota?: number | null;
          observations?: string | null;
          maestro_id?: string | null;
          maestro_name?: string | null;
          clase_id?: string | null;
          clase_name?: string | null;
          covered_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string | null;
          email: string | null;
          nombre_completo: string | null;
          rol: string | null;
          avatar_url: string | null;
          activo: boolean | null;
          estado: string | null;
          created_at: string | null;
          updated_at: string | null;
          solicitud_instrumento: string | null;
          solicitud_resena: string | null;
        };
        Insert: {
          id?: string | null;
          email?: string | null;
          nombre_completo?: string | null;
          rol?: string | null;
          avatar_url?: string | null;
          activo?: boolean | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          solicitud_instrumento?: string | null;
          solicitud_resena?: string | null;
        };
        Update: {
          id?: string | null;
          email?: string | null;
          nombre_completo?: string | null;
          rol?: string | null;
          avatar_url?: string | null;
          activo?: boolean | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          solicitud_instrumento?: string | null;
          solicitud_resena?: string | null;
        };
      };
      patrocinios: {
        Row: {
          id: string | null;
          patrocinante_id: string | null;
          alumno_id: string | null;
          familia_id: string | null;
          cubre: string | null;
          monto_mensual_centavos: number | null;
          activo: boolean | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          patrocinante_id?: string | null;
          alumno_id?: string | null;
          familia_id?: string | null;
          cubre?: string | null;
          monto_mensual_centavos?: number | null;
          activo?: boolean | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          patrocinante_id?: string | null;
          alumno_id?: string | null;
          familia_id?: string | null;
          cubre?: string | null;
          monto_mensual_centavos?: number | null;
          activo?: boolean | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          created_at?: string | null;
        };
      };
      salones: {
        Row: {
          id: string | null;
          nombre: string | null;
          ubicacion: string | null;
          descripcion: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          capacidad: number | null;
          codigo_salon: string | null;
          piso: number | null;
          condicion_fisica: string | null;
          equipamiento: any | null;
          responsable_id: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          ubicacion?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          capacidad?: number | null;
          codigo_salon?: string | null;
          piso?: number | null;
          condicion_fisica?: string | null;
          equipamiento?: any | null;
          responsable_id?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          ubicacion?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          capacidad?: number | null;
          codigo_salon?: string | null;
          piso?: number | null;
          condicion_fisica?: string | null;
          equipamiento?: any | null;
          responsable_id?: string | null;
          is_active?: boolean | null;
        };
      };
      justificaciones: {
        Row: {
          id: string | null;
          sesion_id: string | null;
          alumno_id: string | null;
          clase_id: string | null;
          fecha: string | null;
          motivo: string | null;
          evidencia_url: string | null;
          evidencia_base64: string | null;
          creado_por: string | null;
          estado: string | null;
          revisado_por: string | null;
          fecha_revision: string | null;
          created_at: string | null;
          updated_at: string | null;
          categoria: string | null;
        };
        Insert: {
          id?: string | null;
          sesion_id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          fecha?: string | null;
          motivo?: string | null;
          evidencia_url?: string | null;
          evidencia_base64?: string | null;
          creado_por?: string | null;
          estado?: string | null;
          revisado_por?: string | null;
          fecha_revision?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          categoria?: string | null;
        };
        Update: {
          id?: string | null;
          sesion_id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          fecha?: string | null;
          motivo?: string | null;
          evidencia_url?: string | null;
          evidencia_base64?: string | null;
          creado_por?: string | null;
          estado?: string | null;
          revisado_por?: string | null;
          fecha_revision?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          categoria?: string | null;
        };
      };
      campania_envios: {
        Row: {
          id: string | null;
          campania_id: string | null;
          fuente: string | null;
          persona_id: string | null;
          nombre: string | null;
          telefono: string | null;
          jid: string | null;
          segmento: string | null;
          mensaje: string | null;
          estado: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          campania_id?: string | null;
          fuente?: string | null;
          persona_id?: string | null;
          nombre?: string | null;
          telefono?: string | null;
          jid?: string | null;
          segmento?: string | null;
          mensaje?: string | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          campania_id?: string | null;
          fuente?: string | null;
          persona_id?: string | null;
          nombre?: string | null;
          telefono?: string | null;
          jid?: string | null;
          segmento?: string | null;
          mensaje?: string | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_rendimiento_maestro: {
        Row: {
          maestro_id: string | null;
          nombre_completo: string | null;
          especialidad: string | null;
          activo: boolean | null;
          tasa_asistencia_clases: number | null;
          total_registros_asistencia: number | null;
          promedio_calificacion_alumnos: number | null;
          total_alumnos_evaluados: number | null;
          total_evaluaciones: number | null;
          obs_generadas: number | null;
          obs_resueltas: number | null;
          tasa_resolucion_obs: number | null;
          dias_promedio_resolucion: number | null;
        };
        Insert: {
          maestro_id?: string | null;
          nombre_completo?: string | null;
          especialidad?: string | null;
          activo?: boolean | null;
          tasa_asistencia_clases?: number | null;
          total_registros_asistencia?: number | null;
          promedio_calificacion_alumnos?: number | null;
          total_alumnos_evaluados?: number | null;
          total_evaluaciones?: number | null;
          obs_generadas?: number | null;
          obs_resueltas?: number | null;
          tasa_resolucion_obs?: number | null;
          dias_promedio_resolucion?: number | null;
        };
        Update: {
          maestro_id?: string | null;
          nombre_completo?: string | null;
          especialidad?: string | null;
          activo?: boolean | null;
          tasa_asistencia_clases?: number | null;
          total_registros_asistencia?: number | null;
          promedio_calificacion_alumnos?: number | null;
          total_alumnos_evaluados?: number | null;
          total_evaluaciones?: number | null;
          obs_generadas?: number | null;
          obs_resueltas?: number | null;
          tasa_resolucion_obs?: number | null;
          dias_promedio_resolucion?: number | null;
        };
      };
      comodatos_activos: {
        Row: {
          id: string | null;
          activo_id: string | null;
          alumno_id: string | null;
          fecha_entrega: string | null;
          fecha_devolucion: string | null;
          estado: string | null;
          contrato_firmado_url: string | null;
          observaciones: string | null;
          registrado_por: string | null;
          created_at: string | null;
          fecha_vencimiento: string | null;
          tipo_comodato: string | null;
          instrumento_propio_id: string | null;
          renovado_de_id: string | null;
          intercambiado_con_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          activo_id?: string | null;
          alumno_id?: string | null;
          fecha_entrega?: string | null;
          fecha_devolucion?: string | null;
          estado?: string | null;
          contrato_firmado_url?: string | null;
          observaciones?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
          fecha_vencimiento?: string | null;
          tipo_comodato?: string | null;
          instrumento_propio_id?: string | null;
          renovado_de_id?: string | null;
          intercambiado_con_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          activo_id?: string | null;
          alumno_id?: string | null;
          fecha_entrega?: string | null;
          fecha_devolucion?: string | null;
          estado?: string | null;
          contrato_firmado_url?: string | null;
          observaciones?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
          fecha_vencimiento?: string | null;
          tipo_comodato?: string | null;
          instrumento_propio_id?: string | null;
          renovado_de_id?: string | null;
          intercambiado_con_id?: string | null;
          updated_at?: string | null;
        };
      };
      lut_insumos: {
        Row: {
          id: string | null;
          nombre: string | null;
          categoria: string | null;
          unidad: string | null;
          stock_actual: number | null;
          stock_minimo: number | null;
          costo_unitario: number | null;
          proveedor_sugerido: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          categoria?: string | null;
          unidad?: string | null;
          stock_actual?: number | null;
          stock_minimo?: number | null;
          costo_unitario?: number | null;
          proveedor_sugerido?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          categoria?: string | null;
          unidad?: string | null;
          stock_actual?: number | null;
          stock_minimo?: number | null;
          costo_unitario?: number | null;
          proveedor_sugerido?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      hermes_evaluaciones: {
        Row: {
          id: string | null;
          fecha: string | null;
          alertas_identificadas: number | null;
          acciones_generadas: number | null;
          detalle: any | null;
        };
        Insert: {
          id?: string | null;
          fecha?: string | null;
          alertas_identificadas?: number | null;
          acciones_generadas?: number | null;
          detalle?: any | null;
        };
        Update: {
          id?: string | null;
          fecha?: string | null;
          alertas_identificadas?: number | null;
          acciones_generadas?: number | null;
          detalle?: any | null;
        };
      };
      catalogo_objetivos_generales: {
        Row: {
          id: string | null;
          nivel_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          orden: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nivel_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nivel_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      schedule_runs: {
        Row: {
          id: string | null;
          periodo: string | null;
          config: any | null;
          resultado: any | null;
          metricas: any | null;
          estado: string | null;
          applied_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          periodo?: string | null;
          config?: any | null;
          resultado?: any | null;
          metricas?: any | null;
          estado?: string | null;
          applied_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          periodo?: string | null;
          config?: any | null;
          resultado?: any | null;
          metricas?: any | null;
          estado?: string | null;
          applied_at?: string | null;
          created_at?: string | null;
        };
      };
      telegram_allowed_users: {
        Row: {
          id: string | null;
          telegram_user_id: number | null;
          nombre: string | null;
          rol: string | null;
          activo: boolean | null;
          created_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string | null;
          telegram_user_id?: number | null;
          nombre?: string | null;
          rol?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string | null;
          telegram_user_id?: number | null;
          nombre?: string | null;
          rol?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          created_by?: string | null;
        };
      };
      lut_solicitudes_compra: {
        Row: {
          id: string | null;
          orden_id: string | null;
          insumo_id: string | null;
          cantidad_solicitada: number | null;
          justificacion: string | null;
          urgencia: string | null;
          costo_estimado: number | null;
          proveedor_sugerido: string | null;
          estado: string | null;
          solicitado_por: string | null;
          aprobado_por: string | null;
          fecha_requerida: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          orden_id?: string | null;
          insumo_id?: string | null;
          cantidad_solicitada?: number | null;
          justificacion?: string | null;
          urgencia?: string | null;
          costo_estimado?: number | null;
          proveedor_sugerido?: string | null;
          estado?: string | null;
          solicitado_por?: string | null;
          aprobado_por?: string | null;
          fecha_requerida?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          orden_id?: string | null;
          insumo_id?: string | null;
          cantidad_solicitada?: number | null;
          justificacion?: string | null;
          urgencia?: string | null;
          costo_estimado?: number | null;
          proveedor_sugerido?: string | null;
          estado?: string | null;
          solicitado_por?: string | null;
          aprobado_por?: string | null;
          fecha_requerida?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      aplicaciones_pago: {
        Row: {
          id: string | null;
          pago_id: string | null;
          cuota_id: string | null;
          monto_aplicado_centavos: number | null;
          dias_atraso_al_aplicar: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          pago_id?: string | null;
          cuota_id?: string | null;
          monto_aplicado_centavos?: number | null;
          dias_atraso_al_aplicar?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          pago_id?: string | null;
          cuota_id?: string | null;
          monto_aplicado_centavos?: number | null;
          dias_atraso_al_aplicar?: number | null;
          created_at?: string | null;
        };
      };
      evaluations: {
        Row: {
          id: string | null;
          student_id: string | null;
          jurado_id: string | null;
          jurado_name: string | null;
          afinacion_general: number | null;
          ritmo_escala: number | null;
          sonido: number | null;
          digitacion: number | null;
          afinacion_rep: number | null;
          ritmo_rep: number | null;
          articulacion: number | null;
          lectura: number | null;
          score_escala: number | null;
          score_danzon: number | null;
          score_total: number | null;
          observations: string | null;
          recommendation: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          student_id?: string | null;
          jurado_id?: string | null;
          jurado_name?: string | null;
          afinacion_general?: number | null;
          ritmo_escala?: number | null;
          sonido?: number | null;
          digitacion?: number | null;
          afinacion_rep?: number | null;
          ritmo_rep?: number | null;
          articulacion?: number | null;
          lectura?: number | null;
          score_escala?: number | null;
          score_danzon?: number | null;
          score_total?: number | null;
          observations?: string | null;
          recommendation?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          student_id?: string | null;
          jurado_id?: string | null;
          jurado_name?: string | null;
          afinacion_general?: number | null;
          ritmo_escala?: number | null;
          sonido?: number | null;
          digitacion?: number | null;
          afinacion_rep?: number | null;
          ritmo_rep?: number | null;
          articulacion?: number | null;
          lectura?: number | null;
          score_escala?: number | null;
          score_danzon?: number | null;
          score_total?: number | null;
          observations?: string | null;
          recommendation?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      alumno_escolaridad: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          centro_estudios: string | null;
          grado_nivel: string | null;
          seccion: string | null;
          anio_escolar: string | null;
          director_institucion: string | null;
          cargo_director: string | null;
          telefono_centro: string | null;
          correo_centro: string | null;
          direccion_centro: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          centro_estudios?: string | null;
          grado_nivel?: string | null;
          seccion?: string | null;
          anio_escolar?: string | null;
          director_institucion?: string | null;
          cargo_director?: string | null;
          telefono_centro?: string | null;
          correo_centro?: string | null;
          direccion_centro?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          centro_estudios?: string | null;
          grado_nivel?: string | null;
          seccion?: string | null;
          anio_escolar?: string | null;
          director_institucion?: string | null;
          cargo_director?: string | null;
          telefono_centro?: string | null;
          correo_centro?: string | null;
          direccion_centro?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      programas_prerrequisitos: {
        Row: {
          id: string | null;
          programa_id: string | null;
          prerequisito_id: string | null;
          tipo: string | null;
          nota_minima: number | null;
          notas: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          programa_id?: string | null;
          prerequisito_id?: string | null;
          tipo?: string | null;
          nota_minima?: number | null;
          notas?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          programa_id?: string | null;
          prerequisito_id?: string | null;
          tipo?: string | null;
          nota_minima?: number | null;
          notas?: string | null;
          created_at?: string | null;
        };
      };
      tarea_historial: {
        Row: {
          id: string | null;
          tarea_id: string | null;
          campo: string | null;
          valor_anterior: string | null;
          valor_nuevo: string | null;
          actor_id: string | null;
          actor_nombre: string | null;
          actor_rol: string | null;
          actor_departamento: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          tarea_id?: string | null;
          campo?: string | null;
          valor_anterior?: string | null;
          valor_nuevo?: string | null;
          actor_id?: string | null;
          actor_nombre?: string | null;
          actor_rol?: string | null;
          actor_departamento?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          tarea_id?: string | null;
          campo?: string | null;
          valor_anterior?: string | null;
          valor_nuevo?: string | null;
          actor_id?: string | null;
          actor_nombre?: string | null;
          actor_rol?: string | null;
          actor_departamento?: string | null;
          created_at?: string | null;
        };
      };
      class_events: {
        Row: {
          id: string | null;
          teacher_id: string | null;
          student_id: string | null;
          academic_plan_id: string | null;
          session_id: string | null;
          level_id: string | null;
          event_date: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          teacher_id?: string | null;
          student_id?: string | null;
          academic_plan_id?: string | null;
          session_id?: string | null;
          level_id?: string | null;
          event_date?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          teacher_id?: string | null;
          student_id?: string | null;
          academic_plan_id?: string | null;
          session_id?: string | null;
          level_id?: string | null;
          event_date?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      familias: {
        Row: {
          id: string | null;
          nombre_familia: string | null;
          fecha_ingreso: string | null;
          activa: boolean | null;
          datos_extra: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre_familia?: string | null;
          fecha_ingreso?: string | null;
          activa?: boolean | null;
          datos_extra?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre_familia?: string | null;
          fecha_ingreso?: string | null;
          activa?: boolean | null;
          datos_extra?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sim_calendario: {
        Row: {
          id: string | null;
          run_id: string | null;
          titulo: string | null;
          descripcion: string | null;
          categoria: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          ubicacion: string | null;
          departamento_responsable: string | null;
          metadata: any | null;
          estado: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          run_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          categoria?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          ubicacion?: string | null;
          departamento_responsable?: string | null;
          metadata?: any | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          run_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          categoria?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          ubicacion?: string | null;
          departamento_responsable?: string | null;
          metadata?: any | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      periodos_cierre_auditoria: {
        Row: {
          id: string | null;
          periodo_id: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          cerrado_por: string | null;
          observaciones: string | null;
          resumen: any | null;
          snapshot: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          periodo_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          cerrado_por?: string | null;
          observaciones?: string | null;
          resumen?: any | null;
          snapshot?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          periodo_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          cerrado_por?: string | null;
          observaciones?: string | null;
          resumen?: any | null;
          snapshot?: any | null;
          created_at?: string | null;
        };
      };
      alumnos_rutas: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          programa_id: string | null;
          nivel_id: string | null;
          fecha_inicio: string | null;
          fecha_fin_estimada: string | null;
          fecha_completado: string | null;
          estado: string | null;
          progreso_porcentaje: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin_estimada?: string | null;
          fecha_completado?: string | null;
          estado?: string | null;
          progreso_porcentaje?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          programa_id?: string | null;
          nivel_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin_estimada?: string | null;
          fecha_completado?: string | null;
          estado?: string | null;
          progreso_porcentaje?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      facturas_reparacion: {
        Row: {
          id: string | null;
          reparacion_id: string | null;
          numero_factura: string | null;
          monto_total: number | null;
          impuestos: number | null;
          metodo_pago: string | null;
          responsable_id: string | null;
          tipo_factura: string | null;
          fecha_emision: string | null;
          pdf_generado_url: string | null;
          estado_pago: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          reparacion_id?: string | null;
          numero_factura?: string | null;
          monto_total?: number | null;
          impuestos?: number | null;
          metodo_pago?: string | null;
          responsable_id?: string | null;
          tipo_factura?: string | null;
          fecha_emision?: string | null;
          pdf_generado_url?: string | null;
          estado_pago?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          reparacion_id?: string | null;
          numero_factura?: string | null;
          monto_total?: number | null;
          impuestos?: number | null;
          metodo_pago?: string | null;
          responsable_id?: string | null;
          tipo_factura?: string | null;
          fecha_emision?: string | null;
          pdf_generado_url?: string | null;
          estado_pago?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      becas: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          familia_id: string | null;
          porcentaje: number | null;
          motivo: string | null;
          aprobado_por: string | null;
          activa: boolean | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          indicador_progreso_minimo: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          familia_id?: string | null;
          porcentaje?: number | null;
          motivo?: string | null;
          aprobado_por?: string | null;
          activa?: boolean | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          indicador_progreso_minimo?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          familia_id?: string | null;
          porcentaje?: number | null;
          motivo?: string | null;
          aprobado_por?: string | null;
          activa?: boolean | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          indicador_progreso_minimo?: string | null;
          created_at?: string | null;
        };
      };
      evaluacion_indicador: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          indicator_id: string | null;
          clase_id: string | null;
          nota: number | null;
          estado: string | null;
          observaciones: string | null;
          evaluado_por: string | null;
          fecha_evaluacion: string | null;
          created_at: string | null;
          updated_at: string | null;
          clase_indicador_id: string | null;
          recovery_status: string | null;
          recovery_notes: string | null;
          recovery_timestamp: string | null;
          recovery_grade: number | null;
          maestro_indicador_id: string | null;
          review_flag: boolean | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          indicator_id?: string | null;
          clase_id?: string | null;
          nota?: number | null;
          estado?: string | null;
          observaciones?: string | null;
          evaluado_por?: string | null;
          fecha_evaluacion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          clase_indicador_id?: string | null;
          recovery_status?: string | null;
          recovery_notes?: string | null;
          recovery_timestamp?: string | null;
          recovery_grade?: number | null;
          maestro_indicador_id?: string | null;
          review_flag?: boolean | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          indicator_id?: string | null;
          clase_id?: string | null;
          nota?: number | null;
          estado?: string | null;
          observaciones?: string | null;
          evaluado_por?: string | null;
          fecha_evaluacion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          clase_indicador_id?: string | null;
          recovery_status?: string | null;
          recovery_notes?: string | null;
          recovery_timestamp?: string | null;
          recovery_grade?: number | null;
          maestro_indicador_id?: string | null;
          review_flag?: boolean | null;
        };
      };
      prospeccion_log: {
        Row: {
          id: string | null;
          termino_busqueda: string | null;
          ubicacion: string | null;
          industria: string | null;
          resultados_encontrados: number | null;
          resultados_procesados: number | null;
          estado: string | null;
          error: string | null;
          ejecutado_por: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          termino_busqueda?: string | null;
          ubicacion?: string | null;
          industria?: string | null;
          resultados_encontrados?: number | null;
          resultados_procesados?: number | null;
          estado?: string | null;
          error?: string | null;
          ejecutado_por?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          termino_busqueda?: string | null;
          ubicacion?: string | null;
          industria?: string | null;
          resultados_encontrados?: number | null;
          resultados_procesados?: number | null;
          estado?: string | null;
          error?: string | null;
          ejecutado_por?: string | null;
          created_at?: string | null;
        };
      };
      alumnos_clases: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          clase_id: string | null;
          fecha_inscripcion: string | null;
          activo: boolean | null;
          created_at: string | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          dia: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          fecha_inscripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          dia?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          fecha_inscripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          dia?: string | null;
        };
      };
      campanias_destinatarios: {
        Row: {
          id: string | null;
          campania_id: string | null;
          institucion_id: string | null;
          estado: string | null;
          fecha_envio: string | null;
          fecha_respuesta: string | null;
          respuesta_texto: string | null;
          notas_seguimiento: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          campania_id?: string | null;
          institucion_id?: string | null;
          estado?: string | null;
          fecha_envio?: string | null;
          fecha_respuesta?: string | null;
          respuesta_texto?: string | null;
          notas_seguimiento?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          campania_id?: string | null;
          institucion_id?: string | null;
          estado?: string | null;
          fecha_envio?: string | null;
          fecha_respuesta?: string | null;
          respuesta_texto?: string | null;
          notas_seguimiento?: string | null;
          created_at?: string | null;
        };
      };
      pagos: {
        Row: {
          id: string | null;
          familia_id: string | null;
          cuota_ids: string[] | null;
          monto_centavos: number | null;
          metodo_pago: string | null;
          referencia: string | null;
          cajero_id: string | null;
          notas: string | null;
          recibo_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          cuota_ids?: string[] | null;
          monto_centavos?: number | null;
          metodo_pago?: string | null;
          referencia?: string | null;
          cajero_id?: string | null;
          notas?: string | null;
          recibo_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          cuota_ids?: string[] | null;
          monto_centavos?: number | null;
          metodo_pago?: string | null;
          referencia?: string | null;
          cajero_id?: string | null;
          notas?: string | null;
          recibo_url?: string | null;
          created_at?: string | null;
        };
      };
      hermes_feedback: {
        Row: {
          id: string | null;
          accion_id: string | null;
          protocolo_id: string | null;
          resuelta_en_plazo: boolean | null;
          tiempo_resolucion_dias: number | null;
          causa_raiz: string | null;
          accion_realizada: string | null;
          eficacia_score: number | null;
          comentarios: string | null;
          fecha_feedback: string | null;
          usuario_feedback: string | null;
        };
        Insert: {
          id?: string | null;
          accion_id?: string | null;
          protocolo_id?: string | null;
          resuelta_en_plazo?: boolean | null;
          tiempo_resolucion_dias?: number | null;
          causa_raiz?: string | null;
          accion_realizada?: string | null;
          eficacia_score?: number | null;
          comentarios?: string | null;
          fecha_feedback?: string | null;
          usuario_feedback?: string | null;
        };
        Update: {
          id?: string | null;
          accion_id?: string | null;
          protocolo_id?: string | null;
          resuelta_en_plazo?: boolean | null;
          tiempo_resolucion_dias?: number | null;
          causa_raiz?: string | null;
          accion_realizada?: string | null;
          eficacia_score?: number | null;
          comentarios?: string | null;
          fecha_feedback?: string | null;
          usuario_feedback?: string | null;
        };
      };
      periodos: {
        Row: {
          id: string | null;
          nombre: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          cerrado: boolean | null;
          cerrado_at: string | null;
          cerrado_por: string | null;
          observaciones_cierre: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          cerrado?: boolean | null;
          cerrado_at?: string | null;
          cerrado_por?: string | null;
          observaciones_cierre?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          cerrado?: boolean | null;
          cerrado_at?: string | null;
          cerrado_por?: string | null;
          observaciones_cierre?: string | null;
        };
      };
      soi_process_contracts: {
        Row: {
          process_code: string | null;
          process_name: string | null;
          department_owner: string | null;
          canonical_doc_path: string | null;
          doc_id: string | null;
          trigger_type: string | null;
          required_evidence: any | null;
          closure_criteria: any | null;
          responsible_departments: string[] | null;
          task_templates: any | null;
          automation_status: string | null;
          recurrence_count: number | null;
          active: boolean | null;
          metadata: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          process_code?: string | null;
          process_name?: string | null;
          department_owner?: string | null;
          canonical_doc_path?: string | null;
          doc_id?: string | null;
          trigger_type?: string | null;
          required_evidence?: any | null;
          closure_criteria?: any | null;
          responsible_departments?: string[] | null;
          task_templates?: any | null;
          automation_status?: string | null;
          recurrence_count?: number | null;
          active?: boolean | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          process_code?: string | null;
          process_name?: string | null;
          department_owner?: string | null;
          canonical_doc_path?: string | null;
          doc_id?: string | null;
          trigger_type?: string | null;
          required_evidence?: any | null;
          closure_criteria?: any | null;
          responsible_departments?: string[] | null;
          task_templates?: any | null;
          automation_status?: string | null;
          recurrence_count?: number | null;
          active?: boolean | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      cobertura_alumno_objetivo: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          objetivo_id: string | null;
          plan_id: string | null;
          maestro_id: string | null;
          fecha: string | null;
          confirmado: boolean | null;
          nivel: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          objetivo_id?: string | null;
          plan_id?: string | null;
          maestro_id?: string | null;
          fecha?: string | null;
          confirmado?: boolean | null;
          nivel?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          objetivo_id?: string | null;
          plan_id?: string | null;
          maestro_id?: string | null;
          fecha?: string | null;
          confirmado?: boolean | null;
          nivel?: string | null;
          created_at?: string | null;
        };
      };
      registros_pendientes: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          sesion_clase_id: string | null;
          tipo: string | null;
          prioridad: string | null;
          estado: string | null;
          fecha_limite: string | null;
          mensaje: string | null;
          deep_link: string | null;
          created_at: string | null;
          updated_at: string | null;
          resuelto_at: string | null;
          last_notified_at: string | null;
          notif_count: number | null;
          notification_state: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          sesion_clase_id?: string | null;
          tipo?: string | null;
          prioridad?: string | null;
          estado?: string | null;
          fecha_limite?: string | null;
          mensaje?: string | null;
          deep_link?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          resuelto_at?: string | null;
          last_notified_at?: string | null;
          notif_count?: number | null;
          notification_state?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          sesion_clase_id?: string | null;
          tipo?: string | null;
          prioridad?: string | null;
          estado?: string | null;
          fecha_limite?: string | null;
          mensaje?: string | null;
          deep_link?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          resuelto_at?: string | null;
          last_notified_at?: string | null;
          notif_count?: number | null;
          notification_state?: string | null;
        };
      };
      clases_emergentes: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          fecha: string | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          clase_id: string | null;
          nombre_clase: string | null;
          motivo: string | null;
          contenido: string | null;
          observaciones: string | null;
          created_at: string | null;
          salon: string | null;
          grupo: string | null;
          instrumento: string | null;
          tipo: string | null;
          estado: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          fecha?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          clase_id?: string | null;
          nombre_clase?: string | null;
          motivo?: string | null;
          contenido?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          salon?: string | null;
          grupo?: string | null;
          instrumento?: string | null;
          tipo?: string | null;
          estado?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          fecha?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          clase_id?: string | null;
          nombre_clase?: string | null;
          motivo?: string | null;
          contenido?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          salon?: string | null;
          grupo?: string | null;
          instrumento?: string | null;
          tipo?: string | null;
          estado?: string | null;
        };
      };
      asistencia_maestros: {
        Row: {
          id: string | null;
          sesion_clase_id: string | null;
          maestro_id: string | null;
          clase_id: string | null;
          periodo_id: string | null;
          fecha: string | null;
          estado: string | null;
          ausencia_id: string | null;
          suplente_id: string | null;
          motivo: string | null;
          observaciones: string | null;
          registrado_por: string | null;
          marked_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          sesion_clase_id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          periodo_id?: string | null;
          fecha?: string | null;
          estado?: string | null;
          ausencia_id?: string | null;
          suplente_id?: string | null;
          motivo?: string | null;
          observaciones?: string | null;
          registrado_por?: string | null;
          marked_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          sesion_clase_id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          periodo_id?: string | null;
          fecha?: string | null;
          estado?: string | null;
          ausencia_id?: string | null;
          suplente_id?: string | null;
          motivo?: string | null;
          observaciones?: string | null;
          registrado_por?: string | null;
          marked_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      wallet_movimientos: {
        Row: {
          id: string | null;
          familia_id: string | null;
          tipo: string | null;
          monto_centavos: number | null;
          origen: string | null;
          referencia_id: string | null;
          descripcion: string | null;
          saldo_resultante_centavos: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          tipo?: string | null;
          monto_centavos?: number | null;
          origen?: string | null;
          referencia_id?: string | null;
          descripcion?: string | null;
          saldo_resultante_centavos?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          tipo?: string | null;
          monto_centavos?: number | null;
          origen?: string | null;
          referencia_id?: string | null;
          descripcion?: string | null;
          saldo_resultante_centavos?: number | null;
          created_at?: string | null;
        };
      };
      document_batches: {
        Row: {
          id: string | null;
          tipo: string | null;
          titulo: string | null;
          grupo_tipo: string | null;
          grupo_id: string | null;
          grupo_nombre: string | null;
          actividad_nombre: string | null;
          fecha_actividad: string | null;
          lugar_actividad: string | null;
          total_alumnos: number | null;
          total_generados: number | null;
          total_con_advertencias: number | null;
          total_excluidos: number | null;
          estado: string | null;
          generado_por: string | null;
          created_at: string | null;
          generated_at: string | null;
        };
        Insert: {
          id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          grupo_tipo?: string | null;
          grupo_id?: string | null;
          grupo_nombre?: string | null;
          actividad_nombre?: string | null;
          fecha_actividad?: string | null;
          lugar_actividad?: string | null;
          total_alumnos?: number | null;
          total_generados?: number | null;
          total_con_advertencias?: number | null;
          total_excluidos?: number | null;
          estado?: string | null;
          generado_por?: string | null;
          created_at?: string | null;
          generated_at?: string | null;
        };
        Update: {
          id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          grupo_tipo?: string | null;
          grupo_id?: string | null;
          grupo_nombre?: string | null;
          actividad_nombre?: string | null;
          fecha_actividad?: string | null;
          lugar_actividad?: string | null;
          total_alumnos?: number | null;
          total_generados?: number | null;
          total_con_advertencias?: number | null;
          total_excluidos?: number | null;
          estado?: string | null;
          generado_por?: string | null;
          created_at?: string | null;
          generated_at?: string | null;
        };
      };
      clase_acceso_temporal: {
        Row: {
          id: string | null;
          clase_id: string | null;
          maestro_suplente_id: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          activo: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          clase_id?: string | null;
          maestro_suplente_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          clase_id?: string | null;
          maestro_suplente_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
      };
      ausencias: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          fecha_ausencia: string | null;
          motivo: string | null;
          reemplazo_maestro_id: string | null;
          clase_alternativa: string | null;
          notificacion_enviada: boolean | null;
          estado: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          fecha_ausencia?: string | null;
          motivo?: string | null;
          reemplazo_maestro_id?: string | null;
          clase_alternativa?: string | null;
          notificacion_enviada?: boolean | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          fecha_ausencia?: string | null;
          motivo?: string | null;
          reemplazo_maestro_id?: string | null;
          clase_alternativa?: string | null;
          notificacion_enviada?: boolean | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      tareas_caja: {
        Row: {
          id: string | null;
          titulo: string | null;
          descripcion: string | null;
          tipo: string | null;
          asignado_a: string | null;
          familia_id: string | null;
          alumno_id: string | null;
          referencia_id: string | null;
          estado: string | null;
          prioridad: string | null;
          fecha_vencimiento: string | null;
          recurrente: boolean | null;
          patron_recurrencia: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          tipo?: string | null;
          asignado_a?: string | null;
          familia_id?: string | null;
          alumno_id?: string | null;
          referencia_id?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          fecha_vencimiento?: string | null;
          recurrente?: boolean | null;
          patron_recurrencia?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          tipo?: string | null;
          asignado_a?: string | null;
          familia_id?: string | null;
          alumno_id?: string | null;
          referencia_id?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          fecha_vencimiento?: string | null;
          recurrente?: boolean | null;
          patron_recurrencia?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_estadisticas_periodo: {
        Row: {
          periodo_id: string | null;
          periodo_nombre: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          activo: boolean | null;
          alumnos_activos: number | null;
          alumnos_con_asistencia: number | null;
          total_registros_asistencia: number | null;
          tasa_asistencia_periodo: number | null;
          alumnos_evaluados: number | null;
          total_evaluaciones: number | null;
          promedio_calificacion_periodo: number | null;
          obs_abiertas: number | null;
          obs_resueltas: number | null;
          alertas_alta_activas: number | null;
          promedio_estrellas: number | null;
          total_evaluaciones_estrellas: number | null;
          promedio_integrado: number | null;
        };
        Insert: {
          periodo_id?: string | null;
          periodo_nombre?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          alumnos_activos?: number | null;
          alumnos_con_asistencia?: number | null;
          total_registros_asistencia?: number | null;
          tasa_asistencia_periodo?: number | null;
          alumnos_evaluados?: number | null;
          total_evaluaciones?: number | null;
          promedio_calificacion_periodo?: number | null;
          obs_abiertas?: number | null;
          obs_resueltas?: number | null;
          alertas_alta_activas?: number | null;
          promedio_estrellas?: number | null;
          total_evaluaciones_estrellas?: number | null;
          promedio_integrado?: number | null;
        };
        Update: {
          periodo_id?: string | null;
          periodo_nombre?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          alumnos_activos?: number | null;
          alumnos_con_asistencia?: number | null;
          total_registros_asistencia?: number | null;
          tasa_asistencia_periodo?: number | null;
          alumnos_evaluados?: number | null;
          total_evaluaciones?: number | null;
          promedio_calificacion_periodo?: number | null;
          obs_abiertas?: number | null;
          obs_resueltas?: number | null;
          alertas_alta_activas?: number | null;
          promedio_estrellas?: number | null;
          total_evaluaciones_estrellas?: number | null;
          promedio_integrado?: number | null;
        };
      };
      plantillas_planificacion: {
        Row: {
          id: string | null;
          nombre: string | null;
          objetivos: string | null;
          contenido: string | null;
          recursos: string | null;
          evaluacion_metodo: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          clase_id: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          objetivos?: string | null;
          contenido?: string | null;
          recursos?: string | null;
          evaluacion_metodo?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          clase_id?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          objetivos?: string | null;
          contenido?: string | null;
          recursos?: string | null;
          evaluacion_metodo?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          clase_id?: string | null;
        };
      };
      levels: {
        Row: {
          id: string | null;
          block_id: string | null;
          route_version_id: string | null;
          level_number: number | null;
          name: string | null;
          main_objective: string | null;
          suggested_duration_value: number | null;
          suggested_duration_unit: string | null;
          is_flexible_duration: boolean | null;
          target_work: any | null;
          unlock_criteria: any | null;
          order_index: number | null;
        };
        Insert: {
          id?: string | null;
          block_id?: string | null;
          route_version_id?: string | null;
          level_number?: number | null;
          name?: string | null;
          main_objective?: string | null;
          suggested_duration_value?: number | null;
          suggested_duration_unit?: string | null;
          is_flexible_duration?: boolean | null;
          target_work?: any | null;
          unlock_criteria?: any | null;
          order_index?: number | null;
        };
        Update: {
          id?: string | null;
          block_id?: string | null;
          route_version_id?: string | null;
          level_number?: number | null;
          name?: string | null;
          main_objective?: string | null;
          suggested_duration_value?: number | null;
          suggested_duration_unit?: string | null;
          is_flexible_duration?: boolean | null;
          target_work?: any | null;
          unlock_criteria?: any | null;
          order_index?: number | null;
        };
      };
      app_users: {
        Row: {
          id: string | null;
          role: string | null;
          jurado_id: string | null;
          display_name: string | null;
          created_at: string | null;
          email: string | null;
        };
        Insert: {
          id?: string | null;
          role?: string | null;
          jurado_id?: string | null;
          display_name?: string | null;
          created_at?: string | null;
          email?: string | null;
        };
        Update: {
          id?: string | null;
          role?: string | null;
          jurado_id?: string | null;
          display_name?: string | null;
          created_at?: string | null;
          email?: string | null;
        };
      };
      seguimiento_reglas: {
        Row: {
          id: string | null;
          nombre: string | null;
          tipo: string | null;
          descripcion: string | null;
          config: any | null;
          activo: boolean | null;
          prioridad: number | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          descripcion?: string | null;
          config?: any | null;
          activo?: boolean | null;
          prioridad?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          descripcion?: string | null;
          config?: any | null;
          activo?: boolean | null;
          prioridad?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      hilos_mensajes: {
        Row: {
          id: string | null;
          titulo: string | null;
          tema: string | null;
          departamentos_involucrados: string[] | null;
          creado_por: string | null;
          resuelto: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          titulo?: string | null;
          tema?: string | null;
          departamentos_involucrados?: string[] | null;
          creado_por?: string | null;
          resuelto?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          titulo?: string | null;
          tema?: string | null;
          departamentos_involucrados?: string[] | null;
          creado_por?: string | null;
          resuelto?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_stock_bajo: {
        Row: {
          id: string | null;
          nombre: string | null;
          categoria: string | null;
          descripcion: string | null;
          stock_actual: number | null;
          stock_minimo: number | null;
          unidades_faltantes: number | null;
          precio_unitario: number | null;
          links_externos: any | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          categoria?: string | null;
          descripcion?: string | null;
          stock_actual?: number | null;
          stock_minimo?: number | null;
          unidades_faltantes?: number | null;
          precio_unitario?: number | null;
          links_externos?: any | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          categoria?: string | null;
          descripcion?: string | null;
          stock_actual?: number | null;
          stock_minimo?: number | null;
          unidades_faltantes?: number | null;
          precio_unitario?: number | null;
          links_externos?: any | null;
        };
      };
      rutas_contenido: {
        Row: {
          id: string | null;
          instrumento: string | null;
          nivel: string | null;
          nombre: string | null;
          tipo: string | null;
          estado: string | null;
          descripcion: string | null;
          ruta_base_id: string | null;
          duracion_semanas: number | null;
          creada_por: string | null;
          aprobada_por: string | null;
          fecha_aprobacion: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          instrumento?: string | null;
          nivel?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          estado?: string | null;
          descripcion?: string | null;
          ruta_base_id?: string | null;
          duracion_semanas?: number | null;
          creada_por?: string | null;
          aprobada_por?: string | null;
          fecha_aprobacion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          instrumento?: string | null;
          nivel?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          estado?: string | null;
          descripcion?: string | null;
          ruta_base_id?: string | null;
          duracion_semanas?: number | null;
          creada_por?: string | null;
          aprobada_por?: string | null;
          fecha_aprobacion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      alertas_log: {
        Row: {
          id: string | null;
          tipo: string | null;
          canal: string | null;
          destinatario: string | null;
          contenido: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          tipo?: string | null;
          canal?: string | null;
          destinatario?: string | null;
          contenido?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          tipo?: string | null;
          canal?: string | null;
          destinatario?: string | null;
          contenido?: string | null;
          created_at?: string | null;
        };
      };
      node_resources: {
        Row: {
          id: string | null;
          node_id: string | null;
          resource_type: string | null;
          title: string | null;
          url: string | null;
          content: string | null;
          order_index: number | null;
          metadata: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          node_id?: string | null;
          resource_type?: string | null;
          title?: string | null;
          url?: string | null;
          content?: string | null;
          order_index?: number | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          node_id?: string | null;
          resource_type?: string | null;
          title?: string | null;
          url?: string | null;
          content?: string | null;
          order_index?: number | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      clase_mapa_objetivos: {
        Row: {
          id: string | null;
          clase_id: string | null;
          level_id: string | null;
          origen_node_id: string | null;
          origen_objetivo_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          orden_objetivo: number | null;
          order_index: number | null;
          archived_at: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
          estado_revision: string | null;
        };
        Insert: {
          id?: string | null;
          clase_id?: string | null;
          level_id?: string | null;
          origen_node_id?: string | null;
          origen_objetivo_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden_objetivo?: number | null;
          order_index?: number | null;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado_revision?: string | null;
        };
        Update: {
          id?: string | null;
          clase_id?: string | null;
          level_id?: string | null;
          origen_node_id?: string | null;
          origen_objetivo_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden_objetivo?: number | null;
          order_index?: number | null;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado_revision?: string | null;
        };
      };
      instituciones: {
        Row: {
          id: string | null;
          nombre: string | null;
          tipo: string | null;
          sector: string | null;
          contacto_nombre: string | null;
          cargo: string | null;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          sitio_web: string | null;
          redes: any | null;
          estado: string | null;
          notas: string | null;
          ultima_gestion: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          sector?: string | null;
          contacto_nombre?: string | null;
          cargo?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          sitio_web?: string | null;
          redes?: any | null;
          estado?: string | null;
          notas?: string | null;
          ultima_gestion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          sector?: string | null;
          contacto_nombre?: string | null;
          cargo?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          sitio_web?: string | null;
          redes?: any | null;
          estado?: string | null;
          notas?: string | null;
          ultima_gestion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      tareas_institucionales: {
        Row: {
          id: string | null;
          event_id: string | null;
          titulo: string | null;
          descripcion: string | null;
          departamento: string | null;
          asignado_a: string | null;
          estado: string | null;
          prioridad: string | null;
          fecha_vencimiento: string | null;
          checklist: any | null;
          feedback: string | null;
          created_at: string | null;
          updated_at: string | null;
          minuta_id: string | null;
          documentos_adjuntos: any | null;
          entidad_tipo: string | null;
          entidad_id: string | null;
          entidad_label: string | null;
          correlation_id: string | null;
          updated_by: string | null;
          updated_by_nombre: string | null;
          process_code: string | null;
          dependencia_tarea_id: string | null;
          depende_de_tarea_id: string | null;
          t_minus_dias: number | null;
          source_event_id: string | null;
        };
        Insert: {
          id?: string | null;
          event_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          departamento?: string | null;
          asignado_a?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          fecha_vencimiento?: string | null;
          checklist?: any | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          minuta_id?: string | null;
          documentos_adjuntos?: any | null;
          entidad_tipo?: string | null;
          entidad_id?: string | null;
          entidad_label?: string | null;
          correlation_id?: string | null;
          updated_by?: string | null;
          updated_by_nombre?: string | null;
          process_code?: string | null;
          dependencia_tarea_id?: string | null;
          depende_de_tarea_id?: string | null;
          t_minus_dias?: number | null;
          source_event_id?: string | null;
        };
        Update: {
          id?: string | null;
          event_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          departamento?: string | null;
          asignado_a?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          fecha_vencimiento?: string | null;
          checklist?: any | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          minuta_id?: string | null;
          documentos_adjuntos?: any | null;
          entidad_tipo?: string | null;
          entidad_id?: string | null;
          entidad_label?: string | null;
          correlation_id?: string | null;
          updated_by?: string | null;
          updated_by_nombre?: string | null;
          process_code?: string | null;
          dependencia_tarea_id?: string | null;
          depende_de_tarea_id?: string | null;
          t_minus_dias?: number | null;
          source_event_id?: string | null;
        };
      };
      alumnos_programas: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          programa_id: string | null;
          fecha_inscripcion: string | null;
          activo: boolean | null;
          created_at: string | null;
          periodo_id: string | null;
          calificacion: number | null;
          estado: string | null;
          fuente: string | null;
          requiere_verificacion: boolean | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          programa_id?: string | null;
          fecha_inscripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          periodo_id?: string | null;
          calificacion?: number | null;
          estado?: string | null;
          fuente?: string | null;
          requiere_verificacion?: boolean | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          programa_id?: string | null;
          fecha_inscripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          periodo_id?: string | null;
          calificacion?: number | null;
          estado?: string | null;
          fuente?: string | null;
          requiere_verificacion?: boolean | null;
        };
      };
      compromisos_pago: {
        Row: {
          id: string | null;
          familia_id: string | null;
          representante_id: string | null;
          monto_comprometido_centavos: number | null;
          fecha_comprometida: string | null;
          cumplido: boolean | null;
          fecha_cumplimiento: string | null;
          origen_notificacion_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          representante_id?: string | null;
          monto_comprometido_centavos?: number | null;
          fecha_comprometida?: string | null;
          cumplido?: boolean | null;
          fecha_cumplimiento?: string | null;
          origen_notificacion_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          representante_id?: string | null;
          monto_comprometido_centavos?: number | null;
          fecha_comprometida?: string | null;
          cumplido?: boolean | null;
          fecha_cumplimiento?: string | null;
          origen_notificacion_id?: string | null;
          created_at?: string | null;
        };
      };
      inventario_activos: {
        Row: {
          id: string | null;
          tipo_instrumento: string | null;
          marca: string | null;
          modelo: string | null;
          numero_serie: string | null;
          codigo_inventario: string | null;
          estado_conservacion: string | null;
          estado_uso: string | null;
          ubicacion: string | null;
          activo: boolean | null;
          notas: string | null;
          created_at: string | null;
          updated_at: string | null;
          fecha_adquisicion: string | null;
          valor_adquisicion: number | null;
          fecha_baja: string | null;
          motivo_baja: string | null;
          foto_url: string | null;
          proveedor: string | null;
          familia: string | null;
          nombre_normalizado: string | null;
          tamano: string | null;
          cantidad: number | null;
          unidad: string | null;
          estado_asignacion_original: string | null;
          asignado_a_texto: string | null;
          requiere_mantenimiento: boolean | null;
          tiene_arco: boolean | null;
          tiene_estuche: boolean | null;
          tiene_funda: boolean | null;
          tiene_hombrera_almohadilla: boolean | null;
          faltantes_detectados: string | null;
          donante_inferido: string | null;
          codigo_donante: string | null;
          fuente_importacion: string | null;
          numero_original: string | null;
          fila_origen_csv: number | null;
          revisar: boolean | null;
          alertas_calidad: string | null;
          import_metadata: any | null;
        };
        Insert: {
          id?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          numero_serie?: string | null;
          codigo_inventario?: string | null;
          estado_conservacion?: string | null;
          estado_uso?: string | null;
          ubicacion?: string | null;
          activo?: boolean | null;
          notas?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          fecha_adquisicion?: string | null;
          valor_adquisicion?: number | null;
          fecha_baja?: string | null;
          motivo_baja?: string | null;
          foto_url?: string | null;
          proveedor?: string | null;
          familia?: string | null;
          nombre_normalizado?: string | null;
          tamano?: string | null;
          cantidad?: number | null;
          unidad?: string | null;
          estado_asignacion_original?: string | null;
          asignado_a_texto?: string | null;
          requiere_mantenimiento?: boolean | null;
          tiene_arco?: boolean | null;
          tiene_estuche?: boolean | null;
          tiene_funda?: boolean | null;
          tiene_hombrera_almohadilla?: boolean | null;
          faltantes_detectados?: string | null;
          donante_inferido?: string | null;
          codigo_donante?: string | null;
          fuente_importacion?: string | null;
          numero_original?: string | null;
          fila_origen_csv?: number | null;
          revisar?: boolean | null;
          alertas_calidad?: string | null;
          import_metadata?: any | null;
        };
        Update: {
          id?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          numero_serie?: string | null;
          codigo_inventario?: string | null;
          estado_conservacion?: string | null;
          estado_uso?: string | null;
          ubicacion?: string | null;
          activo?: boolean | null;
          notas?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          fecha_adquisicion?: string | null;
          valor_adquisicion?: number | null;
          fecha_baja?: string | null;
          motivo_baja?: string | null;
          foto_url?: string | null;
          proveedor?: string | null;
          familia?: string | null;
          nombre_normalizado?: string | null;
          tamano?: string | null;
          cantidad?: number | null;
          unidad?: string | null;
          estado_asignacion_original?: string | null;
          asignado_a_texto?: string | null;
          requiere_mantenimiento?: boolean | null;
          tiene_arco?: boolean | null;
          tiene_estuche?: boolean | null;
          tiene_funda?: boolean | null;
          tiene_hombrera_almohadilla?: boolean | null;
          faltantes_detectados?: string | null;
          donante_inferido?: string | null;
          codigo_donante?: string | null;
          fuente_importacion?: string | null;
          numero_original?: string | null;
          fila_origen_csv?: number | null;
          revisar?: boolean | null;
          alertas_calidad?: string | null;
          import_metadata?: any | null;
        };
      };
      solicitudes_permisos: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          tipos: any | null;
          estado: string | null;
          creado_en: string | null;
          aprobado_en: string | null;
          aprobado_por: string | null;
          solicita_alumnos: boolean | null;
          solicita_clases: boolean | null;
          motivo_rechazo: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          tipos?: any | null;
          estado?: string | null;
          creado_en?: string | null;
          aprobado_en?: string | null;
          aprobado_por?: string | null;
          solicita_alumnos?: boolean | null;
          solicita_clases?: boolean | null;
          motivo_rechazo?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          tipos?: any | null;
          estado?: string | null;
          creado_en?: string | null;
          aprobado_en?: string | null;
          aprobado_por?: string | null;
          solicita_alumnos?: boolean | null;
          solicita_clases?: boolean | null;
          motivo_rechazo?: string | null;
        };
      };
      ausencias_clases_afectadas: {
        Row: {
          id: string | null;
          ausencia_id: string | null;
          clase_id: string | null;
          actividad_reemplazo: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          ausencia_id?: string | null;
          clase_id?: string | null;
          actividad_reemplazo?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          ausencia_id?: string | null;
          clase_id?: string | null;
          actividad_reemplazo?: string | null;
          created_at?: string | null;
        };
      };
      vw_ia_maestros: {
        Row: {
          id: string | null;
          nombre: string | null;
          especialidad: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          especialidad?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          especialidad?: string | null;
        };
      };
      alumnos_ejercicios: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          ejercicio_id: string | null;
          estado: string | null;
          puntaje_actual: number | null;
          mejor_puntaje: number | null;
          intentos: number | null;
          aprobado: boolean | null;
          fecha_ultimo_intento: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          ejercicio_id?: string | null;
          estado?: string | null;
          puntaje_actual?: number | null;
          mejor_puntaje?: number | null;
          intentos?: number | null;
          aprobado?: boolean | null;
          fecha_ultimo_intento?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          ejercicio_id?: string | null;
          estado?: string | null;
          puntaje_actual?: number | null;
          mejor_puntaje?: number | null;
          intentos?: number | null;
          aprobado?: boolean | null;
          fecha_ultimo_intento?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      observaciones_alumnos: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          maestro_id: string | null;
          clase_id: string | null;
          sesion_clase_id: string | null;
          tipo: string | null;
          observacion: string | null;
          requiere_seguimiento: boolean | null;
          fecha: string | null;
          created_at: string | null;
          updated_at: string | null;
          titulo: string | null;
          descripcion: string | null;
          prioridad: string | null;
          estado: string | null;
          fecha_observacion: string | null;
          seguimiento_fecha: string | null;
          seguimiento_observacion: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          sesion_clase_id?: string | null;
          tipo?: string | null;
          observacion?: string | null;
          requiere_seguimiento?: boolean | null;
          fecha?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          prioridad?: string | null;
          estado?: string | null;
          fecha_observacion?: string | null;
          seguimiento_fecha?: string | null;
          seguimiento_observacion?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          sesion_clase_id?: string | null;
          tipo?: string | null;
          observacion?: string | null;
          requiere_seguimiento?: boolean | null;
          fecha?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          prioridad?: string | null;
          estado?: string | null;
          fecha_observacion?: string | null;
          seguimiento_fecha?: string | null;
          seguimiento_observacion?: string | null;
        };
      };
      vw_clase_objetivo_estrellas: {
        Row: {
          objetivo_id: string | null;
          clase_id: string | null;
          total_indicadores: number | null;
          indicadores_evaluados: number | null;
          pct_avance: number | null;
          alumnos_superadores: number | null;
          promedio_superadores: number | null;
          estrellas: number | null;
          estado_visual: string | null;
        };
        Insert: {
          objetivo_id?: string | null;
          clase_id?: string | null;
          total_indicadores?: number | null;
          indicadores_evaluados?: number | null;
          pct_avance?: number | null;
          alumnos_superadores?: number | null;
          promedio_superadores?: number | null;
          estrellas?: number | null;
          estado_visual?: string | null;
        };
        Update: {
          objetivo_id?: string | null;
          clase_id?: string | null;
          total_indicadores?: number | null;
          indicadores_evaluados?: number | null;
          pct_avance?: number | null;
          alumnos_superadores?: number | null;
          promedio_superadores?: number | null;
          estrellas?: number | null;
          estado_visual?: string | null;
        };
      };
      academic_plans: {
        Row: {
          id: string | null;
          student_id: string | null;
          programa_id: string | null;
          status: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          student_id?: string | null;
          programa_id?: string | null;
          status?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          student_id?: string | null;
          programa_id?: string | null;
          status?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      permisos_maestros: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          puede_registrar_alumnos: boolean | null;
          puede_inscribir_clases: boolean | null;
          concedido_por: string | null;
          creado_en: string | null;
          actualizado_en: string | null;
          permisos: string[] | null;
          solicitudes: string[] | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          puede_crear_clases: boolean | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          puede_registrar_alumnos?: boolean | null;
          puede_inscribir_clases?: boolean | null;
          concedido_por?: string | null;
          creado_en?: string | null;
          actualizado_en?: string | null;
          permisos?: string[] | null;
          solicitudes?: string[] | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          puede_crear_clases?: boolean | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          puede_registrar_alumnos?: boolean | null;
          puede_inscribir_clases?: boolean | null;
          concedido_por?: string | null;
          creado_en?: string | null;
          actualizado_en?: string | null;
          permisos?: string[] | null;
          solicitudes?: string[] | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          puede_crear_clases?: boolean | null;
        };
      };
      sim_actores: {
        Row: {
          id: string | null;
          run_id: string | null;
          tipo: string | null;
          nombre_ficticio: string | null;
          instrumento: string | null;
          estado_pago: string | null;
          metadata: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          run_id?: string | null;
          tipo?: string | null;
          nombre_ficticio?: string | null;
          instrumento?: string | null;
          estado_pago?: string | null;
          metadata?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          run_id?: string | null;
          tipo?: string | null;
          nombre_ficticio?: string | null;
          instrumento?: string | null;
          estado_pago?: string | null;
          metadata?: any | null;
          created_at?: string | null;
        };
      };
      alumnos_logros: {
        Row: {
          alumno_id: string | null;
          logro_id: string | null;
          obtenido_en: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          logro_id?: string | null;
          obtenido_en?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          logro_id?: string | null;
          obtenido_en?: string | null;
        };
      };
      maestros: {
        Row: {
          id: string | null;
          user_id: string | null;
          nombre_completo: string | null;
          especialidad: string | null;
          tipo_maestro: string | null;
          habilidades: string[] | null;
          disponibilidad: any | null;
          tlf: string | null;
          correo: string | null;
          resena: string | null;
          puede_ser_suplente: boolean | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          especialidades: string[] | null;
          es_admin: boolean | null;
        };
        Insert: {
          id?: string | null;
          user_id?: string | null;
          nombre_completo?: string | null;
          especialidad?: string | null;
          tipo_maestro?: string | null;
          habilidades?: string[] | null;
          disponibilidad?: any | null;
          tlf?: string | null;
          correo?: string | null;
          resena?: string | null;
          puede_ser_suplente?: boolean | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          especialidades?: string[] | null;
          es_admin?: boolean | null;
        };
        Update: {
          id?: string | null;
          user_id?: string | null;
          nombre_completo?: string | null;
          especialidad?: string | null;
          tipo_maestro?: string | null;
          habilidades?: string[] | null;
          disponibilidad?: any | null;
          tlf?: string | null;
          correo?: string | null;
          resena?: string | null;
          puede_ser_suplente?: boolean | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          especialidades?: string[] | null;
          es_admin?: boolean | null;
        };
      };
      maestro_tareas: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          alumno_id: string | null;
          sesion_id: string | null;
          tarea: string | null;
          fecha_recordatorio: string | null;
          completada: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          alumno_id?: string | null;
          sesion_id?: string | null;
          tarea?: string | null;
          fecha_recordatorio?: string | null;
          completada?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          alumno_id?: string | null;
          sesion_id?: string | null;
          tarea?: string | null;
          fecha_recordatorio?: string | null;
          completada?: boolean | null;
          created_at?: string | null;
        };
      };
      pulso_score_history: {
        Row: {
          id: string | null;
          score: number | null;
          nivel: string | null;
          asistencia_pct: number | null;
          tareas_tiempo_pct: number | null;
          cobertura_registro_pct: number | null;
          penalizacion_vencidas_pct: number | null;
          metricas_detalle: any | null;
          calculado_at: string | null;
        };
        Insert: {
          id?: string | null;
          score?: number | null;
          nivel?: string | null;
          asistencia_pct?: number | null;
          tareas_tiempo_pct?: number | null;
          cobertura_registro_pct?: number | null;
          penalizacion_vencidas_pct?: number | null;
          metricas_detalle?: any | null;
          calculado_at?: string | null;
        };
        Update: {
          id?: string | null;
          score?: number | null;
          nivel?: string | null;
          asistencia_pct?: number | null;
          tareas_tiempo_pct?: number | null;
          cobertura_registro_pct?: number | null;
          penalizacion_vencidas_pct?: number | null;
          metricas_detalle?: any | null;
          calculado_at?: string | null;
        };
      };
      sim_runs: {
        Row: {
          id: string | null;
          nombre: string | null;
          estado: string | null;
          velocidad: number | null;
          fecha_inicio_virtual: string | null;
          fecha_fin_virtual: string | null;
          fecha_actual_virtual: string | null;
          creado_por: string | null;
          metadata: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          estado?: string | null;
          velocidad?: number | null;
          fecha_inicio_virtual?: string | null;
          fecha_fin_virtual?: string | null;
          fecha_actual_virtual?: string | null;
          creado_por?: string | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          estado?: string | null;
          velocidad?: number | null;
          fecha_inicio_virtual?: string | null;
          fecha_fin_virtual?: string | null;
          fecha_actual_virtual?: string | null;
          creado_por?: string | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      hermes_inbox: {
        Row: {
          id: number | null;
          canal: string | null;
          categoria: string | null;
          summary: string | null;
          raw_ref: string | null;
          processed: boolean | null;
          created_at: string | null;
          telegram_user_id: number | null;
        };
        Insert: {
          id?: number | null;
          canal?: string | null;
          categoria?: string | null;
          summary?: string | null;
          raw_ref?: string | null;
          processed?: boolean | null;
          created_at?: string | null;
          telegram_user_id?: number | null;
        };
        Update: {
          id?: number | null;
          canal?: string | null;
          categoria?: string | null;
          summary?: string | null;
          raw_ref?: string | null;
          processed?: boolean | null;
          created_at?: string | null;
          telegram_user_id?: number | null;
        };
      };
      ausencias_notificaciones: {
        Row: {
          id: string | null;
          ausencia_id: string | null;
          director_id: string | null;
          tipo: string | null;
          estado: string | null;
          created_at: string | null;
          leida_en: string | null;
          actuado_en: string | null;
        };
        Insert: {
          id?: string | null;
          ausencia_id?: string | null;
          director_id?: string | null;
          tipo?: string | null;
          estado?: string | null;
          created_at?: string | null;
          leida_en?: string | null;
          actuado_en?: string | null;
        };
        Update: {
          id?: string | null;
          ausencia_id?: string | null;
          director_id?: string | null;
          tipo?: string | null;
          estado?: string | null;
          created_at?: string | null;
          leida_en?: string | null;
          actuado_en?: string | null;
        };
      };
      vw_activos_ociosos: {
        Row: {
          comodato_id: string | null;
          activo_id: string | null;
          codigo_inventario: string | null;
          tipo_instrumento: string | null;
          marca: string | null;
          modelo: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          alumno_activo: boolean | null;
          fecha_entrega: string | null;
          fecha_vencimiento: string | null;
          dias_prestado: number | null;
          dias_hasta_vencimiento: number | null;
          alerta_tipo: string | null;
        };
        Insert: {
          comodato_id?: string | null;
          activo_id?: string | null;
          codigo_inventario?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          alumno_activo?: boolean | null;
          fecha_entrega?: string | null;
          fecha_vencimiento?: string | null;
          dias_prestado?: number | null;
          dias_hasta_vencimiento?: number | null;
          alerta_tipo?: string | null;
        };
        Update: {
          comodato_id?: string | null;
          activo_id?: string | null;
          codigo_inventario?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          alumno_activo?: boolean | null;
          fecha_entrega?: string | null;
          fecha_vencimiento?: string | null;
          dias_prestado?: number | null;
          dias_hasta_vencimiento?: number | null;
          alerta_tipo?: string | null;
        };
      };
      tarea_comentarios: {
        Row: {
          id: string | null;
          tarea_id: string | null;
          autor_id: string | null;
          autor_nombre: string | null;
          cuerpo: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          tarea_id?: string | null;
          autor_id?: string | null;
          autor_nombre?: string | null;
          cuerpo?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          tarea_id?: string | null;
          autor_id?: string | null;
          autor_nombre?: string | null;
          cuerpo?: string | null;
          created_at?: string | null;
        };
      };
      wallet_config: {
        Row: {
          id: string | null;
          familia_id: string | null;
          modo: string | null;
          saldo_minimo_alerta_centavos: number | null;
          activo: boolean | null;
          status: string | null;
          congelada_en: string | null;
          devuelta_en: string | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          modo?: string | null;
          saldo_minimo_alerta_centavos?: number | null;
          activo?: boolean | null;
          status?: string | null;
          congelada_en?: string | null;
          devuelta_en?: string | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          modo?: string | null;
          saldo_minimo_alerta_centavos?: number | null;
          activo?: boolean | null;
          status?: string | null;
          congelada_en?: string | null;
          devuelta_en?: string | null;
        };
      };
      solicitudes_ausencia: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          fecha_ausencia: string | null;
          motivo: string | null;
          contenido_reemplazo: string | null;
          suplente_id: string | null;
          dinamica_trabajo: string | null;
          estado: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          fecha_ausencia?: string | null;
          motivo?: string | null;
          contenido_reemplazo?: string | null;
          suplente_id?: string | null;
          dinamica_trabajo?: string | null;
          estado?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          fecha_ausencia?: string | null;
          motivo?: string | null;
          contenido_reemplazo?: string | null;
          suplente_id?: string | null;
          dinamica_trabajo?: string | null;
          estado?: string | null;
          created_at?: string | null;
        };
      };
      protocolos: {
        Row: {
          id: string | null;
          nombre: string | null;
          tipo: string | null;
          descripcion: string | null;
          tareas: any | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          descripcion?: string | null;
          tareas?: any | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          descripcion?: string | null;
          tareas?: any | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      lut_movimientos_insumos: {
        Row: {
          id: string | null;
          insumo_id: string | null;
          orden_id: string | null;
          tipo_movimiento: string | null;
          cantidad: number | null;
          costo_unitario: number | null;
          registrado_por: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          insumo_id?: string | null;
          orden_id?: string | null;
          tipo_movimiento?: string | null;
          cantidad?: number | null;
          costo_unitario?: number | null;
          registrado_por?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          insumo_id?: string | null;
          orden_id?: string | null;
          tipo_movimiento?: string | null;
          cantidad?: number | null;
          costo_unitario?: number | null;
          registrado_por?: string | null;
          created_at?: string | null;
        };
      };
      student_case_actions: {
        Row: {
          id: string | null;
          case_id: string | null;
          alumno_id: string | null;
          tipo: string | null;
          titulo: string | null;
          descripcion: string | null;
          resultado: string | null;
          fecha_accion: string | null;
          proxima_accion: string | null;
          proxima_accion_fecha: string | null;
          documento_id: string | null;
          registrado_por: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          case_id?: string | null;
          alumno_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          resultado?: string | null;
          fecha_accion?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          documento_id?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          case_id?: string | null;
          alumno_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          resultado?: string | null;
          fecha_accion?: string | null;
          proxima_accion?: string | null;
          proxima_accion_fecha?: string | null;
          documento_id?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
        };
      };
      conversaciones_whatsapp: {
        Row: {
          id: string | null;
          postulante_id: string | null;
          estado_conversacion: string | null;
          reintentos: number | null;
          jid: string | null;
          ultimo_mensaje_enviado: string | null;
          ultimo_mensaje_recibido: string | null;
          ultima_intencion: string | null;
          fecha_cita_propuesta: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          postulante_id?: string | null;
          estado_conversacion?: string | null;
          reintentos?: number | null;
          jid?: string | null;
          ultimo_mensaje_enviado?: string | null;
          ultimo_mensaje_recibido?: string | null;
          ultima_intencion?: string | null;
          fecha_cita_propuesta?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          postulante_id?: string | null;
          estado_conversacion?: string | null;
          reintentos?: number | null;
          jid?: string | null;
          ultimo_mensaje_enviado?: string | null;
          ultimo_mensaje_recibido?: string | null;
          ultima_intencion?: string | null;
          fecha_cita_propuesta?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sim_config: {
        Row: {
          id: string | null;
          canal: string | null;
          destino: string | null;
          proveedor_llm: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          canal?: string | null;
          destino?: string | null;
          proveedor_llm?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          canal?: string | null;
          destino?: string | null;
          proveedor_llm?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      maestro_indicadores: {
        Row: {
          id: string | null;
          objetivo_id: string | null;
          orden: number | null;
          nombre: string | null;
          criterios_json: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          objetivo_id?: string | null;
          orden?: number | null;
          nombre?: string | null;
          criterios_json?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          objetivo_id?: string | null;
          orden?: number | null;
          nombre?: string | null;
          criterios_json?: any | null;
          created_at?: string | null;
        };
      };
      ausencias_auditoria: {
        Row: {
          id: string | null;
          ausencia_id: string | null;
          actor_id: string | null;
          accion: string | null;
          notas: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          ausencia_id?: string | null;
          actor_id?: string | null;
          accion?: string | null;
          notas?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          ausencia_id?: string | null;
          actor_id?: string | null;
          accion?: string | null;
          notas?: string | null;
          created_at?: string | null;
        };
      };
      indicators: {
        Row: {
          id: string | null;
          node_id: string | null;
          description: string | null;
          minimum_criteria: any | null;
          is_required: boolean | null;
          order_index: number | null;
          nombre: string | null;
          activo: boolean | null;
          objetivo_id: string | null;
        };
        Insert: {
          id?: string | null;
          node_id?: string | null;
          description?: string | null;
          minimum_criteria?: any | null;
          is_required?: boolean | null;
          order_index?: number | null;
          nombre?: string | null;
          activo?: boolean | null;
          objetivo_id?: string | null;
        };
        Update: {
          id?: string | null;
          node_id?: string | null;
          description?: string | null;
          minimum_criteria?: any | null;
          is_required?: boolean | null;
          order_index?: number | null;
          nombre?: string | null;
          activo?: boolean | null;
          objetivo_id?: string | null;
        };
      };
      acm_curriculum_sources: {
        Row: {
          id: string | null;
          title: string | null;
          file_name: string | null;
          file_path: string | null;
          source_type: string | null;
          author: string | null;
          version_label: string | null;
          uploaded_by: string | null;
          uploaded_at: string | null;
          status: string | null;
          raw_text: string | null;
          notes: string | null;
          related_version_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          title?: string | null;
          file_name?: string | null;
          file_path?: string | null;
          source_type?: string | null;
          author?: string | null;
          version_label?: string | null;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
          status?: string | null;
          raw_text?: string | null;
          notes?: string | null;
          related_version_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          title?: string | null;
          file_name?: string | null;
          file_path?: string | null;
          source_type?: string | null;
          author?: string | null;
          version_label?: string | null;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
          status?: string | null;
          raw_text?: string | null;
          notes?: string | null;
          related_version_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      periodo_excepciones: {
        Row: {
          id: string | null;
          periodo_id: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          motivo: string | null;
          tipo: string | null;
          creado_por: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          periodo_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          motivo?: string | null;
          tipo?: string | null;
          creado_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          periodo_id?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          motivo?: string | null;
          tipo?: string | null;
          creado_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      logros: {
        Row: {
          id: string | null;
          nombre: string | null;
          descripcion: string | null;
          criterio: any | null;
          icono: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          criterio?: any | null;
          icono?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          criterio?: any | null;
          icono?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      unidades: {
        Row: {
          id: string | null;
          modulo_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          orden: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          modulo_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          modulo_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      postulantes: {
        Row: {
          id: string | null;
          nombre_completo: string | null;
          fecha_nacimiento: string | null;
          telefono_alumno: string | null;
          correo: string | null;
          nacionalidad: string | null;
          sector_calle_numero: string | null;
          madre_nombre: string | null;
          madre_tlf_whatsapp: string | null;
          padre_nombre: string | null;
          padre_tlf_whatsapp: string | null;
          representante_parentesco: string | null;
          acepta_pago_600: boolean | null;
          autoriza_fotos_redes: boolean | null;
          religion_limita: boolean | null;
          disponibilidad_tiempo: string | null;
          tiene_transporte: boolean | null;
          representantes_apoyan: boolean | null;
          copia_cedula: boolean | null;
          sincronizado_en: string | null;
          created_at: string | null;
          updated_at: string | null;
          estado: string | null;
          alumno_id: string | null;
          fecha_postulacion: string | null;
          fecha_contacto: string | null;
          fecha_cita: string | null;
          notas_seguimiento: string | null;
          instrumento: string | null;
        };
        Insert: {
          id?: string | null;
          nombre_completo?: string | null;
          fecha_nacimiento?: string | null;
          telefono_alumno?: string | null;
          correo?: string | null;
          nacionalidad?: string | null;
          sector_calle_numero?: string | null;
          madre_nombre?: string | null;
          madre_tlf_whatsapp?: string | null;
          padre_nombre?: string | null;
          padre_tlf_whatsapp?: string | null;
          representante_parentesco?: string | null;
          acepta_pago_600?: boolean | null;
          autoriza_fotos_redes?: boolean | null;
          religion_limita?: boolean | null;
          disponibilidad_tiempo?: string | null;
          tiene_transporte?: boolean | null;
          representantes_apoyan?: boolean | null;
          copia_cedula?: boolean | null;
          sincronizado_en?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado?: string | null;
          alumno_id?: string | null;
          fecha_postulacion?: string | null;
          fecha_contacto?: string | null;
          fecha_cita?: string | null;
          notas_seguimiento?: string | null;
          instrumento?: string | null;
        };
        Update: {
          id?: string | null;
          nombre_completo?: string | null;
          fecha_nacimiento?: string | null;
          telefono_alumno?: string | null;
          correo?: string | null;
          nacionalidad?: string | null;
          sector_calle_numero?: string | null;
          madre_nombre?: string | null;
          madre_tlf_whatsapp?: string | null;
          padre_nombre?: string | null;
          padre_tlf_whatsapp?: string | null;
          representante_parentesco?: string | null;
          acepta_pago_600?: boolean | null;
          autoriza_fotos_redes?: boolean | null;
          religion_limita?: boolean | null;
          disponibilidad_tiempo?: string | null;
          tiene_transporte?: boolean | null;
          representantes_apoyan?: boolean | null;
          copia_cedula?: boolean | null;
          sincronizado_en?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado?: string | null;
          alumno_id?: string | null;
          fecha_postulacion?: string | null;
          fecha_contacto?: string | null;
          fecha_cita?: string | null;
          notas_seguimiento?: string | null;
          instrumento?: string | null;
        };
      };
      alumno_clases: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          clase_id: string | null;
          fecha_inscripcion: string | null;
          activo: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          fecha_inscripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          clase_id?: string | null;
          fecha_inscripcion?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
      };
      v_semaforo_contenidos: {
        Row: {
          alumno_id: string | null;
          clase_id: string | null;
          objetivo_id: string | null;
          total_registros: number | null;
          bien_count: number | null;
          regular_count: number | null;
          mal_count: number | null;
          semaforo: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          clase_id?: string | null;
          objetivo_id?: string | null;
          total_registros?: number | null;
          bien_count?: number | null;
          regular_count?: number | null;
          mal_count?: number | null;
          semaforo?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          clase_id?: string | null;
          objetivo_id?: string | null;
          total_registros?: number | null;
          bien_count?: number | null;
          regular_count?: number | null;
          mal_count?: number | null;
          semaforo?: string | null;
        };
      };
      niveles: {
        Row: {
          id: string | null;
          programa_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          orden: number | null;
          duracion_estimada_meses: number | null;
          criterios_promocion: any | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          programa_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          duracion_estimada_meses?: number | null;
          criterios_promocion?: any | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          programa_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          orden?: number | null;
          duracion_estimada_meses?: number | null;
          criterios_promocion?: any | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      accesorios: {
        Row: {
          id: string | null;
          nombre: string | null;
          categoria: string | null;
          descripcion: string | null;
          stock_actual: number | null;
          stock_minimo: number | null;
          precio_unitario: number | null;
          activo: boolean | null;
          links_externos: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          categoria?: string | null;
          descripcion?: string | null;
          stock_actual?: number | null;
          stock_minimo?: number | null;
          precio_unitario?: number | null;
          activo?: boolean | null;
          links_externos?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          categoria?: string | null;
          descripcion?: string | null;
          stock_actual?: number | null;
          stock_minimo?: number | null;
          precio_unitario?: number | null;
          activo?: boolean | null;
          links_externos?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      clase_horarios: {
        Row: {
          id: string | null;
          clase_id: string | null;
          dia: string | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          salon_id: string | null;
          created_at: string | null;
          maestro_id: string | null;
        };
        Insert: {
          id?: string | null;
          clase_id?: string | null;
          dia?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          salon_id?: string | null;
          created_at?: string | null;
          maestro_id?: string | null;
        };
        Update: {
          id?: string | null;
          clase_id?: string | null;
          dia?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          salon_id?: string | null;
          created_at?: string | null;
          maestro_id?: string | null;
        };
      };
      soi_event_bus: {
        Row: {
          id: string | null;
          tipo: string | null;
          origen: string | null;
          payload: any | null;
          procesado: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          tipo?: string | null;
          origen?: string | null;
          payload?: any | null;
          procesado?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          tipo?: string | null;
          origen?: string | null;
          payload?: any | null;
          procesado?: boolean | null;
          created_at?: string | null;
        };
      };
      acm_curriculum_versions: {
        Row: {
          id: string | null;
          name: string | null;
          description: string | null;
          source_id: string | null;
          program_id: string | null;
          status: string | null;
          is_active: boolean | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          name?: string | null;
          description?: string | null;
          source_id?: string | null;
          program_id?: string | null;
          status?: string | null;
          is_active?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          description?: string | null;
          source_id?: string | null;
          program_id?: string | null;
          status?: string | null;
          is_active?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      alumnos_modulos: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          modulo_id: string | null;
          estado: string | null;
          porcentaje_completado: number | null;
          fecha_inicio: string | null;
          fecha_completado: string | null;
          intentos_totales: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          modulo_id?: string | null;
          estado?: string | null;
          porcentaje_completado?: number | null;
          fecha_inicio?: string | null;
          fecha_completado?: string | null;
          intentos_totales?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          modulo_id?: string | null;
          estado?: string | null;
          porcentaje_completado?: number | null;
          fecha_inicio?: string | null;
          fecha_completado?: string | null;
          intentos_totales?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_mora_activa: {
        Row: {
          cuota_id: string | null;
          familia_id: string | null;
          alumno_id: string | null;
          concepto: string | null;
          saldo_centavos: number | null;
          fecha_vencimiento: string | null;
          estado: string | null;
          dias_mora: number | null;
          nombre_familia: string | null;
          rep_nombre: string | null;
          telefono_whatsapp: string | null;
          rep_email: string | null;
          score_nivel: string | null;
        };
        Insert: {
          cuota_id?: string | null;
          familia_id?: string | null;
          alumno_id?: string | null;
          concepto?: string | null;
          saldo_centavos?: number | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          dias_mora?: number | null;
          nombre_familia?: string | null;
          rep_nombre?: string | null;
          telefono_whatsapp?: string | null;
          rep_email?: string | null;
          score_nivel?: string | null;
        };
        Update: {
          cuota_id?: string | null;
          familia_id?: string | null;
          alumno_id?: string | null;
          concepto?: string | null;
          saldo_centavos?: number | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          dias_mora?: number | null;
          nombre_familia?: string | null;
          rep_nombre?: string | null;
          telefono_whatsapp?: string | null;
          rep_email?: string | null;
          score_nivel?: string | null;
        };
      };
      historial_estado_alumno: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          estado: string | null;
          motivo: string | null;
          registrado_por: string | null;
          fecha: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          estado?: string | null;
          motivo?: string | null;
          registrado_por?: string | null;
          fecha?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          estado?: string | null;
          motivo?: string | null;
          registrado_por?: string | null;
          fecha?: string | null;
          created_at?: string | null;
        };
      };
      repertoire_items: {
        Row: {
          id: string | null;
          section: string | null;
          title: string | null;
          type: string | null;
          tempo_indication: string | null;
          key_signature: string | null;
          is_active: boolean | null;
          order_index: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          section?: string | null;
          title?: string | null;
          type?: string | null;
          tempo_indication?: string | null;
          key_signature?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          section?: string | null;
          title?: string | null;
          type?: string | null;
          tempo_indication?: string | null;
          key_signature?: string | null;
          is_active?: boolean | null;
          order_index?: number | null;
          created_at?: string | null;
        };
      };
      clase_mapa_indicadores: {
        Row: {
          id: string | null;
          objetivo_id: string | null;
          clase_id: string | null;
          origen_indicator_id: string | null;
          descripcion: string | null;
          orden_indicador: number | null;
          order_index: number | null;
          es_requerido: boolean | null;
          id_jerarquico: string | null;
          archived_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          objetivo_id?: string | null;
          clase_id?: string | null;
          origen_indicator_id?: string | null;
          descripcion?: string | null;
          orden_indicador?: number | null;
          order_index?: number | null;
          es_requerido?: boolean | null;
          id_jerarquico?: string | null;
          archived_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          objetivo_id?: string | null;
          clase_id?: string | null;
          origen_indicator_id?: string | null;
          descripcion?: string | null;
          orden_indicador?: number | null;
          order_index?: number | null;
          es_requerido?: boolean | null;
          id_jerarquico?: string | null;
          archived_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      node_student_coverage: {
        Row: {
          node_id: string | null;
          student_id: string | null;
          nombre_completo: string | null;
          last_attempt_date: string | null;
          attempt_count: number | null;
        };
        Insert: {
          node_id?: string | null;
          student_id?: string | null;
          nombre_completo?: string | null;
          last_attempt_date?: string | null;
          attempt_count?: number | null;
        };
        Update: {
          node_id?: string | null;
          student_id?: string | null;
          nombre_completo?: string | null;
          last_attempt_date?: string | null;
          attempt_count?: number | null;
        };
      };
      mapa_plantillas: {
        Row: {
          id: string | null;
          nombre: string | null;
          instrumento: string | null;
          descripcion: string | null;
          route_version_id: string | null;
          level_id: string | null;
          activo: boolean | null;
          publicada_por: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          instrumento?: string | null;
          descripcion?: string | null;
          route_version_id?: string | null;
          level_id?: string | null;
          activo?: boolean | null;
          publicada_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          instrumento?: string | null;
          descripcion?: string | null;
          route_version_id?: string | null;
          level_id?: string | null;
          activo?: boolean | null;
          publicada_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      plan_indicadores: {
        Row: {
          id: string | null;
          objetivo_id: string | null;
          descripcion: string | null;
          es_requerido: boolean | null;
          orden_index: number | null;
        };
        Insert: {
          id?: string | null;
          objetivo_id?: string | null;
          descripcion?: string | null;
          es_requerido?: boolean | null;
          orden_index?: number | null;
        };
        Update: {
          id?: string | null;
          objetivo_id?: string | null;
          descripcion?: string | null;
          es_requerido?: boolean | null;
          orden_index?: number | null;
        };
      };
      calendario_institucional: {
        Row: {
          id: string | null;
          titulo: string | null;
          descripcion: string | null;
          categoria: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          ubicacion: string | null;
          departamento_responsable: string | null;
          metadata: any | null;
          estado: string | null;
          created_at: string | null;
          updated_at: string | null;
          es_macro_evento: boolean | null;
          salud_proyecto: string | null;
          venue_id: string | null;
          aforo_proyectado: number | null;
          metadata_pm: any | null;
        };
        Insert: {
          id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          categoria?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          ubicacion?: string | null;
          departamento_responsable?: string | null;
          metadata?: any | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          es_macro_evento?: boolean | null;
          salud_proyecto?: string | null;
          venue_id?: string | null;
          aforo_proyectado?: number | null;
          metadata_pm?: any | null;
        };
        Update: {
          id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          categoria?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          ubicacion?: string | null;
          departamento_responsable?: string | null;
          metadata?: any | null;
          estado?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          es_macro_evento?: boolean | null;
          salud_proyecto?: string | null;
          venue_id?: string | null;
          aforo_proyectado?: number | null;
          metadata_pm?: any | null;
        };
      };
      curriculos: {
        Row: {
          id: string | null;
          instrumento: string | null;
          nivel: string | null;
          descripcion: string | null;
          activo: boolean | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          instrumento?: string | null;
          nivel?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          instrumento?: string | null;
          nivel?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      pagos_alumnos: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          monto: number | null;
          concepto: string | null;
          periodo_mes: string | null;
          fecha_pago: string | null;
          metodo_pago: string | null;
          referencia_transaccion: string | null;
          registrado_por: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          monto?: number | null;
          concepto?: string | null;
          periodo_mes?: string | null;
          fecha_pago?: string | null;
          metodo_pago?: string | null;
          referencia_transaccion?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          monto?: number | null;
          concepto?: string | null;
          periodo_mes?: string | null;
          fecha_pago?: string | null;
          metodo_pago?: string | null;
          referencia_transaccion?: string | null;
          registrado_por?: string | null;
          created_at?: string | null;
        };
      };
      hermes_acciones: {
        Row: {
          id: string | null;
          protocolo_id: string | null;
          tipo: string | null;
          destinatario: string | null;
          descripcion: string | null;
          estado: string | null;
          fecha_creacion: string | null;
          fecha_completacion: string | null;
          resultado: any | null;
        };
        Insert: {
          id?: string | null;
          protocolo_id?: string | null;
          tipo?: string | null;
          destinatario?: string | null;
          descripcion?: string | null;
          estado?: string | null;
          fecha_creacion?: string | null;
          fecha_completacion?: string | null;
          resultado?: any | null;
        };
        Update: {
          id?: string | null;
          protocolo_id?: string | null;
          tipo?: string | null;
          destinatario?: string | null;
          descripcion?: string | null;
          estado?: string | null;
          fecha_creacion?: string | null;
          fecha_completacion?: string | null;
          resultado?: any | null;
        };
      };
      campanias_marketing: {
        Row: {
          id: string | null;
          titulo: string | null;
          temporada: string | null;
          asunto: string | null;
          cuerpo_html: string | null;
          cuerpo_texto: string | null;
          estado: string | null;
          fecha_programada: string | null;
          fecha_envio: string | null;
          enviados: number | null;
          abiertos: number | null;
          respondidos: number | null;
          creado_por: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          titulo?: string | null;
          temporada?: string | null;
          asunto?: string | null;
          cuerpo_html?: string | null;
          cuerpo_texto?: string | null;
          estado?: string | null;
          fecha_programada?: string | null;
          fecha_envio?: string | null;
          enviados?: number | null;
          abiertos?: number | null;
          respondidos?: number | null;
          creado_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          titulo?: string | null;
          temporada?: string | null;
          asunto?: string | null;
          cuerpo_html?: string | null;
          cuerpo_texto?: string | null;
          estado?: string | null;
          fecha_programada?: string | null;
          fecha_envio?: string | null;
          enviados?: number | null;
          abiertos?: number | null;
          respondidos?: number | null;
          creado_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_ia_alumnos: {
        Row: {
          id: string | null;
          nombre: string | null;
          instrumento_principal: string | null;
          nivel_actual: number | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          instrumento_principal?: string | null;
          nivel_actual?: number | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          instrumento_principal?: string | null;
          nivel_actual?: number | null;
        };
      };
      teacher_class_sessions: {
        Row: {
          id: string | null;
          active_route_id: string | null;
          teacher_id: string | null;
          group_id: string | null;
          class_date: string | null;
          week_number: number | null;
          planned_week_id: string | null;
          status: string | null;
          general_observation: string | null;
          created_at: string | null;
          closed_at: string | null;
        };
        Insert: {
          id?: string | null;
          active_route_id?: string | null;
          teacher_id?: string | null;
          group_id?: string | null;
          class_date?: string | null;
          week_number?: number | null;
          planned_week_id?: string | null;
          status?: string | null;
          general_observation?: string | null;
          created_at?: string | null;
          closed_at?: string | null;
        };
        Update: {
          id?: string | null;
          active_route_id?: string | null;
          teacher_id?: string | null;
          group_id?: string | null;
          class_date?: string | null;
          week_number?: number | null;
          planned_week_id?: string | null;
          status?: string | null;
          general_observation?: string | null;
          created_at?: string | null;
          closed_at?: string | null;
        };
      };
      sections: {
        Row: {
          id: string | null;
          family: string | null;
          default_day: string | null;
          order_index: number | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          family?: string | null;
          default_day?: string | null;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          family?: string | null;
          default_day?: string | null;
          order_index?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
      hermes_protocolos: {
        Row: {
          id: string | null;
          categoria_evento: string | null;
          nombre_protocolo: string | null;
          descripcion: string | null;
          tareas_plantilla: any | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          categoria_evento?: string | null;
          nombre_protocolo?: string | null;
          descripcion?: string | null;
          tareas_plantilla?: any | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          categoria_evento?: string | null;
          nombre_protocolo?: string | null;
          descripcion?: string | null;
          tareas_plantilla?: any | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      acm_active_routes: {
        Row: {
          id: string | null;
          weekly_plan_id: string | null;
          teacher_id: string | null;
          group_id: string | null;
          program_id: string | null;
          area_id: string | null;
          instrument_id: string | null;
          module_id: string | null;
          level_id: string | null;
          phase_id: string | null;
          start_date: string | null;
          end_date: string | null;
          current_week: number | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          weekly_plan_id?: string | null;
          teacher_id?: string | null;
          group_id?: string | null;
          program_id?: string | null;
          area_id?: string | null;
          instrument_id?: string | null;
          module_id?: string | null;
          level_id?: string | null;
          phase_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          current_week?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          weekly_plan_id?: string | null;
          teacher_id?: string | null;
          group_id?: string | null;
          program_id?: string | null;
          area_id?: string | null;
          instrument_id?: string | null;
          module_id?: string | null;
          level_id?: string | null;
          phase_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          current_week?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      tareas_calendario: {
        Row: {
          id: string | null;
          evento_id: string | null;
          departamento_id: string | null;
          titulo: string | null;
          descripcion: string | null;
          fecha_vencimiento: string | null;
          estado: string | null;
          asignado_a: string | null;
          prioridad: string | null;
          generada_por: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          evento_id?: string | null;
          departamento_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          asignado_a?: string | null;
          prioridad?: string | null;
          generada_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          evento_id?: string | null;
          departamento_id?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          asignado_a?: string | null;
          prioridad?: string | null;
          generada_por?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_alertas_activas: {
        Row: {
          tipo_alerta: string | null;
          color: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          instrumento_principal: string | null;
          maestro_id: string | null;
          maestro_nombre: string | null;
          referencia_id: string | null;
          descripcion: string | null;
          valor_numerico: number | null;
          fecha_referencia: string | null;
        };
        Insert: {
          tipo_alerta?: string | null;
          color?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          instrumento_principal?: string | null;
          maestro_id?: string | null;
          maestro_nombre?: string | null;
          referencia_id?: string | null;
          descripcion?: string | null;
          valor_numerico?: number | null;
          fecha_referencia?: string | null;
        };
        Update: {
          tipo_alerta?: string | null;
          color?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          instrumento_principal?: string | null;
          maestro_id?: string | null;
          maestro_nombre?: string | null;
          referencia_id?: string | null;
          descripcion?: string | null;
          valor_numerico?: number | null;
          fecha_referencia?: string | null;
        };
      };
      hermes_whatsapp_queue: {
        Row: {
          id: string | null;
          jid: string | null;
          mensaje: string | null;
          estado: string | null;
          intentos: number | null;
          error_msg: string | null;
          created_at: string | null;
          procesado_at: string | null;
          campania_envio_id: string | null;
        };
        Insert: {
          id?: string | null;
          jid?: string | null;
          mensaje?: string | null;
          estado?: string | null;
          intentos?: number | null;
          error_msg?: string | null;
          created_at?: string | null;
          procesado_at?: string | null;
          campania_envio_id?: string | null;
        };
        Update: {
          id?: string | null;
          jid?: string | null;
          mensaje?: string | null;
          estado?: string | null;
          intentos?: number | null;
          error_msg?: string | null;
          created_at?: string | null;
          procesado_at?: string | null;
          campania_envio_id?: string | null;
        };
      };
      ejercicios: {
        Row: {
          id: string | null;
          unidad_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          tipo_ejercicio: string | null;
          dificultad: number | null;
          instrucciones: string | null;
          criterios_evaluacion: any | null;
          contenido: any | null;
          puntaje_maximo: number | null;
          puntaje_aprobacion: number | null;
          requiere_evidencia: boolean | null;
          puntos_xp: number | null;
          orden: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          unidad_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          tipo_ejercicio?: string | null;
          dificultad?: number | null;
          instrucciones?: string | null;
          criterios_evaluacion?: any | null;
          contenido?: any | null;
          puntaje_maximo?: number | null;
          puntaje_aprobacion?: number | null;
          requiere_evidencia?: boolean | null;
          puntos_xp?: number | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          unidad_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          tipo_ejercicio?: string | null;
          dificultad?: number | null;
          instrucciones?: string | null;
          criterios_evaluacion?: any | null;
          contenido?: any | null;
          puntaje_maximo?: number | null;
          puntaje_aprobacion?: number | null;
          requiere_evidencia?: boolean | null;
          puntos_xp?: number | null;
          orden?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_ia_inventario: {
        Row: {
          tipo_instrumento: string | null;
          total: number | null;
          disponibles: number | null;
        };
        Insert: {
          tipo_instrumento?: string | null;
          total?: number | null;
          disponibles?: number | null;
        };
        Update: {
          tipo_instrumento?: string | null;
          total?: number | null;
          disponibles?: number | null;
        };
      };
      acm_weekly_plans: {
        Row: {
          id: string | null;
          curriculum_version_id: string | null;
          program_id: string | null;
          area_id: string | null;
          instrument_id: string | null;
          module_id: string | null;
          level_id: string | null;
          phase_id: string | null;
          week_number: number | null;
          week_label: string | null;
          phase_type: string | null;
          main_topic: string | null;
          main_objective: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          curriculum_version_id?: string | null;
          program_id?: string | null;
          area_id?: string | null;
          instrument_id?: string | null;
          module_id?: string | null;
          level_id?: string | null;
          phase_id?: string | null;
          week_number?: number | null;
          week_label?: string | null;
          phase_type?: string | null;
          main_topic?: string | null;
          main_objective?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          curriculum_version_id?: string | null;
          program_id?: string | null;
          area_id?: string | null;
          instrument_id?: string | null;
          module_id?: string | null;
          level_id?: string | null;
          phase_id?: string | null;
          week_number?: number | null;
          week_label?: string | null;
          phase_type?: string | null;
          main_topic?: string | null;
          main_objective?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_cupos_iniciacion: {
        Row: {
          clase_id: string | null;
          nombre: string | null;
          capacidad_maxima: number | null;
          ocupacion: number | null;
          disponible: number | null;
        };
        Insert: {
          clase_id?: string | null;
          nombre?: string | null;
          capacidad_maxima?: number | null;
          ocupacion?: number | null;
          disponible?: number | null;
        };
        Update: {
          clase_id?: string | null;
          nombre?: string | null;
          capacidad_maxima?: number | null;
          ocupacion?: number | null;
          disponible?: number | null;
        };
      };
      mensajes_internos: {
        Row: {
          id: string | null;
          hilo_id: string | null;
          autor_id: string | null;
          rol_autor: string | null;
          contenido: string | null;
          tipo: string | null;
          departamento_destino: string[] | null;
          leido_por: any | null;
          resuelto: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          hilo_id?: string | null;
          autor_id?: string | null;
          rol_autor?: string | null;
          contenido?: string | null;
          tipo?: string | null;
          departamento_destino?: string[] | null;
          leido_por?: any | null;
          resuelto?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          hilo_id?: string | null;
          autor_id?: string | null;
          rol_autor?: string | null;
          contenido?: string | null;
          tipo?: string | null;
          departamento_destino?: string[] | null;
          leido_por?: any | null;
          resuelto?: boolean | null;
          created_at?: string | null;
        };
      };
      plan_temas: {
        Row: {
          id: string | null;
          nivel_id: string | null;
          nombre: string | null;
          tipo: string | null;
          es_critico: boolean | null;
          orden_index: number | null;
        };
        Insert: {
          id?: string | null;
          nivel_id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          es_critico?: boolean | null;
          orden_index?: number | null;
        };
        Update: {
          id?: string | null;
          nivel_id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          es_critico?: boolean | null;
          orden_index?: number | null;
        };
      };
      objetivos: {
        Row: {
          id: string | null;
          node_id: string | null;
          nombre: string | null;
          descripcion: string | null;
          order_index: number | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          node_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          order_index?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          node_id?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          order_index?: number | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_destacados_y_riesgo_academico: {
        Row: {
          id: string | null;
          nombre_completo: string | null;
          instrumento_principal: string | null;
          nivel: string | null;
          tasa_asistencia: number | null;
          promedio_calificacion: number | null;
          alertas_alta: number | null;
          categoria: string | null;
          etiqueta: string | null;
        };
        Insert: {
          id?: string | null;
          nombre_completo?: string | null;
          instrumento_principal?: string | null;
          nivel?: string | null;
          tasa_asistencia?: number | null;
          promedio_calificacion?: number | null;
          alertas_alta?: number | null;
          categoria?: string | null;
          etiqueta?: string | null;
        };
        Update: {
          id?: string | null;
          nombre_completo?: string | null;
          instrumento_principal?: string | null;
          nivel?: string | null;
          tasa_asistencia?: number | null;
          promedio_calificacion?: number | null;
          alertas_alta?: number | null;
          categoria?: string | null;
          etiqueta?: string | null;
        };
      };
      configuracion_recordatorios: {
        Row: {
          id: string | null;
          profile_id: string | null;
          recordatorios_activos: boolean | null;
          push_activo: boolean | null;
          email_activo: boolean | null;
          hora_resumen_diario: string | null;
          dia_resumen_semanal: number | null;
          created_at: string | null;
          updated_at: string | null;
          min_antes_clase: number | null;
          min_post_clase_sin_registro: number | null;
          horas_recordatorio_dia1: number | null;
          horas_recordatorio_dia2: number | null;
          alerta_pre_clase: boolean | null;
          alerta_post_clase: boolean | null;
          alerta_24h: boolean | null;
          alerta_48h: boolean | null;
        };
        Insert: {
          id?: string | null;
          profile_id?: string | null;
          recordatorios_activos?: boolean | null;
          push_activo?: boolean | null;
          email_activo?: boolean | null;
          hora_resumen_diario?: string | null;
          dia_resumen_semanal?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          min_antes_clase?: number | null;
          min_post_clase_sin_registro?: number | null;
          horas_recordatorio_dia1?: number | null;
          horas_recordatorio_dia2?: number | null;
          alerta_pre_clase?: boolean | null;
          alerta_post_clase?: boolean | null;
          alerta_24h?: boolean | null;
          alerta_48h?: boolean | null;
        };
        Update: {
          id?: string | null;
          profile_id?: string | null;
          recordatorios_activos?: boolean | null;
          push_activo?: boolean | null;
          email_activo?: boolean | null;
          hora_resumen_diario?: string | null;
          dia_resumen_semanal?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          min_antes_clase?: number | null;
          min_post_clase_sin_registro?: number | null;
          horas_recordatorio_dia1?: number | null;
          horas_recordatorio_dia2?: number | null;
          alerta_pre_clase?: boolean | null;
          alerta_post_clase?: boolean | null;
          alerta_24h?: boolean | null;
          alerta_48h?: boolean | null;
        };
      };
      acm_evidence_files: {
        Row: {
          id: string | null;
          student_id: string | null;
          group_id: string | null;
          session_id: string | null;
          indicator_id: string | null;
          file_url: string | null;
          file_type: string | null;
          description: string | null;
          uploaded_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          student_id?: string | null;
          group_id?: string | null;
          session_id?: string | null;
          indicator_id?: string | null;
          file_url?: string | null;
          file_type?: string | null;
          description?: string | null;
          uploaded_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          student_id?: string | null;
          group_id?: string | null;
          session_id?: string | null;
          indicator_id?: string | null;
          file_url?: string | null;
          file_type?: string | null;
          description?: string | null;
          uploaded_by?: string | null;
          created_at?: string | null;
        };
      };
      vw_prediccion_abandono: {
        Row: {
          alumno_id: string | null;
          nombre_completo: string | null;
          familia_id: string | null;
          nombre_familia: string | null;
          score_financiero: number | null;
          nivel_financiero: string | null;
          asistencia_rate: number | null;
          progreso_rate: number | null;
          riesgo_abandono: number | null;
        };
        Insert: {
          alumno_id?: string | null;
          nombre_completo?: string | null;
          familia_id?: string | null;
          nombre_familia?: string | null;
          score_financiero?: number | null;
          nivel_financiero?: string | null;
          asistencia_rate?: number | null;
          progreso_rate?: number | null;
          riesgo_abandono?: number | null;
        };
        Update: {
          alumno_id?: string | null;
          nombre_completo?: string | null;
          familia_id?: string | null;
          nombre_familia?: string | null;
          score_financiero?: number | null;
          nivel_financiero?: string | null;
          asistencia_rate?: number | null;
          progreso_rate?: number | null;
          riesgo_abandono?: number | null;
        };
      };
      teacher_class_fill_metrics: {
        Row: {
          sesion_id: string | null;
          clase_id: string | null;
          maestro_id: string | null;
          fecha: string | null;
          hora_inicio: string | null;
          hora_fin: string | null;
          asistencia_marked_at: string | null;
          observaciones_first_at: string | null;
          observaciones_last_at: string | null;
          ai_fill_at: string | null;
          orden_llenado: string | null;
          duracion_observaciones_segundos: number | null;
          momento_asistencia: string | null;
          momento_observaciones: string | null;
          uso_ai_fill: string | null;
          minutos_entre_asistencia_observaciones: number | null;
        };
        Insert: {
          sesion_id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          fecha?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          asistencia_marked_at?: string | null;
          observaciones_first_at?: string | null;
          observaciones_last_at?: string | null;
          ai_fill_at?: string | null;
          orden_llenado?: string | null;
          duracion_observaciones_segundos?: number | null;
          momento_asistencia?: string | null;
          momento_observaciones?: string | null;
          uso_ai_fill?: string | null;
          minutos_entre_asistencia_observaciones?: number | null;
        };
        Update: {
          sesion_id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          fecha?: string | null;
          hora_inicio?: string | null;
          hora_fin?: string | null;
          asistencia_marked_at?: string | null;
          observaciones_first_at?: string | null;
          observaciones_last_at?: string | null;
          ai_fill_at?: string | null;
          orden_llenado?: string | null;
          duracion_observaciones_segundos?: number | null;
          momento_asistencia?: string | null;
          momento_observaciones?: string | null;
          uso_ai_fill?: string | null;
          minutos_entre_asistencia_observaciones?: number | null;
        };
      };
      representantes: {
        Row: {
          id: string | null;
          familia_id: string | null;
          user_id: string | null;
          nombre: string | null;
          cedula: string | null;
          telefono_whatsapp: string | null;
          email: string | null;
          relacion: string | null;
          es_pagador: boolean | null;
          autoriza_accesorios_hasta: number | null;
          alumno_id: string | null;
          activo: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          user_id?: string | null;
          nombre?: string | null;
          cedula?: string | null;
          telefono_whatsapp?: string | null;
          email?: string | null;
          relacion?: string | null;
          es_pagador?: boolean | null;
          autoriza_accesorios_hasta?: number | null;
          alumno_id?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          user_id?: string | null;
          nombre?: string | null;
          cedula?: string | null;
          telefono_whatsapp?: string | null;
          email?: string | null;
          relacion?: string | null;
          es_pagador?: boolean | null;
          autoriza_accesorios_hasta?: number | null;
          alumno_id?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
      };
      score_compromiso: {
        Row: {
          id: string | null;
          representante_id: string | null;
          familia_id: string | null;
          score: number | null;
          nivel: string | null;
          puntualidad_pct: number | null;
          consistencia_meses: number | null;
          voluntad_pago_pct: number | null;
          comportamiento_mora_pct: number | null;
          generosidad_pct: number | null;
          calculado_en: string | null;
          ciclo_mes: number | null;
          ciclo_anio: number | null;
        };
        Insert: {
          id?: string | null;
          representante_id?: string | null;
          familia_id?: string | null;
          score?: number | null;
          nivel?: string | null;
          puntualidad_pct?: number | null;
          consistencia_meses?: number | null;
          voluntad_pago_pct?: number | null;
          comportamiento_mora_pct?: number | null;
          generosidad_pct?: number | null;
          calculado_en?: string | null;
          ciclo_mes?: number | null;
          ciclo_anio?: number | null;
        };
        Update: {
          id?: string | null;
          representante_id?: string | null;
          familia_id?: string | null;
          score?: number | null;
          nivel?: string | null;
          puntualidad_pct?: number | null;
          consistencia_meses?: number | null;
          voluntad_pago_pct?: number | null;
          comportamiento_mora_pct?: number | null;
          generosidad_pct?: number | null;
          calculado_en?: string | null;
          ciclo_mes?: number | null;
          ciclo_anio?: number | null;
        };
      };
      tarea_logs: {
        Row: {
          id: string | null;
          tarea_id: string | null;
          evento: string | null;
          cambios: any | null;
          changed_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          tarea_id?: string | null;
          evento?: string | null;
          cambios?: any | null;
          changed_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          tarea_id?: string | null;
          evento?: string | null;
          cambios?: any | null;
          changed_by?: string | null;
          created_at?: string | null;
        };
      };
      curriculo_pilares: {
        Row: {
          id: string | null;
          curriculo_id: string | null;
          nombre: string | null;
          orden: number | null;
        };
        Insert: {
          id?: string | null;
          curriculo_id?: string | null;
          nombre?: string | null;
          orden?: number | null;
        };
        Update: {
          id?: string | null;
          curriculo_id?: string | null;
          nombre?: string | null;
          orden?: number | null;
        };
      };
      indicator_attempts: {
        Row: {
          id: string | null;
          student_id: string | null;
          indicator_id: string | null;
          session_id: string | null;
          result: string | null;
          observations: string | null;
          created_at: string | null;
          node_id: string | null;
          status: string | null;
          nota: number | null;
          tarea: string | null;
          covered_date: string | null;
          covered_by_clase_id: string | null;
          created_by: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          student_id?: string | null;
          indicator_id?: string | null;
          session_id?: string | null;
          result?: string | null;
          observations?: string | null;
          created_at?: string | null;
          node_id?: string | null;
          status?: string | null;
          nota?: number | null;
          tarea?: string | null;
          covered_date?: string | null;
          covered_by_clase_id?: string | null;
          created_by?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          student_id?: string | null;
          indicator_id?: string | null;
          session_id?: string | null;
          result?: string | null;
          observations?: string | null;
          created_at?: string | null;
          node_id?: string | null;
          status?: string | null;
          nota?: number | null;
          tarea?: string | null;
          covered_date?: string | null;
          covered_by_clase_id?: string | null;
          created_by?: string | null;
          updated_at?: string | null;
        };
      };
      alumnos: {
        Row: {
          id: string | null;
          user_id: string | null;
          nombre_completo: string | null;
          fecha_nacimiento: string | null;
          instrumento_principal: string | null;
          nivel_actual: number | null;
          fecha_ingreso: string | null;
          padre_nombre: string | null;
          madre_nombre: string | null;
          representante_nombre: string | null;
          representante_cedula: string | null;
          representante_tlf: string | null;
          correo_representante: string | null;
          tlf_alumno: string | null;
          direccion: string | null;
          foto_url: string | null;
          observaciones_generales: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          nivel: string | null;
          condiciones_medicas: string | null;
          alergias: string | null;
          medicamentos: string | null;
          contacto_emergencia_nombre: string | null;
          contacto_emergencia_telefono: string | null;
          contacto_emergencia_parentesco: string | null;
          familiar_nombre: string | null;
          familiar_telefono: string | null;
          familiar_parentesco: string | null;
          sabe_leer: boolean | null;
          sabe_escribir: boolean | null;
          nacionalidad: string | null;
          tiene_pasaporte: boolean | null;
          como_se_entero: string | null;
          ubicacion_maps_url: string | null;
          municipio_residencia: string | null;
          sector_calle_numero: string | null;
          madre_cedula: string | null;
          madre_tlf_whatsapp: string | null;
          padre_cedula: string | null;
          padre_tlf_whatsapp: string | null;
          otro_responsable_nombre: string | null;
          otro_responsable_cedula: string | null;
          otro_responsable_tlf: string | null;
          contacto_emergencia_2_nombre: string | null;
          contacto_emergencia_2_telefono: string | null;
          familia_monoparental: boolean | null;
          beneficiario_subsidio_estado: boolean | null;
          subsidio_descripcion: string | null;
          apoyo_actividades: string | null;
          tiene_conocimientos_musicales: boolean | null;
          instrumento_previo: string | null;
          nivel_lectura_musical: string | null;
          interes_musical: string | null;
          instrumento_interes: string | null;
          requiere_iniciacion_musical: boolean | null;
          fecha_ingreso_iniciacion: string | null;
          por_que_unirse: string | null;
          sentimiento_musica_clasica: string | null;
          sentimiento_aprender_instrumento: string | null;
          aspiracion_instrumento: string | null;
          musico_favorito: string | null;
          preferencia_aprendizaje_musical: string | null;
          tiene_alergias: boolean | null;
          alergias_descripcion: string | null;
          tiene_condicion_transmisible: boolean | null;
          condicion_transmisible_desc: string | null;
          tiene_alergia_medicamento: boolean | null;
          alergia_medicamento_desc: string | null;
          impedimento_social: boolean | null;
          problemas_conducta: string | null;
          centro_estudios: string | null;
          grado_nivel: string | null;
          padres_en_vida: string | null;
          acepta_beca_4500: boolean | null;
          fecha_aceptacion_beca: string | null;
          acepta_pago_600: boolean | null;
          fecha_aceptacion_pago: string | null;
          autoriza_fotos_redes: boolean | null;
          representante_parentesco: string | null;
          exento_mensualidad: boolean | null;
          familia_id: string | null;
          mora_flag: boolean | null;
          bloqueo_certificado: boolean | null;
          bloqueo_evento: boolean | null;
          abandono_score: number | null;
          genero: string | null;
          promedio_notas: number | null;
        };
        Insert: {
          id?: string | null;
          user_id?: string | null;
          nombre_completo?: string | null;
          fecha_nacimiento?: string | null;
          instrumento_principal?: string | null;
          nivel_actual?: number | null;
          fecha_ingreso?: string | null;
          padre_nombre?: string | null;
          madre_nombre?: string | null;
          representante_nombre?: string | null;
          representante_cedula?: string | null;
          representante_tlf?: string | null;
          correo_representante?: string | null;
          tlf_alumno?: string | null;
          direccion?: string | null;
          foto_url?: string | null;
          observaciones_generales?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          nivel?: string | null;
          condiciones_medicas?: string | null;
          alergias?: string | null;
          medicamentos?: string | null;
          contacto_emergencia_nombre?: string | null;
          contacto_emergencia_telefono?: string | null;
          contacto_emergencia_parentesco?: string | null;
          familiar_nombre?: string | null;
          familiar_telefono?: string | null;
          familiar_parentesco?: string | null;
          sabe_leer?: boolean | null;
          sabe_escribir?: boolean | null;
          nacionalidad?: string | null;
          tiene_pasaporte?: boolean | null;
          como_se_entero?: string | null;
          ubicacion_maps_url?: string | null;
          municipio_residencia?: string | null;
          sector_calle_numero?: string | null;
          madre_cedula?: string | null;
          madre_tlf_whatsapp?: string | null;
          padre_cedula?: string | null;
          padre_tlf_whatsapp?: string | null;
          otro_responsable_nombre?: string | null;
          otro_responsable_cedula?: string | null;
          otro_responsable_tlf?: string | null;
          contacto_emergencia_2_nombre?: string | null;
          contacto_emergencia_2_telefono?: string | null;
          familia_monoparental?: boolean | null;
          beneficiario_subsidio_estado?: boolean | null;
          subsidio_descripcion?: string | null;
          apoyo_actividades?: string | null;
          tiene_conocimientos_musicales?: boolean | null;
          instrumento_previo?: string | null;
          nivel_lectura_musical?: string | null;
          interes_musical?: string | null;
          instrumento_interes?: string | null;
          requiere_iniciacion_musical?: boolean | null;
          fecha_ingreso_iniciacion?: string | null;
          por_que_unirse?: string | null;
          sentimiento_musica_clasica?: string | null;
          sentimiento_aprender_instrumento?: string | null;
          aspiracion_instrumento?: string | null;
          musico_favorito?: string | null;
          preferencia_aprendizaje_musical?: string | null;
          tiene_alergias?: boolean | null;
          alergias_descripcion?: string | null;
          tiene_condicion_transmisible?: boolean | null;
          condicion_transmisible_desc?: string | null;
          tiene_alergia_medicamento?: boolean | null;
          alergia_medicamento_desc?: string | null;
          impedimento_social?: boolean | null;
          problemas_conducta?: string | null;
          centro_estudios?: string | null;
          grado_nivel?: string | null;
          padres_en_vida?: string | null;
          acepta_beca_4500?: boolean | null;
          fecha_aceptacion_beca?: string | null;
          acepta_pago_600?: boolean | null;
          fecha_aceptacion_pago?: string | null;
          autoriza_fotos_redes?: boolean | null;
          representante_parentesco?: string | null;
          exento_mensualidad?: boolean | null;
          familia_id?: string | null;
          mora_flag?: boolean | null;
          bloqueo_certificado?: boolean | null;
          bloqueo_evento?: boolean | null;
          abandono_score?: number | null;
          genero?: string | null;
          promedio_notas?: number | null;
        };
        Update: {
          id?: string | null;
          user_id?: string | null;
          nombre_completo?: string | null;
          fecha_nacimiento?: string | null;
          instrumento_principal?: string | null;
          nivel_actual?: number | null;
          fecha_ingreso?: string | null;
          padre_nombre?: string | null;
          madre_nombre?: string | null;
          representante_nombre?: string | null;
          representante_cedula?: string | null;
          representante_tlf?: string | null;
          correo_representante?: string | null;
          tlf_alumno?: string | null;
          direccion?: string | null;
          foto_url?: string | null;
          observaciones_generales?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          nivel?: string | null;
          condiciones_medicas?: string | null;
          alergias?: string | null;
          medicamentos?: string | null;
          contacto_emergencia_nombre?: string | null;
          contacto_emergencia_telefono?: string | null;
          contacto_emergencia_parentesco?: string | null;
          familiar_nombre?: string | null;
          familiar_telefono?: string | null;
          familiar_parentesco?: string | null;
          sabe_leer?: boolean | null;
          sabe_escribir?: boolean | null;
          nacionalidad?: string | null;
          tiene_pasaporte?: boolean | null;
          como_se_entero?: string | null;
          ubicacion_maps_url?: string | null;
          municipio_residencia?: string | null;
          sector_calle_numero?: string | null;
          madre_cedula?: string | null;
          madre_tlf_whatsapp?: string | null;
          padre_cedula?: string | null;
          padre_tlf_whatsapp?: string | null;
          otro_responsable_nombre?: string | null;
          otro_responsable_cedula?: string | null;
          otro_responsable_tlf?: string | null;
          contacto_emergencia_2_nombre?: string | null;
          contacto_emergencia_2_telefono?: string | null;
          familia_monoparental?: boolean | null;
          beneficiario_subsidio_estado?: boolean | null;
          subsidio_descripcion?: string | null;
          apoyo_actividades?: string | null;
          tiene_conocimientos_musicales?: boolean | null;
          instrumento_previo?: string | null;
          nivel_lectura_musical?: string | null;
          interes_musical?: string | null;
          instrumento_interes?: string | null;
          requiere_iniciacion_musical?: boolean | null;
          fecha_ingreso_iniciacion?: string | null;
          por_que_unirse?: string | null;
          sentimiento_musica_clasica?: string | null;
          sentimiento_aprender_instrumento?: string | null;
          aspiracion_instrumento?: string | null;
          musico_favorito?: string | null;
          preferencia_aprendizaje_musical?: string | null;
          tiene_alergias?: boolean | null;
          alergias_descripcion?: string | null;
          tiene_condicion_transmisible?: boolean | null;
          condicion_transmisible_desc?: string | null;
          tiene_alergia_medicamento?: boolean | null;
          alergia_medicamento_desc?: string | null;
          impedimento_social?: boolean | null;
          problemas_conducta?: string | null;
          centro_estudios?: string | null;
          grado_nivel?: string | null;
          padres_en_vida?: string | null;
          acepta_beca_4500?: boolean | null;
          fecha_aceptacion_beca?: string | null;
          acepta_pago_600?: boolean | null;
          fecha_aceptacion_pago?: string | null;
          autoriza_fotos_redes?: boolean | null;
          representante_parentesco?: string | null;
          exento_mensualidad?: boolean | null;
          familia_id?: string | null;
          mora_flag?: boolean | null;
          bloqueo_certificado?: boolean | null;
          bloqueo_evento?: boolean | null;
          abandono_score?: number | null;
          genero?: string | null;
          promedio_notas?: number | null;
        };
      };
      comunicaciones_seguimiento: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          contacto_nombre: string | null;
          contacto_telefono: string | null;
          contacto_email: string | null;
          canal: string | null;
          fecha: string | null;
          resultado: string | null;
          notas: string | null;
          requiere_seguimiento: boolean | null;
          proxima_accion: string | null;
          proxima_fecha: string | null;
          estado: string | null;
          responsable_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          contacto_nombre?: string | null;
          contacto_telefono?: string | null;
          contacto_email?: string | null;
          canal?: string | null;
          fecha?: string | null;
          resultado?: string | null;
          notas?: string | null;
          requiere_seguimiento?: boolean | null;
          proxima_accion?: string | null;
          proxima_fecha?: string | null;
          estado?: string | null;
          responsable_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          contacto_nombre?: string | null;
          contacto_telefono?: string | null;
          contacto_email?: string | null;
          canal?: string | null;
          fecha?: string | null;
          resultado?: string | null;
          notas?: string | null;
          requiere_seguimiento?: boolean | null;
          proxima_accion?: string | null;
          proxima_fecha?: string | null;
          estado?: string | null;
          responsable_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      notificaciones: {
        Row: {
          id: string | null;
          profile_id: string | null;
          registro_pendiente_id: string | null;
          tipo: string | null;
          titulo: string | null;
          mensaje: string | null;
          deep_link: string | null;
          estado: string | null;
          enviada_en: string | null;
          leida_en: string | null;
          created_at: string | null;
          updated_at: string | null;
          escalation_level: number | null;
          scheduled_for: string | null;
          dedup_key: string | null;
          clase_id: string | null;
        };
        Insert: {
          id?: string | null;
          profile_id?: string | null;
          registro_pendiente_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          mensaje?: string | null;
          deep_link?: string | null;
          estado?: string | null;
          enviada_en?: string | null;
          leida_en?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          escalation_level?: number | null;
          scheduled_for?: string | null;
          dedup_key?: string | null;
          clase_id?: string | null;
        };
        Update: {
          id?: string | null;
          profile_id?: string | null;
          registro_pendiente_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          mensaje?: string | null;
          deep_link?: string | null;
          estado?: string | null;
          enviada_en?: string | null;
          leida_en?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          escalation_level?: number | null;
          scheduled_for?: string | null;
          dedup_key?: string | null;
          clase_id?: string | null;
        };
      };
      contactos_alianzas: {
        Row: {
          id: string | null;
          nombre_institucion: string | null;
          website: string | null;
          email_contacto: string | null;
          persona_contacto: string | null;
          area_enfoque: string | null;
          programa_relevante: string | null;
          enfoque_geografico: string | null;
          puntuacion_match: number | null;
          notas: string | null;
          estado: string | null;
          fecha_primer_contacto: string | null;
          fecha_ultima_respuesta: string | null;
          email_enviado: boolean | null;
          email_draft_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          tipo: string | null;
        };
        Insert: {
          id?: string | null;
          nombre_institucion?: string | null;
          website?: string | null;
          email_contacto?: string | null;
          persona_contacto?: string | null;
          area_enfoque?: string | null;
          programa_relevante?: string | null;
          enfoque_geografico?: string | null;
          puntuacion_match?: number | null;
          notas?: string | null;
          estado?: string | null;
          fecha_primer_contacto?: string | null;
          fecha_ultima_respuesta?: string | null;
          email_enviado?: boolean | null;
          email_draft_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          tipo?: string | null;
        };
        Update: {
          id?: string | null;
          nombre_institucion?: string | null;
          website?: string | null;
          email_contacto?: string | null;
          persona_contacto?: string | null;
          area_enfoque?: string | null;
          programa_relevante?: string | null;
          enfoque_geografico?: string | null;
          puntuacion_match?: number | null;
          notas?: string | null;
          estado?: string | null;
          fecha_primer_contacto?: string | null;
          fecha_ultima_respuesta?: string | null;
          email_enviado?: boolean | null;
          email_draft_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          tipo?: string | null;
        };
      };
      hermes_process_cases: {
        Row: {
          id: string | null;
          process_code: string | null;
          title: string | null;
          description: string | null;
          source: string | null;
          status: string | null;
          priority: string | null;
          requested_by: string | null;
          requested_by_name: string | null;
          owner_department: string | null;
          entity_type: string | null;
          entity_id: string | null;
          entity_label: string | null;
          required_evidence_snapshot: any | null;
          closure_criteria_snapshot: any | null;
          closure_summary: string | null;
          metadata: any | null;
          opened_at: string | null;
          closed_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          process_code?: string | null;
          title?: string | null;
          description?: string | null;
          source?: string | null;
          status?: string | null;
          priority?: string | null;
          requested_by?: string | null;
          requested_by_name?: string | null;
          owner_department?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          entity_label?: string | null;
          required_evidence_snapshot?: any | null;
          closure_criteria_snapshot?: any | null;
          closure_summary?: string | null;
          metadata?: any | null;
          opened_at?: string | null;
          closed_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          process_code?: string | null;
          title?: string | null;
          description?: string | null;
          source?: string | null;
          status?: string | null;
          priority?: string | null;
          requested_by?: string | null;
          requested_by_name?: string | null;
          owner_department?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          entity_label?: string | null;
          required_evidence_snapshot?: any | null;
          closure_criteria_snapshot?: any | null;
          closure_summary?: string | null;
          metadata?: any | null;
          opened_at?: string | null;
          closed_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_estado_familiar: {
        Row: {
          id: string | null;
          nombre_familia: string | null;
          activa: boolean | null;
          rep_id: string | null;
          rep_nombre: string | null;
          telefono_whatsapp: string | null;
          es_pagador: boolean | null;
          score: number | null;
          nivel: string | null;
          cuotas_pendientes: number | null;
          saldo_pendiente_centavos: number | null;
          saldo_wallet_centavos: number | null;
        };
        Insert: {
          id?: string | null;
          nombre_familia?: string | null;
          activa?: boolean | null;
          rep_id?: string | null;
          rep_nombre?: string | null;
          telefono_whatsapp?: string | null;
          es_pagador?: boolean | null;
          score?: number | null;
          nivel?: string | null;
          cuotas_pendientes?: number | null;
          saldo_pendiente_centavos?: number | null;
          saldo_wallet_centavos?: number | null;
        };
        Update: {
          id?: string | null;
          nombre_familia?: string | null;
          activa?: boolean | null;
          rep_id?: string | null;
          rep_nombre?: string | null;
          telefono_whatsapp?: string | null;
          es_pagador?: boolean | null;
          score?: number | null;
          nivel?: string | null;
          cuotas_pendientes?: number | null;
          saldo_pendiente_centavos?: number | null;
          saldo_wallet_centavos?: number | null;
        };
      };
      usuario_departamentos: {
        Row: {
          id: string | null;
          user_id: string | null;
          departamento_id: string | null;
          rol: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          user_id?: string | null;
          departamento_id?: string | null;
          rol?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          user_id?: string | null;
          departamento_id?: string | null;
          rol?: string | null;
          created_at?: string | null;
        };
      };
      student_results: {
        Row: {
          id: string | null;
          name: string | null;
          section: string | null;
          eval_count: number | null;
          avg_escala: number | null;
          avg_danzon: number | null;
          avg_total: number | null;
          assigned_group: string | null;
        };
        Insert: {
          id?: string | null;
          name?: string | null;
          section?: string | null;
          eval_count?: number | null;
          avg_escala?: number | null;
          avg_danzon?: number | null;
          avg_total?: number | null;
          assigned_group?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          section?: string | null;
          eval_count?: number | null;
          avg_escala?: number | null;
          avg_danzon?: number | null;
          avg_total?: number | null;
          assigned_group?: string | null;
        };
      };
      inventario_reparaciones: {
        Row: {
          id: string | null;
          activo_id: string | null;
          tipo_tallerista: string | null;
          tallerista_nombre: string | null;
          descripcion: string | null;
          costo_estimado: number | null;
          costo_real: number | null;
          fecha_ingreso: string | null;
          fecha_egreso: string | null;
          estado: string | null;
          proveedor_factura_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          activo_id?: string | null;
          tipo_tallerista?: string | null;
          tallerista_nombre?: string | null;
          descripcion?: string | null;
          costo_estimado?: number | null;
          costo_real?: number | null;
          fecha_ingreso?: string | null;
          fecha_egreso?: string | null;
          estado?: string | null;
          proveedor_factura_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          activo_id?: string | null;
          tipo_tallerista?: string | null;
          tallerista_nombre?: string | null;
          descripcion?: string | null;
          costo_estimado?: number | null;
          costo_real?: number | null;
          fecha_ingreso?: string | null;
          fecha_egreso?: string | null;
          estado?: string | null;
          proveedor_factura_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      student_case_alerts: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          alumno_nombre: string | null;
          case_id: string | null;
          tipo: string | null;
          nivel_riesgo: string | null;
          titulo: string | null;
          descripcion: string | null;
          evidencia: any | null;
          estado: string | null;
          detectada_en: string | null;
          revisada_por: string | null;
          revisada_en: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          case_id?: string | null;
          tipo?: string | null;
          nivel_riesgo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          evidencia?: any | null;
          estado?: string | null;
          detectada_en?: string | null;
          revisada_por?: string | null;
          revisada_en?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          alumno_nombre?: string | null;
          case_id?: string | null;
          tipo?: string | null;
          nivel_riesgo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          evidencia?: any | null;
          estado?: string | null;
          detectada_en?: string | null;
          revisada_por?: string | null;
          revisada_en?: string | null;
          created_at?: string | null;
        };
      };
      rachas: {
        Row: {
          alumno_id: string | null;
          racha_actual: number | null;
          racha_maxima: number | null;
          ultima_fecha_activa: string | null;
          updated_at: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          racha_actual?: number | null;
          racha_maxima?: number | null;
          ultima_fecha_activa?: string | null;
          updated_at?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          racha_actual?: number | null;
          racha_maxima?: number | null;
          ultima_fecha_activa?: string | null;
          updated_at?: string | null;
        };
      };
      sesion_bitacora: {
        Row: {
          id: string | null;
          sesion_id: string | null;
          clase_id: string | null;
          maestro_id: string | null;
          texto_libre: string | null;
          texto_ia: string | null;
          tareas_enviadas: boolean | null;
          tareas_detalle: string | null;
          incidencia_comportamiento: boolean | null;
          incidencia_detalle: string | null;
          clase_no_realizada: boolean | null;
          motivo_no_realizada: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          sesion_id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          texto_libre?: string | null;
          texto_ia?: string | null;
          tareas_enviadas?: boolean | null;
          tareas_detalle?: string | null;
          incidencia_comportamiento?: boolean | null;
          incidencia_detalle?: string | null;
          clase_no_realizada?: boolean | null;
          motivo_no_realizada?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          sesion_id?: string | null;
          clase_id?: string | null;
          maestro_id?: string | null;
          texto_libre?: string | null;
          texto_ia?: string | null;
          tareas_enviadas?: boolean | null;
          tareas_detalle?: string | null;
          incidencia_comportamiento?: boolean | null;
          incidencia_detalle?: string | null;
          clase_no_realizada?: boolean | null;
          motivo_no_realizada?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vw_reparaciones_pendientes: {
        Row: {
          id: string | null;
          activo_id: string | null;
          codigo_inventario: string | null;
          tipo_instrumento: string | null;
          marca: string | null;
          modelo: string | null;
          tipo_tallerista: string | null;
          tallerista_nombre: string | null;
          descripcion: string | null;
          costo_estimado: number | null;
          costo_real: number | null;
          fecha_ingreso: string | null;
          estado: string | null;
          dias_en_reparacion: number | null;
          estado_label: string | null;
        };
        Insert: {
          id?: string | null;
          activo_id?: string | null;
          codigo_inventario?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          tipo_tallerista?: string | null;
          tallerista_nombre?: string | null;
          descripcion?: string | null;
          costo_estimado?: number | null;
          costo_real?: number | null;
          fecha_ingreso?: string | null;
          estado?: string | null;
          dias_en_reparacion?: number | null;
          estado_label?: string | null;
        };
        Update: {
          id?: string | null;
          activo_id?: string | null;
          codigo_inventario?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          tipo_tallerista?: string | null;
          tallerista_nombre?: string | null;
          descripcion?: string | null;
          costo_estimado?: number | null;
          costo_real?: number | null;
          fecha_ingreso?: string | null;
          estado?: string | null;
          dias_en_reparacion?: number | null;
          estado_label?: string | null;
        };
      };
      plan_clases: {
        Row: {
          id: string | null;
          created_at: string | null;
          nombre: string | null;
          descripcion: string | null;
          activo: boolean | null;
          maestro_id: string | null;
          clase_id: string | null;
        };
        Insert: {
          id?: string | null;
          created_at?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          maestro_id?: string | null;
          clase_id?: string | null;
        };
        Update: {
          id?: string | null;
          created_at?: string | null;
          nombre?: string | null;
          descripcion?: string | null;
          activo?: boolean | null;
          maestro_id?: string | null;
          clase_id?: string | null;
        };
      };
      vw_patron_asistencia: {
        Row: {
          dia_semana_num: number | null;
          dia_semana_nombre: string | null;
          instrumento_principal: string | null;
          total_registros: number | null;
          presencias: number | null;
          ausencias: number | null;
          justificados: number | null;
          pct_ausencias: number | null;
        };
        Insert: {
          dia_semana_num?: number | null;
          dia_semana_nombre?: string | null;
          instrumento_principal?: string | null;
          total_registros?: number | null;
          presencias?: number | null;
          ausencias?: number | null;
          justificados?: number | null;
          pct_ausencias?: number | null;
        };
        Update: {
          dia_semana_num?: number | null;
          dia_semana_nombre?: string | null;
          instrumento_principal?: string | null;
          total_registros?: number | null;
          presencias?: number | null;
          ausencias?: number | null;
          justificados?: number | null;
          pct_ausencias?: number | null;
        };
      };
      catalogo_niveles: {
        Row: {
          id: string | null;
          nombre: string | null;
          instrumento: string | null;
          orden: number | null;
          activo: boolean | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          instrumento?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          instrumento?: string | null;
          orden?: number | null;
          activo?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      notification_trigger_logs: {
        Row: {
          id: string | null;
          execution_time: string | null;
          status: string | null;
          maestros_processed: number | null;
          notifications_created: number | null;
          errors_count: number | null;
          error_message: string | null;
          context: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          execution_time?: string | null;
          status?: string | null;
          maestros_processed?: number | null;
          notifications_created?: number | null;
          errors_count?: number | null;
          error_message?: string | null;
          context?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          execution_time?: string | null;
          status?: string | null;
          maestros_processed?: number | null;
          notifications_created?: number | null;
          errors_count?: number | null;
          error_message?: string | null;
          context?: string | null;
          created_at?: string | null;
        };
      };
      alumno_plan_entradas: {
        Row: {
          id: string | null;
          alumno_id: string | null;
          maestro_id: string | null;
          tipo: string | null;
          titulo: string | null;
          descripcion: string | null;
          objetivo_id: string | null;
          nivel_referencia: string | null;
          sesion_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          alumno_id?: string | null;
          maestro_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          objetivo_id?: string | null;
          nivel_referencia?: string | null;
          sesion_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          alumno_id?: string | null;
          maestro_id?: string | null;
          tipo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          objetivo_id?: string | null;
          nivel_referencia?: string | null;
          sesion_id?: string | null;
          created_at?: string | null;
        };
      };
      whatsapp_optout: {
        Row: {
          jid: string | null;
          motivo: string | null;
          created_at: string | null;
        };
        Insert: {
          jid?: string | null;
          motivo?: string | null;
          created_at?: string | null;
        };
        Update: {
          jid?: string | null;
          motivo?: string | null;
          created_at?: string | null;
        };
      };
      plan_objetivos: {
        Row: {
          id: string | null;
          tema_id: string | null;
          nombre: string | null;
          orden_index: number | null;
        };
        Insert: {
          id?: string | null;
          tema_id?: string | null;
          nombre?: string | null;
          orden_index?: number | null;
        };
        Update: {
          id?: string | null;
          tema_id?: string | null;
          nombre?: string | null;
          orden_index?: number | null;
        };
      };
      vw_comodatos_en_riesgo: {
        Row: {
          representante_id: string | null;
          familia_id: string | null;
          rep_nombre: string | null;
          nombre_familia: string | null;
          score: number | null;
          nivel: string | null;
        };
        Insert: {
          representante_id?: string | null;
          familia_id?: string | null;
          rep_nombre?: string | null;
          nombre_familia?: string | null;
          score?: number | null;
          nivel?: string | null;
        };
        Update: {
          representante_id?: string | null;
          familia_id?: string | null;
          rep_nombre?: string | null;
          nombre_familia?: string | null;
          score?: number | null;
          nivel?: string | null;
        };
      };
      maestro_access_credentials: {
        Row: {
          maestro_id: string | null;
          password_ciphertext: string | null;
          password_iv: string | null;
          password_version: number | null;
          last_generated_at: string | null;
          last_revealed_at: string | null;
          last_revealed_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          maestro_id?: string | null;
          password_ciphertext?: string | null;
          password_iv?: string | null;
          password_version?: number | null;
          last_generated_at?: string | null;
          last_revealed_at?: string | null;
          last_revealed_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          maestro_id?: string | null;
          password_ciphertext?: string | null;
          password_iv?: string | null;
          password_version?: number | null;
          last_generated_at?: string | null;
          last_revealed_at?: string | null;
          last_revealed_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      accesorio_asignaciones: {
        Row: {
          id: string | null;
          accesorio_id: string | null;
          alumno_id: string | null;
          familia_id: string | null;
          cantidad: number | null;
          precio_unitario: number | null;
          monto_total: number | null;
          estado: string | null;
          aprobacion_requerida: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          accesorio_id?: string | null;
          alumno_id?: string | null;
          familia_id?: string | null;
          cantidad?: number | null;
          precio_unitario?: number | null;
          monto_total?: number | null;
          estado?: string | null;
          aprobacion_requerida?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          accesorio_id?: string | null;
          alumno_id?: string | null;
          familia_id?: string | null;
          cantidad?: number | null;
          precio_unitario?: number | null;
          monto_total?: number | null;
          estado?: string | null;
          aprobacion_requerida?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      departamentos: {
        Row: {
          id: string | null;
          nombre: string | null;
          codigo: string | null;
          descripcion: string | null;
          jefe_id: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          email: string | null;
          responsable_nombre: string | null;
          responsable_email: string | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          codigo?: string | null;
          descripcion?: string | null;
          jefe_id?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          email?: string | null;
          responsable_nombre?: string | null;
          responsable_email?: string | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          codigo?: string | null;
          descripcion?: string | null;
          jefe_id?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          email?: string | null;
          responsable_nombre?: string | null;
          responsable_email?: string | null;
        };
      };
      teacher_class_fill_metrics_aggregated: {
        Row: {
          maestro_id: string | null;
          maestro_nombre: string | null;
          total_clases: number | null;
          orden_asistencia_primero: number | null;
          orden_observaciones_primero: number | null;
          orden_simultaneo: number | null;
          incompleto_falta_asistencia: number | null;
          incompleto_falta_observaciones: number | null;
          incompleto_falta_ambos: number | null;
          promedio_duracion_observaciones: number | null;
          uso_ai_fill_percent: number | null;
          fecha_ultima_clase: string | null;
        };
        Insert: {
          maestro_id?: string | null;
          maestro_nombre?: string | null;
          total_clases?: number | null;
          orden_asistencia_primero?: number | null;
          orden_observaciones_primero?: number | null;
          orden_simultaneo?: number | null;
          incompleto_falta_asistencia?: number | null;
          incompleto_falta_observaciones?: number | null;
          incompleto_falta_ambos?: number | null;
          promedio_duracion_observaciones?: number | null;
          uso_ai_fill_percent?: number | null;
          fecha_ultima_clase?: string | null;
        };
        Update: {
          maestro_id?: string | null;
          maestro_nombre?: string | null;
          total_clases?: number | null;
          orden_asistencia_primero?: number | null;
          orden_observaciones_primero?: number | null;
          orden_simultaneo?: number | null;
          incompleto_falta_asistencia?: number | null;
          incompleto_falta_observaciones?: number | null;
          incompleto_falta_ambos?: number | null;
          promedio_duracion_observaciones?: number | null;
          uso_ai_fill_percent?: number | null;
          fecha_ultima_clase?: string | null;
        };
      };
      tareas_portales: {
        Row: {
          id: string | null;
          codigo: string | null;
          titulo: string | null;
          descripcion: string | null;
          generada_por: string | null;
          protocolo_id: string | null;
          departamento: string | null;
          responsable_id: string | null;
          responsable_nombre: string | null;
          responsable_email: string | null;
          responsable_whatsapp: string | null;
          prioridad: string | null;
          tipo_tarea: string | null;
          categoria: string | null;
          contexto: any | null;
          fecha_vencimiento: string | null;
          estado: string | null;
          progreso_porcentaje: number | null;
          feedback_texto: string | null;
          feedback_puntuacion: number | null;
          feedback_causa_raiz: string | null;
          feedback_accion_realizada: string | null;
          feedback_fecha: string | null;
          fecha_creacion: string | null;
          fecha_completacion: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          codigo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          generada_por?: string | null;
          protocolo_id?: string | null;
          departamento?: string | null;
          responsable_id?: string | null;
          responsable_nombre?: string | null;
          responsable_email?: string | null;
          responsable_whatsapp?: string | null;
          prioridad?: string | null;
          tipo_tarea?: string | null;
          categoria?: string | null;
          contexto?: any | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          progreso_porcentaje?: number | null;
          feedback_texto?: string | null;
          feedback_puntuacion?: number | null;
          feedback_causa_raiz?: string | null;
          feedback_accion_realizada?: string | null;
          feedback_fecha?: string | null;
          fecha_creacion?: string | null;
          fecha_completacion?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          codigo?: string | null;
          titulo?: string | null;
          descripcion?: string | null;
          generada_por?: string | null;
          protocolo_id?: string | null;
          departamento?: string | null;
          responsable_id?: string | null;
          responsable_nombre?: string | null;
          responsable_email?: string | null;
          responsable_whatsapp?: string | null;
          prioridad?: string | null;
          tipo_tarea?: string | null;
          categoria?: string | null;
          contexto?: any | null;
          fecha_vencimiento?: string | null;
          estado?: string | null;
          progreso_porcentaje?: number | null;
          feedback_texto?: string | null;
          feedback_puntuacion?: number | null;
          feedback_causa_raiz?: string | null;
          feedback_accion_realizada?: string | null;
          feedback_fecha?: string | null;
          fecha_creacion?: string | null;
          fecha_completacion?: string | null;
          updated_at?: string | null;
        };
      };
      hermes_notificaciones: {
        Row: {
          id: string | null;
          destinatario: string | null;
          tipo: string | null;
          asunto: string | null;
          mensaje: string | null;
          accion_id: string | null;
          estado: string | null;
          fecha_envio: string | null;
          fecha_lectura: string | null;
        };
        Insert: {
          id?: string | null;
          destinatario?: string | null;
          tipo?: string | null;
          asunto?: string | null;
          mensaje?: string | null;
          accion_id?: string | null;
          estado?: string | null;
          fecha_envio?: string | null;
          fecha_lectura?: string | null;
        };
        Update: {
          id?: string | null;
          destinatario?: string | null;
          tipo?: string | null;
          asunto?: string | null;
          mensaje?: string | null;
          accion_id?: string | null;
          estado?: string | null;
          fecha_envio?: string | null;
          fecha_lectura?: string | null;
        };
      };
      lut_presupuestos: {
        Row: {
          id: string | null;
          orden_id: string | null;
          estado: string | null;
          subtotal_mano_obra: number | null;
          subtotal_materiales: number | null;
          subtotal_servicios_externos: number | null;
          descuento: number | null;
          monto_institucion: number | null;
          monto_representante: number | null;
          total: number | null;
          aprobado_por: string | null;
          aprobado_en: string | null;
          observaciones: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          orden_id?: string | null;
          estado?: string | null;
          subtotal_mano_obra?: number | null;
          subtotal_materiales?: number | null;
          subtotal_servicios_externos?: number | null;
          descuento?: number | null;
          monto_institucion?: number | null;
          monto_representante?: number | null;
          total?: number | null;
          aprobado_por?: string | null;
          aprobado_en?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          orden_id?: string | null;
          estado?: string | null;
          subtotal_mano_obra?: number | null;
          subtotal_materiales?: number | null;
          subtotal_servicios_externos?: number | null;
          descuento?: number | null;
          monto_institucion?: number | null;
          monto_representante?: number | null;
          total?: number | null;
          aprobado_por?: string | null;
          aprobado_en?: string | null;
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      exoneraciones: {
        Row: {
          id: string | null;
          cuota_id: string | null;
          familia_id: string | null;
          tipo: string | null;
          porcentaje: number | null;
          motivo: string | null;
          aprobado_por: string | null;
          documento_url: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          activa: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          cuota_id?: string | null;
          familia_id?: string | null;
          tipo?: string | null;
          porcentaje?: number | null;
          motivo?: string | null;
          aprobado_por?: string | null;
          documento_url?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activa?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          cuota_id?: string | null;
          familia_id?: string | null;
          tipo?: string | null;
          porcentaje?: number | null;
          motivo?: string | null;
          aprobado_por?: string | null;
          documento_url?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activa?: boolean | null;
          created_at?: string | null;
        };
      };
      schedule_run_feedback: {
        Row: {
          id: string | null;
          run_id: string | null;
          usuario_id: string | null;
          comentario: string | null;
          tipo: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          run_id?: string | null;
          usuario_id?: string | null;
          comentario?: string | null;
          tipo?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          run_id?: string | null;
          usuario_id?: string | null;
          comentario?: string | null;
          tipo?: string | null;
          created_at?: string | null;
        };
      };
      soi_analisis_semanal: {
        Row: {
          id: string | null;
          periodo_inicio: string | null;
          periodo_fin: string | null;
          total_eventos_analizados: number | null;
          resumen_ejecutivo: string | null;
          patrones: any | null;
          tendencias: any | null;
          recomendaciones: any | null;
          score_promedio: number | null;
          modelo_usado: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          periodo_inicio?: string | null;
          periodo_fin?: string | null;
          total_eventos_analizados?: number | null;
          resumen_ejecutivo?: string | null;
          patrones?: any | null;
          tendencias?: any | null;
          recomendaciones?: any | null;
          score_promedio?: number | null;
          modelo_usado?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          periodo_inicio?: string | null;
          periodo_fin?: string | null;
          total_eventos_analizados?: number | null;
          resumen_ejecutivo?: string | null;
          patrones?: any | null;
          tendencias?: any | null;
          recomendaciones?: any | null;
          score_promedio?: number | null;
          modelo_usado?: string | null;
          created_at?: string | null;
        };
      };
      teacher_session_indicators: {
        Row: {
          id: string | null;
          session_id: string | null;
          indicator_id: string | null;
          planned_topic: string | null;
          planned_objective: string | null;
          worked_status: string | null;
          teacher_notes: string | null;
          next_action: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          session_id?: string | null;
          indicator_id?: string | null;
          planned_topic?: string | null;
          planned_objective?: string | null;
          worked_status?: string | null;
          teacher_notes?: string | null;
          next_action?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          session_id?: string | null;
          indicator_id?: string | null;
          planned_topic?: string | null;
          planned_objective?: string | null;
          worked_status?: string | null;
          teacher_notes?: string | null;
          next_action?: string | null;
          created_at?: string | null;
        };
      };
      hermes_whatsapp_config: {
        Row: {
          id: string | null;
          gateway_url: string | null;
          api_key: string | null;
          instance_name: string | null;
          activo: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          jitter_min_seg: number | null;
          jitter_max_seg: number | null;
          cap_diario: number | null;
          cap_horario: number | null;
          batch_size: number | null;
          batch_cooldown_seg: number | null;
          warmup_inicio: number | null;
          warmup_dias: number | null;
          warmup_desde: string | null;
          rate_limit_hora: number | null;
          numero_wid: string | null;
          numero_nombre: string | null;
          consentimiento_registrado: boolean | null;
        };
        Insert: {
          id?: string | null;
          gateway_url?: string | null;
          api_key?: string | null;
          instance_name?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          jitter_min_seg?: number | null;
          jitter_max_seg?: number | null;
          cap_diario?: number | null;
          cap_horario?: number | null;
          batch_size?: number | null;
          batch_cooldown_seg?: number | null;
          warmup_inicio?: number | null;
          warmup_dias?: number | null;
          warmup_desde?: string | null;
          rate_limit_hora?: number | null;
          numero_wid?: string | null;
          numero_nombre?: string | null;
          consentimiento_registrado?: boolean | null;
        };
        Update: {
          id?: string | null;
          gateway_url?: string | null;
          api_key?: string | null;
          instance_name?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          jitter_min_seg?: number | null;
          jitter_max_seg?: number | null;
          cap_diario?: number | null;
          cap_horario?: number | null;
          batch_size?: number | null;
          batch_cooldown_seg?: number | null;
          warmup_inicio?: number | null;
          warmup_dias?: number | null;
          warmup_desde?: string | null;
          rate_limit_hora?: number | null;
          numero_wid?: string | null;
          numero_nombre?: string | null;
          consentimiento_registrado?: boolean | null;
        };
      };
      maestro_objetivos: {
        Row: {
          id: string | null;
          unidad_id: string | null;
          orden: number | null;
          nombre: string | null;
          descripcion: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          unidad_id?: string | null;
          orden?: number | null;
          nombre?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          unidad_id?: string | null;
          orden?: number | null;
          nombre?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
        };
      };
      vw_asistencias_clases_formato: {
        Row: {
          fecha: string | null;
          sesion_clase_id: string | null;
          clase_id: string | null;
          resumen_formateado: string | null;
        };
        Insert: {
          fecha?: string | null;
          sesion_clase_id?: string | null;
          clase_id?: string | null;
          resumen_formateado?: string | null;
        };
        Update: {
          fecha?: string | null;
          sesion_clase_id?: string | null;
          clase_id?: string | null;
          resumen_formateado?: string | null;
        };
      };
      whatsapp_webhook_log: {
        Row: {
          id: string | null;
          message_id: string | null;
          jid_remitente: string | null;
          postulante_id: string | null;
          mensaje_texto: string | null;
          push_name: string | null;
          intencion_detectada: string | null;
          confianza: number | null;
          argumento: string | null;
          respuesta_enviada: string | null;
          estado_conversacion_nuevo: string | null;
          accion_pipeline: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          message_id?: string | null;
          jid_remitente?: string | null;
          postulante_id?: string | null;
          mensaje_texto?: string | null;
          push_name?: string | null;
          intencion_detectada?: string | null;
          confianza?: number | null;
          argumento?: string | null;
          respuesta_enviada?: string | null;
          estado_conversacion_nuevo?: string | null;
          accion_pipeline?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          message_id?: string | null;
          jid_remitente?: string | null;
          postulante_id?: string | null;
          mensaje_texto?: string | null;
          push_name?: string | null;
          intencion_detectada?: string | null;
          confianza?: number | null;
          argumento?: string | null;
          respuesta_enviada?: string | null;
          estado_conversacion_nuevo?: string | null;
          accion_pipeline?: any | null;
          created_at?: string | null;
        };
      };
      campanias_periodo: {
        Row: {
          id: string | null;
          nombre: string | null;
          tipo: string | null;
          accion: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          activo: boolean | null;
          periodo_academico_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          abre_servicio_publico: boolean | null;
        };
        Insert: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          accion?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          periodo_academico_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          abre_servicio_publico?: boolean | null;
        };
        Update: {
          id?: string | null;
          nombre?: string | null;
          tipo?: string | null;
          accion?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          activo?: boolean | null;
          periodo_academico_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          abre_servicio_publico?: boolean | null;
        };
      };
      vw_ingresos_diarios: {
        Row: {
          metodo_pago: string | null;
          cantidad_pagos: number | null;
          total_centavos: number | null;
          primer_pago: string | null;
          ultimo_pago: string | null;
        };
        Insert: {
          metodo_pago?: string | null;
          cantidad_pagos?: number | null;
          total_centavos?: number | null;
          primer_pago?: string | null;
          ultimo_pago?: string | null;
        };
        Update: {
          metodo_pago?: string | null;
          cantidad_pagos?: number | null;
          total_centavos?: number | null;
          primer_pago?: string | null;
          ultimo_pago?: string | null;
        };
      };
      system_config: {
        Row: {
          key: string | null;
          value: string | null;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          key?: string | null;
          value?: string | null;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          key?: string | null;
          value?: string | null;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      autorizaciones_accesorio: {
        Row: {
          id: string | null;
          familia_id: string | null;
          representante_id: string | null;
          monto_maximo: number | null;
          categorias_incluidas: string[] | null;
          activa: boolean | null;
          fecha_firma: string | null;
        };
        Insert: {
          id?: string | null;
          familia_id?: string | null;
          representante_id?: string | null;
          monto_maximo?: number | null;
          categorias_incluidas?: string[] | null;
          activa?: boolean | null;
          fecha_firma?: string | null;
        };
        Update: {
          id?: string | null;
          familia_id?: string | null;
          representante_id?: string | null;
          monto_maximo?: number | null;
          categorias_incluidas?: string[] | null;
          activa?: boolean | null;
          fecha_firma?: string | null;
        };
      };
      vw_instrumentos_disponibles: {
        Row: {
          id: string | null;
          codigo_inventario: string | null;
          tipo_instrumento: string | null;
          marca: string | null;
          modelo: string | null;
          estado_conservacion: string | null;
          ubicacion: string | null;
          foto_url: string | null;
          comodato_activo_id: string | null;
        };
        Insert: {
          id?: string | null;
          codigo_inventario?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          estado_conservacion?: string | null;
          ubicacion?: string | null;
          foto_url?: string | null;
          comodato_activo_id?: string | null;
        };
        Update: {
          id?: string | null;
          codigo_inventario?: string | null;
          tipo_instrumento?: string | null;
          marca?: string | null;
          modelo?: string | null;
          estado_conservacion?: string | null;
          ubicacion?: string | null;
          foto_url?: string | null;
          comodato_activo_id?: string | null;
        };
      };
      route_versions: {
        Row: {
          id: string | null;
          route_id: string | null;
          version: string | null;
          status: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string | null;
          published_at: string | null;
        };
        Insert: {
          id?: string | null;
          route_id?: string | null;
          version?: string | null;
          status?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          published_at?: string | null;
        };
        Update: {
          id?: string | null;
          route_id?: string | null;
          version?: string | null;
          status?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          published_at?: string | null;
        };
      };
      indicator_sessions: {
        Row: {
          id: string | null;
          maestro_id: string | null;
          clase_id: string | null;
          fecha: string | null;
          descripcion: string | null;
          created_at: string | null;
          updated_at: string | null;
          objetivo_id: string | null;
        };
        Insert: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          fecha?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          objetivo_id?: string | null;
        };
        Update: {
          id?: string | null;
          maestro_id?: string | null;
          clase_id?: string | null;
          fecha?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          objetivo_id?: string | null;
        };
      };
      acm_weekly_plan_items: {
        Row: {
          id: string | null;
          weekly_plan_id: string | null;
          node_id: string | null;
          indicator_id: string | null;
          topic: string | null;
          objective: string | null;
          teacher_strategy: string | null;
          student_activity: string | null;
          homework: string | null;
          materials: string | null;
          evidence: string | null;
          assessment_method: string | null;
          estimated_minutes: number | null;
          order_index: number | null;
          is_required: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          weekly_plan_id?: string | null;
          node_id?: string | null;
          indicator_id?: string | null;
          topic?: string | null;
          objective?: string | null;
          teacher_strategy?: string | null;
          student_activity?: string | null;
          homework?: string | null;
          materials?: string | null;
          evidence?: string | null;
          assessment_method?: string | null;
          estimated_minutes?: number | null;
          order_index?: number | null;
          is_required?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          weekly_plan_id?: string | null;
          node_id?: string | null;
          indicator_id?: string | null;
          topic?: string | null;
          objective?: string | null;
          teacher_strategy?: string | null;
          student_activity?: string | null;
          homework?: string | null;
          materials?: string | null;
          evidence?: string | null;
          assessment_method?: string | null;
          estimated_minutes?: number | null;
          order_index?: number | null;
          is_required?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      cierres_caja: {
        Row: {
          id: string | null;
          fecha: string | null;
          cajero_id: string | null;
          total_general_centavos: number | null;
          por_metodo: any | null;
          cantidad_transacciones: number | null;
          estado: string | null;
          notas: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          fecha?: string | null;
          cajero_id?: string | null;
          total_general_centavos?: number | null;
          por_metodo?: any | null;
          cantidad_transacciones?: number | null;
          estado?: string | null;
          notas?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          fecha?: string | null;
          cajero_id?: string | null;
          total_general_centavos?: number | null;
          por_metodo?: any | null;
          cantidad_transacciones?: number | null;
          estado?: string | null;
          notas?: string | null;
          created_at?: string | null;
        };
      };
      vw_resumen_alumno: {
        Row: {
          id: string | null;
          nombre_completo: string | null;
          instrumento_principal: string | null;
          nivel: string | null;
          activo: boolean | null;
          total_clases: number | null;
          presencias: number | null;
          ausencias: number | null;
          justificados: number | null;
          tasa_asistencia: number | null;
          ausencias_28d: number | null;
          ausencias_14d: number | null;
          promedio_calificacion: number | null;
          total_evaluaciones: number | null;
          ultima_evaluacion: string | null;
          obs_abiertas: number | null;
          obs_seguimiento: number | null;
          obs_resueltas: number | null;
          alertas_alta: number | null;
        };
        Insert: {
          id?: string | null;
          nombre_completo?: string | null;
          instrumento_principal?: string | null;
          nivel?: string | null;
          activo?: boolean | null;
          total_clases?: number | null;
          presencias?: number | null;
          ausencias?: number | null;
          justificados?: number | null;
          tasa_asistencia?: number | null;
          ausencias_28d?: number | null;
          ausencias_14d?: number | null;
          promedio_calificacion?: number | null;
          total_evaluaciones?: number | null;
          ultima_evaluacion?: string | null;
          obs_abiertas?: number | null;
          obs_seguimiento?: number | null;
          obs_resueltas?: number | null;
          alertas_alta?: number | null;
        };
        Update: {
          id?: string | null;
          nombre_completo?: string | null;
          instrumento_principal?: string | null;
          nivel?: string | null;
          activo?: boolean | null;
          total_clases?: number | null;
          presencias?: number | null;
          ausencias?: number | null;
          justificados?: number | null;
          tasa_asistencia?: number | null;
          ausencias_28d?: number | null;
          ausencias_14d?: number | null;
          promedio_calificacion?: number | null;
          total_evaluaciones?: number | null;
          ultima_evaluacion?: string | null;
          obs_abiertas?: number | null;
          obs_seguimiento?: number | null;
          obs_resueltas?: number | null;
          alertas_alta?: number | null;
        };
      };
      maestro_unidades: {
        Row: {
          id: string | null;
          ruta_id: string | null;
          orden: number | null;
          nombre: string | null;
          descripcion: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          ruta_id?: string | null;
          orden?: number | null;
          nombre?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          ruta_id?: string | null;
          orden?: number | null;
          nombre?: string | null;
          descripcion?: string | null;
          created_at?: string | null;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: {
        };
        Returns: any;
      };
      aprobar_usuario: {
        Args: {
          p_user_id: string;
        };
        Returns: any;
      };
      ensure_session_and_save_evaluation: {
        Args: {
          p_clase_id: string;
          p_fecha: string;
          p_hora_inicio: string;
          p_indicator_id: string;
          p_maestro_id: string;
          p_nota: number;
          p_observations: string;
          p_student_id: string;
        };
        Returns: any;
      };
      _fn_crear_tarea_caso: {
        Args: {
          p_actor_id: string;
          p_actor_nombre: string;
          p_corr: string;
          p_depto: string;
          p_desc: string;
          p_entidad_id: string;
          p_entidad_label: string;
          p_entidad_tipo: string;
          p_prioridad: string;
          p_titulo: string;
        };
        Returns: any;
      };
      fn_whatsapp_reclamar_pendientes: {
        Args: {
          p_limite?: number;
        };
        Returns: any;
      };
      fn_lut_upsert_diagnostico: {
        Args: {
          p_causa_probable?: string;
          p_costo_materiales?: number;
          p_diagnosticado_por?: string;
          p_diagnosticado_por_nombre?: string;
          p_diagnostico_tecnico: string;
          p_gravedad?: string;
          p_items: any;
          p_materiales_requeridos?: string;
          p_observaciones?: string;
          p_orden_id: string;
          p_reparacion_recomendada?: string;
          p_requiere_servicio_externo?: boolean;
          p_tiempo_estimado_horas?: number;
          p_tipo_dano?: string;
          p_zona_afectada?: string;
        };
        Returns: any;
      };
      get_app_user_role: {
        Args: {
        };
        Returns: any;
      };
      fn_whatsapp_enviados_hoy: {
        Args: {
        };
        Returns: any;
      };
      fn_hermes_escalar_tareas_bloqueadas: {
        Args: {
        };
        Returns: any;
      };
      fn_crear_familia_para_alumno: {
        Args: {
          p_nombre: string;
        };
        Returns: any;
      };
      fn_upsert_protocolo: {
        Args: {
          p_descripcion?: string;
          p_nombre: string;
          p_tareas?: any;
          p_tipo: string;
        };
        Returns: any;
      };
      fn_calcular_score_representante: {
        Args: {
          p_anio: number;
          p_mes: number;
          p_representante_id: string;
        };
        Returns: any;
      };
      fn_preview_campania: {
        Args: {
          p_id: string;
        };
        Returns: any;
      };
      fn_fusionar_alumnos_duplicados: {
        Args: {
          p_datos_fusion: any;
          p_obsoleto_id: string;
          p_principal_id: string;
        };
        Returns: any;
      };
      fn_aplicar_becas_ciclo: {
        Args: {
          p_anio: number;
          p_mes: number;
        };
        Returns: any;
      };
      fn_registrar_pago_transaccional: {
        Args: {
          p_cuota_ids: string[];
          p_familia_id: string;
          p_metodo_pago: string;
          p_monto_centavos: number;
          p_notas: string;
          p_referencia: string;
        };
        Returns: any;
      };
      get_user_role: {
        Args: {
        };
        Returns: any;
      };
      intercambiar_instrumentos: {
        Args: {
          p_activo_destino_id: string;
          p_alumno_id: string;
          p_comodato_origen_id: string;
        };
        Returns: any;
      };
      fn_validar_cierre_periodo: {
        Args: {
          p_periodo_id: string;
        };
        Returns: any;
      };
      cambiar_estado_activo: {
        Args: {
          p_id: string;
          p_nuevo_estado: string;
        };
        Returns: any;
      };
      generar_reporte_inventario: {
        Args: {
          p_filtros?: any;
          p_tipo: string;
        };
        Returns: any;
      };
      is_app_admin: {
        Args: {
        };
        Returns: any;
      };
      profile_is_active: {
        Args: {
        };
        Returns: any;
      };
      fn_get_indice_ensenanza_guiada: {
        Args: {
        };
        Returns: any;
      };
      fn_obtener_tareas_departamento: {
        Args: {
          p_departamento_id?: string;
          p_estado?: string;
        };
        Returns: any;
      };
      es_coordinador_acm: {
        Args: {
        };
        Returns: any;
      };
      fn_portal_maestro_bloqueado: {
        Args: {
        };
        Returns: any;
      };
      fn_escalar_mora: {
        Args: {
        };
        Returns: any;
      };
      fn_encolar_campania: {
        Args: {
          p_campania_id: string;
          p_limite?: number;
        };
        Returns: any;
      };
      fn_servicio_publico_activo: {
        Args: {
        };
        Returns: any;
      };
      crear_reparacion: {
        Args: {
          p_activo_id: string;
          p_costo_estimado: number;
          p_descripcion: string;
          p_proveedor_factura_url?: string;
          p_tallerista_nombre: string;
          p_tipo_tallerista: string;
        };
        Returns: any;
      };
      fn_periodo_vigente: {
        Args: {
          p_fecha?: string;
        };
        Returns: any;
      };
      teacher_can_create_students: {
        Args: {
        };
        Returns: any;
      };
      count_alumnos_activos: {
        Args: {
        };
        Returns: any;
      };
      fn_procedimientos_resumen: {
        Args: {
        };
        Returns: any;
      };
      fn_sugerir_nodo_por_texto: {
        Args: {
          p_texto: string;
        };
        Returns: any;
      };
      fn_crear_evento_calendario: {
        Args: {
          p_departamento_id: string;
          p_descripcion?: string;
          p_fecha_alerta?: number;
          p_fecha_fin?: string;
          p_fecha_inicio?: string;
          p_notas?: string;
          p_prioridad?: string;
          p_protocolo_json?: any;
          p_responsable_id?: string;
          p_tipo?: string;
          p_titulo: string;
        };
        Returns: any;
      };
      fn_desplazar_cronograma_evento: {
        Args: {
          p_delta_dias: number;
          p_event_id: string;
        };
        Returns: any;
      };
      fn_hermes_force_close_process_case: {
        Args: {
          p_actor_id?: string;
          p_actor_nombre?: string;
          p_case_id: string;
          p_closure_summary?: string;
        };
        Returns: any;
      };
      rechazar_usuario: {
        Args: {
          p_user_id: string;
        };
        Returns: any;
      };
      fn_whatsapp_cap_hoy: {
        Args: {
        };
        Returns: any;
      };
      fn_check_and_notify_pending_asistencias: {
        Args: {
        };
        Returns: any;
      };
      es_admin: {
        Args: {
        };
        Returns: any;
      };
      fn_reportar_alumno_riesgo: {
        Args: {
          p_actor_id: string;
          p_actor_nombre: string;
          p_alumno_id: string;
          p_alumno_nombre: string;
          p_motivo: string;
        };
        Returns: any;
      };
      clonar_catalogo_a_clase: {
        Args: {
          p_clase_id: string;
          p_nivel_id: string;
          p_objetivo_general_ids?: string[];
        };
        Returns: any;
      };
      fn_activar_periodo: {
        Args: {
          p_periodo_id: string;
        };
        Returns: any;
      };
      fn_generate_class_start_reminders: {
        Args: {
        };
        Returns: any;
      };
      fn_generar_ciclo_cuotas: {
        Args: {
          p_anio: number;
          p_mes: number;
          p_monto_centavos?: number;
        };
        Returns: any;
      };
      normalize_phone: {
        Args: {
          raw: string;
        };
        Returns: any;
      };
      fn_verificar_conflicto_cita: {
        Args: {
          p_departamento?: string;
          p_fecha_fin: string;
          p_fecha_inicio: string;
        };
        Returns: any;
      };
      is_teacher: {
        Args: {
        };
        Returns: any;
      };
      diagnose_profiles_schema: {
        Args: {
        };
        Returns: any;
      };
      fn_hermes_close_process_case: {
        Args: {
          p_actor_id?: string;
          p_actor_nombre?: string;
          p_case_id: string;
          p_closure_summary?: string;
          p_force?: boolean;
        };
        Returns: any;
      };
      fn_hermes_consulta_estado: {
        Args: {
        };
        Returns: any;
      };
      fn_anular_sesiones_no_lectivas: {
        Args: {
          p_desde?: string;
          p_dry_run?: boolean;
          p_hasta?: string;
        };
        Returns: any;
      };
      cambiar_estado_reparacion: {
        Args: {
          p_id: string;
          p_nuevo_estado: string;
        };
        Returns: any;
      };
      maestro_actual: {
        Args: {
        };
        Returns: any;
      };
      es_maestro_titular_de_clase: {
        Args: {
          p_clase_id: string;
        };
        Returns: any;
      };
      fn_registrar_alerta_enviada: {
        Args: {
          p_canal: string;
          p_contenido: string;
          p_destinatario: string;
          p_tipo: string;
        };
        Returns: any;
      };
      fn_sincronizar_arbol_curricular: {
        Args: {
          p_clase_id: string;
          p_nombre: string;
          p_objetivos: any;
          p_plantilla_id?: string;
        };
        Returns: any;
      };
      generar_contrato_pdf: {
        Args: {
          p_comodato_id: string;
        };
        Returns: any;
      };
      show_trgm: {
        Args: {
          str: string;
        };
        Returns: any;
      };
      fn_reporte_indicadores_adicionales: {
        Args: {
          p_cobertura_minima_pct?: number;
          p_periodo_id: string;
        };
        Returns: any;
      };
      fn_generar_tareas_calendario: {
        Args: {
          p_evento_id: string;
        };
        Returns: any;
      };
      generate_pending_class_notifications: {
        Args: {
        };
        Returns: any;
      };
      get_my_rol: {
        Args: {
        };
        Returns: any;
      };
      fn_racha_ausencias: {
        Args: {
          p_alumno_id: string;
        };
        Returns: any;
      };
      fn_resumen_academico_integrado: {
        Args: {
          p_alumno_id: string;
          p_limite?: number;
        };
        Returns: any;
      };
      fn_cerrar_periodo_academico: {
        Args: {
          p_cerrado_por?: string;
          p_fecha_fin?: string;
          p_fecha_inicio?: string;
          p_forzar?: boolean;
          p_observaciones?: string;
          p_periodo_id: string;
        };
        Returns: any;
      };
      fn_tasa_asistencia_periodo: {
        Args: {
          p_alumno_id: string;
          p_desde: string;
          p_hasta?: string;
        };
        Returns: any;
      };
      registrar_justificacion_asistencia: {
        Args: {
          p_alumno_id: string;
          p_clase_id: string;
          p_fecha: string;
          p_motivo?: string;
        };
        Returns: any;
      };
      es_maestro_de_clase: {
        Args: {
          p_clase_id: string;
        };
        Returns: any;
      };
      obtener_kpi_inventario: {
        Args: {
        };
        Returns: any;
      };
      clone_route_version_as_draft: {
        Args: {
          p_source_version_id: string;
        };
        Returns: any;
      };
      fn_whatsapp_optout: {
        Args: {
          p_jid: string;
          p_motivo?: string;
        };
        Returns: any;
      };
      fn_actualizar_racha_alumno: {
        Args: {
          p_alumno_id: string;
          p_clase_id: string;
          p_fecha: string;
        };
        Returns: any;
      };
      renovar_comodato: {
        Args: {
          p_comodato_id: string;
          p_nueva_fecha_vencimiento: string;
          p_nuevo_tipo: string;
        };
        Returns: any;
      };
      clonar_plantilla_a_clase: {
        Args: {
          p_clase_id: string;
          p_node_ids?: string[];
          p_plantilla_id: string;
        };
        Returns: any;
      };
      validate_admin_invite_code: {
        Args: {
          p_code: string;
        };
        Returns: any;
      };
      validate_disponibilidad_json: {
        Args: {
          p_json: any;
        };
        Returns: any;
      };
      fn_activar_campania: {
        Args: {
          p_id: string;
        };
        Returns: any;
      };
      fn_hermes_start_process_case: {
        Args: {
          p_description?: string;
          p_entity_id?: string;
          p_entity_label?: string;
          p_entity_type?: string;
          p_metadata?: any;
          p_priority?: string;
          p_process_code: string;
          p_requested_by?: string;
          p_requested_by_name?: string;
          p_source?: string;
          p_title?: string;
        };
        Returns: any;
      };
      fn_reportar_instrumento_danado: {
        Args: {
          p_actor_id: string;
          p_actor_nombre: string;
          p_descripcion: string;
          p_instrumento_id: string;
        };
        Returns: any;
      };
      generar_numero_factura: {
        Args: {
        };
        Returns: any;
      };
      approve_maestro_profile: {
        Args: {
          p_new_estado?: string;
          p_new_rol: string;
          p_profile_id: string;
        };
        Returns: any;
      };
      fn_obtener_protocolo: {
        Args: {
          p_tipo: string;
        };
        Returns: any;
      };
      get_user_department: {
        Args: {
        };
        Returns: any;
      };
      fn_hermes_update_notif: {
        Args: {
          p_estado_wa: string;
          p_id: string;
          p_respuesta?: string;
        };
        Returns: any;
      };
      update_profile: {
        Args: {
          p_avatar_url: string;
          p_id: string;
          p_nombre_completo: string;
        };
        Returns: any;
      };
      get_user_familia_id: {
        Args: {
        };
        Returns: any;
      };
      refresh_maestro_desempeno: {
        Args: {
        };
        Returns: any;
      };
      get_alumnos_disponibles_para_inscripcion: {
        Args: {
        };
        Returns: any;
      };
      maestro_en_clase: {
        Args: {
          p_clase_id: string;
        };
        Returns: any;
      };
      fn_hermes_aprobar_whatsapp: {
        Args: {
          p_queue_id: string;
        };
        Returns: any;
      };
      fn_reporte_cierre_semestre: {
        Args: {
          p_dias_gracia_registro?: number;
          p_escala_calificacion?: number;
          p_periodo_id: string;
          p_umbral_asistencia_pct?: number;
          p_umbral_nota_pct?: number;
        };
        Returns: any;
      };
      fn_obtener_eventos_proximos: {
        Args: {
          p_dias_desde?: number;
          p_dias_hasta?: number;
        };
        Returns: any;
      };
      show_limit: {
        Args: {
        };
        Returns: any;
      };
      fn_correlacion_asistencia_rendimiento: {
        Args: {
        };
        Returns: any;
      };
      fn_eliminar_familia_huerfana: {
        Args: {
          p_familia_id: string;
        };
        Returns: any;
      };
      registrar_sesion_bitacora: {
        Args: {
          p_clase_id: string;
          p_fecha: string;
          p_notas: any;
          p_objetivo_id: string;
        };
        Returns: any;
      };
      fn_datos_jerarquicos_de_objetivo: {
        Args: {
          p_objetivo_id: string;
        };
        Returns: any;
      };
      fn_es_dia_lectivo: {
        Args: {
          p_fecha?: string;
        };
        Returns: any;
      };
      tiene_permiso: {
        Args: {
          p_permiso: string;
        };
        Returns: any;
      };
      backfill_alumnos_desde_postulantes: {
        Args: {
          dry_run?: boolean;
        };
        Returns: any;
      };
      fn_evaluar_logros_alumno: {
        Args: {
          p_alumno_id: string;
        };
        Returns: any;
      };
      fn_resumen_diario_director: {
        Args: {
        };
        Returns: any;
      };
      fn_calcular_pulso_score: {
        Args: {
          p_persistir?: boolean;
        };
        Returns: any;
      };
      analizar_seguimiento_alumnos: {
        Args: {
          p_busqueda?: string;
          p_desde?: string;
          p_hasta?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: any;
      };
      fn_observar_tarea: {
        Args: {
          p_actor_id: string;
          p_actor_nombre: string;
          p_comentario: string;
          p_tarea_id: string;
        };
        Returns: any;
      };
      cambiar_rol_usuario: {
        Args: {
          p_nuevo_rol: string;
          p_user_id: string;
        };
        Returns: any;
      };
      fn_email_departamento: {
        Args: {
          p_codigo: string;
        };
        Returns: any;
      };
      fn_hermes_queue_whatsapp: {
        Args: {
          p_jid: string;
          p_mensaje: string;
        };
        Returns: any;
      };
      fn_cobertura_curricular: {
        Args: {
          p_periodo_id: string;
        };
        Returns: any;
      };
      fn_hermes_rechazar_whatsapp: {
        Args: {
          p_motivo?: string;
          p_queue_id: string;
        };
        Returns: any;
      };
      fn_hermes_register_response: {
        Args: {
          p_notif_id?: string;
          p_response_text?: string;
          p_sender_name?: string;
          p_sender_whatsapp?: string;
        };
        Returns: any;
      };
      fn_estado_calendario: {
        Args: {
          p_fecha?: string;
        };
        Returns: any;
      };
      fn_actualizar_tarea: {
        Args: {
          p_notas?: string;
          p_nuevo_estado: string;
          p_tarea_id: string;
        };
        Returns: any;
      };
      fn_hermes_orquestar_protocolo: {
        Args: {
          p_evento_id: string;
          p_protocolo_id: string;
        };
        Returns: any;
      };
      fn_evaluacion_cobertura: {
        Args: {
          p_clase_id: string;
        };
        Returns: any;
      };
      fn_whatsapp_rate_excedido: {
        Args: {
          p_jid: string;
        };
        Returns: any;
      };
      fn_listar_protocolos: {
        Args: {
        };
        Returns: any;
      };
    };
  };
}
