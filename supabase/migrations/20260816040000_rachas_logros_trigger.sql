-- ============================================================================
-- Migration: Gamificación conectada a evaluaciones reales — rachas y logros
-- Date: 2026-08-16
--
-- Contexto (openspec/changes/juego-gamificado-planificacion/spec.md, B-01/B-02):
--   `rachas`/`logros`/`alumnos_logros` ya existían como schema (seed de 3
--   logros), pero nada las alimentaba desde una evaluación real. Este PR
--   conecta ambas vía un trigger sobre `evaluacion_indicador`.
--
--   Auditoría de los 3 logros seedeados (SELECT nombre, criterio FROM logros)
--   confirmó que NO usan los tipos de criterio anticipados en spec.md
--   (`primer_objetivo_completado`, `primero_en_desbloquear_objetivo`) sino:
--     - {"tipo": "asistencia", "valor": 1}          → "Primera asistencia"
--     - {"tipo": "ejercicio_aprobado", "valor": 1}   → "Primer ejercicio completado"
--     - {"tipo": "asistencias_totales", "valor": 5}  → "Constancia inicial"
--   fn_evaluar_logros_alumno soporta AMBOS conjuntos: los 3 tipos reales ya
--   sembrados, y los 2 tipos del spec (para logros institucionales futuros
--   ligados a maestro_routes/evaluacion_indicador).
--
--   Desviaciones documentadas respecto a tasks.md:
--   1. `fn_actualizar_racha_alumno` recibe `p_clase_id` (no solo alumno+fecha):
--      `rachas` es una fila GLOBAL por alumno (PK alumno_id, sin clase_id),
--      pero "hubo una clase programada" solo puede evaluarse contra UNA clase
--      concreta. Se usa la clase de la evaluación que dispara el trigger — una
--      simplificación razonable dado que cada alumno de El Sistema Punta Cana
--      normalmente cursa un instrumento principal. Si un alumno con 2+ clases
--      alterna evaluaciones entre ellas, esta racha puede reiniciarse de forma
--      conservadora (falso negativo), nunca de forma incorrecta hacia arriba.
--   2. El trigger es `AFTER INSERT OR UPDATE OF nota, recovery_status` (no solo
--      INSERT): `saveIndicadorNota`/`updateRecoveryStatus` en
--      maestroDataService.js hacen UPSERT sobre
--      (alumno_id, maestro_indicador_id, clase_id) — un re-calificado (ej.
--      corregir 2 estrellas a 4) es un UPDATE, no un INSERT. Un trigger
--      solo-INSERT nunca dispararía en ese caso, muy común en el flujo real.
-- ============================================================================

-- ── fn_actualizar_racha_alumno ───────────────────────────────────────────
-- Días de ACTIVIDAD consecutiva (no de calendario continuo): un día sin
-- clase programada de `p_clase_id` no rompe la racha; faltar a una clase
-- programada intermedia sí la reinicia.

