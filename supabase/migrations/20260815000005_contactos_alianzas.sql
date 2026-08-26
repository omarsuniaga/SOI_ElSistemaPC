-- ============================================================
-- Migration: Tabla contactos_alianzas — pipeline de alianzas y fundraising
-- Timestamp: 20260815000005
-- Description:
--   Crea la tabla pública contactos_alianzas para gestionar el pipeline
--   de prospectos de alianzas institucionales: fundaciones internacionales,
--   artistas embajadores, redes El Sistema, aliados locales y organismos
--   gubernamentales de El Sistema Punta Cana.
--
--   Estados del pipeline:
--     prospecto → contactado → respondio → en_negociacion
--     → convenio_activo | descartado
--
--   Tipos de contacto:
--     fundacion | artista | aliado_local | gobierno | red
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contactos_alianzas (
  id                    uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_institucion    text        NOT NULL,
  website               text,
  email_contacto        text,
  persona_contacto      text,
  area_enfoque          text,
  programa_relevante    text,
  enfoque_geografico    text,
  puntuacion_match      integer     CHECK (puntuacion_match BETWEEN 1 AND 5),
  notas                 text,
  estado                text        NOT NULL DEFAULT 'prospecto'
                                    CHECK (estado IN (
                                      'prospecto', 'contactado', 'respondio',
                                      'en_negociacion', 'convenio_activo', 'descartado'
                                    )),
  tipo                  text        DEFAULT 'fundacion'
                                    CHECK (tipo IN (
                                      'fundacion', 'artista', 'aliado_local',
                                      'gobierno', 'red'
                                    )),
  fecha_primer_contacto timestamptz,
  fecha_ultima_respuesta timestamptz,
  email_enviado         boolean     DEFAULT false,
  email_draft_id        text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Índices para filtros frecuentes en el Panel de Alianzas
CREATE INDEX IF NOT EXISTS idx_contactos_alianzas_estado
  ON public.contactos_alianzas (estado);

CREATE INDEX IF NOT EXISTS idx_contactos_alianzas_tipo
  ON public.contactos_alianzas (tipo);

CREATE INDEX IF NOT EXISTS idx_contactos_alianzas_match
  ON public.contactos_alianzas (puntuacion_match DESC);

-- Trigger: mantener updated_at sincronizado
CREATE OR REPLACE FUNCTION fn_set_updated_at_contactos_alianzas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contactos_alianzas_updated_at ON public.contactos_alianzas;
CREATE TRIGGER trg_contactos_alianzas_updated_at
  BEFORE UPDATE ON public.contactos_alianzas
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at_contactos_alianzas();

-- RLS: habilitado — solo roles autenticados con rol DIR o admin pueden modificar
ALTER TABLE public.contactos_alianzas ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado puede ver el pipeline
CREATE POLICY "contactos_alianzas_select"
  ON public.contactos_alianzas FOR SELECT
  TO authenticated
  USING (true);

-- Escritura: solo usuarios con rol dir o service_role
CREATE POLICY "contactos_alianzas_insert"
  ON public.contactos_alianzas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (rol IN ('dir', 'admin') OR es_admin = true)
    )
  );

CREATE POLICY "contactos_alianzas_update"
  ON public.contactos_alianzas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (rol IN ('dir', 'admin') OR es_admin = true)
    )
  )
  WITH CHECK (true);

CREATE POLICY "contactos_alianzas_delete"
  ON public.contactos_alianzas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (rol IN ('dir', 'admin') OR es_admin = true)
    )
  );

-- Comentarios de documentación
COMMENT ON TABLE public.contactos_alianzas IS
  'Pipeline de alianzas institucionales de El Sistema Punta Cana: fundaciones, artistas embajadores, redes, aliados locales y organismos de gobierno.';

COMMENT ON COLUMN public.contactos_alianzas.puntuacion_match IS
  'Match 1-5: 5=foco explícito música+LAC+transformación social, 4=música O LAC+social, 3=artes+desarrollo, 2=educación general, 1=lejano.';

COMMENT ON COLUMN public.contactos_alianzas.tipo IS
  'Categoría del contacto: fundacion | artista | aliado_local | gobierno | red';

COMMENT ON COLUMN public.contactos_alianzas.email_draft_id IS
  'ID del borrador en Gmail (Gmail MCP). El borrador debe ser revisado y aprobado por DIR antes de enviar.';
