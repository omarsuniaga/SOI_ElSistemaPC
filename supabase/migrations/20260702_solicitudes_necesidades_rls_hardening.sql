-- Endurece RLS de solicitudes_necesidades: reemplaza policies permisivas (true)
-- por scope real por maestro dueño + admin. Aplicada y verificada en prod 2026-07-02.

DROP POLICY IF EXISTS "Admin update solicitudes" ON public.solicitudes_necesidades;
DROP POLICY IF EXISTS "Maestros insert solicitudes" ON public.solicitudes_necesidades;
DROP POLICY IF EXISTS "Maestros read solicitudes" ON public.solicitudes_necesidades;

CREATE POLICY "solic_select_own_or_admin" ON public.solicitudes_necesidades
  FOR SELECT TO authenticated
  USING (
    maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "solic_insert_own" ON public.solicitudes_necesidades
  FOR INSERT TO authenticated
  WITH CHECK (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

CREATE POLICY "solic_update_admin" ON public.solicitudes_necesidades
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'));

CREATE POLICY "solic_update_own_cancel" ON public.solicitudes_necesidades
  FOR UPDATE TO authenticated
  USING (estado = 'pendiente' AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()))
  WITH CHECK (estado = 'cancelada' AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));
