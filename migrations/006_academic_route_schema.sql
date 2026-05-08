-- Enums para estados consistentes
DO $$ BEGIN
    CREATE TYPE progress_status AS ENUM ('pending', 'in_process', 'failed', 'approved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evaluation_result AS ENUM ('not_started', 'approved', 'failed', 'in_process');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Rutas (Plantilla)
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Versiones de Ruta
CREATE TABLE IF NOT EXISTS public.route_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  is_current BOOLEAN DEFAULT false,
  change_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Bloques
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_version_id UUID REFERENCES public.route_versions(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'Básico', 'Intermedio'
  order_index INT NOT NULL
);

-- 4. Niveles
CREATE TABLE IF NOT EXISTS public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT NOT NULL,
  requirements JSONB -- JSONB con requerimientos adicionales
);

-- 5. Nodos (Competencias)
CREATE TABLE IF NOT EXISTS public.nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false, -- Sonido/Afinación
  order_index INT NOT NULL
);

-- 6. Indicadores (Items medibles)
CREATE TABLE IF NOT EXISTS public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  order_index INT NOT NULL
);

-- 7. Planes Académicos Individuales
CREATE TABLE IF NOT EXISTS public.academic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  route_version_id UUID REFERENCES public.route_versions(id),
  status progress_status DEFAULT 'in_process',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Progreso de Nivel por Estudiante
CREATE TABLE IF NOT EXISTS public.student_level_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'pending',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, level_id)
);

-- 9. Progreso de Nodo por Estudiante
CREATE TABLE IF NOT EXISTS public.student_node_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
  status progress_status DEFAULT 'pending',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, node_id)
);

-- 10. Intentos de Indicador (Log histórico)
CREATE TABLE IF NOT EXISTS public.indicator_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES public.indicators(id),
  session_id UUID, -- Referencia a class_sessions (se define abajo)
  result evaluation_result NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Sesiones de Clase
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID REFERENCES public.clases(id),
  maestro_id UUID REFERENCES public.maestros(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled'
);

-- Agregar FK a indicator_attempts ahora que class_sessions existe
ALTER TABLE public.indicator_attempts 
ADD CONSTRAINT fk_indicator_attempts_session 
FOREIGN KEY (session_id) REFERENCES public.class_sessions(id) ON DELETE SET NULL;

-- 12. Snapshots de Contenido (Inmutabilidad)
CREATE TABLE IF NOT EXISTS public.class_session_content_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  node_id UUID,
  indicator_id UUID,
  node_name TEXT,
  indicator_description TEXT,
  is_critical BOOLEAN
);

-- 13. Asistencia (Link Sesión-Alumno)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'justified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- 14. Nodos de Plan Académico (Opcional para personalización fina)
CREATE TABLE IF NOT EXISTS public.academic_plan_nodes (
  academic_plan_id UUID REFERENCES public.academic_plans(id) ON DELETE CASCADE,
  node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
  PRIMARY KEY (academic_plan_id, node_id)
);

