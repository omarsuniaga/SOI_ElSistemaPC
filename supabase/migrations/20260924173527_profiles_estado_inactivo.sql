-- Gestión de Usuarios envía estado = 'inactivo' desde el botón [Desactivar],
-- pero el CHECK solo aceptaba pendiente/activo/rechazado, así que desactivar
-- nunca funcionó. maestroAuth ya cierra sesión ante cualquier estado != activo.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_estado_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_estado_check
  CHECK (estado = ANY (ARRAY['pendiente'::text, 'activo'::text, 'rechazado'::text, 'inactivo'::text]));
