-- Saneamiento de inventario — Fase 1: SOLO ALTAS
-- Fuente: INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx, hoja AGOSTO 2026
-- Generado por scripts/inventario/gen-migration-fase1.cjs (dry-run, revisar antes de aplicar)
-- NO modifica filas existentes. Solo inserta instrumentos ausentes en inventario_activos.
--
-- Altas seguras: 17  ·  Altas a revisar a mano (comentadas): 2

BEGIN;

INSERT INTO public.inventario_activos (codigo_inventario, tipo_instrumento, familia, tamano, marca, modelo, numero_serie, estado_conservacion, estado_uso, ubicacion, activo, fuente_importacion)
VALUES
  ('ESPCVLN171GC', 'violin', 'cuerdas', '3/4', NULL, NULL, NULL, 'excelente', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('ESPCVLN172GC', 'violin', 'cuerdas', '3/4', NULL, NULL, NULL, 'excelente', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('ESPCVLN174OB', 'violin', 'cuerdas', '3/4', 'SKYLARK BRAND', 'MV033', NULL, 'bueno', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('ESPCVLC178IH', 'violoncello', 'cuerdas', '4/4', 'CECILIO', 'CLO-200', '200054548', 'excelente', 'disponible', 'SALON MARTINEZ', true, 'xlsx-agosto-2026'),
  ('25284', 'violin', 'cuerdas', '4/4', NULL, NULL, NULL, 'excelente', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('25282', 'violin', 'cuerdas', '4/4', 'SCHENK', '807', NULL, 'bueno', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('25280', 'violin', 'cuerdas', '3/4', 'SCHENK', '592', NULL, 'excelente', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('25285', 'violin', 'cuerdas', '4/4', 'SCHENK', '123', NULL, 'mantenimiento', 'en_reparacion', 'TALLER DE LUTHERIA', true, 'xlsx-agosto-2026'),
  ('25276', 'violin', 'cuerdas', '1/2', NULL, NULL, NULL, 'bueno', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('25275', 'violin', 'cuerdas', '1/2', 'SUZUKI', '220', NULL, 'excelente', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('25278', 'violin', 'cuerdas', '1/2', 'STEINER', 'SCHENK 229', NULL, 'mantenimiento', 'en_reparacion', 'TALLER DE LUTHERIA', true, 'xlsx-agosto-2026'),
  ('25281', 'violin', 'cuerdas', '4/4', NULL, NULL, NULL, 'mantenimiento', 'en_reparacion', 'TALLER DE LUTHERIA', true, 'xlsx-agosto-2026'),
  ('25277', 'violin', 'cuerdas', '3/4', NULL, 'SCHENK 84', NULL, 'bueno', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('25287', 'contrabajo', 'cuerdas', '1/8', 'GEWA', 'ALLEGRO 2010', NULL, 'excelente', 'disponible', 'SALON ABREU', true, 'xlsx-agosto-2026'),
  ('25288', 'contrabajo', 'cuerdas', '1/4', NULL, NULL, NULL, 'bueno', 'en_reparacion', 'SALON ABREU', true, 'xlsx-agosto-2026'),
  ('ESPCSAX173GC', 'saxofon_alto', 'maderas', NULL, NULL, NULL, NULL, 'excelente', 'disponible', 'DEPOSITO BACH', true, 'xlsx-agosto-2026'),
  ('21C0234', 'piano_digital', 'pianos', NULL, NULL, 'ROLAND', 'DP905', 'bueno', 'disponible', 'SALON SIN NOMBRE', true, 'xlsx-agosto-2026')
ON CONFLICT (codigo_inventario) DO NOTHING;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────
-- ALTAS A REVISAR A MANO (código dudoso o con asignación) — NO se insertan:
-- 23.07 | clarinete  | NOBLET, PARIS, ARTIST | en_reparacion | asignado="" ubic="LUTHIER ARIZONA" | fila 182
-- ESPCTPA35EX | trompeta  | LAFANYELLE | prestado | asignado="ROANDI NUÑEZ" ubic="" | fila 303
/*
INSERT INTO public.inventario_activos (codigo_inventario, tipo_instrumento, familia, tamano, marca, modelo, numero_serie, estado_conservacion, estado_uso, ubicacion, activo, fuente_importacion) VALUES
  ('23.07', 'clarinete', 'maderas', NULL, 'NOBLET, PARIS, ARTIST', 'B65745', NULL, 'regular', 'en_reparacion', 'LUTHIER ARIZONA', true, 'xlsx-agosto-2026'),
  ('ESPCTPA35EX', 'trompeta', 'metales', NULL, 'LAFANYELLE', 'COUESNON', NULL, 'bueno', 'prestado', NULL, true, 'xlsx-agosto-2026');
*/
