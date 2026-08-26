-- ==============================================================================
-- SOI (Sistema Operativo Institucional) - El Sistema Punta Cana
-- REORGANIZACIÓN Y ASIGNACIÓN PEDAGÓGICA: INICIACIÓN MUSICAL (PROF. RAQUEL PAYAN)
-- Divide el turno de la tarde en:
--   - Grupo A: Edades 7 a 11 años (27 alumnos)
--   - Grupo B: Menores de 7 y Mayores de 11 años (20 alumnos)
-- ==============================================================================

DO $$
DECLARE
  v_programa_id UUID;
  v_maestro_raquel_id UUID;
  v_clase_grupo_a_id UUID;
  v_clase_grupo_b_id UUID;
  v_clase_tarde_legacy_id UUID;
  v_rec RECORD;
  v_alumno_id UUID;
  v_inscritos_a INT := 0;
  v_inscritos_b INT := 0;
BEGIN
  RAISE NOTICE '🚀 Iniciando reorganización pedagógica de Iniciación Musical...';

  -- 1. Obtener o crear Programa Base (Iniciación / Académico)
  SELECT id INTO v_programa_id FROM public.programas WHERE activo = true LIMIT 1;
  IF v_programa_id IS NULL THEN
    INSERT INTO public.programas (nombre, descripcion, activo)
    VALUES ('Iniciación Musical', 'Programa preparatorio e inicial de música', true)
    RETURNING id INTO v_programa_id;
  END IF;

  -- 2. Asegurar existencia de la Profesora Raquel Payan en la tabla maestros
  SELECT id INTO v_maestro_raquel_id 
  FROM public.maestros 
  WHERE LOWER(TRIM(nombre_completo)) LIKE '%raquel payan%' 
  LIMIT 1;

  IF v_maestro_raquel_id IS NULL THEN
    INSERT INTO public.maestros (nombre_completo, email, activo, instrumento_principal, rol)
    VALUES ('Raquel Payan', 'raquel.payan@elsistema.org', true, 'Iniciación Musical', 'docente')
    RETURNING id INTO v_maestro_raquel_id;
    RAISE NOTICE '✅ Maestro creado: Raquel Payan (ID: %)', v_maestro_raquel_id;
  ELSE
    UPDATE public.maestros 
    SET activo = true, instrumento_principal = 'Iniciación Musical'
    WHERE id = v_maestro_raquel_id;
    RAISE NOTICE '✅ Maestro verificado: Raquel Payan (ID: %)', v_maestro_raquel_id;
  END IF;

  -- 3. Identificar si existe la clase legacy "Iniciación Musical - Turno Tarde"
  SELECT id INTO v_clase_tarde_legacy_id 
  FROM public.clases 
  WHERE LOWER(nombre) LIKE '%iniciaci%tarde%' AND LOWER(nombre) NOT LIKE '%grupo%'
  LIMIT 1;

  -- 4. Crear/Asegurar Clase: Iniciación Musical - Grupo A (Tarde) [7 a 11 años]
  SELECT id INTO v_clase_grupo_a_id 
  FROM public.clases 
  WHERE LOWER(nombre) LIKE '%iniciaci%grupo a%tarde%' OR LOWER(nombre) = 'iniciación musical - grupo a (tarde)'
  LIMIT 1;

  IF v_clase_grupo_a_id IS NULL THEN
    INSERT INTO public.clases (nombre, tipo_clase, programa_id, maestro_principal_id, activo, descripcion, capacidad_maxima)
    VALUES (
      'Iniciación Musical - Grupo A (Tarde)',
      'grupal',
      v_programa_id,
      v_maestro_raquel_id,
      true,
      'Cátedra de Iniciación Musical · Grupo A (Edades de 7 a 11 años) · Prof. Raquel Payan',
      35
    )
    RETURNING id INTO v_clase_grupo_a_id;
  ELSE
    UPDATE public.clases 
    SET maestro_principal_id = v_maestro_raquel_id, activo = true,
        descripcion = 'Cátedra de Iniciación Musical · Grupo A (Edades de 7 a 11 años) · Prof. Raquel Payan'
    WHERE id = v_clase_grupo_a_id;
  END IF;

  -- 5. Crear/Asegurar Clase: Iniciación Musical - Grupo B (Tarde) [Resto de edades]
  SELECT id INTO v_clase_grupo_b_id 
  FROM public.clases 
  WHERE LOWER(nombre) LIKE '%iniciaci%grupo b%tarde%' OR LOWER(nombre) = 'iniciación musical - grupo b (tarde)'
  LIMIT 1;

  IF v_clase_grupo_b_id IS NULL THEN
    INSERT INTO public.clases (nombre, tipo_clase, programa_id, maestro_principal_id, activo, descripcion, capacidad_maxima)
    VALUES (
      'Iniciación Musical - Grupo B (Tarde)',
      'grupal',
      v_programa_id,
      v_maestro_raquel_id,
      true,
      'Cátedra de Iniciación Musical · Grupo B (Menores de 7 y Mayores de 11 años) · Prof. Raquel Payan',
      30
    )
    RETURNING id INTO v_clase_grupo_b_id;
  ELSE
    UPDATE public.clases 
    SET maestro_principal_id = v_maestro_raquel_id, activo = true,
        descripcion = 'Cátedra de Iniciación Musical · Grupo B (Menores de 7 y Mayores de 11 años) · Prof. Raquel Payan'
    WHERE id = v_clase_grupo_b_id;
  END IF;

  -- 6. Crear Horarios por Defecto si la tabla clase_horarios está disponible
  BEGIN
    INSERT INTO public.clase_horarios (clase_id, dia, hora_inicio, hora_fin)
    VALUES 
      (v_clase_grupo_a_id, 'sábado', '15:30:00', '17:00:00'),
      (v_clase_grupo_b_id, 'sábado', '17:00:00', '18:30:00')
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Continuar si ya existen o no aplica constraint
  END;

  -- 7. TABLA TEMPORAL CON LA NÓMINA OFICIAL DIVIDIDA POR GRUPO
  CREATE TEMP TABLE tmp_alumnos_grupos (
    grupo CHAR(1),
    alumno TEXT,
    representante TEXT,
    edad INT,
    fecha_nacimiento DATE,
    telefono TEXT,
    direccion TEXT
  ) ON COMMIT DROP;

  -- NÓMINA GRUPO A (27 alumnos, 7 a 11 años)
  INSERT INTO tmp_alumnos_grupos (grupo, alumno, representante, edad, fecha_nacimiento, telefono, direccion) VALUES
    ('A', 'Iriam Méndez José', 'Grismaldy Mercedes José Paulino', 8, '2018-06-15', '8292307813', 'Ciudad Del Rey'),
    ('A', 'Alan Manuel Saldaña', 'Juan Carlos Saldaña', 11, '2015-06-15', '8099069632', 'Veron'),
    ('A', 'Amelia Mercedez', 'Noreliz De Los Santos', 7, '2019-06-15', '8294601827', 'Domingo Maiz, Veron'),
    ('A', 'Amelia Olaverria', 'Lucymart Mateo', 9, '2017-06-15', '8293827967', 'Residenciales La Antigua'),
    ('A', 'Angel David  Ramirez', 'Erika Ramirez', 10, '2016-06-15', '8096606513', 'Hotel Yonu'),
    ('A', 'Ann Saena Antis', 'Marie  Nose Antis', 11, '2015-06-15', '8495938730', 'Veron'),
    ('A', 'Camila Del Carmen Luna Polanco', 'Mariel Polanco', 7, '2019-06-15', '8292841840', 'Veron Punta Cana'),
    ('A', 'Coral Isabella', 'Barbara Strano', 7, '2019-06-15', '8298680851', 'Cocotal'),
    ('A', 'Daniella Gomez Castillo', 'Cinthya Castillo', 10, '2016-06-15', '8293566985', 'Capcana'),
    ('A', 'Darolyn Veloz Valdez', 'Carolyn Valdez', 11, '2015-06-15', '8297762023', 'Lotificacion Veron'),
    ('A', 'Dylan Isaac Sanchez Urraca', 'Nelson Jimenes', 7, '2019-06-15', '8294398194', 'Sector Ayutamiento'),
    ('A', 'Jeremias Amparo', 'Yaraisa Amparo Abelino', 8, '2018-06-15', '8297448469', 'Caracoli'),
    ('A', 'Lilaj Del Angel García', 'Laura Elvira', 9, '2017-06-15', '529841507007', 'Bavaro Punta Cana'),
    ('A', 'Melany Vargas Rivas', 'Minerva Rivas', 8, '2018-06-15', '8293295821', 'Veron'),
    ('A', 'Nasly Daniel Majia Mateo', 'Nayrobys Mateo', 7, '2019-06-15', '8298746735', 'Domingo Maiz'),
    ('A', 'Oliver Yotniel Perez De Leon', 'Yokaty De Leon Lopez', 9, '2017-06-15', '', 'Veron'),
    ('A', 'Oriana Isabella Duarte', 'Yorli Bravo', 9, '2017-06-15', '8297084180', 'Ciudad Cayenas'),
    ('A', 'Pameli Lopez', 'Leidi Pamela Torres Carrasco', 8, '2018-06-15', '8094039276', 'Domingo Maiz'),
    ('A', 'Richard Alexander De La Cruz', 'Alejandrina Lizardo Trinidad', 7, '2019-06-15', '8297596796', 'Lotificacion Veron'),
    ('A', 'Rogelio Antonio Reyes Felix', 'Isabell Mateo Alcantara', 7, '2019-06-15', '8496243270', 'Domingo Maiz'),
    ('A', 'Samuel Elias Rodriguez', 'Pamela Rodriguez', 7, '2019-06-15', '8492838673', 'Los Manantiales'),
    ('A', 'Sara B Moya Castillo', 'Genesis Castillo', 8, '2018-06-15', '8293863907', 'Veron Campolindo'),
    ('A', 'Victor Daniel Garcia De Leon', 'Xiomara De Leon Lopez', 9, '2017-06-15', '8094659490', 'Los Manantiales'),
    ('A', 'Wellington Sebastian', 'Yocani Barinas', 7, '2019-06-15', '8293666803', 'Residencial Don Rogelio'),
    ('A', 'Yaraisa Amparo Avelino', 'Jeremías Amparo Amparo', 8, '2018-06-15', '8297448469', 'Caracoli'),
    ('A', 'Yasser Nicolas Mejias', 'Yuliany  Sosa', 8, '2018-06-15', '8293356974', 'Los Manantiales');

  -- NÓMINA GRUPO B (20 alumnos, < 7 o > 11 años)
  INSERT INTO tmp_alumnos_grupos (grupo, alumno, representante, edad, fecha_nacimiento, telefono, direccion) VALUES
    ('B', 'Haide Mejia', 'Katherin Abreu', 6, '2020-06-15', '8293665351', 'Veron Pc'),
    ('B', 'Leslie Lopez', 'Leidi Pamela Torres Carrasco', 6, '2020-06-15', '8094039276', 'Domingo Maiz'),
    ('B', 'Sandy Olfran Garcia', 'Santa Nicolasa Falcon Cabrera', 6, '2020-06-15', '8294370367', 'Veron'),
    ('B', 'Dylan Machillanda', 'Ana Machillanda', 12, '2014-06-15', '8293159040', 'Cortecito'),
    ('B', 'Brianna Lisset Jiménez Rodríguez', 'Miledis Rodríguez Guerrero', 12, '2014-06-15', '8295285884', 'Residencial Don Domingo'),
    ('B', 'Endy Jadiel Ramirez', 'Erika Ramirez', 12, '2014-06-15', '8096606513', 'Hotel Yonu'),
    ('B', 'Rocio Francisca Reyes Perez', 'Isabell Mateo Alcantara', 12, '2014-06-15', '8496243270', 'Domingo Maiz'),
    ('B', 'Vasti Mejia', 'Katherin Abreu', 12, '2014-06-15', '8293665351', 'Veron Pc'),
    ('B', 'Clariluz Castillo', 'Nicaury Diaz', 13, '2013-06-15', '8099799258', 'Residencial La Antigua'),
    ('B', 'Liah Rashel Escoto', 'Santa Elizaire', 13, '2013-06-15', '8299938015', 'Cocotal'),
    ('B', 'Lissette Jimenez', 'Lisbet Severino Nuñez', 13, '2013-06-15', '8097080162', 'Bello Amanecer'),
    ('B', 'Meredi Amparo', 'Yaraisa Amparo Abelino', 13, '2013-06-15', '8297448469', 'Caracoli'),
    ('B', 'Santa Elizaire', 'Liah Escoto', 13, '2013-06-15', '8494708015', 'Cocotal'),
    ('B', 'Victoria Brito Viloria', 'Elis Viloria', 13, '2013-06-15', '8098401259', 'Bavaro Punta Cana'),
    ('B', 'Abigail Jada', 'Juvinda Milfort', 14, '2012-06-15', '8494889768', ''),
    ('B', 'Wilcani  Barinas', 'Yocani Barinas', 14, '2012-06-15', '8293666803', 'Residencial Don Rogelio'),
    ('B', 'Maria Victoria Fernandez Crispin', 'Angela Maria Crispin', 15, '2011-06-15', '8092091227', 'Residencial Bavaro Puntacana'),
    ('B', 'Richard Chales', 'Marie Maso Antis', 19, '2007-06-15', '8495938730', 'Veron'),
    ('B', 'Thaomi Mateo', 'Maria Guzman Ruiz', 19, '2007-06-15', '8299205227', 'Villa Playbo'),
    ('B', 'Escarline Urena', '', 27, '1999-06-15', '8299090717', 'Friusa');

  -- 8. PROCESAR INSCRIPCIONES Y ACTUALIZAR ALUMNOS
  FOR v_rec IN SELECT * FROM tmp_alumnos_grupos LOOP
    -- A) Buscar o crear el alumno en public.alumnos
    SELECT id INTO v_alumno_id 
    FROM public.alumnos 
    WHERE LOWER(TRIM(nombre_completo)) = LOWER(TRIM(v_rec.alumno)) 
    LIMIT 1;

    IF v_alumno_id IS NULL THEN
      INSERT INTO public.alumnos (
        nombre_completo,
        fecha_nacimiento,
        tutor_nombre,
        tutor_telefono,
        direccion,
        instrumento_principal,
        nivel,
        activo
      ) VALUES (
        TRIM(v_rec.alumno),
        v_rec.fecha_nacimiento,
        v_rec.representante,
        v_rec.telefono,
        v_rec.direccion,
        'Iniciación Musical',
        'Nivel 1',
        true
      )
      RETURNING id INTO v_alumno_id;
    ELSE
      -- Actualizar datos si ya existe
      UPDATE public.alumnos
      SET tutor_nombre = COALESCE(NULLIF(v_rec.representante, ''), tutor_nombre),
          tutor_telefono = COALESCE(NULLIF(v_rec.telefono, ''), tutor_telefono),
          direccion = COALESCE(NULLIF(v_rec.direccion, ''), direccion),
          activo = true
      WHERE id = v_alumno_id;
    END IF;

    -- B) Desvincular de la clase legacy si estaba inscrito en ella
    IF v_clase_tarde_legacy_id IS NOT NULL THEN
      DELETE FROM public.alumnos_clases 
      WHERE alumno_id = v_alumno_id AND clase_id = v_clase_tarde_legacy_id;
    END IF;

    -- C) Inscribir en su Grupo correspondiente (A o B)
    IF v_rec.grupo = 'A' THEN
      -- Desvincular de B si estuviese
      DELETE FROM public.alumnos_clases WHERE alumno_id = v_alumno_id AND clase_id = v_clase_grupo_b_id;
      
      -- Inscribir en A
      INSERT INTO public.alumnos_clases (clase_id, alumno_id, activo)
      VALUES (v_clase_grupo_a_id, v_alumno_id, true)
      ON CONFLICT (clase_id, alumno_id) DO UPDATE SET activo = true;
      v_inscritos_a := v_inscritos_a + 1;

    ELSIF v_rec.grupo = 'B' THEN
      -- Desvincular de A si estuviese
      DELETE FROM public.alumnos_clases WHERE alumno_id = v_alumno_id AND clase_id = v_clase_grupo_a_id;

      -- Inscribir en B
      INSERT INTO public.alumnos_clases (clase_id, alumno_id, activo)
      VALUES (v_clase_grupo_b_id, v_alumno_id, true)
      ON CONFLICT (clase_id, alumno_id) DO UPDATE SET activo = true;
      v_inscritos_b := v_inscritos_b + 1;
    END IF;

  END LOOP;

  RAISE NOTICE '==================================================';
  RAISE NOTICE '✨ REORGANIZACIÓN COMPLETADA CON ÉXITO:';
  RAISE NOTICE '   - Docente Titular: Prof. Raquel Payan (ID: %)', v_maestro_raquel_id;
  RAISE NOTICE '   - Clase Grupo A: % alumnos inscritos (ID: %)', v_inscritos_a, v_clase_grupo_a_id;
  RAISE NOTICE '   - Clase Grupo B: % alumnos inscritos (ID: %)', v_inscritos_b, v_clase_grupo_b_id;
  RAISE NOTICE '==================================================';

END $$;
