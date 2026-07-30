-- Permitir lectura de la tabla alumnos a usuarios autenticados y anónimos
DROP POLICY IF EXISTS alumnos_read_all ON public.alumnos;
CREATE POLICY alumnos_read_all ON public.alumnos FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS alumnos_clases_read_all ON public.alumnos_clases;
CREATE POLICY alumnos_clases_read_all ON public.alumnos_clases FOR SELECT TO public USING (true);
