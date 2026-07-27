-- 20260727_nodos_codigo_y_cobertura.sql
--
-- Cierra el puente entre lo que el maestro YA escribe y el currículo formal.
--
-- CONTEXTO
-- --------
-- Los maestros registran sus clases en `sesiones_clase.contenido` (45 de 49 sesiones)
-- usando un DSL que inventaron ellos:
--
--     #Adhara García [colocación del 1er y 2do dedo] (tiene mayor dificultad) 2/5
--
-- Ese texto contiene todo lo que una evaluación necesita: alumno, contenido,
-- observación y nota. `dslParser.js` ya lo interpreta, e incluso define un token
-- `>CODIGO` para referenciar objetivos del currículo — pero ninguna tabla del
-- currículo tenía códigos, así que el token apuntaba al vacío.
--
-- Esta migración le da vocabulario a ese token y permite derivar cobertura
-- curricular del texto que el maestro ya escribe, sin pedirle un clic adicional.
--
-- POR QUÉ NODO Y NO INDICADOR
-- ---------------------------
-- Evaluar por indicador exige 24 marcas por alumno por nivel: con once alumnos son
-- 264 por clase. Se intentó y se abandonó en dos días (indicator_attempts: 20 filas,
-- 11 y 12 de mayo). El registro por sesión con estado y prosa lleva 192 registros
-- sostenidos. El nodo es la unidad de trabajo real: 8 por nivel, y es lo que el
-- maestro nombra cuando escribe "se trabajó con escalas".

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. CÓDIGO DE NODO
--
-- El código identifica la CATEGORÍA de trabajo, no la fila: los mismos 8 nodos se
-- repiten en los 40 niveles, así que `codigo` no es único. `ESC` aparece 40 veces,
-- una por nivel. El nivel lo aporta el contexto de la clase, no el código.
--
-- Sólo se codifican los nodos con nomenclatura canónica. Las versiones de ruta con
-- nombres generados ("Node 1.1", "ARCO 10 - Nivel 3") quedan en NULL a propósito:
-- son las que ACM debe retirar, y codificarlas les daría una apariencia de validez
-- que no tienen.
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.nodes
  ADD COLUMN IF NOT EXISTS codigo text;

COMMENT ON COLUMN public.nodes.codigo IS
  'Codigo corto de la categoria de trabajo (ESC, ARP, MI, ARC, SON, AFI, EST, REP). No es unico: se repite una vez por nivel. NULL en nodos de versiones con nomenclatura generada.';

UPDATE public.nodes SET codigo = CASE
  WHEN name = 'Escalas'                 THEN 'ESC'
  WHEN name = 'Arpegios y patrones'     THEN 'ARP'
  WHEN name = 'Mano izquierda'          THEN 'MI'
  WHEN name = 'Arco'                    THEN 'ARC'
  WHEN name = 'Sonido'                  THEN 'SON'
  WHEN name = 'Afinación'               THEN 'AFI'
  WHEN name = 'Estudios técnicos'       THEN 'EST'
  WHEN name LIKE 'Repertorio%'          THEN 'REP'
END
WHERE name IN ('Escalas','Arpegios y patrones','Mano izquierda','Arco',
               'Sonido','Afinación','Estudios técnicos')
   OR name LIKE 'Repertorio%';

CREATE INDEX IF NOT EXISTS idx_nodes_codigo
  ON public.nodes (codigo) WHERE codigo IS NOT NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. NODO TRABAJADO EN LA SESIÓN
--
-- Una columna. Es todo lo que falta para que ACM tenga cobertura curricular.
-- Nullable: una sesión puede ser un concierto, un ensayo general o una clase
-- suspendida, y forzar un nodo ahí sería inventar dato.
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.sesiones_clase
  ADD COLUMN IF NOT EXISTS node_id uuid REFERENCES public.nodes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS node_origen text
    CHECK (node_origen IS NULL OR node_origen IN ('explicito','derivado','manual'));

COMMENT ON COLUMN public.sesiones_clase.node_id IS
  'Nodo curricular trabajado en la sesion. Base de la metrica de cobertura.';
