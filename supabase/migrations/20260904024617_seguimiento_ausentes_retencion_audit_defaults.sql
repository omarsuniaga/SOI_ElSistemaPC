-- Audit de retenciones_instrumento: rellenar retenido_por / levantada_por solos.
-- Aplicado a zmhmdvmyeyswunurcyow via Supabase MCP.

ALTER TABLE public.retenciones_instrumento
  ALTER COLUMN retenido_por SET DEFAULT auth.uid();

CREATE OR REPLACE FUNCTION public.tg_retenciones_levantar()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.estado = 'levantada' AND (OLD.estado IS DISTINCT FROM 'levantada') THEN
    NEW.levantada_por := COALESCE(NEW.levantada_por, auth.uid());
    NEW.levantada_en  := COALESCE(NEW.levantada_en, now());
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_retenciones_levantar ON public.retenciones_instrumento;
CREATE TRIGGER trg_retenciones_levantar BEFORE UPDATE ON public.retenciones_instrumento
  FOR EACH ROW EXECUTE FUNCTION public.tg_retenciones_levantar();

-- ROLLBACK:
--   DROP TRIGGER IF EXISTS trg_retenciones_levantar ON public.retenciones_instrumento;
--   DROP FUNCTION IF EXISTS public.tg_retenciones_levantar();
--   ALTER TABLE public.retenciones_instrumento ALTER COLUMN retenido_por DROP DEFAULT;
