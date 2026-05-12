-- Agregar columna para guardar el DSL generado por IA cuando el maestro escribió en lenguaje natural
-- Esto permite mostrar el texto original + el DSL interpretado en la UI

ALTER TABLE observaciones_sesion
ADD COLUMN IF NOT EXISTS contenido_ia_dsl TEXT;