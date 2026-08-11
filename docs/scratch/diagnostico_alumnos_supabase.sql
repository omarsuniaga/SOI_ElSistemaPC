-- ==============================================================================
-- SOI - SCRIPT DE DIAGNÓSTICO, VERIFICACIÓN E INSERCIÓN SEGURA DE ALUMNOS NUEVOS
-- Clase: Iniciación Musical (Turno Mañana / Turno Tarde)
-- ==============================================================================

-- 1. TABLA TEMPORAL DE ALUMNOS CANDIDATOS
CREATE TEMP TABLE tmp_nuevos_alumnos (
  line_num INT,
  representante_nombre TEXT,
  nombre_completo TEXT,
  edad INT,
  fecha_nacimiento_estimada DATE,
  tiene_pasaporte TEXT,
  representante_tlf TEXT,
  direccion TEXT,
  turno_solicitado TEXT,
  instrumento_interes TEXT
) ON COMMIT DROP;

INSERT INTO tmp_nuevos_alumnos VALUES
  (1, 'Ana Machillanda', 'Dylan Machillanda', 12, '2014-06-15', 'si', '8293159040', 'Cortecito', 'tarde', NULL),
  (2, 'Grismaldy Mercedes José Paulino', 'Iriam Méndez José', 8, '2018-06-15', 'si', '8292307813', 'Ciudad Del Rey', 'tarde', NULL),
  (3, 'Antonieta Barreto', 'Liam Benitez', 7, '2019-06-15', 'si', '8294377749', 'Pueblo Bavaro', 'mañana', NULL),
  (4, 'Juvinda Milfort', 'Abigail Jada', 14, '2012-06-15', 'no', '8494889768', '', 'tarde', NULL),
  (5, 'Juan Carlos Saldaña', 'Alan Manuel Saldaña', 11, '2015-06-15', 'no', '8099069632', 'Veron', 'tarde', NULL),
  (6, 'Noreliz De Los Santos', 'Amelia Mercedez', 7, '2019-06-15', 'si', '8294601827', 'Domingo Maiz, Veron', 'tarde', NULL),
  (7, 'Lucymart Mateo', 'Amelia Olaverria', 9, '2017-06-15', 'no', '8293827967', 'Residenciales La Antigua', 'tarde', NULL),
  (8, 'Dieula Charite', 'Anaika Plaisimond', 10, '2016-06-15', 'no', '8299324623', 'Punta Cana', '', NULL),
  (9, 'Erika Ramirez', 'Angel David  Ramirez', 10, '2016-06-15', 'si', '8096606513', 'Hotel Yonu', 'tarde', NULL),
  (10, 'Marie  Nose Antis', 'Ann Saena Antis', 11, '2015-06-15', 'no', '8495938730', 'Veron', 'tarde', NULL),
  (11, 'Miledis Rodríguez Guerrero', 'Brianna Lisset Jiménez Rodríguez', 12, '2014-06-15', 'no', '8295285884', 'Residencial Don Domingo', 'tarde', NULL),
  (12, 'Mercedes De La Cruz', 'Camila Celestino De La Cruz', 8, '2018-06-15', '', '8294568248', 'Calle Segunda Guateque', 'mañana', NULL),
  (13, 'Mariel Polanco', 'Camila Del Carmen Luna Polanco', 7, '2019-06-15', 'si', '8292841840', 'Veron Punta Cana', 'tarde', NULL),
  (14, 'Nicaury Diaz', 'Clariluz Castillo', 13, '2013-06-15', 'no', '8099799258', 'Residencial La Antigua', 'tarde', NULL),
  (15, 'Barbara Strano', 'Coral Isabella', 7, '2019-06-15', 'si', '8298680851', 'Cocotal', 'tarde', NULL),
  (16, 'Cinthya Castillo', 'Daniella Gomez Castillo', 10, '2016-06-15', 'si', '8293566985', 'Capcana', 'tarde', NULL),
  (17, 'Martina Cedeño Mota', 'Darianny Gómez', 11, '2015-06-15', 'si', '8293481557', 'Veron', 'mañana', NULL),
  (18, 'Carolyn Valdez', 'Darolyn Veloz Valdez', 11, '2015-06-15', 'si', '8297762023', 'Lotificacion Veron', 'tarde', NULL),
  (19, 'Nelson Jimenes', 'Dylan Isaac Sanchez Urraca', 7, '2019-06-15', 'no', '8294398194', 'Sector Ayutamiento', 'tarde', NULL),
  (20, 'Suzzell Pichardo', 'Eliseo Abreu', 9, '2017-06-15', 'no', '8099179580', 'Ciudad Caracoli', 'mañana', NULL),
  (21, 'Yudeily Escarolina Ortega', 'Emmanuel Andres Santana Gils', 4, '2022-06-15', 'si', '8093954932', 'Friusa, Plaza Estrella', 'mañana', NULL),
  (22, 'Erika Ramirez', 'Endy Jadiel Ramirez', 12, '2014-06-15', 'si', '8096606513', 'Hotel Yonu', 'tarde', NULL),
  (23, 'Wilma Ferreira Cornier', 'Ezequiel Ortiz Ferreira', 8, '2018-06-15', 'no', '8293865759', 'Lotificacion Veron', 'cualquiera', NULL),
  (24, 'Katherin Abreu', 'Haide Mejia', 6, '2020-06-15', 'si', '8293665351', 'Veron Pc', 'tarde', NULL),
  (25, 'Jenaury', 'Justin Benitez', 14, '2012-06-15', 'no', '8299284914', 'Proyecto Puente Del Mar', 'mañana', NULL),
  (26, 'Yaraisa Amparo Abelino', 'Jeremias Amparo', 8, '2018-06-15', 'si', '8297448469', 'Caracoli', 'tarde', NULL),
  (27, 'Claribel Reyes', 'Lesauribel Reyes', 7, '2019-06-15', '', '8296508489', 'Domingo Maiz', 'mañana', NULL),
  (28, 'Leidi Pamela Toros', 'Leslie Camella Lopez Toros', 6, '2020-06-15', 'no', '8094039276', 'Domingo Maiz', '', NULL),
  (29, 'Leidi Pamela Torres Carrasco', 'Leslie Lopez', 6, '2020-06-15', 'no', '8094039276', 'Domingo Maiz', 'tarde', NULL),
  (30, 'Santa Elizaire', 'Liah Rashel Escoto', 13, '2013-06-15', 'si', '8299938015', 'Cocotal', 'tarde', NULL),
  (31, 'Laura Elvira', 'Lilaj Del Angel García', 9, '2017-06-15', 'si', '529841507007', 'Bavaro Punta Cana', 'tarde', NULL),
  (32, 'Lisbet Severino Nuñez', 'Lissette Jimenez', 13, '2013-06-15', 'si', '8097080162', 'Bello Amanecer', 'tarde', NULL),
  (33, 'Angela Maria Crispin', 'Maria Victoria Fernandez Crispin', 15, '2011-06-15', 'no', '8092091227', 'Residencial Bavaro Puntacana', 'tarde', NULL),
  (34, 'Minerva Rivas', 'Melany Vargas Rivas', 8, '2018-06-15', 'no', '8293295821', 'Veron', 'tarde', NULL),
  (35, 'Yaraisa Amparo Abelino', 'Meredi Amparo', 13, '2013-06-15', 'si', '8297448469', 'Caracoli', 'tarde', NULL),
  (36, 'Nayrobys Mateo', 'Nasly Daniel Majia Mateo', 7, '2019-06-15', 'no', '8298746735', 'Domingo Maiz', 'tarde', NULL),
  (37, 'Yokaty De Leon Lopez', 'Oliver Yotniel Perez De Leon', 9, '2017-06-15', 'si', '', 'Veron', 'tarde', NULL),
  (38, 'Yorli Bravo', 'Oriana Isabella Duarte', 9, '2017-06-15', 'si', '8297084180', 'Ciudad Cayenas', 'tarde', NULL),
  (39, 'Leidi Pamela Torres Carrasco', 'Pameli Lopez', 8, '2018-06-15', 'no', '8094039276', 'Domingo Maiz', 'tarde', NULL),
  (40, 'Veronica Diaz', 'Patricia Delva Diaz', 16, '2010-06-15', '', '8496334475', '', 'mañana', NULL),
  (41, 'Alejandrina Lizardo Trinidad', 'Richard Alexander De La Cruz', 7, '2019-06-15', 'no', '8297596796', 'Lotificacion Veron', 'tarde', NULL),
  (42, 'Marie Maso Antis', 'Richard Chales', 19, '2007-06-15', 'no', '8495938730', 'Veron', 'tarde', NULL),
  (43, 'Isabell Mateo Alcantara', 'Rocio Francisca Reyes Perez', 12, '2014-06-15', 'no', '8496243270', 'Domingo Maiz', 'tarde', NULL),
  (44, 'Isabell Mateo Alcantara', 'Rogelio Antonio Reyes Felix', 7, '2019-06-15', 'no', '8496243270', 'Domingo Maiz', 'tarde', NULL),
  (45, 'Pamela Rodriguez', 'Samuel Elias Rodriguez', 7, '2019-06-15', 'no', '8492838673', 'Los Manantiales', 'tarde', NULL),
  (46, 'Santa Nicolasa Falcon Cabrera', 'Sandy Olfran Garcia', 6, '2020-06-15', 'no', '8294370367', 'Veron', 'tarde', NULL),
  (47, 'Liah Escoto', 'Santa Elizaire', 13, '2013-06-15', 'si', '8494708015', 'Cocotal', 'tarde', NULL),
  (48, 'Genesis Castillo', 'Sara B Moya Castillo', 8, '2018-06-15', 'no', '8293863907', 'Veron Campolindo', 'tarde', NULL),
  (49, 'Meredit Miosoti Amparo Amparo', 'Jeremías Amparo', 8, '2018-06-15', 'si', '8297448469', 'Caracoli', 'tarde', NULL),
  (50, 'Maria Guzman Ruiz', 'Thaomi Mateo', 19, '2007-06-15', 'no', '8299205227', 'Villa Playbo', 'tarde', NULL),
  (51, 'Katherin Abreu', 'Vasti Mejia', 12, '2014-06-15', 'si', '8293665351', 'Veron Pc', 'tarde', NULL),
  (52, 'Xiomara De Leon Lopez', 'Victor Daniel Garcia De Leon', 9, '2017-06-15', 'si', '8094659490', 'Los Manantiales', 'tarde', NULL),
  (53, 'Elis Viloria', 'Victoria Brito Viloria', 13, '2013-06-15', 'si', '8098401259', 'Bavaro Punta Cana', 'tarde', 'Piano'),
  (54, 'Yocani Barinas', 'Wellington Sebastian', 7, '2019-06-15', 'si', '8293666803', 'Residencial Don Rogelio', 'tarde', NULL),
  (55, 'Yocani Barinas', 'Wilcani  Barinas', 14, '2012-06-15', 'si', '8293666803', 'Residencial Don Rogelio', 'tarde', NULL),
  (56, 'Jeremías Amparo Amparo', 'Yaraisa Amparo Avelino', 8, '2018-06-15', 'si', '8297448469', 'Caracoli', 'tarde', NULL),
  (57, 'Yuliany  Sosa', 'Yasser Nicolas Mejias', 8, '2018-06-15', 'si', '8293356974', 'Los Manantiales', 'tarde', NULL),
  (58, '', 'Escarline Urena', 27, '1999-06-15', 'si', '8299090717', 'Friusa', 'tarde', NULL),
  (59, 'Johanny Joseph', '', 8, '2018-06-15', '', '', '', '', NULL),
  (60, '', 'Scarlet Salas', 28, '1998-06-15', '', '8299090717', 'Bavaro Punta Cana', 'coro sinfónico', 'Coro'),
  (61, 'Rodolfo Paredes', 'Matias Paredes', 5, '2021-06-15', 'si', '8095467711', 'Residecial Sueño Verde', 'cualquiera revisa esto', NULL);