-- Índices de Performance Extra
CREATE INDEX IF NOT EXISTS idx_node_progress_lookup ON public.student_node_progress(student_id, node_id);
CREATE INDEX IF NOT EXISTS idx_level_progress_lookup ON public.student_level_progress(student_id, level_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_indicator ON public.indicator_attempts(student_id, indicator_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_created ON public.indicator_attempts(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance_records(session_id);

-------------------------------------------------------------------------------
-- TRIGGERS PARA PROPAGACIÓN DE PROGRESO (AUDITADO)
-------------------------------------------------------------------------------

-- Función 1: Actualizar student_node_progress cuando se inserta en indicator_attempts
CREATE OR REPLACE FUNCTION public.fn_update_node_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_node_id UUID;
    v_total_indicators INT;
    v_approved_indicators INT;
    v_failed_indicators INT;
    v_new_status progress_status;
BEGIN
    SELECT node_id INTO v_node_id FROM public.indicators WHERE id = NEW.indicator_id;
    SELECT COUNT(*) INTO v_total_indicators FROM public.indicators WHERE node_id = v_node_id;

    WITH latest_attempts AS (
        SELECT DISTINCT ON (indicator_id) result
        FROM public.indicator_attempts
        WHERE student_id = NEW.student_id
          AND indicator_id IN (SELECT id FROM public.indicators WHERE node_id = v_node_id)
        ORDER BY indicator_id, created_at DESC
    )
    SELECT 
        COUNT(*) FILTER (WHERE result = 'approved'),
        COUNT(*) FILTER (WHERE result = 'failed')
    INTO v_approved_indicators, v_failed_indicators
    FROM latest_attempts;

    IF v_approved_indicators = v_total_indicators THEN
        v_new_status := 'approved';
    ELSIF v_failed_indicators > 0 THEN
        v_new_status := 'failed'; -- CAMBIO AUDITOR: Si algo falla, el nodo falla
    ELSIF v_approved_indicators > 0 THEN
        v_new_status := 'in_process';
    ELSE
        v_new_status := 'pending';
    END IF;

    INSERT INTO public.student_node_progress (student_id, node_id, status, updated_at)
    VALUES (NEW.student_id, v_node_id, v_new_status, now())
    ON CONFLICT (student_id, node_id) DO UPDATE
    SET status = EXCLUDED.status, updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_after_indicator_attempt
AFTER INSERT OR UPDATE ON public.indicator_attempts
FOR EACH ROW EXECUTE FUNCTION public.fn_update_node_progress();

-- Función 2: Actualizar student_level_progress cuando cambia student_node_progress
CREATE OR REPLACE FUNCTION public.fn_update_level_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_level_id UUID;
    v_total_nodes INT;
    v_approved_nodes INT;
    v_critical_nodes_count INT;
    v_approved_critical_nodes INT;
    v_failed_nodes INT;
    v_new_status progress_status;
BEGIN
    SELECT level_id INTO v_level_id FROM public.nodes WHERE id = NEW.node_id;
    SELECT COUNT(*) INTO v_total_nodes FROM public.nodes WHERE level_id = v_level_id;
    SELECT COUNT(*) INTO v_critical_nodes_count FROM public.nodes 
    WHERE level_id = v_level_id AND is_critical = true;

    SELECT 
        COUNT(*) FILTER (WHERE snp.status = 'approved'),
        COUNT(*) FILTER (WHERE snp.status = 'failed')
    INTO v_approved_nodes, v_failed_nodes
    FROM public.student_node_progress snp
    JOIN public.nodes n ON snp.node_id = n.id
    WHERE snp.student_id = NEW.student_id
      AND n.level_id = v_level_id;

    SELECT COUNT(*) INTO v_approved_critical_nodes 
    FROM public.student_node_progress snp
    JOIN public.nodes n ON snp.node_id = n.id
    WHERE snp.student_id = NEW.student_id
      AND n.level_id = v_level_id
      AND n.is_critical = true
      AND snp.status = 'approved';

    -- REGLA AUDITADA:
    -- 1. Si todos están approved (incluyendo críticos), aprobado.
    -- 2. Si algún nodo es FAILED, el nivel es FAILED (especialmente si es crítico).
    -- 3. Si no, in_process si hay algún avance.

    IF v_approved_nodes = v_total_nodes AND (v_critical_nodes_count = 0 OR v_approved_critical_nodes = v_critical_nodes_count) THEN
        v_new_status := 'approved';
    ELSIF v_failed_nodes > 0 THEN
        v_new_status := 'failed';
    ELSIF v_approved_nodes > 0 OR v_approved_critical_nodes > 0 THEN
        v_new_status := 'in_process';
    ELSE
        v_new_status := 'pending';
    END IF;

    INSERT INTO public.student_level_progress (student_id, level_id, status, updated_at)
    VALUES (NEW.student_id, v_level_id, v_new_status, now())
    ON CONFLICT (student_id, level_id) DO UPDATE
    SET status = EXCLUDED.status, updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_after_node_progress_update
AFTER INSERT OR UPDATE ON public.student_node_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_update_level_progress();
