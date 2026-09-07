-- Saneamiento de inventario — Fase 3: materiales / consumibles / insumos
-- Fuente: INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx, hoja AGOSTO 2026
-- Consumibles a granel que no son instrumentos (inventario_activos) ni
-- accesorios de un instrumento puntual (inventario_accesorios).

BEGIN;

CREATE TABLE IF NOT EXISTS public.inventario_materiales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item text NOT NULL,
  categoria text,
  familia_instrumento text,
  marca text,
  modelo text,
  cantidad numeric,
  unidad text NOT NULL DEFAULT 'unidad',
  descripcion text,
  ubicacion text,
  activo boolean NOT NULL DEFAULT true,
  fuente_importacion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventario_materiales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS materiales_authenticated_select ON public.inventario_materiales;
CREATE POLICY materiales_authenticated_select ON public.inventario_materiales FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS materiales_admin_insert ON public.inventario_materiales;
CREATE POLICY materiales_admin_insert ON public.inventario_materiales FOR INSERT TO authenticated WITH CHECK (es_admin());
DROP POLICY IF EXISTS materiales_admin_update ON public.inventario_materiales;
CREATE POLICY materiales_admin_update ON public.inventario_materiales FOR UPDATE TO authenticated USING (es_admin());
DROP POLICY IF EXISTS materiales_admin_delete ON public.inventario_materiales;
CREATE POLICY materiales_admin_delete ON public.inventario_materiales FOR DELETE TO authenticated USING (es_admin());

GRANT SELECT ON public.inventario_materiales TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.inventario_materiales TO authenticated;

