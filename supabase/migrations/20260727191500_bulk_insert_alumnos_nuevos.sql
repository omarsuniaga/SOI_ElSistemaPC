-- Corregir constraint not-null en familia_id y añadir columna genero
ALTER TABLE public.alumnos ALTER COLUMN familia_id DROP NOT NULL;
ALTER TABLE public.alumnos ADD COLUMN IF NOT EXISTS genero TEXT;

-- Insertar los 10 alumnos e inscribirlos en sus clases
DO $$
DECLARE
  v_clase_n0_a UUID := '45f1eff8-699c-4bf5-84fa-e7c13979fc3c';
  v_clase_n0_b UUID := '3bc800b1-597d-4ad4-bf69-cc45ba1df89d';
  v_clase_violas UUID := '9d45ecfb-e7f1-4c13-855f-751131969e14';
  v_id UUID;
BEGIN

  -- 1. Karelyn Alaia Jiménez Agramonte
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Karelyn Alaia Jiménez Agramonte', '2018-01-01', 'F', 'Violín', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a) ON CONFLICT DO NOTHING;

  -- 2. Ismeray Lara Doñe
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Ismeray Lara Doñe', '2017-01-01', 'F', 'Violín', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a) ON CONFLICT DO NOTHING;

  -- 3. Yarayni Pierre Mateo
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Yarayni Pierre Mateo', '2019-01-01', 'F', 'Violín', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_a) ON CONFLICT DO NOTHING;

  -- 4. Allexa Jireh Marte Mancebo
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Allexa Jireh Marte Mancebo', '2015-01-01', 'F', 'Violín', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b) ON CONFLICT DO NOTHING;

  -- 5. Chanaika Joseph
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Chanaika Joseph', '2014-01-01', 'F', 'Violín', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b) ON CONFLICT DO NOTHING;

  -- 6. Samantha Oller Román
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Samantha Oller Román', '2013-01-01', 'F', 'Violín', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_n0_b) ON CONFLICT DO NOTHING;

  -- 7. Esther Tucen
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Esther Tucen', '2015-01-01', 'F', 'Viola', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;

  -- 8. Stacey Raquel Peñaló Méndez
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Stacey Raquel Peñaló Méndez', '2014-01-01', 'F', 'Viola', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;

  -- 9. Aliyah Elizabeth Marte Mancebo
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Aliyah Elizabeth Marte Mancebo', '2011-01-01', 'F', 'Viola', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;

  -- 10. Fednaika Nicolas Joseph
  INSERT INTO public.alumnos (nombre_completo, fecha_nacimiento, genero, instrumento_principal, activo)
  VALUES ('Fednaika Nicolas Joseph', '2013-01-01', 'F', 'Viola', true) RETURNING id INTO v_id;
  INSERT INTO public.alumnos_clases (alumno_id, clase_id) VALUES (v_id, v_clase_violas) ON CONFLICT DO NOTHING;

END $$;
