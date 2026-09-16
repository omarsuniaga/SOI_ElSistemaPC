-- F0: contención no destructiva. No ejecutar junto a migraciones históricas
-- pendientes sin reconciliar el ledger; ver docs/soi-v2/SEGURIDAD_F0.md.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE SCHEMA IF NOT EXISTS soi_security;
REVOKE ALL ON SCHEMA soi_security FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA soi_security TO authenticated;

-- No usa es_admin(): ese helper también concede acceso a inventarista.
-- No confía en user_metadata ni en un rol/actor aportado por el navegador.
CREATE OR REPLACE FUNCTION soi_security.has_role(allowed_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.estado = 'activo'
      AND p.activo IS DISTINCT FROM false AND p.rol = ANY(allowed_roles)
  );
$$;
REVOKE ALL ON FUNCTION soi_security.has_role(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION soi_security.has_role(text[]) TO authenticated;

-- Resuelve user_id -> maestro.id y titular/suplente sin recursión RLS.
CREATE OR REPLACE FUNCTION soi_security.assigned_maestro(target_clase_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT soi_security.has_role(ARRAY['maestro']) AND EXISTS (
    SELECT 1 FROM public.maestros m JOIN public.clases c
      ON m.id IN (c.maestro_principal_id, c.maestro_suplente_id)
    WHERE c.id = target_clase_id AND m.activo IS DISTINCT FROM false
      AND (m.user_id = auth.uid() OR (m.user_id IS NULL AND m.id = auth.uid()))
  );
$$;
REVOKE ALL ON FUNCTION soi_security.assigned_maestro(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION soi_security.assigned_maestro(uuid) TO authenticated;

-- El rol inventarista heredaba escritura de perfiles mediante es_admin().
-- Se preserva la lectura del propio perfil, incluso pendiente, para el login.
REVOKE ALL ON public.profiles FROM PUBLIC, anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.profiles FROM authenticated;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS f0_profiles_read ON public.profiles;
CREATE POLICY f0_profiles_read ON public.profiles AS RESTRICTIVE FOR SELECT TO authenticated
  USING (id=auth.uid() OR soi_security.has_role(ARRAY['admin','superadmin']));
DROP POLICY IF EXISTS f0_profiles_insert ON public.profiles;
CREATE POLICY f0_profiles_insert ON public.profiles AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (soi_security.has_role(ARRAY['admin','superadmin']));
DROP POLICY IF EXISTS f0_profiles_update ON public.profiles;
CREATE POLICY f0_profiles_update ON public.profiles AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (soi_security.has_role(ARRAY['admin','superadmin']))
  WITH CHECK (soi_security.has_role(ARRAY['admin','superadmin']));
DROP POLICY IF EXISTS f0_profiles_delete ON public.profiles;
CREATE POLICY f0_profiles_delete ON public.profiles AS RESTRICTIVE FOR DELETE TO authenticated
  USING (soi_security.has_role(ARRAY['superadmin']));
DROP POLICY IF EXISTS f0_profiles_staff_read ON public.profiles;
CREATE POLICY f0_profiles_staff_read ON public.profiles FOR SELECT TO authenticated
  USING (soi_security.has_role(ARRAY['admin','superadmin']));

-- Los gates RESTRICTIVE impiden que una política permisiva heredada los eluda.
-- Las políticas existentes de escritura de alumnos/inscripciones siguen vigentes.
DO $policies$
DECLARE
  target_table text;
  read_predicate text;
  staff_predicate constant text := 'soi_security.has_role(ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica'',''finanzas''])';
  academic_predicate constant text := 'soi_security.has_role(ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica''])';
BEGIN
  FOREACH target_table IN ARRAY ARRAY['alumnos','alumnos_clases','clases','clase_horarios'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',target_table);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon',target_table);
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated',target_table);
    EXECUTE format('DROP POLICY IF EXISTS f0_active_actor ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_active_actor ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
      target_table,
      'soi_security.has_role(ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica'',''finanzas'',''maestro''])',
      'soi_security.has_role(ARRAY[''admin'',''superadmin'',''direccion'',''coordinacion_academica'',''finanzas'',''maestro''])');
    read_predicate := staff_predicate || ' OR ' || CASE target_table
      WHEN 'alumnos' THEN 'EXISTS (SELECT 1 FROM public.alumnos_clases ac WHERE ac.alumno_id = alumnos.id AND soi_security.assigned_maestro(ac.clase_id))'
      WHEN 'clases' THEN 'soi_security.assigned_maestro(id)'
      ELSE 'soi_security.assigned_maestro(clase_id)' END;
    EXECUTE format('DROP POLICY IF EXISTS f0_read_scope ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_read_scope ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (%s)',target_table,read_predicate);
    EXECUTE format('DROP POLICY IF EXISTS f0_read_allow ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_read_allow ON public.%I FOR SELECT TO authenticated USING (%s)',target_table,read_predicate);
  END LOOP;

  FOREACH target_table IN ARRAY ARRAY['clases','clase_horarios'] LOOP
    read_predicate := academic_predicate || CASE WHEN target_table='clase_horarios'
      THEN ' OR soi_security.assigned_maestro(clase_id)' ELSE '' END;
    EXECUTE format('DROP POLICY IF EXISTS f0_insert_scope ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_insert_scope ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (%s)',target_table,read_predicate);
    EXECUTE format('DROP POLICY IF EXISTS f0_update_scope ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_update_scope ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',target_table,read_predicate,read_predicate);
    EXECUTE format('DROP POLICY IF EXISTS f0_delete_scope ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_delete_scope ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (%s)',target_table,read_predicate);
    EXECUTE format('DROP POLICY IF EXISTS f0_staff_manage ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_staff_manage ON public.%I FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',target_table,academic_predicate,academic_predicate);
  END LOOP;

  -- En la línea base los perfiles reales son admin/maestro; COM/DIR se habilitan
  -- después de verificar membresías persistentes, no por claims obsoletos.
  FOREACH target_table IN ARRAY ARRAY['conversaciones_whatsapp','alertas_log'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',target_table);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon',target_table);
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated',target_table);
    EXECUTE format('DROP POLICY IF EXISTS f0_admin_scope ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_admin_scope ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (soi_security.has_role(ARRAY[''admin''])) WITH CHECK (soi_security.has_role(ARRAY[''admin'']))',target_table);
    EXECUTE format('DROP POLICY IF EXISTS f0_admin_allow ON public.%I',target_table);
    EXECUTE format('CREATE POLICY f0_admin_allow ON public.%I FOR ALL TO authenticated USING (soi_security.has_role(ARRAY[''admin''])) WITH CHECK (soi_security.has_role(ARRAY[''admin'']))',target_table);
  END LOOP;
END;
$policies$;

DROP POLICY IF EXISTS alumnos_read_all ON public.alumnos;
DROP POLICY IF EXISTS alumnos_clases_read_all ON public.alumnos_clases;
DROP POLICY IF EXISTS allow_all_conversaciones ON public.conversaciones_whatsapp;
DROP POLICY IF EXISTS alertas_log_authenticated_all ON public.alertas_log;
DROP POLICY IF EXISTS "Permitir crear clases" ON public.clases;
DROP POLICY IF EXISTS "Permitir actualizar clases" ON public.clases;
DROP POLICY IF EXISTS "Permitir eliminar clases" ON public.clases;
DROP POLICY IF EXISTS "Permitir leer todas las clases" ON public.clases;
DROP POLICY IF EXISTS "Permitir crear clase_horarios" ON public.clase_horarios;
DROP POLICY IF EXISTS "Permitir actualizar clase_horarios" ON public.clase_horarios;
DROP POLICY IF EXISTS "Permitir eliminar clase_horarios" ON public.clase_horarios;

DROP POLICY IF EXISTS f0_no_physical_delete ON public.alumnos;
CREATE POLICY f0_no_physical_delete ON public.alumnos AS RESTRICTIVE
  FOR DELETE TO authenticated USING (false);

-- Conserva firma y datos. La fusión física requiere un flujo nuevo con revisión
-- de conflictos; no puede reutilizar el DELETE del código heredado.
CREATE OR REPLACE FUNCTION public.fn_fusionar_alumnos_duplicados(
  p_principal_id uuid, p_obsoleto_id uuid, p_datos_fusion jsonb
) RETURNS json LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE='42501',
    MESSAGE='Fusión temporalmente suspendida para proteger el historial. Solicite revisión de los expedientes.';
END;
$$;
REVOKE ALL ON FUNCTION public.fn_fusionar_alumnos_duplicados(uuid,uuid,jsonb) FROM PUBLIC, anon, authenticated, service_role;

-- El cierre se escribe únicamente mediante RPC. Se mantienen las ediciones
-- normales del catálogo; no se concede al navegador la escritura de la auditoría.
REVOKE ALL ON public.periodos FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.periodos FROM authenticated;
GRANT INSERT(nombre,fecha_inicio,fecha_fin,activo) ON public.periodos TO authenticated;
GRANT UPDATE(nombre,fecha_inicio,fecha_fin,activo,updated_at) ON public.periodos TO authenticated;
REVOKE ALL ON public.periodos_cierre_auditoria FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.periodos_cierre_auditoria FROM authenticated;
DROP POLICY IF EXISTS f0_periodos_update_open ON public.periodos;
CREATE POLICY f0_periodos_update_open ON public.periodos AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (NOT cerrado AND soi_security.has_role(ARRAY['admin']))
  WITH CHECK (NOT cerrado AND soi_security.has_role(ARRAY['admin']));
DROP POLICY IF EXISTS f0_periodos_insert_open ON public.periodos;
CREATE POLICY f0_periodos_insert_open ON public.periodos AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT cerrado AND soi_security.has_role(ARRAY['admin']));


-- Dos vistas personales evitaban RLS. Señalización pública conserva su contrato
-- de horarios; no contiene teléfonos de representantes ni expedientes de alumnos.
ALTER VIEW public.vw_seguimiento_ausentes SET (security_invoker = true);
REVOKE ALL ON public.vw_seguimiento_ausentes FROM PUBLIC, anon;
CREATE OR REPLACE VIEW public.vw_asistencias_consolidada WITH (security_invoker = true) AS
 SELECT sc.id AS sesion_clase_id,
    sc.fecha,
    sc.clase_id,
    c.nombre AS nombre_clase,
    sc.hora_inicio,
    sc.hora_fin,
    sc.borrador,
    m1.nombre_completo AS maestro_principal,
    m2.nombre_completo AS maestro_auxiliar,
    ( SELECT os.contenido_raw
           FROM observaciones_sesion os
          WHERE os.sesion_id = sc.id
          ORDER BY os.created_at DESC
         LIMIT 1) AS observacion_sesion,
    COALESCE(NULLIF(TRIM(BOTH FROM sc.contenido), ''::text), sc.contenido_dsl) AS observacion_clase,
    count(*) FILTER (WHERE a.estado = 'presente'::text) AS presentes,
    count(*) FILTER (WHERE a.estado = 'ausente'::text) AS ausentes,
    count(*) FILTER (WHERE a.estado = 'justificado'::text) AS justificados,
    count(DISTINCT a.alumno_id) AS total_registros,
    COALESCE(json_agg(json_build_object('alumno_id', a.alumno_id, 'alumno_nombre', al.nombre_completo, 'estado', a.estado, 'observacion', a.observaciones) ORDER BY al.nombre_completo) FILTER (WHERE a.alumno_id IS NOT NULL), '[]'::json) AS asistencias_detalle,
    COALESCE(json_agg(json_build_object('alumno_id', j.alumno_id, 'alumno_nombre', al2.nombre_completo, 'razon', j.motivo, 'fecha_razon', j.created_at) ORDER BY al2.nombre_completo) FILTER (WHERE j.alumno_id IS NOT NULL), '[]'::json) AS justificaciones_detalle,
    sc.salon_id
   FROM sesiones_clase sc
     LEFT JOIN clases c ON c.id = sc.clase_id
     LEFT JOIN maestros m1 ON m1.id = c.maestro_principal_id
     LEFT JOIN maestros m2 ON m2.id = c.maestro_suplente_id
     LEFT JOIN asistencias a ON a.sesion_clase_id = sc.id
     LEFT JOIN alumnos al ON al.id = a.alumno_id
     LEFT JOIN justificaciones j ON j.sesion_id = sc.id
     LEFT JOIN alumnos al2 ON al2.id = j.alumno_id
  WHERE soi_security.has_role(ARRAY['admin']) OR soi_security.assigned_maestro(sc.clase_id)
  GROUP BY sc.id, sc.fecha, sc.clase_id, c.nombre, sc.hora_inicio, sc.hora_fin, sc.borrador, m1.nombre_completo, m2.nombre_completo, sc.contenido, sc.contenido_dsl, sc.salon_id;
REVOKE ALL ON public.vw_asistencias_consolidada FROM PUBLIC, anon;

-- Cierre basado en la definición verificada, con guard, actor y conteo corregidos.
CREATE OR REPLACE FUNCTION public.fn_cerrar_periodo_academico(p_periodo_id uuid, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_cerrado_por uuid DEFAULT NULL::uuid, p_observaciones text DEFAULT NULL::text, p_forzar boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_periodo      record;
  v_fecha_inicio date;
  v_fecha_fin    date;
  v_validacion   jsonb;
  v_snapshot     jsonb;
  v_resumen      jsonb;
  v_result       jsonb;
BEGIN
  IF NOT soi_security.has_role(ARRAY['admin']) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='No autorizado para cerrar períodos';
  END IF;
  IF p_cerrado_por IS NOT NULL AND p_cerrado_por IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='El actor del cierre debe ser el usuario autenticado';
  END IF;
  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Periodo no encontrado';
  END IF;

  IF v_periodo.cerrado THEN
    RAISE EXCEPTION 'El periodo ya esta cerrado';
  END IF;

  v_fecha_inicio := coalesce(p_fecha_inicio, v_periodo.fecha_inicio);
  v_fecha_fin    := coalesce(p_fecha_fin,    v_periodo.fecha_fin);

  IF v_fecha_inicio IS DISTINCT FROM v_periodo.fecha_inicio
     OR v_fecha_fin IS DISTINCT FROM v_periodo.fecha_fin
     OR v_fecha_inicio > v_fecha_fin THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='El rango debe coincidir con el período validado';
  END IF;
  v_validacion := public.fn_validar_cierre_periodo(p_periodo_id);
  IF v_validacion IS NULL OR jsonb_typeof(v_validacion->'puede_cerrar') IS DISTINCT FROM 'boolean' THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='No se pudo confirmar la validación del cierre';
  END IF;

  IF NOT (v_validacion->>'puede_cerrar')::boolean THEN
    IF p_forzar IS NOT TRUE THEN
      RAISE EXCEPTION 'No se puede cerrar: % de % sesiones sin registro completo (semaforo %). Corrija los registros o cierre con justificacion.',
        v_validacion->>'incompletas', v_validacion->>'total_sesiones', v_validacion->>'semaforo';
    END IF;

    IF p_observaciones IS NULL OR btrim(p_observaciones) = '' THEN
      RAISE EXCEPTION 'El cierre forzado requiere una justificacion escrita.';
    END IF;
  END IF;

  SELECT jsonb_build_object(
    'totalClases', count(distinct sc.clase_id),
    'totalSesiones', count(distinct sc.id),
    'totalAsistencias', count(a.id),
    'totalPresentes', count(a.id) filter (where a.estado = 'presente'),
    'totalAusentes', count(a.id) filter (where a.estado = 'ausente'),
    'totalJustificados', count(a.id) filter (where a.estado = 'justificado'),
    'tasaGlobalAsistencia',
      case when count(a.id) > 0 then
        round(((count(a.id) filter (where a.estado in ('presente','justificado')))::numeric
               / count(a.id)::numeric) * 100, 2)
      else null end
  )
  INTO v_resumen
  FROM public.sesiones_clase sc
  LEFT JOIN public.asistencias a ON a.sesion_clase_id = sc.id
  WHERE sc.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND sc.estado <> 'cancelada';

  SELECT jsonb_build_object(
    'resumen', v_resumen,
    'validacion', v_validacion,
    'cierre_forzado', NOT (v_validacion->>'puede_cerrar')::boolean,
    'clases', coalesce(jsonb_agg(distinct jsonb_build_object(
      'clase_id', sc.clase_id, 'sesion_id', sc.id,
      'fecha', sc.fecha, 'estado', sc.estado)), '[]'::jsonb)
  )
  INTO v_snapshot
  FROM public.sesiones_clase sc
  WHERE sc.fecha BETWEEN v_fecha_inicio AND v_fecha_fin
    AND sc.estado <> 'cancelada';

  UPDATE public.periodos
     SET cerrado = true, cerrado_at = now(), cerrado_por = auth.uid(),
         observaciones_cierre = p_observaciones, updated_at = now()
   WHERE id = p_periodo_id;

  INSERT INTO public.periodos_cierre_auditoria (
    periodo_id, fecha_inicio, fecha_fin, cerrado_por, observaciones, resumen, snapshot
  ) VALUES (
    p_periodo_id, v_fecha_inicio, v_fecha_fin, auth.uid(), p_observaciones,
    v_resumen, v_snapshot
  )
  RETURNING jsonb_build_object(
    'ok', true, 'periodo_id', periodo_id, 'snapshot_id', id,
    'fecha_inicio', fecha_inicio, 'fecha_fin', fecha_fin,
    'forzado', NOT (v_validacion->>'puede_cerrar')::boolean,
    'validacion', v_validacion
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.fn_cerrar_periodo_academico(uuid,date,date,uuid,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_cerrar_periodo_academico(uuid,date,date,uuid,text,boolean) TO authenticated;
-- Guards explícitos: una comparación con NULL nunca equivale a autorización.
CREATE OR REPLACE FUNCTION public.approve_maestro_profile(p_profile_id uuid, p_new_rol text, p_new_estado text DEFAULT 'activo'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
    DECLARE
      v_caller_role TEXT;
      v_profile RECORD;
      v_maestro_id UUID;
      v_instrumento TEXT;
      v_resena TEXT;
    BEGIN
      IF NOT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica']) THEN
        RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='No autorizado para modificar perfiles';
      END IF;
      IF auth.uid() IS NULL THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'No auth context — must be called from an authenticated request'
        );
      END IF;

      SELECT rol INTO v_caller_role
      FROM public.profiles
      WHERE id = auth.uid();

      IF v_caller_role IS NULL OR v_caller_role NOT IN (
        'admin',
        'superadmin',
        'direccion',
        'coordinacion_academica'
      ) THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Unauthorized: solo roles administrativos pueden aprobar usuarios'
        );
      END IF;

      SELECT * INTO v_profile
      FROM public.profiles
      WHERE id = p_profile_id;

      IF v_profile.id IS NULL THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Profile no encontrado'
        );
      END IF;

      SELECT
        NULLIF(raw_user_meta_data->>'instrumento', ''),
        NULLIF(raw_user_meta_data->>'resena', '')
      INTO v_instrumento, v_resena
      FROM auth.users
      WHERE id = p_profile_id;

      UPDATE public.profiles
      SET rol = p_new_rol,
          estado = p_new_estado,
          updated_at = NOW()
      WHERE id = p_profile_id;

      UPDATE auth.users
      SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
                               || jsonb_build_object('rol', p_new_rol)
      WHERE id = p_profile_id;

      IF p_new_rol = 'admin' THEN
        DELETE FROM public.maestros
        WHERE user_id = p_profile_id;

      ELSIF p_new_rol = 'maestro' THEN
        BEGIN
          -- 1. Intentar con la columna instrumento_principal
          INSERT INTO public.maestros (
            user_id,
            nombre_completo,
            correo,
            instrumento_principal,
            resena,
            activo
          )
          VALUES (
            p_profile_id,
            v_profile.nombre_completo,
            v_profile.email,
            COALESCE(v_instrumento, ''),
            v_resena,
            true
          )
          ON CONFLICT (user_id) DO UPDATE SET
            nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            instrumento_principal = COALESCE(v_instrumento, public.maestros.instrumento_principal),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
        EXCEPTION WHEN undefined_column THEN
          -- 2. Fallback a la columna especialidad si instrumento_principal no existe
          INSERT INTO public.maestros (
            user_id,
            nombre_completo,
            correo,
            especialidad,
            resena,
            activo
          )
          VALUES (
            p_profile_id,
            v_profile.nombre_completo,
            v_profile.email,
            COALESCE(v_instrumento, ''),
            v_resena,
            true
          )
          ON CONFLICT (user_id) DO UPDATE SET
            nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            especialidad = COALESCE(v_instrumento, public.maestros.especialidad),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
        END;

        SELECT id INTO v_maestro_id
        FROM public.maestros
        WHERE user_id = p_profile_id;

        IF v_maestro_id IS NOT NULL THEN
          INSERT INTO public.permisos_maestros
            (maestro_id, puede_registrar_alumnos, puede_inscribir_clases, permisos)
          VALUES (
            v_maestro_id,
            true,
            true,
            ARRAY['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases']
          )
          ON CONFLICT (maestro_id) DO UPDATE SET
            puede_registrar_alumnos = true,
            puede_inscribir_clases = true,
            permisos = ARRAY['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases'];
        END IF;
      END IF;

      RETURN jsonb_build_object(
        'success', true,
        'profile_id', p_profile_id,
        'rol', p_new_rol,
        'estado', p_new_estado
      );
    END;
    $function$;
REVOKE EXECUTE ON FUNCTION public.approve_maestro_profile(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_maestro_profile(uuid,text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.aprobar_usuario(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public, pg_temp
AS $function$
DECLARE
  v_rol text;
BEGIN
      IF NOT soi_security.has_role(ARRAY['admin','superadmin']) THEN
        RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='No autorizado para modificar perfiles';
      END IF;
  SELECT rol INTO v_rol
  FROM public.profiles
  WHERE id = auth.uid() AND estado = 'activo';

  IF v_rol NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'No autorizado: se requiere rol admin o superadmin';
  END IF;

  UPDATE public.profiles
  SET estado = 'activo',
      activo = true,
      updated_at = now()
  WHERE id = p_user_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.aprobar_usuario(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprobar_usuario(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.cambiar_rol_usuario(p_user_id uuid, p_nuevo_rol text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public, pg_temp
AS $function$
DECLARE
  v_rol text;
BEGIN
      IF NOT soi_security.has_role(ARRAY['superadmin']) THEN
        RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='No autorizado para modificar perfiles';
      END IF;
  IF p_nuevo_rol NOT IN ('user', 'admin', 'superadmin') THEN
    RAISE EXCEPTION 'Rol inválido';
  END IF;

  SELECT rol INTO v_rol
  FROM public.profiles
  WHERE id = auth.uid() AND estado = 'activo';

  IF v_rol != 'superadmin' THEN
    RAISE EXCEPTION 'No autorizado: solo el superadmin puede cambiar roles';
  END IF;

  UPDATE public.profiles
  SET rol = p_nuevo_rol,
      updated_at = now()
  WHERE id = p_user_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.cambiar_rol_usuario(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cambiar_rol_usuario(uuid,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.rechazar_usuario(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO public, pg_temp
AS $function$
DECLARE
  v_rol text;
BEGIN
      IF NOT soi_security.has_role(ARRAY['admin','superadmin']) THEN
        RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='No autorizado para modificar perfiles';
      END IF;
  SELECT rol INTO v_rol
  FROM public.profiles
  WHERE id = auth.uid() AND estado = 'activo';

  IF v_rol NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'No autorizado: se requiere rol admin o superadmin';
  END IF;

  UPDATE public.profiles
  SET estado = 'rechazado',
      activo = false,
      updated_at = now()
  WHERE id = p_user_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rechazar_usuario(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rechazar_usuario(uuid) TO authenticated;

COMMIT;
