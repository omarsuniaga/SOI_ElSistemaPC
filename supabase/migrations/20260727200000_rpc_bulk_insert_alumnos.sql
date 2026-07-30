-- Migration: RPC para inserción masiva de alumnos con SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.fn_bulk_insert_nuevos_alumnos()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clase_n0_a UUID := '45f1eff8-699c-4bf5-84fa-e7c13979fc3c';
  v_clase_n0_b UUID := '3bc800b1-597d-4ad4-bf69-cc45ba1df89d';
  v_clase_violas UUID := '9d45ecfb-e7f1-4c13-855f-751131969e14';
  
  v_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Asegurar columna genero si no existe
  ALTER TABLE public.alumnos
    ADD COLUMN IF NOT EXISTS genero TEXT;

  -- 1. Clase de Violines N0-A (Edelyn Abreu) - 7 a 10 años
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Karelyn Alaia Jiménez Agramonte', '2018-01-01', 'F', 'Violín', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Ismeray Lara Doñe', '2017-01-01', 'F', 'Violín', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Yarayni Pierre Mateo', '2019-01-01', 'F', 'Violín', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  -- 2. Clases de Violines N0-B (Dyakenson Lamerique) - 11 a 16 años
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Allexa Jireh Marte Mancebo', '2015-01-01', 'F', 'Violín', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Chanaika Joseph', '2014-01-01', 'F', 'Violín', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Samantha Oller Román', '2013-01-01', 'F', 'Violín', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  -- 3. Clases de Violas (Jaime de la Cruz) - 11 a 15 años
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Esther Tucen', '2015-01-01', 'F', 'Viola', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Stacey Raquel Peñaló Méndez', '2014-01-01', 'F', 'Viola', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Aliyah Elizabeth Marte Mancebo', '2011-01-01', 'F', 'Viola', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Fednaika Nicolas Joseph', '2013-01-01', 'F', 'Viola', true)
  RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;
  v_count := v_count + 1;

  RETURN json_build_object('success', true, 'registered_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_bulk_insert_nuevos_alumnos() TO anon, authenticated, service_role;
