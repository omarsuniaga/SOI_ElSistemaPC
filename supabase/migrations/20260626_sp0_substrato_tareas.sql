-- 20260626_sp0_substrato_tareas.sql
-- SP-0: substrato de tareas (Hermes orquestador).
-- Entidad polimorfica, correlation_id (agrupa el caso), actor real del cambio,
-- comentarios, historial INMUTABLE (trigger SECURITY DEFINER), RPC observar con comentario.
-- Ver: docs/superpowers/specs/2026-06-26-hermes-substrato-tareas-design.md (v2)

-- Entidad polimorfica + correlation_id + actor del cambio
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS entidad_tipo text,
  ADD COLUMN IF NOT EXISTS entidad_id uuid,
  ADD COLUMN IF NOT EXISTS entidad_label text,
  ADD COLUMN IF NOT EXISTS correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by_nombre text;

-- Constraint via bloque DO (ADD CONSTRAINT IF NOT EXISTS no existe en PG)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tareas_entidad_tipo_check') THEN
    ALTER TABLE public.tareas_institucionales
      ADD CONSTRAINT tareas_entidad_tipo_check CHECK (
        entidad_tipo IS NULL OR entidad_tipo IN
        ('alumno','maestro','postulante','representante','instrumento','evento','otro')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tareas_entidad
  ON public.tareas_institucionales (entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_tareas_correlation
  ON public.tareas_institucionales (correlation_id);

-- Comentarios
CREATE TABLE IF NOT EXISTS public.tarea_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL REFERENCES public.tareas_institucionales(id) ON DELETE CASCADE,
  autor_id uuid,
  autor_nombre text,
  cuerpo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tarea_comentarios_tarea
  ON public.tarea_comentarios (tarea_id, created_at);

-- Historial (INMUTABLE para usuarios: solo el trigger SECURITY DEFINER inserta)
CREATE TABLE IF NOT EXISTS public.tarea_historial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL REFERENCES public.tareas_institucionales(id) ON DELETE CASCADE,
  campo text NOT NULL,
  valor_anterior text,
  valor_nuevo text,
  actor_id uuid,
  actor_nombre text,
  actor_rol text,
  actor_departamento text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tarea_historial_tarea
  ON public.tarea_historial (tarea_id, created_at);

-- Trigger: registra deltas de campos auditados. Actor = NEW.updated_by (NUNCA asignado_a).
CREATE OR REPLACE FUNCTION public.fn_tarea_log_historial()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'estado', OLD.estado::text, NEW.estado::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.asignado_a IS DISTINCT FROM OLD.asignado_a THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'asignado_a', OLD.asignado_a, NEW.asignado_a, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.prioridad IS DISTINCT FROM OLD.prioridad THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'prioridad', OLD.prioridad::text, NEW.prioridad::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.fecha_vencimiento IS DISTINCT FROM OLD.fecha_vencimiento THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'fecha_vencimiento', OLD.fecha_vencimiento::text, NEW.fecha_vencimiento::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.entidad_id IS DISTINCT FROM OLD.entidad_id OR NEW.entidad_tipo IS DISTINCT FROM OLD.entidad_tipo THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'entidad', coalesce(OLD.entidad_tipo,'') || ':' || coalesce(OLD.entidad_label,''),
            coalesce(NEW.entidad_tipo,'') || ':' || coalesce(NEW.entidad_label,''), NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  IF NEW.correlation_id IS DISTINCT FROM OLD.correlation_id THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre)
    VALUES (NEW.id, 'correlation_id', OLD.correlation_id::text, NEW.correlation_id::text, NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tarea_log_historial ON public.tareas_institucionales;
CREATE TRIGGER trg_tarea_log_historial
  AFTER UPDATE ON public.tareas_institucionales
  FOR EACH ROW EXECUTE FUNCTION public.fn_tarea_log_historial();

-- RPC atomico: observar exige comentario (path UPDATE directo a 'observada' se desalienta en API)
CREATE OR REPLACE FUNCTION public.fn_observar_tarea(
  p_tarea_id uuid, p_comentario text, p_actor_id uuid, p_actor_nombre text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_comentario IS NULL OR length(trim(p_comentario)) = 0 THEN
    RAISE EXCEPTION 'observar requiere comentario';
  END IF;
  INSERT INTO public.tarea_comentarios (tarea_id, autor_id, autor_nombre, cuerpo)
    VALUES (p_tarea_id, p_actor_id, p_actor_nombre, p_comentario);
  UPDATE public.tareas_institucionales
    SET estado = 'observada', updated_by = p_actor_id, updated_by_nombre = p_actor_nombre, updated_at = now()
    WHERE id = p_tarea_id;
END $$;

-- RLS: comentarios authenticated R/W; historial authenticated solo SELECT (inmutable)
ALTER TABLE public.tarea_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarea_historial   ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tc_auth_all ON public.tarea_comentarios;
CREATE POLICY tc_auth_all ON public.tarea_comentarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS th_auth_read ON public.tarea_historial;
CREATE POLICY th_auth_read ON public.tarea_historial FOR SELECT TO authenticated USING (true);

REVOKE ALL ON public.tarea_comentarios FROM anon;
REVOKE ALL ON public.tarea_historial   FROM anon, authenticated;
GRANT SELECT, INSERT ON public.tarea_comentarios TO authenticated;
GRANT SELECT ON public.tarea_historial TO authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_observar_tarea(uuid,text,uuid,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_observar_tarea(uuid,text,uuid,text) TO authenticated, service_role;
