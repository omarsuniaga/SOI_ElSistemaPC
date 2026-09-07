-- Saneamiento de inventario — Fase 2: UPDATE dirigidos
-- Fuente: hoja AGOSTO 2026. Generado por scripts/inventario/gen-migration-fase2.cjs
-- Solo toca filas existentes NO retiradas. Revisar antes de aplicar.
-- A) estado_conservacion 'mantenimiento' -> derivado: 90
-- B) asignación (reasignar/asignar/baja): 32   ·   a revisar a mano: 1

BEGIN;

-- ── A) estado_conservacion ────────────────────────────────────────────
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.095' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.097' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.101' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.102' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = '22.103' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.106' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = '22.107' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.110.' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.117' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.119' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22.121' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22077' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = '22081' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22082' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22085' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22089' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = '22090' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = '22092' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = '22093' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22120' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = '22127' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '22128' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '23.068' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '23055' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '23057' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = '23058' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '23061' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = '24087' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = '24088' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = '24090,' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = '25175' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = '25186' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = '25190' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCCLT138IH' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCCLT139IH' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCCNO132IH' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCCTB12YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCFLT09EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCFLT50MU' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT54MU' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT55EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT56MU' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT59EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT61EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT62EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT63EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT64EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCFLT65EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT66YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT67YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT68YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT69YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT70YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT71YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT72YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT73YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT74YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCFLT75YA' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCGTR88EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCTBN83EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCVLA130IH' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLA22EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLA23EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLC14EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLC15EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLC16EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLC17EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLC18EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN108AR' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN109AR' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN110AR' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCVLN122IH' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCVLN126IH' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLN128IH' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN162GC' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLN25SG' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN26SG' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN28SG' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN30RO' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN31RO' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN32RO' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLN33RO' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN34RO' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLN36RO' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN37RO' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN38EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'excelente', updated_at = now() WHERE codigo_inventario = 'ESPCVLN39EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN40AR' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'bueno', updated_at = now() WHERE codigo_inventario = 'ESPCVLN41EX' AND estado_conservacion = 'mantenimiento';
UPDATE public.inventario_activos SET estado_conservacion = 'regular', updated_at = now() WHERE codigo_inventario = 'ESPCVLN48MA' AND estado_conservacion = 'mantenimiento';

-- ── B) asignación (asignado_a_texto + estado_uso) ─────────────────────
-- baja  (baja de "ALEGNA CUELLO")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = '22.094' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "ZARA DIAZ")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'en_reparacion', updated_at = now() WHERE codigo_inventario = '22.095' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "BRAYNEL PACHECO")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'en_reparacion', updated_at = now() WHERE codigo_inventario = '22.109' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "GENESIS SOSA")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = '22077' AND activo AND estado_uso <> 'de_baja';
-- reasignar  (xlsx="AUDREY DIVICHE" -> alumno "Audrey Diviche" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Audrey Diviche', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = '22078' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "ANGELITA STJUSTE")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = '22087' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "GABRIELA MARTE")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = '23055' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "ESCARLET MARTINEZ")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'en_reparacion', updated_at = now() WHERE codigo_inventario = '23058' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "AMELIE FERNANDEZ")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = '23060' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "MELANY PEGUERO")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = '23063' AND activo AND estado_uso <> 'de_baja';
-- reasignar  (xlsx="ISABELLA BAEZ" -> alumno "Isabella Baez Rosario" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Isabella Baez Rosario', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = '24089' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="ANGELITA STJUSTE" -> alumno "Angelita StJuste" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Angelita StJuste', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = '25183' AND activo AND estado_uso <> 'de_baja';
-- reasignar  (xlsx="ESTEBAN SANO" -> alumno "Esteban Sano Sano Antuan" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Esteban Sano Sano Antuan', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = '25189' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "ESTEBAN SANO")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'en_reparacion', updated_at = now() WHERE codigo_inventario = '25190' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "PAULA OZORIO")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = '25193' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="ANA TAVERAS" -> alumno "Ana Taveraz" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Ana Taveraz', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCCLT111RO' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="ASHLEY LEBRON" -> alumno "Ashley Lebron" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Ashley Lebron', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCCLT113RO' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="GEILY DIVICHE" -> alumno "Geily Yosairy Diviche" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Geily Yosairy Diviche', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCCLT115RO' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="DIAFREISI DUMOND" -> alumno "Diafreisi Dumond" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Diafreisi Dumond', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCCNO132IH' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="ZARA DIAZ" -> alumno "Zara Isabella Díaz Bodre" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Zara Isabella Díaz Bodre', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCFLT169IH' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="JOSE TOMAS LORENZO" -> alumno "Jose Tomas Lorenzo Ogando" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Jose Tomas Lorenzo Ogando', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCTPA85PA' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "BRANYAN PEGUERO")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = 'ESPCVLA21EX' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "SOL MARTE")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = 'ESPCVLC16EX' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "SHANTII HIGGS")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = 'ESPCVLN108AR' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="GABRIELA MARTE" -> alumno "Gabriela Marte" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Gabriela Marte', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCVLN120IH' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="DYAKENSON LAMERIQUE" -> alumno "Dyakenson Lamerique" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Dyakenson Lamerique', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCVLN121IH' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="MONTSERRAT PEÑA" -> alumno "Montserrat Alejandra Peña" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Montserrat Alejandra Peña', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCVLN123IH' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="AMELIE FERNANDEZ" -> alumno "Amelie Fernández" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Amelie Fernández', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCVLN124IH' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="ESCARLET MARTINEZ" -> alumno "Escarlet Martinez" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Escarlet Martinez', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCVLN126IH' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "EVAN RODRIGUEZ")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = 'ESPCVLN33RO' AND activo AND estado_uso <> 'de_baja';
-- asignar  (xlsx="ALEJANDRA PÉREZ" -> alumno "Alejandra Perez" score 1.15)
UPDATE public.inventario_activos SET asignado_a_texto = 'Alejandra Perez', estado_uso = 'prestado', updated_at = now() WHERE codigo_inventario = 'ESPCVLN34RO' AND activo AND estado_uso <> 'de_baja';
-- baja  (baja de "DYAKENSON LAMERIQUE")
UPDATE public.inventario_activos SET asignado_a_texto = NULL, estado_uso = 'disponible', updated_at = now() WHERE codigo_inventario = 'ESPCVLN42MU' AND activo AND estado_uso <> 'de_baja';

COMMIT;

-- ── A REVISAR A MANO — asignaciones sin match confiable en `alumnos` ──
-- ESPCTBN140IH: xlsx="BRAYNEL PACHECO"  mejor match="Argeiris Pacheco" (score 0.5)  db_actual="null"
