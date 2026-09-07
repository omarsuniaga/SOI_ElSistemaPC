export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_plans: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          programa_id: string | null
          started_at: string | null
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          programa_id?: string | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          programa_id?: string | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_plans_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "academic_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      accesorio_asignaciones: {
        Row: {
          accesorio_id: string
          alumno_id: string
          aprobacion_requerida: boolean | null
          cantidad: number
          created_at: string | null
          estado: Database["public"]["Enums"]["asignacion_estado"]
          familia_id: string
          id: string
          monto_total: number
          precio_unitario: number
          updated_at: string | null
        }
        Insert: {
          accesorio_id: string
          alumno_id: string
          aprobacion_requerida?: boolean | null
          cantidad?: number
          created_at?: string | null
          estado?: Database["public"]["Enums"]["asignacion_estado"]
          familia_id: string
          id?: string
          monto_total: number
          precio_unitario: number
          updated_at?: string | null
        }
        Update: {
          accesorio_id?: string
          alumno_id?: string
          aprobacion_requerida?: boolean | null
          cantidad?: number
          created_at?: string | null
          estado?: Database["public"]["Enums"]["asignacion_estado"]
          familia_id?: string
          id?: string
          monto_total?: number
          precio_unitario?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accesorio_asignaciones_accesorio_id_fkey"
            columns: ["accesorio_id"]
            isOneToOne: false
            referencedRelation: "accesorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_accesorio_id_fkey"
            columns: ["accesorio_id"]
            isOneToOne: false
            referencedRelation: "vw_stock_bajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "accesorio_asignaciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      accesorios: {
        Row: {
          activo: boolean | null
          categoria: string
          created_at: string | null
          descripcion: string | null
          id: string
          links_externos: Json | null
          nombre: string
          precio_unitario: number
          stock_actual: number
          stock_minimo: number
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          categoria: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          links_externos?: Json | null
          nombre: string
          precio_unitario: number
          stock_actual?: number
          stock_minimo?: number
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          categoria?: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          links_externos?: Json | null
          nombre?: string
          precio_unitario?: number
          stock_actual?: number
          stock_minimo?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      acm_active_routes: {
        Row: {
          area_id: string | null
          created_at: string
          current_week: number
          end_date: string | null
          group_id: string | null
          id: string
          instrument_id: string | null
          level_id: string | null
          module_id: string | null
          phase_id: string | null
          program_id: string | null
          start_date: string
          status: string
          teacher_id: string | null
          updated_at: string
          weekly_plan_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          current_week?: number
          end_date?: string | null
          group_id?: string | null
          id?: string
          instrument_id?: string | null
          level_id?: string | null
          module_id?: string | null
          phase_id?: string | null
          program_id?: string | null
          start_date?: string
          status?: string
          teacher_id?: string | null
          updated_at?: string
          weekly_plan_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          current_week?: number
          end_date?: string | null
          group_id?: string | null
          id?: string
          instrument_id?: string | null
          level_id?: string | null
          module_id?: string | null
          phase_id?: string | null
          program_id?: string | null
          start_date?: string
          status?: string
          teacher_id?: string | null
          updated_at?: string
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acm_active_routes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_active_routes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "acm_active_routes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_active_routes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_active_routes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "acm_active_routes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_active_routes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "acm_active_routes_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "acm_weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      acm_curriculum_sources: {
        Row: {
          author: string | null
          created_at: string
          file_name: string
          file_path: string | null
          id: string
          notes: string | null
          raw_text: string | null
          related_version_id: string | null
          source_type: string
          status: string
          title: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
          version_label: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          file_name: string
          file_path?: string | null
          id?: string
          notes?: string | null
          raw_text?: string | null
          related_version_id?: string | null
          source_type: string
          status?: string
          title: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          version_label?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          file_name?: string
          file_path?: string | null
          id?: string
          notes?: string | null
          raw_text?: string | null
          related_version_id?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          version_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acm_curriculum_sources_related_version_fkey"
            columns: ["related_version_id"]
            isOneToOne: false
            referencedRelation: "acm_curriculum_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_curriculum_sources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acm_curriculum_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          program_id: string | null
          source_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          program_id?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          program_id?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acm_curriculum_versions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_curriculum_versions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_curriculum_versions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "acm_curriculum_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      acm_evidence_files: {
        Row: {
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string
          group_id: string | null
          id: string
          indicator_id: string | null
          session_id: string | null
          student_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url: string
          group_id?: string | null
          id?: string
          indicator_id?: string | null
          session_id?: string | null
          student_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string
          group_id?: string | null
          id?: string
          indicator_id?: string | null
          session_id?: string | null
          student_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acm_evidence_files_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "acm_evidence_files_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "acm_evidence_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "acm_evidence_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acm_teacher_week_adjustments: {
        Row: {
          created_at: string
          evidence: string | null
          group_id: string
          homework: string | null
          id: string
          student_activity: string | null
          teacher_id: string
          teacher_notes: string | null
          teacher_strategy: string | null
          updated_at: string
          week_number: number
          weekly_plan_id: string
        }
        Insert: {
          created_at?: string
          evidence?: string | null
          group_id: string
          homework?: string | null
          id?: string
          student_activity?: string | null
          teacher_id: string
          teacher_notes?: string | null
          teacher_strategy?: string | null
          updated_at?: string
          week_number: number
          weekly_plan_id: string
        }
        Update: {
          created_at?: string
          evidence?: string | null
          group_id?: string
          homework?: string | null
          id?: string
          student_activity?: string | null
          teacher_id?: string
          teacher_notes?: string | null
          teacher_strategy?: string | null
          updated_at?: string
          week_number?: number
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acm_teacher_week_adjustments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_teacher_week_adjustments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "acm_teacher_week_adjustments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_teacher_week_adjustments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "acm_teacher_week_adjustments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_teacher_week_adjustments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "acm_teacher_week_adjustments_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "acm_weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      acm_weekly_plan_items: {
        Row: {
          assessment_method: string | null
          created_at: string
          estimated_minutes: number | null
          evidence: string | null
          homework: string | null
          id: string
          indicator_id: string | null
          is_required: boolean
          materials: string | null
          node_id: string | null
          objective: string | null
          order_index: number
          student_activity: string | null
          teacher_strategy: string | null
          topic: string | null
          updated_at: string
          weekly_plan_id: string
        }
        Insert: {
          assessment_method?: string | null
          created_at?: string
          estimated_minutes?: number | null
          evidence?: string | null
          homework?: string | null
          id?: string
          indicator_id?: string | null
          is_required?: boolean
          materials?: string | null
          node_id?: string | null
          objective?: string | null
          order_index?: number
          student_activity?: string | null
          teacher_strategy?: string | null
          topic?: string | null
          updated_at?: string
          weekly_plan_id: string
        }
        Update: {
          assessment_method?: string | null
          created_at?: string
          estimated_minutes?: number | null
          evidence?: string | null
          homework?: string | null
          id?: string
          indicator_id?: string | null
          is_required?: boolean
          materials?: string | null
          node_id?: string | null
          objective?: string | null
          order_index?: number
          student_activity?: string | null
          teacher_strategy?: string | null
          topic?: string | null
          updated_at?: string
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acm_weekly_plan_items_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_weekly_plan_items_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "acm_weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      acm_weekly_plans: {
        Row: {
          area_id: string | null
          created_at: string
          curriculum_version_id: string
          id: string
          instrument_id: string | null
          level_id: string | null
          main_objective: string | null
          main_topic: string | null
          module_id: string | null
          phase_id: string | null
          phase_type: string | null
          program_id: string | null
          status: string
          updated_at: string
          week_label: string | null
          week_number: number
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          curriculum_version_id: string
          id?: string
          instrument_id?: string | null
          level_id?: string | null
          main_objective?: string | null
          main_topic?: string | null
          module_id?: string | null
          phase_id?: string | null
          phase_type?: string | null
          program_id?: string | null
          status?: string
          updated_at?: string
          week_label?: string | null
          week_number: number
        }
        Update: {
          area_id?: string | null
          created_at?: string
          curriculum_version_id?: string
          id?: string
          instrument_id?: string | null
          level_id?: string | null
          main_objective?: string | null
          main_topic?: string | null
          module_id?: string | null
          phase_id?: string | null
          phase_type?: string | null
          program_id?: string | null
          status?: string
          updated_at?: string
          week_label?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "acm_weekly_plans_curriculum_version_id_fkey"
            columns: ["curriculum_version_id"]
            isOneToOne: false
            referencedRelation: "acm_curriculum_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acm_weekly_plans_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_log: {
        Row: {
          canal: string
          contenido: string | null
          created_at: string | null
          destinatario: string
          id: string
          tipo: string
        }
        Insert: {
          canal: string
          contenido?: string | null
          created_at?: string | null
          destinatario: string
          id?: string
          tipo: string
        }
        Update: {
          canal?: string
          contenido?: string | null
          created_at?: string | null
          destinatario?: string
          id?: string
          tipo?: string
        }
        Relationships: []
      }
      alumno_escolaridad: {
        Row: {
          activo: boolean | null
          alumno_id: string
          anio_escolar: string | null
          cargo_director: string | null
          centro_estudios: string | null
          correo_centro: string | null
          created_at: string | null
          direccion_centro: string | null
          director_institucion: string | null
          grado_nivel: string | null
          id: string
          seccion: string | null
          telefono_centro: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          alumno_id: string
          anio_escolar?: string | null
          cargo_director?: string | null
          centro_estudios?: string | null
          correo_centro?: string | null
          created_at?: string | null
          direccion_centro?: string | null
          director_institucion?: string | null
          grado_nivel?: string | null
          id?: string
          seccion?: string | null
          telefono_centro?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          alumno_id?: string
          anio_escolar?: string | null
          cargo_director?: string | null
          centro_estudios?: string | null
          correo_centro?: string | null
          created_at?: string | null
          direccion_centro?: string | null
          director_institucion?: string | null
          grado_nivel?: string | null
          id?: string
          seccion?: string | null
          telefono_centro?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_escolaridad_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      alumno_plan_entradas: {
        Row: {
          alumno_id: string
          created_at: string
          descripcion: string | null
          id: string
          maestro_id: string
          nivel_referencia: string | null
          objetivo_id: string | null
          sesion_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          alumno_id: string
          created_at?: string
          descripcion?: string | null
          id?: string
          maestro_id: string
          nivel_referencia?: string | null
          objetivo_id?: string | null
          sesion_id?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          alumno_id?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          maestro_id?: string
          nivel_referencia?: string | null
          objetivo_id?: string | null
          sesion_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "curriculo_objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "alumno_plan_entradas_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      alumno_suspensiones: {
        Row: {
          alumno_id: string
          creado_por: string | null
          created_at: string
          desde: string
          estado: string
          hasta: string | null
          id: string
          levantada_en: string | null
          levantada_por: string | null
          motivo: string | null
          updated_at: string
        }
        Insert: {
          alumno_id: string
          creado_por?: string | null
          created_at?: string
          desde?: string
          estado?: string
          hasta?: string | null
          id?: string
          levantada_en?: string | null
          levantada_por?: string | null
          motivo?: string | null
          updated_at?: string
        }
        Update: {
          alumno_id?: string
          creado_por?: string | null
          created_at?: string
          desde?: string
          estado?: string
          hasta?: string | null
          id?: string
          levantada_en?: string | null
          levantada_por?: string | null
          motivo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_suspensiones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      alumnos: {
        Row: {
          abandono_score: number | null
          acepta_beca_4500: boolean | null
          acepta_pago_600: boolean | null
          activo: boolean | null
          alergia_medicamento_desc: string | null
          alergias: string | null
          alergias_descripcion: string | null
          apoyo_actividades: string | null
          aspiracion_instrumento: string | null
          autoriza_fotos_redes: boolean | null
          beneficiario_subsidio_estado: boolean | null
          bloqueo_certificado: boolean
          bloqueo_evento: boolean
          centro_estudios: string | null
          como_se_entero: string | null
          condicion_transmisible_desc: string | null
          condiciones_medicas: string | null
          contacto_emergencia_2_nombre: string | null
          contacto_emergencia_2_telefono: string | null
          contacto_emergencia_nombre: string | null
          contacto_emergencia_parentesco: string | null
          contacto_emergencia_telefono: string | null
          correo_representante: string | null
          created_at: string | null
          direccion: string | null
          exento_mensualidad: boolean
          familia_id: string | null
          familia_monoparental: boolean | null
          familiar_nombre: string | null
          familiar_parentesco: string | null
          familiar_telefono: string | null
          fecha_aceptacion_beca: string | null
          fecha_aceptacion_pago: string | null
          fecha_ingreso: string | null
          fecha_ingreso_iniciacion: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          genero: string | null
          grado_nivel: string | null
          id: string
          impedimento_social: boolean | null
          instrumento_interes: string | null
          instrumento_previo: string | null
          instrumento_principal: string | null
          interes_musical: string | null
          madre_cedula: string | null
          madre_nombre: string | null
          madre_tlf_whatsapp: string | null
          medicamentos: string | null
          mora_flag: boolean
          municipio_residencia: string | null
          musico_favorito: string | null
          nacionalidad: string | null
          nivel: string
          nivel_actual: number | null
          nivel_lectura_musical: string | null
          nombre_completo: string
          observaciones_generales: string | null
          otro_responsable_cedula: string | null
          otro_responsable_nombre: string | null
          otro_responsable_tlf: string | null
          padre_cedula: string | null
          padre_nombre: string | null
          padre_tlf_whatsapp: string | null
          padres_en_vida: string | null
          por_que_unirse: string | null
          preferencia_aprendizaje_musical: string | null
          problemas_conducta: string | null
          promedio_notas: number | null
          representante_cedula: string | null
          representante_nombre: string | null
          representante_parentesco: string | null
          representante_tlf: string | null
          requiere_iniciacion_musical: boolean | null
          sabe_escribir: boolean | null
          sabe_leer: boolean | null
          sector_calle_numero: string | null
          sentimiento_aprender_instrumento: string | null
          sentimiento_musica_clasica: string | null
          subsidio_descripcion: string | null
          tiene_alergia_medicamento: boolean | null
          tiene_alergias: boolean | null
          tiene_condicion_transmisible: boolean | null
          tiene_conocimientos_musicales: boolean | null
          tiene_pasaporte: boolean | null
          tlf_alumno: string | null
          ubicacion_maps_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          abandono_score?: number | null
          acepta_beca_4500?: boolean | null
          acepta_pago_600?: boolean | null
          activo?: boolean | null
          alergia_medicamento_desc?: string | null
          alergias?: string | null
          alergias_descripcion?: string | null
          apoyo_actividades?: string | null
          aspiracion_instrumento?: string | null
          autoriza_fotos_redes?: boolean | null
          beneficiario_subsidio_estado?: boolean | null
          bloqueo_certificado?: boolean
          bloqueo_evento?: boolean
          centro_estudios?: string | null
          como_se_entero?: string | null
          condicion_transmisible_desc?: string | null
          condiciones_medicas?: string | null
          contacto_emergencia_2_nombre?: string | null
          contacto_emergencia_2_telefono?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_parentesco?: string | null
          contacto_emergencia_telefono?: string | null
          correo_representante?: string | null
          created_at?: string | null
          direccion?: string | null
          exento_mensualidad?: boolean
          familia_id?: string | null
          familia_monoparental?: boolean | null
          familiar_nombre?: string | null
          familiar_parentesco?: string | null
          familiar_telefono?: string | null
          fecha_aceptacion_beca?: string | null
          fecha_aceptacion_pago?: string | null
          fecha_ingreso?: string | null
          fecha_ingreso_iniciacion?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          grado_nivel?: string | null
          id?: string
          impedimento_social?: boolean | null
          instrumento_interes?: string | null
          instrumento_previo?: string | null
          instrumento_principal?: string | null
          interes_musical?: string | null
          madre_cedula?: string | null
          madre_nombre?: string | null
          madre_tlf_whatsapp?: string | null
          medicamentos?: string | null
          mora_flag?: boolean
          municipio_residencia?: string | null
          musico_favorito?: string | null
          nacionalidad?: string | null
          nivel?: string
          nivel_actual?: number | null
          nivel_lectura_musical?: string | null
          nombre_completo: string
          observaciones_generales?: string | null
          otro_responsable_cedula?: string | null
          otro_responsable_nombre?: string | null
          otro_responsable_tlf?: string | null
          padre_cedula?: string | null
          padre_nombre?: string | null
          padre_tlf_whatsapp?: string | null
          padres_en_vida?: string | null
          por_que_unirse?: string | null
          preferencia_aprendizaje_musical?: string | null
          problemas_conducta?: string | null
          promedio_notas?: number | null
          representante_cedula?: string | null
          representante_nombre?: string | null
          representante_parentesco?: string | null
          representante_tlf?: string | null
          requiere_iniciacion_musical?: boolean | null
          sabe_escribir?: boolean | null
          sabe_leer?: boolean | null
          sector_calle_numero?: string | null
          sentimiento_aprender_instrumento?: string | null
          sentimiento_musica_clasica?: string | null
          subsidio_descripcion?: string | null
          tiene_alergia_medicamento?: boolean | null
          tiene_alergias?: boolean | null
          tiene_condicion_transmisible?: boolean | null
          tiene_conocimientos_musicales?: boolean | null
          tiene_pasaporte?: boolean | null
          tlf_alumno?: string | null
          ubicacion_maps_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          abandono_score?: number | null
          acepta_beca_4500?: boolean | null
          acepta_pago_600?: boolean | null
          activo?: boolean | null
          alergia_medicamento_desc?: string | null
          alergias?: string | null
          alergias_descripcion?: string | null
          apoyo_actividades?: string | null
          aspiracion_instrumento?: string | null
          autoriza_fotos_redes?: boolean | null
          beneficiario_subsidio_estado?: boolean | null
          bloqueo_certificado?: boolean
          bloqueo_evento?: boolean
          centro_estudios?: string | null
          como_se_entero?: string | null
          condicion_transmisible_desc?: string | null
          condiciones_medicas?: string | null
          contacto_emergencia_2_nombre?: string | null
          contacto_emergencia_2_telefono?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_parentesco?: string | null
          contacto_emergencia_telefono?: string | null
          correo_representante?: string | null
          created_at?: string | null
          direccion?: string | null
          exento_mensualidad?: boolean
          familia_id?: string | null
          familia_monoparental?: boolean | null
          familiar_nombre?: string | null
          familiar_parentesco?: string | null
          familiar_telefono?: string | null
          fecha_aceptacion_beca?: string | null
          fecha_aceptacion_pago?: string | null
          fecha_ingreso?: string | null
          fecha_ingreso_iniciacion?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          grado_nivel?: string | null
          id?: string
          impedimento_social?: boolean | null
          instrumento_interes?: string | null
          instrumento_previo?: string | null
          instrumento_principal?: string | null
          interes_musical?: string | null
          madre_cedula?: string | null
          madre_nombre?: string | null
          madre_tlf_whatsapp?: string | null
          medicamentos?: string | null
          mora_flag?: boolean
          municipio_residencia?: string | null
          musico_favorito?: string | null
          nacionalidad?: string | null
          nivel?: string
          nivel_actual?: number | null
          nivel_lectura_musical?: string | null
          nombre_completo?: string
          observaciones_generales?: string | null
          otro_responsable_cedula?: string | null
          otro_responsable_nombre?: string | null
          otro_responsable_tlf?: string | null
          padre_cedula?: string | null
          padre_nombre?: string | null
          padre_tlf_whatsapp?: string | null
          padres_en_vida?: string | null
          por_que_unirse?: string | null
          preferencia_aprendizaje_musical?: string | null
          problemas_conducta?: string | null
          promedio_notas?: number | null
          representante_cedula?: string | null
          representante_nombre?: string | null
          representante_parentesco?: string | null
          representante_tlf?: string | null
          requiere_iniciacion_musical?: boolean | null
          sabe_escribir?: boolean | null
          sabe_leer?: boolean | null
          sector_calle_numero?: string | null
          sentimiento_aprender_instrumento?: string | null
          sentimiento_musica_clasica?: string | null
          subsidio_descripcion?: string | null
          tiene_alergia_medicamento?: boolean | null
          tiene_alergias?: boolean | null
          tiene_condicion_transmisible?: boolean | null
          tiene_conocimientos_musicales?: boolean | null
          tiene_pasaporte?: boolean | null
          tlf_alumno?: string | null
          ubicacion_maps_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumnos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "alumnos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_profile"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alumnos_clases: {
        Row: {
          activo: boolean | null
          alumno_id: string
          clase_id: string
          created_at: string | null
          dia: string | null
          fecha_inscripcion: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string
        }
        Insert: {
          activo?: boolean | null
          alumno_id: string
          clase_id: string
          created_at?: string | null
          dia?: string | null
          fecha_inscripcion?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
        }
        Update: {
          activo?: boolean | null
          alumno_id?: string
          clase_id?: string
          created_at?: string | null
          dia?: string | null
          fecha_inscripcion?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
        ]
      }
      alumnos_ejercicios: {
        Row: {
          alumno_id: string
          aprobado: boolean | null
          created_at: string | null
          ejercicio_id: string
          estado: string
          fecha_ultimo_intento: string | null
          id: string
          intentos: number | null
          mejor_puntaje: number | null
          puntaje_actual: number | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          aprobado?: boolean | null
          created_at?: string | null
          ejercicio_id: string
          estado?: string
          fecha_ultimo_intento?: string | null
          id?: string
          intentos?: number | null
          mejor_puntaje?: number | null
          puntaje_actual?: number | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          aprobado?: boolean | null
          created_at?: string | null
          ejercicio_id?: string
          estado?: string
          fecha_ultimo_intento?: string | null
          id?: string
          intentos?: number | null
          mejor_puntaje?: number | null
          puntaje_actual?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_ejercicios_ejercicio"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      alumnos_logros: {
        Row: {
          alumno_id: string
          logro_id: string
          obtenido_en: string | null
        }
        Insert: {
          alumno_id: string
          logro_id: string
          obtenido_en?: string | null
        }
        Update: {
          alumno_id?: string
          logro_id?: string
          obtenido_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_logros_logro"
            columns: ["logro_id"]
            isOneToOne: false
            referencedRelation: "logros"
            referencedColumns: ["id"]
          },
        ]
      }
      alumnos_modulos: {
        Row: {
          alumno_id: string
          created_at: string | null
          estado: string
          fecha_completado: string | null
          fecha_inicio: string | null
          id: string
          intentos_totales: number | null
          modulo_id: string
          porcentaje_completado: number | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          created_at?: string | null
          estado?: string
          fecha_completado?: string | null
          fecha_inicio?: string | null
          id?: string
          intentos_totales?: number | null
          modulo_id: string
          porcentaje_completado?: number | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          created_at?: string | null
          estado?: string
          fecha_completado?: string | null
          fecha_inicio?: string | null
          id?: string
          intentos_totales?: number | null
          modulo_id?: string
          porcentaje_completado?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_modulos_modulo"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      alumnos_programas: {
        Row: {
          activo: boolean | null
          alumno_id: string
          calificacion: number | null
          created_at: string | null
          estado: string
          fecha_inscripcion: string | null
          fuente: string | null
          id: string
          periodo_id: string | null
          programa_id: string
          requiere_verificacion: boolean
        }
        Insert: {
          activo?: boolean | null
          alumno_id: string
          calificacion?: number | null
          created_at?: string | null
          estado?: string
          fecha_inscripcion?: string | null
          fuente?: string | null
          id?: string
          periodo_id?: string | null
          programa_id: string
          requiere_verificacion?: boolean
        }
        Update: {
          activo?: boolean | null
          alumno_id?: string
          calificacion?: number | null
          created_at?: string | null
          estado?: string
          fecha_inscripcion?: string | null
          fuente?: string | null
          id?: string
          periodo_id?: string | null
          programa_id?: string
          requiere_verificacion?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_programas_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumnos_programas_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "vw_estadisticas_periodo"
            referencedColumns: ["periodo_id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_programas_programa"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      alumnos_rutas: {
        Row: {
          activo: boolean | null
          alumno_id: string
          created_at: string | null
          estado: string
          fecha_completado: string | null
          fecha_fin_estimada: string | null
          fecha_inicio: string | null
          id: string
          nivel_id: string
          programa_id: string
          progreso_porcentaje: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          alumno_id: string
          created_at?: string | null
          estado?: string
          fecha_completado?: string | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          nivel_id: string
          programa_id: string
          progreso_porcentaje?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          alumno_id?: string
          created_at?: string | null
          estado?: string
          fecha_completado?: string | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          nivel_id?: string
          programa_id?: string
          progreso_porcentaje?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_nivel"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_rutas_programa"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      aplicaciones_pago: {
        Row: {
          created_at: string
          cuota_id: string
          dias_atraso_al_aplicar: number
          id: string
          monto_aplicado_centavos: number
          pago_id: string
        }
        Insert: {
          created_at?: string
          cuota_id: string
          dias_atraso_al_aplicar?: number
          id?: string
          monto_aplicado_centavos: number
          pago_id: string
        }
        Update: {
          created_at?: string
          cuota_id?: string
          dias_atraso_al_aplicar?: number
          id?: string
          monto_aplicado_centavos?: number
          pago_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aplicaciones_pago_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicaciones_pago_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "vw_mora_activa"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "aplicaciones_pago_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          created_at: string | null
          display_name: string
          email: string | null
          id: string
          jurado_id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          email?: string | null
          id: string
          jurado_id: string
          role: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          email?: string | null
          id?: string
          jurado_id?: string
          role?: string
        }
        Relationships: []
      }
      applicant_events: {
        Row: {
          applicant_id: string | null
          created_at: string
          event_name: string
          id: number
          payload: Json
        }
        Insert: {
          applicant_id?: string | null
          created_at?: string
          event_name: string
          id?: number
          payload?: Json
        }
        Update: {
          applicant_id?: string | null
          created_at?: string
          event_name?: string
          id?: number
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "applicant_events_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applicant_events_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "vw_admin_enrollment_calendar"
            referencedColumns: ["applicant_id"]
          },
        ]
      }
      applicants: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          idempotency_key: string
          phone_number: string
          status: string
          updated_at: string
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          idempotency_key: string
          phone_number: string
          status?: string
          updated_at?: string
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          idempotency_key?: string
          phone_number?: string
          status?: string
          updated_at?: string
          utm_source?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          locked_until: string | null
          notes: string | null
          scheduled_datetime: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          locked_until?: string | null
          notes?: string | null
          scheduled_datetime: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          locked_until?: string | null
          notes?: string | null
          scheduled_datetime?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "vw_admin_enrollment_calendar"
            referencedColumns: ["applicant_id"]
          },
        ]
      }
      asistencia_maestros: {
        Row: {
          ausencia_id: string | null
          clase_id: string | null
          created_at: string
          estado: string
          fecha: string
          id: string
          maestro_id: string
          marked_at: string
          motivo: string | null
          observaciones: string | null
          periodo_id: string | null
          registrado_por: string | null
          sesion_clase_id: string
          suplente_id: string | null
          updated_at: string
        }
        Insert: {
          ausencia_id?: string | null
          clase_id?: string | null
          created_at?: string
          estado: string
          fecha: string
          id?: string
          maestro_id: string
          marked_at?: string
          motivo?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          registrado_por?: string | null
          sesion_clase_id: string
          suplente_id?: string | null
          updated_at?: string
        }
        Update: {
          ausencia_id?: string | null
          clase_id?: string | null
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          maestro_id?: string
          marked_at?: string
          motivo?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          registrado_por?: string | null
          sesion_clase_id?: string
          suplente_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_maestros_ausencia_id_fkey"
            columns: ["ausencia_id"]
            isOneToOne: false
            referencedRelation: "ausencias_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "asistencia_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "asistencia_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "asistencia_maestros_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "vw_estadisticas_periodo"
            referencedColumns: ["periodo_id"]
          },
          {
            foreignKeyName: "asistencia_maestros_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_sesion_clase_id_fkey"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_sesion_clase_id_fkey"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "asistencia_maestros_sesion_clase_id_fkey"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
          {
            foreignKeyName: "asistencia_maestros_suplente_id_fkey"
            columns: ["suplente_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_suplente_id_fkey"
            columns: ["suplente_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "asistencia_maestros_suplente_id_fkey"
            columns: ["suplente_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_maestros_suplente_id_fkey"
            columns: ["suplente_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      asistencias: {
        Row: {
          alumno_id: string
          clase_id: string
          created_at: string | null
          estado: string
          fecha: string
          id: string
          justificacion_texto: string | null
          marked_at: string | null
          observaciones: string | null
          periodo_id: string | null
          registrado_por: string | null
          sesion_clase_id: string
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          clase_id: string
          created_at?: string | null
          estado: string
          fecha: string
          id?: string
          justificacion_texto?: string | null
          marked_at?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          registrado_por?: string | null
          sesion_clase_id: string
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          clase_id?: string
          created_at?: string | null
          estado?: string
          fecha?: string
          id?: string
          justificacion_texto?: string | null
          marked_at?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          registrado_por?: string | null
          sesion_clase_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencias_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencias_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "vw_estadisticas_periodo"
            referencedColumns: ["periodo_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_asistencias_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_asistencias_registrado_por"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "fk_asistencias_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      asistencias_emergentes: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string
          clase_emergente_id: string
          created_at: string | null
          estado: string
          fecha: string | null
          id: string
          justificacion: string | null
          observacion: string | null
          updated_at: string | null
        }
        Insert: {
          alumno_id?: string | null
          alumno_nombre: string
          clase_emergente_id: string
          created_at?: string | null
          estado?: string
          fecha?: string | null
          id?: string
          justificacion?: string | null
          observacion?: string | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string | null
          alumno_nombre?: string
          clase_emergente_id?: string
          created_at?: string | null
          estado?: string
          fecha?: string | null
          id?: string
          justificacion?: string | null
          observacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencias_emergentes_clase_emergente_id_fkey"
            columns: ["clase_emergente_id"]
            isOneToOne: false
            referencedRelation: "clases_emergentes"
            referencedColumns: ["id"]
          },
        ]
      }
      audiciones: {
        Row: {
          alumno_id: string | null
          calif_afinacion: number
          calif_musicalidad: number
          calif_postura: number
          calif_ritmo: number
          created_at: string | null
          evaluador: string | null
          fecha_auditoria: string
          fecha_validacion: string | null
          id_auditoria: number
          instrumento: string
          nivel_asignado: Database["public"]["Enums"]["nivel_estudiante"] | null
          nombre_alumno: string
          nota_afinacion: string | null
          nota_musicalidad: string | null
          nota_postura: string | null
          nota_ritmo: string | null
          profesor_asignado: string | null
          promedio_ponderado: number | null
          proxima_auditoria: string | null
          resultado: Database["public"]["Enums"]["resultado_audicion"]
          validado_por_omar: boolean | null
        }
        Insert: {
          alumno_id?: string | null
          calif_afinacion: number
          calif_musicalidad: number
          calif_postura: number
          calif_ritmo: number
          created_at?: string | null
          evaluador?: string | null
          fecha_auditoria?: string
          fecha_validacion?: string | null
          id_auditoria?: number
          instrumento: string
          nivel_asignado?:
            | Database["public"]["Enums"]["nivel_estudiante"]
            | null
          nombre_alumno: string
          nota_afinacion?: string | null
          nota_musicalidad?: string | null
          nota_postura?: string | null
          nota_ritmo?: string | null
          profesor_asignado?: string | null
          promedio_ponderado?: number | null
          proxima_auditoria?: string | null
          resultado: Database["public"]["Enums"]["resultado_audicion"]
          validado_por_omar?: boolean | null
        }
        Update: {
          alumno_id?: string | null
          calif_afinacion?: number
          calif_musicalidad?: number
          calif_postura?: number
          calif_ritmo?: number
          created_at?: string | null
          evaluador?: string | null
          fecha_auditoria?: string
          fecha_validacion?: string | null
          id_auditoria?: number
          instrumento?: string
          nivel_asignado?:
            | Database["public"]["Enums"]["nivel_estudiante"]
            | null
          nombre_alumno?: string
          nota_afinacion?: string | null
          nota_musicalidad?: string | null
          nota_postura?: string | null
          nota_ritmo?: string | null
          profesor_asignado?: string | null
          promedio_ponderado?: number | null
          proxima_auditoria?: string | null
          resultado?: Database["public"]["Enums"]["resultado_audicion"]
          validado_por_omar?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "audiciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      ausencias: {
        Row: {
          clase_alternativa: string | null
          created_at: string | null
          estado: string
          fecha_ausencia: string
          id: string
          maestro_id: string
          motivo: string
          notificacion_enviada: boolean | null
          reemplazo_maestro_id: string | null
          updated_at: string | null
        }
        Insert: {
          clase_alternativa?: string | null
          created_at?: string | null
          estado?: string
          fecha_ausencia: string
          id?: string
          maestro_id: string
          motivo: string
          notificacion_enviada?: boolean | null
          reemplazo_maestro_id?: string | null
          updated_at?: string | null
        }
        Update: {
          clase_alternativa?: string | null
          created_at?: string | null
          estado?: string
          fecha_ausencia?: string
          id?: string
          maestro_id?: string
          motivo?: string
          notificacion_enviada?: boolean | null
          reemplazo_maestro_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ausencias_auditoria: {
        Row: {
          accion: string
          actor_id: string
          ausencia_id: string
          created_at: string
          id: string
          notas: string | null
        }
        Insert: {
          accion: string
          actor_id: string
          ausencia_id: string
          created_at?: string
          id?: string
          notas?: string | null
        }
        Update: {
          accion?: string
          actor_id?: string
          ausencia_id?: string
          created_at?: string
          id?: string
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_auditoria_ausencia_id_fkey"
            columns: ["ausencia_id"]
            isOneToOne: false
            referencedRelation: "ausencias"
            referencedColumns: ["id"]
          },
        ]
      }
      ausencias_clases_afectadas: {
        Row: {
          actividad_reemplazo: string | null
          ausencia_id: string
          clase_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          actividad_reemplazo?: string | null
          ausencia_id: string
          clase_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          actividad_reemplazo?: string | null
          ausencia_id?: string
          clase_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_clases_afectadas_ausencia_id_fkey"
            columns: ["ausencia_id"]
            isOneToOne: false
            referencedRelation: "ausencias_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_clases_afectadas_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_clases_afectadas_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
        ]
      }
      ausencias_maestros: {
        Row: {
          actividades_por_clase: Json | null
          aprobado_en: string | null
          aprobado_por: string | null
          archivo_url: string | null
          clase_emergente: Json | null
          clases_afectadas: string[] | null
          created_at: string | null
          decidido_en: string | null
          decision_notas: string | null
          director_notificacion_id: string | null
          duracion_tipo: string | null
          estado: string | null
          fecha_fin: string
          fecha_inicio: string
          fecha_solicitud_original: string | null
          id: string
          intentos_solicitud: number | null
          maestro_id: string
          maestro_suplente_id: string | null
          motivo: string | null
          notificar_director: boolean | null
          razon_rechazo: string | null
          rechazado_en: string | null
          rechazado_por: string | null
          revisado_por: string | null
          revision_en: string | null
          revision_notas: string | null
          tipo_ausencia: string
          updated_at: string | null
          urgencia: string | null
        }
        Insert: {
          actividades_por_clase?: Json | null
          aprobado_en?: string | null
          aprobado_por?: string | null
          archivo_url?: string | null
          clase_emergente?: Json | null
          clases_afectadas?: string[] | null
          created_at?: string | null
          decidido_en?: string | null
          decision_notas?: string | null
          director_notificacion_id?: string | null
          duracion_tipo?: string | null
          estado?: string | null
          fecha_fin: string
          fecha_inicio: string
          fecha_solicitud_original?: string | null
          id?: string
          intentos_solicitud?: number | null
          maestro_id: string
          maestro_suplente_id?: string | null
          motivo?: string | null
          notificar_director?: boolean | null
          razon_rechazo?: string | null
          rechazado_en?: string | null
          rechazado_por?: string | null
          revisado_por?: string | null
          revision_en?: string | null
          revision_notas?: string | null
          tipo_ausencia: string
          updated_at?: string | null
          urgencia?: string | null
        }
        Update: {
          actividades_por_clase?: Json | null
          aprobado_en?: string | null
          aprobado_por?: string | null
          archivo_url?: string | null
          clase_emergente?: Json | null
          clases_afectadas?: string[] | null
          created_at?: string | null
          decidido_en?: string | null
          decision_notas?: string | null
          director_notificacion_id?: string | null
          duracion_tipo?: string | null
          estado?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          fecha_solicitud_original?: string | null
          id?: string
          intentos_solicitud?: number | null
          maestro_id?: string
          maestro_suplente_id?: string | null
          motivo?: string | null
          notificar_director?: boolean | null
          razon_rechazo?: string | null
          rechazado_en?: string | null
          rechazado_por?: string | null
          revisado_por?: string | null
          revision_en?: string | null
          revision_notas?: string | null
          tipo_ausencia?: string
          updated_at?: string | null
          urgencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_maestros_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_maestros_director_notificacion_id_fkey"
            columns: ["director_notificacion_id"]
            isOneToOne: false
            referencedRelation: "notificaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_suplente_id_fkey"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_suplente_id_fkey"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_suplente_id_fkey"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_maestros_maestro_suplente_id_fkey"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      ausencias_notificaciones: {
        Row: {
          actuado_en: string | null
          ausencia_id: string
          created_at: string | null
          director_id: string
          estado: string | null
          id: string
          leida_en: string | null
          tipo: string | null
        }
        Insert: {
          actuado_en?: string | null
          ausencia_id: string
          created_at?: string | null
          director_id: string
          estado?: string | null
          id?: string
          leida_en?: string | null
          tipo?: string | null
        }
        Update: {
          actuado_en?: string | null
          ausencia_id?: string
          created_at?: string | null
          director_id?: string
          estado?: string | null
          id?: string
          leida_en?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_notificaciones_ausencia_id_fkey"
            columns: ["ausencia_id"]
            isOneToOne: false
            referencedRelation: "ausencias_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_notificaciones_director_id_fkey"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_notificaciones_director_id_fkey"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "ausencias_notificaciones_director_id_fkey"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_notificaciones_director_id_fkey"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      autorizaciones_accesorio: {
        Row: {
          activa: boolean | null
          categorias_incluidas: string[] | null
          familia_id: string
          fecha_firma: string | null
          id: string
          monto_maximo: number
          representante_id: string
        }
        Insert: {
          activa?: boolean | null
          categorias_incluidas?: string[] | null
          familia_id: string
          fecha_firma?: string | null
          id?: string
          monto_maximo?: number
          representante_id: string
        }
        Update: {
          activa?: boolean | null
          categorias_incluidas?: string[] | null
          familia_id?: string
          fecha_firma?: string | null
          id?: string
          monto_maximo?: number
          representante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autorizaciones_accesorio_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autorizaciones_accesorio_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "autorizaciones_accesorio_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autorizaciones_accesorio_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "representantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autorizaciones_accesorio_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["rep_id"]
          },
        ]
      }
      becas: {
        Row: {
          activa: boolean | null
          alumno_id: string
          aprobado_por: string | null
          created_at: string | null
          familia_id: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          indicador_progreso_minimo: string | null
          motivo: string
          porcentaje: number
        }
        Insert: {
          activa?: boolean | null
          alumno_id: string
          aprobado_por?: string | null
          created_at?: string | null
          familia_id: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          indicador_progreso_minimo?: string | null
          motivo: string
          porcentaje: number
        }
        Update: {
          activa?: boolean | null
          alumno_id?: string
          aprobado_por?: string | null
          created_at?: string | null
          familia_id?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          indicador_progreso_minimo?: string | null
          motivo?: string
          porcentaje?: number
        }
        Relationships: [
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "becas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "becas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "becas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "becas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          description: string | null
          id: string
          level_from: number
          level_to: number
          name: string
          objective: string | null
          order_index: number
          route_version_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          level_from: number
          level_to: number
          name: string
          objective?: string | null
          order_index?: number
          route_version_id: string
        }
        Update: {
          description?: string | null
          id?: string
          level_from?: number
          level_to?: number
          name?: string
          objective?: string | null
          order_index?: number
          route_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_route_version_id_fkey"
            columns: ["route_version_id"]
            isOneToOne: false
            referencedRelation: "route_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      calendario: {
        Row: {
          created_at: string | null
          created_by: string
          departamento_id: string
          descripcion: string | null
          estado: string | null
          fecha_alerta: number | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          notas: string | null
          prioridad: string | null
          protocolo_json: Json | null
          responsable_id: string | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          departamento_id: string
          descripcion?: string | null
          estado?: string | null
          fecha_alerta?: number | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          notas?: string | null
          prioridad?: string | null
          protocolo_json?: Json | null
          responsable_id?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          departamento_id?: string
          descripcion?: string | null
          estado?: string | null
          fecha_alerta?: number | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          notas?: string | null
          prioridad?: string | null
          protocolo_json?: Json | null
          responsable_id?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendario_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      calendario_institucional: {
        Row: {
          aforo_proyectado: number | null
          categoria: Database["public"]["Enums"]["event_categoria"]
          created_at: string | null
          departamento_responsable: Database["public"]["Enums"]["soi_departamento"]
          descripcion: string | null
          es_macro_evento: boolean | null
          estado: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          metadata: Json | null
          metadata_pm: Json | null
          salud_proyecto: string | null
          titulo: string
          ubicacion: string | null
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          aforo_proyectado?: number | null
          categoria?: Database["public"]["Enums"]["event_categoria"]
          created_at?: string | null
          departamento_responsable?: Database["public"]["Enums"]["soi_departamento"]
          descripcion?: string | null
          es_macro_evento?: boolean | null
          estado?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          metadata?: Json | null
          metadata_pm?: Json | null
          salud_proyecto?: string | null
          titulo: string
          ubicacion?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          aforo_proyectado?: number | null
          categoria?: Database["public"]["Enums"]["event_categoria"]
          created_at?: string | null
          departamento_responsable?: Database["public"]["Enums"]["soi_departamento"]
          descripcion?: string | null
          es_macro_evento?: boolean | null
          estado?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          metadata?: Json | null
          metadata_pm?: Json | null
          salud_proyecto?: string | null
          titulo?: string
          ubicacion?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: []
      }
      campana_participaciones: {
        Row: {
          aceptada: boolean | null
          campana_id: string
          familia_id: string
          fecha_aceptacion: string | null
          id: string
          monto_recuperado_centavos: number | null
        }
        Insert: {
          aceptada?: boolean | null
          campana_id: string
          familia_id: string
          fecha_aceptacion?: string | null
          id?: string
          monto_recuperado_centavos?: number | null
        }
        Update: {
          aceptada?: boolean | null
          campana_id?: string
          familia_id?: string
          fecha_aceptacion?: string | null
          id?: string
          monto_recuperado_centavos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campana_participaciones_campana_id_fkey"
            columns: ["campana_id"]
            isOneToOne: false
            referencedRelation: "campanas_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campana_participaciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campana_participaciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "campana_participaciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      campanas_pago: {
        Row: {
          activa: boolean | null
          creado_por: string | null
          created_at: string | null
          descripcion: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          incentivo: string | null
          nombre: string
        }
        Insert: {
          activa?: boolean | null
          creado_por?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          incentivo?: string | null
          nombre: string
        }
        Update: {
          activa?: boolean | null
          creado_por?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          incentivo?: string | null
          nombre?: string
        }
        Relationships: []
      }
      campania_envios: {
        Row: {
          campania_id: string
          created_at: string
          estado: string
          fuente: string
          id: string
          jid: string
          mensaje: string | null
          nombre: string | null
          persona_id: string
          segmento: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          campania_id: string
          created_at?: string
          estado?: string
          fuente: string
          id?: string
          jid: string
          mensaje?: string | null
          nombre?: string | null
          persona_id: string
          segmento: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          campania_id?: string
          created_at?: string
          estado?: string
          fuente?: string
          id?: string
          jid?: string
          mensaje?: string | null
          nombre?: string | null
          persona_id?: string
          segmento?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campania_envios_campania_id_fkey"
            columns: ["campania_id"]
            isOneToOne: false
            referencedRelation: "campanias_periodo"
            referencedColumns: ["id"]
          },
        ]
      }
      campanias_destinatarios: {
        Row: {
          campania_id: string
          created_at: string
          estado: string
          fecha_envio: string | null
          fecha_respuesta: string | null
          id: string
          institucion_id: string
          notas_seguimiento: string | null
          respuesta_texto: string | null
        }
        Insert: {
          campania_id: string
          created_at?: string
          estado?: string
          fecha_envio?: string | null
          fecha_respuesta?: string | null
          id?: string
          institucion_id: string
          notas_seguimiento?: string | null
          respuesta_texto?: string | null
        }
        Update: {
          campania_id?: string
          created_at?: string
          estado?: string
          fecha_envio?: string | null
          fecha_respuesta?: string | null
          id?: string
          institucion_id?: string
          notas_seguimiento?: string | null
          respuesta_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campanias_destinatarios_campania_id_fkey"
            columns: ["campania_id"]
            isOneToOne: false
            referencedRelation: "campanias_marketing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanias_destinatarios_institucion_id_fkey"
            columns: ["institucion_id"]
            isOneToOne: false
            referencedRelation: "instituciones"
            referencedColumns: ["id"]
          },
        ]
      }
      campanias_marketing: {
        Row: {
          abiertos: number
          asunto: string
          creado_por: string | null
          created_at: string
          cuerpo_html: string
          cuerpo_texto: string | null
          enviados: number
          estado: string
          fecha_envio: string | null
          fecha_programada: string | null
          id: string
          respondidos: number
          temporada: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          abiertos?: number
          asunto: string
          creado_por?: string | null
          created_at?: string
          cuerpo_html: string
          cuerpo_texto?: string | null
          enviados?: number
          estado?: string
          fecha_envio?: string | null
          fecha_programada?: string | null
          id?: string
          respondidos?: number
          temporada?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          abiertos?: number
          asunto?: string
          creado_por?: string | null
          created_at?: string
          cuerpo_html?: string
          cuerpo_texto?: string | null
          enviados?: number
          estado?: string
          fecha_envio?: string | null
          fecha_programada?: string | null
          id?: string
          respondidos?: number
          temporada?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      campanias_periodo: {
        Row: {
          abre_servicio_publico: boolean
          accion: string
          activo: boolean
          created_at: string
          created_by: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          nombre: string
          periodo_academico_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          abre_servicio_publico?: boolean
          accion: string
          activo?: boolean
          created_at?: string
          created_by?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          nombre: string
          periodo_academico_id?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          abre_servicio_publico?: boolean
          accion?: string
          activo?: boolean
          created_at?: string
          created_by?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          nombre?: string
          periodo_academico_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanias_periodo_periodo_academico_id_fkey"
            columns: ["periodo_academico_id"]
            isOneToOne: false
            referencedRelation: "periodos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanias_periodo_periodo_academico_id_fkey"
            columns: ["periodo_academico_id"]
            isOneToOne: false
            referencedRelation: "vw_estadisticas_periodo"
            referencedColumns: ["periodo_id"]
          },
        ]
      }
      catalogo_niveles: {
        Row: {
          activo: boolean
          created_at: string
          created_by: string | null
          id: string
          instrumento: string
          nombre: string
          orden: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          instrumento: string
          nombre: string
          orden: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          instrumento?: string
          nombre?: string
          orden?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_niveles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogo_niveles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "catalogo_niveles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogo_niveles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      catalogo_objetivos_especificos: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          objetivo_general_id: string
          orden: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          objetivo_general_id: string
          orden: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          objetivo_general_id?: string
          orden?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_objetivos_especificos_objetivo_general_id_fkey"
            columns: ["objetivo_general_id"]
            isOneToOne: false
            referencedRelation: "catalogo_objetivos_generales"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_objetivos_generales: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          nivel_id: string
          nombre: string
          orden: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nivel_id: string
          nombre: string
          orden: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nivel_id?: string
          nombre?: string
          orden?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_objetivos_generales_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "catalogo_niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogos: {
        Row: {
          activo: boolean | null
          categoria: string | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          nombre: string
          orden: number | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          categoria?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          categoria?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cierres_caja: {
        Row: {
          cajero_id: string | null
          cantidad_transacciones: number
          created_at: string | null
          estado: Database["public"]["Enums"]["cierre_caja_estado"]
          fecha: string
          id: string
          notas: string | null
          por_metodo: Json | null
          total_general_centavos: number
        }
        Insert: {
          cajero_id?: string | null
          cantidad_transacciones?: number
          created_at?: string | null
          estado?: Database["public"]["Enums"]["cierre_caja_estado"]
          fecha: string
          id?: string
          notas?: string | null
          por_metodo?: Json | null
          total_general_centavos?: number
        }
        Update: {
          cajero_id?: string | null
          cantidad_transacciones?: number
          created_at?: string | null
          estado?: Database["public"]["Enums"]["cierre_caja_estado"]
          fecha?: string
          id?: string
          notas?: string | null
          por_metodo?: Json | null
          total_general_centavos?: number
        }
        Relationships: []
      }
      clase_acceso_temporal: {
        Row: {
          activo: boolean | null
          clase_id: string | null
          created_at: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          maestro_suplente_id: string
        }
        Insert: {
          activo?: boolean | null
          clase_id?: string | null
          created_at?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          maestro_suplente_id: string
        }
        Update: {
          activo?: boolean | null
          clase_id?: string | null
          created_at?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          maestro_suplente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clase_acceso_temporal_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_acceso_temporal_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
        ]
      }
      clase_horarios: {
        Row: {
          clase_id: string
          created_at: string | null
          dia: string
          hora_fin: string
          hora_inicio: string
          id: string
          maestro_id: string | null
          salon_id: string | null
        }
        Insert: {
          clase_id: string
          created_at?: string | null
          dia: string
          hora_fin: string
          hora_inicio: string
          id?: string
          maestro_id?: string | null
          salon_id?: string | null
        }
        Update: {
          clase_id?: string
          created_at?: string | null
          dia?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          maestro_id?: string | null
          salon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clase_horarios_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_horarios_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "clase_horarios_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
        ]
      }
      clase_mapa_indicadores: {
        Row: {
          archived_at: string | null
          clase_id: string
          created_at: string
          descripcion: string
          es_requerido: boolean
          id: string
          id_jerarquico: string
          objetivo_id: string
          orden_indicador: number
          order_index: number
          origen_indicator_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          clase_id: string
          created_at?: string
          descripcion: string
          es_requerido?: boolean
          id?: string
          id_jerarquico: string
          objetivo_id: string
          orden_indicador: number
          order_index?: number
          origen_indicator_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          clase_id?: string
          created_at?: string
          descripcion?: string
          es_requerido?: boolean
          id?: string
          id_jerarquico?: string
          objetivo_id?: string
          orden_indicador?: number
          order_index?: number
          origen_indicator_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clase_mapa_indicadores_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_mapa_indicadores_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "clase_mapa_indicadores_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "clase_mapa_objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_mapa_indicadores_origen_indicator_id_fkey"
            columns: ["origen_indicator_id"]
            isOneToOne: false
            referencedRelation: "catalogo_objetivos_especificos"
            referencedColumns: ["id"]
          },
        ]
      }
      clase_mapa_objetivos: {
        Row: {
          archived_at: string | null
          clase_id: string
          created_at: string
          created_by: string
          descripcion: string | null
          estado_revision: string
          id: string
          level_id: string
          nombre: string
          orden_objetivo: number
          order_index: number
          origen_node_id: string | null
          origen_objetivo_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          clase_id: string
          created_at?: string
          created_by: string
          descripcion?: string | null
          estado_revision?: string
          id?: string
          level_id: string
          nombre: string
          orden_objetivo: number
          order_index?: number
          origen_node_id?: string | null
          origen_objetivo_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          clase_id?: string
          created_at?: string
          created_by?: string
          descripcion?: string | null
          estado_revision?: string
          id?: string
          level_id?: string
          nombre?: string
          orden_objetivo?: number
          order_index?: number
          origen_node_id?: string | null
          origen_objetivo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clase_mapa_objetivos_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_mapa_objetivos_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "clase_mapa_objetivos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_mapa_objetivos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "clase_mapa_objetivos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_mapa_objetivos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "clase_mapa_objetivos_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "catalogo_niveles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_mapa_objetivos_origen_objetivo_id_fkey"
            columns: ["origen_objetivo_id"]
            isOneToOne: false
            referencedRelation: "catalogo_objetivos_generales"
            referencedColumns: ["id"]
          },
        ]
      }
      clases: {
        Row: {
          activo: boolean | null
          capacidad_maxima: number | null
          created_at: string | null
          descripcion: string | null
          es_clase_iniciacion: boolean
          estado: string | null
          id: string
          instrumento: string | null
          maestro_auxiliar_id: string | null
          maestro_id: string | null
          maestro_principal_id: string | null
          maestro_suplente_id: string | null
          modalidad: string | null
          necesita_revision: boolean
          nivel_id: string | null
          nombre: string
          plan_estudio: string | null
          programa_id: string | null
          revision_motivo: string | null
          route_version_id: string | null
          ruta_id: string | null
          salon: string | null
          tipo_clase: string | null
          updated_at: string | null
          whatsapp_group_jid: string | null
        }
        Insert: {
          activo?: boolean | null
          capacidad_maxima?: number | null
          created_at?: string | null
          descripcion?: string | null
          es_clase_iniciacion?: boolean
          estado?: string | null
          id?: string
          instrumento?: string | null
          maestro_auxiliar_id?: string | null
          maestro_id?: string | null
          maestro_principal_id?: string | null
          maestro_suplente_id?: string | null
          modalidad?: string | null
          necesita_revision?: boolean
          nivel_id?: string | null
          nombre: string
          plan_estudio?: string | null
          programa_id?: string | null
          revision_motivo?: string | null
          route_version_id?: string | null
          ruta_id?: string | null
          salon?: string | null
          tipo_clase?: string | null
          updated_at?: string | null
          whatsapp_group_jid?: string | null
        }
        Update: {
          activo?: boolean | null
          capacidad_maxima?: number | null
          created_at?: string | null
          descripcion?: string | null
          es_clase_iniciacion?: boolean
          estado?: string | null
          id?: string
          instrumento?: string | null
          maestro_auxiliar_id?: string | null
          maestro_id?: string | null
          maestro_principal_id?: string | null
          maestro_suplente_id?: string | null
          modalidad?: string | null
          necesita_revision?: boolean
          nivel_id?: string | null
          nombre?: string
          plan_estudio?: string | null
          programa_id?: string | null
          revision_motivo?: string | null
          route_version_id?: string | null
          ruta_id?: string | null
          salon?: string | null
          tipo_clase?: string | null
          updated_at?: string | null
          whatsapp_group_jid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clases_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clases_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "clases_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clases_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "clases_route_version_id_fkey"
            columns: ["route_version_id"]
            isOneToOne: false
            referencedRelation: "route_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clases_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas_contenido"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_principal"
            columns: ["maestro_principal_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_principal"
            columns: ["maestro_principal_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_principal"
            columns: ["maestro_principal_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_principal"
            columns: ["maestro_principal_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_suplente"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_suplente"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_suplente"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clases_maestro_suplente"
            columns: ["maestro_suplente_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_clases_nivel"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clases_programa"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      clases_emergentes: {
        Row: {
          clase_id: string | null
          contenido: string | null
          created_at: string | null
          estado: string | null
          fecha: string
          grupo: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          instrumento: string | null
          maestro_id: string
          motivo: string | null
          nombre_clase: string | null
          observaciones: string | null
          salon: string | null
          tipo: string | null
        }
        Insert: {
          clase_id?: string | null
          contenido?: string | null
          created_at?: string | null
          estado?: string | null
          fecha: string
          grupo?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          instrumento?: string | null
          maestro_id: string
          motivo?: string | null
          nombre_clase?: string | null
          observaciones?: string | null
          salon?: string | null
          tipo?: string | null
        }
        Update: {
          clase_id?: string | null
          contenido?: string | null
          created_at?: string | null
          estado?: string | null
          fecha?: string
          grupo?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          instrumento?: string | null
          maestro_id?: string
          motivo?: string | null
          nombre_clase?: string | null
          observaciones?: string | null
          salon?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      class_event_methodology: {
        Row: {
          class_event_id: string
          closing_observation: string | null
          created_at: string
          ear_training_work: string | null
          homework_text: string | null
          id: string
          intonation_focus: string | null
          main_node_id: string | null
          repertoire_used: string | null
          sight_reading_work: string | null
          sound_focus: string | null
          study_used: string | null
          technical_focus: string | null
          warmup: string | null
        }
        Insert: {
          class_event_id: string
          closing_observation?: string | null
          created_at?: string
          ear_training_work?: string | null
          homework_text?: string | null
          id?: string
          intonation_focus?: string | null
          main_node_id?: string | null
          repertoire_used?: string | null
          sight_reading_work?: string | null
          sound_focus?: string | null
          study_used?: string | null
          technical_focus?: string | null
          warmup?: string | null
        }
        Update: {
          class_event_id?: string
          closing_observation?: string | null
          created_at?: string
          ear_training_work?: string | null
          homework_text?: string | null
          id?: string
          intonation_focus?: string | null
          main_node_id?: string | null
          repertoire_used?: string | null
          sight_reading_work?: string | null
          sound_focus?: string | null
          study_used?: string | null
          technical_focus?: string | null
          warmup?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_event_methodology_class_event_id_fkey"
            columns: ["class_event_id"]
            isOneToOne: false
            referencedRelation: "class_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_event_methodology_main_node_id_fkey"
            columns: ["main_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_event_methodology_main_node_id_fkey"
            columns: ["main_node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
        ]
      }
      class_events: {
        Row: {
          academic_plan_id: string | null
          created_at: string
          event_date: string
          id: string
          level_id: string | null
          session_id: string | null
          status: string
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_plan_id?: string | null
          created_at?: string
          event_date?: string
          id?: string
          level_id?: string | null
          session_id?: string | null
          status?: string
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_plan_id?: string | null
          created_at?: string
          event_date?: string
          id?: string
          level_id?: string | null
          session_id?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_events_academic_plan_id_fkey"
            columns: ["academic_plan_id"]
            isOneToOne: false
            referencedRelation: "academic_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["level_id"]
          },
          {
            foreignKeyName: "class_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "class_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "class_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "class_events_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "class_events_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_events_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      class_session_content_snapshots: {
        Row: {
          created_at: string | null
          id: string
          indicator_description: string | null
          indicator_id: string | null
          is_critical: boolean | null
          node_id: string | null
          node_name: string | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          indicator_description?: string | null
          indicator_id?: string | null
          is_critical?: boolean | null
          node_id?: string | null
          node_name?: string | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          indicator_description?: string | null
          indicator_id?: string | null
          is_critical?: boolean | null
          node_id?: string | null
          node_name?: string | null
          session_id?: string
        }
        Relationships: []
      }
      cobertura_alumno_objetivo: {
        Row: {
          alumno_id: string | null
          confirmado: boolean | null
          created_at: string | null
          fecha: string
          id: string
          maestro_id: string | null
          nivel: string | null
          objetivo_id: string | null
          plan_id: string | null
        }
        Insert: {
          alumno_id?: string | null
          confirmado?: boolean | null
          created_at?: string | null
          fecha?: string
          id?: string
          maestro_id?: string | null
          nivel?: string | null
          objetivo_id?: string | null
          plan_id?: string | null
        }
        Update: {
          alumno_id?: string | null
          confirmado?: boolean | null
          created_at?: string | null
          fecha?: string
          id?: string
          maestro_id?: string | null
          nivel?: string | null
          objetivo_id?: string | null
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "curriculo_objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobertura_alumno_objetivo_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planificaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      comodatos_activos: {
        Row: {
          activo_id: string
          alumno_id: string
          contrato_firmado_url: string | null
          created_at: string
          estado: string
          fecha_devolucion: string | null
          fecha_entrega: string
          fecha_vencimiento: string | null
          id: string
          instrumento_propio_id: string | null
          intercambiado_con_id: string | null
          observaciones: string | null
          registrado_por: string | null
          renovado_de_id: string | null
          tipo_comodato: string | null
          updated_at: string
        }
        Insert: {
          activo_id: string
          alumno_id: string
          contrato_firmado_url?: string | null
          created_at?: string
          estado?: string
          fecha_devolucion?: string | null
          fecha_entrega?: string
          fecha_vencimiento?: string | null
          id?: string
          instrumento_propio_id?: string | null
          intercambiado_con_id?: string | null
          observaciones?: string | null
          registrado_por?: string | null
          renovado_de_id?: string | null
          tipo_comodato?: string | null
          updated_at?: string
        }
        Update: {
          activo_id?: string
          alumno_id?: string
          contrato_firmado_url?: string | null
          created_at?: string
          estado?: string
          fecha_devolucion?: string | null
          fecha_entrega?: string
          fecha_vencimiento?: string | null
          id?: string
          instrumento_propio_id?: string | null
          intercambiado_con_id?: string | null
          observaciones?: string | null
          registrado_por?: string | null
          renovado_de_id?: string | null
          tipo_comodato?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comodatos_activos_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comodatos_activos_instrumento_propio_id_fkey"
            columns: ["instrumento_propio_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_instrumento_propio_id_fkey"
            columns: ["instrumento_propio_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_intercambiado_con_id_fkey"
            columns: ["intercambiado_con_id"]
            isOneToOne: false
            referencedRelation: "comodatos_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_intercambiado_con_id_fkey"
            columns: ["intercambiado_con_id"]
            isOneToOne: false
            referencedRelation: "vw_activos_ociosos"
            referencedColumns: ["comodato_id"]
          },
          {
            foreignKeyName: "comodatos_activos_renovado_de_id_fkey"
            columns: ["renovado_de_id"]
            isOneToOne: false
            referencedRelation: "comodatos_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_renovado_de_id_fkey"
            columns: ["renovado_de_id"]
            isOneToOne: false
            referencedRelation: "vw_activos_ociosos"
            referencedColumns: ["comodato_id"]
          },
        ]
      }
      compromisos_pago: {
        Row: {
          created_at: string | null
          cumplido: boolean | null
          familia_id: string
          fecha_comprometida: string
          fecha_cumplimiento: string | null
          id: string
          monto_comprometido_centavos: number
          origen_notificacion_id: string | null
          representante_id: string
        }
        Insert: {
          created_at?: string | null
          cumplido?: boolean | null
          familia_id: string
          fecha_comprometida: string
          fecha_cumplimiento?: string | null
          id?: string
          monto_comprometido_centavos: number
          origen_notificacion_id?: string | null
          representante_id: string
        }
        Update: {
          created_at?: string | null
          cumplido?: boolean | null
          familia_id?: string
          fecha_comprometida?: string
          fecha_cumplimiento?: string | null
          id?: string
          monto_comprometido_centavos?: number
          origen_notificacion_id?: string | null
          representante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compromisos_pago_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromisos_pago_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "compromisos_pago_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromisos_pago_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "representantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromisos_pago_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["rep_id"]
          },
        ]
      }
      comunicaciones_seguimiento: {
        Row: {
          alumno_id: string | null
          canal: string
          contacto_email: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          created_at: string
          estado: string
          fecha: string
          id: string
          nivel: number | null
          notas: string | null
          origen: string
          proxima_accion: string | null
          proxima_fecha: string | null
          requiere_seguimiento: boolean
          responsable_id: string | null
          resultado: string
          updated_at: string
        }
        Insert: {
          alumno_id?: string | null
          canal?: string
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          nivel?: number | null
          notas?: string | null
          origen?: string
          proxima_accion?: string | null
          proxima_fecha?: string | null
          requiere_seguimiento?: boolean
          responsable_id?: string | null
          resultado?: string
          updated_at?: string
        }
        Update: {
          alumno_id?: string | null
          canal?: string
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          nivel?: number | null
          notas?: string | null
          origen?: string
          proxima_accion?: string | null
          proxima_fecha?: string | null
          requiere_seguimiento?: boolean
          responsable_id?: string | null
          resultado?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comunicaciones_seguimiento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      configuracion_recordatorios: {
        Row: {
          alerta_24h: boolean | null
          alerta_48h: boolean | null
          alerta_post_clase: boolean | null
          alerta_pre_clase: boolean | null
          created_at: string | null
          dia_resumen_semanal: number | null
          email_activo: boolean | null
          hora_resumen_diario: string | null
          horas_recordatorio_dia1: number | null
          horas_recordatorio_dia2: number | null
          id: string
          min_antes_clase: number | null
          min_post_clase_sin_registro: number | null
          profile_id: string
          push_activo: boolean | null
          recordatorios_activos: boolean | null
          updated_at: string | null
        }
        Insert: {
          alerta_24h?: boolean | null
          alerta_48h?: boolean | null
          alerta_post_clase?: boolean | null
          alerta_pre_clase?: boolean | null
          created_at?: string | null
          dia_resumen_semanal?: number | null
          email_activo?: boolean | null
          hora_resumen_diario?: string | null
          horas_recordatorio_dia1?: number | null
          horas_recordatorio_dia2?: number | null
          id?: string
          min_antes_clase?: number | null
          min_post_clase_sin_registro?: number | null
          profile_id: string
          push_activo?: boolean | null
          recordatorios_activos?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alerta_24h?: boolean | null
          alerta_48h?: boolean | null
          alerta_post_clase?: boolean | null
          alerta_pre_clase?: boolean | null
          created_at?: string | null
          dia_resumen_semanal?: number | null
          email_activo?: boolean | null
          hora_resumen_diario?: string | null
          horas_recordatorio_dia1?: number | null
          horas_recordatorio_dia2?: number | null
          id?: string
          min_antes_clase?: number | null
          min_post_clase_sin_registro?: number | null
          profile_id?: string
          push_activo?: boolean | null
          recordatorios_activos?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_configuracion_recordatorios_profile"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos_alianzas: {
        Row: {
          area_enfoque: string | null
          created_at: string | null
          email_contacto: string | null
          email_draft_id: string | null
          email_enviado: boolean | null
          enfoque_geografico: string | null
          estado: string
          fecha_primer_contacto: string | null
          fecha_ultima_respuesta: string | null
          id: string
          nombre_institucion: string
          notas: string | null
          persona_contacto: string | null
          programa_relevante: string | null
          puntuacion_match: number | null
          tipo: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          area_enfoque?: string | null
          created_at?: string | null
          email_contacto?: string | null
          email_draft_id?: string | null
          email_enviado?: boolean | null
          enfoque_geografico?: string | null
          estado?: string
          fecha_primer_contacto?: string | null
          fecha_ultima_respuesta?: string | null
          id?: string
          nombre_institucion: string
          notas?: string | null
          persona_contacto?: string | null
          programa_relevante?: string | null
          puntuacion_match?: number | null
          tipo?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          area_enfoque?: string | null
          created_at?: string | null
          email_contacto?: string | null
          email_draft_id?: string | null
          email_enviado?: boolean | null
          enfoque_geografico?: string | null
          estado?: string
          fecha_primer_contacto?: string | null
          fecha_ultima_respuesta?: string | null
          id?: string
          nombre_institucion?: string
          notas?: string | null
          persona_contacto?: string | null
          programa_relevante?: string | null
          puntuacion_match?: number | null
          tipo?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contenidos_sesion: {
        Row: {
          created_at: string | null
          descripcion: string | null
          ejercicio_id: string | null
          id: string
          modulo_id: string | null
          nivel_logro: string | null
          planificacion_id: string | null
          sesion_clase_id: string
          unidad_id: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          ejercicio_id?: string | null
          id?: string
          modulo_id?: string | null
          nivel_logro?: string | null
          planificacion_id?: string | null
          sesion_clase_id: string
          unidad_id?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          ejercicio_id?: string | null
          id?: string
          modulo_id?: string | null
          nivel_logro?: string | null
          planificacion_id?: string | null
          sesion_clase_id?: string
          unidad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_contenidos_sesion_ejercicio"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contenidos_sesion_modulo"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contenidos_sesion_planificacion"
            columns: ["planificacion_id"]
            isOneToOne: false
            referencedRelation: "planificaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contenidos_sesion_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contenidos_sesion_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "fk_contenidos_sesion_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
          {
            foreignKeyName: "fk_contenidos_sesion_unidad"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      conversaciones_whatsapp: {
        Row: {
          created_at: string | null
          estado_conversacion: string
          fecha_cita_propuesta: string | null
          id: string
          jid: string
          postulante_id: string
          reintentos: number | null
          ultima_intencion: string | null
          ultimo_mensaje_enviado: string | null
          ultimo_mensaje_recibido: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado_conversacion?: string
          fecha_cita_propuesta?: string | null
          id?: string
          jid: string
          postulante_id: string
          reintentos?: number | null
          ultima_intencion?: string | null
          ultimo_mensaje_enviado?: string | null
          ultimo_mensaje_recibido?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado_conversacion?: string
          fecha_cita_propuesta?: string | null
          id?: string
          jid?: string
          postulante_id?: string
          reintentos?: number | null
          ultima_intencion?: string | null
          ultimo_mensaje_enviado?: string | null
          ultimo_mensaje_recibido?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_whatsapp_postulante_id_fkey"
            columns: ["postulante_id"]
            isOneToOne: true
            referencedRelation: "postulantes"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas: {
        Row: {
          alumno_id: string | null
          ciclo_anio: number
          ciclo_mes: number
          concepto: string
          created_at: string | null
          descuento_centavos: number | null
          estado: Database["public"]["Enums"]["cuota_estado"]
          familia_id: string
          fecha_generacion: string
          fecha_vencimiento: string
          id: string
          metadatos: Json | null
          monto_base_centavos: number
          monto_final_centavos: number
          monto_pagado_centavos: number
          updated_at: string | null
        }
        Insert: {
          alumno_id?: string | null
          ciclo_anio: number
          ciclo_mes: number
          concepto: string
          created_at?: string | null
          descuento_centavos?: number | null
          estado?: Database["public"]["Enums"]["cuota_estado"]
          familia_id: string
          fecha_generacion: string
          fecha_vencimiento: string
          id?: string
          metadatos?: Json | null
          monto_base_centavos: number
          monto_final_centavos: number
          monto_pagado_centavos?: number
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string | null
          ciclo_anio?: number
          ciclo_mes?: number
          concepto?: string
          created_at?: string | null
          descuento_centavos?: number | null
          estado?: Database["public"]["Enums"]["cuota_estado"]
          familia_id?: string
          fecha_generacion?: string
          fecha_vencimiento?: string
          id?: string
          metadatos?: Json | null
          monto_base_centavos?: number
          monto_final_centavos?: number
          monto_pagado_centavos?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "cuotas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculo_objetivos: {
        Row: {
          descripcion: string
          id: string
          orden: number
          pilar_id: string | null
        }
        Insert: {
          descripcion: string
          id?: string
          orden?: number
          pilar_id?: string | null
        }
        Update: {
          descripcion?: string
          id?: string
          orden?: number
          pilar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculo_objetivos_pilar_id_fkey"
            columns: ["pilar_id"]
            isOneToOne: false
            referencedRelation: "curriculo_pilares"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculo_pilares: {
        Row: {
          curriculo_id: string | null
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          curriculo_id?: string | null
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          curriculo_id?: string | null
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "curriculo_pilares_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          instrumento: string
          nivel: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          instrumento: string
          nivel: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          instrumento?: string
          nivel?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "curriculos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      departamentos: {
        Row: {
          activo: boolean
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          email: string | null
          id: string
          jefe_id: string | null
          nombre: string
          responsable_email: string | null
          responsable_nombre: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          email?: string | null
          id?: string
          jefe_id?: string | null
          nombre: string
          responsable_email?: string | null
          responsable_nombre?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          email?: string | null
          id?: string
          jefe_id?: string | null
          nombre?: string
          responsable_email?: string | null
          responsable_nombre?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_batches: {
        Row: {
          actividad_nombre: string | null
          created_at: string | null
          estado: string
          fecha_actividad: string | null
          generado_por: string | null
          generated_at: string | null
          grupo_id: string | null
          grupo_nombre: string | null
          grupo_tipo: string | null
          id: string
          lugar_actividad: string | null
          tipo: string
          titulo: string
          total_alumnos: number | null
          total_con_advertencias: number | null
          total_excluidos: number | null
          total_generados: number | null
        }
        Insert: {
          actividad_nombre?: string | null
          created_at?: string | null
          estado?: string
          fecha_actividad?: string | null
          generado_por?: string | null
          generated_at?: string | null
          grupo_id?: string | null
          grupo_nombre?: string | null
          grupo_tipo?: string | null
          id?: string
          lugar_actividad?: string | null
          tipo: string
          titulo: string
          total_alumnos?: number | null
          total_con_advertencias?: number | null
          total_excluidos?: number | null
          total_generados?: number | null
        }
        Update: {
          actividad_nombre?: string | null
          created_at?: string | null
          estado?: string
          fecha_actividad?: string | null
          generado_por?: string | null
          generated_at?: string | null
          grupo_id?: string | null
          grupo_nombre?: string | null
          grupo_tipo?: string | null
          id?: string
          lugar_actividad?: string | null
          tipo?: string
          titulo?: string
          total_alumnos?: number | null
          total_con_advertencias?: number | null
          total_excluidos?: number | null
          total_generados?: number | null
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          contenido: string
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          estado: string
          id: string
          nombre: string
          tipo: string
          updated_at: string | null
          variables: string[] | null
          version: number
        }
        Insert: {
          contenido: string
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          id?: string
          nombre: string
          tipo: string
          updated_at?: string | null
          variables?: string[] | null
          version?: number
        }
        Update: {
          contenido?: string
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          id?: string
          nombre?: string
          tipo?: string
          updated_at?: string | null
          variables?: string[] | null
          version?: number
        }
        Relationships: []
      }
      ejercicios: {
        Row: {
          activo: boolean | null
          contenido: Json | null
          created_at: string | null
          criterios_evaluacion: Json | null
          descripcion: string | null
          dificultad: number | null
          id: string
          instrucciones: string | null
          nombre: string
          orden: number
          puntaje_aprobacion: number | null
          puntaje_maximo: number | null
          puntos_xp: number | null
          requiere_evidencia: boolean | null
          tipo_ejercicio: string
          unidad_id: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          contenido?: Json | null
          created_at?: string | null
          criterios_evaluacion?: Json | null
          descripcion?: string | null
          dificultad?: number | null
          id?: string
          instrucciones?: string | null
          nombre: string
          orden: number
          puntaje_aprobacion?: number | null
          puntaje_maximo?: number | null
          puntos_xp?: number | null
          requiere_evidencia?: boolean | null
          tipo_ejercicio: string
          unidad_id: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          contenido?: Json | null
          created_at?: string | null
          criterios_evaluacion?: Json | null
          descripcion?: string | null
          dificultad?: number | null
          id?: string
          instrucciones?: string | null
          nombre?: string
          orden?: number
          puntaje_aprobacion?: number | null
          puntaje_maximo?: number | null
          puntos_xp?: number | null
          requiere_evidencia?: boolean | null
          tipo_ejercicio?: string
          unidad_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ejercicios_unidad"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluacion_indicador: {
        Row: {
          alumno_id: string
          clase_id: string
          clase_indicador_id: string | null
          created_at: string | null
          estado: string | null
          evaluado_por: string | null
          fecha_evaluacion: string | null
          id: string
          indicator_id: string | null
          maestro_indicador_id: string | null
          nota: number | null
          observaciones: string | null
          recovery_grade: number | null
          recovery_notes: string | null
          recovery_status: string | null
          recovery_timestamp: string | null
          review_flag: boolean
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          clase_id: string
          clase_indicador_id?: string | null
          created_at?: string | null
          estado?: string | null
          evaluado_por?: string | null
          fecha_evaluacion?: string | null
          id?: string
          indicator_id?: string | null
          maestro_indicador_id?: string | null
          nota?: number | null
          observaciones?: string | null
          recovery_grade?: number | null
          recovery_notes?: string | null
          recovery_status?: string | null
          recovery_timestamp?: string | null
          review_flag?: boolean
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          clase_id?: string
          clase_indicador_id?: string | null
          created_at?: string | null
          estado?: string | null
          evaluado_por?: string | null
          fecha_evaluacion?: string | null
          id?: string
          indicator_id?: string | null
          maestro_indicador_id?: string | null
          nota?: number | null
          observaciones?: string | null
          recovery_grade?: number | null
          recovery_notes?: string | null
          recovery_status?: string | null
          recovery_timestamp?: string | null
          review_flag?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_clase_indicador_id_fkey"
            columns: ["clase_indicador_id"]
            isOneToOne: false
            referencedRelation: "clase_mapa_indicadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_maestro_indicador_id_fkey"
            columns: ["maestro_indicador_id"]
            isOneToOne: false
            referencedRelation: "maestro_indicadores"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          afinacion_general: number | null
          afinacion_rep: number | null
          articulacion: number | null
          created_at: string | null
          digitacion: number | null
          id: string
          jurado_id: string
          jurado_name: string
          lectura: number | null
          observations: string | null
          recommendation: string | null
          ritmo_escala: number | null
          ritmo_rep: number | null
          score_danzon: number | null
          score_escala: number | null
          score_total: number | null
          sonido: number | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          afinacion_general?: number | null
          afinacion_rep?: number | null
          articulacion?: number | null
          created_at?: string | null
          digitacion?: number | null
          id?: string
          jurado_id: string
          jurado_name: string
          lectura?: number | null
          observations?: string | null
          recommendation?: string | null
          ritmo_escala?: number | null
          ritmo_rep?: number | null
          score_danzon?: number | null
          score_escala?: number | null
          score_total?: number | null
          sonido?: number | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          afinacion_general?: number | null
          afinacion_rep?: number | null
          articulacion?: number | null
          created_at?: string | null
          digitacion?: number | null
          id?: string
          jurado_id?: string
          jurado_name?: string
          lectura?: number | null
          observations?: string | null
          recommendation?: string | null
          ritmo_escala?: number | null
          ritmo_rep?: number | null
          score_danzon?: number | null
          score_escala?: number | null
          score_total?: number | null
          sonido?: number | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      exoneraciones: {
        Row: {
          activa: boolean | null
          aprobado_por: string | null
          created_at: string | null
          cuota_id: string
          documento_url: string | null
          familia_id: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          motivo: string
          porcentaje: number
          tipo: Database["public"]["Enums"]["exoneracion_tipo"]
        }
        Insert: {
          activa?: boolean | null
          aprobado_por?: string | null
          created_at?: string | null
          cuota_id: string
          documento_url?: string | null
          familia_id: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          motivo: string
          porcentaje: number
          tipo: Database["public"]["Enums"]["exoneracion_tipo"]
        }
        Update: {
          activa?: boolean | null
          aprobado_por?: string | null
          created_at?: string | null
          cuota_id?: string
          documento_url?: string | null
          familia_id?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          motivo?: string
          porcentaje?: number
          tipo?: Database["public"]["Enums"]["exoneracion_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "exoneraciones_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exoneraciones_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "vw_mora_activa"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "exoneraciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exoneraciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "exoneraciones_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas_reparacion: {
        Row: {
          created_at: string
          estado_pago: string
          fecha_emision: string
          id: string
          impuestos: number | null
          metodo_pago: string
          monto_total: number
          numero_factura: string
          pdf_generado_url: string | null
          reparacion_id: string
          responsable_id: string | null
          tipo_factura: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado_pago?: string
          fecha_emision?: string
          id?: string
          impuestos?: number | null
          metodo_pago: string
          monto_total: number
          numero_factura: string
          pdf_generado_url?: string | null
          reparacion_id: string
          responsable_id?: string | null
          tipo_factura?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado_pago?: string
          fecha_emision?: string
          id?: string
          impuestos?: number | null
          metodo_pago?: string
          monto_total?: number
          numero_factura?: string
          pdf_generado_url?: string | null
          reparacion_id?: string
          responsable_id?: string | null
          tipo_factura?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facturas_reparacion_reparacion_id_fkey"
            columns: ["reparacion_id"]
            isOneToOne: false
            referencedRelation: "inventario_reparaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_reparacion_reparacion_id_fkey"
            columns: ["reparacion_id"]
            isOneToOne: false
            referencedRelation: "vw_reparaciones_pendientes"
            referencedColumns: ["id"]
          },
        ]
      }
      familias: {
        Row: {
          activa: boolean
          created_at: string | null
          datos_extra: Json | null
          fecha_ingreso: string
          id: string
          nombre_familia: string
          updated_at: string | null
        }
        Insert: {
          activa?: boolean
          created_at?: string | null
          datos_extra?: Json | null
          fecha_ingreso?: string
          id?: string
          nombre_familia: string
          updated_at?: string | null
        }
        Update: {
          activa?: boolean
          created_at?: string | null
          datos_extra?: Json | null
          fecha_ingreso?: string
          id?: string
          nombre_familia?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fin_service_accounts: {
        Row: {
          account_name: string | null
          active: boolean
          created_at: string
          created_by: string | null
          currency_code: string
          essential: boolean
          external_account_ref: string
          id: string
          provider_id: string
          refresh_enabled: boolean
          service_type: string | null
        }
        Insert: {
          account_name?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          currency_code?: string
          essential?: boolean
          external_account_ref: string
          id?: string
          provider_id: string
          refresh_enabled?: boolean
          service_type?: string | null
        }
        Update: {
          account_name?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          currency_code?: string
          essential?: boolean
          external_account_ref?: string
          id?: string
          provider_id?: string
          refresh_enabled?: boolean
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_service_accounts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "fin_service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_service_balance_snapshots: {
        Row: {
          amount_due_centavos: number | null
          balance_centavos: number | null
          created_at: string
          currency_code: string
          due_date: string | null
          id: string
          observed_at: string
          provider_summary: Json | null
          refresh_run_id: string | null
          service_account_id: string
          source_snapshot_key: string
        }
        Insert: {
          amount_due_centavos?: number | null
          balance_centavos?: number | null
          created_at?: string
          currency_code: string
          due_date?: string | null
          id?: string
          observed_at: string
          provider_summary?: Json | null
          refresh_run_id?: string | null
          service_account_id: string
          source_snapshot_key: string
        }
        Update: {
          amount_due_centavos?: number | null
          balance_centavos?: number | null
          created_at?: string
          currency_code?: string
          due_date?: string | null
          id?: string
          observed_at?: string
          provider_summary?: Json | null
          refresh_run_id?: string | null
          service_account_id?: string
          source_snapshot_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_service_balance_snapshots_refresh_run_id_fkey"
            columns: ["refresh_run_id"]
            isOneToOne: false
            referencedRelation: "fin_service_refresh_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_service_balance_snapshots_service_account_id_fkey"
            columns: ["service_account_id"]
            isOneToOne: false
            referencedRelation: "fin_service_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_service_providers: {
        Row: {
          connector_key: string
          connector_status: string
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          connector_key: string
          connector_status?: string
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Update: {
          connector_key?: string
          connector_status?: string
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      fin_service_refresh_runs: {
        Row: {
          created_at: string
          created_by: string | null
          error_code: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          service_account_id: string
          status: string
          trigger_source: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          service_account_id: string
          status: string
          trigger_source: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          service_account_id?: string
          status?: string
          trigger_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_service_refresh_runs_service_account_id_fkey"
            columns: ["service_account_id"]
            isOneToOne: false
            referencedRelation: "fin_service_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_service_refresh_state: {
        Row: {
          last_error_code: string | null
          last_query_at: string | null
          last_status: string | null
          last_success_at: string | null
          lock_expires_at: string | null
          locked_by_run_id: string | null
          service_account_id: string
          updated_at: string
        }
        Insert: {
          last_error_code?: string | null
          last_query_at?: string | null
          last_status?: string | null
          last_success_at?: string | null
          lock_expires_at?: string | null
          locked_by_run_id?: string | null
          service_account_id: string
          updated_at?: string
        }
        Update: {
          last_error_code?: string | null
          last_query_at?: string | null
          last_status?: string | null
          last_success_at?: string | null
          lock_expires_at?: string | null
          locked_by_run_id?: string | null
          service_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_service_refresh_state_locked_by_run_id_fkey"
            columns: ["locked_by_run_id"]
            isOneToOne: false
            referencedRelation: "fin_service_refresh_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_service_refresh_state_service_account_id_fkey"
            columns: ["service_account_id"]
            isOneToOne: true
            referencedRelation: "fin_service_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      finanzas_politica_cobranza: {
        Row: {
          bloqueo_requiere_aprobacion: boolean
          dia_vencimiento: number
          dias_mora_amarilla: number
          dias_mora_critica: number
          singleton: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bloqueo_requiere_aprobacion?: boolean
          dia_vencimiento?: number
          dias_mora_amarilla?: number
          dias_mora_critica?: number
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bloqueo_requiere_aprobacion?: boolean
          dia_vencimiento?: number
          dias_mora_amarilla?: number
          dias_mora_critica?: number
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      gastos_fijos: {
        Row: {
          activo: boolean
          categoria: string
          centro_costo: Database["public"]["Enums"]["soi_departamento"]
          created_at: string
          created_by: string | null
          dia_fin: number
          dia_inicio: number
          id: string
          monto_centavos: number
          nombre: string
          notas: string | null
          repetir_mensual: boolean
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria: string
          centro_costo?: Database["public"]["Enums"]["soi_departamento"]
          created_at?: string
          created_by?: string | null
          dia_fin: number
          dia_inicio: number
          id?: string
          monto_centavos: number
          nombre: string
          notas?: string | null
          repetir_mensual?: boolean
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string
          centro_costo?: Database["public"]["Enums"]["soi_departamento"]
          created_at?: string
          created_by?: string | null
          dia_fin?: number
          dia_inicio?: number
          id?: string
          monto_centavos?: number
          nombre?: string
          notas?: string | null
          repetir_mensual?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      gastos_fijos_pagos: {
        Row: {
          created_at: string
          estado: string
          fecha_pago: string | null
          gasto_fijo_id: string
          id: string
          monto_centavos: number
          periodo_anio: number
          periodo_mes: number
          referencia: string | null
          registrado_por: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha_pago?: string | null
          gasto_fijo_id: string
          id?: string
          monto_centavos: number
          periodo_anio: number
          periodo_mes: number
          referencia?: string | null
          registrado_por?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: string
          fecha_pago?: string | null
          gasto_fijo_id?: string
          id?: string
          monto_centavos?: number
          periodo_anio?: number
          periodo_mes?: number
          referencia?: string | null
          registrado_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gastos_fijos_pagos_gasto_fijo_id_fkey"
            columns: ["gasto_fijo_id"]
            isOneToOne: false
            referencedRelation: "gastos_fijos"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          actividad_nombre: string | null
          advertencias: Json | null
          alumno_id: string | null
          alumno_nombre: string | null
          batch_id: string | null
          contenido_final: string
          created_at: string | null
          estado: string
          generado_por: string | null
          generated_at: string | null
          grupo_nombre: string | null
          id: string
          pdf_url: string | null
          template_id: string | null
          tipo: string
          titulo: string
          variables_faltantes: Json | null
          variables_usadas: Json | null
        }
        Insert: {
          actividad_nombre?: string | null
          advertencias?: Json | null
          alumno_id?: string | null
          alumno_nombre?: string | null
          batch_id?: string | null
          contenido_final: string
          created_at?: string | null
          estado?: string
          generado_por?: string | null
          generated_at?: string | null
          grupo_nombre?: string | null
          id?: string
          pdf_url?: string | null
          template_id?: string | null
          tipo: string
          titulo: string
          variables_faltantes?: Json | null
          variables_usadas?: Json | null
        }
        Update: {
          actividad_nombre?: string | null
          advertencias?: Json | null
          alumno_id?: string | null
          alumno_nombre?: string | null
          batch_id?: string | null
          contenido_final?: string
          created_at?: string | null
          estado?: string
          generado_por?: string | null
          generated_at?: string | null
          grupo_nombre?: string | null
          id?: string
          pdf_url?: string | null
          template_id?: string | null
          tipo?: string
          titulo?: string
          variables_faltantes?: Json | null
          variables_usadas?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "generated_documents_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "generated_documents_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "document_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      hermes_acciones: {
        Row: {
          descripcion: string | null
          destinatario: string | null
          estado: string | null
          fecha_completacion: string | null
          fecha_creacion: string | null
          id: string
          protocolo_id: string | null
          resultado: Json | null
          tipo: string | null
        }
        Insert: {
          descripcion?: string | null
          destinatario?: string | null
          estado?: string | null
          fecha_completacion?: string | null
          fecha_creacion?: string | null
          id?: string
          protocolo_id?: string | null
          resultado?: Json | null
          tipo?: string | null
        }
        Update: {
          descripcion?: string | null
          destinatario?: string | null
          estado?: string | null
          fecha_completacion?: string | null
          fecha_creacion?: string | null
          id?: string
          protocolo_id?: string | null
          resultado?: Json | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hermes_acciones_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "hermes_protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
      hermes_evaluaciones: {
        Row: {
          acciones_generadas: number | null
          alertas_identificadas: number | null
          detalle: Json | null
          fecha: string | null
          id: string
        }
        Insert: {
          acciones_generadas?: number | null
          alertas_identificadas?: number | null
          detalle?: Json | null
          fecha?: string | null
          id?: string
        }
        Update: {
          acciones_generadas?: number | null
          alertas_identificadas?: number | null
          detalle?: Json | null
          fecha?: string | null
          id?: string
        }
        Relationships: []
      }
      hermes_feedback: {
        Row: {
          accion_id: string | null
          accion_realizada: string | null
          causa_raiz: string | null
          comentarios: string | null
          eficacia_score: number | null
          fecha_feedback: string | null
          id: string
          protocolo_id: string | null
          resuelta_en_plazo: boolean | null
          tiempo_resolucion_dias: number | null
          usuario_feedback: string | null
        }
        Insert: {
          accion_id?: string | null
          accion_realizada?: string | null
          causa_raiz?: string | null
          comentarios?: string | null
          eficacia_score?: number | null
          fecha_feedback?: string | null
          id?: string
          protocolo_id?: string | null
          resuelta_en_plazo?: boolean | null
          tiempo_resolucion_dias?: number | null
          usuario_feedback?: string | null
        }
        Update: {
          accion_id?: string | null
          accion_realizada?: string | null
          causa_raiz?: string | null
          comentarios?: string | null
          eficacia_score?: number | null
          fecha_feedback?: string | null
          id?: string
          protocolo_id?: string | null
          resuelta_en_plazo?: boolean | null
          tiempo_resolucion_dias?: number | null
          usuario_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hermes_feedback_accion_id_fkey"
            columns: ["accion_id"]
            isOneToOne: false
            referencedRelation: "hermes_acciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hermes_feedback_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "hermes_protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
      hermes_inbox: {
        Row: {
          canal: string
          categoria: string
          created_at: string
          id: number
          processed: boolean
          raw_ref: string | null
          summary: string
          telegram_user_id: number | null
        }
        Insert: {
          canal?: string
          categoria: string
          created_at?: string
          id?: number
          processed?: boolean
          raw_ref?: string | null
          summary: string
          telegram_user_id?: number | null
        }
        Update: {
          canal?: string
          categoria?: string
          created_at?: string
          id?: number
          processed?: boolean
          raw_ref?: string | null
          summary?: string
          telegram_user_id?: number | null
        }
        Relationships: []
      }
      hermes_kanban_cards: {
        Row: {
          assignee: string | null
          board: string | null
          card_id: string
          hermes_updated_at: string | null
          priority: number | null
          raw: Json | null
          status: string
          summary: string | null
          synced_at: string
          title: string
        }
        Insert: {
          assignee?: string | null
          board?: string | null
          card_id: string
          hermes_updated_at?: string | null
          priority?: number | null
          raw?: Json | null
          status: string
          summary?: string | null
          synced_at?: string
          title: string
        }
        Update: {
          assignee?: string | null
          board?: string | null
          card_id?: string
          hermes_updated_at?: string | null
          priority?: number | null
          raw?: Json | null
          status?: string
          summary?: string | null
          synced_at?: string
          title?: string
        }
        Relationships: []
      }
      hermes_notificaciones: {
        Row: {
          accion_id: string | null
          asunto: string | null
          destinatario: string | null
          estado: string | null
          fecha_envio: string | null
          fecha_lectura: string | null
          id: string
          mensaje: string | null
          tipo: string | null
        }
        Insert: {
          accion_id?: string | null
          asunto?: string | null
          destinatario?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_lectura?: string | null
          id?: string
          mensaje?: string | null
          tipo?: string | null
        }
        Update: {
          accion_id?: string | null
          asunto?: string | null
          destinatario?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_lectura?: string | null
          id?: string
          mensaje?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hermes_notificaciones_accion_id_fkey"
            columns: ["accion_id"]
            isOneToOne: false
            referencedRelation: "hermes_acciones"
            referencedColumns: ["id"]
          },
        ]
      }
      hermes_process_cases: {
        Row: {
          closed_at: string | null
          closure_criteria_snapshot: Json
          closure_summary: string | null
          description: string | null
          entity_id: string | null
          entity_label: string | null
          entity_type: string | null
          id: string
          metadata: Json
          opened_at: string
          owner_department: string | null
          priority: string
          process_code: string | null
          requested_by: string | null
          requested_by_name: string | null
          required_evidence_snapshot: Json
          source: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closure_criteria_snapshot?: Json
          closure_summary?: string | null
          description?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          opened_at?: string
          owner_department?: string | null
          priority?: string
          process_code?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          required_evidence_snapshot?: Json
          source?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closure_criteria_snapshot?: Json
          closure_summary?: string | null
          description?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          opened_at?: string
          owner_department?: string | null
          priority?: string
          process_code?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          required_evidence_snapshot?: Json
          source?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hermes_process_cases_process_code_fkey"
            columns: ["process_code"]
            isOneToOne: false
            referencedRelation: "soi_process_contracts"
            referencedColumns: ["process_code"]
          },
        ]
      }
      hermes_protocolos: {
        Row: {
          activo: boolean | null
          categoria_evento: Database["public"]["Enums"]["event_categoria"]
          created_at: string | null
          descripcion: string | null
          id: string
          nombre_protocolo: string
          tareas_plantilla: Json
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          categoria_evento: Database["public"]["Enums"]["event_categoria"]
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre_protocolo: string
          tareas_plantilla: Json
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          categoria_evento?: Database["public"]["Enums"]["event_categoria"]
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre_protocolo?: string
          tareas_plantilla?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      hermes_reactive_rules: {
        Row: {
          conditions_json: Json
          created_at: string
          departamento: string
          descripcion: string | null
          enabled: boolean
          id: string
          nombre: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          conditions_json?: Json
          created_at?: string
          departamento: string
          descripcion?: string | null
          enabled?: boolean
          id?: string
          nombre: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          conditions_json?: Json
          created_at?: string
          departamento?: string
          descripcion?: string | null
          enabled?: boolean
          id?: string
          nombre?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      hermes_whatsapp_config: {
        Row: {
          activo: boolean | null
          api_key: string | null
          batch_cooldown_seg: number
          batch_size: number
          cap_diario: number
          cap_horario: number
          consentimiento_registrado: boolean
          created_at: string | null
          gateway_url: string
          id: string
          instance_name: string
          jitter_max_seg: number
          jitter_min_seg: number
          numero_nombre: string | null
          numero_wid: string | null
          rate_limit_hora: number
          updated_at: string | null
          warmup_desde: string | null
          warmup_dias: number
          warmup_inicio: number
        }
        Insert: {
          activo?: boolean | null
          api_key?: string | null
          batch_cooldown_seg?: number
          batch_size?: number
          cap_diario?: number
          cap_horario?: number
          consentimiento_registrado?: boolean
          created_at?: string | null
          gateway_url: string
          id?: string
          instance_name?: string
          jitter_max_seg?: number
          jitter_min_seg?: number
          numero_nombre?: string | null
          numero_wid?: string | null
          rate_limit_hora?: number
          updated_at?: string | null
          warmup_desde?: string | null
          warmup_dias?: number
          warmup_inicio?: number
        }
        Update: {
          activo?: boolean | null
          api_key?: string | null
          batch_cooldown_seg?: number
          batch_size?: number
          cap_diario?: number
          cap_horario?: number
          consentimiento_registrado?: boolean
          created_at?: string | null
          gateway_url?: string
          id?: string
          instance_name?: string
          jitter_max_seg?: number
          jitter_min_seg?: number
          numero_nombre?: string | null
          numero_wid?: string | null
          rate_limit_hora?: number
          updated_at?: string | null
          warmup_desde?: string | null
          warmup_dias?: number
          warmup_inicio?: number
        }
        Relationships: []
      }
      hermes_whatsapp_queue: {
        Row: {
          campania_envio_id: string | null
          created_at: string | null
          error_msg: string | null
          estado: string
          id: string
          intentos: number | null
          jid: string
          mensaje: string
          procesado_at: string | null
        }
        Insert: {
          campania_envio_id?: string | null
          created_at?: string | null
          error_msg?: string | null
          estado?: string
          id?: string
          intentos?: number | null
          jid: string
          mensaje: string
          procesado_at?: string | null
        }
        Update: {
          campania_envio_id?: string | null
          created_at?: string | null
          error_msg?: string | null
          estado?: string
          id?: string
          intentos?: number | null
          jid?: string
          mensaje?: string
          procesado_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hermes_whatsapp_queue_campania_envio_id_fkey"
            columns: ["campania_envio_id"]
            isOneToOne: false
            referencedRelation: "campania_envios"
            referencedColumns: ["id"]
          },
        ]
      }
      hilos_mensajes: {
        Row: {
          creado_por: string | null
          created_at: string | null
          departamentos_involucrados: string[] | null
          id: string
          resuelto: boolean | null
          tema: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          creado_por?: string | null
          created_at?: string | null
          departamentos_involucrados?: string[] | null
          id?: string
          resuelto?: boolean | null
          tema?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          creado_por?: string | null
          created_at?: string | null
          departamentos_involucrados?: string[] | null
          id?: string
          resuelto?: boolean | null
          tema?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      historial_estado_alumno: {
        Row: {
          alumno_id: string
          created_at: string
          estado: string
          fecha: string
          id: string
          motivo: string | null
          registrado_por: string | null
        }
        Insert: {
          alumno_id: string
          created_at?: string
          estado: string
          fecha?: string
          id?: string
          motivo?: string | null
          registrado_por?: string | null
        }
        Update: {
          alumno_id?: string
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          motivo?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "historial_estado_alumno_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      homework_assignments: {
        Row: {
          class_event_id: string
          created_at: string
          description: string
          due_date: string | null
          id: string
          node_id: string | null
          status: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          class_event_id: string
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          node_id?: string | null
          status?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          class_event_id?: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          node_id?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_assignments_class_event_id_fkey"
            columns: ["class_event_id"]
            isOneToOne: false
            referencedRelation: "class_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "homework_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "homework_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "homework_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      horarios: {
        Row: {
          activo: boolean | null
          clase_id: string
          created_at: string | null
          dia_semana: number
          hora_fin: string
          hora_inicio: string
          id: string
          maestro_id: string
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          clase_id: string
          created_at?: string | null
          dia_semana: number
          hora_fin: string
          hora_inicio: string
          id?: string
          maestro_id: string
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          clase_id?: string
          created_at?: string | null
          dia_semana?: number
          hora_fin?: string
          hora_inicio?: string
          id?: string
          maestro_id?: string
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_horarios_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_horarios_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_horarios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_horarios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_horarios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_horarios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_horarios_salon"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
        ]
      }
      indicador_prerequisito: {
        Row: {
          created_at: string | null
          id: string
          indicador_id: string
          prerequisito_indicador_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          indicador_id: string
          prerequisito_indicador_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          indicador_id?: string
          prerequisito_indicador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicador_prerequisito_indicador_id_fkey"
            columns: ["indicador_id"]
            isOneToOne: false
            referencedRelation: "maestro_indicadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicador_prerequisito_prerequisito_indicador_id_fkey"
            columns: ["prerequisito_indicador_id"]
            isOneToOne: false
            referencedRelation: "maestro_indicadores"
            referencedColumns: ["id"]
          },
        ]
      }
      indicator_attempts: {
        Row: {
          covered_by_clase_id: string | null
          covered_date: string | null
          created_at: string | null
          created_by: string
          id: string
          indicator_id: string
          node_id: string | null
          nota: number | null
          observations: string | null
          result: string | null
          session_id: string | null
          status: string | null
          student_id: string
          tarea: string | null
          updated_at: string | null
        }
        Insert: {
          covered_by_clase_id?: string | null
          covered_date?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          indicator_id: string
          node_id?: string | null
          nota?: number | null
          observations?: string | null
          result?: string | null
          session_id?: string | null
          status?: string | null
          student_id: string
          tarea?: string | null
          updated_at?: string | null
        }
        Update: {
          covered_by_clase_id?: string | null
          covered_date?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          indicator_id?: string
          node_id?: string | null
          nota?: number | null
          observations?: string | null
          result?: string | null
          session_id?: string | null
          status?: string | null
          student_id?: string
          tarea?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_attempts_covered_by_clase_id_fkey"
            columns: ["covered_by_clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_attempts_covered_by_clase_id_fkey"
            columns: ["covered_by_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "indicator_attempts_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_attempts_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
        ]
      }
      indicator_session_students: {
        Row: {
          alumno_id: string
          created_at: string | null
          id: string
          indicator_session_id: string
          nota_cualitativa: string
          observaciones_individuales: string | null
        }
        Insert: {
          alumno_id: string
          created_at?: string | null
          id?: string
          indicator_session_id: string
          nota_cualitativa: string
          observaciones_individuales?: string | null
        }
        Update: {
          alumno_id?: string
          created_at?: string | null
          id?: string
          indicator_session_id?: string
          nota_cualitativa?: string
          observaciones_individuales?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_session_students_indicator_session_id_fkey"
            columns: ["indicator_session_id"]
            isOneToOne: false
            referencedRelation: "indicator_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      indicator_sessions: {
        Row: {
          clase_id: string
          created_at: string | null
          descripcion: string | null
          fecha: string
          id: string
          maestro_id: string
          objetivo_id: string
          updated_at: string | null
        }
        Insert: {
          clase_id: string
          created_at?: string | null
          descripcion?: string | null
          fecha: string
          id?: string
          maestro_id: string
          objetivo_id: string
          updated_at?: string | null
        }
        Update: {
          clase_id?: string
          created_at?: string | null
          descripcion?: string | null
          fecha?: string
          id?: string
          maestro_id?: string
          objetivo_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_sessions_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_sessions_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "indicator_sessions_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_sessions_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "indicator_sessions_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_sessions_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "indicator_sessions_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "ruta_contenido_objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      indicators: {
        Row: {
          activo: boolean
          description: string
          id: string
          is_required: boolean
          minimum_criteria: Json | null
          node_id: string | null
          nombre: string | null
          objetivo_id: string | null
          order_index: number
        }
        Insert: {
          activo?: boolean
          description: string
          id?: string
          is_required?: boolean
          minimum_criteria?: Json | null
          node_id?: string | null
          nombre?: string | null
          objetivo_id?: string | null
          order_index?: number
        }
        Update: {
          activo?: boolean
          description?: string
          id?: string
          is_required?: boolean
          minimum_criteria?: Json | null
          node_id?: string | null
          nombre?: string | null
          objetivo_id?: string | null
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "indicators_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicators_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "indicators_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      instituciones: {
        Row: {
          cargo: string | null
          contacto_nombre: string | null
          created_at: string
          direccion: string | null
          email: string | null
          estado: string
          id: string
          nombre: string
          notas: string | null
          redes: Json | null
          sector: string | null
          sitio_web: string | null
          telefono: string | null
          tipo: string
          ultima_gestion: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          contacto_nombre?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          estado?: string
          id?: string
          nombre: string
          notas?: string | null
          redes?: Json | null
          sector?: string | null
          sitio_web?: string | null
          telefono?: string | null
          tipo?: string
          ultima_gestion?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          contacto_nombre?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          estado?: string
          id?: string
          nombre?: string
          notas?: string | null
          redes?: Json | null
          sector?: string | null
          sitio_web?: string | null
          telefono?: string | null
          tipo?: string
          ultima_gestion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      instrumentos: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          codigo: string | null
          created_at: string
          estado: string
          id: string
          marca: string | null
          nombre: string
          notas: string | null
          serie: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          codigo?: string | null
          created_at?: string
          estado?: string
          id?: string
          marca?: string | null
          nombre: string
          notas?: string | null
          serie?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          codigo?: string | null
          created_at?: string
          estado?: string
          id?: string
          marca?: string | null
          nombre?: string
          notas?: string | null
          serie?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      intentos_ejercicios: {
        Row: {
          alumno_id: string
          aprobado: boolean | null
          clase_id: string | null
          created_at: string | null
          ejercicio_id: string
          evidencia_url: string | null
          fecha: string | null
          id: string
          maestro_id: string | null
          observaciones: string | null
          puntaje: number
          rubrica: Json | null
          sesion_clase_id: string | null
        }
        Insert: {
          alumno_id: string
          aprobado?: boolean | null
          clase_id?: string | null
          created_at?: string | null
          ejercicio_id: string
          evidencia_url?: string | null
          fecha?: string | null
          id?: string
          maestro_id?: string | null
          observaciones?: string | null
          puntaje: number
          rubrica?: Json | null
          sesion_clase_id?: string | null
        }
        Update: {
          alumno_id?: string
          aprobado?: boolean | null
          clase_id?: string | null
          created_at?: string | null
          ejercicio_id?: string
          evidencia_url?: string | null
          fecha?: string | null
          id?: string
          maestro_id?: string | null
          observaciones?: string | null
          puntaje?: number
          rubrica?: Json | null
          sesion_clase_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_ejercicio"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "fk_intentos_ejercicios_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      inventario_accesorios: {
        Row: {
          activo_id: string | null
          cantidad: number
          created_at: string
          estado: string
          fecha_asignacion: string | null
          id: string
          marca: string | null
          observaciones: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          activo_id?: string | null
          cantidad?: number
          created_at?: string
          estado?: string
          fecha_asignacion?: string | null
          id?: string
          marca?: string | null
          observaciones?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          activo_id?: string | null
          cantidad?: number
          created_at?: string
          estado?: string
          fecha_asignacion?: string | null
          id?: string
          marca?: string | null
          observaciones?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_accesorios_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_accesorios_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_activos: {
        Row: {
          activo: boolean
          alertas_calidad: string | null
          asignado_a_texto: string | null
          cantidad: number | null
          codigo_donante: string | null
          codigo_inventario: string
          created_at: string
          donante_inferido: string | null
          estado_asignacion_original: string | null
          estado_conservacion: string
          estado_uso: string
          faltantes_detectados: string | null
          familia: string | null
          fecha_adquisicion: string | null
          fecha_baja: string | null
          fila_origen_csv: number | null
          foto_url: string | null
          fuente_importacion: string | null
          id: string
          import_metadata: Json
          marca: string | null
          modelo: string | null
          motivo_baja: string | null
          nombre_normalizado: string | null
          notas: string | null
          numero_original: string | null
          numero_serie: string | null
          proveedor: string | null
          requiere_mantenimiento: boolean | null
          revisar: boolean | null
          tamano: string | null
          tiene_arco: boolean | null
          tiene_estuche: boolean | null
          tiene_funda: boolean | null
          tiene_hombrera_almohadilla: boolean | null
          tipo_instrumento: string
          ubicacion: string
          unidad: string | null
          updated_at: string
          valor_adquisicion: number | null
        }
        Insert: {
          activo?: boolean
          alertas_calidad?: string | null
          asignado_a_texto?: string | null
          cantidad?: number | null
          codigo_donante?: string | null
          codigo_inventario: string
          created_at?: string
          donante_inferido?: string | null
          estado_asignacion_original?: string | null
          estado_conservacion?: string
          estado_uso?: string
          faltantes_detectados?: string | null
          familia?: string | null
          fecha_adquisicion?: string | null
          fecha_baja?: string | null
          fila_origen_csv?: number | null
          foto_url?: string | null
          fuente_importacion?: string | null
          id?: string
          import_metadata?: Json
          marca?: string | null
          modelo?: string | null
          motivo_baja?: string | null
          nombre_normalizado?: string | null
          notas?: string | null
          numero_original?: string | null
          numero_serie?: string | null
          proveedor?: string | null
          requiere_mantenimiento?: boolean | null
          revisar?: boolean | null
          tamano?: string | null
          tiene_arco?: boolean | null
          tiene_estuche?: boolean | null
          tiene_funda?: boolean | null
          tiene_hombrera_almohadilla?: boolean | null
          tipo_instrumento: string
          ubicacion?: string
          unidad?: string | null
          updated_at?: string
          valor_adquisicion?: number | null
        }
        Update: {
          activo?: boolean
          alertas_calidad?: string | null
          asignado_a_texto?: string | null
          cantidad?: number | null
          codigo_donante?: string | null
          codigo_inventario?: string
          created_at?: string
          donante_inferido?: string | null
          estado_asignacion_original?: string | null
          estado_conservacion?: string
          estado_uso?: string
          faltantes_detectados?: string | null
          familia?: string | null
          fecha_adquisicion?: string | null
          fecha_baja?: string | null
          fila_origen_csv?: number | null
          foto_url?: string | null
          fuente_importacion?: string | null
          id?: string
          import_metadata?: Json
          marca?: string | null
          modelo?: string | null
          motivo_baja?: string | null
          nombre_normalizado?: string | null
          notas?: string | null
          numero_original?: string | null
          numero_serie?: string | null
          proveedor?: string | null
          requiere_mantenimiento?: boolean | null
          revisar?: boolean | null
          tamano?: string | null
          tiene_arco?: boolean | null
          tiene_estuche?: boolean | null
          tiene_funda?: boolean | null
          tiene_hombrera_almohadilla?: boolean | null
          tipo_instrumento?: string
          ubicacion?: string
          unidad?: string | null
          updated_at?: string
          valor_adquisicion?: number | null
        }
        Relationships: []
      }
      inventario_historial: {
        Row: {
          activo_id: string
          created_at: string
          descripcion: string
          fecha: string
          id: string
          metadata: Json | null
          tipo_evento: string
          usuario_id: string | null
        }
        Insert: {
          activo_id: string
          created_at?: string
          descripcion: string
          fecha?: string
          id?: string
          metadata?: Json | null
          tipo_evento: string
          usuario_id?: string | null
        }
        Update: {
          activo_id?: string
          created_at?: string
          descripcion?: string
          fecha?: string
          id?: string
          metadata?: Json | null
          tipo_evento?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_historial_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_historial_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_import_staging: {
        Row: {
          activo: string | null
          alertas_calidad: string | null
          asignado_a: string | null
          cantidad: string | null
          codigo_donante: string | null
          codigo_importacion: string
          codigo_interno_original: string | null
          donante_inferido: string | null
          estado_asignacion: string | null
          estado_fisico: string | null
          faltantes_detectados: string | null
          familia: string | null
          fila_origen_csv: string | null
          fuente_seccion: string | null
          imported_at: string
          marca: string | null
          modelo: string | null
          nombre_item: string | null
          nombre_normalizado: string | null
          numero_original: string | null
          observaciones: string | null
          requiere_mantenimiento: string | null
          revisar: string | null
          serial: string | null
          tags: string | null
          tamano: string | null
          tiene_arco: string | null
          tiene_estuche: string | null
          tiene_funda: string | null
          tiene_hombrera_almohadilla: string | null
          tipo_item: string | null
          ubicacion_actual: string | null
          unidad: string | null
        }
        Insert: {
          activo?: string | null
          alertas_calidad?: string | null
          asignado_a?: string | null
          cantidad?: string | null
          codigo_donante?: string | null
          codigo_importacion: string
          codigo_interno_original?: string | null
          donante_inferido?: string | null
          estado_asignacion?: string | null
          estado_fisico?: string | null
          faltantes_detectados?: string | null
          familia?: string | null
          fila_origen_csv?: string | null
          fuente_seccion?: string | null
          imported_at?: string
          marca?: string | null
          modelo?: string | null
          nombre_item?: string | null
          nombre_normalizado?: string | null
          numero_original?: string | null
          observaciones?: string | null
          requiere_mantenimiento?: string | null
          revisar?: string | null
          serial?: string | null
          tags?: string | null
          tamano?: string | null
          tiene_arco?: string | null
          tiene_estuche?: string | null
          tiene_funda?: string | null
          tiene_hombrera_almohadilla?: string | null
          tipo_item?: string | null
          ubicacion_actual?: string | null
          unidad?: string | null
        }
        Update: {
          activo?: string | null
          alertas_calidad?: string | null
          asignado_a?: string | null
          cantidad?: string | null
          codigo_donante?: string | null
          codigo_importacion?: string
          codigo_interno_original?: string | null
          donante_inferido?: string | null
          estado_asignacion?: string | null
          estado_fisico?: string | null
          faltantes_detectados?: string | null
          familia?: string | null
          fila_origen_csv?: string | null
          fuente_seccion?: string | null
          imported_at?: string
          marca?: string | null
          modelo?: string | null
          nombre_item?: string | null
          nombre_normalizado?: string | null
          numero_original?: string | null
          observaciones?: string | null
          requiere_mantenimiento?: string | null
          revisar?: string | null
          serial?: string | null
          tags?: string | null
          tamano?: string | null
          tiene_arco?: string | null
          tiene_estuche?: string | null
          tiene_funda?: string | null
          tiene_hombrera_almohadilla?: string | null
          tipo_item?: string | null
          ubicacion_actual?: string | null
          unidad?: string | null
        }
        Relationships: []
      }
      inventario_reparaciones: {
        Row: {
          activo_id: string
          costo_estimado: number | null
          costo_real: number | null
          created_at: string
          descripcion: string
          estado: string
          fecha_egreso: string | null
          fecha_ingreso: string
          id: string
          proveedor_factura_url: string | null
          tallerista_nombre: string
          tipo_tallerista: string
          updated_at: string
        }
        Insert: {
          activo_id: string
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string
          descripcion: string
          estado?: string
          fecha_egreso?: string | null
          fecha_ingreso?: string
          id?: string
          proveedor_factura_url?: string | null
          tallerista_nombre: string
          tipo_tallerista: string
          updated_at?: string
        }
        Update: {
          activo_id?: string
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string
          descripcion?: string
          estado?: string
          fecha_egreso?: string | null
          fecha_ingreso?: string
          id?: string
          proveedor_factura_url?: string | null
          tallerista_nombre?: string
          tipo_tallerista?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_reparaciones_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_reparaciones_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
        ]
      }
      justificaciones: {
        Row: {
          alumno_id: string
          categoria: string | null
          clase_id: string
          creado_por: string | null
          created_at: string | null
          estado: string
          evidencia_base64: string | null
          evidencia_url: string | null
          fecha: string
          fecha_revision: string | null
          id: string
          motivo: string
          revisado_por: string | null
          sesion_id: string | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          categoria?: string | null
          clase_id: string
          creado_por?: string | null
          created_at?: string | null
          estado?: string
          evidencia_base64?: string | null
          evidencia_url?: string | null
          fecha: string
          fecha_revision?: string | null
          id?: string
          motivo: string
          revisado_por?: string | null
          sesion_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          categoria?: string | null
          clase_id?: string
          creado_por?: string | null
          created_at?: string | null
          estado?: string
          evidencia_base64?: string | null
          evidencia_url?: string | null
          fecha?: string
          fecha_revision?: string | null
          id?: string
          motivo?: string
          revisado_por?: string | null
          sesion_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "justificaciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificaciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "justificaciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificaciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "justificaciones_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificaciones_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "justificaciones_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificaciones_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "justificaciones_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificaciones_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "justificaciones_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      levels: {
        Row: {
          block_id: string | null
          id: string
          is_flexible_duration: boolean
          level_number: number
          main_objective: string | null
          name: string
          order_index: number
          route_version_id: string
          suggested_duration_unit: string | null
          suggested_duration_value: number | null
          target_work: Json | null
          unlock_criteria: Json | null
        }
        Insert: {
          block_id?: string | null
          id?: string
          is_flexible_duration?: boolean
          level_number: number
          main_objective?: string | null
          name: string
          order_index?: number
          route_version_id: string
          suggested_duration_unit?: string | null
          suggested_duration_value?: number | null
          target_work?: Json | null
          unlock_criteria?: Json | null
        }
        Update: {
          block_id?: string | null
          id?: string
          is_flexible_duration?: boolean
          level_number?: number
          main_objective?: string | null
          name?: string
          order_index?: number
          route_version_id?: string
          suggested_duration_unit?: string | null
          suggested_duration_value?: number | null
          target_work?: Json | null
          unlock_criteria?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "levels_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "levels_route_version_id_fkey"
            columns: ["route_version_id"]
            isOneToOne: false
            referencedRelation: "route_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      logros: {
        Row: {
          activo: boolean | null
          created_at: string | null
          criterio: Json | null
          descripcion: string | null
          icono: string | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          criterio?: Json | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          criterio?: Json | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lut_diagnosticos: {
        Row: {
          causa_probable: string | null
          costo_mano_obra: number | null
          costo_materiales: number | null
          created_at: string
          diagnosticado_por: string | null
          diagnosticado_por_nombre: string | null
          diagnostico_tecnico: string
          gravedad: string | null
          id: string
          items: Json
          materiales_requeridos: string | null
          observaciones: string | null
          orden_id: string
          reparacion_recomendada: string | null
          requiere_servicio_externo: boolean
          tiempo_estimado_horas: number | null
          tipo_dano: string | null
          zona_afectada: string | null
        }
        Insert: {
          causa_probable?: string | null
          costo_mano_obra?: number | null
          costo_materiales?: number | null
          created_at?: string
          diagnosticado_por?: string | null
          diagnosticado_por_nombre?: string | null
          diagnostico_tecnico: string
          gravedad?: string | null
          id?: string
          items?: Json
          materiales_requeridos?: string | null
          observaciones?: string | null
          orden_id: string
          reparacion_recomendada?: string | null
          requiere_servicio_externo?: boolean
          tiempo_estimado_horas?: number | null
          tipo_dano?: string | null
          zona_afectada?: string | null
        }
        Update: {
          causa_probable?: string | null
          costo_mano_obra?: number | null
          costo_materiales?: number | null
          created_at?: string
          diagnosticado_por?: string | null
          diagnosticado_por_nombre?: string | null
          diagnostico_tecnico?: string
          gravedad?: string | null
          id?: string
          items?: Json
          materiales_requeridos?: string | null
          observaciones?: string | null
          orden_id?: string
          reparacion_recomendada?: string | null
          requiere_servicio_externo?: boolean
          tiempo_estimado_horas?: number | null
          tipo_dano?: string | null
          zona_afectada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lut_diagnosticos_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "lut_ordenes_reparacion"
            referencedColumns: ["id"]
          },
        ]
      }
      lut_evidencias: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string | null
          orden_id: string
          storage_path: string | null
          subido_por: string | null
          subido_por_nombre: string | null
          tipo: string
          visibilidad: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string | null
          orden_id: string
          storage_path?: string | null
          subido_por?: string | null
          subido_por_nombre?: string | null
          tipo: string
          visibilidad?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string | null
          orden_id?: string
          storage_path?: string | null
          subido_por?: string | null
          subido_por_nombre?: string | null
          tipo?: string
          visibilidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "lut_evidencias_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "lut_ordenes_reparacion"
            referencedColumns: ["id"]
          },
        ]
      }
      lut_insumos: {
        Row: {
          activo: boolean
          categoria: string | null
          costo_unitario: number | null
          created_at: string
          id: string
          nombre: string
          proveedor_sugerido: string | null
          stock_actual: number
          stock_minimo: number
          unidad: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          costo_unitario?: number | null
          created_at?: string
          id?: string
          nombre: string
          proveedor_sugerido?: string | null
          stock_actual?: number
          stock_minimo?: number
          unidad?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          costo_unitario?: number | null
          created_at?: string
          id?: string
          nombre?: string
          proveedor_sugerido?: string | null
          stock_actual?: number
          stock_minimo?: number
          unidad?: string
          updated_at?: string
        }
        Relationships: []
      }
      lut_movimientos_insumos: {
        Row: {
          cantidad: number
          costo_unitario: number | null
          created_at: string
          id: string
          insumo_id: string
          orden_id: string | null
          registrado_por: string | null
          tipo_movimiento: string
        }
        Insert: {
          cantidad: number
          costo_unitario?: number | null
          created_at?: string
          id?: string
          insumo_id: string
          orden_id?: string | null
          registrado_por?: string | null
          tipo_movimiento: string
        }
        Update: {
          cantidad?: number
          costo_unitario?: number | null
          created_at?: string
          id?: string
          insumo_id?: string
          orden_id?: string | null
          registrado_por?: string | null
          tipo_movimiento?: string
        }
        Relationships: [
          {
            foreignKeyName: "lut_movimientos_insumos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "lut_insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lut_movimientos_insumos_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "lut_ordenes_reparacion"
            referencedColumns: ["id"]
          },
        ]
      }
      lut_ordenes_reparacion: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          correlation_id: string | null
          costo_estimado: number | null
          costo_final: number | null
          created_at: string
          departamento_origen: string | null
          descripcion_inicial: string | null
          diagnostico_resumen: string | null
          estado: string
          fecha_diagnostico: string | null
          fecha_entrega: string | null
          fecha_estimada_entrega: string | null
          fecha_inicio_reparacion: string | null
          fecha_recepcion: string
          gravedad: string | null
          id: string
          instrumento_id: string
          prioridad: string
          recibido_por: string | null
          recibido_por_nombre: string | null
          reportado_por: string | null
          reportado_por_nombre: string | null
          requiere_aprobacion_direccion: boolean
          requiere_cobro: boolean
          requiere_reemplazo: boolean
          tecnico_responsable: string | null
          tecnico_responsable_nombre: string | null
          tipo_dano: string | null
          updated_at: string
        }
        Insert: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          correlation_id?: string | null
          costo_estimado?: number | null
          costo_final?: number | null
          created_at?: string
          departamento_origen?: string | null
          descripcion_inicial?: string | null
          diagnostico_resumen?: string | null
          estado?: string
          fecha_diagnostico?: string | null
          fecha_entrega?: string | null
          fecha_estimada_entrega?: string | null
          fecha_inicio_reparacion?: string | null
          fecha_recepcion?: string
          gravedad?: string | null
          id?: string
          instrumento_id: string
          prioridad?: string
          recibido_por?: string | null
          recibido_por_nombre?: string | null
          reportado_por?: string | null
          reportado_por_nombre?: string | null
          requiere_aprobacion_direccion?: boolean
          requiere_cobro?: boolean
          requiere_reemplazo?: boolean
          tecnico_responsable?: string | null
          tecnico_responsable_nombre?: string | null
          tipo_dano?: string | null
          updated_at?: string
        }
        Update: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          correlation_id?: string | null
          costo_estimado?: number | null
          costo_final?: number | null
          created_at?: string
          departamento_origen?: string | null
          descripcion_inicial?: string | null
          diagnostico_resumen?: string | null
          estado?: string
          fecha_diagnostico?: string | null
          fecha_entrega?: string | null
          fecha_estimada_entrega?: string | null
          fecha_inicio_reparacion?: string | null
          fecha_recepcion?: string
          gravedad?: string | null
          id?: string
          instrumento_id?: string
          prioridad?: string
          recibido_por?: string | null
          recibido_por_nombre?: string | null
          reportado_por?: string | null
          reportado_por_nombre?: string | null
          requiere_aprobacion_direccion?: boolean
          requiere_cobro?: boolean
          requiere_reemplazo?: boolean
          tecnico_responsable?: string | null
          tecnico_responsable_nombre?: string | null
          tipo_dano?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lut_ordenes_reparacion_instrumento_id_fkey"
            columns: ["instrumento_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lut_ordenes_reparacion_instrumento_id_fkey"
            columns: ["instrumento_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
        ]
      }
      lut_presupuestos: {
        Row: {
          aprobado_en: string | null
          aprobado_por: string | null
          created_at: string
          descuento: number
          estado: string
          id: string
          monto_institucion: number
          monto_representante: number
          observaciones: string | null
          orden_id: string
          subtotal_mano_obra: number
          subtotal_materiales: number
          subtotal_servicios_externos: number
          total: number | null
          updated_at: string
        }
        Insert: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          created_at?: string
          descuento?: number
          estado?: string
          id?: string
          monto_institucion?: number
          monto_representante?: number
          observaciones?: string | null
          orden_id: string
          subtotal_mano_obra?: number
          subtotal_materiales?: number
          subtotal_servicios_externos?: number
          total?: number | null
          updated_at?: string
        }
        Update: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          created_at?: string
          descuento?: number
          estado?: string
          id?: string
          monto_institucion?: number
          monto_representante?: number
          observaciones?: string | null
          orden_id?: string
          subtotal_mano_obra?: number
          subtotal_materiales?: number
          subtotal_servicios_externos?: number
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lut_presupuestos_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "lut_ordenes_reparacion"
            referencedColumns: ["id"]
          },
        ]
      }
      lut_solicitudes_compra: {
        Row: {
          aprobado_por: string | null
          cantidad_solicitada: number
          costo_estimado: number | null
          created_at: string
          estado: string
          fecha_requerida: string | null
          id: string
          insumo_id: string | null
          justificacion: string | null
          orden_id: string | null
          proveedor_sugerido: string | null
          solicitado_por: string | null
          updated_at: string
          urgencia: string
        }
        Insert: {
          aprobado_por?: string | null
          cantidad_solicitada: number
          costo_estimado?: number | null
          created_at?: string
          estado?: string
          fecha_requerida?: string | null
          id?: string
          insumo_id?: string | null
          justificacion?: string | null
          orden_id?: string | null
          proveedor_sugerido?: string | null
          solicitado_por?: string | null
          updated_at?: string
          urgencia?: string
        }
        Update: {
          aprobado_por?: string | null
          cantidad_solicitada?: number
          costo_estimado?: number | null
          created_at?: string
          estado?: string
          fecha_requerida?: string | null
          id?: string
          insumo_id?: string | null
          justificacion?: string | null
          orden_id?: string | null
          proveedor_sugerido?: string | null
          solicitado_por?: string | null
          updated_at?: string
          urgencia?: string
        }
        Relationships: [
          {
            foreignKeyName: "lut_solicitudes_compra_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "lut_insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lut_solicitudes_compra_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "lut_ordenes_reparacion"
            referencedColumns: ["id"]
          },
        ]
      }
      maestro_access_credentials: {
        Row: {
          created_at: string
          last_generated_at: string
          last_revealed_at: string | null
          last_revealed_by: string | null
          maestro_id: string
          password_ciphertext: string
          password_iv: string
          password_version: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_generated_at?: string
          last_revealed_at?: string | null
          last_revealed_by?: string | null
          maestro_id: string
          password_ciphertext: string
          password_iv: string
          password_version?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_generated_at?: string
          last_revealed_at?: string | null
          last_revealed_by?: string | null
          maestro_id?: string
          password_ciphertext?: string
          password_iv?: string
          password_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maestro_access_credentials_last_revealed_by_fkey"
            columns: ["last_revealed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_access_credentials_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_access_credentials_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "maestro_access_credentials_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_access_credentials_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      maestro_desempeno: {
        Row: {
          categoria: string | null
          fecha_ultima_evaluacion: string | null
          id: string
          maestro_id: string | null
          oldest_dias_atraso: number | null
          pending_count: number | null
          sesiones_amarillo: number | null
          sesiones_naranja: number | null
          sesiones_rojo: number | null
          sesiones_verde: number | null
          tendencia: string | null
          total_sesiones: number | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          fecha_ultima_evaluacion?: string | null
          id?: string
          maestro_id?: string | null
          oldest_dias_atraso?: number | null
          pending_count?: number | null
          sesiones_amarillo?: number | null
          sesiones_naranja?: number | null
          sesiones_rojo?: number | null
          sesiones_verde?: number | null
          tendencia?: string | null
          total_sesiones?: number | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          fecha_ultima_evaluacion?: string | null
          id?: string
          maestro_id?: string | null
          oldest_dias_atraso?: number | null
          pending_count?: number | null
          sesiones_amarillo?: number | null
          sesiones_naranja?: number | null
          sesiones_rojo?: number | null
          sesiones_verde?: number | null
          tendencia?: string | null
          total_sesiones?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maestro_desempeno_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_desempeno_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "maestro_desempeno_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_desempeno_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      maestro_indicadores: {
        Row: {
          created_at: string | null
          criterios_json: Json | null
          id: string
          nombre: string
          objetivo_id: string
          orden: number
        }
        Insert: {
          created_at?: string | null
          criterios_json?: Json | null
          id?: string
          nombre: string
          objetivo_id: string
          orden: number
        }
        Update: {
          created_at?: string | null
          criterios_json?: Json | null
          id?: string
          nombre?: string
          objetivo_id?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "maestro_indicadores_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "maestro_objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      maestro_objetivos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          unidad_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          orden: number
          unidad_id: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          unidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maestro_objetivos_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "maestro_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      maestro_retiros: {
        Row: {
          created_at: string
          id: string
          maestro_id: string
          motivo: string | null
          reemplazo_maestro_id: string | null
          resumen_dependencias: Json
          retirado_por: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          maestro_id: string
          motivo?: string | null
          reemplazo_maestro_id?: string | null
          resumen_dependencias?: Json
          retirado_por?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          maestro_id?: string
          motivo?: string | null
          reemplazo_maestro_id?: string | null
          resumen_dependencias?: Json
          retirado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maestro_retiros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_retiros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "maestro_retiros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_retiros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "maestro_retiros_reemplazo_maestro_id_fkey"
            columns: ["reemplazo_maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_retiros_reemplazo_maestro_id_fkey"
            columns: ["reemplazo_maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "maestro_retiros_reemplazo_maestro_id_fkey"
            columns: ["reemplazo_maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_retiros_reemplazo_maestro_id_fkey"
            columns: ["reemplazo_maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "maestro_retiros_retirado_por_fkey"
            columns: ["retirado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maestro_routes: {
        Row: {
          clase_id: string
          created_at: string | null
          descripcion: string | null
          id: string
          maestro_id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          clase_id: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          maestro_id: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          clase_id?: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          maestro_id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maestro_routes_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_routes_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "maestro_routes_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_routes_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "maestro_routes_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_routes_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      maestro_tareas: {
        Row: {
          alumno_id: string | null
          completada: boolean | null
          created_at: string | null
          fecha_recordatorio: string | null
          id: string
          maestro_id: string
          sesion_id: string | null
          tarea: string
        }
        Insert: {
          alumno_id?: string | null
          completada?: boolean | null
          created_at?: string | null
          fecha_recordatorio?: string | null
          id?: string
          maestro_id: string
          sesion_id?: string | null
          tarea: string
        }
        Update: {
          alumno_id?: string | null
          completada?: boolean | null
          created_at?: string | null
          fecha_recordatorio?: string | null
          id?: string
          maestro_id?: string
          sesion_id?: string | null
          tarea?: string
        }
        Relationships: [
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "maestro_tareas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "maestro_tareas_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestro_tareas_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "maestro_tareas_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      maestro_unidades: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          ruta_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          orden: number
          ruta_id: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          ruta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maestro_unidades_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "maestro_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      maestros: {
        Row: {
          activo: boolean | null
          correo: string
          created_at: string | null
          disponibilidad: Json
          es_admin: boolean | null
          especialidad: string
          especialidades: string[] | null
          habilidades: string[] | null
          id: string
          motivo_retiro: string | null
          nombre_completo: string
          puede_ser_suplente: boolean | null
          resena: string | null
          retirado_en: string | null
          retirado_por: string | null
          tipo_maestro: string | null
          tlf: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activo?: boolean | null
          correo: string
          created_at?: string | null
          disponibilidad?: Json
          es_admin?: boolean | null
          especialidad: string
          especialidades?: string[] | null
          habilidades?: string[] | null
          id?: string
          motivo_retiro?: string | null
          nombre_completo: string
          puede_ser_suplente?: boolean | null
          resena?: string | null
          retirado_en?: string | null
          retirado_por?: string | null
          tipo_maestro?: string | null
          tlf?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activo?: boolean | null
          correo?: string
          created_at?: string | null
          disponibilidad?: Json
          es_admin?: boolean | null
          especialidad?: string
          especialidades?: string[] | null
          habilidades?: string[] | null
          id?: string
          motivo_retiro?: string | null
          nombre_completo?: string
          puede_ser_suplente?: boolean | null
          resena?: string | null
          retirado_en?: string | null
          retirado_por?: string | null
          tipo_maestro?: string | null
          tlf?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_maestros_profile"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maestros_retirado_por_fkey"
            columns: ["retirado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mapa_plantillas: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          instrumento: string
          level_id: string
          nombre: string
          publicada_por: string | null
          route_version_id: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          instrumento: string
          level_id: string
          nombre: string
          publicada_por?: string | null
          route_version_id: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          instrumento?: string
          level_id?: string
          nombre?: string
          publicada_por?: string | null
          route_version_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mapa_plantillas_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapa_plantillas_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["level_id"]
          },
          {
            foreignKeyName: "mapa_plantillas_publicada_por_fkey"
            columns: ["publicada_por"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapa_plantillas_publicada_por_fkey"
            columns: ["publicada_por"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "mapa_plantillas_publicada_por_fkey"
            columns: ["publicada_por"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapa_plantillas_publicada_por_fkey"
            columns: ["publicada_por"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "mapa_plantillas_route_version_id_fkey"
            columns: ["route_version_id"]
            isOneToOne: false
            referencedRelation: "route_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes_internos: {
        Row: {
          autor_id: string | null
          contenido: string
          created_at: string | null
          departamento_destino: string[] | null
          hilo_id: string
          id: string
          leido_por: Json | null
          resuelto: boolean | null
          rol_autor: string
          tipo: Database["public"]["Enums"]["mensaje_tipo"]
        }
        Insert: {
          autor_id?: string | null
          contenido: string
          created_at?: string | null
          departamento_destino?: string[] | null
          hilo_id: string
          id?: string
          leido_por?: Json | null
          resuelto?: boolean | null
          rol_autor: string
          tipo?: Database["public"]["Enums"]["mensaje_tipo"]
        }
        Update: {
          autor_id?: string | null
          contenido?: string
          created_at?: string | null
          departamento_destino?: string[] | null
          hilo_id?: string
          id?: string
          leido_por?: Json | null
          resuelto?: boolean | null
          rol_autor?: string
          tipo?: Database["public"]["Enums"]["mensaje_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_internos_hilo_id_fkey"
            columns: ["hilo_id"]
            isOneToOne: false
            referencedRelation: "hilos_mensajes"
            referencedColumns: ["id"]
          },
        ]
      }
      minutas: {
        Row: {
          acuerdos: Json
          archivo_adjunto_url: string | null
          creado_por: string | null
          created_at: string | null
          fecha_proxima_reunion: string | null
          fecha_reunion: string
          id: string
          participantes: Json
          puntos_tratados: Json
          responsables: Json | null
          titulo: string
          visibilidad: Database["public"]["Enums"]["minuta_visibilidad"]
        }
        Insert: {
          acuerdos?: Json
          archivo_adjunto_url?: string | null
          creado_por?: string | null
          created_at?: string | null
          fecha_proxima_reunion?: string | null
          fecha_reunion: string
          id?: string
          participantes?: Json
          puntos_tratados?: Json
          responsables?: Json | null
          titulo: string
          visibilidad?: Database["public"]["Enums"]["minuta_visibilidad"]
        }
        Update: {
          acuerdos?: Json
          archivo_adjunto_url?: string | null
          creado_por?: string | null
          created_at?: string | null
          fecha_proxima_reunion?: string | null
          fecha_reunion?: string
          id?: string
          participantes?: Json
          puntos_tratados?: Json
          responsables?: Json | null
          titulo?: string
          visibilidad?: Database["public"]["Enums"]["minuta_visibilidad"]
        }
        Relationships: []
      }
      modulos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          duracion_estimada_semanas: number | null
          id: string
          nivel_id: string
          nombre: string
          orden: number
          porcentaje_aprobacion: number | null
          programa_id: string
          requisito_modulo_id: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_estimada_semanas?: number | null
          id?: string
          nivel_id: string
          nombre: string
          orden: number
          porcentaje_aprobacion?: number | null
          programa_id: string
          requisito_modulo_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_estimada_semanas?: number | null
          id?: string
          nivel_id?: string
          nombre?: string
          orden?: number
          porcentaje_aprobacion?: number | null
          programa_id?: string
          requisito_modulo_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_modulos_nivel"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_modulos_programa"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_modulos_requisito"
            columns: ["requisito_modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      niveles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          criterios_promocion: Json | null
          descripcion: string | null
          duracion_estimada_meses: number | null
          id: string
          nombre: string
          orden: number
          programa_id: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          criterios_promocion?: Json | null
          descripcion?: string | null
          duracion_estimada_meses?: number | null
          id?: string
          nombre: string
          orden: number
          programa_id: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          criterios_promocion?: Json | null
          descripcion?: string | null
          duracion_estimada_meses?: number | null
          id?: string
          nombre?: string
          orden?: number
          programa_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_niveles_programa"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      node_resources: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          node_id: string
          order_index: number
          resource_type: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          node_id: string
          order_index?: number
          resource_type: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          node_id?: string
          order_index?: number
          resource_type?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "node_resources_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_resources_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
        ]
      }
      nodes: {
        Row: {
          codigo: string | null
          id: string
          is_critical: boolean
          is_required: boolean
          level_id: string
          name: string
          objective: string | null
          order_index: number
          route_version_id: string
          type: string
        }
        Insert: {
          codigo?: string | null
          id?: string
          is_critical?: boolean
          is_required?: boolean
          level_id: string
          name: string
          objective?: string | null
          order_index?: number
          route_version_id: string
          type: string
        }
        Update: {
          codigo?: string | null
          id?: string
          is_critical?: boolean
          is_required?: boolean
          level_id?: string
          name?: string
          objective?: string | null
          order_index?: number
          route_version_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nodes_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["level_id"]
          },
          {
            foreignKeyName: "nodes_route_version_id_fkey"
            columns: ["route_version_id"]
            isOneToOne: false
            referencedRelation: "route_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          clase_id: string | null
          created_at: string | null
          dedup_key: string | null
          deep_link: string | null
          enviada_en: string | null
          escalation_level: number | null
          estado: string | null
          id: string
          leida_en: string | null
          mensaje: string
          profile_id: string | null
          registro_pendiente_id: string | null
          scheduled_for: string | null
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          clase_id?: string | null
          created_at?: string | null
          dedup_key?: string | null
          deep_link?: string | null
          enviada_en?: string | null
          escalation_level?: number | null
          estado?: string | null
          id?: string
          leida_en?: string | null
          mensaje: string
          profile_id?: string | null
          registro_pendiente_id?: string | null
          scheduled_for?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          clase_id?: string | null
          created_at?: string | null
          dedup_key?: string | null
          deep_link?: string | null
          enviada_en?: string | null
          escalation_level?: number | null
          estado?: string | null
          id?: string
          leida_en?: string | null
          mensaje?: string
          profile_id?: string | null
          registro_pendiente_id?: string | null
          scheduled_for?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_notificaciones_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notificaciones_registro"
            columns: ["registro_pendiente_id"]
            isOneToOne: false
            referencedRelation: "registros_pendientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
        ]
      }
      notificaciones_asistencia: {
        Row: {
          canal: string
          created_at: string | null
          cuerpo: string
          datos_extra: Json | null
          destinatario_email: string | null
          destinatario_nombre: string | null
          destinatario_telefono: string
          error_ultimo: Json | null
          estado: string
          fecha_creacion: string | null
          fecha_envio: string | null
          fecha_programada: string | null
          fecha_respuesta: string | null
          id: string
          intentos_envio: number | null
          prioridad: string
          respuesta: string | null
          respuesta_hora: string | null
          tipo: string
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          canal?: string
          created_at?: string | null
          cuerpo: string
          datos_extra?: Json | null
          destinatario_email?: string | null
          destinatario_nombre?: string | null
          destinatario_telefono: string
          error_ultimo?: Json | null
          estado?: string
          fecha_creacion?: string | null
          fecha_envio?: string | null
          fecha_programada?: string | null
          fecha_respuesta?: string | null
          id?: string
          intentos_envio?: number | null
          prioridad?: string
          respuesta?: string | null
          respuesta_hora?: string | null
          tipo: string
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          canal?: string
          created_at?: string | null
          cuerpo?: string
          datos_extra?: Json | null
          destinatario_email?: string | null
          destinatario_nombre?: string | null
          destinatario_telefono?: string
          error_ultimo?: Json | null
          estado?: string
          fecha_creacion?: string | null
          fecha_envio?: string | null
          fecha_programada?: string | null
          fecha_respuesta?: string | null
          id?: string
          intentos_envio?: number | null
          prioridad?: string
          respuesta?: string | null
          respuesta_hora?: string | null
          tipo?: string
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notificaciones_caja: {
        Row: {
          alumno_id: string | null
          canal: Database["public"]["Enums"]["notif_canal"]
          created_at: string | null
          cuerpo: string
          datos_extra: Json | null
          estado_portal: Database["public"]["Enums"]["notif_estado_portal"]
          estado_whatsapp: Database["public"]["Enums"]["notif_estado_wa"]
          familia_id: string | null
          fecha_programada: string | null
          fecha_respuesta: string | null
          id: string
          prioridad: Database["public"]["Enums"]["notif_prioridad"]
          representante_id: string | null
          respuesta_padre: string | null
          tipo: Database["public"]["Enums"]["notif_tipo"]
          titulo: string
          updated_at: string | null
        }
        Insert: {
          alumno_id?: string | null
          canal?: Database["public"]["Enums"]["notif_canal"]
          created_at?: string | null
          cuerpo: string
          datos_extra?: Json | null
          estado_portal?: Database["public"]["Enums"]["notif_estado_portal"]
          estado_whatsapp?: Database["public"]["Enums"]["notif_estado_wa"]
          familia_id?: string | null
          fecha_programada?: string | null
          fecha_respuesta?: string | null
          id?: string
          prioridad?: Database["public"]["Enums"]["notif_prioridad"]
          representante_id?: string | null
          respuesta_padre?: string | null
          tipo: Database["public"]["Enums"]["notif_tipo"]
          titulo: string
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string | null
          canal?: Database["public"]["Enums"]["notif_canal"]
          created_at?: string | null
          cuerpo?: string
          datos_extra?: Json | null
          estado_portal?: Database["public"]["Enums"]["notif_estado_portal"]
          estado_whatsapp?: Database["public"]["Enums"]["notif_estado_wa"]
          familia_id?: string | null
          fecha_programada?: string | null
          fecha_respuesta?: string | null
          id?: string
          prioridad?: Database["public"]["Enums"]["notif_prioridad"]
          representante_id?: string | null
          respuesta_padre?: string | null
          tipo?: Database["public"]["Enums"]["notif_tipo"]
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "notificaciones_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "notificaciones_caja_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "notificaciones_caja_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "representantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_caja_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["rep_id"]
          },
        ]
      }
      notification_trigger_logs: {
        Row: {
          context: string | null
          created_at: string | null
          error_message: string | null
          errors_count: number | null
          execution_time: string | null
          id: string
          maestros_processed: number | null
          notifications_created: number | null
          status: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          error_message?: string | null
          errors_count?: number | null
          execution_time?: string | null
          id?: string
          maestros_processed?: number | null
          notifications_created?: number | null
          status: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          error_message?: string | null
          errors_count?: number | null
          execution_time?: string | null
          id?: string
          maestros_processed?: number | null
          notifications_created?: number | null
          status?: string
        }
        Relationships: []
      }
      objetivos: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          node_id: string
          nombre: string
          order_index: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          node_id: string
          nombre: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          node_id?: string
          nombre?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objetivos_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetivos_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
        ]
      }
      observaciones_alumnos: {
        Row: {
          alumno_id: string
          clase_id: string | null
          created_at: string | null
          descripcion: string | null
          estado: string
          fecha: string | null
          fecha_observacion: string | null
          id: string
          maestro_id: string | null
          observacion: string
          prioridad: string
          requiere_seguimiento: boolean | null
          seguimiento_fecha: string | null
          seguimiento_observacion: string | null
          sesion_clase_id: string | null
          tipo: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          clase_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string
          fecha?: string | null
          fecha_observacion?: string | null
          id?: string
          maestro_id?: string | null
          observacion: string
          prioridad?: string
          requiere_seguimiento?: boolean | null
          seguimiento_fecha?: string | null
          seguimiento_observacion?: string | null
          sesion_clase_id?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          clase_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string
          fecha?: string | null
          fecha_observacion?: string | null
          id?: string
          maestro_id?: string | null
          observacion?: string
          prioridad?: string
          requiere_seguimiento?: boolean | null
          seguimiento_fecha?: string | null
          seguimiento_observacion?: string | null
          sesion_clase_id?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "fk_observaciones_alumnos_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      observaciones_sesion: {
        Row: {
          ai_fill_at: string | null
          contenido_ia_dsl: string | null
          contenido_parsed: Json | null
          contenido_raw: string
          created_at: string
          es_borrador: boolean
          first_note_at: string | null
          id: string
          last_note_at: string | null
          maestro_id: string
          sesion_id: string
          updated_at: string
        }
        Insert: {
          ai_fill_at?: string | null
          contenido_ia_dsl?: string | null
          contenido_parsed?: Json | null
          contenido_raw?: string
          created_at?: string
          es_borrador?: boolean
          first_note_at?: string | null
          id?: string
          last_note_at?: string | null
          maestro_id: string
          sesion_id: string
          updated_at?: string
        }
        Update: {
          ai_fill_at?: string | null
          contenido_ia_dsl?: string | null
          contenido_parsed?: Json | null
          contenido_raw?: string
          created_at?: string
          es_borrador?: boolean
          first_note_at?: string | null
          id?: string
          last_note_at?: string | null
          maestro_id?: string
          sesion_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "observaciones_sesion_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observaciones_sesion_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "observaciones_sesion_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observaciones_sesion_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "observaciones_sesion_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observaciones_sesion_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "observaciones_sesion_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      pagos: {
        Row: {
          cajero_id: string | null
          created_at: string | null
          cuota_ids: string[]
          familia_id: string
          fecha_pago: string | null
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"]
          monto_centavos: number
          notas: string | null
          recibo_url: string | null
          referencia: string | null
        }
        Insert: {
          cajero_id?: string | null
          created_at?: string | null
          cuota_ids?: string[]
          familia_id: string
          fecha_pago?: string | null
          id?: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"]
          monto_centavos: number
          notas?: string | null
          recibo_url?: string | null
          referencia?: string | null
        }
        Update: {
          cajero_id?: string | null
          created_at?: string | null
          cuota_ids?: string[]
          familia_id?: string
          fecha_pago?: string | null
          id?: string
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"]
          monto_centavos?: number
          notas?: string | null
          recibo_url?: string | null
          referencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "pagos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_alumnos: {
        Row: {
          alumno_id: string
          concepto: string
          created_at: string
          fecha_pago: string
          id: string
          metodo_pago: string
          monto: number
          periodo_mes: string
          referencia_transaccion: string | null
          registrado_por: string | null
        }
        Insert: {
          alumno_id: string
          concepto: string
          created_at?: string
          fecha_pago?: string
          id?: string
          metodo_pago: string
          monto: number
          periodo_mes: string
          referencia_transaccion?: string | null
          registrado_por?: string | null
        }
        Update: {
          alumno_id?: string
          concepto?: string
          created_at?: string
          fecha_pago?: string
          id?: string
          metodo_pago?: string
          monto?: number
          periodo_mes?: string
          referencia_transaccion?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "pagos_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      patrocinantes: {
        Row: {
          activo: boolean | null
          contacto: string | null
          created_at: string | null
          email: string | null
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["patrocinante_tipo"]
        }
        Insert: {
          activo?: boolean | null
          contacto?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["patrocinante_tipo"]
        }
        Update: {
          activo?: boolean | null
          contacto?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["patrocinante_tipo"]
        }
        Relationships: []
      }
      patrocinios: {
        Row: {
          activo: boolean | null
          alumno_id: string
          created_at: string | null
          cubre: Database["public"]["Enums"]["patrocinio_cubre"]
          familia_id: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          monto_mensual_centavos: number | null
          patrocinante_id: string
        }
        Insert: {
          activo?: boolean | null
          alumno_id: string
          created_at?: string | null
          cubre?: Database["public"]["Enums"]["patrocinio_cubre"]
          familia_id: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          monto_mensual_centavos?: number | null
          patrocinante_id: string
        }
        Update: {
          activo?: boolean | null
          alumno_id?: string
          created_at?: string | null
          cubre?: Database["public"]["Enums"]["patrocinio_cubre"]
          familia_id?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          monto_mensual_centavos?: number | null
          patrocinante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "patrocinios_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "patrocinios_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrocinios_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "patrocinios_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrocinios_patrocinante_id_fkey"
            columns: ["patrocinante_id"]
            isOneToOne: false
            referencedRelation: "patrocinantes"
            referencedColumns: ["id"]
          },
        ]
      }
      periodo_excepciones: {
        Row: {
          creado_por: string | null
          created_at: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          motivo: string
          periodo_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          creado_por?: string | null
          created_at?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          motivo: string
          periodo_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          creado_por?: string | null
          created_at?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          motivo?: string
          periodo_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodo_excepciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodo_excepciones_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodo_excepciones_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "vw_estadisticas_periodo"
            referencedColumns: ["periodo_id"]
          },
        ]
      }
      periodos: {
        Row: {
          activo: boolean
          cerrado: boolean
          cerrado_at: string | null
          cerrado_por: string | null
          created_at: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          nombre: string
          observaciones_cierre: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          cerrado?: boolean
          cerrado_at?: string | null
          cerrado_por?: string | null
          created_at?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          nombre: string
          observaciones_cierre?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          cerrado?: boolean
          cerrado_at?: string | null
          cerrado_por?: string | null
          created_at?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          nombre?: string
          observaciones_cierre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      periodos_cierre_auditoria: {
        Row: {
          cerrado_por: string | null
          created_at: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          observaciones: string | null
          periodo_id: string
          resumen: Json
          snapshot: Json
        }
        Insert: {
          cerrado_por?: string | null
          created_at?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          observaciones?: string | null
          periodo_id: string
          resumen?: Json
          snapshot: Json
        }
        Update: {
          cerrado_por?: string | null
          created_at?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          observaciones?: string | null
          periodo_id?: string
          resumen?: Json
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "periodos_cierre_auditoria_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodos_cierre_auditoria_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "vw_estadisticas_periodo"
            referencedColumns: ["periodo_id"]
          },
        ]
      }
      permisos_maestros: {
        Row: {
          actualizado_en: string | null
          concedido_por: string | null
          creado_en: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          maestro_id: string
          permisos: string[]
          puede_asistir: boolean | null
          puede_crear_clases: boolean | null
          puede_inscribir_clases: boolean | null
          puede_planificar: boolean | null
          puede_registrar_alumnos: boolean | null
          solicitudes: string[]
        }
        Insert: {
          actualizado_en?: string | null
          concedido_por?: string | null
          creado_en?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          maestro_id: string
          permisos?: string[]
          puede_asistir?: boolean | null
          puede_crear_clases?: boolean | null
          puede_inscribir_clases?: boolean | null
          puede_planificar?: boolean | null
          puede_registrar_alumnos?: boolean | null
          solicitudes?: string[]
        }
        Update: {
          actualizado_en?: string | null
          concedido_por?: string | null
          creado_en?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          maestro_id?: string
          permisos?: string[]
          puede_asistir?: boolean | null
          puede_crear_clases?: boolean | null
          puede_inscribir_clases?: boolean | null
          puede_planificar?: boolean | null
          puede_registrar_alumnos?: boolean | null
          solicitudes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "permisos_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permisos_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "permisos_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permisos_maestros_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: true
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      plan_clases: {
        Row: {
          activo: boolean | null
          clase_id: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          maestro_id: string | null
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          clase_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          maestro_id?: string | null
          nombre: string
        }
        Update: {
          activo?: boolean | null
          clase_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          maestro_id?: string | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_clases_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_clases_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "plan_clases_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_clases_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "plan_clases_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_clases_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      plan_indicadores: {
        Row: {
          descripcion: string
          es_requerido: boolean | null
          id: string
          objetivo_id: string | null
          orden_index: number | null
        }
        Insert: {
          descripcion: string
          es_requerido?: boolean | null
          id?: string
          objetivo_id?: string | null
          orden_index?: number | null
        }
        Update: {
          descripcion?: string
          es_requerido?: boolean | null
          id?: string
          objetivo_id?: string | null
          orden_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_indicadores_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "plan_objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_niveles: {
        Row: {
          clase_id: string | null
          id: string
          nombre: string
          numero_nivel: number
          objetivo_general: string | null
          orden_index: number | null
        }
        Insert: {
          clase_id?: string | null
          id?: string
          nombre: string
          numero_nivel: number
          objetivo_general?: string | null
          orden_index?: number | null
        }
        Update: {
          clase_id?: string | null
          id?: string
          nombre?: string
          numero_nivel?: number
          objetivo_general?: string | null
          orden_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_niveles_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "plan_clases"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_objetivos: {
        Row: {
          id: string
          nombre: string
          orden_index: number | null
          tema_id: string | null
        }
        Insert: {
          id?: string
          nombre: string
          orden_index?: number | null
          tema_id?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          orden_index?: number | null
          tema_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_objetivos_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "plan_temas"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_temas: {
        Row: {
          es_critico: boolean | null
          id: string
          nivel_id: string | null
          nombre: string
          orden_index: number | null
          tipo: string | null
        }
        Insert: {
          es_critico?: boolean | null
          id?: string
          nivel_id?: string | null
          nombre: string
          orden_index?: number | null
          tipo?: string | null
        }
        Update: {
          es_critico?: boolean | null
          id?: string
          nivel_id?: string | null
          nombre?: string
          orden_index?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_temas_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "plan_niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      planificacion: {
        Row: {
          activo: boolean | null
          contenidos: Json | null
          created_at: string | null
          escalas_arpegios: Json | null
          evaluaciones: Json | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          nivel: number
          obras: Json | null
          programa_id: string
          tecnicas: Json | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          contenidos?: Json | null
          created_at?: string | null
          escalas_arpegios?: Json | null
          evaluaciones?: Json | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          nivel: number
          obras?: Json | null
          programa_id: string
          tecnicas?: Json | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          contenidos?: Json | null
          created_at?: string | null
          escalas_arpegios?: Json | null
          evaluaciones?: Json | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          nivel?: number
          obras?: Json | null
          programa_id?: string
          tecnicas?: Json | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      planificacion_nodos: {
        Row: {
          bloque: number | null
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          estado: string | null
          id: string
          maestro_id: string
          nivel: number | null
          nombre: string | null
          padre_id: string | null
          ponderacion: number | null
          programa_id: string | null
        }
        Insert: {
          bloque?: number | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          maestro_id: string
          nivel?: number | null
          nombre?: string | null
          padre_id?: string | null
          ponderacion?: number | null
          programa_id?: string | null
        }
        Update: {
          bloque?: number | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          maestro_id?: string
          nivel?: number | null
          nombre?: string | null
          padre_id?: string | null
          ponderacion?: number | null
          programa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planificacion_nodos_padre_id_fkey"
            columns: ["padre_id"]
            isOneToOne: false
            referencedRelation: "planificacion_nodos"
            referencedColumns: ["id"]
          },
        ]
      }
      planificaciones: {
        Row: {
          activo: boolean | null
          clase_id: string
          contenidos: Json | null
          created_at: string | null
          descripcion: string | null
          escalas_arpegios: Json | null
          estado: string | null
          evaluaciones: Json | null
          fecha_fin: string | null
          fecha_inicio: string
          frecuencia_semanal: number | null
          id: string
          instrumento: string | null
          maestro_id: string
          nivel_id: string | null
          nivel_texto: string | null
          objetivos_estructurados: Json
          obras: Json | null
          periodo_nombre: string | null
          programa_id: string | null
          semanas_totales: number | null
          tecnicas: Json | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          clase_id: string
          contenidos?: Json | null
          created_at?: string | null
          descripcion?: string | null
          escalas_arpegios?: Json | null
          estado?: string | null
          evaluaciones?: Json | null
          fecha_fin?: string | null
          fecha_inicio: string
          frecuencia_semanal?: number | null
          id?: string
          instrumento?: string | null
          maestro_id: string
          nivel_id?: string | null
          nivel_texto?: string | null
          objetivos_estructurados?: Json
          obras?: Json | null
          periodo_nombre?: string | null
          programa_id?: string | null
          semanas_totales?: number | null
          tecnicas?: Json | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          clase_id?: string
          contenidos?: Json | null
          created_at?: string | null
          descripcion?: string | null
          escalas_arpegios?: Json | null
          estado?: string | null
          evaluaciones?: Json | null
          fecha_fin?: string | null
          fecha_inicio?: string
          frecuencia_semanal?: number | null
          id?: string
          instrumento?: string | null
          maestro_id?: string
          nivel_id?: string | null
          nivel_texto?: string | null
          objetivos_estructurados?: Json
          obras?: Json | null
          periodo_nombre?: string | null
          programa_id?: string | null
          semanas_totales?: number | null
          tecnicas?: Json | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_planificaciones_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_planificaciones_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_planificaciones_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_planificaciones_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_planificaciones_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_planificaciones_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_planificaciones_nivel"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_planificaciones_programa"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_content: {
        Row: {
          clase_id: string
          covered: boolean | null
          created_at: string | null
          id: string
          maestro_id: string
          node_id: string
          planned_date: string | null
          updated_at: string | null
        }
        Insert: {
          clase_id: string
          covered?: boolean | null
          created_at?: string | null
          id?: string
          maestro_id: string
          node_id: string
          planned_date?: string | null
          updated_at?: string | null
        }
        Update: {
          clase_id?: string
          covered?: boolean | null
          created_at?: string | null
          id?: string
          maestro_id?: string
          node_id?: string
          planned_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planned_content_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_content_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "planned_content_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_content_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "planned_content_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_content_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "planned_content_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_content_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
        ]
      }
      planning_documents: {
        Row: {
          clase_id: string | null
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          maestro_id: string
          title: string
        }
        Insert: {
          clase_id?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          maestro_id: string
          title: string
        }
        Update: {
          clase_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          maestro_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_documents_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_documents_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "planning_documents_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_documents_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "planning_documents_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_documents_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      plantillas_planificacion: {
        Row: {
          activo: boolean | null
          clase_id: string | null
          contenido: string | null
          created_at: string | null
          evaluacion_metodo: string | null
          id: string
          nombre: string
          objetivos: string | null
          recursos: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          clase_id?: string | null
          contenido?: string | null
          created_at?: string | null
          evaluacion_metodo?: string | null
          id?: string
          nombre: string
          objetivos?: string | null
          recursos?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          clase_id?: string | null
          contenido?: string | null
          created_at?: string | null
          evaluacion_metodo?: string | null
          id?: string
          nombre?: string
          objetivos?: string | null
          recursos?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plantillas_planificacion_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantillas_planificacion_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
        ]
      }
      portal_catalog: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          icono: string | null
          is_active: boolean | null
          nombre: string
          orden: number
          portal_id: string
          roles_default: string[] | null
          ruta: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          is_active?: boolean | null
          nombre: string
          orden?: number
          portal_id: string
          roles_default?: string[] | null
          ruta: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          is_active?: boolean | null
          nombre?: string
          orden?: number
          portal_id?: string
          roles_default?: string[] | null
          ruta?: string
          updated_at?: string
        }
        Relationships: []
      }
      postulantes: {
        Row: {
          acepta_pago_600: boolean
          alumno_id: string | null
          autoriza_fotos_redes: boolean
          copia_cedula: boolean
          correo: string | null
          created_at: string | null
          disponibilidad_tiempo: string | null
          estado: string
          fecha_cita: string | null
          fecha_contacto: string | null
          fecha_nacimiento: string | null
          fecha_postulacion: string | null
          id: string
          instrumento: string | null
          madre_nombre: string | null
          madre_tlf_whatsapp: string | null
          nacionalidad: string | null
          nombre_completo: string
          notas_seguimiento: string | null
          padre_nombre: string | null
          padre_tlf_whatsapp: string | null
          religion_limita: boolean
          representante_parentesco: string | null
          representantes_apoyan: boolean
          sector_calle_numero: string | null
          sincronizado_en: string | null
          telefono_alumno: string | null
          tiene_transporte: boolean
          updated_at: string | null
        }
        Insert: {
          acepta_pago_600?: boolean
          alumno_id?: string | null
          autoriza_fotos_redes?: boolean
          copia_cedula?: boolean
          correo?: string | null
          created_at?: string | null
          disponibilidad_tiempo?: string | null
          estado?: string
          fecha_cita?: string | null
          fecha_contacto?: string | null
          fecha_nacimiento?: string | null
          fecha_postulacion?: string | null
          id?: string
          instrumento?: string | null
          madre_nombre?: string | null
          madre_tlf_whatsapp?: string | null
          nacionalidad?: string | null
          nombre_completo: string
          notas_seguimiento?: string | null
          padre_nombre?: string | null
          padre_tlf_whatsapp?: string | null
          religion_limita?: boolean
          representante_parentesco?: string | null
          representantes_apoyan?: boolean
          sector_calle_numero?: string | null
          sincronizado_en?: string | null
          telefono_alumno?: string | null
          tiene_transporte?: boolean
          updated_at?: string | null
        }
        Update: {
          acepta_pago_600?: boolean
          alumno_id?: string | null
          autoriza_fotos_redes?: boolean
          copia_cedula?: boolean
          correo?: string | null
          created_at?: string | null
          disponibilidad_tiempo?: string | null
          estado?: string
          fecha_cita?: string | null
          fecha_contacto?: string | null
          fecha_nacimiento?: string | null
          fecha_postulacion?: string | null
          id?: string
          instrumento?: string | null
          madre_nombre?: string | null
          madre_tlf_whatsapp?: string | null
          nacionalidad?: string | null
          nombre_completo?: string
          notas_seguimiento?: string | null
          padre_nombre?: string | null
          padre_tlf_whatsapp?: string | null
          religion_limita?: boolean
          representante_parentesco?: string | null
          representantes_apoyan?: boolean
          sector_calle_numero?: string | null
          sincronizado_en?: string | null
          telefono_alumno?: string | null
          tiene_transporte?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "postulantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string
          estado: string
          id: string
          nombre_completo: string | null
          rol: string
          solicitud_instrumento: string | null
          solicitud_resena: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          estado?: string
          id: string
          nombre_completo?: string | null
          rol?: string
          solicitud_instrumento?: string | null
          solicitud_resena?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          estado?: string
          id?: string
          nombre_completo?: string | null
          rol?: string
          solicitud_instrumento?: string | null
          solicitud_resena?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programas: {
        Row: {
          activo: boolean | null
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          duracion_anios: number | null
          id: string
          nivel: string | null
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          duracion_anios?: number | null
          id?: string
          nivel?: string | null
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          duracion_anios?: number | null
          id?: string
          nivel?: string | null
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      programas_prerrequisitos: {
        Row: {
          created_at: string
          id: string
          nota_minima: number | null
          notas: string | null
          prerequisito_id: string
          programa_id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          nota_minima?: number | null
          notas?: string | null
          prerequisito_id: string
          programa_id: string
          tipo?: string
        }
        Update: {
          created_at?: string
          id?: string
          nota_minima?: number | null
          notas?: string | null
          prerequisito_id?: string
          programa_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "programas_prerrequisitos_prerequisito_id_fkey"
            columns: ["prerequisito_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programas_prerrequisitos_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      progresos: {
        Row: {
          alumno_id: string
          asistencia_id: string | null
          calificacion: number | null
          clase_id: string
          contenido_dsl: string | null
          created_at: string | null
          ejercicio_id: string | null
          estado_cualitativo: string | null
          evaluacion_tipo: string | null
          fecha_evaluacion: string
          id: string
          indicadores: Json
          maestro_id: string | null
          objetivo_id: string | null
          observaciones: string | null
          periodo_id: string | null
          sesion_clase_id: string | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          asistencia_id?: string | null
          calificacion?: number | null
          clase_id: string
          contenido_dsl?: string | null
          created_at?: string | null
          ejercicio_id?: string | null
          estado_cualitativo?: string | null
          evaluacion_tipo?: string | null
          fecha_evaluacion?: string
          id?: string
          indicadores?: Json
          maestro_id?: string | null
          objetivo_id?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          sesion_clase_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          asistencia_id?: string | null
          calificacion?: number | null
          clase_id?: string
          contenido_dsl?: string | null
          created_at?: string | null
          ejercicio_id?: string | null
          estado_cualitativo?: string | null
          evaluacion_tipo?: string | null
          fecha_evaluacion?: string
          id?: string
          indicadores?: Json
          maestro_id?: string | null
          objetivo_id?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          sesion_clase_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_progresos_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_progresos_asistencia"
            columns: ["asistencia_id"]
            isOneToOne: false
            referencedRelation: "asistencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_progresos_ejercicio"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_progresos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_progresos_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_progresos_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "fk_progresos_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
          {
            foreignKeyName: "progresos_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "plan_objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresos_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresos_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "vw_estadisticas_periodo"
            referencedColumns: ["periodo_id"]
          },
        ]
      }
      prospeccion_log: {
        Row: {
          created_at: string
          ejecutado_por: string | null
          error: string | null
          estado: string
          id: string
          industria: string | null
          resultados_encontrados: number
          resultados_procesados: number
          termino_busqueda: string
          ubicacion: string | null
        }
        Insert: {
          created_at?: string
          ejecutado_por?: string | null
          error?: string | null
          estado?: string
          id?: string
          industria?: string | null
          resultados_encontrados?: number
          resultados_procesados?: number
          termino_busqueda: string
          ubicacion?: string | null
        }
        Update: {
          created_at?: string
          ejecutado_por?: string | null
          error?: string | null
          estado?: string
          id?: string
          industria?: string | null
          resultados_encontrados?: number
          resultados_procesados?: number
          termino_busqueda?: string
          ubicacion?: string | null
        }
        Relationships: []
      }
      protocolos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          tareas: Json | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          tareas?: Json | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          tareas?: Json | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pulso_score_history: {
        Row: {
          asistencia_pct: number
          calculado_at: string
          cobertura_registro_pct: number
          id: string
          metricas_detalle: Json
          nivel: string
          penalizacion_vencidas_pct: number
          score: number
          tareas_tiempo_pct: number
        }
        Insert: {
          asistencia_pct?: number
          calculado_at?: string
          cobertura_registro_pct?: number
          id?: string
          metricas_detalle?: Json
          nivel: string
          penalizacion_vencidas_pct?: number
          score: number
          tareas_tiempo_pct?: number
        }
        Update: {
          asistencia_pct?: number
          calculado_at?: string
          cobertura_registro_pct?: number
          id?: string
          metricas_detalle?: Json
          nivel?: string
          penalizacion_vencidas_pct?: number
          score?: number
          tareas_tiempo_pct?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          activo: boolean | null
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          profile_id: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          activo?: boolean | null
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          profile_id: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          activo?: boolean | null
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          profile_id?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_push_subscriptions_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rachas: {
        Row: {
          alumno_id: string
          racha_actual: number | null
          racha_maxima: number | null
          ultima_fecha_activa: string | null
          updated_at: string | null
        }
        Insert: {
          alumno_id: string
          racha_actual?: number | null
          racha_maxima?: number | null
          ultima_fecha_activa?: string | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string
          racha_actual?: number | null
          racha_maxima?: number | null
          ultima_fecha_activa?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_rachas_alumno"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      registros_pendientes: {
        Row: {
          created_at: string | null
          deep_link: string | null
          estado: string | null
          fecha_limite: string | null
          id: string
          last_notified_at: string | null
          maestro_id: string
          mensaje: string
          notif_count: number | null
          notification_state: string | null
          prioridad: string | null
          resuelto_at: string | null
          sesion_clase_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deep_link?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          last_notified_at?: string | null
          maestro_id: string
          mensaje: string
          notif_count?: number | null
          notification_state?: string | null
          prioridad?: string | null
          resuelto_at?: string | null
          sesion_clase_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deep_link?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          last_notified_at?: string | null
          maestro_id?: string
          mensaje?: string
          notif_count?: number | null
          notification_state?: string | null
          prioridad?: string | null
          resuelto_at?: string | null
          sesion_clase_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_registros_pendientes_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_pendientes_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_registros_pendientes_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_pendientes_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_registros_pendientes_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registros_pendientes_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "fk_registros_pendientes_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      repertoire_fragments: {
        Row: {
          created_at: string | null
          end_measure: string | null
          id: string
          order_index: number
          repertoire_item_id: string
          start_measure: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          end_measure?: string | null
          id?: string
          order_index?: number
          repertoire_item_id: string
          start_measure?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          end_measure?: string | null
          id?: string
          order_index?: number
          repertoire_item_id?: string
          start_measure?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "repertoire_fragments_repertoire_item_id_fkey"
            columns: ["repertoire_item_id"]
            isOneToOne: false
            referencedRelation: "repertoire_items"
            referencedColumns: ["id"]
          },
        ]
      }
      repertoire_items: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_signature: string | null
          order_index: number
          section: string
          tempo_indication: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_signature?: string | null
          order_index?: number
          section: string
          tempo_indication?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_signature?: string | null
          order_index?: number
          section?: string
          tempo_indication?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "repertoire_items_section_fkey"
            columns: ["section"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      representantes: {
        Row: {
          activo: boolean
          alumno_id: string | null
          autoriza_accesorios_hasta: number | null
          cedula: string | null
          created_at: string | null
          email: string | null
          es_pagador: boolean | null
          familia_id: string
          id: string
          nombre: string
          relacion: string | null
          telefono_whatsapp: string | null
          user_id: string | null
        }
        Insert: {
          activo?: boolean
          alumno_id?: string | null
          autoriza_accesorios_hasta?: number | null
          cedula?: string | null
          created_at?: string | null
          email?: string | null
          es_pagador?: boolean | null
          familia_id: string
          id?: string
          nombre: string
          relacion?: string | null
          telefono_whatsapp?: string | null
          user_id?: string | null
        }
        Update: {
          activo?: boolean
          alumno_id?: string | null
          autoriza_accesorios_hasta?: number | null
          cedula?: string | null
          created_at?: string | null
          email?: string | null
          es_pagador?: boolean | null
          familia_id?: string
          id?: string
          nombre?: string
          relacion?: string | null
          telefono_whatsapp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "representantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "representantes_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representantes_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "representantes_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      retenciones_instrumento: {
        Row: {
          acta_firmada_en: string | null
          alumno_id: string
          created_at: string
          estado: string
          fecha_reincorporacion: string | null
          id: string
          instrumento_id: string | null
          instrumento_texto: string | null
          levantada_en: string | null
          levantada_por: string | null
          maestro_confirmo_recogida_en: string | null
          maestro_notificado_en: string | null
          motivo: string
          notas: string | null
          retenido_en: string
          retenido_por: string | null
          updated_at: string
        }
        Insert: {
          acta_firmada_en?: string | null
          alumno_id: string
          created_at?: string
          estado?: string
          fecha_reincorporacion?: string | null
          id?: string
          instrumento_id?: string | null
          instrumento_texto?: string | null
          levantada_en?: string | null
          levantada_por?: string | null
          maestro_confirmo_recogida_en?: string | null
          maestro_notificado_en?: string | null
          motivo?: string
          notas?: string | null
          retenido_en?: string
          retenido_por?: string | null
          updated_at?: string
        }
        Update: {
          acta_firmada_en?: string | null
          alumno_id?: string
          created_at?: string
          estado?: string
          fecha_reincorporacion?: string | null
          id?: string
          instrumento_id?: string | null
          instrumento_texto?: string | null
          levantada_en?: string | null
          levantada_por?: string | null
          maestro_confirmo_recogida_en?: string | null
          maestro_notificado_en?: string | null
          motivo?: string
          notas?: string | null
          retenido_en?: string
          retenido_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "retenciones_instrumento_instrumento_id_fkey"
            columns: ["instrumento_id"]
            isOneToOne: false
            referencedRelation: "instrumentos"
            referencedColumns: ["id"]
          },
        ]
      }
      route_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          published_at: string | null
          route_id: string
          status: Database["public"]["Enums"]["route_status"]
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          route_id: string
          status?: Database["public"]["Enums"]["route_status"]
          version: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          route_id?: string
          status?: Database["public"]["Enums"]["route_status"]
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_versions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          instrument: string
          name: string
          status: Database["public"]["Enums"]["route_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instrument: string
          name: string
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instrument?: string
          name?: string
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
        }
        Relationships: []
      }
      ruta_contenido_objetivos: {
        Row: {
          created_at: string | null
          descripcion: string
          id: string
          objetivo_id: string | null
          orden: number
          ruta_id: string
          semana_fin: number
          semana_inicio: number
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          id?: string
          objetivo_id?: string | null
          orden: number
          ruta_id: string
          semana_fin: number
          semana_inicio: number
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          id?: string
          objetivo_id?: string | null
          orden?: number
          ruta_id?: string
          semana_fin?: number
          semana_inicio?: number
        }
        Relationships: [
          {
            foreignKeyName: "ruta_contenido_objetivos_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "curriculo_objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ruta_contenido_objetivos_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas_contenido"
            referencedColumns: ["id"]
          },
        ]
      }
      rutas_contenido: {
        Row: {
          aprobada_por: string | null
          creada_por: string | null
          created_at: string | null
          descripcion: string | null
          duracion_semanas: number
          estado: string
          fecha_aprobacion: string | null
          id: string
          instrumento: string
          nivel: string
          nombre: string
          ruta_base_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          aprobada_por?: string | null
          creada_por?: string | null
          created_at?: string | null
          descripcion?: string | null
          duracion_semanas?: number
          estado: string
          fecha_aprobacion?: string | null
          id?: string
          instrumento: string
          nivel: string
          nombre: string
          ruta_base_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          aprobada_por?: string | null
          creada_por?: string | null
          created_at?: string | null
          descripcion?: string | null
          duracion_semanas?: number
          estado?: string
          fecha_aprobacion?: string | null
          id?: string
          instrumento?: string
          nivel?: string
          nombre?: string
          ruta_base_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rutas_contenido_aprobada_por_fkey"
            columns: ["aprobada_por"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_contenido_aprobada_por_fkey"
            columns: ["aprobada_por"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "rutas_contenido_aprobada_por_fkey"
            columns: ["aprobada_por"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_contenido_aprobada_por_fkey"
            columns: ["aprobada_por"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "rutas_contenido_creada_por_fkey"
            columns: ["creada_por"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_contenido_creada_por_fkey"
            columns: ["creada_por"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "rutas_contenido_creada_por_fkey"
            columns: ["creada_por"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_contenido_creada_por_fkey"
            columns: ["creada_por"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "rutas_contenido_ruta_base_id_fkey"
            columns: ["ruta_base_id"]
            isOneToOne: false
            referencedRelation: "rutas_contenido"
            referencedColumns: ["id"]
          },
        ]
      }
      salones: {
        Row: {
          activo: boolean | null
          capacidad: number | null
          codigo_salon: string | null
          condicion_fisica: string | null
          created_at: string | null
          descripcion: string | null
          equipamiento: Json | null
          id: string
          is_active: boolean | null
          nombre: string
          piso: number | null
          responsable_id: string | null
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          capacidad?: number | null
          codigo_salon?: string | null
          condicion_fisica?: string | null
          created_at?: string | null
          descripcion?: string | null
          equipamiento?: Json | null
          id?: string
          is_active?: boolean | null
          nombre: string
          piso?: number | null
          responsable_id?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          capacidad?: number | null
          codigo_salon?: string | null
          condicion_fisica?: string | null
          created_at?: string | null
          descripcion?: string | null
          equipamiento?: Json | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          piso?: number | null
          responsable_id?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salones_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salones_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "salones_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salones_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      schedule_run_feedback: {
        Row: {
          comentario: string
          created_at: string
          id: string
          run_id: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          comentario: string
          created_at?: string
          id?: string
          run_id: string
          tipo?: string
          usuario_id: string
        }
        Update: {
          comentario?: string
          created_at?: string
          id?: string
          run_id?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_run_feedback_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "schedule_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_runs: {
        Row: {
          applied_at: string | null
          config: Json | null
          created_at: string
          estado: string
          id: string
          metricas: Json | null
          periodo: string | null
          resultado: Json | null
        }
        Insert: {
          applied_at?: string | null
          config?: Json | null
          created_at?: string
          estado?: string
          id?: string
          metricas?: Json | null
          periodo?: string | null
          resultado?: Json | null
        }
        Update: {
          applied_at?: string | null
          config?: Json | null
          created_at?: string
          estado?: string
          id?: string
          metricas?: Json | null
          periodo?: string | null
          resultado?: Json | null
        }
        Relationships: []
      }
      score_compromiso: {
        Row: {
          calculado_en: string | null
          ciclo_anio: number
          ciclo_mes: number
          comportamiento_mora_pct: number | null
          consistencia_meses: number | null
          familia_id: string
          generosidad_pct: number | null
          id: string
          nivel: string
          puntualidad_pct: number | null
          representante_id: string
          score: number
          voluntad_pago_pct: number | null
        }
        Insert: {
          calculado_en?: string | null
          ciclo_anio: number
          ciclo_mes: number
          comportamiento_mora_pct?: number | null
          consistencia_meses?: number | null
          familia_id: string
          generosidad_pct?: number | null
          id?: string
          nivel: string
          puntualidad_pct?: number | null
          representante_id: string
          score: number
          voluntad_pago_pct?: number | null
        }
        Update: {
          calculado_en?: string | null
          ciclo_anio?: number
          ciclo_mes?: number
          comportamiento_mora_pct?: number | null
          consistencia_meses?: number | null
          familia_id?: string
          generosidad_pct?: number | null
          id?: string
          nivel?: string
          puntualidad_pct?: number | null
          representante_id?: string
          score?: number
          voluntad_pago_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "representantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["rep_id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string | null
          default_day: string
          family: string
          id: string
          is_active: boolean | null
          order_index: number
        }
        Insert: {
          created_at?: string | null
          default_day: string
          family: string
          id: string
          is_active?: boolean | null
          order_index?: number
        }
        Update: {
          created_at?: string | null
          default_day?: string
          family?: string
          id?: string
          is_active?: boolean | null
          order_index?: number
        }
        Relationships: []
      }
      seguimiento_ausencias_reinicio: {
        Row: {
          alumno_id: string
          creado_por: string | null
          created_at: string
          fecha_corte: string
          id: string
          motivo: string | null
        }
        Insert: {
          alumno_id: string
          creado_por?: string | null
          created_at?: string
          fecha_corte?: string
          id?: string
          motivo?: string | null
        }
        Update: {
          alumno_id?: string
          creado_por?: string | null
          created_at?: string
          fecha_corte?: string
          id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "seguimiento_ausencias_reinicio_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      seguimiento_reglas: {
        Row: {
          activo: boolean | null
          config: Json
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          nombre: string
          prioridad: number | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          prioridad?: number | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          config?: Json
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          prioridad?: number | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_account_observations: {
        Row: {
          amount_due_centavos: number | null
          balance_centavos: number | null
          created_at: string
          days_remaining: number | null
          due_date: string | null
          id: string
          last_error_code: string | null
          last_query_at: string | null
          last_status: string
          last_success_at: string | null
          observed_at: string
          service_account_id: string
        }
        Insert: {
          amount_due_centavos?: number | null
          balance_centavos?: number | null
          created_at?: string
          days_remaining?: number | null
          due_date?: string | null
          id?: string
          last_error_code?: string | null
          last_query_at?: string | null
          last_status?: string
          last_success_at?: string | null
          observed_at?: string
          service_account_id: string
        }
        Update: {
          amount_due_centavos?: number | null
          balance_centavos?: number | null
          created_at?: string
          days_remaining?: number | null
          due_date?: string | null
          id?: string
          last_error_code?: string | null
          last_query_at?: string | null
          last_status?: string
          last_success_at?: string | null
          observed_at?: string
          service_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_account_observations_service_account_id_fkey"
            columns: ["service_account_id"]
            isOneToOne: false
            referencedRelation: "service_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_accounts: {
        Row: {
          account_name: string
          activo: boolean
          connector_status: string
          created_at: string
          created_by: string | null
          currency_code: string
          essential: boolean
          id: string
          provider_key: string
          provider_name: string
          refresh_enabled: boolean
          service_type: string
        }
        Insert: {
          account_name: string
          activo?: boolean
          connector_status?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          essential?: boolean
          id?: string
          provider_key: string
          provider_name: string
          refresh_enabled?: boolean
          service_type: string
        }
        Update: {
          account_name?: string
          activo?: boolean
          connector_status?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          essential?: boolean
          id?: string
          provider_key?: string
          provider_name?: string
          refresh_enabled?: boolean
          service_type?: string
        }
        Relationships: []
      }
      sesion_bitacora: {
        Row: {
          clase_id: string
          clase_no_realizada: boolean
          created_at: string
          id: string
          incidencia_comportamiento: boolean
          incidencia_detalle: string | null
          maestro_id: string
          motivo_no_realizada: string | null
          sesion_id: string
          tareas_detalle: string | null
          tareas_enviadas: boolean
          texto_ia: string | null
          texto_libre: string
          updated_at: string
        }
        Insert: {
          clase_id: string
          clase_no_realizada?: boolean
          created_at?: string
          id?: string
          incidencia_comportamiento?: boolean
          incidencia_detalle?: string | null
          maestro_id: string
          motivo_no_realizada?: string | null
          sesion_id: string
          tareas_detalle?: string | null
          tareas_enviadas?: boolean
          texto_ia?: string | null
          texto_libre?: string
          updated_at?: string
        }
        Update: {
          clase_id?: string
          clase_no_realizada?: boolean
          created_at?: string
          id?: string
          incidencia_comportamiento?: boolean
          incidencia_detalle?: string | null
          maestro_id?: string
          motivo_no_realizada?: string | null
          sesion_id?: string
          tareas_detalle?: string | null
          tareas_enviadas?: boolean
          texto_ia?: string | null
          texto_libre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sesion_bitacora_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesion_bitacora_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "sesion_bitacora_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesion_bitacora_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "sesion_bitacora_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesion_bitacora_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "sesion_bitacora_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: true
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesion_bitacora_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: true
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "sesion_bitacora_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: true
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      sesiones_clase: {
        Row: {
          actividad: string | null
          asistencia: Json | null
          borrador: boolean | null
          cerrada_en: string | null
          clase_id: string | null
          contenido: string | null
          contenido_dsl: string | null
          contenidos_trabajados: Json | null
          created_at: string | null
          emergente_id: string | null
          es_codocencia: boolean | null
          estado: string
          fecha: string
          hora_fin: string | null
          hora_inicio: string | null
          horario_id: string | null
          id: string
          maestro_auxiliar_id: string | null
          maestro_id: string
          motivo: string | null
          node_codigo: string | null
          node_id: string | null
          node_origen: string | null
          observaciones_generales: string | null
          salon_id: string | null
          tema_principal: string | null
          updated_at: string | null
        }
        Insert: {
          actividad?: string | null
          asistencia?: Json | null
          borrador?: boolean | null
          cerrada_en?: string | null
          clase_id?: string | null
          contenido?: string | null
          contenido_dsl?: string | null
          contenidos_trabajados?: Json | null
          created_at?: string | null
          emergente_id?: string | null
          es_codocencia?: boolean | null
          estado?: string
          fecha: string
          hora_fin?: string | null
          hora_inicio?: string | null
          horario_id?: string | null
          id?: string
          maestro_auxiliar_id?: string | null
          maestro_id: string
          motivo?: string | null
          node_codigo?: string | null
          node_id?: string | null
          node_origen?: string | null
          observaciones_generales?: string | null
          salon_id?: string | null
          tema_principal?: string | null
          updated_at?: string | null
        }
        Update: {
          actividad?: string | null
          asistencia?: Json | null
          borrador?: boolean | null
          cerrada_en?: string | null
          clase_id?: string | null
          contenido?: string | null
          contenido_dsl?: string | null
          contenidos_trabajados?: Json | null
          created_at?: string | null
          emergente_id?: string | null
          es_codocencia?: boolean | null
          estado?: string
          fecha?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          horario_id?: string | null
          id?: string
          maestro_auxiliar_id?: string | null
          maestro_id?: string
          motivo?: string | null
          node_codigo?: string | null
          node_id?: string | null
          node_origen?: string | null
          observaciones_generales?: string | null
          salon_id?: string | null
          tema_principal?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sesiones_clase_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_horario"
            columns: ["horario_id"]
            isOneToOne: false
            referencedRelation: "horarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_salon"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesiones_clase_emergente_id_fkey"
            columns: ["emergente_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesiones_clase_emergente_id_fkey"
            columns: ["emergente_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "sesiones_clase_emergente_id_fkey"
            columns: ["emergente_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
          {
            foreignKeyName: "sesiones_clase_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesiones_clase_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "sesiones_clase_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesiones_clase_maestro_auxiliar_id_fkey"
            columns: ["maestro_auxiliar_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "sesiones_clase_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesiones_clase_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
        ]
      }
      signage_media: {
        Row: {
          activo: boolean
          contenido: Json | null
          created_at: string
          created_by: string | null
          credito: string | null
          duracion_seg: number | null
          id: string
          orden: number
          pantalla_id: string | null
          storage_path: string | null
          tipo: string
          titulo: string | null
          updated_at: string
          vigente_desde: string | null
          vigente_hasta: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          activo?: boolean
          contenido?: Json | null
          created_at?: string
          created_by?: string | null
          credito?: string | null
          duracion_seg?: number | null
          id?: string
          orden?: number
          pantalla_id?: string | null
          storage_path?: string | null
          tipo: string
          titulo?: string | null
          updated_at?: string
          vigente_desde?: string | null
          vigente_hasta?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          activo?: boolean
          contenido?: Json | null
          created_at?: string
          created_by?: string | null
          credito?: string | null
          duracion_seg?: number | null
          id?: string
          orden?: number
          pantalla_id?: string | null
          storage_path?: string | null
          tipo?: string
          titulo?: string | null
          updated_at?: string
          vigente_desde?: string | null
          vigente_hasta?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signage_media_pantalla_id_fkey"
            columns: ["pantalla_id"]
            isOneToOne: false
            referencedRelation: "signage_pantallas"
            referencedColumns: ["id"]
          },
        ]
      }
      signage_pantallas: {
        Row: {
          activo: boolean
          alto_px: number
          ancho_px: number
          created_at: string
          id: string
          institucion: string | null
          layout: Json
          logo_path: string | null
          menu_portales: string[]
          modo_nocturno: Json
          nombre: string
          orientacion: string
          siglas: string | null
          slug: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          alto_px?: number
          ancho_px?: number
          created_at?: string
          id?: string
          institucion?: string | null
          layout?: Json
          logo_path?: string | null
          menu_portales?: string[]
          modo_nocturno?: Json
          nombre: string
          orientacion?: string
          siglas?: string | null
          slug: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          alto_px?: number
          ancho_px?: number
          created_at?: string
          id?: string
          institucion?: string | null
          layout?: Json
          logo_path?: string | null
          menu_portales?: string[]
          modo_nocturno?: Json
          nombre?: string
          orientacion?: string
          siglas?: string | null
          slug?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sim_actores: {
        Row: {
          created_at: string | null
          estado_pago: Database["public"]["Enums"]["sim_estado_pago"]
          id: string
          instrumento: string | null
          metadata: Json | null
          nombre_ficticio: string
          run_id: string
          tipo: Database["public"]["Enums"]["sim_actor_tipo"]
        }
        Insert: {
          created_at?: string | null
          estado_pago?: Database["public"]["Enums"]["sim_estado_pago"]
          id?: string
          instrumento?: string | null
          metadata?: Json | null
          nombre_ficticio: string
          run_id: string
          tipo: Database["public"]["Enums"]["sim_actor_tipo"]
        }
        Update: {
          created_at?: string | null
          estado_pago?: Database["public"]["Enums"]["sim_estado_pago"]
          id?: string
          instrumento?: string | null
          metadata?: Json | null
          nombre_ficticio?: string
          run_id?: string
          tipo?: Database["public"]["Enums"]["sim_actor_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "sim_actores_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sim_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_calendario: {
        Row: {
          categoria: Database["public"]["Enums"]["event_categoria"]
          created_at: string | null
          departamento_responsable: Database["public"]["Enums"]["soi_departamento"]
          descripcion: string | null
          estado: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          metadata: Json | null
          run_id: string
          titulo: string
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["event_categoria"]
          created_at?: string | null
          departamento_responsable?: Database["public"]["Enums"]["soi_departamento"]
          descripcion?: string | null
          estado?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          metadata?: Json | null
          run_id: string
          titulo: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["event_categoria"]
          created_at?: string | null
          departamento_responsable?: Database["public"]["Enums"]["soi_departamento"]
          descripcion?: string | null
          estado?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          metadata?: Json | null
          run_id?: string
          titulo?: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sim_calendario_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sim_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_config: {
        Row: {
          activo: boolean | null
          canal: Database["public"]["Enums"]["sim_canal"]
          created_at: string | null
          destino: string
          id: string
          proveedor_llm: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          canal: Database["public"]["Enums"]["sim_canal"]
          created_at?: string | null
          destino: string
          id?: string
          proveedor_llm?: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          canal?: Database["public"]["Enums"]["sim_canal"]
          created_at?: string | null
          destino?: string
          id?: string
          proveedor_llm?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sim_log: {
        Row: {
          accion: string
          agente: string
          created_at: string | null
          departamento: Database["public"]["Enums"]["soi_departamento"]
          evento_id: string | null
          fecha_simulada: string
          id: string
          payload: Json | null
          run_id: string
        }
        Insert: {
          accion: string
          agente: string
          created_at?: string | null
          departamento: Database["public"]["Enums"]["soi_departamento"]
          evento_id?: string | null
          fecha_simulada: string
          id?: string
          payload?: Json | null
          run_id: string
        }
        Update: {
          accion?: string
          agente?: string
          created_at?: string | null
          departamento?: Database["public"]["Enums"]["soi_departamento"]
          evento_id?: string | null
          fecha_simulada?: string
          id?: string
          payload?: Json | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sim_log_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "sim_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sim_log_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sim_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_outbox: {
        Row: {
          asunto: string | null
          canal: Database["public"]["Enums"]["sim_canal"]
          created_at: string | null
          destinatario_original: string
          destinatario_redirigido: string
          error_msg: string | null
          estado: Database["public"]["Enums"]["sim_outbox_estado"]
          id: string
          mensaje: string
          procesado_at: string | null
          run_id: string
        }
        Insert: {
          asunto?: string | null
          canal: Database["public"]["Enums"]["sim_canal"]
          created_at?: string | null
          destinatario_original: string
          destinatario_redirigido: string
          error_msg?: string | null
          estado?: Database["public"]["Enums"]["sim_outbox_estado"]
          id?: string
          mensaje: string
          procesado_at?: string | null
          run_id: string
        }
        Update: {
          asunto?: string | null
          canal?: Database["public"]["Enums"]["sim_canal"]
          created_at?: string | null
          destinatario_original?: string
          destinatario_redirigido?: string
          error_msg?: string | null
          estado?: Database["public"]["Enums"]["sim_outbox_estado"]
          id?: string
          mensaje?: string
          procesado_at?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sim_outbox_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sim_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_runs: {
        Row: {
          creado_por: string | null
          created_at: string | null
          estado: Database["public"]["Enums"]["sim_run_estado"]
          fecha_actual_virtual: string | null
          fecha_fin_virtual: string | null
          fecha_inicio_virtual: string
          id: string
          metadata: Json | null
          nombre: string
          updated_at: string | null
          velocidad: number
        }
        Insert: {
          creado_por?: string | null
          created_at?: string | null
          estado?: Database["public"]["Enums"]["sim_run_estado"]
          fecha_actual_virtual?: string | null
          fecha_fin_virtual?: string | null
          fecha_inicio_virtual: string
          id?: string
          metadata?: Json | null
          nombre?: string
          updated_at?: string | null
          velocidad?: number
        }
        Update: {
          creado_por?: string | null
          created_at?: string | null
          estado?: Database["public"]["Enums"]["sim_run_estado"]
          fecha_actual_virtual?: string | null
          fecha_fin_virtual?: string | null
          fecha_inicio_virtual?: string
          id?: string
          metadata?: Json | null
          nombre?: string
          updated_at?: string | null
          velocidad?: number
        }
        Relationships: []
      }
      sim_tareas: {
        Row: {
          asignado_a: string | null
          checklist: Json | null
          created_at: string | null
          departamento: Database["public"]["Enums"]["soi_departamento"]
          descripcion: string | null
          estado: Database["public"]["Enums"]["tarea_institucional_estado"]
          event_id: string | null
          fecha_vencimiento: string | null
          feedback: string | null
          id: string
          prioridad: Database["public"]["Enums"]["tarea_institucional_prioridad"]
          run_id: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          asignado_a?: string | null
          checklist?: Json | null
          created_at?: string | null
          departamento?: Database["public"]["Enums"]["soi_departamento"]
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["tarea_institucional_estado"]
          event_id?: string | null
          fecha_vencimiento?: string | null
          feedback?: string | null
          id?: string
          prioridad?: Database["public"]["Enums"]["tarea_institucional_prioridad"]
          run_id: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          asignado_a?: string | null
          checklist?: Json | null
          created_at?: string | null
          departamento?: Database["public"]["Enums"]["soi_departamento"]
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["tarea_institucional_estado"]
          event_id?: string | null
          fecha_vencimiento?: string | null
          feedback?: string | null
          id?: string
          prioridad?: Database["public"]["Enums"]["tarea_institucional_prioridad"]
          run_id?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sim_tareas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "sim_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sim_tareas_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sim_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      soi_analisis_semanal: {
        Row: {
          created_at: string
          id: string
          modelo_usado: string | null
          patrones: Json
          periodo_fin: string
          periodo_inicio: string
          recomendaciones: Json
          resumen_ejecutivo: string
          score_promedio: number | null
          tendencias: Json
          total_eventos_analizados: number
        }
        Insert: {
          created_at?: string
          id?: string
          modelo_usado?: string | null
          patrones?: Json
          periodo_fin: string
          periodo_inicio: string
          recomendaciones?: Json
          resumen_ejecutivo: string
          score_promedio?: number | null
          tendencias?: Json
          total_eventos_analizados?: number
        }
        Update: {
          created_at?: string
          id?: string
          modelo_usado?: string | null
          patrones?: Json
          periodo_fin?: string
          periodo_inicio?: string
          recomendaciones?: Json
          resumen_ejecutivo?: string
          score_promedio?: number | null
          tendencias?: Json
          total_eventos_analizados?: number
        }
        Relationships: []
      }
      soi_event_bus: {
        Row: {
          created_at: string | null
          id: string
          origen: string
          payload: Json
          procesado: boolean | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          origen: string
          payload: Json
          procesado?: boolean | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          origen?: string
          payload?: Json
          procesado?: boolean | null
          tipo?: string
        }
        Relationships: []
      }
      soi_eventos: {
        Row: {
          actor_id: string | null
          correlation_id: string | null
          created_at: string
          entidad_id: string | null
          entidad_tipo: string
          id: string
          payload: Json
          procesado: boolean
          tipo: string
        }
        Insert: {
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          entidad_id?: string | null
          entidad_tipo: string
          id?: string
          payload?: Json
          procesado?: boolean
          tipo: string
        }
        Update: {
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          entidad_id?: string | null
          entidad_tipo?: string
          id?: string
          payload?: Json
          procesado?: boolean
          tipo?: string
        }
        Relationships: []
      }
      soi_process_contracts: {
        Row: {
          active: boolean
          automation_status: string
          canonical_doc_path: string
          closure_criteria: Json
          created_at: string
          department_owner: string
          doc_id: string | null
          metadata: Json
          process_code: string
          process_name: string
          recurrence_count: number
          required_evidence: Json
          responsible_departments: string[]
          task_templates: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          automation_status?: string
          canonical_doc_path: string
          closure_criteria?: Json
          created_at?: string
          department_owner: string
          doc_id?: string | null
          metadata?: Json
          process_code: string
          process_name: string
          recurrence_count?: number
          required_evidence?: Json
          responsible_departments?: string[]
          task_templates?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          automation_status?: string
          canonical_doc_path?: string
          closure_criteria?: Json
          created_at?: string
          department_owner?: string
          doc_id?: string | null
          metadata?: Json
          process_code?: string
          process_name?: string
          recurrence_count?: number
          required_evidence?: Json
          responsible_departments?: string[]
          task_templates?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      soi_rule_effectiveness: {
        Row: {
          casos_resueltos: number
          nombre: string
          rule_type: string
          tasa_exito: number
          tiempo_promedio_horas: number | null
          total_activaciones: number
          ultima_activacion: string | null
          updated_at: string
        }
        Insert: {
          casos_resueltos?: number
          nombre: string
          rule_type: string
          tasa_exito?: number
          tiempo_promedio_horas?: number | null
          total_activaciones?: number
          ultima_activacion?: string | null
          updated_at?: string
        }
        Update: {
          casos_resueltos?: number
          nombre?: string
          rule_type?: string
          tasa_exito?: number
          tiempo_promedio_horas?: number | null
          total_activaciones?: number
          ultima_activacion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      solicitudes_ausencia: {
        Row: {
          contenido_reemplazo: string | null
          created_at: string | null
          dinamica_trabajo: string | null
          estado: string | null
          fecha_ausencia: string
          id: string
          maestro_id: string
          motivo: string | null
          suplente_id: string | null
        }
        Insert: {
          contenido_reemplazo?: string | null
          created_at?: string | null
          dinamica_trabajo?: string | null
          estado?: string | null
          fecha_ausencia: string
          id?: string
          maestro_id: string
          motivo?: string | null
          suplente_id?: string | null
        }
        Update: {
          contenido_reemplazo?: string | null
          created_at?: string | null
          dinamica_trabajo?: string | null
          estado?: string | null
          fecha_ausencia?: string
          id?: string
          maestro_id?: string
          motivo?: string | null
          suplente_id?: string | null
        }
        Relationships: []
      }
      solicitudes_necesidades: {
        Row: {
          area: string | null
          cantidad: number | null
          categoria: string | null
          correlation_id: string | null
          costo_estimado: number | null
          created_at: string | null
          departamento_actual: string | null
          descripcion: string
          estado: string
          fecha_solicitud: string | null
          id: string
          link_tienda: string | null
          maestro_id: string
          maestro_nombre: string | null
          observaciones: string | null
          pre_aprobada_por: string | null
          presupuestado_por: string | null
          presupuesto: number | null
          prioridad: string
          respuesta_admin: string | null
          tipo_necesidad: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          cantidad?: number | null
          categoria?: string | null
          correlation_id?: string | null
          costo_estimado?: number | null
          created_at?: string | null
          departamento_actual?: string | null
          descripcion: string
          estado?: string
          fecha_solicitud?: string | null
          id?: string
          link_tienda?: string | null
          maestro_id: string
          maestro_nombre?: string | null
          observaciones?: string | null
          pre_aprobada_por?: string | null
          presupuestado_por?: string | null
          presupuesto?: number | null
          prioridad?: string
          respuesta_admin?: string | null
          tipo_necesidad: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          cantidad?: number | null
          categoria?: string | null
          correlation_id?: string | null
          costo_estimado?: number | null
          created_at?: string | null
          departamento_actual?: string | null
          descripcion?: string
          estado?: string
          fecha_solicitud?: string | null
          id?: string
          link_tienda?: string | null
          maestro_id?: string
          maestro_nombre?: string | null
          observaciones?: string | null
          pre_aprobada_por?: string | null
          presupuestado_por?: string | null
          presupuesto?: number | null
          prioridad?: string
          respuesta_admin?: string | null
          tipo_necesidad?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      solicitudes_permisos: {
        Row: {
          aprobado_en: string | null
          aprobado_por: string | null
          creado_en: string | null
          estado: string | null
          id: string
          maestro_id: string
          motivo_rechazo: string | null
          solicita_alumnos: boolean | null
          solicita_clases: boolean | null
          tipos: Json
        }
        Insert: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          creado_en?: string | null
          estado?: string | null
          id?: string
          maestro_id: string
          motivo_rechazo?: string | null
          solicita_alumnos?: boolean | null
          solicita_clases?: boolean | null
          tipos: Json
        }
        Update: {
          aprobado_en?: string | null
          aprobado_por?: string | null
          creado_en?: string | null
          estado?: string | null
          id?: string
          maestro_id?: string
          motivo_rechazo?: string | null
          solicita_alumnos?: boolean | null
          solicita_clases?: boolean | null
          tipos?: Json
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_permisos_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_permisos_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "solicitudes_permisos_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_permisos_maestro_id_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      student_case_actions: {
        Row: {
          alumno_id: string | null
          case_id: string
          created_at: string | null
          descripcion: string | null
          documento_id: string | null
          fecha_accion: string | null
          id: string
          proxima_accion: string | null
          proxima_accion_fecha: string | null
          registrado_por: string | null
          resultado: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          alumno_id?: string | null
          case_id: string
          created_at?: string | null
          descripcion?: string | null
          documento_id?: string | null
          fecha_accion?: string | null
          id?: string
          proxima_accion?: string | null
          proxima_accion_fecha?: string | null
          registrado_por?: string | null
          resultado?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          alumno_id?: string | null
          case_id?: string
          created_at?: string | null
          descripcion?: string | null
          documento_id?: string | null
          fecha_accion?: string | null
          id?: string
          proxima_accion?: string | null
          proxima_accion_fecha?: string | null
          registrado_por?: string | null
          resultado?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_actions_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "student_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      student_case_alerts: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          case_id: string | null
          created_at: string | null
          descripcion: string | null
          detectada_en: string | null
          estado: string
          evidencia: Json | null
          id: string
          nivel_riesgo: string
          revisada_en: string | null
          revisada_por: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          case_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          detectada_en?: string | null
          estado?: string
          evidencia?: Json | null
          id?: string
          nivel_riesgo: string
          revisada_en?: string | null
          revisada_por?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          case_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          detectada_en?: string | null
          estado?: string
          evidencia?: Json | null
          id?: string
          nivel_riesgo?: string
          revisada_en?: string | null
          revisada_por?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_alerts_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_case_alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "student_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      student_case_events: {
        Row: {
          actor_id: string | null
          case_id: string
          created_at: string | null
          descripcion: string | null
          id: string
          metadata: Json | null
          tipo: string
          titulo: string
        }
        Insert: {
          actor_id?: string | null
          case_id: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          metadata?: Json | null
          tipo: string
          titulo: string
        }
        Update: {
          actor_id?: string | null
          case_id?: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "student_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      student_cases: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          estado: string
          fecha_apertura: string | null
          fecha_cierre: string | null
          id: string
          nivel_riesgo: string
          origen: string
          proxima_accion: string | null
          proxima_accion_fecha: string | null
          responsable_id: string | null
          resumen_actual: string | null
          tipo: string
          titulo: string
          ultimo_contacto_en: string | null
          updated_at: string | null
        }
        Insert: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          nivel_riesgo?: string
          origen?: string
          proxima_accion?: string | null
          proxima_accion_fecha?: string | null
          responsable_id?: string | null
          resumen_actual?: string | null
          tipo: string
          titulo: string
          ultimo_contacto_en?: string | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          nivel_riesgo?: string
          origen?: string
          proxima_accion?: string | null
          proxima_accion_fecha?: string | null
          responsable_id?: string | null
          resumen_actual?: string | null
          tipo?: string
          titulo?: string
          ultimo_contacto_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_cases_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      student_indicator_progress: {
        Row: {
          created_at: string
          evidence_id: string | null
          id: string
          indicator_id: string
          observation: string | null
          score: number | null
          session_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evidence_id?: string | null
          id?: string
          indicator_id: string
          observation?: string | null
          score?: number | null
          session_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evidence_id?: string | null
          id?: string
          indicator_id?: string
          observation?: string | null
          score?: number | null
          session_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_indicator_progress_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_indicator_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "student_indicator_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      system_config: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      tarea_comentarios: {
        Row: {
          autor_id: string | null
          autor_nombre: string | null
          created_at: string
          cuerpo: string
          id: string
          tarea_id: string
        }
        Insert: {
          autor_id?: string | null
          autor_nombre?: string | null
          created_at?: string
          cuerpo: string
          id?: string
          tarea_id: string
        }
        Update: {
          autor_id?: string | null
          autor_nombre?: string | null
          created_at?: string
          cuerpo?: string
          id?: string
          tarea_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarea_comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas_institucionales"
            referencedColumns: ["id"]
          },
        ]
      }
      tarea_historial: {
        Row: {
          actor_departamento: string | null
          actor_id: string | null
          actor_nombre: string | null
          actor_rol: string | null
          campo: string
          created_at: string
          id: string
          tarea_id: string
          valor_anterior: string | null
          valor_nuevo: string | null
        }
        Insert: {
          actor_departamento?: string | null
          actor_id?: string | null
          actor_nombre?: string | null
          actor_rol?: string | null
          campo: string
          created_at?: string
          id?: string
          tarea_id: string
          valor_anterior?: string | null
          valor_nuevo?: string | null
        }
        Update: {
          actor_departamento?: string | null
          actor_id?: string | null
          actor_nombre?: string | null
          actor_rol?: string | null
          campo?: string
          created_at?: string
          id?: string
          tarea_id?: string
          valor_anterior?: string | null
          valor_nuevo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarea_historial_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas_institucionales"
            referencedColumns: ["id"]
          },
        ]
      }
      tarea_logs: {
        Row: {
          cambios: Json | null
          changed_by: string
          created_at: string | null
          evento: string
          id: string
          tarea_id: string
        }
        Insert: {
          cambios?: Json | null
          changed_by: string
          created_at?: string | null
          evento: string
          id?: string
          tarea_id: string
        }
        Update: {
          cambios?: Json | null
          changed_by?: string
          created_at?: string | null
          evento?: string
          id?: string
          tarea_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarea_logs_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas_calendario"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas_caja: {
        Row: {
          alumno_id: string | null
          asignado_a: string | null
          created_at: string | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["tarea_estado"]
          familia_id: string | null
          fecha_vencimiento: string | null
          id: string
          patron_recurrencia: Json | null
          prioridad: Database["public"]["Enums"]["tarea_prioridad"]
          recurrente: boolean | null
          referencia_id: string | null
          tipo: Database["public"]["Enums"]["tarea_tipo"]
          titulo: string
          updated_at: string | null
        }
        Insert: {
          alumno_id?: string | null
          asignado_a?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["tarea_estado"]
          familia_id?: string | null
          fecha_vencimiento?: string | null
          id?: string
          patron_recurrencia?: Json | null
          prioridad?: Database["public"]["Enums"]["tarea_prioridad"]
          recurrente?: boolean | null
          referencia_id?: string | null
          tipo?: Database["public"]["Enums"]["tarea_tipo"]
          titulo: string
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string | null
          asignado_a?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["tarea_estado"]
          familia_id?: string | null
          fecha_vencimiento?: string | null
          id?: string
          patron_recurrencia?: Json | null
          prioridad?: Database["public"]["Enums"]["tarea_prioridad"]
          recurrente?: boolean | null
          referencia_id?: string | null
          tipo?: Database["public"]["Enums"]["tarea_tipo"]
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "tareas_caja_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "tareas_caja_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_caja_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "tareas_caja_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas_calendario: {
        Row: {
          asignado_a: string | null
          created_at: string | null
          departamento_id: string
          descripcion: string | null
          estado: string | null
          evento_id: string
          fecha_vencimiento: string
          generada_por: string | null
          id: string
          prioridad: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          asignado_a?: string | null
          created_at?: string | null
          departamento_id: string
          descripcion?: string | null
          estado?: string | null
          evento_id: string
          fecha_vencimiento: string
          generada_por?: string | null
          id?: string
          prioridad?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          asignado_a?: string | null
          created_at?: string | null
          departamento_id?: string
          descripcion?: string | null
          estado?: string | null
          evento_id?: string
          fecha_vencimiento?: string
          generada_por?: string | null
          id?: string
          prioridad?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_calendario_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_calendario_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "calendario"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas_institucionales: {
        Row: {
          asignado_a: string | null
          checklist: Json | null
          correlation_id: string
          created_at: string | null
          departamento: Database["public"]["Enums"]["soi_departamento"]
          depende_de_tarea_id: string | null
          dependencia_tarea_id: string | null
          descripcion: string | null
          documentos_adjuntos: Json | null
          entidad_id: string | null
          entidad_label: string | null
          entidad_tipo: string | null
          estado: Database["public"]["Enums"]["tarea_institucional_estado"]
          event_id: string | null
          fecha_vencimiento: string | null
          feedback: string | null
          id: string
          minuta_id: string | null
          prioridad: Database["public"]["Enums"]["tarea_institucional_prioridad"]
          process_code: string | null
          source_event_id: string | null
          t_minus_dias: number | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
          updated_by_nombre: string | null
        }
        Insert: {
          asignado_a?: string | null
          checklist?: Json | null
          correlation_id?: string
          created_at?: string | null
          departamento?: Database["public"]["Enums"]["soi_departamento"]
          depende_de_tarea_id?: string | null
          dependencia_tarea_id?: string | null
          descripcion?: string | null
          documentos_adjuntos?: Json | null
          entidad_id?: string | null
          entidad_label?: string | null
          entidad_tipo?: string | null
          estado?: Database["public"]["Enums"]["tarea_institucional_estado"]
          event_id?: string | null
          fecha_vencimiento?: string | null
          feedback?: string | null
          id?: string
          minuta_id?: string | null
          prioridad?: Database["public"]["Enums"]["tarea_institucional_prioridad"]
          process_code?: string | null
          source_event_id?: string | null
          t_minus_dias?: number | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
          updated_by_nombre?: string | null
        }
        Update: {
          asignado_a?: string | null
          checklist?: Json | null
          correlation_id?: string
          created_at?: string | null
          departamento?: Database["public"]["Enums"]["soi_departamento"]
          depende_de_tarea_id?: string | null
          dependencia_tarea_id?: string | null
          descripcion?: string | null
          documentos_adjuntos?: Json | null
          entidad_id?: string | null
          entidad_label?: string | null
          entidad_tipo?: string | null
          estado?: Database["public"]["Enums"]["tarea_institucional_estado"]
          event_id?: string | null
          fecha_vencimiento?: string | null
          feedback?: string | null
          id?: string
          minuta_id?: string | null
          prioridad?: Database["public"]["Enums"]["tarea_institucional_prioridad"]
          process_code?: string | null
          source_event_id?: string | null
          t_minus_dias?: number | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
          updated_by_nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_institucionales_depende_de_tarea_id_fkey"
            columns: ["depende_de_tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas_institucionales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_institucionales_dependencia_tarea_id_fkey"
            columns: ["dependencia_tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas_institucionales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_institucionales_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendario_institucional"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_institucionales_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "signage_v_calendario_mes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_institucionales_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_institucionales_process_code_fkey"
            columns: ["process_code"]
            isOneToOne: false
            referencedRelation: "soi_process_contracts"
            referencedColumns: ["process_code"]
          },
          {
            foreignKeyName: "tareas_institucionales_source_event_id_fkey"
            columns: ["source_event_id"]
            isOneToOne: false
            referencedRelation: "soi_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas_portales: {
        Row: {
          categoria: string | null
          codigo: string | null
          contexto: Json | null
          departamento: string
          descripcion: string | null
          estado: string | null
          fecha_completacion: string | null
          fecha_creacion: string | null
          fecha_vencimiento: string
          feedback_accion_realizada: string | null
          feedback_causa_raiz: string | null
          feedback_fecha: string | null
          feedback_puntuacion: number | null
          feedback_texto: string | null
          generada_por: string | null
          id: string
          prioridad: string | null
          progreso_porcentaje: number | null
          protocolo_id: string | null
          responsable_email: string | null
          responsable_id: string | null
          responsable_nombre: string | null
          responsable_whatsapp: string | null
          tipo_tarea: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          codigo?: string | null
          contexto?: Json | null
          departamento: string
          descripcion?: string | null
          estado?: string | null
          fecha_completacion?: string | null
          fecha_creacion?: string | null
          fecha_vencimiento: string
          feedback_accion_realizada?: string | null
          feedback_causa_raiz?: string | null
          feedback_fecha?: string | null
          feedback_puntuacion?: number | null
          feedback_texto?: string | null
          generada_por?: string | null
          id?: string
          prioridad?: string | null
          progreso_porcentaje?: number | null
          protocolo_id?: string | null
          responsable_email?: string | null
          responsable_id?: string | null
          responsable_nombre?: string | null
          responsable_whatsapp?: string | null
          tipo_tarea?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          codigo?: string | null
          contexto?: Json | null
          departamento?: string
          descripcion?: string | null
          estado?: string | null
          fecha_completacion?: string | null
          fecha_creacion?: string | null
          fecha_vencimiento?: string
          feedback_accion_realizada?: string | null
          feedback_causa_raiz?: string | null
          feedback_fecha?: string | null
          feedback_puntuacion?: number | null
          feedback_texto?: string | null
          generada_por?: string | null
          id?: string
          prioridad?: string | null
          progreso_porcentaje?: number | null
          protocolo_id?: string | null
          responsable_email?: string | null
          responsable_id?: string | null
          responsable_nombre?: string | null
          responsable_whatsapp?: string | null
          tipo_tarea?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_class_sessions: {
        Row: {
          active_route_id: string | null
          class_date: string
          closed_at: string | null
          created_at: string
          general_observation: string | null
          group_id: string | null
          id: string
          planned_week_id: string | null
          status: string
          teacher_id: string | null
          week_number: number | null
        }
        Insert: {
          active_route_id?: string | null
          class_date?: string
          closed_at?: string | null
          created_at?: string
          general_observation?: string | null
          group_id?: string | null
          id?: string
          planned_week_id?: string | null
          status?: string
          teacher_id?: string | null
          week_number?: number | null
        }
        Update: {
          active_route_id?: string | null
          class_date?: string
          closed_at?: string | null
          created_at?: string
          general_observation?: string | null
          group_id?: string | null
          id?: string
          planned_week_id?: string | null
          status?: string
          teacher_id?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_class_sessions_active_route_id_fkey"
            columns: ["active_route_id"]
            isOneToOne: false
            referencedRelation: "acm_active_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "teacher_class_sessions_planned_week_id_fkey"
            columns: ["planned_week_id"]
            isOneToOne: false
            referencedRelation: "acm_weekly_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "teacher_class_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      teacher_session_indicators: {
        Row: {
          created_at: string
          id: string
          indicator_id: string | null
          next_action: string | null
          planned_objective: string | null
          planned_topic: string | null
          session_id: string
          teacher_notes: string | null
          worked_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          indicator_id?: string | null
          next_action?: string | null
          planned_objective?: string | null
          planned_topic?: string | null
          session_id: string
          teacher_notes?: string | null
          worked_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          indicator_id?: string | null
          next_action?: string | null
          planned_objective?: string | null
          planned_topic?: string | null
          session_id?: string
          teacher_notes?: string | null
          worked_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_session_indicators_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_session_indicators_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_allowed_users: {
        Row: {
          activo: boolean
          created_at: string
          created_by: string | null
          id: string
          nombre: string
          rol: string
          telegram_user_id: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nombre: string
          rol: string
          telegram_user_id: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nombre?: string
          rol?: string
          telegram_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "telegram_allowed_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_messages_raw: {
        Row: {
          created_at: string
          id: string
          message_type: string
          raw_payload: Json
          telegram_chat_id: number
          telegram_message_id: number
          telegram_user_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          message_type?: string
          raw_payload: Json
          telegram_chat_id: number
          telegram_message_id: number
          telegram_user_id: number
        }
        Update: {
          created_at?: string
          id?: string
          message_type?: string
          raw_payload?: Json
          telegram_chat_id?: number
          telegram_message_id?: number
          telegram_user_id?: number
        }
        Relationships: []
      }
      unidades: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          modulo_id: string
          nombre: string
          orden: number
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          modulo_id: string
          nombre: string
          orden: number
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          modulo_id?: string
          nombre?: string
          orden?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_unidades_modulo"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portal_access: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          portal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          portal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          portal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portal_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_portal_access_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portal_catalog"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "user_portal_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_departamentos: {
        Row: {
          created_at: string | null
          departamento_id: string
          id: string
          rol: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          departamento_id: string
          id?: string
          rol?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          departamento_id?: string
          id?: string
          rol?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_departamentos_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_config: {
        Row: {
          activo: boolean | null
          congelada_en: string | null
          devuelta_en: string | null
          familia_id: string
          id: string
          modo: Database["public"]["Enums"]["wallet_modo"]
          saldo_minimo_alerta_centavos: number | null
          status: Database["public"]["Enums"]["wallet_status"]
        }
        Insert: {
          activo?: boolean | null
          congelada_en?: string | null
          devuelta_en?: string | null
          familia_id: string
          id?: string
          modo?: Database["public"]["Enums"]["wallet_modo"]
          saldo_minimo_alerta_centavos?: number | null
          status?: Database["public"]["Enums"]["wallet_status"]
        }
        Update: {
          activo?: boolean | null
          congelada_en?: string | null
          devuelta_en?: string | null
          familia_id?: string
          id?: string
          modo?: Database["public"]["Enums"]["wallet_modo"]
          saldo_minimo_alerta_centavos?: number | null
          status?: Database["public"]["Enums"]["wallet_status"]
        }
        Relationships: [
          {
            foreignKeyName: "wallet_config_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: true
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_config_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: true
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "wallet_config_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: true
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_movimientos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          familia_id: string
          id: string
          monto_centavos: number
          origen: Database["public"]["Enums"]["wallet_origen"]
          referencia_id: string | null
          saldo_resultante_centavos: number
          tipo: Database["public"]["Enums"]["wallet_tipo"]
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          familia_id: string
          id?: string
          monto_centavos: number
          origen: Database["public"]["Enums"]["wallet_origen"]
          referencia_id?: string | null
          saldo_resultante_centavos: number
          tipo: Database["public"]["Enums"]["wallet_tipo"]
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          familia_id?: string
          id?: string
          monto_centavos?: number
          origen?: Database["public"]["Enums"]["wallet_origen"]
          referencia_id?: string | null
          saldo_resultante_centavos?: number
          tipo?: Database["public"]["Enums"]["wallet_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "wallet_movimientos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_movimientos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "wallet_movimientos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_consentimientos: {
        Row: {
          acepta_campania: boolean
          acepta_estadisticas: boolean
          campania_id: string | null
          created_at: string
          firmas_digitales: string | null
          id: string
          jid: string
          niño_edad: number | null
          niño_nombre: string | null
          nombre_representante: string | null
          representante_cedula: string | null
        }
        Insert: {
          acepta_campania?: boolean
          acepta_estadisticas?: boolean
          campania_id?: string | null
          created_at?: string
          firmas_digitales?: string | null
          id?: string
          jid: string
          niño_edad?: number | null
          niño_nombre?: string | null
          nombre_representante?: string | null
          representante_cedula?: string | null
        }
        Update: {
          acepta_campania?: boolean
          acepta_estadisticas?: boolean
          campania_id?: string | null
          created_at?: string
          firmas_digitales?: string | null
          id?: string
          jid?: string
          niño_edad?: number | null
          niño_nombre?: string | null
          nombre_representante?: string | null
          representante_cedula?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_consentimientos_campania_id_fkey"
            columns: ["campania_id"]
            isOneToOne: false
            referencedRelation: "campanias_periodo"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_optout: {
        Row: {
          created_at: string
          jid: string
          motivo: string | null
        }
        Insert: {
          created_at?: string
          jid: string
          motivo?: string | null
        }
        Update: {
          created_at?: string
          jid?: string
          motivo?: string | null
        }
        Relationships: []
      }
      whatsapp_webhook_log: {
        Row: {
          accion_pipeline: Json | null
          argumento: string | null
          confianza: number | null
          created_at: string | null
          estado_conversacion_nuevo: string | null
          id: string
          intencion_detectada: string | null
          jid_remitente: string
          mensaje_texto: string | null
          message_id: string
          postulante_id: string | null
          push_name: string | null
          respuesta_enviada: string | null
        }
        Insert: {
          accion_pipeline?: Json | null
          argumento?: string | null
          confianza?: number | null
          created_at?: string | null
          estado_conversacion_nuevo?: string | null
          id?: string
          intencion_detectada?: string | null
          jid_remitente: string
          mensaje_texto?: string | null
          message_id: string
          postulante_id?: string | null
          push_name?: string | null
          respuesta_enviada?: string | null
        }
        Update: {
          accion_pipeline?: Json | null
          argumento?: string | null
          confianza?: number | null
          created_at?: string | null
          estado_conversacion_nuevo?: string | null
          id?: string
          intencion_detectada?: string | null
          jid_remitente?: string
          mensaje_texto?: string | null
          message_id?: string
          postulante_id?: string | null
          push_name?: string | null
          respuesta_enviada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_webhook_log_postulante_id_fkey"
            columns: ["postulante_id"]
            isOneToOne: false
            referencedRelation: "postulantes"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_log: {
        Row: {
          alumno_id: string
          cantidad: number
          concepto: string
          created_at: string | null
          id: string
          referencia_id: string | null
          referencia_tipo: string | null
        }
        Insert: {
          alumno_id: string
          cantidad: number
          concepto: string
          created_at?: string | null
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
        }
        Update: {
          alumno_id?: string
          cantidad?: number
          concepto?: string
          created_at?: string | null
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_xp_log_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
    }
    Views: {
      alumno_clases: {
        Row: {
          activo: boolean | null
          alumno_id: string | null
          clase_id: string | null
          created_at: string | null
          fecha_inscripcion: string | null
          id: string | null
        }
        Insert: {
          activo?: boolean | null
          alumno_id?: string | null
          clase_id?: string | null
          created_at?: string | null
          fecha_inscripcion?: string | null
          id?: string | null
        }
        Update: {
          activo?: boolean | null
          alumno_id?: string | null
          clase_id?: string | null
          created_at?: string | null
          fecha_inscripcion?: string | null
          id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alumnos_clases_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
        ]
      }
      node_student_coverage: {
        Row: {
          attempt_count: number | null
          last_attempt_date: string | null
          node_id: string | null
          nombre_completo: string | null
          student_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicators_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicators_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "view_evaluaciones_pedagogicas"
            referencedColumns: ["node_id"]
          },
        ]
      }
      signage_v_calendario_mes: {
        Row: {
          categoria: string | null
          descripcion: string | null
          es_macro_evento: boolean | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string | null
          titulo: string | null
          ubicacion: string | null
        }
        Insert: {
          categoria?: never
          descripcion?: string | null
          es_macro_evento?: never
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string | null
          titulo?: string | null
          ubicacion?: string | null
        }
        Update: {
          categoria?: never
          descripcion?: string | null
          es_macro_evento?: never
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string | null
          titulo?: string | null
          ubicacion?: string | null
        }
        Relationships: []
      }
      signage_v_horario_hoy: {
        Row: {
          clase_id: string | null
          clase_nombre: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string | null
          instrumento: string | null
          maestro_nombre: string | null
          origen: string | null
          salon_nombre: string | null
        }
        Relationships: []
      }
      signage_v_horario_manana: {
        Row: {
          clase_id: string | null
          clase_nombre: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string | null
          instrumento: string | null
          maestro_nombre: string | null
          origen: string | null
          salon_nombre: string | null
        }
        Relationships: []
      }
      signage_v_horario_semana: {
        Row: {
          clase_id: string | null
          clase_nombre: string | null
          dia_iso: number | null
          dia_nombre: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string | null
          instrumento: string | null
          maestro_nombre: string | null
          salon_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clase_horarios_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_horarios_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
        ]
      }
      student_results: {
        Row: {
          assigned_group: string | null
          avg_danzon: number | null
          avg_escala: number | null
          avg_total: number | null
          eval_count: number | null
          id: string | null
          name: string | null
          section: string | null
        }
        Relationships: []
      }
      teacher_class_fill_metrics: {
        Row: {
          ai_fill_at: string | null
          asistencia_marked_at: string | null
          clase_id: string | null
          duracion_observaciones_segundos: number | null
          fecha: string | null
          hora_fin: string | null
          hora_inicio: string | null
          maestro_id: string | null
          minutos_entre_asistencia_observaciones: number | null
          momento_asistencia: string | null
          momento_observaciones: string | null
          observaciones_first_at: string | null
          observaciones_last_at: string | null
          orden_llenado: string | null
          sesion_id: string | null
          uso_ai_fill: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sesiones_clase_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      teacher_class_fill_metrics_aggregated: {
        Row: {
          fecha_ultima_clase: string | null
          incompleto_falta_ambos: number | null
          incompleto_falta_asistencia: number | null
          incompleto_falta_observaciones: number | null
          maestro_id: string | null
          maestro_nombre: string | null
          orden_asistencia_primero: number | null
          orden_observaciones_primero: number | null
          orden_simultaneo: number | null
          promedio_duracion_observaciones: number | null
          total_clases: number | null
          uso_ai_fill_percent: number | null
        }
        Relationships: []
      }
      v_semaforo_contenidos: {
        Row: {
          alumno_id: string | null
          bien_count: number | null
          clase_id: string | null
          mal_count: number | null
          objetivo_id: string | null
          regular_count: number | null
          semaforo: string | null
          total_registros: number | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_session_students_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "indicator_sessions_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_sessions_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "indicator_sessions_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "ruta_contenido_objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      view_evaluaciones_pedagogicas: {
        Row: {
          attempt_id: string | null
          clase_id: string | null
          clase_name: string | null
          covered_date: string | null
          created_at: string | null
          indicator_description: string | null
          indicator_id: string | null
          indicator_name: string | null
          level_id: string | null
          level_name: string | null
          level_number: number | null
          maestro_id: string | null
          maestro_name: string | null
          node_codigo: string | null
          node_id: string | null
          node_name: string | null
          nota: number | null
          observations: string | null
          result: string | null
          student_id: string | null
          student_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_attempts_covered_by_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_attempts_covered_by_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicator_attempts_created_by_fkey"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      view_node_difficulty: {
        Row: {
          failure_percentage: number | null
          node_name: string | null
          total_attempts: number | null
        }
        Relationships: []
      }
      vw_activos_ociosos: {
        Row: {
          activo_id: string | null
          alerta_tipo: string | null
          alumno_activo: boolean | null
          alumno_id: string | null
          alumno_nombre: string | null
          codigo_inventario: string | null
          comodato_id: string | null
          dias_hasta_vencimiento: number | null
          dias_prestado: number | null
          fecha_entrega: string | null
          fecha_vencimiento: string | null
          marca: string | null
          modelo: string | null
          tipo_instrumento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comodatos_activos_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "comodatos_activos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      vw_admin_enrollment_calendar: {
        Row: {
          applicant_id: string | null
          applicant_name: string | null
          applicant_status: string | null
          appointment_created_at: string | null
          appointment_id: string | null
          appointment_status: string | null
          email: string | null
          notes: string | null
          phone_number: string | null
          scheduled_datetime: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      vw_alertas_activas: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          color: string | null
          descripcion: string | null
          fecha_referencia: string | null
          instrumento_principal: string | null
          maestro_id: string | null
          maestro_nombre: string | null
          referencia_id: string | null
          tipo_alerta: string | null
          valor_numerico: number | null
        }
        Relationships: []
      }
      vw_alumno_estado_pago: {
        Row: {
          alumno_activo: boolean | null
          alumno_id: string | null
          alumno_nombre: string | null
          contacto_cedula: string | null
          contacto_email: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          cuotas_pendientes_count: number | null
          cuotas_vencidas_count: number | null
          estado_pago: string | null
          exento_mensualidad: boolean | null
          familia_id: string | null
          fecha_mas_antigua_vencida: string | null
          instrumento_principal: string | null
          nombre_familia: string | null
          saldo_pendiente_centavos: number | null
        }
        Relationships: []
      }
      vw_asistencias_clases_formato: {
        Row: {
          clase_id: string | null
          fecha: string | null
          resumen_formateado: string | null
          sesion_clase_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_asistencias_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_asistencias_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "sesiones_clase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics"
            referencedColumns: ["sesion_id"]
          },
          {
            foreignKeyName: "fk_asistencias_sesion"
            columns: ["sesion_clase_id"]
            isOneToOne: false
            referencedRelation: "vw_asistencias_consolidada"
            referencedColumns: ["sesion_clase_id"]
          },
        ]
      }
      vw_asistencias_consolidada: {
        Row: {
          asistencias_detalle: Json | null
          ausentes: number | null
          borrador: boolean | null
          clase_id: string | null
          fecha: string | null
          hora_fin: string | null
          hora_inicio: string | null
          justificaciones_detalle: Json | null
          justificados: number | null
          maestro_auxiliar: string | null
          maestro_principal: string | null
          nombre_clase: string | null
          observacion_clase: string | null
          observacion_sesion: string | null
          presentes: number | null
          salon_id: string | null
          sesion_clase_id: string | null
          total_registros: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sesiones_clase_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_clase"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_salon"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_clase_objetivo_estrellas: {
        Row: {
          alumnos_superadores: number | null
          clase_id: string | null
          estado_visual: string | null
          estrellas: number | null
          indicadores_evaluados: number | null
          objetivo_id: string | null
          pct_avance: number | null
          promedio_superadores: number | null
          total_indicadores: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clase_mapa_indicadores_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clase_mapa_indicadores_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "clase_mapa_indicadores_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "clase_mapa_objetivos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_comodatos_en_riesgo: {
        Row: {
          familia_id: string | null
          nivel: string | null
          nombre_familia: string | null
          rep_nombre: string | null
          representante_id: string | null
          score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "representantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["rep_id"]
          },
        ]
      }
      vw_cupos_iniciacion: {
        Row: {
          capacidad_maxima: number | null
          clase_id: string | null
          disponible: number | null
          nombre: string | null
          ocupacion: number | null
        }
        Insert: {
          capacidad_maxima?: number | null
          clase_id?: string | null
          disponible?: never
          nombre?: string | null
          ocupacion?: never
        }
        Update: {
          capacidad_maxima?: number | null
          clase_id?: string | null
          disponible?: never
          nombre?: string | null
          ocupacion?: never
        }
        Relationships: []
      }
      vw_destacados_y_riesgo_academico: {
        Row: {
          alertas_alta: number | null
          categoria: string | null
          etiqueta: string | null
          id: string | null
          instrumento_principal: string | null
          nivel: string | null
          nombre_completo: string | null
          promedio_calificacion: number | null
          tasa_asistencia: number | null
        }
        Relationships: []
      }
      vw_estadisticas_periodo: {
        Row: {
          activo: boolean | null
          alertas_alta_activas: number | null
          alumnos_activos: number | null
          alumnos_con_asistencia: number | null
          alumnos_evaluados: number | null
          fecha_fin: string | null
          fecha_inicio: string | null
          obs_abiertas: number | null
          obs_resueltas: number | null
          periodo_id: string | null
          periodo_nombre: string | null
          promedio_calificacion_periodo: number | null
          promedio_estrellas: number | null
          promedio_integrado: number | null
          tasa_asistencia_periodo: number | null
          total_evaluaciones: number | null
          total_evaluaciones_estrellas: number | null
          total_registros_asistencia: number | null
        }
        Insert: {
          activo?: boolean | null
          alertas_alta_activas?: never
          alumnos_activos?: never
          alumnos_con_asistencia?: never
          alumnos_evaluados?: never
          fecha_fin?: string | null
          fecha_inicio?: string | null
          obs_abiertas?: never
          obs_resueltas?: never
          periodo_id?: string | null
          periodo_nombre?: string | null
          promedio_calificacion_periodo?: never
          promedio_estrellas?: never
          promedio_integrado?: never
          tasa_asistencia_periodo?: never
          total_evaluaciones?: never
          total_evaluaciones_estrellas?: never
          total_registros_asistencia?: never
        }
        Update: {
          activo?: boolean | null
          alertas_alta_activas?: never
          alumnos_activos?: never
          alumnos_con_asistencia?: never
          alumnos_evaluados?: never
          fecha_fin?: string | null
          fecha_inicio?: string | null
          obs_abiertas?: never
          obs_resueltas?: never
          periodo_id?: string | null
          periodo_nombre?: string | null
          promedio_calificacion_periodo?: never
          promedio_estrellas?: never
          promedio_integrado?: never
          tasa_asistencia_periodo?: never
          total_evaluaciones?: never
          total_evaluaciones_estrellas?: never
          total_registros_asistencia?: never
        }
        Relationships: []
      }
      vw_estado_familiar: {
        Row: {
          activa: boolean | null
          cuotas_pendientes: number | null
          es_pagador: boolean | null
          id: string | null
          nivel: string | null
          nombre_familia: string | null
          rep_id: string | null
          rep_nombre: string | null
          saldo_pendiente_centavos: number | null
          saldo_wallet_centavos: number | null
          score: number | null
          telefono_whatsapp: string | null
        }
        Relationships: []
      }
      vw_evaluacion_indicador_global: {
        Row: {
          alumno_id: string | null
          clase_id: string | null
          clase_indicador_id: string | null
          created_at: string | null
          estado: string | null
          evaluado_por: string | null
          fecha_evaluacion: string | null
          id: string | null
          indicator_id: string | null
          indicator_id_global: string | null
          nota: number | null
          observaciones: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "vw_cupos_iniciacion"
            referencedColumns: ["clase_id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_clase_indicador_id_fkey"
            columns: ["clase_indicador_id"]
            isOneToOne: false
            referencedRelation: "clase_mapa_indicadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluacion_indicador_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_ia_alumnos: {
        Row: {
          id: string | null
          instrumento_principal: string | null
          nivel_actual: number | null
          nombre: string | null
        }
        Insert: {
          id?: string | null
          instrumento_principal?: string | null
          nivel_actual?: number | null
          nombre?: string | null
        }
        Update: {
          id?: string | null
          instrumento_principal?: string | null
          nivel_actual?: number | null
          nombre?: string | null
        }
        Relationships: []
      }
      vw_ia_asistencias_resumen: {
        Row: {
          alumno_id: string | null
          presentes: number | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_asistencias_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      vw_ia_inventario: {
        Row: {
          disponibles: number | null
          tipo_instrumento: string | null
          total: number | null
        }
        Relationships: []
      }
      vw_ia_maestros: {
        Row: {
          especialidad: string | null
          id: string | null
          nombre: string | null
        }
        Insert: {
          especialidad?: string | null
          id?: string | null
          nombre?: string | null
        }
        Update: {
          especialidad?: string | null
          id?: string | null
          nombre?: string | null
        }
        Relationships: []
      }
      vw_indice_ensenanza_guiada: {
        Row: {
          indice: number | null
          maestro_id: string | null
          sesiones_con_indicador: number | null
          total_sesiones: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "teacher_class_fill_metrics_aggregated"
            referencedColumns: ["maestro_id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_maestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sesiones_clase_maestro"
            columns: ["maestro_id"]
            isOneToOne: false
            referencedRelation: "vw_rendimiento_maestro"
            referencedColumns: ["maestro_id"]
          },
        ]
      }
      vw_ingresos_diarios: {
        Row: {
          cantidad_pagos: number | null
          metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
          primer_pago: string | null
          total_centavos: number | null
          ultimo_pago: string | null
        }
        Relationships: []
      }
      vw_instrumentos_disponibles: {
        Row: {
          codigo_inventario: string | null
          comodato_activo_id: string | null
          estado_conservacion: string | null
          foto_url: string | null
          id: string | null
          marca: string | null
          modelo: string | null
          tipo_instrumento: string | null
          ubicacion: string | null
        }
        Relationships: []
      }
      vw_kpi_inventario: {
        Row: {
          de_baja: number | null
          disponibles: number | null
          en_mantenimiento: number | null
          en_reparacion: number | null
          en_uso: number | null
          total_activos: number | null
          valor_total_inventario: number | null
        }
        Relationships: []
      }
      vw_mora_activa: {
        Row: {
          alumno_id: string | null
          concepto: string | null
          cuota_id: string | null
          dias_mora: number | null
          estado: Database["public"]["Enums"]["cuota_estado"] | null
          familia_id: string | null
          fecha_vencimiento: string | null
          nombre_familia: string | null
          rep_email: string | null
          rep_nombre: string | null
          saldo_centavos: number | null
          score_nivel: string | null
          telefono_whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "node_student_coverage"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "student_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_destacados_y_riesgo_academico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_ia_alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_prediccion_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_resumen_alumno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_riesgo_abandono"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "vw_seguimiento_ausentes"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "cuotas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "cuotas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_patron_asistencia: {
        Row: {
          ausencias: number | null
          dia_semana_nombre: string | null
          dia_semana_num: number | null
          instrumento_principal: string | null
          justificados: number | null
          pct_ausencias: number | null
          presencias: number | null
          total_registros: number | null
        }
        Relationships: []
      }
      vw_prediccion_abandono: {
        Row: {
          alumno_id: string | null
          asistencia_rate: number | null
          familia_id: string | null
          nivel_financiero: string | null
          nombre_completo: string | null
          nombre_familia: string | null
          progreso_rate: number | null
          riesgo_abandono: number | null
          score_financiero: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumnos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "alumnos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_rendimiento_maestro: {
        Row: {
          activo: boolean | null
          dias_promedio_resolucion: number | null
          especialidad: string | null
          maestro_id: string | null
          nombre_completo: string | null
          obs_generadas: number | null
          obs_resueltas: number | null
          promedio_calificacion_alumnos: number | null
          tasa_asistencia_clases: number | null
          tasa_resolucion_obs: number | null
          total_alumnos_evaluados: number | null
          total_evaluaciones: number | null
          total_registros_asistencia: number | null
        }
        Relationships: []
      }
      vw_reparaciones_pendientes: {
        Row: {
          activo_id: string | null
          codigo_inventario: string | null
          costo_estimado: number | null
          costo_real: number | null
          descripcion: string | null
          dias_en_reparacion: number | null
          estado: string | null
          estado_label: string | null
          fecha_ingreso: string | null
          id: string | null
          marca: string | null
          modelo: string | null
          tallerista_nombre: string | null
          tipo_instrumento: string | null
          tipo_tallerista: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_reparaciones_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "inventario_activos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_reparaciones_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "vw_instrumentos_disponibles"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_resumen_alumno: {
        Row: {
          activo: boolean | null
          alertas_alta: number | null
          ausencias: number | null
          ausencias_14d: number | null
          ausencias_28d: number | null
          id: string | null
          instrumento_principal: string | null
          justificados: number | null
          nivel: string | null
          nombre_completo: string | null
          obs_abiertas: number | null
          obs_resueltas: number | null
          obs_seguimiento: number | null
          presencias: number | null
          promedio_calificacion: number | null
          tasa_asistencia: number | null
          total_clases: number | null
          total_evaluaciones: number | null
          ultima_evaluacion: string | null
        }
        Relationships: []
      }
      vw_riesgo_abandono: {
        Row: {
          alertas_alta: number | null
          alumno_id: string | null
          ausencias_14d: number | null
          ausencias_28d: number | null
          delta_calificacion: number | null
          instrumento_principal: string | null
          nivel: string | null
          nivel_riesgo: string | null
          nombre_completo: string | null
          obs_abiertas: number | null
          promedio_calificacion: number | null
          score_riesgo: number | null
          tasa_asistencia: number | null
        }
        Relationships: []
      }
      vw_score_representantes: {
        Row: {
          calculado_en: string | null
          ciclo_anio: number | null
          ciclo_mes: number | null
          comportamiento_mora_pct: number | null
          consistencia_meses: number | null
          familia_id: string | null
          generosidad_pct: number | null
          nivel: string | null
          nombre_familia: string | null
          puntualidad_pct: number | null
          rep_nombre: string | null
          representante_id: string | null
          score: number | null
          voluntad_pago_pct: number | null
        }
        Relationships: [
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_alumno_estado_pago"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "score_compromiso_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "representantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_compromiso_representante_id_fkey"
            columns: ["representante_id"]
            isOneToOne: false
            referencedRelation: "vw_estado_familiar"
            referencedColumns: ["rep_id"]
          },
        ]
      }
      vw_seguimiento_ausentes: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          clase_nombres: string | null
          contacto_nombre: string | null
          contacto_origen: string | null
          contacto_telefono: string | null
          dias_ausente: number | null
          dias_clase: number | null
          instrumento_principal: string | null
          maestro_id: string | null
          maestro_nombre: string | null
          maestro_tlf: string | null
          nivel: number | null
          periodo_id: string | null
          periodo_nombre: string | null
          retencion_activa: boolean | null
          retencion_id: string | null
          ultima_ausencia_fecha: string | null
          ultimo_seguimiento_fecha: string | null
          ultimo_seguimiento_nivel: number | null
          ultimo_seguimiento_resultado: string | null
        }
        Relationships: []
      }
      vw_stock_bajo: {
        Row: {
          categoria: string | null
          descripcion: string | null
          id: string | null
          links_externos: Json | null
          nombre: string | null
          precio_unitario: number | null
          stock_actual: number | null
          stock_minimo: number | null
          unidades_faltantes: number | null
        }
        Insert: {
          categoria?: string | null
          descripcion?: string | null
          id?: string | null
          links_externos?: Json | null
          nombre?: string | null
          precio_unitario?: number | null
          stock_actual?: number | null
          stock_minimo?: number | null
          unidades_faltantes?: never
        }
        Update: {
          categoria?: string | null
          descripcion?: string | null
          id?: string | null
          links_externos?: Json | null
          nombre?: string | null
          precio_unitario?: number | null
          stock_actual?: number | null
          stock_minimo?: number | null
          unidades_faltantes?: never
        }
        Relationships: []
      }
    }
    Functions: {
      _fn_crear_tarea_caso: {
        Args: {
          p_actor_id: string
          p_actor_nombre: string
          p_corr: string
          p_depto: Database["public"]["Enums"]["soi_departamento"]
          p_desc: string
          p_entidad_id: string
          p_entidad_label: string
          p_entidad_tipo: string
          p_prioridad: string
          p_titulo: string
        }
        Returns: undefined
      }
      analizar_seguimiento_alumnos: {
        Args: {
          p_busqueda?: string
          p_desde?: string
          p_hasta?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          alumno_id: string
          asistencia_presentes: number
          asistencia_rate: number
          asistencia_total: number
          en_riesgo: boolean
          instrumento_principal: string
          nivel_riesgo: string
          nombre_completo: string
          observaciones_count: number
          progreso_count: number
          progreso_promedio: number
          risk_count: number
          risk_reasons: string[]
          risk_score: number
          total_count: number
        }[]
      }
      approve_maestro_profile: {
        Args: { p_new_estado?: string; p_new_rol: string; p_profile_id: string }
        Returns: Json
      }
      aprobar_usuario: { Args: { p_user_id: string }; Returns: undefined }
      backfill_alumnos_desde_postulantes: {
        Args: { dry_run?: boolean }
        Returns: {
          accion: string
          alumno_id: string
          alumno_nombre: string
          campos_llenados: number
          match_tipo: string
          postulante_id: string
          postulante_nombre: string
        }[]
      }
      cambiar_estado_activo: {
        Args: { p_id: string; p_nuevo_estado: string }
        Returns: Json
      }
      cambiar_estado_reparacion: {
        Args: { p_id: string; p_nuevo_estado: string }
        Returns: Json
      }
      cambiar_rol_usuario: {
        Args: { p_nuevo_rol: string; p_user_id: string }
        Returns: undefined
      }
      clonar_catalogo_a_clase: {
        Args: {
          p_clase_id: string
          p_nivel_id: string
          p_objetivo_general_ids?: string[]
        }
        Returns: {
          indicador_id: string
          objetivo_id: string
          origen_objetivo_especifico_id: string
          origen_objetivo_general_id: string
        }[]
      }
      clonar_plantilla_a_clase: {
        Args: {
          p_clase_id: string
          p_node_ids?: string[]
          p_plantilla_id: string
        }
        Returns: {
          indicador_id: string
          objetivo_id: string
          origen_indicator_id: string
          origen_objetivo_id: string
        }[]
      }
      clone_route_version_as_draft: {
        Args: { p_source_version_id: string }
        Returns: string
      }
      count_alumnos_activos: { Args: never; Returns: number }
      crear_reparacion: {
        Args: {
          p_activo_id: string
          p_costo_estimado: number
          p_descripcion: string
          p_proveedor_factura_url?: string
          p_tallerista_nombre: string
          p_tipo_tallerista: string
        }
        Returns: Json
      }
      diagnose_profiles_schema: { Args: never; Returns: Json }
      eliminar_maestro_limpio: { Args: { p_maestro_id: string }; Returns: Json }
      ensure_session_and_save_evaluation: {
        Args: {
          p_clase_id: string
          p_fecha: string
          p_hora_inicio: string
          p_indicator_id: string
          p_maestro_id: string
          p_nota: number
          p_observations: string
          p_student_id: string
        }
        Returns: string
      }
      es_admin: { Args: never; Returns: boolean }
      es_coordinador_acm: { Args: never; Returns: boolean }
      es_maestro_de_clase: { Args: { p_clase_id: string }; Returns: boolean }
      es_maestro_titular_de_clase: {
        Args: { p_clase_id: string }
        Returns: boolean
      }
      fn_activar_campania: { Args: { p_id: string }; Returns: Json }
      fn_activar_periodo: { Args: { p_periodo_id: string }; Returns: Json }
      fn_actualizar_contacto: {
        Args: {
          p_campo: string
          p_nombre: string
          p_secret: string
          p_tipo: string
          p_valor: string
        }
        Returns: {
          campo: string
          persona_nombre: string
          tipo: string
          valor_anterior: string
          valor_nuevo: string
        }[]
      }
      fn_actualizar_estado_postulante: {
        Args: { p_nombre: string; p_nuevo_estado: string; p_secret: string }
        Returns: {
          estado_anterior: string
          estado_nuevo: string
          postulante_nombre: string
        }[]
      }
      fn_actualizar_racha_alumno: {
        Args: { p_alumno_id: string; p_clase_id: string; p_fecha: string }
        Returns: undefined
      }
      fn_actualizar_tarea: {
        Args: { p_notas?: string; p_nuevo_estado: string; p_tarea_id: string }
        Returns: Json
      }
      fn_alumno_ficha_360: {
        Args: { p_alumno_id: string }
        Returns: {
          ausentes: number
          justificados: number
          presentes: number
          primera_asistencia: string
          total_evaluaciones: number
          total_sesiones: number
          ultima_asistencia: string
          ultima_calificacion: number
          ultima_fecha_evaluacion: string
          ultimo_estado_cualitativo: string
          ultimo_objetivo: string
        }[]
      }
      fn_alumnos_inasistencias_pendiente: {
        Args: { p_secret: string }
        Returns: {
          alumno_nombre: string
          inasistencias: number
          ultima_fecha: string
        }[]
      }
      fn_anular_sesiones_no_lectivas: {
        Args: { p_desde?: string; p_dry_run?: boolean; p_hasta?: string }
        Returns: Json
      }
      fn_aplicar_becas_ciclo: {
        Args: { p_anio: number; p_mes: number }
        Returns: undefined
      }
      fn_calcular_pulso_score: {
        Args: { p_persistir?: boolean }
        Returns: Json
      }
      fn_calcular_score_representante: {
        Args: { p_anio: number; p_mes: number; p_representante_id: string }
        Returns: undefined
      }
      fn_cerrar_periodo_academico: {
        Args: {
          p_cerrado_por?: string
          p_fecha_fin?: string
          p_fecha_inicio?: string
          p_forzar?: boolean
          p_observaciones?: string
          p_periodo_id: string
        }
        Returns: Json
      }
      fn_check_and_notify_pending_asistencias: {
        Args: never
        Returns: {
          notification_count: number
        }[]
      }
      fn_cobertura_curricular: { Args: { p_periodo_id: string }; Returns: Json }
      fn_correlacion_asistencia_rendimiento: { Args: never; Returns: number }
      fn_crear_evento_calendario: {
        Args: {
          p_departamento_id: string
          p_descripcion?: string
          p_fecha_alerta?: number
          p_fecha_fin?: string
          p_fecha_inicio?: string
          p_notas?: string
          p_prioridad?: string
          p_protocolo_json?: Json
          p_responsable_id?: string
          p_tipo?: string
          p_titulo: string
        }
        Returns: Json
      }
      fn_crear_familia_para_alumno: {
        Args: { p_nombre: string }
        Returns: string
      }
      fn_datos_jerarquicos_de_objetivo: {
        Args: { p_objetivo_id: string }
        Returns: {
          clase_id: string
          level_number: number
          orden_objetivo: number
        }[]
      }
      fn_desplazar_cronograma_evento: {
        Args: { p_delta_dias: number; p_event_id: string }
        Returns: number
      }
      fn_dispatch_enrollment_reminders: { Args: never; Returns: number }
      fn_eliminar_familia_huerfana: {
        Args: { p_familia_id: string }
        Returns: boolean
      }
      fn_email_departamento: { Args: { p_codigo: string }; Returns: string }
      fn_encolar_campania: {
        Args: { p_campania_id: string; p_limite?: number }
        Returns: Json
      }
      fn_es_dia_lectivo: { Args: { p_fecha?: string }; Returns: boolean }
      fn_escalar_mora: { Args: never; Returns: undefined }
      fn_estado_asistencia_maestro: {
        Args: { p_desde: string; p_hasta: string; p_maestro_id: string }
        Returns: {
          asistencia_completa: boolean
          clase_id: string
          clase_nombre: string
          cubierta_emergente: boolean
          dias_atraso: number
          estado: string
          fecha: string
          hora_fin: string
          hora_inicio: string
          maestro_id: string
          sesion_id: string
        }[]
      }
      fn_estado_calendario: { Args: { p_fecha?: string }; Returns: Json }
      fn_evaluacion_cobertura: { Args: { p_clase_id: string }; Returns: Json }
      fn_evaluar_logros_alumno: {
        Args: { p_alumno_id: string }
        Returns: undefined
      }
      fn_fin_acquire_service_refresh_lock: {
        Args: {
          p_lease_seconds: number
          p_refresh_run_id: string
          p_service_account_id: string
        }
        Returns: boolean
      }
      fn_fin_complete_service_refresh: {
        Args: {
          p_error_code: string
          p_record_query: boolean
          p_refresh_run_id: string
          p_service_account_id: string
          p_status: string
          p_success: boolean
        }
        Returns: boolean
      }
      fn_fin_service_dashboard: {
        Args: never
        Returns: {
          account_name: string
          amount_due_centavos: number
          balance_centavos: number
          connector_status: string
          currency_code: string
          days_remaining: number
          due_date: string
          essential: boolean
          last_error_code: string
          last_query_at: string
          last_status: string
          last_success_at: string
          observed_at: string
          provider_key: string
          provider_name: string
          refresh_enabled: boolean
          service_account_id: string
          service_type: string
        }[]
      }
      fn_fusionar_alumnos_duplicados: {
        Args: {
          p_datos_fusion: Json
          p_obsoleto_id: string
          p_principal_id: string
        }
        Returns: Json
      }
      fn_generar_ciclo_cuotas: {
        Args: { p_anio: number; p_mes: number; p_monto_centavos?: number }
        Returns: number
      }
      fn_generar_instancias_gastos_fijos: {
        Args: { p_anio: number; p_mes: number }
        Returns: number
      }
      fn_generar_tareas_calendario: {
        Args: { p_evento_id: string }
        Returns: Json
      }
      fn_generate_class_start_reminders: {
        Args: never
        Returns: {
          notifications_created: number
        }[]
      }
      fn_get_indice_ensenanza_guiada: {
        Args: never
        Returns: {
          indice: number | null
          maestro_id: string | null
          sesiones_con_indicador: number | null
          total_sesiones: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vw_indice_ensenanza_guiada"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fn_hermes_aprobar_whatsapp: {
        Args: { p_queue_id: string }
        Returns: undefined
      }
      fn_hermes_close_process_case: {
        Args: {
          p_actor_id?: string
          p_actor_nombre?: string
          p_case_id: string
          p_closure_summary?: string
          p_force?: boolean
        }
        Returns: Json
      }
      fn_hermes_consulta_estado: { Args: never; Returns: Json }
      fn_hermes_escalar_tareas_bloqueadas: { Args: never; Returns: undefined }
      fn_hermes_force_close_process_case: {
        Args: {
          p_actor_id?: string
          p_actor_nombre?: string
          p_case_id: string
          p_closure_summary?: string
        }
        Returns: Json
      }
      fn_hermes_orquestar_protocolo: {
        Args: { p_evento_id: string; p_protocolo_id: string }
        Returns: {
          departamento: string
          dependencia_tarea_id: string
          fecha_vencimiento: string
          paso: number
          tarea_id: string
          titulo: string
        }[]
      }
      fn_hermes_outreach_gate_status: {
        Args: { p_secret: string }
        Returns: {
          quiet_hours_end: string
          quiet_hours_start: string
          whatsapp_ingest_enabled: boolean
        }[]
      }
      fn_hermes_queue_whatsapp: {
        Args: { p_jid: string; p_mensaje: string }
        Returns: string
      }
      fn_hermes_rechazar_whatsapp: {
        Args: { p_motivo?: string; p_queue_id: string }
        Returns: undefined
      }
      fn_hermes_register_response: {
        Args: {
          p_notif_id?: string
          p_response_text?: string
          p_sender_name?: string
          p_sender_whatsapp?: string
        }
        Returns: Json
      }
      fn_hermes_resolver_caso: {
        Args: { p_case_id: string; p_decision: string }
        Returns: Json
      }
      fn_hermes_start_process_case: {
        Args: {
          p_description?: string
          p_entity_id?: string
          p_entity_label?: string
          p_entity_type?: string
          p_metadata?: Json
          p_priority?: string
          p_process_code: string
          p_requested_by?: string
          p_requested_by_name?: string
          p_source?: string
          p_title?: string
        }
        Returns: string
      }
      fn_hermes_update_notif: {
        Args: { p_estado_wa: string; p_id: string; p_respuesta?: string }
        Returns: undefined
      }
      fn_listar_protocolos: { Args: never; Returns: Json }
      fn_lookup_maestro_contacto: {
        Args: { p_nombre: string; p_secret: string }
        Returns: {
          jid: string
          maestro_nombre: string
        }[]
      }
      fn_lookup_representante_contacto: {
        Args: { p_nombre: string; p_secret: string }
        Returns: {
          alumno_nombre: string
          jid: string
          representante_nombre: string
        }[]
      }
      fn_lut_upsert_diagnostico: {
        Args: {
          p_causa_probable?: string
          p_costo_materiales?: number
          p_diagnosticado_por?: string
          p_diagnosticado_por_nombre?: string
          p_diagnostico_tecnico: string
          p_gravedad?: string
          p_items: Json
          p_materiales_requeridos?: string
          p_observaciones?: string
          p_orden_id: string
          p_reparacion_recomendada?: string
          p_requiere_servicio_externo?: boolean
          p_tiempo_estimado_horas?: number
          p_tipo_dano?: string
          p_zona_afectada?: string
        }
        Returns: string
      }
      fn_maestros_asistencia_pendiente: {
        Args: { p_secret: string }
        Returns: {
          clase_nombre: string
          fecha: string
          maestro_nombre: string
        }[]
      }
      fn_marcar_asistencia: {
        Args: {
          p_alumno: string
          p_clase: string
          p_fecha: string
          p_nuevo_estado: string
          p_secret: string
        }
        Returns: {
          alumno_nombre: string
          clase_nombre: string
          estado_anterior: string
          estado_nuevo: string
          fecha: string
        }[]
      }
      fn_morning_admissions_briefing: { Args: never; Returns: string }
      fn_observar_tarea: {
        Args: {
          p_actor_id: string
          p_actor_nombre: string
          p_comentario: string
          p_tarea_id: string
        }
        Returns: undefined
      }
      fn_obtener_eventos_proximos: {
        Args: { p_dias_desde?: number; p_dias_hasta?: number }
        Returns: Json
      }
      fn_obtener_protocolo: { Args: { p_tipo: string }; Returns: Json }
      fn_obtener_tareas_departamento: {
        Args: { p_departamento_id?: string; p_estado?: string }
        Returns: Json
      }
      fn_periodo_vigente: { Args: { p_fecha?: string }; Returns: string }
      fn_portal_maestro_bloqueado: { Args: never; Returns: boolean }
      fn_preview_campania: { Args: { p_id: string }; Returns: Json }
      fn_procedimientos_resumen: {
        Args: never
        Returns: {
          bloqueadas: number
          canceladas: number
          completadas: number
          correlation_id: string
          departamentos: string[]
          en_progreso: number
          observadas: number
          pct_avance: number
          pendientes: number
          prioridad_max: string
          titulo_muestra: string
          total: number
          ultima_actividad: string
        }[]
      }
      fn_racha_ausencias: { Args: { p_alumno_id: string }; Returns: number }
      fn_registrar_alerta_enviada: {
        Args: {
          p_canal: string
          p_contenido: string
          p_destinatario: string
          p_tipo: string
        }
        Returns: Json
      }
      fn_registrar_pago_transaccional: {
        Args: {
          p_cuota_ids: string[]
          p_familia_id: string
          p_fecha_pago?: string
          p_metodo_pago: string
          p_monto_centavos: number
          p_notas: string
          p_referencia: string
        }
        Returns: {
          cajero_id: string | null
          created_at: string | null
          cuota_ids: string[]
          familia_id: string
          fecha_pago: string | null
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"]
          monto_centavos: number
          notas: string | null
          recibo_url: string | null
          referencia: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pagos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_reportar_alumno_riesgo: {
        Args: {
          p_actor_id: string
          p_actor_nombre: string
          p_alumno_id: string
          p_alumno_nombre: string
          p_motivo: string
        }
        Returns: string
      }
      fn_reportar_instrumento_danado: {
        Args: {
          p_actor_id: string
          p_actor_nombre: string
          p_descripcion: string
          p_instrumento_id: string
        }
        Returns: string
      }
      fn_reporte_cierre_semestre: {
        Args: {
          p_dias_gracia_registro?: number
          p_escala_calificacion?: number
          p_periodo_id: string
          p_umbral_asistencia_pct?: number
          p_umbral_nota_pct?: number
        }
        Returns: Json
      }
      fn_reporte_indicadores_adicionales: {
        Args: { p_cobertura_minima_pct?: number; p_periodo_id: string }
        Returns: Json
      }
      fn_resumen_academico_integrado: {
        Args: { p_alumno_id: string; p_limite?: number }
        Returns: Json
      }
      fn_resumen_cumplimiento_asistencia: {
        Args: { p_desde: string; p_hasta: string; p_maestro_id?: string }
        Returns: {
          es_solvente: boolean
          maestro_id: string
          maestro_nombre: string
          pendientes: number
          registradas: number
          total_clases: number
          vencidas: number
        }[]
      }
      fn_resumen_diario_director: { Args: never; Returns: Json }
      fn_servicio_publico_activo: { Args: never; Returns: boolean }
      fn_sincronizar_arbol_curricular: {
        Args: {
          p_clase_id: string
          p_nombre: string
          p_objetivos: Json
          p_plantilla_id?: string
        }
        Returns: string
      }
      fn_sugerir_nodo_por_texto: {
        Args: { p_texto: string }
        Returns: {
          aciertos: number
          codigo: string
          nombre: string
        }[]
      }
      fn_tasa_asistencia_periodo: {
        Args: { p_alumno_id: string; p_desde: string; p_hasta?: string }
        Returns: number
      }
      fn_upsert_protocolo: {
        Args: {
          p_descripcion?: string
          p_nombre: string
          p_tareas?: Json
          p_tipo: string
        }
        Returns: Json
      }
      fn_validar_cierre_periodo: {
        Args: { p_periodo_id: string }
        Returns: Json
      }
      fn_verificar_conflicto_cita: {
        Args: {
          p_departamento?: string
          p_fecha_fin: string
          p_fecha_inicio: string
        }
        Returns: {
          evento_departamento: string
          evento_fin: string
          evento_id: string
          evento_inicio: string
          evento_titulo: string
          hay_conflicto: boolean
        }[]
      }
      fn_whatsapp_cap_hoy: { Args: never; Returns: number }
      fn_whatsapp_enviados_hoy: { Args: never; Returns: number }
      fn_whatsapp_optout: {
        Args: { p_jid: string; p_motivo?: string }
        Returns: undefined
      }
      fn_whatsapp_rate_excedido: { Args: { p_jid: string }; Returns: boolean }
      fn_whatsapp_reclamar_pendientes: {
        Args: { p_limite?: number }
        Returns: {
          campania_envio_id: string | null
          created_at: string | null
          error_msg: string | null
          estado: string
          id: string
          intentos: number | null
          jid: string
          mensaje: string
          procesado_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "hermes_whatsapp_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      generar_contrato_pdf: { Args: { p_comodato_id: string }; Returns: Json }
      generar_numero_factura: { Args: never; Returns: string }
      generar_reporte_inventario: {
        Args: { p_filtros?: Json; p_tipo: string }
        Returns: Json
      }
      generate_pending_class_notifications: {
        Args: never
        Returns: {
          errors_logged: number
          maestros_processed: number
          notifications_created: number
        }[]
      }
      get_alumnos_disponibles_para_inscripcion: {
        Args: never
        Returns: {
          activo: boolean
          id: string
          instrumento_principal: string
          nivel: string
          nombre_completo: string
          promedio_notas: number
        }[]
      }
      get_app_user_role: { Args: never; Returns: string }
      get_informe_academico_semestral: {
        Args: { p_periodo_id?: string }
        Returns: Json
      }
      get_my_rol: { Args: never; Returns: string }
      get_resumen_academico_mensual: {
        Args: { p_anio?: number; p_mes?: number; p_periodo_id?: string }
        Returns: Json
      }
      get_user_department: { Args: never; Returns: string }
      get_user_familia_id: { Args: never; Returns: string }
      get_user_portales: {
        Args: { p_user_id?: string }
        Returns: {
          icono: string
          nombre: string
          orden: number
          origen_acceso: string
          portal_id: string
          ruta: string
        }[]
      }
      get_user_role: { Args: never; Returns: string }
      has_portal_access: {
        Args: { p_portal_id: string; p_user_id?: string }
        Returns: boolean
      }
      intercambiar_instrumentos: {
        Args: {
          p_activo_destino_id: string
          p_alumno_id: string
          p_comodato_origen_id: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      is_app_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_teacher: { Args: never; Returns: boolean }
      maestro_actual: { Args: never; Returns: string }
      maestro_en_clase: { Args: { p_clase_id: string }; Returns: boolean }
      normalizar_tel_rd: { Args: { raw: string }; Returns: string }
      normalize_phone: { Args: { raw: string }; Returns: string }
      obtener_kpi_inventario: { Args: never; Returns: Json }
      preview_retiro_maestro: { Args: { p_maestro_id: string }; Returns: Json }
      profile_is_active: { Args: never; Returns: boolean }
      reactivar_maestro_seguro: {
        Args: { p_maestro_id: string }
        Returns: undefined
      }
      rechazar_usuario: { Args: { p_user_id: string }; Returns: undefined }
      refresh_maestro_desempeno: { Args: never; Returns: undefined }
      registrar_justificacion_asistencia: {
        Args: {
          p_alumno_id: string
          p_clase_id: string
          p_fecha: string
          p_motivo?: string
        }
        Returns: string
      }
      registrar_sesion_bitacora: {
        Args: {
          p_clase_id: string
          p_fecha: string
          p_notas: Json
          p_objetivo_id: string
        }
        Returns: string
      }
      renovar_comodato: {
        Args: {
          p_comodato_id: string
          p_nueva_fecha_vencimiento: string
          p_nuevo_tipo: string
        }
        Returns: Json
      }
      retirar_maestro_seguro: {
        Args: {
          p_maestro_id: string
          p_motivo?: string
          p_reemplazo_maestro_id?: string
        }
        Returns: Json
      }
      set_user_portales: {
        Args: { p_portal_ids: string[]; p_user_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      teacher_can_create_students: { Args: never; Returns: boolean }
      tiene_permiso: { Args: { p_permiso: string }; Returns: boolean }
      update_profile: {
        Args: { p_avatar_url: string; p_id: string; p_nombre_completo: string }
        Returns: undefined
      }
      validate_admin_invite_code: { Args: { p_code: string }; Returns: boolean }
      validate_disponibilidad_json: { Args: { p_json: Json }; Returns: boolean }
    }
    Enums: {
      asignacion_estado: "pendiente" | "aprobado" | "rechazado" | "cobrado"
      attempt_result: "in_process" | "approved" | "failed"
      cierre_caja_estado: "borrador" | "cerrado" | "auditado"
      cuota_estado:
        | "pendiente"
        | "pagada"
        | "vencida"
        | "en_mora"
        | "exonerada"
        | "becada"
        | "pre_pagada"
      event_categoria:
        | "concierto"
        | "ensayo"
        | "reunion"
        | "patrocinio"
        | "pago"
        | "corte"
        | "inscripcion"
        | "auditoria"
        | "otro"
        | "aniversario"
        | "audicion_trimestral"
        | "ensayo_intensivo"
      exoneracion_tipo: "total" | "parcial"
      mensaje_tipo: "general" | "urgente" | "consulta" | "aprobacion_requerida"
      metodo_pago:
        | "efectivo"
        | "transferencia"
        | "pago_movil"
        | "tarjeta"
        | "mixto"
        | "tercero"
        | "link_externo"
      minuta_visibilidad: "cajero" | "admin" | "todos"
      nivel_estudiante:
        | "Nivel 1"
        | "Nivel 2"
        | "Nivel 3"
        | "Nivel 4"
        | "Nivel 5"
      notif_canal: "whatsapp" | "portal" | "ambos"
      notif_estado_portal: "no_leida" | "leida" | "archivada"
      notif_estado_wa:
        | "pendiente"
        | "enviada"
        | "leida"
        | "respondida"
        | "fallida"
        | "no_aplica"
      notif_prioridad: "baja" | "media" | "alta" | "critica"
      notif_tipo:
        | "mora_recordatorio"
        | "mora_compromiso"
        | "mora_escalada"
        | "accesorio_asignado"
        | "accesorio_aprobacion"
        | "stock_bajo"
        | "comodato_riesgo"
        | "campana_pago"
        | "mensaje_interno"
        | "tarea_asignada"
        | "minuta_nueva"
      patrocinante_tipo: "persona" | "empresa"
      patrocinio_cubre: "cuotas" | "wallet" | "accesorios" | "todo"
      progress_status: "pending" | "in_process" | "approved" | "failed"
      resultado_audicion: "PROMOVIDO" | "PERMANECE" | "NO_PROMOVIDO"
      route_status: "draft" | "published" | "archived"
      sim_actor_tipo: "postulante" | "alumno" | "maestro" | "representante"
      sim_canal: "whatsapp" | "email"
      sim_estado_pago: "solvente" | "moroso" | "no_aplica"
      sim_outbox_estado: "pendiente" | "enviado" | "fallido"
      sim_run_estado:
        | "creado"
        | "corriendo"
        | "pausado"
        | "finalizado"
        | "error"
      soi_departamento:
        | "DIR"
        | "ACM"
        | "ADM"
        | "FIN"
        | "LOG"
        | "COM"
        | "TECNICO"
        | "LUT"
      tarea_estado:
        | "pendiente"
        | "en_progreso"
        | "completada"
        | "cancelada"
        | "vencida"
      tarea_institucional_estado:
        | "pendiente"
        | "en_progreso"
        | "completada"
        | "bloqueada"
        | "cancelada"
        | "observada"
        | "bloqueada_por_dependencia"
      tarea_institucional_prioridad: "baja" | "media" | "alta" | "critica"
      tarea_prioridad: "baja" | "media" | "alta" | "critica"
      tarea_tipo:
        | "seguimiento_pago"
        | "revision_instrumento"
        | "reposicion_stock"
        | "recordatorio_compromiso"
        | "otro"
      wallet_modo: "solo_accesorios" | "solo_cuotas" | "mixto"
      wallet_origen: "pago" | "patrocinio" | "beca" | "accesorio" | "ajuste"
      wallet_status: "operativa" | "congelada" | "devuelta"
      wallet_tipo: "credito" | "debito"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      asignacion_estado: ["pendiente", "aprobado", "rechazado", "cobrado"],
      attempt_result: ["in_process", "approved", "failed"],
      cierre_caja_estado: ["borrador", "cerrado", "auditado"],
      cuota_estado: [
        "pendiente",
        "pagada",
        "vencida",
        "en_mora",
        "exonerada",
        "becada",
        "pre_pagada",
      ],
      event_categoria: [
        "concierto",
        "ensayo",
        "reunion",
        "patrocinio",
        "pago",
        "corte",
        "inscripcion",
        "auditoria",
        "otro",
        "aniversario",
        "audicion_trimestral",
        "ensayo_intensivo",
      ],
      exoneracion_tipo: ["total", "parcial"],
      mensaje_tipo: ["general", "urgente", "consulta", "aprobacion_requerida"],
      metodo_pago: [
        "efectivo",
        "transferencia",
        "pago_movil",
        "tarjeta",
        "mixto",
        "tercero",
        "link_externo",
      ],
      minuta_visibilidad: ["cajero", "admin", "todos"],
      nivel_estudiante: ["Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4", "Nivel 5"],
      notif_canal: ["whatsapp", "portal", "ambos"],
      notif_estado_portal: ["no_leida", "leida", "archivada"],
      notif_estado_wa: [
        "pendiente",
        "enviada",
        "leida",
        "respondida",
        "fallida",
        "no_aplica",
      ],
      notif_prioridad: ["baja", "media", "alta", "critica"],
      notif_tipo: [
        "mora_recordatorio",
        "mora_compromiso",
        "mora_escalada",
        "accesorio_asignado",
        "accesorio_aprobacion",
        "stock_bajo",
        "comodato_riesgo",
        "campana_pago",
        "mensaje_interno",
        "tarea_asignada",
        "minuta_nueva",
      ],
      patrocinante_tipo: ["persona", "empresa"],
      patrocinio_cubre: ["cuotas", "wallet", "accesorios", "todo"],
      progress_status: ["pending", "in_process", "approved", "failed"],
      resultado_audicion: ["PROMOVIDO", "PERMANECE", "NO_PROMOVIDO"],
      route_status: ["draft", "published", "archived"],
      sim_actor_tipo: ["postulante", "alumno", "maestro", "representante"],
      sim_canal: ["whatsapp", "email"],
      sim_estado_pago: ["solvente", "moroso", "no_aplica"],
      sim_outbox_estado: ["pendiente", "enviado", "fallido"],
      sim_run_estado: ["creado", "corriendo", "pausado", "finalizado", "error"],
      soi_departamento: [
        "DIR",
        "ACM",
        "ADM",
        "FIN",
        "LOG",
        "COM",
        "TECNICO",
        "LUT",
      ],
      tarea_estado: [
        "pendiente",
        "en_progreso",
        "completada",
        "cancelada",
        "vencida",
      ],
      tarea_institucional_estado: [
        "pendiente",
        "en_progreso",
        "completada",
        "bloqueada",
        "cancelada",
        "observada",
        "bloqueada_por_dependencia",
      ],
      tarea_institucional_prioridad: ["baja", "media", "alta", "critica"],
      tarea_prioridad: ["baja", "media", "alta", "critica"],
      tarea_tipo: [
        "seguimiento_pago",
        "revision_instrumento",
        "reposicion_stock",
        "recordatorio_compromiso",
        "otro",
      ],
      wallet_modo: ["solo_accesorios", "solo_cuotas", "mixto"],
      wallet_origen: ["pago", "patrocinio", "beca", "accesorio", "ajuste"],
      wallet_status: ["operativa", "congelada", "devuelta"],
      wallet_tipo: ["credito", "debito"],
    },
  },
} as const
