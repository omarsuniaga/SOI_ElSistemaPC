-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — Bitácora libre por sesión (Tarea 1.6)
-- Fecha: 2026-07-31
-- Contexto (openspec/changes/mapa-gamificado-planificacion/design.md,
--   Decisión 7, REQ-11/12/16):
--
--   Tabla NUEVA `sesion_bitacora`, no una columna más en `sesiones_clase`
--   (que ya arrastra `observaciones_generales`, `contenido` y
--   `contenido_dsl` — un cuarto campo de texto solapado empeora el
--   problema). Además REQ-16 exige una RLS distinta a la del resto de la
--   fila de sesión (ACM lee, nunca edita), y eso solo se expresa a nivel de
--   tabla.
--
--   Garantía de datos de REQ-12 (la bitácora NUNCA alimenta el cálculo de
--   estrellas): esta tabla no lleva ninguna referencia estructural hacia el
--   catálogo de indicadores ni hacia las tablas de evaluación por indicador
--   (ni la global ni la class-owned), y no tiene ningún trigger más allá del
--   housekeeping de updated_at. Se blinda con un test Vitest
--   (migration.sesionBitacora.test.js) que falla si el archivo las nombra.
--
--   es_coordinador_acm() usa EXACTAMENTE el SQL resuelto en design.md
--   sección "RLS concreta" (spike 0.1, ya ejecutado): el rol vive en
--   public.profiles.rol (NO existe tabla usuarios), mismo patrón que
--   es_admin(). Valores reales hoy: 'maestro' (8), 'admin' (3);
--   'coordinador_academico' no tiene filas asignadas aún — el helper queda
--   fail-closed (solo 'admin'/'coordinador_academico' pasan) hasta que se
--   asigne ese rol a alguien. Deliberadamente distinto de es_admin()
--   ('admin','inventarista'): un inventarista NUNCA debe leer notas
--   pedagógicas de un maestro.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper: es_coordinador_acm() — SQL EXACTO de design.md "RLS concreta"
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.es_coordinador_acm()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.rol INTO v_role FROM public.profiles p WHERE p.id = auth.uid();
  RETURN COALESCE(v_role IN ('admin', 'coordinador_academico'), FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.es_coordinador_acm() TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. TABLA: sesion_bitacora (design.md Decisión 7, DDL exacto)
-- ----------------------------------------------------------------------------

CREATE TABLE public.sesion_bitacora (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL UNIQUE REFERENCES public.sesiones_clase(id) ON DELETE CASCADE,
  clase_id  uuid NOT NULL REFERENCES public.clases(id)   ON DELETE CASCADE,
  maestro_id uuid NOT NULL REFERENCES public.maestros(id),
  texto_libre text NOT NULL DEFAULT '',
  texto_ia    text,                       -- versión GROQ; requiere aceptación explícita del maestro
  tareas_enviadas boolean NOT NULL DEFAULT false,           tareas_detalle text,
  incidencia_comportamiento boolean NOT NULL DEFAULT false, incidencia_detalle text,
  clase_no_realizada boolean NOT NULL DEFAULT false,        motivo_no_realizada text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sb_clase ON public.sesion_bitacora(clase_id);
CREATE INDEX idx_sb_maestro ON public.sesion_bitacora(maestro_id);

-- ----------------------------------------------------------------------------
-- 3. TRIGGER updated_at — único trigger de esta tabla (housekeeping, mismo
--    patrón que update_cmo_timestamp / update_cmi_timestamp / update_mp_timestamp).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_sb_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sb_updated_at
  BEFORE UPDATE ON public.sesion_bitacora
  FOR EACH ROW EXECUTE FUNCTION public.update_sb_timestamp();

-- ----------------------------------------------------------------------------
-- 4. RLS — owner: titular o suplente registran/editan la bitácora de SU
--    propia sesión. ACM: solo lectura, NUNCA escritura (REQ-16 — sin
--    política de escritura para es_coordinador_acm(), excluye inventarista).
-- ----------------------------------------------------------------------------

ALTER TABLE public.sesion_bitacora ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bitacora_owner" ON public.sesion_bitacora
  FOR ALL TO authenticated
  USING (public.es_maestro_de_clase(clase_id) AND maestro_id = public.maestro_actual())
  WITH CHECK (public.es_maestro_de_clase(clase_id) AND maestro_id = public.maestro_actual());

CREATE POLICY "bitacora_acm_read" ON public.sesion_bitacora
  FOR SELECT TO authenticated
  USING (public.es_coordinador_acm());

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP POLICY IF EXISTS "bitacora_acm_read" ON public.sesion_bitacora;
-- DROP POLICY IF EXISTS "bitacora_owner" ON public.sesion_bitacora;
-- DROP TRIGGER IF EXISTS trg_sb_updated_at ON public.sesion_bitacora;
-- DROP FUNCTION IF EXISTS public.update_sb_timestamp();
-- DROP TABLE IF EXISTS public.sesion_bitacora;
-- DROP FUNCTION IF EXISTS public.es_coordinador_acm();
-- ============================================================================
