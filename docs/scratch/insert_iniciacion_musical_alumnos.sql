-- ==============================================================================
-- SOI (Sistema Operativo Institucional)
-- INSERCIÓN E INSCRIPCIÓN AUTOMÁTICA DE ALUMNOS DE INICIACIÓN MUSICAL
-- Idempotente (NO duplica registros si ya existen)
-- ==============================================================================

DO $$
DECLARE
  v_programa_id UUID;
  v_clase_manana_id UUID;
  v_clase_tarde_id UUID;
  v_maestro_default_id UUID;
  v_rec RECORD;
  v_alumno_id UUID;
  v_insertados INT := 0;
  v_omitidos INT := 0;
  v_inscritos INT := 0;
BEGIN
  RAISE NOTICE '🚀 Iniciando proceso de verificación e inserción...';

  -- 1. Obtener o crear Programa Base (Iniciación / Académico)
  SELECT id INTO v_programa_id FROM public.programas WHERE activo = true LIMIT 1;
  IF v_programa_id IS NULL THEN
    INSERT INTO public.programas (nombre, descripcion, activo)
    VALUES ('Iniciación Musical', 'Programa preparatorio e inicial de música', true)
    RETURNING id INTO v_programa_id;
  END IF;

  -- 2. Obtener Maestro principal disponible para las clases
  SELECT id INTO v_maestro_default_id FROM public.maestros WHERE activo = true LIMIT 1;

  -- 3. Asegurar existencia de las 2 clases de Iniciación Musical
  -- Clase Turno Mañana (9:00 AM - 12:00 PM)
  SELECT id INTO v_clase_manana_id FROM public.clases 
  WHERE LOWER(nombre) LIKE '%iniciaci%mañana%' OR LOWER(nombre) LIKE '%iniciaci%matutino%' LIMIT 1;
  
  IF v_clase_manana_id IS NULL THEN
    INSERT INTO public.clases (nombre, tipo_clase, programa_id, maestro_principal_id, activo, descripcion)
    VALUES (
      'Iniciación Musical - Turno Mañana',
      'grupal',
      v_programa_id,
      COALESCE(v_maestro_default_id, '00000000-0000-0000-0000-000000000000'::uuid),
      true,
      'Horario: 9:00 AM a 12:00 PM'
    )
    RETURNING id INTO v_clase_manana_id;

    -- Registrar horario si existe la tabla clase_horarios
    BEGIN
      INSERT INTO public.clase_horarios (clase_id, dia, hora_inicio, hora_fin)
      VALUES (v_clase_manana_id, 'Sábado', '09:00:00', '12:00:00');
    EXCEPTION WHEN OTHERS THEN
      -- Si ya existe o tabla no requerida en la versión actual, continuar
    END;
  END IF;

  -- Clase Turno Tarde (3:30 PM - 6:30 PM)
  SELECT id INTO v_clase_tarde_id FROM public.clases 
  WHERE LOWER(nombre) LIKE '%iniciaci%tarde%' OR LOWER(nombre) LIKE '%iniciaci%vespertino%' LIMIT 1;

  IF v_clase_tarde_id IS NULL THEN
    INSERT INTO public.clases (nombre, tipo_clase, programa_id, maestro_principal_id, activo, descripcion)
    VALUES (
      'Iniciación Musical - Turno Tarde',
      'grupal',
      v_programa_id,
      COALESCE(v_maestro_default_id, '00000000-0000-0000-0000-000000000000'::uuid),
      true,
      'Horario: 3:30 PM a 6:30 PM'
    )
    RETURNING id INTO v_clase_tarde_id;

    BEGIN
      INSERT INTO public.clase_horarios (clase_id, dia, hora_inicio, hora_fin)
      VALUES (v_clase_tarde_id, 'Sábado', '15:30:00', '18:30:00');
    EXCEPTION WHEN OTHERS THEN
    END;
  END IF;

  -- 4. TABLA TEMPORAL CON LOS ALUMNOS DEPURADOS
  CREATE TEMP TABLE tmp_alumnos_depurados (
    representante TEXT,
    alumno TEXT,
    edad INT,
    fecha_nacimiento DATE,
    cedula_pasaporte TEXT,
    telefono TEXT,
    direccion TEXT,
    turno TEXT,
    instrumento TEXT
  ) ON COMMIT DROP;

  INSERT INTO tmp_alumnos_depurados (representante, alumno, edad, fecha_nacimiento, cedula_pasaporte, telefono, direccion, turno, instrumento) VALUES
    ('Ana Machillanda', 'Dylan Machillanda', 12, '2014-06-15', 'si', '8293159040', 'Cortecito', 'tarde', NULL),
    ('Grismaldy Mercedes José Paulino', 'Iriam Méndez José', 8, '2018-06-15', 'si', '8292307813', 'Ciudad Del Rey', 'tarde', NULL),
    ('Antonieta Barreto', 'Liam Benitez', 7, '2019-06-15', 'si', '8294377749', 'Pueblo Bavaro', 'mañana', NULL),
    ('Juvinda Milfort', 'Abigail Jada', 14, '2012-06-15', 'no', '8494889768', '', 'tarde', NULL),
    ('Juan Carlos Saldaña', 'Alan Manuel Saldaña', 11, '2015-06-15', 'no', '8099069632', 'Veron', 'tarde', NULL),
    ('Noreliz De Los Santos', 'Amelia Mercedez', 7, '2019-06-15', 'si', '8294601827', 'Domingo Maiz, Veron', 'tarde', NULL),
    ('Lucymart Mateo', 'Amelia Olaverria', 9, '2017-06-15', 'no', '8293827967', 'Residenciales La Antigua', 'tarde', NULL),
    ('Dieula Charite', 'Anaika Plaisimond', 10, '2016-06-15', 'no', '8299324623', 'Punta Cana', 'tarde', NULL),
    ('Erika Ramirez', 'Angel David Ramirez', 10, '2016-06-15', 'si', '8096606513', 'Hotel Yonu', 'tarde', NULL),
    ('Marie Nose Antis', 'Ann Saena Antis', 11, '2015-06-15', 'no', '8495938730', 'Veron', 'tarde', NULL),
    ('Miledis Rodríguez Guerrero', 'Brianna Lisset Jiménez Rodríguez', 12, '2014-06-15', 'no', '8295285884', 'Residencial Don Domingo', 'tarde', NULL),
    ('Mercedes De La Cruz', 'Camila Celestino De La Cruz', 8, '2018-06-15', '', '8294568248', 'Calle Segunda Guateque', 'mañana', NULL),
    ('Mariel Polanco', 'Camila Del Carmen Luna Polanco', 7, '2019-06-15', 'si', '8292841840', 'Veron Punta Cana', 'tarde', NULL),
    ('Nicaury Diaz', 'Clariluz Castillo', 13, '2013-06-15', 'no', '8099799258', 'Residencial La Antigua', 'tarde', NULL),
    ('Barbara Strano', 'Coral Isabella', 7, '2019-06-15', 'si', '8298680851', 'Cocotal', 'tarde', NULL),
    ('Cinthya Castillo', 'Daniella Gomez Castillo', 10, '2016-06-15', 'si', '8293566985', 'Capcana', 'tarde', NULL),
    ('Martina Cedeño Mota', 'Darianny Gómez', 11, '2015-06-15', 'si', '8293481557', 'Veron', 'mañana', NULL),
    ('Carolyn Valdez', 'Darolyn Veloz Valdez', 11, '2015-06-15', 'si', '8297762023', 'Lotificacion Veron', 'tarde', NULL),
    ('Nelson Jimenes', 'Dylan Isaac Sanchez Urraca', 7, '2019-06-15', 'no', '8294398194', 'Sector Ayutamiento', 'tarde', NULL),
    ('Suzzell Pichardo', 'Eliseo Abreu', 9, '2017-06-15', 'no', '8099179580', 'Ciudad Caracoli', 'mañana', NULL),
    ('Yudeily Escarolina Ortega', 'Emmanuel Andres Santana Gils', 4, '2022-06-15', 'si', '8093954932', 'Friusa, Plaza Estrella', 'mañana', NULL),
    ('Erika Ramirez', 'Endy Jadiel Ramirez', 12, '2014-06-15', 'si', '8096606513', 'Hotel Yonu', 'tarde', NULL),
    ('Wilma Ferreira Cornier', 'Ezequiel Ortiz Ferreira', 8, '2018-06-15', 'no', '8293865759', 'Lotificacion Veron', 'tarde', NULL),
    ('Katherin Abreu', 'Haide Mejia', 6, '2020-06-15', 'si', '8293665351', 'Veron Pc', 'tarde', NULL),
    ('Jenaury', 'Justin Benitez', 14, '2012-06-15', 'no', '8299284914', 'Proyecto Puente Del Mar', 'mañana', NULL),
    ('Yaraisa Amparo Abelino', 'Jeremias Amparo', 8, '2018-06-15', 'si', '8297448469', 'Caracoli', 'tarde', NULL),
    ('Claribel Reyes', 'Lesauribel Reyes', 7, '2019-06-15', '', '8296508489', 'Domingo Maiz', 'mañana', NULL),
    ('Leidi Pamela Torres Carrasco', 'Leslie Camella Lopez Torres', 6, '2020-06-15', 'no', '8094039276', 'Domingo Maiz', 'tarde', NULL),
    ('Santa Elizaire', 'Liah Rashel Escoto', 13, '2013-06-15', 'si', '8299938015', 'Cocotal', 'tarde', NULL),
    ('Laura Elvira', 'Lilaj Del Angel García', 9, '2017-06-15', 'si', '529841507007', 'Bavaro Punta Cana', 'tarde', NULL),
    ('Lisbet Severino Nuñez', 'Lissette Jimenez', 13, '2013-06-15', 'si', '8097080162', 'Bello Amanecer', 'tarde', NULL),
    ('Angela Maria Crispin', 'Maria Victoria Fernandez Crispin', 15, '2011-06-15', 'no', '8092091227', 'Residencial Bavaro Puntacana', 'tarde', NULL),
    ('Minerva Rivas', 'Melany Vargas Rivas', 8, '2018-06-15', 'no', '8293295821', 'Veron', 'tarde', NULL),
    ('Yaraisa Amparo Abelino', 'Meredi Amparo', 13, '2013-06-15', 'si', '8297448469', 'Caracoli', 'tarde', NULL),
    ('Nayrobys Mateo', 'Nasly Daniel Majia Mateo', 7, '2019-06-15', 'no', '8298746735', 'Domingo Maiz', 'tarde', NULL),
    ('Yokaty De Leon Lopez', 'Oliver Yotniel Perez De Leon', 9, '2017-06-15', 'si', '', 'Veron', 'tarde', NULL),
    ('Yorli Bravo', 'Oriana Isabella Duarte', 9, '2017-06-15', 'si', '8297084180', 'Ciudad Cayenas', 'tarde', NULL),
    ('Leidi Pamela Torres Carrasco', 'Pameli Lopez', 8, '2018-06-15', 'no', '8094039276', 'Domingo Maiz', 'tarde', NULL),
    ('Veronica Diaz', 'Patricia Delva Diaz', 16, '2010-06-15', '', '8496334475', '', 'mañana', NULL),
    ('Alejandrina Lizardo Trinidad', 'Richard Alexander De La Cruz', 7, '2019-06-15', 'no', '8297596796', 'Lotificacion Veron', 'tarde', NULL),
    ('Marie Maso Antis', 'Richard Chales', 19, '2007-06-15', 'no', '8495938730', 'Veron', 'tarde', NULL),
    ('Isabell Mateo Alcantara', 'Rocio Francisca Reyes Perez', 12, '2014-06-15', 'no', '8496243270', 'Domingo Maiz', 'tarde', NULL),
    ('Isabell Mateo Alcantara', 'Rogelio Antonio Reyes Felix', 7, '2019-06-15', 'no', '8496243270', 'Domingo Maiz', 'tarde', NULL),
    ('Pamela Rodriguez', 'Samuel Elias Rodriguez', 7, '2019-06-15', 'no', '8492838673', 'Los Manantiales', 'tarde', NULL),
    ('Santa Nicolasa Falcon Cabrera', 'Sandy Olfran Garcia', 6, '2020-06-15', 'no', '8294370367', 'Veron', 'tarde', NULL),
    ('Genesis Castillo', 'Sara B Moya Castillo', 8, '2018-06-15', 'no', '8293863907', 'Veron Campolindo', 'tarde', NULL),
    ('Maria Guzman Ruiz', 'Thaomi Mateo', 19, '2007-06-15', 'no', '8299205227', 'Villa Playbo', 'tarde', NULL),
    ('Katherin Abreu', 'Vasti Mejia', 12, '2014-06-15', 'si', '8293665351', 'Veron Pc', 'tarde', NULL),
    ('Xiomara De Leon Lopez', 'Victor Daniel Garcia De Leon', 9, '2017-06-15', 'si', '8094659490', 'Los Manantiales', 'tarde', NULL),
    ('Elis Viloria', 'Victoria Brito Viloria', 13, '2013-06-15', 'si', '8098401259', 'Bavaro Punta Cana', 'tarde', 'Piano'),
    ('Yocani Barinas', 'Wellington Sebastian', 7, '2019-06-15', 'si', '8293666803', 'Residencial Don Rogelio', 'tarde', NULL),
    ('Yocani Barinas', 'Wilcani Barinas', 14, '2012-06-15', 'si', '8293666803', 'Residencial Don Rogelio', 'tarde', NULL),
    ('Yuliany Sosa', 'Yasser Nicolas Mejias', 8, '2018-06-15', 'si', '8293356974', 'Los Manantiales', 'tarde', NULL),
    ('Rodolfo Paredes', 'Matias Paredes', 5, '2021-06-15', 'si', '8095467711', 'Residecial Sueño Verde', 'mañana', NULL),
    ('', 'Escarline Urena', 27, '1999-06-15', 'si', '8299090717', 'Friusa', 'tarde', NULL),
    ('', 'Scarlet Salas', 28, '1998-06-15', '', '8299090717', 'Bavaro Punta Cana', 'tarde', 'Coro Sinfónico');

  -- 5. INSERTAR ALUMNOS NUEVOS (Omitiendo los que ya existen por nombre)
  FOR v_rec IN SELECT * FROM tmp_alumnos_depurados LOOP
    -- Verificar si el alumno ya existe en public.alumnos
    SELECT id INTO v_alumno_id FROM public.alumnos
    WHERE LOWER(TRIM(nombre_completo)) = LOWER(TRIM(v_rec.alumno));

    IF v_alumno_id IS NULL THEN
      INSERT INTO public.alumnos (
        nombre_completo,
        fecha_nacimiento,
        nivel,
        nivel_actual,
        instrumento_principal,
        representante_nombre,
        familiar_nombre,
        representante_tlf,
        familiar_telefono,
        direccion,
        activo
      ) VALUES (
        v_rec.alumno,
        v_rec.fecha_nacimiento,
        'inicial',
        1,
        v_rec.instrumento,
        NULLIF(v_rec.representante, ''),
        NULLIF(v_rec.representante, ''),
        NULLIF(v_rec.telefono, ''),
        NULLIF(v_rec.telefono, ''),
        NULLIF(v_rec.direccion, ''),
        true
      )
      RETURNING id INTO v_alumno_id;
      
      v_insertados := v_insertados + 1;
    ELSE
      v_omitidos := v_omitidos + 1;
    END IF;

    -- Inscribir al alumno en la clase correspondiente según su turno
    IF v_alumno_id IS NOT NULL THEN
      DECLARE
        v_target_clase UUID := CASE 
          WHEN LOWER(v_rec.turno) LIKE '%mañana%' THEN v_clase_manana_id 
          ELSE v_clase_tarde_id 
        END;
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM public.alumnos_clases 
          WHERE alumno_id = v_alumno_id AND clase_id = v_target_clase
        ) THEN
          INSERT INTO public.alumnos_clases (alumno_id, clase_id, activo, fecha_inscripcion)
          VALUES (v_alumno_id, v_target_clase, true, CURRENT_DATE);
          v_inscritos := v_inscritos + 1;
        END IF;
      END;
    END IF;

  END LOOP;

  RAISE NOTICE '==================================================';
  RAISE NOTICE '✅ PROCESO COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '🔹 Alumnos Nuevos Insertados: %', v_insertados;
  RAISE NOTICE '🔹 Alumnos Ya Existentes (Omitidos): %', v_omitidos;
  RAISE NOTICE '🔹 Inscripciones en Clases Creadas: %', v_inscritos;
  RAISE NOTICE '==================================================';

END $$;
