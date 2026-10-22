-- Comprobación por todos los maestros activos; no modifica alumnos ni matrículas.
BEGIN;
DO $$
DECLARE actors uuid[]; actor uuid; expected bigint; visible bigint;
BEGIN
  SELECT array_agg(p.id) INTO actors FROM public.profiles p
    WHERE p.rol = 'maestro' AND p.estado = 'activo' AND p.activo IS TRUE;
  IF COALESCE(cardinality(actors),0) = 0 THEN RAISE EXCEPTION 'No active maestro fixtures'; END IF;
  SELECT count(*) INTO expected FROM public.alumnos;
  FOREACH actor IN ARRAY actors LOOP
    PERFORM set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated')::text,true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    SELECT count(*) INTO visible FROM public.alumnos;
    IF visible <> expected THEN RAISE EXCEPTION 'Maestro sees % of % alumnos',visible,expected; END IF;
    EXECUTE 'RESET ROLE';
  END LOOP;
  IF has_table_privilege('anon','public.alumnos','SELECT') THEN RAISE EXCEPTION 'Anonymous SELECT must remain denied'; END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.alumnos'::regclass) THEN RAISE EXCEPTION 'RLS must remain enabled'; END IF;
  PERFORM set_config('request.jwt.claims','{"role":"authenticated"}',true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  SELECT count(*) INTO visible FROM public.alumnos;
  IF visible <> 0 THEN RAISE EXCEPTION 'Missing identity must see no alumnos'; END IF;
  EXECUTE 'RESET ROLE';
END $$;
ROLLBACK;