COMMENT ON COLUMN public.sesiones_clase.node_origen IS
  'Como se determino: explicito (el maestro escribio >CODIGO), derivado (inferido del texto y confirmado), manual (elegido en la interfaz).';

CREATE INDEX IF NOT EXISTS idx_sesiones_node
  ON public.sesiones_clase (node_id) WHERE node_id IS NOT NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. RESOLUCIÓN DE TEXTO A NODO
--
-- Puntúa el texto del maestro contra el vocabulario de cada categoría y devuelve
-- los candidatos ordenados. NO decide: propone. La confirmación es del maestro,
-- que es quien sabe qué trabajó.
--
-- El vocabulario se calibró sobre las frases reales registradas en produccion:
--   "se trabajo con la posiciones de los 3 dedos"        -> MI
--   "ejercicios previos antes de empezar la escala"      -> ESC
--   "escalas mayores y menores, limitadas a 3 octavas"   -> ESC
--   "colocacion del 1ero y 2do dedo"                     -> MI
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_sugerir_nodo_por_texto(p_texto text)
RETURNS TABLE (codigo text, nombre text, aciertos integer)
LANGUAGE sql
IMMUTABLE
AS $function$
  WITH vocab(codigo, nombre, termino) AS (VALUES
    ('ESC','Escalas','escala'),        ('ESC','Escalas','escalas'),
    ('ESC','Escalas','octava'),        ('ESC','Escalas','cromatic'),
    ('ARP','Arpegios y patrones','arpegio'),  ('ARP','Arpegios y patrones','triada'),
    ('ARP','Arpegios y patrones','acorde'),   ('ARP','Arpegios y patrones','patron'),
    ('MI','Mano izquierda','dedo'),    ('MI','Mano izquierda','dedos'),
    ('MI','Mano izquierda','mano izq'),('MI','Mano izquierda','posicion'),
    ('MI','Mano izquierda','vibrato'), ('MI','Mano izquierda','digitac'),
    ('MI','Mano izquierda','colocacion'),
    ('ARC','Arco','arco'),             ('ARC','Arco','detache'),
    ('ARC','Arco','legato'),           ('ARC','Arco','martele'),
    ('ARC','Arco','spiccato'),         ('ARC','Arco','staccato'),
    ('ARC','Arco','articulacion'),
    ('SON','Sonido','sonido'),         ('SON','Sonido','color'),
    ('SON','Sonido','dinamic'),        ('SON','Sonido','timbre'),
    ('AFI','Afinación','afinacion'),   ('AFI','Afinación','afinar'),
    ('AFI','Afinación','entonacion'),  ('AFI','Afinación','oido'),
    ('EST','Estudios técnicos','estudio'),   ('EST','Estudios técnicos','kreutzer'),
    ('EST','Estudios técnicos','mazas'),     ('EST','Estudios técnicos','rode'),
    ('EST','Estudios técnicos','gavinies'),  ('EST','Estudios técnicos','ejercicio tecnico'),
    ('REP','Repertorio','repertorio'), ('REP','Repertorio','obra'),
    ('REP','Repertorio','concierto'),  ('REP','Repertorio','pieza'),
    ('REP','Repertorio','cancion'),    ('REP','Repertorio','vivaldi'),
    ('REP','Repertorio','accolay'),    ('REP','Repertorio','danzon')
  ),
  -- Normaliza acentos para que "afinación" y "afinacion" cuenten igual.
  norm AS (
    SELECT lower(translate(coalesce(p_texto,''),
      'áéíóúüñÁÉÍÓÚÜÑ','aeiouunAEIOUUN')) AS t
  )
  SELECT v.codigo, v.nombre, count(*)::integer
  FROM vocab v, norm n
  WHERE position(v.termino IN n.t) > 0
  GROUP BY v.codigo, v.nombre
  ORDER BY count(*) DESC, v.codigo;
$function$;

