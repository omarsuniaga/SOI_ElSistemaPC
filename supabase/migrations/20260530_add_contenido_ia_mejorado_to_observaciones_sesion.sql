-- Agregar columna para guardar el texto mejorado por IA en prosa limpia,
-- ideal para mostrar en el PDF de asistencias diarias sin necesidad de reconstruir desde DSL.
ALTER TABLE observaciones_sesion
ADD COLUMN IF NOT EXISTS contenido_ia_mejorado TEXT;
