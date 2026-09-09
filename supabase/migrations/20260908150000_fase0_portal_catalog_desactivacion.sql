-- ==============================================================================
-- FASE 0 · T0.4a / T0.4b: DESACTIVACIÓN Y FUSIÓN CONTROLADA EN PORTAL_CATALOG
-- ==============================================================================
-- Fecha: 2026-09-08
-- Autorización: Omar Suniaga (Owner - Veredicto FASE 0 T0.4)
-- Auditoría técnica: Lila (Senior Technical Auditor & Architect)
-- Estatus: AJUSTE DE GOBERNANZA DE PORTALES (No destructivo)
--
-- DECISIONES OFICIALES:
-- 1. AUD (Audiciones): DESACTIVAR (activo=false, is_active=false).
--    El concepto de audiciones pertenece al dominio pero no justifica portal autónomo.
-- 2. TEC (Técnico): FUSIONAR (activo=false, is_active=false).
--    Sus herramientas pasan conceptualmente a ADM -> Configuración / Sistema.
-- 3. COM (Comunicaciones): DESACTIVAR PROVISIONALMENTE (activo=false, is_active=false).
--    COM sigue siendo departamento CORE de SOI; se congela el portal cascarón hasta
--    que cuente con implementación productiva completa.
-- ==============================================================================

BEGIN;

UPDATE public.portal_catalog
SET 
  activo = false,
  is_active = false,
  updated_at = now()
WHERE portal_id IN ('AUD', 'TEC', 'COM');

COMMIT;
