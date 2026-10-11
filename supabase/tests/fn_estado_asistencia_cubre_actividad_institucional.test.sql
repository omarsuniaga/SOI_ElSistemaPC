-- fn_estado_asistencia_cubre_actividad_institucional.test.sql
-- Test de integración SQL para public.fn_estado_asistencia_maestro, definido en
-- supabase/migrations/20260922120000_fn_estado_asistencia_cubre_actividad_institucional.sql
--
-- Verifica que una actividad especial INSTITUCIONAL (clase_id NULL,
-- alcance_tipo='institucion'), creada por OTRO maestro, cubre la clase regular
-- de un maestro distinto, y que NO la cubre cuando no aplica.
--
-- Escenarios:
--   A) Sin actividad ese día                        -> estado 'pendiente'
--   B) Actividad institucional registrada            -> 'cubierta_emergente'
--   C) Actividad institucional en borrador           -> sigue 'pendiente'
--   D) Actividad registrada de alcance 'orquesta'     -> sigue 'pendiente'
--      (solo alcance 'institucion' cubre a todos; orquesta/coro/programa/grupo no)
--
-- SEGURIDAD: todo corre dentro de BEGIN; ... ROLLBACK;. No persiste nada.
-- La función exige que quien consulta sea admin o service_role: se ejecuta con
-- el rol de servicio (execute_sql / psql con la clave de servicio).
--
-- CÓMO EJECUTARLO:
--   psql "$DATABASE_URL" -f supabase/tests/fn_estado_asistencia_cubre_actividad_institucional.test.sql
-- Termina con error (RAISE EXCEPTION) si algún escenario falla.

BEGIN;

DO $$
DECLARE
  v_periodo  record;
  v_fecha    date;
  v_dia      text;
  v_maestro  uuid := gen_random_uuid();
  v_creador  uuid := gen_random_uuid();
  v_clase    uuid := gen_random_uuid();
  v_estado   text;
  v_cubierta boolean;
BEGIN
  -- Período activo: la función recorta el rango a él.
  SELECT p.fecha_inicio, p.fecha_fin INTO v_periodo
  FROM public.periodos p
  WHERE p.activo = true AND COALESCE(p.cerrado, false) = false
  ORDER BY p.fecha_inicio DESC LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'TEST OMITIDO: no hay periodo activo';
  END IF;

  -- Un día lectivo pasado, dentro del período, hace más de 8 días (así 'pendiente'
  -- no puede confundirse con 'vencida' de forma ambigua: usamos solo la rama de
  -- cobertura, que se evalúa antes).
  SELECT d::date INTO v_fecha
  FROM generate_series(GREATEST(v_periodo.fecha_inicio, current_date - 40), current_date - 1, interval '1 day') d
  WHERE public.fn_es_dia_lectivo(d::date)
  ORDER BY d DESC LIMIT 1;
  IF v_fecha IS NULL THEN
    RAISE EXCEPTION 'TEST OMITIDO: no hay un dia lectivo pasado en el periodo';
  END IF;

  v_dia := CASE extract(dow FROM v_fecha)
    WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes'
    WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END;

  -- SETUP: maestro dueño de la clase, otro maestro que crea la actividad, y una clase
  -- regular ese día de la semana. maestros.user_id queda NULL (no hace falta login).
  INSERT INTO public.maestros (id, nombre_completo, especialidad, correo) VALUES (v_maestro, 'TEST maestro dueño', 'TEST', 'test-dueno@invalid.test');
  INSERT INTO public.maestros (id, nombre_completo, especialidad, correo) VALUES (v_creador, 'TEST maestro creador', 'TEST', 'test-creador@invalid.test');
  INSERT INTO public.clases (id, nombre, maestro_principal_id) VALUES (v_clase, 'TEST clase regular', v_maestro);
  INSERT INTO public.clase_horarios (clase_id, dia, hora_inicio, hora_fin)
  VALUES (v_clase, v_dia, '15:00', '16:00');

  -- A) Sin actividad
  SELECT f.estado, f.cubierta_emergente INTO v_estado, v_cubierta
  FROM public.fn_estado_asistencia_maestro(v_maestro, v_fecha, v_fecha) f WHERE f.clase_id = v_clase;
  IF v_estado IS DISTINCT FROM 'pendiente' AND v_estado IS DISTINCT FROM 'vencida' THEN
    RAISE EXCEPTION 'A) esperado pendiente/vencida sin actividad, obtuvo %', v_estado;
  END IF;
  IF v_cubierta THEN RAISE EXCEPTION 'A) cubierta_emergente debia ser false'; END IF;
  RAISE NOTICE 'A) OK sin actividad -> %', v_estado;

  -- C) Actividad institucional en BORRADOR no cubre
  INSERT INTO public.sesiones_clase (maestro_id, fecha, clase_id, actividad, alcance_tipo, estado, borrador)
  VALUES (v_creador, v_fecha, NULL, 'TEST actividad', 'institucion', 'pendiente', true);
  SELECT f.estado INTO v_estado
  FROM public.fn_estado_asistencia_maestro(v_maestro, v_fecha, v_fecha) f WHERE f.clase_id = v_clase;
  IF v_estado = 'cubierta_emergente' THEN RAISE EXCEPTION 'C) un borrador no debe cubrir'; END IF;
  RAISE NOTICE 'C) OK borrador no cubre -> %', v_estado;
  DELETE FROM public.sesiones_clase WHERE maestro_id = v_creador AND fecha = v_fecha;

  -- D) Actividad registrada pero de alcance NO institucional no cubre
  INSERT INTO public.sesiones_clase (maestro_id, fecha, clase_id, actividad, alcance_tipo, estado, borrador)
  VALUES (v_creador, v_fecha, NULL, 'TEST actividad', 'orquesta', 'registrada', false);
  SELECT f.estado INTO v_estado
  FROM public.fn_estado_asistencia_maestro(v_maestro, v_fecha, v_fecha) f WHERE f.clase_id = v_clase;
  IF v_estado = 'cubierta_emergente' THEN RAISE EXCEPTION 'D) alcance no institucional no debe cubrir'; END IF;
  RAISE NOTICE 'D) OK alcance no institucional no cubre -> %', v_estado;
  DELETE FROM public.sesiones_clase WHERE maestro_id = v_creador AND fecha = v_fecha;

  -- B) Actividad institucional REGISTRADA de otro maestro cubre la clase
  INSERT INTO public.sesiones_clase (maestro_id, fecha, clase_id, actividad, alcance_tipo, estado, borrador)
  VALUES (v_creador, v_fecha, NULL, 'TEST actividad', 'institucion', 'registrada', false);
  SELECT f.estado, f.cubierta_emergente INTO v_estado, v_cubierta
  FROM public.fn_estado_asistencia_maestro(v_maestro, v_fecha, v_fecha) f WHERE f.clase_id = v_clase;
  IF v_estado IS DISTINCT FROM 'cubierta_emergente' THEN
    RAISE EXCEPTION 'B) esperado cubierta_emergente, obtuvo %', v_estado;
  END IF;
  IF NOT v_cubierta THEN RAISE EXCEPTION 'B) cubierta_emergente debia ser true'; END IF;
  RAISE NOTICE 'B) OK actividad institucional registrada cubre -> %', v_estado;

  RAISE NOTICE 'TODOS LOS ESCENARIOS OK';
END $$;

ROLLBACK;