-- Carga inicial (idempotente por item+marca+modelo mientras no haya código propio)
INSERT INTO public.inventario_materiales (item, categoria, familia_instrumento, marca, modelo, cantidad, unidad, descripcion, fuente_importacion)
SELECT * FROM (VALUES
  ('GRASA', 'lubricante', 'maderas', 'SUPERSLICK', 'TUNING SLIDE GREASE', 21::numeric, 'unidad', 'Grasa para bombas y corchos', 'xlsx-agosto-2026'),
  ('ACEITE', 'lubricante', 'metales', 'SUPERSLICK', 'ALPHA SYNTH PREMIUM', 12::numeric, 'unidad', 'Aceite para valvulas y rotores', 'xlsx-agosto-2026'),
  ('AFINADORES', 'electronico', NULL, 'TUNER CANDY', 'TCT-60M', 16::numeric, 'unidad', 'Afinador digital con microfono de pinza, 4 afinadores asignados', 'xlsx-agosto-2026'),
  ('ACEITE', 'lubricante', 'metales', 'YAMAHA', 'SLIDE LUBRICANT', 14::numeric, 'unidad', 'Aceite para la vara del trombón', 'xlsx-agosto-2026'),
  ('ACEITE', 'lubricante', 'metales', 'SUPERSLICK', 'ALPHA SYNTH PREMIUM', 12::numeric, 'unidad', 'Aceite para la vara del trombón (Envase blanco letras negras) Trombone Handslide Lube)', 'xlsx-agosto-2026'),
  ('KIT DE LIMPIEZA', 'limpieza', 'metales', 'YAMAHA', NULL, 18::numeric, 'unidad', 'Kit de limpieza para trompeta, trae aceite, grasa y una paño.', 'xlsx-agosto-2026'),
  ('CAÑAS DE CLARINETE 3', 'cana', 'maderas', 'VANDOREN', 'PARIS', 49::numeric, 'unidad', 'Caña de clarinete tamaño 3', 'xlsx-agosto-2026'),
  ('CAÑAS DE CLARINETE 2', 'cana', 'maderas', 'VANDOREN', 'PARIS', 8::numeric, 'unidad', 'Caña de clarinete tamaño 2', 'xlsx-agosto-2026'),
  ('BAQUETAS DE XILOFONO', 'baqueta', 'percusion', 'PROMARK', NULL, 3::numeric, 'par', 'Baquetas para xilofono, de goma verde, rosada y de hilo.', 'xlsx-agosto-2026'),
  ('BAQUETAS DE REDOBLANTE', 'baqueta', 'percusion', 'PROMARK', NULL, 2::numeric, 'par', 'Baquetas para redoble, de distinto tamaño en la punta.', 'xlsx-agosto-2026'),
  ('BOLSO PARA BAQUETAS', 'baqueta', NULL, 'PROMARK', NULL, 1::numeric, 'unidad', 'Bolso para porta baquetas', 'xlsx-agosto-2026'),
  ('BAQUETAS PARA TIMPANI', 'baqueta', 'percusion', 'PROMARK', 'PST1', 3::numeric, 'par', 'Baquetas para timpani', 'xlsx-agosto-2026'),
  ('BAQUETAS PARA TIMPANI', 'baqueta', 'percusion', 'PROMARK', 'PST3', 3::numeric, 'par', 'Baquetas para timpani', 'xlsx-agosto-2026'),
  ('BAQUETAS PARA TIMPANI', 'baqueta', 'percusion', 'PROMARK', 'PST4', 3::numeric, 'par', 'Baquetas para timpani', 'xlsx-agosto-2026'),
  ('SORDINA DE TROMBON', 'accesorio', 'metales', NULL, NULL, 4::numeric, 'unidad', '2 sordinas de madera y 2 de metal', 'xlsx-agosto-2026'),
  ('CAÑA DE FAGOT', 'cana', 'maderas', 'JONES', 'MEDIUM SOFT', 10::numeric, 'unidad', 'Cañas de fagot de hilo morado', 'xlsx-agosto-2026'),
  ('CAÑA DE FAGOT', 'cana', 'maderas', NULL, NULL, NULL::numeric, 'unidad', NULL, 'xlsx-agosto-2026'),
  ('CAÑAS DE OBOE', 'cana', 'maderas', 'JONES', 'MEDIUM SOFT', 4::numeric, 'unidad', 'Cañas de oboe de hilo morado', 'xlsx-agosto-2026'),
  ('CAÑAS DE OBOE', 'cana', 'maderas', NULL, NULL, 1::numeric, 'unidad', 'Cañas de oboe de hilo rojo', 'xlsx-agosto-2026'),
  ('CAÑAS DE CLARINETE 2', 'cana', 'maderas', 'RICO', NULL, 4::numeric, 'unidad', NULL, 'xlsx-agosto-2026'),
  ('CAÑAS DE CLARINETE 2 Y 3.5', 'cana', 'maderas', 'STEVER', NULL, 3::numeric, 'unidad', 'Dos cañas 3.5 y una caña 2', 'xlsx-agosto-2026'),
  ('CEPILLO PARA BOQUILLAS', 'limpieza', NULL, 'BANDWAGON', 'BRASSWIND', 5::numeric, 'unidad', 'Cepillo para limpiar boquillas de vientos metales', 'xlsx-agosto-2026'),
  ('CEPILLO PARA VALVULAS', 'limpieza', 'metales', 'BANDWAGON', 'SMALL', 5::numeric, 'unidad', 'Cepillo para limpiar valvulas de vientos metales', 'xlsx-agosto-2026'),
  ('CEPILLO SNAKE', 'limpieza', 'metales', 'BANDWAGON', 'TROMBONE', 4::numeric, 'unidad', 'Cepillo limpiador tipo serpiente para trombón', 'xlsx-agosto-2026'),
  ('CEPILLO SNAKE', 'limpieza', 'metales', 'BANDWAGON', 'TROMPETA Y CORNETA', 6::numeric, 'unidad', 'Cepillo limpiador tipo serpiente para trompeta y corneta', 'xlsx-agosto-2026'),
  ('CEPILLO SNAKE', 'limpieza', 'metales', 'SUPERSLICK', 'TROMPETA Y CORNETA', 10::numeric, 'unidad', 'Cepillo limpiador tipo serpiente para trompeta y corneta', 'xlsx-agosto-2026'),
  ('CLAVIJAS DE CELLO', 'accesorio', 'cuerdas', NULL, NULL, 2::numeric, 'juego', 'Clavijas de violoncello', 'xlsx-agosto-2026'),
  ('ACEITE PARA VALVULAS', 'lubricante', 'metales', 'BANDWAGON', 'TROMPETA', 20::numeric, 'unidad', 'Aceite para valvulas', 'xlsx-agosto-2026'),
  ('GRASA PARA CORCHO', 'lubricante', 'maderas', 'BANDWAGON', NULL, 6::numeric, 'unidad', 'Grasa para corchos (Clarinete, oboe, fagot y saxofon)', 'xlsx-agosto-2026'),
  ('ENSAVE DE SPRAY', 'limpieza', NULL, 'SUPERSLICK', NULL, 12::numeric, 'unidad', NULL, 'xlsx-agosto-2026')
) AS v(item, categoria, familia_instrumento, marca, modelo, cantidad, unidad, descripcion, fuente_importacion)
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventario_materiales m
  WHERE m.item = v.item AND m.marca IS NOT DISTINCT FROM v.marca AND m.modelo IS NOT DISTINCT FROM v.modelo
);

COMMIT;
