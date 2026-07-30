-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — ID jerárquico inmutable (Tarea 1.2)
-- Fecha: 2026-07-31
-- Contexto (openspec/changes/mapa-gamificado-planificacion/design.md, Decisión 3,
--   REQ-04): el ID jerárquico ('Nivel.Objetivo.Indicador', ej. '2.1.3') se
--   materializa en `clase_mapa_indicadores.id_jerarquico` vía trigger BEFORE
--   INSERT (no puede ser GENERATED ALWAYS AS porque necesita leer
--   `levels.level_number` y `clase_mapa_objetivos.orden_objetivo`, columnas de
--   otra tabla — las columnas generadas de Postgres deben ser IMMUTABLE y de
--   una sola fila). Reordenar visualmente escribe `order_index` únicamente —
--   nunca `orden_objetivo`/`orden_indicador`; esa separación es la que hace
--   cumplir "reordenar MUST NOT renumerar".
--
-- Referencia adelantada deliberada (ver comentarios inline más abajo):
--   `evaluacion_indicador.clase_indicador_id` todavía NO existe en el momento
--   en que esta migración se aplica (se agrega en
--   20260731000003_evaluacion_indicador_clase_scope.sql, Tarea 1.3, orden fijo
--   1 -> 2 -> 3). Para no arriesgar que `CREATE FUNCTION` falle por una
--   referencia a una columna que aún no existe en el catálogo en ese punto de
--   la secuencia de migraciones, esa comprobación puntual se hace con SQL
--   dinámico (EXECUTE), que Postgres NO valida contra el catálogo hasta la
--   primera ejecución real (momento en el que la migración #3 ya se aplicó).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper (no trigger): datos denormalizados del objetivo padre, reutilizado
--    por fn_asignar_id_jerarquico() y fn_bloquear_id_jerarquico() para no
--    duplicar el mismo JOIN dos veces.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_datos_jerarquicos_de_objetivo(p_objetivo_id uuid)
RETURNS TABLE(clase_id uuid, level_number integer, orden_objetivo integer)
LANGUAGE sql STABLE AS $$
  SELECT cmo.clase_id, l.level_number, cmo.orden_objetivo
  FROM public.clase_mapa_objetivos cmo
  JOIN public.levels l ON l.id = cmo.level_id
  WHERE cmo.id = p_objetivo_id;
$$;

-- ----------------------------------------------------------------------------
-- 2. fn_asignar_id_jerarquico() — BEFORE INSERT ON clase_mapa_indicadores.
--    - Si orden_indicador IS NULL: MAX(orden_indicador)+1 dentro del objetivo.
--    - Materializa id_jerarquico := level_number || '.' || orden_objetivo || '.' || orden_indicador.
--    - Fuerza clase_id desde el objetivo padre (coherencia de la denormalización,
--      Decisión 1): nunca se confía en el valor que mande el cliente.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_asignar_id_jerarquico()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_datos record;
BEGIN
  SELECT * INTO v_datos FROM public.fn_datos_jerarquicos_de_objetivo(NEW.objetivo_id);

  IF v_datos.clase_id IS NULL THEN
    RAISE EXCEPTION 'SOI-MAPA-03: objetivo_id % no existe en clase_mapa_objetivos', NEW.objetivo_id;
  END IF;

  NEW.clase_id := v_datos.clase_id;

  IF NEW.orden_indicador IS NULL THEN
    SELECT COALESCE(MAX(orden_indicador), 0) + 1
      INTO NEW.orden_indicador
    FROM public.clase_mapa_indicadores
    WHERE objetivo_id = NEW.objetivo_id;
  END IF;

  NEW.id_jerarquico := v_datos.level_number || '.' || v_datos.orden_objetivo || '.' || NEW.orden_indicador;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_asignar_id_jerarquico
  BEFORE INSERT ON public.clase_mapa_indicadores
  FOR EACH ROW EXECUTE FUNCTION public.fn_asignar_id_jerarquico();

-- ----------------------------------------------------------------------------
-- 3. fn_bloquear_id_jerarquico() — BEFORE UPDATE ON clase_mapa_indicadores.
--    Si cambia orden_indicador, objetivo_id o id_jerarquico Y existe al menos
--    una evaluación registrada contra este indicador -> RAISE EXCEPTION
--    (SOI-MAPA-01). Si el cambio de objetivo_id está permitido (sin
--    evaluaciones todavía), se resincroniza clase_id + id_jerarquico contra el
--    nuevo objetivo padre para no dejar la denormalización inconsistente.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_bloquear_id_jerarquico()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_tiene_evaluaciones boolean := false;
  v_datos record;
BEGIN
  IF (NEW.orden_indicador IS DISTINCT FROM OLD.orden_indicador
      OR NEW.objetivo_id IS DISTINCT FROM OLD.objetivo_id
      OR NEW.id_jerarquico IS DISTINCT FROM OLD.id_jerarquico) THEN

    -- Ver nota de cabecera: EXECUTE evita que CREATE FUNCTION falle por
    -- referencia adelantada a evaluacion_indicador.clase_indicador_id, que se
    -- agrega recién en la migración 20260731000003.
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.evaluacion_indicador WHERE clase_indicador_id = $1)'
      INTO v_tiene_evaluaciones
      USING OLD.id;

    IF v_tiene_evaluaciones THEN
      RAISE EXCEPTION 'SOI-MAPA-01: ID jerárquico inmutable con evaluaciones' USING ERRCODE = 'P0001';
    END IF;

    IF NEW.objetivo_id IS DISTINCT FROM OLD.objetivo_id THEN
      SELECT * INTO v_datos FROM public.fn_datos_jerarquicos_de_objetivo(NEW.objetivo_id);

      IF v_datos.clase_id IS NULL THEN
        RAISE EXCEPTION 'SOI-MAPA-03: objetivo_id % no existe en clase_mapa_objetivos', NEW.objetivo_id;
      END IF;

      NEW.clase_id := v_datos.clase_id;
      NEW.id_jerarquico := v_datos.level_number || '.' || v_datos.orden_objetivo || '.' || NEW.orden_indicador;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bloquear_id_jerarquico
  BEFORE UPDATE ON public.clase_mapa_indicadores
  FOR EACH ROW EXECUTE FUNCTION public.fn_bloquear_id_jerarquico();

