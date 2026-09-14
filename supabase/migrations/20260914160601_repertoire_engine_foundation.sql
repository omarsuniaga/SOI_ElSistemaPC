-- Phase 1: Repertoire & Orchestral Preparation Engine foundation.
-- Local migration only: do not apply to production without explicit approval.

BEGIN;

CREATE TYPE public.montaje_estado AS ENUM (
  'PLANIFICADO', 'EN_LECTURA', 'EN_MONTAJE', 'CONSOLIDANDO', 'LISTO', 'ESTRENADO', 'ARCHIVADO'
);

CREATE TYPE public.aplicabilidad_compas AS ENUM ('TOCA', 'SILENCIO', 'TACET', 'NO_APLICA', 'DESCONOCIDO');
CREATE TYPE public.estado_preparacion AS ENUM ('SIN_EVALUAR', 'SIN_ESTUDIAR', 'CON_DIFICULTAD', 'DOMINADO', 'CONSOLIDADO');

CREATE TABLE IF NOT EXISTS public.obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  titulo_original text,
  compositor text,
  arreglista text,
  catalogo text,
  tonalidad text,
  epoca text,
  anio_composicion integer CHECK (anio_composicion IS NULL OR anio_composicion BETWEEN -5000 AND 3000),
  duracion_estimada_minutos numeric(6,2) CHECK (duracion_estimada_minutos IS NULL OR duracion_estimada_minutos >= 0),
  resena text,
  contexto_historico text,
  notas_pedagogicas text,
  fuentes_bibliograficas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.obra_versiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  editorial text,
  arreglista text,
  descripcion text,
  numero_compases integer CHECK (numero_compases IS NULL OR numero_compases >= 0),
  duracion_estimada_minutos numeric(6,2) CHECK (duracion_estimada_minutos IS NULL OR duracion_estimada_minutos >= 0),
  partitura_general_url text,
  musicxml_url text,
  notas text,
  activo boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT obra_versiones_obra_nombre_uk UNIQUE (obra_id, nombre)
);

CREATE TABLE IF NOT EXISTS public.montajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_version_id uuid NOT NULL REFERENCES public.obra_versiones(id) ON DELETE RESTRICT,
  evento_id uuid REFERENCES public.eventos_conciertos(id) ON DELETE SET NULL,
  nucleo text,
  conjunto text,
  director_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  coordinador_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  fecha_inicio date,
  fecha_objetivo date,
  prioridad smallint NOT NULL DEFAULT 0 CHECK (prioridad BETWEEN 0 AND 3),
  tempo_objetivo integer CHECK (tempo_objetivo IS NULL OR tempo_objetivo > 0),
  estado public.montaje_estado NOT NULL DEFAULT 'PLANIFICADO',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montajes_fechas_validas CHECK (fecha_objetivo IS NULL OR fecha_inicio IS NULL OR fecha_objetivo >= fecha_inicio)
);

CREATE TABLE IF NOT EXISTS public.montaje_secciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE CASCADE,
  section_id text REFERENCES public.sections(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_secciones_nombre_uk UNIQUE (montaje_id, nombre)
);

CREATE TABLE IF NOT EXISTS public.montaje_filas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_seccion_id uuid NOT NULL REFERENCES public.montaje_secciones(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  instrumento_id uuid REFERENCES public.instrumentos(id) ON DELETE SET NULL,
  orden integer NOT NULL DEFAULT 0,
  responsable_maestro_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_filas_nombre_uk UNIQUE (montaje_seccion_id, nombre)
);

CREATE TABLE IF NOT EXISTS public.montaje_alumnos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_fila_id uuid NOT NULL REFERENCES public.montaje_filas(id) ON DELETE CASCADE,
  alumno_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  responsable_maestro_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_alumnos_uk UNIQUE (montaje_fila_id, alumno_id)
);

CREATE TABLE IF NOT EXISTS public.obra_compases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_version_id uuid NOT NULL REFERENCES public.obra_versiones(id) ON DELETE CASCADE,
  indice_interno integer NOT NULL CHECK (indice_interno >= 0),
  numero_visible text NOT NULL,
  orden integer NOT NULL CHECK (orden >= 0),
  letra_ensayo text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT obra_compases_indice_uk UNIQUE (obra_version_id, indice_interno),
  CONSTRAINT obra_compases_orden_uk UNIQUE (obra_version_id, orden)
);