CREATE OR REPLACE FUNCTION fn_actualizar_racha_alumno(
  p_alumno_id uuid,
  p_fecha date,
  p_clase_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_racha RECORD;
  v_prev_sesion_fecha date;
BEGIN
  IF p_alumno_id IS NULL OR p_fecha IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_racha FROM rachas WHERE alumno_id = p_alumno_id;

  IF NOT FOUND THEN
    INSERT INTO rachas (alumno_id, racha_actual, racha_maxima, ultima_fecha_activa)
    VALUES (p_alumno_id, 1, 1, p_fecha);
    RETURN;
  END IF;

  -- Ya contado para esta fecha (varios indicadores evaluados en la misma
  -- sesión, o una evaluación retroactiva a una fecha anterior/igual).
  IF p_fecha <= v_racha.ultima_fecha_activa THEN
    RETURN;
  END IF;

  SELECT MAX(fecha) INTO v_prev_sesion_fecha
  FROM sesiones_clase
  WHERE clase_id = p_clase_id AND fecha < p_fecha;

  IF v_prev_sesion_fecha IS NULL OR v_prev_sesion_fecha = v_racha.ultima_fecha_activa THEN
    UPDATE rachas
    SET racha_actual = v_racha.racha_actual + 1,
        racha_maxima = GREATEST(v_racha.racha_maxima, v_racha.racha_actual + 1),
        ultima_fecha_activa = p_fecha,
        updated_at = now()
    WHERE alumno_id = p_alumno_id;
  ELSE
    UPDATE rachas
    SET racha_actual = 1,
        ultima_fecha_activa = p_fecha,
        updated_at = now()
    WHERE alumno_id = p_alumno_id;
  END IF;
END;
$$;

-- ── fn_evaluar_logros_alumno ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_evaluar_logros_alumno(p_alumno_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_logro RECORD;
  v_tipo text;
  v_valor int;
  v_cumple boolean;
BEGIN
  IF p_alumno_id IS NULL THEN
    RETURN;
  END IF;

  FOR v_logro IN SELECT id, criterio FROM logros WHERE activo = true LOOP
    v_tipo := v_logro.criterio->>'tipo';
    v_valor := COALESCE((v_logro.criterio->>'valor')::int, 1);
    v_cumple := false;

    IF v_tipo IN ('asistencia', 'asistencias_totales') THEN
      SELECT count(*) >= v_valor INTO v_cumple
      FROM asistencias
      WHERE alumno_id = p_alumno_id AND estado = 'presente';

    ELSIF v_tipo = 'ejercicio_aprobado' THEN
      SELECT count(*) >= v_valor INTO v_cumple
      FROM evaluacion_indicador
      WHERE alumno_id = p_alumno_id AND maestro_indicador_id IS NOT NULL AND nota >= 3;

    ELSIF v_tipo = 'primer_objetivo_completado' THEN
      -- "Para todo" vía doble NOT EXISTS: existe un objetivo (con al menos
      -- un indicador) donde NINGÚN indicador está sin satisfacer.
      SELECT EXISTS (
        SELECT 1
        FROM maestro_objetivos mo
        WHERE EXISTS (SELECT 1 FROM maestro_indicadores mi2 WHERE mi2.objetivo_id = mo.id)
        AND NOT EXISTS (
          SELECT 1 FROM maestro_indicadores mi
          WHERE mi.objetivo_id = mo.id
          AND NOT EXISTS (
            SELECT 1 FROM evaluacion_indicador ei
            WHERE ei.maestro_indicador_id = mi.id AND ei.alumno_id = p_alumno_id
            AND (ei.nota >= 3 OR ei.recovery_status = 'recuperado')
          )
        )
      ) INTO v_cumple;

    ELSIF v_tipo = 'primero_en_desbloquear_objetivo' THEN
      -- Entre los alumnos que completaron el MISMO objetivo, ¿p_alumno_id
      -- fue el que lo completó más temprano (o empatado, sin otro antes)?
      WITH indicador_satisfecho AS (
        SELECT mi.objetivo_id, mi.id AS indicador_id, ei.alumno_id, MIN(ei.fecha_evaluacion) AS fecha_satisfecho
        FROM maestro_indicadores mi
        JOIN evaluacion_indicador ei ON ei.maestro_indicador_id = mi.id
        WHERE ei.nota >= 3 OR ei.recovery_status = 'recuperado'
        GROUP BY mi.objetivo_id, mi.id, ei.alumno_id
      ),
      objetivo_completo AS (
        SELECT s.objetivo_id, s.alumno_id, MAX(s.fecha_satisfecho) AS fecha_completo
        FROM indicador_satisfecho s
        GROUP BY s.objetivo_id, s.alumno_id
        HAVING COUNT(*) = (SELECT COUNT(*) FROM maestro_indicadores mi3 WHERE mi3.objetivo_id = s.objetivo_id)
      )
      SELECT EXISTS (
        SELECT 1 FROM objetivo_completo oc
        WHERE oc.alumno_id = p_alumno_id
        AND oc.fecha_completo <= ALL (
          SELECT oc2.fecha_completo FROM objetivo_completo oc2
          WHERE oc2.objetivo_id = oc.objetivo_id AND oc2.alumno_id <> p_alumno_id
        )
      ) INTO v_cumple;
    END IF;

    IF v_cumple THEN
      INSERT INTO alumnos_logros (alumno_id, logro_id)
      VALUES (p_alumno_id, v_logro.id)
      ON CONFLICT (alumno_id, logro_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- ── Trigger ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_trigger_evaluacion_gamificacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.maestro_indicador_id IS NOT NULL THEN
    PERFORM fn_actualizar_racha_alumno(NEW.alumno_id, COALESCE(NEW.fecha_evaluacion::date, CURRENT_DATE), NEW.clase_id);
    PERFORM fn_evaluar_logros_alumno(NEW.alumno_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evaluacion_indicador_gamificacion ON evaluacion_indicador;
CREATE TRIGGER trg_evaluacion_indicador_gamificacion
  AFTER INSERT OR UPDATE OF nota, recovery_status ON evaluacion_indicador
  FOR EACH ROW
  EXECUTE FUNCTION fn_trigger_evaluacion_gamificacion();

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP TRIGGER IF EXISTS trg_evaluacion_indicador_gamificacion ON evaluacion_indicador;
-- DROP FUNCTION IF EXISTS fn_trigger_evaluacion_gamificacion();
-- DROP FUNCTION IF EXISTS fn_evaluar_logros_alumno(uuid);
-- DROP FUNCTION IF EXISTS fn_actualizar_racha_alumno(uuid, date, uuid);
-- ============================================================================
