-- ============================================================================
-- Migration: Vista + RPC del índice de enseñanza guiada por maestro
-- Date: 2026-08-16
--
-- Contexto (openspec/changes/juego-gamificado-planificacion/spec.md, D-01/D-02):
--   Proporción de sesiones de clase donde el maestro registró al menos una
--   evaluación por indicador (maestro_routes/evaluacion_indicador) frente al
--   total de sesiones registradas.
--
--   "Sesión registrada" = sesiones_clase.estado = 'registrada' (la sesión ya
--   se dictó y se documentó — auditoría de datos reales confirmó que las 53
--   filas con ese estado tienen borrador=false, mientras que 'programada'/
--   'pendiente' son mayoritariamente borrador=true: sesiones futuras o sin
--   documentar todavía. Contarlas penalizaría el índice de un maestro por
--   clases que ni siquiera ha dictado).
--
--   evaluacion_indicador no tiene FK directa a sesiones_clase (no hay
--   sesion_id) — el cruce es por (clase_id, fecha), mismo patrón ya usado en
--   getPromediosPorIndicador (PR1, maestroRouteService.js).
--
-- Decisión de acceso (más estricta que el precedente vw_clase_objetivo_estrellas
-- de Sistema A, que es una vista abierta sin wrapper): esta vista agrega datos
-- COMPARATIVOS de TODOS los maestros de la institución — exactamente el tipo
-- de dato que D-02 exige que NUNCA sea visible entre maestros. Las vistas en
-- este proyecto son propiedad de `postgres` (bypassa RLS de las tablas base),
-- así que un GRANT SELECT directo sobre la vista expondría el índice de TODOS
-- los maestros a CUALQUIER usuario autenticado que la consulte directo (aunque
-- la UI nunca la muestre así). Se envuelve en una función SECURITY DEFINER que
-- valida es_admin() OR es_coordinador_acm() antes de devolver filas — el
-- cliente consume `fn_get_indice_ensenanza_guiada()` vía RPC, no la vista
-- directo.
-- ============================================================================

CREATE OR REPLACE VIEW vw_indice_ensenanza_guiada AS
SELECT
  sc.maestro_id,
  count(DISTINCT sc.id)::integer AS total_sesiones,
  count(DISTINCT sc.id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM evaluacion_indicador ei
      WHERE ei.clase_id = sc.clase_id
        AND ei.maestro_indicador_id IS NOT NULL
        AND ei.fecha_evaluacion::date = sc.fecha
    )
  )::integer AS sesiones_con_indicador,
  ROUND(
    count(DISTINCT sc.id) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM evaluacion_indicador ei
        WHERE ei.clase_id = sc.clase_id
          AND ei.maestro_indicador_id IS NOT NULL
          AND ei.fecha_evaluacion::date = sc.fecha
      )
    )::numeric / NULLIF(count(DISTINCT sc.id), 0),
    4
  ) AS indice
FROM sesiones_clase sc
WHERE sc.estado = 'registrada'
GROUP BY sc.maestro_id;

CREATE OR REPLACE FUNCTION fn_get_indice_ensenanza_guiada()
RETURNS SETOF vw_indice_ensenanza_guiada
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (es_admin() OR es_coordinador_acm()) THEN
    RAISE EXCEPTION 'No autorizado para consultar el índice de enseñanza guiada';
  END IF;

  RETURN QUERY SELECT * FROM vw_indice_ensenanza_guiada;
END;
$$;

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP FUNCTION IF EXISTS fn_get_indice_ensenanza_guiada();
-- DROP VIEW IF EXISTS vw_indice_ensenanza_guiada;
-- ============================================================================