COMMENT ON FUNCTION public.fn_sugerir_nodo_por_texto IS
  'Propone categorias de nodo a partir del texto libre del maestro. Devuelve candidatos ordenados por aciertos; no decide por si sola.';

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. COBERTURA CURRICULAR
--
-- Lo que ACM necesita y hoy el informe de cierre reporta como SIN_DATOS: qué
-- nodos se trabajaron, en qué clases, cuántas veces. Derivado del registro del
-- maestro, sin pedirle nada nuevo.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_cobertura_curricular(p_periodo_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH periodo AS (SELECT * FROM public.periodos WHERE id = p_periodo_id),
  ses AS (
    SELECT s.id, s.clase_id, s.node_id, s.contenido,
           c.nombre AS clase, c.route_version_id
    FROM public.sesiones_clase s
    CROSS JOIN periodo p
    LEFT JOIN public.clases c ON c.id = s.clase_id
    WHERE s.fecha BETWEEN p.fecha_inicio AND p.fecha_fin
      AND s.estado <> 'cancelada'
      AND public.fn_es_dia_lectivo(s.fecha)
  ),
  cat AS (SELECT DISTINCT codigo, name FROM public.nodes WHERE codigo IS NOT NULL)
  SELECT jsonb_build_object(
    'total_sesiones',      (SELECT count(*) FROM ses),
    'con_nodo',            (SELECT count(*) FROM ses WHERE node_id IS NOT NULL),
    'sin_nodo',            (SELECT count(*) FROM ses WHERE node_id IS NULL),
    'con_texto_sin_nodo',  (SELECT count(*) FROM ses
                             WHERE node_id IS NULL AND coalesce(contenido,'') <> ''),
    'pct_vinculacion',
      CASE WHEN (SELECT count(*) FROM ses) = 0 THEN NULL
           ELSE round(((SELECT count(*) FROM ses WHERE node_id IS NOT NULL)::numeric
                       / (SELECT count(*) FROM ses)::numeric) * 100, 1) END,
    'por_categoria', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'codigo', c.codigo, 'nombre', c.name,
          'sesiones', (SELECT count(*) FROM ses s
                        JOIN public.nodes n ON n.id = s.node_id
                        WHERE n.codigo = c.codigo),
          'clases', (SELECT count(DISTINCT s.clase_id) FROM ses s
                      JOIN public.nodes n ON n.id = s.node_id
                      WHERE n.codigo = c.codigo)
        ) ORDER BY c.codigo), '[]'::jsonb)
      FROM cat c),
    -- Un nodo sin sesiones no es un error: puede no tocar ese trimestre. Pero ACM
    -- necesita verlo para decidir si es una decision o un olvido.
    'categorias_sin_trabajar', (
      SELECT coalesce(jsonb_agg(c.codigo ORDER BY c.codigo), '[]'::jsonb)
      FROM cat c
      WHERE NOT EXISTS (SELECT 1 FROM ses s JOIN public.nodes n ON n.id = s.node_id
                        WHERE n.codigo = c.codigo)),
    'por_clase', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
          'clase', clase, 'sesiones', n_ses, 'con_nodo', n_nodo,
          'categorias', cats) ORDER BY clase), '[]'::jsonb)
      FROM (
        SELECT s.clase, count(*) n_ses,
               count(s.node_id) n_nodo,
               coalesce(jsonb_agg(DISTINCT nd.codigo) FILTER (WHERE nd.codigo IS NOT NULL), '[]'::jsonb) cats
        FROM ses s LEFT JOIN public.nodes nd ON nd.id = s.node_id
        WHERE s.clase IS NOT NULL
        GROUP BY s.clase
      ) x)
  );
$function$;

COMMENT ON FUNCTION public.fn_cobertura_curricular IS
  'Cobertura curricular del periodo: que nodos se trabajaron, en que clases. Reemplaza el SIN_DATOS del informe de cierre.';

REVOKE ALL ON FUNCTION public.fn_sugerir_nodo_por_texto(text) FROM public, anon;
REVOKE ALL ON FUNCTION public.fn_cobertura_curricular(uuid)   FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_sugerir_nodo_por_texto(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_cobertura_curricular(uuid)   TO authenticated, service_role;

COMMIT;