-- ----------------------------------------------------------------------------
-- 4. fn_bloquear_objetivo_jerarquico() — "trigger gemelo" en clase_mapa_objetivos.
--    Bloquea cambios de orden_objetivo/level_id si algún indicador
--    descendiente ya tiene evaluaciones registradas (cambiar cualquiera de
--    esas dos columnas renumeraría el tramo 1-2 del id_jerarquico de TODOS
--    los indicadores hijos).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_bloquear_objetivo_jerarquico()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_tiene_evaluaciones boolean := false;
BEGIN
  IF (NEW.orden_objetivo IS DISTINCT FROM OLD.orden_objetivo
      OR NEW.level_id IS DISTINCT FROM OLD.level_id) THEN

    -- Ver nota de cabecera sobre la referencia adelantada a clase_indicador_id.
    EXECUTE 'SELECT EXISTS (
      SELECT 1
      FROM public.clase_mapa_indicadores cmi
      JOIN public.evaluacion_indicador ei ON ei.clase_indicador_id = cmi.id
      WHERE cmi.objetivo_id = $1
    )' INTO v_tiene_evaluaciones USING OLD.id;

    IF v_tiene_evaluaciones THEN
      RAISE EXCEPTION 'SOI-MAPA-01: ID jerárquico inmutable con evaluaciones' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bloquear_objetivo_jerarquico
  BEFORE UPDATE ON public.clase_mapa_objetivos
  FOR EACH ROW EXECUTE FUNCTION public.fn_bloquear_objetivo_jerarquico();

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP TRIGGER IF EXISTS trg_bloquear_objetivo_jerarquico ON public.clase_mapa_objetivos;
-- DROP TRIGGER IF EXISTS trg_bloquear_id_jerarquico ON public.clase_mapa_indicadores;
-- DROP TRIGGER IF EXISTS trg_asignar_id_jerarquico ON public.clase_mapa_indicadores;
-- DROP FUNCTION IF EXISTS public.fn_bloquear_objetivo_jerarquico();
-- DROP FUNCTION IF EXISTS public.fn_bloquear_id_jerarquico();
-- DROP FUNCTION IF EXISTS public.fn_asignar_id_jerarquico();
-- DROP FUNCTION IF EXISTS public.fn_datos_jerarquicos_de_objetivo(uuid);
-- ============================================================================
