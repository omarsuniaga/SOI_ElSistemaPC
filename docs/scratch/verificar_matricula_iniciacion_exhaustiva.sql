-- ==============================================================================
-- SOI (Sistema Operativo Institucional) - El Sistema Punta Cana
-- SCRIPT DE AUDITORÍA Y VERIFICACIÓN EXHAUSTIVA DE MATRÍCULA
-- Comprueba alumno por alumno que esté formalmente inscrito en su clase
-- ==============================================================================

WITH lista_oficial AS (
  SELECT * FROM (
    VALUES
      -- GRUPO A (Tarde · 7 a 11 años · Prof. Raquel Payan)
      ('Alan Manuel Saldaña', 'Iniciación Musical - Grupo A (Tarde)', 11, 'tarde'),
      ('Amelia Mercedez', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Amelia Olaverria', 'Iniciación Musical - Grupo A (Tarde)', 9, 'tarde'),
      ('Angel David  Ramirez', 'Iniciación Musical - Grupo A (Tarde)', 10, 'tarde'),
      ('Ann Saena Antis', 'Iniciación Musical - Grupo A (Tarde)', 11, 'tarde'),
      ('Camila Del Carmen Luna Polanco', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Coral Isabella', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Daniella Gomez Castillo', 'Iniciación Musical - Grupo A (Tarde)', 10, 'tarde'),
      ('Darolyn Veloz Valdez', 'Iniciación Musical - Grupo A (Tarde)', 11, 'tarde'),
      ('Dylan Isaac Sanchez Urraca', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Iriam Méndez José', 'Iniciación Musical - Grupo A (Tarde)', 8, 'tarde'),
      ('Jeremias Amparo', 'Iniciación Musical - Grupo A (Tarde)', 8, 'tarde'),
      ('Lilaj Del Angel García', 'Iniciación Musical - Grupo A (Tarde)', 9, 'tarde'),
      ('Melany Vargas Rivas', 'Iniciación Musical - Grupo A (Tarde)', 8, 'tarde'),
      ('Nasly Daniel Majia Mateo', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Oliver Yotniel Perez De Leon', 'Iniciación Musical - Grupo A (Tarde)', 9, 'tarde'),
      ('Oriana Isabella Duarte', 'Iniciación Musical - Grupo A (Tarde)', 9, 'tarde'),
      ('Pameli Lopez', 'Iniciación Musical - Grupo A (Tarde)', 8, 'tarde'),
      ('Richard Alexander De La Cruz', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Rogelio Antonio Reyes Felix', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Samuel Elias Rodriguez', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Sara B Moya Castillo', 'Iniciación Musical - Grupo A (Tarde)', 8, 'tarde'),
      ('Victor Daniel Garcia De Leon', 'Iniciación Musical - Grupo A (Tarde)', 9, 'tarde'),
      ('Wellington Sebastian', 'Iniciación Musical - Grupo A (Tarde)', 7, 'tarde'),
      ('Yaraisa Amparo Avelino', 'Iniciación Musical - Grupo A (Tarde)', 8, 'tarde'),
      ('Yasser Nicolas Mejias', 'Iniciación Musical - Grupo A (Tarde)', 8, 'tarde'),

      -- GRUPO B (Tarde · < 7 o > 11 años · Prof. Raquel Payan)
      ('Haide Mejia', 'Iniciación Musical - Grupo B (Tarde)', 6, 'tarde'),
      ('Leslie Lopez', 'Iniciación Musical - Grupo B (Tarde)', 6, 'tarde'),
      ('Sandy Olfran Garcia', 'Iniciación Musical - Grupo B (Tarde)', 6, 'tarde'),
      ('Dylan Machillanda', 'Iniciación Musical - Grupo B (Tarde)', 12, 'tarde'),
      ('Brianna Lisset Jiménez Rodríguez', 'Iniciación Musical - Grupo B (Tarde)', 12, 'tarde'),
      ('Endy Jadiel Ramirez', 'Iniciación Musical - Grupo B (Tarde)', 12, 'tarde'),
      ('Rocio Francisca Reyes Perez', 'Iniciación Musical - Grupo B (Tarde)', 12, 'tarde'),
      ('Vasti Mejia', 'Iniciación Musical - Grupo B (Tarde)', 12, 'tarde'),
      ('Clariluz Castillo', 'Iniciación Musical - Grupo B (Tarde)', 13, 'tarde'),
      ('Liah Rashel Escoto', 'Iniciación Musical - Grupo B (Tarde)', 13, 'tarde'),
      ('Lissette Jimenez', 'Iniciación Musical - Grupo B (Tarde)', 13, 'tarde'),
      ('Meredi Amparo', 'Iniciación Musical - Grupo B (Tarde)', 13, 'tarde'),
      ('Santa Elizaire', 'Iniciación Musical - Grupo B (Tarde)', 13, 'tarde'),
      ('Victoria Brito Viloria', 'Iniciación Musical - Grupo B (Tarde)', 13, 'tarde'),
      ('Abigail Jada', 'Iniciación Musical - Grupo B (Tarde)', 14, 'tarde'),
      ('Wilcani  Barinas', 'Iniciación Musical - Grupo B (Tarde)', 14, 'tarde'),
      ('Maria Victoria Fernandez Crispin', 'Iniciación Musical - Grupo B (Tarde)', 15, 'tarde'),
      ('Richard Chales', 'Iniciación Musical - Grupo B (Tarde)', 19, 'tarde'),
      ('Thaomi Mateo', 'Iniciación Musical - Grupo B (Tarde)', 19, 'tarde'),
      ('Escarline Urena', 'Iniciación Musical - Grupo B (Tarde)', 27, 'tarde')
  ) AS t(nombre_esperado, clase_esperada, edad_esperada, turno_esperado)
)
SELECT 
  lo.nombre_esperado AS "Alumno en Lista",
  lo.edad_esperada AS "Edad",
  lo.clase_esperada AS "Clase Asignada",
  COALESCE(m.nombre_completo, '⚠️ Sin docente') AS "Docente",
  CASE 
    WHEN a.id IS NULL THEN '🔴 ALUMNO NO REGISTRADO EN SUPABASE'
    WHEN ac.clase_id IS NULL THEN '🟡 ALUMNO REGISTRADO PERO SIN CLASE VINCULADA'
    WHEN LOWER(c.nombre) = LOWER(lo.clase_esperada) THEN '🟢 MATRICULADO CORRECTAMENTE'
    ELSE '⚠️ ASIGNADO A OTRA CLASE: ' || c.nombre
  END AS "Estado de Verificación"
FROM lista_oficial lo
LEFT JOIN public.alumnos a ON LOWER(TRIM(a.nombre_completo)) = LOWER(TRIM(lo.nombre_esperado))
LEFT JOIN public.alumnos_clases ac ON ac.alumno_id = a.id AND ac.activo = true
LEFT JOIN public.clases c ON c.id = ac.clase_id
LEFT JOIN public.maestros m ON m.id = c.maestro_principal_id
ORDER BY lo.clase_esperada, lo.nombre_esperado;
