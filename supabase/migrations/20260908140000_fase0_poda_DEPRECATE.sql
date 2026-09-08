-- ==============================================================================
-- FASE 0 · PODA: DEPRECACIÓN FORMAL DE TABLAS ARCHIVADAS (Tarea 0.2)
-- ==============================================================================
-- Fecha: 2026-09-08
-- Autorización: Omar Suniaga (Owner)
-- Auditoría técnica: Lila (Senior Technical Auditor & Architect)
-- Estatus: PRESERVACIÓN ESTRUCTURAL (No se elimina ninguna fila ni objeto)
-- Propósito: Documentar formalmente en el catálogo de PostgreSQL (pg_description)
--            el estado de archivado/deprecación de las 13 tablas seleccionadas
--            para prevenir que nuevos desarrollos se acoplen a estos esquemas.
-- ==============================================================================

BEGIN;

-- 1. accesorios (Owner: LUT)
-- Justificación: Concepto de valor futuro para lutería e inventario.
COMMENT ON TABLE public.accesorios IS 
'-- DEPRECATED: conservada para rediseño de inventario lutería 2026-09 (Owner: LUT)';

-- 2. schedule_runs (Owner: ACM)
-- Justificación: Motor algorítmico de generación de horarios pausado en este ciclo.
COMMENT ON TABLE public.schedule_runs IS 
'-- DEPRECATED: motor algorítmico de horarios pausado 2026-09 (Owner: ACM)';

-- 3. schedule_run_feedback (Owner: ACM)
-- Justificación: Telemetría del motor de horarios pausada.
COMMENT ON TABLE public.schedule_run_feedback IS 
'-- DEPRECATED: telemetría de horarios pausada 2026-09 (Owner: ACM)';

-- 4. document_batches (Owner: DIR/ADM)
-- Justificación: Emisión documental institucional por lote diferida; no crítica.
COMMENT ON TABLE public.document_batches IS 
'-- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)';

-- 5. generated_documents (Owner: DIR/ADM)
-- Justificación: Archivo histórico documental diferido.
COMMENT ON TABLE public.generated_documents IS 
'-- DEPRECATED: generador documental institucional diferido 2026-09 (Owner: DIR/ADM)';

-- 6. alumno_escolaridad (Owner: DIR/ADM)
-- Justificación: Datos escolares secundarios diferidos.
COMMENT ON TABLE public.alumno_escolaridad IS 
'-- DEPRECATED: datos escolares secundarios diferidos 2026-09 (Owner: DIR/ADM)';

-- 7. catalogo_objetivos_especificos (Owner: ACM)
-- Justificación: Plantilla curricular legacy en BD en evaluación; verificar desacople de RPCs.
COMMENT ON TABLE public.catalogo_objetivos_especificos IS 
'-- DEPRECATED: plantilla curricular legacy en evaluación 2026-09 (Owner: ACM)';

-- 8. clase_mapa_indicadores (Owner: ACM)
-- Justificación: Jerarquía curricular legacy en BD; verificar reemplazo por Gen-2.
COMMENT ON TABLE public.clase_mapa_indicadores IS 
'-- DEPRECATED: jerarquía legacy en evaluación 2026-09 (Owner: ACM)';

-- 9. clase_mapa_objetivos (Owner: ACM)
-- Justificación: Objetivos jerárquicos legacy en BD; verificar reemplazo por Gen-2.
COMMENT ON TABLE public.clase_mapa_objetivos IS 
'-- DEPRECATED: objetivos legacy en evaluación 2026-09 (Owner: ACM)';

-- 10. mapa_plantillas (Owner: ACM)
-- Justificación: Plantillas curriculares legacy en BD; verificar reemplazo por Gen-2.
COMMENT ON TABLE public.mapa_plantillas IS 
'-- DEPRECATED: plantillas legacy en evaluación 2026-09 (Owner: ACM)';

-- 11. rachas (Owner: ACM)
-- Justificación: Gamificación pedagógica reservada para fases futuras.
COMMENT ON TABLE public.rachas IS 
'-- DEPRECATED: gamificación pedagógica en pausa 2026-09 (Owner: ACM)';

-- 12. protocolos (Owner: DIR/HERMES)
-- Justificación: Infraestructura institucional reservada para orquestación Hermes.
COMMENT ON TABLE public.protocolos IS 
'-- DEPRECATED: infraestructura base para Hermes en reserva 2026-09 (Owner: DIR/HERMES)';

-- 13. minutas (Owner: DIR)
-- Justificación: FK entrante desde tareas_institucionales (198 registros); archivada para evitar alterar tabla activa (Opción B de Omar).
COMMENT ON TABLE public.minutas IS 
'-- DEPRECATED: conservada por integridad referencial desde tareas_institucionales 2026-09 (Owner: DIR)';

COMMIT;
