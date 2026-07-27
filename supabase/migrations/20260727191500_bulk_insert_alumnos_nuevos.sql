-- ============================================================================
-- REGISTRO MASIVO DE 10 NUEVOS ALUMNOS E INSCRIPCIÓN EN SUS CLASES
-- ============================================================================

DO $$
DECLARE
  v_clase_n0_a UUID := '45f1eff8-699c-4bf5-84fa-e7c13979fc3c';
  v_clase_n0_b UUID := '3bc800b1-597d-4ad4-bf69-cc45ba1df89d';
  v_clase_violas UUID := '9d45ecfb-e7f1-4c13-855f-751131969e14';
  
  v_id UUID;
BEGIN

  -- --------------------------------------------------------------------------
  -- 1. Clase de Violines N0-A (Edelyn Abreu) - 7 a 10 años
  -- --------------------------------------------------------------------------

  -- Karelyn Alaia Jiménez Agramonte (8 años, Violín, con instrumento *)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Karelyn Alaia Jiménez Agramonte', '2018-01-01', 'Violín', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a)
  ON CONFLICT DO NOTHING;

  -- Ismeray Lara Doñe (9 años, Violín)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Ismeray Lara Doñe', '2017-01-01', 'Violín', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a)
  ON CONFLICT DO NOTHING;

  -- Yarayni Pierre Mateo (7 años, Violín)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Yarayni Pierre Mateo', '2019-01-01', 'Violín', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a)
  ON CONFLICT DO NOTHING;

  -- --------------------------------------------------------------------------
  -- 2. Clases de Violines N0-B (Dyakenson Lamerique) - 11 a 16 años
  -- --------------------------------------------------------------------------

  -- Allexa Jireh Marte Mancebo (11 años, Violín)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Allexa Jireh Marte Mancebo', '2015-01-01', 'Violín', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b)
  ON CONFLICT DO NOTHING;

  -- Chanaika Joseph (12 años, Violín)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Chanaika Joseph', '2014-01-01', 'Violín', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b)
  ON CONFLICT DO NOTHING;

  -- Samantha Oller Román (13 años, Violín)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Samantha Oller Román', '2013-01-01', 'Violín', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b)
  ON CONFLICT DO NOTHING;

  -- --------------------------------------------------------------------------
  -- 3. Clases de Violas (Jaime de la Cruz) - 11 a 15 años
  -- --------------------------------------------------------------------------

  -- Esther Tucen (11 años, Viola)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Esther Tucen', '2015-01-01', 'Viola', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas)
  ON CONFLICT DO NOTHING;

  -- Stacey Raquel Peñaló Méndez (12 años, Viola)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Stacey Raquel Peñaló Méndez', '2014-01-01', 'Viola', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas)
  ON CONFLICT DO NOTHING;

  -- Aliyah Elizabeth Marte Mancebo (15 años, Viola)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Aliyah Elizabeth Marte Mancebo', '2011-01-01', 'Viola', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas)
  ON CONFLICT DO NOTHING;

  -- Fednaika Nicolas Joseph (13 años, Viola, con instrumento *)
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, instrumento_principal, activo)
  VALUES ('Fednaika Nicolas Joseph', '2013-01-01', 'Viola', true)
  RETURNING id INTO v_id;

  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Se registraron los 10 alumnos y se inscribieron en sus respectivas clases exitosamente.';
END $$;
