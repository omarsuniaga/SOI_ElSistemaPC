-- ============================================================
-- Migration: Tabla contactos_alianzas — Panel de Alianzas (DIR)
-- Timestamp: 20260815000005
-- Description:
--   Crea la tabla contactos_alianzas usada por src/modules/alianzas
--   (alianzasApi.js, alianzasView.js). Se detectó durante auditoría de
--   código que el feature no tenía migración versionada: la tabla debía
--   existir ya en producción (creada fuera de control de versiones), por
--   lo que este CREATE es idempotente (IF NOT EXISTS) y no pisa datos
--   existentes.
--
--   Valores válidos (documentados en CLAUDE.md del proyecto):
--     tipo:   fundacion | artista | aliado_local | gobierno | red
--     estado: prospecto | contactado | respondio | en_negociacion |
--             convenio_activo | descartado
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contactos_alianzas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_institucion  text NOT NULL,
  tipo                text NOT NULL DEFAULT 'fundacion'
                        CHECK (tipo IN ('fundacion', 'artista', 'aliado_local', 'gobierno', 'red')),
  estado              text NOT NULL DEFAULT 'prospecto'
                        CHECK (estado IN ('prospecto', 'contactado', 'respondio', 'en_negociacion', 'convenio_activo', 'descartado')),
  puntuacion_match    smallint NOT NULL DEFAULT 3 CHECK (puntuacion_match BETWEEN 1 AND 5),
  area_enfoque        text,
  enfoque_geografico  text,
  email_contacto      text,
  persona_contacto    text,
  website             text,
  notas               text,
  email_draft_id      text, -- ID del borrador de Gmail (si se generó uno)
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contactos_alianzas_estado ON public.contactos_alianzas (estado);
CREATE INDEX IF NOT EXISTS idx_contactos_alianzas_tipo ON public.contactos_alianzas (tipo);

ALTER TABLE public.contactos_alianzas ENABLE ROW LEVEL SECURITY;

-- Mismo patrón permisivo usado por las demás tablas de Hermes
-- (calendario_institucional, tareas_institucionales, hermes_protocolos):
-- el control de acceso se resuelve en la capa de aplicación (portal DIR).
DROP POLICY IF EXISTS allow_all_contactos_alianzas ON public.contactos_alianzas;
CREATE POLICY allow_all_contactos_alianzas ON public.contactos_alianzas FOR ALL USING (true) WITH CHECK (true);
