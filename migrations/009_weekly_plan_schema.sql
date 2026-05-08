-- Migración 009: Planificación Semanal y Ajustes de Snapshots

-- 1. Crear tabla de entradas de planificación semanal
CREATE TABLE IF NOT EXISTS public.weekly_plan_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_plan_id UUID REFERENCES public.academic_plans(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    focus TEXT, -- Enfoque de la semana (ej: "Postura y primer dedo")
    planned_nodes JSONB DEFAULT '[]'::jsonb, -- [{node_id, title}]
    planned_indicators JSONB DEFAULT '[]'::jsonb, -- [{indicator_id, description}]
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ajustar class_session_content_snapshots
-- Primero eliminamos la FK anterior si existe (apuntaba a class_sessions de 006)
ALTER TABLE public.class_session_content_snapshots 
DROP CONSTRAINT IF EXISTS class_session_content_snapshots_session_id_fkey;

-- Agregamos la columna student_id para filtrar por alumno en la vista de asistencia
ALTER TABLE public.class_session_content_snapshots 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.students(id) ON DELETE CASCADE;

-- Cambiamos la FK para que apunte a sesiones_clase (Portal Maestros)
ALTER TABLE public.class_session_content_snapshots 
ADD CONSTRAINT fk_snapshots_sesion_maestro 
FOREIGN KEY (session_id) REFERENCES public.sesiones_clase(id) ON DELETE CASCADE;

-- Índices para mejorar performance de búsqueda de planificación
CREATE INDEX IF NOT EXISTS idx_weekly_plan_dates ON public.weekly_plan_entries(academic_plan_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_snapshots_student_session ON public.class_session_content_snapshots(session_id, student_id);
