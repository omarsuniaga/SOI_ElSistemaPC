-- ============================================================================
-- Seguimiento de Alumnos Ausentes -- Fase 1a (fundaciones)
-- Aditivo. Aplicado a zmhmdvmyeyswunurcyow via Supabase MCP.
-- Rollback al final del archivo (comentado).
-- ============================================================================

-- 1. Helper: normaliza telefono a formato RD (+1 8XX XXX XXXX) o NULL si invalido
CREATE OR REPLACE FUNCTION public.normalizar_tel_rd(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN d ~ '^1(809|829|849)[0-9]{7}$' THEN '+' || d
    WHEN d ~ '^(809|829|849)[0-9]{7}$'  THEN '+1' || d
    ELSE NULL
  END
  FROM (SELECT regexp_replace(coalesce(raw, ''), '[^0-9]', '', 'g') AS d) x
$$;

COMMENT ON FUNCTION public.normalizar_tel_rd(text) IS
  'Normaliza un telefono a formato E.164 dominicano (+1809/829/849 + 7 digitos). NULL si no es un numero RD plausible. Espejo de normalizarTelefonoRD() en seguimientoAusentesService.js.';

-- 2. Tabla: retenciones de instrumento (nivel 3 del escalamiento)
CREATE TABLE IF NOT EXISTS public.retenciones_instrumento (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id                     uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  instrumento_id                uuid REFERENCES public.instrumentos(id) ON DELETE SET NULL,
  instrumento_texto             text,
  motivo                        text NOT NULL DEFAULT 'ausentismo_acumulado',
  estado                        text NOT NULL DEFAULT 'retenido'
                                  CHECK (estado IN ('retenido', 'levantada')),
  retenido_por                  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  retenido_en                   timestamptz NOT NULL DEFAULT now(),
  maestro_notificado_en         timestamptz,
  maestro_confirmo_recogida_en  timestamptz,
  acta_firmada_en               timestamptz,
  fecha_reincorporacion         timestamptz,
  levantada_por                 uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  levantada_en                  timestamptz,
  notas                         text,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.retenciones_instrumento IS
  'Retencion temporal del instrumento de un alumno por ausentismo acumulado (nivel 3). Independiente del inventario instrumentos: instrumento_texto sirve cuando no hay fila formal. fecha_reincorporacion reinicia el contador de ausencias del alumno para el periodo.';

CREATE INDEX IF NOT EXISTS idx_retenciones_alumno   ON public.retenciones_instrumento (alumno_id);
CREATE INDEX IF NOT EXISTS idx_retenciones_retenido ON public.retenciones_instrumento (alumno_id) WHERE estado = 'retenido';

ALTER TABLE public.retenciones_instrumento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS retenciones_select_auth ON public.retenciones_instrumento;
CREATE POLICY retenciones_select_auth ON public.retenciones_instrumento
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS retenciones_write_admin ON public.retenciones_instrumento;
CREATE POLICY retenciones_write_admin ON public.retenciones_instrumento
  FOR ALL TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.retenciones_instrumento TO authenticated;

-- trigger updated_at
CREATE OR REPLACE FUNCTION public.tg_retenciones_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_retenciones_touch ON public.retenciones_instrumento;
CREATE TRIGGER trg_retenciones_touch BEFORE UPDATE ON public.retenciones_instrumento
  FOR EACH ROW EXECUTE FUNCTION public.tg_retenciones_touch();

-- 3. comunicaciones_seguimiento: columnas nivel + origen
ALTER TABLE public.comunicaciones_seguimiento
  ADD COLUMN IF NOT EXISTS nivel  smallint,
  ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'manual';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comunicaciones_seguimiento_origen_chk'
  ) THEN
    ALTER TABLE public.comunicaciones_seguimiento
      ADD CONSTRAINT comunicaciones_seguimiento_origen_chk
      CHECK (origen IN ('manual', 'ausentismo', 'hermes', 'otro'));
  END IF;
END $$;

COMMENT ON COLUMN public.comunicaciones_seguimiento.nivel  IS 'Nivel de escalamiento (1-3) cuando origen = ausentismo.';
COMMENT ON COLUMN public.comunicaciones_seguimiento.origen IS 'Origen del contacto: manual | ausentismo | hermes | otro.';

-- 4. Regla de escalamiento por ausentismo acumulado (umbrales configurables)
INSERT INTO public.seguimiento_reglas (nombre, tipo, descripcion, config, activo, prioridad)
SELECT
  'Ausentismo acumulado',
  'ausentismo_acumulado',
  'Escalamiento de contacto por dias de ausencia injustificada acumulados en el periodo academico. Nivel 1: aviso al representante. Nivel 2: comunicacion institucional. Nivel 3: retencion del instrumento.',
  '{"periodo":"academico","nivel1":1,"nivel2":2,"nivel3":3,"contar_justificadas":false}'::jsonb,
  true,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM public.seguimiento_reglas WHERE tipo = 'ausentismo_acumulado'
);

-- ============================================================================
-- ROLLBACK (manual):
--   DROP TRIGGER IF EXISTS trg_retenciones_touch ON public.retenciones_instrumento;
--   DROP FUNCTION IF EXISTS public.tg_retenciones_touch();
--   DROP TABLE IF EXISTS public.retenciones_instrumento;
--   ALTER TABLE public.comunicaciones_seguimiento
--     DROP CONSTRAINT IF EXISTS comunicaciones_seguimiento_origen_chk,
--     DROP COLUMN IF EXISTS nivel, DROP COLUMN IF EXISTS origen;
--   DELETE FROM public.seguimiento_reglas WHERE tipo = 'ausentismo_acumulado';
--   DROP FUNCTION IF EXISTS public.normalizar_tel_rd(text);
-- ============================================================================
