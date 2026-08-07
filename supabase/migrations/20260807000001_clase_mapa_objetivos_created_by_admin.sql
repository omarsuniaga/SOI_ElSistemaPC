-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — permitir autoría ACM/ADM (created_by)
-- Fecha: 2026-08-07
--
-- Contexto: la RLS de clase_mapa_objetivos/clase_mapa_indicadores (migración
-- 20260731000001) ya autoriza a `es_admin()` a hacer FOR ALL sobre ambas
-- tablas — la intención siempre fue que un coordinador ACM pudiera elaborar
-- la planificación de una clase sin maestro asignado. Pero
-- `clase_mapa_objetivos.created_by` quedó `NOT NULL REFERENCES
-- public.maestros(id)`, y un usuario ACM/ADM autenticado como 'admin' no
-- necesariamente tiene una fila en `maestros` — el INSERT revienta con
-- 23502 (not-null violation) antes de que la RLS llegue a evaluarse.
--
-- `created_by` es un campo de autoría/auditoría, no un límite de seguridad
-- (eso ya lo cubre la política `_owner` vía `es_admin()` /
-- `es_maestro_titular_de_clase()`). Se vuelve nullable — NULL se interpreta
-- como "creado por ACM/administración", igual que `origen_objetivo_id IS
-- NULL` ya se interpreta como "autoría 100% del maestro, sin plantilla de
-- origen" en el diseño original.
-- ============================================================================

ALTER TABLE public.clase_mapa_objetivos
  ALTER COLUMN created_by DROP NOT NULL;

COMMENT ON COLUMN public.clase_mapa_objetivos.created_by IS
  'Autor del objetivo (maestros.id). NULL = elaborado por ACM/administración, no por el maestro titular.';