-- 2. CONSULTA DE DIAGNÓSTICO DE DUPLICADOS Y COINCIDENCIAS CON LA BASE DE DATOS
SELECT 
  t.line_num AS "Línea",
  t.nombre_completo AS "Alumno Solicitado",
  t.edad AS "Edad",
  t.representante_nombre AS "Representante",
  t.representante_tlf AS "Teléfono",
  t.turno_solicitado AS "Turno",
  CASE 
    WHEN t.nombre_completo = '' THEN '⚠️ ANOMALÍA: Sin nombre de alumno'
    WHEN a.id IS NOT NULL THEN '🔴 YA REGISTRADO EN SUPABASE (ID: ' || a.id::text || ')'
    WHEN dup.count > 1 THEN '🟡 DUPLICADO INTERNO EN LISTA'
    WHEN t.edad >= 18 THEN '🔵 ALUMNO ADULTO (' || t.edad || ' años)'
    ELSE '🟢 NUEVO (Listo para registrar)'
  END AS "Estado Diagnóstico"
FROM tmp_nuevos_alumnos t
LEFT JOIN public.alumnos a ON LOWER(TRIM(a.nombre_completo)) = LOWER(TRIM(t.nombre_completo))
LEFT JOIN (
  SELECT LOWER(TRIM(nombre_completo)) as norm_name, COUNT(*) as count 
  FROM tmp_nuevos_alumnos 
  WHERE nombre_completo <> ''
  GROUP BY LOWER(TRIM(nombre_completo))
) dup ON dup.norm_name = LOWER(TRIM(t.nombre_completo))
ORDER BY t.line_num;