CREATE TABLE IF NOT EXISTS public.montaje_compases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE CASCADE,
  compas_id uuid NOT NULL REFERENCES public.obra_compases(id) ON DELETE CASCADE,
  aplicabilidad public.aplicabilidad_compas NOT NULL DEFAULT 'DESCONOCIDO',
  estado_preparacion public.estado_preparacion NOT NULL DEFAULT 'SIN_EVALUAR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_compases_uk UNIQUE (montaje_id, compas_id)
);

CREATE TABLE IF NOT EXISTS public.catalogo_estados_preparacion (
  codigo public.estado_preparacion PRIMARY KEY,
  orden smallint NOT NULL UNIQUE,
  etiqueta text NOT NULL,
  descripcion text NOT NULL,
  color_token text
);

INSERT INTO public.catalogo_estados_preparacion (codigo, orden, etiqueta, descripcion, color_token)
VALUES
  ('SIN_EVALUAR', 0, 'Sin evaluar', 'No existe evidencia verificada de preparación.', 'neutral'),
  ('SIN_ESTUDIAR', 1, 'Sin estudiar', 'Se lee como material nuevo o sin reconocimiento estable.', 'danger'),
  ('CON_DIFICULTAD', 2, 'Con dificultad', 'Ha sido trabajado, pero persisten dificultades técnicas o musicales.', 'warning'),
  ('DOMINADO', 3, 'Dominado', 'Se ejecuta de forma fiable, con detalles de refinamiento pendientes.', 'caution'),
  ('CONSOLIDADO', 4, 'Consolidado', 'Se ejecuta fiable conforme al objetivo actual de preparación.', 'success')
ON CONFLICT (codigo) DO UPDATE SET
  orden = EXCLUDED.orden,
  etiqueta = EXCLUDED.etiqueta,
  descripcion = EXCLUDED.descripcion,
  color_token = EXCLUDED.color_token;

CREATE INDEX IF NOT EXISTS idx_obra_versiones_obra ON public.obra_versiones(obra_id);
CREATE INDEX IF NOT EXISTS idx_montajes_evento ON public.montajes(evento_id);
CREATE INDEX IF NOT EXISTS idx_montajes_estado ON public.montajes(estado);
CREATE INDEX IF NOT EXISTS idx_montaje_secciones_montaje ON public.montaje_secciones(montaje_id, orden);
CREATE INDEX IF NOT EXISTS idx_montaje_filas_seccion ON public.montaje_filas(montaje_seccion_id, orden);
CREATE INDEX IF NOT EXISTS idx_montaje_alumnos_alumno ON public.montaje_alumnos(alumno_id);
CREATE INDEX IF NOT EXISTS idx_obra_compases_version ON public.obra_compases(obra_version_id, orden);
CREATE INDEX IF NOT EXISTS idx_montaje_compases_montaje ON public.montaje_compases(montaje_id);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['obras','obra_versiones','montajes','montaje_secciones','montaje_filas','montaje_alumnos','obra_compases','montaje_compases','catalogo_estados_preparacion'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS repertoire_acm_read ON public.%I', t);
    EXECUTE format('CREATE POLICY repertoire_acm_read ON public.%I FOR SELECT TO authenticated USING (get_user_department() = ''ACM'' OR get_user_role() = ANY (ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica'']))', t);
    EXECUTE format('DROP POLICY IF EXISTS repertoire_acm_write ON public.%I', t);
    EXECUTE format('CREATE POLICY repertoire_acm_write ON public.%I FOR ALL TO authenticated USING (get_user_department() = ''ACM'' OR get_user_role() = ANY (ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica''])) WITH CHECK (get_user_department() = ''ACM'' OR get_user_role() = ANY (ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica'']))', t);
  END LOOP;
END $$;

COMMENT ON TABLE public.obras IS 'Obra musical permanente; no contiene estados de preparación de un montaje.';
COMMENT ON TABLE public.montajes IS 'Preparación operacional de una versión de obra para un ciclo/evento específico.';
COMMENT ON TABLE public.montaje_compases IS 'Estado de preparación por compás dentro de un montaje; aplicabilidad es independiente del estado.';

COMMIT;
